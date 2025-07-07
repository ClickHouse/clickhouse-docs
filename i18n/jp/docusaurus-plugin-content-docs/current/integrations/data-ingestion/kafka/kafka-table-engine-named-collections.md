---
'title': 'Integrating ClickHouse with Kafka using Named Collections'
'description': 'How to use named collections to connect clickhouse to kafka'
'keywords':
- 'named collection'
- 'how to'
- 'kafka'
'slug': '/integrations/data-ingestion/kafka/kafka-table-engine-named-collections'
---





# Integrating ClickHouse with Kafka using Named Collections

## Introduction {#introduction}

このガイドでは、名前付きコレクションを使用してClickHouseをKafkaに接続する方法を探ります。名前付きコレクションの設定ファイルを使用することにはいくつかの利点があります：
- 設定の中央管理と簡易化。
- SQLテーブル定義を変更することなく設定の変更が可能。
- 単一の設定ファイルを検査することで、設定の確認や問題解決が容易に。

このガイドは、Apache Kafka 3.4.1およびClickHouse 24.5.1でテストされました。

## Assumptions {#assumptions}

このドキュメントは、次のことを前提としています：
1. 動作中のKafkaクラスタ。
2. セットアップされ、稼働中のClickHouseクラスタ。
3. SQLの基礎知識と、ClickHouseおよびKafkaの設定に精通していること。

## Prerequisites {#prerequisites}

名前付きコレクションを作成するユーザーが必要なアクセス権を持っていることを確認してください：

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

アクセス制御を有効にする詳細については、[ユーザー管理ガイド](./../../../guides/sre/user-management/index.md)を参照してください。

## Configuration {#configuration}

ClickHouseの `config.xml` ファイルに次のセクションを追加します：

```xml
<!-- Kafka統合のための名前付きコレクション -->
<named_collections>
    <cluster_1>
        <!-- ClickHouse Kafkaエンジンのパラメーター -->
        <kafka_broker_list>c1-kafka-1:9094,c1-kafka-2:9094,c1-kafka-3:9094</kafka_broker_list>
        <kafka_topic_list>cluster_1_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_1_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka拡張設定 -->
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
        <!-- ClickHouse Kafkaエンジンのパラメーター -->
        <kafka_broker_list>c2-kafka-1:29094,c2-kafka-2:29094,c2-kafka-3:29094</kafka_broker_list>
        <kafka_topic_list>cluster_2_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_2_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka拡張設定 -->
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

### Configuration Notes {#configuration-notes}

1. Kafkaのアドレスおよび関連する設定を、あなたのKafkaクラスタのセットアップに合わせて調整してください。
2. `<kafka>`の前のセクションにはClickHouse Kafkaエンジンのパラメーターが含まれています。パラメーターの完全なリストについては、[Kafkaエンジンのパラメーター](/engines/table-engines/integrations/kafka)を参照してください。
3. `<kafka>`内のセクションには拡張Kafka設定オプションが含まれています。詳細なオプションについては、[librdkafkaの設定](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)を参照してください。
4. この例では `SASL_SSL` セキュリティプロトコルと `PLAIN` メカニズムを使用しています。これらの設定は、あなたのKafkaクラスタの構成に基づいて調整してください。

## Creating Tables and Databases {#creating-tables-and-databases}

ClickHouseクラスタ上で必要なデータベースとテーブルを作成します。ClickHouseを単一ノードとして実行している場合は、SQLコマンドのクラスター部分を省略し、`ReplicatedMergeTree`の代わりに他のエンジンを使用します。

### Create the Database {#create-the-database}

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### Create Kafka Tables {#create-kafka-tables}

最初のKafkaクラスタ用の最初のKafkaテーブルを作成します：

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

2つ目のKafkaクラスタ用の2つ目のKafkaテーブルを作成します：

```sql
CREATE TABLE kafka_testing.second_kafka_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_2);
```

### Create Replicated Tables {#create-replicated-tables}

最初のKafkaテーブル用のテーブルを作成します：

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

2つ目のKafkaテーブル用のテーブルを作成します：

```sql
CREATE TABLE kafka_testing.second_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

### Create Materialized Views {#create-materialized-views}

最初のKafkaテーブルから最初の複製テーブルにデータを挿入するためのマテリアライズドビューを作成します：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

2つ目のKafkaテーブルから2つ目の複製テーブルにデータを挿入するためのマテリアライズドビューを作成します：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```

## Verifying the Setup {#verifying-the-setup}

Kafkaクラスタ上に関連する消費者グループが見えるはずです：
- `cluster_1_clickhouse_consumer` on `cluster_1`
- `cluster_2_clickhouse_consumer` on `cluster_2`

どのClickHouseノードでも次のクエリを実行して、両方のテーブルのデータを確認します：

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### Note {#note}

このガイドでは、両方のKafkaトピックに取り込まれたデータは同じです。実際には、異なる場合があります。必要に応じて、任意の数のKafkaクラスタを追加できます。

例の出力：

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

これで、名前付きコレクションを使用してClickHouseとKafkaを統合する設定が完了しました。ClickHouseの `config.xml` ファイルにKafka設定を集中させることで、設定の管理と調整が容易になり、効率的な統合を保証します。
