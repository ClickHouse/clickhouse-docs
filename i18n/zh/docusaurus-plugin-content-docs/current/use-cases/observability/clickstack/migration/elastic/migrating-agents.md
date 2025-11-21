---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-agents
title: '从 Elastic 迁移代理程序'
pagination_prev: null
pagination_next: null
sidebar_label: '迁移代理程序'
sidebar_position: 5
description: '从 Elastic 迁移代理程序'
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

Elastic Stack 提供了多种可观测性数据收集代理,具体包括:

- [Beats 系列](https://www.elastic.co/beats) - 例如 [Filebeat](https://www.elastic.co/beats/filebeat)、[Metricbeat](https://www.elastic.co/beats/metricbeat) 和 [Packetbeat](https://www.elastic.co/beats/packetbeat) - 均基于 `libbeat` 库构建。这些 Beats 支持通过 Lumberjack 协议[将数据发送到 Elasticsearch、Kafka、Redis 或 Logstash](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output)。
- [`Elastic Agent`](https://www.elastic.co/elastic-agent) 提供了统一的代理,能够收集日志、指标和追踪数据。该代理可通过 [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet) 进行集中管理,并支持输出到 Elasticsearch、Logstash、Kafka 或 Redis。
- Elastic 还提供了 [OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry) 的发行版。虽然目前无法通过 Fleet Server 进行编排,但它为迁移到 ClickStack 的用户提供了更灵活、更开放的路径。

最佳迁移路径取决于当前使用的代理。在后续章节中,我们将介绍每种主要代理类型的迁移选项。我们的目标是最大限度地降低迁移难度,并在可能的情况下允许用户在过渡期间继续使用其现有代理。


## 推荐的迁移路径 {#prefered-migration-path}

我们建议在可能的情况下迁移到 [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/) 来收集所有日志、指标和追踪数据,并将收集器[以代理角色部署在边缘](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)。这是最高效的数据发送方式,可以避免架构复杂性和数据转换。

:::note 为什么选择 OpenTelemetry Collector?
OpenTelemetry Collector 为可观测性数据采集提供了可持续且供应商中立的解决方案。我们了解到,一些组织运行着数千甚至数万个 Elastic 代理。对于这些用户来说,保持与现有代理基础设施的兼容性可能至关重要。本文档旨在为此提供支持,同时帮助团队逐步过渡到基于 OpenTelemetry 的采集方式。
:::


## ClickHouse OpenTelemetry 端点 {#clickhouse-otel-endpoint}

所有数据通过 **OpenTelemetry (OTel) 采集器**实例接入 ClickStack,该实例作为日志、指标、追踪和会话数据的主要入口点。我们建议为此实例使用官方的 [ClickStack 发行版](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector)采集器,如果您的 [ClickStack 部署模型中尚未包含](/use-cases/observability/clickstack/deployment)的话。

用户可以从[语言 SDK](/use-cases/observability/clickstack/sdks) 向此采集器发送数据,或通过收集基础设施指标和日志的数据采集代理发送数据(例如充当 [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 角色的 OTel 采集器,或其他技术如 [Fluentd](https://www.fluentd.org/) 或 [Vector](https://vector.dev/))。

**我们假定此采集器可用于所有代理迁移步骤**。


## 从 Beats 迁移 {#migrating-to-beats}

拥有大规模 Beat 部署的用户在迁移到 ClickStack 时可能希望保留这些部署。

**目前此选项仅在 Filebeat 上经过测试,因此仅适用于日志。**

Beats 代理使用 [Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs),该模式目前[正在合并到 ClickStack 所使用的 OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md) 规范中。然而,这些[模式仍然存在显著差异](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview),用户目前需要负责在将事件导入 ClickStack 之前将 ECS 格式的事件转换为 OpenTelemetry 格式。

我们建议使用 [Vector](https://vector.dev) 执行此转换,这是一个轻量级、高性能的可观测性数据管道,支持一种名为 Vector Remap Language (VRL) 的强大转换语言。

如果您的 Filebeat 代理配置为将数据发送到 Kafka(Beats 支持的输出),Vector 可以从 Kafka 消费这些事件,使用 VRL 应用模式转换,然后通过 OTLP 将它们转发到随 ClickStack 分发的 OpenTelemetry Collector。

或者,Vector 还支持通过 Logstash 使用的 Lumberjack 协议接收事件。这使得 Beats 代理可以直接将数据发送到 Vector,在通过 OTLP 转发到 ClickStack OpenTelemetry Collector 之前应用相同的转换过程。

我们在下面展示这两种架构。

<Image img={migrating_agents} alt='迁移代理' size='lg' background />

在以下示例中,我们提供了配置 Vector 通过 Lumberjack 协议从 Filebeat 接收日志事件的初始步骤。我们提供了用于将入站 ECS 事件映射到 OTel 规范的 VRL,然后通过 OTLP 将这些事件发送到 ClickStack OpenTelemetry Collector。从 Kafka 消费事件的用户可以将 Vector Logstash 源替换为 [Kafka 源](https://vector.dev/docs/reference/configuration/sources/kafka/) - 所有其他步骤保持不变。

<VerticalStepper headerLevel="h3">

### 安装 Vector {#install-vector}

使用[官方安装指南](https://vector.dev/docs/setup/installation/)安装 Vector。

可以将其安装在与 Elastic Stack OTel Collector 相同的实例上。

用户在[将 Vector 迁移到生产环境](https://vector.dev/docs/setup/going-to-prod/)时可以遵循有关架构和安全性的最佳实践。

### 配置 Vector {#configure-vector}

应将 Vector 配置为通过 Lumberjack 协议接收事件,模拟 Logstash 实例。这可以通过为 Vector 配置 [`logstash` 源](https://vector.dev/docs/reference/configuration/sources/logstash/)来实现:

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: false # 如果使用 TLS,请设置为 true
      # 以下文件是从 https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs 的步骤生成的
      # crt_file: logstash.crt
      # key_file: logstash.key
      # ca_file: ca.crt
      # verify_certificate: true
```

:::note TLS 配置
如果需要双向 TLS,请使用 Elastic 指南["为 Logstash 输出配置 SSL/TLS"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)生成证书和密钥。然后可以在配置中指定这些内容,如上所示。
:::

事件将以 ECS 格式接收。可以使用 Vector Remap Language (VRL) 转换器将这些事件转换为 OpenTelemetry 模式。此转换器的配置很简单 - 脚本文件保存在单独的文件中:

```yaml
transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: "beat_to_otel.vrl"
```

请注意,它从上述 `beats` 源接收事件。我们的重映射脚本如下所示。此脚本仅在日志事件上经过测试,但可以作为其他格式的基础。

<details>
<summary>VRL - ECS 到 OTel</summary>


```javascript
# 定义根级别需要忽略的键
ignored_keys = ["@metadata"]
```


# 定义资源键前缀
resource_keys = ["host", "cloud", "agent", "service"]



# 为资源和日志记录字段分别创建独立对象
resource_obj = {}
log_record_obj = {}



# 将所有未忽略的根键复制到相应对象

root_keys = keys(.)
for_each(root_keys) -> |\_index, key| {
if !includes(ignored_keys, key) {
val, err = get(., [key])
if err == null { # 检查是否为资源字段
is_resource = false
if includes(resource_keys, key) {
is_resource = true
}

            # 添加到相应对象
            if is_resource {
                resource_obj = set(resource_obj, [key], val) ?? resource_obj
            } else {
                log_record_obj = set(log_record_obj, [key], val) ?? log_record_obj
            }
        }
    }

}


# 分别将两个对象展平
flattened_resources = flatten(resource_obj, separator: ".")
flattened_logs = flatten(log_record_obj, separator: ".")



# 处理资源属性

resource_attributes = []
resource_keys_list = keys(flattened_resources)
for_each(resource_keys_list) -> |\_index, field_key| {
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


# 处理日志记录属性

log_attributes = []
log_keys_list = keys(flattened_logs)
for_each(log_keys_list) -> |\_index, field_key| {
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


# 获取 timeUnixNano 的时间戳(转换为纳秒)

timestamp_nano = if exists(.@timestamp) {
to_unix_timestamp!(parse_timestamp!(.@timestamp, format: "%Y-%m-%dT%H:%M:%S%.3fZ"), unit: "nanoseconds")
} else {
to_unix_timestamp(now(), unit: "nanoseconds")
}


# 获取 message/body 字段

body_value = if exists(.message) {
to_string!(.message)
} else if exists(.body) {
to_string!(.body)
} else {
""
}


# 创建 OpenTelemetry 结构

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

````

</details>

最后,转换后的事件可以通过 OTLP 协议经由 OpenTelemetry 收集器发送到 ClickStack。这需要在 Vector 中配置一个 OTLP sink,该 sink 从 `remap_filebeat` 转换接收事件作为输入:

```yaml
sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat] # 从 remap 转换接收事件 - 见下文
    protocol:
      type: http  # 端口 4317 使用 "grpc"
      uri: http://localhost:4318/v1/logs # OTel 收集器的日志端点
      method: post
      encoding:
        codec: json
      framing:
        method: newline_delimited
      headers:
        content-type: application/json
        authorization: ${YOUR_INGESTION_API_KEY}
````

此处的 `YOUR_INGESTION_API_KEY` 由 ClickStack 生成。您可以在 HyperDX 应用的 `Team Settings → API Keys` 下找到该密钥。

<Image img={ingestion_key} alt='摄取密钥' size='lg' />

最终的完整配置如下所示:

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled:
        false # 如果使用 TLS,请设置为 true
        #crt_file: /data/elasticsearch-9.0.1/logstash/logstash.crt
        #key_file: /data/elasticsearch-9.0.1/logstash/logstash.key
        #ca_file: /data/elasticsearch-9.0.1/ca/ca.crt
        #verify_certificate: true

transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: "beat_to_otel.vrl"

sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat]
    protocol:
      type: http # 端口 4317 使用 "grpc"
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

现有的 Filebeat 安装只需修改配置,将事件发送到 Vector 即可。这需要配置一个 Logstash 输出 - 同样,可以选择性地配置 TLS:


```yaml
# ------------------------------ Logstash 输出 -------------------------------
output.logstash:
  # Logstash 主机地址
  hosts: ["localhost:5044"]

  # 可选 SSL 配置。默认为关闭状态。
  # HTTPS 服务器验证所需的根证书列表
  #ssl.certificate_authorities: ["/etc/pki/root/ca.pem"]

  # SSL 客户端身份验证证书
  #ssl.certificate: "/etc/pki/client/cert.pem"

  # 客户端证书私钥
  #ssl.key: "/etc/pki/client/cert.key"
```

</VerticalStepper>


## 从 Elastic Agent 迁移 {#migrating-from-elastic-agent}

Elastic Agent 将不同的 Elastic Beats 整合到单个软件包中。该代理与 [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server) 集成,支持集中编排和配置。

已部署 Elastic Agent 的用户有以下几种迁移路径:

- 配置代理通过 Lumberjack 协议向 Vector 端点发送数据。**目前仅针对使用 Elastic Agent 收集日志数据的用户进行了测试。** 可以通过 Kibana 中的 Fleet UI 进行集中配置。
- [将代理作为 Elastic OpenTelemetry Collector (EDOT) 运行](https://www.elastic.co/docs/reference/fleet/otel-agent)。Elastic Agent 包含一个嵌入式 EDOT Collector,允许您一次性对应用程序和基础设施进行插桩,并将数据发送到多个供应商和后端。在此配置下,用户只需配置 EDOT collector 通过 OTLP 将事件转发到 ClickStack OTel collector 即可。**此方法支持所有事件类型。**

下面我们将演示这两种方案。

### 通过 Vector 发送数据 {#sending-data-via-vector}

<VerticalStepper headerLevel="h4">

#### 安装和配置 Vector {#install-configure-vector}

使用与从 Filebeat 迁移文档中相同的[步骤](#install-vector)来安装和配置 Vector。

#### 配置 Elastic Agent {#configure-elastic-agent}

需要配置 Elastic Agent 通过 Logstash 协议 Lumberjack 发送数据。这是一种[受支持的部署模式](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge),可以集中配置,或者在不使用 Fleet 部署时[通过代理配置文件 `elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output) 进行配置。

通过 Kibana 进行集中配置可以通过添加 [Fleet 输出](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings)来实现。

<Image img={add_logstash_output} alt='Add Logstash output' size='md' />

然后可以在[代理策略](https://www.elastic.co/docs/reference/fleet/agent-policy)中使用此输出。这样,使用该策略的所有代理都会自动将数据发送到 Vector。

<Image img={agent_output_settings} alt='Agent settings' size='md' />

由于这需要配置通过 TLS 进行安全通信,我们建议参考指南 ["为 Logstash 输出配置 SSL/TLS"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output),用户可以假设其 Vector 实例承担 Logstash 的角色来遵循该指南。

请注意,这要求用户在 Vector 中配置 Logstash 源以使用双向 TLS。使用[指南中生成](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs)的密钥和证书来正确配置输入。

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: true # 如果使用 TLS,设置为 true。
      # 以下文件从 https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs 的步骤中生成
      crt_file: logstash.crt
      key_file: logstash.key
      ca_file: ca.crt
      verify_certificate: true
```

</VerticalStepper>

### 将 Elastic Agent 作为 OpenTelemetry collector 运行 {#run-agent-as-otel}

Elastic Agent 包含一个嵌入式 EDOT Collector,允许您一次性对应用程序和基础设施进行插桩,并将数据发送到多个供应商和后端。

:::note 代理集成和编排
运行随 Elastic Agent 分发的 EDOT collector 的用户将无法使用[代理提供的现有集成](https://www.elastic.co/docs/reference/fleet/manage-integrations)。此外,collector 无法由 Fleet 集中管理 - 这要求用户以[独立模式运行代理](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents),自行管理配置。
:::

要使用 EDOT collector 运行 Elastic Agent,请参阅 [Elastic 官方指南](https://www.elastic.co/docs/reference/fleet/otel-agent-transform)。与指南中指示的配置 Elastic 端点不同,需要删除现有的 `exporters` 并配置 OTLP 输出 - 将数据发送到 ClickStack OpenTelemetry collector。例如,exporters 的配置变为:

```yaml
exporters:
  # 用于将日志和指标发送到 Elasticsearch Managed OTLP Input 的导出器
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: true
```


此处的 `YOUR_INGESTION_API_KEY` 由 ClickStack 生成。你可以在 HyperDX 应用的 `Team Settings → API Keys` 中找到该密钥。

<Image img={ingestion_key} alt="Ingestion keys" size="lg" />

如果已将 Vector 配置为使用双向 TLS，且证书和密钥是按照指南[《为 Logstash 输出配置 SSL/TLS》](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)中的步骤生成的，则需要相应地配置 `otlp` 导出器，例如：

```yaml
exporters:
  # 导出器,用于将日志和指标发送到 Elasticsearch 托管的 OTLP 输入
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


## 从 Elastic OpenTelemetry 收集器迁移 {#migrating-from-elastic-otel-collector}

已运行 [Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry) 的用户只需重新配置其代理,即可通过 OTLP 将数据发送到 ClickStack OpenTelemetry 收集器。所涉及的步骤与上文[将 Elastic Agent 作为 OpenTelemetry 收集器运行](#run-agent-as-otel)中所述的步骤完全相同。此方法适用于所有数据类型。
