---
'title': '整合 OpenTelemetry'
'description': '整合 OpenTelemetry 和 ClickHouse 以实现可观测性'
'slug': '/observability/integrating-opentelemetry'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
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

任何可观察性解决方案都需要一种收集和导出日志与追踪的方法。因此，ClickHouse 推荐使用 [OpenTelemetry (OTel) 项目](https://opentelemetry.io/)。

"OpenTelemetry 是一个可观察性框架和工具包，旨在创建和管理遥测数据，如追踪、指标和日志。"

与 ClickHouse 或 Prometheus 不同，OpenTelemetry 不是一个可观察性后端，而是专注于遥测数据的生成、收集、管理和导出。尽管 OpenTelemetry 的初衷是让用户轻松通过特定语言的 SDK 为其应用程序或系统加上监测工具，但它已经扩展到包括通过 OpenTelemetry 收集器收集日志 - 这是一个接收、处理和导出遥测数据的代理或中介。
## ClickHouse 相关组件 {#clickhouse-relevant-components}

OpenTelemetry 由多个组件组成。除了提供数据和 API 规范、标准化协议以及字段/列的命名约定之外，OTel 还提供了构建可观察性解决方案所需的两个基本能力与 ClickHouse 搭配：

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) 是一个代理，接收、处理并导出遥测数据。基于 ClickHouse 的解决方案使用此组件进行日志收集和事件处理，然后进行批处理和插入。
- [语言 SDK](https://opentelemetry.io/docs/languages/) 实现了规范、API 和遥测数据的导出。这些 SDK 有效地确保追踪在应用程序代码中正确记录，生成组成的跨度，并确保通过元数据在服务间传播上下文，从而形成分布式追踪，并确保跨度可以相关联。这些 SDK 还得到了一个生态系统的支持，能够自动实现常见库和框架，因此用户无需更改其代码即可获得开箱即用的监测工具。

基于 ClickHouse 的可观察性解决方案利用这两种工具。
## 发行版 {#distributions}

OpenTelemetry 收集器有[多个发行版](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)。与 ClickHouse 解决方案所需的 filelog 接收器以及 ClickHouse 导出器仅存在于 [OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) 中。

这个发行版包含许多组件，并允许用户实验各种配置。然而，在生产环境中，建议限制收集器仅包含必要的组件。这样做的一些原因有：

- 减少收集器的大小，从而缩短收集器的部署时间
- 通过减少可用的攻击面，提高收集器的安全性

构建一个 [自定义收集器](https://opentelemetry.io/docs/collector/custom-collector/) 可以使用 [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) 来实现。
## 使用 OTel 进行数据摄取 {#ingesting-data-with-otel}
### 收集器部署角色 {#collector-deployment-roles}

为了收集日志并将其插入 ClickHouse，建议使用 OpenTelemetry Collector。OpenTelemetry Collector 可以以两种主要角色进行部署：

- **代理** - 代理实例在边缘收集数据，例如在服务器或 Kubernetes 节点上，或者直接从使用 OpenTelemetry SDK 加了监控的应用程序中接收事件。在后一种情况下，代理实例与应用程序一起运行或与应用程序在同一主机上运行（如 sidecar 或 DaemonSet）。代理可以将其数据直接发送到 ClickHouse 或发送到网关实例。在前一种情况下，这被称为 [Agent 部署模式](https://opentelemetry.io/docs/collector/deployment/agent/)。
- **网关** - 网关实例提供一个独立服务（例如，Kubernetes 中的一个部署），通常按集群、数据中心或区域进行配置。这些实例通过一个 OTLP 接口接收来自应用程序（或其他分片作为代理）的事件。通常，会部署一组网关实例，并使用开箱即用的负载均衡器将负载分配给它们。如果所有代理和应用程序都将其信号发送到这个单一接口，这通常被称为 [Gateway 部署模式](https://opentelemetry.io/docs/collector/deployment/gateway/)。

以下假设一个简单的代理收集器，将事件直接发送到 ClickHouse。有关使用网关的进一步细节和适用的情况，请参见 [使用网关进行扩展](#scaling-with-gateways)。
### 收集日志 {#collecting-logs}

使用收集器的主要优势在于，它允许你的服务快速卸载数据，让收集器负责进一步处理，如重试、批处理、加密或甚至敏感数据过滤。

收集器使用 [接收器](https://opentelemetry.io/docs/collector/configuration/#receivers)、[处理器](https://opentelemetry.io/docs/collector/configuration/#processors) 和 [导出器](https://opentelemetry.io/docs/collector/configuration/#exporters) 来进行三个主要处理阶段。接收器用于数据收集，可以是拉取或推送基础的。处理器提供了执行转换和丰富消息的能力。导出器负责将数据发送到下游服务。在理论上，这项服务可以是另一个收集器，但在下面的初步讨论中，我们假设所有数据都是直接发送到 ClickHouse 的。

<Image img={observability_3} alt="收集日志" size="md"/>

我们建议用户熟悉完整的接收器、处理器和导出器集合。

收集器提供两个主要的接收器来收集日志：

**通过 OTLP** - 在这种情况下，日志从 OpenTelemetry SDK 通过 OTLP 协议直接发送（推送）到收集器。 [OpenTelemetry 演示](https://opentelemetry.io/docs/demo/)采用这种方式，各种语言中的 OTLP 导出器假设本地收集器接口。在这种情况下，必须用 OTLP 接收器配置收集器——请参见上面的 [演示以获取配置](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)。这种方法的优势在于，日志数据将自动包含追踪 ID，允许用户在以后识别特定日志的追踪，反之亦然。

<Image img={observability_4} alt="通过 otlp 收集日志" size="md"/>

这种方法要求用户用其 [适当的语言 SDK](https://opentelemetry.io/docs/languages/) 为其代码加监控。

- **通过 Filelog 接收器抓取** - 该接收器在磁盘上监控文件并合成日志消息，将这些消息发送到 ClickHouse。此接收器处理复杂任务，例如检测多行消息、处理日志滚动、进行检查点以增强重启的可靠性以及提取结构。此接收器还能够监控 Docker 和 Kubernetes 容器日志，可通过 helm chart 部署，可以 [从这些日志中提取结构](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) 并填充 pod 细节。

<Image img={observability_5} alt="File log receiver" size="md"/>

**大多数部署将使用上述接收器的组合。我们建议用户阅读 [收集器文档](https://opentelemetry.io/docs/collector/) 并熟悉基本概念，以及 [配置结构](https://opentelemetry.io/docs/collector/configuration/) 和 [安装方法](https://opentelemetry.io/docs/collector/installation/)。**

:::note 提示: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) 对验证和可视化配置非常有用。
:::
## 结构化与非结构化 {#structured-vs-unstructured}

日志可以是结构化的或非结构化的。

结构化日志将采用 JSON 等数据格式，定义诸如 HTTP 代码和源 IP 地址等元数据字段。

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

非结构化日志虽然通常也具有通过正则表达式模式可提取的一些内在结构，但将日志纯粹表示为字符串。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

我们建议用户尽可能使用结构化日志，并以 JSON 格式（即 ndjson）记录。这将简化后续日志处理的要求，无论是在发送到 ClickHouse 之前使用 [Collector 处理器](https://opentelemetry.io/docs/collector/configuration/#processors)，还是在插入时使用物化视图。结构化日志最终会节省后续处理资源，降低 ClickHouse 解决方案所需的 CPU。
### 示例 {#example}

为了演示目的，我们提供了一个结构化（JSON）和非结构化的日志数据集，每个数据集都有大约 1000 万行，链接如下：

- [非结构化日志](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [结构化日志](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

我们在下面的示例中使用结构化数据集。确保下载并解压该文件以重现以下示例。

以下表示 OTel Collector 的简单配置，该配置在磁盘上读取这些文件，使用 filelog 接收器，并将结果消息输出到 stdout。由于我们的日志是结构化的，我们使用 [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md) 操作符。修改 access-structured.log 文件的路径。

:::note 考虑 ClickHouse 进行解析
下面的示例提取日志中的时间戳。这需要使用 `json_parser` 操作符，它将整行日志转换为 JSON 字符串，并将结果放入 `LogAttributes` 中。这可能是计算密集型的，而 [可以在 ClickHouse 中更高效地完成](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。等效的非结构化示例使用 [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) 实现，可以在 [这里](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==) 找到。
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

用户可以按照 [官方说明](https://opentelemetry.io/docs/collector/installation/) 本地安装收集器。重要的是，确保将说明修改为使用 [贡献发行版](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)（其中包含 `filelog` 接收器），例如，用户需要下载 `otelcol-contrib_0.102.1_darwin_arm64.tar.gz` 而不是 `otelcol_0.102.1_darwin_arm64.tar.gz`。可以在 [这里](https://github.com/open-telemetry/opentelemetry-collector-releases/releases) 找到发布版本。

安装后，OTel Collector 可以通过以下命令运行：

```bash
./otelcol-contrib --config config-logs.yaml
```

假设使用结构化日志，消息将以以下形式输出：

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

以上是由 OTel 收集器生成的单个日志消息。我们在后面的部分将这些相同的消息摄取到 ClickHouse。

日志消息的完整模式以及使用其他接收器时可能出现的附加列，将在 [这里](https://opentelemetry.io/docs/specs/otel/logs/data-model/) 中维护。**我们强烈建议用户熟悉此模式。**

关键在于日志行本身作为字符串保存在 `Body` 字段中，但 JSON 已由于 `json_parser` 被自动提取到 Attributes 字段。为适应适当的 `Timestamp` 列，该操作符同样被用于提取时间戳。有关使用 OTel 处理日志的建议，请参见 [处理](#processing---filtering-transforming-and-enriching)。

:::note 操作符
操作符是日志处理的最基本单元。每个操作符履行单一责任，例如从文件读取行或解析字段中的 JSON。然后，将操作符串联在一起形成管道，以实现所需的结果。
:::

上述消息没有 `TraceID` 或 `SpanID` 字段。如果存在，例如在用户实现 [分布式追踪](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces) 的情况下，这些字段可以使用上述相同技术从 JSON 中提取。

对于需要收集本地或 Kubernetes 日志文件的用户，我们建议用户熟悉 [filelog 接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration) 可用的配置选项，以及 [偏移量](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) 和 [多行日志解析的处理方式](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)。
## 收集 Kubernetes 日志 {#collecting-kubernetes-logs}

对于 Kubernetes 日志的收集，我们建议查看 [Open Telemetry 文档指南](https://opentelemetry.io/docs/kubernetes/)。推荐使用 [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) 来丰富日志和指标的 pod 元数据。这可能会生成动态元数据，例如存储在 `ResourceAttributes` 列中的标签。ClickHouse 当前对该列使用 `Map(String, String)` 类型。有关处理和优化此类型的更多细节，请参见 [使用 Maps](/use-cases/observability/schema-design#using-maps) 和 [从 maps 中提取](/use-cases/observability/schema-design#extracting-from-maps)。
## 收集追踪 {#collecting-traces}

对于希望为其代码加监测并收集追踪的用户，我们建议按照官方 [OTel 文档](https://opentelemetry.io/docs/languages/) 进行操作。

为了将事件发送到 ClickHouse，用户需要部署 OTel 收集器以通过相应的接收器通过 OTLP 协议接收追踪事件。 OpenTelemetry 演示提供了一个 [为每种支持的语言加监测示例](https://opentelemetry.io/docs/demo/) 以及将事件发送到收集器的代码示例。以下是输出事件到 stdout 的适当收集器配置示例：
### 示例 {#example-1}

由于追踪必须通过 OTLP 接收，因此我们使用 [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) 工具生成追踪数据。按照 [这里](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) 的说明进行安装。

以下配置在 OTLP 接收器上接收追踪事件，然后将它们发送到 stdout。

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

使用 `telemetrygen` 向收集器发送追踪事件：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

这将导致追踪消息类似于下面的示例，输出到 stdout：

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

以上是由 OTel 收集器生成的单个追踪消息。我们在后面的部分将这些相同的消息摄取到 ClickHouse。

追踪消息的完整模式将在 [这里](https://opentelemetry.io/docs/concepts/signals/traces/) 中维护。我们强烈建议用户熟悉此模式。
## 处理 - 过滤、转换和丰富 {#processing---filtering-transforming-and-enriching}

如前面示例中为日志事件设置时间戳所示，用户通常会想要过滤、转换和丰富事件消息。可以使用 OpenTelemetry 中的多个功能实现这一点：

- **处理器** - 处理器获取收集器通过 [接收器收集的数据并对其进行修改或转换](https://opentelemetry.io/docs/collector/transforming-telemetry/)，然后发送到导出器。处理器的应用顺序按照收集器配置中的 `processors` 部分进行配置。这些是可选的，但通常建议使用最低限度的 [推荐配置](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。在使用与 ClickHouse 配合的 OTel 收集器时，我们建议将处理器限制为：

    - 一个 [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) 用于防止收集器的内存溢出情况。有关建议，请参见 [估算资源](#estimating-resources)。
    - 任何基于上下文进行丰富的处理器。例如， [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) 允许自动设置跨度、指标和日志资源属性，使用 k8s 元数据例如通过其源 pod id 丰富事件。
    - 如有需要，对追踪使用 [尾部或头部抽样](https://opentelemetry.io/docs/concepts/sampling/)。
    - [基本过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 丢弃不需要的事件，如果无法通过操作符完成（见下文）。
    - [批处理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - 在与 ClickHouse 工作时至关重要，以确保数据以批处理方式发送。请参见 ["导出到 ClickHouse"](#exporting-to-clickhouse)。

- **操作符** - [操作符](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 提供了接收器所提供的最基本处理单元。支持基本解析，允许设置严重性和时间戳等字段。这里支持 JSON 和正则表达式解析，以及事件过滤和基本转换。我们建议在这里执行事件过滤。

我们建议用户避免使用操作符或 [转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) 进行过多的事件处理。这可能会造成相当大的内存和 CPU 开销，尤其是 JSON 解析。在插入时可以在 ClickHouse 处理所有处理，使用物化视图和某些带有例外的列——具体而言，上下文感知的丰富，例如添加 k8s 元数据。有关详细信息，请参见 [使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。

如果使用 OTel 收集器进行处理，我们建议在网关实例上进行转换，并尽量减少在代理实例上进行的工作。这将确保边缘服务器上的代理所需的资源尽可能精简。通常，我们看到用户仅执行过滤（以减少不必要的网络使用）、时间戳设置（通过操作符）和丰富要求在代理中需要上下文的操作。例如，如果网关实例在不同的 Kubernetes 集群中，k8s 丰富将在代理中发生。
### 示例 {#example-2}

以下配置显示了非结构化日志文件的收集。注意使用操作符从日志行中提取结构（`regex_parser`）并过滤事件，以及使用处理器进行事件批处理和限制内存使用。

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

导出器将数据发送到一个或多个后端或目的地。导出器可以是拉取或推送基础的。为了将事件发送到 ClickHouse，用户需要使用基于推送的 [ClickHouse 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)。

:::note 使用 OpenTelemetry Collector Contrib
ClickHouse 导出器是 [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main) 的一部分，而不是核心发行版。用户可以选择使用贡献发行版或 [自建收集器](https://opentelemetry.io/docs/collector/custom-collector/)。
:::

下面是完整的配置文件。

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

- **pipelines** - 上述配置强调使用 [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines)，由一组接收器、处理器和导出器组成，分别负责日志和追踪。
- **endpoint** - 与 ClickHouse 的通信通过 `endpoint` 参数进行配置。连接字符串 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` 使得通信通过 TCP 进行。如果用户由于流量交换原因更倾向于 HTTP，可以按 [这里的描述](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options) 修改该连接字符串。有关完整连接详细信息的说明，允许在该连接字符串中指定用户名和密码，请参见 [这里](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)。

**重要:** 请注意，上述连接字符串启用了压缩（lz4）以及异步插入。我们建议始终启用这两个功能。有关异步插入的更多详细信息，请参见 [批处理](#batching)。 压缩应始终指定，并且在早期版本的导出器中默认不会启用。

- **ttl** - 这里的值决定数据的保留时间。更多详细信息请参见“管理数据”。应将其指定为小时单位，例如 72h。我们在下面的示例中禁用 TTL，因为我们的数据来自 2019 年，插入时 ClickHouse 将立即删除它。
- **traces_table_name** 和 **logs_table_name** - 决定日志和追踪表的名称。
- **create_schema** - 决定启动时是否使用默认模式创建表。默认为 true，以便快速入门。用户应将其设置为 false 并定义自己的模式。
- **database** - 目标数据库。
- **retry_on_failure** - 设置以确定是否应重试失败的批次。
- **batch** - 批处理处理器确保将事件作为批次发送。我们建议的值大约为 5000，超时为 5s。这两个条件中哪个先达到将触发批次刷新到导出器。降低这些值意味着更低延迟的管道，数据可以更早可供查询，但代价是向 ClickHouse 发送更多的连接和批次。如果用户未使用 [异步插入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，则不推荐这样做，因为这可能会导致 ClickHouse 中 [分区过多](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) 的问题。相反，如果用户正在使用异步插入，则可用数据的查询还将依赖于异步插入设置——不过数据仍会更早地从连接器刷新。有关更多详细信息，请参见 [批处理](#batching)。
- **sending_queue** - 控制发送队列的大小。队列中的每项包含一个批次。如果由于 ClickHouse 不可达而超出该队列，例如事件继续到达，则批次将被丢弃。

假设用户已提取结构化日志文件，并且运行着 [本地实例的 ClickHouse](/install)（具有默认身份验证），用户可以通过以下命令运行此配置：

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

要将追踪数据发送到此收集器，运行以下命令，使用 `telemetrygen` 工具：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

一旦运行，可以通过简单的查询确认日志事件的存在：

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

默认情况下，ClickHouse 导出器为日志和跟踪创建一个目标日志表。可以通过设置 `create_schema` 禁用此功能。此外，日志和跟踪表的名称可以通过上述设置从默认的 `otel_logs` 和 `otel_traces` 修改。

:::note
在下面的架构中，我们假设已启用 TTL 并设置为 72 小时。
:::

日志的默认架构如下所示（`otelcol-contrib v0.102.1`）：

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

这里的列与 OTel 官方规范中记录的日志相对应，详细信息可查看 [此处](https://opentelemetry.io/docs/specs/otel/logs/data-model/)。

关于此架构的一些重要说明：

- 默认情况下，表通过 `PARTITION BY toDate(Timestamp)` 按日期分区。这使得删除过期数据变得高效。
- TTL 通过 `TTL toDateTime(Timestamp) + toIntervalDay(3)` 设置，这对应于收集器配置中设置的值。 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 表示只有当所有包含的行都已过期时，才会删除整个分区片段。这比在分区片段中删除行更高效，因为后者需要成本较高的删除操作。我们建议始终设置此选项。有关更多详情，请参见 [TTL 数据管理](/observability/managing-data#data-management-with-ttl-time-to-live)。
- 该表使用经典的 [`MergeTree` 引擎](/engines/table-engines/mergetree-family/mergetree)。这是推荐用于日志和跟踪的引擎，通常不需要更改。
- 表按 `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` 排序。这意味着查询将针对 `ServiceName`、`SeverityText`、`Timestamp` 和 `TraceId` 的过滤器进行优化 - 列表中的早期列会比后面的列更快地过滤。例如，通过 `ServiceName` 进行过滤将比通过 `TraceId` 进行过滤快得多。用户应根据其预期的访问模式修改此排序 - 参见 [选择主键](/use-cases/observability/schema-design#choosing-a-primary-ordering-key)。
- 上述架构对列应用了 `ZSTD(1)` 压缩。这为日志提供了最佳压缩。用户可以提高 ZSTD 压缩级别（高于默认值 1）以获得更好的压缩效果，尽管这通常不太有用。提高此值将在插入时产生更大的 CPU 开销（在压缩期间），而解压缩（因此查询）应保持可比性。有关更多详情，请参见 [此处](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。对时间戳还应用了额外的 [增量编码](/sql-reference/statements/create/table#delta)，旨在减少其在磁盘上的大小。
- 请注意 [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) 和 [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) 是映射。用户应熟悉这些之间的区别。关于如何访问这些映射以及优化访问其中键的方式，详见 [使用映射](/use-cases/observability/integrating-opentelemetry.md)。
- 其他大多数类型，例如 `ServiceName` 作为 LowCardinality，也经过优化。请注意，尽管在我们示例日志中 Body 是 JSON 格式，但被存储为 String。
- 对映射键和值以及 Body 列应用了布隆过滤器。这些旨在改善访问这些列的查询时间，但通常不是必需的。有关更多信息，请参见 [二级/数据跳过索引](/use-cases/observability/schema-design#secondarydata-skipping-indices)。

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

同样，此架构与 OTel 官方规范中记录的跟踪相对应，详细信息可参见 [此处](https://opentelemetry.io/docs/specs/otel/trace/api/)。此架构采用与上述日志架构相同的许多设置，增加了针对跨度的 Link 列。

我们建议用户禁用自动架构创建，并手动创建他们的表。这允许修改主键和副键，以及引入额外列以优化查询性能的机会。有关更多详情，请参见 [架构设计](/use-cases/observability/schema-design).

## 优化插入 {#optimizing-inserts}

为了在保证强一致性保证的同时实现高插入性能，用户在通过收集器将可观察数据插入 ClickHouse 时应遵循简单规则。在正确配置 OTel 收集器的情况下，以下规则应易于遵循。这也避免了用户在第一次使用 ClickHouse 时遇到的 [常见问题](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。

### 批量插入 {#batching}

默认情况下，发送到 ClickHouse 的每次插入会导致 ClickHouse 立即创建一个包含插入数据及其他需要存储的元数据的存储部分。因此，发送较少次数的插入，每次包含更多数据，相对于发送更多次数的插入，每次包含较少数据，将减少所需的写入次数。我们建议每次以至少 1,000 行的数据进行相当大的批量插入。更多细节请参见 [此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。

默认情况下，向 ClickHouse 的插入是同步的，并且如果相同则是幂等的。对于 MergeTree 引擎系列的表，ClickHouse 默认会自动 [去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。这意味着在以下情况下插入是容忍的：

- (1) 如果接收数据的节点出现问题，插入查询将超时（或得到更具体的错误）并且不会收到确认。
- (2) 如果数据已写入节点，但由于网络中断无法将确认返回给查询的发送者，发送者将收到超时或网络错误。

从收集器的角度来看，(1) 和 (2) 很难区分。然而，在这两种情况下，未经确认的插入可以立即重试。只要重试的插入查询包含相同的数据且顺序一致，如果（未经确认的）原始插入成功，ClickHouse 将自动忽略重试的插入。

我们建议用户使用上述配置中显示的 [批处理处理器](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md) 来满足上述要求。这确保插入作为一致的行批量发送，满足上述要求。如果收集器需预期有高吞吐量（每秒事件），并且每次插入至少可以发送 5,000 个事件，这通常是管道中唯一需要的批处理。在此情况下，收集器将在批处理处理器的 `timeout` 被触发之前刷新批量，确保管道的端到端延迟保持较低且批量大小一致。

### 使用异步插入 {#use-asynchronous-inserts}

通常，当收集器的吞吐量低时，用户被迫发送较小的批量，但仍希望数据在最低的端到端延迟内到达 ClickHouse。在这种情况下，当批处理处理器的 `timeout` 过期时，发送较小的批量。这可能会导致问题，这时需要使用异步插入。此情况下，通常出现在 **作为代理角色的收集器配置为直接发送到 ClickHouse** 时。网关通过充当聚合器可以缓解这个问题 - 请参见 [利用网关进行扩展](#scaling-with-gateways)。

如果无法保证大批量，用户可以使用 [异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) 将批处理委托给 ClickHouse。使用异步插入时，数据首先插入到缓冲区，然后 later 或异步地写入数据库存储。

<Image img={observability_6} alt="Async inserts" size="md"/>

通过 [启用异步插入](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，当 ClickHouse ① 接收插入查询时，查询的数据会立即写入内存缓冲区。 当 ③ 下一个缓冲区刷新发生时，缓冲区的数据会 [排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 并作为一个部分写入数据库存储。请注意，在数据刷新到数据库存储之前，查询无法搜索该数据；缓冲区刷新是 [可配置的](/optimize/asynchronous-inserts)。

要为收集器启用异步插入，请在连接字符串中添加 `async_insert=1`。我们建议用户使用 `wait_for_async_insert=1`（默认值）以获得交付保证 - 参见 [此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 获取更多详情。

一旦 ClickHouse 缓冲区被刷新，异步插入的数据就会被插入。这发生在 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) 超过或自首个 INSERT 查询以来经过 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 毫秒后。如果将 `async_insert_stale_timeout_ms` 设置为非零值，则在上一个查询后经过 `async_insert_stale_timeout_ms 毫秒` 后插入数据。用户可以调整这些设置以控制其管道的端到端延迟。有关可以用来调整缓冲区刷新设置的其他设置，请参见 [此处](/operations/settings/settings#async_insert)。一般来说，默认设置是适宜的。

:::note 考虑自适应异步插入
在使用较少代理、吞吐量较低但具有严格的端到端延迟要求的情况下，[自适应异步插入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) 可能会很有用。通常，这些在 ClickHouse 的高吞吐量可观察用例中并不适用。
:::

最后，使用异步插入时，之前与 ClickHouse 的同步插入相关的去重行为默认未启用。如果需要，请查看设置 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)。

有关配置此功能的完整详情，请参见 [此处](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，深度分析请见 [此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

## 部署架构 {#deployment-architectures}

在使用 OTel 收集器与 ClickHouse 时，可以实现几种部署架构。我们在下面描述每种架构及其可能的适用情况。

### 仅代理 {#agents-only}

在仅使用代理的架构中，用户将 OTel 收集器作为代理部署到边缘。这些代理从本地应用程序（例如作为边车容器）接收跟踪，并从服务器和 Kubernetes 节点收集日志。在此模式下，代理直接将其数据发送到 ClickHouse。

<Image img={observability_7} alt="Agents only" size="md"/>

此架构适用于小型至中型部署。其主要优点是它不需要额外的硬件，并且保持 ClickHouse 可观察解决方案的总资源占用尽可能小，应用程序与收集器之间简单映射。

用户应考虑在代理数量超过几百时迁移到基于网关的架构。该架构具有若干缺点，使其难以扩展：

- **连接扩展** - 每个代理都将与 ClickHouse 建立连接。虽然 ClickHouse 能够维持数百个（甚至数千个）并发插入连接，但这最终将成为限制因素，使插入效率降低 - 即 ClickHouse 在维护连接时会消耗更多资源。使用网关可以减少连接数量，从而提高插入效率。
- **边缘处理** - 在此架构中，任何转换或事件处理都必须在边缘或在 ClickHouse 中执行。这不仅限制了操作的灵活性，还可能意味着必须复杂的 ClickHouse 物化视图或将大量计算推送到边缘 - 可能影响关键服务且资源稀缺。
- **小批量和延迟** - 代理收集器可能各自收集非常少的事件。这通常意味着他们需要配置为在设定的时间间隔内刷新以满足交付 SLAs。这可能导致收集器向 ClickHouse 发送小批量。尽管这是一种缺点，但可以通过异步插入进行缓解 - 请参见 [优化插入](#optimizing-inserts)。

### 通过网关进行扩展 {#scaling-with-gateways}

OTel 收集器可以作为网关实例进行部署，以解决上述限制。这些网关提供独立的服务，通常按数据中心或地理区域划分。这些网关通过单个 OTLP 端点接收来自应用程序（或以代理角色的其他收集器）的事件。通常会部署一组网关实例，并使用现成的负载均衡器在它们之间分配负载。

<Image img={observability_8} alt="Scaling with gateways" size="md"/>

此架构的目标是减轻代理的计算密集型处理，从而最小化它们的资源使用。通过聚合来自多个代理的事件，这些网关可以确保较大的批量传输到 ClickHouse，从而实现高效的插入。这些网关收集器可以随着添加更多代理和事件吞吐量的增加而轻松扩展。下面是一个示例网关配置，以及与示例结构日志文件的相关代理配置。请注意代理与网关之间使用 OTLP 进行通信。

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

此架构的主要缺点是管理一组收集器的相关成本和开销。

有关管理大型基于网关的架构的示例及相关学习经验，我们推荐本文 [博客文章](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)。

### 添加 Kafka {#adding-kafka}

读者可能会注意到上述架构没有使用 Kafka 作为消息队列。

使用 Kafka 队列作为消息缓冲区是日志架构中的一种流行设计模式，并且得到了 ELK 堆栈的推广。它提供了一些好处；主要是，它有助于提供更强的消息交付保证并帮助应对背压。消息从收集代理发送到 Kafka 并写入磁盘。从理论上讲，集群 Kafka 实例应提供高吞吐量的消息缓冲，因为将数据线性写入磁盘所需的计算开销低于解析和处理消息 - 例如在 Elastic 中，标记化和索引会消耗大量开销。通过将数据从代理移走，可以减少因为源头的日志旋转而导致丢失消息的风险。最后，它提供了一些消息重放和跨区域复制能力，这可能会吸引某些使用案例。

然而，ClickHouse 可以非常快速地处理数据插入 - 在中等硬件上每秒数百万行。ClickHouse 中的背压是 **罕见的**。通常，利用 Kafka 队列意味着更复杂的架构和成本。如果您能接受日志不需要与银行交易和其他关键数据相同的交付保证的原则，我们建议避免 Kafka 的复杂性。

然而，如果您需要高交付保证或重放数据的能力（可能是多个源），Kafka 可以作为有用的架构补充。

<Image img={observability_9} alt="Adding kafka" size="md"/>

在这种情况下，OTel 代理可以配置为通过 [Kafka 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) 将数据发送到 Kafka。网关实例再通过 [Kafka 接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) 消费消息。我们建议查阅 Confluent 和 OTel 的文档以获取更多详情。

### 资源评估 {#estimating-resources}

OTel 收集器所需的资源将取决于事件吞吐量、消息大小和处理执行的数量。OpenTelemetry 项目维护了 [用户基准](https://opentelemetry.io/docs/collector/benchmarks/)，用于估算资源要求。

[根据我们的经验](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)，具有 3 核心和 12GB RAM 的网关实例可以处理每秒约 60,000 个事件。这假设一个仅负责重命名字段的最小处理管道，并且没有正则表达式。

对于负责将事件传输到网关的代理实例，仅设置事件的时间戳，我们建议用户基于预计的每秒日志量进行资源配置。以下是用户可以作为起始点使用的粗略数字：

| 日志速率 | 收集代理资源 |
|--------------|------------------------------|
| 1k/秒       | 0.2 CPU, 0.2 GiB              |
| 5k/秒       | 0.5 CPU, 0.5 GiB             |
| 10k/秒      | 1 CPU, 1 GiB                 |
