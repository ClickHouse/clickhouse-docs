---
title: '集成 OpenTelemetry'
description: '为可观测性将 OpenTelemetry 与 ClickHouse 集成'
slug: /observability/integrating-opentelemetry
keywords: ['可观测性', 'OpenTelemetry']
show_related_blogs: true
doc_type: 'guide'
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';
import Image from '@theme/IdealImage';


# 集成 OpenTelemetry 以进行数据采集 {#integrating-opentelemetry-for-data-collection}

任何可观测性解决方案都需要具备收集和导出日志与追踪数据的能力。为此，ClickHouse 推荐使用 [OpenTelemetry (OTel) 项目](https://opentelemetry.io/)。

“OpenTelemetry 是一个可观测性框架和工具包，旨在创建和管理诸如追踪、指标和日志等遥测数据。”

与 ClickHouse 或 Prometheus 不同，OpenTelemetry 本身不是可观测性后端，而是专注于遥测数据的生成、收集、管理和导出。虽然 OpenTelemetry 的初始目标是让你可以使用特定语言的 SDKS 轻松对应用程序或系统进行插桩，但其功能现已扩展，包含通过 OpenTelemetry collector 收集日志——该组件是一个用于接收、处理并导出遥测数据的代理/中转节点。

## 与 ClickHouse 相关的组件 {#clickhouse-relevant-components}

OpenTelemetry 由多个组件组成。除了提供数据和 API 规范、标准化协议以及字段/列的命名约定之外，OTel 还提供了两项在使用 ClickHouse 构建可观测性解决方案时至关重要的能力：

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) 是一个代理，用于接收、处理和导出遥测数据。基于 ClickHouse 的解决方案会使用此组件在批处理与写入之前完成日志采集和事件处理。
- [Language SDKs](https://opentelemetry.io/docs/languages/) 实现了规范、API 和遥测数据的导出。这些 SDK 能有效确保在应用程序代码中正确记录 trace，生成构成 trace 的各个 span，并通过元数据在服务之间传播上下文——从而形成分布式 trace，并确保 span 之间可以被关联。这些 SDK 还得益于一个生态系统的支持，该生态系统可自动集成常见的库和框架，因此用户无需修改代码即可获得开箱即用的自动化埋点能力。

基于 ClickHouse 的可观测性解决方案会同时利用这两类工具。

## 发行版 {#distributions}

OpenTelemetry collector 提供了[多个发行版](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)。ClickHouse 方案所需的 filelog receiver 和 ClickHouse exporter 仅在 [OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) 中提供。

该发行版包含许多组件，可用于尝试各种配置。不过，在生产环境中运行时，建议将 collector 限制为仅包含该环境所需的组件。这样做的原因包括：

- 缩小 collector 体积，从而缩短 collector 的部署时间
- 通过减少可用攻击面来提升 collector 的安全性

可以使用 [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) 来构建[自定义 collector](https://opentelemetry.io/docs/collector/custom-collector/)。

## 使用 OTel 进行数据摄取 {#ingesting-data-with-otel}

### Collector deployment roles {#collector-deployment-roles}

为了采集日志并将其写入 ClickHouse，我们建议使用 OpenTelemetry Collector。OpenTelemetry Collector 主要可以以两种角色进行部署：

- **Agent** - Agent 实例在边缘采集数据，例如在服务器或 Kubernetes 节点上，或者直接从通过 OpenTelemetry SDK 插桩的应用程序接收事件。在后一种情况下，Agent 实例与应用程序一同运行，或运行在与应用程序相同的主机上（例如作为 sidecar 或 DaemonSet 守护进程集）。Agent 可以直接将其数据发送到 ClickHouse，或者发送到一个 gateway 实例。在前一种情况下，这被称为 [Agent deployment pattern](https://opentelemetry.io/docs/collector/deployment/agent/)（Agent 部署模式）。
- **Gateway**  - Gateway 实例提供一个独立的服务（例如在 Kubernetes 中的一个部署），通常按集群、数据中心或区域进行划分。它们通过单个 OTLP 端点从应用程序（或以 Agent 角色运行的其他 Collector）接收事件。通常会部署一组 Gateway 实例，并使用开箱即用的负载均衡器在它们之间分配负载。如果所有 Agent 和应用程序都将其信号发送到这个单一端点，则通常称其为 [Gateway deployment pattern](https://opentelemetry.io/docs/collector/deployment/gateway/)（Gateway 部署模式）。

下面我们假设使用一个简单的 Agent 角色 Collector，直接将其事件发送到 ClickHouse。有关使用 Gateway 以及适用场景的更多详细信息，请参阅 [Scaling with Gateways](#scaling-with-gateways)。

### 收集日志 {#collecting-logs}

使用 Collector 的主要优势在于，它可以让你的服务快速将数据交给 Collector，由 Collector 负责后续的重试、批处理、加密，甚至敏感数据过滤等额外处理。

Collector 使用 [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers)、[processor](https://opentelemetry.io/docs/collector/configuration/#processors) 和 [exporter](https://opentelemetry.io/docs/collector/configuration/#exporters) 这三个术语来表示其三大处理阶段。Receiver 用于数据采集，可以是拉取（pull）或推送（push）模式。Processor 用于对消息进行转换和丰富。Exporter 负责将数据发送到下游服务。理论上该服务可以是另一个 Collector，但在下面的初始讨论中，我们假定所有数据都直接发送到 ClickHouse。

<Image img={observability_3} alt="收集日志" size="md"/>

我们建议用户熟悉所有可用的 receiver、processor 和 exporter。

Collector 为日志收集提供了两个主要的 receiver：

**通过 OTLP** - 在这种情况下，日志通过 OTLP 协议由 OpenTelemetry SDK 直接（推送）发送到 Collector。[OpenTelemetry demo](https://opentelemetry.io/docs/demo/) 采用了这种方式，各语言中的 OTLP exporter 假定本地 Collector 端点。在这种场景下，Collector 必须配置 OTLP receiver——参见上述 [demo 中的配置](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)。这种方式的优势在于日志数据会自动包含 Trace Id，从而允许用户后续根据某条日志找到对应的 trace，反之亦然。

<Image img={observability_4} alt="通过 otlp 收集日志" size="md"/>

这种方式要求用户使用其[对应语言的 SDK](https://opentelemetry.io/docs/languages/)对代码进行埋点接入。

- **通过 Filelog receiver 抓取** - 该 receiver 在磁盘上对文件进行 tail 操作并构造日志消息，然后将其发送到 ClickHouse。该 receiver 能处理复杂任务，如检测多行消息、处理日志轮转、通过 checkpoint 提升重启的健壮性，以及提取结构化信息。该 receiver 还可以对 Docker 和 Kubernetes 容器日志进行 tail，并可作为 Helm 图表部署，[从这些日志中提取结构](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)，并使用 pod（容器组）详情对其进行丰富。

<Image img={observability_5} alt="文件日志 receiver" size="md"/>

**大多数部署会组合使用以上几种 receiver。我们建议用户阅读 [collector 文档](https://opentelemetry.io/docs/collector/)，熟悉基础概念，以及[配置结构](https://opentelemetry.io/docs/collector/configuration/)和[安装方法](https://opentelemetry.io/docs/collector/installation/)。**

:::note Tip: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) 对于验证和可视化配置非常有用。
:::

## 结构化与非结构化 {#structured-vs-unstructured}

日志可以是结构化的，也可以是非结构化的。

结构化日志通常采用 JSON 等数据格式，并定义元数据字段，例如 HTTP 状态码和源 IP 地址。

```json
{
    "remote_addr":"54.36.149.41",
    "remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET",
    "request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1",
    "status":"200",
    "size":"30577",
    "referer":"-",
    "user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"
}
```

非结构化日志虽然通常也具有一定的内在结构，可以通过正则表达式模式进行提取，但本质上仍只是将整条日志视为一个字符串。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

我们建议用户在条件允许的情况下尽量采用结构化日志，并以 JSON（如 ndjson）格式输出日志。这样可以简化后续对日志的处理流程——无论是通过 [Collector processors](https://opentelemetry.io/docs/collector/configuration/#processors) 在发送到 ClickHouse 之前进行处理，还是在写入时通过 materialized views 处理。采用结构化日志最终可以减少后续处理所需的资源，从而降低在 ClickHouse 方案中对 CPU 的需求。


### 示例 {#example}

作为示例，我们提供了一份结构化（JSON）和一份非结构化的日志数据集，每个大约包含 1000 万行，可通过以下链接获取：

* [非结构化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
* [结构化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

在下面的示例中我们使用结构化数据集。请确保已下载并解压该文件，以便复现后续示例。

下面是一个简单的 OTel Collector 配置示例，它使用 `filelog` receiver 从磁盘读取这些文件，并将生成的消息输出到 stdout。由于我们的日志是结构化的，因此使用了 [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md) operator。请根据实际情况修改 access-structured.log 文件的路径。

:::note Consider ClickHouse for parsing
下面的示例从日志中提取时间戳。这需要使用 `json_parser` operator，它会将整条日志行转换为 JSON 字符串，并将结果放入 `LogAttributes` 中。这在计算上可能代价较高，而[在 ClickHouse 中可以更高效地完成](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) —— 参见 [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql)。一个等价的非结构化示例，使用 [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) 来实现同样的效果，可以在[这里](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)找到。
:::

**[config-structured-logs.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_1*N*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Blogging%5D%7E)**

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
processors:
  batch:
    timeout: 5s
    send_batch_size: 1
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [logging]
```

你可以按照[官方说明](https://opentelemetry.io/docs/collector/installation/)在本地安装 collector。需要特别注意的是，应将说明中的安装包替换为使用 [contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)（其中包含 `filelog` receiver），例如，用户应下载 `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`，而不是 `otelcol_0.102.1_darwin_arm64.tar.gz`。各版本发行包可以在[此处](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)找到。

安装完成后，可以通过以下命令运行 OTel collector：

```bash
./otelcol-contrib --config config-logs.yaml
```

如果使用结构化日志，输出的消息将具有如下形式：


```response
LogRecord #98
ObservedTimestamp: 2024-06-19 13:21:16.414259 +0000 UTC
Timestamp: 2019-01-22 01:12:53 +0000 UTC
SeverityText:
SeverityNumber: Unspecified(0)
Body: Str({"remote_addr":"66.249.66.195","remote_user":"-","run_time":"0","time_local":"2019-01-22 01:12:53.000","request_type":"GET","request_path":"\/product\/7564","request_protocol":"HTTP\/1.1","status":"301","size":"178","referer":"-","user_agent":"Mozilla\/5.0 (Linux; Android 6.0.1; Nexus 5X Build\/MMB29P) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/41.0.2272.96 Mobile Safari\/537.36 (compatible; Googlebot\/2.1; +http:\/\/www.google.com\/bot.html)"})
Attributes:
        -> remote_user: Str(-)
        -> request_protocol: Str(HTTP/1.1)
        -> time_local: Str(2019-01-22 01:12:53.000)
        -> user_agent: Str(Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html))
        -> log.file.name: Str(access.log)
        -> status: Str(301)
        -> size: Str(178)
        -> referer: Str(-)
        -> remote_addr: Str(66.249.66.195)
        -> request_type: Str(GET)
        -> request_path: Str(/product/7564)
        -> run_time: Str(0)
Trace ID:
Span ID:
Flags: 0
```

上面的示例展示了由 OTel collector 生成的一条日志消息。在后续小节中，我们会将这些相同的日志消息摄取到 ClickHouse 中。

日志消息的完整 schema，以及在使用其他 receiver 时可能出现的附加列，在[此处](https://opentelemetry.io/docs/specs/otel/logs/data-model/)维护。**我们强烈建议用户熟悉该 schema。**

这里的关键点在于，日志行本身作为字符串保存在 `Body` 字段中，但 JSON 已通过 `json_parser` 自动解析并提取到 Attributes 字段中。相同的[operator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)也被用于将时间戳提取到相应的 `Timestamp` 列中。关于使用 OTel 处理日志的建议，请参阅 [Processing](#processing---filtering-transforming-and-enriching)。

:::note 算子
算子（Operator）是日志处理的最基本单元。每个算子只承担一个职责，例如从文件中按行读取，或从字段中解析 JSON。然后将多个算子串联组成一个处理管道，以实现所需的结果。
:::

上述消息没有 `TraceID` 或 `SpanID` 字段。如果这些字段存在，例如在用户实现[分布式追踪](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)的场景中，则可以使用与上文相同的技术从 JSON 中提取这些字段。

对于需要收集本地或 Kubernetes 日志文件的用户，我们建议熟悉 [filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration) 提供的配置选项，以及[偏移量（offset）](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking)和[多行日志解析的处理方式](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)。


## 收集 Kubernetes 日志 {#collecting-kubernetes-logs}

收集 Kubernetes 日志时，我们推荐参考 [OpenTelemetry 文档指南](https://opentelemetry.io/docs/kubernetes/)。建议使用 [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) 利用 pod（容器组）元数据来丰富日志和指标。这样可以生成动态元数据，例如存储在 `ResourceAttributes` 列中的标签。ClickHouse 目前对该列使用类型 `Map(String, String)`。有关处理和优化此类型的更多详细信息，请参阅 [Using Maps](/use-cases/observability/schema-design#using-maps) 和 [Extracting from maps](/use-cases/observability/schema-design#extracting-from-maps)。

## 收集 traces {#collecting-traces}

对于希望在代码中接入埋点并收集 traces 的用户，我们建议参考官方的 [OTel 文档](https://opentelemetry.io/docs/languages/)。

为了将事件发送到 ClickHouse，您需要部署一个 OTel collector，通过合适的 receiver 使用 OTLP 协议接收 trace 事件。OpenTelemetry demo 提供了[对每种受支持语言进行埋点](https://opentelemetry.io/docs/demo/)并将事件发送到 collector 的示例。下面展示了一个合适的 collector 配置示例，它会将事件输出到 stdout：

### 示例 {#example-1}

由于必须通过 OTLP 接收 trace，我们使用 [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) 工具来生成 trace 数据。请按照[这里](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)的说明进行安装。

以下配置会在 OTLP 接收器上接收 trace 事件，然后将其发送到标准输出（stdout）。

[config-traces.xml](https://www.otelbin.io/#config=receivers%3A*N_otlp%3A*N___protocols%3A*N_____grpc%3A*N_______endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N__timeout%3A_1s*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*Nservice%3A*N_pipelines%3A*N__traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Blogging%5D%7E)

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 1s
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging]
```

使用以下命令运行此配置：

```bash
./otelcol-contrib --config config-traces.yaml
```

使用 `telemetrygen` 向 collector 发送 trace 事件：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

这会在 stdout 中输出与下面示例类似的 trace 消息：

```response
Span #86
        Trace ID        : 1bb5cdd2c9df5f0da320ca22045c60d9
        Parent ID       : ce129e5c2dd51378
        ID              : fbb14077b5e149a0
        Name            : okey-dokey-0
        Kind            : Server
        Start time      : 2024-06-19 18:03:41.603868 +0000 UTC
        End time        : 2024-06-19 18:03:41.603991 +0000 UTC
        Status code     : Unset
        Status message :
Attributes:
        -> net.peer.ip: Str(1.2.3.4)
        -> peer.service: Str(telemetrygen-client)
```

上面展示的是由 OTel collector 生成的一条 trace 消息。在后续章节中，我们会将相同的消息摄取到 ClickHouse 中。

trace 消息的完整 schema 维护在[此处](https://opentelemetry.io/docs/concepts/signals/traces/)。我们强烈建议用户熟悉该 schema。


## 处理——过滤、转换和丰富 {#processing---filtering-transforming-and-enriching}

如前面为日志事件设置时间戳的示例所示，你通常需要对事件消息进行过滤、转换和丰富。这可以通过 OpenTelemetry 中的一些功能来实现：

- **Processors（处理器）** - 处理器获取由[receivers 收集的数据并对其进行修改或转换](https://opentelemetry.io/docs/collector/transforming-telemetry/)，然后再发送到 exporters。处理器会按照在 collector 配置中 `processors` 部分指定的顺序依次应用。它们是可选的，但[通常推荐使用一组最小的处理器](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。在将 OTel collector 与 ClickHouse 配合使用时，我们建议将处理器限制为：

  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) 用于防止 collector 出现内存不足情况。推荐配置请参见[资源预估](#estimating-resources)。
  - 任何基于上下文进行信息丰富（enrichment）的处理器。例如，[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) 允许基于 k8s 元数据自动设置 span、metric 和 log 的资源属性，例如使用其来源 pod（容器组）ID 来丰富事件。
  - 如有需要，对 trace 进行[尾部或头部采样](https://opentelemetry.io/docs/concepts/sampling/)。
  - [基础过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/)——如果无法通过 operator（见下文）完成，则丢弃不需要的事件。
  - [批处理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor)——在与 ClickHouse 协同工作时至关重要，以确保数据以批量方式发送。参见[“Exporting to ClickHouse”](#exporting-to-clickhouse)。

- **Operators（算子）** - [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 提供了在 receiver 端可用的最基本处理单元。它们支持基础解析，允许设置诸如 Severity（严重级别）和 Timestamp（时间戳）等字段。此处支持 JSON 和正则表达式解析，同时支持事件过滤和基础转换。我们建议在这里执行事件过滤。

我们建议用户避免使用 operators 或 [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) 进行过度的事件处理。这些操作可能带来显著的内存和 CPU 开销，尤其是 JSON 解析。除少数情况外，可以在 ClickHouse 中利用 materialized view 和列在写入时完成所有处理——特别的例外是需要上下文感知的 enrichment，例如添加 k8s 元数据。更多细节请参见 [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql)。

如果通过 OTel collector 进行处理，我们建议在网关实例（gateway）上执行转换，并尽量减少在 agent 实例上完成的工作。这样可以确保运行在服务器边缘的 agent 实例所需资源尽可能少。通常情况下，我们观察到用户在 agent 上只执行过滤（以尽量减少不必要的网络使用）、时间戳设置（通过 operators）以及需要上下文的 enrichment。例如，如果网关实例位于不同的 Kubernetes 集群中，则需要在 agent 中完成 k8s enrichment。

### 示例 {#example-2}

以下配置演示了对非结构化日志文件的采集。请注意使用算子（`regex_parser`）从日志行中提取结构并过滤事件，同时使用处理器对事件进行批处理并限制内存占用。

[config-unstructured-logs-with-processor.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-unstructured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_regex*_parser*N_______regex%3A_*%22%5E*C*QP*Lip*G%5B*Bd.%5D*P*D*Bs*P-*Bs*P-*Bs*P*B%5B*C*QP*Ltimestamp*G%5B%5E*B%5D%5D*P*D*B%5D*Bs*P%22*C*QP*Lmethod*G%5BA-Z%5D*P*D*Bs*P*C*QP*Lurl*G%5B%5E*Bs%5D*P*D*Bs*PHTTP%2F%5B%5E*Bs%5D*P%22*Bs*P*C*QP*Lstatus*G*Bd*P*D*Bs*P*C*QP*Lsize*G*Bd*P*D*Bs*P%22*C*QP*Lreferrer*G%5B%5E%22%5D***D%22*Bs*P%22*C*QP*Luser*_agent*G%5B%5E%22%5D***D%22*%22*N_______timestamp%3A*N_________parse*_from%3A_attributes.timestamp*N_________layout%3A_*%22*.d%2F*.b%2F*.Y%3A*.H%3A*.M%3A*.S_*.z*%22*N_________*H22%2FJan%2F2019%3A03%3A56%3A14_*P0330*N*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_1s*N___send*_batch*_size%3A_100*N_memory*_limiter%3A*N___check*_interval%3A_1s*N___limit*_mib%3A_2048*N___spike*_limit*_mib%3A_256*N*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%2C_memory*_limiter%5D*N_____exporters%3A_%5Blogging%5D%7E)

```yaml
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
  logging:
    loglevel: debug
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch, memory_limiter]
      exporters: [logging]
```

```bash
./otelcol-contrib --config config-unstructured-logs-with-processor.yaml
```


## 导出到 ClickHouse {#exporting-to-clickhouse}

Exporter（导出器）会将数据发送到一个或多个后端或目标。Exporter 可以是拉取式或推送式。要将事件发送到 ClickHouse，你需要使用基于推送的 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)。

:::note 使用 OpenTelemetry Collector Contrib
ClickHouse exporter 是 [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main) 的一部分，而不是核心发行版。你可以使用 contrib 发行版，或者[构建你自己的 collector](https://opentelemetry.io/docs/collector/custom-collector/)。
:::

下面展示了一个完整的配置文件。

[clickhouse-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N_otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_5000*N*Nexporters%3A*N_clickhouse%3A*N___endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*Aasync*_insert*E1*N___*H_ttl%3A_72h*N___traces*_table*_name%3A_otel*_traces*N___logs*_table*_name%3A_otel*_logs*N___create*_schema%3A_true*N___timeout%3A_5s*N___database%3A_default*N___sending*_queue%3A*N_____queue*_size%3A_1000*N___retry*_on*_failure%3A*N_____enabled%3A_true*N_____initial*_interval%3A_5s*N_____max*_interval%3A_30s*N_____max*_elapsed*_time%3A_300s*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Bclickhouse%5D*N___traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Bclickhouse%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 5s
    send_batch_size: 5000
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
    # ttl: 72h
    traces_table_name: otel_traces
    logs_table_name: otel_logs
    create_schema: true
    timeout: 5s
    database: default
    sending_queue:
      queue_size: 1000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s

service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [clickhouse]
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
```

请注意下列关键设置：


* **pipelines** - 上述配置展示了 [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines) 的用法，它由一组 receivers、processors 和 exporters 组成，并分别为 logs 和 traces 定义了一个 pipeline。
* **endpoint** - 与 ClickHouse 的通信通过 `endpoint` 参数进行配置。连接字符串 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` 会使通信通过 TCP 进行。如果你出于流量切换等原因更偏好 HTTP，请按照[此处](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)所述修改该连接字符串。包括在连接字符串中指定用户名和密码在内的完整连接配置细节，见[此处](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)。

**Important:** 请注意，上述连接字符串同时启用了压缩（lz4）以及异步写入。我们建议始终同时启用这两项。有关异步写入的更多详情，请参阅 [Batching](#batching)。压缩应始终显式指定，在旧版本的 exporter 中默认不会启用。

* **ttl** - 此处的值决定数据保留多长时间。更多详情见 “Managing data”。应按时间单位（小时）指定，例如 72h。我们在下面的示例中禁用了生存时间 (TTL)，因为我们的数据来自 2019 年，如果插入，ClickHouse 会立即将其删除。
* **traces&#95;table&#95;name** 和 **logs&#95;table&#95;name** - 决定 logs 和 traces 表的名称。
* **create&#95;schema** - 决定是否在启动时使用默认 schema 创建表。默认值为 true，便于入门。你应将其设为 false 并自行定义 schema。
* **database** - 目标数据库。
* **retry&#95;on&#95;failure** - 设置是否重试失败的批次。
* **batch** - batch processor 确保事件以批次形式发送。我们建议批次大小大约为 5000，超时时间为 5s。二者中任一条件先满足，都会触发将批次刷新到 exporter。降低这些值将带来更低延迟的 pipeline，使数据更早可用于查询，但代价是向 ClickHouse 发起更多连接并发送更多批次。如果你未使用[异步写入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，则不推荐这样做，因为这可能导致 ClickHouse 出现 [too many parts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) 问题。相反，如果你正在使用异步写入，数据可用于查询的时间也会依赖于异步写入的相关设置——尽管数据仍会更早从 connector 刷新出去。更多详情见 [Batching](#batching)。
* **sending&#95;queue** - 控制发送队列的大小。队列中的每个条目包含一个批次。如果该队列已满，例如由于 ClickHouse 不可达但事件仍持续到达，那么多余的批次将被丢弃。

假设用户已经提取了结构化日志文件，并且正在运行一个带有默认认证的 [ClickHouse 本地实例](/install)，即可通过以下命令运行该配置：

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

要向该采集器发送 trace 数据，请使用 `telemetrygen` 工具运行以下命令：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

运行后，使用一个简单的查询确认是否已经存在日志事件：


```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:              2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags:             0
SeverityText:
SeverityNumber:         0
ServiceName:
Body:                   {"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes:        {}
LogAttributes:          {'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.

Likewise, for trace events, you can check the `otel_traces` table:

SELECT *
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:              2024-06-20 11:36:41.181398000
TraceId:                00bba81fbd38a242ebb0c81a8ab85d8f
SpanId:                 beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName:               lets-go
SpanKind:               SPAN_KIND_CLIENT
ServiceName:            telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName:              telemetrygen
ScopeVersion:
SpanAttributes:         {'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration:               123000
StatusCode:             STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp:   []
Events.Name:            []
Events.Attributes:  []
Links.TraceId:          []
Links.SpanId:           []
Links.TraceState:   []
Links.Attributes:   []
```


## 开箱即用的 schema {#out-of-the-box-schema}

默认情况下，ClickHouse exporter 会为 logs 和 traces 分别创建一个目标表。可以通过 `create_schema` 设置来禁用此行为。此外，logs 和 traces 表的名称也可以通过上述设置，从默认的 `otel_logs` 和 `otel_traces` 修改为其他名称。

:::note
在下面的 schema 中，我们假设已启用生存时间 (TTL)，并将其设置为 72 小时。
:::

logs 的默认 schema 如下所示（`otelcol-contrib v0.102.1`）：

```sql
CREATE TABLE default.otel_logs
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `TraceFlags` UInt32 CODEC(ZSTD(1)),
    `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
    `SeverityNumber` Int32 CODEC(ZSTD(1)),
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `Body` String CODEC(ZSTD(1)),
    `ResourceSchemaUrl` String CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeSchemaUrl` String CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` String CODEC(ZSTD(1)),
    `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

此处的列与 OTel 官方日志规范中定义的列相对应，详见[此处](https://opentelemetry.io/docs/specs/otel/logs/data-model/)。

关于此 schema，有几点重要说明：


- 默认情况下，表通过 `PARTITION BY toDate(Timestamp)` 按日期进行分区。这样可以高效地删除已过期的数据。
- 生存时间 (TTL) 通过 `TTL toDateTime(Timestamp) + toIntervalDay(3)` 设置，并与在采集器（collector）配置中设置的值相对应。[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 表示只有在其中所有行都过期时，才会删除整个分区片段。这比删除分区片段中的行更高效，因为那会触发一次代价高昂的删除操作。我们建议始终启用此设置。更多详情请参阅 [Data management with TTL](/observability/managing-data#data-management-with-ttl-time-to-live)。
- 该表使用经典的 [`MergeTree` engine](/engines/table-engines/mergetree-family/mergetree)。这推荐用于日志和追踪数据（traces），通常不需要更改。
- 表按 `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` 排序。这意味着针对 `ServiceName`、`SeverityText`、`Timestamp` 和 `TraceId` 的过滤查询会得到优化——列表中越靠前的列，过滤速度越快，例如按 `ServiceName` 过滤会显著快于按 `TraceId` 过滤。你应根据预期的访问模式修改此排序——参见 [Choosing a primary key](/use-cases/observability/schema-design#choosing-a-primary-ordering-key)。
- 上述 schema 对列应用了 `ZSTD(1)`。这为日志提供了最佳压缩率。你可以将 ZSTD 压缩级别提高到默认值 1 之上以获得更好的压缩效果，尽管这通常收益有限。提高该值会在插入时（压缩期间）带来更高的 CPU 开销，但解压缩（从而查询）性能应基本相当。更多细节请参阅[此处](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。额外的 [delta encoding](/sql-reference/statements/create/table#delta) 应用于 Timestamp，以减少其在磁盘上的占用。
- 请注意 [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) 和 [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) 是 map。理解它们之间的差异非常重要。关于如何访问这些 map 并优化其中键的访问，请参阅 ["Using maps"](/use-cases/observability/schema-design#using-maps)。
- 这里的大多数其他类型（例如将 `ServiceName` 声明为 LowCardinality）都是经过优化的。注意 `Body`（在我们的示例日志中为 JSON）被存储为 String。
- Bloom 过滤器被应用于 map 的键和值，以及 `Body` 列。其目标是提升访问这些列时的查询速度，但通常不是必需的。参见 [Secondary/Data skipping indices](/use-cases/observability/schema-design#secondarydata-skipping-indices)。

```sql
CREATE TABLE default.otel_traces
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `ParentSpanId` String CODEC(ZSTD(1)),
        `TraceState` String CODEC(ZSTD(1)),
        `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
        `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `Duration` Int64 CODEC(ZSTD(1)),
        `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
        `StatusMessage` String CODEC(ZSTD(1)),
        `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
        `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
        `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        `Links.TraceId` Array(String) CODEC(ZSTD(1)),
        `Links.SpanId` Array(String) CODEC(ZSTD(1)),
        `Links.TraceState` Array(String) CODEC(ZSTD(1)),
        `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
        INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

同样，这里的列将与 OTel 官方 trace 规范中对应的列保持关联（规范文档见[此处](https://opentelemetry.io/docs/specs/otel/trace/api/)）。本 schema 复用了前文日志 schema 中的许多相同设置，并针对 span 增加了特定的 Link 列。

我们建议用户禁用自动创建 schema，并手动创建表。这样可以修改主键和二级键，并有机会引入额外的列以优化查询性能。更多详细信息参见 [Schema design](/use-cases/observability/schema-design)。


## 优化插入 {#optimizing-inserts}

为了在保证强一致性的同时实现高插入性能，在通过 OTel collector 向 ClickHouse 插入可观测性数据时，应遵循一些简单规则。只要正确配置 OTel collector，遵守以下规则应当非常简单。这也有助于避免用户在首次使用 ClickHouse 时经常遇到的[常见问题](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。

### 批处理 {#batching}

默认情况下，每次向 ClickHouse 发送的 insert 操作，都会立即在存储中创建一个包含该 insert 数据及其他需要存储元数据的数据部分。因此，相比发送大量每次只包含少量数据的 insert，发送次数更少但每次包含更多数据的 insert，可以减少所需的写入次数。我们建议一次以至少 1,000 行的数据进行较大批次插入。更多细节见[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。

默认情况下，向 ClickHouse 的插入操作是同步的，并且在内容完全相同的情况下是幂等的。对于 merge tree 引擎族的表，ClickHouse 默认会自动[对插入进行去重](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。这意味着在以下情况中，插入是可容错的：

- (1) 如果接收数据的节点出现问题，insert 查询会超时（或返回更具体的错误），并且不会收到确认。
- (2) 如果数据已经被该节点写入，但由于网络中断，确认无法返回给查询的发送端，则发送端会收到超时或网络错误。

从 collector 的角度来看，(1) 和 (2) 可能很难区分。不过，在这两种情况下，未被确认的 insert 都可以立即重试。只要重试的 insert 查询在数据及其顺序上与原始 insert 完全一致，如果原始（未被确认的）insert 实际上已经成功，ClickHouse 会自动忽略这次重试的 insert。

我们建议用户使用前面配置中展示的 [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md) 来满足上述要求。这样可以确保 insert 以满足上述要求的一致行批次发送。如果预期某个 collector 具有高吞吐量（每秒事件数），并且每次 insert 至少可以发送 5,000 个事件，那么这通常就是管道中唯一需要的批处理。在这种情况下，collector 会在 batch processor 的 `timeout` 达到之前刷新批次，从而确保管道的端到端延迟保持较低，并且批次大小保持一致。

### 使用异步插入 {#use-asynchronous-inserts}

通常，当收集器吞吐量较低时，用户只能发送较小的批次，但仍然希望在尽可能低的端到端延迟下将数据发送到 ClickHouse。在这种情况下，当批处理器的 `timeout` 过期时就会发送小批次。这可能会导致问题，此时就需要使用异步插入。这种情况通常出现在**以 agent 角色运行的收集器被配置为直接发送到 ClickHouse** 时。Gateways 通过充当聚合器可以缓解这一问题——参见[通过 Gateways 扩展](#scaling-with-gateways)。

如果无法保证大批次，你可以将批处理委托给 ClickHouse，使用[异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)。使用异步插入时，数据会先插入到缓冲区，然后再写入数据库存储，也就是说会在稍后以异步方式写入。

<Image img={observability_6} alt="Async inserts" size="md"/>

在[启用异步插入](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)的情况下，当 ClickHouse ① 接收到插入查询时，查询数据会 ② 立即先写入内存缓冲区。随后在 ③ 下次缓冲区刷新时，缓冲区中的数据会被[排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)，并作为一个 part 写入数据库存储。注意，在数据刷新到数据库存储之前，查询无法检索到这些数据；缓冲区刷新的行为是[可配置的](/optimize/asynchronous-inserts)。

要为收集器启用异步插入，请在连接字符串中添加 `async_insert=1`。我们建议用户使用 `wait_for_async_insert=1`（默认值）以获得投递保证——更多细节参见[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

异步插入的数据会在 ClickHouse 缓冲区被刷新时写入表中。这会在超过 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) 或自第一个 INSERT 查询后经过 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 毫秒后发生。如果将 `async_insert_stale_timeout_ms` 设置为非零值，则会在自上一次查询后经过 `async_insert_stale_timeout_ms` 毫秒后插入数据。你可以通过调优这些设置来控制整个管道的端到端延迟。更多可用于调优缓冲区刷新的设置文档见[此处](/operations/settings/settings#async_insert)。通常情况下，默认值已足够。

:::note 考虑自适应异步插入
在仅使用少量 agent、吞吐量较低但对端到端延迟有严格要求的场景中，[自适应异步插入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) 可能会很有帮助。总体而言，对于 ClickHouse 中常见的高吞吐量可观测性场景，这些功能通常不适用于生产环境。
:::

最后，使用异步插入时，此前与同步插入 ClickHouse 相关的去重行为默认不会启用。如有需要，请参见 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate) 设置。

关于配置此功能的完整细节参见[此处](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，更深入的介绍参见[这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

## 部署架构 {#deployment-architectures}

在将 OTel collector 与 ClickHouse 结合使用时，可以采用多种不同的部署架构。下面将逐一说明这些架构及其各自适用的场景。

### 仅代理模式 {#agents-only}

在仅代理架构中，用户将 OTel collector 作为代理部署到边缘。这些代理从本地应用（例如作为 sidecar 容器）接收 trace，并从服务器和 Kubernetes 节点收集日志。在此模式下，代理会将数据直接发送到 ClickHouse。

<Image img={observability_7} alt="Agents only" size="md"/>

此架构适用于中小规模部署。其主要优势在于不需要额外硬件，能将 ClickHouse 可观测性解决方案的整体资源占用降到最低，并在应用与 collector 之间保持简单的映射关系。

一旦代理数量超过数百个，你应当考虑迁移到基于 Gateway 的架构。仅代理架构存在若干劣势，使其在扩展方面面临挑战：

- **连接扩展性** - 每个代理都会与 ClickHouse 建立连接。尽管 ClickHouse 能够维持数百（甚至上千）个并发插入连接，但最终这仍会成为限制因素，并使插入变得低效——即 ClickHouse 会为维持这些连接而消耗更多资源。使用 Gateway 可以将连接数量降到最少，从而提高插入效率。
- **边缘侧处理** - 在该架构中，任何转换或事件处理都必须在边缘或在 ClickHouse 中执行。除了具有局限性之外，这可能意味着需要在 ClickHouse 中使用复杂的 materialized view，或者将大量计算推向边缘——而此处关键服务可能会受到影响且资源紧张。
- **小批次与延迟** - 代理 collector 单个实例可能收集到的事件非常少。通常这意味着需要将其配置为按固定时间间隔进行 flush，以满足交付 SLA（服务级别协议）。这可能导致 collector 以小批次方式向 ClickHouse 发送数据。尽管这是一个劣势，但可以通过异步插入进行缓解——参见 [优化插入](#optimizing-inserts)。

### 通过网关进行扩展 {#scaling-with-gateways}

OTel collector 可以作为 Gateway 实例部署，以解决上述限制。这些实例提供独立服务，通常按数据中心或区域进行划分。它们通过单个 OTLP endpoint 从应用程序（或其他充当 agent 角色的 collector）接收事件。通常会部署一组 Gateway 实例，并利用开箱即用的负载均衡器在它们之间分配负载。

<Image img={observability_8} alt="通过网关进行扩展" size="md" />

该架构的目标是将计算密集型处理从 agent 中卸载出来，从而尽量减少其资源占用。这些 Gateway 可以执行原本需要由 agent 完成的转换任务。此外，通过聚合来自多个 agent 的事件，Gateway 能够确保以大批量的方式将数据发送到 ClickHouse，从而实现高效写入。随着 agent 数量和事件吞吐量的增加，这些 Gateway collector 也可以轻松扩展。下面展示了一个 Gateway 配置示例，以及一个关联的 agent 配置，它消费示例结构化日志文件。请注意，agent 与 Gateway 之间通过 OTLP 进行通信。

[clickhouse-agent-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_1000*N*Nexporters%3A*N_otlp%3A*N___endpoint%3A_localhost%3A4317*N___tls%3A*N_____insecure%3A_true_*H_Set_to_false_if_you_are_using_a_secure_connection*N*Nservice%3A*N_telemetry%3A*N___metrics%3A*N_____address%3A_0.0.0.0%3A9888_*H_Modified_as_2_collectors_running_on_same_host*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Botlp%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
exporters:
  otlp:
    endpoint: localhost:4317
    tls:
      insecure: true # Set to false if you are using a secure connection
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlp]
```


[clickhouse-gateway-config.yaml](https://www.otelbin.io/#config=receivers%3A*N__otlp%3A*N____protocols%3A*N____grpc%3A*N____endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_10000*N*Nexporters%3A*N__clickhouse%3A*N____endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*N____ttl%3A_96h*N____traces*_table*_name%3A_otel*_traces*N____logs*_table*_name%3A_otel*_logs*N____create*_schema%3A_true*N____timeout%3A_10s*N____database%3A_default*N____sending*_queue%3A*N____queue*_size%3A_10000*N____retry*_on*_failure%3A*N____enabled%3A_true*N____initial*_interval%3A_5s*N____max*_interval%3A_30s*N____max*_elapsed*_time%3A_300s*N*Nservice%3A*N__pipelines%3A*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Bclickhouse%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

```yaml
receivers:
  otlp:
    protocols:
    grpc:
    endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 5s
    send_batch_size: 10000
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4
    ttl: 96h
    traces_table_name: otel_traces
    logs_table_name: otel_logs
    create_schema: true
    timeout: 10s
    database: default
    sending_queue:
      queue_size: 10000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
```

可以通过以下命令运行这些配置。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

这种架构的主要缺点，是需要承担管理一组 Collector 所带来的成本和运维开销。

关于如何管理更大规模的网关型架构以及相关实践经验，我们推荐阅读这篇[博客文章](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)。


### 添加 Kafka {#adding-kafka}

读者可能会注意到，上述架构中没有使用 Kafka 作为消息队列。

在日志架构中，使用 Kafka 队列作为消息缓冲区是一种常见的设计模式，并由 ELK 技术栈推广开来。它带来了一些好处；最主要的是，它有助于提供更强的消息投递保证，并帮助应对背压。消息从采集代理发送到 Kafka 并写入磁盘。理论上，集群化的 Kafka 实例应当能够提供高吞吐的消息缓冲区，因为顺序写入数据到磁盘所需的计算开销要小于解析和处理消息——例如在 Elastic 中，分词和索引会带来显著开销。通过将数据从代理侧移走，你还可以降低在源端日志轮转时导致消息丢失的风险。最后，它还提供一定的消息回放和跨区域复制能力，这对于某些使用场景可能具有吸引力。

然而，ClickHouse 可以非常快速地插入数据——在中等配置的硬件上每秒可达数百万行。来自 ClickHouse 的背压情况**极为罕见**。很多时候，引入 Kafka 队列意味着更高的架构复杂度和成本。如果你能够接受这样一个原则：日志并不需要像银行交易或其他关键任务数据那样的投递保证，我们建议避免引入 Kafka 带来的复杂性。

但是，如果你需要很高的投递保证，或者需要回放数据（可能回放到多个目标），Kafka 仍然可以是一个有用的架构补充。

<Image img={observability_9} alt="Adding kafka" size="md"/>

在这种情况下，可以配置 OTel 代理通过 [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) 将数据发送到 Kafka。网关实例则通过 [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) 消费消息。更多细节建议参考 Confluent 和 OTel 的文档。

### 预估资源 {#estimating-resources}

OTel collector 的资源需求取决于事件吞吐量、消息大小以及执行的处理量。OpenTelemetry 项目维护了[基准测试](https://opentelemetry.io/docs/collector/benchmarks/)，供用户用来预估资源需求。

[根据我们的经验](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)，一台具有 3 个 CPU 核和 12GB 内存的网关实例大约可以处理每秒 60k 个事件。这是在仅使用精简处理流水线（只负责重命名字段且不使用正则表达式）的前提下得出的。

对于负责将事件发送到网关、且只在事件上设置时间戳的 Agent 实例，我们建议用户根据预期的每秒日志数进行容量规划。以下是可以作为起点的近似数值：

| 日志速率     | collector agent 所需资源 |
|--------------|--------------------------|
| 1k/second    | 0.2 CPU, 0.2 GiB         |
| 5k/second    | 0.5 CPU, 0.5 GiB         |
| 10k/second   | 1 CPU, 1 GiB             |