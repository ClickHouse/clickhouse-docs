---
slug: /operations/server-configuration-parameters/settings
sidebar_position: 57
sidebar_label: グローバルサーバー設定
description: このセクションには、セッションまたはクエリレベルで変更できないサーバー設定の説明が含まれています。
keywords: [グローバルサーバー設定]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md'

# グローバルサーバー設定

このセクションには、セッションまたはクエリレベルで変更できないサーバー設定の説明が含まれています。これらの設定は、ClickHouseサーバーの `config.xml` ファイルに保存されています。ClickHouseの構成ファイルに関する詳細は、["構成ファイル"](/operations/configuration-files)を参照してください。

他の設定については、"[設定](/operations/settings/overview)" セクションで説明されています。
設定を学習する前に、[構成ファイル](/operations/configuration-files)のセクションを読み、置換の使用（`incl` と `optional` 属性）について注意を払うことをお勧めします。

## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

jemallocメモリの使用を許可します。

Type: `Bool`

Default: `1`

## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

非同期メトリックを更新するための期間（秒）。

Type: `UInt32`

Default: `120`

## asynchronous_metric_log {#asynchronous_metric_log}

ClickHouse Cloudのデプロイでデフォルトで有効。

環境によってデフォルトでこの設定が有効でない場合は、ClickHouseのインストール方法に応じて、以下の手順に従って有効または無効にできます。

**有効化**

非同期メトリックログ履歴収集を手動で有効にするには、[`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md) を作成し、`/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` に以下の内容を追加します：

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

**無効化**

`asynchronous_metric_log` 設定を無効にするには、次のファイル `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` を作成し、以下の内容を追加します：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

非同期メトリックを更新するための期間（秒）。

Type: `UInt32`

Default: `1`

## auth_use_forwarded_address {#auth_use_forwarded_address}

プロキシを通じて接続されたクライアントの認証に元のアドレスを使用します。

:::note
この設定は注意して使用する必要があります。なぜなら、転送されたアドレスは容易に偽装される可能性があるため、こうした認証を受け入れるサーバーには直接アクセスするのではなく、信頼できるプロキシを通じてのみアクセスすべきです。
:::

Type: `Bool`

Default: `0`

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

バックグラウンドで [Buffer-engine tables](/engines/table-engines/special/buffer) のフラッシュ操作を実行するために使用されるスレッドの最大数。

Type: `UInt64`

Default: `16`

## background_common_pool_size {#background_common_pool_size}

バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルに対して様々な操作（主にガーベジコレクション）を実行するために使用されるスレッドの最大数。

Type: `UInt64`

Default: `8`

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

分散送信を実行するために使用されるスレッドの最大数。

Type: `UInt64`

Default: `16`

## background_fetches_pool_size {#background_fetches_pool_size}

バックグラウンドで別のレプリカからデータパーツを取得するために使用されるスレッドの最大数。

Type: `UInt64`

Default: `16`

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

同時に実行できるバックグラウンドのマージとミューテーションの数に対するスレッドの比率を設定します。

例えば、比率が2で [`background_pool_size`](#background_pool_size) が16に設定されている場合、ClickHouseは32のバックグラウンドマージを同時に実行できます。これは、バックグラウンド操作が一時停止される可能性があるため、小さなマージに優先的に実行される必要があるからです。

:::note
この比率は実行中にのみ増加できます。下げるにはサーバーを再起動する必要があります。

[`background_pool_size`](#background_pool_size) 設定と同様に、[`background_merges_mutations_concurrency_ratio`](#background_merges_mutations_concurrency_ratio) は後方互換性のために `default` プロファイルから適用されることがあります。
:::

Type: `Float`

Default: `2`

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

バックグラウンドのマージとミューテーションのスケジューリング方法に関するポリシー。可能な値は `round_robin` と `shortest_task_first` です。

次のマージまたはミューテーションをバックグラウンドスレッドプールで実行するための選択アルゴリズム。ポリシーはサーバーを再起動せずに実行中に変更できます。

可能な値:

- `round_robin` — 同時に実行されるすべてのマージとミューテーションはラウンドロビン方式で実行され、スタベーションのない操作が保証されます。小さなマージは大きなマージよりも早く完了します。
- `shortest_task_first` — いつも小さなマージまたはミューテーションを実行します。マージとミューテーションは、その結果のサイズに基づいて優先順位が設定されます。小さなサイズのマージが大きなサイズのものよりも厳密に優先されます。このポリシーは小さなパーツの最速のマージを保証しますが、`INSERT` で重く負荷のかかったパーティションでは大きなマージが無期限にスタベーションする可能性があります。

Type: String

Default: `round_robin`

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

メッセージストリーミングのバックグラウンド操作を実行するために使用されるスレッドの最大数。

Type: UInt64

Default: `16`

## background_move_pool_size {#background_move_pool_size}

バックグラウンドで *MergeTree-engine テーブルのデータパーツを別のディスクまたはボリュームに移動するために使用されるスレッドの最大数。

Type: UInt64

Default: `8`

## background_schedule_pool_size {#background_schedule_pool_size}

レプリケートテーブル、Kafkaストリーミング、DNSキャッシュの更新のために軽量な定期的操作を継続的に実行するために使用されるスレッドの最大数。

Type: UInt64

Default: `512`

## backups {#backups}

`BACKUP TO File()` を実行する際に使用されるバックアップの設定。

以下の設定は、サブタグで構成できます：

| 設定                             | 説明                                                                                                                                                                    | デフォルト |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| `allowed_path`                   | `File()` を使用する際にバックアップするパス。この設定を設定しなければ `File` を使用できません。このパスはインスタンスディレクトリに対する相対パスまたは絶対パスである必要があります。 | `true`    |
| `remove_backup_files_after_failure` | `BACKUP` コマンドが失敗した場合、ClickHouseは失敗前にバックアップに既にコピーされたファイルを削除しようとします。そうでなければ、コピーされたファイルはそのまま残ります。 | `true`    |

この設定はデフォルトで次のように設定されています：

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```

## backup_threads {#backup_threads}

`BACKUP` リクエストを実行するためのスレッドの最大数。

Type: `UInt64`

Default: `16`

## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

バックアップIOスレッドプールでスケジュール可能なジョブの最大数。現在のS3バックアップロジックのため、キューを無制限に保つことをお勧めします。

:::note
値が`0`（デフォルト）は無制限を意味します。
:::

Type: `UInt64`

Default: `0`

## bcrypt_workfactor {#bcrypt_workfactor}

[Bcryptアルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)を使用するbcrypt_password認証タイプの作業係数。

Default: `12`

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

キャッシュサイズをRAMの最大比率に設定します。メモリが少ないシステムではキャッシュサイズを下げることができます。

Type: `Double`

Default: `0.5`

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

リモートサーバーからデータを取得するためのスレッドを除く、全クエリを実行するために許可されるクエリ処理スレッドの最大数。これはハードリミットではありません。リミットに達した場合でも、クエリは少なくとも1つのスレッドを得ます。クエリは実行中に必要に応じてスレッド数を増やすことができます。

:::note
値が `0` （デフォルト）は無制限を意味します。
:::

Type: `UInt64`

Default: `0`

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) と同じですが、コアに対する比率です。

Type: `UInt64`

Default: `0`

## default_database {#default_database}

デフォルトのデータベース名。

Type: `String`

Default: `default`

## disable_internal_dns_cache {#disable_internal_dns_cache}

内部DNSキャッシュを無効にします。Kubernetesなど、インフラストラクチャが頻繁に変わるシステムでClickHouseを操作する場合に推奨されます。

Type: `Bool`

Default: `0`

## dns_cache_max_entries {#dns_cache_max_entries}

内部DNSキャッシュの最大エントリ数。

Type: `UInt64`

Default: `10000`

## dns_cache_update_period {#dns_cache_update_period}

内部DNSキャッシュの更新間隔（秒）。

Type: `Int32`

Default: `15`

## dns_max_consecutive_failures {#dns_max_consecutive_failures}

ClickHouse DNSキャッシュからホストを削除する前の最大連続解決失敗数。

Type: `UInt32`

Default: `10`

## index_mark_cache_policy {#index_mark_cache_policy}

インデックスマークキャッシュポリシー名。

Type: `String`

Default: `SLRU`

## index_mark_cache_size {#index_mark_cache_size}

インデックスマーク用キャッシュの最大サイズ。

:::note

値が `0` は無効を意味します。

この設定は実行中に変更可能で、即座に効果があります。
:::

Type: `UInt64`

Default: `0`

## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

インデックスマークキャッシュの保護されるキューのサイズ（SLRUポリシーの場合）、キャッシュの総サイズに対する比率です。

Type: `Double`

Default: `0.5`

## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

未圧縮インデックスのキャッシュポリシー名。

Type: `String`

Default: `SLRU`

## index_uncompressed_cache_size {#index_uncompressed_cache_size}

`MergeTree` インデックスの未圧縮ブロック用キャッシュの最大サイズ。

:::note
値が `0` は無効を意味します。

この設定は実行中に変更可能で、即座に効果があります。
:::

Type: `UInt64`

Default: `0`

## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

未圧縮インデックスキャッシュの保護されるキューのサイズ（SLRUポリシーの場合）、キャッシュの総サイズに対する比率です。

Type: `Double`

Default: `0.5`

## skipping_index_cache_policy {#skipping_index_cache_policy}

スキッピングインデックスキャッシュポリシー名。

Type: `String`

Default: `SLRU`

## skipping_index_cache_size {#skipping_index_cache_size}

スキッピングインデックス用キャッシュのサイズ。ゼロは無効を意味します。

:::note
この設定は実行中に変更可能で、即座に効果があります。
:::

Type: `UInt64`

Default: `5368709120` (= 5 GiB)

## skipping_index_cache_size_ratio {#skipping_index_cache_size_ratio}

スキッピングインデックスキャッシュの保護されるキューのサイズ（SLRUポリシーの場合）、キャッシュの総サイズに対する比率です。

Type: `Double`

Default: `0.5`

## skipping_index_cache_max_entries {#skipping_index_cache_max_entries}

スキッピングインデックスキャッシュ内の最大エントリ数。

Type: `UInt64`

Default: `10000000`

## io_thread_pool_queue_size {#io_thread_pool_queue_size}

IOスレッドプールでスケジュールできるジョブの最大数。

:::note
値が `0` は無制限を意味します。
:::

Type: `UInt64`

Default: `10000`

## mark_cache_policy {#mark_cache_policy}

マークキャッシュポリシー名。

Type: `String`

Default: `SLRU`

## mark_cache_size {#mark_cache_size}

[`MergeTree`](/engines/table-engines/mergetree-family) ファミリーのテーブルのマーク（インデックス）用のキャッシュの最大サイズ。

:::note
この設定は実行中に変更可能で、即座に効果があります。
:::

Type: `UInt64`

Default: `5368709120`

## mark_cache_size_ratio {#mark_cache_size_ratio}

マークキャッシュの保護されるキューのサイズ（SLRUポリシーの場合）、キャッシュの総サイズに対する比率です。

Type: `Double`

Default: `0.5`

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

サーバー上のすべてのバックアップに対する最大読み取り速度（バイト/秒）。ゼロは無制限を意味します。

Type: `UInt64`

Default: `0`

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

バックアップIOスレッドプール内の**アイドル**スレッド数が`max_backup_io_thread_pool_free_size`を超えた場合、ClickHouseはアイドルスレッドによって占有されているリソースを解放し、プールサイズを減少させます。必要に応じてスレッドが再作成されます。

Type: `UInt64`

Default: `0`

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

ClickHouseはバックアップIOスレッドプールからスレッドを使用してS3バックアップIO操作を行います。 `max_backups_io_thread_pool_size`はプール内の最大スレッド数を制限します。

Type: `UInt64`

Default: `1000`

## max_concurrent_queries {#max_concurrent_queries}

同時に実行されるクエリの合計数に対するリミット。 `INSERT` および `SELECT` クエリに対するリミット、およびユーザーに対する最大クエリ数も考慮する必要があります。

参照：
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings/#max_concurrent_queries_for_all_users)

:::note

値が `0` （デフォルト）は無制限を意味します。

この設定は実行中に変更可能で、即座に効果があります。既に実行中のクエリは変更されません。
:::

Type: `UInt64`

Default: `0`

## max_concurrent_insert_queries {#max_concurrent_insert_queries}

同時に実行される挿入クエリの合計数に対するリミット。

:::note

値が `0` （デフォルト）は無制限を意味します。

この設定は実行中に変更可能で、即座に効果があります。既に実行中のクエリは変更されません。
:::

Type: `UInt64`

Default: `0`

## max_concurrent_select_queries {#max_concurrent_select_queries}

同時に実行される選択クエリの合計数に対するリミット。

:::note

値が `0` （デフォルト）は無制限を意味します。

この設定は実行中に変更可能で、即座に効果があります。既に実行中のクエリは変更されません。
:::

Type: `UInt64`

Default: `0`

## max_waiting_queries {#max_waiting_queries}

同時に待機しているクエリの合計数に対するリミット。
待機しているクエリの実行は、必要なテーブルが非同期的に読み込まれている間はブロックされます（参照：[`async_load_databases`](#async_load_databases)。

:::note
待機しているクエリは、次の設定によって制御されるリミットがチェックされるときにはカウントされません：

- [`max_concurrent_queries`](#max_concurrent_queries)
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

この修正は、サーバー起動後すぐにこれらのリミットに達するのを防ぐために行われます。
:::

:::note

値が `0` （デフォルト）は無制限を意味します。

この設定は実行中に変更可能で、即座に効果があります。既に実行中のクエリは変更されません。
:::

Type: `UInt64`

Default: `0`

## max_connections {#max_connections}

最大サーバー接続数。

Type: `Int32`

Default: `1024`

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

IOスレッドプール内の**アイドル**スレッド数が`max_io_thread_pool_free_size`を超えた場合、ClickHouseはアイドルスレッドによって占有されているリソースを解放し、プールサイズを減少させます。必要に応じてスレッドが再作成されます。

Type: `UInt64`

Default: `0`

## max_io_thread_pool_size {#max_io_thread_pool_size}

ClickHouseはIOスレッドプールのスレッドを使用して、いくつかのIO操作を行います（例：S3とのインタラクション）。 `max_io_thread_pool_size`はプール内の最大スレッド数を制限します。

Type: `UInt64`

Default: `100`

## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

ローカル読み取りの最大速度（バイト/秒）。

:::note
値が `0` は無制限を意味します。
:::

Type: `UInt64`

Default: `0`

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

ローカル書き込みの最大速度（バイト/秒）。

:::note
値が `0` は無制限を意味します。
:::

Type: `UInt64`

Default: `0`

## max_partition_size_to_drop {#max_partition_size_to_drop}

パーティションをドロップする際の制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが [`max_partition_size_to_drop`](#max_partition_size_to_drop) を超えた場合（バイト単位）、`DROP PARTITION` を使用してパーティションを削除することはできません。
この設定はClickHouseサーバーを再起動せずに適用できます。制限を無効にするもう一つの方法は、`<clickhouse-path>/flags/force_drop_table` ファイルを作成することです。

:::note
値 `0` は任意の制限なしでパーティションを削除できることを意味します。

この制限はテーブルの削除やトランケートには適用されません。参照: [max_table_size_to_drop](#max_table_size_to_drop)
:::

**例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```

Type: `UInt64`

Default: `50`

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

読み取りに対するネットワーク過処理の最大速度（バイト/秒）。

:::note
値が `0` （デフォルト）は無制限を意味します。
:::

Type: `UInt64`

Default: `0`

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

書き込みに対するネットワーク過処理の最大速度（バイト/秒）。

:::note
値が `0` （デフォルト）は無制限を意味します。
:::

Type: `UInt64`

Default: `0`

## max_server_memory_usage {#max_server_memory_usage}

総メモリ使用量に対する制限。
デフォルトの [`max_server_memory_usage`](#max_server_memory_usage) 値は `memory_amount * max_server_memory_usage_to_ram_ratio` として計算されます。

:::note
値が `0` （デフォルト）は無制限を意味します。
:::

Type: `UInt64`

Default: `0`

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

[`max_server_memory_usage`](#max_server_memory_usage) と同様ですが、物理RAMに対する比率です。メモリが少ないシステムでのメモリ使用量を低下させることができます。

RAMとスワップが少ないホストでは、[`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) を1より大きく設定する必要があります。

:::note
値が `0` は無制限を意味します。
:::

Type: `Double`

Default: `0.9`

## max_build_vector_similarity_index_thread_pool_size {#server_configuration_parameters_max_build_vector_similarity_index_thread_pool_size}

ベクトルインデックスを構築するために使用するスレッドの最大数。

:::note
値が `0` はすべてのコアを意味します。
:::

Type: `UInt64`

Default: `16`

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

サーバーの最大許可メモリ消費量がcgroupsの対応する閾値によって調整される秒数。

cgroupオブザーバーを無効にするには、この値を `0` に設定します。

次の設定を参照してください：
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio)。

Type: `UInt64`

Default: `15`

## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio}

cgroupsにおけるサーバープロセスのメモリ消費量の「ハード」閾値を指定します。これを超えた場合、サーバーの最大メモリ消費量は閾値値に調整されます。

次の設定を参照してください：
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio)

Type: `Double`

Default: `0.95`

## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio}

cgroupsにおけるサーバープロセスのメモリ消費量の「ソフト」閾値を指定します。これを超えた場合、jemalloc内のアリーナがクリアされます。

次の設定を参照してください：
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroups_memory_watcher_hard_limit_ratio)

Type: `Double`

Default: `0.9`

## max_database_num_to_warn {#max_database_num_to_warn}

接続されているデータベースの数が指定された値を超えると、ClickHouseサーバーは`system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

Default: `1000`

## max_table_num_to_warn {#max_table_num_to_warn}

接続されているテーブルの数が指定された値を超えると、ClickHouseサーバーは`system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

Default: `5000`

## max_view_num_to_warn {#max_view_num_to_warn}

接続されているビューの数が指定された値を超えると、ClickHouseサーバーは`system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

Type: `UInt64`

Default: `10000`

## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

接続されている辞書の数が指定された値を超えると、ClickHouseサーバーは`system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

Type: `UInt64`

Default: `1000`

## max_part_num_to_warn {#max_part_num_to_warn}

アクティブなパーツの数が指定された値を超えると、ClickHouseサーバーは`system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

Type: `UInt64`

Default: `100000`

## max_table_num_to_throw {#max_table_num_to_throw}

テーブルの数がこの値を超えると、サーバーは例外をスローします。

次のテーブルはカウントされません：
- ビュー
- リモート
- 辞書
- システム

のみデータベースエンジン用のテーブルをカウントします：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が `0` は制限なしを意味します。
:::

**例**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```

Type: `UInt64`

Default: `0`

## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

レプリケートされたテーブルの数がこの値を超えると、サーバーは例外をスローします。

のみデータベースエンジン用のテーブルをカウントします：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が `0` は制限なしを意味します。
:::

**例**
```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```

Type: `UInt64`

Default: `0`

## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

辞書の数がこの値を超えると、サーバーは例外をスローします。

のみデータベースエンジン用のテーブルをカウントします：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が `0` は制限なしを意味します。
:::

**例**
```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```

Type: `UInt64`

Default: `0`

## max_view_num_to_throw {#max_view_num_to_throw}

ビューの数がこの値を超えると、サーバーは例外をスローします。

のみデータベースエンジン用のテーブルをカウントします：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が `0` は制限なしを意味します。
:::

**例**
```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```

Type: `UInt64`

Default: `0`

## max_database_num_to_throw {#max-table-num-to-throw}

データベースの数がこの値を超えると、サーバーは例外をスローします。

:::note
値が `0` （デフォルト） は制限なしを意味します。
:::

**例**

```xml
<max_database_num_to_throw>400</max_database_num_to_throw>
```

Type: `UInt64`

Default: `0`

## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

外部集計、結合、またはソートに使用される最大ストレージ量。
この制限を超えるクエリは例外で失敗します。

:::note
値が `0` は無制限を意味します。
:::

参照：
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

Type: `UInt64`

Default: `0`

## max_thread_pool_free_size {#max_thread_pool_free_size}

グローバルスレッドプール内の**アイドル**スレッド数が[`max_thread_pool_free_size`](#max_thread_pool_free_size)を超えた場合、ClickHouseは一部のスレッドによって占有されているリソースを解放し、プールサイズを減少させます。必要に応じてスレッドが再作成されます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

Type: `UInt64`

Default: `0`

## max_thread_pool_size {#max_thread_pool_size}

ClickHouseはグローバルスレッドプールのスレッドを使用してクエリを処理します。処理するためにアイドルスレッドが存在しない場合、新しいスレッドがプール内に作成されます。 `max_thread_pool_size` はプール内の最大スレッド数を制限します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

Type: `UInt64`

Default: `10000`
## mmap_cache_size {#mmap_cache_size}

マップされたファイルのキャッシュサイズ（バイト単位）を設定します。この設定により、頻繁なオープン/クローズコールを回避でき（これは引き起こされるページフォールトによって非常にコストがかかります）、複数のスレッドやクエリからのマッピングを再利用できます。設定値はマップされた領域の数（通常、マップされたファイルの数と等しい）です。

マップされたファイルのデータ量は、次のシステムテーブルで以下のメトリクスと共に監視できます：

| システムテーブル                                                                                                                                                                                                                                                                                                                                                   | メトリック                                                                                                     |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) および [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                      | `MMappedFiles` および `MMappedFileBytes`                                                                      |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                           | `MMapCacheCells`                                                                                               |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log) | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
マップされたファイルのデータ量は直接メモリを消費せず、クエリやサーバーのメモリ使用量にはカウントされません — なぜなら、このメモリはOSのページキャッシュのように破棄可能だからです。キャッシュは、MergeTreeファミリーのテーブルで古いパーツを削除する際に自動的に削除されます。また、`SYSTEM DROP MMAP CACHE`クエリを実行することで手動で削除することもできます。

この設定は実行時に変更可能で、即時に効果を発揮します。
:::

タイプ: `UInt64`

デフォルト: `1000`

## restore_threads {#restore_threads}

RESTOREリクエストを実行するスレッドの最大数。

タイプ: UInt64

デフォルト: `16`

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

trueに設定すると、スタックトレースにアドレスが表示されます。

タイプ: `Bool`

デフォルト: `1`

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

trueに設定すると、ClickHouseはシャットダウン前に実行中のクエリの完了を待ちます。

タイプ: `Bool`

デフォルト: `0`

## table_engines_require_grant {#table_engines_require_grant}

trueに設定すると、ユーザーは特定のエンジンでテーブルを作成するために権限が必要です。例: `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
デフォルトでは、後方互換性のために特定のテーブルエンジンでテーブルを作成することは権限を無視しますが、これをtrueに設定することでこの動作を変更できます。
:::

タイプ: `Bool`

デフォルト: `false`

## temporary_data_in_cache {#temporary_data_in_cache}

このオプションを使用すると、一時的なデータが特定のディスクのキャッシュに保存されます。
このセクションでは、`cache`タイプのディスク名を指定する必要があります。
この場合、キャッシュと一時的なデータは同じスペースを共有し、ディスクキャッシュは一時的なデータを作成するために追い出される可能性があります。

:::note
一時データストレージを構成するには、一つのオプションのみを使用できます: `tmp_path` ,`tmp_policy`, `temporary_data_in_cache`。
:::

**例**

`local_disk`のキャッシュと一時的なデータは、ファイルシステムの`/tiny_local_cache`に保存され、`tiny_local_cache`によって管理されます。

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

グローバルスレッドプールでスケジュール可能なジョブの最大数。キューサイズを増やすとメモリ使用量が大きくなります。この値は、[`max_thread_pool_size`](#max_thread_pool_size)と等しいことを推奨します。

:::note
値が `0` の場合、無制限を意味します。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

タイプ: UInt64

デフォルト: `10000`

## tmp_policy {#tmp_policy}

一時データ用のストレージポリシー。詳細については、[MergeTreeテーブルエンジン](/engines/table-engines/mergetree-family/mergetree)のドキュメントを参照してください。

:::note
- 一時データストレージを構成するには、一つのオプションのみを使用できます: `tmp_path` ,`tmp_policy`, `temporary_data_in_cache`。
- `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes`は無視されます。
- ポリシーには、*ローカル*ディスクを持つ*一つのボリューム*が必要です。
:::

**例**

`/disk1`が満杯になると、一時データは`/disk2`に保存されます。

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
タイプ: String

デフォルト: ""

## uncompressed_cache_policy {#uncompressed_cache_policy}

非圧縮キャッシュポリシー名。

タイプ: String

デフォルト: `SLRU`

## uncompressed_cache_size {#uncompressed_cache_size}

MergeTreeファミリーのテーブルエンジンで使用される非圧縮データの最大キャッシュサイズ（バイト単位）。

サーバーには1つの共有キャッシュがあります。メモリは需要に応じて割り当てられます。このオプション`use_uncompressed_cache`が有効な場合、キャッシュが使用されます。

非圧縮キャッシュは、特定のケースで非常に短いクエリには有利です。

:::note
値が `0` の場合、無効を意味します。

この設定は実行時に変更可能で、即時に効果を発揮します。
:::

タイプ: UInt64

デフォルト: `0`

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio}

非圧縮キャッシュにおける保護キューのサイズ（SLRUポリシーの場合）、キャッシュの総サイズに対する比率。

タイプ: Double

デフォルト: `0.5`

## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

組み込み辞書のリロード間隔（秒）。

ClickHouseは組み込み辞書をx秒ごとにリロードします。これにより、サーバーを再起動せずに辞書を「即座に」編集可能になります。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

タイプ: UInt64

デフォルト: `3600`

## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)エンジンテーブルのデータ圧縮設定。

:::note
ClickHouseを使い始めたばかりの場合は、これを変更しないことをお勧めします。
:::

**構成テンプレート**:

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

- `min_part_size` – データパーツの最小サイズ。
- `min_part_size_ratio` – データパーツサイズとテーブルサイズの比率。
- `method` – 圧縮方法。許可される値: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`。
- `level` – 圧縮レベル。詳細は[Codecs](/sql-reference/statements/create/table#general-purpose-codecs)を参照してください。

:::note
複数の`<case>`セクションを設定できます。
:::

**条件が満たされた場合のアクション**:

- データパーツが条件セットに一致すると、ClickHouseは指定された圧縮方法を使用します。
- データパーツが複数の条件セットに一致すると、ClickHouseは最初に一致した条件セットを使用します。

:::note
データパーツに条件が満たされない場合、ClickHouseは`lz4`圧縮を使用します。
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

[暗号化コーデックス](/sql-reference/statements/create/table#encryption-codecs)に使用するキーを取得するためのコマンドを設定します。キー（または複数のキー）は環境変数に記述するか、構成ファイルに設定する必要があります。

キーは16バイトの長さの16進数または文字列である必要があります。

**例**

構成からロード:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
構成ファイルにキーを保存することは推奨されません。これは安全ではありません。キーを安全なディスク上の別の構成ファイルに移動し、その構成ファイルへのシンボリックリンクを`config.d/`フォルダに置くことができます。
:::

構成から読み込み、キーが16進数の場合:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

環境変数からキーを読み込み:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで`current_key_id`は暗号化のための現在のキーを設定し、すべての指定されたキーは復号化に使用できます。

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

ここで`current_key_id`は暗号化のための現在のキーを示しています。

また、ユーザーは12バイトの長さのノンスを追加できます（デフォルトでは暗号化および復号化プロセスがゼロバイトからなるノンスを使用します）。

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または16進数で設定できます:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上記のすべては`aes_256_gcm_siv`に適用できます（ただし、キーは32バイトの長さである必要があります）。
:::

## error_log {#error_log}

デフォルトでは無効です。

**有効化**

エラーヒストリー収集を手動でオンにするには、[`system.error_log`](../../operations/system-tables/error_log.md)を作成し、次の内容を持つ`/etc/clickhouse-server/config.d/error_log.xml`を作成します。

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

`error_log`設定を無効にするには、次の内容を持つファイル`/etc/clickhouse-server/config.d/disable_error_log.xml`を作成する必要があります。

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## custom_settings_prefixes {#custom_settings_prefixes}

[カスタム設定](/operations/settings/query-level#custom_settings)のためのプレフィックスのリスト。プレフィックスはカンマで区切る必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**関連項目**

- [カスタム設定](/operations/settings/query-level#custom_settings)

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

テーブルが削除される間、[`UNDROP`](/sql-reference/statements/undrop.md)ステートメントを使用して復元できる遅延。この設定のデフォルトは`480`（8分）です。

デフォルト: `480`

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}

`store/`ディレクトリからゴミをクリーンアップするタスクのパラメータ。
もし、いくつかのサブディレクトリがclickhouse-serverによって使用されておらず、最終的にこのディレクトリが[`database_catalog_unused_dir_hide_timeout_sec`](#database_catalog_unused_dir_hide_timeout_sec)秒間変更されていなければ、タスクはこのディレクトリのすべてのアクセス権を削除することによって「隠します」。これは、clickhouse-serverが`store/`の中で見ることを期待しないディレクトリにも適用されます。

:::note
値が `0` の場合、「即座に」を意味します。
:::

デフォルト: `3600`（1時間）

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

`store/`ディレクトリからゴミをクリーンアップするタスクのパラメータ。
もし、いくつかのサブディレクトリがclickhouse-serverによって使用されておらず、以前に「隠されていた」（[database_catalog_unused_dir_hide_timeout_sec](#database_catalog_unused_dir_hide_timeout_sec)を参照）
そしてこのディレクトリが最終的に[`database_catalog_unused_dir_rm_timeout_sec`](#database_catalog_unused_dir_rm_timeout_sec)秒間変更されていなければ、タスクはこのディレクトリを削除します。
これは、clickhouse-serverが`store/`内で見ることを期待しないディレクトリにも適用されます。

:::note
値が `0` の場合、「決して」を意味します。デフォルト値は30日を表します。
:::

デフォルト: `2592000`（30日）。

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

テーブルの削除が失敗した場合、ClickHouseはこのタイムアウト時間を待ってから操作を再試行します。

タイプ: [`UInt64`](../../sql-reference/data-types/int-uint.md)

デフォルト: `5`

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

テーブルを削除するために使用されるスレッドプールのサイズ。

タイプ: [`UInt64`](../../sql-reference/data-types/int-uint.md)

デフォルト: `16`

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}

`store/`ディレクトリからゴミをクリーンアップするタスクのパラメータ。
タスクのスケジュール期間を設定します。

:::note
値が `0` の場合、「決して」を意味します。デフォルト値は1日を表します。
:::

デフォルト: `86400`（1日）。

## default_profile {#default_profile}

デフォルトの設定プロファイル。設定プロファイルは、`user_config`設定で指定されたファイルにあります。

**例**

```xml
<default_profile>default</default_profile>
```

## default_replica_path {#default_replica_path}

ZooKeeper内のテーブルのパス。

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

辞書のための構成ファイルのパス。

パス：

- 絶対パスまたはサーバー構成ファイルに対する相対パスを指定してください。
- パスにはワイルドカード * および ? を含めることができます。

参照してください：
- "[辞書](../../sql-reference/dictionaries/index.md)"。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```

## user_defined_executable_functions_config {#user_defined_executable_functions_config}

ユーザー定義関数の実行可能構成ファイルのパス。

パス：

- 絶対パスまたはサーバー構成ファイルに対する相対パスを指定してください。
- パスにはワイルドカード * および ? を含めることができます。

参照してください：
- "[実行可能ユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)"。

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```

## dictionaries_lazy_load {#dictionaries_lazy_load}

辞書のレイジーロード。

- `true`の場合、各辞書は最初の使用時にロードされます。ロードが失敗した場合、辞書を使用していた関数は例外をスローします。
- `false`の場合、サーバーは起動時にすべての辞書をロードします。

:::note
サーバーは、起動時にすべての辞書がロードを完了するまで接続を受け入れることを待ちます（例外: [`wait_dictionaries_load_at_startup`](#wait_dictionaries_load_at_startup)が`false`に設定されている場合）。
:::

**例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```

## format_schema_path {#format_schema_path}

入力データのスキーマ、例えば[CapnProto](../../interfaces/formats.md#capnproto)フォーマットのスキーマのディレクトリへのパス。

**例**

```xml
<!-- 様々な入力フォーマットのスキーマファイルを含むディレクトリ。 -->
<format_schema_path>format_schemas/</format_schema_path>
```

## graphite {#graphite}

[Graphite](https://github.com/graphite-project)へのデータ送信。

設定：

- `host` – Graphiteサーバー。
- `port` – Graphiteサーバーのポート。
- `interval` – 送信間隔（秒）。
- `timeout` – データ送信のタイムアウト（秒）。
- `root_path` – キーのプレフィックス。
- `metrics` – [system.metrics](/operations/system-tables/metrics)テーブルからのデータ送信。
- `events` – [system.events](/operations/system-tables/events)テーブルからの時間間隔のデータ送信。
- `events_cumulative` – [system.events](/operations/system-tables/events)テーブルからの累積データ送信。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルからのデータ送信。

複数の`<graphite>`条項を設定できます。例えば、異なるデータを異なる間隔で送信するために使用できます。

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

Graphite用のデータを薄くする設定。

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

Protobufタイプのためのprotoファイルを含むディレクトリを定義します。

例:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```

## http_handlers {#http_handlers}

カスタムHTTPハンドラーを使用できるようにします。
新しいHTTPハンドラーを追加するには、単に新しい`<rule>`を追加します。
ルールは、定義された上から下にチェックされ、最初の一致がハンドラーを実行します。

以下の設定はサブタグによって構成できます：

| サブタグ               | 定義                                                                                                                                                |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | リクエストURLにマッチさせるためのもの、正規表現マッチを使用する場合は「regex:」プレフィックスを使用できます（オプション）                       |
| `methods`            | リクエストメソッドにマッチさせるためのもので、複数のメソッドマッチをカンマで区切ることができます（オプション）                                   |
| `headers`            | リクエストヘッダーにマッチさせるためのもので、各子要素（子要素名はヘッダー名）でマッチし、正規表現マッチを使用したい場合は「regex:」プレフィックスを使用できます（オプション） |
| `handler`            | リクエストハンドラー                                                                                                                                 |
| `empty_query_string` | URLにクエリ文字列がないことを確認します                                                                                                               |

`handler`には、次の設定が含まれており、サブタグで構成できます：

| サブタグ               | 定義                                                                                                                                                      |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | リダイレクト先                                                                                                                                             |
| `type`               | サポートされているタイプ: static、dynamic_query_handler、predefined_query_handler、redirect                                                          | 
| `status`             | staticタイプを使用する際のレスポンスステータスコード                                                                                                            |
| `query_param_name`   | dynamic_query_handlerタイプを使用する場合、HTTPリクエストパラメータの`<query_param_name>`に対応する値を抽出して実行します                                    |
| `query`              | predefined_query_handlerタイプを使用する場合、ハンドラー呼び出し時にクエリを実行します                                                                           |
| `content_type`       | staticタイプを使用する際のレスポンスコンテントタイプ                                                                                                            |
| `response_content`   | staticタイプを使用する際のクライアントへのレスポンスコンテンツ、プレフィックス`file://`または`config://`を使用している場合、ファイルまたは構成からコンテンツをクライアントに送信します   |

ルールのリストに加えて、`<defaults/>`を指定してすべてのデフォルトハンドラーを有効にすることができます。

**例**

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

HTTP(s)を介してサーバーに接続するためのポート。

- `https_port`が指定されている場合、[OpenSSL](#openssl)が構成されている必要があります。
- `http_port`が指定されている場合、OpenSSL構成は設定されていても無視されます。

**例**

```xml
<https_port>9999</https_port>
```

## http_server_default_response {#http_server_default_response}

ClickHouse HTTP(s)サーバーにアクセスした際にデフォルトで表示されるページ。
デフォルト値は「Ok.」（末尾に改行あり）。

**例**

`http://localhost: http_port`にアクセスすると`https://tabix.io/`が開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```

## http_options_response {#http_options_response}

`OPTIONS` HTTPリクエストでのレスポンスにヘッダーを追加するために使用されます。`OPTIONS`メソッドはCORSのプレフライトリクエストで使用されます。

詳細は[OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)を参照してください。

**例**

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

HSTSの有効期限（秒）。

:::note
値が `0` の場合、ClickHouseはHSTSを無効にします。正の数を設定すると、HSTSが有効になり、max-ageが指定した数になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```

## mlock_executable {#mlock_executable}

起動後に`mlockall`を実行して最初のクエリのレイテンシを低下させ、高IO負荷の下でClickHouse実行可能ファイルがページアウトされないようにします。

:::note
このオプションを有効にすることは推奨されますが、起動時間が数秒長くなる可能性があります。この設定は「CAP_IPC_LOCK」権限がないと機能しません。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```

## include_from {#include_from}

置き換えのためのファイルへのパス。XMLとYAMLのフォーマットがサポートされています。

詳細は、"[構成ファイル](/operations/configuration-files)"セクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```

## interserver_listen_host {#interserver_listen_host}

ClickHouseサーバー間でデータを交換できるホストに対する制限。
Keeperが使用されている場合、異なるKeeperインスタンス間の通信にも同じ制限が適用されます。

:::note
デフォルトでは、値は[`listen_host`](#listen_host)設定と等しいです。
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

省略された場合、`hostname -f`コマンドと同じ方法で定義されます。

特定のネットワークインターフェイスから抜け出すのに便利です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```

## interserver_https_port {#interserver_https_port}

HTTPS経由でClickHouseサーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```

## interserver_https_host {#interserver_https_host}

[`interserver_http_host`](#interserver_http_host)と同様ですが、このホスト名は他のサーバーがこのサーバーにHTTPSでアクセスするために使用できます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

他のサーバに接続するために使用されるユーザー名とパスワードのこと。これは[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)中に使用されます。さらに、サーバはこれらの認証情報を使用して他のレプリカを認証します。
従って、`interserver_http_credentials`はクラスター内のすべてのレプリカで同じでなければなりません。

:::note
- デフォルトでは、`interserver_http_credentials`セクションが省略されると、レプリケーション中に認証は使用されません。
- `interserver_http_credentials`設定は、ClickHouseクライアントの認証情報の[構成](../../interfaces/cli.md#configuration_files)には関連しません。
- これらの認証情報は、`HTTP`および`HTTPS`を介したレプリケーションに共通です。
:::

次の設定はサブタグによって構成できます：

- `user` — ユーザー名。
- `password` — パスワード。
- `allow_empty` — `true`の場合、認証情報が設定されていても他のレプリカが認証なしで接続することを許可します。`false`の場合、認証なしの接続が拒否されます。デフォルト: `false`。
- `old` — 認証情報のローテーション中に使用された古い`user`および`password`を含みます。複数の`old`セクションを指定できます。

**認証情報のローテーション**

ClickHouseは、すべてのレプリカを同時に停止することなく、動的なインタサーバー認証情報のローテーションをサポートします。認証情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty`を`true`に設定し、認証情報を追加します。これにより、認証ありおよびなしの接続が許可されます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカを構成した後、`allow_empty`を`false`に設定するか、この設定を削除します。これにより、新しい認証情報による認証が必須となります。

既存の認証情報を変更するには、ユーザー名とパスワードを`interserver_http_credentials.old`セクションに移し、新しい値で`user`および`password`を更新します。この時点で、サーバは他のレプリカに接続するために新しい認証情報を使用し、新旧の認証情報のいずれでも接続を受け入れます。

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

新しい認証情報がすべてのレプリカに適用されたら、古い認証情報は削除できます。
## keep_alive_timeout {#keep_alive_timeout}

ClickHouseが接続を閉じる前に受信リクエストを待機する秒数。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## max_keep_alive_requests {#max_keep_alive_requests}

ClickHouseサーバによって閉じられるまでの単一のキープアライブ接続を通じての最大リクエスト数。

**例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## ldap_servers {#ldap_servers}

以下の目的のためにここに接続パラメータとともにLDAPサーバのリストを記載します：
- 'password'の代わりに'ldap'認証メカニズムが指定された専用のローカルユーザーの認証機構として使用するため。
- リモートユーザーディレクトリとして使用するため。

次の設定はサブタグによって構成できます：

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAPサーバのホスト名またはIP。このパラメータは必須で、空であってはいけません。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAPサーバのポート。`enable_tls`が`true`に設定されている場合はデフォルトが636、そうでない場合は`389`です。                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                      | バインドするためのDNを構築するためのテンプレート。結果として得られるDNは、認証試行のたびにテンプレート内のすべての`\{user_name\}`部分文字列を実際のユーザー名で置き換えることによって構築されます。                                                                                                                                                                                                                               |
| `user_dn_detection`            | バインドユーザーの実際のユーザーDNを検出するためのLDAP検索パラメータを含むセクション。これは主に、サーバがActive Directoryの場合の役割マッピングのための検索フィルターで使用されます。結果として得られるユーザーDNは、許可されているところで`\{user_dn\}`部分文字列を置き換える際に使用されます。デフォルトでは、ユーザーDNはバインドDNと等しく設定されますが、検索が実行されると更新されます。 |
| `verification_cooldown`        | 成功したバインド試行の後、LDAPサーバに連絡することなくすべての連続リクエストに対してユーザーが正常に認証されていると見なされる時間の期間（秒）。キャッシングを無効にし、各認証リクエストのためにLDAPサーバに強制的に連絡するには、`0`（デフォルト）を指定します。                                                                                                                  |
| `enable_tls`                   | LDAPサーバへの安全な接続をトリガーするフラグ。プレーンテキスト（`ldap://`）プロトコルの場合は`no`（推奨されません）を指定し、SSL/TLS（`ldaps://`）プロトコルの場合は`yes`（推奨、デフォルト）を指定します。レガシーのStartTLSプロトコル（プレーンテキスト（`ldap://`）プロトコルからアップグレードされたTLS）の場合は`starttls`を指定します。                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLSの最小プロトコルバージョン。受け入れられる値は：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（デフォルト）。                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`             | SSL/TLSピア証明書の検証動作。受け入れられる値は：`never`、`allow`、`try`、`demand`（デフォルト）。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 証明書キー ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | CA証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 許可される暗号スイート（OpenSSLの表記法で）。                                                                                                                                                                                                                                                                                                                                                                                              |

`user_dn_detection`の設定はサブタグによって構成できます：

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP検索のためのベースDNを構築するためのテンプレート。結果として得られるDNは、LDAP検索の際にテンプレート内のすべての`\{user_name\}`および`\{bind_dn\}`部分文字列を実際のユーザー名およびバインドDNで置き換えることによって構築されます。                                                                                                       |
| `scope`         | LDAP検索のスコープ。許可される値は：`base`、`one_level`、`children`、`subtree`（デフォルト）。                                                                                                                                                                                                                                       |                                                                                                                               
| `search_filter` | LDAP検索のための検索フィルターを構築するためのテンプレート。結果として得られるフィルターは、LDAP検索の際にテンプレート内のすべての`\{user_name\}`、`\{bind_dn\}`、および`\{base_dn\}`部分文字列を実際のユーザー名、バインドDN、およびベースDNで置き換えることによって構築されます。特別な文字はXML内で適切にエスケープする必要があります。  |

例：

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

例（ユーザーDN検出が構成された典型的なActive Directoryのための役割マッピング）：

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

リクエストが来ることができるホストに対する制限。サーバがすべてのリクエストに応答するようにしたい場合は`::`を指定します。

例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

IPv6またはIPv4ネットワークが利用できなくても、リッスンを試みてサーバが終了することはありません。

**例**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

複数のサーバが同じアドレス:ポートでリッスンできるようにします。リクエストはオペレーティングシステムによってランダムなサーバにルーティングされます。この設定を有効にすることは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

タイプ:

デフォルト:
## listen_backlog {#listen_backlog}

リッスンソケットのバックログ（保留接続のキューサイズ）。デフォルト値は`4096`で、これはlinux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4))と同じです。

通常、この値は変更する必要はありません。なぜなら：
- デフォルト値は十分に大きい、
- クライアントの接続を受け入れるためにサーバには別のスレッドがあります。

したがって、`TcpExtListenOverflows`（`nstat`から）が非ゼロで、ClickHouseサーバに対してこのカウンタが増加していても、この値を増やす必要があるという意味ではありません。なぜなら：
- 通常、`4096`が不足している場合は内部のClickHouseスケーリングの問題を示すため、問題を報告する方が良いです。
- その時点でサーバがより多くの接続を処理できるかどうかは分かりません（たとえその時できたとしても、その時にはクライアントが消えているかまたは切断されているかもしれません）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

ログメッセージの場所と形式。

**キー**:

| Key                       | Description                                                                                                                                                                         |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | ログレベル。受け入れられる値：`none`（ログをオフにする）、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                                  |
| `log`                     | ログファイルへのパス。                                                                                                                                                           |
| `errorlog`                | エラーログファイルへのパス。                                                                                                                                                     |
| `size`                    | ローテーションポリシー：ログファイルの最大サイズ（バイト）。ログファイルのサイズがこのしきい値を超えると、ファイル名が変更されてアーカイブされ、新しいログファイルが作成されます。                  |
| `count`                   | ローテーションポリシー：Clickhouseが保持する歴史的ログファイルの最大数です。                                                                                                         |
| `stream_compress`         | LZ4を使用してログメッセージを圧縮します。`1`または`true`に設定して有効にします。                                                                                                                    |
| `console`                 | ログファイルにログメッセージを書き込むのではなく、コンソールに印刷します。`1`または`true`に設定して有効にします。デフォルトは、Clickhouseがデーモンモードで実行されない場合は`1`、そうでない場合は`0`です。 |
| `console_log_level`       | コンソール出力のログレベル。デフォルトは`level`。                                                                                                                                  |
| `formatting`              | コンソール出力のログ形式。現在、`json`のみがサポートされています。                                                                                                                  |
| `use_syslog`              | ログ出力をsyslogにも転送します。                                                                                                                                                  |
| `syslog_level`            | syslogへのログのためのログレベル。                                                                                                                                                    |

**ログ形式指定子**

`log`と`errorLog`パス内のファイル名は、結果として得られるファイル名に対して以下の形式指定子をサポートします（ディレクトリ部分はサポートされません）。

"例"列は、`2023-07-06 18:32:07`の出力を示します。

| Specifier    | Description                                                                                                         | Example                  |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | 文字列%                                                                                                           | `%`                        |
| `%n`         | 改行文字                                                                                                          |                          |
| `%t`         | 水平タブ文字                                                                                                      |                          |
| `%Y`         | 年を10進数で表したもの（例：2017）                                                                                 | `2023`                     |
| `%y`         | 年の最後の2桁を10進数で表したもの（範囲[00,99]）                                                               | `23`                       |
| `%C`         | 年の最初の2桁を10進数で表したもの（範囲[00,99]）                                                          | `20`                       |
| `%G`         | 4桁の[ISO 8601週ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、つまり、指定された週を含む年。通常は`%V`とともに便利です.| `2023`       |
| `%g`         | 最後の2桁の[ISO 8601週ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、つまり、指定された週を含む年。                         | `23`         |
| `%b`         | 短縮された月名（例：Oct、ロケール依存）                                                                                     | `Jul`                      |
| `%h`         | %bの同義語                                                                                                          | `Jul`                      |
| `%B`         | 完全な月名（例：October、ロケール依存）                                                                                    | `July`                     |
| `%m`         | 月を10進数で表したもの（範囲[01,12]）                                                                                       | `07`                       |
| `%U`         | 週の年を10進数で表したもの（週の最初の日が日曜日）（範囲[00,53]）                                                                                 | `27`                       |
| `%W`         | 週の年を10進数で表したもの（週の最初の日が月曜日）（範囲[00,53]）                                                                                 | `27`                       |
| `%V`         | ISO 8601週番号（範囲[01,53]）                                                                                               | `27`                       |
| `%j`         | 年の日を10進数で表したもの（範囲[001,366]）                                                                                         | `187`                      |
| `%d`         | 月の日をゼロ埋めされた10進数で表したもの（範囲[01,31]）。1桁はゼロで前置きされます。                                          | `06`                       |
| `%e`         | 月の日をスペースが埋められた10進数で表したもの（範囲[1,31]）。1桁はスペースで前置きされます。                             | `&nbsp; 6`                 |
| `%a`         | 短縮された曜日名（例：Fri、ロケール依存）                                                                                      | `Thu`                      |
| `%A`         | 完全な曜日名（例：Friday、ロケール依存）                                                                                        | `Thursday`                 |
| `%w`         | 日曜日を0として整数で表した曜日（範囲[0-6]）                                                                                     | `4`                        |
| `%u`         | 10進数で曜日を表したもの（月曜日が1のISO 8601形式）（範囲[1-7]）                                                                    | `4`                        |
| `%H`         | 時間を10進数で表したもの、24時間形式（範囲[00-23]）                                                                                | `18`                       |
| `%I`         | 時間を10進数で表したもの、12時間形式（範囲[01,12]）                                                                                | `06`                       |
| `%M`         | 分を10進数で表したもの（範囲[00,59]）                                                                                       | `32`                       |
| `%S`         | 秒を10進数で表したもの（範囲[00,60]）                                                                                       | `07`                       |
| `%c`         | 標準の日付と時刻の文字列（例：Sun Oct 17 04:41:13 2010、ロケール依存）                                                             | `Thu Jul  6 18:32:07 2023` |
| `%x`         | ローカライズされた日付表現（ロケール依存）                                                                                      | `07/06/23`                 |
| `%X`         | ローカライズされた時刻表現（例：18:40:20または6:40:20 PM、ロケール依存）                                                           | `18:32:07`                 |
| `%D`         | 短いMM/DD/YY日付で、%m/%d/%yに相当します。                                                                                     | `07/06/23`                 |
| `%F`         | 短いYYYY-MM-DD日付で、%Y-%m-%dに相当します。                                                                                       | `2023-07-06`               |
| `%r`         | ローカライズされた12時間制の時刻（ロケール依存）                                                                                  | `06:32:07 PM`              |
| `%R`         | "%H:%M"に相当                                                                                                               | `18:32`                    |
| `%T`         | "%H:%M:%S"（ISO 8601時刻形式）に相当                                                                                                  | `18:32:07`                 |
| `%p`         | ローカライズされたAMまたはPMの表記（ロケール依存）                                                                                     | `PM`                       |
| `%z`         | ISO 8601形式でのUTCからのオフセット（例：-0430）。タイムゾーン情報が利用できない場合は、何も表示されません。                   | `+0800`                    |
| `%Z`         | ロケール依存のタイムゾーン名または略称。タイムゾーン情報が利用できない場合は、何も表示されません。                            | `Z AWST `                  |

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

ログメッセージをコンソールだけに出力するには：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個別のログ名のログレベルをオーバーライドできます。たとえば、「Backup」と「RBAC」のすべてのメッセージをミュートするには、

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

ログメッセージをsyslogに追加で書き込むために：

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

| Key        | Description                                                                                                                                                                                                                                                    |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | `host\[:port\]`形式のsyslogのアドレス。省略した場合は、ローカルデーモンが使用されます。                                                                                                                                                                         |
| `hostname` | ログが送信されるホストの名前（オプション）。                                                                                                                                                                                                      |
| `facility` | syslogの[ファシリティキーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。大文字で指定し、"LOG_"プレフィックスを付ける必要があります（例：`LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3`など）。デフォルト：`address`が指定された場合は`LOG_USER`、そうでない場合は`LOG_DAEMON`。                                           |
| `format`   | ログメッセージ形式。可能な値：`bsd`および`syslog。`                                                                                                                                                                                                       |

**ログ形式**

コンソールログに出力されるログ形式を指定できます。現在、JSONのみがサポートされています。

**例**

以下は出力されたJSONログの例です：

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

JSONログサポートを有効にするには、次のスニペットを使用します：

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

キー名は、`<names>`タグ内のタグ値を変更することで修正できます。たとえば、`DATE_TIME`を`MY_DATE_TIME`に変更したい場合、`<date_time>MY_DATE_TIME</date_time>`を使用します。

**JSONログのキーの省略**

ログプロパティは、省略したいプロパティをコメントアウトすることで省略できます。たとえば、`query_id`をログに印刷したくない場合は`<query_id>`タグをコメントアウトすることができます。
## send_crash_reports {#send_crash_reports}

ClickHouse コア開発者チームへのクラッシュレポートの送信をオプトインで行うための設定です。これは [Sentry](https://sentry.io) を介して行われます。

特にプレプロダクション環境では、これを有効にすることが強く推奨されます。

この機能が適切に機能するためには、サーバーが IPv4 を介してインターネットにアクセスできる必要があります（執筆時点では、Sentry は IPv6 をサポートしていません）。

キー:

| キー                     | 説明                                                                                                                                                                       |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`               | 機能を有効にするためのブールフラグ。デフォルトは `false` です。クラッシュレポートの送信を許可するには `true` に設定します。                                                                               |
| `send_logical_errors`   | `LOGICAL_ERROR` は `assert` と同じで、ClickHouse 内のバグです。このブールフラグを有効にすると、この例外が Sentry に送信されます（デフォルト: `false`）。                                                  |
| `endpoint`              | クラッシュレポートを送信するための Sentry エンドポイント URL を上書きできます。これには別の Sentry アカウントまたはセルフホストされた Sentry インスタンスを使用できます。[Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk) 構文を使用してください。|
| `anonymize`             | クラッシュレポートにサーバーホスト名を添付しないようにします。                                                                                                                                 |
| `http_proxy`            | クラッシュレポートを送信するための HTTP プロキシを設定します。                                                                                                                                       |
| `debug`                 | Sentry クライアントをデバッグモードに設定します。                                                                                                                                                   |
| `tmp_path`              | 一時的なクラッシュレポートの状態のファイルシステムパスです。                                                                                                                                           |
| `environment`           | ClickHouse サーバーが実行されている環境の任意の名前。この環境名は各クラッシュレポートに記載されます。デフォルト値は `test` または `prod` で、ClickHouse のバージョンによって異なります。                           |

**推奨される使用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## ssh_server {#ssh_server}

ホストキーの公開部分は、最初の接続時に SSH クライアント側の known_hosts ファイルに書き込まれます。

ホストキーの設定はデフォルトでは無効です。ホストキーの設定をコメント解除し、それぞれの ssh キーへのパスを指定して有効にします。

例:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## tcp_ssh_port {#tcp_ssh_port}

SSH サーバーに接続し、埋め込みクライアントを介してインタラクティブにクエリを実行できるポートです。

例: 

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## storage_configuration {#storage_configuration}

マルチディスクのストレージ構成を可能にします。

ストレージ構成は以下の構造に従います。

```xml
<storage_configuration>
    <disks>
        <!-- 設定 -->
    </disks>
    <policies>
        <!-- 設定 -->
    </policies>
</storage_configuration>
```
### ディスクの設定 {#configuration-of-disks}

`disks` の設定は以下の構造に従います。

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

上記のサブタグは `disks` のための次の設定を定義します:

| 設定                      | 説明                                                                                                                                          |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | ディスクの名前、これはユニークである必要があります。                                                                                                                       |
| `path`                  | サーバーデータが保存されるパス（`data` および `shadow` カタログ）。パスは `/` で終わる必要があります。                                                |
| `keep_free_space_bytes` | ディスク上の予約された空き領域のサイズです。                                                                                                                  |

:::note
ディスクの順序は関係ありません。
:::
### ポリシーの設定 {#configuration-of-policies}

上記のサブタグは `policies` のための次の設定を定義します:

| 設定                      | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシーの名前。ポリシー名はユニークでなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | ボリュームの名前。ボリューム名もユニークである必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `disk`                       | ボリューム内にあるディスクを指定します。                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`   | このボリューム内の任意のディスクに存在できるデータのチャンクの最大サイズ。マージの結果、チャンクサイズが `max_data_part_size_bytes` より大きいことが予想される場合、チャンクは次のボリュームに書き込まれます。この機能により、新しい/小さなチャンクをホット（SSD）ボリュームに保存し、サイズが大きくなるとコールド（HDD）ボリュームに移動できます。このオプションは、ポリシーが1つのボリュームしか持たない場合には使用しないでください。                    |
| `move_factor`                | ボリューム内の利用可能な空き容量の割合。容量が少なくなると、データは次のボリュームに移動し始めます（次のボリュームがある場合）。移動のために、チャンクはサイズの大きいものから小さいものへ（降順に）ソートされ、`move_factor` 条件を満たす合計サイズのチャンクが選択されます。すべてのチャンクの合計サイズが不足している場合は、すべてのチャンクが移動されます。                                                                                |
| `perform_ttl_move_on_insert` | 挿入時に有効期限が切れたデータの移動を無効にします。デフォルト（有効な場合）、有効期限ルールに従ってすでに期限切れとなったデータを挿入すると、このデータは即座に移動ルールで指定されたボリューム/ディスクに移動されます。これは、ターゲットボリューム/ディスクが遅い場合（例えば、S3）に挿入を著しく遅くする可能性があります。無効にした場合、期限切れのデータはデフォルトのボリュームに書き込まれ、すぐに期限切れの TTL に対して指定したボリュームに移動されます。                           |
| `load_balancing`             | ディスクのバランシングポリシーで、`round_robin` または `least_used` です。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`          | すべてのディスク上の利用可能なスペースを更新するためのタイムアウト（ミリ秒単位）。`0` - 常に更新、`-1` - 絶対に更新しない、デフォルト値は `60000` です。なお、ディスクが ClickHouse のみに使用され、ファイルシステムが動的にサイズ変更されない場合は、`-1` の値を使用できます。それ以外の場合は推奨されません。更新を実行しないことは、スペースの割り当てが最終的に不正確になることにつながります。                                         |
| `prefer_not_to_merge`        | このボリュームのデータのマージを無効にします。注意: これは潜在的に有害で、動作が遅くなる可能性があります。この設定が有効になっている場合（実行しないでください）、このボリュームでのデータのマージが禁止されます（これは悪いことです）。これにより、ClickHouse が遅いディスクとどのように相互作用するかを制御できます。これを使用しないことを推奨します。                                                                                                                                      |
| `volume_priority`            | ボリュームの充填の優先順位（順序）を定義します。値が小さいほど優先度が高くなります。パラメータの値は自然数で、1からN（Nは指定された最大のパラメータ値）までの範囲を持ち、間隔を持たない必要があります。                                                                                                                                                                                                                                                               |

`volume_priority` について:
- すべてのボリュームがこのパラメータを持っている場合、指定された順序で優先されます。
- 一部のボリュームのみがこのパラメータを持っている場合、持っていないボリュームは最低の優先順位になります。その持っているボリュームはタグ値に従って優先順位が決定され、その他の優先順位は設定ファイル内の記述の順序によって決定されます。
- どのボリュームもこのパラメータが指定されていない場合、その順序は設定ファイル内の記述の順序によって決定されます。
- ボリュームの優先度は同じであってはいけません。
## macros {#macros}

レプリケーショントラブルのためのパラメータの置き換え。

レプリケートされたテーブルを使用していない場合、省略が可能です。

さらなる情報は、[レプリケートされたテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)のセクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

データベースの Replicated 用のレプリカグループ名。

Replicated データベースによって作成されたクラスターは、同じグループ内のレプリカで構成されます。
DDL クエリは、同じグループのレプリカだけを待ちます。

デフォルトは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```

タイプ: 文字列

デフォルト: ""
## remap_executable {#remap_executable}

巨大ページを使用してマシンコード（"テキスト"）のメモリを再割り当てするための設定。

デフォルト: `false`

:::note
この機能は非常に実験的です。
:::

例: 

```xml
<remap_executable>false</remap_executable>
```
## max_open_files {#max_open_files}

最大オープンファイル数。

:::note
`getrlimit()` 関数が不正確な値を返すため、macOS でこのオプションを使用することを推奨します。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```
## max_session_timeout {#max_session_timeout}

最大セッションタイムアウト（秒単位）。 

デフォルト: `3600`

例:

```xml
<max_session_timeout>3600</max_session_timeout>
```
## max_table_size_to_drop {#max_table_size_to_drop}

テーブル削除の制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが `max_table_size_to_drop`（バイト単位）を超えると、[`DROP`](../../sql-reference/statements/drop.md) クエリや [`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリを使用して削除することはできません。

:::note
`0` の値は、すべてのテーブルを無制限に削除できることを意味します。

この設定は、ClickHouse サーバーを再起動せずに適用できます。制限を無効にする別の方法は、`<clickhouse-path>/flags/force_drop_table` ファイルを作成することです。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

デフォルト: 50 GB。
## background_pool_size {#background_pool_size}

MergeTree エンジンを持つテーブルのバックグラウンドマージおよびミューテーションを行うスレッド数を設定します。

:::note
- この設定は、ClickHouse サーバーの起動時に `default` プロファイル設定からも適用されて互換性がある場合があります。
- 実行時にスレッド数を増やすことができます。
- スレッド数を減らすには、サーバーを再起動する必要があります。
- この設定を調整することで、CPU とディスクの負荷を管理します。
:::

:::danger
プールサイズが小さいほど、CPU およびディスクリソースの使用が少なくなりますが、バックグラウンドプロセスが遅く進行するため、最終的にはクエリのパフォーマンスに影響を与える可能性があります。
:::

変更する前に、以下の関連する MergeTree 設定も確認してください:
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-lower-max-size-of-merge) .
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-execute-mutation).

**例**

```xml
<background_pool_size>16</background_pool_size>
```

タイプ:

デフォルト: 16。
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit}

マージおよびミューテーション操作のために許可される RAM の使用量の制限を設定します。
ClickHouse が設定された制限に達した場合、新しいバックグラウンドマージまたはミューテーション操作はスケジュールされず、すでにスケジュールされたタスクのみが実行されます。

:::note
`0` の値は無制限を意味します。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```
## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio}

デフォルトの `merges_mutations_memory_usage_soft_limit` 値は `memory_amount * merges_mutations_memory_usage_to_ram_ratio` に基づいて計算されます。

**参照**:

- [max_memory_usage](../../operations/settings/query-complexity.md#settings_max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](#merges_mutations_memory_usage_soft_limit)

デフォルト: `0.5`。
## async_load_databases {#async_load_databases}

データベースおよびテーブルの非同期ロード。

- `true` の場合、`Ordinary`、`Atomic` および `Replicated` エンジンを持つすべての非システムデータベースが、ClickHouse サーバーの起動後に非同期でロードされます。`system.asynchronous_loader` テーブル、`tables_loader_background_pool_size` および `tables_loader_foreground_pool_size` サーバー設定を参照してください。まだロードされていないテーブルにアクセスしようとするクエリは、ちょうどそのテーブルの起動を待ちます。ロードジョブが失敗した場合、クエリはエラーを再スローします（`async_load_databases = false` の場合、サーバ全体をシャットダウンする代わりに）。少なくとも1つのクエリによって待たれているテーブルは優先度が高くロードされます。データベースに対する DDL クエリは、ちょうどそのデータベースが起動するのを待ちます。また、待っているクエリの総数のために `max_waiting_queries` を設定することを検討してください。
- `false` の場合、すべてのデータベースはサーバーが起動するときにロードされます。

**例**

```xml
<async_load_databases>true</async_load_databases>
```

デフォルト: `false`。
## async_load_system_database {#async_load_system_database}

システムテーブルの非同期ロード。`system` データベース内のログテーブルやパーツが多数存在する場合に便利です。`async_load_databases` 設定とは独立しています。

- `true` に設定した場合、すべての `Ordinary`、`Atomic`、および `Replicated` エンジンを持つシステムデータベースは、ClickHouse サーバーの起動後に非同期でロードされます。`system.asynchronous_loader` テーブル、`tables_loader_background_pool_size` および `tables_loader_foreground_pool_size` サーバー設定を参照してください。まだロードされていないシステムテーブルにアクセスしようとするクエリは、ちょうどそのテーブルの起動を待ちます。少なくとも1つのクエリによって待たれているテーブルは優先度が高くロードされます。また、待っているクエリの総数に制限を設けるために `max_waiting_queries` 設定を設定することを考慮してください。
- `false` に設定した場合、システムデータベースはサーバー起動前にロードされます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
```

デフォルト: `false`。
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

フォアグラウンドプールでローディングジョブを実行するスレッド数を設定します。フォアグラウンドプールは、サーバーがポートでリッスンを開始する前にテーブルを同期的にロードするためや、待たれているテーブルのロードに使用されます。フォアグラウンドプールはバックグラウンドプールよりも優先度が高く、フォアグラウンドプールで実行中のジョブがある間、バックグラウンドプールではジョブが開始されることはありません。

:::note
`0` の値は、利用可能なすべての CPU が使用されることを意味します。
:::

デフォルト: `0`
## tables_loader_background_pool_size {#tables_loader_background_pool_size}

バックグラウンドプールで非同期ロードジョブを実行するスレッド数を設定します。バックグラウンドプールは、サーバー起動後に非同期でテーブルをロードするために使用され、テーブル待機クエリがない場合に使用されます。多くのテーブルがある場合、バックグラウンドプールのスレッド数を低く保つことが有益です。これにより、同時クエリ実行のために CPU リソースを確保します。

:::note
`0` の値は、利用可能なすべての CPU が使用されることを意味します。
:::

デフォルト: `0`
## merge_tree {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの微調整。

詳しい情報は、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

デフォルトでは無効です。

**有効化**

メトリクス履歴収集を手動で有効にするには、[`system.metric_log`](../../operations/system-tables/metric_log.md) のために、`/etc/clickhouse-server/config.d/metric_log.xml` を以下の内容で作成します。

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

`metric_log` 設定を無効にするには、次のファイル `/etc/clickhouse-server/config.d/disable_metric_log.xml` を以下の内容で作成する必要があります。

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## latency_log {#latency_log}

デフォルトでは無効です。

**有効化**

レイテンシ履歴収集を手動で有効にするには、[`system.latency_log`](../../operations/system-tables/latency_log.md) のために、`/etc/clickhouse-server/config.d/latency_log.xml` を以下の内容で作成します。

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

`latency_log` 設定を無効にするには、次のファイル `/etc/clickhouse-server/config.d/disable_latency_log.xml` を以下の内容で作成する必要があります。

``` xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## replicated_merge_tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの微調整。この設定は優先度が高くなります。

詳しい情報は、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## opentelemetry_span_log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) システムテーブルの設定。

<SystemLogParameters/>

例:

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

## openSSL {#openssl}

SSLクライアント/サーバーの構成。

SSLのサポートは`libpoco`ライブラリによって提供されます。利用可能な構成オプションは[SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)で説明されています。デフォルト値は[SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp)にあります。

サーバー/クライアント設定のためのキー：

| Option                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Default Value                              |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | PEM証明書の秘密鍵ファイルへのパス。このファイルには鍵と証明書を同時に含めることができます。                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `certificateFile`             | PEM形式のクライアント/サーバー証明書ファイルへのパス。`privateKeyFile`に証明書が含まれている場合は省略できます。                                                                                                                                                                                                                                                                                                                                               |                                            |
| `caConfig`                    | 信頼されたCA証明書を含むファイルまたはディレクトリへのパス。ファイルを指定した場合はPEM形式でなければならず、複数のCA証明書を含むことができます。ディレクトリを指定した場合は、CA証明書ごとに1つの.pemファイルを含める必要があります。ファイル名はCAの主題名のハッシュ値で検索されます。詳細は[SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html)のマニュアルページで確認できます。 |                                            |
| `verificationMode`            | ノードの証明書を検証するための方法。詳細は[Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h)クラスの説明にあります。可能な値: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                   | `relaxed`                                  |
| `verificationDepth`           | 検証チェーンの最大長。証明書チェーンの長さが設定値を超えると検証は失敗します。                                                                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | OpenSSLの組み込みCA証明書を使用するかどうか。ClickHouseは、組み込みCA証明書がファイル`/etc/ssl/cert.pem`（またはディレクトリ`/etc/ssl/certs`）にあると仮定します。あるいは、環境変数`SSL_CERT_FILE`（または`SSL_CERT_DIR`）で指定されたファイル（またはディレクトリ）にも含まれます。                                                                                                  | `true`                                     |
| `cipherList`                  | サポートされているOpenSSLの暗号化方式。                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | セッションのキャッシュを有効または無効にします。`sessionIdContext`と組み合わせて使用する必要があります。許可される値: `true`, `false`.                                                                                                                                                                                                                                                                                                                                             | `false`                                    |
| `sessionIdContext`            | サーバーが各生成された識別子に追加する一意のランダム文字列のセット。文字列の長さは`SSL_MAX_SSL_SESSION_ID_LENGTH`を超えてはなりません。このパラメータは、サーバーがセッションをキャッシュする場合やクライアントがキャッシュを要求した場合に問題を避けるために常に推奨されます。                                                                                                                            | `$\{application.name\}`                      |
| `sessionCacheSize`            | サーバーがキャッシュするセッションの最大数。値`0`は無制限のセッションを意味します。                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | サーバー上でセッションをキャッシュする時間（時間単位）。                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | 有効な場合、証明書のCNまたはSANがピアのホスト名と一致することを確認します。                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | TLSv1接続を要求します。許可される値: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | TLSv1.1接続を要求します。許可される値: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | TLSv1.2接続を要求します。許可される値: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | OpenSSLのFIPSモードを有効にします。ライブラリのOpenSSLバージョンがFIPSをサポートしている場合に限ります。                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandlerのサブクラス）。例: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するクラス（CertificateHandlerのサブクラス）。例: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | 使用が許可されていないプロトコル。                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | クライアントが好むサーバーの暗号方式。                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

**設定例:**

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
        <!-- 自己署名証明書の場合は使用: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 自己署名証明書の場合は使用: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```
## part_log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)に関連するイベントをログに記録します。例えば、データの追加やマージなどです。ログを使用してマージアルゴリズムをシミュレートし、その特性を比較できます。マージプロセスを可視化できます。

クエリは、[system.part_log](/operations/system-tables/part_log)テーブルにログ記録され、別のファイルには記録されません。このテーブルの名前は`table`パラメータで設定できます（以下参照）。

<SystemLogParameters/>

**例**

```xml
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

デフォルト設定は以下の通りです:

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

[Prometheus](https://prometheus.io)からのスクレイピングのためのメトリクスデータを公開します。

設定:

- `endpoint` – prometheusサーバーによるメトリクスのスクレイピング用のHTTPエンドポイント。'/'から始まります。
- `port` – `endpoint`のポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics)テーブルからメトリクスを公開します。
- `events` – [system.events](/operations/system-tables/events)テーブルからメトリクスを公開します。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルから現在のメトリクス値を公開します。
- `errors` - サーバーの最後の再起動以来発生したエラーコードによるエラーの数を公開します。この情報は[system.errors](/operations/system-tables/errors)からも取得できます。

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

確認（`127.0.0.1`をClickHouseサーバーのIPアドレスまたはホスト名に置き換えます）:
```bash
curl 127.0.0.1:9363/metrics
```
## query_log {#query-log}

[log_queries=1](../../operations/settings/settings.md)設定で受信したクエリをログに記録するための設定。

クエリは、[system.query_log](/operations/system-tables/query_log)テーブルにログ記録され、別のファイルには記録されません。このテーブルの名前は`table`パラメータで変更できます（以下参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを自動的に作成します。ClickHouseサーバーが更新された際にクエリログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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
## query_metric_log {#query_metric_log}

デフォルトでは無効になっています。

**有効化**

メトリクスの履歴収集[`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)を手動で有効にするには、`/etc/clickhouse-server/config.d/query_metric_log.xml`という名前のファイルを次の内容で作成します:

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

`query_metric_log`設定を無効にするには、次の内容で`/etc/clickhouse-server/config.d/disable_query_metric_log.xml`というファイルを作成する必要があります:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

[クエリキャッシュ](../query-cache.md)の構成。

次の設定が利用可能です:

| Setting                   | Description                                                                            | Default Value |
|---------------------------|----------------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | 最大キャッシュサイズ（バイト単位）。 `0`はクエリキャッシュが無効であることを意味します。                | `1073741824`  |
| `max_entries`             | キャッシュされる`SELECT`クエリ結果の最大数。                      | `1024`        |
| `max_entry_size_in_bytes` | 保存できる`SELECT`クエリ結果の最大サイズ（バイト単位）。    | `1048576`     |
| `max_entry_size_in_rows`  | 保存できる`SELECT`クエリ結果の最大行数。   | `30000000`    |

:::note
- 変更された設定は即座に適用されます。
- クエリキャッシュのデータはDRAMに割り当てられます。メモリが不足している場合は、 `max_size_in_bytes`に小さい値を設定するか、クエリキャッシュを完全に無効にしてください。
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

[log_query_threads=1](/operations/settings/settings#log_query_threads)設定で受信したクエリのスレッドをログに記録するための設定。

クエリは、[system.query_thread_log](/operations/system-tables/query_thread_log)テーブルにログ記録され、別のファイルには記録されません。このテーブルの名前は`table`パラメータで変更できます（以下参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを自動的に作成します。ClickHouseサーバーが更新された際にクエリスレッドログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

[log_query_views=1](/operations/settings/settings#log_query_views)設定で受信したクエリに依存するビュー（ライブ、マテリアライズなど）をログに記録するための設定。

クエリは、[system.query_views_log](/operations/system-tables/query_views_log)テーブルにログ記録され、別のファイルには記録されません。このテーブルの名前は`table`パラメータで変更できます（以下参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを自動的に作成します。ClickHouseサーバーが更新された際にクエリビューのログ構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

テキストメッセージをログ記録するための[ text_log](/operations/system-tables/text_log)システムテーブルの設定。

<SystemLogParameters/>

さらに:

| Setting | Description                                                                                                                                                                                                 | Default Value       |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `level` | テーブルに保存される最大メッセージレベル（デフォルトは`Trace`）。                                                                                                                                 | `Trace`             |

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

[trace_log](/operations/system-tables/trace_log)システムテーブルの操作設定。

<SystemLogParameters/>

デフォルトのサーバー構成ファイル`config.xml`には以下の設定セクションが含まれています:

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

非同期挿入のための[asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log)システムテーブルの設定。

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

デフォルトのサーバー構成ファイル`config.xml`には以下の設定セクションが含まれています:

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
`custom_cached_disks_base_directory`は、`filesystem_caches_path`（`filesystem_caches_path.xml`に見つかる）を上回る優先度を持ち、前者が存在しない場合に使用されます。 
ファイルシステムキャッシュ設定パスはそのディレクトリ内に収まる必要があり、そうでなければディスクが作成されるのを防ぐ例外がスローされます。

:::note
これにより、サーバーがアップグレードされた古いバージョンで作成されたディスクには影響しません。 
この場合、例外はスローされず、サーバーは正常に起動します。
:::

例:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## backup_log {#backup_log}

`BACKUP`および`RESTORE`操作のログを記録するための[backup_log](../../operations/system-tables/backup_log.md)システムテーブルの設定。

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

例:

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

正規表現に基づくルールで、クエリおよびサーバーログに格納される前のすべてのログメッセージに適用されます。
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブル、およびクライアントに送信されるログで、SQLクエリからの名前、メールアドレス、個人識別子、クレジットカード番号などの敏感なデータの漏洩を防ぎます。

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

**設定フィールド**:

| 設定      | 説明                                                                     |
|-----------|--------------------------------------------------------------------------|
| `name`    | ルールの名前（オプション）                                            |
| `regexp`  | RE2 互換の正規表現（必須）                                        |
| `replace` | 敏感なデータの置換文字列（オプション、デフォルトは - 六つのアスタリスク）  |

マスキングルールは、全体のクエリに適用されます（不正な／解析不可能なクエリからの敏感なデータの漏洩を防ぐため）。

[`system.events`](/operations/system-tables/events) テーブルには、クエリマスキングルールに一致する回数を示すカウンター `QueryMaskingRulesMatch` があります。

分散クエリの場合、各サーバーは別々に設定する必要があります。さもなければ、他のノードに渡されるサブクエリはマスキングなしで格納されます。

## remote_servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンと `cluster` テーブル関数で使用されるクラスターの設定。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性の値については、"[設定ファイル](/operations/configuration-files)" セクションを参照してください。

**関連情報**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Cluster Discovery](../../operations/cluster-discovery.md)
- [Replicated database engine](../../engines/database-engines/replicated.md)

## remote_url_allow_hosts {#remote_url_allow_hosts}

URL関連のストレージエンジンとテーブル関数で使用が許可されているホストのリスト。

`\<host\>` XML タグでホストを追加する際には、以下の点に注意してください：
- URL と同じように正確に指定する必要があります。DNS解決前に名前がチェックされます。例えば：`<host>clickhouse.com</host>`
- URL にポートが明示的に指定されている場合は、ホスト:ポート全体がチェックされます。例えば：`<host>clickhouse.com:80</host>`
- ポートなしでホストが指定されている場合、そのホストの任意のポートが許可されます。例えば、`<host>clickhouse.com</host>` が指定された場合、`clickhouse.com:20`（FTP）、`clickhouse.com:80`（HTTP）、`clickhouse.com:443`（HTTPS）などが許可されます。
- ホストがIPアドレスとして指定される場合、URLに指定された通りにチェックされます。例えば：[2a02:6b8:a::a]。
- リダイレクトがあり、リダイレクトのサポートが有効になっている場合、すべてのリダイレクト（ロケーションフィールド）がチェックされます。

例えば：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## timezone {#timezone}

サーバーのタイムゾーン。

UTCタイムゾーンまたは地理的ロケーションのIANA識別子として指定されます（例：Africa/Abidjan）。

タイムゾーンは、文字列と DateTime フォーマット間の変換に必要で、DateTime フィールドがテキスト形式で出力されるとき（画面またはファイルに印刷される時）や文字列から DateTime を取得する時に使用されます。また、入力パラメータにタイムゾーンが渡されなかった場合に、時間と日付を操作する関数にも使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連情報**

- [session_timezone](../settings/settings.md#session_timezone)

## tcp_port {#tcp_port}

クライアントとのTCPプロトコルによる通信に使用するポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```

## tcp_port_secure {#tcp_port_secure}

クライアントとのセキュアな通信用のTCPポート。 [OpenSSL](#openssl) 設定と一緒に使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## mysql_port {#mysql_port}

MySQLプロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します
- 空の値はMySQLプロトコル経由のクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<mysql_port>9004</mysql_port>
```

## postgresql_port {#postgresql_port}

PostgreSQLプロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します
- 空の値はMySQLプロトコル経由のクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```

## tmp_path {#tmp_path}

大きなクエリの処理のために一時データを格納するためのローカルファイルシステム上のパス。

:::note
- 一時データストレージを設定するために使用できるオプションは1つだけです：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
- 末尾のスラッシュは必須です。
:::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## url_scheme_mappers {#url_scheme_mappers}

短縮されたURLプレフィックスまたはシンボリックURLプレフィックスを完全なURLに変換するための設定。

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

ユーザーファイルのディレクトリ。テーブル関数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## user_scripts_path {#user_scripts_path}

ユーザースクリプトファイルのディレクトリ。実行可能なユーザー定義関数 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions) 用に使用されます。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

## user_defined_path {#user_defined_path}

ユーザー定義ファイルのディレクトリ。SQLユーザー定義関数 [SQL User Defined Functions](/sql-reference/functions/udf) 用に使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## users_config {#users_config}

以下が含まれるファイルへのパス：

- ユーザー設定。
- アクセス権。
- 設定プロファイル。
- クォータ設定。

**例**

```xml
<users_config>users.xml</users_config>
```

## validate_tcp_client_information {#validate_tcp_client_information}

クエリパケットを受信する際にクライアント情報の検証が有効かどうかを決定します。

デフォルトでは、`false`です：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```

## access_control_improvements {#access_control_improvements}

アクセス制御システムのオプション改善の設定。

| 設定                                           | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | デフォルト |
|------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`      | 行ポリシーのないユーザーが `SELECT` クエリを使用して行を読み取れるかどうかを設定します。例えば、ユーザー A と B がいて、行ポリシーが A のみのために定義されている場合、この設定が true のとき、ユーザー B はすべての行を見ることができます。この設定が false のとき、ユーザー B は行を一切見ることができません。                                                                                                            | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` クエリが `CLUSTER` 権限を必要とするかどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>` が何らかの権限を必要とし、任意のユーザーによって実行できるかどうかを設定します。true に設定した場合、このクエリは `GRANT SELECT ON system.<table>` を必要とし、非システムテーブルと同様に扱われます。例外としていくつかのシステムテーブル（`tables`、`columns`、`databases`、および `one`、`contributors` などの一定テーブル）はすべての人がアクセスできます。                                    | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` が何らかの権限を必要とし、任意のユーザーによって実行できるかどうかを設定します。true に設定した場合、このクエリは `GRANT SELECT ON information_schema.<table>` を必要とし、通常のテーブルと同様に扱われます。                                                                                                                                                                                                  | `true`  |
| `settings_constraints_replace_previous`         | 設定プロファイルの制約がその設定の以前の制約（他のプロファイルで定義されたもの）の動作をキャンセルするかどうかを設定します。また、設定フィールドが新しい制約によって設定されていない場合でも、適用されることになります。また、`changeable_in_readonly` 制約タイプも有効にします。                                                                                                                                                                               | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンでテーブルを作成する際に権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`            | ロールがロールキャッシュに保持される、最後のアクセスからの秒数を設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                 | `600`   |

例：

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

`s3queue_log` システムテーブルの設定。

<SystemLogParameters/>

デフォルト設定は：

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```

## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup}

この設定により、`dictionaries_lazy_load` が `false` の場合の動作を指定できます。
（`dictionaries_lazy_load` が `true` の場合、この設定は何の影響も与えません。）

`wait_dictionaries_load_at_startup` が `false` の場合、サーバーは起動時にすべての辞書を読み込み始め、接続を並行して受け付けます。
辞書がクエリで初めて使用されるとき、もしまだ読み込まれていない場合、その辞書が読み込まれるまでクエリは待機します。
`wait_dictionaries_load_at_startup` を `false` に設定すると、ClickHouse の起動が速くなりますが、一部のクエリは遅く実行される可能性があります（辞書が読み込まれるのを待たなければならないため）。

`wait_dictionaries_load_at_startup` が `true` の場合、サーバーは起動時にすべての辞書が読み込み終わるまで（成功したかどうかに関わらず）接続を受け付けません。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```

デフォルト：true

## zookeeper {#zookeeper}

ClickHouseが[ZooKeeper](http://zookeeper.apache.org/) クラスターと対話するための設定を含みます。ClickHouseは、レプリケートされたテーブルを使用する際のレプリカのメタデータの格納にZooKeeperを使用します。レプリケートテーブルを使用していない場合、このパラメータセクションは省略できます。

以下の設定がサブタグによって構成できます：

| 設定                                    | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                  | ZooKeeperエンドポイント。複数のエンドポイントを設定できます。例：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性は、ZooKeeperクラスターに接続しようとする際のノードの順序を指定します。                                                                                                                                                                                                                                                |
| `session_timeout_ms`                    | クライアントセッションの最大タイムアウト（ミリ秒）。                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `operation_timeout_ms`                  | 1つの操作の最大タイムアウト（ミリ秒）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `root`（オプション）                    | ClickHouseサーバーが使用するznodeのルートとして使用されるznodeです。                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `fallback_session_lifetime.min`（オプション） | プライマリが利用できない場合にフォールバックノードへのZooKeeperセッションの最小寿命の制限（負荷分散）。秒単位で設定します。デフォルト：3時間。                                                                                                                                                                                                                                                                                                                                                        |
| `fallback_session_lifetime.max`（オプション） | プライマリが利用できない場合にフォールバックノードへのZooKeeperセッションの最大寿命の制限（負荷分散）。秒単位で設定します。デフォルト：6時間。                                                                                                                                                                                                                                                                                                                                                        |
| `identity`（オプション）                | 要求されたznodeにアクセスするためにZooKeeperによって必要とされるユーザー名とパスワード。                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression`（オプション）         | true に設定すると、Keeperプロトコルでの圧縮を有効にします。                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

また、ZooKeeperノード選択のアルゴリズムを選択できる (`zookeeper_load_balancing`) 設定（オプション）があります：

| アルゴリズム名             | 説明                                                                                                                             |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| `random`               | ZooKeeperノードの1つをランダムに選択します。                                                                                          |
| `in_order`             | 最初のZooKeeperノードを選択し、利用できない場合は次を選択します。                                                                        |
| `nearest_hostname`     | サーバーのホスト名に最も似たZooKeeperノードを選択し、ホスト名は名前の接頭辞で比較されます。                                                 |
| `hostname_levenshtein_distance` | nearest_hostname と同様ですが、levenshtein距離でホスト名を比較します。                                                              |
| `first_or_random`      | 最初のZooKeeperノードを選択し、利用できない場合は残りのZooKeeperノードの中からランダムに選択します。                                         |
| `round_robin`          | 最初のZooKeeperノードを選択し、再接続時には次を選択します。                                                                             |

**例の設定**

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
    <!-- オプション。Chrootのサフィックス。存在する必要があります。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- オプション。ZooKeeperのダイジェストACL文字列。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**関連情報**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper Programmer's Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouseとZooKeeper間のオプションのセキュア通信](/operations/ssl-zookeeper)

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeperにおけるデータパーツヘッダーのストレージ方法。この設定は[`MergeTree`](/engines/table-engines/mergetree-family)ファミリーにのみ適用されます。以下のように指定できます：

**グローバルに `config.xml` の [merge_tree](#merge_tree) セクションで**

ClickHouseはすべてのテーブルでこの設定を使用します。設定はいつでも変更できます。既存のテーブルは、設定が変更されたときに挙動が変わります。

**各テーブルごとに**

テーブルを作成する際に、対応する[エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)を指定します。この設定を持つ既存のテーブルの挙動は、グローバル設定が変更されても変わりません。

**可能な値**

- `0` — 機能はオフになります。
- `1` — 機能はオンになります。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) の場合、[replicated](../../engines/table-engines/mergetree-family/replication.md) テーブルはデータパーツのヘッダーを単一の `znode` を使ってコンパクトに格納します。テーブルに多くのカラムが含まれている場合、このストレージ方法はZooKeeperに格納されるデータのボリュームを大幅に削減します。

:::note
`use_minimalistic_part_header_in_zookeeper = 1` を適用した後、この設定をサポートしていないバージョンにClickHouseサーバーをダウングレードすることはできなくなります。クラスター内のサーバーのClickHouseをアップグレードする際は注意してください。一度にすべてのサーバーをアップグレードしないでください。新しいバージョンのClickHouseをテスト環境やクラスターの数台のサーバーでテストする方が安全です。

この設定で既に保存されたデータパートヘッダーは、以前の（非コンパクト）表現に戻すことはできません。
:::

タイプ：UInt8

デフォルト：0

## distributed_ddl {#distributed_ddl}

クラスター上での[分散DDLクエリ](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）の実行を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) が有効な場合のみ動作します。

`<distributed_ddl>` 内の設定には以下が含まれます：

| 設定                  | 説明                                                                                                                                             | デフォルト値                       |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|
| `path`               | DDLクエリの `task_queue` 用のKeeper内のパス                                                                                                   |                                   |
| `profile`            | DDLクエリを実行するために使用されるプロファイル                                                                                             |                                   |
| `pool_size`          | 同時に実行できる `ON CLUSTER` クエリの数                                                                                                        |                                   |
| `max_tasks_in_queue` | キュー内に存在できる最大タスク数                                                                                                             | `1,000`                           |
| `task_max_lifetime`  | タスクがこの値を超えると、ノードが削除されます。                                                                                                 | `7 * 24 * 60 * 60`（1週間の秒数） |
| `cleanup_delay_period` | 最後のクリーンアップが行われてから `cleanup_delay_period` 秒後に新しいノードイベントが受信されるとクリーンアップが開始されます。                     | `60`秒                            |

**例**

```xml
<distributed_ddl>
    <!-- ZooKeeper内のDDLクエリのキューのパス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- DDLクエリを実行するためにこのプロファイルの設定が使用されます -->
    <profile>default</profile>

    <!-- 同時に実行できるON CLUSTERクエリの量を制御します。 -->
    <pool_size>1</pool_size>

    <!--
         クリーンアップ設定（アクティブなタスクは削除されません）
    -->

    <!-- タスクのTTLを制御します（デフォルトは1週間） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- クリーンアップがどれだけ頻繁に実行されるかを制御します（秒単位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- キュー内に存在できるタスクの数を制御します -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## access_control_path {#access_control_path}

クリックハウスサーバーがSQLコマンドによって作成されたユーザーおよびロール設定を保存するフォルダへのパス。

**関連情報**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)

タイプ：文字列

デフォルト：`/var/lib/clickhouse/access/`。

## allow_plaintext_password {#allow_plaintext_password}

プレーンテキストのパスワードタイプ（安全でない）が許可されているかどうかを設定します。

デフォルト： `1`（authType プレーンテキストパスワードが許可されている）

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow_no_password {#allow_no_password}

パスワードがない安全でないタイプが許可されているかどうかを設定します。

デフォルト： `1`（authType パスワードなしが許可されている）

```xml
<allow_no_password>1</allow_no_password>
```

## allow_implicit_no_password {#allow_implicit_no_password}

'IDENTIFIED WITH no_password' が明示的に指定されていない限り、パスワードなしのユーザーを作成することを禁じます。

デフォルト： `1`

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## default_session_timeout {#default_session_timeout}

デフォルトのセッションタイムアウト（秒単位）。

デフォルト： `60`

```xml
<default_session_timeout>60</default_session_timeout>
```

## default_password_type {#default_password_type}

`CREATE USER u IDENTIFIED BY 'p'` のようなクエリに対して自動的に設定されるパスワードタイプを設定します。

受け入れられる値は：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
``` 
```
## user_directories {#user_directories}

設定を含む設定ファイルのセクション：
- 事前定義されたユーザーのための設定ファイルへのパス。
- SQLコマンドによって作成されたユーザーが保存されるフォルダーへのパス。
- SQLコマンドによって作成されたユーザーが保存され、レプリケーションされるZooKeeperノードパス（実験的）。

このセクションが指定された場合、[users_config](/operations/server-configuration-parameters/settings#users_config) および [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) のパスは使用されません。

`user_directories` セクションは任意の数の項目を含むことができ、項目の順序は優先順位を意味します（項目が上にあるほど優先順位が高い）。

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

ユーザー、ロール、行ポリシー、クォータ、およびプロファイルもZooKeeperに保存できます：

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

LDAPサーバーに情報を保存するための `memory` セクションと `ldap` セクションを定義することもできます。

ローカルで定義されていないユーザーのリモートユーザーディレクトリとしてLDAPサーバーを追加するには、以下の設定を持つ単一の `ldap` セクションを定義します：

| 設定     | 説明                                                                                             |
|----------|--------------------------------------------------------------------------------------------------|
| `server` | `ldap_servers` 設定セクションで定義されたLDAPサーバー名の1つ。このパラメータは必須であり、空であってはいけません。 |
| `roles`  | LDAPサーバーから取得した各ユーザーに割り当てられるローカルで定義されたロールのリストを含むセクション。ロールが指定されていない場合、ユーザーは認証後に何のアクションも実行できません。 |

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

各エントリーが `<name>/path/to/file</name>` フォーマットのカスタムトップレベルドメインのリストを定義します。

例えば：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

関連情報：
- 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) およびその変種は、カスタムTLDリスト名を受け取り、最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分を返します。

## total_memory_profiler_step {#total_memory_profiler_step}

各ピークアロケーションステップでスタックトレースのメモリサイズ（バイト単位）を設定します。このデータは、`query_id` が空の文字列である [system.trace_log](../../operations/system-tables/trace_log.md) システムテーブルに保存されます。

デフォルト: `4194304`。

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

ランダムアロケーションとデアロケーションを収集し、指定された確率で `MemorySample` の `trace_type` が設定された [system.trace_log](../../operations/system-tables/trace_log.md) システムテーブルに書き込むことを許可します。この確率は、アロケーションのサイズに関係なく、各アロケーションまたはデアロケーションに対して適用されます。追跡されていないメモリの量が追跡されていないメモリ制限（デフォルト値は `4` MiB）を超えたときのみサンプリングが発生します。 [total_memory_profiler_step](#total_memory_profiler_step) が低くされた場合、これを下げることができます。 `total_memory_profiler_step` を `1` に設定すると、より細かいサンプリングが可能です。

可能な値：
- 正の整数。
- `0` — `system.trace_log` システムテーブルにランダムアロケーションとデアロケーションの書き込みが無効になります。

デフォルト: `0`。

## compiled_expression_cache_size {#compiled_expression_cache_size}

[compiled expressions](../../operations/caches.md) のキャッシュサイズ（バイト単位）を設定します。

デフォルト: `134217728`。

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

[compiled expressions](../../operations/caches.md) のキャッシュサイズ（要素単位）を設定します。

デフォルト: `10000`。

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

テーブル、データベース、テーブル関数、および辞書に対する `SHOW` および `SELECT` クエリでシークレットを表示するかどうかを有効または無効にします。

シークレットを表示するユーザーは、[`format_display_secrets_in_show_and_select` format setting](../settings/formats#format_display_secrets_in_show_and_select) をオンにし、[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限を持つ必要があります。

可能な値：
- `0` — 無効。
- `1` — 有効。

デフォルト: `0`

## proxy {#proxy}

HTTPおよびHTTPSリクエストのためのプロキシサーバーを定義します。これは現在、S3ストレージ、S3テーブル関数、およびURL関数でサポートされています。

プロキシサーバーを定義する方法は3つあります：
- 環境変数
- プロキシリスト
- リモートプロキシリゾルバ

特定のホストに対してプロキシサーバーをバイパスすることも、`no_proxy` を使用してサポートされています。

**環境変数**

`http_proxy` および `https_proxy` 環境変数を使用して、特定のプロトコルのためのプロキシサーバーを指定できます。システムでこれが設定されている場合、シームレスに機能するはずです。

これは、特定のプロトコルに対して1つのプロキシサーバーしかない場合、最も簡単なアプローチです。

**プロキシリスト**

このアプローチでは、プロトコルのために1つ以上のプロキシサーバーを指定できます。プロキシサーバーが1つ以上定義されている場合、ClickHouseはラウンドロビン方式で異なるプロキシを使用し、サーバー間で負荷を均等に分配します。

**設定テンプレート**

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

以下のタブから親フィールドを選択してその子を表示してください：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド     | 説明                               |
|----------------|------------------------------------|
| `<http>`       | 1つ以上のHTTPプロキシのリスト     |
| `<https>`      | 1つ以上のHTTPSプロキシのリスト   |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド   | 説明                   |
|--------------|------------------------|
| `<uri>`      | プロキシのURI         |

  </TabItem>
</Tabs>

**リモートプロキシリゾルバ**

プロキシサーバーが動的に変更される可能性があります。その場合、リゾルバのエンドポイントを定義できます。ClickHouseはそのエンドポイントに空のGETリクエストを送信し、リモートリゾルバはプロキシホストを返す必要があります。ClickHouseはそれを使用して次のテンプレートでプロキシURIを形成します：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**設定テンプレート**

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

以下のタブから親フィールドを選択してその子を表示してください：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド    | 説明                          |
|---------------|-------------------------------|
| `<http>`      | 1つ以上のリゾルバのリスト**   |
| `<https>`     | 1つ以上のリゾルバのリスト**   |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド        | 説明                                         |
|-------------------|---------------------------------------------|
| `<resolver>`      | リゾルバのエンドポイントおよびその他の詳細  |

:::note
複数の `<resolver>` 要素を持つことができますが、特定のプロトコルに対して最初の `<resolver>` のみが使用されます。そのプロトコルに対する他の `<resolver>` 要素は無視されます。つまり、負荷分散（必要な場合）はリモートリゾルバによって実装されるべきです。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| フィールド               | 説明                                                                                                                                                                            |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`             | プロキシリゾルバのURI                                                                                                                                                          |
| `<proxy_scheme>`         | 最終プロキシURIのプロトコル。この値は `http` または `https` のいずれかです。                                                                                                              |
| `<proxy_port>`           | プロキシリゾルバのポート番号                                                                                                                                                  |
| `<proxy_cache_time>`     | ClickHouseがリゾルバからの値をキャッシュする秒数。この値を `0` に設定すると、すべてのHTTPまたはHTTPSリクエストごとにClickHouseがリゾルバに連絡します。 |

  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決定されます：

| 順序 | 設定                    |
|------|-----------------------|
| 1.   | リモートプロキシリゾルバ |
| 2.   | プロキシリスト          |
| 3.   | 環境変数              |

ClickHouseはリクエストプロトコルのために最高優先度リゾルバタイプを確認します。定義されていない場合は、次に高い優先度のリゾルバタイプをチェックし、環境リゾルバに達するまで続けます。これにより、リゾルバタイプの組み合わせを使用できます。

## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

デフォルトでは、トンネリング（つまり、`HTTP CONNECT`）はHTTPプロキシを介して`HTTPS`リクエストを行うために使用されます。この設定はそれを無効にするために使用できます。

**no_proxy**

デフォルトでは、すべてのリクエストはプロキシを介して行われます。特定のホストに対してこれを無効にするには、`no_proxy` 変数を設定する必要があります。
これは、リストとリモートリゾルバの `<proxy>` 節内で設定され、環境リゾルバのための環境変数としても設定できます。
IPアドレス、ドメイン、サブドメイン、および完全バイパスのための `'*'` ワイルドカードをサポートしています。先頭のドットはcurlと同じように削除されます。

**例**

以下の設定は、`clickhouse.cloud` とそのすべてのサブドメイン（例、`auth.clickhouse.cloud`）へのプロキシリクエストをバイパスします。同様のことがGitLabにも適用され、先頭のドットがあっても同様です。`gitlab.com` と `about.gitlab.com` の両方がプロキシをバイパスします。

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

テーブルに添付されるマテリアライズドビューの最大数に対する制限です。

:::note
ここでは直接依存しているビューのみが考慮されており、一つのビューの上に別のビューを作成することは考慮されていません。
:::

デフォルト: `0`。

## format_alter_operations_with_parentheses {#format_alter_operations_with_parentheses}

`true` に設定すると、整形されたクエリ内の変更操作が括弧で囲まれます。これにより、整形された変更クエリの解析があいまいさが少なくなります。

タイプ: `Bool`

デフォルト: `0`

## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}

`true` の場合、ClickHouseは `CREATE VIEW` クエリで空のSQLセキュリティステートメントのデフォルトを書き込みません。

:::note
この設定はマイグレーション期間中のみ必要であり、24.4で古くなります。
:::

タイプ: `Bool`

デフォルト: `1`

## merge_workload {#merge_workload}

マージとその他のワークロード間でリソースがどのように使用され、共有されるかを規制するために使用されます。指定された値は、すべてのバックグラウンドマージの `workload` 設定値として使用されます。マージツリー設定で上書きすることができます。

タイプ: `String`

デフォルト: `default`

**関連情報**
- [Workload Scheduling](/operations/workload-scheduling.md)

## mutation_workload {#mutation_workload}

ミューテーションとその他のワークロード間でリソースがどのように使用され、共有されるかを規制するために使用されます。指定された値は、すべてのバックグラウンドミューテーションの `workload` 設定値として使用されます。マージツリー設定で上書きすることができます。

**関連情報**
- [Workload Scheduling](/operations/workload-scheduling.md)

タイプ: `String`

デフォルト: `default`

## throw_on_unknown_workload {#throw_on_unknown_workload}

`workload` クエリ設定に対して不明な WORKLOAD にアクセスする際の動作を定義します。

- `true` の場合、不明なワークロードにアクセスしようとするクエリから `RESOURCE_ACCESS_DENIED` 例外がスローされます。これは、WORKLOAD 階層が確立され、WORKLOAD デフォルトが含まれるようにリソーススケジューリングを強制するのに便利です。
- `false`（デフォルト）の場合、不明な WORKLOAD を指す `workload` 設定を持つクエリに、リソーススケジューリングなしで制限なくアクセスが提供されます。これは、WORKLOAD 階層が設定されている間、WORKLOAD デフォルトが追加される前に重要です。

**関連情報**
- [Workload Scheduling](/operations/workload-scheduling.md)

タイプ: String

デフォルト: false

**例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

## workload_path {#workload_path}

すべての `CREATE WORKLOAD` と `CREATE RESOURCE` クエリのストレージとして使用されるディレクトリ。デフォルトでは、サーバーの作業ディレクトリの `/workload/` フォルダーが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**関連情報**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)

## workload_zookeeper_path {#workload_zookeeper_path}

すべての `CREATE WORKLOAD` と `CREATE RESOURCE` クエリのストレージとして使用されるZooKeeperノードへのパス。一貫性のために、すべてのSQL定義はこの単一のznodeの値として保存されます。デフォルトで、ZooKeeperは使用されず、定義は[ディスク](#workload_path)に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**関連情報**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)

## use_legacy_mongodb_integration {#use_legacy_mongodb_integration}

レガシーMongoDB統合実装を使用します。非推奨。

タイプ: `Bool`

デフォルト: `true`。

## max_authentication_methods_per_user {#max_authentication_methods_per_user}

ユーザーを作成または変更する際に使用できる認証メソッドの最大数。
この設定を変更しても既存のユーザーには影響しません。指定された設定の制限を超えた認証関連のクエリを作成/変更しようとすると失敗します。
非認証の作成/変更クエリは成功します。

:::note
`0` の値は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `100`

## allow_feature_tier {#allow_feature_tier}

ユーザーが異なる機能レベルに関連する設定を変更できるかどうかを制御します。

- `0` - すべての設定の変更が許可されます（実験的、ベータ、製品）。
- `1` - ベータおよび製品機能設定の変更のみが許可されます。実験的設定の変更は拒否されます。
- `2` - 製品設定の変更のみが許可されます。実験的またはベータ設定の変更は拒否されます。

これはすべての `EXPERIMENTAL` / `BETA` 機能に対して読み取り専用の制約を設定することと同等です。

:::note
`0` の値はすべての設定の変更が可能であることを意味します。
:::
