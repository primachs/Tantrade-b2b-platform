<?php

namespace App\MatchingContext\Engagement\Application;

use App\MatchingContext\Engagement\Domain\Factories\EngagementFactory;
use App\MatchingContext\Engagement\Domain\Repositories\EngagementRepository;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\SharedKernel\Infrastructure\DomainEvents\DomainEventRecorder;
use App\MatchingContext\Signal\Application\SignalService;
use App\MatchingContext\Signal\Domain\Services\OutcomeResolver;

class EngagementService
{
    public function __construct(
        private readonly EngagementRepository $repository,
        private readonly EngagementFactory $factory,
        private readonly OutcomeResolver $resolver,
        private readonly SignalService $signals,
        private readonly DomainEventRecorder $events
    ) {}

    public function createSession(array $payload): array
    {
        $existing = $this->repository->findByRfsBuyerSeller(
            Uuid::fromString($payload['rfs_id']),
            Uuid::fromString($payload['buyer_id']),
            Uuid::fromString($payload['seller_id'])
        );
        if ($existing) {
            return $existing->toArray();
        }

        $session = $this->factory->createSession($payload);
        $this->repository->create($session);

        $this->events->record('SessionStarted', $session->id()->value(), [
            'rfs_id' => $payload['rfs_id'],
            'seller_id' => $payload['seller_id'],
        ]);

        return $session->toArray();
    }

    public function listBySeller(string $sellerId): array
    {
        $sessions = $this->repository->listSessionsBySeller(Uuid::fromString($sellerId));

        return array_map(static fn ($session) => $session->toArray(), $sessions);
    }

    public function listByBuyer(string $buyerId): array
    {
        $sessions = $this->repository->listSessionsByBuyer(Uuid::fromString($buyerId));

        return array_map(static fn ($session) => $session->toArray(), $sessions);
    }

    public function show(string $sessionId): array
    {
        return $this->requireSession($sessionId)->toArray();
    }

    public function accept(string $sessionId): array
    {
        $session = $this->requireSession($sessionId);
        if ($session->status() !== 'INITIATED') {
            throw new \RuntimeException('Only INITIATED sessions can be accepted.');
        }

        $updated = $session->withStatus('ACCEPTED');
        $this->repository->update($updated);

        return $updated->toArray();
    }

    public function reject(string $sessionId): array
    {
        $session = $this->requireSession($sessionId);
        if ($session->status() !== 'INITIATED') {
            throw new \RuntimeException('Only INITIATED sessions can be rejected.');
        }

        $updated = $session->withStatus('REJECTED');
        $this->repository->update($updated);

        return $updated->toArray();
    }

    public function activate(string $sessionId): array
    {
        $session = $this->requireSession($sessionId);
        if (! in_array($session->status(), ['ACCEPTED', 'STALLED'], true)) {
            throw new \RuntimeException('Only ACCEPTED or STALLED sessions can be activated.');
        }

        $updated = $session->withStatus('ACTIVE');
        $this->repository->update($updated);

        return $updated->toArray();
    }

    public function stall(string $sessionId): array
    {
        $session = $this->requireSession($sessionId);
        if ($session->status() !== 'ACTIVE') {
            throw new \RuntimeException('Only ACTIVE sessions can be stalled.');
        }

        $updated = $session->withStatus('STALLED');
        $this->repository->update($updated);

        return $updated->toArray();
    }

    public function reportOutcome(string $sessionId, array $payload): array
    {
        $session = $this->requireSession($sessionId);
        if ($session->status() === 'CLOSED') {
            throw new \RuntimeException('Closed sessions cannot receive reports.');
        }

        $report = $this->factory->reportFromPayload(Uuid::fromString($sessionId), $payload);
        $this->repository->upsertReport($report);

        return $report->toArray();
    }

    public function close(string $sessionId): array
    {
        $session = $this->requireSession($sessionId);
        if ($session->status() === 'CLOSED') {
            throw new \RuntimeException('Session is already closed.');
        }

        $buyerReport = $this->repository->findReport(Uuid::fromString($sessionId), 'BUYER');
        $sellerReport = $this->repository->findReport(Uuid::fromString($sessionId), 'SELLER');

        if (! $buyerReport && ! $sellerReport) {
            throw new \RuntimeException('At least one outcome report is required before closing.');
        }

        $resolution = $this->resolver->resolve(
            $buyerReport?->outcome(),
            $sellerReport?->outcome()
        );

        if ($resolution['outcome'] === 'DEAL_CONFIRMED' && $resolution['confidence'] < 1.0) {
            $resolution = [
                'outcome' => 'DISPUTED',
                'confidence' => 0.3,
            ];
        }

        $closed = $session->close($resolution['outcome'], (float) $resolution['confidence'], new \DateTimeImmutable);
        $this->repository->update($closed);

        $this->signals->recordSignal(
            $sessionId,
            $closed->toArray()['seller_id'],
            $resolution['outcome'],
            (float) $resolution['confidence']
        );

        $this->events->record('SessionClosed', $sessionId, [
            'outcome' => $resolution['outcome'],
            'confidence' => $resolution['confidence'],
        ]);

        return $closed->toArray();
    }

    private function requireSession(string $sessionId)
    {
        $session = $this->repository->findById(Uuid::fromString($sessionId));
        if (! $session) {
            throw new \RuntimeException('Engagement session not found.');
        }

        return $session;
    }
}