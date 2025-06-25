---
'slug': '/use-cases/observability/clickstack/production'
'title': '进入生产环境'
'sidebar_label': '生产'
'pagination_prev': null
'pagination_next': null
'description': '与 ClickStack 一起进入生产环境'
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

When deploying ClickStack in production, there are several additional considerations to ensure security, stability, and correct configuration.

## Network and Port Security {#network-security}

通过默认设置，Docker Compose 会在主机上暴露端口，使它们可以从容器外部访问 - 即使启用了像 `ufw` (Uncomplicated Firewall) 这样的工具。 此行为是由于 Docker 网络堆栈，在未明确配置的情况下可以绕过主机级防火墙规则。

**建议：**

仅暴露生产使用所需的端口。通常包括 OTLP 端点、API 服务器和前端。

例如，在 `docker-compose.yml` 文件中移除或注释掉不必要的端口映射：

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API

# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

有关隔离容器和加强访问控制的详细信息，请参阅 [Docker networking documentation](https://docs.docker.com/network/)。

## Session Secret Configuration {#session-secret}

在生产环境中，必须为 `EXPRESS_SESSION_SECRET` 环境变量设置一个强大且随机的值，以保护会话数据并防止篡改。

以下是如何将其添加到您的应用服务 `docker-compose.yml` 文件中的示例：

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

您可以使用 openssl 生成强密钥：

```bash
openssl rand -hex 32
```

避免将密钥提交到源代码控制。 在生产中，考虑使用环境变量管理工具（例如 Docker Secrets、HashiCorp Vault 或特定于环境的 CI/CD 配置）。

## Secure ingestion {#secure-ingestion}

所有数据摄取都应通过 ClickStack 的 OpenTelemetry (OTel) 收集器暴露的 OTLP 端口进行。默认情况下，这需要在启动时生成一个安全的摄取 API 密钥。此密钥在将数据发送到 OTel 端口时是必需的，可以在 HyperDX UI 下的 `Team Settings → API Keys` 找到。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

此外，我们建议为 OTLP 端点启用 TLS 并创建一个 [dedicated user for ClickHouse ingestion](#database-ingestion-user)。

## ClickHouse {#clickhouse}

对于生产部署，我们建议使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，它默认采用行业标准的 [security practices](/cloud/security) - 包括 [enhanced encryption](/cloud/security/cmek)、[authentication and connectivity](/cloud/security/connectivity) 和 [managed access controls](/cloud/security/cloud-access-management)。请参阅 ["ClickHouse Cloud"](#clickhouse-cloud-production) 获取使用 ClickHouse Cloud 和最佳实践的分步指南。

### User Permissions {#user-permissions}

#### HyperDX user {#hyperdx-user}

HyperDX 的 ClickHouse 用户只需是一个 `readonly` 用户，并且能够更改以下设置：

- `max_rows_to_read`（至少达到 100 万）
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

在 OSS 和 ClickHouse Cloud 中，默认用户 `default` 将具备这些权限，但我们建议您创建一个具有这些权限的新用户。

#### Database and ingestion user {#database-ingestion-user}

我们建议为 OTel 收集器创建一个专用用户，以便向 ClickHouse 进行摄取并确保数据发送到特定数据库，例如 `otel`。有关更多细节，请参阅 ["Creating an ingestion user"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)。

### Self-managed security {#self-managed-security}

如果您管理自己的 ClickHouse 实例，启用 **SSL/TLS**、强制身份验证，并遵循加强访问控制的最佳实践是至关重要的。请参阅 [this blog post](https://www.wiz.io/blog/clickhouse-and-wiz) 了解有关实际错误配置及如何避免它们的背景信息。

ClickHouse OSS 提供了强大的安全功能，但需要配置：

- 通过 `tcp_port_secure` 和 `<openSSL>` 在 `config.xml` 中 **使用 SSL/TLS**。请参阅 [guides/sre/configuring-ssl](/guides/sre/configuring-ssl)。
- 为 `default` 用户 **设置强密码** 或禁用它。
- **避免外部暴露 ClickHouse**，除非明确打算。默认情况下，ClickHouse 仅绑定到 `localhost`，除非修改 `listen_host`。
- 使用如密码、证书、SSH 密钥或 [external authenticators](/operations/external-authenticators) 等 **身份验证方法**。
- 使用 IP 过滤和 `HOST` 子句 **限制访问**。请参阅 [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host)。
- 启用 **基于角色的访问控制 (RBAC)** 以授予细粒度权限。请参阅 [operations/access-rights](/operations/access-rights)。
- 使用 [quotas](/operations/quotas)、[settings profiles](/operations/settings/settings-profiles) 和只读模式 **强制执行配额和限制**。
- **加密静态数据** 并使用安全外部存储。请参阅 [operations/storing-data](/operations/storing-data) 和 [cloud/security/CMEK](/cloud/security/cmek)。
- **避免硬编码凭证。** 在 ClickHouse Cloud 中使用 [named collections](/operations/named-collections) 或 IAM 角色。
- 使用 [system logs](/operations/system-tables/query_log) 和 [session logs](/operations/system-tables/session_log) **审计访问和查询**。

另请参见 [external authenticators](/operations/external-authenticators) 和 [query complexity settings](/operations/settings/query-complexity) 以管理用户并确保查询/资源限制。

## MongoDB Guidelines {#mongodb-guidelines}

遵循官方 [MongoDB security checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)。

## ClickHouse Cloud {#clickhouse-cloud-production}

以下是使用 ClickHouse Cloud 的 ClickStack 简单部署，它符合最佳实践。

<VerticalStepper headerLevel="h3">

### Create a service {#create-a-service}

遵循 [getting started guide for ClickHouse Cloud](/cloud/get-started/cloud-quick-start#1-create-a-clickhouse-service) 创建服务。

### Copy connection details {#copy-connection-details}

要找到 HyperDX 的连接详细信息，请导航到 ClickHouse Cloud 控制台并单击侧边栏的 <b>Connect</b> 按钮，记录具体的 HTTP 连接详细信息，特别是 url。

**虽然您可以使用此步骤中显示的默认用户名和密码来连接 HyperDX，但我们建议创建一个专用用户 - 请参见下文**

<Image img={connect_cloud} alt="Connect Cloud" size="md" background/>

### Create a HyperDX user {#create-a-user}

我们建议您为 HyperDX 创建一个专用用户。在 [Cloud SQL console](/cloud/get-started/sql-console) 中运行以下 SQL 命令，提供符合复杂性要求的安全密码：

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### Prepare for ingestion user {#prepare-for-ingestion}

为数据创建一个 `otel` 数据库，并创建一个具有有限权限的 `hyperdx_ingest` 用户进行数据摄取。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### Deploy ClickStack {#deploy-clickstack}

部署 ClickStack - 优选使用 [Helm](/use-cases/observability/clickstack/deployment/helm) 或 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) 部署模型（经过修改以排除 ClickHouse）。

:::note Deploying components separately
高级用户可以将 [OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) 和 [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) 以各自的独立部署模式单独部署。
:::

有关使用 ClickHouse Cloud 的 Helm 图表的说明，请参见 [这里](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)。 Docker Compose 的等效说明可在 [这里](/use-cases/observability/clickstack/deployment/docker-compose)找到。

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。

创建用户，提供符合要求的用户名和密码。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

单击 `Create` 时，系统将提示输入连接详细信息。

### Connect to ClickHouse Cloud {#connect-to-clickhouse-cloud}

使用之前创建的凭证，完成连接详细信息并单击 `Create`。

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### Send data to ClickStack {#send-data}

要将数据发送到 ClickStack，请参阅 ["Sending OpenTelemetry data"](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)。

</VerticalStepper>
