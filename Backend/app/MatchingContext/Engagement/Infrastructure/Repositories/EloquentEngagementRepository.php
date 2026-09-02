<?php

namespace App\MatchingContext\Engagement\Infrastructure\Repositories;

use App\MatchingContext\Engagement\Domain\Entities\EngagementSession;
use App\MatchingContext\Engagement\Domain\Entities\SessionReport;
use App\MatchingContext\Engagement\Domain\Factories\EngagementFactory;
use App\MatchingContext\Engagement\Domain\Repositories\EngagementRepository;
use App\MatchingContext\Engagement\Infrastructure\Models\EngagementSession as EngagementSessionModel;
use App\MatchingContext\Engagement\Infrastructure\Models\SessionReport as SessionReportModel;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Support\Carbon;

class EloquentEngagementRepository implements EngagementRepository
{
    public function __construct(private readonly EngagementFactory $factory) {}

    public function create(EngagementSession $session): EngagementSession
    {
        $data = $session->toArray();

        EngagementSessionModel::create([
            'id' => $data['id'],
            'rfs_id' => $data['rfs_id'],
            'buyer_id' => $data['buyer_id'],
            'seller_id' => $data['seller_id'],
            'status' => $data['status'],
            'created_at' => $data['created_at'],
        ]);

        return $session;
    }

    public function update(EngagementSession $session): EngagementSession
    {
        $data = $session->toArray();

        EngagementSessionModel::where('id', $data['id'])->update([
            'status' => $data['status'],
            'outcome' => $data['outcome'],
            'confidence_score' => $data['confidence_score'],
            'closed_at' => $data['closed_at'],
        ]);

        return $session;
    }

    public function findById(Uuid $sessionId): ?EngagementSession
    {
        $model = EngagementSessionModel::with(['reports', 'buyer', 'seller', 'rfs'])->find($sessionId->value());
        if (! $model) {
            return null;
        }

        return $this->factory->fromState($this->mapSessionModel($model));
    }

    public function findByRfsBuyerSeller(Uuid $rfsId, Uuid $buyerId, Uuid $sellerId): ?EngagementSession
    {
        $model = EngagementSessionModel::with(['reports', 'buyer', 'seller', 'rfs'])
            ->where('rfs_id', $rfsId->value())
            ->where('buyer_id', $buyerId->value())
            ->where('seller_id', $sellerId->value())
            ->first();

        if (! $model) {
            return null;
        }

        return $this->factory->fromState($this->mapSessionModel($model));
    }

    public function upsertReport(SessionReport $report): SessionReport
    {
        $data = $report->toArray();

        SessionReportModel::updateOrCreate(
            ['session_id' => $data['session_id'], 'reported_by' => $data['reported_by']],
            [
                'outcome' => $data['outcome'],
                'reason' => $data['reason'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_at' => $data['created_at'],
            ]
        );

        return $report;
    }

    public function listReports(Uuid $sessionId): array
    {
        return SessionReportModel::where('session_id', $sessionId->value())->get()->map(function ($report) {
            return $this->factory->reportFromState($report->toArray());
        })->all();
    }

    public function findReport(Uuid $sessionId, string $reportedBy): ?SessionReport
    {
        $report = SessionReportModel::where('session_id', $sessionId->value())
            ->where('reported_by', $reportedBy)
            ->first();

        if (! $report) {
            return null;
        }

        return $this->factory->reportFromState($report->toArray());
    }

    public function countSessionsBySeller(Uuid $sellerId): int
    {
        return EngagementSessionModel::where('seller_id', $sellerId->value())->count();
    }

    public function countSessionsBySellerAndOutcome(Uuid $sellerId, string $outcome): int
    {
        return EngagementSessionModel::where('seller_id', $sellerId->value())
            ->where('outcome', $outcome)
            ->count();
    }

    public function countClosedSessionsBySeller(Uuid $sellerId): int
    {
        return EngagementSessionModel::where('seller_id', $sellerId->value())
            ->where('status', 'CLOSED')
            ->count();
    }

    public function listSessionsBySeller(Uuid $sellerId): array
    {
        return EngagementSessionModel::with(['reports', 'buyer', 'seller', 'rfs'])
            ->where('seller_id', $sellerId->value())
            ->get()
            ->map(function ($session) {
                return $this->factory->fromState($this->mapSessionModel($session));
            })
            ->all();
    }

    public function listSessionsByBuyer(Uuid $buyerId): array
    {
        return EngagementSessionModel::with(['reports', 'buyer', 'seller', 'rfs'])
            ->where('buyer_id', $buyerId->value())
            ->get()
            ->map(function ($session) {
                return $this->factory->fromState($this->mapSessionModel($session));
            })
            ->all();
    }

    private function mapSessionModel(EngagementSessionModel $model): array
    {
        return [
            'id' => $model->id,
            'rfs_id' => $model->rfs_id,
            'rfs_short_id' => $model->rfs?->short_id,
            'buyer_id' => $model->buyer_id,
            'buyer_name' => $model->buyer?->name,
            'seller_id' => $model->seller_id,
            'seller_name' => $model->seller?->name,
            'status' => $model->status,
            'outcome' => $model->outcome,
            'confidence_score' => $model->confidence_score,
            'created_at' => $model->created_at?->toAtomString() ?? Carbon::now()->toAtomString(),
            'closed_at' => $model->closed_at?->toAtomString(),
            'reports' => $model->relationLoaded('reports')
                ? $model->reports->map(fn ($report) => $report->toArray())->all()
                : [],
        ];
    }
}