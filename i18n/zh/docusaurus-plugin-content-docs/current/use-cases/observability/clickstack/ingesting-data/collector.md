---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: '适用于 ClickStack 的 OpenTelemetry collector - ClickHouse 可观测性栈'
sidebar_label: 'OpenTelemetry collector'
title: 'ClickStack OpenTelemetry Collector'
doc_type: 'guide'
keywords: ['ClickStack', 'OpenTelemetry collector', 'ClickHouse 可观测性', 'OTel collector 配置', 'OpenTelemetry ClickHouse']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

本页详细介绍如何配置官方 ClickStack OpenTelemetry（OTel）收集器。

## Collector 角色 {#collector-roles}

OpenTelemetry collector 可以以两种主要角色进行部署：

- **Agent** - Agent 实例在边缘侧收集数据，例如在服务器或 Kubernetes 节点上，或者直接从通过 OpenTelemetry SDK 接入的应用程序接收事件。在后一种情况下，Agent 实例与应用程序一起运行，或运行在与应用程序相同的主机上（例如作为 sidecar 或 DaemonSet 守护进程集）。Agent 可以将其数据直接发送到 ClickHouse，或者发送到网关实例。在前一种情况下，这被称为 [Agent 部署模式](https://opentelemetry.io/docs/collector/deployment/agent/)。 

- **Gateway** - Gateway 实例提供一个独立的服务（例如在 Kubernetes 中的一个部署），通常按集群、数据中心或区域划分。这些实例通过单个 OTLP 端点接收来自应用程序（或作为 Agent 的其他 collector）的事件。通常会部署一组 Gateway 实例，并使用开箱即用的负载均衡器在它们之间分发负载。如果所有 Agent 和应用程序都将信号发送到这一单一端点，则通常称为 [Gateway 部署模式](https://opentelemetry.io/docs/collector/deployment/gateway/)。 

**重要：Collector（包括 ClickStack 的默认发行版）默认采用下面描述的 [Gateway 角色](#collector-roles)，从 Agent 或 SDK 接收数据。**

以 Agent 角色部署 OTel collector 的用户通常会使用 [collector 的默认 contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib)，而非 ClickStack 版本，但也可以自由选择其他兼容 OTLP 的技术，例如 [Fluentd](https://www.fluentd.org/) 和 [Vector](https://vector.dev/)。

## 部署收集器 {#configuring-the-collector}

如果你以独立部署的方式自行管理 OpenTelemetry collector（例如仅使用 HyperDX 发行版时），我们[仍然建议在条件允许的情况下使用官方 ClickStack 发行版的 collector](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector) 来承担网关角色。但如果你选择自行提供 collector，请确保其中包含 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)。

### 独立模式 {#standalone}

要以独立模式部署 ClickStack 发行版提供的 OTel 连接器，请运行以下 Docker 命令：

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

请注意，我们可以通过环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 来覆盖目标 ClickHouse 实例的配置。`CLICKHOUSE_ENDPOINT` 应为完整的 ClickHouse HTTP 端点，包括协议和端口，例如：`http://localhost:8123`。

**这些环境变量可用于任何包含该连接器的 Docker 发行版。**

`OPAMP_SERVER_URL` 应指向你的 HyperDX 部署，例如 `http://localhost:4320`。HyperDX 默认在端口 `4320` 的 `/v1/opamp` 上暴露一个 OpAMP（Open Agent Management Protocol，开放代理管理协议）服务器。请确保在运行 HyperDX 的容器中暴露此端口（例如使用 `-p 4320:4320`）。

:::note 暴露并连接到 OpAMP 端口
为了让 collector 能够连接到 OpAMP 端口，该端口必须由 HyperDX 容器暴露，例如 `-p 4320:4320`。在本地测试中，macOS 用户可以将 `OPAMP_SERVER_URL` 设置为 `http://host.docker.internal:4320`。Linux 用户可以使用 `--network=host` 启动 collector 容器。
:::

在生产环境中，应使用具备[相应凭证](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)的专用用户。


### 修改配置 {#modifying-otel-collector-configuration}

#### 使用 Docker {#using-docker}

所有包含 OpenTelemetry collector 的 Docker 镜像，都可以通过环境变量 `OPAMP_SERVER_URL`、`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 配置为连接到某个 ClickHouse 实例：

例如，all-in-one 镜像：

```shell
export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

:::note 镜像名称更新
ClickStack 镜像现在以 `clickhouse/clickstack-*` 的名称发布（此前为 `docker.hyperdx.io/hyperdx/*`）。
:::


#### Docker Compose {#docker-compose-otel}

在 Docker Compose 中，使用与上文相同的环境变量来修改收集器配置：

```yaml
  otel-collector:
    image: hyperdx/hyperdx-otel-collector
    environment:
      CLICKHOUSE_ENDPOINT: 'https://mxl4k3ul6a.us-east-2.aws.clickhouse-staging.com:8443'
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      CLICKHOUSE_USER: 'default'
      CLICKHOUSE_PASSWORD: 'password'
      OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
    ports:
      - '13133:13133' # health_check extension
      - '24225:24225' # fluentd receiver
      - '4317:4317' # OTLP gRPC receiver
      - '4318:4318' # OTLP http receiver
      - '8888:8888' # metrics extension
    restart: always
    networks:
      - internal
```

### 高级配置 {#advanced-configuration}

ClickStack 发行版的 OTel collector 支持通过挂载自定义配置文件并设置环境变量来扩展基础配置。自定义配置会与由 HyperDX 通过 OpAMP 管理的基础配置合并。

#### 扩展 collector 配置 {#extending-collector-config}

要添加自定义 receivers、processors 或 pipelines：

1. 创建一个包含额外配置的自定义配置文件
2. 将该文件挂载到 `/etc/otelcol-contrib/custom.config.yaml`
3. 将环境变量设置为 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`

**自定义配置示例：**

```yaml
receivers:
  # Collect logs from local files
  filelog:
    include:
      - /var/log/**/*.log
      - /var/log/syslog
      - /var/log/messages
    start_at: beginning

  # Collect host system metrics
  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu:
        metrics:
          system.cpu.utilization:
            enabled: true
      memory:
        metrics:
          system.memory.utilization:
            enabled: true
      disk:
      network:
      filesystem:
        metrics:
          system.filesystem.utilization:
            enabled: true

service:
  pipelines:
    # Logs pipeline
    logs/host:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
    
    # Metrics pipeline
    metrics/hostmetrics:
      receivers: [hostmetrics]
      processors:
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

**使用一体化镜像部署：**

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  clickhouse/clickstack-all-in-one:latest
```

**使用独立采集器部署：**

```bash
docker run -d \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-otel-collector:latest
```

:::note
你只需在自定义配置中定义新的 receivers、processors 和 pipelines。基础 processors（`memory_limiter`、`batch`）和 exporter（`clickhouse`）已预先定义——通过名称引用它们即可。自定义配置会与基础配置合并，且不能覆盖已有组件。
:::

对于更复杂的配置，请参考 [默认的 ClickStack 收集器配置](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml) 和 [ClickHouse exporter 文档](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)。


#### 配置结构 {#configuration-structure}

有关如何配置 OTel collector 的详细说明，包括 [`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)、[`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 和 [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors)，建议参考 [官方 OpenTelemetry collector 文档](https://opentelemetry.io/docs/collector/configuration)。

## 保护 collector {#securing-the-collector}

ClickStack 发行版中的 OpenTelemetry collector 内置了对 OpAMP（Open Agent Management Protocol）的支持，用于安全地配置和管理 OTLP 端点。启动时，用户必须提供一个 `OPAMP_SERVER_URL` 环境变量——其值应指向 HyperDX 应用，该应用在 `/v1/opamp` 路径下提供 OpAMP API。

此集成确保 OTLP 端点通过在部署 HyperDX 应用时自动生成的摄取 API key 得到保护。所有发送到 collector 的遥测数据都必须包含此 API key 以完成身份验证。您可以在 HyperDX 应用的 `Team Settings → API Keys` 中找到该 key。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

为了进一步保护您的部署，我们建议：

- 将 collector 配置为通过 HTTPS 与 ClickHouse 通信。
- 为摄取创建一个权限受限的专用用户——参见下文。
- 为 OTLP 端点启用 TLS，确保 SDK/agent 与 collector 之间的通信经过加密。您可以通过[自定义 collector 配置](#extending-collector-config)进行配置。

### 创建摄取用户 {#creating-an-ingestion-user}

我们建议为 OTel collector 在向 ClickHouse 摄取数据时使用，单独创建一个专用数据库和用户。该用户应具有在[由 ClickStack 创建和使用的表](/use-cases/observability/clickstack/ingesting-data/schemas)中创建表并插入数据的权限。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

这里假定 collector 已配置为使用数据库 `otel`。可以通过环境变量 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` 来控制这一点。将该环境变量传递给运行 collector 的镜像，[方式与其他环境变量类似](#modifying-otel-collector-configuration)。

## 处理 —— 过滤、转换和富化 {#processing-filtering-transforming-enriching}

用户在数据摄取过程中通常会希望对事件消息进行过滤、转换和富化。由于无法修改 ClickStack connector 的配置，我们建议需要进一步进行事件过滤和处理的用户采用以下任一方式：

- 部署自有版本的 OTel collector，在其中执行过滤和处理，然后通过 OTLP 将事件发送到 ClickStack collector，以摄取到 ClickHouse 中。
- 部署自有版本的 OTel collector，并使用 ClickHouse exporter 将事件直接发送到 ClickHouse。

如果使用 OTel collector 进行处理，我们建议在网关实例上执行转换工作，并尽量减少在 agent 实例上的工作负载。这样可以确保在边缘、运行在服务器上的 agent 所需资源尽可能少。通常，我们看到用户只在 agent 中执行过滤（以减少不必要的网络使用）、时间戳设置（通过 operators），以及需要上下文的富化操作。例如，如果网关实例位于不同的 Kubernetes 集群中，则需要在 agent 中执行 k8s 富化。

OpenTelemetry 支持以下可供用户利用的处理和过滤功能：

- **Processors** - Processors 获取由 [receivers 收集到的数据并对其进行修改或转换](https://opentelemetry.io/docs/collector/transforming-telemetry/)，然后再发送给 exporters。Processors 按照在 collector 配置中 `processors` 部分指定的顺序应用。这些是可选的，但[通常建议使用一个最小集合](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。在将 OTel collector 与 ClickHouse 一起使用时，我们建议将 processors 限制为：

- 一个 [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)，用于防止 collector 出现内存耗尽情况。建议参见 [Estimating Resources](#estimating-resources)。
- 任何基于上下文执行富化的 processor。例如，[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) 允许使用 k8s 元数据自动为 span、metrics 和 logs 设置 resource 属性，例如用源 pod id 富化事件。
- 如需要 trace 时使用的 [尾部或头部采样（tail/head sampling）](https://opentelemetry.io/docs/concepts/sampling/)。
- [基本过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/) —— 如果无法通过 operator 完成（见下文），则丢弃不需要的事件。
- [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) —— 在与 ClickHouse 一起使用时必不可少，以确保数据以批量方式发送。参见 ["Optimizing inserts"](#optimizing-inserts)。

- **Operators** - [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 提供了在 receiver 侧可用的最基本处理单元。支持基础解析，允许设置诸如 Severity 和 Timestamp 等字段。此处支持 JSON 和正则解析，以及事件过滤和基础转换。我们建议在此执行事件过滤。

我们建议用户避免使用 operators 或 [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) 进行过度的事件处理。这些操作可能带来相当大的内存和 CPU 开销，尤其是 JSON 解析。完全可以在 ClickHouse 插入时通过物化视图和列完成所有处理，但有一些例外 —— 尤其是具备上下文感知的富化，例如添加 k8s 元数据。有关更多详细信息，请参阅 [使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。

### 示例 {#example-processing}

以下配置演示了如何采集这个[非结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)。该配置可用于以 agent 身份运行的 collector，将数据发送到 ClickStack 网关。

请注意，这里使用算子从日志行中提取结构（`regex_parser`）并过滤事件，同时使用处理器对事件进行批处理，以限制内存占用。

```yaml file=code_snippets/ClickStack/config-unstructured-logs-with-processor.yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-unstructured.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<ip>[\d.]+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>[A-Z]+)\s+(?P<url>[^\s]+)\s+HTTP/[^\s]+"\s+(?P<status>\d+)\s+(?P<size>\d+)\s+"(?P<referrer>[^"]*)"\s+"(?P<user_agent>[^"]*)"'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%d/%b/%Y:%H:%M:%S %z'
          #22/Jan/2019:03:56:14 +0330
processors:
  batch:
    timeout: 1s
    send_batch_size: 100
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
    spike_limit_mib: 256
exporters:
  # HTTP 配置
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

  # gRPC 配置（备选）
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 已修改，因同一主机上运行 2 个采集器
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]

```

Note the need to include an [authorization header containing your ingestion API key](#securing-the-collector) in any OTLP communication.

For more advanced configuration, we suggest the [OpenTelemetry collector documentation](https://opentelemetry.io/docs/collector/).

## Optimizing inserts {#optimizing-inserts}

In order to achieve high insert performance while obtaining strong consistency guarantees, users should adhere to simple rules when inserting Observability data into ClickHouse via the ClickStack collector. With the correct configuration of the OTel collector, the following rules should be straightforward to follow. This also avoids [common issues](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse) users encounter when using ClickHouse for the first time.

### Batching {#batching}

By default, each insert sent to ClickHouse causes ClickHouse to immediately create a part of storage containing the data from the insert together with other metadata that needs to be stored. Therefore sending a smaller amount of inserts that each contain more data, compared to sending a larger amount of inserts that each contain less data, will reduce the number of writes required. We recommend inserting data in fairly large batches of at least 1,000 rows at a time. Further details [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

By default, inserts into ClickHouse are synchronous and idempotent if identical. For tables of the merge tree engine family, ClickHouse will, by default, automatically [deduplicate inserts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). This means inserts are tolerant in cases like the following:

- (1) If the node receiving the data has issues, the insert query will time out (or get a more specific error) and not receive an acknowledgment.
- (2) If the data got written by the node, but the acknowledgement can't be returned to the sender of the query because of network interruptions, the sender will either get a timeout or a network error.

From the collector's perspective, (1) and (2) can be hard to distinguish. However, in both cases, the unacknowledged insert can just be retried immediately. As long as the retried insert query contains the same data in the same order, ClickHouse will automatically ignore the retried insert if the original (unacknowledged) insert succeeded.

For this reason, the ClickStack distribution of the OTel collector uses the [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md). This ensures inserts are sent as consistent batches of rows satisfying the above requirements. If a collector is expected to have high throughput (events per second), and at least 5000 events can be sent in each insert, this is usually the only batching required in the pipeline. In this case the collector will flush batches before the batch processor's `timeout` is reached, ensuring the end-to-end latency of the pipeline remains low and batches are of a consistent size.

### Use asynchronous inserts {#use-asynchronous-inserts}

Typically, users are forced to send smaller batches when the throughput of a collector is low, and yet they still expect data to reach ClickHouse within a minimum end-to-end latency. In this case, small batches are sent when the `timeout` of the batch processor expires. This can cause problems and is when asynchronous inserts are required. This issue is rare if users are sending data to the ClickStack collector acting as a Gateway - by acting as aggregators, they alleviate this problem - see [Collector roles](#collector-roles).

If large batches cannot be guaranteed, users can delegate batching to ClickHouse using [Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). With asynchronous inserts, data is inserted into a buffer first and then written to the database storage later or asynchronously respectively.

<Image img={observability_6} alt="Async inserts" size="md"/>

With [asynchronous inserts enabled](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), when ClickHouse ① receives an insert query, the query's data is ② immediately written into an in-memory buffer first. When ③ the next buffer flush takes place, the buffer's data is [sorted](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) and written as a part to the database storage. Note, that the data is not searchable by queries before being flushed to the database storage; the buffer flush is [configurable](/optimize/asynchronous-inserts).

To enable asynchronous inserts for the collector, add `async_insert=1` to the connection string. We recommend users use `wait_for_async_insert=1` (the default) to get delivery guarantees - see [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) for further details.

Data from an async insert is inserted once the ClickHouse buffer is flushed. This occurs either after the [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) is exceeded or after [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) milliseconds since the first INSERT query. If the `async_insert_stale_timeout_ms` is set to a non-zero value, the data is inserted after `async_insert_stale_timeout_ms milliseconds` since the last query. Users can tune these settings to control the end-to-end latency of their pipeline. Further settings that can be used to tune buffer flushing are documented [here](/operations/settings/settings#async_insert). Generally, defaults are appropriate.

:::note Consider Adaptive Asynchronous Inserts
In cases where a low number of agents are in use, with low throughput but strict end-to-end latency requirements, [adaptive asynchronous inserts](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) may be useful. Generally, these are not applicable to high throughput Observability use cases, as seen with ClickHouse.
:::

Finally, the previous deduplication behavior associated with synchronous inserts into ClickHouse is not enabled by default when using asynchronous inserts. If required, see the setting [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Full details on configuring this feature can be found on this [docs page](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), or with a deep dive [blog post](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

## Scaling {#scaling}

The ClickStack OTel collector acts a Gateway instance - see [Collector roles](#collector-roles). These provide a standalone service, typically per data center or per region. These receive events from applications (or other collectors in the agent role) via a single OTLP endpoint. Typically a set of collector instances are deployed, with an out-of-the-box load balancer used to distribute the load amongst them.

<Image img={clickstack_with_gateways} alt="Scaling with gateways" size="lg"/>

The objective of this architecture is to offload computationally intensive processing from the agents, thereby minimizing their resource usage. These ClickStack gateways can perform transformation tasks that would otherwise need to be done by agents. Furthermore, by aggregating events from many agents, the gateways can ensure large batches are sent to ClickHouse - allowing efficient insertion. These gateway collectors can easily be scaled as more agents and SDK sources are added and event throughput increases. 

### Adding Kafka {#adding-kafka}

Readers may notice the above architectures do not use Kafka as a message queue.

Using a Kafka queue as a message buffer is a popular design pattern seen in logging architectures and was popularized by the ELK stack. It provides a few benefits: principally, it helps provide stronger message delivery guarantees and helps deal with backpressure. Messages are sent from collection agents to Kafka and written to disk. In theory, a clustered Kafka instance should provide a high throughput message buffer since it incurs less computational overhead to write data linearly to disk than parse and process a message. In Elastic, for example, tokenization and indexing incurs significant overhead. By moving data away from the agents, you also incur less risk of losing messages as a result of log rotation at the source. Finally, it offers some message reply and cross-region replication capabilities, which might be attractive for some use cases.

However, ClickHouse can handle inserting data very quickly - millions of rows per second on moderate hardware. Backpressure from ClickHouse is rare. Often, leveraging a Kafka queue means more architectural complexity and cost. If you can embrace the principle that logs do not need the same delivery guarantees as bank transactions and other mission-critical data, we recommend avoiding the complexity of Kafka.

However, if you require high delivery guarantees or the ability to replay data (potentially to multiple sources), Kafka can be a useful architectural addition.

<Image img={observability_8} alt="Adding kafka" size="lg"/>

In this case, OTel agents can be configured to send data to Kafka via the [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Gateway instances, in turn, consume messages using the [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). We recommend the Confluent and OTel documentation for further details.

:::note OTel collector configuration
The ClickStack OpenTelemetry collector distribution can be configured with Kafka using [custom collector configuration](#extending-collector-config).
:::

## Estimating resources {#estimating-resources}

Resource requirements for the OTel collector will depend on the event throughput, the size of messages and amount of processing performed. The OpenTelemetry project maintains [benchmarks users](https://opentelemetry.io/docs/collector/benchmarks/) can use to estimate resource requirements.

[In our experience](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), a ClickStack gateway instance with 3 cores and 12GB of RAM can handle around 60k events per second. This assumes a minimal processing pipeline responsible for renaming fields and no regular expressions.

For agent instances responsible for shipping events to a gateway, and only setting the timestamp on the event, we recommend users size based on the anticipated logs per second. The following represent approximate numbers users can use as a starting point:

| Logging rate | Resources to collector agent |
|--------------|------------------------------|
| 1k/second    | 0.2CPU, 0.2GiB              |
| 5k/second    | 0.5 CPU, 0.5GiB             |
| 10k/second   | 1 CPU, 1GiB                 |

## JSON support {#json-support}

<BetaBadge/>

:::warning Beta Feature
JSON type support in **ClickStack** is a **beta feature**. While the JSON type itself is production-ready in ClickHouse 25.3+, its integration within ClickStack is still under active development and may have limitations, change in the future, or contain bugs
:::

ClickStack has beta support for the [JSON type](/interfaces/formats/JSON) from version `2.0.4`.

### Benefits of the JSON type {#benefits-json-type}

The JSON type offers the following benefits to ClickStack users:

- **Type preservation** - Numbers stay numbers, booleans stay booleans—no more flattening everything into strings. This means fewer casts, simpler queries, and more accurate aggregations.
- **Path-level columns** - Each JSON path becomes its own sub-column, reducing I/O. Queries only read the fields they need, unlocking major performance gains over the old Map type which required the entire column to be read in order to query a specific field.
- **Deep nesting just works** - Naturally handle complex, deeply nested structures without manual flattening (as required by the Map type) and subsequent awkward JSONExtract functions.
- **Dynamic, evolving schemas** - Perfect for observability data where teams add new tags and attributes over time. JSON handles these changes automatically, without schema migrations. 
- **Faster queries, lower memory** - Typical aggregations over attributes like `LogAttributes` see 5-10x less data read and dramatic speedups, cutting both query time and peak memory usage.
- **Simple management** - No need to pre-materialize columns for performance. Each field becomes its own sub-column, delivering the same speed as native ClickHouse columns.

### Enabling JSON support {#enabling-json-support}

To enable this support for the collector, set the environment variable `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` on any deployment that includes the collector. This ensures the schemas are created in ClickHouse using the JSON type.

:::note HyperDX support
In order to query the JSON type, support must also be enabled in the HyperDX application layer via the environment variable `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`.
:::

For example:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

### Migrating from map-based schemas to the JSON type {#migrating-from-map-based-schemas-to-json}

:::important Backwards compatibility
The [JSON type](/interfaces/formats/JSON) is **not backwards compatible** with existing map-based schemas. Enabling this feature will create new tables using the `JSON` type and requires manual data migration.
:::

To migrate from the Map-based schemas, follow these steps:

<VerticalStepper headerLevel="h4">

#### Stop the OTel collector {#stop-the-collector}

#### Rename existing tables and update sources {#rename-existing-tables-sources}

Rename existing tables and update data sources in HyperDX. 

For example:

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### Deploy the collector  {#deploy-the-collector}

Deploy the collector with `OTEL_AGENT_FEATURE_GATE_ARG` set.

#### Restart the HyperDX container with JSON schema support {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### Create new data sources {#create-new-data-sources}

Create new data sources in HyperDX pointing to the JSON tables.

</VerticalStepper>

#### Migrating existing data (optional) {#migrating-existing-data}

To move old data into the new JSON tables:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
仅建议用于小于约 100 亿行规模的数据集。以前使用 `Map` 类型存储的数据无法保留类型精度（所有值都被存为字符串）。因此，在这些旧数据过期之前，它们在新的 schema 中会继续显示为字符串，前端可能需要做一定的类型转换。使用 `JSON` 类型存储的新数据则会保留其类型精度。
:::
