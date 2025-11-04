---
'slug': '/use-cases/observability/clickstack/deployment/all-in-one'
'title': '一体化'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 0
'description': '使用 All In One 部署 ClickStack - ClickHouse 观察性堆栈'
'doc_type': 'guide'
---

import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

这个综合的 Docker 镜像包含所有 ClickStack 组件：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) 收集器**（在端口 `4317` 和 `4318` 上暴露 OTLP）
* **MongoDB**（用于持久化应用状态）

此选项包括身份验证，使仪表板、警报和保存的查询在会话和用户之间保持一致。

### 适合的场景 {#suitable-for}

* 演示
* 完整堆栈的本地测试

## 部署步骤 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 {#deploy-with-docker}

下面的命令将运行一个 OpenTelemetry 收集器（在端口 4317 和 4318 上）和 HyperDX 用户界面（在端口 8080 上）。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### 访问 HyperDX 用户界面 {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 来访问 HyperDX 用户界面。

创建一个用户，提供符合要求的用户名和密码。

单击 `Create` 后，将为集成的 ClickHouse 实例创建数据源。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

有关使用替代 ClickHouse 实例的示例，请参见 [“创建 ClickHouse Cloud 连接”](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 数据摄取 {#ingest-data}

要摄取数据，请参见 [“数据摄取”](/use-cases/observability/clickstack/ingesting-data)。

</VerticalStepper>

## 持久化数据和设置 {#persisting-data-and-settings}

为了在容器重启之间持久化数据和设置，用户可以修改上述 Docker 命令以挂载路径 `/data/db`、`/var/lib/clickhouse` 和 `/var/log/clickhouse-server`。例如：

```shell

# ensure directories exist
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs

# modify command to mount paths
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## 部署到生产环境 {#deploying-to-production}

此选项不应部署到生产环境，原因如下：

- **非持久性存储：**所有数据使用 Docker 本地的覆盖文件系统存储。此设置不支持大规模性能，如果删除或重启容器，将会丢失数据——除非用户 [挂载所需文件路径](#persisting-data-and-settings)。
- **缺乏组件隔离：**所有组件在单个 Docker 容器中运行。这阻止了独立扩展和监视，并将任何 `cgroup` 限制全局应用于所有进程。因此，组件可能会争夺 CPU 和内存。

## 自定义端口 {#customizing-ports-deploy}

如果您需要自定义 HyperDX 本地运行的应用程序（8080）或 API（8000）端口，您需要修改 `docker run` 命令以转发相应的端口并设置几个环境变量。

自定义 OpenTelemetry 端口可以通过修改端口转发标志轻松更改。例如，将 `-p 4318:4318` 替换为 `-p 4999:4318` 将 OpenTelemetry HTTP 端口更改为 4999。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## 使用 ClickHouse Cloud {#using-clickhouse-cloud}

此发行版可以与 ClickHouse Cloud 一起使用。虽然仍将部署本地的 ClickHouse 实例（并被忽略），但 OTel 收集器可以通过设置环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD` 来配置使用 ClickHouse Cloud 实例。

例如：

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT` 应为 ClickHouse Cloud HTTPS 端点，包括端口 `8443`，例如 `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

连接到 HyperDX 用户界面后，访问 [`Team Settings`](http://localhost:8080/team)，并创建到您的 ClickHouse Cloud 服务的连接，随后添加所需的数据源。有关示例流程，请参见 [这里](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

## 配置 OpenTelemetry 收集器 {#configuring-collector}

如有需要，可以修改 OTel 收集器配置 - 请参见 [“修改配置”](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。

<JSONSupport/>

例如：

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
