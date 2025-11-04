---
'sidebar_label': 'Kafka 表引擎'
'sidebar_position': 5
'slug': '/integrations/kafka/kafka-table-engine'
'description': '使用 Kafka 表引擎'
'title': '使用 Kafka 表引擎'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# 使用 Kafka 表引擎

Kafka 表引擎可用于 [**从**](#kafka-to-clickhouse) Apache Kafka 读取数据及 [**向**](#clickhouse-to-kafka) Apache Kafka 及其他兼容 Kafka API 的代理（例如 Redpanda、Amazon MSK）写入数据。

### Kafka 到 ClickHouse {#kafka-to-clickhouse}

:::note
如果您使用的是 ClickHouse Cloud，我们建议使用 [ClickPipes](/integrations/clickpipes) 。ClickPipes 原生支持私有网络连接、独立伸缩数据摄取和集群资源，并提供全面的监控以将流式 Kafka 数据传入 ClickHouse。
:::

要使用 Kafka 表引擎，您应该对 [ClickHouse 物化视图](../../../guides/developer/cascading-materialized-views.md) 有基本了解。

#### 概述 {#overview}

最初，我们专注于最常见的用例：使用 Kafka 表引擎将数据从 Kafka 插入到 ClickHouse。

Kafka 表引擎允许 ClickHouse 直接从 Kafka 主题读取数据。虽然它对查看主题上的消息很有用，但该引擎的设计只允许一次性检索，即当对表发出查询时，它会消耗队列中的数据并在返回结果之前增加消费者偏移量。实际上，数据不能在不重置这些偏移量的情况下重新读取。

为持久化此数据，我们需要一种捕获数据并将其插入到其他表中的方法。基于触发器的物化视图原生提供此功能。物化视图在表引擎上发起读取，接收文档批次。TO 子句确定数据的目的地 - 通常是 [Merge Tree 家族](../../../engines/table-engines/mergetree-family/index.md) 的表。这个过程在下面可视化：

<Image img={kafka_01} size="lg" alt="Kafka 表引擎架构图" style={{width: '80%'}} />

#### 步骤 {#steps}

##### 1. 准备 {#1-prepare}

如果您在目标主题上已填充数据，可以调整以下内容以适应您的数据集。或者，示例 GitHub 数据集在 [这里](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) 提供。此数据集用于下面的示例，并使用简化的模式和行的子集（具体而言，我们限制为与 [ClickHouse 仓库](https://github.com/ClickHouse/ClickHouse) 相关的 GitHub 事件），与可在 [这里](https://ghe.clickhouse.tech/) 获得的完整数据集相比，为了简洁起见。这对于与数据集一起发布的大多数查询 [可](https://ghe.clickhouse.tech/) 仍然足够有效。

##### 2. 配置 ClickHouse {#2-configure-clickhouse}

如果您要连接到安全的 Kafka，此步骤是必需的。这些设置不能通过 SQL DDL 命令传递，必须在 ClickHouse config.xml 中配置。我们假设您连接到一个 SASL 保护的实例。当与 Confluent Cloud 交互时，这是一种最简单的方法。

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

可以将上述代码片段放入 conf.d/ 目录下的新文件中，或将其合并到现有配置文件中。有关可配置的设置，请参见 [这里](../../../engines/table-engines/integrations/kafka.md#configuration)。

我们还将创建一个名为 `KafkaEngine` 的数据库以便在本教程中使用：

```sql
CREATE DATABASE KafkaEngine;
```

创建数据库后，您需要切换到它：

```sql
USE KafkaEngine;
```

##### 3. 创建目标表 {#3-create-the-destination-table}

准备目标表。在下面的示例中，我们使用简化的 GitHub 模式以便于简洁。请注意，尽管我们使用 MergeTree 表引擎，但此示例可以轻松适应 [MergeTree 家族](../../../engines/table-engines/mergetree-family/index.md) 中的任何成员。

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

接下来，我们将创建一个主题。可以使用若干工具来执行此操作。如果我们在本地计算机或 Docker 容器中运行 Kafka，[RPK](https://docs.redpanda.com/current/get-started/rpk-install/) 是一个不错的选择。我们可以通过运行以下命令创建一个名为 `github` 的主题，具有 5 个分区：

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

如果我们在 Confluent Cloud 中运行 Kafka，可能更倾向于使用 [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records):

```bash
confluent kafka topic create --if-not-exists github
```

现在我们需要向此主题填充一些数据，我们将使用 [kcat](https://github.com/edenhill/kcat) 来执行此操作。如果在本地运行 Kafka 且未启用身份验证，可以运行类似于以下的命令：

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

该数据集包含 200,000 行，因此应在几秒钟内完成摄取。如果您想处理更大的数据集，请查看 [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHub 仓库的 [大数据集部分](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)。

##### 5. 创建 Kafka 表引擎 {#5-create-the-kafka-table-engine}

以下示例创建了一个与 merge tree 表具有相同模式的表引擎。这并不严格要求，因为您可以在目标表中拥有别名或临时列。然而，设置是重要的；请注意使用 `JSONEachRow` 作为从 Kafka 主题消费 JSON 的数据类型。值 `github` 和 `clickhouse` 分别表示主题和消费者组的名称。主题实际上可以是值的列表。

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

我们将在下面讨论引擎设置和性能调优。此时，对表 `github_queue` 的简单选择应读取一些行。 请注意，这将推动消费者偏移量向前移动，阻止在不进行 [重置](#common-operations) 的情况下重新读取这些行。注意 limit 和所需参数 `stream_like_engine_allow_direct_select.`

##### 6. 创建物化视图 {#6-create-the-materialized-view}

物化视图将连接之前创建的两个表，从 Kafka 表引擎读取数据并将数据插入到目标 merge tree 表中。我们可以进行多个数据变换。我们将进行简单的读取并插入。使用 * 假设列名相同（区分大小写）。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

在创建时，物化视图连接到 Kafka 引擎并开始读取：将行插入到目标表中。此过程将无限期继续，后续加入 Kafka 的消息将被消费。请随意重新运行插入脚本以向 Kafka 插入更多消息。

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

##### 停止和重新开始消息消费 {#stopping--restarting-message-consumption}

要停止消息消费，您可以分离 Kafka 引擎表：

```sql
DETACH TABLE github_queue;
```

这不会影响消费者组的偏移量。要重新开始消费并从之前的偏移量继续，请重新附加表。

```sql
ATTACH TABLE github_queue;
```

##### 添加 Kafka 元数据 {#adding-kafka-metadata}

在将原始 Kafka 消息摄取到 ClickHouse 后，跟踪元数据可能会很有用。例如，我们可能想知道已消费了特定主题或分区的多少内容。为此，Kafka 表引擎公开几个 [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)。通过修改我们的模式和物化视图的选择语句，可以将这些列持久化为目标表中的列。

首先，我们在向目标表添加列之前执行上述停止操作。

```sql
DETACH TABLE github_queue;
```

在下面，我们添加信息列以识别源主题和行源自的分区。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

接下来，我们需要确保虚拟列按需映射。虚拟列前缀为 `_`。虚拟列的完整列表可以在 [这里](../../../engines/table-engines/integrations/kafka.md#virtual-columns) 找到。

为了用虚拟列更新我们的表，我们需要删除物化视图，重新附加 Kafka 引擎表，并重新创建物化视图。

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

新消费的行应包含元数据。

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

我们建议删除 Kafka 引擎表并使用新设置重新创建它。在此过程中物化视图不需要修改 - 一旦 Kafka 引擎表重新创建，消息消费将恢复。

##### 调试问题 {#debugging-issues}

诸如身份验证问题等错误不会在 Kafka 引擎 DDL 的响应中报告。为了诊断问题，我们建议使用主要的 ClickHouse 日志文件 clickhouse-server.err.log。通过配置可以启用底层 Kafka 客户端库 [librdkafka](https://github.com/edenhill/librdkafka) 的进一步跟踪日志记录。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 处理格式错误的消息 {#handling-malformed-messages}

Kafka 通常被用作数据的“倾倒场”。这导致主题包含混合的消息格式和不一致的字段名称。避免这种情况并利用 Kafka 特性，如 Kafka Streams 或 ksqlDB，以确保在插入到 Kafka 之前消息格式良好且一致。如果无法使用这些选项，ClickHouse 具有一些可以帮助的功能。

* 将消息字段视为字符串。如果需要，可以在物化视图语句中使用函数执行清理和转换。这不应视为生产解决方案，但可能有助于一次性摄取。
* 如果您正在从主题消费 JSON，并使用 JSONEachRow 格式，请使用设置 [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields)。在写入数据时，默认情况下，如果输入数据包含在目标表中不存在的列，ClickHouse 将抛出异常。然而，如果启用此选项，则这些多余的列将被忽略。此外，这不是生产级解决方案，可能会让其他人感到困惑。
* 考虑设置 `kafka_skip_broken_messages`。这要求用户指定每个块对格式错误消息的容忍级别 - 在 kafka_max_block_size 的上下文中考虑。如果超出该容忍值（以绝对消息计量），通常的异常行为将恢复，并跳过其他消息。

##### 交付语义与重复问题 {#delivery-semantics-and-challenges-with-duplicates}

Kafka 表引擎具有至少一次的语义。在一些已知的罕见情况下，可能会出现重复。例如，消息可以从 Kafka 中读取并成功插入到 ClickHouse 中。在新偏移量可以提交之前，与 Kafka 的连接丢失。在这种情况下需要重试该块。该块可以使用分布式表或 ReplicatedMergeTree 作为目标表进行 [去重](https://engines/table-engines/mergetree-family/replication)。虽然这降低了重复行的可能性，但它依赖于相同的块。诸如 Kafka 重新平衡等事件可能会使这一假设失效，从而在罕见情况下导致重复。

##### 基于法定人数的插入 {#quorum-based-inserts}

您可能需要 [基于法定人数的插入](/operations/settings/settings#insert_quorum) ，以确保在 ClickHouse 中需要更高的交付保证。此设置不能在物化视图或目标表上设置。不过，可以为用户配置文件设置，例如：

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse 到 Kafka {#clickhouse-to-kafka}

虽然这是一个较少使用的用例，但 ClickHouse 数据也可以持久化到 Kafka。例如，我们将手动将行插入到 Kafka 表引擎中。这些数据将由相同的 Kafka 引擎读取，物化视图将把数据放入 Merge Tree 表中。最后，我们演示物化视图在插入到 Kafka 以从现有源表读取表的应用。

#### 步骤 {#steps-1}

我们的初步目标最好用以下方式说明：

<Image img={kafka_02} size="lg" alt="带插入的 Kafka 表引擎图"/>

我们假设您在 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 的步骤中创建了表和视图，并且主题已完全消费。

##### 1. 直接插入行 {#1-inserting-rows-directly}

首先，确认目标表的行数。

```sql
SELECT count() FROM github;
```

您应有 200,000 行：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

现在将 GitHub 目标表的行插入回 Kafka 表引擎 github_queue。注意我们如何利用 JSONEachRow 格式并将选择限制为 100。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

重新计算 GitHub 中的行数，以确认其增加了 100。如上图所示，行已通过 Kafka 表引擎插入到 Kafka 中，然后由相同的引擎重新读取并通过我们的物化视图插入到 GitHub 目标表中！

```sql
SELECT count() FROM github;
```

您应该看到额外的 100 行：
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. 使用物化视图 {#2-using-materialized-views}

我们可以利用物化视图在将文档插入表时将消息推送到 Kafka 引擎（和主题）。当行被插入到 GitHub 表中时，会触发物化视图，从而导致行被插入回 Kafka 引擎并插入到一个新主题中。再次，通过以下方式说明：

<Image img={kafka_03} size="lg" alt="带物化视图的 Kafka 表引擎图"/>

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

现在创建一个新的物化视图 `github_out_mv`，指向 GitHub 表，在触发时将行插入到上述引擎。当 GitHub 表有新增时，将推送到我们的新 Kafka 主题。

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

如果您在创建的原始 github 主题中插入内容，作为 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 的一部分，文件将神奇地出现在 “github_clickhouse” 主题中。使用本地 Kafka 工具确认这一点。例如，下面，我们使用 [kcat](https://github.com/edenhill/kcat) 向在 Confluent Cloud 托管的主题 github 插入 100 行：

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

尽管这是一个复杂的示例，但它说明了在与 Kafka 引擎结合使用时物化视图的强大功能。

### 集群与性能 {#clusters-and-performance}

#### 与 ClickHouse 集群合作 {#working-with-clickhouse-clusters}

通过 Kafka 消费者组，多台 ClickHouse 实例可以潜在地从同一主题读取。每个消费者将被分配到一个主题分区，遵循 1:1 的映射。当使用 Kafka 表引擎扩展 ClickHouse 消费时，请考虑集群中的消费者总数不能超过主题分区的数量。因此，请确保在提前为主题正确配置分区。

可以配置多台 ClickHouse 实例以使用相同的消费者组 ID 读取同一主题 - 在创建 Kafka 表引擎时指定。因此，每个实例将从一个或多个分区读取，将片段插入到其本地目标表中。目标表可以再次配置为使用 ReplicatedMergeTree 来处理数据的重复。这种方法可以在确保有足够 Kafka 分区的情况下实现 Kafka 读取与 ClickHouse 集群的扩展。

<Image img={kafka_04} size="lg" alt="带 ClickHouse 集群的 Kafka 表引擎图"/>

#### 性能调整 {#tuning-performance}

在寻求提高 Kafka 引擎表的吞吐量性能时，请考虑以下几点：

* 性能将依赖于消息的大小、格式和目标表类型。在单个表引擎上，考虑达到 100k 行/秒的目标是合理的。默认情况下，消息以数据块方式读取，由参数 kafka_max_block_size 控制。默认情况下，此值设置为 [max_insert_block_size](/operations/settings/settings#max_insert_block_size)，默认为 1,048,576。除非消息极大，否则此值通常应增加。500k 到 1M 之间的值并不罕见。测试并评估对吞吐量性能的影响。
* 表引擎的消费者数量可以使用 kafka_num_consumers 增加。然而，默认情况下，插入将在单线程中线性化，除非将 kafka_thread_per_consumer 从 1 的默认值更改。将其设置为 1 以确保并行执行刷新。请注意，使用 N 个消费者创建 Kafka 引擎表（并且 kafka_thread_per_consumer=1）在逻辑上等同于创建 N 个 Kafka 引擎，每个引擎具有一个物化视图，并且 kafka_thread_per_consumer=0。
* 增加消费者并不是免费的操作。每个消费者维护自己的缓冲区和线程，增加服务器的开销。注意消费者的开销，在您的集群中首先线性扩展并在可能的情况下考虑。
* 如果 Kafka 消息的吞吐量是可变的且延迟是可以接受的，请考虑增加 stream_flush_interval_ms，以确保刷新较大的数据块。
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) 设置执行后台任务的线程数量。这些线程用于 Kafka 流式传输。此设置在 ClickHouse 服务器启动时应用，无法在用户会话中更改，默认为 16。如果您在日志中看到超时，可能需要增加此值。
* 与 Kafka 通信使用 librdkafka 库，该库本身创建了线程。大量 Kafka 表或消费者可能导致大量上下文切换。要么将此负载分散到集群中，仅在可能的情况下复制目标表，要么考虑使用表引擎从多个主题读取 - 支持值列表。从单个表中可以读取多个物化视图，每个视图过滤特定主题的数据。

所有设置变更应经过测试。我们建议监控 Kafka 消费者滞后，以确保您已正确扩展。

#### 附加设置 {#additional-settings}

除了上述讨论的设置外，以下内容可能会引起您的兴趣：

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - 读取 Kafka 中消息的等待时间（毫秒），然后重试。设置在用户配置文件级别，默认值为 5000。

底层 librdkafka 的 [所有设置](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) 也可以放在 ClickHouse 配置文件中的 _kafka_ 元素内 - 设置名称应为 XML 元素，用点替换为下划线，例如：

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

这些是专家设置，我们建议您参考 Kafka 文档以获得详细的解释。
