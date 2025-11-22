---
description: '`system.merge_tree_settings` に含まれる MergeTree 向け設定'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree テーブルの設定'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

システムテーブル `system.merge_tree_settings` は、グローバルに設定された MergeTree の設定を表示します。

MergeTree の設定は、サーバー設定ファイルの `merge_tree` セクションで一括して設定するか、`CREATE TABLE` ステートメントの `SETTINGS` 句で各 `MergeTree` テーブルごとに個別指定できます。

`max_suspicious_broken_parts` 設定をカスタマイズする例:

サーバー設定ファイルで、すべての `MergeTree` テーブルに適用されるデフォルト値を設定します。

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

特定のテーブル向けの設定：

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

-- グローバルデフォルトにリセット（system.merge_tree_settings の値）
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## MergeTree設定 {#mergetree-settings}

<!-- 以下の設定は次のスクリプトによって自動生成されています:
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
-->

## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size}

<SettingsInfoBlock type='UInt64' default_value='16384' />

アダプティブ書き込みバッファの初期サイズ


## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine}

<SettingsInfoBlock type='Bool' default_value='0' />

trueの場合、CollapsingMergeTreeまたはVersionedCollapsingMergeTreeテーブルの`sign`カラムに対して、有効な値（`1`および`-1`）のみを許可する暗黙的な制約を追加します。


## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

有効にすると、テーブルのすべての数値列に対してmin-max（スキッピング）インデックスが追加されます。


## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

有効にすると、テーブルのすべての文字列カラムに対してmin-max（スキップ）インデックスが追加されます。


## allow_coalescing_columns_in_partition_or_order_key {#allow_coalescing_columns_in_partition_or_order_key}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.6" },
        { label: "0" },
        {
          label:
            "パーティションキーまたはソートキー列の統合を許可する新しい設定。"
        }
      ]
    }
  ]}
/>

有効にすると、CoalescingMergeTreeテーブルの統合対象列をパーティションキーまたはソートキーで使用できるようになります。


## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

`is_deleted`列を持つReplacingMergeTreeに対する実験的なCLEANUPマージを許可します。有効にすると、`OPTIMIZE ... FINAL CLEANUP`を使用して、パーティション内のすべてのパートを手動で単一のパートにマージし、削除された行を除去できます。

また、`min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only`、`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`の設定を使用して、このようなマージをバックグラウンドで自動的に実行することもできます。


## allow_experimental_reverse_key {#allow_experimental_reverse_key}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

MergeTreeソートキーにおける降順ソート順序のサポートを有効にします。この設定は時系列分析やTop-Nクエリに特に有用で、データを逆時系列順に格納することでクエリパフォーマンスを最適化できます。

`allow_experimental_reverse_key`を有効にすると、MergeTreeテーブルの`ORDER BY`句内で降順ソート順序を定義できます。これにより、降順クエリに対して`ReadInReverseOrder`の代わりにより効率的な`ReadInOrder`最適化を使用できるようになります。

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

クエリで`ORDER BY time DESC`を使用することで、`ReadInOrder`が適用されます。

**デフォルト値:** false


## allow_floating_point_partition_key {#allow_floating_point_partition_key}

<SettingsInfoBlock type='Bool' default_value='0' />

パーティションキーとして浮動小数点数を使用できるようにします。

設定可能な値:

- `0` — 浮動小数点数のパーティションキーは使用できません。
- `1` — 浮動小数点数のパーティションキーを使用できます。


## allow_nullable_key {#allow_nullable_key}

<SettingsInfoBlock type='Bool' default_value='0' />

Nullable型を主キーとして許可します。


## allow_part_offset_column_in_projections {#allow_part_offset_column_in_projections}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "1" },
        { label: "プロジェクションで_part_offset列が使用可能になりました。" }
      ]
    },
    {
      id: "row-2",
      items: [
        { label: "25.5" },
        { label: "0" },
        {
          label:
            "新しい設定です。安定化されるまで、親パートオフセット列を含むプロジェクションの作成を防ぎます。"
        }
      ]
    }
  ]}
/>

プロジェクションのSELECTクエリで'\_part_offset'列の使用を許可します。


## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.2" },
        { label: "1" },
        {
          label:
            "SMTはデフォルトでZooKeeperから古くなったブロッキングパーツを削除するようになりました"
        }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Cloud同期" }]
    }
  ]}
/>

共有マージツリーテーブルのブロッキングパーツを削減するバックグラウンドタスク。
ClickHouse Cloudのみで利用可能


## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

この設定はまだ準備が整っていないため、本番環境では使用しないでください。


## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "0" },
        {
          label:
            "パーティションキーまたはソートキーのカラムを集計対象として許可する新しい設定"
        }
      ]
    }
  ]}
/>

有効にすると、SummingMergeTreeテーブルの集計対象カラムをパーティションキーまたはソートキーに使用できるようになります。


## allow_suspicious_indices {#allow_suspicious_indices}

<SettingsInfoBlock type='Bool' default_value='0' />

同一の式を持つプライマリ/セカンダリインデックスおよびソートキーを拒否する


## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts}

<SettingsInfoBlock type='Bool' default_value='1' />

コンパクトパートからワイドパートへの垂直マージを許可します。この設定は全てのレプリカで同じ値にする必要があります。


## alter_column_secondary_index_mode {#alter_column_secondary_index_mode}

<SettingsInfoBlock
  type='AlterColumnSecondaryIndexMode'
  default_value='rebuild'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.12" },
        { label: "rebuild" },
        {
          label:
            "依存するセカンダリインデックスを持つカラムに対してALTER `column`を許可するよう動作を変更"
        }
      ]
    }
  ]}
/>

セカンダリインデックスの対象となるカラムを変更する`ALTER`コマンドを許可するかどうか、および許可する場合の動作を設定します。デフォルトでは、このような`ALTER`コマンドは許可され、インデックスが再構築されます。

設定可能な値:

- `rebuild`(デフォルト): `ALTER`コマンドで影響を受けるカラムに関連するすべてのセカンダリインデックスを再構築します。
- `throw`: セカンダリインデックスの対象となるカラムの`ALTER`を例外をスローして防止します。
- `drop`: 依存するセカンダリインデックスを削除します。新しいパートにはインデックスが含まれないため、再作成には`MATERIALIZE INDEX`が必要です。
- `compatibility`: 元の動作に一致します。`ALTER ... MODIFY COLUMN`では`throw`、`ALTER ... UPDATE/DELETE`では`rebuild`となります。
- `ignore`: 上級者向けの使用を想定しています。インデックスを不整合な状態のままにするため、クエリ結果が不正確になる可能性があります。


## always_fetch_merged_part {#always_fetch_merged_part}

<SettingsInfoBlock type='Bool' default_value='0' />

trueの場合、このレプリカはパートをマージせず、常に他のレプリカからマージ済みのパートをダウンロードします。

設定可能な値:

- true, false


## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks}

<SettingsInfoBlock type='Bool' default_value='0' />

ミューテーション/置換/デタッチなどの操作時に、ハードリンクではなく常にデータをコピーします。


## apply_patches_on_merge {#apply_patches_on_merge}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "1" }, { label: "New setting" }]
    }
  ]}
/>

trueの場合、マージ時にパッチパーツが適用されます


## assign_part_uuids {#assign_part_uuids}

<SettingsInfoBlock type='Bool' default_value='0' />

有効にすると、新しいパートごとに一意のパート識別子が割り当てられます。
有効化する前に、すべてのレプリカがUUIDバージョン4に対応していることを確認してください。


## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms}

<SettingsInfoBlock type='Milliseconds' default_value='100' />

各挿入イテレーションがasync_block_ids_cacheの更新を待機する時間


## async_insert {#async_insert}

<SettingsInfoBlock type='Bool' default_value='0' />

trueの場合、INSERTクエリのデータはキューに保存され、後でバックグラウンドでテーブルに書き込まれます。


## auto_statistics_types {#auto_statistics_types}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "" }, { label: "新しい設定" }]
    }
  ]}
/>

すべての適切なカラムに対して自動的に計算する統計タイプのカンマ区切りリスト。
サポートされている統計タイプ: tdigest, countmin, minmax, uniq。


## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms}

<SettingsInfoBlock type='Milliseconds' default_value='50' />

マージまたはミューテーションの1ステップの実行における目標時間。1ステップの処理に時間がかかる場合、この時間を超過することがあります


## cache_populated_by_fetch {#cache_populated_by_fetch}

<SettingsInfoBlock type='Bool' default_value='0' />

:::note
この設定はClickHouse Cloudでのみ使用できます。
:::

`cache_populated_by_fetch`が無効の場合（デフォルト設定）、新しいデータパーツは、それらのパーツを必要とするクエリが実行された時点でのみキャッシュに読み込まれます。

有効にすると、`cache_populated_by_fetch`により、クエリをトリガーとすることなく、すべてのノードがストレージから新しいデータパーツを自動的にキャッシュに読み込むようになります。

**関連項目**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)


## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.6" }, { label: "" }, { label: "新しい設定" }]
    }
  ]}
/>

:::note
この設定はClickHouse Cloudにのみ適用されます。
:::

空でない場合、この正規表現に一致するファイルのみが、フェッチ後にキャッシュへプリウォームされます(`cache_populated_by_fetch`が有効な場合)。


## check_delay_period {#check_delay_period}

<SettingsInfoBlock type="UInt64" default_value="60" />
廃止された設定です。何も動作しません。
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

テーブル作成時に、サンプリング用のカラムまたはサンプリング式のデータ型が正しいかどうかをチェックします。データ型は符号なし[整数型](/sql-reference/data-types/int-uint)のいずれかである必要があります：`UInt8`、`UInt16`、`UInt32`、`UInt64`。

設定可能な値：

- `true` — チェックが有効になります。
- `false` — テーブル作成時にチェックが無効になります。

デフォルト値：`true`

デフォルトでは、ClickHouseサーバーはテーブル作成時にサンプリング用のカラムまたはサンプリング式のデータ型をチェックします。不正なサンプリング式を持つテーブルが既に存在し、起動時にサーバーが例外を発生させないようにする場合は、`check_sample_column_is_correct`を`false`に設定してください。


## clean_deleted_rows {#clean_deleted_rows}

<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
廃止された設定です。何も実行しません。
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

古いキューログ、ブロックハッシュ、およびパーツをクリーンアップする最小期間。


## cleanup_delay_period_random_add {#cleanup_delay_period_random_add}

<SettingsInfoBlock type='UInt64' default_value='10' />

cleanup_delay_periodに0からx秒の一様分布値を追加します。
これにより、非常に多数のテーブルが存在する場合のサンダリングハード現象とそれに伴うZooKeeperのDoSを回避します。


## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration}

<SettingsInfoBlock type='UInt64' default_value='150' />

バックグラウンドクリーンアップの推奨バッチサイズ（ポイントは抽象的な単位ですが、1ポイントは挿入された1ブロックにほぼ相当します）。


## cleanup_threads {#cleanup_threads}

<SettingsInfoBlock type="UInt64" default_value="128" />
廃止された設定です。何も動作しません。
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "列とインデックスのサイズを遅延計算するための新しい設定"}]}]}/>

テーブル初期化時ではなく、最初のリクエスト時に列とセカンダリインデックスのサイズを遅延計算します。


## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache}

マークキャッシュを事前ウォームアップする対象のカラムのリスト(有効な場合)。空の場合はすべてのカラムが対象となります


## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer}

<SettingsInfoBlock type='UInt64' default_value='134217728' />

ClickHouse Cloudでのみ利用可能です。コンパクトパートの単一ストライプに書き込むバイト数の最大値


## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer}

<SettingsInfoBlock type='UInt64' default_value='128' />

ClickHouse Cloudでのみ利用可能です。コンパクトパートの単一ストライプに書き込むグラニュールの最大数です


## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part}

<SettingsInfoBlock type='UInt64' default_value='16777216' />

ClickHouse Cloudでのみ利用可能です。マージ時にコンパクトパート全体をメモリに読み込む際の最大サイズ。


## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key}

<SettingsInfoBlock type='Bool' default_value='0' />

プライマリキーに含まれないサンプリング式を持つテーブルの作成を許可します。これは、後方互換性のために不適切な構造のテーブルでサーバーを一時的に実行する場合にのみ必要です。


## compress_marks {#compress_marks}

<SettingsInfoBlock type='Bool' default_value='1' />

マークの圧縮をサポートし、マークファイルのサイズを削減し、ネットワーク転送を高速化します。


## compress_primary_key {#compress_primary_key}

<SettingsInfoBlock type='Bool' default_value='1' />

プライマリキーの圧縮をサポートし、プライマリキーファイルのサイズを削減し、ネットワーク転送を高速化します。


## concurrent_part_removal_threshold {#concurrent_part_removal_threshold}

<SettingsInfoBlock type='UInt64' default_value='100' />

非アクティブなデータパートの数がこの値以上の場合にのみ、並行パート削除を有効化します（'max_part_removal_threads'を参照）。


## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode}

<SettingsInfoBlock
  type='DeduplicateMergeProjectionMode'
  default_value='throw'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "24.8" },
        { label: "throw" },
        { label: "不整合なプロジェクションの作成を許可しない" }
      ]
    }
  ]}
/>

非クラシックMergeTree、つまり(Replicated、Shared)MergeTreeではないテーブルに対してプロジェクションの作成を許可するかどうかを指定します。ignoreオプションは純粋に互換性のためのものであり、不正確な結果を招く可能性があります。許可する場合、プロジェクションをマージする際のアクションとして、削除(drop)するか再構築(rebuild)するかを指定します。クラシックMergeTreeはこの設定を無視します。また、`OPTIMIZE DEDUPLICATE`も制御しますが、すべてのMergeTreeファミリーのメンバーに影響します。`lightweight_mutation_projection_mode`オプションと同様に、パートレベルの設定です。

設定可能な値:

- `ignore`
- `throw`
- `drop`
- `rebuild`


## default_compression_codec {#default_compression_codec}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.4" }, { label: "" }, { label: "新しい設定" }]
    }
  ]}
/>

テーブル定義で特定のカラムに圧縮コーデックが定義されていない場合に使用されるデフォルトの圧縮コーデックを指定します。
カラムの圧縮コーデック選択順序:

1. テーブル定義でカラムに定義された圧縮コーデック
2. `default_compression_codec`で定義された圧縮コーデック(本設定)
3. `compression`設定で定義されたデフォルトの圧縮コーデック
   デフォルト値: 空文字列(未定義)


## detach_not_byte_identical_parts {#detach_not_byte_identical_parts}

<SettingsInfoBlock type='Bool' default_value='0' />

マージまたはミューテーション後に、レプリカ上のデータパートが他のレプリカ上のデータパートとバイト単位で同一でない場合、そのデータパートをデタッチするかどうかを制御します。無効の場合、データパートは削除されます。このようなパートを後で分析する必要がある場合は、この設定を有効にしてください。

この設定は、[データレプリケーション](/engines/table-engines/mergetree-family/replacingmergetree)が有効な`MergeTree`テーブルに適用されます。

設定可能な値:

- `0` — パートは削除されます。
- `1` — パートはデタッチされます。


## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica}

<SettingsInfoBlock type='Bool' default_value='1' />

失われたレプリカを修復する際に、古いローカルパーツを削除しないようにします。

設定可能な値:

- `true`
- `false`


## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication}

<SettingsInfoBlock type='Bool' default_value='1' />

ゼロコピーレプリケーションのDETACH PARTITIONクエリを無効にします。


## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication}

<SettingsInfoBlock type='Bool' default_value='1' />

ゼロコピーレプリケーションのFETCH PARTITIONクエリを無効にします。


## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication}

<SettingsInfoBlock type='Bool' default_value='1' />

ゼロコピーレプリケーションのFREEZE PARTITIONクエリを無効にします。


## disk {#disk}

ストレージディスクの名前。ストレージポリシーの代わりに指定することができます。


## dynamic_serialization_version {#dynamic_serialization_version}

<SettingsInfoBlock
  type='MergeTreeDynamicSerializationVersion'
  default_value='v2'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "v2" },
        { label: "Dynamic シリアル化バージョンを制御する設定を追加" }
      ]
    }
  ]}
/>

Dynamic データ型のシリアル化バージョン。互換性のために必要です。

使用可能な値:

- `v1`
- `v2`
- `v3`


## enable_block_number_column {#enable_block_number_column}

<SettingsInfoBlock type='Bool' default_value='0' />

各行の \_block_number 列を永続化します。


## enable_block_offset_column {#enable_block_offset_column}

<SettingsInfoBlock type='Bool' default_value='0' />

マージ時に仮想カラム `_block_number` を永続化します。


## enable_index_granularity_compression {#enable_index_granularity_compression}

<SettingsInfoBlock type='Bool' default_value='1' />

可能な場合、インデックス粒度の値をメモリ内で圧縮します


## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "新しい設定" }]
    },
    {
      id: "row-2",
      items: [
        { label: "25.1" },
        { label: "0" },
        {
          label:
            "min_age_to_force_merge の最大バイト数を制限する新しい設定を追加しました。"
        }
      ]
    }
  ]}
/>

`min_age_to_force_merge_seconds` および `min_age_to_force_merge_on_partition_only` の設定が `max_bytes_to_merge_at_max_space_in_pool` の設定を考慮するかどうかを指定します。

設定可能な値:

- `true`
- `false`


## enable_mixed_granularity_parts {#enable_mixed_granularity_parts}

<SettingsInfoBlock type='Bool' default_value='1' />

`index_granularity_bytes`設定を使用したグラニュールサイズ制御への移行を有効または無効にします。バージョン19.11以前は、グラニュールサイズを制限するための`index_granularity`設定のみが存在していました。`index_granularity_bytes`設定は、大きな行(数十から数百メガバイト)を持つテーブルからデータを選択する際のClickHouseのパフォーマンスを向上させます。大きな行を持つテーブルがある場合、この設定を有効にすることで`SELECT`クエリの効率を改善できます。


## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.3" },
        { label: "0" },
        {
          label:
            "ReplacingMergeTreeの自動クリーンアップマージを許可する新しい設定"
        }
      ]
    }
  ]}
/>

パーティションを単一のパートにマージする際に、ReplacingMergeTreeでCLEANUPマージを使用するかどうかを指定します。`allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only`を有効にする必要があります。

設定可能な値:

- `true`
- `false`


## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix}

<SettingsInfoBlock type='Bool' default_value='0' />

ReplicatedMergeTreeテーブルに対して、ZooKeeper名プレフィックス付きエンドポイントIDを有効にします。


## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm}

<SettingsInfoBlock type='UInt64' default_value='1' />

垂直マージアルゴリズムの使用を有効化します。


## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

パーティション操作クエリ(`ATTACH/MOVE/REPLACE PARTITION`)の宛先テーブルでこの設定が有効になっている場合、ソーステーブルと宛先テーブルの間でインデックスとプロジェクションが同一である必要があります。それ以外の場合、宛先テーブルはソーステーブルのインデックスとプロジェクションのスーパーセットを保持できます。


## escape_variant_subcolumn_filenames {#escape_variant_subcolumn_filenames}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "1" },
        {
          label:
            "Wide パートの Variant 型サブカラムに対して作成されるファイル名内の特殊記号をエスケープ"
        }
      ]
    }
  ]}
/>

MergeTree テーブルの Wide パートにおいて、Variant データ型のサブカラムに対して作成されるファイル名内の特殊記号をエスケープします。互換性のために必要です。


## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge}

<SettingsInfoBlock type='Bool' default_value='0' />

有効にすると、マージするパートを選択する際に、データパートの推定実サイズ（`DELETE FROM`で削除された行を除いたサイズ）が使用されます。この動作は、この設定を有効にした後に実行された`DELETE FROM`の影響を受けるデータパートに対してのみ適用されます。

使用可能な値：

- `true`
- `false`

**関連項目**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
  設定


## exclude_materialize_skip_indexes_on_merge {#exclude_materialize_skip_indexes_on_merge}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "" }, { label: "新しい設定。" }]
    }
  ]}
/>

マージ中にスキップインデックスを構築・保存する対象から除外するインデックスを、カンマ区切りのリストで指定します。[materialize_skip_indexes_on_merge](#materialize_skip_indexes_on_merge)がfalseの場合、この設定は効果がありません。

除外されたスキップインデックスは、明示的な[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)クエリの実行時、または[materialize_skip_indexes_on_insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)セッション設定に応じてINSERT時に構築・保存されます。

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

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- この設定はINSERTには影響しません

-- idx_aはバックグラウンドマージまたはOPTIMIZE TABLE FINALによる明示的なマージ中の更新から除外されます

-- リストを指定することで複数のインデックスを除外できます
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- デフォルト設定では、マージ中の更新から除外されるインデックスはありません
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```


## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold}

<SettingsInfoBlock type='Seconds' default_value='0' />

この設定値が0より大きい場合、単一のレプリカのみが即座にマージを開始し、他のレプリカはローカルでマージを実行する代わりに、その時間まで結果のダウンロードを待機します。選択されたレプリカが指定時間内にマージを完了しない場合、標準動作にフォールバックします。

設定可能な値:

- 任意の正の整数


## fault_probability_after_part_commit {#fault_probability_after_part_commit}

<SettingsInfoBlock type='Float' default_value='0' />

テスト用です。変更しないでください。


## fault_probability_before_part_commit {#fault_probability_before_part_commit}

<SettingsInfoBlock type='Float' default_value='0' />

テスト用です。変更しないでください。


## finished_mutations_to_keep {#finished_mutations_to_keep}

<SettingsInfoBlock type='UInt64' default_value='100' />

完了したミューテーションのレコードを保持する件数。0の場合は、すべてのレコードを保持します。


## force_read_through_cache_for_merges {#force_read_through_cache_for_merges}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

マージ時にファイルシステムキャッシュの読み取りスルーを強制します


## fsync_after_insert {#fsync_after_insert}

<SettingsInfoBlock type='Bool' default_value='0' />

挿入される各パートに対してfsyncを実行します。挿入のパフォーマンスが大幅に低下するため、ワイドパートでの使用は推奨されません。


## fsync_part_directory {#fsync_part_directory}

<SettingsInfoBlock type='Bool' default_value='0' />

すべてのパート操作（書き込み、名前変更など）の後、パートディレクトリに対してfsyncを実行します。


## in_memory_parts_enable_wal {#in_memory_parts_enable_wal}

<SettingsInfoBlock type="Bool" default_value="1" />
廃止された設定です。何も動作しません。
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
廃止された設定です。何も動作しません。
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

テーブル内の単一パーティションにおける非アクティブなパーツの数が
`inactive_parts_to_delay_insert` の値を超えた場合、`INSERT` は意図的に
遅延されます。

:::tip
サーバーがパーツを十分な速度でクリーンアップできない場合に有用です。
:::

設定可能な値:

- 任意の正の整数。


## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert}

<SettingsInfoBlock type='UInt64' default_value='0' />

単一パーティション内の非アクティブなパーツの数が`inactive_parts_to_throw_insert`の値を超えた場合、`INSERT`は以下のエラーで中断されます:

> "Too many inactive parts (N). Parts cleaning are processing significantly
> slower than inserts" 例外。"

設定可能な値:

- 任意の正の整数。


## index_granularity {#index_granularity}

<SettingsInfoBlock type='UInt64' default_value='8192' />

インデックスのマーク間のデータ行の最大数。つまり、1つのプライマリキー値に対応する行数です。


## index_granularity_bytes {#index_granularity_bytes}

<SettingsInfoBlock type='UInt64' default_value='10485760' />

データグラニュールの最大サイズ(バイト単位)。

行数のみでグラニュールサイズを制限する場合は、`0`に設定してください(非推奨)。


## initialization_retry_period {#initialization_retry_period}

<SettingsInfoBlock type='Seconds' default_value='60' />

テーブル初期化の再試行間隔(秒単位)。


## kill_delay_period {#kill_delay_period}

<SettingsInfoBlock type="UInt64" default_value="30" />
廃止された設定です。何も動作しません。
## kill_delay_period_random_add {#kill_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />
廃止された設定です。何も動作しません。
## kill_threads {#kill_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
廃止された設定です。何も動作しません。
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 
<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

デフォルトでは、軽量削除`DELETE`はプロジェクションを持つテーブルでは動作しません。これは、プロジェクション内の行が`DELETE`操作の影響を受ける可能性があるためです。そのため、デフォルト値は`throw`になります。ただし、このオプションで動作を変更できます。値を`drop`または`rebuild`に設定すると、プロジェクションを持つテーブルでも削除が機能します。`drop`を指定するとプロジェクションが削除されるため、現在のクエリではプロジェクションが削除されて高速になる可能性がありますが、プロジェクションが存在しないため将来のクエリでは低速になります。`rebuild`を指定するとプロジェクションが再構築されるため、現在のクエリのパフォーマンスに影響を与える可能性がありますが、将来のクエリでは高速化される可能性があります。これらのオプションはパートレベルでのみ動作するため、影響を受けないパート内のプロジェクションは、dropやrebuildなどのアクションがトリガーされることなく、そのまま維持されます。

使用可能な値:

- `throw`
- `drop`
- `rebuild`


## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts}

<SettingsInfoBlock type='Bool' default_value='0' />

[exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge)と併せて有効にすると、
既存のデータパートの削除行数がテーブル起動時に計算されます。これによりテーブルの起動時の読み込みが遅くなる可能性があることに注意してください。

設定可能な値:

- `true`
- `false`

**関連項目**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 設定


## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations}

<SettingsInfoBlock type='Seconds' default_value='120' />

マージやミューテーションなどのバックグラウンド操作において、テーブルロックの取得に失敗するまでの待機時間を秒単位で指定します。


## marks_compress_block_size {#marks_compress_block_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='65536' />

マーク圧縮ブロックサイズ。圧縮対象となるブロックの実際のサイズを指定します。


## marks_compression_codec {#marks_compression_codec}

<SettingsInfoBlock type='String' default_value='ZSTD(3)' />

マークに使用される圧縮コーデックです。マークは十分に小さくキャッシュされるため、デフォルトの圧縮はZSTD(3)となっています。


## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "新しい設定" }]
    }
  ]}
/>

有効にすると、マージ時に新しいパートのスキップインデックスを構築して保存します。
無効の場合は、明示的な [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
または [INSERT時](/operations/settings/settings.md/#materialize_skip_indexes_on_insert) に作成・保存できます。

より細かい制御については、[exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) も参照してください。


## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only}

<SettingsInfoBlock type='Bool' default_value='0' />

MATERIALIZE TTL実行時にTTL情報の再計算のみを実行する


## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

`parts_to_delay_insert`および`parts_to_throw_insert`に基づく「パート数過多」チェックは、平均パートサイズ(該当パーティション内)が指定された閾値以下の場合にのみ有効になります。閾値を超えている場合、INSERTは遅延も拒否もされません。これにより、パートが適切に大きなパートへマージされていれば、単一サーバーの単一テーブルに数百テラバイトのデータを保持できます。この設定は、非アクティブパートや総パート数の閾値には影響しません。


## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool}

<SettingsInfoBlock type='UInt64' default_value='161061273600' />

利用可能なリソースが十分にある場合に、1つのパートにマージされるパートの最大合計サイズ(バイト単位)。自動バックグラウンドマージによって作成される可能性のある最大パートサイズにおおよそ対応します。(0を指定するとマージが無効になります)

設定可能な値:

- 任意の非負整数。

マージスケジューラは定期的にパーティション内のパートのサイズと数を分析し、プールに十分な空きリソースがある場合、バックグラウンドマージを開始します。マージは、ソースパートの合計サイズが`max_bytes_to_merge_at_max_space_in_pool`を超えるまで実行されます。

[OPTIMIZE FINAL](/sql-reference/statements/optimize)によって開始されるマージは`max_bytes_to_merge_at_max_space_in_pool`を無視します(空きディスク容量のみが考慮されます)。


## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool}

<SettingsInfoBlock type='UInt64' default_value='1048576' />

バックグラウンドプールで利用可能なリソースが最小の状態で、1つのパートにマージされるパートの最大合計サイズ(バイト単位)。

設定可能な値:

- 任意の正の整数。

`max_bytes_to_merge_at_min_space_in_pool`は、プール内の利用可能なディスク容量が不足している場合でもマージ可能なパートの最大合計サイズを定義します。
これは、小さなパートの数を減らし、`Too many parts`エラーが発生する可能性を低減するために必要です。
マージでは、マージされるパートの合計サイズの2倍のディスク容量を予約します。
したがって、空きディスク容量が少ない場合、空き容量は存在するものの、その容量が進行中の大規模なマージによって既に予約されているため、他のマージを開始できず、挿入のたびに小さなパートの数が増加するという状況が発生する可能性があります。


## max_cleanup_delay_period {#max_cleanup_delay_period}

<SettingsInfoBlock type='UInt64' default_value='300' />

古いキューログ、ブロックハッシュ、およびパーツをクリーンアップする最大期間。


## max_compress_block_size {#max_compress_block_size}

<SettingsInfoBlock type='UInt64' default_value='0' />

テーブルへの書き込み時に圧縮する前の非圧縮データブロックの最大サイズです。この設定はグローバル設定でも指定できます
([max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)
設定を参照)。テーブル作成時に指定した値は、この設定のグローバル値を上書きします。


## max_concurrent_queries {#max_concurrent_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />

MergeTreeテーブルに関連して同時に実行されるクエリの最大数。
クエリは他の`max_concurrent_queries`設定によっても制限されます。

設定可能な値:

- 正の整数。
- `0` — 制限なし。

デフォルト値: `0` (制限なし)。

**例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```


## max_delay_to_insert {#max_delay_to_insert}

<SettingsInfoBlock type='UInt64' default_value='1' />

単一パーティション内のアクティブなパート数が
[parts_to_delay_insert](#parts_to_delay_insert) の値を超えた場合に、
`INSERT` の遅延を計算するために使用される秒単位の値。

設定可能な値:

- 任意の正の整数

`INSERT` の遅延(ミリ秒)は、次の式で計算されます:

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

例えば、パーティションに299個のアクティブなパートがあり、parts_to_throw_insert
= 300、parts_to_delay_insert = 150、max_delay_to_insert = 1 の場合、`INSERT` は
`pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` ミリ秒遅延します。

バージョン23.1以降、式は次のように変更されました:

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

例えば、パーティションに224個のアクティブなパートがあり、parts_to_throw_insert
= 300、parts_to_delay_insert = 150、max_delay_to_insert = 1、
min_delay_to_insert_ms = 10 の場合、`INSERT` は `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` ミリ秒遅延します。


## max_delay_to_mutate_ms {#max_delay_to_mutate_ms}

<SettingsInfoBlock type='UInt64' default_value='1000' />

未完了のミューテーションが多数存在する場合の、MergeTreeテーブルに対するミューテーション実行の最大遅延時間（ミリ秒単位）


## max_digestion_size_per_segment {#max_digestion_size_per_segment}

<SettingsInfoBlock type='UInt64' default_value='268435456' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "268435456" },
        { label: "廃止された設定" }
      ]
    }
  ]}
/>


廃止された設定です。何も動作しません。

## max_file_name_length {#max_file_name_length}

<SettingsInfoBlock type='UInt64' default_value='127' />

ハッシュ化せずにそのまま保持するファイル名の最大長です。
`replace_long_file_name_to_hash` 設定が有効な場合にのみ有効になります。
この設定値にはファイル拡張子の長さは含まれません。そのため、
ファイルシステムエラーを回避するために、最大ファイル名長(通常は255バイト)よりも
余裕を持って短く設定することを推奨します。


## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns}

<SettingsInfoBlock type='UInt64' default_value='75' />

変更(削除、追加)するファイル数がこの設定値を超える場合、ALTERは適用されません。

設定可能な値:

- 任意の正の整数

デフォルト値: 75


## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns}

<SettingsInfoBlock type='UInt64' default_value='50' />

削除対象のファイル数がこの設定値を超える場合、ALTERは適用されません。

設定可能な値:

- 任意の正の整数。


## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write}

<SettingsInfoBlock type='UInt64' default_value='40' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.4" }, { label: "40" }, { label: "新規設定" }]
    }
  ]}
/>

並列でフラッシュ可能なストリーム(カラム)の最大数
(マージ用のmax_insert_delayed_streams_for_parallel_writeに相当)。
Verticalマージでのみ機能します。


## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms}

<SettingsInfoBlock type='UInt64' default_value='60000' />

パーツが選択されなかった場合に、再度マージ対象のパーツ選択を試みるまでの最大待機時間。この設定値を小さくすると、background_schedule_pool内でパーツ選択タスクが頻繁に実行されるため、大規模クラスタではZooKeeperへのリクエストが大量に発生します


## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool}

<SettingsInfoBlock type='UInt64' default_value='2' />
プール内にTTLエントリを持つマージが指定数を超えている場合、新しいTTLマージは割り当てられません。これは、通常のマージ用に空きスレッドを確保し、「Too many parts」エラーを回避するためです。


## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica}

<SettingsInfoBlock type='UInt64' default_value='0' />

レプリカごとのパートミューテーション数を指定した値に制限します。
0を指定した場合、レプリカごとのミューテーション数に制限はありません（ただし、他の設定による制約を受ける可能性があります）。


## max_part_loading_threads {#max_part_loading_threads}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
廃止された設定です。何も動作しません。
## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
廃止された設定です。何も動作しません。
## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

1つのクエリでアクセス可能なパーティションの最大数を制限します。

テーブル作成時に指定された設定値は、クエリレベルの設定で上書きすることができます。

設定可能な値:

- 任意の正の整数

クエリの複雑性設定 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read) は、クエリ/セッション/プロファイルレベルでも指定できます。


## max_parts_in_total {#max_parts_in_total}

<SettingsInfoBlock type='UInt64' default_value='100000' />

テーブルの全パーティションにおけるアクティブなパートの総数が
`max_parts_in_total` の値を超えた場合、`INSERT` は `Too many parts
(N)` 例外で中断されます。

設定可能な値:

- 任意の正の整数。

テーブル内のパート数が多いと、ClickHouseクエリのパフォーマンスが低下し、
ClickHouseの起動時間が長くなります。これは多くの場合、不適切な設計
(パーティショニング戦略の選択ミス - パーティションが小さすぎる)
の結果です。


## max_parts_to_merge_at_once {#max_parts_to_merge_at_once}

<SettingsInfoBlock type='UInt64' default_value='100' />

一度にマージできるパートの最大数（0 の場合は無効）。OPTIMIZE FINAL クエリには影響しません。


## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms}

<SettingsInfoBlock type='UInt64' default_value='300000' />

失敗したミューテーションの最大延期時間です。


## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms}

<SettingsInfoBlock type='UInt64' default_value='60000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "60000" },
        {
          label:
            "レプリケーションキュー内のフェッチタスクを延期できるようにする新しい設定を追加しました。"
        }
      ]
    }
  ]}
/>

レプリケートされたフェッチが失敗した場合の最大延期時間。


## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms}

<SettingsInfoBlock type='UInt64' default_value='60000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "60000" },
        {
          label:
            "レプリケーションキュー内のマージタスクを延期できるようにする新しい設定を追加しました。"
        }
      ]
    }
  ]}
/>

失敗したレプリケートマージの最大延期時間。


## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms}

<SettingsInfoBlock type='UInt64' default_value='300000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "300000" },
        {
          label:
            "レプリケーションキュー内のタスクを延期できるようにする新しい設定を追加しました。"
        }
      ]
    }
  ]}
/>

失敗したレプリケーションタスクの最大延期時間。タスクがフェッチ、マージ、またはミューテーションでない場合に使用されます。


## max_projections {#max_projections}

<SettingsInfoBlock type='UInt64' default_value='25' />

マージツリープロジェクションの最大数です。


## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth}

<SettingsInfoBlock type='UInt64' default_value='0' />

[レプリケート](../../engines/table-engines/mergetree-family/replication.md)フェッチにおけるネットワーク経由のデータ交換の最大速度を、1秒あたりのバイト数で制限します。この設定は特定のテーブルに適用されます。これは、サーバー全体に適用される[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)設定とは異なります。

サーバー全体のネットワークと特定のテーブルのネットワークの両方を制限できますが、その場合、テーブルレベルの設定値はサーバーレベルの設定値よりも小さくする必要があります。そうでない場合、サーバーは`max_replicated_fetches_network_bandwidth_for_server`設定のみを考慮します。

この設定は完全に正確には遵守されません。

設定可能な値:

- 正の整数。
- `0` — 無制限。

デフォルト値: `0`。

**使用方法**

新しいノードを追加または置換する際にデータをレプリケートする速度を調整するために使用できます。


## max_replicated_logs_to_keep {#max_replicated_logs_to_keep}

<SettingsInfoBlock type='UInt64' default_value='1000' />

非アクティブなレプリカが存在する場合に、ClickHouse Keeperログに保持されるレコードの最大数。この数を超えると、非アクティブなレプリカは失われた状態になります。

設定可能な値:

- 任意の正の整数


## max_replicated_merges_in_queue {#max_replicated_merges_in_queue}

<SettingsInfoBlock type='UInt64' default_value='1000' />

ReplicatedMergeTreeキューで同時に許可されるパーツのマージおよびミューテーションタスクの数。


## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue}

<SettingsInfoBlock type='UInt64' default_value='1' />

ReplicatedMergeTreeキューにおいて、TTLを持つパーツのマージタスクを同時に実行できる数を指定します。


## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue}

<SettingsInfoBlock type='UInt64' default_value='8' />

ReplicatedMergeTreeキュー内で同時に許可されるパーツのミューテーションタスクの数。


## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth}

<SettingsInfoBlock type='UInt64' default_value='0' />

[レプリケート](/engines/table-engines/mergetree-family/replacingmergetree)送信時のネットワーク経由のデータ交換の最大速度を、バイト毎秒で制限します。この設定は特定のテーブルに適用されます。これは、サーバー全体に適用される
[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth)
設定とは異なります。

サーバーネットワークと特定のテーブルのネットワークの両方を制限できますが、
その場合、テーブルレベルの設定値はサーバーレベルの設定値よりも小さい値である必要があります。そうでない場合、サーバーは
`max_replicated_sends_network_bandwidth_for_server` 設定のみを考慮します。

この設定は完全に正確には遵守されません。

設定可能な値:

- 正の整数。
- `0` — 無制限。

**使用方法**

新しいノードを追加または置換する際のデータレプリケーション速度を調整するために使用できます。


## max_suspicious_broken_parts {#max_suspicious_broken_parts}

<SettingsInfoBlock type='UInt64' default_value='100' />

単一パーティション内の破損パーツ数が`max_suspicious_broken_parts`の値を超えた場合、自動削除は実行されません。

設定可能な値:

- 任意の正の整数


## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

破損したパーツの合計サイズの最大値。この値を超えた場合、自動削除は実行されません。

設定可能な値:

- 任意の正の整数。


## max_uncompressed_bytes_in_patches {#max_uncompressed_bytes_in_patches}

<SettingsInfoBlock type='UInt64' default_value='32212254720' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "32212254720" },
        { label: "新しい設定" }
      ]
    }
  ]}
/>

すべてのパッチパート内のデータの最大非圧縮サイズ(バイト単位)。
すべてのパッチパート内のデータ量がこの値を超えた場合、軽量更新は拒否されます。
0 - 無制限。


## merge_max_block_size {#merge_max_block_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='8192' />

マージ対象のパートからメモリに読み込まれる行数。

設定可能な値:

- 任意の正の整数。

マージ処理では、パートから`merge_max_block_size`行単位のブロックで行を読み込み、
マージして結果を新しいパートに書き込みます。読み込まれたブロックはRAMに配置されるため、
`merge_max_block_size`はマージに必要なRAMサイズに影響します。
そのため、行幅が非常に広いテーブルでは、マージが大量のRAMを消費する可能性があります
(平均行サイズが100kbの場合、10個のパートをマージする際、
(100kb _ 10 _ 8192) = 約8GBのRAMが必要になります)。`merge_max_block_size`を小さくすることで、
マージに必要なRAM量を削減できますが、マージ速度は低下します。


## merge_max_block_size_bytes {#merge_max_block_size_bytes}

<SettingsInfoBlock type='UInt64' default_value='10485760' />

マージ操作時にブロックに形成されるバイト数を指定します。デフォルトでは`index_granularity_bytes`と同じ値です。


## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.1" },
        { label: "1073741824" },
        { label: "クラウド同期" }
      ]
    }
  ]}
/>

ClickHouse Cloudでのみ利用可能です。マージ中にキャッシュをプリウォームするパート（compactまたはpacked）の最大サイズ。


## merge_max_dynamic_subcolumns_in_wide_part {#merge_max_dynamic_subcolumns_in_wide_part}

<SettingsInfoBlock type='UInt64Auto' default_value='auto' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "auto" },
        {
          label:
            "データ型で指定されたパラメータに関係なく、マージ後のWideパート内の動的サブカラム数を制限する新しい設定を追加"
        }
      ]
    }
  ]}
/>

マージ後のWideデータパート内の各カラムに作成可能な動的サブカラムの最大数。
データ型で指定された動的パラメータに関係なく、Wideデータパートで作成されるファイル数を削減します。

例えば、テーブルにJSON(max_dynamic_paths=1024)型のカラムがあり、merge_max_dynamic_subcolumns_in_wide_part設定が128に設定されている場合、
Wideデータパートへのマージ後、このパート内の動的パス数は128に削減され、128個のパスのみが動的サブカラムとして書き込まれます。


## merge_selecting_sleep_ms {#merge_selecting_sleep_ms}

<SettingsInfoBlock type='UInt64' default_value='5000' />

パーツが選択されなかった場合に、再度マージ対象のパーツを選択するまでの最小待機時間。この設定値を低くすると、background_schedule_pool内で選択タスクが頻繁に実行され、大規模クラスタではZooKeeperへのリクエストが大量に発生します


## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor}

<SettingsInfoBlock type='Float' default_value='1.2' />

マージ選択タスクのスリープ時間は、マージ対象が存在しない場合はこの係数で乗算され、マージが割り当てられた場合は除算されます


## merge_selector_algorithm {#merge_selector_algorithm}

<ExperimentalBadge />
<SettingsInfoBlock type='MergeSelectorAlgorithm' default_value='Simple' />

マージ割り当て用のパーツを選択するアルゴリズム


## merge_selector_base {#merge_selector_base}

<SettingsInfoBlock type='Float' default_value='5' />
割り当てられたマージの書き込み増幅に影響します（エキスパートレベルの設定のため、動作内容を理解していない場合は変更しないでください）。Simple および StochasticSimple マージセレクターで動作します


## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor}

<SettingsInfoBlock type='UInt64' default_value='0' />

パーティション内のパート数に対して、このロジックがいつ作動するかを制御します。係数が大きいほど、反応の遅延が大きくなります。


## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right}

<SettingsInfoBlock type='Bool' default_value='1' />

マージ対象のパートを選択するヒューリスティックを有効にします。このヒューリスティックは、範囲の右側にあるパートのサイズが合計サイズ(sum_size)の指定された比率(0.01)未満の場合に、それらのパートを削除します。
SimpleおよびStochasticSimpleマージセレクタで動作します


## merge_selector_window_size {#merge_selector_window_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />

一度に確認するパーツの数。


## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache}

<SettingsInfoBlock type='UInt64' default_value='16106127360' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.1" },
        { label: "16106127360" },
        { label: "Cloud sync" }
      ]
    }
  ]}
/>

ClickHouse Cloudでのみ利用可能です。マージ中にキャッシュをプリウォームする際のパーツの合計最大サイズ。


## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds}

<SettingsInfoBlock type="UInt64" default_value="2592000" />
廃止された設定です。何も実行しません。
## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

ClickHouseが古いパーツ、WAL、ミューテーションのクリーンアップを実行する間隔を秒単位で設定します。

設定可能な値:

- 任意の正の整数


## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds}

<SettingsInfoBlock type='UInt64' default_value='60' />

ClickHouseが古い一時ディレクトリのクリーンアップを実行する間隔を秒単位で設定します。

指定可能な値:

- 任意の正の整数


## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached}

<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定です。何も動作しません。
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

再圧縮TTLを使用したマージを繰り返すまでの最小遅延時間(秒単位)。


## merge_with_ttl_timeout {#merge_with_ttl_timeout}

<SettingsInfoBlock type='Int64' default_value='14400' />

削除TTLを使用したマージを再実行するまでの最小遅延時間(秒単位)。


## merge_workload {#merge_workload}

マージと他のワークロード間でリソースの利用と共有を制御するために使用されます。指定された値は、このテーブルのバックグラウンドマージにおける `workload` 設定値として使用されます。指定されていない場合（空文字列の場合）は、サーバー設定の `merge_workload` が代わりに使用されます。

**関連項目**

- [ワークロードスケジューリング](/operations/workload-scheduling.md)


## min_absolute_delay_to_close {#min_absolute_delay_to_close}

<SettingsInfoBlock type='UInt64' default_value='0' />

クローズするための最小絶対遅延時間。この時間が経過すると、リクエストの処理を停止し、ステータスチェック時にOkを返さなくなります。


## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only}

<SettingsInfoBlock type='Bool' default_value='0' />

`min_age_to_force_merge_seconds` をパーティション全体にのみ適用し、サブセットには適用しないかどうか。

デフォルトでは、設定 `max_bytes_to_merge_at_max_space_in_pool` を無視します（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

設定可能な値:

- true、false


## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds}

<SettingsInfoBlock type='UInt64' default_value='0' />

範囲内のすべてのパートが`min_age_to_force_merge_seconds`の値よりも古い場合、パートをマージします。

デフォルトでは、`max_bytes_to_merge_at_max_space_in_pool`設定を無視します
(`enable_max_bytes_limit_for_min_age_to_force_merge`を参照)。

指定可能な値:

- 正の整数


## min_bytes_for_compact_part {#min_bytes_for_compact_part}

<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定です。何も動作しません。
## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloudでのみ利用可能です。データパートに対してパック形式ではなくフルタイプのストレージを使用するための最小非圧縮サイズ(バイト単位)


## min_bytes_for_wide_part {#min_bytes_for_wide_part}

<SettingsInfoBlock type='UInt64' default_value='10485760' />

`Wide`形式で保存可能なデータパート内の最小バイト数/行数。これらの設定は、いずれか一方、両方、またはいずれも設定しないことが可能です。


## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

新しいパートに対してマークキャッシュとプライマリインデックスキャッシュをプリウォームするための最小サイズ(非圧縮バイト数)


## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod}

<SettingsInfoBlock type='UInt64' default_value='0' />

新しい大きなパートをボリュームディスク[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)に分散する際に、バランシングを有効にするための最小バイト数を設定します。

設定可能な値:

- 正の整数
- `0` — バランシングが無効になります

**使用方法**

`min_bytes_to_rebalance_partition_over_jbod`設定の値は、
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024の値以上である必要があります。そうでない場合、ClickHouseは例外をスローします。


## min_compress_block_size {#min_compress_block_size}

<SettingsInfoBlock type='UInt64' default_value='0' />

次のマークを書き込む際に圧縮に必要な非圧縮データブロックの最小サイズ。この設定はグローバル設定でも指定できます
（[min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)
設定を参照）。テーブル作成時に指定された値は、この設定のグローバル値を上書きします。


## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch}

<SettingsInfoBlock type='UInt64' default_value='0' />

フェッチ後にパートに対してfsyncを実行するための最小圧縮バイト数（0の場合は無効）


## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge}

<SettingsInfoBlock type='UInt64' default_value='0' />

マージ後のパートに対してfsyncを実行するための最小圧縮バイト数（0の場合は無効）


## min_delay_to_insert_ms {#min_delay_to_insert_ms}

<SettingsInfoBlock type='UInt64' default_value='10' />

単一パーティション内にマージされていない部分が多数存在する場合に、MergeTreeテーブルへのデータ挿入に適用される最小遅延時間(ミリ秒単位)。


## min_delay_to_mutate_ms {#min_delay_to_mutate_ms}

<SettingsInfoBlock type='UInt64' default_value='10' />

未完了のミューテーションが多数存在する場合の、MergeTreeテーブルに対するミューテーション実行の最小遅延時間（ミリ秒）


## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert}

<SettingsInfoBlock type='UInt64' default_value='0' />

データを挿入するために必要なディスク空き容量の最小バイト数です。利用可能な空きバイト数が
`min_free_disk_bytes_to_perform_insert` より少ない場合、例外がスローされ、
挿入は実行されません。この設定について以下の点に注意してください：

- `keep_free_space_bytes` 設定が考慮されます。
- `INSERT` 操作によって書き込まれるデータ量は考慮されません。
- 正の値（ゼロ以外）のバイト数が指定された場合にのみチェックされます

設定可能な値：

- 任意の正の整数。

:::note
`min_free_disk_bytes_to_perform_insert` と `min_free_disk_ratio_to_perform_insert`
の両方が指定されている場合、ClickHouseはより多くの空きディスク容量で挿入を実行できる値を採用します。
:::


## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert}

<SettingsInfoBlock type='Float' default_value='0' />

`INSERT`を実行するための最小空きディスク容量対総ディスク容量の比率。0から1の間の浮動小数点値である必要があります。この設定について注意点:

- `keep_free_space_bytes`設定を考慮します。
- `INSERT`操作によって書き込まれるデータ量は考慮しません。
- 正の値(ゼロ以外)の比率が指定されている場合にのみチェックされます

設定可能な値:

- 浮動小数点数、0.0 - 1.0

`min_free_disk_ratio_to_perform_insert`と`min_free_disk_bytes_to_perform_insert`の両方が指定されている場合、ClickHouseはより多くの空きディスク容量でインサートを実行できる値を採用します。


## min_index_granularity_bytes {#min_index_granularity_bytes}

<SettingsInfoBlock type='UInt64' default_value='1024' />

データグラニュールの最小許容サイズ(バイト単位)。

`index_granularity_bytes`の値が極端に小さいテーブルを誤って作成することを防ぐための保護機能です。


## min_level_for_full_part_storage {#min_level_for_full_part_storage}

<SettingsInfoBlock type='UInt32' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

ClickHouse Cloudでのみ利用可能です。パック型ではなくフル型のストレージをデータパートに使用するための最小パートレベル


## min_level_for_wide_part {#min_level_for_wide_part}

<SettingsInfoBlock type='UInt32' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "0" }, { label: "New setting" }]
    }
  ]}
/>

`Compact`形式ではなく`Wide`形式でデータパートを作成する最小パートレベル。


## min_marks_to_honor_max_concurrent_queries {#min_marks_to_honor_max_concurrent_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />

[max_concurrent_queries](#max_concurrent_queries)設定を適用するためにクエリが読み取る必要がある最小マーク数。

:::note
クエリは他の`max_concurrent_queries`設定によって引き続き制限されます。
:::

設定可能な値：

- 正の整数
- `0` — 無効（`max_concurrent_queries`制限はどのクエリにも適用されません）

**例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```


## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io}

<SettingsInfoBlock type='UInt64' default_value='10737418240' />

ストレージディスクへのダイレクトI/Oアクセスを使用するために必要なマージ操作の最小データ量。データパーツのマージ時に、ClickHouseはマージ対象となる全データの合計ストレージ容量を計算します。この容量が`min_merge_bytes_to_use_direct_io`バイトを超える場合、ClickHouseはダイレクトI/Oインターフェース(`O_DIRECT`オプション)を使用してストレージディスクへデータの読み書きを行います。`min_merge_bytes_to_use_direct_io = 0`の場合、ダイレクトI/Oは無効になります。


## min_parts_to_merge_at_once {#min_parts_to_merge_at_once}

<SettingsInfoBlock type='UInt64' default_value='0' />

マージセレクタが一度にマージ対象として選択できるデータパートの最小数
(エキスパートレベルの設定。動作を理解していない場合は変更しないでください)。
0 - 無効。SimpleおよびStochasticSimpleマージセレクタで動作します。


## min_relative_delay_to_close {#min_relative_delay_to_close}

<SettingsInfoBlock type='UInt64' default_value='300' />

他のレプリカに対する最小遅延時間。この遅延時間を超えると、クローズ処理を実行し、リクエストの処理を停止して、ステータスチェック時にOkを返さなくなります。


## min_relative_delay_to_measure {#min_relative_delay_to_measure}

<SettingsInfoBlock type='UInt64' default_value='120' />

絶対遅延がこの値以上である場合にのみ、相対レプリカ遅延を計算します。


## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership}

<SettingsInfoBlock type="UInt64" default_value="120" />
廃止された設定です。何も機能しません。
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

ZooKeeperログ内の最新レコードをこの数だけ保持します（廃止されたレコードであっても）。テーブルの動作には影響しません。クリーニング前のZooKeeperログの診断にのみ使用されます。

Possible values:

- 任意の正の整数


## min_rows_for_compact_part {#min_rows_for_compact_part}

<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定です。何も動作しません。
## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloudでのみ利用可能です。パック形式ではなく、データパートに完全なストレージタイプを使用するための最小行数です。


## min_rows_for_wide_part {#min_rows_for_wide_part}

<SettingsInfoBlock type='UInt64' default_value='0' />

`Compact`形式ではなく`Wide`形式でデータパートを作成するための最小行数。


## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge}

<SettingsInfoBlock type='UInt64' default_value='0' />

マージ後のパートに対してfsyncを実行するための最小行数（0の場合は無効）


## mutation_workload {#mutation_workload}

ミューテーションと他のワークロード間でリソースの利用と共有を制御するために使用されます。指定された値は、このテーブルのバックグラウンドミューテーションの`workload`設定値として使用されます。指定されていない場合（空文字列）は、代わりにサーバー設定`mutation_workload`が使用されます。

**関連項目**

- [ワークロードスケジューリング](/operations/workload-scheduling.md)


## non_replicated_deduplication_window {#non_replicated_deduplication_window}

<SettingsInfoBlock type='UInt64' default_value='0' />

非レプリケート
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルにおいて、
重複チェックのためにハッシュ値が保存される、最新の挿入ブロック数。

設定可能な値:

- 任意の正の整数。
- `0` (重複排除を無効化)。

レプリケートテーブルと同様の重複排除メカニズムが使用されます([replicated_deduplication_window](#replicated_deduplication_window) 設定を参照)。
作成されたパートのハッシュ値は、ディスク上のローカルファイルに書き込まれます。


## notify_newest_block_number {#notify_newest_block_number}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Cloud sync" }]
    }
  ]}
/>

SharedJoinまたはSharedSetに最新のブロック番号を通知します。ClickHouse Cloudでのみ使用可能です。


## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation}

<SettingsInfoBlock type='UInt64' default_value='20' />

プール内の空きエントリ数が指定された数を下回る場合、パートのミューテーションを実行しません。これは、通常のマージ用に空きスレッドを残し、「Too many parts」エラーを回避するためです。

設定可能な値:

- 任意の正の整数

**使用方法**

`number_of_free_entries_in_pool_to_execute_mutation`設定の値は、[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

- [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio)の値よりも小さい値にする必要があります。
  そうでない場合、ClickHouseは例外をスローします。


## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition}

<SettingsInfoBlock type='UInt64' default_value='25' />

プール内の空きエントリ数が指定された数より少ない場合、バックグラウンドでパーティション全体の最適化を実行しません（このタスクは`min_age_to_force_merge_seconds`を設定し、`min_age_to_force_merge_on_partition_only`を有効にした場合に生成されます）。これは、通常のマージ用に空きスレッドを確保し、「Too many parts」エラーを回避するためです。

設定可能な値：

- 正の整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`設定の値は、以下の値より小さくする必要があります：

[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

- [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio)。
  それ以外の場合、ClickHouseは例外をスローします。


## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge}

<SettingsInfoBlock type='UInt64' default_value='8' />

プール(またはレプリケーションキュー)内の空きエントリ数が指定された数を下回った場合、処理する(またはキューに追加する)マージの最大サイズを縮小し始めます。
これは、長時間実行されるマージでプールが埋まることを防ぎ、小規模なマージを処理できるようにするためです。

設定可能な値:

- 任意の正の整数


## number_of_mutations_to_delay {#number_of_mutations_to_delay}

<SettingsInfoBlock type='UInt64' default_value='500' />
テーブルに少なくともこの数の未完了のミューテーションが存在する場合、テーブルのミューテーションを意図的に遅延させます。0に設定すると無効化されます


## number_of_mutations_to_throw {#number_of_mutations_to_throw}

<SettingsInfoBlock type='UInt64' default_value='1000' />

テーブルに少なくともこの数の未完了のミューテーションが存在する場合、'Too many mutations' 例外をスローします。0に設定すると無効化されます


## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

ClickHouse Cloudでのみ利用可能です。マージ対象として検討する上位N個のパーティションを指定します。パーティションはランダムな重み付け方式で選択され、重みはそのパーティション内でマージ可能なデータパーツの数によって決定されます。


## object_serialization_version {#object_serialization_version}

<SettingsInfoBlock
  type='MergeTreeObjectSerializationVersion'
  default_value='v2'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "v2" },
        { label: "JSONシリアライゼーションバージョンを制御する設定を追加" }
      ]
    }
  ]}
/>

JSONデータ型のシリアライゼーションバージョン。互換性の維持に必要です。

指定可能な値:

- `v1`
- `v2`
- `v3`

共有データのシリアライゼーションバージョンの変更は、バージョン`v3`のみでサポートされています。


## object_shared_data_buckets_for_compact_part {#object_shared_data_buckets_for_compact_part}

<SettingsInfoBlock type='NonZeroUInt64' default_value='8' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "8" },
        {
          label:
            "Compactパートにおける共有データのJSONシリアライゼーションのバケット数を制御する設定を追加"
        }
      ]
    }
  ]}
/>

Compactパートにおける共有データのJSONシリアライゼーション用のバケット数。`map_with_buckets`および`advanced`共有データシリアライゼーションと連携します。


## object_shared_data_buckets_for_wide_part {#object_shared_data_buckets_for_wide_part}

<SettingsInfoBlock type='NonZeroUInt64' default_value='32' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "32" },
        {
          label:
            "Wideパートにおける共有データのJSONシリアライゼーションのバケット数を制御する設定を追加"
        }
      ]
    }
  ]}
/>

Wideパートにおける共有データのJSONシリアライゼーション用のバケット数。`map_with_buckets`および`advanced`共有データシリアライゼーションと連携します。


## object_shared_data_serialization_version {#object_shared_data_serialization_version}

<SettingsInfoBlock
  type='MergeTreeObjectSharedDataSerializationVersion'
  default_value='map'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "map" },
        { label: "JSONシリアライゼーションバージョンを制御する設定を追加" }
      ]
    }
  ]}
/>

JSONデータ型内の共有データに対するシリアライゼーションバージョン。

指定可能な値:

- `map` - 共有データを`Map(String, String)`として保存
- `map_with_buckets` - 共有データを複数の個別の`Map(String, String)`カラムとして保存。バケットを使用することで、共有データから個別のパスを読み取る際の性能が向上します。
- `advanced` - 共有データから個別のパスを読み取る際の性能を大幅に向上させるために設計された、共有データの特殊なシリアライゼーション。
  このシリアライゼーションでは多くの追加情報を保存するため、ディスク上の共有データのストレージサイズが増加することに注意してください。

`map_with_buckets`および`advanced`シリアライゼーションのバケット数は、設定
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part)によって決定されます。


## object_shared_data_serialization_version_for_zero_level_parts {#object_shared_data_serialization_version_for_zero_level_parts}

<SettingsInfoBlock
  type='MergeTreeObjectSharedDataSerializationVersion'
  default_value='map'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "map" },
        {
          label:
            "ゼロレベルパートのJSONシリアライゼーションバージョンを制御する設定を追加"
        }
      ]
    }
  ]}
/>

この設定では、挿入時に作成されるゼロレベルパート内のJSON型における共有データのシリアライゼーションバージョンを指定できます。
ゼロレベルパートに対しては`advanced`共有データシリアライゼーションを使用しないことを推奨します。挿入時間が大幅に増加する可能性があるためです。


## old_parts_lifetime {#old_parts_lifetime}

<SettingsInfoBlock type='Seconds' default_value='480' />

サーバーの予期しない再起動時のデータ損失を防ぐために、非アクティブなパーツを保持する時間(秒単位)。

設定可能な値:

- 任意の正の整数。

複数のパーツを新しいパーツにマージした後、ClickHouseは元のパーツを非アクティブとしてマークし、`old_parts_lifetime`秒が経過した後にのみ削除します。非アクティブなパーツは、現在のクエリで使用されていない場合、すなわちパーツの`refcount`が1の場合に削除されます。

新しいパーツに対しては`fsync`が呼び出されないため、一定期間、新しいパーツはサーバーのRAM(OSキャッシュ)内にのみ存在します。サーバーが予期せず再起動された場合、新しいパーツが失われたり破損したりする可能性があります。データを保護するため、非アクティブなパーツは即座には削除されません。

起動時、ClickHouseはパーツの整合性をチェックします。マージされたパーツが破損している場合、ClickHouseは非アクティブなパーツをアクティブリストに戻し、後で再度マージします。その後、破損したパーツは名前が変更され(`broken_`プレフィックスが付加され)、`detached`フォルダに移動されます。マージされたパーツが破損していない場合、元の非アクティブなパーツは名前が変更され(`ignored_`プレフィックスが付加され)、`detached`フォルダに移動されます。

デフォルトの`dirty_expire_centisecs`値(Linuxカーネル設定)は30秒(書き込まれたデータがRAMにのみ保存される最大時間)ですが、ディスクシステムに高負荷がかかっている場合、データの書き込みはかなり遅延する可能性があります。実験的に、`old_parts_lifetime`には480秒という値が選択されており、この期間中に新しいパーツがディスクに書き込まれることが保証されます。


## optimize_row_order {#optimize_row_order}

<SettingsInfoBlock type='Bool' default_value='0' />

挿入時に行の順序を最適化して、新しく挿入されるテーブルパートの圧縮性を向上させるかどうかを制御します。

通常のMergeTreeエンジンテーブルにのみ効果があります。特殊なMergeTreeエンジンテーブル(例: CollapsingMergeTree)には影響しません。

MergeTreeテーブルは[圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec)を使用して(オプションで)圧縮されます。
LZ4やZSTDなどの汎用圧縮コーデックは、データにパターンが存在する場合に最大の圧縮率を達成します。同じ値が長く連続する場合、通常は非常に良好に圧縮されます。

この設定が有効な場合、ClickHouseは新しく挿入されるパートのデータを、新しいテーブルパートの列全体で同一値の連続数を最小化する行順序で格納しようと試みます。
言い換えれば、同一値の連続数が少ないということは、個々の連続が長く、圧縮性が高いことを意味します。

最適な行順序を見つけることは計算上実行不可能です(NP困難)。
そのため、ClickHouseはヒューリスティックを使用して、元の行順序よりも圧縮率を向上させる行順序を迅速に見つけます。

<details markdown="1">

<summary>行順序を見つけるためのヒューリスティック</summary>

SQLは異なる行順序の同じテーブル(またはテーブルパート)を等価とみなすため、一般的にテーブル(またはテーブルパート)の行を自由にシャッフルすることが可能です。

この行をシャッフルする自由度は、テーブルに主キーが定義されている場合に制限されます。ClickHouseでは、主キー`C1, C2, ..., CN`は、テーブルの行が列`C1`、`C2`、...`Cn`でソートされることを強制します([クラスタ化インデックス](https://en.wikipedia.org/wiki/Database_index#Clustered))。
その結果、行は「等価クラス」内でのみシャッフルできます。つまり、主キー列に同じ値を持つ行のみです。

直感的には、高カーディナリティの主キー(例: `DateTime64`タイムスタンプ列を含む主キー)は、多数の小さな等価クラスを生成します。同様に、低カーディナリティの主キーを持つテーブルは、少数の大きな等価クラスを生成します。主キーのないテーブルは、すべての行にまたがる単一の等価クラスという極端なケースを表します。

等価クラスが少なく大きいほど、行を再シャッフルする際の自由度が高くなります。

各等価クラス内で最適な行順序を見つけるために適用されるヒューリスティックは、D. LemireとO. Kaserによる
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
で提案されており、各等価クラス内の行を非主キー列のカーディナリティの昇順でソートすることに基づいています。

これは3つのステップを実行します:

1. 主キー列の行値に基づいてすべての等価クラスを見つけます。
2. 各等価クラスについて、非主キー列のカーディナリティを計算(通常は推定)します。
3. 各等価クラスについて、非主キー列のカーディナリティの昇順で行をソートします。

</details>

有効にすると、挿入操作は新しいデータの行順序を分析および最適化するために追加のCPUコストが発生します。データの特性に応じて、INSERTは30〜50%長くかかることが予想されます。
LZ4またはZSTDの圧縮率は平均で20〜40%向上します。

この設定は、主キーがないテーブルまたは低カーディナリティの主キーを持つテーブル、つまり異なる主キー値がわずかしかないテーブルで最も効果的です。
高カーディナリティの主キー(例: `DateTime64`型のタイムスタンプ列を含む)は、この設定から恩恵を受けることは期待されません。


## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds}

<ExperimentalBadge />
<SettingsInfoBlock type='UInt64' default_value='30' />

シャード間でパートを移動する前後の待機時間。


## part_moves_between_shards_enable {#part_moves_between_shards_enable}

<ExperimentalBadge />
<SettingsInfoBlock type='UInt64' default_value='0' />

シャード間でパートを移動するための実験的/不完全な機能。シャーディング式は考慮されません。


## parts_to_delay_insert {#parts_to_delay_insert}

<SettingsInfoBlock type='UInt64' default_value='1000' />

単一パーティション内のアクティブなパート数が`parts_to_delay_insert`の値を超えた場合、`INSERT`は意図的に遅延されます。

設定可能な値:

- 任意の正の整数。

ClickHouseは、バックグラウンドのマージプロセスがパートの追加速度よりも速くマージできるように、`INSERT`の実行を意図的に遅延させます(スリープを追加します)。


## parts_to_throw_insert {#parts_to_throw_insert}

<SettingsInfoBlock type='UInt64' default_value='3000' />

単一パーティション内のアクティブなパート数が`parts_to_throw_insert`の値を超えると、`INSERT`は`Too many parts (N). Merges are processing significantly slower than inserts`という例外で中断されます。

設定可能な値:

- 任意の正の整数

`SELECT`クエリの最大パフォーマンスを実現するには、処理されるパート数を最小化する必要があります。詳細については[Merge Tree](/development/architecture#merge-tree)を参照してください。

バージョン23.6以前では、この設定は300に設定されていました。より高い値を設定することで`Too many parts`エラーの発生確率を減らすことができますが、同時に`SELECT`のパフォーマンスが低下する可能性があります。また、マージの問題(例:ディスク容量不足)が発生した場合、元の300の設定と比較して問題の発見が遅れる可能性があります。


## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold}

<SettingsInfoBlock type='UInt64' default_value='10737418240' />

パーツのサイズの合計がこの閾値を超え、かつレプリケーションログエントリの作成からの経過時間が
`prefer_fetch_merged_part_time_threshold`より大きい場合、ローカルでマージを実行する代わりに
レプリカからマージ済みパーツを取得することが優先されます。これは非常に長時間のマージを高速化するためです。

設定可能な値:

- 任意の正の整数


## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold}

<SettingsInfoBlock type='Seconds' default_value='3600' />

レプリケーションログ(ClickHouse KeeperまたはZooKeeper)のエントリが作成されてからの経過時間がこの閾値を超え、かつパートサイズの合計が`prefer_fetch_merged_part_size_threshold`より大きい場合、ローカルでマージを実行する代わりに、レプリカからマージ済みパートを取得することが優先されます。これにより、非常に長時間かかるマージを高速化できます。

設定可能な値:

- 任意の正の整数


## prewarm_mark_cache {#prewarm_mark_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
trueの場合、挿入、マージ、フェッチ、およびサーバー起動時にマークをマークキャッシュに保存することで、マークキャッシュが事前にウォームアップされます


## prewarm_primary_key_cache {#prewarm_primary_key_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

trueの場合、プライマリインデックスキャッシュは、挿入、マージ、フェッチ、およびサーバー起動時にマークをマークキャッシュに保存することで事前にウォームアップされます


## primary_key_compress_block_size {#primary_key_compress_block_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='65536' />

プライマリキー圧縮ブロックサイズ。圧縮対象となるブロックの実際のサイズを指定します。


## primary_key_compression_codec {#primary_key_compression_codec}

<SettingsInfoBlock type='String' default_value='ZSTD(3)' />

プライマリキーで使用される圧縮コーデック。プライマリキーは十分に小さくキャッシュされるため、デフォルトの圧縮はZSTD(3)です。


## primary_key_lazy_load {#primary_key_lazy_load}

<SettingsInfoBlock type='Bool' default_value='1' />
テーブルの初期化時ではなく、最初の使用時にプライマリキーをメモリにロードします。これにより、多数のテーブルが存在する場合のメモリ使用量を削減できます。


## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns}

<SettingsInfoBlock type='Float' default_value='0.9' />

データパート内のプライマリキーのカラムの値が少なくともこの比率の回数で変化する場合、後続のカラムのメモリへの読み込みをスキップします。これにより、プライマリキーの不要なカラムを読み込まないことで、メモリ使用量を削減できます。


## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization}

<SettingsInfoBlock type='Float' default_value='0.9375' />

カラム内の_すべて_の値に対する_デフォルト_値の数の最小比率。この値を設定すると、カラムはスパースシリアライゼーションを使用して格納されます。

カラムがスパース(主にゼロを含む)である場合、ClickHouseはそれをスパース形式でエンコードし、計算を自動的に最適化できます。クエリ実行中にデータの完全な展開は不要です。このスパースシリアライゼーションを有効にするには、`ratio_of_defaults_for_sparse_serialization`設定を1.0未満に定義します。値が1.0以上の場合、カラムは常に通常の完全シリアライゼーションを使用して書き込まれます。

設定可能な値:

- スパースシリアライゼーションを有効にする場合は`0`から`1`の間の浮動小数点数
- スパースシリアライゼーションを使用しない場合は`1.0`(またはそれ以上)

**例**

以下のテーブルでは、`s`カラムが行の95%で空文字列であることに注意してください。`my_regular_table`ではスパースシリアライゼーションを使用せず、`my_sparse_table`では`ratio_of_defaults_for_sparse_serialization`を0.95に設定します:

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

`my_sparse_table`の`s`カラムがディスク上でより少ないストレージ容量を使用していることに注意してください:

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

`system.parts_columns`テーブルの`serialization_kind`カラムを確認することで、カラムがスパースエンコーディングを使用しているかどうかを検証できます:

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

`s`のどの部分がスパースシリアライゼーションを使用して格納されたかを確認できます:

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

<SettingsInfoBlock type='UInt64' default_value='5000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "5000" }, { label: "Cloud sync" }]
    }
  ]}
/>

ClickHouse Cloudでのみ利用可能です。範囲が削除または置換されなかった場合に、ブロッキングパーツの削減を再試行するまでの最小待機時間を指定します。この設定値を低くすると、background_schedule_pool内のタスクが頻繁にトリガーされるため、大規模クラスタではZooKeeperへのリクエストが大量に発生します


## refresh_parts_interval {#refresh_parts_interval}

<SettingsInfoBlock type='Seconds' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.4" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

ゼロより大きい値を設定すると、基盤となるファイルシステムからデータパーツのリストを更新し、データが内部で更新されたかどうかを確認します。
この設定は、テーブルが読み取り専用ディスクに配置されている場合にのみ設定できます(つまり、これは読み取り専用レプリカであり、データは別のレプリカによって書き込まれています)。


## refresh_statistics_interval {#refresh_statistics_interval}

<SettingsInfoBlock type='Seconds' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.11" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

統計キャッシュの更新間隔を秒単位で指定します。0に設定すると、更新が無効になります。


## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold}

<SettingsInfoBlock type='Seconds' default_value='10800' />

この設定値がゼロより大きい場合、共有ストレージ上にマージされたパートが存在する際に、単一のレプリカのみが直ちにマージを開始します。

:::note
ゼロコピーレプリケーションは本番環境での使用準備が整っていません
ゼロコピーレプリケーションは、ClickHouseバージョン22.8以降ではデフォルトで無効になっています。

この機能は本番環境での使用を推奨しません。
:::

設定可能な値:

- 任意の正の整数。


## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

変換プロセス中に互換モードでゼロコピーを実行します。


## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path}

<ExperimentalBadge />
<SettingsInfoBlock type='String' default_value='/clickhouse/zero_copy' />

ゼロコピー機能のテーブル非依存情報を格納するZooKeeperパス。


## remove_empty_parts {#remove_empty_parts}

<SettingsInfoBlock type='Bool' default_value='1' />

TTL、ミューテーション、または折りたたみマージアルゴリズムによって削除された後の空のパートを削除します。


## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='1' />

未完成の実験的機能に関する設定です。


## remove_unused_patch_parts {#remove_unused_patch_parts}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "1" }, { label: "新しい設定" }]
    }
  ]}
/>

すべてのアクティブなパーツに適用済みのパッチパーツをバックグラウンドで削除します。


## replace_long_file_name_to_hash {#replace_long_file_name_to_hash}

<SettingsInfoBlock type='Bool' default_value='1' />

カラムのファイル名が長すぎる場合（`max_file_name_length` バイトを超える場合）、SipHash128 に置き換えます


## replicated_can_become_leader {#replicated_can_become_leader}

<SettingsInfoBlock type='Bool' default_value='1' />

trueの場合、このノード上のレプリケートテーブルのレプリカがリーダーシップの取得を試みます。

設定可能な値:

- `true`
- `false`


## replicated_deduplication_window {#replicated_deduplication_window}

<SettingsInfoBlock type='UInt64' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.9" },
        { label: "10000" },
        { label: "デフォルト値を増加" }
      ]
    }
  ]}
/>

ClickHouse Keeperが重複チェックのためにハッシュサムを保存する、最近挿入されたブロックの数。

設定可能な値:

- 任意の正の整数
- 0（重複排除を無効化）

`Insert`コマンドは1つ以上のブロック（パート）を作成します。レプリケートされたテーブルへの書き込み時、[挿入の重複排除](../../engines/table-engines/mergetree-family/replication.md)において、ClickHouseは作成されたパートのハッシュサムをClickHouse Keeperに書き込みます。ハッシュサムは最新の`replicated_deduplication_window`個のブロックに対してのみ保存されます。最も古いハッシュサムはClickHouse Keeperから削除されます。

`replicated_deduplication_window`に大きな値を設定すると、比較する必要があるエントリが増えるため、`Insert`の処理速度が低下します。ハッシュサムは、フィールド名と型の構成、および挿入されたパートのデータ（バイトストリーム）から計算されます。


## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts}

<SettingsInfoBlock type='UInt64' default_value='10000' />

ClickHouse Keeperが重複チェックのためにハッシュサムを保存する、最新の非同期挿入ブロックの数。

設定可能な値:

- 任意の正の整数
- 0 (async_insertsの重複排除を無効化)

[Async Insert](/operations/settings/settings#async_insert)コマンドは、1つ以上のブロック(パート)にキャッシュされます。レプリケートされたテーブルへの書き込み時、[挿入の重複排除](/engines/table-engines/mergetree-family/replication)のために、ClickHouseは各挿入のハッシュサムをClickHouse Keeperに書き込みます。ハッシュサムは、最新の`replicated_deduplication_window_for_async_inserts`個のブロックに対してのみ保存されます。最も古いハッシュサムはClickHouse Keeperから削除されます。
`replicated_deduplication_window_for_async_inserts`の値が大きいと、比較するエントリが増えるため、`Async Inserts`の速度が低下します。
ハッシュサムは、フィールド名と型の構成、および挿入データ(バイトストリーム)から計算されます。


## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds}

<SettingsInfoBlock type='UInt64' default_value='3600' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.10" },
        { label: "3600" },
        { label: "デフォルト値を減少" }
      ]
    }
  ]}
/>

挿入されたブロックのハッシュ値がClickHouse Keeperから削除されるまでの秒数。

設定可能な値:

- 任意の正の整数。

[replicated_deduplication_window](#replicated_deduplication_window)と同様に、
`replicated_deduplication_window_seconds`は挿入の重複排除のためにブロックのハッシュ値を保存する期間を指定します。`replicated_deduplication_window_seconds`より古いハッシュ値は、`replicated_deduplication_window`未満であってもClickHouse Keeperから削除されます。

時間は実時間ではなく、最新のレコードの時刻を基準とした相対時間です。唯一のレコードである場合は、永続的に保存されます。


## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts}

<SettingsInfoBlock type='UInt64' default_value='604800' />

非同期インサートのハッシュサムがClickHouse Keeperから削除されるまでの秒数。

設定可能な値:

- 任意の正の整数。

[replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts)と同様に、
`replicated_deduplication_window_seconds_for_async_inserts`は、非同期インサートの重複排除のためにブロックのハッシュサムを保存する期間を指定します。`replicated_deduplication_window_seconds_for_async_inserts`より古いハッシュサムは、`replicated_deduplication_window_for_async_inserts`未満であってもClickHouse Keeperから削除されます。

時間は実時間ではなく、最新のレコードの時刻を基準とした相対時間です。唯一のレコードである場合は、永続的に保存されます。


## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

<SettingsInfoBlock type="Seconds" default_value="0" />
廃止された設定です。何も動作しません。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
廃止された設定です。何も動作しません。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
廃止された設定です。何も動作しません。
## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

1つのMUTATE_PARTエントリでマージして実行できるmutationコマンドの最大数（0は無制限）


## replicated_max_parallel_fetches {#replicated_max_parallel_fetches}

<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定です。何も動作しません。
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 
<SettingsInfoBlock type="UInt64" default_value="15" />
廃止された設定です。何も動作しません。
## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定です。何も動作しません。
## replicated_max_parallel_sends {#replicated_max_parallel_sends} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定です。何も動作しません。
## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
廃止された設定です。何も動作しません。
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 
<SettingsInfoBlock type="Float" default_value="0.5" />

不正なパーツの総パーツ数に対する比率がこの値未満の場合、起動を許可します。

Possible values:

- Float、0.0 - 1.0


## search_orphaned_parts_disks {#search_orphaned_parts_disks}

<SettingsInfoBlock type='SearchOrphanedPartsDisks' default_value='any' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.8" }, { label: "any" }, { label: "新しい設定" }]
    }
  ]}
/>

ClickHouseは、ATTACHまたはCREATEテーブルの実行時に、未定義(ポリシーに含まれていない)ディスク上のデータパーツを見逃さないようにするため、すべてのディスクをスキャンして孤立したパーツを検索します。
孤立したパーツは、潜在的に安全でないストレージの再構成(例:ディスクがストレージポリシーから除外された場合)に起因します。
この設定は、ディスクの特性に基づいて検索対象となるディスクの範囲を制限します。

設定可能な値:

- any - 範囲は制限されません。
- local - 範囲はローカルディスクに制限されます。
- none - 空の範囲、検索を行いません


## serialization_info_version {#serialization_info_version}

<SettingsInfoBlock
  type='MergeTreeSerializationInfoVersion'
  default_value='with_types'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "with_types" },
        {
          label:
            "カスタム文字列シリアライゼーションを可能にする新しいフォーマットへの変更"
        }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.10" }, { label: "basic" }, { label: "新しい設定" }]
    }
  ]}
/>

`serialization.json`の書き込み時に使用されるシリアライゼーション情報のバージョンです。
この設定は、クラスタのアップグレード中の互換性を確保するために必要です。

使用可能な値:

- `basic` - 基本フォーマット。
- `with_types` - 追加の`types_serialization_versions`フィールドを含むフォーマットで、型ごとのシリアライゼーションバージョンを可能にします。
  これにより、`string_serialization_version`などの設定が有効になります。

ローリングアップグレード中は、新しいサーバーが古いサーバーと互換性のあるデータパートを生成するように、この設定を`basic`に設定してください。アップグレードが完了したら、
型ごとのシリアライゼーションバージョンを有効にするために`with_types`に切り替えてください。


## shared_merge_tree_activate_coordinated_merges_tasks {#shared_merge_tree_activate_coordinated_merges_tasks}

<BetaBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "0" }, { label: "新しい設定" }]
    },
    {
      id: "row-2",
      items: [{ label: "25.8" }, { label: "0" }, { label: "新しい設定" }]
    },
    {
      id: "row-3",
      items: [{ label: "25.7" }, { label: "0" }, { label: "新しい設定" }]
    },
    {
      id: "row-4",
      items: [{ label: "25.6" }, { label: "0" }, { label: "新しい設定" }]
    },
    {
      id: "row-5",
      items: [{ label: "25.10" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

協調マージタスクの再スケジューリングを有効化します。shared_merge_tree_enable_coordinated_merges=0の場合でも有用です。マージコーディネーターの統計情報を蓄積し、コールドスタート時の支援に役立つためです。


## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "0" },
        { label: "Keeper内のメタデータ量を削減します。" }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Cloud同期" }]
    }
  ]}
/>

ZooKeeper内にレプリカごとの /metadata および /columns ノードの作成を有効にします。
ClickHouse Cloudでのみ利用可能です


## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment}

<SettingsInfoBlock type='Bool' default_value='0' />

共有マージツリーに対するマージの割り当てを停止します。ClickHouse Cloudでのみ利用可能です


## shared_merge_tree_empty_partition_lifetime {#shared_merge_tree_empty_partition_lifetime}

<SettingsInfoBlock type='Seconds' default_value='86400' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "86400" }, { label: "New setting" }]
    }
  ]}
/>

パーツが存在しない場合に、パーティションがKeeperに保存される秒数。


## shared_merge_tree_enable_automatic_empty_partitions_cleanup {#shared_merge_tree_enable_automatic_empty_partitions_cleanup}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

空のパーティションに対するKeeperエントリのクリーンアップを有効化します。


## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges}

<BetaBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "0" }, { label: "New setting" }]
    }
  ]}
/>

協調マージ戦略を有効化します


## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data}

<BetaBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.3" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

仮想パートへの属性書き込みとkeeperへのブロックコミットを有効化します


## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Cloud sync" }]
    }
  ]}
/>

古くなったパーツのチェックを有効にします。ClickHouse Cloudでのみ利用可能です


## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds}

<SettingsInfoBlock type='UInt64' default_value='3600' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "3600" }, { label: "Cloud sync" }]
    }
  ]}
/>

共有マージツリーにおいて、ZooKeeperウォッチによってトリガーされずにパーツを更新する間隔(秒単位)。ClickHouse Cloudでのみ利用可能


## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms}

<SettingsInfoBlock type='UInt64' default_value='50' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "50" }, { label: "新しい設定" }]
    }
  ]}
/>

パーツ更新の初期バックオフ時間。ClickHouse Cloudでのみ利用可能


## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms}

<SettingsInfoBlock type='UInt64' default_value='100' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "100" }, { label: "New setting" }]
    }
  ]}
/>

サーバー間HTTP接続のタイムアウト。ClickHouse Cloudでのみ使用可能


## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms}

<SettingsInfoBlock type='UInt64' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10000" }, { label: "Cloud sync" }]
    }
  ]}
/>

サーバー間HTTP通信のタイムアウト設定。ClickHouse Cloudでのみ利用可能です。


## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

shared_merge_tree_leader_update_periodに0からx秒の一様分布値を加算し、サンダリングハード効果を回避します。ClickHouse Cloudでのみ利用可能です


## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds}

<SettingsInfoBlock type='UInt64' default_value='30' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "30" }, { label: "Cloud sync" }]
    }
  ]}
/>

パーツ更新のリーダーシップを再確認する最大期間。ClickHouse Cloudでのみ利用可能です


## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once}

<SettingsInfoBlock type='UInt64' default_value='1000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1000" }, { label: "Cloud sync" }]
    }
  ]}
/>

リーダーが1回のHTTPリクエストで削除の確認を試みる、古くなったパーツの最大数。ClickHouse Cloudでのみ利用可能です。


## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms}

<SettingsInfoBlock type='UInt64' default_value='5000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "5000" }, { label: "新しい設定" }]
    }
  ]}
/>

パーツ更新の最大バックオフ時間。ClickHouse Cloudでのみ利用可能


## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total}

<SettingsInfoBlock type='UInt64' default_value='6' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "6" }, { label: "Cloud sync" }]
    }
  ]}
/>

パーツ更新リーダーの最大数。ClickHouse Cloudでのみ利用可能です


## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az}

<SettingsInfoBlock type='UInt64' default_value='2' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "2" }, { label: "Cloud sync" }]
    }
  ]}
/>

パーツ更新リーダーの最大数。ClickHouse Cloudでのみ使用可能


## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

パーツ削除（killerスレッド）に参加するレプリカの最大数。ClickHouse Cloudでのみ利用可能


## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range}

<SettingsInfoBlock type='UInt64' default_value='5' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "5" }, { label: "Cloud sync" }]
    }
  ]}
/>

潜在的に競合する可能性のあるマージの割り当てを試行する最大レプリカ数（マージ割り当て時の冗長な競合を回避します）。0は無効を意味します。ClickHouse Cloudでのみ利用可能


## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.2" },
        { label: "0" },
        { label: "SMTの破損パーツの最大数。この値を超えた場合は自動デタッチを拒否します" }
      ]
    }
  ]}
/>

SMTの破損パーツの最大数。この値を超えた場合は自動デタッチを拒否します.


## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.2" },
        { label: "0" },
        {
          label:
            "SMTの破損パーツの最大合計サイズ。この値を超える場合は自動デタッチを拒否"
        }
      ]
    }
  ]}
/>

SMTの破損パーツの最大合計サイズ。この値を超える場合は自動デタッチを拒否.


## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds}

<SettingsInfoBlock type='Int64' default_value='1800' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1800" }, { label: "Cloud sync" }]
    }
  ]}
/>

挿入の再試行中に誤った操作を防ぐために、挿入メモ化IDを保持する期間。ClickHouse Cloudでのみ利用可能


## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='30000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "30000" }, { label: "New setting" }]
    }
  ]}
/>

マージコーディネーター選出スレッドの実行間隔


## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor}

<BetaBadge />
<SettingsInfoBlock type='Float' default_value='1.1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.5" },
        { label: "1.100000023841858" },
        { label: "新しい設定" }
      ]
    },
    {
      id: "row-2",
      items: [
        { label: "25.10" },
        { label: "1.100000023841858" },
        { label: "負荷後のコーディネータースリープ時間の短縮" }
      ]
    }
  ]}
/>

コーディネータースレッドの遅延時間変更係数


## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "10000" }, { label: "New setting" }]
    }
  ]}
/>

マージコーディネーターがZooKeeperと同期して最新のメタデータを取得する頻度


## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size}

<BetaBadge />
<SettingsInfoBlock type='UInt64' default_value='20' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "20" }, { label: "New setting" }]
    }
  ]}
/>

コーディネーターがMergerMutatorに一度にリクエストできるマージの数


## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "10000" }, { label: "New setting" }]
    }
  ]}
/>

マージコーディネータースレッドの実行間の最大時間間隔


## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count}

<BetaBadge />
<SettingsInfoBlock type='UInt64' default_value='100' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "100" }, { label: "New setting" }]
    }
  ]}
/>

コーディネーターが準備し、ワーカー間で配布するマージエントリの数


## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "1" }, { label: "New setting" }]
    }
  ]}
/>

マージコーディネータースレッドの実行間の最小時間間隔


## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='100' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "100" }, { label: "New setting" }]
    }
  ]}
/>

即座のアクション後にマージワーカースレッドが状態を更新する必要がある場合に使用されるタイムアウト


## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "10000" }, { label: "New setting" }]
    }
  ]}
/>

マージワーカースレッドの実行間隔


## shared_merge_tree_outdated_parts_group_size {#shared_merge_tree_outdated_parts_group_size}

<SettingsInfoBlock type='UInt64' default_value='2' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "2" }, { label: "新しい設定" }]
    }
  ]}
/>

古いパーツのクリーンアップ時に、同じランデブーハッシュグループに含まれるレプリカの数。
ClickHouse Cloudでのみ利用可能です。


## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations}

<SettingsInfoBlock type='Float' default_value='0.5' />

`<ミューテーション専用の候補パーティション（マージ不可能なパーティション）>/<ミューテーション用の候補パーティション>`の比率がこの設定値を上回る場合、マージ/ミューテーション選択タスクにおいてマージ述語を再読み込みします。ClickHouse Cloudでのみ利用可能です


## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size}

<SettingsInfoBlock type='UInt64' default_value='32' />

一度にスケジュールするパーツメタデータ取得ジョブの数。ClickHouse Cloud でのみ利用可能


## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Cloud sync" }]
    }
  ]}
/>

ローカルでマージされたパートを保持し、このパートを含む新しいマージを開始しない期間。他のレプリカがこのパートを取得し、マージを開始する機会を与えます。
ClickHouse Cloudでのみ利用可能です。


## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1000000" }, { label: "Cloud sync" }]
    }
  ]}
/>

ローカルでマージした直後に次のマージの割り当てを延期するパートの最小サイズ（行数）。ClickHouse Cloudでのみ利用可能です。


## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

ローカルでマージされたパートを、そのパートを含む新しいマージを開始せずに保持する時間。他のレプリカがこのパートを取得してマージを開始できる機会を提供します。
ClickHouse Cloudでのみ利用可能です。


## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Cloud sync" }]
    }
  ]}
/>

可能な場合、リーダーから仮想パーツを読み取ります。ClickHouse Cloudでのみ利用可能です


## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.1" },
        { label: "0" },
        { label: "他のレプリカからパートデータを取得するための新しい設定" }
      ]
    }
  ]}
/>

有効にすると、すべてのレプリカは、既に存在する他のレプリカからパートのインメモリデータ(プライマリキー、パーティション情報など)の取得を試みます。


## shared_merge_tree_update_replica_flags_delay_ms {#shared_merge_tree_update_replica_flags_delay_ms}

<SettingsInfoBlock type='Milliseconds' default_value='30000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.8" }, { label: "30000" }, { label: "新しい設定" }]
    }
  ]}
/>

レプリカがバックグラウンドスケジュールに従ってフラグを再読み込みする頻度。


## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Cloud sync" }]
    }
  ]}
/>

他のレプリカのインメモリキャッシュからFSキャッシュヒントをリクエストする機能を有効にします。ClickHouse Cloudでのみ利用可能です


## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.9" },
        { label: "1" },
        { label: "デフォルトで古いパーツv3を有効にする" }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.1" }, { label: "0" }, { label: "クラウド同期" }]
    }
  ]}
/>

古いパーツにコンパクト形式を使用します:Keeperへの負荷を軽減し、古いパーツの処理を改善します。ClickHouse Cloudでのみ利用可能です


## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Cloud sync" }]
    }
  ]}
/>

有効にすると、パーツ数過多カウンターはローカルレプリカの状態ではなく、Keeper内の共有データに基づいて動作します。ClickHouse Cloudでのみ利用可能です


## shared_merge_tree_virtual_parts_discovery_batch {#shared_merge_tree_virtual_parts_discovery_batch}

<ExperimentalBadge />
<SettingsInfoBlock type='UInt64' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.8" }, { label: "1" }, { label: "New setting" }]
    }
  ]}
/>

バッチにまとめるパーティション検出の数


## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit}

<SettingsInfoBlock type='UInt64' default_value='0' />

古いパーツが多数存在する場合、クリーンアップスレッドは1回のイテレーションで最大`simultaneous_parts_removal_limit`個のパーツの削除を試みます。
`simultaneous_parts_removal_limit`を`0`に設定すると無制限になります。


## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms}

<SettingsInfoBlock type='Milliseconds' default_value='0' />

テスト用です。変更しないでください。


## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />

テスト用です。変更しないでください。


## storage_policy {#storage_policy}

<SettingsInfoBlock type='String' default_value='default' />

ストレージディスクポリシーの名前


## string_serialization_version {#string_serialization_version}

<SettingsInfoBlock
  type='MergeTreeStringSerializationVersion'
  default_value='with_size_stream'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "with_size_stream" },
        { label: "サイズを分離した新しい形式への変更" }
      ]
    },
    {
      id: "row-2",
      items: [
        { label: "25.10" },
        { label: "single_stream" },
        { label: "新しい設定" }
      ]
    }
  ]}
/>

トップレベルの`String`カラムのシリアライゼーション形式を制御します。

この設定は`serialization_info_version`が"with_types"に設定されている場合にのみ有効です。
有効にすると、トップレベルの`String`カラムは、インラインではなく文字列長を格納する独立した`.size`サブカラムと共にシリアライズされます。これにより実際の`.size`サブカラムが利用可能になり、圧縮効率を向上させることができます。

ネストされた`String`型(例:`Nullable`、`LowCardinality`、`Array`、`Map`内)は、`Tuple`内に出現する場合を除き影響を受けません。

設定可能な値:

- `single_stream` — インラインサイズを使用する標準的なシリアライゼーション形式を使用します。
- `with_size_stream` — トップレベルの`String`カラムに対して独立したサイズストリームを使用します。


## table_disk {#table_disk}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

これはテーブルディスクです。パス/エンドポイントは、データベースデータではなく、テーブルデータを指している必要があります。s3_plain/s3_plain_rewritable/webに対してのみ設定できます。


## temporary_directories_lifetime {#temporary_directories_lifetime}

<SettingsInfoBlock type='Seconds' default_value='86400' />

tmp\_-ディレクトリを保持する秒数。マージやミューテーションが正常に動作しなくなる可能性があるため、この値を下げないでください。


## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout}

<SettingsInfoBlock type='Seconds' default_value='7200' />

再圧縮を伴うマージを開始するまでのタイムアウト（秒単位）。この時間内に、ClickHouseは再圧縮を伴うマージが割り当てられたレプリカから再圧縮されたパートの取得を試みます。

再圧縮は多くの場合処理が遅いため、このタイムアウトに達するまでは再圧縮を伴うマージを開始せず、再圧縮を伴うマージが割り当てられたレプリカから再圧縮されたパートの取得を試みます。

設定可能な値:

- 任意の正の整数。


## ttl_only_drop_parts {#ttl_only_drop_parts}

<SettingsInfoBlock type='Bool' default_value='0' />

MergeTreeテーブルにおいて、パート内のすべての行が`TTL`設定に従って有効期限切れになった際に、データパート全体を削除するかどうかを制御します。

`ttl_only_drop_parts`が無効の場合（デフォルト）、TTL設定に基づいて有効期限切れになった行のみが削除されます。

`ttl_only_drop_parts`が有効の場合、パート内のすべての行が`TTL`設定に従って有効期限切れになっていれば、パート全体が削除されます。


## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns}

<SettingsInfoBlock type='Bool' default_value='1' />

動的サブカラムの書き込み時にアダプティブライターバッファを使用し、メモリ使用量を削減します


## use_async_block_ids_cache {#use_async_block_ids_cache}

<SettingsInfoBlock type='Bool' default_value='1' />

trueの場合、非同期インサートのハッシュサムをキャッシュします。

設定可能な値:

- `true`
- `false`

複数の非同期インサートを含むブロックは、複数のハッシュサムを生成します。
一部のインサートが重複している場合、keeperは1回のRPCで1つの重複したハッシュサムのみを返すため、不要なRPC再試行が発生します。
このキャッシュはKeeper内のハッシュサムのパスを監視します。Keeperで更新が検出されると、キャッシュは可能な限り速やかに更新されるため、メモリ内で重複したインサートをフィルタリングできます。


## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization}

<SettingsInfoBlock type='Bool' default_value='1' />

Variant データ型の判別子のバイナリシリアライゼーションにおいて、コンパクトモードを有効にします。
このモードでは、主に1つのバリアントまたは多数のNULL値が存在する場合、パート内の判別子の保存に必要なメモリを大幅に削減できます。


## use_const_adaptive_granularity {#use_const_adaptive_granularity}

<SettingsInfoBlock type='Bool' default_value='0' />

パート全体に対して常に一定の粒度を使用します。これにより、インデックス粒度の値をメモリ内で圧縮することができます。カラム数の少ないテーブルを使用する非常に大規模なワークロードで有用です。


## use_metadata_cache {#use_metadata_cache}

<SettingsInfoBlock type="Bool" default_value="0" />
廃止された設定です。何も動作しません。
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper内のパートチェックサムに、通常のフォーマット(数十KB)ではなく小さなフォーマット(数十バイト)を使用します。有効化する前に、すべてのレプリカが新しいフォーマットに対応していることを確認してください。


## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

<SettingsInfoBlock type='Bool' default_value='1' />

ZooKeeper内のデータパーツヘッダーの保存方法を指定します。有効にすると、ZooKeeperに保存されるデータ量が削減されます。詳細については、[こちら](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)を参照してください。


## use_primary_key_cache {#use_primary_key_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

すべてのインデックスをメモリに保存する代わりに、プライマリインデックスのキャッシュを使用します。非常に大規模なテーブルで有用です


## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate}

<SettingsInfoBlock type='UInt64' default_value='0' />

Vertical mergeアルゴリズムを有効化するための、マージ対象パーツの最小（概算）非圧縮サイズ（バイト単位）。


## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate}

<SettingsInfoBlock type='UInt64' default_value='11' />

垂直マージアルゴリズムを有効化するための非PK列の最小数。


## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate}

<SettingsInfoBlock type='UInt64' default_value='131072' />

Vertical mergeアルゴリズムを有効化するための、マージ対象パーツの行数の最小（概算）合計。


## vertical_merge_optimize_lightweight_delete {#vertical_merge_optimize_lightweight_delete}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "1" }, { label: "新しい設定" }]
    }
  ]}
/>

trueの場合、垂直マージにおいて軽量削除が最適化されます。


## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch}

<SettingsInfoBlock type='Bool' default_value='1' />

trueの場合、マージ中に次のカラムに対してリモートファイルシステムからデータのプリフェッチが使用されます


## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms}

<SettingsInfoBlock type='Milliseconds' default_value='0' />

シャットダウン前に、テーブルは固有パーツ(現在のレプリカにのみ存在)が他のレプリカによってフェッチされるまで、必要な時間待機します(0は無効を意味します)。


## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync}

<SettingsInfoBlock type="UInt64" default_value="104857600" />
廃止された設定です。何も実行しません。
## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="100" />
廃止された設定です。何も実行しません。
## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
廃止された設定です。何も実行しません。
## write_final_mark {#write_final_mark} 
<SettingsInfoBlock type="Bool" default_value="1" />
廃止された設定です。何も実行しません。
## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "デフォルトでCompactパートのサブストリームに対するマーク書き込みを有効化"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定"}]}]}/>

Compactパートにおいて、各カラム単位ではなく各サブストリーム単位でマークを書き込むことを有効にします。
これにより、データパートから個々のサブカラムを効率的に読み取ることが可能になります。

例えば、カラム `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` は次のサブストリームにシリアライズされます:

- `t.a` タプル要素 `a` のString型データ用
- `t.b` タプル要素 `b` のUInt32型データ用
- `t.c.size0` タプル要素 `c` の配列サイズ用
- `t.c.null` タプル要素 `c` のネストされた配列要素のnullマップ用
- `t.c` タプル要素 `c` のネストされた配列要素のUInt32型データ用

この設定を有効にすると、これら5つのサブストリームそれぞれに対してマークが書き込まれます。つまり、必要に応じてグラニュールから各サブストリームのデータを個別に読み取ることができます。例えば、サブカラム `t.c` を読み取る場合、サブストリーム `t.c.size0`、`t.c.null`、`t.c` のデータのみを読み取り、サブストリーム `t.a` と `t.b` のデータは読み取りません。この設定を無効にすると、トップレベルのカラム `t` に対してのみマークが書き込まれます。つまり、一部のサブストリームのデータのみが必要な場合でも、常にグラニュールからカラム全体のデータを読み取ることになります。


## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio}

<SettingsInfoBlock type='Float' default_value='0.05' />

より小さな独立した範囲を取得するために削除を延期する、トップレベルパーツの最大割合。変更は推奨されません。


## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times}

<SettingsInfoBlock type='UInt64' default_value='5' />

独立した古いパーツ範囲をより小さなサブ範囲に分割する際の最大再帰深度。変更は推奨されません。


## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

ゼロコピーレプリケーションが有効な場合、マージまたはミューテーションのためのロック取得を試みる前に、パーツサイズに応じてランダムな時間待機します


## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.3" }, { label: "0" }, { label: "新しい設定" }]
    }
  ]}
/>

ゼロコピーレプリケーションが有効な場合、マージまたはミューテーションのためのロック取得を試みる前に、最大500ミリ秒のランダムな時間スリープします。


## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period}

<SettingsInfoBlock type='Seconds' default_value='60' />

ZooKeeperセッションの有効期限チェック間隔（秒単位）。

設定可能な値:

- 任意の正の整数。
