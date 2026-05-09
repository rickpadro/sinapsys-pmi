<?php
namespace App\Jobs;

use App\Models\PushSubscription;
use App\Services\PushNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendPushNotification implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public array $backoff = [60, 300, 900];

    public function __construct(
        public PushSubscription $subscription,
        public array $payload,
    ) {}

    public function handle(PushNotificationService $service): void {
        $service->rawSend($this->subscription, $this->payload);
    }
}
