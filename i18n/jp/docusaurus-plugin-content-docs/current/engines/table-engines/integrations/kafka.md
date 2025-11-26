---
description: 'Kafka テーブルエンジンは Apache Kafka と連携して動作し、データフローの公開／購読、フォールトトレラントなストレージの構成、ストリームが利用可能になり次第の処理を行うことができます。'
sidebar_label: 'Kafka'
sidebar_position: 110
slug: /engines/table-engines/integrations/kafka
title: 'Kafka テーブルエンジン'
keywords: ['Kafka', 'テーブルエンジン']
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Kafka テーブルエンジン

:::tip
ClickHouse Cloud をご利用の場合は、代わりに [ClickPipes](/integrations/clickpipes) の使用を推奨します。ClickPipes は、プライベートネットワーク接続をネイティブにサポートし、インジェスト処理量とクラスタリソースをそれぞれ独立してスケールさせることができ、さらに Kafka ストリーミングデータを ClickHouse に取り込むための包括的なモニタリングを提供します。
:::

- データフローを配信または購読する。
- 耐障害性のあるストレージを構成する。
- ストリームを、利用可能になり次第処理する。



## テーブルの作成

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

* `kafka_broker_list` — ブローカーのカンマ区切りリスト（例: `localhost:9092`）。
* `kafka_topic_list` — Kafka トピックのリスト。
* `kafka_group_name` — Kafka コンシューマーのグループ。読み取り位置はグループごとに個別に追跡されます。クラスター内でメッセージの重複を避けたい場合は、すべてのコンシューマーで同じグループ名を使用してください。
* `kafka_format` — メッセージ形式。SQL の `FORMAT` 関数と同じ表記を使用します（`JSONEachRow` など）。詳細については、[Formats](../../../interfaces/formats.md) セクションを参照してください。

オプションパラメータ:


* `kafka_security_protocol` - ブローカーとの通信に使用するプロトコル。指定可能な値: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`。
* `kafka_sasl_mechanism` - 認証に使用する SASL メカニズム。指定可能な値: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`。
* `kafka_sasl_username` - `PLAIN` および `SASL-SCRAM-..` メカニズムで使用する SASL ユーザー名。
* `kafka_sasl_password` - `PLAIN` および `SASL-SCRAM-..` メカニズムで使用する SASL パスワード。
* `kafka_schema` — フォーマットがスキーマ定義を必要とする場合に使用する必要があるパラメータ。例えば、[Cap&#39;n Proto](https://capnproto.org/) では、スキーマファイルへのパスと、ルート `schema.capnp:Message` オブジェクトの名前が必要です。
* `kafka_schema_registry_skip_bytes` — エンベロープヘッダー付きのスキーマレジストリを使用する場合に、各メッセージの先頭からスキップするバイト数 (例: 19 バイトのエンベロープを含む AWS Glue Schema Registry)。範囲: `[0, 255]`。デフォルト: `0`。
* `kafka_num_consumers` — テーブルあたりのコンシューマー数。1 つのコンシューマーのスループットが不足する場合は、コンシューマー数を増やします。コンシューマーの総数はトピック内のパーティション数を超えてはならず (1 パーティションにつき割り当てられるコンシューマーは 1 つだけのため)、さらに ClickHouse がデプロイされているサーバーの物理コア数を超えてはなりません。デフォルト: `1`。
* `kafka_max_block_size` — poll 時の最大バッチサイズ (メッセージ数)。デフォルト: [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size)。
* `kafka_skip_broken_messages` — 1 ブロックあたりのスキーマ非互換メッセージに対する Kafka メッセージパーサーの許容数。`kafka_skip_broken_messages = N` の場合、エンジンはパースできない Kafka メッセージを *N* 件スキップします (メッセージは 1 行のデータに相当)。デフォルト: `0`。
* `kafka_commit_every_batch` — ブロック全体を書き込んだ後に 1 回だけコミットする代わりに、取り込んで処理した各バッチを都度コミットします。デフォルト: `0`。
* `kafka_client_id` — クライアント識別子。デフォルト: 空文字列。
* `kafka_poll_timeout_ms` — Kafka からの 1 回の poll のタイムアウト。デフォルト: [stream&#95;poll&#95;timeout&#95;ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
* `kafka_poll_max_batch_size` — 1 回の Kafka poll で取得されるメッセージの最大件数。デフォルト: [max&#95;block&#95;size](/operations/settings/settings#max_block_size)。
* `kafka_flush_interval_ms` — Kafka からデータをフラッシュする際のタイムアウト。デフォルト: [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms)。
* `kafka_thread_per_consumer` — 各コンシューマーごとに独立したスレッドを割り当てます。有効にすると、各コンシューマーは独立して並列にデータをフラッシュします (無効な場合は、複数コンシューマーの行がまとめられて 1 つのブロックになります)。デフォルト: `0`。
* `kafka_handle_error_mode` — Kafka エンジンのエラー処理方法。指定可能な値: `default` (メッセージのパースに失敗した場合に例外をスロー)、`stream` (例外メッセージと生メッセージを仮想カラム `_error` および `_raw_message` に保存)、`dead&#95;letter&#95;queue` (エラー関連データを system.dead&#95;letter&#95;queue に保存)。
* `kafka_commit_on_select` — `SELECT` クエリが実行された際にメッセージをコミットします。デフォルト: `false`。
* `kafka_max_rows_per_message` — 行ベースフォーマットにおいて、1 つの Kafka メッセージに書き込まれる最大行数。デフォルト: `1`。
* `kafka_compression_codec` — メッセージ生成時に使用する圧縮コーデック。サポートされる値: 空文字列, `none`, `gzip`, `snappy`, `lz4`, `zstd`。空文字列の場合、テーブル側では圧縮コーデックが設定されず、設定ファイルの値、または `librdkafka` のデフォルト値が使用されます。デフォルト: 空文字列。
* `kafka_compression_level` — `kafka_compression_codec` で選択されたアルゴリズム用の圧縮レベルパラメータ。値を大きくすると、CPU 使用量が増加する代わりに圧縮率が向上します。使用可能な範囲はアルゴリズムに依存します: `gzip` は `[0-9]`、`lz4` は `[0-12]`、`snappy` は `0` のみ、`zstd` は `[0-12]`、`-1` はコーデック依存のデフォルト圧縮レベル。デフォルト: `-1`。

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
新規プロジェクトではこの方法を使用しないでください。可能であれば、既存プロジェクトは上記の方法に切り替えてください。
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
````

</details>

:::info
Kafkaテーブルエンジンは[デフォルト値](/sql-reference/statements/create/table#default_values)を持つカラムをサポートしていません。デフォルト値を持つカラムが必要な場合は、マテリアライズドビューレベルで追加できます(下記を参照)。
:::


## 説明

配信されたメッセージは自動的に追跡されるため、グループ内の各メッセージは 1 回だけカウントされます。同じデータを 2 回取得したい場合は、別のグループ名でテーブルのコピーを作成してください。

グループは柔軟で、クラスター内で同期されます。たとえば、10 個のトピックとクラスター内に 5 つのテーブルのコピーがある場合、各コピーは 2 個のトピックを受け取ります。コピー数が変化すると、トピックはコピー間で自動的に再分配されます。詳細については [http://kafka.apache.org/intro](http://kafka.apache.org/intro) を参照してください。

特にテストやステージングなど、トピックが動的に作成・削除される環境では、各 Kafka トピックに専用のコンシューマーグループを割り当て、トピックとグループの 1 対 1 の対応を保証することを推奨します。

`SELECT` は（デバッグ用途を除き）メッセージの読み取りにはあまり有用ではありません。各メッセージは 1 回しか読めないためです。マテリアライズドビューを用いてリアルタイムの処理スレッドを作成する方が実用的です。そのためには次を行います。

1. エンジンを使用して Kafka コンシューマーを作成し、それをデータストリームとみなします。
2. 必要なスキーマを持つテーブルを作成します。
3. エンジンからのデータを変換し、前の手順で作成したテーブルに書き込むマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに接続されると、バックグラウンドでデータの収集を開始します。これにより、Kafka から継続的にメッセージを受信し、`SELECT` を使って必要な形式に変換できます。
1 つの Kafka テーブルには、任意の数のマテリアライズドビューを作成できます。これらのマテリアライズドビューは Kafka テーブルから直接データを読み取るのではなく、新しいレコードを（ブロック単位で）受け取ります。この方法により、詳細レベルの異なる複数のテーブル（グルーピングによる集計あり／なし）に書き込むことができます。

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

パフォーマンスを向上させるため、受信したメッセージは [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size) のサイズのブロックにまとめられます。ブロックが [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms) ミリ秒以内に形成されなかった場合、ブロックが完全に埋まっているかどうかに関係なく、データはテーブルにフラッシュされます。

トピックデータの受信を停止する、または変換ロジックを変更するには、マテリアライズドビューを切り離します（DETACH します）:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER` を使用してターゲットテーブルを変更する場合は、ターゲットテーブルとビューからのデータとの不整合を避けるために、マテリアライズドビューを無効化することを推奨します。


## 設定

GraphiteMergeTree と同様に、Kafka エンジンは ClickHouse の設定ファイルを使用した詳細な設定をサポートしています。使用できる設定キーは 2 種類あり、グローバル（`<kafka>` の直下）とトピック単位（`<kafka><kafka_topic>` の直下）のものです。まずグローバル設定が適用され、その後にトピック単位の設定（存在する場合）が適用されます。

```xml
  <kafka>
    <!-- Kafkaエンジンタイプの全テーブルに対するグローバル設定オプション -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- コンシューマー設定 -->
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

    <!-- プロデューサー設定 -->
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

利用可能な設定オプションの一覧については、[librdkafka configuration reference](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) を参照してください。ClickHouse の設定では、ドットの代わりにアンダースコア（`_`）を使用します。たとえば、`check.crcs=true` は `<check_crcs>true</check_crcs>` になります。

### Kerberos サポート

Kerberos 対応の Kafka を扱うには、`security_protocol` の子要素として `sasl_plaintext` を追加します。Kerberos のチケットグラントチケット（TGT）が OS の機能によって取得・キャッシュされていれば十分です。
ClickHouse は keytab ファイルを使用して Kerberos 資格情報を維持できます。`sasl_kerberos_service_name`、`sasl_kerberos_keytab`、`sasl_kerberos_principal` の子要素を指定してください。

例:

```xml
<!-- Kerberos対応Kafka -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```


## 仮想カラム {#virtual-columns}

- `_topic` — Kafka トピック。データ型: `LowCardinality(String)`。
- `_key` — メッセージのキー。データ型: `String`。
- `_offset` — メッセージのオフセット。データ型: `UInt64`。
- `_timestamp` — メッセージのタイムスタンプ。データ型: `Nullable(DateTime)`。
- `_timestamp_ms` — メッセージのミリ秒単位のタイムスタンプ。データ型: `Nullable(DateTime64(3))`。
- `_partition` — Kafka トピックのパーティション。データ型: `UInt64`。
- `_headers.name` — メッセージヘッダーのキーの配列。データ型: `Array(String)`。
- `_headers.value` — メッセージヘッダーの値の配列。データ型: `Array(String)`。

`kafka_handle_error_mode='stream'` の場合に追加される仮想カラム:

- `_raw_message` - 正しくパースできなかった生のメッセージ。データ型: `String`。
- `_error` - パースに失敗した際に発生した例外メッセージ。データ型: `String`。

注意: `_raw_message` と `_error` の仮想カラムは、パース中に例外が発生した場合にのみ値が格納されます。メッセージが正常にパースされた場合は常に空になります。



## データフォーマットのサポート {#data-formats-support}

Kafka エンジンは、ClickHouse がサポートしているすべての[フォーマット](../../../interfaces/formats.md)に対応しています。
1 つの Kafka メッセージ内の行数は、フォーマットが行ベースかブロックベースかによって変わります。

- 行ベースのフォーマットの場合、1 つの Kafka メッセージ内の行数は、設定項目 `kafka_max_rows_per_message` によって制御できます。
- ブロックベースのフォーマットの場合、ブロックをそれより小さい単位に分割することはできませんが、1 つのブロック内の行数は、共通設定 [max_block_size](/operations/settings/settings#max_block_size) によって制御できます。



## ClickHouse Keeper にコミット済みオフセットを保存するエンジン

<ExperimentalBadge />

`allow_experimental_kafka_offsets_storage_in_keeper` が有効な場合は、Kafka テーブルエンジンに対して次の 2 つの設定を指定できます:

* `kafka_keeper_path` は ClickHouse Keeper 内のテーブルのパスを指定します
* `kafka_replica_name` は ClickHouse Keeper 内のレプリカ名を指定します

これら 2 つの設定は、両方とも指定するか、どちらも指定しないかのいずれかでなければなりません。両方を指定した場合、新しい実験的な Kafka テーブルエンジンが使用されます。この新しいエンジンは、コミット済みオフセットを Kafka に保存することには依存せず、代わりに ClickHouse Keeper に保存します。Kafka へのオフセットのコミットも引き続き試行しますが、そのオフセットに依存するのはテーブル作成時のみです。それ以外の状況（テーブルの再起動やエラーからの復旧など）では、ClickHouse Keeper に保存されたオフセットが、メッセージの消費を再開するためのオフセットとして使用されます。コミット済みオフセットに加えて、直近のバッチで消費されたメッセージ数も保存するため、INSERT が失敗した場合でも同じ数のメッセージが再度消費され、必要に応じて重複排除を可能にします。

Example:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 既知の制限事項

新しいエンジンは実験的なものであり、まだ本番環境に対応できる状態ではありません。実装にはいくつかの既知の制限があります。

* 最大の制限は、エンジンが直接読み取りをサポートしていないことです。マテリアライズドビューを使用したエンジンからの読み取りやエンジンへの書き込みは動作しますが、直接読み取りはできません。その結果、すべての直接の `SELECT` クエリは失敗します。
* テーブルを短い間隔で削除／再作成したり、同じ ClickHouse Keeper のパスを異なるエンジンに指定したりすると、問題を引き起こす可能性があります。ベストプラクティスとして、パスの衝突を避けるために `kafka_keeper_path` に `{uuid}` を使用できます。
* 再現可能な読み取りを実現するため、単一スレッドで複数パーティションからメッセージをコンシュームすることはできません。一方で、Kafka コンシューマは生かしておくために定期的にポーリングする必要があります。これら 2 つの要件の結果として、`kafka_thread_per_consumer` が有効な場合にのみ複数のコンシューマを作成できるようにしました。そうでない場合、コンシューマを定期的にポーリングすることに関する問題を回避するのがあまりに複雑になるためです。
* 新しいストレージエンジンによって作成されたコンシューマは、[`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md) テーブルには表示されません。

**関連項目**

* [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
* [background&#95;message&#95;broker&#95;schedule&#95;pool&#95;size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
* [system.kafka&#95;consumers](../../../operations/system-tables/kafka_consumers.md)
