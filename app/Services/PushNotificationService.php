<?php
namespace App\Services;

use App\Jobs\SendPushNotification;
use App\Models\NotificationLog;
use App\Models\PushSubscription;
use App\Models\User;

class PushNotificationService {
    /**
     * Queue push notifications to all subscriptions of a user.
     */
    public function sendToUser(User $user, array $payload): array {
        $sent = [];
        $user->load('pushSubscriptions');
        foreach ($user->pushSubscriptions as $sub) {
            SendPushNotification::dispatch($sub, $payload);
            $sent[] = $sub->id;
        }
        return $sent;
    }

    /**
     * Send push directly (used by Job). Requires minishlink/web-push installed.
     */
    public function rawSend(PushSubscription $sub, array $payload): bool {
        if (!class_exists(\Minishlink\WebPush\WebPush::class)) {
            // Library not installed — log and skip
            NotificationLog::create([
                'user_id'       => $sub->user_id,
                'type'          => $payload['type'] ?? 'generic',
                'payload'       => $payload,
                'success'       => false,
                'error_reason'  => 'minishlink/web-push not installed',
            ]);
            return false;
        }

        $webPush = new \Minishlink\WebPush\WebPush([
            'VAPID' => [
                'subject'    => config('services.vapid.subject', 'mailto:contacto@sinapsys.app'),
                'publicKey'  => config('services.vapid.public_key', ''),
                'privateKey' => config('services.vapid.private_key', ''),
            ],
        ]);

        $subscription = \Minishlink\WebPush\Subscription::create([
            'endpoint'  => $sub->endpoint,
            'publicKey' => $sub->p256dh,
            'authToken' => $sub->auth,
        ]);

        $report = $webPush->sendOneNotification($subscription, json_encode($payload));

        if ($report->isSubscriptionExpired()) {
            $sub->delete();
        }

        NotificationLog::create([
            'user_id'       => $sub->user_id,
            'type'          => $payload['type'] ?? 'generic',
            'payload'       => $payload,
            'success'       => $report->isSuccess(),
            'response_code' => $report->getResponse()?->getStatusCode(),
            'error_reason'  => $report->getReason(),
        ]);

        return $report->isSuccess();
    }
}
