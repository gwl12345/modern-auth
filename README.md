# Modern Auth Package

A modern authentication package for Laravel 12 + Inertia 2.3, featuring:

- **Tabbed Login**: Standard Form, Magic Link, and WebAuthn (Passkeys).
- **Profile Management**: Update Info, Two-Factor Authentication, Browser Sessions, and Passkeys.
- **Shadcn UI**: Pre-styled components using Shadcn UI.

## Prerequisites

- Laravel 12.x
- Inertia.js 2.x (React)
- Shadcn UI (installed in host app)

## Installation

### 1. Require Package

If installing locally (development):

Add the repository to your application's `composer.json`:

```json
"repositories": [
    {
        "type": "path",
        "url": "../modern-auth"
    }
],
```

Then run:

```bash


```

### 2. Install Resources

Publish the frontend files and migrations:

```bash
php artisan modern-auth:install
```

### 3. Install Dependencies

Install the required NPM packages:

```bash
npm install @laragear/webpass dayjs
npm install class-variance-authority clsx tailwind-merge lucide-react sonner --save
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. Build Assets

```bash
npm run build
```

## Configuration

### Service Provider

The package automatically registers its service provider.

### Fortify

Ensure `TwoFactorAuthentication` is enabled in `config/fortify.php` if you wish to use the 2FA features.

## Usage

- **Login**: The package overrides the standard login view. Visit `/login`.
- **Profile**: Access the profile settings at `/user/settings/profile`.
- **Passkeys**: Manage passkeys at `/user/settings/passkeys`.
- **2FA**: Setup Two-Factor Authentication at `/user/settings/two-factor-authentication`.

## Frontend Integration

The package assumes your application has a `layouts/app-layout` and `layouts/settings/layout` (or you may need to adjust the imports in the published pages). All published pages are placed in `resources/js/Pages/Auth` and `resources/js/Pages/Profile`.
