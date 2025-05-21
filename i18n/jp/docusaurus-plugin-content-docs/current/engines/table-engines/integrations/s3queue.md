---
description: 'このエンジンはAmazon S3エコシステムとの統合を提供し、ストリーミングインポートを可能にします。KafkaおよびRabbitMQエンジンに似ていますが、S3特有の機能を提供します。'
sidebar_label: 'S3Queue'
sidebar_position: 181
slug: /engines/table-engines/integrations/s3queue
title: 'S3Queue テーブルエンジン'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# S3Queue テーブルエンジン

このエンジンは [Amazon S3](https://aws.amazon.com/s3/) エコシステムとの統合を提供し、ストリーミングインポートを可能にします。このエンジンは、[Kafka](../../../engines/table-engines/integrations/kafka.md)や[RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md)エンジンに似ていますが、S3特有の機能を提供します。

## テーブル作成 {#creating-a-table}

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
`24.7` より前は、`mode`、`after_processing`、`keeper_path` 以外のすべての設定には `s3queue_` プレフィックスを使用する必要があります。
:::

**エンジンパラメータ**

`S3Queue` のパラメータは `S3` テーブルエンジンがサポートするものと同じです。パラメータのセクションは [こちら](../../../engines/table-engines/integrations/s3.md#parameters) をご覧ください。

**例**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

名前付きコレクションを使用する場合:

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

テーブルに設定されている設定のリストを取得するには、`system.s3_queue_settings` テーブルを使用します。`24.10` から利用可能です。

### mode {#mode}

可能な値:

- unordered — 無秩序モードでは、すでに処理されたファイルのセットがZooKeeper内の永続ノードで追跡されます。
- ordered — 順序モードでは、ファイルは辞書順に処理されます。つまり、例えば、'BBB' という名前のファイルがある時点で処理され、その後'AA'という名前のファイルがバケットに追加されると、それは無視されます。正常に消費されたファイルの最大名（辞書順で）と、失敗した読み込み試行後に再試行されるファイル名のみがZooKeeperに保存されます。

デフォルト値: `ordered`（バージョン24.6以前）。24.6以降はデフォルト値はなくなり、手動で指定する必要があります。以前のバージョンで作成されたテーブルのデフォルト値は、互換性のために `Ordered` のままです。

### after_processing {#after_processing}

成功した処理の後にファイルを削除または保持します。
可能な値:

- keep.
- delete.

デフォルト値: `keep`.

### keeper_path {#keeper_path}

ZooKeeper内のパスは、テーブルエンジンの設定として指定するか、グローバル設定で指定されたパスとテーブルUUIDからデフォルトパスが形成されます。
可能な値:

- String.

デフォルト値: `/`.

### s3queue_loading_retries {#loading_retries}

指定された回数までファイルの読み込みを再試行します。デフォルトでは再試行はありません。
可能な値:

- 正の整数.

デフォルト値: `0`.

### s3queue_processing_threads_num {#processing_threads_num}

処理を実行するスレッドの数。`Unordered` モードのみに適用されます。

デフォルト値: CPUの数または16。

### s3queue_parallel_inserts {#parallel_inserts}

デフォルトでは `processing_threads_num` は1つの `INSERT` を生成します。したがって、ファイルをダウンロードし、複数のスレッドで解析するだけです。  
しかし、これでは並列性が制限されるため、より良いスループットのために `parallel_inserts=true` を使用してください。これにより、データを並列に挿入できるようになります（ただし、これはMergeTreeファミリーの生成されるデータパーツの数が増加することを意味します）。

:::note
`INSERT` は `max_process*_before_commit` 設定に従って生成されます。
:::

デフォルト値: `false`.

### s3queue_enable_logging_to_s3queue_log {#enable_logging_to_s3queue_log}

`system.s3queue_log` へのロギングを有効にします。

デフォルト値: `0`.

### s3queue_polling_min_timeout_ms {#polling_min_timeout_ms}

ClickHouseが次のポーリングを試みる前に待機する最小時間（ミリ秒単位）を指定します。

可能な値:

- 正の整数.

デフォルト値: `1000`.

### s3queue_polling_max_timeout_ms {#polling_max_timeout_ms}

ClickHouseが次のポーリングを開始する前に待機する最大時間（ミリ秒単位）を指定します。

可能な値:

- 正の整数.

デフォルト値: `10000`.

### s3queue_polling_backoff_ms {#polling_backoff_ms}

新しいファイルが見つからない場合に、前回のポーリング間隔に追加される追加の待機時間を決定します。次のポーリングは、前回の間隔とこのバックオフ値の合計、または最大間隔のいずれか小さい方の後に行われます。

可能な値:

- 正の整数.

デフォルト値: `0`.

### s3queue_tracked_files_limit {#tracked_files_limit}

'unordered' モードを使用する場合、ZooKeeperノードの数を制限します。'ordered' モードでは何もしません。
制限に達した場合、最も古い処理ファイルがZooKeeperノードから削除され、再処理されます。

可能な値:

- 正の整数.

デフォルト値: `1000`.

### s3queue_tracked_file_ttl_sec {#tracked_file_ttl_sec}

ZooKeeperノードに処理されたファイルを格納する最大秒数（デフォルトでは永久に保存）で、'unordered' モードの場合に有効です。'ordered' モードでは何もしません。
指定された数の秒後、ファイルは再インポートされます。

可能な値:

- 正の整数.

デフォルト値: `0`.

### s3queue_cleanup_interval_min_ms {#cleanup_interval_min_ms}

'Ordered' モード用。追跡ファイルのTTLと最大追跡ファイルセットを維持するためのバックグラウンドタスクの再スケジュール間隔の最小境界を定義します。

デフォルト値: `10000`.

### s3queue_cleanup_interval_max_ms {#cleanup_interval_max_ms}

'Ordered' モード用。追跡ファイルのTTLと最大追跡ファイルセットを維持するためのバックグラウンドタスクの再スケジュール間隔の最大境界を定義します。

デフォルト値: `30000`.

### s3queue_buckets {#buckets}

'Ordered' モード用。`24.6` 以降利用可能。S3Queueテーブルの複数のレプリカが存在し、すべてが同じメタデータディレクトリを使用している場合、`s3queue_buckets` の値は少なくともレプリカの数に等しくする必要があります。`s3queue_processing_threads` 設定も使用される場合、`s3queue_buckets` 設定の値をさらに増加させることが理にかなっています。これにより、`S3Queue` の実際の処理の並列性が定義されます。

## S3関連設定 {#s3-settings}

エンジンはすべてのS3関連の設定をサポートしています。S3設定の詳細については、[こちら](../../../engines/table-engines/integrations/s3.md)をご覧ください。

## S3ロールベースアクセス {#s3-role-based-access}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

s3Queueテーブルエンジンはロールベースのアクセスをサポートしています。バケットへのアクセスのためのロールを構成する手順については、[こちら](/cloud/security/secure-s3) を参照してください。

ロールが構成されたら、以下のように `extra_credentials` パラメータを介して `roleARN` を渡すことができます:
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

## S3Queueの順序モード {#ordered-mode}

`S3Queue` 処理モードは、ZooKeeper内のメタデータを少なく保つことができますが、後から追加されたファイルは、アルファベット順に大きい名前を持たなければなりません。

`S3Queue` の `ordered` モードは `unordered` モードと同様に `(s3queue_)processing_threads_num` 設定をサポートしており、これはサーバー上で `S3` ファイルの処理を行うスレッドの数を制御します。また、`ordered` モードは `(s3queue_)buckets` と呼ばれる別の設定を導入し、これは「論理スレッド」を意味します。分散シナリオでは、`S3Queue` テーブルのレプリカが複数のサーバーで存在する場合に、この設定は処理ユニットの数を定義します。例えば、各 `S3Queue` レプリカの各処理スレッドは、特定のファイル名のハッシュによってどの `bucket` を処理するかをロックしようとします。したがって、分散シナリオでは、`(s3queue_)buckets` 設定はレプリカの数と同じかそれ以上にすることを強く推奨します。最適なシナリオは、`(s3queue_)buckets` 設定が `number_of_replicas` と `(s3queue_)processing_threads_num` の積に等しいことです。設定 `(s3queue_)processing_threads_num` の使用は、`24.6` より前のバージョンでは推奨されません。設定 `(s3queue_)buckets` は、`24.6` 以降で利用可能です。

## 説明 {#description}

`SELECT` はストリーミングインポートに特に有用ではありません（デバッグを除く）、なぜなら各ファイルは一度だけインポートできるからです。実際のスレッドを作成するためには、[materialized views](../../../sql-reference/statements/create/view.md) を使用する方が実用的です。これを行うには:

1. エンジンを使用して、S3内の指定されたパスから消費するためのテーブルを作成し、データストリームとみなします。
2. 希望の構造を持つテーブルを作成します。
3. エンジンからデータを変換し、あらかじめ作成したテーブルに配置するマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに参加すると、バックグラウンドでデータの収集を開始します。

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

## 仮想列 {#virtual-columns}

- `_path` — ファイルへのパス。
- `_file` — ファイルの名前。

仮想列に関する詳細は [こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns) を参照してください。

## パス内のワイルドカード {#wildcards-in-path}

`path` 引数は、bashのようなワイルドカードを使って複数のファイルを指定できます。処理されるファイルは存在し、全体のパスパターンに一致する必要があります。ファイルのリストは`SELECT`時に決定されます（`CREATE`の時点ではありません）。

- `*` — '/'を含まない任意の数の任意の文字を置き換え、空文字列も含む。
- `**` — '/'を含む任意の数の任意の文字を置き換え、空文字列も含む。
- `?` — 単一の文字を置き換えます。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかを置き換えます。
- `{N..M}` — NからMの範囲内の任意の数字を置き換え、両端を含みます。NとMは先頭にゼロを持つことができます（例：`000..078`）。

`{}` を使った構文は、[remote](../../../sql-reference/table-functions/remote.md) テーブル関数に似ています。

## 制限事項 {#limitations}

1. 重複行が発生する可能性があります:

- ファイル処理の途中で解析中に例外が発生し、`s3queue_loading_retries` で再試行が有効になっている場合。
  
- `S3Queue` が同じZooKeeper内の同じパスを指す複数のサーバーで構成されており、Keeperセッションが1つのサーバーが処理ファイルをコミットする前に期限切れになった場合。这により、他のサーバーがファイルの処理を引き継ぎ、一部または完全に処理されたファイルが生成される可能性があります。
  
- 異常なサーバーの終了。

2. `S3Queue` が同じZooKeeper内の同じパスを指す複数のサーバーで構成されており、`Ordered` モードが使用されている場合、`s3queue_loading_retries` は機能しません。これはすぐに修正される予定です。

## 内部調査 {#introspection}

内部調査には、`system.s3queue` ステートレステーブルと `system.s3queue_log` 永続テーブルを使用します。

1. `system.s3queue`. このテーブルは永続でなく、`S3Queue` のメモリ内の状態を表示します: 現在処理中のファイル、処理済みまたは失敗したファイル。

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
COMMENT 'Contains in-memory state of S3Queue metadata and currently processed rows per file.' │
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

2. `system.s3queue_log`. 永続テーブル。`system.s3queue` と同じ情報を持ちますが、`processed` および `failed` ファイルのためのものです。

このテーブルは次の構造を持ちます:

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

`system.s3queue_log` を使用するには、その設定をサーバーの設定ファイルに定義します:

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
