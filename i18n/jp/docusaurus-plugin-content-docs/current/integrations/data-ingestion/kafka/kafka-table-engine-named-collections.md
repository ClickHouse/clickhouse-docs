---
title: Named コレクションを使用した ClickHouse と Kafka の統合
description: Named コレクションを使用して ClickHouse を Kafka に接続する方法
keywords: [named collection, how to, kafka]
---


# Named コレクションを使用した ClickHouse と Kafka の統合

## はじめに {#introduction}

このガイドでは、Named コレクションを使用して ClickHouse を Kafka に接続する方法を探ります。Named コレクションの構成ファイルを使用することで、いくつかの利点があります：
- 構成設定の集中管理と簡単な管理。
- SQL テーブル定義を変更せずに設定を変更できます。
- 単一の構成ファイルを確認することで、設定のレビューとトラブルシューティングが容易になります。

このガイドは、Apache Kafka 3.4.1 と ClickHouse 24.5.1 でテストされています。

## 前提条件 {#assumptions}

この文書は、以下を前提としています：
1. 動作する Kafka クラスターがあること。
2. 設定されて実行中の ClickHouse クラスターがあること。
3. SQL の基本知識と、ClickHouse および Kafka の構成に慣れていること。

## 事前準備 {#prerequisites}

Named コレクションを作成するユーザーが必要なアクセス権限を持っていることを確認してください：

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

アクセス制御を有効にする詳細については、[ユーザー管理ガイド](./../../../guides/sre/user-management/index.md)を参照してください。

## 構成 {#configuration}

次のセクションを ClickHouse の `config.xml` ファイルに追加してください：

```xml
<!-- Kafka 統合のための Named コレクション -->
<named_collections>
    <cluster_1>
        <!-- ClickHouse Kafka エンジンパラメーター -->
        <kafka_broker_list>c1-kafka-1:9094,c1-kafka-2:9094,c1-kafka-3:9094</kafka_broker_list>
        <kafka_topic_list>cluster_1_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_1_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka 拡張構成 -->
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
        <!-- ClickHouse Kafka エンジンパラメーター -->
        <kafka_broker_list>c2-kafka-1:29094,c2-kafka-2:29094,c2-kafka-3:29094</kafka_broker_list>
        <kafka_topic_list>cluster_2_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_2_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka 拡張構成 -->
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

### 構成ノート {#configuration-notes}

1. Kafka のアドレスと関連する構成を、Kafka クラスターの設定に合わせて調整してください。
2. `<kafka>` の前のセクションには、ClickHouse Kafka エンジンパラメーターが含まれています。パラメーターの完全なリストについては、[Kafka エンジンパラメーター](/engines/table-engines/integrations/kafka)を参照してください。
3. `<kafka>` 内のセクションには、拡張された Kafka 構成オプションが含まれています。詳細なオプションについては、[librdkafka 構成](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)を参照してください。
4. この例では、`SASL_SSL` セキュリティプロトコルおよび `PLAIN` メカニズムを使用しています。これらの設定は Kafka クラスター構成に基づいて調整してください。

## テーブルおよびデータベースの作成 {#creating-tables-and-databases}

ClickHouse クラスターに必要なデータベースとテーブルを作成します。ClickHouse を単一ノードとして実行している場合は、SQL コマンドのクラスター部分を省略し、`ReplicatedMergeTree` の代わりに他のエンジンを使用してください。

### データベースを作成する {#create-the-database}

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### Kafka テーブルを作成する {#create-kafka-tables}

最初の Kafka クラスタ用の最初の Kafka テーブルを作成します：

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

2 番目の Kafka クラスタ用の 2 番目の Kafka テーブルを作成します：

```sql
CREATE TABLE kafka_testing.second_kafka_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_2);
```

### 複製テーブルを作成する {#create-replicated-tables}

最初の Kafka テーブル用のテーブルを作成します：

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

2 番目の Kafka テーブル用のテーブルを作成します：

```sql
CREATE TABLE kafka_testing.second_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

### マテリアライズドビューを作成する {#create-materialized-views}

最初の Kafka テーブルから最初の複製テーブルにデータを挿入するマテリアライズドビューを作成します：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

2 番目の Kafka テーブルから 2 番目の複製テーブルにデータを挿入するマテリアライズドビューを作成します：

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```

## 設定の確認 {#verifying-the-setup}

これで、Kafka クラスターに関する相対的なコンシューマグループが表示されるはずです：
- `cluster_1_clickhouse_consumer` は `cluster_1` に
- `cluster_2_clickhouse_consumer` は `cluster_2` に

以下のクエリを任意の ClickHouse ノードで実行して、両方のテーブルにデータがあることを確認してください：

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### 注意 {#note}

このガイドでは、両方の Kafka トピックで取り込まれたデータは同じです。あなたのケースでは異なる場合があります。必要に応じて、好きなだけの Kafka クラスターを追加できます。

出力例：

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

これで、Named コレクションを使用して ClickHouse と Kafka を統合する設定が完了しました。ClickHouse の `config.xml` ファイルに Kafka の設定を集中化することで、管理と設定の調整がより容易になり、効率的な統合が実現します。
