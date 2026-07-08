<?php

namespace App\MatchingContext\Rfs\Tests\Unit;

use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Rfs\Application\RfsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RfsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $user = AuthUser::create([
            'id' => (string) Str::uuid(),
            'name' => 'Test User',
            'email' => 'test@'.Str::uuid().'.com',
            'password' => bcrypt('password'),
            'status' => 'ACTIVE',
        ]);
        Sanctum::actingAs($user);
    }

    private function bindFakeService(string $rfsId): object
    {
        $fakeService = new class($rfsId) extends RfsService
        {
            public array $payloads = [];

            public function __construct(private readonly string $rfsId) {}

            public function create(array $payload): array
            {
                $this->payloads['create'] = $payload;

                return ['id' => $this->rfsId, 'status' => 'DRAFT'];
            }

            public function update(string $rfsId, array $payload): array
            {
                $this->payloads['update'] = $payload;

                return ['id' => $rfsId, 'status' => 'DRAFT'];
            }

            public function show(string $rfsId): array
            {
                return ['id' => $rfsId, 'status' => 'DRAFT'];
            }

            public function open(string $rfsId): array
            {
                return ['id' => $rfsId, 'status' => 'OPEN'];
            }

            public function list(?string $buyerId = null): array
            {
                return [['id' => $this->rfsId, 'status' => 'DRAFT']];
            }
        };

        $this->app->instance(RfsService::class, $fakeService);

        return $fakeService;
    }

    public function test_rfs_controller_invokes_service_methods(): void
    {
        $rfsId = Str::uuid()->toString();

        $fakeService = $this->bindFakeService($rfsId);

        $payload = [
            'buyer_id' => Str::uuid()->toString(),
            'title' => 'Need service',
            'description' => 'Looking for support',
            'service_type_id' => Str::uuid()->toString(),
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'constraints' => [
                'min_budget' => 1000,
                'region' => 'Dar',
            ],
        ];

        $this->postJson('/api/rfs', $payload)
            ->assertStatus(201)
            ->assertJson(['id' => $rfsId]);

        $this->patchJson("/api/rfs/{$rfsId}", [
            'title' => 'Need service updated',
        ])->assertStatus(200)
            ->assertJson(['id' => $rfsId]);

        $this->postJson("/api/rfs/{$rfsId}/open")
            ->assertStatus(200)
            ->assertJson(['status' => 'OPEN']);

        $this->getJson("/api/rfs/{$rfsId}")
            ->assertStatus(200)
            ->assertJson(['id' => $rfsId]);

        $this->assertSame('Need service', $fakeService->payloads['create']['title']);
    }

    public function test_store_validates_deadline_not_before_start_date(): void
    {
        $rfsId = Str::uuid()->toString();
        $this->bindFakeService($rfsId);

        $payload = [
            'buyer_id' => Str::uuid()->toString(),
            'title' => 'Need service',
            'description' => 'Looking for support',
            'service_type_id' => Str::uuid()->toString(),
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'constraints' => [
                'start_date' => '2026-01-10',
                'deadline' => '2026-01-01',
            ],
        ];

        $this->postJson('/api/rfs', $payload)->assertStatus(422);
    }

    public function test_store_deadline_validation_handles_unparseable_dates(): void
    {
        $rfsId = Str::uuid()->toString();
        $this->bindFakeService($rfsId);

        $payload = [
            'buyer_id' => Str::uuid()->toString(),
            'title' => 'Need service',
            'description' => 'Looking for support',
            'service_type_id' => Str::uuid()->toString(),
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'constraints' => [
                'start_date' => 'not-a-date',
                'deadline' => 'also-not-a-date',
            ],
        ];

        $this->postJson('/api/rfs', $payload)->assertStatus(422);
    }

    public function test_update_validates_deadline_not_before_start_date(): void
    {
        $rfsId = Str::uuid()->toString();
        $this->bindFakeService($rfsId);

        $this->patchJson("/api/rfs/{$rfsId}", [
            'constraints' => [
                'start_date' => '2026-01-10',
                'deadline' => '2026-01-01',
            ],
        ])->assertStatus(422);
    }

    public function test_update_deadline_validation_handles_unparseable_dates(): void
    {
        $rfsId = Str::uuid()->toString();
        $this->bindFakeService($rfsId);

        $this->patchJson("/api/rfs/{$rfsId}", [
            'constraints' => [
                'start_date' => 'not-a-date',
                'deadline' => 'also-not-a-date',
            ],
        ])->assertStatus(422);
    }

    public function test_index_calls_list_on_service(): void
    {
        $rfsId = Str::uuid()->toString();
        $this->bindFakeService($rfsId);

        $business = Business::create([
            'name' => 'Buyer',
            'contact_person' => 'Owner',
            'phone' => '+255700000000',
            'email' => 'buyer.test@example.com',
            'user_id' => auth()->id(),
        ]);

        $this->getJson('/api/rfs')
            ->assertStatus(200);
    }
}
