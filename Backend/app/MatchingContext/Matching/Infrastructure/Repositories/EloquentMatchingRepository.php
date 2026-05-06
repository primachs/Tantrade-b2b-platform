<?php

namespace App\MatchingContext\Matching\Infrastructure\Repositories;

use App\MatchingContext\Business\Domain\Factories\BusinessFactory;
use App\MatchingContext\Business\Infrastructure\Models\BusinessCapability as BusinessCapabilityModel;
use App\MatchingContext\Matching\Domain\Entities\CandidateAttribute;
use App\MatchingContext\Matching\Domain\Entities\CandidateProfile;
use App\MatchingContext\Matching\Domain\Entities\MatchCandidate;
use App\MatchingContext\Matching\Domain\Entities\MatchShortlist;
use App\MatchingContext\Matching\Domain\Repositories\MatchingRepository;
use App\MatchingContext\Matching\Infrastructure\Models\MatchCandidate as MatchCandidateModel;
use App\MatchingContext\Matching\Infrastructure\Models\MatchShortlist as MatchShortlistModel;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Location;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Support\Facades\DB;

class EloquentMatchingRepository implements MatchingRepository
{
    public function __construct(private readonly BusinessFactory $businessFactory) {}

    public function findCandidatesByServiceTypes(array $serviceTypeIds): array
    {
        $capabilities = BusinessCapabilityModel::with([
            'business.verification',
            'business.trustMetrics',
            'capabilityAttributes',
        ])->whereIn('service_type_id', $serviceTypeIds)->get();

        $candidates = [];
        foreach ($capabilities as $capability) {
            $verification = $capability->business?->verification;
            $location = Location::fromNullable(
                $verification?->region,
                $verification?->district
            );

            $trustMetrics = $capability->business?->trustMetrics
                ? $this->businessFactory->trustMetricsFromState($capability->business->trustMetrics->toArray())
                : null;

            $attributes = [];
            foreach ($capability->capabilityAttributes as $attribute) {
                $attributes[] = new CandidateAttribute(
                    Uuid::fromString($attribute->attribute_id),
                    $attribute->value
                );
            }

            $candidates[] = new CandidateProfile(
                Uuid::fromString($capability->business_id),
                Uuid::fromString($capability->service_type_id),
                $location,
                $trustMetrics,
                $attributes
            );
        }

        return $candidates;
    }

    public function storeShortlist(MatchShortlist $shortlist): MatchShortlist
    {
        return DB::transaction(function () use ($shortlist) {
            $data = $shortlist->toArray();

            MatchShortlistModel::create([
                'id' => $data['id'],
                'rfs_id' => $data['rfs_id'],
                'created_at' => $data['created_at'],
            ]);

            foreach ($data['candidates'] as $candidate) {
                MatchCandidateModel::create([
                    'shortlist_id' => $data['id'],
                    'seller_id' => $candidate['seller_id'],
                    'score' => $candidate['score'],
                    'rank' => $candidate['rank'],
                ]);
            }

            return $shortlist;
        });
    }

    public function findLatestShortlist(Uuid $rfsId): ?MatchShortlist
    {
        $shortlist = MatchShortlistModel::with('candidates')
            ->where('rfs_id', $rfsId->value())
            ->latest('created_at')
            ->first();

        if (! $shortlist) {
            return null;
        }

        $candidates = $shortlist->candidates->map(function ($candidate) {
            return new MatchCandidate(
                Uuid::fromString($candidate->id),
                Uuid::fromString($candidate->seller_id),
                (float) $candidate->score,
                (int) $candidate->rank
            );
        })->all();

        return new MatchShortlist(
            Uuid::fromString($shortlist->id),
            Uuid::fromString($shortlist->rfs_id),
            new \DateTimeImmutable($shortlist->created_at),
            $candidates
        );
    }
}
