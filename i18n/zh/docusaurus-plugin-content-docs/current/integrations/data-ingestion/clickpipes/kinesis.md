---
sidebar_label: '面向 Amazon Kinesis 的 ClickPipes'
description: '将您的 Amazon Kinesis 数据源无缝连接到 ClickHouse Cloud。'
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


# 将 Amazon Kinesis 集成到 ClickHouse Cloud {#integrating-amazon-kinesis-with-clickhouse-cloud}
## 前置条件 {#prerequisite}
你已经熟悉了 [ClickPipes 介绍](./index.md)，并已配置好 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。请按照 [Kinesis 基于角色的访问控制指南](./secure-kinesis.md) 中的说明，设置可与 ClickHouse Cloud 协同工作的角色。



## 创建你的第一个 ClickPipe {#creating-your-first-clickpipe}

1. 打开你的 ClickHouse Cloud Service 的 SQL Console。

<Image img={cp_service} alt="ClickPipes 服务" size="lg" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，然后点击 "Set up a ClickPipe"。

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择你的数据源。

<Image img={cp_step1} alt="选择数据源类型" size="lg" border/>

4. 填写表单，为你的 ClickPipe 提供名称、描述（可选）、IAM 角色或凭证，以及其他连接详细信息。

<Image img={cp_step2_kinesis} alt="填写连接详情" size="lg" border/>

5. 选择 Kinesis Stream 和起始偏移量（offset）。UI 会显示所选来源（Kafka topic 等）的示例记录。你也可以为 Kinesis 流启用 Enhanced Fan-out，以提升 ClickPipe 的性能与稳定性（关于 Enhanced Fan-out 的更多信息可以在 [此处](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout) 查阅）。

<Image img={cp_step3_kinesis} alt="设置数据格式和 topic" size="lg" border/>

6. 在下一步中，你可以选择是将数据摄取到新的 ClickHouse 表中，还是复用现有表。按照界面上的说明修改表名、schema 和设置。你可以在顶部的示例表中实时预览你的更改。

<Image img={cp_step4a} alt="设置表、schema 和设置" size="lg" border/>

  你还可以使用提供的控件自定义高级设置。

<Image img={cp_step4a3} alt="设置高级控件" size="lg" border/>

7. 或者，你也可以选择将数据摄取到现有的 ClickHouse 表中。在这种情况下，UI 会允许你把来源中的字段映射到所选目标表中 ClickHouse 的字段。

<Image img={cp_step4b} alt="使用已有表" size="lg" border/>

8. 最后，你可以为内部 ClickPipes 用户配置权限。

  **权限：** ClickPipes 会创建一个专用用户，用于向目标表写入数据。你可以为该内部用户选择角色，使用自定义角色或预定义角色之一：
    - `Full access`：对集群拥有完全访问权限。如果你在目标表上使用物化视图或 Dictionary，这可能会很有用。
    - `Only destination table`：仅对目标表授予 `INSERT` 权限。

<Image img={cp_step5} alt="权限" border/>

9. 点击 "Complete Setup" 后，系统会注册你的 ClickPipe，你就可以在汇总表中看到它。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="移除通知" size="lg" border/>

  汇总表提供控件，用于显示 ClickHouse 中来源或目标表的示例数据。

<Image img={cp_destination} alt="查看目标" size="lg" border/>

  以及用于移除 ClickPipe 并显示摄取作业概览的控件。

<Image img={cp_overview} alt="查看概览" size="lg" border/>

10. **恭喜！**你已成功完成第一个 ClickPipe 的设置。如果这是一个流式 ClickPipe，它会持续运行，从远程数据源实时摄取数据。否则，它会完成批量摄取后终止。



## 支持的数据格式 {#supported-data-formats}

支持的格式包括：
- [JSON](/interfaces/formats/JSON)



## 支持的数据类型 {#supported-data-types}

### 标准类型支持 {#standard-types-support}
当前 ClickPipes 支持以下 ClickHouse 数据类型：

- 基础数值类型 - \[U\]Int8/16/32/64、Float32/64 和 BFloat16
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
- Map，其键和值使用上述任意类型（包括 Nullable）
- Tuple 和 Array，其元素使用上述任意类型（包括 Nullable，仅支持一层嵌套）
- SimpleAggregateFunction 类型（用于 AggregatingMergeTree 或 SummingMergeTree 目标表）

### Variant 类型支持 {#variant-type-support}
您可以为源数据流中的任意 JSON 字段手动指定 Variant 类型（例如 `Variant(String, Int64, DateTime)`）。由于 ClickPipes 判定应使用的具体 Variant 子类型的方式所限，在 Variant 定义中只能使用一种整数类型或一种 datetime 类型，例如，`Variant(Int64, UInt32)` 不支持。

### JSON 类型支持 {#json-type-support}
始终为 JSON 对象的 JSON 字段可以映射到 JSON 目标列。您需要手动将目标列修改为所需的 JSON 类型，包括任何固定或跳过的路径。 



## Kinesis 虚拟列 {#kinesis-virtual-columns}

下表列出了 Kinesis 流支持的虚拟列。创建新的目标表时，可以通过 `Add Column` 按钮添加虚拟列。

| Name             | Description                                                     | Recommended Data Type |
|------------------|-----------------------------------------------------------------|-----------------------|
| _key             | Kinesis Partition Key                                           | String                |
| _timestamp       | Kinesis Approximate Arrival Timestamp（毫秒精度）              | DateTime64(3)         |
| _stream          | Kinesis Stream Name                                             | String                |
| _sequence_number | Kinesis Sequence Number                                         | String                |
| _raw_message     | Full Kinesis Message                                            | String                |

在仅需要完整 Kinesis JSON 记录的场景中（例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数来填充下游物化视图），可以使用 `_raw_message` 字段。对于此类管道，删除所有“非虚拟”列可能会提升 ClickPipes 的性能。



## 限制 {#limitations}

- 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。



## 性能 {#performance}

### 批处理 {#batching}
ClickPipes 以批处理的方式向 ClickHouse 插入数据。这样可以避免在数据库中创建过多的数据分片（parts），从而防止集群出现性能问题。

在满足以下任一条件时会插入一个批次：
- 批次大小达到最大值（每 1GB 副本内存最多 100,000 行或 32MB）
- 批次已打开的时间达到上限（5 秒）

### 延迟 {#latency}

延迟（定义为 Kinesis 消息发送到流与该消息在 ClickHouse 中可用之间的时间）取决于多种因素（例如 Kinesis 自身的延迟、网络延迟、消息大小/格式）。上文中描述的[批处理](#batching)也会影响延迟。我们始终建议针对您的具体使用场景进行测试，以了解可以预期的延迟水平。

如果您有特别严格的低延迟需求，请[联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展性 {#scaling}

用于 Kinesis 的 ClickPipes 被设计为既可以水平扩展，也可以垂直扩展。默认情况下，我们会创建一个包含单个 consumer 的 consumer group。该配置可以在创建 ClickPipe 时设置，也可以在之后通过 **Settings** -> **Advanced Settings** -> **Scaling** 进行修改。

ClickPipes 通过跨可用区分布式架构提供高可用性。
为此，consumer 数量至少需要扩展到两个。

无论实际运行的 consumer 数量多少，系统在设计上都具备容错能力。
如果某个 consumer 或其底层基础设施发生故障，
ClickPipe 会自动重启该 consumer 并继续处理消息。



## 身份验证 {#authentication}

要访问 Amazon Kinesis 流，你可以使用 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。有关如何配置 IAM 角色的更多信息，你可以[参考本指南](./secure-kinesis.md)，了解如何配置可与 ClickHouse Cloud 配合使用的角色。
