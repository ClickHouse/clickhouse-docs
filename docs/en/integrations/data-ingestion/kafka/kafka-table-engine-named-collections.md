---
title: Integrating ClickHouse with Kafka using Named Collections
description: How to use named collections to connect clickhouse to kafka
keywords: [named collection, how to, kafka]
---

# Integrating ClickHouse with Kafka using Named Collections

## Introduction

In this guide, we will explore how to connect ClickHouse to Kafka using named collections. Using the configuration file for named collections offers several advantages:
- Centralized and easier management of configuration settings.
- Changes to settings can be made without altering SQL table definitions.
- Easier review and troubleshooting of configurations by inspecting a single configuration file.

This guide has been tested on Apache Kafka 3.4.1 and ClickHouse 24.5.1.

## Assumptions

This document assumes you have:
1. A working Kafka cluster.
2. A ClickHouse cluster set up and running.
3. Basic knowledge of SQL and familiarity with ClickHouse and Kafka configurations.

## Prerequisites

Ensure the user creating the named collection has the necessary access permissions:

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

Refer to the [User Management Guide](./../../../guides/sre/user-management/index.md) for more details on enabling access control.

## Configuration

Add the following section to your ClickHouse `config.xml` file:

```xml
<!-- Named collections for Kafka integration -->
<named_collections>
    <cluster_1>
        <!-- ClickHouse Kafka engine parameters -->
        <kafka_broker_list>c1-kafka-1:9094,c1-kafka-2:9094,c1-kafka-3:9094</kafka_broker_list>
        <kafka_topic_list>cluster_1_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_1_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka extended configuration -->
        <kafka>
            <security_protocol>SASL_SSL</security_protocol>
            <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
            <sasl_mechanism>PLAIN</sasl_mechanism>
            <sasl_username>kafka-client</sasl_username>
            <sasl_password>kafkapassword1</sasl_password>
            <debug>all</debug>
            <auto_offset_reset>latest</auto_offset_reset>
        </kafka>
    </cluster_1>

    <cluster_2>
        <!-- ClickHouse Kafka engine parameters -->
        <kafka_broker_list>c2-kafka-1:29094,c2-kafka-2:29094,c2-kafka-3:29094</kafka_broker_list>
        <kafka_topic_list>cluster_2_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_2_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka extended configuration -->
        <kafka>
            <security_protocol>SASL_SSL</security_protocol>
            <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
            <sasl_mechanism>PLAIN</sasl_mechanism>
            <sasl_username>kafka-client</sasl_username>
            <sasl_password>kafkapassword2</sasl_password>
            <debug>all</debug>
            <auto_offset_reset>latest</auto_offset_reset>
        </kafka>
    </cluster_2>
</named_collections>
```

### Configuration Notes

1. Adjust Kafka addresses and related configurations to match your Kafka cluster setup.
2. The section before `<kafka>` contains ClickHouse Kafka engine parameters. For a full list of parameters, refer to the [Kafka engine parameters ](https://clickhouse.com/docs/en/engines/table-engines/integrations/kafka).
3. The section within `<kafka>` contains extended Kafka configuration options. For more options, refer to the [librdkafka configuration](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md).
4. This example uses the `SASL_SSL` security protocol and `PLAIN` mechanism. Adjust these settings based on your Kafka cluster configuration.

## Creating Tables and Databases

Create the necessary databases and tables on your ClickHouse cluster. If you run ClickHouse as a single node, omit the cluster part of the SQL command and use any other engine instead of `ReplicatedMergeTree`.

### Create the Database

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### Create Kafka Tables

Create the first Kafka table for the first Kafka cluster:

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

Create the second Kafka table for the second Kafka cluster:

```sql
CREATE TABLE kafka_testing.second_kafka_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_2);
```

### Create Replicated Tables

Create a table for the first Kafka table:

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

Create a table for the second Kafka table:

```sql
CREATE TABLE kafka_testing.second_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

### Create Materialized Views

Create a materialized view to insert data from the first Kafka table into the first replicated table:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

Create a materialized view to insert data from the second Kafka table into the second replicated table:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```

## Verifying the Setup

You should now see the relative consumer groups on your Kafka clusters:
- `cluster_1_clickhouse_consumer` on `cluster_1`
- `cluster_2_clickhouse_consumer` on `cluster_2`

Run the following queries on any of your ClickHouse nodes to see the data in both tables:

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### Note

In this guide, the data ingested in both Kafka topics is the same. In your case, they would differ. You can add as many Kafka clusters as you want.

Example output:

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

This completes the setup for integrating ClickHouse with Kafka using named collections. By centralizing Kafka configurations in the ClickHouse `config.xml` file, you can manage and adjust settings more easily, ensuring a streamlined and efficient integration.
