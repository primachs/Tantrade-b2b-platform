<?php

namespace App\MatchingContext\Taxonomy\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceCategory extends Model
{
    use HasUuids;

    protected $table = 'service_categories';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'parent_id',
        'level',
        'is_active',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(ServiceCategory::class, 'parent_id');
    }

    public function serviceTypes(): HasMany
    {
        return $this->hasMany(ServiceType::class, 'category_id');
    }
}
