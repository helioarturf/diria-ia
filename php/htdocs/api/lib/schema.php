<?php
/**
 * DirIA Angola — Esquema SQL (MySQL / MariaDB).
 *
 * Cópia fiel de SQL_SCHEMA em server/db.ts, adaptada para execução
 * statement-a-statement pelo PDO.
 */

declare(strict_types=1);

/** Devolve o DDL completo da base de dados DirIA. */
function diria_schema_sql(): string
{
    return <<<'SQL'
-- ==============================================================
-- DirIA Angola — Esquema de Banco de Dados Automatizado (MySQL)
-- Compatível com MySQL 5.7+, MySQL 8.0+ e MariaDB 10.3+
-- ==============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE,
  `role` VARCHAR(64) DEFAULT 'Cidadão / Utente',
  `experience_level` VARCHAR(64) DEFAULT 'Iniciante',
  `response_style` VARCHAR(64) DEFAULT 'Prático & Directo',
  `province` VARCHAR(128) DEFAULT 'Luanda',
  `institution_or_firm` VARCHAR(255) NULL,
  `phone` VARCHAR(64) NULL,
  `oaa_number` VARCHAR(64) NULL,
  `password_hash` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `consultations` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(128) NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` VARCHAR(64) PRIMARY KEY,
  `consultation_id` VARCHAR(64) NOT NULL,
  `role` ENUM('user', 'assistant') NOT NULL,
  `content` MEDIUMTEXT NOT NULL,
  `citation_law` VARCHAR(255) NULL,
  `citation_article` VARCHAR(128) NULL,
  `citation_text` TEXT NULL,
  `complexity` VARCHAR(32) NULL,
  `suggestions_json` TEXT NULL,
  `audio_duration` VARCHAR(32) NULL,
  `attached_doc_name` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lawyers` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `oaa_number` VARCHAR(64) NOT NULL,
  `location` VARCHAR(128) NOT NULL,
  `specialty` VARCHAR(128) NOT NULL,
  `phone` VARCHAR(64) NULL,
  `email` VARCHAR(255) NULL,
  `photo_url` TEXT NULL,
  `available` TINYINT(1) DEFAULT 1,
  `entity_type` VARCHAR(64) DEFAULT 'Advogado Singular',
  `province` VARCHAR(128) DEFAULT 'Luanda',
  `address` TEXT NULL,
  `bio` TEXT NULL,
  `website` VARCHAR(255) NULL,
  `verified_oaa` TINYINT(1) DEFAULT 1,
  `rating` DECIMAL(2,1) DEFAULT 5.0,
  `review_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_documents` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(128) NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `status` VARCHAR(64) DEFAULT 'Finalizado',
  `content` LONGTEXT NOT NULL,
  `description` TEXT NULL,
  `file_size` VARCHAR(32) NULL,
  `lawyer_name` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `consultation_requests` (
  `id` VARCHAR(64) PRIMARY KEY,
  `lawyer_id` VARCHAR(64) NOT NULL,
  `lawyer_name` VARCHAR(255) NOT NULL,
  `client_name` VARCHAR(255) NOT NULL,
  `client_phone` VARCHAR(64) NOT NULL,
  `preferred_date` VARCHAR(64) NOT NULL,
  `scheduled_date` VARCHAR(64) NULL,
  `scheduled_time` VARCHAR(64) NULL,
  `modality` VARCHAR(64) DEFAULT 'Presencial',
  `subject` TEXT NOT NULL,
  `status` VARCHAR(32) DEFAULT 'Pendente',
  `estimated_fee` VARCHAR(64) NULL,
  `case_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lawyer_reviews` (
  `id` VARCHAR(64) PRIMARY KEY,
  `lawyer_id` VARCHAR(64) NOT NULL,
  `author_name` VARCHAR(255) NOT NULL,
  `author_role` VARCHAR(128) NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `comment` TEXT NOT NULL,
  `date` VARCHAR(64) NOT NULL,
  `verified` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `labor_simulations` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NULL,
  `monthly_salary` DECIMAL(14,2) NOT NULL,
  `years_service` INT NOT NULL,
  `months_service` INT NOT NULL,
  `notice_given` TINYINT(1) DEFAULT 0,
  `compensation_amount` DECIMAL(14,2) NOT NULL,
  `gross_total` DECIMAL(14,2) NOT NULL,
  `net_total` DECIMAL(14,2) NOT NULL,
  `legal_basis` VARCHAR(255) DEFAULT 'Lei Geral do Trabalho Lei 12/23',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cpanel_system_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(64) NOT NULL,
  `message` TEXT NOT NULL,
  `environment` VARCHAR(64) DEFAULT 'cpanel',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL;
}

/**
 * Devolve as instruções DDL individuais (sem comentários nem vazias).
 *
 * @return array<int,string>
 */
function diria_schema_statements(): array
{
    $sql = diria_schema_sql();
    $lines = preg_split('/\r\n|\r|\n/', $sql) ?: [];
    $clean = [];

    foreach ($lines as $line) {
        $trimmed = ltrim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '--')) {
            continue;
        }
        $clean[] = $line;
    }

    $statements = [];
    foreach (explode(';', implode("\n", $clean)) as $statement) {
        $statement = trim($statement);
        if ($statement !== '') {
            $statements[] = $statement;
        }
    }

    return $statements;
}
