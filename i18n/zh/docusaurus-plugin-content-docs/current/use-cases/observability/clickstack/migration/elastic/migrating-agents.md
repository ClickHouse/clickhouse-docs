---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-agents'
'title': '从 Elastic 迁移代理'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '迁移代理'
'sidebar_position': 5
'description': '从 Elastic 迁移代理'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import add_logstash_output from '@site/static/images/use-cases/observability/add-logstash-output.png';
import agent_output_settings from '@site/static/images/use-cases/observability/agent-output-settings.png';
import migrating_agents from '@site/static/images/use-cases/observability/clickstack-migrating-agents.png';

## 从 Elastic 迁移代理 {#migrating-agents-from-elastic}

Elastic Stack 提供多种可观察性数据收集代理。具体包括：

- [Beats 家族](https://www.elastic.co/beats) - 如 [Filebeat](https://www.elastic.co/beats/filebeat)、[Metricbeat](https://www.elastic.co/beats/metricbeat) 和 [Packetbeat](https://www.elastic.co/beats/packetbeat) - 所有这些均基于 `libbeat` 库。此类 Beats 支持通过 Lumberjack 协议 [将数据发送到 Elasticsearch、Kafka、Redis 或 Logstash](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output)。
- [`Elastic Agent`](https://www.elastic.co/elastic-agent) 提供一个统一的代理，能够收集日志、指标和跟踪信息。此代理可通过 [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet) 进行集中管理，并支持输出到 Elasticsearch、Logstash、Kafka 或 Redis。
- Elastic 还提供了 [OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry) 的发行版本。虽然目前无法通过 Fleet Server 进行编排，但它为迁移到 ClickStack 的用户提供了更灵活和开放的路径。

最佳的迁移路径取决于当前使用的代理。在接下来的部分中，我们将记录每种主要代理类型的迁移选项。我们的目标是在可能的情况下，最小化摩擦，并允许用户在过渡期间继续使用他们现有的代理。

## 首选迁移路径 {#prefered-migration-path}

在可能的情况下，我们建议将所有日志、指标和跟踪收集迁移到 [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/)，并在 [边缘以代理角色](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 部署收集器。这代表了发送数据的最有效方式，避免了架构复杂性和数据转换。

:::note 为什么选择 OpenTelemetry Collector?
OpenTelemetry Collector 提供了一种可持续且不依赖于供应商的可观察性数据摄取解决方案。我们认识到，一些组织操作的 Elastic 代理数量达到数千甚至上万。对于这些用户，保持与现有代理基础设施的兼容性可能至关重要。本文件旨在支持这一点，同时帮助团队逐步过渡到基于 OpenTelemetry 的收集。
:::

## ClickHouse OpenTelemetry 端点 {#clickhouse-otel-endpoint}

所有数据通过 **OpenTelemetry (OTel) collector** 实例摄取到 ClickStack，这作为日志、指标、跟踪和会话数据的主要入口点。我们推荐使用官方的 [ClickStack 发行版](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector) 来部署此实例，如果该发行版尚未 [已捆绑在你的 ClickStack 部署模型中](/use-cases/observability/clickstack/deployment)。

用户可以通过 [语言 SDKs](/use-cases/observability/clickstack/sdks) 或通过收集基础设施指标和日志的数据收集代理（如在 [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 角色下的 OTel collectors 或其他技术，例如 [Fluentd](https://www.fluentd.org/) 或 [Vector](https://vector.dev/)）向该收集器发送数据。

**我们假设该收集器可用于所有代理迁移步骤**。

## 从 beats 迁移 {#migrating-to-beats}

具有广泛 Beats 部署的用户在迁移到 ClickStack 时可能希望保留这些部署。

**目前此选项仅在 Filebeat 上进行了测试，因此仅适用于日志。**

Beats 代理使用 [Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs)，该架构目前正在与 ClickStack 使用的 [OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md) 规范合并。然而，这些 [架构仍然存在显著差异](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview)，用户目前需要在数据摄取到 ClickStack 之前将 ECS 格式事件转换为 OpenTelemetry 格式。

我们建议使用 [Vector](https://vector.dev) 执行此转换，Vector 是一个轻量级且高性能的可观察性数据管道，支持名为 Vector Remap Language (VRL) 的强大转换语言。

如果你的 Filebeat 代理配置为将数据发送到 Kafka - Beats 支持的输出 - Vector 可以从 Kafka 中消耗这些事件，使用 VRL 应用架构转换，然后通过 OTLP 将其转发到与 ClickStack 一起分发的 OpenTelemetry Collector。

另外，Vector 还支持通过 Logstash 使用的 Lumberjack 协议接收事件。这使得 Beats 代理可以直接将数据发送到 Vector，在这里可以在转发到 ClickStack OpenTelemetry Collector 之前应用相同的转换处理。

以下是这两种架构的示意图。

<Image img={migrating_agents} alt="Migrating agents" size="lg" background/>

在以下示例中，我们提供配置 Vector 以通过 Lumberjack 协议接收 Filebeat 日志事件的初始步骤。我们提供 VRL 用于将传入的 ECS 事件映射到 OTel 规范，然后通过 OTLP 将这些事件发送到 ClickStack OpenTelemetry collector。通过 Kafka 消费事件的用户可以将 Vector Logstash 源替换为 [Kafka 源](https://vector.dev/docs/reference/configuration/sources/kafka/) - 其他所有步骤保持不变。

<VerticalStepper headerLevel="h3">

### 安装 vector {#install-vector}

使用 [官方安装指南](https://vector.dev/docs/setup/installation/) 安装 Vector。

这可以安装在与 Elastic Stack OTel collector 相同的实例上。

用户在 [将 Vector 投入生产](https://vector.dev/docs/setup/going-to-prod/) 时，可以遵循架构和安全方面的最佳实践。

### 配置 vector {#configure-vector}

Vector 应配置为通过 Lumberjack 协议接收事件，模仿 Logstash 实例。这可以通过为 Vector 配置 [`logstash` 源](https://vector.dev/docs/reference/configuration/sources/logstash/) 来实现：

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: false  # Set to true if you're using TLS
      # The files below are generated from the steps at https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
      # crt_file: logstash.crt
      # key_file: logstash.key
      # ca_file: ca.crt
      # verify_certificate: true
```

:::note TLS 配置
如果需要双向 TLS，请使用 Elastic 指南 ["为 Logstash 输出配置 SSL/TLS"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output) 生成证书和密钥。这些可以在配置中指定，如上所示。
:::

事件将以 ECS 格式接收。这些可以使用 Vector Remap Language (VRL) 转换器转换为 OpenTelemetry 架构。该转换器的配置非常简单，脚本文件保存在单独文件中：

```yaml
transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: 'beat_to_otel.vrl'
```

请注意，它接收来自上述 `beats` 源的事件。我们的重映射脚本如下所示。该脚本仅在日志事件上进行了测试，但可以作为其他格式的基础。

<details>
<summary>VRL - ECS 转 OTel</summary>

```javascript

# Define keys to ignore at root level
ignored_keys = ["@metadata"]


# Define resource key prefixes
resource_keys = ["host", "cloud", "agent", "service"]


# Create separate objects for resource and log record fields
resource_obj = {}
log_record_obj = {}


# Copy all non-ignored root keys to appropriate objects
root_keys = keys(.)
for_each(root_keys) -> |_index, key| {
    if !includes(ignored_keys, key) {
        val, err = get(., [key])
        if err == null {
            # Check if this is a resource field
            is_resource = false
            if includes(resource_keys, key) {
                is_resource = true
            }

            # Add to appropriate object
            if is_resource {
                resource_obj = set(resource_obj, [key], val) ?? resource_obj
            } else {
                log_record_obj = set(log_record_obj, [key], val) ?? log_record_obj
            }
        }
    }
}


# Flatten both objects separately
flattened_resources = flatten(resource_obj, separator: ".")
flattened_logs = flatten(log_record_obj, separator: ".")


# Process resource attributes
resource_attributes = []
resource_keys_list = keys(flattened_resources)
for_each(resource_keys_list) -> |_index, field_key| {
    field_value, err = get(flattened_resources, [field_key])
    if err == null && field_value != null {
        attribute, err = {
            "key": field_key,
            "value": {
                "stringValue": to_string(field_value)
            }
        }
        if (err == null) {
            resource_attributes = push(resource_attributes, attribute)
        }
    }
}


# Process log record attributes
log_attributes = []
log_keys_list = keys(flattened_logs)
for_each(log_keys_list) -> |_index, field_key| {
    field_value, err = get(flattened_logs, [field_key])
    if err == null && field_value != null {
        attribute, err = {
            "key": field_key,
            "value": {
                "stringValue": to_string(field_value)
            }
        }
        if (err == null) {
            log_attributes = push(log_attributes, attribute)
        }
    }
}


# Get timestamp for timeUnixNano (convert to nanoseconds)
timestamp_nano = if exists(.@timestamp) {
    to_unix_timestamp!(parse_timestamp!(.@timestamp, format: "%Y-%m-%dT%H:%M:%S%.3fZ"), unit: "nanoseconds")
} else {
    to_unix_timestamp(now(), unit: "nanoseconds")
}


# Get message/body field
body_value = if exists(.message) {
    to_string!(.message)
} else if exists(.body) {
    to_string!(.body)
} else {
    ""
}


# Create the OpenTelemetry structure
. = {
    "resourceLogs": [
        {
            "resource": {
                "attributes": resource_attributes
            },
            "scopeLogs": [
                {
                    "scope": {},
                    "logRecords": [
                        {
                            "timeUnixNano": to_string(timestamp_nano),
                            "severityNumber": 9,
                            "severityText": "info",
                            "body": {
                                "stringValue": body_value
                            },
                            "attributes": log_attributes
                        }
                    ]
                }
            ]
        }
    ]
}
```

</details>

最后，经过转换的事件可以通过 OpenTelemetry collector 通过 OTLP 发送到 ClickStack。这需要在 Vector 中配置 OTLP 接收器，该接收器从 `remap_filebeat` 转换中获取事件作为输入：

```yaml
sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat] # receives events from a remap transform - see below
    protocol:
      type: http  # Use "grpc" for port 4317
      uri: http://localhost:4318/v1/logs # logs endpoint for the OTel collector 
      method: post
      encoding:
        codec: json
      framing:
        method: newline_delimited
      headers:
        content-type: application/json
        authorization: ${YOUR_INGESTION_API_KEY}
```

这里的 `YOUR_INGESTION_API_KEY` 是由 ClickStack 生成的。您可以在 HyperDX 应用程序的 `Team Settings → API Keys` 中找到该密钥。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

我们的最终完整配置如下所示：

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: false  # Set to true if you're using TLS
        #crt_file: /data/elasticsearch-9.0.1/logstash/logstash.crt
        #key_file: /data/elasticsearch-9.0.1/logstash/logstash.key
        #ca_file: /data/elasticsearch-9.0.1/ca/ca.crt
        #verify_certificate: true

transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: 'beat_to_otel.vrl'

sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat]
    protocol:
      type: http  # Use "grpc" for port 4317
      uri: http://localhost:4318/v1/logs
      method: post
      encoding:
        codec: json
      framing:
        method: newline_delimited
      headers:
        content-type: application/json
```

### 配置 Filebeat {#configure-filebeat}

现有的 Filebeat 安装只需要修改以将其事件发送到 Vector。这需要配置一个 Logstash 输出 - 再次可以选择配置 TLS：

```yaml

# ------------------------------ Logstash Output -------------------------------
output.logstash:
  # The Logstash hosts
  hosts: ["localhost:5044"]

  # Optional SSL. By default is off.
  # List of root certificates for HTTPS server verifications
  #ssl.certificate_authorities: ["/etc/pki/root/ca.pem"]

  # Certificate for SSL client authentication
  #ssl.certificate: "/etc/pki/client/cert.pem"

  # Client Certificate Key
  #ssl.key: "/etc/pki/client/cert.key"
```

</VerticalStepper>

## 从 Elastic Agent 迁移 {#migrating-from-elastic-agent}

Elastic Agent 将不同的 Elastic Beats 整合到一个软件包中。该代理与 [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server) 集成，允许其进行集中编排和配置。

已经部署 Elastic Agents 的用户有几种迁移路径：

- 配置代理通过 Lumberjack 协议发送到 Vector 端点。**目前此选项仅对收集日志数据的 Elastic Agent 进行了测试。** 跨 Fleet UI 在 Kibana 中可以进行集中配置。
- [以 Elastic OpenTelemetry Collector (EDOT) 运行代理](https://www.elastic.co/docs/reference/fleet/otel-agent)。Elastic Agent 包括一个嵌入的 EDOT Collector，允许你对应用程序和基础设施进行一次性编码，并将数据发送到多个供应商和后端。在此配置中，用户只需配置 EDOT collector 通过 OTLP 将事件转发到 ClickStack OTel collector。**这种方法支持所有事件类型。**

我们在下面演示这两个选项。

### 通过 Vector 发送数据 {#sending-data-via-vector}

<VerticalStepper headerLevel="h4">

#### 安装和配置 Vector {#install-configure-vector}

使用 [迁移 Filebeat 的相同步骤](#install-vector) 安装和配置 Vector。

#### 配置 Elastic Agent {#configure-elastic-agent}

Elastic Agent 需要配置为通过 Logstash 协议 Lumberjack 发送数据。这是一种 [受支持的部署模式](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge)，可以通过 Fleet 或 [通过代理配置文件 `elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output) 配置（如果不通过 Fleet 部署）。

可以通过在 Kibana 中添加 [Output 到 Fleet](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings) 来实现中央配置。

<Image img={add_logstash_output} alt="Add Logstash output" size="md"/>

此输出可以在 [代理策略](https://www.elastic.co/docs/reference/fleet/agent-policy) 中使用。这将自动意味着任何使用该策略的代理都将其数据发送到 Vector。

<Image img={agent_output_settings} alt="Agent settings" size="md"/>

由于这需要在 TLS 上配置安全通信，我们建议遵循指南 ["为 Logstash 输出配置 SSL/TLS"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)，用户可以假设其 Vector 实例充当 Logstash。

请注意，这要求用户在 Vector 中也配置 Logstash 源以支持双向 TLS。使用 [指南](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs) 中生成的密钥和证书正确配置输入。

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: true  # Set to true if you're using TLS. 
      # The files below are generated from the steps at https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
      crt_file: logstash.crt
      key_file: logstash.key
      ca_file: ca.crt
      verify_certificate: true
```

</VerticalStepper>

### 将 Elastic Agent 作为 OpenTelemetry collector 运行 {#run-agent-as-otel}

Elastic Agent 包含一个嵌入的 EDOT Collector，允许你对应用程序和基础设施进行一次性编码，并将数据发送到多个供应商和后端。

:::note 代理集成和编排
运行与 Elastic Agent 一起分发的 EDOT collector 的用户将无法利用 [代理提供的现有集成](https://www.elastic.co/docs/reference/fleet/manage-integrations)。此外，collector 不能由 Fleet 进行集中管理 - 迫使用户以 [独立模式](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents) 运行代理，自行管理配置。
:::

要使用 EDOT collector 运行 Elastic Agent，请参阅 [官方 Elastic 指南](https://www.elastic.co/docs/reference/fleet/otel-agent-transform)。与指南中指示的 Elastic 端点配置不同，删除现有的 `exporters` 并配置 OTLP 输出 - 将数据发送到 ClickStack OpenTelemetry collector。例如，exporters 的配置变为：

```yaml
exporters:
  # Exporter to send logs and metrics to Elasticsearch Managed OTLP Input
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: true
```

这里的 `YOUR_INGESTION_API_KEY` 是由 ClickStack 生成的。您可以在 HyperDX 应用程序的 `Team Settings → API Keys` 中找到该密钥。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

如果 Vector 已配置使用双向 TLS，并且证书和密钥是使用来自 ["为 Logstash 输出配置 SSL/TLS"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output) 的步骤生成的，则需要相应配置 `otlp` exporter，例如：

```yaml
exporters:
  # Exporter to send logs and metrics to Elasticsearch Managed OTLP Input
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: false
      ca_file: /path/to/ca.crt
      cert_file: /path/to/client.crt
      key_file: /path/to/client.key
```

## 从 Elastic OpenTelemetry collector 迁移 {#migrating-from-elastic-otel-collector}

已经运行 [Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry) 的用户可以简单地重新配置其代理，通过 OTLP 发送到 ClickStack OpenTelemetry collector。相关步骤与上述 [将 Elastic Agent 作为 OpenTelemetry collector](#run-agent-as-otel) 的步骤相同。该方法可用于所有数据类型。
