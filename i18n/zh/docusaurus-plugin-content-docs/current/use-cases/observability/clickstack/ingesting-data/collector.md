---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: '适用于 ClickStack 的 OpenTelemetry collector——ClickHouse 可观测性栈'
sidebar_label: 'OpenTelemetry collector'
title: 'ClickStack OpenTelemetry Collector'
doc_type: 'guide'
keywords: ['ClickStack', 'OpenTelemetry collector', 'ClickHouse observability', 'OTel collector configuration', 'OpenTelemetry ClickHouse']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

本页包含有关配置官方 ClickStack OpenTelemetry（OTel）collector 的详细说明。


## Collector roles {#collector-roles}

OpenTelemetry collector 可以部署为两种主要角色：

- **Agent** - Agent 实例在边缘收集数据，例如在服务器或 Kubernetes 节点上，或者直接从使用 OpenTelemetry SDK 进行埋点的应用程序接收事件。在后一种情况下，Agent 实例与应用程序一起运行，或运行在与应用程序相同的主机上（例如作为 sidecar 或 DaemonSet 守护进程集）。Agent 可以直接将数据发送到 ClickHouse，或者发送到网关实例。在前一种情况下，这被称为 [Agent 部署模式](https://opentelemetry.io/docs/collector/deployment/agent/)。 

- **Gateway** - Gateway 实例提供一个独立的服务（例如，在 Kubernetes 中的一个部署），通常按集群、数据中心或区域进行划分。它们通过单一 OTLP 端点接收来自应用程序（或作为 Agent 运行的其他 collector）的事件。通常会部署一组 Gateway 实例，并使用开箱即用的负载均衡器在它们之间分发负载。如果所有 Agent 和应用程序都将其信号发送到这个单一端点，这通常被称为 [Gateway 部署模式](https://opentelemetry.io/docs/collector/deployment/gateway/)。 

**重要说明：collector（包括 ClickStack 的默认发行版）默认假定采用[下文所述的 Gateway 角色](#collector-roles)，从 Agent 或 SDK 接收数据。**

以 Agent 角色部署 OTel collectors 的用户通常会使用 [collector 的默认 contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib)，而不是 ClickStack 提供的版本，但也可以自由使用其他兼容 OTLP 的技术，例如 [Fluentd](https://www.fluentd.org/) 和 [Vector](https://vector.dev/)。



## 部署收集器

如果你以独立方式部署并自行管理 OpenTelemetry collector（例如仅使用 HyperDX 发行版时），我们[仍然建议在可行的情况下使用官方 ClickStack 发行版的 collector 作为网关角色](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector)。但如果你选择自带 collector，请确保其中包含 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)。

### 独立模式

要以独立模式部署 ClickStack 发行版的 OTel 收集器，请运行以下 Docker 命令：

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

请注意，我们可以通过环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 覆盖目标 ClickHouse 实例。`CLICKHOUSE_ENDPOINT` 应该是完整的 ClickHouse HTTP 端点地址，包括协议和端口，例如 `http://localhost:8123`。

**这些环境变量可以在任何包含该连接器的 Docker 发行版中使用。**

`OPAMP_SERVER_URL` 应该指向你的 HyperDX 部署，例如 `http://localhost:4320`。HyperDX 默认在端口 `4320` 的 `/v1/opamp` 路径上暴露一个 OpAMP（Open Agent Management Protocol）服务器。请确保从运行 HyperDX 的容器中暴露该端口（例如使用 `-p 4320:4320`）。

:::note Exposing and connecting to the OpAMP port
为了让 collector 连接到 OpAMP 端口，该端口必须由 HyperDX 容器暴露，例如 `-p 4320:4320`。对于本地测试，macOS 用户可以设置 `OPAMP_SERVER_URL=http://host.docker.internal:4320`。Linux 用户可以使用 `--network=host` 启动 collector 容器。
:::

在生产环境中，用户应使用具有[适当凭证](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)的用户。

### 修改配置

#### 使用 Docker

所有包含 OpenTelemetry collector 的 Docker 镜像都可以通过环境变量 `OPAMP_SERVER_URL`、`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 配置为连接 ClickHouse 实例：

例如 all-in-one 镜像：

```shell
export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

#### Docker Compose

使用 Docker Compose 时，可通过与上文相同的环境变量来修改 collector 的配置：

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
      - '13133:13133' # health_check 扩展组件
      - '24225:24225' # Fluentd 接收器
      - '4317:4317' # OTLP gRPC 接收器
      - '4318:4318' # OTLP HTTP 接收器
      - '8888:8888' # 指标扩展组件
    restart: always
    networks:
      - internal
```

### 高级配置

ClickStack 发行版的 OTel collector 支持通过挂载自定义配置文件并设置环境变量来扩展基础配置。自定义配置会与由 HyperDX 通过 OpAMP 管理的基础配置进行合并。


#### 扩展 collector 配置

要添加自定义 receivers、processors 或 pipelines：

1. 创建一个包含所需附加配置的自定义配置文件
2. 将该文件挂载到 `/etc/otelcol-contrib/custom.config.yaml`
3. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`

**自定义配置示例：**

```yaml
receivers:
  # 从本地文件收集日志
  filelog:
    include:
      - /var/log/**/*.log
      - /var/log/syslog
      - /var/log/messages
    start_at: beginning  # 从起始位置开始

  # 收集主机系统指标
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
    # 日志处理管道
    logs/host:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
    
    # 指标处理管道
    metrics/hostmetrics:
      receivers: [hostmetrics]
      processors:
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

**使用 All-in-One 镜像部署：**

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

**使用独立收集器进行部署：**

```bash
docker run -d \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

:::note
只需在自定义配置中定义新的 `receivers`、`processors` 和 `pipelines` 即可。基础 `processors`（`memory_limiter`、`batch`）和 `exporters`（`clickhouse`）已在基础配置中定义——只需按名称引用它们。自定义配置会与基础配置合并，且不能覆盖已有组件。
:::

对于更复杂的配置，请参考 [ClickStack 默认 collector 配置](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml)和 [ClickHouse exporter 文档](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)。

#### 配置结构

关于配置 OTel collectors 的详细信息，包括 [`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)、[`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 和 [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors)，建议参阅 [OpenTelemetry collector 官方文档](https://opentelemetry.io/docs/collector/configuration)。


## 保障 collector 的安全性

ClickStack 发行版中的 OpenTelemetry collector 内置支持 OpAMP（Open Agent Management Protocol），用于安全地配置和管理 OTLP 端点。启动时，用户必须提供一个 `OPAMP_SERVER_URL` 环境变量 —— 它应指向 HyperDX 应用，该应用在 `/v1/opamp` 路径上托管 OpAMP API。

此集成可确保 OTLP 端点使用在部署 HyperDX 应用时自动生成的摄取 API key 进行保护。所有发送到 collector 的遥测数据都必须包含此 API key 才能通过身份验证。您可以在 HyperDX 应用的 `Team Settings → API Keys` 中找到该 API key。

<Image img={ingestion_key} alt="摄取密钥" size="lg" />

为了进一步保护部署，我们建议：

* 将 collector 配置为通过 HTTPS 与 ClickHouse 通信。
* 为摄取创建一个具有限制权限的专用用户（见下文）。
* 为 OTLP 端点启用 TLS，以确保 SDKs/agents 与 collector 之间的通信是加密的。可以通过[自定义 collector 配置](#extending-collector-config)进行配置。

### 创建摄取用户

我们建议为 OTel collector 在 ClickHouse 中创建一个专用的数据库和用户，用于数据摄取。该用户应具有在[ClickStack 创建和使用的表](/use-cases/observability/clickstack/ingesting-data/schemas)上建表和插入数据的权限。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

这里假设收集器已配置为使用数据库 `otel`。可以通过环境变量 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` 来进行控制。将该环境变量传递给托管收集器的镜像，[方式与其他环境变量类似](#modifying-otel-collector-configuration)。


## 处理——过滤、转换和丰富 {#processing-filtering-transforming-enriching}

用户在摄取过程中通常都会希望对事件消息进行过滤、转换和丰富。由于无法修改 ClickStack connector 的配置，我们建议需要进一步事件过滤和处理的用户采取以下任一方式：

- 部署自建的 OTel collector，在其中执行过滤和处理，然后通过 OTLP 将事件发送到 ClickStack collector，以摄取到 ClickHouse 中。
- 部署自建的 OTel collector，并使用 ClickHouse exporter 将事件直接发送到 ClickHouse。

如果使用 OTel collector 进行处理，我们建议在网关实例上执行转换操作，并尽量减少在 agent 实例上执行的工作量。这样可以确保边缘（在服务器上运行）的 agent 所需资源尽可能少。通常，我们看到用户只在 agent 中执行过滤（以减少不必要的网络使用）、时间戳设置（通过 operators）以及需要上下文的丰富操作。例如，如果网关实例位于不同的 Kubernetes 集群中，则需要在 agent 中执行 k8s 丰富。

OpenTelemetry 支持以下可供用户利用的处理和过滤功能：

- **Processors（处理器）** - Processors 会对 [receivers 收集到的数据进行修改或转换](https://opentelemetry.io/docs/collector/transforming-telemetry/)，然后再发送到 exporters。Processors 按照 collector 配置中 `processors` 部分中的顺序应用。这些是可选的，但[通常推荐使用一组最小推荐处理器](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。在将 OTel collector 与 ClickHouse 一起使用时，我们建议将 processors 限制为：

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) 用于防止 collector 出现内存耗尽的情况。推荐配置参见 [Estimating Resources](#estimating-resources)。
- 任何基于上下文进行丰富的 processor。例如，[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) 允许根据 k8s 元数据自动设置 spans、metrics 和 logs 的资源属性，例如使用其源 pod id 丰富事件。
- 如有需要，可为 traces 使用 [tail 或 head 采样](https://opentelemetry.io/docs/concepts/sampling/)。
- [基础过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/)——如果无法通过 operator（见下文）完成，则可在此丢弃不需要的事件。
- [Batching（批处理）](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor)——与 ClickHouse 协同工作时必不可少，以确保数据以批次发送。参见 [“Optimizing inserts”](#optimizing-inserts)。

- **Operators（操作符）** - [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 提供了 receiver 侧可用的最基本处理单元。支持基础解析，允许设置诸如 Severity 和 Timestamp 等字段。这里支持 JSON 和正则解析，同时也支持事件过滤和基础转换。我们建议在此执行事件过滤。

我们建议用户避免通过 operators 或 [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) 进行过度的事件处理。这些操作可能会产生较大的内存和 CPU 开销，尤其是 JSON 解析。通过在 ClickHouse 中利用物化视图和列，在插入时完成所有处理是可行的，少数情况除外——特别是依赖上下文的丰富操作，例如添加 k8s 元数据。更多详情请参见 [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql)。

### 示例 {#example-processing}

下面的配置展示了对该 [非结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz) 的采集。该配置可由扮演 agent 角色的 collector 使用，将数据发送到 ClickStack 网关。

请注意这里使用 operators 从日志行中提取结构（`regex_parser`）并过滤事件，同时使用 processor 对事件进行批处理并限制内存使用。



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
      authorization: <您的摄取 API 密钥>
    compression: gzip

  # gRPC 配置(备选)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <您的 API 摄取密钥>
    compression: gzip
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 已修改,因同一主机上运行 2 个采集器
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]

```

请注意，在任何 OTLP 通信中，都需要在 [authorization header 中包含你的摄取 API key](#securing-the-collector)。

如需更高级的配置，我们建议查阅 [OpenTelemetry collector 文档](https://opentelemetry.io/docs/collector/)。


## 优化插入 {#optimizing-inserts}

为了在获得强一致性保证的同时实现高插入性能，用户在通过 ClickStack collector 向 ClickHouse 插入可观测性数据时，应遵循一些简单规则。只要正确配置 OTel collector，遵循以下规则应当比较容易。这也可以避免用户在首次使用 ClickHouse 时遇到的[常见问题](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。

### 批处理 {#batching}

默认情况下，每次发送到 ClickHouse 的 insert 都会使 ClickHouse 立即创建一个包含本次插入数据以及其他需要存储的元数据的存储 part。因此，相比发送大量每次只包含较少数据的 insert，发送较少次数但每次包含更多数据的 insert 会减少所需的写入次数。我们建议每次以至少 1,000 行的较大批次插入数据。更多细节见[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。

默认情况下，插入到 ClickHouse 的操作是同步的，并且对相同数据是幂等的。对于 MergeTree 引擎族的表，ClickHouse 默认会自动[对插入进行去重](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。这意味着在如下情况下插入是容错的：

- (1) 如果接收数据的节点出现问题，insert 查询将会超时（或得到更具体的错误），并且无法收到确认。
- (2) 如果数据已经被该节点写入，但由于网络中断，确认无法返回给查询的发送方，则发送方会收到超时或网络错误。

从 collector 的角度来看，(1) 和 (2) 可能很难区分。然而在这两种情况下，都可以直接重试未被确认的 insert。只要重试的 insert 查询中包含的数据及其顺序与原始（未被确认的）insert 完全相同，如果原始插入成功，ClickHouse 将自动忽略这次重试插入。

基于此原因，ClickStack 发行版中附带的 OTel collector 使用了 [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)。这可以确保插入以满足上述要求的、内容一致的行批次发送。如果预计某个 collector 具有高吞吐量（events per second），并且每次 insert 至少可以发送 5000 个 event，那么这通常是 pipeline 中唯一需要的批处理方式。在这种情况下，collector 会在 batch processor 的 `timeout` 达到前刷新批次，从而确保 pipeline 的端到端延迟保持较低且批次大小一致。

### 使用异步插入 {#use-asynchronous-inserts}

通常，当 collector 的吞吐量较低时，用户被迫发送较小的批次，但仍期望数据在端到端尽可能低的延迟内到达 ClickHouse。在这种情况下，当 batch processor 的 `timeout` 到期时会发送小批次。这可能会导致问题，此时就需要使用异步插入。如果用户将数据发送到作为网关的 ClickStack collector，这个问题相对少见——collector 作为聚合器，可以缓解这一问题——参见 [Collector roles](#collector-roles)。

如果无法保证大批次，用户可以通过使用[异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)，将批处理委托给 ClickHouse。使用异步插入时，数据会先插入到一个缓冲区，然后再被异步或稍后写入数据库存储。

<Image img={observability_6} alt="异步插入" size="md"/>

在[启用异步插入](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)后，当 ClickHouse ① 接收到 insert 查询时，该查询的数据会 ② 立即先写入内存缓冲区。当 ③ 下一次缓冲区刷新发生时，缓冲区中的数据会被[排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)，并作为一个 part 写入数据库存储。注意，在数据刷新到数据库存储之前，它是无法被查询检索到的；缓冲区刷新的行为是[可配置的](/optimize/asynchronous-inserts)。

要为 collector 启用异步插入，请在连接字符串中添加 `async_insert=1`。我们建议用户使用 `wait_for_async_insert=1`（默认值）以获得投递保证——更多细节参见[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。



来自异步插入的数据会在 ClickHouse 缓冲区被刷新后写入。刷新会在超过 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) 或自第一次 INSERT 查询以来经过 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 毫秒后发生。如果将 `async_insert_stale_timeout_ms` 设置为非零值，则会在自上一次查询以来经过 `async_insert_stale_timeout_ms` 毫秒后插入数据。用户可以调优这些设置以控制其管道的端到端延迟。可用于调优缓冲区刷新的更多设置记录在[此处](/operations/settings/settings#async_insert)。通常，默认值已足够合适。

:::note 考虑自适应异步插入
在仅使用少量 agent、吞吐量较低但对端到端延迟有严格要求的场景下，[自适应异步插入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) 可能会很有用。一般而言，对于 ClickHouse 中常见的高吞吐量可观测性场景，它们通常并不适用。
:::

最后，使用异步插入时，此前与同步插入 ClickHouse 相关的去重行为在默认情况下不会启用。如有需要，请参阅设置 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)。

有关配置此功能的完整说明，请参阅此[文档页面](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，或阅读更深入的[博客文章](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。



## 扩展 {#scaling}

ClickStack OTel collector 充当 Gateway 实例——参见 [Collector roles](#collector-roles)。这些实例通常以每个数据中心或每个区域为粒度，作为独立服务提供能力。它们通过单个 OTLP 端点接收来自应用程序（或处于 agent 角色的其他 collector）的事件。通常会部署一组 collector 实例，并通过现成的负载均衡器在它们之间分发负载。

<Image img={clickstack_with_gateways} alt="通过网关实现扩展" size="lg"/>

这种架构的目标是将计算密集型处理从 agent 中卸载，从而最小化 agent 的资源使用。ClickStack gateway 可以执行原本需要由 agent 承担的转换任务。此外，通过聚合来自众多 agent 的事件，gateway 可以确保以大批量形式将数据发送到 ClickHouse，从而实现高效写入。随着更多 agent 和 SDK 数据源的加入以及事件吞吐量的增长，这些 gateway collector 可以很容易地水平扩展。 

### 添加 Kafka {#adding-kafka}

读者可能会注意到，上述架构中并未使用 Kafka 作为消息队列。

在日志架构中，使用 Kafka 队列作为消息缓冲区是一种常见的设计模式，并由 ELK stack 推广开来。它带来了一些好处：主要是有助于提供更强的消息投递保证，并帮助处理背压。消息从采集 agent 发送到 Kafka 并写入磁盘。理论上，Kafka 集群应当能提供高吞吐量的消息缓冲，因为线性写入磁盘的数据在计算上比解析和处理消息的开销更低。例如，在 Elastic 中，分词和索引会产生显著的开销。通过将数据从 agent 中移出，也可以降低因源端日志轮转导致消息丢失的风险。最后，它还提供了消息重放和跨区域复制等功能，对某些使用场景可能具有吸引力。

然而，ClickHouse 能以极高的速度写入数据——在中等硬件上每秒可写入数百万行。从 ClickHouse 产生背压的情况很少见。很多时候，引入 Kafka 队列反而会增加架构复杂度和成本。如果你能够接受“日志并不需要像银行交易或其他关键任务数据那样的投递保证”这一原则，我们建议避免引入 Kafka 所带来的额外复杂性。

但是，如果你确实需要很强的投递保证，或需要重放数据（可能重放到多个下游），Kafka 仍然可以是一个有用的架构组件。

<Image img={observability_8} alt="添加 Kafka" size="lg"/>

在这种情况下，可以将 OTel agent 配置为通过 [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) 向 Kafka 发送数据。Gateway 实例则通过 [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) 消费消息。更多细节建议参考 Confluent 和 OTel 的文档。

:::note OTel collector 配置
ClickStack OpenTelemetry collector 发行版可以通过 [custom collector configuration](#extending-collector-config) 配置对 Kafka 的支持。
:::



## 预估资源 {#estimating-resources}

OTel collector 的资源需求取决于事件吞吐量、消息大小以及执行的处理工作量。OpenTelemetry 项目维护了[基准测试](https://opentelemetry.io/docs/collector/benchmarks/)，用户可以用来估算资源需求。

[根据我们的经验](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)，一台具有 3 个核心和 12GB 内存的 ClickStack 网关实例大约可以处理每秒 60k 个事件。这是在仅使用负责重命名字段且不包含正则表达式的最小处理流水线的前提下得出的。

对于负责将事件转发到网关、且仅在事件上设置时间戳的 agent 实例，我们建议用户根据预期的每秒日志量进行容量规划。以下为可作为起点的近似数值：

| 日志速率 | collector agent 的资源 |
|--------------|------------------------------|
| 1k/second    | 0.2 CPU，0.2 GiB             |
| 5k/second    | 0.5 CPU，0.5 GiB             |
| 10k/second   | 1 CPU，1 GiB                 |



## JSON 支持

<BetaBadge />

:::warning 测试版功能
**ClickStack** 中对 JSON 类型的支持目前是**测试版功能**。尽管 JSON 类型本身在 ClickHouse 25.3+ 中已可用于生产环境，但其在 ClickStack 中的集成仍在积极开发中，可能存在功能限制、未来会发生变更，或包含缺陷。
:::

从 `2.0.4` 版本开始，ClickStack 对 [JSON 类型](/interfaces/formats/JSON) 提供测试版支持。

### JSON 类型的优势

JSON 类型为 ClickStack 用户带来以下优势：

* **类型保留** - 数字仍然是数字，布尔值仍然是布尔值——不再需要把所有内容都展平为字符串。这意味着更少的类型转换、更简单的查询以及更精确的聚合。
* **路径级列** - 每个 JSON 路径都会成为自己的子列，从而减少 I/O。查询只会读取所需的字段，相较于旧的 Map 类型（为查询特定字段需要读取整列数据），可以获得显著的性能提升。
* **深度嵌套开箱即用** - 可自然处理复杂、深度嵌套的结构，无需像 Map 类型那样手动展平以及后续笨拙的 JSONExtract 函数。
* **可动态演进的 schema** - 非常适合可观测性数据，团队会随着时间推移不断添加新的标签和属性。JSON 能自动处理这些变化，而无需进行 schema 迁移。
* **更快的查询，更低的内存占用** - 对 `LogAttributes` 这类属性进行典型聚合时，读取的数据量可减少 5–10 倍，并显著加速查询，同时降低查询时间和峰值内存使用。
* **简单的管理** - 无需为了性能预先物化列。每个字段都会成为独立的子列，能够提供与原生 ClickHouse 列相同的查询速度。

### 启用 JSON 支持

要为采集器启用此支持，请在包含采集器的任意部署上设置环境变量 `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'`。这将确保在 ClickHouse 中使用 JSON 类型创建相应的 schema。

:::note HyperDX 支持
为了能够查询 JSON 类型，还必须在 HyperDX 应用层通过环境变量 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 启用支持。
:::

例如：

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

### 从基于 Map 的模式迁移到 JSON 类型

:::important 向后兼容性
[JSON 类型](/interfaces/formats/JSON) 与现有的基于 Map 的模式**不向后兼容**。启用此功能将使用 `JSON` 类型创建新表，并且需要手动迁移数据。
:::

要从基于 Map 的模式迁移，请按以下步骤操作：

<VerticalStepper headerLevel="h4">
  #### 停止 OTel collector

  #### 重命名现有表并更新数据源

  重命名现有表，并在 HyperDX 中更新数据源。

  例如：

  ```sql
  RENAME TABLE otel_logs TO otel_logs_map;
  RENAME TABLE otel_metrics TO otel_metrics_map;
  ```

  #### 部署 collector

  设置好 `OTEL_AGENT_FEATURE_GATE_ARG` 后部署 collector。

  #### 重启支持 JSON 模式的 HyperDX 容器

  ```shell
  export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
  ```

  #### 创建新的数据源

  在 HyperDX 中创建指向 JSON 表的新数据源。
</VerticalStepper>

#### 迁移现有数据（可选）

要将旧数据迁移到新的 JSON 表中：

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
仅建议用于行数小于约 100 亿的数据集。先前使用 Map 类型存储的数据并未保留类型精度（所有值都为字符串）。因此，在旧数据过期之前，这些数据在新模式中会以字符串形式呈现，前端需要进行相应的类型转换。对于新写入的数据，其类型将通过 JSON 类型得到保留。
:::
