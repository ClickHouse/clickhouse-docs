---
slug: /use-cases/observability/clickstack/production
title: '迁移到生产环境'
sidebar_label: '生产环境'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 迁移到生产环境'
doc_type: 'guide'
keywords: ['clickstack', '生产环境', '部署', '最佳实践', '运维']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

在生产环境部署 ClickStack 时，还需要额外注意若干事项，以确保安全性、稳定性以及配置正确。


## 网络和端口安全 {#network-security}

默认情况下，Docker Compose 会在宿主机上暴露端口，使其可以从容器外部访问——即使已启用 `ufw`（Uncomplicated Firewall，简单防火墙）等工具也是如此。这源于 Docker 的网络栈设计，如果没有显式配置，它可能会绕过主机级的防火墙规则。

**建议：**

只暴露生产环境中实际需要的端口，通常包括 OTLP 端点、API 服务器以及前端服务。

例如，在你的 `docker-compose.yml` 文件中移除或注释掉不必要的端口映射：

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API
# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

有关隔离容器和强化访问安全性的详细信息，请参阅 [Docker 网络文档](https://docs.docker.com/network/)。


## 会话密钥配置 {#session-secret}

在生产环境中，必须为 `EXPRESS_SESSION_SECRET` 环境变量设置一个足够强的随机值，以保护会话数据并防止被篡改。

以下是在 `docker-compose.yml` 文件中为应用服务添加它的方法：

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

你可以使用 `openssl` 生成一个强度较高的密钥：

```shell
openssl rand -hex 32
```

避免将密钥提交到源码管理系统。在生产环境中，建议使用环境变量管理工具（例如 Docker Secrets、HashiCorp Vault 或按环境划分的 CI/CD 配置）。


## 安全摄取 {#secure-ingestion}

所有摄取操作都应通过 ClickStack 发行版中 OpenTelemetry (OTel) collector 暴露的 OTLP 端口进行。默认情况下，这需要在启动时生成的用于安全摄取的 API key。向 OTel 端口发送数据时必须使用此密钥，可以在 HyperDX UI 中的 `Team Settings → API Keys` 下找到。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

此外，我们建议为 OTLP 端点启用 TLS，并创建一个[用于 ClickHouse 摄取的专用用户](#database-ingestion-user)。

## ClickHouse {#clickhouse}

对于生产环境的部署，我们推荐使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，它默认采用业界标准的[安全实践](/cloud/security)，包括更强的加密机制、认证与连接方式，以及托管的访问控制。请参阅「[ClickHouse Cloud](#clickhouse-cloud-production)」部分，获取结合最佳实践使用 ClickHouse Cloud 的分步指南。

### 用户权限 {#user-permissions}

#### HyperDX 用户 {#hyperdx-user}

用于 HyperDX 的 ClickHouse 用户只需要是一个 `readonly` 用户，并且需要有权限修改以下设置：

- `max_rows_to_read`（至少提高到 100 万）
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

默认情况下，OSS 和 ClickHouse Cloud 中的 `default` 用户都具备这些权限，但我们建议你创建一个单独拥有这些权限的新用户。

#### 数据库和摄取用户 {#database-ingestion-user}

我们建议为 OTel collector 创建一个专用用户，用于向 ClickHouse 摄取数据，并确保将摄取数据发送到某个特定数据库，例如 `otel`。有关更多信息，请参阅[“创建摄取用户”](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)。

### 自管理安全性 {#self-managed-security}

如果你自行管理 ClickHouse 实例，务必要启用 **TLS**、强制身份验证，并遵循访问安全加固的最佳实践。参阅[这篇博客文章](https://www.wiz.io/blog/clickhouse-and-wiz)，了解真实环境中的错误配置案例以及如何避免它们。

ClickHouse OSS 开箱即用地提供了强大的安全特性，但这些功能都需要正确配置：

- 通过 `tcp_port_secure` 和 `config.xml` 中的 `<openSSL>` **使用 TLS**。参见 [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls)。
- 为 `default` 用户**设置强密码**或禁用该用户。
- **避免将 ClickHouse 暴露到公网**，除非有明确需求。默认情况下，ClickHouse 仅绑定到 `localhost`，除非修改了 `listen_host`。
- **使用身份验证机制**，例如密码、证书、SSH 密钥或[外部身份验证器](/operations/external-authenticators)。
- 通过 IP 过滤和 `HOST` 子句**限制访问**。参见 [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host)。
- **启用基于角色的访问控制 (RBAC)** 以授予细粒度权限。参见 [operations/access-rights](/operations/access-rights)。
- 使用 [quotas](/operations/quotas)、[settings profiles](/operations/settings/settings-profiles) 和只读模式**强制实施配额和限制**。
- **对静态数据进行加密**并使用安全的外部存储。参见 [operations/storing-data](/operations/storing-data) 和 [cloud/security/CMEK](/cloud/security/cmek)。
- **避免在代码中硬编码凭证。**在 ClickHouse Cloud 中使用 [named collections](/operations/named-collections) 或 IAM 角色。
- 使用 [system logs](/operations/system-tables/query_log) 和 [session logs](/operations/system-tables/session_log) **审计访问和查询**。

另请参阅 [external authenticators](/operations/external-authenticators) 和 [query complexity settings](/operations/settings/query-complexity)，以管理用户并确保查询/资源限制得到强制执行。

### 配置生存时间 (TTL) {#configure-ttl}

请确保已为 ClickStack 部署[适当配置](/use-cases/observability/clickstack/ttl#modifying-ttl)[生存时间 (TTL)](/use-cases/observability/clickstack/ttl)。这将控制数据的保留时长——默认的 3 天通常需要进行调整。

## MongoDB 指南 {#mongodb-guidelines}

请遵循 MongoDB 官方提供的[安全检查清单](https://www.mongodb.com/docs/manual/administration/security-checklist/)。

## ClickHouse Cloud {#clickhouse-cloud-production}

下文展示了一个基于 ClickHouse Cloud 的 ClickStack 简单部署示例，符合最佳实践。

<VerticalStepper headerLevel="h3">

### 创建服务 {#create-a-service}

按照 [ClickHouse Cloud 入门指南](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service) 创建一个服务。

### 复制连接信息 {#copy-connection-details}

要查找 HyperDX 的连接信息，请进入 ClickHouse Cloud 控制台，并点击侧边栏中的 <b>Connect</b> 按钮，记录 HTTP 连接信息，尤其是 URL。

**虽然可以在此步骤中使用默认显示的用户名和密码连接 HyperDX，但我们建议创建一个专用用户——见下文**

<Image img={connect_cloud} alt="连接 ClickHouse Cloud" size="md" background/>

### 创建 HyperDX 用户 {#create-a-user}

建议为 HyperDX 创建一个专用用户。在 [Cloud SQL 控制台](/cloud/get-started/sql-console) 中运行以下 SQL 命令，并提供满足复杂性要求的安全密码：

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### 为摄取用户做准备 {#prepare-for-ingestion}

创建用于存储数据的 `otel` 数据库，以及仅具有限定权限、用于摄取的 `hyperdx_ingest` 用户。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### 部署 ClickStack {#deploy-clickstack}

部署 ClickStack —— 推荐使用 [Helm](/use-cases/observability/clickstack/deployment/helm) 或 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)（修改为不包含 ClickHouse）这两种部署模型。 

:::note 分别部署组件
如果你是高级用户，可以分别以各自的独立部署模式部署 [OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) 和 [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only)。
:::

关于在 ClickHouse Cloud 中使用 Helm 图表的说明可在[此处](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)找到。使用 Docker Compose 的等效说明可在[此处](/use-cases/observability/clickstack/deployment/docker-compose)找到。

### 访问 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 打开 HyperDX UI。

创建一个用户，并提供满足要求的用户名和密码。 

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

点击 `Create` 后，系统会提示填写连接信息。

### 连接到 ClickHouse Cloud {#connect-to-clickhouse-cloud}

使用前面创建的凭证，填写连接信息并点击 `Create`。

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### 向 ClickStack 发送数据 {#send-data}

要向 ClickStack 发送数据，请参阅[“发送 OpenTelemetry 数据”](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)。

</VerticalStepper>