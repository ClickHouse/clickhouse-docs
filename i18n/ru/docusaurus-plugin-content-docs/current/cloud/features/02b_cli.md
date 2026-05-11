---
sidebar_label: 'ClickHouse CLI'
slug: /cloud/features/cli
title: 'ClickHouse CLI'
description: 'Используйте ClickHouse CLI для управления сервисами ClickHouse Cloud и локальными экземплярами ClickHouse'
keywords: ['clickhousectl', 'CLI', 'управление облачными сервисами', 'локальная разработка']
doc_type: 'reference'
---

# ClickHouse CLI \{#clickhouse-cli\}

ClickHouse CLI (`clickhousectl`) — это универсальный инструмент командной строки для управления ресурсами ClickHouse Cloud и локальной разработки с ClickHouse.

## Установка \{#installation\}

```bash
curl https://clickhouse.com/cli | sh
```

Для удобства также автоматически создаётся алиас `chctl`.

## Управление ClickHouse Cloud \{#cloud-management\}

Пройдите аутентификацию в ClickHouse Cloud и управляйте своими сервисами прямо из командной строки.

### Аутентификация \{#authentication\}

```bash
clickhousectl cloud auth
```

Будут запрошены ваш API-ключ и 시크릿, после чего они будут сохранены в `.clickhouse/credentials.json` (в каталоге проекта; файл игнорируется git).

Вы также можете использовать переменные окружения:

```bash
export CLICKHOUSE_CLOUD_API_KEY=your-key
export CLICKHOUSE_CLOUD_API_SECRET=your-secret
```

### Сервисы \{#services\}

```bash
# List services
clickhousectl cloud service list

# Create a service
clickhousectl cloud service create --name my-service \
  --provider aws \
  --region us-east-1

# Get service details
clickhousectl cloud service get <service-id>

# Scale a service
clickhousectl cloud service scale <service-id> \
  --min-replica-memory-gb 24 \
  --max-replica-memory-gb 48 \
  --num-replicas 3

# Start/stop a service
clickhousectl cloud service start <service-id>
clickhousectl cloud service stop <service-id>

# Delete a service
clickhousectl cloud service delete <service-id>
```

### Организации \{#organizations\}

```bash
clickhousectl cloud org list
clickhousectl cloud org get <org-id>
```

### API-ключи \{#api-keys\}

```bash
clickhousectl cloud key list
clickhousectl cloud key create --name ci-key --role-id <role-id>
clickhousectl cloud key delete <key-id>
```

### Участники и приглашения \{#members-and-invitations\}

```bash
clickhousectl cloud member list
clickhousectl cloud invitation create --email dev@example.com --role-id <role-id>
```

### Резервные копии \{#backups\}

```bash
clickhousectl cloud backup list <service-id>
clickhousectl cloud backup get <service-id> <backup-id>
```

### Вывод JSON \{#json-output\}

Используйте флаг `--json`, чтобы получать ответы в формате JSON от любой команды cloud:

```bash
clickhousectl cloud --json service list
```

## Локальная разработка \{#local-development\}

CLI также управляет локальными установками ClickHouse и серверами. Чтобы начать работу с локальной разработкой, см. страницу [быстрой установки](/install/quick-install).

## Требования \{#requirements\}

* macOS (aarch64, x86&#95;64) или Linux (aarch64, x86&#95;64)
* Для команд Cloud необходим [API-ключ ClickHouse Cloud](/cloud/manage/openapi)