
# 将 ClickHouse 与 Kafka 集成使用命名集合

## 引言 {#introduction}

在本指南中，我们将探讨如何使用命名集合将 ClickHouse 连接到 Kafka。使用命名集合的配置文件提供了几个优点：
- 集中和更容易管理配置设置。
- 可以在不更改 SQL 表定义的情况下修改设置。
- 通过检查单个配置文件，可以更容易地审查和故障排除配置。

本指南已在 Apache Kafka 3.4.1 和 ClickHouse 24.5.1 上进行测试。

## 假设条件 {#assumptions}

本文档假设您拥有：
1. 一个正在运行的 Kafka 集群。
2. 一个已安装并运行的 ClickHouse 集群。
3. 对 SQL 的基本知识并熟悉 ClickHouse 和 Kafka 配置。

## 先决条件 {#prerequisites}

确保创建命名集合的用户具有必要的访问权限：

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

有关启用访问控制的更多详细信息，请参阅 [用户管理指南](./../../../guides/sre/user-management/index.md)。

## 配置 {#configuration}

将以下部分添加到您的 ClickHouse `config.xml` 文件中：

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
2. `<kafka>` 之前的部分包含 ClickHouse Kafka 引擎参数。有关参数的完整列表，请参阅 [Kafka 引擎参数](/engines/table-engines/integrations/kafka)。
3. `<kafka>` 内的部分包含扩展的 Kafka 配置选项。有关更多选项，请参阅 [librdkafka 配置](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)。
4. 本示例使用 `SASL_SSL` 安全协议和 `PLAIN` 机制。根据您的 Kafka 集群配置调整这些设置。

## 创建表和数据库 {#creating-tables-and-databases}

在您的 ClickHouse 集群上创建必要的数据库和表。如果您将 ClickHouse 作为单节点运行，请省略 SQL 命令中的集群部分，并使用其他引擎替代 `ReplicatedMergeTree`。

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

### 创建复制表 {#create-replicated-tables}

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

创建一个物化视图，将数据从第一个 Kafka 表插入到第一个复制表中：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

创建一个物化视图，将数据从第二个 Kafka 表插入到第二个复制表中：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```

## 验证设置 {#verifying-the-setup}

您现在应该在您的 Kafka 集群中看到相关的消费者组：
- 在 `cluster_1` 上的 `cluster_1_clickhouse_consumer`
- 在 `cluster_2` 上的 `cluster_2_clickhouse_consumer`

在任何 ClickHouse 节点上运行以下查询，以查看两个表中的数据：

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### 注意 {#note}

在本指南中，摄取到两个 Kafka 主题的数据是相同的。在您的情况下，它们会有所不同。您可以根据需要添加任意数量的 Kafka 集群。

示例输出：

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

这完成了使用命名集合将 ClickHouse 与 Kafka 集成的设置。通过将 Kafka 配置集中在 ClickHouse `config.xml` 文件中，您可以更轻松地管理和调整设置，从而确保集成的流畅和高效。
