---
sidebar_label: 'ClickHouse CLI'
slug: /cloud/features/cli
title: 'ClickHouse CLI'
description: '使用 ClickHouse CLI 管理 ClickHouse Cloud 服务及本地 ClickHouse 实例'
keywords: ['clickhousectl', 'CLI', '云管理', '本地开发']
doc_type: 'reference'
---

# ClickHouse CLI \{#clickhouse-cli\}

ClickHouse CLI (`clickhousectl`) 是一款统一的命令行工具，用于管理 ClickHouse Cloud 资源，并支持基于 ClickHouse 的本地开发。

## 安装 \{#installation\}

```bash
curl https://clickhouse.com/cli | sh
```

为方便起见，还会自动创建一个 `chctl` 别名。

## Cloud 管理 \{#cloud-management\}

通过命令行完成 ClickHouse Cloud 身份验证，并直接管理您的服务。

### 身份验证 \{#authentication\}

```bash
clickhousectl cloud auth
```

这会提示您输入 API 密钥和 secret，并将其保存到 `.clickhouse/credentials.json` (项目本地，且已加入 git 忽略) 。

您也可以使用环境变量：

```bash
export CLICKHOUSE_CLOUD_API_KEY=your-key
export CLICKHOUSE_CLOUD_API_SECRET=your-secret
```

### 服务 \{#services\}

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

### 组织 \{#organizations\}

```bash
clickhousectl cloud org list
clickhousectl cloud org get <org-id>
```

### API 密钥 \{#api-keys\}

```bash
clickhousectl cloud key list
clickhousectl cloud key create --name ci-key --role-id <role-id>
clickhousectl cloud key delete <key-id>
```

### 成员与邀请 \{#members-and-invitations\}

```bash
clickhousectl cloud member list
clickhousectl cloud invitation create --email dev@example.com --role-id <role-id>
```

### 备份 \{#backups\}

```bash
clickhousectl cloud backup list <service-id>
clickhousectl cloud backup get <service-id> <backup-id>
```

### JSON 输出 \{#json-output\}

使用 `--json` 标志可让任何 `cloud` 命令返回 JSON 格式的响应：

```bash
clickhousectl cloud --json service list
```

## 本地开发 \{#local-development\}

CLI 还可管理本地 ClickHouse 安装和服务器。要开始进行本地开发，请参阅[快速安装](/install/quick-install)页面。

## 要求 \{#requirements\}

* macOS (aarch64、x86&#95;64) 或 Linux (aarch64、x86&#95;64)
* Cloud 命令需要 [ClickHouse Cloud API 密钥](/cloud/manage/openapi)