<?php

namespace App\MatchingContext\Taxonomy\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceType extends Model
{
    use HasUuids;

    protected $table = 'service_types';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'category_id',
        'is_active',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    public function attributes(): HasMany
    {
        return $this->hasMany(ServiceAttribute::class, 'service_type_id');
    }
}
