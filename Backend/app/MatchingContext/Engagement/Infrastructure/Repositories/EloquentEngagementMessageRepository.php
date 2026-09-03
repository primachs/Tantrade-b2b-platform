<?php

namespace App\MatchingContext\Engagement\Infrastructure\Repositories;

use App\MatchingContext\Engagement\Domain\Entities\EngagementMessage;
use App\MatchingContext\Engagement\Domain\Factories\EngagementFactory;
use App\MatchingContext\Engagement\Domain\Repositories\EngagementMessageRepository;
use App\MatchingContext\Engagement\Infrastructure\Models\EngagementMessage as EngagementMessageModel;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

class EloquentEngagementMessageRepository implements EngagementMessageRepository
{
    public function __construct(private readonly EngagementFactory $factory) {}

    public function create(EngagementMessage $message): EngagementMessage
    {
        EngagementMessageModel::create([
            'id' => $message->id()->value(),
            'session_id' => $message->sessionId()->value(),
            'sender_business_id' => $message->senderBusinessId()->value(),
            'body' => $message->body(),
            'created_at' => $message->createdAt()->format('c'),
            'attachment_path' => $message->attachmentPath(),
            'attachment_original_name' => $message->attachmentOriginalName(),
            'attachment_mime' => $message->attachmentMime(),
            'attachment_size' => $message->attachmentSize(),
        ]);

        return $message;
    }

    public function listBySession(Uuid $sessionId): array
    {
        $models = EngagementMessageModel::with('senderBusiness')
            ->where('session_id', $sessionId->value())
            ->orderBy('created_at')
            ->get();

        return $models->map(function (EngagementMessageModel $model) {
            return $this->factory->messageFromState([
                'id' => $model->id,
                'session_id' => $model->session_id,
                'sender_business_id' => $model->sender_business_id,
                'sender_business_name' => $model->senderBusiness?->name,
                'body' => $model->body,
                'created_at' => $model->created_at->toAtomString(),
                'attachment_path' => $model->attachment_path,
                'attachment_original_name' => $model->attachment_original_name,
                'attachment_mime' => $model->attachment_mime,
                'attachment_size' => $model->attachment_size,
            ]);
        })->all();
    }
}