---
'slug': '/use-cases/observability/clickstack/deployment/all-in-one'
'title': '一体化'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 0
'description': '使用一体化部署 ClickStack - ClickHouse 观察性堆栈'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

这个综合的 Docker 镜像捆绑了所有 ClickStack 组件：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) 收集器**（在端口 `4317` 和 `4318` 上暴露 OTLP）
* **MongoDB**（用于持久化应用状态）

此选项包含身份验证，允许在会话和用户之间持久保存仪表板、警报和保存的搜索。

### 适用场景 {#suitable-for}

* 演示
* 全栈的本地测试

## 部署步骤 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 {#deploy-with-docker}

以下命令将运行一个 OpenTelemetry 收集器（在端口 4317 和 4318 上）和 HyperDX 界面（在端口 8080 上）。

```bash
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### 访问 HyperDX 界面 {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX 界面。

创建一个用户，提供符合要求的用户名和密码。

点击 `Create` 后，将为集成的 ClickHouse 实例创建数据源。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

有关使用替代 ClickHouse 实例的示例，请参见 ["创建 ClickHouse Cloud 连接"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 数据摄取 {#ingest-data}

要摄取数据，请参见 ["数据摄取"](/use-cases/observability/clickstack/ingesting-data)。

</VerticalStepper>

## 持久化数据和设置 {#persisting-data-and-settings}

为了在容器重启之间持久保存数据和设置，用户可以修改上述 docker 命令以挂载路径 `/data/db`、`/var/lib/clickhouse` 和 `/var/log/clickhouse-server`。例如：

```bash

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

由于以下原因，此选项不应部署到生产环境：

- **无持久存储：** 所有数据都使用 Docker 原生的覆盖文件系统存储。该设置不支持大规模的性能，如果容器被移除或重启，数据将丢失——除非用户 [挂载所需的文件路径](#persisting-data-and-settings)。
- **缺乏组件隔离：** 所有组件在一个 Docker 容器内运行。这阻止了独立的扩展和监控，并对所有进程全局应用任何 `cgroup` 限制。因此，组件可能会争夺 CPU 和内存。

## 自定义端口 {#customizing-ports-deploy}

如果需要自定义 HyperDX 本地运行的应用（8080）或 API（8000）端口，则需要修改 `docker run` 命令以转发适当的端口并设置一些环境变量。

自定义 OpenTelemetry 端口可以通过修改端口转发标志简单更改。例如，将 `-p 4318:4318` 替换为 `-p 4999:4318` 以将 OpenTelemetry HTTP 端口更改为 4999。

```bash
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## 使用 ClickHouse Cloud {#using-clickhouse-cloud}

此发行版可与 ClickHouse Cloud 一起使用。虽然本地的 ClickHouse 实例仍将被部署（并被忽略），但 OTel 收集器可以通过设置环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD` 来配置为使用 ClickHouse Cloud 实例。

例如：

```bash
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT` 应为 ClickHouse Cloud 的 HTTPS 端点，包括端口 `8443`，例如 `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

连接到 HyperDX 界面后，导航至 [`Team Settings`](http://localhost:8080/team) 并创建与您的 ClickHouse Cloud 服务的连接——然后是所需的来源。有关示例流程，请参见 [此处](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

## 配置 OpenTelemetry 收集器 {#configuring-collector}

如果需要，可以修改 OTel 收集器配置——请参见 ["修改配置"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。
