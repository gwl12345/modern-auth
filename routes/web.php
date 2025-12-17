<?php

use Illuminate\Support\Facades\Route;
use Gwl12345\ModernAuth\Http\Controllers\MagicLinkController;
use Gwl12345\ModernAuth\Http\Controllers\WebAuthn\WebAuthnLoginController;
use Gwl12345\ModernAuth\Http\Controllers\WebAuthn\WebAuthnRegisterController;

Route::group(['middleware' => ['web']], function () {

    // Magic Link
    Route::post('/login/magic-link', [MagicLinkController::class, 'sendMagicLink'])
        ->name('magic-link.send');

    Route::get('/login/magic-link/{user}', [MagicLinkController::class, 'authenticateViaLink'])
        ->middleware('signed')
        ->name('magic-link.login');

    // WebAuthn Login
    Route::post('/webauthn/login/options', [WebAuthnLoginController::class, 'options'])
        ->name('webauthn.login.options');
    Route::post('/webauthn/login', [WebAuthnLoginController::class, 'login'])
        ->name('webauthn.login');

    // WebAuthn Register
    Route::post('/webauthn/register/options', [WebAuthnRegisterController::class, 'options'])
        ->middleware('auth')
        ->name('webauthn.register.options');
    Route::post('/webauthn/register', [WebAuthnRegisterController::class, 'register'])
        ->middleware('auth')
        ->name('webauthn.register');

    // Settings / Profile
    Route::middleware(['auth', 'verified'])->prefix('user/settings')->name('modern-auth.settings.')->group(function () {
        Route::get('/profile', [Gwl12345\ModernAuth\Http\Controllers\ProfileController::class, 'edit'])->name('profile');
        Route::get('/browser-sessions', [Gwl12345\ModernAuth\Http\Controllers\ProfileController::class, 'showBrowserSessions'])->name('browser-sessions');

        Route::get('/passkeys', [Gwl12345\ModernAuth\Http\Controllers\PasskeyController::class, 'index'])->name('passkeys.index');
        Route::delete('/passkeys/{id}', [Gwl12345\ModernAuth\Http\Controllers\PasskeyController::class, 'destroy'])->name('passkeys.destroy');
        
        Route::get('/two-factor-authentication', [Gwl12345\ModernAuth\Http\Controllers\ProfileController::class, 'showTwoFactorAuthentication'])->name('two-factor.index');
    });
});
