---
title: '集成 OpenTelemetry'
description: '集成 OpenTelemetry 与 ClickHouse 实现可观测性'
slug: /observability/integrating-opentelemetry
keywords: ['Observability', 'OpenTelemetry']
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


# 集成 OpenTelemetry 进行数据采集

任何可观测性解决方案都需要具备收集和导出日志及追踪数据的能力。为此，ClickHouse 推荐使用 [OpenTelemetry (OTel) 项目](https://opentelemetry.io/)。

“OpenTelemetry 是一个可观测性框架和工具集，用于创建和管理诸如追踪、指标和日志等遥测数据。”

与 ClickHouse 或 Prometheus 不同，OpenTelemetry 不是一个可观测性后端，而是专注于遥测数据的生成、收集、管理和导出。OpenTelemetry 的最初目标是让用户能够使用各种语言的 SDK 轻松为其应用或系统进行埋点，但它已经扩展为可通过 OpenTelemetry Collector 收集日志——一个用于接收、处理并导出遥测数据的代理或中继组件。



## ClickHouse 相关组件 {#clickhouse-relevant-components}

OpenTelemetry 由多个组件组成。除了提供数据和 API 规范、标准化协议以及字段/列的命名约定之外,OTel 还提供了两项对于使用 ClickHouse 构建可观测性解决方案至关重要的能力:

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) 是一个代理,用于接收、处理和导出遥测数据。基于 ClickHouse 的解决方案使用该组件进行日志收集和事件处理,然后再批量插入数据。
- [语言 SDK](https://opentelemetry.io/docs/languages/) 实现了规范、API 和遥测数据的导出。这些 SDK 能够有效确保在应用程序代码中正确记录追踪信息,生成组成 span 并确保上下文通过元数据在服务之间传播 - 从而形成分布式追踪并确保 span 之间可以关联。这些 SDK 还配套了一个生态系统,可以自动集成常见的库和框架,这意味着用户无需修改代码即可获得开箱即用的插桩能力。

基于 ClickHouse 的可观测性解决方案充分利用了这两种工具。


## 发行版 {#distributions}

OpenTelemetry Collector 有[多个发行版](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)。ClickHouse 解决方案所需的 filelog 接收器和 ClickHouse 导出器仅包含在 [OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) 中。

该发行版包含众多组件,允许用户试验各种配置。但在生产环境中运行时,建议将 Collector 限制为仅包含环境所需的组件。这样做的原因包括:

- 减小 Collector 的体积,缩短部署时间
- 通过减少可攻击面来提高 Collector 的安全性

可以使用 [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) 来构建[自定义 Collector](https://opentelemetry.io/docs/collector/custom-collector/)。


## 使用 OTel 采集数据 {#ingesting-data-with-otel}

### Collector 部署角色 {#collector-deployment-roles}

为了收集日志并将其插入 ClickHouse,我们建议使用 OpenTelemetry Collector。OpenTelemetry Collector 可以部署为两种主要角色:

- **Agent** - Agent 实例在边缘收集数据,例如在服务器或 Kubernetes 节点上,或直接从使用 OpenTelemetry SDK 进行插桩的应用程序接收事件。在后一种情况下,Agent 实例与应用程序一起运行或在应用程序所在的同一主机上运行(例如作为 Sidecar 或 DaemonSet)。Agent 可以将数据直接发送到 ClickHouse 或发送到 Gateway 实例。在前一种情况下,这被称为 [Agent 部署模式](https://opentelemetry.io/docs/collector/deployment/agent/)。
- **Gateway** - Gateway 实例提供独立服务(例如 Kubernetes 中的部署),通常按集群、数据中心或区域部署。这些实例通过单个 OTLP 端点从应用程序(或作为 Agent 的其他 Collector)接收事件。通常会部署一组 Gateway 实例,使用开箱即用的负载均衡器在它们之间分配负载。如果所有 Agent 和应用程序都将信号发送到这个单一端点,这通常被称为 [Gateway 部署模式](https://opentelemetry.io/docs/collector/deployment/gateway/)。

下面我们假设使用一个简单的 Agent Collector,将其事件直接发送到 ClickHouse。有关使用 Gateway 的更多详细信息以及何时适用,请参阅[使用 Gateway 进行扩展](#scaling-with-gateways)。

### 收集日志 {#collecting-logs}

使用 Collector 的主要优势在于它允许您的服务快速卸载数据,将重试、批处理、加密甚至敏感数据过滤等额外处理工作交给 Collector 来处理。

Collector 使用 [Receiver](https://opentelemetry.io/docs/collector/configuration/#receivers)、[Processor](https://opentelemetry.io/docs/collector/configuration/#processors) 和 [Exporter](https://opentelemetry.io/docs/collector/configuration/#exporters) 这三个术语来表示其三个主要处理阶段。Receiver 用于数据收集,可以是拉取或推送方式。Processor 提供对消息进行转换和丰富的能力。Exporter 负责将数据发送到下游服务。虽然理论上该服务可以是另一个 Collector,但在下面的初步讨论中,我们假设所有数据都直接发送到 ClickHouse。

<Image img={observability_3} alt='Collecting logs' size='md' />

我们建议用户熟悉完整的 Receiver、Processor 和 Exporter 集合。

Collector 提供两种主要的 Receiver 来收集日志:

**通过 OTLP** - 在这种情况下,日志通过 OTLP 协议从 OpenTelemetry SDK 直接发送(推送)到 Collector。[OpenTelemetry 演示](https://opentelemetry.io/docs/demo/)采用了这种方法,每种语言中的 OTLP Exporter 都假定有一个本地 Collector 端点。在这种情况下,Collector 必须配置 OTLP Receiver——请参阅上述[演示的配置](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)。这种方法的优势在于日志数据将自动包含 Trace ID,允许用户稍后识别特定日志的 Trace,反之亦然。

<Image img={observability_4} alt='Collecting logs via otlp' size='md' />

这种方法要求用户使用[相应的语言 SDK](https://opentelemetry.io/docs/languages/) 对其代码进行插桩。

- **通过 Filelog Receiver 抓取** - 该 Receiver 跟踪磁盘上的文件并生成日志消息,将这些消息发送到 ClickHouse。该 Receiver 处理复杂任务,例如检测多行消息、处理日志轮转、设置检查点以实现重启的健壮性以及提取结构。该 Receiver 还能够跟踪 Docker 和 Kubernetes 容器日志,可作为 Helm Chart 部署,[从中提取结构](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)并使用 Pod 详细信息对其进行丰富。

<Image img={observability_5} alt='File log receiver' size='md' />

**大多数部署将使用上述 Receiver 的组合。我们建议用户阅读 [Collector 文档](https://opentelemetry.io/docs/collector/)并熟悉基本概念,以及[配置结构](https://opentelemetry.io/docs/collector/configuration/)和[安装方法](https://opentelemetry.io/docs/collector/installation/)。**


:::note 提示：`otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) 是一个用于验证和可视化配置的实用工具。
:::



## 结构化与非结构化 {#structured-vs-unstructured}

日志可以是结构化的,也可以是非结构化的。

结构化日志采用 JSON 等数据格式,定义 HTTP 状态码和源 IP 地址等元数据字段。

```json
{
  "remote_addr": "54.36.149.41",
  "remote_user": "-",
  "run_time": "0",
  "time_local": "2019-01-22 00:26:14.000",
  "request_type": "GET",
  "request_path": "\/filter\/27|13 ,27|  5 ,p53",
  "request_protocol": "HTTP\/1.1",
  "status": "200",
  "size": "30577",
  "referer": "-",
  "user_agent": "Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"
}
```

非结构化日志虽然通常也具有可通过正则表达式模式提取的固有结构,但会将日志纯粹表示为字符串。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

我们建议用户尽可能采用结构化日志记录,并以 JSON(即 ndjson)格式记录日志。这将简化后续的日志处理工作,无论是在使用 [Collector 处理器](https://opentelemetry.io/docs/collector/configuration/#processors)发送到 ClickHouse 之前,还是在插入时使用物化视图进行处理。结构化日志最终将节省后续处理资源,降低 ClickHouse 解决方案所需的 CPU 开销。

### 示例 {#example}

为了演示目的,我们提供了结构化(JSON)和非结构化日志数据集,每个数据集约有 1000 万行,可从以下链接获取:

- [非结构化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [结构化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

下面的示例中使用结构化数据集。请确保下载并解压此文件以重现以下示例。

以下是 OTel Collector 的一个简单配置,它使用 filelog 接收器读取磁盘上的这些文件,并将结果消息输出到 stdout。由于我们的日志是结构化的,因此使用 [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md) 操作符。请修改 access-structured.log 文件的路径。

:::note 考虑使用 ClickHouse 进行解析
下面的示例从日志中提取时间戳。这需要使用 `json_parser` 操作符,它将整个日志行转换为 JSON 字符串,并将结果放入 `LogAttributes` 中。这可能会消耗大量计算资源,[在 ClickHouse 中可以更高效地完成](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。使用 [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) 实现此功能的等效非结构化示例可以在[这里](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)找到。
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

用户可以按照[官方说明](https://opentelemetry.io/docs/collector/installation/)在本地安装 collector。需要特别注意的是，应将说明中的安装包替换为包含 `filelog` receiver 的 [contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)，例如，用户应下载 `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`，而不是 `otelcol_0.102.1_darwin_arm64.tar.gz`。发布版本可在[此处](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)找到。

安装完成后，可以使用以下命令运行 OTel Collector：

```bash
./otelcol-contrib --config config-logs.yaml
```

在使用结构化日志的情况下，输出中的消息将呈现如下形式：


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

上述内容表示由 OTel collector 生成的一条日志消息。我们会在后续章节中将这些相同的消息写入 ClickHouse。

日志消息的完整 schema，以及在使用其他 receivers 时可能出现的附加列，维护在[此处](https://opentelemetry.io/docs/specs/otel/logs/data-model/)。**我们强烈建议用户熟悉该 schema。**

这里的关键点在于，日志行本身作为字符串存储在 `Body` 字段中，而 JSON 则在 `json_parser` 的作用下被自动提取到 Attributes 字段中。使用同一个[operator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) 还可以将时间戳提取到相应的 `Timestamp` 列。关于使用 OTel 处理日志的建议，请参阅 [Processing](#processing---filtering-transforming-and-enriching)。

:::note Operators
Operators 是日志处理的最基本单元。每个 operator 仅承担一个职责，例如从文件中读取行，或者从字段中解析 JSON。然后将多个 operators 串联成一个 pipeline，以实现所需的处理结果。
:::

上述消息没有 `TraceID` 或 `SpanID` 字段。如果这些字段存在，例如在用户实现[分布式追踪](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)的场景中，则可以使用与上面相同的技术从 JSON 中提取这些字段。

对于需要采集本地或 Kubernetes 日志文件的用户，我们建议熟悉 [filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration) 提供的配置选项，以及 [offsets](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) 和[多行日志解析的处理方式](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)。


## 收集 Kubernetes 日志 {#collecting-kubernetes-logs}

对于 Kubernetes 日志的收集,我们推荐参考 [OpenTelemetry 文档指南](https://opentelemetry.io/docs/kubernetes/)。建议使用 [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) 通过 Pod 元数据来丰富日志和指标。这可能会生成动态元数据(例如标签),并存储在 `ResourceAttributes` 列中。ClickHouse 目前对该列使用 `Map(String, String)` 类型。有关如何处理和优化此类型的更多详细信息,请参阅[使用 Map](/use-cases/observability/schema-design#using-maps) 和[从 Map 中提取数据](/use-cases/observability/schema-design#extracting-from-maps)。


## 收集追踪数据 {#collecting-traces}

对于需要对代码进行插桩并收集追踪数据的用户,我们建议参考官方的 [OTel 文档](https://opentelemetry.io/docs/languages/)。

为了将事件传递到 ClickHouse,用户需要部署一个 OTel collector,通过相应的接收器来接收基于 OTLP 协议的追踪事件。OpenTelemetry 演示提供了[各种支持语言的插桩示例](https://opentelemetry.io/docs/demo/)以及向 collector 发送事件的方法。下面展示了一个将事件输出到 stdout 的 collector 配置示例:

### 示例 {#example-1}

由于追踪数据必须通过 OTLP 接收,我们使用 [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) 工具来生成追踪数据。请按照[此处](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)的说明进行安装。

以下配置在 OTLP 接收器上接收追踪事件,然后将它们发送到 stdout。

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

通过以下命令运行此配置:

```bash
./otelcol-contrib --config config-traces.yaml
```

通过 `telemetrygen` 向 collector 发送追踪事件:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

这将输出类似于下面示例的追踪消息到 stdout:

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

上述内容代表由 OTel collector 生成的单个追踪消息。我们将在后续章节中将这些消息导入到 ClickHouse。

追踪消息的完整模式维护在[此处](https://opentelemetry.io/docs/concepts/signals/traces/)。我们强烈建议用户熟悉此模式。


## 处理 - 过滤、转换和增强 {#processing---filtering-transforming-and-enriching}

如前面设置日志事件时间戳的示例所示,用户通常需要对事件消息进行过滤、转换和增强。这可以通过 OpenTelemetry 中的多种功能来实现:

- **处理器(Processors)** - 处理器接收由[接收器收集的数据并对其进行修改或转换](https://opentelemetry.io/docs/collector/transforming-telemetry/),然后再将其发送到导出器。处理器按照收集器配置中 `processors` 部分配置的顺序应用。这些处理器是可选的,但[通常建议](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)使用最小集合。在将 OTel 收集器与 ClickHouse 配合使用时,我们建议将处理器限制为以下几种:
  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) 用于防止收集器出现内存溢出的情况。有关建议,请参阅[资源估算](#estimating-resources)。
  - 任何基于上下文进行增强的处理器。例如,[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) 允许使用 k8s 元数据自动设置 span、指标和日志的资源属性,例如使用源 pod id 增强事件。
  - 如果跟踪需要,[尾部或头部采样](https://opentelemetry.io/docs/concepts/sampling/)。
  - [基本过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 如果无法通过操作符完成(见下文),则丢弃不需要的事件。
  - [批处理(Batching)](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - 在使用 ClickHouse 时至关重要,以确保数据以批量方式发送。请参阅["导出到 ClickHouse"](#exporting-to-clickhouse)。

- **操作符(Operators)** - [操作符](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)提供接收器可用的最基本的处理单元。支持基本解析,允许设置严重性(Severity)和时间戳(Timestamp)等字段。这里支持 JSON 和正则表达式解析,以及事件过滤和基本转换。我们建议在此处执行事件过滤。

我们建议用户避免使用操作符或[转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)进行过多的事件处理。这些可能会产生相当大的内存和 CPU 开销,尤其是 JSON 解析。可以在 ClickHouse 中使用物化视图和列在插入时完成所有处理,但有一些例外 - 特别是上下文感知的增强,例如添加 k8s 元数据。有关更多详细信息,请参阅[使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。

如果使用 OTel 收集器进行处理,我们建议在网关实例上进行转换,并最小化在代理实例上完成的任何工作。这将确保在服务器上运行的边缘代理所需的资源尽可能少。通常,我们看到用户仅执行过滤(以最小化不必要的网络使用)、时间戳设置(通过操作符)以及需要代理中上下文的增强。例如,如果网关实例位于不同的 Kubernetes 集群中,则需要在代理中进行 k8s 增强。

### 示例 {#example-2}

以下配置显示了非结构化日志文件的收集。请注意使用操作符从日志行中提取结构(`regex_parser`)和过滤事件,以及使用处理器批处理事件和限制内存使用。


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

导出器负责将数据发送到一个或多个后端或目标位置。导出器可以基于拉取或推送模式。要将事件发送到 ClickHouse,需要使用基于推送模式的 [ClickHouse 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)。

:::note 使用 OpenTelemetry Collector Contrib
ClickHouse 导出器是 [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main) 的一部分,而非核心发行版。用户可以直接使用 contrib 发行版,也可以[构建自定义收集器](https://opentelemetry.io/docs/collector/custom-collector/)。
:::

完整配置文件示例如下。

[clickhouse-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N_otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_5000*N*Nexporters%3A*N_clickhouse%3A*N___endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*Aasync*_insert*E1*N___*H_ttl%3A_72h*N___traces*_table*_name%3A_otel*_traces*N___logs*_table*_name%3A_otel*_logs*N___create*_schema%3A_true*N___timeout%3A_5s*N___database%3A_default*N___sending*_queue%3A*N_____queue*_size%3A_1000*N___retry*_on*_failure%3A*N_____enabled%3A_true*N_____initial*_interval%3A_5s*N_____max*_interval%3A_30s*N_____max*_elapsed*_time%3A_300s*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Bclickhouse%5D*N___traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Bclickhouse%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

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
          layout: "%Y-%m-%d %H:%M:%S"
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

请注意以下关键配置项:


* **pipelines** - 上述配置重点展示了对 [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines) 的使用。每个 pipeline 由一组 receivers、processors 和 exporters 组成，分别用于 logs 和 traces。
* **endpoint** - 与 ClickHouse 的通信通过 `endpoint` 参数进行配置。连接字符串 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` 会使通信通过 TCP 进行。如果用户出于流量切换等原因更偏好 HTTP，可按照[此处](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)所述修改该连接字符串。完整的连接配置详情（包括在此连接字符串中指定用户名和密码的方式）在[这里](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)进行了说明。

**Important:** 请注意，上述连接字符串同时启用了压缩（lz4）以及异步插入。我们建议始终启用这两项。有关异步插入的更多细节，请参见 [Batching](#batching)。压缩应始终显式指定，在较旧版本的 exporter 中不会默认启用。

* **ttl** - 此处的值决定数据保留多长时间。更多细节见 “Managing data”。应以小时为时间单位指定，例如 72h。我们在下面的示例中禁用了 TTL，因为我们的数据来自 2019 年，如果插入，ClickHouse 会立刻将其删除。
* **traces&#95;table&#95;name** 和 **logs&#95;table&#95;name** - 决定 logs 和 traces 表的名称。
* **create&#95;schema** - 决定在启动时是否使用默认 schema 创建表。入门时默认为 true。用户应将其设置为 false 并自行定义 schema。
* **database** - 目标数据库。
* **retry&#95;on&#95;failure** - 用于确定是否应重试失败批次的设置。
* **batch** - `batch` 处理器确保以批次方式发送事件。我们建议批大小约为 5000，超时时间为 5s。两者中任一条件先满足时，都会触发批次刷新并发送到 exporter。减小这些值将带来更低延迟的 pipeline，使数据更早可供查询，但代价是会向 ClickHouse 发送更多连接和批次。如果用户未使用 [asynchronous inserts](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，则不建议这样做，因为这可能在 ClickHouse 中导致 [too many parts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) 问题。相反，如果用户正在使用异步插入，则数据可用性也将取决于异步插入设置——尽管数据仍会更早从 connector 刷新出去。更多细节请参见 [Batching](#batching)。
* **sending&#95;queue** - 控制发送队列的大小。队列中的每个条目包含一个批次。如果该队列被占满，例如由于 ClickHouse 不可达而事件仍持续到达，则批次将被丢弃。

假设用户已经抽取了结构化日志文件，并且有一个运行中的[本地 ClickHouse 实例](/install)（使用默认认证），则可以通过以下命令运行此配置：

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

要将跟踪数据发送到此采集器，请使用 `telemetrygen` 工具运行以下命令：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

运行后，通过一个简单查询确认日志事件已经存在：

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical
```


Row 1:
──────
Timestamp: 2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags: 0
SeverityText:
SeverityNumber: 0
ServiceName:
Body: {"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes: {}
LogAttributes: {'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.

同样,对于追踪事件,用户可以查询 `otel_traces` 表:

SELECT \*
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp: 2024-06-20 11:36:41.181398000
TraceId: 00bba81fbd38a242ebb0c81a8ab85d8f
SpanId: beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName: lets-go
SpanKind: SPAN_KIND_CLIENT
ServiceName: telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName: telemetrygen
ScopeVersion:
SpanAttributes: {'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration: 123000
StatusCode: STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp: []
Events.Name: []
Events.Attributes: []
Links.TraceId: []
Links.SpanId: []
Links.TraceState: []
Links.Attributes: []

```

```


## 开箱即用的表结构 {#out-of-the-box-schema}

默认情况下,ClickHouse 导出器会为日志和追踪分别创建目标表。可以通过 `create_schema` 设置禁用此功能。此外,日志表和追踪表的名称可以通过上述设置从默认的 `otel_logs` 和 `otel_traces` 进行修改。

:::note
在下面的表结构中,我们假设 TTL 已设置为 72 小时。
:::

日志的默认表结构如下所示(`otelcol-contrib v0.102.1`):

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

这里的列与 OTel 官方日志规范相对应,文档见[此处](https://opentelemetry.io/docs/specs/otel/logs/data-model/)。

关于此表结构的几个重要说明:


- 默认情况下，表通过 `PARTITION BY toDate(Timestamp)` 按日期进行分区。这样可以高效地删除已过期的数据。
- 通过 `TTL toDateTime(Timestamp) + toIntervalDay(3)` 设置 TTL，对应于在采集器配置中设置的值。[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 表示仅在某个数据 part 中包含的所有行都已过期时才整块删除该 part。相比在 part 内逐行删除（这会触发代价高昂的删除操作），这种方式更高效。我们建议始终启用该设置。更多详情参见 [使用 TTL 进行数据管理](/observability/managing-data#data-management-with-ttl-time-to-live)。
- 该表使用经典的 [`MergeTree` 引擎](/engines/table-engines/mergetree-family/mergetree)。这对于日志和追踪数据是推荐选项，一般无需更改。
- 表按 `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` 排序。这意味着针对 `ServiceName`、`SeverityText`、`Timestamp` 和 `TraceId` 的过滤查询会得到优化——列表中越靠前的列，过滤速度越快，例如按 `ServiceName` 过滤会明显快于按 `TraceId` 过滤。用户应根据预期的访问模式调整这一排序，参见 [选择主键](/use-cases/observability/schema-design#choosing-a-primary-ordering-key)。
- 上述 schema 将 `ZSTD(1)` 应用于列。这为日志提供了最佳压缩率。用户可以将 ZSTD 压缩级别提高到默认值 1 之上以获得更好的压缩效果，但这通常收益有限。提高该值会在插入时（压缩期间）带来更高的 CPU 开销，不过解压（以及查询）性能应基本相当。更多细节参见[此文](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。此外，对 Timestamp 还应用了额外的 [delta 编码](/sql-reference/statements/create/table#delta)，以减少其磁盘占用。
- 请注意 [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) 和 [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) 是 map。用户应熟悉它们之间的差异。关于如何访问这些 map 以及如何优化对其中键的访问，参见 [使用 Map](/use-cases/observability/schema-design#using-maps)。
- 这里的大多数其他类型，例如将 `ServiceName` 定义为 LowCardinality，都是经过优化的。请注意，在我们的示例日志中为 JSON 的 `Body` 被存储为 String。
- Bloom filter 应用于 map 的键和值，以及 `Body` 列。这些旨在加速访问这些列的查询，但通常不是必需的。参见 [二级/数据跳过索引](/use-cases/observability/schema-design#secondarydata-skipping-indices)。



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

同样，这将与对应于 OTel 官方规范中 traces 的那些列相对应，相关文档见[此处](https://opentelemetry.io/docs/specs/otel/trace/api/)。此处的 schema 复用了上文日志 schema 的许多设置，并额外增加了针对 span 的链接（Link）专用列。

我们建议用户禁用自动 schema 创建功能，改为手动创建表。这样可以调整主键和二级键，并有机会引入更多列以优化查询性能。更多细节请参阅 [Schema 设计](/use-cases/observability/schema-design)。


## 优化插入操作 {#optimizing-inserts}

为了在保证强一致性的同时实现高插入性能,用户在通过采集器向 ClickHouse 插入可观测性数据时应遵循一些简单的规则。通过正确配置 OTel 采集器,遵循以下规则应该非常简单。这也可以避免用户首次使用 ClickHouse 时遇到的[常见问题](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。

### 批处理 {#batching}

默认情况下,每次向 ClickHouse 发送插入操作都会导致 ClickHouse 立即创建一个存储部分,其中包含插入的数据以及需要存储的其他元数据。因此,发送少量包含更多数据的插入操作,相比发送大量包含较少数据的插入操作,可以减少所需的写入次数。我们建议每次以较大的批次插入数据,至少 1,000 行。更多详情请参见[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。

默认情况下,向 ClickHouse 的插入操作是同步的,并且在内容相同时具有幂等性。对于 MergeTree 引擎系列的表,ClickHouse 默认会自动[对插入进行去重](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。这意味着插入操作在以下情况下具有容错性:

- (1) 如果接收数据的节点出现问题,插入查询将超时(或返回更具体的错误)并且不会收到确认。
- (2) 如果数据已被节点写入,但由于网络中断无法将确认返回给查询发送者,发送者将收到超时或网络错误。

从采集器的角度来看,(1) 和 (2) 可能难以区分。然而,在这两种情况下,未确认的插入操作都可以立即重试。只要重试的插入查询包含相同顺序的相同数据,如果(未确认的)原始插入操作成功,ClickHouse 将自动忽略重试的插入。

我们建议用户使用前面配置中展示的[批处理器](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)来满足上述要求。这可以确保插入操作以满足上述要求的一致行批次发送。如果采集器预期具有高吞吐量(每秒事件数),并且每次插入至少可以发送 5000 个事件,这通常是管道中唯一需要的批处理。在这种情况下,采集器将在批处理器的 `timeout` 到达之前刷新批次,确保管道的端到端延迟保持较低且批次大小一致。

### 使用异步插入 {#use-asynchronous-inserts}

通常,当采集器的吞吐量较低时,用户被迫发送较小的批次,但他们仍然期望数据在最小的端到端延迟内到达 ClickHouse。在这种情况下,当批处理器的 `timeout` 到期时会发送小批次。这可能会导致问题,此时需要使用异步插入。这种情况通常出现在**代理角色的采集器配置为直接发送到 ClickHouse** 时。网关通过充当聚合器可以缓解此问题 - 请参见[使用网关进行扩展](#scaling-with-gateways)。

如果无法保证大批次,用户可以使用[异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)将批处理委托给 ClickHouse。使用异步插入时,数据首先插入到缓冲区中,然后再异步写入数据库存储。

<Image img={observability_6} alt='异步插入' size='md' />

[启用异步插入](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)后,当 ClickHouse ① 接收到插入查询时,查询的数据 ② 首先立即写入内存缓冲区。当 ③ 下一次缓冲区刷新发生时,缓冲区的数据会被[排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)并作为一个部分写入数据库存储。请注意,在刷新到数据库存储之前,数据无法被查询检索;缓冲区刷新是[可配置的](/optimize/asynchronous-inserts)。

要为采集器启用异步插入,请在连接字符串中添加 `async_insert=1`。我们建议用户使用 `wait_for_async_insert=1`(默认值)以获得交付保证 - 更多详情请参见[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。


来自异步插入的数据会在 ClickHouse 缓冲区被刷新时写入。刷新会在超过 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) 时触发，或者在自首次 INSERT 查询之后经过 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 毫秒时触发。如果将 `async_insert_stale_timeout_ms` 设置为非零值，则会在自上一次查询之后经过 `async_insert_stale_timeout_ms` 毫秒后插入数据。用户可以调节这些设置来控制其管道的端到端延迟。可用于调优缓冲区刷新的更多设置记录在[此处](/operations/settings/settings#async_insert)。通常情况下，默认值已经足够合适。

:::note 考虑自适应异步插入
在代理数量较少、吞吐量较低但对端到端延迟有严格要求的场景下，[自适应异步插入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) 可能会有用。通常，对于 ClickHouse 中常见的高吞吐量可观测性场景，这些并不适用。
:::

最后，使用异步插入时，ClickHouse 之前与同步插入相关的去重行为默认不会启用。如有需要，请参阅设置 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)。

有关配置此功能的完整说明可在[此处](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)找到，更深入的介绍见[这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。



## 部署架构 {#deployment-architectures}

在 ClickHouse 中使用 OTel 采集器时,可以采用多种部署架构。下文将介绍每种架构及其适用场景。

### 仅代理模式 {#agents-only}

在仅代理模式架构中,用户将 OTel 采集器作为代理部署到边缘。这些代理从本地应用程序接收追踪数据(例如作为 sidecar 容器),并从服务器和 Kubernetes 节点收集日志。在此模式下,代理直接将数据发送到 ClickHouse。

<Image img={observability_7} alt='Agents only' size='md' />

此架构适用于中小规模部署。其主要优势在于无需额外硬件,可将 ClickHouse 可观测性解决方案的总体资源占用降至最低,且应用程序与采集器之间具有简单的映射关系。

当代理数量超过数百个时,用户应考虑迁移到基于网关的架构。此架构存在以下几个不利于扩展的缺点:

- **连接扩展性** - 每个代理都会与 ClickHouse 建立连接。虽然 ClickHouse 能够维护数百(甚至数千)个并发插入连接,但这最终会成为限制因素,并降低插入效率 - 即 ClickHouse 需要使用更多资源来维护连接。使用网关可以最大限度减少连接数,提高插入效率。
- **边缘处理** - 在此架构中,所有转换或事件处理都必须在边缘或 ClickHouse 中执行。这不仅具有局限性,还可能意味着需要使用复杂的 ClickHouse 物化视图,或将大量计算推送到边缘 - 而边缘可能运行着关键服务且资源紧张。
- **小批量与延迟** - 单个代理采集器可能收集的事件很少。这通常意味着需要将其配置为按固定时间间隔刷新,以满足交付 SLA 要求。这可能导致采集器向 ClickHouse 发送小批量数据。虽然这是一个缺点,但可以通过异步插入来缓解 - 请参阅[优化插入](#optimizing-inserts)。

### 使用网关扩展 {#scaling-with-gateways}

可以将 OTel 采集器部署为网关实例以解决上述限制。这些网关提供独立服务,通常按数据中心或区域部署。它们通过单个 OTLP 端点从应用程序(或其他充当代理角色的采集器)接收事件。通常会部署一组网关实例,并使用开箱即用的负载均衡器在它们之间分配负载。

<Image img={observability_8} alt='Scaling with gateways' size='md' />

此架构的目标是将计算密集型处理从代理卸载,从而最大限度减少其资源使用。这些网关可以执行原本需要由代理完成的转换任务。此外,通过聚合来自多个代理的事件,网关可以确保向 ClickHouse 发送大批量数据 - 从而实现高效插入。随着添加更多代理和事件吞吐量的增加,这些网关采集器可以轻松扩展。下面展示了一个网关配置示例,以及相关的代理配置(用于消费示例结构化日志文件)。请注意代理和网关之间使用 OTLP 进行通信。

[clickhouse-agent-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_1000*N*Nexporters%3A*N_otlp%3A*N___endpoint%3A_localhost%3A4317*N___tls%3A*N_____insecure%3A_true_*H_Set_to_false_if_you_are_using_a_secure_connection*N*Nservice%3A*N_telemetry%3A*N___metrics%3A*N_____address%3A_0.0.0.0%3A9888_*H_Modified_as_2_collectors_running_on_same_host*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Botlp%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)


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
          layout: "%Y-%m-%d %H:%M:%S"
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
exporters:
  otlp:
    endpoint: localhost:4317
    tls:
      insecure: true # 如果使用安全连接,请设置为 false
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 已修改,因为同一主机上运行 2 个采集器
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlp]
```

[clickhouse-gateway-config.yaml](https://www.otelbin.io/#config=receivers%3A*N__otlp%3A*N____protocols%3A*N____grpc%3A*N____endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_10000*N*Nexporters%3A*N__clickhouse%3A*N____endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*N____ttl%3A_96h*N____traces*_table*_name%3A_otel*_traces*N____logs*_table*_name%3A_otel*_logs*N____create*_schema%3A_true*N____timeout%3A_10s*N____database%3A_default*N____sending*_queue%3A*N____queue*_size%3A_10000*N____retry*_on*_failure%3A*N____enabled%3A_true*N____initial*_interval%3A_5s*N____max*_interval%3A_30s*N____max*_elapsed*_time%3A_300s*N*Nservice%3A*N__pipelines%3A*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Bclickhouse%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

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

可以使用以下命令运行这些配置。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

这种架构的主要缺点是管理一组采集器所带来的相关成本和开销。

关于管理更大规模的基于网关的架构及相关实践经验,我们推荐阅读这篇[博客文章](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)。

### 添加 Kafka {#adding-kafka}

读者可能会注意到,上述架构并未使用 Kafka 作为消息队列。


使用 Kafka 队列作为消息缓冲区是日志架构中常见的设计模式,由 ELK 技术栈推广开来。它提供了一些优势;主要是帮助提供更强的消息传递保证并帮助处理背压问题。消息从采集代理发送到 Kafka 并写入磁盘。理论上,集群化的 Kafka 实例应该能够提供高吞吐量的消息缓冲区,因为将数据顺序写入磁盘比解析和处理消息产生的计算开销更小——例如在 Elasticsearch 中,分词和索引会产生显著的开销。通过将数据从代理移出,您还可以降低因源端日志轮转而丢失消息的风险。最后,它提供了一些消息重放和跨区域复制功能,这对某些用例可能很有吸引力。

然而,ClickHouse 可以非常快速地处理数据插入——在中等硬件上每秒可处理数百万行。来自 ClickHouse 的背压**很少见**。通常,使用 Kafka 队列意味着更多的架构复杂性和成本。如果您能够接受日志不需要像银行交易和其他关键任务数据那样的传递保证这一原则,我们建议避免引入 Kafka 的复杂性。

但是,如果您需要高传递保证或重放数据的能力(可能发送到多个目标),Kafka 可以成为一个有用的架构补充。

<Image img={observability_9} alt='添加 kafka' size='md' />

在这种情况下,可以配置 OTel 代理通过 [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) 将数据发送到 Kafka。网关实例则使用 [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) 消费消息。我们建议参考 Confluent 和 OTel 文档以获取更多详细信息。

### 估算资源 {#estimating-resources}

OTel 采集器的资源需求取决于事件吞吐量、消息大小和执行的处理量。OpenTelemetry 项目维护了[基准测试](https://opentelemetry.io/docs/collector/benchmarks/),用户可以使用它来估算资源需求。

[根据我们的经验](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview),一个具有 3 个核心和 12GB RAM 的网关实例可以处理每秒约 6 万个事件。这假设使用最小化的处理管道,仅负责重命名字段且不使用正则表达式。

对于负责将事件发送到网关并仅设置事件时间戳的代理实例,我们建议用户根据预期的每秒日志数进行资源配置。以下是用户可以作为起点的大致数值:

| 日志速率 | 采集器代理资源 |
| ------------ | ---------------------------- |
| 1k/秒    | 0.2CPU, 0.2GiB               |
| 5k/秒    | 0.5 CPU, 0.5GiB              |
| 10k/秒   | 1 CPU, 1GiB                  |
