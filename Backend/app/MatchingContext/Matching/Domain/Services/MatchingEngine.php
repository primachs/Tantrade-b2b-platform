<?php

namespace App\MatchingContext\Matching\Domain\Services;

use App\MatchingContext\Matching\Domain\Entities\CandidateProfile;
use App\MatchingContext\Rfs\Domain\Entities\Rfs;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\PreferenceWeights;

class MatchingEngine
{
    private const WEIGHTS = [
        'capability' => 0.30,
        'constraint_fit' => 0.25,
        'preference' => 0.20,
        'reliability' => 0.15,
        'engagement' => 0.10,
    ];

    public function scoreCandidate(Rfs $rfs, CandidateProfile $candidate, array $context): array
    {
        $attributeMatchRatio = $context['attribute_match_ratio'] ?? 1.0;
        $taxonomyScore = $context['taxonomy_score'] ?? 0.0;

        $capabilityScore = $this->calculateCapabilityScore($taxonomyScore, $attributeMatchRatio);
        $constraintFit = $this->calculateConstraintFit($rfs, $candidate);
        $preferenceScore = $this->calculatePreferenceScore($rfs, $candidate, $constraintFit);
        $reliabilityScore = $this->clamp((float) ($candidate->trustMetrics()?->toArray()['reliability_score'] ?? 0.5));
        $engagementScore = $this->clamp((float) ($candidate->trustMetrics()?->toArray()['response_rate'] ?? 0.0));

        $score = (
            self::WEIGHTS['capability'] * $capabilityScore +
            self::WEIGHTS['constraint_fit'] * $constraintFit['score'] +
            self::WEIGHTS['preference'] * $preferenceScore +
            self::WEIGHTS['reliability'] * $reliabilityScore +
            self::WEIGHTS['engagement'] * $engagementScore
        );

        return [
            'score' => $this->clamp($score),
            'breakdown' => [
                'capability' => $capabilityScore,
                'constraint_fit' => $constraintFit['score'],
                'preference' => $preferenceScore,
                'reliability' => $reliabilityScore,
                'engagement' => $engagementScore,
                'location_fit' => $constraintFit['location'],
                'taxonomy' => $taxonomyScore,
                'attribute_match_ratio' => $attributeMatchRatio,
            ],
        ];
    }

    private function calculateCapabilityScore(float $taxonomyScore, float $attributeMatchRatio): float
    {
        $attributeFactor = 0.7 + (0.3 * $attributeMatchRatio);

        return $this->clamp($taxonomyScore * $attributeFactor);
    }

    private function calculateConstraintFit(Rfs $rfs, CandidateProfile $candidate): array
    {
        $constraint = $rfs->constraint();
        $locationFit = 1.0;

        if ($constraint) {
            $region = $constraint->location()->region();
            $district = $constraint->location()->district();

            if ($region || $district) {
                $locationFit = 0.0;
                if ($region && $candidate->location()->region() === $region) {
                    $locationFit = 0.5;
                    if ($district && $candidate->location()->district() === $district) {
                        $locationFit = 1.0;
                    }
                }
            }
        }

        $scores = [$locationFit];

        if ($constraint && ($constraint->budget()->min() !== null || $constraint->budget()->max() !== null)) {
            $scores[] = 1.0;
        }

        if ($constraint && ($constraint->timeline()->start() !== null || $constraint->timeline()->end() !== null)) {
            $scores[] = 1.0;
        }

        $score = count($scores) > 0 ? array_sum($scores) / count($scores) : 1.0;

        return [
            'score' => $this->clamp($score),
            'location' => $this->clamp($locationFit),
        ];
    }

    private function calculatePreferenceScore(Rfs $rfs, CandidateProfile $candidate, array $constraintFit): float
    {
        $weights = $rfs->preference()?->weights() ?? new PreferenceWeights(0, 0, 0, 0, 0);
        $normalized = $weights->normalized();

        $trust = $candidate->trustMetrics()?->toArray() ?? [
            'reliability_score' => 0.5,
            'response_rate' => 0.0,
            'success_rate' => 0.0,
        ];

        $scores = [
            'cost' => 0.5,
            'quality' => $this->clamp((float) $trust['reliability_score']),
            'speed' => $this->clamp((float) $trust['response_rate']),
            'experience' => $this->clamp((float) $trust['success_rate']),
            'location' => $this->clamp($constraintFit['location'] ?? 1.0),
        ];

        $weighted = 0.0;
        foreach ($normalized as $key => $weight) {
            $weighted += $weight * ($scores[$key] ?? 0.0);
        }

        return $this->clamp($weighted);
    }

    private function clamp(float $value): float
    {
        if ($value < 0.0) {
            return 0.0;
        }

        if ($value > 1.0) {
            return 1.0;
        }

        return $value;
    }
}
