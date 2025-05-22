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

1. 访问您的 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes 服务" size="md" border/>

2. 在左侧菜单中选择 `数据源` 按钮，然后点击 “设置 ClickPipe”

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择您的数据源。

<Image img={cp_step1} alt="选择数据源类型" size="lg" border/>

4. 填写表单，为您的 ClickPipe 提供名称、描述（可选）、凭据和其他连接细节。

<Image img={cp_step2} alt="填写连接细节" size="lg" border/>

5. 配置模式注册表。对 Avro 流需要有效的模式，JSON 为可选。此模式将用于解析 [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent) 或验证所选主题上的 JSON 消息。
- 无法解析的 Avro 消息或验证失败的 JSON 消息将生成错误。
- 模式注册表的“根”路径。例如，Confluent Cloud 模式注册表的 URL 仅为没有路径的 HTTPS URL，例如 `https://test-kk999.us-east-2.aws.confluent.cloud` 如果仅指定根路径，将根据采样的 Kafka 消息中嵌入的 ID 确定步骤 4 中用于确定列名和类型的模式。
- 通过数值模式 ID 指向模式文档的路径 `/schemas/ids/[ID]`。使用模式 ID 的完整 URL 为 `https://registry.example.com/schemas/ids/1000`
- 通过主题名称指向模式文档的路径 `/subjects/[subject_name]`。可选地，可以通过在 URL 后面附加 `/versions/[version]` 来引用特定版本（否则 ClickPipes 将获取最新版本）。 使用模式主题的完整 URL 为 `https://registry.example.com/subjects/events` 或 `https://registry/example.com/subjects/events/versions/4`

请注意，在所有情况下，如果消息中嵌入的模式 ID 表示更新或不同的模式，ClickPipes 将自动从注册表检索。 如果消息被写入而没有嵌入模式 ID，则必须指定特定的模式 ID 或主题以解析所有消息。

6. 选择您的主题，用户界面将显示主题中的示例文档。

<Image img={cp_step3} alt="设置数据格式和主题" size="lg" border/>

7. 在下一步中，您可以选择是否将数据导入到新的 ClickHouse 表中，或重用现有的表。按照屏幕上的说明修改您的表名、模式和设置。您可以在顶部的示例表中实时预览您的更改。

<Image img={cp_step4a} alt="设置表、模式和设置" size="lg" border/>

  您还可以使用提供的控件自定义高级设置。

<Image img={cp_step4a3} alt="设置高级控件" size="lg" border/>

8. 或者，您可以决定将数据导入到现有的 ClickHouse 表中。在这种情况下，用户界面将允许您将字段从源映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="使用现有表" size="lg" border/>

9. 最后，您可以为内部 ClickPipes 用户配置权限。

  **权限：** ClickPipes 将为将数据写入目标表创建一个专用用户。您可以使用自定义角色或预定义角色之一为此内部用户选择角色：
    - `完全访问`：具有对集群的完全访问权限。如果您使用目标表的物化视图或字典，这可能会很有用。
    - `仅目标表`：仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="权限" size="lg" border/>

10. 点击“完成设置”，系统将注册您的 ClickPipe，您将能够在摘要表中看到它列出。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="移除通知" size="lg" border/>

  摘要表提供控件，用于显示来自源或 ClickHouse 中目标表的示例数据。

<Image img={cp_destination} alt="查看目标" size="lg" border/>

  以及移除 ClickPipe 和显示导入作业摘要的控件。

<Image img={cp_overview} alt="查看概览" size="lg" border/>

11. **恭喜！** 您已经成功设置了您的第一个 ClickPipe。如果这是一个流式 ClickPipe，它将持续运行，实时从您的远程数据源收集数据。

## 支持的数据源 {#supported-data-sources}

| 名称                | Logo | 类型     | 状态           | 描述                                                                                       |
|---------------------|------|----------|----------------|--------------------------------------------------------------------------------------------|
| Apache Kafka        | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/> | 流式     | 稳定            | 配置 ClickPipes，并开始将流数据从 Apache Kafka 导入 ClickHouse Cloud。                     |
| Confluent Cloud     | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/> | 流式     | 稳定            | 通过我们的直接集成释放 Confluent 和 ClickHouse Cloud 的结合力量。                       |
| Redpanda            | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/> | 流式     | 稳定            | 配置 ClickPipes，并开始将流数据从 Redpanda 导入 ClickHouse Cloud。                       |
| AWS MSK             | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/> | 流式     | 稳定            | 配置 ClickPipes，并开始将流数据从 AWS MSK 导入 ClickHouse Cloud。                        |
| Azure Event Hubs    | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/> | 流式     | 稳定            | 配置 ClickPipes，并开始将流数据从 Azure Event Hubs 导入 ClickHouse Cloud。              |
| WarpStream          | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/> | 流式     | 稳定            | 配置 ClickPipes，并开始将流数据从 WarpStream 导入 ClickHouse Cloud。                    |

更多连接器将添加到 ClickPipes，您可以通过 [与我们联系](https://clickhouse.com/company/contact?loc=clickpipes) 了解更多信息。

## 支持的数据格式 {#supported-data-formats}

支持的格式包括：
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### 支持的数据类型 {#supported-data-types}

当前 ClickPipes 支持以下 ClickHouse 数据类型：

- 基本数值类型 - \[U\]Int8/16/32/64 和 Float32/64
- 大整数类型 - \[U\]Int128/256
- 小数类型
- 布尔类型
- 字符串
- FixedString
- 日期，Date32
- DateTime，DateTime64（仅适用于 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse LowCardinality 类型
- 包含以上任何类型（包括 Nullable）的 Map，键和值
- 使用以上任何类型（包括 Nullable，只有一级深度）的 Tuple 和 Array

### Avro {#avro}
#### 支持的 Avro 数据类型 {#supported-avro-data-types}

ClickPipes 支持所有 Avro 原始和复杂类型，以及所有 Avro 逻辑类型，除了 `time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros` 和 `duration`。 Avro `record` 类型转换为 Tuple，`array` 类型转换为 Array，`map` 转换为 Map（仅字符串键）。一般来说，这里列出的转换 [这里](/interfaces/formats/Avro#data-types-matching) 是可用的。我们建议对 Avro 数值类型使用精确类型匹配，因为 ClickPipes 在类型转换时不检查溢出或精度丧失。

#### Nullable 类型和 Avro 联合 {#nullable-types-and-avro-unions}

Avro 中的 Nullable 类型通过使用 `(T, null)` 或 `(null, T)` 的联合模式来定义，其中 T 是基本的 Avro 类型。在模式推断期间，这样的联合将映射到 ClickHouse 的 "Nullable" 列。请注意，ClickHouse 不支持 `Nullable(Array)`、`Nullable(Map)` 或 `Nullable(Tuple)` 类型。这些类型的 Avro null 联合将映射为非 Nullable 版本（Avro Record 类型映射到 ClickHouse 命名 Tuple）。对于这些类型的 Avro "null"，将插入为：
- 一个空 Array，用于 null Avro 数组
- 一个空 Map，用于 null Avro Map
- 一个命名 Tuple，所有默认/零值用于 null Avro Record

ClickPipes 目前不支持包含其他 Avro 联合的模式（这是由于新的 ClickHouse Variant 和 JSON 数据类型的成熟可能会有所改变）。如果 Avro 模式包含 "非空" 联合，ClickPipes 在尝试计算 Avro 模式与 ClickHouse 列类型之间的映射时将生成错误。

#### Avro 模式管理 {#avro-schema-management}

ClickPipes 动态检索并应用来自配置的模式注册表的 Avro 模式，使用嵌入在每个消息/事件中的模式 ID。模式更新会被自动检测和处理。

目前 ClickPipes 仅与使用 [Confluent Schema Registry API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html) 的模式注册表兼容。除了 Confluent Kafka 和 Cloud，这包括 Redpanda、AWS MSK 和 Upstash 模式注册表。ClickPipes 目前与 AWS Glue 模式注册表或 Azure 模式注册表不兼容（即将推出）。

应用以下规则将检索的 Avro 模式映射到 ClickHouse 目标表：
- 如果 Avro 模式包含 ClickHouse 目标映射中未包含的字段，则该字段将被忽略。
- 如果 Avro 模式缺少 ClickHouse 目标映射中定义的字段，ClickHouse 列将填充为 "零" 值，例如 0 或空字符串。请注意，目前 [DEFAULT](/sql-reference/statements/create/table#default) 表达式对于 ClickPipes 插入未被评估（这是一个暂时的限制，待更新 ClickHouse 服务器默认处理）。
- 如果 Avro 模式字段和 ClickHouse 列不兼容，该行/消息的插入将失败，失败将记录在 ClickPipes 错误表中。请注意，支持若干隐式转换（如数值类型之间），但并非所有（例如，Avro `record` 字段无法插入到 `Int32` ClickHouse 列中）。

## Kafka 虚拟列 {#kafka-virtual-columns}

支持以下虚拟列，适用于 Kafka 兼容的流数据源。在创建新目标表时，可以通过使用 `添加列` 按钮添加虚拟列。

| 名称           | 描述                                     | 建议数据类型         |
|----------------|------------------------------------------|---------------------|
| _key           | Kafka 消息键                            | 字符串               |
| _timestamp     | Kafka 时间戳（毫秒精度）                | DateTime64(3)       |
| _partition     | Kafka 分区                              | Int32               |
| _offset        | Kafka 偏移                              | Int64               |
| _topic         | Kafka 主题                              | 字符串               |
| _header_keys   | 记录 Header 中的密钥并行数组            | Array(String)       |
| _header_values | 记录 Header 中的 Header 的并行数组      | Array(String)       |
| _raw_message   | 完整 Kafka 消息                         | 字符串               |

请注意，_raw_message 列仅建议用于 JSON 数据。在仅需要 JSON 字符串的用例中（例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游物化视图），删除所有“非虚拟”列有可能提高 ClickPipes 性能。

## 限制 {#limitations}

- 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。

## 交付语义 {#delivery-semantics}
ClickPipes for Kafka 提供 `至少一次` 的交付语义（作为最常用的方法之一）。我们希望听到您对交付语义的反馈 [联系表单](https://clickhouse.com/company/contact?loc=clickpipes)。如果您需要确切一次语义，我们建议使用我们的官方 [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) 接收器。

## 身份验证 {#authentication}
对于 Apache Kafka 协议数据源，ClickPipes 支持 [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 认证与 TLS 加密，以及 `SASL/SCRAM-SHA-256` 和 `SASL/SCRAM-SHA-512`。根据流源（Redpanda、MSK 等）将启用所有或部分这些认证机制。如果您的认证需求有所不同，请 [反馈给我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
用于 MSK ClickPipe 的 IAM 身份验证是一个测试功能。
:::

ClickPipes 支持以下 AWS MSK 身份验证

  - [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 身份验证
  - [IAM 凭据或基于角色的访问](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) 身份验证

使用 IAM 身份验证连接到 MSK broker 时，IAM 角色必须具有必要的权限。
以下是 Apache Kafka APIs for MSK 的所需 IAM 策略示例：

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

如果您使用 IAM 角色 ARN 进行 MSK 身份验证，则您需要在 ClickHouse Cloud 实例之间添加可信关系，以便可以承担该角色。

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
ClickPipes for Kafka 支持为 Kafka brokers 上传自定义证书，使用 SASL 和公共 SSL/TLS 证书。您可以在 ClickPipe 设置的 SSL 证书部分上传您的证书。
:::note
请注意，虽然我们支持与 SASL 一起上传单个 SSL 证书，但目前不支持 SSL 与互操作式 TLS (mTLS)。
:::

## 性能 {#performance}

### 批处理 {#batching}
ClickPipes 将数据以批处理的方式插入 ClickHouse。这是为了避免在数据库中创建过多部分，从而可能导致集群的性能问题。

在满足以下任一标准时，将插入批次：
- 批次大小已达到最大大小（100,000 行或 20MB）
- 批次已开启最大时间（5秒）

### 延迟 {#latency}

延迟（定义为 Kafka 消息被产生和消息在 ClickHouse 中可用之间的时间）将取决于许多因素（即 broker 延迟、网络延迟、消息大小/格式）。上述部分 [batching](#batching) 也会影响延迟。我们始终建议针对特定用例进行典型负载测试，以确定预期延迟。

ClickPipes 并未提供任何有关延迟的保证。如果您有特定的低延迟要求，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展 {#scaling}

ClickPipes for Kafka 设计为横向扩展。默认情况下，我们创建一个包含一个消费者的消费者组。
可以通过 ClickPipe 详细视图中的扩展控件进行更改。

ClickPipes 提供高可用性的可用区分布架构。
这要求至少扩展到两个消费者。

无论运行消费者的数量，故障容忍都是设计使然。
如果消费者或其底层基础设施出现故障，
ClickPipe 将自动重启消费者并继续处理消息。

## 常见问题解答 {#faq}

### 一般 {#general}

- **ClickPipes for Kafka 如何工作？**

  ClickPipes 使用专用架构运行 Kafka Consumer API，从指定主题读取数据，然后将数据插入特定 ClickHouse Cloud 服务的 ClickHouse 表中。

- **ClickPipes 和 ClickHouse Kafka 表引擎之间有什么区别？**

  Kafka 表引擎是 ClickHouse 核心能力之一，实施“拉取模型”，即 ClickHouse 服务器自身连接到 Kafka，拉取事件并将其写入本地。

  ClickPipes 是一个独立于 ClickHouse 服务运行的单独云服务，它连接到 Kafka（或其他数据源）并将事件推送到关联的 ClickHouse Cloud 服务。 这种解耦的架构提供了卓越的操作灵活性、关注点的清晰分离、可扩展的摄取、优雅的故障管理、可扩展性等。

- **使用 ClickPipes for Kafka 的要求是什么？**

  要使用 ClickPipes for Kafka，您需要运行中的 Kafka broker 和已启用 ClickPipes 的 ClickHouse Cloud 服务。您还需要确保 ClickHouse Cloud 可以访问您的 Kafka broker。这可以通过允许 Kafka 侧的远程连接来实现，在您的 Kafka 设置中白名单 [ClickHouse Cloud 出口 IP 地址](/manage/security/cloud-endpoints-api)。

- **ClickPipes for Kafka 是否支持 AWS PrivateLink？**

  支持 AWS PrivateLink。有关更多信息，请 [与我们联系](https://clickhouse.com/company/contact?loc=clickpipes)。

- **我可以使用 ClickPipes for Kafka 将数据写入 Kafka 主题吗？**

  不可以，ClickPipes for Kafka 设计用于从 Kafka 主题读取数据，而不是将数据写入其中。要将数据写入 Kafka 主题，您需要使用专用的 Kafka producer。

- **ClickPipes 是否支持多个 broker？**

  是的，如果 brokers 是同一法定人数的一部分，它们可以一起配置，并用 `,` 进行分隔。

### Upstash {#upstash}

- **ClickPipes 是否支持 Upstash？**

  是的。Upstash Kafka 产品于2024年9月11日进入弃用期，持续6个月。现有客户可以在 ClickPipes 用户界面上继续使用其现有 Upstash Kafka brokers，使用通用的 Kafka 磁贴。现有的 Upstash Kafka ClickPipes 在弃用通知前不受影响。当弃用期结束后，ClickPipe 将停止运行。

- **ClickPipes 是否支持 Upstash 模式注册表？**

  不支持。ClickPipes 不兼容 Upstash Kafka 模式注册表。

- **ClickPipes 是否支持 Upstash QStash 工作流？**

  不支持。除非在 QStash 工作流中引入 Kafka 兼容接口，否则它将无法与 Kafka ClickPipes 配合使用。

### Azure EventHubs {#azure-eventhubs}

- **Azure Event Hubs ClickPipe 是否在没有 Kafka 接口的情况下工作？**

  不可以。ClickPipes 要求 Azure Event Hubs 启用 Kafka 接口。 Kafka 协议仅支持他们的标准、优质和专用 SKU 定价层。

- **Azure 模式注册表是否与 ClickPipes 兼容？**

  不支持。ClickPipes 当前不兼容 Event Hubs 模式注册表。

- **我需要哪些权限才能从 Azure Event Hubs 获取数据？**

  要列出主题并消费事件，赋予 ClickPipes 的共享访问策略最少需要“监听”声明。

- **为什么我的 Event Hubs 没有返回任何数据？**

 如果您的 ClickHouse 实例位于与您的 Event Hubs 部署不同的区域或大陆，则在对 ClickPipes 进行入职时，您可能会经历超时，并且在从 Event Hub 消费数据时延迟更高。为了避免不利性能，最好将您的 ClickHouse Cloud 部署和 Azure Event Hubs 部署放置在地理位置接近的云区域。

- **我应该为 Azure Event Hubs 包含端口号吗？**

  是的。 ClickPipes 期望您为 Kafka 接口包含端口号，应为 `:9093`。

- **ClickPipes IP 仍然与 Azure Event Hubs 相关吗？**

  是的。如果您限制对 Event Hubs 实例的流量，请添加 [已记录的静态 NAT IP](./index.md#list-of-static-ips)。

- **连接字符串是针对 Event Hub，还是针对 Event Hub 命名空间的？**

  两者都可以工作，但是我们建议在命名空间级别使用共享访问策略，以从多个 Event Hubs 检索示例。
