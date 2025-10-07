---
'title': '将ClickHouse与Kafka集成使用命名集合'
'description': '如何使用命名集合将clickhouse连接到kafka'
'keywords':
- 'named collection'
- 'how to'
- 'kafka'
'slug': '/integrations/data-ingestion/kafka/kafka-table-engine-named-collections'
'doc_type': 'guide'
---


# 将 ClickHouse 与 Kafka 通过命名集合集成

## 引言 {#introduction}

在本指南中，我们将探讨如何通过命名集合将 ClickHouse 连接到 Kafka。使用命名集合的配置文件提供了几个优势：
- 对配置设置的集中和更轻松的管理。
- 可以在不更改 SQL 表定义的情况下更改设置。
- 通过检查单一配置文件，更容易审查和故障排除配置。

本指南已在 Apache Kafka 3.4.1 和 ClickHouse 24.5.1 上测试。

## 假设 {#assumptions}

本文档假设您拥有：
1. 一个正在运行的 Kafka 集群。
2. 一个设置并运行中的 ClickHouse 集群。
3. 基本的 SQL 知识，并对 ClickHouse 和 Kafka 配置有一定的了解。

## 先决条件 {#prerequisites}

确保创建命名集合的用户拥有必要的访问权限：

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

有关启用访问控制的更多详细信息，请参考 [用户管理指南](./../../../guides/sre/user-management/index.md)。

## 配置 {#configuration}

在您的 ClickHouse `config.xml` 文件中添加以下部分：

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

### 配置说明 {#configuration-notes}

1. 调整 Kafka 地址和相关配置以匹配您的 Kafka 集群设置。
2. `<kafka>` 之前的部分包含 ClickHouse Kafka 引擎参数。有关参数的完整列表，请参考 [Kafka 引擎参数](/engines/table-engines/integrations/kafka)。
3. `<kafka>` 中的部分包含扩展的 Kafka 配置选项。有关更多选项，请参考 [librdkafka 配置](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)。
4. 此示例使用 `SASL_SSL` 安全协议和 `PLAIN` 机制。根据您的 Kafka 集群配置调整这些设置。

## 创建表和数据库 {#creating-tables-and-databases}

在您的 ClickHouse 集群上创建必要的数据库和表。如果您将 ClickHouse 作为单节点运行，请省略 SQL 命令的集群部分，并使用其他引擎而不是 `ReplicatedMergeTree`。

### 创建数据库 {#create-the-database}

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### 创建 Kafka 表 {#create-kafka-tables}

为第一个 Kafka 集群创建第一个 Kafka 表：

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

为第二个 Kafka 集群创建第二个 Kafka 表：

```sql
CREATE TABLE kafka_testing.second_kafka_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_2);
```

### 创建副本表 {#create-replicated-tables}

为第一个 Kafka 表创建一个表：

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

为第二个 Kafka 表创建一个表：

```sql
CREATE TABLE kafka_testing.second_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

### 创建物化视图 {#create-materialized-views}

创建一个物化视图，将数据从第一个 Kafka 表插入到第一个副本表：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

创建一个物化视图，将数据从第二个 Kafka 表插入到第二个副本表：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```

## 验证设置 {#verifying-the-setup}

您现在应该可以在 Kafka 集群上看到相应的消费者组：
- `cluster_1_clickhouse_consumer` 在 `cluster_1`
- `cluster_2_clickhouse_consumer` 在 `cluster_2`

在您的任何 ClickHouse 节点上运行以下查询，以查看两个表中的数据：

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### 注意 {#note}

在本指南中，两个 Kafka 主题中摄取的数据是相同的。在您的情况下，它们会有所不同。您可以添加尽可能多的 Kafka 集群。

示例输出：

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

这完成了通过命名集合将 ClickHouse 与 Kafka 集成的设置。通过将 Kafka 配置集中在 ClickHouse `config.xml` 文件中，您可以更轻松地管理和调整设置，确保集成的流线性和高效性。
