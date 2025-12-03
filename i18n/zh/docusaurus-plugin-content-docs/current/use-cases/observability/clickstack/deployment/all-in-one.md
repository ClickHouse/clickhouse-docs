---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: '一体化部署'
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: '使用一体化方式部署 ClickStack —— ClickHouse 可观测性技术栈'
doc_type: 'guide'
keywords: ['ClickStack', '可观测性', '一体化', '部署']
---

import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

这个综合性的 Docker 镜像打包了所有 ClickStack 组件：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**（在端口 `4317` 和 `4318` 上暴露 OTLP）
* **MongoDB**（用于持久化应用程序状态）

此选项集成了身份验证功能，支持在不同会话和用户之间持久化仪表板、告警和已保存的搜索。


### 适用场景 {#suitable-for}

* 演示
* 在本地测试整个技术栈

## 部署步骤 {#deployment-steps}

<br/>

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 {#deploy-with-docker}

以下命令将在端口 4317 和 4318 上运行一个 OpenTelemetry collector，并在端口 8080 上运行 HyperDX UI。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### 访问 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX UI。

创建一个用户，并提供满足要求的用户名和密码。 

点击 `Create` 后，将为集成的 ClickHouse 实例创建数据源。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

有关使用其他 ClickHouse 实例的示例，请参阅 [“创建 ClickHouse Cloud 连接”](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 摄取数据 {#ingest-data}

要摄取数据，请参阅[“摄取数据”](/use-cases/observability/clickstack/ingesting-data)。

</VerticalStepper>

## 持久化数据和设置 {#persisting-data-and-settings}

要在容器重启后保留数据和设置，可以修改上面的 docker 命令，将路径 `/data/db`、`/var/lib/clickhouse` 和 `/var/log/clickhouse-server` 挂载到宿主机上。例如：

```shell
# 确保目录存在 {#ensure-directories-exist}
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs
# 修改命令以挂载路径 {#modify-command-to-mount-paths}
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

由于以下原因，此选项不应用于生产环境部署：

- **非持久化存储：** 所有数据都存储在 Docker 原生 overlay 文件系统中。此配置在大规模场景下无法提供足够的性能，并且如果容器被移除或重启，数据将会丢失，除非用户[挂载所需的文件路径](#persisting-data-and-settings)。
- **缺乏组件隔离：** 所有组件都运行在单个 Docker 容器内。这会阻止独立扩缩容和监控，并且会将任何 `cgroup` 限制全局应用于所有进程。其结果是，各组件可能会争用 CPU 和内存资源。

## 自定义端口 {#customizing-ports-deploy}

如果需要自定义 HyperDX Local 运行时使用的应用程序端口（8080）或 API 端口（8000），需要修改 `docker run` 命令来映射相应端口，并设置一些环境变量。

自定义 OpenTelemetry 端口时，只需修改端口映射参数即可。例如，将 `-p 4318:4318` 替换为 `-p 4999:4318`，即可将 OpenTelemetry HTTP 端口修改为 4999。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## 使用 ClickHouse Cloud {#using-clickhouse-cloud}

此发行版可以配合 ClickHouse Cloud 使用。虽然本地 ClickHouse 实例仍然会被部署（但不会被使用），但可以通过设置环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD` 来将 OTel collector 配置为使用 ClickHouse Cloud 实例。

例如：

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT` 应为 ClickHouse Cloud 的 HTTPS 端点，并包含端口 `8443`，例如：`https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

连接到 HyperDX UI 后，转到 [`Team Settings`](http://localhost:8080/team)，为你的 ClickHouse Cloud 服务创建一个连接，然后再创建所需的数据源。有关示例流程，请参见[此处](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。


## 配置 OpenTelemetry collector {#configuring-collector}

如有需要，可以修改 OTel collector 的配置；参见[「修改配置」](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。

<JSONSupport />

例如：

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
