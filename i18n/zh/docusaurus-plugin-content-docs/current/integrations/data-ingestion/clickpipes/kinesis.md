---
sidebar_label: '适用于 Amazon Kinesis 的 ClickPipes'
description: '将 Amazon Kinesis 数据源无缝接入 ClickHouse Cloud。'
slug: /integrations/clickpipes/kinesis
title: '将 Amazon Kinesis 与 ClickHouse Cloud 集成'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
keywords: ['clickpipes', 'kinesis', 'streaming', 'aws', 'data ingestion']
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

您需要先熟悉 [ClickPipes 简介](./index.md)，并配置好 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。有关如何配置适用于 ClickHouse Cloud 的角色，请参阅 [Kinesis 基于角色的访问指南](./secure-kinesis.md)。


## 创建您的第一个 ClickPipe {#creating-your-first-clickpipe}

1. 访问您的 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt='ClickPipes 服务' size='lg' border />

2. 在左侧菜单中选择 `Data Sources` 按钮,然后点击 "Set up a ClickPipe"

<Image img={cp_step0} alt='选择导入' size='lg' border />

3. 选择您的数据源。

<Image img={cp_step1} alt='选择数据源类型' size='lg' border />

4. 填写表单,为您的 ClickPipe 提供名称、描述(可选)、IAM 角色或凭证以及其他连接详细信息。

<Image
  img={cp_step2_kinesis}
  alt='填写连接详细信息'
  size='lg'
  border
/>

5. 选择 Kinesis Stream 和起始偏移量。界面将显示来自所选源(Kafka 主题等)的示例文档。您还可以为 Kinesis 流启用增强扇出(Enhanced Fan-out)以提高 ClickPipe 的性能和稳定性(有关增强扇出的更多信息可以在[此处](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)找到)

<Image
  img={cp_step3_kinesis}
  alt='设置数据格式和主题'
  size='lg'
  border
/>

6. 在下一步中,您可以选择是将数据导入到新的 ClickHouse 表中还是重用现有表。按照屏幕上的说明修改表名称、架构和设置。您可以在顶部的示例表中实时预览您的更改。

<Image img={cp_step4a} alt='设置表、架构和设置' size='lg' border />

您还可以使用提供的控件自定义高级设置

<Image img={cp_step4a3} alt='设置高级控件' size='lg' border />

7. 或者,您可以选择将数据导入到现有的 ClickHouse 表中。在这种情况下,界面将允许您将源字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt='使用现有表' size='lg' border />

8. 最后,您可以为内部 ClickPipes 用户配置权限。

   **权限:** ClickPipes 将创建一个专用用户用于向目标表写入数据。您可以使用自定义角色或预定义角色之一为此内部用户选择角色:
   - `Full access`:具有对集群的完全访问权限。如果您在目标表中使用物化视图或字典,这可能会很有用。
   - `Only destination table`:仅具有对目标表的 `INSERT` 权限。

<Image img={cp_step5} alt='权限' border />

9. 点击 "Complete Setup" 后,系统将注册您的 ClickPipe,您将能够在摘要表中看到它。

<Image img={cp_success} alt='成功通知' size='sm' border />

<Image img={cp_remove} alt='删除通知' size='lg' border />

摘要表提供了控件,用于显示来自源或 ClickHouse 中目标表的示例数据

<Image img={cp_destination} alt='查看目标' size='lg' border />

以及用于删除 ClickPipe 和显示导入作业摘要的控件。

<Image img={cp_overview} alt='查看概览' size='lg' border />

10. **恭喜!** 您已成功设置第一个 ClickPipe。如果这是一个流式 ClickPipe,它将持续运行,从远程数据源实时导入数据。否则,它将导入批次数据并完成。


## 支持的数据格式 {#supported-data-formats}

支持的格式包括:

- [JSON](/interfaces/formats/JSON)


## 支持的数据类型 {#supported-data-types}

### 标准类型支持 {#standard-types-support}

ClickPipes 目前支持以下 ClickHouse 数据类型:

- 基础数值类型 - \[U\]Int8/16/32/64、Float32/64 和 BFloat16
- 大整数类型 - \[U\]Int128/256
- Decimal 类型
- Boolean
- String
- FixedString
- Date、Date32
- DateTime、DateTime64(仅支持 UTC 时区)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse LowCardinality 类型
- Map,其键和值可使用上述任意类型(包括 Nullable 类型)
- Tuple 和 Array,其元素可使用上述任意类型(包括 Nullable 类型,仅支持一层深度)
- SimpleAggregateFunction 类型(用于 AggregatingMergeTree 或 SummingMergeTree 目标表)

### Variant 类型支持 {#variant-type-support}

您可以为源数据流中的任何 JSON 字段手动指定 Variant 类型(例如 `Variant(String, Int64, DateTime)`)。由于 ClickPipes 确定正确 Variant 子类型的方式,Variant 定义中只能使用一种整数类型或一种日期时间类型 - 例如,不支持 `Variant(Int64, UInt32)`。

### JSON 类型支持 {#json-type-support}

始终为 JSON 对象的 JSON 字段可以分配给 JSON 目标列。您需要手动将目标列更改为所需的 JSON 类型,包括任何固定路径或跳过路径。


## Kinesis 虚拟列 {#kinesis-virtual-columns}

Kinesis 流支持以下虚拟列。在创建新的目标表时,可以使用 `Add Column` 按钮添加虚拟列。

| 名称              | 描述                                                   | 推荐数据类型 |
| ----------------- | ----------------------------------------------------- | ----------- |
| \_key             | Kinesis 分区键                                         | String      |
| \_timestamp       | Kinesis 近似到达时间戳(毫秒精度)                        | DateTime64(3) |
| \_stream          | Kinesis 流名称                                         | String      |
| \_sequence_number | Kinesis 序列号                                         | String      |
| \_raw_message     | 完整的 Kinesis 消息                                    | String      |

\_raw_message 字段可用于仅需要完整 Kinesis JSON 记录的场景(例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数来填充下游物化视图)。对于此类管道,删除所有"非虚拟"列可能会提升 ClickPipes 性能。


## 限制 {#limitations}

- 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。


## 性能 {#performance}

### 批处理 {#batching}

ClickPipes 以批处理方式将数据插入 ClickHouse。这样做是为了避免在数据库中创建过多的数据部分(parts),从而导致集群出现性能问题。

当满足以下任一条件时,批次将被插入:

- 批次大小已达到最大值(每 1GB 副本内存对应 100,000 行或 32MB)
- 批次已打开的时间达到最大值(5 秒)

### 延迟 {#latency}

延迟(定义为从 Kinesis 消息发送到流到消息在 ClickHouse 中可用之间的时间)取决于多个因素(例如 Kinesis 延迟、网络延迟、消息大小/格式)。上述章节中描述的[批处理](#batching)也会影响延迟。我们始终建议针对您的特定用例进行测试,以了解可以预期的延迟。

如果您有特定的低延迟要求,请[联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展 {#scaling}

ClickPipes for Kinesis 设计为可水平和垂直扩展。默认情况下,我们创建一个包含单个消费者的消费者组。这可以在创建 ClickPipe 期间进行配置,也可以在任何其他时间点通过 **Settings** -> **Advanced Settings** -> **Scaling** 进行配置。

ClickPipes 通过可用区分布式架构提供高可用性。
这需要扩展到至少两个消费者。

无论运行的消费者数量如何,容错能力在设计上都是可用的。
如果消费者或其底层基础设施发生故障,
ClickPipe 将自动重启消费者并继续处理消息。


## 身份验证 {#authentication}

要访问 Amazon Kinesis 数据流,可以使用 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。有关如何配置 IAM 角色的更多详细信息,请[参阅本指南](./secure-kinesis.md)了解如何配置适用于 ClickHouse Cloud 的角色。
