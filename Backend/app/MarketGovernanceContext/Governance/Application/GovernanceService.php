<?php

namespace App\MarketGovernanceContext\Governance\Application;

use App\MarketGovernanceContext\Broker\Domain\Repositories\BrokerRepository;
use App\MarketGovernanceContext\Governance\Domain\Factories\GovernanceFactory;
use App\MarketGovernanceContext\Governance\Domain\Repositories\GovernanceRepository;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\OfficeTermStatus;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\OfficeType;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

class GovernanceService
{
    private const TERM_YEARS = 5;

    public function __construct(
        private readonly GovernanceRepository $repository,
        private readonly GovernanceFactory $factory,
        private readonly BrokerRepository $brokerRepository
    ) {}

    public function createOffice(string $marketId, array $payload): array
    {
        $officeType = $payload['office_type'] ?? OfficeType::CHAIRPERSON->value;
        $marketUuid = Uuid::fromString($marketId);

        $existing = $this->repository->findOfficeByMarketAndType($marketUuid, $officeType);
        if ($existing) {
            return $existing->toArray();
        }

        $office = $this->factory->createOffice([
            'market_id' => $marketId,
            'office_type' => $officeType,
        ]);

        return $this->repository->createOffice($office)->toArray();
    }

    public function assignChairperson(string $officeId, array $payload): array
    {
        $officeUuid = Uuid::fromString($officeId);
        $personUuid = Uuid::fromString($payload['person_id']);

        if ($this->brokerRepository->hasActiveRegistrationForPerson($personUuid)) {
            throw new \RuntimeException('Person already has an active broker registration.');
        }

        if ($this->repository->hasActiveOfficeTermForOffice($officeUuid)) {
            throw new \RuntimeException('Office already has an active term.');
        }

        $startDate = new \DateTimeImmutable($payload['start_date']);
        $maxEndDate = $startDate->add(new \DateInterval('P'.self::TERM_YEARS.'Y'));
        $endDate = isset($payload['end_date'])
            ? new \DateTimeImmutable($payload['end_date'])
            : $maxEndDate;

        if ($endDate < $startDate) {
            throw new \RuntimeException('End date must be on or after start date.');
        }

        if ($endDate > $maxEndDate) {
            throw new \RuntimeException('Office term cannot exceed 5 years.');
        }

        $term = $this->factory->createOfficeTerm([
            'office_id' => $officeId,
            'person_id' => $payload['person_id'],
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'status' => OfficeTermStatus::ACTIVE->value,
        ]);

        return $this->repository->createOfficeTerm($term)->toArray();
    }

    public function endTerm(string $termId, array $payload): array
    {
        $term = $this->requireOfficeTerm($termId);
        $termState = $term->toArray();
        $startDate = new \DateTimeImmutable($termState['start_date']);
        $endDate = isset($payload['end_date'])
            ? new \DateTimeImmutable($payload['end_date'])
            : new \DateTimeImmutable('now');

        if ($endDate < $startDate) {
            throw new \RuntimeException('End date must be on or after start date.');
        }

        $ended = $term->withEndDate($endDate)->withStatus(OfficeTermStatus::ENDED->value);

        return $this->repository->updateOfficeTerm($ended)->toArray();
    }

    private function requireOfficeTerm(string $termId)
    {
        $term = $this->repository->findOfficeTermById(Uuid::fromString($termId));
        if (! $term) {
            throw new \RuntimeException('Office term not found.');
        }

        return $term;
    }
}
