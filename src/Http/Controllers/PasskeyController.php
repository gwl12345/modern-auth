<?php

namespace Gwl12345\ModernAuth\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PasskeyController extends Controller
{
    /**
     * Show the user's passkeys.
     */
    public function index()
    {
        $user = auth()->user();
        // Assumes user model has Laragear\WebAuthn\WebAuthnAuthentication trait
        $passkeys = $user->webauthnCredentials()->get(['id', 'alias', 'created_at']);
        
        return Inertia::render('Profile/Passkeys', [
            'passkeys' => $passkeys,
        ]);
    }

    /**
     * Delete a passkey.
     */
    public function destroy(Request $request, $id)
    {
        $user = auth()->user();
        
        try {
            $credential = $user->webauthnCredentials()->where('id', $id)->firstOrFail();
            $credential->delete();
            
            return back()->with('success', 'Passkey deleted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete passkey.');
        }
    }
}
