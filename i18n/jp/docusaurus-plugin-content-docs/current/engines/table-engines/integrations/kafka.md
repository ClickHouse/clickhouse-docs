---
slug: '/engines/table-engines/integrations/kafka'
sidebar_position: 110
sidebar_label: 'Kafka'
title: 'Kafka'
description: 'KafkaエンジンはApache Kafkaと連携し、データフローの発行や購読、耐障害性のあるストレージの組織化、ストリームが利用可能になると同時に処理を行うことができます。'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Kafka

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudユーザーは、KafkaデータをClickHouseにストリーミングするために[ClickPipes](/integrations/clickpipes)の使用を推奨します。これは高パフォーマンスの挿入をネイティブにサポートし、取り込みとクラスターリソースを独立してスケールできるという分離の原則を保証します。
:::

このエンジンは[Apache Kafka](http://kafka.apache.org/)と連携します。

Kafkaを使用すると：

- データフローの発行または購読ができます。
- 耐障害性のあるストレージを組織化できます。
- ストリームが利用可能になると同時に処理ができます。

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

必要なパラメータ：

- `kafka_broker_list` — ブローカーのカンマ区切りリスト（例えば、 `localhost:9092`）。
- `kafka_topic_list` — Kafkaトピックのリスト。
- `kafka_group_name` — Kafkaコンシューマのグループ。読み取りマージンは各グループごとに別々に追跡されます。メッセージの重複を避けたい場合は、同じグループ名を使用してください。
- `kafka_format` — メッセージ形式。SQLの `FORMAT` 関数と同じ表記法を使用します。例えば、`JSONEachRow`。詳細については、[フォーマット](../../../interfaces/formats.md)セクションを参照してください。

オプショナルパラメータ：

- `kafka_schema` — 形式がスキーマ定義を必要とする場合に使用されるパラメータ。例えば、[Cap'n Proto](https://capnproto.org/)は、スキーマファイルへのパスとルート`sсhema.capnp:Message`オブジェクトの名前を必要とします。
- `kafka_num_consumers` — テーブルごとのコンシューマの数。1つのコンシューマのスループットが不十分な場合は、より多くのコンシューマを指定してください。総コンシューマ数はトピックのパーティション数を超えてはならず、ClickHouseが展開されているサーバー上の物理コア数を超えてはなりません。デフォルト: `1`。
- `kafka_max_block_size` — ポールの最大バッチサイズ（メッセージ数）。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — ブロック内のスキーマ不適合メッセージに対するKafkaメッセージパーサの許容度。`kafka_skip_broken_messages = N`の場合、エンジンは解析できない*N*のKafkaメッセージをスキップします（メッセージはデータの行に相当します）。デフォルト: `0`。
- `kafka_commit_every_batch` — 全体のブロックを書き込んだ後の単一コミットではなく、消費されたおよび処理されたバッチごとにコミットします。デフォルト: `0`。
- `kafka_client_id` — クライアント識別子。デフォルトは空です。
- `kafka_poll_timeout_ms` — Kafkaからの単一ポールのタイムアウト。デフォルト: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 単一のKafkaポールでポーリングするメッセージの最大数。デフォルト: [max_block_size](/operations/settings/settings#max_block_size)。
- `kafka_flush_interval_ms` — Kafkaからデータをフラッシュするためのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `kafka_thread_per_consumer` — 各コンシューマに独立したスレッドを提供します。有効にすると、各コンシューマは独立して並列でデータをフラッシュします（そうでない場合は、複数のコンシューマの行が一つのブロックに圧縮されます）。デフォルト: `0`。
- `kafka_handle_error_mode` — Kafkaエンジンのエラー処理方法。可能な値: デフォルト（メッセージの解析に失敗した場合に例外がスローされます）、ストリーム（例外メッセージと生のメッセージが仮想カラム`_error`と`_raw_message`に保存されます）。
- `kafka_commit_on_select` — SELECTクエリが実行されたときにメッセージをコミットします。デフォルト: `false`。
- `kafka_max_rows_per_message` — 行ベースの形式の1つのKafkaメッセージに書き込まれる最大行数。デフォルト: `1`。

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
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを上記で説明した方法に切り替えてください。
:::

``` sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafkaテーブルエンジンは、[デフォルト値](/sql-reference/statements/create/table#default_values)を持つカラムをサポートしていません。デフォルト値を持つカラムが必要な場合は、マテリアライズドビューのレベルで追加できます（以下を参照）。
:::

## 説明 {#description}

配信されたメッセージは自動的に追跡されるため、グループ内の各メッセージは1回だけカウントされます。データを2回取得したい場合は、別のグループ名でテーブルのコピーを作成してください。

グループは柔軟でクラスター内で同期されます。たとえば、10トピックとクラスター内の5つのテーブルのコピーがある場合、各コピーは2つのトピックを取得します。コピーの数が変更されると、トピックは自動的にコピー間で再分配されます。これについては、http://kafka.apache.org/introで詳しく読むことができます。

`SELECT`はメッセージを読み取るために特に便利ではありません（デバッグを除いて）、なぜなら各メッセージは一度しか読むことができないからです。マテリアライズドビューを使用してリアルタイムスレッドを作成する方が実用的です。そのために：

1. エンジンを使用してKafkaコンシューマを作成し、それをデータストリームと考えます。
2. 希望の構造でテーブルを作成します。
3. エンジンからデータを変換し、事前に作成したテーブルに入れるマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに結合すると、バックグラウンドでデータを収集し始めます。これにより、Kafkaからメッセージを継続して受信し、`SELECT`を使用して必要な形式に変換できます。
1つのKafkaテーブルには、好きなだけのマテリアライズドビューを持つことができ、これらはKafkaテーブルから直接データを読み取るのではなく、新しいレコード（ブロックごとに）を受け取ります。このように、異なる詳細レベル（集計と非集計）の複数のテーブルに書き込むことができます。

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
パフォーマンスを向上させるために、受信したメッセージは[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)サイズのブロックにグループ化されます。ブロックが[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)ミリ秒内に形成されなかった場合、データはブロックの完全性に関係なくテーブルにフラッシュされます。

トピックデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューを切り離します：

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更したい場合は、ターゲットテーブルとビューからのデータの不一致を避けるためにマテリアルビューを無効にすることをお勧めします。

## 設定 {#configuration}

GraphiteMergeTreeと同様に、KafkaエンジンはClickHouse設定ファイルを使用した拡張設定をサポートしています。使用できる設定キーは2つあります：グローバル（`<kafka>`の下）とトピックレベル（`<kafka><kafka_topic>`の下）。グローバル設定は最初に適用され、その後トピックレベルの設定が適用されます（存在する場合）。

``` xml
  <kafka>
    <!-- Kafkaエンジンタイプのすべてのテーブルのグローバル設定オプション -->
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


利用可能な設定オプションのリストについては、[librdkafka設定リファレンス](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)を参照してください。ClickHouse設定では、ドットの代わりにアンダースコア（`_`）を使用します。例えば、`check.crcs=true`は`<check_crcs>true</check_crcs>`となります。

### Kerberosサポート {#kafka-kerberos-support}

Kerberos対応Kafkaを使用するには、`security_protocol`子要素を`sasl_plaintext`値で追加します。OS機能によってチケット授与チケットが取得され、キャッシュされているだけで十分です。
ClickHouseは、keytabファイルを使用してKerberos資格情報を維持できます。`sasl_kerberos_service_name`、`sasl_kerberos_keytab`、および`sasl_kerberos_principal`子要素を考慮してください。

例：

``` xml
  <!-- Kerberos対応Kafka -->
  <kafka>
    <security_protocol>SASL_PLAINTEXT</security_protocol>
	<sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
	<sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
  </kafka>
```

## 仮想カラム {#virtual-columns}

- `_topic` — Kafkaトピック。データ型: `LowCardinality(String)`。
- `_key` — メッセージのキー。データ型: `String`。
- `_offset` — メッセージのオフセット。データ型: `UInt64`。
- `_timestamp` — メッセージのタイムスタンプ。データ型: `Nullable(DateTime)`。
- `_timestamp_ms` — メッセージのミリ秒単位のタイムスタンプ。データ型: `Nullable(DateTime64(3))`。
- `_partition` — Kafkaトピックのパーティション。データ型: `UInt64`。
- `_headers.name` — メッセージのヘッダーキーの配列。データ型: `Array(String)`。
- `_headers.value` — メッセージのヘッダー値の配列。データ型: `Array(String)`。

`kafka_handle_error_mode='stream'`の場合の追加の仮想カラム:

- `_raw_message` - 成功裏に解析できなかった生メッセージ。データ型: `String`。
- `_error` - 解析に失敗した際の例外メッセージ。データ型: `String`。

注意: `_raw_message`および`_error`の仮想カラムは、解析中に例外が発生した場合にのみ埋め込まれ、メッセージが正常に解析された場合は常に空です。

## データ形式のサポート {#data-formats-support}

Kafkaエンジンは、ClickHouseでサポートされているすべての[形式](../../../interfaces/formats.md)をサポートしています。
1つのKafkaメッセージの行数は、形式が行ベースかブロックベースかによって異なります：

- 行ベースの形式の場合、1つのKafkaメッセージの行数は`kafka_max_rows_per_message`を設定することで制御できます。
- ブロックベースの形式の場合、ブロックを小さな部分に分割することはできませんが、1つのブロックの行数は一般設定[max_block_size](/operations/settings/settings#max_block_size)で制御できます。

## ClickHouse Keeperにコミットされたオフセットを保存するエンジン {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

`allow_experimental_kafka_offsets_storage_in_keeper`が有効になっている場合、Kafkaテーブルエンジンに指定できる2つの追加設定があります：
 - `kafka_keeper_path`は、ClickHouse Keeper内のテーブルのパスを指定します
 - `kafka_replica_name`は、ClickHouse Keeper内のレプリカ名を指定します

これらの設定は、両方とも指定する必要があるか、どちらも指定しない必要があります。両方が指定された場合、新しい実験的なKafkaエンジンが使用されます。この新しいエンジンは、コミットされたオフセットをKafkaに保存する必要はなく、ClickHouse Keeperに保存します。Kafkaにオフセットをコミットしようとしますが、テーブルが作成されるときにのみそのオフセットに依存します。それ以外の状況（テーブルが再起動またはエラーから復旧した場合）では、ClickHouse Keeperに保存されたオフセットを使用してメッセージの消費を続行します。コミットされたオフセットに加えて、最後のバッチで消費されたメッセージ数も保存されるため、挿入が失敗した場合、同じ数のメッセージが消費され、必要に応じて重複排除が可能になります。

例：

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

また、`uuid`および`replica`のマクロをReplicatedMergeTreeに似たように利用できます：

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 既知の制限 {#known-limitations}

新しいエンジンは実験的であるため、まだ本番環境での使用には適していません。実装にはいくつかの既知の制限があります：
 - 最大の制限は、エンジンが直接読み取りをサポートしていないことです。マテリアライズドビューを使用してエンジンから読み取ることと、エンジンに書き込むことは可能ですが、直接読み取りはできません。その結果、すべての直接`SELECT`クエリは失敗します。
 - テーブルを迅速に削除および再作成したり、異なるエンジンに同じClickHouse Keeperパスを指定すると問題が発生する可能性があります。ベストプラクティスとして、`kafka_keeper_path`に`{uuid}`を使用してパスの衝突を避けることができます。
 - 再現可能な読み取りを行うためには、メッセージは単一のスレッドで複数のパーティションから消費できません。一方で、Kafkaのコンシューマは定期的にポーリングされる必要があります。これらの2つの目標の結果として、`kafka_thread_per_consumer`が有効になっている場合のみ複数のコンシューマを作成することを許可しました。そうでなければ、コンシューマを定期的にポーリングする際に問題を避けるのが複雑すぎるからです。
 - 新しいストレージエンジンによって作成されたコンシューマは、[`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md)テーブルには表示されません。

**関連情報**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
