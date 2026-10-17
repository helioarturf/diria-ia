import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const LOCAL_DB_PATH = path.join(DATA_DIR, 'diria_db.json');

// Ensure data directory exists for self-contained persistence
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface DbConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  cpanelHost?: string;
  cpanelPort?: number;
  cpanelUser?: string;
  cpanelApiToken?: string;
}

export interface DbStatus {
  success: boolean;
  mode: 'mysql' | 'self-contained';
  databaseName: string;
  host?: string;
  port?: number | string;
  user?: string;
  connected: boolean;
  tablesCount: number;
  tables: string[];
  seeded: boolean;
  message: string;
  recordsSummary: {
    users: number;
    lawyers: number;
    consultations: number;
    documents: number;
    laborSimulations: number;
  };
  cpanelDetected: boolean;
  cpanelUser?: string;
  timestamp: string;
}

// SQL Schema for cPanel MySQL / MariaDB
export const SQL_SCHEMA = `
-- ==============================================================
-- DirIA Angola — Esquema de Banco de Dados Automatizado para cPanel
-- Compatível com MySQL 5.7+, MySQL 8.0+ e MariaDB 10.3+
-- ==============================================================

CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) UNIQUE,
  \`role\` VARCHAR(64) DEFAULT 'Cidadão / Utente',
  \`experience_level\` VARCHAR(64) DEFAULT 'Iniciante',
  \`response_style\` VARCHAR(64) DEFAULT 'Prático & Directo',
  \`province\` VARCHAR(128) DEFAULT 'Luanda',
  \`institution_or_firm\` VARCHAR(255) NULL,
  \`phone\` VARCHAR(64) NULL,
  \`oaa_number\` VARCHAR(64) NULL,
  \`password_hash\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`consultations\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`user_id\` VARCHAR(64) NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`category\` VARCHAR(128) NOT NULL,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`messages\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`consultation_id\` VARCHAR(64) NOT NULL,
  \`role\` ENUM('user', 'assistant') NOT NULL,
  \`content\` MEDIUMTEXT NOT NULL,
  \`citation_law\` VARCHAR(255) NULL,
  \`citation_article\` VARCHAR(128) NULL,
  \`citation_text\` TEXT NULL,
  \`complexity\` VARCHAR(32) NULL,
  \`suggestions_json\` TEXT NULL,
  \`audio_duration\` VARCHAR(32) NULL,
  \`attached_doc_name\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`lawyers\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`oaa_number\` VARCHAR(64) NOT NULL,
  \`location\` VARCHAR(128) NOT NULL,
  \`specialty\` VARCHAR(128) NOT NULL,
  \`phone\` VARCHAR(64) NULL,
  \`email\` VARCHAR(255) NULL,
  \`photo_url\` TEXT NULL,
  \`available\` TINYINT(1) DEFAULT 1,
  \`entity_type\` VARCHAR(64) DEFAULT 'Advogado Singular',
  \`province\` VARCHAR(128) DEFAULT 'Luanda',
  \`address\` TEXT NULL,
  \`bio\` TEXT NULL,
  \`website\` VARCHAR(255) NULL,
  \`verified_oaa\` TINYINT(1) DEFAULT 1,
  \`rating\` DECIMAL(2,1) DEFAULT 5.0,
  \`review_count\` INT DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`user_documents\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`user_id\` VARCHAR(64) NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`category\` VARCHAR(128) NOT NULL,
  \`type\` VARCHAR(64) NOT NULL,
  \`status\` VARCHAR(64) DEFAULT 'Finalizado',
  \`content\` LONGTEXT NOT NULL,
  \`description\` TEXT NULL,
  \`file_size\` VARCHAR(32) NULL,
  \`lawyer_name\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`consultation_requests\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`lawyer_id\` VARCHAR(64) NOT NULL,
  \`lawyer_name\` VARCHAR(255) NOT NULL,
  \`client_name\` VARCHAR(255) NOT NULL,
  \`client_phone\` VARCHAR(64) NOT NULL,
  \`preferred_date\` VARCHAR(64) NOT NULL,
  \`scheduled_date\` VARCHAR(64) NULL,
  \`scheduled_time\` VARCHAR(64) NULL,
  \`modality\` VARCHAR(64) DEFAULT 'Presencial',
  \`subject\` TEXT NOT NULL,
  \`status\` VARCHAR(32) DEFAULT 'Pendente',
  \`estimated_fee\` VARCHAR(64) NULL,
  \`case_notes\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`lawyer_reviews\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`lawyer_id\` VARCHAR(64) NOT NULL,
  \`author_name\` VARCHAR(255) NOT NULL,
  \`author_role\` VARCHAR(128) NULL,
  \`rating\` INT NOT NULL DEFAULT 5,
  \`comment\` TEXT NOT NULL,
  \`date\` VARCHAR(64) NOT NULL,
  \`verified\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`labor_simulations\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`user_id\` VARCHAR(64) NULL,
  \`monthly_salary\` DECIMAL(14,2) NOT NULL,
  \`years_service\` INT NOT NULL,
  \`months_service\` INT NOT NULL,
  \`notice_given\` TINYINT(1) DEFAULT 0,
  \`compensation_amount\` DECIMAL(14,2) NOT NULL,
  \`gross_total\` DECIMAL(14,2) NOT NULL,
  \`net_total\` DECIMAL(14,2) NOT NULL,
  \`legal_basis\` VARCHAR(255) DEFAULT 'Lei Geral do Trabalho Lei 12/23',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`cpanel_system_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`event_type\` VARCHAR(64) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`environment\` VARCHAR(64) DEFAULT 'cpanel',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Initial seed data
const DEFAULT_LAWYERS = [
  {
    id: 'lawyer-1',
    name: 'Dr. Manuel Domingos Gaspar',
    oaaNumber: 'OAA 3.412',
    location: 'Luanda — Ingombota',
    specialty: 'Direito Laboral & Contencioso Social',
    phone: '+244 923 445 110',
    email: 'm.gaspar.adv@oaa.ao',
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&h=200&fit=crop&crop=face',
    available: 1,
    entityType: 'Advogado Singular',
    province: 'Luanda',
    address: 'Rua Rainha Ginga, Edifício Rei Katyavala, 4.º Andar',
    bio: 'Patrono com mais de 16 anos de prática forense perante as Salas de Trabalho dos Tribunais de Comarca de Luanda e Viana.',
    verifiedOaa: 1,
    rating: 4.9,
    reviewCount: 38,
  },
  {
    id: 'lawyer-2',
    name: 'Dra. Ana Paula Tchissola',
    oaaNumber: 'OAA 4.890',
    location: 'Luanda — Talatona / Belas',
    specialty: 'Direito Comercial & Societário',
    phone: '+244 931 880 234',
    email: 'ana.tchissola@legalangola.co.ao',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    available: 1,
    entityType: 'Sociedade de Advogados / Escritório',
    province: 'Luanda',
    address: 'Condomínio Cidade Financeira, Bloco 2, Talatona',
    bio: 'Especialista em investimento privado (AIPEX), constituição célere de sociedades no GUE e assessoria de fusões e aquisições.',
    verifiedOaa: 1,
    rating: 5.0,
    reviewCount: 42,
  },
  {
    id: 'lawyer-3',
    name: 'Dr. Afonso Kiala',
    oaaNumber: 'OAA 2.115',
    location: 'Benguela — Centro',
    specialty: 'Direito Imobiliário & Arrendamento',
    phone: '+244 924 112 990',
    email: 'afonso.kiala@benguela-adv.ao',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    available: 1,
    entityType: 'Advogado Singular',
    province: 'Benguela',
    address: 'Avenida Norton de Matos, Benguela Comarca',
    bio: 'Mais de 20 anos na defesa de litígios fundiários, desapropriações e contratos de arrendamento sob a Lei 26/15.',
    verifiedOaa: 1,
    rating: 4.8,
    reviewCount: 29,
  },
];

const INITIAL_CONSULTATION = {
  id: 'consult-1',
  title: 'Rescisão Contratual & Compensação',
  category: 'Direito Laboral',
  messages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Fui despedido sem aviso prévio após 4 anos numa empresa privada em Viana. Tenho direito legal a indemnização?',
      citation_law: null,
      citation_article: null,
      citation_text: null,
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: 'Sim. Nos termos da legislação laboral de Angola, a cessação do contrato promovida pelo empregador sem justa causa comprovada constitui despedimento ilícito, gerando obrigação compensatória imediata.\n\nTendo 4 anos de antiguidade, o cálculo inicial contempla o salário-base mensal multiplicado pelo coeficiente temporal, acrescido do salário de pré-aviso devido.',
      citation_law: 'Lei Geral do Trabalho de Angola (Lei n.º 12/23)',
      citation_article: 'Art.º 232.º',
      citation_text: 'A cessação sem justa causa confere ao trabalhador compensação pecuniária correspondente ao tempo efectivo de serviço, acrescida do vencimento correspondente ao aviso prévio em falta e proporcionais de férias e subsídio de Natal.',
      complexity: 'Elevada',
      suggestions: ['Como formalizar queixa na IGT Luanda?', 'Minuta de interpelação para devolução de documentos e créditos'],
      audioDuration: '0:24',
    },
  ],
};

class DatabaseManager {
  private mode: 'mysql' | 'self-contained' = 'self-contained';
  private pool: mysql.Pool | null = null;
  private isInitialized = false;
  private localData: any = null;

  constructor() {
    this.loadLocalData();
  }

  // Load self-contained local JSON store
  private loadLocalData() {
    try {
      if (fs.existsSync(LOCAL_DB_PATH)) {
        const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
        this.localData = JSON.parse(raw);
      } else {
        this.localData = {
          users: [
            {
              id: 'user-admin',
              name: 'Administrador DirIA',
              email: 'admin@diria.ao',
              role: 'Advogado / Jurista',
              province: 'Luanda',
              created_at: new Date().toISOString(),
            },
          ],
          consultations: [INITIAL_CONSULTATION],
          lawyers: DEFAULT_LAWYERS,
          user_documents: [
            {
              id: 'doc-1',
              title: 'Minuta de Contrato de Arrendamento Urbano (Lei 26/15)',
              category: 'Direito Imobiliário',
              type: 'Minuta',
              status: 'Finalizado',
              content: 'CONTRATO DE ARRENDAMENTO URBANO PARA FINS HABITACIONAIS...',
              file_size: '24 KB',
              created_at: new Date().toISOString(),
            },
            {
              id: 'doc-2',
              title: 'Auto de Notificação e Queixa à IGT (Lei 12/23)',
              category: 'Direito Laboral',
              type: 'Petição Forense',
              status: 'Finalizado',
              content: 'À INSPECÇÃO GERAL DO TRABALHO DE LUANDA...',
              file_size: '18 KB',
              created_at: new Date().toISOString(),
            },
          ],
          consultation_requests: [],
          lawyer_reviews: [],
          labor_simulations: [
            {
              id: 'sim-1',
              monthly_salary: 250000,
              years_service: 4,
              months_service: 0,
              notice_given: 0,
              compensation_amount: 1000000,
              gross_total: 1250000,
              net_total: 1145000,
              legal_basis: 'Lei Geral do Trabalho Lei 12/23',
              created_at: new Date().toISOString(),
            },
          ],
          cpanel_system_logs: [
            {
              id: 1,
              event_type: 'INITIAL_BOOT',
              message: 'Banco de dados autocontido inicializado com sucesso para ambiente cPanel.',
              environment: 'cpanel',
              created_at: new Date().toISOString(),
            },
          ],
        };
        this.saveLocalData();
      }
    } catch (err) {
      console.error('Erro ao ler banco de dados local:', err);
    }
  }

  private saveLocalData() {
    try {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(this.localData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erro ao salvar banco de dados local:', err);
    }
  }

  // Detect cPanel username from environment or OS
  public detectCpanelEnvironment(): { isCpanel: boolean; cpanelUser?: string } {
    const user =
      process.env.CPANEL_USER ||
      process.env.USER ||
      process.env.LOGNAME ||
      (process.env.HOME && process.env.HOME.includes('/home/') ? process.env.HOME.split('/')[2] : undefined);

    const isCpanel =
      Boolean(process.env.CPANEL_HOST || process.env.CPANEL_API_TOKEN) ||
      (process.env.HOME ? process.env.HOME.includes('/home/') && !process.env.HOME.includes('/root') : false);

    return { isCpanel, cpanelUser: user };
  }

  // Automatically provision database on cPanel
  public async autoProvision(customConfig?: DbConfig): Promise<DbStatus> {
    const envUser = process.env.DB_USER || customConfig?.user;
    const envPass = process.env.DB_PASSWORD || process.env.DB_PASS || customConfig?.password;
    const envHost = process.env.DB_HOST || customConfig?.host || 'localhost';
    const envPort = Number(process.env.DB_PORT || customConfig?.port || 3306);
    
    const { cpanelUser } = this.detectCpanelEnvironment();
    // In cPanel, database names often have prefix cpaneluser_dbname
    const defaultDbName = cpanelUser ? `${cpanelUser}_diria` : 'diria_angola';
    const envDbName = process.env.DB_NAME || customConfig?.database || defaultDbName;

    // Try connecting to MySQL/MariaDB if credentials are provided or if standard cPanel MySQL is present
    if (envUser !== undefined && envUser !== '') {
      try {
        console.log(`[DirIA cPanel DB] Tentando conectar ao MySQL em ${envHost}:${envPort} como ${envUser}...`);

        // Connect first without database name to ensure the database can be created
        let connection: mysql.Connection | null = null;
        try {
          connection = await mysql.createConnection({
            host: envHost,
            port: envPort,
            user: envUser,
            password: envPass || '',
          });

          console.log(`[DirIA cPanel DB] Conexão MySQL estabelecida. Criando banco '${envDbName}' se não existir...`);
          await connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${envDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
          );
          await connection.end();
        } catch (dbCreateErr: any) {
          console.warn(`[DirIA cPanel DB] Nota ao criar banco '${envDbName}' diretamente:`, dbCreateErr?.message);
          // In shared cPanel, user might only have rights to access an already assigned database name
          // Proceed to connect directly to the database
          if (connection) {
            try { await connection.end(); } catch (_) {}
          }
        }

        // Now connect to the target database
        this.pool = mysql.createPool({
          host: envHost,
          port: envPort,
          user: envUser,
          password: envPass || '',
          database: envDbName,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });

        // Test connection
        const conn = await this.pool.getConnection();
        console.log(`[DirIA cPanel DB] Conectado com sucesso ao banco '${envDbName}'! Executando esquema DDL...`);

        // Split and execute SQL schema
        const statements = SQL_SCHEMA.split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith('--'));

        for (const sql of statements) {
          await conn.query(sql);
        }

        // Seed initial lawyers if empty
        const [lawyerRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM lawyers');
        if (lawyerRows && lawyerRows[0] && lawyerRows[0].cnt === 0) {
          console.log('[DirIA cPanel DB] Populando directório inicial de advogados da OAA no MySQL...');
          for (const l of DEFAULT_LAWYERS) {
            await conn.query(
              `INSERT INTO lawyers (id, name, oaa_number, location, specialty, phone, email, photo_url, available, entity_type, province, address, bio, verified_oaa, rating, review_count)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                l.id,
                l.name,
                l.oaaNumber,
                l.location,
                l.specialty,
                l.phone,
                l.email,
                l.photoUrl,
                l.available,
                l.entityType,
                l.province,
                l.address,
                l.bio,
                l.verifiedOaa,
                l.rating,
                l.reviewCount,
              ]
            );
          }
        }

        // Seed initial consultation if empty
        const [consultRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM consultations');
        if (consultRows && consultRows[0] && consultRows[0].cnt === 0) {
          await conn.query(
            `INSERT INTO consultations (id, title, category) VALUES (?, ?, ?)`,
            [INITIAL_CONSULTATION.id, INITIAL_CONSULTATION.title, INITIAL_CONSULTATION.category]
          );
          for (const m of INITIAL_CONSULTATION.messages) {
            await conn.query(
              `INSERT INTO messages (id, consultation_id, role, content, citation_law, citation_article, citation_text, complexity, audio_duration)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                m.id,
                INITIAL_CONSULTATION.id,
                m.role,
                m.content,
                m.citation_law || null,
                m.citation_article || null,
                m.citation_text || null,
                (m as any).complexity || null,
                (m as any).audioDuration || null,
              ]
            );
          }
        }

        // Log setup in cPanel audit table
        await conn.query(
          `INSERT INTO cpanel_system_logs (event_type, message, environment) VALUES (?, ?, ?)`,
          [
            'AUTO_PROVISION_SUCCESS',
            `Banco ${envDbName} criado e migrado com sucesso no MySQL do cPanel.`,
            'cpanel-mysql',
          ]
        );

        conn.release();

        this.mode = 'mysql';
        this.isInitialized = true;

        return await this.getStatus();
      } catch (mysqlErr: any) {
        console.warn(
          `[DirIA cPanel DB] Conexão MySQL não estabelecida (${mysqlErr?.message}). Alternando automaticamente para o motor autocontido integrado...`
        );
      }
    }

    // Default Fallback: Self-Contained Local Database Engine
    this.mode = 'self-contained';
    this.loadLocalData();
    this.isInitialized = true;

    return await this.getStatus();
  }

  // Get current status of database
  public async getStatus(): Promise<DbStatus> {
    const { isCpanel, cpanelUser } = this.detectCpanelEnvironment();
    const defaultDbName = cpanelUser ? `${cpanelUser}_diria` : 'diria_angola';

    if (this.mode === 'mysql' && this.pool) {
      try {
        const conn = await this.pool.getConnection();
        const [tables]: any = await conn.query('SHOW TABLES');
        const tableNames = tables.map((t: any) => Object.values(t)[0] as string);

        const [usersCount]: any = await conn.query('SELECT COUNT(*) as c FROM users');
        const [lawyersCount]: any = await conn.query('SELECT COUNT(*) as c FROM lawyers');
        const [consultCount]: any = await conn.query('SELECT COUNT(*) as c FROM consultations');
        const [docsCount]: any = await conn.query('SELECT COUNT(*) as c FROM user_documents');
        const [laborCount]: any = await conn.query('SELECT COUNT(*) as c FROM labor_simulations');

        conn.release();

        return {
          success: true,
          mode: 'mysql',
          databaseName: process.env.DB_NAME || defaultDbName,
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT || 3306),
          user: process.env.DB_USER,
          connected: true,
          tablesCount: tableNames.length,
          tables: tableNames,
          seeded: true,
          message: 'Banco MySQL do cPanel provisionado e operacional com sucesso!',
          recordsSummary: {
            users: usersCount[0]?.c || 0,
            lawyers: lawyersCount[0]?.c || 0,
            consultations: consultCount[0]?.c || 0,
            documents: docsCount[0]?.c || 0,
            laborSimulations: laborCount[0]?.c || 0,
          },
          cpanelDetected: isCpanel,
          cpanelUser,
          timestamp: new Date().toISOString(),
        };
      } catch (err: any) {
        console.warn('Erro ao consultar status do MySQL:', err?.message);
      }
    }

    // Return self-contained status
    this.loadLocalData();
    const tables = Object.keys(this.localData || {});
    return {
      success: true,
      mode: 'self-contained',
      databaseName: 'diria_db.json (Autocontido)',
      host: 'Sistema de Arquivos Local (Zero Configuração)',
      port: 0,
      user: cpanelUser || 'cpanel_user',
      connected: true,
      tablesCount: tables.length,
      tables,
      seeded: true,
      message: 'Banco autocontido 100% ativo e funcional sem qualquer intervenção manual!',
      recordsSummary: {
        users: this.localData?.users?.length || 0,
        lawyers: this.localData?.lawyers?.length || 0,
        consultations: this.localData?.consultations?.length || 0,
        documents: this.localData?.user_documents?.length || 0,
        laborSimulations: this.localData?.labor_simulations?.length || 0,
      },
      cpanelDetected: isCpanel,
      cpanelUser,
      timestamp: new Date().toISOString(),
    };
  }

  // Get raw JSON collections for frontend sync
  public getLocalCollection(collectionName: string): any[] {
    this.loadLocalData();
    return this.localData[collectionName] || [];
  }

  // Save/Update item in local collection
  public saveLocalItem(collectionName: string, item: any): void {
    this.loadLocalData();
    if (!this.localData[collectionName]) {
      this.localData[collectionName] = [];
    }
    const idx = this.localData[collectionName].findIndex((x: any) => x.id === item.id);
    if (idx >= 0) {
      this.localData[collectionName][idx] = { ...this.localData[collectionName][idx], ...item };
    } else {
      this.localData[collectionName].push(item);
    }
    this.saveLocalData();
  }
}

export const dbManager = new DatabaseManager();
