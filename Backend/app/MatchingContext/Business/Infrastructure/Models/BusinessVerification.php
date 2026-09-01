<?php

namespace App\MatchingContext\Business\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessVerification extends Model
{
    use HasUuids;

    protected $table = 'business_verification';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'business_id',
        'tin_number',
        'brela_number',
        'business_size',
        'is_owner',
        'owner_gender',
        'employee_count',
        'revenue_range',
        'region',
        'district',
        'address',
        'verification_status',
        'industry_type',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }
}