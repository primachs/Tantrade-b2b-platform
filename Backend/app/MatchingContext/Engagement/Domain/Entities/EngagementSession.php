<?php

namespace App\MatchingContext\Engagement\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class EngagementSession
{
    /** @var SessionReport[] */
    private array $reports;

    public function __construct(
        private readonly Uuid $id,
        private readonly Uuid $rfsId,
        private readonly Uuid $buyerId,
        private readonly Uuid $sellerId,
        private readonly string $status,
        private readonly ?string $outcome,
        private readonly ?float $confidenceScore,
        private readonly ?\DateTimeImmutable $createdAt,
        private readonly ?\DateTimeImmutable $closedAt,
        array $reports
    ) {
        $this->reports = $reports;
    }

    public function id(): Uuid
    {
        return $this->id;
    }

    public function createdAt(): \DateTimeImmutable
    {
        return $this->createdAt ?? new \DateTimeImmutable;
    }

    public function status(): string
    {
        return $this->status;
    }

    public function withStatus(string $status): self
    {
        return new self(
            $this->id,
            $this->rfsId,
            $this->buyerId,
            $this->sellerId,
            $status,
            $this->outcome,
            $this->confidenceScore,
            $this->createdAt,
            $this->closedAt,
            $this->reports
        );
    }

    public function close(string $outcome, float $confidence, \DateTimeImmutable $closedAt): self
    {
        return new self(
            $this->id,
            $this->rfsId,
            $this->buyerId,
            $this->sellerId,
            'CLOSED',
            $outcome,
            $confidence,
            $this->createdAt,
            $closedAt,
            $this->reports
        );
    }

    /** @return SessionReport[] */
    public function reports(): array
    {
        return $this->reports;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'rfs_id' => $this->rfsId->value(),
            'buyer_id' => $this->buyerId->value(),
            'seller_id' => $this->sellerId->value(),
            'status' => $this->status,
            'outcome' => $this->outcome,
            'confidence_score' => $this->confidenceScore,
            'created_at' => $this->createdAt?->format('c'),
            'closed_at' => $this->closedAt?->format('c'),
            'reports' => array_map(static fn (SessionReport $report) => $report->toArray(), $this->reports),
        ];
    }
}
