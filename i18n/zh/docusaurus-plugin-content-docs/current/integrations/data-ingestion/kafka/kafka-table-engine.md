import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';

# 使用 Kafka 表引擎

<CloudNotSupportedBadge/>

:::note
Kafka 表引擎在 [ClickHouse Cloud](https://clickhouse.com/cloud) 上不被支持。请考虑使用 [ClickPipes](../clickpipes/kafka.md) 或 [Kafka Connect](./kafka-clickhouse-connect-sink.md)
:::

### Kafka 到 ClickHouse {#kafka-to-clickhouse}

要使用 Kafka 表引擎，您应该对 [ClickHouse 物化视图](../../../guides/developer/cascading-materialized-views.md) 有大致了解。

#### 概述 {#overview}

最初，我们关注最常见的用例：使用 Kafka 表引擎从 Kafka 向 ClickHouse 插入数据。

Kafka 表引擎允许 ClickHouse 直接从 Kafka 主题读取数据。虽然在查看主题上的消息时非常有用，但该引擎的设计僅允許一次性提取，即当向该表发出查询时，它会从队列中消耗数据并在返回结果给调用者之前增加消费者的偏移量。实际上，数据在不重置这些偏移量的情况下无法重新读取。

要将从表引擎读取的数据持久化，我们需要一个捕获数据并将其插入到另一个表中的方法。基于触发器的物化视图本质上提供了这一功能。物化视图会对表引擎发起读取，接收文档的批量。TO 子句决定数据的去向 - 通常是 [Merge Tree 系列](../../../engines/table-engines/mergetree-family/index.md) 表。该过程如下图所示：

<Image img={kafka_01} size="lg" alt="Kafka 表引擎架构图" style={{width: '80%'}} />

#### 步骤 {#steps}

##### 1. 准备 {#1-prepare}

如果您的目标主题中有数据，您可以根据您的数据集调整以下内容。或者，可以在 [这里](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) 提供一个样本 GitHub 数据集。该数据集在下面的示例中使用，使用减少的模式和行子集（特别是我们限制于与 [ClickHouse 仓库](https://github.com/ClickHouse/ClickHouse) 相关的 GitHub 事件），与可用的完整数据集 [这里](https://ghe.clickhouse.tech/) 相比，出于简洁考虑。对于与数据集 [发布的查询](https://ghe.clickhouse.tech/) 来说，这仍然是足够的。

##### 2. 配置 ClickHouse {#2-configure-clickhouse}

如果您要连接到安全的 Kafka，此步骤是必需的。这些设置无法通过 SQL DDL 命令传递，必须在 ClickHouse 的 config.xml 中配置。我们假设您正在连接到一个经过 SASL 保护的实例。这是在与 Confluent Cloud 交互时最简单的方法。

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

将上述片段放置在您 conf.d/ 目录下的新文件中，或将其合并到现有配置文件中。有关可配置的设置，请参见 [这里](../../../engines/table-engines/integrations/kafka.md#configuration)。

我们还将创建一个名为 `KafkaEngine` 的数据库以在本教程中使用：

```sql
CREATE DATABASE KafkaEngine;
```

创建数据库后，您需要切换到它：

```sql
USE KafkaEngine;
```

##### 3. 创建目标表 {#3-create-the-destination-table}

准备您的目标表。在下面的示例中，为了简便起见，我们使用减少的 GitHub 模式。请注意，尽管我们使用的是 MergeTree 表引擎，但此示例可以轻松调整为 [MergeTree 系列](../../../engines/table-engines/mergetree-family/index.md) 的任何成员。

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

##### 4. 创建和填充主题 {#4-create-and-populate-the-topic}

接下来，我们将创建一个主题。我们可以使用几种工具来做到这一点。如果我们在本地计算机或 Docker 容器内运行 Kafka，[RPK](https://docs.redpanda.com/current/get-started/rpk-install/) 很管用。我们可以通过运行以下命令创建一个名为 `github` 的主题，有 5 个分区：

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

如果我们在 Confluent Cloud 上运行 Kafka，可能更倾向于使用 [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records):

```bash
confluent kafka topic create --if-not-exists github
```

现在，我们需要使用一些数据填充此主题，我们将使用 [kcat](https://github.com/edenhill/kcat) 来做到这一点。如果我们在本地运行 Kafka，且不启用身份验证，我们可以运行类似于以下的命令：

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

或者，如果我们的 Kafka 集群使用 SASL 进行身份验证：

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

数据集包含 200,000 行，因此应该在几秒钟内被摄取。如果您想使用更大的数据集，请查看 [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHub 仓库的 [大数据集部分](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)。

##### 5. 创建 Kafka 表引擎 {#5-create-the-kafka-table-engine}

以下示例创建一个与合并树表架构相同的表引擎。这不是严格要求的，因为您可以在目标表中拥有别名或临时列。然而，设置很重要；请注意将 `JSONEachRow` 作为从 Kafka 主题消费 JSON 的数据类型。值 `github` 和 `clickhouse` 分别表示主题名和消费者组名。主题实际上可以是一个值列表。

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

我们在下面讨论引擎设置和性能调优。在这一点上，对表 `github_queue` 的简单选择应该会读取一些行。 请注意，这将使消费者的偏移量向前移动，阻止在没有 [重置](#common-operations) 的情况下重新读取这些行。请注意限制和必需参数 `stream_like_engine_allow_direct_select.`

##### 6. 创建物化视图 {#6-create-the-materialized-view}

物化视图将连接之前创建的两个表，从 Kafka 表引擎读取数据并插入到目标合并树表中。我们可以进行多种数据转换。我们将执行简单的读取和插入。使用 * 假定列名相同（区分大小写）。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

在创建时，物化视图连接到 Kafka 引擎并开始读取：将行插入目标表。此过程将不断进行，随后插入到 Kafka 的消息将被消费。请随意重新运行插入脚本以插入更多消息到 Kafka。

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

这不会影响消费者组的偏移量。要重新启动消费并从先前的偏移量继续，重新附加表。

```sql
ATTACH TABLE github_queue;
```

##### 添加 Kafka 元数据 {#adding-kafka-metadata}

在将其摄取到 ClickHouse 后，跟踪原始 Kafka 消息中的元数据可能非常有用。例如，我们可能想知道我们消耗了多少特定主题或分区。为此，Kafka 表引擎暴露了几个 [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)。通过修改我们的模式和物化视图的选择语句，这些可以作为列保存在我们的目标表中。

首先，在将列添加到目标表之前，我们执行上述的停止操作。

```sql
DETACH TABLE github_queue;
```

接下来，我们添加信息列以识别源主题和行来源的分区。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

然后，我们需要确保虚拟列按需映射。
虚拟列以 `_` 为前缀。
完整的虚拟列清单可以在 [这里](../../../engines/table-engines/integrations/kafka.md#virtual-columns) 找到。

要用虚拟列更新我们的表，我们需要删除物化视图，重新附加 Kafka 引擎表，并重新创建物化视图。

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

新消费的行应具有元数据。

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

我们建议删除 Kafka 引擎表并使用新设置重新创建它。在此过程中，不需要修改物化视图 - 一旦重新创建 Kafka 引擎表，消息消费将继续。

##### 调试问题 {#debugging-issues}

诸如身份验证问题等错误未在 Kafka 引擎 DDL 的响应中报告。要诊断问题，我们建议使用主 ClickHouse 日志文件 clickhouse-server.err.log。还可以通过配置启用用于底层 Kafka 客户端库 [librdkafka](https://github.com/edenhill/librdkafka) 的进一步跟踪日志。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 处理格式错误的消息 {#handling-malformed-messages}

Kafka 通常被用作数据的“倾倒场”。这导致主题中包含混合消息格式和不一致的字段名称。避免这样，并利用 Kafka 的功能，例如 Kafka Streams 或 ksqlDB，确保消息形成良好且一致，然后再插入 Kafka。如果这些选项不可行，ClickHouse 有一些功能可以帮助。

* 将消息字段视为字符串。如果需要，可以在物化视图语句中使用函数进行清理和转换。这不应代表生产解决方案，但可能有助于一次性摄取。
* 如果您从主题消费 JSON，使用 JSONEachRow 格式，请使用设置 [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields)。在写入数据时，默认情况下，如果输入数据包含目标表中不存在的列，ClickHouse 将抛出异常。然而，如果启用此选项，则将忽略这些多余的列。再次说明，这不是生产级别的解决方案，可能会混淆他人。
* 考虑设置 `kafka_skip_broken_messages`。这要求用户为格式错误的消息指定每个区块的容忍级别 - 在 kafka_max_block_size 的上下文中进行考虑。如果此容忍度被超出（以绝对消息计量），常规异常行为将恢复，其他消息将被跳过。

##### 交付语义和重复的挑战 {#delivery-semantics-and-challenges-with-duplicates}

Kafka 表引擎具有至少一次的语义。在几种已知的少见情况下，可能会出现重复情况。例如，消息可能会从 Kafka 中读取并成功插入到 ClickHouse。在新偏移量可以提交之前，与 Kafka 的连接丢失。在这种情况下，需要重试区块。该区块可能会使用分布式表或 ReplicatedMergeTree 作为目标表进行 [去重 ](/engines/table-engines/mergetree-family/replication)。尽管这降低了重复行的可能性，但它依赖于相同的区块。诸如 Kafka 再平衡等事件可能使此假设失效，导致在少数情况下出现重复。

##### 基于法定人数的插入 {#quorum-based-inserts}

在需要更高交付保证的 ClickHouse 用例中，您可能需要 [基于法定人数的插入](/operations/settings/settings#insert_quorum)。这不能在物化视图或目标表上设置。然而，可以为用户配置文件设置，例如：

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse 到 Kafka {#clickhouse-to-kafka}

尽管较少见，但ClickHouse 数据也可以持久化到 Kafka。例如，我们将手动将行插入 Kafka 表引擎。这些数据将由相同的 Kafka 引擎读取，其物化视图将把数据放入合并树表中。最后，我们演示将物化视图应用于将数据插入到 Kafka 以从现有源表中读取。

#### 步骤 {#steps-1}

我们的初始目标最好通过以下方式说明：

<Image img={kafka_02} size="lg" alt="Kafka 表引擎与插入的图示" />

我们假设您已按照 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 步骤创建了表和视图，并且该主题中的数据已被完全摄取。

##### 1. 直接插入行 {#1-inserting-rows-directly}

首先，确认目标表中的行数。

```sql
SELECT count() FROM github;
```

您应该有 200,000 行：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

现在将 GitHub 目标表中的行插入回 Kafka 表引擎 github_queue。请注意如何使用 JSONEachRow 格式，并将选择限制为 100。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

重新计算 GitHub 的行数以确认其已增加 100。如上图所示，通过 Kafka 表引擎将数据插入 Kafka，然后同一引擎再次读取并通过我们的物化视图将数据插入 GitHub 目标表！

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

当将文档插入表时，我们可以利用物化视图将消息推送到 Kafka 引擎（和一个主题）。当行插入 GitHub 表时，会触发一个物化视图，导致行插入回 Kafka 引擎并进入新主题。再次，这最好通过以下方式说明：

<Image img={kafka_03} size="lg" alt="Kafka 表引擎与物化视图的图示"/>

创建一个新 Kafka 主题 `github_out` 或类似主题。确保有一个 Kafka 表引擎 `github_out_queue` 指向此主题。

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

现在创建一个新的物化视图 `github_out_mv`，指向 GitHub 表，在触发时将行插入到上面的引擎。结果是，向 GitHub 表的添加将被推送到我们的新 Kafka 主题。

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

如果您插入到作为 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 一部分创建的原始 github 主题中，文档将神奇地出现在 “github_clickhouse” 主题中。使用原生 Kafka 工具确认这一点。例如，下面，我们使用 [kcat](https://github.com/edenhill/kcat) 为 Confluent Cloud 托管的主题插入 100 行到 github 主题：

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

对 `github_out` 主题的读取应该确认消息的送达。

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

虽然这是一个复杂的示例，但它说明了在与 Kafka 引擎结合使用时物化视图的强大功能。

### 集群与性能 {#clusters-and-performance}

#### 与 ClickHouse 集群合作 {#working-with-clickhouse-clusters}

通过 Kafka 消费者组，多个 ClickHouse 实例可以从同一主题读取。每个消费者将被分配到与主题分区的一对一映射中。在使用 Kafka 表引擎扩展 ClickHouse 消费时，请考虑集群中的消费者总数不能超过主题上的分区数。因此，请确保提前正确配置主题的分区。

多个 ClickHouse 实例可以使用相同的消费者组 ID 从主题中读取 - 该 ID 在创建 Kafka 表引擎时指定。因此，每个实例将从一个或多个分区读取，将片段插入到其本地目标表中。目标表可以反过来配置为使用 ReplicatedMergeTree 来处理数据的重复。这种方法允许 Kafka 的读取与 ClickHouse 集群一起扩展，前提是有足够的 Kafka 分区。

<Image img={kafka_04} size="lg" alt="Kafka 表引擎与 ClickHouse 集群的图示"/>

#### 调优性能 {#tuning-performance}

在希望提高 Kafka 引擎表吞吐量性能时，请考虑以下事项：

* 性能将根据消息大小、格式和目标表类型而有所不同。单个表引擎在每秒 100,000 行的表现应被视为可实现的。默认情况下，消息以批量读取，由参数 kafka_max_block_size 控制。默认情况下，该参数设置为 [max_insert_block_size](/operations/settings/settings#max_insert_block_size)，默认值为 1,048,576。除非消息极大，否则几乎总是应该增加。值在 500k 到 1M 之间并不少见。测试并评估对吞吐量性能的影响。
* 可以使用 kafka_num_consumers 增加表引擎的消费者数量。然而，默认情况下，插入将在线性单线程中完成，除非将 kafka_thread_per_consumer 的默认值更改为 1。将其设置为 1 以确保并行执行刷新。请注意，使用 N 个消费者创建 Kafka 引擎表（以及 kafka_thread_per_consumer=1）在逻辑上等同于创建 N 个 Kafka 引擎，每个引擎都具有物化视图和 kafka_thread_per_consumer=0。
* 增加消费者不是免费的操作。每个消费者维护自己的缓冲区和线程，增加了服务器的开销。注意消费者的开销，并在集群中首先线性扩展，如果可能的话。
* 如果 Kafka 消息的吞吐量变化不定且延迟可接受，请考虑增加 stream_flush_interval_ms，以确保刷新更大的批量。
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) 设置执行后台任务的线程数量。这些线程用于 Kafka 流媒体。此设置在 ClickHouse 服务器启动时应用，无法在用户会话中更改，默认为 16。如果您在日志中看到超时，可能需要增加这个值。
* 对 Kafka 的通信使用 librdkafka 库，库本身会创建线程。因此，大量的 Kafka 表或消费者可能导致大量的上下文切换。要么在集群中分配此负载，要么尽量减少目标表的复制，考虑使用表引擎从多个主题读取 - 支持值列表。多个物化视图可以从单个表中读取，每个视图过滤来自特定主题的数据。

任何设置更改都应进行测试。我们建议监控 Kafka 消费者滞后，以确保您已正确扩展。

#### 其他设置 {#additional-settings}

除了上面讨论的设置外，以下可能会引起您的兴趣：

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - 在重试之前等待读取 Kafka 消息的时间，单位为毫秒。设定在用户配置文件级别，默认为 5000。

来自底层 librdkafka 的 [所有设置](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) 也可以放置在 ClickHouse 配置文件中的 _kafka_ 元素内 - 设置名称应为 XML 元素，使用下划线替换句点，例如：

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

这些是专家设置，我们建议您参考 Kafka 文档以获得详细解释。
