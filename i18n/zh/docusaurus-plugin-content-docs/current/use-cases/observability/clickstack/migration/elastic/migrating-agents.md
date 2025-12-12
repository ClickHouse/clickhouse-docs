---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-agents
title: '从 Elastic 迁移 Agent'
pagination_prev: null
pagination_next: null
sidebar_label: '迁移 Agent'
sidebar_position: 5
description: '从 Elastic 迁移 Agent'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import add_logstash_output from '@site/static/images/use-cases/observability/add-logstash-output.png';
import agent_output_settings from '@site/static/images/use-cases/observability/agent-output-settings.png';
import migrating_agents from '@site/static/images/use-cases/observability/clickstack-migrating-agents.png';


## 从 Elastic 迁移代理 {#migrating-agents-from-elastic}

Elastic Stack 提供了多种用于可观测性数据采集的代理。具体包括：

- [Beats 系列](https://www.elastic.co/beats)，例如 [Filebeat](https://www.elastic.co/beats/filebeat)、[Metricbeat](https://www.elastic.co/beats/metricbeat) 和 [Packetbeat](https://www.elastic.co/beats/packetbeat)，都基于 `libbeat` 库构建。这些 Beats 支持通过 Lumberjack 协议[将数据发送到 Elasticsearch、Kafka、Redis 或 Logstash](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output)。
- [`Elastic Agent`](https://www.elastic.co/elastic-agent) 是一个统一代理，能够采集日志、指标和链路追踪。该代理可以通过 [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet) 进行集中管理，并支持将数据输出到 Elasticsearch、Logstash、Kafka 或 Redis。
- Elastic 还提供了 [OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry) 的一个发行版。尽管目前它无法由 Fleet Server 进行编排，但它为迁移到 ClickStack 的用户提供了一条更加灵活和开放的路径。

最佳迁移路径取决于当前正在使用的代理类型。在接下来的小节中，我们将分别介绍每种主要代理类型的迁移选项。我们的目标是尽量减少迁移阻力，并在可能的情况下允许用户在过渡期间继续使用现有代理。

## 首选迁移路径 {#prefered-migration-path}

在条件允许的情况下，我们建议将所有日志、指标和追踪数据的采集统一迁移到 [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/)，并将该 Collector 以[代理角色部署在边缘](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)。这是发送数据的最高效方式，并能避免架构上的复杂性和数据转换开销。

:::note 为什么选择 OpenTelemetry Collector？
OpenTelemetry Collector 为可观测性数据摄取提供了一种可持续、与厂商无关的解决方案。我们意识到，一些组织运行着成千上万，甚至数以万计的 Elastic Agent。对于这些用户来说，保持与现有代理基础设施的兼容性可能至关重要。本文档旨在支持这一需求，同时帮助团队逐步过渡到基于 OpenTelemetry 的数据采集方式。
:::

## ClickHouse OpenTelemetry endpoint {#clickhouse-otel-endpoint}

所有数据都会通过一个 **OpenTelemetry (OTel) collector** 实例摄取到 ClickStack 中，该实例作为日志、指标、跟踪和会话数据的主要入口点。我们建议在该实例上使用官方提供的 [ClickStack 发行版](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector) collector，如果它尚未[随您的 ClickStack 部署模型一同打包](/use-cases/observability/clickstack/deployment)。

用户可以通过[语言 SDKs](/use-cases/observability/clickstack/sdks)，或通过收集基础设施指标与日志的数据采集代理（例如以 [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 角色运行的 OTel collectors，或其他技术，如 [Fluentd](https://www.fluentd.org/) 或 [Vector](https://vector.dev/))向该 collector 发送数据。

**我们假定在所有 agent 迁移步骤中，该 collector 都是可用的**。

## 从 Beats 迁移 {#migrating-to-beats}

拥有大规模 Beats 部署的用户在迁移到 ClickStack 时，可能希望保留这些现有部署。

**目前该选项仅在 Filebeat 上进行了测试，因此目前只适用于日志。**

Beats 代理使用 [Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs)，该模式目前[正在合并进 OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md) 规范，而 ClickStack 正是使用该规范。不过，这些[模式目前仍存在显著差异](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview)，因此目前需要用户在将数据摄取到 ClickStack 之前，负责将 ECS 格式的事件转换为 OpenTelemetry 格式。

我们建议使用 [Vector](https://vector.dev) 来执行这一转换。Vector 是一个轻量且高性能的可观测性数据管道，支持一种名为 Vector Remap Language (VRL) 的强大转换语言。 

如果你的 Filebeat 代理被配置为将数据发送到 Kafka（Beats 支持的一种输出），Vector 可以从 Kafka 消费这些事件，使用 VRL 应用模式转换，然后通过 OTLP 将它们转发到与 ClickStack 一起分发的 OpenTelemetry collector。

或者，Vector 也支持通过 Logstash 使用的 Lumberjack 协议接收事件。这使 Beats 代理可以直接将数据发送到 Vector，在那里应用相同的转换流程，再通过 OTLP 转发到 ClickStack 的 OpenTelemetry collector。

下面我们展示这两种架构。

<Image img={migrating_agents} alt="Migrating agents" size="lg" background/>

在以下示例中，我们提供初始步骤，用于配置 Vector 通过 Lumberjack 协议从 Filebeat 接收日志事件。我们提供将入站 ECS 事件映射到 OTel 规范的 VRL 规则，然后通过 OTLP 将这些事件发送到 ClickStack 的 OpenTelemetry collector。对于从 Kafka 消费事件的用户，可以将 Vector 的 Logstash source 替换为 [Kafka source](https://vector.dev/docs/reference/configuration/sources/kafka/)——其他步骤保持不变。

<VerticalStepper headerLevel="h3">
  ### 安装 Vector

  请参考[官方安装指南](https://vector.dev/docs/setup/installation/)安装 Vector。

  这可以与您的 Elastic Stack OTel collector 安装在同一实例上。

  用户在[将 Vector 部署到生产环境](https://vector.dev/docs/setup/going-to-prod/)时,应遵循架构和安全性方面的最佳实践。

  ### 配置 Vector

  需将 Vector 配置为通过 Lumberjack 协议接收事件,以模拟 Logstash 实例。可通过为 Vector 配置 [`logstash` 源](https://vector.dev/docs/reference/configuration/sources/logstash/)来实现:

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
  如需使用双向 TLS，请参考 Elastic 指南 [&quot;Configure SSL/TLS for the Logstash output&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output) 生成证书和密钥。生成后，可按上述方式在配置中指定这些证书和密钥。
  :::

  事件将以 ECS 格式接收。可使用 Vector Remap Language (VRL) 转换器将其转换为 OpenTelemetry 模式。该转换器的配置十分简单——只需将脚本文件单独存放：

  ```yaml
transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: 'beat_to_otel.vrl'
```

  注意,它从上述 `beats` 源接收事件。重映射脚本如下所示。该脚本仅针对日志事件进行了测试,但可作为其他格式的基础。

  <details>
    <summary>VRL - 从 ECS 到 OTel</summary>

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

  最后,转换后的事件可以通过 OpenTelemetry 采集器使用 OTLP 协议发送到 ClickStack。这需要在 Vector 中配置一个 OTLP sink,该 sink 将 `remap_filebeat` 转换的事件作为输入:

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

  此处的 `YOUR_INGESTION_API_KEY` 由 ClickStack 生成。您可以在 HyperDX 应用的 `Team Settings → API Keys` 中找到该密钥。

  <Image img={ingestion_key} alt="数据摄取密钥" size="lg" />

  最终的完整配置如下所示：

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

  ### 配置 Filebeat

  现有的 Filebeat 安装只需修改配置即可将事件发送到 Vector。这需要配置 Logstash 输出——同样,TLS 可选配置:

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

Elastic Agent 将不同的 Elastic Beats 整合为一个单一软件包。该 Agent 与 [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server) 集成，使其可以被集中编排和配置。

已经部署 Elastic Agent 的用户有多种迁移方案可选：

- 将 Agent 配置为通过 Lumberjack 协议发送到 Vector endpoint。**目前仅对使用 Elastic Agent 采集日志数据的用户完成了测试。** 可通过 Kibana 中的 Fleet UI 进行集中配置。
- [将 Agent 作为 Elastic OpenTelemetry Collector（EDOT）运行](https://www.elastic.co/docs/reference/fleet/otel-agent)。Elastic Agent 包含嵌入式 EDOT Collector，可让你对应用和基础设施进行一次性接入，然后将数据发送到多个厂商和后端。在该配置下，用户只需将 EDOT collector 配置为通过 OTLP 将事件转发到 ClickStack OTel collector。**这种方式支持所有事件类型。**

下面我们将演示这两种方案。

### 通过 Vector 发送数据 {#sending-data-via-vector}

<VerticalStepper headerLevel="h4">

#### 安装并配置 Vector {#install-configure-vector}

按照用于从 Filebeat 迁移的[相同步骤](#install-vector)安装并配置 Vector。

#### 配置 Elastic Agent {#configure-elastic-agent}

需要将 Elastic Agent 配置为通过 Logstash 协议 Lumberjack 发送数据。这是一种[受支持的部署模式](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge)，既可以集中配置，也可以在不使用 Fleet 进行部署时，[通过代理配置文件 `elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output) 进行配置。

可以通过在 Kibana 中为 Fleet 添加[输出](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings)来实现集中配置。

<Image img={add_logstash_output} alt="添加 Logstash 输出" size="md"/>

然后，该输出可以在[代理策略](https://www.elastic.co/docs/reference/fleet/agent-policy)中使用。这样，所有使用该策略的代理都会自动将其数据发送到 Vector。

<Image img={agent_output_settings} alt="代理设置" size="md"/>

由于这需要配置通过 TLS 的安全通信，我们推荐参考指南《[为 Logstash 输出配置 SSL/TLS](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)》，在该指南中，读者可以假定其 Vector 实例扮演 Logstash 的角色来完成配置。

请注意，这要求用户在 Vector 中将 Logstash 源也配置为双向 TLS（mutual TLS）。使用[在该指南中生成的](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs)密钥和证书来正确配置输入。

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

### 将 Elastic Agent 作为 OpenTelemetry 收集器运行 {#sending-data-via-vector}

Elastic Agent 包含一个内置的 EDOT Collector，使你可以一次性为应用和基础设施添加观测能力，并将数据发送到多个厂商和后端。

:::note Agent 集成与编排
使用随 Elastic Agent 分发的 EDOT collector 的用户，将无法利用 [agent 提供的现有集成](https://www.elastic.co/docs/reference/fleet/manage-integrations)。此外，collector 无法通过 Fleet 进行集中管理——这会迫使用户以 [独立模式运行 agent](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents)，并自行管理配置。
:::

要使用带有 EDOT collector 的 Elastic Agent，请参阅 [Elastic 官方指南](https://www.elastic.co/docs/reference/fleet/otel-agent-transform)。不要按照指南中所示去配置 Elastic 端点，而是移除现有的 `exporters` 并配置 OTLP 输出，将数据发送到 ClickStack 的 OpenTelemetry 收集器。例如，`exporters` 的配置将变为：

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

此处的 `YOUR_INGESTION_API_KEY` 由 ClickStack 生成。您可以在 HyperDX 应用的 `Team Settings → API Keys` 下找到该密钥。

<Image img={ingestion_key} alt="摄取密钥" size="lg" />

如果已将 Vector 配置为使用双向 TLS，并且证书和密钥是按照指南 [&quot;Configure SSL/TLS for the Logstash output&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output) 中的步骤生成的，则需要对 `otlp` 导出器进行相应配置，例如：

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


## 从 Elastic OpenTelemetry Collector 迁移 {#migrating-from-elastic-otel-collector}

已经在运行 [Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry) 的用户，只需重新配置其代理程序，通过 OTLP 将数据发送到 ClickStack OpenTelemetry Collector。所需步骤与上文中运行 [Elastic Agent 作为 OpenTelemetry Collector](#run-agent-as-otel) 的步骤完全相同。此方法适用于所有数据类型。