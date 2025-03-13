---
slug: /operations/settings/merge-tree-settings
title: "MergeTreeテーブルの設定"
description: "`system.merge_tree_settings`に設定されたMergeTreeの設定"
---

システムテーブル `system.merge_tree_settings` は、グローバルに設定されたMergeTreeの設定を表示します。

MergeTreeの設定は、サーバー構成ファイルの `merge_tree` セクションで設定するか、各 `MergeTree` テーブルに対して `CREATE TABLE` ステートメントの `SETTINGS` クローズで指定することができます。

`max_suspicious_broken_parts` 設定のカスタマイズの例:

サーバー構成ファイルですべての `MergeTree` テーブルのデフォルトを設定します。

``` text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

特定のテーブルの設定を行います:

``` sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

特定のテーブルの設定を変更するには `ALTER TABLE ... MODIFY SETTING` を使用します:

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- グローバルデフォルトにリセット (system.merge_tree_settingsからの値)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```
## allow_nullable_key {#allow_nullable_key}

主キーとしてNullable型を許可します。

デフォルト値: 0.
## index_granularity {#index_granularity}

インデックスのマークの間にあるデータ行の最大数。

デフォルト値: 8192.
## index_granularity_bytes {#index_granularity_bytes}

データグラニュールの最大サイズ（バイト）。

デフォルト値: 10485760（約10 MiB）。

グラニュールサイズを行数のみで制限するには、0に設定します（推奨されません）。
## min_index_granularity_bytes {#min_index_granularity_bytes}

データグラニュールの最小許可サイズ（バイト）。

デフォルト値: 1024b。

`index_granularity_bytes`が非常に低いテーブルを誤って作成することから保護します。
## enable_mixed_granularity_parts {#enable_mixed_granularity_parts}

`index_granularity_bytes` 設定を使用してグラニュールサイズを制御するための遷移を有効または無効にします。バージョン19.11以前は、グラニュールサイズを制限するための `index_granularity` 設定だけがありました。`index_granularity_bytes` 設定は、大きな行（数十MBや数百MB）を持つテーブルからデータを選択する際にClickHouseのパフォーマンスを向上させます。大きな行を持つテーブルがある場合、この設定を有効にして、`SELECT`クエリの効率を向上させることができます。
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeperにおけるデータパーツのヘッダーのストレージ方法。これを有効にすると、ZooKeeperは少ないデータを保存します。詳細については[こちら]( /operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)を参照してください。
## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io}

ストレージディスクへの直接I/Oアクセスを使用するために必要なマージ操作の最小データ量。
データパーツをマージする際、ClickHouseはマージされるすべてのデータの合計ストレージボリュームを計算します。
ボリュームが `min_merge_bytes_to_use_direct_io` バイトを超える場合、ClickHouseは直接I/Oインターフェース（`O_DIRECT`オプション）を使用してストレージディスクにデータを読み書きします。
`min_merge_bytes_to_use_direct_io = 0` の場合、直接I/Oは無効になります。

デフォルト値: `10 * 1024 * 1024 * 1024` バイト。
## ttl_only_drop_parts {#ttl_only_drop_parts}

すべての行がその部分の `TTL` 設定に従って期限切れになった場合に、MergeTreeテーブルのデータパーツが完全に削除されるかどうかを制御します。

`ttl_only_drop_parts` が無効（デフォルト）になっている場合、TTL設定に基づいて期限切れになった行のみが削除されます。

`ttl_only_drop_parts` が有効になっている場合、その部分のすべての行が `TTL` 設定に従って期限切れになった場合、全体の部分が削除されます。

デフォルト値: 0.
## merge_with_ttl_timeout {#merge_with_ttl_timeout}

削除TTLでのマージを繰り返す前の最小遅延（秒）。

デフォルト値: `14400`秒（4時間）。
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout}

再圧縮TTLでのマージを繰り返す前の最小遅延（秒）。

デフォルト値: `14400`秒（4時間）。
## write_final_mark {#write_final_mark}

データパートの最後（最後のバイトの後）に最終インデックスマークの書き込みを有効または無効にします。

デフォルト値: 1。

変更しないでください、さもなければ悪いことが起こります。
## storage_policy {#storage_policy}

ストレージポリシー。
## min_bytes_for_wide_part {#min_bytes_for_wide_part}

`Wide` 形式で保存できるデータパート内の最小バイト数/行数。
これらの設定の1つまたは両方またはどちらも設定できます。
## max_compress_block_size {#max_compress_block_size}

テーブルに書き込む前に圧縮される未圧縮データの最大ブロックサイズ。
この設定はグローバル設定でも指定できます（[max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)設定を参照）。
テーブル作成時に指定した値が、この設定のグローバル値を上書きします。
## min_compress_block_size {#min_compress_block_size}

次のマークを書き込む際に圧縮のために必要な未圧縮データのブロックの最小サイズ。
この設定はグローバル設定でも指定できます（[min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)設定を参照）。
テーブル作成時に指定した値が、この設定のグローバル値を上書きします。
## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms}

パーツが選択されなかった後、再度パーツをマージするために選択するまでの最大待機時間。設定が低いと、`background_schedule_pool` で選択タスクが頻繁に発生し、大規模クラスターにおいてZooKeeperへの大量のリクエストが発生します。

デフォルト値: `60000`
## max_suspicious_broken_parts {#max_suspicious_broken_parts}

単一のパーティション内の壊れた部分の数が `max_suspicious_broken_parts` 値を超えた場合、自動削除が拒否されます。

可能な値：

- 任意の正の整数。

デフォルト値: 100.
## parts_to_throw_insert {#parts-to-throw-insert}

単一のパーティション内のアクティブな部分の数が `parts_to_throw_insert` 値を超えた場合、`INSERT` は `Too many parts (N). Merges are processing significantly slower than inserts` 例外で中断されます。

可能な値：

- 任意の正の整数。

デフォルト値: 3000。

`SELECT` クエリの最大パフォーマンスを実現するには、処理されるパーツの数を最小限に抑える必要があります。[Merge Tree](../../development/architecture.md#merge-tree)を参照してください。

23.6以前はこの設定が300に設定されていました。異なる値を高く設定できますが、`Too many parts` エラーの確率を低下させる一方で、`SELECT` パフォーマンスが劣化する可能性があります。また、マージの問題が発生した場合（例えば、ディスクスペース不足のため）には、元の300の場合よりも遅れて気づくことになります。
## parts_to_delay_insert {#parts-to-delay-insert}

単一のパーティション内のアクティブな部分の数が `parts_to_delay_insert` 値を超えた場合、`INSERT` が人工的に遅延します。

可能な値：

- 任意の正の整数。

デフォルト値: 1000。

ClickHouse は `INSERT` を人工的に長く実行（'sleep'を追加）し、バックグラウンドのマージプロセスが追加されるよりもパーツを速くマージできるようにします。
## inactive_parts_to_throw_insert {#inactive-parts-to-throw-insert}

単一のパーティション内の非アクティブな部分の数が `inactive_parts_to_throw_insert` 値を超えた場合、`INSERT` は "Too many inactive parts (N). Parts cleaning are processing significantly slower than inserts" 例外で中断されます。

可能な値：

- 任意の正の整数。

デフォルト値:

0（無制限）。
## inactive_parts_to_delay_insert {#inactive-parts-to-delay-insert}

テーブル内の単一のパーティション内の非アクティブな部分の数が `inactive_parts_to_delay_insert` 値以上である場合、`INSERT` が人工的に遅延します。これは、サーバーがパーツを迅速にクリーンアップできないときに便利です。

可能な値：

- 任意の正の整数。

デフォルト値:

0（無制限）。
## max_delay_to_insert {#max-delay-to-insert}

アクティブな部分の数が単一のパーティションの [parts_to_delay_insert](#parts-to-delay-insert) 値を超えた場合に、`INSERT` 遅延を計算するために使用される値（秒）。

可能な値：

- 任意の正の整数。

デフォルト値: 1。

`INSERT` の遅延（ミリ秒）は次の数式によって計算されます：
```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```
例えば、パーティションが299のアクティブなパーツを持ち、parts_to_throw_insert = 300、parts_to_delay_insert = 150、max_delay_to_insert = 1の場合、`INSERT`は `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` ミリ秒遅延します。

バージョン23.1からは、数式が次のように変更されました:
```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000) * parts_over_threshold / allowed_parts_over_threshold)
```
例えば、パーティションに224のアクティブなパーツがあり、parts_to_throw_insert = 300、parts_to_delay_insert = 150、max_delay_to_insert = 1、min_delay_to_insert_ms = 10の場合、`INSERT`は `max( 10, 1 * 1000 * (224 - 150 + 1) / (300 - 150) ) = 500` ミリ秒遅延します。
## max_parts_in_total {#max-parts-in-total}

テーブルのすべてのパーティションのアクティブな部分の合計数が `max_parts_in_total` 値を超える場合、`INSERT` は `Too many parts (N)` 例外で中断されます。

可能な値：

- 任意の正の整数。

デフォルト値: 100000。

テーブル内のパーツの数が多すぎると、ClickHouseクエリのパフォーマンスが低下し、ClickHouseの起動時間が増加します。これは、最も一般的には誤った設計（パーティショニング戦略の選択ミスによる小さいパーティションの結果）によるものです。
## simultaneous_parts_removal_limit {#simultaneous-parts-removal-limit}

古いパーツが多い場合、クリーンアップスレッドは1回のイテレーションで最大 `simultaneous_parts_removal_limit` パーツを削除しようとします。
`simultaneous_parts_removal_limit` を `0` に設定すると無制限になります。

デフォルト値: 0。
## replicated_deduplication_window {#replicated_deduplication-window}

重複チェックのためにClickHouse Keeperがハッシュサムを保存する最近挿入されたブロックの数。

可能な値：

- 任意の正の整数。
- 0（重複排除を無効にする）

デフォルト値: 1000。

`Insert` コマンドは1つ以上のブロック（パーツ）を作成します。 [挿入の重複排除](../../engines/table-engines/mergetree-family/replication.md)のために、複製テーブルに書き込むとき、ClickHouseは作成されたパーツのハッシュサムをClickHouse Keeperに書き込みます。ハッシュサムは、最近の `replicated_deduplication_window` ブロックのためにのみ保存されます。最も古いハッシュサムはClickHouse Keeperから削除されます。
大量の `replicated_deduplication_window` は `Inserts` の速度を低下させます。なぜなら、より多くのエントリと比較する必要があるからです。
ハッシュサムは、フィールド名と型、及び挿入された部分のデータ（バイトストリーム）から計算されます。
## non_replicated_deduplication_window {#non-replicated-deduplication-window}

重複チェックのために保存される最近挿入されたブロックの数（非複製 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルで）。

可能な値：

- 任意の正の整数。
- 0（重複排除を無効にする）。

デフォルト値: 0。

重複排除メカニズムは、複製テーブルに類似しています（[replicated_deduplication_window](#replicated-deduplication-window)設定を参照）。作成されたパーツのハッシュサムは、ディスク上のローカルファイルに書き込まれます。
## replicated_deduplication_window_seconds {#replicated_deduplication-window-seconds}

挿入ブロックのハッシュサムがClickHouse Keeperから削除されるまでの秒数。

可能な値：

- 任意の正の整数。

デフォルト値: 604800（1週間）。

[replicated_deduplication_window](#replicated-deduplication-window)に似て、`replicated_deduplication_window_seconds`は、挿入の重複排除のためにブロックのハッシュサムを保存する期間を指定します。`replicated_deduplication_window_seconds` より古いハッシュサムはClickHouse Keeperから削除されます。
時間は最新のレコードの時間を基準とし、ウォールタイムではありません。唯一のレコードであれば、永久に保存されます。
## replicated_deduplication_window_for_async_inserts {#replicated_deduplication-window-for-async-inserts}

非同期で挿入された最近のブロックの数で、ClickHouse Keeperが重複をチェックするためのハッシュサムを保存します。

可能な値：

- 任意の正の整数。
- 0（非同期挿入の重複排除を無効にする）

デフォルト値: 10000。

[Async Insert](/operations/settings/settings#async_insert) コマンドは1つ以上のブロック（パーツ）にキャッシュされます。[挿入の重複排除](../../engines/table-engines/mergetree-family/replication.md)では、複製テーブルに書き込む際、ClickHouseは各挿入のハッシュサムをClickHouse Keeperに書き込みます。ハッシュサムは、最近の `replicated_deduplication_window_for_async_inserts` ブロックにのみ保存され、最も古いハッシュサムはClickHouse Keeperから削除されます。
大量の `replicated_deduplication_window_for_async_inserts` は `Async Inserts` の速度を低下させます。なぜなら、より多くのエントリと比較する必要があるからです。
ハッシュサムは、フィールド名と型、及び挿入データ（バイトストリーム）の組成から計算されます。
## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication-window-seconds-for-async_inserts}

非同期挿入のハッシュサムがClickHouse Keeperから削除されるまでの秒数。

可能な値：

- 任意の正の整数。

デフォルト値: 604800（1週間）。

[replicated_deduplication_window_for_async_inserts](#replicated-deduplication-window-for-async-inserts)と同様に、`replicated_deduplication_window_seconds_for_async_inserts`は、非同期挿入の重複排除のためにブロックのハッシュサムを保存する期間を指定します。`replicated_deduplication_window_seconds_for_async_inserts` より古いハッシュサムはClickHouse Keeperから削除されます。時間は最近のレコードの時間を基準とし、ウォールタイムではありません。唯一のレコードであれば、永久に保存されます。
## use_async_block_ids_cache {#use-async-block-ids-cache}

これが真であれば、非同期挿入のハッシュサムをキャッシュします。

可能な値：

- true、false

デフォルト値: false。

複数の非同期挿入を持つブロックは、複数のハッシュサムを生成します。挿入の一部が重複している場合、Keeperは1つのRPCで重複したハッシュサムを返すだけになり、余分なRPCの再試行を引き起こす可能性があります。このキャッシュは、Keeper内のハッシュサムのパスを監視します。Keeperで更新が監視されると、キャッシュはできるだけ早く更新され、メモリ内で重複した挿入をフィルタリングできるようになります。
## async_block_ids_cache_min_update_interval_ms {#async_block_ids_cache_min_update_interval_ms}

`use_async_block_ids_cache` を更新するための最小間隔（ミリ秒）。

可能な値：

- 任意の正の整数。

デフォルト値: 100。

通常、`use_async_block_ids_cache`は、監視しているKeeperパスに更新があるとすぐに更新されます。しかし、キャッシュの更新が頻繁すぎて、重い負担になる可能性があります。この最小間隔は、キャッシュの更新を速すぎないように防ぎます。この値を長すぎると、重複した挿入を持つブロックの再試行時間が長くなります。
## max_replicated_logs_to_keep {#max_replicated_logs_to_keep}

非アクティブなレプリカが存在する場合、ClickHouse Keeperログに存在するレコードの数。非アクティブなレプリカは、この数値が超えた場合に失われます。

可能な値：

- 任意の正の整数。

デフォルト値: 1000
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep}

古くなった場合でもZooKeeperログに保持する必要があるレコードの数。この数はテーブルの動作には影響を与えず、ZooKeeperログのクリーンアップ前の診断にのみ使用されます。

可能な値：

- 任意の正の整数。

デフォルト値: 10
## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold}

レプリケーションログ（ClickHouse KeeperまたはZooKeeper）エントリの作成から経過した時間がこの閾値を超え、かつ部分のサイズの合計が `prefer_fetch_merged_part_size_threshold` を超えた場合、ローカルでマージを行う代わりに、レプリカからマージされた部分を取得することを優先します。これは非常に長いマージを迅速化するためです。

可能な値：

- 任意の正の整数。

デフォルト値: 3600
## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold}

部分のサイズの合計がこの閾値を超え、かつレプリケーションログエントリの作成からの時間が `prefer_fetch_merged_part_time_threshold` より長い場合、ローカルでマージを行う代わりに、レプリカからマージされた部分を取得することを優先します。これは非常に長いマージを迅速化するためです。

可能な値：

- 任意の正の整数。

デフォルト値: 10,737,418,240
## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold}

この設定が0より大きい値を持つ場合、単一のレプリカのみがマージを即座に開始し、他のレプリカはその時間まで結果をダウンロードするのを待ちます。この選択されたレプリカがその時間内にマージを完了しない場合、標準的な動作にフォールバックします。

可能な値：

- 任意の正の整数。

デフォルト値: 0（秒）
## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold}

この設定が0より大きい値を持つ場合、共有ストレージ上にマージ部分があり、かつ `allow_remote_fs_zero_copy_replication` が有効な場合、単一のレプリカのみが即座にマージを開始します。

:::note ゼロコピー複製は本番用には準備ができていません
ゼロコピー複製はClickHouseバージョン22.8以降でデフォルトで無効になっています。この機能は本番使用には推奨されません。
:::

可能な値：

- 任意の正の整数。

デフォルト値: 10800
## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout}

再圧縮のマージを開始する前のタイムアウト（秒）。この間にClickHouseは、再圧縮を与えられたこのマージから再圧縮された部分をレプリカから取得しようとします。

再圧縮はほとんどの場合遅いので、タイムアウトまで再圧縮を伴うマージを開始せず、再圧縮を伴うこのマージから再圧縮された部分をレプリカから取得しようとします。

可能な値：

- 任意の正の整数。

デフォルト値: 7200
## always_fetch_merged_part {#always_fetch_merged_part}

これが真であれば、このレプリカは決して部分をマージせず、常に他のレプリカからマージされた部分をダウンロードします。

可能な値：

- true、false

デフォルト値: false
## max_suspicious_broken_parts {#max_suspicious_broken_parts-1}

最大壊れた部分、これを超えると自動削除を拒否します。

可能な値：

- 任意の正の整数。

デフォルト値: 100
## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes}

壊れた部分の最大サイズ、これを超えると自動削除を拒否します。

可能な値：

- 任意の正の整数。

デフォルト値: 1,073,741,824
## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns}

この設定を超えるファイルの数がある場合、ALTERを適用しません（削除、追加）。

可能な値：

- 任意の正の整数。

デフォルト値: 75
## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns}

この設定を超える削除のためのファイルの数がある場合、ALTERを適用しません。

可能な値：

- 任意の正の整数。

デフォルト値: 50
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts}

壊れた部分の比率が全体の部分数のこの値未満であれば、開始を許可します。

可能な値：

- 浮動小数点、0.0 - 1.0

デフォルト値: 0.5
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host}

エンドポイントからの同時フェッチを制限します（実際にはプールサイズ）。

可能な値：

- 任意の正の整数。

デフォルト値: 15
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout-1}

部分フェッチリクエストのHTTP接続タイムアウト。明示的に設定されていない場合は、デフォルトプロファイルの `http_connection_timeout` から継承されます。

可能な値：

- 任意の正の整数。

デフォルト値: 明示的に設定されていない場合は、デフォルトプロファイルの `http_connection_timeout` から継承されます。
## replicated_can_become_leader {#replicated_can_become_leader}

これが真であれば、このノード上の複製テーブルレプリカはリーダーシップを獲得しようとします。

可能な値：

- true、false

デフォルト値: true
## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period}

ZooKeeperセッションの有効期限チェック期間（秒）。

可能な値：

- 任意の正の整数。

デフォルト値: 60
## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica}

失われたレプリカを修復する際、古いローカルパーツを削除しない。

可能な値：

- true、false

デフォルト値: true
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

部分フェッチリクエストのHTTP接続タイムアウト（秒）。明示的に設定されていない場合は、デフォルトプロファイルの[http_connection_timeout](./settings.md#http_connection_timeout) から継承されます。

可能な値：

- 任意の正の整数。
- 0 - `http_connection_timeout` の値を使用します。

デフォルト値: 0。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout}

部分フェッチリクエストのHTTP送信タイムアウト（秒）。明示的に設定されていない場合は、デフォルトプロファイルの[http_send_timeout](./settings.md#http_send_timeout) から継承されます。

可能な値：

- 任意の正の整数。
- 0 - `http_send_timeout` の値を使用します。

デフォルト値: 0。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout}

フェッチ部分リクエストのHTTP受信タイムアウト（秒）。明示的に設定されていない場合は、デフォルトプロファイルの[http_receive_timeout](./settings.md#http_receive_timeout) から継承されます。

可能な値：

- 任意の正の整数。
- 0 - `http_receive_timeout` の値を使用します。

デフォルト値: 0。
## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth}

[複製](../../engines/table-engines/mergetree-family/replication.md) フェッチのネットワーク経由でのデータ交換の最大速度（バイト/秒）を制限します。この設定は特定のテーブルに適用され、[max_replicated_fetches_network_bandwidth_for_server](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth) 設定はサーバーに適用されます。

サーバーネットワークと特定のテーブルのネットワークを制限できますが、テーブルレベルの設定の値はサーバーレベルのそれよりも小さくする必要があります。そうしないと、サーバーは `max_replicated_fetches_network_bandwidth_for_server` 設定のみを考慮します。

設定は厳密に守られているわけではありません。

可能な値：

- 正の整数。
- 0 — 無制限。

デフォルト値: `0`。

**使用方法**

データを複製して新しいノードを追加または置き換える際の速度を制限するために使用できます。
## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth}

[複製](../../engines/table-engines/mergetree-family/replication.md) 送信のネットワーク経由でのデータ交換の最大速度（バイト/秒）を制限します。この設定は特定のテーブルに適用され、[max_replicated_sends_network_bandwidth_for_server](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth) 設定はサーバーに適用されます。

サーバーネットワークと特定のテーブルのネットワークを制限できますが、テーブルレベルの設定の値はサーバーレベルのそれよりも小さくする必要があります。そうしないと、サーバーは `max_replicated_sends_network_bandwidth_for_server` 設定のみを考慮します。

設定は厳密に守られているわけではありません。

可能な値：

- 正の整数。
- 0 — 無制限。

デフォルト値: `0`。

**使用方法**

データを複製して新しいノードを追加または置き換える際の速度を制限するために使用できます。
## old_parts_lifetime {#old-parts-lifetime}

無効な部分が保存される時間（秒）。これは、サーバーが自発的に再起動した際のデータ損失から保護します。

可能な値：

- 任意の正の整数。

デフォルト値: 480。

数部を新しい部にマージすると、ClickHouseは元の部を無効としてマークし、`old_parts_lifetime` 秒後にのみ削除します。
無効な部分は、現在のクエリによって使用されていない場合、つまり部分の `refcount` が1の場合に削除されます。

新しい部分に対して `fsync` が呼び出されないため、新しい部分はしばらくの間サーバーのRAM（OSキャッシュ）内にのみ存在します。サーバーが自発的に再起動した場合、新しい部分が失われたり損傷したりする可能性があります。
データを保護するために、無効な部分はすぐには削除されません。

起動時にClickHouseは部分の整合性をチェックします。
マージした部分が損傷している場合、ClickHouseは無効な部分をアクティブリストに戻し、後で再度マージします。その後、損傷した部分は名前が変更され（`broken_` プレフィックスが追加され）、`detached` フォルダに移動されます。
マージした部分が損傷していない場合、元の無効な部分は名前が変更され（`ignored_` プレフィックスが追加され）、`detached` フォルダに移動されます。

デフォルトの `dirty_expire_centisecs` 値（Linuxカーネル設定）は30秒です（書き込まれたデータがRAMにのみ保存される最大時間）ですが、ディスクシステムの負荷が高い場合、データが書き込まれるのが大幅に遅れることがあります。実験的に、480秒の `old_parts_lifetime` 値が選択され、新しい部分がディスクに書き込まれることが保証されます。
## max_bytes_to_merge_at_max_space_in_pool {#max-bytes-to-merge-at-max-space-in-pool}

元のリソースが十分にある場合、1つの部分にマージされる最大の合計パーツサイズ（バイト数）。
これは、バックグラウンドマージによって生成される自動的に生成される部分サイズに大まかに相当します。

可能な値：

- 任意の正の整数。

デフォルト値: 161061273600（150 GB）。

マージスケジューラは定期的にパーティション内のサイズと部分の数を分析し、プールに十分な空きリソースがある場合、バックグラウンドマージを開始します。
`max_bytes_to_merge_at_max_space_in_pool` を超えている場合、合計サイズがソースパーツよりも大きくなるまでマージが行われます。

[OPTIMIZE FINAL](../../sql-reference/statements/optimize.md) によって開始されたマージは、`max_bytes_to_merge_at_max_space_in_pool` を無視します（フリーディスクスペースのみが考慮されます）。
## max_bytes_to_merge_at_min_space_in_pool {#max-bytes-to-merge-at-min-space-in-pool}

背景プールに最低限必要なリソースで、1つのパーツにマージされる最大の合計パーツサイズ（バイト数）。

可能な値：

- 任意の正の整数。

デフォルト値: 1048576（1 MB）

`max_bytes_to_merge_at_min_space_in_pool`は、空いているディスクスペースが不足していてもマージできるパーツの合計サイズを定義します。これは、小さいパーツの数を減らし、`Too many parts` エラーの可能性を引き下げるために必要です。
マージは、マージされた部分の合計サイズの2倍でディスクスペースを予約します。したがって、空きディスクスペースが少ないと、空きスペースがあってもすでに進行中の大規模マージで予約されている可能性があり、他のマージを開始できない場合があり、挿入ごとに小さな部分の数が増加します。
## merge_max_block_size {#merge-max-block-size}

マージされた部分からメモリに読み込まれる行の数。

可能な値：

- 任意の正の整数。

デフォルト値: 8192

マージは、`merge_max_block_size` 行の部分からの行をメモリに読み取り、その後マージして新しいパーツに結果を書き込みます。読み取られたブロックはRAMに配置されるため、`merge_max_block_size` はマージに必要なRAMのサイズに影響します。したがって、非常に広い行を持つテーブルでは、マージが大量のRAMを消費する可能性があります（平均行サイズが100kbであれば、10個のパーツをマージすると、(100kb * 10 * 8192) = 約8GBのRAMが消費されます）。`merge_max_block_size` を減少させることで、マージに必要なRAMの量を減らすことができますが、マージ速度は遅くなります。
## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number-of-free-entries-in-pool-to-lower-max-size-of-merge}

プール（または複製キュー）内の空きエントリの数が指定数未満の場合、処理するための最大マージサイズを下げ始めます（またはキューに入れます）。
これは、小さなマージが処理されるのを許可するためであり、長時間実行されるマージでプールが埋まるのを防ぎます。

可能な値：

- 任意の正の整数。

デフォルト値: 8
## number_of_free_entries_in_pool_to_execute_mutation {#number-of-free-entries-in-pool-to-execute-mutation}

プール内の空きエントリの数が指定数未満の場合、部分の変更を実行しません。
これは、通常のマージのためにスレッドを空け、「Too many parts」を避けるためです。

可能な値：

- 任意の正の整数。

デフォルト値: 20

**使用法**

`number_of_free_entries_in_pool_to_execute_mutation`設定の値は、[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) の値より小さい必要があります。さもないと、ClickHouseは例外をスローします。
## max_part_loading_threads {#max-part-loading-threads}

ClickHouseが起動する際に部分を読み取る最大スレッド数。

可能な値：

- 任意の正の整数。

デフォルト値: auto（CPUコアの数）。

起動時、ClickHouseはすべてのテーブルのすべての部分を読み込み（部分のメタデータを持つファイルを読み込み）、すべての部分のリストをメモリに構築します。部分の数が多いシステムでは、このプロセスに時間がかかることがあり、`max_part_loading_threads` を増やすことでこの時間が短縮される可能性があります（このプロセスがCPUとディスクI/O制約でない場合）。
## max_partitions_to_read {#max-partitions-to-read}

クエリでアクセスできる最大パーティション数を制限します。

テーブル作成時に指定された設定値は、クエリレベルの設定によって上書きできます。

可能な値：

- 任意の正の整数。

デフォルト値：-1（無制限）。

クエリ / セッション / プロファイルレベルでクエリの複雑さ設定 [max_partitions_to_read](query-complexity#max-partitions-to-read) を指定することもできます。
## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds}

範囲内のすべてのパーツが `min_age_to_force_merge_seconds` の値よりも古い場合、マージパーツを実行します。

デフォルトでは、設定 `max_bytes_to_merge_at_max_space_in_pool` を無視します（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

可能な値：

- 正の整数。

デフォルト値：0 — 無効。
## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only}

`min_age_to_force_merge_seconds` を、サブセットではなく、全体のパーティションにのみ適用するかどうか。

デフォルトでは、設定 `max_bytes_to_merge_at_max_space_in_pool` を無視します（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

可能な値：

- true, false

デフォルト値：false
## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge}

設定 `min_age_to_force_merge_seconds` と `min_age_to_force_merge_on_partition_only` が設定 `max_bytes_to_merge_at_max_space_in_pool` を尊重すべきかどうか。

可能な値：

- true, false

デフォルト値：false
## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition}

プール内の指定された数のフリーエントリが下回る場合、バックグラウンドで全体のパーティションを最適化するタスクを実行しません（このタスクは `min_age_to_force_merge_seconds` を設定し、`min_age_to_force_merge_on_partition_only` を有効にしたときに生成されます）。これは、通常のマージのためにフリースレッドを残し、「パーツが多すぎる」ことを避けるためです。

可能な値：

- 正の整数。

デフォルト値：25

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition` 設定の値は、 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) の値よりも小さい必要があります。さもなければ、ClickHouseは例外をスローします。
## allow_floating_point_partition_key {#allow_floating_point_partition_key}

浮動小数点数をパーティションキーとして許可する設定を有効にします。

可能な値：

- 0 — 浮動小数点パーティションキーは許可されません。
- 1 — 浮動小数点パーティションキーが許可されます。

デフォルト値：`0`。
## check_sample_column_is_correct {#check_sample_column_is_correct}

サンプリングまたはサンプリング式のためのカラムのデータ型が正しいかどうかをテーブル作成時にチェックする設定を有効にします。データ型は、符号なしの [整数型](../../sql-reference/data-types/int-uint.md)： `UInt8`, `UInt16`, `UInt32`, `UInt64` のいずれかでなければなりません。

可能な値：

- true  — チェックが有効です。
- false — テーブル作成時にチェックが無効になります。

デフォルト値：`true`。

デフォルトでは、ClickHouseサーバーはテーブル作成時にサンプリングまたはサンプリング式のためのカラムのデータ型をチェックします。不正なサンプリング式を持つテーブルがすでに存在し、サーバーが起動時に例外をスローしないようにしたい場合は、`check_sample_column_is_correct` を `false` に設定します。
## min_bytes_to_rebalance_partition_over_jbod {#min-bytes-to-rebalance-partition-over-jbod}

ボリュームディスク [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) に新しい大きなパーツを分配する際に、バランスを取るために必要な最小バイト数を設定します。

可能な値：

- 正の整数。
- 0 — バランスが無効です。

デフォルト値：`0`。

**使用方法**

`min_bytes_to_rebalance_partition_over_jbod` 設定の値は、 [max_bytes_to_merge_at_max_space_in_pool](../../operations/settings/merge-tree-settings.md#max-bytes-to-merge-at-max-space-in-pool) / 1024 の値より小さいはずです。さもなければ、ClickHouseは例外をスローします。
## detach_not_byte_identical_parts {#detach_not_byte_identical_parts}

マージやミューテーションの後に、他のレプリカのデータパーツとバイト単位で同一でない場合にデータパーツをデタッチすることを有効または無効にします。無効にすると、データパーツは削除されます。この設定を有効にすると、後でそのようなパーツを分析したい場合に便利です。

この設定は、データのレプリケーションが有効な `MergeTree` テーブルに適用されます。

可能な値：

- 0 — パーツは削除されます。
- 1 — パーツはデタッチされます。

デフォルト値：`0`。
## merge_tree_clear_old_temporary_directories_interval_seconds {#setting-merge-tree-clear-old-temporary-directories-interval-seconds}

ClickHouseが古い一時ディレクトリのクリーンアップを実行する間隔（秒）を設定します。

可能な値：

- 任意の正の整数。

デフォルト値：`60`秒。
## merge_tree_clear_old_parts_interval_seconds {#setting-merge-tree-clear-old-parts-interval-seconds}

ClickHouseが古いパーツ、WAL、およびミューテーションのクリーンアップを実行する間隔（秒）を設定します。

可能な値：

- 任意の正の整数。

デフォルト値：`1`秒。
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

[相互に独立](/operations/server-configuration-parameters/settings.md) 設定を適用するための、クエリによって読み取られる最小マーク数。クエリは他の `max_concurrent_queries` 設定によっても制限されます。

可能な値：

- 正の整数。
- 0 — 無効（`max_concurrent_queries` 制限は適用されません）。

デフォルト値：`0`（制限は適用されません）。

**例**

``` xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```
## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization}

カラム内の _default_ 値の数と _all_ 値の数の最小比率。これで値を設定すると、カラムはスパースシリアライゼーションを使用して保存されます。

カラムがスパース（主にゼロで構成されている）場合、ClickHouseはそれをスパースフォーマットでエンコードし、計算を自動的に最適化できます - データはクエリ中に完全に解凍される必要はありません。このスパースシリアライゼーションを有効にするには、`ratio_of_defaults_for_sparse_serialization` 設定を1.0未満に設定します。値が1.0以上の場合、カラムは常に通常の完全なシリアライゼーションで書き込まれます。

可能な値：

- スパースシリアライゼーションを有効にするための0と1の間の浮動小数点数
- スパースシリアライゼーションを使用したくない場合は1.0（またはそれ以上）

デフォルト値：`0.9375`

**例**

以下のテーブルにおいて、`s` カラムは95%の行に対して空文字列です。`my_regular_table`ではスパースシリアライゼーションを使用せず、`my_sparse_table`では `ratio_of_defaults_for_sparse_serialization` を 0.95 に設定しています：

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

`my_sparse_table` の `s` カラムはディスク上で少ないストレージスペースを使用していることに注意してください：

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

カラムがスパースエンコーディングを使用しているかどうかは、`system.parts_columns` テーブルの `serialization_kind` カラムを表示することで確認できます：

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

`s` のどのパーツがスパースシリアライゼーションを使用して保存されていたかを示すことができます：

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

カラムのファイル名が長すぎる場合（`max_file_name_length` バイトを超える）、それを SipHash128 に置き換えます。デフォルト値： `false`。
## max_file_name_length {#max_file_name_length}

ハッシュ化なしにそのまま保持するファイル名の最大長。設定 `replace_long_file_name_to_hash` が有効な場合のみ効果があります。この設定の値はファイル拡張子の長さを含みません。したがって、ファイルシステムエラーを避けるために、通常のファイル名長（通常は 255 バイト）よりもいくつか余裕を持って設定することが推奨されます。デフォルト値：127。
## allow_experimental_block_number_column {#allow_experimental_block_number_column}

マージ時に仮想カラム `_block_number` を永続化します。

デフォルト値：false。
## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge}

有効にすると、データパーツの推定実際サイズ（つまり、`DELETE FROM` で削除された行を除く）がマージするパーツを選択する際に使用されます。この動作は、この設定が有効になった後に実行された `DELETE FROM` に影響を受けたデータパーツに対してのみトリガーされます。

可能な値：

- true, false

デフォルト値：false

**参照**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts) 設定
## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts}

[exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) とともに有効にすると、既存のデータパーツに対する削除された行のカウントがテーブルの起動時に計算されます。この設定は、テーブルの起動時の読み込みを遅くする可能性があります。

可能な値：

- true, false

デフォルト値：false

**参照**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 設定
## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization}

Variant データ型の識別子のバイナリシリアライゼーション用のコンパクトモードを有効にします。
このモードは、主に1つのバリアントまたは多くのNULL値が存在する場合、パーツ内の識別子のストレージ用のメモリを大幅に減らすことができます。

デフォルト値：true
## merge_workload {#merge_workload}

マージや他のワークロード間でリソースの利用と共有を調整するために使用されます。指定された値は、このテーブルのバックグラウンドマージの `workload` 設定の値として使用されます。指定されていない場合（空の文字列）、サーバー設定の `merge_workload` が代わりに使用されます。

デフォルト値：空の文字列

**参照**
- [Workload Scheduling](/operations/workload-scheduling.md)
## mutation_workload {#mutation_workload}

ミューテーションや他のワークロード間でリソースの利用と共有を調整するために使用されます。指定された値は、このテーブルのバックグラウンドミューテーションの `workload` 設定の値として使用されます。指定されていない場合（空の文字列）、サーバー設定の `mutation_workload` が代わりに使用されます。

デフォルト値：空の文字列

**参照**
- [Workload Scheduling](/operations/workload-scheduling.md)
### optimize_row_order {#optimize_row_order}

挿入時に行の順序を最適化して、新しく挿入されたテーブルパートの圧縮率を改善するかどうかを制御します。

通常の MergeTree エンジンテーブルにのみ効果があります。特殊な MergeTreeエンジンテーブル（例：CollapsingMergeTree）には効果がありません。

MergeTree テーブルは（オプションで）[圧縮コーデック](../../sql-reference/statements/create/table.md#column_compression_codec)を使用して圧縮されます。
LZ4 や ZSTD のような一般的な圧縮コーデックは、データがパターンを示す場合に最大の圧縮率を達成します。
同じ値の長い連続は通常非常に良く圧縮されます。

この設定が有効な場合、ClickHouse は新たに挿入されたパーツ内のデータを、カラム間で同じ値の連続を最小限に抑える行順で保存しようとします。
つまり、同じ値の連続の数が少ないほど、それぞれの連続が長くなり、圧縮率が良くなります。

最適な行順を見つけることは計算上不可能です（NP困難）。
したがって、ClickHouse は元の行順よりも圧縮率を改善するために、素早く行順を見つけるためのヒューリスティックを使用します。

<details markdown="1">

<summary>行順を見つけるためのヒューリスティック</summary>

一般的に、SQL では同じテーブル（テーブルパーツ）の行順を自由にシャッフルすることが可能です。

この行をシャッフルする自由は、テーブルにプライマリーキーが定義されている場合は制限されます。
ClickHouse では、プライマリーキー `C1, C2, ..., CN` によって、テーブルの行がカラム `C1`, `C2`, ... `Cn` によってソートされることが強制されます（[クラスタ化インデックス](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
その結果、行はプライマリーキーのカラムに同じ値を持つ行の「同等クラス」内でのみシャッフルすることができます。
高カーディナリティのプライマリーキー（例：`DateTime64` タイムスタンプカラムを含むプライマリーキー）は、多くの小さな同等クラスを導きます。
逆に、低カーディナリティのプライマリーキーを持つテーブルは、少なくとも大きな同等クラスを作成します。
プライマリーキーのないテーブルは、すべての行を含む単一の同等クラスの極端なケースを表します。

同等クラスの数が少なく、サイズが大きいほど、行の再シャッフルの自由度が高くなります。

各同等クラス内で最適な行順を見つけるために適用されるヒューリスティックは、D. Lemire, O. Kaser によって提案され、[小さなインデックス用のカラムを並べ替える](https://doi.org/10.1016/j.ins.2011.02.002)に基づいており、非プライマリーキーのカラムの昇順のカーディナリティで行をソートします。
このプロセスは3つのステップを実行します：
1. プライマリーキーのカラム内の行の値に基づいてすべての同等クラスを見つけます。
2. 各同等クラスの非プライマリーキーのカラムのカーディナリティを計算（通常は推定）します。
3. 各同等クラスの行を、非プライマリーキーのカラムのカーディナリティの昇順でソートします。

</details>

この設定が有効な場合、挿入操作には、新しいデータの行順を分析および最適化するための追加のCPUコストが発生します。
データの特性に応じて、INSERT が30〜50％長くかかることが予想されます。
LZ4またはZSTDの圧縮率は平均で20〜40％向上します。

この設定は、プライマリーキーがないテーブルや低カーディナリティのプライマリーキーを持つテーブルに最適に機能します。すなわち、わずか数の異なるプライマリーキーの値を持つテーブルです。
高カーディナリティのプライマリーキー（例：`DateTime64` タイプのタイムスタンプカラムを含む）は、この設定からの恩恵を受けないと予想されます。
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode}

デフォルトでは、軽量削除 `DELETE` はプロジェクションを持つテーブルでは機能しません。これは、プロジェクション内の行が `DELETE` 操作の影響を受ける可能性があるためです。したがって、デフォルト値は `throw` です。
ただし、このオプションは動作を変更できます。`drop` または `rebuild` のいずれかの値を設定すると、削除はプロジェクションとともに機能します。`drop` はプロジェクションを削除するので、現在のクエリでは高速である可能性がありますが、将来のクエリではプロジェクションが無くなるため遅くなります。
`rebuild` はプロジェクションを再構築します。これは、現在のクエリのパフォーマンスに影響を与える可能性がありますが、将来のクエリでは速度が向上するかもしれません。これらのオプションはパートレベルでのみ機能するため、触れられないパート内のプロジェクションは維持され、ドロップや再構築などのアクションはトリガーされません。

可能な値：

- throw, drop, rebuild

デフォルト値：throw
## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode}

非クラシック MergeTree（すなわち (Replicated, Shared) ではない MergeTree）テーブルに対してプロジェクションの作成を許可するかどうか。オプション ignore は互換性のためのみであり、結果が不正確になる可能性があります。そうでなければ、マージプロジェクション時のアクションがドロップまたは再構築のいずれかであるかどうかを制御します。したがって、クラシック MergeTree はこの設定を無視します。
これは `OPTIMIZE DEDUPLICATE` にも影響しますが、すべての MergeTree ファミリーのメンバーに影響を与えます。`lightweight_mutation_projection_mode` オプションと同様に、パートレベルです。

可能な値：

- ignore, throw, drop, rebuild

デフォルト値：throw
## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert}

データを挿入するためにディスク空きスペースに必要な最小バイト数。利用可能なフリーバイト数が `min_free_disk_bytes_to_perform_insert` より少ない場合、例外がスローされ、挿入は実行されません。この設定には以下が含まれます：
- `keep_free_space_bytes` 設定が考慮されます。
- `INSERT` 操作によって書き込まれるデータ量は考慮されません。
- 正の（ゼロ以外の）バイト数が指定されている場合のみチェックされます。

可能な値：

- 任意の正の整数。

デフォルト値：0 バイト。

`min_free_disk_bytes_to_perform_insert` と `min_free_disk_ratio_to_perform_insert` の両方が指定されている場合、ClickHouse はより多くのフリーメモリで挿入を行える値を考慮します。
## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert}

`INSERT` を実行するための無料から総ディスクスペースの比率。0 と 1 の間の浮動小数点値でなければなりません。この設定には以下が含まれます：
- `keep_free_space_bytes` 設定が考慮されます。
- `INSERT` 操作によって書き込まれるデータ量は考慮されません。
- 正の（ゼロ以外の）比率が指定されている場合のみチェックされます。

可能な値：

- 浮動小数点、0.0 - 1.0

デフォルト値：0.0

`min_free_disk_ratio_to_perform_insert` と `min_free_disk_bytes_to_perform_insert` の両方が指定されている場合、ClickHouse はより多くのフリーメモリで挿入を行える値を考慮します。
## allow_experimental_reverse_key {#allow_experimental_reverse_key}

MergeTree ソートキーに降順をサポートする設定を有効にします。この設定は特に時系列分析やTop-Nクエリに便利で、データを逆時系列で格納してクエリパフォーマンスを最適化します。

`allow_experimental_reverse_key` が有効になっている場合、MergeTreeテーブルの `ORDER BY` 句内で降順を定義することができます。これにより、降順クエリにおいて `ReadInReverseOrder` の代わりにより効率的な `ReadInOrder` 最適化を使用できます。

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

`ORDER BY time DESC` をクエリに使用することで、`ReadInOrder` が適用されます。

**デフォルト値：** false
## cache_populated_by_fetch {#cache_populated_by_fetch}

:::note
この設定は ClickHouse Cloud にのみ適用されます。
:::

`cache_populated_by_fetch` が無効（デフォルト設定）である場合、新しいデータパーツは、そのパーツを必要とするクエリが実行されたときにのみキャッシュに読み込まれます。

有効にすると、`cache_populated_by_fetch` は、クエリをトリガーすることなく、すべてのノードがストレージから新しいデータパーツをキャッシュに読み込む原因となります。

デフォルト値：false

**参照**

- [ignore_cold_parts_seconds](settings.md/#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](settings.md/#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](settings.md/#cache_warmer_threads)
## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine}

trueの場合、CollapsingMergeTree または VersionedCollapsingMergeTree テーブルの `sign` カラムに対して、有効な値（`1` と `-1`）のみを許可する暗黙的な制約を追加します。

デフォルト値：false
## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns}

有効にすると、テーブルのすべての数値カラムに対してミニマックス（スキップ）インデックスが追加されます。

デフォルト値：false。
## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns}

有効にすると、テーブルのすべての文字列カラムに対してミニマックス（スキップ）インデックスが追加されます。

デフォルト値：false。
## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge}

有効にすると、マージは新しいパーツにスキップインデックスを構築して保存します。

デフォルト：true
## assign_part_uuids {#assign_part_uuids}

有効にすると、新しいパーツごとに一意のパーツ識別子が割り当てられます。有効にする前に、すべてのレプリカがバージョン4のUUIDをサポートしていることを確認してください。

デフォルト：0。
