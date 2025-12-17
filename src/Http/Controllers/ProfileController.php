<?php

namespace Gwl12345\ModernAuth\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Jenssegers\Agent\Agent;

class ProfileController extends Controller
{
    /**
     * Show the user profile overview.
     */
    public function edit(Request $request)
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Show the browser sessions settings screen.
     */
    public function showBrowserSessions(Request $request)
    {
        return Inertia::render('Profile/BrowserSessions', [
            'sessions' => $this->sessions($request)->all()
        ]);
    }

    /**
     * Get the current sessions.
     */
    protected function sessions(Request $request)
    {
        if (config('session.driver') !== 'database') {
            return collect();
        }

        return collect(
            DB::connection(config('session.connection'))->table(config('session.table', 'sessions'))
                    ->where('user_id', $request->user()->getAuthIdentifier())
                    ->orderBy('last_activity', 'desc')
                    ->get()
        )->map(function ($session) use ($request) {
            $agent = $this->createAgent($session);

            return (object) [
                'agent' => [
                    'is_desktop' => $agent->isDesktop(),
                    'platform' => $agent->platform(),
                    'browser' => $agent->browser(),
                ],
                'ip_address' => $session->ip_address,
                'is_current_device' => $session->id === $request->session()->getId(),
                'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
            ];
        });
    }

    /**
     * Create a new agent instance from the given session.
     */
    protected function createAgent($session)
    {
        return tap(new Agent(), fn ($agent) => $agent->setUserAgent($session->user_agent));
    }

    /**
     * Show the two factor authentication settings.
     */
    public function showTwoFactorAuthentication(Request $request)
    {
        return Inertia::render('Profile/TwoFactorAuthentication', [
            'requiresConfirmation' => false, // You might want to implement proper logic here
        ]);
    }
}
