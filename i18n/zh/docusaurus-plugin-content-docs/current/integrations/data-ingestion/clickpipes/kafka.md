---
sidebar_label: 'ClickPipes与Kafka的集成'
description: '无缝连接您的Kafka数据源到ClickHouse Cloud。'
slug: '/integrations/clickpipes/kafka'
sidebar_position: 1
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


# 将Kafka与ClickHouse Cloud集成
## 先决条件 {#prerequisite}
您已经熟悉了 [ClickPipes介绍](./index.md)。

## 创建您的第一个Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

1. 访问您的ClickHouse Cloud服务的SQL控制台。

<img src={cp_service} alt="ClickPipes服务" />

2. 在左侧菜单中选择 `Data Sources` 按钮，然后点击“设置ClickPipe”。

<img src={cp_step0} alt="选择导入" />

3. 选择您的数据源。

<img src={cp_step1} alt="选择数据源类型" />

4. 填写表单，提供ClickPipe的名称、描述（可选）、凭据及其他连接详细信息。

<img src={cp_step2} alt="填写连接详细信息" />

5. 配置架构注册表。Avro流需要有效的架构，而JSON架构则是可选的。该架构将用于解析 [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent) 或验证选定主题上的JSON消息。
- 无法解析的Avro消息或验证失败的JSON消息将生成错误。
- “根”路径的架构注册表。例如，Confluent Cloud架构注册表URL仅是一个不带路径的HTTPS URL，如 `https://test-kk999.us-east-2.aws.confluent.cloud`。如果只指定根路径，则用于确定第4步中的列名和类型的架构将由嵌入在采样Kafka消息中的id决定。
- 通过数字架构id访问架构文档的路径 `/schemas/ids/[ID]`。使用架构id的完整URL为 `https://registry.example.com/schemas/ids/1000`。
- 通过主题名称访问架构文档的路径 `/subjects/[subject_name]`。可选的，通过在URL后附加 `/versions/[version]` 可以引用特定版本（否则ClickPipes将检索最新版本）。使用架构主题的完整URL为 `https://registry.example.com/subjects/events` 或 `https://registry/example.com/subjects/events/versions/4`。

请注意，在所有情况下，ClickPipes将自动根据消息中嵌入的架构ID从注册表检索更新或不同的架构。如果消息在没有嵌入架构id的情况下写入，则必须指定特定的架构ID或主题以解析所有消息。

6. 选择您的主题，用户界面将显示该主题的示例文档。

<img src={cp_step3} alt="设置数据格式和主题" />

7. 在接下来的步骤中，您可以选择是否将数据摄取到新的ClickHouse表中或重用现有表。按照屏幕中的说明更改表名称、架构和设置。您可以实时预览顶部样本表中的更改。

<img src={cp_step4a} alt="设置表、架构和设置" />

  您还可以使用提供的控件自定义高级设置。

<img src={cp_step4a3} alt="设置高级控件" />

8. 或者，您可以选择将数据摄取到现有的ClickHouse表中。在这种情况下，用户界面将允许您将源字段映射到所选目的表中的ClickHouse字段。

<img src={cp_step4b} alt="使用现有表" />

9. 最后，您可以为内部ClickPipes用户配置权限。

  **权限：** ClickPipes将为写入目的表创建一个专用用户。您可以使用自定义角色或预定义角色之一选择此内部用户的角色：
    - `完全访问`：对集群有完全访问权限。如果您在目的表中使用物化视图或字典，这可能很有用。
    - `仅目的表`：仅对目的表具有 `INSERT` 权限。

<img src={cp_step5} alt="权限" />

10. 点击“完成设置”，系统将注册您的ClickPipe，您将能够在摘要表中看到它。

<img src={cp_success} alt="成功通知" />

<img src={cp_remove} alt="移除通知" />

  摘要表提供控件以显示源表或ClickHouse中的目的表的示例数据。

<img src={cp_destination} alt="查看目的地" />

  以及控件以移除ClickPipe并显示摄取作业的摘要。

<img src={cp_overview} alt="查看概览" />

11. **恭喜！** 您已经成功设置了您的第一个ClickPipe。如果这是一个流式ClickPipe，它将持续运行，从您的远程数据源实时摄取数据。

## 支持的数据源 {#supported-data-sources}

| 名称                 | Logo | 类型     | 状态     | 描述                                                                                              |
|----------------------|------|----------|----------|---------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>| 流式     | 稳定     | 配置ClickPipes并开始从Apache Kafka摄取流数据到ClickHouse Cloud。                               |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>| 流式     | 稳定     | 通过我们的直接集成释放Confluent和ClickHouse Cloud的组合力量。                                 |
| Redpanda             |<img src={redpanda_logo} class="image" alt="Redpanda logo" style={{width: '2.5rem', 'background-color': 'transparent'}}/>| 流式     | 稳定     | 配置ClickPipes并开始从Redpanda摄取流数据到ClickHouse Cloud。                                   |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>| 流式     | 稳定     | 配置ClickPipes并开始从AWS MSK摄取流数据到ClickHouse Cloud。                                   |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>| 流式     | 稳定     | 配置ClickPipes并开始从Azure Event Hubs摄取流数据到ClickHouse Cloud。                          |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>| 流式     | 稳定     | 配置ClickPipes并开始从WarpStream摄取流数据到ClickHouse Cloud。                                 |

更多连接器将加入ClickPipes，您可以通过 [联系](https://clickhouse.com/company/contact?loc=clickpipes) 了解更多。

## 支持的数据格式 {#supported-data-formats}

支持的格式有：
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### 支持的数据类型 {#supported-data-types}

当前ClickPipes支持以下ClickHouse数据类型：

- 基本数字类型 - \[U\]Int8/16/32/64 和 Float32/64
- 大整数类型 - \[U\]Int128/256
- 十进制类型
- 布尔值
- 字符串
- 固定字符串
- 日期，Date32
- 日期时间，DateTime64（仅限UTC时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有ClickHouse的LowCardinality类型
- 具有上述任何类型（包括Nullable）键值的Map
- 具有上述任何类型（包括Nullable，深度仅限一层）元素的Tuple和Array

### Avro {#avro}
#### 支持的Avro数据类型 {#supported-avro-data-types}

ClickPipes支持所有Avro原始和复杂类型，以及除了 `time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp_micros` 和 `duration` 的所有Avro逻辑类型。Avro `record` 类型转换为Tuple，`array` 类型转换为Array，`map` 转换为Map（仅限字符串键）。一般而言，列出的转换 [此处](/interfaces/formats/Avro#data-types-matching) 是可用的。我们建议对Avro数字类型使用精确的类型匹配，因为ClickPipes不会检查类型转换时的溢出或精度损失。

#### Nullable类型和Avro联合 {#nullable-types-and-avro-unions}

Avro中的Nullable类型是通过使用 `(T, null)` 或 `(null, T)` 的联合架构来定义，其中T是基本Avro类型。在架构推断期间，这种联合将映射到ClickHouse的“Nullable”列。请注意，ClickHouse不支持
`Nullable(Array)`、`Nullable(Map)` 或 `Nullable(Tuple)` 类型。这些类型的Avro null联合将映射为非Nullable版本（Avro Record类型映射为ClickHouse命名的Tuple）。对于这些类型的Avro "null"，将插入为：
- 对于null的Avro数组，插入一个空Array
- 对于null的Avro Map，插入一个空Map
- 对于null的Avro Record，插入一个带有所有默认/零值的命名Tuple

ClickPipes目前不支持包含其他Avro联合的架构（随着新ClickHouse Variant和JSON数据类型的成熟，这种情况可能会改变）。如果Avro架构包含“非null”联合，则ClickPipes在尝试计算Avro架构与Clickhouse列类型之间的映射时会生成错误。

#### Avro架构管理 {#avro-schema-management}

ClickPipes通过使用每个消息/事件中嵌入的架构ID动态检索和应用Avro架构。架构更新会被自动检测和处理。

目前ClickPipes仅与使用 [Confluent Schema Registry API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html) 的架构注册表兼容。除了Confluent Kafka和Cloud，这还包括Redpanda、AWS MSK和Upstash架构注册表。ClickPipes目前与AWS Glue架构注册表或Azure架构注册表不兼容（即将推出）。

以下规则适用于检索的Avro架构与ClickHouse目的表之间的映射：
- 如果Avro架构包含未包含在ClickHouse目的映射中的字段，则该字段将被忽略。
- 如果Avro架构缺少在ClickHouse目的映射中定义的字段，则ClickHouse列将填充为“零”值，例如0或空字符串。请注意，ClickPipes插入时当前不评估 [DEFAULT](/sql-reference/statements/create/table#default) 表达式（这是针对ClickHouse服务器默认处理更新的临时限制）。
- 如果Avro架构字段与ClickHouse列不兼容，则该行/消息的插入将失败，并且该失败将记录在ClickPipes错误表中。请注意，支持几种隐式转换（例如，数字类型之间），但并非所有（例如，Avro `record` 字段无法插入 `Int32` ClickHouse列）。

## Kafka虚拟列 {#kafka-virtual-columns}

以下虚拟列支持Kafka兼容的流数据源。在创建新的目的表时，可以使用 `Add Column` 按钮添加虚拟列。

| 名称           | 描述                                         | 推荐的数据类型   |
|----------------|----------------------------------------------|------------------|
| _key           | Kafka消息键                                 | 字符串           |
| _timestamp     | Kafka时间戳（毫秒精度）                     | DateTime64(3)    |
| _partition     | Kafka分区                                   | Int32            |
| _offset        | Kafka偏移量                                 | Int64            |
| _topic         | Kafka主题                                   | 字符串           |
| _header_keys   | 记录头中的键的并行数组                      | Array(字符串)    |
| _header_values | 记录头中的头的并行数组                      | Array(字符串)    |
| _raw_message   | 完整Kafka消息                               | 字符串           |

请注意，_raw_message 列仅建议用于JSON数据。在仅需要JSON字符串的用例中（例如使用ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游的物化视图），删除所有“非虚拟”列可能会提高ClickPipes性能。

## 限制 {#limitations}

- 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。

## 交付语义 {#delivery-semantics}
ClickPipes为Kafka提供` 至少一次 `的交付语义（作为最常用的方法之一）。我们很想听到您对交付语义的反馈 [联系表单](https://clickhouse.com/company/contact?loc=clickpipes)。如果您需要精确一次的语义，我们建议使用我们的官方 [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) 接收器。

## 认证 {#authentication}
对于Apache Kafka协议数据源，ClickPipes支持带TLS加密的[SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html)认证，以及 `SASL/SCRAM-SHA-256` 和 `SASL/SCRAM-SHA-512`。根据流源（Redpanda、MSK等），将根据兼容性启用所有或其中的一部分身份验证机制。如果您的身份验证需求不同，请 [给我们反馈](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
MSK ClickPipe的IAM身份验证是一个Beta特性。
:::

ClickPipes支持以下AWS MSK身份验证：

  - [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 认证
  - [IAM凭证或基于角色的访问](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) 认证

使用IAM身份验证连接到MSK代理时，IAM角色必须具有必要的权限。
以下是Apache Kafka API的MSK所需的IAM策略示例：

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

#### 配置受信任的关系 {#configuring-a-trusted-relationship}

如果您使用IAM角色ARN进行MSK身份验证，则需要在您的ClickHouse Cloud实例之间添加受信任的关系，以便能够被假定。

:::note
基于角色的访问仅适用于部署到AWS的ClickHouse Cloud实例。
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
ClickPipes为Kafka支持上传用于带SASL的Kafka代理的自定义证书和公共SSL/TLS证书。您可以在ClickPipe设置的SSL证书部分上传您的证书。
:::note
请注意，虽然我们支持上传单个SSL证书以及SASL用于Kafka，但目前不支持带有双向TLS(mTLS)的SSL。
:::

## 性能 {#performance}

### 批处理 {#batching}
ClickPipes以批量方式将数据插入ClickHouse。这是为了避免在数据库中创建过多的部分，从而导致集群性能问题。

当满足以下条件之一时，将插入批处理：
- 批处理大小已达到最大大小（100,000行或20MB）
- 批处理已打开的最大时间（5秒）

### 延迟 {#latency}

延迟（定义为Kafka消息被生产和该消息在ClickHouse中可用之间的时间）将取决于多个因素（例如代理延迟、网络延迟、消息大小/格式）。上述部分的 [批处理](#batching) 也将影响延迟。我们始终建议使用典型负载测试您的特定用例，以确定预期的延迟。

ClickPipes不提供有关延迟的任何保证。如果您有具体的低延迟要求，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展性 {#scaling}

ClickPipes为Kafka设计为水平扩展。默认情况下，我们创建一个消费者组，其中包含一个消费者。
您可以在ClickPipe详情视图中的扩展控制中更改此设置。

ClickPipes提供高可用性和可分布的可用性区域架构。
这需要至少两个消费者进行扩展。

无论运行多少消费者，故障容忍都是设计上的要求。
如果消费者或其底层基础设施失败，
ClickPipe将自动重新启动消费者并继续处理消息。

## 常见问题 {#faq}

### 一般 {#general}

- **ClickPipes for Kafka是如何工作的？**

  ClickPipes使用专用架构运行Kafka消费者API以从指定主题读取数据，然后将数据插入ClickHouse Cloud服务上的ClickHouse表中。

- **ClickPipes与ClickHouse Kafka表引擎有什么区别？**

  Kafka表引擎是ClickHouse核心能力，实现了“拉取模型”，其中ClickHouse服务器本身连接到Kafka，拉取事件然后将其写入本地。

  ClickPipes是一个独立的云服务，与ClickHouse服务独立运行，它连接到Kafka（或其他数据源）并将事件推送到关联的ClickHouse Cloud服务。这个解耦架构允许更优秀的操作灵活性、关注点的清晰分离、可扩展的摄取、优雅的故障管理、可扩展性等。

- **使用ClickPipes for Kafka有哪些要求？**

  为了使用ClickPipes for Kafka，您需要一个正在运行的Kafka代理和启用ClickPipes的ClickHouse Cloud服务。您还需要确保ClickHouse Cloud可以访问您的Kafka代理。这可以通过允许Kafka侧的远程连接，和在Kafka设置中将 [ClickHouse Cloud出站IP地址](/manage/security/cloud-endpoints-api) 列入白名单来实现。

- **ClickPipes for Kafka支持AWS PrivateLink吗？**

  AWS PrivateLink是支持的。请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes) 以获取更多信息。

- **我可以使用ClickPipes for Kafka写入数据到Kafka主题吗？**

  不可以，ClickPipes for Kafka旨在从Kafka主题读取数据，而不是将数据写入Kafka主题。要写入数据到Kafka主题，您需要使用专用的Kafka生产者。

- **ClickPipes支持多个代理吗？**

  是的，如果代理是同一法定人数的一部分，则可以将它们配置在一起，用 `,` 分隔。

### Upstash {#upstash}

- **ClickPipes支持Upstash吗？**

  是的。Upstash Kafka产品于2024年9月11日进入为期6个月的弃用期。现有客户可以继续使用ClickPipes与其现有的Upstash Kafka代理，使用ClickPipes用户界面上的通用Kafka选项卡。在弃用通知之前，现有的Upstash Kafka ClickPipes不受影响。当弃用期结束时，ClickPipe将停止工作。

- **ClickPipes支持Upstash架构注册表吗？**

  不支持。ClickPipes不兼容Upstash Kafka架构注册表。

- **ClickPipes支持Upstash QStash工作流吗？**

  不支持。除非在QStash工作流中引入Kafka兼容的表面，否则它将无法与Kafka ClickPipes协同工作。

### Azure EventHubs {#azure-eventhubs}

- **Azure Event Hubs ClickPipe在没有Kafka表面的情况下工作吗？**

  不可以。ClickPipes要求Azure Event Hubs启用Kafka表面。Kafka协议仅在其标准、专业和专用SKU定价层上受支持。

- **Azure架构注册表与ClickPipes兼容吗？**

  不。不支持ClickPipes当前与Event Hubs架构注册表相兼容。

- **我的策略需要什么权限才能从Azure Event Hubs消费？**

  要列出主题和消费事件，分配给ClickPipes的共享访问策略至少需要一个“收听”声明。

- **为什么我的Event Hubs没有返回任何数据？**

 如果您的ClickHouse实例位于与您的Event Hubs部署不同的区域或大陆，您在装载ClickPipes时可能会遇到超时，更高延迟在从Event Hub消费数据时也可能出现。将ClickHouse Cloud部署和Azure Event Hubs部署位于相互靠近的云区域被视为最佳实践，以避免不利性能。

- **我应该包括Azure Event Hubs的端口号吗？**

  应该。ClickPipes希望您为Kafka表面包含端口号，应为 `:9093`。

- **ClickPipes IP地址对Azure Event Hubs仍然相关吗？**

  是的。如果您限制对Event Hubs实例的流量，请添加 [文档中列出的静态NAT IP](./index.md#list-of-static-ips)。

- **连接字符串是为Event Hub，还是为Event Hub命名空间？**

  两者都可以工作，但是我们建议使用命名空间级别的共享访问策略以从多个Event Hubs中检索样本。

