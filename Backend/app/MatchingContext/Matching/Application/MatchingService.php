<?php

namespace App\MatchingContext\Matching\Application;

use App\MatchingContext\Matching\Domain\Factories\MatchingFactory;
use App\MatchingContext\Matching\Domain\Repositories\MatchingRepository;
use App\MatchingContext\Matching\Domain\Services\MatchingEngine;
use App\MatchingContext\Rfs\Domain\Entities\Rfs;
use App\MatchingContext\Rfs\Domain\Repositories\RfsRepository;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\SharedKernel\Infrastructure\DomainEvents\DomainEventRecorder;
use App\MatchingContext\Taxonomy\Domain\Repositories\TaxonomyRepository;

class MatchingService
{
    public function __construct(
        private readonly MatchingEngine $engine,
        private readonly MatchingFactory $factory,
        private readonly MatchingRepository $matchingRepository,
        private readonly RfsRepository $rfsRepository,
        private readonly TaxonomyRepository $taxonomyRepository,
        private readonly DomainEventRecorder $events
    ) {}

    public function generateShortlist(string $rfsId): array
    {
        $rfs = $this->getRfs($rfsId);
        if ($rfs->status() !== 'OPEN') {
            throw new \RuntimeException('Only OPEN RFS can be matched.');
        }

        $serviceType = $this->taxonomyRepository->findServiceTypeById($rfs->serviceTypeId());
        if (! $serviceType) {
            throw new \RuntimeException('Service type not found for RFS.');
        }

        $category = $this->taxonomyRepository->findCategoryById($serviceType->categoryId());
        if (! $category) {
            throw new \RuntimeException('Service category not found for RFS.');
        }

        $topLevelId = $category->parentId() ?? $category->id();
        $subcategories = $this->taxonomyRepository->listCategoriesByParent($topLevelId);
        $subcategoryIds = array_map(static fn ($subcategory) => $subcategory->id()->value(), $subcategories);
        $subcategoryIds[] = $category->id()->value();
        $subcategoryIds = array_values(array_unique($subcategoryIds));

        $allowedServiceTypes = $this->taxonomyRepository->listServiceTypesByCategoryIds($subcategoryIds);
        $allowedServiceTypeIds = array_map(static fn ($type) => $type->id()->value(), $allowedServiceTypes);
        $allowedServiceTypeIds[] = $serviceType->id()->value();
        $allowedServiceTypeIds = array_values(array_unique($allowedServiceTypeIds));

        $taxonomyScores = $this->buildTaxonomyScoreMap(
            $serviceType->id()->value(),
            $category->id()->value(),
            $allowedServiceTypeIds
        );

        $candidates = $this->matchingRepository->findCandidatesByServiceTypes($allowedServiceTypeIds);

        $scored = [];
        foreach ($candidates as $candidate) {
            $taxonomyScore = $taxonomyScores[$candidate->serviceTypeId()->value()] ?? 0.0;
            $attributeMatchRatio = $this->attributeMatchRatio($rfs, $candidate);
            $result = $this->engine->scoreCandidate($rfs, $candidate, [
                'taxonomy_score' => $taxonomyScore,
                'attribute_match_ratio' => $attributeMatchRatio,
            ]);

            $sellerId = $candidate->sellerId()->value();
            $existing = $scored[$sellerId] ?? null;
            if (! $existing || $result['score'] > $existing['score']) {
                $scored[$sellerId] = $result + ['seller_id' => $sellerId];
            }
        }

        usort($scored, static fn (array $a, array $b) => $b['score'] <=> $a['score']);
        $shortlistCandidates = array_slice($scored, 0, 7);

        $shortlist = $this->factory->createShortlist($rfs->id(), $shortlistCandidates);
        $this->matchingRepository->storeShortlist($shortlist);

        $this->rfsRepository->updateStatus($rfs->id(), 'MATCHED');

        $this->events->record('MatchGenerated', $rfs->id()->value(), [
            'shortlist_id' => $shortlist->id()->value(),
            'candidate_count' => count($shortlistCandidates),
        ]);

        return $shortlist->toArray();
    }

    public function latestShortlist(string $rfsId): ?array
    {
        $shortlist = $this->matchingRepository->findLatestShortlist(Uuid::fromString($rfsId));

        return $shortlist?->toArray();
    }

    private function getRfs(string $rfsId): Rfs
    {
        $rfs = $this->rfsRepository->findById(Uuid::fromString($rfsId));
        if (! $rfs) {
            throw new \RuntimeException('RFS not found.');
        }

        return $rfs;
    }

    private function buildTaxonomyScoreMap(string $serviceTypeId, string $categoryId, array $allowedServiceTypes): array
    {
        $scores = array_fill_keys($allowedServiceTypes, 0.4);

        $sameSubcategoryTypes = $this->taxonomyRepository->listServiceTypesByCategoryIds([$categoryId]);
        foreach ($sameSubcategoryTypes as $type) {
            $scores[$type->id()->value()] = 0.7;
        }

        $scores[$serviceTypeId] = 1.0;

        return $scores;
    }

    private function attributeMatchRatio(Rfs $rfs, $candidate): float
    {
        // RFS attributes have been refactored into constraints and preferences.
        // For now, return a baseline ratio. Future iterations can match specific constraints.
        return 1.0;
    }
}
