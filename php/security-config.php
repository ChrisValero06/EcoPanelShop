<?php
/**
 * Security Configuration for EcoShop
 * Comprehensive security settings and constants
 */

// Prevent direct access
if (!defined('SECURE_ACCESS')) {
    define('SECURE_ACCESS', true);
}

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'ecoshop_db');
define('DB_USER', 'ecoshop_user');
define('DB_PASS', 'your_secure_password_here');
define('DB_CHARSET', 'utf8mb4');

// Security Constants
define('HASH_COST', 12); // For password_hash()
define('SESSION_LIFETIME', 3600); // 1 hour
define('REMEMBER_ME_LIFETIME', 2592000); // 30 days
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_DURATION', 900); // 15 minutes
define('PASSWORD_MIN_LENGTH', 8);
define('PASSWORD_REQUIRE_UPPERCASE', true);
define('PASSWORD_REQUIRE_LOWERCASE', true);
define('PASSWORD_REQUIRE_NUMBERS', true);
define('PASSWORD_REQUIRE_SPECIAL', false);

// Rate Limiting
define('RATE_LIMIT_LOGIN', 5); // 5 attempts per window
define('RATE_LIMIT_WINDOW', 900); // 15 minutes
define('RATE_LIMIT_API', 100); // 100 requests per window
define('RATE_LIMIT_API_WINDOW', 3600); // 1 hour

// CSRF Protection
define('CSRF_TOKEN_LENGTH', 32);
define('CSRF_TOKEN_LIFETIME', 3600); // 1 hour

// File Upload Security
define('MAX_FILE_SIZE', 5242880); // 5MB
define('ALLOWED_FILE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'pdf']);
define('UPLOAD_PATH', '/uploads/');
define('SECURE_UPLOAD_PATH', true);

// Email Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-app-password');
define('SMTP_ENCRYPTION', 'tls');
define('FROM_EMAIL', 'noreply@ecoshop.com');
define('FROM_NAME', 'EcoShop');

// Security Headers
$security_headers = [
    'X-Content-Type-Options' => 'nosniff',
    'X-Frame-Options' => 'DENY',
    'X-XSS-Protection' => '1; mode=block',
    'Referrer-Policy' => 'strict-origin-when-cross-origin',
    'Content-Security-Policy' => "default-src 'self'; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com cdnjs.cloudflare.com; font-src fonts.gstatic.com; img-src 'self' data: https:;",
    'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy' => 'geolocation=(), microphone=(), camera=()'
];

// IP Whitelist for admin access
$admin_ip_whitelist = [
    '127.0.0.1',
    '::1',
    // Add your admin IP addresses here
];

// Security Functions
class SecurityConfig {
    
    /**
     * Set security headers
     */
    public static function setSecurityHeaders() {
        global $security_headers;
        
        foreach ($security_headers as $header => $value) {
            header("$header: $value");
        }
    }
    
    /**
     * Configure secure session settings
     */
    public static function configureSession() {
        // Set secure session parameters
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_secure', 1);
        ini_set('session.use_strict_mode', 1);
        ini_set('session.cookie_samesite', 'Strict');
        ini_set('session.gc_maxlifetime', SESSION_LIFETIME);
        ini_set('session.cookie_lifetime', 0);
        
        // Set session name
        session_name('ECOSHOP_SESSION');
        
        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Regenerate session ID periodically
        if (!isset($_SESSION['last_regeneration'])) {
            $_SESSION['last_regeneration'] = time();
        } elseif (time() - $_SESSION['last_regeneration'] > 300) { // 5 minutes
            session_regenerate_id(true);
            $_SESSION['last_regeneration'] = time();
        }
    }
    
    /**
     * Validate IP address
     */
    public static function validateIP($ip) {
        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
    }
    
    /**
     * Get client IP address
     */
    public static function getClientIP() {
        $ip_keys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (self::validateIP($ip)) {
                        return $ip;
                    }
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Check if IP is whitelisted for admin access
     */
    public static function isAdminIP($ip) {
        global $admin_ip_whitelist;
        return in_array($ip, $admin_ip_whitelist);
    }
    
    /**
     * Generate secure random token
     */
    public static function generateSecureToken($length = CSRF_TOKEN_LENGTH) {
        return bin2hex(random_bytes($length / 2));
    }
    
    /**
     * Validate password strength
     */
    public static function validatePassword($password) {
        if (strlen($password) < PASSWORD_MIN_LENGTH) {
            return false;
        }
        
        if (PASSWORD_REQUIRE_UPPERCASE && !preg_match('/[A-Z]/', $password)) {
            return false;
        }
        
        if (PASSWORD_REQUIRE_LOWERCASE && !preg_match('/[a-z]/', $password)) {
            return false;
        }
        
        if (PASSWORD_REQUIRE_NUMBERS && !preg_match('/[0-9]/', $password)) {
            return false;
        }
        
        if (PASSWORD_REQUIRE_SPECIAL && !preg_match('/[^A-Za-z0-9]/', $password)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Hash password securely
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3
        ]);
    }
    
    /**
     * Verify password
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Sanitize input
     */
    public static function sanitizeInput($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitizeInput'], $input);
        }
        
        $input = trim($input);
        $input = stripslashes($input);
        $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        
        // Remove potentially dangerous characters
        $input = preg_replace('/[<>]/', '', $input);
        
        return $input;
    }
    
    /**
     * Validate email
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) && 
               preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email);
    }
    
    /**
     * Check rate limiting
     */
    public static function checkRateLimit($ip, $action = 'general') {
        $redis = new Redis();
        try {
            $redis->connect('127.0.0.1', 6379);
        } catch (Exception $e) {
            return self::checkFileRateLimit($ip, $action);
        }
        
        $key = "rate_limit:{$action}:{$ip}";
        $limit = ($action === 'login') ? RATE_LIMIT_LOGIN : RATE_LIMIT_API;
        $window = ($action === 'login') ? RATE_LIMIT_WINDOW : RATE_LIMIT_API_WINDOW;
        
        $current = $redis->get($key);
        if ($current === false) {
            $redis->setex($key, $window, 1);
            return true;
        }
        
        if ($current >= $limit) {
            return false;
        }
        
        $redis->incr($key);
        return true;
    }
    
    /**
     * File-based rate limiting fallback
     */
    private static function checkFileRateLimit($ip, $action) {
        $file = "rate_limit_{$action}_{$ip}.txt";
        $limit = ($action === 'login') ? RATE_LIMIT_LOGIN : RATE_LIMIT_API;
        $window = ($action === 'login') ? RATE_LIMIT_WINDOW : RATE_LIMIT_API_WINDOW;
        
        if (file_exists($file)) {
            $data = json_decode(file_get_contents($file), true);
            if (time() - $data['time'] < $window) {
                if ($data['count'] >= $limit) {
                    return false;
                }
                $data['count']++;
            } else {
                $data = ['time' => time(), 'count' => 1];
            }
        } else {
            $data = ['time' => time(), 'count' => 1];
        }
        
        file_put_contents($file, json_encode($data));
        return true;
    }
    
    /**
     * Log security event
     */
    public static function logSecurityEvent($user_id, $action, $risk_level = 'low', $details = []) {
        $pdo = self::getDBConnection();
        if (!$pdo) return;
        
        try {
            $stmt = $pdo->prepare("
                INSERT INTO security_audit (user_id, action, ip_address, user_agent, request_data, risk_level)
                VALUES (:user_id, :action, :ip, :user_agent, :request_data, :risk_level)
            ");
            
            $stmt->execute([
                'user_id' => $user_id,
                'action' => $action,
                'ip' => self::getClientIP(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
                'request_data' => json_encode($details),
                'risk_level' => $risk_level
            ]);
        } catch (PDOException $e) {
            error_log("Security logging failed: " . $e->getMessage());
        }
    }
    
    /**
     * Get database connection
     */
    private static function getDBConnection() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET . " COLLATE utf8mb4_unicode_ci"
            ];
            
            return new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Clean up old security logs
     */
    public static function cleanupOldLogs() {
        $pdo = self::getDBConnection();
        if (!$pdo) return;
        
        try {
            // Clean up old security audit logs (keep last 30 days)
            $stmt = $pdo->prepare("DELETE FROM security_audit WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
            $stmt->execute();
            
            // Clean up old login attempts (keep last 7 days)
            $stmt = $pdo->prepare("DELETE FROM login_attempts WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)");
            $stmt->execute();
            
            // Clean up expired sessions
            $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE expires_at < NOW()");
            $stmt->execute();
            
        } catch (PDOException $e) {
            error_log("Cleanup failed: " . $e->getMessage());
        }
    }
}

// Initialize security configuration
SecurityConfig::setSecurityHeaders();
SecurityConfig::configureSession();

// Error handling
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'error.log');

// Prevent direct access to this file
if (basename($_SERVER['SCRIPT_NAME']) === basename(__FILE__)) {
    http_response_code(403);
    exit('Access denied');
}
?> 