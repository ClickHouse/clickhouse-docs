---
sidebar_label: 'Kafka table engine'
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: 'Using the Kafka table engine to read data from and write data to Apache Kafka and other Kafka API-compatible brokers (e.g. Redpanda, Amazon MSK)'
title: 'Using the Kafka table engine'
---

import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Using the Kafka table engine

The Kafka table engine can be used to [**read** data from](#kafka-to-clickhouse) and [**write** data to](#clickhouse-to-kafka) Apache Kafka and other Kafka API-compatible brokers (e.g., Redpanda, Amazon MSK). This engine is bundled with open-source ClickHouse and is available across all deployment types.

### Kafka to ClickHouse {#kafka-to-clickhouse}

:::tip
If you're on ClickHouse Cloud, we recommend using **[ClickPipes](/integrations/clickpipes)** instead. ClickPipes natively supports private network connections, scaling ingestion and cluster resources independently, and comprehensive monitoring for streaming Kafka data into ClickHouse.
:::

You can use the Kafka table engine to ingest data from Kafka topics into ClickHouse. The engine is designed to continuously consume and stream messages to attached materialized views, which then insert data into target tables for persistent storage. For this reason, you should be broadly familiar with [materialized views](../../../guides/developer/cascading-materialized-views.md) and [Merge Tree family tables](../../../engines/table-engines/mergetree-family/index.md) when using the Kafka table engine to read data from Apache Kafka and other Kafka API-compatible brokers.

<Image img={kafka_01} size="lg" alt="Kafka table engine architecture diagram" style={{width: '80%'}} />

The engine ensures reliable processing through **at-least-once** semantics: consumer offsets are only committed to Kafka after all attached materialized views successfully process each batch of messages. If there is an error in any materialized view attached to the engine, the consumer offsets will not be committed, and the same messages will be retried until all materialized views succeed. This means that it is possible to get [duplicates in failure scenarios](#delivery-semantics-and-challenges-with-duplicates).

#### Quickstart {#quickstart}

To get started ingesting data from Kafka into ClickHouse, follow the steps below. If you already have an existing topic you'd like to consume data from, skip to [Step 3](#3-configure-data-ingestion).

##### 1. Prepare a sample dataset {#1-prepare-a-sample-dataset}

To create a new topic with a sample dataset for testing, you can use [this Github dataset](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson). To download the dataset, run:

```sh
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson
```

This dataset is a subset of the [GitHub archive dataset](https://ghe.clickhouse.tech/), modified to include only GitHub events for the [ClickHouse repository](https://github.com/ClickHouse/ClickHouse). Most queries [published with the dataset](https://ghe.clickhouse.tech/) can be used with this modified version to explore the data in ClickHouse, once ingested.

##### 2. Create and populate the topic {#2-create-and-populate-the-topic}

[//]: # "TODO Consider providing instructions specific to all supported brokers or hosted services. Otherwise, using the CLI tools that ship with Kafka installations makes it easier to get started with no dependencies."

Next, create a new topic in your target broker. For example, if you're running Kafka locally, you can use the built-in [Kafka CLI tools](https://docs.confluent.io/kafka/operations-tools/kafka-tools.html):

```bash
bin/kafka-topics.sh --bootstrap-server <host>:<port> --topic github --partitions 3
```

If you're using a hosted service like Confluent Cloud, you can use the [Cloud Console](https://docs.confluent.io/cloud/current/topics/overview.html) or a client like the [Confluent CLI](https://docs.confluent.io/confluent-cli/current/install.html):

```bash
confluent kafka topic create --if-not-exists github --partitions 3
```

To load the sample dataset into the topic, you can then use a command-line tool like [kcat](https://github.com/edenhill/kcat). For example, if you're running Kafka locally with authentication disabled:

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

Or if you're using a hosted service like Confluent Cloud with SASL authentication:

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github \
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username>  \
  -X sasl.password=<password>
```

The dataset contains 200,000 rows, so it should be available in the specified topic in a few seconds. If you want to work with a larger dataset, take a look at [the large datasets section](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets) of the [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHub repository.

##### 3. Configure data ingestion {#3-configure-data-ingestion}

[//]: # "TODO We should not teach users to select directly from the Kafka table, since this approach isn't reliable. When we rollout the v2 engine, we can reconsider, but now we should direct users to finish setting up and check ingestion progress in the system catalog table."

Before ClickHouse can ingest data from a Kafka topic, you must first provide details on how to connect to and authenticate with your Kafka broker, as well as how to interpret the data. In this example, the Kafka broker uses simple authentication (SASL), the source data is `JSON`-encoded and no schema registry is used. For a complete overview of all the supported formats, features, and configuration options, see the [reference documentation](../../../engines/table-engines/integrations/kafka).

<Tabs groupId="auth-configuration">
<TabItem value="chcloud" label="ClickHouse Cloud">

In ClickHouse Cloud, you can provide inline credentials in the Kafka table engine `CREATE TABLE` statement using the `SETTINGS` clause. See the [reference documentation](../../../engines/table-engines/integrations/kafka.md#creating-a-table) for supported setting configurations.

:::info
It is **not** possible to connect to brokers using TLS/SSL from ClickHouse Cloud, since there is no mechanism to upload and rotate certificates yet — only SASL is supported. If this is a requirement for your use case, we recommend using [ClickPipes](/integrations/clickpipes) or the [Kafka Connect Sink](/integrations/kafka/clickhouse-kafka-connect-sink) instead.
:::

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
ENGINE = Kafka()
SETTINGS kafka_broker_list='<host>:<port>',
         kafka_topic_list='github',
         kafka_group_name='clickhouse',
         kafka_format = 'JSONEachRow',
         kafka_thread_per_consumer = 0, 
         kafka_num_consumers = 1,
         -- Connecting to a Confluent Cloud broker using
         -- simple username/password authentication
         kafka_security_protocol='sasl_ssl',
         kafka_sasl_mechanism = 'PLAIN',
         kafka_sasl_username = '<username>',
         kafka_sasl_password = '<password>';
```

</TabItem>
<TabItem value="ch" label="Self-hosted ClickHouse">

In self-hosted ClickHouse, you can configure credentials using [configuration files](../../../operations/configuration-files.md), [named collections](../../../operations/named-collections.md#named-collections-for-accessing-kafka), or inline in the `CREATE TABLE` statement using the [`SETTINGS` clause](../../../engines/table-engines/integrations/kafka.md#creating-a-table).

:::tip
Inline credentials are a good fit for prototyping (e.g., to follow the steps in this guide). For production environments, or environments with a large number of tables reading from the same broker, we recommend using configuration files or named collections to manage credentials.
:::

**Configuration files**

The Kafka table engine supports extended configuration using ClickHouse config files. You can either place the Kafka-specific configuration in a new file under the `conf.d/` directory, or append it to existing configuration files.

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

See the [reference documentation](../../../engines/table-engines/integrations/kafka.md#configuration) for supported configuration keys.

**Named collections**

You can use [named collections](../../../operations/named-collections.md#named-collections-for-accessing-kafka) to securely store and reuse credentials across multiple `CREATE TABLE` statements.

```sql
CREATE NAMED COLLECTION my_kafka_cluster AS
  kafka_broker_list = '<host>:<port>',
  kafka_security_protocol='sasl_ssl',
  kafka_sasl_mechanism = 'PLAIN',
  kafka_sasl_username = '<username>',
  kafka_sasl_password = '<password>';
```

You can then inline a named collection in the `ENGINE` clause of Kafka table engine `CREATE TABLE` statements.

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
ENGINE = Kafka(my_kafka_cluster)
SETTINGS kafka_topic_list='github',
         kafka_group_name='clickhouse',
         kafka_format = 'JSONEachRow',
         kafka_thread_per_consumer = 0, 
         kafka_num_consumers = 1;
```

See the [reference documentation](../../../engines/table-engines/integrations/kafka.md#configuration) for supported configuration keys and [this guide](./kafka-table-engine-named-collections.md) for a complete walkthrough of using named collections with the Kafka table engine.

**Inline**

You can provide inline credentials in the Kafka table engine `CREATE TABLE` statement using the `SETTINGS` clause. See the [reference documentation](../../../engines/table-engines/integrations/kafka.md#creating-a-table) for supported setting configurations.

:::info
It is **not** possible to configure certificates to connect to brokers using TLS/SSL using this method, since the required options are not exposed via SQL — only SASL is supported. If this is the case, use one of the other methods instead.
:::

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
ENGINE = Kafka()
SETTINGS kafka_broker_list='<host>:<port>',
         kafka_topic_list='github',
         kafka_group_name='clickhouse',
         kafka_format = 'JSONEachRow',
         kafka_thread_per_consumer = 0, 
         kafka_num_consumers = 1,
         -- Connecting to a Kafka broker using simple
         -- username/password authentication
         kafka_security_protocol='sasl_ssl',
         kafka_sasl_mechanism = 'PLAIN',
         kafka_sasl_username = '<username>',
         kafka_sasl_password = '<password>';
```

</TabItem>
</Tabs>

It's important to note that creating a Kafka table engine table does **not** start data ingestion — it simply configures a consumer. After this step, you must create a target table and a materialized view to start data ingestion from the specified topic.

:::tip
The Kafka table engine is designed for one-time data retrieval. You should **never** select data from a Kafka table directly, but use a materialized view and query its associated target table instead.
:::

##### 4. Create a target table {#4-create-a-target-table}

Once you define the schema of your Kafka table engine table, you must create a target table that will persist the data in ClickHouse. If the schema of your target table is the same as the schema you defined for the ingestion table (`github_queue`), you can use the [`CREATE TABLE AS` syntax](../../../sql-reference/statements/create/table#with-a-schema-similar-to-other-table-with-a-schema-similar-to-other-table) to copy that schema over.

```sql
CREATE TABLE github AS github_queue
ENGINE = MergeTree()
ORDER BY (event_type, repo_name, created_at);
```

This table must use an engine of the [Merge Tree family](../../../engines/table-engines/mergetree-family/index.md). For simplicity, this example uses the `MergeTree()` engine, but you should evaluate the best fit for your use case.

##### 5. Create a materialized view {#5-create-a-materialized-view}

To ingest data, the Kafka table engine must be attached to a materialized view. As new messages are detected in the upstream Kafka broker, the materialized view is triggered to insert data into persistent storage (i.e., the target table you created in the previous step).

In this example, the target table (`github`) has the same schema as the ingestion table (`github_queue`), so the materialized view will do a simple `SELECT *`.

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

Once created, the materialized view connects to the Kafka table engine and kickstarts data ingestion. This process continues indefinitely: reading new data from the upstream Kafka broker, triggering the materialized view, and inserting data into the target table.

##### 6. Confirm rows have been inserted {#6-confirm-rows-have-been-inserted}

To confirm that all messages were processed and stored in ClickHouse, run a count against your target table.

```sql
SELECT count() FROM github;
```

It's important to note that the Kafka table engine processes data in discrete batches (controlled by settings like `kafka_max_block_size` and `kafka_flush_interval_ms`), which means that you might see previous state while a batch of rows is being processed, but never partially processed batches. When all data has been processed, you should see 200,000 rows:

```sql
┌─count()─┐
│  200000 │
└─────────┘
```

To monitor ingestion progress and debug errors with the Kafka consumer, you can query the [`system.kafka_consumers` system table](../../../operations/system-tables/kafka_consumers). If your deployment has multiple replicas (e.g., ClickHouse Cloud), you must use the [`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md) table function.

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

#### Common operations {#common-operations-read}

##### Troubleshooting {#troubleshooting}

<Tabs groupId="auth-configuration">
<TabItem value="chcloud" label="ClickHouse Cloud">

**System tables**

To troubleshoot errors with the Kafka consumer, you can query the [`system.kafka_consumers` system table](../../../operations/system-tables/kafka_consumers).

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

**Log files**

Logging for the Kafka table engine is reported in the ClickHouse server logs, which are not exposed to users in ClickHouse Cloud. If you can't track down the issue using the methods above, you should [contact the ClickHouse support team](https://clickhouse.com/support/program) for server-level log analysis.

</TabItem>
<TabItem value="ch" label="Self-hosted ClickHouse">

**System tables**

To troubleshoot errors with the Kafka consumer, you can query the [`system.kafka_consumers` system table](../../../operations/system-tables/kafka_consumers).

```sql
SELECT * FROM system.kafka_consumers
ORDER BY assignments.partition_id ASC;
```

If your deployment has multiple replicas, you must use the [`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md) table function.

**Log files**

Logging for the Kafka table engine is reported in the ClickHouse server logs. For troubleshooting, use the 
Errors such as authentication issues are not reported in responses to Kafka engine DDL. For diagnosing issues, we recommend using the main ClickHouse log file clickhouse-server.err.log. You can enable further trace logging for the underlying Kafka client library ([librdkafka](https://github.com/edenhill/librdkafka)) through configuration.

```xml
<kafka>
   <debug>all</debug>
</kafka>
```
</TabItem>
</Tabs>

##### Stopping & restarting message consumption {#stopping--restarting-message-consumption}

To stop message consumption, you can detach the Kafka engine table:

```sql
DETACH TABLE github_queue;
```

This will not impact the offsets of the consumer group. To restart consumption, and continue from the previous offset, reattach the table.

```sql
ATTACH TABLE github_queue;
```

##### Using Kafka metadata {#using-kafka-metadata}

In addition to the message value, the Kafka table engine also exposes Kafka metadata fields like the message key, headers, and others as [virtual columns](../../../engines/table-engines/index.md#table_engines-virtual_columns). These virtual columns are prefixed with `_` and can be added as columns in your target table on creation.

If you want to add metadata columns to an existing target table, you must first [detach](../../../sql-reference/statements/detach.md) the Kafka table to stop data ingestion.

```sql
DETACH TABLE github_queue;
```

To add new columns to the target table for persisting Kafka metadata, use the [`ALTER TABLE...ADD COLUMN` statement](../../../sql-reference/statements/alter/column.md). For example:

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

Next, you must adjust the materialized view to start consuming these metadata columns. With the Kafka table detached, it's safe to drop the materialized view, re-attach the table, and re-create the materialized view to resume ingestion.

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

When you select from the target table, you should see the additional columns populated.

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

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

See the [reference documentation](../../../engines/table-engines/integrations/kafka.md#virtual-columns) for a complete list of supported Kafka metadata fields.

##### Modifying table settings {#modifying-table-settings}

To modify Kafka table settings, we recommend **dropping and recreating** the table with the new configuration. The materialized view does not need to be modified - message consumption will automatically resume from the last committed offset when the table is recreated.

While you can use [`ALTER TABLE...MODIFY SETTING`](../../../sql-reference//statements/alter/setting.md) for simple settings like `kafka_max_block_size`, dropping and recreating is more reliable (and often required) for significant configuration changes such as broker lists, consumer groups, topics, or authentication settings.

##### Handling malformed messages {#handling-malformed-messages}

Kafka is often used as a "dumping ground" for data. This leads to topics containing mixed message formats and inconsistent field names. Avoid this and utilize Kafka features such Kafka Streams or ksqlDB to ensure messages are well-formed and consistent before insertion into Kafka. If these options are not possible, ClickHouse has some features that can help.

* Treat the message field as strings. Functions can be used in the materialized view statement to perform cleansing and casting if required. This should not represent a production solution but might assist in one-off ingestion.
* If you're consuming JSON from a topic, using the JSONEachRow format, use the setting [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields). When writing data, by default, ClickHouse throws an exception if input data contains columns that do not exist in the target table. However, if this option is enabled, these excess columns will be ignored. Again this is not a production-level solution and might confuse others.
* Consider the setting `kafka_skip_broken_messages`. This requires the user to specify the level of tolerance per block for malformed messages - considered in the context of kafka_max_block_size. If this tolerance is exceeded (measured in absolute messages) the usual exception behaviour will revert, and other messages will be skipped.

##### Delivery Semantics and challenges with duplicates {#delivery-semantics-and-challenges-with-duplicates}

The Kafka table engine has at-least-once semantics. Duplicates are possible in several known rare circumstances. For example, messages could be read from Kafka and successfully inserted into ClickHouse. Before the new offset can be committed, the connection to Kafka is lost. A retry of the block in this situation is required. The block may be [de-duplicated ](/engines/table-engines/mergetree-family/replication) using a distributed table or ReplicatedMergeTree as the target table. While this reduces the chance of duplicate rows, it relies on identical blocks. Events such as a Kafka rebalancing may invalidate this assumption, causing duplicates in rare circumstances.

##### Quorum based Inserts {#quorum-based-inserts}

You may need [quorum-based inserts](/operations/settings/settings#insert_quorum) for cases where higher delivery guarantees are required in ClickHouse. This can't be set on the materialized view or the target table. It can, however, be set for user profiles. For example:

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse to Kafka {#clickhouse-to-kafka}

:::note
If you're on ClickHouse Cloud, it's important to note that private network connections are not supported. This means that your broker(s) must be configured for public access.
:::

You can use the Kafka table engine to write data from ClickHouse to Kafka topics. The engine is designed to push messages to a topic when triggered by direct inserts or updates in attached materialized views. For this reason, you should be broadly familiar with [materialized views](../../../guides/developer/cascading-materialized-views.md) when using the Kafka table engine to write data to Apache Kafka and other Kafka API-compatible brokers.

<Image img={kafka_02} size="lg" alt="Kafka table engine with inserts diagram" />

The engine ensures reliable delivery through **at-least-once** semantics: when data is inserted into a Kafka table, the operation only succeeds after the data is successfully sent to the Kafka topic. If there is an error sending data to Kafka (e.g., network connectivity issues, Kafka broker unavailability), the engine will automatically handle retries. This means that it is possible to get duplicates in failure scenarios if, for example, data reaches Kafka but the acknowledgment is lost due to network connectivity issues, causing the operation to be retried.

#### Quickstart {#quickstart-1}

To get started writing data from ClickHouse into Kafka, follow the steps below. If you already have an existing topic you'd like to produce data to, skip to [Step 2](#2-produce-data-to-the-target-topic).

##### 1. Create a target topic {#1-create-a-target-topic}

Create a new topic in your target broker. For example, if you're running Kafka locally, you can use the built-in [Kafka CLI tools](https://docs.confluent.io/kafka/operations-tools/kafka-tools.html):

```bash
bin/kafka-topics.sh --bootstrap-server <host>:<port> --topic github_out --partitions 3
```

If you're using a hosted service like Confluent Cloud, you can use the [Cloud Console](https://docs.confluent.io/cloud/current/topics/overview.html) or a client like the [Confluent CLI](https://docs.confluent.io/confluent-cli/current/install.html):

```bash
confluent kafka topic create --if-not-exists github_out --partitions 3
```

##### 2. Produce data to the target topic {#2-produce-data-to-the-target-topic}

To produce data. 

**Using materialized views**

We can utilize materialized views to push messages to a Kafka engine (and a topic) when documents are inserted into a table. When rows are inserted into the GitHub table, a materialized view is triggered, which causes the rows to be inserted back into a Kafka engine and into a new topic. Again this is best illustrated:

<Image img={kafka_03} size="lg" alt="Kafka table engine with materialized views diagram"/>

Create a new Kafka topic `github_out` or equivalent. Ensure a Kafka table engine `github_out_queue` points to this topic.

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

Now create a new materialized view `github_out_mv` to point at the GitHub table, inserting rows to the above engine when it triggers. Additions to the GitHub table will, as a result, be pushed to our new Kafka topic.

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

**Using direct inserts**

First, confirm the count of the target table.

```sql
SELECT count() FROM github;
```

You should have 200,000 rows:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

Now insert rows from the GitHub target table back into the Kafka table engine github_queue. Note how we utilize JSONEachRow format and LIMIT the select to 100.

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

Recount the row in GitHub to confirm it has increased by 100. As shown in the above diagram, rows have been inserted into Kafka via the Kafka table engine before being re-read by the same engine and inserted into the GitHub target table by our materialized view!

```sql
SELECT count() FROM github;
```

You should see 100 additional rows:
```response
┌─count()─┐
│  200100 │
└─────────┘
```

Should you insert into the original github topic, created as part of [Kafka to ClickHouse](#kafka-to-clickhouse), documents will magically appear in the "github_clickhouse" topic. Confirm this with native Kafka tooling. For example, below, we insert 100 rows onto the github topic using [kcat](https://github.com/edenhill/kcat) for a Confluent Cloud hosted topic:

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

A read on the `github_out` topic should confirm delivery of the messages.

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

Although an elaborate example, this illustrates the power of materialized views when used in conjunction with the Kafka engine.

#### Common operations {#common-operations-write}

### Clusters and Performance {#clusters-and-performance}

#### Working with ClickHouse Clusters {#working-with-clickhouse-clusters}

Through Kafka consumer groups, multiple ClickHouse instances can potentially read from the same topic. Each consumer will be assigned to a topic partition in a 1:1 mapping. When scaling ClickHouse consumption using the Kafka table engine, consider that the total number of consumers within a cluster cannot exceed the number of partitions on the topic. Therefore ensure partitioning is appropriately configured for the topic in advance.

Multiple ClickHouse instances can all be configured to read from a topic using the same consumer group id - specified during the Kafka table engine creation. Therefore, each instance will read from one or more partitions, inserting segments to their local target table. The target tables can, in turn, be configured to use a ReplicatedMergeTree to handle duplication of the data. This approach allows Kafka reads to be scaled with the ClickHouse cluster, provided there are sufficient Kafka partitions.

<Image img={kafka_04} size="lg" alt="Kafka table engine with ClickHouse clusters diagram"/>

#### Tuning Performance {#tuning-performance}

Consider the following when looking to increase Kafka Engine table throughput performance:


* The performance will vary depending on the message size, format, and target table types. 100k rows/sec on a single table engine should be considered obtainable. By default, messages are read in blocks, controlled by the parameter kafka_max_block_size. By default, this is set to the [max_insert_block_size](/operations/settings/settings#max_insert_block_size), defaulting to 1,048,576. Unless messages are extremely large, this should nearly always be increased. Values between 500k to 1M are not uncommon. Test and evaluate the effect on throughput performance.
* The number of consumers for a table engine can be increased using kafka_num_consumers. However, by default, inserts will be linearized in a single thread unless kafka_thread_per_consumer is changed from the default value of 1. Set this to 1 to ensure flushes are performed in parallel. Note that creating a Kafka engine table with N consumers (and kafka_thread_per_consumer=1) is logically equivalent to creating N Kafka engines, each with a materialized view and kafka_thread_per_consumer=0.
* Increasing consumers is not a free operation. Each consumer maintains its own buffers and threads, increasing the overhead on the server. Be conscious of the overhead of consumers and scale linearly across your cluster first and if possible.
* If the throughput of Kafka messages is variable and delays are acceptable, consider increasing the stream_flush_interval_ms to ensure larger blocks are flushed.
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) sets the number of threads performing background tasks. These threads are used for Kafka streaming. This setting is applied at the ClickHouse server start and can't be changed in a user session, defaulting to 16. If you see timeouts in the logs, it may be appropriate to increase this.
* For communication with Kafka, the librdkafka library is used, which itself creates threads. Large numbers of Kafka tables, or consumers, can thus result in large numbers of context switches. Either distribute this load across the cluster, only replicating the target tables if possible, or consider using a table engine to read from multiple topics - a list of values is supported. Multiple materialized views can be read from a single table, each filtering to the data from a specific topic.

Any settings changes should be tested. We recommend monitoring Kafka consumer lags to ensure you are properly scaled.

#### Additional Settings {#additional-settings}

Aside from the settings discussed above, the following may be of interest:

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - The wait time in milliseconds for reading messages from Kafka before retry. Set at a user profile level and defaults to 5000.

[All settings ](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)from the underlying librdkafka can also be placed in the ClickHouse configuration files inside a _kafka_ element - setting names should be XML elements with periods replaced with underscores e.g.

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

These are expert settings and we'd suggest you refer to the Kafka documentation for an in-depth explanation.
