---
slug: /use-cases/observability/clickstack/production
title: '上线生产环境'
sidebar_label: '生产环境'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 上线生产环境'
doc_type: 'guide'
keywords: ['clickstack', '生产环境', '部署', '最佳实践', '运维']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

在生产环境部署 ClickStack 时，还需要额外考虑一些事项，以确保安全性、稳定性和正确配置。


## 网络和端口安全 \{#network-security\}

默认情况下，Docker Compose 会在主机上暴露端口，使其可以从容器外部访问——即使已启用 `ufw`（Uncomplicated Firewall，简单防火墙）等工具。之所以会这样，是因为 Docker 的网络栈机制在未进行显式配置时，可能会绕过主机层面的防火墙规则。

**建议：**

只暴露生产环境实际需要使用的端口，通常包括 OTLP 端点、API 服务器和前端。

例如，在 `docker-compose.yml` 文件中移除或注释掉不必要的端口映射：

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API
# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

如需了解如何隔离容器并加固访问安全的更多详细信息，请参阅 [Docker 网络文档](https://docs.docker.com/network/)。


## 会话密钥配置 \{#session-secret\}

在生产环境中，必须为 `EXPRESS_SESSION_SECRET` 环境变量设置一个强且随机的值，以保护会话数据并防止被篡改。

以下是在应用服务的 `docker-compose.yml` 文件中添加该变量的方法：

```yaml
  app:
    image: ${IMAGE_NAME_HDX}:${IMAGE_VERSION}
    ports:
      - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
      - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
    environment:
      FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_API_PORT: ${HYPERDX_API_PORT}
      HYPERDX_APP_PORT: ${HYPERDX_APP_PORT}
      HYPERDX_APP_URL: ${HYPERDX_APP_URL}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      MINER_API_URL: 'http://miner:5123'
      MONGO_URI: 'mongodb://db:27017/hyperdx'
      NEXT_PUBLIC_SERVER_URL: http://127.0.0.1:${HYPERDX_API_PORT}
      OTEL_SERVICE_NAME: 'hdx-oss-api'
      USAGE_STATS_ENABLED: ${USAGE_STATS_ENABLED:-true}
      EXPRESS_SESSION_SECRET: "super-secure-random-string"
    networks:
      - internal
    depends_on:
      - ch-server
      - db1
```

你可以使用 `openssl` 生成一个高强度密钥：

```shell
openssl rand -hex 32
```

避免将敏感信息（如密钥和凭证）提交到源代码管理系统。在生产环境中，可以考虑使用环境变量管理工具（例如 Docker Secrets、HashiCorp Vault，或针对不同环境的 CI/CD 配置）。


## 安全摄取 \\{#secure-ingestion\\}

所有数据摄取操作都应通过 ClickStack 发行版中的 OpenTelemetry (OTel) collector 暴露的 OTLP 端口进行。默认情况下，这需要在启动时生成的安全摄取 API key。向 OTel 端口发送数据时必须提供此 key，可以在 HyperDX UI 的 `Team Settings → API Keys` 中找到。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

此外，我们建议为 OTLP 端点启用 TLS，并[为 ClickHouse 摄取创建专用用户](#database-ingestion-user)。

## ClickHouse \\{#clickhouse\\}

对于生产环境部署，我们建议使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，其默认采用符合行业标准的[安全实践](/cloud/security)，包括增强的加密、身份验证与连接性，以及托管的访问控制机制。请参阅「[ClickHouse Cloud](#clickhouse-cloud-production)」，获取结合最佳实践使用 ClickHouse Cloud 的分步指南。

### 用户权限 \\{#user-permissions\\}

#### HyperDX 用户 \\{#hyperdx-user\\}

用于 HyperDX 的 ClickHouse 用户只需要是一个 `readonly` 用户，并且具有修改以下设置的权限：

- `max_rows_to_read`（至少提高到 100 万）
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

默认情况下，OSS 和 ClickHouse Cloud 中的 `default` 用户都具备这些权限，但我们建议你创建一个具有这些权限的新用户。

#### 数据库和摄取用户 \\{#database-ingestion-user\\}

我们建议为 OTel collector 创建一个专用的摄取用户，并确保将摄取数据发送到特定的数据库，例如 `otel`。有关更多详细信息，请参阅[《创建摄取用户》](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)。

### 自管理安全性 \\{#self-managed-security\\}

如果你自行管理 ClickHouse 实例，务必要启用 **TLS**、强制身份验证，并遵循加固访问的最佳实践。有关实际环境中错误配置及其规避方法的背景信息，请参阅[这篇博客文章](https://www.wiz.io/blog/clickhouse-and-wiz)。

ClickHouse OSS 默认提供了健壮的安全特性，但需要进行相应配置：

- 通过 `tcp_port_secure` 和 `config.xml` 中的 `<openSSL>` **使用 TLS**。参见 [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls)。
- 为 `default` 用户**设置强密码**，或将其禁用。
- **避免将 ClickHouse 暴露到外部网络**，除非是明确所需。默认情况下，ClickHouse 只绑定到 `localhost`，除非修改了 `listen_host`。
- **使用身份验证方式**，例如密码、证书、SSH 密钥或[外部认证器](/operations/external-authenticators)。
- 使用 IP 过滤和 `HOST` 子句**限制访问**。参见 [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host)。
- **启用基于角色的访问控制 (RBAC)** 以授予细粒度权限。参见 [operations/access-rights](/operations/access-rights)。
- 使用[配额](/operations/quotas)、[设置配置文件](/operations/settings/settings-profiles)和只读模式**强制实施配额和限制**。
- **对静态数据进行加密**并使用安全的外部存储。参见 [operations/storing-data](/operations/storing-data) 和 [cloud/security/CMEK](/cloud/security/cmek)。
- **避免在代码中硬编码凭证。**使用[命名集合](/operations/named-collections)或 ClickHouse Cloud 中的 IAM 角色。
- 使用[系统日志](/operations/system-tables/query_log)和[会话日志](/operations/system-tables/session_log)**审计访问和查询**。

另请参阅[外部认证器](/operations/external-authenticators)和[查询复杂度设置](/operations/settings/query-complexity)，以管理用户并确保查询/资源限制得到遵守。

### 配置生存时间 (TTL) \\{#configure-ttl\\}

请确保已为 ClickStack 部署的[生存时间 (TTL)](/use-cases/observability/clickstack/ttl)[进行了适当配置](/use-cases/observability/clickstack/ttl#modifying-ttl)。这将控制数据的保留时长；默认的 3 天通常需要进行调整。

## MongoDB 使用指南 \\{#mongodb-guidelines\\}

请遵循 MongoDB 官方提供的[安全检查清单](https://www.mongodb.com/docs/manual/administration/security-checklist/)。

## ClickHouse Cloud \\{#clickhouse-cloud-production\\}

以下示例展示了使用 ClickHouse Cloud 部署 ClickStack 的一个简单方案，并符合最佳实践。

<VerticalStepper headerLevel="h3">

### 创建服务 \\{#create-a-service\\}

按照 [ClickHouse Cloud 快速入门指南](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service) 创建服务。

### 复制连接信息 \\{#copy-connection-details\\}

要查找 HyperDX 的连接信息，请进入 ClickHouse Cloud 控制台并点击侧边栏中的 <b>Connect</b> 按钮，记录 HTTP 连接信息，尤其是 URL。

**虽然您可以使用此步骤中显示的默认用户名和密码连接 HyperDX，但我们建议创建一个专用用户——见下文**

<Image img={connect_cloud} alt="连接 Cloud" size="md" background/>

### 创建 HyperDX 用户 \\{#create-a-user\\}

我们建议为 HyperDX 创建一个专用用户。在 [Cloud SQL 控制台](/cloud/get-started/sql-console) 中运行以下 SQL 命令，并提供满足复杂度要求的安全密码：

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### 准备摄取用户 \\{#prepare-for-ingestion\\}

创建一个用于存储数据的 `otel` 数据库，以及一个权限受限的 `hyperdx_ingest` 摄取用户。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### 部署 ClickStack \\{#deploy-clickstack\\}

部署 ClickStack，推荐使用 [Helm](/use-cases/observability/clickstack/deployment/helm) 或 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)（修改为不包含 ClickHouse）的部署模型。 

:::note 单独部署各组件
如果您是高级用户，可以分别以独立部署模式部署 [OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) 和 [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only)。
:::

关于在 Helm 图表中使用 ClickHouse Cloud 的说明见[此处](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)。Docker Compose 的对应说明见[此处](/use-cases/observability/clickstack/deployment/docker-compose)。

### 访问 HyperDX UI \\{#navigate-to-hyperdx-ui\\}

访问 [http://localhost:8080](http://localhost:8080) 打开 HyperDX UI。

创建一个用户，并提供满足要求的用户名和密码。 

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

点击 `Create` 后，系统会提示您填写连接信息。

### 连接到 ClickHouse Cloud \\{#connect-to-clickhouse-cloud\\}

使用之前创建的凭据补全连接信息，然后点击 `Create`。

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### 向 ClickStack 发送数据 \\{#send-data\\}

要向 ClickStack 发送数据，请参阅「[发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)」。

</VerticalStepper>