<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Pusher\Pusher;

class NotificationService
{
    public static function sendPushNotification(User $user, Notification $notification): void
    {
        try {
            $pusher = new Pusher(
                config('broadcasting.connections.pusher.key'),
                config('broadcasting.connections.pusher.secret'),
                config('broadcasting.connections.pusher.app_id'),
                [
                    'cluster' => config('broadcasting.connections.pusher.options.cluster'),
                    'useTLS' => true,
                ]
            );

            $channel = "user.{$user->id}";

            $pusher->trigger($channel, 'booking-notification', [
                'notification_id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'data' => $notification->data,
                'timestamp' => $notification->sent_at->toIso8601String(),
            ]);

            $notification->markAsSent();
        } catch (\Exception $e) {
            \Log::error('Failed to send push notification', [
                'user_id' => $user->id,
                'notification_id' => $notification->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public static function sendNotificationToMultiple(array $userIds, Notification $notification): void
    {
        foreach ($userIds as $userId) {
            $user = User::find($userId);
            if ($user) {
                self::sendPushNotification($user, $notification);
            }
        }
    }

    public static function broadcastToChannel(string $channel, string $event, array $data): void
    {
        try {
            $pusher = new Pusher(
                config('broadcasting.connections.pusher.key'),
                config('broadcasting.connections.pusher.secret'),
                config('broadcasting.connections.pusher.app_id'),
                [
                    'cluster' => config('broadcasting.connections.pusher.options.cluster'),
                    'useTLS' => true,
                ]
            );

            $pusher->trigger($channel, $event, $data);
        } catch (\Exception $e) {
            \Log::error('Failed to broadcast to channel', [
                'channel' => $channel,
                'event' => $event,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
