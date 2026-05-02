<?php

namespace App\MatchingContext\Business\Domain\Repositories;

use App\MatchingContext\Business\Domain\Entities\Business;
use App\MatchingContext\Business\Domain\Entities\BusinessTrustMetrics;
use App\MatchingContext\Business\Domain\Entities\BusinessVerification;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

interface BusinessRepository
{
    public function create(Business $business): Business;

    public function update(Business $business): Business;

    public function findById(Uuid $businessId): ?Business;

    public function upsertVerification(BusinessVerification $verification): BusinessVerification;

    /** @param array<int, \App\MatchingContext\Business\Domain\Entities\BusinessCapability> $capabilities */
    public function syncCapabilities(Uuid $businessId, array $capabilities): void;

    public function touchActivity(Uuid $businessId): void;

    public function getTrustMetrics(Uuid $businessId): ?BusinessTrustMetrics;

    public function updateTrustMetrics(BusinessTrustMetrics $metrics): BusinessTrustMetrics;
}
