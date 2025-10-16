---
'title': '整合 OpenTelemetry'
'description': '整合 OpenTelemetry 和 ClickHouse 以实现可观察性'
'slug': '/observability/integrating-opentelemetry'
'keywords':
- 'Observability'
- 'OpenTelemetry'
'show_related_blogs': true
'doc_type': 'guide'
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';
import Image from '@theme/IdealImage';


# 集成 OpenTelemetry 以进行数据收集

任何可观察性解决方案都需要收集和导出日志和跟踪的手段。为此，ClickHouse 推荐[OpenTelemetry (OTel) 项目](https://opentelemetry.io/)。

“OpenTelemetry 是一个可观察性框架和工具包，旨在创建和管理遥测数据，例如跟踪、度量和日志。”

与 ClickHouse 或 Prometheus 不同，OpenTelemetry 不是一个可观察性后端，而是专注于遥测数据的生成、收集、管理和导出。虽然 OpenTelemetry 的初衷是让用户能够轻松使用特定语言的 SDK 对他们的应用程序或系统进行仪器化，但它已经扩展到通过 OpenTelemetry 收集器收集日志——一个接收、处理和导出遥测数据的代理或代理。

## ClickHouse 相关组件 {#clickhouse-relevant-components}

OpenTelemetry 包含多个组件。除了提供数据和 API 规范、标准化协议以及字段/列的命名约定外，OTel 还提供了两种功能，这些功能对于使用 ClickHouse 构建可观察性解决方案至关重要：

- [OpenTelemetry 收集器](https://opentelemetry.io/docs/collector/) 是一个代理，它接收、处理并导出遥测数据。基于 ClickHouse 的解决方案使用该组件来进行日志收集和事件处理，然后进行批处理和插入。
- [语言 SDK](https://opentelemetry.io/docs/languages/) 实现了规范、API 和遥测数据的导出。这些 SDK 有效确保在应用程序的代码中正确记录跟踪，生成组成的跨度并确保上下文通过元数据在服务之间传播，从而形成分布式跟踪并确保跨度可以相关联。这些 SDK 得到了自动实现公共库和框架的生态系统的补充，因此用户不需要更改他们的代码即可获得开箱即用的仪器。

一个基于 ClickHouse 的可观察性解决方案利用了这两种工具。
## 分发 {#distributions}

OpenTelemetry 收集器有[多种分发](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)。文件日志接收器和 ClickHouse 导出器——对于 ClickHouse 解决方案所需的，只存在于[OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)。

此分发包含许多组件，允许用户尝试各种配置。但是，在生产环境中，建议将收集器限制为仅包含环境所需的组件。这么做的一些原因包括：

- 减少收集器的大小，减小收集器的部署时间
- 通过减少可用攻击面提高收集器的安全性

构建[自定义收集器](https://opentelemetry.io/docs/collector/custom-collector/)可以使用[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)实现。
## 使用 OTel 收集数据 {#ingesting-data-with-otel}
### 收集器部署角色 {#collector-deployment-roles}

为收集日志并将其插入 ClickHouse，建议使用 OpenTelemetry 收集器。OpenTelemetry 收集器可以以两种主要角色进行部署：

- **代理** - 代理实例在边缘收集数据，例如在服务器或 Kubernetes 节点上，或直接从应用程序接收事件——这些应用程序使用 OpenTelemetry SDK 进行了仪器化。在后者的情况下，代理实例与应用程序一起运行或与应用程序在同一主机上运行（例如作为边车或 DaemonSet）。代理可以将其数据直接发送到 ClickHouse，也可以发送到网关实例。在前一种情况下，这被称为[代理部署模式](https://opentelemetry.io/docs/collector/deployment/agent/)。
- **网关** - 网关实例提供独立的服务（例如，在 Kubernetes 中的部署），通常按集群、数据中心或区域配置。这些实例通过单个 OTLP 端点接收来自应用程序（或其他收集器作为代理）的事件。通常会部署一组网关实例，并使用开箱即用的负载均衡器在它们之间分配负载。如果所有代理和应用程序将其信号发送到此单一端点，则通常称为[网关部署模式](https://opentelemetry.io/docs/collector/deployment/gateway/)。

以下假设一个简单的代理收集器，将其事件直接发送到 ClickHouse。有关使用网关及其适用时机的更多详细信息，请参阅[与网关的扩展](#scaling-with-gateways)。
### 收集日志 {#collecting-logs}

使用收集器的主要优点是它可以让你的服务快速卸载数据，让收集器负责额外处理，例如重试、批处理、加密或甚至敏感数据过滤。

收集器使用术语[接收器](https://opentelemetry.io/docs/collector/configuration/#receivers)、[处理器](https://opentelemetry.io/docs/collector/configuration/#processors)和[导出器](https://opentelemetry.io/docs/collector/configuration/#exporters)来描述其三个主要处理阶段。接收器用于数据收集，可以是基于拉取或推送。处理器提供执行转换和消息丰富的能力。导出器负责将数据发送到下游服务。虽然理论上可以将该服务发送到另一个收集器，但我们假设所有数据直接发送到 ClickHouse，以进行以下初步讨论。

<Image img={observability_3} alt="收集日志" size="md"/>

我们建议用户熟悉完整的接收器、处理器和导出器集合。

收集器提供两个主要接收器用于收集日志：

**通过 OTLP** - 在这种情况下，日志通过 OTLP 协议直接从 OpenTelemetry SDK 发送（推送）到收集器。[OpenTelemetry 演示](https://opentelemetry.io/docs/demo/)采用这种方法，每种语言中的 OTLP 导出器假定 local 收集器端点。在这种情况下，收集器必须配置为使用 OTLP 接收器——请参见上面的[演示以获取配置](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)。该方法的优势是日志数据将自动包含 Trace Id，从而允许用户稍后识别特定日志的跟踪，反之亦然。

<Image img={observability_4} alt="通过 otlp 收集日志" size="md"/>

此方法要求用户使用其[适当语言的 SDK](https://opentelemetry.io/docs/languages/)对代码进行仪器化。

- **通过文件日志接收器抓取** - 此接收器在磁盘上跟踪文件并形成日志消息，将这些消息发送到 ClickHouse。此接收器处理复杂任务，例如检测多行消息、处理日志回滚、检查点以实现重启的健壮性以及提取结构。此接收器还能够跟踪 Docker 和 Kubernetes 容器日志，可以作为 helm 图表部署，[从中提取结构](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)并丰富其中的 pod 详细信息。

<Image img={observability_5} alt="文件日志接收器" size="md"/>

**大多数部署将使用上述接收器的组合。我们建议用户阅读[收集器文档](https://opentelemetry.io/docs/collector/)并熟悉基本概念，以及[配置结构](https://opentelemetry.io/docs/collector/configuration/)和[安装方法](https://opentelemetry.io/docs/collector/installation/)。**

:::note 提示: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) 对于验证和可视化配置非常有用。
:::
## 结构化日志与非结构化日志 {#structured-vs-unstructured}

日志可以是结构化的或非结构化的。

结构化日志将使用 JSON 等数据格式，定义元数据字段，例如 http 代码和源 IP 地址。

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

非结构化日志虽然也通常具有通过正则表达式模式提取的某种内在结构，但将日志纯粹表示为字符串。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

我们建议用户在可能的情况下使用结构化日志并以 JSON（即 ndjson）记录。这将简化后续日志的处理，无论是通过[收集器处理器](https://opentelemetry.io/docs/collector/configuration/#processors)在发送到 ClickHouse 之前，还是在插入时使用物化视图。结构化日志最终将节省后续处理资源，减少 ClickHouse 解决方案中所需的 CPU。
### 示例 {#example}

作为示例，我们提供了一个结构化（JSON）和一个非结构化日志数据集，每个数据集大约有 1000 万行，可以在以下链接中获得：

- [非结构化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [结构化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

我们将在下面的示例中使用结构化数据集。确保下载并解压此文件以重现以下示例。

以下是 OTel 收集器的简单配置，它读取磁盘上的这些文件，使用文件日志接收器，并将结果消息输出到 stdout。由于我们的日志是结构化的，我们使用[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md)操作符。请修改访问结构化.log 文件的路径。

:::note 请考虑使用 ClickHouse 进行解析
下面的示例提取了日志中的时间戳。这需要使用 `json_parser` 操作符，该操作符将整个日志行转换为 JSON 字符串，并将结果放置在 `LogAttributes` 中。这可能是计算密集型的，并且[可以在 ClickHouse 中更高效地完成](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。可以在[这里](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)找到相应的非结构化示例，该示例使用[`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md)来实现这一点。
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

用户可以遵循[官方说明](https://opentelemetry.io/docs/collector/installation/)在本地安装收集器。重要的是，确保说明已修改为使用[contrib 分发](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)（其中包含 `filelog` 接收器），例如而不是 `otelcol_0.102.1_darwin_arm64.tar.gz`，用户将下载 `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`。发布版本可以在[这里](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)找到。

安装后，可以使用以下命令运行 OTel 收集器：

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

上面的日志消息表示由 OTel 收集器生成的单个日志消息。我们将在后面的部分将这些相同的消息导入 ClickHouse。

日志消息的完整架构，以及如果使用其他接收器可能存在的额外列，维护在[这里](https://opentelemetry.io/docs/specs/otel/logs/data-model/)。**我们强烈建议用户熟悉此架构。**

关键在于日志行本身作为字符串保存在 `Body` 字段内，但 JSON 已通过 `json_parser` 自动提取到 `Attributes` 字段。此同一[操作符](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)已用于将时间戳提取到适当的 `Timestamp` 列。有关使用 OTel 处理日志的建议，请参阅[处理](#processing---filtering-transforming-and-enriching)。

:::note 操作符
操作符是日志处理的最基本单位。每个操作符履行单一责任，例如从文件中读取行或从字段解析 JSON。操作符然后在管道中链接在一起以实现所需的结果。
:::

上述消息没有 `TraceID` 或 `SpanID` 字段。如果存在，例如在用户实现[分布式跟踪](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)的情况，使用上面显示的相同技术可以从 JSON 中提取这些字段。

对于需要收集本地或 Kubernetes 日志文件的用户，我们建议用户熟悉[文件日志接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration)可用的配置选项，以及[偏移量](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking)和[多行日志解析的处理](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)。
## 收集 Kubernetes 日志 {#collecting-kubernetes-logs}

对于 Kubernetes 日志的收集，我们建议参考[OpenTelemetry 文档指南](https://opentelemetry.io/docs/kubernetes/)。建议使用[Kubernetes 属性处理器](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor)来丰富日志和指标，并添加 pod 元数据。这可能会产生动态元数据，例如存储在列 `ResourceAttributes` 中的标签。 ClickHouse 目前为此列使用类型 `Map(String, String)`。有关处理和优化此类型的更多详细信息，请参见[使用 Maps](/use-cases/observability/schema-design#using-maps)和[从地图中提取](/use-cases/observability/schema-design#extracting-from-maps)。
## 收集跟踪 {#collecting-traces}

对于希望对代码进行仪器并收集跟踪的用户，我们建议遵循官方[OTel 文档](https://opentelemetry.io/docs/languages/)。

为了将事件发送到 ClickHouse，用户需要部署 OTel 收集器以通过相应的接收器通过 OTLP 协议接收跟踪事件。OpenTelemetry 演示提供了一个[为每种受支持语言进行仪器的示例](https://opentelemetry.io/docs/demo/)并将事件发送到收集器。下面显示了一个适当的收集器配置示例，该配置将事件输出到 stdout：
### 示例 {#example-1}

由于跟踪必须通过 OTLP 接收，因此我们使用[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)工具生成跟踪数据。请遵循[此处](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)的说明进行安装。

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

通过 `telemetrygen` 发送跟踪事件到收集器：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

这将产生类似于下面示例的跟踪消息，并输出到 stdout：

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

上述内容表示由 OTel 收集器生成的单条跟踪消息。我们将在后面的部分将这些相同的消息导入 ClickHouse。

跟踪消息的完整架构在[这里](https://opentelemetry.io/docs/concepts/signals/traces/)中维护。我们强烈建议用户熟悉此架构。
## 处理 - 过滤、转换和丰富 {#processing---filtering-transforming-and-enriching}

如前面的示例中所示，设置日志事件的时间戳后，用户无疑希望过滤、转换和丰富事件消息。这可以通过 OpenTelemetry 中的多个功能实现：

- **处理器** - 处理器从[接收器获取数据并修改或转换](https://opentelemetry.io/docs/collector/transforming-telemetry/)它，然后将其发送到导出器。处理器按配置的顺序应用于收集器配置的 `processors` 部分。这些是可选的，但通常建议的最小集是[通常推荐](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。在将 OTel 收集器与 ClickHouse 一起使用时，我们建议将处理器限制为：

  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)用于防止收集器出现内存不足的情况。请参阅[估算资源](#estimating-resources)以获取建议。
  - 任何基于上下文的丰富处理器。例如，[Kubernetes 属性处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)允许使用 k8s 元数据自动设置跨度、指标和日志资源属性，例如使用其源 pod id 丰富事件。
  - 如果需要跟踪，也可以使用[尾部或头部采样](https://opentelemetry.io/docs/concepts/sampling/)。
  - [基本过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 如果无法通过操作符实现，则丢弃不需要的事件（见下文）。
  - [批处理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - 在与 ClickHouse 交互时确保数据以批处理形式发送时是必需的。请参见[“导出到 ClickHouse”](#exporting-to-clickhouse)。

- **操作符** - [操作符](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)提供了接收器中可用的最基本的处理单元。支持基本解析，允许设置如 Severity 和 Timestamp 等字段。此处支持 JSON 和正则表达式解析，以及事件过滤和基本转换。我们建议在此处执行事件过滤。

我们建议用户避免大量使用操作符或[转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)进行事件处理。这可能会产生相当大的内存和 CPU 开销，尤其是 JSON 解析。在 ClickHouse 中进行所有处理在插入时间使用物化视图是可能的，虽然有一些例外，特别是上下文感知的丰富，例如添加 k8s 元数据。有关更多详细信息，请参见[使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。

如果通过 OTel 收集器进行处理，我们建议在网关实例中进行转换，并最小化在代理实例中进行的工作。这将确保在边缘运行的代理（例如服务器）所需的资源尽可能少。通常，我们看到用户仅执行过滤（以最小化不必要的网络使用）、时间戳设置（通过操作符）和需要上下文的丰富处理。例如，如果网关实例位于不同的 Kubernetes 集群中，k8s 丰富将需要在代理中发生。
### 示例 {#example-2}

以下配置显示了对非结构化日志文件的收集。请注意使用操作符从日志行中提取结构（`regex_parser`）以及过滤事件，以及使用处理器批处理事件并限制内存使用。

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

导出器将数据发送到一个或多个后端或目的地。导出器可以是基于拉取或推送的。为了将事件发送到 ClickHouse，用户需要使用基于推送的[ClickHouse 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)。

:::note 使用 OpenTelemetry Collector Contrib
ClickHouse 导出器是[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main)的一部分，而不是核心分发。用户可以使用 contrib 分发或[构建自己的收集器](https://opentelemetry.io/docs/collector/custom-collector/)。
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

- **管道** - 上述配置突出了使用[管道](https://opentelemetry.io/docs/collector/configuration/#pipelines)，其中包含一组接收器、处理器和导出器，分别用于日志和跟踪。
- **端点** - 通过 `endpoint` 参数配置与 ClickHouse 的通信。连接字符串 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` 会导致通过 TCP 进行通信。如果用户出于流量切换原因更喜欢 HTTP，可以按照[这里](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)所述修改此连接字符串。有关完整的连接详细信息，以及在此连接字符串中指定用户名和密码的能力，请参见[这里](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)。

**重要:** 请注意，以上连接字符串同时启用了压缩（lz4）以及异步插入。我们建议始终启用两者。有关异步插入的更多详细信息，请参见[批处理](#batching)。应该始终指定压缩，并且在旧版本的导出器中默认情况下不会启用。

- **ttl** - 此值确定数据保留多长时间。更多详细信息见“管理数据”。此值应指定为小时的时间单位，例如 72h。我们在下面的示例中禁用 TTL，因为我们的数据来自 2019 年，并且如果插入将被 ClickHouse 立即删除。
- **traces_table_name** 和 **logs_table_name** - 决定日志和跟踪表的名称。
- **create_schema** - 决定启动时是否创建默认模式的表。默认情况下设置为 true 以便于入门。用户应将其设置为 false 并定义自己的架构。
- **database** - 目标数据库。
- **retry_on_failure** - 设置以确定是否应尝试失败的批次。
- **batch** - 批处理处理器确保事件以批处理形式发送。我们建议的值约为 5000，并超时为 5 秒。达到这两个值中的任何一个将触发批量刷新到导出器。降低这些值将意味着较低延迟的管道，数据可以更早获得查询，但会导致更多连接和批量发送到 ClickHouse。如果用户不使用[异步插入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，则不建议这样做，因为这可能会导致[分区片段过多](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts)的问题。相反，如果用户正在使用异步插入，则可用于查询的数据的可用性也将取决于异步插入设置——尽管数据将更早地从连接器刷新。有关更多详细信息，请参见[批处理](#batching)。
- **sending_queue** - 控制发送队列的大小。队列中的每个项目都包含一个批次。如果由于 ClickHouse 不可访问但事件仍在到达而超过此队列，批次将被丢弃。

假设用户已提取结构化日志文件并且有一个正在运行的[本地 ClickHouse 实例](/install)（使用默认身份验证），用户可以通过以下命令运行此配置：

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

要将跟踪数据发送到此收集器，请使用 `telemetrygen` 工具运行以下命令：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

一旦运行，通过简单查询确认日志事件是否存在：

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

默认情况下，ClickHouse 导出程序为日志和跟踪创建了目标日志表。这可以通过设置 `create_schema` 禁用。此外，日志表和跟踪表的名称可以通过上述设置从默认的 `otel_logs` 和 `otel_traces` 修改。

:::note
在下面的架构中，我们假设已启用 TTL，时间为 72小时。
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

这些列与 OTel 官方规范中记录的日志相对应，具体文档见 [这里](https://opentelemetry.io/docs/specs/otel/logs/data-model/)。

关于此架构的一些重要说明：

- 默认情况下，表按日期分区，使用 `PARTITION BY toDate(Timestamp)`。这使得删除过期数据更高效。
- TTL 设置为 `TTL toDateTime(Timestamp) + toIntervalDay(3)`，并对应于收集器配置中设置的值。 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 表示只有在所有包含的行过期时，整个部分才会被删除。这比在部分内删除行更高效，因为后者涉及高开销的删除。我们建议始终设置此项。有关更多细节，请参见 [使用 TTL 进行数据管理](/observability/managing-data#data-management-with-ttl-time-to-live)。
- 表使用经典的 [`MergeTree` 引擎](/engines/table-engines/mergetree-family/mergetree)。这对于日志和跟踪是推荐的，不应更改。
- 表按 `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` 排序。这意味着查询将针对 `ServiceName`、`SeverityText`、`Timestamp` 和 `TraceId` 上的过滤器进行优化 - 列表中前面的列过滤速度会比后面的列快，例如按 `ServiceName` 过滤的速度显著快于按 `TraceId` 过滤。用户应根据预期的访问模式修改此排序 - 请参见 [选择主键](/use-cases/observability/schema-design#choosing-a-primary-ordering-key)。
- 上述架构对列应用了 `ZSTD(1)`。这为日志提供了最佳的压缩。用户可以增加 ZSTD 压缩级别（高于默认的 1）以实现更好的压缩，尽管这通常没有好处。增加此值将在插入时（在压缩期间）导致更大的 CPU 开销，尽管解压缩（从而查询）应该保持可比较。有关更多详情，请参见 [这里](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。同时，对 `Timestamp` 应用了额外的 [增量编码](/sql-reference/statements/create/table#delta)，旨在减少其在磁盘上的大小。
- 注意 [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) 和 [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) 是映射。用户应该熟悉它们之间的区别。有关如何访问这些映射及优化访问键的方法，请参见 [使用映射](/use-cases/observability/schema-design#using-maps)。
- 这里的大多数其他类型，例如 `ServiceName` 作为 LowCardinality，都经过了优化。请注意，`Body` 在我们的示例日志中是 JSON，存储为字符串。
- 对映射的键和值以及 `Body` 列应用了布隆过滤器。这些旨在提高访问这些列的查询时间，但通常不是必需的。请参见 [二级/数据跳过索引](/use-cases/observability/schema-design#secondarydata-skipping-indices)。

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

同样，这将与记录在 [这里](https://opentelemetry.io/docs/specs/otel/trace/api/) 中的 OTel 官方规范对应的跟踪列相关联。这里的架构采用了与上述日志架构相同的许多设置，并且具有适用于跨度的附加链接列。

我们建议用户禁用自动架构创建并手动创建他们的表。这允许修改主键和次键，并提供了引入额外列以优化查询性能的机会。有关更多详细信息，请参见 [架构设计](/use-cases/observability/schema-design)。
## 优化插入 {#optimizing-inserts}

为了在获得强一致性保证的同时实现高插入性能，用户应在通过收集器将可观测性数据插入 ClickHouse 时遵循简单规则。正确配置 OTel 收集器后，遵循以下规则应简单明了。这还可以避免用户第一次使用 ClickHouse 时遇到的 [常见问题](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。
### 批处理 {#batching}

默认情况下，发送到 ClickHouse 的每个插入会导致 ClickHouse 立即创建一个包含来自插入的数据以及其他需要存储的元数据的存储部分。因此，发送较少的插入而每个插入包含更多的数据，相比于发送更多的插入而每个插入包含较少的数据，将减少所需的写入次数。我们建议每次插入相当大的批次，至少为 1,000 行。有关更多详细信息，请 [点击这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。

默认情况下，对 ClickHouse 的插入是同步的，如果相同则为幂等的。对于 MergeTree 引擎系列的表，ClickHouse 默认会自动 [去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。这意味着在以下情况下，插入是宽容的：

- (1) 如果接收数据的节点出现问题，插入查询将超时（或获取更具体的错误），且不会收到确认。
- (2) 如果数据已由节点写入，但由于网络中断无法将确认返回给查询的发送者，则发送者将收到超时或网络错误。

从收集器的角度来看，(1) 和 (2) 可能很难区分。然而，在这两种情况下，未确认的插入可以立即重试。只要重试的插入查询包含相同的数据且顺序相同，如果（未确认的）原始插入成功，ClickHouse 将会自动忽略重试的插入。

我们建议用户使用之前配置中显示的 [批处理器](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md) 满足以上要求。这确保插入以满足这些要求的一致批次的行发送。如果预计收集器将具有高吞吐量（每秒事件），并且每个插入可以发送至少 5000 个事件，这通常是管道中所需的唯一批处理。在这种情况下，收集器将在批处理器的 `timeout` 到达之前刷新批次，确保管道的端到端延迟保持较低，并且批次保持一致的大小。
### 使用异步插入 {#use-asynchronous-inserts}

通常，当收集器的吞吐量较低时，用户被迫发送较小的批次，但仍希望数据在最低的端到端延迟内到达 ClickHouse。在这种情况下，当批处理器的 `timeout` 到期时会发送小批次。这可能会导致问题，并且在需要异步插入时出现。这种情况通常发生在 **处于代理角色的收集器被配置为直接发送到 ClickHouse**。网关通过充当聚合器可以缓解此问题 - 请参见 [使用网关进行扩展](#scaling-with-gateways)。

如果不能保证大批次，用户可以通过使用 [异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) Delegating 到 ClickHouse 来进行批处理。使用异步插入，数据首先插入缓冲区，然后稍后或异步写入数据库存储。

<Image img={observability_6} alt="Async inserts" size="md"/>

开启 [异步插入](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) 时，当 ClickHouse ① 接收到插入查询时，查询的数据会首先 ② 立即写入一个内存缓冲区。当 ③ 下一个缓冲区刷新发生时，缓冲区的数据会 [排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 并作为一个部分写入数据库存储。注意，在刷新到数据库存储之前，数据不能通过查询搜索；缓冲区刷新是 [可配置的](/optimize/asynchronous-inserts)。

要为收集器启用异步插入，请在连接字符串中添加 `async_insert=1`。我们建议用户使用 `wait_for_async_insert=1`（默认值）以获得交付保证 - 详情请见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

异步插入的数据在 ClickHouse 缓存被刷新后插入。这发生在超过 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) 或自第一次 INSERT 查询以来经过 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 毫秒后。如果 `async_insert_stale_timeout_ms` 设置为非零值，则在上次查询以来的 `async_insert_stale_timeout_ms 毫秒` 后插入数据。用户可以调整这些设置以控制管道的端到端延迟。更多可用于调整缓冲区刷新的设置记录在 [这里](/operations/settings/settings#async_insert)。通常，默认设置是合适的。

:::note 考虑自适应异步插入
在低数量代理同时使用、吞吐量低而对端到端延迟要求严格的情况下，[自适应异步插入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) 可能会很有用。一般而言，这些不适用于高吞吐量的可观测性用例，如 ClickHouse 所示。
:::

最后，使用异步插入时，与 ClickHouse 的同步插入相关的之前的去重行为默认未启用。如有需要，请查看设置 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)。

有关配置此功能的完整信息，请见 [这里](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，并在 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 深入了解。
## 部署架构 {#deployment-architectures}

使用 OTel 收集器与 Clickhouse 时，可能有几种部署架构。我们将在下面描述每种架构以及其可能适用的情况。
### 仅代理 {#agents-only}

在仅代理的架构中，用户将 OTel 收集器部署为代理到边缘。这些代理接收来自本地应用程序（例如，作为边车容器）的跟踪，并从服务器和 Kubernetes 节点收集日志。在此模式下，代理将数据直接发送到 ClickHouse。

<Image img={observability_7} alt="Agents only" size="md"/>

此架构适合小型到中型的部署。其主要优点是它不需要额外的硬件，并且保持 ClickHouse 可观测性解决方案的总资源占用最小，应用程序与收集器之间的映射简单。

一旦代理数量超过几百，用户应该考虑迁移到基于网关的架构。此架构有几个缺点，使其难以扩展：

- **连接扩展** - 每个代理将与 ClickHouse 建立连接。虽然 ClickHouse 能够维持数百（如果不是数千个）并发插入连接，但这最终将成为限制因素，并使插入效率降低 - 也就是说，ClickHouse 维护连接所需的资源会更多。使用网关可以最小化连接数量并提高插入效率。
- **边缘处理** - 在此架构中，必须在边缘或 ClickHouse 中执行任何转换或事件处理。这不仅限制了代理的功能，还可能意味着复杂的 ClickHouse 物化视图或将大量计算推向边缘 - 在那里可能会影响关键服务且资源稀缺。
- **小批次和延迟** - 代理收集器可能单独收集的事件非常有限。这通常意味着它们需要配置为在设定的时间间隔内刷新以满足交付 SLA。这可能会导致收集器向 ClickHouse 发送小批次。虽然这是一个缺点，但可以通过异步插入来缓解 - 请参见 [优化插入](#optimizing-inserts)。
### 使用网关进行扩展 {#scaling-with-gateways}

OTel 收集器可以作为网关实例部署，以解决上述限制。这些提供独立服务，通常每个数据中心或每个区域。这些通过单个 OTLP 端点接收来自应用程序（或其他处于代理角色的收集器）的事件。通常会部署一组网关实例，并使用开箱即用的负载均衡器在它们之间分配负载。

<Image img={observability_8} alt="Scaling with gateways" size="md"/>

此架构的目标是将计算密集型处理卸载掉代理，从而最大限度地减少它们的资源使用。这些网关可以执行原本需要由代理完成的转换任务。此外，通过聚合来自多个代理的事件，网关可以确保将大批次发送到 ClickHouse - 实现高效插入。这些网关收集器可以随着添加更多代理和增加事件吞吐量而轻松扩展。下面显示的是一个示例网关配置，以及一个关联的代理配置，后者消耗示例结构化日志文件。注意使用 OTLP 作为代理和网关之间的通信。

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

这些配置可以使用以下命令运行。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

此架构的主要缺点是管理一组收集器的相关成本和开销。

有关管理较大基于网关的架构及相关学习的示例，我们推荐这篇 [博客文章](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)。
### 添加 Kafka {#adding-kafka}

读者可能会注意到上述架构没有使用 Kafka 作为消息队列。

使用 Kafka 阈列作为消息缓冲区是一种在日志架构中常见的设计模式，被 ELK 堆栈推广。它提供了几个好处；主要是，它有助于提供更强的消息交付保证，并有助于处理背压。消息从收集代理发送到 Kafka，然后写入磁盘。在理论上，集群 Kafka 实例应该提供高吞吐量的消息缓冲，因为将数据线性写入磁盘所需的计算开销小于解析和处理消息 - 例如，在 Elastic 中，标记化和索引会产生较大的开销。通过将数据从代理处移开，您还会减少由于源的日志轮换而丢失消息的风险。最后，它还提供了一些消息重放和跨区域复制功能，这可能对某些用例具有吸引力。

然而，ClickHouse 可以非常快速地处理数据插入 - 在中等硬件上可达每秒数百万行。ClickHouse 的背压是 **罕见的**。通常，利用 Kafka 阈列意味着增加架构复杂性和成本。如果您能够接受日志不需要与银行交易和其他关键数据相同的交付保证的原则，我们建议避免 Kafka 的复杂性。

但是，如果您需要高交付保证或重放数据的能力（潜在的多源），Kafka 可以成为一个有用的架构补充。

<Image img={observability_9} alt="Adding kafka" size="md"/>

在这种情况下，可以通过 [Kafka 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) 配置 OTel 代理将数据发送到 Kafka。网关实例转而使用 [Kafka 接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) 消费消息。对于更多详细信息，我们推荐 Confluent 和 OTel 文档。
### 资源估算 {#estimating-resources}

OTel 收集器的资源需求将取决于事件吞吐量、消息大小和执行的处理量。OpenTelemetry 项目维护了 [基准测试用户](https://opentelemetry.io/docs/collector/benchmarks/) 可用以估算资源需求。

[根据我们的经验](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)，具有 3 个核心和 12GB RAM 的网关实例可以处理大约每秒 60,000 个事件。这假设有一个负责重命名字段的最小处理管道，并且没有正则表达式。

对于负责将事件运输到网关的代理实例，仅需设置事件的时间戳，我们建议根据预期的每秒日志数量进行规模调整。以下数字代表用户可以作为起点使用的近似数字：

| 日志率        | 收集器代理所需的资源 |
|---------------|---------------------|
| 1k/秒        | 0.2 CPU, 0.2 GiB    |
| 5k/秒        | 0.5 CPU, 0.5 GiB    |
| 10k/秒       | 1 CPU, 1 GiB        |
