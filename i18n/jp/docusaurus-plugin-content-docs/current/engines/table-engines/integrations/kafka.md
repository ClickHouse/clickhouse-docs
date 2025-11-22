---
description: 'Kafka テーブルエンジンは Apache Kafka と連携して動作し、データフローの公開・購読、フォールトトレラントなストレージの構成、ストリームの到着に応じた処理を可能にします。'
sidebar_label: 'Kafka'
sidebar_position: 110
slug: /engines/table-engines/integrations/kafka
title: 'Kafka テーブルエンジン'
keywords: ['Kafka', 'table engine']
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Kafka テーブルエンジン

:::tip
ClickHouse Cloud をご利用の場合は、代わりに [ClickPipes](/integrations/clickpipes) の使用を推奨します。ClickPipes は、プライベートネットワーク接続のネイティブサポート、データ取り込み処理とクラスタリソースの独立したスケーリング、さらに Kafka から ClickHouse へのストリーミングデータに対する包括的な監視機能を提供します。
:::

- データフローの公開または購読を行う。
- 耐障害性のあるストレージを構成する。
- ストリームを利用可能になり次第処理する。



## テーブルの作成 {#creating-a-table}

```sql
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
    [kafka_security_protocol = '',]
    [kafka_sasl_mechanism = '',]
    [kafka_sasl_username = '',]
    [kafka_sasl_password = '',]
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
    [kafka_max_rows_per_message = 1,]
    [kafka_compression_codec = '',]
    [kafka_compression_level = -1];
```

必須パラメータ:

- `kafka_broker_list` — ブローカーのカンマ区切りリスト（例: `localhost:9092`）。
- `kafka_topic_list` — Kafkaトピックのリスト。
- `kafka_group_name` — Kafkaコンシューマーグループ。読み取り位置は各グループごとに個別に追跡されます。クラスタ内でメッセージが重複しないようにするには、すべての箇所で同じグループ名を使用してください。
- `kafka_format` — メッセージフォーマット。`JSONEachRow`などのSQL `FORMAT`関数と同じ表記法を使用します。詳細については、[フォーマット](../../../interfaces/formats.md)セクションを参照してください。

オプションパラメータ:


* `kafka_security_protocol` - ブローカーとの通信に使用するプロトコル。指定可能な値: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`。
* `kafka_sasl_mechanism` - 認証に使用する SASL メカニズム。指定可能な値: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`。
* `kafka_sasl_username` - `PLAIN` および `SASL-SCRAM-..` メカニズムで使用する SASL ユーザー名。
* `kafka_sasl_password` - `PLAIN` および `SASL-SCRAM-..` メカニズムで使用する SASL パスワード。
* `kafka_schema` — フォーマットがスキーマ定義を必要とする場合に指定しなければならないパラメータ。たとえば [Cap&#39;n Proto](https://capnproto.org/) では、スキーマファイルへのパスと、ルート `schema.capnp:Message` オブジェクトの名前が必要です。
* `kafka_schema_registry_skip_bytes` — エンベロープヘッダー付きのスキーマレジストリを使用する場合に、各メッセージの先頭からスキップするバイト数 (例: 19 バイトのエンベロープを含む AWS Glue Schema Registry)。範囲: `[0, 255]`。デフォルト: `0`。
* `kafka_num_consumers` — テーブルあたりのコンシューマー数。1 つのコンシューマーのスループットが不十分な場合は、より多くのコンシューマーを指定します。トピック内のパーティション数を超えてコンシューマーを増やすべきではありません。各パーティションには 1 つのコンシューマーしか割り当てられず、また ClickHouse がデプロイされているサーバー上の物理コア数を超えてはなりません。デフォルト: `1`。
* `kafka_max_block_size` — poll 時の最大バッチサイズ (メッセージ数)。デフォルト: [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size)。
* `kafka_skip_broken_messages` — ブロックあたりのスキーマ非互換メッセージに対する Kafka メッセージパーサーの許容度。`kafka_skip_broken_messages = N` の場合、エンジンはパースできない Kafka メッセージを *N* 件スキップします (メッセージは 1 行のデータに相当)。デフォルト: `0`。
* `kafka_commit_every_batch` — ブロック全体を書き込んだ後に 1 回だけコミットするのではなく、消費および処理された各バッチをコミットします。デフォルト: `0`。
* `kafka_client_id` — クライアント識別子。デフォルトは空。
* `kafka_poll_timeout_ms` — Kafka から単一の poll を行う際のタイムアウト。デフォルト: [stream&#95;poll&#95;timeout&#95;ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
* `kafka_poll_max_batch_size` — 1 回の Kafka poll で取得されるメッセージの最大数。デフォルト: [max&#95;block&#95;size](/operations/settings/settings#max_block_size)。
* `kafka_flush_interval_ms` — Kafka からデータをフラッシュするタイムアウト。デフォルト: [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms)。
* `kafka_thread_per_consumer` — 各コンシューマーごとに独立したスレッドを割り当てます。有効な場合、各コンシューマーはデータを独立して並列にフラッシュします (無効な場合は、複数コンシューマーからの行が 1 つのブロックにまとめられます)。デフォルト: `0`。
* `kafka_handle_error_mode` — Kafka エンジンにおけるエラー処理方法。指定可能な値: default (メッセージのパースに失敗した場合に例外をスロー)、stream (例外メッセージと生メッセージを仮想カラム `_error` および `_raw_message` に保存)、dead&#95;letter&#95;queue (エラー関連データを system.dead&#95;letter&#95;queue に保存)。
* `kafka_commit_on_select` — SELECT クエリが実行されたときにメッセージをコミットします。デフォルト: `false`。
* `kafka_max_rows_per_message` — 行ベースフォーマットにおいて、1 つの Kafka メッセージに書き込まれる最大行数。デフォルト: `1`。
* `kafka_compression_codec` — メッセージ生成に使用する圧縮コーデック。サポートされる値: 空文字列, `none`, `gzip`, `snappy`, `lz4`, `zstd`。空文字列の場合、テーブル側では圧縮コーデックを設定せず、設定ファイルで指定された値、または `librdkafka` のデフォルト値が使用されます。デフォルト: 空文字列。
* `kafka_compression_level` — `kafka_compression_codec` で選択されたアルゴリズム向けの圧縮レベルパラメータ。値が大きいほど CPU 使用量の増加と引き換えに圧縮率が向上します。使用可能な範囲はアルゴリズムに依存します: `gzip` は `[0-9]`; `lz4` は `[0-12]`; `snappy` は `0` のみ; `zstd` は `[0-12]`; `-1` = コーデック依存のデフォルト圧縮レベル。デフォルト: `-1`。

Examples:

```sql
  CREATE TABLE queue (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

  SELECT * FROM queue LIMIT 5;
```


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

````

<details markdown="1">

<summary>非推奨のテーブル作成方法</summary>

:::note
新規プロジェクトではこの方法を使用しないでください。可能であれば、既存のプロジェクトを上記の方法に切り替えてください。
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
````

</details>

:::info
Kafkaテーブルエンジンは[デフォルト値](/sql-reference/statements/create/table#default_values)を持つカラムをサポートしていません。デフォルト値を持つカラムが必要な場合は、マテリアライズドビューレベルで追加できます（下記を参照）。
:::


## Description {#description}

配信されたメッセージは自動的に追跡されるため、グループ内の各メッセージは一度だけカウントされます。データを二重に取得したい場合は、別のグループ名でテーブルのコピーを作成してください。

グループは柔軟性があり、クラスタ上で同期されます。例えば、クラスタ内に10個のトピックと5つのテーブルコピーがある場合、各コピーは2つのトピックを受け取ります。コピー数が変更されると、トピックは自動的にコピー間で再分配されます。詳細については http://kafka.apache.org/intro を参照してください。

各Kafkaトピックには専用のコンシューマグループを持たせることを推奨します。これにより、トピックとグループ間の排他的なペアリングが保証されます。特に、トピックが動的に作成・削除される環境(テストやステージング環境など)では重要です。

`SELECT`はメッセージの読み取りにはあまり有用ではありません(デバッグを除く)。各メッセージは一度しか読み取れないためです。マテリアライズドビューを使用してリアルタイムスレッドを作成する方が実用的です。これを行うには:

1.  エンジンを使用してKafkaコンシューマを作成し、それをデータストリームとして扱います。
2.  必要な構造を持つテーブルを作成します。
3.  エンジンからデータを変換し、事前に作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに結合されると、バックグラウンドでデータの収集が開始されます。これにより、Kafkaからメッセージを継続的に受信し、`SELECT`を使用して必要な形式に変換できます。
1つのkafkaテーブルには任意の数のマテリアライズドビューを持たせることができます。これらはkafkaテーブルから直接データを読み取るのではなく、新しいレコードを(ブロック単位で)受信します。この方法により、異なる詳細レベル(グループ化・集計ありまたはなし)で複数のテーブルに書き込むことができます。

例:

```sql
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
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() AS total
    FROM queue GROUP BY day, level;

  SELECT level, sum(total) FROM daily GROUP BY level;
```

パフォーマンスを向上させるため、受信したメッセージは[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)のサイズのブロックにグループ化されます。[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)ミリ秒以内にブロックが形成されなかった場合、ブロックの完全性に関わらずデータはテーブルにフラッシュされます。

トピックデータの受信を停止する、または変換ロジックを変更するには、マテリアライズドビューをデタッチします:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更する場合は、ターゲットテーブルとビューからのデータ間の不整合を避けるため、マテリアライズドビューを無効にすることを推奨します。


## 設定 {#configuration}

GraphiteMergeTreeと同様に、KafkaエンジンはClickHouse設定ファイルを使用した拡張設定をサポートしています。使用できる設定キーは2つあります:グローバル設定(`<kafka>`配下)とトピックレベル設定(`<kafka><kafka_topic>`配下)です。グローバル設定が最初に適用され、その後トピックレベル設定が(存在する場合)適用されます。

```xml
  <kafka>
    <!-- Kafkaエンジンタイプのすべてのテーブルに対するグローバル設定オプション -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- コンシューマーの設定 -->
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

    <!-- プロデューサーの設定 -->
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

設定可能なオプションの一覧については、[librdkafka設定リファレンス](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)を参照してください。ClickHouse設定ではドットの代わりにアンダースコア(`_`)を使用します。例えば、`check.crcs=true`は`<check_crcs>true</check_crcs>`になります。

### Kerberosサポート {#kafka-kerberos-support}

Kerberos対応のKafkaを扱うには、`security_protocol`子要素に`sasl_plaintext`値を追加します。KerberosチケットグランティングチケットがOS機能によって取得およびキャッシュされていれば十分です。
ClickHouseはkeytabファイルを使用してKerberos認証情報を維持することができます。`sasl_kerberos_service_name`、`sasl_kerberos_keytab`、`sasl_kerberos_principal`の各子要素を使用してください。

例:

```xml
<!-- Kerberos対応のKafka -->
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
- `_timestamp_ms` — メッセージのタイムスタンプ(ミリ秒単位)。データ型: `Nullable(DateTime64(3))`。
- `_partition` — Kafkaトピックのパーティション。データ型: `UInt64`。
- `_headers.name` — メッセージヘッダーのキーの配列。データ型: `Array(String)`。
- `_headers.value` — メッセージヘッダーの値の配列。データ型: `Array(String)`。

`kafka_handle_error_mode='stream'`の場合の追加の仮想カラム:

- `_raw_message` - 正常に解析できなかった生メッセージ。データ型: `String`。
- `_error` - 解析失敗時に発生した例外メッセージ。データ型: `String`。

注意: `_raw_message`と`_error`の仮想カラムは、解析中に例外が発生した場合にのみ値が設定されます。メッセージが正常に解析された場合は常に空です。


## データフォーマットのサポート {#data-formats-support}

KafkaエンジンはClickHouseでサポートされているすべての[フォーマット](../../../interfaces/formats.md)に対応しています。
1つのKafkaメッセージに含まれる行数は、フォーマットが行ベースかブロックベースかによって異なります:

- 行ベースフォーマットの場合、1つのKafkaメッセージに含まれる行数は`kafka_max_rows_per_message`設定で制御できます。
- ブロックベースフォーマットの場合、ブロックをより小さな部分に分割することはできませんが、1つのブロックに含まれる行数は汎用設定[max_block_size](/operations/settings/settings#max_block_size)で制御できます。


## ClickHouse Keeperにコミット済みオフセットを保存するエンジン {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge />

`allow_experimental_kafka_offsets_storage_in_keeper`が有効な場合、Kafkaテーブルエンジンに以下の2つの設定を追加で指定できます:

- `kafka_keeper_path` ClickHouse Keeper内のテーブルへのパスを指定します
- `kafka_replica_name` ClickHouse Keeper内のレプリカ名を指定します

これらの設定は両方を指定するか、どちらも指定しないかのいずれかである必要があります。両方が指定された場合、新しい実験的なKafkaエンジンが使用されます。この新しいエンジンは、コミット済みオフセットをKafkaに保存することに依存せず、ClickHouse Keeperに保存します。オフセットのKafkaへのコミットは引き続き試行されますが、それらのオフセットに依存するのはテーブル作成時のみです。その他の状況(テーブルの再起動時やエラー後の復旧時など)では、ClickHouse Keeperに保存されたオフセットがメッセージ消費を継続するためのオフセットとして使用されます。コミット済みオフセットに加えて、最後のバッチで消費されたメッセージ数も保存されるため、挿入が失敗した場合でも同じ数のメッセージが消費され、必要に応じて重複排除が可能になります。

例:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 既知の制限事項 {#known-limitations}

新しいエンジンは実験的なものであるため、まだ本番環境での使用には対応していません。実装には以下のいくつかの既知の制限事項があります:

- 最大の制限事項は、このエンジンが直接読み取りをサポートしていないことです。マテリアライズドビューを使用したエンジンからの読み取りとエンジンへの書き込みは機能しますが、直接読み取りは機能しません。その結果、すべての直接的な`SELECT`クエリは失敗します。
- テーブルを頻繁に削除して再作成したり、異なるエンジンに同じClickHouse Keeperパスを指定したりすると、問題が発生する可能性があります。ベストプラクティスとして、`kafka_keeper_path`に`{uuid}`を使用することで、パスの衝突を回避できます。
- 反復可能な読み取りを実現するために、単一のスレッドで複数のパーティションからメッセージを消費することはできません。一方で、Kafkaコンシューマーは生存状態を維持するために定期的にポーリングする必要があります。これら2つの要件の結果として、`kafka_thread_per_consumer`が有効な場合にのみ複数のコンシューマーの作成を許可することにしました。そうでない場合、コンシューマーを定期的にポーリングすることに関する問題を回避するのが複雑すぎるためです。
- 新しいストレージエンジンによって作成されたコンシューマーは、[`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md)テーブルに表示されません。

**関連項目**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
