<?php
/**
 * HPP Master Pro - cPanel & Shared Hosting PHP Backend
 * 
 * This file handles secure user registration, login, and data storage on any 
 * standard PHP web hosting (cPanel/Shared Hosting) without requiring Node.js or Firebase.
 * It uses a secure JSON file database with direct-access prevention.
 */

// Silakan matikan display_errors agar warning/notice dari server lokal tidak merusak format JSON
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Authorization, X-Auth-Token, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Helper for servers that don't have apache_request_headers natively (seperti PHP built-in server)
if (!function_exists('apache_request_headers')) {
    function apache_request_headers() {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (substr($key, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

// Robust fallback helper for cryptographically secure bytes generator
function generateSecureBytes($length) {
    try {
        if (function_exists('random_bytes')) {
            return random_bytes($length);
        }
    } catch (\Exception $e) {
        // Fallback
    }
    
    if (function_exists('openssl_random_pseudo_bytes')) {
        $bytes = openssl_random_pseudo_bytes($length, $strong);
        if ($strong === true) {
            return $bytes;
        }
    }
    
    // Low-entropy fallback if everything else fails
    $bytes = '';
    while (strlen($bytes) < $length) {
        $bytes .= sha1(uniqid(mt_rand(), true), true);
    }
    return substr($bytes, 0, $length);
}

// Secure database store file configuration
define('DB_FILE', __DIR__ . '/db_store.json.php');

// Helper: Save database securely (prefixed with executable PHP that blocks direct browser access)
function saveDb($data) {
    $phpHeader = "<?php http_response_code(403); exit('Akses ditolak.'); ?>\n";
    $jsonContent = json_encode($data, JSON_PRETTY_PRINT);
    if (@file_put_contents(DB_FILE, $phpHeader . $jsonContent) === false) {
        http_response_code(500);
        echo json_encode([
            "message" => "Gagal menulis ke database file (" . basename(DB_FILE) . "). Silakan periksa izin tulis (write permissions) folder /public/ Anda."
        ]);
        exit();
    }
}

// Initialize database if it doesn't exist
if (!file_exists(DB_FILE)) {
    $initialDb = [
        "users" => [],
        "tokens" => [],
        "userData" => []
    ];
    saveDb($initialDb);
}

// Helper: Read database securely
function loadDb() {
    if (!file_exists(DB_FILE)) {
        return ["users" => [], "tokens" => [], "userData" => []];
    }
    
    $content = @file_get_contents(DB_FILE);
    if ($content === false) {
        return ["users" => [], "tokens" => [], "userData" => []];
    }
    
    // Strip out the PHP security wrapper line to extract the raw JSON data
    $jsonStartPos = strpos($content, '?>');
    if ($jsonStartPos === false) {
        return ["users" => [], "tokens" => [], "userData" => []];
    }
    
    $rawJson = substr($content, $jsonStartPos + 2);
    $data = json_decode(trim($rawJson), true);
    
    return $data ? $data : ["users" => [], "tokens" => [], "userData" => []];
}

// Determine active route
$route = isset($_GET['route']) ? trim($_GET['route'], '/') : '';

// Handle routes
switch ($route) {
    case 'health':
        echo json_encode(["status" => "ok", "message" => "Backend is ready!"]);
        exit();

    case 'auth/register':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["message" => "Metode tidak diizinkan."]);
            exit();
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        
        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(["message" => "Username dan password wajib diisi."]);
            exit();
        }
        
        if (strlen($username) < 3) {
            http_response_code(400);
            echo json_encode(["message" => "Username minimal 3 karakter."]);
            exit();
        }
        
        if (strlen($password) < 5) {
            http_response_code(400);
            echo json_encode(["message" => "Password minimal 5 karakter."]);
            exit();
        }
        
        $db = loadDb();
        
        // Check duplicate username
        foreach ($db['users'] as $u) {
            if (strtolower($u['username']) === strtolower($username)) {
                http_response_code(400);
                echo json_encode(["message" => "Username sudah terdaftar. Gunakan nama lain."]);
                exit();
            }
        }
        
        // Generate password hash and secure salt
        $salt = bin2hex(generateSecureBytes(16));
        $passwordHash = hash('sha256', $password . $salt);
        $userId = 'user_' . bin2hex(generateSecureBytes(8));
        
        $newUser = [
            "id" => $userId,
            "username" => $username,
            "passwordHash" => $passwordHash,
            "salt" => $salt,
            "createdAt" => date('c')
        ];
        
        $db['users'][] = $newUser;
        
        // Seed default demo data for the new user
        $initialMaterials = [
            ["id" => "mat_1", "name" => "Tepung Terigu Cakra Kembar", "purchasePrice" => 18000, "packageSize" => 1000, "unit" => "gram", "costPerUnit" => 18, "notes" => "Beli kartonan di Grosir Sinar Abadi"],
            ["id" => "mat_2", "name" => "Mentega Butter Wysman", "purchasePrice" => 145000, "packageSize" => 500, "unit" => "gram", "costPerUnit" => 290, "notes" => "Mentega premium import untuk rasa maksimal"],
            ["id" => "mat_3", "name" => "Gula Pasir Gulaku", "purchasePrice" => 175000, "packageSize" => 10000, "unit" => "gram", "costPerUnit" => 17.5, "notes" => "Kemasan karung isi 10 kg"],
            ["id" => "mat_4", "name" => "Kuning Telur Ayam Ras", "purchasePrice" => 32000, "packageSize" => 1000, "unit" => "gram", "costPerUnit" => 32, "notes" => "Diambil dari supplier lokal segar harian"],
            ["id" => "mat_5", "name" => "Ragi Instan Fermipan", "purchasePrice" => 6500, "packageSize" => 44, "unit" => "gram", "costPerUnit" => 147.7, "notes" => "Sachet kecil isi 44 gram"],
            ["id" => "mat_6", "name" => "Kotak Dus Box Premium", "purchasePrice" => 3500, "packageSize" => 1, "unit" => "pcs", "costPerUnit" => 3500, "notes" => "Cetak logo emas di percetakan Jaya"]
        ];
        
        $initialLabors = [
            ["id" => "lab_1", "role" => "Baker Utama (Kepala Dapur)", "rate" => 25000, "rateType" => "hour", "description" => "Mengatur resep dan proses pemanggangan adonan utama"],
            ["id" => "lab_2", "role" => "Staf Packer / Finishing", "rate" => 15000, "rateType" => "hour", "description" => "Melakukan quality control dan memasukkan roti ke kemasan dus"]
        ];
        
        $initialOverheads = [
            ["id" => "oh_1", "name" => "Sewa Ruko Dapur Produksi", "cost" => 2000000, "description" => "Dibayar tahunan, diamortisasi bulanan"],
            ["id" => "oh_2", "name" => "Listrik & Air Pabrik", "cost" => 750000, "description" => "Beban daya mixer industri dan pompa air bersih"],
            ["id" => "oh_3", "name" => "Penyusutan Oven & Mixer", "cost" => 500000, "description" => "Depresiasi alat produksi metode garis lurus"],
            ["id" => "oh_4", "name" => "Gas Elpiji 12kg (Dapur)", "cost" => 250000, "description" => "Rata-rata habis 1 tabung per minggu"]
        ];
        
        $initialProducts = [
            [
                "id" => "prod_1",
                "name" => "Roti Tawar Butter Premium (Batch 10 Unit)",
                "description" => "Roti tawar mentega wangi premium untuk segmen pasar menengah ke atas.",
                "batchSize" => 10,
                "materials" => [
                    ["materialId" => "mat_1", "quantityUsed" => 2500],
                    ["materialId" => "mat_2", "quantityUsed" => 250],
                    ["materialId" => "mat_3", "quantityUsed" => 300],
                    ["materialId" => "mat_4", "quantityUsed" => 400],
                    ["materialId" => "mat_5", "quantityUsed" => 50],
                    ["materialId" => "mat_6", "quantityUsed" => 10]
                ],
                "labors" => [
                    ["laborId" => "lab_1", "timeOrQty" => 3],
                    ["laborId" => "lab_2", "timeOrQty" => 1.5]
                ],
                "overheads" => [
                    ["overheadId" => "oh_1", "isAutomatic" => true, "manualCost" => 0],
                    ["overheadId" => "oh_2", "isAutomatic" => true, "manualCost" => 0],
                    ["overheadId" => "oh_3", "isAutomatic" => true, "manualCost" => 0],
                    ["overheadId" => "oh_4", "isAutomatic" => true, "manualCost" => 0]
                ],
                "targetMargin" => 40,
                "sellingPrice" => 32500,
                "createdAt" => date('c'),
                "updatedAt" => date('c')
            ]
        ];
        
        $db['userData'][$userId] = [
            "materials" => $initialMaterials,
            "labors" => $initialLabors,
            "overheads" => $initialOverheads,
            "products" => $initialProducts,
            "monthlyVolume" => 1000
        ];
        
        // Generate Token
        $token = bin2hex(generateSecureBytes(32));
        $db['tokens'][$token] = [
            "userId" => $userId,
            "username" => $username,
            "expiresAt" => time() + (30 * 24 * 3600) // 30 Days expiration
        ];
        
        saveDb($db);
        
        echo json_encode([
            "message" => "Registrasi berhasil!",
            "token" => $token,
            "user" => [
                "id" => $userId,
                "username" => $username
            ]
        ]);
        break;
        
    case 'auth/login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["message" => "Metode tidak diizinkan."]);
            exit();
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        
        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(["message" => "Username dan password wajib diisi."]);
            exit();
        }
        
        $db = loadDb();
        $matchedUser = null;
        
        foreach ($db['users'] as $u) {
            if (strtolower($u['username']) === strtolower($username)) {
                $matchedUser = $u;
                break;
            }
        }
        
        if (!$matchedUser) {
            http_response_code(400);
            echo json_encode(["message" => "Username atau password salah."]);
            exit();
        }
        
        // Verify password
        $hash = hash('sha256', $password . $matchedUser['salt']);
        if ($hash !== $matchedUser['passwordHash']) {
            http_response_code(400);
            echo json_encode(["message" => "Username atau password salah."]);
            exit();
        }
        
        // Generate Token
        $token = bin2hex(generateSecureBytes(32));
        $db['tokens'][$token] = [
            "userId" => $matchedUser['id'],
            "username" => $matchedUser['username'],
            "expiresAt" => time() + (30 * 24 * 3600) // 30 Days
        ];
        
        saveDb($db);
        
        echo json_encode([
            "message" => "Login berhasil!",
            "token" => $token,
            "user" => [
                "id" => $matchedUser['id'],
                "username" => $matchedUser['username']
            ]
        ]);
        break;
        
    case 'auth/me':
        // Authenticate
        $userId = authenticateUser();
        $db = loadDb();
        
        $username = '';
        foreach ($db['users'] as $u) {
            if ($u['id'] === $userId) {
                $username = $u['username'];
                break;
            }
        }
        
        echo json_encode([
            "user" => [
                "id" => $userId,
                "username" => $username
            ]
        ]);
        break;
        
    case 'data':
        $userId = authenticateUser();
        $db = loadDb();
        
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $userData = isset($db['userData'][$userId]) ? $db['userData'][$userId] : [
                "materials" => [],
                "labors" => [],
                "overheads" => [],
                "products" => [],
                "monthlyVolume" => 1000
            ];
            echo json_encode($userData);
            
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $db['userData'][$userId] = [
                "materials" => isset($input['materials']) ? $input['materials'] : [],
                "labors" => isset($input['labors']) ? $input['labors'] : [],
                "overheads" => isset($input['overheads']) ? $input['overheads'] : [],
                "products" => isset($input['products']) ? $input['products'] : [],
                "monthlyVolume" => isset($input['monthlyVolume']) ? (int)$input['monthlyVolume'] : 1000
            ];
            
            saveDb($db);
            echo json_encode([
                "message" => "Data berhasil disimpan ke cloud hosting!",
                "data" => $db['userData'][$userId]
            ]);
        } else {
            http_response_code(405);
            echo json_encode(["message" => "Metode tidak diizinkan."]);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(["message" => "Endpoint API tidak ditemukan."]);
        break;
}

// Authentication guard helper
function authenticateUser() {
    $token = '';

    // 1. Check GET/POST query parameter 'token'
    if (isset($_GET['token']) && !empty($_GET['token'])) {
        $token = trim($_GET['token']);
    } elseif (isset($_POST['token']) && !empty($_POST['token'])) {
        $token = trim($_POST['token']);
    } else {
        // 2. Check Apache request headers
        $headers = apache_request_headers();
        
        // Normalize headers to lowercase keys for reliable check
        $normalized_headers = [];
        if (is_array($headers)) {
            foreach ($headers as $k => $v) {
                $normalized_headers[strtolower($k)] = $v;
            }
        }

        if (isset($normalized_headers['authorization'])) {
            $authHeader = $normalized_headers['authorization'];
        } elseif (isset($normalized_headers['x-authorization'])) {
            $authHeader = $normalized_headers['x-authorization'];
        } elseif (isset($normalized_headers['x-auth-token'])) {
            $authHeader = $normalized_headers['x-auth-token'];
        } else {
            $authHeader = '';
        }

        // 3. Fallback to $_SERVER variables
        if (empty($authHeader)) {
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            } elseif (isset($_SERVER['HTTP_X_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_X_AUTHORIZATION'];
            } elseif (isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
                $authHeader = $_SERVER['HTTP_X_AUTH_TOKEN'];
            }
        }

        // Extract token from Bearer prefix if exists
        if (!empty($authHeader)) {
            if (strpos($authHeader, 'Bearer ') === 0) {
                $token = substr($authHeader, 7);
            } else {
                $token = $authHeader;
            }
        }
    }

    $token = trim($token);

    if (empty($token)) {
        http_response_code(401);
        echo json_encode(["message" => "Otorisasi ditolak. Silakan login terlebih dahulu."]);
        exit();
    }
    
    $db = loadDb();
    
    if (!isset($db['tokens'][$token])) {
        http_response_code(401);
        echo json_encode(["message" => "Sesi login kedaluwarsa atau tidak valid. Silakan login kembali."]);
        exit();
    }
    
    $tokenData = $db['tokens'][$token];
    if ($tokenData['expiresAt'] < time()) {
        // Clean expired token
        unset($db['tokens'][$token]);
        saveDb($db);
        
        http_response_code(401);
        echo json_encode(["message" => "Sesi login Anda telah kedaluwarsa. Silakan masuk kembali."]);
        exit();
    }
    
    return $tokenData['userId'];
}
