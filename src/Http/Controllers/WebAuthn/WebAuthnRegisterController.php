<?php

namespace Gwl12345\ModernAuth\Http\Controllers\WebAuthn;

use Illuminate\Routing\Controller;
use function response;
use Illuminate\Http\Response;
use Illuminate\Contracts\Support\Responsable;
use Laragear\WebAuthn\Http\Requests\AttestedRequest;
use Laragear\WebAuthn\Http\Requests\AttestationRequest;

class WebAuthnRegisterController extends Controller
{
    /**
     * Returns a challenge to be verified by the user device.
     */
    public function options(AttestationRequest $request): Responsable
    {
        return $request
            ->fastRegistration()
            ->toCreate();
    }

    /**
     * Registers a device for further WebAuthn authentication.
     */
    public function register(AttestedRequest $request): Response
    {
        $request->validate(['alias' => 'nullable|string']);

        $request->save($request->only('alias'));

        return response()->noContent();
    }
}
