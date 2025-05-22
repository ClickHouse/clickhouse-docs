---
'sidebar_label': '适用于 Amazon Kinesis 的 ClickPipes'
'description': '无缝连接您的 Amazon Kinesis 数据源与 ClickHouse Cloud。'
'slug': '/integrations/clickpipes/kinesis'
'title': '将 Amazon Kinesis 与 ClickHouse Cloud 集成'
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


# 将 Amazon Kinesis 集成到 ClickHouse Cloud
## 前提条件 {#prerequisite}
您需要熟悉 [ClickPipes 介绍](./index.md) 并设置 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。有关设置与 ClickHouse Cloud 兼容的角色的信息，请遵循 [Kinesis 基于角色的访问指南](./secure-kinesis.md)。

## 创建您的第一个 ClickPipe {#creating-your-first-clickpipe}

1. 访问您的 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes 服务" size="lg" border/>

2. 在左侧菜单中选择 `数据源` 按钮，然后点击“设置 ClickPipe”

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择您的数据源。

<Image img={cp_step1} alt="选择数据源类型" size="lg" border/>

4. 通过提供 ClickPipe 的名称、描述（可选）、您的 IAM 角色或凭证以及其他连接详细信息来填写表单。

<Image img={cp_step2_kinesis} alt="填写连接详细信息" size="lg" border/>

5. 选择 Kinesis 流和起始偏移量。UI 将显示所选源（Kafka 主题等）中的示例文档。您还可以启用 Kinesis 流的增强分发功能，以提高 ClickPipe 的性能和稳定性（有关增强分发的更多信息，请参见 [此处](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)）。

<Image img={cp_step3_kinesis} alt="设置数据格式和主题" size="lg" border/>

6. 在下一步中，您可以选择是将数据摄取到新的 ClickHouse 表中还是重用现有表。按照屏幕上的指示修改表名称、模式和设置。您可以在顶部的示例表中实时预览您的更改。

<Image img={cp_step4a} alt="设置表、模式和设置" size="lg" border/>

  您还可以使用提供的控件自定义高级设置。

<Image img={cp_step4a3} alt="设置高级控件" size="lg" border/>

7. 另外，您可以决定将数据摄取到现有的 ClickHouse 表中。在这种情况下，UI 将允许您将源字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="使用现有表" size="lg" border/>

8. 最后，您可以为内部 ClickPipes 用户配置权限。

  **权限：** ClickPipes 将为向目标表写入数据创建专用用户。您可以使用自定义角色或预定义角色之一为此内部用户选择角色：
    - `完全访问`：对集群拥有完全访问权限。如果您在目标表中使用物化视图或字典，这可能会很有用。
    - `仅目标表`：仅对目标表拥有 `INSERT` 权限。

<Image img={cp_step5} alt="权限" border/>

9. 通过点击“完成设置”，系统将注册您的 ClickPipe，您将能够在摘要表中查看它。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="删除通知" size="lg" border/>

  摘要表提供控件以显示源或 ClickHouse 中目标表的示例数据。

<Image img={cp_destination} alt="查看目标" size="lg" border/>

  以及移除 ClickPipe 和显示摄取作业摘要的控件。

<Image img={cp_overview} alt="查看概述" size="lg" border/>

10. **恭喜！**您已成功设置您的第一个 ClickPipe。如果这是一个流式 ClickPipe，它将持续运行，实时从您的远程数据源摄取数据。否则，它将摄取批处理并完成。


## 支持的数据格式 {#supported-data-formats}

支持的格式有：
- [JSON](../../../interfaces/formats.md/#json)

## 支持的数据类型 {#supported-data-types}

以下 ClickHouse 数据类型当前在 ClickPipes 中受支持：

- 基本数字类型 - \[U\]Int8/16/32/64 和 Float32/64
- 大整数类型 - \[U\]Int128/256
- 十进制类型
- 布尔类型
- 字符串
- 固定字符串
- 日期，Date32
- 日期时间，DateTime64（仅限 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse 低基数类型
- 使用上述任一类型（包括 Nullable）的键和值的映射
- 使用上述任一类型（包括 Nullable，深度仅限一层）的元组和数组元素

## Kinesis 虚拟列 {#kinesis-virtual-columns}

以下虚拟列支持 Kinesis 流。在创建新的目标表时，可以使用 `添加列` 按钮添加虚拟列。

| 名称             | 描述                                                       | 推荐数据类型         |
|------------------|----------------------------------------------------------|---------------------|
| _key             | Kinesis 分区键                                           | String              |
| _timestamp       | Kinesis 近似到达时间戳（毫秒精度）                    | DateTime64(3)       |
| _stream          | Kinesis 流名称                                         | String              |
| _sequence_number | Kinesis 序列号                                         | String              |
| _raw_message     | 完整 Kinesis 消息                                     | String              |

在仅需要完整 Kinesis JSON 记录的情况下（例如，使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游物化视图），可以使用 _raw_message 字段。对于此类管道，删除所有“非虚拟”列可能会提高 ClickPipes 性能。

## 限制 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) 不受支持。

## 性能 {#performance}

### 批处理 {#batching}
ClickPipes 以批处理方式将数据插入到 ClickHouse 中。这是为了避免在数据库中创建过多的分区，这可能导致集群性能问题。

当满足以下任一条件时，批量数据将被插入：
- 批量大小已达到最大限制（100,000 行或 20MB）
- 批量数据已打开最长时间（5 秒）

### 延迟 {#latency}

延迟（定义为 Kinesis 消息发送到流与消息在 ClickHouse 中可用之间的时间）将取决于多个因素（即 Kinesis 延迟、网络延迟、消息大小/格式）。上面部分中描述的 [批处理](#batching) 也会影响延迟。我们始终建议测试您的特定用例，以了解您可以预期的延迟。

如果您有特定的低延迟要求，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展 {#scaling}

针对 Kinesis 的 ClickPipes 设计为横向扩展。默认情况下，我们创建一个具有一个消费者的消费者组。
这可以通过 ClickPipe 详细视图中的扩展控件进行更改。

ClickPipes 提供高可用性和可用区分布式架构。
这需要至少扩展到两个消费者。

无论运行的消费者数量如何，故障容忍均是设计的一部分。
如果消费者或其基础基础设施故障，
ClickPipe 将自动重启消费者并继续处理消息。

## 身份验证 {#authentication}

要访问 Amazon Kinesis 流，您可以使用 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。有关如何设置 IAM 角色的更多详细信息，您可以 [参考本指南](./secure-kinesis.md) 以获取有关如何设置与 ClickHouse Cloud 兼容的角色的信息。
