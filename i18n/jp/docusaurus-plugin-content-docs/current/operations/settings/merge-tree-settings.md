---
description: '`system.merge_tree_settings` にある MergeTree 用の設定'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree テーブルの設定'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

システムテーブル `system.merge_tree_settings` には、グローバルに有効な MergeTree 設定が表示されます。

MergeTree の設定は、サーバー設定ファイル内の `merge_tree` セクションで設定するか、`CREATE TABLE` 文の `SETTINGS` 句で各 `MergeTree` テーブルごとに個別に指定できます。

`max_suspicious_broken_parts` 設定をカスタマイズする例:

サーバー設定ファイル内で、すべての `MergeTree` テーブルに対するデフォルト値を設定します:

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

特定のテーブルに対する設定：

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

特定のテーブルの設定は、`ALTER TABLE ... MODIFY SETTING` を使用して変更します。

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- グローバルデフォルトにリセット（system.merge_tree_settings の値）
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## MergeTree の設定

{/* 以下の設定は、次のスクリプトにより自動生成されています
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }

## adaptive&#95;write&#95;buffer&#95;initial&#95;size

<SettingsInfoBlock type="UInt64" default_value="16384" />

アダプティブな書き込みバッファの初期サイズ


## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 
<SettingsInfoBlock type="Bool" default_value="0" />

true の場合は、CollapsingMergeTree または VersionedCollapsingMergeTree テーブルの `sign` 列に対して、
有効な値（`1` および `-1`）のみを許可する暗黙の制約を追加します。



## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>


有効にすると、テーブル内のすべての数値カラムに min-max（スキップ）インデックスが作成されます。



## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>


有効にすると、テーブル内のすべての文字列カラムに min-max（スキップ）インデックスが追加されます。



## allow_coalescing_columns_in_partition_or_order_key {#allow_coalescing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "パーティションキーまたはソートキーに coalescing 対象のカラムを含めることを許可する新しい設定です。"}]}]}/>


有効にすると、`CoalescingMergeTree` テーブル内の coalescing 対象カラムをパーティションキーまたはソートキーとして使用できるようになります。



## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

`is_deleted` カラムを持つ ReplacingMergeTree に対して、実験的な CLEANUP マージを許可します。有効化すると、`OPTIMIZE ... FINAL CLEANUP` を使用して、パーティション内のすべてのパーツを手動で 1 つのパーツにマージし、削除済み行を削除できるようになります。

また、`min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only`、`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` の各設定を使用して、この種のマージをバックグラウンドで自動的に実行できるようにもなります。



## allow&#95;experimental&#95;reverse&#95;key

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

MergeTree のソートキーで降順ソートをサポートします。
この設定は特に時系列分析や Top-N クエリに有用であり、データを逆時系列で
保存することでクエリパフォーマンスを最適化できます。

`allow_experimental_reverse_key` を有効にすると、MergeTree テーブルの
`ORDER BY` 句の中で降順ソートを定義できます。これにより、降順クエリに対して
`ReadInReverseOrder` ではなく、より効率的な `ReadInOrder` 最適化を利用できるようになります。

**例**

```sql
CREATE TABLE example
(
time DateTime,
key Int32,
value String
) ENGINE = MergeTree
ORDER BY (time DESC, key)  -- time フィールドを降順で指定
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

クエリで `ORDER BY time DESC` を指定すると、`ReadInOrder` が適用されます。

**デフォルト値:** false


## allow_floating_point_partition_key {#allow_floating_point_partition_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

パーティションキーとして浮動小数点数の使用を許可します。

取りうる値:
- `0` — 浮動小数点数のパーティションキーは許可されません。
- `1` — 浮動小数点数のパーティションキーが許可されます。



## allow_nullable_key {#allow_nullable_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

`Nullable` 型を主キーに使用することを許可します。



## allow_part_offset_column_in_projections {#allow_part_offset_column_in_projections} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "プロジェクションで _part_offset 列を使用できるようになりました。"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定です。安定するまで、親パーツの _part_offset 列を利用するプロジェクションが作成されないように保護します。"}]}]}/>


プロジェクションに対する `SELECT` クエリで `_part_offset` 列の使用を許可します。



## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "SMT は現在、デフォルトで ZooKeeper から古いブロッキングパーツを削除します"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "クラウド同期"}]}]}/>


共有 MergeTree テーブルのブロッキングパーツを減らすバックグラウンドタスクです。
ClickHouse Cloud でのみ利用可能です。



## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

本番環境ではこの設定を使用しないでください。まだ本番利用できる状態ではありません。



## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "パーティションキーまたはソートキーに対する合計列の利用を許可する新しい設定"}]}]}/>


有効にすると、SummingMergeTree テーブルの合計列をパーティションキーまたはソートキーに使用できるようになります。



## allow_suspicious_indices {#allow_suspicious_indices} 
<SettingsInfoBlock type="Bool" default_value="0" />

同一の式を使用するプライマリ/セカンダリインデックスおよびソートキーを拒否する



## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

コンパクトパーツからワイドパーツへの垂直マージを許可します。この設定は、すべてのレプリカで同一の値でなければなりません。



## alter_column_secondary_index_mode {#alter_column_secondary_index_mode} 
<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "Change the behaviour to allow ALTER `column` when they have dependent secondary indices"}]}]}/>


セカンダリインデックスによってカバーされている列を変更する `ALTER` コマンドを許可するかどうか、また許可する場合にどのような動作を行うかを設定します。デフォルトでは、このような `ALTER` コマンドは許可され、インデックスは再構築されます。

設定可能な値:
- `rebuild` (default): `ALTER` コマンド内の列によって影響を受けるすべてのセカンダリインデックスを再構築します。
- `throw`: セカンダリインデックスでカバーされている列に対するあらゆる `ALTER` を、例外をスローして禁止します。
- `drop`: 依存しているセカンダリインデックスを削除します。新しいパーツにはインデックスが存在しないため、それらを再作成するには `MATERIALIZE INDEX` が必要です。
- `compatibility`: 元の動作に合わせます: `ALTER ... MODIFY COLUMN` では `throw`、`ALTER ... UPDATE/DELETE` では `rebuild` となります。
- `ignore`: 上級者向けの設定です。インデックスを不整合な状態のままにし、誤ったクエリ結果が返される可能性があります。



## always_fetch_merged_part {#always_fetch_merged_part} 
<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、このレプリカは自らパーツをマージせず、常に他のレプリカからマージ済みパーツをダウンロードします。

使用可能な値:
- true, false



## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 
<SettingsInfoBlock type="Bool" default_value="0" />

ミューテーション、リプレース、デタッチなどの操作時には、ハードリンクではなく常にデータをコピーします。



## apply_patches_on_merge {#apply_patches_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


`true` の場合、マージ時にパッチパーツが適用されます。



## assign_part_uuids {#assign_part_uuids} 
<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、新しいパーツごとに一意のパーツ識別子が割り当てられます。
有効化する前に、すべてのレプリカが UUID バージョン 4 をサポートしていることを確認してください。



## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="100" />

各挿入イテレーションが async_block_ids_cache の更新を待機する最大時間



## async_insert {#async_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、INSERT クエリのデータはキューに格納され、その後バックグラウンドでテーブルに書き込まれます。



## auto_statistics_types {#auto_statistics_types} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新しい設定"}]}]}/>


すべての対象となるカラムで自動的に計算される統計タイプを、カンマ区切りで指定するリスト。
サポートされている統計タイプ：tdigest, countmin, minmax, uniq。



## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="50" />

マージまたはミューテーションの 1 ステップの実行時間に対する目標値。  
1 ステップの処理に時間がかかる場合は、この値を超えることがあります。



## cache_populated_by_fetch {#cache_populated_by_fetch} 
<SettingsInfoBlock type="Bool" default_value="0" />

:::note
この設定は ClickHouse Cloud にのみ適用されます。
:::

`cache_populated_by_fetch` が無効（デフォルト設定）の場合、新しいデータパーツは、
それらのパーツを必要とするクエリが実行されたときにのみキャッシュにロードされます。

有効化されている場合、`cache_populated_by_fetch` により、クエリによるトリガーを必要とせずに、
すべてのノードがストレージから新しいデータパーツをキャッシュにロードするようになります。

**関連項目**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)



## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "New setting"}]}]}/>


:::note
この設定は ClickHouse Cloud にのみ適用されます。
:::

空でない場合は、この正規表現にマッチするファイルのみが、fetch 後にキャッシュへプリウォームされます（`cache_populated_by_fetch` が有効になっている場合）。



## check_delay_period {#check_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="60" />
廃止済みの設定で、効果はありません。
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

テーブル作成時に、サンプリングまたはサンプリング式用の列のデータ型が正しいかどうかをチェックします。  
データ型は、`UInt8`、`UInt16`、`UInt32`、`UInt64` のいずれかの符号なし
[整数型](/sql-reference/data-types/int-uint) でなければなりません。

設定可能な値:
- `true`  — チェックを有効にします。
- `false` — テーブル作成時のチェックを無効にします。

デフォルト値: `true`。

デフォルトでは、ClickHouse サーバーはテーブル作成時に、サンプリングまたはサンプリング式用の列のデータ型をチェックします。すでに不正なサンプリング式を持つテーブルが存在しており、サーバーの起動時に例外がスローされるのを避けたい場合は、`check_sample_column_is_correct` を `false` に設定してください。



## clean_deleted_rows {#clean_deleted_rows} 
<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
廃止された設定で、何も行いません。
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

古いキューのログ、ブロックのハッシュおよびパーツをクリーンアップするための最小間隔。



## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />

多数のテーブルが存在する場合に、`cleanup_delay_period` に 0〜x 秒の一様分布の乱数値を加算することで、
一斉アクセス（thundering herd）による輻輳と、それに続く ZooKeeper への DoS を回避します。



## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 
<SettingsInfoBlock type="UInt64" default_value="150" />

バックグラウンドでのクリーンアップ処理における推奨バッチサイズです（ポイントは抽象的な単位ですが、1ポイントはおおよそ挿入されたブロック1個に相当します）。



## cleanup_threads {#cleanup_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
廃止された設定で、現在は何も行いません。
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "New setting to calculate columns and indices sizes lazily"}]}]}/>


テーブルの初期化時ではなく、最初のリクエスト時に列およびセカンダリインデックスのサイズを遅延的に計算します。



## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 


マークキャッシュを事前ウォームする対象のカラム一覧（この設定が有効な場合）。空の場合は全カラムが対象になります



## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="134217728" />

ClickHouse Cloud でのみ利用可能です。コンパクトパーツ内で 1 つのストライプに書き込むバイト数の最大値です。



## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="128" />

ClickHouse Cloud でのみ利用可能です。コンパクトパーツ内で 1 つのストライプに書き込むグラニュール数の上限を指定します。



## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 
<SettingsInfoBlock type="UInt64" default_value="16777216" />

ClickHouse Cloud でのみ利用可能です。マージ処理中にコンパクトパーツ全体をメモリに読み込む際の最大サイズ。



## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

サンプリング式がプライマリキーに含まれていないテーブルを作成できるようにします。これは、後方互換性のために、誤った定義のテーブルを含むサーバーを一時的に稼働させる必要がある場合にのみ利用します。



## compress_marks {#compress_marks} 
<SettingsInfoBlock type="Bool" default_value="1" />

マークの圧縮をサポートし、マークファイルのサイズを削減してネットワーク転送を高速化します。



## compress_primary_key {#compress_primary_key} 
<SettingsInfoBlock type="Bool" default_value="1" />

主キーの圧縮をサポートし、主キーのファイルサイズを削減してネットワーク転送を高速化します。



## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 
<SettingsInfoBlock type="UInt64" default_value="100" />

非アクティブなデータパーツ数がこの値以上の場合にのみ、
パーツの並行削除（`max_part_removal_threads` を参照）を有効化します。



## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 
<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "不整合なプロジェクションの作成を許可しない"}]}]}/>


クラシックではない MergeTree、すなわち (Replicated, Shared) MergeTree ではない MergeTree を使用するテーブルに対して、プロジェクションの作成を許可するかどうかを指定します。`ignore` オプションは互換性維持のためだけに存在し、誤った結果をもたらす可能性があります。作成を許可する場合、マージ時にプロジェクションをドロップするか再構築するか、どのアクションを取るかを指定します。クラシックな MergeTree はこの設定を無視します。この設定は `OPTIMIZE DEDUPLICATE` にも影響し、MergeTree ファミリーのすべてのメンバーに適用されます。`lightweight_mutation_projection_mode` オプションと同様に、パーツ単位の設定です。

設定可能な値:
- `ignore`
- `throw`
- `drop`
- `rebuild`



## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>


テーブル定義で特定のカラムに対して圧縮コーデックが定義されていない場合に使用される、デフォルトの圧縮コーデックを指定します。
カラムに対する圧縮コーデックが選択される優先順位:
1. テーブル定義内でそのカラムに対して定義された圧縮コーデック
2. `default_compression_codec`（この設定）で定義された圧縮コーデック
3. `compression` 設定で定義されたデフォルトの圧縮コーデック  

デフォルト値: 空文字列（未設定）。



## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

マージまたはミューテーションの後に、他のレプリカ上のデータパーツとバイトレベルで同一ではない場合、そのレプリカ上のデータパーツをデタッチするかどうかを有効または無効にします。無効の場合、データパーツは削除されます。そのようなパーツを後で分析したい場合は、この設定を有効にします。

この設定は、[データレプリケーション](/engines/table-engines/mergetree-family/replacingmergetree) を有効にした `MergeTree` テーブルに適用されます。

設定可能な値:

- `0` — パーツを削除します。
- `1` — パーツをデタッチします。



## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 
<SettingsInfoBlock type="Bool" default_value="1" />

失われたレプリカを修復する際に、古いローカルパーツを削除しないようにします。

取り得る値:
- `true`
- `false`



## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピーレプリケーションに対する `DETACH PARTITION` クエリを無効にします。



## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピー レプリケーションでの `FETCH PARTITION` クエリを無効化します。



## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピーレプリケーションでの `FREEZE PARTITION` クエリを無効にします。



## disk {#disk} 


ストレージディスクの名前。`storage_policy` の代わりに指定できます。



## dynamic_serialization_version {#dynamic_serialization_version} 
<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Dynamic データ型のシリアル化バージョンを制御する設定を追加"}]}]}/>


Dynamic データ型のシリアル化バージョン。互換性を保つために必要です。

設定可能な値:
- `v1`
- `v2`
- `v3`



## enable_block_number_column {#enable_block_number_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

各行ごとに `_block_number` 列を永続化します。



## enable_block_offset_column {#enable_block_offset_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

マージ時に仮想カラム `_block_number` を永続化します。



## enable_index_granularity_compression {#enable_index_granularity_compression} 
<SettingsInfoBlock type="Bool" default_value="1" />

可能な場合は、インデックス粒度の値をメモリ上で圧縮します



## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "min_age_to_force_merge 用の最大バイト数を制限する新しい設定を追加しました。"}]}]}/>


設定 `min_age_to_force_merge_seconds` および
`min_age_to_force_merge_on_partition_only` が、設定
`max_bytes_to_merge_at_max_space_in_pool` に従うかどうかを制御します。

設定可能な値:
- `true`
- `false`



## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

`index_granularity_bytes` 設定を使用してグラニュールサイズを制御するモードへの切り替えを有効または無効にします。バージョン 19.11 より前は、グラニュールサイズを制限するための設定は `index_granularity` のみでした。
`index_granularity_bytes` 設定は、大きな行（数十〜数百メガバイト）を含むテーブルからデータを選択する場合に、ClickHouse のパフォーマンスを向上させます。
行サイズの大きいテーブルがある場合は、そのテーブルに対してこの設定を有効にすると、`SELECT` クエリの効率を改善できます。



## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "ReplacingMergeTree 向けの自動 CLEANUP マージを許可する新しい設定"}]}]}/>


パーティションを単一のパーツにマージする際に、ReplacingMergeTree に対して CLEANUP マージを使用するかどうかを指定します。`allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` を有効にしておく必要があります。

指定可能な値:
- `true`
- `false`



## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 
<SettingsInfoBlock type="Bool" default_value="0" />

レプリケーテッド MergeTree テーブルで、ZooKeeper 名のプレフィックス付きエンドポイント ID を有効にします。



## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 
<SettingsInfoBlock type="UInt64" default_value="1" />

Vertical マージアルゴリズムの使用を有効にします。



## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


パーティション操作クエリ（`ATTACH/MOVE/REPLACE PARTITION`）の宛先テーブルに対してこの設定を有効にすると、インデックスとプロジェクションは元のテーブルと宛先テーブルで同一である必要があります。無効な場合は、宛先テーブルのインデックスおよびプロジェクションは元のテーブルの上位集合であってもかまいません。



## escape_variant_subcolumn_filenames {#escape_variant_subcolumn_filenames} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Wide パーツ内の Variant 型サブカラム用に作成されるファイル名の特殊文字をエスケープする"}]}]}/>


MergeTree テーブルの Wide パーツにおける Variant データ型のサブカラム用に作成されるファイル名内の特殊文字をエスケープします。互換性維持のために必要です。



## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、パーツをマージする際に、データパーツの実効サイズの推定値（つまり、`DELETE FROM` によって削除された行を除いたサイズ）が使用されます。なお、この挙動が適用されるのは、この設定を有効にした後に実行された `DELETE FROM` によって影響を受けたデータパーツのみです。

可能な値:
- `true`
- `false`

**関連項目**
- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts) 設定



## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;merge

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新しい設定。"}]}]} />

マージ処理中に構築および保存される対象から、カンマ区切りリストで指定されたスキップインデックスを除外します。
[materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge) が `false` の場合は効果がありません。

除外されたスキップインデックスも、明示的な
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) クエリ、または
[materialize&#95;skip&#95;indexes&#95;on&#95;insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)
セッション設定に応じて INSERT 時にも構築および保存されます。

例:

```sql
CREATE TABLE tab
(
a UInt64,
b UInt64,
INDEX idx_a a TYPE minmax,
INDEX idx_b b TYPE set(3)
)
ENGINE = MergeTree ORDER BY tuple() SETTINGS exclude_materialize_skip_indexes_on_merge = 'idx_a';

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- この設定はINSERT時には影響しません

-- idx_aはバックグラウンドマージまたはOPTIMIZE TABLE FINALによる明示的なマージ中の更新から除外されます

-- リストを指定することで複数のインデックスを除外できます
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- デフォルト設定、マージ中の更新から除外されるインデックスはありません
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```


## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="0" />

この設定が 0 より大きい値に設定されている場合、1 つのレプリカのみが直ちにマージを開始し、他のレプリカはローカルでマージを実行する代わりに、その時間まで結果のダウンロードを待機します。選択されたレプリカがその時間内にマージを完了しない場合は、標準的な動作にフォールバックします。

可能な値:
- 任意の正の整数。



## fault_probability_after_part_commit {#fault_probability_after_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

テスト目的の設定です。変更しないでください。



## fault_probability_before_part_commit {#fault_probability_before_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

テスト目的の設定です。変更しないでください。



## finished_mutations_to_keep {#finished_mutations_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="100" />

完了したミューテーションに関する記録をいくつ保持するかを指定します。0 の場合は、すべてを保持します。



## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

マージ時の読み取りを必ずファイルシステムキャッシュ経由にする



## fsync_after_insert {#fsync_after_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

挿入された各パーツに対して `fsync` を実行します。  
挿入処理のパフォーマンスを大幅に低下させるため、`wide parts` との併用は推奨されません。



## fsync_part_directory {#fsync_part_directory} 
<SettingsInfoBlock type="Bool" default_value="0" />

すべてのパート操作（書き込み、リネームなど）の完了後に、パートディレクトリに対して `fsync` を実行します。



## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 
<SettingsInfoBlock type="Bool" default_value="1" />
廃止された設定であり、効果はありません。
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
廃止された設定であり、効果はありません。
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

テーブル内の単一パーティションに存在する非アクティブなパーツの数が
`inactive_parts_to_delay_insert` の値を超えた場合、`INSERT` は意図的に
遅延されます。

:::tip
サーバーがパーツを十分な速度でクリーンアップできない場合に有用です。
:::

可能な値:
- 任意の正の整数。



## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

単一パーティション内の非アクティブパーツの数が
`inactive_parts_to_throw_insert` の値を超えると、`INSERT` は次のエラーで中断されます:

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts" exception."

設定可能な値:
- 任意の正の整数。



## index_granularity {#index_granularity} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

インデックスのマーク間に含めることのできるデータ行の最大数です。つまり、1 つのプライマリキー値に対応する行数です。



## index_granularity_bytes {#index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

データグラニュールの最大サイズ（バイト単位）。

グラニュールのサイズを行数のみで制限するには、`0` を設定します（推奨されません）。



## initialization_retry_period {#initialization_retry_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

テーブルの初期化を再試行する間隔（秒）。



## kill_delay_period {#kill_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />
廃止された設定であり、何も行いません。
## kill_delay_period_random_add {#kill_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />
廃止された設定であり、何も行いません。
## kill_threads {#kill_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
廃止された設定であり、何も行いません。
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 
<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

デフォルトでは、軽量な削除 `DELETE` はプロジェクションを持つテーブルでは動作しません。これは、プロジェクション内の行が `DELETE` 操作の影響を受ける可能性があるためです。そのため、デフォルト値は `throw` になっています。ただし、この設定で動作を変更できます。値を `drop` または `rebuild` のいずれかにすると、プロジェクションを持つテーブルでも削除が動作するようになります。`drop` はプロジェクション自体を削除するため、現在のクエリではプロジェクション削除分だけ高速になる可能性がありますが、その後はプロジェクションが存在しないため、将来のクエリが低速になる可能性があります。`rebuild` はプロジェクションを再構築するため、現在のクエリのパフォーマンスに影響を与える可能性がありますが、将来のクエリは高速化される可能性があります。なお、これらのオプションはパーツ単位でのみ動作します。つまり、対象にならないパーツ内のプロジェクションは、そのまま保持され、`drop` や `rebuild` のようなアクションはトリガーされません。

可能な値:
- `throw`
- `drop`
- `rebuild`



## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

[exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) と併せて有効化すると、
既存のデータパーツに対する削除済み行数がテーブルの
起動時に計算されます。テーブル起動時の読み込みが遅くなる可能性がある点に注意してください。

設定可能な値:
- `true`
- `false`

**関連項目**
- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 設定



## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 
<SettingsInfoBlock type="Seconds" default_value="120" />

マージやミューテーションなどのバックグラウンド処理において、テーブルロックの取得を失敗とみなすまでの秒数。



## marks_compress_block_size {#marks_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

マークの圧縮ブロックサイズであり、圧縮されるブロックの実際のサイズです。



## marks_compression_codec {#marks_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

マークに使用される圧縮コーデックです。マークは十分に小さくキャッシュされるため、デフォルトの圧縮方式は ZSTD(3) です。



## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "新しい設定"}]}]}/>


有効にすると、マージ処理時に新しいパーツに対してスキップインデックスを構築して保存します。
無効な場合、スキップインデックスは明示的な [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
または [INSERT 時](/operations/settings/settings.md/#materialize_skip_indexes_on_insert) に作成・保存されます。

より細かく制御するには [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) も参照してください。



## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

MATERIALIZE TTL 実行時にのみ TTL 情報を再計算します



## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

`parts_to_delay_insert` と `parts_to_throw_insert` に基づく「too many parts」チェックは、該当するパーティション内の平均パーツサイズが指定したしきい値以下の場合にのみ有効になります。平均パーツサイズが指定したしきい値を超える場合、INSERT は遅延も拒否もされません。これにより、パーツがより大きなパーツへと正常にマージされている限り、単一サーバー上の単一テーブルに数百テラバイトのデータを保持することができます。これは、非アクティブなパーツ数やパーツ総数に基づくしきい値には影響しません。



## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="161061273600" />

十分なリソースが利用可能な場合に、1 つのパーツへマージされるパーツ全体の最大サイズ（バイト単位）。自動バックグラウンドマージによって作成されうるパーツの最大サイズのおおよその上限に相当します。（0 の場合、マージは無効化されます）

設定可能な値:

- 0 以上の整数。

マージスケジューラは定期的にパーティション内のパーツのサイズと数を分析し、プール内に十分な空きリソースがある場合はバックグラウンドマージを開始します。マージは、ソースパーツの合計サイズが `max_bytes_to_merge_at_max_space_in_pool` を超えるまで実行されます。

[OPTIMIZE FINAL](/sql-reference/statements/optimize) によって開始されるマージは `max_bytes_to_merge_at_max_space_in_pool` を無視します（空きディスク容量のみが考慮されます）。



## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="1048576" />

バックグラウンドプール内で使用可能なリソースが最小限しかない場合に、1 つのパートへマージできるパート全体の最大サイズ（バイト数）。

設定可能な値:
- 任意の正の整数。

`max_bytes_to_merge_at_min_space_in_pool` は、（プール内の）利用可能なディスク容量が不足していてもマージ可能なパートの合計サイズの上限を定義します。これは、小さなパートの数と `Too many parts` エラーが発生する可能性を減らすために必要です。
マージ処理は、マージ対象パートの合計サイズを 2 倍したディスク容量を事前に確保します。
そのため、空きディスク容量が少ない場合には、空き容量自体は存在していても、その容量が進行中の大きなマージ処理によってすでに確保されているため、他のマージを開始できず、挿入のたびに小さなパートの数が増加していく状況が発生する可能性があります。



## max_cleanup_delay_period {#max_cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="300" />

古いキューログ、ブロックハッシュ、およびパーツをクリーンアップするまでの最大期間。



## max_compress_block_size {#max_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルへの書き込み時に、圧縮を行う前の非圧縮データブロックの最大サイズです。この設定はグローバル設定でも指定できます（[max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size) 設定を参照）。テーブル作成時に指定した値は、この設定のグローバル値を上書きします。



## max&#95;concurrent&#95;queries

<SettingsInfoBlock type="UInt64" default_value="0" />

MergeTree テーブルに関連するクエリの同時実行数の上限。
クエリ数は、他の `max_concurrent_queries` 設定によっても引き続き制限されます。

設定可能な値:

* 正の整数。
* `0` — 制限なし。

デフォルト値: `0`（制限なし）。

**例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```


## max&#95;delay&#95;to&#95;insert

<SettingsInfoBlock type="UInt64" default_value="1" />

単位は秒で、1つのパーティション内のアクティブパーツ数が
[parts&#95;to&#95;delay&#95;insert](#parts_to_delay_insert) の値を超えた場合に、
`INSERT` の遅延時間を計算するために使用されます。

設定可能な値:

* 任意の正の整数。

`INSERT` の遅延時間 (ミリ秒単位) は次の式で計算されます:

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

例えば、あるパーティションにアクティブなパーツが 299 個あり、parts&#95;to&#95;throw&#95;insert = 300、parts&#95;to&#95;delay&#95;insert = 150、max&#95;delay&#95;to&#95;insert = 1 の場合、`INSERT` は `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` ミリ秒遅延されます。

バージョン 23.1 以降では、この式は次のように変更されました。

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

たとえば、あるパーティションに 224 個のアクティブなパーツがあり、parts&#95;to&#95;throw&#95;insert = 300、parts&#95;to&#95;delay&#95;insert = 150、max&#95;delay&#95;to&#95;insert = 1、min&#95;delay&#95;to&#95;insert&#95;ms = 10 の場合、`INSERT` の実行は `max( 10, 1 * 1000 * (224 - 150 + 1) / (300 - 150) ) = 500` ミリ秒だけ遅延します。


## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

未完了のミューテーションが多数存在する場合に、MergeTree テーブルへのミューテーション適用を遅延させる最大時間（ミリ秒単位）



## max_digestion_size_per_segment {#max_digestion_size_per_segment} 
<SettingsInfoBlock type="UInt64" default_value="268435456" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "廃止された設定"}]}]}/>



廃止された設定であり、何も行いません。
## max_file_name_length {#max_file_name_length} 
<SettingsInfoBlock type="UInt64" default_value="127" />

ファイル名をハッシュせず、そのまま保持できる最大の長さ。
設定 `replace_long_file_name_to_hash` が有効な場合にのみ有効です。
この設定値にはファイル拡張子の長さは含まれません。そのため、
ファイルシステムエラーを避けるために、最大ファイル名長（通常は255バイト）
よりいくらか余裕を持って小さい値に設定することを推奨します。



## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="75" />

変更（削除、追加）の対象となるファイル数がこの設定値を超える場合は、ALTER を適用しないでください。

取りうる値:

- 任意の正の整数。

デフォルト値: 75



## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="50" />

削除対象となるファイル数がこの設定値より多い場合、ALTER は適用されません。

可能な値:
- 任意の正の整数。



## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 
<SettingsInfoBlock type="UInt64" default_value="40" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>


並列でフラッシュ処理を行えるストリーム（カラム）の最大数です
（マージにおける max_insert_delayed_streams_for_parallel_write の類似設定）。Vertical マージに対してのみ有効です。



## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />

マージ対象のパーツが一つも選択されなかった後に、再度マージ対象のパーツを選択しようとするまで待機する最大時間。値を小さくすると、`background_schedule_pool` でのタスク選択が頻繁にトリガーされ、大規模クラスターでは ZooKeeper へのリクエストが大量に発生する可能性があります。



## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="2" />
プール内の TTL を伴うマージ数が指定値を超えている場合、新たな TTL 付きマージは割り当てません。これは通常のマージ用にスレッドを確保し、"Too many parts" エラーを回避するためです。



## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 
<SettingsInfoBlock type="UInt64" default_value="0" />

レプリカごとのパーツのミューテーション数を、指定した値に制限します。
0 の場合、レプリカごとのミューテーション数に上限はありません（ただし、実行自体は他の設定によって制限される場合があります）。



## max_part_loading_threads {#max_part_loading_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
廃止されており、現在は効果のない設定です。
## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
廃止されており、現在は効果のない設定です。
## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

1 つのクエリでアクセスできるパーティション数の上限を設定します。

テーブル作成時に指定した設定値は、クエリレベルの設定によって上書きできます。

設定可能な値は次のとおりです:
- 任意の正の整数。

クエリ / セッション / プロファイルレベルで、クエリの複雑さに関する設定 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read) を指定することもできます。



## max_parts_in_total {#max_parts_in_total} 
<SettingsInfoBlock type="UInt64" default_value="100000" />

テーブルのすべてのパーティションにおけるアクティブなパーツの合計数が
`max_parts_in_total` の値を超える場合、`INSERT` は `Too many parts
(N)` という例外とともに中断されます。

設定可能な値:
- 任意の正の整数。

テーブル内のパーツ数が多すぎると、ClickHouse クエリのパフォーマンスが低下し、
ClickHouse の起動時間も長くなります。多くの場合、これは誤った設計
（パーティショニング戦略の選択ミスによりパーティションが小さすぎること）
の結果として発生します。



## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="100" />

一度にマージ可能なパーツの最大数（0 で無効化）。  
`OPTIMIZE FINAL` クエリには影響しません。



## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />

失敗したミューテーションを延期する最大時間。



## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "レプリケーションキュー内のフェッチタスクを延期できるようにする新しい設定を追加。"}]}]}/>


失敗したレプリケートフェッチの実行を延期できる最大時間。



## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "レプリケーションキュー内のマージタスクを延期できる新しい設定を追加しました。"}]}]}/>


失敗したレプリケートマージを延期できる最大時間。



## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "Added new setting to enable postponing tasks in the replication queue."}]}]}/>


失敗したレプリケーションタスクを延期する最大時間。タスクが fetch、merge、または mutation でない場合にこの値が適用されます。



## max_projections {#max_projections} 
<SettingsInfoBlock type="UInt64" default_value="25" />

MergeTree プロジェクションの最大数。



## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク上でのデータ交換速度の上限を、[replicated](../../engines/table-engines/mergetree-family/replication.md)
フェッチに対して 1 秒あたりのバイト数で制限します。この設定は特定のテーブルに適用されます。一方で
[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)
設定はサーバーレベルで適用されます。

サーバーレベルとテーブル単位の両方でネットワーク帯域を制限できますが、その場合は
テーブルレベルの設定値をサーバーレベルの設定値よりも小さくする必要があります。そうでない場合は、
サーバーは `max_replicated_fetches_network_bandwidth_for_server` 設定のみを考慮します。

この設定値は厳密に守られるわけではありません。

設定可能な値:

- 正の整数。
- `0` — 無制限。

デフォルト値: `0`。

**使用例**

新しいノードの追加や置き換えのためにデータをレプリケートする際に、速度を制限する目的で使用できます。



## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

非アクティブなレプリカが存在する場合に、ClickHouse Keeper ログ内に保持される可能性があるレコード数。  
この値を超えると、非アクティブなレプリカは失われたものと見なされます。

指定可能な値:
- 任意の正の整数。



## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

ReplicatedMergeTree のキュー内で、パーツのマージおよびミューテーションのタスクを同時に実行できる最大数を指定します。



## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1" />

ReplicatedMergeTree のキュー内で、TTL を伴うパーツのマージ処理を同時に実行できる最大数を指定します。



## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="8" />

ReplicatedMergeTree のキュー内で、パーツに対する mutation タスクを同時にいくつまで許可するかを指定します。



## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク経由でのデータ交換の最大速度を、1 秒あたりのバイト数で
[replicated](/engines/table-engines/mergetree-family/replacingmergetree)
テーブルでの送信について制限します。[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth)
設定がサーバー全体に適用されるのに対し、この設定は特定のテーブルに
適用されます。

サーバーレベルのネットワーク帯域と特定テーブルの両方に制限を設定できますが、
その場合、テーブルレベルの設定値はサーバーレベルの設定値よりも小さく
なければなりません。そうでない場合、サーバーは
`max_replicated_sends_network_bandwidth_for_server` 設定のみを考慮します。

この設定は厳密に守られるわけではありません。

可能な値:

- 正の整数。
- `0` — 無制限。

**使用方法**

新しいノードの追加または置き換えのためにデータをレプリケーションする際に、
送信速度を制限する用途で使用できます。



## max_suspicious_broken_parts {#max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="100" />

1 つのパーティション内の破損パーツの数が
`max_suspicious_broken_parts` の値を超えると、自動削除は行われません。

設定可能な値:
- 任意の正の整数。



## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

破損したすべてのパーツの最大サイズ。この値を超える場合は、自動削除を行いません。

指定可能な値:
- 任意の正の整数。



## max_uncompressed_bytes_in_patches {#max_uncompressed_bytes_in_patches} 
<SettingsInfoBlock type="UInt64" default_value="32212254720" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "New setting"}]}]}/>


すべてのパッチパーツ内のデータの未圧縮サイズ合計の上限（バイト単位）。
すべてのパッチパーツ内のデータ量がこの値を超えると、lightweight update は拒否されます。
0 の場合は無制限。



## merge_max_block_size {#merge_max_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

マージされたパーツからメモリに読み込まれる行数です。

設定可能な値:
- 任意の正の整数。

マージ処理では、パーツから `merge_max_block_size` 行ずつブロック単位で行を読み込み、
それらをマージして結果を新しいパーツに書き込みます。読み込まれたブロックは RAM 上に
保持されるため、`merge_max_block_size` はマージに必要な RAM 容量に影響します。
そのため、非常に幅の広い行を持つテーブルでは、マージが大量の RAM を消費する可能性があります
（平均行サイズが 100kb で 10 個のパーツをマージする場合、
(100kb * 10 * 8192) = 約 8GB の RAM が必要になります）。`merge_max_block_size` を小さくすると、
マージに必要な RAM 量を減らすことができますが、マージ処理は遅くなります。



## merge_max_block_size_bytes {#merge_max_block_size_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

マージ処理時に生成するブロックのバイト数を指定します。デフォルトでは
`index_granularity_bytes` と同じ値になります。



## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>


ClickHouse Cloud でのみ利用可能です。マージ処理中にキャッシュを事前にウォームアップする対象となるパーツ（compact または packed）の最大サイズを指定します。



## merge_max_dynamic_subcolumns_in_wide_part {#merge_max_dynamic_subcolumns_in_wide_part} 
<SettingsInfoBlock type="UInt64Auto" default_value="auto" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "マージ後の Wide パートにおいて、データ型で指定されたパラメータに関係なく動的サブカラム数を制限する新しい設定を追加"}]}]}/>


マージ後の Wide データパートにおいて、各カラムで作成可能な動的サブカラムの最大数を指定します。
この設定により、データ型で指定された動的パラメータに関係なく、Wide データパート内で作成されるファイル数を削減できます。

例えば、テーブルに JSON(max_dynamic_paths=1024) 型のカラムがあり、設定 `merge_max_dynamic_subcolumns_in_wide_part` が 128 に設定されている場合、
Wide データパートへのマージ後、このパートにおける動的パスの数は 128 に削減され、動的サブカラムとして書き込まれるパスも 128 個のみになります。



## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />

パーツが1つも選択されなかった場合に、マージ対象のパーツを再度選択しようとするまで待機する最小時間です。設定値を低くすると、background_schedule_pool でのタスク選択が頻繁にトリガーされ、その結果、大規模クラスターでは ZooKeeper へのリクエストが大量に発生します。



## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 
<SettingsInfoBlock type="Float" default_value="1.2" />

マージ選択タスクのスリープ時間は、マージするものがない場合にはこの係数を掛けて増加させ、マージが割り当てられたときにはこの係数で割って短縮します。



## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>
<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

マージの割り当てに使用するパーツ選択アルゴリズム



## merge_selector_base {#merge_selector_base} 
<SettingsInfoBlock type="Float" default_value="5" />
割り当てられたマージ処理の書き込み増幅に影響します（上級者向けの設定です。動作を理解していない場合は変更しないでください）。Simple および StochasticSimple マージセレクタで有効です。



## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 
<SettingsInfoBlock type="UInt64" default_value="0" />

パーティション内のパーツ数に対して、このロジックが有効になるタイミングを制御します。係数が大きいほど、反応はより遅くなります。



## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 
<SettingsInfoBlock type="Bool" default_value="1" />

マージ対象のパーツを選択する際に、範囲の右側にあるパーツのうち、そのサイズが合計サイズ `sum_size` の指定された比率 (0.01) 未満のものを対象から除外するヒューリスティックを有効にします。
`Simple` および `StochasticSimple` マージセレクタで動作します。



## merge_selector_window_size {#merge_selector_window_size} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

一度に確認するパーツの数。



## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="16106127360" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>


ClickHouse Cloud でのみ利用可能です。マージ処理中にキャッシュをプリウォームする対象パーツの合計最大サイズです。



## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 
<SettingsInfoBlock type="UInt64" default_value="2592000" />
非推奨の設定であり、現在は何も行いません。
## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

古いパーツ、WAL、および mutation のクリーンアップを ClickHouse が実行する間隔（秒）を設定します。

可能な値:
- 任意の正の整数。



## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="60" />

ClickHouse が古い一時ディレクトリのクリーンアップを実行するための間隔（秒単位）を設定します。

設定可能な値:
- 任意の正の整数値



## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定で、何も行いません。
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

再圧縮 TTL を伴うマージを再実行するまでの最小遅延時間（秒単位）。



## merge_with_ttl_timeout {#merge_with_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

削除 TTL を伴うマージを再実行するまでの最小待機時間（秒）。



## merge_workload {#merge_workload} 


マージ処理と他のワークロードとの間で、リソースの使用および共有方法を制御するために使用されます。指定した値は、このテーブルのバックグラウンドマージに対する `workload` 設定値として用いられます。指定されていない場合（空文字列の場合）は、サーバー設定の `merge_workload` の値が代わりに使用されます。

**関連項目**
- [Workload Scheduling](/operations/workload-scheduling.md)



## min_absolute_delay_to_close {#min_absolute_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="0" />

リクエストの処理を停止し、ステータスチェック中に `Ok` を返さず、接続をクローズするまでの最小の絶対遅延時間。



## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

`min_age_to_force_merge_seconds` を、パーティションの一部ではなくパーティション全体に対してのみ適用するかどうかを制御します。

デフォルトでは、設定 `max_bytes_to_merge_at_max_space_in_pool` を無視します（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

取りうる値:
- true, false



## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 
<SettingsInfoBlock type="UInt64" default_value="0" />

範囲内のすべてのパーツが `min_age_to_force_merge_seconds` の値よりも古い場合に、これらのパーツをマージします。

デフォルトでは、設定 `max_bytes_to_merge_at_max_space_in_pool` を無視します
（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

設定可能な値:
- 正の整数。



## min_bytes_for_compact_part {#min_bytes_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定であり、現在は効果がありません。
## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud でのみ利用可能です。データパートをパック形式ではなく
フルなストレージ形式で保存するための、非圧縮サイズ（バイト単位）の最小値です。



## min_bytes_for_wide_part {#min_bytes_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

`Wide` 形式で保存できるデータパート内の最小バイト数／行数です。これらの設定は、一方のみ、両方とも、あるいはいずれも設定しないことができます。



## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


新しいパーツに対してマークキャッシュおよびプライマリインデックスキャッシュを事前にウォームアップするための、非圧縮時のバイト数による最小サイズ。



## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 
<SettingsInfoBlock type="UInt64" default_value="0" />

新しい大きなパーツをボリューム内のディスク [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) に分散配置する際に、バランシングを有効にするための最小バイト数を設定します。

設定可能な値:

- 正の整数。
- `0` — バランシングを無効にします。

**使用方法**

`min_bytes_to_rebalance_partition_over_jbod` 設定の値は、
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024 の値より小さくしてはいけません。そうでない場合、ClickHouse は例外をスローします。



## min_compress_block_size {#min_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

次のマークを書き込む際に圧縮を行うために必要となる、非圧縮データブロックの最小サイズです。  
この設定はグローバル設定でも指定できます  
（[min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size) 設定を参照）。  
テーブル作成時に指定した値は、この設定に対するグローバル値を上書きします。



## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 
<SettingsInfoBlock type="UInt64" default_value="0" />

フェッチ後のパーツに対して `fsync` を実行する際の、圧縮済みデータの最小バイト数（0 の場合は無効）



## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

マージ後のパーツに対して `fsync` を実行するための、圧縮済みバイト数の最小値（0 の場合は無効）



## min_delay_to_insert_ms {#min_delay_to_insert_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

単一パーティション内に多数の未マージパーツが存在する場合に適用される、MergeTree テーブルへのデータ挿入の最小遅延時間（ミリ秒単位）。



## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

未完了の mutation が多数存在する場合に、MergeTree テーブルへの mutation を実行するまでの最小遅延時間（ミリ秒単位）



## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

データを挿入するために、ディスクの空き容量として必要な最小バイト数を指定します。利用可能な空きバイト数が
`min_free_disk_bytes_to_perform_insert` より少ない場合は例外がスローされ、
挿入は実行されません。この設定についての注意点は次のとおりです。
- `keep_free_space_bytes` 設定を考慮します。
- `INSERT` 操作によって書き込まれるデータ量は考慮しません。
- 正の（ゼロではない）バイト数が指定されている場合にのみチェックされます。

取りうる値:
- 任意の正の整数。

:::note
`min_free_disk_bytes_to_perform_insert` と `min_free_disk_ratio_to_perform_insert`
の両方が指定されている場合、ClickHouse はより多くの空きディスク容量で
挿入を実行できる値を採用します。
:::



## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 
<SettingsInfoBlock type="Float" default_value="0" />

`INSERT` を実行するために必要な、空きディスク容量とディスク総容量の比率の最小値です。0 から 1 の間の浮動小数点値である必要があります。なお、この設定には次の特徴があります:
- `keep_free_space_bytes` 設定を考慮します。
- `INSERT` 操作によって書き込まれるデータ量は考慮しません。
- 正の（ゼロ以外の）比率が指定されている場合にのみチェックされます。

取りうる値:
- Float, 0.0 - 1.0

`min_free_disk_ratio_to_perform_insert` と
`min_free_disk_bytes_to_perform_insert` の両方が指定されている場合、ClickHouse は、より多くの空きディスク容量を確保できる方の値を採用します。



## min_index_granularity_bytes {#min_index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1024" />

データグラニュールの許容される最小サイズ（バイト単位）。

`index_granularity_bytes` が極端に小さいテーブルを誤って作成してしまうことを防ぐための保護機構です。



## min_level_for_full_part_storage {#min_level_for_full_part_storage} 
<SettingsInfoBlock type="UInt32" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>


ClickHouse Cloud でのみ利用可能です。データパートに対して、packed ではなく full タイプのストレージ形式を使用するための最小のパートレベルです。



## min_level_for_wide_part {#min_level_for_wide_part} 
<SettingsInfoBlock type="UInt32" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>


`Compact` 形式ではなく `Wide` 形式でデータパートを作成する際の、パートレベルの最小値。



## min&#95;marks&#95;to&#95;honor&#95;max&#95;concurrent&#95;queries

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリに対して [`max&#95;concurrent&#95;queries`](#max_concurrent_queries)
設定を適用するために、クエリが読み取る必要があるマーク数の最小値です。

:::note
クエリは他の `max_concurrent_queries` 設定によっても引き続き制限されます。
:::

設定可能な値:

* 正の整数。
* `0` — 無効（`max_concurrent_queries` 制限はどのクエリにも適用されません）。

**例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```


## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

ストレージディスクへの direct I/O アクセスを使用するために必要な、マージ処理における最小データ量です。データパーツをマージする際、ClickHouse はマージ対象となるすべてのデータの合計ストレージ容量を計算します。容量が `min_merge_bytes_to_use_direct_io` バイトを超える場合、ClickHouse は direct I/O インターフェイス（`O_DIRECT` オプション）を使用してストレージディスクに対してデータを読み書きします。
`min_merge_bytes_to_use_direct_io = 0` の場合、direct I/O は無効になります。



## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="0" />

マージセレクタが一度にマージ対象として選択できるデータパーツ数の最小値
（上級者向けの設定です。動作を理解していない場合は変更しないでください）。
0 - 無効。Simple および StochasticSimple マージセレクタで使用されます。



## min_relative_delay_to_close {#min_relative_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="300" />

他のレプリカとの差分遅延の最小値。この値を超えると、そのレプリカはクローズされ、リクエストの処理を停止し、ステータスチェック時に OK を返さなくなります。



## min_relative_delay_to_measure {#min_relative_delay_to_measure} 
<SettingsInfoBlock type="UInt64" default_value="120" />

絶対的な遅延がこの値以上の場合にのみ、レプリカの相対遅延を計算します。



## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 
<SettingsInfoBlock type="UInt64" default_value="120" />
廃止された設定であり、何も行いません。
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

ZooKeeper のログで、最後のレコードをおおよそこの数だけ保持します。レコードが
古くなっていても保持されます。テーブルの動作には影響せず、ZooKeeper ログを
クリーンアップする前の診断にのみ使用されます。

取り得る値:
- 任意の正の整数。



## min_rows_for_compact_part {#min_rows_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定で、現在は効果がありません。
## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud でのみ利用可能です。データパートに対して、パック形式ではなくフルタイプのストレージを使用するための最小行数。



## min_rows_for_wide_part {#min_rows_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />

`Compact` 形式ではなく `Wide` 形式でデータパートを作成するための最小行数。



## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

マージ後のパートに対して fsync を実行する際の最小行数（0 で無効）



## mutation_workload {#mutation_workload} 


ミューテーションとその他のワークロード間で、リソースの使用および共有をどのように行うかを調整するために使用します。指定した値は、このテーブルのバックグラウンドミューテーションに対する `workload` 設定値として使用されます。指定されていない場合（空文字列が指定された場合）は、代わりにサーバー設定の `mutation_workload` が使用されます。

**関連項目**
- [Workload Scheduling](/operations/workload-scheduling.md)



## non_replicated_deduplication_window {#non_replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="0" />

レプリケーションなしの
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルで、
重複チェックのためにハッシュサムを保持する、直近で挿入されたブロック数。

設定可能な値:
- 任意の正の整数。
- `0`（重複排除を無効化）。

レプリケートテーブルで使用されるものと同様の重複排除メカニズム（[replicated_deduplication_window](#replicated_deduplication_window) 設定を参照）が使用されます。
作成されたパーツのハッシュサムは、ディスク上のローカルファイルに書き込まれます。



## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


最新のブロック番号を SharedJoin または SharedSet に通知します。ClickHouse Cloud でのみ利用可能です。



## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 
<SettingsInfoBlock type="UInt64" default_value="20" />

プール内の空きエントリ数が指定値未満の場合、パーツに対するミューテーションを実行しません。これは通常のマージ処理用にスレッドを残し、「Too many parts」エラーを回避するためです。

取りうる値:
- 任意の正の整数。

**使用方法**

`number_of_free_entries_in_pool_to_execute_mutation` 設定の値は、[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)
* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) の値（積）より小さくする必要があります。
そうでない場合、ClickHouse は例外をスローします。



## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 
<SettingsInfoBlock type="UInt64" default_value="25" />

プール内の空きエントリ数が指定した数より少ない場合、バックグラウンドでパーティション全体の最適化を実行しません（このタスクは `min_age_to_force_merge_seconds` を設定し、
`min_age_to_force_merge_on_partition_only` を有効にしたときに生成されます）。これは、通常のマージ処理用のスレッドを確保し、「Too many parts」の発生を防ぐためです。

設定可能な値:
- 正の整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`
設定の値は、
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)
* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio)
の値より小さくなければなりません。そうでない場合、ClickHouse は例外をスローします。



## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 
<SettingsInfoBlock type="UInt64" default_value="8" />

プール（またはレプリケーションキュー）内の空きエントリ数が指定した数を下回った場合、処理するマージ（またはキューに投入するマージ）の最大サイズを下げ始めます。
これは、小さなマージを処理できるようにし、長時間実行されるマージだけでプールが埋まってしまうことを防ぐためのものです。

設定可能な値:
- 正の整数。



## number_of_mutations_to_delay {#number_of_mutations_to_delay} 
<SettingsInfoBlock type="UInt64" default_value="500" />
テーブルに未完了のミューテーションがこの数以上存在する場合、テーブルのミューテーションを意図的に遅くします。
0 に設定すると無効になります。



## number_of_mutations_to_throw {#number_of_mutations_to_throw} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

テーブルに未完了のミューテーションがこの数以上存在する場合、`Too many mutations` 例外をスローします。0 を指定すると無効になります。



## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


ClickHouse Cloud でのみ利用可能です。マージ対象として考慮するパーティションの上位 N 個までを対象とします。パーティションは重み付きランダム方式で選択され、重みはそのパーティション内でマージ可能な data parts の数に基づきます。



## object_serialization_version {#object_serialization_version} 
<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "JSON シリアル化バージョンを制御する設定を追加"}]}]}/>


JSON データ型用のシリアル化バージョンです。互換性を維持するために必要です。

設定可能な値:
- `v1`
- `v2`
- `v3`

共有データのシリアル化バージョンの変更をサポートするのは、`v3` のみです。



## object_shared_data_buckets_for_compact_part {#object_shared_data_buckets_for_compact_part} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Compact パーツにおける JSON 共有データのシリアル化で使用するバケット数を制御する設定を追加"}]}]}/>


Compact パーツにおける JSON 共有データのシリアル化に使用するバケット数を指定します。`map_with_buckets` および `advanced` の共有データシリアル化で使用されます。



## object_shared_data_buckets_for_wide_part {#object_shared_data_buckets_for_wide_part} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "ワイドパートにおける共有データの JSON シリアル化で使用するバケット数を制御する設定を追加"}]}]}/>


ワイドパートにおける共有データの JSON シリアル化に使用するバケット数。`map_with_buckets` および `advanced` 方式の共有データシリアル化で有効です。



## object_shared_data_serialization_version {#object_shared_data_serialization_version} 
<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "JSON シリアル化バージョンを制御するための設定を追加"}]}]}/>


JSON データ型内の共有データに対するシリアル化バージョン。

使用可能な値:
- `map` - 共有データを `Map(String, String)` として保存します。
- `map_with_buckets` - 共有データを複数の個別の `Map(String, String)` 列として保存します。バケットを使用すると、共有データから個々のパスを読み取む処理が高速化されます。
- `advanced` - 共有データの個々のパスの読み取りを大幅に高速化することを目的とした、共有データ向けの特別なシリアル化方式です。  
  このシリアル化方式では、多くの追加情報を保存するため、ディスク上の共有データのストレージサイズが増加する点に注意してください。

`map_with_buckets` および `advanced` シリアル化におけるバケット数は、設定
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part)
によって決定されます。



## object_shared_data_serialization_version_for_zero_level_parts {#object_shared_data_serialization_version_for_zero_level_parts} 
<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "ゼロレベルパーツに対する JSON シリアル化バージョンを制御する設定を追加"}]}]}/>


この設定では、挿入処理中に作成されるゼロレベルパーツについて、JSON 型内の共有データに対して異なるシリアル化バージョンを指定できます。
ゼロレベルパーツに対しては、`advanced` 共有データシリアル化の使用は推奨されません。挿入時間が大きく増加する可能性があるためです。



## old_parts_lifetime {#old_parts_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="480" />

予期しないサーバー再起動時のデータ損失を防ぐために、非アクティブなパーツを保持しておく時間（秒）。

取り得る値:
- 任意の正の整数。

複数のパーツをマージして新しいパーツを作成した後、ClickHouse は元のパーツを非アクティブとしてマークし、`old_parts_lifetime` 秒経過してから削除します。
非アクティブなパーツは、現在のクエリで使用されていない場合、すなわちそのパーツの `refcount` が 1 の場合に削除されます。

新しいパーツに対しては `fsync` は呼び出されないため、一定時間のあいだ新しいパーツはサーバーの RAM（OS キャッシュ）内にしか存在しません。サーバーが予期せず再起動された場合、新しいパーツは失われるか破損する可能性があります。データを保護するため、非アクティブなパーツは即座には削除されません。

起動時に ClickHouse はパーツの整合性をチェックします。マージ後のパーツが破損している場合、ClickHouse は非アクティブなパーツをアクティブなパーツの一覧に戻し、その後あらためてマージします。そして破損したパーツは（`broken_` プレフィックスが追加されて）リネームされ、`detached` フォルダに移動されます。マージ後のパーツが破損していない場合、元の非アクティブなパーツは（`ignored_` プレフィックスが追加されて）リネームされ、`detached` フォルダに移動されます。

デフォルトの `dirty_expire_centisecs` の値（Linux カーネルの設定）は 30 秒（書き込まれたデータが RAM のみに保持される最大時間）ですが、ディスクシステムに高負荷がかかっている場合、データの書き込みがさらに遅れることがあります。実験的に、`old_parts_lifetime` の値として 480 秒が選択されており、この間に新しいパーツが確実にディスクへ書き込まれることが保証されます。



## optimize_row_order {#optimize_row_order} 
<SettingsInfoBlock type="Bool" default_value="0" />

行の順序を挿入時に最適化して、新しく挿入されるテーブルパーツの
圧縮効率を改善するかどうかを制御します。

通常の MergeTree エンジンテーブルに対してのみ効果があります。
特殊な MergeTree エンジンテーブル（例: CollapsingMergeTree）には効果がありません。

MergeTree テーブルは（任意で）[compression codecs](/sql-reference/statements/create/table#column_compression_codec)
を使って圧縮されます。LZ4 や ZSTD のような汎用圧縮コーデックは、
データにパターンが現れている場合に最大限の圧縮率を達成します。
同一値が長く連続するランは、一般的に非常によく圧縮されます。

この設定が有効な場合、ClickHouse は新しく挿入されるパーツのデータを、
新しいテーブルパーツの列全体で同一値ランの数が最小となるような
行順序で保存しようと試みます。
言い換えると、同一値ランの数が少ないということは、個々のランが長くなり、
よく圧縮されることを意味します。

最適な行順序を見つけることは計算量的に実行不可能（NP 困難）です。
そのため ClickHouse は、元の行順序よりも圧縮率を向上させつつ、
高速に良好な行順序を見つけるためのヒューリスティクスを使用します。

<details markdown="1">

<summary>行順序を見つけるためのヒューリスティクス</summary>

SQL では、同じテーブル（テーブルパーツ）が異なる行順序であっても
同値とみなされるため、一般にはテーブル（あるいはテーブルパーツ）の
行を自由にシャッフルすることが可能です。

テーブルにプライマリキーが定義されている場合、この行シャッフルの自由度は
制限されます。ClickHouse では、プライマリキー `C1, C2, ..., CN` は、
テーブルの行が列 `C1`, `C2`, ... `Cn` でソートされていることを
強制します（[clustered index](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
その結果、行は「同値類」の中でのみシャッフルできます。
すなわち、プライマリキー列の値が同一である行同士です。
直感的には、`DateTime64` タイプのタイムスタンプ列を含む
プライマリキーのような高カーディナリティのプライマリキーは、
多数の小さな同値類を生みます。
同様に、低カーディナリティのプライマリキーを持つテーブルは、
少数の大きな同値類を生みます。プライマリキーを持たないテーブルは、
すべての行を含む 1 つの同値類という極端なケースを表します。

同値類の数が少なくサイズが大きいほど、行を再シャッフルする際の
自由度は高くなります。

各同値類の内部で最適な行順序を見つけるために適用される
ヒューリスティクスは、D. Lemire と O. Kaser による
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
で提案されたものであり、各同値類の行を、非プライマリキー列の
カーディナリティの昇順でソートすることに基づいています。

これは以下の 3 ステップを実行します:
1. プライマリキー列の行値に基づいて、すべての同値類を見つけます。
2. 各同値類について、非プライマリキー列のカーディナリティを
（通常は推定により）計算します。
3. 各同値類について、非プライマリキー列のカーディナリティが
昇順となるように行をソートします。

</details>

有効にすると、新しいデータの行順序を解析・最適化するために、
挿入操作で追加の CPU コストが発生します。
データの特性にもよりますが、INSERT の実行時間は 30–50% 長くなると
想定されます。
LZ4 や ZSTD の圧縮率は平均して 20–40% 向上します。

この設定は、プライマリキーを持たないテーブル、または
低カーディナリティのプライマリキーを持つテーブル、
すなわち異なるプライマリキー値の数が少ないテーブルに対して
最も効果的です。
`DateTime64` 型のタイムスタンプ列を含むような
高カーディナリティのプライマリキーは、この設定による恩恵は
期待できません。



## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="30" />

シャード間でパーツを移動する前後に待機する秒数。



## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="0" />

シャード間でパーツを移動するための実験的かつ未完成の機能です。  
シャーディング式は考慮されません。



## parts_to_delay_insert {#parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

1 つのパーティション内に存在するアクティブなパーツ数が
`parts_to_delay_insert` の値を超えた場合、`INSERT` の実行は意図的に遅延されます。

設定可能な値:
- 任意の正の整数。

ClickHouse は `INSERT` の実行時間を意図的に延ばし（「sleep」を追加し）、バックグラウンドでのマージ処理が、新しいパーツが追加される速度よりも速くパーツをマージできるようにします。



## parts_to_throw_insert {#parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="3000" />

単一パーティション内のアクティブパーツ数が
`parts_to_throw_insert` の値を超えると、`INSERT` は `Too many
parts (N). Merges are processing significantly slower than inserts`
という例外とともに中断されます。

設定可能な値:
- 任意の正の整数。

`SELECT` クエリのパフォーマンスを最大化するには、処理されるパーツ数を最小化する必要があります。詳細は [Merge Tree](/development/architecture#merge-tree) を参照してください。

バージョン 23.6 より前では、この設定は 300 に設定されていました。この値をより大きく設定すると、`Too many parts`
エラーが発生する可能性を減らせますが、その一方で `SELECT` のパフォーマンスが低下する可能性があります。また、マージ処理に問題（たとえばディスク容量不足など）が発生した場合、元の 300 の設定と比べて、その問題に気付くのが遅くなります。




## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

パーツのサイズの合計がこのしきい値を超え、かつレプリケーションログエントリが作成されてからの経過時間が
`prefer_fetch_merged_part_time_threshold` より長い場合、ローカルでマージを実行する代わりに、
レプリカからマージ済みパーツを取得することを優先します。これは非常に時間のかかるマージ処理を高速化するための設定です。

設定可能な値:
- 任意の正の整数。



## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="3600" />

レプリケーションログ（ClickHouse Keeper または ZooKeeper）のエントリ作成からの経過時間がこのしきい値を超え、かつパーツのサイズの合計が `prefer_fetch_merged_part_size_threshold` より大きい場合、ローカルでマージを実行するのではなく、レプリカからマージ済みパーツを取得することを優先します。これは、非常に時間のかかるマージを高速化するためのものです。

取りうる値:
- 任意の正の整数値。



## prewarm_mark_cache {#prewarm_mark_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
`true` の場合、挿入、マージ、フェッチ時およびサーバー起動時にマークをマークキャッシュに保存して、
マークキャッシュを事前にウォームアップします



## prewarm_primary_key_cache {#prewarm_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

true の場合、挿入、マージ、フェッチ処理およびサーバー起動時にマークをマークキャッシュに保存することで、プライマリインデックスキャッシュを事前にウォームアップします。



## primary_key_compress_block_size {#primary_key_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

プライマリキーの圧縮ブロックサイズ。圧縮するブロックの実際のサイズです。



## primary_key_compression_codec {#primary_key_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

プライマリキーに対して使用される圧縮コーデックです。プライマリキーは十分に小さく、キャッシュされているため、デフォルトの圧縮方式は ZSTD(3) です。



## primary_key_lazy_load {#primary_key_lazy_load} 
<SettingsInfoBlock type="Bool" default_value="1" />
テーブルの初期化時ではなく、初回の利用時にプライマリキーをメモリにロードします。多数のテーブルが存在する場合にメモリを節約できます。



## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 
<SettingsInfoBlock type="Float" default_value="0.9" />

データパーツ内で、プライマリキーを構成するあるカラムの値がこの比率以上の頻度で変化する場合、後続のカラムをメモリに読み込むことをスキップします。これにより、プライマリキーの不要なカラムを読み込まずに済み、メモリ使用量を削減できます。



## ratio&#95;of&#95;defaults&#95;for&#95;sparse&#95;serialization

<SettingsInfoBlock type="Float" default_value="0.9375" />

列内の *すべての* 値の個数に対する、*デフォルト* 値の個数の最小比率。
この値を設定すると、その列はスパースシリアライゼーションを用いて保存されます。

列がスパース（ほとんどがゼロ）である場合、ClickHouse はそれをスパース形式で
エンコードし、計算を自動的に最適化できます。クエリ実行時にデータを完全に
伸長する必要がありません。このスパースシリアライゼーションを有効にするには、
`ratio_of_defaults_for_sparse_serialization` 設定を 1.0 未満に設定します。
値が 1.0 以上の場合、列は常に通常のフルシリアライゼーションで書き込まれます。

取りうる値:

* スパースシリアライゼーションを有効にするには、`0` から `1` の間の浮動小数点数
* スパースシリアライゼーションを使用しない場合は `1.0`（またはそれ以上）

**例**

次のテーブルでは、`s` 列は 95% の行で空文字列になっている点に注目してください。
`my_regular_table` ではスパースシリアライゼーションを使用せず、
`my_sparse_table` では `ratio_of_defaults_for_sparse_serialization` を 0.95 に
設定しています:

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

`my_sparse_table` の `s` 列が、ディスク上でより少ないストレージ容量しか使用していないことに注目してください。

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

列がスパースエンコーディングを使用しているかどうかは、`system.parts_columns` テーブルの `serialization_kind` 列を参照して確認できます。

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

疎シリアライゼーションによって `s` のどの部分が保存されたかを確認できます。

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


ClickHouse Cloud でのみ利用可能です。範囲が一切削除／置換されなかったあとに、ブロッキングパーツの削減を再度試行するまで待機する最小時間です。値を小さくすると、`background_schedule_pool` 内のタスクが頻繁にトリガーされ、大規模クラスタでは ZooKeeper へのリクエストが大量に発生します。



## refresh_parts_interval {#refresh_parts_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>


0 より大きい値に設定されている場合、基盤となるファイルシステムからデータパーツの一覧を更新し、裏側でデータが更新されていないかを確認します。
この設定は、テーブルが読み取り専用ディスク上にある場合にのみ設定できます（これは、別のレプリカがデータを書き込んでいる間、このレプリカが読み取り専用レプリカであることを意味します）。



## refresh_statistics_interval {#refresh_statistics_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>


統計キャッシュの更新間隔（秒）。0 に設定すると、更新は無効になります。



## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="10800" />

この設定が 0 より大きい値に設定されている場合、共有ストレージ上にマージ後のパーツを配置する際には、単一のレプリカのみが即座にマージを開始します。

:::note
ゼロコピーレプリケーションは本番環境利用の準備がまだ整っていません  
ゼロコピーレプリケーションは ClickHouse バージョン 22.8 以降では、デフォルトで無効になっています。

この機能は本番環境での使用は推奨されません。
:::

可能な値:
- 任意の正の整数。



## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

変換処理中は、互換モードでゼロコピーを実行します。



## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path} 

<ExperimentalBadge/>
<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

テーブル非依存のゼロコピー情報を保存するための ZooKeeper パス。



## remove_empty_parts {#remove_empty_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

TTL やミューテーション、または CollapsingMergeTree のマージアルゴリズムによって内容が削除され空になったパーツを削除します。



## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="1" />

不完全な実験的機能向けの設定です。



## remove_unused_patch_parts {#remove_unused_patch_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


すべてのアクティブパーツに適用済みのパッチパーツをバックグラウンドで削除します。



## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 
<SettingsInfoBlock type="Bool" default_value="1" />

列のファイル名が長すぎる場合（`max_file_name_length` バイトを超える場合）、SipHash128 によるハッシュ値に置き換えます。



## replicated_can_become_leader {#replicated_can_become_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、このノード上の Replicated テーブルのレプリカは
リーダーになろうとします。

設定可能な値:
- `true`
- `false`



## replicated_deduplication_window {#replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>


ClickHouse Keeper が重複チェックのためにハッシュ値を保持する、直近で挿入されたブロックの数。

設定可能な値:
- 任意の正の整数
- 0（重複排除を無効にする）

`Insert` コマンドは 1 つ以上のブロック（パーツ）を作成します。
[挿入の重複排除](../../engines/table-engines/mergetree-family/replication.md)において、
レプリケーテッドテーブルに書き込むとき、ClickHouse は作成されたパーツのハッシュ値を
ClickHouse Keeper に書き込みます。ハッシュ値は、直近の `replicated_deduplication_window`
個のブロック分のみ保存されます。最も古いハッシュ値は ClickHouse Keeper から削除されます。

`replicated_deduplication_window` を大きな値にすると、比較すべきエントリが増えるため
`Insert` の処理が遅くなります。ハッシュ値は、フィールド名と型、および
挿入されたパーツ（バイト列）のデータの構成から計算されます。



## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse Keeper が重複チェックのためにハッシュ値を保持する、直近の非同期挿入ブロックの数。

Possible values:
- 任意の正の整数。
- 0（`async_inserts` の重複排除を無効化）

[Async Insert](/operations/settings/settings#async_insert) コマンドは、1 つ以上のブロック（パーツ）にキャッシュされます。[insert deduplication](/engines/table-engines/mergetree-family/replication) のためにレプリケートされたテーブルへ書き込む際、ClickHouse は各挿入のハッシュ値を ClickHouse Keeper に書き込みます。ハッシュ値は、直近の `replicated_deduplication_window_for_async_inserts` 個のブロックに対してのみ保存されます。最も古いハッシュ値は ClickHouse Keeper から削除されます。
`replicated_deduplication_window_for_async_inserts` の値が大きすぎると、より多くのエントリを比較する必要があるため、非同期挿入（Async Insert）の処理が遅くなります。
ハッシュ値は、フィールド名と型の組み合わせおよび挿入データ（バイト列）から計算されます。



## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>


挿入されたブロックのハッシュ値は、指定した秒数が経過すると
ClickHouse Keeper から削除されます。

設定可能な値:
- 任意の正の整数。

[replicated_deduplication_window](#replicated_deduplication_window) と同様に、
`replicated_deduplication_window_seconds` は、挿入データの重複排除のために
ブロックのハッシュ値をどのくらいの期間保持するかを指定します。
`replicated_deduplication_window_seconds` より古いハッシュ値は、
たとえ `replicated_deduplication_window` より小さくても ClickHouse Keeper から削除されます。

時間はウォールクロック時刻ではなく、最新レコードの時刻を基準とします。
それが唯一のレコードである場合は無期限に保持されます。



## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

非同期インサートのハッシュサムが ClickHouse Keeper から削除されるまでの秒数。

可能な値:
- 任意の正の整数。

[replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts) と同様に、
`replicated_deduplication_window_seconds_for_async_inserts` は、非同期インサートの
重複排除のためにブロックのハッシュサムをどれくらいの期間保持するかを指定します。
`replicated_deduplication_window_seconds_for_async_inserts` より古いハッシュサムは、
`replicated_deduplication_window_for_async_inserts` より短い期間であっても
ClickHouse Keeper から削除されます。

この時間はウォールクロックではなく、最新レコードの時刻を基準とします。
それが唯一のレコードであれば、永久に保持されます。



## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
廃止された設定であり、何も効果はありません。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
廃止された設定であり、何も効果はありません。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
廃止された設定であり、何も効果はありません。
## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

1 つの `MUTATE_PART` エントリ内でまとめてマージして実行できる
ミューテーションコマンドの最大数（0 は無制限を意味します）



## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定で、何の効果もありません。
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 
<SettingsInfoBlock type="UInt64" default_value="15" />
廃止された設定で、何の効果もありません。
## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定で、何の効果もありません。
## replicated_max_parallel_sends {#replicated_max_parallel_sends} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定で、何の効果もありません。
## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定で、何の効果もありません。
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 
<SettingsInfoBlock type="Float" default_value="0.5" />

不正なパーツ数とパーツ総数の比率がこの値より小さい場合は、起動を許可します。

可能な値:
- Float、0.0 ～ 1.0



## search_orphaned_parts_disks {#search_orphaned_parts_disks} 
<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>


ClickHouse は、未定義（ポリシーに含まれていない）のディスク上のデータパーツを取りこぼさないようにするため、任意の ATTACH または CREATE TABLE 操作が行われるたびに、すべてのディスク上の孤立したパーツをスキャンします。
孤立パーツは、ディスクがストレージポリシーから除外された場合など、安全でない可能性のあるストレージ再構成によって発生します。
この設定は、ディスクの特性によって、検索対象となるディスクの範囲を制限します。

取りうる値:
- any - 検索対象ディスクの範囲は制限されません。
- local - 検索対象ディスクの範囲はローカルディスクに制限されます。
- none - 検索対象ディスクの範囲は空となり、ディスクを検索しません。



## serialization_info_version {#serialization_info_version} 
<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "Change to the newer format allowing custom string serialization"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "New setting"}]}]}/>


`serialization.json` の書き込み時に使用されるシリアライズ情報バージョンです。
クラスタのアップグレード（特にローリングアップグレード）時の互換性のために必要な設定です。

指定可能な値:
- `basic` - 基本フォーマット。
- `with_types` - 追加の `types_serialization_versions` フィールドを含むフォーマットで、型ごとのシリアライズバージョンを指定できます。
これにより `string_serialization_version` などの設定が有効になります。

ローリングアップグレード中は、`basic` に設定しておくことで、新しいサーバーが古いサーバーと互換性のあるデータパーツを生成します。アップグレード完了後に、
型ごとのシリアライズバージョンを有効にするために `with_types` に切り替えます。



## shared_merge_tree_activate_coordinated_merges_tasks {#shared_merge_tree_activate_coordinated_merges_tasks} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定"}]}]}/>


協調マージタスクの再スケジューリングを有効にします。これは
`shared_merge_tree_enable_coordinated_merges=0` の場合でも有用です。この設定によりマージコーディネーターの
統計情報が蓄積され、コールドスタート時の改善に役立ちます。



## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Keeper 内のメタデータ量を削減"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "クラウド同期"}]}]}/>


ZooKeeper にレプリカごとの /metadata および /columns ノードを作成できるようにします。
ClickHouse Cloud でのみ使用可能です。



## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 
<SettingsInfoBlock type="Bool" default_value="0" />

共有 MergeTree に対するマージ処理の割り当てを停止します。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_empty_partition_lifetime {#shared_merge_tree_empty_partition_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "新しい設定"}]}]}/>


パーツを持たないパーティションを Keeper に保持しておく時間（秒）。



## shared_merge_tree_enable_automatic_empty_partitions_cleanup {#shared_merge_tree_enable_automatic_empty_partitions_cleanup} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>


空パーティション用 Keeper エントリのクリーンアップを有効にします。



## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>


協調マージ戦略を有効化します



## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>


keeper 内で仮想パーツへの属性の書き込みとブロックのコミットを有効にします。



## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


古くなったパーツのチェックを有効化します。ClickHouse Cloud でのみ利用可能です



## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>


shared MergeTree において、ZooKeeper の watch によってトリガーされないパーツ更新を行う際の間隔（秒）。ClickHouse Cloud でのみ利用可能です



## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="50" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>


パーツ更新の初期バックオフ時間。ClickHouse Cloud でのみ利用可能です



## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>


サーバー間 HTTP 接続のタイムアウト時間です。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>


サーバー間 HTTP 通信のタイムアウト時間。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


`shared_merge_tree_leader_update_period` に対して、0 以上 x 秒以下の一様分布に従う値を加算し、thundering herd 問題を回避します。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 
<SettingsInfoBlock type="UInt64" default_value="30" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>


パーツ更新時のリーダーシップを再確認する最大間隔です。
ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 
<SettingsInfoBlock type="UInt64" default_value="1000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>


1 回の HTTP リクエストで、リーダーが削除対象として確認しようとする期限切れパーツの最大数。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "New setting"}]}]}/>


パーツ更新における最大バックオフ時間。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 
<SettingsInfoBlock type="UInt64" default_value="6" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>


パーツ更新リーダー数の上限。ClickHouse Cloud でのみ利用可能です



## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>


パーツ更新リーダー数の上限。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


パーツ削除処理（キラースレッド）に参加するレプリカの最大数。ClickHouse Cloud でのみ利用可能です



## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 
<SettingsInfoBlock type="UInt64" default_value="5" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>


競合する可能性のあるマージの割り当てを試みるレプリカの最大数（マージ割り当てにおける不要な競合の発生を回避するため）。0 は無効を意味します。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT に対して許可される破損パーツの最大数。この値を超える場合は、自動デタッチを行わない"}]}]}/>


SMT に対して許可される破損パーツの最大数。この値を超えた場合は、自動デタッチを行いません。



## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT におけるすべての破損したパーツの合計サイズの上限。この値を超える場合は自動的な detach を拒否する。"}]}]}/>


SMT におけるすべての破損したパーツの合計サイズの上限。この値を超える場合は自動的な detach を拒否する。



## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 
<SettingsInfoBlock type="Int64" default_value="1800" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>


挿入の再試行時に誤った処理が行われるのを防ぐために、挿入メモ化 ID をどのくらいの期間保持するかを指定します。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>


マージコーディネーター選出スレッドの実行と実行の間隔



## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<BetaBadge/>
<SettingsInfoBlock type="Float" default_value="1.1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "ロード後のコーディネータスレッドのスリープ時間を短縮"}]}]}/>


コーディネータスレッドの遅延時間を調整する係数



## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


マージコーディネーターが ZooKeeper と同期を行い、最新のメタデータを取得する頻度



## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<BetaBadge/>
<SettingsInfoBlock type="UInt64" default_value="20" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>


コーディネーターが MergerMutator に対して一度に要求できるマージ数



## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


マージコーディネータースレッドの実行間隔の最大値



## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<BetaBadge/>
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "新しい設定"}]}]}/>


コーディネーターが準備し、各ワーカーに配分するマージエントリの数



## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


マージコーディネータースレッドの実行間隔の最小値



## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>


即時の処理後に状態を更新する必要がある場合に、マージワーカースレッドが使用するタイムアウト値。



## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


マージワーカースレッドが実行される間隔



## shared_merge_tree_outdated_parts_group_size {#shared_merge_tree_outdated_parts_group_size} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>


古くなったパーツのクリーンアップ時に、同じランデブーハッシュグループに含めるレプリカの数。
ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 
<SettingsInfoBlock type="Float" default_value="0.5" />

`<candidate
partitions for mutations only (partitions that cannot be merged)>/<candidate
partitions for mutations>` の比率がこの設定値より高い場合、merge/mutate の選択タスクにおいて merge predicate を再読み込みします。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 
<SettingsInfoBlock type="UInt64" default_value="32" />

一度にスケジュールするパーツメタデータフェッチジョブの数。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


ローカルでマージされたパーツを、それを含む新たなマージを開始せずに保持しておく時間。
他のレプリカがそのパーツを取得し、そのマージを開始できるようにするための猶予を与えます。
ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 
<SettingsInfoBlock type="UInt64" default_value="1000000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>


ローカルでのマージ完了直後に次のマージの割り当てを延期するための、パーツの最小サイズ（行数単位）。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


このパーツを含む新しいマージを開始せずに、ローカルでマージ済みパーツを保持しておく時間です。他のレプリカがそのパーツを取得して、同じマージを開始できるようにするための猶予を与えます。
ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


可能な場合はリーダーから仮想パーツを読み込みます。ClickHouse
Cloud でのみ利用可能です。



## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "他のレプリカからパーツデータを取得するための新しい設定"}]}]}/>


有効にすると、すべてのレプリカが、すでにそのデータが存在している他のレプリカから、メモリ上のパーツデータ（主キー、パーティション情報など）を取得しようとします。



## shared_merge_tree_update_replica_flags_delay_ms {#shared_merge_tree_update_replica_flags_delay_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>


レプリカがバックグラウンドのスケジュールに従ってフラグの再読み込みを試行する頻度を指定します。



## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


他のレプリカ上にあるインメモリキャッシュから、FS キャッシュのヒントを要求できるようにします。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "デフォルトで outdated parts v3 を有効化"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同期"}]}]}/>


outdated parts に対してコンパクト形式を使用します。Keeper への負荷を軽減し、outdated parts の処理効率を向上させます。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


有効化すると、過剰なパーツ数を検知するカウンターは、ローカルレプリカの状態ではなく Keeper 内の共有データを参照します。ClickHouse Cloud でのみ利用可能です。



## shared_merge_tree_virtual_parts_discovery_batch {#shared_merge_tree_virtual_parts_discovery_batch} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>


1 回のバッチにまとめるパーティション検出の件数



## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 
<SettingsInfoBlock type="UInt64" default_value="0" />

古いパーツが多数存在する場合、クリーンアップスレッドは 1 回のイテレーションで最大
`simultaneous_parts_removal_limit` 個のパーツを削除しようとします。
`simultaneous_parts_removal_limit` が `0` に設定されている場合は無制限を意味します。



## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

テスト目的の設定です。変更しないでください。



## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />

テスト目的の設定です。変更しないでください。



## storage_policy {#storage_policy} 
<SettingsInfoBlock type="String" default_value="default" />

ストレージディスクのポリシー名



## string_serialization_version {#string_serialization_version} 
<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "サイズを別ストリームに分離する新しいフォーマットへの変更"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "新しい設定"}]}]}/>


トップレベルの `String` カラムに対するシリアル化フォーマットを制御します。

この設定は、`serialization_info_version` が "with_types" に設定されている場合にのみ有効です。
この設定を有効にすると、トップレベルの `String` カラムは、文字列長を保持する `.size`
サブカラムをインラインではなく分離してシリアル化します。これにより実際の `.size`
サブカラムが利用可能になり、圧縮効率が向上する場合があります。

ネストされた `String` 型（`Nullable`、`LowCardinality`、`Array`、`Map` 内など）
には影響しませんが、`Tuple` 内に現れる場合は例外です。

指定可能な値:

- `single_stream` — サイズをインラインで保持する標準的なシリアル化フォーマットを使用します。
- `with_size_stream` — トップレベルの `String` カラムに対して、サイズ専用のストリームを別に使用します。



## table_disk {#table_disk} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新しい設定"}]}]}/>


これは table_disk 設定であり、path/endpoint はデータベース全体のデータではなくテーブルデータを指す必要があります。s3_plain/s3_plain_rewritable/web の場合にのみ設定できます。



## temporary_directories_lifetime {#temporary_directories_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />

`tmp_` ディレクトリを保持しておく時間（秒）です。この値をあまり下げないでください。
この設定値が低すぎると、マージやミューテーションが正常に動作しない可能性があります。



## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 
<SettingsInfoBlock type="Seconds" default_value="7200" />

再圧縮を伴うマージを開始するまでのタイムアウト時間（秒単位）。この時間の間、ClickHouse は、その再圧縮マージが割り当てられているレプリカから、再圧縮済みパートの取得を試みます。

多くの場合、再圧縮は処理に時間がかかるため、このタイムアウトに達するまでは再圧縮を伴うマージ処理を開始せず、該当の再圧縮マージが割り当てられているレプリカから再圧縮済みパートの取得を試みます。

設定可能な値:
- 任意の正の整数。



## ttl_only_drop_parts {#ttl_only_drop_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

`TTL` 設定に基づいて、そのパーツ内のすべての行が有効期限切れになったときに、MergeTree テーブルのデータパーツを完全に削除するかどうかを制御します。

`ttl_only_drop_parts` が無効（デフォルト）の場合、`TTL` 設定に基づいて有効期限切れになった行だけが削除されます。

`ttl_only_drop_parts` が有効な場合、そのパーツ内のすべての行が `TTL` 設定に従って有効期限切れになった場合、そのパーツ全体が削除されます。



## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 
<SettingsInfoBlock type="Bool" default_value="1" />

動的サブカラムの書き込み時に適応型書き込みバッファを使用し、メモリ使用量を削減できるようにします



## use_async_block_ids_cache {#use_async_block_ids_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />

`true` の場合、非同期インサートのハッシュ値をキャッシュします。

取りうる値:
- `true`
- `false`

複数の非同期インサートを含むブロックは、複数のハッシュ値を生成します。
インサートの一部が重複している場合、Keeper は 1 回の RPC で重複したハッシュ値を 1 つしか返さないため、不要な RPC の再試行が発生します。
このキャッシュは Keeper 内のハッシュ値が格納されたパスを監視します。Keeper 側で更新が検知されると、キャッシュは可能な限り早く更新されるため、メモリ上で重複インサートをフィルタリングできるようになります。



## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 
<SettingsInfoBlock type="Bool" default_value="1" />

`Variant` データ型における判別子のバイナリシリアル化でコンパクトモードを有効にします。
このモードでは、ほとんどが 1 種類のバリアントである場合や `NULL` 値が非常に多い場合に、
パーツ内で判別子を保存するために必要なメモリ使用量を大幅に削減できます。



## use_const_adaptive_granularity {#use_const_adaptive_granularity} 
<SettingsInfoBlock type="Bool" default_value="0" />

パーツ全体に対して常に固定の粒度を使用します。これにより、インデックス粒度の値をメモリ上で圧縮できます。非常に大規模なワークロードで、スリムなテーブルに対して有用な場合があります。



## use_metadata_cache {#use_metadata_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
非推奨の設定であり、現在は何も行いません。
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper 内のパートのチェックサムについて、通常の形式（数十 KB）ではなく、
より小さい形式（数十バイト）を使用します。有効化する前に、すべてのレプリカが
新しい形式をサポートしていることを確認してください。



## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper 内でのデータパーツのヘッダーの保存方式を設定します。有効にすると、ZooKeeper に保存されるデータ量が少なくなります。詳細は[こちら](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)を参照してください。



## use_primary_key_cache {#use_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

すべてのインデックスをメモリに保持するのではなく、プライマリインデックス用のキャッシュを使用します。非常に大きなテーブルで有用です。



## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Vertical merge アルゴリズムを有効化するために必要な、マージ対象パーツの非圧縮サイズ合計の最小（概算）バイト数。



## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="11" />

Vertical マージアルゴリズムを有効化するために必要な非 PK 列の最小数。



## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="131072" />

Vertical マージアルゴリズムを有効化するために必要な、
マージ対象パーツに含まれる行数の最小（概算）合計値。



## vertical_merge_optimize_lightweight_delete {#vertical_merge_optimize_lightweight_delete} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>


`true` の場合、`vertical merge` 時に `lightweight delete` が最適化されます。



## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 
<SettingsInfoBlock type="Bool" default_value="1" />

`true` の場合、マージ処理中に次の列に対して、リモートファイルシステムからのデータの先読みが行われます。



## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

シャットダウン前に、テーブルは一意なパーツ（現在のレプリカのみに存在するもの）が他のレプリカによってフェッチされるまで、設定された時間だけ待機します（0 の場合は無効）。



## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="104857600" />
廃止された設定で、何も行いません。
## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="100" />
廃止された設定で、何も行いません。
## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
廃止された設定で、何も行いません。
## write_final_mark {#write_final_mark} 
<SettingsInfoBlock type="Bool" default_value="1" />
廃止された設定で、何も行いません。
## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Compact パーツでサブストリームごとのマーク書き込みをデフォルトで有効化"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定"}]}]}/>


Compact パーツで、各カラムごとではなく各サブストリームごとにマークを書き込むことを有効化します。
これにより、データパーツから個々のサブカラムを効率的に読み取ることができます。

例えば、カラム `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` は、次のサブストリームとしてシリアライズされます:
- タプル要素 `a` の String データ用の `t.a`
- タプル要素 `b` の UInt32 データ用の `t.b`
- タプル要素 `c` の配列サイズ用の `t.c.size0`
- タプル要素 `c` のネストした配列要素の null マップ用の `t.c.null`
- タプル要素 `c` のネストした配列要素の UInt32 データ用の `t.c`

この設定が有効な場合、これら 5 つのサブストリームそれぞれに対してマークを書き込みます。これは、必要に応じて各サブストリームのデータをグラニュールから個別に読み取ることができることを意味します。例えば、サブカラム `t.c` を読み取りたい場合、サブストリーム `t.c.size0`、`t.c.null`、`t.c` のデータのみを読み取り、サブストリーム `t.a` と `t.b` のデータは読み取りません。この設定が無効な場合、トップレベルカラム `t` に対してのみマークを書き込みます。これは、特定のサブストリームのデータだけが必要な場合でも、常にグラニュールからカラム全体のデータを読み取ることになることを意味します。



## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 
<SettingsInfoBlock type="Float" default_value="0.05" />

より小さな独立した範囲を得るために、削除を延期できるトップレベルのパーツの最大割合です。変更しないことを推奨します。



## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 
<SettingsInfoBlock type="UInt64" default_value="5" />

独立した Outdated パーツの範囲を、より小さなサブレンジに分割する際の再帰処理の最大深さです。変更しないことを推奨します。



## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

ゼロコピーレプリケーションが有効な場合、マージまたはミューテーション用のパーツのサイズに応じて、ロックを取得しようとする前にランダムな時間だけスリープします。



## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>


ゼロコピーレプリケーションが有効な場合、マージまたはミューテーションのロックを試行する前に、最大 500ms のランダムな時間だけ待機します。



## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper セッション有効期限のチェック間隔（秒）。

可能な値:
- 任意の正の整数。

