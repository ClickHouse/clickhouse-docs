---
description: 'ClickHouse の CLI である clickhousectl のドキュメント: ローカルおよびクラウド'
sidebar_label: 'clickhousectl'
sidebar_position: 17
slug: /interfaces/cli
title: 'clickhousectl'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

`clickhousectl` は、ローカル環境とクラウド環境に対応した ClickHouse 用 CLI です。

`clickhousectl` を使用すると、次のことができます。

* ローカルの ClickHouse バージョンをインストールおよび管理する
* ローカルの ClickHouse サーバーを起動して管理する
* ClickHouse サーバーに対してクエリを実行する
* ClickHouse Cloud をセットアップし、クラウド管理の ClickHouse クラスターを作成する
* ClickHouse Cloud リソースを管理する
* 対応するコーディングエージェントに公式の ClickHouse agent skills をインストールする
* ローカルでの ClickHouse 開発内容をクラウドにプッシュする

`clickhousectl` は、人間と AI エージェントによる ClickHouse 開発を支援します。

## インストール \{#installation\}

### クイックインストール \{#quick-install\}

```bash
curl https://clickhouse.com/cli | sh
```

インストールスクリプトは、お使いのOSに対応した適切なバージョンをダウンロードし、`~/.local/bin/clickhousectl` にインストールします。利便性のため、`chctl` エイリアスも自動的に作成されます。

## 要件 \{#requirements\}

* macOS (aarch64、x86&#95;64) または Linux (aarch64、x86&#95;64)
* Cloud のコマンドを使用するには、[ClickHouse Cloud API キー](/cloud/manage/api/api-overview) が必要です

## ローカル \{#local\}

### ClickHouse バージョンのインストールと管理 \{#installing-versions\}

`clickhousectl` は [GitHub Releases](https://github.com/ClickHouse/ClickHouse/releases) から ClickHouse のバイナリをダウンロードします。

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

#### ClickHouse バイナリの保存場所 \{#binary-storage\}

ClickHouse バイナリはグローバルな共有リポジトリに保存されるため、ストレージを重複させることなく複数のプロジェクトで利用できます。バイナリは `~/.clickhousectl/` に保存されます。

```bash
~/.clickhousectl/
├── versions/
│   └── 26.3.4.3/
│       └── clickhouse
└── default              # tracks the active version
```

### プロジェクトを初期化する \{#initializing-project\}

```bash
clickhousectl local init
```

`init` は、現在の作業ディレクトリに ClickHouse プロジェクトファイル用の標準的なフォルダ構成を作成します。これは必須ではありません。必要に応じて、独自のフォルダ構成を使用できます。

以下の構成が作成されます。

```bash
clickhouse/
├── tables/                 # Table definitions (CREATE TABLE ...)
├── materialized_views/     # Materialized view definitions
├── queries/                # Saved queries
└── seed/                   # Seed data / INSERT statements
```

### クエリを実行する \{#running-queries\}

```bash
# Connect to a running server with clickhouse-client
clickhousectl local client                           # Connects to "default" server
clickhousectl local client --name dev                # Connects to "dev" server
clickhousectl local client --query "SHOW DATABASES"  # Run a query
clickhousectl local client --queries-file schema.sql # Run queries from a file
clickhousectl local client --host remote-host --port 9000  # Connect to a specific host/port
```

### ClickHouse サーバーの作成と管理 \{#managing-servers\}

ClickHouse サーバーのインスタンスを起動して管理します。各サーバーには、それぞれ独立したデータディレクトリが `.clickhousectl/servers/<name>/data/` に作成されます。

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

**サーバー名:** `--name` を指定しない場合、最初のサーバー名は &quot;default&quot; になります。&quot;default&quot; がすでに実行中の場合は、ランダムな名前 (例: &quot;bold-crane&quot;) が生成されます。繰り返し起動/停止する際も同じ識別子を使えるようにするには、`--name` を使用します。

**ポート:** 基本値は HTTP 8123 と TCP 9000 です。これらがすでに使用されている場合は、空いているポートが自動的に割り当てられ、出力に表示されます。ポートを明示的に指定するには、`--http-port` と `--tcp-port` を使用します。

#### プロジェクト内のデータディレクトリ \{#project-local-data\}

すべてのサーバーデータは、プロジェクトディレクトリ内の `.clickhousectl/` に保存されます。

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

名前付きの各サーバーにはそれぞれ専用のデータディレクトリがあるため、サーバー同士は完全に分離されています。データは再起動後も保持されるため、名前を指定してサーバーを停止し、再度起動すれば、中断したところから再開できます。サーバーのデータを完全に削除するには、`clickhousectl local server remove <name>` を使用します。

## 認証 \{#authentication\}

OAuth (ブラウザー ベース) または API キーを使用して、ClickHouse Cloud に対して認証します。

### OAuthログイン (推奨) \{#oauth-login\}

```bash
clickhousectl cloud auth login
```

これにより、OAuth デバイスフローによる認証のためにブラウザーが開きます。トークンは `.clickhousectl/tokens.json` に保存されます (プロジェクトローカル) 。

### API キー/シークレット \{#api-key\}

```bash
# Non-interactive (CI-friendly)
clickhousectl cloud auth login --api-key YOUR_KEY --api-secret YOUR_SECRET

# Interactive prompt
clickhousectl cloud auth login --interactive
```

認証情報は `.clickhousectl/credentials.json` (プロジェクトローカル) に保存されます。

環境変数を使用することもできます。

```bash
export CLICKHOUSE_CLOUD_API_KEY=your-key
export CLICKHOUSE_CLOUD_API_SECRET=your-secret
```

また、どのコマンドでもフラグで認証情報を直接渡すこともできます:

```bash
clickhousectl cloud --api-key KEY --api-secret SECRET ...
```

### 認証状態とログアウト \{#auth-status\}

```bash
clickhousectl cloud auth status    # Show current auth state
clickhousectl cloud auth logout    # Clear all saved credentials (credentials.json & tokens.json)
```

認証情報の優先順位: CLI フラグ &gt; OAuth トークン &gt; `.clickhousectl/credentials.json` &gt; 環境変数。

## Cloud \{#cloud\}

API 経由で ClickHouse Cloud サービスを管理します。

### 組織 \{#organizations\}

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

### サービス \{#services\}

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

#### サービス作成オプション \{#service-create-options\}

| オプション                     | 説明                                                |
| ------------------------- | ------------------------------------------------- |
| `--name`                  | サービス名 (必須)                                        |
| `--provider`              | クラウドプロバイダー: `aws`, `gcp`, `azure` (デフォルト: `aws`)  |
| `--region`                | リージョン (デフォルト: `us-east-1`)                        |
| `--min-replica-memory-gb` | レプリカあたりの最小メモリ (GB)  (8～356、4 の倍数)                 |
| `--max-replica-memory-gb` | レプリカあたりの最大メモリ (GB)  (8～356、4 の倍数)                 |
| `--num-replicas`          | レプリカ数 (1～20)                                      |
| `--idle-scaling`          | ゼロまでのスケールダウンを許可 (デフォルト: `true`)                   |
| `--idle-timeout-minutes`  | 最小アイドルタイムアウト時間 (分)  (&gt;= 5)                     |
| `--ip-allow`              | 許可する IP CIDR (繰り返し指定可能、デフォルト: `0.0.0.0/0`)        |
| `--backup-id`             | 復元元のバックアップ ID                                     |
| `--release-channel`       | リリースチャネル: `slow`, `default`, `fast`               |

#### クエリ用エンドポイントの管理 \{#query-endpoints\}

```bash
clickhousectl cloud service query-endpoint get <service-id>
clickhousectl cloud service query-endpoint create <service-id> \
  --role admin \
  --open-api-key key-1 \
  --allowed-origins https://app.example.com
clickhousectl cloud service query-endpoint delete <service-id>
```

#### 私有端点の管理 \{#private-endpoints\}

```bash
clickhousectl cloud service private-endpoint create <service-id> --endpoint-id vpce-123
clickhousectl cloud service private-endpoint get-config <service-id>
```

#### バックアップ設定 \{#backup-config\}

```bash
clickhousectl cloud service backup-config get <service-id>
clickhousectl cloud service backup-config update <service-id> \
  --backup-period-hours 24 \
  --backup-retention-period-hours 720 \
  --backup-start-time 02:00
```

### バックアップ \{#backups\}

```bash
clickhousectl cloud backup list <service-id>
clickhousectl cloud backup get <service-id> <backup-id>
```

### メンバー \{#members\}

```bash
clickhousectl cloud member list
clickhousectl cloud member get <user-id>
clickhousectl cloud member update <user-id> --role-id <role-id>
clickhousectl cloud member remove <user-id>
```

### 招待 \{#invitations\}

```bash
clickhousectl cloud invitation list
clickhousectl cloud invitation create --email dev@example.com --role-id <role-id>
clickhousectl cloud invitation get <invitation-id>
clickhousectl cloud invitation delete <invitation-id>
```

### キー \{#keys\}

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

### アクティビティ \{#activity\}

```bash
clickhousectl cloud activity list --from-date 2024-01-01 --to-date 2024-12-31
clickhousectl cloud activity get <activity-id>
```

### JSON出力 \{#json-output\}

JSON形式のレスポンスを出力するには、`--json` フラグを使用します。

```bash
clickhousectl cloud --json service list
clickhousectl cloud --json service get <service-id>
```

## スキル \{#skills\}

[ClickHouse/agent-skills](https://github.com/ClickHouse/agent-skills) から公式の ClickHouse Agent Skills をインストールします。

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

### 非対話モード用フラグ \{#non-interactive-flags\}

| フラグ               | 説明                                            |
| ----------------- | --------------------------------------------- |
| `--agent <name>`  | 特定のエージェント向けの Skills をインストールします (複数回指定可能)      |
| `--global`        | グローバルスコープを使用します。省略した場合はプロジェクトスコープが使用されます      |
| `--all`           | サポート対象のすべてのエージェント向けの Skills をインストールします        |
| `--detected-only` | システム上で検出されたサポート対象のエージェント向けの Skills をインストールします |