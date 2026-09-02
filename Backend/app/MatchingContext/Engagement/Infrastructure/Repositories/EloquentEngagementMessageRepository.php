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
        $data = $message->toArray();

        EngagementMessageModel::create([
            'id' => $data['id'],
            'session_id' => $data['session_id'],
            'sender_business_id' => $data['sender_business_id'],
            'body' => $data['body'],
            'created_at' => $data['created_at'],
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
            ]);
        })->all();
    }
}