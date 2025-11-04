---
'description': 'このエンジンはAmazon S3エコシステムとの統合を提供し、ストリーミングインポートを可能にします。KafkaやRabbitMQエンジンに似ていますが、S3特有の機能を提供します。'
'sidebar_label': 'S3Queue'
'sidebar_position': 181
'slug': '/engines/table-engines/integrations/s3queue'
'title': 'S3Queue テーブルエンジン'
'doc_type': 'reference'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# S3Queue テーブルエンジン

このエンジンは、[Amazon S3](https://aws.amazon.com/s3/) エコシステムとの統合を提供し、ストリーミングインポートを可能にします。このエンジンは、[Kafka](../../../engines/table-engines/integrations/kafka.md) や [RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md) エンジンに似ていますが、S3固有の機能を提供します。

以下の点に注意することが重要です。[S3Queue 実装の元の PR](https://github.com/ClickHouse/ClickHouse/pull/49086/files#diff-e1106769c9c8fbe48dd84f18310ef1a250f2c248800fde97586b3104e9cd6af8R183) からのメモ: `MATERIALIZED VIEW` がエンジンに参加すると、S3Queue テーブルエンジンはバックグラウンドでデータを収集し始めます。

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
`24.7` 前では、`mode`、`after_processing`、および `keeper_path` を除くすべての設定に `s3queue_` プレフィックスを使用する必要があります。
:::

**エンジンパラメータ**

`S3Queue` パラメータは、`S3` テーブルエンジンがサポートするパラメータと同じです。パラメータセクションの詳細は [こちら](../../../engines/table-engines/integrations/s3.md#parameters) を参照してください。

**例**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

名前付きコレクションを使用:

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

テーブルの設定リストを取得するには、`system.s3_queue_settings` テーブルを使用します。`24.10` から利用可能です。

### モード {#mode}

可能な値:

- unordered — 無秩序モードでは、すべての処理済みファイルのセットが ZooKeeper の永続ノードで追跡されます。
- ordered — 有秩序モードでは、ファイルは辞書式順序で処理されます。つまり、ファイル名 'BBB' が処理された時点で、その後に 'AA' という名前のファイルがバケットに追加されると、無視されます。成功裏に消費されたファイルの最大名（辞書式において）と、未成功の読み込み試行後に再試行されるファイルの名前のみが ZooKeeper に保存されます。

デフォルト値: `ordered`（バージョン 24.6 より前）。バージョン 24.6 以降、デフォルト値はなくなり、手動で指定する必要があります。以前のバージョンで作成されたテーブルでは、デフォルト値は互換性のため `Ordered` のままになります。

### `after_processing` {#after_processing}

成功した処理後のファイルを削除するか保持します。
可能な値:

- keep.
- delete.

デフォルト値: `keep`.

### `keeper_path` {#keeper_path}

ZooKeeper のパスは、テーブルエンジン設定として指定するか、グローバル構成から提供されるパスとテーブル UUID から形成されます。
可能な値:

- 文字列。

デフォルト値: `/`.

### `s3queue_loading_retries` {#loading_retries}

指定された回数までファイルのロードをリトライします。デフォルトでは、リトライはありません。
可能な値:

- 正の整数。

デフォルト値: `0`.

### `s3queue_processing_threads_num` {#processing_threads_num}

処理を行うスレッドの数。`Unordered` モードでのみ適用されます。

デフォルト値: CPU の数または 16。

### `s3queue_parallel_inserts` {#parallel_inserts}

デフォルトでは `processing_threads_num` は 1 回の `INSERT` を生成するため、ファイルをダウンロードし、複数のスレッドで解析のみを行います。
しかし、これでは並列性が制限されるため、スループットを向上させるには `parallel_inserts=true` を使用します。これにより、データが並列に挿入されます（ただし、MergeTree 系のために生成されるデータパーツの数が増えることに注意してください）。

:::note
`INSERT` は `max_process*_before_commit` 設定に従って生成されます。
:::

デフォルト値: `false`.

### `s3queue_enable_logging_to_s3queue_log` {#enable_logging_to_s3queue_log}

`system.s3queue_log` へのロギングを有効にします。

デフォルト値: `0`.

### `s3queue_polling_min_timeout_ms` {#polling_min_timeout_ms}

ClickHouse が次のポーリング試行を行う前に待機する最小時間（ミリ秒）を指定します。

可能な値:

- 正の整数。

デフォルト値: `1000`.

### `s3queue_polling_max_timeout_ms` {#polling_max_timeout_ms}

ClickHouse が次のポーリング試行を開始する前に待機する最大時間（ミリ秒）を定義します。

可能な値:

- 正の整数。

デフォルト値: `10000`.

### `s3queue_polling_backoff_ms` {#polling_backoff_ms}

新しいファイルが見つからない場合に、前のポーリング間隔に追加される待機時間を決定します。次のポーリングは、前の間隔とこのバックオフ値の合計、または最大間隔のうち、低い方の時間が経過した後に行われます。

可能な値:

- 正の整数。

デフォルト値: `0`.

### `s3queue_tracked_files_limit` {#tracked_files_limit}

'unordered' モードが使用される場合の ZooKeeper ノードの数を制限できます。'ordered' モードには効果がありません。
制限に達すると、最も古い処理済みファイルが ZooKeeper ノードから削除され、再度処理されます。

可能な値:

- 正の整数。

デフォルト値: `1000`.

### `s3queue_tracked_file_ttl_sec` {#tracked_file_ttl_sec}

ZooKeeper ノードに処理済みファイルを保存する最大秒数（デフォルトでは永遠に保存）を指定します。'unordered' モードに対しては機能しません。指定された秒数経過後、ファイルは再インポートされます。

可能な値:

- 正の整数。

デフォルト値: `0`.

### `s3queue_cleanup_interval_min_ms` {#cleanup_interval_min_ms}

'Ordered' モードのために。トラッキングファイルの TTL と最大トラッキングファイルセットを維持するバックグラウンドタスクの再スケジュール間隔の最小境界を定義します。

デフォルト値: `10000`.

### `s3queue_cleanup_interval_max_ms` {#cleanup_interval_max_ms}

'Ordered' モードのために。トラッキングファイルの TTL と最大トラッキングファイルセットを維持するバックグラウンドタスクの再スケジュール間隔の最大境界を定義します。

デフォルト値: `30000`.

### `s3queue_buckets` {#buckets}

'Ordered' モードのために。`24.6` 以降利用可能。S3Queue テーブルのレプリカが複数あり、同じメタデータディレクトリを使用している場合、`s3queue_buckets` の値はレプリカの数以上である必要があります。`s3queue_processing_threads` 設定も使用する場合、`s3queue_buckets` 設定の値をさらに増やすことが理にかなります。これは、実際の S3Queue 処理の並列性を定義します。

### `use_persistent_processing_nodes` {#use_persistent_processing_nodes}

デフォルトでは、S3Queue テーブルは常に一時的な処理ノードを使用しており、これは ZooKeeper セッションが S3Queue が処理ファイルを ZooKeeper にコミットする前に期限切れになるとデータの重複を引き起こす可能性がありますが、処理を開始した後です。この設定は、期限切れの keeper セッションの場合に重複の可能性を排除するようサーバーに強制します。

### `persistent_processing_nodes_ttl_seconds` {#persistent_processing_nodes_ttl_seconds}

サーバーが正常に終了しない場合、`use_persistent_processing_nodes` が有効であれば、削除されていない処理ノードが残る可能性があります。この設定は、これらの処理ノードが安全にクリーンアップされることができる期間を定義します。

デフォルト値: `3600`（1時間）。

## S3関連設定 {#s3-settings}

エンジンはすべての S3 関連設定をサポートしています。S3 設定に関する詳細は [こちら](../../../engines/table-engines/integrations/s3.md) を参照してください。

## S3 ロールベースのアクセス {#s3-role-based-access}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

s3Queue テーブルエンジンは、ロールベースのアクセスをサポートしています。
バケットへのアクセスを構成する手順については、[こちら]( /cloud/security/secure-s3) のドキュメントを参照してください。 

ロールを構成すると、`extra_credentials` パラメータを介して `roleARN` を渡すことができます。以下の例を参照してください。
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

## S3Queue 有秩序モード {#ordered-mode}

`S3Queue` 処理モードは、ZooKeeper に保存するメタデータを減らすことができますが、時間によって後から追加されたファイルは、アルファベット順に大きい名前である必要があります。

`S3Queue`の `ordered` モードは、`unordered` モードと同様に、`(s3queue_)processing_threads_num` 設定をサポートしています（`s3queue_` プレフィックスはオプション）、これにより、サーバー上で `S3` ファイルの処理を行うスレッドの数を制御できます。
さらに、`ordered` モードには、`(s3queue_)buckets` という別の設定が追加されます。これは「論理スレッド」を意味します。分散シナリオでは、複数のサーバーに `S3Queue` テーブルのレプリカがあり、この設定で処理ユニットの数を定義します。例えば、各サーバーの各 `S3Queue` レプリカの処理スレッドは、処理のために特定の `bucket` をロックしようとします。各 `bucket` はファイル名のハッシュによって特定のファイルに属性されます。したがって、分散シナリオでは、`(s3queue_)buckets` 設定はレプリカの数以上であることが強く推奨されます。バケットの数がレプリカの数より多くても問題ありません。最も最適なシナリオは、`(s3queue_)buckets` 設定が `number_of_replicas` と `(s3queue_)processing_threads_num` の積と等しくなることです。
設定 `(s3queue_)processing_threads_num` は、バージョン `24.6` より前の使用は推奨されません。
設定 `(s3queue_)buckets` は、バージョン `24.6` 以降で利用可能です。

## 説明 {#description}

`SELECT` は、ストリーミングインポートには特に役に立ちません（デバッグを除いて）、なぜなら各ファイルは一度だけインポートできるからです。リアルタイムスレッドを作成するには、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md) を使用する方が実用的です。これを行うには:

1. エンジンを使用して、S3 の指定されたパスから消費するためのテーブルを作成し、それをデータストリームとみなします。
2. 希望する構造のテーブルを作成します。
3. エンジンからデータを変換し、以前に作成したテーブルに入れるマテリアライズドビューを作成します。

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
- `_file` — ファイル名。
- `_size` — ファイルのサイズ。
- `_time` — ファイルの作成時間。

仮想列に関する詳細は [こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns) を参照してください。

## パスのワイルドカード {#wildcards-in-path}

`path` 引数は、bash のようなワイルドカードを使用して複数のファイルを指定できます。処理されるファイルは存在し、全体のパスパターンに一致する必要があります。ファイルのリストは `SELECT` 時に決定されます（`CREATE` の瞬間ではありません）。

- `*` — `/` を除く任意の数の任意の文字を置き換えます。空の文字列も含まれます。
- `**` — `/` を含む任意の数の任意の文字を置き換えます。空の文字列も含まれます。
- `?` — 任意の単一文字を置き換えます。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかを置き換えます。
- `{N..M}` — N から M までの範囲の任意の数を置き換えます。N と M には前置ゼロを含めることができます。例: `000..078`。

`{}` を使った構文は、[remote](../../../sql-reference/table-functions/remote.md) テーブル関数に似ています。

## 制限事項 {#limitations}

1. 重複行は以下の結果として発生する可能性があります：

- ファイル処理の途中で解析中に例外が発生し、`s3queue_loading_retries` によってリトライが有効になっている場合。

- 同じ ZooKeeper のパスを指す複数のサーバーで `S3Queue` が構成されていて、あるサーバーが処理済みファイルをコミットする前に keeper セッションが期限切れになると、別のサーバーがそのファイルの処理を引き継ぐ可能性があります。このファイルは最初のサーバーによって部分的または完全に処理されている可能性があります。ただし、これは `use_persistent_processing_nodes = 1` の場合はバージョン 25.8 以降は当てはまりません。

- 異常なサーバーの終了。

2. ZooKeeper の同じパスを指し、`Ordered` モードが使用されている複数のサーバーで `S3Queue` 構成されている場合、`s3queue_loading_retries` は機能しません。これはすぐに修正されます。

## 内省 {#introspection}

内省には、`system.s3queue` ステートレステーブルと `system.s3queue_log` 永続テーブルを使用します。

1. `system.s3queue`。このテーブルは永続的ではなく、`S3Queue` のメモリ内状態を示します：現在処理中のファイル、処理済みまたは失敗したファイル。

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

2. `system.s3queue_log`。 永続テーブル。同じ情報を持っていますが、`processed` および `failed` ファイル用です。

テーブルは以下の構造を持っています：

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

`system.s3queue_log` を使用するには、サーバー構成ファイルにその設定を定義してください：

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
