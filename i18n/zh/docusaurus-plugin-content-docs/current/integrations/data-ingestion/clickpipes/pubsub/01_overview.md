---
sidebar_label: '适用于 GCP Pub/Sub 的 ClickPipes'
description: '将您的 Google Cloud Pub/Sub topic无缝连接到 ClickHouse Cloud。'
slug: /integrations/clickpipes/pubsub
title: '将 Google Pub/Sub 集成到 ClickHouse Cloud'
doc_type: 'guide'
keywords: ['clickpipes', 'pubsub', 'gcp pub/sub', 'google cloud pub/sub', '流式传输', 'gcp', '数据摄取', '压缩', 'gzip', 'zstd', 'lz4', 'snappy']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1_pubsub from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1_pubsub.png';
import cp_step2_pubsub from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_pubsub.png';
import cp_step3_pubsub from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_pubsub.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';

# 将 Google Pub/Sub 与 ClickHouse Cloud 集成 \{#integrating-google-pubsub-with-clickhouse-cloud\}

:::note Public Beta
适用于 GCP Pub/Sub 的 ClickPipes 当前处于 Public Beta 阶段。
:::

Pub/Sub ClickPipes 可通过 ClickPipes UI 手动部署和管理，也可通过 [OpenAPI](/integrations/clickpipes/programmatic-access/openapi) 和 [Terraform](/integrations/clickpipes/programmatic-access/terraform) 以编程方式进行部署和管理。

## 前置条件 \{#prerequisite\}

您已了解 [ClickPipes 简介](../index.md)，能够访问包含要从中摄取数据的 topic 的 GCP 项目，并且已创建具有相应 Pub/Sub 权限的服务账号。有关 ClickPipes 所需的具体权限集，请参阅 [Pub/Sub IAM 权限指南](./02_auth.md)。

## 创建你的第一个 ClickPipe \{#creating-your-first-clickpipe\}

1. 打开你的 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes 服务" size="lg" border />

2. 在左侧菜单中选择 `数据源` 按钮，然后点击“Set up a ClickPipe”

<Image img={cp_step0} alt="选择导入" size="lg" border />

3. 选择 **GCP Pub/Sub** 作为数据源。

<Image img={cp_step1_pubsub} alt="选择 GCP Pub/Sub 作为数据源" size="lg" border />

4. 填写表单，为 ClickPipe 提供名称、**GCP Project ID**，以及已被授予 Pub/Sub 访问权限的服务账号对应的 **服务账号 JSON 文件**。Project ID 必须为 6–30 个字符，可包含小写字母、数字和连字符，且必须以字母开头、不能以连字符结尾。

<Image img={cp_step2_pubsub} alt="填写连接详细信息" size="lg" border />

5. 选择要从中摄取数据的 **Pub/Sub topic**。凭据验证通过后，下拉列表会自动从你的 GCP 项目中填充 topics (按字母顺序排序) 。

   * **数据格式。** 选择 topic 时，ClickPipes 会查询 Pub/Sub 的 Schema Registry。如果该 topic 绑定了原生 Avro 或 Protobuf schema，则会自动检测 Data format 和 Schema，并将选择器锁定为该 topic 上的最新 schema。未绑定原生 schema 的 topics 默认使用 JSONEachRow。
   * **起始偏移量。** 选择从哪里开始消费。可用选项包括 **Latest** (仅新消息) 、**Earliest** (最早保留的消息) 以及 **Seek to Timestamp** (使用 UTC 日期时间选择器) 。
   * **过滤表达式 (可选) 。** 这是一个作用于消息 attribute 的 Pub/Sub [subscription filter](https://cloud.google.com/pubsub/docs/subscription-message-filter)，例如 `attributes.type = "telemetry"`。过滤器仅适用于消息 attributes，不适用于 payload，并且在 pipe 创建后无法更改 (如需修改过滤器，必须重新创建 pipe) 。
   * UI 会显示所选 topic 的一条样本消息，并提供一个 **Flatten object** 开关，让你预览嵌套 JSON 在目标端会如何被展平。

<Image img={cp_step3_pubsub} alt="设置 Pub/Sub topic、格式和起始偏移量" size="lg" border />

6. 在下一步中，你可以选择将数据摄取到新的 ClickHouse 表中，或复用现有表。按照界面提示修改表名、schema 和设置。你可以在顶部的样本表中实时预览这些更改。

<Image img={cp_step4a} alt="设置表、schema 和设置" size="lg" border />

你还可以使用提供的控件自定义高级设置

<Image img={cp_step4a3} alt="设置高级控件" size="lg" border />

7. 或者，你也可以选择将数据摄取到现有的 ClickHouse 表中。在这种情况下，UI 会允许你将源字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="使用现有表" size="lg" border />

8. 最后，你可以为内部 ClickPipes 用户配置权限。

**权限：** ClickPipes 会创建一个专用用户，用于将数据写入目标表。你可以为该内部用户选择角色，可使用自定义角色，也可使用预定义角色之一：

* `Full access`：对集群具有完全访问权限。如果目标表使用了 materialized view 或 字典，这可能会很有用。
  * `Only destination table`：仅具有目标表的 `INSERT` 权限。

<Image img={cp_step5} alt="权限" border />

9. 点击“Complete Setup”后，系统将注册你的 ClickPipe，你将能够在汇总表中看到它。

<Image img={cp_success} alt="成功提示" size="sm" border />

<Image img={cp_remove} alt="移除提示" size="lg" border />

该汇总表提供了用于显示源端样本数据或 ClickHouse 中目标表数据的控件

<Image img={cp_destination} alt="查看目标端" size="lg" border />

以及用于移除 ClickPipe 和查看摄取作业摘要的控件。

<Image img={cp_overview} alt="查看概览" size="lg" border />

10. **恭喜！** 你已成功设置第一个 Pub/Sub ClickPipe。它将持续运行，把 Pub/Sub topic 中的数据实时摄取到你的 ClickHouse Cloud 服务中。

## 托管订阅 \{#managed-subscriptions\}

Pub/Sub 消息是通过订阅消费的，而不是直接从 topic 消费。ClickPipes 会为每个管道 创建并管理一个专用订阅——你始终只需选择一个 topic。

* 托管订阅名为 `clickpipes-{pipeID}`，会在管道 启动时基于该 topic 创建。
* 其配置包括 60 秒 ack 截止时间、7 天消息保留期，并启用了消息排序。
* 订阅创建是幂等的——如果某个现有订阅已指向所配置的 topic，则在管道 重启或副本重新调度时会复用该订阅。
* 在发现 topic 和对消息进行采样期间，ClickPipes 还会创建短生命周期的临时订阅 (`clickpipes-discovery-{uuid}`) ，并在采样完成后立即删除。
* 删除管道 时，ClickPipes 也会在清理过程中删除该托管订阅。

因此，除具备从订阅中消费消息的权限外，你提供的服务账号还必须具备在该项目中创建和删除订阅的权限。完整权限列表请参见 [Pub/Sub IAM 权限指南](./02_auth.md)。

## 支持的数据格式 \{#supported-data-formats\}

支持的格式如下：

* [JSON](/interfaces/formats/JSON)
* [Avro](/interfaces/formats/Avro) — 通过 Pub/Sub 原生 schema (BINARY encoding)
* [Protobuf](/interfaces/formats/Protobuf) — 通过 Pub/Sub 原生 schema (BINARY encoding)

对于 Avro 和 Protobuf，会从 topic 对应的 Pub/Sub Schema Registry 中解析 schema。该管道始终使用该 topic 的 schema 的最新修订版；UI 中的 schema 选择器按设计为只读。

## 压缩 \{#compression\}

用于 Pub/Sub 的 ClickPipes 会自动检测并解压压缩消息。Pub/Sub 客户端传递的是原始字节数据——ClickPipes 会为您完成解压，无需任何配置。

支持以下压缩编解码器：

* **gzip**
* **zstd**
* **lz4**
* **snappy** (帧格式)

系统会根据每条消息中的 magic bytes 自动检测压缩类型。如果未发现已知的压缩签名，则该消息会被视为未压缩。检测到的压缩类型也会在 schema inference 期间显示，因此 UI 中的样本数据预览会正确展示解压后的负载。

:::note
对于 JSON 等基于文本的格式，自动检测是安全的，因为可打印的 ASCII 字符不会与压缩 magic bytes 冲突。解压后的负载大小上限为 64MB。
:::

## 支持的数据类型 \{#supported-data-types\}

### 标准类型支持 \{#standard-types-support\}

ClickPipes 当前支持以下 ClickHouse 数据类型：

* 基础数值类型 - [U]Int8/16/32/64、Float32/64 和 BFloat16
* 大整数类型 - [U]Int128/256
* Decimal 类型
* Boolean
* String
* FixedString
* Date、Date32
* DateTime、DateTime64 (仅支持 UTC 时区)
* Enum8/Enum16
* UUID
* IPv4
* IPv6
* 所有 ClickHouse LowCardinality 类型
* Map，其键和值均可使用上述任意类型 (包括 Nullable)
* Tuple 和 Array，其元素可使用上述任意类型 (包括 Nullable，且仅支持一层深度)
* SimpleAggregateFunction 类型 (用于 AggregatingMergeTree 或 SummingMergeTree 目标端)

### Variant 类型支持 \{#variant-type-support\}

您可以为源数据 stream 中的任何 JSON field 手动指定 Variant 类型 (例如 `Variant(String, Int64, DateTime)`) 。
由于 ClickPipes 确定应使用哪种 Variant 子类型的方式所限，在 Variant 定义中只能使用一种整数或 datetime
类型——例如，`Variant(Int64, UInt32)` 不受支持。

### JSON 类型支持 \{#json-type-support\}

如果 JSON 字段始终为 JSON 对象，则可将其分配给 JSON 目标端列。您需要手动将目标端
列更改为所需的 JSON 类型，包括任何固定路径或跳过路径。

## Pub/Sub 虚拟列 \{#pubsub-virtual-columns\}

Pub/Sub topic 支持以下虚拟列。创建新的目标表时，可使用 `Add Column` 按钮添加虚拟列。

| Name                  | Description                 | Recommended Data Type |
| --------------------- | --------------------------- | --------------------- |
| &#95;message&#95;id   | 由代理分配的 Pub/Sub 消息 ID        | String                |
| &#95;publish&#95;time | Pub/Sub 发布时间戳 (毫秒精度，UTC)    | DateTime64(3)         |
| &#95;ordering&#95;key | Pub/Sub 排序键 (消息未设置键时为空字符串)  | String                |
| &#95;attributes       | 用户定义的 Pub/Sub 消息属性          | Map(String, String)   |
| &#95;raw&#95;message  | 完整的 Pub/Sub 消息负载 (默认禁用)     | String                |

在仅需要完整 Pub/Sub 消息负载的场景中，可以使用 `_raw_message` 字段 (例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游 materialized view) 。对于此类 pipes，删除所有“非虚拟”列可能有助于提升 ClickPipes 性能。

## 限制 \{#limitations\}

* 不支持 [DEFAULT](/sql-reference/statements/create/table#default)。
* 使用最小 (XS) 副本规格运行时，单条消息默认限制为 8MB (未压缩) ；使用更大的副本时，限制为 16MB (未压缩) 。超过此限制的消息会被拒绝并报错。如果您需要更大的消息，请联系支持团队。
* Pub/Sub 订阅过滤器不可变——更改过滤表达式需要重新创建管道。
* 过滤器仅适用于消息属性，不适用于消息负载。

## 性能 \{#performance\}

### 批处理 \{#batching\}

ClickPipes 会按批次将数据插入 ClickHouse。这样做是为了避免在数据库中创建过多的 parts，从而导致集群性能问题。

当满足以下任一条件时，系统会插入一个批次：

* 批次大小达到上限 (每 1GB 副本内存对应 100,000 行或 32MB)
* 批次保持打开状态的时间达到上限 (5 秒)

### 延迟 \{#latency\}

延迟 (即 Pub/Sub 消息从发布到在 ClickHouse 中可用之间的时间) 取决于多种因素 (如发布端延迟、网络延迟以及消息大小/格式) 。上一节介绍的[批处理](#batching)也会影响延迟。我们始终建议针对您的具体使用场景进行测试，以了解预期的延迟水平。

如果您对低延迟有特定要求，请[联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 排序键 \{#ordering-keys\}

Pub/Sub 可保证具有相同[排序键](https://cloud.google.com/pubsub/docs/ordering)的消息按发布顺序传递给同一个订阅者。ClickPipes 默认对其托管订阅启用排序：当消息带有排序键时，订阅者会按顺序接收；当消息不带排序键时，行为保持不变。

如果生产者将所有消息都发布到少量排序键 (或单个键) 下，Pub/Sub 会将这些消息集中到少数几个订阅者，这可能会限制横向吞吐量。我们建议在不需要保证顺序时省略排序键，或者使用高基数的排序键。

### 扩缩容 \{#scaling\}

用于 Pub/Sub 的 ClickPipes 在设计上支持横向和纵向扩缩容。每个管道都使用一个托管的 Pub/Sub 订阅——此项不可配置。默认情况下，只有一个消费者从该订阅拉取数据；可在创建 ClickPipe 时增加消费者数量，也可随时在 **设置** -&gt; **高级设置** -&gt; **扩缩容** 中进行调整。ClickPipes 会自动将订阅中的消息分发给正在运行的消费者，无需额外协调。

ClickPipes 采用跨可用区分布的架构来提供高可用性；这要求至少将消费者数量扩缩容至两个。

无论运行中的消费者数量是多少，系统都在设计上具备容错能力。如果某个消费者或其底层基础设施发生故障，ClickPipes 会自动重启该消费者并继续处理消息。

### 投递语义 \{#delivery-semantics\}

用于 Pub/Sub 的 ClickPipes 提供**至少一次**投递。只有在对应的行已插入 ClickHouse 之后 (或者对于格式错误的记录，已写入错误表之后) ，Pub/Sub 消息才会被确认；所有消息在处理完成后都会被确认——包括被路由到错误表的错误记录——以避免无限次重新投递。如果某个副本在插入完成后、但在 ack 到达 Pub/Sub 之前崩溃，则该消息会在 ack 截止时间过后被重新投递并再次插入，因此下游消费者必须能够容忍重复。如果需要精确一次语义，请在下游使用 `_message_id` 虚拟列进行去重 (每个 Pub/Sub 消息 ID 在一个 topic 内都是唯一的) 。

## 身份验证 \{#authentication\}

用于 Pub/Sub 的 ClickPipes 通过服务账号 JSON 密钥向 GCP 进行身份验证。创建管道时，您需要上传该密钥文件；ClickPipes 会在静态存储时对其加密，并在运行时使用它来消费消息并管理托管订阅的生命周期。

有关所需 IAM 权限的完整列表以及推荐的自定义角色定义，请参阅 [Pub/Sub IAM 权限指南](./02_auth.md)。