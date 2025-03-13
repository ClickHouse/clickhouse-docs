---
title: '集成 OpenTelemetry'
description: '将 OpenTelemetry 与 ClickHouse 集成以实现可观察性'
slug: '/observability/integrating-opentelemetry'
keywords: ['可观察性', '日志', '追踪', '指标', 'OpenTelemetry', 'Grafana', 'OTel']
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';

# 集成 OpenTelemetry 以进行数据收集

任何可观察性解决方案都需要一种收集和导出日志和追踪的方法。为此，ClickHouse 推荐 [OpenTelemetry (OTel) 项目](https://opentelemetry.io/)。

“OpenTelemetry 是一个可观察性框架和工具包，旨在创建和管理遥测数据，如追踪、指标和日志。”

与 ClickHouse 或 Prometheus 不同，OpenTelemetry 并不是一个可观察性后端，而是专注于遥测数据的生成、收集、管理和导出。OpenTelemetry 的初始目标是允许用户使用语言特定的 SDK 轻松地为他们的应用程序或系统进行工具化，但它已经扩展到通过 OpenTelemetry 收集器收集日志——这是一个接收、处理和导出遥测数据的代理或代理。

## 与 ClickHouse 相关的组件 {#clickhouse-relevant-components}

OpenTelemetry 由多个组件组成。除了提供数据和 API 规范、标准化协议和字段/列命名约定外，OTel 还提供两种构建 ClickHouse 可观察性解决方案所需的基本功能：

- [OpenTelemetry 收集器](https://opentelemetry.io/docs/collector/) 是一个代理，接收、处理和导出遥测数据。基于 ClickHouse 的解决方案使用此组件进行日志收集和事件处理，然后批量插入。
- [语言 SDK](https://opentelemetry.io/docs/languages/) 实现了规范、API 和遥测数据的导出。这些 SDK 确保在应用程序代码中正确记录追踪，生成组成跨度，并通过元数据确保上下文在服务之间传播，从而形成分布式追踪并确保跨度能够关联。这些 SDK 得到了一个生态系统的支持，该生态系统自动实现了常见库和框架，因此用户无需更改代码即可获得现成的工具化。

基于 ClickHouse 的可观察性解决方案可以利用这两个工具。
## 分发版 {#distributions}

OpenTelemetry 收集器有许多 [分发版](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)。文件日志接收器与 ClickHouse 导出器是基于 ClickHouse 解决方案所需的，仅在 [OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) 中存在。

此分发版包含许多组件，并允许用户尝试各种配置。但是，在生产环境中，建议限制收集器仅包含环境所需的组件。这样做的一些原因包括：

- 减小收集器的大小，从而缩短收集器的部署时间
- 通过减少可用攻击面提高收集器的安全性

构建 [自定义收集器](https://opentelemetry.io/docs/collector/custom-collector/) 可以使用 [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) 实现。
## 使用 OTel 导入数据 {#ingesting-data-with-otel}
### 收集器部署角色 {#collector-deployment-roles}

为了收集日志并将其插入到 ClickHouse 中，我们建议使用 OpenTelemetry 收集器。OpenTelemetry 收集器可以通过两种主要角色进行部署：

- **代理** - 代理实例在边缘收集数据，例如在服务器或 Kubernetes 节点上，或直接从使用 OpenTelemetry SDK 工具化的应用程序接收事件。在后者情况下，代理实例与应用程序一起运行，或者与应用程序在同一主机上运行（例如作为侧车或 DaemonSet）。代理可以直接将其数据发送到 ClickHouse 或发送到网关实例。在前一种情况下，这称为 [代理部署模式](https://opentelemetry.io/docs/collector/deployment/agent/)。
- **网关** - 网关实例提供独立服务（例如，在 Kubernetes 中的部署），通常按集群、数据中心或区域划分。这些通过单一 OTLP 端点接收来自应用程序（或其他作为代理的收集器）的事件。通常会部署一组网关实例，并使用现成的负载均衡器在它们之间分配负载。如果所有代理和应用程序都将信号发送到这个单一端点，通常称为 [网关部署模式](https://opentelemetry.io/docs/collector/deployment/gateway/)。

在下面的讨论中，我们假设一个简单的代理收集器，将事件直接发送到 ClickHouse。有关使用网关以及何时适用的更多详细信息，请参见 [使用网关进行扩展](#scaling-with-gateways)。
### 收集日志 {#collecting-logs}

使用收集器的主要优势在于，它允许您的服务快速卸载数据，而将额外处理（如重试、批量、加密或甚至敏感数据过滤）交给收集器。

收集器使用 [接收器](https://opentelemetry.io/docs/collector/configuration/#receivers)、[处理器](https://opentelemetry.io/docs/collector/configuration/#processors) 和 [导出器](https://opentelemetry.io/docs/collector/configuration/#exporters) 这三个主要处理阶段。接收器用于数据收集，可以是拉取或推送方式。处理器提供转换和消息丰富的能力。导出器负责将数据发送到下游服务。虽然理论上这个服务可以是另一个收集器，但在下面的初步讨论中，我们假设所有数据都直接发送到 ClickHouse。

<img src={observability_3}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

我们建议用户熟悉完整的接收器、处理器和导出器集合。

收集器提供了两个主要的接收器用于收集日志：

**通过 OTLP** - 在这种情况下，日志通过 OTLP 协议直接从 OpenTelemetry SDK 推送到收集器。[OpenTelemetry 演示](https://opentelemetry.io/docs/demo/)采用这种方法，每种语言的 OTLP 导出器假定使用本地收集器端点。在这种情况下，收集器必须配置为使用 OTLP 接收器 — 请参见上述 [演示的配置](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)。这种方法的优势在于日志数据将自动包含追踪 ID，允许用户稍后识别特定日志的追踪，反之亦然。

<img src={observability_4}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

这种方法要求用户使用适当的 [语言 SDK](https://opentelemetry.io/docs/languages/) 对其代码进行工具化。

- **通过 Filelog 接收器抓取** - 此接收器跟踪磁盘上的文件并生成日志消息，然后将其发送到 ClickHouse。此接收器处理复杂任务，例如检测多行消息、处理日志轮换、进行检查点以增强重启的鲁棒性，以及提取结构。该接收器还能够跟踪 Docker 和 Kubernetes 容器日志，可以作为 helm chart 部署， [从中提取结构](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) 并用 pod 详细信息丰富它们。

<img src={observability_5}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

**大多数部署将使用上述接收器的组合。我们建议用户阅读 [收集器文档](https://opentelemetry.io/docs/collector/) 并熟悉基本概念，以及 [配置结构](https://opentelemetry.io/docs/collector/configuration/) 和 [安装方法](https://opentelemetry.io/docs/collector/installation/)。**

:::note 提示: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) 是验证和可视化配置的有用工具。
:::
## 结构化与非结构化 {#structured-vs-unstructured}

日志可以是结构化的或非结构化的。

结构化日志将使用 JSON 等数据格式，定义诸如 http 代码和源 IP 地址等元数据字段。

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

非结构化日志虽然通常有一些通过正则表达式模式可提取的内在结构，但将日志纯粹表示为字符串。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

我们建议用户尽可能采用结构化日志，并以 JSON（即 ndjson）格式记录。这将简化稍后的日志处理，无论是在发送到 ClickHouse 之前与 [收集器处理器](https://opentelemetry.io/docs/collector/configuration/#processors) 进行处理，还是在插入时使用物化视图来处理。结构化日志最终将在后续处理资源中节省，用于减少 ClickHouse 解决方案所需的 CPU。
### 示例 {#example}

作为示例，我们提供一个结构化（JSON）和非结构化日志数据集，每个数据集大约有 1000 万行，链接如下：

- [非结构化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [结构化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

我们在下面的示例中使用结构化数据集。确保下载并解压此文件以重现以下示例。

以下是 OpenTelemetry 收集器的简单配置，读取这些磁盘上的文件，使用 filelog 接收器，并将结果消息输出到 stdout。我们使用 [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md) 操作符，因为我们的日志是结构化的。修改访问结构化日志文件的路径。

:::note 考虑使用 ClickHouse 进行解析
以下示例从日志中提取时间戳。这需要使用 `json_parser` 操作符，将整个日志行转换为 JSON 字符串，并将结果放置在 `LogAttributes` 中。这可能是计算密集型的，且 [在 ClickHouse 中可以更高效地完成](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。可以在此处找到一个等效的非结构化示例，使用 [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) 来实现这一点 [这里](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)。
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

用户可以按照 [官方说明](https://opentelemetry.io/docs/collector/installation/) 在本地安装收集器。重要的是，确保说明已修改为使用 [contrib 分发版](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)（它包含 `filelog` 接收器），例如用户应下载 `otelcol-contrib_0.102.1_darwin_arm64.tar.gz` 而不是 `otelcol_0.102.1_darwin_arm64.tar.gz`。可以在 [此处](https://github.com/open-telemetry/opentelemetry-collector-releases/releases) 找到版本。

安装完成后，可以使用以下命令运行 OTel 收集器：

```bash
./otelcol-contrib --config config-logs.yaml
```

假设使用结构化日志，输出的消息将呈现以下格式：

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

上述内容表示由 OTel 收集器生成的单个日志消息。我们将在后续部分将这些相同的消息导入到 ClickHouse 中。

日志消息的完整模式以及使用其他接收器时可能存在的其他列保留在 [这里](https://opentelemetry.io/docs/specs/otel/logs/data-model/)。**我们强烈建议用户熟悉此模式。**

关键在于日志行本身作为字符串保存在 `Body` 字段中，但由于使用了 `json_parser`，JSON 已自动提取到 Attributes 字段中。该 [操作符](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) 还用于提取时间戳到适当的 `Timestamp` 列。有关使用 OTel 处理日志的建议，请参见 [处理](#processing---filtering-transforming-and-enriching)。

:::note 操作符
操作符是可用的日志处理最基本单元。每个操作符执行单个职责，例如从文件中读取行或从字段中解析 JSON。将操作符链接在一起形成管道，以实现所需的结果。
:::

上述消息没有 `TraceID` 或 `SpanID` 字段。如果存在，例如在用户实现 [分布式追踪](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces) 的情况下，可以使用上面显示的相同技术从 JSON 中提取这些。

对于需要收集本地或 Kubernetes 日志文件的用户，我们建议熟悉 [filelog 接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration) 中可用的配置选项，以及如何处理 [偏移量](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) 和 [多行日志解析](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)。
## 收集 Kubernetes 日志 {#collecting-kubernetes-logs}

对于 Kubernetes 日志的收集，我们建议参考 [OpenTelemetry 文档指南](https://opentelemetry.io/docs/kubernetes/)。建议使用 [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) 为日志和指标赋予 pod 元数据。这可以生成动态元数据，例如存储在 `ResourceAttributes` 列中的标签。ClickHouse 目前使用类型 `Map(String, String)` 来表示此列。有关处理和优化此类型的更多详细信息，请参见 [使用映射](/use-cases/observability/schema-design#using-maps) 和 [从映射中提取](/use-cases/observability/schema-design#extracting-from-maps)。
## 收集追踪 {#collecting-traces}

对于希望对其代码进行工具化和收集追踪的用户，我们建议关注官方 [OTel 文档](https://opentelemetry.io/docs/languages/)。

为了将事件发送到 ClickHouse，用户需要部署一个 OTel 收集器，通过适当的接收器接收 OTLP 协议上的追踪事件。OpenTelemetry 演示提供了 [为每种支持语言进行工具化](https://opentelemetry.io/docs/demo/) 和将事件发送到收集器的示例。下面是将事件输出到 stdout 的适当收集器配置的示例：
### 示例 {#example-1}

由于追踪必须通过 OTLP 接收，因此我们使用 [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) 工具生成追踪数据。请遵循 [此处](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) 的说明进行安装。

以下配置在 OTLP 接收器上接收追踪事件，然后将其发送到 stdout。

[config-traces.xml](https://www.otelbin.io/#config=receivers%3A*N_otlp%3A*N___protocols%3A*N_____grpc%3A*N_______endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N__timeout%3A_1s*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N__traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Blogging%5D%7E)

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

通过 `telemetrygen` 向收集器发送追踪事件：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

这将导致如下示例的追踪消息输出到 stdout：

```response
Span #86
	Trace ID   	: 1bb5cdd2c9df5f0da320ca22045c60d9
	Parent ID  	: ce129e5c2dd51378
	ID         	: fbb14077b5e149a0
	Name       	: okey-dokey-0
	Kind       	: Server
	Start time 	: 2024-06-19 18:03:41.603868 +0000 UTC
	End time   	: 2024-06-19 18:03:41.603991 +0000 UTC
	Status code	: Unset
	Status message :
Attributes:
 	-> net.peer.ip: Str(1.2.3.4)
 	-> peer.service: Str(telemetrygen-client)
```

上述内容表示由 OTel 收集器生成的单个追踪消息。我们将在后续部分将这些相同的消息导入到 ClickHouse 中。

追踪消息的完整模式保留在 [这里](https://opentelemetry.io/docs/concepts/signals/traces/)。我们强烈建议用户熟悉此模式。
## 处理 - 过滤、转换和丰富 {#processing---filtering-transforming-and-enriching}

正如在设置日志事件时间戳的早期示例中所展示的，用户通常希望过滤、转换和丰富事件消息。这可以通过 OpenTelemetry 中的多种功能实现：

- **处理器** - 处理器获取收集到的 [接收器数据并修改或转换](https://opentelemetry.io/docs/collector/transforming-telemetry/)，然后将其发送到导出器。处理器按照在收集器配置的 `processors` 部分配置的顺序应用。这些是可选的，但通常建议的最小集是 [典型的](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。在将 OTel 收集器与 ClickHouse 一起使用时，我们建议将处理器限制为：

    - 使用 [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) 防止收集器出现内存溢出情况。有关建议，请参见 [估算资源](#estimating-resources)。
    - 任何基于上下文的丰富处理器。例如， [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) 允许自动设置跨度、指标和日志的资源属性，并附带 k8s 元数据，例如为事件赋予来源 pod id。
    - 如果需要进行追踪，则使用 [尾部或头部采样](https://opentelemetry.io/docs/concepts/sampling/)。
    - [基本过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 如果无法通过操作符（见下文）完成，则丢弃不需要的事件。
    - [批处理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - 在处理 ClickHouse 时至关重要，以确保数据以批量形式发送。请参阅 [“导出到 ClickHouse”](#exporting-to-clickhouse)。

- **操作符** - [操作符](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 提供了接收器可用的最基本处理单元。基本解析已得到支持，允许设置诸如严重性和时间戳等字段。此处支持 JSON 和正则表达式解析以及事件过滤和基本转换。我们建议在这里进行事件过滤。

我们建议用户避免使用操作符或 [转换处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) 进行过多的事件处理。这可能会产生可观的内存和 CPU 开销，特别是 JSON 解析。可以在插入时与物化视图在 ClickHouse 中完成所有处理，尽管有一些例外，特别是上下文感知的丰富，例如添加 k8s 元数据。有关更多详细信息，请参见 [使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。

如果使用 OTel 收集器进行处理，我们建议在网关实例上进行转换，并尽量减少在代理实例上的工作。这将确保在边缘运行的代理所需的资源尽可能少。通常，我们发现用户只进行过滤（以减少不必要的网络使用）、时间戳设置（通过操作符）和需要上下文的丰富。例如，如果网关实例位于不同的 Kubernetes 集群中，则需要在代理中进行 k8s 丰富。
### 示例 {#example-2}

以下配置显示了如何收集非结构化日志文件。请注意，使用操作符从日志行中提取结构（`regex_parser`）并过滤事件，以及使用处理器来批量事件并限制内存使用。

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

导出器将数据发送到一个或多个后端或目的地。导出器可以基于拉取或推送。为了将事件发送到 ClickHouse，用户需要使用基于推送的 [ClickHouse 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)。

:::note 使用 OpenTelemetry Collector Contrib
ClickHouse 导出器是 [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main) 的一部分，而不是核心分发版。用户可以使用贡献分发版或 [构建自己的收集器](https://opentelemetry.io/docs/collector/custom-collector/)。
:::

下面显示了完整的配置文件。

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

注意以下关键设置：

- **pipelines** - 上述配置强调使用 [管道](https://opentelemetry.io/docs/collector/configuration/#pipelines)，由一组接收器、处理器和导出器组成，有用于日志和跟踪的管道。 
- **endpoint** - 与 ClickHouse 的通信通过 `endpoint` 参数配置。连接字符串 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` 会通过 TCP 进行通信。如果用户出于流量切换原因更喜欢使用 HTTP，还需按 [此处](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options) 所述修改此连接字符串。完整的连接详细信息，包括在此连接字符串中指定用户名和密码的能力，请参见 [此处](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)。

**重要：** 请注意，以上连接字符串可以启用压缩（lz4）以及异步插入。我们建议始终启用这两个选项。有关异步插入的进一步详细信息，请参见 [批处理](#batching)。对于较旧版本的导出器，压缩通常不会默认启用，必须始终指定。

- **ttl** - 这里的值决定数据保留的时间。更多详细信息请参见“管理数据”。这应指定为以小时为单位的时间单位，例如 72h。我们在下面的示例中禁用 TTL，因为我们的数据来自 2019 年，如果插入将被 ClickHouse 立即删除。 
- **traces_table_name** 和 **logs_table_name** - 确定日志和跟踪表的名称。
- **create_schema** - 确定是否在启动时使用默认模式创建表。默认为 true，适合入门。用户应将其设置为 false，并定义自己的模式。
- **database** - 目标数据库。
- **retry_on_failure** - 决定是否应重试失败批次的设置。 
- **batch** - 批处理器确保事件以批次形式发送。我们建议每次插入约 5000 行，并设定超时为 5s。这两个条件中第一个达到时将触发批次刷新以发送到导出器。降低这些值将意味着延迟更低的管道，使数据更早可供查询，但会增加发送到 ClickHouse 的连接和批次数量。这在用户未使用[异步插入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)的情况下不推荐使用，因为这可能会导致 ClickHouse 中的 [过多部分](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) 问题。相反，如果用户使用异步插入，则数据的可用性也将依赖于异步插入设置 - 尽管数据仍将更早从连接器刷新。有关更多详细信息，请参见 [批处理](#batching)。

- **sending_queue** - 控制发送队列的大小。队列中的每个项目都包含一个批次。如果此队列超出，例如由于 ClickHouse 无法访问但事件继续到达，批次将被丢弃。 

假设用户已提取结构化日志文件并运行 [本地 ClickHouse 实例](/install)（使用默认身份验证），用户可以通过以下命令运行此配置：

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

要将跟踪数据发送到此收集器，请使用 `telemetrygen` 工具运行以下命令：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

启动后，使用简单的查询确认日志事件存在：

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:      	2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags:     	0
SeverityText:
SeverityNumber: 	0
ServiceName:
Body:           	{"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes:	{}
LogAttributes:  	{'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.


同样地，针对跟踪事件，用户可以检查 `otel_traces` 表：

```sql
SELECT *
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:      	2024-06-20 11:36:41.181398000
TraceId:        	00bba81fbd38a242ebb0c81a8ab85d8f
SpanId:         	beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName:       	lets-go
SpanKind:       	SPAN_KIND_CLIENT
ServiceName:    	telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName:      	telemetrygen
ScopeVersion:
SpanAttributes: 	{'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration:       	123000
StatusCode:     	STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp:   []
Events.Name:    	[]
Events.Attributes:  []
Links.TraceId:  	[]
Links.SpanId:   	[]
Links.TraceState:   []
Links.Attributes:   []
```
## 开箱即用的模式 {#out-of-the-box-schema}

默认情况下，ClickHouse 导出器为日志和跟踪创建目标日志表。可以通过设置 `create_schema` 来禁用此功能。此外，可以通过上述设置修改日志表和跟踪表的名称，默认为 `otel_logs` 和 `otel_traces`。

:::note 
在下面的模式中，我们假设 TTL 已启用为 72h。
:::

以下是日志的默认模式（`otelcol-contrib v0.102.1`）：

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
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

这里的列与 OTel 官方文档中定义的日志规范相关联，详细见 [这里](https://opentelemetry.io/docs/specs/otel/logs/data-model/)。

关于此模式的一些重要说明：

- 默认情况下，表按日期分区，通过 `PARTITION BY toDate(Timestamp)`。这使得删除过期数据更有效率。
- TTL 设置为 `TTL toDateTime(Timestamp) + toIntervalDay(3)`，对应于收集器配置中设置的值。[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 意味着仅当所有包含的行都过期时，才会删除整个分区的部分。这样做比在分区内删除行更高效，后者会导致高开销的删除。我们建议总是设置这个选项。有关 TTL 的更多细节，请参见 [使用 TTL 管理数据](/observability/managing-data#data-management-with-ttl-time-to-live)。
- 表使用经典的 [`MergeTree` 引擎](/engines/table-engines/mergetree-family/mergetree)。这对于日志和跟踪是推荐的，不需要更改。
- 表按 `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` 排序。这意味着查询将针对 `ServiceName`、`SeverityText`、`Timestamp` 和 `TraceId` 的过滤进行优化 - 列表中较早的列过滤更快，例如，按 `ServiceName` 过滤将比按 `TraceId` 过滤显著更快。用户应根据预期的访问模式修改此顺序 - 请参见 [选择主键](/use-cases/observability/schema-design#choosing-a-primary-ordering-key)。
- 以上模式在列上应用了 `ZSTD(1)` 压缩。这为日志提供了最佳压缩。用户可以增加 ZSTD 压缩级别（超过默认的 1）以获得更好的压缩，尽管这通常没有太大好处。增加此值将导致在插入时（压缩期间）更大的 CPU 开销，尽管解压缩（以及查询）应保持相当可比。有关更多详细信息，请参见 [这里](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。额外的 [增量编码](/sql-reference/statements/create/table#delta) 应用于时间戳，旨在减少其在磁盘上的大小。
- 请注意，[`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) 和 [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) 是映射类型。用户应熟悉它们之间的差异。有关如何访问这些映射并优化访问其键的方法，请参见 [使用映射](/use-cases/observability/integrating-opentelemetry.md)。
- 此外其他类型，例如将 `ServiceName` 作为 LowCardinality 进行了优化。请注意，尽管我们示例日志中的 Body 是 JSON，但它以字符串形式存储。
- 对映射的键和值以及 Body 列应用了布隆过滤器。这些旨在改善访问这些列的查询时间，但通常不是必需的。请参见 [二次/数据跳过索引](/use-cases/observability/schema-design#secondarydata-skipping-indices)。

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
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

同样，这将与 OTel 官方文档中记录的跟踪规范相对应，详见 [这里](https://opentelemetry.io/docs/specs/otel/trace/api/)。此模式使用了与上述日志模式相同的许多设置，增加了特定于跨度的链接列。

我们建议用户禁用自动模式创建并手动创建表。这允许修改主键和二级键，并有机会引入用于优化查询性能的额外列。有关进一步详情，请参见 [模式设计](/use-cases/observability/schema-design)。
## 优化插入 {#optimizing-inserts}

为了在通过收集器将可观察性数据插入 ClickHouse 时实现高插入性能，同时获得强一致性保证，用户应遵循一些简单规则。通过正确配置 OTel 收集器，遵循以下规则应该是轻而易举的。这也避免了用户在首次使用 ClickHouse 时遇到的 [常见问题](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。

### 批处理 {#batching}

默认情况下，发送到 ClickHouse 的每个插入会立即导致 ClickHouse 创建一个存储部分，包含来自插入的数据以及其他需要存储的元数据。因此，相比发送较多每个包含较少数据的插入，发送较少每个包含更多数据的插入将减少所需的写入次数。我们建议以至少 1000 行的较大批次插入数据。进一步细节请见 [此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。

默认情况下，插入到 ClickHouse 是同步的，并且在相同的情况下是幂等的。对于合并树引擎类型的表，ClickHouse 默认会自动 [去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。这意味着在以下情况中，插入是可以容忍的：

- (1) 如果接收数据的节点出现故障，插入查询将超时（或产生更具体的错误），并且不会接收确认。
- (2) 如果数据被节点写入，但由于网络中断无法将确认返回给查询的发送方，发送方将接收到超时或网络错误。

从收集器的角度来看，（1）和（2）可能难以区分。然而，在这两种情况下，未被确认的插入可以立即重试。只要重试的插入查询包含相同顺序的相同数据，如果（未确认的）原始插入成功，ClickHouse 将自动忽略重试的插入。

我们建议用户使用早期配置中展示的 [批处理器](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)，以满足上述要求。这确保插入以一致的行批次形式发送，满足上述要求。如果收集器预计具有高吞吐量（每秒事件），并且每个插入可以发送至少 5000 个事件，通常这就是管道中唯一需要的批处理。在这种情况下，收集器将在批处理器的 `timeout` 达到之前刷新批次，从而确保管道的端到端延迟保持低，并且批次大小一致。

### 使用异步插入 {#use-asynchronous-inserts}

通常，当收集器的吞吐量较低时，用户被迫发送较小的批次，而他们仍希望数据在最小端到端延迟内到达 ClickHouse。在这种情况下，会在批处理器的 `timeout` 超时后发送小批次。这可能会导致问题，这时需要使用异步插入。此情况通常在 **以代理角色配置直接发送到 ClickHouse 的收集器** 时出现。通过作为聚合器的网关可以缓解这个问题 - 请参见 [与网关扩展](#scaling-with-gateways)。

如果无法保证大批次，用户可以使用 [异步插入](/cloud/bestpractices/asynchronous-inserts) 将批处理委托给 ClickHouse。使用异步插入，数据首先插入到缓冲区，然后再异步地写入数据库存储。

<img src={observability_6}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

对于 [启用的异步插入](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，当 ClickHouse ① 接收到插入查询时，查询的数据会 ② 立即写入一个内存中的缓冲区。当 ③ 下一个缓冲区刷新时，缓冲区中的数据会 [排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 并被写入数据库存储作为一个部分。请注意，在刷新到数据库存储之前，数据无法通过查询进行搜索；缓冲区刷新是 [可配置的](/optimize/asynchronous-inserts)。

要为收集器启用异步插入，请在连接字符串中添加 `async_insert=1`。我们建议用户使用 `wait_for_async_insert=1`（默认值），以获得交付保证 - 有关更多详细信息，请参见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

在 ClickHouse 缓冲区刷新后，异步插入的数据将被插入。这发生在超出 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) 的情况下，或者在第一次 INSERT 查询后经过 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 毫秒之后。如果将 `async_insert_stale_timeout_ms` 设置为非零值，则数据将在自上次查询后的 `async_insert_stale_timeout_ms` 毫秒后插入。用户可以调优这些设置以控制管道的端到端延迟。有关调优缓冲区刷新的更多设置，请参见 [此处](/operations/settings/settings#async_insert)。通常，默认值是合适的。

:::note 考虑自适应异步插入
在使用较少代理且吞吐量低但有严格端到端延迟要求的情况下，[自适应异步插入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) 可能有用。一般来说，这不适用于具有高吞吐量的可观察性用例，如 ClickHouse。
:::

最后，使用异步插入时，与同步插入相关的先前去重行为默认情况下未启用。如果需要，请参见设置 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)。

有关配置此功能的完整详细信息，请参见 [此处](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，深入探讨请见 [此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。
## 部署架构 {#deployment-architectures}

在使用 OTel 收集器与 ClickHouse 时，可以采用几种部署架构。我们在下面描述每种架构及其可能的适用性。
### 仅代理 {#agents-only}

在仅代理的架构中，用户将 OTel 收集器部署为边缘代理。这些代理接收来自本地应用程序的跟踪（例如，作为边车容器）并收集来自服务器和 Kubernetes 节点的日志。在此模式下，代理将其数据直接发送到 ClickHouse。

<img src={observability_7}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

这种架构适合小型到中型的部署。其主要优点是它不需要额外的硬件，并将 ClickHouse 可观察性解决方案的总资源占用保持在最低限度，应用程序和收集器之间有简单的映射。

一旦代理数量超过几百个，用户应考虑迁移到基于网关的架构。这种架构有几个缺点，使其难以扩展：

- **连接扩展** - 每个代理将与 ClickHouse 建立连接。尽管 ClickHouse 能够维持数百（甚至数千）个并发插入连接，但这最终会成为限制因素，使插入效率降低 - 即，ClickHouse 保持连接将使用更多资源。使用网关可以最小化连接数量，并使插入更高效。
- **边缘处理** - 在这种架构中，任何转换或事件处理都必须在边缘或 ClickHouse 中进行。除了限制外，这还可能意味着复杂的 ClickHouse 物化视图或将大量计算推送到边缘 - 在这里关键服务可能受到影响，资源稀缺。
- **小批次和延迟** - 代理收集器可能单独收集非常少的事件。这通常意味着它们需要配置为在设定间隔内刷新，以满足交付服务级别协议（SLA）。这可能导致收集器向 ClickHouse 发送小批次。尽管这是一个缺点，但可以通过异步插入来缓解 - 请参见 [优化插入](#optimizing-inserts)。
### 使用网关进行扩展 {#scaling-with-gateways}

OTel 收集器可以作为网关实例进行部署，以解决上述限制。这些实例提供独立的服务，通常按数据中心或地区划分。它们通过单个 OTLP 端点接收来自应用程序（或其他作为代理角色的收集器）的事件。通常会部署一组网关实例，并使用开箱即用的负载均衡器在它们之间分配负载。

<img src={observability_8}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

该架构的目标是将计算密集型处理从代理中卸载，从而最小化它们的资源使用。这些网关可以执行原本需要由代理完成的转换任务。此外，通过聚合来自多个代理的事件，网关可以确保大批量数据被发送到 ClickHouse - 允许高效插入。这些网关收集器可以随着更多代理的增加和事件处理吞吐量的增加而轻松扩展。下面是一个示例网关配置，及其关联的代理配置，该配置消耗示例结构化日志文件。请注意，代理与网关之间的通信使用 OTLP。

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
      insecure: true # 如果您正在使用安全连接，请设置为 false
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 修改为在同一主机上运行的两个收集器
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

这种架构的主要缺点是管理一组收集器的相关成本和开销。

有关管理更大以网关为基础架构的示例及相关学习，我们推荐这篇 [博客文章](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)。
### 添加 Kafka {#adding-kafka}

读者可能会注意到上述架构没有使用 Kafka 作为消息队列。

将 Kafka 队列用作消息缓冲区是日志架构中常见的设计模式，并由 ELK 堆栈推广。它提供了几个好处；主要是，它有助于提供更强的消息传递保证，帮助处理背压。消息从收集代理发送至 Kafka 并写入磁盘。理论上，集群化的 Kafka 实例应该提供高吞吐量的消息缓冲，因为将数据线性写入磁盘所需的计算开销小于解析和处理消息的开销 - 例如，在 Elastic 中，标记化和索引会产生显著的开销。通过将数据从代理中移出，您还会减少因源处日志轮换而导致丢失消息的风险。最后，它提供一些消息回复和跨区域复制能力，这对某些用例可能具有吸引力。

然而，ClickHouse 可以非常快速地处理数据插入 - 在中等硬件上每秒数百万行。ClickHouse 的背压是 **罕见** 的。通常，利用 Kafka 队列会增加架构的复杂性和成本。如果您可以接受日志不需要与银行交易和其他关键数据相同的交付保证的原则，我们建议避免 Kafka 的复杂性。

然而，如果您需要高的交付保证或重放数据的能力（潜在地重放到多个源），Kafka 可以是一个有用的架构补充。

<img src={observability_9}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

在这种情况下，OTel 代理可以配置为通过 [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) 发送数据到 Kafka。网关实例则使用 [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) 消费消息。我们推荐查阅 Confluent 和 OTel 文档以获取更多详细信息。
### 估算资源 {#estimating-resources}

OTel 收集器的资源需求将取决于事件的吞吐量、消息的大小和执行的处理量。OpenTelemetry 项目维护着 [基准测试用户](https://opentelemetry.io/docs/collector/benchmarks/)，可以用来估算资源需求。

[根据我们的经验](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)，具有 3 个核心和 12GB RAM 的网关实例能够处理大约每秒 60,000 个事件。这假设使用的是负责重命名字段的最小处理管道，并且没有正则表达式。

对于负责将事件发送到网关的代理实例，并且仅设置事件的时间戳，我们建议用户根据预计的每秒日志数量进行资源大小估算。以下是用户可作为起点的近似数字：

日志记录速率
收集器代理资源	
1k/秒
0.2CPU, 0.2GiB	
5k/秒
0.5 CPU, 0.5GiB	
10k/秒
1 CPU, 1GiB	

| 日志记录速率 | 收集器代理资源 |
|--------------|------------------------------|
| 1k/秒    | 0.2CPU, 0.2GiB              |
| 5k/秒    | 0.5 CPU, 0.5GiB             |
| 10k/秒   | 1 CPU, 1GiB                 |
