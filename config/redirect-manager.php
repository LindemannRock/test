<?php

use craft\helpers\App;

return [
    '*' => [
        'pluginName' => 'Redirects',
        'autoCreateRedirects' => true,
        'enableAnalytics' => true,
        'logLevel' => 'debug',
        'statisticsRetention' => 30,
        'statisticsLimit' => 1000,
        'autoTrimStatistics' => true,
        'itemsPerPage' => 100,
        'setNoCacheHeaders' => true,
        'recordIp' => true,
        'ipHashSalt' => App::env('REDIRECT_MANAGER_IP_SALT'),
        'enableRedirectCache' => true,
        'redirectCacheDuration' => 3600,
    ],
    'dev' => [
        'logLevel' => 'debug',
        'enableRedirectCache' => true,
        'redirectCacheDuration' => 60,
    ],
    'staging' => [
        'logLevel' => 'info',
        'redirectCacheDuration' => 3600,
    ],
    'production' => [
        'logLevel' => 'error',
        'analyticsRetention' => 365,
        'cacheStorageMethod' => 'redis',
        'redirectCacheDuration' => 86400,
    ],
];
