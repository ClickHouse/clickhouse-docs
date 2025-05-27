---
'sidebar_label': 'ClickPipes for Amazon Kinesis'
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


# 将 Amazon Kinesis 与 ClickHouse Cloud 集成
## 前提条件 {#prerequisite}
您已了解 [ClickPipes 介绍](./index.md) 并设置了 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。请遵循 [Kinesis 基于角色的访问指南](./secure-kinesis.md)，获取有关如何设置与 ClickHouse Cloud 兼容的角色的信息。

## 创建您的第一个 ClickPipe {#creating-your-first-clickpipe}

1. 访问您的 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 在左侧菜单中选择 `数据源` 按钮，然后点击 "设置 ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择您的数据源。

<Image img={cp_step1} alt="Select data source type" size="lg" border/>

4. 通过提供 ClickPipe 的名称、描述（可选）、您的 IAM 角色或凭证以及其他连接详细信息来填写表单。

<Image img={cp_step2_kinesis} alt="Fill out connection details" size="lg" border/>

5. 选择 Kinesis 流和起始偏移量。用户界面将显示所选源（Kafka 主题等）中的示例文档。您还可以为 Kinesis 流启用增强式并发，以提高 ClickPipe 的性能和稳定性（有关增强式并发的更多信息，请参见 [这里](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)）

<Image img={cp_step3_kinesis} alt="Set data format and topic" size="lg" border/>

6. 在下一步中，您可以选择将数据摄取到新的 ClickHouse 表中，还是重用现有表。按照屏幕中的说明修改您的表名、模式和设置。您可以在顶部的示例表中实时查看您的更改。

<Image img={cp_step4a} alt="Set table, schema, and settings" size="lg" border/>

  您还可以使用提供的控件自定义高级设置。

<Image img={cp_step4a3} alt="Set advanced controls" size="lg" border/>

7. 或者，您可以决定将数据摄取到现有 ClickHouse 表中。在这种情况下，用户界面将允许您将源中的字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="Use an existing table" size="lg" border/>

8. 最后，您可以为内部 ClickPipes 用户配置权限。

  **权限：** ClickPipes 将为写入数据到目标表创建一个专用用户。您可以通过自定义角色或预定义角色之一为此内部用户选择角色：
    - `完全访问`: 对集群具有完全访问权限。如果您在目标表中使用物化视图或字典，这可能会很有用。
    - `仅目标表`: 仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="Permissions" border/>

9. 点击 "完成设置"，系统将注册您的 ClickPipe，您将能够在摘要表中看到它。

<Image img={cp_success} alt="Success notice" size="sm" border/>

<Image img={cp_remove} alt="Remove notice" size="lg" border/>

  摘要表提供控件以显示源或 ClickHouse 中目标表的示例数据。

<Image img={cp_destination} alt="View destination" size="lg" border/>

  以及移除 ClickPipe 和显示摄取作业摘要的控件。

<Image img={cp_overview} alt="View overview" size="lg" border/>

10. **恭喜！** 您已经成功设置了第一个 ClickPipe。如果这是一个流式 ClickPipe，它将持续运行，从您的远程数据源实时摄取数据。否则，它将摄取批处理并完成。

## 支持的数据格式 {#supported-data-formats}

支持的格式包括：
- [JSON](../../../interfaces/formats.md/#json)

## 支持的数据类型 {#supported-data-types}

当前在 ClickPipes 中支持以下 ClickHouse 数据类型：

- 基本数值类型 - \[U\]Int8/16/32/64 和 Float32/64
- 大整数类型 - \[U\]Int128/256
- 十进制类型
- 布尔
- 字符串
- FixedString
- 日期，Date32
- 日期时间，DateTime64（仅限 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse 低基数类型
- 使用上述任意类型（包括 Nullable）的键和值的 Map
- 使用上述任意类型（包括 Nullable，仅一层深度）的 Tuple 和 Array

## Kinesis 虚拟列 {#kinesis-virtual-columns}

以下虚拟列支持 Kinesis 流。在创建新目标表时，可以使用 `添加列` 按钮添加虚拟列。

| 名称             | 描述                                                   | 推荐数据类型        |
|------------------|-------------------------------------------------------|---------------------|
| _key             | Kinesis 分区键                                       | 字符串              |
| _timestamp       | Kinesis 大致到达时间戳（毫秒精度）                  | DateTime64(3)       |
| _stream          | Kinesis 流名称                                       | 字符串              |
| _sequence_number | Kinesis 顺序号                                       | 字符串              |
| _raw_message     | 完整 Kinesis 消息                                    | 字符串              |

_raw_message 字段可以在仅需要完整 Kinesis JSON 记录的情况下使用（例如，使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游物化视图）。对于此类管道，删除所有“非虚拟”列可能会提高 ClickPipes 性能。

## 限制 {#limitations}

- 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。

## 性能 {#performance}

### 批处理 {#batching}
ClickPipes 以批量方式将数据插入 ClickHouse。这是为了避免在数据库中创建过多的部分，这可能导致集群的性能问题。

在满足以下任一条件时，将插入批处理：
- 批量大小达到最大大小（100,000 行或 20MB）
- 批量开放时间超过最大时间（5 秒）

### 延迟 {#latency}

延迟（定义为 Kinesis 消息发送到流和消息在 ClickHouse 中可用之间的时间）将取决于多个因素（即 Kinesis 延迟、网络延迟、消息大小/格式）。上述部分 ( #batching ) 中描述的批处理将影响延迟。我们始终建议测试您特定的用例，以了解您可以预期的延迟。

如果您有特定的低延迟要求，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展 {#scaling}

Kinesis 的 ClickPipes 设计为横向扩展。默认情况下，我们创建一个具有一个消费者的消费者组。您可以在 ClickPipe 详细信息视图中通过扩展控件进行更改。

ClickPipes 提供高可用性，并采用可用区域分布式架构。这需要至少扩展到两个消费者。

无论运行消费者的数量如何，容错设计始终可用。如果消费者或其底层基础设施出现故障，ClickPipe 将自动重启消费者并继续处理消息。

## 身份验证 {#authentication}

要访问 Amazon Kinesis 流，您可以使用 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。有关如何设置 IAM 角色的更多详细信息，您可以 [参考此指南](./secure-kinesis.md)，获取有关如何设置与 ClickHouse Cloud 兼容的角色的信息。
