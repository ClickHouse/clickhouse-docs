---
slug: /use-cases/observability/clickstack/production
title: '迁移到生产环境'
sidebar_label: '生产环境'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 迁移到生产环境'
doc_type: 'guide'
keywords: ['clickstack', 'production', 'deployment', 'best practices', 'operations']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

在生产环境中部署 ClickStack 时，还需要额外注意若干事项，以确保安全性、稳定性以及正确的配置。


## 网络和端口安全 {#network-security}

默认情况下,Docker Compose 会在主机上暴露端口,使其可从容器外部访问——即使启用了 `ufw`(Uncomplicated Firewall)等工具。这是因为 Docker 网络栈可以绕过主机级防火墙规则,除非进行显式配置。

**建议:**

仅暴露生产环境所需的端口,通常包括 OTLP 端点、API 服务器和前端。

例如,在 `docker-compose.yml` 文件中删除或注释掉不必要的端口映射:


```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # 仅在 API 需要时使用
# 避免暴露内部端口,如 ClickHouse 8123 或 MongoDB 27017。
```

有关隔离容器和增强访问安全的详细信息，请参阅 [Docker 网络文档](https://docs.docker.com/network/)。


## 会话密钥配置 {#session-secret}

在生产环境中,必须为 `EXPRESS_SESSION_SECRET` 环境变量设置一个强随机值,以保护会话数据并防止篡改。

以下是将其添加到应用服务的 `docker-compose.yml` 文件的方法:

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
    MINER_API_URL: "http://miner:5123"
    MONGO_URI: "mongodb://db:27017/hyperdx"
    NEXT_PUBLIC_SERVER_URL: http://127.0.0.1:${HYPERDX_API_PORT}
    OTEL_SERVICE_NAME: "hdx-oss-api"
    USAGE_STATS_ENABLED: ${USAGE_STATS_ENABLED:-true}
    EXPRESS_SESSION_SECRET: "super-secure-random-string"
  networks:
    - internal
  depends_on:
    - ch-server
    - db1
```

可以使用 openssl 生成强密钥:

```shell
openssl rand -hex 32
```

避免将密钥提交到源代码控制系统。在生产环境中,建议使用环境变量管理工具(例如 Docker Secrets、HashiCorp Vault 或特定环境的 CI/CD 配置)。


## 安全数据接入 {#secure-ingestion}

所有数据接入都应通过 ClickStack 发行版的 OpenTelemetry (OTel) 收集器所暴露的 OTLP 端口进行。默认情况下,这需要在启动时生成的安全接入 API 密钥。向 OTel 端口发送数据时必须使用此密钥,该密钥可在 HyperDX UI 的 `Team Settings → API Keys` 下找到。

<Image img={ingestion_key} alt='接入密钥' size='lg' />

此外,我们建议为 OTLP 端点启用 TLS,并创建一个[用于 ClickHouse 数据接入的专用用户](#database-ingestion-user)。


## ClickHouse {#clickhouse}

对于生产环境部署,我们推荐使用 [ClickHouse Cloud](https://clickhouse.com/cloud),它默认应用行业标准的[安全实践](/cloud/security),包括增强的加密、身份验证和连接性,以及托管式访问控制。请参阅 ["ClickHouse Cloud"](#clickhouse-cloud-production) 获取使用 ClickHouse Cloud 最佳实践的分步指南。

### 用户权限 {#user-permissions}

#### HyperDX 用户 {#hyperdx-user}

用于 HyperDX 的 ClickHouse 用户只需要是一个 `readonly` 用户,并具有更改以下设置的权限:

- `max_rows_to_read`(至少达到 100 万)
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

默认情况下,OSS 和 ClickHouse Cloud 中的 `default` 用户都具有这些权限,但我们建议您创建一个具有这些权限的新用户。

#### 数据库和数据摄取用户 {#database-ingestion-user}

我们建议为 OTel 采集器创建一个专用用户,用于向 ClickHouse 摄取数据,并确保数据摄取发送到特定数据库,例如 `otel`。有关更多详细信息,请参阅 ["创建摄取用户"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)。

### 自管理安全 {#self-managed-security}

如果您正在管理自己的 ClickHouse 实例,启用 **SSL/TLS**、强制身份验证并遵循访问加固的最佳实践至关重要。请参阅[此博客文章](https://www.wiz.io/blog/clickhouse-and-wiz)了解实际错误配置的背景以及如何避免它们。

ClickHouse OSS 开箱即提供强大的安全功能。但是,这些功能需要配置:

- **使用 SSL/TLS**,通过 `config.xml` 中的 `tcp_port_secure` 和 `<openSSL>` 配置。请参阅 [guides/sre/configuring-ssl](/guides/sre/configuring-ssl)。
- 为 `default` 用户**设置强密码**或禁用它。
- **避免将 ClickHouse 暴露到外部**,除非明确需要。默认情况下,ClickHouse 仅绑定到 `localhost`,除非修改了 `listen_host`。
- **使用身份验证方法**,例如密码、证书、SSH 密钥或[外部身份验证器](/operations/external-authenticators)。
- 使用 IP 过滤和 `HOST` 子句**限制访问**。请参阅 [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host)。
- **启用基于角色的访问控制 (RBAC)** 以授予细粒度权限。请参阅 [operations/access-rights](/operations/access-rights)。
- 使用[配额](/operations/quotas)、[设置配置文件](/operations/settings/settings-profiles)和只读模式**强制执行配额和限制**。
- **加密静态数据**并使用安全的外部存储。请参阅 [operations/storing-data](/operations/storing-data) 和 [cloud/security/CMEK](/cloud/security/cmek)。
- **避免硬编码凭据。** 在 ClickHouse Cloud 中使用[命名集合](/operations/named-collections)或 IAM 角色。
- 使用[系统日志](/operations/system-tables/query_log)和[会话日志](/operations/system-tables/session_log)**审计访问和查询**。

另请参阅[外部身份验证器](/operations/external-authenticators)和[查询复杂度设置](/operations/settings/query-complexity),以管理用户并确保查询/资源限制。

### 配置生存时间 (TTL) {#configure-ttl}

确保已为您的 ClickStack 部署[适当配置](/use-cases/observability/clickstack/ttl#modifying-ttl)了[生存时间 (TTL)](/use-cases/observability/clickstack/ttl)。这控制数据保留的时长,默认的 3 天通常需要修改。


## MongoDB 指南 {#mongodb-guidelines}

请遵循官方 [MongoDB 安全检查清单](https://www.mongodb.com/docs/manual/administration/security-checklist/)。


## ClickHouse Cloud {#clickhouse-cloud-production}

以下展示了使用 ClickHouse Cloud 部署 ClickStack 的简单方式,符合最佳实践。

<VerticalStepper headerLevel="h3">

### 创建服务 {#create-a-service}

按照 [ClickHouse Cloud 入门指南](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service)创建服务。

### 复制连接详情 {#copy-connection-details}

要查找 HyperDX 的连接详情,请导航到 ClickHouse Cloud 控制台,点击侧边栏上的 <b>Connect</b> 按钮,记录 HTTP 连接详情,特别是 URL。

**虽然您可以使用此步骤中显示的默认用户名和密码连接 HyperDX,但我们建议创建专用用户 - 请参见下文**

<Image img={connect_cloud} alt='Connect Cloud' size='md' background />

### 创建 HyperDX 用户 {#create-a-user}

我们建议您为 HyperDX 创建专用用户。在 [Cloud SQL 控制台](/cloud/get-started/sql-console)中运行以下 SQL 命令,提供符合复杂性要求的安全密码:

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### 准备数据摄取用户 {#prepare-for-ingestion}

创建用于存储数据的 `otel` 数据库,以及具有有限权限的 `hyperdx_ingest` 摄取用户。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### 部署 ClickStack {#deploy-clickstack}

部署 ClickStack - 推荐使用 [Helm](/use-cases/observability/clickstack/deployment/helm) 或 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)(修改为排除 ClickHouse)部署模式。

:::note 单独部署组件
高级用户可以使用各自的独立部署模式分别部署 [OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) 和 [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only)。
:::

使用 Helm chart 配合 ClickHouse Cloud 的说明可以在[此处](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)找到。Docker Compose 的等效说明可以在[此处](/use-cases/observability/clickstack/deployment/docker-compose)找到。

### 导航到 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。

创建用户,提供符合要求的用户名和密码。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

点击 `Create` 后,系统将提示您输入连接详情。

### 连接到 ClickHouse Cloud {#connect-to-clickhouse-cloud}

使用之前创建的凭据,填写连接详情并点击 `Create`。

<Image img={hyperdx_cloud} alt='HyperDX Cloud' size='md' />

### 向 ClickStack 发送数据 {#send-data}

要向 ClickStack 发送数据,请参阅["发送 OpenTelemetry 数据"](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)。

</VerticalStepper>
