---
sidebar_label: 'ClickHouse CLI'
slug: /cloud/features/cli
title: 'ClickHouse CLI'
description: 'Use the ClickHouse CLI to manage ClickHouse Cloud services and local ClickHouse instances'
keywords: ['clickhousectl', 'CLI', 'cloud management', 'local development']
doc_type: 'reference'
---

# ClickHouse CLI {#clickhouse-cli}

The ClickHouse CLI (`clickhousectl`) is a unified command-line tool for managing ClickHouse Cloud resources and local development with ClickHouse.

## Installation {#installation}

```bash
curl https://clickhouse.com/cli | sh
```

A `chctl` alias is also created automatically for convenience.

## Cloud management {#cloud-management}

Authenticate with ClickHouse Cloud and manage your services directly from the command line.

### Authentication {#authentication}

```bash
clickhousectl cloud auth
```

This prompts for your API key and secret, and saves them to `.clickhouse/credentials.json` (project-local, git-ignored).

You can also use environment variables:

```bash
export CLICKHOUSE_CLOUD_API_KEY=your-key
export CLICKHOUSE_CLOUD_API_SECRET=your-secret
```

### Services {#services}

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

### Organizations {#organizations}

```bash
clickhousectl cloud org list
clickhousectl cloud org get <org-id>
```

### API keys {#api-keys}

```bash
clickhousectl cloud key list
clickhousectl cloud key create --name ci-key --role-id <role-id>
clickhousectl cloud key delete <key-id>
```

### Members and invitations {#members-and-invitations}

```bash
clickhousectl cloud member list
clickhousectl cloud invitation create --email dev@example.com --role-id <role-id>
```

### Backups {#backups}

```bash
clickhousectl cloud backup list <service-id>
clickhousectl cloud backup get <service-id> <backup-id>
```

### JSON output {#json-output}

Use the `--json` flag to get JSON-formatted responses from any cloud command:

```bash
clickhousectl cloud --json service list
```

## Local development {#local-development}

The CLI also manages local ClickHouse installations and servers. See the [quick install](/install/quick-install) page for getting started with local development.

## Requirements {#requirements}

- macOS (aarch64, x86_64) or Linux (aarch64, x86_64)
- Cloud commands require a [ClickHouse Cloud API key](/cloud/manage/openapi)
