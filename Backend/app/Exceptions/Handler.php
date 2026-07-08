<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $e)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->renderApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    private function renderApiException(Request $request, Throwable $e): JsonResponse
    {
        if ($e instanceof ValidationException) {
            return parent::render($request, $e);
        }

        if ($e instanceof HttpExceptionInterface) {
            return response()->json([
                'message' => $e->getMessage() ?: 'Request could not be completed.',
                'error' => class_basename($e),
            ], $e->getStatusCode());
        }

        if ($e instanceof \RuntimeException) {
            $message = $e->getMessage();
            $status = match (true) {
                str_contains(strtolower($message), 'not found') => 404,
                str_contains(strtolower($message), 'invalid credentials'),
                str_contains(strtolower($message), 'incorrect'),
                str_contains(strtolower($message), 'unauthorized'),
                str_contains(strtolower($message), 'locked'),
                str_contains(strtolower($message), 'not active') => 422,
                str_contains(strtolower($message), 'already registered'),
                str_contains(strtolower($message), 'already has') => 409,
                default => 422,
            };

            return response()->json([
                'message' => $message,
                'error' => 'RuntimeException',
            ], $status);
        }

        if ($e instanceof \DomainException) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => 'DomainException',
            ], 422);
        }

        return parent::render($request, $e);
    }
}
