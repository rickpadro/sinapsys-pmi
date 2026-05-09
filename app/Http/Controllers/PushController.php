<?php
namespace App\Http\Controllers;

use App\Http\Requests\StorePushSubscriptionRequest;
use App\Http\Requests\DestroyPushSubscriptionRequest;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;

class PushController extends Controller {
    public function subscribe(StorePushSubscriptionRequest $request): JsonResponse {
        $subscription = PushSubscription::updateOrCreate(
            ['endpoint' => $request->validated('endpoint')],
            [
                'user_id' => $request->user()->id,
                'p256dh'  => $request->validated('p256dh'),
                'auth'    => $request->validated('auth'),
            ]
        );
        return response()->json(['ok' => true, 'id' => $subscription->id]);
    }

    public function unsubscribe(DestroyPushSubscriptionRequest $request): JsonResponse {
        PushSubscription::where('endpoint', $request->validated('endpoint'))
            ->where('user_id', $request->user()->id)
            ->delete();
        return response()->json(['ok' => true]);
    }
}
