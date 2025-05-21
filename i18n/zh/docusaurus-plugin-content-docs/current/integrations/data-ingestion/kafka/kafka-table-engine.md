---
'sidebar_label': 'Kafka表引擎'
'sidebar_position': 5
'slug': '/integrations/kafka/kafka-table-engine'
'description': '使用Kafka表引擎'
'title': 'Using the Kafka table engine'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# 使用 Kafka 表引擎

<CloudNotSupportedBadge/>

:::note
Kafka 表引擎在 [ClickHouse Cloud](https://clickhouse.com/cloud) 上不受支持。请考虑 [ClickPipes](../clickpipes/kafka.md) 或 [Kafka Connect](./kafka-clickhouse-connect-sink.md)。
:::

### Kafka 到 ClickHouse {#kafka-to-clickhouse}

使用 Kafka 表引擎之前，您应该对 [ClickHouse 物化视图](../../../guides/developer/cascading-materialized-views.md) 有大致的了解。

#### 概述 {#overview}

最初，我们侧重于最常见的用例：使用 Kafka 表引擎从 Kafka 向 ClickHouse 插入数据。

Kafka 表引擎允许 ClickHouse 从 Kafka 主题直接读取数据。虽然可用于查看主题上的消息，但该引擎的设计仅允许一次性检索，即在向表发出查询时，它会从队列中消耗数据并在返回结果之前增加消费者偏移量。实际上，数据不能在不重置这些偏移量的情况下再次读取。

为了从读取表引擎持久化这些数据，我们需要一种捕获数据并将其插入到另一个表中的方法。基于触发的物化视图本身提供了此功能。物化视图在表引擎上启动读取，接收文档批次。TO 子句确定数据的目标-通常是 [Merge Tree 家族](../../../engines/table-engines/mergetree-family/index.md) 的一个表。这个过程如下图所示：

<Image img={kafka_01} size="lg" alt="Kafka 表引擎架构图" style={{width: '80%'}} />

#### 步骤 {#steps}

##### 1. 准备 {#1-prepare}

如果您在目标主题上有数据，可以根据需要调整以下内容以用于您的数据集。另外，提供了一个示例 GitHub 数据集 [在这里](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)。此数据集在以下示例中使用，使用了简化的架构和行的子集（具体而言，我们限制为涉及 [ClickHouse 仓库](https://github.com/ClickHouse/ClickHouse) 的 GitHub 事件），以便简洁。对于大多数与数据集一起发布的查询 [在这里](https://ghe.clickhouse.tech/) 来说，这仍然足够。

##### 2. 配置 ClickHouse {#2-configure-clickhouse}

如果您要连接到安全的 Kafka，这一步是必需的。这些设置不能通过 SQL DDL 命令传递，必须在 ClickHouse config.xml 中配置。我们假设您要连接到一个使用 SASL 保护的实例。这是与 Confluent Cloud 交互时最简单的方法。

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

可以将上述代码块放置在 conf.d/ 目录下的新文件中，或合并到现有配置文件中。有关可配置设置，请参见 [这里](../../../engines/table-engines/integrations/kafka.md#configuration)。

我们还将创建一个名为 `KafkaEngine` 的数据库以便在本教程中使用：

```sql
CREATE DATABASE KafkaEngine;
```

创建数据库后，您需要切换到该数据库：

```sql
USE KafkaEngine;
```

##### 3. 创建目标表 {#3-create-the-destination-table}

准备您的目标表。在下面的示例中，我们使用简化的 GitHub 架构以便简洁。请注意，尽管我们使用的是 MergeTree 表引擎，但这个例子可以轻松适应 [MergeTree 家族](../../../engines/table-engines/mergetree-family/index.md) 的任何成员。

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

接下来，我们将创建一个主题。有几种工具可以用来执行此操作。如果我们在本地机器上或 Docker 容器内运行 Kafka，[RPK](https://docs.redpanda.com/current/get-started/rpk-install/) 很好用。我们可以通过运行以下命令创建一个名为 `github` 的主题，分为 5 个分区：

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

如果我们在 Confluent Cloud 上运行 Kafka，则可能更喜欢使用 [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records)：

```bash
confluent kafka topic create --if-not-exists github
```

现在我们需要用一些数据填充这个主题，我们将使用 [kcat](https://github.com/edenhill/kcat) 进行此操作。如果我们在本地禁用身份验证运行 Kafka，则可以运行类似于以下的命令：

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

如果我们的 Kafka 集群使用 SASL 进行身份验证，则可以运行以下命令：

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

该数据集包含 200,000 行，因此应在几秒钟内被摄取。如果您想处理更大的数据集，请查看 [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHub 仓库的 [大数据集部分](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)。

##### 5. 创建 Kafka 表引擎 {#5-create-the-kafka-table-engine}

以下示例创建了一个具有与合并树表相同架构的表引擎。这并不是严格要求的，因为您可以在目标表中有别名或临时列。然而，设置是重要的 - 请注意使用 `JSONEachRow` 作为从 Kafka 主题消费 JSON 的数据类型。值 `github` 和 `clickhouse` 分别表示主题名称和消费者组名称。主题实际上可以是一个值的列表。

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

我们在下面讨论引擎设置和性能调整。在这一点上，对表 `github_queue` 进行简单选择应该会读取一些行。请注意，这将使消费者偏移量前移，防止在没有 [重置](#common-operations) 的情况下重新读取这些行。请注意限制和必需参数 `stream_like_engine_allow_direct_select.`

##### 6. 创建物化视图 {#6-create-the-materialized-view}

物化视图将连接之前创建的两个表，从 Kafka 表引擎读取数据并将其插入目标合并树表中。我们可以进行多种数据转换。我们将进行简单的读取和插入。使用 * 假定列名是相同的（区分大小写）。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

在创建时，物化视图连接到 Kafka 引擎并开始读取：将行插入目标表。此过程将无限期继续，后续的消息将插入 Kafka 并被消费。随时可以重新运行插入脚本，以向 Kafka 插入更多消息。

##### 7. 确认行已插入 {#7-confirm-rows-have-been-inserted}

确认目标表中存在数据：

```sql
SELECT count() FROM github;
```

您应该会看到 200,000 行：
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

这不会影响消费者组的偏移量。要重新启动消费并从之前的偏移量继续，重新附加该表。

```sql
ATTACH TABLE github_queue;
```

##### 添加 Kafka 元数据 {#adding-kafka-metadata}

在将数据摄取到 ClickHouse 后，跟踪原始 Kafka 消息的元数据可能会很有用。例如，我们可能想知道我们消耗了特定主题或分区的多少数据。为此，Kafka 表引擎暴露了几个 [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)。这些可以通过修改我们的架构和物化视图的选择语句作为列持久化到我们的目标表中。

首先，我们在向目标表添加列之前执行上述停止操作。

```sql
DETACH TABLE github_queue;
```

下面我们添加信息列以识别来源主题和行来源的分区。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

接下来，我们需要确保虚拟列按需映射。虚拟列以 `_` 为前缀。虚拟列的完整列表可以在 [这里](../../../engines/table-engines/integrations/kafka.md#virtual-columns) 找到。

要使用虚拟列更新我们的表，我们需要删除物化视图，重新附加 Kafka 引擎表，然后重新创建物化视图。

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

新消费的行应包含元数据。

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

结果如下：

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

我们建议删除 Kafka 引擎表并使用新设置重新创建它。在此过程中，物化视图无需修改-重新创建 Kafka 引擎表后，消息消费将恢复。

##### 调试问题 {#debugging-issues}

诸如身份验证问题等错误不会在 Kafka 引擎 DDL 的响应中报告。为诊断问题，我们建议使用主要的 ClickHouse 日志文件 clickhouse-server.err.log。可以通过配置启用底层 Kafka 客户端库 [librdkafka](https://github.com/edenhill/librdkafka) 的进一步追踪日志。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 处理格式错误的消息 {#handling-malformed-messages}

Kafka 常作为数据的“倾倒场”。这导致主题包含混合的消息格式和不一致的字段名。避免这种情况，并利用 Kafka 特性例如 Kafka Streams 或 ksqlDB 确保消息在插入 Kafka 之前格式良好且一致。如果这些选项不可行，ClickHouse 有一些功能可以帮助。

* 将消息字段视为字符串。如果需要，可以在物化视图语句中使用函数进行清洗和转换。这不应代表生产解决方案，但可能有助于一次性摄取。
* 如果您从主题消耗 JSON，使用 JSONEachRow 格式，请使用设置 [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields)。在写入数据时，默认情况下，如果输入数据包含目标表中不存在的列，ClickHouse 会抛出异常。但是，如果启用此选项，这些多余的列将被忽略。同样，这并非生产级解决方案，可能会让其他人困惑。
* 考虑设置 `kafka_skip_broken_messages`。这要求用户为格式错误的消息每个块指定容忍级别-这在 kafka_max_block_size 的上下文中考虑。如果超出此容忍度（以绝对消息为单位衡量），将恢复常规异常行为，其他消息将被跳过。

##### 投递语义和重复项挑战 {#delivery-semantics-and-challenges-with-duplicates}

Kafka 表引擎具有至少一次的语义。在几个已知的罕见情况下，可能会出现重复。例如，消息可能从 Kafka 中被读取并成功插入到 ClickHouse。在新偏移量提交之前，连接到 Kafka 可能会丢失。在这种情况下，需要对该块进行重试。该块可能使用 [去重 ](/engines/table-engines/mergetree-family/replication)的分布式表或 ReplicatedMergeTree 作为目标表。虽然这减少了重复行的机会，但依赖于相同的块。Kafka 重新平衡等事件可能会使这个假设失效，从而导致罕见情况下的重复。

##### 基于法定人数的插入 {#quorum-based-inserts}

对于需要在 ClickHouse 中提供更高交付保证的情况，您可能需要 [基于法定人数的插入](/operations/settings/settings#insert_quorum)。这不能在物化视图或目标表上设置。然而，可以为用户配置文件设置，例如：

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse 到 Kafka {#clickhouse-to-kafka}

虽然这种用例比较少见，但 ClickHouse 数据也可以持久化到 Kafka。例如，我们将手动将行插入 Kafka 表引擎。该数据将由同一 Kafka 引擎读取，其物化视图将把数据放置到 Merge Tree 表中。最后，我们展示了将物化视图应用于插入到 Kafka 的方法，以读取来自现有源表的数据。

#### 步骤 {#steps-1}

我们的初始目标最好通过以下方式说明：

<Image img={kafka_02} size="lg" alt="Kafka 表引擎与插入图示" />

我们假设您已按照 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 的步骤创建了表和视图，并且主题已被完全消费。

##### 1. 直接插入行 {#1-inserting-rows-directly}

首先，确认目标表的计数。

```sql
SELECT count() FROM github;
```

您应该有 200,000 行：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

现在，从 GitHub 目标表向 Kafka 表引擎 github_queue 插入行。注意我们如何利用 JSONEachRow 格式并将选择限制为 100。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

重新计算 GitHub 中的行以确认增加了 100。如上面的图示，行已通过 Kafka 表引擎插入 Kafka，然后再通过同一引擎重新读取并由我们的物化视图插入到 GitHub 目标表中！

```sql
SELECT count() FROM github;
```

您应该看到 100 行额外添加：
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. 使用物化视图 {#2-using-materialized-views}

我们可以利用物化视图在向表中插入文档时将消息推送到 Kafka 引擎（和主题）。当行被插入到 GitHub 表时，将触发物化视图，使行重新插入到 Kafka 引擎中并插入到新主题中。再次，最好通过以下方式说明：

<Image img={kafka_03} size="lg" alt="Kafka 表引擎与物化视图图示" />

创建一个新的 Kafka 主题 `github_out` 或等效主题。确保 Kafka 表引擎 `github_out_queue` 指向该主题。

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

现在创建一个新的物化视图 `github_out_mv`，指向 GitHub 表，当它触发时将行插入上述引擎。结果，GitHub 表的新增内容将推送到我们的新 Kafka 主题。

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

如果您插入到作为 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 一部分创建的原始 github 主题中，文档将神奇地出现在 "github_clickhouse" 主题中。使用原生 Kafka 工具确认这一点。例如，下面，我们使用 [kcat](https://github.com/edenhill/kcat) 在 Confluent Cloud 托管主题上插入 100 行：

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

对 `github_out` 主题的读取应确认消息已投递。

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

尽管是一个复杂的例子，但这展示了物化视图在与 Kafka 引擎结合使用时的强大。

### 集群与性能 {#clusters-and-performance}

#### 与 ClickHouse 集群一起工作 {#working-with-clickhouse-clusters}

通过 Kafka 消费者组，多个 ClickHouse 实例可以潜在地从同一主题读取。每个消费者将被分配到主题分区，形成 1:1 映射。当使用 Kafka 表引擎扩展 ClickHouse 消耗时，请注意，集群内的消费者总数不能超过主题上的分区数量。因此请确保事先对主题进行适当的分区配置。

多个 ClickHouse 实例都可以配置为使用相同的消费者组 ID 进行阅读 - 该 ID 在 Kafka 表引擎创建期间指定。因此，每个实例将从一个或多个分区读取，将段插入到其本地目标表中。目标表本身可以配置为使用 ReplicatedMergeTree 来处理数据的重复。此方法允许 Kafka 读取与 ClickHouse 集群一起扩展，前提是有足够的 Kafka 分区。

<Image img={kafka_04} size="lg" alt="Kafka 表引擎与 ClickHouse 集群图示" />

#### 性能调优 {#tuning-performance}

考虑以下内容以提高 Kafka 引擎表的吞吐量性能：

* 性能将根据消息的大小、格式和目标表类型而有所不同。在单个表引擎上，100k 行/秒应被视为切实可得的。默认情况下，消息以块的形式读取，受参数 kafka_max_block_size 控制。默认情况下，此值设置为 [max_insert_block_size](/operations/settings/settings#max_insert_block_size)，默认为 1,048,576。除非消息非常大，否则几乎总是应该增加该值。在 500k 到 1M 之间的值并不少见。测试并评估对吞吐量性能的影响。
* 可以使用 kafka_num_consumers 增加表引擎的消费者数量。然而，默认情况下，插入将在单线程中线性化，除非 kafka_thread_per_consumer 从默认值 1 更改。将其设置为 1 以确保并行执行刷新。请注意，创建带有 N 个消费者（且 kafka_thread_per_consumer=1）的 Kafka 引擎表在逻辑上等同于创建 N 个 Kafka 引擎，每个引擎都有一个物化视图和 kafka_thread_per_consumer=0。
* 增加消费者不是免费的操作。每个消费者维护自己的缓冲区和线程，增加了服务器的开销。注意消费者的开销，首先在集群中线性扩展，并在可能情况下进行扩展。
* 如果 Kafka 消息的吞吐量变化不定且延迟可接受，请考虑增加 stream_flush_interval_ms 以确保更大的块被刷新。
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) 设置执行后台任务的线程数量。这些线程用于 Kafka 流式传输。此设置在 ClickHouse 服务器启动时应用，并且不能在用户会话中更改，默认为 16。如果您在日志中看到超时，可能需要增加该值。
* 用于与 Kafka 通信的 librdkafka 库创建了线程。因此，较多的 Kafka 表或消费者可能会导致大量上下文切换。要么在集群中分散该负载，在可能的情况下只复制目标表，要么考虑使用某个表引擎从多个主题读取 - 支持值列表。从单个表中可以读取多个物化视图，每个物化视图过滤特定主题的数据。

任何设置更改都应经过测试。我们建议监控 Kafka 消费者延迟，以确保您的规模合适。

#### 其他设置 {#additional-settings}

除了上述讨论的设置外，以下内容可能也会引起您的兴趣：

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - 在重试之前等待 Kafka 中读取消息的时间（以毫秒为单位）。在用户配置文件级别设置，默认为 5000。

[所有设置](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)来自底层 librdkafka 也可以放在 ClickHouse 配置文件中的 _kafka_ 元素内 - 设置名称应为 XML 元素，并用下划线替换小数点，例如：

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

这些是高级设置，我们建议您参考 Kafka 文档以获取详细说明。
