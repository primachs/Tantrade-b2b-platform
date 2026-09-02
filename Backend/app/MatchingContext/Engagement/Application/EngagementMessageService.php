<?php

namespace App\MatchingContext\Engagement\Application;

use App\MatchingContext\Engagement\Domain\Factories\EngagementFactory;
use App\MatchingContext\Engagement\Domain\Repositories\EngagementMessageRepository;
use App\MatchingContext\Engagement\Domain\Repositories\EngagementRepository;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

class EngagementMessageService
{
    public function __construct(
        private readonly EngagementMessageRepository $repository,
        private readonly EngagementRepository $sessionRepository,
        private readonly EngagementFactory $factory
    ) {}

    public function send(string $sessionId, array $payload): array
    {
        $session = $this->sessionRepository->findById(Uuid::fromString($sessionId));
        if (! $session) {
            throw new \RuntimeException('Engagement session not found.');
        }

        $senderId = $payload['sender_business_id'];
        $isParticipant = $senderId === $session->toArray()['buyer_id'] || $senderId === $session->toArray()['seller_id'];
        if (! $isParticipant) {
            throw new \RuntimeException('Only the buyer or seller on this engagement can send messages.');
        }

        if ($session->status() === 'REJECTED') {
            throw new \RuntimeException('This engagement was rejected; messaging is closed.');
        }

        $message = $this->factory->messageFromPayload(Uuid::fromString($sessionId), $payload);
        $this->repository->create($message);

        return $message->toArray();
    }

    public function list(string $sessionId, string $requestingBusinessId): array
    {
        $session = $this->sessionRepository->findById(Uuid::fromString($sessionId));
        if (! $session) {
            throw new \RuntimeException('Engagement session not found.');
        }

        $sessionData = $session->toArray();
        $isParticipant = $requestingBusinessId === $sessionData['buyer_id'] || $requestingBusinessId === $sessionData['seller_id'];
        if (! $isParticipant) {
            throw new \RuntimeException('Only the buyer or seller on this engagement can view messages.');
        }

        $messages = $this->repository->listBySession(Uuid::fromString($sessionId));

        return array_map(static fn ($message) => $message->toArray(), $messages);
    }
}