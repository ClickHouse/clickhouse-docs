---
slug: /engines/table-engines/integrations/kafka
sidebar_position: 110
sidebar_label: Kafka
title: "Kafka"
description: "KafkaエンジンはApache Kafkaと連携し、データフローの公開や購読、耐障害性ストレージの構成、利用可能になったストリームの処理を行います。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Kafka

:::note
ClickHouse Cloudユーザーには、[ClickPipes](/integrations/clickpipes)を使用してKafkaデータをClickHouseにストリーミングすることをお勧めします。これにより、高性能の挿入がネイティブにサポートされ、インジェクションおよびクラスタリソースを個別にスケーリングできることで、関心の分離が確保されます。
:::

このエンジンは[Apache Kafka](http://kafka.apache.org/)と連携します。

Kafkaを使用すると：

- データフローの公開または購読ができます。
- 耐障害性のストレージを整理できます。
- 利用可能になったストリームを処理できます。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [ALIAS expr1],
    name2 [type2] [ALIAS expr2],
    ...
) ENGINE = Kafka()
SETTINGS
    kafka_broker_list = 'host:port',
    kafka_topic_list = 'topic1,topic2,...',
    kafka_group_name = 'group_name',
    kafka_format = 'data_format'[,]
    [kafka_schema = '',]
    [kafka_num_consumers = N,]
    [kafka_max_block_size = 0,]
    [kafka_skip_broken_messages = N,]
    [kafka_commit_every_batch = 0,]
    [kafka_client_id = '',]
    [kafka_poll_timeout_ms = 0,]
    [kafka_poll_max_batch_size = 0,]
    [kafka_flush_interval_ms = 0,]
    [kafka_thread_per_consumer = 0,]
    [kafka_handle_error_mode = 'default',]
    [kafka_commit_on_select = false,]
    [kafka_max_rows_per_message = 1];
```

必須パラメータ：

- `kafka_broker_list` — ブローカーのカンマ区切りリスト（例：`localhost:9092`）。
- `kafka_topic_list` — Kafkaトピックのリスト。
- `kafka_group_name` — Kafkaコンシューマのグループ。各グループに対して読み取りマージンが個別に追跡されます。クラスター内でメッセージの重複を避けたい場合は、どこでも同じグループ名を使用してください。
- `kafka_format` — メッセージ形式。SQLの`FORMAT`関数と同じ記法を使用します（例：`JSONEachRow`）。詳細については、[Formats](../../../interfaces/formats.md)セクションを参照してください。

オプションのパラメータ：

- `kafka_schema` — 形式がスキーマ定義を要求する場合に使用する必要があるパラメータ。たとえば、[Cap'n Proto](https://capnproto.org/)は、スキーマファイルへのパスとルート`schema.capnp:Message`オブジェクトの名前を要求します。
- `kafka_num_consumers` — テーブルあたりのコンシューマの数。1つのコンシューマのスループットが不十分な場合は、より多くのコンシューマを指定してください。コンシューマの合計数はトピック内のパーティションの数を超えてはならず、ClickHouseが展開されているサーバーの物理コアの数を超えてもなりません。デフォルト：`1`。
- `kafka_max_block_size` — ポーリングの最大バッチサイズ（メッセージ数）。デフォルト：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — スキーマと互換性のないメッセージに対するKafkaメッセージパーサの耐障害性。`kafka_skip_broken_messages = N`の場合、エンジンは解析できない*N*のKafkaメッセージをスキップします（メッセージは1行のデータです）。デフォルト：`0`。
- `kafka_commit_every_batch` — ブロック全体を書き込んだ後に単一のコミットを行う代わりに、消費して処理したバッチごとにコミットします。デフォルト：`0`。
- `kafka_client_id` — クライアント識別子。デフォルトは空です。
- `kafka_poll_timeout_ms` — Kafkaからの単一ポーリングのタイムアウト。デフォルト：[stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 単一のKafkaポーリングでポーリングされる最大メッセージ数。デフォルト：[max_block_size](/docs/operations/settings/settings#max_block_size)。
- `kafka_flush_interval_ms` — Kafkaからのデータフラッシュのタイムアウト。デフォルト：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `kafka_thread_per_consumer` — 各コンシューマに独立したスレッドを提供します。これを有効にすると、各コンシューマが独立してデータをフラッシュし、並行して処理します（そうでない場合、複数のコンシューマからの行が1つのブロックを形成するために圧縮されます）。デフォルト：`0`。
- `kafka_handle_error_mode` — Kafkaエンジンでエラーを処理する方法。可能な値：デフォルト（メッセージの解析に失敗した場合、例外がスローされます）、ストリーム（例外メッセージと生のメッセージが仮想列`_error`と`_raw_message`に保存されます）。
- `kafka_commit_on_select` — SELECTクエリが行われるときにメッセージをコミットします。デフォルト：`false`。
- `kafka_max_rows_per_message` — 行ベースの形式の1つのKafkaメッセージに書き込まれる最大行数。デフォルト：`1`。

例：

``` sql
  CREATE TABLE queue (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

  SELECT * FROM queue LIMIT 5;

  CREATE TABLE queue2 (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka SETTINGS kafka_broker_list = 'localhost:9092',
                            kafka_topic_list = 'topic',
                            kafka_group_name = 'group1',
                            kafka_format = 'JSONEachRow',
                            kafka_num_consumers = 4;

  CREATE TABLE queue3 (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1')
              SETTINGS kafka_format = 'JSONEachRow',
                       kafka_num_consumers = 4;
```

<details markdown="1">

<summary>テーブルを作成するための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
:::

``` sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafkaテーブルエンジンは、[デフォルト値](/sql-reference/statements/create/table#default_values)を持つカラムをサポートしていません。デフォルト値を持つカラムが必要な場合は、マテリアライズドビューのレベルで追加できます（下記参照）。
:::

## 説明 {#description}

配信されたメッセージは自動的に追跡されるため、グループ内の各メッセージは1回のみカウントされます。データを2回取得したい場合は、別のグループ名のテーブルのコピーを作成してください。

グループは柔軟で、クラスター上で同期されます。たとえば、10のトピックとクラスター内の5つのテーブルのコピーがある場合、各コピーは2つのトピックを取得します。コピーの数が変更されると、トピックは自動的にコピー間で再分配されます。詳細についてはhttp://kafka.apache.org/introでご確認ください。

`SELECT`はメッセージの読み取りには特に便利ではありません（デバッグ以外）、なぜなら各メッセージは一度しか読むことができないからです。リアルタイムスレッドをマテリアライズドビューを使用して作成することがより実用的です。そのためには：

1. エンジンを使用してKafkaコンシューマを作成し、それをデータストリームと見なします。
2. 必要な構造を持つテーブルを作成します。
3. エンジンからデータを変換し、事前に作成したテーブルに入れるマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続すると、バックグラウンドでデータの収集を始めます。これにより、Kafkaから継続的にメッセージを受信し、`SELECT`を使用して必要な形式に変換できます。
1つのKafkaテーブルには、好きな数だけマテリアライズドビューを持つことができます。それらはKafkaテーブルから直接データを読み取るのではなく、新しいレコード（ブロック単位）を受け取ります。この方法により、異なる詳細レベル（集約と非集約）を持つ複数のテーブルに書き込むことができます。

例：

``` sql
  CREATE TABLE queue (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

  CREATE TABLE daily (
    day Date,
    level String,
    total UInt64
  ) ENGINE = SummingMergeTree(day, (day, level), 8192);

  CREATE MATERIALIZED VIEW consumer TO daily
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() as total
    FROM queue GROUP BY day, level;

  SELECT level, sum(total) FROM daily GROUP BY level;
```

パフォーマンスを向上させるために、受信したメッセージは[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)のサイズのブロックにグループ化されます。ブロックが[max_insert_block_size](/operations/settings/settings.md#max_insert_block_size)ミリ秒以内に形成されない場合、ブロックの完全性に関係なく、データはテーブルにフラッシュされます。

トピックデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューを切り離します：

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更する場合は、ターゲットテーブルとビューのデータ間の不一致を避けるために、マテリアルビューを無効にすることをお勧めします。

## 設定 {#configuration}

GraphiteMergeTreeに似て、KafkaエンジンはClickHouse設定ファイルを使用した拡張設定をサポートします。使用できる設定キーは2つあり、グローバル（`<kafka>`の下）およびトピックレベル（`<kafka><kafka_topic>`の下）です。グローバル設定が最初に適用され、その後トピックレベルの設定が適用されます（存在する場合）。

``` xml
  <kafka>
    <!-- Kafkaエンジンタイプのすべてのテーブルに対するグローバル設定オプション -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- コンシューマの設定 -->
    <consumer>
        <auto_offset_reset>smallest</auto_offset_reset>
        <kafka_topic>
            <name>logs</name>
            <fetch_min_bytes>100000</fetch_min_bytes>
        </kafka_topic>

        <kafka_topic>
            <name>stats</name>
            <fetch_min_bytes>50000</fetch_min_bytes>
        </kafka_topic>
    </consumer>

    <!-- プロデューサの設定 -->
    <producer>
        <kafka_topic>
            <name>logs</name>
            <retry_backoff_ms>250</retry_backoff_ms>
        </kafka_topic>

        <kafka_topic>
            <name>stats</name>
            <retry_backoff_ms>400</retry_backoff_ms>
        </kafka_topic>
    </producer>
  </kafka>
```

可能な設定オプションのリストについては、[librdkafka configuration reference](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)を参照してください。ドットの代わりにアンダースコア（`_`）をClickHouse設定で使用します。たとえば、`check.crcs=true`は`<check_crcs>true</check_crcs>`となります。

### Kerberosサポート {#kafka-kerberos-support}

Kerberos対応のKafkaに対処するには、 `sasl_plaintext`の値を持つ`security_protocol`子要素を追加します。Kerberosチケット授与チケットがOSの機能によって取得およびキャッシュされている場合、十分です。
ClickHouseは、keytabファイルを使用してKerberos資格情報を維持できます。`sasl_kerberos_service_name`、`sasl_kerberos_keytab`および`sasl_kerberos_principal`子要素を考慮してください。

例：

``` xml
  <!-- Kerberos対応のKafka -->
  <kafka>
    <security_protocol>SASL_PLAINTEXT</security_protocol>
    <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
    <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
  </kafka>
```

## 仮想列 {#virtual-columns}

- `_topic` — Kafkaトピック。データ型：`LowCardinality(String)`。
- `_key` — メッセージのキー。データ型：`String`。
- `_offset` — メッセージのオフセット。データ型：`UInt64`。
- `_timestamp` — メッセージのタイムスタンプ。データ型：`Nullable(DateTime)`。
- `_timestamp_ms` — メッセージのミリ秒単位のタイムスタンプ。データ型：`Nullable(DateTime64(3))`。
- `_partition` — Kafkaトピックのパーティション。データ型：`UInt64`。
- `_headers.name` — メッセージのヘッダーキーの配列。データ型：`Array(String)`。
- `_headers.value` — メッセージのヘッダー値の配列。データ型：`Array(String)`。

`kafka_handle_error_mode='stream'`の際の追加仮想列：

- `_raw_message` - 正常に解析できなかった生メッセージ。データ型：`String`。
- `_error` - 解析に失敗した際に発生した例外メッセージ。データ型：`String`。

注意：`_raw_message`および`_error`仮想列は、解析中に例外が発生した場合のみ埋められます。メッセージが正常に解析された場合は常に空です。

## データ形式のサポート {#data-formats-support}

Kafkaエンジンは、ClickHouseでサポートされているすべての[形式](../../../interfaces/formats.md)をサポートしています。
1つのKafkaメッセージ内の行数は、形式が行ベースかブロックベースかに依存します：

- 行ベースの形式では、1つのKafkaメッセージ内の行数は`kafka_max_rows_per_message`を設定することで制御できます。
- ブロックベースの形式では、ブロックを小さな部分に分割することはできませんが、1つのブロック内の行数は一般設定[max_block_size](/operations/settings/settings#max_block_size)で制御できます。

## ClickHouse Keeperにコミットされたオフセットを格納するためのエンジン {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

`allow_experimental_kafka_offsets_storage_in_keeper`が有効になっている場合、Kafkaテーブルエンジンに指定できる2つの設定があります：
 - `kafka_keeper_path`は、ClickHouse Keeper内のテーブルへのパスを指定します。
 - `kafka_replica_name`は、ClickHouse Keeper内のレプリカ名を指定します。

これらの設定のいずれかは両方指定する必要があります。または、どちらも指定しない必要があります。両方が指定されている場合は、新しい実験的なKafkaエンジンが使用されます。この新しいエンジンは、コミットされたオフセットをKafkaに保存することには依存せず、ClickHouse Keeperに保存します。オフセットをKafkaにコミットしようとしますが、テーブルが作成されるときにのみこれらのオフセットに依存します。その他の状況（テーブルが再起動されるか、エラーから回復される場合）では、ClickHouse Keeperに保存されたオフセットがメッセージを消費するためのオフセットとして使用されます。コミットされたオフセットに加えて、最後のバッチで消費されたメッセージ数も保存されるため、挿入に失敗した場合は、同じ数のメッセージが再消費され、必要に応じて重複排除が可能になります。

例：

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

または、`uuid`および`replica`マクロをReplicatedMergeTreeと同様に利用する場合：

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 既知の制限 {#known-limitations}

新しいエンジンは実験的であるため、まだ本番環境には準備ができていません。実装のいくつかの既知の制限があります：
 - 最大の制限は、エンジンは直接読み取りをサポートしていないことです。マテリアライズドビューを使用してエンジンから読み取ることや、エンジンに書き込むことはできますが、直接読み取りはできません。結果として、すべての直接の`SELECT`クエリは失敗します。
 - テーブルを迅速に削除および再作成したり、同じClickHouse Keeperパスを異なるエンジンに指定すると、問題が発生する可能性があります。ベストプラクティスとして、`kafka_keeper_path`に`{uuid}`を使用して衝突を回避できます。
 - 再現可能な読み取りを行うために、メッセージは単一スレッドで複数のパーティションから消費できません。一方で、Kafkaコンシューマは生存を維持するために定期的にポーリングする必要があります。これら2つの目的の結果として、`kafka_thread_per_consumer`が有効な場合にのみ複数のコンシューマの作成を許可することにしました。そうでなければ、定期的にコンシューマをポーリングすることに関する問題を回避するのが非常に難しいです。
 - 新しいストレージエンジンによって作成されたコンシューマは、[`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md)テーブルに表示されません。

**参照**

- [仮想列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](../../../operations/server-configuration-parameters/settings.md#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
