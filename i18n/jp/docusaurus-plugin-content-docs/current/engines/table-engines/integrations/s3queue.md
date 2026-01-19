---
description: 'このエンジンは Amazon S3 エコシステムとの統合機能を提供し、ストリーミングインポートを可能にします。Kafka エンジンおよび RabbitMQ エンジンと同様ですが、S3 固有の機能を提供します。'
sidebar_label: 'S3Queue'
sidebar_position: 181
slug: /engines/table-engines/integrations/s3queue
title: 'S3Queue テーブルエンジン'
doc_type: 'reference'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

# S3Queue テーブルエンジン \{#s3queue-table-engine\}

このエンジンは [Amazon S3](https://aws.amazon.com/s3/) エコシステムとの統合を提供し、ストリーミングインポートを可能にします。このエンジンは [Kafka](../../../engines/table-engines/integrations/kafka.md)、[RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md) エンジンと類似していますが、S3 固有の機能を提供します。

[S3Queue 実装の元となった PR](https://github.com/ClickHouse/ClickHouse/pull/49086/files#diff-e1106769c9c8fbe48dd84f18310ef1a250f2c248800fde97586b3104e9cd6af8R183) に記載されている次の注意点を理解しておくことが重要です。`MATERIALIZED VIEW` がこのエンジンに接続されると、S3Queue テーブルエンジンはバックグラウンドでデータの収集を開始します。

## テーブルを作成する \{#creating-a-table\}

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
`24.7` より前のバージョンでは、`mode`、`after_processing`、`keeper_path` を除くすべての設定項目で `s3queue_` プレフィックスを使用する必要があります。
:::

**エンジンパラメータ**

`S3Queue` のパラメータは、`S3` テーブルエンジンがサポートしているものと同一です。パラメータについては[こちら](../../../engines/table-engines/integrations/s3.md#parameters)を参照してください。

**例**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

名前付きコレクションの利用：

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

## 設定 \{#settings\}

テーブルに対して構成されている設定一覧を取得するには、`system.s3_queue_settings` テーブルを使用します。ClickHouse 24.10 以降で利用可能です。

:::note 設定名 (24.7+)
バージョン 24.7 以降では、S3Queue の設定は `s3queue_` プレフィックスの有無どちらでも指定できます。

- **モダンな構文** (24.7+): `processing_threads_num`、`tracked_file_ttl_sec` など
- **レガシー構文** (全バージョン): `s3queue_processing_threads_num`、`s3queue_tracked_file_ttl_sec` など

24.7 以降のバージョンでは、どちらの形式もサポートされています。本ページの例では、プレフィックスなしのモダンな構文を使用します。
:::

### Mode \{#mode\}

指定可能な値：

* unordered — `unordered` モードでは、すでに処理されたすべてのファイルの集合が ZooKeeper 内の永続ノードとして追跡されます。
* ordered — `ordered` モードでは、ファイルは辞書順で処理されます。つまり、ファイル名 `BBB` のファイルがある時点で処理され、その後にファイル名 `AA` のファイルがバケットに追加された場合、そのファイルは無視されます。ZooKeeper には、正常に取り込まれたファイル名のうち最大のもの（辞書順での最大値）と、読み込みに失敗して再試行対象となるファイル名のみが保存されます。

デフォルト値: バージョン 24.6 より前は `ordered`。24.6 以降ではデフォルト値は存在せず、この設定の指定が必須になります。以前のバージョンで作成されたテーブルについては、互換性のためデフォルト値は引き続き `Ordered` のままです。

### `after_processing` \{#after_processing\}

ファイルの処理が正常に完了した後の扱い方法。

指定可能な値:

* keep。
* delete。
* move。
* tag。

デフォルト値: `keep`。

move を使用するには追加の設定が必要です。同一バケット内で移動する場合は、新しいパスプレフィックスを `after_processing_move_prefix` として指定する必要があります。

別の S3 バケットへ移動する場合は、移動先バケットの URI を `after_processing_move_uri` として、S3 クレデンシャルを `after_processing_move_access_key_id` および `after_processing_move_secret_access_key` として指定する必要があります。

例:

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered',
    after_processing = 'move',
    after_processing_retries = 20,
    after_processing_move_prefix = 'dst_prefix',
    after_processing_move_uri = 'https://clickhouse-public-datasets.s3.amazonaws.com/dst-bucket',
    after_processing_move_access_key_id = 'test',
    after_processing_move_secret_access_key = 'test';
```

Azure コンテナから別の Azure コンテナに移動するには、Blob Storage の接続文字列を `after_processing_move_connection_string` に、コンテナ名を `after_processing_move_container` に指定します。詳しくは [AzureQueue の設定](../../../engines/table-engines/integrations/azure-queue.md#settings) を参照してください。

タグ付けを行うには、タグキーと値をそれぞれ `after_processing_tag_key` および `after_processing_tag_value` として指定します。

### `after_processing_retries` \{#after_processing_retries\}

要求された後処理アクションに対して、処理を断念するまでに行う再試行回数。

可能な値:

- 0 以上の整数。

デフォルト値: `10`。

### `after_processing_move_access_key_id` \{#after_processing_move_access_key_id\}

移動先が別の S3 バケットである場合に、正常に処理されたファイルをそのバケットへ移動するための Access Key ID。

設定可能な値:

* 文字列。

デフォルト値: 空文字列。

### `after_processing_move_prefix` \{#after_processing_move_prefix\}

正常に処理されたファイルを移動する先のパスプレフィックスです。同一バケット内での移動と、別のバケットへの移動の両方で有効です。

指定可能な値:

* String。

デフォルト値: 空文字列。

### `after_processing_move_secret_access_key` \{#after_processing_move_secret_access_key\}

移動先が別の S3 バケットである場合に、正常に処理されたファイルをそのバケットへ移動するための Secret Access Key。

設定可能な値:

* 文字列。

デフォルト値: 空文字列。

### `after_processing_move_uri` \{#after_processing_move_uri\}

宛先が別の S3 バケットである場合に、正常に処理されたファイルを移動する先となる S3 バケットの URI。

取りうる値:

* 文字列。

デフォルト値: 空文字列。

### `after_processing_tag_key` \{#after_processing_tag_key\}

`after_processing='tag'` の場合に、正常に処理されたファイルへタグ付けを行うためのタグキー。

指定可能な値:

* 文字列。

デフォルト値: 空文字列。

### `after_processing_tag_value` \{#after_processing_tag_value\}

`after_processing` が `tag` の場合に、正常に処理されたファイルに付与するタグ値。

指定可能な値:

* 文字列。

デフォルト値: 空文字列。

### `keeper_path` \{#keeper_path\}

ZooKeeper 内のパスはテーブルエンジンの設定として指定するか、グローバル設定で指定されたパスとテーブル UUID から既定パスを生成できます。
取り得る値:

* 文字列。

既定値: `/`。

### `loading_retries` \{#loading_retries\}

指定された回数までファイルの読み込みを再試行します。デフォルトでは再試行は行われません。
取りうる値:

- 正の整数。

デフォルト値: `0`。

### `processing_threads_num` \{#processing_threads_num\}

処理を実行するスレッド数。`Unordered` モードでのみ適用されます。

デフォルト値: CPU の数または 16。

### `parallel_inserts` \{#parallel_inserts\}

デフォルトでは、`processing_threads_num` は 1 つの `INSERT` しか生成されないため、複数スレッドで実行されるのはファイルのダウンロードとパース処理だけです。
しかし、これは並列度を制限するため、スループットを向上させるには `parallel_inserts=true` を使用してください。これによりデータを並列に挿入できるようになります（ただし、その結果として MergeTree ファミリーのテーブルに対して生成されるデータパーツの数が増加する点に注意してください）。

:::note
`INSERT` は `max_process*_before_commit` 設定を考慮して生成されます。
:::

デフォルト値: `false`。

### `enable_logging_to_s3queue_log` \{#enable_logging_to_s3queue_log\}

`system.s3queue_log` へのログ記録を有効にします。

デフォルト値: `0`。

### `polling_min_timeout_ms` \{#polling_min_timeout_ms\}

ClickHouse が次のポーリングを実行する前に待機する最小時間をミリ秒単位で指定します。

設定可能な値:

- 正の整数。

デフォルト値: `1000`。

### `polling_max_timeout_ms` \{#polling_max_timeout_ms\}

ClickHouse が次のポーリング試行を開始するまでに待機する最大時間を、ミリ秒単位で定義します。

可能な値:

* 正の整数。

デフォルト値: `10000`。

### `polling_backoff_ms` \{#polling_backoff_ms\}

新しいファイルが見つからなかった場合に、前回のポーリング間隔に追加される待機時間を決定します。次回のポーリングは、前回の間隔にこのバックオフ値を加えた値と最大間隔のうち、短い方の時間が経過した後に行われます。

指定可能な値:

- 正の整数。

デフォルト値: `0`。

### `tracked_files_limit` \{#tracked_files_limit\}

`unordered` モードが使用されている場合に、ZooKeeper ノードの数に上限を設けるための設定です。`ordered` モードでは何も行いません。
上限に達した場合、最も古く処理されたファイルが ZooKeeper ノードから削除され、再度処理されます。

設定可能な値:

- 正の整数。

デフォルト値: `1000`。

### `tracked_file_ttl_sec` \{#tracked_file_ttl_sec\}

`unordered` モードにおいて、処理済みファイルを ZooKeeper のノードに保持しておく最大秒数（デフォルトでは無期限に保存）を指定します。`ordered` モードでは何もしません。
指定された秒数が経過すると、そのファイルは再インポートされます。

設定可能な値:

* 正の整数

デフォルト値: `0`。

### `cleanup_interval_min_ms` \{#cleanup_interval_min_ms\}

'Ordered' モード用。追跡対象ファイルの TTL および追跡対象ファイル集合の最大数を維持するバックグラウンドタスクについて、その再スケジュールの間隔の下限値を定義します。

デフォルト値: `10000`。

### `cleanup_interval_max_ms` \{#cleanup_interval_max_ms\}

「Ordered」モード用。追跡対象ファイルの TTL と、追跡対象ファイル集合の最大数を維持するバックグラウンドタスクの再スケジュール間隔に対する上限値を定義します。

デフォルト値: `30000`。

### `buckets` \{#buckets\}

「Ordered」モードで使用します。`24.6` から利用可能です。S3Queue テーブルのレプリカが複数あり、それぞれが keeper 内の同一のメタデータディレクトリを使用している場合、`buckets` の値はレプリカ数以上に設定する必要があります。`processing_threads` 設定も併用している場合は、`S3Queue` の処理における実際の並列度合いをこの設定が決定するため、`buckets` 設定の値をさらに大きくすることが推奨されます。

### `use_persistent_processing_nodes` \{#use_persistent_processing_nodes\}

デフォルトでは、S3Queue テーブルは常に一時的な処理ノードを使用しており、ZooKeeper セッションが、S3Queue が処理済みファイルを ZooKeeper にコミットする前に期限切れになり、かつ処理は開始されていた場合、データが重複する可能性がありました。この設定により、Keeper セッションの期限切れに起因する重複が発生しないようサーバーを強制的に動作させます。

### `persistent_processing_nodes_ttl_seconds` \{#persistent_processing_nodes_ttl_seconds\}

サーバーが正常終了しなかった場合、`use_persistent_processing_nodes` が有効になっていると、処理ノードが削除されずに残る可能性があります。この設定は、それらの処理ノードを安全にクリーンアップできる猶予時間を定義します。

デフォルト値: `3600`（1時間）。

## S3 に関連する設定 \{#s3-settings\}

このエンジンは、すべての S3 関連の設定をサポートしています。S3 に関する設定の詳細は[こちら](../../../engines/table-engines/integrations/s3.md)を参照してください。

## S3 ロールベースアクセス \{#s3-role-based-access\}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

`s3Queue` テーブルエンジンはロールベースのアクセスをサポートしています。
バケットにアクセスするためのロールを設定する手順については、[こちら](/cloud/data-sources/secure-s3) のドキュメントを参照してください。

ロールを設定したら、以下のように `extra_credentials` パラメータで `roleARN` を指定できます：

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

## S3Queue ordered モード \{#ordered-mode\}

`S3Queue` の処理モードは ZooKeeper に保存するメタデータ量を減らせますが、その代わりに、後から追加されるファイルほど名前が英数字の辞書順で大きくなっている必要があるという制限があります。

`S3Queue` の `ordered` モードは、`unordered` と同様に `(s3queue_)processing_threads_num` という設定（`s3queue_` プレフィックスは省略可能）をサポートしており、サーバー上でローカルに `S3` ファイルを処理するスレッド数を制御できます。
加えて、`ordered` モードでは `(s3queue_)buckets` という別の設定も導入されており、これは「論理スレッド」を意味します。これは、`S3Queue` テーブルのレプリカを持つサーバーが複数存在するような分散シナリオにおいて、この設定が処理ユニット数を定義することを意味します。例えば、各 `S3Queue` レプリカ上の各処理スレッドは、処理対象として特定の `bucket` をロックしようとし、各 `bucket` はファイル名のハッシュによって特定のファイルに割り当てられます。そのため、分散シナリオでは `(s3queue_)buckets` 設定をレプリカ数以上にすることが強く推奨されます。`buckets` の数がレプリカ数より多くても問題ありません。最も望ましい構成は、`(s3queue_)buckets` 設定を `number_of_replicas` と `(s3queue_)processing_threads_num` の積に等しくすることです。
`(s3queue_)processing_threads_num` 設定はバージョン `24.6` より前では使用を推奨しません。
`(s3queue_)buckets` 設定はバージョン `24.6` 以降で利用可能です。

## S3Queue テーブルエンジンからの SELECT \{#select\}

S3Queue テーブルに対する SELECT クエリは、デフォルトでは禁止されています。これは、データを 1 回だけ読み取り、その後キューから削除するという一般的なキューのパターンに従うためです。SELECT を禁止することで、誤ってデータを失うことを防ぎます。
ただし、場合によってはこれが役立つこともあります。そのためには、`stream_like_engine_allow_direct_select` 設定を `True` にする必要があります。
S3Queue エンジンには、SELECT クエリ用の特別な設定 `commit_on_select` があります。これを `False` に設定すると、読み取り後もデータをキューに保持し、`True` に設定すると削除します。

## 説明 \{#description\}

`SELECT` は、各ファイルを 1 回しかインポートできないため（デバッグ用途を除いて）ストリーミングインポートにはあまり有用ではありません。代わりに、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md) を使ってリアルタイムの処理フローを作成する方が実用的です。そのためには次のようにします。

1. 指定した S3 内のパスからデータを消費するテーブルを S3 エンジンで作成し、それをデータストリームと見なします。
2. 目的の構造を持つテーブルを作成します。
3. エンジンからのデータを変換し、事前に作成したテーブルに書き込むマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに紐付けられると、バックグラウンドでデータの取り込みを開始します。

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

## 仮想カラム \{#virtual-columns\}

- `_path` — ファイルへのパス。
- `_file` — ファイル名。
- `_size` — ファイルのサイズ。
- `_time` — ファイルの作成時刻。

仮想カラムの詳細については[こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns)を参照してください。

## パス内のワイルドカード \{#wildcards-in-path\}

`path` 引数では、bash 風のワイルドカードを使用して複数のファイルを指定できます。ファイルが処理対象となるには、実際に存在し、パスパターン全体に完全一致している必要があります。ファイルの一覧は `SELECT` 実行時に決定されます（`CREATE` 時点ではありません）。

* `*` — `/` を除く任意の文字列（空文字列を含む）に対して任意の長さでマッチします。
* `**` — `/` を含む任意の文字列（空文字列を含む）に対して任意の長さでマッチします。
* `?` — 任意の 1 文字にマッチします。
* `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれか 1 つにマッチします。
* `{N..M}` — N から M までの範囲（両端を含む）の任意の数値にマッチします。N と M には先頭にゼロを含めることができ、例えば `000..078` のように指定できます。

`{}` を用いた構文は [remote](../../../sql-reference/table-functions/remote.md) テーブル関数と類似しています。

## 制限事項 \{#limitations\}

1. 行の重複は以下の要因により発生する可能性があります：

* ファイル処理の途中のパース時に例外が発生し、`s3queue_loading_retries` によってリトライが有効になっている場合。

* 複数のサーバーで同じ ZooKeeper のパスを指すように `S3Queue` が構成されており、1つのサーバーが処理済みファイルをコミットする前に Keeper セッションが期限切れになった場合。これにより、別のサーバーがそのファイルの処理を引き継ぐ可能性があり、そのファイルは最初のサーバーによって部分的または完全に処理されている場合があります。ただし、バージョン 25.8 以降で `use_persistent_processing_nodes = 1` が設定されている場合、これは発生しません。

* サーバーの異常終了。

2. 複数のサーバーで同じ ZooKeeper のパスを指すように `S3Queue` が構成されており、かつ `Ordered` モードが使用されている場合、`s3queue_loading_retries` は動作しません。これは近いうちに修正される予定です。

## 内部状態の確認 \{#introspection\}

内部状態の確認には、ステートレスな `system.s3queue` テーブルと永続的な `system.s3queue_log` テーブルを使用します。

1. `system.s3queue`。このテーブルは永続化されず、`S3Queue` のメモリ上の状態を表示します。現在処理中のファイル、処理済みのファイル、失敗したファイルを確認できます。

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

例：

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

2. `system.s3queue_log`。永続テーブル。`system.s3queue` と同じ情報を持ちますが、対象は `processed` および `failed` のファイルです。

このテーブルは次の構造を持ちます。

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
ORDER BY (event_date, event_time) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

`system.s3queue_log` を使用するには、サーバー設定ファイルで構成を定義する必要があります。

```xml
    <s3queue_log>
        <database>system</database>
        <table>s3queue_log</table>
    </s3queue_log>
```

例：

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
