---
'sidebar_label': 'ClickPipes for Kafka'
'description': 'Seamlessly connect your Kafka data sources to ClickHouse Cloud.'
'slug': '/integrations/clickpipes/kafka'
'sidebar_position': 1
'title': 'Integrating Kafka with ClickHouse Cloud'
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
您已熟悉 [ClickPipes 入门](./index.md)。

## 创建您的第一个 Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

1. 访问您 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes service" size="md" border/>

2. 在左侧菜单中选择 `数据源` 按钮，然后点击 "设置 ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择您的数据源。

<Image img={cp_step1} alt="Select data source type" size="lg" border/>

4. 填写表单，为您的 ClickPipe 提供名称、描述（可选）、凭证及其他连接详细信息。

<Image img={cp_step2} alt="Fill out connection details" size="lg" border/>

5. 配置模式注册表。Avro 流需要有效模式，JSON 是可选的。此模式将用于解析 [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent) 或验证所选主题上的 JSON 消息。
   - 无法解析的 Avro 消息或未通过验证的 JSON 消息将生成错误。
   - 模式注册表的 "root" 路径。例如，Confluent Cloud 模式注册表 URL 就是没有路径的 HTTPS url，例如 `https://test-kk999.us-east-2.aws.confluent.cloud` 如果仅指定了根路径，则步骤 4 中用于确定列名和类型的模式将由嵌入在采样的 Kafka 消息中的 id 决定。
   - 通过数字模式 id 指向模式文档的路径 `/schemas/ids/[ID]`。使用模式 id 的完整 url 将是 `https://registry.example.com/schemas/ids/1000`
   - 通过主题名称指向模式文档的路径 `/subjects/[subject_name]`。可选择通过在 URL 后附加 `/versions/[version]` 来引用特定版本（否则 ClickPipes 将检索最新版本）。使用模式主题的完整 url 将是 `https://registry.example.com/subjects/events` 或 `https://registry/example.com/subjects/events/versions/4`

请注意，在所有情况下，如果消息中嵌入了模式 ID，ClickPipes 将自动从注册表检索更新或不同的模式。如果消息在没有嵌入模式 ID 的情况下写入，则必须指定特定模式 ID 或主题以解析所有消息。

6. 选择您的主题，用户界面将显示该主题的示例文档。

<Image img={cp_step3} alt="Set data format and topic" size="lg" border/>

7. 在下一步中，您可以选择将数据摄取到新的 ClickHouse 表中或重用现有表。按照屏幕中的说明修改表名、模式和设置。您可以在顶部示例表中实时预览您的更改。

<Image img={cp_step4a} alt="Set table, schema, and settings" size="lg" border/>

您还可以使用提供的控件自定义高级设置。

<Image img={cp_step4a3} alt="Set advanced controls" size="lg" border/>

8. 或者，您可以选择将数据摄取到现有的 ClickHouse 表中。在这种情况下，用户界面将允许您将源字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="Use an existing table" size="lg" border/>

9. 最后，您可以配置内部 ClickPipes 用户的权限。

   **权限:** ClickPipes 将为向目标表写入数据创建一个专用用户。您可以使用自定义角色或预定义角色之一为该内部用户选择角色：
   - `完全访问`: 对集群具有完全访问权限。如果您在目标表中使用物化视图或字典，这可能会很有用。
   - `仅目标表`: 仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="Permissions" size="lg" border/>

10. 点击 "完成设置"，系统将注册您的 ClickPipe，您将能够在摘要表中看到它。

<Image img={cp_success} alt="Success notice" size="sm" border/>

<Image img={cp_remove} alt="Remove notice" size="lg" border/>

   摘要表提供了控制显示源或 ClickHouse 中目标表的示例数据的功能。

<Image img={cp_destination} alt="View destination" size="lg" border/>

   以及删除 ClickPipe 和显示摄取作业摘要的控件。

<Image img={cp_overview} alt="View overview" size="lg" border/>

11. **恭喜！** 您已成功设置了第一个 ClickPipe。如果这是一个流式 ClickPipe，它将持续运行，实时摄取来自远程数据源的数据。

## 支持的数据源 {#supported-data-sources}

| 名称                | Logo | 类型   | 状态          | 描述                                                                                            |
|---------------------|------|--------|---------------|-------------------------------------------------------------------------------------------------|
| Apache Kafka        | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/> | 流式   | 稳定          | 配置 ClickPipes 并开始从 Apache Kafka 中摄取流式数据至 ClickHouse Cloud。                   |
| Confluent Cloud     | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/> | 流式   | 稳定          | 通过我们直接集成，释放 Confluent 和 ClickHouse Cloud 的结合力量。                           |
| Redpanda            | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/> | 流式   | 稳定          | 配置 ClickPipes 并开始从 Redpanda 中摄取流式数据至 ClickHouse Cloud。                      |
| AWS MSK             | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/> | 流式   | 稳定          | 配置 ClickPipes 并开始从 AWS MSK 中摄取流式数据至 ClickHouse Cloud。                       |
| Azure Event Hubs    | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/> | 流式   | 稳定          | 配置 ClickPipes 并开始从 Azure Event Hubs 中摄取流式数据至 ClickHouse Cloud。              |
| WarpStream          | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/> | 流式   | 稳定          | 配置 ClickPipes 并开始从 WarpStream 中摄取流式数据至 ClickHouse Cloud。                    |

将来会向 ClickPipes 添加更多连接器，您可以通过 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes) 了解更多信息。

## 支持的数据格式 {#supported-data-formats}

支持的格式包括：
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### 支持的数据类型 {#supported-data-types}

目前 ClickPipes 支持以下 ClickHouse 数据类型：

- 基本数字类型 - \[U\]Int8/16/32/64 和 Float32/64
- 大整数类型 - \[U\]Int128/256
- 十进制类型
- 布尔值
- 字符串
- 固定字符串
- 日期, Date32
- 日期时间, DateTime64（仅支持 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse LowCardinality 类型
- 使用上述任何类型（包括 Nullable）的键值 Map
- 使用上述任何类型（包括 Nullable，一级深度）的 Tuple 和 Array

### Avro {#avro}
#### 支持的 Avro 数据类型 {#supported-avro-data-types}

ClickPipes 支持所有 Avro 原始和复杂类型，以及除 `time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros` 和 `duration` 之外的所有 Avro 逻辑类型。Avro `record` 类型转化为 Tuple，`array` 类型转化为 Array，`map` 转化为 Map（仅支持字符串键）。一般来说，列表中的转换 [here](/interfaces/formats/Avro#data-types-matching) 是可用的。我们建议使用精确类型匹配 Avro 数字类型，因为 ClickPipes 不检查溢出或精度损失。

#### 可空类型和 Avro 联合类型 {#nullable-types-and-avro-unions}

Avro 中的可空类型通过使用 `(T, null)` 或 `(null, T)` 的联合模式进行定义，其中 T 是基本 Avro 类型。在模式推断期间，这样的联合将映射到 ClickHouse 的 "Nullable" 列。请注意 ClickHouse 不支持 `Nullable(Array)`、`Nullable(Map)` 或 `Nullable(Tuple)` 类型。这些类型的 Avro null 联合将映射到非可空版本（Avro Record 类型映射为 ClickHouse 命名 Tuple）。这些类型的 Avro "null" 将插入为：
- 对于 null Avro 数组的一个空 Array
- 对于 null Avro Map 的一个空 Map
- 对于 null Avro Record 的一个具有所有默认/零值的命名 Tuple

ClickPipes 目前不支持包含其他 Avro 联合类型的模式（随着新的 ClickHouse Variant 和 JSON 数据类型的成熟，这可能会有所改变）。如果 Avro 模式包含 "non-null" 联合类型，ClickPipes 在尝试计算 Avro 模式与 Clickhouse 列类型之间的映射时将生成错误。

#### Avro 模式管理 {#avro-schema-management}

ClickPipes 动态从配置的模式注册表中检索并应用 Avro 模式，使用嵌入在每个消息/事件中的模式 ID。模式更新被自动检测和处理。

目前 ClickPipes 仅兼容使用 [Confluent Schema Registry API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html) 的模式注册表。除了 Confluent Kafka 和 Cloud 外，这还包括 Redpanda、AWS MSK 和 Upstash 模式注册表。目前 ClickPipes 不兼容 AWS Glue 模式注册表或 Azure 模式注册表（即将推出）。

以下规则适用于检索的 Avro 模式与 ClickHouse 目标表之间的映射：
- 如果 Avro 模式包含未包含在 ClickHouse 目标映射中的字段，则忽略该字段。
- 如果 Avro 模式缺少 ClickHouse 目标映射中定义的字段，则 ClickHouse 列将填充 "零" 值，例如 0 或空字符串。请注意，目前 ClickPipes 插入不评估 [DEFAULT](/sql-reference/statements/create/table#default) 表达式（这是对 ClickHouse 服务器默认处理的临时限制）。
- 如果 Avro 模式字段与 ClickHouse 列不兼容，该行/消息的插入将失败，并且失败将记录在 ClickPipes 错误表中。注意，虽然支持一些隐式转换（例如，数字类型之间的转换），但并不支持所有转换（例如，Avro `record` 字段无法插入 `Int32` ClickHouse 列）。

## Kafka 虚拟列 {#kafka-virtual-columns}

以下虚拟列适用于与 Kafka 兼容的流式数据源。在创建新的目标表时，可以通过使用 `添加列` 按钮添加虚拟列。

| 名称               | 描述                                        | 推荐数据类型        |
|--------------------|---------------------------------------------|---------------------|
| _key               | Kafka 消息键                              | 字符串               |
| _timestamp         | Kafka 时间戳（毫秒精度）                    | DateTime64(3)       |
| _partition         | Kafka 分区                                 | Int32               |
| _offset            | Kafka 偏移量                               | Int64               |
| _topic             | Kafka 主题                                 | 字符串               |
| _header_keys       | 记录头中的键的并行数组                      | Array(String)       |
| _header_values     | 记录头中的头部的并行数组                    | Array(String)       |
| _raw_message       | 完整的 Kafka 消息                          | 字符串               |

请注意，_raw_message 列仅推荐用于 JSON 数据。对于仅需要 JSON 字符串的用例（例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游物化视图），删除所有 "非虚拟" 列可能会提高 ClickPipes 的性能。

## 限制 {#limitations}

- 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。

## 交付语义 {#delivery-semantics}
ClickPipes for Kafka 提供 `至少一次` 交付语义（这是最常用的方法之一）。我们非常希望听到您对交付语义的反馈 [联系表单](https://clickhouse.com/company/contact?loc=clickpipes)。如果您需要精确一次语义，我们建议使用我们的官方 [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) 接收器。

## 身份验证 {#authentication}
对于 Apache Kafka 协议数据源，ClickPipes 支持带 TLS 加密的 [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 身份验证，以及 `SASL/SCRAM-SHA-256` 和 `SASL/SCRAM-SHA-512`。根据流式源（Redpanda、MSK 等）将基于兼容性启用这些认证机制的全部或部分。如果您的身份验证需求不同，请 [提供反馈](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
IAM 身份验证对于 MSK ClickPipe 是一个测试特性。
:::

ClickPipes 支持以下 AWS MSK 身份验证

  - [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 身份验证
  - [IAM 凭证或基于角色的访问](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) 身份验证

在使用 IAM 身份验证连接到 MSK 代理时，IAM 角色必须具备必要的权限。
以下是 MSK 的 Apache Kafka API 所需 IAM 策略示例：

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

#### 配置可信关系 {#configuring-a-trusted-relationship}

如果您使用 IAM 角色 ARN 身份验证 MSK，则需要在 ClickHouse Cloud 实例之间添加可信关系，以便可以假定该角色。

:::note
基于角色的访问仅适用于已部署到 AWS 的 ClickHouse Cloud 实例。
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
ClickPipes for Kafka 支持上传具有 SASL 和公共 SSL/TLS 证书的 Kafka 代理的自定义证书。您可以在 ClickPipe 设置的 SSL 证书部分上传您的证书。
:::note
请注意，虽然我们支持上传单个 SSL 证书和 SASL，但当前不支持带有双向 TLS（mTLS）的 SSL。
:::

## 性能 {#performance}

### 批处理 {#batching}
ClickPipes 以批量形式将数据插入 ClickHouse。这是为了避免在数据库中创建过多的部分，这可能导致集群性能问题。

当满足以下条件之一时，将插入批次：
- 批次大小达到最大大小（100,000 行或 20MB）
- 批次打开最大时间（5 秒）

### 延迟 {#latency}

延迟（定义为 Kafka 消息生成与消息在 ClickHouse 中可用之间的时间）将取决于多个因素（即代理延迟、网络延迟、消息大小/格式）。上面部分描述的 [批处理](#batching) 也会影响延迟。我们始终建议您根据典型负载测试您的具体用例以确定期望的延迟。

ClickPipes 对延迟不提供任何保证。如果您有特定的低延迟要求，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展 {#scaling}

ClickPipes for Kafka 旨在横向扩展。默认情况下，我们创建一个包含一个消费者的消费者组。
通过 ClickPipe 详细视图中的扩展控件可以更改此设置。

ClickPipes 提供高可用性和多个可用区分布式架构。
这要求至少两个消费者进行扩展。

无论运行消费者的数量如何，故障容错都是设计上的可用。
如果消费者或其基础设施失败，ClickPipe 会自动重新启动消费者并继续处理消息。

## 常见问题解答 {#faq}

### 一般问题 {#general}

- **ClickPipes for Kafka 如何工作？**

  ClickPipes 使用专用架构运行 Kafka 消费者 API 从指定主题读取数据，然后将数据插入 ClickHouse 中的特定 ClickHouse Cloud 服务表中。

- **ClickPipes 和 ClickHouse Kafka 表引擎之间有什么区别？**

  Kafka 表引擎是 ClickHouse 的核心能力，实施了 "拉取模型"，其中 ClickHouse 服务器本身连接到 Kafka，拉取事件然后将其写入本地。

  ClickPipes 是一项独立于 ClickHouse 服务的单独云服务，它连接到 Kafka（或其他数据源），并将事件推送到关联的 ClickHouse Cloud 服务。该解耦架构允许更高级的操作灵活性，明确的关注点分离，可扩展数据摄取，优雅的故障管理和更多。

- **使用 ClickPipes for Kafka 的要求是什么？**

  要使用 ClickPipes for Kafka，您需要一个运行的 Kafka 代理和启用了 ClickPipes 的 ClickHouse Cloud 服务。您还需要确保 ClickHouse Cloud 可以访问您的 Kafka 代理。这可以通过在 Kafka 端允许远程连接以及在 Kafka 设置中将 [ClickHouse Cloud 异常 IP 地址](/manage/security/cloud-endpoints-api) 列入白名单来实现。

- **ClickPipes for Kafka 支持 AWS PrivateLink 吗？**

  支持 AWS PrivateLink。如需更多信息，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

- **我可以使用 ClickPipes for Kafka 向 Kafka 主题写入数据吗？**

  不可以，ClickPipes for Kafka 旨在从 Kafka 主题读取数据，而不是向其写入数据。要向 Kafka 主题写入数据，您需要使用专用的 Kafka 生产者。

- **ClickPipes 支持多个代理吗？**

  是的，如果代理是同一法定人数的一部分，可以一起配置，使用 `,` 分隔。

### Upstash {#upstash}

- **ClickPipes 支持 Upstash 吗？**

  是的。Upstash Kafka 产品于 2024 年 9 月 11 日进入弃用周期，为期 6 个月。现有客户可以继续使用 ClickPipes 与他们现有的 Upstash Kafka 代理一起使用，在 ClickPipes 用户界面上使用通用 Kafka 磁贴。现有 Upstash Kafka ClickPipes 在弃用通知之前不受影响。当弃用期结束后，ClickPipe 将停止运作。

- **ClickPipes 支持 Upstash 模式注册表吗？**

  不支持。ClickPipes 不兼容 Upstash Kafka 模式注册表。

- **ClickPipes 支持 Upstash QStash 工作流吗？**

  不支持。除非在 QStash 工作流中引入与 Kafka 兼容的界面，否则将无法与 Kafka ClickPipes 一起工作。

### Azure EventHubs {#azure-eventhubs}

- **Azure Event Hubs ClickPipe 是否在没有 Kafka 接口的情况下工作？**

  不工作。ClickPipes 要求 Azure Event Hubs 启用 Kafka 接口。Kafka 协议仅在他们的标准、高级和专用 SKU 定价层中得到支持。

- **Azure 模式注册表是否可与 ClickPipes 一起使用**

  不支持。ClickPipes 目前不兼容 Event Hubs 模式注册表。

- **我的策略需要什么权限才能从 Azure Event Hubs 消费？**

  要列出主题并消费事件，分配给 ClickPipes 的共享访问策略至少需要 'Listen' 权限。

- **为什么我的 Event Hubs 不返回任何数据？**

 如果您的 ClickHouse 实例位于与 Event Hubs 部署不同的区域或大陆，您在启动 ClickPipes 时可能会遇到超时，并在从 Event Hub 消费数据时遇到更高的延迟。建议将 ClickHouse Cloud 部署和 Azure Event Hubs 部署放置在相近的云区域，以避免不良性能。

- **我应该包括 Azure Event Hubs 的端口号吗？**

  是的。ClickPipes 期望您为 Kafka 接口包括端口号，应该是 `:9093`。

- **ClickPipes IP 仍然与 Azure Event Hubs 相关吗？**

  是的。如果您限制对 Event Hubs 实例的流量，请添加 [文档中的静态 NAT IP](./index.md#list-of-static-ips)。

- **连接字符串是用于 Event Hub，还是用于 Event Hub 名称空间？**

  两者均可，但我们建议使用名称空间级别的共享访问策略，以从多个 Event Hubs 获取示例。
