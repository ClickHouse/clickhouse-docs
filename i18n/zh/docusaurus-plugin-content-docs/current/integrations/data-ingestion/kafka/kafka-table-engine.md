---
'sidebar_label': 'Kafka Table Engine'
'sidebar_position': 5
'slug': '/integrations/kafka/kafka-table-engine'
'description': '使用 Kafka table engine'
'title': '使用 Kafka table engine'
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
Kafka 表引擎不支持 [ClickHouse Cloud](https://clickhouse.com/cloud)。请考虑 [ClickPipes](../clickpipes/kafka.md) 或 [Kafka Connect](./kafka-clickhouse-connect-sink.md)
:::

### Kafka 到 ClickHouse {#kafka-to-clickhouse}

要使用 Kafka 表引擎，您应该对 [ClickHouse 物化视图](../../../guides/developer/cascading-materialized-views.md) 有基本了解。

#### 概述 {#overview}

最开始，我们关注最常见的用例：使用 Kafka 表引擎将数据从 Kafka 插入到 ClickHouse。

Kafka 表引擎允许 ClickHouse 直接读取 Kafka 主题。虽然对于查看主题上的消息很有用，但该引擎设计上仅允许一次性检索， 即当向表发出查询时，它会从队列中消耗数据并增加消费者偏移量，然后再将结果返回给调用者。在不重置这些偏移量的情况下，实际上无法重新读取数据。

为了持久化从表引擎读取的数据，我们需要一种方法来捕获数据并将其插入到另一个表中。基于触发器的物化视图本质上提供了这种功能。物化视图会启动对表引擎的读取，接收文档批次。TO 子句决定数据的去向——通常是 [Merge Tree 家族](../../../engines/table-engines/mergetree-family/index.md) 的一个表。这个过程如下图所示：

<Image img={kafka_01} size="lg" alt="Kafka 表引擎架构图" style={{width: '80%'}} />

#### 步骤 {#steps}

##### 1. 准备 {#1-prepare}

如果您在目标主题上有数据，您可以根据以下信息适应您的数据集。或者，提供了一个示例 Github 数据集 [这里](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)。该数据集在下面的示例中使用，采用了简化的模式和部分行（特别是，我们限制为与 [ClickHouse 仓库](https://github.com/ClickHouse/ClickHouse) 相关的 Github 事件），以便简洁。对于与 [这里](https://ghe.clickhouse.tech/) 提供的完整数据集相比，这仍然足以支持大多数与数据集相关的查询 [published with the dataset](https://ghe.clickhouse.tech/) 工作。

##### 2. 配置 ClickHouse {#2-configure-clickhouse}

如果您连接到安全的 Kafka，此步骤是必需的。这些设置不能通过 SQL DDL 命令传递，必须在 ClickHouse config.xml 中配置。我们假设您连接到一个使用 SASL 进行安全保护的实例。这是在与 Confluent Cloud 交互时最简单的方法。

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

将上述代码片段放入您的 conf.d/ 目录下的新文件中，或将其合并到现有的配置文件中。有关可配置设置，请参见 [这里](../../../engines/table-engines/integrations/kafka.md#configuration)。

我们还将创建一个名为 `KafkaEngine` 的数据库以供本教程使用：

```sql
CREATE DATABASE KafkaEngine;
```

创建数据库后，您需要切换到该数据库中：

```sql
USE KafkaEngine;
```

##### 3. 创建目标表 {#3-create-the-destination-table}

准备您的目标表。在下面的示例中，我们使用减少的 GitHub 模式以便简洁。请注意，尽管我们使用的是 MergeTree 表引擎，但此示例可以轻松适应 [MergeTree 家族](../../../engines/table-engines/mergetree-family/index.md) 的任何成员。

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

接下来，我们将创建一个主题。有几种工具可以使用。如果我们在本地机器或 Docker 容器中运行 Kafka，[RPK](https://docs.redpanda.com/current/get-started/rpk-install/) 很好用。我们可以通过运行以下命令创建一个名为 `github` 的主题，分为 5 个分区：

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

如果我们在 Confluent Cloud 上运行 Kafka，可能更希望使用 [Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records)：

```bash
confluent kafka topic create --if-not-exists github
```

现在我们需要使用 [kcat](https://github.com/edenhill/kcat) 向此主题填充一些数据。如果我们在本地运行 Kafka，并且身份验证已禁用，可以运行类似于以下内容的命令：

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

该数据集包含 200,000 行，因此应该在几秒钟内完成摄取。如果您想处理更大的数据集，请查看 [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHub 存储库中的 [大型数据集部分](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)。

##### 5. 创建 Kafka 表引擎 {#5-create-the-kafka-table-engine}

下面的示例创建一个与 Merge Tree 表具有相同架构的表引擎。这并不是严格要求的，因为在目标表中可以有别名或临时列。然而，设置非常重要；请注意使用 `JSONEachRow` 作为从 Kafka 主题消费 JSON 的数据类型。`github` 和 `clickhouse` 的值分别表示主题和消费者组的名称。主题实际上可以是值的列表。

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

我们在下面讨论引擎设置和性能调优。在这一点上，对表 `github_queue` 的简单选择应该读取一些行。请注意，这将向前移动消费者偏移量，阻止这些行在没有 [重置](#common-operations) 的情况下再次读取。请注意限制和所需参数 `stream_like_engine_allow_direct_select.`

##### 6. 创建物化视图 {#6-create-the-materialized-view}

物化视图将连接之前创建的两个表，从 Kafka 表引擎读取数据并将其插入到目标 merge tree 表中。我们可以进行多种数据转换。我们将进行简单的读取和插入。使用 * 假设列名是相同的（区分大小写）。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

在创建时，物化视图连接到 Kafka 引擎并开始读取：将行插入目标表中。这个过程将无限期地继续，后续插入到 Kafka 的消息将被消费。请随意重新运行插入脚本以向 Kafka 插入更多消息。

##### 7. 确认行已经插入 {#7-confirm-rows-have-been-inserted}

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

要停止消息消费，您可以断开 Kafka 引擎表的连接：

```sql
DETACH TABLE github_queue;
```

这不会影响消费者组的偏移量。要重新启动消费并从上一个偏移量继续，请重新附加表。

```sql
ATTACH TABLE github_queue;
```

##### 添加 Kafka 元数据 {#adding-kafka-metadata}

在将元数据跟踪原始 Kafka 消息引入 ClickHouse 之后，这可能会很有用。例如，我们可能想知道我们消费了特定主题或分区的多少。为此，Kafka 表引擎暴露了几个 [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)。通过修改我们的模式和物化视图的选择语句，这些可以作为列在我们的目标表中持久保存。

首先，我们在添加列到目标表之前执行上述的停止操作。

```sql
DETACH TABLE github_queue;
```

下面我们添加信息列以识别源主题和行来源的分区。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

接下来，我们需要确保虚拟列按照要求进行映射。
虚拟列以 `_` 为前缀。
虚拟列的完整列表可以在 [这里](../../../engines/table-engines/integrations/kafka.md#virtual-columns) 找到。

要使用虚拟列更新我们的表，我们需要删除物化视图，重新附加 Kafka 引擎表，并重新创建物化视图。

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

新消费的行应该具有元数据。

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

我们建议删除 Kafka 引擎表并使用新设置重新创建它。在此过程中，物化视图不需要修改——一旦 Kafka 引擎表被重新创建，消息消费将恢复。

##### 调试问题 {#debugging-issues}

例如身份验证问题等错误不会在 Kafka 引擎 DDL 的响应中报告。为诊断问题，建议使用主 ClickHouse 日志文件 clickhouse-server.err.log。可以通过配置启用底层 Kafka 客户端库 [librdkafka](https://github.com/edenhill/librdkafka) 的进一步跟踪日志。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 处理格式错误的消息 {#handling-malformed-messages}

Kafka 经常被用作数据的“垃圾场”。这会导致主题包含混合的消息格式和不一致的字段名称。避免这种情况，利用 Kafka 的功能如 Kafka Streams 或 ksqlDB 以确保消息在插入 Kafka 之前是良好格式和一致的。如果这些选项不可行，ClickHouse 有一些功能可以帮助。

* 将消息字段视为字符串。在需要时，可以在物化视图语句中使用函数进行清理和转换。这不应代表生产解决方案，但可能有助于一次性摄取。
* 如果您从主题消费 JSON，使用 JSONEachRow 格式，请使用设置 [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields)。在写入数据时，默认情况下，如果输入数据包含目标表中不存在的列，ClickHouse 会抛出异常。然而，如果启用此选项，这些多余的列将被忽略。再次强调，这不是生产级解决方案，可能会混淆他人。
* 考虑设置 `kafka_skip_broken_messages`。这要求用户为格式错误的消息指定每个块的容忍级别——在 kafka_max_block_size 的上下文中考虑。如果超过了此容忍度（以绝对消息计量），通常的异常行为将恢复，其他消息将被跳过。

##### 递送语义和重复问题 {#delivery-semantics-and-challenges-with-duplicates}

Kafka 表引擎具有至少一次的语义。在几种已知的罕见情况下，可能会出现重复。例如，消息可以从 Kafka 读取并成功插入到 ClickHouse。在新偏移量可以提交之前与 Kafka 的连接丢失。在这种情况下需要重试该块。该块可以使用分布式表或 ReplicatedMergeTree 作为目标表进行 [去重](/engines/table-engines/mergetree-family/replication)。虽然这降低了重复行的可能性，但它依赖于相同的块。像 Kafka 重新平衡这样的事件可能会使这一假设失效，从而在罕见情况下造成重复。

##### 基于法定人数的插入 {#quorum-based-inserts}

对于在 ClickHouse 中需要更高递送保证的情况，您可能需要 [基于法定人数的插入](/operations/settings/settings#insert_quorum)。这不能在物化视图或目标表上设置。然而，它可以为用户配置文件设置，例如：

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse 到 Kafka {#clickhouse-to-kafka}

尽管是较少的用例，ClickHouse 数据也可以持久化到 Kafka。例如，我们将手动将行插入到 Kafka 表引擎中。该数据将由同一 Kafka 引擎读取，其物化视图会将数据放入 Merge Tree 表中。最后，我们演示在插入到 Kafka 中应用物化视图以从现有源表读取表的过程。

#### 步骤 {#steps-1}

我们的初始目标最好呈现如下：

<Image img={kafka_02} size="lg" alt="Kafka 表引擎与插入图示" />

我们假设您在 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 步骤下创建了表和视图，并且主题已被完全消费。

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

现在从 GitHub 目标表将行插入回 Kafka 表引擎 github_queue。请注意我们如何利用 JSONEachRow 格式，并将选择限制为 100。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

重新计算 GitHub 中的行以确认增加了 100。正如上图所示，行已经通过 Kafka 表引擎插入 Kafka，然后由同一引擎重新读取并通过我们的物化视图插入到 GitHub 目标表中！

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

当将文档插入表时，我们可以使用物化视图将消息推送到 Kafka 引擎（和主题）。当行插入到 GitHub 表时，触发了物化视图，导致行被插入回 Kafka 引擎并进入新的主题。再次展示如下：

<Image img={kafka_03} size="lg" alt="Kafka 表引擎与物化视图图示"/>

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

现在创建一个新的物化视图 `github_out_mv` 指向 GitHub 表，当触发时将行插入上述引擎。结果，向 GitHub 表的添加将被推送到我们新的 Kafka 主题中。

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

如果您插入到原始的 github 主题，该主题是在 [Kafka 到 ClickHouse](#kafka-to-clickhouse) 的一部分创建的，则文档将神奇地出现在 "github_clickhouse" 主题中。请使用原生 Kafka 工具确认这一点。例如，下面，我们使用 [kcat](https://github.com/edenhill/kcat) 向 github 主题插入 100 行，适用于托管在 Confluent Cloud 上的主题：

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

对 `github_out` 主题的读取应确认消息的递送。

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

虽然这是一个复杂的示例，但这展示了在与 Kafka 引擎结合使用时物化视图的强大。

### 集群与性能 {#clusters-and-performance}

#### 与 ClickHouse 集群一起工作 {#working-with-clickhouse-clusters}

通过 Kafka 消费者组，多个 ClickHouse 实例可能会从同一主题读取。每个消费者将被分配到主题分区的 1:1 映射。使用 Kafka 表引擎扩展 ClickHouse 消费时，请考虑集群中的消费者总数不能超过主题上的分区数。因此，请确保主题的分区在事先适当地配置。

多个 ClickHouse 实例可以使用相同的消费者组 ID 配置以读取同一个主题——在创建 Kafka 表引擎时指定。因此，每个实例将从一个或多个分区读取，并向其本地目标表插入段。这些目标表可以再次配置为使用 ReplicatedMergeTree 来处理数据的重复。这种方法允许 Kafka 的读取与 ClickHouse 集群进行扩展，前提是有足够的 Kafka 分区。

<Image img={kafka_04} size="lg" alt="Kafka 表引擎与 ClickHouse 集群图示"/>

#### 性能调优 {#tuning-performance}

在考虑提高 Kafka 引擎表吞吐量性能时，请考虑以下几点：

* 性能将根据消息大小、格式和目标表类型而有所不同。在单个表引擎上，每秒 100,000 行应被视为可达到的。默认情况下，消息以块的形式读取，由参数 kafka_max_block_size 控制。默认设置为 [max_insert_block_size](/operations/settings/settings#max_insert_block_size)，默认值为 1,048,576。除非消息极大，否则几乎总是应增加此值。500k 到 1M 之间的值并不罕见。测试并评估对吞吐量性能的影响。
* 可以使用 kafka_num_consumers 增加表引擎的消费者数量。然而，默认情况下，插入将在单线程中线性化，除非 kafka_thread_per_consumer 的默认值 (1) 被改变。将其设置为 1 以确保并行执行冲刷。请注意，创建具有 N 个消费者（和 kafka_thread_per_consumer=1）的 Kafka 引擎表在逻辑上等同于创建 N 个 Kafka 引擎，每个引擎都有物化视图和 kafka_thread_per_consumer=0。
* 增加消费者不是免费的操作。每个消费者维护自己的缓冲区和线程，增加了服务器的开销。注意消费者的开销，并首先在集群中线性扩展，如果可能的话。
* 如果 Kafka 消息的吞吐量变化且延迟是可以接受的，请考虑增加 stream_flush_interval_ms 以确保更大的块被冲刷。
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) 设置执行后台任务的线程数。这些线程用于 Kafka 流媒体。此设置在 ClickHouse 服务器启动时应用，并且不能在用户会话中更改，默认值为 16。如果您在日志中看到超时，则可能适合增加此值。
* 在与 Kafka 进行通信时，使用了 librdkafka 库，这本身会创建线程。因此，大量的 Kafka 表或消费者可能会导致大量的上下文切换。要么在集群中分配此负载，要么仅在可能的情况下复制目标表，或者考虑使用表引擎从多个主题读取——支持值的列表。多个物化视图可以从同一个表中读取，每个过滤来自特定主题的数据。

所有设置更改应经过测试。我们建议监视 Kafka 消费者滞后，以确保您得到合理的扩展。

#### 附加设置 {#additional-settings}

除了上述讨论的设置外，以下可能会引起您的兴趣：

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - 阅读 Kafka 消息之前的等待时间（以毫秒为单位），然后重试。设置在用户配置文件级别，默认值为 5000。

底层 librdkafka 中的 [所有设置](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) 也可以放置在 ClickHouse 配置文件中的 _kafka_ 元素内——设置名称应为 XML 元素，带有用下划线替换的句点，例如：

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

这些是专家设置，建议您参考 Kafka 文档以获取深入解释。
