<?php

namespace App\Console\Commands;

use App\Services\GoogleTrendService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('trends:cleanup')]
#[Description('Clean up Google Trends cached records older than 3 hours')]
class CleanupGoogleTrends extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(GoogleTrendService $trendService): int
    {
        $deleted = $trendService->purgeOldTrends();
        $this->info("Successfully deleted {$deleted} expired Google Trends record(s).");

        return self::SUCCESS;
    }
}
