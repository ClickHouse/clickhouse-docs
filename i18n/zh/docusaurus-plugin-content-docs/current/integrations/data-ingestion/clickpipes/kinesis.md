---
'sidebar_label': 'ClickPipes for Amazon Kinesis'
'description': '无缝连接您的 Amazon Kinesis 数据源到 ClickHouse Cloud。'
'slug': '/integrations/clickpipes/kinesis'
'title': '将 Amazon Kinesis 与 ClickHouse Cloud 集成'
'doc_type': 'guide'
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_kinesis.png';
import cp_step3_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_kinesis.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';


# 将 Amazon Kinesis 与 ClickHouse Cloud 集成
## 前提条件 {#prerequisite}
您已熟悉 [ClickPipes 入门](./index.md) 并已设置 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。请参阅 [Kinesis 基于角色的访问指南](./secure-kinesis.md)，了解如何设置与 ClickHouse Cloud 兼容的角色。

## 创建您的第一个 ClickPipe {#creating-your-first-clickpipe}

1. 访问您的 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮并点击 "Set up a ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择您的数据源。

<Image img={cp_step1} alt="Select data source type" size="lg" border/>

4. 填写表单，为您的 ClickPipe 提供名称、描述（可选）、您的 IAM 角色或凭证及其他连接详情。

<Image img={cp_step2_kinesis} alt="Fill out connection details" size="lg" border/>

5. 选择 Kinesis 数据流和起始偏移量。用户界面将显示所选源（Kafka 主题等）的示例文档。您还可以为 Kinesis 数据流启用增强扇出，以提高 ClickPipe 的性能和稳定性（有关增强扇出的更多信息，请参见 [这里](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)）

<Image img={cp_step3_kinesis} alt="Set data format and topic" size="lg" border/>

6. 在下一步中，您可以选择是将数据导入到新的 ClickHouse 表中，还是重用现有表。按照屏幕中的说明修改您的表名称、模式和设置。您可以在顶部的示例表中实时预览您的更改。

<Image img={cp_step4a} alt="Set table, schema, and settings" size="lg" border/>

  您还可以使用提供的控件自定义高级设置

<Image img={cp_step4a3} alt="Set advanced controls" size="lg" border/>

7. 或者，您可以决定将数据导入现有的 ClickHouse 表。在这种情况下，用户界面将允许您将源中的字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="Use an existing table" size="lg" border/>

8. 最后，您可以为内部 ClickPipes 用户配置权限。

  **权限：** ClickPipes 将为将数据写入目标表创建一个专用用户。您可以使用自定义角色或预定义角色之一选择该内部用户的角色：
    - `Full access`：具有对集群的完全访问权限。如果您使用物化视图或与目标表的字典，这可能会很有用。
    - `Only destination table`：只对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="Permissions" border/>

9. 点击 "Complete Setup" 后，系统将注册您的 ClickPipe，您将能在摘要表中看到它。

<Image img={cp_success} alt="Success notice" size="sm" border/>

<Image img={cp_remove} alt="Remove notice" size="lg" border/>

  摘要表提供了显示源或 ClickHouse 中目标表的示例数据的控件

<Image img={cp_destination} alt="View destination" size="lg" border/>

  以及删除 ClickPipe 和显示导入作业摘要的控件。

<Image img={cp_overview} alt="View overview" size="lg" border/>

10. **恭喜！**您已成功设置您的第一个 ClickPipe。如果这是一个流式 ClickPipe，它将持续运行，实时从您的远程数据源中导入数据。否则，它将批量导入并完成。

## 支持的数据格式 {#supported-data-formats}

支持的格式包括：
- [JSON](../../../interfaces/formats.md/#json)

## 支持的数据类型 {#supported-data-types}

### 标准类型支持 {#standard-types-support}
当前 ClickPipes 支持以下 ClickHouse 数据类型：

- 基本数字类型 - \[U\]Int8/16/32/64，Float32/64 和 BFloat16
- 大整型 - \[U\]Int128/256
- 十进制类型
- 布尔型
- 字符串
- 固定字符串
- 日期、Date32
- 日期时间、DateTime64（仅限 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse LowCardinality 类型
- 使用上述任一类型（包括 Nullable）的键和值的 Map
- 使用上述任一类型（包括 Nullable，限制为一层深度）的 Tuple 和 Array
- SimpleAggregateFunction 类型（用于 AggregatingMergeTree 或 SummingMergeTree 目标）

### 变体类型支持 {#variant-type-support}
您可以为源数据流中的任何 JSON 字段手动指定变体类型（例如 `Variant(String, Int64, DateTime)`）。由于 ClickPipes 确定正确的变体子类型的方法，变体定义中只能使用一个整数或日期时间类型 - 例如，不支持 `Variant(Int64, UInt32)`。

### JSON 类型支持 {#json-type-support}
始终为 JSON 对象的 JSON 字段可以分配给 JSON 目标列。您将必须手动将目标列更改为所需的 JSON 类型，包括任何固定或跳过的路径。 

## Kinesis 虚拟列 {#kinesis-virtual-columns}

以下虚拟列支持 Kinesis 流。在创建新的目标表时，可以使用 `Add Column` 按钮添加虚拟列。

| 名称              | 描述                                                       | 推荐数据类型        |
|-------------------|------------------------------------------------------------|---------------------|
| _key              | Kinesis 分区键                                            | 字符串              |
| _timestamp        | Kinesis 近似到达时间戳（毫秒精度）                        | DateTime64(3)       |
| _stream           | Kinesis 流名称                                            | 字符串              |
| _sequence_number  | Kinesis 序列号                                            | 字符串              |
| _raw_message      | 完整的 Kinesis 消息                                       | 字符串              |

_raw_message 字段可以在仅需要完整的 Kinesis JSON 记录的情况下使用（例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游物化视图）。对于这样的管道，删除所有 "非虚拟" 列可能会提高 ClickPipes 的性能。

## 限制 {#limitations}

- 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。

## 性能 {#performance}

### 批处理 {#batching}
ClickPipes 以批处理方式将数据插入 ClickHouse。这是为了避免在数据库中创建过多的分区片段，这可能导致集群性能问题。

当满足以下任一条件时，批次将被插入：
- 批次大小已达到最大大小（每 1GB 副本内存 100,000 行或 32MB）
- 批次已打开的最长时间（5 秒）

### 延迟 {#latency}

延迟（定义为 Kinesis 消息发送到流与消息在 ClickHouse 中可用之间的时间）将取决于多种因素（即 Kinesis 延迟、网络延迟、消息大小/格式）。上述部分中的 [批处理](#batching) 也会影响延迟。我们始终建议测试您的具体用例，以了解您可以预期的延迟。

如果您有特定的低延迟要求，请 [与我们联系](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展性 {#scaling}

Kinesis 的 ClickPipes 设计为能够水平和垂直扩展。默认情况下，我们创建一个包含一个消费者的消费者组。这可以在 ClickPipe 创建期间进行配置，或在 **设置** -> **高级设置** -> **扩展性** 中的任何其他时刻进行配置。

ClickPipes 提供高可用性，具有可用区分布式架构。
这需要扩展到至少两个消费者。

无论运行的消费者数量如何，故障容限都是凭设计而可用的。
如果消费者或其基础设施出现故障，ClickPipe 将自动重启消费者并继续处理消息。

## 身份验证 {#authentication}

要访问 Amazon Kinesis 流，您可以使用 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。有关如何设置 IAM 角色的更多信息，您可以 [参考此指南](./secure-kinesis.md)，了解如何设置与 ClickHouse Cloud 兼容的角色。
