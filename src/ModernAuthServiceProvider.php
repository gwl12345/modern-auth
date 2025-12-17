<?php

namespace Gwl12345\ModernAuth;

use Illuminate\Support\ServiceProvider;

class ModernAuthServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Merge configuration
        // $this->mergeConfigFrom(__DIR__.'/../config/modern-auth.php', 'modern-auth');
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Load Routes
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');

        // Load Views
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'modern-auth');

        // Load Migrations
        // $this->loadMigrationsFrom(__DIR__.'/../database/migrations');

        // Publishing
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/modern-auth.php' => config_path('modern-auth.php'),
            ], 'modern-auth-config');
            
             $this->commands([
                Console\InstallCommand::class,
            ]);
        }
    }
}
