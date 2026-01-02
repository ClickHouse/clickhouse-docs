---
description: '`system.merge_tree_settings` に含まれる MergeTree の設定'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree テーブルの設定'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

システムテーブル `system.merge_tree_settings` には、グローバルに設定されている MergeTree の設定が表示されます。

MergeTree の設定は、サーバー設定ファイルの `merge_tree` セクションで設定するか、`CREATE TABLE` 文の `SETTINGS` 句で個々の `MergeTree` テーブルごとに指定できます。

設定 `max_suspicious_broken_parts` をカスタマイズする例:

すべての `MergeTree` テーブルに対するデフォルト値をサーバー設定ファイルで設定します:

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

特定のテーブル用の設定:

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

特定のテーブルの設定は `ALTER TABLE ... MODIFY SETTING` を使用して変更します。

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- reset to global default (value from system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```

## MergeTree の設定 {#mergetree-settings}

{/* 以下の設定は、次のスクリプトによって自動生成されたものです
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }

## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16384" />

アダプティブ書き込みバッファの初期サイズ

## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合は、CollapsingMergeTree または VersionedCollapsingMergeTree テーブルの `sign` カラムに対して暗黙の制約を追加し、有効な値（`1` と `-1`）のみを許可します。

## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

有効にすると、テーブル内のすべての数値カラムに min-max（スキップ）索引が追加されます。

## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

有効にすると、テーブル内のすべての文字列カラムに対して、min-max（スキップ）型の索引が追加されます。

## allow_coalescing_columns_in_partition_or_order_key {#allow_coalescing_columns_in_partition_or_order_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "パーティションキーまたはソートキーで coalescing カラムを使用できるようにする新しい設定。"}]}]}/>

有効にすると、CoalescingMergeTree テーブル内の coalescing カラムをパーティションキーまたはソートキーとして使用できるようになります。

## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

`is_deleted` カラムを持つ ReplacingMergeTree に対して、実験的な CLEANUP マージを許可します。有効にすると、`OPTIMIZE ... FINAL CLEANUP` を使用して、パーティション内のすべてのパーツを 1 つのパーツに手動でマージし、削除済みの行をすべて削除できるようになります。

また、`min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only`、`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` の各設定により、バックグラウンドでこの種のマージを自動的に実行できるようにもなります。

## allow&#95;experimental&#95;reverse&#95;key {#allow_experimental_reverse_key}

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

MergeTree のソートキーにおいて降順の並び順をサポートします。
この設定は、時系列分析や Top-N クエリで特に有用であり、クエリ性能を最適化するためにデータを逆時系列で保存できるようにします。

`allow_experimental_reverse_key` を有効にすると、MergeTree テーブルの `ORDER BY` 句の中で降順の並び順を定義できます。これにより、降順のクエリに対して `ReadInReverseOrder` ではなく、より効率的な `ReadInOrder` 最適化を利用できるようになります。

**例**

```sql
CREATE TABLE example
(
time DateTime,
key Int32,
value String
) ENGINE = MergeTree
ORDER BY (time DESC, key)  -- Descending order on 'time' field
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

クエリに `ORDER BY time DESC` を指定すると、`ReadInOrder` が適用されます。

**デフォルト値:** false

## allow_floating_point_partition_key {#allow_floating_point_partition_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

パーティションキーとして浮動小数点数を使用できるようにします。

取り得る値:

- `0` — 浮動小数点のパーティションキーは許可されません。
- `1` — 浮動小数点のパーティションキーは許可されます。

## allow_nullable_key {#allow_nullable_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

Nullable 型を主キーとして許可します。

## allow_part_offset_column_in_projections {#allow_part_offset_column_in_projections} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "プロジェクションで _part_offset カラムを使用できるようになりました。"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定です。安定するまで、親パーツの _part_offset カラムを使用するプロジェクションの作成を防ぎます。"}]}]}/>

プロジェクションに対する SELECT クエリで '_part_offset' カラムの使用を許可します。

## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "現在 SMT は既定で ZooKeeper から古いブロッキングパーツを削除します"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同期"}]}]}/>

共有 MergeTree テーブルのブロッキングパーツを減らすバックグラウンドタスクです。
ClickHouse Cloud でのみ利用可能です。

## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

この設定はまだ安定していないため、本番環境では使用しないでください。

## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "SummingMergeTree テーブルの集計カラムをパーティションキーまたはソートキーに使用可能にする新しい設定"}]}]}/>

有効にすると、SummingMergeTree テーブル内の集計カラムをパーティションキーまたはソートキーとして使用できるようになります。

## allow_suspicious_indices {#allow_suspicious_indices} 

<SettingsInfoBlock type="Bool" default_value="0" />

同一の式を持つプライマリ／セカンダリ索引およびソートキーを拒否します。

## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

コンパクトパーツからワイドパーツへの垂直マージを許可します。この設定は、すべてのレプリカで同じ値にする必要があります。

## alter_column_secondary_index_mode {#alter_column_secondary_index_mode} 

<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "Change the behaviour to allow ALTER `column` when they have dependent secondary indices"}]}]}/>

セカンダリ索引でカバーされているカラムを変更する `ALTER` コマンドを許可するかどうかと、許可する場合にどのような処理を行うかを設定します。デフォルトでは、そのような `ALTER` コマンドは許可され、索引は再構築されます。

可能な値:

- `rebuild` (default): `ALTER` コマンド内のカラムの影響を受けるすべてのセカンダリ索引を再構築します。
- `throw`: セカンダリ索引に含まれるカラムに対するあらゆる `ALTER` を、例外をスローして禁止します。
- `drop`: 依存するセカンダリ索引を削除します。新しいパーツにはその索引が含まれなくなり、再作成するには `MATERIALIZE INDEX` が必要です。
- `compatibility`: もとの動作に合わせます: `ALTER ... MODIFY COLUMN` では `throw`、`ALTER ... UPDATE/DELETE` では `rebuild` になります。
- `ignore`: 上級者向けです。索引を不整合な状態のままにし、不正確なクエリ結果が返される可能性があります。

## always_fetch_merged_part {#always_fetch_merged_part} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、このレプリカはパーツをマージせず、常に他のレプリカから
マージ済みパーツをダウンロードします。

設定可能な値:

- true, false

## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 

<SettingsInfoBlock type="Bool" default_value="0" />

mutations/replaces/detaches などの処理中に、ハードリンクの作成ではなく常にデータをコピーするようにします。

## apply_patches_on_merge {#apply_patches_on_merge} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

true に設定すると、マージ時にパッチパーツが適用されます

## assign_part_uuids {#assign_part_uuids} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、新しく作成される各パーツに一意の識別子が割り当てられます。
有効化する前に、すべてのレプリカが UUID バージョン 4 をサポートしていることを確認してください。

## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="100" />

各 insert イテレーションが async_block_ids_cache の更新完了を待機する時間

## async_insert {#async_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、INSERT クエリによるデータはキューに格納され、その後バックグラウンドでテーブルへフラッシュされます。

## auto_statistics_types {#auto_statistics_types} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新しい設定"}]}]}/>

適切なすべてのカラムに対して自動的に計算する統計タイプを、カンマ区切りで指定したリスト。
サポートされている統計タイプ: tdigest, countmin, minmax, uniq。

## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

マージまたはミューテーションの 1 ステップを実行するための目標時間（ミリ秒単位）。  
1 ステップの処理にそれ以上の時間がかかる場合は、この目標時間を超過することがあります。

## cache_populated_by_fetch {#cache_populated_by_fetch} 

<SettingsInfoBlock type="Bool" default_value="0" />

:::note
この設定は ClickHouse Cloud にのみ適用されます。
:::

`cache_populated_by_fetch` が無効（デフォルト設定）の場合、新しいデータパーツは、
それらのパーツを必要とするクエリが実行されたときにのみファイルシステムキャッシュに
読み込まれます。

有効にすると、`cache_populated_by_fetch` により、クエリによるトリガーを必要とせずに、
すべてのノードがストレージから新しいデータパーツを各ノードのファイルシステムキャッシュに
読み込むようになります。

**関連項目**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)

## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "New setting"}]}]}/>

:::note
この設定は ClickHouse Cloud にのみ適用されます。
:::

空でない場合は、`cache_populated_by_fetch` が有効なときに、フェッチ後この正規表現に一致するファイルのみがキャッシュに事前読み込みされます。

## check_delay_period {#check_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="60" />

これは廃止された設定で、何の効果もありません。

## check_sample_column_is_correct {#check_sample_column_is_correct} 

<SettingsInfoBlock type="Bool" default_value="1" />

テーブル作成時に、サンプリング用のカラムまたはサンプリング式で使用するカラムのデータ型が正しいかどうかをチェックします。データ型は符号なしの
[整数型](/sql-reference/data-types/int-uint) のいずれかである必要があります: `UInt8`, `UInt16`,
`UInt32`, `UInt64`。

可能な値:

- `true`  — チェックを有効にします。
- `false` — テーブル作成時のチェックを無効にします。

デフォルト値: `true`。

デフォルトでは、ClickHouse サーバーはテーブル作成時にサンプリング用のカラム、またはサンプリング式用のカラムのデータ型をチェックします。すでにサンプリング式が正しくないテーブルが存在しており、サーバーの起動時に例外を発生させたくない場合は、`check_sample_column_is_correct` を `false` に設定します。

## clean_deleted_rows {#clean_deleted_rows} 

<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />

この設定は廃止されており、何も行いません。

## cleanup_delay_period {#cleanup_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="30" />

古いキューのログ、ブロックのハッシュ、およびパーツをクリーンアップするための最小間隔。

## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

`cleanup_delay_period` に 0 から x 秒までの一様分布に従う値を加算し、
テーブル数が非常に多い場合に発生し得る thundering herd 問題と、それに続く ZooKeeper への DoS を回避します。

## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 

<SettingsInfoBlock type="UInt64" default_value="150" />

バックグラウンドのクリーンアップ処理における推奨バッチサイズ（ポイントは抽象的な単位ですが、1 ポイントはおおよそ挿入ブロック 1 個に相当します）。

## cleanup_threads {#cleanup_threads} 

<SettingsInfoBlock type="UInt64" default_value="128" />

廃止された設定であり、現在は何の効果もありません。

## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "カラムおよびセカンダリインデックスのサイズを初回リクエスト時に遅延計算する新しい設定"}]}]}/>

テーブルの初期化時ではなく、最初のリクエスト時にカラムおよびセカンダリインデックスのサイズを遅延計算します。

## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 

（有効な場合の）マークキャッシュを事前ウォームしておくカラムのリスト。空の場合はすべてのカラムが対象になります。

## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />

ClickHouse Cloud でのみ利用可能です。コンパクトパーツにおいて、1つのストライプに書き込む最大バイト数。

## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="128" />

ClickHouse Cloud でのみ利用可能です。コンパクトパーツで単一ストライプに書き込めるグラニュールの最大数です。

## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

ClickHouse Cloud でのみ利用可能です。マージ中に compact パーツ全体をメモリに読み込む際の、パーツの最大サイズを指定します。

## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

サンプリング式が PRIMARY KEY に含まれていないテーブルの作成を許可します。これは、後方互換性のために不正な定義のテーブルを一時的に許可してサーバーを稼働させる必要がある場合にのみ使用します。

## compress_marks {#compress_marks} 

<SettingsInfoBlock type="Bool" default_value="1" />

マークの圧縮をサポートし、マークファイルのサイズを削減してネットワーク転送を高速化します。

## compress_primary_key {#compress_primary_key} 

<SettingsInfoBlock type="Bool" default_value="1" />

主キーを圧縮し、主キーファイルのサイズを削減してネットワーク転送を高速化します。

## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100" />

非アクティブなデータパーツの数が少なくともこの値以上の場合にのみ、
（'max_part_removal_threads' を参照）パーツの同時削除を有効にします。

## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 

<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "一貫性のないプロジェクションの作成を許可しない"}]}]}/>

非クラシックな MergeTree、すなわち (Replicated, Shared) MergeTree を使用するテーブルに対して、
プロジェクションの作成を許可するかどうかを制御します。`ignore` オプションは後方互換性のためだけに存在し、
誤った結果を招く可能性があります。許可されている場合には、
マージ時にプロジェクションに対してどのアクションを取るか (drop するか rebuild するか) を指定します。
クラシックな MergeTree はこの設定を無視します。
この設定は `OPTIMIZE DEDUPLICATE` も制御しますが、すべての MergeTree ファミリーのエンジンに対して有効です。
オプション `lightweight_mutation_projection_mode` と同様に、これはパーツレベルの設定です。

設定可能な値:

- `ignore`
- `throw`
- `drop`
- `rebuild`

## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "新しい設定"}]}]}/>

テーブル定義内で特定のカラムに対して圧縮コーデックが定義されていない場合に使用される、デフォルトの圧縮コーデックを指定します。
カラムに対する圧縮コーデックの選択優先順位:

1. テーブル定義内でそのカラムに対して定義された圧縮コーデック
2. `default_compression_codec`（この設定）で定義された圧縮コーデック
3. `compression` 設定で定義されたデフォルトの圧縮コーデック  

デフォルト値: 空文字列（未定義）。

## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

マージまたはミューテーション後に、他のレプリカ上のデータパーツとバイト単位で同一でない場合、そのレプリカ上のデータパーツをデタッチするかどうかを制御します。無効の場合、そのデータパーツは削除されます。このようなパーツを後で分析したい場合は、この設定を有効にしてください。

この設定は、[データのレプリケーション](/engines/table-engines/mergetree-family/replacingmergetree) が有効になっている `MergeTree` テーブルに適用されます。

取り得る値:

- `0` — パーツは削除されます。
- `1` — パーツはデタッチされます。

## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 

<SettingsInfoBlock type="Bool" default_value="1" />

失われたレプリカを修復する際に、古いローカルパーツを削除しないようにします。

取りうる値:

- `true`
- `false`

## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピー レプリケーションでの `DETACH PARTITION` クエリを無効化します。

## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピー レプリケーション用の FETCH PARTITION クエリを無効化します。

## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピー レプリケーション用の FREEZE PARTITION クエリを無効にします。

## disk {#disk} 

ストレージディスクの名前です。storage policy の代わりに指定できます。

## dynamic_serialization_version {#dynamic_serialization_version} 

<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Dynamic データ型のシリアル化バージョンを制御する設定を追加"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "Dynamic データ型に対して v3 シリアル化バージョンをデフォルトで有効化し、シリアル化/デシリアル化を改善"}]}]}/>

Dynamic データ型のシリアル化バージョン。互換性のために必要です。

設定可能な値:

- `v1`
- `v2`
- `v3`

## enable_block_number_column {#enable_block_number_column} 

<SettingsInfoBlock type="Bool" default_value="0" />

各行の _block_number カラムを永続的に保存します。

## enable_block_offset_column {#enable_block_offset_column} 

<SettingsInfoBlock type="Bool" default_value="0" />

マージ時に仮想カラム `_block_number` を永続化します。

## enable_index_granularity_compression {#enable_index_granularity_compression} 

<SettingsInfoBlock type="Bool" default_value="1" />

可能な場合は、メモリ上の索引粒度の値を圧縮します。

## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "min_age_to_force_merge 用の最大バイト数を制限する新しい設定を追加。"}]}]}/>

`min_age_to_force_merge_seconds` と
`min_age_to_force_merge_on_partition_only` の両設定が、
`max_bytes_to_merge_at_max_space_in_pool` の設定に従うかどうかを制御します。

設定可能な値:

- `true`
- `false`

## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

`index_granularity_bytes` 設定を使用してグラニュールのサイズを制御する方式への移行を有効または無効にします。バージョン 19.11 以前は、グラニュールサイズを制限するための `index_granularity` 設定しかありませんでした。
`index_granularity_bytes` 設定は、大きな行（数十〜数百メガバイト）を持つテーブルからデータを選択する際に ClickHouse のパフォーマンスを向上させます。
大きな行を持つテーブルがある場合は、そのテーブルに対してこの設定を有効にすることで、`SELECT` クエリの効率を高めることができます。

## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "ReplacingMergeTree に対して自動 CLEANUP マージを許可する新しい設定"}]}]}/>

パーティションを 1 つのパーツにマージする際に、ReplacingMergeTree に対して CLEANUP マージを使用するかどうかを制御します。`allow_experimental_replacing_merge_with_cleanup`、
`min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only`
が有効になっている必要があります。

可能な値:

- `true`
- `false`

## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケーテッド MergeTree テーブルで、`zookeeper` 名をプレフィックスとする endpoint id を有効にします。

## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Vertical マージアルゴリズムを有効化します。

## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

パーティション操作クエリ（`ATTACH/MOVE/REPLACE PARTITION`）で指定される宛先テーブルに対してこの設定が有効になっている場合、ソーステーブルと宛先テーブルの索引およびプロジェクションは完全に一致している必要があります。そうでない場合、宛先テーブルはソーステーブルの索引およびプロジェクションの上位集合を持つことができます。

## escape_variant_subcolumn_filenames {#escape_variant_subcolumn_filenames} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Wide パーツ内の Variant 型サブカラム用に作成されるファイル名に含まれる特殊記号をエスケープ"}]}]}/>

MergeTree テーブルの Wide パーツにおいて、Variant データ型のサブカラム用に作成されるファイル名に含まれる特殊記号をエスケープします。互換性を保つために必要です。

## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、パーツの推定実データサイズ（つまり、`DELETE FROM` によって削除された行を除外したサイズ）がマージ対象パーツの選択時に使用されます。この挙動は、この設定を有効化した後に実行された `DELETE FROM` の影響を受けたデータパーツに対してのみ有効である点に注意してください。

取りうる値:

- `true`
- `false`

**関連項目**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts) 設定

## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;merge {#exclude_materialize_skip_indexes_on_merge}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新しい設定。"}]}]} />

カンマ区切りで指定された skip インデックスのリストを、マージ時に構築および保存の対象から除外します。
[materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge) が false の場合は効果がありません。

除外された skip インデックスであっても、明示的な
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) クエリ、または
[materialize&#95;skip&#95;indexes&#95;on&#95;insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)
セッション設定に応じて INSERT 時に構築および保存されます。

例：

```sql
CREATE TABLE tab
(
a UInt64,
b UInt64,
INDEX idx_a a TYPE minmax,
INDEX idx_b b TYPE set(3)
)
ENGINE = MergeTree ORDER BY tuple() SETTINGS exclude_materialize_skip_indexes_on_merge = 'idx_a';

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- setting has no effect on INSERTs

-- idx_a will be excluded from update during background or explicit merge via OPTIMIZE TABLE FINAL

-- can exclude multiple indexes by providing a list
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- default setting, no indexes excluded from being updated during merge
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```

## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold} 

<SettingsInfoBlock type="Seconds" default_value="0" />

この設定値が 0 より大きい場合、1 つのレプリカのみが直ちにマージを開始し、他のレプリカはローカルでマージを実行する代わりに、その時間の間、マージ結果をダウンロードできるようになるまで待機します。選択されたレプリカがその時間内にマージを完了しない場合は、標準的な動作にフォールバックします。

設定可能な値:

- 任意の正の整数。

## fault_probability_after_part_commit {#fault_probability_after_part_commit} 

<SettingsInfoBlock type="Float" default_value="0" />

テスト目的の設定です。変更しないでください。

## fault_probability_before_part_commit {#fault_probability_before_part_commit} 

<SettingsInfoBlock type="Float" default_value="0" />

テスト用です。変更しないでください。

## finished_mutations_to_keep {#finished_mutations_to_keep} 

<SettingsInfoBlock type="UInt64" default_value="100" />

完了したミューテーションのレコードを何件保持するかを指定します。0 の場合は、すべてのレコードを保持します。

## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

マージ時にファイルシステムキャッシュを経由した読み取りを強制する

## fsync_after_insert {#fsync_after_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

挿入で生成される各パーツごとに fsync を実行します。挿入性能が大きく低下するため、ワイドなパーツとの併用は推奨されません。

## fsync_part_directory {#fsync_part_directory} 

<SettingsInfoBlock type="Bool" default_value="0" />

すべてのパートに対する操作（書き込み、リネームなど）が完了した後に、パートディレクトリに対して fsync を実行します。

## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 

<SettingsInfoBlock type="Bool" default_value="1" />

廃止された設定であり、現在は何の効果もありません。

## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 

<SettingsInfoBlock type="Bool" default_value="0" />

これは廃止された設定であり、現在は効果がありません。

## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブル内の単一のパーティションに存在する非アクティブなパーツの数が
`inactive_parts_to_delay_insert` の値を超えた場合、`INSERT` 処理は意図的に
遅延されます。

:::tip
サーバーがパーツを十分な速さでクリーンアップできない場合の対策として有効です。
:::

取りうる値:

- 任意の正の整数。

## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 つのパーティション内の非アクティブなパーツの数が
`inactive_parts_to_throw_insert` の値を超えると、`INSERT` は次のエラーで中断されます。

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts" という例外が発生します。

設定可能な値:

- 任意の正の整数。

## index_granularity {#index_granularity} 

<SettingsInfoBlock type="UInt64" default_value="8192" />

インデックスのマーク間のデータ行数の最大値です。つまり、1 つのプライマリキー値に対応する行数です。

## index_granularity_bytes {#index_granularity_bytes} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

データグラニュールの最大サイズ（バイト単位）。

グラニュールのサイズを行数だけで制限するには、`0` に設定します（非推奨）。

## initialization_retry_period {#initialization_retry_period} 

<SettingsInfoBlock type="Seconds" default_value="60" />

テーブル初期化の再試行間隔（秒単位）。

## kill_delay_period {#kill_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="30" />

この設定は廃止されており、何の効果もありません。

## kill_delay_period_random_add {#kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

廃止された設定であり、現在は何の効果もありません。

## kill_threads {#kill_threads} 

<SettingsInfoBlock type="UInt64" default_value="128" />

廃止された設定で、現在は何の効果もありません。

## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 

<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

デフォルトでは、論理削除 `DELETE` は PROJECTION を持つテーブルでは動作しません。これは、PROJECTION 内の行が `DELETE` 操作の影響を受ける可能性があるためです。そのため、デフォルト値は `throw` です。ただし、このオプションで挙動を変更できます。値を `drop` または `rebuild` にすると、削除は PROJECTION を持つテーブルでも動作します。`drop` は PROJECTION 自体を削除するため、現在のクエリでは PROJECTION が削除されるぶん高速になる可能性がありますが、将来のクエリでは PROJECTION が存在しないため遅くなる可能性があります。`rebuild` は PROJECTION を再構築するため、現在のクエリのパフォーマンスには影響する可能性がありますが、将来のクエリは高速化される可能性があります。ここで重要なのは、これらのオプションはパーツレベルでのみ動作する点です。つまり、影響を受けないパーツ内の PROJECTION は、drop や rebuild のようなアクションがトリガーされることなく、そのまま保持されます。

Possible values:

- `throw`
- `drop`
- `rebuild`

## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

[exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge)
と併せて有効にした場合、既存データパーツに対する削除済み行数が
テーブルの起動時に計算されます。テーブルのロードが遅くなる可能性がある点に注意してください。

可能な値:

- `true`
- `false`

**関連項目**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 設定

## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 

<SettingsInfoBlock type="Seconds" default_value="120" />

マージやミューテーションなどのバックグラウンド操作で、テーブルロックの取得失敗とみなすまでの待機時間（秒）。

## marks_compress_block_size {#marks_compress_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

マーク圧縮ブロックサイズ。圧縮対象となるブロックの実際のサイズです。

## marks_compression_codec {#marks_compression_codec} 

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

marks に使用される圧縮コーデックです。marks はサイズが小さくキャッシュされるため、
デフォルトでは ZSTD(3) による圧縮が使用されます。

## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "新しい設定"}]}]}/>

有効な場合、マージ時に新しいパーツに対してスキップ索引を構築および保存します。
無効な場合、明示的に [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
または [INSERT 時](/operations/settings/settings.md/#materialize_skip_indexes_on_insert) に作成および保存できます。

よりきめ細かい制御が必要な場合は、[exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) も参照してください。

## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 

<SettingsInfoBlock type="Bool" default_value="0" />

MATERIALIZE TTL 実行時にのみ TTL 情報を再計算します

## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

`parts_to_delay_insert` と `parts_to_throw_insert` に基づく「too many parts」チェックは、（該当するパーティション内の）平均パーツサイズが指定されたしきい値を超えない場合にのみ有効になります。平均パーツサイズが指定されたしきい値より大きい場合、INSERT は遅延も拒否もされません。これは、パーツが正常にマージされてより大きなパーツになっていれば、単一のサーバー上の単一テーブルに数百テラバイト規模のデータを保持できることを意味します。この設定は、非アクティブなパーツやパーツ総数に対するしきい値には影響しません。

## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 

<SettingsInfoBlock type="UInt64" default_value="161061273600" />

利用可能なリソースが十分にある場合に、1つのパーツにマージされるパーツの合計サイズ（バイト単位）の上限です。自動バックグラウンドマージによって作成されうるパーツサイズのおおよその最大値に相当します。（0 はマージが無効化されることを意味します）

取り得る値:

- 任意の非負の整数。

マージスケジューラは、定期的にパーティション内のパーツのサイズと数を分析し、プール内に十分な空きリソースがある場合はバックグラウンドマージを開始します。ソースパーツの合計サイズが `max_bytes_to_merge_at_max_space_in_pool` を超えるまでマージが行われます。

[OPTIMIZE FINAL](/sql-reference/statements/optimize) によって開始されたマージは `max_bytes_to_merge_at_max_space_in_pool` を無視します（空きディスク容量のみが考慮されます）。

## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

バックグラウンドプール内で利用可能なリソースが最小限しかない場合に、1つのパーツにマージできる
パーツの合計サイズ（バイト単位）の最大値。

設定可能な値:

- 任意の正の整数。

`max_bytes_to_merge_at_min_space_in_pool` は、（プール内で）利用可能なディスク容量が不足している場合でも
マージできるパーツの合計サイズの上限を定義します。
これは、小さなパーツの数と `Too many parts` エラーの発生確率を減らすために必要です。
マージ処理では、マージ対象パーツ合計サイズの2倍のディスク容量を予約します。
そのため、空きディスク容量が少ない場合、空き容量自体は存在するものの、
その容量が進行中の大規模なマージによってすでに予約されていて他のマージが開始できず、
挿入のたびに小さなパーツの数が増加する状況が発生する可能性があります。

## max_cleanup_delay_period {#max_cleanup_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="300" />

古いキューログ、ブロックハッシュ、およびパーツをクリーンアップするための最大期間。

## max_compress_block_size {#max_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルへの書き込み時に、圧縮を行う前の非圧縮データブロックの最大サイズです。この設定はグローバル設定でも指定できます
（[max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)
設定を参照）。テーブル作成時に指定した値は、この設定に対するグローバル値を上書きします。

## max&#95;concurrent&#95;queries {#max_concurrent_queries}

<SettingsInfoBlock type="UInt64" default_value="0" />

MergeTree テーブルに関連して同時に実行されるクエリの最大数。
クエリは他の `max_concurrent_queries` 設定によっても引き続き制限されます。

設定可能な値:

* 正の整数。
* `0` — 無制限。

デフォルト値: `0`（無制限）。

**例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```

## max&#95;delay&#95;to&#95;insert {#max_delay_to_insert}

<SettingsInfoBlock type="UInt64" default_value="1" />

`INSERT` の遅延を計算するために使用される秒数の値です。単一のパーティション内のアクティブなパーツ数が
[parts&#95;to&#95;delay&#95;insert](#parts_to_delay_insert) の値を超えた場合に適用されます。

設定可能な値:

* 任意の正の整数。

`INSERT` の遅延（ミリ秒）は次の式で計算されます。

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

例えば、あるパーティションにアクティブなパーツが 299 個あり、parts&#95;to&#95;throw&#95;insert
= 300、parts&#95;to&#95;delay&#95;insert = 150、max&#95;delay&#95;to&#95;insert = 1 の場合、`INSERT` は
`pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
ミリ秒遅延します。

バージョン 23.1 から、式は次のように変更されました:

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

例えば、あるパーティションに 224 個のアクティブなパーツがあり、parts&#95;to&#95;throw&#95;insert
= 300、parts&#95;to&#95;delay&#95;insert = 150、max&#95;delay&#95;to&#95;insert = 1、
min&#95;delay&#95;to&#95;insert&#95;ms = 10 の場合、`INSERT` は `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` ミリ秒だけ遅延します。

## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

多数の未完了のmutationが存在する場合における、MergeTreeテーブルのmutationの最大遅延時間（ミリ秒単位）。

## max_digestion_size_per_segment {#max_digestion_size_per_segment} 

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "Obsolete setting"}]}]}/>

廃止されたSETTINGで、現在は何の効果もありません。

## max_file_name_length {#max_file_name_length} 

<SettingsInfoBlock type="UInt64" default_value="127" />

ハッシュ化せずにそのまま保持するファイル名の最大長。
この設定は、`replace_long_file_name_to_hash` が有効な場合にのみ効果があります。
この設定値にはファイル拡張子の長さは含まれません。そのため、
ファイルシステムのエラーを避けるために、ファイル名の最大長（通常 255 バイト）
よりも余裕を持たせた値に設定することを推奨します。

## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 

<SettingsInfoBlock type="UInt64" default_value="75" />

ファイルの変更（削除、追加）対象数がこの設定値より大きい場合、ALTER は適用されません。

取りうる値:

- 任意の正の整数。

デフォルト値: 75

## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 

<SettingsInfoBlock type="UInt64" default_value="50" />

削除対象となるファイル数がこの設定値を超える場合、ALTER を実行しません。

設定可能な値:

- 任意の正の整数。

## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>

並列でフラッシュされるストリーム（カラム）の最大数。
マージにおける max_insert_delayed_streams_for_parallel_write の類似設定です。Vertical マージでのみ有効です。

## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 

<SettingsInfoBlock type="UInt64" default_value="60000" />

パーツが選択されなかった後、再度マージ対象のパーツを選択しようとするまで待機する最大時間です。値を小さくすると、background_schedule_pool でのタスク選択が頻繁に実行されるようになり、大規模クラスター環境では ZooKeeper へのリクエストが大量に発生します。

## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 

<SettingsInfoBlock type="UInt64" default_value="2" />

プール内の有効期限 (TTL) を持つマージの数が指定値を超えている場合、新しい有効期限 (TTL) 付きマージを割り当てません。これは通常のマージ用のスレッドを確保し、エラー「Too many parts」を回避するためです。

## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 

<SettingsInfoBlock type="UInt64" default_value="0" />

各レプリカにおけるパーツの mutation 数を、指定した値に制限します。
0 の場合、レプリカあたりの mutation 数には制限がありません（ただし、実行は他の設定によって制約される可能性があります）。

## max_part_loading_threads {#max_part_loading_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

廃止された設定で、現在は効果がありません。

## max_part_removal_threads {#max_part_removal_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

廃止された設定であり、現在は何の効果もありません。

## max_partitions_to_read {#max_partitions_to_read} 

<SettingsInfoBlock type="Int64" default_value="-1" />

1つのクエリでアクセスできるパーティションの最大数を制限します。

テーブル作成時に指定した設定値は、
クエリレベルの設定で上書きすることができます。

可能な値:

- 任意の正の整数。

クエリの複雑さに関する設定 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read) を、
クエリ / セッション / プロファイル単位で指定することもできます。

## max_parts_in_total {#max_parts_in_total} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

あるテーブルのすべてのパーティションにおけるアクティブなパーツ数の合計が
`max_parts_in_total` の値を超えた場合、`Too many parts (N)` 例外が発生して
`INSERT` が中断されます。

設定可能な値:

- 任意の正の整数。

テーブル内のパーツ数が多いと ClickHouse クエリのパフォーマンスが低下し、
ClickHouse の起動時間が長くなります。多くの場合、これは誤った設計
（パーティション戦略の選択ミス、パーティションが小さすぎるなど）の結果です。

## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 

<SettingsInfoBlock type="UInt64" default_value="100" />

一度にマージできるパーツの最大数（0 の場合は無効）。  
OPTIMIZE FINALクエリには影響しません。

## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 

<SettingsInfoBlock type="UInt64" default_value="300000" />

失敗した mutation を再実行するまで延期する最大時間。

## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms} 

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "レプリケーションキュー内のフェッチタスクを延期可能にする新しい設定を追加しました。"}]}]}/>

失敗したレプリケーションのフェッチ処理を延期できる最大時間。

## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms} 

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "レプリケーションキュー内のマージタスクを延期できるようにする新しい設定を追加。"}]}]}/>

失敗したレプリケートマージを延期できる最大時間。

## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms} 

<SettingsInfoBlock type="UInt64" default_value="300000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "レプリケーションキュー内のタスクを延期できるようにする新しい設定を追加しました。"}]}]}/>

失敗したレプリケーションタスクに対する最大延期時間です。タスクが fetch、merge、mutation のいずれでもない場合にこの値が使用されます。

## max_projections {#max_projections} 

<SettingsInfoBlock type="UInt64" default_value="25" />

MergeTree テーブルに対する PROJECTION の最大数。

## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

[replicated](../../engines/table-engines/mergetree-family/replication.md)
フェッチに対して、ネットワーク上のデータ交換の最大速度を 1 秒あたりのバイト数で制限します。この設定は、サーバーに適用される
[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)
設定とは異なり、特定のテーブルに適用されます。

サーバー全体のネットワーク帯域と特定テーブル向けのネットワーク帯域の両方を制限できますが、その場合はテーブルレベルの設定値をサーバーレベルの値よりも小さくする必要があります。そうでない場合、サーバーは
`max_replicated_fetches_network_bandwidth_for_server` 設定のみを考慮します。

この設定は厳密に守られるわけではありません。

設定可能な値:

- 正の整数。
- `0` — 無制限。

デフォルト値: `0`。

**使用例**

新しいノードを追加または置き換えるためにデータをレプリケートする際、その速度を制限する目的で使用できます。

## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

非アクティブなレプリカが存在する場合に、ClickHouse Keeper のログ内に保持できるレコード数の上限を指定します。この値を超えると、非アクティブなレプリカは失われたものと見なされます。

Possible values:

- 正の整数。

## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

ReplicatedMergeTree のキュー内で、パーツのマージおよびミューテーションタスクを同時に実行できる最大数を指定します。

## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 

<SettingsInfoBlock type="UInt64" default_value="1" />

ReplicatedMergeTree のキュー内で、有効期限 (TTL) を伴うパーツのマージタスクを同時に許可する数を指定します。

## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 

<SettingsInfoBlock type="UInt64" default_value="8" />

ReplicatedMergeTree のキュー内で、パーツに対するミューテーションタスクを同時にいくつまで許可するかを指定します。

## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク経由でのデータ交換の最大速度を、[replicated](/engines/table-engines/mergetree-family/replacingmergetree) での送信について、1 秒あたりのバイト数で制限します。この設定はサーバーレベルではなく特定のテーブルに適用されます。サーバーレベルで適用される設定は
[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth)
です。

サーバー全体のネットワーク帯域と特定テーブルのネットワーク帯域の両方を制限することもできますが、その場合はテーブルレベルの設定値をサーバーレベルの値より小さくする必要があります。そうでない場合、サーバーは
`max_replicated_sends_network_bandwidth_for_server` の設定のみを考慮します。

この設定は厳密に守られるとは限りません。

設定可能な値:

- 正の整数。
- `0` — 無制限。

**使用例**

新しいノードを追加または置き換える際に、データのレプリケーション速度を制限する目的で使用できます。

## max_suspicious_broken_parts {#max_suspicious_broken_parts} 

<SettingsInfoBlock type="UInt64" default_value="100" />

1つのパーティション内の壊れたパーツの数が
`max_suspicious_broken_parts` の値を超えた場合、自動削除は行われません。

設定可能な値:

- 正の整数。

## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

すべての破損したパーツの合計サイズの上限です。この値を超えた場合、自動削除は行われません。

設定可能な値:

- 任意の正の整数。

## max_uncompressed_bytes_in_patches {#max_uncompressed_bytes_in_patches} 

<SettingsInfoBlock type="UInt64" default_value="32212254720" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "新しい設定"}]}]}/>

すべてのパッチパーツに含まれるデータの非圧縮時サイズの上限（バイト単位）です。
すべてのパッチパーツに含まれるデータ量がこの値を超えると、論理更新は拒否されます。
0 は無制限を意味します。

## merge_max_block_size {#merge_max_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

マージされたパーツからメモリに読み込まれる行数。

可能な値:

- 任意の正の整数。

マージ処理では、パーツから `merge_max_block_size` 行ずつブロック単位で行を読み込み、
それらをマージして結果を新しいパーツに書き込みます。読み込まれたブロックは RAM 上に配置されるため、
`merge_max_block_size` はマージに必要な RAM の量に影響します。
そのため、行の幅が非常に広いテーブルでは、マージが大量の RAM を消費する可能性があります
（平均行サイズが 100kb で、10 個のパーツをマージする場合、
(100kb * 10 * 8192) = 約 8GB の RAM が必要になります）。`merge_max_block_size` を小さくすると、
マージに必要な RAM 量を減らすことができますが、マージ処理は遅くなります。

## merge_max_block_size_bytes {#merge_max_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

マージ処理時に作成されるブロックのサイズ（バイト数）を指定します。デフォルト値は
`index_granularity_bytes` と同じです。

## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud でのみ利用可能です。マージ処理中にキャッシュをプリウォームする際の、コンパクトまたはパック形式のパーツの最大サイズです。

## merge_max_dynamic_subcolumns_in_wide_part {#merge_max_dynamic_subcolumns_in_wide_part} 

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "マージ後の Wide パートにおいて、データ型で指定されたパラメータに関係なく、動的サブカラムの数を制限するための新しい設定を追加。"}]}]}/>

マージ後の Wide データパート内で、各カラムに対して作成される動的サブカラムの最大数を指定します。
これにより、データ型で指定された動的パラメータに関係なく、Wide データパート内で作成されるファイル数を削減できます。

例えば、テーブルに JSON(max_dynamic_paths=1024) 型のカラムがあり、設定 merge_max_dynamic_subcolumns_in_wide_part が 128 に設定されている場合、
Wide データパートへのマージ後には、このパート内の動的パスの数は 128 に抑えられ、動的サブカラムとして書き込まれるパスも 128 個のみになります。

## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

パーツが選択されなかった場合に、再度マージ対象のパーツを選択しようとするまで待機する最小時間。設定値を小さくすると、background_schedule_pool でのタスク選択が頻繁にトリガーされ、大規模クラスタでは ZooKeeper へのリクエストが大量に発生します。

## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 

<SettingsInfoBlock type="Float" default_value="1.2" />

マージ選択タスクのスリープ時間は、マージ対象がない場合にはこの係数を掛け、マージが割り当てられた場合にはこの係数で割ります。

## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>

<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

マージに使用するパーツを選択するアルゴリズム

## merge_selector_base {#merge_selector_base} 

<SettingsInfoBlock type="Float" default_value="5" />

割り当てられたマージ処理における書き込み増幅に影響します（上級者向けの設定です。動作を理解していない場合は変更しないでください）。Simple および StochasticSimple マージセレクタで機能します。

## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 

<SettingsInfoBlock type="UInt64" default_value="0" />

パーティション内のパーツ数に応じて、このロジックがいつ適用されるかを制御します。係数が大きいほど、反応の開始はより遅くなります。

## merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once {#merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

シンプルなマージセレクタに対して、マージ選択時の上限値を引き下げるヒューリスティックを有効にします。
これにより同時に実行されるマージの数が増え、TOO_MANY_PARTS エラーの軽減に役立つ可能性がありますが、その一方で書き込み増幅も増加します。

## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 

<SettingsInfoBlock type="Bool" default_value="1" />

マージ対象のパーツを選択する際に、範囲の右側にあるパーツについて、そのサイズが合計サイズ `sum_size` に対する指定比率 (0.01) 未満の場合に、そのパーツをマージ対象から外すヒューリスティックを有効にします。
Simple および StochasticSimple マージセレクタで動作します。

## merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent {#merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "5"},{"label": "New setting"}]}]}/>

減少カーブを形成するために数式で使用される指数値を制御します。指数を小さくするとマージ幅が小さくなり、その結果、書き込み増幅が大きくなります。逆も同様です。

## merge_selector_window_size {#merge_selector_window_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

一度に対象とするパーツ数。

## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 

<SettingsInfoBlock type="UInt64" default_value="16106127360" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud でのみ利用可能。マージ処理中にキャッシュをプレウォームする際に対象となるパーツの合計最大サイズ（バイト単位）。

## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />

廃止された設定であり、現在は何の効果もありません。

## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 

<SettingsInfoBlock type="UInt64" default_value="1" />

古いパーツ、WAL、およびミューテーションのクリーンアップを ClickHouse が実行する間隔（秒）を設定します。

設定可能な値:

- 任意の正の整数。

## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 

<SettingsInfoBlock type="UInt64" default_value="60" />

ClickHouse が古い一時ディレクトリをクリーンアップする間隔（秒）を設定します。

設定可能な値:

- 任意の正の整数。

## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定は廃止されており、何も行いません。

## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 

<SettingsInfoBlock type="Int64" default_value="14400" />

再圧縮の有効期限 (TTL) を伴うマージを再度実行するまでの最小遅延時間（秒単位）。

## merge_with_ttl_timeout {#merge_with_ttl_timeout} 

<SettingsInfoBlock type="Int64" default_value="14400" />

削除の有効期限 (TTL) を含むマージ処理を再実行するまでの最小遅延（秒）。

## merge_workload {#merge_workload} 

マージ処理とその他のワークロード間でのリソースの利用および共有方法を制御するために使用します。指定した値は、このテーブルのバックグラウンドマージに対する `workload` 設定値として使用されます。指定しなかった場合（空文字列の場合）は、サーバー設定の `merge_workload` が代わりに使用されます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## min_absolute_delay_to_close {#min_absolute_delay_to_close} 

<SettingsInfoBlock type="UInt64" default_value="0" />

リクエストの処理を停止してクローズするまでの最小の絶対遅延時間であり、この間はステータスチェックで `Ok` を返しません。

## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 

<SettingsInfoBlock type="Bool" default_value="0" />

`min_age_to_force_merge_seconds` をパーティション全体に対してのみ適用し、部分的なサブセットには適用しないかどうかを制御します。

デフォルトでは、`max_bytes_to_merge_at_max_space_in_pool` 設定を無視します
（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

指定可能な値:

- true, false

## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />

範囲内のすべてのパーツが `min_age_to_force_merge_seconds` の値より古い場合に、パーツをマージします。

デフォルトでは、`max_bytes_to_merge_at_max_space_in_pool` の設定を無視します
（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

設定可能な値:

- 正の整数

## min_bytes_for_compact_part {#min_bytes_for_compact_part} 

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定は廃止されており、何の効果もありません。

## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud でのみ利用可能。データパーツに対して packed ではなく full タイプのストレージを使用するための、非圧縮時のサイズの最小値（バイト単位）。

## min_bytes_for_wide_part {#min_bytes_for_wide_part} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

`Wide` 形式で保存されるデータパーツに対して許可される、最小のバイト数／行数です。これらの設定は、片方のみ、両方、またはいずれも設定しなくてもかまいません。

## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

新しいパーツに対してマークキャッシュおよびプライマリ索引キャッシュを事前ウォームアップするための最小サイズ（非圧縮バイト数）

## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 

<SettingsInfoBlock type="UInt64" default_value="0" />

新しい大きなパーツをボリュームディスク [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 間で分散する際に、バランス調整を有効にするための最小バイト数を設定します。

設定可能な値:

- 正の整数。
- `0` — バランス調整を無効にします。

**使用方法**

`min_bytes_to_rebalance_partition_over_jbod` の値は、
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024 の値より小さくしてはいけません。そうでない場合、ClickHouse は例外をスローします。

## min_columns_to_activate_adaptive_write_buffer {#min_columns_to_activate_adaptive_write_buffer} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "500"},{"label": "New setting"}]}]}/>

多数のカラムを持つテーブルに対して、アダプティブ書き込みバッファを使用することでメモリ使用量を削減します。

指定可能な値:

- 0 - 無制限
- 1 - 常に有効

## min_compress_block_size {#min_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

次のマークを書き込む際に、圧縮を行うために必要となる非圧縮データブロックの最小サイズです。この設定はグローバル設定でも指定できます（[min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size) 設定を参照）。テーブル作成時に指定した値は、この設定についてグローバル設定で指定された値を上書きします。

## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 

<SettingsInfoBlock type="UInt64" default_value="0" />

フェッチ後のパーツに対して `fsync` を実行するための、圧縮済みデータのバイト数の最小値（0 の場合は無効）

## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 

<SettingsInfoBlock type="UInt64" default_value="0" />

マージ後のパーツに対して `fsync` を実行する際の、圧縮済みデータの最小バイト数（0 の場合は無効）

## min_delay_to_insert_ms {#min_delay_to_insert_ms} 

<SettingsInfoBlock type="UInt64" default_value="10" />

単一のパーティション内にマージされていないパーツが多数存在する場合に、MergeTree テーブルへのデータ挿入に適用される最小遅延時間（ミリ秒単位）。

## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 

<SettingsInfoBlock type="UInt64" default_value="10" />

未完了のmutationが多数ある場合における、MergeTreeテーブルのmutation実行までの最小遅延時間（ミリ秒）

## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

データを挿入するために、ディスクの空き容量として確保されていなければならない最小バイト数です。利用可能な空きバイト数が
`min_free_disk_bytes_to_perform_insert` より小さい場合には、例外がスローされ、
挿入は実行されません。この設定には次のような特徴があります。

- `keep_free_space_bytes` 設定を考慮します。
- `INSERT` 操作によって書き込まれるデータ量は考慮しません。
- 正の（ゼロ以外の）バイト数が指定されている場合にのみチェックされます。

設定可能な値:

- 任意の正の整数。

:::note
`min_free_disk_bytes_to_perform_insert` と `min_free_disk_ratio_to_perform_insert`
の両方が指定されている場合、ClickHouse は、より大きな空きディスク容量で
挿入を実行できるようにする方の値を優先して使用します。
:::

## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 

<SettingsInfoBlock type="Float" default_value="0" />

`INSERT` を実行するために必要な、空きディスク容量の総ディスク容量に対する最小比率です。0 から 1 の間の浮動小数点値である必要があります。この設定には次の特徴があります。

- `keep_free_space_bytes` 設定を考慮します。
- `INSERT` 操作によって書き込まれるデータ量は考慮しません。
- 正の (非ゼロ) 比率が指定されている場合にのみチェックされます。

設定可能な値:

- Float, 0.0 - 1.0

`min_free_disk_ratio_to_perform_insert` と
`min_free_disk_bytes_to_perform_insert` の両方が指定されている場合、ClickHouse は、より多くの空きディスク容量がある状態で `INSERT` を実行できる方の値を採用します。

## min_index_granularity_bytes {#min_index_granularity_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

データグラニュールの許可される最小サイズ（バイト単位）。

`index_granularity_bytes` が極端に小さいテーブルを誤って作成することを防ぐためのセーフガードとして機能します。

## min_level_for_full_part_storage {#min_level_for_full_part_storage} 

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ利用可能。データパートに対して、packed 形式ではなく full 形式のストレージを使用するための最小パートレベル。

## min_level_for_wide_part {#min_level_for_wide_part} 

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定"}]}]}/>

`Compact` 形式ではなく `Wide` 形式のデータパートを作成するために必要な最小パートレベル。

## min&#95;marks&#95;to&#95;honor&#95;max&#95;concurrent&#95;queries {#min_marks_to_honor_max_concurrent_queries}

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリに対して [max&#95;concurrent&#95;queries](#max_concurrent_queries) 設定を適用する際に、そのクエリで読み取られる必要があるマーク数の下限。

:::note
クエリは、他の `max_concurrent_queries` 設定によっても引き続き制限されます。
:::

設定可能な値:

* 正の整数。
* `0` — 無効（`max_concurrent_queries` の制限はどのクエリにも適用されない）。

**例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```

## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io} 

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

マージ処理でストレージディスクに対して direct I/O アクセスを使用するために必要となる、最小のデータ量です。データパーツをマージする際、ClickHouse はマージ対象となるすべてのデータの合計ストレージ容量を計算します。その容量が `min_merge_bytes_to_use_direct_io` バイトを超えると、ClickHouse はストレージディスクへの読み書きを direct I/O インターフェイス（`O_DIRECT` オプション）を使って行います。`min_merge_bytes_to_use_direct_io = 0` の場合、direct I/O は無効化されます。

## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 

<SettingsInfoBlock type="UInt64" default_value="0" />

マージセレクタが一度の処理でマージ対象として選択できるデータパーツの最小数です
（エキスパート向けの SETTING です。動作を理解していない場合は変更しないでください）。
0 の場合は無効になります。この SETTING は Simple および StochasticSimple マージセレクタで機能します。

## min_relative_delay_to_close {#min_relative_delay_to_close} 

<SettingsInfoBlock type="UInt64" default_value="300" />

他のレプリカとの最小許容遅延。この値を超えると、接続をクローズし、リクエストの処理を停止し、
ステータスチェック時に Ok を返さなくなります。

## min_relative_delay_to_measure {#min_relative_delay_to_measure} 

<SettingsInfoBlock type="UInt64" default_value="120" />

絶対遅延がこの値以上の場合にのみ、レプリカの相対遅延を計算します。

## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 

<SettingsInfoBlock type="UInt64" default_value="120" />

廃止された設定であり、現在は何の効果もありません。

## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 

<SettingsInfoBlock type="UInt64" default_value="10" />

ZooKeeper ログ内の直近のレコードを、たとえ古くなっていてもおおよそこの数だけ保持します。これはテーブルの動作には影響せず、クリーンアップ前の ZooKeeper ログを診断する目的にのみ使用されます。

設定可能な値:

- 任意の正の整数。

## min_rows_for_compact_part {#min_rows_for_compact_part} 

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定は廃止されており、何の効果もありません。

## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud でのみ利用可能です。データパーツに対して packed 形式ではなく full 形式のストレージを使用するための最小行数を指定します。

## min_rows_for_wide_part {#min_rows_for_wide_part} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`Compact` 形式ではなく `Wide` 形式のデータパートを作成するために必要な最小行数。

## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 

<SettingsInfoBlock type="UInt64" default_value="0" />

マージ後のパーツに対して `fsync` を実行する際の行数の下限値（0 の場合は無効）

## mutation_workload {#mutation_workload} 

ミューテーションとその他のワークロード間で、リソースの使用および共有方法を制御するために使用します。指定された値は、このテーブルのバックグラウンドミューテーションに対する `workload` 設定値として使用されます。指定されていない場合（空文字列の場合）は、サーバー設定の `mutation_workload` が代わりに使用されます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## non_replicated_deduplication_window {#non_replicated_deduplication_window} 

<SettingsInfoBlock type="UInt64" default_value="0" />

非レプリケートな
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルにおいて、
重複チェックのためにハッシュ値が保持される、直近で挿入されたブロックの数。

設定可能な値:

- 任意の正の整数。
- `0`（重複排除を無効化）。

[replicated_deduplication_window](#replicated_deduplication_window) 設定を参照してください。
レプリケートテーブルと同様の重複排除メカニズムが使用され、作成されたパーツのハッシュ値はディスク上のローカルファイルに書き込まれます。

## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

最新のブロック番号を SharedJoin または SharedSet に通知します。ClickHouse Cloud でのみ利用可能です。

## nullable_serialization_version {#nullable_serialization_version} 

<SettingsInfoBlock type="MergeTreeNullableSerializationVersion" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "basic"},{"label": "新しい設定"}]}]}/>

`Nullable(T)` カラムで使用されるシリアライズ方式を制御します。

指定可能な値:

- basic — `Nullable(T)` に対して標準的なシリアライズ方式を使用します。

- allow_sparse — `Nullable(T)` でスパースエンコーディングを使用できるようにします。

## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 

<SettingsInfoBlock type="UInt64" default_value="20" />

プール内の空きエントリ数が指定値より少ない場合は、パーツのミューテーションを実行しません。これは、通常のマージ用にスレッドを残しておき、「Too many parts」エラーを回避するためです。

Possible values:

- 任意の正の整数値。

**Usage**

The value of the `number_of_free_entries_in_pool_to_execute_mutation` setting
should be less than the value of the [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio).
Otherwise, ClickHouse will throw an exception.

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 

<SettingsInfoBlock type="UInt64" default_value="25" />

プール内の空きエントリ数が指定された数より少ない場合、バックグラウンドでパーティション全体の最適化を実行しません(このタスクは`min_age_to_force_merge_seconds`が設定され、`min_age_to_force_merge_on_partition_only`が有効な場合に生成されます)。これは、通常のマージ用に空きスレッドを確保し、「パーツが多すぎる」エラーを回避するためです。

設定可能な値:

- 正の整数

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`設定の値は、
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio)
の値より小さくする必要があります。
そうでない場合、ClickHouseは例外をスローします。

## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 

<SettingsInfoBlock type="UInt64" default_value="8" />

プール（またはレプリケートキュー）内の空きエントリ数が指定された数より少なくなると、処理するマージ（またはキューに投入するマージ）の最大サイズを縮小し始めます。
これは、小さなマージが処理されるようにして、長時間実行されるマージでプールが埋まってしまうのを防ぐためです。

設定可能な値:

- 任意の正の整数。

## number_of_mutations_to_delay {#number_of_mutations_to_delay} 

<SettingsInfoBlock type="UInt64" default_value="500" />

テーブルに未完了の mutation が少なくともこの数だけある場合、テーブルの mutation を意図的に遅延させます。
0 に設定した場合は無効になります。

## number_of_mutations_to_throw {#number_of_mutations_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

テーブルに未完了の mutation がこの値以上存在する場合、'Too many mutations' 例外をスローします。0 を設定すると無効になります。

## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud でのみ利用可能です。マージ対象として考慮するパーティションの上限となる N を指定します。パーティションは、そのパーティション内でマージ可能なデータパーツ数を重みとして、重み付きランダムに選択されます。

## object_serialization_version {#object_serialization_version} 

<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "JSON シリアル化のバージョンを制御する設定を追加"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "高度な共有データのシリアル化を利用するために、JSON 用のシリアル化バージョン v3 をデフォルトで有効化"}]}]}/>

JSON データ型用のシリアル化バージョン。互換性を保つために必要です。

指定可能な値:

- `v1`
- `v2`
- `v3`

共有データのシリアル化バージョンの変更をサポートするのは、バージョン `v3` のみです。

## object_shared_data_buckets_for_compact_part {#object_shared_data_buckets_for_compact_part} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Compact パーツにおける JSON 共有データシリアル化のバケット数を制御する SETTING を追加"}]}]}/>

Compact パーツにおける JSON 共有データシリアル化のバケット数。`map_with_buckets` および `advanced` 共有データシリアル化で使用されます。

## object_shared_data_buckets_for_wide_part {#object_shared_data_buckets_for_wide_part} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "Wide パーツにおける JSON 共有データシリアル化のバケット数を制御するための設定を追加"}]}]}/>

Wide パーツにおける JSON 共有データシリアル化時のバケット数。`map_with_buckets` および `advanced` 共有データシリアル化で使用されます。

## object_shared_data_serialization_version {#object_shared_data_serialization_version} 

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="advanced" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "JSON シリアル化バージョンを制御するための設定を追加"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "advanced"},{"label": "高度な共有データシリアル化バージョンをデフォルトで有効にする"}]}]}/>

JSON データ型内の共有データに対するシリアル化バージョンです。

指定可能な値:

- `map` - 共有データを `Map(String, String)` として保存します。
- `map_with_buckets` - 共有データを複数の個別の `Map(String, String)` カラムとして保存します。バケットを使用することで、共有データから個々のパスを読み取る処理が高速になります。
- `advanced` - 共有データから個々のパスを読み取る処理を大幅に高速化するために設計された、専用の共有データシリアル化方式です。  
このシリアル化方式では、多くの追加情報を保存するため、ディスク上の共有データのストレージサイズが増加することに注意してください。

`map_with_buckets` および `advanced` シリアル化におけるバケット数は、設定
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part)
によって決定されます。

## object_shared_data_serialization_version_for_zero_level_parts {#object_shared_data_serialization_version_for_zero_level_parts} 

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map_with_buckets" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "ゼロレベルパーツに対する JSON シリアル化バージョンを制御する設定を追加"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "map_with_buckets"},{"label": "ゼロレベルパーツに対する共有データのシリアル化バージョンとして map_with_buckets をデフォルトで有効化"}]}]}/>

この設定では、挿入時に作成されるゼロレベルパーツに対して、JSON 型内の共有データのシリアル化バージョンを個別に指定できます。
ゼロレベルパーツに対しては、共有データのシリアル化として `advanced` を使用しないことを推奨します。挿入時間が大きく増加する可能性があるためです。

## old_parts_lifetime {#old_parts_lifetime} 

<SettingsInfoBlock type="Seconds" default_value="480" />

予期しないサーバー再起動時のデータ損失を防ぐために、非アクティブなパーツを保持しておく時間（秒）。

設定可能な値:

- 任意の正の整数。

複数のパーツを新しいパーツにマージした後、ClickHouse は元の
パーツを非アクティブとしてマークし、`old_parts_lifetime` 秒経過してからのみ削除します。
非アクティブなパーツは、現在のクエリで使用されていない場合、すなわち
そのパーツの `refcount` が 1 の場合に削除されます。

新しいパーツに対しては `fsync` は呼び出されないため、しばらくの間、新しいパーツは
サーバーの RAM（OS キャッシュ）内にしか存在しません。サーバーが予期せず再起動された場合、
新しいパーツは失われたり破損したりする可能性があります。データを保護するため、
非アクティブなパーツはすぐには削除されません。

起動時に ClickHouse はパーツの整合性をチェックします。マージされた
パーツが破損している場合、ClickHouse は非アクティブなパーツをアクティブリストに戻し、
後で再度マージします。その後、破損したパーツはリネームされ（`broken_`
プレフィックスが追加され）、`detached` フォルダに移動されます。マージされたパーツが
破損していない場合、元の非アクティブなパーツがリネームされ（`ignored_`
プレフィックスが追加され）、`detached` フォルダに移動されます。

デフォルトの `dirty_expire_centisecs` の値（Linux カーネルの設定）は 30 秒です
（書き込まれたデータが RAM のみに保持される最大時間）。しかし、
ディスクシステムへの負荷が高い場合、データの書き込みはさらに遅れる可能性があります。
実験的な検証により、`old_parts_lifetime` の値として 480 秒が選択されており、
この時間内に新しいパーツが確実にディスクに書き込まれることが保証されています。

## optimize_row_order {#optimize_row_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

挿入時に行の順序を最適化して、新しく挿入されるテーブルパーツの圧縮率を
向上させるかどうかを制御します。

通常の MergeTree エンジンテーブルに対してのみ効果があります。
特殊な MergeTree エンジンテーブル（例: CollapsingMergeTree）には影響しません。

MergeTree テーブルは（オプションで）[compression codecs](/sql-reference/statements/create/table#column_compression_codec)
を使用して圧縮されます。LZ4 や ZSTD のような汎用圧縮コーデックは、データにパターンが存在する場合に
最大の圧縮率を達成します。同じ値が長く連続しているデータは、一般的に非常によく圧縮されます。

この設定が有効な場合、ClickHouse は新しく挿入されるパーツ内のデータを、
新しいテーブルパーツのカラム全体で同一値が連続する「ラン」の数が最小になるような
行順序で保存しようと試みます。
言い換えると、同一値ランの数が少ないほど、それぞれのランは長くなり、
圧縮が良好になります。

最適な行順序を見つけることは計算量的に実行不可能（NP 困難）です。
そのため、ClickHouse はヒューリスティクスを用いて、元の行順序よりも
圧縮率を改善できる行順序を高速に見つけます。

<details markdown="1">

<summary>行順序を見つけるためのヒューリスティクス</summary>

一般に、テーブル（またはテーブルパーツ）の行は自由に並べ替えることができ、
SQL では行順序が異なっていても同じテーブル（テーブルパーツ）とみなされます。

テーブルに primary key が定義されている場合、この行の並べ替えの自由度は
制限されます。ClickHouse では、primary key `C1, C2, ..., CN` により、
テーブルの行はカラム `C1`, `C2`, ... `Cn` によってソートされることが
要求されます（[clustered index](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
その結果、行は「同値類」の内部でのみ並べ替えることができます。
すなわち、primary key のカラムにおいて同じ値を持つ行同士が
同じ同値類を構成します。
直感的には、`DateTime64` タイプのタイムスタンプカラムを含むような
高カーディナリティの primary key は、多数の小さな同値類を生み出します。
同様に、低カーディナリティの primary key を持つテーブルでは、
少数の大きな同値類になります。primary key を持たないテーブルは、
すべての行を含む単一の同値類からなる極端なケースに相当します。

同値類が少なく大きいほど、行を再シャッフルする自由度は高くなります。

各同値類の内部で最適な行順序を見つけるために適用される
ヒューリスティクスは、D. Lemire, O. Kaser による
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
で提案されており、primary key 以外のカラムのカーディナリティを
昇順に並べることで、各同値類内の行をソートすることに基づいています。

これは次の 3 ステップを実行します:
1. primary key カラムの行値に基づいて、すべての同値類を見つけます。
2. 各同値類について、primary key 以外のカラムのカーディナリティを
（通常は推定により）計算します。
3. 各同値類について、primary key 以外のカラムのカーディナリティが
昇順になるように行をソートします。

</details>

有効にすると、新しいデータの行順序を解析し最適化するために、
挿入処理に追加の CPU コストがかかります。
データの特性にもよりますが、INSERT の実行時間は 30〜50% 程度
長くなることが予想されます。
LZ4 または ZSTD の圧縮率は、平均して 20〜40% 改善します。

この設定は、primary key を持たないテーブル、または低カーディナリティの
primary key（すなわち、primary key の異なる値の種類が少ないテーブル）に対して
最も効果的に機能します。
`DateTime64` 型のタイムスタンプカラムを含むような
高カーディナリティの primary key を持つテーブルでは、
この設定によるメリットは期待できません。

## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

パーツを分片間で移動する前後に待機する時間（秒）。

## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

パーツを分片間で移動するための実験的／未完成の機能です。  
この機能はシャーディング式を考慮しません。

## parts_to_delay_insert {#parts_to_delay_insert} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

単一のパーティション内のアクティブなパーツ数が
`parts_to_delay_insert` の値を超えた場合、`INSERT` は人工的に遅延させられます。

指定可能な値:

- 任意の正の整数。

ClickHouse は `INSERT` の実行時間を人工的に長くし（sleep を追加し）、バックグラウンドのマージ処理が、追加される速度よりも速くパーツをマージできるようにします。

## parts_to_throw_insert {#parts_to_throw_insert} 

<SettingsInfoBlock type="UInt64" default_value="3000" />

単一のパーティション内のアクティブなパーツ数が
`parts_to_throw_insert` の値を超えると、`INSERT` は `Too many
parts (N). Merges are processing significantly slower than inserts`
という例外とともに中断されます。

設定可能な値:

- 任意の正の整数。

`SELECT` クエリのパフォーマンスを最大化するには、処理対象となるパーツ数を
最小限に抑える必要があります。詳細は [Merge Tree](/development/architecture#merge-tree) を参照してください。

バージョン 23.6 より前では、この設定は 300 に設定されていました。より高い
値に設定することで `Too many parts`
エラーが発生する確率を下げることができますが、その一方で `SELECT`
のパフォーマンスが低下する可能性があります。また、マージに問題
（たとえばディスク容量不足など）が生じた場合、元の値 300 のときよりも
その問題に気づくタイミングが遅くなります。

## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

パーツのサイズの合計がこのしきい値を超え、かつレプリケーションログエントリの作成からの経過時間が
`prefer_fetch_merged_part_time_threshold` より大きい場合、ローカルでマージを実行するのではなく、
レプリカからマージ済みパーツを取得することを優先します。これは、非常に時間のかかるマージ処理を高速化するためです。

取りうる値:

- 任意の正の整数。

## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 

<SettingsInfoBlock type="Seconds" default_value="3600" />

レプリケーションログ（ClickHouse Keeper または ZooKeeper）のエントリが作成されてからの経過時間がこのしきい値を超え、かつパーツのサイズの合計が `prefer_fetch_merged_part_size_threshold` より大きい場合、ローカルでマージを実行するのではなく、レプリカからマージ済みパーツを取得することを優先します。これは、非常に長時間かかるマージを高速化するためのものです。

設定可能な値:

- 正の整数。

## prewarm_mark_cache {#prewarm_mark_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、挿入、マージ、フェッチ時およびサーバー起動時にマークをマークキャッシュに保存して、マークキャッシュを事前にウォームアップします。

## prewarm_primary_key_cache {#prewarm_primary_key_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

true の場合、primary index cache は、挿入、マージ、フェッチ時およびサーバー起動時に marks を mark cache に保存することで事前にウォームアップされます

## primary_key_compress_block_size {#primary_key_compress_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

プライマリキーの圧縮ブロックサイズ。圧縮するブロックの実際のサイズです。

## primary_key_compression_codec {#primary_key_compression_codec} 

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

primary key に対して使用される圧縮コーデックです。primary key は十分に小さく、キャッシュされるため、デフォルトの圧縮方式は ZSTD(3) です。

## primary_key_lazy_load {#primary_key_lazy_load} 

<SettingsInfoBlock type="Bool" default_value="1" />

テーブルの初期化時ではなく、最初に使用されたときにプライマリキーをメモリに読み込みます。多数のテーブルが存在する場合にメモリ使用量を節約できます。

## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 

<SettingsInfoBlock type="Float" default_value="0.9" />

データパート内で primary key のカラムの値が少なくともこの割合で変化する場合、後続のカラムをメモリに読み込むことをスキップします。これにより、primary key の不要なカラムを読み込まないことでメモリ使用量を削減できます。

## ratio&#95;of&#95;defaults&#95;for&#95;sparse&#95;serialization {#ratio_of_defaults_for_sparse_serialization}

<SettingsInfoBlock type="Float" default_value="0.9375" />

カラム内の *all* 値に対する *default* 値の数の最小比率です。
この値を設定すると、そのカラムはスパースシリアライゼーションを使って保存されます。

カラムがスパース（ほとんどがゼロ）である場合、ClickHouse はそれをスパース形式でエンコードし、
クエリ時にデータを完全に展開することなく、自動的に計算を最適化できます。
このスパースシリアライゼーションを有効にするには、
`ratio_of_defaults_for_sparse_serialization` を 1.0 未満に設定します。
値が 1.0 以上の場合、カラムは常に通常のフルシリアライゼーションで書き込まれます。

指定可能な値:

* スパースシリアライゼーションを有効にする場合は `0` から `1` の間の Float
* スパースシリアライゼーションを使用しない場合は `1.0`（またはそれ以上）

**例**

次のテーブルでは、`s` カラムは 95% の行で空文字列であることに注目してください。
`my_regular_table` ではスパースシリアライゼーションを使用せず、
`my_sparse_table` では `ratio_of_defaults_for_sparse_serialization` を 0.95 に設定しています。

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

`my_sparse_table` の `s` カラムは、ディスク上のストレージ使用量が少なくなっていることに注目してください。

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

カラムがスパースエンコーディングを使用しているかどうかは、`system.parts_columns` テーブルの `serialization_kind` カラムを参照して確認できます。

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

`s` のうち、どのパーツがスパースシリアル化で保存されているかを確認できます。

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

ClickHouse Cloud でのみ利用可能です。範囲が削除/置換されなかった場合に、ブロックされているパーツの削減を再試行するまで待機する最小時間です。値を小さくすると、`background_schedule_pool` 内のタスクが頻繁にトリガーされ、大規模クラスターでは ZooKeeper へのリクエストが大量に発生します。

## refresh_parts_interval {#refresh_parts_interval} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>

ゼロより大きい値に設定されている場合、基盤となるファイルシステムからデータパーツの一覧を更新し、裏側でデータが更新されていないかを確認します。
テーブルが読み取り専用ディスク上にある場合にのみ設定できます（これは、そのテーブルが読み取り専用レプリカであり、データは別のレプリカから書き込まれていることを意味します）。

## refresh_statistics_interval {#refresh_statistics_interval} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "新しい設定"}]}]}/>

統計キャッシュの更新間隔（秒）。0 に設定すると、更新は行われません。

## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 

<SettingsInfoBlock type="Seconds" default_value="10800" />

この設定が 0 より大きい値に設定されている場合、マージされたパーツが共有ストレージ上にあるときは、単一のレプリカのみが直ちにマージを開始します。

:::note
Zero-copy レプリケーションはまだ本番環境での利用に適していません
Zero-copy レプリケーションは ClickHouse バージョン 22.8 以降ではデフォルトで無効になっています。

この機能は本番環境での使用は推奨されません。
:::

設定可能な値:

- 任意の正の整数。

## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

変換処理中は、互換モードでゼロコピーを実行します。

## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path} 

<ExperimentalBadge/>

<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

zero-copy に関するテーブル非依存の情報を格納するための ZooKeeper パス。

## remove_empty_parts {#remove_empty_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

有効期限 (TTL)、mutation、または collapsing マージアルゴリズムによる処理の結果、空になったパーツを削除します。

## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

未完成の実験的機能用の設定です。

## remove_unused_patch_parts {#remove_unused_patch_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

バックグラウンドで、すべてのアクティブなパーツに適用済みのパッチパーツを削除します。

## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 

<SettingsInfoBlock type="Bool" default_value="1" />

カラムのファイル名が長すぎる（`max_file_name_length` バイトを超える）場合、SipHash128 の値に置き換えます。

## replicated_can_become_leader {#replicated_can_become_leader} 

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、このノード上のレプリケーテッドテーブルのレプリカはリーダーの役割を獲得しようとします。

設定可能な値:

- `true`
- `false`

## replicated_deduplication_window {#replicated_deduplication_window} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "デフォルト値の増加"}]}]}/>

ClickHouse Keeper が重複チェックのためのハッシュサムを保持する対象となる、直近で挿入されたブロックの数。

設定可能な値:

- 任意の正の整数。
- 0（重複排除を無効にする）

`Insert` コマンドは 1 つ以上のブロック（パーツ）を作成します。
[挿入の重複排除](../../engines/table-engines/mergetree-family/replication.md)では、
レプリケーテッドテーブルに書き込む際、ClickHouse は作成されたパーツの
ハッシュサムを ClickHouse Keeper に書き込みます。ハッシュサムは直近の
`replicated_deduplication_window` 個のブロックについてのみ保存されます。
最も古いハッシュサムは ClickHouse Keeper から削除されます。

`replicated_deduplication_window` の値が大きいと、比較するエントリ数が増えるため
`Insert` が遅くなります。ハッシュサムは、フィールド名と型の構成および挿入された
パーツ（バイト列）のデータから計算されます。

## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse Keeper が重複チェックのためにハッシュ値を保持しておく、
非同期インサートされた直近のブロックの数。

設定可能な値:

- 任意の正の整数。
- 0（`async_inserts` に対する重複排除を無効化）

[Async Insert](/operations/settings/settings#async_insert) コマンドは、
1 つ以上のブロック（パーツ）にキャッシュされます。[insert deduplication](/engines/table-engines/mergetree-family/replication)
のため、レプリケートテーブルに書き込む際、ClickHouse は各 insert の
ハッシュ値を ClickHouse Keeper に書き込みます。ハッシュ値は、直近の
`replicated_deduplication_window_for_async_inserts` 個のブロックについてのみ
保存されます。最も古いハッシュ値は ClickHouse Keeper から削除されます。
`replicated_deduplication_window_for_async_inserts` の値が大きいと、
より多くのエントリを比較する必要があるため、`Async Inserts` が遅くなります。
ハッシュ値は、フィールド名と型の組み合わせおよび INSERT のデータ
（バイトストリーム）から計算されます。

## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>

挿入されたブロックのハッシュ値が ClickHouse Keeper から削除されるまでの秒数。

可能な値:

- 任意の正の整数。

[replicated_deduplication_window](#replicated_deduplication_window) と同様に、
`replicated_deduplication_window_seconds` は、挿入の重複排除のためにブロックの
ハッシュ値をどれだけの期間保持するかを指定します。
`replicated_deduplication_window_seconds` より古いハッシュ値は、
`replicated_deduplication_window` より小さい場合でも ClickHouse Keeper から削除されます。

この時間はウォールクロック時間ではなく、最新レコードの時刻を基準とします。
そのレコードが唯一のものである場合は、無期限に保持されます。

## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 

<SettingsInfoBlock type="UInt64" default_value="604800" />

非同期挿入のハッシュ値が ClickHouse Keeper から削除されるまでの秒数。

可能な値:

- 任意の正の整数。

[replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts) と同様に、
`replicated_deduplication_window_seconds_for_async_inserts` は、非同期挿入の重複排除のために
ブロックのハッシュ値をどれくらいの期間保持するかを指定します。
`replicated_deduplication_window_seconds_for_async_inserts` より古いハッシュ値は、
`replicated_deduplication_window_for_async_inserts` より小さい場合でも
ClickHouse Keeper から削除されます。

時間はウォールクロック時刻ではなく、最新レコードの時刻に対して相対的です。
それが唯一のレコードであるかぎり、永久に保存されます。

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />

この設定は廃止されており、何の効果もありません。

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />

廃止された設定で、現在は何の効果もありません。

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />

廃止された設定であり、現在は何の効果もありません。

## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

1 つの MUTATE_PART エントリ内でマージして一度に実行できる mutation コマンドの最大数（0 は無制限）

## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定で、何の効果もありません。

## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 

<SettingsInfoBlock type="UInt64" default_value="15" />

廃止された設定であり、現在は効果がありません。

## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定であり、現在は効果がありません。

## replicated_max_parallel_sends {#replicated_max_parallel_sends} 

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定であり、現在は何も行いません。

## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定で、現在は何の効果もありません。

## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 

<SettingsInfoBlock type="Float" default_value="0.5" />

誤ったパーツ数とパーツ総数の比率がこの値未満の場合は、
起動を許可します。

取りうる値:

- Float, 0.0 - 1.0

## search_orphaned_parts_disks {#search_orphaned_parts_disks} 

<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>

ClickHouse は、データパーツが未定義（ポリシーに含まれていない）なディスク上に存在して取りこぼされることがないよう、任意の ATTACH または CREATE テーブル実行時にすべてのディスクを走査して孤立パーツを検索します。
孤立パーツは、ディスクがストレージポリシーから除外された場合など、安全でないストレージ再構成によって発生する可能性があります。
この設定は、ディスクの属性に基づいて、検索対象とするディスクの範囲を制限します。

設定可能な値:

- any - 範囲は制限されません。
- local - 範囲はローカルディスクに限定されます。
- none - 空の範囲。検索を実行しません。

## serialization_info_version {#serialization_info_version} 

<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "カスタム文字列シリアル化を可能にする新しい形式への変更"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "新しい設定"}]}]}/>

`serialization.json` の書き込み時に使用されるシリアル化情報バージョン。
この設定は、クラスターのアップグレード時の互換性を確保するために必要です。

設定可能な値:

- `basic` - 基本的な形式。
- `with_types` - 追加の `types_serialization_versions` フィールドを持つ形式で、型ごとにシリアル化バージョンを指定できます。
  これにより `string_serialization_version` のような設定が有効になります。

ローリングアップグレード中は、`basic` に設定して、新しいサーバーが
古いサーバーと互換性のあるデータ パーツを生成するようにします。アップグレード完了後は、
型ごとのシリアル化バージョンを有効にするために `WITH_TYPES` に切り替えます。

## shared_merge_tree_activate_coordinated_merges_tasks {#shared_merge_tree_activate_coordinated_merges_tasks} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "New settings"}]}]}/>

協調マージタスクの再スケジューリングを有効にします。  
`shared_merge_tree_enable_coordinated_merges=0` の場合でも、マージコーディネータの統計情報が蓄積され、コールドスタート時の挙動改善に役立つため有用です。

## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Keeper 内のメタデータ量を削減します。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud との同期"}]}]}/>

ZooKeeper で、レプリカごとの /metadata および /columns ノードの作成を有効にします。
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 

<SettingsInfoBlock type="Bool" default_value="0" />

SharedMergeTree に対するマージの割り当てを停止します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_empty_partition_lifetime {#shared_merge_tree_empty_partition_lifetime} 

<SettingsInfoBlock type="Seconds" default_value="86400" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "New setting"}]}]}/>

パーツを持たないパーティションを Keeper 内に保持しておく時間（秒）。

## shared_merge_tree_enable_automatic_empty_partitions_cleanup {#shared_merge_tree_enable_automatic_empty_partitions_cleanup} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定"}]}]}/>

空のパーティションに対応する Keeper エントリのクリーンアップを有効にします。

## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定"}]}]}/>

協調的マージ戦略を有効にします

## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

仮想パーツに属性を書き込み、Keeper でブロックをコミットできるようにします

## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

古くなったパーツのチェックを有効にします。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud 同期"}]}]}/>

shared merge tree において、ZooKeeper のウォッチによってトリガーされないパーツ更新を行うための秒単位の間隔。ClickHouse Cloud でのみ利用可能です

## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>

パーツ更新の初期バックオフ時間。ClickHouse Cloud でのみ利用可能です

## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "新しい設定"}]}]}/>

サーバー間 HTTP 接続のタイムアウト値。ClickHouse Cloud でのみ利用可能です

## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

サーバー間 HTTP 通信のタイムアウト値。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

shared_merge_tree_leader_update_period に対して、0〜x 秒の一様分布からの値を加算し、
thundering herd 問題を回避します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

パーツ更新におけるリーダー権限を再確認する最大間隔。
ClickHouse Cloud でのみ利用可能。

## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

1 回の HTTP リクエストで、リーダーが削除対象として確認を試みる古いパーツの最大数です。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "新しい設定"}]}]}/>

パーツ更新のための最大バックオフ時間。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 

<SettingsInfoBlock type="UInt64" default_value="6" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

パーツの更新リーダーの最大数です。ClickHouse Cloud でのみ利用可能です

## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

パーツ更新リーダーの最大数です。ClickHouse Cloud でのみ利用可能です

## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

パーツ削除（killer thread）に参加するレプリカの最大数。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

競合する可能性のあるマージの割り当てを試行するレプリカの最大数（マージ割り当て時の冗長な競合を回避するため）。0 を指定すると無効になります。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT における疑わしい破損パーツの最大数。この値を超える場合は自動デタッチを拒否します。"}]}]}/>

SMT における疑わしい破損パーツの最大数。この値を超える場合は自動デタッチを拒否します。

## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT におけるすべての破損パーツの合計サイズの上限。この値を超える場合は自動 detach を拒否する。"}]}]}/>

SMT におけるすべての破損パーツの合計サイズの上限。この値を超えると自動 detach を拒否する。

## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 

<SettingsInfoBlock type="Int64" default_value="1800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

挿入の再試行時に誤った動作を避けるために、挿入時のメモ化 ID をどのくらいの期間保持するかを指定します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

merge coordinator の選出を行うスレッドの実行間隔

## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<BetaBadge/>

<SettingsInfoBlock type="Float" default_value="1.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "負荷後のコーディネーターのスリープ時間を短縮"}]}]}/>

コーディネータースレッドの遅延時間を調整する係数

## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

merge coordinator が最新のメタデータを取得するために ZooKeeper と同期する頻度

## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

coordinator が MergerMutator に対して一度に要求できるマージの数

## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

マージコーディネーター・スレッドの実行間隔の最大時間

## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

コーディネーターが準備してワーカー間に分配するマージエントリの数

## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

マージコーディネータースレッドの実行間隔の最小値

## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

マージワーカースレッドが即時の処理の後に状態を更新する必要がある場合に使用されるタイムアウト値

## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

マージワーカースレッドが実行される間隔

## shared_merge_tree_outdated_parts_group_size {#shared_merge_tree_outdated_parts_group_size} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>

古くなったパーツのクリーンアップを行う際に、同じランデブーハッシュグループに属するレプリカの数。
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 

<SettingsInfoBlock type="Float" default_value="0.5" />

`<candidate partitions for mutations only (partitions that cannot be merged)>/<candidate partitions for mutations>` の比率がこの設定値より大きい場合に、merge/mutate の選択タスクで merge predicate を再読み込みします。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />

一度にスケジュールするパーツメタデータ取得ジョブの数。ClickHouse Cloud でのみ利用可能です

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

ローカルでマージされたパーツを、そのパーツを含む新しいマージを開始せずに保持しておく時間です。
他のレプリカがそのパーツをフェッチし、このマージを開始できるようにするための猶予を与えます。
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

ローカルでマージした直後に、そのパーツへの次のマージの割り当てを延期するための、パーツの最小サイズ（行数）。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

このパーツを含む新しいマージを開始せずに、ローカルでマージ済みパーツを保持しておく時間。
他のレプリカがそのパーツをフェッチして、このマージを開始できるようにするための猶予を与えます。
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

可能な場合には、リーダーから仮想パーツを読み取ります。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "他のレプリカからメモリ上のパーツデータを取得するための新しい設定"}]}]}/>

有効にすると、すべてのレプリカが、すでにデータが存在している他のレプリカから、メモリ上のパーツデータ（プライマリキー、パーティション情報など）を取得しようとします。

## shared_merge_tree_update_replica_flags_delay_ms {#shared_merge_tree_update_replica_flags_delay_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "新しい設定"}]}]}/>

バックグラウンドスケジュールに従って、レプリカがフラグを再読み込みしようとする間隔を指定します。

## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

有効にすると、他のレプリカ上のインメモリキャッシュから FS キャッシュのヒントを要求できるようになります。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "古いパーツ v3 をデフォルトで有効化"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同期"}]}]}/>

古いパーツにコンパクト形式を使用します。Keeper への負荷を軽減し、古いパーツの処理を改善します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

有効化すると、「too many parts」カウンタはローカルレプリカの状態ではなく、Keeper 内で共有されるデータに基づいて動作します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_virtual_parts_discovery_batch {#shared_merge_tree_virtual_parts_discovery_batch} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

1 回のバッチでまとめて実行するパーティション検出の数を指定します

## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />

多くの古いパーツが存在する場合、クリーンアップスレッドは 1 回のイテレーションごとに最大
`simultaneous_parts_removal_limit` 個のパーツを削除しようとします。
`simultaneous_parts_removal_limit` が `0` に設定されている場合は、無制限を意味します。

## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

テスト目的で使用します。変更しないでください。

## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

テスト目的の設定です。変更しないでください。

## storage_policy {#storage_policy} 

<SettingsInfoBlock type="String" default_value="default" />

ストレージディスクのポリシー名

## string_serialization_version {#string_serialization_version} 

<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "サイズを別ストリームで扱う新しい形式に変更"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "新しい設定を追加"}]}]}/>

トップレベルの `String` カラムに対するシリアライズ形式を制御します。

この設定が有効になるのは、`serialization_info_version` が "with_types" に設定されている場合のみです。
`with_size_stream` に設定すると、トップレベルの `String` カラムはインラインではなく、
文字列長を保持する `.size` サブカラムを別途用いてシリアライズされます。これにより実際の `.size`
サブカラムを利用でき、圧縮効率が向上する可能性があります。

ネストされた `String` 型（例: `Nullable`、`LowCardinality`、`Array`、`Map` 内）は、
`Tuple` 内に現れる場合を除き、影響を受けません。

指定可能な値:

- `single_stream` — サイズをインラインで保持する標準的なシリアライズ形式を使用します。
- `with_size_stream` — トップレベルの `String` カラムに対し、サイズ用の別ストリームを使用します。

## table_disk {#table_disk} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

これは table disk であり、パスやエンドポイントはテーブルデータを指すように指定し、データベース全体のデータを指してはいけません。この設定は s3_plain/s3_plain_rewritable/web に対してのみ指定できます。

## temporary_directories_lifetime {#temporary_directories_lifetime} 

<SettingsInfoBlock type="Seconds" default_value="86400" />

`tmp_` ディレクトリを保持しておく時間（秒）を指定します。この値を下げるべきではありません。
この設定の値が低すぎると、マージやミューテーション（merge, mutation）が正常に動作しない可能性があります。

## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 

<SettingsInfoBlock type="Seconds" default_value="7200" />

再圧縮を伴うマージを開始するまでのタイムアウト（秒単位）。この時間中、ClickHouse は、この再圧縮マージが割り当てられているレプリカから再圧縮済みパーツのフェッチを試みます。

多くの場合、再圧縮は処理が遅いため、このタイムアウトに達するまでは再圧縮を伴うマージを開始せず、代わりに、この再圧縮マージが割り当てられているレプリカから再圧縮済みパーツのフェッチを試みます。

設定可能な値:

- 任意の正の整数。

## ttl_only_drop_parts {#ttl_only_drop_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

MergeTree テーブルのパーツ内のすべての行が `TTL` 設定に従って有効期限 (TTL) 切れとなった場合に、そのパーツを丸ごと削除するかどうかを制御します。

`ttl_only_drop_parts` が無効（デフォルト）の場合、`TTL` 設定に基づいて有効期限が切れた行だけが削除されます。

`ttl_only_drop_parts` が有効な場合、そのパーツ内のすべての行の有効期限 (TTL) が切れていれば、パーツ全体が削除されます。

## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 

<SettingsInfoBlock type="Bool" default_value="1" />

動的サブカラムの書き込み時にアダプティブな書き込みバッファーを使用できるようにし、メモリ使用量を削減します

## use_async_block_ids_cache {#use_async_block_ids_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、非同期 insert のハッシュ値をキャッシュします。

設定可能な値:

- `true`
- `false`

複数の非同期 insert を含むブロックは、複数のハッシュ値を生成します。
一部の insert が重複している場合、Keeper は 1 回の RPC で重複しているハッシュ値を 1 つだけ返すため、不要な RPC の再試行が発生します。
このキャッシュは Keeper 内のハッシュ値のパスを監視します。Keeper で更新が検知されると、キャッシュは可能な限り早く更新され、それによってメモリ上で重複した insert をフィルタリングできるようになります。

## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 

<SettingsInfoBlock type="Bool" default_value="1" />

Variant データ型の discriminator をバイナリシリアライズする際のコンパクトモードを有効にします。
このモードでは、格納されている値のほとんどが 1 種類の Variant であるか、NULL 値が大量に存在する場合に、パーツ内で discriminator を格納するために必要なメモリ使用量を大幅に削減できます。

## use_const_adaptive_granularity {#use_const_adaptive_granularity} 

<SettingsInfoBlock type="Bool" default_value="0" />

パーツ全体に対して常に一定の粒度を使用します。これにより、索引の粒度値をメモリ内で圧縮できます。これは、列数の少ないテーブルを扱う非常に大規模なワークロードで有用な場合があります。

## use_metadata_cache {#use_metadata_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

廃止された設定で、現在は何の効果もありません。

## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 

<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper 内のパーツのチェックサムには、通常の形式（数十 KB）ではなく、より小さい形式（数十バイト）を使用します。設定を有効にする前に、すべてのレプリカが新しい形式をサポートしていることを確認してください。

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 

<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper におけるデータパーツのヘッダーの格納方法を指定します。有効にすると、ZooKeeper
に保存されるデータ量が少なくなります。詳細は[こちら](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)を参照してください。

## use_primary_key_cache {#use_primary_key_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

すべての索引をメモリ上に保持する代わりに、プライマリキー索引用のキャッシュを使用します。特に非常に大きなテーブルで有用です。

## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 

<SettingsInfoBlock type="UInt64" default_value="0" />

縦方向マージアルゴリズムを有効化するための、マージ対象パーツの非圧縮サイズ（バイト単位）の最小（おおよその）合計値。

## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 

<SettingsInfoBlock type="UInt64" default_value="11" />

Vertical マージアルゴリズムを有効化するために必要な、主キー (PK) 以外のカラム数の最小値。

## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

Vertical merge アルゴリズムを有効化するために必要な、
マージ対象パーツ内の行数の最小（概算）合計値。

## vertical_merge_optimize_lightweight_delete {#vertical_merge_optimize_lightweight_delete} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

true の場合、垂直マージ時の論理削除の最適化が有効になります。

## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、マージ時に次のカラム用のデータをリモートファイルシステムから先読みします

## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

シャットダウン前に、テーブルは現在のレプリカにのみ存在するユニークなパーツが他のレプリカによってフェッチされるまで、設定された時間だけ待機します（0 の場合は無効）。

## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

この設定は廃止されており、現在は効果を持ちません。

## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 

<SettingsInfoBlock type="UInt64" default_value="100" />

この設定は廃止されており、何の効果もありません。

## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

廃止された設定であり、現在は何の効果もありません。

## write_final_mark {#write_final_mark} 

<SettingsInfoBlock type="Bool" default_value="1" />

廃止された設定であり、現在は何も行いません。

## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "デフォルトで Compact パーツ内のサブストリームに対してマークを書き込むように有効化"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定"}]}]}/>

Compact パーツ内で、カラムごとではなくサブストリームごとにマークを書き込むことを有効化します。
これにより、データパーツから個々のサブカラムを効率よく読み取ることができます。

例えば、カラム `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` は次のサブストリームにシリアライズされます:

- タプル要素 `a` の String データ用の `t.a`
- タプル要素 `b` の UInt32 データ用の `t.b`
- タプル要素 `c` の配列サイズ用の `t.c.size0`
- タプル要素 `c` の入れ子配列要素の null マップ用の `t.c.null`
- タプル要素 `c` の入れ子配列要素の UInt32 データ用の `t.c`

この設定が有効な場合、これら 5 つのサブストリームそれぞれにマークを書き込みます。つまり、必要に応じてグラニュールから各サブストリームのデータを個別に読み取ることができます。例えば、サブカラム `t.c` を読み取りたい場合は、サブストリーム `t.c.size0`、`t.c.null`、`t.c` のデータのみを読み取り、サブストリーム `t.a` および `t.b` からはデータを読み取りません。この設定が無効な場合は、
トップレベルカラム `t` に対してのみマークを書き込みます。これは、特定のサブストリームのデータだけが必要な場合でも、常にグラニュールからカラム全体のデータを読み取ることを意味します。

## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 

<SettingsInfoBlock type="Float" default_value="0.05" />

より小さな独立した範囲を得るために、削除を延期するトップレベルパーツの最大割合です。変更しないことを推奨します。

## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 

<SettingsInfoBlock type="UInt64" default_value="5" />

独立した Outdated パーツの範囲を、より小さなサブレンジに分割する際の再帰の最大深さです。変更しないことを推奨します。

## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

zero-copy レプリケーションが有効になっている場合、マージまたはミューテーション対象のパーツサイズに応じて、ロックを取得しようとする前にランダムな時間だけ待機します

## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

zero-copy レプリケーションが有効な場合、マージまたはミューテーションのロックを試行する前に、0〜500ms の範囲でランダムな時間だけスリープします。

## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 

<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper セッションの有効期限をチェックする間隔（秒単位）。

取り得る値:

- 任意の正の整数。