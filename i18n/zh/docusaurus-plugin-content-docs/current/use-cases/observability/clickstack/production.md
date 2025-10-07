---
'slug': '/use-cases/observability/clickstack/production'
'title': '投入生产'
'sidebar_label': '生产'
'pagination_prev': null
'pagination_next': null
'description': '使用 ClickStack 投入生产'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

当在生产环境中部署 ClickStack 时，还有几个额外的考虑因素，以确保安全性、稳定性和正确配置。

## 网络和端口安全 {#network-security}

默认情况下，Docker Compose 在主机上暴露端口，使其可以从容器外部访问——即使像 `ufw`（简单防火墙）这样的工具已启用。这种行为是由于 Docker 网络堆栈，它可以绕过主机级防火墙规则，除非明确配置。

**推荐：**

只暴露实际用于生产的端口。通常为 OTLP 端点、API 服务器和前端。

例如，在 `docker-compose.yml` 文件中移除或注释掉不必要的端口映射：

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API

# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

有关隔离容器和增强访问控制的详细信息，请参阅 [Docker 网络文档](https://docs.docker.com/network/)。

## 会话密钥配置 {#session-secret}

在生产中，您必须为 `EXPRESS_SESSION_SECRET` 环境变量设置一个强大且随机的值，以保护会话数据并防止篡改。

以下是如何将其添加到应用服务的 `docker-compose.yml` 文件中的方法：

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

您可以使用 openssl 生成一个强大的密钥：

```shell
openssl rand -hex 32
```

避免将秘密提交到源代码控制中。在生产中，考虑使用环境变量管理工具（例如 Docker Secrets、HashiCorp Vault 或特定环境的 CI/CD 配置）。

## 安全数据接收 {#secure-ingestion}

所有数据接收应通过 ClickStack 分发的 OpenTelemetry（OTel）收集器公开的 OTLP 端口进行。默认情况下，这需要在启动时生成一个安全接收 API 密钥。在将数据发送到 OTel 端口时需要此密钥，可以在 HyperDX UI 中的 `团队设置 → API 密钥` 下找到。

<Image img={ingestion_key} alt="接收密钥" size="lg"/>

此外，我们建议为 OTLP 端点启用 TLS，并创建一个 [点击量接收用户](#database-ingestion-user)。

## ClickHouse {#clickhouse}

对于生产部署，我们建议使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，默认应用行业标准的 [安全实践](/cloud/security/shared-responsibility-model)——包括 [增强加密](/cloud/security/cmek)、[身份验证和连接](/cloud/security/connectivity)以及 [托管访问控制](/cloud/security/cloud-access-management)。有关使用 ClickHouse Cloud 的逐步指南，请参见 ["ClickHouse Cloud"](#clickhouse-cloud-production)。

### 用户权限 {#user-permissions}

#### HyperDX 用户 {#hyperdx-user}

HyperDX 的 ClickHouse 用户只需是一个具有访问以下设置权限的 `readonly` 用户：

- `max_rows_to_read`（至少为 100 万）
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

默认情况下，OSS 和 ClickHouse Cloud 中的 `default` 用户将拥有这些权限，但我们建议您创建一个具有这些权限的新用户。

#### 数据库和接收用户 {#database-ingestion-user}

我们建议为 OTel 收集器创建一个专用用户，用于将数据接入 ClickHouse，并确保数据发送到特定数据库，例如 `otel`。有关详细信息，请参见 ["创建接收用户"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)。

### 自管理安全 {#self-managed-security}

如果您管理自己的 ClickHouse 实例，则必须启用 **SSL/TLS**，强制身份验证，并遵循增强访问的最佳实践。有关真实世界误配置的上下文信息以及如何避免它们，请参见 [这篇博客文章](https://www.wiz.io/blog/clickhouse-and-wiz)。

ClickHouse OSS 提供了开箱即用的强大安全功能。然而，这些需要配置：

- **通过 `tcp_port_secure` 和 `<openSSL>` 使用 SSL/TLS** 在 `config.xml` 中。请参阅 [guides/sre/configuring-ssl](/guides/sre/configuring-ssl)。
- **为 `default` 用户设置强密码** 或禁用密码。
- **避免将 ClickHouse 公开**，除非明确打算。默认情况下，ClickHouse 仅绑定到 `localhost`，除非修改 `listen_host`。
- **使用身份验证方法**，例如密码、证书、SSH 密钥或 [外部身份验证程序](/operations/external-authenticators)。
- **使用 IP 过滤和 `HOST` 子句限制访问**。请参阅 [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host)。
- **启用基于角色的访问控制 (RBAC)** 授予细粒度权限。请参阅 [operations/access-rights](/operations/access-rights)。
- **实施配额和限制**，使用 [quotas](/operations/quotas)、[settings profiles](/operations/settings/settings-profiles) 和只读模式。
- **加密静态数据** 并使用安全外部存储。请参阅 [operations/storing-data](/operations/storing-data) 和 [cloud/security/CMEK](/cloud/security/cmek)。
- **避免硬编码凭据。** 使用 [named collections](/operations/named-collections) 或 ClickHouse Cloud 中的 IAM 角色。
- **使用 [system logs](/operations/system-tables/query_log) 和 [session logs](/operations/system-tables/session_log) 审计访问和查询**。

有关管理用户和确保查询/资源限制的更多信息，请参见 [external authenticators](/operations/external-authenticators) 和 [query complexity settings](/operations/settings/query-complexity)。

### 配置生存时间 (TTL) {#configure-ttl}

确保 [生存时间 (TTL)](/use-cases/observability/clickstack/ttl) 已为您的 ClickStack 部署 [正确配置](/use-cases/observability/clickstack/ttl#modifying-ttl)。这控制数据保留的时间——默认值为 3 天，通常需要修改。

## MongoDB 指南 {#mongodb-guidelines}

遵循官方的 [MongoDB 安全检查清单](https://www.mongodb.com/docs/manual/administration/security-checklist/)。

## ClickHouse Cloud {#clickhouse-cloud-production}

以下代表使用 ClickHouse Cloud 的 ClickStack 简单部署，符合最佳实践。

<VerticalStepper headerLevel="h3">

### 创建服务 {#create-a-service}

请遵循 [ClickHouse Cloud 的入门指南](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service) 创建服务。

### 复制连接详情 {#copy-connection-details}

要查找 HyperDX 的连接详情，请导航到 ClickHouse Cloud 控制台，并单击侧边栏上的 <b>连接</b> 按钮，记录 HTTP 连接详情，特别是 URL。

**虽然您可以使用此步骤中显示的默认用户名和密码连接 HyperDX，但我们建议创建一个专用用户 - 见下文**

<Image img={connect_cloud} alt="连接云" size="md" background/>

### 创建 HyperDX 用户 {#create-a-user}

我们建议您为 HyperDX 创建一个专用用户。在 [Cloud SQL 控制台](/cloud/get-started/sql-console) 中运行以下 SQL 命令，提供符合复杂性要求的安全密码：

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### 准备接收用户 {#prepare-for-ingestion}

为数据创建一个 `otel` 数据库，并创建一个 `hyperdx_ingest` 用户用于数据接收，并设置有限权限。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### 部署 ClickStack {#deploy-clickstack}

部署 ClickStack - 最好采用 [Helm](/use-cases/observability/clickstack/deployment/helm) 或 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)（修改以排除 ClickHouse）部署模型。

:::note 单独部署组件
高级用户可以单独部署 [OTel 收集器](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) 和 [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only)，并使用各自的独立部署模式。
:::

有关使用 Helm chart 与 ClickHouse Cloud 的说明，请参见 [这里](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)。Docker Compose 的同类说明可以在 [这里](/use-cases/observability/clickstack/deployment/docker-compose) 找到。

### 导航到 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。

创建用户，提供满足要求的用户名和密码。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

单击 `创建` 后，系统会提示您输入连接详情。

### 连接到 ClickHouse Cloud {#connect-to-clickhouse-cloud}

使用之前创建的凭据，填写连接详情并单击 `创建`。

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### 发送数据到 ClickStack {#send-data}

要将数据发送到 ClickStack，请查看 ["发送 OpenTelemetry 数据"](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)。

</VerticalStepper>
