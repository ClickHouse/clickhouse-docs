---
title: 'Named Collections を使用して ClickHouse と Kafka を統合する'
description: 'Named Collections を使用して ClickHouse を Kafka に接続する方法'
keywords: ['named collection', 'how to', 'kafka']
slug: /integrations/data-ingestion/kafka/kafka-table-engine-named-collections
doc_type: 'guide'
---



# 名前付きコレクションを使用した ClickHouse と Kafka の連携



## Introduction {#introduction}

このガイドでは、名前付きコレクションを使用してClickHouseをKafkaに接続する方法を説明します。名前付きコレクションの設定ファイルを使用すると、以下のような利点があります。

- 設定の一元管理が可能で、管理が容易になります。
- SQLテーブル定義を変更せずに設定を変更できます。
- 単一の設定ファイルを確認するだけで、設定のレビューとトラブルシューティングが容易になります。

このガイドは、Apache Kafka 3.4.1およびClickHouse 24.5.1で動作確認済みです。


## 前提条件 {#assumptions}

このドキュメントは以下を前提としています：

1. 稼働中のKafkaクラスター
2. セットアップ済みで稼働中のClickHouseクラスター
3. SQLの基礎知識、およびClickHouseとKafkaの設定に関する知識


## 前提条件 {#prerequisites}

名前付きコレクションを作成するユーザーに必要なアクセス権限があることを確認してください:

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

アクセス制御の有効化の詳細については、[ユーザー管理ガイド](./../../../guides/sre/user-management/index.md)を参照してください。


## 設定 {#configuration}

ClickHouseの`config.xml`ファイルに以下のセクションを追加します:

```xml
<!-- Kafka統合用の名前付きコレクション -->
<named_collections>
    <cluster_1>
        <!-- ClickHouse Kafkaエンジンパラメータ -->
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
        <!-- ClickHouse Kafkaエンジンパラメータ -->
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

### 設定に関する注意事項 {#configuration-notes}

1. Kafkaアドレスおよび関連する設定を、使用するKafkaクラスタのセットアップに合わせて調整してください。
2. `<kafka>`の前のセクションには、ClickHouse Kafkaエンジンパラメータが含まれています。パラメータの完全なリストについては、[Kafkaエンジンパラメータ](/engines/table-engines/integrations/kafka)を参照してください。
3. `<kafka>`内のセクションには、Kafkaの拡張設定オプションが含まれています。その他のオプションについては、[librdkafka設定](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)を参照してください。
4. この例では、`SASL_SSL`セキュリティプロトコルと`PLAIN`メカニズムを使用しています。使用するKafkaクラスタの設定に基づいて、これらの設定を調整してください。


## テーブルとデータベースの作成 {#creating-tables-and-databases}

ClickHouseクラスタ上に必要なデータベースとテーブルを作成します。ClickHouseを単一ノードとして実行している場合は、SQLコマンドのクラスタ部分を省略し、`ReplicatedMergeTree`の代わりに任意のエンジンを使用してください。

### データベースの作成 {#create-the-database}

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### Kafkaテーブルの作成 {#create-kafka-tables}

1つ目のKafkaクラスタ用のKafkaテーブルを作成します:

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

2つ目のKafkaクラスタ用のKafkaテーブルを作成します:

```sql
CREATE TABLE kafka_testing.second_kafka_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_2);
```

### レプリケーテッドテーブルの作成 {#create-replicated-tables}

1つ目のKafkaテーブル用のテーブルを作成します:

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

2つ目のKafkaテーブル用のテーブルを作成します:

```sql
CREATE TABLE kafka_testing.second_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

### マテリアライズドビューの作成 {#create-materialized-views}

1つ目のKafkaテーブルから1つ目のレプリケーテッドテーブルにデータを挿入するマテリアライズドビューを作成します:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

2つ目のKafkaテーブルから2つ目のレプリケーテッドテーブルにデータを挿入するマテリアライズドビューを作成します:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT
    id,
    first_name,
    last_name
FROM second_kafka_table;
```


## セットアップの検証 {#verifying-the-setup}

Kafkaクラスタ上に以下のコンシューマグループが表示されるはずです：

- `cluster_1_clickhouse_consumer` on `cluster_1`
- `cluster_2_clickhouse_consumer` on `cluster_2`

いずれかのClickHouseノードで以下のクエリを実行し、両方のテーブルのデータを確認します：

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### 注記 {#note}

このガイドでは、両方のKafkaトピックに取り込まれるデータは同一です。実際の使用では、これらは異なるデータになります。必要に応じて任意の数のKafkaクラスタを追加できます。

出力例：

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

これで、名前付きコレクションを使用したClickHouseとKafkaの統合セットアップが完了しました。ClickHouseの`config.xml`ファイルにKafka設定を集約することで、設定の管理と調整が容易になり、効率的で合理化された統合を実現できます。
