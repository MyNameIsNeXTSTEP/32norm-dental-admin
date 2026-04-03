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

$doctorId = require_auth_user_id();
$pdo = get_db();
$query = $_GET['query'] ?? 'get';

if ($query === 'get') {
    $stmt = $pdo->prepare('
        SELECT category, name, price
        FROM doctor_services
        WHERE doctor_id = :doctor_id
        ORDER BY id ASC
    ');
    $stmt->execute([':doctor_id' => $doctorId]);
    $rows = $stmt->fetchAll();

    $grouped = [];
    foreach ($rows as $row) {
        $cat = $row['category'];
        $priceRaw = $row['price'];
        $price = is_numeric($priceRaw) ? (float)$priceRaw : $priceRaw;
        $grouped[$cat][] = ['name' => $row['name'], 'price' => $price];
    }

    send_json(['ok' => true, 'services' => $grouped]);
}

if ($query === 'add') {
    require_post();
    $payload = get_request_json();

    $category = trim((string)($payload['category'] ?? ''));
    $name = trim((string)($payload['name'] ?? ''));
    $price = trim((string)($payload['price'] ?? ''));

    if ($category === '' || $name === '' || $price === '') {
        send_json(['ok' => false, 'message' => 'Категория, название и цена обязательны'], 422);
    }

    $stmt = $pdo->prepare('
        INSERT INTO doctor_services (doctor_id, category, name, price)
        VALUES (:doctor_id, :category, :name, :price)
    ');
    $stmt->execute([
        ':doctor_id' => $doctorId,
        ':category' => $category,
        ':name' => $name,
        ':price' => $price,
    ]);

    send_json(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
}

if ($query === 'delete') {
    require_post();
    $payload = get_request_json();

    $category = trim((string)($payload['category'] ?? ''));
    $name = trim((string)($payload['name'] ?? ''));

    if ($category === '' || $name === '') {
        send_json(['ok' => false, 'message' => 'Категория и название обязательны'], 422);
    }

    $stmt = $pdo->prepare('
        DELETE FROM doctor_services
        WHERE doctor_id = :doctor_id AND category = :category AND name = :name
    ');
    $stmt->execute([
        ':doctor_id' => $doctorId,
        ':category' => $category,
        ':name' => $name,
    ]);

    send_json(['ok' => true]);
}

send_json(['ok' => false, 'message' => 'Unknown services query'], 400);
