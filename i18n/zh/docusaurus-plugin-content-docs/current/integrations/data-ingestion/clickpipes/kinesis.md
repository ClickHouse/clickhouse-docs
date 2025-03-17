---
sidebar_label: 'ClickPipes for Amazon Kinesis'
description: '无缝连接您的 Amazon Kinesis 数据源到 ClickHouse Cloud。'
slug: /integrations/clickpipes/kinesis
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


# 将 Amazon Kinesis 与 ClickHouse Cloud 集成
## 先决条件 {#prerequisite}
您需要熟悉 [ClickPipes简介](./index.md) 并设置 [IAM凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。请遵循 [Kinesis 基于角色的访问指南](./secure-kinesis.md) 以获取有关如何设置与 ClickHouse Cloud 配合的角色的信息。

## 创建您的第一个 ClickPipe {#creating-your-first-clickpipe}

1. 访问您的 ClickHouse Cloud 服务的 SQL 控制台。

<img src={cp_service} alt="ClickPipes 服务" />

2. 在左侧菜单中选择 `数据源` 按钮，然后点击“设置 ClickPipe”

<img src={cp_step0} alt="选择导入" />

3. 选择您的数据源。

<img src={cp_step1} alt="选择数据源类型" />

4. 填写表单，为您的 ClickPipe 提供一个名称、描述（可选）、您的 IAM 角色或凭证及其他连接详细信息。

<img src={cp_step2_kinesis} alt="填写连接详细信息" />

5. 选择 Kinesis 流和起始偏移量。用户界面将显示所选源的示例文档（Kafka 主题等）。您还可以为 Kinesis 流启用增强型粉丝传播，以提高 ClickPipe 的性能和稳定性（有关增强型粉丝传播的更多信息，请参见 [此处](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)）

<img src={cp_step3_kinesis} alt="设置数据格式和主题" />

6. 在下一步中，您可以选择将数据摄取到新的 ClickHouse 表中或重用现有表。请按照屏幕中的说明修改您的表名称、架构和设置。您可以在顶部的示例表中实时预览您的更改。

<img src={cp_step4a} alt="设置表、架构和设置" />

  您还可以使用提供的控件自定义高级设置

<img src={cp_step4a3} alt="设置高级控件" />

7. 或者，您可以选择将数据摄取到现有的 ClickHouse 表中。在这种情况下，用户界面将允许您将源字段映射到所选目标表中的 ClickHouse 字段。

<img src={cp_step4b} alt="使用现有表" />

8. 最后，您可以配置内部 ClickPipes 用户的权限。

  **权限:** ClickPipes 将为写入数据到目标表创建一个专用用户。您可以使用自定义角色或以下预定义角色之一来为此内部用户选择角色：
    - `完全访问`: 对集群拥有完全访问权限。如果您在目标表中使用物化视图或字典，这可能会很有用。
    - `仅目标表`: 仅具有目标表的 `INSERT` 权限。

<img src={cp_step5} alt="权限" />

9. 点击“完成设置”，系统将注册您的 ClickPipe，您将能够在摘要表中看到它。

<img src={cp_success} alt="成功通知" />

<img src={cp_remove} alt="移除通知" />

  摘要表提供控件以显示来自 ClickHouse 的源或目标表的示例数据。

<img src={cp_destination} alt="查看目标" />

  以及移除 ClickPipe 和显示摄取作业摘要的控件。

<img src={cp_overview} alt="查看概览" />

10. **恭喜!** 您已成功设置您的第一个 ClickPipe。如果这是一个流式 ClickPipe，它将持续运行，从您的远程数据源实时摄取数据。否则它将处理批量数据并完成。

## 支持的数据格式 {#supported-data-formats}

支持的格式为：
- [JSON](../../../interfaces/formats.md/#json)

## 支持的数据类型 {#supported-data-types}

当前 ClickPipes 支持以下 ClickHouse 数据类型：

- 基本数值类型 - \[U\]Int8/16/32/64 和 Float32/64
- 大整数类型 - \[U\]Int128/256
- 十进制类型
- 布尔
- 字符串
- FixedString
- 日期，Date32
- DateTime，DateTime64（仅限 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse LowCardinality 类型
- 具有以上任意类型（包括 Nullable）的键值对的 Map
- 使用以上任意类型（包括 Nullable，只有一层深度）的元组和数组

## Kinesis 虚拟列 {#kinesis-virtual-columns}

在 Kinesis 流中支持以下虚拟列。创建新的目标表时，可以使用 `添加列` 按钮添加虚拟列。

| 名称             | 描述                                                       | 推荐数据类型         |
|------------------|-----------------------------------------------------------|---------------------|
| _key             | Kinesis 分区键                                           | 字符串                |
| _timestamp       | Kinesis 大约到达时间戳（毫秒精度）                        | DateTime64(3)      |
| _stream          | Kinesis 流名称                                           | 字符串                |
| _sequence_number | Kinesis 序列号                                          | 字符串                |
| _raw_message     | 完整的 Kinesis 消息                                      | 字符串                |

_raw_message 字段可以在只需要完整 Kinesis JSON 记录的情况下使用（例如，使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游物化视图）。对于此类管道，删除所有“非虚拟”列可能会提高 ClickPipes 的性能。

## 限制 {#limitations}

- 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。

## 性能 {#performance}

### 批处理 {#batching}
ClickPipes 将数据以批处理的方式插入 ClickHouse。这是为了避免在数据库中创建过多的分区片段，这可能导致集群性能问题。

当满足以下条件之一时，将插入批次：
- 批次大小达到最大限制（100,000 行或 20MB）
- 批次已打开的最大时间达到（5秒）

### 延迟 {#latency}

延迟（定义为 Kinesis 消息被发送到流和该消息在 ClickHouse 中可用之间的时间）将取决于多种因素（例如 Kinesis 延迟、网络延迟、消息大小/格式）。上述部分中描述的 [批处理](#batching) 也将影响延迟。我们始终建议测试您的特定用例，以了解您可以期待的延迟。

如果您有特定的低延迟要求，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展 {#scaling}

ClickPipes for Kinesis 旨在横向扩展。默认情况下，我们创建一个具有一个消费者的消费组。
您可以在 ClickPipe 详细视图中使用扩展控件进行更改。

ClickPipes 提供高可用性和可用区分布式架构。
这要求至少扩展到两个消费者。

无论运行消费者的数量如何，故障容错都是设计内置的。
如果一个消费者或其底层基础设施发生故障，
ClickPipe 将自动重启该消费者并继续处理消息。

## 身份验证 {#authentication}

要访问 Amazon Kinesis 流，您可以使用 [IAM凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。有关如何设置 IAM 角色的更多详细信息，您可以 [参考此指南](./secure-kinesis.md) 以获取有关如何设置与 ClickHouse Cloud 配合的角色的信息。
