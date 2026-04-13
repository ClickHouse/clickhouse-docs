---
description: 'clickhousectl 文档：用于本地和云端 ClickHouse 的 CLI'
sidebar_label: 'clickhousectl'
sidebar_position: 17
slug: /interfaces/cli
title: 'clickhousectl'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

`clickhousectl` 是用于本地和云端 ClickHouse 的 CLI。

使用 `clickhousectl`，您可以：

* 安装和管理本地 ClickHouse 版本
* 启动和管理本地 ClickHouse 服务端
* 对 ClickHouse 服务端执行查询
* 搭建 ClickHouse Cloud 并创建由云托管的 ClickHouse 集群
* 管理 ClickHouse Cloud 资源
* 将官方 ClickHouse agent skills 安装到受支持的代码智能体中
* 将本地 ClickHouse 开发工作推送到云端

`clickhousectl` 可帮助开发者和 AI 智能体基于 ClickHouse 进行开发。

## 安装 \{#installation\}

### 快速安装 \{#quick-install\}

```bash
curl https://clickhouse.com/cli | sh
```

安装脚本会下载适用于您的 OS 的正确版本，并将其安装到 `~/.local/bin/clickhousectl`。此外，还会自动创建 `chctl` 别名，便于使用。

## 要求 \{#requirements\}

* macOS (aarch64、x86&#95;64) 或 Linux (aarch64、x86&#95;64)
* 运行 Cloud 命令需要 [ClickHouse Cloud API 密钥](/cloud/manage/api/api-overview)

## 本地 \{#local\}

### 安装和管理 ClickHouse 版本 \{#installing-versions\}

`clickhousectl` 会从 [GitHub releases](https://github.com/ClickHouse/ClickHouse/releases) 下载 ClickHouse 二进制文件。

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

#### ClickHouse 二进制文件存储 \{#binary-storage\}

ClickHouse 二进制文件存放在全局代码仓库中，因此可供多个项目共用，无需重复占用存储空间。二进制文件存放在 `~/.clickhousectl/` 中：

```bash
~/.clickhousectl/
├── versions/
│   └── 26.3.4.3/
│       └── clickhouse
└── default              # tracks the active version
```

### 初始化项目 \{#initializing-project\}

```bash
clickhousectl local init
```

`init` 会在当前工作目录中为 ClickHouse 项目文件初始化一套标准的文件夹结构。此步骤为可选；如果你愿意，也可以使用自己偏好的文件夹结构。

它会创建以下结构：

```bash
clickhouse/
├── tables/                 # Table definitions (CREATE TABLE ...)
├── materialized_views/     # Materialized view definitions
├── queries/                # Saved queries
└── seed/                   # Seed data / INSERT statements
```

### 执行查询 \{#running-queries\}

```bash
# Connect to a running server with clickhouse-client
clickhousectl local client                           # Connects to "default" server
clickhousectl local client --name dev                # Connects to "dev" server
clickhousectl local client --query "SHOW DATABASES"  # Run a query
clickhousectl local client --queries-file schema.sql # Run queries from a file
clickhousectl local client --host remote-host --port 9000  # Connect to a specific host/port
```

### 创建和管理 ClickHouse 服务端 \{#managing-servers\}

启动并管理 ClickHouse 服务端实例。每个服务端实例都有各自隔离的数据目录，位于 `.clickhousectl/servers/<name>/data/`。

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

**服务器命名：** 如果不使用 `--name`，第一个服务器名称为 &quot;default&quot;。如果 &quot;default&quot; 已在运行，则会生成一个随机名称 (例如 &quot;bold-crane&quot;) 。如需使用可反复启动/停止的稳定标识，请使用 `--name`。

**端口：** 默认端口为 HTTP 8123 和 TCP 9000。如果这些端口已被占用，系统会自动分配空闲端口，并在输出中显示。使用 `--http-port` 和 `--tcp-port` 设置明确的端口。

#### 项目本地数据目录 \{#project-local-data\}

所有服务器数据都存放在项目目录下的 `.clickhousectl/` 中：

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

每个具名服务器都有各自的数据目录，因此服务器之间彼此完全隔离。数据在重启后仍会保留——按名称停止并重新启动服务器，即可从上次离开的地方继续。使用 `clickhousectl local server remove <name>` 可永久删除服务器的数据。

## 身份验证 \{#authentication\}

使用 OAuth (基于浏览器) 或 API 密钥向 ClickHouse Cloud 进行身份验证。

### OAuth 登录 (推荐) \{#oauth-login\}

```bash
clickhousectl cloud auth login
```

这将打开您的浏览器，并通过 OAuth 设备流完成身份验证。令牌将保存在 `.clickhousectl/tokens.json` 中 (项目本地) 。

### API 密钥/密钥值 \{#api-key\}

```bash
# Non-interactive (CI-friendly)
clickhousectl cloud auth login --api-key YOUR_KEY --api-secret YOUR_SECRET

# Interactive prompt
clickhousectl cloud auth login --interactive
```

凭据将保存到 `.clickhousectl/credentials.json` (项目本地) 。

您也可以使用环境变量：

```bash
export CLICKHOUSE_CLOUD_API_KEY=your-key
export CLICKHOUSE_CLOUD_API_SECRET=your-secret
```

或者直接在任意命令中通过标志传入凭据：

```bash
clickhousectl cloud --api-key KEY --api-secret SECRET ...
```

### 认证状态与登出 \{#auth-status\}

```bash
clickhousectl cloud auth status    # Show current auth state
clickhousectl cloud auth logout    # Clear all saved credentials (credentials.json & tokens.json)
```

凭据解析顺序：CLI 参数 &gt; OAuth 令牌 &gt; `.clickhousectl/credentials.json` &gt; 环境变量。

## Cloud \{#cloud\}

通过 API 管理 ClickHouse Cloud 服务。

### 组织 \{#organizations\}

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

### 服务 \{#services\}

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

#### 服务创建选项 \{#service-create-options\}

| 选项                        | 说明                                   |
| ------------------------- | ------------------------------------ |
| `--name`                  | 服务名称 (必填)                            |
| `--provider`              | 云服务商：`aws`、`gcp`、`azure` (默认：`aws`)  |
| `--region`                | 区域 (默认：`us-east-1`)                  |
| `--min-replica-memory-gb` | 每个副本的最小内存 (GB)  (8-356，且必须为 4 的倍数)   |
| `--max-replica-memory-gb` | 每个副本的最大内存 (GB)  (8-356，且必须为 4 的倍数)   |
| `--num-replicas`          | 副本数量 (1-20)                          |
| `--idle-scaling`          | 允许缩容到零 (默认：`true`)                   |
| `--idle-timeout-minutes`  | 最短空闲超时时间 (分钟)  (&gt;= 5)             |
| `--ip-allow`              | 允许的 IP CIDR (可重复指定，默认：`0.0.0.0/0`)   |
| `--backup-id`             | 要从中恢复的备份 ID                          |
| `--release-channel`       | 发布渠道：`slow`、`default`、`fast`         |

#### 查询端点管理 \{#query-endpoints\}

```bash
clickhousectl cloud service query-endpoint get <service-id>
clickhousectl cloud service query-endpoint create <service-id> \
  --role admin \
  --open-api-key key-1 \
  --allowed-origins https://app.example.com
clickhousectl cloud service query-endpoint delete <service-id>
```

#### 私有端点管理 \{#private-endpoints\}

```bash
clickhousectl cloud service private-endpoint create <service-id> --endpoint-id vpce-123
clickhousectl cloud service private-endpoint get-config <service-id>
```

#### 备份配置 \{#backup-config\}

```bash
clickhousectl cloud service backup-config get <service-id>
clickhousectl cloud service backup-config update <service-id> \
  --backup-period-hours 24 \
  --backup-retention-period-hours 720 \
  --backup-start-time 02:00
```

### 备份 \{#backups\}

```bash
clickhousectl cloud backup list <service-id>
clickhousectl cloud backup get <service-id> <backup-id>
```

### 成员 \{#members\}

```bash
clickhousectl cloud member list
clickhousectl cloud member get <user-id>
clickhousectl cloud member update <user-id> --role-id <role-id>
clickhousectl cloud member remove <user-id>
```

### 邀请 \{#invitations\}

```bash
clickhousectl cloud invitation list
clickhousectl cloud invitation create --email dev@example.com --role-id <role-id>
clickhousectl cloud invitation get <invitation-id>
clickhousectl cloud invitation delete <invitation-id>
```

### 密钥 \{#keys\}

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

### 活动记录 \{#activity\}

```bash
clickhousectl cloud activity list --from-date 2024-01-01 --to-date 2024-12-31
clickhousectl cloud activity get <activity-id>
```

### JSON 输出 \{#json-output\}

使用 `--json` 标志可输出 JSON 格式的响应。

```bash
clickhousectl cloud --json service list
clickhousectl cloud --json service get <service-id>
```

## 技能 \{#skills\}

从 [ClickHouse/agent-skills](https://github.com/ClickHouse/agent-skills) 安装官方 ClickHouse Agent Skills。

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

### 非交互式参数 \{#non-interactive-flags\}

| 参数                | 说明                      |
| ----------------- | ----------------------- |
| `--agent <name>`  | 为特定智能体安装 技能 (可多次指定)  |
| `--global`        | 使用全局作用域；若省略，则使用项目作用域    |
| `--all`           | 为所有受支持的智能体安装 技能      |
| `--detected-only` | 为系统中检测到的受支持智能体安装 技能  |