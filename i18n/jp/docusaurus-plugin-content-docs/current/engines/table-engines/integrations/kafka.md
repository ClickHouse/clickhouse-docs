---
slug: /engines/table-engines/integrations/kafka
sidebar_position: 110
sidebar_label: Kafka
title: "Kafka"
description: "KafkaエンジンはApache Kafkaと連携し、データフローの公開または購読、フォールトトレラントストレージの整理、およびストリームの処理が可能です。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Kafka

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudユーザーは、KafkaデータをClickHouseにストリーミングするために[ClickPipes](/integrations/clickpipes)の使用が推奨されます。これにより、高性能な挿入がネイティブにサポートされ、摂取とクラスターリソースの独立したスケーリングが可能になります。
:::

このエンジンは[Apache Kafka](http://kafka.apache.org/)と連携します。

Kafkaでは次のことができます：

- データフローを公開または購読する。
- フォールトトレラントストレージを整理する。
- ストリームが利用可能になると処理する。

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

- `kafka_broker_list` — ブローカーのカンマ区切りリスト（例： `localhost:9092`）。
- `kafka_topic_list` — Kafkaトピックのリスト。
- `kafka_group_name` — Kafkaコンシューマのグループ。読み込みマージンは各グループごとに別々に追跡されます。メッセージがクラスター内で重複しないように、すべての場所で同じグループ名を使用してください。
- `kafka_format` — メッセージ形式。`FORMAT`関数と同じ記法を使用します（例： `JSONEachRow`）。詳細については、[フォーマット](../../../interfaces/formats.md)セクションを参照してください。

オプションのパラメータ：

- `kafka_schema` — フォーマットがスキーマ定義を必要とする場合に使用するパラメータ。例えば、[Cap'n Proto](https://capnproto.org/)はスキーマファイルへのパスとルートの`schema.capnp:Message`オブジェクトの名前を要求します。
- `kafka_num_consumers` — テーブルごとのコンシューマ数。1つのコンシューマのスループットが不十分な場合は、より多くのコンシューマを指定してください。トピック内のパーティション数を超えないようにしてください。なぜなら、1つのパーティションには1つのコンシューマしか割り当てられず、ClickHouseが展開されるサーバーの物理コアの数を超えてはいけないからです。デフォルト: `1`。
- `kafka_max_block_size` — ポーリングの最大バッチサイズ（メッセージ単位）。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — スキーマの不適合に対するKafkaメッセージパーサの許容度。`kafka_skip_broken_messages = N`の場合、エンジンは*N*のパースできないKafkaメッセージをスキップします（メッセージはデータの行に等しい）。デフォルト: `0`。
- `kafka_commit_every_batch` — 一度に全ブロックを書き込んだ後の単一コミットの代わりに、消費されたすべてのバッチをコミットします。デフォルト: `0`。
- `kafka_client_id` — クライアント識別子。デフォルトは空です。
- `kafka_poll_timeout_ms` — Kafkaからの単一ポーリングのタイムアウト。デフォルト: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 単一Kafkaポーリングでポーリングされるメッセージの最大数。デフォルト: [max_block_size](/docs/operations/settings/settings#max_block_size)。
- `kafka_flush_interval_ms` — Kafkaからのデータフラッシュのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `kafka_thread_per_consumer` — 各コンシューマに独立したスレッドを提供します。これを有効にすると、各コンシューマはデータを独立にフラッシュします（そうでない場合は、数件のコンシューマからの行が1つのブロックに圧縮されます）。デフォルト: `0`。
- `kafka_handle_error_mode` — Kafkaエンジンのエラー処理方法。可能な値: デフォルト（メッセージのパースに失敗した場合、例外がスローされます）、ストリーム（例外メッセージと生のメッセージが仮想カラム`_error`および`_raw_message`に保存されます）。
- `kafka_commit_on_select` —  SELECTクエリが行われるときにメッセージをコミットします。デフォルト: `false`。
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
このメソッドは新しいプロジェクトで使用しないでください。可能であれば、古いプロジェクトを上記のメソッドに切り替えてください。
:::

``` sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafkaテーブルエンジンは、[デフォルト値](/sql-reference/statements/create/table#default_values)を持つカラムをサポートしていません。デフォルト値を持つカラムが必要な場合は、マテリアライズビューのレベルで追加できます（以下を参照）。
:::

## 説明 {#description}

配信されたメッセージは自動的に追跡されるため、グループ内の各メッセージは1回のみカウントされます。データを2回取得したい場合は、別のグループ名でテーブルのコピーを作成してください。

グループは柔軟で、クラスター内で同期されています。たとえば、10のトピックとクラスター内の5つのテーブルのコピーがある場合、各コピーには2つのトピックが割り当てられます。コピーの数が変更されると、トピックは自動的にコピー間で再配布されます。これについての詳細はhttp://kafka.apache.org/introをお読みください。

`SELECT`はメッセージを読み取るにはあまり役立ちません（デバッグ以外の目的で）、なぜなら各メッセージは1回しか読めないからです。実際には、マテリアライズビューを使用してリアルタイムスレッドを作成する方が実用的です。これを行うには：

1. エンジンを使用してKafkaコンシューマを作成し、データストリームと見なします。
2. 望ましい構造を持つテーブルを作成します。
3. エンジンからデータを変換し、事前に作成されたテーブルに挿入するマテリアライズビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続すると、バックグラウンドでデータを収集し始めます。これにより、Kafkaからメッセージを継続的に受信し、`SELECT`を使用して必要な形式に変換できます。
1つのKafkaテーブルには好きなだけのマテリアライズビューを持て、それらはKafkaテーブルから直接データを読み取ることはありませんが、新しいレコードを受信します（ブロックごとに）、これにより異なる詳細レベルの複数のテーブルに書き込むことができます（集約とグループ化の有無で）。

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

パフォーマンスを向上させるため、受信したメッセージは[ max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)のサイズのブロックにグループ化されます。ブロックが[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)ミリ秒以内に形成されなかった場合、整合性に関係なくデータはテーブルにフラッシュされます。

トピックデータの受信を停止するか、変換ロジックを変更する場合は、マテリアライズビューを切り離します：

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更したい場合は、ターゲットテーブルとビューからのデータ間の不整合を避けるため、マテリアライズビューを無効にすることをお勧めします。

## 設定 {#configuration}

GraphiteMergeTreeに似て、KafkaエンジンはClickHouse設定ファイルを使った拡張設定をサポートしています。使用できる2つの設定キーがあります：グローバル（`<kafka>`の下）とトピックレベル（`<kafka><kafka_topic>` の下）。まずグローバル設定が適用され、その後にトピックレベルの設定が適用されます（存在する場合）。

``` xml
  <kafka>
    <!-- Kafkaエンジンタイプのすべてのテーブルに適用されるグローバル設定 -->
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

可能な設定オプションのリストについては、[librdkafkaの設定リファレンス](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)を参照してください。ClickHouseの設定では、ドットの代わりにアンダースコア(`_`)を使用します。例えば、`check.crcs=true`は`<check_crcs>true</check_crcs>`になります。

### Kerberosサポート {#kafka-kerberos-support}

Kerberosを認識したKafkaを扱うには、`security_protocol`子要素に`sasl_plaintext`値を追加します。Kerberosチケットを取得し、OSの機能によってキャッシュされているだけで済みます。
ClickHouseはkeytabファイルを使用してKerberos認証情報を管理できます。`sasl_kerberos_service_name`、`sasl_kerberos_keytab`、`sasl_kerberos_principal`子要素を考慮してください。

例：

``` xml
  <!-- Kerberosを認識したKafka -->
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

`kafka_handle_error_mode='stream'`の場合の追加仮想カラム：

- `_raw_message` - 正常にパースできなかった生メッセージ。データ型: `String`。
- `_error` - パース中に発生した例外メッセージ。データ型: `String`。

注意：副産物`_raw_message`と`_error`仮想カラムは、パース中に例外が発生した場合にのみ入力され、メッセージが正常にパースされた場合は常に空です。

## データフォーマットのサポート {#data-formats-support}

KafkaエンジンはClickHouseでサポートされているすべての[フォーマット](../../../interfaces/formats.md)をサポートしています。
1つのKafkaメッセージの行数は、フォーマットが行ベースかブロックベースかによって異なります：

- 行ベースのフォーマットでは、1つのKafkaメッセージに含まれる行数を`kafka_max_rows_per_message`を設定することによって制御できます。
- ブロックベースのフォーマットではブロックを小さな部分に分割することはできませんが、1つのブロックに含まれる行数は一般的な設定[ max_block_size](/operations/settings/settings#max_block_size)で制御できます。

## ClickHouse Keeperにコミットオフセットを保存するためのエンジン {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

`allow_experimental_kafka_offsets_storage_in_keeper`が有効な場合、Kafkaテーブルエンジンに2つの設定を指定することができます：
 - `kafka_keeper_path` はClickHouse Keeper内のテーブルへのパスを指定します。
 - `kafka_replica_name` はClickHouse Keeper内のレプリカ名を指定します。

これらの設定は両方とも指定するか、どちらも指定しない必要があります。両方が指定される場合、新しい実験的なKafkaエンジンが使用されます。この新しいエンジンは、コミットされたオフセットをKafkaに保存するのではなく、ClickHouse Keeperに保存します。新しいエンジンは、オフセットをKafkaにコミットしようとしますが、テーブルが作成されるときだけ、そのオフセットに依存します。その他の状況（テーブルが再起動されるか、エラーから復旧するなど）では、ClickHouse Keeperに保存されたオフセットがメッセージの消費を続けるために使用されます。コミットされたオフセットのほかに、最後のバッチで消費されたメッセージ数も保存されるため、挿入が失敗した場合は、同じ数のメッセージが消費され、必要に応じて重複除外が可能になります。

例：

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

また、ReplicatedMergeTreeと同様に`uuid`と`replica`マクロを利用することもできます：

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 既知の制限 {#known-limitations}

新しいエンジンは実験的なため、プロダクションにはまだ対応していません。実装にはいくつかの既知の制限があります：
 - 最大の制限は、エンジンが直接読み取りをサポートしていないことです。マテリアライズビューを使用してエンジンから読み取ることや、エンジンに書き込むことは可能ですが、直接読み取りはできません。その結果、すべての直接の`SELECT`クエリは失敗します。
 - テーブルを迅速に削除して再作成したり、同じClickHouse Keeperのパスを異なるエンジンに指定すると問題が発生する可能性があります。ベストプラクティスとして、`kafka_keeper_path`で`{uuid}`を使用して衝突するパスを避けることができます。
 - 再現可能な読み取りを行うには、1つのスレッドで複数のパーティションからメッセージを消費できません。対照的に、Kafkaコンシューマは定期的にポーリングして生存させる必要があります。これら2つの目的のため、`kafka_thread_per_consumer`が有効な場合にのみ、複数のコンシューマの作成を許可することにしました。そうでない場合、定期的にコンシューマをポーリングする際の問題を避けるのが非常に複雑になります。
 - 新しいストレージエンジンによって作成されたコンシューマは、[`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md)テーブルに表示されません。

**See Also**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
