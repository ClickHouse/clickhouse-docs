---
description: 'Документация по clickhousectl — CLI для локального и облачного ClickHouse'
sidebar_label: 'clickhousectl'
sidebar_position: 17
slug: /interfaces/cli
title: 'clickhousectl'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

`clickhousectl` — это CLI для локального и облачного ClickHouse.

С помощью `clickhousectl` Вы можете:

* Устанавливать локальные версии ClickHouse и управлять ими
* Запускать локальные серверы ClickHouse и управлять ими
* Выполнять запросы к серверам ClickHouse
* Настраивать ClickHouse Cloud и создавать кластеры ClickHouse под управлением Cloud
* Управлять ресурсами ClickHouse Cloud
* Устанавливать официальные навыки агента ClickHouse в поддерживаемые ИИ-агенты для программирования
* Переносить локальную разработку на ClickHouse в облако

`clickhousectl` помогает людям и ИИ-агентам разрабатывать решения с ClickHouse.

## Установка \{#installation\}

### Быстрая установка \{#quick-install\}

```bash
curl https://clickhouse.com/cli | sh
```

Скрипт установки загружает подходящую версию для вашей OS и устанавливает её в `~/.local/bin/clickhousectl`. Для удобства также автоматически создаётся алиас `chctl`.

## Требования \{#requirements\}

* macOS (aarch64, x86&#95;64) или Linux (aarch64, x86&#95;64)
* Для команд ClickHouse Cloud требуется [API-ключ ClickHouse Cloud](/cloud/manage/api/api-overview)

## Локально \{#local\}

### Установка и управление версиями ClickHouse \{#installing-versions\}

`clickhousectl` загружает бинарные файлы ClickHouse из [раздела релизов на GitHub](https://github.com/ClickHouse/ClickHouse/releases).

```bash
# Install a version
clickhousectl local install stable          # Latest stable release
clickhousectl local install lts             # Latest LTS release
clickhousectl local install 26.3            # Latest 26.3.x.x
clickhousectl local install 26.3.4.3        # Exact version

# List versions
clickhousectl local list                    # Installed versions
clickhousectl local list --remote           # Available for download

# Manage default version
clickhousectl local use stable              # Latest stable (installs if needed)
clickhousectl local use lts                 # Latest LTS (installs if needed)
clickhousectl local use 26.3                # Latest 26.3.x.x (installs if needed)
clickhousectl local use 26.3.4.3            # Exact version
clickhousectl local which                   # Show current default

# Remove a version
clickhousectl local remove 26.3.4.3
```

#### Хранение бинарных файлов ClickHouse \{#binary-storage\}

Бинарные файлы ClickHouse хранятся в общем хранилище, поэтому их можно использовать в нескольких проектах без дублирования. Они хранятся в `~/.clickhousectl/`:

```bash
~/.clickhousectl/
├── versions/
│   └── 26.3.4.3/
│       └── clickhouse
└── default              # tracks the active version
```

### Инициализация проекта \{#initializing-project\}

```bash
clickhousectl local init
```

`init` инициализирует текущий рабочий каталог, создавая в нём стандартную структуру папок для файлов проекта ClickHouse. Это необязательно: при желании вы можете использовать собственную структуру папок.

Будет создана следующая структура:

```bash
clickhouse/
├── tables/                 # Table definitions (CREATE TABLE ...)
├── materialized_views/     # Materialized view definitions
├── queries/                # Saved queries
└── seed/                   # Seed data / INSERT statements
```

### Выполнение запросов \{#running-queries\}

```bash
# Connect to a running server with clickhouse-client
clickhousectl local client                           # Connects to "default" server
clickhousectl local client --name dev                # Connects to "dev" server
clickhousectl local client --query "SHOW DATABASES"  # Run a query
clickhousectl local client --queries-file schema.sql # Run queries from a file
clickhousectl local client --host remote-host --port 9000  # Connect to a specific host/port
```

### Создание серверов ClickHouse и управление ими \{#managing-servers\}

Запускайте экземпляры сервера ClickHouse и управляйте ими. Для каждого сервера создаётся собственный изолированный каталог данных в `.clickhousectl/servers/<name>/data/`.

```bash
# Start a server (runs in background by default)
clickhousectl local server start                          # Named "default"
clickhousectl local server start --name dev               # Named "dev"
clickhousectl local server start --foreground             # Run in foreground (-F / --fg)
clickhousectl local server start --http-port 8124 --tcp-port 9001  # Explicit ports
clickhousectl local server start -- --config-file=/path/to/config.xml

# List all servers (running and stopped)
clickhousectl local server list

# Stop servers
clickhousectl local server stop default                   # Stop by name
clickhousectl local server stop-all                       # Stop all running servers

# Remove a stopped server and its data
clickhousectl local server remove test
```

**Именование серверов:** Без `--name` первый сервер получает имя &quot;default&quot;. Если &quot;default&quot; уже используется, автоматически генерируется случайное имя (например, &quot;bold-crane&quot;). Используйте `--name`, чтобы задать постоянный идентификатор, с которым сервер можно многократно запускать и останавливать.

**Порты:** По умолчанию используются порты HTTP 8123 и TCP 9000. Если они уже заняты, свободные порты назначаются автоматически и отображаются в выводе. Используйте `--http-port` и `--tcp-port`, чтобы явно задать порты.

#### Локальный каталог данных проекта \{#project-local-data\}

Все данные сервера хранятся в каталоге `.clickhousectl/` вашего проекта:

```bash
.clickhousectl/
├── .gitignore              # auto-created, ignores everything
├── credentials.json        # cloud API credentials (if configured)
└── servers/
    ├── default/
    │   └── data/           # ClickHouse data files for "default" server
    └── dev/
        └── data/           # ClickHouse data files for "dev" server
```

У каждого именованного сервера есть собственный каталог данных, поэтому серверы полностью изолированы друг от друга. Данные сохраняются между перезапусками — остановите и снова запустите сервер по имени, чтобы продолжить работу с того места, на котором остановились. Используйте `clickhousectl local server remove <name>`, чтобы навсегда удалить данные сервера.

## Аутентификация \{#authentication\}

Пройдите аутентификацию в ClickHouse Cloud с помощью OAuth (через браузер) или API-ключей.

### Вход через OAuth (рекомендуется) \{#oauth-login\}

```bash
clickhousectl cloud auth login
```

При этом откроется браузер для аутентификации через OAuth Device Flow. Токены сохраняются в `.clickhousectl/tokens.json` (локально для проекта).

### API-ключ/시크릿 \{#api-key\}

```bash
# Non-interactive (CI-friendly)
clickhousectl cloud auth login --api-key YOUR_KEY --api-secret YOUR_SECRET

# Interactive prompt
clickhousectl cloud auth login --interactive
```

Учетные данные сохраняются в `.clickhousectl/credentials.json` (в каталоге проекта).

Вы также можете использовать переменные окружения:

```bash
export CLICKHOUSE_CLOUD_API_KEY=your-key
export CLICKHOUSE_CLOUD_API_SECRET=your-secret
```

Или передавайте учётные данные напрямую через флаги в любой команде:

```bash
clickhousectl cloud --api-key KEY --api-secret SECRET ...
```

### Статус авторизации и выход \{#auth-status\}

```bash
clickhousectl cloud auth status    # Show current auth state
clickhousectl cloud auth logout    # Clear all saved credentials (credentials.json & tokens.json)
```

Порядок поиска учетных данных: флаги CLI &gt; токены OAuth &gt; `.clickhousectl/credentials.json` &gt; переменные окружения.

## Cloud \{#cloud\}

Управляйте сервисами ClickHouse Cloud через API.

### Организации \{#organizations\}

```bash
clickhousectl cloud org list              # List organizations
clickhousectl cloud org get <org-id>      # Get organization details
clickhousectl cloud org update <org-id> --name "Renamed Org"
clickhousectl cloud org update <org-id> \
  --remove-private-endpoint pe-1,cloud-provider=aws,region=us-east-1 \
  --enable-core-dumps false
clickhousectl cloud org prometheus <org-id> --filtered-metrics true
clickhousectl cloud org usage <org-id> \
  --from-date 2024-01-01 \
  --to-date 2024-01-31
```

### Сервисы \{#services\}

```bash
# List services
clickhousectl cloud service list

# Get service details
clickhousectl cloud service get <service-id>

# Create a service (minimal)
clickhousectl cloud service create --name my-service

# Create with scaling options
clickhousectl cloud service create --name my-service \
  --provider aws \
  --region us-east-1 \
  --min-replica-memory-gb 8 \
  --max-replica-memory-gb 32 \
  --num-replicas 2

# Create with specific IP allowlist
clickhousectl cloud service create --name my-service \
  --ip-allow 10.0.0.0/8 \
  --ip-allow 192.168.1.0/24

# Create from backup
clickhousectl cloud service create --name restored-service --backup-id <backup-uuid>

# Create with release channel
clickhousectl cloud service create --name my-service --release-channel fast

# Start/stop a service
clickhousectl cloud service start <service-id>
clickhousectl cloud service stop <service-id>

# Connect to a cloud service with clickhouse-client
clickhousectl cloud service client --name my-service --password secret
clickhousectl cloud service client --id <service-id> -q "SELECT 1" --password secret

# Use CLICKHOUSE_PASSWORD env var (recommended for scripts/agents)
CLICKHOUSE_PASSWORD=secret clickhousectl cloud service client \
  --name my-service -q "SELECT count() FROM system.tables"

# Update service metadata and patches
clickhousectl cloud service update <service-id> \
  --name my-renamed-service \
  --add-ip-allow 10.0.0.0/8 \
  --remove-ip-allow 0.0.0.0/0 \
  --release-channel fast

# Update replica scaling
clickhousectl cloud service scale <service-id> \
  --min-replica-memory-gb 24 \
  --max-replica-memory-gb 48 \
  --num-replicas 3 \
  --idle-scaling true \
  --idle-timeout-minutes 10

# Reset password with generated credentials
clickhousectl cloud service reset-password <service-id>

# Delete a service (must be stopped first)
clickhousectl cloud service delete <service-id>

# Force delete: stops a running service then deletes
clickhousectl cloud service delete <service-id> --force
```

#### Параметры создания сервиса \{#service-create-options\}

| Опция                     | Описание                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `--name`                  | Имя сервиса (обязательно)                                                                         |
| `--provider`              | Поставщик облачных услуг: `aws`, `gcp`, `azure` (по умолчанию: `aws`)                             |
| `--region`                | Регион (по умолчанию: `us-east-1`)                                                                |
| `--min-replica-memory-gb` | Минимальный объём памяти на реплику в ГБ (8–356, кратно 4)                                        |
| `--max-replica-memory-gb` | Максимальный объём памяти на реплику в ГБ (8–356, кратно 4)                                       |
| `--num-replicas`          | Количество реплик (1–20)                                                                          |
| `--idle-scaling`          | Разрешить масштабирование до нуля (по умолчанию: `true`)                                          |
| `--idle-timeout-minutes`  | Минимальный тайм-аут простоя в минутах (&gt;= 5)                                                  |
| `--ip-allow`              | Разрешённый IP-диапазон в нотации CIDR (можно указывать несколько раз; по умолчанию: `0.0.0.0/0`) |
| `--backup-id`             | Идентификатор резервной копии для восстановления                                                  |
| `--release-channel`       | Канал релизов: `slow`, `default`, `fast`                                                          |

#### Управление конечной точкой для запросов \{#query-endpoints\}

```bash
clickhousectl cloud service query-endpoint get <service-id>
clickhousectl cloud service query-endpoint create <service-id> \
  --role admin \
  --open-api-key key-1 \
  --allowed-origins https://app.example.com
clickhousectl cloud service query-endpoint delete <service-id>
```

#### Управление частной конечной точкой \{#private-endpoints\}

```bash
clickhousectl cloud service private-endpoint create <service-id> --endpoint-id vpce-123
clickhousectl cloud service private-endpoint get-config <service-id>
```

#### Настройка резервного копирования \{#backup-config\}

```bash
clickhousectl cloud service backup-config get <service-id>
clickhousectl cloud service backup-config update <service-id> \
  --backup-period-hours 24 \
  --backup-retention-period-hours 720 \
  --backup-start-time 02:00
```

### Резервное копирование \{#backups\}

```bash
clickhousectl cloud backup list <service-id>
clickhousectl cloud backup get <service-id> <backup-id>
```

### Участники \{#members\}

```bash
clickhousectl cloud member list
clickhousectl cloud member get <user-id>
clickhousectl cloud member update <user-id> --role-id <role-id>
clickhousectl cloud member remove <user-id>
```

### Приглашения \{#invitations\}

```bash
clickhousectl cloud invitation list
clickhousectl cloud invitation create --email dev@example.com --role-id <role-id>
clickhousectl cloud invitation get <invitation-id>
clickhousectl cloud invitation delete <invitation-id>
```

### Ключи \{#keys\}

```bash
clickhousectl cloud key list
clickhousectl cloud key get <key-id>
clickhousectl cloud key create --name ci-key --role-id <role-id> --ip-allow 10.0.0.0/8
clickhousectl cloud key update <key-id> \
  --name renamed-key \
  --expires-at 2025-12-31T00:00:00Z \
  --state disabled \
  --ip-allow 0.0.0.0/0
clickhousectl cloud key delete <key-id>
```

### Активность \{#activity\}

```bash
clickhousectl cloud activity list --from-date 2024-01-01 --to-date 2024-12-31
clickhousectl cloud activity get <activity-id>
```

### Вывод JSON \{#json-output\}

Используйте флаг `--json`, чтобы выводить ответы в формате JSON.

```bash
clickhousectl cloud --json service list
clickhousectl cloud --json service get <service-id>
```

## Навыки \{#skills\}

Установите официальные навыки для агента ClickHouse из [ClickHouse/agent-skills](https://github.com/ClickHouse/agent-skills).

```bash
# Default: interactive mode for humans, choose scope, then choose agents
clickhousectl skills

# Non-interactive: install into every supported project-local agent folder
clickhousectl skills --all

# Non-interactive: install only into detected agents
clickhousectl skills --detected-only

# Non-interactive: install into every supported global agent folder
clickhousectl skills --global --all

# Non-interactive: install into specific project-local agents
clickhousectl skills --agent claude --agent codex
```

### Неинтерактивные флаги \{#non-interactive-flags\}

| Флаг              | Описание                                                                           |
| ----------------- | ---------------------------------------------------------------------------------- |
| `--agent <name>`  | Установить навыки для указанного агента (флаг можно повторять)                     |
| `--global`        | Использовать глобальную область; если флаг не указан, используется область проекта |
| `--all`           | Установить навыки для всех поддерживаемых агентов                                  |
| `--detected-only` | Установить навыки для поддерживаемых агентов, обнаруженных в системе               |