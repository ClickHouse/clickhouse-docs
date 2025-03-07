---
slug: '/operations/server-configuration-parameters/settings'
sidebar_position: 57
sidebar_label: 'グローバルサーバー設定'
description: 'このセクションには、セッションまたはクエリレベルで変更できないサーバー設定の説明が含まれています。'
keywords: ['グローバルサーバー設定']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md'


# グローバルサーバー設定

このセクションには、セッションまたはクエリレベルで変更できないサーバー設定の説明が含まれています。これらの設定は、ClickHouseサーバーの `config.xml` ファイルに格納されています。ClickHouseの構成ファイルに関する詳細については、["Configuration Files"](/operations/configuration-files) をご覧ください。

他の設定については、"[Settings](/operations/settings/overview)" セクションで記述されています。
設定を学ぶ前に、[Configuration files](/operations/configuration-files) セクションを読むことをお勧めし、代入の使用（`incl` および `optional` 属性）に注意してください。

## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

jemallocメモリの使用を許可します。

タイプ: `Bool`

デフォルト: `1`

## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

非同期メトリクスを更新するための秒数の期間。

タイプ: `UInt32`

デフォルト: `120`

## asynchronous_metric_log {#asynchronous_metric_log}

ClickHouse Cloudのデプロイメントではデフォルトで有効です。

この設定があなたの環境でデフォルトで有効でない場合は、ClickHouseがインストールされた方法に応じて、以下の指示に従ってそれを有効または無効にすることができます。

**有効化**

非同期メトリクスログ履歴の収集を手動で有効にするには、[`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)用に次の内容で `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します：

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

`asynchronous_metric_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` ファイルを作成する必要があります：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

非同期メトリクスを更新するための秒数の期間。

タイプ: `UInt32`

デフォルト: `1`

## auth_use_forwarded_address {#auth_use_forwarded_address}

プロキシ経由で接続されたクライアントの認証に元のアドレスを使用します。

:::note
この設定は、転送されたアドレスが簡単に偽造できるため、特に注意して使用する必要があります。このような認証を受け入れるサーバーには直接アクセスせず、信頼できるプロキシを通じてのみアクセスするべきです。
:::

タイプ: `Bool`

デフォルト: `0`

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

バックグラウンドで [Buffer-engine tables](/engines/table-engines/special/buffer) に対するフラッシュ操作を実行するために使用されるスレッドの最大数。

タイプ: `UInt64`

デフォルト: `16`

## background_common_pool_size {#background_common_pool_size}

バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルのさまざまな操作（主にガベージコレクション）を実行するために使用されるスレッドの最大数。

タイプ: `UInt64`

デフォルト: `8`

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

分散送信を実行するために使用されるスレッドの最大数。

タイプ: `UInt64`

デフォルト: `16`

## background_fetches_pool_size {#background_fetches_pool_size}

バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルの別のレプリカからデータパーツを取得するために使用されるスレッドの最大数。

タイプ: `UInt64`

デフォルト: `16`

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

同時に実行できるバックグラウンドマージと変異のスレッド数の比率を設定します。

例えば、比率が 2 で [`background_pool_size`](#background_pool_size) が 16 に設定されている場合、ClickHouse は 32 のバックグラウンドマージを同時に実行できます。これは、バックグラウンド操作を一時停止や延期することができるためです。小さいマージにより実行優先度を与える必要があります。

:::note
この比率は、実行時にのみ増加させることができます。下げるにはサーバーを再起動する必要があります。

[`background_pool_size`](#background_pool_size) 設定と同様に、[`background_merges_mutations_concurrency_ratio`](#background_merges_mutations_concurrency_ratio) は、互換性のために `default` プロファイルから適用される可能性があります。
:::

タイプ: `Float`

デフォルト: `2`

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

バックグラウンドマージと変異のスケジューリングを行うためのポリシー。可能な値は `round_robin` と `shortest_task_first` です。

バックグラウンドスレッドプールによって実行される次のマージまたは変異を選択するために使用されるアルゴリズム。ポリシーはサーバーを再起動せずに実行時に変更することができます。

互換性のために `default` プロファイルから適用される可能性があります。

可能な値：

- `round_robin` — すべての同時マージおよび変異がラウンドロビン順に実行され、飢餓のない操作を保証します。小さいマージは、大きいマージよりもブロックが少ないため、より早く完了します。
- `shortest_task_first` — 常に小さいマージまたは変異を実行します。マージと変異は、その結果のサイズに基づいて優先順位が割り当てられます。小さいサイズのマージは大きいものより厳格に優先されます。このポリシーは、小さなパーツの迅速なマージを保証しますが、`INSERT` によって過度に負荷がかかっているパーティションでは大きなマージの無期限の飢餓を引き起こす可能性があります。

タイプ: String

デフォルト: `round_robin`

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

メッセージストリーミングのバックグラウンド操作を実行するために使用されるスレッドの最大数。

タイプ: UInt64

デフォルト: `16`

## background_move_pool_size {#background_move_pool_size}

バックグラウンドで *MergeTree-engine テーブルの別のディスクまたはボリュームにデータパーツを移動するために使用されるスレッドの最大数。

タイプ: UInt64

デフォルト: `8`

## background_schedule_pool_size {#background_schedule_pool_size}

レプリケートテーブル、Kafkaストリーミング、DNSキャッシュの更新に対して、定期的に軽量な操作を継続的に実行するために使用されるスレッドの最大数。

タイプ: UInt64

デフォルト: `512`

## backups {#backups}

`BACKUP TO File()` を使用して書き込むときに使用されるバックアップの設定。

次の設定はサブタグによって構成できます：

| 設定                              | 説明                                                                                                                                                                     | デフォルト |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| `allowed_path`                   | `File()` を使用する際のバックアップ先パス。この設定は `File` を使用するために設定する必要があります。パスはインスタンスディレクトリに対する相対パス、または絶対パスのいずれかです。 | `true`    |
| `remove_backup_files_after_failure` | `BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップにコピーされた既存のファイルを削除しようとします。さもなければ、コピーされたファイルはそのままとなります。 | `true`    |

この設定はデフォルトで次のように構成されています：

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```

## backup_threads {#backup_threads}

`BACKUP` リクエストを実行するための最大スレッド数。

タイプ: `UInt64`

デフォルト: `16`

## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

バックアップIOスレッドプールにスケジュールできるジョブの最大数。現在のS3バックアップロジックにより、このキューは無制限に保つことをお勧めします。

:::note
`0` の値（デフォルト）は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## bcrypt_workfactor {#bcrypt_workfactor}

[バイクリプトアルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)を使用するbcrypt_password認証タイプの作業係数。

デフォルト: `12`

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

RAM最大比率に対するキャッシュサイズを設定します。メモリの少ないシステムでのキャッシュサイズを減少させることを許可します。

タイプ: `Double`

デフォルト: `0.5`

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

すべてのクエリを実行するために許可された最大のクエリ処理スレッド数（リモートサーバーからデータを取得するためのスレッドを除く）。これは厳密な制限ではありません。制限に達した場合でもクエリは少なくとも1つのスレッドを得て、より多くのスレッドが使用可能になった場合、実行の間に望ましいスレッド数にスケールアップすることができます。

:::note
`0` の値（デフォルト）は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) と同様ですが、コアに対する比率です。

タイプ: `UInt64`

デフォルト: `0`

## concurrent_threads_scheduler {#concurrent_threads_scheduler}

`concurrent_threads_soft_limit_num` および `concurrent_threads_soft_limit_ratio_to_cores` で指定されたCPUスロットのスケジューリングをどう実施するかのポリシー。限られた数のCPUスロットが同時クエリ間でどのように分配されるかを管理するためのアルゴリズム。スケジューラは、サーバーの再起動なしで実行時に変更可能です。

タイプ: String

デフォルト: `round_robin`

可能な値：

- `round_robin` — `use_concurrency_control` = 1 の設定を持つすべてのクエリは、最大 `max_threads` CPUスロットを割り当てます。スレッドごとに1スロット。競合時には、CPUスロットはラウンドロビン方式でクエリに付与されます。最初のスロットは無条件に付与されるため、高い `max_threads` のクエリの不公平さと遅延が増す可能性があります。
- `fair_round_robin` — `use_concurrency_control` = 1 の設定を持つすべてのクエリは、最大 `max_threads - 1` CPUスロットを割り当てます。すべてのクエリの最初のスレッドにはCPUスロットが必要ないラウンドロビンの変種。この方法では、`max_threads` = 1 のクエリはスロットを必要とせず、不公平にすべてのスロットを割り当てることはできません。無条件でスロットされることはありません。

## default_database {#default_database}

デフォルトのデータベース名。

タイプ: `String`

デフォルト: `default`

## disable_internal_dns_cache {#disable_internal_dns_cache}

内部DNSキャッシュを無効にします。Kubernetesなどの頻繁に変更されるインフラストラクチャでClickHouseを操作する際に推奨されます。

タイプ: `Bool`

デフォルト: `0`

## dns_cache_max_entries {#dns_cache_max_entries}

内部DNSキャッシュの最大エントリ数。

タイプ: `UInt64`

デフォルト: `10000`

## dns_cache_update_period {#dns_cache_update_period}

内部DNSキャッシュの更新期間（秒単位）。

タイプ: `Int32`

デフォルト: `15`

## dns_max_consecutive_failures {#dns_max_consecutive_failures}

ClickHouseのDNSキャッシュからホストを削除するまでの最大連続解決失敗数。

タイプ: `UInt32`

デフォルト: `10`

## index_mark_cache_policy {#index_mark_cache_policy}

インデックスマークキャッシュポリシー名。

タイプ: `String`

デフォルト: `SLRU`

## index_mark_cache_size {#index_mark_cache_size}

インデックスマークのキャッシュの最大サイズ。

:::note
`0` の値は無効を意味します。この設定は実行時に変更可能で、即座に効果を持ちます。
:::

タイプ: `UInt64`

デフォルト: `0`

## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

インデックスマークキャッシュの保護キューのサイズ（SLRUポリシーの場合）、キャッシュの総サイズに対して。

タイプ: `Double`

デフォルト: `0.5`

## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

インデックス非圧縮キャッシュポリシー名。

タイプ: `String`

デフォルト: `SLRU`

## index_uncompressed_cache_size {#index_uncompressed_cache_size}

`MergeTree` インデックスの非圧縮ブロックのキャッシュの最大サイズ。

:::note
`0` の値は無効を意味します。この設定は実行時に変更可能で、即座に効果を持ちます。
:::

タイプ: `UInt64`

デフォルト: `0`

## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

インデックス非圧縮キャッシュの保護キューのサイズ（SLRUポリシーの場合）、キャッシュの総サイズに対して。

タイプ: `Double`

デフォルト: `0.5`

## skipping_index_cache_policy {#skipping_index_cache_policy}

スキッピングインデックスキャッシュポリシー名。

タイプ: `String`

デフォルト: `SLRU`

## skipping_index_cache_size {#skipping_index_cache_size}

スキッピングインデックスのキャッシュサイズ。ゼロは無効を意味します。

:::note
この設定は実行時に変更可能で、即座に効果を持ちます。
:::

タイプ: `UInt64`

デフォルト: `5368709120` (= 5 GiB)

## skipping_index_cache_size_ratio {#skipping_index_cache_size_ratio}

スキッピングインデックスキャッシュの保護キューのサイズ（SLRUポリシーの場合）、キャッシュの総サイズに対して。

タイプ: `Double`

デフォルト: `0.5`

## skipping_index_cache_max_entries {#skipping_index_cache_max_entries}

スキッピングインデックスキャッシュの最大エントリ数。

タイプ: `UInt64`

デフォルト: `10000000`

## io_thread_pool_queue_size {#io_thread_pool_queue_size}

IOスレッドプールにスケジュールできるジョブの最大数。

:::note
`0` の値は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `10000`

## mark_cache_policy {#mark_cache_policy}

マークキャッシュのポリシー名。

タイプ: `String`

デフォルト: `SLRU`

## mark_cache_size {#mark_cache_size}

[`MergeTree`](/engines/table-engines/mergetree-family) テーブルファミリーのマーク（インデックス）のキャッシュの最大サイズ。

:::note
この設定は実行時に変更可能で、即座に効果を持ちます。
:::

タイプ: `UInt64`

デフォルト: `5368709120`

## mark_cache_size_ratio {#mark_cache_size_ratio}

マークキャッシュの保護キューのサイズ（SLRUポリシーの場合）、キャッシュの総サイズに対して。

タイプ: `Double`

デフォルト: `0.5`

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

サーバー全体のバックアップ用の最大読み取り速度（バイト/秒）。ゼロは無制限を意味します。

タイプ: `UInt64`

デフォルト: `0`

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

バックアップIOスレッドプールで **アイドル** スレッドの数が `max_backup_io_thread_pool_free_size` を超えた場合、ClickHouse はアイドルスレッドが占有していたリソースを解放し、プールのサイズを減少させます。必要に応じてスレッドは再作成されます。

タイプ: `UInt64`

デフォルト: `0`

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

ClickHouse はバックアップIO操作を行うためにバックアップIOスレッドプールのスレッドを使用します。`max_backups_io_thread_pool_size` はプール内のスレッドの最大数を制限します。

タイプ: `UInt64`

デフォルト: `1000`

## max_concurrent_queries {#max_concurrent_queries}

同時に実行されるクエリの総数の制限。`INSERT` および `SELECT` クエリの制限、およびユーザーの最大クエリ数も考慮されなければなりません。

参照：
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings/#max_concurrent_queries_for_all_users)

:::note
`0` の値（デフォルト）は無制限を意味します。この設定は実行時に変更可能で、即座に効果を持ちます。すでに実行中のクエリは変更されません。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_concurrent_insert_queries {#max_concurrent_insert_queries}

同時に実行される挿入クエリの総数の制限。

:::note
`0` の値（デフォルト）は無制限を意味します。この設定は実行時に変更可能で、即座に効果を持ちます。すでに実行中のクエリは変更されません。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_concurrent_select_queries {#max_concurrent_select_queries}

同時に実行される選択クエリの総数の制限。

:::note
`0` の値（デフォルト）は無制限を意味します。この設定は実行時に変更可能で、即座に効果を持ちます。すでに実行中のクエリは変更されません。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_waiting_queries {#max_waiting_queries}

同時に待っているクエリの総数の制限。
待機中のクエリは、必要なテーブルが非同期で読み込まれている間はブロックされます（[`async_load_databases`](#async_load_databases) を参照）。

:::note
待機クエリは、以下の設定によって制御される制限を確認する際にはカウントされません：

- [`max_concurrent_queries`](#max_concurrent_queries)
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

この修正は、サーバー起動直後にこれらの制限に達するのを避けるために行われます。
:::

:::note
`0` の値（デフォルト）は無制限を意味します。この設定は実行時に変更可能で、即座に効果を持ちます。すでに実行中のクエリは変更されません。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_connections {#max_connections}

最大サーバー接続数。

タイプ: `Int32`

デフォルト: `1024`

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

IOスレッドプールで **アイドル** スレッドの数が `max_io_thread_pool_free_size` を超えた場合、ClickHouse はアイドルスレッドが占有していたリソースを解放し、プールのサイズを減少させます。必要に応じてスレッドは再作成されます。

タイプ: `UInt64`

デフォルト: `0`

## max_io_thread_pool_size {#max_io_thread_pool_size}

ClickHouse はS3とのやり取りを行うためにIOスレッドプールのスレッドを使用します。`max_io_thread_pool_size` はプール内のスレッドの最大数を制限します。

タイプ: `UInt64`

デフォルト: `100`

## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

ローカル読み取りの最大速度（バイト毎秒）。

:::note
`0` の値は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

ローカル書き込みの最大速度（バイト毎秒）。

:::note
`0` の値は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_partition_size_to_drop {#max_partition_size_to_drop}

パーティション削除の制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが [`max_partition_size_to_drop`](#max_partition_size_to_drop)（バイト単位）を超える場合、[DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) クエリを使用してパーティションを削除することはできません。
この設定を適用するために ClickHouse サーバーを再起動する必要はありません。制限を無効にする別の方法は、`<clickhouse-path>/flags/force_drop_table` ファイルを作成することです。

:::note
`0` の値は、制限なしでパーティションを削除できることを意味します。

この制限は、テーブルの削除やトランケートには制限をかけません。[max_table_size_to_drop](#max_table_size_to_drop) を参照してください。
:::

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```

タイプ: `UInt64`

デフォルト: `50`

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

リモート読み取りにおけるネットワークを介したデータ交換の最大速度（バイト毎秒）。

:::note
`0` の値（デフォルト）は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

リモート書き込みにおけるネットワークを介したデータ交換の最大速度（バイト毎秒）。

:::note
`0` の値（デフォルト）は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_server_memory_usage {#max_server_memory_usage}

総メモリ使用量に対する制限。
デフォルトの [`max_server_memory_usage`](#max_server_memory_usage) 値は `memory_amount * max_server_memory_usage_to_ram_ratio` として計算されます。

:::note
`0` の値（デフォルト）は無制限を意味します。
:::

タイプ: `UInt64`

デフォルト: `0`

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

[`max_server_memory_usage`](#max_server_memory_usage) と同様ですが、物理RAMに対する比率です。メモリの少ないシステムでのメモリ使用量を減少させることを許可します。

RAMとスワップが少ないホストでは、`max_server_memory_usage_to_ram_ratio` の設定を1を超えるようにする必要があります。

:::note
`0` の値は無制限を意味します。
:::

タイプ: `Double`

デフォルト: `0.9`

## max_build_vector_similarity_index_thread_pool_size {#server_configuration_parameters_max_build_vector_similarity_index_thread_pool_size}

ベクトルインデックスを構築するために使用されるスレッドの最大数。

:::note
`0` の値はすべてのコアを意味します。
:::

タイプ: `UInt64`

デフォルト: `16`

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

サーバーの最大許可メモリ消費量がcgroupsのしきい値によって調整される秒単位のインターバル。

cgroupオブザーバーを無効にするには、この値を `0` に設定します。

設定の参照：
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio)

タイプ: `UInt64`

デフォルト: `15`

## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio}

cgroupsによるサーバープロセスのメモリ消費の「ハード」しきい値を指定します。このしきい値を超えると、サーバーの最大メモリ消費量がしきい値の値に調整されます。

設定の参照：
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio)

タイプ: `Double`

デフォルト: `0.95`

## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio}

cgroupsによるサーバープロセスのメモリ消費の「ソフト」しきい値を指定します。このしきい値を超えると、jemalloc内のアリーナがパージされます。

設定の参照：
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroup_memory_watcher_hard_limit_ratio)

タイプ: `Double`

デフォルト: `0.9`

## max_database_num_to_warn {#max_database_num_to_warn}

接続されたデータベースの数が指定の値を超えた場合、ClickHouseサーバーは`system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

デフォルト: `1000`

## max_table_num_to_warn {#max_table_num_to_warn}

接続されたテーブルの数が指定の値を超えた場合、ClickHouseサーバーは`system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

デフォルト: `5000`

## max_view_num_to_warn {#max_view_num_to_warn}

接続されたビュの数が指定の値を超えた場合、ClickHouseサーバーは`system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

タイプ: `UInt64`

デフォルト: `10000`

## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

接続された辞書の数が指定の値を超えた場合、ClickHouseサーバーは`system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

タイプ: `UInt64`

デフォルト: `1000`

## max_part_num_to_warn {#max_part_num_to_warn}

アクティブなパーツの数が指定の値を超えた場合、ClickHouseサーバーは`system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

タイプ: `UInt64`

デフォルト: `100000`

## max_table_num_to_throw {#max_table_num_to_throw}

テーブルの数がこの値を超える場合、サーバーは例外をスローします。

以下のテーブルはカウントされません：
- view
- remote
- dictionary
- system

データベースエンジンのテーブルのみがカウントされます：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0` の値は制限なしを意味します。
:::

**例**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```

タイプ: `UInt64`

デフォルト: `0`

## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

レプリケートされたテーブルの数がこの値を超える場合、サーバーは例外をスローします。

データベースエンジンのテーブルのみがカウントされます：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0` の値は制限なしを意味します。
:::

**例**
```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```

タイプ: `UInt64`

デフォルト: `0`

## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

辞書の数がこの値を超える場合、サーバーは例外をスローします。

データベースエンジンのテーブルのみがカウントされます：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0` の値は制限なしを意味します。
:::

**例**
```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```

タイプ: `UInt64`

デフォルト: `0`

## max_view_num_to_throw {#max_view_num_to_throw}

ビューの数がこの値を超える場合、サーバーは例外をスローします。

データベースエンジンのテーブルのみがカウントされます：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0` の値は制限なしを意味します。
:::

**例**
```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```

タイプ: `UInt64`

デフォルト: `0`

## max_database_num_to_throw {#max-table-num-to-throw}

データベースの数がこの値を超える場合、サーバーは例外をスローします。

:::note
`0` の値（デフォルト）は制限なしを意味します。
:::

**例**

```xml
<max_database_num_to_throw>400</max_database_num_to_throw>
```

タイプ: `UInt64`

デフォルト: `0`

## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

外部集約、結合、またはソートに使用される最大ストレージ量。
この制限を超えるクエリは例外で失敗します。

:::note
`0` の値は無制限を意味します。
:::

参照：
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

タイプ: `UInt64`

デフォルト: `0`

## max_thread_pool_free_size {#max_thread_pool_free_size}

Global Threadプール内の **アイドル** スレッドの数が [`max_thread_pool_free_size`](#max_thread_pool_free_size) を超えた場合、ClickHouse は一部のスレッドが占有していたリソースを解放し、プールのサイズを減少させます。必要に応じてスレッドは再作成されます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

タイプ: `UInt64`

デフォルト: `0`

## max_thread_pool_size {#max_thread_pool_size}

ClickHouse はクエリを処理するために Global Thread プールのスレッドを使用します。クエリを処理するためのアイドルスレッドがない場合、プールに新しいスレッドが作成されます。`max_thread_pool_size` はプール内のスレッドの最大数を制限します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

タイプ: `UInt64`

デフォルト: `10000`
```
```yaml
title: '設定オプション'
sidebar_label: '設定オプション'
keywords: 'ClickHouse, 設定, オプション'
description: 'ClickHouseの設定オプションについての詳細'
```

## mmap_cache_size {#mmap_cache_size}

マップされたファイルのキャッシュサイズ（バイト単位）を設定します。この設定は、頻繁なオープン/クローズ呼び出しを回避することを可能にし（これにより結果としてページフォルトが発生し、多くのコストがかかる）、複数のスレッドとクエリからのマッピングの再利用を促します。設定値はマップされた領域の数（通常はマップされたファイルの数に等しい）です。

マップされたファイル内のデータ量は、以下のシステムテーブルで次のメトリクスを使って監視できます：

| システムテーブル                                                                                                                                                                                                                                                                                                                                                       | メトリクス                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) と [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                              | `MMappedFiles` と `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                     | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)  | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
マップされたファイル内のデータ量は直接メモリを消費せず、クエリやサーバーのメモリ使用量には計上されません—これはこのメモリがOSのページキャッシュと同様に破棄可能であるためです。キャッシュは、MergeTreeファミリーのテーブル内の古いパーツを削除すると自動的にドロップ（ファイルがクローズされる）されます。また、`SYSTEM DROP MMAP CACHE` クエリによって手動でドロップすることもできます。

この設定はランタイム中に変更可能であり、即時に効果を発揮します。
:::

タイプ: `UInt64`

デフォルト: `1000`
## restore_threads {#restore_threads}

RESTOREリクエストを実行するための最大スレッド数。

タイプ: UInt64

デフォルト: `16`
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

これがtrueに設定されていると、スタックトレースにアドレスが表示されます。

タイプ: `Bool`

デフォルト: `1`
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

trueに設定すると、ClickHouseはシャットダウン前に実行中のクエリが完了するのを待ちます。

タイプ: `Bool`

デフォルト: `0`
## table_engines_require_grant {#table_engines_require_grant}

trueに設定すると、特定のエンジンでテーブルを作成するためにユーザーに付与が要求されます。例: `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
デフォルトでは、特定のテーブルエンジンを持つテーブルの作成は付与を無視しますが、これをtrueに設定することでこの動作を変更できます。
:::

タイプ: `Bool`

デフォルト: `false`
## temporary_data_in_cache {#temporary_data_in_cache}

このオプションを使用すると、一時データが特定のディスクのキャッシュに保存されます。
このセクションでは、`cache`タイプのディスク名を指定する必要があります。
その場合、キャッシュと一時データは同じスペースを共有し、ディスクキャッシュは一時データを作成するために追放されることがあります。

:::note
一時データストレージの設定に使用できるオプションは1つだけです: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`。
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

グローバルスレッドプールにスケジュールできる最大ジョブ数。キューサイズを増やすと、メモリ使用量が増加します。この値は [`max_thread_pool_size`](#max_thread_pool_size) に等しく保つことが推奨されます。

:::note
`0`の値は無制限を意味します。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

タイプ: UInt64

デフォルト: `10000`
## tmp_policy {#tmp_policy}

一時データのためのストレージポリシー。詳細については、[MergeTree テーブルエンジン](/engines/table-engines/mergetree-family/mergetree)のドキュメントを参照してください。

:::note
- 一時データストレージの設定に使用できるオプションは1つだけです: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`。
- `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` は無視されます。
- ポリシーは*ローカル*ディスクを持つ*1つのボリューム*を持つ必要があります。
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
タイプ: String

デフォルト: ""
## uncompressed_cache_policy {#uncompressed_cache_policy}

非圧縮キャッシュポリシー名。

タイプ: String

デフォルト: `SLRU`
## uncompressed_cache_size {#uncompressed_cache_size}

MergeTreeファミリーのテーブルエンジンで使用される非圧縮データの最大キャッシュサイズ（バイト単位）。

サーバーには1つの共有キャッシュがあります。メモリは需要に応じて割り当てられます。`use_uncompressed_cache`オプションが有効の場合、キャッシュが使用されます。

非圧縮キャッシュは、特定のケースで非常に短いクエリに有利です。

:::note
`0`の値は無効化を意味します。

この設定はランタイム中に変更可能であり、即時に効果を発揮します。
:::

タイプ: UInt64

デフォルト: `0`
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio}

非圧縮キャッシュ内の保護キュー（SLRUポリシーの場合）のサイズは、キャッシュの総サイズに対する比率です。

タイプ: Double

デフォルト: `0.5`
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

組み込み辞書を再ロードする前の秒数の間隔。

ClickHouseは毎x秒ごとに組み込み辞書を再ロードします。これにより、サーバーを再起動することなく、「オンザフライ」で辞書を編集することが可能になります。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

タイプ: UInt64

デフォルト: `3600`
## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)エンジンのテーブルに対するデータ圧縮設定。

:::note
ClickHouseの使用を開始したばかりの場合は、これを変更しないことをお勧めします。
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

- `min_part_size` – データパートの最小サイズ。
- `min_part_size_ratio` – データパートサイズとテーブルサイズの比率。
- `method` – 圧縮方法。受け入れ可能な値: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`。
- `level` – 圧縮レベル。 [Codecs](/sql-reference/statements/create/table#general-purpose-codecs)を参照してください。

:::note
複数の`<case>`セクションを構成できます。
:::

**条件を満たした場合のアクション**:

- データパートが条件セットに一致する場合、ClickHouseは指定された圧縮方法を使用します。
- 複数の条件セットに一致する場合、ClickHouseは最初の一致した条件セットを使用します。

:::note
データパートに対する条件が満たされない場合、ClickHouseは`lz4`圧縮を使用します。
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

[暗号化コーデック](/sql-reference/statements/create/table#encryption-codecs)で使用するキーを取得するためのコマンドを構成します。キー（またはキー群）は環境変数に書き込むか、設定ファイルに設定する必要があります。

キーは16バイトの長さを持つ16進数または文字列である必要があります。

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
設定ファイルへのキーの保存は推奨されません。これは安全ではありません。キーを安全なディスクの別の設定ファイルに移動し、その設定ファイルへのシンボリックリンクを`config.d/`フォルダーに置くことができます。
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

ここで、`current_key_id`は暗号化のための現在のキーを設定し、指定されたすべてのキーは復号化に使用できます。

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

ここで、`current_key_id`は暗号化のための現在のキーを示します。

また、ユーザーは12バイトの長さのノンスを追加できます（デフォルトでは、暗号化および復号化プロセスは0バイトで構成されるノンスを使用します）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または、16進数で設定できます:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上記のすべてのことは`aes_256_gcm_siv`にも適用できます（ただし、キーは32バイトの長さである必要があります）。
:::
## error_log {#error_log}

デフォルトでは無効になっています。

**有効化**

エラーヒストリーコレクション [`system.error_log`](../../operations/system-tables/error_log.md) を手動でオンにするには、次のコンテンツで `/etc/clickhouse-server/config.d/error_log.xml` を作成します：

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

`error_log`設定を無効化するには、次の内容で `/etc/clickhouse-server/config.d/disable_error_log.xml` を作成する必要があります：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## custom_settings_prefixes {#custom_settings_prefixes}

[カスタム設定](/operations/settings/query-level#custom_settings) のプレフィックスのリスト。プレフィックスはカンマで区切る必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**参考**

- [カスタム設定](/operations/settings/query-level#custom_settings)
## core_dump {#core_dump}

コアダンプファイルサイズのソフトリミットを構成します。

:::note
ハードリミットはシステムツールを介して構成されます。
:::

**例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

デフォルト: `1073741824`
## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec}

ドロップされたテーブルが [`UNDROP`](/sql-reference/statements/undrop.md) ステートメントを使用して復元可能な遅延時間。`DROP TABLE` が `SYNC` 修飾子で実行されている場合、この設定は無視されます。
デフォルト値は `480`（8分）です。

デフォルト: `480`
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}

`store/` ディレクトリからのゴミを掃除するタスクのパラメータ。
もしサブディレクトリがclickhouse-serverによって使用されておらず、このディレクトリが過去 [`database_catalog_unused_dir_hide_timeout_sec`](#database_catalog_unused_dir_hide_timeout_sec)秒間変更されていない場合、そのタスクはこのディレクトリを「隠す」ことによってすべてのアクセス権を削除します。これは、clickhouse-serverが`store/`内で見ないことを期待しているディレクトリにも機能します。

:::note
`0`の値は「即時」を意味します。
:::

デフォルト: `3600`（1時間）
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

`store/` ディレクトリからのゴミを掃除するタスクのパラメータ。
もしサブディレクトリがclickhouse-serverによって使用されておらず、そのディレクトリが以前に「隠されて」いた場合
(see [database_catalog_unused_dir_hide_timeout_sec](#database_catalog_unused_dir_hide_timeout_sec))
このディレクトリが過去 [`database_catalog_unused_dir_rm_timeout_sec`](#database_catalog_unused_dir_rm_timeout_sec) 秒間変更されていない場合、そのタスクはこのディレクトリを削除します。
これはclickhouse-serverが`store/`内で見ないことを期待しているディレクトリにも機能します。

:::note
`0` の値は「決して」を意味します。デフォルトの値は30日です。
:::

デフォルト: `2592000`（30日）。
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

テーブルの削除が失敗した場合、ClickHouseはこのタイムアウト期間を待ってから操作を再試行します。

タイプ: [`UInt64`](../../sql-reference/data-types/int-uint.md)

デフォルト: `5`
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

テーブルを削除するために使用されるスレッドプールのサイズ。

タイプ: [`UInt64`](../../sql-reference/data-types/int-uint.md)

デフォルト: `16`
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}

`store/` ディレクトリからのゴミを掃除するタスクのパラメータ。
タスクのスケジューリング期間を設定します。

:::note
`0` の値は「決して」を意味します。デフォルトの値は1日です。
:::

デフォルト: `86400`（1日）。
## default_profile {#default_profile}

デフォルトの設定プロファイル。設定プロファイルは、設定 `user_config` で指定されたファイルにあります。

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

辞書のための設定ファイルのパス。

パス:

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにはワイルドカード * および ? を含めることができます。

参照：
- "[辞書](../../sql-reference/dictionaries/index.md)"。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

ユーザー定義関数のための設定ファイルのパス。

パス:

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにはワイルドカード * および ? を含めることができます。

参照：
- "[実行可能ユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)"。

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load}

辞書の遅延ロード。

- `true` の場合、各辞書は最初の使用時にロードされます。読み込みに失敗した場合、その辞書を使用している関数は例外をスローします。
- `false` の場合、サーバーは起動時にすべての辞書をロードします。

:::note
サーバーは、接続を受け取る前にすべての辞書の読み込みが完了するまでスタートアップ時に待機します（例外: [`wait_dictionaries_load_at_startup`](#wait_dictionaries_load_at_startup) が `false` に設定されている場合）。
:::

**例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## format_schema_path {#format_schema_path}

入力データのスキーマに対するディレクトリのパス、例えば [CapnProto](../../interfaces/formats.md#capnproto) 形式のスキーマ。

**例**

```xml
<!-- 様々な入力形式のためのスキーマファイルを含むディレクトリ。 -->
<format_schema_path>format_schemas/</format_schema_path>
```
## graphite {#graphite}

[Graphite](https://github.com/graphite-project)へのデータ送信。

設定:

- `host` – Graphiteサーバー。
- `port` – Graphiteサーバーのポート。
- `interval` – 送信間隔（秒単位）。
- `timeout` – データ送信のタイムアウト（秒単位）。
- `root_path` – キーのプレフィックス。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからデータを送信。
- `events` – [system.events](/operations/system-tables/events) テーブルからの時間経過に対するデータの変化を送信。
- `events_cumulative` – [system.events](/operations/system-tables/events) テーブルから累積データを送信。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルからデータを送信。

複数の `<graphite>` 句を構成できます。例えば、異なる間隔で異なるデータを送信するために使用できます。

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

Graphite用のデータの薄化設定。

詳しくは、[GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)を参照してください。

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

Protobufタイプのためのプロトファイルを含むディレクトリを定義します。

**例**

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

カスタムHTTPハンドラの使用を許可します。
新しいhttpハンドラを追加するには、単に新しい `<rule>` を追加します。
ルールは、定義された上から下にチェックされ、最初の一致がハンドラを実行します。

以下の設定はサブタグで構成できます：

| サブタグ             | 定義                                                                                                                                                        |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | リクエストURLと一致させるために、'regex:' プレフィックスを使用して正規表現マッチを使用することができます（オプション）。                                   |
| `methods`            | リクエストメソッドと一致させるために、複数のメソッドマッチをカンマで区切ることができます（オプション）。                                                  |
| `headers`            | リクエストヘッダと一致させるために、各子要素（子要素名はヘッダ名）を一致させることができます。正規表現マッチを使用するために 'regex:' プレフィックスを使用できます（オプション）。 |
| `handler`            | リクエストハンドラ                                                                                                                                        |
| `empty_query_string` | URLにクエリ文字列がないことを確認します                                                                                                                     |

`handler` には次の設定がサブタグで構成できます：

| サブタグ           | 定義                                                                                                                                                        |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | リダイレクト先                                                                                                                                             |
| `type`             | サポートされるタイプ: static, dynamic_query_handler, predefined_query_handler, redirect                                                                     |
| `status`           | staticタイプで使用し、レスポンスステータスコード                                                                                                            |
| `query_param_name` | dynamic_query_handlerタイプで使用し、HTTPリクエストパラメータ内の `<query_param_name>` に対応する値を抽出して実行します                                          |
| `query`            | predefined_query_handlerタイプで使用し、ハンドラが呼び出されたときにクエリを実行します                                                                          |
| `content_type`     | staticタイプで使用し、レスポンスコンテンツタイプ                                                                                                            |
| `response_content` | staticタイプで使用し、クライアントに送信されるレスポンスコンテンツ。 'file://' または 'config://' プレフィックスを使用すると、コンテンツがファイルまたは設定からクライアントに送信されます。 |

ルールのリストに加えて、すべてのデフォルトハンドラを有効にする `<defaults/>` を指定できます。

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

HTTP(s) 経由でサーバーに接続するためのポート。

- `https_port` が指定されている場合は、[OpenSSL](#openssl) を構成する必要があります。
- `http_port` が指定されている場合、OpenSSLの設定は無視されます（設定されていても）。

**例**

```xml
<https_port>9999</https_port>
```
## http_server_default_response {#http_server_default_response}

ClickHouse HTTP(s) サーバーにアクセスした際にデフォルトで表示されるページ。
デフォルト値は "Ok."（末尾に改行あり）

**例**

`http://localhost: http_port` にアクセスすると `https://tabix.io/` が開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

`OPTIONS` HTTPリクエストのレスポンスにヘッダーを追加するために使用されます。
`OPTIONS` メソッドは、CORSのプレフライトリクエストを行うために使用されます。

詳細については、[OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)を参照してください。

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

HSTSの有効期限（秒単位）。

:::note
`0`の値はClickHouseがHSTSを無効にすることを意味します。正の数を設定すると、HSTSが有効になり、max-ageは設定した数になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

起動後に `mlockall` を実行し、最初のクエリの遅延を低下させ、クリックハウス実行可能ファイルが高いIO負荷の下でページアウトされないようにします。

:::note
このオプションを有効にすることが推奨されますが、起動時間が数秒増加する可能性があります。この設定は「CAP_IPC_LOCK」機能がないと機能しません。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

置換用のファイルのパス。XMLとYAML形式の両方がサポートされています。

詳細については、"[構成ファイル](/operations/configuration-files)" セクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

ClickHouseサーバー間でデータを交換できるホストに対する制限。
Keeperが使用されている場合、異なるKeeperインスタンス間の通信にも同じ制限が適用されます。

:::note
デフォルトでは、この値は[`listen_host`](#listen_host)設定に等しくなります。
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

他のサーバーがこのサーバーにアクセスする際に使用できるホスト名。

省略されると、`hostname -f` コマンドと同様に定義されます。

特定のネットワークインターフェースからの切り離しに便利です。

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

[`interserver_http_host`](#interserver_http_host)と似ていますが、このホスト名は他のサーバーがこのサーバーにHTTPSでアクセスするために使用できます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```

## interserver_http_credentials {#interserver_http_credentials}

他のサーバーと接続するために使用されるユーザー名とパスワード、.[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)中に。さらに、サーバーはこれらの資格情報を使用して他のレプリカを認証します。
したがって、`interserver_http_credentials`はクラスタ内のすべてのレプリカで同じでなければなりません。

:::note
- デフォルトでは、`interserver_http_credentials`セクションが省略されると、レプリケーション中に認証は使用されません。
- `interserver_http_credentials`の設定は、ClickHouseクライアントの資格情報の[設定](../../interfaces/cli.md#configuration_files)とは関係ありません。
- これらの資格情報は、`HTTP`および`HTTPS`を介したレプリケーションで共通です。
:::

次の設定はサブタグで構成できます。

- `user` — ユーザー名。
- `password` — パスワード。
- `allow_empty` — `true`の場合、資格情報が設定されていても、他のレプリカが認証なしで接続できることを許可します。`false`の場合、認証なしの接続は拒否されます。デフォルト: `false`。
- `old` — 資格情報のローテーション中に使用された古い`user`と`password`を含みます。複数の`old`セクションを指定できます。

**資格情報のローテーション**

ClickHouseは、すべてのレプリカを同時に停止せずに動的なインタサーバー資格情報のローテーションをサポートします。資格情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty`を`true`に設定し、資格情報を追加します。これにより、認証および非認証での接続が可能になります。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカを構成した後、`allow_empty`を`false`に設定するか、この設定を削除します。これにより、新しい資格情報での認証が必須となります。

既存の資格情報を変更するには、ユーザー名とパスワードを`interserver_http_credentials.old`セクションに移動し、`user`と`password`を新しい値で更新します。この時点で、サーバーは新しい資格情報を使用して他のレプリカに接続し、新しいまたは古い資格情報のいずれかでの接続を受け入れます。

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

新しい資格情報がすべてのレプリカに適用されたら、古い資格情報を削除できます。
## keep_alive_timeout {#keep_alive_timeout}

ClickHouseが接続を閉じる前に、受信リクエストを待つ秒数。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## max_keep_alive_requests {#max_keep_alive_requests}

ClickHouseサーバーによって閉じられるまでの単一のキープアライブ接続を通じての最大リクエスト数。

**例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## ldap_servers {#ldap_servers}

ここにLDAPサーバーのリストとその接続パラメータを記述します:
- 'ldap'認証メカニズムが指定されている専用のローカルユーザーのために、それらを認証者として使用します。
- リモートユーザーディレクトリとしてそれらを使用します。

次の設定はサブタグで構成できます。

| 設定                            | 説明                                                                                                                                                                                                                                                                                                                                                                           |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                          | LDAPサーバーのホスト名またはIP。このパラメーターは必須であり、空にすることはできません。                                                                                                                                                                                                                                                                                     |
| `port`                          | LDAPサーバーポート、`enable_tls`が`true`の場合はデフォルト636、それ以外は`389`です。                                                                                                                                                                                                                                                                                         |
| `bind_dn`                       | バインドに使用されるDNを構築するためのテンプレート。結果として得られるDNは、各認証試行中にテンプレートのすべての`\{user_name\}`部分文字列を実際のユーザー名で置き換えることによって構築されます。                                                                                                                                                                              |
| `user_dn_detection`             | バウンドユーザーの実際のユーザーDNを検出するためのLDAP検索パラメータを含むセクション。これは主に、サーバーがActive Directoryの場合にさらなるロールマッピングのための検索フィルターで使用されます。得られたユーザーDNは、許可されている場所で`\{user_dn\}`部分文字列を置き換える際に使用されます。デフォルトでは、ユーザーDNはバインドDNに等しく設定されますが、検索が実行されると、実際の検出されたユーザーDNの値で更新されます。                                 |
| `verification_cooldown`         | 成功したバインド試行の後、LDAPサーバーと接触せずにユーザーがすべての連続リクエストのために正常に認証されていると見なされる期間（秒単位）。キャッシュを無効にし、各認証リクエストのためにLDAPサーバーに接触させるには`0`（デフォルト）を指定します。                                                                                                        |
| `enable_tls`                    | LDAPサーバーへの安全な接続をトリガーするフラグ。平文テキスト（`ldap://`）プロトコルのために`no`を指定します（推奨されません）。SSL/TLS経由のLDAP（`ldaps://`）プロトコルのためには`yes`を指定します（推奨、デフォルト）。レガシーStartTLSプロトコル（平文テキスト（`ldap://`）プロトコルをTLSにアップグレード）には`starttls`を指定します。                |
| `tls_minimum_protocol_version`  | SSL/TLSの最小プロトコルバージョン。受け入れられる値は:`ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）。                                                                                                                                                                                                                                                                                             |
| `tls_require_cert`              | SSL/TLSピア証明書の検証動作。受け入れられる値は:`never`, `allow`, `try`, `demand`（デフォルト）。                                                                                                                                                                                                                                                                                                       |
| `tls_cert_file`                 | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                       |
| `tls_key_file`                  | 証明書鍵ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                     |
| `tls_ca_cert_file`              | CA証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                    |
| `tls_ca_cert_dir`               | CA証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                          |
| `tls_cipher_suite`              | 許可される暗号スイート（OpenSSL記法）。                                                                                                                                                                                                                                                                                                                                       |

`user_dn_detection`の設定はサブタグで構成できます:

| 設定            | 説明                                                                                                                                                                                                                                                                                            |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP検索のためのベースDNを構築するためのテンプレート。結果のDNは、LDAP検索中にテンプレートのすべての`\{user_name\}`および`\{bind_dn\}`部分文字列を、実際のユーザー名とバインドDNで置き換えることによって構築されます。                                                                                   |
| `scope`         | LDAP検索のスコープ。受け入れられる値は:`base`, `one_level`, `children`, `subtree`（デフォルト）。                                                                                                                                                                                                                   |
| `search_filter` | LDAP検索のための検索フィルターを構築するためのテンプレート。得られたフィルターは、LDAP検索中にテンプレートのすべての`\{user_name\}`、`\{bind_dn\}`、および`\{base_dn\}`部分文字列を実際のユーザー名、バインドDN、およびベースDNで置き換えることによって構築されます。特殊文字はXMLで正しくエスケープされる必要があります。                |

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

例（典型的なActive Directoryと、さらなるロールマッピングのためのユーザーDN検出が設定されています）:

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

リクエストが来ることができるホストの制限。サーバーがすべてに応答することを望む場合は、`::`を指定します。

例:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

IPv6またはIPv4ネットワークが利用できない場合でも、サーバーはリッスンしようとすると終了しません。

**例**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

複数のサーバーが同じアドレス:ポートでリッスンすることを許可します。リクエストはオペレーティングシステムによってランダムなサーバーにルーティングされます。この設定を有効にすることは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

タイプ:

デフォルト:
## listen_backlog {#listen_backlog}

リッスンソケットのバックログ（保留中の接続のキューサイズ）。デフォルト値の`4096`は、linuxの[5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4))のものと同じです。

通常、この値は変更する必要がありません。なぜなら:
- デフォルト値は十分に大きく、
- クライアントの接続を受け入れるために、サーバーには別のスレッドがあります。

したがって、`TcpExtListenOverflows`（`nstat`から）の値がゼロでなく、このカウンターがClickHouseサーバーのために増加しても、この値を増加させる必要があるという意味ではありません。なぜなら:
- 通常`4096`で十分でない場合は、何らかの内部のClickHouseのスケーリング問題を示しているので、問題を報告する方が良いです。
- それはサーバーが後でより多くの接続を処理できるという保証にはならず（仮にそうだったとしても、その時点でクライアントは消えているか、切断されている可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

ログメッセージの場所と形式。

**キー**:

| キー                         | 説明                                                                                                                                                                         |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                      | ログレベル。受け入れられる値:`none`（ロギングをオフ）、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                                  |
| `log`                        | ログファイルのパス。                                                                                                                                                          |
| `errorlog`                   | エラーログファイルのパス。                                                                                                                                                    |
| `size`                       | ローテーションポリシー：ログファイルの最大サイズ（バイト単位）。ログファイルサイズがこの閾値を超えると、名前が変更されてアーカイブされ、新しいログファイルが作成されます。                  |
| `count`                      | ローテーションポリシー：Clickhouseが保持する最大の古いログファイルの数。                                                                                                         |
| `stream_compress`            | LZ4を使用してログメッセージを圧縮します。`1`または`true`に設定して有効にします。                                                                                               |
| `console`                    | ログメッセージをログファイルに書き込むのではなく、コンソールに出力します。`1`または`true`に設定して有効にします。デフォルトは、Clickhouseがデーモンモードで実行されていない場合は`1`、そうでない場合は`0`です。 |
| `console_log_level`          | コンソール出力のためのログレベル。デフォルトは`level`です。                                                                                                                  |
| `formatting`                 | コンソール出力のためのログ形式。現在、`json`のみがサポートされています。                                                                                                     |
| `use_syslog`                 | ログ出力をsyslogにも送り出します。                                                                                                                                                |
| `syslog_level`               | syslogへのロギングのためのログレベル。                                                                                                                                             |

**ログ形式の指定子**

`log`および`errorLog`パスのファイル名は、結果のファイル名のための下記の形式指定子をサポートしています（ディレクトリ部分はこれをサポートしていません）。

"例"列では、`2023-07-06 18:32:07`での出力を示します。

| 指定子      | 説明                                                                                                                    | 例                      |
|------------|------------------------------------------------------------------------------------------------------------------------|------------------------|
| `%%`       | リテラル %                                                                                                           | `%`                     |
| `%n`       | 改行文字                                                                                                              |                        |
| `%t`       | 水平方向のタブ文字                                                                                                   |                        |
| `%Y`       | 10進数の年、例: 2017                                                                                                | `2023`                 |
| `%y`       | 年の最後の2桁の10進数（範囲[00,99]）                                                                               | `23`                   |
| `%C`       | 年の最初の2桁の10進数（範囲[00,99]）                                                                               | `20`                   |
| `%G`       | 4桁の[ISO 8601週ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)（指定された週を含む年）。通常、`%V`と組み合わせてのみ便利です。   | `2023`                 |
| `%g`       | [ISO 8601週ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)の最後の2桁の、つまり指定された週を含む年。     | `23`                   |
| `%b`       | 短縮形の月名、例: Oct（ロケールに依存）                                                                               | `Jul`                  |
| `%h`       | %bの同義語                                                                                                          | `Jul`                  |
| `%B`       | 完全な月名、例: October（ロケールに依存）                                                                           | `July`                 |
| `%m`       | 10進数の月番号（範囲[01,12]）                                                                                     | `07`                   |
| `%U`       | 週の年の10進数の数（日曜日が週の最初の日）(範囲[00,53])                                                             | `27`                   |
| `%W`       | 週の年の10進数の数（月曜日が週の最初の日）（範囲[00,53]）                                                          | `27`                   |
| `%V`       | ISO 8601週番号（範囲[01,53]）                                                                                      | `27`                   |
| `%j`       | 年の日を10進数の数で（範囲[001,366]）                                                                                | `187`                  |
| `%d`       | 月の日を0埋めされた10進数で（範囲[01,31]）。単一の数字はゼロで前置されます。                                          | `06`                   |
| `%e`       | 月の日をスペースで埋め込まれた10進数（範囲[1,31]）。単一の数字はスペースで前置されます。                            | `&nbsp; 6`            |
| `%a`       | 短縮形の曜日名、例: Fri（ロケールに依存）                                                                             | `Thu`                  |
| `%A`       | 完全な曜日名、例: Friday（ロケールに依存）                                                                           | `Thursday`             |
| `%w`       | 0から6の範囲で、日曜日が0の整数の曜日                                                                                  | `4`                    |
| `%u`       | 1から7の範囲で、月曜日が1の10進数の曜日（ISO 8601形式）                                                              | `4`                    |
| `%H`       | 24時間表記での10進数の時（範囲[00-23]）                                                                               | `18`                   |
| `%I`       | 12時間表記での10進数の時（範囲[01,12]）                                                                               | `06`                   |
| `%M`       | 10進数での分（範囲[00,59]）                                                                                         | `32`                   |
| `%S`       | 10進数での秒（範囲[00,60]）                                                                                         | `07`                   |
| `%c`       | 標準の日時文字列、例: Sun Oct 17 04:41:13 2010（ロケールに依存）                                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`       | ローカライズされた日付表現（ロケールに依存）                                                                         | `07/06/23`             |
| `%X`       | ローカライズされた時間表現、例: 18:40:20または6:40:20 PM（ロケールに依存）                                           | `18:32:07`             |
| `%D`       | 短縮MM/DD/YY日付、`%m/%d/%y`に相当                                                                                   | `07/06/23`             |
| `%F`       | 短縮YYYY-MM-DD日付、`%Y-%m-%d`に相当                                                                                 | `2023-07-06`           |
| `%r`       | ローカライズされた12時間制時計（ロケールに依存）                                                                     | `06:32:07 PM`          |
| `%R`       | "%H:%M"に相当                                                                                                       | `18:32`                |
| `%T`       | "%H:%M:%S"（ISO 8601時間形式）に相当                                                                                 | `18:32:07`             |
| `%p`       | ローカライズされたAM/PMの指定（ロケールに依存）                                                                     | `PM`                   |
| `%z`       | ISO 8601形式でのUTCからのオフセット（例:-0430）、またはタイムゾーン情報が利用できない場合は空の文字                     | `+0800`                |
| `%Z`       | ロケール依存のタイムゾーン名または略称、またはタイムゾーン情報が利用できない場合は空の文字                           | `Z AWST`               |

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

ログメッセージをコンソールのみで印刷するには:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個別のログ名のログレベルはオーバーライドできます。例えば、"Backup"と"RBAC"のロガーのすべてのメッセージをミュートするには。

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

追加でログメッセージをsyslogに書き込むには:

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

`<syslog>`のキー:

| キー             | 説明                                                                                                                                                                                                                                                            |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`       | `host\[:port\]`形式のsyslogのアドレス。省略すると、ローカルデーモンが使用されます。                                                                                                                                                                            |
| `hostname`      | ログが送信されるホストの名前（オプション）。                                                                                                                                                                                                                       |
| `facility`      | syslogの[ファシリティキーワード](https://en.wikipedia.org/wiki/Syslog#Facility) 。大文字で"LOG_"プレフィックスを伴って指定する必要があります。例: `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3`など。指定がない場合、`address`が指定されている場合は`LOG_USER`、そうでない場合は`LOG_DAEMON`になります。          |
| `format`        | ログメッセージの形式。可能な値:`bsd` と `syslog`。                                                                                                                                                                                                               |

**ログ形式**

コンソールログに出力されるログ形式を指定できます。現在、JSONのみがサポートされています。

**例**

以下は出力JSONログの例です:

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

JSONロギングサポートを有効にするには、次のスニペットを使用します:

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

**JSONログのキーの名前を変更する**

キー名は`<names>`タグ内のタグ値を変更することで修正できます。例えば、`DATE_TIME`を`MY_DATE_TIME`に変更するには、`<date_time>MY_DATE_TIME</date_time>`を使用します。

**JSONログのキーを省略する**

ログプロパティは、プロパティをコメントアウトすることで省略できます。例えば、`query_id`をログに出力したくない場合は、`<query_id>`タグをコメントアウトできます。
```

## send_crash_reports {#send_crash_reports}

ClickHouseコア開発者チームへのクラッシュレポートの送信をオプトインするための設定です。送信には[Sentry](https://sentry.io)を使用します。

特にプレプロダクション環境でこれを有効にすることは非常に評価されます。

この機能が適切に機能するためには、サーバーがIPv4を介して公衆インターネットにアクセスできる必要があります（執筆時点で、SentryはIPv6をサポートしていません）。

キー:

| Key                   | 説明                                                                                                                                                                             |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | 機能を有効にするためのブーリアンフラグ。デフォルトは`false`。クラッシュレポートの送信を許可するには`true`に設定します。                                                                 |
| `send_logical_errors` | `LOGICAL_ERROR`は`assert`のようなもので、ClickHouse内のバグです。このブーリアンフラグは、これらの例外をSentryに送信することを有効にします（デフォルトは`false`）。                                              |
| `endpoint`            | クラッシュレポートを送信するためにSentryエンドポイントURLを上書きできます。それは別のSentryアカウントまたはあなたのセルフホストのSentryインスタンスのいずれかです。[Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk)構文を使用します。 |
| `anonymize`           | クラッシュレポートにサーバーホスト名を付加しないようにします。                                                                                                                                   |
| `http_proxy`          | クラッシュレポートを送信するためのHTTPプロキシを設定します。                                                                                                                                               |
| `debug`               | Sentryクライアントをデバッグモードに設定します。                                                                                                                                                             |
| `tmp_path`            | 一時的なクラッシュレポートの状態のためのファイルシステムパスです。                                                                                                                                       |
| `environment`         | ClickHouseサーバーが実行されている環境の任意の名前です。各クラッシュレポートに記載されます。デフォルト値は`test`または`prod`で、ClickHouseのバージョンによって異なります。                                          |

**推奨使用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## ssh_server {#ssh_server}

ホストキーの公開部分は、最初の接続時にSSHクライアント側のknown_hostsファイルに書き込まれます。

ホストキー設定はデフォルトで非アクティブです。ホストキー設定のコメントを外し、それらを有効にするためのそれぞれのsshキーのパスを指定します。

例:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## tcp_ssh_port {#tcp_ssh_port}

SSHサーバーのポートで、ユーザーが埋め込みクライアントを使用してインタラクティブにクエリを実行できるようにします。

例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## storage_configuration {#storage_configuration}

ストレージのマルチディスク設定を可能にします。

ストレージ構成は次の構造に従います:

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
### ディスクの構成 {#configuration-of-disks}

`disks`の設定は、以下の構造に従います:

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

上記のサブタグは、`disks`のための以下の設定を定義しています:

| 設定                     | 説明                                                                                                           |
|-------------------------|-----------------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | ディスクの名前。ユニークであるべきです。                                                                    |
| `path`                  | サーバーデータが格納されるパス（`data`および`shadow`カタログ）。`/`で終わる必要があります。                       |
| `keep_free_space_bytes` | ディスク上に予約された自由空間のサイズです。                                                                          |

:::note
ディスクの順序は重要ではありません。
:::
### ポリシーの構成 {#configuration-of-policies}

上記のサブタグは、`policies`のための以下の設定を定義しています:

| 設定                      | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`           | ポリシーの名前。ポリシー名はユニークでなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`           | ボリューム名。ボリューム名はユニークでなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `disk`                    | ボリューム内に位置するディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `max_data_part_size_bytes`| このボリューム内のディスクに存在できるデータチャンクの最大サイズ。マージがこのサイズを超えるチャンクを生成する場合、チャンクは次のボリュームに書き込まれます。基本的に、この機能は新しい/小さなチャンクをホット（SSD）ボリュームに保存し、大きなサイズに達すると冷たい（HDD）ボリュームに移動することを可能にします。このポリシーが1つのボリュームしか持たない場合、このオプションは使用しないでください。                                                                                                                                              |
| `move_factor`             | ボリューム上の利用可能な自由空間の割合。スペースが少なくなると、データは次のボリュームに移動し始めます。転送のため、チャンクはサイズの大きい順にソートされ、合計サイズが`move_factor`条件を満たすチャンクが選択されます。合計サイズのすべてのチャンクが不十分な場合は、すべてのチャンクが移動します。                                                                                                                                                              |
| `perform_ttl_move_on_insert` | 挿入時に期限切れのTTLを持つデータを移動させなくします。デフォルト（有効の場合）では、期限が切れたデータを挿入すると、すぐに移動ルールで指定されたボリューム/ディスクに移動されます。これにより、ターゲットのボリューム/ディスクが遅い場合、挿入が著しく遅くなる可能性があります。無効にすると、期限切れのデータはデフォルトのボリュームに書き込まれ、その後、期限切れのTTLに指定されたボリュームにすぐに移動されます。                                                                                                                            |
| `load_balancing`          | ディスクのバランシングポリシー、`round_robin`または`least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `least_used_ttl_ms`       | すべてのディスクの使用可能な空間を更新するためのタイムアウト（ミリ秒単位）。`0` - 常に更新、`-1` - 決して更新しない。デフォルト値は`60000`です。このディスクがClickHouseだけで使用され、動的にファイルシステムのサイズ変更が行われない場合は、`-1`を使用できます。他のすべての場合では非推奨です。最終的には不正確な空間割り当てにつながる可能性があります。                                                            |
| `prefer_not_to_merge`     | このボリュームのデータのマージを無効にします。注意: これは潜在的に有害であり、パフォーマンスの低下を引き起こす可能性があります。この設定が有効にされている場合（実施しないでください）、このボリュームのデータのマージは禁止されます（これは良くありません）。ClickHouseが遅いディスクとどのように対話するかを制御できます。これをまったく使用しないことをお勧めします。                                                                                     |
| `volume_priority`         | ボリュームが満たされる優先度（順序）を定義します。値が小さいほど優先度は高くなります。パラメータ値は自然数で、1からN（Nは指定された最大値）までの範囲をカバーし、ギャップがないことが必要です。                                                                                                                                                                                                                                                                                                       |

`volume_priority`について:
- すべてのボリュームがこのパラメータを持っている場合、指定された順序で優先されます。
- 一部のボリュームのみがこのパラメータを持つ場合、持たないボリュームは最低の優先度を持ちます。持っているものはタグの値に従って優先され、他のものの優先度は構成ファイルに記載された順序によって決まります。
- すべてのボリュームにこのパラメータが指定されていない場合、その順序は構成ファイル内の記載された順序によって決まります。
- ボリュームの優先度が同じである必要はありません。
## macros {#macros}

レプリケートされたテーブルのためのパラメータ置換。

レプリケートされたテーブルが使用されていない場合は省略可能です。

詳しくは、[レプリケートされたテーブルの作成に関するセクション](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)を参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

レプリケートされたデータベースのレプリカグループの名前。

レプリケートされたデータベースによって作成されたクラスターは、同じグループ内のレプリカで構成されます。
DDLクエリは同じグループ内のレプリカの完了を待ちます。

デフォルトは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```

タイプ: 文字列

デフォルト: ""
## remap_executable {#remap_executable}

メモリを巨大ページを使用してマシンコード（"テキスト"）に再配分するための設定。

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
このオプションはmacOSでの使用をお勧めします。なぜなら、`getrlimit()`関数が不正確な値を返すからです。
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

テーブルの削除に関する制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのサイズが`max_table_size_to_drop`（バイト単位）を超えると、[`DROP`](../../sql-reference/statements/drop.md)クエリや[`TRUNCATE`](../../sql-reference/statements/truncate.md)クエリを使用して削除することができません。

:::note
`0`の値は、すべてのテーブルを無制限に削除できることを意味します。

この設定を適用するためにClickHouseサーバーを再起動する必要はありません。制限を無効にする別の方法は、`<clickhouse-path>/flags/force_drop_table`ファイルを作成することです。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

デフォルト: 50 GB。
## background_pool_size {#background_pool_size}

MergeTreeエンジンを持つテーブルのためにバックグラウンドマージとミューテーションを行うスレッドの数を設定します。

:::note
- この設定は、ClickHouseサーバー起動時の互換性のために`default`プロファイル設定からも適用される可能性があります。
- 実行時にスレッドの数を増やすことができるだけです。
- スレッドの数を減らしたい場合は、サーバーを再起動する必要があります。
- この設定を調整することで、CPUとディスクの負荷を管理します。
:::

:::danger
小さなプールサイズは、CPUとディスクリソースを少なく消費しますが、バックグラウンドプロセスの進行が遅くなる可能性があり、最終的にはクエリパフォーマンスに影響を与えることがあります。
:::

変更する前に、次のような関連するMergeTree設定も確認してください:
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-lower-max-size-of-merge) .
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-execute-mutation).

**例**

```xml
<background_pool_size>16</background_pool_size>
```

タイプ:

デフォルト: 16。
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit}

マージおよびミューテーション操作を実行するためのRAMの使用制限を設定します。
ClickHouseが設定された制限に達した場合、新しいバックグラウンドマージまたはミューテーション操作のスケジュールを行わず、すでにスケジュールされたタスクを実行し続けます。

:::note
`0`の値は無制限を意味します。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```
## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio}

デフォルトの`merges_mutations_memory_usage_soft_limit`値は、`memory_amount * merges_mutations_memory_usage_to_ram_ratio`として計算されます。

**参照:**

- [max_memory_usage](../../operations/settings/query-complexity.md#settings_max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](#merges_mutations_memory_usage_soft_limit)

デフォルト: `0.5`。
## async_load_databases {#async_load_databases}

データベースとテーブルの非同期ロード。

- `true`の場合、`Ordinary`、`Atomic`、および`Replicated`エンジンを持つすべての非システムデータベースは、ClickHouseサーバーの起動後に非同期にロードされます。 `system.asynchronous_loader`テーブル、`tables_loader_background_pool_size`および`tables_loader_foreground_pool_size`サーバー設定を参照してください。まだロードされていないテーブルにアクセスしようとするクエリは、そのテーブルが起動するのを正確に待ちます。ロードジョブが失敗した場合、クエリはエラーを再投げします（`async_load_databases = false`の場合に全サーバーをシャットダウンするのではなく）。少なくとも1つのクエリによって待たれているテーブルは、より高い優先度でロードされます。データベースに対するDDLクエリは、そのデータベースが起動するのを正確に待ちます。待機クエリの総数の制限`max_waiting_queries`を設定することも検討してください。
- `false`の場合、サーバー起動時にすべてのデータベースがロードされます。

**例**

```xml
<async_load_databases>true</async_load_databases>
```

デフォルト: `false`。
## async_load_system_database {#async_load_system_database}

システムテーブルの非同期ロード。`system`データベース内に多数のログテーブルやパーツがある場合に役立ちます。`async_load_databases`設定に依存しません。

- `true`に設定すると、`Ordinary`、`Atomic`、および`Replicated`エンジンを持つすべてのシステムデータベースは、ClickHouseサーバー起動後に非同期にロードされます。 `system.asynchronous_loader`テーブル、`tables_loader_background_pool_size`および`tables_loader_foreground_pool_size`サーバー設定を参照してください。まだロードされていないシステムテーブルにアクセスしようとするクエリは、そのテーブルが正確に起動を待ちます。少なくとも1つのクエリによって待たれているテーブルは、より高い優先度でロードされます。待機クエリの総数の制限を設定する`max_waiting_queries`設定も検討してください。
- `false`に設定すると、サーバー起動前にシステムデータベースがロードされます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
```

デフォルト: `false`。
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

フォアグラウンドプールでのロードジョブを実行するスレッドの数を設定します。フォアグラウンドプールは、サーバーがポートでリッスンを始める前にテーブルを同期的にロードし、待たれているテーブルをロードするために使用されます。フォアグラウンドプールはバックグラウンドプールよりも高い優先度を持ちます。したがって、フォアグラウンドプールにジョブが実行されている間、バックグラウンドプールではジョブが開始されません。

:::note
`0`の値は、すべての使用可能なCPUが使用されることを意味します。
:::

デフォルト: `0`
## tables_loader_background_pool_size {#tables_loader_background_pool_size}

バックグラウンドプールでの非同期ロードジョブを実行するスレッドの数を設定します。バックグラウンドプールは、サーバー起動後にテーブルを非同期にロードするために使用され、テーブルを待つクエリがない場合に動作します。たくさんのテーブルがある場合は、バックグラウンドプールのスレッド数を低く保つと良いでしょう。これにより、同時クエリ実行のためのCPUリソースが予約されます。

:::note
`0`の値は、すべての使用可能なCPUが使用されることを意味します。
:::

デフォルト: `0`
## merge_tree {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)のテーブルに対する微調整。

詳細については、MergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

デフォルトでは無効になっています。

**有効化**

メトリクス履歴収集[`system.metric_log`](../../operations/system-tables/metric_log.md)を手動で有効にするには、次の内容で`/etc/clickhouse-server/config.d/metric_log.xml`を作成します:

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

`metric_log`設定を無効にするには、次の内容でファイル`/etc/clickhouse-server/config.d/disable_metric_log.xml`を作成する必要があります:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## latency_log {#latency_log}

デフォルトでは無効になっています。

**有効化**

レイテンシ履歴収集[`system.latency_log`](../../operations/system-tables/latency_log.md)を手動で有効にするには、次の内容で`/etc/clickhouse-server/config.d/latency_log.xml`を作成します:

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

`latency_log`設定を無効にするには、次の内容でファイル`/etc/clickhouse-server/config.d/disable_latency_log.xml`を作成する必要があります:

``` xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## replicated_merge_tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md)のテーブルに対する微調整。この設定はより高い優先度を持ちます。

詳細については、MergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## opentelemetry_span_log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md)システムテーブルの設定。

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
```
```md
## openSSL {#openssl}

SSLクライアント/サーバ構成。

SSLのサポートは`libpoco`ライブラリによって提供されます。利用可能な構成オプションは[SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)で説明されています。デフォルト値は[SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp)にあります。

サーバ/クライアント設定の鍵：

| オプション                        | 説明                                                                                                                                                                                                                                                                                                                                                                          | デフォルト値                              |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`                  | PEM証明書の秘密鍵が含まれるファイルへのパス。このファイルには、鍵と証明書の両方が含まれる場合があります。                                                                                                                                                                                                                                                                                               |                                            |
| `certificateFile`                 | PEM形式のクライアント/サーバ証明書ファイルへのパス。`privateKeyFile`に証明書が含まれている場合は、省略できます。                                                                                                                                                                                                                                                                                                   |                                            |
| `caConfig`                        | 信頼されたCA証明書が含まれるファイルまたはディレクトリへのパス。このリンク先がファイルの場合はPEM形式で、複数のCA証明書を含むことができます。このリンク先がディレクトリの場合は、CA証明書ごとに1つの.pemファイルが必要です。ファイル名はCAの主題名ハッシュ値で検索されます。詳細は[SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html)のマニュアルページに記載されています。 |                                            |
| `verificationMode`                | ノードの証明書を確認する方法。詳細は[Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h)クラスの説明にあります。可能な値：`none`、`relaxed`、`strict`、`once`。                                                                                                                                                                               | `relaxed`                                  |
| `verificationDepth`               | 検証チェーンの最大長。証明書チェーンの長さが設定値を超える場合、検証は失敗します。                                                                                                                                                                                                                                                                                                                  | `9`                                        |
| `loadDefaultCAFile`               | OpenSSLの組み込みCA証明書を使用するかどうか。ClickHouseは、組み込みCA証明書がファイル`/etc/ssl/cert.pem`（またはディレクトリ`/etc/ssl/certs`）に存在すると仮定します、または環境変数`SSL_CERT_FILE`（または`SSL_CERT_DIR`）によって指定されたファイル（またはディレクトリ）に存在します。                                                  | `true`                                     |
| `cipherList`                      | サポートされているOpenSSL暗号化。                                                                                                                                                                                                                                                                                                                                                                                | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`                   | セッションのキャッシュを有効または無効にします。`sessionIdContext`と組み合わせて使用する必要があります。許容される値：`true`、`false`。                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`                | サーバが各生成された識別子に追加する一意のランダム文字列。文字列の長さは`SSL_MAX_SSL_SESSION_ID_LENGTH`を超えてはいけません。このパラメータは常に推奨されます。なぜなら、サーバがセッションをキャッシュする場合でも、クライアントがキャッシュを要求した場合でも問題を回避するのに役立つからです。                                                                                                         | `$\{application.name\}`                      |
| `sessionCacheSize`                | サーバがキャッシュするセッションの最大数。値`0`は無制限のセッションを意味します。                                                                                                                                                                                                                                                                                                                       | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`                  | サーバでのセッションキャッシュの時間（時間単位）。                                                                                                                                                                                                                                                                                                                                                                           | `2`                                        |
| `extendedVerification`            | 有効にすると、証明書のCNまたはSANがピアのホスト名と一致することを確認します。                                                                                                                                                                                                                                                                                                                                                                   | `false`                                    |
| `requireTLSv1`                    | TLSv1接続を要求します。許容される値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1_1`                  | TLSv1.1接続を要求します。許容される値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `requireTLSv1_2`                  | TLSv1.2接続を要求します。許容される値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                          | `false`                                    |
| `fips`                            | OpenSSL FIPSモードをアクティブにします。ライブラリのOpenSSLバージョンがFIPSをサポートしている場合に限ります。                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler`     | 秘密鍵へのアクセス用にパスフレーズをリクエストするクラス（PrivateKeyPassphraseHandlerサブクラス）。例えば：`<privateKeyPassphraseHandler>`、`<name>KeyFileHandler</name>`、`<options><password>test</password></options>`、`</privateKeyPassphraseHandler>`。                                                                                        | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`       | 無効な証明書を検証するクラス（CertificateHandlerのサブクラス）。例えば：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` 。                                                                                                                                                                                                                                       | `RejectCertificateHandler`                 |
| `disableProtocols`                | 使用が許可されていないプロトコル。                                                                                                                                                                                                                                                                                                                                                                                       |                                            |
| `preferServerCiphers`             | クライアントが優先するサーバ暗号。                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |

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
        <!-- 自己署名用：<verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 自己署名用：<name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```
## part_log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)に関連するイベントのロギング。たとえば、データの追加やマージなど。ログを使用してマージアルゴリズムをシミュレーションし、その特性を比較できます。マージプロセスを視覚化することができます。

クエリは[system.part_log](/operations/system-tables/part_log)テーブルにロギングされ、別のファイルにはロギングされません。このテーブルの名前は`table`パラメータで設定できます（下記参照）。

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

[Prometheus](https://prometheus.io)からのデータ収集のためのメトリクスデータの公開。

設定：

- `endpoint` – prometheusサーバによるメトリクス収集用のHTTPエンドポイント。'/'に始まります。
- `port` – `endpoint`のポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics)テーブルからメトリクスを公開します。
- `events` – [system.events](/operations/system-tables/events)テーブルからメトリクスを公開します。
- `asynchronous_metrics` – 現在のメトリクス値を[system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルから公開します。
- `errors` - 最後のサーバの再起動以来発生したエラーコードによるエラー数を公開します。この情報は[system.errors](/operations/system-tables/errors)からも取得できます。

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

確認（`127.0.0.1`はClickHouseサーバのIPアドレスまたはホスト名に置き換えてください）：
```bash
curl 127.0.0.1:9363/metrics
```
## query_log {#query-log}

[log_queries=1](../../operations/settings/settings.md)設定で受信したクエリをロギングするための設定。

クエリは[system.query_log](/operations/system-tables/query_log)テーブルにロギングされ、別のファイルにはロギングされません。このテーブルの名前は`table`パラメータで変更可能です（下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバがアップデートされたときにクエリログの構造が変更された場合、古い構造のテーブルはリネームされ、新しいテーブルが自動的に作成されます。

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

メトリクス履歴収集を手動で有効にするには、[`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)用に以下の内容で`/etc/clickhouse-server/config.d/query_metric_log.xml`を作成します：

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

`query_metric_log`設定を無効にするには、次の内容のファイル`/etc/clickhouse-server/config.d/disable_query_metric_log.xml`を作成します：

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

[Query cache](../query-cache.md)の構成。

利用可能な設定は次のとおりです：

| 設定                     | 説明                                                                         | デフォルト値 |
|--------------------------|-----------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`      | 最大キャッシュサイズ（バイト単位）。`0`はクエリキャッシュが無効であることを意味します。                | `1073741824`  |
| `max_entries`            | キャッシュに保存される`SELECT`クエリ結果の最大数。                                     | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存される可能性のある`SELECT`クエリ結果の最大サイズ（バイト単位）。           | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存される可能性のある`SELECT`クエリ結果の最大行数。                       | `30000000`    |

:::note
- 設定を変更するとすぐに反映されます。
- クエリキャッシュのデータはDRAMに割り当てられます。メモリが不足している場合は、`max_size_in_bytes`の値を小さく設定するか、クエリキャッシュ全体を無効にしてください。
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

[log_query_threads=1](/operations/settings/settings#log_query_threads)設定で受信したクエリスレッドのロギングのための設定。

クエリは[system.query_thread_log](/operations/system-tables/query_thread_log)テーブルにロギングされ、別のファイルにはロギングされません。このテーブルの名前は`table`パラメータで変更可能です（下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバがアップデートされたときにクエリスレッドログの構造が変更された場合、古い構造のテーブルはリネームされ、新しいテーブルが自動的に作成されます。

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

[log_query_views=1](/operations/settings/settings#log_query_views)設定で受信したクエリに依存するビュー（ライブ、物化など）のロギングのための設定。

クエリは[system.query_views_log](/operations/system-tables/query_views_log)テーブルにロギングされ、別のファイルにはロギングされません。このテーブルの名前は`table`パラメータで変更可能です（下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバがアップデートされたときにクエリビューズログの構造が変更された場合、古い構造のテーブルはリネームされ、新しいテーブルが自動的に作成されます。

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

テキストメッセージのロギングのための[テキストログ](/operations/system-tables/text_log)システムテーブルの設定。

<SystemLogParameters/>

追加の設定：

| 設定   | 説明                                                                                                                                                                                            | デフォルト値       |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `level` | テーブルに保存される最大メッセージレベル（デフォルトは`Trace`）。                                                                                                                                   | `Trace`             |

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

[trace_log](/operations/system-tables/trace_log)システムテーブル操作のための設定。

<SystemLogParameters/>

デフォルトのサーバ構成ファイル`config.xml`には次の設定セクションがあります：

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

非同期挿入のロギングのための[asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log)システムテーブルの設定。

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

[crash_log](../../operations/system-tables/crash-log.md)システムテーブル操作のための設定。

<SystemLogParameters/>

デフォルトのサーバ構成ファイル`config.xml`には次の設定セクションがあります：

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

この設定は、カスタム（SQLから作成された）キャッシュディスクのキャッシュパスを指定します。`custom_cached_disks_base_directory`は、`filesystem_caches_path`（`filesystem_caches_path.xml`に存在）よりもカスタムディスクに対して優先され、前者が存在しない場合は後者が使用されます。ファイルシステムキャッシュ設定パスは、そのディレクトリ内に存在する必要があり、そうでない場合は例外がスローされ、ディスクの作成が防止されます。

:::note
これにより、サーバがアップグレードされた古いバージョンで作成されたディスクには影響しません。この場合、例外がスローされず、サーバは正常に起動します。
:::

例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## backup_log {#backup_log}

`BACKUP`および`RESTORE`操作のロギングのための[backup_log](../../operations/system-tables/backup_log.md)システムテーブルの設定。

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
```yaml
title: 'クエリマスキングルール'
sidebar_label: 'クエリマスキングルール'
keywords: 'ClickHouse, マスキング, クエリ, セキュリティ'
description: 'ClickHouseのクエリマスキングルールの設定について'
```

## query_masking_rules {#query_masking_rules}

正規表現ベースのルールで、クエリおよびサーバーログに保存する前のすべてのログメッセージに適用されます。
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブルや、クライアントに送信されるログで使用されます。これにより、SQLクエリからの名前、メールアドレス、個人識別情報、クレジットカード番号などの機密データの漏洩を防ぐことができます。

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

| 設定     | 説明                                                                      |
|----------|---------------------------------------------------------------------------|
| `name`   | ルールの名前 (オプション)                                               |
| `regexp` | RE2互換の正規表現 (必須)                                                |
| `replace`| 機密データの置換文字列 (オプションで、デフォルトは六つのアスタリスク) |

マスキングルールは、誤った形式または解析不可能なクエリからの機密データの漏洩を防ぐために、クエリ全体に適用されます。

[`system.events`](/operations/system-tables/events) テーブルには、クエリマスキングルールが適合した回数をカウントする `QueryMaskingRulesMatch` があります。

分散クエリでは、各サーバーを別々に構成する必要があります。そうしないと、他のノードに渡されたサブクエリはマスキングされずに保存されます。

## remote_servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンおよび `cluster` テーブル関数によって使用されるクラスターの構成。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性の値については、"[構成ファイル](/operations/configuration-files)" セクションを参照してください。

**関連情報**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [クラスター発見](../../operations/cluster-discovery.md)
- [レプリケートされたデータベースエンジン](../../engines/database-engines/replicated.md)

## remote_url_allow_hosts {#remote_url_allow_hosts}

URL関連のストレージエンジンおよびテーブル関数で使用を許可されるホストのリスト。

`\<host\>` XML タグを使用してホストを追加する場合:
- 正確にURLと同じように指定する必要があります。名前はDNS解決の前にチェックされます。 たとえば: `<host>clickhouse.com</host>`
- URLにポートが明示的に指定されている場合、ホスト:ポート全体がチェックされます。 たとえば: `<host>clickhouse.com:80</host>`
- ポートなしでホストが指定されている場合、そのホストの任意のポートが許可されます。 たとえば: `<host>clickhouse.com</host>` が指定されている場合、 `clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) などが許可されます。
- ホストがIPアドレスとして指定されている場合、URLに指定されているとおりにチェックされます。 たとえば: `[2a02:6b8:a::a]`。
- リダイレクトがあり、リダイレクトのサポートが有効な場合は、すべてのリダイレクト (location フィールド) がチェックされます。

例:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## timezone {#timezone}

サーバーのタイムゾーン。

UTCタイムゾーンまたは地理的位置のIANA識別子として指定されます (例: Africa/Abidjan)。

タイムゾーンは、DateTimeフィールドがテキスト形式に出力されるとき (画面またはファイルに印刷される)、および文字列からDateTimeを取得するときのStringとDateTime形式の間の変換に必要です。さらに、タイムゾーンは、入力パラメータでタイムゾーンを受け取っていない場合の日付や時間を扱う関数で使用されます。

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

クライアントとの安全な通信のためのTCPポート。 [OpenSSL](#openssl) 設定と共に使用してください。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## mysql_port {#mysql_port}

MySQLプロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します。
- 空の値はMySQLプロトコルを介したクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<mysql_port>9004</mysql_port>
```

## postgresql_port {#postgresql_port}

PostgreSQLプロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します。
- 空の値はMySQLプロトコルを介したクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```

## tmp_path {#tmp_path}

大きなクエリを処理するための一時データをローカルファイルシステムに保存するパス。

:::note
- 一時データストレージを構成するために使用できるオプションは1つのみです: `tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
- 終了スラッシュは必須です。
:::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## url_scheme_mappers {#url_scheme_mappers}

短縮または記号的なURLプレフィックスを完全なURLに変換するための設定。

例:

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

ユーザーファイルが格納されるディレクトリ。テーブル関数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## user_scripts_path {#user_scripts_path}

ユーザースクリプトファイルが格納されるディレクトリ。実行可能なユーザー定義関数 [実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions) に使用されます。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

## user_defined_path {#user_defined_path}

ユーザー定義ファイルが格納されるディレクトリ。SQLユーザー定義関数 [SQLユーザー定義関数](/sql-reference/functions/udf) に使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## users_config {#users_config}

ユーザー設定、アクセス権、設定プロファイル、クォータ設定が含まれるファイルのパス。

**例**

```xml
<users_config>users.xml</users_config>
```

## validate_tcp_client_information {#validate_tcp_client_information}

クエリパケットを受信したときにクライアント情報の検証が有効かどうかを決定します。

デフォルトは `false` です:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```

## access_control_improvements {#access_control_improvements}

アクセス制御システムのオプションの改善に関する設定。

| 設定                                         | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | デフォルト |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`  | 権限のある行ポリシーなしでユーザーが `SELECT` クエリを使用して行を読み取れるかどうかを設定します。例えば、ユーザーAとBがいて、行ポリシーがAにしか定義されていない場合、この設定がtrueであればユーザーBはすべての行を見ることができます。この設定がfalseであれば、ユーザーBは行を全く見えなくなります。                                                                                                                                                   | `true`  |
| `on_cluster_queries_require_cluster_grant`  | `ON CLUSTER` クエリが `CLUSTER` 権限を必要とするかどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                        | `true`  |
| `select_from_system_db_requires_grant`      | `SELECT * FROM system.<table>` が任意の権限を必要とし、任意のユーザーが実行できるかどうかを設定します。trueに設定すると、このクエリは `GRANT SELECT ON system.<table>` を必要としますが、システムテーブルにのみアクセスできない例外があります。例外として、いくつかのシステムテーブル（`tables`、`columns`、`databases`、および `one`、`contributors` などの定数テーブル）はすべてのユーザーがアクセス可能です。              | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` が任意の権限を必要とし、任意のユーザーが実行できるかどうかを設定します。trueに設定すると、このクエリは `GRANT SELECT ON information_schema.<table>` を必要とします。                                                                                                                                                                                                                                           | `true`  |
| `settings_constraints_replace_previous`      | 設定プロファイル内の設定に対する制約が、他のプロファイルで定義されたその設定の以前の制約のアクションをキャンセルするかどうかを設定します（新しい制約によって設定されていないフィールドも含む）。これにより、`changeable_in_readonly` 制約タイプも有効になります。                                                                                                                                                                                             | `true`  |
| `table_engines_require_grant`                | 特定のテーブルエンジンでテーブルを作成する際に権限を必要とするかどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                            | `false` |
| `role_cache_expiration_time_seconds`         | ロールがロールキャッシュに保存される最後のアクセスからの秒数を設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                        | `600`   |

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

`s3queue_log` システムテーブルの設定。

<SystemLogParameters/>

デフォルトの設定は以下の通りです:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```

## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup}

この設定は、`dictionaries_lazy_load` が `false` の場合の動作を指定できるようにします。
( `dictionaries_lazy_load` が `true` の場合はこの設定は何も影響を与えません。)

`wait_dictionaries_load_at_startup` が `false` の場合、サーバーは起動時にすべての辞書の読み込みを開始し、その読み込みの間に接続を受け付けることができます。
辞書がクエリで初めて使用されるとき、その辞書がまだ読み込まれていない場合は、クエリは辞書が読み込まれるまで待機します。
`wait_dictionaries_load_at_startup` を `false` に設定することで、ClickHouseはより早く起動しますが、一部のクエリの実行が遅くなる可能性があります（なぜなら、一部の辞書が読み込まれるのを待たなければならないからです）。

`wait_dictionaries_load_at_startup` が `true` の場合、サーバーは起動時にすべての辞書の読み込みが完了するまで（成功または失敗に関わらず）接続を受け付けるのを待ちます。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```

デフォルト: true

## zookeeper {#zookeeper}

ClickHouseが [ZooKeeper](http://zookeeper.apache.org/) クラスターと対話するための設定を含みます。
ClickHouseは、レプリケートされたテーブルを使用するときにレプリカのメタデータを保存するためにZooKeeperを使用します。
レプリケートされたテーブルを使用しない場合、このパラメータセクションは省略できます。

以下の設定はサブタグで構成できます:

| 設定                                    | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|-----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                  | ZooKeeperエンドポイント。複数のエンドポイントを設定できます。例:`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性は、ZooKeeperクラスターに接続しようとする際のノードの順序を指定します。                                                                                                                                                                                                                                                                                    |
| `session_timeout_ms`                    | ミリ秒単位のクライアントセッションの最大タイムアウト。                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `operation_timeout_ms`                  | ミリ秒単位の1つの操作の最大タイムアウト。                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `root` (オプション)                     | ClickHouseサーバーによって使用されるznodeのルートとして使用されるznode。                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `fallback_session_lifetime.min` (オプション) | プライマリが利用できない場合にフォールバックノードへのZooKeeperセッションの寿命の最小制限 (負荷分散)。秒数で設定します。デフォルト: 3時間。                                                                                                                                                                                                                                                                                                                                                              |
| `fallback_session_lifetime.max` (オプション) | プライマリが利用できない場合にフォールバックノードへのZooKeeperセッションの寿命の最大制限 (負荷分散)。秒数で設定します。デフォルト: 6時間。                                                                                                                                                                                                                                                                                                                                                              |
| `identity` (オプション)                 | 要求されるznodeにアクセスするためにZooKeeperによって要求されるユーザー名とパスワード。                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `use_compression` (オプション)          | trueに設定するとKeeperプロトコルで圧縮を有効にします。                                                                                                                                                                                                                                                                                                                                                                                                                                             |

`zookeeper_load_balancing` 設定も利用可能です (オプション) で、ZooKeeperノード選択アルゴリズムを選択できます:

| アルゴリズム名                      | 説明                                                                                                                       |
|------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `random`                           | ZooKeeperノードの一つをランダムに選択します。                                                                             |
| `in_order`                         | 最初のZooKeeperノードを選択し、利用できない場合は次のノードを選択します。                                                      |
| `nearest_hostname`                 | サーバーのホスト名に最も似ているZooKeeperノードを選択します。ホスト名は名前の接頭辞と比較されます。                          |
| `hostname_levenshtein_distance`    | nearest_hostnameと同様ですが、Levenshtein距離でホスト名を比較します。                                                      |
| `first_or_random`                  | 最初のZooKeeperノードを選択し、利用できない場合は残りのZooKeeperノードの一つをランダムに選択します。                       |
| `round_robin`                      | 最初のZooKeeperノードを選択し、再接続が発生した場合は次のノードを選択します。                                               |

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
    <!-- オプション. Chrootサフィックス. 存在する必要があります. -->
    <root>/path/to/zookeeper/node</root>
    <!-- オプション. ZookeeperダイジェストACL文字列. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**関連情報**

- [レプリケーション](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeperプログラマ向けガイド](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouseとZookeeperの間でのオプションの安全な通信](/operations/ssl-zookeeper)

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeperでのデータパートヘッダーのストレージ方法。この設定は`MergeTree`(/engines/table-engines/mergetree-family)ファミリーにのみ適用されます。指定することができます:

**`config.xml`の[merge_tree](#merge_tree)セクション内でグローバルに設定**

ClickHouseはサーバー上のすべてのテーブルに対して設定を使用します。設定はいつでも変更できます。設定が変更されると、既存のテーブルの動作が変わります。

**各テーブルのために**

テーブルを作成する際に、対応する[エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)を指定します。この設定を持つ既存のテーブルの動作は、グローバル設定が変更されても変化しません。

**可能な値**

- `0` — 機能がオフになります。
- `1` — 機能がオンになります。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) の場合、[レプリケートされた](../../engines/table-engines/mergetree-family/replication.md)テーブルは、データパートのヘッダーを単一の`znode`を使用してコンパクトに保存します。テーブルに多くのカラムがある場合、このストレージ方法はZooKeeperに保存されるデータのボリュームを大幅に削減します。

:::note
`use_minimalistic_part_header_in_zookeeper = 1`を適用した後、この設定をサポートしていないバージョンにClickHouseサーバーをダウングレードすることはできません。 クラスター内のサーバーでClickHouseをアップグレードする際は注意してください。すべてのサーバーを一度にアップグレードしない方が安全です。 ClickHouseの新しいバージョンをテスト環境で試験的に実施するか、クラスターの一部のサーバーでテストする方が安全です。

この設定で保存されたデータパートヘッダーは、以前の（非コンパクト）表現に復元されることはありません。
:::

タイプ: UInt8

デフォルト: 0

## distributed_ddl {#distributed_ddl}

クラスター上の[分散DDLクエリ](../../sql-reference/distributed-ddl.md)（`CREATE`, `DROP`, `ALTER`, `RENAME`）の実行を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper)が有効な場合にのみ機能します。

`<distributed_ddl>`内で構成可能な設定は以下の通りです:

| 設定                     | 説明                                                                                                                                                            | デフォルト値                |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `path`                   | DDLクエリの `task_queue` 用のKeeper内のパス                                                                                                                |                             |
| `profile`                | DDLクエリを実行する際に使用されるプロファイル                                                                                                      |                             |
| `pool_size`              | 同時に実行可能な`ON CLUSTER`クエリの数                                                                                                               |                             |
| `max_tasks_in_queue`     | キューに存在できるタスクの最大数                                                                                                                 | `1,000`                     |
| `task_max_lifetime`      | この値を超える年齢のノードを削除します。                                                                                                                | `7 * 24 * 60 * 60` (1週間を秒数で) |
| `cleanup_delay_period`   | 清掃が行われたのが `cleanup_delay_period` 秒未満でないと、ノードイベントが受信された後に掃除が開始されます。                                       | `60`秒                      |

**例**

```xml
<distributed_ddl>
    <!-- DDLクエリのキューに対するZooKeeper内のパス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- このプロファイルの設定がDDLクエリの実行に使用されます -->
    <profile>default</profile>

    <!-- 同時に実行可能なON CLUSTERクエリの制御 -->
    <pool_size>1</pool_size>

    <!--
         クリーンアップ設定（アクティブなタスクは削除されません）
    -->

    <!-- タスクTTLの制御（デフォルトは1週間） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- クリーンアップが実行される頻度の制御（秒単位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- キューに存在できるタスクの制御 -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## access_control_path {#access_control_path}

ClickHouseサーバーがSQLコマンドによって作成されたユーザーおよびロール構成を保存するフォルダへのパス。

**関連情報**

- [アクセス制御およびアカウント管理](/operations/access-rights#access-control-usage)

タイプ: String

デフォルト: `/var/lib/clickhouse/access/`。

## allow_plaintext_password {#allow_plaintext_password}

平文パスワードタイプ（安全でない）の使用を許可するかどうかを設定します。

デフォルト: `1` (authType plaintext_passwordが許可されています)

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow_no_password {#allow_no_password}

安全でないパスワードタイプのno_passwordを許可するかどうかを設定します。

デフォルト: `1` (authType no_passwordが許可されています)

```xml
<allow_no_password>1</allow_no_password>
```

## allow_implicit_no_password {#allow_implicit_no_password}

`IDENTIFIED WITH no_password` が明示的に指定されない限り、パスワードなしでユーザーを作成することを禁止します。

デフォルト: `1`

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## default_session_timeout {#default_session_timeout}

デフォルトのセッションタイムアウト（秒単位）。

デフォルト: `60`

```xml
<default_session_timeout>60</default_session_timeout>
```

## default_password_type {#default_password_type}

`CREATE USER u IDENTIFIED BY 'p'` のようなクエリに対して自動的に設定されるパスワードタイプを設定します。

受け入れられる値:
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
```yaml
title: 'ユーザーディレクトリ'
sidebar_label: 'ユーザーディレクトリ'
keywords: 'ClickHouse, ユーザー, 設定'
description: 'ユーザーディレクトリの設定に関する情報'
```

## user_directories {#user_directories}

構成ファイルのセクションで、次の設定が含まれます：
- 予め定義されたユーザーを含む構成ファイルへのパス。
- SQLコマンドによって作成されたユーザーが保存されるフォルダーへのパス。
- SQLコマンドによって作成され、レプリケートされるユーザーのZooKeeperノードパス（実験的）。

このセクションが指定されると、[users_config](/operations/server-configuration-parameters/settings#users_config) および [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) のパスは使用されません。

`user_directories` セクションには、任意の数のアイテムを含めることができ、アイテムの順序は優先順位を意味します（アイテムが高いほど優先順位が高くなります）。

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

`memory` セクションを定義することもできます。これは、情報をメモリ内のみで保存し、ディスクに書き込まないことを意味します。また、`ldap` セクションは、情報をLDAPサーバーに保存します。

ローカルに定義されていないユーザーのリモートユーザーディレクトリとしてLDAPサーバーを追加するには、次の設定を含む単一の `ldap` セクションを定義します：

| 設定      | 説明                                                                                                                                                                                                                                                                                                                                                                    |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`  | `ldap_servers` 構成セクションに定義されたLDAPサーバー名の1つ。このパラメータは必須であり、空にすることはできません。                                                                                                                                                                                                                                             |
| `roles`   | 各ユーザーにLDAPサーバーから取得されたロールのリストを割り当てるためにローカルに定義されたロールのセクション。ロールが指定されていない場合、ユーザーは認証後に何のアクションも実行できません。指定されたロールのいずれかが認証時にローカルで定義されていない場合、認証試行は失敗し、提供されたパスワードが正しくないかのように扱われます。 |

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

各エントリが `<name>/path/to/file</name>` 形式のカスタムトップレベルドメインを追加するリストを定義します。

例えば：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

参照：
- 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) およびそのバリエーションは、カスタムTLDリスト名を受け取り、最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分を返します。

## total_memory_profiler_step {#total_memory_profiler_step}

メモリサイズ（バイト単位）を設定します。これは、ピークアロケーションのステップごとのスタックトレースのために記録されます。データは、`query_id` が空の文字列に等しい [system.trace_log](../../operations/system-tables/trace_log.md) システムテーブルに保存されます。

デフォルト値：`4194304`。

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

ランダムアロケーションとデアロケーションを収集し、指定された確率で `MemorySample` として `system.trace_log` システムテーブルに書き込むことを許可します。この確率は、アロケーションのサイズに関係なく、各アロケーションまたはデアロケーションに適用されます。追跡されていないメモリの量が、追跡されていないメモリの制限（デフォルト値は `4` MiB）を超えた場合のみサンプリングが行われます。この値は、[total_memory_profiler_step](#total_memory_profiler_step) が低くても低くできます。サンプリングを非常に細かくするために `total_memory_profiler_step` を `1` に設定できます。

可能な値：

- 正の整数。
- `0` — ランダムアロケーションとデアロケーションの `system.trace_log` システムテーブルへの書き込みが無効です。

デフォルト値：`0`。

## compiled_expression_cache_size {#compiled_expression_cache_size}

[compiled expressions](../../operations/caches.md) のためのキャッシュサイズ（バイト単位）を設定します。

デフォルト値：`134217728`。

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

[compiled expressions](../../operations/caches.md) のためのキャッシュサイズ（要素単位）を設定します。

デフォルト値：`10000`。

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

テーブル、データベース、テーブル関数、および辞書に対する `SHOW` および `SELECT` クエリでの秘密の表示を有効または無効にします。

秘密を表示したいユーザーは、 [`format_display_secrets_in_show_and_select`](../settings/formats#format_display_secrets_in_show_and_select) 設定をオンにし、 [`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限を持っている必要があります。

可能な値：

- `0` — 無効。
- `1` — 有効。

デフォルト値：`0`。

## proxy {#proxy}

HTTPおよびHTTPSリクエストのためのプロキシサーバーを定義します。これは現在、S3ストレージ、S3テーブル関数、およびURL関数でサポートされています。

プロキシサーバーを定義する方法は3つあります：
- 環境変数
- プロキシリスト
- リモートプロキシレゾルバ

特定のホストに対するプロキシサーバーのバイパスも `no_proxy` を使用してサポートされています。

**環境変数**

`http_proxy` および `https_proxy` 環境変数を使用して、特定のプロトコルのプロキシサーバーを指定できます。システムで設定されている場合、シームレスに動作するはずです。

これは、特定のプロトコルに対して1つのプロキシサーバーがある場合、およびそのプロキシサーバーが変更されない場合、最も簡単なアプローチです。

**プロキシリスト**

このアプローチでは、プロトコルに対して1つまたは複数のプロキシサーバーを指定できます。複数のプロキシサーバーが定義されている場合、ClickHouseはラウンドロビン方式で異なるプロキシを使用し、サーバー間で負荷をバランスさせます。これは、プロトコルに対して複数のプロキシサーバーが存在し、プロキシサーバーのリストが変更されない場合、最も簡単なアプローチです。

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

| フィールド    | 説明                          |
|---------------|-----------------------------|
| `<http>`      | 1つ以上のHTTPプロキシのリスト    |
| `<https>`     | 1つ以上のHTTPSプロキシのリスト   |

  </TabItem>
  <TabItem value="http_https" label="<http> と <https>">

| フィールド   | 説明                     |
|--------------|------------------------|
| `<uri>`      | プロキシのURI              |

  </TabItem>
</Tabs>

**リモートプロキシレゾルバ**

プロキシサーバーが動的に変更される可能性があります。その場合、レゾルバのエンドポイントを定義できます。ClickHouseは、そのエンドポイントに空のGETリクエストを送信し、リモートレゾルバがプロキシホストを戻すべきです。ClickHouseは、次のテンプレートを使用してプロキシURIを形成します： `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

| フィールド    | 説明                                 |
|---------------|-------------------------------------|
| `<http>`      | 1つ以上のレゾルバのリスト*            |
| `<https>`     | 1つ以上のレゾルバのリスト*            |

  </TabItem>
  <TabItem value="http_https" label="<http> と <https>">

| フィールド       | 説明                                      |
|-----------------|------------------------------------------|
| `<resolver>`     | レゾルバのためのエンドポイントおよび他の詳細 |

:::note
複数の `<resolver>` 要素を持つことができますが、特定のプロトコルに対する最初の `<resolver>` のみが使用されます。その他の `<resolver>` 要素は無視されます。これは、負荷分散（必要な場合）はリモートレゾルバによって実装されるべきであることを意味します。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| フィールド               | 説明                                                                                                                                                                                 |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`             | プロキシレゾルバのURI                                                                                                                                                               |
| `<proxy_scheme>`         | 最終プロキシURIのプロトコル。これは `http` または `https` のいずれかです。                                                                                                               |
| `<proxy_port>`           | プロキシレゾルバのポート番号                                                                                                                                                          |
| `<proxy_cache_time>`     | レゾルバからの値がClickHouseによってキャッシュされる秒数。この値を `0` に設定すると、ClickHouseはすべてのHTTPまたはHTTPSリクエストごとにレゾルバに接触します。                                                             |

  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決定されます：

| 順序 | 設定                |
|-------|--------------------|
| 1.    | リモートプロキシレゾルバ |
| 2.    | プロキシリスト          |
| 3.    | 環境変数              |

ClickHouseは、リクエストプロトコルに対する最も高い優先度のレゾルバタイプをチェックします。定義されていない場合は、次の優先度のレゾルバタイプをチェックし続け、環境レゾルバに到達します。これにより、レゾルバタイプの混合も使用できます。

## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

デフォルトでは、トンネリング（つまり、`HTTP CONNECT`）は `HTTP` プロキシを介して `HTTPS` リクエストを行うために使用されます。この設定を使用して、これを無効にできます。

**no_proxy**

デフォルトでは、すべてのリクエストはプロキシを介して行われます。特定のホストに対してこれを無効にするには、`no_proxy` 変数を設定する必要があります。これは、リストおよびリモートレゾルバの `<proxy>` 条項内で設定することができ、環境レゾルバの場合は環境変数として設定できます。IPアドレス、ドメイン、サブドメイン、フルバイパスのための `'*'` ワイルドカードをサポートしています。先頭のドットはcurlが行うように削除されます。

**例**

以下の構成は、`clickhouse.cloud` とそのすべてのサブドメイン（例、`auth.clickhouse.cloud`）へのプロキシ要求をバイパスします。
GitLabにも同様が適用されます。先頭にドットが付いていても、`gitlab.com` と `about.gitlab.com` の両方がプロキシをバイパスします。

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

テーブルにアタッチされるマテリアライズドビューの数の制限。

:::note
ここでは直接依存するビューのみが考慮され、ビューの上に別のビューを作成することは考慮されません。
:::

デフォルト：`0`。

## format_alter_operations_with_parentheses {#format_alter_operations_with_parentheses}

`true` に設定されている場合、フォーマットされたクエリでは変更操作が括弧で囲まれます。これにより、フォーマットされた変更クエリの解析が曖昧さが少なくなります。

タイプ：`Bool`

デフォルト：`0`

## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}

`true` の場合、ClickHouseは `CREATE VIEW` クエリの空のSQLセキュリティステートメントにデフォルトを記述しません。

:::note
この設定は移行期間中のみに必要であり、24.4でobsoleteになります。
:::

タイプ：`Bool`

デフォルト：`1`

## merge_workload {#merge_workload}

マージと他のワークロードの間でリソースがどのように利用され、共有されるかを調整するために使用します。指定された値は、すべてのバックグラウンドマージの `workload` 設定値として使用されます。マージツリー設定によって上書きされることがあります。

タイプ：`String`

デフォルト：`default`

**参照**

- [作業負荷スケジューリング](/operations/workload-scheduling.md)

## mutation_workload {#mutation_workload}

変更と他のワークロードの間でリソースがどのように利用され、共有されるかを調整するために使用します。指定された値は、すべてのバックグラウンドミューテーションの `workload` 設定値として使用されます。マージツリー設定によって上書きされることがあります。

**参照**

- [作業負荷スケジューリング](/operations/workload-scheduling.md)

タイプ：`String`

デフォルト：`default`

## throw_on_unknown_workload {#throw_on_unknown_workload}

'workload' クエリ設定のアクセスで不明なワークロードに対する動作を定義します。

- `true` の場合、RESOURCE_ACCESS_DENIED例外が不明なワークロードにアクセスしようとするクエリからスローされます。これは、WORKLOAD階層が確立され、WORKLOADデフォルトが含まれている後に、すべてのクエリのリソーススケジューリングを強制するために便利です。
- `false`（デフォルト）の場合、不明なWORKLOADを指す `workload` 設定を持つクエリには、リソーススケジューリングなしで無制限のアクセスが提供されます。これは、WORKLOADの階層を設定する際、WORKLOADデフォルトが追加される前に重要です。

**参照**

- [作業負荷スケジューリング](/operations/workload-scheduling.md)

タイプ：String

デフォルト：false

**例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

## workload_path {#workload_path}

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリのストレージとして使用されるディレクトリ。デフォルトではサーバーの作業ディレクトリの `/workload/` フォルダーが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**参照**

- [作業負荷階層](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)

## workload_zookeeper_path {#workload_zookeeper_path}

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリのストレージとして使用されるZooKeeperノードへのパス。一貫性のために、すべてのSQL定義はこの単一のznodeの値として保存されます。デフォルトでは、ZooKeeperは使用されず、定義は[ディスク](#workload_path)に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**参照**

- [作業負荷階層](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)

## use_legacy_mongodb_integration {#use_legacy_mongodb_integration}

レガシーMongoDB統合実装を使用します。非推奨。

タイプ：`Bool`

デフォルト：`true`。

## max_authentication_methods_per_user {#max_authentication_methods_per_user}

ユーザーが作成または変更できる認証メソッドの最大数。
この設定を変更しても既存のユーザーには影響しません。制限を超える認証関連のクエリは失敗し、非認証の作成/変更クエリは成功します。

:::note
`0` の値は無制限を意味します。
:::

タイプ：`UInt64`

デフォルト：`100`

## allow_feature_tier {#allow_feature_tier}

ユーザーが異なる機能レベルに関連する設定を変更できるかどうかを制御します。

- `0` - すべての設定の変更が許可されます（実験的、ベータ、製品）。
- `1` - ベータと製品の機能設定への変更のみが許可されます。実験的設定への変更は拒否されます。
- `2` - 製品設定への変更のみが許可されます。実験的またはベータ設定への変更は拒否されます。

これは、すべての `EXPERIMENTAL` / `BETA` 機能に対する読み取り専用制約を設定することと同等です。

:::note
`0` の値は、すべての設定が変更可能であることを意味します。
:::

タイプ：`UInt32`

デフォルト：`0`
