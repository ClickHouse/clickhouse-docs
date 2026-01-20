---
sidebar_label: '适用于 Amazon Kinesis 的 ClickPipes'
description: '将 Amazon Kinesis 数据源无缝连接到 ClickHouse Cloud。'
slug: /integrations/clickpipes/kinesis
title: '将 Amazon Kinesis 与 ClickHouse Cloud 集成'
doc_type: 'guide'
keywords: ['clickpipes', 'kinesis', 'streaming', 'aws', '数据摄取']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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


# 将 Amazon Kinesis 与 ClickHouse Cloud 集成 \{#integrating-amazon-kinesis-with-clickhouse-cloud\}

## 前提条件 \{#prerequisite\}

你已熟悉 [ClickPipes 介绍](./index.md)，并已配置好 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。请参考 [Kinesis 基于角色的访问指南](./secure-kinesis.md)，了解如何配置可与 ClickHouse Cloud 协同工作的角色。

## 创建您的第一个 ClickPipe \{#creating-your-first-clickpipe\}

1. 进入您的 ClickHouse Cloud 服务并打开 SQL Console。

<Image img={cp_service} alt="ClickPipes 服务" size="lg" border/>

2. 在左侧菜单中点击 `Data Sources` 按钮，然后点击 “Set up a ClickPipe”。

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择您的数据源。

<Image img={cp_step1} alt="选择数据源类型" size="lg" border/>

4. 填写表单，为您的 ClickPipe 提供名称、描述（可选）、IAM 角色或凭证，以及其他连接详情。

<Image img={cp_step2_kinesis} alt="填写连接详情" size="lg" border/>

5. 选择 Kinesis 流和起始偏移量。UI 会显示所选来源（Kafka topic 等）中的示例记录。您还可以为 Kinesis 流启用 Enhanced Fan-out，以提升 ClickPipe 的性能和稳定性（有关 Enhanced Fan-out 的更多信息可在[此处](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)查阅）。

<Image img={cp_step3_kinesis} alt="设置数据格式和 topic" size="lg" border/>

6. 在下一步中，您可以选择将数据摄取到新的 ClickHouse 表中，或复用现有表。按照界面中的说明修改表名、schema 和设置。您可以在顶部的示例表中实时预览更改效果。

<Image img={cp_step4a} alt="设置表、schema 和设置" size="lg" border/>

您还可以使用提供的控件自定义高级设置。

<Image img={cp_step4a3} alt="设置高级控件" size="lg" border/>

7. 或者，您也可以选择将数据摄取到现有的 ClickHouse 表中。在这种情况下，UI 将允许您将来源字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="使用现有表" size="lg" border/>

8. 最后，您可以为内部 ClickPipes 用户配置权限。

**Permissions：** ClickPipes 会创建一个专用用户，用于向目标表写入数据。您可以为该内部用户选择一个角色，可以是自定义角色或预定义角色之一：

- `Full access`：对集群具有完全访问权限。如果您在目标表中使用 materialized view 或字典，这可能会很有用。
    - `Only destination table`：仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="权限" border/>

9. 点击 “Complete Setup” 后，系统会注册您的 ClickPipe，随后您可以在汇总表中看到它。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="移除通知" size="lg" border/>

汇总表提供了控件，用于显示 ClickHouse 中来源或目标表的示例数据。

<Image img={cp_destination} alt="查看目标" size="lg" border/>

以及用于移除 ClickPipe 和显示摄取任务概览的控件。

<Image img={cp_overview} alt="查看概览" size="lg" border/>

10. **恭喜！**您已成功完成第一个 ClickPipe 的设置。如果这是一个流式 ClickPipe，它会持续运行，从远程数据源实时摄取数据。否则，它将在完成该批次的摄取后结束。

## 支持的数据格式 \{#supported-data-formats\}

支持的格式如下：

- [JSON](/interfaces/formats/JSON)

## 支持的数据类型 \{#supported-data-types\}

### 标准类型支持 \{#standard-types-support\}

当前在 ClickPipes 中支持以下 ClickHouse 数据类型：

- 基本数值类型 - \[U\]Int8/16/32/64、Float32/64 和 BFloat16
- 大整数类型 - \[U\]Int128/256
- Decimal 类型
- Boolean
- String
- FixedString
- Date、Date32
- DateTime、DateTime64（仅支持 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse 的 LowCardinality 类型
- 键和值使用上述任意类型（包括 Nullable）的 Map 类型
- 元素使用上述任意类型（包括 Nullable，且仅一层深度）的 Tuple 和 Array
- SimpleAggregateFunction 类型（适用于 AggregatingMergeTree 或 SummingMergeTree 目标表）

### Variant 类型支持 \{#variant-type-support\}

你可以为源数据流中的任意 JSON 字段手动指定 Variant 类型（例如 `Variant(String, Int64, DateTime)`）。由于 ClickPipes 判定应使用的正确 Variant 子类型的机制所限，在 Variant 定义中整数类型或 DateTime 类型各只能使用一种——例如，`Variant(Int64, UInt32)` 不受支持。

### JSON 类型支持 \{#json-type-support\}

始终为 JSON 对象的 JSON 字段可以分配到 JSON 目标列。需要手动将目标列的类型修改为所需的 JSON 类型，包括任何固定路径或跳过的路径。 

## Kinesis 虚拟列 \{#kinesis-virtual-columns\}

下表列出了 Kinesis 流所支持的虚拟列。在创建新的目标表时，可以使用 `Add Column` 按钮添加虚拟列。

| Name             | Description                                                   | Recommended Data Type |
|------------------|---------------------------------------------------------------|-----------------------|
| _key             | Kinesis 分区键                                               | String                |
| _timestamp       | Kinesis 近似到达时间戳（毫秒精度）                          | DateTime64(3)         |
| _stream          | Kinesis 流名称                                               | String                |
| _sequence_number | Kinesis 序列号                                               | String                |
| _raw_message     | 完整 Kinesis 消息                                            | String                |

`_raw_message` 字段可用于仅需要完整 Kinesis JSON 记录的场景（例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数来填充下游物化视图）。对于这类管道，删除所有“非虚拟”列可能会提升 ClickPipes 的性能。

## 限制 \{#limitations\}

- 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。
- 在使用最小 (XS) 副本规格运行时，单条消息（未压缩）的默认大小上限为 8MB，而在更大副本规格下为 16MB（未压缩）。超出该限制的消息将被拒绝并返回错误。如果你需要支持更大的消息，请联系支持团队。

## 性能 \{#performance\}

### 批处理 \{#batching\}

ClickPipes 会以批次方式向 ClickHouse 插入数据。这样可以避免在数据库中生成过多的分区片段，从而导致集群出现性能问题。

在满足以下任一条件时，将插入一个批次：

- 批次大小达到上限（100,000 行，或每 1GB 副本内存 32MB）
- 批次保持打开状态的时间达到上限（5 秒）

### 延迟 \{#latency\}

延迟（定义为从 Kinesis 将消息发送到流，到该消息在 ClickHouse 中可用之间的时间）取决于多种因素（例如 Kinesis 自身的延迟、网络延迟、消息大小和格式）。上述章节中描述的[批处理](#batching)机制也会对延迟产生影响。我们始终建议您针对自己的具体使用场景进行测试，以了解可以预期的延迟水平。

如果您有特定的低延迟需求，请[联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展 \{#scaling\}

用于 Kinesis 的 ClickPipes 被设计为既可以水平扩展，也可以垂直扩展。默认情况下，我们会创建一个包含一个 consumer 的 consumer group。可以在创建 ClickPipe 时进行配置，或者在之后通过 **Settings** -> **Advanced Settings** -> **Scaling** 进行配置。

ClickPipes 通过跨可用区的分布式架构提供高可用性。
因此需要扩展到至少两个 consumer。

无论当前运行的 consumer 数量多少，系统在设计上都具备容错能力。
如果某个 consumer 或其底层基础设施发生故障，
ClickPipe 会自动重启该 consumer，并继续处理消息。

## 身份验证 \{#authentication\}

要访问 Amazon Kinesis 流，可以使用 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。有关如何设置 IAM 角色的更多详细信息，请[参考本指南](./secure-kinesis.md)，了解如何配置可与 ClickHouse Cloud 一起使用的角色。