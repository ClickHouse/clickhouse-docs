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

システムテーブル `system.merge_tree_settings` には、グローバルに設定された MergeTree の設定が表示されます。

MergeTree の設定は、サーバー設定ファイルの `merge_tree` セクションでサーバー全体に対して行うか、`CREATE TABLE` ステートメントの `SETTINGS` 句で各 `MergeTree` テーブルごとに個別に指定できます。

設定項目 `max_suspicious_broken_parts` をカスタマイズする例:

サーバー設定ファイルで、すべての `MergeTree` テーブルに対するデフォルト値を設定します。

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

特定のテーブルの設定を変更するには、`ALTER TABLE ... MODIFY SETTING` を使用します。

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- reset to global default (value from system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## MergeTree の設定 \{#mergetree-settings\}

{/* 以下の設定は、次のスクリプトで自動生成されています
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }


## adaptive_write_buffer_initial_size \{#adaptive_write_buffer_initial_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16384" />

アダプティブ書き込みバッファの初期サイズ

## add_implicit_sign_column_constraint_for_collapsing_engine \{#add_implicit_sign_column_constraint_for_collapsing_engine\}

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定されている場合、CollapsingMergeTree または VersionedCollapsingMergeTree テーブルの `sign` カラムに対して、許可される値（`1` および `-1`）のみを許可する暗黙的な制約を追加します。

## add_minmax_index_for_numeric_columns \{#add_minmax_index_for_numeric_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

有効化すると、テーブル内のすべての数値カラムに min-max（スキップ）索引が作成されます。

## 文字列カラムに min-max インデックスを追加する \{#add_minmax_index_for_string_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

有効にすると、テーブル内のすべての文字列カラムに対して min-max（スキップ）索引が追加されます。

## add_minmax_index_for_temporal_columns \{#add_minmax_index_for_temporal_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "0"},{"label": "New setting"}]}]}/>

有効にすると、テーブル内のすべての Date、Date32、Time、Time64、DateTime、および DateTime64 カラムに対して min-max（スキップ）索引が追加されます。

## allow_coalescing_columns_in_partition_or_order_key \{#allow_coalescing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "PARTITION またはソートキーに coalescing カラムを使用可能にする新しい設定。"}]}]}/>

有効化すると、CoalescingMergeTree テーブルの coalescing カラムを
パーティションキーまたはソートキーとして使用できるようになります。

## allow_experimental_replacing_merge_with_cleanup \{#allow_experimental_replacing_merge_with_cleanup\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

`is_deleted` カラムを持つ ReplacingMergeTree に対して、実験的な CLEANUP マージを許可します。有効にすると、`OPTIMIZE ... FINAL CLEANUP` を使用して、パーティション内のすべてのパーツを 1 つのパーツに手動でマージし、削除済みの行を削除できるようになります。

また、`min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only`、`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` の各設定により、この種のマージをバックグラウンドで自動的に実行できるようにもなります。

## allow_experimental_reverse_key \{#allow_experimental_reverse_key\}

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

MergeTree のソートキーで降順ソートをサポートできるようにします。
この設定は特に時系列分析や Top-N クエリに有用であり、データを逆時系列で
保存してクエリパフォーマンスを最適化できるようにします。

`allow_experimental_reverse_key` を有効にすると、MergeTree テーブルの
`ORDER BY` 句内で降順ソートを定義できます。これにより、降順クエリに対して
`ReadInReverseOrder` の代わりに、より効率的な `ReadInOrder` 最適化を
利用できるようになります。

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


## allow_floating_point_partition_key \{#allow_floating_point_partition_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

パーティションキーとして浮動小数点数の使用を許可します。

可能な値:

- `0` — 浮動小数点数のパーティションキーは許可されません。
- `1` — 浮動小数点数のパーティションキーが許可されます。

## allow_nullable_key \{#allow_nullable_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

主キーに Nullable 型を使用することを許可します。

## allow_part_offset_column_in_projections \{#allow_part_offset_column_in_projections\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "プロジェクションで _part_offset カラムを使用できるようになりました。"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定です。安定するまで、親パーツのオフセットカラムを含むプロジェクションが作成されないようにします。"}]}]}/>

プロジェクションに対する SELECT クエリで '_part_offset' カラムの使用を許可します。

## allow_reduce_blocking_parts_task \{#allow_reduce_blocking_parts_task\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "現在、SMT はデフォルトで ZooKeeper から古いブロッキング中のパーツを削除します"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同期"}]}]}/>

共有 MergeTree テーブルのブロッキングパーツを減らすバックグラウンドタスクです。
ClickHouse Cloud のみで利用できます。

## allow_remote_fs_zero_copy_replication \{#allow_remote_fs_zero_copy_replication\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

本番環境ではこの設定を使用しないでください。まだ準備が整っていません。

## allow_summing_columns_in_partition_or_order_key \{#allow_summing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "パーティションキーまたはソートキーに集計カラムを含めることを許可する新しい設定"}]}]}/>

有効化すると、SummingMergeTree テーブルの集計カラムを、パーティションキーまたはソートキーに含めて定義できるようになります。

## allow_suspicious_indices \{#allow_suspicious_indices\}

<SettingsInfoBlock type="Bool" default_value="0" />

同一の式を使用するプライマリ／セカンダリ索引およびソートキーを拒否します

## allow_vertical_merges_from_compact_to_wide_parts \{#allow_vertical_merges_from_compact_to_wide_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

コンパクトパーツからワイドパーツへの垂直マージを許可します。この設定はすべてのレプリカで同じ値にする必要があります。

## alter_column_secondary_index_mode \{#alter_column_secondary_index_mode\}

<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "Change the behaviour to allow ALTER `column` when they have dependent secondary indices"}]}]}/>

セカンダリ索引でカバーされているカラムを変更する `ALTER` コマンドを許可するかどうかと、許可する場合の動作を設定します。デフォルトでは、このような `ALTER` コマンドは許可され、索引は再構築されます。

指定可能な値:

- `rebuild` (default): `ALTER` コマンドで対象となるカラムにより影響を受けるセカンダリ索引を再構築します。
- `throw`: **明示的な** セカンダリ索引でカバーされているカラムに対するあらゆる `ALTER` を、例外をスローすることで防ぎます。暗黙的な索引はこの制限の対象外であり、再構築されます。
- `drop`: 依存しているセカンダリ索引を削除します。新しいパーツには索引が存在しなくなり、再作成には `MATERIALIZE INDEX` が必要です。
- `compatibility`: 元の動作に一致させます: `ALTER ... MODIFY COLUMN` では `throw`、`ALTER ... UPDATE/DELETE` では `rebuild`。
- `ignore`: 上級ユーザー向けです。この設定では索引が不整合な状態のままになり、その結果、誤ったクエリ結果が返される可能性があります。

## always_fetch_merged_part \{#always_fetch_merged_part\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、このレプリカではパーツのマージ処理を行わず、常に他のレプリカからマージ済みパーツをダウンロードします。

指定可能な値:

- true, false

## always_use_copy_instead_of_hardlinks \{#always_use_copy_instead_of_hardlinks\}

<SettingsInfoBlock type="Bool" default_value="0" />

mutations / replaces / detaches などの処理中に、ハードリンクを使用せず、常にデータをコピーします。

## apply_patches_on_merge \{#apply_patches_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

true の場合、マージ時にパッチパーツが適用されます。

## assign_part_uuids \{#assign_part_uuids\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、作成される各新規パーツに一意の識別子が割り当てられます。
有効にする前に、すべてのレプリカが UUID バージョン 4 をサポートしていることを確認してください。

## async_block_ids_cache_update_wait_ms \{#async_block_ids_cache_update_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

各 insert イテレーションが async_block_ids_cache の更新を待機する時間。

## async_insert \{#async_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、INSERT クエリによるデータはキューに格納され、後でバックグラウンドでテーブルにフラッシュされます。

## auto_statistics_types \{#auto_statistics_types\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting"}]}]}/>

適用可能なすべてのカラムに対して自動計算する統計タイプを指定する、カンマ区切りのリストです。
サポートされている統計タイプ: tdigest, countmin, minmax, uniq。

## background_task_preferred_step_execution_time_ms \{#background_task_preferred_step_execution_time_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

マージまたはミューテーションの1ステップの実行時間に対する目標値。  
1ステップにより長い時間がかかる場合は、この目標時間を超えることがあります。

## cache_populated_by_fetch \{#cache_populated_by_fetch\}

<SettingsInfoBlock type="Bool" default_value="0" />

:::note
この設定は ClickHouse Cloud にのみ適用されます。
:::

`cache_populated_by_fetch` が無効（デフォルト）の場合、新しいデータパーツは、それらのパーツを必要とするクエリが実行されたときにのみ、ファイルシステムキャッシュに読み込まれます。

有効な場合は、`cache_populated_by_fetch` により、クエリによるトリガーを必要とせずに、すべてのノードがストレージから新しいデータパーツをファイルシステムキャッシュに読み込みます。

**関連項目**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)

## cache_populated_by_fetch_filename_regexp \{#cache_populated_by_fetch_filename_regexp\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "New setting"}]}]}/>

:::note
この設定は ClickHouse Cloud にのみ適用されます。
:::

空でない場合は、（`cache_populated_by_fetch` が有効なとき）fetch の完了後にキャッシュへ事前読み込みされるのは、この正規表現にマッチするファイルだけになります。

## check_delay_period \{#check_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="60" />

非推奨の設定で、何も効果はありません。

## check_sample_column_is_correct \{#check_sample_column_is_correct\}

<SettingsInfoBlock type="Bool" default_value="1" />

テーブル作成時に、サンプリングに使用するカラム、またはサンプリング式のデータ型が正しいかどうかをチェックします。データ型は符号なしの
[整数型](/sql-reference/data-types/int-uint) のいずれかである必要があります: `UInt8`, `UInt16`,
`UInt32`, `UInt64`。

設定可能な値:

- `true`  — チェックを有効にします。
- `false` — テーブル作成時のチェックを無効にします。

デフォルト値: `true`。

デフォルトでは、ClickHouse サーバーはテーブル作成時に、サンプリングに使用するカラム、またはサンプリング式のデータ型をチェックします。すでに不正なサンプリング式を持つテーブルが存在し、サーバー起動時に例外がスローされることを避けたい場合は、`check_sample_column_is_correct` を `false` に設定します。

## clean_deleted_rows \{#clean_deleted_rows\}

<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />

廃止された設定で、現在は何も行いません。

## cleanup_delay_period \{#cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

古いキューのログ、ブロックハッシュ、およびパーツをクリーンアップするための最小間隔。

## cleanup_delay_period_random_add \{#cleanup_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

非常に多くのテーブルが存在する場合に ZooKeeper への DoS 攻撃を引き起こし得る
「thundering herd」問題を回避するため、
cleanup_delay_period に 0 から x 秒までの一様分布に従う値を加算します。

## cleanup_thread_preferred_points_per_iteration \{#cleanup_thread_preferred_points_per_iteration\}

<SettingsInfoBlock type="UInt64" default_value="150" />

バックグラウンドでのクリーンアップ処理における推奨バッチサイズ（ポイントは抽象的な指標だが、1 ポイントはおおよそ 1 挿入ブロックに相当する）。

## cleanup_threads \{#cleanup_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

この設定は廃止されており、何も行いません。

## clone_replica_zookeeper_create_get_part_batch_size \{#clone_replica_zookeeper_create_get_part_batch_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "100"},{"label": "New setting"}]}]}/>

レプリカのクローン時に ZooKeeper で実行される multi-create get-part リクエストのバッチサイズ。

## columns_and_secondary_indices_sizes_lazy_calculation \{#columns_and_secondary_indices_sizes_lazy_calculation\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "カラムおよびセカンダリインデックスのサイズを遅延して計算する新しい設定"}]}]}/>

テーブルの初期化時ではなく、最初のリクエスト時に初めてカラムとセカンダリインデックスのサイズを遅延して計算します。

## columns_to_prewarm_mark_cache \{#columns_to_prewarm_mark_cache\}

（有効な場合に）マークキャッシュを事前ウォームする対象とするカラムの一覧。空の場合はすべてのカラムを対象とします

## compact_parts_max_bytes_to_buffer \{#compact_parts_max_bytes_to_buffer\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />

ClickHouse Cloud でのみ使用可能です。compact パーツで 1 つの stripe に書き込むバイト数の上限

## compact_parts_max_granules_to_buffer \{#compact_parts_max_granules_to_buffer\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="128" />

ClickHouse Cloud でのみ利用可能です。compact パーツで、1 つのストライプに書き込むグラニュールの最大数。

## compact_parts_merge_max_bytes_to_prefetch_part \{#compact_parts_merge_max_bytes_to_prefetch_part\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

ClickHouse Cloud でのみ利用可能です。マージ時にパーツ全体をメモリに読み込む対象となるコンパクトパーツの最大サイズを指定します。

## compatibility_allow_sampling_expression_not_in_primary_key \{#compatibility_allow_sampling_expression_not_in_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

サンプリング式がプライマリキーに含まれていないテーブルを CREATE できるようにします。これは、後方互換性のために、不正な定義のテーブルを持つサーバーを一時的に稼働させる必要がある場合にのみ使用します。

## compress_marks \{#compress_marks\}

<SettingsInfoBlock type="Bool" default_value="1" />

マークは圧縮をサポートすることで、マークファイルのサイズを小さくし、ネットワーク転送を高速化します。

## compress_primary_key \{#compress_primary_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

主キーの圧縮を有効にし、主キーファイルのサイズを小さくしてネットワーク転送を高速化します。

## concurrent_part_removal_threshold \{#concurrent_part_removal_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100" />

非アクティブなデータパーツの数が少なくともこの値以上の場合にのみ、
パーツの並列削除（`max_part_removal_threads` を参照）を有効化します。

## deduplicate_merge_projection_mode \{#deduplicate_merge_projection_mode\}

<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>

クラシック以外の MergeTree、すなわち (Replicated, Shared) MergeTree ではない MergeTree エンジンを持つテーブルに対して projection を作成できるかどうかを制御します。`ignore` オプションは互換性維持のみを目的としており、不正確な結果をもたらす可能性があります。許可されている場合、projection のマージ時の動作（`drop` するか `rebuild` するか）を指定します。クラシックな MergeTree はこの設定を無視します。また `OPTIMIZE DEDUPLICATE` も制御しますが、すべての MergeTree ファミリーに属するエンジンに影響します。オプション `lightweight_mutation_projection_mode` と同様に、これはパーツレベルの設定です。

Possible values:

- `ignore`
- `throw`
- `drop`
- `rebuild`

## default_compression_codec \{#default_compression_codec\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>

テーブル定義で特定のカラムに対して圧縮コーデックが定義されていない場合に使用される、デフォルトの圧縮コーデックを指定します。
カラムに対する圧縮コーデックの選択順序は次のとおりです。

1. テーブル定義内でそのカラムに対して定義された圧縮コーデック
2. `default_compression_codec`（この SETTING）で定義された圧縮コーデック
3. `compression` 設定で定義されたデフォルトの圧縮コーデック  
デフォルト値：空文字列（未設定）。

## detach_not_byte_identical_parts \{#detach_not_byte_identical_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

マージまたはミューテーションの後に、レプリカ上のデータパーツが他のレプリカ上のデータパーツとバイト単位で同一でない場合に、そのデータパーツをデタッチするかどうかを制御します。無効の場合、そのデータパーツは削除されます。このようなパーツを後で分析したい場合に、この設定を有効にします。

この設定は、[データレプリケーション](/engines/table-engines/mergetree-family/replacingmergetree) が有効な `MergeTree` テーブルに適用されます。

取りうる値:

- `0` — パーツは削除されます。
- `1` — パーツはデタッチされます。

## detach_old_local_parts_when_cloning_replica \{#detach_old_local_parts_when_cloning_replica\}

<SettingsInfoBlock type="Bool" default_value="1" />

失われたレプリカを修復する際に、古いローカルパーツを削除しない。

可能な値:

- `true`
- `false`

## disable_detach_partition_for_zero_copy_replication \{#disable_detach_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピー レプリケーションでの DETACH PARTITION クエリを無効にします。

## disable_fetch_partition_for_zero_copy_replication \{#disable_fetch_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピー レプリケーション時の FETCH PARTITION クエリを無効にします。

## disable_freeze_partition_for_zero_copy_replication \{#disable_freeze_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

ゼロコピー レプリケーションでは FREEZE PARTITION クエリを無効にします。

## disk \{#disk\}

ストレージディスクの名前です。storage policy の代わりに指定できます。

## distributed_index_analysis_min_indexes_bytes_to_activate \{#distributed_index_analysis_min_indexes_bytes_to_activate\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1073741824"},{"label": "New setting"}]}]}/>

分散索引解析を有効にするために必要となる、ディスク上（非圧縮）のデータスキッピング索引および主キー索引の最小サイズ

## distributed_index_analysis_min_parts_to_activate \{#distributed_index_analysis_min_parts_to_activate\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "10"},{"label": "New setting"}]}]}/>

分散索引解析が有効化される最小パーツ数

## dynamic_serialization_version \{#dynamic_serialization_version\}

<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Dynamic のシリアライゼーションバージョンを制御するための設定を追加"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "より良いシリアライズ/デシリアライズのため、Dynamic のデフォルトシリアライゼーションバージョンとして v3 を有効化"}]}]}/>

Dynamic データ型のシリアライゼーションバージョンを指定します。互換性を維持するために必要です。

指定可能な値:

- `v1`
- `v2`
- `v3`

## enable_block_number_column \{#enable_block_number_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

各行の `_block_number` カラムの永続化を有効にします。

## enable_block_offset_column \{#enable_block_offset_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

マージ処理時に仮想カラム `_block_number` を永続化します。

## enable_index_granularity_compression \{#enable_index_granularity_compression\}

<SettingsInfoBlock type="Bool" default_value="1" />

可能な場合、索引粒度の値をインメモリで圧縮します

## enable_max_bytes_limit_for_min_age_to_force_merge \{#enable_max_bytes_limit_for_min_age_to_force_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "デフォルトで、min_age_to_force_merge_seconds が有効な場合でもパーツサイズを制限します"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "min_age_to_force_merge 用の最大バイト数を制限する新しい設定を追加。"}]}, {"id": "row-3","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

`min_age_to_force_merge_seconds` と
`min_age_to_force_merge_on_partition_only` の設定が、
`max_bytes_to_merge_at_max_space_in_pool` の設定に従うようにするかどうかを制御します。

設定可能な値:

- `true`
- `false`

## enable_mixed_granularity_parts \{#enable_mixed_granularity_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

`index_granularity_bytes` 設定によってグラニュールサイズを制御する方式への移行を有効または無効にします。バージョン 19.11 以前では、グラニュールサイズを制限するための設定は `index_granularity` のみでした。`index_granularity_bytes` 設定は、大きな行（数十〜数百メガバイト）を持つテーブルからデータを読み出す際の ClickHouse のパフォーマンスを改善します。大きな行を持つテーブルがある場合は、そのテーブルに対してこの設定を有効にすることで、`SELECT` クエリの効率を向上させることができます。

## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge \{#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "ReplacingMergeTree に対して自動クリーンアップマージを許可する新しい設定"}]}]}/>

パーティションを 1 つのパーツにマージする際に、ReplacingMergeTree で CLEANUP マージを使用するかどうかを制御します。`allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` が有効になっている必要があります。

設定可能な値:

- `true`
- `false`

## enable_the_endpoint_id_with_zookeeper_name_prefix \{#enable_the_endpoint_id_with_zookeeper_name_prefix\}

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケーテッド MergeTree テーブル用に、ZooKeeper 名のプレフィックス付き endpoint ID を有効にします。

## enable_vertical_merge_algorithm \{#enable_vertical_merge_algorithm\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Vertical マージアルゴリズムの使用を有効にします。

## enforce_index_structure_match_on_partition_manipulation \{#enforce_index_structure_match_on_partition_manipulation\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

この設定がパーティション操作クエリ（`ATTACH/MOVE/REPLACE PARTITION`）の宛先テーブルに対して有効になっている場合、ソーステーブルと宛先テーブルの索引およびPROJECTIONは同一でなければなりません。そうでない場合、宛先テーブルはソーステーブルの索引およびPROJECTIONの上位集合となっていてもかまいません。

## escape_index_filenames \{#escape_index_filenames\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "索引用に作成されるファイル名で非 ASCII 文字をエスケープする"}]}]}/>

26.1 より前のバージョンでは、副次索引用に作成されるファイル名で特殊文字をエスケープしていなかったため、索引名に含まれる一部の文字によってパーツが破損する可能性がありました。これは互換性のためだけに追加されたものです。非 ASCII 文字を名前に含む索引を持つ古いパーツを読み込む場合を除き、変更すべきではありません。

## escape_variant_subcolumn_filenames \{#escape_variant_subcolumn_filenames\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Wide パーツ内の Variant 型サブカラムに対して作成されるファイル名の特殊文字をエスケープします"}]}]}/>

MergeTree テーブルの Wide パーツ内で、Variant データ型のサブカラムに対して作成されるファイル名の特殊文字をエスケープします。互換性を保つために必要です。

## exclude_deleted_rows_for_part_size_in_merge \{#exclude_deleted_rows_for_part_size_in_merge\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、データパーツの推定される実際のサイズ（つまり、`DELETE FROM` によって削除された行を除いたもの）が、マージ対象のパーツを選択する際に使用されます。なお、この動作は、この設定を有効化した後に実行された `DELETE FROM` の影響を受けたデータパーツに対してのみ有効です。

取り得る値:

- `true`
- `false`

**関連項目**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
設定

## exclude_materialize_skip_indexes_on_merge \{#exclude_materialize_skip_indexes_on_merge\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting."}]}]} />

マージ処理中に構築および保存する対象から除外する skip index を、カンマ区切りのリストで指定します。
[materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge) が false の場合は効果がありません。

除外された skip index であっても、明示的な
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) クエリの実行時、または
[materialize&#95;skip&#95;indexes&#95;on&#95;insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)
セッション設定に応じて INSERT 時に、引き続き構築および保存されます。

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

この設定が 0 より大きい値に設定されている場合、1 つのレプリカのみが直ちにマージを開始し、他のレプリカはローカルでマージを実行する代わりに、その時間まで結果のダウンロードを待機します。選択されたレプリカがその時間内にマージを完了しない場合、通常の挙動にフォールバックします。

取り得る値:

- 任意の正の整数。

## fault_probability_after_part_commit \{#fault_probability_after_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

この設定はテスト目的のものです。変更しないでください。

## fault_probability_before_part_commit \{#fault_probability_before_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

テスト用途のための設定です。変更しないでください。

## finished_mutations_to_keep \{#finished_mutations_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="100" />

完了したミューテーションに関するレコードをいくつ保持するかを指定します。0 の場合は、すべてを保持します。

## force_read_through_cache_for_merges \{#force_read_through_cache_for_merges\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

マージ時の読み取りでファイルシステムキャッシュを必ず経由するようにする

## fsync_after_insert \{#fsync_after_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

挿入されるパーツごとに `fsync` を実行します。挿入操作のパフォーマンスが大きく低下するため、wide パーツとの併用は推奨されません。

## fsync_part_directory \{#fsync_part_directory\}

<SettingsInfoBlock type="Bool" default_value="0" />

すべてのパート操作（書き込み、リネームなど）の後にパートディレクトリに対して fsync を実行します。

## in_memory_parts_enable_wal \{#in_memory_parts_enable_wal\}

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は廃止されており、何の効果もありません。

## in_memory_parts_insert_sync \{#in_memory_parts_insert_sync\}

<SettingsInfoBlock type="Bool" default_value="0" />

廃止された設定で、現在は何の効果もありません。

## inactive_parts_to_delay_insert \{#inactive_parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブル内の1つのパーティションに含まれる非アクティブなパーツの数が
`inactive_parts_to_delay_insert` の値を超えた場合、`INSERT` は人工的に
遅くされます。

:::tip
サーバーが十分な速度でパーツをクリーンアップできない場合に有用です。
:::

設定可能な値:

- 任意の正の整数。

## inactive_parts_to_throw_insert \{#inactive_parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1つのパーティション内の非アクティブなパーツの数が
`inactive_parts_to_throw_insert` の値を超えると、`INSERT` は次のエラーで中断されます:

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts" という例外。

設定可能な値:

- 任意の正の整数。

## index_granularity \{#index_granularity\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

インデックスのマーク間に含まれるデータ行の最大数です。つまり、1 つのプライマリキー値に対応する行数を表します。

## index_granularity_bytes \{#index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

データグラニュールの最大サイズ（バイト単位）です。

グラニュールサイズを行数のみで制限する場合は、`0` を設定します（非推奨）。

## initialization_retry_period \{#initialization_retry_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

テーブルの初期化を再試行する間隔（秒）。

## kill_delay_period \{#kill_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

非推奨の設定であり、現在は何の効果もありません。

## kill_delay_period_random_add \{#kill_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

廃止された設定で、現在は何の効果もありません。

## kill_threads \{#kill_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

この設定は廃止されており、何の効果もありません。

## lightweight_mutation_projection_mode \{#lightweight_mutation_projection_mode\}

<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

デフォルトでは、論理削除 `DELETE` はプロジェクションを持つテーブルでは動作しません。これは、プロジェクション内の行が `DELETE` 操作の影響を受ける可能性があるためです。そのため、デフォルト値は `throw` です。ただし、このオプションで挙動を変更できます。値を `drop` または `rebuild` に設定すると、プロジェクション付きテーブルでも削除が利用可能になります。`drop` はプロジェクション自体を削除するため、現在のクエリではプロジェクションが削除される分、高速になる可能性がありますが、その後はプロジェクションが存在しないため将来のクエリが遅くなる可能性があります。`rebuild` はプロジェクションを再構築するため、現在のクエリのパフォーマンスには影響するかもしれませんが、将来のクエリは高速化される可能性があります。これらのオプションはパーツレベルでのみ動作する点が利点であり、影響を受けないパーツ内のプロジェクションは、そのまま保持され、drop や rebuild のようなアクションはトリガーされません。

Possible values:

- `throw`
- `drop`
- `rebuild`

## load_existing_rows_count_for_old_parts \{#load_existing_rows_count_for_old_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

[exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) と併せて有効にした場合、
既存のデータパーツに対する削除済み行数はテーブルの起動時に計算されます。
テーブルの読み込み開始が遅くなる可能性がある点に注意してください。

取り得る値:

- `true`
- `false`

**参照**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 設定

## lock_acquire_timeout_for_background_operations \{#lock_acquire_timeout_for_background_operations\}

<SettingsInfoBlock type="Seconds" default_value="120" />

マージやミューテーションなどのバックグラウンド処理で、テーブルロックの取得をタイムアウトと見なすまでの秒数。

## marks_compress_block_size \{#marks_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

マーク圧縮ブロックのサイズ。圧縮対象となる実際のブロックサイズです。

## marks_compression_codec \{#marks_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

マークに使用される圧縮コーデックです。マークは十分に小さく、キャッシュされるため、
デフォルトの圧縮方式は ZSTD(3) です。

## materialize_skip_indexes_on_merge \{#materialize_skip_indexes_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>

有効にすると、マージ時に新しいパーツに対してスキップ索引を構築して保存します。
無効な場合は、明示的に [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
または [INSERT 実行時](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)に作成・保存できます。

より細かく制御するには [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) も参照してください。

## materialize_statistics_on_merge \{#materialize_statistics_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "New setting"}]}]}/>

有効にすると、マージ処理の際に新しいパーツに対して STATISTICS を構築して保存します。
無効な場合は、明示的な [MATERIALIZE STATISTICS](/sql-reference/statements/alter/statistics.md)
または [INSERT 時](/operations/settings/settings.md#materialize_statistics_on_insert) に作成・保存できます。

## materialize_ttl_recalculate_only \{#materialize_ttl_recalculate_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

MATERIALIZE TTL 実行時にのみ TTL 情報を再計算します

## max_avg_part_size_for_too_many_parts \{#max_avg_part_size_for_too_many_parts\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

'parts_to_delay_insert' と 'parts_to_throw_insert' による「パーツが多すぎる」チェックは、（該当するパーティション内の）平均パーツサイズが指定されたしきい値以下の場合にのみ有効になります。平均パーツサイズがこのしきい値より大きい場合、INSERT 文は遅延も拒否もされません。これは、パーツが適切に大きなパーツへマージされている限り、単一サーバー上の単一テーブルに数百テラバイトのデータを保持できることを意味します。これは非アクティブなパーツやパーツ総数に対するしきい値には影響しません。

## max_bytes_to_merge_at_max_space_in_pool \{#max_bytes_to_merge_at_max_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="161061273600" />

利用可能なリソースが十分にある場合に、1つのパートにマージされるパーツ群の合計サイズ（バイト単位）の最大値です。自動バックグラウンドマージによって作成されうるパートサイズの上限値におおよそ対応します。（0 はマージが無効になることを意味します）

取り得る値：

- 0 以上の整数。

マージスケジューラは定期的にパーティション内のパーツのサイズと数を分析し、プール内に十分な空きリソースがある場合はバックグラウンドマージを開始します。マージは、ソースパーツの合計サイズが `max_bytes_to_merge_at_max_space_in_pool` を上回るまで行われます。

[OPTIMIZE FINAL](/sql-reference/statements/optimize) によって開始されるマージは
`max_bytes_to_merge_at_max_space_in_pool` を無視します（空きディスク容量のみが考慮されます）。

## max_bytes_to_merge_at_min_space_in_pool \{#max_bytes_to_merge_at_min_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

バックグラウンドプールで利用可能なリソースが最小限のときに、1 つのパーツにマージされるパーツの合計サイズ（バイト単位）の最大値。

取り得る値:

- 任意の正の整数。

`max_bytes_to_merge_at_min_space_in_pool` は、（プール内の）ディスク空き容量が不足していてもマージできるパーツの合計サイズの上限を定義します。
これは、小さなパーツの数と `Too many parts` エラーの発生確率を減らすために必要です。
マージ処理は、マージ対象パーツの合計サイズの 2 倍のディスク領域を予約します。
そのため、空きディスク容量が少ない場合、空き領域自体は存在していても、その領域が進行中の大きなマージによってすでに予約されており、他のマージが開始できず、挿入のたびに小さなパーツの数が増加してしまう状況が起こり得ます。

## max_cleanup_delay_period \{#max_cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="300" />

古いキューのログ、ブロックハッシュ、およびパーツをクリーンアップするための最大期間。

## max_compress_block_size \{#max_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルに書き込む際に圧縮される前の、非圧縮データブロックの最大サイズです。グローバル設定でもこの設定を指定できます
（[max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)
設定を参照）。テーブル作成時に指定した値は、この設定に対するグローバル値を上書きします。

## max_concurrent_queries \{#max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

MergeTree テーブルに関連して同時に実行されるクエリの最大数。
クエリは、他の `max_concurrent_queries` 設定によっても引き続き制限されます。

設定可能な値:

* 正の整数。
* `0` — 無制限。

デフォルト値: `0`（無制限）。

**例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```


## max_delay_to_insert \{#max_delay_to_insert\}

<SettingsInfoBlock type="UInt64" default_value="1" />

秒単位の値であり、1 つのパーティション内のアクティブなパーツ数が
[parts&#95;to&#95;delay&#95;insert](#parts_to_delay_insert) の値を超えた場合に
`INSERT` の遅延を計算するために使用されます。

設定可能な値:

* 任意の正の整数。

`INSERT` の遅延（ミリ秒）は、次の式で計算されます。

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

例えば、あるパーティションにアクティブなパーツが 299 個あり、parts&#95;to&#95;throw&#95;insert
= 300、parts&#95;to&#95;delay&#95;insert = 150、max&#95;delay&#95;to&#95;insert = 1 の場合、`INSERT` は
`pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
ミリ秒遅延されます。

バージョン 23.1 以降では、式が次のように変更されています。

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

例えば、あるパーティションにアクティブなパーツが 224 個あり、parts&#95;to&#95;throw&#95;insert = 300、parts&#95;to&#95;delay&#95;insert = 150、max&#95;delay&#95;to&#95;insert = 1、min&#95;delay&#95;to&#95;insert&#95;ms = 10 の場合、`INSERT` は `max( 10, 1 * 1000 * (224 - 150 + 1) / (300 - 150) ) = 500` ミリ秒だけ遅延します。


## max_delay_to_mutate_ms \{#max_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

未完了の mutation 操作が多数存在する場合に、MergeTree テーブルの mutation が遅延しうる最大時間（ミリ秒単位）

## max_digestion_size_per_segment \{#max_digestion_size_per_segment\}

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "廃止された設定"}]}]}/>

廃止された設定であり、現在は何の効果もありません。

## max_file_name_length \{#max_file_name_length\}

<SettingsInfoBlock type="UInt64" default_value="127" />

ファイル名をハッシュ化せず、そのまま保持できる最大の長さ。
設定 `replace_long_file_name_to_hash` が有効な場合にのみ有効になります。
この設定値にはファイル拡張子の長さは含まれません。そのため、
ファイルシステムエラーを避けるために、最大ファイル名長（通常は 255 バイト）
よりもいくらか小さい値に設定することを推奨します。

## max_files_to_modify_in_alter_columns \{#max_files_to_modify_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="75" />

変更（削除、追加）の対象となるファイル数がこの設定値を超える場合、ALTER は適用されません。

設定可能な値:

- 任意の正の整数

デフォルト値: 75

## max_files_to_remove_in_alter_columns \{#max_files_to_remove_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="50" />

削除対象のファイル数がこの設定値を超える場合、ALTER クエリは実行されません。

取り得る値:

- 任意の正の整数。

## max_merge_delayed_streams_for_parallel_write \{#max_merge_delayed_streams_for_parallel_write\}

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>

並列でフラッシュできるストリーム（カラム）の最大数です。
マージに対する max_insert_delayed_streams_for_parallel_write の類似設定で、Vertical マージ時にのみ有効です。

## max_merge_selecting_sleep_ms \{#max_merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

パーツのマージ対象が1つも選択されなかった後、再度マージ対象のパーツを選択しようとするまで待機する最大時間です。値を小さくすると、`background_schedule_pool` でのタスク選択が頻繁に行われるようになり、大規模クラスターでは ZooKeeper へのリクエストが大量に発生します。

## max_number_of_merges_with_ttl_in_pool \{#max_number_of_merges_with_ttl_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="2" />

プール内で有効期限 (TTL) を伴うマージの数が指定された数を超えた場合、新たな有効期限 (TTL) 付きマージを実行しません。これは通常のマージ用のスレッドを確保し、「Too many parts」を回避するためです。

## max_number_of_mutations_for_replica \{#max_number_of_mutations_for_replica\}

<SettingsInfoBlock type="UInt64" default_value="0" />

各レプリカごとのパート mutation の数を、指定した値までに制限します。
0 の場合は、レプリカごとの mutation 数に制限はありません（ただし、実行は他の SETTING によって制約される可能性があります）。

## max_part_loading_threads \{#max_part_loading_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

この設定は廃止されており、効果はありません。

## max_part_removal_threads \{#max_part_removal_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

廃止済みの設定であり、現在は何の効果もありません。

## max_partitions_to_read \{#max_partitions_to_read\}

<SettingsInfoBlock type="Int64" default_value="-1" />

1つのクエリでアクセスできるパーティション数の上限を制限します。

テーブル作成時に指定したこの設定値は、
クエリレベルの設定によって上書きできます。

設定可能な値:

- 任意の正の整数。

クエリ / セッション / プロファイルレベルで、クエリの複雑さを制御する設定 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read) を指定することもできます。

## max_parts_in_total \{#max_parts_in_total\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

テーブルのすべてのパーティションにおけるアクティブなパーツの総数が
`max_parts_in_total` の値を超えた場合、`INSERT` は `Too many parts
(N)` という例外で中断されます。

設定可能な値は次のとおりです:

- 任意の正の整数。

テーブル内のパーツ数が多いと、ClickHouse クエリのパフォーマンスが低下し、
ClickHouse の起動時間が長くなります。多くの場合、これは誤った設計
（パーティション戦略の選択ミス、特にパーティションが小さすぎる場合）
が原因です。

## max_parts_to_merge_at_once \{#max_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="100" />

一度にマージできるパーツの最大数（0 で無効）。OPTIMIZE FINAL クエリには影響しません。

## max_postpone_time_for_failed_mutations_ms \{#max_postpone_time_for_failed_mutations_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

失敗したミューテーションを延期する最大時間。

## max_postpone_time_for_failed_replicated_fetches_ms \{#max_postpone_time_for_failed_replicated_fetches_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "レプリケーションキュー内のフェッチタスクを延期できる新しい設定を追加。"}]}]}/>

失敗したレプリケートフェッチを延期できる最大時間。

## max_postpone_time_for_failed_replicated_merges_ms \{#max_postpone_time_for_failed_replicated_merges_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "レプリケーションキュー内でマージタスクを延期できるようにする新しい設定を追加。"}]}]}/>

失敗したレプリケートマージの延期可能な最大時間。

## max_postpone_time_for_failed_replicated_tasks_ms \{#max_postpone_time_for_failed_replicated_tasks_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "レプリケーションキュー内のタスクを延期できるようにする新しい設定を追加しました。"}]}]}/>

失敗したレプリケーションタスクに対する最大延期時間です。タスクがフェッチ、マージ、またはミューテーションでない場合にこの値が使用されます。

## max_projections \{#max_projections\}

<SettingsInfoBlock type="UInt64" default_value="25" />

MergeTree テーブルのプロジェクションの最大数。

## max_replicated_fetches_network_bandwidth \{#max_replicated_fetches_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク上でのデータ交換速度の上限を、[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)
による fetch の場合について、1 秒あたりのバイト数で制限します。この設定は特定のテーブルに対して適用されます。
一方で、[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)
設定はサーバー全体に適用されます。

サーバーのネットワーク帯域と特定テーブルのネットワーク帯域の両方を制限できますが、
その場合、テーブルレベルの設定値はサーバーレベルの設定値より小さくする必要があります。
そうでない場合、サーバーは
`max_replicated_fetches_network_bandwidth_for_server` 設定のみを考慮します。

この設定は厳密に制御されるわけではありません。

設定可能な値:

- 正の整数。
- `0` — 無制限。

デフォルト値: `0`。

**使用方法**

新しいノードを追加または置き換える際に、データをレプリケートする速度を制限するために使用できます。

## max_replicated_logs_to_keep \{#max_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

非アクティブなレプリカが存在する場合に、ClickHouse Keeper のログ内に保持され得るレコード数の上限。この数を超えると、その非アクティブなレプリカは失われたものとして扱われます。

取りうる値:

- 任意の正の整数。

## max_replicated_merges_in_queue \{#max_replicated_merges_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

ReplicatedMergeTree のキューで、パーツのマージおよびミューテーションのタスクを同時に許可する最大数。

## max_replicated_merges_with_ttl_in_queue \{#max_replicated_merges_with_ttl_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1" />

ReplicatedMergeTree のキューで、有効期限 (TTL) を伴うパーツのマージタスクを同時にいくつまで実行できるかを指定します。

## max_replicated_mutations_in_queue \{#max_replicated_mutations_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="8" />

ReplicatedMergeTree のキュー内で同時に許可される、パーツを変更するタスク数。

## max_replicated_sends_network_bandwidth \{#max_replicated_sends_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

[replicated](/engines/table-engines/mergetree-family/replacingmergetree)
送信におけるネットワーク越しのデータ交換の最大速度を、1 秒あたりのバイト数で制限します。この設定は特定のテーブルに適用されます。一方で
[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth)
設定はサーバー全体に適用されます。

サーバーレベルのネットワークと特定テーブルのネットワークの両方を制限できますが、その場合はテーブルレベルの設定値がサーバーレベルの値よりも小さくなければなりません。そうでない場合、サーバーは
`max_replicated_sends_network_bandwidth_for_server` 設定のみを考慮します。

この設定は厳密に守られるとは限りません。

可能な値:

- 正の整数。
- `0` — 無制限。

**使用例**

新しいノードを追加または置き換えるためにデータをレプリケーションする際に、スループットを制限（スロットル）する目的で使用できます。

## max_suspicious_broken_parts \{#max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="100" />

1つのパーティション内の破損したパーツの数が
`max_suspicious_broken_parts` の値を超える場合、自動削除は行われません。

設定可能な値:

- 任意の正の整数。

## max_suspicious_broken_parts_bytes \{#max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

破損したすべてのパーツの合計サイズの上限値。これを超える場合は、自動削除は行われません。

設定可能な値:

- 任意の正の整数

## max_uncompressed_bytes_in_patches \{#max_uncompressed_bytes_in_patches\}

<SettingsInfoBlock type="UInt64" default_value="32212254720" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "New setting"}]}]}/>

すべてのパッチパーツに含まれるデータの非圧縮サイズの最大値（バイト単位）。
すべてのパッチパーツに含まれるデータサイズがこの値を超える場合、論理更新は拒否されます。
0 - 無制限。

## merge_max_block_size \{#merge_max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

マージされたパーツからメモリに読み込まれる行数。

設定可能な値:

- 任意の正の整数。

マージ処理では、パーツから `merge_max_block_size` 行単位のブロックで行を読み込み、
それらをマージして結果を新しいパーツに書き込みます。読み込まれたブロックは RAM 上に保持されるため、
`merge_max_block_size` はマージに必要な RAM 量に影響します。
したがって、非常に幅の広い行を持つテーブルでは、マージによって大量の RAM が消費される可能性があります
（平均行サイズが 100kb で、10 個のパーツをマージする場合、
(100kb * 10 * 8192) = 約 8GB の RAM が必要になります）。`merge_max_block_size` を小さくすることで、
マージに必要な RAM 量を減らすことはできますが、マージ処理は遅くなります。

## merge_max_block_size_bytes \{#merge_max_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

マージ処理時に生成されるブロックのサイズ（バイト数）。デフォルトでは
`index_granularity_bytes` と同じ値になります。

## merge_max_bytes_to_prewarm_cache \{#merge_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud でのみ利用可能です。マージ処理中にキャッシュをプリウォームする際の、パーツ（compact または packed）の最大サイズ。

## merge_max_dynamic_subcolumns_in_compact_part \{#merge_max_dynamic_subcolumns_in_compact_part\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "auto"},{"label": "マージ後の Compact パートにおいて、データ型で指定されたパラメータに関係なく動的サブカラムの数を制限する新しい設定を追加"}]}]}/>

マージ後の Compact データパートにおいて、各カラムで作成可能な動的サブカラム数の最大値。
この設定により、データ型で指定された動的パラメータに関係なく、Compact パート内の動的サブカラム数を制御できます。

たとえば、テーブルに JSON(max_dynamic_paths=1024) 型のカラムがあり、`merge_max_dynamic_subcolumns_in_compact_part` 設定が 128 に設定されている場合、
Compact データパートへのマージ後、このパート内の動的パス数は 128 に削減され、動的サブカラムとして書き込まれるのは 128 個のパスのみになります。

## merge_max_dynamic_subcolumns_in_wide_part \{#merge_max_dynamic_subcolumns_in_wide_part\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "マージ後の Wide データパーツにおいて、データ型で指定されたパラメータに関わらず、動的サブカラム数を制限するための新しい設定を追加"}]}]}/>

マージ後の Wide データパーツにおいて、各カラムで作成できる動的サブカラムの最大数です。
これにより、データ型で指定された動的パラメータに関わらず、Wide データパーツで作成されるファイル数を削減できます。

たとえば、テーブルに JSON(max_dynamic_paths=1024) 型のカラムがあり、設定 merge_max_dynamic_subcolumns_in_wide_part が 128 に設定されている場合、
Wide データパーツへのマージ後、このパーツ内での動的パスの数は 128 に抑えられ、動的サブカラムとして書き込まれるパスも 128 個のみになります。

## merge_selecting_sleep_ms \{#merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

パーツが選択されなかった後、再度マージ対象のパーツを選択しようとするまでに待機する最小時間です。値を小さくすると、background_schedule_pool での選択処理が頻繁に実行され、大規模なクラスター環境では ZooKeeper へのリクエストが大量に発生します。

## merge_selecting_sleep_slowdown_factor \{#merge_selecting_sleep_slowdown_factor\}

<SettingsInfoBlock type="Float" default_value="1.2" />

マージ対象がない場合にはマージ選択タスクのスリープ時間にこの係数が乗じられ、マージが割り当てられたときにはこの係数で割られます。

## merge_selector_algorithm \{#merge_selector_algorithm\}

<ExperimentalBadge/>

<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

マージに割り当てるパーツを選択するアルゴリズム

## merge_selector_base \{#merge_selector_base\}

<SettingsInfoBlock type="Float" default_value="5" />

割り当てられたマージ処理の書き込み増幅に影響します（上級者向けの設定であり、動作を理解していない場合は変更しないでください）。Simple および StochasticSimple のマージセレクタで有効です

## merge_selector_blurry_base_scale_factor \{#merge_selector_blurry_base_scale_factor\}

<SettingsInfoBlock type="UInt64" default_value="0" />

パーティション内のパーツ数に対して、このロジックがいつ発動するかを制御します。係数が大きいほど、ロジックの発動はより遅くなります。

## merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once \{#merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

単純なマージセレクタ向けのヒューリスティックを有効にし、マージの選択における最大上限値を引き下げます。
これにより同時に実行されるマージの数が増加し、`TOO_MANY_PARTS`
エラーの軽減に役立ちますが、その一方で書き込み増幅が増大します。

## merge_selector_enable_heuristic_to_remove_small_parts_at_right \{#merge_selector_enable_heuristic_to_remove_small_parts_at_right\}

<SettingsInfoBlock type="Bool" default_value="1" />

マージ対象のパーツを選択する際に、範囲の右側にあるパーツについて、そのサイズが合計サイズ sum_size に対する指定比率 (0.01) 未満である場合に、そのパーツを削除するヒューリスティックを有効にします。
Simple および StochasticSimple のマージセレクタで機能します。

## merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent \{#merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "5"},{"label": "New setting"}]}]}/>

減少カーブを表す数式を構成する際に使用される指数の値を制御します。指数を小さくすると、マージ幅が狭くなり、その結果、書き込み増幅が増加します。逆もまた成り立ちます。

## merge_selector_window_size \{#merge_selector_window_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

一度に対象とするパーツの数。

## merge_total_max_bytes_to_prewarm_cache \{#merge_total_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="16106127360" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud でのみ利用可能です。マージ処理中にキャッシュを事前にウォームアップする際に対象とするパーツの合計最大サイズ。

## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds \{#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds\}

<SettingsInfoBlock type="UInt64" default_value="2592000" />

廃止された設定であり、現在は何も行いません。

## merge_tree_clear_old_parts_interval_seconds \{#merge_tree_clear_old_parts_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="1" />

ClickHouse が古いパーツ、WAL、およびミューテーションをクリーンアップする処理を実行する間隔（秒）を設定します。

取りうる値:

- 任意の正の整数。

## merge_tree_clear_old_temporary_directories_interval_seconds \{#merge_tree_clear_old_temporary_directories_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="60" />

ClickHouse が古い一時ディレクトリをクリーンアップする間隔（秒単位）を設定します。

取りうる値:

- 任意の正の整数。

## merge_tree_enable_clear_old_broken_detached \{#merge_tree_enable_clear_old_broken_detached\}

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定であり、何の効果もありません。

## merge_with_recompression_ttl_timeout \{#merge_with_recompression_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

再圧縮の有効期限 (TTL) を伴うマージを再実行するまでの最小待ち時間（秒）。

## merge_with_ttl_timeout \{#merge_with_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

削除の有効期限 (TTL) が設定されたマージを再度実行するまでの最小待ち時間（秒単位）。

## merge_workload \{#merge_workload\}

マージ処理とその他のワークロード間で、リソースの使用および共有方法を制御するために使用します。指定された値は、このテーブルのバックグラウンドで実行されるマージ処理に対する `workload` 設定値として使用されます。指定されていない場合（空文字列のとき）は、代わりにサーバー設定の `merge_workload` が使用されます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## min_absolute_delay_to_close \{#min_absolute_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="0" />

クローズ処理を行ってリクエストの処理を停止し、ステータスチェック中に Ok を返さなくなるまでの最小絶対遅延時間。

## min_age_to_force_merge_on_partition_only \{#min_age_to_force_merge_on_partition_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

`min_age_to_force_merge_seconds` を、パーティション内の一部ではなくパーティション全体に対してのみ適用するかどうか。

既定では、`max_bytes_to_merge_at_max_space_in_pool` の設定を無視します（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）。

取りうる値:

- true, false

## min_age_to_force_merge_seconds \{#min_age_to_force_merge_seconds\}

<SettingsInfoBlock type="UInt64" default_value="0" />

範囲内のすべてのパーツが `min_age_to_force_merge_seconds` の値よりも古い場合に、パーツをマージします。

デフォルトでは、設定 `max_bytes_to_merge_at_max_space_in_pool`
（`enable_max_bytes_limit_for_min_age_to_force_merge` を参照）を無視します。

設定可能な値:

- 正の整数。

## min_bytes_for_compact_part \{#min_bytes_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定で、現在は何の効果もありません。

## min_bytes_for_full_part_storage \{#min_bytes_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud でのみ利用可能です。データパートに対して packed 形式ではなく
full 形式のストレージを使用するための、非圧縮サイズの最小バイト数です。

## min_bytes_for_wide_part \{#min_bytes_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

`Wide` 形式で保存できるデータパーツ内の最小バイト数／行数を指定します。これらの設定は、一方のみ、両方とも、あるいはどちらも設定しないことが可能です。

## min_bytes_to_prewarm_caches \{#min_bytes_to_prewarm_caches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

新しいパーツに対してマークキャッシュおよびプライマリ索引キャッシュをプリウォームするための最小サイズ（未圧縮バイト数）

## min_bytes_to_rebalance_partition_over_jbod \{#min_bytes_to_rebalance_partition_over_jbod\}

<SettingsInfoBlock type="UInt64" default_value="0" />

新しい大きなパーツをボリュームディスク [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 上に分散配置する際に、バランシングを有効にするための最小バイト数を設定します。

Possible values:

- 正の整数。
- `0` — バランシングは無効になります。

**Usage**

`min_bytes_to_rebalance_partition_over_jbod` 設定の値は、
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024 の値より小さくしてはいけません。そうでない場合、ClickHouse は例外をスローします。

## min_columns_to_activate_adaptive_write_buffer \{#min_columns_to_activate_adaptive_write_buffer\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "500"},{"label": "New setting"}]}]}/>

多数のカラムを持つテーブルに対して、アダプティブ書き込みバッファを使用することでメモリ使用量を削減できるようにします。

設定可能な値:

- 0 - 無制限
- 1 - 常に有効

## min_compress_block_size \{#min_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

次のマークを書き込む際にデータを圧縮するために必要となる、非圧縮データブロックの最小サイズです。この設定はグローバルな設定
（[min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)
設定を参照）でも指定できます。テーブル作成時に指定した値は、この設定に対するグローバル設定値を上書きします。

## min_compressed_bytes_to_fsync_after_fetch \{#min_compressed_bytes_to_fsync_after_fetch\}

<SettingsInfoBlock type="UInt64" default_value="0" />

フェッチ後のパーツに対して `fsync` を実行するための最小圧縮バイト数（0 の場合は無効化）

## min_compressed_bytes_to_fsync_after_merge \{#min_compressed_bytes_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

マージ後のパーツに対して `fsync` を実行するための圧縮済みバイト数の最小値（0 の場合は無効）

## min_delay_to_insert_ms \{#min_delay_to_insert_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

同一のパーティション内にマージされていないパーツが多数存在する場合に、MergeTree テーブルへのデータ挿入時に適用される最小遅延（ミリ秒）。

## min_delay_to_mutate_ms \{#min_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

未完了の mutation が多数存在する場合に、MergeTree テーブルに対する mutation を行う際の最小遅延（ミリ秒単位）。

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

データを挿入するために、ディスクの空き容量として確保しておくべき最小バイト数です。利用可能な空きバイト数が
`min_free_disk_bytes_to_perform_insert` より小さい場合、例外がスローされ、
挿入は実行されません。この設定については次の点に注意してください。

- `keep_free_space_bytes` 設定を考慮します。
- `INSERT` 操作によって書き込まれるデータ量は考慮しません。
- 正の（ゼロ以外の）バイト数が指定されている場合にのみチェックされます。

設定可能な値:

- 任意の正の整数。

:::note
`min_free_disk_bytes_to_perform_insert` と
`min_free_disk_ratio_to_perform_insert` の両方が指定されている場合、
ClickHouse は、より多くの空きディスク容量で挿入を実行できる値を採用します。
:::

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\}

<SettingsInfoBlock type="Float" default_value="0" />

`INSERT` を実行するために必要な、空きディスク容量とディスク総容量の最小比率です。0 から 1 の間の浮動小数点値でなければなりません。この設定については、次の点に注意してください。

- `keep_free_space_bytes` 設定を考慮します。
- `INSERT` 操作によって書き込まれるデータ量は考慮しません。
- 正の（ゼロ以外の）比率が指定されている場合にのみチェックされます。

取り得る値:

- Float, 0.0 - 1.0

`min_free_disk_ratio_to_perform_insert` と
`min_free_disk_bytes_to_perform_insert` の両方が指定されている場合、ClickHouse は、より多くの空きディスク容量で `INSERT` を実行できる方の値を優先して使用します。

## min_index_granularity_bytes \{#min_index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

データグラニュールの最小許容サイズ（バイト単位）。

`index_granularity_bytes` が過度に小さいテーブルを誤って作成してしまうことを防ぐための保護機構です。

## min_level_for_full_part_storage \{#min_level_for_full_part_storage\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ利用可能です。データパートに対して packed 型ではなく full 型のストレージ形式を使用する際の最小パートレベルです。

## min_level_for_wide_part \{#min_level_for_wide_part\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

`Compact` 形式ではなく `Wide` 形式でデータパートを作成するための最小レベル。

## min_marks_to_honor_max_concurrent_queries \{#min_marks_to_honor_max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリが読み取るマーク数の最小値。この値以上の場合に、[max&#95;concurrent&#95;queries](#max_concurrent_queries) 設定が適用されます。

:::note
クエリは、他の `max_concurrent_queries` 設定によっても引き続き制限されます。
:::

取り得る値:

* 正の整数。
* `0` — 無効（`max_concurrent_queries` の制限はどのクエリにも適用されない）。

**使用例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```


## min_merge_bytes_to_use_direct_io \{#min_merge_bytes_to_use_direct_io\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

ストレージディスクに対して direct I/O アクセスを使用する際に必要となる、マージ処理における最小データ量です。パーツをマージする際、ClickHouse はマージ対象となるすべてのデータの合計ストレージ容量を計算します。この容量が `min_merge_bytes_to_use_direct_io` バイトを超える場合、ClickHouse は direct I/O インターフェイス（`O_DIRECT` オプション）を使用してストレージディスクにデータの読み書きを行います。`min_merge_bytes_to_use_direct_io = 0` の場合、direct I/O は無効化されます。

## min_parts_to_merge_at_once \{#min_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="0" />

マージセレクタが一度にマージ対象として選択できるデータパーツ数の最小値
（上級者向けの設定です。動作を理解していない場合は変更しないでください）。
0 の場合は無効。
Simple および StochasticSimple のマージセレクタで有効です。

## min_relative_delay_to_close \{#min_relative_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="300" />

他のレプリカとの差分がこの値以上になった場合に、このレプリカが接続をクローズし、リクエスト処理を停止して、ステータスチェック時に Ok を返さなくなるための最小遅延量。

## min_relative_delay_to_measure \{#min_relative_delay_to_measure\}

<SettingsInfoBlock type="UInt64" default_value="120" />

絶対ディレイがこの値以上の場合にのみ、レプリカの相対遅延を計算します。

## min_relative_delay_to_yield_leadership \{#min_relative_delay_to_yield_leadership\}

<SettingsInfoBlock type="UInt64" default_value="120" />

この設定は廃止されており、何の効果もありません。

## min_replicated_logs_to_keep \{#min_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="10" />

ZooKeeper ログ内の最新レコードを、この数程度保持します。レコードが古くなっていても保持されます。  
これはテーブルの動作には影響せず、削除前の ZooKeeper ログを診断するためにのみ使用されます。

取りうる値:

- 任意の正の整数。

## min_rows_for_compact_part \{#min_rows_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定で、現在は何の効果もありません。

## min_rows_for_full_part_storage \{#min_rows_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud でのみ利用可能です。データパーツに対してパック形式ではなくフルタイプのストレージを使用するために必要な最小行数です。

## min_rows_for_wide_part \{#min_rows_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`Compact` 形式ではなく `Wide` 形式でデータパーツを作成する際の最小行数。

## min_rows_to_fsync_after_merge \{#min_rows_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

マージ後のパーツに対して `fsync` を実行する際の最小行数（0 の場合は無効）

## mutation_workload \{#mutation_workload\}

ミューテーションとその他のワークロード間で、リソースの利用および共有を制御するために使用します。指定した値は、このテーブルのバックグラウンドミューテーションに対する `workload` 設定値として使用されます。指定されていない場合（空文字列の場合）は、代わりにサーバー設定 `mutation_workload` が使用されます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## non_replicated_deduplication_window \{#non_replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="0" />

非レプリケートの
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルに挿入された
直近のブロックのうち、重複チェック用のハッシュ値を保持するブロック数を指定します。

設定可能な値:

- 任意の正の整数。
- `0`（重複排除を無効化）。

レプリケートテーブルと同様の重複排除メカニズムが使用されます（
[replicated_deduplication_window](#replicated_deduplication_window) 設定を参照）。
作成されたパーツのハッシュ値は、ディスク上のローカルファイルに書き込まれます。

## notify_newest_block_number \{#notify_newest_block_number\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

最新のブロック番号を SharedJoin または SharedSet に通知します。ClickHouse Cloud でのみ利用可能です。

## nullable_serialization_version \{#nullable_serialization_version\}

<SettingsInfoBlock type="MergeTreeNullableSerializationVersion" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "basic"},{"label": "新しい設定"}]}]}/>

`Nullable(T)` カラムで使用されるシリアライズ方式を制御します。

設定可能な値:

- basic — `Nullable(T)` に対して標準的なシリアライズ方式を使用します。

- allow_sparse — `Nullable(T)` でスパースエンコーディングの使用を許可します。

## number_of_free_entries_in_pool_to_execute_mutation \{#number_of_free_entries_in_pool_to_execute_mutation\}

<SettingsInfoBlock type="UInt64" default_value="20" />

プール内の空きエントリ数が指定した数より少ない場合は、パーツのmutationを実行しません。これは、通常のマージ処理用にスレッドを確保しておき、「Too many parts」エラーを回避するためです。

取り得る値:

- 任意の正の整数。

**使用方法**

`number_of_free_entries_in_pool_to_execute_mutation` 設定の値は、
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) の値と

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) の値の積より小さくする必要があります。そうでない場合、ClickHouse は例外をスローします。

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition \{#number_of_free_entries_in_pool_to_execute_optimize_entire_partition\}

<SettingsInfoBlock type="UInt64" default_value="25" />

プール内の空きエントリ数が指定値より少ない場合、バックグラウンドでの
パーティション全体の最適化は実行されません（このタスクは
`min_age_to_force_merge_seconds` を設定し、
`min_age_to_force_merge_on_partition_only` を有効化したときに生成されます）。
これは通常のマージ処理のためのスレッドを確保し、「Too many parts」を
回避するためです。

可能な値:

- 正の整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`
設定の値は、
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio)
の値より小さくする必要があります。そうでない場合、ClickHouse は例外を送出します。

## number_of_free_entries_in_pool_to_lower_max_size_of_merge \{#number_of_free_entries_in_pool_to_lower_max_size_of_merge\}

<SettingsInfoBlock type="UInt64" default_value="8" />

プール（またはレプリケートキュー）内の空きエントリ数が指定された数より少なくなった場合、処理するマージ（またはキューに追加するマージ）の最大サイズを縮小し始めます。
これは、小さなマージが処理されるようにして、長時間実行されるマージでプールが埋まってしまうのを防ぐためです。

取りうる値:

- 任意の正の整数。

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\}

<SettingsInfoBlock type="UInt64" default_value="500" />

テーブルに未完了のミューテーションが少なくともこの数だけ存在する場合、そのテーブルに対するミューテーション処理を意図的に遅延させます。
0 に設定すると無効になります。

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

テーブルに未完了のmutationがこの数以上ある場合、'Too many mutations' 例外をスローします。この値を 0 に設定すると無効になります。

## number_of_partitions_to_consider_for_merge \{#number_of_partitions_to_consider_for_merge\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud でのみ利用可能です。マージ対象として考慮するパーティションのうち、上位 N 個までを対象とします。パーティションは、そのパーティション内でマージ可能なデータパーツの量を重みとして、重みに基づくランダムな方法で選択されます。

## object_serialization_version \{#object_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "JSON シリアル化バージョンを制御する設定を追加"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "高度な共有データのシリアル化を利用するため、デフォルトで JSON に対してシリアル化バージョン v3 を有効化"}]}]}/>

JSON データ型のシリアル化バージョン。互換性維持のために必要です。

指定可能な値:

- `v1`
- `v2`
- `v3`

共有データのシリアル化バージョンの変更をサポートするのは、`v3` のみです。

## object_shared_data_buckets_for_compact_part \{#object_shared_data_buckets_for_compact_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Compact パーツにおける JSON シリアライゼーションの共有データ用バケット数を制御するための設定を追加"}]}]}/>

Compact パーツにおける共有データの JSON シリアライゼーションで使用するバケット数を指定します。`map_with_buckets` および `advanced` 共有データシリアライゼーションで機能します。

## object_shared_data_buckets_for_wide_part \{#object_shared_data_buckets_for_wide_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "Wide パーツにおける JSON 共有データシリアル化用のバケット数を制御する設定を追加"}]}]}/>

Wide パーツにおける JSON 共有データシリアル化用のバケット数です。`map_with_buckets` および `advanced` 方式の共有データシリアル化で使用されます。

## object_shared_data_serialization_version \{#object_shared_data_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="advanced" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "advanced"},{"label": "Enable advanced shared data serialization version by default"}]}]}/>

JSON データ型内の共有データに対するシリアル化バージョン。

指定可能な値:

- `map` - 共有データを `Map(String, String)` として保存します。
- `map_with_buckets` - 共有データを複数の個別の `Map(String, String)` カラムとして保存します。バケットを使用することで、共有データから個々のパスを読み取る処理が高速になります。
- `advanced` - 共有データから個々のパスを読み取る処理を大幅に高速化することを目的とした、共有データの特殊なシリアル化方式です。  
このシリアル化方式では、多くの追加情報を保存するため、ディスク上での共有データのストレージサイズが増加する点に注意してください。

`map_with_buckets` および `advanced` のシリアル化におけるバケット数は、  
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part) の各設定によって決定されます。

## object_shared_data_serialization_version_for_zero_level_parts \{#object_shared_data_serialization_version_for_zero_level_parts\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map_with_buckets" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "ゼロレベルパーツ向けの JSON シリアル化バージョンを制御するための設定を追加"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "map_with_buckets"},{"label": "ゼロレベルパーツに対して、デフォルトで map_with_buckets 共有データシリアル化バージョンを有効化"}]}]}/>

この設定では、INSERT によって作成されるゼロレベルパーツに対して、JSON 型内の共有データのシリアル化バージョンを指定できます。
ゼロレベルパーツに対しては、`advanced` な共有データのシリアル化方式を使用しないことを推奨します。挿入時間が大きく増加する可能性があるためです。

## old_parts_lifetime \{#old_parts_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="480" />

予期しないサーバー再起動によるデータ損失から保護するために、非アクティブなパーツを保持しておく時間（秒単位）。

取りうる値：

- 任意の正の整数。

複数のパーツを 1 つの新しいパーツにマージした後、ClickHouse は元のパーツを非アクティブとしてマークし、`old_parts_lifetime` 秒経過してから削除します。
非アクティブなパーツは、現在のクエリで使用されていない場合、すなわちそのパーツの `refcount` が 1 の場合に削除されます。

新しいパーツに対しては `fsync` は呼び出されないため、しばらくの間、新しいパーツはサーバーの RAM（OS キャッシュ）にしか存在しません。サーバーが予期せず再起動すると、新しいパーツが失われたり破損したりする可能性があります。データを保護するため、非アクティブなパーツはすぐには削除されません。

起動時に ClickHouse はパーツの整合性をチェックします。マージ後のパーツが破損している場合、ClickHouse は非アクティブなパーツをアクティブなリストに戻し、後で再度マージします。その後、破損したパーツは名前が変更され（`broken_` プレフィックスが追加され）、`detached` フォルダに移動されます。マージ後のパーツが破損していない場合、元の非アクティブなパーツの名前が変更され（`ignored_` プレフィックスが追加され）、`detached` フォルダに移動されます。

デフォルトの `dirty_expire_centisecs` の値（Linux カーネルの設定）は 30 秒（書き込まれたデータが RAM のみに保持される最大時間）ですが、ディスクシステムへの負荷が高い場合、データの書き込みがさらに遅くなることがあります。実験的に、`old_parts_lifetime` には 480 秒という値が選択されており、この間に新しいパーツが確実にディスクに書き出されます。

## optimize_row_order \{#optimize_row_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

新しく挿入されたテーブルパーツの圧縮率を向上させるために、挿入時に行の順序を最適化するかどうかを制御します。

通常の MergeTree エンジンテーブルにのみ効果があります。特殊な MergeTree エンジンテーブル（例: CollapsingMergeTree）には何もしません。

MergeTree テーブルは（オプションで）[compression codecs](/sql-reference/statements/create/table#column_compression_codec) を使って圧縮されます。
LZ4 や ZSTD のような汎用圧縮コーデックは、データにパターンがある場合に最大限の圧縮率を達成します。
同じ値の長い連続は、通常とてもよく圧縮されます。

この設定が有効な場合、ClickHouse は新しく挿入されるパーツ内のデータを、新しいテーブルパーツのカラム全体で同一値の連続回数が最小になるような行順で保存しようとします。
言い換えると、同一値の連続の数が少ないということは、個々の連続が長くなり、よく圧縮されるということです。

最適な行順を見つけることは計算上実現不可能です（NP hard）。
そのため ClickHouse はヒューリスティクスを用いて、元の行順と比べて圧縮率を向上させつつ、短時間で行順を見つけます。

<details markdown="1">

<summary>行順を見つけるためのヒューリスティクス</summary>

SQL では、行順が異なっていても同じテーブル（テーブルパーツ）とみなされるため、一般にテーブル（またはテーブルパーツ）の行は自由にシャッフルできます。

テーブルに primary key が定義されている場合、この行のシャッフルの自由度は制限されます。
ClickHouse では、primary key `C1, C2, ..., CN` により、テーブルの行はカラム `C1`, `C2`, ... `Cn` でソートされることが強制されます（[clustered index](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
その結果、行は「同値類」の範囲内でのみシャッフル可能になります。つまり、primary key カラムに同じ値を持つ行同士です。
直感的には、`DateTime64` の timestamp カラムを含むような高カーディナリティの primary key は、多数の小さな同値類を生み出します。
同様に、低カーディナリティの primary key を持つテーブルは、少数で大きな同値類を作ります。
primary key を持たないテーブルは、すべての行を含む 1 つの同値類という極端なケースを表します。

同値類が少なく、かつ大きいほど、行を再シャッフルするときの自由度は高くなります。

各同値類内で最良の行順を見つけるために適用されるヒューリスティクスは、
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
で D. Lemire, O. Kaser により提案されたものであり、primary key でないカラムのカーディナリティの昇順で各同値類内の行をソートすることに基づいています。

これは次の 3 ステップを実行します:
1. primary key カラムの行値に基づいて、すべての同値類を見つける。
2. 各同値類について、primary key でないカラムのカーディナリティを計算（通常は推定）する。
3. 各同値類について、primary key でないカラムのカーディナリティの昇順で行をソートする。

</details>

有効にすると、新しいデータの行順を解析して最適化するため、挿入処理では追加の CPU コストが発生します。
INSERT 文の実行時間は、データの特性に応じて 30–50% 長くなることが予想されます。
LZ4 や ZSTD の圧縮率は平均して 20–40% 向上します。

この設定は、primary key を持たないテーブルや low-cardinality の primary key を持つテーブル、すなわち primary key の異なる値の種類が少ないテーブルに対して最も効果的です。
`DateTime64` 型の timestamp カラムを含むような high-cardinality の primary key は、この設定による恩恵は期待できません。

## part_moves_between_shards_delay_seconds \{#part_moves_between_shards_delay_seconds\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

分片間でパーツを移動する前後に待機する時間（秒）。

## part_moves_between_shards_enable \{#part_moves_between_shards_enable\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

パーツを分片間で移動するための実験的／未完成の機能です。シャーディング式は考慮されません。

## parts_to_delay_insert \{#parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

1 つのパーティション内のアクティブなパーツ数が
`parts_to_delay_insert` の値を超えた場合、`INSERT` は意図的に遅延されます。

設定可能な値:

- 任意の正の整数。

ClickHouse は `INSERT` の実行時間を意図的に長くし（sleep を追加し）、
バックグラウンドのマージ処理が新たに追加される速度よりも速くパーツをマージできるようにします。

## parts_to_throw_insert \{#parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="3000" />

1 つのパーティション内のアクティブなパーツ数が `parts_to_throw_insert` の値を超えると、
`INSERT` は `Too many
parts (N). Merges are processing significantly slower than inserts`
という例外とともに中断されます。

設定可能な値:

- 任意の正の整数。

`SELECT` クエリのパフォーマンスを最大化するには、処理されるパーツ数を最小限に抑える必要があります。
詳細は [Merge Tree](/development/architecture#merge-tree) を参照してください。

バージョン 23.6 より前では、この設定は 300 に設定されていました。より高い値を設定すると
`Too many parts` エラーの発生確率は低下しますが、その一方で `SELECT` のパフォーマンスが
低下する可能性があります。また、マージの問題（たとえばディスク容量不足など）が発生した場合、
元の値 300 のときよりも発見が遅くなります。

## prefer_fetch_merged_part_size_threshold \{#prefer_fetch_merged_part_size_threshold\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

パーツのサイズの合計がこの閾値を超え、かつレプリケーションログエントリが作成されてからの時間が
`prefer_fetch_merged_part_time_threshold` より大きい場合、ローカルでマージを実行する代わりに
レプリカからマージ済みパーツをフェッチすることを優先します。これは、非常に時間のかかるマージ処理を高速化するためです。

Possible values:

- 任意の正の整数。

## prefer_fetch_merged_part_time_threshold \{#prefer_fetch_merged_part_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="3600" />

レプリケーションログ（ClickHouse Keeper または ZooKeeper）のエントリが作成されてからの経過時間がこのしきい値を超え、かつパーツのサイズの合計が `prefer_fetch_merged_part_size_threshold` より大きい場合、ローカルでマージを実行する代わりに、レプリカからマージ済みパーツをフェッチすることを優先します。これは、非常に時間のかかるマージを高速化するためのものです。

設定可能な値:

- 正の整数値。

## prewarm_mark_cache \{#prewarm_mark_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、挿入、マージ、フェッチおよびサーバー起動時に mark を mark cache に保存して、mark cache を事前ウォームアップします。

## prewarm_primary_key_cache \{#prewarm_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

true の場合、挿入、マージ、フェッチおよびサーバー起動時に mark を mark キャッシュに保存することで、プライマリインデックスキャッシュを事前ウォームアップします。

## primary_key_compress_block_size \{#primary_key_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

主キー圧縮ブロックのサイズ。圧縮対象となるブロックの実際のサイズです。

## primary_key_compression_codec \{#primary_key_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

primary key に使用される圧縮コーデックです。primary key は十分に小さく、キャッシュされるため、デフォルトの圧縮方式は ZSTD(3) です。

## primary_key_lazy_load \{#primary_key_lazy_load\}

<SettingsInfoBlock type="Bool" default_value="1" />

テーブルの初期化時ではなく、初回の使用時にプライマリキーをメモリに読み込みます。これにより、大量のテーブルが存在する場合にメモリ使用量を削減できます。

## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns \{#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns\}

<SettingsInfoBlock type="Float" default_value="0.9" />

データパーツ内で主キーのカラムの値が、この比率以上の割合で変化する場合、以降のカラムをメモリに読み込む処理をスキップします。これにより、主キーの不要なカラムを読み込まないことで、メモリ使用量を削減できます。

## ratio_of_defaults_for_sparse_serialization \{#ratio_of_defaults_for_sparse_serialization\}

<SettingsInfoBlock type="Float" default_value="0.9375" />

カラム内の *すべての* 値に対する *デフォルト* 値の数の最小比率です。
この値を設定すると、カラムはスパースなシリアライゼーションを使って保存されます。

カラムがスパース（ほとんどがゼロで構成されている）な場合、ClickHouse はそれをスパース形式でエンコードし、自動的に計算を最適化できます。クエリ時にデータを完全に解凍する必要がありません。このスパースシリアライゼーションを有効にするには、
`ratio_of_defaults_for_sparse_serialization` を 1.0 より小さい値に設定します。
値が 1.0 以上の場合、カラムは常に通常のフルシリアライゼーションで書き込まれます。

設定可能な値:

* スパースシリアライゼーションを有効にするには、`0` から `1` の間の Float
* スパースシリアライゼーションを使用しない場合は、`1.0`（またはそれ以上）

**例**

次のテーブルでは、`s` カラムが 95% の行で空文字列になっていることに注意してください。
`my_regular_table` ではスパースシリアライゼーションを使用せず、
`my_sparse_table` では `ratio_of_defaults_for_sparse_serialization` を 0.95 に設定しています:

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

`my_sparse_table` の `s` カラムは、ディスク使用量が少なくなっていることに注目してください。

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

カラムがスパースエンコーディングを使用しているかどうかは、
`system.parts_columns` テーブルの `serialization_kind` カラムを確認することで判別できます。

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

`s` のうち、スパースシリアライゼーションで保存されているパーツを確認できます。

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

ClickHouse Cloud でのみ利用可能です。いずれの範囲も削除または置換されなかった場合に、ブロッキングしているパーツの削減を再度試みるまで待機する最小時間です。値を小さくすると background_schedule_pool 内のタスクが高頻度で起動し、大規模クラスタでは ZooKeeper へのリクエストが大量に発生します。

## refresh_parts_interval \{#refresh_parts_interval\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

0 より大きい値に設定されている場合、内部でデータが更新されていないか確認するため、基盤となるファイルシステムからデータパーツの一覧を再読み込みします。
これは、テーブルが読み取り専用ディスク上に配置されている場合にのみ設定できます（つまり、このテーブルは読み取り専用レプリカであり、データの書き込みは別のレプリカによって行われていることを意味します）。

## refresh_statistics_interval \{#refresh_statistics_interval\}

<SettingsInfoBlock type="Seconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "300"},{"label": "Enable statistics cache"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

`statistics` キャッシュの更新間隔（秒）。0 に設定すると、更新は無効になります。

## remote_fs_execute_merges_on_single_replica_time_threshold \{#remote_fs_execute_merges_on_single_replica_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="10800" />

この設定が 0 より大きい値に設定されている場合、マージされたパーツが共有ストレージ上にあるときは、単一のレプリカのみが直ちにマージを開始します。

:::note
ゼロコピー レプリケーションは本番利用の準備ができていません
ゼロコピー レプリケーションは ClickHouse バージョン 22.8 以降ではデフォルトで無効になっています。

この機能は本番環境での利用は推奨されません。
:::

設定可能な値:

- 任意の正の整数。

## remote_fs_zero_copy_path_compatible_mode \{#remote_fs_zero_copy_path_compatible_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

変換プロセス中は、互換モードでゼロコピーを実行します。

## remote_fs_zero_copy_zookeeper_path \{#remote_fs_zero_copy_zookeeper_path\}

<ExperimentalBadge/>

<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

ゼロコピー機能におけるテーブル非依存の情報を格納するための ZooKeeper パス。

## remove_empty_parts \{#remove_empty_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効期限 (TTL)、ミューテーション、または collapsing マージアルゴリズムによってデータが削除されて空になったパーツを削除します。

## remove_rolled_back_parts_immediately \{#remove_rolled_back_parts_immediately\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

未完成の実験的機能用の設定です。

## remove_unused_patch_parts \{#remove_unused_patch_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

すべてのアクティブなパーツに適用済みのパッチパーツをバックグラウンドで削除します。

## replace_long_file_name_to_hash \{#replace_long_file_name_to_hash\}

<SettingsInfoBlock type="Bool" default_value="1" />

カラムのファイル名が長すぎる場合（`max_file_name_length`バイトを超える場合）、SipHash128 のハッシュ値に置き換えます。

## replicated_can_become_leader \{#replicated_can_become_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

`true` の場合、このノード上のレプリケートされたテーブルのレプリカは
リーダーになることを試みます。

指定可能な値:

- `true`
- `false`

## replicated_deduplication_window \{#replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>

重複チェック用のハッシュサムを ClickHouse Keeper が保持する、直近で挿入されたブロックの数。

取り得る値:

- 任意の正の整数。
- 0（重複排除を無効にする）

`Insert` コマンドは 1 つ以上のブロック（パーツ）を作成します。
[挿入の重複排除](../../engines/table-engines/mergetree-family/replication.md) のために、
レプリケーションされたテーブルへ書き込む際、ClickHouse は作成されたパーツのハッシュサムを
ClickHouse Keeper に書き込みます。ハッシュサムは直近の `replicated_deduplication_window`
ブロック分のみ保存されます。最も古いハッシュサムは ClickHouse Keeper から削除されます。

`replicated_deduplication_window` の値が大きいと、比較すべきエントリ数が増えるため
`Insert` が遅くなります。ハッシュサムは、フィールド名と型の組み合わせおよび
挿入されたパーツ（バイト列ストリーム）のデータから計算されます。

## replicated_deduplication_window_for_async_inserts \{#replicated_deduplication_window_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse Keeper が重複チェックのためにハッシュ値を保持しておく、直近の非同期インサートブロック数。

設定可能な値:

- 任意の正の整数。
- 0（async_inserts に対する重複排除を無効化）

[Async Insert](/operations/settings/settings#async_insert) コマンドは、1 つ以上のブロック（パーツ）としてキャッシュされます。[insert deduplication](/engines/table-engines/mergetree-family/replication) のためにレプリケートされたテーブルへ書き込む際、ClickHouse は各 insert 操作のハッシュ値を ClickHouse Keeper に書き込みます。ハッシュ値は、直近の `replicated_deduplication_window_for_async_inserts` ブロック分のみ保持されます。最も古いハッシュ値は ClickHouse Keeper から削除されます。
`replicated_deduplication_window_for_async_inserts` の値が大きいと、より多くのエントリと比較する必要があるため、`Async Inserts` が遅くなります。
ハッシュ値は、フィールド名と型の組み合わせ、および insert のデータ（バイトストリーム）から計算されます。

## replicated_deduplication_window_seconds \{#replicated_deduplication_window_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>

挿入されたブロックのハッシュ値が ClickHouse Keeper から削除されるまでの秒数。

可能な値:

- 任意の正の整数。

[replicated_deduplication_window](#replicated_deduplication_window) と同様に、
`replicated_deduplication_window_seconds` は、挿入の重複排除のために
ブロックのハッシュ値をどのくらいの期間保持するかを指定します。
`replicated_deduplication_window_seconds` より古いハッシュ値は、
`replicated_deduplication_window` 未満であっても ClickHouse Keeper から削除されます。

時間はウォールクロック時刻ではなく、最新のレコード時刻を基準とします。
それが唯一のレコードである場合は、無期限に保持されます。

## replicated_deduplication_window_seconds_for_async_inserts \{#replicated_deduplication_window_seconds_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="604800" />

非同期 insert のハッシュ値が ClickHouse Keeper から削除されるまでの秒数。

可能な値:

- 任意の正の整数。

[replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts) と同様に、
`replicated_deduplication_window_seconds_for_async_inserts` は、非同期 insert の重複排除のために
ブロックのハッシュ値を保持しておく期間を秒単位で指定します。
`replicated_deduplication_window_seconds_for_async_inserts` より古いハッシュ値は、
`replicated_deduplication_window_for_async_inserts` より小さい場合でも ClickHouse Keeper から削除されます。

時間はウォールクロック時間ではなく、最新レコードの時刻を基準にします。
それが唯一のレコードである場合、そのレコードは無期限に保持されます。

## replicated_fetches_http_connection_timeout \{#replicated_fetches_http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

廃止された設定で、現在は効果がありません。

## replicated_fetches_http_receive_timeout \{#replicated_fetches_http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

廃止された設定であり、現在は何の効果もありません。

## replicated_fetches_http_send_timeout \{#replicated_fetches_http_send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

廃止された設定であり、現在は何の効果もありません。

## replicated_max_mutations_in_one_entry \{#replicated_max_mutations_in_one_entry\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

1つの MUTATE_PART エントリ内でマージして一括実行できる mutation コマンドの最大数（0 は無制限）

## replicated_max_parallel_fetches \{#replicated_max_parallel_fetches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定で、現在は効果がありません。

## replicated_max_parallel_fetches_for_host \{#replicated_max_parallel_fetches_for_host\}

<SettingsInfoBlock type="UInt64" default_value="15" />

この設定は廃止されており、何も実行されません。

## replicated_max_parallel_fetches_for_table \{#replicated_max_parallel_fetches_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定であり、現在は何の効果もありません。

## replicated_max_parallel_sends \{#replicated_max_parallel_sends\}

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定は廃止されており、現在は何の効果もありません。

## replicated_max_parallel_sends_for_table \{#replicated_max_parallel_sends_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

廃止された設定であり、現在は何の効果もありません。

## replicated_max_ratio_of_wrong_parts \{#replicated_max_ratio_of_wrong_parts\}

<SettingsInfoBlock type="Float" default_value="0.5" />

誤ったパーツ数の、全パーツ数に対する比率がこの値より小さい場合は、
起動を許可します。

可能な値:

- Float, 0.0 - 1.0

## search_orphaned_parts_disks \{#search_orphaned_parts_disks\}

<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "新しい設定"}]}]}/>

ClickHouse は、未定義（ポリシーに含まれていない）のディスク上にあるデータパーツを見落とさないよう、任意の ATTACH または CREATE table 実行時に、すべてのディスク上の孤立したパーツをスキャンします。
孤立したパーツは、ディスクがストレージポリシーから除外された場合など、安全でない可能性のあるストレージ再構成によって発生します。
この設定は、ディスクの特性に基づいて、検索対象とするディスクの範囲を制限します。

設定可能な値:

- any - スコープに制限はありません。
- local - スコープはローカルディスクに限定されます。
- none - スコープを空にし、検索を行いません。

## serialization_info_version \{#serialization_info_version\}

<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "カスタムの文字列シリアル化を可能にする新しい形式への変更"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "新しい設定"}]}]}/>

`serialization.json` を書き込む際に使用されるシリアル化情報バージョンです。
クラスターのアップグレード時の互換性のためにこの設定が必要です。

設定可能な値:

- `basic` - 基本形式。
- `with_types` - 型ごとのシリアル化バージョンを可能にする、追加の `types_serialization_versions` フィールドを含む形式。
これにより、`string_serialization_version` のような設定が有効になります。

ローリングアップグレード中は、これを `basic` に設定し、新しいサーバーが古いサーバーと互換性のあるデータパーツを生成するようにします。アップグレードが完了したら、
型ごとのシリアル化バージョンを有効にするために `WITH_TYPES` に切り替えます。

## shared_merge_tree_activate_coordinated_merges_tasks \{#shared_merge_tree_activate_coordinated_merges_tasks\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定"}]}]}/>

協調マージタスクの再スケジューリングを有効にします。  
shared_merge_tree_enable_coordinated_merges=0 の場合でも、マージコーディネータの統計情報を蓄積してコールドスタート時の動作を改善するのに役立ちます。

## shared_merge_tree_create_per_replica_metadata_nodes \{#shared_merge_tree_create_per_replica_metadata_nodes\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Keeper 内のメタデータ量を削減。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud 同期"}]}]}/>

ZooKeeper 内にレプリカごとの /metadata および /columns ノードを作成することを有効にします。
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_disable_merges_and_mutations_assignment \{#shared_merge_tree_disable_merges_and_mutations_assignment\}

<SettingsInfoBlock type="Bool" default_value="0" />

共有MergeTreeに対するマージの割り当てを停止します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_empty_partition_lifetime \{#shared_merge_tree_empty_partition_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "New setting"}]}]}/>

パーツを持たないパーティションが Keeper 内に保持される時間（秒）。

## shared_merge_tree_enable_automatic_empty_partitions_cleanup \{#shared_merge_tree_enable_automatic_empty_partitions_cleanup\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

空のパーティションに対応する Keeper エントリのクリーンアップを有効にします。

## shared_merge_tree_enable_coordinated_merges \{#shared_merge_tree_enable_coordinated_merges\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新規設定"}]}]}/>

協調マージ戦略を有効化します

## shared_merge_tree_enable_keeper_parts_extra_data \{#shared_merge_tree_enable_keeper_parts_extra_data\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "新しい設定"}]}]}/>

virtual パーツへの属性の書き込みと、Keeper 内でのブロックのコミットを有効にします

## shared_merge_tree_enable_outdated_parts_check \{#shared_merge_tree_enable_outdated_parts_check\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

古くなったパーツのチェックを有効にします。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_idle_parts_update_seconds \{#shared_merge_tree_idle_parts_update_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>

shared merge tree において、ZooKeeper の watch によってトリガーされないパーツ更新を行うための間隔（秒単位）。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_initial_parts_update_backoff_ms \{#shared_merge_tree_initial_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "新しい設定"}]}]}/>

パーツ更新の初期バックオフ時間。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_interserver_http_connection_timeout_ms \{#shared_merge_tree_interserver_http_connection_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>

サーバー間 HTTP 接続のタイムアウト時間を指定します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_interserver_http_timeout_ms \{#shared_merge_tree_interserver_http_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

サーバ間の HTTP 通信におけるタイムアウト時間（ミリ秒）。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_leader_update_period_random_add_seconds \{#shared_merge_tree_leader_update_period_random_add_seconds\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

`shared_merge_tree_leader_update_period` に、0 から x 秒の範囲で一様分布する値を加算し、スパイク的な一斉アクセス（thundering herd）を回避します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_leader_update_period_seconds \{#shared_merge_tree_leader_update_period_seconds\}

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

パーツの更新に対するリーダーを再チェックする最大間隔。
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_outdated_parts_to_process_at_once \{#shared_merge_tree_max_outdated_parts_to_process_at_once\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

1 回の HTTP リクエストあたりに、リーダーが削除対象として確認しようとする古くなったパーツの最大数です。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_parts_update_backoff_ms \{#shared_merge_tree_max_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "新規設定"}]}]}/>

パーツ更新に対するバックオフ時間の最大値。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_parts_update_leaders_in_total \{#shared_merge_tree_max_parts_update_leaders_in_total\}

<SettingsInfoBlock type="UInt64" default_value="6" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

パーツの更新リーダーの最大数。ClickHouse Cloud でのみ使用可能です

## shared_merge_tree_max_parts_update_leaders_per_az \{#shared_merge_tree_max_parts_update_leaders_per_az\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

パーツの更新リーダーの最大数。ClickHouse Cloud でのみ利用可能です

## shared_merge_tree_max_replicas_for_parts_deletion \{#shared_merge_tree_max_replicas_for_parts_deletion\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

パーツ削除を行う killer スレッドに参加するレプリカの最大数。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range \{#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range\}

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

競合する可能性のあるマージの割り当てを試行するレプリカの最大数（マージの割り当てにおける不要な競合を回避するため）。0 を指定すると無効になります。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_max_suspicious_broken_parts \{#shared_merge_tree_max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT における破損パーツの最大数。これを超えると自動 detach を許可しない"}]}]}/>

SMT における破損パーツの最大数。これを超えると自動 detach を許可しません。

## shared_merge_tree_max_suspicious_broken_parts_bytes \{#shared_merge_tree_max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT におけるすべての破損パーツの合計最大サイズ。これを超える場合は、自動 detach を行いません"}]}]}/>

SMT におけるすべての破損パーツの合計最大サイズ。これを超える場合は、自動 detach を行いません。

## shared_merge_tree_memo_ids_remove_timeout_seconds \{#shared_merge_tree_memo_ids_remove_timeout_seconds\}

<SettingsInfoBlock type="Int64" default_value="1800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

挿入の再試行時に誤った処理が行われるのを防ぐために、挿入用メモ化 ID をどのくらいの期間保持するかを指定します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_merge_coordinator_election_check_period_ms \{#shared_merge_tree_merge_coordinator_election_check_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

マージコーディネーター選出スレッドの実行間隔

## shared_merge_tree_merge_coordinator_factor \{#shared_merge_tree_merge_coordinator_factor\}

<BetaBadge/>

<SettingsInfoBlock type="Float" default_value="1.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "ロード後のコーディネータースリープ時間の短縮"}]}]}/>

コーディネータースレッドの遅延時間の変化係数

## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms \{#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

merge coordinator が最新のメタデータを取得するために ZooKeeper と同期する間隔（ミリ秒）

## shared_merge_tree_merge_coordinator_max_merge_request_size \{#shared_merge_tree_merge_coordinator_max_merge_request_size\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

MergerMutator に対してコーディネータが同時に要求できるマージ処理の数

## shared_merge_tree_merge_coordinator_max_period_ms \{#shared_merge_tree_merge_coordinator_max_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

マージコーディネータースレッドの実行と実行の間隔の最大時間

## shared_merge_tree_merge_coordinator_merges_prepare_count \{#shared_merge_tree_merge_coordinator_merges_prepare_count\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

コーディネーターが準備してワーカー間に分配するマージエントリの数

## shared_merge_tree_merge_coordinator_min_period_ms \{#shared_merge_tree_merge_coordinator_min_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

マージコーディネータースレッドの実行間隔の最小値

## shared_merge_tree_merge_worker_fast_timeout_ms \{#shared_merge_tree_merge_worker_fast_timeout_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

即時のアクションの後に自身の状態を更新する必要がある場合に、merge worker スレッドが使用するタイムアウト値。

## shared_merge_tree_merge_worker_regular_timeout_ms \{#shared_merge_tree_merge_worker_regular_timeout_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

マージワーカースレッドの実行間隔（ミリ秒）

## shared_merge_tree_outdated_parts_group_size \{#shared_merge_tree_outdated_parts_group_size\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "新しい設定"}]}]}/>

古いパーツをクリーンアップする際に、同じランデブーハッシュグループに含めるレプリカの数を指定します。
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations \{#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations\}

<SettingsInfoBlock type="Float" default_value="0.5" />

`<candidate
partitions for mutations only (partitions that cannot be merged)>/<candidate
partitions for mutations>` の比率がこの設定値を超えた場合、merge/mutate の対象を選択するタスクにおいて `merge predicate` を再読み込みします。ClickHouse Cloud でのみ使用可能です。

## shared_merge_tree_parts_load_batch_size \{#shared_merge_tree_parts_load_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="32" />

一度にスケジュールするパーツメタデータフェッチジョブの数。ClickHouse Cloud でのみ利用可能です

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

ローカルでマージされたパーツを、そのパーツを含む新しいマージ処理を開始せずに保持しておく時間です。
他のレプリカがそのパーツをフェッチしてから、そのマージを開始できるようにします。
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

ローカルでマージした直後に次のマージの割り当てを延期するかどうかを判定する際の、パーツの最小サイズ（行数）。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_range_for_merge_window_size \{#shared_merge_tree_range_for_merge_window_size\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

ローカルでマージ済みのパーツを、そのパーツを含む新しいマージを開始せずに保持しておく時間です。
他のレプリカがそのパーツをフェッチし、このマージを開始できるように猶予を与えます。
ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_read_virtual_parts_from_leader \{#shared_merge_tree_read_virtual_parts_from_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

可能な場合はリーダーから仮想パーツを読み込みます。ClickHouse Cloud でのみ使用可能です。

## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas \{#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "他のレプリカからメモリ上のパーツデータを取得するための新しい設定"}]}]}/>

有効にすると、すべてのレプリカは、すでにそのデータが存在している他のレプリカから、メモリ上に保持されるパーツ関連データ（プライマリキーやパーティション情報など）を取得しようとします。

## shared_merge_tree_update_replica_flags_delay_ms \{#shared_merge_tree_update_replica_flags_delay_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "新しい設定"}]}]}/>

バックグラウンドスケジュールに従って、レプリカが自身のフラグを再読み込みしようとする間隔。

## shared_merge_tree_use_metadata_hints_cache \{#shared_merge_tree_use_metadata_hints_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

他のレプリカのインメモリキャッシュから FS キャッシュのヒントを要求できるようにします。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_use_outdated_parts_compact_format \{#shared_merge_tree_use_outdated_parts_compact_format\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "Outdated parts v3 をデフォルトで有効化"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同期"}]}]}/>

古いパーツにコンパクト形式を使用します。Keeper への負荷を軽減し、古いパーツの処理を向上させます。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_use_too_many_parts_count_from_virtual_parts \{#shared_merge_tree_use_too_many_parts_count_from_virtual_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

有効にすると、「too many parts」カウンタはローカルレプリカの状態ではなく、Keeper 内の共有データに基づいて動作します。ClickHouse Cloud でのみ利用可能です。

## shared_merge_tree_virtual_parts_discovery_batch \{#shared_merge_tree_virtual_parts_discovery_batch\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

1 回のバッチにいくつのパーティション検出処理を含めるかを指定します

## simultaneous_parts_removal_limit \{#simultaneous_parts_removal_limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

多数の古いパーツがある場合、クリーンアップスレッドは 1 回のイテレーションで最大 `simultaneous_parts_removal_limit` 個のパーツを削除しようとします。
`simultaneous_parts_removal_limit` を `0` に設定すると、無制限になります。

## sleep_before_commit_local_part_in_replicated_table_ms \{#sleep_before_commit_local_part_in_replicated_table_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

テスト目的の設定です。変更しないでください。

## sleep_before_loading_outdated_parts_ms \{#sleep_before_loading_outdated_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

テスト用の設定です。変更しないでください。

## storage_policy \{#storage_policy\}

<SettingsInfoBlock type="String" default_value="default" />

ストレージディスクのポリシー名

## string_serialization_version \{#string_serialization_version\}

<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "サイズを別ストリームとして保持する新しいフォーマットへ変更"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "新しい設定"}]}]}/>

トップレベルの `String` カラムに対するシリアライズ形式を制御します。

この設定は、`serialization_info_version` が "with_types" に設定されている場合にのみ有効です。
`with_size_stream` を指定すると、トップレベルの `String` カラムはサイズ情報をインラインではなく、
文字列長を格納する `.size` サブカラムを別途用意してシリアライズされます。これにより実際の
`.size` サブカラムを利用でき、圧縮効率が向上する場合があります。

入れ子になった `String` 型（たとえば `Nullable`、`LowCardinality`、`Array`、`Map` の内部など）
は、`Tuple` 内に現れる場合を除き、この設定の影響を受けません。

指定可能な値:

- `single_stream` — サイズ情報をインラインで保持する標準的なシリアライズ形式を使用します。
- `with_size_stream` — トップレベルの `String` カラムに対してサイズ専用のストリームを使用します。

## table_disk \{#table_disk\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

これはテーブル用ディスクであり、path/endpoint はデータベース全体のデータではなくテーブルデータを指す必要があります。s3_plain/s3_plain_rewritable/web に対してのみ設定可能です。

## temporary_directories_lifetime \{#temporary_directories_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

tmp_-ディレクトリを保持しておく時間（秒）。  
この値は下げるべきではありません。値を小さくしすぎると、マージやミューテーションが正常に動作しない可能性があります。

## try_fetch_recompressed_part_timeout \{#try_fetch_recompressed_part_timeout\}

<SettingsInfoBlock type="Seconds" default_value="7200" />

再圧縮を伴うマージを開始するまでのタイムアウト（秒）。この時間中、ClickHouse はこの再圧縮を伴うマージが割り当てられているレプリカから、再圧縮済みパートの取得を試みます。

ほとんどの場合、再圧縮は低速であるため、このタイムアウトに達するまでは再圧縮付きのマージを開始せず、この再圧縮を伴うマージが割り当てられているレプリカから再圧縮済みパートの取得を試みます。

取り得る値:

- 任意の正の整数。

## ttl_only_drop_parts \{#ttl_only_drop_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

MergeTree テーブルで、そのパーツ内のすべての行が `TTL` 設定に従って有効期限切れとなった場合に、そのデータパーツを完全に削除するかどうかを制御します。

`ttl_only_drop_parts` が無効（デフォルト）の場合、有効期限 (TTL) 設定に基づいて期限切れとなった行のみが削除されます。

`ttl_only_drop_parts` が有効な場合、そのパーツ内のすべての行が `TTL` 設定に従って有効期限切れとなっていれば、パーツ全体が削除されます。

## use_adaptive_write_buffer_for_dynamic_subcolumns \{#use_adaptive_write_buffer_for_dynamic_subcolumns\}

<SettingsInfoBlock type="Bool" default_value="1" />

動的サブカラムを書き込む際にメモリ使用量を削減するため、アダプティブな書き込みバッファーの使用を許可します

## use_async_block_ids_cache \{#use_async_block_ids_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、非同期 INSERT のハッシュ値をキャッシュします。

設定可能な値:

- `true`
- `false`

複数の非同期 INSERT を含むブロックは、複数のハッシュ値を生成します。
一部の INSERT が重複している場合、Keeper は 1 回の RPC で重複しているハッシュ値を 1 つしか返さず、それが不要な RPC のリトライの原因となります。
このキャッシュは Keeper 内のハッシュ値のパスを監視します。Keeper 内で更新が検知されると、キャッシュは可能な限り早く更新されるため、メモリ内で重複した INSERT をフィルタリングできるようになります。

## use_compact_variant_discriminators_serialization \{#use_compact_variant_discriminators_serialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

Variant データ型における discriminator のバイナリシリアル化に対して、コンパクトモードを有効にします。
このモードでは、ほとんどが同一の variant である場合や、NULL 値が多数存在する場合に、
パーツ内で discriminator を保存するために必要なメモリを大幅に削減できます。

## use_const_adaptive_granularity \{#use_const_adaptive_granularity\}

<SettingsInfoBlock type="Bool" default_value="0" />

パーツ全体に対して常に一定の granularity を使用します。これにより、メモリ上に保持される索引 granularity の値を圧縮できます。列数の少ないテーブルに対する非常に大規模なワークロードで有用です。

## use_metadata_cache \{#use_metadata_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

この設定は廃止されており、何も行いません。

## use_minimalistic_checksums_in_zookeeper \{#use_minimalistic_checksums_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper 内のパートチェックサムに対して、通常の形式（数十 KB）ではなく、より小さい形式（数十バイト）を使用します。この設定を有効化する前に、すべてのレプリカが新しい形式をサポートしていることを確認してください。

## use_minimalistic_part_header_in_zookeeper \{#use_minimalistic_part_header_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper におけるデータパーツのヘッダーの保存方法を指定します。有効にすると、ZooKeeper に保存されるデータ量が少なくなります。詳細は[こちら](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)を参照してください。

## use_primary_key_cache \{#use_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

プライマリキーの索引に対してキャッシュを使用し、すべての索引をメモリ上に保持しないようにします。非常に大きなテーブルで有用です。

## vertical_merge_algorithm_min_bytes_to_activate \{#vertical_merge_algorithm_min_bytes_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="0" />

マージ対象のパーツに対して Vertical merge アルゴリズムを有効化するための、非圧縮サイズ（バイト単位、概算）の最小値。

## vertical_merge_algorithm_min_columns_to_activate \{#vertical_merge_algorithm_min_columns_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="11" />

Vertical merge アルゴリズムを有効化するために必要な、PK 以外のカラムの最小数。

## vertical_merge_algorithm_min_rows_to_activate \{#vertical_merge_algorithm_min_rows_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

Vertical merge アルゴリズムを有効化するために必要となる、
マージ対象パーツに含まれる行数の最小（概算）合計。

## vertical_merge_optimize_lightweight_delete \{#vertical_merge_optimize_lightweight_delete\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新しい設定"}]}]}/>

true の場合、vertical merge 時に論理削除処理が最適化されます。

## vertical_merge_remote_filesystem_prefetch \{#vertical_merge_remote_filesystem_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、マージ処理中に次のカラム用のデータをリモートファイルシステムから先読みします

## wait_for_unique_parts_send_before_shutdown_ms \{#wait_for_unique_parts_send_before_shutdown_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

シャットダウン前に、テーブルは指定した時間のあいだ、現在のレプリカにしか存在しない一意のパーツが他のレプリカによってフェッチされるのを待機します（0 は無効を意味します）。

## write_ahead_log_bytes_to_fsync \{#write_ahead_log_bytes_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

これは廃止された設定で、何の効果もありません。

## write_ahead_log_interval_ms_to_fsync \{#write_ahead_log_interval_ms_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="100" />

廃止された設定であり、現在は何の効果もありません。

## write_ahead_log_max_bytes \{#write_ahead_log_max_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

廃止された設定であり、現在は無効で何の効果もありません。

## write_final_mark \{#write_final_mark\}

<SettingsInfoBlock type="Bool" default_value="1" />

廃止されたSETTINGで、何の効果もありません。

## write_marks_for_substreams_in_compact_parts \{#write_marks_for_substreams_in_compact_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "デフォルトで Compact パーツ内のサブストリームに対するマーク書き込みを有効化"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい設定"}]}]}/>

Compact パーツにおいて、各カラムではなく各サブストリームごとにマークを書き込めるようにします。
これにより、データパーツから個々のサブカラムを効率的に読み取ることができます。

例えば、カラム `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` は次のサブストリームとしてシリアライズされます:

- タプル要素 `a` の String データ用の `t.a`
- タプル要素 `b` の UInt32 データ用の `t.b`
- タプル要素 `c` の配列サイズ用の `t.c.size0`
- タプル要素 `c` の入れ子配列要素の null マップ用の `t.c.null`
- タプル要素 `c` の入れ子配列要素の UInt32 データ用の `t.c`

この設定が有効な場合、これら 5 つのサブストリームそれぞれにマークを書き込みます。これは、必要に応じて各サブストリームのデータをグラニュールから個別に読み取ることができることを意味します。例えば、サブカラム `t.c` を読み取りたい場合、サブストリーム `t.c.size0`、`t.c.null`、`t.c` のデータのみを読み取り、サブストリーム `t.a` および `t.b` からはデータを読み取りません。この設定が無効な場合は、トップレベルカラム `t` に対してのみマークを書き込みます。これは、いくつかのサブストリームのデータだけが必要な場合でも、常にグラニュールからそのカラム全体のデータを読み取ることを意味します。

## zero_copy_concurrent_part_removal_max_postpone_ratio \{#zero_copy_concurrent_part_removal_max_postpone_ratio\}

<SettingsInfoBlock type="Float" default_value="0.05" />

より小さい独立した範囲を得るために、削除を延期するトップレベルのパーツの最大割合です。変更しないことを推奨します。

## zero_copy_concurrent_part_removal_max_split_times \{#zero_copy_concurrent_part_removal_max_split_times\}

<SettingsInfoBlock type="UInt64" default_value="5" />

独立した古いパーツの範囲を、より小さなサブレンジに分割するための再帰処理の最大深さです。変更しないことを推奨します。

## zero_copy_merge_mutation_min_parts_size_sleep_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

ゼロコピーによるレプリケーションが有効な場合、マージまたはミューテーション時のパーツのサイズに応じて、ロックを取得しようとする前にランダムな時間だけ待機します。

## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "新しい設定"}]}]}/>

ゼロコピー レプリケーションが有効な場合、マージまたはミューテーションのロック取得を試みる前に、最大 500ms の範囲でランダムな時間スリープします。

## zookeeper_session_expiration_check_period \{#zookeeper_session_expiration_check_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper セッションの有効期限を確認する間隔（秒単位）。

設定可能な値:

- 任意の正の整数。