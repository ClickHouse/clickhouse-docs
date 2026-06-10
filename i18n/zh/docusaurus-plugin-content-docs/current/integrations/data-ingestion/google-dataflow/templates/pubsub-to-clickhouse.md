---
sidebar_label: 'Pub/Sub 到 ClickHouse'
sidebar_position: 2
slug: /integrations/google-dataflow/templates/pubsub-to-clickhouse
description: '您可以使用 Google Dataflow 模板将 JSON 消息从 Pub/Sub 流式导入 ClickHouse'
title: 'Dataflow Pub/Sub 到 ClickHouse 模板'
doc_type: 'guide'
keywords: ['Dataflow', 'Pub/Sub', 'PubSub', '流式', '死信']
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import pubsub_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/pubsub-inqueue-job.png'
import dataflow_create_job_from_template_button from '@site/static/images/integrations/data-ingestion/google-dataflow/create_job_from_template_button.png'

# Dataflow Pub/Sub 到 ClickHouse 模板 \{#dataflow-pubsub-to-clickhouse-template\}

Pub/Sub 到 ClickHouse 模板是一个流式管道，用于从 Pub/Sub 订阅中读取 JSON 编码的消息，并将其写入 ClickHouse 表。
无法解析或无法映射到目标 schema 的消息会被路由到死信目标端：ClickHouse 表、Pub/Sub topic，或同时写入两者。

<TOCInline toc={toc} maxHeadingLevel={2} />

## 管道要求 \{#pipeline-requirements\}

* 源端 Pub/Sub 订阅必须已存在。
* 发布到该订阅的消息必须是有效的 JSON。
* 目标 ClickHouse 表必须已存在，并且其列名必须与 JSON 载荷中的字段名匹配。
* Dataflow 工作线程 机器必须能够访问 ClickHouse 主机。
* 必须至少提供一个死信目标端 (`clickHouseDeadLetterTable` 或 `deadLetterTopic`) 。如果两者都提供，失败的消息会同时路由到这两个目标端。
* 设置 `clickHouseDeadLetterTable` 时，死信表必须已在 ClickHouse 中存在，且其 schema 必须与[死信处理](#dead-letter-handling)中所示一致。
* 设置 `deadLetterTopic` 时，Pub/Sub topic 必须已存在。

## Template 参数 \{#template-parameters\}

<br />

<br />

| Parameter Name              | Parameter Description                                                                                                           | Required | Notes                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `inputSubscription`         | 用于读取消息的 Pub/Sub 订阅。示例：`projects/<PROJECT_ID>/subscriptions/<SUBSCRIPTION_NAME>`。                                                | ✅        | 消息必须采用 JSON 编码。                                                                                                     |
| `clickHouseUrl`             | ClickHouse 端点 URL。SSL 连接使用 `https://` (ClickHouse Cloud) ，非 SSL 连接使用 `http://`。示例：`https://<HOST>:8443` 或 `http://<HOST>:8123`。 | ✅        | 对于 ClickHouse Cloud，请使用端口 `8443` 上的 HTTPS 端点。                                                                       |
| `clickHouseDatabase`        | 目标表所在的 ClickHouse 数据库名称。示例：`default`。                                                                                           | ✅        |                                                                                                                     |
| `clickHouseTable`           | 要写入数据的 ClickHouse 表名称。                                                                                                          | ✅        | 运行该管道前，该表必须已存在。                                                                                                     |
| `clickHouseUsername`        | 用于向 ClickHouse 进行身份验证的用户名。                                                                                                      | ✅        |                                                                                                                     |
| `clickHousePassword`        | 用于向 ClickHouse 进行身份验证的密码。                                                                                                       | ✅        |                                                                                                                     |
| `clickHouseDeadLetterTable` | 用于写入失败消息的 ClickHouse 表。示例：`my_table_dead_letter`。                                                                               |          | 必须至少提供 `clickHouseDeadLetterTable` 或 `deadLetterTopic` 之一。该表必须已存在，并且具有 [死信处理](#dead-letter-handling) 中所示的死信 schema。 |
| `deadLetterTopic`           | 用于发布失败消息的 Pub/Sub topic。示例：`projects/<PROJECT_ID>/topics/<TOPIC_NAME>`。                                                         |          | 必须至少提供 `clickHouseDeadLetterTable` 或 `deadLetterTopic` 之一。失败的负载会发布到该 topic，并将 `errorMessage` 和 `failedAt` 作为消息属性设置。 |
| `windowSeconds`             | 基于时间的批处理窗口时长 (秒) 。                                                                                                              |          | 关于它与 `batchRowCount` 的配合方式，请参见 [批处理与窗口](#batching-and-windowing)。如果两者都未设置，组合模式将使用默认值 `30s` 和 `1000` 行。              |
| `batchRowCount`             | 刷新到 ClickHouse 之前累积的行数。                                                                                                         |          | 关于它与 `windowSeconds` 的配合方式，请参见 [批处理与窗口](#batching-and-windowing)。                                                   |
| `maxInsertBlockSize`        | 发送到 ClickHouse 的每条 `INSERT` 语句的最大行数。默认为 `1,000,000`。                                                                            |          | `ClickHouseIO` 选项。                                                                                                  |
| `maxRetries`                | ClickHouse 插入失败时的最大重试次数。默认为 `5`。                                                                                                |          | `ClickHouseIO` 选项。                                                                                                  |
| `insertDeduplicate`         | 是否为复制表中的 `INSERT` 查询启用去重。默认为 `true`。                                                                                            |          | `ClickHouseIO` 选项。                                                                                                  |
| `insertQuorum`              | 对于复制表中的 `INSERT` 查询，等待指定数量的副本确认写入，并线性化数据写入操作。`0` 表示禁用 quorum 写入。                                                                |          | `ClickHouseIO` 选项。默认服务器级设置中禁用。                                                                                      |
| `insertDistributedSync`     | 如果启用，则写入分布式表的 `INSERT` 查询会等待数据发送到 cluster 中的所有节点。默认为 `true`。                                                                    |          | `ClickHouseIO` 选项。                                                                                                  |

:::note
所有 `ClickHouseIO` 参数的默认值可在 [`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters) 中找到。
:::

## 消息格式与 schema 映射 \{#message-format-and-schema-mapping\}

Pub/Sub 消息必须是 JSON 对象，且其顶层字段名必须与目标 ClickHouse 表的列名完全一致。

为将传入消息映射到目标表，管道会在启动时执行以下操作：

1. 拉取目标 ClickHouse 表的 schema。
2. 根据该 ClickHouse schema 构建 Beam `Row` schema。
3. 对每条传入的 Pub/Sub 消息，解析 JSON 负载，并读取 ClickHouse schema 中指定名称的字段来组装一行数据。

<br />

:::important
JSON 字段名必须与 ClickHouse 列名完全一致 (区分大小写) 。消息中与 ClickHouse 列不对应的字段会被忽略。如果某个 ClickHouse 列在 JSON 负载中没有对应字段，管道会尝试向该列写入 `NULL`——这仅在该列声明为 [`Nullable`](../../../sql-reference/data-types/nullable) 时才会成功。无法解析、其值无法转换为列类型，或会向不可为 null 的列写入 `NULL` 的消息，都会被路由到死信目标端。
:::

### 类型转换 \{#type-conversion\}

JSON 值会被转换为对应的 ClickHouse 列类型：

| ClickHouse 类型                                                                      | 说明                                                 |
| ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| [`Float32`](../../../sql-reference/data-types/float)                               | 通过 `Float.valueOf` 解析。                             |
| [`Float64`](../../../sql-reference/data-types/float)                               | 通过 `Double.valueOf` 解析。                            |
| [`Date`](../../../sql-reference/data-types/date)                                   | 解析为 ISO-8601 日期字符串。                                |
| [`DateTime`](../../../sql-reference/data-types/datetime)                           | 解析为 ISO-8601 日期时间字符串 (例如 `2026-01-15T12:34:56Z`) 。 |
| [`Array(T)`](../../../sql-reference/data-types/array)                              | JSON 数组；每个元素都会转换为元素类型 `T`。空数组或缺失的数组字段会生成空数组。       |
| Integer types (`Int8`/`Int16`/`Int32`/`Int64`, `UInt8`/`UInt16`/`UInt32`/`UInt64`) | 从 JSON 数值或其字符串表示形式中解析。                             |
| [`String`](../../../sql-reference/data-types/string)                               | 文本字段按原样使用；非文本 JSON 节点会被序列化为其 JSON 字符串表示形式。         |

## 批处理与窗口化 \{#batching-and-windowing\}

由于该管道采用流式处理，传入的数据行会先累积到窗口中，然后再刷写到 ClickHouse。窗口化策略取决于你提供的参数：

| `windowSeconds` | `batchRowCount` | 行为                                      |
| --------------- | --------------- | --------------------------------------- |
| set             | unset           | 基于时间的固定窗口，窗口时长为 `windowSeconds`。        |
| unset           | set             | 带计数触发条件的全局窗口；每累计 `batchRowCount` 行触发一次。 |
| both set        | both set        | 带组合触发条件的全局窗口；哪个条件先满足就先触发 (时间**或**行数) 。  |
| neither set     | neither set     | 使用默认值的组合模式：`30` 秒或 `1000` 行，以先满足的条件为准。  |

调整这些值时，需要在延迟和插入效率之间权衡。较小的窗口可降低端到端延迟；较大的窗口会生成更少但更大的 `INSERT` 批次。

## 死信处理 \{#dead-letter-handling\}

无法通过 JSON 解析、schema 映射或类型强制转换的消息会被路由到已配置的死信目标端。必须至少提供 `clickHouseDeadLetterTable` 或 `deadLetterTopic` 其中之一；如果两者都已设置，则失败消息会同时发送到这两个目标端。

### ClickHouse 死信表 \{#clickhouse-dead-letter-table\}

设置 `clickHouseDeadLetterTable` 后，死信表必须已存在，并使用以下固定 schema：

| 列               | 类型         | 描述                             |
| --------------- | ---------- | ------------------------------ |
| `raw_message`   | `String`   | 原始 Pub/Sub 消息负载，采用 UTF-8 文本格式。 |
| `error_message` | `String`   | 描述该行失败原因的异常消息。                 |
| `stack_trace`   | `String`   | 失败时捕获的完整 Java 堆栈跟踪。            |
| `failed_at`     | `DateTime` | 记录该行失败时处理时间的时间戳。               |

适用于单节点部署的最小定义：

```sql
CREATE TABLE my_table_dead_letter (
    raw_message   String,
    error_message String,
    stack_trace   String,
    failed_at     DateTime
) ENGINE = MergeTree()
ORDER BY failed_at;
```

:::note
请根据您的部署情况调整引擎和 `ORDER BY` 子句：复制表使用 `ReplicatedMergeTree`，分布式部署添加 `ON CLUSTER`，并按需调整分区或生存时间 (TTL)。
:::

### Pub/Sub 死信 topic \{#pubsub-dead-letter-topic\}

设置 `deadLetterTopic` 后，每条失败的消息都会重新发布到该 topic，并带有：

* **负载**：原始消息字节。
* **属性** `errorMessage`：失败时捕获到的异常消息。
* **属性** `failedAt`：该行失败时的处理时间戳。

这样，在底层 schema 或生产者问题解决后，就可以方便地重放失败的消息。

## 运行模板 \{#running-the-template\}

可通过 Google Cloud Console 使用 Pub/Sub to ClickHouse 模板。

:::note
请务必通读本文档，尤其是上述各节，以充分了解该模板的配置要求和前置条件。
:::

登录 Google Cloud Console 并搜索 Dataflow。

1. 点击 `CREATE JOB FROM TEMPLATE` 按钮。
   <Image img={dataflow_create_job_from_template_button} border alt="Dataflow 控制台" />

2. 打开模板表单后，输入作业名称并选择所需区域。

   {/* PLACEHOLDER: 添加 Pub/Sub to ClickHouse 模板初始表单（作业名称 + 区域）的截图 */ }

3. 在 `Dataflow Template` 输入框中，输入 `ClickHouse` 或 `Pub/Sub`，然后选择 `Pub/Sub to ClickHouse` 模板。

   {/* PLACEHOLDER: 添加从下拉菜单中选择“Pub/Sub to ClickHouse”模板的截图 */ }

4. 选择后，表单会展开。请填写：

   * Pub/Sub 输入订阅，格式为 `projects/<PROJECT_ID>/subscriptions/<SUBSCRIPTION_NAME>`。
   * ClickHouse 端点 URL——对于 ClickHouse Cloud，请使用 `https://<HOST>:8443`。
   * ClickHouse 数据库、目标表、用户名和密码。
   * 至少一个死信目标端：ClickHouse 表或 Pub/Sub topic (或两者都填) 。

   {/* PLACEHOLDER: 添加展开后的 Pub/Sub to ClickHouse 模板表单截图，显示必填字段和死信部分 */ }

5. 您也可以按需自定义批处理 (`windowSeconds`、`batchRowCount`) 和 `ClickHouseIO` 调优参数，详见[模板参数](#template-parameters)部分。

### 监控作业 \{#monitor-the-job\}

前往 Google Cloud Console 中的 [Dataflow 作业页面](https://console.cloud.google.com/dataflow/jobs)，监控作业状态。你可以查看作业详情，包括进度和任何错误：

<Image img={pubsub_inqueue_job} size="lg" border alt="Dataflow 控制台显示正在运行的从 Pub/Sub 到 ClickHouse 的作业" />

该模板还会在 `PubSubToClickHouse` 命名空间下导出以下自定义指标，可在 Dataflow 作业页面中查看：

| 指标                      | 类型  | 说明                             |
| ----------------------- | --- | ------------------------------ |
| `messages-received`     | 计数器 | 解析步骤接收到的 Pub/Sub 消息总数。         |
| `rows-parsed-ok`        | 计数器 | 已成功转换为一行并路由到主输出的消息数。           |
| `rows-parse-failed`     | 计数器 | 解析或 schema 映射失败并被路由到死信队列的消息数。  |
| `message-payload-bytes` | 分布  | 传入 Pub/Sub 消息负载大小的分布 (单位为字节) 。 |

## 故障排查 \{#troubleshooting\}

### 超出内存限制 (总量) 错误 (代码 241) \{#code-241-dbexception-memory-limit-total-exceeded\}

当 ClickHouse 在处理大批次数据时内存耗尽，就会出现此错误。要解决此问题：

* 增加实例资源：将 ClickHouse server 升级到内存更大的实例，以承载数据处理负载。
* 减小批次大小：在 Dataflow 作业配置中减小 `batchRowCount` (和/或 `maxInsertBlockSize`) ，向 ClickHouse 发送更小的数据块，从而降低每个批次的内存消耗。

### 所有消息都被发送到死信目标端 \{#all-messages-going-to-dlq\}

最常见的原因包括：

* JSON 字段名与 ClickHouse 列名不完全一致 (匹配区分大小写) 。
* 列类型无法从 JSON 值强制转换而来 (例如，在 `DateTime` 列中使用非 ISO-8601 格式的字符串) 。
* 自管道启动以来，目标表的 schema 已发生变化——schema 只会在启动时拉取一次。应用 schema 变更后，请重启作业。

检查 ClickHouse 死信表中的 `error_message` 和 `stack_trace` 列 (或 Pub/Sub 死信消息上的 `errorMessage` 属性) ，以确定根本原因。

### 管道已启动，但没有行写入 ClickHouse \{#no-rows-arriving\}

* 确认订阅正在接收消息——检查 Dataflow 作业页面上的 `messages-received` 指标。
* 在基于时间的模式下 (仅使用 `windowSeconds`) ，只有在窗口边界处才会刷写行。调低 `windowSeconds` 以确认是否发生了刷写。
* 验证 Dataflow 工作线程与 ClickHouse 端点之间的网络连通性 (防火墙、VPC 对等连接或 Private Service Connect) 。

## Template 源代码 \{#template-source-code\}

该模板的源代码可在以下位置获取：

* [`GoogleCloudPlatform/DataflowTemplates`](https://github.com/GoogleCloudPlatform/DataflowTemplates/tree/main/v2/googlecloud-to-clickhouse) — Google Cloud Platform 的上游仓库。
* [`ClickHouse/DataflowTemplates`](https://github.com/ClickHouse/DataflowTemplates) — ClickHouse 的 fork 版本。