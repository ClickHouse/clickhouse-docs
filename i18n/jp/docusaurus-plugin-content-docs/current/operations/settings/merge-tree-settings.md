---
description: '`system.merge_tree_settings` に含まれる MergeTree 向けの設定'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree テーブルの設定'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

システムテーブル `system.merge_tree_settings` には、グローバルに適用される MergeTree の設定値が表示されます。

MergeTree の設定はサーバー設定ファイルの `merge_tree` セクションで設定するか、`CREATE TABLE` ステートメントの `SETTINGS` 句で各 `MergeTree` テーブルごとに個別に指定できます。

`max_suspicious_broken_parts` 設定をカスタマイズする例:

サーバー設定ファイルで、すべての `MergeTree` テーブルに対するデフォルトを設定します。

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

特定のテーブルに対する設定:

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

特定のテーブルの設定を変更するには、`ALTER TABLE ... MODIFY SETTING` を実行します。

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- reset to global default (value from system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## MergeTree の設定 \{#mergetree-settings\}

{/* 以下の設定は、次のスクリプトにより自動生成されています:
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }


## adaptive_write_buffer_initial_size \{#adaptive_write_buffer_initial_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16384" />

アダプティブな書き込みバッファの初期サイズ

## add_implicit_sign_column_constraint_for_collapsing_engine \{#add_implicit_sign_column_constraint_for_collapsing_engine\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、CollapsingMergeTree または VersionedCollapsingMergeTree テーブルの `sign` カラムに暗黙的な制約を追加し、有効な値（`1` と `-1`）のみを許可します。

## add_minmax_index_for_numeric_columns \{#add_minmax_index_for_numeric_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

この設定を有効にすると、テーブル内のすべての数値型カラムに対して min-max（スキップ）索引が追加されます。

## add_minmax_index_for_string_columns \{#add_minmax_index_for_string_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

有効にすると、テーブルのすべての文字列カラムに対して、min-max（スキップ）索引が追加されます。

## allow_coalescing_columns_in_partition_or_order_key \{#allow_coalescing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "パーティションキーまたはソートキーで coalescing カラムの使用を許可する新しい設定。"}]}]}/>

有効化すると、CoalescingMergeTree テーブルにおいて coalescing カラムを、
パーティションキーまたはソートキーとして使用できるようになります。

## allow_experimental_replacing_merge_with_cleanup \{#allow_experimental_replacing_merge_with_cleanup\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

`is_deleted` カラムを持つ ReplacingMergeTree に対する実験的な CLEANUP マージを許可します。有効化すると、`OPTIMIZE ... FINAL CLEANUP` を使用して、パーティション内のすべてのパーツを 1 つのパーツに手動でマージし、削除済みの行を削除できるようになります。

また、`min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only`、`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` の各設定を使用して、このようなマージがバックグラウンドで自動的に行われるようにすることもできます。

## allow_experimental_reverse_key \{#allow_experimental_reverse_key\}

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

MergeTree のソートキーにおける降順ソートのサポートを有効にします。
この設定はとくに時系列分析や Top-N クエリに有用で、クエリ性能を最適化するために
データを逆時系列で保存できるようにします。

`allow_experimental_reverse_key` を有効にすると、MergeTree テーブルの `ORDER BY`
句の中で降順ソートを定義できます。これにより、降順のクエリに対して
`ReadInReverseOrder` の代わりに、より効率的な `ReadInOrder` 最適化を使用できます。

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

クエリで `ORDER BY time DESC` を使用すると、`ReadInOrder` が適用されます。

**デフォルト値:** false


## allow_floating_point_partition_key \{#allow_floating_point_partition_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

パーティションキーとして浮動小数点数を許可するかどうかを設定します。

取り得る値:

- `0` — 浮動小数点数のパーティションキーを許可しない。
- `1` — 浮動小数点数のパーティションキーを許可する。

## allow_nullable_key \{#allow_nullable_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

Nullable 型を主キーとして使用できるようにします。

## allow_part_offset_column_in_projections \{#allow_part_offset_column_in_projections\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "現在、プロジェクションで '_part_offset' カラムを使用できるようになりました。"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定です。安定するまで、親パートのオフセットカラムを使用するプロジェクションの作成を防ぎます。"}]}]}/>

プロジェクションに対する SELECT クエリで '_part_offset' カラムを使用できるようにします。

## allow_reduce_blocking_parts_task \{#allow_reduce_blocking_parts_task\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "現在、SMT はデフォルトで ZooKeeper から古いブロッキングパーツを削除します"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同期"}]}]}/>

共有 MergeTree テーブルに対してブロッキングしているパーツを削減するバックグラウンドタスクです。
ClickHouse Cloud でのみ利用できます。

## allow_remote_fs_zero_copy_replication \{#allow_remote_fs_zero_copy_replication\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

本番環境ではこの設定を使用しないでください。この機能はまだ実運用に耐える状態ではありません。

## allow_summing_columns_in_partition_or_order_key \{#allow_summing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "パーティションキーまたはソートキーのカラムを合算可能にする新しい設定"}]}]}/>

有効化すると、SummingMergeTree テーブルにおいて、パーティションキーまたはソートキーに含まれるカラムを合算対象のカラムとして使用できるようになります。

## allow_suspicious_indices \{#allow_suspicious_indices\}

<SettingsInfoBlock type="Bool" default_value="0" />

同一の式で定義された主キー／二次索引およびソートキーを拒否する

## allow_vertical_merges_from_compact_to_wide_parts \{#allow_vertical_merges_from_compact_to_wide_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

コンパクトなパーツからワイドなパーツへの縦方向マージを許可します。この設定はすべてのレプリカで同じ値にする必要があります。

## alter_column_secondary_index_mode \{#alter_column_secondary_index_mode\}

<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "依存するセカンダリインデックスがある場合でも `ALTER` `column` を許可するよう動作を変更"}]}]}/>

セカンダリインデックス対象のカラムを変更する `ALTER` コマンドを許可するかどうか、また許可する場合にどのような処理を行うかを設定します。デフォルトでは、そのような `ALTER` コマンドは許可され、インデックスが再構築されます。

設定可能な値:

- `rebuild` (default): `ALTER` コマンド内のカラムの影響を受けるすべてのセカンダリインデックスを再構築します。
- `throw`: 明示的なセカンダリインデックスでカバーされているカラムに対するあらゆる `ALTER` を、例外をスローすることで禁止します。暗黙的なインデックスはこの制限の対象外であり、再構築されます。
- `drop`: 依存するセカンダリインデックスを削除します。新しいパーツにはインデックスが含まれないため、再作成には `MATERIALIZE INDEX` が必要です。
- `compatibility`: 元の挙動に一致させます: `ALTER ... MODIFY COLUMN` では `throw`、`ALTER ... UPDATE/DELETE` では `rebuild` となります。
- `ignore`: 上級者向けです。インデックスを不整合な状態のままにし、誤ったクエリ結果が返される可能性があります。

## always_fetch_merged_part \{#always_fetch_merged_part\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、このレプリカはパーツをマージせず、常に他のレプリカからマージ済みパーツをダウンロードします。

指定可能な値:

- true, false

## always_use_copy_instead_of_hardlinks \{#always_use_copy_instead_of_hardlinks\}

<SettingsInfoBlock type="Bool" default_value="0" />

mutation / replace / detach などの操作時には、ハードリンクを使用せず、常にデータをコピーします。

## apply_patches_on_merge \{#apply_patches_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

true の場合、マージ時にパッチパーツが適用されます

## assign_part_uuids \{#assign_part_uuids\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、新しい各パーツに一意のパーツ識別子が割り当てられます。
有効化する前に、すべてのレプリカが UUID バージョン 4 をサポートしていることを確認してください。

## async_block_ids_cache_update_wait_ms \{#async_block_ids_cache_update_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

各 insert イテレーションが async_block_ids_cache の更新を待機する時間

## async_insert \{#async_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、INSERT クエリによるデータはキューに保存され、その後バックグラウンドでテーブルに書き込まれます。

## auto_statistics_types \{#auto_statistics_types\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting"}]}]}/>

すべての適切なカラムに対して自動的に計算する統計タイプを、カンマ区切りのリストで指定します。
サポートされる統計タイプは tdigest、countmin、minmax、uniq です。

## background_task_preferred_step_execution_time_ms \{#background_task_preferred_step_execution_time_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

マージまたはミューテーションにおける 1 ステップの目標実行時間。  
1 ステップの処理にそれ以上の時間がかかる場合は、この値を超えることがあります。

## cache_populated_by_fetch \{#cache_populated_by_fetch\}

<SettingsInfoBlock type="Bool" default_value="0" />

:::note
この設定は ClickHouse Cloud にのみ適用されます。
:::

`cache_populated_by_fetch` が無効（デフォルト設定）の場合、新しいデータパーツは、
それらのパーツを必要とするクエリが実行された場合にのみファイルシステムキャッシュに読み込まれます。

有効にすると、`cache_populated_by_fetch` により、クエリによるトリガーを必要とせずに、
すべてのノードがストレージ上の新しいデータパーツを自身のファイルシステムキャッシュに読み込むようになります。

**関連項目**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)

## cache_populated_by_fetch_filename_regexp \{#cache_populated_by_fetch_filename_regexp\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "New setting"}]}]}/>

:::note
この設定は ClickHouse Cloud にのみ適用されます。
:::

空でない場合は、`cache_populated_by_fetch` が有効なときに、フェッチ後にキャッシュへ事前にウォームされるのは、この正規表現に一致するファイルだけです。

## check_delay_period \{#check_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="60" />

廃止された設定であり、現在は動作しません。

## check_sample_column_is_correct \{#check_sample_column_is_correct\}

<SettingsInfoBlock type="Bool" default_value="1" />

テーブル作成時に、サンプリング用のカラムまたはサンプリング式に使用されるカラムのデータ型が正しいかどうかをチェックします。データ型は符号なし
[整数型](/sql-reference/data-types/int-uint) のいずれかである必要があります: `UInt8`, `UInt16`,
`UInt32`, `UInt64`。

設定可能な値:

- `true`  — チェックを有効にします。
- `false` — テーブル作成時のチェックを無効にします。

デフォルト値: `true`。

デフォルトでは、ClickHouse サーバーはテーブル作成時に、サンプリング用のカラムまたはサンプリング式に使用されるカラムのデータ型をチェックします。すでにサンプリング式が正しくないテーブルがあり、サーバー起動時に例外を発生させたくない場合は、`check_sample_column_is_correct` を `false` に設定します。

## clean_deleted_rows \{#clean_deleted_rows\}

<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />

廃止された設定であり、現在は何も行いません。

## cleanup_delay_period \{#cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

古いキューのログ、ブロックハッシュ、およびパーツをクリーンアップするための最小間隔。

## cleanup_delay_period_random_add \{#cleanup_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

`cleanup_delay_period` に一様分布に従う 0 〜 x 秒の値を加算し、
多数のテーブルが存在する場合に発生し得る thundering herd 問題と、それに続く ZooKeeper に対する DoS を回避します。

## cleanup_thread_preferred_points_per_iteration \{#cleanup_thread_preferred_points_per_iteration\}

<SettingsInfoBlock type="UInt64" default_value="150" />

バックグラウンドでのクリーンアップ処理における推奨バッチサイズ（ポイントは抽象的な単位ですが、1 ポイントはおおよそ挿入ブロック 1 個に相当します）。

## cleanup_threads \{#cleanup_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

この設定は廃止されており、現在は何の効果もありません。

## columns_and_secondary_indices_sizes_lazy_calculation \{#columns_and_secondary_indices_sizes_lazy_calculation\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "カラムとセカンダリインデックスのサイズを遅延計算する新しい設定"}]}]}/>

テーブルの初期化時ではなく、初回のリクエスト時にカラムおよびセカンダリインデックスのサイズを遅延して計算します。

## columns_to_prewarm_mark_cache \{#columns_to_prewarm_mark_cache\}

マークキャッシュを事前ウォームアップする対象のカラム一覧（有効な場合）。空にするとすべてのカラムが対象になります

## compact_parts_max_bytes_to_buffer \{#compact_parts_max_bytes_to_buffer\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />

ClickHouse Cloud でのみ利用可能です。compact パーツにおいて 1 つのストライプに書き込む最大バイト数です。

## compact_parts_max_granules_to_buffer \{#compact_parts_max_granules_to_buffer\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="128" />

ClickHouse Cloud でのみ利用可能です。compact パーツにおいて、1 つのストライプに書き込むグラニュール数の上限を指定します。

## compact_parts_merge_max_bytes_to_prefetch_part \{#compact_parts_merge_max_bytes_to_prefetch_part\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

ClickHouse Cloud でのみ利用可能です。マージ処理中に、パーツ全体をメモリに読み込む対象とするコンパクトなパーツの最大サイズ。

## compatibility_allow_sampling_expression_not_in_primary_key \{#compatibility_allow_sampling_expression_not_in_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

主キーに含まれない sampling expression を持つテーブルを作成できるようにします。これは後方互換性のために、不正なテーブル定義を持つサーバーを一時的に実行できるようにする場合にのみ必要です。

## compress_marks \{#compress_marks\}

<SettingsInfoBlock type="Bool" default_value="1" />

マークの圧縮をサポートしており、マークファイルのサイズを小さくし、ネットワーク経由での送信を高速化します。

## compress_primary_key \{#compress_primary_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

プライマリキーの圧縮をサポートし、プライマリキーファイルのサイズを削減してネットワーク送信を高速化します。

## concurrent_part_removal_threshold \{#concurrent_part_removal_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100" />

非アクティブなデータパーツの数が少なくともこの値以上の場合にのみ、
同時パーツ削除（'max_part_removal_threads' を参照）を有効にします。

## deduplicate_merge_projection_mode \{#deduplicate_merge_projection_mode\}

<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>

非クラシックな MergeTree、すなわち (Replicated, Shared) MergeTree ではないテーブルに対して
プロジェクションを作成することを許可するかどうかを制御します。`ignore` オプションは互換性のためだけに存在し、
誤った結果をもたらす可能性があります。許可されている場合は、マージプロジェクションを行うときの動作
（`drop` するか `rebuild` するか）を指定します。クラシックな MergeTree はこの設定を無視します。
また、`OPTIMIZE DEDUPLICATE` も制御しますが、すべての MergeTree ファミリーに影響します。
`lightweight_mutation_projection_mode` オプションと同様に、これはパーツレベルの設定です。

指定可能な値:

- `ignore`
- `throw`
- `drop`
- `rebuild`

## default_compression_codec \{#default_compression_codec\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "新しい設定"}]}]}/>

テーブル宣言で特定のカラムに圧縮コーデックが定義されていない場合に使用される、デフォルトの圧縮コーデックを指定します。
カラムに対する圧縮コーデックの選択順序は次のとおりです。

1. テーブル宣言内でそのカラムに定義された圧縮コーデック
2. `default_compression_codec`（この設定）で定義された圧縮コーデック
3. `compression` 設定で定義されたデフォルトの圧縮コーデック  

デフォルト値：空文字列（未定義）。

## detach_not_byte_identical_parts \{#detach_not_byte_identical_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

マージまたはミューテーション後に、他のレプリカ上のデータ パーツとバイトレベルで同一でない場合に、そのレプリカ上のデータ パーツを切り離すかどうかを有効または無効にします。無効にした場合、そのパーツは削除されます。後でそのようなパーツを分析したい場合は、この設定を有効にしてください。

この設定は、[data replication](/engines/table-engines/mergetree-family/replacingmergetree) が有効になっている `MergeTree` テーブルに適用されます。

指定可能な値:

- `0` — パーツは削除されます。
- `1` — パーツは切り離されます。

## detach_old_local_parts_when_cloning_replica \{#detach_old_local_parts_when_cloning_replica\}

<SettingsInfoBlock type="Bool" default_value="1" />

失われたレプリカを修復する際に、古いローカルパーツを削除しないようにします。

可能な値:

- `true`
- `false`

## disable_detach_partition_for_zero_copy_replication \{#disable_detach_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピーレプリケーションにおける DETACH PARTITION クエリを無効にします。

## disable_fetch_partition_for_zero_copy_replication \{#disable_fetch_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピー レプリケーションでの FETCH PARTITION クエリを無効にします。

## disable_freeze_partition_for_zero_copy_replication \{#disable_freeze_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピーレプリケーションで FREEZE PARTITION クエリを無効にします。

## disk \{#disk\}

ストレージディスクの名前。`storage policy` の代わりに指定できます。

## dynamic_serialization_version \{#dynamic_serialization_version\}

<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Dynamic のシリアライズバージョンを制御するための設定を追加"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "シリアライズ／デシリアライズの性能向上のため、Dynamic のシリアライズバージョン v3 をデフォルトで有効化"}]}]}/>

Dynamic データ型のシリアライズバージョン。互換性を維持するために必要です。

指定可能な値:

- `v1`
- `v2`
- `v3`

## enable_block_number_column \{#enable_block_number_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

各行に対してカラム `_block_number` の永続化を有効にします。

## enable_block_offset_column \{#enable_block_offset_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

マージ処理時に仮想カラム `_block_number` を永続化します。

## enable_index_granularity_compression \{#enable_index_granularity_compression\}

<SettingsInfoBlock type="Bool" default_value="1" />

可能な場合、インデックスの粒度の値をメモリ上で圧縮します

## enable_max_bytes_limit_for_min_age_to_force_merge \{#enable_max_bytes_limit_for_min_age_to_force_merge\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "min_age_to_force_merge 用の最大バイト数を制限する新しい設定を追加。"}]}]}/>

設定 `min_age_to_force_merge_seconds` および
`min_age_to_force_merge_on_partition_only` が、
設定 `max_bytes_to_merge_at_max_space_in_pool` に従うようにするかどうかを指定します。

設定可能な値:

- `true`
- `false`

## enable_mixed_granularity_parts \{#enable_mixed_granularity_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

`index_granularity_bytes` SETTING を使用して granule サイズを制御する方式への移行を有効または無効にします。バージョン 19.11 より前は、granule サイズを制限するための SETTING は `index_granularity` だけでした。`index_granularity_bytes` SETTING は、大きな行（数十〜数百メガバイト）を持つテーブルからデータを `SELECT` する際の ClickHouse のパフォーマンスを改善します。大きな行を持つテーブルがある場合は、そのテーブルに対してこの SETTING を有効にすることで、`SELECT` クエリの効率を向上させることができます。

## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge \{#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "ReplacingMergeTree に対して自動クリーンアップマージを許可する新しい設定"}]}]}/>

パーティションを 1 つのパーツにまでマージする際に、ReplacingMergeTree に対して CLEANUP マージを使用するかどうかを制御します。`allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` が有効になっている必要があります。

設定可能な値:

- `true`
- `false`

## enable_the_endpoint_id_with_zookeeper_name_prefix \{#enable_the_endpoint_id_with_zookeeper_name_prefix\}

<SettingsInfoBlock type="Bool" default_value="0" />

ReplicatedMergeTree テーブルに対して、ZooKeeper 名のプレフィックスを付けたエンドポイント ID を有効にします。

## enable_vertical_merge_algorithm \{#enable_vertical_merge_algorithm\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Vertical merge アルゴリズムの利用を有効化します。

## enforce_index_structure_match_on_partition_manipulation \{#enforce_index_structure_match_on_partition_manipulation\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

この設定がパーティション操作クエリ（`ATTACH/MOVE/REPLACE PARTITION`）の
宛先テーブルに対して有効になっている場合、ソーステーブルと宛先テーブルの
索引および PROJECTION は完全に一致していなければなりません。そうでない場合は、
宛先テーブルはソーステーブルの索引および PROJECTION のスーパーセットであってもかまいません。

## escape_index_filenames \{#escape_index_filenames\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "索引用に作成されるファイル名内の非 ASCII 文字をエスケープ"}]}]}/>

26.1 より前のバージョンでは、二次索引用に作成されるファイル名内の特殊文字をエスケープしていなかったため、索引名に含まれる一部の文字によってパーツが破損する問題が発生する可能性がありました。この設定は互換性維持のためだけに追加されたものです。名前に非 ASCII 文字を含む索引を持つ古いパーツを読み込む場合を除き、この設定を変更すべきではありません。

## escape_variant_subcolumn_filenames \{#escape_variant_subcolumn_filenames\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Wide パーツ内の Variant 型サブカラム用に作成されるファイル名の特殊文字をエスケープ"}]}]}/>

MergeTree テーブルの Wide パーツにおいて、Variant データ型のサブカラム用に作成されるファイル名中の特殊文字をエスケープします。互換性のために必要です。

## exclude_deleted_rows_for_part_size_in_merge \{#exclude_deleted_rows_for_part_size_in_merge\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、データパーツの実際のサイズの推定値（つまり、`DELETE FROM` によって削除された行を除いたサイズ）が、マージ対象とするパーツを選択する際に使用されます。なお、この動作が適用されるのは、この設定を有効化した後に実行された `DELETE FROM` の影響を受けたデータパーツのみです。

指定可能な値:

- `true`
- `false`

**関連項目**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
設定

## exclude_materialize_skip_indexes_on_merge \{#exclude_materialize_skip_indexes_on_merge\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting."}]}]} />

マージ処理中に構築および保存しないようにする、カンマ区切りで指定された skip index のリストを除外します。
[materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge) が false の場合は効果がありません。

除外された skip index も、明示的な
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) クエリや、
[materialize&#95;skip&#95;indexes&#95;on&#95;insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)
セッション設定に応じた INSERT 時には、引き続き構築および保存されます。

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

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- setting has no effect on INSERTs

-- idx_a will be excluded from update during background or explicit merge via OPTIMIZE TABLE FINAL

-- can exclude multiple indexes by providing a list
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- default setting, no indexes excluded from being updated during merge
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```


## execute_merges_on_single_replica_time_threshold \{#execute_merges_on_single_replica_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="0" />

この設定が 0 より大きい値に設定されている場合、1 つのレプリカのみが直ちにマージを開始し、他のレプリカはマージをローカルで実行する代わりに、その時間が経過するまでマージ結果のダウンロードを待機します。選択されたレプリカがその時間内にマージを完了しない場合は、標準の動作にフォールバックします。

取り得る値:

- 任意の正の整数。

## fault_probability_after_part_commit \{#fault_probability_after_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

テスト目的のための設定です。変更しないでください。

## fault_probability_before_part_commit \{#fault_probability_before_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

テスト目的の設定です。変更しないでください。

## finished_mutations_to_keep \{#finished_mutations_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="100" />

完了したミューテーションのレコードを何件保持するかを指定します。0 の場合は、すべてのレコードを保持します。

## force_read_through_cache_for_merges \{#force_read_through_cache_for_merges\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

マージ時の読み取りでファイルシステムキャッシュ経由を強制する

## fsync_after_insert \{#fsync_after_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

挿入される各パーツごとに fsync を実行します。挿入処理のパフォーマンスが大幅に低下するため、ワイドパーツとの併用は推奨されません。

## fsync_part_directory \{#fsync_part_directory\}

<SettingsInfoBlock type="Bool" default_value="0" />

すべてのパートに対する操作（書き込み、リネームなど）が完了した後に、パートディレクトリに対してfsyncを実行します。

## in_memory_parts_enable_wal \{#in_memory_parts_enable_wal\}

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は廃止されており、何も行いません。

## in_memory_parts_insert_sync \{#in_memory_parts_insert_sync\}

<SettingsInfoBlock type="Bool" default_value="0" />

この設定は廃止されており、何も行いません。

## inactive_parts_to_delay_insert \{#inactive_parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブル内の 1 つのパーティションに含まれる非アクティブなパーツ数が
`inactive_parts_to_delay_insert` の値を超えると、`INSERT` が意図的に
遅延されます。

:::tip
サーバーがパーツのクリーンアップを十分な速さで実行できない場合に有用です。
:::

設定可能な値:

- 任意の正の整数。

## inactive_parts_to_throw_insert \{#inactive_parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1 つのパーティション内の非アクティブなパーツの数が
`inactive_parts_to_throw_insert` の値を超えると、`INSERT` は次のエラーで中断されます。

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts" という例外が発生します。

設定可能な値:

- 任意の正の整数。

## index_granularity \{#index_granularity\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

索引のマーク間に含めることができるデータ行の最大数です。つまり、1 つの primary key の値に対応する行数です。

## index_granularity_bytes \{#index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

データグラニュールの最大サイズ（バイト単位）。

グラニュールのサイズを行数のみで制限するには、`0` を設定します（推奨されません）。

## initialization_retry_period \{#initialization_retry_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

テーブル初期化の再試行間隔（秒）。

## kill_delay_period \{#kill_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

この設定は廃止されており、何の効果もありません。

## kill_delay_period_random_add \{#kill_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

非推奨の設定であり、現在は何の効果もありません。

## kill_threads \{#kill_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

この設定は廃止されており、何の効果もありません。

## lightweight_mutation_projection_mode \{#lightweight_mutation_projection_mode\}

<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

デフォルトでは、論理削除 `DELETE` は PROJECTION を持つテーブルでは動作しません。これは、PROJECTION 内の行が `DELETE` 操作の影響を受ける可能性があるためです。そのため、デフォルト値は `throw` です。ただし、このオプションによって挙動を変更できます。値を `drop` または `rebuild` のいずれかに設定すると、PROJECTION を持つテーブルでも削除が動作します。`drop` は PROJECTION を削除するため、対象の PROJECTION が削除される現在のクエリは高速になる可能性がありますが、その PROJECTION がなくなるため、将来のクエリは低速になる可能性があります。`rebuild` は PROJECTION を再構築するため、現在実行中のクエリのパフォーマンスには悪影響が出るかもしれませんが、将来のクエリは高速化される可能性があります。良い点として、これらのオプションはパーツレベル（part 単位）でのみ動作します。つまり、処理対象にならない part 内の PROJECTION は、drop や rebuild のようなアクションがトリガーされることなく、そのまま保持されます。

Possible values:

- `throw`
- `drop`
- `rebuild`

## load_existing_rows_count_for_old_parts \{#load_existing_rows_count_for_old_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

[exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) とともに有効になっている場合、
既存のデータパーツに含まれる削除済み行数がテーブルの
起動時に計算されます。テーブルの起動時の読み込みが遅くなる可能性がある点に注意してください。

設定可能な値:

- `true`
- `false`

**関連項目**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 設定

## lock_acquire_timeout_for_background_operations \{#lock_acquire_timeout_for_background_operations\}

<SettingsInfoBlock type="Seconds" default_value="120" />

マージやミューテーションなどのバックグラウンド操作において、テーブルロックの取得が失敗したと見なされるまでの秒数。

## marks_compress_block_size \{#marks_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

マークの圧縮ブロックサイズであり、圧縮されるブロックの実際のサイズです。

## marks_compression_codec \{#marks_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

マークに使用される圧縮コーデックです。マークは十分に小さくキャッシュされるため、
デフォルトの圧縮コーデックは ZSTD(3) です。

## materialize_skip_indexes_on_merge \{#materialize_skip_indexes_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>

有効にすると、マージ処理時に新しいパーツに対してスキップ索引を構築して保存します。
無効な場合は、明示的に [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
または [INSERT 時](/operations/settings/settings.md/#materialize_skip_indexes_on_insert) に作成・保存できます。

よりきめ細かい制御については、[exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) も参照してください。

## materialize_statistics_on_merge \{#materialize_statistics_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "New setting"}]}]}/>

有効にすると、マージ処理の際に新しいパーツに対して STATISTICS が構築および保存されます。
それ以外の場合は、明示的に [MATERIALIZE STATISTICS](/sql-reference/statements/alter/statistics.md) を実行するか、
[INSERT 時に](/operations/settings/settings.md#materialize_statistics_on_insert) 作成・保存できます。

## materialize_ttl_recalculate_only \{#materialize_ttl_recalculate_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

MATERIALIZE TTL 実行時にのみ TTL 情報を再計算します

## max_avg_part_size_for_too_many_parts \{#max_avg_part_size_for_too_many_parts\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

`parts_to_delay_insert` と `parts_to_throw_insert` に基づく「パーツが多すぎる」チェックは、（該当するパーティション内の）平均パーツサイズが指定されたしきい値以下の場合にのみ有効になります。平均パーツサイズが指定されたしきい値より大きい場合、INSERT 文は遅延も拒否もされません。これは、パーツがより大きなパーツへと適切にマージされている限り、単一サーバー上の単一テーブルに数百テラバイトのデータを保持できるようにするためのものです。この設定は、非アクティブなパーツまたはパーツ総数に対するしきい値には影響を与えません。

## max_bytes_to_merge_at_max_space_in_pool \{#max_bytes_to_merge_at_max_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="161061273600" />

利用可能なリソースが十分にある場合に、1つのパーツへマージされるパーツの合計最大サイズ（バイト単位）。自動バックグラウンドマージによって作成されるパーツの最大想定サイズにほぼ対応します。（0 はマージが無効になることを意味します）

設定可能な値:

- 任意の非負整数。

マージスケジューラは定期的にパーティション内のパーツのサイズと数を分析し、プール内に十分な空きリソースがあればバックグラウンドマージを開始します。ソースパーツの合計サイズが `max_bytes_to_merge_at_max_space_in_pool` を超えるまでマージが実行されます。

[OPTIMIZE FINAL](/sql-reference/statements/optimize) によって開始されたマージは `max_bytes_to_merge_at_max_space_in_pool` を無視し、空きディスク容量のみが考慮されます。

## max_bytes_to_merge_at_min_space_in_pool \{#max_bytes_to_merge_at_min_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

バックグラウンドプール内で利用可能なリソースが最小のときに、1 つのパーツにマージされるパーツの合計サイズ（バイト単位）の最大値。

可能な値:

- 正の整数。

`max_bytes_to_merge_at_min_space_in_pool` は、（プール内の）ディスク空き容量が不足していてもマージできるパーツの合計サイズの上限を定義します。これは、小さなパーツの数と `Too many parts` エラーの発生可能性を減らすために必要です。
マージ処理では、マージ対象パーツの合計サイズの 2 倍に相当するディスク領域を予約します。
そのため、利用可能なディスク空き容量が少ない場合、空き領域自体は存在していても、その領域が進行中の大きなマージによってすでに予約されている状況が発生する可能性があります。その結果、他のマージが開始できず、挿入のたびに小さなパーツの数が増加していきます。

## max_cleanup_delay_period \{#max_cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="300" />

古いキューのログ、ブロックハッシュ、パーツをクリーンアップするための最大期間。

## max_compress_block_size \{#max_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルに書き込む前に圧縮される、未圧縮データブロックの最大サイズです。  
この設定はグローバル設定
（[max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)
設定を参照）として指定することもできます。  
テーブル作成時に指定した値は、この設定のグローバル値を上書きします。

## max_concurrent_queries \{#max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

MergeTree テーブルに関連して同時に実行されるクエリの最大数。
クエリは他の `max_concurrent_queries` 設定による制限も引き続き受けます。

取りうる値:

* 正の整数。
* `0` — 制限なし。

デフォルト値: `0`（制限なし）。

**例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```


## max_delay_to_insert \{#max_delay_to_insert\}

<SettingsInfoBlock type="UInt64" default_value="1" />

単位は秒で、単一のパーティション内のアクティブなパーツ数が
[parts&#95;to&#95;delay&#95;insert](#parts_to_delay_insert) の値を超えた場合に
`INSERT` の遅延時間を計算するために使用されます。

取りうる値:

* 任意の正の整数。

`INSERT` の遅延時間（ミリ秒）は次の式で計算されます:

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

例えば、あるパーティションにアクティブなパーツが 299 個あり、parts&#95;to&#95;throw&#95;insert
= 300、parts&#95;to&#95;delay&#95;insert = 150、max&#95;delay&#95;to&#95;insert = 1 の場合、`INSERT` は
`pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
ミリ秒遅延されます。

バージョン 23.1 以降、この式は次のように変更されました。

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

例えば、あるパーティションに 224 個のアクティブなパーツがあり、parts&#95;to&#95;throw&#95;insert
= 300、parts&#95;to&#95;delay&#95;insert = 150、max&#95;delay&#95;to&#95;insert = 1、
min&#95;delay&#95;to&#95;insert&#95;ms = 10 の場合、`INSERT` の実行は `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` ミリ秒遅延されます。


## max_delay_to_mutate_ms \{#max_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

未完了のmutationが多数存在する場合における、MergeTreeテーブルのmutation処理に対して許容される最大遅延時間（ミリ秒単位）

## max_digestion_size_per_segment \{#max_digestion_size_per_segment\}

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "廃止された設定"}]}]}/>

廃止された設定であり、現在は何の効果もありません。

## max_file_name_length \{#max_file_name_length\}

<SettingsInfoBlock type="UInt64" default_value="127" />

ファイル名をハッシュ化せず、そのまま使用できる最大長。
設定 `replace_long_file_name_to_hash` が有効な場合にのみ有効です。
この設定値にはファイル拡張子の長さは含まれません。そのため、ファイルシステムエラーを避けるために、最大許容ファイル名長（通常 255 バイト）よりもいくらか小さい値に設定することを推奨します。

## max_files_to_modify_in_alter_columns \{#max_files_to_modify_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="75" />

変更（削除、追加）の対象となるファイル数がこの設定値を超える場合、ALTER を実行しません。

可能な値:

- 任意の正の整数。

デフォルト値: 75

## max_files_to_remove_in_alter_columns \{#max_files_to_remove_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="50" />

削除対象のファイル数がこの設定値を超える場合、ALTER を適用しません。

設定可能な値:

- 任意の正の整数。

## max_merge_delayed_streams_for_parallel_write \{#max_merge_delayed_streams_for_parallel_write\}

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>

並列にフラッシュできるストリーム（カラム）の最大数です
（マージにおける max_insert_delayed_streams_for_parallel_write に対応する設定）。Vertical マージでのみ動作します。

## max_merge_selecting_sleep_ms \{#max_merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

パーツが選択されなかった後、再度マージ対象のパーツを選択しようとするまでに待機する最大時間。  
値を小さくすると、`background_schedule_pool` でのタスク選択が頻繁に行われるようになり、大規模クラスタでは ZooKeeper へのリクエストが大量に発生します。

## max_number_of_merges_with_ttl_in_pool \{#max_number_of_merges_with_ttl_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="2" />

プール内で有効期限 (TTL) を伴うマージ処理の数が指定された数を超えた場合、新たな TTL 付きマージ処理は割り当てられません。これは、通常のマージ処理用のスレッドを確保し、「Too many parts」エラーが発生する状況を回避するためです。

## max_number_of_mutations_for_replica \{#max_number_of_mutations_for_replica\}

<SettingsInfoBlock type="UInt64" default_value="0" />

レプリカごとのパーツに対する mutation 数を指定した値までに制限します。
0 の場合、レプリカごとの mutation 数には制限がありません（ただし、実行は他の設定によって制約される可能性があります）。

## max_part_loading_threads \{#max_part_loading_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

廃止された設定で、現在は機能しません。

## max_part_removal_threads \{#max_part_removal_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

廃止済みの設定で、現在は何の効果もありません。

## max_partitions_to_read \{#max_partitions_to_read\}

<SettingsInfoBlock type="Int64" default_value="-1" />

1つのクエリでアクセスできるパーティションの最大数を制限する設定です。

テーブル作成時に指定した設定値は、
クエリごとの設定で上書きできます。

設定可能な値:

- 任意の正の整数。

クエリ / セッション / プロファイルのレベルで、
クエリの複雑さに関する設定 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)
を指定することもできます。

## max_parts_in_total \{#max_parts_in_total\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

テーブルのすべてのパーティションにおけるアクティブなパーツの合計数が
`max_parts_in_total` の値を超えると、`INSERT` は `Too many parts
(N)` という例外が発生して中断されます。

設定可能な値:

- 任意の正の整数。

テーブル内のパーツ数が多すぎると ClickHouse クエリのパフォーマンスが低下し、
ClickHouse の起動時間が長くなります。これは多くの場合、不適切な設計
（パーティション戦略の選択ミス ― パーティションが小さすぎる ことなど）の結果です。

## max_parts_to_merge_at_once \{#max_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="100" />

一度にマージできるパーツの最大数（0 の場合は無効です）。OPTIMIZE FINAL クエリには影響しません。

## max_postpone_time_for_failed_mutations_ms \{#max_postpone_time_for_failed_mutations_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

失敗した mutation を延期できる最大時間。

## max_postpone_time_for_failed_replicated_fetches_ms \{#max_postpone_time_for_failed_replicated_fetches_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "レプリケーションキュー内のフェッチタスクを延期できるようにする新しい設定を追加しました。"}]}]}/>

失敗したレプリケートフェッチに対して延期できる最大時間。

## max_postpone_time_for_failed_replicated_merges_ms \{#max_postpone_time_for_failed_replicated_merges_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "レプリケーションキュー内のマージタスクを延期可能にする新しい設定を追加しました。"}]}]}/>

失敗したレプリケーテッドマージを延期する際の最大時間。

## max_postpone_time_for_failed_replicated_tasks_ms \{#max_postpone_time_for_failed_replicated_tasks_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "レプリケーションキュー内のタスクを延期できるようにする新しい設定を追加。"}]}]}/>

失敗したレプリケーションタスクに対する最大延期時間です。タスクが fetch、merge、または mutation でない場合に、この値が使用されます。

## max_projections \{#max_projections\}

<SettingsInfoBlock type="UInt64" default_value="25" />

MergeTree PROJECTION の最大数。

## max_replicated_fetches_network_bandwidth \{#max_replicated_fetches_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

[replicated](../../engines/table-engines/mergetree-family/replication.md)
フェッチに対して、ネットワーク越しのデータ転送の最大速度を 1 秒あたりのバイト数で制限します。この設定は特定のテーブルに対して適用されます。一方、
[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)
設定はサーバー全体に適用されます。

サーバー全体のネットワーク帯域と特定テーブル用ネットワーク帯域の両方を制限できますが、
その場合はテーブルレベルの設定値をサーバーレベルの設定値より小さくする必要があります。そうでない場合、サーバーは
`max_replicated_fetches_network_bandwidth_for_server` 設定のみを考慮します。

この設定は完全に正確に守られるとは限りません。

設定可能な値:

- 正の整数。
- `0` — 無制限。

デフォルト値: `0`。

**使用方法**

新しいノードを追加または置換するためにデータをレプリケートする際、転送速度を制限する目的で使用できます。

## max_replicated_logs_to_keep \{#max_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

非アクティブなレプリカが存在する場合に、ClickHouse Keeper のログ内に保持できるレコード数。
この数値を超えると、非アクティブなレプリカは失われたものと見なされます。

取り得る値:

- 任意の正の整数。

## max_replicated_merges_in_queue \{#max_replicated_merges_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

ReplicatedMergeTree のキュー内で、パーツのマージおよびミューテーションのタスクを同時にいくつまで許可するかを指定します。

## max_replicated_merges_with_ttl_in_queue \{#max_replicated_merges_with_ttl_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1" />

ReplicatedMergeTree のキュー内で、有効期限 (TTL) 付きのパーツのマージタスクを同時にいくつまで許可するかを表します。

## max_replicated_mutations_in_queue \{#max_replicated_mutations_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="8" />

ReplicatedMergeTree のキュー内で、パーツに対する mutation タスクを同時にいくつまで許可するかを設定します。

## max_replicated_sends_network_bandwidth \{#max_replicated_sends_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

[replicated](/engines/table-engines/mergetree-family/replacingmergetree) 送信に対するネットワーク経由のデータ交換の最大速度を、1 秒あたりのバイト数で制限します。この設定は特定のテーブルに適用されますが、[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth) 設定はサーバー全体に適用されます。

サーバーネットワーク全体と特定テーブル用のネットワークの両方を制限することができますが、その場合はテーブルレベル設定の値をサーバーレベル設定より小さくする必要があります。そうでない場合、サーバーは `max_replicated_sends_network_bandwidth_for_server` 設定のみを考慮します。

この設定は厳密に守られるわけではありません。

可能な値:

- 正の整数。
- `0` — 無制限。

**使用方法**

新しいノードを追加または置換するときに、データのレプリケーション速度を制限する用途で使用できます。

## max_suspicious_broken_parts \{#max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="100" />

単一のパーティション内で壊れたパーツの数が
`max_suspicious_broken_parts` の値を超えると、自動削除は行われません。

設定可能な値:

- 正の整数。

## max_suspicious_broken_parts_bytes \{#max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

破損したすべてのパーツの合計サイズの上限。この値を超える場合は、自動削除を行いません。

設定可能な値:

- 任意の正の整数。

## max_uncompressed_bytes_in_patches \{#max_uncompressed_bytes_in_patches\}

<SettingsInfoBlock type="UInt64" default_value="32212254720" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "New setting"}]}]}/>

すべてのパッチパーツに含まれるデータの非圧縮時サイズ合計の最大値（バイト単位）。
すべてのパッチパーツのデータ量がこの値を超える場合、論理更新は拒否されます。
0 の場合は無制限。

## merge_max_block_size \{#merge_max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

マージされたパーツからメモリに読み込まれる行数。

設定可能な値:

- 任意の正の整数。

マージ処理では、パーツから `merge_max_block_size` 行分ずつブロック単位で行を読み出し、
それらをマージして結果を新しいパーツとして書き出します。読み込まれたブロックは RAM 上に配置されるため、
`merge_max_block_size` はマージに必要な RAM 容量に影響します。
したがって、非常に幅の広い行を持つテーブルでは、マージ処理が大量の RAM を消費する可能性があります
（平均行サイズが 100KB で 10 個のパーツをマージする場合、
(100KB * 10 * 8192) = 約 8GB の RAM が必要になります）。`merge_max_block_size` を小さくすることで、
マージに必要な RAM の量を減らすことはできますが、マージ処理は遅くなります。

## merge_max_block_size_bytes \{#merge_max_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

マージ処理で形成されるブロックのサイズ（バイト数）を指定します。デフォルト値は
`index_granularity_bytes` と同じです。

## merge_max_bytes_to_prewarm_cache \{#merge_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud でのみ利用可能です。マージ処理中にキャッシュを事前ウォームアップする際の対象となるパーツ（compact または packed）の最大サイズ。

## merge_max_dynamic_subcolumns_in_compact_part \{#merge_max_dynamic_subcolumns_in_compact_part\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "auto"},{"label": "マージ後の Compact データパートにおいて、データ型で指定されたパラメータに関わらず、動的サブカラム数を制限する新しい設定を追加"}]}]}/>

マージ後の Compact データパート内の各カラムで作成できる動的サブカラムの最大数を指定します。
この設定により、データ型で指定された動的パラメータに関わらず、Compact データパート内の動的サブカラム数を制御できます。

例えば、テーブルに JSON(max_dynamic_paths=1024) 型のカラムがあり、`merge_max_dynamic_subcolumns_in_compact_part` 設定が 128 に設定されている場合、
Compact データパートへのマージ後、このパート内の動的パスの数は 128 に制限され、動的サブカラムとして書き込まれるパスも 128 個のみになります。

## merge_max_dynamic_subcolumns_in_wide_part \{#merge_max_dynamic_subcolumns_in_wide_part\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "データ型で指定されたパラメータに関係なく、マージ後の Wide パーツにおける動的サブカラム数を制限する新しい設定を追加"}]}]}/>

マージ後に Wide データパーツ内の各カラムで作成できる動的サブカラムの最大数を指定します。
これにより、データ型で指定された動的パラメータに関係なく、Wide データパーツ内で作成されるファイル数を削減できます。

たとえば、テーブルに JSON(max_dynamic_paths=1024) 型のカラムがあり、設定 `merge_max_dynamic_subcolumns_in_wide_part` が 128 に設定されている場合、
Wide データパーツへのマージ後には、このパーツ内の動的パス数は 128 に制限され、動的サブカラムとして書き込まれるパスも 128 個のみになります。

## merge_selecting_sleep_ms \{#merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

パーツが選択されなかった後、再度マージ対象のパーツを選択しようとするまでに待機する最小時間。この設定値を小さくすると、`background_schedule_pool` でのタスク選択が頻繁に実行されるようになり、大規模クラスターでは ZooKeeper へのリクエストが大量に発生します。

## merge_selecting_sleep_slowdown_factor \{#merge_selecting_sleep_slowdown_factor\}

<SettingsInfoBlock type="Float" default_value="1.2" />

マージ選択タスクのスリープ時間は、マージ対象がない場合にはこの係数を掛けて延長し、マージが割り当てられた場合にはこの係数で割って短縮します。

## merge_selector_algorithm \{#merge_selector_algorithm\}

<ExperimentalBadge/>

<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

マージに割り当てるパーツを選択するアルゴリズム

## merge_selector_base \{#merge_selector_base\}

<SettingsInfoBlock type="Float" default_value="5" />

割り当てられたマージ処理における write amplification に影響します（上級者向けの設定であり、その動作を理解していない場合は変更しないでください）。Simple および StochasticSimple のマージセレクタで有効です。

## merge_selector_blurry_base_scale_factor \{#merge_selector_blurry_base_scale_factor\}

<SettingsInfoBlock type="UInt64" default_value="0" />

パーティション内のパーツ数に対して、どのタイミングでこのロジックが動作を開始するかを制御します。係数が大きいほど、その動作はより遅れて発生します。

## merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once \{#merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

単純なマージセレクタ用のヒューリスティックを有効化し、マージ選択における最大値を引き下げます。
これにより同時マージ数が増加し、TOO_MANY_PARTS エラーの軽減に役立ちますが、その一方で書き込み増幅が大きくなります。

## merge_selector_enable_heuristic_to_remove_small_parts_at_right \{#merge_selector_enable_heuristic_to_remove_small_parts_at_right\}

<SettingsInfoBlock type="Bool" default_value="1" />

マージ対象のパーツを選択する際のヒューリスティックを有効にします。このヒューリスティックは、レンジの右側にあるパーツのサイズが `sum_size` の指定比率 (0.01) 未満の場合に、そのパーツを選択対象から除外します。
Simple および StochasticSimple の両方の merge selector で動作します。

## merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent \{#merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "5"},{"label": "New setting"}]}]}/>

低減カーブを形成する式で使用される指数値を制御します。指数を小さくすると
マージ幅が小さくなり、その結果、書き込み増幅が増加します。その逆も同様です。

## merge_selector_window_size \{#merge_selector_window_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

一度に対象とするパーツの数。

## merge_total_max_bytes_to_prewarm_cache \{#merge_total_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="16106127360" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud でのみ利用可能です。マージ時にキャッシュを事前にウォームアップする際の、対象パーツの合計最大サイズです。

## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds \{#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds\}

<SettingsInfoBlock type="UInt64" default_value="2592000" />

廃止された設定であり、現在は何の効果もありません。

## merge_tree_clear_old_parts_interval_seconds \{#merge_tree_clear_old_parts_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="1" />

ClickHouse が古いパーツ、WAL、および mutation をクリーンアップする処理を実行する間隔（秒）を設定します。

指定可能な値:

- 任意の正の整数。

## merge_tree_clear_old_temporary_directories_interval_seconds \{#merge_tree_clear_old_temporary_directories_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="60" />

ClickHouse が古い一時ディレクトリのクリーンアップを実行する間隔（秒）を設定します。

取り得る値:

- 任意の正の整数。

## merge_tree_enable_clear_old_broken_detached \{#merge_tree_enable_clear_old_broken_detached\}

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定で、何も行いません。

## merge_with_recompression_ttl_timeout \{#merge_with_recompression_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

再圧縮の有効期限 (TTL) を伴うマージを再度実行するまでの最小遅延時間（秒）。

## merge_with_ttl_timeout \{#merge_with_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

削除の有効期限 (TTL) を伴うマージを再度実行するまでの最小遅延時間（秒）。

## merge_workload \{#merge_workload\}

マージ処理とその他のワークロード間でのリソースの使用と共有方法を制御するために使用します。指定された値は、このテーブルのバックグラウンドマージに対する `workload` SETTING の値として使用されます。指定されていない（空文字列の場合）は、サーバー設定 `merge_workload` SETTING が代わりに使用されます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## min_absolute_delay_to_close \{#min_absolute_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ステータスチェック中に `Ok` を返さず、リクエストの処理を停止して接続をクローズするまでの最小絶対遅延時間。

## min_age_to_force_merge_on_partition_only \{#min_age_to_force_merge_on_partition_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

`min_age_to_force_merge_seconds` を、パーティション全体に対してのみ適用し、パーティション内の一部のデータには適用しないかどうかを指定します。

デフォルトでは、`max_bytes_to_merge_at_max_space_in_pool` の設定を無視します
（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

取りうる値:

- true, false

## min_age_to_force_merge_seconds \{#min_age_to_force_merge_seconds\}

<SettingsInfoBlock type="UInt64" default_value="0" />

範囲内のすべてのパーツが `min_age_to_force_merge_seconds` の値より古い場合に、パーツをマージします。

デフォルトでは、`max_bytes_to_merge_at_max_space_in_pool` 設定を無視します
（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

設定可能な値:

- 正の整数。

## min_bytes_for_compact_part \{#min_bytes_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定で、現在は効果がありません。

## min_bytes_for_full_part_storage \{#min_bytes_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud でのみ利用可能です。データパーツに対して packed ではなく
full タイプのストレージを使用するための、非圧縮時のサイズ（バイト単位）の最小値です

## min_bytes_for_wide_part \{#min_bytes_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

`Wide` フォーマットで保存できるデータパーツ内の最小バイト数／行数。これらの設定は、一方のみ、両方とも、またはどちらも設定しないことができます。

## min_bytes_to_prewarm_caches \{#min_bytes_to_prewarm_caches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

新しいパーツに対して mark cache と primary index cache をプリウォームするための、非圧縮バイト数で表した最小サイズ

## min_bytes_to_rebalance_partition_over_jbod \{#min_bytes_to_rebalance_partition_over_jbod\}

<SettingsInfoBlock type="UInt64" default_value="0" />

新しい大きなパーツをボリュームディスク [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 上に分散する際に、バランス処理を有効にするための最小バイト数を設定します。

Possible values:

- 正の整数。
- `0` — バランス処理は無効になります。

**Usage**

`min_bytes_to_rebalance_partition_over_jbod` 設定の値は、
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024 の値より小さくしてはいけません。そうでない場合、ClickHouse は例外をスローします。

## min_columns_to_activate_adaptive_write_buffer \{#min_columns_to_activate_adaptive_write_buffer\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "500"},{"label": "新しい設定"}]}]}/>

多くのカラムを持つテーブルに対して、アダプティブな書き込みバッファーを使用することでメモリ使用量を削減します。

可能な値:

- 0 - 無制限
- 1 - 常に有効

## min_compress_block_size \{#min_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

次のマークを書き込む際に圧縮を行うために必要となる、非圧縮データブロックの最小サイズです。
この設定はグローバル設定（[min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size) 設定）でも指定できます。テーブル作成時に指定した値は、この設定に対するグローバル設定値を上書きします。

## min_compressed_bytes_to_fsync_after_fetch \{#min_compressed_bytes_to_fsync_after_fetch\}

<SettingsInfoBlock type="UInt64" default_value="0" />

フェッチ後に取得したパートに対して fsync を実行するための圧縮バイト数の最小値（0 の場合は無効）

## min_compressed_bytes_to_fsync_after_merge \{#min_compressed_bytes_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

マージ後のパーツに対して `fsync` を実行するかどうかを判断するための、圧縮済みバイト数の最小値（0 の場合は無効）

## min_delay_to_insert_ms \{#min_delay_to_insert_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

単一のパーティション内に多数の未マージのパーツが存在する場合に、MergeTree テーブルへのデータ挿入に対して適用される最小遅延時間（ミリ秒単位）。

## min_delay_to_mutate_ms \{#min_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

多数の未完了のミューテーションが存在する場合に、MergeTree テーブルに対するミューテーションを実行するまでの最小遅延時間（ミリ秒単位）

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

データを挿入するためにディスク空き容量として確保されていなければならない最小バイト数です。利用可能な空きバイト数が
`min_free_disk_bytes_to_perform_insert` より小さい場合は例外がスローされ、
挿入は実行されません。この設定については次の点に注意してください:

- `keep_free_space_bytes` 設定を考慮します。
- `INSERT` 操作によって書き込まれるデータ量は考慮しません。
- 正の（ゼロ以外の）バイト数が指定された場合にのみチェックされます。

設定可能な値:

- 任意の正の整数。

:::note
`min_free_disk_bytes_to_perform_insert` と `min_free_disk_ratio_to_perform_insert`
の両方が指定されている場合、ClickHouse は、より多くの空きディスク容量が
確保される側の値を採用して挿入を実行します。
:::

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\}

<SettingsInfoBlock type="Float" default_value="0" />

`INSERT` を実行するために必要な、空きディスク容量と総ディスク容量の最小比率です。0 から 1 の間の浮動小数点値でなければなりません。この設定については次の点に注意してください:

- `keep_free_space_bytes` 設定を考慮します。
- `INSERT` 操作によって書き込まれるデータ量は考慮しません。
- 正の (非ゼロ) 比率が指定されている場合にのみチェックされます。

取りうる値:

- Float、0.0 - 1.0

`min_free_disk_ratio_to_perform_insert` と
`min_free_disk_bytes_to_perform_insert` の両方が指定されている場合、ClickHouse は、より多くの空きディスク容量がある場合に `INSERT` を実行可能とみなす方の値を優先して使用します。

## min_index_granularity_bytes \{#min_index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

データグラニュールの許容される最小サイズ（バイト単位）。

`index_granularity_bytes` が極端に小さいテーブルを誤って作成してしまうことを防止するためのセーフガードです。

## min_level_for_full_part_storage \{#min_level_for_full_part_storage\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定"}]}]}/>

ClickHouse Cloud でのみ利用可能。データパーツに対して packed 形式ではなく
フル形式のストレージを使用するための最小パーツレベルを指定します。

## min_level_for_wide_part \{#min_level_for_wide_part\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

データパーツを `Compact` フォーマットではなく `Wide` フォーマットで作成するための最小パーツレベル。

## min_marks_to_honor_max_concurrent_queries \{#min_marks_to_honor_max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリで読み取られるマーク数の下限。この値を超えた場合にのみ、[max&#95;concurrent&#95;queries](#max_concurrent_queries)
設定が適用されます。

:::note
クエリは、他の `max_concurrent_queries` 関連の設定によっても引き続き制限されます。
:::

取り得る値:

* 正の整数。
* `0` — 無効（`max_concurrent_queries` の制限がどのクエリにも適用されない）。

**例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```


## min_merge_bytes_to_use_direct_io \{#min_merge_bytes_to_use_direct_io\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

マージ処理でダイレクト I/O を使用するために必要な最小データ量を指定します。データパーツをマージする際、ClickHouse はマージ対象となるすべてのデータの総容量を計算します。この容量が `min_merge_bytes_to_use_direct_io` バイトを超える場合、ClickHouse はストレージディスクへの読み書きをダイレクト I/O インターフェイス（`O_DIRECT` オプション）を使って行います。`min_merge_bytes_to_use_direct_io = 0` の場合、ダイレクト I/O は無効になります。

## min_parts_to_merge_at_once \{#min_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="0" />

マージセレクタが一度にマージの対象として選択できるデータパーツの最小数
（上級者向けの設定です。動作内容を理解していない場合は変更しないでください）。
0 - 無効。Simple および StochasticSimple マージセレクタで有効です。

## min_relative_delay_to_close \{#min_relative_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="300" />

他のレプリカとの相対遅延に対する最小しきい値。この値を超えるとクローズされ、リクエストの処理を停止し、ステータスチェック時に OK を返さなくなります。

## min_relative_delay_to_measure \{#min_relative_delay_to_measure\}

<SettingsInfoBlock type="UInt64" default_value="120" />

絶対遅延がこの値以上の場合にのみ、レプリカの相対遅延を計算します。

## min_relative_delay_to_yield_leadership \{#min_relative_delay_to_yield_leadership\}

<SettingsInfoBlock type="UInt64" default_value="120" />

この設定は廃止されており、何も行いません。

## min_replicated_logs_to_keep \{#min_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="10" />

ZooKeeper のログについて、古くなっていても最新のレコードを概ねこの数だけ保持します。これはテーブルの動作には影響せず、ZooKeeper ログのクリーンアップ前の診断にのみ使用されます。

可能な値:

- 任意の正の整数。

## min_rows_for_compact_part \{#min_rows_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定は廃止されており、現在は何の効果もありません。

## min_rows_for_full_part_storage \{#min_rows_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud でのみ利用可能です。データパートを packed ではなく完全なストレージ形式で保存するために必要な最小の行数です。

## min_rows_for_wide_part \{#min_rows_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`Compact` 形式ではなく `Wide` 形式でデータパーツを作成するための最小行数。

## min_rows_to_fsync_after_merge \{#min_rows_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

マージ後のパーツに対して `fsync` を実行する際の最小行数（0 で無効）

## mutation_workload \{#mutation_workload\}

ミューテーションと他のワークロード間のリソースの使用方法および共有方法を制御するために使用します。指定した値は、このテーブルのバックグラウンドミューテーションに対する `workload` 設定値として使用されます。指定されていない（空文字列である）場合は、代わりにサーバー設定 `mutation_workload` が使用されます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## non_replicated_deduplication_window \{#non_replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="0" />

非レプリケートな
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルで、
重複チェックのためにハッシュ値が保存される、直近で挿入されたブロック数。

設定可能な値:

- 任意の正の整数値。
- `0`（重複排除を無効化）。

レプリケートテーブル（[replicated_deduplication_window](#replicated_deduplication_window) 設定を参照）の場合と同様の
重複排除メカニズムが使用されます。
作成されたパーツのハッシュ値はディスク上のローカルファイルに書き込まれます。

## notify_newest_block_number \{#notify_newest_block_number\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

最新のブロック番号を SharedJoin または SharedSet に通知します。ClickHouse Cloud でのみ使用できます。

## nullable_serialization_version \{#nullable_serialization_version\}

<SettingsInfoBlock type="MergeTreeNullableSerializationVersion" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "basic"},{"label": "New setting"}]}]}/>

`Nullable(T)` カラムで使用されるシリアライズ方式を制御します。

指定可能な値:

- basic — `Nullable(T)` に標準的なシリアライズ方式を使用します。

- allow_sparse — `Nullable(T)` でスパースエンコーディングの使用を許可します。

## number_of_free_entries_in_pool_to_execute_mutation \{#number_of_free_entries_in_pool_to_execute_mutation\}

<SettingsInfoBlock type="UInt64" default_value="20" />

プール内の空きエントリ数が指定した値を下回る場合、パーツの mutation を実行しません。これは通常のマージ処理用にスレッドを確保し、「Too many parts」エラーを回避するためです。

Possible values:

- 任意の正の整数。

**Usage**

`number_of_free_entries_in_pool_to_execute_mutation` 設定の値は
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) の値よりも小さく設定する必要があります。
そうでない場合、ClickHouse は例外をスローします。

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition \{#number_of_free_entries_in_pool_to_execute_optimize_entire_partition\}

<SettingsInfoBlock type="UInt64" default_value="25" />

プール内の空きエントリ数が指定値より少ない場合、バックグラウンドでパーティション全体の最適化を実行しません（このタスクは `min_age_to_force_merge_seconds` を設定し、かつ `min_age_to_force_merge_on_partition_only` を有効にしたときに生成されます）。これは、通常のマージのための空きスレッドを確保しておき、「Too many parts」を回避するためです。

設定可能な値:

- 正の整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`
設定の値は、
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio)
の値より小さくする必要があります。そうでない場合、ClickHouse は例外をスローします。

## number_of_free_entries_in_pool_to_lower_max_size_of_merge \{#number_of_free_entries_in_pool_to_lower_max_size_of_merge\}

<SettingsInfoBlock type="UInt64" default_value="8" />

プール（またはレプリケーションキュー）内の空きエントリ数が指定された数を下回った場合、処理中（またはキューに投入される）マージの最大サイズを小さくし始めます。
これは、小さいマージを処理可能にし、長時間実行されるマージでプールが埋まってしまわないようにするためです。

取りうる値:

- 任意の正の整数値。

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\}

<SettingsInfoBlock type="UInt64" default_value="500" />

テーブルに未完了の mutation が少なくともこの数以上存在する場合、そのテーブルの mutation を意図的に遅延させます。
0 に設定すると無効になります。

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

テーブルに未完了の mutation がこの数以上ある場合、'Too many mutations'
例外をスローします。0 に設定すると無効になります。

## number_of_partitions_to_consider_for_merge \{#number_of_partitions_to_consider_for_merge\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud でのみ利用可能です。マージ対象として考慮するパーティションのうち、上位 N 個までを対象とします。パーティションは、そのパーティション内でマージ可能なデータパーツ数を重みとして、重みに比例した確率でランダムに選択されます。

## object_serialization_version \{#object_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "JSON シリアル化バージョンを制御する設定を追加"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "高度な共有データのシリアル化を使用するために、JSON の既定のシリアル化バージョンとして v3 を有効化"}]}]}/>

JSON データ型のシリアル化バージョン。互換性のために必要です。

指定可能な値:

- `v1`
- `v2`
- `v3`

共有データのシリアル化バージョンを変更できるのは、バージョン `v3` のみです。

## object_shared_data_buckets_for_compact_part \{#object_shared_data_buckets_for_compact_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "コンパクトパーツにおける JSON シリアライゼーションの共有データ用バケット数を制御する設定を追加"}]}]}/>

コンパクトパーツにおける JSON 共有データシリアライゼーション用のバケット数。`map_with_buckets` および `advanced` 共有データシリアライゼーションで機能します。

## object_shared_data_buckets_for_wide_part \{#object_shared_data_buckets_for_wide_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "Wide パーツにおける JSON シリアライゼーションで共有データ用のバケット数を制御するための設定を追加"}]}]}/>

Wide パーツにおける JSON 共有データシリアライゼーション用のバケット数。`map_with_buckets` および `advanced` 共有データシリアライゼーションで使用されます。

## object_shared_data_serialization_version \{#object_shared_data_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="advanced" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "advanced"},{"label": "Enable advanced shared data serialization version by default"}]}]}/>

JSON データ型内の共有データに対するシリアル化バージョン。

設定可能な値:

- `map` - 共有データを `Map(String, String)` として保存します。
- `map_with_buckets` - 共有データを複数の別々の `Map(String, String)` カラムとして保存します。バケットを使用することで、共有データから個々のパスを読み取る処理が高速化されます。
- `advanced` - 共有データから個々のパスを読み取る処理を大幅に改善することを目的として設計された、共有データ用の特別なシリアル化方式です。
このシリアル化では、大量の追加情報を保存するため、ディスク上の共有データのストレージサイズが増加する点に注意してください。

`map_with_buckets` および `advanced` シリアル化におけるバケット数は、設定
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part)
によって決まります。

## object_shared_data_serialization_version_for_zero_level_parts \{#object_shared_data_serialization_version_for_zero_level_parts\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map_with_buckets" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "ゼロレベルパーツに対する JSON シリアル化バージョンを制御するための設定を追加"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "map_with_buckets"},{"label": "ゼロレベルパーツに対する共有データのシリアル化バージョンとして map_with_buckets をデフォルトで有効化"}]}]}/>

この設定により、挿入時に作成されるゼロレベルパーツ向けに、JSON 型の共有データのシリアル化バージョンを指定できます。
ゼロレベルパーツに対しては、`advanced` 共有データシリアル化の使用は推奨されません。挿入時間が大幅に増加する可能性があるためです。

## old_parts_lifetime \{#old_parts_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="480" />

予期しないサーバー再起動時のデータ損失から保護するために、非アクティブなパーツを保持しておく時間（秒）。

設定可能な値:

- 任意の正の整数。

複数のパーツを 1 つの新しいパーツにマージした後、ClickHouse は元の
パーツを非アクティブとしてマークし、`old_parts_lifetime` 秒が経過してから削除します。
非アクティブなパーツは、現在のクエリで使用されていない場合、すなわち
そのパーツの `refcount` が 1 の場合に削除されます。

新しいパーツに対して `fsync` は呼び出されないため、ある程度の時間、新しいパーツは
サーバーの RAM（OS キャッシュ）上にしか存在しません。サーバーが予期せず再起動された場合、
新しいパーツが失われたり破損したりする可能性があります。データを保護するため、
非アクティブなパーツはすぐには削除されません。

起動時に、ClickHouse はパーツの整合性をチェックします。マージ後の
パーツが破損している場合、ClickHouse は非アクティブなパーツをアクティブなリストに戻し、
その後再度マージを行います。その後、破損したパーツはリネームされ（`broken_`
プレフィックスが追加され）、`detached` フォルダに移動されます。マージ後のパーツが
破損していない場合、元の非アクティブなパーツがリネームされ（`ignored_`
プレフィックスが追加され）、`detached` フォルダに移動されます。

デフォルトの `dirty_expire_centisecs` 値（Linux カーネルの設定）は 30 秒
（書き込まれたデータが RAM のみに保持される最大時間）ですが、ディスクシステムへの高負荷時には
データの書き込みがさらに遅れることがあります。実験的に、
`old_parts_lifetime` には 480 秒という値が選ばれており、この期間内に
新しいパーツが確実にディスクへ書き込まれることが保証されます。

## optimize_row_order \{#optimize_row_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

新しく挿入されるテーブルパーツの圧縮率を改善するために、挿入時に行の順序を最適化するかどうかを制御します。

通常の MergeTree エンジンテーブルに対してのみ効果があります。特殊な MergeTree エンジンテーブル（例: CollapsingMergeTree）には影響しません。

MergeTree テーブルは（オプションで）[compression codecs](/sql-reference/statements/create/table#column_compression_codec) を用いて圧縮されます。
LZ4 や ZSTD のような汎用圧縮コーデックは、データにパターンがある場合に最大の圧縮率を達成します。同じ値が長く連続している場合は、通常非常によく圧縮されます。

この設定を有効にすると、ClickHouse は新しく挿入されるパーツについて、新しいテーブルパーツのカラムをまたいだ同一値の連続区間の数が最小になるような行順序でデータを保存しようとします。
言い換えると、同一値の連続区間の数が少ないということは、個々の連続区間が長くなり、よく圧縮されることを意味します。

最適な行順序を見つけることは計算量的に実行不可能（NP 困難）です。
そのため、ClickHouse はヒューリスティック手法を用いて、元の行順序よりも圧縮率を改善しつつ、高速に行順序を見つけます。

<details markdown="1">

<summary>行順序を見つけるためのヒューリスティック手法</summary>

一般に、テーブル（またはテーブルパーツ）の行は自由にシャッフルすることが可能です。SQL の観点では、行順序が異なっていても同じテーブル（テーブルパーツ）と見なされるためです。

この行のシャッフルの自由度は、テーブルにプライマリキーが定義されている場合には制約されます。ClickHouse では、プライマリキー `C1, C2, ..., CN` により、テーブルの行はカラム `C1`, `C2`, ... `Cn` でソートされることが強制されます（[clustered index](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
その結果、行は「同値類」の内部でのみシャッフルできます。すなわち、プライマリキーのカラムに同じ値を持つ行同士です。
直感的には、高カーディナリティなプライマリキー（例: `DateTime64` の timestamp カラムを含むプライマリキー）は、小さな同値類を多数生み出します。同様に、低カーディナリティなプライマリキーを持つテーブルは、少数で大きな同値類を生み出します。プライマリキーを持たないテーブルは、すべての行をまたぐ単一の同値類という極端なケースを表します。

同値類の数が少なく、かつ同値類が大きいほど、行を再シャッフルする際の自由度は高くなります。

各同値類の内部で最適な行順序を見つけるために適用されるヒューリスティック手法は、
D. Lemire, O. Kaser による
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
で提案されており、非プライマリキーのカラムのカーディナリティの昇順で、各同値類内の行をソートすることに基づいています。

これは次の 3 ステップを実行します:
1. プライマリキーのカラムにおける行の値に基づいて、すべての同値類を見つける。
2. 各同値類について、非プライマリキーのカラムのカーディナリティを計算（通常は推定）する。
3. 各同値類について、非プライマリキーのカラムのカーディナリティの昇順で行をソートする。

</details>

有効にすると、新しいデータの行順序を解析・最適化するために、挿入処理に追加の CPU コストが発生します。データの特性にもよりますが、INSERT の実行時間は 30〜50% 長くなることが予想されます。
LZ4 や ZSTD の圧縮率は平均して 20〜40% 改善します。

この設定は、プライマリキーがない、あるいは低カーディナリティのプライマリキー（つまり、プライマリキーの異なる値が少ないテーブル）に対して最も効果的です。
`DateTime64` 型の timestamp カラムを含むような高カーディナリティなプライマリキーでは、この設定による恩恵は期待できません。

## part_moves_between_shards_delay_seconds \{#part_moves_between_shards_delay_seconds\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

分片間でパーツを移動する前後に待機する時間。

## part_moves_between_shards_enable \{#part_moves_between_shards_enable\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

パーツを分片間で移動するための実験的／未完成の機能です。シャーディング式は考慮されません。

## parts_to_delay_insert \{#parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

単一のパーティション内のアクティブなパーツ数が
`parts_to_delay_insert` の値を超えると、`INSERT` が意図的に遅くされます。

設定可能な値:

- 任意の正の整数。

ClickHouse は `INSERT` の実行時間を意図的に長くし（`sleep` を追加し）、バックグラウンドのマージ処理が、新たに追加される速度よりも速くパーツをマージできるようにします。

## parts_to_throw_insert \{#parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="3000" />

単一のパーティション内のアクティブなパーツ数が
`parts_to_throw_insert` の値を超えると、`INSERT` は `Too many
parts (N). Merges are processing significantly slower than inserts`
という例外とともに中断されます。

設定可能な値:

- 任意の正の整数。

`SELECT` クエリのパフォーマンスを最大化するには、処理されるパーツ数を最小化する必要があります。詳細は [Merge Tree](/development/architecture#merge-tree) を参照してください。

バージョン 23.6 より前では、この設定は 300 に設定されていました。より高い値を設定すると、`Too many parts`
エラーの発生確率は低くなりますが、その一方で `SELECT` のパフォーマンスが低下する可能性があります。また、マージに問題が発生した場合（たとえばディスク容量不足など）、元の値である 300 の場合よりも、その問題に気付くまでに時間がかかるようになります。

## prefer_fetch_merged_part_size_threshold \{#prefer_fetch_merged_part_size_threshold\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

パーツサイズの合計がこのしきい値を超え、かつレプリケーションログエントリ作成からの経過時間が
`prefer_fetch_merged_part_time_threshold` より長い場合、ローカルでマージを実行するのではなく、
レプリカからマージ済みパーツを優先的にフェッチします。この設定は、非常に長時間かかるマージを高速化するためのものです。

取りうる値:

- 任意の正の整数。

## prefer_fetch_merged_part_time_threshold \{#prefer_fetch_merged_part_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="3600" />

レプリケーションログ（ClickHouse Keeper または ZooKeeper）のエントリ作成からの経過時間がこのしきい値を超え、かつパーツのサイズの合計が `prefer_fetch_merged_part_size_threshold` より大きい場合、ローカルでマージを実行する代わりに、レプリカからマージ済みパーツをフェッチすることを優先します。これは、非常に長時間かかるマージを高速化するためです。

設定可能な値:

- 任意の正の整数。

## prewarm_mark_cache \{#prewarm_mark_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、挿入、マージ、フェッチおよびサーバー起動時にマークを mark cache に保存することで、
mark cache を事前にウォームアップします。

## prewarm_primary_key_cache \{#prewarm_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

true の場合、insert・merge・fetch 時およびサーバー起動時に mark を mark キャッシュに保存することで、プライマリ索引キャッシュが事前ウォームされます

## primary_key_compress_block_size \{#primary_key_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

プライマリキー圧縮用ブロックサイズ。圧縮されるブロックの実際のサイズです。

## primary_key_compression_codec \{#primary_key_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

プライマリキーで使用される圧縮コーデックです。プライマリキーは十分に小さくキャッシュされるため、デフォルトの圧縮コーデックは ZSTD(3) です。

## primary_key_lazy_load \{#primary_key_lazy_load\}

<SettingsInfoBlock type="Bool" default_value="1" />

テーブルの初期化時ではなく、初回アクセス時にプライマリキーをメモリにロードします。これにより、多数のテーブルが存在する場合にメモリ使用量を節約できます。

## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns \{#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns\}

<SettingsInfoBlock type="Float" default_value="0.9" />

データパーツ内でプライマリキーのカラム値が少なくともこの比率の頻度で変化する場合、後続のカラムをメモリに読み込むことをスキップします。これにより、プライマリキーの不要なカラムを読み込まずにメモリ使用量を削減できます。

## ratio_of_defaults_for_sparse_serialization \{#ratio_of_defaults_for_sparse_serialization\}

<SettingsInfoBlock type="Float" default_value="0.9375" />

カラム内の *デフォルト* 値の個数と *すべての* 値の個数との比率の下限。
この値を指定すると、カラムはスパースシリアライゼーションを使って保存されます。

カラムがスパース（ほとんどが 0 である）場合、ClickHouse はそれをスパース形式でエンコードし、
計算を自動的に最適化できます。これにより、クエリ実行中にデータを完全に伸長する必要がありません。
このスパースシリアライゼーションを有効にするには、
`ratio_of_defaults_for_sparse_serialization` 設定を 1.0 未満に設定します。
値が 1.0 以上の場合、カラムは常に通常のフルシリアライゼーションで書き込まれます。

設定可能な値:

* スパースシリアライゼーションを有効にするには `0` から `1` の間の Float
* スパースシリアライゼーションを使用しない場合は `1.0`（またはそれ以上）

**例**

次のテーブルでは、`s` カラムは 95% の行で空文字列であることに注目してください。
`my_regular_table` ではスパースシリアライゼーションを使用しておらず、
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

`my_sparse_table` の `s` カラムは、ディスク上の使用容量が少なくなっていることに注目してください:

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

カラムがスパースエンコーディングを使用しているかどうかは、`system.parts_columns` テーブルの `serialization_kind` カラムを参照することで確認できます。

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

`s` のうち、どのパーツがスパースシリアライゼーションで保存されているかを確認できます。

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


## reduce_blocking_parts_sleep_ms \{#reduce_blocking_parts_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5000"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud でのみ利用可能です。`reduce_blocking_parts` が一切の範囲を `drop` / `replace` しなかった場合に、再度ブロック中のパーツの削減を試行するまで待機する最小時間です。値を小さくすると、`background_schedule_pool` 内のタスクが高頻度でトリガーされ、大規模なクラスターでは ZooKeeper へのリクエストが大量に発生します。

## refresh_parts_interval \{#refresh_parts_interval\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>

値が 0 より大きい場合、データがバックグラウンドで更新されていないか確認するために、基盤となるファイルシステムからデータパーツの一覧を再読み込みします。
テーブルが読み取り専用ディスク上に存在する場合にのみ設定できます（これは、このテーブルが読み取り専用レプリカであり、データは別のレプリカによって書き込まれていることを意味します）。

## refresh_statistics_interval \{#refresh_statistics_interval\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

統計キャッシュをリフレッシュする間隔（秒）です。0 に設定すると、リフレッシュは無効になります。

## remote_fs_execute_merges_on_single_replica_time_threshold \{#remote_fs_execute_merges_on_single_replica_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="10800" />

この設定が 0 より大きい値に設定されている場合、共有ストレージ上にマージ後のパーツがあるときは、単一のレプリカのみが直ちにマージを開始します。

:::note
ゼロコピーレプリケーションは本番利用できる状態ではありません
ゼロコピーレプリケーションは ClickHouse バージョン 22.8 以降ではデフォルトで無効化されています。

この機能は本番環境での利用は推奨されません。
:::

指定可能な値:

- 正の整数。

## remote_fs_zero_copy_path_compatible_mode \{#remote_fs_zero_copy_path_compatible_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

変換処理中は、互換モードでゼロコピーを実行します。

## remote_fs_zero_copy_zookeeper_path \{#remote_fs_zero_copy_zookeeper_path\}

<ExperimentalBadge/>

<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

ゼロコピーに関するテーブル非依存情報用の ZooKeeper パス。

## remove_empty_parts \{#remove_empty_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効期限 (TTL)、mutation、または collapsing merge アルゴリズムによりデータが削除されて空になったパーツを削除します。

## remove_rolled_back_parts_immediately \{#remove_rolled_back_parts_immediately\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

未完成の実験的機能向けの設定です。

## remove_unused_patch_parts \{#remove_unused_patch_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

すべてのアクティブなパーツに適用済みのパッチパーツをバックグラウンドで削除します。

## replace_long_file_name_to_hash \{#replace_long_file_name_to_hash\}

<SettingsInfoBlock type="Bool" default_value="1" />

カラム用のファイル名が長すぎる場合（`max_file_name_length` バイトを超える場合）、そのファイル名を SipHash128 のハッシュ値に置き換えます。

## replicated_can_become_leader \{#replicated_can_become_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

`true` の場合、このノード上のレプリケーテッドテーブルのレプリカは
リーダーの取得を試みます。

設定可能な値:

- `true`
- `false`

## replicated_deduplication_window \{#replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>

ClickHouse Keeper が重複チェックのためにハッシュ値を保存する、直近に挿入されたブロックの数を表します。

設定可能な値:

- 任意の正の整数。
- 0（重複排除を無効化）

`Insert` コマンドは 1 つ以上のブロック（パーツ）を作成します。
[insert deduplication](../../engines/table-engines/mergetree-family/replication.md)
のために、レプリケートされたテーブルへ書き込む際、ClickHouse は作成されたパーツのハッシュ値を ClickHouse Keeper に書き込みます。ハッシュ値は直近の `replicated_deduplication_window` 個のブロックに対してのみ保存されます。最も古いハッシュ値は ClickHouse Keeper から削除されます。

`replicated_deduplication_window` を大きな値にすると、より多くのエントリーを比較する必要があるため、`Inserts` が遅くなります。ハッシュ値はフィールド名と型、および挿入されたパーツのデータ（バイト列）の組み合わせから計算されます。

## replicated_deduplication_window_for_async_inserts \{#replicated_deduplication_window_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse Keeper が、重複チェックのためにハッシュ値を保持する、非同期で挿入された最新ブロックの数。

利用可能な値:

- 任意の正の整数。
- 0（`async_inserts` に対する重複排除を無効化）

[Async Insert](/operations/settings/settings#async_insert) コマンドは、1つ以上のブロック（パーツ）としてキャッシュされます。[insert deduplication](/engines/table-engines/mergetree-family/replication) を使用するレプリケーションテーブルへの書き込み時には、ClickHouse は各挿入のハッシュ値を ClickHouse Keeper に書き込みます。ハッシュ値は、直近の `replicated_deduplication_window_for_async_inserts` 個のブロックに対してのみ保存されます。最も古いハッシュ値は ClickHouse Keeper から削除されます。
`replicated_deduplication_window_for_async_inserts` を大きくすると、比較対象のエントリ数が増えるため `Async Inserts` が遅くなります。
ハッシュ値は、フィールド名と型の構成、および挿入データ（バイト列）の組み合わせから計算されます。

## replicated_deduplication_window_seconds \{#replicated_deduplication_window_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>

挿入されたブロックのハッシュ値が ClickHouse Keeper から削除されるまでの秒数を指定します。

可能な値:

- 任意の正の整数。

[replicated_deduplication_window](#replicated_deduplication_window) と同様に、
`replicated_deduplication_window_seconds` は挿入の重複排除のために
ブロックのハッシュ値をどのくらいの期間保持するかを指定します。
`replicated_deduplication_window_seconds` より古いハッシュ値は、
たとえ `replicated_deduplication_window` 未満であっても ClickHouse Keeper
から削除されます。

この時間はウォールクロック時刻ではなく、最新レコードの時刻に対する相対時間です。
それが唯一のレコードである場合、そのレコードは無期限に保持されます。

## replicated_deduplication_window_seconds_for_async_inserts \{#replicated_deduplication_window_seconds_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="604800" />

非同期 insert のハッシュ値が ClickHouse Keeper から削除されるまでの秒数。

可能な値:

- 任意の正の整数。

[replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts) と同様に、
`replicated_deduplication_window_seconds_for_async_inserts` は非同期 insert の重複排除のために、
ブロックのハッシュ値をどのくらいの期間保持するかを指定します。
`replicated_deduplication_window_seconds_for_async_inserts` より古いハッシュ値は、
`replicated_deduplication_window_for_async_inserts` より小さい場合でも ClickHouse Keeper から削除されます。

時間はウォールクロック時刻ではなく、最新レコードの時刻を基準にします。
もしそれが唯一のレコードであれば、そのレコードのハッシュ値は永久に保持されます。

## replicated_fetches_http_connection_timeout \{#replicated_fetches_http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

この設定は廃止されており、何の効果もありません。

## replicated_fetches_http_receive_timeout \{#replicated_fetches_http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

非推奨の設定であり、現在は何の効果もありません。

## replicated_fetches_http_send_timeout \{#replicated_fetches_http_send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

廃止された設定であり、効果はありません。

## replicated_max_mutations_in_one_entry \{#replicated_max_mutations_in_one_entry\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

1つの MUTATE_PART エントリ内で、まとめてマージして実行できる mutation コマンドの最大数（0 の場合は無制限）

## replicated_max_parallel_fetches \{#replicated_max_parallel_fetches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定で、現在は何の効果もありません。

## replicated_max_parallel_fetches_for_host \{#replicated_max_parallel_fetches_for_host\}

<SettingsInfoBlock type="UInt64" default_value="15" />

廃止された設定であり、現在は何の効果もありません。

## replicated_max_parallel_fetches_for_table \{#replicated_max_parallel_fetches_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定で、何の効果もありません。

## replicated_max_parallel_sends \{#replicated_max_parallel_sends\}

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定は廃止されており、効果はありません。

## replicated_max_parallel_sends_for_table \{#replicated_max_parallel_sends_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止されており、現在は何の効果もありません。

## replicated_max_ratio_of_wrong_parts \{#replicated_max_ratio_of_wrong_parts\}

<SettingsInfoBlock type="Float" default_value="0.5" />

誤ったパーツ数と全パーツ数との比率がこの値より小さい場合は、
起動を許可します。

取りうる値:

- Float, 0.0 - 1.0

## search_orphaned_parts_disks \{#search_orphaned_parts_disks\}

<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>

ClickHouse は、ATTACH や CREATE TABLE が行われるたびに、ポリシーに含まれていない（未定義の）ディスク上のデータ パーツを見落とさないように、すべてのディスクをスキャンして孤立したパーツを検索します。
孤立したパーツは、ディスクがストレージポリシーから除外された場合など、安全でない可能性のあるストレージ再構成が原因で発生します。
この設定は、ディスクの特性に基づいて、検索対象とするディスクの範囲を制限します。

指定可能な値:

- any - 範囲を制限しません。
- local - ローカルディスクに範囲を制限します。
- none - 空の範囲、検索を行いません。

## serialization_info_version \{#serialization_info_version\}

<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "カスタム文字列シリアル化を可能にする新しいフォーマットへの変更"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "新しい設定"}]}]}/>

`serialization.json` を書き込む際に使用されるシリアル化情報のバージョンです。
この設定は、クラスターのアップグレード時の互換性を確保するために必要です。

指定可能な値:

- `basic` - 基本フォーマット。
- `with_types` - 追加の `types_serialization_versions` フィールドを持つフォーマットで、型ごとにシリアル化バージョンを指定できます。
これにより、`string_serialization_version` のような設定が有効になります。

ローリングアップグレード中は、これを `basic` に設定し、新しいサーバーが古いサーバーと互換性のあるデータパーツを生成するようにします。アップグレードが完了したら、
型ごとのシリアル化バージョンを有効にするために `with_types` に切り替えます。

## shared_merge_tree_activate_coordinated_merges_tasks \{#shared_merge_tree_activate_coordinated_merges_tasks\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定"}]}]}/>

協調マージタスクの再スケジューリングを有効にします。これは shared_merge_tree_enable_coordinated_merges=0 に設定されている場合でも有用です。この設定を有効にするとマージコーディネーターの統計情報が蓄積され、コールドスタート時に役立ちます。

## shared_merge_tree_create_per_replica_metadata_nodes \{#shared_merge_tree_create_per_replica_metadata_nodes\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Keeper 内のメタデータ量を削減します。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud 同期"}]}]}/>

ZooKeeper 内でレプリカごとの /metadata および /columns ノードの作成を有効にします。
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_disable_merges_and_mutations_assignment \{#shared_merge_tree_disable_merges_and_mutations_assignment\}

<SettingsInfoBlock type="Bool" default_value="0" />

shared MergeTree に対するマージおよびミューテーションの割り当てを停止します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_empty_partition_lifetime \{#shared_merge_tree_empty_partition_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "New setting"}]}]}/>

パーツを持たないパーティションが Keeper に保持される時間（秒）。

## shared_merge_tree_enable_automatic_empty_partitions_cleanup \{#shared_merge_tree_enable_automatic_empty_partitions_cleanup\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

空のパーティションに対応する Keeper エントリの自動クリーンアップを有効にします。

## shared_merge_tree_enable_coordinated_merges \{#shared_merge_tree_enable_coordinated_merges\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>

協調マージ戦略を有効化します

## shared_merge_tree_enable_keeper_parts_extra_data \{#shared_merge_tree_enable_keeper_parts_extra_data\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

仮想パーツへの属性書き込みと、keeper 内でのブロックのコミットを有効化します

## shared_merge_tree_enable_outdated_parts_check \{#shared_merge_tree_enable_outdated_parts_check\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

古いパーツのチェックを有効にします。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_idle_parts_update_seconds \{#shared_merge_tree_idle_parts_update_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>

SharedMergeTree において、ZooKeeper の watch によるトリガーがない場合にパーツを更新する間隔（秒単位）。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_initial_parts_update_backoff_ms \{#shared_merge_tree_initial_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>

パーツ更新に対する初期バックオフ時間。ClickHouse Cloud でのみ使用可能です

## shared_merge_tree_interserver_http_connection_timeout_ms \{#shared_merge_tree_interserver_http_connection_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>

サーバー間 HTTP 接続用のタイムアウト値。ClickHouse Cloud でのみ利用可能です

## shared_merge_tree_interserver_http_timeout_ms \{#shared_merge_tree_interserver_http_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

サーバー間 HTTP 通信のタイムアウト値。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_leader_update_period_random_add_seconds \{#shared_merge_tree_leader_update_period_random_add_seconds\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

shared_merge_tree_leader_update_period に 0 以上 x 以下の一様分布に従う秒数を加算して、thundering herd エフェクトを回避します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_leader_update_period_seconds \{#shared_merge_tree_leader_update_period_seconds\}

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

パーツ更新におけるリーダー権限を再確認する最大間隔です。ClickHouse Cloud でのみ利用可能です

## shared_merge_tree_max_outdated_parts_to_process_at_once \{#shared_merge_tree_max_outdated_parts_to_process_at_once\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

1 回の HTTP リクエストにつき、リーダーが削除対象として確認しようとする古いパーツの最大数です。ClickHouse Cloud でのみ使用可能です。

## shared_merge_tree_max_parts_update_backoff_ms \{#shared_merge_tree_max_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "New setting"}]}]}/>

パーツ更新のバックオフ時間の上限。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_parts_update_leaders_in_total \{#shared_merge_tree_max_parts_update_leaders_in_total\}

<SettingsInfoBlock type="UInt64" default_value="6" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

パーツの更新リーダーの最大数。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_parts_update_leaders_per_az \{#shared_merge_tree_max_parts_update_leaders_per_az\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

パーツの更新リーダーの最大数。ClickHouse Cloud でのみ使用可能です

## shared_merge_tree_max_replicas_for_parts_deletion \{#shared_merge_tree_max_replicas_for_parts_deletion\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

パーツ削除（killer thread）に関与する最大レプリカ数。ClickHouse Cloud でのみ使用可能です

## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range \{#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range\}

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

競合する可能性のあるマージの割り当てを行おうとするレプリカの最大数（マージ割り当て時の不要な競合を回避するため）。0 は無効を意味します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_suspicious_broken_parts \{#shared_merge_tree_max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT における破損パーツの最大数。この値を超えた場合、自動 detach を行いません。"}]}]}/>

SMT における破損パーツの最大数。この値を超えた場合、自動 detach を行いません。

## shared_merge_tree_max_suspicious_broken_parts_bytes \{#shared_merge_tree_max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT におけるすべての破損パーツの合計最大サイズ。この値を超える場合は、自動的な detach を拒否する。"}]}]}/>

SMT におけるすべての破損パーツの合計最大サイズ。この値を超える場合は、自動的な detach を拒否します。

## shared_merge_tree_memo_ids_remove_timeout_seconds \{#shared_merge_tree_memo_ids_remove_timeout_seconds\}

<SettingsInfoBlock type="Int64" default_value="1800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

挿入の再試行時に誤った処理が行われるのを避けるために、挿入メモ化 ID をどのくらいの期間保持しておくかを指定します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_merge_coordinator_election_check_period_ms \{#shared_merge_tree_merge_coordinator_election_check_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

マージコーディネーター選出を行うスレッドの実行間隔

## shared_merge_tree_merge_coordinator_factor \{#shared_merge_tree_merge_coordinator_factor\}

<BetaBadge/>

<SettingsInfoBlock type="Float" default_value="1.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "Lower coordinator sleep time after load"}]}]}/>

コーディネータースレッドの待機時間を変化させる係数

## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms \{#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

マージコーディネーターが最新のメタデータを取得するために ZooKeeper と同期する間隔

## shared_merge_tree_merge_coordinator_max_merge_request_size \{#shared_merge_tree_merge_coordinator_max_merge_request_size\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

コーディネータが一度に MergerMutator に要求できるマージ数

## shared_merge_tree_merge_coordinator_max_period_ms \{#shared_merge_tree_merge_coordinator_max_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

マージコーディネータースレッドの実行間隔の最大値

## shared_merge_tree_merge_coordinator_merges_prepare_count \{#shared_merge_tree_merge_coordinator_merges_prepare_count\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

コーディネーターが準備し、ワーカー間に分散するマージエントリの数

## shared_merge_tree_merge_coordinator_min_period_ms \{#shared_merge_tree_merge_coordinator_min_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

merge coordinator スレッドの実行と実行の間の最小時間

## shared_merge_tree_merge_worker_fast_timeout_ms \{#shared_merge_tree_merge_worker_fast_timeout_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

マージワーカースレッドが、即時のアクション後に自身の状態を更新する必要がある場合に使用されるタイムアウト値

## shared_merge_tree_merge_worker_regular_timeout_ms \{#shared_merge_tree_merge_worker_regular_timeout_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "新しい設定"}]}]}/>

merge worker スレッドが実行される間隔

## shared_merge_tree_outdated_parts_group_size \{#shared_merge_tree_outdated_parts_group_size\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>

古いパーツのクリーンアップのために、同じランデブーハッシュグループに含めるレプリカの数。
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations \{#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations\}

<SettingsInfoBlock type="Float" default_value="0.5" />

`<ミューテーション対象の候補パーティションのうち、マージ不可能なパーティションのみ>/<ミューテーション対象の候補パーティション全体>` の比率がこの設定値より高い場合に、merge/mutate の選択タスクにおいて merge predicate を再読み込みします。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_parts_load_batch_size \{#shared_merge_tree_parts_load_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="32" />

一度にスケジュールするパーツメタデータをフェッチするジョブの数。ClickHouse Cloud でのみ利用可能です

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

ローカルでマージ済みのパーツを、このパーツを含む新たなマージを開始せずに保持しておく時間。  
他のレプリカがそのパーツをフェッチし、このマージを開始する機会を与えます。  
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

ローカルでマージを実行した直後に次のマージを割り当てる処理を先送りする際の、パーツの最小サイズ（行数）。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_range_for_merge_window_size \{#shared_merge_tree_range_for_merge_window_size\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

ある part を含む新しいマージを開始せずに、ローカルでマージ済みの part を保持しておく時間です。  
他のレプリカがその part を取得し、同じマージ処理を開始できるようにします。  
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_read_virtual_parts_from_leader \{#shared_merge_tree_read_virtual_parts_from_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

可能な場合はリーダーから仮想パーツを読み込みます。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas \{#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "他のレプリカからメモリ内のパーツデータを取得するための新しい設定"}]}]}/>

有効にすると、すべてのレプリカが、すでに存在している他のレプリカからパーツのメモリ内データ（プライマリキーやパーティション情報など）を取得しようとします。

## shared_merge_tree_update_replica_flags_delay_ms \{#shared_merge_tree_update_replica_flags_delay_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "新しい設定"}]}]}/>

バックグラウンドスケジュールに従って、レプリカがフラグを再読み込みしようとする間隔。

## shared_merge_tree_use_metadata_hints_cache \{#shared_merge_tree_use_metadata_hints_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

他のレプリカにあるインメモリキャッシュから、FS キャッシュ向けのヒントを要求できるようにします。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_use_outdated_parts_compact_format \{#shared_merge_tree_use_outdated_parts_compact_format\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "デフォルトで outdated parts v3 を有効化"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同期"}]}]}/>

outdated パーツにコンパクト形式を使用します。Keeper への負荷を軽減し、
outdated パーツの処理を改善します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_use_too_many_parts_count_from_virtual_parts \{#shared_merge_tree_use_too_many_parts_count_from_virtual_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

有効にすると、「過剰なパーツ数」カウンターはローカルのレプリカ状態ではなく、Keeper 内の共有データに基づいて動作します。ClickHouse Cloud でのみ使用できます。

## shared_merge_tree_virtual_parts_discovery_batch \{#shared_merge_tree_virtual_parts_discovery_batch\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

1 回のバッチにまとめるパーティション検出処理の数

## simultaneous_parts_removal_limit \{#simultaneous_parts_removal_limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

古いパーツが多数ある場合、クリーンアップスレッドは 1 回のイテレーションで最大 `simultaneous_parts_removal_limit` 個のパーツを削除しようとします。
`simultaneous_parts_removal_limit` を `0` に設定すると、無制限となります。

## sleep_before_commit_local_part_in_replicated_table_ms \{#sleep_before_commit_local_part_in_replicated_table_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

テスト目的の設定です。変更しないでください。

## sleep_before_loading_outdated_parts_ms \{#sleep_before_loading_outdated_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

テスト目的で使用します。変更しないでください。

## storage_policy \{#storage_policy\}

<SettingsInfoBlock type="String" default_value="default" />

ストレージディスクのポリシー名

## string_serialization_version \{#string_serialization_version\}

<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "サイズを別ストリームで保持する新しい形式への変更"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "新しい設定"}]}]}/>

トップレベルの `String` カラムに対するシリアライズ形式を制御します。

この設定は、`serialization_info_version` が "with_types" に設定されている場合にのみ有効です。
`with_size_stream` に設定すると、トップレベルの `String` カラムはサイズをインラインではなく、
文字列長を保持する専用の `.size` サブカラムでシリアライズされます。これにより、実際の `.size`
サブカラムを利用できるようになり、圧縮効率が向上する場合があります。

`Nullable`、`LowCardinality`、`Array`、`Map` の内部などのネストされた `String` 型は、
`Tuple` 内に現れる場合を除き、影響を受けません。

取りうる値:

- `single_stream` — サイズをインラインで保持する標準的なシリアライズ形式を使用します。
- `with_size_stream` — トップレベルの `String` カラムに対してサイズ用の専用ストリームを使用します。

## table_disk \{#table_disk\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

これは table_disk の設定であり、path/endpoint はデータベースのデータではなくテーブルデータを指すように指定する必要があります。s3_plain/s3_plain_rewritable/web の場合にのみ設定できます。

## temporary_directories_lifetime \{#temporary_directories_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

tmp_- ディレクトリを保持する秒数。この値をあまり小さく設定しないでください。マージやミューテーションが正しく動作しなくなる可能性があります。

## try_fetch_recompressed_part_timeout \{#try_fetch_recompressed_part_timeout\}

<SettingsInfoBlock type="Seconds" default_value="7200" />

再圧縮を伴うマージを開始する前に待機するタイムアウト（秒）。この時間中、ClickHouse はこの再圧縮マージが割り当てられているレプリカから、再圧縮済みパーツのフェッチを試みます。

多くの場合、再圧縮は低速であるため、このタイムアウトに達するまでは再圧縮を伴うマージを開始せず、この再圧縮マージが割り当てられているレプリカから再圧縮済みパーツをフェッチしようとします。

取りうる値:

- 任意の正の整数。

## ttl_only_drop_parts \{#ttl_only_drop_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

`TTL` 設定に従って、そのパーツ内のすべての行が有効期限切れになった場合に、MergeTree テーブルでデータパーツを完全に削除するかどうかを制御します。

`ttl_only_drop_parts` が無効（デフォルト）の場合は、有効期限 (TTL) に基づき失効した行のみが削除されます。

`ttl_only_drop_parts` が有効な場合は、そのパーツ内のすべての行が `TTL` 設定に従って有効期限切れになっているとき、パーツ全体が削除されます。

## use_adaptive_write_buffer_for_dynamic_subcolumns \{#use_adaptive_write_buffer_for_dynamic_subcolumns\}

<SettingsInfoBlock type="Bool" default_value="1" />

動的サブカラムの書き込み時にアダプティブな書き込みバッファを使用し、メモリ使用量を削減します

## use_async_block_ids_cache \{#use_async_block_ids_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、非同期 INSERT のハッシュ値をキャッシュします。

設定可能な値:

- `true`
- `false`

複数の非同期 INSERT を含むブロックは、複数のハッシュ値を生成します。
一部の INSERT が重複している場合、Keeper は 1 回の RPC で重複したハッシュ値を 1 つしか返さず、その結果として不要な RPC の再試行が発生します。
このキャッシュは Keeper 内のハッシュ値のパスを監視します。Keeper で更新が検知されると、キャッシュは可能な限り早く更新され、メモリ上で重複した INSERT をフィルタリングできるようになります。

## use_compact_variant_discriminators_serialization \{#use_compact_variant_discriminators_serialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

Variant データ型における discriminator のバイナリシリアル化に対してコンパクトモードを有効にします。
このモードでは、ほとんどが 1 種類の variant である場合や、多数の NULL 値が含まれる場合に、
パーツ内の discriminator を格納するために必要なメモリ量を大幅に削減できます。

## use_const_adaptive_granularity \{#use_const_adaptive_granularity\}

<SettingsInfoBlock type="Bool" default_value="0" />

常にパーツ全体に対して一定の granularity を使用します。これにより、索引 granularity のメモリ上の値を圧縮できます。非常に大規模なワークロードで、列数の少ない（thin）テーブルを扱う場合に有用です。

## use_metadata_cache \{#use_metadata_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

廃止された設定であり、現在は何の効果もありません。

## use_minimalistic_checksums_in_zookeeper \{#use_minimalistic_checksums_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper 内のパートチェックサムに対して、従来の形式（数十 KB）ではなく、
より小さい形式（数十バイト）を使用します。有効にする前に、すべてのレプリカが
新しい形式をサポートしていることを確認してください。

## use_minimalistic_part_header_in_zookeeper \{#use_minimalistic_part_header_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper におけるデータパーツのヘッダーの保存方式を指定します。有効にすると、ZooKeeper に保存されるデータ量が少なくなります。詳細については[こちら](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)を参照してください。

## use_primary_key_cache \{#use_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

すべての索引をメモリ上に保持する代わりに、
プライマリ索引用のキャッシュを利用します。非常に大きなテーブルでは有用です。

## vertical_merge_algorithm_min_bytes_to_activate \{#vertical_merge_algorithm_min_bytes_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Vertical merge algorithm を有効化するために必要となる、マージ対象パーツの非圧縮サイズ（バイト単位）の最小（概算）値。

## vertical_merge_algorithm_min_columns_to_activate \{#vertical_merge_algorithm_min_columns_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="11" />

Vertical マージアルゴリズムを有効化するために必要な PK 以外のカラム数の最小値。

## vertical_merge_algorithm_min_rows_to_activate \{#vertical_merge_algorithm_min_rows_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

Vertical merge アルゴリズムを有効化するために必要な、
マージ対象パーツの行数合計の概算最小値。

## vertical_merge_optimize_lightweight_delete \{#vertical_merge_optimize_lightweight_delete\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

true の場合、vertical merge 時に論理削除が最適化されます。

## vertical_merge_remote_filesystem_prefetch \{#vertical_merge_remote_filesystem_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、マージ中に次のカラムのデータをリモートファイルシステムから先読み（プリフェッチ）します

## wait_for_unique_parts_send_before_shutdown_ms \{#wait_for_unique_parts_send_before_shutdown_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

シャットダウン前に、テーブルはユニークなパーツ
（現在のレプリカのみに存在するパーツ）が他のレプリカによって取得されるまで、指定された時間だけ待機します（0 の場合は無効）。

## write_ahead_log_bytes_to_fsync \{#write_ahead_log_bytes_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

廃止された設定であり、現在は効果がありません。

## write_ahead_log_interval_ms_to_fsync \{#write_ahead_log_interval_ms_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="100" />

この設定は廃止されており、何も行いません。

## write_ahead_log_max_bytes \{#write_ahead_log_max_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

廃止された設定であり、現在は何の効果もありません。

## write_final_mark \{#write_final_mark\}

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は現在は廃止されており、何も行いません。

## write_marks_for_substreams_in_compact_parts \{#write_marks_for_substreams_in_compact_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "デフォルトで Compact パーツ内のサブストリームに対してマークを書き込むように有効化"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定"}]}]}/>

Compact パーツ内でカラムごとではなくサブストリームごとにマークを書き込むことを有効にします。
これにより、データパートから個々のサブカラムを効率的に読み取ることができます。

例えば、カラム `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` は次のサブストリームにシリアライズされます:

- タプル要素 `a` の String データ用の `t.a`
- タプル要素 `b` の UInt32 データ用の `t.b`
- タプル要素 `c` の配列サイズ用の `t.c.size0`
- タプル要素 `c` のネストした配列要素の null マップ用の `t.c.null`
- タプル要素 `c` のネストした配列要素の UInt32 データ用の `t.c`

この設定が有効な場合、これら 5 つのサブストリームそれぞれに対してマークを書き込みます。これは、必要に応じて、
各サブストリームのデータをグラニュールから個別に読み取ることができることを意味します。例えば、サブカラム `t.c` を読み取りたい場合、
サブストリーム `t.c.size0`、`t.c.null` および `t.c` のデータのみを読み取り、サブストリーム `t.a` および `t.b` からはデータを読み取りません。
この設定が無効な場合は、最上位カラム `t` に対してのみマークを書き込みます。これは、一部のサブストリームのデータだけが必要な場合でも、
常にグラニュールからカラム全体のデータを読み取ることになることを意味します。

## zero_copy_concurrent_part_removal_max_postpone_ratio \{#zero_copy_concurrent_part_removal_max_postpone_ratio\}

<SettingsInfoBlock type="Float" default_value="0.05" />

より小さな独立した範囲を得るために、削除を延期できるトップレベルパーツの最大割合。変更しないことを推奨します。

## zero_copy_concurrent_part_removal_max_split_times \{#zero_copy_concurrent_part_removal_max_split_times\}

<SettingsInfoBlock type="UInt64" default_value="5" />

独立した Outdated パーツの範囲を、より小さいサブレンジに分割する際の最大再帰深度です。変更しないことを推奨します。

## zero_copy_merge_mutation_min_parts_size_sleep_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

zero copy レプリケーションが有効な場合、マージまたはミューテーション処理におけるパーツサイズに応じて、ロックの取得を試行する前にランダムな時間だけ待機します

## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

ゼロコピー レプリケーションが有効な場合、マージまたはミューテーションのロックを取得しようとする前に、最大 500 ms のランダムな時間だけスリープします。

## zookeeper_session_expiration_check_period \{#zookeeper_session_expiration_check_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper セッションの有効期限チェック間隔（秒）。

取り得る値:

- 任意の正の整数。