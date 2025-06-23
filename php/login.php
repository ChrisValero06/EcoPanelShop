<?php
// Security headers
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com cdnjs.cloudflare.com; font-src fonts.gstatic.com; img-src 'self' data: https:;");

// Start session with secure settings
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_samesite', 'Strict');
session_start();

// Database configuration
$config = [
    'host' => 'localhost',
    'dbname' => 'ecoshop_db',
    'username' => 'ecoshop_user',
    'password' => 'your_secure_password_here',
    'charset' => 'utf8mb4'
];

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'error.log');

// CSRF Protection
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Rate limiting
function checkRateLimit($ip, $action = 'login') {
    $redis = new Redis();
    try {
        $redis->connect('127.0.0.1', 6379);
    } catch (Exception $e) {
        // Fallback to file-based rate limiting
        return checkFileRateLimit($ip, $action);
    }
    
    $key = "rate_limit:{$action}:{$ip}";
    $limit = ($action === 'login') ? 5 : 10; // 5 login attempts, 10 other requests
    $window = 900; // 15 minutes
    
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

function checkFileRateLimit($ip, $action) {
    $file = "rate_limit_{$action}_{$ip}.txt";
    $limit = ($action === 'login') ? 5 : 10;
    $window = 900;
    
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

// Input sanitization and validation
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    
    $input = trim($input);
    $input = stripslashes($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    
    // Remove potentially dangerous characters
    $input = preg_replace('/[<>]/', '', $input);
    
    return $input;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) && 
           preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email);
}

function validatePassword($password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return strlen($password) >= 8 && 
           preg_match('/[A-Z]/', $password) && 
           preg_match('/[a-z]/', $password) && 
           preg_match('/[0-9]/', $password);
}

// Database connection with PDO
function getDBConnection() {
    global $config;
    
    try {
        $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        
        $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return false;
    }
}

// Secure password hashing
function hashPassword($password) {
    return password_hash($password, PASSWORD_ARGON2ID, [
        'memory_cost' => 65536,
        'time_cost' => 4,
        'threads' => 3
    ]);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// User authentication
function authenticateUser($email, $password) {
    $pdo = getDBConnection();
    if (!$pdo) {
        return ['success' => false, 'message' => 'Error de conexión a la base de datos'];
    }
    
    try {
        // Use prepared statement to prevent SQL injection
        $stmt = $pdo->prepare("
            SELECT id, email, password_hash, first_name, last_name, role, is_active, 
                   failed_attempts, last_failed_attempt, created_at
            FROM users 
            WHERE email = :email AND is_active = 1
        ");
        
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return ['success' => false, 'message' => 'Credenciales incorrectas'];
        }
        
        // Check for account lockout
        if ($user['failed_attempts'] >= 5) {
            $lockoutTime = 900; // 15 minutes
            if (time() - strtotime($user['last_failed_attempt']) < $lockoutTime) {
                return ['success' => false, 'message' => 'Cuenta bloqueada temporalmente. Intenta de nuevo en 15 minutos.'];
            } else {
                // Reset failed attempts after lockout period
                $resetStmt = $pdo->prepare("UPDATE users SET failed_attempts = 0 WHERE id = :id");
                $resetStmt->execute(['id' => $user['id']]);
                $user['failed_attempts'] = 0;
            }
        }
        
        // Verify password
        if (!verifyPassword($password, $user['password_hash'])) {
            // Increment failed attempts
            $failedAttempts = $user['failed_attempts'] + 1;
            $updateStmt = $pdo->prepare("
                UPDATE users 
                SET failed_attempts = :failed_attempts, last_failed_attempt = NOW() 
                WHERE id = :id
            ");
            $updateStmt->execute([
                'failed_attempts' => $failedAttempts,
                'id' => $user['id']
            ]);
            
            return ['success' => false, 'message' => 'Credenciales incorrectas'];
        }
        
        // Reset failed attempts on successful login
        if ($user['failed_attempts'] > 0) {
            $resetStmt = $pdo->prepare("UPDATE users SET failed_attempts = 0 WHERE id = :id");
            $resetStmt->execute(['id' => $user['id']]);
        }
        
        // Generate session token
        $sessionToken = bin2hex(random_bytes(32));
        
        // Store session data
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['last_name'] = $user['last_name'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['session_token'] = $sessionToken;
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        
        // Update last login time
        $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
        $updateStmt->execute(['id' => $user['id']]);
        
        // Log successful login
        logActivity($user['id'], 'login_success', $_SERVER['REMOTE_ADDR']);
        
        return [
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'role' => $user['role']
            ]
        ];
        
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return ['success' => false, 'message' => 'Error interno del servidor'];
    }
}

// Activity logging
function logActivity($userId, $action, $ip) {
    $pdo = getDBConnection();
    if (!$pdo) return;
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO user_activity (user_id, action, ip_address, user_agent, created_at)
            VALUES (:user_id, :action, :ip, :user_agent, NOW())
        ");
        
        $stmt->execute([
            'user_id' => $userId,
            'action' => $action,
            'ip' => $ip,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        ]);
    } catch (PDOException $e) {
        error_log("Activity logging failed: " . $e->getMessage());
    }
}

// Main login handler
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check rate limiting
    $clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (!checkRateLimit($clientIP, 'login')) {
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Demasiados intentos. Intenta de nuevo en 15 minutos.']);
        exit;
    }
    
    // Validate CSRF token
    $csrfToken = $_POST['csrf_token'] ?? '';
    if (!validateCSRFToken($csrfToken)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Token de seguridad inválido']);
        exit;
    }
    
    // Sanitize inputs
    $email = sanitizeInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);
    
    // Validate inputs
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Por favor, completa todos los campos']);
        exit;
    }
    
    if (!validateEmail($email)) {
        echo json_encode(['success' => false, 'message' => 'Formato de email inválido']);
        exit;
    }
    
    if (!validatePassword($password)) {
        echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número']);
        exit;
    }
    
    // Attempt authentication
    $result = authenticateUser($email, $password);
    
    if ($result['success']) {
        // Set remember me cookie if requested
        if ($remember) {
            $token = bin2hex(random_bytes(32));
            $expires = time() + (30 * 24 * 60 * 60); // 30 days
            
            setcookie('remember_token', $token, $expires, '/', '', true, true);
            
            // Store token in database
            $pdo = getDBConnection();
            if ($pdo) {
                $stmt = $pdo->prepare("
                    INSERT INTO remember_tokens (user_id, token, expires_at, created_at)
                    VALUES (:user_id, :token, FROM_UNIXTIME(:expires), NOW())
                ");
                $stmt->execute([
                    'user_id' => $result['user']['id'],
                    'token' => $token,
                    'expires' => $expires
                ]);
            }
        }
        
        // Log failed attempt for security
        logActivity($result['user']['id'], 'login_success', $clientIP);
        
        echo json_encode($result);
    } else {
        // Log failed attempt
        $pdo = getDBConnection();
        if ($pdo) {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch();
            if ($user) {
                logActivity($user['id'], 'login_failed', $clientIP);
            }
        }
        
        echo json_encode($result);
    }
    
} else {
    // Handle GET request (show login form)
    $csrfToken = generateCSRFToken();
    header('Content-Type: text/html; charset=utf-8');
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EcoShop - Iniciar Sesión</title>
        <link rel="stylesheet" href="login-styles.css">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body>
        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <div class="logo">
                        <h2>EcoShop</h2>
                    </div>
                    <h1>Iniciar Sesión</h1>
                    <p>Accede a tu cuenta para continuar</p>
                </div>

                <form id="loginForm" class="login-form" method="POST">
                    <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrfToken); ?>">
                    
                    <div class="form-group">
                        <label for="email">
                            <i class="fas fa-envelope"></i>
                            Correo Electrónico
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required 
                            placeholder="tu@email.com"
                            autocomplete="email"
                        >
                    </div>

                    <div class="form-group">
                        <label for="password">
                            <i class="fas fa-lock"></i>
                            Contraseña
                        </label>
                        <div class="password-input">
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                required 
                                placeholder="Tu contraseña"
                                autocomplete="current-password"
                            >
                            <button type="button" class="toggle-password" onclick="togglePassword()">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="form-options">
                        <label class="checkbox-container">
                            <input type="checkbox" name="remember" id="remember">
                            <span class="checkmark"></span>
                            Recordarme
                        </label>
                        <a href="forgot-password.php" class="forgot-link">¿Olvidaste tu contraseña?</a>
                    </div>

                    <div id="error-message" class="error-message" style="display: none;"></div>
                    <div id="success-message" class="success-message" style="display: none;"></div>

                    <button type="submit" class="login-btn">
                        <span class="btn-text">Iniciar Sesión</span>
                        <span class="btn-loading" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i>
                            Iniciando...
                        </span>
                    </button>
                </form>

                <div class="login-divider">
                    <span>o</span>
                </div>

                <div class="social-login">
                    <button class="social-btn google-btn">
                        <i class="fab fa-google"></i>
                        Continuar con Google
                    </button>
                    <button class="social-btn facebook-btn">
                        <i class="fab fa-facebook-f"></i>
                        Continuar con Facebook
                    </button>
                </div>

                <div class="login-footer">
                    <p>¿No tienes una cuenta? <a href="register.php">Regístrate aquí</a></p>
                    <a href="index.html" class="back-home">
                        <i class="fas fa-arrow-left"></i>
                        Volver al inicio
                    </a>
                </div>
            </div>

            <div class="login-image">
                <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80" alt="Paneles Solares">
                <div class="image-overlay">
                    <h2>Bienvenido de vuelta</h2>
                    <p>Accede a tu cuenta para gestionar tus pedidos y obtener ofertas exclusivas</p>
                </div>
            </div>
        </div>

        <script src="login.js"></script>
    </body>
    </html>
    <?php
}
?> 