<?php

namespace App\MatchingContext\Engagement\Presentation\Http;

use App\MatchingContext\Engagement\Application\EngagementMessageService;
use App\MatchingContext\Engagement\Infrastructure\Models\EngagementMessage as EngagementMessageModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EngagementMessageController
{
    /**
     * Allow-list of document/image types that can be attached to a chat
     * message. Executables, scripts, and archives are intentionally excluded.
     */
    private const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'image/png',
        'image/jpeg',
        'image/webp',
    ];

    private const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB

    public function index(Request $request, string $sessionId, EngagementMessageService $service): JsonResponse
    {
        $payload = $request->validate([
            'business_id' => ['required', 'uuid'],
        ]);

        try {
            return response()->json($service->list($sessionId, $payload['business_id']));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    public function store(Request $request, string $sessionId, EngagementMessageService $service): JsonResponse
    {
        $payload = $request->validate([
            'sender_business_id' => ['required', 'uuid'],
            'body' => ['nullable', 'string', 'max:2000'],
            'attachment' => [
                'nullable',
                'file',
                'max:' . (self::MAX_ATTACHMENT_BYTES / 1024),
                'mimetypes:' . implode(',', self::ALLOWED_MIME_TYPES),
            ],
        ]);

        $hasBody = ! empty(trim((string) ($payload['body'] ?? '')));
        $hasAttachment = $request->hasFile('attachment');

        if (! $hasBody && ! $hasAttachment) {
            return response()->json(['message' => 'A message requires text, an attachment, or both.'], 422);
        }

        if ($hasAttachment) {
            $file = $request->file('attachment');
            $storedPath = $file->store('chat-attachments/' . $sessionId, 'local');

            $payload['attachment_path'] = $storedPath;
            $payload['attachment_original_name'] = $file->getClientOriginalName();
            $payload['attachment_mime'] = $file->getClientMimeType();
            $payload['attachment_size'] = $file->getSize();
        }

        try {
            return response()->json($service->send($sessionId, $payload), 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    public function downloadAttachment(Request $request, string $sessionId, string $messageId, EngagementMessageService $service): JsonResponse|StreamedResponse
    {
        $payload = $request->validate([
            'business_id' => ['required', 'uuid'],
        ]);

        try {
            // Reuses the same participant check as listing messages.
            $service->list($sessionId, $payload['business_id']);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }

        $message = EngagementMessageModel::where('id', $messageId)
            ->where('session_id', $sessionId)
            ->first();

        if (! $message || ! $message->attachment_path) {
            return response()->json(['message' => 'Attachment not found.'], 404);
        }

        if (! Storage::disk('local')->exists($message->attachment_path)) {
            return response()->json(['message' => 'Attachment file is missing.'], 404);
        }

        $safeName = Str::slug(pathinfo($message->attachment_original_name, PATHINFO_FILENAME))
            . '.' . pathinfo($message->attachment_original_name, PATHINFO_EXTENSION);

        return Storage::disk('local')->download($message->attachment_path, $safeName ?: $message->attachment_original_name);
    }
}