<?php

namespace App\MatchingContext\Signal\Tests\Unit;

use App\MatchingContext\Signal\Domain\Services\OutcomeResolver;
use Tests\TestCase;

class OutcomeResolverTest extends TestCase
{
    public function test_requires_at_least_one_outcome(): void
    {
        $resolver = new OutcomeResolver;

        $this->expectException(\InvalidArgumentException::class);
        $resolver->resolve(null, null);
    }

    public function test_single_report_resolution(): void
    {
        $resolver = new OutcomeResolver;

        $result = $resolver->resolve('NO_AGREEMENT', null);
        $this->assertSame('NO_AGREEMENT', $result['outcome']);
        $this->assertSame(0.6, $result['confidence']);
    }

    public function test_single_seller_report_resolution(): void
    {
        $resolver = new OutcomeResolver;

        $result = $resolver->resolve(null, 'NO_AGREEMENT');
        $this->assertSame('NO_AGREEMENT', $result['outcome']);
        $this->assertSame(0.6, $result['confidence']);
    }

    public function test_dual_confirmation_resolution(): void
    {
        $resolver = new OutcomeResolver;

        $result = $resolver->resolve('DEAL_CONFIRMED', 'DEAL_CONFIRMED');
        $this->assertSame('DEAL_CONFIRMED', $result['outcome']);
        $this->assertSame(1.0, $result['confidence']);
    }

    public function test_no_response_priority(): void
    {
        $resolver = new OutcomeResolver;

        $result = $resolver->resolve('NO_RESPONSE', 'NO_AGREEMENT');
        $this->assertSame('NO_RESPONSE', $result['outcome']);
        $this->assertSame(0.6, $result['confidence']);
    }

    public function test_moved_off_platform_priority(): void
    {
        $resolver = new OutcomeResolver;

        $result = $resolver->resolve('MOVED_OFF_PLATFORM', 'NO_AGREEMENT');
        $this->assertSame('MOVED_OFF_PLATFORM', $result['outcome']);
        $this->assertSame(0.6, $result['confidence']);
    }

    public function test_conflicting_outcomes_resolve_to_disputed(): void
    {
        $resolver = new OutcomeResolver;

        $result = $resolver->resolve('NO_AGREEMENT', 'OUT_OF_SCOPE');
        $this->assertSame('DISPUTED', $result['outcome']);
        $this->assertSame(0.3, $result['confidence']);
    }
}
