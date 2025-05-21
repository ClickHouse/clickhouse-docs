---
description: 'MergeTreeに関する設定は、`system.merge_tree_settings`にあります。'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree テーブルの設定'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

システムテーブル `system.merge_tree_settings` には、グローバルに設定されたMergeTreeの設定が表示されます。

MergeTreeの設定は、サーバーの設定ファイルの `merge_tree` セクションで設定するか、各 `MergeTree` テーブルの `CREATE TABLE` ステートメントの `SETTINGS` 句で個別に指定できます。

設定 `max_suspicious_broken_parts` をカスタマイズする例：

サーバーの設定ファイルで全ての `MergeTree` テーブルのデフォルトを設定：

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

特定のテーブルに設定：

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

特定のテーブルの設定を変更するには `ALTER TABLE ... MODIFY SETTING` を使用：

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- グローバルデフォルトにリセット (system.merge_tree_settings からの値)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```

## MergeTree settings {#mergetree-settings}
<!-- この設定は、次のスクリプトによって自動生成されます。 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
-->
## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size} 
<SettingsInfoBlock type="UInt64" default_value="16384" />

適応型書き込みバッファの初期サイズ
## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 
<SettingsInfoBlock type="Bool" default_value="0" />

`sign` カラムに対する暗黙の制約を追加し、正当な値（`1` と `-1`）のみを許可します。
## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

有効化すると、テーブルのすべての数値カラムにミンマックス（スキッピング）インデックスが追加されます。
## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

有効化すると、テーブルのすべての文字列カラムにミンマックス（スキッピング）インデックスが追加されます。
## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

`is_deleted` カラムを持つReplacingMergeTreeのための実験的なCLEANUPマージを許可します。有効にすると、`OPTIMIZE ... FINAL CLEANUP`を使って、特定のパーティション内のすべてのパーツを単一のパーツにマージし、削除された行を削除することを許可します。

さらに、設定 `min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only`、および `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` によって、このようなマージがバックグラウンドで自動的に発生することを許可します。
## allow_experimental_reverse_key {#allow_experimental_reverse_key} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

MergeTreeソートキーに降順ソートのサポートを有効にします。この設定は、時系列分析やTop-Nクエリに特に便利で、クエリパフォーマンスを最適化するためにデータを逆時系列順に保存することを可能にします。

`allow_experimental_reverse_key` が有効な場合、MergeTreeテーブルの `ORDER BY` 句内で降順ソートを定義できます。これにより、降順クエリのために `ReadInReverseOrder` ではなく、より効率的な `ReadInOrder` 最適化を使用することができます。

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

クエリで `ORDER BY time DESC` を使用することにより、`ReadInOrder` が適用されます。

**デフォルト値:** false
## allow_floating_point_partition_key {#allow_floating_point_partition_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

浮動小数点数をパーティションキーとして許可します。

可能な値:
- `0` — 浮動小数点パーティションキーは許可されません。
- `1` — 浮動小数点パーティションキーは許可されます。
## allow_nullable_key {#allow_nullable_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

主キーとしてNullable型を許可します。
## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "現在 SMT はデフォルトでZooKeeperから古いブロキングパーツを削除します"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "クラウド同期"}]}]}/>

共有マージツリーテーブルのためにブロッキングパーツを削減するバックグラウンドタスク。
ClickHouse Cloud のみ
## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

この設定は本番環境で使用しないでください。準備が整っていません。
## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定でパーティションまたはソートキーの列の合算を許可"}]}]}/>

有効にすると、SummingMergeTreeテーブルの合算列をパーティションまたはソートキーに使用できます。
## allow_suspicious_indices {#allow_suspicious_indices} 
<SettingsInfoBlock type="Bool" default_value="0" />

同一の式を持つ主キー/セカンダリインデックスおよびソートキーを拒否します。
## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

コンパクトパーツからワイドパーツへの垂直マージを許可します。この設定は、すべてのレプリカで同じ値である必要があります。
## always_fetch_merged_part {#always_fetch_merged_part} 
<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、このレプリカは部分を決してマージせず、常に他のレプリカからマージされた部分をダウンロードします。

可能な値:
- true, false
## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 
<SettingsInfoBlock type="Bool" default_value="0" />

常にデータをコピーし、ミューテーション/リプレース/デタッチの際にハードリンクの代わりに使用します。
## apply_patches_on_merge {#apply_patches_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新しい設定"}]}]}/>

true の場合、マージ時にパッチ部分が適用されます。
## assign_part_uuids {#assign_part_uuids} 
<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、新しいパーツごとに一意の部分識別子が割り当てられます。すべてのレプリカがUUIDバージョン4をサポートしていることを確認してから有効にしてください。
## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="100" />

各挿入イテレーションがasync_block_ids_cacheの更新を待機する時間
## async_insert {#async_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、INSERTクエリからのデータがキューに保存され、後でバックグラウンドでテーブルにフラッシュされます。
## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="50" />

マージまたはミューテーションの1ステップの実行ターゲット時間。1ステップが長くかかる場合、これを超えることがあります。
## cache_populated_by_fetch {#cache_populated_by_fetch} 
<SettingsInfoBlock type="Bool" default_value="0" />

:::note
この設定はClickHouse Cloudにのみ適用されます。
:::

`cache_populated_by_fetch` が無効（デフォルト設定）である場合、新しいデータパーツは、そのパーツを要求するクエリが実行されたときだけキャッシュに読み込まれます。

有効にすると、`cache_populated_by_fetch` はすべてのノードがストレージから新しいデータパーツをキャッシュに読み込むようにし、クエリをトリガーする必要がなくなります。

**関連情報**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)
## check_delay_period {#check_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="60" />
廃止された設定で、何もしません。
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

サンプリングまたはサンプリング式のカラムのデータ型が正しいかをテーブル作成時にチェックを有効にします。データ型は、符号なしの [整数型](/sql-reference/data-types/int-uint) ：`UInt8`、`UInt16`、`UInt32`、`UInt64` のいずれかでなければなりません。

可能な値：
- `true`  — チェックが有効です。
- `false` — テーブル作成時にチェックが無効です。

デフォルト値： `true`。

デフォルトでは、ClickHouseサーバーはテーブル作成時にサンプリングまたはサンプリング式のカラムのデータ型をチェックします。すでに不正なサンプリング式を持つテーブルがあり、サーバーが起動中に例外を発生させたくない場合、`check_sample_column_is_correct` を `false` に設定します。
## clean_deleted_rows {#clean_deleted_rows} 
<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
廃止された設定で、何もしません。
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

古いキューのログ、ブロックのハッシュ、およびパーツをクリーンアップするための最小期間。
## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />

cleanup_delay_period に 0 から x 秒までの均等に分布した値を追加して、雷鳴のような群れ効果を回避し、非常に多くのテーブルがある場合にZooKeeperのその後のDoSを回避します。
## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 
<SettingsInfoBlock type="UInt64" default_value="150" />

バックグラウンドクリーンアップのための優先バッチサイズ（ポイントは抽象的ですが、1ポイントは約1挿入ブロックに相当します）。
## cleanup_threads {#cleanup_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />

古いスレッドのクリーンアップに使用されるスレッド。ClickHouse Cloud のみで利用可能
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "列とインデックスのサイズを遅延計算するための新しい設定"}]}]}/>

列とセカンダリインデックスのサイズをテーブル初期化時ではなく、最初のリクエスト時に遅延して計算します。
## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 

プリウォームマークキャッシュをためにプレオプションのリスト（有効な場合）。空は全ての列を意味します。
## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="134217728" />

ClickHouse Cloud のみで利用可能。コンパクトパーツにシングルストライプ内で書き込む最大バイト数。
## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="128" />

ClickHouse Cloud のみで利用可能。コンパクトパーツにシングルストライプ内で書き込む最大グラニュール数。
## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 
<SettingsInfoBlock type="UInt64" default_value="16777216" />

ClickHouse Cloud のみで利用可能。マージ時にメモリに全体を読み込むための最大コンパクトパーツサイズ。
## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

主キーに含まれないサンプリング式でテーブルを作成することを許可します。これは、後方互換性のために不正なテーブルでサーバーを一時的に実行することを許可するためにのみ必要です。
## compress_marks {#compress_marks} 
<SettingsInfoBlock type="Bool" default_value="1" />

マークは圧縮をサポートし、マークファイルのサイズを削減し、ネットワーク転送を加速します。
## compress_primary_key {#compress_primary_key} 
<SettingsInfoBlock type="Bool" default_value="1" />

主キーは圧縮をサポートし、主キーファイルのサイズを削減し、ネットワーク転送を加速します。
## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 
<SettingsInfoBlock type="UInt64" default_value="100" />

非アクティブなデータパーツの数がこの数以上の場合のみ、同時部分の削除を有効化します（max_part_removal_threadsを参照）。 
## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 
<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "一貫性のない投影の作成を許可しない"}]}]}/>

非クラシックMergeTree（Replicated、SharedでないMergeTree）テーブルのためのプロジェクションを作成することを許可するかどうかを定義します。オプションの無視は純粋に互換性のためであり、結果が不正になる可能性があります。許可されている場合、マージプロジェクションの際のアクションは、ドロップまたは再構築です。従って、クラシックMergeTreeはこの設定を無視します。この設定は`OPTIMIZE DEDUPLICATE`にも影響を与えますが、すべてのMergeTreeファミリーに影響を与えます。この設定は、`lightweight_mutation_projection_mode`オプションと同様に、部分レベルでもあります。

可能な値:
- `ignore`
- `throw`
- `drop`
- `rebuild`
## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "新しい設定"}]}]}/>

特定のカラムのテーブル宣言で定義されていない場合に使用するデフォルトの圧縮コーデックを指定します。
カラムのための圧縮コーデックの選択順：
1. テーブル宣言で定義されたカラムの圧縮コーデック
2. `default_compression_codec`（この設定）で定義された圧縮コーデック
3. `compression`設定で定義されたデフォルトの圧縮コーデック
デフォルト値: 空文字列（未定義）。
## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

マージまたはミューテーションの後、他のレプリカのデータ部分とはバイト単位で同一でない場合、レプリカ上でデータパートをデタッチするかどうかを有効または無効にします。無効にすると、そのデータパートは削除されます。この設定は、後でそのようなパーツを解析したい場合にアクティブ化します。

この設定は、レプリカの[data replication](/engines/table-engines/mergetree-family/replacingmergetree)が有効な `MergeTree` テーブルに適用可能です。

可能な値：

- `0` — パーツは削除されます。
- `1` — パーツはデタッチされます。
## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 
<SettingsInfoBlock type="Bool" default_value="1" />

失われたレプリカを修復する際に古いローカルパーツを削除しないでください。

可能な値：
- `true`
- `false`
## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピー複製のためのDETACH PARTITIONクエリを無効にします。
## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピー複製のためのFETCH PARTITIONクエリを無効にします。
## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピー複製のためのFREEZE PARTITIONクエリを無効にします。
## disk {#disk} 

ストレージディスクの名前です。ストレージポリシーの代わりに指定できます。
## enable_block_number_column {#enable_block_number_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

各行のためにブロック番号を永続化するカラム _block_number を有効にします。
## enable_block_offset_column {#enable_block_offset_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

マージ時に仮想カラム `_block_number` を永続化します。
## enable_index_granularity_compression {#enable_index_granularity_compression} 
<SettingsInfoBlock type="Bool" default_value="1" />

可能な場合、メモリ内のインデックスの粒度の値を圧縮します。
## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "min_age_to_force_mergeのための最大バイトを制限する新しい設定を追加しました。"}]}]}/>

設定 `min_age_to_force_merge_seconds` および `min_age_to_force_merge_on_partition_only` が設定 `max_bytes_to_merge_at_max_space_in_pool` を尊重するかどうかを示します。

可能な値：
- `true`
- `false`
## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

`index_granularity_bytes`設定を使用してグラニュールサイズを制御することを有効または無効にします。バージョン19.11以前は、グラニュールサイズを制限するための設定は `index_granularity` のみでした。設定`index_granularity_bytes` は、大きな行を持つテーブルからデータを選択する際のClickHouseのパフォーマンスを向上させます。大きな行を持つテーブルがある場合、この設定を有効にして効率を向上させることができます。
## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "ReplacingMergeTreeのための自動クリーンアップマージを許可する新しい設定です。"}]}]}/>

パーティションを単一のパーツにマージする際に、ReplacingMergeTreeでCLEANUPマージを使用するかどうかを決定します。`allow_experimental_replacing_merge_with_cleanup` 、`min_age_to_force_merge_seconds` および `min_age_to_force_merge_on_partition_only` を有効にする必要があります。

可能な値：
- `true`
- `false`
## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 
<SettingsInfoBlock type="Bool" default_value="0" />

レプリケートされたマージツリーテーブルのためにZooKeeper名前接頭辞を持つエンドポイントIDを有効にします。
## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 
<SettingsInfoBlock type="UInt64" default_value="1" />

垂直マージアルゴリズムの使用を有効にします。
## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

パーティション操作クエリ（`ATTACH/MOVE/REPLACE PARTITION`）の宛先テーブルに対してこの設定が有効な場合、インデックスとプロジェクションはソーステーブルと宛先テーブルの間で同一でなければならないことを制約します。それ以外の場合、宛先テーブルはソーステーブルのインデックスとプロジェクションのスーパーセットを持つことができます。
## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、データ部分の見積もり実サイズ（すなわち、`DELETE FROM`で削除された行を除く）がパーツをマージする際に選択される際に使用されます。この動作は、この設定が有効になった後に実行された `DELETE FROM` で影響を受けたデータパーツに対してのみトリガーされます。

可能な値：
- `true`
- `false`

**関連情報**
- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts) 設定
## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="0" />

この設定がゼロより大きい値を持っている場合、単一のレプリカのみが即座にマージを開始し、他のレプリカはその結果をダウンロードするために最大その時間を待機し、ローカルでマージを行うのを待ちます。選択されたレプリカがその時間内にマージを完了しない場合、標準の動作にフォールバックします。

可能な値：
- 任意の正の整数。
## fault_probability_after_part_commit {#fault_probability_after_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

テスト用です。変更しないでください。
## fault_probability_before_part_commit {#fault_probability_before_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

テスト用です。変更しないでください。
## finished_mutations_to_keep {#finished_mutations_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="100" />

保持する完成したマ mutations の数。ゼロの場合はすべて保持します。
## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

マージのためにファイルシステムキャッシュを通じて強制的に読み込みます。
## fsync_after_insert {#fsync_after_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

挿入されたすべてのパーツに対してfsyncを行います。挿入のパフォーマンスを大幅に低下させるため、広範なパーツでは使用を推奨しません。
## fsync_part_directory {#fsync_part_directory} 
<SettingsInfoBlock type="Bool" default_value="0" />

すべてのパーツ操作（書き込み、名前変更など）の後に、パーツディレクトリに対してfsyncを行います。
## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 
<SettingsInfoBlock type="Bool" default_value="1" />
廃止された設定で、何もしません。
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
廃止された設定で、何もしません。
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルの単一パーティション内の非アクティブなパーツの数が `inactive_parts_to_delay_insert` 値を超えた場合、`INSERT` が人工的に遅延します。

:::tip
これは、サーバーがパーツを十分に早くクリーンアップできないときに有用です。
:::

可能な値：
- 任意の正の整数。
## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

単一パーティション内の非アクティブなパーツの数が `inactive_parts_to_throw_insert` 値を超えた場合、`INSERT` は以下のエラーで中断されます：

> "非アクティブなパーツが多すぎます (N)。 パーツのクリーンアップは挿入よりも著しく遅れています。"例外。

可能な値：
- 任意の正の整数。
## index_granularity {#index_granularity} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

インデックスのマーク間のデータ行の最大数。すなわち、主キー値に対して対応する行の数。
## index_granularity_bytes {#index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

バイト単位のデータグラニュールの最大サイズ。

行数のみによってグラニュールサイズを制限するには、`0` に設定します（推奨されません）。
## initialization_retry_period {#initialization_retry_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

テーブル初期化のリトライ期間（秒）。
## kill_delay_period {#kill_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />
廃止された設定で、何もしません。
## kill_delay_period_random_add {#kill_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />
廃止された設定で、何もしません。
## kill_threads {#kill_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
廃止された設定で、何もしません。
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 
<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

デフォルトでは、軽量削除 `DELETE` はプロジェクションを持つテーブルでは機能しません。これは、プロジェクション内の行が `DELETE` 操作の影響を受ける可能性があるためです。従って、デフォルト値は `throw` です。しかし、このオプションは動作を変更することができます。値が `drop` または `rebuild` のいずれかである場合、削除はプロジェクションで機能します。`drop` はプロジェクションを削除するので、現在のクエリでは迅速ですが、将来のクエリでは遅くなります。`rebuild` はプロジェクションを再構築するため、現在のクエリのパフォーマンスに影響を与えることがありますが、将来のクエリを高速化する可能性もあります。これらのオプションはすべて部分レベルでのみ機能するため、影響を受けない部分のプロジェクションはそのまま維持され、削除や再構築のようなアクションをトリガーすることはありません。

可能な値：
- `throw`
- `drop`
- `rebuild`
## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

[exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 設定とともに、有効にされている場合、既存のデータ部分の削除された行数はテーブルが起動する際に計算されます。この設定が有効になると、テーブルの読み込み時間が遅くなる場合があります。

可能な値：
- `true`
- `false`

**関連情報**
- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 設定
## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 
<SettingsInfoBlock type="Seconds" default_value="120" />

マージ、ミューテーションなどのバックグラウンド操作に対して、テーブルロックを取得する前のタイムアウト秒数。
## marks_compress_block_size {#marks_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

マーク圧縮ブロックサイズ、圧縮するブロックの実際のサイズ。
## marks_compression_codec {#marks_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

マークで使用される圧縮エンコーディング。マークは十分に小さく、キャッシュされるため、デフォルトの圧縮はZSTD(3)です。
## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "新しい設定"}]}]}/>

有効にすると、マージ時に新しいパーツのためにスキップインデックスがビルドされ、保存されます。
そうしないと、明示的なMATERIALIZE INDEXによって作成/保存される可能性があります。
## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

MATERIALIZE TTL の際にのみ ttl 情報を再計算します。
## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

'too many parts'チェックは、'parts_to_delay_insert' および 'parts_to_throw_insert' により、該当するパーティション内の平均パートサイズが指定された閾値よりも大きくない場合にのみアクティブです。指定された閾値よりも大きい場合、INSERTは遅延または拒否されません。これにより、パーツがうまくマージされて大きなパーツになる限り、単一サーバー上の単一テーブルに数百テラバイトを持つことが可能です。これは非アクティブなパーツまたは総パーツに対する閾値には影響しません。
## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="161061273600" />

十分なリソースが利用可能な場合、一つのパーツにマージされる最大パーツサイズ（バイト単位）を定義します。これは、大きな背景マージによって自動的に作成される最大パーツサイズにおおよそ対応します。（0はマージを無効にすることを意味します）

可能な値：

- 任意の非負整数。

マージスケジューラは定期的にパーティション内のサイズおよびパーツの数を分析し、プール内に十分な空きリソースがある場合は、バックグラウンドマージを開始します。マージは、ソースパーツの合計サイズが `max_bytes_to_merge_at_max_space_in_pool` よりも大きくなるまで発生し続けます。

[OPTIMIZE FINAL](/sql-reference/statements/optimize) によって開始されたマージは、`max_bytes_to_merge_at_max_space_in_pool` を無視します（フリーディスクスペースのみが考慮されます）。
## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="1048576" />

バックグラウンドプール内での空きリソースが最小限のときに、一つのパーツにマージされる最大パーツサイズ（バイト単位）を定義します。

可能な値：
- 任意の正の整数。

`max_bytes_to_merge_at_min_space_in_pool` は、利用可能なディスクスペースの欠如にもかかわらずマージ可能な最大パーツサイズを定義します（プール内）。これは、小さなパーツの数を減らし、「Too many parts」エラーの可能性を減少するために必要です。
マージは、合計マージされたパーツサイズを倍にすることによってディスクスペースを消費します。このため、空きディスクスペースが少ない場合、空きスペースが存在していても、進行中の大規模マージによってそのスペースが予約されてしまい、他のマージが開始できなくなることがあります。

## max_cleanup_delay_period {#max_cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="300" />

古いキューのログ、ブロックハッシュ、パーツをクリーンアップするための最大期間。
```
```md
## max_compress_block_size {#max_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

圧縮する前にテーブルに書き込むための未圧縮データのブロックの最大サイズ。  
この設定はグローバル設定でも指定できます（[max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size) 設定を参照）。  
テーブル作成時に指定された値は、この設定のグローバル値を上書きします。

## max_concurrent_queries {#max_concurrent_queries} 
<SettingsInfoBlock type="UInt64" default_value="0" />

MergeTree テーブルに関連する最大同時実行クエリ数。  
クエリは他の `max_concurrent_queries` 設定によっても制限されます。

可能な値:
- 正の整数。
- `0` — 制限なし。

デフォルト値: `0`（制限なし）。

**例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```

## max_delay_to_insert {#max_delay_to_insert} 
<SettingsInfoBlock type="UInt64" default_value="1" />

アクティブなパーツの数が [parts_to_delay_insert](#parts_to_delay_insert) 値を超えた場合に `INSERT` 遅延を計算するために使用される秒数の値。

可能な値:
- 任意の正の整数。

`INSERT` の遅延（ミリ秒単位）は次の式で計算されます：

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```
例えば、パーティションに299のアクティブパーツがあり、parts_to_throw_insert = 300、parts_to_delay_insert = 150、max_delay_to_insert = 1の場合、`INSERT` の遅延は `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` ミリ秒となります。

23.1バージョンから式が次のように変更されました：

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```
例えば、パーティションに224のアクティブパーツがあり、parts_to_throw_insert = 300、parts_to_delay_insert = 150、max_delay_to_insert = 1、min_delay_to_insert_ms = 10の場合、`INSERT` は `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` ミリ秒遅延されます。

## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

多くの未完了のミューテーションがある場合の、ミューテーションする MergeTree テーブルの最大遅延（ミリ秒単位）

## max_digestion_size_per_segment {#max_digestion_size_per_segment} 
<SettingsInfoBlock type="UInt64" default_value="268435456" />

GIN インデックスを構築するためのセグメントごとの最大バイト数。

## max_file_name_length {#max_file_name_length} 
<SettingsInfoBlock type="UInt64" default_value="127" />

ハッシュ化せずにそのまま保持するためのファイル名の最大長。  
`replace_long_file_name_to_hash` 設定が有効な場合にのみ効果があります。  
この設定の値にはファイル拡張子の長さは含まれません。したがって、ファイルシステムエラーを避けるために、通常255バイトの最大ファイル名長よりも少し下に設定することが推奨されます。

## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="75" />

この設定を超えるファイル数（削除、追加）の場合、ALTERを適用しません。

可能な値:
- 任意の正の整数。

デフォルト値: 75

## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="50" />

この設定を超えるファイル数（削除）の場合、ALTERを適用しません。

可能な値:
- 任意の正の整数。

## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 
<SettingsInfoBlock type="UInt64" default_value="40" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "新しい設定"}]}]}/>

パラレル書き込みのために一度にフラッシュできるストリーム（カラム）の最大数（マージのための max_insert_delayed_streams_for_parallel_write と同様）。  
縦型マージのみに適用されます。

## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />

パーツが選択されなかった後、再度マージするためにパーツを選択しようとする前に待機する最大時間。設定を低くすると、large-scale クラスタでは zookeeper に対する大規模なリクエストが発生するため、バックグラウンドスケジュールプールでの選択タスクのトリガーが頻繁に発生します。

## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="2" />

プールに TTL エントリを持つマージが指定された数を超えたときは、TTL を持つ新しいマージを割り当てません。これは、通常のマージ用にスレッドを空け、「パーツが多すぎる」エラーを避けるためです。

## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 
<SettingsInfoBlock type="UInt64" default_value="0" />

レプリカごとのパートミューテーションの数を指定されている量に制限します。ゼロはレプリカごとのミューテーションの数に制限がないことを意味します（実行は依然として他の設定によって制約される場合があります）。

## max_part_loading_threads {#max_part_loading_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
古い設定で、何も影響しません。

## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
古い設定で、何も影響しません。

## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

1つのクエリでアクセスできるパーティションの最大数を制限します。

設定された値は、クエリレベルの設定によって上書きされることがあります。

可能な値:
- 任意の正の整数。

クエリ/セッション/プロファイルレベルでのクエリ複雑度設定 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read) も指定できます。

## max_parts_in_total {#max_parts_in_total} 
<SettingsInfoBlock type="UInt64" default_value="100000" />

テーブルのすべてのパーティションにおけるアクティブなパーツの総数が `max_parts_in_total` の値を超えると、`INSERT` は `Too many parts (N)` 例外で中断されます。

可能な値:
- 任意の正の整数。

テーブル内の多数のパーツは、ClickHouse のクエリパフォーマンスを低下させ、ClickHouse の起動時間を増加させます。これは通常、誤った設計（パーティション戦略の選択ミス - あまりにも小さなパーティション）の結果です。

## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="100" />

一度にマージできるパーツの最大量（0 - 無効）。OPTIMIZE FINAL クエリには影響しません。

## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />

失敗したミューテーションの最大延期時間。

## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "レプリケーションキューでのフェッチタスクの延期を有効にするための新しい設定を追加"}]}]}/>

失敗したレプリケートフェッチの最大延期時間。

## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "レプリケーションキューでのマージタスクの延期を有効にするための新しい設定を追加"}]}]}/>

失敗したレプリケートマージの最大延期時間。

## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "レプリケーションキューでのタスクの延期を有効にするための新しい設定を追加"}]}]}/>

失敗したレプリケートタスクの最大延期時間。値は、タスクがフェッチ、マージ、またはミューテーションでない場合に使用されます。

## max_projections {#max_projections} 
<SettingsInfoBlock type="UInt64" default_value="25" />

マージツリープロジェクションの最大数。

## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

[レプリケート](../../engines/table-engines/mergetree-family/replication.md) フェッチのためのネットワークを介したデータ交換の最大速度（バイト/秒）を制限します。この設定は特定のテーブルに適用されますが、[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth) 設定はサーバーに適用されます。

サーバーネットワークと特定のテーブルのネットワークの両方を制限できますが、そのためにはテーブルレベルの設定の値がサーバーレベルのものよりも小さい必要があります。そうでない場合、サーバーは `max_replicated_fetches_network_bandwidth_for_server` 設定のみを考慮します。

この設定は完全に正確に実施されているわけではありません。

可能な値:

- 正の整数。
- `0` — 制限なし。

デフォルト値: `0`。

**使用法**

新しいノードを追加または置き換えるためにデータをレプリケートするときの速度を制限するために使用できます。

## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

非アクティブなレプリカがある場合、ClickHouse Keeper ログにどういう記録が保持されるか。この数を超えると非アクティブなレプリカが失われます。

可能な値:
- 任意の正の整数。

## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

ReplicatedMergeTree キュー内で同時に許可されるマージおよびミューテーションパーツのタスク数。

## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1" />

ReplicatedMergeTree キュー内で同時に許可される TTL を持つパーツのマージタスクの数。

## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="8" />

ReplicatedMergeTree キュー内で同時に許可されるミューテーションパーツのタスク数。

## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

[レプリケート](/engines/table-engines/mergetree-family/replacingmergetree) のためのネットワークを介したデータ交換の最大速度（バイト/秒）を制限します。この設定は特定のテーブルに適用されますが、[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth) 設定はサーバーに適用されます。

サーバーネットワークと特定のテーブルのネットワークの両方を制限できますが、そのためにはテーブルレベルの設定の値がサーバーレベルのものよりも小さい必要があります。そうでない場合、サーバーは `max_replicated_sends_network_bandwidth_for_server` 設定のみを考慮します。

この設定は完全に正確に実施されているわけではありません。

可能な値:

- 正の整数。
- `0` — 制限なし。

**使用法**

新しいノードを追加または置き換えるためにデータをレプリケートするときの速度を制限するために使用できます。

## max_suspicious_broken_parts {#max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="100" />

単一のパーティション内の壊れたパーツの数が `max_suspicious_broken_parts` 値を超えると、自動削除が拒否されます。

可能な値:
- 任意の正の整数。

## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

壊れたパーツの最大サイズ。超過する場合は自動削除を拒否します。

可能な値:
- 任意の正の整数。

## merge_max_block_size {#merge_max_block_size} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

マージされたパーツからメモリに読み込まれる行数。

可能な値:
- 任意の正の整数。

マージは `merge_max_block_size` 行のブロックでパーツから行を読み取り、その後、結果を新しいパーツにマージして書き込みます。読み取ったブロックはRAMに配置されるため、`merge_max_block_size` はマージのために必要なRAMのサイズに影響を与えます。したがって、非常に幅の広い行を持つテーブルでは、マージのために大量のRAMを消費する可能性があります（平均行サイズが100kbの場合、10パーツをマージすると、(100kb * 10 * 8192) = 約8GBのRAMが必要になります）。`merge_max_block_size` を減少させると、マージに必要なRAMの量を減少できますが、マージの速度が低下します。

## merge_max_block_size_bytes {#merge_max_block_size_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

マージ操作のために形成すべきブロック内のバイト数。デフォルトでは `index_granularity_bytes` と同じ値を持ちます。

## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud のみで利用可能。マージ時にキャッシュを事前ウォームアップするためのパーツの最大サイズ（コンパクトまたはパック形式）。

## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />

パーツが選択されなかった後、再度マージするためにパーツを選択しようとする前に待機する最小時間。  
設定を低くすると、large-scale クラスタでは zookeeper に対する大規模なリクエストが発生するため、バックグラウンドスケジュールプールでの選択タスクのトリガーが頻繁に発生します。

## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 
<SettingsInfoBlock type="Float" default_value="1.2" />

マージ選択タスクの休止時間は、マージするものがないときにこの係数で掛け算され、マージが割り当てられたときは割り算されます。

## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>
<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

マージ割り当てのためのパーツを選択するアルゴリズムです。

## merge_selector_base {#merge_selector_base} 
<SettingsInfoBlock type="Float" default_value="5" />

割り当てられたマージの書き込み増幅に影響を与えます（専門家レベルの設定で、何をしているか理解していない場合は変更しないでください）。  
Simple および StochasticSimple マージセレクターで動作します。

## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 
<SettingsInfoBlock type="UInt64" default_value="0" />

パーティション内のパーツの数に対する論理が作動するタイミングを制御します。係数が大きいほど反応が遅れます。

## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 
<SettingsInfoBlock type="Bool" default_value="1" />

指定された割合（0.01）未満のサイズのパーツが範囲の右側から削除されるマージ用のパーツ選択のためのヒューリスティックを有効にします。  
Simple および StochasticSimple マージセレクターで動作します。

## merge_selector_window_size {#merge_selector_window_size} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

一度に見るパーツの数。

## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="16106127360" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud のみで利用可能。マージ時にキャッシュを事前ウォームアップするためのパーツの最大サイズ。

## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 
<SettingsInfoBlock type="UInt64" default_value="2592000" />
古い設定で、何も影響しません。

## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

古いパーツ、WAL、およびミューテーションのクリーンアップを実行するためのClickHouseのインターバル（秒単位）。

可能な値:
- 任意の正の整数。

## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="60" />

古い一時ディレクトリのクリーンアップを実行するためのClickHouseのインターバル（秒単位）。

可能な値:
- 任意の正の整数。

## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 
<SettingsInfoBlock type="UInt64" default_value="0" />
古い設定で、何も影響しません。

## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

再圧縮 TTL を持つマージを繰り返すまでの最小遅延（秒単位）。

## merge_with_ttl_timeout {#merge_with_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

削除 TTL を持つマージを繰り返すまでの最小遅延（秒単位）。

## merge_workload {#merge_workload} 

マージとその他のワークロード間でリソースがどのように利用され、共有されるかを調整するために使用される。  
指定された値は、このテーブルのバックグラウンドマージの `workload` 設定値として使用されます。  
指定されていない場合（空文字列）、サーバー設定 `merge_workload` が代わりに使用されます。

**その他の情報**
- [ワークロードスケジューリング](/operations/workload-scheduling.md)

## min_absolute_delay_to_close {#min_absolute_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="0" />

クローズするための最小絶対遅延、リクエストを停止して、ステータスチェック中にOkを返さない。

## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

`min_age_to_force_merge_seconds` を全体のパーティションにのみ適用するか、サブセットに適用するか。

デフォルトでは、設定 `max_bytes_to_merge_at_max_space_in_pool` を無視します（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

可能な値:
- true, false

## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 
<SettingsInfoBlock type="UInt64" default_value="0" />

範囲内のすべてのパーツが `min_age_to_force_merge_seconds` の値よりも古い場合、パーツをマージします。

デフォルトでは、設定 `max_bytes_to_merge_at_max_space_in_pool` を無視します（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

可能な値:
- 正の整数。

## min_bytes_for_compact_part {#min_bytes_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
古い設定で、何も影響しません。

## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud のみで利用可能。データパートのフルストレージタイプを使用するための最小未圧縮サイズ（バイト）。

## min_bytes_for_wide_part {#min_bytes_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

`Wide` 形式で保存されるデータ部分の最低バイト/行数。これらの設定の1つまたは両方を設定できます。

## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

新しいパーツのためにマークキャッシュとプライマリインデックスキャッシュを事前ウォームアップするための最小サイズ（未圧縮バイト）。

## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 
<SettingsInfoBlock type="UInt64" default_value="0" />

ボリュームディスク [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) を介して新しい大きなパーツを分配する際にバランスを有効にするための最小バイト数を設定します。

可能な値:

- 正の整数。
- `0` — バランスを無効にします。

**使用法**

`min_bytes_to_rebalance_partition_over_jbod` 設定の値は、[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) の値/ 1024 より大きくする必要があります。そうでない場合、ClickHouse は例外をスローします。

## min_compress_block_size {#min_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

次のマークのために圧縮に必要な未圧縮データのブロックの最小サイズ。  
この設定はグローバル設定でも指定できます（[min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size) 設定を参照）。  
テーブル作成時に指定された値は、この設定のグローバル値を上書きします。

## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 
<SettingsInfoBlock type="UInt64" default_value="0" />

フェッチ後のパートに対して fsync を行うために必要な圧縮バイトの最小数（0 - 無効）。

## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

マージ後のパートに対して fsync を行うために必要な圧縮バイトの最小数（0 - 無効）。

## min_delay_to_insert_ms {#min_delay_to_insert_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

単一のパーティションに未マージのパーツが多数ある場合、MergeTree テーブルにデータを挿入する際の最小遅延（ミリ秒単位）。

## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

未完了のミューテーションが多数ある場合の、MergeTree テーブルに対するミューテーションの最小遅延（ミリ秒単位）。

## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

データを挿入するために必要なディスクスペースの最小空きバイト数。  
利用可能な空きバイト数が `min_free_disk_bytes_to_perform_insert` より少ない場合、例外がスローされ、挿入は実行されません。  
この設定は以下を考慮に入れます：
- `keep_free_space_bytes` 設定を考慮に入れます。
- `INSERT` 操作によって書き込まれるデータ量は考慮に入れません。
- 正の（ゼロ以外の）バイト数が指定されている場合のみチェックされます。

可能な値:
- 任意の正の整数。

:::note
`min_free_disk_bytes_to_perform_insert` と `min_free_disk_ratio_to_perform_insert` の両方が指定されている場合、ClickHouse はより多くの空きメモリで挿入を実行できる値を優先します。
:::

## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 
<SettingsInfoBlock type="Float" default_value="0" />

`INSERT` を実行するためのディスク空きスペースと総スぺースの比の最小割合。  
0 と 1 の間の浮動小数点値である必要があります。この設定は：
- `keep_free_space_bytes` 設定を考慮に入れます。
- `INSERT` 操作によって書き込まれるデータ量は考慮に入れません。
- 正の（ゼロ以外の）比率が指定されている場合のみチェックされます。

可能な値:
- Float, 0.0 - 1.0

`min_free_disk_ratio_to_perform_insert` と `min_free_disk_bytes_to_perform_insert` の両方が指定されている場合、ClickHouse はより多くの空きメモリで挿入を実行できる値を優先します。

## min_index_granularity_bytes {#min_index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1024" />

データのグラニューラの最小許容サイズ（バイト単位）です。

この設定は、非常に低い `index_granularity_bytes` を持つテーブルを誤って作成しないようにするための保護策です。

## min_marks_to_honor_max_concurrent_queries {#min_marks_to_honor_max_concurrent_queries} 
<SettingsInfoBlock type="UInt64" default_value="0" />

[ max_concurrent_queries](#max_concurrent_queries) 設定を適用するためにクエリが読み取る必要のあるマークの最小数。

:::note
クエリは他の `max_concurrent_queries` 設定によっても制限されます。
:::

可能な値:
- 正の整数。
- `0` — 無効（`max_concurrent_queries` 制限はクエリに適用されません）。

**例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```

## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

ストレージディスクへの直接I/Oアクセスを使用するためにマージ操作に必要な最小データボリューム。  
データパーツをマージするとき、ClickHouseはマージするすべてのデータの総ストレージボリュームを計算します。  
ボリュームが `min_merge_bytes_to_use_direct_io` バイトを超える場合、ClickHouseはストレージディスクへのデータを直接I/Oインターフェイス（`O_DIRECT`オプション）を使用して読み書きします。  
`min_merge_bytes_to_use_direct_io = 0` の場合、直接I/Oは無効になります。

## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="0" />

マージセレクターが一度にマージするために選択できるデータパーツの最小数（専門家レベルの設定で、何をしているか理解していない場合は変更しないでください）。  
0 - 無効。  
Simple および StochasticSimple マージセレクターで動作します。

## min_relative_delay_to_close {#min_relative_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="300" />

クローズするための他のレプリカからの最小遅延、リクエストを停止して、ステータスチェック中にOkを返さない。

## min_relative_delay_to_measure {#min_relative_delay_to_measure} 
<SettingsInfoBlock type="UInt64" default_value="120" />

絶対的遅延がこの値よりも小さい場合のみ、相対的レプリカ遅延を計算します。

## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 
<SettingsInfoBlock type="UInt64" default_value="120" />
古い設定で、何も影響しません。

## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

古いレコードを削除する前に、ZooKeeper ログに保持する必要がある最後のレコード数。  
この数は、古くなっていたとしても保持されます。これは、クリーンアップ前に ZooKeeper ログを診断するためにのみ使用されます。

可能な値:
- 任意の正の整数。

## min_rows_for_compact_part {#min_rows_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
古い設定で、何も影響しません。

## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud のみで利用可能。データパートがパックされたのではなく、フルストレージタイプを使用するための最小行数。

## min_rows_for_wide_part {#min_rows_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />

コンパクトではなく広い形式でパートを作成するための最小行数。

## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

マージ後のパートに対して fsync を行うための最小行数（0 - 無効）。

## mutation_workload {#mutation_workload} 

ミューテーションと他のワークロード間でリソースがどのように利用され、共有されるかを調整するために使用されます。  
指定された値は、このテーブルのバックグラウンドミューテーションの `workload` 設定値として使用されます。  
指定されていない場合（空文字列）、サーバー設定 `mutation_workload` が代わりに使用されます。

**その他の情報**
- [ワークロードスケジューリング](/operations/workload-scheduling.md)

## non_replicated_deduplication_window {#non_replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="0" />

重複をチェックするためにハッシュサムが保存されている非レプリケート [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルに挿入された最も最近のブロックの数。

可能な値:
- 任意の正の整数。
- `0`（重複排除を無効にします）。

重複排除メカニズムが使用され、レプリケートテーブルに類似しています（[replicated_deduplication_window](#replicated_deduplication_window) 設定を参照）。  
生成されたパーツのハッシュサムは、ディスク上のローカルファイルに書き込まれます。

## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

SharedJoin または SharedSet に最新のブロック番号を通知します。ClickHouse Cloud のみ。

## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 
<SettingsInfoBlock type="UInt64" default_value="20" />

プール内の空きエントリが指定された数未満の場合、パートのミューテーションは実行されません。これは、通常のマージ用にスレッドの空きを残すためと、「パーツが多すぎる」エラーを避けるためです。

可能な値:
- 任意の正の整数。

**使用法**

`number_of_free_entries_in_pool_to_execute_mutation` 設定の値は、[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) と [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) の値より小さい必要があります。さもないと、ClickHouse は例外を投げます。

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 
<SettingsInfoBlock type="UInt64" default_value="25" />

プール内の空きエントリが指定された数未満の場合、バックグラウンドでのパーティション全体の最適化は実行されません（このタスクは `min_age_to_force_merge_seconds` を設定し、`min_age_to_force_merge_on_partition_only` を有効にすることで生成されます）。  
これは、通常のマージのためにスレッドを空け、「パーツが多すぎる」エラーを避けるためです。

可能な値:
- 正の整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition` 設定の値は、[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) と [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) の値より小さい必要があります。さもないと、ClickHouse で例外が投げられます。
```
```yaml
title: 'プール内の空きエントリ数を減らしてマージの最大サイズを下げる'
sidebar_label: 'プール内の空きエントリ数を減らしてマージの最大サイズを下げる'
keywords: ['プール', 'マージ', 'MergeTree']
description: 'プール内の空きエントリ数を減らす設定の説明。'
```

## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 
<SettingsInfoBlock type="UInt64" default_value="8" />

プール（またはレプリケーションキュー）内に指定された数未満の空きエントリがある場合、処理するためのマージの最大サイズを下げ始めます（またはキューに追加します）。これは、小さなマージを処理できるようにするためであり、長時間実行されるマージでプールを埋めることを防ぐためです。

可能な値：
- 任意の正の整数。

## number_of_mutations_to_delay {#number_of_mutations_to_delay} 
<SettingsInfoBlock type="UInt64" default_value="500" />

テーブルに未完了のマテーションがその数以上ある場合、テーブルのマテーションを人工的に遅くします。0に設定すると無効になります。

## number_of_mutations_to_throw {#number_of_mutations_to_throw} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

テーブルに未完了のマテーションがその数以上ある場合、「マテーションが多すぎる」という例外を投げます。0に設定すると無効になります。

## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloudでのみ利用可能です。マージを考慮する上位 N パーティションの数です。このパーティションのデータパーツをマージできる量によってウェイト付けされたランダムな方法で選択されます。

## old_parts_lifetime {#old_parts_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="480" />

不活性パーツを保存するための時間（秒）で、サーバーの自発的な再起動中にデータ損失を防ぐためのものです。

可能な値：
- 任意の正の整数。

複数のパーツを新しいパーツにマージした後、ClickHouseは元のパーツを不活性としてマークし、`old_parts_lifetime` 秒後にのみ削除します。不活性パーツは、現在のクエリで使用されていない場合、すなわちそのパーツの `refcount` が 1 の場合に削除されます。

新しいパーツについて `fsync` は呼び出されないため、新しいパーツは一時的にサーバーの RAM（OS キャッシュ）のみで存在します。サーバーが自発的に再起動された場合、新しいパーツは失われたり損傷したりする可能性があります。データを保護するために不活性パーツはすぐには削除されません。

起動時、ClickHouseはパーツの整合性をチェックします。マージされたパーツが損傷している場合、ClickHouse は不活性なパーツをアクティブリストに戻し、後に再度マージを行います。損傷していない場合、元の不活性パーツは名前が変更され（`ignored_` プレフィックスが追加され）、`detached` フォルダに移動されます。

デフォルトの `dirty_expire_centisecs` 値（Linux カーネルの設定）は 30 秒で、書き込まれたデータが RAM のみに保存される最大時間ですが、ディスクシステムに重い負荷がかかるとデータが遅れて書き込まれることがあります。実験的に、`old_parts_lifetime` の値として 480 秒が選択されました。この間、新しいパーツはディスクへの書き込みが保証されます。

## optimize_row_order {#optimize_row_order} 
<SettingsInfoBlock type="Bool" default_value="0" />

新しく挿入されたテーブルパーツの圧縮可能性を改善するために、挿入中に行の順序を最適化するかどうかを制御します。

通常の MergeTree エンジンのテーブルにのみ効果があります。特化型 MergeTree エンジンのテーブル（例：CollapsingMergeTree）には何も影響しません。

MergeTree テーブルは（オプションで）[圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec)を使用して圧縮されます。LZ4 や ZSTD のような一般的な圧縮コーデックは、データにパターンがある場合に最大の圧縮率を達成します。同じ値の長いランは通常、非常に良く圧縮されます。

この設定を有効にすると、ClickHouseは新しく挿入されたパーツのデータを、新しいテーブルパーツの列全体にわたって同じ値のランの数を最小限に抑える行の順序で格納しようとします。言い換えれば、少数の同じ値のランは、個々のランが長く圧縮されやすいことを意味します。

最適な行の順序を見つけることは計算的に困難（NP困難）です。したがって、ClickHouseは元の行の順序と比較して圧縮率を改善する、迅速に見つけるためのヒューリスティックスを使用します。

<details markdown="1">

<summary>行の順序を見つけるためのヒューリスティックス</summary>

テーブル（またはテーブルパーツ）の行を自由にシャッフルすることは一般的に可能です。SQLは別の行の順序で同じテーブル（テーブルパーツ）を同等と見なします。

プライマリキーがテーブルに定義されている場合、この行をシャッフルする自由度は制限されます。ClickHouse では、プライマリキー `C1, C2, ..., CN` が、テーブルの行がカラム `C1`, `C2`, ... `Cn` でソートされることを強制します（[クラスタ化インデックス](https://en.wikipedia.org/wiki/Database_index#Clustered)）。その結果、行は「同等クラス」の中でのみシャッフルできます。つまり、プライマリキーのカラムに同じ値を持つ行同士のみです。高いカーディナリティを持つプライマリキー（例：`DateTime64` タイムスタンプカラムを含むプライマリキー）の場合、多くの小さな同等クラスが生成されます。同様に、低いカーディナリティのプライマリキーを持つテーブルは、少数の大きな同等クラスを生成します。プライマリキーがないテーブルは、すべての行にまたがる単一の同等クラスを表します。

同等クラスが少ないほど大きいほど、行を再シャッフルする自由度は高くなります。

各同等クラス内で最適な行の順序を見つけるために適用されるヒューリスティックスは、D. Lemire、O. Kaser によって提案されており、[インデックスを小さくするための列の再順序](https://doi.org/10.1016/j.ins.2011.02.002)に基づいています。これは、各同等クラス内で非プライマリキーのカラムの上昇カーディナリティによって行をソートします。

ステップは以下のとおりです：
1. プライマリキーのカラムの値に基づいて、すべての同等クラスを見つけます。
2. 各同等クラスに対して、非プライマリキーのカラムのカーディナリティを計算（通常は推定）します。
3. 各同等クラスの行を非プライマリキーのカラムのカーディナリティが上昇する順序でソートします。

</details>

有効にすると、挿入操作は新しいデータの行の順序を分析して最適化するために追加の CPU コストが発生します。INSERT 操作は、データの特性によっては 30-50% 長くなることが予想されます。LZ4 または ZSTD の圧縮率は平均的に 20-40% 改善します。

この設定は、プライマリキーがないテーブルや低いカーディナリティのプライマリキーを持つテーブル（つまり、わずかに異なるプライマリキー値を持つテーブル）に最適です。高いカーディナリティを持つプライマリキー、例えば `DateTime64` タイプのタイムスタンプカラムを含むものは、この設定からの恩恵を受けないと考えられています。

## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="30" />

シャード間でパーツを移動する前後に待つ時間。

## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="0" />

パーツをシャード間で移動するための実験的/未完成の機能。シャーディングの式は考慮されません。

## parts_to_delay_insert {#parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

単一のパーティションのアクティブなパーツの数が `parts_to_delay_insert` 値を超えた場合、`INSERT` は人工的に遅くなります。

可能な値：
- 任意の正の整数。

ClickHouseは、バックグラウンドマージプロセスが追加されるよりも早くパーツをマージできるように、`INSERT` を人工的に実行時間を長く（'sleep' を追加）します。

## parts_to_throw_insert {#parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="3000" />

単一のパーティションのアクティブなパーツの数が `parts_to_throw_insert` 値を超えた場合、`INSERT` は `Too many parts (N). Merges are processing significantly slower than inserts` という例外で中断されます。

可能な値：
- 任意の正の整数。

`SELECT` クエリの最大性能を達成するためには、処理されるパーツの数を最小限に抑える必要があります。詳細は [Merge Tree](/development/architecture#merge-tree)を参照してください。

23.6 バージョン以前は、この設定は 300 に設定されていました。より高い異なる値を設定することで、`Too many parts` エラーの確率を減らすことができますが、同時に `SELECT` パフォーマンスが低下する可能性があります。また、マージの問題が発生した場合（例えば、ディスク容量不足など）、元の 300 よりも遅れて気付くことになります。

## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

もしパーツのサイズの合計がこのしきい値を超え、レプリケーションログエントリの作成からの時間が `prefer_fetch_merged_part_time_threshold` よりも長い場合は、ローカルでマージを行う代わりにレプリカからマージされたパーツを取得することを優先します。これにより、非常に長いマージを迅速化します。

可能な値：
- 任意の正の整数。

## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="3600" />

レプリケーションログ（ClickHouse Keeper または ZooKeeper）エントリの作成からの時間がこのしきい値を超え、パーツのサイズの合計が `prefer_fetch_merged_part_size_threshold` よりも大きい場合、ローカルでマージを行う代わりにレプリカからマージされたパーツを取得することを優先します。これにより、非常に長いマージを迅速化します。

可能な値：
- 任意の正の整数。

## prewarm_mark_cache {#prewarm_mark_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
もし true の場合、マークキャッシュは挿入、マージ、取得、およびサーバーの起動時のマークをキャッシュに保存することによってプレウォームされます。

## prewarm_primary_key_cache {#prewarm_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

もし true の場合、プライマリインデックスキャッシュは、挿入、マージ、取得、およびサーバーの起動時のマークをキャッシュに保存してプレウォームされます。

## primary_key_compress_block_size {#primary_key_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

プライマリ圧縮ブロックサイズ、圧縮するブロックの実際のサイズです。

## primary_key_compression_codec {#primary_key_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

プライマリで使用される圧縮エンコーディング。プライマリキーは十分小さく、キャッシュされているので、デフォルトの圧縮は ZSTD(3) です。

## primary_key_lazy_load {#primary_key_lazy_load} 
<SettingsInfoBlock type="Bool" default_value="1" />
プライマリキーをテーブルの初期化時ではなく、最初の使用時にメモリにロードします。これにより、多数のテーブルが存在する場合にメモリを節約できます。

## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 
<SettingsInfoBlock type="Float" default_value="0.9" />

プライマリキーのカラムの値がこの比率の回数以上変化する場合、次のカラムのロードをメモリからスキップします。これにより、プライマリキーのうまくないカラムをロードしないことによってメモリ使用量を節約できます。

## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization} 
<SettingsInfoBlock type="Float" default_value="0.9375" />

スパースシリアライゼーションでの全体値に対する _デフォルト_ 値の最小比率。この値を設定すると、カラムはスパースシリアライゼーションを使用して保存されます。

カラムがスパース（主にゼロを含む）である場合、ClickHouse はそれをスパースフォーマットでエンコードでき、計算を自動的に最適化します。クエリ時にデータを完全に解凍する必要がありません。このスパースシリアライゼーションを有効にするには、`ratio_of_defaults_for_sparse_serialization` 設定を 1.0 未満に設定します。値が 1.0 以上の場合、カラムは常に通常の完全なシリアライゼーションを使用して書き込まれます。

可能な値：

- スパースserializationを有効にするための `0` と `1` の間の浮動小数点
- スパースserializationを使用したくない場合は `1.0` （またはそれ以上）

**例**

以下のテーブルの `s` カラムは、95% の行で空の文字列となっています。`my_regular_table` ではスパースシリアライゼーションを使用せず、`my_sparse_table` では `ratio_of_defaults_for_sparse_serialization` を 0.95 に設定します。

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

`my_sparse_table` の `s` カラムがディスク上でより少ないストレージスペースを使用していることに注意してください：

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

スパースエンコーディングを使用しているカラムを確認するには、`system.parts_columns` テーブルの `serialization_kind` カラムを閲覧します：

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

`s` のどのパーツがスパースシリアライゼーションを使用して保存されたかを確認できます：

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

## reduce_blocking_parts_sleep_ms {#reduce_blocking_parts_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5000"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloudでのみ利用可能です。範囲がドロップまたは置換されていない場合に、ブロックされたパーツを再度減少させるために待機する最小時間。設定を下げると、background_schedule_pool のタスクが頻繁にトリガーされ、大規模クラスターで ZooKeeper への大量のリクエストが発生します。

## refresh_parts_interval {#refresh_parts_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

もし 0 より大きい場合、データが更新されたかどうかを確認するために、基盤となるファイルシステムからデータパーツのリストを更新します。この設定は、テーブルが読み取り専用ディスクにある場合（つまり、データが別のレプリカによって書き込まれている場合）のみ設定できます。

## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="10800" />

この設定値が 0 より大きい場合、共有ストレージ上のマージパーツがある場合にのみ、単一のレプリカがマージを即座に開始します。`allow_remote_fs_zero_copy_replication` が有効である必要があります。

:::note
ゼロコピーのレプリケーションはプロダクション用に準備ができていません。
ゼロコピーのレプリケーションは ClickHouse バージョン 22.8 以降でデフォルトで無効になっています。

この機能はプロダクションでの使用を推奨されていません。
:::

可能な値：
- 任意の正の整数。

## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

変換プロセス中に互換モードでゼロコピーを実行します。

## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path} 

<ExperimentalBadge/>
<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

ゼロコピーのテーブルに依存しない情報のための ZooKeeper パス。

## remove_empty_parts {#remove_empty_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

TTL、マテーション、またはコラプシングマージアルゴリズムによってプルーニングされた後、空のパーツを削除します。

## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="1" />

未完成の実験機能のための設定です。

## remove_unused_patch_parts {#remove_unused_patch_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新しい設定"}]}]}/>

すべてのアクティブなパーツに適用されたパッチパーツをバックグラウンドで削除します。

## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 
<SettingsInfoBlock type="Bool" default_value="1" />

カラムのファイル名が長すぎる場合（'max_file_name_length' バイトを超える）、それを SipHash128 に置き換えます。

## replicated_can_become_leader {#replicated_can_become_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />

もし true の場合、このノードのレプリケーションテーブルのレプリカはリーダーシップを獲得しようとします。

可能な値：
- `true`
- `false`

## replicated_deduplication_window {#replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

ClickHouse Keeper が重複をチェックするために保存する直近の挿入ブロックの数。

可能な値：
- 任意の正の整数。
- 0（重複排除を無効にする）

`Insert` コマンドは 1 つ以上のブロック（パーツ）を作成します。レプリケーテッドテーブルに書き込むときの[挿入の重複排除](../../engines/table-engines/mergetree-family/replication.md)では、ClickHouse は作成されたパーツのハッシュサムを ClickHouse Keeper に書き込みます。ハッシュサムは最新の `replicated_deduplication_window` ブロックにのみ保存されます。最も古いハッシュサムは ClickHouse Keeper から削除されます。

`replicated_deduplication_window` が大きいと `Inserts` の速度が遅くなります。ハッシュサムはフィールド名とタイプの構成と挿入されたパーツのデータ（バイトストリーム）から計算されます。

## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

郵送された重複をチェックするために ClickHouse Keeper が保存する直近の非同期挿入ブロックの数。

可能な値：
- 任意の正の整数。
- 0（非同期挿入の重複排除を無効にする）

[Async Insert](/operations/settings/settings#async_insert) コマンドは 1 つ以上のブロック（パーツ）にキャッシュされます。[挿入の重複排除](/engines/table-engines/mergetree-family/replication)では、レプリケーテッドテーブルへの書き込み時に、ClickHouse は各挿入のハッシュサムを ClickHouse Keeper に書き込みます。ハッシュサムは最新の `replicated_deduplication_window_for_async_inserts` ブロックにのみ保存され、最も古いハッシュサムは ClickHouse Keeper から削除されます。`replicated_deduplication_window_for_async_inserts` が大きいと `Async Inserts` の速度が遅くなります。より多くのエントリを比較する必要があります。ハッシュサムはフィールド名と型の構成、挿入のデータ（バイトストリーム）から計算されます。

## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

挿入されたブロックのハッシュサムが ClickHouse Keeper から削除されるまでの秒数。

可能な値：
- 任意の正の整数。

[replicated_deduplication_window](#replicated_deduplication_window) と同様に、`replicated_deduplication_window_seconds` は、挿入の重複排除のためにハッシュサムをどのくらいの期間保存するかを指定します。`replicated_deduplication_window_seconds` より古いハッシュサムは ClickHouse Keeper から削除されます。

この時間は、最も最近のレコードの時刻に対するもので、壁の時間に対するものではありません。唯一のレコードであれば、永遠に保存されます。

## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

非同期挿入のハッシュサムが ClickHouse Keeper から削除されるまでの秒数。

可能な値：
- 任意の正の整数。

[replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts) と同様に、`replicated_deduplication_window_seconds_for_async_inserts` は、非同期挿入の重複排除のためにハッシュサムをどのくらいの期間保存するかを指定します。`replicated_deduplication_window_seconds_for_async_inserts` より古いハッシュサムは ClickHouse Keeper から削除されます。

この時間は、最も最近のレコードの時刻に対するもので、壁の時間に対するものではありません。唯一のレコードであれば、永遠に保存されます。

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
廃止された設定、何もしません。

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
廃止された設定、何もしません。

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
廃止された設定、何もしません。

## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

1つの MUTATE_PART エントリ内で一緒にマージされて実行できる最大のマテーションコマンドの数（0 は無制限を意味します）。

## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定、何もしません。

## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 
<SettingsInfoBlock type="UInt64" default_value="15" />
廃止された設定、何もしません。

## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定、何もしません。

## replicated_max_parallel_sends {#replicated_max_parallel_sends} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定、何もしません。

## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定、何もしません。

## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 
<SettingsInfoBlock type="Float" default_value="0.5" />

正しいパーツの比率がこの値未満の場合、開始を許可します。

可能な値：
- 浮動小数点、0.0 - 1.0

## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

ZooKeeper におけるレプリカごとの /metadata および /columns ノードの作成を有効にします。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 
<SettingsInfoBlock type="Bool" default_value="0" />

共有マージツリーのマージ割り当てを停止します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定"}]}]}/>

協調マージ戦略を有効にします。

## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "新しい設定"}]}]}/>

仮想パーツに属性を書き込み、キーパーでブロックをコミットすることを可能にします。

## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

古いパーツの確認を有効にします。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>

共有マージツリーの ZooKeeper ウォッチによってトリガーされていないパーツ更新の秒数です。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="50" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "新しい設定"}]}]}/>

パーツ更新の初期バックオフです。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "新しい設定"}]}]}/>

サーバー間の HTTP 接続のタイムアウトです。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

サーバー間の HTTP 通信のタイムアウトです。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

雷鳴の群れ効果を避けるために、shared_merge_tree_leader_update_period に 0 から x 秒までの均等に分布した値を追加します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 
<SettingsInfoBlock type="UInt64" default_value="30" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

パーツ更新のためのリーダーシップを再確認する最大期間です。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 
<SettingsInfoBlock type="UInt64" default_value="1000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

1 回の HTTP リクエストで削除の確認を試みる最大の古いパーツ数です。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "新しい設定"}]}]}/>

パーツ更新の最大バックオフです。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 
<SettingsInfoBlock type="UInt64" default_value="6" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

最大のパーツ更新リーダーの数です。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

可用性ゾーンごとの最大パーツ更新リーダー数です。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

パーツ削除に参加する最大レプリカ数（キラースレッド）。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 
<SettingsInfoBlock type="UInt64" default_value="5" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

各パーツレンジのためにパーツをマージしようとする最大レプリカ数（マージ割り当ての重複した衝突を回避することを可能にします）。0 は無効を意味します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT のための最大の壊れたパーツ、これを超えると自動的な分離を拒否します"}]}]}/>

SMT のための最大の壊れたパーツ、これを超えると自動的な分離を拒否します。


## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMTのすべての壊れたパーツの最大サイズ。これを超えると、自動的に切り離すことはできません。"}]}]}/>

SMTのすべての壊れたパーツの最大サイズ。これを超えると、自動的に切り離すことはできません。
## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 
<SettingsInfoBlock type="Int64" default_value="1800" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "クラウド同期"}]}]}/>

挿入リトライ中の不正なアクションを避けるために、挿入メモ化IDをどのくらいの期間保存するか。ClickHouse Cloudでのみ利用可能
## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "新しい設定"}]}]}/>

マージコーディネーター選挙スレッドの実行間隔
## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "2"},{"label": "新しい設定"}]}]}/>

コーディネータースレッドの遅延のための時間変更係数
## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "新しい設定"}]}]}/>

マージコーディネーターが新しいメタデータを取得するためにZooKeeperと同期する頻度
## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="20" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "新しい設定"}]}]}/>

コーディネーターが一度にMergerMutatorに要求できるマージの数
## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "新しい設定"}]}]}/>

マージコーディネータースレッドの実行間隔の最大時間
## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "新しい設定"}]}]}/>

コーディネーターが準備し、ワーカーに分配すべきマージエントリの数
## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新しい設定"}]}]}/>

マージコーディネータースレッドの実行間隔の最小時間
## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "新しい設定"}]}]}/>

マージワーカースレッドが即時アクションの後に状態を更新する必要がある場合に使用するタイムアウト
## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "新しい設定"}]}]}/>

マージワーカースレッドの実行間隔
## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 
<SettingsInfoBlock type="Float" default_value="0.5" />

`<candidate partitions for mutations only (partitions that cannot be merged)>/<candidate partitions for mutations>`の比率がこの設定を超えた場合に、マージ/ミューテート選択タスクでマージ述語を再ロードします。ClickHouse Cloudでのみ利用可能
## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 
<SettingsInfoBlock type="UInt64" default_value="32" />

一度にスケジュールするフェッチパーツメタデータジョブの数。ClickHouse Cloudでのみ利用可能
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "クラウド同期"}]}]}/>

このパーツを含む新しいマージを開始することなく、ローカルでマージされたパーツを保持する時間。 他のレプリカにこのパーツを取得し、このマージを開始する機会を与えます。ClickHouse Cloudでのみ利用可能。
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 
<SettingsInfoBlock type="UInt64" default_value="1000000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "クラウド同期"}]}]}/>

ローカルでマージされた後に次のマージを割り当てることを延期するためのパーツの最小サイズ（行数）。ClickHouse Cloudでのみ利用可能。
## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "クラウド同期"}]}]}/>

このパーツを含む新しいマージを開始することなく、ローカルでマージされたパーツを保持する時間。 他のレプリカにこのパーツを取得し、このマージを開始する機会を与えます。ClickHouse Cloudでのみ利用可能
## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "クラウド同期"}]}]}/>

可能な限りリーダーからバーチャルパーツを読み取ります。ClickHouse Cloudでのみ利用可能
## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "他のレプリカからパーツデータを取得するための新しい設定"}]}]}/>

有効にすると、すべてのレプリカは、既に存在している他のレプリカから部分メモリデータ（主キー、パーティション情報など）を取得しようとします。
## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "クラウド同期"}]}]}/>

他のレプリカのメモリキャッシュからFSキャッシュヒントを要求することを可能にします。ClickHouse Cloudでのみ利用可能
## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "クラウド同期"}]}]}/>

時代遅れのパーツ用にコンパクト形式を使用します：Keeperへの負荷を軽減し、時代遅れのパーツ処理を改善します。ClickHouse Cloudでのみ利用可能
## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "クラウド同期"}]}]}/>

有効にすると、あまりにも多くのパーツカウンターは、ローカルレプリカの状態ではなく、Keeperの共有データに依存します。ClickHouse Cloudでのみ利用可能
## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 
<SettingsInfoBlock type="UInt64" default_value="0" />

古いパーツがたくさんある場合、クリーンアップスレッドは1回のイテレーション中に`simultaneous_parts_removal_limit`パーツを削除しようとします。
`simultaneous_parts_removal_limit`を`0`に設定すると、制限なしを意味します。
## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

テスト用。変更しないでください。
## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />

テスト用。変更しないでください。
## storage_policy {#storage_policy} 
<SettingsInfoBlock type="String" default_value="default" />

ストレージディスクポリシーの名前
## table_disk {#table_disk} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新しい設定"}]}]}/>

これはテーブルディスクであり、パス/エンドポイントはデータベースデータではなくテーブルデータを指す必要があります。s3_plain/s3_plain_rewritable/webに対してのみ設定できます。
## temporary_directories_lifetime {#temporary_directories_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />

tmp_-ディレクトリを保持する秒数。この値を下げるべきではありません。なぜなら、マージやミューテーションがこの設定の低い値で機能できなくなる可能性があるからです。
## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 
<SettingsInfoBlock type="Seconds" default_value="7200" />

マージを開始する前のタイムアウト（秒）。この時間中、ClickHouseはリコンプレッションを必要とするこのマージに割り当てられたレプリカからリコンプレッションされたパーツを取得しようとします。

ほとんどの場合、リコンプレッションは遅いため、このタイムアウトまでリコンプレッションでマージを開始せず、リコンプレッションのためにこのマージに割り当てられたレプリカからリコンプレッションされたパーツの取得を試みます。

可能な値：
- 任意の正の整数。
## ttl_only_drop_parts {#ttl_only_drop_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

すべての行がその`TTL`設定に従って期限切れになったときに、MergeTreeテーブル内でデータパーツが完全に削除されるかどうかを制御します。

`ttl_only_drop_parts`が無効になっている場合（デフォルト）、`TTL`設定に基づいて期限切れになった行のみが削除されます。

`ttl_only_drop_parts`が有効になっている場合、すべての行がその`TTL`設定に従って期限切れになった場合に、パーツ全体が削除されます。
## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 
<SettingsInfoBlock type="Bool" default_value="1" />

メモリ使用量を削減するために、動的サブカラムの書き込み中に適応型ライターバッファを使用することを許可します。
## use_async_block_ids_cache {#use_async_block_ids_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />

真の場合、非同期挿入のハッシュチェックサムをキャッシュします。

可能な値：
- `true`
- `false`

複数の非同期挿入を保持するブロックは、複数のハッシュチェックサムを生成します。
挿入の一部が重複している場合、KeeperはRPC内で一つの重複したハッシュチェックサムのみを返し、これにより不必要なRPCリトライが発生します。
このキャッシュは、Keeper内のハッシュチェックサムパスを監視します。Keeperで更新が監視されると、キャッシュは可能な限り早く更新され、メモリ内の重複した挿入をフィルタリングできるようになります。
## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 
<SettingsInfoBlock type="Bool" default_value="1" />

Variantデータ型の識別子のバイナリシリアリゼーションのためのコンパクトモードを有効にします。
このモードにより、主に1つのバリアントまたは多くのNULL値が存在する場合、パーツ内の識別子を格納するために必要なメモリが大幅に削減されます。
## use_const_adaptive_granularity {#use_const_adaptive_granularity} 
<SettingsInfoBlock type="Bool" default_value="0" />

すべてのパーツで一定の粒度を使用します。これにより、インデックス粒度の値をメモリに圧縮できます。これは、非常に大きなワークロードの薄いテーブルで役立つことがあります。
## use_metadata_cache {#use_metadata_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
廃止された設定で、何も機能しません。
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

部分のチェックサムに小さな形式（数十バイト）を使用します。従来のもの（数十KB）の代わりに。すべてのレプリカが新しい形式をサポートしているかどうかを有効にする前に確認してください。
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper内のデータパーツヘッダーのストレージ方法。これを有効にすると、ZooKeeperがデータを少なく保存します。詳細については、[こちら](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)を参照してください。
## use_primary_key_cache {#use_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

すべてのインデックスをメモリに保存する代わりに、主インデックス用のキャッシュを使用します。非常に大きなテーブルに役立つことがあります。
## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="0" />

垂直マージアルゴリズムを有効にするためにマージする部分の最小（おおよその）未圧縮サイズ（バイト）。
## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="11" />

垂直マージアルゴリズムを有効にするための非PKカラムの最小数。
## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="131072" />

垂直マージアルゴリズムを有効にするためにマージする部分内の最小（おおよその）行数の合計。
## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 
<SettingsInfoBlock type="Bool" default_value="1" />

真の場合、マージ中にリモートファイルシステムから次のカラムのデータを事前取得するために使用されます。
## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

シャットダウンの前に、他のレプリカによって取得される必要があるユニークパーツ（現在のレプリカにのみ存在する）に必要な時間を待ちます（0は無効を意味します）。
## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="104857600" />
廃止された設定で、何も機能しません。
## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="100" />
廃止された設定で、何も機能しません。
## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
廃止された設定で、何も機能しません。
## write_final_mark {#write_final_mark} 
<SettingsInfoBlock type="Bool" default_value="1" />
廃止された設定で、何も機能しません。
## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定"}]}]}/>

コンパクトパーツ内の各サブストリームごとにマークを記録することを可能にします。これにより、データ部分から個々のサブカラムを効率的に読み取ることができます。
## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 
<SettingsInfoBlock type="Float" default_value="0.05" />

より小さい独立した範囲を取得するために削除を延期するトップレベルパーツの最大割合。変更しないことを推奨します。
## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 
<SettingsInfoBlock type="UInt64" default_value="5" />

独立した古いパーツ範囲を小さなサブレンジに分割するための最大再帰深度。変更しないことを推奨します。
## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

ゼロコピー複製が有効な場合、マージまたはミューテーションのためにロックを取得しようとする前にパーツサイズに応じてランダムな時間スリープします。
## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "新しい設定"}]}]}/>

ゼロコピー複製が有効な場合、マージまたはミューテーション用のロックを取得する前に最大500msのランダムな時間スリープします。
## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeperセッションの有効期限の確認期間（秒）。

可能な値：
- 任意の正の整数。
