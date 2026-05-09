<?php

namespace App\MarketGovernanceContext\Governance\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeTerm extends Model
{
    use HasUuids;

    protected $table = 'office_terms';

    protected $fillable = [
        'id',
        'office_id',
        'person_id',
        'start_date',
        'end_date',
        'status',
    ];

    public function office(): BelongsTo
    {
        return $this->belongsTo(MarketOffice::class, 'office_id');
    }
}
