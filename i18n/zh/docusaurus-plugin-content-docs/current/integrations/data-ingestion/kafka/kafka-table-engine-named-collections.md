---
title: '使用命名集合将 ClickHouse 与 Kafka 集成'
description: '如何使用命名集合将 ClickHouse 连接到 Kafka'
keywords: ['named collection', 'how to', 'kafka']
slug: /integrations/data-ingestion/kafka/kafka-table-engine-named-collections
doc_type: 'guide'
---



# 使用命名集合集成 ClickHouse 与 Kafka



## 简介 {#introduction}

在本指南中,我们将介绍如何使用命名集合将 ClickHouse 连接到 Kafka。使用配置文件管理命名集合具有以下优势:

- 集中化管理配置设置,更加便捷。
- 无需修改 SQL 表定义即可更改设置。
- 通过检查单个配置文件即可轻松审查和排查配置问题。

本指南已在 Apache Kafka 3.4.1 和 ClickHouse 24.5.1 上测试验证。


## 前提条件 {#assumptions}

本文档假设您已具备以下条件:

1. 一个正常运行的 Kafka 集群。
2. 一个已配置并正在运行的 ClickHouse 集群。
3. SQL 基础知识以及对 ClickHouse 和 Kafka 配置的了解。


## 前提条件 {#prerequisites}

确保创建命名集合的用户具有必要的访问权限:

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

有关启用访问控制的更多详细信息,请参阅[用户管理指南](./../../../guides/sre/user-management/index.md)。


## 配置 {#configuration}

将以下配置添加到 ClickHouse 的 `config.xml` 文件中:

```xml
<!-- 用于 Kafka 集成的命名集合 -->
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

### 配置说明 {#configuration-notes}

1. 根据您的 Kafka 集群设置调整 Kafka 地址和相关配置。
2. `<kafka>` 标签之前的部分包含 ClickHouse Kafka 引擎参数。完整的参数列表请参阅 [Kafka 引擎参数](/engines/table-engines/integrations/kafka)。
3. `<kafka>` 标签内的部分包含 Kafka 扩展配置选项。更多选项请参阅 [librdkafka 配置](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)。
4. 本示例使用 `SASL_SSL` 安全协议和 `PLAIN` 认证机制。请根据您的 Kafka 集群配置调整这些设置。


## 创建表和数据库 {#creating-tables-and-databases}

在 ClickHouse 集群上创建所需的数据库和表。如果以单节点模式运行 ClickHouse,请省略 SQL 命令中的集群部分,并使用其他引擎替代 `ReplicatedMergeTree`。

### 创建数据库 {#create-the-database}

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### 创建 Kafka 表 {#create-kafka-tables}

为第一个 Kafka 集群创建第一个 Kafka 表:

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

为第二个 Kafka 集群创建第二个 Kafka 表:

```sql
CREATE TABLE kafka_testing.second_kafka_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_2);
```

### 创建复制表 {#create-replicated-tables}

为第一个 Kafka 表创建复制表:

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

为第二个 Kafka 表创建复制表:

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

创建物化视图,将第一个 Kafka 表的数据插入到第一个复制表:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

创建物化视图,将第二个 Kafka 表的数据插入到第二个复制表:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT
    id,
    first_name,
    last_name
FROM second_kafka_table;
```


## 验证设置 {#verifying-the-setup}

现在您应该能在 Kafka 集群上看到相应的消费者组:

- `cluster_1` 上的 `cluster_1_clickhouse_consumer`
- `cluster_2` 上的 `cluster_2_clickhouse_consumer`

在任意 ClickHouse 节点上运行以下查询以查看两个表中的数据:

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### 注意 {#note}

在本指南中,两个 Kafka 主题摄取的数据是相同的。在您的实际场景中,它们会有所不同。您可以根据需要添加任意数量的 Kafka 集群。

示例输出:

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

至此,使用命名集合将 ClickHouse 与 Kafka 集成的设置已完成。通过在 ClickHouse 的 `config.xml` 文件中集中管理 Kafka 配置,您可以更轻松地管理和调整设置,从而确保实现流畅高效的集成。
