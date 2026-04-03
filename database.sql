CREATE TABLE IF NOT EXISTS doctors (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    login VARCHAR(64) NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_doctors_login (login)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS treatment_plans (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    doctor_id INT UNSIGNED NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    plan_date DATE NOT NULL,
    plan_items_json LONGTEXT NOT NULL,
    services_snapshot_json LONGTEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_plans_doctor_updated (doctor_id, updated_at),
    CONSTRAINT fk_plans_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS doctor_services (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    doctor_id INT UNSIGNED NOT NULL,
    category VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_doctor_services_doctor (doctor_id),
    CONSTRAINT fk_doctor_services_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create first doctor manually by replacing PASSWORD_HASH:
-- Example hash generation:
-- php -r "echo password_hash('ChangeStrongPass123!', PASSWORD_DEFAULT), PHP_EOL;"
INSERT INTO doctors (login, display_name, password_hash, is_active)
VALUES ('doctor_admin', 'Главный врач', '$2y$10$Wg/dgZlqkYFe8x3ASISVGuWoOa9airlPSEwSGduCiNkVzabKcsqMG', 1);
