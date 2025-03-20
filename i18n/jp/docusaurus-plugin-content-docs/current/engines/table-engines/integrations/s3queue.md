---
slug: /engines/table-engines/integrations/s3queue
sidebar_position: 181
sidebar_label: S3Queue
title: "S3Queue テーブルエンジン"
description: "このエンジンは Amazon S3 エコシステムとの統合を提供し、ストリーミングインポートを可能にします。Kafka および RabbitMQ エンジンに似ていますが、S3 特有の機能を提供します。"
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# S3Queue テーブルエンジン

このエンジンは [Amazon S3](https://aws.amazon.com/s3/) エコシステムとの統合を提供し、ストリーミングインポートを可能にします。このエンジンは [Kafka](../../../engines/table-engines/integrations/kafka.md) および [RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md) エンジンに似ていますが、S3 特有の機能を提供します。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE s3_queue_engine_table (name String, value UInt32)
    ENGINE = S3Queue(path, [NOSIGN, | aws_access_key_id, aws_secret_access_key,] format, [compression], [headers])
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    [loading_retries = 0,]
    [processing_threads_num = 1,]
    [enable_logging_to_s3queue_log = 0,]
    [polling_min_timeout_ms = 1000,]
    [polling_max_timeout_ms = 10000,]
    [polling_backoff_ms = 0,]
    [tracked_file_ttl_sec = 0,]
    [tracked_files_limit = 1000,]
    [cleanup_interval_min_ms = 10000,]
    [cleanup_interval_max_ms = 30000,]
```

:::warning
`24.7` より前は、`mode`、`after_processing`、`keeper_path` 以外のすべての設定に `s3queue_` プレフィックスを使用する必要があります。
:::

**エンジンパラメータ**

`S3Queue` パラメータは `S3` テーブルエンジンがサポートするものと同じです。パラメータセクションの詳細は [こちら](../../../engines/table-engines/integrations/s3.md#parameters) をご覧ください。

**例**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

名前付きコレクションを使用する場合:

``` xml
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

- unordered — 無秩序モードでは、すでに処理されたファイルのセットは ZooKeeper に永続ノードとして追跡されます。
- ordered — 順序付きモードでは、ファイルは辞書順で処理されます。つまり、名前が 'BBB' のファイルが処理された後に 'AA' という名前のファイルがバケットに追加されると、それは無視されます。成功裏に消費されたファイルの最大名（辞書順での意味）と、失敗した読み込み試行の後に再試行されるファイルの名前が ZooKeeper に保存されます。

デフォルト値: `24.6` より前は `ordered`。`24.6` 以降では、デフォルト値は存在せず、設定は手動で指定する必要があります。以前のバージョンで作成されたテーブルのデフォルト値は互換性のために `Ordered` のままです。

### after_processing {#after_processing}

成功裏に処理された後にファイルを削除するか保持するかを指定します。
可能な値:

- keep.
- delete.

デフォルト値: `keep`.

### keeper_path {#keeper_path}

ZooKeeper のパスはテーブルエンジンの設定として指定することができ、デフォルトのパスはグローバル設定提供のパスとテーブル UUID から構成されます。
可能な値:

- String.

デフォルト値: `/`.

### s3queue_loading_retries {#loading_retries}

指定された回数までファイルの読み込みを再試行します。デフォルトでは、再試行はありません。
可能な値:

- 正の整数。

デフォルト値: `0`.

### s3queue_processing_threads_num {#processing_threads_num}

処理を行うスレッド数。`Unordered` モードのみ適用されます。

デフォルト値: `1`.

### s3queue_enable_logging_to_s3queue_log {#enable_logging_to_s3queue_log}

`system.s3queue_log` へのロギングを有効にします。

デフォルト値: `0`.

### s3queue_polling_min_timeout_ms {#polling_min_timeout_ms}

次のポーリング試行を行う前に ClickHouse が待機する最小時間（ミリ秒単位）を指定します。

可能な値:

- 正の整数。

デフォルト値: `1000`.

### s3queue_polling_max_timeout_ms {#polling_max_timeout_ms}

次のポーリング試行を開始するまでに ClickHouse が待機する最大時間（ミリ秒単位）を定義します。

可能な値:

- 正の整数。

デフォルト値: `10000`.

### s3queue_polling_backoff_ms {#polling_backoff_ms}

新しいファイルが見つからないときに前のポーリング間隔に追加される待機時間を決定します。次のポーリングは前の間隔とこのバックオフ値の合計、または最大間隔のいずれか低い方の後に発生します。

可能な値:

- 正の整数。

デフォルト値: `0`.

### s3queue_tracked_files_limit {#tracked_files_limit}

'unordered' モードが使用されている場合の ZooKeeper ノードの数を制限でき、'ordered' モードには何も影響しません。
制限に達すると、古い処理済みファイルが ZooKeeper ノードから削除され、再処理されます。

可能な値:

- 正の整数。

デフォルト値: `1000`.

### s3queue_tracked_file_ttl_sec {#tracked_file_ttl_sec}

処理済みファイルを ZooKeeper ノードに保存する最大秒数（デフォルトでは永遠に保存）で、'unordered' モードで機能し、'ordered' モードでは何もしません。
指定された秒数が経過すると、ファイルが再インポートされます。

可能な値:

- 正の整数。

デフォルト値: `0`.

### s3queue_cleanup_interval_min_ms {#cleanup_interval_min_ms}

'Ordered' モードの場合。追跡ファイルの TTL と最大追跡ファイルセットの維持を担当するバックグラウンドタスクの再スケジュール間隔の最小境界を定義します。

デフォルト値: `10000`.

### s3queue_cleanup_interval_max_ms {#cleanup_interval_max_ms}

'Ordered' モードの場合。追跡ファイルの TTL と最大追跡ファイルセットの維持を担当するバックグラウンドタスクの再スケジュール間隔の最大境界を定義します。

デフォルト値: `30000`.

### s3queue_buckets {#buckets}

'Ordered' モードの場合。`24.6` 以降で利用可能です。同じメタデータディレクトリで動作する S3Queue テーブルの複数のレプリカがある場合、`s3queue_buckets` の値は少なくともレプリカの数と等しくする必要があります。`s3queue_processing_threads` 設定も使用する場合、`s3queue_buckets` 設定の値をさらに増やすことが理にかなっています。なぜなら、これは `S3Queue` 処理の実際の並列性を定義するからです。

## S3関連設定 {#s3-settings}

エンジンはすべての S3 関連の設定をサポートしています。S3 設定に関する詳細は [こちら](../../../engines/table-engines/integrations/s3.md) を参照してください。

## S3 ロールベースアクセス {#s3-role-based-access}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

S3Queue テーブルエンジンはロールベースのアクセスをサポートしています。
バケットにアクセスするためのロールを構成する手順については [こちら](/cloud/security/secure-s3) を参照してください。

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

## S3Queue 順序付きモード {#ordered-mode}

`S3Queue` 処理モードは ZooKeeper に保存されるメタデータを少なくすることができますが、後から追加されるファイルは随時命名規則を満たす必要があります。

`S3Queue` の `ordered` モードは、`unordered` モードと同様に `(s3queue_)processing_threads_num` 設定（`s3queue_` プレフィックスはオプショナル）をサポートし、サーバー上で `S3` ファイルを処理するスレッド数を制御できます。
さらに、`ordered` モードは `(s3queue_)buckets` という別の設定も紹介します。これは「論理スレッド」を意味します。これは、複数のサーバーに `S3Queue` テーブルのレプリカがある場合、処理単位の数を定義します。例えば、各 `S3Queue` レプリカの各処理スレッドは、特定の `bucket` をロックして処理を試みます。各 `bucket` はファイル名のハッシュによって特定のファイルに割り当てられます。したがって、分散シナリオでは `(s3queue_)buckets` の設定は、レプリカの数と等しいかそれ以上になることが強く推奨されます。このバケットの数はレプリカの数よりも多くても問題ありません。最も最適なシナリオは `(s3queue_)buckets` の設定が `number_of_replicas` と `(s3queue_)processing_threads_num` の積と等しくなることです。
`(s3queue_)processing_threads_num` の設定は `24.6` より前の使用は推奨されません。
`(s3queue_)buckets` の設定は `24.6` から利用可能です。

## 説明 {#description}

`SELECT` はストリーミングインポートには特に便利ではありません（デバッグを除く）、なぜなら各ファイルは一度だけインポートされるからです。リアルタイムスレッドを作成するためには、[マテリアライズドビュ](../../../sql-reference/statements/create/view.md)を作成することがより実用的です。これを行うには：

1. エンジンを使用して、S3 の指定されたパスからデータを取り出すためのテーブルを作成し、それをデータストリームと見なします。
2. 希望する構造を持つテーブルを作成します。
3. エンジンからデータを変換し、前に作成したテーブルに挿入するマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに参加すると、バックグラウンドでデータを収集し始めます。

例：

``` sql
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

仮想カラムに関する詳細は [こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns) を参照してください。

## パスのワイルドカード {#wildcards-in-path}

`path` 引数は、bashのようなワイルドカードを使用して複数のファイルを指定できます。処理されるファイルは存在し、全体のパスパターンに一致する必要があります。ファイルのリストは `SELECT` の際に決定されます（`CREATE` の時点ではありません）。

- `*` — '/' を除く任意の数の任意の文字を置き換え、空文字列を含めます。
- `**` — '/' を含む任意の数の任意の文字を置き換え、空文字列を含めます。
- `?` — 1 つの文字を置き換えます。
- `{some_string,another_string,yet_another_one}` — 'some_string', 'another_string', 'yet_another_one' のいずれかの文字列を置き換えます。
- `{N..M}` — N から M までの範囲の任意の数字を両端を含めて置き換えます。N と M には先頭ゼロを含んでいてもかまいません（例: `000..078`）。

`{}` を用いた構文は [remote](../../../sql-reference/table-functions/remote.md) テーブル関数に似ています。

## 制限事項 {#limitations}

1. 重複行が発生する原因：

- ファイル処理の途中でパース中に例外が発生し、`s3queue_loading_retries` によって再試行が有効化される場合；
- `S3Queue` が複数のサーバーに設定され、ZooKeeper 内の同じパスを指摘し、1 台のサーバーが処理されたファイルをコミットする前にセッションが切れると、別のサーバーがファイルの処理を引き継ぐ可能性があるため、ファイルは最初のサーバーで部分的または完全に処理されている可能性があります；
- 異常なサーバー終了。

2. `S3Queue` が複数のサーバーに設定され、ZooKeeper 内の同じパスを指摘し、`Ordered` モードが使用されると、`s3queue_loading_retries` は機能しません。これはすぐに修正される予定です。

## インストロスペクション {#introspection}

インストロスペクションには `system.s3queue` ステートレステーブルおよび `system.s3queue_log` 永続テーブルを使用します。

1. `system.s3queue`。このテーブルは永続的ではなく、`S3Queue` のメモリ内状態を表示します: 現在処理中のファイル、処理済みまたは失敗したファイル。

``` sql
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

例：

``` sql

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

2. `system.s3queue_log`。永続テーブル。処理されたファイルおよび失敗したファイルに関する情報が `system.s3queue` と同様です。

テーブルの構造は次のようになります：

``` sql
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

`system.s3queue_log` を使用するには、サーバー設定ファイルにその設定を定義します：

``` xml
    <s3queue_log>
        <database>system</database>
        <table>s3queue_log</table>
    </s3queue_log>
```

例：

``` sql
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
