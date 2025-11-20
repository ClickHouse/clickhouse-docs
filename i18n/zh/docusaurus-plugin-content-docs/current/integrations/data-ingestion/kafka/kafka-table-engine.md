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


# 使用 Kafka 表引擎

Kafka 表引擎可用于从 Apache Kafka 及其他兼容 Kafka API 的代理(如 Redpanda、Amazon MSK)[**读取**数据](#kafka-to-clickhouse)和[**写入**数据](#clickhouse-to-kafka)。

### 从 Kafka 到 ClickHouse {#kafka-to-clickhouse}

:::note
如果您使用 ClickHouse Cloud,我们建议改用 [ClickPipes](/integrations/clickpipes)。ClickPipes 原生支持私有网络连接、独立扩展数据摄取和集群资源,并为 Kafka 数据流式传输到 ClickHouse 提供全面的监控能力。
:::

要使用 Kafka 表引擎,您需要对 [ClickHouse 物化视图](../../../guides/developer/cascading-materialized-views.md)有基本了解。

#### 概述 {#overview}

首先,我们关注最常见的使用场景:使用 Kafka 表引擎将数据从 Kafka 导入到 ClickHouse。

Kafka 表引擎允许 ClickHouse 直接从 Kafka 主题读取数据。虽然这对于查看主题中的消息很有用,但该引擎在设计上仅允许一次性读取,即当对表发起查询时,它会从队列中消费数据并在向调用方返回结果之前增加消费者偏移量。实际上,如果不重置这些偏移量,数据将无法重新读取。

要持久化从表引擎读取的数据,我们需要一种方法来捕获数据并将其插入到另一个表中。基于触发器的物化视图原生提供了此功能。物化视图会在表引擎上发起读取操作,接收批量数据。TO 子句决定数据的目标位置 - 通常是 [MergeTree 系列](../../../engines/table-engines/mergetree-family/index.md)的表。此过程如下图所示:

<Image
  img={kafka_01}
  size='lg'
  alt='Kafka 表引擎架构图'
  style={{ width: "80%" }}
/>

#### 操作步骤 {#steps}

##### 1. 准备工作 {#1-prepare}

如果您的目标主题中已有数据,可以根据您的数据集调整以下内容。或者,您也可以使用[此处](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)提供的示例 Github 数据集。下面的示例使用了该数据集,为简洁起见,它采用了简化的模式和行数据子集(具体来说,我们仅限于与 [ClickHouse 仓库](https://github.com/ClickHouse/ClickHouse)相关的 Github 事件),相比[此处](https://ghe.clickhouse.tech/)提供的完整数据集。这仍然足以运行[随数据集发布的](https://ghe.clickhouse.tech/)大多数查询。

##### 2. 配置 ClickHouse {#2-configure-clickhouse}

如果您要连接到安全的 Kafka,则需要执行此步骤。这些设置无法通过 SQL DDL 命令传递,必须在 ClickHouse 的 config.xml 中配置。我们假设您正在连接到启用了 SASL 安全认证的实例。这是与 Confluent Cloud 交互时最简单的方法。

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

将上述代码片段放置在 conf.d/ 目录下的新文件中,或将其合并到现有配置文件中。有关可配置的设置,请参阅[此处](../../../engines/table-engines/integrations/kafka.md#configuration)。

我们还将创建一个名为 `KafkaEngine` 的数据库用于本教程:

```sql
CREATE DATABASE KafkaEngine;
```

创建数据库后,需要切换到该数据库:

```sql
USE KafkaEngine;
```

##### 3. 创建目标表 {#3-create-the-destination-table}

准备目标表。在下面的示例中,为简洁起见,我们使用简化的 GitHub 模式。请注意,虽然我们使用 MergeTree 表引擎,但此示例可以轻松适配 [MergeTree 系列](../../../engines/table-engines/mergetree-family/index.md)的任何成员。


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

##### 4. 创建并填充主题 {#4-create-and-populate-the-topic}

接下来,我们将创建一个主题。可以使用多种工具来完成此操作。如果在本地机器或 Docker 容器内运行 Kafka,[RPK](https://docs.redpanda.com/current/get-started/rpk-install/) 是一个不错的选择。可以通过运行以下命令创建一个名为 `github` 的主题,包含 5 个分区:

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

如果在 Confluent Cloud 上运行 Kafka,可能更倾向于使用 [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records):

```bash
confluent kafka topic create --if-not-exists github
```

现在需要向该主题填充一些数据,我们将使用 [kcat](https://github.com/edenhill/kcat) 来完成。如果在本地运行 Kafka 且禁用了身份验证,可以运行类似以下的命令:

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

或者,如果 Kafka 集群使用 SASL 进行身份验证,则运行以下命令:

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


该数据集包含 200,000 行数据,因此应该在几秒钟内完成导入。如果您想使用更大的数据集,请查看 [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHub 仓库中的[大型数据集部分](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)。

##### 5. 创建 Kafka 表引擎 {#5-create-the-kafka-table-engine}

下面的示例创建了一个与 MergeTree 表具有相同模式的表引擎。这并非严格要求,因为您可以在目标表中使用别名列或临时列。但是,设置很重要 - 请注意使用 `JSONEachRow` 作为从 Kafka 主题消费 JSON 数据的数据类型。值 `github` 和 `clickhouse` 分别代表主题名称和消费者组名称。主题实际上可以是一个值列表。

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

我们将在下文讨论引擎设置和性能调优。此时,对表 `github_queue` 执行简单的查询应该能读取一些行。请注意,这将使消费者偏移量向前移动,如果不进行[重置](#common-operations),这些行将无法被重新读取。请注意限制和必需参数 `stream_like_engine_allow_direct_select`。

##### 6. 创建物化视图 {#6-create-the-materialized-view}

物化视图将连接之前创建的两个表,从 Kafka 表引擎读取数据并将其插入到目标 MergeTree 表中。我们可以执行多种数据转换。这里我们将执行简单的读取和插入操作。使用 \* 假定列名完全相同(区分大小写)。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```


在创建时,物化视图会连接到 Kafka 引擎并开始读取数据,将行插入到目标表中。此过程将持续运行,后续插入到 Kafka 的消息会被持续消费。您可以随时重新运行插入脚本以向 Kafka 插入更多消息。

##### 7. 确认行已插入 {#7-confirm-rows-have-been-inserted}

确认目标表中存在数据:

```sql
SELECT count() FROM github;
```

您应该看到 200,000 行:

```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### 常见操作 {#common-operations}

##### 停止和重启消息消费 {#stopping--restarting-message-consumption}

要停止消息消费,您可以分离 Kafka 引擎表:

```sql
DETACH TABLE github_queue;
```

这不会影响消费者组的偏移量。要重启消费并从之前的偏移量继续,请重新附加该表。

```sql
ATTACH TABLE github_queue;
```

##### 添加 Kafka 元数据 {#adding-kafka-metadata}

在数据被摄取到 ClickHouse 后,跟踪原始 Kafka 消息的元数据可能很有用。例如,我们可能想知道已经消费了特定主题或分区的多少数据。为此,Kafka 表引擎提供了几个[虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)。通过修改模式和物化视图的 select 语句,可以将这些虚拟列作为列持久化到目标表中。

首先,在向目标表添加列之前,我们执行上述的停止操作。

```sql
DETACH TABLE github_queue;
```

下面我们添加信息列来标识源主题和行来源的分区。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

接下来,我们需要确保虚拟列按要求映射。
虚拟列以 `_` 为前缀。
虚拟列的完整列表可以在[这里](../../../engines/table-engines/integrations/kafka.md#virtual-columns)找到。

要使用虚拟列更新表,我们需要删除物化视图,重新附加 Kafka 引擎表,然后重新创建物化视图。

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

新消费的行应该包含元数据。

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

结果如下所示:

| actor_login   | event_type         | created_at          | topic  | partition |
| :------------ | :----------------- | :------------------ | :----- | :-------- |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:22:00 | github | 0         |
| queeup        | CommitCommentEvent | 2011-02-12 02:23:23 | github | 0         |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:23:24 | github | 0         |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:24:50 | github | 0         |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:25:20 | github | 0         |
| dapi          | CommitCommentEvent | 2011-02-12 06:18:36 | github | 0         |
| sourcerebels  | CommitCommentEvent | 2011-02-12 06:34:10 | github | 0         |
| jamierumbelow | CommitCommentEvent | 2011-02-12 12:21:40 | github | 0         |
| jpn           | CommitCommentEvent | 2011-02-12 12:24:31 | github | 0         |
| Oxonium       | CommitCommentEvent | 2011-02-12 12:31:28 | github | 0         |

##### 修改 Kafka 引擎设置 {#modify-kafka-engine-settings}

我们建议删除 Kafka 引擎表并使用新设置重新创建它。在此过程中不需要修改物化视图——一旦重新创建 Kafka 引擎表,消息消费将自动恢复。

##### 调试问题 {#debugging-issues}


身份验证问题等错误不会在 Kafka 引擎 DDL 的响应中报告。为了诊断问题,建议使用 ClickHouse 主日志文件 clickhouse-server.err.log。可以通过配置启用底层 Kafka 客户端库 [librdkafka](https://github.com/edenhill/librdkafka) 的详细跟踪日志。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 处理格式错误的消息 {#handling-malformed-messages}

Kafka 经常被用作数据的"倾倒场"。这会导致主题包含混合的消息格式和不一致的字段名称。应避免这种情况,利用 Kafka Streams 或 ksqlDB 等 Kafka 功能来确保消息在插入 Kafka 之前格式良好且一致。如果这些选项不可行,ClickHouse 提供了一些可以帮助的功能。

- 将消息字段视为字符串。如果需要,可以在物化视图语句中使用函数来执行清理和类型转换。这不应作为生产解决方案,但可能有助于一次性数据摄取。
- 如果您使用 JSONEachRow 格式从主题消费 JSON,请使用设置 [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields)。在写入数据时,默认情况下,如果输入数据包含目标表中不存在的列,ClickHouse 会抛出异常。但是,如果启用此选项,这些多余的列将被忽略。同样,这不是生产级别的解决方案,可能会让其他人感到困惑。
- 考虑使用设置 `kafka_skip_broken_messages`。这要求用户指定每个块对格式错误消息的容忍级别 - 在 kafka_max_block_size 的上下文中考虑。如果超过此容忍度(以绝对消息数衡量),将恢复通常的异常行为,并跳过其他消息。

##### 传递语义和重复数据的挑战 {#delivery-semantics-and-challenges-with-duplicates}

Kafka 表引擎具有至少一次(at-least-once)语义。在几种已知的罕见情况下可能出现重复数据。例如,消息可能从 Kafka 读取并成功插入到 ClickHouse 中。在新偏移量提交之前,与 Kafka 的连接丢失。在这种情况下需要重试该块。可以使用分布式表或 ReplicatedMergeTree 作为目标表对该块进行[去重](/engines/table-engines/mergetree-family/replication)。虽然这降低了重复行的可能性,但它依赖于相同的块。诸如 Kafka 重新平衡等事件可能会使这一假设失效,在罕见情况下导致重复数据。

##### 基于仲裁的插入 {#quorum-based-inserts}

对于在 ClickHouse 中需要更高传递保证的情况,您可能需要[基于仲裁的插入](/operations/settings/settings#insert_quorum)。这不能在物化视图或目标表上设置。但是,可以为用户配置文件设置,例如:

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse 到 Kafka {#clickhouse-to-kafka}

虽然这是一个较少见的用例,但 ClickHouse 数据也可以持久化到 Kafka 中。例如,我们将手动向 Kafka 表引擎插入行。这些数据将由同一个 Kafka 引擎读取,其物化视图将把数据放入 MergeTree 表中。最后,我们演示在插入到 Kafka 时应用物化视图从现有源表读取数据的方法。

#### 步骤 {#steps-1}

我们的初始目标最好通过以下图示说明:

<Image img={kafka_02} size='lg' alt='带插入操作的 Kafka 表引擎图' />

我们假设您已经按照 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 的步骤创建了表和视图,并且主题已被完全消费。

##### 1. 直接插入行 {#1-inserting-rows-directly}

首先,确认目标表的行数。

```sql
SELECT count() FROM github;
```

您应该有 200,000 行:

```response
┌─count()─┐
│  200000 │
└─────────┘
```

现在将行从 GitHub 目标表插入回 Kafka 表引擎 github_queue。注意我们如何使用 JSONEachRow 格式并将选择限制为 100 行。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

重新计算 GitHub 中的行数以确认它增加了 100。如上图所示,行已通过 Kafka 表引擎插入到 Kafka 中,然后由同一引擎重新读取,并通过我们的物化视图插入到 GitHub 目标表中!

```sql
SELECT count() FROM github;
```


您应该看到额外增加的 100 行数据：

```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. 使用物化视图 {#2-using-materialized-views}

我们可以利用物化视图在向表中插入数据时将消息推送到 Kafka 引擎（及其主题）。当向 GitHub 表插入行时，会触发物化视图，使这些行被重新插入到 Kafka 引擎和新主题中。下图可以更好地说明这一过程：

<Image
  img={kafka_03}
  size='lg'
  alt='Kafka 表引擎与物化视图示意图'
/>

创建一个新的 Kafka 主题 `github_out` 或等效主题。确保 Kafka 表引擎 `github_out_queue` 指向此主题。

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

现在创建一个新的物化视图 `github_out_mv` 指向 GitHub 表，在触发时将行插入到上述引擎中。这样，对 GitHub 表的新增数据将被推送到我们的新 Kafka 主题。

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


如果您向原始 github 主题插入数据(该主题是作为 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 的一部分创建的),文档将自动出现在 "github_clickhouse" 主题中。可以使用原生 Kafka 工具来确认这一点。例如,下面我们使用 [kcat](https://github.com/edenhill/kcat) 向 Confluent Cloud 托管的 github 主题插入 100 行数据:

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

读取 `github_out` 主题应该可以确认消息已成功投递。

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

尽管这是一个较为复杂的示例,但它展示了物化视图与 Kafka 引擎结合使用时的强大功能。

### 集群与性能 {#clusters-and-performance}

#### 使用 ClickHouse 集群 {#working-with-clickhouse-clusters}

通过 Kafka 消费者组,多个 ClickHouse 实例可以从同一个主题读取数据。每个消费者将以 1:1 的映射关系分配到一个主题分区。在使用 Kafka 表引擎扩展 ClickHouse 消费能力时,需要注意集群内的消费者总数不能超过主题的分区数。因此,请确保提前为主题配置适当的分区。

可以将多个 ClickHouse 实例配置为使用相同的消费者组 ID 从主题读取数据——该 ID 在创建 Kafka 表引擎时指定。这样,每个实例将从一个或多个分区读取数据,并将数据段插入到其本地目标表中。目标表可以配置为使用 ReplicatedMergeTree 来处理数据的复制。这种方法允许 Kafka 读取能力随 ClickHouse 集群扩展,前提是有足够的 Kafka 分区。

<Image
  img={kafka_04}
  size='lg'
  alt='Kafka 表引擎与 ClickHouse 集群示意图'
/>

#### 性能调优 {#tuning-performance}

在提高 Kafka 引擎表吞吐性能时,请考虑以下几点:

- 性能会因消息大小、格式和目标表类型而异。单个表引擎达到 100k 行/秒应该是可以实现的。默认情况下,消息以块的形式读取,由参数 kafka_max_block_size 控制。默认情况下,该参数设置为 [max_insert_block_size](/operations/settings/settings#max_insert_block_size),默认值为 1,048,576。除非消息非常大,否则几乎总是应该增加此值。500k 到 1M 之间的值并不少见。请测试并评估对吞吐性能的影响。
- 可以使用 kafka_num_consumers 增加表引擎的消费者数量。但是,默认情况下,除非将 kafka_thread_per_consumer 从默认值 0 更改为 1,否则插入操作将在单个线程中串行化。将此值设置为 1 以确保并行执行刷新操作。请注意,创建一个具有 N 个消费者(且 kafka_thread_per_consumer=1)的 Kafka 引擎表,在逻辑上等同于创建 N 个 Kafka 引擎,每个引擎都有一个物化视图且 kafka_thread_per_consumer=0。
- 增加消费者并非没有代价。每个消费者都维护自己的缓冲区和线程,增加了服务器的开销。请注意消费者的开销,如果可能,优先在集群中线性扩展。
- 如果 Kafka 消息的吞吐量是可变的且可以接受延迟,请考虑增加 stream_flush_interval_ms 以确保刷新更大的数据块。
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) 设置执行后台任务的线程数。这些线程用于 Kafka 流式传输。此设置在 ClickHouse 服务器启动时应用,无法在用户会话中更改,默认值为 16。如果在日志中看到超时,可能需要增加此值。
- 与 Kafka 通信使用 librdkafka 库,该库本身会创建线程。因此,大量的 Kafka 表或消费者可能导致大量的上下文切换。可以在集群中分配此负载,如果可能只复制目标表,或者考虑使用表引擎从多个主题读取——支持值列表。可以从单个表读取多个物化视图,每个视图过滤来自特定主题的数据。


任何设置更改都应进行测试。我们建议监控 Kafka 消费者延迟，以确保您已正确配置扩展。

#### 其他设置 {#additional-settings}

除了上述讨论的设置之外,以下设置可能也值得关注:

- [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - 从 Kafka 读取消息时重试前的等待时间(毫秒)。在用户配置文件级别设置,默认值为 5000。

底层 librdkafka 的[所有设置](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)也可以放置在 ClickHouse 配置文件的 _kafka_ 元素中 - 设置名称应为 XML 元素,其中句点替换为下划线,例如:

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

这些是高级设置,我们建议您参考 Kafka 文档以获取详细说明。
