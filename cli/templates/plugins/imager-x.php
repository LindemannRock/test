<?php

return [
    '*' => [
        'transformer' => 'craft',
        'fallbackImage' => '/dist/images/fallback.png',
        'cacheEnabled' => true,
        'cacheDuration' => 31536000,
        'cacheDurationRemoteFiles' => 31536000,
        'preserveColorProfiles' => true,
        'jpegQuality' => 90,
        'pngCompressionLevel' => 0,
        'resizeFilter' => 'lanczos',
        'hashPath' => true,
    ],
    'dev' => [],
    'staging' => [],
    'production' => [
        'optimizers' => ['jpegoptim', 'optipng', 'gifsicle'],
    ],
];
