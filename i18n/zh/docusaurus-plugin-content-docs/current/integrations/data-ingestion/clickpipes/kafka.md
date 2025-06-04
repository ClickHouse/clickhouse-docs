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


# 将 Kafka 与 ClickHouse Cloud 集成
## 前提条件 {#prerequisite}
您已熟悉 [ClickPipes 简介](./index.md)。

## 创建您的第一个 Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

1. 访问您 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes service" size="md" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，并点击“设置 ClickPipe”。

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择您的数据源。

<Image img={cp_step1} alt="Select data source type" size="lg" border/>

4. 填写表单，为您的 ClickPipe 提供一个名称、可选描述、您的凭据和其他连接细节。

<Image img={cp_step2} alt="Fill out connection details" size="lg" border/>

5. 配置模式注册表。对于 Avro 流，要求提供有效的模式；对于 JSON，则是可选的。该模式将用于解析 [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent) 或验证所选主题上的 JSON 消息。
- 无法解析的 Avro 消息或未通过验证的 JSON 消息将生成错误。
- 模式注册表的“根”路径。例如，Confluent Cloud 模式注册表 URL 只是一个没有路径的 HTTPS url，如 `https://test-kk999.us-east-2.aws.confluent.cloud`。如果仅指定根路径，则在第 4 步中用于确定列名称和类型的模式将由嵌入在示例 Kafka 消息中的 id 确定。
- 使用数字模式 id 的模式文档路径 `/schemas/ids/[ID]`。使用模式 id 的完整 url 为 `https://registry.example.com/schemas/ids/1000`。
- 使用主题名称的模式文档路径 `/subjects/[subject_name]`。可以通过在 url 后面附加 `/versions/[version]` 来引用特定版本（否则 ClickPipes 将检索最新版本）。使用模式主题的完整 url 为 `https://registry.example.com/subjects/events` 或 `https://registry/example.com/subjects/events/versions/4`。

请注意，在所有情况下，如果消息中嵌入的模式 ID 指向已更新或不同的模式，ClickPipes 将自动从注册表中检索。 如果消息是写入的，没有嵌入的模式 id，则必须指定特定模式 ID 或主题以解析所有消息。

6. 选择您的主题，用户界面将显示主题中的示例文档。

<Image img={cp_step3} alt="Set data format and topic" size="lg" border/>

7. 在下一步中，您可以选择将数据摄取到新 ClickHouse 表中还是重用现有表。按照屏幕中的说明修改你的表名称、模式和设置。您可以在顶部的示例表中实时预览您的更改。

<Image img={cp_step4a} alt="Set table, schema, and settings" size="lg" border/>

  您还可以使用提供的控件自定义高级设置。

<Image img={cp_step4a3} alt="Set advanced controls" size="lg" border/>

8. 或者，您可以选择将数据摄取到现有 ClickHouse 表中。在这种情况下，用户界面将允许您将来源字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="Use an existing table" size="lg" border/>

9. 最后，您可以为内部 ClickPipes 用户配置权限。

  **权限：** ClickPipes 将为写入目标表的数据创建一个专用用户。您可以使用自定义角色或预定义角色之一为此内部用户选择一个角色：
    - `完全访问`: 拥有对集群的完全访问权限。如果您在目标表中使用物化视图或字典，这可能会很有用。
    - `仅目标表`: 仅对目标表拥有 `INSERT` 权限。

<Image img={cp_step5} alt="Permissions" size="lg" border/>

10. 通过点击“完成设置”，系统将注册您的 ClickPipe，您将能够在摘要表中看到它。

<Image img={cp_success} alt="Success notice" size="sm" border/>

<Image img={cp_remove} alt="Remove notice" size="lg" border/>

  摘要表提供控件以从来源或 ClickHouse 中显示目标表的示例数据。

<Image img={cp_destination} alt="View destination" size="lg" border/>

  以及控件以删除 ClickPipe 并显示摄取作业的摘要。

<Image img={cp_overview} alt="View overview" size="lg" border/>

11. **恭喜！** 您已成功设置您的第一个 ClickPipe。如果这是一个流式 ClickPipe，它将持续运行，从远程数据源实时摄取数据。

## 支持的数据源 {#supported-data-sources}

| 名称                  |Logo|类型   | 状态          | 描述                                                                                                 |
|-----------------------|----|-------|----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka          |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>|流式   | 稳定          | 配置 ClickPipes 并开始从 Apache Kafka 向 ClickHouse Cloud 摄取流式数据。                          |
| Confluent Cloud       |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>|流式   | 稳定          | 通过我们的直接集成释放 Confluent 和 ClickHouse Cloud 的组合力量。                                 |
| Redpanda              |<Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>|流式   | 稳定          | 配置 ClickPipes 并开始从 Redpanda 向 ClickHouse Cloud 摄取流式数据。                              |
| AWS MSK               |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>|流式   | 稳定          | 配置 ClickPipes 并开始从 AWS MSK 向 ClickHouse Cloud 摄取流式数据。                               |
| Azure Event Hubs      |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>|流式   | 稳定          | 配置 ClickPipes 并开始从 Azure Event Hubs 向 ClickHouse Cloud 摄取流式数据。                      |
| WarpStream            |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>|流式   | 稳定          | 配置 ClickPipes 并开始从 WarpStream 向 ClickHouse Cloud 摄取流式数据。                             |

更多连接器将被添加到 ClickPipes，您可以通过 [与我们联系](https://clickhouse.com/company/contact?loc=clickpipes) 了解更多信息。

## 支持的数据格式 {#supported-data-formats}

支持的格式有：
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### 支持的数据类型 {#supported-data-types}

#### 标准类型支持 {#standard-types-support}
当前 ClickPipes 支持以下标准 ClickHouse 数据类型：

- 基本数字类型 - \[U\]Int8/16/32/64 和 Float32/64
- 大整型 - \[U\]Int128/256
- 十进制类型
- 布尔值
- 字符串
- 固定字符串
- 日期，Date32
- 日期时间，DateTime64（仅支持 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse LowCardinality 类型
- 具有任何上述类型（包括 Nullable）的键和值的 Map
- 使用任何上述类型（包括 Nullable，单层深度）的元组和数组

#### 变体类型支持（实验性） {#variant-type-support}
如果您的 Cloud 服务正在运行 ClickHouse 25.3 或更高版本，则变体类型的支持是自动的。否则，您将需要提交支持票以在您的服务上启用它。

ClickPipes 在以下情况下支持变体类型：
- Avro 联合。如果您的 Avro 模式包含多个非空类型的联合，ClickPipes 将推断适当的变体类型。否则，对于 Avro 数据，不支持变体类型。
- JSON 字段。您可以手动为源数据流中的任何 JSON 字段指定变体类型（如 `Variant(String, Int64, DateTime)`）。由于 ClickPipes 确定要使用的正确变体子类型的方式，因此变体定义中只能使用一个整数或日期时间类型 - 例如 `Variant(Int64, UInt32)` 不受支持。

#### JSON 类型支持（实验性） {#json-type-support}
如果您的 Cloud 服务正在运行 ClickHouse 25.3 或更高版本，则 JSON 类型的支持是自动的。否则，您将需要提交支持票以在您的服务上启用它。

ClickPipes 在以下情况下支持 JSON 类型：
- Avro 记录类型可以始终分配给 JSON 列。
- 如果列实际包含 JSON 字符串对象，则 Avro 字符串和字节类型可以分配给 JSON 列。
- 始终为 JSON 对象的 JSON 字段可以分配给 JSON 目标列。

请注意，您需要手动将目标列更改为所需的 JSON 类型，包括任何固定或跳过的路径。

### Avro {#avro}
#### 支持的 Avro 数据类型 {#supported-avro-data-types}

ClickPipes 支持所有 Avro 原语和复杂类型，以及除 `time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros` 和 `duration` 之外的所有 Avro 逻辑类型。Avro 的 `record` 类型转换为元组，`array` 类型转换为数组，`map` 类型转换为 Map（仅限字符串键）。一般来说，此处列出的转换可用 [here](/interfaces/formats/Avro#data-types-matching)。我们建议使用精确类型匹配 Avro 数字类型，因为 ClickPipes 不检查类型转换中的溢出或精度损失。

#### Nullable 类型和 Avro 联合 {#nullable-types-and-avro-unions}

在 Avro 中，通过使用 `(T, null)` 或 `(null, T)` 的联合模式来定义可为空类型，其中 T 是基本 Avro 类型。在模式推导期间，此类联合将映射到 ClickHouse 的“Nullable”列。请注意，ClickHouse 不支持 `Nullable(Array)`、`Nullable(Map)` 或 `Nullable(Tuple)` 类型。这些类型的 Avro 空联合将映射到非空版本（Avro 记录类型映射到 ClickHouse 命名元组）。对于这些类型，Avro 空值将插入为：
- 一个空数组，用于 null Avro 数组
- 一个空 Map，用于 null Avro Map
- 一个命名元组，包含所有默认/零值，用于 null Avro 记录

ClickPipes 目前不支持包含其他 Avro 联合的模式（随着新的 ClickHouse 变体和 JSON 数据类型的成熟，这可能会发生变化）。如果 Avro 模式包含“非空”联合，则 ClickPipes 在尝试计算 Avro 模式与 ClickHouse 列类型之间的映射时将生成错误。

#### Avro 模式管理 {#avro-schema-management}

ClickPipes 动态从配置的模式注册表中检索并应用 Avro 模式，使用嵌入在每个消息/事件中的模式 ID。模式更新会自动检测和处理。

目前 ClickPipes 仅与使用 [Confluent 模式注册表 API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html) 的模式注册表兼容。除了 Confluent Kafka 和 Cloud，Redpanda、AWS MSK 和 Upstash 模式注册表也包含在内。ClickPipes 目前不兼容 AWS Glue 模式注册表或 Azure 模式注册表（即将推出）。

以下规则适用于检索到的 Avro 模式与 ClickHouse 目标表之间的映射：
- 如果 Avro 模式包含的字段未包括在 ClickHouse 目标映射中，该字段将被忽略。
- 如果 Avro 模式缺少在 ClickHouse 目标映射中定义的字段，ClickHouse 列将填充为“零”值，如 0 或空字符串。请注意，对于 ClickPipes 插入，当前不会评估 [DEFAULT](/sql-reference/statements/create/table#default) 表达式（这是一个临时限制，期待对 ClickHouse 服务器默认处理的更新）。
- 如果 Avro 模式字段与 ClickHouse 列不兼容，则该行/消息的插入将失败，失败将记录在 ClickPipes 错误表中。请注意，支持几种隐式转换（如数字类型之间的转换），但并不是所有（例如，Avro `record` 字段不能插入到 `Int32` ClickHouse 列中）。

## Kafka 虚拟列 {#kafka-virtual-columns}

以下虚拟列支持与 Kafka 兼容的流数据源。创建新目标表时，可以使用 `Add Column` 按钮添加虚拟列。

| 名称            | 描述                                        | 推荐数据类型   |
|-----------------|---------------------------------------------|-----------------|
| _key            | Kafka 消息键                                | String          |
| _timestamp      | Kafka 时间戳（毫秒精度）                   | DateTime64(3)   |
| _partition      | Kafka 分区                                  | Int32           |
| _offset         | Kafka 偏移                                  | Int64           |
| _topic          | Kafka 主题                                  | String          |
| _header_keys    | 记录头中的键的并行数组                    | Array(String)   |
| _header_values  | 记录头中的头部的并行数组                  | Array(String)   |
| _raw_message    | 完整的 Kafka 消息                           | String          |

请注意，_raw_message 列仅建议用于 JSON 数据。对于仅需要 JSON 字符串的用例（例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游物化视图），删除所有“非虚拟”列可能会提高 ClickPipes 的性能。

## 限制 {#limitations}

- 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。

## 交付语义 {#delivery-semantics}
ClickPipes for Kafka 提供 `at-least-once` 交付语义（作为最常用的方法之一）。我们希望您通过 [联系表单](https://clickhouse.com/company/contact?loc=clickpipes) 提供对交付语义的反馈。如果您需要恰好一次的语义，我们建议使用我们的官方 [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) 终端。

## 认证 {#authentication}
对于 Apache Kafka 协议数据源，ClickPipes 支持 [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 认证及 TLS 加密，以及 `SASL/SCRAM-SHA-256` 和 `SASL/SCRAM-SHA-512`。根据流数据源（Redpanda、MSK 等），将根据兼容性启用所有或部分这些身份验证机制。如果您有不同的身份验证需求，请 [给我们反馈](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
MSK ClickPipe 的 IAM 认证是一个 beta 功能。
:::

ClickPipes 支持以下 AWS MSK 认证

  - [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 认证
  - [IAM 凭证或基于角色的访问](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) 认证

使用 IAM 认证连接到 MSK 中介时，IAM 角色必须具有必要的权限。
以下是 Apache Kafka APIs 对于 MSK 所需 IAM 策略的示例：

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

#### 配置受信任关系 {#configuring-a-trusted-relationship}

如果您使用 IAM 角色 ARN 进行 MSK 认证，则需要在 ClickHouse Cloud 实例之间添加受信任关系，以便角色可以被假定。

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
ClickPipes for Kafka 支持为具有 SASL & 公共 SSL/TLS 证书的 Kafka 中介上传自定义证书。您可以在 ClickPipe 设置的 SSL 证书部分上传您的证书。
:::note
请注意，尽管我们支持与 SASL 一起上传单个 SSL 证书，但目前不支持 SSL 与互为 TLS (mTLS)。
:::

## 性能 {#performance}

### 批处理 {#batching}
ClickPipes 将数据分批插入 ClickHouse。这样做是为了避免在数据库中创建过多的分区片段，这可能会导致集群中的性能问题。

当满足以下条件之一时，批次将被插入：
- 批量大小已达到最大尺寸（100,000 行或 20MB）
- 批量最大开放时间已达到（5 秒）

### 延迟 {#latency}

延迟（定义为生产 Kafka 消息与消息在 ClickHouse 中可用之间的时间）将取决于许多因素（即中介延迟、网络延迟、消息大小/格式）。上面一节中描述的 [批处理](#batching) 也将影响延迟。我们始终建议使用典型负载测试您的特定用例以确定预期的延迟。

ClickPipes 不提供任何关于延迟的保证。如果您对延迟有特定的低延迟要求，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展 {#scaling}

ClickPipes for Kafka 旨在水平扩展。默认情况下，我们创建一个消费组，其中包含一个消费者。
您可以使用 ClickPipe 详细视图中的扩展控件更改这一设置。

ClickPipes 提供高可用性和分区区域分布架构。
这需要扩展到至少两个消费者。

无论运行多少个消费者，容错机制都是设计的一部分。
如果消费者或其基础设施发生故障，
ClickPipe 将自动重新启动该消费者并继续处理消息。

## 常见问题解答 {#faq}

### 一般 {#general}

- **ClickPipes for Kafka 是如何工作的？**

  ClickPipes 使用专用架构运行 Kafka 消费者 API 从指定主题读取数据，然后将数据插入到特定 ClickHouse Cloud 服务的 ClickHouse 表中。

- **ClickPipes 和 ClickHouse Kafka 表引擎有什么区别？**

  Kafka 表引擎是 ClickHouse 核心功能，采用“拉取模型”，点击 ClickHouse 服务器本身连接到 Kafka，拉取事件然后写入本地。

  ClickPipes 是一个独立于 ClickHouse 服务的云服务，它连接到 Kafka（或其他数据源）并将事件推送到关联的 ClickHouse Cloud 服务。这种解耦架构允许更优的操作灵活性、明显分离的关注点、可扩展的数据摄取、优雅的失败管理、可扩展性等。

- **使用 ClickPipes for Kafka 有什么要求？**

  为了使用 ClickPipes for Kafka，您需要运行的 Kafka 中介和启用 ClickPipes 的 ClickHouse Cloud 服务。您还需要确保 ClickHouse Cloud 可以访问您的 Kafka 中介。这可以通过允许 Kafka 端的远程连接来实现，在您的 Kafka 设置中将 [ClickHouse Cloud 出口 IP 地址](/manage/security/cloud-endpoints-api) 列入白名单。

- **ClickPipes for Kafka 支持 AWS PrivateLink 吗？**

  支持 AWS PrivateLink。有关更多信息，请 [与我们联系](https://clickhouse.com/company/contact?loc=clickpipes)。

- **我可以使用 ClickPipes for Kafka 将数据写入 Kafka 主题吗？**

  不可以，ClickPipes for Kafka 设计用于从 Kafka 主题读取数据，而不是将数据写入它们。要将数据写入 Kafka 主题，您需要使用专用的 Kafka 生产者。

- **ClickPipes 支持多个中介吗？**

  是的，如果这些中介是同一法定人数的一部分，则可以将它们一起配置，使用 `,` 分隔。

### Upstash {#upstash}

- **ClickPipes 支持 Upstash 吗？**

  是的。 Upstash Kafka 产品于 2024 年 9 月 11 日进入弃用期，为期 6 个月。现有客户可以继续使用 ClickPipes 及其现有 Upstash Kafka 中介，使用 ClickPipes 用户界面上的通用 Kafka 瓦片。在弃用通知之前，现有的 Upstash Kafka ClickPipes 不受影响。当弃用期结束时，ClickPipe 将停止运行。

- **ClickPipes 支持 Upstash 模式注册表吗？**

  不支持。ClickPipes 与 Upstash Kafka 模式注册表不兼容。

- **ClickPipes 支持 Upstash QStash 工作流吗？**

  不支持。除非在 QStash 工作流中引入与 Kafka 兼容的接口，否则它将无法与 Kafka ClickPipes 一起使用。

### Azure EventHubs {#azure-eventhubs}

- **Azure Event Hubs ClickPipe 在没有 Kafka 接口的情况下能否工作？**

  不能。ClickPipes 要求 Azure Event Hubs 启用 Kafka 接口。Kafka 协议仅在它们的标准、优质和专用 SKU 价格层中支持。

- **Azure 模式注册表与 ClickPipes 的工作吗？**

  不支持。ClickPipes 当前与 Event Hubs 模式注册表不兼容。

- **我的策略需要什么权限才能从 Azure Event Hubs 消费？**

  要列出主题和消费事件，给予 ClickPipes 的共享访问策略至少需要包含一个“侦听”声明。

- **为什么我的 Event Hubs 没有返回任何数据？**

  如果您的 ClickHouse 实例位于与您的 Event Hubs 部署不同的区域或大陆，您可能会在启用 ClickPipes 时遇到超时，并且在从 Event Hub 消费数据时出现更高的延迟。最佳实践是将 ClickHouse Cloud 部署和 Azure Event Hubs 部署位于靠近彼此的云区域，以避免不良性能。

- **我应该包含 Azure Event Hubs 的端口号吗？**

  是的。ClickPipes 期望您为 Kafka 接口包含您的端口号，应为 `:9093`。

- **ClickPipes 的 IP 地址对于 Azure Event Hubs 仍然相关吗？**

  是的。如果您限制对 Event Hubs 实例的流量，请添加 [文档中的静态 NAT IPs](./index.md#list-of-static-ips)。

- **连接字符串是用于 Event Hub 还是用于 Event Hub 命名空间？**

  两者都可以，但我们建议使用命名空间级别的共享访问策略，以便从多个 Event Hubs 获取示例。
