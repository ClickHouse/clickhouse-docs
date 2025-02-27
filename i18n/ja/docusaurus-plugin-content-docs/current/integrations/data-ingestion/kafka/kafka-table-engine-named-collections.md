---
title: Named Collectionsを使用したClickHouseとKafkaの統合
description: Named Collectionsを使用してClickHouseをKafkaに接続する方法
keywords: [named collection, how to, kafka]
---

# Named Collectionsを使用したClickHouseとKafkaの統合

## はじめに {#introduction}

このガイドでは、Named Collectionsを使用してClickHouseをKafkaに接続する方法について説明します。Named Collectionsの設定ファイルを使用することで、いくつかの利点があります：
- 設定の集中管理と簡単な管理が可能。
- 設定を変更してもSQLテーブル定義を変更する必要がありません。
- 単一の設定ファイルを確認することで、設定のレビューとトラブルシューティングが容易になります。

このガイドは、Apache Kafka 3.4.1およびClickHouse 24.5.1でテストされています。

## 前提条件 {#assumptions}

この文書では、以下のことを前提としています：
1. 動作するKafkaクラスターがあること。
2. 設定され、稼働中のClickHouseクラスターがあること。
3. SQLの基本知識とClickHouseおよびKafkaの設定に対する理解があること。

## 前準備 {#prerequisites}

Named Collectionを作成するユーザーが必要なアクセス許可を持っていることを確認してください：

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

詳細については、[ユーザー管理ガイド](./../../../guides/sre/user-management/index.md)を参照してください。

## 設定 {#configuration}

ClickHouseの`config.xml`ファイルに以下のセクションを追加します：

```xml
<!-- Kafka統合用のNamed Collections -->
<named_collections>
    <cluster_1>
        <!-- ClickHouse Kafkaエンジンのパラメータ -->
        <kafka_broker_list>c1-kafka-1:9094,c1-kafka-2:9094,c1-kafka-3:9094</kafka_broker_list>
        <kafka_topic_list>cluster_1_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_1_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafkaの拡張設定 -->
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
        <!-- ClickHouse Kafkaエンジンのパラメータ -->
        <kafka_broker_list>c2-kafka-1:29094,c2-kafka-2:29094,c2-kafka-3:29094</kafka_broker_list>
        <kafka_topic_list>cluster_2_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_2_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafkaの拡張設定 -->
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

### 設定ノート {#configuration-notes}

1. Kafkaのアドレスと関連設定を、あなたのKafkaクラスターの設定に合わせて調整してください。
2. `<kafka>`の前のセクションにはClickHouse Kafkaエンジンのパラメータが含まれています。パラメータの完全なリストについては、[Kafkaエンジンのパラメータ](/engines/table-engines/integrations/kafka)を参照してください。
3. `<kafka>`内のセクションには、拡張Kafka設定オプションが含まれています。さらにオプションについては、[librdkafkaの設定](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)を参照してください。
4. この例では、`SASL_SSL`セキュリティプロトコルと`PLAIN`メカニズムを使用しています。これらの設定はあなたのKafkaクラスターの設定に基づいて調整してください。

## テーブルとデータベースの作成 {#creating-tables-and-databases}

ClickHouseクラスターで必要なデータベースとテーブルを作成します。ClickHouseを単一ノードとして実行している場合は、SQLコマンドのクラスター部分を省略し、`ReplicatedMergeTree`の代わりに他のエンジンを使用してください。

### データベースの作成 {#create-the-database}

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### Kafkaテーブルの作成 {#create-kafka-tables}

最初のKafkaクラスター用の最初のKafkaテーブルを作成します：

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

二番目のKafkaクラスター用の二番目のKafkaテーブルを作成します：

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

二番目のKafkaテーブル用のテーブルを作成します：

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

最初のKafkaテーブルから最初のレプリケートテーブルにデータを挿入するためのマテリアライズドビューを作成します：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

二番目のKafkaテーブルから二番目のレプリケートテーブルにデータを挿入するためのマテリアライズドビューを作成します：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```

## セットアップの確認 {#verifying-the-setup}

これで、Kafkaクラスター上に関連するコンシューマグループが見えるはずです：
- `cluster_1_clickhouse_consumer` on `cluster_1`
- `cluster_2_clickhouse_consumer` on `cluster_2`

以下のクエリを任意のClickHouseノードで実行して、両方のテーブルのデータを確認してください：

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### 注 {#note}

このガイドでは、両方のKafkaトピックに取り込まれたデータは同じです。あなたの場合、異なるデータが入ることになるでしょう。任意の数のKafkaクラスターを追加できます。

出力例：

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

これで、Named Collectionsを使用したClickHouseとKafkaの統合のセットアップが完了しました。ClickHouseの`config.xml`ファイルにKafka設定を集中させることで、設定をより簡単に管理および調整し、スムーズで効率的な統合を実現できます。
