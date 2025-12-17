<?php

namespace Gwl12345\ModernAuth\Console;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;

class InstallCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'modern-auth:install';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Install the Modern Auth components and resources';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle()
    {
        $this->info('Installing Modern Auth...');

        // Publish Migrations
        // Assuming migrations are in database/migrations of the package
        // But I haven't created them yet! I need to ensure WebAuthn migration is published by laragear/webauthn 
        // OR standard Laravel migrations are sufficient if extensions are handled.
        // User needs `laragear/webauthn` migrations. I can call their publish command.
        
        // Publish Migrations
        $this->info('Publishing migrations...');
        
        // We publish our custom migration for WebAuthn which includes the 'alias' column
        // defined in database/migrations/create_webauthn_credentials_table.php of this package.
        // We'll give it a timestamped name.
        
        $timestamp = date('Y_m_d_His');
        $migrationName = "{$timestamp}_create_webauthn_credentials_table.php";
        
        copy(
            __DIR__.'/../../database/migrations/create_webauthn_credentials_table.php',
            database_path("migrations/{$migrationName}")
        );
        
        // Also allow Laragear to publish its own config if needed, but we suppress its migration
        // since we are providing it.
        $this->call('vendor:publish', [
            '--provider' => "Laragear\WebAuthn\WebAuthnServiceProvider",
            '--tag' => "config"
        ]);

        // Publish Frontend Resources
        $this->info('Publishing frontend resources...');
        (new Filesystem)->ensureDirectoryExists(resource_path('js/Pages/Auth'));
        (new Filesystem)->ensureDirectoryExists(resource_path('js/Pages/Profile'));
        
        // Copy Auth Pages
        (new Filesystem)->copyDirectory(__DIR__.'/../../resources/js/Pages/Auth', resource_path('js/Pages/Auth'));
        
        // Copy Profile Pages
        (new Filesystem)->copyDirectory(__DIR__.'/../../resources/js/Pages/Profile', resource_path('js/Pages/Profile'));

        // Publish components (e.g. LoginTabs)
        $this->info('Publishing components...');
        (new Filesystem)->ensureDirectoryExists(resource_path('js/components/ui'));
        
        // We need to copy specific components that we are providing
        $components = [
            'ui/login-tabs.tsx',
        ];

        foreach ($components as $component) {
            if (file_exists(__DIR__.'/../../resources/js/Components/'.$component)) {
                copy(
                    __DIR__.'/../../resources/js/Components/'.$component,
                    resource_path('js/components/'.$component) 
                );
            }
        }

        // We might want to warn about overwriting?
        // For now, force overwrite is assumed or handled by copyDirectory logic (it overwrites).

        // Add Dependencies to package.json
        $this->updateNodePackages(function ($packages) {
            return [
                '@laragear/webpass' => '^2.0', 
                'dayjs' => '^1.11',
                // 'shadcn-ui' dependencies should be listed here if strictly required
                // but assuming host has them or we provide instructions.
            ] + $packages;
        });

        $this->info('Modern Auth installed successfully.');
        $this->comment('Please run "npm install && npm run build" to compile your assets.');
        $this->comment('Ensure you have migrated your database: "php artisan migrate"');
    }

    /**
     * Update the "package.json" file.
     *
     * @param  callable  $callback
     * @return void
     */
    protected function updateNodePackages(callable $callback)
    {
        if (! file_exists(base_path('package.json'))) {
            return;
        }

        $configuration = json_decode(file_get_contents(base_path('package.json')), true);

        $dependencies = $configuration['dependencies'] ?? [];
        $devDependencies = $configuration['devDependencies'] ?? [];

        $packages = $callback(array_merge($dependencies, $devDependencies));

        $configuration['dependencies'] = $dependencies + $packages; 
        // Ideally we should put them in dependencies or devDependencies specifically.
        // Simplified for this example.

        ksort($configuration['dependencies']);

        file_put_contents(
            base_path('package.json'),
            json_encode($configuration, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT).PHP_EOL
        );
    }
}
