<?php

namespace App\MatchingContext\Business\Domain\Factories;

use App\MatchingContext\Business\Domain\Entities\Business;
use App\MatchingContext\Business\Domain\Entities\BusinessCapability;
use App\MatchingContext\Business\Domain\Entities\BusinessCapabilityAttribute;
use App\MatchingContext\Business\Domain\Entities\BusinessTrustMetrics;
use App\MatchingContext\Business\Domain\Entities\BusinessVerification;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

class BusinessFactory
{
    public function create(array $payload): Business
    {
        $businessId = Uuid::random();

        return new Business(
            $businessId,
            $payload['name'],
            $payload['contact_person'],
            $payload['phone'],
            EmailAddress::fromString($payload['email']),
            $this->verificationFromPayload($businessId, $payload),
            $this->capabilitiesFromPayload($businessId, $payload['capabilities'] ?? []),
            $this->defaultTrustMetrics($businessId),
            null,
            null,
            isset($payload['user_id']) ? Uuid::fromString($payload['user_id']) : null
        );
    }

    public function fromState(array $state): Business
    {
        $businessId = Uuid::fromString($state['id']);
        $verification = isset($state['verification'])
            ? $this->verificationFromState($state['verification'])
            : null;
        $capabilities = [];
        foreach ($state['capabilities'] ?? [] as $capability) {
            $capabilities[] = $this->capabilityFromState($capability);
        }
        $trustMetrics = isset($state['trust_metrics'])
            ? $this->trustMetricsFromState($state['trust_metrics'])
            : null;

        return new Business(
            $businessId,
            $state['name'],
            $state['contact_person'],
            $state['phone'],
            EmailAddress::fromString($state['email']),
            $verification,
            $capabilities,
            $trustMetrics,
            isset($state['created_at']) ? new \DateTimeImmutable($state['created_at']) : null,
            isset($state['updated_at']) ? new \DateTimeImmutable($state['updated_at']) : null,
            isset($state['user_id']) ? Uuid::fromString($state['user_id']) : null
        );
    }

    public function verificationFromPayload(Uuid $businessId, array $payload): BusinessVerification
    {
        return new BusinessVerification(
            null,
            $businessId,
            $payload['tin_number'] ?? null,
            $payload['brela_number'] ?? null,
            $payload['business_size'],
            (bool) $payload['is_owner'],
            $payload['owner_gender'],
            (int) $payload['employee_count'],
            $payload['revenue_range'],
            $payload['region'] ?? null,
            $payload['district'] ?? null,
            $payload['address'] ?? null,
            $payload['verification_status'] ?? 'UNVERIFIED'
        );
    }

    public function verificationFromState(array $state): BusinessVerification
    {
        return new BusinessVerification(
            isset($state['id']) ? Uuid::fromString($state['id']) : null,
            Uuid::fromString($state['business_id']),
            $state['tin_number'] ?? null,
            $state['brela_number'] ?? null,
            $state['business_size'],
            (bool) $state['is_owner'],
            $state['owner_gender'],
            (int) $state['employee_count'],
            $state['revenue_range'],
            $state['region'] ?? null,
            $state['district'] ?? null,
            $state['address'] ?? null,
            $state['verification_status']
        );
    }

    /** @return BusinessCapability[] */
    public function capabilitiesFromPayload(Uuid $businessId, array $payload): array
    {
        $capabilities = [];
        foreach ($payload as $capability) {
            $capabilityId = Uuid::random();
            $attributes = [];
            foreach ($capability['attributes'] ?? [] as $attribute) {
                $attributes[] = new BusinessCapabilityAttribute(
                    null,
                    $capabilityId,
                    Uuid::fromString($attribute['attribute_id']),
                    $attribute['value']
                );
            }

            $capabilities[] = new BusinessCapability(
                $capabilityId,
                $businessId,
                Uuid::fromString($capability['service_type_id']),
                $attributes
            );
        }

        return $capabilities;
    }

    public function capabilityFromState(array $state): BusinessCapability
    {
        $attributes = [];
        foreach ($state['attributes'] ?? [] as $attribute) {
            $attributes[] = new BusinessCapabilityAttribute(
                isset($attribute['id']) ? Uuid::fromString($attribute['id']) : null,
                Uuid::fromString($attribute['capability_id']),
                Uuid::fromString($attribute['attribute_id']),
                $attribute['value']
            );
        }

        return new BusinessCapability(
            isset($state['id']) ? Uuid::fromString($state['id']) : null,
            Uuid::fromString($state['business_id']),
            Uuid::fromString($state['service_type_id']),
            $attributes
        );
    }

    public function trustMetricsFromState(array $state): BusinessTrustMetrics
    {
        return new BusinessTrustMetrics(
            Uuid::fromString($state['business_id']),
            (float) $state['reliability_score'],
            (float) $state['success_rate'],
            (float) $state['response_rate'],
            (float) $state['dispute_rate'],
            isset($state['avg_response_time']) ? (float) $state['avg_response_time'] : null,
            isset($state['session_completion_rate']) ? (float) $state['session_completion_rate'] : null
        );
    }

    public function defaultTrustMetrics(Uuid $businessId): BusinessTrustMetrics
    {
        return new BusinessTrustMetrics(
            $businessId,
            0.5,
            0.0,
            0.0,
            0.0,
            null,
            null
        );
    }
}
