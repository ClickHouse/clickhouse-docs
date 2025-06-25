---
'sidebar_label': 'ClickPipes 用于 Amazon Kinesis'
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
您已熟悉 [ClickPipes 介绍](./index.md) 并设置了 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。请按照 [Kinesis 基于角色的访问指南](./secure-kinesis.md) 获取关于如何设置与 ClickHouse Cloud 兼容的角色的信息。

## 创建您的第一个 ClickPipe {#creating-your-first-clickpipe}

1. 访问您的 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，然后点击“设置 ClickPipe”

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择您的数据源。

<Image img={cp_step1} alt="Select data source type" size="lg" border/>

4. 填写表单，为您的 ClickPipe 提供名称、描述（可选）、您的 IAM 角色或凭证及其他连接详细信息。

<Image img={cp_step2_kinesis} alt="Fill out connection details" size="lg" border/>

5. 选择 Kinesis 流和起始偏移量。用户界面将显示所选源（Kafka 主题等）的示例文档。您还可以为 Kinesis 流启用增强的扇出，以提高 ClickPipe 的性能和稳定性（有关增强扇出的更多信息，请见 [这里](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)）。

<Image img={cp_step3_kinesis} alt="Set data format and topic" size="lg" border/>

6. 在下一步中，您可以选择是否将数据摄取到新的 ClickHouse 表中或重用现有的表。按照屏幕上的说明修改表名、模式和设置。您可以在顶部的示例表中实时预览更改。

<Image img={cp_step4a} alt="Set table, schema, and settings" size="lg" border/>

  您还可以使用提供的控件自定义高级设置

<Image img={cp_step4a3} alt="Set advanced controls" size="lg" border/>

7. 或者，您可以决定将数据摄取到现有的 ClickHouse 表中。在这种情况下，用户界面将允许您将源字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="Use an existing table" size="lg" border/>

8. 最后，您可以为内部 ClickPipes 用户配置权限。

  **权限：** ClickPipes 将为写入数据到目标表创建一个专用用户。您可以使用自定义角色或预定义角色选择此内部用户的角色：
    - `Full access`：对集群具有完全访问权限。如果您使用目标表的物化视图或字典，这可能会很有用。
    - `Only destination table`：仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="Permissions" border/>

9. 点击“完成设置”，系统将注册您的 ClickPipe，您将能够在摘要表中查看它。

<Image img={cp_success} alt="Success notice" size="sm" border/>

<Image img={cp_remove} alt="Remove notice" size="lg" border/>

  摘要表提供控件，以显示来自源或 ClickHouse 中的目标表的示例数据

<Image img={cp_destination} alt="View destination" size="lg" border/>

  以及控件来删除 ClickPipe 并显示摄取作业的摘要。

<Image img={cp_overview} alt="View overview" size="lg" border/>

10. **恭喜！** 您已成功设置您的第一个 ClickPipe。如果这是一个流式 ClickPipe，它将持续运行，从您的远程数据源实时摄取数据。否则将摄取批处理并完成。

## 支持的数据格式 {#supported-data-formats}

支持的格式包括：
- [JSON](../../../interfaces/formats.md/#json)

## 支持的数据类型 {#supported-data-types}

### 标准类型支持 {#standard-types-support}
当前 ClickHouse 数据库支持以下 ClickPipes 数据类型：

- 基本数值类型 - \[U\]Int8/16/32/64 和 Float32/64
- 大整数类型 - \[U\]Int128/256
- 十进制类型
- 布尔类型
- 字符串
- 固定字符串
- 日期、Date32
- 日期时间、DateTime64（仅 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse 低基数类型
- 使用上述任何类型（包括 Nullable）的键和值的 Map
- 使用上述任何类型的元素（包括 Nullable，深度仅限一层）的 Tuple 和 Array
- 
### 变体类型支持（实验性） {#variant-type-support}
如果您的 Cloud 服务运行 ClickHouse 25.3 或更高版本，则变体类型支持是自动的。否则，您需要提交支持工单以在您的服务上启用它。

您可以手动为源数据流中的任何 JSON 字段指定变体类型（例如 `Variant(String, Int64, DateTime)`）。由于 ClickPipes 确定使用正确的变体子类型的方式，因此变体定义中只能使用一种整数或日期时间类型 - 例如，`Variant(Int64, UInt32)` 不被支持。

### JSON 类型支持（实验性） {#json-type-support}
如果您的 Cloud 服务运行 ClickHouse 25.3 或更高版本，则 JSON 类型支持是自动的。否则，您需要提交支持工单以在您的服务上启用它。

始终是 JSON 对象的 JSON 字段可以分配给 JSON 目标列。您需要手动将目标列更改为所需的 JSON 类型，包括任何固定或跳过的路径。 

## Kinesis 虚拟列 {#kinesis-virtual-columns}

对于 Kinesis 流，支持以下虚拟列。在创建新目标表时，可以使用 `Add Column` 按钮添加虚拟列。

| 名称             | 描述                                                   | 推荐数据类型 |
|------------------|--------------------------------------------------------|-----------------------|
| _key             | Kinesis 分区键                                         | 字符串                |
| _timestamp       | Kinesis 近似到达时间戳（毫秒精度）                     | DateTime64(3)         |
| _stream          | Kinesis 流名称                                        | 字符串                |
| _sequence_number | Kinesis 序列号                                        | 字符串                |
| _raw_message     | 完整的 Kinesis 消息                                   | 字符串                |

_raw_message 字段可用于仅需要完整 Kinesis JSON 记录的情况下（例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游物化视图）。对于此类管道，删除所有“非虚拟”列可以提高 ClickPipes 的性能。

## 限制 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) 不被支持。

## 性能 {#performance}

### 批量 {#batching}
ClickPipes 以批量方式将数据插入 ClickHouse。这样可以避免在数据库中创建过多的部分，从而导致集群性能问题。

批量插入在满足以下条件之一时发生：
- 批量大小达到最大值（100,000 行或 20MB）
- 批量已打开的最长时间（5 秒）

### 延迟 {#latency}

延迟（定义为 Kinesis 消息发送到流中和消息在 ClickHouse 中可用之间的时间）将依赖于多个因素（即 Kinesis 延迟、网络延迟、消息大小/格式）。上述节中描述的 [批量处理](#batching) 也将影响延迟。我们总是建议测试您的特定用例，以了解您可以预期的延迟。

如果您有特定的低延迟需求，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展性 {#scaling}

ClickPipes for Kinesis 旨在水平扩展。默认情况下，我们创建一个具有一个消费者的消费者组。
这可以通过 ClickPipe 详情视图中的扩展控件进行更改。

ClickPipes 提供高可用性和可用区分布式架构。
这需要将消费者数量扩展到至少两个。

无论运行的消费者数量如何，容错都是设计而成的。
如果一个消费者或其底层基础设施发生故障，
ClickPipe 将自动重新启动该消费者并继续处理消息。

## 身份验证 {#authentication}

要访问 Amazon Kinesis 流，您可以使用 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。有关如何设置 IAM 角色的更多详细信息，您可以 [参考此指南](./secure-kinesis.md)，以获取与 ClickHouse Cloud 兼容的角色的设置信息。
