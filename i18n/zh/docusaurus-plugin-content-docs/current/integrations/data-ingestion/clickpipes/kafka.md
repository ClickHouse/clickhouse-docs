---
'sidebar_label': 'ClickPipes for Kafka'
'description': '无缝连接您的 Kafka 数据源到 ClickHouse Cloud。'
'slug': '/integrations/clickpipes/kafka'
'sidebar_position': 1
'title': '将 Kafka 与 ClickHouse Cloud 集成'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';


# 将 Kafka 集成到 ClickHouse Cloud
## 前提条件 {#prerequisite}
您已熟悉 [ClickPipes 简介](./index.md)。

## 创建您的第一个 Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

1. 访问您的 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes service" size="md" border/>

2. 在左侧菜单中选择 `数据源` 按钮，然后点击 "设置 ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择您的数据源。

<Image img={cp_step1} alt="Select data source type" size="lg" border/>

4. 填写表单，为您的 ClickPipe 提供名称、描述（可选）、凭据和其他连接细节。

<Image img={cp_step2} alt="Fill out connection details" size="lg" border/>

5. 配置模式注册中心。对于 Avro 流，需要有效的模式，而对于 JSON 则是可选的。此模式将用于解析 [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent) 或验证所选主题上的 JSON 消息。
- 无法解析的 Avro 消息或验证失败的 JSON 消息将产生错误。
- 模式注册中心的 "root" 路径。例如，Confluent Cloud 模式注册中心的 URL 仅仅是一个没有路径的 HTTPS URL，如 `https://test-kk999.us-east-2.aws.confluent.cloud` 如果只指定根路径，则在步骤 4 中确定列名称和类型所使用的模式将由嵌入在采样 Kafka 消息中的 ID 决定。
- 路径 `/schemas/ids/[ID]` 为按数字模式 ID 访问模式文档。使用模式 ID 的完整 URL 为 `https://registry.example.com/schemas/ids/1000`
- 路径 `/subjects/[subject_name]` 为按主题名称访问模式文档。可选择通过在 URL 后附加 `/versions/[version]` 来引用特定版本（否则 ClickPipes 将获取最新版本）。使用模式主题的完整 URL 为 `https://registry.example.com/subjects/events` 或 `https://registry/example.com/subjects/events/versions/4`

请注意，在所有情况下，如果消息中嵌入的模式 ID 指示，ClickPipes 将自动从注册表中检索更新或不同的模式。如果消息在没有嵌入模式 ID 的情况下写入，则必须指定特定的模式 ID 或主题以解析所有消息。

6. 选择您的主题，用户界面将显示主题中的示例文档。

<Image img={cp_step3} alt="Set data format and topic" size="lg" border/>

7. 在下一步中，您可以选择将数据导入到新 ClickHouse 表中，还是重用现有表。按照屏幕上的说明修改您的表名、模式和设置。您可以在顶部的示例表中实时预览更改。

<Image img={cp_step4a} alt="Set table, schema, and settings" size="lg" border/>

您还可以使用提供的控件自定义高级设置

<Image img={cp_step4a3} alt="Set advanced controls" size="lg" border/>

8. 或者，您可以选择在现有 ClickHouse 表中导入数据。在这种情况下，用户界面将允许您将源字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="Use an existing table" size="lg" border/>

9. 最后，您可以为内部 ClickPipes 用户配置权限。

**权限：** ClickPipes 将为写入目标表的数据创建一个专用用户。您可以选择使用自定义角色或预定义角色之一为此内部用户选择角色：
- `完全访问`：对集群具有完全访问权限。如果您使用目标表的物化视图或字典，这可能会很有用。
- `仅目标表`：仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="Permissions" size="lg" border/>

10. 点击 "完成设置"，系统将注册您的 ClickPipe，您将能够在摘要表中看到它。

<Image img={cp_success} alt="Success notice" size="sm" border/>

<Image img={cp_remove} alt="Remove notice" size="lg" border/>

摘要表提供了从源或 ClickHouse 中目标表显示示例数据的控件

<Image img={cp_destination} alt="View destination" size="lg" border/>

以及移除 ClickPipe 并显示摄取作业摘要的控件。

<Image img={cp_overview} alt="View overview" size="lg" border/>

11. **恭喜！** 您已成功设置您的第一个 ClickPipe。如果这是一个流 ClickPipe，它将持续运行，实时从您的远程数据源摄取数据。

## 支持的数据源 {#supported-data-sources}

| 名称                 |Logo|类型| 状态          | 描述                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>|流式| 稳定          | 配置 ClickPipes 并开始将流数据从 Apache Kafka 导入 ClickHouse Cloud。     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>|流式| 稳定          | 通过我们的直接集成解锁 Confluent 和 ClickHouse Cloud 的强大结合。          |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>|流式| 稳定          | 配置 ClickPipes 并开始将流数据从 Redpanda 导入 ClickHouse Cloud。         |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>|流式| 稳定          | 配置 ClickPipes 并开始将流数据从 AWS MSK 导入 ClickHouse Cloud。          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>|流式| 稳定          | 配置 ClickPipes 并开始将流数据从 Azure Event Hubs 导入 ClickHouse Cloud。 |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>|流式| 稳定          | 配置 ClickPipes 并开始将流数据从 WarpStream 导入 ClickHouse Cloud。       |

更多的连接器将被添加到 ClickPipes，您可以通过 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes) 了解更多信息。

## 支持的数据格式 {#supported-data-formats}

支持的格式有：
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### 支持的数据类型 {#supported-data-types}

当前 ClickPipes 支持以下 ClickHouse 数据类型：

- 基础数值类型 - \[U\]Int8/16/32/64 和 Float32/64
- 大整数类型 - \[U\]Int128/256
- 小数类型
- 布尔值
- 字符串
- 固定字符串
- 日期，Date32
- DateTime, DateTime64（仅支持 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse LowCardinality 类型
- 使用上述任意类型（包括 Nullable）的键值对 Map 
- 使用上述任意类型（包括 Nullable，深度仅限一层）的元素的 Tuple 和 Array 

### Avro {#avro}
#### 支持的 Avro 数据类型 {#supported-avro-data-types}

ClickPipes 支持所有 Avro 原始类型和复杂类型，以及除了 `time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros` 和 `duration` 之外的所有 Avro 逻辑类型。Avro `record` 类型转换为 Tuple，`array` 类型转换为 Array，`map` 转换为 Map（仅限字符串键）。一般来说，这里列出的转换 [详情](/interfaces/formats/Avro#data-types-matching) 可用。我们建议使用严格类型匹配的 Avro 数值类型，因为 ClickPipes 不会检查类型转换过程中是否出现溢出或精度损失。

#### Nullable 类型和 Avro 联合 {#nullable-types-and-avro-unions}

Avro 中的 Nullable 类型通过使用 `(T, null)` 或 `(null, T)` 的联合模式进行定义，其中 T 是基本 Avro 类型。在模式推断过程中，此类联合将映射到 ClickHouse 的 "Nullable" 列中。请注意，ClickHouse 不支持 `Nullable(Array)`、`Nullable(Map)` 或 `Nullable(Tuple)` 类型。这些类型的 Avro null 联合将映射到非空版本（Avro Record 类型映射到 ClickHouse 命名 Tuple）。用于这些类型的 Avro "null" 将插入为：
- 空 Array 表示空的 Avro 数组
- 空 Map 表示空的 Avro Map
- 具有所有默认/零值的命名 Tuple 表示空的 Avro Record

ClickPipes 当前不支持包含其他 Avro 联合的模式（这可能会随着 ClickHouse Variant 和 JSON 数据类型的发展而改变）。如果 Avro 模式包含 "非空" 联合，在尝试计算 Avro 模式与 Clickhouse 列类型之间的映射时，ClickPipes 将生成错误。

#### Avro 模式管理 {#avro-schema-management}

ClickPipes 动态检索并应用从配置的模式注册中心获取的 Avro 模式，使用嵌入在每个消息/事件中的模式 ID。模式更新会被自动检测和处理。

目前，ClickPipes 仅与使用 [Confluent 模式注册中心 API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html) 的模式注册中心兼容。除了 Confluent Kafka 和 Cloud 之外，还包括 Redpanda、AWS MSK 和 Upstash 模式注册中心。ClickPipes 当前与 AWS Glue 模式注册中心或 Azure 模式注册中心不兼容（即将支持）。

对于检索的 Avro 模式和 ClickHouse 目标表之间的映射，适用以下规则：
- 如果 Avro 模式包含一个未包含在 ClickHouse 目标映射中的字段，则该字段将被忽略。
- 如果 Avro 模式缺少 ClickHouse 目标映射中定义的字段，则 ClickHouse 列将用 "零" 值填充，例如 0 或空字符串。请注意，ClickPipes 插入时目前不评估 [DEFAULT](/sql-reference/statements/create/table#default) 表达式（这是因更新 ClickHouse 服务器默认处理而造成的临时限制）。
- 如果 Avro 模式字段和 ClickHouse 列不兼容，则将失败插入该行/消息，并将在 ClickPipes 错误表中记录该失败。请注意，对于某些隐式转换（如数值类型之间的转换）是支持的，但并不是所有。例如，一个 Avro `record` 字段不能插入到一个 `Int32` ClickHouse 列中。

## Kafka 虚拟列 {#kafka-virtual-columns}

以下虚拟列支持与 Kafka 兼容的流数据源。创建新目标表时，可以使用 `添加列` 按钮添加虚拟列。

| 名称           | 描述                                     | 推荐数据类型         |
|----------------|------------------------------------------|-----------------------|
| _key           | Kafka 消息键                             | 字符串                |
| _timestamp     | Kafka 时间戳（毫秒精度）                 | DateTime64(3)         |
| _partition     | Kafka 分区                               | Int32                 |
| _offset        | Kafka 偏移                               | Int64                 |
| _topic         | Kafka 主题                               | 字符串                |
| _header_keys   | 记录头中的键的并行数组                   | Array(String)         |
| _header_values | 记录头中的值的并行数组                   | Array(String)         |
| _raw_message   | 完整的 Kafka 消息                        | 字符串                |

请注意，_raw_message 列仅建议用于 JSON 数据。对于仅需 JSON 字符串的用例（例如，使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游物化视图），删除所有的 "非虚拟" 列可能会提高 ClickPipes 性能。

## 限制 {#limitations}

- 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。

## 交付语义 {#delivery-semantics}
Kafka 的 ClickPipes 提供 `至少一次` 的交付语义（作为最常用的方法之一）。我们希望听到您对交付语义的反馈，请通过 [联系表单](https://clickhouse.com/company/contact?loc=clickpipes) 与我们联系。如果您需要仅一次的语义，建议使用我们的官方 [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) 接收器。

## 认证 {#authentication}
对于 Apache Kafka 协议数据源，ClickPipes 支持 [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 认证与 TLS 加密，以及 `SASL/SCRAM-SHA-256` 和 `SASL/SCRAM-SHA-512`。根据流数据源（如 Redpanda、MSK 等）的不同，将根据兼容性启用所有或部分这些认证机制。如果您的认证需求不同，请 [给我们反馈](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
MSK ClickPipe 的 IAM 认证是一个测试版功能。
:::

ClickPipes 支持以下 AWS MSK 认证

- [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 认证
- [IAM 凭证或基于角色的访问](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) 认证

在使用 IAM 认证连接到 MSK Broker 时，IAM 角色必须具有必要的权限。
以下是 Apache Kafka APIs 对于 MSK 的所需 IAM 策略示例：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:Connect"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:cluster/clickpipes-testing-brokers/b194d5ae-5013-4b5b-ad27-3ca9f56299c9-10"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:DescribeTopic",
                "kafka-cluster:ReadData"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:topic/clickpipes-testing-brokers/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:AlterGroup",
                "kafka-cluster:DescribeGroup"
            ],
            "Resource": [
                "arn:aws:kafka:us-east-1:12345678912:group/clickpipes-testing-brokers/*"
            ]
        }
    ]
}
```

#### 配置信任关系 {#configuring-a-trusted-relationship}

如果您使用 IAM 角色 ARN 进行 MSK 认证，您需要在您的 ClickHouse Cloud 实例之间添加信任关系，以便可以假设该角色。

:::note
基于角色的访问仅适用于部署到 AWS 的 ClickHouse Cloud 实例。
:::

```json
{
    "Version": "2012-10-17",
    "Statement": [
        ...
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::12345678912:role/CH-S3-your-clickhouse-cloud-role"
            },
            "Action": "sts:AssumeRole"
        },
    ]
}
```

### 自定义证书 {#custom-certificates}
Kafka 的 ClickPipes 支持上传具有 SASL 和公共 SSL/TLS 证书的 Kafka Broker 的自定义证书。您可以在 ClickPipe 设置的 SSL 证书部分上传您的证书。
:::note
请注意，虽然我们支持与 SASL 一起上传单个 SSL 证书，但当前不支持 SSL 与互相 TLS (mTLS)。
:::

## 性能 {#performance}

### 批处理 {#batching}
ClickPipes 会批量将数据插入到 ClickHouse。这是为了避免在数据库中创建过多的部分，这可能导致集群性能问题。

当满足以下标准之一时，将插入批量：
- 批量大小达到最大值（100,000 行或 20MB）
- 批量打开的最大时间（5 秒）

### 延迟 {#latency}

延迟（定义为 Kafka 消息生产与消息在 ClickHouse 中可用之间的时间）将取决于多个因素（即代理延迟、网络延迟、消息大小/格式）。上述的 [批处理](#batching) 将影响延迟。我们始终建议使用典型负载测试您的特定用例，以确定预期延迟。

ClickPipes 不提供有关延迟的任何保证。如果您有特定的低延迟要求，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 可扩展性 {#scaling}

Kafka 的 ClickPipes 设计为水平扩展。默认情况下，我们创建一个消费者组，其中包含一个消费者。
这可以通过 ClickPipe 详细视图中的扩展控件进行更改。

ClickPipes 提供高可用性和可用区域分布式架构。
这需要至少两个消费者进行扩展。

无论运行多少个消费者，容错都是设计使然。
如果消费者或其基础架构失败，
ClickPipe 将自动重启消费者并继续处理消息。

## 常见问题 {#faq}

### 一般性问题 {#general}

- **ClickPipes for Kafka 是如何工作的？**

  ClickPipes 使用专用架构运行 Kafka 消费者 API 从指定主题读取数据，然后将数据插入特定 ClickHouse Cloud 服务上的 ClickHouse 表中。

- **ClickPipes 和 ClickHouse Kafka 表引擎之间有什么区别？**

  Kafka 表引擎是 ClickHouse 的核心能力，它实现了一种 "拉取模型"，其中 ClickHouse 服务器本身连接到 Kafka，拉取事件，然后将其写入本地。

  ClickPipes 是一个独立的云服务，它独立于 ClickHouse 服务运行，它连接到 Kafka（或其他数据源）并将事件推送到关联的 ClickHouse Cloud 服务。 这种解耦架构允许更好的操作灵活性，明确的关注分离，可扩展的摄取，优雅的故障管理，可扩展性等。

- **使用 ClickPipes for Kafka 有什么要求？**

  要使用 ClickPipes for Kafka，您需要一个运行中的 Kafka Broker 和一个启用了 ClickPipes 的 ClickHouse Cloud 服务。您还需要确保 ClickHouse Cloud 可以访问您的 Kafka Broker。这可以通过允许 Kafka 端的远程连接，在您的 Kafka 设置中列入 [ClickHouse Cloud Egress IP 地址](/manage/security/cloud-endpoints-api) 来实现。

- **ClickPipes for Kafka 是否支持 AWS PrivateLink？**

  支持 AWS PrivateLink。如需更多信息，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

- **我可以使用 ClickPipes for Kafka 向 Kafka 主题写入数据吗？**

  不，ClickPipes for Kafka 旨在从 Kafka 主题读取数据，而不是向其写入数据。要向 Kafka 主题写入数据，您需要使用专用的 Kafka 生产者。

- **ClickPipes 是否支持多个 Broker？**

  是的，如果 Broker 是同一法定多数的一部分，它们可以一起配置，用 `,` 分隔。

### Upstash {#upstash}

- **ClickPipes 支持 Upstash 吗？**

  是的。Upstash Kafka 产品于 2024 年 9 月 11 日进入弃用期，持续 6 个月。现有客户可以继续使用 ClickPipes 与其现有的 Upstash Kafka Brokers，使用 ClickPipes 用户界面上的通用 Kafka 磁贴。现有的 Upstash Kafka ClickPipes 在弃用通知之前不会受到影响。弃用期满后，ClickPipe 将停止工作。

- **ClickPipes 支持 Upstash 模式注册中心吗？**

  不。ClickPipes 与 Upstash Kafka 模式注册中心不兼容。

- **ClickPipes 支持 Upstash QStash 工作流吗？**

  不。除非在 QStash 工作流中引入 Kafka 兼容层，否则它不会与 Kafka ClickPipes 一起使用。

### Azure EventHubs {#azure-eventhubs}

- **Azure Event Hubs ClickPipe 在没有 Kafka 层的情况下工作吗？**

  不。ClickPipes 要求 Azure Event Hubs 启用 Kafka 层。Kafka 协议仅在其标准、优质和专用 SKU 定价层中得到支持。

- **Azure 模式注册中心与 ClickPipes 一起工作吗？**

  不。ClickPipes 当前不支持 Event Hubs 模式注册中心。

- **我的策略需要什么权限才能从 Azure Event Hubs 消费？**

  要列出主题并消费事件，给予 ClickPipes 的共享访问策略至少需要一个 'Listen' 声明。

- **为什么我的 Event Hubs 没有返回任何数据？**

如果您的 ClickHouse 实例与 Event Hubs 部署位于不同的区域或大洲，您可能会在为 ClickPipes 上线时遇到超时，并在从 Event Hub 消费数据时出现更高的延迟。最佳实践是将您部署在 ClickHouse Cloud 和 Azure Event Hubs 的位置位于相互接近的云区域，以避免性能问题。

- **我应该在 Azure Event Hubs 中包含端口号吗？**

  是的。ClickPipes 期望您在 Kafka 层中包括端口号，应该是 `:9093`。

- **ClickPipes IP 对 Azure Event Hubs 仍然相关吗？**

  是的。如果您限制对 Event Hubs 实例的流量，请添加 [文档中的静态 NAT IP](./index.md#list-of-static-ips)。

- **连接字符串是针对 Event Hub 还是 Event Hub 命名空间？**

  两者均可，但我们建议使用命名空间级别的共享访问政策来从多个 Event Hubs 获取样本。
