---
title: '使用命名集合将 ClickHouse 与 Kafka 集成'
description: '如何使用命名集合将 ClickHouse 连接到 Kafka'
keywords: ['named collection', 'how to', 'kafka']
slug: /integrations/data-ingestion/kafka/kafka-table-engine-named-collections
doc_type: 'guide'
---



# 通过命名集合集成 ClickHouse 与 Kafka



## 介绍 {#introduction}

在本指南中，我们将介绍如何使用命名集合将 ClickHouse 连接到 Kafka。使用命名集合的配置文件具有以下优势：
- 集中化、简化的配置管理。
- 可以在不更改 SQL 表定义的情况下修改配置。
- 只需检查单个配置文件即可更方便地审查和排查配置问题。

本指南已在 Apache Kafka 3.4.1 和 ClickHouse 24.5.1 上完成测试。



## 前提假设 {#assumptions}

本文档假定已具备：
1. 一个可正常运行的 Kafka 集群。
2. 一个已部署并正在运行的 ClickHouse 集群。
3. 具备 SQL 基础，并熟悉 ClickHouse 和 Kafka 的基本配置。



## 先决条件

确保负责创建该具名集合的用户具备必要的访问权限：

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

有关如何启用访问控制的更多详情，请参阅[用户管理指南](./../../../guides/sre/user-management/index.md)。


## 配置

在 ClickHouse 的 `config.xml` 文件中添加以下配置段：

```xml
<!-- Kafka 集成的命名集合 -->
<named_collections>
    <cluster_1>
        <!-- ClickHouse Kafka 引擎参数 -->
        <kafka_broker_list>c1-kafka-1:9094,c1-kafka-2:9094,c1-kafka-3:9094</kafka_broker_list>
        <kafka_topic_list>cluster_1_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_1_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka 扩展配置 -->
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
        <!-- ClickHouse Kafka 引擎参数 -->
        <kafka_broker_list>c2-kafka-1:29094,c2-kafka-2:29094,c2-kafka-3:29094</kafka_broker_list>
        <kafka_topic_list>cluster_2_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_2_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka 扩展配置 -->
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

### 配置说明

1. 调整 Kafka 地址和相关配置，使其与 Kafka 集群设置保持一致。
2. `<kafka>` 之前的部分包含 ClickHouse Kafka 引擎参数。完整参数列表请参阅 [Kafka 引擎参数](/engines/table-engines/integrations/kafka)。
3. `<kafka>` 内的部分包含额外的 Kafka 配置选项。更多可用选项请参阅 [librdkafka 配置说明](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)。
4. 本示例使用 `SASL_SSL` 安全协议和 `PLAIN` 机制。请根据实际的 Kafka 集群配置调整这些设置。


## 创建表和数据库

在你的 ClickHouse 集群上创建所需的数据库和表。如果你以单节点方式运行 ClickHouse，请省略 SQL 命令中的集群（cluster）部分，并使用除 `ReplicatedMergeTree` 之外的其他任意引擎。

### 创建数据库

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### 创建 Kafka 表

在第一个 Kafka 集群中创建第一张 Kafka 表：

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

为第二个 Kafka 集群创建第二张 Kafka 表：

```sql
CREATE TABLE kafka_testing.second_kafka_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_2);
```

### 创建复制表

先为第一个 Kafka 表创建一张表：

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

为第二个 Kafka 表创建表：

```sql
CREATE TABLE kafka_testing.second_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

### 创建物化视图

创建一个物化视图，将数据从第一个 Kafka 表插入到第一个复制表中：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

创建物化视图，将第二张 Kafka 表中的数据插入到第二张副本表中：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```


## 验证设置

现在你应该可以在 Kafka 集群上看到相应的 consumer group（消费者组）：

* `cluster_1_clickhouse_consumer` 位于 `cluster_1`
* `cluster_2_clickhouse_consumer` 位于 `cluster_2`

在任意一个 ClickHouse 节点上运行以下查询，以查看两个表中的数据：

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### 注意

在本指南中，摄取到两个 Kafka 主题中的数据是相同的。在您的实际环境中，它们会有所不同。您可以根据需要添加任意数量的 Kafka 集群。

示例输出：

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

至此，使用命名集合完成 ClickHouse 与 Kafka 集成的配置。通过在 ClickHouse 的 `config.xml` 文件中集中管理 Kafka 配置，您可以更轻松地管理和调整相关设置，从而确保集成更加简洁高效。
