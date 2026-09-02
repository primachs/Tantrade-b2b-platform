<?php

namespace App\MatchingContext\Engagement\Infrastructure\Models;

use App\MatchingContext\Business\Infrastructure\Models\Business;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EngagementMessage extends Model
{
    use HasUuids;

    protected $table = 'engagement_messages';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'session_id',
        'sender_business_id',
        'body',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(EngagementSession::class, 'session_id');
    }

    public function senderBusiness(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'sender_business_id');
    }
}