<?php

namespace App\MatchingContext\Business\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class BusinessVerification
{
    public function __construct(
        private readonly ?Uuid $id,
        private readonly Uuid $businessId,
        private readonly ?string $tinNumber,
        private readonly ?string $brelaNumber,
        private readonly string $businessSize,
        private readonly bool $isOwner,
        private readonly string $ownerGender,
        private readonly int $employeeCount,
        private readonly string $revenueRange,
        private readonly ?string $region,
        private readonly ?string $district,
        private readonly ?string $address,
        private readonly string $verificationStatus
    ) {}

    public function businessId(): Uuid
    {
        return $this->businessId;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id?->value(),
            'business_id' => $this->businessId->value(),
            'tin_number' => $this->tinNumber,
            'brela_number' => $this->brelaNumber,
            'business_size' => $this->businessSize,
            'is_owner' => $this->isOwner,
            'owner_gender' => $this->ownerGender,
            'employee_count' => $this->employeeCount,
            'revenue_range' => $this->revenueRange,
            'region' => $this->region,
            'district' => $this->district,
            'address' => $this->address,
            'verification_status' => $this->verificationStatus,
        ];
    }
}
