---
sidebar_label: 'Kafka 表引擎'
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: '使用 Kafka 表引擎'
---
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# 使用 Kafka 表引擎

<CloudNotSupportedBadge/>

:::note
Kafka 表引擎不支持在 [ClickHouse Cloud](https://clickhouse.com/cloud) 上运行。请考虑使用 [ClickPipes](../clickpipes/kafka.md) 或 [Kafka Connect](./kafka-clickhouse-connect-sink.md)
:::

### Kafka 到 ClickHouse {#kafka-to-clickhouse}

要使用 Kafka 表引擎，您应该对 [ClickHouse 物化视图](../../../guides/developer/cascading-materialized-views.md)有一定的了解。

#### 概述 {#overview}

最初，我们关注最常见的用例：使用 Kafka 表引擎将数据从 Kafka 插入 ClickHouse。

Kafka 表引擎允许 ClickHouse 直接从 Kafka 主题读取数据。虽然在查看主题消息时很有用，但该引擎设计上只允许一次性检索，即当对表发出查询时，它会从队列中消费数据并在返回结果给调用者之前增加消费者偏移量。实际上，数据在没有重置这些偏移量的情况下是无法被重新读取的。

为了持久存储从表引擎读取的这些数据，我们需要一种捕捉数据并将其插入另一个表的方法。基于触发器的物化视图本质上提供了此功能。物化视图会启动对表引擎的读取，接收批量文档。TO 子句确定数据的目的地 - 通常是 [Merge Tree 家族](../../../engines/table-engines/mergetree-family/index.md)的一张表。这个过程如下图所示：

<img src={kafka_01} class="image" alt="Kafka 表引擎" style={{width: '80%'}} />

#### 步骤 {#steps}


##### 1. 准备 {#1-prepare}

如果您在目标主题上已填充数据，可以根据以下内容进行调整以用于您的数据集。或者，提供一个示例的 GitHub 数据集 [here](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)。该数据集在以下示例中使用，并使用简化的架构和子集行（具体来说，我们限制为与 [ClickHouse 仓库](https://github.com/ClickHouse/ClickHouse) 相关的 GitHub 事件），与可用的完整数据集相比，目的是简洁性。尽管如此，这仍然足以使 [与数据集发布的查询](https://ghe.clickhouse.tech/) 中的大多数查询正常工作。


##### 2. 配置 ClickHouse {#2-configure-clickhouse}

如果您要连接到安全的 Kafka，则需要此步骤。这些设置不能通过 SQL DDL 命令传递，必须在 ClickHouse config.xml 中配置。我们假设您连接到一个 SASL 安全实例。这是在与 Confluent Cloud 交互时最简单的方法。

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

将上述片段放入您的 conf.d/ 目录下的新文件中，或将其合并到现有配置文件中。有关可以配置的设置，请参见 [here](../../../engines/table-engines/integrations/kafka.md#configuration)。

我们还将在本教程中创建一个名为 `KafkaEngine` 的数据库：

```sql
CREATE DATABASE KafkaEngine;
```

创建数据库后，您需要切换到它：

```sql
USE KafkaEngine;
```

##### 3. 创建目标表 {#3-create-the-destination-table}

准备您的目标表。在下面的示例中，我们使用简化的 GitHub 架构以便于说明。请注意，尽管我们使用 MergeTree 表引擎，但该示例可以轻松适配任何 [MergeTree 家族](../../../engines/table-engines/mergetree-family/index.md) 的成员。

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

接下来，我们将创建一个主题。我们可以使用多种工具来做到这一点。如果我们在本地计算机或 Docker 容器中运行 Kafka，使用 [RPK](https://docs.redpanda.com/current/get-started/rpk-install/) 很不错。我们可以通过运行以下命令创建一个名为 `github` 的主题，并指定 5 个分片：

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

如果我们在 Confluent Cloud 上运行 Kafka，可能更倾向于使用 [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records)：

```bash
confluent kafka topic create --if-not-exists github
```

现在我们需要填充此主题一些数据，我们将使用 [kcat](https://github.com/edenhill/kcat) 来完成。 如果我们在本地运行 Kafka 且未启用身份验证，可以运行类似以下命令：

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

如果我们的 Kafka 集群使用 SASL 进行身份验证，则可使用以下命令：

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

该数据集包含 200,000 行，因此应在几秒钟内完成摄取。如果您希望处理更大的数据集，请查看 [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHub 存储库中的 [大型数据集部分](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)。

##### 5. 创建 Kafka 表引擎 {#5-create-the-kafka-table-engine}

以下示例创建了一个与合并树表相同架构的表引擎。这并不是严格要求的，因为您可以在目标表中使用别名或临时列。然而，设置很重要 - 请注意在从 Kafka 主题消费 JSON 时使用 `JSONEachRow` 作为数据类型。值 `github` 和 `clickhouse` 分别表示主题名和消费者组名称。主题实际上可以是多个值的列表。

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
            'JSONEachRow') settings kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

我们下面讨论引擎设置和性能调优。在这一点上，对表 `github_queue` 的简单选择应该能读取一些行。 请注意，这将使消费者偏移量向前移动，阻止在没有 [重置](#common-operations) 的情况下重新读取这些行。 请注意限制和必需的参数 `stream_like_engine_allow_direct_select.`

##### 6. 创建物化视图 {#6-create-the-materialized-view}

物化视图将连接之前创建的两个表，从 Kafka 表引擎读取数据并将其插入目标合并树表。我们可以进行多种数据转换。我们将执行简单的读取和插入。使用 * 假设列名相同（区分大小写）。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

在创建时，物化视图连接到 Kafka 引擎并开始读取：将行插入目标表。此过程将无限期持续，后续插入 Kafka 的消息将被消费。请随意重新运行插入脚本以插入更多消息到 Kafka。

##### 7. 确认行已插入 {#7-confirm-rows-have-been-inserted}

确认目标表中存在数据：

```sql
SELECT count() FROM github;
```

您应该看到 200,000 行：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### 常见操作 {#common-operations}

##### 停止和重新启动消息消费 {#stopping--restarting-message-consumption}

要停止消息消费，您可以分离 Kafka 引擎表：

```sql
DETACH TABLE github_queue;
```

这不会影响消费者组的偏移量。要重新启动消费并继续上一个偏移量，请重新附加表。

```sql
ATTACH TABLE github_queue;
```

##### 添加 Kafka 元数据 {#adding-kafka-metadata}

在数据被摄取到 ClickHouse 后，跟踪原始 Kafka 消息的元数据可能会很有用。例如，我们可能想知道我们从特定主题或分区消费了多少数据。为此，Kafka 表引擎公开了几列 [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)。这些可以通过修改我们的模式和物化视图的选择语句，在目标表中持久化为列。

首先，我们在向目标表中添加列之前执行上述停止操作。

```sql
DETACH TABLE github_queue;
```

下面我们添加信息列，以标识源主题和行来源的分区。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

接下来，我们需要确保虚拟列按要求映射。
虚拟列以 _ 开头。
虚拟列的完整列表可以在 [here](../../../engines/table-engines/integrations/kafka.md#virtual-columns) 找到。

要使用虚拟列更新表，我们需要删除物化视图，重新附加 Kafka 引擎表，然后重新创建物化视图。

```sql
DROP VIEW github_mv;
```

```sql
ATTACH TABLE github_queue;
```

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *, _topic as topic, _partition as partition
FROM github_queue;
```

新消费的行应该带有元数据。

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

结果如下所示：

| actor_login | event_type | created_at | topic | partition |
| :--- | :--- | :--- | :--- | :--- |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:22:00 | github | 0 |
| queeup | CommitCommentEvent | 2011-02-12 02:23:23 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:23:24 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:24:50 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:25:20 | github | 0 |
| dapi | CommitCommentEvent | 2011-02-12 06:18:36 | github | 0 |
| sourcerebels | CommitCommentEvent | 2011-02-12 06:34:10 | github | 0 |
| jamierumbelow | CommitCommentEvent | 2011-02-12 12:21:40 | github | 0 |
| jpn | CommitCommentEvent | 2011-02-12 12:24:31 | github | 0 |
| Oxonium | CommitCommentEvent | 2011-02-12 12:31:28 | github | 0 |


##### 修改 Kafka 引擎设置 {#modify-kafka-engine-settings}

我们建议删除 Kafka 引擎表并使用新设置重新创建它。在此过程中，物化视图无需更改 - 一旦 Kafka 引擎表被重新创建，消息消费将恢复。

##### 调试问题 {#debugging-issues}

如身份验证问题等错误不会在对 Kafka 引擎 DDL 的响应中报告。为了诊断问题，我们建议使用主 ClickHouse 日志文件 clickhouse-server.err.log。可以通过配置启用更详细的底层 Kafka 客户端库 [librdkafka](https://github.com/edenhill/librdkafka) 的跟踪日志。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 处理格式错误的消息 {#handling-malformed-messages}

Kafka 通常作为数据的“倾倒场”使用。这导致主题中包含混合消息格式和不一致的字段名称。避免这种情况，利用 Kafka 的功能，如 Kafka Streams 或 ksqlDB，以确保在插入 Kafka 之前消息格式良好且一致。如果这些选项不可行，ClickHouse 有一些功能可以提供帮助。

* 将消息字段视为字符串。如果需要，可以在物化视图语句中使用函数进行清洗和转型。这不应该读作生产解决方案，但可能在一次性摄取时有所帮助。
* 如果您从主题消费 JSON，使用 JSONEachRow 格式，请使用设置 [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields)。在写入数据时，默认情况下，如果输入数据包含在目标表中不存在的列，ClickHouse 会抛出异常。但是，如果启用此选项，则这些多余的列将被忽略。同样，这不是生产级解决方案，可能会让其他人感到困惑。
* 考虑设置 `kafka_skip_broken_messages`。这要求用户为格式错误的消息指定每个块的容忍级别 - 考虑上下文为 kafka_max_block_size。如果超过此容忍度（以绝对消息计量），将恢复通常的异常行为，其他消息将被跳过。

##### 交付语义与重复问题 {#delivery-semantics-and-challenges-with-duplicates}

Kafka 表引擎具有至少一次的语义。在一些已知的少量情况中可能会出现重复。例如，消息可能会从 Kafka 中读取并成功插入到 ClickHouse 中。在新的偏移量可以被提交之前，与 Kafka 的连接可能会丢失。在这种情况下需要重试该块。该块可能会使用分布式表或 ReplicatedMergeTree 作为目标表而 [去重](#common-operations)。虽然这减少了重复行的可能性，但它依赖于相同的块。Kafka 重新平衡等事件可能会使这种假设失效，在少数情况下导致重复。

##### 基于 Quorum 的插入 {#quorum-based-inserts}

您可能需要 [基于 Quorum 的插入](/operations/settings/settings#insert_quorum)，以便在 ClickHouse 中需要更高交付保证的情况。这不能在物化视图或目标表上设置。然而，可以为用户配置文件设置，例如：

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse 到 Kafka {#clickhouse-to-kafka}

尽管更少见，但 ClickHouse 数据也可以持久存储在 Kafka 中。例如，我们将手动将行插入 Kafka 表引擎。该数据将由同一 Kafka 引擎读取，物化视图将数据放入合并树表中。最后，我们展示将物化视图应用于对 Kafka 的插入，以从现有源表中读取表。

#### 步骤 {#steps-1}

我们初步目标最好通过以下方式说明：

<img src={kafka_02} class="image" alt="Kafka 表引擎与插入" style={{width: '80%'}} />

我们假设您已在 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 的步骤下创建了表和视图，并且主题已完全消费。


##### 1. 直接插入行 {#1-inserting-rows-directly}

首先，确认目标表的行数。

```sql
SELECT count() FROM github;
```

您应该有 200,000 行：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

现在从 GitHub 目标表插入行回 Kafka 表引擎 github_queue。注意我们如何使用 JSONEachRow 格式并限制选择为 100。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

重新计数 GitHub 中的行，以确认行数增加了 100。正如上图所示，行通过 Kafka 表引擎插入到 Kafka 中，然后被同一引擎重新读取并通过我们的物化视图插入到 GitHub 目标表中！

```sql
SELECT count() FROM github;
```

您应该看到 100 行的增加：
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. 使用物化视图 {#2-using-materialized-views}

我们可以使用物化视图将消息推送到 Kafka 引擎（及其主题），当文档插入到表中时。 当行被插入到 GitHub 表时，会触发物化视图，导致行被插入回 Kafka 引擎并插入到新的主题中。同样，这最好通过以下方式说明：

<img src={kafka_03} class="image" alt="Kafka 表引擎与插入" style={{width: '80%'}} />

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
            'JSONEachRow') settings kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

现在创建新的物化视图 `github_out_mv` 指向 GitHub 表，当触发时将行插入到上述引擎中。对 GitHub 表的添加将因此被推送到我们的新 Kafka 主题。

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

如果您向原始 GitHub 主题插入，创建于 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 的一部分，文档将神奇地出现在 `github_clickhouse` 主题中。请使用原生 Kafka 工具确认这一点。例如，以下是通过 [kcat](https://github.com/edenhill/kcat) 向 github 主题插入 100 行的命令，用于 Confluent Cloud 托管的主题：

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

对 `github_out` 主题的读取应确认消息的交付。

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

尽管这是一个复杂的示例，但它说明了在与 Kafka 引擎结合使用时物化视图的强大之处。

### 集群与性能 {#clusters-and-performance}

#### 与 ClickHouse 集群一起工作 {#working-with-clickhouse-clusters}

通过 Kafka 消费者组，多个 ClickHouse 实例可以同时从同一主题读取。每个消费者将被分配到主题分区，并以 1:1 的映射进行处理。当使用 Kafka 表引擎扩展 ClickHouse 的消费时，请注意集群内的消费者总数不得超过主题上的分区数。因此，请确保事先为主题配置适当的分区。

多个 ClickHouse 实例可以配置为使用相同的消费者组 ID（在 Kafka 表引擎创建时指定）从主题中读取。因此，每个实例将从一个或多个分区中读取，并将片段插入其本地目标表。目标表可以反过来配置为使用 ReplicatedMergeTree 来处理数据重复。该方法允许 Kafka 读取与 ClickHouse 集群扩展，只要有足够的 Kafka 分区。

<img src={kafka_04} class="image" alt="Kafka 表引擎与插入" style={{width: '80%'}} />

#### 性能调优 {#tuning-performance}

在希望提高 Kafka 引擎表吞吐量性能时，请考虑以下事项：

* 性能将根据消息大小、格式和目标表类型而有所不同。在单个表引擎上，100k 行/秒应被视为可以获得的。默认情况下，消息以块的形式读取，通过参数 kafka_max_block_size 控制。默认情况下，此值设置为 [max_insert_block_size](/operations/settings/settings#max_insert_block_size)，默认为 1,048,576。除非消息极大，否则通常应增大此值。50万到100万的值并不罕见。测试并评估对吞吐量性能的影响。
* 表引擎的消费者数量可以使用 kafka_num_consumers 增加。然而，默认情况下，插入将在单线程中线性化，除非将 kafka_thread_per_consumer 从默认值 1 更改。将其设置为 1 以确保以并行方式执行刷新。请注意，使用 N 个消费者创建 Kafka 引擎表（且 kafka_thread_per_consumer=1）在逻辑上等同于创建 N 个 Kafka 引擎，每个都具有物化视图和 kafka_thread_per_consumer=0。
* 增加消费者不是一个免费的操作。每个消费者维护其自己的缓冲区和线程，增加服务器的开销。请关注消费者的开销，并在集群中线性扩展，尽可能先考虑这一点。
* 如果 Kafka 消息的吞吐量是变化的且可以接受延迟，请考虑增加 stream_flush_interval_ms 的值，以确保进行更大的块刷新。
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) 设置执行后台任务的线程数。这些线程用于 Kafka 流。此设置在 ClickHouse 服务器启动时应用，不能在用户会话中更改，默认为 16。如果您在日志中看到超时，可能需要增加此值。
* 与 Kafka 通信使用的是 librdkafka 库，该库本身创建了线程。大量 Kafka 表或消费者将导致大量上下文切换。因此，要么在集群中分配此负载，要么仅在可能的情况下复制目标表，或者考虑使用一个表引擎从多个主题读取 - 支持值列表。可以从单个表读取多个物化视图，每个物化视图过滤来自特定主题的数据。

任何设置更改都应经过测试。建议监控 Kafka 消费者延迟，以确保您按正确的规模扩展。

#### 其他设置 {#additional-settings}

除了上述讨论的设置，以下内容可能值得关注：

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - 从 Kafka 中读取消息的等待时间（以毫秒为单位）在重试之前。在用户配置文件级别设置，默认为 5000。

所有来自底层 librdkafka 的设置也可以放入 ClickHouse 配置文件中的 _kafka_ 元素中 - 设置名称应为 XML 元素，点替换为下划线，例如：

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

这些是专家设置，我们建议您参考 Kafka 文档以深入了解说明。
