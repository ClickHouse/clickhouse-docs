---
slug: /engines/table-engines/integrations/s3queue
sidebar_position: 181
sidebar_label: S3Queue
title: "S3Queue テーブルエンジン"
description: "このエンジンは、Amazon S3エコシステムとの統合を提供し、ストリーミングインポートを可能にします。KafkaとRabbitMQエンジンに似ていますが、S3特有の機能を提供します。"
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

# S3Queue テーブルエンジン

このエンジンは、[Amazon S3](https://aws.amazon.com/s3/)エコシステムとの統合を提供し、ストリーミングインポートを可能にします。このエンジンは、[Kafka](../../../engines/table-engines/integrations/kafka.md)や[RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md)エンジンに似ていますが、S3特有の機能を提供します。

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
`24.7`以前は、`mode`、`after_processing`、および`keeper_path`以外の全ての設定に`s3queue_`プレフィックスを使用する必要があります。
:::

**エンジンパラメータ**

`S3Queue`のパラメータは、`S3`テーブルエンジンがサポートするパラメータと同じです。パラメータに関するセクションは[こちら](../../../engines/table-engines/integrations/s3.md#parameters)を参照してください。

**例**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

名前付きコレクションを使用する：

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

テーブルに設定された設定のリストを取得するには、`system.s3_queue_settings`テーブルを使用します。`24.10`以降から利用可能です。

### mode {#mode}

可能な値:

- unordered — 無順序モード。すべての処理済みファイルのセットがZooKeeperの永続ノードで追跡されます。
- ordered — 順序付きモード。ファイルは辞書式順序で処理されます。つまり、「BBB」という名前のファイルが処理された後に「AA」というファイルがバケットに追加された場合、無視されます。成功裏に消費されたファイルの最大名（辞書式意味における）と、失敗したロード試行の後に再試行されるファイルの名前のみがZooKeeperに保存されます。

デフォルト値: バージョン24.6以前では`ordered`。24.6以降ではデフォルト値はなく、手動で指定する必要があります。以前のバージョンで作成されたテーブルのデフォルト値は、互換性のために`Ordered`のままとなります。

### after_processing {#after_processing}

成功した処理後にファイルを削除するか保持するか。
可能な値:

- keep。
- delete。

デフォルト値: `keep`。

### keeper_path {#keeper_path}

ZooKeeperのパスは、テーブルエンジン設定として指定することができ、またはグローバル設定に提供されたパスとテーブルUUIDからデフォルトパスが形成されます。
可能な値:

- String。

デフォルト値: `/`。

### s3queue_loading_retries {#loading_retries}

指定された回数までファイルの読み込みを再試行します。デフォルトでは再試行はありません。
可能な値:

- 正の整数。

デフォルト値: `0`。

### s3queue_processing_threads_num {#processing_threads_num}

処理を実行するスレッドの数。`Unordered`モードのみに適用されます。

デフォルト値: `1`。

### s3queue_enable_logging_to_s3queue_log {#enable_logging_to_s3queue_log}

`system.s3queue_log`へのロギングを有効にします。

デフォルト値: `0`。

### s3queue_polling_min_timeout_ms {#polling_min_timeout_ms}

ClickHouseが次のポーリング試行を行う前に待機する最小時間（ミリ秒）を指定します。

可能な値:

- 正の整数。

デフォルト値: `1000`。

### s3queue_polling_max_timeout_ms {#polling_max_timeout_ms}

ClickHouseが次のポーリング試行を開始する前に待機する最大時間（ミリ秒）を定義します。

可能な値:

- 正の整数。

デフォルト値: `10000`。

### s3queue_polling_backoff_ms {#polling_backoff_ms}

新しいファイルが見つからなかった場合に、前のポーリングインターバルに追加される追加の待機時間を決定します。次のポーリングは前のインターバルとこのバックオフ値の合計、または最大インターバルのいずれか低い方の後に行われます。

可能な値:

- 正の整数。

デフォルト値: `0`。

### s3queue_tracked_files_limit {#tracked_files_limit}

無順序モードが使用されている場合のZooKeeperノードの数を制限することができます。順序付きモードでは何もしません。
制限に達した場合、最も古い処理済みファイルがZooKeeperノードから削除され、再処理されます。

可能な値:

- 正の整数。

デフォルト値: `1000`。

### s3queue_tracked_file_ttl_sec {#tracked_file_ttl_sec}

無順序モードでZooKeeperノードに処理済みファイルを保存する最大秒数（デフォルトでは永遠に保存）であり、順序付きモードでは何もしません。
指定された秒数が経過した後、ファイルは再インポートされます。

可能な値:

- 正の整数。

デフォルト値: `0`。

### s3queue_cleanup_interval_min_ms {#cleanup_interval_min_ms}

順序付きモードの場合。バックグラウンドタスクの再スケジュール間隔の最小境界を定義し、これはトラッキングファイルTTLと最大トラッキングファイルセットの維持を担当します。

デフォルト値: `10000`。

### s3queue_cleanup_interval_max_ms {#cleanup_interval_max_ms}

順序付きモードの場合。バックグラウンドタスクの再スケジュール間隔の最大境界を定義し、これはトラッキングファイルTTLと最大トラッキングファイルセットの維持を担当します。

デフォルト値: `30000`。

### s3queue_buckets {#buckets}

順序付きモードの場合。`24.6`以降から利用可能です。S3Queueテーブルの複数のレプリカが同じメタデータディレクトリで動作している場合、`s3queue_buckets`の値は少なくともレプリカの数と等しくする必要があります。`s3queue_processing_threads`設定も使用される場合は、`s3queue_buckets`設定の値をさらに増やすことが理にかなります。これは、`S3Queue`処理の実際の並列性を定義します。

## S3関連の設定 {#s3-settings}

エンジンはすべてのS3関連の設定をサポートします。S3設定の詳細については[こちら](../../../engines/table-engines/integrations/s3.md)を参照してください。

## S3ロールベースアクセス {#s3-role-based-access}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

s3Queueテーブルエンジンは、ロールベースのアクセスをサポートしています。
バケットにアクセスするためのロールを設定する手順については、[こちらのドキュメント](/cloud/security/secure-s3)を参照してください。

ロールが設定されたら、次のように`extra_credentials`パラメータを通じて`roleARN`を渡すことができます：
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

`S3Queue`処理モードは、ZooKeeperに保存するメタデータを少なくすることができますが、後で追加されたファイルはアルファベット順で大きい名前を持つ必要があるという制限があります。

`S3Queue`の`ordered`モード、`unordered`モードともに`(s3queue_)processing_threads_num`設定をサポートしており（`s3queue_`プレフィックスはオプション）、サーバー上で`S3`ファイルの処理を行うスレッド数を制御することができます。
さらに、`ordered`モードでは`(s3queue_)buckets`という設定も導入されており、これは「論理スレッド」を意味します。分散シナリオでは、複数のサーバーに同じ`S3Queue`テーブルのレプリカがあり、この設定が処理ユニットの数を定義します。例えば、各`S3Queue`レプリカの処理スレッドは特定のファイルを処理するために特定の`bucket`をロックしようとします。各`bucket`はファイル名のハッシュによって特定のファイルに帰属されます。従って、分散シナリオでは、`(s3queue_)buckets`設定の値をレプリカの数と等しいかそれ以上にすることが強く推奨されます。バケットの数がレプリカの数よりも大きいのは問題ありません。最も最適なシナリオは、`(s3queue_)buckets`設定の値が`number_of_replicas`と`(s3queue_)processing_threads_num`の積になることです。
`s3queue_)processing_threads_num`設定は、`24.6`以前では使用を推奨しません。
`s3queue_)buckets`設定は、`24.6`以降から使用可能です。

## 説明 {#description}

`SELECT`はストリーミングインポートには特に便利ではありません（デバッグを除いて）、各ファイルは一度だけインポートできるためです。リアルタイムスレッドを作成するには、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用する方が実用的です。これを行う手順は次のとおりです：

1. エンジンを使用して、S3の指定されたパスから消費するためのテーブルを作成し、データストリームと見なす。
2. 必要な構造を持つテーブルを作成する。
3. エンジンからデータを変換し、事前に作成したテーブルに入れるマテリアライズドビューを作成する。

`MATERIALIZED VIEW`がエンジンに参加すると、バックグラウンドでデータを収集し始めます。

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

## 仮想列 {#virtual-columns}

- `_path` — ファイルへのパス。
- `_file` — ファイルの名前。

仮想列に関する詳細は[こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns)を参照してください。

## パス内のワイルドカード {#wildcards-in-path}

`path`引数は、bashのようなワイルドカードを使用して複数のファイルを指定できます。処理されるファイルは存在し、全体のパスパターンに一致する必要があります。ファイルのリストは`SELECT`時に決定され、`CREATE`時ではありません。

- `*` — `/`を除く任意の数の任意の文字（空文字列を含む）を置き換えます。
- `**` — `/`を含む任意の数の任意の文字（空文字列を含む）を置き換えます。
- `?` — 任意の単一文字を置き換えます。
- `{some_string,another_string,yet_another_one}` — 任意の文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかに置き換えます。
- `{N..M}` — NからMまでの範囲の任意の数字に置き換えます（両端を含む）。NとMは先頭ゼロを持つことができます。例：`000..078`。

`{}`を使用した構文は、[remote](../../../sql-reference/table-functions/remote.md)テーブル関数に類似しています。

## 制限事項 {#limitations}

1. 重複行が発生する原因：

- ファイル処理の途中で解析中に例外が発生し、再試行が`s3queue_loading_retries`によって有効になっている場合。

- `S3Queue`が同じパスに対して複数のサーバーに設定されており、1つのサーバーが処理されたファイルをコミットする前にkeeperセッションが expire した場合、別のサーバーがそのファイルの処理を引き継ぐことができ、そのファイルは最初のサーバーによって部分的または完全に処理されている可能性があります。

- 異常なサーバーの終了。

2. `S3Queue`が同じパスに対して複数のサーバーに設定され、`Ordered`モードが使用されている場合、`s3queue_loading_retries`は機能しません。これはすぐに修正される予定です。

## 内部監査 {#introspection}

内部監査には、`system.s3queue`ステートレステーブルと`system.s3queue_log`永続テーブルを使用します。

1. `system.s3queue`。このテーブルは永続的ではなく、`S3Queue`のメモリ内状態を示します：現在処理中のファイル、処理済みまたは失敗したファイル。

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
    `ProfileEvents` Map(String, UInt64),
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

2. `system.s3queue_log`。永続テーブル。`system.s3queue`と同じ情報を持っていますが、処理済みおよび失敗したファイルに関するものです。

テーブルは以下の構造を持っています：

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

`system.s3queue_log`を使用するには、サーバー設定ファイルにその設定を定義します：

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
