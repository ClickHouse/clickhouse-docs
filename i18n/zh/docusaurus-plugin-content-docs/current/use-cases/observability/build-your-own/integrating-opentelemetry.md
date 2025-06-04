---
'title': '整合 OpenTelemetry'
'description': '整合 OpenTelemetry 和 ClickHouse 实现可观察性'
'slug': '/observability/integrating-opentelemetry'
'keywords':
- 'Observability'
- 'OpenTelemetry'
'show_related_blogs': true
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';
import Image from '@theme/IdealImage';


# 集成 OpenTelemetry 进行数据收集

任何可观察性解决方案都需要一种收集和导出日志与跟踪的方法。为此，ClickHouse 推荐[OpenTelemetry (OTel) 项目](https://opentelemetry.io/)。

“OpenTelemetry 是一个可观察性框架和工具包，旨在创建和管理遥测数据，如跟踪、指标和日志。”

与 ClickHouse 或 Prometheus 不同，OpenTelemetry 不是一个可观察性后端，而是专注于遥测数据的生成、收集、管理和导出。虽然 OpenTelemetry 的初始目标是让用户能够使用特定语言的 SDK 轻松地对其应用程序或系统进行插桩，但它已扩展为通过 OpenTelemetry 收集器进行日志收集——这是一个接收、处理并导出遥测数据的代理或代理。

## ClickHouse 相关组件 {#clickhouse-relevant-components}

OpenTelemetry 包含多个组件。除了提供数据和 API 规范、标准化协议以及字段/列的命名约定外，OTel 提供了两个构建可观察性解决方案的基本能力，这些能力与 ClickHouse 有关：

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) 是一个接收、处理和导出遥测数据的代理。基于 ClickHouse 的解决方案使用该组件进行日志收集和事件处理，在批量和插入之前进行处理。
- [语言 SDKs](https://opentelemetry.io/docs/languages/) 实现了规范、API 和遥测数据的导出。这些 SDK 有效地确保了应用程序代码中正确记录了跟踪，生成组成的跨度，并通过元数据确保在服务之间传播上下文，从而形成分布式跟踪并确保跨度可以进行关联。这些 SDK得到了一个生态系统的支持，该生态系统自动实现了常见的库和框架，因此用户不需要更改其代码，即可获得开箱即用的插桩。

基于 ClickHouse 的可观察性解决方案利用了这两个工具。

## 分发版本 {#distributions}

OpenTelemetry 收集器具有[多个分发版本](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)。与 ClickHouse 解决方案所需的 filelog 接收器和 ClickHouse 导出器仅存在于[OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)中。

该分发版本包含多个组件，允许用户尝试各种配置。但是，在生产环境中，建议将收集器限制为仅包含每个环境所需的组件。这样做的几个原因：

- 减少收集器的大小，减少收集器的部署时间
- 通过减少可用攻击面提高收集器的安全性

构建[自定义收集器](https://opentelemetry.io/docs/collector/custom-collector/)可以使用 [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) 实现。

## 使用 OTel 摄取数据 {#ingesting-data-with-otel}

### 收集器部署角色 {#collector-deployment-roles}

为了收集日志并将其插入 ClickHouse，我们建议使用 OpenTelemetry Collector。OpenTelemetry Collector 可以以两种主要角色部署：

- **代理** - 代理实例在边缘收集数据，如在服务器或 Kubernetes 节点上，或直接从使用 OpenTelemetry SDK 插桩的应用程序接收事件。在后面的情况下，代理实例与应用程序一起运行，或与应用程序在同一主机上（如旁路代理或守护进程集）。代理可以直接将其数据发送到 ClickHouse，或发送到网关实例。在前一种情况下，这被称为[代理部署模式](https://opentelemetry.io/docs/collector/deployment/agent/)。
- **网关** - 网关实例提供独立服务（例如，Kubernetes 中的部署），通常按集群、数据中心或区域提供。这些实例通过单个 OTLP 端点接收来自应用程序（或其他收集器作为代理）的事件。通常会部署一组网关实例，并使用开箱即用的负载均衡器在它们之间分配负载。如果所有代理和应用程序将其信号发送到此单个端点，通常称为[网关部署模式](https://opentelemetry.io/docs/collector/deployment/gateway/)。

在下面，我们假设一个简单的代理收集器，将事件直接发送到 ClickHouse。有关使用网关的更多详细信息及其适用情况，请参阅[使用网关进行扩展](#scaling-with-gateways)。

### 收集日志 {#collecting-logs}

使用收集器的主要优点是它允许您的服务快速卸载数据，让收集器处理额外的处理，例如重试、批处理、加密或甚至敏感数据过滤。

收集器使用术语[接收器](https://opentelemetry.io/docs/collector/configuration/#receivers)、[处理器](https://opentelemetry.io/docs/collector/configuration/#processors)和[导出器](https://opentelemetry.io/docs/collector/configuration/#exporters)来表示其三个主要处理阶段。接收器用于数据收集，可以是拉取或推送式。处理器则提供了对消息进行转换和增强的能力。导出器负责将数据发送到下游服务。虽然理论上可以是另一个收集器，但我们假设所有数据都直接发送到 ClickHouse，用于下面的初步讨论。

<Image img={observability_3} alt="收集日志" size="md"/>

我们建议用户熟悉完整的接收器、处理器和导出器集。

收集器提供了两个主要接收器用于收集日志：

**通过 OTLP** - 在这种情况下，日志通过 OTLP 协议直接从 OpenTelemetry SDK 发送（推送）到收集器。[OpenTelemetry 演示](https://opentelemetry.io/docs/demo/)采用这种方法，每种语言中的 OTLP 导出器假设本地收集器端点。在这种情况下，收集器必须配置为使用 OTLP 接收器——请参见上面的[演示配置](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)。这种方法的优点是日志数据将自动包含 Trace Id，因此用户可以稍后识别特定日志的跟踪，反之亦然。

<Image img={observability_4} alt="通过 otlp 收集日志" size="md"/>

此方法要求用户使用其[适当的语言 SDK](https://opentelemetry.io/docs/languages/)对其代码进行插桩。

- **通过 Filelog 接收器抓取** - 此接收器对磁盘上的文件进行跟踪，并形成日志消息，将其发送到 ClickHouse。该接收器处理复杂任务，例如检测多行消息、处理日志翻转、为重启提供检查点的鲁棒性，以及提取结构。此接收器还可以跟踪 Docker 和 Kubernetes 容器日志，可以作为 helm 图表部署，并[从中提取结构](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)，并用 pod 细节增补。

<Image img={observability_5} alt="File log receiver" size="md"/>

**大多数部署将同时使用上述接收器的组合。我们建议用户阅读[收集器文档](https://opentelemetry.io/docs/collector/)并熟悉基本概念，以及[配置结构](https://opentelemetry.io/docs/collector/configuration/)和[安装方法](https://opentelemetry.io/docs/collector/installation/)。**

:::note 提示: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) 用于验证和可视化配置。
:::

## 结构化与非结构化 {#structured-vs-unstructured}

日志可以是结构化的或非结构化的。

结构化日志将使用 JSON 等数据格式，定义元数据字段，如 HTTP 代码和源 IP 地址。

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

非结构化日志虽然通常也具有某种内在结构，能够通过正则表达式模式提取，但日志将纯粹表示为字符串。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

我们建议用户尽可能使用结构化日志，并以 JSON（即 ndjson）记录。这将简化后续处理日志的要求，在发送到 ClickHouse 之前使用[收集器处理器](https://opentelemetry.io/docs/collector/configuration/#processors)或在插入时使用物化视图。结构化日志最终将节省后续的处理资源，减少您在 ClickHouse 解决方案中所需的 CPU。

### 示例 {#example}

作为示例，我们提供一个结构化（JSON）和非结构化日志数据集，每个数据集约有 10m 行，可以通过以下链接获得：

- [非结构化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [结构化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

我们使用结构化数据集作为下面的示例。确保下载该文件并解压以重现以下示例。

以下是 OTel Collector 的简单配置，读取这些文件，使用 filelog 接收器，并将结果消息输出到 stdout。我们使用[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md) 操作符，因为我们的日志是结构化的。修改路径以指向 access-structured.log 文件。

:::note 考虑 ClickHouse 进行解析
以下示例从日志中提取时间戳。这需要使用 `json_parser` 操作符，该操作符将整个日志行转换为 JSON 字符串，并将结果放置在 `LogAttributes` 中。这可能计算开销较大，[并且可以在 ClickHouse 中更高效地完成](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。一个等效的非结构化示例，使用[`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) 实现这一点，可以在[这里](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)找到。
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

用户可以遵循[官方说明](https://opentelemetry.io/docs/collector/installation/)在本地安装收集器。重要的是，确保说明已修改为使用[contrib 分发版本](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)（该版本包含 `filelog` 接收器），例如，而不是 `otelcol_0.102.1_darwin_arm64.tar.gz`，用户将下载 `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`。可以在[这里](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)找到发布版本。

安装完成后，可以使用以下命令运行 OTel Collector：

```bash
./otelcol-contrib --config config-logs.yaml
```

假设使用结构化日志，输出中的消息将采用以下形式：

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

以上表示一个由 OTel 收集器生成的单个日志消息。我们将在后面的部分中将这些相同的消息摄取到 ClickHouse 中。

日志消息的完整架构，以及在使用其他接收器时可能存在的附加列，保留在[这里](https://opentelemetry.io/docs/specs/otel/logs/data-model/)。**我们强烈建议用户熟悉该架构。**

这里的关键是日志行本身作为字符串保存在 `Body` 字段中，而 JSON 已通过 `json_parser` 自动提取到 Attributes 字段。用于提取时间戳的相同[操作符](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)已被用来提取到相应的 `Timestamp` 列中。有关使用 OTel 处理日志的建议，请参见[处理](#processing---filtering-transforming-and-enriching)。

:::note 操作符
操作符是日志处理的最基本单元。每个操作符履行单一责任，例如从文件中读取行或从字段解析 JSON。操作符在管道中串联使用，以实现所需的结果。
:::

上述消息没有 `TraceID` 或 `SpanID` 字段。如果存在，例如，在用户实现[分布式跟踪](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)时，可以使用上述相同技术从 JSON 中提取这些字段。

对于需要收集本地或 Kubernetes 日志文件的用户，我们建议用户熟悉[filelog 接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration)的可用配置选项，以及[偏移量](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking)和[多行日志解析的处理方式](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)。

## 收集 Kubernetes 日志 {#collecting-kubernetes-logs}

对于 Kubernetes 日志的收集，我们建议参考[OpenTelemetry 文档指南](https://opentelemetry.io/docs/kubernetes/)。推荐使用[Kubernetes 属性处理器](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor)来增强日志和指标，以便使用 pod 元数据。这可能会生成动态元数据，例如，存储在列 `ResourceAttributes` 中的标签。ClickHouse 当前对该列使用 `Map(String, String)` 类型。有关处理和优化此类型的更多详细信息，请参见[使用 Maps](/use-cases/observability/schema-design#using-maps)和[从 maps 中提取](/use-cases/observability/schema-design#extracting-from-maps)。

## 收集跟踪 {#collecting-traces}

对于希望对其代码进行插桩和收集跟踪的用户，我们建议按照官方[OTel 文档](https://opentelemetry.io/docs/languages/)进行操作。

为了将事件发送到 ClickHouse，用户需要部署一个 OTel 收集器，以通过适当的接收器通过 OTLP 协议接收跟踪事件。OpenTelemetry 演示提供了[每种支持的语言插桩的示例](https://opentelemetry.io/docs/demo/)及向收集器发送事件。以下是将事件输出到 stdout 的适当收集器配置示例：

### 示例 {#example-1}

由于跟踪必须通过 OTLP 接收，我们使用[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) 工具生成跟踪数据。请按照[这里](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)的说明进行安装。

以下配置在 OTLP 接收器上接收跟踪事件，然后将其发送到 stdout。

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

通过以下命令运行此配置：

```bash
./otelcol-contrib --config config-traces.yaml
```

使用 `telemetrygen` 向收集器发送跟踪事件：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

这将导致类似于下面示例的跟踪消息输出到 stdout：

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

以上表示一个由 OTel 收集器生成的单个跟踪消息。我们将在后面的部分中将这些相同的消息摄取到 ClickHouse 中。

跟踪消息的完整架构保留在[这里](https://opentelemetry.io/docs/concepts/signals/traces/)。我们强烈建议用户熟悉该架构。

## 处理 - 过滤、变换和增强 {#processing---filtering-transforming-and-enriching}

如前面设置日志事件时间戳的示例所示，用户不可避免地会想要过滤、变换和增强事件消息。可以使用 OpenTelemetry 中的多种能力实现：

- **处理器** - 处理器处理由[接收器收集的数据，并在发送到导出器之前对其进行修改或转换](https://opentelemetry.io/docs/collector/transforming-telemetry/)。处理器按配置的顺序应用于收集器配置的 `processors` 部分。这些是可选的，但通常推荐使用最小集[（推荐处理器）](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。使用 OTel 收集器与 ClickHouse，我们建议将处理器限制为：

    - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) 用于防止收集器出现内存不足的情况。有关建议，请参见[估算资源](#estimating-resources)。
    - 任何基于上下文进行增强的处理器。例如，[Kubernetes 属性处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)允许自动设置跨度、指标和日志资源属性，以及 k8s 元数据，例如，用其源 Pod ID 增强事件。
    - 如果需要进行跟踪，可使用[尾部或头部采样](https://opentelemetry.io/docs/concepts/sampling/)。
    - [基本过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 如果无法通过操作符执行，则丢弃不必要的事件（见下文）。
    - [批处理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - 在与 ClickHouse 交互时至关重要，以确保以批次方式发送数据。请参见[“导出到 ClickHouse”](#exporting-to-clickhouse)。

- **操作符** - [操作符](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)提供了接收器可用的最基本处理单元。支持基本解析，允许设置严重性和时间戳等字段。这里支持 JSON 和正则表达式解析，以及事件过滤和基本转换。我们建议在这里进行事件过滤。

我们建议用户避免使用操作符或[变换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)进行过多的事件处理。这些可能会消耗大量内存和 CPU，尤其是 JSON 解析。所有处理都可以在 ClickHouse 插入时使用物化视图和列完成，某些例外情况 - 特别是与上下文相关的增强，例如添加 k8s 元数据。有关更多详细信息，请参见[使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。

如果使用 OTel 收集器进行处理，我们建议在网关实例上执行变换，并最小化代理实例上的工作量。这将确保服务器边缘运行的代理所需的资源尽可能少。通常，我们看到用户只执行过滤（以最小化不必要的网络使用）、时间戳设置（通过操作符）和增强，这些都需要在代理中处理上下文。例如，如果网关实例驻留在另一个 Kubernetes 集群中，k8s 增强将需要在代理中进行。

### 示例 {#example-2}

以下配置显示了对非结构化日志文件的收集。请注意使用操作符从日志行中提取结构（`regex_parser`）和过滤事件，以及使用处理器批处理事件并限制内存使用。

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

导出器将数据发送到一个或多个后端或目标。导出器可以基于拉取或推送。为了将事件发送到 ClickHouse，用户需要使用推送式[ClickHouse 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)。

:::note 使用 OpenTelemetry Collector Contrib
ClickHouse 导出器是[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main)的一部分，而不是核心分发版本。用户可以使用贡献版本或[构建自己的收集器](https://opentelemetry.io/docs/collector/custom-collector/)。
:::

完整的配置文件如下所示。

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

请注意以下关键设置：

- **pipelines** - 上述配置强调了使用[管道](https://opentelemetry.io/docs/collector/configuration/#pipelines)，包括一组接收器、处理器和导出器，其中包含日志和跟踪的管道。
- **endpoint** - 通过 `endpoint` 参数配置与 ClickHouse 的通信。连接字符串 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` 导致通过 TCP 进行通信。如果用户出于流量切换原因更喜欢使用 HTTP，请按[此处](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)所述修改此连接字符串。完整的连接详细信息，能够在此连接字符串中指定用户名和密码，在[此处](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)进行详细说明。

**重要:** 请注意，上述连接字符串启用了压缩（lz4）和异步插入。我们建议始终启用这两项。有关异步插入的更多详细信息，请参见[批处理](#batching)。压缩应始终指定，并且在较旧版本的导出器中不会默认启用。

- **ttl** - 这里的值决定数据的保留时间。有关更多细节，请参见“管理数据”。这应指定为小时的时间单位，例如 72h。我们在下面的示例中禁用 TTL，因为我们的数据来自 2019 年，插入后将被 ClickHouse 立即删除。
- **traces_table_name** 和 **logs_table_name** - 确定日志和跟踪表的名称。
- **create_schema** - 确定是否在启动时使用默认架构创建表。对于入门应默认为 true。用户应将其设置为 false，并定义自己的架构。
- **database** - 目标数据库。
- **retry_on_failure** - 设置以确定是否应尝试失败的批次。
- **batch** - 批处理处理器确保以批量形式发送事件。我们建议将值设置为 5000 左右，超时时间为 5 秒。达到这两个限制中的任何一个将启动一批数据刷新到导出器。降低这些值将意味着较低延迟的管道，在更早的时间内提供可查询的数据，代价是向 ClickHouse 发送更多的连接和批次。如果用户未使用[异步插入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，则不建议这样，因为这可能导致 ClickHouse 中的[分区片段过多](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts)。相反，如果用户正在使用异步插入，则查询可用的数据也将取决于异步插入设置——尽管数据仍然会更早地从连接器刷新。有关更多详细信息，请参见[批处理](#batching)。
- **sending_queue** - 控制发送队列的大小。队列中的每个项目都包含一批。如果超过此队列，例如由于 ClickHouse 不可达但事件仍然到达，则将丢弃批次。

假设用户已提取结构化日志文件并运行[本地 ClickHouse 实例](/install)（使用默认身份验证），用户可以通过以下命令运行此配置：

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

要向此收集器发送跟踪数据，请使用 `telemetrygen` 工具运行以下命令：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

一旦运行，使用简单查询确认日志事件的存在：

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


Likewise, for trace events, users can check the `otel_traces` table:

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
## 开箱即用的架构 {#out-of-the-box-schema}

默认情况下，ClickHouse 导出器会为日志和跟踪创建目标日志表。可以通过设置 `create_schema` 来禁用此功能。此外，日志表和跟踪表的名称可以通过上述设置从其默认值 `otel_logs` 和 `otel_traces` 进行修改。

:::note
在下面的架构中，我们假设已启用 TTL（生存时间），值为 72 小时。
:::

日志的默认架构如下所示（`otelcol-contrib v0.102.1`）:

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

此处的列与 OTel 官方文档中记录的日志规范相对应，可以在 [这里](https://opentelemetry.io/docs/specs/otel/logs/data-model/) 找到。

有关此架构的一些重要说明：

- 默认情况下，表按日期进行分区，使用 `PARTITION BY toDate(Timestamp)`。这使得删除过期数据变得高效。
- TTL 通过 `TTL toDateTime(Timestamp) + toIntervalDay(3)` 设置，并与收集器配置中设置的值相对应。[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 表示仅在所有包含的行都过期时才删除整个分片。这比在分片内删除行更有效，因为后者需要昂贵的删除操作。我们建议始终将此设置为 1。有关更多详细信息，请参见 [带 TTL 的数据管理](/observability/managing-data#data-management-with-ttl-time-to-live)。
- 表使用经典的 [`MergeTree` 引擎](/engines/table-engines/mergetree-family/mergetree)。这对于日志和追踪是推荐的，通常不需要更改。
- 表按 `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` 进行排序。这意味着查询将在 `ServiceName`、`SeverityText`、`Timestamp` 和 `TraceId` 上进行了优化 - 列表中较早的列过滤速度会比后面的列快，例如按 `ServiceName` 过滤将显著快于按 `TraceId` 过滤。用户应根据他们期望的访问模式修改此排序 - 请参阅 [选择主键](/use-cases/observability/schema-design#choosing-a-primary-ordering-key)。
- 上述架构对列应用 `ZSTD(1)`。这为日志提供了最佳压缩。用户可以在压缩中增加 ZSTD 压缩级别（高于默认值1）以实现更好的压缩，尽管这通常收益不大。在插入时增加此值会导致更高的 CPU 开销（在压缩阶段），尽管解压缩（因此查询）应保持可比。有关更多细节，请参见 [这里](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。对时间戳还应用了额外的 [增量编码](/sql-reference/statements/create/table#delta)，旨在减少其在磁盘上的大小。
- 请注意 [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) 和 [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) 是映射。用户应熟悉它们之间的区别。有关如何访问这些映射及优化访问其中键的方法，请参见 [使用映射](/use-cases/observability/schema-design#using-maps)。
- 此处的其他大多数类型，例如 `ServiceName` 作为 LowCardinality 进行了优化。请注意，`Body`，作为我们的示例日志中的 JSON，被存储为字符串。
- Bloom 筛选器应用于映射的键和值以及 `Body` 列。这些旨在改善访问这些列的查询时间，但通常不是必需的。有关更多信息，请参见 [二级/数据跳过索引](/use-cases/observability/schema-design#secondarydata-skipping-indices)。

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

同样，这将与 OTel 官方文档中记录的跟踪对应的列相关联，可以在 [这里](https://opentelemetry.io/docs/specs/otel/trace/api/) 找到。此架构采用许多与上述日志架构相同的设置，并附加了特定于跨度的 Link 列。

我们建议用户禁用自动架构创建，并手动创建表。这允许修改主键和二级键，并增加引入额外列以优化查询性能的机会。有关更多详细信息，请参见 [架构设计](/use-cases/observability/schema-design)。
## 优化插入 {#optimizing-inserts}

为了在获取强一致性保证的同时实现高插入性能，用户在通过收集器将可观察性数据插入 ClickHouse 时应遵循一些简单规则。通过正确配置 OTel 收集器，以下规则应当易于遵循。这还可以避免用户在首次使用 ClickHouse 时遇到的 [常见问题](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。
### 批量处理 {#batching}

默认情况下，发送到 ClickHouse 的每个插入都会导致 ClickHouse 立即创建一个包含插入数据及其他需要存储的元数据的存储部分。因此，与发送大量每个包含较少数据的插入相比，发送包含更多数据的较少插入会减少所需的写入次数。我们建议一次插入至少 1,000 行的数据。更多详细信息请参见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。

默认情况下，插入到 ClickHouse 是同步的且在相同情况下是幂等的。对于合并树引擎系列的表，ClickHouse 默认会自动 [去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。这意味着在以下情况中插入是容错的：

- (1) 如果接收数据的节点出现问题，插入查询将超时（或出现更具体的错误），并不会收到确认。
- (2) 如果数据被节点写入，但由于网络中断无法返回确认给查询的发送者，则发送者将收到超时或网络错误。

从收集器的视角来看，(1) 和 (2) 可能很难区分。然而，在这两种情况下，未确认的插入可以立即重试。只要重试的插入查询包含相同的数据且顺序相同，ClickHouse 将自动忽略重试的插入，如果（未确认的）原始插入成功。

我们建议用户使用之前配置中显示的 [批处理处理器](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md) 来满足上述要求。这确保插入作为一致的行批次发送，满足上述要求。如果收集器预计将具有高吞吐量（每秒事件），并且每次插入可以发送至少 5000 事件，则通常这是管道中所需的唯一批量。在这种情况下，收集器将在批处理器的 `timeout` 达到之前刷新批量，确保管道的端到端延迟保持较低，并且批量大小一致。
### 使用异步插入 {#use-asynchronous-inserts}

通常，当收集器的吞吐量较低时，用户被迫发送较小的批量，但他们仍期望数据在最低端到端延迟内到达 ClickHouse。在这种情况下，当批处理器的 `timeout` 到期时，将发送小批量。这可能会导致问题，这时需要异步插入。该情况通常出现在 **以代理角色配置的收集器直接发送到 ClickHouse** 的情况下。网关通过充当聚合器可以缓解这个问题 - 请参见 [使用网关扩展]("#scaling-with-gateways")。

如果无法确保大批量，用户可以通过 [异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) 将批量处理委托给 ClickHouse。通过异步插入，数据首先插入到缓冲区，然后再将其写入数据库存储。

<Image img={observability_6} alt="Async inserts" size="md"/>

使用 [启用异步插入](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，当 ClickHouse ① 接收到插入查询时，查询的数据会 ② 立即写入到内存缓冲区。当 ③ 进行下一个缓冲区刷新时，缓冲区的数据会 [排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 并作为部分写入数据库存储。请注意，在刷新到数据库存储之前，数据不可通过查询进行搜索；缓冲区刷新是 [可配置的](/optimize/asynchronous-inserts)。

要为收集器启用异步插入，请将 `async_insert=1` 添加到连接字符串中。我们建议用户使用 `wait_for_async_insert=1`（默认）以获得交付保证 - 有关更多详细信息，请参见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

一旦 ClickHouse 的缓冲区被刷新，异步插入的数据就会被插入。这发生在超过 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) 后，或在首次 INSERT 查询后的 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 毫秒后。如果 `async_insert_stale_timeout_ms` 设置为非零值，则在最后一个查询后的 `async_insert_stale_timeout_ms` 毫秒后会插入数据。用户可以调整这些设置以控制管道的端到端延迟。可以在 [这里](/operations/settings/settings#async_insert) 找到用于调整缓冲区刷新的其他设置。通常，默认值是合适的。

:::note 考虑自适应异步插入
在使用的代理数量较少、吞吐量较低但具有严格端到端延迟要求的情况下，[自适应异步插入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) 可能会很有用。通常，这些不适用于高吞吐量的可观察性用例，如 ClickHouse 所示。
:::

最后，使用异步插入时，之前与 ClickHouse 的同步插入相关的去重行为默认不启用。如有需要，请参见设置 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)。

有关配置此功能的完整详细信息，请参见 [这里](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，更深入的信息请参见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。
## 部署架构 {#deployment-architectures}

在使用 OTel 收集器与 ClickHouse 的情况下，有几种部署架构是可能的。我们在下面描述每种架构及其适用情况。
### 仅代理 {#agents-only}

在仅代理的架构中，用户将 OTel 收集器部署为边缘代理。这些代理接收来自本地应用程序的跟踪信息（例如，作为侧车容器）并从服务器和 Kubernetes 节点收集日志。在此模式下，代理直接将数据发送到 ClickHouse。

<Image img={observability_7} alt="Agents only" size="md"/>

此架构适合小型到中型部署。其主要优点是它不需要额外的硬件，并且保持 ClickHouse 可观察性解决方案的总体资源占用最小，应用程序与收集器之间的映射简单。

一旦代理数量超过几百，用户应考虑迁移到基于网关的架构。此架构有几个缺点，使其难以扩展：

- **连接扩展** - 每个代理将与 ClickHouse 建立连接。尽管 ClickHouse 具有维护数百（如果不是数千个）并发插入连接的能力，但这最终将成为限制因素，并使插入效率降低 - 即 ClickHouse 维护连接将消耗更多资源。使用网关可以最小化连接数量，使插入更加高效。
- **边缘处理** - 在此架构中，任何转换或事件处理都必须在边缘或在 ClickHouse 中进行。这不仅具有限制性，还可能意味着需要复杂的 ClickHouse 物化视图，或者将大量计算推送到边缘 - 而在这里，关键服务可能会受到影响，并且资源稀缺。
- **小批次和延迟** - 代理收集器可能单独收集非常少的事件。这通常意味着它们需要配置为定期刷新以满足交付服务水平协议。这可能导致收集器将小批量发送到 ClickHouse。虽然这是一个缺点，但可以通过异步插入来缓解 - 请参见 [优化插入](#optimizing-inserts)。
### 与网关扩展 {#scaling-with-gateways}

OTel 收集器可以作为网关实例进行部署，以解决上述限制。这些提供了一个独立的服务，通常按数据中心或地区划分。这些通过单个 OTLP 端点接收来自应用程序（或其他处于代理角色的收集器）的事件。通常会部署一组网关实例，并使用现成的负载均衡器在它们之间分配负载。

<Image img={observability_8} alt="Scaling with gateways" size="md"/>

该架构的目标是将计算密集型处理从代理处卸载，从而最小化它们的资源使用。这些网关可以执行本应由代理执行的转换任务。此外，通过聚合来自多个代理的事件，网关可以确保将大型批量发送到 ClickHouse - 从而实现高效插入。这些网关收集器可以很容易地随着代理的增加和事件吞吐量的增加而扩展。以下是示例网关配置，以及消费示例结构化日志文件的相关代理配置。请注意在代理与网关之间使用 OTLP 进行通信。

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

此架构的主要缺点是相关的成本和管理一组收集器的开销。

有关如何管理较大的基于网关的架构的示例，以及相关的学习，我们建议查看这篇 [博客](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)。
### 添加 Kafka {#adding-kafka}

读者可能会注意到上述架构未使用 Kafka 作为消息队列。

使用 Kafka 队列作为消息缓冲区是一种在日志架构中常见的设计模式，由 ELK 堆栈所普及。它提供了一些好处；主要是它有助于提供更强的消息传递保证，并有助于处理背压。消息从收集代理发送到 Kafka 并写入磁盘。理论上，集群的 Kafka 实例应该提供高吞吐量的消息缓冲，因为它以线性方式写入数据到磁盘的计算开销小于解析和处理消息 - 在 Elastic 中，例如，标记化和索引需要大量开销。将数据移离代理还降低了因源处的日志轮换而丢失消息的风险。最后，它提供了一些消息重放和跨区域复制的能力，这对某些用例可能是有吸引力的。

然而，ClickHouse 可以非常快速地处理数据插入 - 在适度硬件上每秒数百万行。来自 ClickHouse 的背压是 **罕见** 的。通常，利用 Kafka 队列意味着更多的架构复杂性和成本。如果您能接受日志不需要与银行交易和其他关键数据相同的交付保证原则，我们建议避免 Kafka 的复杂性。

但是，如果您需要高交付保证或重放数据的能力（可能是面向多个源），Kafka 可以作为有用的架构补充。

<Image img={observability_9} alt="Adding kafka" size="md"/>

在这种情况下，OTel 代理可以配置为通过 [Kafka 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) 将数据发送到 Kafka。然后，网关实例使用 [Kafka 接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) 消费消息。我们建议参考 Confluent 和 OTel 文档以获取更多详细信息。
### 估算资源 {#estimating-resources}

OTel 收集器的资源需求将取决于事件吞吐量、消息的大小和执行的处理量。OpenTelemetry 项目维护了 [用户基准](https://opentelemetry.io/docs/collector/benchmarks/)，可用于估算资源需求。

[根据我们的经验](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)，一个拥有 3 核心和 12GB RAM 的网关实例可以处理大约每秒 60,000 个事件。这假设有一个最小的处理管道，负责重命名字段且没有正则表达式。

对于负责将事件传输到网关的代理实例，并只为事件设置时间戳，我们建议用户根据预期的每秒日志数量进行资源配置。以下是用户可以作为起点的近似数字：

| 日志记录速率 | 收集器代理所需资源 |
|--------------|---------------------|
| 1k/秒       | 0.2 CPU, 0.2 GiB    |
| 5k/秒       | 0.5 CPU, 0.5 GiB    |
| 10k/秒      | 1 CPU, 1 GiB        |
