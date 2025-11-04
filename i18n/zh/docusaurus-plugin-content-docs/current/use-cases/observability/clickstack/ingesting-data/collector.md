---
'slug': '/use-cases/observability/clickstack/ingesting-data/otel-collector'
'pagination_prev': null
'pagination_next': null
'description': '用于 ClickStack 的 OpenTelemetry 收集器 - ClickHouse 可观察性栈'
'sidebar_label': 'OpenTelemetry Collector'
'title': 'ClickStack OpenTelemetry Collector'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

此页面包含有关配置官方 ClickStack OpenTelemetry (OTel) 收集器的详细信息。

## 收集器角色 {#collector-roles}

OpenTelemetry 收集器可以以两种主要角色部署：

- **代理** - 代理实例在边缘收集数据，例如在服务器或 Kubernetes 节点上，或直接从应用程序接收事件 - 这些应用程序通过 OpenTelemetry SDK 进行工具化。在后者中，代理实例与应用程序一起运行，或者与应用程序在同一主机上运行（例如作为侧车或 DaemonSet）。代理可以直接将数据发送到 ClickHouse 或发送到网关实例。在前一种情况下，这被称为 [代理部署模式](https://opentelemetry.io/docs/collector/deployment/agent/)。

- **网关** - 网关实例提供独立服务（例如，在 Kubernetes 中的部署），通常按集群、数据中心或区域提供。这些实例通过单个 OTLP 端点接收来自应用程序（或作为代理的其他收集器）的事件。通常会部署一组网关实例，并使用开箱即用的负载均衡器在它们之间分配负载。如果所有代理和应用程序都将其信号发送到这个单一端点，通常被称为 [网关部署模式](https://opentelemetry.io/docs/collector/deployment/gateway/)。

**重要：包括在 ClickStack 的默认分发中，收集器假定如下所述的 [网关角色](#collector-roles)，接收来自代理或 SDK 的数据。**

以代理角色部署 OTel 收集器的用户通常使用 [收集器的默认贡献分发版](https://github.com/open-telemetry/opentelemetry-collector-contrib)，而不是 ClickStack 版本，但可以自由使用其他兼容 OTLP 的技术，例如 [Fluentd](https://www.fluentd.org/) 和 [Vector](https://vector.dev/)。

## 部署收集器 {#configuring-the-collector}

如果您在独立部署中管理自己的 OpenTelemetry 收集器 - 例如，使用仅限 HyperDX 的发行版 - 我们 [建议仍然使用官方 ClickStack 的收集器分发版](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector) 作为可能的网关角色，但如果您选择自带，请确保它包含 [ClickHouse 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)。

### 独立模式 {#standalone}

要在独立模式下部署 ClickStack 发行版的 OTel 连接器，请运行以下 docker 命令：

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

请注意，我们可以使用环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 重写目标 ClickHouse 实例。`CLICKHOUSE_ENDPOINT` 应该是完整的 ClickHouse HTTP 端点，包括协议和端口 - 例如 `http://localhost:8123`。

**这些环境变量可以与包含连接器的任何 docker 发行版一起使用。**

`OPAMP_SERVER_URL` 应指向您的 HyperDX 部署 - 例如 `http://localhost:4320`。HyperDX 默认在端口 `4320` 的 `/v1/opamp` 上暴露一个 OpAMP（开放代理管理协议）服务器。确保从运行 HyperDX 的容器中暴露此端口（例如，使用 `-p 4320:4320`）。

:::note 暴露并连接到 OpAMP 端口
为了让收集器连接到 OpAMP 端口，必须通过 HyperDX 容器暴露该端口，例如 `-p 4320:4320`。对于本地测试，OSX 用户可以设置 `OPAMP_SERVER_URL=http://host.docker.internal:4320`。Linux 用户可以使用 `--network=host` 启动收集器容器。
:::

用户在生产中应使用 [适当凭据的用户](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)。

### 修改配置 {#modifying-otel-collector-configuration}

#### 使用 docker {#using-docker}

所有包含 OpenTelemetry 收集器的 docker 镜像都可以通过环境变量 `OPAMP_SERVER_URL`、`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 配置为使用 ClickHouse 实例：

例如，所有功能合并的镜像：

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

使用 Docker Compose，通过上面相同的环境变量修改收集器配置：

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

目前，ClickStack 发行版的 OTel 收集器不支持修改其配置文件。如果您需要更复杂的配置，例如 [配置 TLS](#securing-the-collector)，或修改批处理大小，我们建议复制和修改 [默认配置](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml)，并使用文档中记录的 ClickHouse 导出器自行部署 OTel 收集器 [在这里](/observability/integrating-opentelemetry#exporting-to-clickhouse) 和 [这里](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)。

OpenTelemetry (OTel) 收集器的默认 ClickStack 配置可以在 [这里](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml) 找到。

#### 配置结构 {#configuration-structure}

有关配置 OTel 收集器的详细信息，包括 [`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)、[`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 和 [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors)，我们建议参考 [官方 OpenTelemetry 收集器文档](https://opentelemetry.io/docs/collector/configuration)。

## 保护收集器 {#securing-the-collector}

ClickStack 发行版的 OpenTelemetry 收集器包括对 OpAMP（开放代理管理协议）的内置支持，它用于安全配置和管理 OTLP 端点。启动时，用户必须提供 `OPAMP_SERVER_URL` 环境变量 - 这应指向 HyperDX 应用程序，该应用程序在 `/v1/opamp` 处托管 OpAMP API。

此集成确保 OTLP 端点通过在 HyperDX 应用程序部署时生成的自动生成的接收 API 密钥进行保护。发送到收集器的所有遥测数据必须包括此 API 密钥以进行身份验证。您可以在 HyperDX 应用程序的 `团队设置 → API 密钥` 中找到此密钥。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

为了进一步保护您的部署，我们建议：

- 配置收集器通过 HTTPS 与 ClickHouse 通信。
- 创建一个具有有限权限的专用接收用户 - 见下文。
- 启用 OTLP 端点的 TLS，确保 SDK/代理与收集器之间的加密通信。**目前，这要求用户自行部署收集器的默认分发版并管理配置**。

### 创建接收用户 {#creating-an-ingestion-user}

我们建议为 OTel 收集器在 ClickHouse 中创建一个专用数据库和用户用于接收。这应该具有在 [ClickStack 创建和使用的表中创建和插入的能力](/use-cases/observability/clickstack/ingesting-data/schemas)。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

这假设收集器已配置为使用数据库 `otel`。可以通过环境变量 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` 控制此项。将此项传递给托管收集器的镜像 [类似于其他环境变量](#modifying-otel-collector-configuration)。

## 处理 - 过滤、转换和丰富 {#processing-filtering-transforming-enriching}

用户通常希望在接收过程中过滤、转换和丰富事件消息。由于 ClickStack 连接器的配置无法修改，我们建议需要进一步事件过滤和处理的用户：

- 部署自己版本的 OTel 收集器，执行过滤和处理，通过 OTLP 将事件发送到 ClickStack 收集器以接收进入 ClickHouse。
- 部署自己版本的 OTel 收集器，直接使用 ClickHouse 导出器将事件发送到 ClickHouse。

如果通过 OTel 收集器进行处理，我们建议在网关实例执行转换任务，并尽量减少在代理实例上进行的任何工作。这将确保在边缘运行的代理所需的资源尽可能少。通常，我们看到用户仅执行过滤（以最小化不必要的网络使用）、时间戳设置（通过运算符）和丰富，这需要代理中的上下文。例如，如果网关实例位于不同的 Kubernetes 集群中，将需要在代理中进行 k8s 丰富。

OpenTelemetry 支持以下处理和过滤特性，用户可以利用：

- **处理器** - 处理器从 [接收器收集的数据并修改或转换](https://opentelemetry.io/docs/collector/transforming-telemetry/) 后发送到导出器。处理器按配置在收集器配置的 `processors` 部分中的顺序应用。这些是可选的，但通常建议最小集合为 [推荐处理器](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。在与 ClickHouse 一起使用 OTel 收集器时，我们建议将处理器限制为：

- 使用 [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) 防止收集器出现内存不足问题。有关建议，请参见 [估算资源](#estimating-resources)。
- 任何基于上下文进行丰富的处理器。例如， [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) 允许自动设置跨度、度量和日志资源属性，使用 k8s 元数据丰富事件，例如通过源 pod ID 丰富事件。
- 如果需要针对跟踪的 [尾部或头部抽样](https://opentelemetry.io/docs/concepts/sampling/)。
- [基本过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 如果无法通过运算符（见下文）执行，丢弃不需要的事件。
- [批量处理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - 在与 ClickHouse 一起工作时确保以批处理方式发送数据的关键。请参阅 ["优化插入"](#optimizing-inserts)。

- **运算符** - [运算符](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 提供接收器可用的最基本的处理单元。支持基本解析，允许设置字段如严重性和时间戳。支持 JSON 和正则表达式的解析，以及事件过滤和基本转换。我们建议在此执行事件过滤。

我们建议用户避免使用运算符或 [转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) 进行过量的事件处理。这可能会造成 considerable memory 和 CPU 开销，特别是 JSON 解析。在插入时可以在 ClickHouse 中进行所有处理， materialized views 和具有一些例外的列 - 特别是上下文感知丰富，例如添加 k8s 元数据。有关更多详细信息，请参见 [使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。

### 例子 {#example-processing}

以下配置显示了如何收集此 [非结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)。此配置可以被在代理角色中发送数据到 ClickStack 网关的收集器使用。

注意使用运算符从日志行提取结构（`regex_parser`）和过滤事件，以及使用处理器对事件进行批处理和限制内存使用。

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
  # HTTP setup
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

  # gRPC setup (alternative)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]

```

请注意，在任何 OTLP 通信中需要包含 [包含您的接收 API 密钥的授权头](#securing-the-collector)。

有关更高级的配置，我们建议查看 [OpenTelemetry 收集器文档](https://opentelemetry.io/docs/collector/)。

## 优化插入 {#optimizing-inserts}

为了在将可观察性数据通过 ClickStack 收集器插入 ClickHouse 时实现高插入性能，同时获得强一致性保证，用户在插入时应遵循一些简单规则。通过正确配置 OTel 收集器，以下规则应该容易遵循。这也避免了用户在首次使用 ClickHouse 时遇到的 [常见问题](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。

### 批处理 {#batching}

默认情况下，每个插入到 ClickHouse 的请求都会导致 ClickHouse 立即创建一个存储部分，其中包含插入的数据以及需要存储的其他元数据。因此，发送较小数量的插入，每个插入包含更多数据，相比之下发送较多数量的插入，每个插入包含较少数据，将减少所需的写入次数。我们建议以至少 1,000 行的相当大批量插入数据。有关更进一步的信息，请参见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。

默认情况下，插入到 ClickHouse 是同步且相同的时是幂等的。对于 MergeTree 引擎系列的表，ClickHouse 默认情况下会自动 [去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。这意味着在以下情况下，插入是容忍的：

- (1) 如果接收数据的节点出现问题，插入查询将超时（或收到更具体的错误），并且不会收到确认。
- (2) 如果数据已由节点写入，但由于网络中断无法将确认返回给查询发送方，发送方将获得超时或网络错误。

从收集器的角度来看，(1) 和 (2) 可能难以区分。然而，在两种情况下，未确认的插入可以立即重试。只要重试的插入查询包含相同的数据且顺序相同，即使原始（未确认的）插入成功，ClickHouse 也会自动忽略重试的插入。

因此，ClickStack 发行版的 OTel 收集器使用 [批处理处理器](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)。这确保插入作为一致的行批次发送，以满足上述要求。如果预计收集器的吞吐量很高（事件每秒），并且每次插入可以发送至少 5000 个事件，那么通常这就是管道中所需的唯一批处理。在这种情况下，收集器将在达到批处理处理器的 `timeout` 之前刷新批量，确保管道的端到端延迟保持低且批次大小一致。

### 使用异步插入 {#use-asynchronous-inserts}

通常，当收集器的吞吐量低时，用户被迫发送较小的批量，而他们仍然期望数据在最低的端到端延迟内到达 ClickHouse。在这种情况下，当批处理处理器的 `timeout` 到期时，会发送小批量。这可能会导致问题，并且这是需要异步插入的情况。如果用户向充当网关的 ClickStack 收集器发送数据，就会较少出现这个问题 - 作为聚合器，它们缓解了这个问题 - 请参见 [收集器角色](#collector-roles)。

如果大批量无法得到保证，用户可以使用 [异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) 将批处理委托给 ClickHouse。使用异步插入时，数据首先插入到缓冲区，然后在稍后或异步地写入到数据库存储。

<Image img={observability_6} alt="Async inserts" size="md"/>

如果 [启用异步插入](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，当 ClickHouse ① 收到插入查询时，该查询的数据会立即写入内存缓冲区。然后当 ③ 下一个缓冲区刷新发生时，缓冲区的数据会 [排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 并作为部分写入数据库存储。请注意，在刷新到数据库存储之前，数据在查询中不可搜索；缓冲区刷新是 [可配置的](/optimize/asynchronous-inserts)。

要为收集器启用异步插入，请将 `async_insert=1` 添加到连接字符串中。我们建议用户使用 `wait_for_async_insert=1`（默认值）以获得交付保证 - 查询详情请见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

异步插入的数据在 ClickHouse 缓冲区刷新后插入。这发生在超过 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) 或在第一次 INSERT 查询以来超过 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 毫秒的情况下。如果设置 `async_insert_stale_timeout_ms` 为非零值，则数据将在上次查询以来的 `async_insert_stale_timeout_ms 毫秒` 后插入。用户可以调整这些设置以控制其管道的端到端延迟。有关可以用来调整缓冲区刷新的进一步设置，请在 [这里](/operations/settings/settings#async_insert) 查看。通常，默认值是合适的。

:::note 考虑自适应异步插入
在少量代理使用且吞吐量低，但具有严格的端到端延迟要求的情况下，自适应异步插入可能会有用。通常，这些不适用于高吞吐量的可观察性用例，如 ClickHouse。
:::

最后，当使用异步插入时，不会默认启用与同步插入到 ClickHouse 相关的去重行为。如果需要，请参见设置 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)。

有关配置此功能的完整详细信息，请参见此 [文档页面](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，或深入的 [博客文章](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

## 扩展 {#scaling}

ClickStack OTel 收集器充当网关实例 - 请参见 [收集器角色](#collector-roles)。这些提供独立服务，通常按数据中心或区域提供。这些通过单个 OTLP 端点接收来自应用程序（或在代理角色中的其他收集器）的事件。通常会部署一组收集器实例，并使用开箱即用的负载均衡器在它们之间分配负载。

<Image img={clickstack_with_gateways} alt="Scaling with gateways" size="lg"/>

此架构的目标是将计算密集型处理从代理中卸载，从而最小化它们的资源使用。这些 ClickStack 网关可以执行本来需要代理进行的转换任务。此外，网关可以聚合来自许多代理的事件，确保以大批量发送到 ClickHouse - 允许高效插入。这些网关收集器可以轻松扩展，以便随着添加更多代理和 SDK 源并增加事件吞吐量。

### 添加 Kafka {#adding-kafka}

读者可能会注意到上述架构没有使用 Kafka 作为消息队列。

使用 Kafka 队列作为消息缓冲区是在日志架构中看到的一种流行设计模式，并由 ELK 堆栈推广。它提供了一些好处：主要是，它有助于提供更强的消息交付保证，并有助于处理反馈压力。消息从收集代理发送到 Kafka 并写入磁盘。理论上，集群 Kafka 实例应提供高吞吐量的消息缓冲，因为它比解析和处理消息开销更小，线性写入数据到磁盘的效率更高。在 Elastic 中，例如， tokenization 和索引会造成显著开销。通过将数据移出代理，您也就减少了因源头日志轮替而丢失消息的风险。最后，它提供了一些消息重发和跨区域复制能力，这对某些用例可能具有吸引力。

但是，ClickHouse 可以非常快速地处理数据的插入 - 在适度硬件上每秒数百万行。ClickHouse 的反馈压力是罕见的。通常，利用 Kafka 队列意味着更多的架构复杂性和成本。如果您能接受日志与银行交易和其他关键数据不需要相同的交付保证这一原则，那么我们建议避免 Kafka 的复杂性。

但是，如果您需要高交付保证或能够重放数据（可能给多个源），Kafka 可以是一个有用的架构补充。

<Image img={observability_8} alt="Adding kafka" size="lg"/>

在这种情况下，可以配置 OTel 代理通过 [Kafka 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) 将数据发送到 Kafka。网关实例反过来使用 [Kafka 接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) 消费消息。我们建议查看 Confluent 和 OTel 文档以获取更多详细信息。

:::note OTel 收集器配置
ClickStack OpenTelemetry 收集器发行版无法与 Kafka 一起使用，因为它需要配置修改。用户需要使用 ClickHouse 导出器部署默认的 OTel 收集器。
:::

## 估算资源 {#estimating-resources}

OTel 收集器的资源需求将取决于事件吞吐量、消息大小和处理量。OpenTelemetry 项目维护 [基准](https://opentelemetry.io/docs/collector/benchmarks/)，用户可以用来估算资源需求。

[根据我们的经验](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)，具有 3 个核心和 12GB RAM 的 ClickStack 网关实例可以处理约 60,000 个事件每秒。这假设一个负责重命名字段的最小处理管道，并且没有正则表达式。

对于负责将事件发送到网关的代理实例，只需设置事件的时间戳，我们建议用户根据预期的每秒日志数量来进行大小选择。以下代表用户可以作为起点使用的近似值：

| 日志采集率 | 收集器代理的资源 |
|--------------|------------------------------|
| 1k/秒        | 0.2CPU，0.2GiB                |
| 5k/秒        | 0.5 CPU，0.5GiB               |
| 10k/秒       | 1 CPU，1GiB                   |

## JSON 支持 {#json-support}

<BetaBadge/>

ClickStack 从版本 `2.0.4` 开始对 [JSON 类型](/interfaces/formats/JSON) 提供 beta 支持。

### JSON 类型的好处 {#benefits-json-type}

JSON 类型为 ClickStack 用户提供了以下好处：

- **类型保留** - 数字保持数字，布尔值保持布尔值 - 不再将所有内容扁平化为字符串。这意味着更少的类型转换，更简单的查询，以及更准确的聚合。
- **路径级别列** - 每个 JSON 路径成为自己的子列，减少 I/O。查询仅读取所需的字段，相比于旧的 Map 类型，大幅提高了性能，因为只有在查询特定字段时才需要读取整个列。
- **深度嵌套自然有效** - 自然处理复杂的、深层嵌套的结构，而无需像 Map 类型那样手动扁平化及后续尴尬的 JSONExtract 函数。
- **动态、演变的模式** - 非常适合可观察性数据，因为团队随着时间的推移添加新的标签和属性。JSON 会自动处理这些变化，无需模式迁移。
- **更快的查询，降低内存** - 针对 `LogAttributes` 等属性的典型聚合，减少读取 5-10 倍的数据，实现显著加速，减少查询时间和内存峰值使用。
- **简单管理** - 不需要为了性能而预先材料化列。每个字段成为自己的子列，提供与原生 ClickHouse 列相同的速度。

### 启用 JSON 支持 {#enabling-json-support}

要为收集器启用此支持，请在任何包含收集器的部署中设置环境变量 `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'`。这确保在 ClickHouse 中使用 JSON 类型创建模式。

:::note HyperDX 支持
为了查询 JSON 类型，支持还必须通过环境变量 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 在 HyperDX 应用层启用。
:::

例如：

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

### 从基于 Map 的模式迁移到 JSON 类型 {#migrating-from-map-based-schemas-to-json}

:::重要 向后兼容性
[JSON 类型](/interfaces/formats/JSON) 与现有的基于 Map 的模式不向后兼容。将使用 `JSON` 类型创建新表。
:::

要从基于 Map 的模式迁移，请按照以下步骤操作：

<VerticalStepper headerLevel="h4">

#### 停止 OTel 收集器 {#stop-the-collector}

#### 重命名现有表并更新数据源 {#rename-existing-tables-sources}

重命名现有表并更新 HyperDX 中的数据源。

例如：

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### 部署收集器  {#deploy-the-collector}

设置 `OTEL_AGENT_FEATURE_GATE_ARG` 部署收集器。

#### 使用 JSON 模式支持重启 HyperDX 容器 {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### 创建新的数据源 {#create-new-data-sources}

在 HyperDX 中创建新的数据源，指向 JSON 表。

</VerticalStepper>

#### 迁移现有数据（可选） {#migrating-existing-data}

要将旧数据移动到新的 JSON 表中：

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::警告
建议仅用于小于 ~100 亿行的数据集。先前使用 Map 类型存储的数据未能保留类型精度（所有值均为字符串）。因此，这些旧数据将在新模式中表现为字符串，直到过期，前端可能需要一些转换。新数据将使用 JSON 类型保留类型。
:::
