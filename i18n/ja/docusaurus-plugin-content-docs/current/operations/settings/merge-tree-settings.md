---
slug: /operations/settings/merge-tree-settings
title: "MergeTree テーブル設定"
description: "`system.merge_tree_settings` にある MergeTree の設定"
---

システムテーブル `system.merge_tree_settings` は、グローバルに設定された MergeTree 設定を表示します。

MergeTree の設定は、サーバーの設定ファイルの `merge_tree` セクションに設定することも、各 `MergeTree` テーブルごとに `CREATE TABLE` 文の `SETTINGS` 句で指定することもできます。

`max_suspicious_broken_parts` 設定をカスタマイズする例:

サーバーの設定ファイルで全 `MergeTree` テーブルのデフォルトを設定する：

``` text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

特定のテーブルに設定する：

``` sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

`ALTER TABLE ... MODIFY SETTING` を使用して特定のテーブルの設定を変更する：

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- グローバルデフォルトにリセット（system.merge_tree_settings からの値）
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```
## allow_nullable_key {#allow_nullable_key}

主キーとして Nullable 型を許可します。

デフォルト値: 0。

## index_granularity {#index_granularity}

インデックスのマーク間のデータ行の最大数。

デフォルト値: 8192。

## index_granularity_bytes {#index_granularity_bytes}

データグラニュールの最大サイズ（バイト単位）。

デフォルト値: 10485760（約 10 MiB）。

行数でのみグラニュールサイズを制限するには、0 に設定します（推奨されません）。

## min_index_granularity_bytes {#min_index_granularity_bytes}

データグラニュールの最小許容サイズ（バイト単位）。

デフォルト値: 1024b。

非常に低い `index_granularity_bytes` でテーブルを作成するのを偶発的に防ぐための保護を提供します。

## enable_mixed_granularity_parts {#enable_mixed_granularity_parts}

`index_granularity_bytes` 設定でグラニュールサイズを制御するための移行を有効または無効にします。バージョン 19.11 の前は、グラニュールサイズを制限するために `index_granularity` 設定のみがありました。`index_granularity_bytes` 設定は、大きな行（数十メガバイトや数百メガバイト）のテーブルからデータを選択する際の ClickHouse のパフォーマンスを改善します。大きな行のあるテーブルがある場合は、この設定を有効にして `SELECT` クエリの効率を向上させることができます。

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeper におけるデータパーツヘッダーのストレージ方法。これを有効にすると、ZooKeeper が保存するデータが少なくなります。詳細については、[こちら](../server-configuration-parameters/settings.md/#server-settings-use_minimalistic_part_header_in_zookeeper)を参照してください。

## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io}

ストレージディスクに対して直接 I/O アクセスを使用する必要があるマージ操作の最小データ容量。
データパーツをマージする際、ClickHouse はマージされるすべてのデータの合計ストレージボリュームを計算します。
合計が `min_merge_bytes_to_use_direct_io` バイトを超える場合、ClickHouse は直接 I/O インターフェース（`O_DIRECT` オプション）を使用してデータをストレージディスクに読み書きします。
`min_merge_bytes_to_use_direct_io = 0` の場合、直接 I/O は無効になります。

デフォルト値: `10 * 1024 * 1024 * 1024` バイト。

## ttl_only_drop_parts {#ttl_only_drop_parts}

すべての行がそのパーツの `TTL` 設定に従って期限切れになったときに、MergeTree テーブル内のデータパーツを完全に削除するかどうかを制御します。

`ttl_only_drop_parts` が無効（デフォルト）になっている場合、TTL 設定に基づいて期限切れとなった行のみが削除されます。

`ttl_only_drop_parts` が有効になっている場合、そのパーツ内のすべての行が `TTL` 設定に従って期限切れになった場合、パーツ全体が削除されます。

デフォルト値: 0。

## merge_with_ttl_timeout {#merge_with_ttl_timeout}

削除 TTL でのマージを繰り返す前の最小遅延（秒単位）。

デフォルト値: `14400` 秒（4 時間）。

## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout}

再圧縮 TTL でのマージを繰り返す前の最小遅延（秒単位）。

デフォルト値: `14400` 秒（4 時間）。

## write_final_mark {#write_final_mark}

データパーツの最後（最後のバイトの後）に最終インデックスマークを書くことを有効または無効にします。

デフォルト値: 1。

変更しないでください。さもなくば悪いことが起こります。

## storage_policy {#storage_policy}

ストレージポリシー。

## min_bytes_for_wide_part {#min_bytes_for_wide_part}

`Wide` フォーマットで保存できるデータパーツの最小バイト数/行数。
これらの設定のうち、1 つまたは両方またはどちらも設定できます。

## max_compress_block_size {#max_compress_block_size}

テーブルに書き込む前の未圧縮データのブロックの最大サイズ。
この設定は、グローバル設定でも指定できます（[max_compress_block_size](/operations/settings/settings.md/#max-compress-block-size) 設定を参照）。
テーブルが作成されるときに指定された値は、この設定のグローバル値を上書きします。

## min_compress_block_size {#min_compress_block_size}

次のマークを書き込むときに圧縮のために必要な未圧縮データのブロックの最小サイズ。
この設定は、グローバル設定でも指定できます（[min_compress_block_size](/operations/settings/settings.md/#min-compress-block-size) 設定を参照）。
テーブルが作成されるときに指定された値は、この設定のグローバル値を上書きします。

## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms}

パーツをマージするために再選択する前の最大待機時間。設定が低いと、`background_schedule_pool` で選択タスクが頻繁にトリガーされ、大規模クラスターで ZooKeeper へのリクエストが大量に発生します。

デフォルト値: `60000`

## max_suspicious_broken_parts {#max_suspicious_broken_parts}

単一のパーティション内の壊れたパーツの数が `max_suspicious_broken_parts` 値を超えると、自動削除が拒否されます。

可能な値：

- 任意の正の整数。

デフォルト値: 100。

## parts_to_throw_insert {#parts-to-throw-insert}

単一のパーティション内のアクティブパーツの数が `parts_to_throw_insert` 値を超えると、`INSERT` が `Too many parts (N). Merges are processing significantly slower than inserts` 例外で中断されます。

可能な値：

- 任意の正の整数。

デフォルト値: 3000。

`SELECT` クエリの最大パフォーマンスを得るには、処理されるパーツの数を最小限に抑える必要があります。詳細は [Merge Tree](../../development/architecture.md#merge-tree)を参照してください。

23.6 より前は、この設定は 300 に設定されていました。より高い異なる値を設定すると、`Too many parts` エラーの可能性が減少しますが、その一方で `SELECT` のパフォーマンスが悪化する可能性があります。また、マージの問題が発生した場合（たとえば、ディスクスペースが不足している場合）、元の 300 よりも遅れて気づくことになります。

## parts_to_delay_insert {#parts-to-delay-insert}

単一のパーティション内のアクティブパーツの数が `parts_to_delay_insert` 値を超えると、`INSERT` が人工的に遅延します。

可能な値：

- 任意の正の整数。

デフォルト値: 1000。

ClickHouse は `INSERT` を人工的に長く（'sleep' を追加）実行し、バックグラウンドマージプロセスがパーツを追加されるよりも早くマージできるようにします。

## inactive_parts_to_throw_insert {#inactive-parts-to-throw-insert}

単一のパーティション内の非アクティブパーツの数が `inactive_parts_to_throw_insert` 値を超えると、`INSERT` が "Too many inactive parts (N). Parts cleaning are processing significantly slower than inserts" 例外で中断されます。

可能な値：

- 任意の正の整数。

デフォルト値: 0（無制限）。

## inactive_parts_to_delay_insert {#inactive-parts-to-delay-insert}

テーブル内の単一パーティションの非アクティブパーツの数が `inactive_parts_to_delay_insert` 値以上になると、`INSERT` が人工的に遅延します。これは、サーバーがパーツを迅速にクリーンアップできない場合に便利です。

可能な値：

- 任意の正の整数。

デフォルト値: 0（無制限）。

## max_delay_to_insert {#max-delay-to-insert}

アクティブパーツの数が [parts_to_delay_insert](#parts-to-delay-insert) 値を超えた場合に、`INSERT` 遅延を計算するために使用される秒数の値。

可能な値：

- 任意の正の整数。

デフォルト値: 1。

`INSERT` の遅延（ミリ秒単位）は、次の式で計算されます：
```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```
たとえば、パーティションに 299 のアクティブパーツがあり、parts_to_throw_insert = 300、parts_to_delay_insert = 150、max_delay_to_insert = 1 の場合、`INSERT` は `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` ミリ秒遅延します。

バージョン 23.1 以降、式が次のように変更されました：
```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000) * parts_over_threshold / allowed_parts_over_threshold)
```
たとえば、パーティションに 224 のアクティブパーツがあり、parts_to_throw_insert = 300、parts_to_delay_insert = 150、max_delay_to_insert = 1、min_delay_to_insert_ms = 10 の場合、`INSERT` は `max( 10, 1 * 1000 * (224 - 150 + 1) / (300 - 150) ) = 500` ミリ秒遅延します。

## max_parts_in_total {#max-parts-in-total}

全テーブルのすべてのパーティション内のアクティブパーツの総数が `max_parts_in_total` 値を超えると、`INSERT` が `Too many parts (N)` 例外で中断されます。

可能な値：

- 任意の正の整数。

デフォルト値: 100000。

テーブル内の多くのパーツは ClickHouse クエリのパフォーマンスを低下させ、ClickHouse の起動時間を増加させます。これは最も多くの場合、不適切な設計（パーティション戦略の選択における誤り-あまりに小さいパーティション）の結果です。

## simultaneous_parts_removal_limit {#simultaneous-parts-removal-limit}

古いパーツが多数存在する場合、クリーンアップスレッドが1 回のイテレーションで `simultaneous_parts_removal_limit` パーツを削除しようとします。
`simultaneous_parts_removal_limit` が `0` に設定されている場合、無制限を意味します。

デフォルト値: 0。

## replicated_deduplication_window {#replicated_deduplication-window}

ClickHouse Keeper が重複チェックのためにハッシュ合計を保存する最近挿入されたブロックの数。

可能な値：

- 任意の正の整数。
- 0（重複排除を無効にする）

デフォルト値: 1000。

`Insert` コマンドは 1 つ以上のブロック（パーツ）を作成します。[挿入の重複排除](../../engines/table-engines/mergetree-family/replication.md) のために、レプリケートされたテーブルに書き込むと、ClickHouse は作成されたパーツのハッシュ合計を ClickHouse Keeper に書き込みます。ハッシュ合計は最も最近の `replicated_deduplication_window` ブロックのみが保存され、古いハッシュ合計は ClickHouse Keeper から削除されます。
`replicated_deduplication_window` が大きいと、`Insert` 処理が遅くなります。

ハッシュ合計はフィールド名、タイプ、および挿入されたパーツのデータ（バイトのストリーム）から計算されます。

## non_replicated_deduplication_window {#non-replicated-deduplication-window}

非レプリケートされた [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルでハッシュ合計を保存して重複をチェックする最近挿入されたブロックの数。

可能な値：

- 任意の正の整数。
- 0（重複排除を無効にする）。

デフォルト値： 0。

レプリケートされたテーブルと同様の重複排除メカニズムが使用されています（[replicated_deduplication_window](#replicated-deduplication-window) 設定を参照）。作成されたパーツのハッシュ合計は、ディスク上のローカルファイルに書き込まれます。

## replicated_deduplication_window_seconds {#replicated_deduplication-window-seconds}

挿入されたブロックのハッシュ合計が ClickHouse Keeper から削除されるまでの秒数。

可能な値：

- 任意の正の整数。

デフォルト値: 604800（1 週間）。

[replicated_deduplication_window](#replicated-deduplication-window) と同様に、`replicated_deduplication_window_seconds` は挿入の重複排除のためにブロックのハッシュ合計を保存しておく時間を指定します。`replicated_deduplication_window_seconds` より古いハッシュ合計は ClickHouse Keeper から削除されます。

この時間は、最も最近のレコードの時間に対して相対的で、壁の時間とは対照的です。それが唯一のレコードである場合は、永遠に保存されます。

## replicated_deduplication_window_for_async_inserts {#replicated_deduplication-window-for-async-inserts}

非同期で挿入された最近のブロックの数のうち、ClickHouse Keeper が重複チェックのためにハッシュ合計を保存します。

可能な値：

- 任意の正の整数。
- 0（非同期挿入の重複排除を無効にする）

デフォルト値: 10000。

[Async Insert](./settings.md#async-insert) コマンドは 1 つ以上のブロック（パーツ）でキャッシュされます。[挿入の重複排除](../../engines/table-engines/mergetree-family/replication.md) のために、レプリケートされたテーブルに書き込むと、ClickHouse は各挿入のハッシュ合計を ClickHouse Keeper に書き込みます。ハッシュ合計は最も最近の `replicated_deduplication_window_for_async_inserts` ブロックのためだけに保存され、古いハッシュ合計は ClickHouse Keeper から削除されます。
`replicated_deduplication_window_for_async_inserts` が大きいと、`Async Inserts` が遅くなる可能性があります。

ハッシュ合計はフィールド名、タイプ、および挿入されたデータ（バイトのストリーム）から計算されます。

## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication-window-seconds-for-async_inserts}

非同期挿入のハッシュ合計が ClickHouse Keeper から削除されるまでの秒数。

可能な値：

- 任意の正の整数。

デフォルト値: 604800（1 週間）。

[replicated_deduplication_window_for_async_inserts](#replicated-deduplication-window-for-async-inserts) と同様に、`replicated_deduplication_window_seconds_for_async_inserts` は非同期挿入の重複排除のためにブロックのハッシュ合計を保存しておく時間を指定します。`replicated_deduplication_window_seconds_for_async_inserts` より古いハッシュ合計は ClickHouse Keeper から削除されます。

この時間は、最も最近のレコードの時間に対して相対的で、壁の時間とは対照的です。それが唯一のレコードである場合は、永遠に保存されます。

## use_async_block_ids_cache {#use-async-block-ids-cache}

真の場合、非同期挿入のハッシュ合計をキャッシュします。

可能な値：

- true、false

デフォルト値: false。

複数の非同期挿入を持つブロックは、複数のハッシュ合計を生成します。いくつかの挿入が重複する場合、Keeper は1 回の RPC で1 つの重複したハッシュ合計のみを返し、不必要な RPC 再試行を引き起こします。このキャッシュは Keeper でハッシュ合計のパスを監視します。アップデートが Keeper で監視されると、キャッシュはできるだけ早く更新され、重複した挿入をメモリ内でフィルタリングできるようになります。

## async_block_ids_cache_min_update_interval_ms {#async_block_ids_cache_min_update_interval_ms}

`use_async_block_ids_cache` を更新するための最小間隔（ミリ秒単位）。

可能な値：

- 任意の正の整数。

デフォルト値: 100。

通常、`use_async_block_ids_cache` は、監視された Keeper パスにアップデートがあるとすぐに更新されます。しかし、キャッシュの更新が頻繁すぎて負担になることがあります。この最小間隔は、キャッシュがあまりにも速く更新されないようにします。この値を長くしすぎると、重複した挿入を持つブロックは再試行時間が長くなることに注意してください。

## max_replicated_logs_to_keep {#max_replicated_logs_to_keep}

非アクティブなレプリカがある場合、ClickHouse Keeper ログに記録されている可能なレコード数。非アクティブなレプリカは、この数を超えると失われます。

可能な値：

- 任意の正の整数。

デフォルト値: 1000

## min_replicated_logs_to_keep {#min_replicated_logs_to_keep}

古いものであっても、ZooKeeper ログにこの数の最新レコードを保持します。これは、クリーニング前の ZooKeeper ログを診断するためにのみ使用され、テーブルの動作には影響しません。

可能な値：

- 任意の正の整数。

デフォルト値: 10

## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold}

レプリケーションログ（ClickHouse Keeper または ZooKeeper）のエントリ作成から経過した時間がこの閾値を超え、かつパーツのサイズの合計が `prefer_fetch_merged_part_size_threshold` を超える場合、ローカルでマージを行う代わりにレプリカからマージ済みパーツを取得することを優先します。これは、非常に長いマージを迅速化するためのものです。

可能な値：

- 任意の正の整数。

デフォルト値: 3600

## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold}

パーツのサイズの合計がこの閾値を超え、かつレプリケーションログのエントリ作成からの時間が `prefer_fetch_merged_part_time_threshold` を超える場合、ローカルでマージを行う代わりにレプリカからマージ済みパーツを取得することを優先します。これは、非常に長いマージを迅速化するためのものです。

可能な値：

- 任意の正の整数。

デフォルト値: 10,737,418,240

## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold}

この設定の値が 0 より大きい場合、1 つのレプリカのみがマージを直ちに開始し、他のレプリカはその結果をダウンロードするために最大でその時間だけ待機します。選択されたレプリカがその時間内にマージを完了しなかった場合、標準の動作にフォールバックします。

可能な値：

- 任意の正の整数。

デフォルト値: 0（秒）

## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold}

この設定の値が 0 より大きい場合、共有ストレージ上のマージ済みパーツがあり、`allow_remote_fs_zero_copy_replication` が有効な場合にのみ、1 つのレプリカが直ちにマージを開始します。

:::note ゼロコピー複製は本番環境向けではない
ゼロコピー複製は ClickHouse バージョン 22.8 以降はデフォルトで無効です。この機能は本番環境での使用は推奨されません。
:::

可能な値：

- 任意の正の整数。

デフォルト値: 10800

## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout}

再圧縮によるマージを開始する前のタイムアウト（秒単位）。この時間内、ClickHouse は再圧縮を担当するレプリカから再圧縮されたパーツを取得しようとします。

再圧縮はほとんどの場合遅いので、このタイムアウトが過ぎるまで再圧縮によるマージは開始せず、再圧縮されたパーツを取得しようとします。

可能な値：

- 任意の正の整数。

デフォルト値：

7200

## always_fetch_merged_part {#always_fetch_merged_part}

真の場合、このレプリカは決してパーツをマージせず、常に他のレプリカからマージ済みパーツをダウンロードします。

可能な値：

- true、false

デフォルト値: false

## max_suspicious_broken_parts {#max_suspicious_broken_parts-1}

壊れたパーツの最大数。それを超えると自動削除を拒否します。

可能な値：

- 任意の正の整数。

デフォルト値: 100

## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes}

壊れたパーツの合計サイズの最大値。それを超えると自動削除を拒否します。

可能な値：

- 任意の正の整数。

デフォルト値: 1,073,741,824

## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns}

修正（削除または追加）するファイルの数がこの設定を超えた場合、ALTER を適用しません。

可能な値：

- 任意の正の整数。

デフォルト値: 75

## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns}

削除するファイルの数がこの設定を超えた場合、ALTER を適用しません。

可能な値：

- 任意の正の整数。

デフォルト値: 50

## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts}

壊れたパーツの比率が総パーツ数のこの値より小さい場合、開始を許可します。

可能な値：

- Float、0.0 - 1.0

デフォルト値: 0.5

## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host}

エンドポイントからの並列取得を制限します（実際にはプールサイズ）。

可能な値：

- 任意の正の整数。

デフォルト値: 15

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout-1}

パーツ取得リクエストの HTTP 接続タイムアウト。明示的に設定されていない場合はデフォルトプロファイル `http_connection_timeout` から継承されます。

可能な値：

- 任意の正の整数。

デフォルト値：

明示的に設定されていない場合はデフォルトプロファイル `http_connection_timeout` から継承されます。

## replicated_can_become_leader {#replicated_can_become_leader}

真の場合、このノード上のレプリケートテーブルのレプリカはリーダーシップを獲得しようとします。

可能な値：

- true、false

デフォルト値: true

## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period}

ZooKeeper セッションの有効期限チェック間隔（秒単位）。

可能な値：

- 任意の正の整数。

デフォルト値: 60

## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica}

失われたレプリカを修復するときに古いローカルパーツを削除しないようにします。

可能な値：

- true、false

デフォルト値: true

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

パーツ取得リクエストの HTTP 接続タイムアウト（秒単位）。明示的に設定されていない場合はデフォルトプロファイル [http_connection_timeout](./settings.md#http_connection_timeout) から継承されます。

可能な値：

- 任意の正の整数。
- 0 - `http_connection_timeout` の値を使用。

デフォルト値: 0。

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout}

パーツ取得リクエストの HTTP 送信タイムアウト（秒単位）。明示的に設定されていない場合はデフォルトプロファイル [http_send_timeout](./settings.md#http_send_timeout) から継承されます。

可能な値：

- 任意の正の整数。
- 0 - `http_send_timeout` の値を使用。

デフォルト値: 0。

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout}

パーツ取得リクエストの HTTP 受信タイムアウト（秒単位）。明示的に設定されていない場合はデフォルトプロファイル [http_receive_timeout](./settings.md#http_receive_timeout) から継承されます。

可能な値：

- 任意の正の整数。
- 0 - `http_receive_timeout` の値を使用。

デフォルト値: 0。

## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth}

[レプリケートされた](../../engines/table-engines/mergetree-family/replication.md) 取得のためのネットワークを介したデータ交換の最大速度（バイト/秒）を制限します。この設定は特定のテーブルに適用され、[max_replicated_fetches_network_bandwidth_for_server](settings.md#max_replicated_fetches_network_bandwidth_for_server) 設定はサーバーに適用されます。

サーバーネットワークと特定のテーブルのネットワークを制限できますが、テーブルレベルの設定の値はサーバーレベルのものより小さくなければなりません。それ以外の場合、サーバーは `max_replicated_fetches_network_bandwidth_for_server` 設定のみを考慮します。

この設定は正確には追尾されません。

可能な値：

- 正の整数。
- 0 — 無制限。

デフォルト値: `0`。

**使用法**

新しいノードを追加または置き換えるときのデータ複製の速度を制御するために使用できます。

## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth}

[レプリケートされた](../../engines/table-engines/mergetree-family/replication.md) 送信のためのネットワークを介したデータ交換の最大速度（バイト/秒）を制限します。この設定は特定のテーブルに適用され、[max_replicated_sends_network_bandwidth_for_server](settings.md#max_replicated_sends_network_bandwidth_for_server) 設定はサーバーに適用されます。

サーバーネットワークと特定のテーブルのネットワークを制限できますが、テーブルレベルの設定の値はサーバーレベルのものより小さくなければなりません。それ以外の場合、サーバーは `max_replicated_sends_network_bandwidth_for_server` 設定のみを考慮します।

この設定は正確には追尾されません。

可能な値：

- 正の整数。
- 0 — 無制限。

デフォルト値: `0`。

**使用法**

新しいノードを追加または置き換えるときのデータ複製の速度を制御するために使用できます。

## old_parts_lifetime {#old-parts-lifetime}

突発的なサーバー再起動中のデータ損失を防ぐために非アクティブパーツを保持する時間（秒単位）。

可能な値：

- 任意の正の整数。

デフォルト値: 480。

複数のパーツを新しいパーツにマージする際、ClickHouse は元のパーツを非アクティブとしてマークし、`old_parts_lifetime` 秒後にのみ削除します。
非アクティブパーツは現在のクエリで使用されていない場合、つまりそのパーツの `refcount` が 1 の場合に削除されます。

新しいパーツには `fsync` は呼び出されないため、一時的に新しいパーツはサーバーの RAM（OS キャッシュ）にのみ存在します。サーバーが突発的に再起動された場合、新しいパーツは失われるか損傷する可能性があります。
データを保護するために、非アクティブなパーツはすぐに削除されません。

起動時に ClickHouse はパーツの整合性をチェックします。
マージされたパーツが損傷している場合、ClickHouse は非アクティブなパーツをアクティブリストに戻し、後で再度マージします。その後、損傷したパーツは名前が変更され（`broken_` プレフィックスが付加され）、`detached` フォルダに移動されます。
マージされたパーツが損傷していない場合、元の非アクティブパーツは名前が変更され（`ignored_` プレフィックスが付加され）、`detached` フォルダに移動されます。

デフォルトの `dirty_expire_centisecs` 値（Linux カーネル設定）は 30 秒（書き込まれたデータが RAM にのみ保存される最大時間）ですが、ディスクシステムに負荷がかかる場合、データが遅れて書き込まれることがあります。`old_parts_lifetime` に対して 480 秒という値が実験的に選ばれ、これにより新しいパーツがディスクに安全に書き込まれることが保証されます。

## max_bytes_to_merge_at_max_space_in_pool {#max-bytes-to-merge-at-max-space-in-pool}

十分なリソースがある場合に、1 つのパーツにマージされる最大の合計パーツサイズ（バイト単位）。
自動バックグラウンドマージによって作成された最大の可能性のあるパーツサイズにおおよそ対応します。

可能な値：

- 任意の正の整数。

デフォルト値: 161061273600（150 GB）。

マージスケジューラは定期的にパーティション内のパーツのサイズと数を分析し、プールに十分な空きリソースがある場合にバックグラウンドマージを開始します。
マージは、ソースパーツの合計サイズが `max_bytes_to_merge_at_max_space_in_pool` を超えるまで続きます。

[OPTIMIZE FINAL](../../sql-reference/statements/optimize.md) によって開始されるマージは、`max_bytes_to_merge_at_max_space_in_pool` を無視し（空きディスクスペースのみが考慮されます）。

## max_bytes_to_merge_at_min_space_in_pool {#max-bytes-to-merge-at-min-space-in-pool}

最低限のリソースで、1 つのパーツにマージされる最大の合計パーツサイズ（バイト単位）。

可能な値：

- 任意の正の整数。

デフォルト値: 1048576（1 MB）

`max_bytes_to_merge_at_min_space_in_pool` は、利用可能なディスクスペースが不足している場合でもマージできるパーツの最大合計サイズを定義します（プール内に）。これは、小さいパーツの数と `Too many parts` エラーの可能性を減らすために必要です。
マージは、合計マージされたパーツサイズを倍増させてディスクスペースを占有します。したがって、空きディスクスペースが少ない場合、大きなマージによって予約されたこのスペースが原因で別のマージを開始できなくなる可能性があり、小さなパーツの数が挿入ごとに増加します。

## merge_max_block_size {#merge-max-block-size}

マージされたパーツからメモリに読み込まれる行の数。

可能な値：

- 任意の正の整数。

デフォルト値: 8192

マージは、`merge_max_block_size` 行のブロックごとにパーツから行を読み込み、マージして結果を新しいパーツに書き込みます。読み込みされたブロックは RAM に配置されるため、`merge_max_block_size` はマージに必要な RAM サイズに影響します。したがって、テーブルの行が非常に広い場合、マージには大量の RAM が消費される可能性があります（平均的な行サイズが 100kb の場合、10 パーツをマージすると (100kb * 10 * 8192) = ~ 8GB の RAM）。`merge_max_block_size` を減少させることで、マージに必要な RAM の量を減少させることができますが、マージ速度が低下します。

## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number-of-free-entries-in-pool-to-lower-max-size-of-merge}

プール内に指定された数の空きエントリ（またはレプリケートキュー）がない場合、処理するマージの最大サイズを減少させ始めます（またはキューに入れます）。
これは、小さなマージが処理できるようにするためであり、長時間実行されるマージでプールを埋めることはありません。

可能な値：

- 任意の正の整数。

デフォルト値: 8

## number_of_free_entries_in_pool_to_execute_mutation {#number-of-free-entries-in-pool-to-execute-mutation}

プール内の空きエントリの数が指定された数未満である場合、パーツの変異を実行しません。
これは、通常のマージのためにスレッドを確保し、「Too many parts」を避けるためです。

可能な値：

- 任意の正の整数。

デフォルト値: 20

**使用法**

`number_of_free_entries_in_pool_to_execute_mutation` 設定の値は、[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) の値よりも小さくなければなりません。そうでない場合、ClickHouse は例外をスローします。

## max_part_loading_threads {#max-part-loading-threads}

ClickHouse が起動する際にパーツを読み取るスレッドの最大数。

可能な値：

- 任意の正の整数。

デフォルト値: 自動（CPU コアの数）。

起動時に ClickHouse はすべてのテーブルのすべてのパーツを読み（パーツのメタデータを持つファイルを読み）、メモリ内のすべてのパーツのリストを構築します。パーツの数が非常に多いシステムでは、このプロセスにかなりの時間がかかる可能性があり、`max_part_loading_threads` を増やすことでこの時間を短縮できます（このプロセスが CPU およびディスク I/O に負荷がかかっていない場合）。

## max_partitions_to_read {#max-partitions-to-read}


```html
最大クエリでアクセスできるパーティションの数を制限します。

テーブル作成時に指定された設定値は、クエリレベルの設定で上書きすることができます。

可能な値：

- 任意の正の整数。

デフォルト値：-1（無制限）。

クエリ/セッション/プロファイルレベルで、クエリの複雑さ設定 [max_partitions_to_read](query-complexity#max-partitions-to-read) を指定することもできます。

## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds}

範囲内のすべてのパーツが `min_age_to_force_merge_seconds` の値よりも古い場合にマージパーツを実行します。

デフォルトでは、`max_bytes_to_merge_at_max_space_in_pool` の設定は無視されます（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

可能な値：

- 正の整数。

デフォルト値：0 — 無効。

## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only}

`min_age_to_force_merge_seconds` が部分集合ではなく、全体のパーティションにのみ適用されるべきかどうか。

デフォルトでは、`max_bytes_to_merge_at_max_space_in_pool` の設定は無視されます（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

可能な値：

- true, false

デフォルト値：false

## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge}

設定 `min_age_to_force_merge_seconds` と `min_age_to_force_merge_on_partition_only` が設定 `max_bytes_to_merge_at_max_space_in_pool` を尊重するべきかどうか。

可能な値：

- true, false

デフォルト値：false

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition}

指定された数のフリーエントリがプール内に少ない場合、バックグラウンドでの全体パーティションの最適化を実行しません（これは `min_age_to_force_merge_seconds` が設定され、`min_age_to_force_merge_on_partition_only` が有効なときに生成されるタスクです）。これは、通常のマージ用にフリースレッドを置いておくためであり、「パーツが多すぎる」を回避します。

可能な値：

- 正の整数。

デフォルト値：25

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition` 設定の値は、[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) の値よりも小さい必要があります。そうでない場合、ClickHouseは例外をスローします。

## allow_floating_point_partition_key {#allow_floating_point_partition_key}

浮動小数点数をパーティションキーとして許可するための設定です。

可能な値：

- 0 — 浮動小数点パーティションキーは許可されません。
- 1 — 浮動小数点パーティションキーは許可されます。

デフォルト値：`0`。

## check_sample_column_is_correct {#check_sample_column_is_correct}

サンプリングのためのカラムやサンプリング表現のデータ型が正しいことをテーブルの作成時にチェックする機能を有効にします。データ型は、符号なしの [整数型](../../sql-reference/data-types/int-uint.md): `UInt8`, `UInt16`, `UInt32`, `UInt64` のいずれかでなければなりません。

可能な値：

- true  — チェックが有効です。
- false — テーブル作成時のチェックが無効です。

デフォルト値：`true`。

デフォルトでは、ClickHouseサーバーはテーブル作成時にサンプリング用のカラムまたはサンプリング表現のデータ型を確認します。すでに不正なサンプリング表現のテーブルがあり、サーバーが起動時に例外を出さないようにしたい場合は、`check_sample_column_is_correct` を `false` に設定します。

## min_bytes_to_rebalance_partition_over_jbod {#min-bytes-to-rebalance-partition-over-jbod}

新しい大きなパーツをボリュームディスク [JBOD](https://ja.wikipedia.org/wiki/Non-RAID_drive_architectures) に分配する際に、バランス調整を有効にするための最小バイト数を設定します。

可能な値：

- 正の整数。
- 0 — バランス調整は無効。

デフォルト値：`0`。

**使用法**

`min_bytes_to_rebalance_partition_over_jbod` 設定の値は、[max_bytes_to_merge_at_max_space_in_pool](../../operations/settings/merge-tree-settings.md#max-bytes-to-merge-at-max-space-in-pool) / 1024 の値よりも小さくする必要があります。そうでない場合、ClickHouseは例外をスローします。

## detach_not_byte_identical_parts {#detach_not_byte_identical_parts}

マージやミューテーションの後に、他のレプリカのデータパーツとバイト同一でないデータパーツをデタッチするかどうかを有効または無効にします。無効にすると、データパーツは削除されます。後でそのようなパーツを分析する場合は、この設定を有効にしてください。

この設定は、[データレプリケーション](../../engines/table-engines/mergetree-family/replication.md) が有効な `MergeTree` テーブルに適用されます。

可能な値：

- 0 — パーツは削除されます。
- 1 — パーツはデタッチされます。

デフォルト値：`0`。

## merge_tree_clear_old_temporary_directories_interval_seconds {#setting-merge-tree-clear-old-temporary-directories-interval-seconds}

ClickHouseが古い一時ディレクトリのクリーンアップを実行する際のインターバルを秒単位で設定します。

可能な値：

- 任意の正の整数。

デフォルト値：`60` 秒。

## merge_tree_clear_old_parts_interval_seconds {#setting-merge-tree-clear-old-parts-interval-seconds}

ClickHouseが古いパーツ、WAL、およびミューテーションのクリーンアップを実行する際のインターバルを秒単位で設定します。

可能な値：

- 任意の正の整数。

デフォルト値：`1` 秒。

## max_concurrent_queries {#max-concurrent-queries}

MergeTreeテーブルに関連する同時に実行されるクエリの最大数。クエリは他の `max_concurrent_queries` 設定によっても制限されます。

可能な値：

- 正の整数。
- 0 — 制限なし。

デフォルト値：`0`（制限なし）。

**例**

``` xml
<max_concurrent_queries>50</max_concurrent_queries>
```

## min_marks_to_honor_max_concurrent_queries {#min-marks-to-honor-max-concurrent-queries}

[最大同時クエリ数](#max-concurrent-queries) 設定を適用するために、クエリが読み込む必要があるマークの最小数です。クエリは他の `max_concurrent_queries` 設定によっても制限されます。

可能な値：

- 正の整数。
- 0 — 無効（`max_concurrent_queries` 制限はクエリに適用されません）。

デフォルト値：`0`（制限は適用されない）。

**例**

``` xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```

## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization}

カラム内の _default_ 値の数と _all_ 値の数の最小比率です。この値を設定することで、カラムはスパースシリアル化を使用して格納されるようになります。

カラムがスパースである（主にゼロが含まれている）場合、ClickHouseはそれをスパースフォーマットでエンコードし、計算を自動的に最適化することができます - データはクエリ中に完全な解凍を必要としません。このスパースシリアル化を有効にするには、`ratio_of_defaults_for_sparse_serialization` 設定の値を 1.0 未満に設定します。もしこの値が 1.0 以上であれば、カラムは常に通常の完全なシリアリゼーションで書かれます。

可能な値：

- 0 と 1 の間の浮動小数点数（スパースシリアル化を有効にするため）
- 1.0（またはそれ以上）はスパースシリアル化を使用しない場合

デフォルト値：`0.9375`

**例**

次のテーブルの `s` 列は、95% の行に対して空の文字列です。`my_regular_table` でスパースシリアル化を使用せず、`my_sparse_table` では `ratio_of_defaults_for_sparse_serialization` を 0.95 に設定しています：

```sql
CREATE TABLE my_regular_table
(
    `id` UInt64,
    `s` String
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO my_regular_table
SELECT
    number AS id,
    number % 20 = 0 ? toString(number): '' AS s
FROM
    numbers(10000000);


CREATE TABLE my_sparse_table
(
    `id` UInt64,
    `s` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS ratio_of_defaults_for_sparse_serialization = 0.95;

INSERT INTO my_sparse_table
SELECT
    number,
    number % 20 = 0 ? toString(number): ''
FROM
    numbers(10000000);
```

`my_sparse_table` の `s` 列は、ディスク上でのストレージスペースをより少なく使用していることに注意してください：

```sql
SELECT table, name, data_compressed_bytes, data_uncompressed_bytes FROM system.columns
WHERE table LIKE 'my_%_table';
```

```response
┌─table────────────┬─name─┬─data_compressed_bytes─┬─data_uncompressed_bytes─┐
│ my_regular_table │ id   │              37790741 │                75488328 │
│ my_regular_table │ s    │               2451377 │                12683106 │
│ my_sparse_table  │ id   │              37790741 │                75488328 │
│ my_sparse_table  │ s    │               2283454 │                 9855751 │
└──────────────────┴──────┴───────────────────────┴─────────────────────────┘
```

カラムがスパースエンコーディングを使用しているかどうかは、`system.parts_columns` テーブルの `serialization_kind` 列を表示することで確認できます：

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

`s` のどのパーツがスパースシリアリゼーションを使用して格納されているかを見ることができます：

```response
┌─column─┬─serialization_kind─┐
│ id     │ Default            │
│ s      │ Default            │
│ id     │ Default            │
│ s      │ Default            │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
└────────┴────────────────────┘
```

## replace_long_file_name_to_hash {#replace_long_file_name_to_hash}
カラムのファイル名が長すぎる場合（`max_file_name_length` バイトを超える）、SipHash128 に置き換えられます。デフォルト値：`false`。

## max_file_name_length {#max_file_name_length}

ハッシュ化せずにそのまま保持できるファイル名の最大長。設定 `replace_long_file_name_to_hash` が有効な場合にのみ有効になります。この設定の値はファイル拡張子の長さを含みません。したがって、ファイルシステムエラーを避けるために、最大ファイル名長（通常255バイト）よりもいくらか下に設定することをお勧めします。デフォルト値：127。

## allow_experimental_block_number_column {#allow_experimental_block_number_column}

マージ時に仮想カラム `_block_number` を永続化します。

デフォルト値：false。

## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge}

有効な場合、データパーツの推定実際のサイズ（`DELETE FROM` によって削除された行を除外）は、マージするパーツを選択する際に使用されます。この動作は、設定が有効化された後に実行された `DELETE FROM` で影響を受けたデータパーツにのみトリガーされます。

可能な値：

- true, false

デフォルト値：false

**関連情報**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts) 設定

## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts}

[exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) とともに有効な場合、既存データパーツの削除された行数は、テーブルを起動する際に計算されます。この過程でテーブルの起動が遅くなる可能性があります。

可能な値：

- true, false

デフォルト値：false

**関連情報**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 設定

## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization}

Variant データ型における識別子のバイナリシリアリゼーションのコンパクトモードを有効にします。このモードにより、ほとんど1つのバリアントや多数の NULL 値がある場合、パーツ内の識別子のストレージに必要なメモリを大幅に削減できます。

デフォルト値：true

## merge_workload {#merge_workload}

マージとその他のワークロードの間でリソースの利用と共有を調整するために使用されます。指定された値は、このテーブルのバックグラウンドマージのための `workload` 設定値として使用されます。指定されていない場合（空文字列）、サーバ設定 `merge_workload` が代わりに使用されます。

デフォルト値：空文字列

**関連情報**
- [Workload Scheduling](/operations/workload-scheduling.md)

## mutation_workload {#mutation_workload}

ミューテーションとその他のワークロードの間でリソースの利用と共有を調整するために使用されます。指定された値は、このテーブルのバックグラウンドミューテーションのための `workload` 設定値として使用されます。指定されていない場合（空文字列）、サーバ設定 `mutation_workload` が代わりに使用されます。

デフォルト値：空文字列

**関連情報**
- [Workload Scheduling](/operations/workload-scheduling.md)

### optimize_row_order {#optimize_row_order}

挿入中に行の順序を最適化して新しく挿入されたテーブルパーツの圧縮可能性を向上させるかどうかを制御します。

これは通常の MergeTree エンジンテーブルにのみ効果があります。専門の MergeTree エンジンテーブル（例：CollapsingMergeTree）には何の効果もありません。

MergeTree テーブルは、[圧縮コーデック](../../sql-reference/statements/create/table.md#column_compression_codec)を使用して（オプションで）圧縮されます。LZ4 や ZSTD のような一般的な圧縮コーデックは、データがパターンを示す場合に最大圧縮率を達成します。同じ値の長い連続は通常、非常に良く圧縮されます。

この設定が有効な場合、ClickHouse は新しく挿入されたパーツ内のデータを、列の新しいテーブルパーツ内の等しい値のランの数を最小限に抑える順序で保存しようとします。
言い換えれば、少数の等しい値のランは個々のランが長く圧縮されることを意味します。

最適な行順序を見つけることは計算上不可能です（NP困難）。
したがって、ClickHouse はヒューリスティックを使用して、元の行順序よりも圧縮率を改善する行順序を迅速に見つけます。

<details markdown="1">

<summary>行順序を見つけるためのヒューリスティック</summary>

一般に、テーブル（またはテーブルパーツ）の行を自由にシャッフルすることが可能です。 SQL は異なる行順序で同じテーブル（テーブルパーツ）を等価と考えます。

そのため行をシャッフルする自由は、テーブルのプライマリキーが定義されている場合には制限されます。
ClickHouse においてプライマリキー `C1, C2, ..., CN` は、テーブルの行が `C1`、`C2`... `Cn` のカラムで順序付けられることを強制します（[クラスター化インデックス](https://ja.wikipedia.org/wiki/Database_index#Clustered)）。
その結果、行は「等価クラス」の範囲でのみシャッフルでき、すなわちプライマリキーのカラムに同じ値を持つ行です。
高次元プライマリキー、例えば `DateTime64` タイムスタンプ列を含むプライマリキーは、小さな等価クラスを多数生成することになります。
同様に、低次元プライマリキーを持つテーブルは、少数の大きな等価クラスを生成します。
プライマリキーがないテーブルは、全行を含む単一等価クラスの極端なケースを表します。

等価クラスが少なく大きいほど、行を再シャッフルする自由度が高まります。

各等価クラス内で最適な行の順序を見つけるために適用されるヒューリスティックは、D. Lemire および O. Kaser による [Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002) に基づき、各等価クラス内の行を非プライマリーキー列の昇順の基数でソートすることによって行われます。
3つのステップを実行します：
1. プライマリキーのカラムに基づいてすべての等価クラスを見つける。
2. 各等価クラスについて、非プライマリキーのカラムの基数を計算（通常は推定）。
3. 各等価クラスについて、非プライマリキーのカラムの基数が昇順にソートされた行を探す。

</details>

有効な場合、挿入操作は新データの行順序を分析して最適化するために追加の CPU コストを伴います。
データ特性に応じて、INSERT の所要時間は30-50%延長される見込みです。
LZ4 または ZSTD の圧縮率は平均して20-40%改善されます。

この設定は、プライマリキーがないか、低次元のプライマリキーを持つテーブルに最適です。すなわち、少数の異なるプライマリキー値のみを持つテーブルです。
高次元のプライマリキー（例えば、`DateTime64`型のタイムスタンプ列を含む）は、この設定の恩恵を受けないと予想されます。

## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode}

デフォルトでは、軽量削除 `DELETE` はプロジェクションを持つテーブルでは機能しません。これは、プロジェクション内の行が `DELETE` 操作の影響を受ける可能性があるためです。したがって、デフォルト値は `throw` です。
しかし、このオプションは動作を変更することができます。値を `drop` または `rebuild` にすると、削除がプロジェクションで機能します。`drop` はプロジェクションを削除するため、現在のクエリではクイックですが、将来的なクエリではプロジェクションがないため遅くなる可能性があります。
`rebuild` はプロジェクションを再構築し、現在のクエリのパフォーマンスに影響する可能性がありますが、将来的なクエリのパフォーマンスを向上させることができます。良い点は、これらのオプションは部分レベルで機能するだけであるため、触れられない部分のプロジェクションは、その影響を受けずに無傷のままとなります。

可能な値：

- throw, drop, rebuild

デフォルト値：throw

## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode}

非古典的 MergeTree（つまり、（Replicated、Shared）MergeTree でない）を持つテーブルのためにプロジェクションを作成することを許可するかどうか。このオプションは、互換性のために無視されるため、誤った結果になる可能性があります。許可される場合、マージプロジェクションを行う際のアクション（ドロップまたは再構築）を制御します。従って、古典的 MergeTree はこの設定を無視します。
また、すべての MergeTree ファミリーのメンバーに影響を与える `OPTIMIZE DEDUPLICATE` を制御します。`lightweight_mutation_projection_mode` オプションと同様に、部分レベルでもあります。

可能な値：

- ignore, throw, drop, rebuild

デフォルト値：throw

## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert}

データを挿入するために、ディスクスペースに必要な最小バイト数。利用可能なフリーバイト数が `min_free_disk_bytes_to_perform_insert` より少ない場合、例外がスローされ、挿入は実行されません。この設定は次のことを考慮します：
- `keep_free_space_bytes` 設定を考慮する。
- `INSERT` 操作によって書き込まれるデータ量は考慮しない。
- 正の（ゼロでない）バイト数が指定されている場合のみチェックされる。

可能な値：

- 任意の正の整数。

デフォルト値：0 バイト。

`min_free_disk_bytes_to_perform_insert` と `min_free_disk_ratio_to_perform_insert` の両方が指定されている場合、ClickHouse はより多くのフリーメモリで挿入を実行できる値に基づいてカウントします。

## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert}

`INSERT` を実行するために必要な最小のフリーディスクスペース対全体ディスクスペースの比率。0と1の間の浮動小数点値である必要があります。この設定は次のことを考慮します：
- `keep_free_space_bytes` 設定を考慮する。
- `INSERT` 操作によって書き込まれるデータ量は考慮しない。
- 正の（ゼロでない）比率が指定されている場合のみチェックされる。

可能な値：

- 浮動小数点数、0.0 - 1.0

デフォルト値：0.0

`min_free_disk_ratio_to_perform_insert` と `min_free_disk_bytes_to_perform_insert` の両方が指定されている場合、ClickHouse はより多くのフリーメモリで挿入を実行できる値に基づいてカウントします。

## allow_experimental_reverse_key {#allow_experimental_reverse_key}

MergeTree ソートキーの降順並び替えをサポートするための設定です。この設定は、時系列分析および Top-N クエリに特に便利で、データを逆時系列順に保存することでクエリパフォーマンスを最適化します。

`allow_experimental_reverse_key` が有効な場合、MergeTree テーブルの `ORDER BY` 句内で降順を定義できます。これにより、降順クエリに対して `ReadInReverseOrder` の代わりにより効率的な `ReadInOrder` 最適化を使用できるようになります。

**例**

```sql
CREATE TABLE example
(
    time DateTime,
    key Int32,
    value String
) ENGINE = MergeTree
ORDER BY (time DESC, key)  -- 'time'フィールドの降順
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

クエリで `ORDER BY time DESC` を使用すると、`ReadInOrder` が適用されます。

**デフォルト値：** false

## cache_populated_by_fetch {#cache_populated_by_fetch}

:::note
この設定は、ClickHouse Cloud のみ適用されます。
:::

`cache_populated_by_fetch` が無効（デフォルト設定）な場合、新しいデータパーツは、これらのパーツを要求するクエリが実行されたときにのみキャッシュに読み込まれます。

有効な場合、`cache_populated_by_fetch` は、クエリをトリガーせずに、すべてのノードがストレージから新しいデータパーツを自動的にキャッシュに読み込むようにします。

デフォルト値：false

**関連情報**

- [ignore_cold_parts_seconds](settings.md/#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](settings.md/#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](settings.md/#cache_warmer_threads)

## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine}

trueの場合、CollapsingMergeTree または VersionedCollapsingMergeTree テーブルの `sign` 列に対して、無効な値（`1` および `-1`）を許可しない暗黙の制約が追加されます。

デフォルト値：false

## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns}

有効な場合、テーブルのすべての数値カラムに対して最小-最大（スキップ）インデックスが追加されます。

デフォルト値：false。

## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns}

有効な場合、テーブルのすべての文字列カラムに対して最小-最大（スキップ）インデックスが追加されます。

デフォルト値：false。

## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge}

有効な場合、マージは新しいパーツのためにスキップインデックスを構築して格納します。

デフォルト：true

## assign_part_uuids {#assign_part_uuids}

有効な場合、各新しいパーツにユニークなパート識別子が割り当てられます。有効にする前に、すべてのレプリカが UUID バージョン 4 をサポートしていることを確認してください。

デフォルト：0。
```
