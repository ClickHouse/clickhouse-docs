---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: "一体化部署"
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: "使用一体化方式部署 ClickStack - ClickHouse 可观测性技术栈"
doc_type: "guide"
keywords: ["ClickStack", "observability", "all-in-one", "deployment"]
---

import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"
import Image from "@theme/IdealImage"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import hyperdx_logs from "@site/static/images/use-cases/observability/hyperdx-logs.png"

该 Docker 镜像集成了所有 ClickStack 组件:

- **ClickHouse**
- **HyperDX**
- **OpenTelemetry (OTel) 收集器**(在端口 `4317` 和 `4318` 上暴露 OTLP 协议)
- **MongoDB**(用于持久化应用状态)

此部署方式包含身份验证功能,可在不同会话和用户之间持久化仪表板、告警和已保存的搜索。

### 适用场景 {#suitable-for}

- 演示展示
- 完整技术栈的本地测试


## 部署步骤 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 {#deploy-with-docker}

以下命令将运行一个 OpenTelemetry 收集器(在端口 4317 和 4318 上)和 HyperDX UI(在端口 8080 上)。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### 访问 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以进入 HyperDX UI。

创建一个用户,提供符合要求的用户名和密码。

点击 `Create` 后,将为集成的 ClickHouse 实例创建数据源。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

有关使用其他 ClickHouse 实例的示例,请参阅["创建 ClickHouse Cloud 连接"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 数据导入 {#ingest-data}

要导入数据,请参阅["数据导入"](/use-cases/observability/clickstack/ingesting-data)。

</VerticalStepper>


## 持久化数据和设置 {#persisting-data-and-settings}

为了在容器重启后持久化保存数据和设置,用户可以修改上述 docker 命令来挂载以下路径:`/data/db`、`/var/lib/clickhouse` 和 `/var/log/clickhouse-server`。例如:


```shell
# 确保目录存在
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs
# 修改命令以挂载路径
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

不建议将此方案部署到生产环境,原因如下:

- **非持久化存储:** 所有数据均使用 Docker 原生 overlay 文件系统存储。此配置无法支持大规模场景下的性能需求,且容器删除或重启后数据将会丢失 - 除非用户[挂载所需的文件路径](#persisting-data-and-settings)。
- **缺乏组件隔离:** 所有组件均在单个 Docker 容器内运行。这会导致无法独立扩展和监控,且任何 `cgroup` 限制都会全局应用于所有进程。因此,各组件之间可能会竞争 CPU 和内存资源。


## 自定义端口 {#customizing-ports-deploy}

如果需要自定义 HyperDX Local 运行的应用程序端口(8080)或 API 端口(8000),需要修改 `docker run` 命令来转发相应端口并设置一些环境变量。

自定义 OpenTelemetry 端口只需修改端口转发标志即可。例如,将 `-p 4318:4318` 替换为 `-p 4999:4318`,即可将 OpenTelemetry HTTP 端口更改为 4999。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## 使用 ClickHouse Cloud {#using-clickhouse-cloud}

此发行版可与 ClickHouse Cloud 配合使用。虽然本地 ClickHouse 实例仍会被部署(但会被忽略),但可以通过设置环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD` 来配置 OTel 收集器使用 ClickHouse Cloud 实例。

例如:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT` 应为 ClickHouse Cloud 的 HTTPS 端点,包括端口 `8443`,例如 `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

连接到 HyperDX UI 后,导航至 [`Team Settings`](http://localhost:8080/team) 并创建到您的 ClickHouse Cloud 服务的连接,然后配置所需的数据源。有关示例流程,请参阅[此处](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。


## 配置 OpenTelemetry 收集器 {#configuring-collector}

如需修改 OTel 收集器配置，请参阅["修改配置"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。

<JSONSupport />

例如：

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
