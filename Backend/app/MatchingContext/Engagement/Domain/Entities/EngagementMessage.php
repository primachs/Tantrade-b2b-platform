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
        private readonly ?string $senderBusinessName = null,
        private readonly ?string $attachmentPath = null,
        private readonly ?string $attachmentOriginalName = null,
        private readonly ?string $attachmentMime = null,
        private readonly ?int $attachmentSize = null
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

    public function attachmentPath(): ?string
    {
        return $this->attachmentPath;
    }

    public function attachmentOriginalName(): ?string
    {
        return $this->attachmentOriginalName;
    }

    public function attachmentMime(): ?string
    {
        return $this->attachmentMime;
    }

    public function attachmentSize(): ?int
    {
        return $this->attachmentSize;
    }

    public function body(): string
    {
        return $this->body;
    }

    public function createdAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function hasAttachment(): bool
    {
        return $this->attachmentPath !== null;
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
            'attachment' => $this->attachmentPath !== null ? [
                'original_name' => $this->attachmentOriginalName,
                'mime' => $this->attachmentMime,
                'size' => $this->attachmentSize,
            ] : null,
        ];
    }
}