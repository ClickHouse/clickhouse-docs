---
'slug': '/use-cases/observability/clickstack/ingesting-data/otel-collector'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack 的 OpenTelemetry 收集器 - ClickHouse 可观察性堆栈'
'sidebar_label': 'OpenTelemetry Collector'
'title': 'ClickStack OpenTelemetry Collector'
---

import Image from '@theme/IdealImage';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

This page includes details on configuring the official ClickStack OpenTelemetry (OTel) collector.

## Collector roles {#collector-roles}

OpenTelemetry collectors can be deployed in two principal roles:

- **Agent** - Agent实例在边缘收集数据，例如在服务器或Kubernetes节点上，或者直接从用OpenTelemetry SDK进行仪器化的应用程序接收事件。在后者的情况下，代理实例与应用程序一起运行或在与应用程序相同的主机上运行（例如，作为旁车或DaemonSet）。代理可以将其数据直接发送到ClickHouse或发送到网关实例。在前一种情况下，这被称为[代理部署模式](https://opentelemetry.io/docs/collector/deployment/agent/)。

- **Gateway** - 网关实例提供一个独立服务（例如，Kubernetes中的部署），通常按集群、数据中心或区域划分。这些实例通过单个OTLP端点接收来自应用程序（或作为代理的其他收集器）的事件。通常，部署一组网关实例，使用开箱即用的负载均衡器在它们之间分配负载。如果所有代理和应用程序都将其信号发送到这个单一的端点，通常被称为[网关部署模式](https://opentelemetry.io/docs/collector/deployment/gateway/)。

**重要提示：包括在ClickStack的默认分发版中的收集器假定如下所述的[网关角色](#collector-roles)，接收来自代理或SDK的数据。**

部署OTel收集器作为代理的用户通常会使用[收集器的默认contrib分发版](https://github.com/open-telemetry/opentelemetry-collector-contrib)，而不是ClickStack版本，但也可以自由使用其他OTLP兼容的技术，例如[Fluentd](https://www.fluentd.org/)和[Vector](https://vector.dev/)。

## Deploying the collector {#configuring-the-collector}

如果您是在单独部署中管理自己的OpenTelemetry收集器——例如使用仅HyperDX的发行版——我们[建议仍然使用官方的ClickStack发行版的收集器](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector)作为网关角色，但如果您选择使用自己的，则确保它包括[ClickHouse导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)。

### Standalone {#standalone}

要以独立模式部署ClickStack分发版的OTel连接器，请运行以下docker命令：

```bash
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

请注意，我们可以通过环境变量`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME`和`CLICKHOUSE_PASSWORD`覆盖目标ClickHouse实例。`CLICKHOUSE_ENDPOINT`应为完整的ClickHouse HTTP端点，包括协议和端口——例如，`http://localhost:8123`。

**这些环境变量可以与包括连接器的任何docker分发版一起使用。**

`OPAMP_SERVER_URL`应指向您的HyperDX部署——例如，`http://localhost:4320`。HyperDX在端口`4320`的`/v1/opamp`上公开一个OpAMP（开放代理管理协议）服务器。确保从运行HyperDX的容器中暴露此端口（例如，使用`-p 4320:4320`）。

:::note Exposing and connecting to the OpAMP port
为了使收集器能够连接到OpAMP端口，必须从HyperDX容器中暴露它，例如`-p 4320:4320`。对于本地测试，OSX用户可以设置`OPAMP_SERVER_URL=http://host.docker.internal:4320`。Linux用户可以使用`--network=host`启动收集器容器。
:::

用户在生产中应使用具有[适当凭据](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)的用户。

### Modifying configuration {#modifying-otel-collector-configuration}

#### Using docker {#using-docker}

所有包含OpenTelemetry收集器的docker镜像均可通过环境变量`OPAMP_SERVER_URL`、`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME`和`CLICKHOUSE_PASSWORD`配置为使用ClickHouse实例：

例如，全能图像：

```bash
export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```

```bash
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

#### Docker Compose {#docker-compose-otel}

使用Docker Compose，使用与上述相同的环境变量修改收集器配置：

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

### Advanced configuration {#advanced-configuration}

当前，ClickStack分发版的OTel收集器不支持修改其配置文件。如果您需要更复杂的配置，例如[配置TLS](#securing-the-collector)，或修改批量大小，我们建议您复制并修改[默认配置](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml)，并使用文档中描述的ClickHouse导出器部署您自己的OTel收集器[这里](/observability/integrating-opentelemetry#exporting-to-clickhouse)和[这里](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)。

默认的ClickStack配置对于OpenTelemetry（OTel）收集器可以在[这里](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml)找到。

#### Configuration structure {#configuration-structure}

有关配置OTel收集器的详细信息，包括[`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)，[`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)和[`processors`](https://opentelemetry.io/docs/collector/configuration/#processors)，我们建议参考[官方OpenTelemetry收集器文档](https://opentelemetry.io/docs/collector/configuration)。

## Securing the collector {#securing-the-collector}

ClickStack发行版的OpenTelemetry收集器包含对OpAMP（开放代理管理协议）的内置支持，使用它来安全地配置和管理OTLP端点。在启动时，用户必须提供`OPAMP_SERVER_URL`环境变量——这应指向HyperDX应用程序，该应用程序在`/v1/opamp`处托管OpAMP API。

该集成确保OTLP端点使用在HyperDX应用程序部署时创建的自动生成的摄取API密钥进行安全保护。发送到收集器的所有遥测数据必须包括该API密钥以进行身份验证。您可以在HyperDX应用程序的`团队设置→API密钥`下找到密钥。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

为了进一步保护您的部署，我们建议：

- 配置收集器通过HTTPS与ClickHouse通信。
- 创建一个具有有限权限的专用用户进行摄取——见下文。
- 为OTLP端点启用TLS，以确保SDK/代理与收集器之间的加密通信。**目前，这要求用户部署收集器的默认分发版并自己管理配置**。

### Creating an ingestion user {#creating-an-ingestion-user}

我们建议为OTel收集器创建一个专用数据库和用户，以便将数据摄取到ClickHouse。该用户应具备创建和插入[ClickStack创建和使用的表](/use-cases/observability/clickstack/ingesting-data/schemas)的能力。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

这假定收集器已配置为使用数据库`otel`。可以通过环境变量`HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`控制这一点。将此变量传递给托管收集器的镜像[类似其他环境变量](#modifying-otel-collector-configuration)。

## Processing - filtering, transforming, and enriching {#processing-filtering-transforming-enriching}

用户在摄取过程中无疑希望过滤、转换和丰富事件消息。由于ClickStack连接器的配置无法修改，我们建议需要进一步事件过滤和处理的用户：

- 部署自己的OTel收集器版本来执行过滤和处理，通过OTLP将事件发送到ClickStack收集器以便摄取到ClickHouse。
- 部署自己的OTel收集器版本，并使用ClickHouse导出器直接将事件发送到ClickHouse。

如果使用OTel收集器进行处理，我们建议在网关实例上执行转换，并尽量减少在代理实例上进行的工作。这将确保运行在服务器上的边缘代理所需的资源尽可能最小。通常，我们看到用户仅执行过滤（以最小化不必要的网络使用）、时间戳设置（通过运算符）和丰富，这需要在代理中提供上下文。例如，如果网关实例位于不同的Kubernetes集群中，k8s丰富将在代理中进行。

OpenTelemetry支持以下处理和过滤功能，供用户利用：

- **Processors** - 处理器提取收集自[`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)的数据，并在发送到导出器之前进行修改或转换。处理器按配置文件中的`processors`部分的顺序应用。这些是可选的，但通常推荐使用最小集合[通常](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。当将OTel收集器与ClickHouse一起使用时，我们建议限制处理器为：

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)，用来防止收集器出现内存不足的情况。有关建议，请参见[估计资源](#estimating-resources)。
- 任何基于上下文进行丰富的处理器。例如，[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)允许使用k8s元数据自动设置跨度、指标和日志资源属性，例如为事件丰富源pod的ID。
- 如有必要，[尾部或头部采样](https://opentelemetry.io/docs/concepts/sampling/)。
- [基本过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 丢弃不需要的事件，如果不能通过运算符（见下文）来完成。
- [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - 在与ClickHouse一起工作时至关重要，以确保数据以批量方式发送。请参见[“优化插入”](#optimizing-inserts)。

- **Operators** - [操作符](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)提供了接收器可用的最基本处理单元。支持基本解析，允许设置诸如严重性和时间戳等字段。支持JSON和正则表达式解析，以及事件过滤和基本转换。我们建议在这里执行事件过滤。

我们建议用户避免使用运算符或[转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)进行过多的事件处理。这可能会引起相当大的内存和CPU开销，特别是JSON解析。在插入时，可以在ClickHouse中执行所有处理，但有一些例外，特别是上下文感知的丰富，例如添加k8s元数据。有关更多详细信息，请参见[使用SQL提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。

### Example {#example-processing}

以下配置显示了如何收集此[非结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)。此配置可以由在代理角色中的收集器使用，将数据发送到ClickStack网关。

注意使用运算符从日志行中提取结构（`regex_parser`）和过滤事件，以及使用处理器批量事件并限制内存使用。

```yaml

# config-unstructured-logs-with-processor.yaml
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

请注意，在任何OTLP通信中需要包含包含您摄取API密钥的[授权头](#securing-the-collector)。

有关更高级的配置，我们建议查看[OpenTelemetry收集器文档](https://opentelemetry.io/docs/collector/)。

## Optimizing inserts {#optimizing-inserts}

为了在获得强一致性保证的同时实现高插入性能，用户在通过ClickStack收集器将可观察性数据插入到ClickHouse时，应遵循简单规则。通过正确配置OTel收集器，以下规则应易于遵循。这还避免了用户在第一次使用ClickHouse时遇到的[常见问题](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。

### Batching {#batching}

默认情况下，发送到ClickHouse的每个插入都会导致ClickHouse立即创建一个存储部分，其中包含插入的数据及其他需要存储的元数据。因此，发送较小数量的插入（每个插入含有更多数据），与发送较大数量的插入（每个插入含有较少数据）相比，将减少所需的写入次数。我们建议以至少1000行的较大批量插入数据。进一步详细信息[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。

默认情况下，插入ClickHouse是同步的，并且如果相同则是幂等的。对于merge tree引擎家族的表，ClickHouse默认会自动[去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。这意味着在以下情况下插入是容错的：

- (1) 如果接收数据的节点出现问题，插入查询将超时（或出现更具体的错误），并不会收到确认。
- (2) 如果数据已被节点写入，但由于网络中断无法将确认返回给查询的发送者，则发送者将获得超时或网络错误。

从收集器的角度来看，（1）和（2）可能难以区分。然而，在这两种情况下，未确认的插入可以立即重试。只要重试的插入查询包含相同的数据以相同的顺序，ClickHouse将在原始（未确认的）插入成功时自动忽略重试的插入。

因此，ClickStack分发版的OTel收集器使用批[batch处理器](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)。这确保了插入作为一致的行批量发送，以满足上述要求。如果预计收集器将具有高吞吐量（每秒事件），并且每个插入至少可以发送5000个事件，通常这就是管道中唯一需要的批处理。在这种情况下，收集器将在达到批处理器的`timeout`之前刷新批次，确保管道的端到端延迟保持低，并保持批次一致的大小。

### Use Asynchronous inserts {#use-asynchronous-inserts}

通常，当收集器的吞吐量较低时，用户被迫发送较小的批次，而他们仍希望数据在最低端到端延迟内到达ClickHouse。在这种情况下，当批处理器的`timeout`到期时，将发送小批量。这可能会导致问题，这时需要异步插入。如果用户将数据发送到充当网关的ClickStack收集器，这个问题很少发生——通过充当聚合器，它们减轻了这个问题——见[收集器角色](#collector-roles)。

如果无法保证大型批量，用户可以使用[异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)将批处理委托给ClickHouse。在异步插入时，数据首先插入到缓冲区中，然后在稍后或异步写入到数据库存储中。

<Image img={observability_6} alt="Async inserts" size="md"/>

启用[异步插入](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)后，当ClickHouse ① 接收到一个插入查询时，查询的数据会 ② 立即写入到内存缓冲区。在 ③ 下次缓冲区刷新时，缓冲区的数据将[排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)并写入数据库存储作为一个部分。请注意，在刷新到数据库存储之前，数据不能通过查询检索；缓冲区刷新是[可配置的](/optimize/asynchronous-inserts)。

要为收集器启用异步插入，请在连接字符串中添加`async_insert=1`。我们建议用户使用`wait_for_async_insert=1`（默认值）以确保交付保证——有关进一步详细信息，请查看[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

异步插入中的数据在ClickHouse缓冲区被刷新时插入。这发生在超过[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size)或从第一次INSERT查询起经过[`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size)毫秒之后。如果设置了`async_insert_stale_timeout_ms`为非零值，则数据在最后一个查询之后的`async_insert_stale_timeout_ms毫秒`后插入。用户可以调整这些设置以控制其管道的端到端延迟。有关可以用于调整缓冲区刷新设置的进一步文档，请见[此处](/operations/settings/settings#async_insert)。通常，默认值是合适的。

:::note Consider Adaptive Asynchronous Inserts
在使用低数量代理的情况下，吞吐量较低，但有严格的端到端延迟要求，[自适应异步插入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts)可能有用。通常，这些不适用于高吞吐量可观察性用例，如ClickHouse。
:::

最后，先前与ClickHouse的同步插入相关的去重行为在使用异步插入时默认为未启用。如果需要，请参见设置[`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)。

有关配置此功能的完整细节，请参见此[文档页面](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，或查阅深度讨论[博客文章](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

## Scaling {#scaling}

ClickStack OTel收集器充当网关实例——见[收集器角色](#collector-roles)。这些提供独立服务，通常按数据中心或区域划分。这些实例通过单个OTLP端点接收来自应用程序（或作为代理的其他收集器）的事件。通常，部署一组收集器实例，使用开箱即用的负载均衡器在它们之间分配负载。

<Image img={clickstack_with_gateways} alt="Scaling with gateways" size="lg"/>

此架构的目标是将计算密集型处理从代理中卸载，从而最小化其资源使用。这些ClickStack网关可以执行本来需要由代理完成的转换任务。此外，通过聚合来自多个代理的事件，网关可以确保将较大的批量发送到ClickHouse——从而允许高效插入。随着增加更多代理和SDK源以及事件吞吐量的增加，这些网关收集器可以轻松扩展。

### Adding Kafka {#adding-kafka}

读者可能会注意到上述架构未使用Kafka作为消息队列。

使用Kafka队列作为消息缓冲区是日志架构中常见的设计模式，并由ELK堆栈推广。它提供了一些好处：主要是，它有助于提供更强的消息交付保证，并有助于处理回压。消息从收集代理发送到Kafka并写入磁盘。理论上，集群化的Kafka实例应提供高吞吐量的消息缓冲区，因为将数据线性写入磁盘的计算开销小于解析和处理消息。例如，在Elastic中，标记化和索引会产生显著的开销。通过将数据从代理中移走，您还减少了由于源处的日志轮转而丢失消息的风险。最后，它还提供了一些消息重放和跨区域复制的能力，这可能对某些用例具有吸引力。

然而，ClickHouse能够非常快速地处理数据插入——在中等硬件上，每秒数百万行。来自ClickHouse的回压是罕见的。通常，利用Kafka队列意味着更多的架构复杂性和成本。如果您能够接受日志不需要与银行交易和其他关键任务数据相同的交付保证的原则，我们建议避免Kafka的复杂性。

但是，如果您需要高交付保证或重放数据的能力（可能是多源的），Kafka可以是一个有用的架构补充。

<Image img={observability_8} alt="Adding kafka" size="lg"/>

在这种情况下，可以配置OTel代理通过[Kafka导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md)将数据发送到Kafka。网关实例则使用[Kafka接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md)消费消息。我们推荐参考Confluent和OTel文档以获取更多详细信息。

:::note OTel collector configuration
ClickStack OpenTelemetry收集器分发版不能与Kafka一起使用，因为它需要配置修改。用户需要使用ClickHouse导出器部署默认的OTel收集器。
:::

## Estimating resources {#estimating-resources}

OTel收集器的资源要求取决于事件吞吐量、消息大小和执行的处理量。OpenTelemetry项目维护着[用户](https://opentelemetry.io/docs/collector/benchmarks/)可以用来估算资源要求的基准测试。

[根据我们的经验](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)，具有3个核心和12GB RAM的ClickStack网关实例可以处理约60k每秒的事件。假设处理管道最小，只负责重命名字段，而不使用正则表达式。

对于负责将事件传送到网关的代理实例，并且仅设置事件的时间戳，我们建议用户根据预期的日志每秒进行调整。以下是用户可以使用的起始点的近似数字：

| 日志记录速率 | 收集代理的资源 |
|--------------|------------------|
| 1k/秒       | 0.2CPU, 0.2GiB   |
| 5k/秒       | 0.5 CPU, 0.5GiB  |
| 10k/秒      | 1 CPU, 1GiB      |
