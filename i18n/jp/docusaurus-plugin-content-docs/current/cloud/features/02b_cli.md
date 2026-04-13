---
sidebar_label: 'ClickHouse CLI'
slug: /cloud/features/cli
title: 'ClickHouse CLI'
description: 'ClickHouse CLI を使用して、ClickHouse Cloud のサービスとローカルの ClickHouse インスタンスを管理します'
keywords: ['clickhousectl', 'CLI', 'cloud management', 'local development']
doc_type: 'reference'
---

# ClickHouse CLI \{#clickhouse-cli\}

ClickHouse CLI (`clickhousectl`) は、ClickHouse Cloud リソースの管理と、ClickHouse を使ったローカル開発を行うための統合コマンドラインツールです。

## インストール \{#installation\}

```bash
curl https://clickhouse.com/cli | sh
```

便宜上、`chctl` のエイリアスも自動的に作成されます。

## Cloud の管理 \{#cloud-management\}

ClickHouse Cloud で認証し、コマンドラインから直接サービスを管理します。

### 認証 \{#authentication\}

```bash
clickhousectl cloud auth
```

API キー とシークレットの入力が求められ、これらは `.clickhouse/credentials.json` に保存されます (プロジェクトローカルで、Git の追跡対象外です) 。

環境変数を使用することもできます：

```bash
export CLICKHOUSE_CLOUD_API_KEY=your-key
export CLICKHOUSE_CLOUD_API_SECRET=your-secret
```

### サービス \{#services\}

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

### 組織 \{#organizations\}

```bash
clickhousectl cloud org list
clickhousectl cloud org get <org-id>
```

### API キー \{#api-keys\}

```bash
clickhousectl cloud key list
clickhousectl cloud key create --name ci-key --role-id <role-id>
clickhousectl cloud key delete <key-id>
```

### メンバーと招待 \{#members-and-invitations\}

```bash
clickhousectl cloud member list
clickhousectl cloud invitation create --email dev@example.com --role-id <role-id>
```

### バックアップ \{#backups\}

```bash
clickhousectl cloud backup list <service-id>
clickhousectl cloud backup get <service-id> <backup-id>
```

### JSON 出力 \{#json-output\}

任意の cloud コマンドで JSON 形式のレスポンスを取得するには、`--json` フラグを使用します:

```bash
clickhousectl cloud --json service list
```

## ローカル開発 \{#local-development\}

CLI では、ローカルの ClickHouse インストールやサーバーの管理も行えます。ローカル開発を始めるには、[クイックインストール](/install/quick-install)ページを参照してください。

## 要件 \{#requirements\}

* macOS (aarch64, x86&#95;64) または Linux (aarch64, x86&#95;64)
* Cloud コマンドの実行には [ClickHouse Cloud API キー](/cloud/manage/openapi) が必要です