---
sidebar_label: Kafka
sidebar_position: 1
slug: /en/integrations/kafka/
description: Introduction to Kafka with ClickHouse
---

# Integrating Kafka with ClickHouse

[Apache Kafka](https://kafka.apache.org/) is an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications. In most cases involving Kafka and ClickHouse, users will wish to insert Kafka based data into ClickHouse - although the reverse is supported. Below we outline several options for both use cases, identifying the pros and cons of each approach.

For those who do not have a Kafka instance to hand, we recommend [Confluent Cloud](https://www.confluent.io/get-started/), which offers a free tier adequate for testing these examples. For self-managed alternatives, consider the [Confluent for Kubernetes](https://docs.confluent.io/operator/current/overview.html) or [here](https://docs.confluent.io/platform/current/installation/installing_cp/overview.html) for non-Kubernetes environments.


## Assumptions

* You are familiar with the Kafka fundamentals, such as producers, consumers and topics.
* You have a topic prepared for these examples. We assume all data is stored in Kafka as JSON, although the principles remain the same if using Avro.
* We utilise the excellent [kcat](https://github.com/edenhill/kcat) (formerly kafkacat) in our examples to publish and consume Kafka data.
* Whilst we reference some python scripts for loading sample data, feel free to adapt the examples to your dataset.
* You are broadly familiar with ClickHouse materialized views.

:::note
Check out our blog on the [new official ClickHouse Kafka Connector](https://clickhouse.com/blog/kafka-connect-connector-clickhouse-with-exactly-once).
:::

## Choosing an option

When integrating Kafka with ClickHouse, you will need to make early architectural decisions about the high-level approach used. We outline the most common strategies below:

### Kafka table engine
* The [Kafka table engine](#kafka-table-engine) provides a Native ClickHouse integration. This table engine **pulls** data from the source system. This requires ClickHouse to have direct access to Kafka.
:::note
Kafka table engine is not supported on [ClickHouse Cloud](https://clickhouse.com/cloud). Please consider one of the following alternatives.
:::

### Cloud-based Kafka Connectivity
* [**Confluent Cloud**](#confluent-http-sink-connector) - Confluent platform provides HTTP Sink connector for Confluent Cloud that integrates Apache Kafka with an API via HTTP or HTTPS.

* [**Amazon MSK**](../msk/index.md) - support Amazon MSK Connect framework to forward data from Apache Kafka clusters to external systems such as ClickHouse. You can install **ClickHouse Kafka Connect** on Amazon MSK.

### Self-managed Kafka Connectivity
* [**Kafka Connect**](#clickhouse-kafka-connect-sink) - Kafka Connect is a free, open-source component of Apache Kafka® that works as a centralized data hub for simple data integration between Kafka and other data systems.  Connectors provide a simple means of scalably and reliably streaming data to and from Kafka.  Source Connectors inserts data to Kafka topics from other systems, whilst Sink Connectors delivers data from Kafka topics into other data stores such as ClickHouse.
* [**Vector**](#using-vector-with-kafka-and-clickhouse) - Vector is a vendor agnostic data pipeline. With the ability to read from Kafka, and send events to ClickHouse, this represents a robust integration option.
* [**JDBC Connect Sink**](#jdbc-connector) - The Kafka Connect JDBC Sink connector allows you to export data from Kafka topics to any relational database with a JDBC driver
* **Custom code** - Custom code using respective client libraries for Kafka and ClickHouse may be appropriate cases where custom processing of events is required. This is beyond the scope of this documentation.

### Choosing an approach
It comes down to a few decision points:

* **Connectivity** - The Kafka table engine needs to be able to pull from Kafka if ClickHouse is the destination. This requires bi-directional connectivity. If there is a network separation, e.g. ClickHouse is in the Cloud and Kafka is self-managed, you may be hesitant to remove this for compliance and security reasons. (This approach is not currently supported in ClickHouse Cloud.) The Kafka table engine utilizes resources within ClickHouse itself, utilizing threads for the consumers. Placing this resource pressure on ClickHouse may not be possible due to resource constraints, or your architects may prefer a separation of concerns. In this case, tools such as Kafka Connect, which run as a separate process and can be deployed on different hardware may be preferable. This allows the process responsible for pulling Kafka data to be scaled independently of ClickHouse.

* **Hosting on Cloud** - Cloud vendors may set limitations on Kafka components available on their platform. Follow the guide to explore recommended options for each Cloud vendor.

* **External enrichment** - Whilst messages can be manipulated before insertion into ClickHouse, through the use of functions in the select statement of the materialized view, users may prefer to move complex enrichment external to ClickHouse.

* **Data flow direction** - Vector only supports the transfer of data from Kafka to ClickHouse.


## Using the Kafka table engine

:::note
Kafka table engine is not supported on [ClickHouse Cloud](https://clickhouse.com/cloud). Please consider Kafka Connect or Vector.
:::

### Kafka to ClickHouse

To utilise the Kafka table engine, the reader should be broadly familiar with ClickHouse materialized views.

#### Overview

Initially, we focus on the most common use case: using the Kafka table engine to insert data into ClickHouse from Kafka.

The Kafka table engine allows ClickHouse to read from a Kafka topic directly. Whilst useful for viewing messages on a topic, the engine by design only permits one-time retrieval, i.e. when a query is issued to the table, it consumes data from the queue and increases the consumer offset before returning results to the caller. Data cannot, in effect, be re-read without resetting these offsets.

To persist this data from a read of the table engine, we need a means of capturing the data and inserting it into another table. Trigger-based materialized views natively provide this functionality. A materialized view initiates a read on the table engine, receiving batches of documents. The TO clause determines the destination of the data - typically a table of the [Merge Tree family](../../../engines/table-engines/mergetree-family/index.md). This process is visualized below:

<img src={require('./images/kafka_01.png').default} class="image" alt="Kafka table engine" style={{width: '80%'}}/>

#### Steps


##### 1. Prepare

If you have data populated on a target topic, you can adapt the following for use in your dataset. Alternatively, a sample Github dataset is provided [here](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson). This dataset is used in the examples below and uses a reduced schema and subset of the rows (specifically, we limit to Github events concerning the [ClickHouse repository](https://github.com/ClickHouse/ClickHouse)), compared to the full dataset available [here](https://ghe.clickhouse.tech/), for brevity. This is still sufficient for most of the queries [published with the dataset](https://ghe.clickhouse.tech/) to work.


##### 2. Configure ClickHouse

This step is required if you are connecting to a secure Kafka. These settings cannot be passed through the SQL DDL commands and must be configured in the ClickHouse config.xml. We assume you are connecting to a SASL secured instance. This is the simplest method when interacting with Confluent Cloud.


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

Either place the above snippet inside a new file under your conf.d/ directory or merge it into existing configuration files. For settings that can be configured, see [here](../../../engines/table-engines/integrations/kafka.md#configuration).


##### 3. Create the destination table

Prepare your destination table. In the example below we use the reduced GitHub schema for purposes of brevity. Note that although we use a MergeTree table engine, this example could easily be adapted for any member of the MergeTree family.


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

##### 4. Create and populate the topic

[Kcat](https://github.com/edenhill/kcat) is recommended as a simple means of publishing data to a topic. Using the provided dataset with Confluent Cloud is as simple as modifying the configuration file and running the below example. The following assumes you have [created the topic](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records) “github”.

```bash
cat github_all_columns.ndjson | kafkacat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

Note that this dataset is deliberately small, with only 200,000 rows. This should take only a few seconds to insert on most Kafka clusters, although this may depend on network connectivity. We include [instructions](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets) to produce larger datasets should you need e.g. for performance testing.

##### 5. Create the Kafka table engine

The below example creates a table engine with the same schema as the merge tree table. Note that this isn’t required, e.g. you can have an alias or ephemeral columns in the target table. The settings are important; however - note the use of JSONEachRow as the data type for consuming JSON from a Kafka topic. The values “github” and “clickhouse” represent the name of the topic and consumer group names, respectively. Note that the topics can actually be a list of values.

```sql
CREATE TABLE default.github_queue
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


We discuss engine settings and performance tuning below. At this point, a simple select on the table `github_queue` should read some rows.  Note that this will move the consumer offsets forward, preventing these rows from being re-read without a [reset](#common-operations). Note the limit and required parameter `stream_like_engine_allow_direct_select.`

##### 6. Create the materialized view

The materialized view will connect the two previously created tables, reading data from the Kafka table engine and inserting it into the target merge tree table. We can do a number of data transformations. We will do a simple read and insert. The use of * assumes column names are identical (case sensitive).

```sql
CREATE MATERIALIZED VIEW default.github_mv TO default.github AS
SELECT *
FROM default.github_queue;
```

At the point of creation, the materialized view connects to the Kafka engine and commences reading: inserting rows into the target table. This process will continue indefinitely, with subsequent message inserts into Kafka being consumed. Feel free to re-run the insertion script to insert further messages to Kafka.

##### 7. Confirm rows have been inserted

Confirm data exists in the target table:
```sql
SELECT count() FROM default.github;
```

You should see 200,000 rows:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### Common Operations

##### Stopping & restarting message consumption

To stop message consumption, simply detach the Kafka engine table e.g.

```sql
DETACH TABLE github_queue;
```

Note that this will not impact the offsets of the consumer group. To restart consumption, and continue from the previous offset, simply reattach the table.

```sql
ATTACH TABLE github_queue;
```

We can use this operation to make setting and schema changes - see below.

##### Adding Kafka Metadata


It is not uncommon for users to need to identify the coordinates of the original Kafka messages for the rows in ClickHouse. For example, we may want to know how much of a specific topic or partition we have consumed. For this purpose, the Kafka table engine exposes several [virtual columns](../../../engines/table-engines/index.md#table_engines-virtual_columns). These can be persisted as columns in our target table by modifying our schema and materialized view’s select statement.

First, we perform the stop operation described above before adding columns to our target table.

```sql
DETACH TABLE github_queue;
```

Below we add information columns to identify the source topic and the partition from which the row originated.

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

Next, we need to ensure virtual columns are mapped as required. This requires us to drop and recreate our materialized view. Note those prefixed with _. A complete listing of virtual columns can be found [here](../../../engines/table-engines/integrations/kafka.md#virtual-columns).


```sql
DROP VIEW default.github_mv;

CREATE MATERIALIZED VIEW default.github_mv TO default.github AS
SELECT *, _topic as topic, _partition as partition
FROM default.github_queue;
```

Finally, we are good to reattach our Kafka engine table `github_queue` and restart message consumption.

```sql
ATTACH TABLE github_queue;
```

Newly consumed rows should have the metadata.

```sql
SELECT actor_login, event_type, created_at, topic, partition FROM default.github LIMIT 10;
```

The result looks like:

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


##### Modify Kafka Engine Settings

We recommend dropping the Kafka engine table and recreating it with the new settings. The materialized view does not need to be modified during this process - message consumption will resume once the Kafka engine table is recreated.

##### Debugging Issues

Errors such as authentication issues are not reported in responses to Kafka engine DDL. For diagnosing issues, we recommend using the main ClickHouse log file clickhouse-server.err.log. Further trace logging for the underlying Kafka client library [librdkafka](https://github.com/edenhill/librdkafka) can be enabled through configuration.

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### Handling malformed messages

Kafka is often used as a "dumping ground" for data. This leads to topics containing mixed message formats and inconsistent field names. Avoid this and utilize Kafka features such Kafka Streams or ksqlDB to ensure messages are well-formed and consistent before insertion into Kafka. If these options are not possible, we can assist:

* Treat the message field as strings. Functions can be used in the materialized view statement to perform cleansing and casting if required. This should not represent a production solution but might assist in one-off ingestions.
* If you’re consuming JSON from a topic, using the JSONEachRow format, consider the setting [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md#settings-input-format-skip-unknown-fields). Normally, when writing data, ClickHouse throws an exception if input data contains columns that do not exist in the target table. If this option is enabled, these excess columns will be ignored. Again this is not a production-level solution and might confuse others.
* Consider the setting kafka_skip_broken_messages. This requires the user to specify the level of tolerance per block for malformed messages - considered in the context of kafka_max_block_size. If this tolerance is exceeded (measured in absolute messages) the usual exception behaviour will revert, and other messages will be skipped.

##### Delivery Semantics and challenges with duplicates

The Kafka table engine has at-least-once semantics. Duplicates are possible in several known rare circumstances. For example, messages could be read from Kafka and successfully inserted into ClickHouse. Before the new offset can be committed, the connection to Kafka is lost. A retry of the block in this situation is required. The block may be [de-duplicated ](../../../engines/table-engines/mergetree-family/replication.md#table_engines-replication)using a distributed table or ReplicatedMergeTree as the target table. While this reduces the chance of duplicate rows, it relies on identical blocks. Events such as a Kafka rebalancing may invalidate this assumption, causing duplicates in rare circumstances.

##### Quorum based Inserts

Users often need [quorum-based inserts](../../../operations/settings/settings.md#settings-insert_quorum) for cases where higher delivery guarantees are required in ClickHouse. This can’t be set on the materialized view or the target table. It can, however, be set for user profiles e.g.

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse to Kafka

Although a rarer use case, ClickHouse data can also be persisted in Kafka. For example, we will insert rows manually into a Kafka table engine. This data will be read by the same Kafka engine, whose materialized view will place the data into a Merge Tree table. Finally, we demonstrate the application of materialized views in inserts to Kafka to read tables from existing source tables.

#### Steps

Our initial objective is best illustrated:

<img src={require('./images/kafka_02.png').default} class="image" alt="Kafka table engine with inserts" style={{width: '80%'}}/>

We assume you have the tables and views created under steps for [Kafka to ClickHouse](#kafka-to-clickhouse) and that the topic has been fully consumed.


##### 1. Inserting rows directly

First, confirm the count of the target table.

```sql
SELECT count() FROM default.github;
```

You should have 200,000 rows:
```response
┌─count()─┐
│  200000 │
└─────────┘
```

Now insert rows from the GitHub target table back into the Kafka table engine github_queue. Note how we utilize JSONEachRow format and LIMIT the select to 100.

```sql
INSERT INTO default.github_queue SELECT * FROM default.github LIMIT 100 FORMAT JSONEachRow
```

Recount the row in GitHub to confirm it has increased by 100. As shown in the above diagram, rows have been inserted into Kafka via the Kafka table engine before being re-read by the same engine and inserted into the GitHub target table by our materialized view!

```sql
SELECT count() FROM default.github;
```

You should see 100 additional rows:
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. Utilizing materialized views

We can utilize materialized views to push messages to a Kafka engine (and a topic) when documents are inserted into a table. When rows are inserted into the GitHub table, a materialized view is triggered, which causes the rows to be inserted back into a Kafka engine and into a new topic. Again this is best illustrated:

<img src={require('./images/kafka_03.png').default} class="image" alt="Kafka table engine inserts with materialized view" style={{width: '80%'}}/>


Create a new Kafka topic `github_out` or equivalent. Ensure a Kafka table engine `github_out_queue` points to this topic.

```sql
CREATE TABLE default.github_out_queue
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
CREATE MATERIALIZED VIEW default.github_out_mv TO default.github_out_queue AS
SELECT file_time, event_type, actor_login, repo_name, created_at, updated_at, action, comment_id, path, ref, ref_type, creator_user_login, number, title, labels, state, assignee, assignees, closed_at, merged_at, merge_commit_sha, requested_reviewers, merged_by, review_comments, member_login FROM default.github FORMAT JsonEachRow;
```

Should you insert into the original github topic, created as part of [Kafka to ClickHouse](#kafka-to-clickhouse), documents will magically appear in the “github_clickhouse” topic. Confirm this with native Kafka tooling. For example, below, we insert 100 rows onto the github topic using [kcat](https://github.com/edenhill/kcat) for a Confluent Cloud hosted topic:

```sql
head -n 10 github_all_columns.ndjson | kafkacat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

A read on the `github_out` topic should confirm delivery of the messages.

```sql
kafkacat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github_out -C -e -q | wc -l
```

Although an elaborate example, this illustrates the power of materialized views when used in conjunction with the Kafka engine.

### Clusters and Performance

#### Working with ClickHouse Clusters

Through Kafka consumer groups, multiple ClickHouse instances can potentially read from the same topic. Each consumer will be assigned to a topic partition in a 1:1 mapping. When scaling ClickHouse consumption using the Kafka table engine, consider that the total number of consumers within a cluster cannot exceed the number of partitions on the topic. Therefore ensure partitioning is appropriately configured for the topic in advance.

Multiple ClickHouse instances can all be configured to read from a topic using the same consumer group id - specified during the Kafka table engine creation. Therefore, each instance will read from one or more partitions, inserting segments to their local target table. The target tables can, in turn, be configured to use a ReplicatedMergeTree to handle duplication of the data. This approach allows Kafka reads to be scaled with the ClickHouse cluster, provided there are sufficient Kafka partitions.

<img src={require('./images/kafka_04.png').default} class="image" alt="Replicated Kafka table engine" style={{width: '80%'}}/>

#### Tuning Performance

Consider the following when looking to increase Kafka Engine table throughput performance:


* The performance will vary depending on the message size, format, and target table types. 100k rows/sec on a single table engine should be considered obtainable. By default, messages are read in blocks, controlled by the parameter kafka_max_block_size. By default, this is set to the [max_block_size](../../../operations/settings/settings.md#setting-max_block_size), defaulting to 65,536. Unless messages are extremely large, this should nearly always be increased. Values between 500k to 1M are not uncommon. Test and evaluate the effect on throughput performance.
* The number of consumers for a table engine can be increased using kafka_num_consumers. However, by default, inserts will be linearized in a single thread unless kafka_thread_per_consumer is changed from the default value of 1. Set this to 1 to ensure flushes are performed in parallel. Note that creating a Kafka engine table with N consumers (and kafka_thread_per_consumer=1) is logically equivalent to creating N Kafka engines, each with a materialized view and kafka_thread_per_consumer=0.
* Increasing consumers is not a free operation. Each consumer maintains its own buffers and threads, increasing the overhead on the server. Be conscious of the overhead of consumers and scale linearly across your cluster first and if possible.
* If the throughput of Kafka messages is variable and delays are acceptable, consider increasing the stream_flush_interval_ms to ensure larger blocks are flushed.
* [background_schedule_pool_size](../../../operations/settings/settings.md#background_message_broker_schedule_pool_size) sets the number of threads performing background tasks. These threads are used for Kafka streaming. This setting is applied at the ClickHouse server start and can’t be changed in a user session, defaulting to 128. It is unlikely you should ever need to change this as sufficient threads are available for the number of Kafka engines you will create on a single host. If you see timeouts in the logs, it may be appropriate to increase this.
* For communication with Kafka, the librdkafka library is used, which itself creates threads. Large numbers of Kafka tables, or consumers, can thus result in large numbers of context switches. Either distribute this load across the cluster, only replicating the target tables if possible, or consider using a table engine to read from multiple topics - a list of values is supported. Multiple materialized views can be read from a single table, each filtering to the data from a specific topic.

Any settings changes should be tested. We recommend monitoring Kafka consumer lags to ensure you are properly scaled.

#### Additional Settings

Aside from the settings discussed above, the following may be of interest:

* [Kafka_max_wait_ms](../../../operations/settings/settings.md#kafka-max-wait-ms) - The wait time in milliseconds for reading messages from Kafka before retry. Set at a user profile level and defaults to 5000.

[All settings ](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)from the underlying librdkafka can also be placed in the ClickHouse configuration files inside a _kafka_ element - setting names should be XML elements with periods replaced with underscores e.g.

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

These are expert settings for which the user is referred to the Kafka documentation.

import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

## Confluent HTTP Sink Connector
The HTTP Sink Connector is data type agnostic and thus does not need a Kafka schema as well as supporting ClickHouse specific data types such as Maps and Arrays. This additional flexibility comes at a slight increase in configuration complexity.

Below we describe a simple installation, pulling messages from a single Kafka topic and inserting rows into a ClickHouse table.

:::note
  The HTTP Connector is distributed under the [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license).
:::


### Quick start steps

#### 1. Gather your connection details
<ConnectionDetails />


#### 2. Run Kafka Connect and the HTTP Sink Connector

You have two options:

* **Self-managed:** Download the Confluent package and install it locally. Follow the installation instructions for installing the connector as documented [here](https://docs.confluent.io/kafka-connect-http/current/overview.html).
If you use the confluent-hub installation method, your local configuration files will be updated.

* **Confluent Cloud:** A fully managed version of HTTP Sink is available for those using Confluent Cloud for their Kafka hosting. This requires your ClickHouse environment to be accessible from Confluent Cloud.

:::note
  The following examples are using Confluent Cloud.
:::

#### 3. Create destination table in ClickHouse

Before the connectivity test, let's start by creating a test table in ClickHouse Cloud, this table will receive the data from Kafka:

```sql
CREATE TABLE default.my_table
(
    `side` String,
    `quantity` Int32,
    `symbol` String,
    `price` Int32,
    `account` String,
    `userid` String
)
ORDER BY tuple()
```

#### 4. Configure HTTP Sink
Create a Kafka topic and an instance of HTTP Sink Connector:
<img src={require('./images/create_http_sink.png').default} class="image" alt="Create HTTP Sink" style={{width: '50%'}}/>

<br />

Configure HTTP Sink Connector:
* Provide the topic name you created
* Authentication
    * `HTTP Url` - ClickHouse Cloud URL with a `INSERT` query specified `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`. **Note**: the query must be encoded.
    * `Endpoint Authentication type` - BASIC
    * `Auth username` - ClickHouse username
    * `Auth password` - ClickHouse password

:::note
  This HTTP Url is error-prone. Ensure escaping is precise to avoid issues.
:::

<img src={require('./images/http_auth.png').default} class="image" alt="Auth options for Confluent HTTP Sink" style={{width: '70%'}}/>
<br/>

* Configuration
    * `Input Kafka record value format`Depends on your source data but in most cases JSON or Avro. We assume `JSON` in the following settings.
    * In `advanced configurations` section:
        * `HTTP Request Method` - Set to POST
        * `Request Body Format` - json
        * `Batch batch size` - Per ClickHouse recommendations, set this to **at least 1000**.
        * `Batch json as array` - true
        * `Retry on HTTP codes` - 400-500 but adapt as required e.g. this may change if you have an HTTP proxy in front of ClickHouse.
        * `Maximum Reties` - the default (10) is appropriate but feel to adjust for more robust retries.

<img src={require('./images/http_advanced.png').default} class="image" alt="Advanced options for Confluent HTTP Sink" style={{width: '50%'}}/>

#### 5. Testing the connectivity
Create an message in a topic configured by your HTTP Sink
<img src={require('./images/create_message_in_topic.png').default} class="image" alt="Create a message in the topic" style={{width: '50%'}}/>

<br/>

and verify the created message's been written to your ClickHouse instance.

### Troubleshooting
#### HTTP Sink doesn't batch messages

From the [Sink documentation](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp):
> The HTTP Sink connector does not batch requests for messages containing Kafka header values that are different.

1. Verify your Kafka records have the same key.
2. When you add parameters to the HTTP API URL, each record can result in a unique URL. For this reason, batching is disabled when using additional URL parameters.

#### 400 Bad Request
##### CANNOT_PARSE_QUOTED_STRING
If HTTP Sink fails with the following message when inserting a JSON object into a `String` column:
```
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

Set `input_format_json_read_objects_as_strings=1` setting in URL as encoded string `SETTINGS%20input_format_json_read_objects_as_strings%3D1`

### Load the GitHub dataset (optional)

Note that this example preserves the Array fields of the Github dataset. We assume you have an empty github topic in the examples and use [kcat](https://github.com/edenhill/kcat) for message insertion to Kafka.

##### 1. Prepare Configuration

Follow [these instructions](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) for setting up Connect relevant to your installation type, noting the differences between a standalone and distributed cluster. If using Confluent Cloud, the distributed setup is relevant.

The most important parameter is the `http.api.url`. The [HTTP interface](../../../interfaces/http.md) for ClickHouse requires you to encode the INSERT statement as a parameter in the URL. This must include the format (`JSONEachRow` in this case) and target database. The format must be consistent with the Kafka data, which will be converted to a string in the HTTP payload. These parameters must be URL escaped. An example of this format for the Github dataset (assuming you are running ClickHouse locally) is shown below:

```
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

The following additional parameters are relevant to using the HTTP Sink with ClickHouse. A complete parameter list can be found [here](https://docs.confluent.io/kafka-connect-http/current/connector_config.html):


* `request.method` - Set to **POST**
* `retry.on.status.codes` - Set to 400-500 to retry on any error codes. Refine based expected errors in data.
* `request.body.format` - In most cases this will be JSON.
* `auth.type` - Set to BASIC if you security with ClickHouse. Other ClickHouse compatible authentication mechanisms are not currently supported.
* `ssl.enabled` - set to true if using SSL.
* `connection.user` - username for ClickHouse.
* `connection.password` - password for ClickHouse.
* `batch.max.size` - The number of rows to send in a single batch. Ensure this set is to an appropriately large number. Per ClickHouse [recommendations](../../../concepts/why-clickhouse-is-so-fast.md#performance-when-inserting-data) a value of 1000 is should be considered a minimum.
* `tasks.max` - The HTTP Sink connector supports running one or more tasks. This can be used to increase performance. Along with batch size this represents your primary means of improving performance.
* `key.converter` - set according to the types of your keys.
* `value.converter` - set based on the type of data on your topic. This data does not need a schema. The format here must be consistent with the FORMAT specified in the parameter `http.api.url`. The simplest here is to use JSON and the org.apache.kafka.connect.json.JsonConverter converter. Treating the value as a string, via the converter org.apache.kafka.connect.storage.StringConverter, is also possible - although this will require the user to extract a value in the insert statement using functions. [Avro format](../../../interfaces/formats.md#data-format-avro) is also supported in ClickHouse if using the io.confluent.connect.avro.AvroConverter converter.

A full list of settings, including how to configure a proxy, retries, and advanced SSL, can be found [here](https://docs.confluent.io/kafka-connect-http/current/connector_config.html).

Example configuration files for the Github sample data can be found [here](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/en/integrations/data-ingestion/kafka/code/connectors/http_sink), assuming Connect is run in standalone mode and Kafka is hosted in Confluent Cloud.

##### 2. Create the ClickHouse table

Ensure the table has been created. An example for a minimal github dataset using a standard MergeTree is shown below.


```sql
CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4,'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
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

##### 3. Add data to Kafka

Insert messages to Kafka. Below we use [kcat](https://github.com/edenhill/kcat) to insert 10k messages.

```bash
head -n 10000 github_all_columns.ndjson | kafkacat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

A simple read on the target table “Github” should confirm the insertion of data.


```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```

## ClickHouse Kafka Connect Sink
:::note
The connector is available in beta stage for early adopters.
If you need any help, please [file an issue in the repository](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) or raise a question in [ClickHouse public Slack](https://clickhouse.com/slack).
:::
**ClickHouse Kafka Connect Sink** is the Kafka connector delivering data from a Kafka topic to a ClickHouse table.

### License
The Kafka Connector Sink is distributed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)

### Requirements for the environment
The [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) framework v2.7 or later should be installed in the environment.

### Version compatibility matrix
| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
| -------------------------------- | ------------------ | ------------- | ------------------ |
| 0.0.7                            | 22.5 or later      | 2.7 or later  | 6.1 or later       |

### Main Features
- Shipped with out-of-the-box exactly-once semantics. It's powered by a new ClickHouse core feature named [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) (used as a state store by the connector) and allows for minimalistic architecture.
- Support for 3rd-party state stores: Currently defaults to In-memory but can use KeeperMap (Redis to be added soon).
- Core integration: Built, maintained, and supported by ClickHouse.
- Tested continuously against [ClickHouse Cloud](https://clickhouse.com/cloud).
- Data inserts with a declared schema and schemaless.
- Support for most major data types of ClickHouse (more to be added soon)

### Installation instructions
The connector is distributed as a single uber JAR file containing all the class files necessary to run the plugin.

To install the plugin, follow these steps:
- Download a zip archive containing the Connector JAR file from the [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) page of ClickHouse Kafka Connect Sink repository.
- Extract the ZIP file content and copy it to the desired location.
- Add a path with the plugin director to [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) configuration in your Connect properties file to allow Confluent Platform to find the plugin.
- Provide a topic name, ClickHouse instance hostname, and password in config.
```yml
connector.class=com.clickhouse.kafka.connect.ClickHouseSinkConnector
tasks.max=1
topics=<topic_name>
ssl=true
security.protocol=SSL
hostname=<hostname>
database=<database_name>
password=<password>
ssl.truststore.location=/tmp/kafka.client.truststore.jks
port=8443
value.converter.schemas.enable=false
value.converter=org.apache.kafka.connect.json.JsonConverter
exactlyOnce=true
username=default
schemas.enable=false
```
- Restart the Confluent Platform.
- If you use Confluent Platform, log into Confluent Control Center UI to verify the ClickHouse Sink is available in the list of available connectors.

### Configuration options
To connect the ClickHouse Sink to the ClickHouse server, you need to provide:
- connection details: hostname (**required**) and port (optional)
- user credentials: password (**required**) and username (optional)

The full table of configuration options:

| Name | Required | Type | Description | Default value |
| ---- | -------- | ---- | ----------- | ------- |
| hostname | **required** | string | The hostname or IP address of the server| N/A |
| port | optional | integer | Port the server listens to | 8443 |
| username | optional | string | The name of the user on whose behalf to connect to the server | default |
| password | **required** | string | Password for the specified user | N/A |
| database | optional | string | The name of the database to write to | default |
| ssl | optional | boolean | Enable TLS for network connections | true |
| exactlyOnce | optional | boolean | Enable exactly-once processing guarantees.<br/>When **true**, stores processing state in KeeperMap.<br/>When **false**, stores processing state in-memory.  | false |
| timeoutSeconds | optional | integer | Connection timeout in seconds. | 30 |
| retryCount | optional | integer | Maximum number of retries for a query. No delay between retries. | 3 |


### Target Tables
ClickHouse Connect Sink reads messages from Kafka topics and writes them to appropriate tables. ClickHouse Connect Sink writes data into existing tables. Please, make sure a target table with an appropriate schema was created in ClickHouse before starting to insert data into it.

Each topic requires a dedicated target table in ClickHouse. The target table name must match the source topic name.

### Pre-processing
If you need to transform outbound messages before they are sent to ClickHouse Kafka Connect
Sink, use [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html).


### Supported Data types
**With a schema declared:**

| Kafka Connect Type | ClickHouse Type          | Supported | Primitive |
| ------------------ | ------------------------ | --------- | --------- |
| STRING             | String                   | ✅        | Yes       |
| INT8               | Int8                     | ✅        | Yes       |
| INT16              | Int16                    | ✅        | Yes       |
| INT32              | Int32                    | ✅        | Yes       |
| INT64              | Int64                    | ✅        | Yes       |
| FLOAT32            | Float32                  | ✅        | Yes       |
| FLOAT64            | Float64                  | ✅        | Yes       |
| BOOLEAN            | Boolean                  | ✅        | Yes       |
| ARRAY              | Array(Primitive)         | ✅        | No        |
| MAP                | Map(Primitive, Primitive)| ✅        | No        |
| STRUCT             | N/A                      | ❌        | No        |
| BYTES              | N/A                      | ❌        | No        |

**Without a schema declared:**

A record is converted into JSON and sent to ClickHouse as a value in [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow) format.


### Logging
Logging is automatically provided by Kafka Connect Platform.
The logging destination and format might be configured via Kafka connect [configuration file](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file).

If using the Confluent Platform, the logs can be seen by running a CLI command:

```bash
confluent local services connect log
```

For additional details check out the official [tutorial](https://docs.confluent.io/platform/current/connect/logging.html).

### Monitoring

ClickHouse Kafka Connect reports runtime metrics via [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html). JMX is enabled in Kafka Connector by default.

ClickHouse Connect MBeanName:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect reports the following metrics:

| Name                 | Type | Description              |
| -------------------- | ---- | ------------------------ |
| receivedRecords      | long | The total number of records received. |
| recordProcessingTime | long | Total time in nanoseconds spent grouping and converting records to a unified structure. |
| taskProcessingTime   | long | Total time in nanoseconds spent processing and inserting data into ClickHouse. |

### Limitations
- Deletes are not supported.
- Batch size is inherited from the Kafka Consumer properties.
- When using KeeperMap for exactly-once and the offset is changed or rewound, you need to delete the content from KeeperMap for that specific topic.


## JDBC Connector

:::note
This connector should only be used if your data is simple and consists of primitive data types e.g., int. ClickHouse specific types such as maps are not supported.
:::

For our examples, we utilize the Confluent distribution of Kafka Connect.

Below we describe a simple installation, pulling messages from a single Kafka topic and inserting rows into a ClickHouse table. We recommend Confluent Cloud, which offers a generous free tier for those who do not have a Kafka environment. Either adapt the following examples to your own dataset or utilize the [sample data and insertion script](./code/producer/README.md).

Note that a schema is required for the JDBC Connector (You cannot use plain JSON or CSV with the JDBC connector). Whilst the schema can be encoded in each message; it is [strongly advised to use the Confluent schema registr](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)y to avoid the associated overhead. The insertion script provided automatically infers a schema from the messages and inserts this to the registry - this script can thus be reused for other datasets. Kafka's keys are assumed to be Strings. Further details on Kafka schemas can be found [here](https://docs.confluent.io/platform/current/schema-registry/index.html).

### License
The JDBC Connector is distributed under the [Confluent Community License](https://www.confluent.io/confluent-community-license)

### Steps
#### 1. Install Kafka Connect and Connector


We assume you have downloaded the Confluent package and installed it locally. Follow the installation instructions for installing the connector as documented [here](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector).

If you use the confluent-hub installation method, your local configuration files will be updated.

For sending data to ClickHouse from Kafka, we use the Sink component of the connector.


#### 2. Download and install the JDBC Driver

Download and install the ClickHouse JDBC driver `clickhouse-jdbc-<version>-shaded.jar` from [here](https://github.com/ClickHouse/clickhouse-java/releases). Install this into Kafka Connect following the details [here](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers). Other drivers may work but have not been tested.

:::note

Common Issue: the docs suggest copying the jar to `share/java/kafka-connect-jdbc/`. If you experience issues with Connect finding the driver, copy the driver to `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`. Or modify `plugin.path` to include the driver - see below.

:::

#### 3. Prepare Configuration

Follow [these instructions](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) for setting up a Connect relevant to your installation type, noting the differences between a standalone and distributed cluster. If using Confluent Cloud the distributed setup is relevant.

The following parameters are relevant to using the JDBC connector with ClickHouse. A full parameter list can be found [here](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html):


* `_connection.url_` - this should take the form of `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>`
* `connection.user` - a user with write access to the target database
* `table.name.format`- ClickHouse table to insert data. This must exist.
* `batch.size` - The number of rows to send in a single batch. Ensure this set is to an appropriately large number. Per ClickHouse [recommendations](../../../concepts/why-clickhouse-is-so-fast.md#performance-when-inserting-data) a value of 1000 should be considered a minimum.
* `tasks.max` - The JDBC Sink connector supports running one or more tasks. This can be used to increase performance. Along with batch size this represents your primary means of improving performance.
* `value.converter.schemas.enable` - Set to false if using a schema registry, true if you embed your schemas in the messages.
* `value.converter` - Set according to your datatype e.g. for JSON,  “io.confluent.connect.json.JsonSchemaConverter”.
* `key.converter` - Set to “org.apache.kafka.connect.storage.StringConverter”. We utilise String keys.
* `pk.mode` - Not relevant to ClickHouse. Set to none.
* `auto.create` - Not supported and must be false.
* `auto.evolve` - We recommend false for this setting although it may be supported in the future.
* `insert.mode` - Set to “insert”. Other modes are not currently supported.
* `key.converter` - Set according to the types of your keys.
* `value.converter` - Set based on the type of data on your topic. This data must have a supported schema - JSON, Avro or Protobuf formats.

If using our sample dataset for testing, ensure the following are set:

* `value.converter.schemas.enable` - Set to false as we utilize a schema registry. Set to true if you are embedding the schema in each message.
* `key.converter` - Set to “org.apache.kafka.connect.storage.StringConverter”. We utilise String keys.
* `value.converter` - Set “io.confluent.connect.json.JsonSchemaConverter”.
* `value.converter.schema.registry.url` - Set to the schema server url along with the credentials for the schema server via the parameter `value.converter.schema.registry.basic.auth.user.info`.

Example configuration files for the Github sample data can be found [here](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink), assuming Connect is run in standalone mode and Kafka is hosted in Confluent Cloud.


#### 4. Create the ClickHouse table

Ensure the table has been created, dropping it if it already exists from previous examples. An example compatible with the reduced Github dataset is shown below. Not the absence of any Array or Map types that are not currently not supported:

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
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at)
```

#### 5. Start Kafka Connect


Start Kafka Connect in either [standalone](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) or [distributed](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster) mode. For standalone mode, using the [sample configurations](./code/connectors/README.md), this is as simple as:

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Add data to Kafka


Insert messages to Kafka using the [script and config](./code/producer/README.md) provided. You will need to modify github.config to include your Kafka credentials. The script is currently configured for use with Confluent Cloud.

```bash
python producer.py -c github.config
```

This script can be used to insert any ndjson file into a Kafka topic. This will attempt to infer a schema for you automatically. The sample config provided will only insert 10k messages - modify [here](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/en/integrations/data-ingestion/kafka/code/producer/github.config#L25) if required. This configuration also removes any incompatible Array fields from the dataset during insertion to Kafka.

This is required for the JDBC connector to convert messages to INSERT statements. If you are using your own data, ensure you either insert a schema with every message (setting _value.converter.schemas.enable _to true) or ensure your client publishes messages referencing a schema to the registry.

Kafka Connect should begin consuming messages and inserting rows into ClickHouse. Note that warnings regards “[JDBC Compliant Mode] Transaction is not supported.” are expected and can be ignored.

A simple read on the target table “Github” should confirm data insertion.


```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### Recommended Further Reading

* [Kafka Sink Configuration Parameters](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connect Deep Dive – JDBC Source Connector](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC Sink deep-dive: Working with Primary Keys](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect in Action: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - for those who prefer to watch over read.
* [Kafka Connect Deep Dive – Converters and Serialization Explained](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)


## Using Vector with Kafka and ClickHouse

 Vector is a vendor-agnostic data pipeline with the ability to read from Kafka and send events to ClickHouse.

A [getting started](../../../integrations/data-ingestion/etl-tools/vector-to-clickhouse.md) guide for Vector with ClickHouse focuses on the log use case and reading events from a file. We utilize the [Github sample dataset](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) with events held on a Kafka topic.

Vector utilizes [sources](https://vector.dev/docs/about/concepts/#sources) for retrieving data through a push or pull model. [Sinks](https://vector.dev/docs/about/concepts/#sinks) meanwhile provide a destination for events. We, therefore, utilize the Kafka source and ClickHouse sink. Note that whilst Kafka is supported as a Sink, a ClickHouse source is not available. Vector is as a result not appropriate for users wishing to transfer data to Kafka from ClickHouse.

Vector also supports the [transformation](https://vector.dev/docs/reference/configuration/transforms/) of data. This is beyond the scope of this guide. The user is referred to the Vector documentation should they need this on their dataset.

Note that the current implementation of the ClickHouse sink utilizes the HTTP interface. The ClickHouse sink does not support the use of a JSON schema at this time. Data must be published to Kafka in either plain JSON format or as Strings.

### License
Vector is distributed under the [MPL-2.0 License](https://github.com/vectordotdev/vector/blob/master/LICENSE)


### Steps

1. Create the Kafka `github` topic and insert the [Github dataset](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson).


```bash
cat /opt/data/github/github_all_columns.ndjson | kafkacat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

This dataset consists of 200,000 rows focused on the `ClickHouse/ClickHouse` repository.

2. Ensure the target table is created. Below we use the default database.

```sql

CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4,
                    'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
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
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at);

```

3. [Download and install Vector](https://vector.dev/docs/setup/quickstart/). Create a `kafka.toml` configuration file and modify the values for your Kafka and ClickHouse instances.

```toml
[sources.github]
type = "kafka"
auto_offset_reset = "smallest"
bootstrap_servers = "<kafka_host>:<kafka_port>"
group_id = "vector"
topics = [ "github" ]
tls.enabled = true
sasl.enabled = true
sasl.mechanism = "PLAIN"
sasl.username = "<username>"
sasl.password = "<password>"
decoding.codec = "json"

[sinks.clickhouse]
type = "clickhouse"
inputs = ["github"]
endpoint = "http://localhost:8123"
database = "default"
table = "github"
skip_unknown_fields = true
auth.strategy = "basic"
auth.user = "username"
auth.password = "password"
buffer.max_events = 10000
batch.timeout_secs = 1
```

A few important notes on this configuration and behavior of Vector:

- This example has been tested against Confluent Cloud. Therefore, the `sasl.*` and `ssl.enabled` security options may not be appropriate in self-managed cases.
- A protocol prefix is not required for the configuration parameter `bootstrap_servers` e.g. `pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- The source parameter `decoding.codec = "json"` ensures the message is passed to the ClickHouse sink as a single JSON object. If handling messages as Strings and using the default `bytes` value, the contents of the message will be appended to a field `message`. In most cases this will require processing in ClickHouse as described in the [Vector getting started](../../../integrations/data-ingestion/etl-tools/vector-to-clickhouse.md/#4-parse-the-logs) guide.
- Vector [adds a number of fields](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data) to the messages. In our example, we ignore these fields in the ClickHouse sink via the configuration parameter `skip_unknown_fields = true`. This ignores fields that are not part of the target table schema. Feel free to adjust your schema to ensure these meta fields such as `offset` are added.
- Notice how the sink references of the source of events via the parameter `inputs`.
- Note the behavior of the ClickHouse sink as described [here](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches). For optimal throughput, users may wish to tune the `buffer.max_events`, `batch.timeout_secs` and `batch.max_bytes` parameters. Per ClickHouse [recommendations](../../../concepts/why-clickhouse-is-so-fast.md#performance-when-inserting-data) a value of 1000 is should be considered a minimum for the number of events in any single batch. For uniform high throughput use cases, users may increase the parameter `buffer.max_events`. More variable throughputs may require changes in the parameter `batch.timeout_secs`
- The parameter `auto_offset_reset = "smallest"` forces the Kafka source to start from the start of the topic - thus ensuring we consume the messages published in step (1). Users may require different behavior. See [here](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset) for further details.

4. Start Vector

```bash
vector --config ./kafka.toml
```

By default, a [health check](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck) is required before insertions begin to ClickHouse. This ensures connectivity can be established and the schema read. Prepending `VECTOR_LOG=debug` can be helpful to obtain further logging should you encounter issues.

5. Confirm the insertion of the data.

```sql
SELECT count() as count FROM github;
```

| count |
| :--- |
| 200000 |
