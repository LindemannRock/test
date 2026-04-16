<?php

use craft\helpers\App;

$distDir = '@web/dist';
$baseUrl = '/dist';

// When Tailscale is sharing the site (via `make share` or `make funnel`), the
// DDEV commands set TAILSCALE_HOST in web_environment so Vite serves assets
// over the Tailscale URL on port 8443. Falls back to VITE_DEV_SERVER_PUBLIC.
$tailscaleHost = App::env('TAILSCALE_HOST');
$devServerPublic = $tailscaleHost
    ? "https://{$tailscaleHost}:8443"
    : App::env('VITE_DEV_SERVER_PUBLIC');

return [
    'useDevServer' => App::env('ENVIRONMENT') === 'dev' || App::env('CRAFT_ENVIRONMENT') === 'dev',
    'manifestPath' => Craft::getAlias($distDir) . '/manifest.json',
    'devServerPublic' => $devServerPublic,
    'serverPublic' => App::env('PRIMARY_SITE_URL') . $baseUrl . '/',
    'errorEntry' => 'src/js/main.ts',
    'cacheKeySuffix' => '',
    'devServerInternal' => App::env('VITE_DEV_SERVER_INTERNAL'),
    'checkDevServer' => true,
    'includeReactRefreshShim' => false,
    'includeModulePreloadShim' => true,
];
