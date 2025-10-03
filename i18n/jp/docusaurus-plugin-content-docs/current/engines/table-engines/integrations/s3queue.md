---
description: 'This engine provides integration with the Amazon S3 ecosystem and
  allows streaming imports. Similar to the Kafka and RabbitMQ engines, but provides
  S3-specific features.'
sidebar_label: 'S3Queue'
sidebar_position: 181
slug: '/engines/table-engines/integrations/s3queue'
title: 'S3Queue テーブルエンジン'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# S3Queue テーブルエンジン

このエンジンは [Amazon S3](https://aws.amazon.com/s3/) エコシステムと統合されており、ストリーミングインポートを可能にします。このエンジンは [Kafka](../../../engines/table-engines/integrations/kafka.md) や [RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md) エンジンに似ていますが、S3固有の機能を提供します。

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
`24.7`未満では、`mode`、`after_processing`、`keeper_path`を除くすべての設定に`s3queue_`プレフィックスを使用する必要があります。
:::

**エンジンパラメータ**

`S3Queue`のパラメータは、`S3`テーブルエンジンがサポートするものと同じです。パラメータセクションの詳細は[こちら](../../../engines/table-engines/integrations/s3.md#parameters)を参照してください。

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

テーブルに設定された設定のリストを取得するには、`system.s3_queue_settings`テーブルを使用します。`24.10`から利用可能です。

### mode {#mode}

可能な値:

- unordered — 順序が保証されないモードでは、すべての処理済みファイルの集合がZooKeeper内の永続ノードで追跡されます。
- ordered — 順序付きモードでは、ファイルは字典順序で処理されます。つまり、ファイル名が'BBB'のファイルがある時、それに後から追加されたファイル名'AA'は無視されます。成功裏に消費されたファイルの最大名（字典順に意味する）と、処理に失敗し再試行されるファイルの名前のみがZooKeeperに保存されます。

デフォルト値: `ordered` は24.6未満のバージョンでは。24.6以降ではデフォルト値はなく、手動で指定する必要があります。以前のバージョンで作成されたテーブルのデフォルト値は互換性のため`Ordered`のままです。

### after_processing {#after_processing}

成功裏に処理した後にファイルを削除するか保持するか。
可能な値:

- keep.
- delete.

デフォルト値: `keep`.

### keeper_path {#keeper_path}

ZooKeeper内のパスは、テーブルエンジンの設定として指定するか、グローバル設定から提供されたパスとテーブルのUUIDから形成されたデフォルトパスを使用できます。
可能な値:

- String.

デフォルト値: `/`.

### s3queue_loading_retries {#loading_retries}

指定した回数までファイルの読み込みを再試行します。デフォルトでは、リトライはありません。
可能な値:

- 正の整数。

デフォルト値: `0`.

### s3queue_processing_threads_num {#processing_threads_num}

処理を行うスレッドの数。`Unordered`モードのみに適用されます。

デフォルト値: CPUの数または16。

### s3queue_parallel_inserts {#parallel_inserts}

デフォルトでは`processing_threads_num`は1つの`INSERT`を生成しますので、ファイルをダウンロードし、複数のスレッドで解析することしかしません。
しかし、これにより並列性が制限されるので、より良いスループットのためには`parallel_inserts=true`を使用すると、データを並行して挿入できるようになります（ただし、これによりMergeTreeファミリーの生成されるデータパーツの数が増えることに注意してください）。

:::note
`INSERT`は`max_process*_before_commit`設定に従って生成されます。
:::

デフォルト値: `false`.

### s3queue_enable_logging_to_s3queue_log {#enable_logging_to_s3queue_log}

`system.s3queue_log`へのログ記録を有効にします。

デフォルト値: `0`.

### s3queue_polling_min_timeout_ms {#polling_min_timeout_ms}

ClickHouseが次のポーリング試行を行う前に待機する最小時間（ミリ秒）を指定します。

可能な値:

- 正の整数。

デフォルト値: `1000`.

### s3queue_polling_max_timeout_ms {#polling_max_timeout_ms}

ClickHouseが次のポーリング試行を開始する前に待機する最大時間（ミリ秒）を定義します。

可能な値:

- 正の整数。

デフォルト値: `10000`.

### s3queue_polling_backoff_ms {#polling_backoff_ms}

新しいファイルが見つからないときに、前回のポーリング間隔に追加される待機時間を決定します。次のポーリングは、前回の間隔とこのバックオフ値の合計、または最大間隔のうち、いずれか低い方の後に発生します。

可能な値:

- 正の整数。

デフォルト値: `0`.

### s3queue_tracked_files_limit {#tracked_files_limit}

'unordered'モードの場合、ZooKeeperノードの数を制限できます。'ordered'モードでは何もしません。
制限に達した場合、最も古い処理済みファイルがZooKeeperノードから削除され、再処理されます。

可能な値:

- 正の整数。

デフォルト値: `1000`.

### s3queue_tracked_file_ttl_sec {#tracked_file_ttl_sec}

'unordered'モードの場合、ZooKeeperノード内で処理済みファイルを保存する最大秒数（デフォルトでは無限）で、'ordered'モードでは何もしません。
指定した秒数が経過した後、ファイルは再インポートされます。

可能な値:

- 正の整数。

デフォルト値: `0`.

### s3queue_cleanup_interval_min_ms {#cleanup_interval_min_ms}

'Ordered'モードの場合。バックグラウンドタスクの再スケジュール間隔の最小境界を定義します。このタスクは、追跡されたファイルのTTLと最大追跡ファイルセットを維持する役割を果たします。

デフォルト値: `10000`.

### s3queue_cleanup_interval_max_ms {#cleanup_interval_max_ms}

'Ordered'モードの場合。バックグラウンドタスクの再スケジュール間隔の最大境界を定義します。このタスクは、追跡されたファイルのTTLと最大追跡ファイルセットを維持する役割を果たします。

デフォルト値: `30000`.

### s3queue_buckets {#buckets}

'Ordered'モードの場合。`24.6`以降から利用可能です。S3Queueテーブルの複数のレプリカがあり、いずれも同じメタデータディレクトリを保持している場合、`s3queue_buckets`の値は少なくともレプリカの数と同じである必要があります。`s3queue_processing_threads`設定も使用する場合は、`s3queue_buckets`の設定値をさらに増加させることが合理的です。これは、`S3Queue`の処理の実際の並行性を定義します。

## S3関連の設定 {#s3-settings}

エンジンはすべてのS3関連の設定をサポートしています。S3設定の詳細については[こちら](../../../engines/table-engines/integrations/s3.md)を参照してください。

## S3 ロールベースアクセス {#s3-role-based-access}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

s3Queueテーブルエンジンはロールベースのアクセスをサポートしています。
バケットにアクセスするためのロールを設定する手順については、[こちらのドキュメント](/cloud/security/secure-s3)を参照してください。

ロールが設定されると、`roleARN`を下記のように`extra_credentials`パラメータを介して渡すことができます:
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

## S3Queue オーダーモード {#ordered-mode}

`S3Queue`処理モードは、ZooKeeper内のメタデータをより少なく保存することを可能にしますが、時間的に後から追加されたファイルがアルファベット順に大きい名前を持つ必要があるという制限があります。

`S3Queue`の`ordered`モードは、`unordered`モードと同様に`(s3queue_)processing_threads_num`設定をサポートしています（`s3queue_`プレフィックスはオプショナルです）。この設定により、サーバー上で`S3`ファイルの処理を行うスレッドの数を制御できます。
さらに、`ordered`モードは`(s3queue_)buckets`と呼ばれる別の設定も導入しています。これは「論理スレッド」を意味します。これは分散シナリオでのことで、`S3Queue`テーブルのレプリカが複数のサーバー上に存在し、この設定が処理ユニットの数を定義します。例として、各`S3Queue`レプリカの各処理スレッドが特定のファイル処理のために特定の`bucket`をロックしようとします。各`bucket`はファイル名のハッシュによって特定のファイルに割り当てられます。したがって、分散シナリオにおいては、`(s3queue_)buckets`設定がレプリカの数と同じ、またはそれ以上であることが強く推奨されます。この設定はレプリカの数よりも多くても問題ありません。最も最適なシナリオは、`(s3queue_)buckets`設定が`number_of_replicas`と`(s3queue_)processing_threads_num`の掛け算に等しいことです。
`(s3queue_)processing_threads_num`設定はバージョン`24.6`以前では使用が推奨されていません。
`(s3queue_)buckets`設定はバージョン`24.6`以降から利用可能です。

## 説明 {#description}

`SELECT`はストリーミングインポートにはそれほど有用ではありません（デバッグを除く）、なぜなら各ファイルは一度だけインポートできるからです。したがって、指定されたS3のパスからデータストリームとして消費するためのテーブルを作成するのがより実用的です。
1. エンジンを使用してS3内の指定パスから消費するためのテーブルを作成し、それをデータストリームと見なします。
2. 必要な構造でテーブルを作成します。
3. エンジンからデータを変換し、事前に作成されたテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンと接続すると、バックグラウンドでデータを収集し始めます。

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

仮想カラムに関する詳細は[こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns)を参照してください。

## パス内のワイルドカード {#wildcards-in-path}

`path`引数は、bash風のワイルドカードを使用して複数のファイルを指定できます。処理されるファイルは存在し、全体のパスパターンと一致している必要があります。ファイルのリストは`SELECT`の際に決定され（`CREATE`時ではありません）。

- `*` — `/`を除く任意の文字の数を表し、空文字列も含まれます。
- `**` — `/`を含む任意の字符の数を表し、空文字列も含まれます。
- `?` — 任意の単一文字を表します。
- `{some_string,another_string,yet_another_one}` — 任意の文字列`'some_string', 'another_string', 'yet_another_one'`を表します。
- `{N..M}` — NからMまでの範囲内の任意の数を表し、両端を含みます。NおよびMには先頭ゼロを含めることができます（例: `000..078`）。

`{}`を使用した構文は、[remote](../../../sql-reference/table-functions/remote.md)テーブル関数に似ています。

## 制限事項 {#limitations}

1. 重複行が発生する可能性がある理由:

- ファイル処理の途中で解析中に例外が発生し、リトライが`s3queue_loading_retries`で有効になっている場合。

- `S3Queue`が複数のサーバーで設定されており、同じパスのZooKeeperを指している場合、処理されたファイルのコミットが完了する前にキーパーセッションが期限切れになり、別のサーバーがファイル処理を引き継ぐことにより、最初のサーバーによって部分的または完全に処理されたファイルの処理が行われる可能性があります。

- サーバーの異常終了。

2. `S3Queue`が複数のサーバーで設定され、同じパスのZooKeeperを指している場合、`Ordered`モードが使用されると、`s3queue_loading_retries`は機能しません。これはすぐに修正される予定です。

## 内部構造の把握 {#introspection}

内部構造を把握するには、`system.s3queue`のステートレステーブルと`system.s3queue_log`の永続テーブルを使用します。

1. `system.s3queue`。このテーブルは永続的でなく、現在処理中の`S3Queue`のメモリ内状態を表示します：現在どのファイルが処理中か、どのファイルが処理済みまたは失敗したか。

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
    `ProfileEvents` Map(String, UInt64),
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

2. `system.s3queue_log`。永続テーブル。`system.s3queue`と同じ情報を持ちますが、`processed`および`failed`ファイルについてです。

テーブルは以下の構造を持っています:

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

`system.s3queue_log`を使用するためには、その設定をサーバーの設定ファイルに定義する必要があります:

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
