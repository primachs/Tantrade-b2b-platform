<?php

namespace App\MatchingContext\Engagement\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class EngagementMessage
{
    public function __construct(
        private readonly Uuid $id,
        private readonly Uuid $sessionId,
        private readonly Uuid $senderBusinessId,
        private readonly string $body,
        private readonly \DateTimeImmutable $createdAt,
        private readonly ?string $senderBusinessName = null
    ) {}

    public function id(): Uuid
    {
        return $this->id;
    }

    public function sessionId(): Uuid
    {
        return $this->sessionId;
    }

    public function senderBusinessId(): Uuid
    {
        return $this->senderBusinessId;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'session_id' => $this->sessionId->value(),
            'sender_business_id' => $this->senderBusinessId->value(),
            'sender_business_name' => $this->senderBusinessName,
            'body' => $this->body,
            'created_at' => $this->createdAt->format('c'),
        ];
    }
}