<?php
/**
 * HPP Master Pro - Local Router for PHP Built-in Server
 * 
 * Run this file in your terminal using:
 * php -S localhost:8000 router.php
 * 
 * This router emulates Apache's mod_rewrite to route `/api/*` to `/public/api.php`
 * and falls back to `/index.html` for single-page routing.
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// 1. Route API requests starting with /api/ directly to public/api.php
if (preg_match('#^/api/(.*)$#', $uri, $matches)) {
    $_GET['route'] = $matches[1];
    include __DIR__ . '/public/api.php';
    exit;
}

// 2. Serve static assets if they exist in the public directory
$publicFile = __DIR__ . '/public' . $uri;
if (file_exists($publicFile) && !is_dir($publicFile)) {
    // Determine content type for some common assets
    $ext = pathinfo($publicFile, PATHINFO_EXTENSION);
    if ($ext === 'js') {
        header("Content-Type: application/javascript");
    } elseif ($ext === 'css') {
        header("Content-Type: text/css");
    } elseif ($ext === 'json') {
        header("Content-Type: application/json");
    }
    return false; // let the built-in server serve the file
}

// 3. Serve static assets if they exist in the root directory (e.g. index.html)
$rootFile = __DIR__ . $uri;
if (file_exists($rootFile) && !is_dir($rootFile)) {
    return false;
}

// 4. Default fallback: serve the index.html SPA
include __DIR__ . '/index.html';
