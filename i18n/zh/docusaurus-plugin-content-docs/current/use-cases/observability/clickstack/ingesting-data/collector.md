---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: 'ClickStack 的 OpenTelemetry 采集器 - ClickHouse 可观测性栈'
sidebar_label: 'OpenTelemetry 采集器'
title: 'ClickStack OpenTelemetry 采集器'
doc_type: 'guide'
keywords: ['ClickStack', 'OpenTelemetry 采集器', 'ClickHouse observability', 'OTel 采集器配置', 'OpenTelemetry ClickHouse']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

本页介绍如何配置官方 ClickStack OpenTelemetry（OTel）采集器的详细信息。


## 收集器角色 {#collector-roles}

OpenTelemetry 收集器可以部署为两种主要角色:

- **代理(Agent)** - 代理实例在边缘收集数据,例如在服务器上或 Kubernetes 节点上,或直接从使用 OpenTelemetry SDK 进行插桩的应用程序接收事件。在后一种情况下,代理实例与应用程序一起运行或在应用程序所在的同一主机上运行(例如作为 Sidecar 或 DaemonSet)。代理可以将数据直接发送到 ClickHouse 或发送到网关实例。前一种情况被称为[代理部署模式](https://opentelemetry.io/docs/collector/deployment/agent/)。

- **网关(Gateway)** - 网关实例提供独立服务(例如 Kubernetes 中的部署),通常按集群、数据中心或区域部署。这些实例通过单个 OTLP 端点从应用程序(或作为代理的其他收集器)接收事件。通常会部署一组网关实例,使用开箱即用的负载均衡器在它们之间分配负载。如果所有代理和应用程序都将信号发送到这个单一端点,这通常被称为[网关部署模式](https://opentelemetry.io/docs/collector/deployment/gateway/)。

**重要提示:收集器(包括 ClickStack 的默认发行版)采用[下文描述的网关角色](#collector-roles),从代理或 SDK 接收数据。**

以代理角色部署 OTel 收集器的用户通常会使用[收集器的默认 Contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib)而不是 ClickStack 版本,但也可以自由使用其他 OTLP 兼容技术,例如 [Fluentd](https://www.fluentd.org/) 和 [Vector](https://vector.dev/)。


## 部署采集器 {#configuring-the-collector}

如果您在独立部署中管理自己的 OpenTelemetry 采集器(例如使用仅限 HyperDX 的发行版时),我们[建议在可能的情况下仍然使用官方 ClickStack 发行版的采集器](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector)来担任网关角色,但如果您选择使用自己的采集器,请确保它包含 [ClickHouse 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)。

### 独立模式 {#standalone}

要以独立模式部署 ClickStack 发行版的 OTel 连接器,请运行以下 docker 命令:

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

请注意,我们可以使用环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 来覆盖目标 ClickHouse 实例。`CLICKHOUSE_ENDPOINT` 应该是完整的 ClickHouse HTTP 端点,包括协议和端口,例如 `http://localhost:8123`。

**这些环境变量可以与任何包含连接器的 docker 发行版一起使用。**

`OPAMP_SERVER_URL` 应该指向您的 HyperDX 部署,例如 `http://localhost:4320`。HyperDX 默认在端口 `4320` 的 `/v1/opamp` 路径上暴露一个 OpAMP(开放代理管理协议)服务器。请确保从运行 HyperDX 的容器中暴露此端口(例如,使用 `-p 4320:4320`)。

:::note 暴露并连接到 OpAMP 端口
要使采集器连接到 OpAMP 端口,必须由 HyperDX 容器暴露该端口,例如 `-p 4320:4320`。对于本地测试,macOS 用户可以设置 `OPAMP_SERVER_URL=http://host.docker.internal:4320`。Linux 用户可以使用 `--network=host` 启动采集器容器。
:::

在生产环境中,用户应该使用具有[适当凭据](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)的用户。

### 修改配置 {#modifying-otel-collector-configuration}

#### 使用 docker {#using-docker}

所有包含 OpenTelemetry 采集器的 docker 镜像都可以通过环境变量 `OPAMP_SERVER_URL`、`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 配置为使用 ClickHouse 实例:

例如一体化镜像:

```shell
export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

#### Docker Compose {#docker-compose-otel}

使用 Docker Compose 时,使用与上述相同的环境变量修改采集器配置:

```yaml
otel-collector:
  image: hyperdx/hyperdx-otel-collector
  environment:
    CLICKHOUSE_ENDPOINT: "https://mxl4k3ul6a.us-east-2.aws.clickhouse-staging.com:8443"
    HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
    CLICKHOUSE_USER: "default"
    CLICKHOUSE_PASSWORD: "password"
    OPAMP_SERVER_URL: "http://app:${HYPERDX_OPAMP_PORT}"
  ports:
    - "13133:13133" # health_check extension
    - "24225:24225" # fluentd receiver
    - "4317:4317" # OTLP gRPC receiver
    - "4318:4318" # OTLP http receiver
    - "8888:8888" # metrics extension
  restart: always
  networks:
    - internal
```

### 高级配置 {#advanced-configuration}

ClickStack 发行版的 OTel 采集器支持通过挂载自定义配置文件并设置环境变量来扩展基础配置。自定义配置将与 HyperDX 通过 OpAMP 管理的基础配置合并。


#### 扩展采集器配置 {#extending-collector-config}

要添加自定义接收器、处理器或管道：

1. 创建包含额外配置的自定义配置文件
2. 将文件挂载到 `/etc/otelcol-contrib/custom.config.yaml`
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
    start_at: beginning

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
    # 日志管道
    logs/host:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse

    # 指标管道
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
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
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
  docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

:::note
您只需在自定义配置中定义新的接收器、处理器和管道。基础处理器（`memory_limiter`、`batch`）和导出器（`clickhouse`）已经预定义——直接通过名称引用即可。自定义配置会与基础配置合并，不能覆盖现有组件。
:::

对于更复杂的配置，请参考 [ClickStack 采集器默认配置](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml) 和 [ClickHouse 导出器文档](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)。

#### 配置结构 {#configuration-structure}

有关配置 OTel 采集器的详细信息，包括 [`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)、[`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 和 [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors)，建议参考 [OpenTelemetry 采集器官方文档](https://opentelemetry.io/docs/collector/configuration)。


## 保护采集器 {#securing-the-collector}

ClickStack 发行版的 OpenTelemetry 采集器内置支持 OpAMP(开放代理管理协议),用于安全地配置和管理 OTLP 端点。启动时,用户必须提供 `OPAMP_SERVER_URL` 环境变量——该变量应指向 HyperDX 应用程序,该应用程序在 `/v1/opamp` 路径托管 OpAMP API。

此集成确保 OTLP 端点使用自动生成的数据摄取 API 密钥进行保护,该密钥在部署 HyperDX 应用程序时创建。发送到采集器的所有遥测数据都必须包含此 API 密钥以进行身份验证。您可以在 HyperDX 应用程序的 `Team Settings → API Keys` 下找到该密钥。

<Image img={ingestion_key} alt='数据摄取密钥' size='lg' />

为了进一步保护您的部署,我们建议:

- 配置采集器通过 HTTPS 与 ClickHouse 通信。
- 创建具有受限权限的专用数据摄取用户 - 见下文。
- 为 OTLP 端点启用 TLS,确保 SDK/代理与采集器之间的加密通信。这可以通过[自定义采集器配置](#extending-collector-config)进行配置。

### 创建数据摄取用户 {#creating-an-ingestion-user}

我们建议为 OTel 采集器创建专用数据库和用户,用于向 ClickHouse 摄取数据。该用户应具有创建和插入 [ClickStack 创建和使用的表](/use-cases/observability/clickstack/ingesting-data/schemas)的能力。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

这假设采集器已配置为使用数据库 `otel`。这可以通过环境变量 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` 进行控制。将此变量传递给托管采集器的镜像,[类似于其他环境变量](#modifying-otel-collector-configuration)。


## 处理 - 过滤、转换和丰富 {#processing-filtering-transforming-enriching}

用户通常希望在数据摄取过程中对事件消息进行过滤、转换和丰富。由于 ClickStack 连接器的配置无法修改,我们建议需要进一步进行事件过滤和处理的用户采用以下方式之一:

- 部署自己的 OTel collector 版本来执行过滤和处理,通过 OTLP 将事件发送到 ClickStack collector 以摄取到 ClickHouse 中。
- 部署自己的 OTel collector 版本,使用 ClickHouse exporter 直接将事件发送到 ClickHouse。

如果使用 OTel collector 进行处理,我们建议在网关实例上执行转换,并最小化在代理实例上完成的工作。这将确保在服务器上运行的边缘代理所需的资源尽可能少。通常,我们看到用户仅在代理中执行过滤(以最小化不必要的网络使用)、时间戳设置(通过 operators)以及需要上下文的丰富操作。例如,如果网关实例位于不同的 Kubernetes 集群中,则 k8s 丰富操作需要在代理中进行。

OpenTelemetry 支持以下用户可以利用的处理和过滤功能:

- **Processors** - Processors 接收由 [receivers 收集的数据并对其进行修改或转换](https://opentelemetry.io/docs/collector/transforming-telemetry/),然后再将其发送到 exporters。Processors 按照 collector 配置中 `processors` 部分配置的顺序应用。这些是可选的,但[通常建议](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)使用最小集合。在将 OTel collector 与 ClickHouse 一起使用时,我们建议将 processors 限制为:

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) 用于防止 collector 出现内存不足的情况。有关建议,请参阅[估算资源](#estimating-resources)。
- 任何基于上下文进行丰富的 processor。例如,[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) 允许使用 k8s 元数据自动设置 spans、metrics 和 logs 的资源属性,例如使用源 pod id 丰富事件。
- 如果 traces 需要,[尾部或头部采样](https://opentelemetry.io/docs/concepts/sampling/)。
- [基本过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 如果无法通过 operator 完成(见下文),则丢弃不需要的事件。
- [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - 在使用 ClickHouse 时至关重要,以确保数据以批次方式发送。请参阅["优化插入"](#optimizing-inserts)。

- **Operators** - [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 提供 receiver 中可用的最基本的处理单元。支持基本解析,允许设置 Severity 和 Timestamp 等字段。这里支持 JSON 和正则表达式解析,以及事件过滤和基本转换。我们建议在此处执行事件过滤。

我们建议用户避免使用 operators 或 [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) 进行过多的事件处理。这些可能会产生相当大的内存和 CPU 开销,尤其是 JSON 解析。可以在插入时使用物化视图和列在 ClickHouse 中完成所有处理,但有一些例外 - 特别是上下文感知的丰富操作,例如添加 k8s 元数据。有关更多详细信息,请参阅[使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。

### 示例 {#example-processing}

以下配置展示了对此[非结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)的收集。此配置可由代理角色的 collector 使用,将数据发送到 ClickStack 网关。

请注意使用 operators 从日志行中提取结构(`regex_parser`)和过滤事件,以及使用 processor 批处理事件和限制内存使用。


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

  # gRPC 配置(备选)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
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

请注意，在任何 OTLP 通信中都需要包含[携带摄取 API 密钥的授权头](#securing-the-collector)。

若需要更高级的配置，请参考 [OpenTelemetry collector 文档](https://opentelemetry.io/docs/collector/)。


## 优化插入操作 {#optimizing-inserts}

为了在保证强一致性的同时实现高插入性能,用户在通过 ClickStack 收集器向 ClickHouse 插入可观测性数据时应遵循一些简单的规则。通过正确配置 OTel 收集器,遵循以下规则应该非常简单。这也可以避免用户首次使用 ClickHouse 时遇到的[常见问题](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。

### 批处理 {#batching}

默认情况下,发送到 ClickHouse 的每个插入操作都会导致 ClickHouse 立即创建一个存储部分,其中包含插入的数据以及需要存储的其他元数据。因此,发送少量包含更多数据的插入操作,相比发送大量包含较少数据的插入操作,可以减少所需的写入次数。我们建议每次以较大的批次插入数据,至少 1,000 行。更多详细信息请参见[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。

默认情况下,向 ClickHouse 的插入操作是同步的,并且在内容相同的情况下具有幂等性。对于 MergeTree 引擎系列的表,ClickHouse 默认会自动[对插入进行去重](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。这意味着插入操作在以下情况下具有容错性:

- (1) 如果接收数据的节点出现问题,插入查询将超时(或收到更具体的错误)并且不会收到确认。
- (2) 如果数据已被节点写入,但由于网络中断无法将确认返回给查询发送者,发送者将收到超时或网络错误。

从收集器的角度来看,(1) 和 (2) 可能难以区分。然而,在这两种情况下,未确认的插入都可以立即重试。只要重试的插入查询包含相同顺序的相同数据,如果原始(未确认的)插入成功,ClickHouse 将自动忽略重试的插入。

因此,OTel 收集器的 ClickStack 发行版使用[批处理器](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)。这确保插入操作以满足上述要求的一致批次形式发送。如果收集器预期具有高吞吐量(每秒事件数),并且每次插入至少可以发送 5000 个事件,这通常是管道中唯一需要的批处理。在这种情况下,收集器将在批处理器的 `timeout` 到达之前刷新批次,确保管道的端到端延迟保持较低,并且批次大小保持一致。

### 使用异步插入 {#use-asynchronous-inserts}

通常,当收集器的吞吐量较低时,用户被迫发送较小的批次,但他们仍然期望数据在最小的端到端延迟内到达 ClickHouse。在这种情况下,当批处理器的 `timeout` 过期时会发送小批次。这可能会导致问题,此时需要使用异步插入。如果用户将数据发送到充当网关的 ClickStack 收集器,这个问题就很少见——通过充当聚合器,它们可以缓解这个问题——请参见[收集器角色](#collector-roles)。

如果无法保证大批次,用户可以使用[异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)将批处理委托给 ClickHouse。使用异步插入时,数据首先插入到缓冲区中,然后再异步写入数据库存储。

<Image img={observability_6} alt='异步插入' size='md' />

[启用异步插入](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)后,当 ClickHouse ① 接收到插入查询时,查询的数据 ② 首先立即写入内存缓冲区。当 ③ 下一次缓冲区刷新发生时,缓冲区的数据会被[排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)并作为一个部分写入数据库存储。请注意,在刷新到数据库存储之前,数据无法被查询检索;缓冲区刷新是[可配置的](/optimize/asynchronous-inserts)。

要为收集器启用异步插入,请在连接字符串中添加 `async_insert=1`。我们建议用户使用 `wait_for_async_insert=1`(默认值)以获得交付保证——更多详细信息请参见[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。


来自异步插入的数据会在 ClickHouse 缓冲区刷新后被写入。缓冲区会在超过 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) 限制时刷新，或者在首次 INSERT 查询之后经过 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 毫秒后刷新。如果将 `async_insert_stale_timeout_ms` 设置为非零值，则数据会在距离上一次查询经过 `async_insert_stale_timeout_ms` 毫秒后写入。用户可以通过调节这些设置来控制其管道的端到端延迟。可用于调优缓冲区刷新的更多设置记录在[此处](/operations/settings/settings#async_insert)。通常，默认值就足够合适。

:::note 考虑自适应异步插入
在仅使用少量 agent、吞吐量较低但对端到端延迟有严格要求的场景中，[自适应异步插入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts)可能会很有用。总体来说，对于 ClickHouse 中常见的高吞吐可观测性场景，这些机制通常并不适用。
:::

最后，在使用异步插入时，ClickHouse 以往与同步插入相关的去重行为默认不会启用。如有需要，请参阅设置 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)。

关于配置此功能的完整说明，请参见这个[文档页面](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，或者阅读这篇更深入的[博客文章](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。



## 扩展 {#scaling}

ClickStack OTel 收集器充当网关实例 - 请参阅[收集器角色](#collector-roles)。这些实例提供独立服务,通常每个数据中心或每个区域部署一个。它们通过单个 OTLP 端点从应用程序(或处于代理角色的其他收集器)接收事件。通常会部署一组收集器实例,并使用开箱即用的负载均衡器在它们之间分配负载。

<Image img={clickstack_with_gateways} alt='使用网关进行扩展' size='lg' />

此架构的目标是将计算密集型处理从代理卸载,从而最大限度地减少其资源占用。这些 ClickStack 网关可以执行原本需要由代理完成的转换任务。此外,通过聚合来自多个代理的事件,网关可以确保将大批量数据发送到 ClickHouse,从而实现高效插入。随着更多代理和 SDK 源的添加以及事件吞吐量的增加,这些网关收集器可以轻松扩展。

### 添加 Kafka {#adding-kafka}

读者可能会注意到上述架构没有使用 Kafka 作为消息队列。

使用 Kafka 队列作为消息缓冲区是日志架构中常见的设计模式,由 ELK 技术栈推广开来。它提供了一些优势:主要是帮助提供更强的消息传递保证并帮助处理背压。消息从收集代理发送到 Kafka 并写入磁盘。理论上,集群化的 Kafka 实例应该提供高吞吐量的消息缓冲区,因为将数据线性写入磁盘比解析和处理消息产生的计算开销更小。例如在 Elastic 中,分词和索引会产生显著的开销。通过将数据从代理移出,您还可以降低因源端日志轮转而丢失消息的风险。最后,它提供了一些消息重放和跨区域复制功能,这对某些用例可能很有吸引力。

然而,ClickHouse 可以非常快速地处理数据插入 - 在中等硬件上每秒可插入数百万行。来自 ClickHouse 的背压很少见。通常,使用 Kafka 队列意味着更高的架构复杂性和成本。如果您能够接受日志不需要像银行交易和其他关键任务数据那样的传递保证这一原则,我们建议避免引入 Kafka 的复杂性。

但是,如果您需要高传递保证或重放数据的能力(可能发送到多个目标),Kafka 可以成为有用的架构补充。

<Image img={observability_8} alt='添加 kafka' size='lg' />

在这种情况下,可以将 OTel 代理配置为通过 [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) 将数据发送到 Kafka。网关实例则使用 [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) 消费消息。我们建议参考 Confluent 和 OTel 文档以获取更多详细信息。

:::note OTel 收集器配置
ClickStack OpenTelemetry 收集器发行版可以使用[自定义收集器配置](#extending-collector-config)来配置 Kafka。
:::


## 资源估算 {#estimating-resources}

OTel 采集器的资源需求取决于事件吞吐量、消息大小以及所执行的处理量。OpenTelemetry 项目维护了[基准测试](https://opentelemetry.io/docs/collector/benchmarks/),用户可以使用这些基准来估算资源需求。

[根据我们的经验](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview),配置 3 核 CPU 和 12GB 内存的 ClickStack 网关实例可以处理约每秒 60k 个事件。这里假设使用最小化的处理管道,仅负责字段重命名且不使用正则表达式。

对于负责将事件传输到网关并仅设置事件时间戳的代理实例,我们建议用户根据预期的每秒日志量来确定资源配置。以下数值可作为起始参考:

| 日志速率 | 采集器代理所需资源 |
| ------------ | ---------------------------- |
| 1k/秒    | 0.2 CPU, 0.2GiB               |
| 5k/秒    | 0.5 CPU, 0.5GiB              |
| 10k/秒   | 1 CPU, 1GiB                  |


## JSON 支持 {#json-support}

<BetaBadge />

:::warning Beta 功能
**ClickStack** 中的 JSON 类型支持是一个 **beta 功能**。虽然 JSON 类型本身在 ClickHouse 25.3+ 中已可用于生产环境,但其在 ClickStack 中的集成仍在积极开发中,可能存在限制、未来可能发生变化或包含错误
:::

ClickStack 从版本 `2.0.4` 开始对 [JSON 类型](/interfaces/formats/JSON) 提供 beta 支持。

### JSON 类型的优势 {#benefits-json-type}

JSON 类型为 ClickStack 用户提供以下优势:

- **类型保留** - 数字保持为数字,布尔值保持为布尔值——不再将所有内容扁平化为字符串。这意味着更少的类型转换、更简单的查询以及更准确的聚合。
- **路径级列** - 每个 JSON 路径都成为独立的子列,减少 I/O。查询仅读取所需的字段,相比旧的 Map 类型(需要读取整个列才能查询特定字段)实现了显著的性能提升。
- **深层嵌套开箱即用** - 自然处理复杂的深层嵌套结构,无需手动扁平化(Map 类型所需)以及后续繁琐的 JSONExtract 函数。
- **动态演进的模式** - 非常适合可观测性数据,团队可以随时间添加新标签和属性。JSON 自动处理这些变化,无需模式迁移。
- **更快的查询,更低的内存** - 对 `LogAttributes` 等属性的典型聚合读取的数据减少 5-10 倍,速度显著提升,同时减少查询时间和峰值内存使用量。
- **简化管理** - 无需为性能预先物化列。每个字段都成为独立的子列,提供与原生 ClickHouse 列相同的速度。

### 启用 JSON 支持 {#enabling-json-support}

要为收集器启用此支持,请在包含收集器的任何部署上设置环境变量 `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'`。这确保在 ClickHouse 中使用 JSON 类型创建模式。

:::note HyperDX 支持
为了查询 JSON 类型,还必须通过环境变量 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 在 HyperDX 应用层启用支持。
:::

例如:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

### 从基于 Map 的模式迁移到 JSON 类型 {#migrating-from-map-based-schemas-to-json}

:::important 向后兼容性
[JSON 类型](/interfaces/formats/JSON) 与现有的基于 Map 的模式**不向后兼容**。启用此功能将使用 `JSON` 类型创建新表,并需要手动数据迁移。
:::

要从基于 Map 的模式迁移,请按照以下步骤操作:

<VerticalStepper headerLevel="h4">

#### 停止 OTel 收集器 {#stop-the-collector}

#### 重命名现有表并更新数据源 {#rename-existing-tables-sources}

重命名现有表并更新 HyperDX 中的数据源。

例如:

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### 部署收集器 {#deploy-the-collector}

部署设置了 `OTEL_AGENT_FEATURE_GATE_ARG` 的收集器。

#### 重启支持 JSON 模式的 HyperDX 容器 {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### 创建新数据源 {#create-new-data-sources}

在 HyperDX 中创建指向 JSON 表的新数据源。

</VerticalStepper>

#### 迁移现有数据(可选) {#migrating-existing-data}

要将旧数据移动到新的 JSON 表中:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
仅建议用于小于约 100 亿行的数据集。以前使用 Map 类型存储的数据未保留类型精度(所有值都是字符串)。因此,这些旧数据在新模式中将显示为字符串,直到过期,需要在前端进行一些类型转换。新数据的类型将通过 JSON 类型保留。
:::
