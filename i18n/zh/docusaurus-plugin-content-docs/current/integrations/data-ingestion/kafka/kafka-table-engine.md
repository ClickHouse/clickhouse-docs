---
sidebar_label: 'Kafka 表引擎'
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: '使用 Kafka 表引擎'
title: '使用 Kafka 表引擎'
doc_type: 'guide'
keywords: ['kafka', 'table engine', 'streaming', 'real-time', 'message queue']
---

import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';

# 使用 Kafka 表引擎 \{#using-the-kafka-table-engine\}

Kafka 表引擎可用于从 Apache Kafka 以及其他兼容 Kafka API 的消息代理（例如 Redpanda、Amazon MSK）[**读取** 数据](#kafka-to-clickhouse)和向其[**写入** 数据](#clickhouse-to-kafka)。

### 从 Kafka 到 ClickHouse \{#kafka-to-clickhouse\}

:::note
如果您使用的是 ClickHouse Cloud，我们推荐改用 [ClickPipes](/integrations/clickpipes)。ClickPipes 原生支持私有网络连接、独立扩展摄取与集群资源，并为将 Kafka 流式数据导入 ClickHouse 提供全面的监控能力。
:::

要使用 Kafka 表引擎，您应当对 [ClickHouse 物化视图](../../../guides/developer/cascading-materialized-views.md) 有基本了解。

#### 概览 \{#overview\}

我们首先关注最常见的用例：使用 Kafka 表引擎将数据从 Kafka 插入到 ClickHouse 中。

Kafka 表引擎允许 ClickHouse 直接从 Kafka topic 读取数据。虽然这对于查看 topic 上的消息很有用，但从设计上来说，该引擎只允许一次性读取：即在对该表发起查询时，它会从队列中消费数据并推进 consumer offset，然后再将结果返回给调用方。实际上，在不重置这些 offset 的情况下，数据无法被重新读取。

为了将通过表引擎读取到的数据持久化，我们需要一种机制来捕获数据并将其插入到另一张表中。基于触发器的物化视图原生提供了此功能。物化视图会对表引擎发起读取，接收成批的文档。`TO` 子句决定数据的目标位置 —— 通常是一张 [MergeTree 引擎家族](../../../engines/table-engines/mergetree-family/index.md)中的表。如下图所示：

<Image img={kafka_01} size="lg" alt="Kafka 表引擎架构示意图" style={{width: '80%'}} />

#### 步骤 \{#steps\}

##### 1. 准备 \{#1-prepare\}

如果您已经在目标 topic 中写入了数据，可以基于您的数据集调整下面的内容。或者，您也可以使用这里提供的示例 Github 数据集：[链接](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)。该数据集在下面的示例中使用，采用了精简的 schema 和行子集（具体来说，我们仅保留与 [ClickHouse 仓库](https://github.com/ClickHouse/ClickHouse) 相关的 Github 事件），相较于[此处](https://ghe.clickhouse.tech/)提供的完整数据集更加简洁。即便如此，它仍足以支撑大多数与该数据集一起发布的查询示例：[链接](https://ghe.clickhouse.tech/)。

##### 2. 配置 ClickHouse \{#2-configure-clickhouse\}

如果您要连接到安全的 Kafka，则需要执行此步骤。这些设置无法通过 SQL DDL 命令传入，必须在 ClickHouse 的 config.xml 中进行配置。我们假设您要连接的是启用 SASL 的实例。这是在与 Confluent Cloud 交互时最简单的方法。

```xml
<clickhouse>
   <kafka>
       <sasl_username>username</sasl_username>
       <sasl_password>password</sasl_password>
       <security_protocol>sasl_ssl</security_protocol>
       <sasl_mechanisms>PLAIN</sasl_mechanisms>
   </kafka>
</clickhouse>
```

将上述代码片段放入 `conf.d/` 目录下的新文件中，或将其合并到现有配置文件中。有关可配置项，请参见[此处](../../../engines/table-engines/integrations/kafka.md#configuration)。

我们还将创建一个名为 `KafkaEngine` 的数据库，供本教程使用：

```sql
CREATE DATABASE KafkaEngine;
```

创建好数据库后，需要切换到该数据库：

```sql
USE KafkaEngine;
```

##### 3. 创建目标表 \{#3-create-the-destination-table\}

准备目标表。下面的示例中，为了简洁起见，我们使用了精简版的 GitHub 模式。请注意，尽管这里使用的是 MergeTree 表引擎，但该示例可以很容易地适配到 [MergeTree 系列表引擎家族](../../../engines/table-engines/mergetree-family/index.md) 的任意成员。

```sql
CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at)
```

##### 4. 创建并填充 topic \{#4-create-and-populate-the-topic\}

接下来，我们要创建一个 topic。可以使用多种工具来完成此操作。如果我们在本机或 Docker 容器中本地运行 Kafka，[RPK](https://docs.redpanda.com/current/get-started/rpk-install/) 是一个不错的选择。我们可以通过运行以下命令创建一个名为 `github`、包含 5 个分区的 topic：

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

如果我们在 Confluent Cloud 上运行 Kafka，我们可能更倾向于使用 [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records)：

```bash
confluent kafka topic create --if-not-exists github
```

现在我们需要向该 topic 写入一些数据，我们将使用 [kcat](https://github.com/edenhill/kcat) 来完成此操作。如果我们在本地运行未启用身份验证的 Kafka，可以执行类似如下的命令：

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

或者，如果 Kafka 集群使用 SASL 进行认证，请使用以下配置：

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username>  \
  -X sasl.password=<password> \
```

该数据集包含 200,000 行，因此应在几秒钟内完成摄取。若希望使用更大的数据集，请查看 GitHub 仓库 [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) 中的 [large datasets 小节](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)。

##### 5. 创建 Kafka 表引擎 \{#5-create-the-kafka-table-engine\}

下面的示例创建了一个与 MergeTree 表具有相同表结构的表引擎。这并不是硬性要求，因为你可以在目标表中定义别名列或临时列。不过，这些设置非常重要——请注意使用 `JSONEachRow` 作为从 Kafka 主题消费 JSON 时的数据格式。值 `github` 和 `clickhouse` 分别表示主题名称和消费组名称。主题实际上可以是一个值列表。

```sql
CREATE TABLE github_queue
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
)
   ENGINE = Kafka('kafka_host:9092', 'github', 'clickhouse',
            'JSONEachRow') SETTINGS kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

我们将在下文讨论引擎设置和性能调优。此时，对表 `github_queue` 执行一个简单的 select 查询应该就能读取到一些行。请注意，这会将 consumer offset 向前推进，除非进行[重置](#common-operations)，否则将无法再次读取这些行。还要注意这里的 limit 以及必需参数 `stream_like_engine_allow_direct_select.`

##### 6. 创建物化视图 \{#6-create-the-materialized-view\}

物化视图将连接前面创建的两个表，从 Kafka 表引擎中读取数据并将其插入到目标 MergeTree 表中。我们可以执行多种数据转换操作，这里我们只做一次简单的读取和插入。使用 * 时假定列名完全相同（区分大小写）。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

在创建时，物化视图会连接到 Kafka 引擎并开始读取数据，将行插入到目标表中。此过程会一直持续下去，后续写入 Kafka 的消息都会被消费。可以随时重新运行插入脚本，将更多消息插入 Kafka。

##### 7. 确认行已被插入 \{#7-confirm-rows-have-been-inserted\}

确认目标表中存在数据：

```sql
SELECT count() FROM github;
```

此时应能看到 200,000 行：

```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### 常见操作 \{#common-operations\}

##### 停止和重新启动消息消费 \{#stopping--restarting-message-consumption\}

要停止消息消费，可以分离 Kafka 引擎表：

```sql
DETACH TABLE github_queue;
```

这不会影响消费组的偏移量。要重新开始消费并从先前的偏移量继续，请重新附加该表。

```sql
ATTACH TABLE github_queue;
```

##### 添加 Kafka 元数据 \{#adding-kafka-metadata\}

在数据被摄取到 ClickHouse 之后，保留原始 Kafka 消息的元数据有时会很有用。例如，我们可能想知道自己已经消费了某个特定 topic 或 partition 的多少数据。为此，Kafka 表引擎提供了若干[虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)。通过修改 schema 和物化视图的 SELECT 语句，可以将这些虚拟列持久化为目标表中的实际列。

首先，在向目标表添加列之前，我们需要先执行上文所述的停止操作。

```sql
DETACH TABLE github_queue;
```

下面我们添加信息列，用于标识源主题以及该行来源的分区。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

接下来，我们需要确保按要求完成虚拟列的映射。
虚拟列都以 `_` 作为前缀。
完整的虚拟列列表可以在[此处](../../../engines/table-engines/integrations/kafka.md#virtual-columns)找到。

要用虚拟列更新我们的表，我们需要先删除物化视图，重新附加 Kafka 引擎表，然后重新创建物化视图。

```sql
DROP VIEW github_mv;
```

```sql
ATTACH TABLE github_queue;
```

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *, _topic AS topic, _partition as partition
FROM github_queue;
```

新写入的数据行应包含相应的元数据。

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

结果如下：

| actor&#95;login | event&#95;type     | created&#95;at      | topic  | partition |
| :-------------- | :----------------- | :------------------ | :----- | :-------- |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:22:00 | github | 0         |
| queeup          | CommitCommentEvent | 2011-02-12 02:23:23 | github | 0         |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:23:24 | github | 0         |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:24:50 | github | 0         |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:25:20 | github | 0         |
| dapi            | CommitCommentEvent | 2011-02-12 06:18:36 | github | 0         |
| sourcerebels    | CommitCommentEvent | 2011-02-12 06:34:10 | github | 0         |
| jamierumbelow   | CommitCommentEvent | 2011-02-12 12:21:40 | github | 0         |
| jpn             | CommitCommentEvent | 2011-02-12 12:24:31 | github | 0         |
| Oxonium         | CommitCommentEvent | 2011-02-12 12:31:28 | github | 0         |

##### 修改 Kafka 引擎设置 \{#modify-kafka-engine-settings\}

我们建议先删除 Kafka 引擎表，然后使用新设置重新创建该表。在此过程中无需修改物化视图；在 Kafka 引擎表重新创建后，消息消费将会自动恢复。

##### 调试问题 \{#debugging-issues\}

诸如身份验证问题之类的错误不会体现在 Kafka 引擎 DDL 的响应中。为诊断此类问题，我们建议使用 ClickHouse 主日志文件 clickhouse-server.err.log。可以通过配置启用底层 Kafka 客户端库 [librdkafka](https://github.com/edenhill/librdkafka) 的额外跟踪日志。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 处理格式错误的消息 \{#handling-malformed-messages\}

Kafka 经常被用作数据的“垃圾场”。这会导致某些主题中混杂多种消息格式且字段名不一致。应尽量避免这种情况，并利用 Kafka 的特性（例如 Kafka Streams 或 ksqlDB），在消息写入 Kafka 之前确保其结构良好且格式一致。如果无法采用这些选项，ClickHouse 提供了一些可帮助处理的功能。

* 将消息字段当作字符串处理。如果需要，可以在物化视图语句中使用函数进行清洗和类型转换。这不应作为生产级解决方案，但可能有助于一次性或临时的摄取。
* 如果你从主题中消费 JSON，并使用 JSONEachRow 格式，请使用设置 [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields)。在写入数据时，默认情况下，如果输入数据包含在目标表中不存在的列，ClickHouse 会抛出异常。然而，如果启用该选项，这些多余的列将被忽略。同样，这不是生产级别的解决方案，并且可能会让他人困惑。
* 考虑使用设置 `kafka_skip_broken_messages`。这要求用户在 `kafka_max_block_size` 的上下文中，为每个块指定对格式错误消息的容忍度。如果超出该容忍度（以消息的绝对数量计），则会恢复为通常的抛异常行为，并跳过其他消息。

##### 投递语义以及重复数据带来的挑战 \{#delivery-semantics-and-challenges-with-duplicates\}

Kafka 表引擎提供至少一次（at-least-once）投递语义。在某些已知的罕见情况下可能会出现重复。例如，消息可能已从 Kafka 读取并成功插入 ClickHouse，但在新偏移量提交之前，与 Kafka 的连接丢失。在这种情况下需要对该块进行重试。可以使用分布式表或以 ReplicatedMergeTree 作为目标表，对该块进行[去重](/engines/table-engines/mergetree-family/replication)。尽管这降低了重复行的概率，但它依赖于块完全相同。诸如 Kafka 再平衡之类的事件可能会打破这一假设，从而在极少数情况下导致重复。

##### 基于仲裁的写入 \{#quorum-based-inserts\}

当在 ClickHouse 中需要更高的投递保证时，你可能需要[基于仲裁的写入](/operations/settings/settings#insert_quorum)。这不能在物化视图或目标表上设置，但可以在用户配置文件上进行设置，例如：

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse 到 Kafka \{#clickhouse-to-kafka\}

尽管这是一个较少见的用例，ClickHouse 数据同样可以持久化到 Kafka 中。例如，我们将手动向一个 Kafka 表引擎中插入行。这些数据将由同一个 Kafka 表引擎读取，其物化视图会将数据写入一个 MergeTree 表。最后，我们演示如何在向 Kafka 插入数据时使用物化视图，从已有的源表读取数据。

#### 步骤 \{#steps-1\}

我们的初始目标可以通过下图更好地说明：

<Image img={kafka_02} size="lg" alt="Kafka 表引擎插入示意图" />

我们假设你已经按照 [Kafka to ClickHouse](#kafka-to-clickhouse) 的步骤创建了相关表和视图，并且对应主题中的消息已被完全消费。

##### 1. 直接插入行 \{#1-inserting-rows-directly\}

首先，确认目标表中的行数。

```sql
SELECT count() FROM github;
```

此时你应该有 200,000 行数据：

```response
┌─count()─┐
│  200000 │
└─────────┘
```

现在，将 GitHub 目标表中的行插入回 Kafka 表引擎 github&#95;queue 中。注意我们使用 JSONEachRow 格式，并将查询限制为 100 行。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

重新统计 GitHub 中的行数，以确认它已经增加了 100。正如上图所示，先通过 Kafka 表引擎将行插入到 Kafka，然后再由同一个引擎重新读取这些行，并通过我们的物化视图将它们插入到 GitHub 目标表中！

```sql
SELECT count() FROM github;
```

此时应能看到新增的 100 行：

```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. 使用物化视图 \{#2-using-materialized-views\}

当文档插入到表中时，我们可以利用物化视图将消息推送到 Kafka 引擎（以及某个 topic）。当行被插入到 GitHub 表时，会触发一个物化视图，将这些行再次写入 Kafka 引擎，并写入到一个新的 topic 中。示意如下：

<Image img={kafka_03} size="lg" alt="带有物化视图的 Kafka 表引擎示意图" />

创建一个新的 Kafka topic `github_out` 或等效的 topic。确保 Kafka 表引擎 `github_out_queue` 指向该 topic。

```sql
CREATE TABLE github_out_queue
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
)
   ENGINE = Kafka('host:port', 'github_out', 'clickhouse_out',
            'JSONEachRow') SETTINGS kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

现在创建一个新的物化视图 `github_out_mv`，指向 GitHub 表，当其被触发时将行插入到上述引擎中。这样，GitHub 表中的新增数据就会被推送到我们的新 Kafka 主题中。

```sql
CREATE MATERIALIZED VIEW github_out_mv TO github_out_queue AS
SELECT file_time, event_type, actor_login, repo_name,
       created_at, updated_at, action, comment_id, path,
       ref, ref_type, creator_user_login, number, title,
       labels, state, assignee, assignees, closed_at, merged_at,
       merge_commit_sha, requested_reviewers, merged_by,
       review_comments, member_login
FROM github
FORMAT JsonEachRow;
```

如果你向最初创建的 github topic 中插入数据（该 topic 是在 [Kafka to ClickHouse](#kafka-to-clickhouse) 步骤中创建的），这些文档会“魔法般地”出现在 &quot;github&#95;clickhouse&quot; topic 中。请使用原生 Kafka 工具进行确认。比如，在下面的示例中，我们使用 [kcat](https://github.com/edenhill/kcat) 向 Confluent Cloud 托管的 github topic 中插入 100 行数据：

```sql
head -n 10 github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username> \
  -X sasl.password=<password>
```

从 `github_out` 主题中读取应能确认消息已成功投递。

```sql
kcat -C \
  -b <host>:<port> \
  -t github_out \
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username> \
  -X sasl.password=<password> \
  -e -q |
wc -l
```

虽然这是一个复杂的示例，但它展示了物化视图与 Kafka 引擎结合使用时的强大能力。

### 集群与性能 \{#clusters-and-performance\}

#### 使用 ClickHouse 集群 \{#working-with-clickhouse-clusters\}

通过 Kafka consumer group，多个 ClickHouse 实例可以同时从同一个 topic 读取。每个 consumer 会以 1:1 的方式被分配到一个 topic 分区。当使用 Kafka 表引擎扩展 ClickHouse 的消费能力时，需要注意集群内 consumer 的总数量不能超过该 topic 的分区数。因此，请提前为该 topic 合理配置分区。

可以将多个 ClickHouse 实例都配置为使用相同的 consumer group id（在创建 Kafka 表引擎时指定）去读取同一个 topic。这样，每个实例会从一个或多个分区读取数据，并将数据片段插入到其本地的目标表中。目标表则可以配置为使用 ReplicatedMergeTree 来处理数据复制。只要 Kafka 分区数量充足，这种方法就可以随着 ClickHouse 集群扩展 Kafka 的读取能力。

<Image img={kafka_04} size="lg" alt="带有 ClickHouse 集群的 Kafka 表引擎示意图" />

#### 性能调优 \{#tuning-performance\}

在尝试提升 Kafka 引擎表吞吐性能时，请考虑以下几点：

* 性能会因消息大小、格式以及目标表类型而异。在单个表引擎上实现 100k 行/秒应是可达到的。默认情况下，消息以块的形式读取，由参数 kafka&#95;max&#95;block&#95;size 控制。该参数默认设置为 [max&#95;insert&#95;block&#95;size](/operations/settings/settings#max_insert_block_size)，默认值为 1,048,576。除非消息极其庞大，否则几乎总是应该增大该值。500k 到 1M 之间的取值很常见。请进行测试并评估其对吞吐性能的影响。
* 可以通过 kafka&#95;num&#95;consumers 增加表引擎的 consumer 数量。然而，默认情况下，除非将 kafka&#95;thread&#95;per&#95;consumer 从默认值 1 修改，否则插入会在单线程中线性化执行。将该值设为 1 可确保 flush 操作并行执行。注意，创建一个具有 N 个 consumer（并且 kafka&#95;thread&#95;per&#95;consumer=1）的 Kafka 引擎表，在逻辑上等价于创建 N 个 Kafka 引擎，每个都带有一个物化视图且 kafka&#95;thread&#95;per&#95;consumer=0。
* 增加 consumer 并不是零成本的操作。每个 consumer 都维护自己的缓冲区和线程，从而增加服务器开销。请注意 consumer 的额外开销，应优先在整个集群内做线性扩展，并在可行的情况下尽量采用这种方式。
* 如果 Kafka 消息的吞吐量具有波动且可以接受延迟，可以考虑增加 stream&#95;flush&#95;interval&#95;ms，以确保以更大的块进行 flush。
* [background&#95;message&#95;broker&#95;schedule&#95;pool&#95;size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) 用于设置执行后台任务的线程数。这些线程用于 Kafka 流式处理。该设置在 ClickHouse 服务器启动时生效，不能在用户会话中更改，默认值为 16。如果在日志中看到超时情况，适当增大该值可能是合适的。
* 与 Kafka 通信时使用的是 librdkafka 库，该库本身也会创建线程。大量的 Kafka 表或大量的 consumer 可能会导致大量上下文切换。可以将这部分负载分散到集群中，仅在可能的情况下对目标表进行复制，或者考虑使用一个表引擎从多个 topic 读取数据——支持值列表。多个物化视图可以从同一个表中读取数据，每个视图过滤出来自特定 topic 的数据。

任何设置更改都应进行测试。我们建议监控 Kafka 消费延迟（consumer lag），以确保你的扩缩容规模合适。

#### 其他设置 \{#additional-settings\}

除了上面讨论的设置之外，以下内容也可能有用：

* [Kafka&#95;max&#95;wait&#95;ms](/operations/settings/settings#kafka_max_wait_ms) - 从 Kafka 读取消息在重试前的等待时间（毫秒）。在用户配置文件（profile）级别进行设置，默认值为 5000。

底层 librdkafka 的[所有设置 ](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)也可以放在 ClickHouse 配置文件中的 *kafka* 元素内——设置名称应为 XML 元素，其名称中的点号需替换为下划线，例如：

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

这些属于高级配置，我们建议你查阅 Kafka 文档以获取更为详尽的说明。
