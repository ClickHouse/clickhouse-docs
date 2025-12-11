---
title: 'Named Collection を使用した ClickHouse と Kafka の連携'
description: 'Named Collection を使用して ClickHouse と Kafka を連携させる方法'
keywords: ['Named Collection', '手順', 'kafka']
slug: /integrations/data-ingestion/kafka/kafka-table-engine-named-collections
doc_type: 'guide'
---

# 名前付きコレクションを用いた ClickHouse と Kafka の統合 {#integrating-clickhouse-with-kafka-using-named-collections}

## はじめに {#introduction}

このガイドでは、named collection（名前付きコレクション）を使用して ClickHouse を Kafka に接続する方法を解説します。named collection 用の設定ファイルを使用することで、次のような利点があります。
- 設定を一元的かつ容易に管理できる。
- 設定項目を変更する際に、SQL テーブル定義を変更する必要がない。
- 単一の設定ファイルを確認するだけで、設定内容のレビューやトラブルシューティングを実施しやすい。

このガイドは、Apache Kafka 3.4.1 と ClickHouse 24.5.1 で検証されています。

## 前提条件 {#assumptions}

このドキュメントでは、以下を前提としています。
1. 稼働中の Kafka クラスター。
2. セットアップ済みで稼働中の ClickHouse クラスター。
3. SQL の基本的な知識と、ClickHouse および Kafka の設定に関する基本的な理解。

## 前提条件 {#prerequisites}

名前付きコレクションを作成するユーザーに、必要なアクセス権限が付与されていることを確認してください。

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

アクセス制御を有効にする方法の詳細については、[User Management Guide](./../../../guides/sre/user-management/index.md) を参照してください。

## 設定 {#configuration}

次のセクションを ClickHouse の `config.xml` ファイルに追加してください。

```xml
<!-- Kafka統合用の名前付きコレクション -->
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

        <!-- Kafka拡張構成 -->
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

        <!-- Kafka拡張構成 -->
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

1. Kafka のアドレスおよび関連する設定を、利用している Kafka クラスター構成に合わせて調整してください。
2. `<kafka>` の前のセクションには、ClickHouse の Kafka エンジンのパラメータが含まれます。パラメータの一覧については、[Kafka engine parameters](/engines/table-engines/integrations/kafka) を参照してください。
3. `<kafka>` 内のセクションには、追加の Kafka 設定オプションが含まれます。利用可能なオプションの詳細については、[librdkafka configuration](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) を参照してください。
4. この例では、`SASL_SSL` セキュリティプロトコルと `PLAIN` メカニズムを使用しています。これらの設定は、利用している Kafka クラスター構成に応じて調整してください。

## テーブルとデータベースの作成 {#creating-tables-and-databases}

ClickHouse クラスター上に必要なデータベースとテーブルを作成します。ClickHouse をシングルノード構成で実行している場合は、SQL コマンド内のクラスター指定部分を省略し、`ReplicatedMergeTree` の代わりに別のエンジンを使用してください。

### データベースの作成 {#create-the-database}

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### Kafka テーブルの作成 {#create-kafka-tables}

最初の Kafka クラスター向けの最初の Kafka テーブルを作成します。

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

2つ目のKafkaクラスター用の2つ目のKafkaテーブルを作成します：

```sql
CREATE TABLE kafka_testing.second_kafka_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_2);
```

### レプリケーテッドテーブルを作成する {#create-replicated-tables}

最初の Kafka 用テーブルを作成します。

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

2つ目の Kafka テーブル向けのテーブルを作成します。

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

最初の Kafka テーブルから最初のレプリケートされたテーブルにデータを挿入するマテリアライズドビューを作成します：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

2つ目の Kafka テーブルから 2つ目のレプリケーテッドテーブルへデータを挿入するマテリアライズドビューを作成します。

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```

## セットアップの検証 {#verifying-the-setup}

これで、Kafka クラスター上にそれぞれに対応するコンシューマグループが表示されているはずです:

* `cluster_1` 上の `cluster_1_clickhouse_consumer`
* `cluster_2` 上の `cluster_2_clickhouse_consumer`

両方のテーブルのデータを確認するには、任意の ClickHouse ノードで次のクエリを実行します:

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### 補足 {#note}

このガイドでは、両方の Kafka トピックに取り込まれるデータは同一です。実際の環境では、それぞれ異なるデータになるはずです。必要なだけ多くの Kafka クラスターを追加できます。

出力例：

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

これで、named collection を用いた ClickHouse と Kafka の統合設定は完了です。Kafka の設定を ClickHouse の `config.xml` ファイルに一元化することで、設定の管理や調整が容易になり、スムーズで効率的な統合を実現できます。
