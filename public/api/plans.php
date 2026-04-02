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
$query = $_GET['query'] ?? 'list';

if ($query === 'list') {
    $stmt = $pdo->prepare('
        SELECT id, patient_name, doctor_name, plan_date, updated_at
        FROM treatment_plans
        WHERE doctor_id = :doctor_id
        ORDER BY updated_at DESC
        LIMIT 300
    ');
    $stmt->execute([':doctor_id' => $doctorId]);
    send_json(['ok' => true, 'plans' => $stmt->fetchAll()]);
}

if ($query === 'get') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        send_json(['ok' => false, 'message' => 'Некорректный id'], 422);
    }
    $stmt = $pdo->prepare('
        SELECT id, patient_name, doctor_name, plan_date, plan_items_json, services_snapshot_json
        FROM treatment_plans
        WHERE id = :id AND doctor_id = :doctor_id
        LIMIT 1
    ');
    $stmt->execute([':id' => $id, ':doctor_id' => $doctorId]);
    $row = $stmt->fetch();
    if (!$row) {
        send_json(['ok' => false, 'message' => 'План не найден'], 404);
    }
    send_json([
        'ok' => true,
        'plan' => [
            'id' => (int)$row['id'],
            'patient_name' => (string)$row['patient_name'],
            'doctor_name' => (string)$row['doctor_name'],
            'plan_date' => (string)$row['plan_date'],
            'plan_items' => json_decode((string)$row['plan_items_json'], true) ?: [],
            'services_snapshot' => json_decode((string)$row['services_snapshot_json'], true) ?: [],
        ],
    ]);
}

if ($query === 'save') {
    require_post();
    $payload = get_request_json();

    $patientName = trim((string)($payload['patient_name'] ?? ''));
    $doctorName = trim((string)($payload['doctor_name'] ?? ''));
    $planDate = trim((string)($payload['plan_date'] ?? ''));
    $planItems = $payload['plan_items'] ?? [];
    $servicesSnapshot = $payload['services_snapshot'] ?? [];

    if ($patientName === '') {
        send_json(['ok' => false, 'message' => 'Имя пациента обязательно'], 422);
    }
    if ($doctorName === '') {
        send_json(['ok' => false, 'message' => 'Имя врача обязательно'], 422);
    }
    if ($planDate === '') {
        send_json(['ok' => false, 'message' => 'Дата обязательна'], 422);
    }
    if (!is_array($planItems)) {
        send_json(['ok' => false, 'message' => 'Некорректные элементы плана'], 422);
    }
    if (!is_array($servicesSnapshot)) {
        $servicesSnapshot = [];
    }

    $stmt = $pdo->prepare('
        INSERT INTO treatment_plans (
            doctor_id, patient_name, doctor_name, plan_date, plan_items_json, services_snapshot_json
        ) VALUES (
            :doctor_id, :patient_name, :doctor_name, :plan_date, :plan_items_json, :services_snapshot_json
        )
    ');
    $stmt->execute([
        ':doctor_id' => $doctorId,
        ':patient_name' => $patientName,
        ':doctor_name' => $doctorName,
        ':plan_date' => $planDate,
        ':plan_items_json' => json_encode($planItems, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':services_snapshot_json' => json_encode($servicesSnapshot, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);

    send_json(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
}

if ($query === 'delete') {
    require_post();
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        send_json(['ok' => false, 'message' => 'Некорректный id'], 422);
    }
    $stmt = $pdo->prepare('DELETE FROM treatment_plans WHERE id = :id AND doctor_id = :doctor_id');
    $stmt->execute([':id' => $id, ':doctor_id' => $doctorId]);
    send_json(['ok' => true]);
}

send_json(['ok' => false, 'message' => 'Unknown plans query'], 400);
