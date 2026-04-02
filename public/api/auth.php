<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$action = $_GET['action'] ?? 'session';

if ($action === 'session') {
    start_app_session();
    $doctorId = $_SESSION['doctor_id'] ?? null;
    if (!is_int($doctorId)) {
        send_json(['ok' => true, 'authenticated' => false, 'user' => null]);
    }

    $pdo = get_db();
    $stmt = $pdo->prepare('SELECT id, login, display_name FROM doctors WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $doctorId]);
    $doctor = $stmt->fetch();

    if (!$doctor) {
        session_destroy();
        send_json(['ok' => true, 'authenticated' => false, 'user' => null]);
    }

    send_json(['ok' => true, 'authenticated' => true, 'user' => $doctor]);
}

if ($action === 'logout') {
    require_post();
    start_app_session();
    $_SESSION = [];
    session_destroy();
    send_json(['ok' => true]);
}

if ($action !== 'login') {
    send_json(['ok' => false, 'message' => 'Unknown auth action'], 400);
}

require_post();
$payload = get_request_json();
$login = trim((string)($payload['login'] ?? ''));
$password = (string)($payload['password'] ?? '');

if ($login === '' || $password === '') {
    send_json(['ok' => false, 'message' => 'Логин и пароль обязательны'], 422);
}

$pdo = get_db();
$stmt = $pdo->prepare('SELECT id, login, display_name, password_hash, is_active FROM doctors WHERE login = :login LIMIT 1');
$stmt->execute([':login' => $login]);
$doctor = $stmt->fetch();

if (!$doctor || (int)$doctor['is_active'] !== 1) {
    send_json(['ok' => false, 'message' => 'Пользователь не найден или заблокирован'], 401);
}

if (!password_verify($password, (string)$doctor['password_hash'])) {
    send_json(['ok' => false, 'message' => 'Неверный пароль'], 401);
}

start_app_session();
session_regenerate_id(true);
$_SESSION['doctor_id'] = (int)$doctor['id'];

send_json([
    'ok' => true,
    'user' => [
        'id' => (int)$doctor['id'],
        'login' => (string)$doctor['login'],
        'display_name' => (string)$doctor['display_name'],
    ],
]);
