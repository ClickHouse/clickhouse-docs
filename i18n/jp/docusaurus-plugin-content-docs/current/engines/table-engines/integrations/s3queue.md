---
description: 'このエンジンは Amazon S3 エコシステムとの統合を提供し、ストリーミングによるインポートを可能にします。Kafka エンジンや RabbitMQ エンジンと類似していますが、S3 固有の機能も備えています。'
sidebar_label: 'S3Queue'
sidebar_position: 181
slug: /engines/table-engines/integrations/s3queue
title: 'S3Queue テーブルエンジン'
doc_type: 'reference'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# S3Queue テーブルエンジン

このエンジンは [Amazon S3](https://aws.amazon.com/s3/) エコシステムとの統合を提供し、ストリーミングによるインポートを可能にします。このエンジンは [Kafka](../../../engines/table-engines/integrations/kafka.md)、[RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md) エンジンに似ていますが、S3 固有の機能を備えています。

[S3Queue 実装の元となった PR](https://github.com/ClickHouse/ClickHouse/pull/49086/files#diff-e1106769c9c8fbe48dd84f18310ef1a250f2c248800fde97586b3104e9cd6af8R183) にある次の注意事項を理解しておくことが重要です。`MATERIALIZED VIEW` がこのエンジンに紐付けられると、S3Queue テーブルエンジンはバックグラウンドでデータの収集を開始します。



## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE s3_queue_engine_table (name String, value UInt32)
    ENGINE = S3Queue(path, [NOSIGN, | aws_access_key_id, aws_secret_access_key,] format, [compression], [headers])
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    [loading_retries = 0,]
    [processing_threads_num = 16,]
    [parallel_inserts = false,]
    [enable_logging_to_queue_log = true,]
    [last_processed_path = "",]
    [tracked_files_limit = 1000,]
    [tracked_file_ttl_sec = 0,]
    [polling_min_timeout_ms = 1000,]
    [polling_max_timeout_ms = 10000,]
    [polling_backoff_ms = 0,]
    [cleanup_interval_min_ms = 10000,]
    [cleanup_interval_max_ms = 30000,]
    [buckets = 0,]
    [list_objects_batch_size = 1000,]
    [enable_hash_ring_filtering = 0,]
    [max_processed_files_before_commit = 100,]
    [max_processed_rows_before_commit = 0,]
    [max_processed_bytes_before_commit = 0,]
    [max_processing_time_sec_before_commit = 0,]
```

:::warning
`24.7`より前では、`mode`、`after_processing`、`keeper_path`以外のすべての設定に`s3queue_`プレフィックスを使用する必要があります。
:::

**エンジンパラメータ**

`S3Queue`のパラメータは`S3`テーブルエンジンがサポートするものと同じです。パラメータセクションは[こちら](../../../engines/table-engines/integrations/s3.md#parameters)を参照してください。

**例**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

名前付きコレクションの使用:

```xml
<clickhouse>
    <named_collections>
        <s3queue_conf>
            <url>'https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
        </s3queue_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue(s3queue_conf, format = 'CSV', compression_method = 'gzip')
SETTINGS
    mode = 'ordered';
```


## 設定 {#settings}

テーブルに設定された設定のリストを取得するには、`system.s3_queue_settings`テーブルを使用します。`24.10`から利用可能です。

### モード {#mode}

指定可能な値:

- unordered — 順序なしモードでは、すでに処理されたすべてのファイルのセットがZooKeeper内の永続ノードで追跡されます。
- ordered — 順序ありモードでは、ファイルは辞書順で処理されます。これは、'BBB'という名前のファイルがある時点で処理され、その後'AA'という名前のファイルがバケットに追加された場合、それは無視されることを意味します。正常に処理されたファイルの最大名(辞書順)と、読み込み失敗後に再試行されるファイルの名前のみがZooKeeperに保存されます。

デフォルト値: 24.6より前のバージョンでは`ordered`。24.6以降はデフォルト値がなく、手動で指定する必要があります。以前のバージョンで作成されたテーブルについては、互換性のためデフォルト値は`Ordered`のままとなります。

### `after_processing` {#after_processing}

処理が正常に完了した後、ファイルを削除するか保持するかを指定します。
指定可能な値:

- keep。
- delete。

デフォルト値: `keep`。

### `keeper_path` {#keeper_path}

ZooKeeper内のパスは、テーブルエンジンの設定として指定するか、グローバル設定で提供されるパスとテーブルUUIDから形成されるデフォルトパスを使用できます。
指定可能な値:

- 文字列。

デフォルト値: `/`。

### `s3queue_loading_retries` {#loading_retries}

指定された回数までファイルの読み込みを再試行します。デフォルトでは再試行は行われません。
指定可能な値:

- 正の整数。

デフォルト値: `0`。

### `s3queue_processing_threads_num` {#processing_threads_num}

処理を実行するスレッド数。`Unordered`モードにのみ適用されます。

デフォルト値: CPUの数または16。

### `s3queue_parallel_inserts` {#parallel_inserts}

デフォルトでは、`processing_threads_num`は1つの`INSERT`を生成するため、複数のスレッドでファイルのダウンロードと解析のみを行います。
しかし、これは並列性を制限するため、より高いスループットを得るには`parallel_inserts=true`を使用してください。これによりデータを並列に挿入できます(ただし、MergeTreeファミリーでは生成されるデータパーツの数が増加することに注意してください)。

:::note
`INSERT`は`max_process*_before_commit`設定に従って生成されます。
:::

デフォルト値: `false`。

### `s3queue_enable_logging_to_s3queue_log` {#enable_logging_to_s3queue_log}

`system.s3queue_log`へのログ記録を有効にします。

デフォルト値: `0`。

### `s3queue_polling_min_timeout_ms` {#polling_min_timeout_ms}

次のポーリング試行を行う前にClickHouseが待機する最小時間をミリ秒単位で指定します。

指定可能な値:

- 正の整数。

デフォルト値: `1000`。

### `s3queue_polling_max_timeout_ms` {#polling_max_timeout_ms}

次のポーリング試行を開始する前にClickHouseが待機する最大時間をミリ秒単位で定義します。

指定可能な値:

- 正の整数。

デフォルト値: `10000`。

### `s3queue_polling_backoff_ms` {#polling_backoff_ms}

新しいファイルが見つからない場合に、前回のポーリング間隔に追加される待機時間を決定します。次のポーリングは、前回の間隔とこのバックオフ値の合計、または最大間隔のいずれか小さい方の後に実行されます。

指定可能な値:

- 正の整数。

デフォルト値: `0`。

### `s3queue_tracked_files_limit` {#tracked_files_limit}

'unordered'モードが使用されている場合にZooKeeperノードの数を制限できます。'ordered'モードでは何も行いません。
制限に達すると、最も古い処理済みファイルがZooKeeperノードから削除され、再度処理されます。

指定可能な値:

- 正の整数。

デフォルト値: `1000`。

### `s3queue_tracked_file_ttl_sec` {#tracked_file_ttl_sec}

'unordered'モードにおいて、処理済みファイルをZooKeeperノードに保存する最大秒数(デフォルトでは永続的に保存)。'ordered'モードでは何も行いません。
指定された秒数が経過すると、ファイルは再インポートされます。

指定可能な値:

- 正の整数。

デフォルト値: `0`。

### `s3queue_cleanup_interval_min_ms` {#cleanup_interval_min_ms}

'Ordered'モード用。追跡ファイルのTTLと最大追跡ファイルセットの維持を担当するバックグラウンドタスクの再スケジュール間隔の最小境界を定義します。

デフォルト値: `10000`。

### `s3queue_cleanup_interval_max_ms` {#cleanup_interval_max_ms}


'Ordered'モード用。追跡ファイルのTTLと追跡ファイル数の上限を管理するバックグラウンドタスクの再スケジュール間隔の最大値を定義します。

デフォルト値: `30000`。

### `s3queue_buckets` {#buckets}

'Ordered'モード用。`24.6`以降で利用可能。S3Queueテーブルの複数のレプリカが存在し、それぞれがkeeperの同じメタデータディレクトリで動作している場合、`s3queue_buckets`の値は少なくともレプリカ数以上である必要があります。`s3queue_processing_threads`設定も併用する場合は、`s3queue_buckets`設定の値をさらに増やすことが推奨されます。これは`S3Queue`処理の実際の並列度を定義するためです。

### `use_persistent_processing_nodes` {#use_persistent_processing_nodes}

デフォルトでは、S3Queueテーブルは常にエフェメラル処理ノードを使用しています。これにより、S3Queueが処理を開始した後、処理済みファイルをzookeeperにコミットする前にzookeeperセッションが期限切れになった場合、データの重複が発生する可能性があります。この設定により、keeperセッションが期限切れになった場合でも重複の可能性を排除します。

### `persistent_processing_nodes_ttl_seconds` {#persistent_processing_nodes_ttl_seconds}

サーバーが正常終了しなかった場合、`use_persistent_processing_nodes`が有効になっていると、削除されていない処理ノードが残る可能性があります。この設定は、これらの処理ノードを安全にクリーンアップできる期間を定義します。

デフォルト値: `3600`(1時間)。


## S3関連の設定 {#s3-settings}

このエンジンはすべてのS3関連設定をサポートしています。S3設定の詳細については、[こちら](../../../engines/table-engines/integrations/s3.md)を参照してください。


## S3ロールベースアクセス {#s3-role-based-access}

<ScalePlanFeatureBadge feature='S3 Role-Based Access' />

s3Queueテーブルエンジンは、ロールベースアクセスをサポートしています。
バケットへのアクセスに必要なロールの設定手順については、[こちら](/cloud/data-sources/secure-s3)のドキュメントを参照してください。

ロールの設定が完了したら、以下のように`extra_credentials`パラメータを使用して`roleARN`を指定できます:

```sql
CREATE TABLE s3_table
(
    ts DateTime,
    value UInt64
)
ENGINE = S3Queue(
                'https://<your_bucket>/*.csv',
                extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/<your_role>')
                ,'CSV')
SETTINGS
    ...
```


## S3Queue順序付きモード {#ordered-mode}

`S3Queue`処理モードでは、ZooKeeper内に保存するメタデータを削減できますが、時間的に後から追加されるファイルは、アルファベット順で大きい名前を持つ必要があるという制限があります。

`S3Queue`の`ordered`モードは、`unordered`モードと同様に、`(s3queue_)processing_threads_num`設定(`s3queue_`プレフィックスは省略可能)をサポートしており、サーバー上でローカルに`S3`ファイルを処理するスレッド数を制御できます。

さらに、`ordered`モードでは`(s3queue_)buckets`という別の設定が導入されており、これは「論理スレッド」を意味します。分散環境において、複数のサーバーに`S3Queue`テーブルのレプリカが存在する場合、この設定が処理単位の数を定義します。例えば、各`S3Queue`レプリカ上の各処理スレッドは、処理のために特定の`bucket`をロックしようとし、各`bucket`はファイル名のハッシュによって特定のファイルに割り当てられます。したがって、分散環境では、`(s3queue_)buckets`設定をレプリカ数以上に設定することを強く推奨します。バケット数がレプリカ数より多くても問題ありません。最も最適なシナリオは、`(s3queue_)buckets`設定を`number_of_replicas`と`(s3queue_)processing_threads_num`の積に等しくすることです。

`(s3queue_)processing_threads_num`設定は、バージョン`24.6`より前での使用は推奨されません。

`(s3queue_)buckets`設定は、バージョン`24.6`以降で利用可能です。


## Description {#description}

`SELECT`はストリーミングインポートにはあまり有用ではありません(デバッグを除く)。各ファイルは一度しかインポートできないためです。[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用してリアルタイム処理を作成する方が実用的です。これを行うには:

1.  エンジンを使用してS3の指定されたパスからデータを取得するテーブルを作成し、それをデータストリームとして扱います。
2.  必要な構造を持つテーブルを作成します。
3.  エンジンからデータを変換し、事前に作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続されると、バックグラウンドでデータの収集が開始されます。

例:

```sql
  CREATE TABLE s3queue_engine_table (name String, value UInt32)
    ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
    SETTINGS
        mode = 'unordered';

  CREATE TABLE stats (name String, value UInt32)
    ENGINE = MergeTree() ORDER BY name;

  CREATE MATERIALIZED VIEW consumer TO stats
    AS SELECT name, value FROM s3queue_engine_table;

  SELECT * FROM stats ORDER BY name;
```


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。
- `_file` — ファイル名。
- `_size` — ファイルのサイズ。
- `_time` — ファイルの作成時刻。

仮想カラムの詳細については、[こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns)を参照してください。


## パス内のワイルドカード {#wildcards-in-path}

`path` 引数では、bashライクなワイルドカードを使用して複数のファイルを指定できます。処理されるファイルは存在し、パスパターン全体に一致している必要があります。ファイルのリストは `SELECT` 実行時に決定されます(`CREATE` 時ではありません)。

- `*` — `/` を除く任意の文字を任意の数(空文字列を含む)にマッチします。
- `**` — `/` を含む任意の文字を任意の数(空文字列を含む)にマッチします。
- `?` — 任意の1文字にマッチします。
- `{some_string,another_string,yet_another_one}` — `'some_string'`、`'another_string'`、`'yet_another_one'` のいずれかの文字列にマッチします。
- `{N..M}` — N から M までの範囲内の任意の数値にマッチします(両端を含む)。N と M は先頭にゼロを含むことができます(例: `000..078`)。

`{}` を使用した構文は、[remote](../../../sql-reference/table-functions/remote.md) テーブル関数と同様です。


## 制限事項 {#limitations}

1. 重複行は以下の理由により発生する可能性があります:

- ファイル処理の途中で解析中に例外が発生し、`s3queue_loading_retries`による再試行が有効になっている場合;

- `S3Queue`が複数のサーバーでZooKeeperの同じパスを指すように設定されており、あるサーバーが処理済みファイルのコミットを完了する前にKeeperセッションが期限切れになった場合、別のサーバーがそのファイルの処理を引き継ぐ可能性があります。このファイルは最初のサーバーによって部分的または完全に処理されている可能性があります。ただし、`use_persistent_processing_nodes = 1`の場合、バージョン25.8以降ではこの問題は発生しません;

- サーバーの異常終了。

2. `S3Queue`が複数のサーバーでZooKeeperの同じパスを指すように設定されており、`Ordered`モードが使用されている場合、`s3queue_loading_retries`は機能しません。この問題は近日中に修正される予定です。


## イントロスペクション {#introspection}

イントロスペクションには、`system.s3queue`ステートレステーブルと`system.s3queue_log`永続テーブルを使用します。

1. `system.s3queue`。このテーブルは永続化されず、`S3Queue`のインメモリ状態を表示します。現在処理中のファイル、処理済みまたは失敗したファイルを示します。

```sql
┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE system.s3queue
(
    `database` String,
    `table` String,
    `file_name` String,
    `rows_processed` UInt64,
    `status` String,
    `processing_start_time` Nullable(DateTime),
    `processing_end_time` Nullable(DateTime),
    `ProfileEvents` Map(String, UInt64)
    `exception` String
)
ENGINE = SystemS3Queue
COMMENT 'S3Queueメタデータのインメモリ状態とファイルごとの現在処理中の行数を含みます。' │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

例:

```sql

SELECT *
FROM system.s3queue

Row 1:
──────
zookeeper_path:        /clickhouse/s3queue/25ea5621-ae8c-40c7-96d0-cec959c5ab88/3b3f66a1-9866-4c2e-ba78-b6bfa154207e
file_name:             wikistat/original/pageviews-20150501-030000.gz
rows_processed:        5068534
status:                Processed
processing_start_time: 2023-10-13 13:09:48
processing_end_time:   2023-10-13 13:10:31
ProfileEvents:         {'ZooKeeperTransactions':3,'ZooKeeperGet':2,'ZooKeeperMulti':1,'SelectedRows':5068534,'SelectedBytes':198132283,'ContextLock':1,'S3QueueSetFileProcessingMicroseconds':2480,'S3QueueSetFileProcessedMicroseconds':9985,'S3QueuePullMicroseconds':273776,'LogTest':17}
exception:
```

2. `system.s3queue_log`。永続テーブル。`system.s3queue`と同じ情報を持ちますが、`processed`および`failed`ファイルに関するものです。

このテーブルは以下の構造を持ちます:

```sql
SHOW CREATE TABLE system.s3queue_log

Query id: 0ad619c3-0f2a-4ee4-8b40-c73d86e04314

┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE system.s3queue_log
(
    `event_date` Date,
    `event_time` DateTime,
    `table_uuid` String,
    `file_name` String,
    `rows_processed` UInt64,
    `status` Enum8('Processed' = 0, 'Failed' = 1),
    `processing_start_time` Nullable(DateTime),
    `processing_end_time` Nullable(DateTime),
    `ProfileEvents` Map(String, UInt64),
    `exception` String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

`system.s3queue_log`を使用するには、サーバー設定ファイルでその設定を定義します:

```xml
    <s3queue_log>
        <database>system</database>
        <table>s3queue_log</table>
    </s3queue_log>
```

例:

```sql
SELECT *
FROM system.s3queue_log

Row 1:
──────
event_date:            2023-10-13
event_time:            2023-10-13 13:10:12
table_uuid:
file_name:             wikistat/original/pageviews-20150501-020000.gz
rows_processed:        5112621
status:                Processed
processing_start_time: 2023-10-13 13:09:48
processing_end_time:   2023-10-13 13:10:12
ProfileEvents:         {'ZooKeeperTransactions':3,'ZooKeeperGet':2,'ZooKeeperMulti':1,'SelectedRows':5112621,'SelectedBytes':198577687,'ContextLock':1,'S3QueueSetFileProcessingMicroseconds':1934,'S3QueueSetFileProcessedMicroseconds':17063,'S3QueuePullMicroseconds':5841972,'LogTest':17}
exception:
```
