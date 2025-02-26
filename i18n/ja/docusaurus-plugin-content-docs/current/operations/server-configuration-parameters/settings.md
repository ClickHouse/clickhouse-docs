```markdown
---
slug: /operations/server-configuration-parameters/settings
sidebar_position: 57
sidebar_label: グローバルサーバー設定
description: このセクションには、セッションまたはクエリレベルで変更できないサーバー設定の説明が含まれています。
keywords: [グローバルサーバー設定]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/ja/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md'

# グローバルサーバー設定

このセクションには、セッションまたはクエリレベルで変更できないサーバー設定の説明が含まれています。これらの設定は、ClickHouseサーバーの`config.xml`ファイルに保存されています。ClickHouseにおける構成ファイルの詳細については、["構成ファイル"](/operations/configuration-files)を参照してください。

他の設定については、"[設定](../../operations/settings/overview#session-settings-intro)"セクションで説明されています。
設定を学ぶ前に、[構成ファイル](../../operations/configuration-files.md#configuration_files)セクションを読み、置換使用（`incl`および`optional`属性）に留意することをお勧めします。

## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

jemallocメモリの使用を許可します。

タイプ: `Bool`

デフォルト: `1`

## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

非同期メトリクスの更新間隔（秒単位）。

タイプ: `UInt32`

デフォルト: `120`

## asynchronous_metric_log {#asynchronous_metric_log}

ClickHouse Cloudデプロイメントではデフォルトで有効になっています。

環境でこの設定がデフォルトで有効でない場合、ClickHouseのインストール方法に応じて、以下の手順に従って有効または無効にすることができます。

**有効にする**

非同期メトリクスログ履歴収集を手動で有効にするには、[`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)について、次の内容で`/etc/clickhouse-server/config.d/asynchronous_metric_log.xml`を作成します。

```xml
<clickhouse>
     <asynchronous_metric_log>
        <database>system</database>
        <table>asynchronous_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </asynchronous_metric_log>
</clickhouse>
```

**無効にする**

`asynchronous_metric_log`設定を無効にするには、次の内容で`/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`というファイルを作成します。

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

非同期メトリクスの更新間隔（秒単位）。

タイプ: `UInt32`

デフォルト: `1`

## auth_use_forwarded_address {#auth_use_forwarded_address}

プロキシを介して接続されたクライアントに対して認証のために元のアドレスを使用します。

:::note
この設定は特に注意して使用する必要があります。なぜなら、転送されたアドレスは簡単に偽装できるためです。このような認証を受け入れるサーバーには直接アクセスせず、信頼できるプロキシを介してのみアクセスするべきです。
:::

タイプ: `Bool`

デフォルト: `0`

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

バックグラウンドで[Buffer-engineテーブル](/engines/table-engines/special/buffer)のフラッシュ操作を実行するために使用されるスレッドの最大数。

タイプ: `UInt64`

デフォルト: `16`

## background_common_pool_size {#background_common_pool_size}

バックグラウンドでさまざまな操作（主にガーベジコレクション）を実行するために使用されるスレッドの最大数[*MergeTree-engine](/engines/table-engines/mergetree-family)テーブルの場合。

タイプ: `UInt64`

デフォルト: `8`

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

分散送信を実行するために使用されるスレッドの最大数。

タイプ: `UInt64`

デフォルト: `16`

## background_fetches_pool_size {#background_fetches_pool_size}

バックグラウンドで[*MergeTree-engine](/engines/table-engines/mergetree-family)テーブルのデータパーツを他のレプリカから取得するために使用されるスレッドの最大数。

タイプ: `UInt64`

デフォルト: `16`

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

バックグラウンドのマージとミューテーションのスレッド数と同時に実行できる数の比率を設定します。

たとえば、比率が2で、[`background_pool_size`](#background_pool_size)が16に設定されている場合、ClickHouseは32のバックグラウンドマージを同時に実行できます。これは、バックグラウンド操作が一時停止および延期できるためです。これは、小さなマージに実行の優先順位を与える必要があります。

:::note
この比率は実行時にのみ増加させることができます。低くするにはサーバーを再起動する必要があります。

[`background_pool_size`](#background_pool_size)設定と同様に、[`background_merges_mutations_concurrency_ratio`](#background_merges_mutations_concurrency_ratio)は、後方互換性のために`default`プロファイルから適用できます。
:::

タイプ: `Float`

デフォルト: `2`

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

バックグラウンドのマージとミューテーションのスケジューリングを行うポリシー。可能な値は`round_robin`および`shortest_task_first`です。

バックグラウンドスレッドプールによって実行される次のマージまたはミューテーションを選択するために使用されるアルゴリズム。ポリシーはサーバーを再起動せずに実行時に変更できます。
後方互換性のために`default`プロファイルから適用される可能性があります。

可能な値:

- `round_robin` — すべての同時マージとミューテーションはラウンドロビン順に実行され、スタベーションのない操作を保証します。小さなマージは、大きなマージよりも早く完了します。これは、マージするブロックが少ないためです。
- `shortest_task_first` — 常に小さなマージまたはミューテーションを実行します。マージとミューテーションは、結果のサイズに基づいて優先順位が付けられます。小さなサイズのマージは、大きなサイズのものよりも厳密に優先されます。このポリシーは、小さなパーツの最も高速なマージを保証しますが、`INSERT`の影響で重くなったパーティション内の大きなマージには無限のスタベーションを引き起こす可能性があります。

タイプ: String

デフォルト: `round_robin`

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

メッセージストリーミングのバックグラウンド操作を実行するために使用されるスレッドの最大数。

タイプ: UInt64

デフォルト: `16`

## background_move_pool_size {#background_move_pool_size}

*MergeTree-engineテーブル用に、データ部分を別のディスクまたはボリュームに移動するために使用されるバックグラウンドスレッドの最大数。

タイプ: UInt64

デフォルト: `8`

## background_schedule_pool_size {#background_schedule_pool_size}

レプリケートテーブル、Kafkaストリーミング、およびDNSキャッシュ更新のために、定期的な軽量操作を実行するために使用されるスレッドの最大数。

タイプ: UInt64

デフォルト: `512`

## backups {#backups}

`BACKUP TO File()`を書くときに使用されるバックアップ設定。

サブタグによって設定できる設定は次のとおりです。

| 設定                                   | 説明                                                                                                                                                 | デフォルト |
|----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                        | `File()`を使ってバックアップするときのパス。この設定は`File`を使用するために設定する必要があります。パスはインスタンスディレクトリに対して相対的なものか、絶対的なものにできます。 | `true`  |
| `remove_backup_files_after_failure`   | `BACKUP`コマンドが失敗した場合、ClickHouseは失敗前にバックアップに既にコピーされたファイルを削除しようとします。そうでない場合、コピーされたファイルはそのまま残ります。     | `true`  |

この設定はデフォルトで次のように構成されています。

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```

## backup_threads {#backup_threads}

`BACKUP`リクエストを実行するためのスレッドの最大数。

タイプ: `UInt64`

デフォルト: `16`

## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

バックアップIOスレッドプールでスケジュールできるジョブの最大数。現在のS3バックアップロジックのために、このキューを無制限に保つことをお勧めします。

:::note
値が`0`（デフォルト）は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## bcrypt_workfactor {#bcrypt_workfactor}

[Bcryptアルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)を使用したbcrypt_password認証タイプの作業因子。

デフォルト: `12`

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

キャッシュサイズをRAMの最大比率に設定します。メモリの少ないシステムではキャッシュサイズを減少させることができます。

タイプ: `Double`

デフォルト: `0.5`

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

リモートサーバーからデータを取得するためのスレッドを除く、すべてのクエリを実行するために許可されているクエリ処理スレッドの最大数。これは厳密な制限ではありません。制限に達した場合でも、クエリは実行されるための少なくとも1つのスレッドが与えられます。クエリが実行中にさらにスレッドが利用可能になる場合、希望するスレッド数に拡張できます。

:::note
値が`0`（デフォルト）は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num)と同じですが、コアに対する比率です。

タイプ: `UInt64`

デフォルト: `0`

## default_database {#default_database}

デフォルトのデータベース名。

タイプ: `String`

デフォルト: `default`

## disable_internal_dns_cache {#disable_internal_dns_cache}

内部DNSキャッシュを無効にします。頻繁に変化するインフラストラクチャ（例えばKubernetes）でClickHouseを操作する場合に推奨されます。

タイプ: `Bool`

デフォルト: `0`

## dns_cache_max_entries {#dns_cache_max_entries}

内部DNSキャッシュの最大エントリ数。

タイプ: `UInt64`

デフォルト: `10000`

## dns_cache_update_period {#dns_cache_update_period}

内部DNSキャッシュの更新間隔（秒単位）。

タイプ: `Int32`

デフォルト: `15`

## dns_max_consecutive_failures {#dns_max_consecutive_failures}

ホストをClickHouse DNSキャッシュから削除する前の最大連続解決失敗数。

タイプ: `UInt32`

デフォルト: `10`

## index_mark_cache_policy {#index_mark_cache_policy}

インデックスマークキャッシュポリシー名。

タイプ: `String`

デフォルト: `SLRU`

## index_mark_cache_size {#index_mark_cache_size}

インデックスマークのためのキャッシュの最大サイズ。

:::note
値が`0`は無効を意味します。

この設定は実行時に変更可能で、すぐに効果を発揮します。
:::

タイプ: `UInt64`

デフォルト: `0`

## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

インデックスマークキャッシュの保護されたキューのサイズ（SLRUポリシーの場合）をキャッシュの総サイズに対する比率として設定します。

タイプ: `Double`

デフォルト: `0.5`

## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

インデックス非圧縮キャッシュポリシー名。

タイプ: `String`

デフォルト: `SLRU`

## index_uncompressed_cache_size {#index_uncompressed_cache_size}

`MergeTree`インデックスの非圧縮ブロックのためのキャッシュの最大サイズ。

:::note
値が`0`は無効を意味します。

この設定は実行時に変更可能で、すぐに効果を発揮します。
:::

タイプ: `UInt64`

デフォルト: `0`

## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

インデックス非圧縮キャッシュの保護されたキューのサイズ（SLRUポリシーの場合）をキャッシュの総サイズに対する比率として設定します。

タイプ: `Double`

デフォルト: `0.5`

## skipping_index_cache_policy {#skipping_index_cache_policy}

スキップインデックスキャッシュポリシー名。

タイプ: `String`

デフォルト: `SLRU`

## skipping_index_cache_size {#skipping_index_cache_size}

スキップインデックスのためのキャッシュのサイズ。ゼロは無効を意味します。

:::note
この設定は実行時に変更可能で、すぐに効果を発揮します。
:::

タイプ: `UInt64`

デフォルト: `5368709120` (= 5 GiB)

## skipping_index_cache_size_ratio {#skipping_index_cache_size_ratio}

スキップインデックスキャッシュの保護されたキューのサイズ（SLRUポリシーの場合）をキャッシュの総サイズに対する比率として設定します。

タイプ: `Double`

デフォルト: `0.5`

## skipping_index_cache_max_entries {#skipping_index_cache_max_entries}

スキップインデックスキャッシュの最大エントリ数。

タイプ: `UInt64`

デフォルト: `10000000`

## io_thread_pool_queue_size {#io_thread_pool_queue_size}

IOスレッドプールでスケジュールできるジョブの最大数。

:::note
値が`0`は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `10000`

## mark_cache_policy {#mark_cache_policy}

マークキャッシュポリシー名。

タイプ: `String`

デフォルト: `SLRU`

## mark_cache_size {#mark_cache_size}

マークのためのキャッシュの最大サイズ（[`MergeTree`](/engines/table-engines/mergetree-family)ファミリーのテーブルのインデックス）。

:::note
この設定は実行時に変更可能で、すぐに効果を発揮します。
:::

タイプ: `UInt64`

デフォルト: `5368709120`

## mark_cache_size_ratio {#mark_cache_size_ratio}

マークキャッシュにおける保護されたキューのサイズ（SLRUポリシーの場合）をキャッシュの総サイズに対する比率として設定します。

タイプ: `Double`

デフォルト: `0.5`

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

サーバー上のすべてのバックアップにおける最大読み取り速度（バイト毎秒）。ゼロは無制限を意味します。

タイプ: `UInt64`

デフォルト: `0`

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

バックアップIOスレッドプールの**アイドル**スレッドの数が`max_backup_io_thread_pool_free_size`を超えると、ClickHouseはアイドルスレッドが占有しているリソースを解放し、プールサイズを減少させます。スレッドは、必要に応じて再作成されます。

タイプ: `UInt64`

デフォルト: `0`

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

ClickHouseは、S3バックアップIO操作を行うためにバックアップIOスレッドプールからスレッドを使用します。`max_backups_io_thread_pool_size`はプール内のスレッドの最大数を制限します。

タイプ: `UInt64`

デフォルト: `1000`

## max_concurrent_queries {#max_concurrent_queries}

同時に実行されるクエリの総数の制限。`INSERT`および`SELECT`クエリに対する制限、ユーザーごとのクエリの最大数についても考慮する必要があります。

参照:
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings/#max_concurrent_queries_for_all_users)

:::note
値が`0`（デフォルト）は無制限を意味します。

この設定は実行時に変更可能で、すぐに効果を発揮します。すでに実行中のクエリは変更されません。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_concurrent_insert_queries {#max_concurrent_insert_queries}

同時に実行される挿入クエリの総数の制限。

:::note
値が`0`（デフォルト）は無制限を意味します。

この設定は実行時に変更可能で、すぐに効果を発揮します。すでに実行中のクエリは変更されません。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_concurrent_select_queries {#max_concurrent_select_queries}

同時に実行される選択クエリの総数の制限。

:::note
値が`0`（デフォルト）は無制限を意味します。

この設定は実行時に変更可能で、すぐに効果を発揮します。すでに実行中のクエリは変更されません。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_waiting_queries {#max_waiting_queries}

同時に待機しているクエリの総数の制限。
待機中のクエリは、必要なテーブルが非同期で読み込まれている間は実行がブロックされます（[`async_load_databases`](#async_load_databases)を参照）。

:::note
待機中のクエリは、以下の設定によって制御される制限にカウントされません：

- [`max_concurrent_queries`](#max_concurrent_queries)
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

この調整は、サーバーの起動直後にこれらの制限に達しないように行われます。
:::

:::note
値が`0`（デフォルト）は無制限を意味します。

この設定は実行時に変更可能で、すぐに効果を発揮します。すでに実行中のクエリは変更されません。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_connections {#max_connections}

最大サーバー接続数。

タイプ: `Int32`

デフォルト: `1024`

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

IOスレッドプールの**アイドル**スレッド数が`max_io_thread_pool_free_size`を超えると、ClickHouseはアイドルスレッドが占有しているリソースを解放し、プールサイズを減少させます。スレッドは、必要に応じて再作成されます。

タイプ: `UInt64`

デフォルト: `0`

## max_io_thread_pool_size {#max_io_thread_pool_size}

ClickHouseは、S3との操作などのIO操作を行うためにIOスレッドプールからスレッドを使用します。`max_io_thread_pool_size`はプール内のスレッドの最大数を制限します。

タイプ: `UInt64`

デフォルト: `100`

## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

ローカル読み取りの最大速度（バイト毎秒）。

:::note
値が`0`は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

ローカル書き込みの最大速度（バイト毎秒）。

:::note
値が`0`は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_partition_size_to_drop {#max_partition_size_to_drop}

パーティション削除の制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのサイズが[`max_partition_size_to_drop`](#max_partition_size_to_drop)（バイト単位）を超える場合、[DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart)クエリを使用してパーティションを削除することはできません。
この設定は、ClickHouseサーバーを再起動せずに適用することができます。制限を無効にする別の方法は、`<clickhouse-path>/flags/force_drop_table`というファイルを作成することです。

:::note
値`0`は、制限なしでパーティションを削除できることを意味します。

この制限は、テーブルの削除やトランケートには影響しません。`max_table_size_to_drop`を参照してください。
:::

**例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```

タイプ: `UInt64`

デフォルト: `50`

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

読み取り用のネットワーク上のデータ交換の最大速度（バイト毎秒）。

:::note
値が`0`（デフォルト）は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

書き込み用のネットワーク上のデータ交換の最大速度（バイト毎秒）。

:::note
値が`0`（デフォルト）は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_server_memory_usage {#max_server_memory_usage}

メモリ使用の制限。
デフォルトの[`max_server_memory_usage`](#max_server_memory_usage)値は、`memory_amount * max_server_memory_usage_to_ram_ratio`として計算されます。

:::note
値が`0`（デフォルト）は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

[`max_server_memory_usage`](#max_server_memory_usage)と同様ですが、物理RAMに対する比率で設定します。メモリの少ないシステムではメモリ使用量を下げることができます。

RAMとスワップが少ないホストでは、[`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio)を1より大きく設定する必要があります。

:::note
値が`0`は無制限を意味します。
:::

タイプ: `Double`

デフォルト: `0.9`

## max_build_vector_similarity_index_thread_pool_size {#server_configuration_parameters_max_build_vector_similarity_index_thread_pool_size}

ベクトルインデックスを構築するために使用される最大スレッド数。

:::note
値が`0`はすべてのコアを意味します。
:::

タイプ: `UInt64`

デフォルト: `16`

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

サーバーの最大メモリ消費量がcgroupsの対応する閾値によって調整される間のインターバル（秒単位）。

cgroupオブザーバーを無効にするには、この値を`0`に設定します。

設定を参照：
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio) 

タイプ: `UInt64`

デフォルト: `15`

## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio}

cgroupsに従ったサーバープロセスのメモリ消費の「ハード」閾値を指定します。この閾値を超えると、サーバーの最大メモリ消費はその閾値に調整されます。

設定を参照：
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio)

タイプ: `Double`

デフォルト: `0.95`

## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio}

cgroupsに従ったサーバープロセスのメモリ消費の「ソフト」閾値を指定します。この閾値を超えるとjemalloc内のアリーナが消去されます。

設定を参照：
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroup_memory_watcher_hard_limit_ratio)

タイプ: `Double`

デフォルト: `0.9`

## max_database_num_to_warn {#max_database_num_to_warn}

アタッチされたデータベースの数が指定された値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

デフォルト: `1000`

## max_table_num_to_warn {#max_table_num_to_warn}

アタッチされたテーブルの数が指定された値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

デフォルト: `5000`

## max_view_num_to_warn {#max_view_num_to_warn}

アタッチされたビューの数が指定された値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

タイプ: `UInt64`

デフォルト: `10000`

## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

アタッチされた辞書の数が指定された値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

タイプ: `UInt64`

デフォルト: `1000`

## max_part_num_to_warn {#max_part_num_to_warn}

アクティブなパーツの数が指定された値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

タイプ: `UInt64`

デフォルト: `100000`

## max_table_num_to_throw {#max_table_num_to_throw}

テーブルの数がこの値を超えると、サーバーは例外をスローします。

以下のテーブルはカウントされません：
- ビュー
- リモート
- 辞書
- システム

データベースエンジンのテーブルのみカウントされます。
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が`0`は制限なしを意味します。
:::

**例**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```

タイプ: `UInt64`

デフォルト: `0`

## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

レプリケートされたテーブルの数がこの値を超えると、サーバーは例外をスローします。

データベースエンジンのテーブルのみカウントされます。
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が`0`は制限なしを意味します。
:::

**例**
```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```

タイプ: `UInt64`

デフォルト: `0`

## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

辞書の数がこの値を超えると、サーバーは例外をスローします。

データベースエンジンのテーブルのみカウントされます。
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が`0`は制限なしを意味します。
:::

**例**
```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```

タイプ: `UInt64`

デフォルト: `0`

## max_view_num_to_throw {#max_view_num_to_throw}

ビューの数がこの値を超えると、サーバーは例外をスローします。

データベースエンジンのテーブルのみカウントされます。
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が`0`は制限なしを意味します。
:::

**例**
```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```

タイプ: `UInt64`

デフォルト: `0`

## max_database_num_to_throw {#max-table-num-to-throw}

データベースの数がこの値を超えると、サーバーは例外をスローします。

:::note
値が`0`（デフォルト）は無制限を意味します。
:::

**例**

```xml
<max_database_num_to_throw>400</max_database_num_to_throw>
```

タイプ: `UInt64`

デフォルト: `0`

## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

外部集約、ジョイン、またはソートのために使用されるストレージの最大量。
この制限を超えるクエリは例外で失敗します。

:::note
値が`0`は無制限を意味します。
:::

参照:
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

タイプ: `UInt64`

デフォルト: `0`

## max_thread_pool_free_size {#max_thread_pool_free_size}

グローバルスレッドプールの**アイドル**スレッド数が[`max_thread_pool_free_size`](#max_thread_pool_free_size)を超えると、ClickHouseは一部のスレッドが占有しているリソースを解放し、プールサイズが減少します。スレッドは必要に応じて再作成されます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

タイプ: `UInt64`

デフォルト: `0`

## max_thread_pool_size {#max_thread_pool_size}

ClickHouseはクエリを処理するためにグローバルスレッドプールからスレッドを使用します。クエリを処理するためのアイドルスレッドがない場合、プール内に新しいスレッドが作成されます。`max_thread_pool_size`はプール内のスレッドの最大数を制限します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

タイプ: `UInt64`

デフォルト: `10000`

## mmap_cache_size {#mmap_cache_size}

マップされたファイルのためのキャッシュサイズ（バイト単位）を設定します。この設定により、頻繁なオープン/クローズ呼び出し（これはページフォールトのため非常に高価）を避け、複数のスレッドとクエリからのマッピングを再利用できます。設定値はマップされた領域の数（通常はマップされたファイルの数に等しい）。

マップされたファイル内のデータ量は、次のシステムテーブルで次のメトリクスを監視することができます。

| システムテーブル                                                                                                                                                                                                                                                                                                                                                       | メトリクス                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) および [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                              | `MMappedFiles` および `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                     | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)  | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |
```

```html
マッピングされたファイル内のデータ量は、メモリを直接消費せず、クエリやサーバーのメモリ使用量には計上されません。これは、このメモリがOSページキャッシュと同様に破棄可能だからです。キャッシュは、MergeTreeファミリーのテーブル内の古いパーツが削除されると自動的にドロップされ（ファイルが閉じられ）、また、`SYSTEM DROP MMAP CACHE`クエリによって手動でもドロップできます。

この設定は実行時に変更可能で、即座に適用されます。
:::

タイプ: `UInt64`

デフォルト: `1000`

## restore_threads {#restore_threads}

RESTOREリクエストを実行するためのスレッドの最大数。

タイプ: `UInt64`

デフォルト: `16`

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

これがtrueに設定されている場合、スタックトレースにアドレスを表示します。

タイプ: `Bool`

デフォルト: `1`

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

trueに設定されている場合、ClickHouseはシャットダウン前に実行中のクエリの完了を待ちます。

タイプ: `Bool`

デフォルト: `0`

## table_engines_require_grant {#table_engines_require_grant}

trueに設定されている場合、ユーザーは特定のエンジンでテーブルを作成するための権限が必要です。例: `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
デフォルトでは、互換性のために特定のテーブルエンジンでのテーブル作成は権限を無視しますが、これをtrueに設定することでこの動作を変更できます。
:::

タイプ: `Bool`

デフォルト: `false`

## temporary_data_in_cache {#temporary_data_in_cache}

このオプションにより、一時データが特定のディスクのキャッシュに保存されます。
このセクションでは、`cache`タイプのディスク名を指定する必要があります。
その場合、キャッシュと一時データが同じスペースを共有し、ディスクキャッシュは一時データを作成するために追い出される可能性があります。

:::note
一時データストレージを構成するために使用できるオプションは1つのみです: `tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
:::

**例**

`local_disk`のキャッシュと一時データは、ファイルシステム上の`/tiny_local_cache`に保存され、`tiny_local_cache`によって管理されます。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <local_disk>
                <type>local</type>
                <path>/local_disk/</path>
            </local_disk>

            <!-- highlight-start -->
            <tiny_local_cache>
                <type>cache</type>
                <disk>local_disk</disk>
                <path>/tiny_local_cache/</path>
                <max_size_rows>10M</max_size_rows>
                <max_file_segment_size>1M</max_file_segment_size>
                <cache_on_write_operations>1</cache_on_write_operations>
            </tiny_local_cache>
            <!-- highlight-end -->
        </disks>
    </storage_configuration>

    <!-- highlight-start -->
    <temporary_data_in_cache>tiny_local_cache</temporary_data_in_cache>
    <!-- highlight-end -->
</clickhouse>
```

タイプ: `String`

デフォルト: ""

## thread_pool_queue_size {#thread_pool_queue_size}

グローバルスレッドプールでスケジュール可能なジョブの最大数。キューサイズを増やすと、メモリ使用量が増加します。これは[`max_thread_pool_size`](#max_thread_pool_size)と同じ値を維持することが推奨されます。

:::note
値が`0`の場合は無制限を意味します。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

タイプ: `UInt64`

デフォルト: `10000`

## tmp_policy {#tmp_policy}

一時データのストレージポリシーについて。詳細については、[MergeTreeテーブルエンジン](/engines/table-engines/mergetree-family/mergetree)のドキュメントを参照してください。

:::note
- 一時データストレージを構成するために使用できるオプションは1つのみです: `tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
- `move_factor`、`keep_free_space_bytes`、`max_data_part_size_bytes`は無視されます。
- ポリシーには、正確に*1つのボリューム*と*ローカル*ディスクが必要です。
:::

**例**

`/disk1`が満杯のとき、一時データは`/disk2`に保存されます。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <disk1>
                <path>/disk1/</path>
            </disk1>
            <disk2>
                <path>/disk2/</path>
            </disk2>
        </disks>

        <policies>
            <!-- highlight-start -->
            <tmp_two_disks>
                <volumes>
                    <main>
                        <disk>disk1</disk>
                        <disk>disk2</disk>
                    </main>
                </volumes>
            </tmp_two_disks>
            <!-- highlight-end -->
        </policies>
    </storage_configuration>

    <!-- highlight-start -->
    <tmp_policy>tmp_two_disks</tmp_policy>
    <!-- highlight-end -->
</clickhouse>
```
タイプ: `String`

デフォルト: ""

## uncompressed_cache_policy {#uncompressed_cache_policy}

非圧縮キャッシュポリシー名。

タイプ: `String`

デフォルト: `SLRU`

## uncompressed_cache_size {#uncompressed_cache_size}

MergeTreeファミリーのテーブルエンジンに使用される非圧縮データの最大キャッシュサイズ（バイト単位）。

サーバーのための1つの共有キャッシュがあります。メモリは需要に応じて割り当てられます。このオプション`use_uncompressed_cache`が有効になっている場合にキャッシュが使用されます。

非圧縮キャッシュは、特定のケースにおける非常に短いクエリに対して有利です。

:::note
値が`0`の場合は無効になります。

この設定は実行時に変更可能で、即座に適用されます。
:::

タイプ: `UInt64`

デフォルト: `0`

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio}

非圧縮キャッシュの保護されたキューのサイズ（SLRUポリシーの場合）を、キャッシュの総サイズに対して示します。

タイプ: `Double`

デフォルト: `0.5`

## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

組み込み辞書の再読み込みまでの間隔（秒単位）。

ClickHouseは、x秒ごとに組み込み辞書を再読み込みします。これにより、サーバーを再起動せずに辞書を「オンザフライ」で編集可能になります。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

タイプ: `UInt64`

デフォルト: `3600`

## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)エンジンテーブル用のデータ圧縮設定。

:::note
ClickHouseを使い始めたばかりの場合は、これを変更しないことをお勧めします。
:::

**設定テンプレート**:

```xml
<compression>
    <case>
      <min_part_size>...</min_part_size>
      <min_part_size_ratio>...</min_part_size_ratio>
      <method>...</method>
      <level>...</level>
    </case>
    ...
</compression>
```

**`<case>`フィールド**:

- `min_part_size` – データパートの最小サイズ。
- `min_part_size_ratio` – データパートサイズとテーブルサイズの比率。
- `method` – 圧縮方法。許可される値: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`。
- `level` – 圧縮レベル。詳細は[Codecs](../../sql-reference/statements/create/table.md#create-query-general-purpose-codecs)を参照してください。

:::note
複数の`<case>`セクションを構成できます。
:::

**条件が満たされた際のアクション**:

- データパートが条件セットに一致する場合、ClickHouseは指定された圧縮方法を使用します。
- データパートが複数の条件セットに一致する場合、ClickHouseは最初に一致した条件セットを使用します。

:::note
データパートに対して条件が満たされない場合、ClickHouseは`lz4`圧縮を使用します。
:::

**例**

```xml
<compression incl="clickhouse_compression">
    <case>
        <min_part_size>10000000000</min_part_size>
        <min_part_size_ratio>0.01</min_part_size_ratio>
        <method>zstd</method>
        <level>1</level>
    </case>
</compression>
```

## encryption {#encryption}

[暗号化コーデック](../../sql-reference/statements/create/table.md#create-query-encryption-codecs)で使用されるキーを取得するコマンドを構成します。キー（またはキー）は、環境変数に書き込むか、設定ファイルに設定する必要があります。

キーは、長さが16バイトの16進数または文字列であることができます。

**例**

設定からの読み込み:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
設定ファイルにキーを保存することは推奨されません。安全ではありません。キーを安全なディスクの別の設定ファイルに移動し、その設定ファイルへのシンボリックリンクを`config.d/`フォルダーに置くことができます。
:::

設定からの読み込み、キーが16進数の場合:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

環境変数からキーを読み込む:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで`current_key_id`は暗号化のために現在のキーを設定し、指定されたすべてのキーは復号化に使用できます。

これらの方法は複数のキーに適用できます:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで`current_key_id`は暗号化のための現在のキーを示します。

また、ユーザーは12バイト長でなければならないノンスを追加できます（デフォルトでは、暗号化および復号化プロセスはゼロバイトからなるノンスを使用します）:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または16進数で設定することもできます:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上記のすべては`aes_256_gcm_siv`に適用できます（ただし、キーは32バイト長でなければなりません）。
:::

## error_log {#error_log}

デフォルトでは無効です。

**有効化**

エラーヒストリー収集[`system.error_log`](../../operations/system-tables/error_log.md)を手動でオンにするには、次の内容を持つ`/etc/clickhouse-server/config.d/error_log.xml`を作成します。

```xml
<clickhouse>
    <error_log>
        <database>system</database>
        <table>error_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </error_log>
</clickhouse>
```

**無効化**

`error_log`設定を無効にするには、次の内容を持つ`/etc/clickhouse-server/config.d/disable_error_log.xml`というファイルを作成する必要があります。

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## custom_settings_prefixes {#custom_settings_prefixes}

[カスタム設定](../../operations/settings/overview#custom_settings)のプレフィックスのリスト。プレフィックスはカンマで区切る必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**関連情報**

- [カスタム設定](../../operations/settings/overview#custom_settings)

## core_dump {#core_dump}

コアダンプファイルサイズのソフトリミットを設定します。

:::note
ハードリミットはシステムツールを介して設定されます。
:::

**例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

デフォルト: `1073741824`

## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec}

テーブルが削除される間に[`UNDROP`](/sql-reference/statements/undrop.md)ステートメントを使用して復元可能な遅延の時間。この設定のデフォルトは`480`（8分）です。

デフォルト: `480`

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}

`store/`ディレクトリからゴミをクリーンアップするタスクのパラメータ。
ClickHouseサーバーによって使用されていないサブディレクトリがあり、最後の[`database_catalog_unused_dir_hide_timeout_sec`](#database_catalog_unused_dir_hide_timeout_sec)秒間このディレクトリが変更されていない場合、タスクはこのディレクトリを「隠し」、すべてのアクセス権を削除します。このディレクトリはClickHouseサーバーが`store/`内で目にしないと期待します。

:::note
値が`0`の場合は「即座」を意味します。
:::

デフォルト: `3600`（1時間）

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

`store/`ディレクトリからゴミをクリーンアップするタスクのパラメータ。
もしClickHouseサーバーによって使用されなくなったサブディレクトリがあり、以前に「隠されている」（[database_catalog_unused_dir_hide_timeout_sec](#database_catalog_unused_dir_hide_timeout_sec)を参照）場合、最近の[`database_catalog_unused_dir_rm_timeout_sec`](#database_catalog_unused_dir_rm_timeout_sec)秒間そのディレクトリが変更されていないと、タスクはこのディレクトリを削除します。このディレクトリはClickHouseサーバーが`store/`内で目にしないと期待します。

:::note
値が`0`の場合は「決して」を意味します。デフォルト値は30日間に対応します。
:::

デフォルト: `2592000`（30日）。

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

テーブル削除に失敗した場合、ClickHouseはこのタイムアウト時間、オペレーションを再試行する前に待機します。

タイプ: [`UInt64`](../../sql-reference/data-types/int-uint.md)

デフォルト: `5`

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

テーブル削除に使用されるスレッドプールのサイズ。

タイプ: [`UInt64`](../../sql-reference/data-types/int-uint.md)

デフォルト: `16`

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}

`store/`ディレクトリからゴミをクリーンアップするタスクのパラメータ。
タスクのスケジューリング期間を設定します。

:::note
値が`0`の場合は「決して」を意味します。デフォルト値は1日に対応します。
:::

デフォルト: `86400`（1日）。

## default_profile {#default_profile}

デフォルトの設定プロファイル。設定プロファイルは設定`user_config`に指定されたファイルにあります。

**例**

```xml
<default_profile>default</default_profile>
```

## default_replica_path {#default_replica_path}

ZooKeeper内のテーブルへのパス。

**例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```

## default_replica_name {#default_replica_name}

ZooKeeper内のレプリカ名。

**例**

```xml
<default_replica_name>{replica}</default_replica_name>
```

## dictionaries_config {#dictionaries_config}

辞書用設定ファイルへのパス。

パス:

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにはワイルドカード\*と?が含まれることがあります。

関連情報:
- "[辞書](../../sql-reference/dictionaries/index.md)".

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```

## user_defined_executable_functions_config {#user_defined_executable_functions_config}

ユーザー定義関数の実行可能な設定ファイルへのパス。

パス:

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにはワイルドカード\*と?が含まれることがあります。

関連情報:
- "[実行可能ユーザー定義関数](../../sql-reference/functions/overview#executable-user-defined-functions).".

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```

## dictionaries_lazy_load {#dictionaries_lazy_load}

辞書のレイジーロード。

- `true`の場合、各辞書は最初に使用する時にロードされます。ロードに失敗した場合、その辞書を使用していた関数は例外をスローします。
- `false`の場合、サーバは起動時にすべての辞書をロードします。

:::note
サーバは起動時にすべての辞書のロードが完了するまで接続を受け入れないものとします（例外: [`wait_dictionaries_load_at_startup`](#wait_dictionaries_load_at_startup)が`false`に設定されている場合）。
:::

**例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```

## format_schema_path {#format_schema_path}

入力データのスキーマのディレクトリへのパス、[CapnProto](../../interfaces/formats.md#capnproto)形式のスキーマなど。

**例**

```xml
<!-- 様々な入力形式のスキーマファイルを含むディレクトリ。 -->
<format_schema_path>format_schemas/</format_schema_path>
```

## graphite {#graphite}

[Graphite](https://github.com/graphite-project)にデータを送信します。

設定:

- `host` – Graphiteサーバー。
- `port` – Graphiteサーバーのポート。
- `interval` – 送信の時間間隔（秒単位）。
- `timeout` – データ送信のタイムアウト（秒単位）。
- `root_path` – キーのプレフィックス。
- `metrics` – [system.metrics](../../operations/system-tables/metrics.md#system_tables-metrics)テーブルからデータを送信します。
- `events` – [system.events](../../operations/system-tables/events.md#system_tables-events)テーブルからの累積データを一定期間送信します。
- `events_cumulative` – [system.events](../../operations/system-tables/events.md#system_tables-events)テーブルからの累積データを送信します。
- `asynchronous_metrics` – [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md#system_tables-asynchronous_metrics)テーブルからデータを送信します。

複数の`<graphite>`句を構成できます。たとえば、異なるデータを異なる間隔で送信するために使用できます。

**例**

```xml
<graphite>
    <host>localhost</host>
    <port>42000</port>
    <timeout>0.1</timeout>
    <interval>60</interval>
    <root_path>one_min</root_path>
    <metrics>true</metrics>
    <events>true</events>
    <events_cumulative>false</events_cumulative>
    <asynchronous_metrics>true</asynchronous_metrics>
</graphite>
```

## graphite_rollup {#graphite_rollup}

Graphite用のデータを薄めるための設定。

詳細については、[GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)を参照してください。

**例**

```xml
<graphite_rollup_example>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup_example>
```

## google_protos_path {#google_protos_path}

ProtoBufタイプ用のprotoファイルを含むディレクトリを定義します。

例:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```

## http_handlers {#http_handlers}

カスタムHTTPハンドラを使用可能にします。 
新しいHTTPハンドラを追加するには、新しい`<rule>`を追加するだけです。 
ルールは上から下に定義され、最初に一致するものがハンドラを実行します。

次の設定はサブタグで構成できます:

| サブタグ               | 定義                                                                                                    |
|----------------------|---------------------------------------------------------------------------------------------------------|
| `url`                | リクエストのURLと一致させる。`regex:`プレフィックスを使用して正規表現の一致を可選で使用できます。               |
| `methods`            | リクエストメソッドと一致。複数のメソッドの一致をカンマで区切ります（オプション）                           |
| `headers`            | リクエストヘッダーと一致。各子要素（要素名がヘッダー名）で一致させると、`regex:`プレフィックスを使用して正規表現の一致が可能です（オプション） |
| `handler`            | リクエストハンドラ                                                                                     |
| `empty_query_string` | URLにクエリストリングがないことを確認                                                                      |

`handler`には以下の設定があり、サブタグで構成できます:

| サブタグ            | 定義                                                                                                                                                    |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | リダイレクトのための位置                                                                                                                                 |
| `type`             | サポートされるタイプ: static, dynamic_query_handler, predefined_query_handler, redirect                                                                | 
| `status`           | スタティック型と一緒に使用すると、応答ステータスコード                                                                                                      |
| `query_param_name` | dynamic_query_handler型と一緒に使用する場合、HTTPリクエストパラメータに対応する`<query_param_name>`の値を抽出して実行します                                 |
| `query`            | predefined_query_handler型と共に使用する場合、ハンドラが呼ばれたときにクエリを実行します                                                                  |
| `content_type`     | スタティック型とともに使用すると、応答のコンテンツタイプ                                                                                                 |
| `response_content` | スタティック型とともに使用すると、ファイルまたは構成から見つけた内容でクライアントに送信される応答内容「file://」または「config://」プレフィックスを使用     |

ルールのリストに加えて、すべてのデフォルトハンドラを有効にする`<defaults/>`を指定できます。

例:

```xml
<http_handlers>
    <rule>
        <url>/</url>
        <methods>POST,GET</methods>
        <headers><pragma>no-cache</pragma></headers>
        <handler>
            <type>dynamic_query_handler</type>
            <query_param_name>query</query_param_name>
        </handler>
    </rule>

    <rule>
        <url>/predefined_query</url>
        <methods>POST,GET</methods>
        <handler>
            <type>predefined_query_handler</type>
            <query>SELECT * FROM system.settings</query>
        </handler>
    </rule>

    <rule>
        <handler>
            <type>static</type>
            <status>200</status>
            <content_type>text/plain; charset=UTF-8</content_type>
            <response_content>config://http_server_default_response</response_content>
        </handler>
    </rule>
</http_handlers>
```

## http_port/https_port {#http_porthttps_port}

HTTP(S)経由でサーバーに接続するためのポート。

- `https_port`が指定されている場合、[OpenSSL](#openssl)を設定する必要があります。
- `http_port`が指定されている場合、OpenSSLの設定は無視され、設定されていても適用されません。

**例**

```xml
<https_port>9999</https_port>
```

## http_server_default_response {#http_server_default_response}

ClickHouse HTTP(S)サーバーにアクセスしたときにデフォルトで表示されるページ。
デフォルト値は「Ok.」（行末に改行が含まれます）。

**例**

`http://localhost: http_port`にアクセスしたときに`https://tabix.io/`に開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```

## http_options_response {#http_options_response}

`OPTIONS` HTTPリクエストで応答にヘッダーを追加するために使用されます。 
`OPTIONS`メソッドはCORSのプリフライトリクエストで使用されます。

詳細については[OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)を参照してください。

例:

```xml
<http_options_response>
        <header>
            <name>Access-Control-Allow-Origin</name>
            <value>*</value>
        </header>
        <header>
            <name>Access-Control-Allow-Headers</name>
            <value>origin, x-requested-with, x-clickhouse-format, x-clickhouse-user, x-clickhouse-key, Authorization</value>
        </header>
        <header>
            <name>Access-Control-Allow-Methods</name>
            <value>POST, GET, OPTIONS</value>
        </header>
        <header>
            <name>Access-Control-Max-Age</name>
            <value>86400</value>
        </header>
    </http_options_response>
```

## hsts_max_age {#hsts_max_age}

HSTSの有効期限（秒単位）。

:::note
値が`0`の場合、ClickHouseはHSTSを無効にします。正の数値を設定すると、HSTSが有効になり、max-ageは設定した数字になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```

## mlock_executable {#mlock_executable}

起動後に`mlockall`を実行して最初のクエリのレイテンシを低下させ、クリックハウス実行可能ファイルが高いIO負荷下でページアウトされないようにします。

:::note
このオプションを有効にすることを推奨しますが、高速起動時間が数秒増加します。この設定は「CAP_IPC_LOCK」機能がなければ機能しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```

## include_from {#include_from}

置換を含むファイルへのパス。XMLおよびYAML形式がサポートされています。

詳細については、"[設定ファイル](../../operations/configuration-files.md#configuration_files)"節を参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```

## interserver_listen_host {#interserver_listen_host}

ClickHouseサーバー間でデータを交換できるホストに関する制限。
Keeperが使用される場合、異なるKeeperインスタンス間の通信にも同じ制限が適用されます。

:::note
デフォルトでは、その値は[`listen_host`](#listen_host)設定と等しくなります。
:::

**例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

タイプ:

デフォルト:

## interserver_http_port {#interserver_http_port}

ClickHouseサーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```

## interserver_http_host {#interserver_http_host}

他のサーバーがこのサーバーにアクセスするために使用できるホスト名。

省略された場合、これは`hostname -f`コマンドと同じように定義されます。

特定のネットワークインターフェースから解除するのに便利です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```

## interserver_https_port {#interserver_https_port}

`HTTPS`経由でClickHouseサーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```

## interserver_https_host {#interserver_https_host}

[`interserver_http_host`](#interserver_http_host)に似ていますが、このホスト名は他のサーバーが`HTTPS`経由でこのサーバーにアクセスするために使用できます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```

## interserver_http_credentials {#interserver_http_credentials}

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)中に他のサーバーに接続するために使用されるユーザー名とパスワード。加えて、サーバーはこれらの資格情報を使用して他のレプリカを認証します。したがって、`interserver_http_credentials`はクラスタ内のすべてのレプリカで同じでなければなりません。

:::note
- デフォルトでは、`interserver_http_credentials`セクションが省略されている場合、レプリケーション中の認証は使用されません。
- `interserver_http_credentials`設定は、ClickHouseクライアントの資格情報[構成](../../interfaces/cli.md#configuration_files)に関連しません。
- これらの資格情報は、HTTPおよびHTTPS経由のレプリケーションの両方に共通です。
:::

次の設定はサブタグで構成できます:

- `user` — ユーザー名。
- `password` — パスワード。
- `allow_empty` — `true`の場合、他のレプリカは認証なしで接続することを許可されます。`false`の場合、認証なしの接続は拒否されます。デフォルト: `false`。
- `old` — 資格情報のローテーション中に使用される古い`user`および`password`を含みます。複数の`old`セクションを指定できます。

**資格情報のローテーション**

ClickHouseは、すべてのレプリカを同時に停止せずに動的なインターレプリサーバー資格情報のローテーションをサポートします。資格情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty`を`true`に設定し、資格情報を追加します。これにより、認証ありおよびなしの接続が許可されます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカを設定した後、`allow_empty`を`false`に設定するか、この設定を削除します。これにより、新しい資格情報での認証が必須になります。

既存の資格情報を変更するには、ユーザー名とパスワードを`interserver_http_credentials.old`セクションに移動し、`user`と`password`を新しい値で更新します。この時点で、サーバーは新しい資格情報を使用して他のレプリカに接続し、新しい資格情報と古い資格情報の両方で接続を受け入れます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>222</password>
    <old>
        <user>admin</user>
        <password>111</password>
    </old>
    <old>
        <user>temp</user>
        <password>000</password>
    </old>
</interserver_http_credentials>
```

新しい資格情報がすべてのレプリカに適用されたとき、古い資格情報を削除することができます。

## keep_alive_timeout {#keep_alive_timeout}

ClickHouseが接続を閉じる前に待機する秒数。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```

## max_keep_alive_requests {#max_keep_alive_requests}

ClickHouseサーバーによって閉じられるまでの単一のキープアライブ接続を通じて許可される最大リクエスト数。

**例**

```xml
```
```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```

## ldap_servers {#ldap_servers}

接続パラメータを持つLDAPサーバーのリストをここに記載します：
- 'password'の代わりに'ldap'認証メカニズムが指定されている専用ローカルユーザーのための認証者として使用する
- リモートユーザーディレクトリとして使用する。

以下の設定はサブタグで構成できます：

| 設定                            | 説明                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAPサーバーのホスト名またはIP、これは必須のパラメータで、空にすることはできません。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAPサーバーポート、デフォルトは`enable_tls`がtrueの場合は636、そうでなければ`389`です。                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                      | バインドするためのDNを構築するために使用されるテンプレート。結果のDNは、各認証試行の際にテンプレートのすべての`\{user_name\}`部分文字列を実際のユーザー名で置き換えることによって構築されます。                                                                                                                                                                                                                               |
| `user_dn_detection`            | バインドされたユーザーの実際のユーザーDNを検出するためのLDAP検索パラメータを含むセクション。これは、サーバーがActive Directoryの場合のさらなるロールマッピングのための検索フィルターで主に使用されます。結果のユーザーDNは、許可されている場所で`\{user_dn\}`部分文字列を置き換えるために使用されます。デフォルトでは、ユーザーDNはバインドDNと同じに設定されていますが、検索が行われると、実際に検出されたユーザーDNの値で更新されます。 |
| `verification_cooldown`        | 成功したバインド試行の後、ユーザーがLDAPサーバーに接触することなく、すべての連続リクエストのために成功裏に認証されたと見なされる時間の秒数。このキャッシングを無効にして、各認証リクエストのためにLDAPサーバーに連絡することを強制するには`0`（デフォルト）を指定します。                                                                                                                  |
| `enable_tls`                   | LDAPサーバーへのセキュアな接続をトリガーするフラグ。平文のテキスト（`ldap://`）プロトコルには`no`を指定します（推奨しません）。SSL/TLS（`ldaps://`）プロトコルには`yes`を指定します（推奨、デフォルト）。レガシーのStartTLSプロトコル（平文の（`ldap://`）プロトコルをTLSにアップグレード）には`starttls`を指定します。                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLSの最小プロトコルバージョン。受け入れられる値：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（デフォルト）。                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`             | SSL/TLSピア証明書検証動作。受け入れられる値：`never`、`allow`、`try`、`demand`（デフォルト）。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 証明書キーファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | CA証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 許可された暗号スイート（OpenSSL表記）。                                                                                                                                                                                                                                                                                                                                                                                              |

`user_dn_detection`の設定はサブタグで構成できます：

| 設定         | 説明                                                                                                                                                                                                                                                                                                                                    |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP検索のためのベースDNを構築するために使用されるテンプレート。結果のDNは、LDAP検索時にテンプレートのすべての`\{user_name\}`および`\{bind_dn\}`部分文字列を実際のユーザー名とバインドDNで置き換えることによって構築されます。                                                                                                       |
| `scope`         | LDAP検索のスコープ。受け入れられる値：`base`、`one_level`、`children`、`subtree`（デフォルト）。                                                                                                                                                                                                                                       |
| `search_filter` | LDAP検索のための検索フィルターを構築するために使用されるテンプレート。結果のフィルターは、LDAP検索時にテンプレートのすべての`\{user_name\}`、`\{bind_dn\}`、および`\{base_dn\}`部分文字列を実際のユーザー名、バインドDN、ベースDNで置き換えることによって構築されます。特別な文字はXMLで適切にエスケープする必要があります。  |

例:

```xml
<my_ldap_server>
    <host>localhost</host>
    <port>636</port>
    <bind_dn>uid={user_name},ou=users,dc=example,dc=com</bind_dn>
    <verification_cooldown>300</verification_cooldown>
    <enable_tls>yes</enable_tls>
    <tls_minimum_protocol_version>tls1.2</tls_minimum_protocol_version>
    <tls_require_cert>demand</tls_require_cert>
    <tls_cert_file>/path/to/tls_cert_file</tls_cert_file>
    <tls_key_file>/path/to/tls_key_file</tls_key_file>
    <tls_ca_cert_file>/path/to/tls_ca_cert_file</tls_ca_cert_file>
    <tls_ca_cert_dir>/path/to/tls_ca_cert_dir</tls_ca_cert_dir>
    <tls_cipher_suite>ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:AES256-GCM-SHA384</tls_cipher_suite>
</my_ldap_server>
```

例（構成されたユーザーDN検出を持つ典型的なActive Directoryでのさらなるロールマッピングのため）：

```xml
<my_ad_server>
    <host>localhost</host>
    <port>389</port>
    <bind_dn>EXAMPLE\{user_name}</bind_dn>
    <user_dn_detection>
        <base_dn>CN=Users,DC=example,DC=com</base_dn>
        <search_filter>(&amp;(objectClass=user)(sAMAccountName={user_name}))</search_filter>
    </user_dn_detection>
    <enable_tls>no</enable_tls>
</my_ad_server>
```

## listen_host {#listen_host}

リクエストが来ることができるホストの制限。サーバーがすべてのリクエストに応答できるようにするには、`::`を指定します。

例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```

## listen_try {#listen_try}

IPv6またはIPv4ネットワークがない場合でも、サーバーはリスニングを試みて終了しません。

**例**

```xml
<listen_try>0</listen_try>
```

## listen_reuse_port {#listen_reuse_port}

複数のサーバーが同じアドレス:ポートでリスニングすることを許可します。リクエストはオペレーティングシステムによってランダムなサーバーにルーティングされます。この設定を有効にすることは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

タイプ：

デフォルト：

## listen_backlog {#listen_backlog}

リッスンソケットのバックログ（保留中接続のキューサイズ）。デフォルト値の`4096`は、Linuxの[5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)と同じです。

通常、この値は変更する必要はありません。理由は次のとおりです：
- デフォルト値は十分に大きい、
- クライアント接続を受け入れるためにサーバーには別のスレッドがあります。

したがって、たとえ`TcpExtListenOverflows`（`nstat`から）がゼロでない場合、そしてこのカウンターがClickHouseサーバーに対して増加する場合でも、この値を増加させる必要があることを意味しません。理由は以下の通りです：
- 通常、`4096`が不十分であれば、それは何らかの内部的なClickHouseスケーリングの問題を示すため、問題を報告することが優れています。
- サーバーが後でより多くの接続を処理できるかどうかを意味するわけではありません（たとえそうであっても、その時点でクライアントは存在しなくなったり、切断されたりする可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```

## logger {#logger}

ログメッセージの場所と形式。

**キー**:

| キー                       | 説明                                                                                                                                                                         |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | ログレベル。受け入れ可能な値：`none`（ロギングをオフ）、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                                  |
| `log`                     | ログファイルへのパス。                                                                                                                                                           |
| `errorlog`                | エラーログファイルへのパス。                                                                                                                                                     |
| `size`                    | ローテーションポリシー：ログファイルの最大サイズ（バイト単位）。ログファイルサイズがこの閾値を超えた場合、ファイルは名前が変更されアーカイブされ、新しいログファイルが作成されます。                  |
| `count`                   | ローテーションポリシー：ClickHouseが保持する過去のログファイルの最大数。                                                                                                         |
| `stream_compress`         | LZ4を使用してログメッセージを圧縮します。`1`または`true`に設定すると有効になります。                                                                                                                    |
| `console`                 | ログメッセージをログファイルに書き込まず、代わりにコンソールに印刷します。`1`または`true`に設定すると有効になります。ClickHouseがデーモンモードで実行されていない場合はデフォルトは`1`、そうでない場合は`0`。 |
| `console_log_level`       | コンソール出力用のログレベル。デフォルトは`level`。                                                                                                                                  |
| `formatting`              | コンソール出力用のログ形式。現在、`json`のみがサポートされています                                                                                                                  |
| `use_syslog`              | ログ出力をsyslogにも転送します。                                                                                                                                                  |
| `syslog_level`            | syslogへのロギング用のログレベル。                                                                                                                                                    |

**ログ形式の指定子**

`log`および`errorLog`のパス内のファイル名は、結果のファイル名に対する以下の形式指定子をサポートしています（ディレクトリ部分はサポートしていません）。

"例"列は、`2023-07-06 18:32:07`での出力を示します。

| 指定子    | 説明                                                                                                         | 例                      |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | リテラル %                                                                                                           | `%`                        |
| `%n`         | 新しい行文字                                                                                                  |                          |
| `%t`         | 水平タブ文字                                                                                            |                          |
| `%Y`         | 年を10進数で表したもの、例：2017                                                                                 | `2023`                     |
| `%y`         | 年の最後の2桁を10進数で表したもの（範囲 [00,99]）                                                           | `23`                       |
| `%C`         | 年の最初の2桁を10進数で表したもの（範囲 [00,99]）                                                          | `20`                       |
| `%G`         | 4桁の[ISO 8601週ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、すなわち指定された週を含む年。通常は`%V`と共にのみ有用です  | `2023`       |
| `%g`         | [ISO 8601週ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)の最終2桁、すなわち指定された週を含む年。                         | `23`         |
| `%b`         | 短縮された月名、例：Oct（ロケール依存）                                                                 | `Jul`                      |
| `%h`         | %bの同義語                                                                                                       | `Jul`                      |
| `%B`         | 完全な月名、例：October（ロケール依存）                                                                    | `July`                     |
| `%m`         | 月を10進数で表したもの（範囲 [01,12]）                                                                           | `07`                       |
| `%U`         | 年の週を10進数で表したもの（日曜日が週の最初の日）（範囲 [00,53]）                          | `27`                       |
| `%W`         | 年の週を10進数で表したもの（月曜日が週の最初の日）（範囲 [00,53]）                          | `27`                       |
| `%V`         | ISO 8601週番号（範囲 [01,53]）                                                                                | `27`                       |
| `%j`         | 年の日を10進数で表したもの（範囲 [001,366]）                                                               | `187`                      |
| `%d`         | 月の日をゼロパディングされた10進数で表したもの（範囲 [01,31]）。一桁の数字はゼロで前置きされます。                 | `06`                       |
| `%e`         | 月の日をスペースパディングされた10進数で表したもの（範囲 [1,31]）。一桁の数字はスペースで前置きされます。              | `&nbsp; 6`                 |
| `%a`         | 短縮された曜日名、例：Fri（ロケール依存）                                                               | `Thu`                      |
| `%A`         | 完全な曜日名、例：Friday（ロケール依存）                                                                   | `Thursday`                 |
| `%w`         | 曜日を整数値で表したもの（日曜日が0）（範囲 [0-6]）                                                          | `4`                        |
| `%u`         | 曜日を10進数で表したもの、月曜日は1（ISO 8601形式）（範囲 [1-7]）                                      | `4`                        |
| `%H`         | 時間を10進数で表したもの、24時間制（範囲 [00-23]）                                                             | `18`                       |
| `%I`         | 時間を10進数で表したもの、12時間制（範囲 [01,12]）                                                             | `06`                       |
| `%M`         | 分を10進数で表したもの（範囲 [00,59]）                                                                          | `32`                       |
| `%S`         | 秒を10進数で表したもの（範囲 [00,60]）                                                                          | `07`                       |
| `%c`         | 標準の日付と時刻の文字列、例：Sun Oct 17 04:41:13 2010（ロケール依存）                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | ローカライズされた日付表現（ロケール依存）                                                                    | `07/06/23`                 |
| `%X`         | ローカライズされた時刻表現、例：18:40:20または6:40:20 PM（ロケール依存）                                       | `18:32:07`                 |
| `%D`         | 短いMM/DD/YY日付、%m/%d/%yに相当します                                                                         | `07/06/23`                 |
| `%F`         | 短いYYYY-MM-DD日付、%Y-%m-%dに相当します                                                                       | `2023-07-06`               |
| `%r`         | ローカライズされた12時間制の時刻（ロケール依存）                                                                     | `06:32:07 PM`              |
| `%R`         | "%H:%M"に相当します                                                                                               | `18:32`                    |
| `%T`         | "%H:%M:%S"に相当します（ISO 8601時刻形式）                                                                 | `18:32:07`                 |
| `%p`         | ローカライズされたa.m.またはp.m.の指定（ロケール依存）                                                               | `PM`                       |
| `%z`         | ISO 8601形式のUTCからのオフセット（例：-0430）、またはタイムゾーン情報が利用できない場合は文字なし | `+0800`                    |
| `%Z`         | ロケール依存のタイムゾーン名または略称、またはタイムゾーン情報が利用できない場合は文字なし     | `Z AWST `                  |

**例**

```xml
<logger>
    <level>trace</level>
    <log>/var/log/clickhouse-server/clickhouse-server-%F-%T.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server-%F-%T.err.log</errorlog>
    <size>1000M</size>
    <count>10</count>
    <stream_compress>true</stream_compress>
</logger>
```

ログメッセージをコンソールのみに出力するには：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個々のログ名のログレベルをオーバーライドできます。例えば、"Backup"と"RBAC"のロガーからのすべてのメッセージをミュートするには。

```xml
<logger>
    <levels>
        <logger>
            <name>Backup</name>
            <level>none</level>
        </logger>
        <logger>
            <name>RBAC</name>
            <level>none</level>
        </logger>
    </levels>
</logger>
```

**syslog**

ログメッセージをsyslogにも記録するには：

```xml
<logger>
    <use_syslog>1</use_syslog>
    <syslog>
        <address>syslog.remote:10514</address>
        <hostname>myhost.local</hostname>
        <facility>LOG_LOCAL6</facility>
        <format>syslog</format>
    </syslog>
</logger>
```

`<syslog>`のキー：

| キー        | 説明                                                                                                                                                                                                                                                    |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | ホスト形式のsyslogアドレス（`host\[:port\]`）。省略した場合、ローカルデーモンが使用されます。                                                                                                                                                                         |
| `hostname` | ログが送信されるホストの名前（オプション）。                                                                                                                                                                                                      |
| `facility` | syslogの[ファシリティキーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。大文字で"LOG_"プレフィックスを付けて指定する必要があります（例：`LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3`など）。`address`が指定された場合は`LOG_USER`、そうでなければ`LOG_DAEMON`がデフォルトです。                                           |
| `format`   | ログメッセージ形式。可能な値：`bsd`および`syslog`。                                                                                                                                                                                                       |

**ログ形式**

コンソールログに出力されるログ形式を指定できます。現在、JSONのみがサポートされています。

**例**

以下は出力のJSONログの例です：

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "Received signal 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

JSONロギングのサポートを有効にするには、次のスニペットを使用します：

```xml
<logger>
    <formatting>
        <type>json</type>
        <names>
            <date_time>date_time</date_time>
            <thread_name>thread_name</thread_name>
            <thread_id>thread_id</thread_id>
            <level>level</level>
            <query_id>query_id</query_id>
            <logger_name>logger_name</logger_name>
            <message>message</message>
            <source_file>source_file</source_file>
            <source_line>source_line</source_line>
        </names>
    </formatting>
</logger>
```

**JSONログのキー名の変更**

キー名は、`<names>`タグ内のタグ値を変更することで修正できます。例えば、`DATE_TIME`を`MY_DATE_TIME`に変更したい場合は、`<date_time>MY_DATE_TIME</date_time>`を使用します。

**JSONログのキーの省略**

ログプロパティは、プロパティをコメントアウトすることで省略できます。例えば、`query_id`をログに印刷したくない場合は、`<query_id>`タグをコメントアウトできます。

## send_crash_reports {#send_crash_reports}

[セントリー](https://sentry.io)を通じてClickHouseコア開発者チームにクラッシュレポートをオプトイン送信するための設定。

これを有効にすることは、特にプレプロダクション環境では非常に感謝されます。

この機能を正常に機能させるためには、サーバーがIPv4を介してインターネットにアクセスできる必要があります（執筆時点ではSentryはIPv6をサポートしていません）。

キー：

| キー                   | 説明                                                                                                                                                                                            |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | 機能を有効にするためのブールフラグ、デフォルトは`false`。クラッシュレポートの送信を許可するには`true`に設定します。                                                                                                  |
| `send_logical_errors` | `LOGICAL_ERROR`は`assert`のようなもので、ClickHouseのバグです。このブールフラグはこの例外をセントリーに送信することを可能にします（デフォルト：`false`）。                                                        |
| `endpoint`            | クラッシュレポートを送信するためのSentryエンドポイントURLをオーバーライドできます。別のSentryアカウントやセルフホスティングのSentryインスタンスのいずれかにすることができます。[Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk)構文を使用します。                  |
| `anonymize`           | サーバーホスト名をクラッシュレポートに付加するのを避けます。                                                                                                                                               |
| `http_proxy`          | クラッシュレポートを送信するためのHTTPプロキシを設定します。                                                                                                                                                        |
| `debug`               | セントリークライアントをデバッグモードに設定します。                                                                                                                                                                |
| `tmp_path`            | 一時的なクラッシュレポート状態のためのファイルシステムパス。                                                                                                                                                      |
| `environment`         | ClickHouseサーバーが実行されている環境の任意の名前。各クラッシュレポートに記載されます。デフォルト値は`test`または`prod`（ClickHouseのバージョンによります）。 |

**推奨使用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## ssh_server {#ssh_server}

ホストキーの公開部分は、初回接続時にSSHクライアント側のknown_hostsファイルに書き込まれます。

ホストキー設定はデフォルトでは無効です。ホストキー設定のコメントを外し、該当するsshキーへのパスを指定することで有効にします：

例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## tcp_ssh_port {#tcp_ssh_port}

ユーザーが接続し、埋め込まれたクライアントを使用してインタラクティブにクエリを実行できるSSHサーバー用のポート。

例： 

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```

## storage_configuration {#storage_configuration}

ストレージのマルチディスク構成を可能にします。

ストレージ構成は以下の構造に従います：

```xml
<storage_configuration>
    <disks>
        <!-- 構成 -->
    </disks>
    <policies>
        <!-- 構成 -->
    </policies>
```
```html
</storage_configuration>
```

### ディスクの構成 {#configuration-of-disks}

`disks`の構成は、以下の構造に従います：

```xml
<storage_configuration>
    <disks>
        <disk_name_1>
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>
        ...
    </disks>
</storage_configuration>
```

上記のサブタグは`disks`に対する以下の設定を定義します：

| 設定                       | 説明                                                                                                                   |
|---------------------------|------------------------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`           | 一意である必要があるディスクの名前。                                                                                          |
| `path`                    | サーバーデータが保存されるパス（`data`および`shadow`カタログ）。末尾に `/` を付ける必要があります。                      |
| `keep_free_space_bytes`   | ディスク上に予約された空きスペースのサイズ。                                                                                    |

:::note
ディスクの順序は重要ではありません。
:::

### ポリシーの構成 {#configuration-of-policies}

上記のサブタグは`policies`に対する以下の設定を定義します：

| 設定                               | 説明                                                                                                                                                                                                                                                                                                                                                                                                                    |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`                    | ポリシーの名前。ポリシー名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                           |
| `volume_name_N`                    | ボリューム名。ボリューム名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                           |
| `disk`                             | ボリューム内にあるディスク。                                                                                                                                                                                                                                                                                                                                                                                                |
| `max_data_part_size_bytes`         | このボリューム内の任意のディスクに存在できるデータチャンクの最大サイズ。マージの結果、チャンクサイズが`max_data_part_size_bytes`を超えると、チャンクは次のボリュームに書き込まれます。この機能は、新しい/small チャンクをホット（SSD）ボリュームに保存し、十分なサイズに達したらコールド（HDD）ボリュームに移動することを可能にします。ポリシーにボリュームが一つしかない場合は、このオプションを使用しないでください。 |
| `move_factor`                      | ボリュームの空きスペースの比率。スペースが少なくなると、データは次のボリュームに移動し始めます。移動のために、チャンクはサイズが大きい順にソートされ、`move_factor` 条件を満たす十分な合計サイズを持つチャンクが選択されます。すべてのチャンクの合計サイズが不十分な場合、すべてのチャンクが移動します。                                                                                                          |
| `perform_ttl_move_on_insert`       | 挿入時に期限切れのTTLを持つデータの移動を無効にします。デフォルトでは（有効な場合）、TTLの移動ルールに従い期限切れのデータを挿入すると、即座に指定されたボリューム/ディスクに移動されます。ターゲットボリューム/ディスクが遅い場合（例：S3）、挿入が著しく遅くなることがあります。無効にすると、期限切れのデータの一部はデフォルトボリュームに書き込まれ、その後直ちに期限切れのTTLに対して指定されたボリュームに移動されます。                |
| `load_balancing`                   | ディスクのバランシングポリシー。`round_robin` または `least_used`。                                                                                                                                                                                                                                                                                                                                                                 |
| `least_used_ttl_ms`                | すべてのディスクの空きスペースを更新するためのタイムアウト（ミリ秒単位）を設定します（`0` - 常に更新、`-1` - 決して更新しない、デフォルト値は `60000`）。なお、ディスクがClickHouseのみに使用され、ファイルシステムのサイズ変更が行われない場合は、`-1`値を使用できます。他のすべてのケースでは推奨されません。この設定は最終的に不正確なスペース割り当てにつながる可能性があります。                                               |
| `prefer_not_to_merge`              | このボリューム上のデータのマージを無効にします。注意：これは潜在的に有害であり、遅延を引き起こす可能性があります。この設定が有効になっている場合（これは行わないでください）、このボリューム上のデータのマージは禁止されます（これは悪いことです）。これにより、ClickHouseが遅いディスクとどのように相互作用するかを制御できます。私たちはこれを全く使用しないことを推奨します。 |
| `volume_priority`                  | ボリュームが埋められる順序を定義します。値が小さいほど優先度が高くなります。パラメータ値は自然数でなければならず、1からN（Nは指定された最大パラメータ値）までの範囲をカバーし、ギャップがない必要があります。                                                                                                                                                                                       |

`volume_priority`について：
- すべてのボリュームがこのパラメータを持っている場合、指定された順序で優先されます。
- 一部のボリュームのみがこのパラメータを持っている場合、持っていないボリュームは最低の優先度になります。持っているボリュームはタグ値に応じて優先され、残りの優先度は設定ファイル内でお互いに説明される順序によって決まります。
- このパラメータが与えられていないボリュームは、設定ファイル内での記述の順序によってその順序が決まります。
- ボリュームの優先度は同じであってはならない。

## マクロ {#macros}

レプリケートされたテーブルのためのパラメータ置換。

レプリケートされたテーブルが使用されない場合は省略できます。

詳細については、[レプリケートされたテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)セクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```

## レプリカグループ名 {#replica_group_name}

データベースレプリケート用のレプリカグループ名。

レプリケートデータベースによって作成されるクラスタは、同じグループ内のレプリカで構成されます。
DDLクエリは、同じグループ内のレプリカのみに待機します。

デフォルトは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```

タイプ：文字列

デフォルト： ""

## 実行可能ファイルの再割り当て {#remap_executable}

巨大ページを使用して、機械コード（「テキスト」）のメモリを再割り当てする設定。

デフォルト：`false`

:::note
この機能は非常に実験的です。
:::

例： 

```xml
<remap_executable>false</remap_executable>
```

## 最大オープンファイル数 {#max_open_files}

オープンファイルの最大数。

:::note
`getrlimit()`関数が不正確な値を返すため、このオプションはmacOSで使用することを推奨します。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```

## 最大セッションタイムアウト {#max_session_timeout}

最大セッションタイムアウト（秒単位）。

デフォルト：`3600`

例：

```xml
<max_session_timeout>3600</max_session_timeout>
```

## 削除する最大テーブルサイズ {#max_table_size_to_drop}

テーブル削除に対する制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのサイズが`max_table_size_to_drop`（バイト単位）を超える場合、[`DROP`](../../sql-reference/statements/drop.md)クエリや[`TRUNCATE`](../../sql-reference/statements/truncate.md)クエリを使用して削除できません。

:::note
値が`0`の場合は、すべてのテーブルを制限なしに削除できます。

この設定を適用するためにClickHouseサーバーの再起動は必要ありません。制限を無効にする別の方法は、`<clickhouse-path>/flags/force_drop_table`ファイルを作成することです。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

デフォルト：50 GB。

## バックグラウンドプールサイズ {#background_pool_size}

MergeTreeエンジンのテーブルのバックグラウンドマージおよびミューテーションを実行するスレッド数を設定します。

:::note
- この設定は、ClickHouseサーバーの起動時に`default`プロファイル設定からも適用可能で、後方互換性のためです。
- 実行時にのみスレッド数を増加させることができます。
- スレッド数を減少させるには、サーバーを再起動する必要があります。
- この設定を調整することで、CPUおよびディスクの負荷を管理します。
:::

:::danger
小さいプールサイズは、CPUおよびディスクリソースを少なく使用しますが、バックグラウンドプロセスの進行が遅く、最終的にクエリのパフォーマンスに影響を与える可能性があります。
:::

変更する前に、以下の関連するMergeTree設定も確認してください：
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-lower-max-size-of-merge) 。
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-execute-mutation)。

**例**

```xml
<background_pool_size>16</background_pool_size>
```

タイプ：

デフォルト：16。

## マージ・ミューテーションメモリ使用量のソフトリミット {#merges_mutations_memory_usage_soft_limit}

マージおよびミューテーション操作に使用できるRAMの制限を設定します。
ClickHouseが設定された制限に達すると、新しいバックグラウンドマージまたはミューテーション操作はスケジュールされなくなりますが、既にスケジュールされたタスクは実行し続けます。

:::note
値が`0`の場合は無制限です。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```

## マージ・ミューテーションメモリ使用量とRAM比率 {#merges_mutations_memory_usage_to_ram_ratio}

デフォルトの`merges_mutations_memory_usage_soft_limit`値は、`memory_amount * merges_mutations_memory_usage_to_ram_ratio`として計算されます。

**関連項目：**

- [max_memory_usage](../../operations/settings/query-complexity.md#settings_max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](#merges_mutations_memory_usage_soft_limit)

デフォルト：`0.5`。

## 非同期データベースのロード {#async_load_databases}

データベースおよびテーブルの非同期ロード。

- `true`の場合、`Ordinary`、`Atomic`、および `Replicated` エンジンを持つすべての非システムデータベースが、ClickHouseサーバーの起動後に非同期でロードされます。`system.asynchronous_loader` テーブル、`tables_loader_background_pool_size` および `tables_loader_foreground_pool_size` サーバー設定を参照してください。まだロードされていないテーブルにアクセスしようとするクエリは、正確にそのテーブルが起動するまで待機します。ロードジョブが失敗した場合、クエリはエラーを再スローします（`async_load_databases = false` の場合、サーバー全体をシャットダウンする代わりに）。少なくとも1つのクエリに待たれているテーブルは、より高い優先度でロードされます。データベースに対するDDLクエリは、正確にそのデータベースが起動するまで待機します。また、待機クエリの総数に制限を設けるために`max_waiting_queries`を設定することを検討してください。
- `false`の場合、サーバー起動時にすべてのデータベースがロードされます。

**例**

```xml
<async_load_databases>true</async_load_databases>
```

デフォルト：`false`。

## 非同期システムデータベースのロード {#async_load_system_database}

システムテーブルの非同期ロード。`system`データベースに多くのログテーブルとパーツがある場合に便利です。`async_load_databases`設定に依存しません。

- `true`に設定すると、`Ordinary`、`Atomic`、および `Replicated` エンジンを持つすべてのシステムデータベースが、ClickHouseサーバーが起動した後非同期でロードされます。`system.asynchronous_loader` テーブル、`tables_loader_background_pool_size` および `tables_loader_foreground_pool_size` サーバー設定を参照してください。まだロードされていないシステムテーブルにアクセスしようとするクエリは、正確にそのテーブルが起動するまで待機します。少なくとも1つのクエリによって待たれているテーブルは、より高い優先度でロードされます。また、待機クエリの総数を制限するために`max_waiting_queries`設定を設定することを検討してください。
- `false`に設定すると、サーバー起動前にシステムデータベースがロードされます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
```

デフォルト：`false`。

## テーブルローダー前景プールサイズ {#tables_loader_foreground_pool_size}

前景プールでロードジョブを実行するスレッド数を設定します。前景プールは、サーバーがポートでリスニングを開始する前にテーブルを同期的にロードするためや、待機しているテーブルをロードするために使用されます。前景プールはバックグラウンドプールよりも優先度が高いです。つまり、前景プールで実行されている作業がある間、バックグラウンドプールでの作業は開始されません。

:::note
値が`0`の場合は、すべてのCPUが使用されます。
:::

デフォルト：`0`

## テーブルローダー背景プールサイズ {#tables_loader_background_pool_size}

バックグラウンドプールで非同期ロードジョブを実行するスレッド数を設定します。バックグラウンドプールは、サーバー起動後に非同期でテーブルをロードするために使用されます。テーブルを待機しているクエリがない場合に使用されます。テーブルがたくさんある場合は、バックグラウンドプールのスレッド数を少なく保つことが有益です。これにより、同時クエリ実行のためのCPUリソースが予約されます。

:::note
値が`0`の場合は、すべてのCPUが使用されます。
:::

デフォルト：`0`

## マージツリー {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルの微調整。

詳細については、MergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## メトリックログ {#metric_log}

デフォルトでは無効です。

**有効化**

メトリック履歴の収集を手動でオンにするために、[`system.metric_log`](../../operations/system-tables/metric_log.md)を有効にするには、次の内容で`/etc/clickhouse-server/config.d/metric_log.xml`を作成します：

```xml
<clickhouse>
    <metric_log>
        <database>system</database>
        <table>metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </metric_log>
</clickhouse>
```

**無効化**

`metric_log`設定を無効にするためには、次の内容で`/etc/clickhouse-server/config.d/disable_metric_log.xml`を作成する必要があります：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## レイテンシログ {#latency_log}

デフォルトでは無効です。

**有効化**

レイテンシ履歴の収集を手動でオンにするには、[`system.latency_log`](../../operations/system-tables/latency_log.md)を有効にするため、次の内容で`/etc/clickhouse-server/config.d/latency_log.xml`を作成します：

``` xml
<clickhouse>
    <latency_log>
        <database>system</database>
        <table>latency_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </latency_log>
</clickhouse>
```

**無効化**

`latency_log`設定を無効にするためには、次の内容で`/etc/clickhouse-server/config.d/disable_latency_log.xml`を作成する必要があります：

``` xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```

## レプリケーショントゥリー {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルの微調整。この設定は優先度が高くなります。

詳細については、MergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```

## OpenTelemetryスパンログ {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md)システムテーブルの設定。

<SystemLogParameters/>

例：

```xml
<opentelemetry_span_log>
    <engine>
        engine MergeTree
        partition by toYYYYMM(finish_date)
        order by (finish_date, finish_time_us, trace_id)
    </engine>
    <database>system</database>
    <table>opentelemetry_span_log</table>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>    
</opentelemetry_span_log>
```

## OpenSSL {#openssl}

SSLクライアント/サーバー設定。

SSLのサポートは`libpoco`ライブラリによって提供されます。使用可能な構成オプションは[SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)に説明されています。デフォルト値は[SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp)で見つけることができます。

サーバー/クライアント設定のためのキー：

| オプション                         | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                 | 初期値                                     |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`                  | PEM証明書の秘密鍵を含むファイルのパス。このファイルには、鍵と証明書の両方を含めることができます。                                                                                                                                                                                                                                                                                                                                |                                            |
| `certificateFile`                 | PEM形式のクライアント/サーバー証明書ファイルのパス。`privateKeyFile`に識別証明書が含まれている場合は、省略できます。                                                                                                                                                                                                                                                                                                              |                                            |
| `caConfig`                        | 信頼されたCA証明書を含むファイルまたはディレクトリのパス。これがファイルの場合、PEM形式で、複数のCA証明書を含むことができます。これがディレクトリの場合、それぞれのCA証明書に対して1つの.pemファイルを含む必要があります。ファイル名はCAのサブジェクト名ハッシュ値によって検索されます。[SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html)のマニュアルページに詳細があります。          |                                            |
| `verificationMode`                | ノードの証明書を確認するための方法。詳細は[Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h)クラスの説明を参照してください。考えられる値：`none`、`relaxed`、`strict`、`once`。                                                                                                                                                                      | `relaxed`                                  |
| `verificationDepth`               | 検証チェーンの最大長。設定された値を超えると、証明書チェーンの長さが検証に失敗します。                                                                                                                                                                                                                                                                                                                                                       | `9`                                        |
| `loadDefaultCAFile`               | OpenSSLのために組み込みCA証明書が使用されるかどうか。ClickHouseは、組み込みCA証明書が`/etc/ssl/cert.pem`（または`/etc/ssl/certs`のディレクトリ）または環境変数`SSL_CERT_FILE`（または`SSL_CERT_DIR`）によって指定されたファイル（またはディレクトリ）にあると仮定します。                                                                                        | `true`                                     |
| `cipherList`                      | サポートされているOpenSSLの暗号化方式。                                                                                                                                                                                                                                                                                                                                                                                                             | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`                   | セッションのキャッシュを有効または無効にします。`sessionIdContext`と組み合わせて使用する必要があります。受け入れ可能な値：`true`、`false`。                                                                                                                                                                                                                                                                                                | `false`                                    |
| `sessionIdContext`                | サーバーが生成した各識別子に付加されるランダムな文字のユニークなセット。文字列の長さは`SSL_MAX_SSL_SESSION_ID_LENGTH`を超えてはなりません。このパラメータは必ず使用されることを推奨し、サーバーがセッションをキャッシュする場合でも、クライアントがキャッシュを要求する場合でも問題を回避するのに役立ちます。                                                                                         | `$\{application.name\}`                      |
| `sessionCacheSize`                | サーバーがキャッシュするセッションの最大数。`0`の値は無制限のセッションを意味します。                                                                                                                                                                                                                                                                                                                                                     | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)       |
| `sessionTimeout`                  | サーバー上でのセッションのキャッシングの時間（時間単位）。                                                                                                                                                                                                                                                                                                                                                                                              | `2`                                        |
| `extendedVerification`            | 有効にすると、証明書CNまたはSANがピアのホスト名と一致することを確認します。                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                    |
| `requireTLSv1`                    | TLSv1接続を必須とする。受け入れ可能な値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                                | `false`                                    |
| `requireTLSv1_1`                  | TLSv1.1接続を必須とする。受け入れ可能な値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                                | `false`                                    |
| `requireTLSv1_2`                  | TLSv1.2接続を必須とする。受け入れ可能な値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                                | `false`                                    |
| `fips`                            | OpenSSLのFIPSモードを有効にします。ライブラリのOpenSSLバージョンがFIPSをサポートしている場合、これがサポートされます。                                                                                                                                                                                                                                                                                                                                                                                                             | `false`                                    |
```
```markdown
| `privateKeyPassphraseHandler` | プライベートキーにアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandlerのサブクラス）。例えば：`<privateKeyPassphraseHandler>`、`<name>KeyFileHandler</name>`、`<options><password>test</password></options>`、`</privateKeyPassphraseHandler>`。                                                                                                                                                                                       | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するためのクラス（CertificateHandlerのサブクラス）。例えば：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` 。                                                                                                                                                                                                                                                                                                        | `RejectCertificateHandler`                 |
| `disableProtocols`            | 使用が許可されていないプロトコル。                                                                                                                                                                                                                                                                                                                                                                                                                                          |                                            |
| `preferServerCiphers`         | クライアントが優先するサーバー暗号方式。                                                                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |

**設定の例:**

```xml
<openSSL>
    <server>
        <!-- openssl req -subj "/CN=localhost" -new -newkey rsa:2048 -days 365 -nodes -x509 -keyout /etc/clickhouse-server/server.key -out /etc/clickhouse-server/server.crt -->
        <certificateFile>/etc/clickhouse-server/server.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/server.key</privateKeyFile>
        <!-- openssl dhparam -out /etc/clickhouse-server/dhparam.pem 4096 -->
        <dhParamsFile>/etc/clickhouse-server/dhparam.pem</dhParamsFile>
        <verificationMode>none</verificationMode>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
    </server>
    <client>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
        <!-- 自己署名用： <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 自己署名用： <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```

## part_log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)に関連するイベントをログ記録します。例えば、データの追加やマージなど。ログを利用してマージアルゴリズムをシミュレーションし、それらの特性を比較できます。マージプロセスを視覚化することも可能です。

クエリは[system.part_log](../../operations/system-tables/part_log.md#system_tables-part-log)テーブルに記録され、別のファイルには記録されません。このテーブルの名前は`table`パラメータで設定できます（下記参照）。

<SystemLogParameters/>

**例**

``` xml
<part_log>
    <database>system</database>
    <table>part_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</part_log>
```

## path {#path}

データを含むディレクトリへのパス。

:::note
末尾のスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
```
## processors_profile_log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md)システムテーブルの設定。

<SystemLogParameters/>

デフォルトの設定は次のとおりです：

```xml
<processors_profile_log>
    <database>system</database>
    <table>processors_profile_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</processors_profile_log>
```

## Prometheus {#prometheus}

[Prometheus](https://prometheus.io)からデータを収集するためのメトリックスデータを公開します。

設定:

- `endpoint` – prometheusサーバーによるメトリックス収集のためのHTTPエンドポイント。`/`から始まります。
- `port` – `endpoint`のポート。
- `metrics` – [system.metrics](../../operations/system-tables/metrics.md#system_tables-metrics)テーブルからのメトリックスを公開します。
- `events` – [system.events](../../operations/system-tables/events.md#system_tables-events)テーブルからのメトリックスを公開します。
- `asynchronous_metrics` – [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md#system_tables-asynchronous_metrics)テーブルからの現在のメトリックス値を公開します。
- `errors` – 最後のサーバー再起動以降に発生したエラーコードによるエラーの数を公開します。この情報はまた[system.errors](../../operations/system-tables/asynchronous_metrics.md#system_tables-errors)からも得ることができます。

**例**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
        <errors>true</errors>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

チェック（`127.0.0.1`をClickHouseサーバーのIPアドレスまたはホスト名に置き換えてください）：
```bash
curl 127.0.0.1:9363/metrics
```

## query_log {#query-log}

[log_queries=1](../../operations/settings/settings.md)設定で受信したクエリをログ記録するための設定。

クエリは[system.query_log](../../operations/system-tables/query_log.md#system_tables-query_log)テーブルに記録され、別のファイルには記録されません。このテーブルの名前は`table`パラメータで変更できます（下記参照）。

<SystemLogParameters/>

もしテーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバーが更新された際にクエリログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

**例**

```xml
<query_log>
    <database>system</database>
    <table>query_log</table>
    <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_log>
```

# query_metric_log

デフォルトでは無効になっています。

**有効化**

メトリックス履歴収集を手動でオンにするためには、 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)を有効化し、以下の内容を持つ`/etc/clickhouse-server/config.d/query_metric_log.xml`を作成します：

```xml
<clickhouse>
    <query_metric_log>
        <database>system</database>
        <table>query_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_metric_log>
</clickhouse>
```

**無効化**

`query_metric_log`を無効にするには、以下の内容を持つ`/etc/clickhouse-server/config.d/disable_query_metric_log.xml`というファイルを作成する必要があります。

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## query_cache {#query_cache}

[クエリキャッシュ](../query-cache.md)の構成。

利用可能な設定は以下の通りです：

| 設定                       | 説明                                                                                   | デフォルト値       |
|---------------------------|----------------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | キャッシュの最大サイズ（バイト）。`0`はクエリキャッシュが無効であることを意味します。             | `1073741824`  |
| `max_entries`             | キャッシュ内に保存できる`SELECT`クエリ結果の最大数。                                      | `1024`        |
| `max_entry_size_in_bytes` | 保存される`SELECT`クエリ結果の最大サイズ（バイト）。                                       | `1048576`     |
| `max_entry_size_in_rows`  | 保存される`SELECT`クエリ結果の最大行数。                                              | `30000000`    |

:::note
- 設定を変更すると直ちに反映されます。
- クエリキャッシュのデータはDRAMに割り当てられます。メモリが不足している場合は、`max_size_in_bytes`に小さい値を設定するか、クエリキャッシュを完全に無効にしてください。
:::

**例**

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

## query_thread_log {#query_thread_log}

[log_query_threads=1](../../operations/settings/settings.md#log-query-threads)設定で受信したクエリのスレッドをログ記録するための設定。

クエリは[system.query_thread_log](../../operations/system-tables/query_thread_log.md#system_tables-query_thread_log)テーブルに記録され、別のファイルには記録されません。このテーブルの名前は`table`パラメータで変更できます（下記参照）。

<SystemLogParameters/>

もしテーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバーが更新された際にクエリスレッドログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

**例**

```xml
<query_thread_log>
    <database>system</database>
    <table>query_thread_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_thread_log>
```

## query_views_log {#query_views_log}

[log_query_views=1](../../operations/settings/settings.md#log-query-views)設定で受信したクエリに依存するビュー（ライブ、マテリアライズドなど）のログ記録の設定。

クエリは[system.query_views_log](../../operations/system-tables/query_views_log.md#system_tables-query_views_log)テーブルに記録され、別のファイルには記録されません。このテーブルの名前は`table`パラメータで変更できます（下記参照）。

<SystemLogParameters/>

もしテーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバーが更新された際にクエリビューのログ構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

**例**

```xml
<query_views_log>
    <database>system</database>
    <table>query_views_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_views_log>
```

## text_log {#text_log}

テキストメッセージのログ記録用に[system.text_log](../../operations/system-tables/text_log.md#system_tables-text_log)システムテーブルの設定。

<SystemLogParameters/>

追加設定：

| 設定   | 説明                                                                                                                                                                                  | デフォルト値     |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| `level` | テーブルに保存される最大メッセージレベル（デフォルトは`Trace`）。                                                                                                               | `Trace`          |

**例**

```xml
<clickhouse>
    <text_log>
        <level>notice</level>
        <database>system</database>
        <table>text_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <partition_by>event_date</partition_by> -->
        <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    </text_log>
</clickhouse>
```

## trace_log {#trace_log}

[trace_log](../../operations/system-tables/trace_log.md#system_tables-trace_log)システムテーブルの操作の設定。

<SystemLogParameters/>

デフォルトのサーバー構成ファイル`config.xml`には以下の設定セクションが含まれています：

```xml
<trace_log>
    <database>system</database>
    <table>trace_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <symbolize>false</symbolize>
</trace_log>
```

## asynchronous_insert_log {#asynchronous_insert_log}

[asynchronous_insert_log](../../operations/system-tables/asynchronous_insert_log.md#system_tables-asynchronous_insert_log)システムテーブルの非同期挿入のログ記録の設定。

<SystemLogParameters/>

**例**

```xml
<clickhouse>
    <asynchronous_insert_log>
        <database>system</database>
        <table>asynchronous_insert_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </asynchronous_insert_log>
</clickhouse>
```

## crash_log {#crash_log}

[crash_log](../../operations/system-tables/crash-log.md)システムテーブル操作の設定。

<SystemLogParameters/>

デフォルトのサーバー構成ファイル`config.xml`には以下の設定セクションが含まれています：

```xml
<crash_log>
    <database>system</database>
    <table>crash_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1024</max_size_rows>
    <reserved_size_rows>1024</reserved_size_rows>
    <buffer_size_rows_flush_threshold>512</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</crash_log>
```

## custom_cached_disks_base_directory {#custom_cached_disks_base_directory}

この設定は、カスタム（SQLから作成された）キャッシュディスクのキャッシュパスを指定します。
`custom_cached_disks_base_directory`は、`filesystem_caches_path`（`filesystem_caches_path.xml`で見つかる）のカスタムディスクに対して優先され、
前者が存在しない場合に使用されます。
ファイルシステムキャッシュ設定パスは、そのディレクトリ内に存在する必要があります。
そうしないと、ディスクが作成されるのを防ぐ例外がスローされます。

:::note
これは、サーバーがアップグレードされた古いバージョンで作成されたディスクには影響しません。
この場合、サーバーが正常に起動することを許可するため、例外はスローされません。
:::

例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```

## backup_log {#backup_log}

`BACKUP`および`RESTORE`操作のログ記録用に[backup_log](../../operations/system-tables/backup_log.md)システムテーブルの設定。

<SystemLogParameters/>

**例**

```xml
<clickhouse>
    <backup_log>
        <database>system</database>
        <table>backup_log</table>
        <flush_interval_milliseconds>1000</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </backup_log>
</clickhouse>
```

## blog_storage_log {#blog_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md)システムテーブルの設定。

<SystemLogParameters/>

例：

```xml
<blob_storage_log>
    <database>system</database>
    <table>blob_storage_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by> 
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```

## query_masking_rules {#query_masking_rules}

正規表現ベースのルールは、クエリとすべてのログメッセージに対して適用され、サーバーログに保存される前に適用されます。
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes)テーブル、およびクライアントに送信されるログにも適用されます。これにより、名前、電子メール、個人識別子、またはクレジットカード番号などのSQLクエリからの機密データ漏洩を防ぐことができます。

**例**

```xml
<query_masking_rules>
    <rule>
        <name>SSNを隠す</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**設定フィールド**：

| 設定     | 説明                                                                 |
|---------|-----------------------------------------------------------------------|
| `name`  | ルールの名前（オプション）                                           |
| `regexp` | RE2互換の正規表現（必須）                                           |
| `replace` | 機密データの置換文字列（オプション。デフォルトは六つのアスタリスク） |

マスキングルールは、機密データの漏洩を防ぐために、全体のクエリに対して適用されます（不正確または解析不能なクエリからの漏洩を防ぐため）。

[`system.events`](/operations/system-tables/events)テーブルには、`QueryMaskingRulesMatch`カウンターがあり、クエリマスキングルールがマッチした総数をカウントしています。

分散クエリでは、各サーバーが別々に構成されていなければなりません。そうでない場合、他のノードに渡されたサブクエリはマスキングされずに保存されます。

## remote_servers {#remote_servers}

[分散](../../engines/table-engines/special/distributed.md)テーブルエンジンおよび`cluster`テーブル関数で使用されるクラスタの設定。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl`属性の値については、「[設定ファイル](../../operations/configuration-files.md#configuration_files)」のセクションを参照してください。

**関連情報**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Cluster Discovery](../../operations/cluster-discovery.md)
- [レプリケートされたデータベースエンジン](../../engines/database-engines/replicated.md)

## remote_url_allow_hosts {#remote_url_allow_hosts}

URL関連ストレージエンジンおよびテーブル関数で使用が許可されたホストのリスト。

`\<host\>` XMLタグを用いてホストを追加する場合：
- URLでの名前と完全に一致する必要があります。DNS解決の前に確認されるためです。例えば: `<host>clickhouse.com</host>`
- URLでポートが明示的に指定されている場合は、ホスト:ポート全体がチェックされます。例えば: `<host>clickhouse.com:80</host>`
- ポートなしでホストが指定されている場合は、そのホストの任意のポートが許可されます。例えば、`<host>clickhouse.com</host>`が指定されている場合、`clickhouse.com:20`（FTP）、 `clickhouse.com:80`（HTTP）、 `clickhouse.com:443`（HTTPS）などが許可されます。
- ホストがIPアドレスとして指定されている場合は、URLに指定された通りにチェックされます。例えば: `[2a02:6b8:a::a]`。
- リダイレクトがあり、リダイレクトのサポートが有効になっている場合は、すべてのリダイレクト（locationフィールド）がチェックされます。

例えば：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## timezone {#timezone}

サーバーのタイムゾーン。

UTCタイムゾーンまたは地理的位置のIANA識別子として指定します（例：Africa/Abidjan）。

タイムゾーンは、DateTimeフィールドがテキスト形式（画面またはファイルに印刷される）で出力される際や、文字列からDateTimeを取得する際に、StringとDateTime形式の変換に必要です。さらに、時間と日付に関して作業する関数には、入力パラメータでタイムゾーンが渡されなかった場合にタイムゾーンが使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連情報**

- [session_timezone](../settings/settings.md#session_timezone)

## tcp_port {#tcp_port}

TCPプロトコルを介してクライアントとの通信に使用されるポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```

## tcp_port_secure {#tcp_port_secure}

クライアントとの安全な通信に使用されるTCPポート。 [OpenSSL](#openssl)設定と併せて使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## mysql_port {#mysql_port}

MySQLプロトコルを介してクライアントとの通信に使用されるポート。

:::note
- 正の整数はリッスンするポート番号を指定します。
- 空の値はMySQLプロトコルを介したクライアントとの通信を無効にします。
:::

**例**

```xml
<mysql_port>9004</mysql_port>
```

## postgresql_port {#postgresql_port}

PostgreSQLプロトコルを介してクライアントとの通信に使用されるポート。

:::note
- 正の整数はリッスンするポート番号を指定します。
- 空の値はMySQLプロトコルを介したクライアントとの通信を無効にします。
:::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```

## tmp_path {#tmp_path}

大きなクエリを処理するための一時データをローカルファイルシステムに保存するためのパス。

:::note
- 一時データストレージを構成するために使用できるオプションは1つだけ：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`です。
- 末尾のスラッシュは必須です。
:::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## url_scheme_mappers {#url_scheme_mappers}

短縮または記号化されたURLプレフィックスを完全なURLに変換するための設定。

例：

```xml
<url_scheme_mappers>
    <s3>
        <to>https://{bucket}.s3.amazonaws.com</to>
    </s3>
    <gs>
        <to>https://storage.googleapis.com/{bucket}</to>
    </gs>
    <oss>
        <to>https://{bucket}.oss.aliyuncs.com</to>
    </oss>
</url_scheme_mappers>
```

## user_files_path {#user_files_path}

ユーザーファイルを格納するディレクトリ。テーブル関数[file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md)で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## user_scripts_path {#user_scripts_path}

ユーザースクリプトファイルを格納するディレクトリ。実行可能ユーザー定義関数[Executable User Defined Functions](../../sql-reference/functions/overview#executable-user-defined-functions)に使用されます。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

タイプ：

デフォルト：

## user_defined_path {#user_defined_path}

ユーザー定義ファイルを格納するディレクトリ。SQLユーザー定義関数[SQL User Defined Functions](../../sql-reference/functions/overview#user-defined-functions)に使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## users_config {#users_config}

次を含むファイルへのパス：

- ユーザー設定。
- アクセス権。
- 設定プロファイル。
- クォータ設定。

**例**

```xml
<users_config>users.xml</users_config>
```

## validate_tcp_client_information {#validate_tcp_client_information}

クエリパケットを受信するときにクライアント情報の検証が有効かどうかを決定します。

デフォルトでは、`false`です：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```

## access_control_improvements {#access_control_improvements}

アクセス制御システムのオプション改善のための設定。

| 設定                                         | 説明                                                                                                                                                                                                                                                                                                                                                                                                                            | デフォルト |
|----------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`  | 権限のない行ポリシーを持つユーザーが`SELECT`クエリを使用して行を読み取ることができるかどうかを設定します。例えば、ユーザーAとユーザーBがいて、Aのみに対して行ポリシーが定義されている場合、この設定がtrueの場合、Bはすべての行を見ることができます。この設定がfalseの場合、Bは行を見ることができません。                                                                                      | `true`  |
| `on_cluster_queries_require_cluster_grant`  | `ON CLUSTER`クエリに`CLUSTER`権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                               | `true`  |
| `select_from_system_db_requires_grant`      | `SELECT * FROM system.<table>`がいかなる権限も必要とし、任意のユーザーによって実行されるかどうかを設定します。trueに設定されている場合、このクエリは`GRANT SELECT ON system.<table>`を必要とし、非システムテーブルと同様に処理されます。例外：いくつかのシステムテーブル（`tables`、`columns`、`databases`、および一部の定数テーブルのような`one`、`contributors`など）はすべての人がアクセスできます。また、`SHOW`権限（例： `SHOW USERS`）が付与されている場合は、対応するシステムテーブル（つまり、`system.users`）にもアクセスできます。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>`がいかなる権限も必要とし、任意のユーザーによって実行されるかどうかを設定します。trueに設定されている場合、このクエリは`GRANT SELECT ON information_schema.<table>`を必要とし、通常のテーブルと同様に扱われます。                                                                                                                                                          | `true`  |
```
| `settings_constraints_replace_previous`         | ある設定の設定プロファイルにおける制約が、その設定のために以前の制約（他のプロファイルで定義された）によるアクションをキャンセルするかどうかを設定します。新しい制約によって設定されていないフィールドも含まれます。また、`changeable_in_readonly`制約タイプも有効にします。                                                                                                                                         | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンを使用してテーブルを作成する際に、権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                             | `false` |
| `role_cache_expiration_time_seconds`            | ロールがロールキャッシュに保存される最後のアクセスからの秒数を設定します。                                                                                                                                                                                                                                                                                                       | `600`   |

例:

```xml
<access_control_improvements>
    <users_without_row_policies_can_read_rows>true</users_without_row_policies_can_read_rows>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
    <select_from_system_db_requires_grant>true</select_from_system_db_requires_grant>
    <select_from_information_schema_requires_grant>true</select_from_information_schema_requires_grant>
    <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
    <table_engines_require_grant>false</table_engines_require_grant>
    <role_cache_expiration_time_seconds>600</role_cache_expiration_time_seconds>
</access_control_improvements>
```

## s3queue_log {#s3queue_log}

`s3queue_log`システムテーブルの設定。

<SystemLogParameters/>

デフォルト設定は次のとおりです。

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```

## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup}

この設定は、`dictionaries_lazy_load`が`false`の場合の動作を指定します。
(`dictionaries_lazy_load`が`true`の場合、この設定は何も影響しません。)

`wait_dictionaries_load_at_startup`が`false`の場合、サーバーは起動時にすべての辞書をロードし、そのロードと並行して接続を受け付けます。
辞書がクエリで初めて使用される場合、辞書がまだロードされていない場合、クエリは辞書がロードされるまで待機します。
`wait_dictionaries_load_at_startup`を`false`に設定すると、ClickHouseの起動が早くなりますが、いくつかのクエリは遅く実行される可能性があります
（いくつかの辞書がロードされるまで待つ必要があるため）。

`wait_dictionaries_load_at_startup`が`true`の場合、サーバーは起動時に、
すべての辞書が読み込みを終えるまで（成功または失敗に関係なく）接続を受け付けません。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```

デフォルト: true

## zookeeper {#zookeeper}

ClickHouseが[ZooKeeper](http://zookeeper.apache.org/)クラスターと対話するための設定が含まれています。 ClickHouseは、レプリケートされたテーブルを使用する際にレプリカのメタデータを保存するためにZooKeeperを使用します。 レプリケートされたテーブルが使用されていない場合、このパラメータのセクションは省略できます。

以下の設定はサブタグによって構成できます。

| 設定名                                    | 説明                                                                                                                                                                                                                                   |
|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                     | ZooKeeperエンドポイント。複数のエンドポイントを設定可能です。例：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index`属性は、ZooKeeperクラスターへの接続を試みるときのノード順序を指定します。                   |
| `session_timeout_ms`                       | クライアントセッションの最大タイムアウト（ミリ秒単位）。                                                                                                                                                                            |
| `operation_timeout_ms`                     | 一つの操作の最大タイムアウト（ミリ秒単位）。                                                                                                                                                                                         |
| `root` (オプション)                          | ClickHouseサーバーによって使用されるzノードのルートとして使用されるzノード。                                                                                                                                                               |
| `fallback_session_lifetime.min` (オプション) | プライマリが利用できない場合のフォールバックノードへのZooKeeperセッションの最小寿命の制限（負荷分散）。秒単位で設定。デフォルト：3時間。                                                                                                    |
| `fallback_session_lifetime.max` (オプション) | プライマリが利用できない場合のフォールバックノードへのZooKeeperセッションの最大寿命の制限（負荷分散）。秒単位で設定。デフォルト：6時間。                                                                                                    |
| `identity` (オプション)                      | 要求されたzノードにアクセスするためにZooKeeperが必要とするユーザー名とパスワード。                                                                                                                                                            |
| `use_compression` (オプション)               | trueに設定すると、Keeperプロトコルでの圧縮を有効にします。                                                                                                                                                                                     |

また、ZooKeeperノード選択のアルゴリズムを選択できる`zookeeper_load_balancing`設定（オプション）があります。

| アルゴリズム名                   | 説明                                                                                                                    |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `random`                         | ZooKeeperノードのいずれかをランダムに選択します。                                                                                  |
| `in_order`                       | 最初のZooKeeperノードを選択し、利用できない場合は次に、というように選択。                                                            |
| `nearest_hostname`               | サーバーのホスト名に最も類似したZooKeeperノードを選択。ホスト名は名前のプレフィックスと比較されます。                                           |
| `hostname_levenshtein_distance`  | nearest_hostnameと同様ですが、ホスト名をレーベンシュタイン距離で比較します。                                                         |
| `first_or_random`                | 最初のZooKeeperノードを選択し、利用できない場合は残りのZooKeeperノードのいずれかをランダムに選択します。                                                   |
| `round_robin`                    | 最初のZooKeeperノードを選択し、再接続が発生した場合は次のノードを選択します。                                                          |

**例 設定**

```xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <session_timeout_ms>30000</session_timeout_ms>
    <operation_timeout_ms>10000</operation_timeout_ms>
    <!-- オプション。Chrootサフィックス。存在すべきです。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- オプション。ZooKeeperダイジェストACL文字列。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**参考**

- [レプリケーション](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeperプログラマ向けガイド](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouseとZookeeper間のオプションセキュア通信](../ssl-zookeeper.md#secured-communication-with-zookeeper)

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeperにおけるデータパートヘッダのストレージ方式。この設定は[`MergeTree`](/engines/table-engines/mergetree-family)ファミリーにのみ適用されます。指定できます：

**`config.xml`ファイルの[merge_tree](#merge_tree)セクション内でグローバルに**

ClickHouseはサーバー上のすべてのテーブルに対してこの設定を使用します。この設定はいつでも変更できます。既存のテーブルは、この設定が変更されると動作が変わります。

**各テーブルごとに**

テーブルを作成するときに、対応する[エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)を指定します。この設定を持つ既存のテーブルの動作は変わりませんが、グローバル設定が変更されても変わりません。

**可能な値**

- `0` — 機能はオフ。
- `1` — 機能はオン。

`use_minimalistic_part_header_in_zookeeper = 1`の場合、[レプリケートされた](../../engines/table-engines/mergetree-family/replication.md)テーブルは、データパートのヘッダーを単一の`znode`を使用してコンパクトに保存します。テーブルが多くのカラムを含む場合、このストレージ方法はZooKeeperに保存されるデータのボリュームを大幅に削減します。

:::note
`use_minimalistic_part_header_in_zookeeper = 1`を適用した後は、ClickHouseサーバーをこの設定をサポートしていないバージョンにダウングレードできません。クラスタ内のサーバーをアップグレードする際は注意してください。すべてのサーバーを一度にアップグレードしない方が安全です。テスト環境やクラスタの一部のサーバーで新しいバージョンのClickHouseをテストする方が安全です。

この設定を使用してすでに保存されているデータパートヘッダーは、以前の（非コンパクト）表現に復元することはできません。
:::

タイプ: UInt8

デフォルト: 0

## distributed_ddl {#distributed_ddl}

クラスタ上で[分散DDLクエリ](../../sql-reference/distributed-ddl.md)（`CREATE`, `DROP`, `ALTER`, `RENAME`）の実行を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper)が有効になっている場合のみ動作します。

`<distributed_ddl>`内の構成可能な設定には以下が含まれます。

| 設定                    | 説明                                                                                                                               | デフォルト値                          |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| `path`                 | DDLクエリのための`task_queue`のKeeper内のパス                                                                                      |                                        |
| `profile`              | DDLクエリを実行するために使用されるプロファイル                                                                                     |                                        |
| `pool_size`            | 何件の`ON CLUSTER`クエリが同時に実行できるか                                                                                      |                                        |
| `max_tasks_in_queue`   | キューに入ることができるタスクの最大数。                                                                                            | `1,000`                                |
| `task_max_lifetime`    | タスクの年齢がこの値より大きい場合にノードを削除します。                                                                          | `7 * 24 * 60 * 60`（1週間を秒で表現） |
| `cleanup_delay_period` | 新しいノードイベントが受信された場合、最後のクリーンアップが`cleanup_delay_period`秒以上前でなければクリーンアップが開始されません。                              | `60`秒                                 |

**例**

```xml
<distributed_ddl>
    <!-- ZooKeeper内のDDLクエリで使用するキューのパス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- このプロファイルの設定がDDLクエリの実行に使用されます -->
    <profile>default</profile>

    <!-- Controls how much ON CLUSTER queries can be run simultaneously. -->
    <pool_size>1</pool_size>

    <!--
         Cleanup settings (active tasks will not be removed)
    -->

    <!-- Controls task TTL (default 1 week) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Controls how often cleanup should be performed (in seconds) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Controls how many tasks could be in the queue -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## access_control_path {#access_control_path}

ClickHouseサーバーがSQLコマンドによって作成されたユーザーおよびロール設定を保存するフォルダへのパス。

**参考**

- [アクセス制御とアカウント管理](../../guides/sre/user-management/index.md#access-control)

タイプ: String

デフォルト: `/var/lib/clickhouse/access/`。

## allow_plaintext_password {#allow_plaintext_password}

プレーンテキストパスワードタイプ（セキュリティが不十分）が許可されているかどうかを設定します。

デフォルト: `1`（authType plaintext_passwordが許可されている）

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow_no_password {#allow_no_password}

no_passwordという不正確なパスワードタイプが許可されているかどうかを設定します。 

デフォルト: `1`（authType no_passwordが許可されている）

```xml
<allow_no_password>1</allow_no_password>
```

## allow_implicit_no_password {#allow_implicit_no_password}

`IDENTIFIED WITH no_password`が明示的に指定されていない限り、パスワードなしのユーザー作成を禁止します。

デフォルト: `1`

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## default_session_timeout {#default_session_timeout}

デフォルトのセッションタイムアウト、秒単位。 

デフォルト: `60`

```xml
<default_session_timeout>60</default_session_timeout>
```

## default_password_type {#default_password_type}

クエリのような`CREATE USER u IDENTIFIED BY 'p'`で自動的に設定されるパスワードタイプを設定します。

受け入れられる値は：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```

## user_directories {#user_directories}

以下の設定を含む設定ファイルのセクション：
- 定義済みユーザーの設定ファイルへのパス。
- SQLコマンドによって作成されたユーザーが保存されるフォルダへのパス。
- SQLコマンドによって作成され、レプリケートされるユーザーのZooKeeperノードパス（実験的）。

このセクションが指定されている場合は、[users_config](../../operations/server-configuration-parameters/settings.md#users-config)と[access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path)のパスは使用されません。

`user_directories`セクションには任意の数の項目を含めることができ、項目の順序は優先順位を意味します（項目が上であればあるほど優先順位が高くなります）。

**例**

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <local_directory>
        <path>/var/lib/clickhouse/access/</path>
    </local_directory>
</user_directories>
```

ユーザー、ロール、行ポリシー、クォータ、およびプロファイルはZooKeeperにも保存できます：

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <replicated>
        <zookeeper_path>/clickhouse/access/</zookeeper_path>
    </replicated>
</user_directories>
```

また、`memory`セクションを定義して、ディスクに書き込まずに情報をメモリ内にのみ保存することを意味します。そして、`ldap`セクションを定義して、ローカルに定義されていないユーザーの情報をLDAPサーバーに保存することを意味します。

ローカルに定義されていないユーザーのリモートユーザーディレクトリとしてLDAPサーバーを追加するには、次の設定を持つ単一の`ldap`セクションを定義します：

| 設定    | 説明                                                                                                                                                           |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | `ldap_servers`設定セクションで定義されたLDAPサーバー名の1つ。このパラメータは必須で、空にすることはできません。                                                                                                            |
| `roles`  | LDAPサーバーから取得された各ユーザーに割り当てられるローカルに定義されたロールのリストを含むセクション。ロールが指定されていない場合、ユーザーは認証後に何らかのアクションを実行することはできません。認証時にリストに含まれるロールのいずれかがローカルに定義されていない場合、認証試行は提供されたパスワードが不正と同様に失敗します。 |

**例**

```xml
<ldap>
    <server>my_ldap_server</server>
        <roles>
            <my_local_role1 />
            <my_local_role2 />
        </roles>
</ldap>
```

## top_level_domains_list {#top_level_domains_list}

各エントリが`<name>/path/to/file</name>`形式のカスタムトップレベルドメインのリストを定義します。

例えば：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

参照:
- 関数[`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom)およびその変種、これはカスタムTLDリスト名を受け取り、最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分を返します。

## total_memory_profiler_step {#total_memory_profiler_step}

各ピーク割り当てステップでのスタックトレース用のメモリサイズ（バイト単位）を設定します。データは`query_id`が空の文字列の[system.trace_log](../../operations/system-tables/trace_log.md)システムテーブルに保存されます。

デフォルト: `4194304`。

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

ランダムな割り当てと解放を収集して、指定された確率で`MemorySample`として`system.trace_log`システムテーブルに書き込みます。この確率は、割り当てや解放のたびに、割り当てサイズに関係なく適用されます。追跡されていないメモリの量が追跡していないメモリの制限（デフォルト値は`4` MiB）を超えたときのみサンプリングが行われることに注意してください。`total_memory_profiler_step`が低下した場合、これを下げることができます。細かいサンプリングのために`total_memory_profiler_step`を`1`に設定できます。

可能な値：

- 正の整数。
- `0` — `system.trace_log`システムテーブルへのランダムな割り当てと解放の書き込みが無効にされます。

デフォルト: `0`。

## compiled_expression_cache_size {#compiled_expression_cache_size}

[コンパイルされた式](../../operations/caches.md)のキャッシュサイズ（バイト単位）を設定します。

デフォルト: `134217728`。

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

[コンパイルされた式](../../operations/caches.md)のキャッシュサイズ（要素数）を設定します。

デフォルト: `10000`。

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

テーブル、データベース、テーブル関数、辞書の`SHOW`および`SELECT`クエリで秘密を表示するかどうかを有効または無効にします。

秘密を表示したいユーザーは、[`format_display_secrets_in_show_and_select`形式設定](../settings/formats#format_display_secrets_in_show_and_select)をオンにし、[`displaySecretsInShowAndSelect`](../../sql-reference/statements/grant#display-secrets)権限を持っている必要があります。

可能な値：

- `0` — 無効。
- `1` — 有効。

デフォルト: `0`

## proxy {#proxy}

HTTPおよびHTTPSリクエストのプロキシサーバーを定義します。現在、S3ストレージ、S3テーブル関数、およびURL関数でサポートされています。

プロキシサーバーを定義する方法は3つあります：
- 環境変数
- プロキシリスト
- リモートプロキシリゾルバ

特定のホストに対するプロキシサーバーの回避も、`no_proxy`を使用することでサポートされています。

**環境変数**

`http_proxy`および`https_proxy`環境変数を使用すると、指定されたプロトコルのプロキシサーバーを指定できます。システムに設定されている場合は、シームレスに動作するはずです。

これは、指定されたプロトコルに対してプロキシサーバーが1つだけであり、そのプロキシサーバーが変更されない場合の最も簡単なアプローチです。

**プロキシリスト**

このアプローチでは、プロトコルのために1つ以上のプロキシサーバーを指定できます。プロキシサーバーが1つ以上定義されている場合、ClickHouseはラウンドロビン方式で異なるプロキシを使用し、サーバー間で負荷をバランスさせます。プロトコルのためにプロキシサーバーが1つ以上あり、プロキシサーバーのリストが変更されない場合には、最も簡単なアプローチです。

**構成テンプレート**

```xml
<proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```

以下のタブで親フィールドを選択して、その子を表示します：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド     | 説明                         |
|-----------|-------------------------------------|
| `<http>`  | 1つ以上のHTTPプロキシのリスト  |
| `<https>` | 1つ以上のHTTPSプロキシのリスト |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド   | 説明          |
|---------|----------------------|
| `<uri>` | プロキシのURI |

  </TabItem>
</Tabs>

**リモートプロキシリゾルバ**

プロキシサーバーが動的に変更される可能性があります。その場合、リゾルバのエンドポイントを定義できます。ClickHouseはそのエンドポイントに空のGETリクエストを送信し、リモートリゾルバはプロキシホストを返すべきです。ClickHouseはそれを使用して次のテンプレートでプロキシURIを形成します：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**構成テンプレート**

```xml
<proxy>
    <http>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>80</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </http>

    <https>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>3128</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </https>

</proxy>
```

以下のタブで親フィールドを選択して、その子を表示します：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド    | 説明                      |
|----------|----------------------------------|
| `<http>` | 1つ以上のリゾルバのリスト* |
| `<https>` | 1つ以上のリゾルバのリスト* |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド       | 説明                                   |
|-------------|-------------------------------------------|
| `<resolver>` | リゾルバのためのエンドポイントとその他の詳細 |

:::note
複数の`<resolver>`要素を持つことができますが、定義されたプロトコルの最初の`<resolver>`のみが使用されます。そのプロトコルの他の`<resolver>`要素は無視されます。つまり、負荷分散（必要な場合）はリモートリゾルバによって実装されるべきです。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| フィールド               | 説明                                                                                                                                                                           |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | プロキシリゾルバのURI                                                                                                                                                          |
| `<proxy_scheme>`    | 最終的なプロキシURIのプロトコル。`http`または`https`のいずれかです。                                                                                                                |
| `<proxy_port>`      | プロキシリゾルバのポート番号                                                                                                                                                  |
| `<proxy_cache_time>` | リゾルバからの値をClickHouseがキャッシュすべき秒数。これを`0`に設定すると、ClickHouseはすべてのHTTPまたはHTTPSリクエストのたびにリゾルバに問い合わせます。 |

  </TabItem>
</Tabs>

**優先順位**

プロキシ設定の決定は次の順序で行われます：

| 順序 | 設定                |
|-------|------------------------|
| 1.    | リモートプロキシリゾルバ |
| 2.    | プロキシリスト            |
| 3.    | 環境変数              |

ClickHouseは、リクエストプロトコルのために最も高い優先度のリゾルバタイプをチェックします。定義されていない場合は、次に高い優先順位のリゾルバタイプをチェックし、環境リゾルバに到達するまで続けます。これは、リゾルバタイプを混ぜて使用できることも意味します。

## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}
デフォルトでは、トンネリング（つまり、`HTTP CONNECT`）を使用して、`HTTP` プロキシを介して `HTTPS` リクエストを行います。この設定は、それを無効にするために使用できます。

**no_proxy**

デフォルトでは、すべてのリクエストはプロキシを通過します。特定のホストに対してこれを無効にするためには、`no_proxy` 変数を設定する必要があります。  
この変数は、リストおよびリモートリゾルバーの `<proxy>` 条項内で、環境リゾルバーの環境変数として設定できます。  
IP アドレス、ドメイン、サブドメイン、および全バイパスのための `'*'` ワイルドカードをサポートしています。先頭のドットは、curl と同様に削除されます。

**例**

以下の設定では、`clickhouse.cloud` およびそのすべてのサブドメイン（例： `auth.clickhouse.cloud`）へのプロキシリクエストをバイパスします。  
先頭にドットがある GitLab にも同様に適用されます。`gitlab.com` および `about.gitlab.com` の両方はプロキシをバイパスします。

```xml
<proxy>
    <no_proxy>clickhouse.cloud,.gitlab.com</no_proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```

## max_materialized_views_count_for_table {#max_materialized_views_count_for_table}

テーブルに接続されたマテリアライズドビューの最大数の制限です。

:::note
ここでは、直接依存しているビューのみが考慮され、他のビューの上にビューを作成することは考慮されません。
:::

デフォルト: `0`。

## format_alter_operations_with_parentheses {#format_alter_operations_with_parentheses}

`true` に設定されている場合、変更操作はフォーマットされたクエリ内でかっこで囲まれます。これにより、フォーマットされた変更クエリの解析がより明確になります。

タイプ: `Bool`

デフォルト: `0`

## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}

`true` の場合、ClickHouse は `CREATE VIEW` クエリ内の空の SQL セキュリティステートメントにデフォルトを書き込みません。

:::note
この設定は、移行期間中にのみ必要であり、24.4 で無効になります。
:::

タイプ: `Bool`

デフォルト: `1`

## merge_workload {#merge_workload}

マージとその他のワークロード間でリソースがどのように利用および共有されるかを調整するために使用されます。指定された値は、すべてのバックグラウンドマージの `workload` 設定値として使用されます。マージツリー設定によって上書き可能です。

タイプ: `String`

デフォルト: `default`

**参照**
- [ワークロードスケジューリング](/operations/workload-scheduling.md)

## mutation_workload {#mutation_workload}

ミューテーションとその他のワークロード間でリソースがどのように利用および共有されるかを調整するために使用されます。指定された値は、すべてのバックグラウンドミューテーションの `workload` 設定値として使用されます。マージツリー設定によって上書き可能です。

**参照**
- [ワークロードスケジューリング](/operations/workload-scheduling.md)

タイプ: `String`

デフォルト: `default`

## throw_on_unknown_workload {#throw_on_unknown_workload}

クエリ設定 'workload' で知られていない WORKLOAD にアクセスしたときの挙動を定義します。

- `true` の場合、未知のワークロードにアクセスしようとするクエリから RESOURCE_ACCESS_DENIED 例外がスローされます。これは、WORKLOAD 階層が確立され、WORKLOAD デフォルトを含むようになった後、すべてのクエリに対してリソーススケジューリングを強制するのに役立ちます。
- `false`（デフォルト）の場合、未知の ワークロード を指す 'workload' 設定を持つクエリに無制限のアクセスが提供されます。これは、WORKLOAD 階層の設定中に、WORKLOAD デフォルトが追加される前に重要です。

**参照**
- [ワークロードスケジューリング](/operations/workload-scheduling.md)

タイプ: `String`

デフォルト: false

**例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

## workload_path {#workload_path}

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリのストレージとして使用されるディレクトリ。デフォルトでは、サーバーの作業ディレクトリ内の `/workload/` フォルダが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**参照**
- [ワークロード階層](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)

## workload_zookeeper_path {#workload_zookeeper_path}

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリのストレージとして使用される ZooKeeper ノードのパス。一貫性のため、すべての SQL 定義はこの単一の znode の値として保存されます。デフォルトでは ZooKeeper は使用されず、定義は [ディスク](#workload_path) に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**参照**
- [ワークロード階層](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)

## use_legacy_mongodb_integration {#use_legacy_mongodb_integration}

従来の MongoDB 統合実装を使用します。非推奨。

タイプ: `Bool`

デフォルト: `true`。

## max_authentication_methods_per_user {#max_authentication_methods_per_user}

ユーザーが作成または変更できる認証方法の最大数。  
この設定を変更しても既存のユーザーには影響しません。  
指定された制限を超える認証関連のクエリは失敗します。  
非認証の作成/変更クエリは成功します。

:::note
値が `0` の場合は無制限です。
:::

タイプ: `UInt64`

デフォルト: `100`

## allow_feature_tier {#allow_feature_tier}

ユーザーが異なる機能 Tier に関連する設定を変更できるかどうかを制御します。

- `0` - すべての設定の変更が許可されます（実験的、ベータ、プロダクション）。
- `1` - ベータおよびプロダクションの機能設定のみが許可されます。実験的な設定の変更は拒否されます。
- `2` - プロダクション設定のみが許可されます。実験的またはベータ設定の変更は拒否されます。

これは、すべての `EXPERIMENTAL` / `BETA` 機能に対して読み取り専用の制約を設定することに相当します。

:::note
値が `0` の場合、すべての設定を変更できます。
:::

タイプ: `UInt32`

デフォルト: `0`
