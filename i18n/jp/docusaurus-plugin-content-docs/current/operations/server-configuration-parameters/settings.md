---
description: 'このセクションにはサーバー設定の説明が含まれています。つまり、セッションやクエリレベルで変更できない設定です。'
keywords: ['グローバルサーバー設定']
sidebar_label: 'サーバー設定'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: 'サーバー設定'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';

# サーバー設定

このセクションにはサーバー設定の説明が含まれています。これらはセッションやクエリレベルで変更できない設定です。

ClickHouse の設定ファイルに関する詳細は、[""設定ファイル""](/operations/configuration-files)を参照してください。

他の設定は、""[設定](/operations/settings/overview)"" セクションで説明されています。設定を学ぶ前に、[設定ファイル](/operations/configuration-files)セクションを読み、新しい設定により設定されていないフィールドを含む既存の制約のアクションがキャンセルされること（`incl` および `optional` 属性の使用）に注意することをお勧めします。

## access_control_improvements {#access_control_improvements}

アクセス制御システムのオプション改善のための設定。

| 設定 | 説明 | デフォルト |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`      | 行ポリシーを持たないユーザーが `SELECT` クエリを使用して行を読むことができるかどうかを設定します。たとえば、ユーザー A と B がいて、行ポリシーが A にのみ定義されている場合、この設定が true の場合、ユーザー B はすべての行を見ることができます。この設定が false の場合、ユーザー B は行を見えません。                                                                                                                     | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` クエリが `CLUSTER` グラントを必要とするかどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>` が任意のグラントを必要とし、任意のユーザーによって実行されることができるかどうかを設定します。true の場合、このクエリは `GRANT SELECT ON system.<table>` を必要とします。例外として、いくつかのシステムテーブル（`tables`、`columns`、`databases`、および `one`、`contributors` のような定数テーブル）がすべてのユーザーにアクセス可能です。`SHOW` 権限（例：`SHOW USERS`）が付与されている場合、対応するシステムテーブル（すなわち `system.users`）にアクセスできます。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` が任意のグラントを必要とし、任意のユーザーによって実行されることができるかどうかを設定します。true の場合、このクエリは `GRANT SELECT ON information_schema.<table>` を必要とします。                                                                                                                                                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | 一部の設定の設定プロファイルにおける制約が、その設定のために他のプロファイルで定義された前の制約のアクションをキャンセルするかどうかを設定します。これは、変更不可のフィールドを含む新しい制約によるものです。`changeable_in_readonly` 制約タイプも有効にします。                                                                                                                                                                                                          | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンを使用してテーブルを作成する際にグラントが必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`            | 最後のアクセスからの秒数で、ロールがロールキャッシュに保存される時間を設定します。                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`   |

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

## access_control_path {#access_control_path}

ClickHouse サーバーが SQL コマンドによって作成されたユーザーおよびロールの構成を保存するフォルダへのパス。

**参照**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached}

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />groupArray で最大配列要素サイズを超えたときに実行するアクション： `throw` 例外、または `discard` 余分な値

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size}

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray 関数の最大配列要素サイズ（バイト単位）。この制限は直列化時にチェックされ、大きな状態サイズを避けるのに役立ちます。

## allow_feature_tier {#allow_feature_tier}

<SettingsInfoBlock type="UInt32" default_value="0" />
ユーザーが異なる機能ティアに関連する設定を変更できるかどうかを制御します。

- `0` - すべての設定の変更が許可されます（実験的、ベータ、製品）。
- `1` - ベータおよび製品機能設定の変更のみ許可されます。実験的設定の変更は拒否されます。
- `2` - 製品設定の変更のみ許可されます。実験的またはベータ設定の変更は拒否されます。

これは、すべての `EXPERIMENTAL` / `BETA` 機能に対する読み取り専用制約を設定することに相当します。

:::note
値が `0` の場合、すべての設定を変更できます。
:::

## allow_implicit_no_password {#allow_implicit_no_password}

明示的に 'IDENTIFIED WITH no_password' が指定されていない限り、パスワードのないユーザーを作成することを禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## allow_no_password {#allow_no_password}

無効なパスワードタイプの no_password が許可されるかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```

## allow_plaintext_password {#allow_plaintext_password}

平文パスワードタイプ（非推奨）が許可されるかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc メモリの使用を許可する。

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown}

<SettingsInfoBlock type="Bool" default_value="1" />true の場合、優雅なシャットダウン時に非同期挿入のキューがフラッシュされます。

## async_insert_threads {#async_insert_threads}

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドでデータの解析と挿入を実際に行う最大スレッド数。ゼロは非同期モードが無効であることを意味します。

## async_load_databases {#async_load_databases}

<SettingsInfoBlock type="Bool" default_value="1" />
データベースおよびテーブルの非同期読み込み。

- true の場合、すべての非システムデータベースが、`Ordinary`、`Atomic`、および `Replicated` エンジンのもとで ClickHouse サーバーの起動後に非同期で読み込まれます。`system.asynchronous_loader` テーブル、`tables_loader_background_pool_size`、および `tables_loader_foreground_pool_size` サーバー設定を参照してください。まだ読み込まれていないテーブルにアクセスしようとするクエリは、正確にそのテーブルが起動するのを待ちます。読み込みジョブが失敗すると、クエリはエラーを再スローします（`async_load_databases = false` の場合、サーバー全体をシャットダウンするのではなく）。少なくとも1つのクエリによって待機されるテーブルは、より高い優先度で読み込まれます。データベースに対する DDL クエリも、正確にそのデータベースが起動するのを待ちます。待機クエリの合計数の制限として `max_waiting_queries` の設定を考慮することもできます。
- false の場合、すべてのデータベースはサーバーの起動時に読み込まれます。

**例**

```xml
<async_load_databases>true</async_load_databases>
```

## async_load_system_database {#async_load_system_database}

<SettingsInfoBlock type="Bool" default_value="0" />
システムテーブルの非同期読み込み。`system` データベース内のログテーブルとパーツの数が多い場合に便利です。`async_load_databases` 設定とは独立しています。

- true に設定されている場合、すべてのシステムデータベースが、`Ordinary`、`Atomic`、および `Replicated` エンジンで ClickHouse サーバーの起動後に非同期で読み込まれます。`system.asynchronous_loader` テーブル、`tables_loader_background_pool_size`、および `tables_loader_foreground_pool_size` サーバー設定を参照してください。まだ読み込まれていないシステムテーブルにアクセスしようとするクエリは、正確にそのテーブルが起動するのを待ちます。少なくとも1つのクエリによって待機されるテーブルは、より高い優先度で読み込まれます。待機クエリの合計数を制限するために `max_waiting_queries` 設定を考慮してください。
- false に設定されている場合、サーバーの起動前にシステムデータベースが読み込まれます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
```

## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

<SettingsInfoBlock type="UInt32" default_value="120" />重い非同期メトリクスの更新周期（秒単位）。

## asynchronous_insert_log {#asynchronous_insert_log}

[asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) システムテーブルによる非同期挿入ログの設定。

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

## asynchronous_metric_log {#asynchronous_metric_log}

ClickHouse Cloud デプロイでデフォルトで有効になっています。

この設定がユーザーの環境でデフォルトで有効にされていない場合、ClickHouse がどのようにインストールされたかに応じて、以下の手順に従って有効または無効にできます。

**有効化**

非同期メトリクスログ履歴の収集を手動でオンにするには、[`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md) のために、次の内容で `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します。

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

`asynchronous_metric_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` を作成する必要があります。

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>

## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics}

<SettingsInfoBlock type="Bool" default_value="0" />重い非同期メトリクスの計算を有効にします。

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

<SettingsInfoBlock type="UInt32" default_value="1" />非同期メトリクスの更新周期（秒単位）。

## auth_use_forwarded_address {#auth_use_forwarded_address}

プロキシ経由で接続されたクライアントの認証に発信元アドレスを使用します。

:::note
この設定は、転送されたアドレスが簡単に偽造される可能性があるため、特に注意して使用するべきです。このような認証を受け入れるサーバーには、直接ではなく、信頼できるプロキシを介してのみアクセスしてください。
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [Buffer-engine tables](/engines/table-engines/special/buffer) のフラッシュ操作を実行するために使用される最大スレッド数。

## background_common_pool_size {#background_common_pool_size}

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドでさまざまな操作（主にガーベジコレクション）を実行するために使用される最大スレッド数。[*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルのため。

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />分散送信を実行するために使用される最大スレッド数。

## background_fetches_pool_size {#background_fetches_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルから別のレプリカからデータパーツを取得するために使用される最大スレッド数。

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

<SettingsInfoBlock type="Float" default_value="2" />
バックグラウンドマージおよびミューテーションを同時に実行できるスレッド数と、その数との比率を設定します。

たとえば、比率が 2 で [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) が 16 に設定されている場合、ClickHouse は 32 のバックグラウンドマージを同時に実行できます。これは、バックグラウンド操作が一時停止され、延期される可能性があるためです。これは、小規模なマージにより多くの実行優先度を与えるために必要です。

:::note
この比率は、ランタイムでのみ増加できます。これを下げるには、サーバーを再起動する必要があります。

[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 設定と同様に、[`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) は、後方互換性のために `default` プロファイルから適用される可能性があります。
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

<SettingsInfoBlock type="String" default_value="round_robin" />
バックグラウンドマージおよびミューテーションのスケジューリングを行うポリシー。可能な値は： `round_robin` および `shortest_task_first`。

バックグラウンドスレッドプールによって実行される次のマージまたはミューテーションを選択するために使用されるアルゴリズム。ポリシーはサーバーを再起動せずにランタイムで変更できます。

可能な値：

- `round_robin` — すべての並行マージおよびミューテーションは、飢餓のない操作を保証するためにラウンドロビンの順序で実行されます。小規模なマージは、大規模なものよりも早く完了します。なぜなら、それらをマージするためのブロックが少ないからです。
- `shortest_task_first` — 常に小規模なマージまたはミューテーションを実行します。マージとミューテーションは、その結果のサイズに基づいて優先度が付与されます。小さいサイズのマージが大きいものよりも厳密に優先されます。このポリシーは、小さな部分の迅速なマージを保証しますが、`INSERT` で過負荷になったパーティションでは、大きなマージが無限に飢餓する可能性があります。

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />メッセージストリーミングのバックグラウンド操作を実行するために使用される最大スレッド数。

## background_move_pool_size {#background_move_pool_size}

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドで *MergeTree-engine* テーブルのデータパーツを別のディスクまたはボリュームに移動するために使用される最大スレッド数。

## background_pool_size {#background_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />
MergeTree エンジンを持つテーブルに対してバックグラウンドマージおよびミューテーションを実行するスレッド数を設定します。

:::note
- この設定は、ClickHouse サーバーの起動時に `default` プロファイルの設定から適用される場合があります。
- ランタイムでスレッド数を増やすことは可能ですが、減らすにはサーバーを再起動する必要があります。
- この設定を調整することで、CPUおよびディスクの負荷を管理します。
:::

:::danger
プールサイズが小さいと、CPUおよびディスクリソースの使用が少なくなりますが、バックグラウンドプロセスの進展は遅くなり、最終的にはクエリパフォーマンスに影響を与える可能性があります。
:::

変更する前に、次のような関連するMergeTree 設定も確認してください：
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge)。
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation)。

**例**

```xml
<background_pool_size>16</background_pool_size>
```

## background_schedule_pool_size {#background_schedule_pool_size}

<SettingsInfoBlock type="UInt64" default_value="512" />レプリケートテーブル、Kafka ストリーミングおよび DNS キャッシュ更新のために、常に軽量な定期操作を実行するために使用される最大スレッド数。

## backup_log {#backup_log}

`BACKUP` および `RESTORE` 操作を記録するための [backup_log](../../operations/system-tables/backup_log.md) システムテーブルの設定。

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

## backup_threads {#backup_threads}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />`BACKUP` リクエストを実行するための最大スレッド数。

## backups {#backups}

`BACKUP TO File()` の書き込み時に使用されるバックアップのための設定。

次の設定は、サブタグによって構成できます：

| 設定 | 説明 | デフォルト |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                      | `File()` を使用する場合にバックアップ先のパス。この設定は `File` を使用するために設定しなければなりません。パスはインスタンスディレクトリに対する相対パスまたは絶対パスにすることができます。 | `true`  |
| `remove_backup_files_after_failure` | `BACKUP` コマンドが失敗した場合、ClickHouse は失敗の前にバックアップにコピーされたファイルを削除しようとします。そうでなければ、コピーされたファイルはそのまま残されます。 | `true`  |

この設定はデフォルトで次のように構成されています:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```

## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

<SettingsInfoBlock type="UInt64" default_value="0" />
バックアップ IO スレッドプールにスケジュールできる最大ジョブ数。このキューを無制限に保つ事をお勧めします。現在の S3 バックアップロジックのためです。

:::note
値が `0`（デフォルト）は無制限を意味します。
:::

## bcrypt_workfactor {#bcrypt_workfactor}

[バイクリプトアルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)を使用するbcrypt_password 認証タイプの作業係数。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

## blog_storage_log {#blog_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) システムテーブルの設定。

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

## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

組み込み辞書を再読み込みするまでの秒数の間隔。

ClickHouse は x 秒ごとに組み込み辞書を再読み込みします。これにより、サーバーを再起動せずに "オンザフライ" で辞書を編集することが可能になります。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

<SettingsInfoBlock type="Double" default_value="0.5" />RAM 最大比率に対するキャッシュサイズを設定します。低メモリシステムでキャッシュサイズを減少させることができます。

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability}

<SettingsInfoBlock type="Double" default_value="0" />テスト目的のため。

## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio}

<SettingsInfoBlock type="Double" default_value="0.95" />
サーバープロセスのメモリ消費の "ハード" 閾値を指定します。これにより、サーバーの最大メモリ消費量がこの閾値に調整されます。

設定を参照：
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio)

## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio}

<SettingsInfoBlock type="Double" default_value="0.9" />
サーバープロセスのメモリ消費の "ソフト" 閾値を指定します。これにより、jemalloc のアリーナがパージされます。

設定を参照：
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

<SettingsInfoBlock type="UInt64" default_value="15" />
サーバーの許可された最大メモリ消費量が cgroups で対応する閾値によって調整される間隔（秒単位）。

cgroup オブザーバーを無効にするには、この値を `0` に設定します。

設定を参照：
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio)。

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />[コンパイルされた式](../../operations/caches.md)のためのキャッシュサイズ（要素数）を設定します。

## compiled_expression_cache_size {#compiled_expression_cache_size}

<SettingsInfoBlock type="UInt64" default_value="134217728" />[コンパイルされた式](../../operations/caches.md)のためのキャッシュサイズ（バイト単位）を設定します。

## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)-engine テーブルのデータ圧縮設定。

:::note
ClickHouse を使用し始めたばかりの場合は、これを変更しないことをお勧めします。
:::

**設定テンプレート**：

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

**`<case>` フィールド**：

- `min_part_size` – データパーツの最小サイズ。
- `min_part_size_ratio` – データパーツサイズとテーブルサイズの比率。
- `method` – 圧縮方式。許可される値： `lz4`、`lz4hc`、`zstd`、`deflate_qpl`。
- `level` – 圧縮レベル。[コーデック](/sql-reference/statements/create/table#general-purpose-codecs)を参照してください。

:::note
複数の `<case>` セクションを設定できます。
:::

**条件が満たされた場合のアクション**：

- データパーツが設定された条件に一致する場合、ClickHouseは指定された圧縮方式を使用します。
- データパーツが複数の条件セットに一致した場合、ClickHouseは最初に一致した条件セットを使用します。

:::note
データパーツに対して条件が満たされなかった場合、ClickHouseは `lz4` 圧縮を使用します。
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

## concurrent_threads_scheduler {#concurrent_threads_scheduler}

<SettingsInfoBlock type="String" default_value="round_robin" />
`concurrent_threads_soft_limit_num` および `concurrent_threads_soft_limit_ratio_to_cores` で指定される CPU スロットのスケジューリングをどのように行うかのポリシー。限られた CPU スロットが並行クエリにどのように分配されるかを制御するためのアルゴリズム。スケジューラーは、サーバーを再起動せずにランタイムで変更できます。

可能な値：

- `round_robin` — `use_concurrency_control` = 1 の設定を持つすべてのクエリは、最大 `max_threads` CPU スロットを割り当てます。スレッドごとに1つのスロット。競合時には、CPU スロットはラウンドロビンを使用するクエリに付与されます。最初のスロットは無条件に付与されるため、これは不公平感や `max_threads` が高いクエリのレイテンシの増大を引き起こす可能性があります。
- `fair_round_robin` — `use_concurrency_control` = 1 の設定を持つすべてのクエリは、最大 `max_threads - 1` CPU スロットを割り当てます。すべてのクエリの最初のスレッドに対して CPU スロットを必要としないラウンドロビンのバリエーション。これにより、`max_threads` = 1 のクエリはスロットを必要としなくなり、不公平にすべてのスロットが割り当てられることはありません。無条件で付与されるスロットはありません。

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />
クエリを実行するために許可されている最大のクエリ処理スレッド数。リモートサーバーからデータを取得するためのスレッドは除かれます。これはハードリミットではありません。制限に達した場合でも、クエリは実行するために少なくとも1つのスレッドを取得します。クエリは、実行中に利用可能なスレッドが増加した場合、必要な数のスレッドにスケールアップできます。

:::note
値 `0`（デフォルト）は無制限を意味します。
:::
## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) と同様ですが、コアに対する比率です。
## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />
ClickHouse が設定を再読み込みし、新しい変更を確認する頻度。
## core_dump {#core_dump} 

コアダンプファイルのサイズに対するソフトリミットを設定します。

:::note
ハードリミットはシステムツールを介して設定されます。
:::

**例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## crash_log {#crash_log} 

[crash_log](../../operations/system-tables/crash-log.md) システムテーブル操作の設定。

<SystemLogParameters/>

デフォルトのサーバー設定ファイル `config.xml` には、以下の設定セクションが含まれています。

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
`custom_cached_disks_base_directory` は、`filesystem_caches_path`（`filesystem_caches_path.xml` に見つかる）のカスタムディスクに対して優先されます。前者が存在しない場合は後者が使用されます。
ファイルシステムキャッシュ設定パスは、そのディレクトリ内に存在しなければなりません。さもなければ、ディスクの作成を妨げる例外がスローされます。

:::note
これは、サーバーがアップグレードされた古いバージョンで作成されたディスクには影響しません。この場合、サーバーが正常に起動するために例外はスローされません。
:::

例:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## custom_settings_prefixes {#custom_settings_prefixes} 

[カスタム設定](/operations/settings/query-level#custom_settings) 用のプレフィックスのリスト。プレフィックスはカンマで区切る必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**関連情報**

- [カスタム設定](/operations/settings/query-level#custom_settings)
## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" />
`DROP TABLE` 文によってテーブルが削除される前に、削除されたテーブルを [`UNDROP`](/sql-reference/statements/undrop.md) 文を使って復元できる遅延時間。`DROP TABLE` が `SYNC` 修飾子で実行された場合、この設定は無視されます。
この設定のデフォルトは `480`（8分）です。
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />テーブルの削除が失敗した場合、ClickHouse はこのタイムアウトを待ってから操作を再試行します。
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />テーブルを削除するために使用されるスレッドプールのサイズ。
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
`store/` ディレクトリからゴミをクリーンアップするタスクのパラメータ。
タスクのスケジューリング期間を設定します。

:::note
値 `0` は「決して」を意味します。デフォルト値は1日です。
:::
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />
`store/` ディレクトリからゴミをクリーンアップするタスクのパラメータ。
もしあるサブディレクトリがクリックハウスサーバーによって使用されておらず、且つこのディレクトリが最後の [`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒間修正されていない場合、タスクはこのディレクトリのすべてのアクセス権を削除することによって「隠します」。これは、ClickHouse サーバーが `store/` 内に表示されないことを期待するディレクトリにも適用されます。

:::note
値 `0` は「直ちに」を意味します。
:::
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />
`store/` ディレクトリからゴミをクリーンアップするタスクのパラメータ。
もしあるサブディレクトリが ClickHouse サーバーによって使用されておらず、「隠された」状態だった場合（[database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) を参照）、このディレクトリが最後の [`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒間修正されていない場合、タスクはこのディレクトリを削除します。
これは、ClickHouse サーバーが `store/` 内に表示されないことを期待するディレクトリにも適用されます。

:::note
値 `0` は「決して」を意味します。デフォルト値は30日です。
:::
## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />レプリケートされたデータベースでテーブルを永久にデタッチすることを許可します。
## default_database {#default_database} 

<SettingsInfoBlock type="String" default_value="default" />デフォルトのデータベース名。
## default_password_type {#default_password_type} 

クエリで自動的に設定されるパスワードタイプを設定します。`CREATE USER u IDENTIFIED BY 'p'` のようなクエリに適用されます。

受け入れられる値は次のとおりです。
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## default_profile {#default_profile} 

デフォルトの設定プロファイル。設定プロファイルは、`user_config` で指定されたファイルにあります。

**例**

```xml
<default_profile>default</default_profile>
```
## default_replica_name {#default_replica_name} 

<SettingsInfoBlock type="String" default_value="{replica}" />
ZooKeeper でのレプリカ名。

**例**

```xml
<default_replica_name>{replica}</default_replica_name>
```
## default_replica_path {#default_replica_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />
ZooKeeper におけるテーブルのパス。

**例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```
## default_session_timeout {#default_session_timeout} 

デフォルトのセッションタイムアウト（秒）。

```xml
<default_session_timeout>60</default_session_timeout>
```
## dictionaries_config {#dictionaries_config} 

辞書のための設定ファイルへのパス。

パス：

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにはワイルドカード \* と ? を含むことができます。

参照：
- "[辞書](../../sql-reference/dictionaries/index.md)"。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load} 

<SettingsInfoBlock type="Bool" default_value="1" />
辞書の遅延読み込み。

- `true` の場合、辞書は初回使用時にロードされます。読み込みに失敗した場合、辞書を使用していた関数が例外をスローします。
- `false` の場合、サーバーは起動時にすべての辞書を読み込みます。

:::note
サーバーは、すべての辞書が読み込みを完了するまで接続を受け付けず待機します
（例外: [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) が `false` に設定されている場合）。
:::

**例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />`background_reconnect` が有効になっている失敗した MySQL および Postgres 辞書の再接続試行の間隔（ミリ秒）。
## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />
すべての INSERT/ALTER/DELETE クエリを無効にします。この設定は、挿入や変更が読み取りパフォーマンスに影響を与えないようにするため、読み取り専用ノードが必要な場合に有効になります。
## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />内部DNSキャッシュを無効にします。Kubernetes のような頻繁に変更されるインフラストラクチャ上で ClickHouse を操作することをお勧めします。
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy} 

デフォルトでは、トンネリング（つまり、`HTTP CONNECT`）は HTTP プロキシを介して `HTTPS` リクエストを行うために使用されます。この設定は、それを無効にするために使用できます。

**no_proxy**

デフォルトでは、すべてのリクエストはプロキシを通過します。特定のホストに対してこれを無効にするには、`no_proxy` 変数を設定する必要があります。
リストおよびリモートリゾルバーの `<proxy>` 条項内、または環境変数で環境リゾルバーのために設定できます。
IP アドレス、ドメイン、サブドメイン、そして完全バイパスのための `'*'` ワイルドカードがサポートされます。先頭のドットは、curl が行うように取り除かれます。

**例**

以下の設定は、`clickhouse.cloud` およびそのすべてのサブドメイン（例: `auth.clickhouse.cloud`）へのプロキシリクエストをバイパスします。
先頭のドットがある GitLab にも同様です。`gitlab.com` と `about.gitlab.com` の両方はプロキシをバイパスします。

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
## disk_connections_soft_limit {#disk_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限を超える接続は、寿命が大幅に短くなります。この制限はディスク接続に適用されます。
## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="30000" />この制限を超える接続は使用後にリセットされます。接続キャッシュをオフにするには0に設定してください。この制限はディスク接続に適用されます。
## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />使用中の接続数がこの制限を超えると、警告メッセージがログに書き込まれます。この制限はディスク接続に適用されます。
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />
テーブル、データベース、テーブル関数、および辞書に対する `SHOW` および `SELECT` クエリで秘密を表示することを有効または無効にします。

秘密を表示したいユーザーは、[`format_display_secrets_in_show_and_select` format setting](../settings/formats#format_display_secrets_in_show_and_select) をオンにし、かつ [`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限を持っている必要があります。

可能な値：

- `0` — 無効。
- `1` — 有効。
## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />分散キャッシュが維持しようとするアクティブ接続のソフトリミット。フリー接続の数が `distributed_cache_keep_up_free_connections_ratio * max_connections` を下回ると、最も古いアクティビティを持つ接続が閉じられ、上限を超えるまで接続を閉じ続けます。
## distributed_ddl {#distributed_ddl} 

クラスター上で [分散DDLクエリ](../../sql-reference/distributed-ddl.md) （`CREATE`、`DROP`、`ALTER`、`RENAME`）を実行管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) が有効になっている場合のみ機能します。

`<distributed_ddl>` 内の設定可能な設定は次のとおりです：

| 設定                | 説明                                                                                                                       | デフォルト値                          |
|----------------------|---------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| `path`                 | DDL クエリの `task_queue` の Keeper 内のパス                                                                           |                                        |
| `profile`              | DDL クエリを実行するために使用されるプロファイル                                                                       |                                        |
| `pool_size`            | 同時に実行できる `ON CLUSTER` クエリの数                                                                                |                                        |
| `max_tasks_in_queue`   | キュー内に置くことができるタスクの最大数。                                                                             | `1,000`                                |
| `task_max_lifetime`    | 有効期限がこの値を超えた場合にノードを削除します。                                                                        | `7 * 24 * 60 * 60`（秒単位で1週間） |
| `cleanup_delay_period` | 新しいノードイベントが受信された後、最後のクリーンアップが `cleanup_delay_period` 秒より早く行われていなければ、クリーンアップが開始されます。 | `60` 秒                              |

**例**

```xml
<distributed_ddl>
    <!-- ZooKeeper の DDL クエリキューへのパス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- このプロファイルからの設定が DDL クエリを実行するのに使用されます -->
    <profile>default</profile>

    <!-- どれだけの ON CLUSTER クエリが同時に実行できるかを制御します。 -->
    <pool_size>1</pool_size>

    <!--
         クリーンアップ設定（アクティブなタスクは削除されません）
    -->

    <!-- タスク TTL を制御します（デフォルトは 1 週間） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- クリーンアップが行われる頻度を制御します（秒単位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- キュー内に配置できるタスクの数を制御します -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />名前を ipv4 アドレスに解決することを許可します。
## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />名前を ipv6 アドレスに解決することを許可します。
## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />内部 DNS キャッシュの最大エントリ数。
## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />内部 DNS キャッシュの更新間隔（秒）。
## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />ホスト名の DNS 解決における最大連続失敗数。これを超えると、ClickHouse DNS キャッシュからそのホスト名が削除されます。
## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Azure SDK からのログ記録を有効にします。
## encryption {#encryption} 

[暗号化コーデック](/sql-reference/statements/create/table#encryption-codecs) で使用されるキーを取得するためのコマンドを設定します。キー（または複数のキー）は環境変数に書き込むか、設定ファイルに設定する必要があります。

キーは16バイトの長さの16進数または文字列である必要があります。

**例**

設定からの読み込み：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
設定ファイルにキーを保存することは推奨されません。安全ではありません。キーを安全なディスクにある別の設定ファイルに移動し、その設定ファイルへのシンボリックリンクを `config.d/` フォルダに置くことができます。
:::

設定から読み込み、キーが16進数の場合：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

環境変数からキーを読み込む：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで `current_key_id` は暗号化に使用する現在のキーを設定し、すべての指定されたキーは復号に使用できます。

これらの方法は複数のキーに適用できます：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで `current_key_id` は暗号化のための現在のキーを示します。

また、ユーザーは nonce を追加することができ、これの長さは 12 バイトである必要があります（デフォルトでは暗号化および復号プロセスはゼロバイトからなる nonce を使用します）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または、16進数で設定できます：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上記に示されているすべてのことは `aes_256_gcm_siv` にも適用できます（ただし、キーは32バイトの長さでなければなりません）。
:::
## error_log {#error_log} 

デフォルトでは無効です。

**有効化**

エラーヒストリを手動で収集するには、[`system.error_log`](../../operations/system-tables/error_log.md) を有効にします。次の内容で `/etc/clickhouse-server/config.d/error_log.xml` を作成します：

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

`error_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_error_log.xml` を作成します：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## format_schema_path {#format_schema_path} 

入力データのスキーマディレクトリへのパス、例えば [CapnProto](../../interfaces/formats.md#capnproto) フォーマット用のスキーマなど。

**例**

```xml
<!-- 様々な入力フォーマット用のスキーマファイルを含むディレクトリ。 -->
<format_schema_path>format_schemas/</format_schema_path>
```
## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="0" />グローバルプロファイラーの CPU クロックタイマーの周期（ナノ秒）。0 の値を設定するとグローバルプロファイラーをオフにします。単一のクエリの場合、推奨値は少なくとも 10000000（1 秒間に 100 回）、クラスター全体のプロファイリングの場合は 1000000000（1 秒間に 1 回）です。
## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="0" />グローバルプロファイラーの実時間クロックタイマーの周期（ナノ秒）。0 の値を設定するとグローバルプロファイラーをオフにします。単一のクエリの場合、推奨値は少なくとも 10000000（1 秒間に 100 回）、クラスター全体のプロファイリングの場合は 1000000000（1 秒間に 1 回）です。
## google_protos_path {#google_protos_path} 

プロトタイプを含むディレクトリを定義します。

例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## graphite {#graphite} 

[Graphite](https://github.com/graphite-project) へのデータ送信。

設定：

- `host` – Graphite サーバー。
- `port` – Graphite サーバーのポート。
- `interval` – 送信の間隔（秒単位）。
- `timeout` – データ送信のタイムアウト（秒単位）。
- `root_path` – キーの接頭辞。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからデータを送信。
- `events` – [system.events](/operations/system-tables/events) テーブルからの期間に蓄積されたデルタデータを送信。
- `events_cumulative` – [system.events](/operations/system-tables/events) テーブルから累積データを送信。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルからデータを送信。

複数の `<graphite>` 条項を設定できます。例えば、異なるデータを異なる間隔で送信するために使用します。

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

Graphite 用のデータをスリム化する設定。

詳細については、[GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md) を参照してください。

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
## hsts_max_age {#hsts_max_age} 

HSTS の期限切れ時間（秒）。

:::note
値 `0` は ClickHouse が HSTS を無効にすることを意味します。正の数を設定した場合、HSTS は有効になり、max-age は設定した数値になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この制限を超える接続は、寿命が大幅に短くなります。この制限は、ディスクやストレージに属さない http 接続に適用されます。
## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限を超える接続は使用後にリセットされます。接続キャッシュをオフにするには0に設定してください。この制限は、ディスクやストレージに属さない http 接続に適用されます。
## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />使用中の接続数がこの制限を超えると、警告メッセージがログに書き込まれます。この制限は、ディスクやストレージに属さない http 接続に適用されます。
## http_handlers {#http_handlers} 

カスタム HTTP ハンドラーの使用を許可します。
新しい http ハンドラーを追加するには、新しい `<rule>` を追加するだけです。
ルールは、上から下へ、定義された順にチェックされ、最初に一致したものがハンドラーを実行します。

次の設定は、サブタブで構成できます：

| サブタグ             | 定義                                                                                                                                                     |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | リクエスト URL に一致させるため、`regex:` プレフィックスを使用して正規表現マッチを使用できます（オプション）                                            |
| `methods`            | リクエストメソッドに一致させるため、カンマで区切って複数のメソッドマッチを指定できます（オプション）                                                |
| `headers`            | リクエストヘッダーに一致させるため、各子要素（子要素名はヘッダー名）を一致させ、`regex:` プレフィックスを使用して正規表現マッチを使用できます（オプション） |
| `handler`            | リクエストハンドラー                                                                                                                                    |
| `empty_query_string` | URL にクエリ文字列がないことを確認します                                                                                                              |

`handler` には、以下の設定がサブタブで構成できます：

| サブタグ           | 定義                                                                                                                                                                      |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | リダイレクト先                                                                                                                                                           |
| `type`             | サポートされるタイプ: static、dynamic_query_handler、predefined_query_handler、redirect                                                                                  |
| `status`           | static タイプで使用、応答ステータスコード                                                                                                                                 |
| `query_param_name` | dynamic_query_handler タイプで使用、HTTP リクエストパラメータで `<query_param_name>` 値に対応する値を抽出して実行します                                                      |
| `query`            | predefined_query_handler タイプで使用、ハンドラーが呼び出されたときにクエリを実行します                                                                                  |
| `content_type`     | static タイプで使用、応答のコンテンツタイプ                                                                                                                                  |
| `response_content` | static タイプで使用、クライアントに送信されるレスポンスコンテンツ。`file://` または `config://` の接頭辞を使用すると、ファイルや設定からのコンテンツをクライアントに送信します |

規則のリストと共に、すべてのデフォルトハンドラーを有効にする `<defaults/>` を指定できます。

例：

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
## http_options_response {#http_options_response} 

`OPTIONS` HTTP リクエストの応答にヘッダーを追加するために使用されます。
`OPTIONS` メソッドは CORS プレフライトリクエストを行う際に使用されます。

詳細については、[OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS) を参照してください。

例：

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
## http_server_default_response {#http_server_default_response} 

ClickHouse HTTP(s) サーバーにアクセスしたときにデフォルトで示されるページです。
デフォルト値は "Ok."（行末に改行があります）。

**例**

`http://localhost: http_port` にアクセスすると `https://tabix.io/` を開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />アイスバーグカタログのためのバックグラウンドプールのサイズ
## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />アイスバーグカタログプールにプッシュ可能なタスクの数
## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />エントリとしてのアイスバーグメタデータファイルキャッシュの最大サイズ。ゼロは無効を意味します。
```

## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Iceberg メタデータキャッシュポリシー名。
## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />バイト単位のアイスバーグメタデータキャッシュの最大サイズ。ゼロは無効を意味します。
## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />アイスバーグメタデータキャッシュにおける保護されたキューのサイズ（SLRUポリシーの場合）をキャッシュの総サイズに対する比率で示します。
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />
trueの場合、ClickHouseは `CREATE VIEW` クエリで空のSQLセキュリティステートメントに対してデフォルトを書き込みません。

:::note
この設定は移行期間中のみ必要で、24.4で廃止される予定です。
:::
## include_from {#include_from} 

置換を含むファイルへのパス。XMLおよびYAML形式がサポートされています。

詳細については、「[設定ファイル](/operations/configuration-files)」のセクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリインデックスマークキャッシュポリシー名。
## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
インデックスマークキャッシュの最大サイズ。

:::note

値が `0` の場合、無効を意味します。

この設定はランタイム中に変更可能で、即座に反映されます。
:::
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />セカンダリインデックスマークキャッシュにおける保護されたキューのサイズ（SLRUポリシーの場合）をキャッシュの総サイズに対する比率で示します。
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリインデックスの非圧縮キャッシュポリシー名。
## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
`MergeTree` インデックスの非圧縮ブロック用キャッシュの最大サイズ。

:::note
値が `0` の場合、無効を意味します。

この設定はランタイム中に変更可能で、即座に反映されます。
:::
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />セカンダリインデックス非圧縮キャッシュにおける保護されたキューのサイズ（SLRUポリシーの場合）をキャッシュの総サイズに対する比率で示します。
## interserver_http_credentials {#interserver_http_credentials} 

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)中に他のサーバーに接続するために使用されるユーザー名とパスワード。さらに、サーバーはこれらの資格情報を使用して他のレプリカを認証します。
したがって、`interserver_http_credentials` はクラスタ内のすべてのレプリカで同じである必要があります。

:::note
- デフォルトでは、`interserver_http_credentials` セクションが省略されると、レプリケーション中に認証は使用されません。
- `interserver_http_credentials` 設定は、ClickHouseクライアント資格情報の[設定](../../interfaces/cli.md#configuration_files)に関連しません。
- これらの資格情報は、`HTTP` および `HTTPS` を通じてのレプリケーションに共通です。
:::

次の設定はサブタグによって設定できます：

- `user` — ユーザー名。
- `password` — パスワード。
- `allow_empty` — `true` の場合、資格情報が設定されていても他のレプリカは認証なしで接続できます。`false`の場合、認証なしの接続は拒否されます。デフォルト: `false`。
- `old` — 資格情報の回転中に使用された旧 `user` と `password` を含みます。複数の `old` セクションを指定できます。

**資格情報の回転**

ClickHouseは、すべてのレプリカを同時に停止せずに動的なインタサーバー資格情報の回転をサポートします。資格情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、資格情報を追加します。これにより、認証ありおよびなしでの接続が許可されます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカの設定が完了したら、`allow_empty` を `false` に設定するか、この設定を削除します。これにより、新しい資格情報を使用した認証が必須になります。

既存の資格情報を変更するには、ユーザー名とパスワードを `interserver_http_credentials.old` セクションに移動し、新しい値で `user` と `password` を更新します。この時点で、サーバーは他のレプリカに接続するために新しい資格情報を使用し、新旧どちらの資格情報でも接続を受け入れます。

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

新しい資格情報がすべてのレプリカに適用されたら、古い資格情報は削除できます。
## interserver_http_host {#interserver_http_host} 

他のサーバーがこのサーバーにアクセスするのに使用できるホスト名です。

省略すると、`hostname -f` コマンドと同じ方法で定義されます。

特定のネットワークインターフェースから分離するのに便利です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_http_port {#interserver_http_port} 

ClickHouseサーバー間でデータを交換するためのポートです。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_https_host {#interserver_https_host} 

[`interserver_http_host`](#interserver_http_host) と類似していますが、このホスト名は他のサーバーがこのサーバーに `HTTPS` を介してアクセスするのに使用できます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_https_port {#interserver_https_port} 

`HTTPS` 上で ClickHouse サーバー間でデータを交換するためのポートです。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_listen_host {#interserver_listen_host} 

ClickHouseサーバー間でデータを交換できるホストの制限。
Keeper が使用されている場合、異なる Keeper インスタンス間の通信にも同じ制限が適用されます。

:::note
デフォルトでは、その値は [`listen_host`](#listen_host) 設定と同じです。
:::

**例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

タイプ:

デフォルト:
## io_thread_pool_queue_size {#io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
IOスレッドプールでスケジュール可能な最大ジョブ数。

:::note
値が `0` の場合、無制限を意味します。
:::
## keep_alive_timeout {#keep_alive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />
ClickHouseが接続を閉じる前に、HTTPプロトコルのために着信リクエストを待機する秒数。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
バルク要求をサポートするための [Zoo]Keeper への MultiRead リクエストの最大バッチサイズ。0 に設定するとバッチ化が無効になります。ClickHouse Cloud のみ利用可能です。
## latency_log {#latency_log} 

デフォルトでは無効になっています。

**有効化**

レイテンシ履歴収集[`system.latency_log`](../../operations/system-tables/latency_log.md)を手動で有効にするには、次の内容で`/etc/clickhouse-server/config.d/latency_log.xml`を作成します。

```xml
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

`latency_log`設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_latency_log.xml` というファイルを作成してください。

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## ldap_servers {#ldap_servers} 

ここに接続パラメータを持つ LDAP サーバーのリストを記述して：
- 'ldap' 認証メカニズムが指定された専用のローカルユーザーの認証者として使用する、
- リモートユーザー辞書として使用する。

次の設定はサブタグによって設定できます：

| 設定                          | 説明                                                                                                                                                                                                                                                                                                                                                             |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                       | LDAPサーバーのホスト名またはIP、これは必須で空にすることはできません。                                                                                                                                                                                                                                                                                           |
| `port`                       | デフォルトは636（`enable_tls`がtrueの場合）、それ以外の場合は389。                                                                                                                                                                                                                                                                                        |
| `bind_dn`                    | バインドするために使用されるDNを構築するためのテンプレート。認証試行中にテンプレートのすべての `\{user_name\}` サブストリングが実際のユーザー名に置き換えられることによって、結果のDNが構築されます。                                                                                                                                                                                        |
| `user_dn_detection`          | バウンドユーザーの実際のユーザーDNを検出するためのLDAP検索パラメータを伴うセクション。これは主にサーバーがアクティブディレクトリである場合の役割マッピングのための検索フィルタに使用されます。結果のユーザーDNは `\{user_dn\}` サブストリングが許可されるところで使用されます。デフォルトでは、ユーザーDNはバインドDNと等しく設定されますが、検索が行われると、実際の検出されたユーザーDN値で更新されます。   |
| `verification_cooldown`      | 成功したバインド試行後の期間（秒数）。この秒数の間、ユーザーはLDAPサーバーに連絡することなくすべての連続リクエストに対して正常に認証されたと見なされます。デフォルトでキャッシュを無効にし、各認証リクエストのためにLDAPサーバーに連絡するようにするには、`0` を指定してください。                                                                                                                  |
| `enable_tls`                 | LDAPサーバーへの安全な接続をトリガーするフラグ。平文（`ldap://`）プロトコルのためには`no`を指定します（推奨されません）。SSL/TLSを介したLDAP（`ldaps://`）プロトコルのためには`yes`を指定します（推奨、デフォルト）。レガシーStartTLSプロトコルのためには`starttls`を指定します（平文（`ldap://`）プロトコル、TLSにアップグレード）。                                         |
| `tls_minimum_protocol_version` | SSL/TLSの最小プロトコルバージョン。受け入れられる値は `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）です。                                                                                                                                                                                                                                                                              |
| `tls_require_cert`           | SSL/TLSピア証明書検証動作。受け入れられる値は `never`, `allow`, `try`, `demand`（デフォルト）です。                                                                                                                                                                                                                                                                                |
| `tls_cert_file`              | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                   |
| `tls_key_file`               | 証明書のキー ファイルへのパス。                                                                                                                                                                                                                                                                                                                                |
| `tls_ca_cert_file`           | CA証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                   |
| `tls_ca_cert_dir`            | CA証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                  |
| `tls_cipher_suite`           | 許可された暗号スイート（OpenSSL記法）。                                                                                                                                                                                                                                                                                                                                                            |

`user_dn_detection`の設定はサブタグで設定できます：

| 設定             | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`        | LDAP検索のために基盤DNを構築するためのテンプレート。結果のDNはLDAP検索中にテンプレートのすべての `\{user_name\}` と`\{bind_dn\}` サブストリングが実際のユーザー名とバインドDNに置き換えることによって構築されます。                                                                                                                                                                             |
| `scope`          | LDAP検索のスコープ。受け入れられる値は `base`, `one_level`, `children`, `subtree`（デフォルト）です。                                                                                                                                                                                                                                                                                     |
| `search_filter`  | LDAP検索のために検索フィルタを構築するためのテンプレート。結果のフィルタはLDAP検索中にテンプレートのすべての `\{user_name\}`、 `\{bind_dn\}`、および `\{base_dn\}` サブストリングが実際のユーザー名、バインドDN、および基盤DNに置き換えることによって構築されます。特に、特殊文字はXML内で正しくエスケープする必要があります。 |

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

例（ユーザーDN検出を設定した通常のアクティブディレクトリ）:

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
## license_key {#license_key} 

ClickHouseエンタープライズエディションのライセンスキー
## listen_backlog {#listen_backlog} 

リッスンソケットのバックログ（保留中の接続のキューサイズ）。デフォルト値の `4096` はLinuxの[5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)と同じです。

通常、この値を変更する必要はありません。理由は以下の通りです：
- デフォルト値は十分大きい、
- クライアントの接続を受け入れるためにサーバーには別のスレッドがあります。

したがって、たとえ `TcpExtListenOverflows` （`nstat`から）が0でなく、ClickHouseサーバーのこのカウンタが成長していても、この値を増やす必要があるとは限りません。理由は以下の通りです：
- たいていの場合、`4096`が不十分であることは内部ClickHouseスケーリングの問題を示すので、問題を報告する方が良いです。
- サーバーが後でより多くの接続を処理できるとは限りません（仮にできたとしても、その瞬間にはクライアントが消えたり切断されたりする可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```
## listen_host {#listen_host} 

リクエストが来る可能性のあるホストの制限。すべてに応答させたければ、`::`を指定します。

例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_reuse_port {#listen_reuse_port} 

複数のサーバーが同じアドレス:ポートにリッスンできるようにします。リクエストはオペレーティングシステムによってランダムなサーバーにルーティングされます。この設定を有効にすることは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

タイプ:

デフォルト:
## listen_try {#listen_try} 

IPv6またはIPv4ネットワークが利用できないときにサーバーが終了しないようにします。

**例**

```xml
<listen_try>0</listen_try>
```
## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />マークのロードのためのバックグラウンドプールのサイズ
## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />プリフェッチプールにプッシュ可能なタスクの数
```

## logger {#logger} 

ログメッセージの場所とフォーマット。

**キー**:

| キー                       | 説明                                                                                                                                                                         |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | ログレベル。許可される値: `none`（ロギングをオフ）、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                                  |
| `log`                     | ログファイルへのパス。                                                                                                                                                           |
| `errorlog`                | エラーログファイルへのパス。                                                                                                                                                     |
| `size`                    | 回転ポリシー: ログファイルの最大サイズ（バイト単位）。ログファイルサイズがこのしきい値を超えると、リネームされてアーカイブされ、新しいログファイルが作成されます。                  |
| `count`                   | 回転ポリシー: Clickhouse が保持する最大履歴ログファイル数。                                                                                                         |
| `stream_compress`         | ログメッセージを LZ4 で圧縮します。`1` または `true` に設定することで有効化されます。                                                                                                                    |
| `console`                 | ログメッセージをログファイルに書き込まず、代わりにコンソールに出力します。`1` または `true` に設定することで有効化されます。デフォルトは `1`（Clickhouse がデーモンモードでない場合）、`0` はそれ以外です。 |
| `console_log_level`       | コンソール出力用のログレベル。デフォルトは `level`。                                                                                                                                  |
| `formatting`              | コンソール出力用のログフォーマット。現在は `json` のみがサポートされています。                                                                                                                  |
| `use_syslog`              | ログ出力を syslog にも転送します。                                                                                                                                                  |
| `syslog_level`            | syslog へのログ記録用ログレベル。                                                                                                                                                    |

**ログフォーマット指定子**

`log` と `errorLog` パスのファイル名は、結果のファイル名用の以下のフォーマット指定子をサポートしています（ディレクトリ部分はサポートされていません）。

カラム "Example" は `2023-07-06 18:32:07` の出力を示しています。

| 指定子    | 説明                                                                                                         | 例                      |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | リテラル %                                                                                                           | `%`                        |
| `%n`         | 改行文字                                                                                                  |                          |
| `%t`         | 水平タブ文字                                                                                            |                          |
| `%Y`         | 10進数での年、例: 2017                                                                                 | `2023`                     |
| `%y`         | 年の最後の2桁の10進数（範囲 [00,99]）                                                           | `23`                       |
| `%C`         | 年の最初の2桁の10進数（範囲 [00,99]）                                                          | `20`                       |
| `%G`         | 4桁の [ISO 8601 週ベース年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、すなわち指定された週を含む年。通常は `%V` と一緒にのみ役立ちます  | `2023`       |
| `%g`         | [ISO 8601 週ベース年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、すなわち指定された週を含む年の最後の2桁。                         | `23`         |
| `%b`         | 略式の月名、例: Oct（ロケール依存）                                                                 | `Jul`                      |
| `%h`         | %b の同義語                                                                                                       | `Jul`                      |
| `%B`         | 完全な月名、例: October（ロケール依存）                                                                    | `July`                     |
| `%m`         | 10進数での月（範囲 [01,12]）                                                                           | `07`                       |
| `%U`         | 年の週の番号を10進数で表したもの（日曜日が週の最初の日）（範囲 [00,53]）                          | `27`                       |
| `%W`         | 年の週の番号を10進数で表したもの（月曜日が週の最初の日）（範囲 [00,53]）                          | `27`                       |
| `%V`         | ISO 8601 週番号（範囲 [01,53]）                                                                                | `27`                       |
| `%j`         | 年のタームを10進数で表したもの（範囲 [001,366]）                                                               | `187`                      |
| `%d`         | 月の日をゼロパディングした10進数で表したもの（範囲 [01,31]）。1桁の数字はゼロで前に付けられます。                 | `06`                       |
| `%e`         | 月の日をスペースパディングした10進数で表したもの（範囲 [1,31]）。1桁の数字はスペースで前に付けられます。              | `&nbsp; 6`                 |
| `%a`         | 略式の曜日名、例: Fri（ロケール依存）                                                               | `Thu`                      |
| `%A`         | 完全な曜日名、例: Friday（ロケール依存）                                                                   | `Thursday`                 |
| `%w`         | 曜日を整数で表したもの（日曜日が0）（範囲 [0-6]）                                                          | `4`                        |
| `%u`         | 曜日を10進数で表したもの（月曜日が1であるISO 8601形式）（範囲 [1-7]）                                      | `4`                        |
| `%H`         | 時間を10進数で表したもの、24時間制（範囲 [00-23]）                                                             | `18`                       |
| `%I`         | 時間を10進数で表したもの、12時間制（範囲 [01,12]）                                                             | `06`                       |
| `%M`         | 分を10進数で表したもの（範囲 [00,59]）                                                                          | `32`                       |
| `%S`         | 秒を10進数で表したもの（範囲 [00,60]）                                                                          | `07`                       |
| `%c`         | 標準の日時文字列、例: Sun Oct 17 04:41:13 2010（ロケール依存）                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | ローカライズされた日付表示（ロケール依存）                                                                    | `07/06/23`                 |
| `%X`         | ローカライズされた時間表示、例: 18:40:20 または 6:40:20 PM（ロケール依存）                                       | `18:32:07`                 |
| `%D`         | 短い MM/DD/YY 日付、%m/%d/%y と同等                                                                         | `07/06/23`                 |
| `%F`         | 短い YYYY-MM-DD 日付、%Y-%m-%d と同等                                                                       | `2023-07-06`               |
| `%r`         | ローカライズされた12時間制の時間（ロケール依存）                                                                     | `06:32:07 PM`              |
| `%R`         | "%H:%M" と同等                                                                                               | `18:32`                    |
| `%T`         | "%H:%M:%S"（ISO 8601 時間フォーマット）                                                                 | `18:32:07`                 |
| `%p`         | ローカライズされたアームまたは午後の指定（ロケール依存）                                                               | `PM`                       |
| `%z`         | ISO 8601 形式のUTCからのオフセット（例: -0430）、またはタイムゾーン情報が利用できない場合は文字がありません | `+0800`                    |
| `%Z`         | ロケール依存のタイムゾーン名または略語、またはタイムゾーン情報が利用できない場合は文字がありません     | `Z AWST `                  |

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

ログメッセージをコンソールのみで出力するには:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個々のログ名のログレベルをオーバーライドできます。たとえば、「Backup」と「RBAC」のロガーのすべてのメッセージをミュートするには。

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

ログメッセージを追加して syslog に書くには:

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

`<syslog>` のキー:

| キー        | 説明                                                                                                                                                                                                                                                    |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | `host\[:port\]` 形式の syslog のアドレス。省略された場合は、ローカルデーモンが使用されます。                                                                                                                                                                         |
| `hostname` | ログが送信されるホストの名前（オプション）。                                                                                                                                                                                                      |
| `facility` | syslog の [ファシリティキーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。大文字で "LOG_" プレフィックスを指定する必要があります。例: `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` など。デフォルト: `address` が指定されている場合は `LOG_USER`、それ以外は `LOG_DAEMON`。                                           |
| `format`   | ログメッセージフォーマット。可能な値: `bsd` と `syslog.`                                                                                                                                                                                                       |

**ログ形式**

コンソールログで出力されるログ形式を指定できます。現在、サポートされているのは JSON のみです。

**例**

出力 JSON ログの例:

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

JSON ロギングサポートを有効にするには、以下のスニペットを使用します:

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

**JSON ログのキーの名前を変更する**

キー名は、`<names>` タグ内のタグ値を変更することで修正できます。たとえば、`DATE_TIME` を `MY_DATE_TIME` に変更するには、`<date_time>MY_DATE_TIME</date_time>` を使用します。

**JSON ログのキーを省略する**

ログプロパティは、プロパティをコメントアウトすることで省略できます。たとえば、`query_id` をログに出力させたくない場合は、`<query_id>` タグをコメントアウトできます。
## macros {#macros} 

レプリケーションテーブルのパラメータ置換。

レプリケーションテーブルを使用しない場合は省略できます。

詳細については、[レプリケーションテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)のセクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```
## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />マークキャッシュポリシー名。
## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />プレウォーム中にフィルするマークキャッシュの合計サイズの比率。
## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
マーク（[`MergeTree`](/engines/table-engines/mergetree-family) ファミリーのインデックス）のキャッシュの最大サイズ。

:::note
この設定は実行時に変更でき、すぐに有効になります。
:::
## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />マークキャッシュの保護されたキューのサイズ（SLRU ポリシーの場合）をキャッシュの合計サイズに対して表しています。
## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />スタートアップ時にアクティブなデータパーツセットを読み込むためのスレッド数。
## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ユーザーごとに作成できるまたは変更できる認証メソッドの最大数。
この設定を変更しても既存のユーザーには影響しません。この設定で指定された制限を超える認証関連のクエリは失敗します。
非認証の作成/変更クエリは成功します。

:::note
`0` の値は無制限を意味します。
:::
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべてのバックアップの最大読み取り速度（バイト/秒）。ゼロは無制限を意味します。
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />バックアップ IO スレッドプール内の **アイドル** スレッドの数が `max_backup_io_thread_pool_free_size` を超えると、ClickHouse はアイドルスレッドによって占有されていたリソースを解放し、プールサイズを減少させます。必要に応じてスレッドを再作成できます。
## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse は、S3 バックアップ IO 操作を行うためにバックアップ IO スレッドプールからスレッドを使用します。`max_backups_io_thread_pool_size` はプール内のスレッドの最大数を制限します。
## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
ベクターインデックスを構築するために使用するスレッドの最大数。

:::note
`0` の値はすべてのコアを意味します。
:::
## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に実行できる挿入クエリの合計数の制限。

:::note

`0`（デフォルト）という値は無制限を意味します。

この設定は実行時に変更でき、すぐに有効になります。すでに実行中のクエリは変更されません。
:::
## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に実行されるクエリの合計数の制限。`INSERT` および `SELECT` クエリに対する制限、およびユーザーの最大クエリ数も考慮に入れる必要があります。

次を参照してください:
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

`0`（デフォルト）という値は無制限を意味します。

この設定は実行時に変更でき、すぐに有効になります。すでに実行中のクエリは変更されません。
:::
## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に実行される選択クエリの合計数の制限。

:::note

`0`（デフォルト）という値は無制限を意味します。

この設定は実行時に変更でき、すぐに有効になります。すでに実行中のクエリは変更されません。
:::
## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />最大サーバ接続数。
## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />データベースの数がこの値を超えると、サーバーは例外を投げます。0は制限なしを意味します。
## max_database_num_to_warn {#max_database_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
接続されているデータベースの数が指定された値を超えると、Clickhouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```
## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />DatabaseReplicated でレプリカ復旧中にテーブルを作成するためのスレッド数。ゼロはスレッド数がコア数と同じであることを意味します。
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
辞書の数がこの値を超えると、サーバーは例外を投げます。

次のデータベースエンジンのテーブルのみがカウントされます:
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
## max_dictionary_num_to_warn {#max_dictionary_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
接続されている辞書の数が指定された値を超えると、Clickhouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```
## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />集約中に収集されるハッシュテーブル統計のエントリ数の許可値。
## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITION 用のスレッド数。
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
IO スレッドプール内の **アイドル** スレッドの数が `max_io_thread_pool_free_size` を超えると、ClickHouse はアイドルスレッドによって占有されていたリソースを解放し、プールサイズを減少させます。必要に応じてスレッドを再作成できます。
## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse は、いくつかの IO 操作（例: S3 との対話）を行うために IO スレッドプールからスレッドを使用します。`max_io_thread_pool_size`はプール内のスレッドの最大数を制限します。
## max_keep_alive_requests {#max_keep_alive_requests} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
単一の keep-alive 接続を通じて ClickHouse サーバーによって閉じられるまでの最大要求数。

**例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
ローカルリードの最大速度（バイト/秒）。

:::note
`0` の値は無制限を意味します。
:::
## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
ローカル書き込みの最大速度（バイト/秒）。

:::note
`0` の値は無制限を意味します。
:::
## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />
テーブルに接続されるマテリアライズドビューの数の制限。

:::note
ここでは直接依存するビューのみが考慮されており、他のビューの上にビューを作成することは考慮されません。
:::
## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべてのマージの最大読み取り速度（バイト/秒）。ゼロは無制限を意味します。
## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべての変異の最大読み取り速度（バイト/秒）。ゼロは無制限を意味します。
## max_open_files {#max_open_files} 

オープンファイルの最大数。

:::note
macOSでこのオプションを使用することをお勧めします。なぜなら、`getrlimit()` 関数が不正確な値を返すからです。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```
## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />接続を切るとみなすための OS CPU 待機（OSCPUWaitMicroseconds メトリック）とビジー（OSCPUVirtualTimeMicroseconds メトリック）タイム間の最大比率。最小値と最大値の間で線形補間を使用して確率を計算します。この時ポイントの確率は 1 です。
## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />起動時に非アクティブなデータパーツセットを読み込むためのスレッド数。
## max_part_num_to_warn {#max_part_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="100000" />
アクティブなパーツの数が指定された値を超えると、Clickhouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```
## max_partition_size_to_drop {#max_partition_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
パーティションを削除する制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが [`max_partition_size_to_drop`](#max_partition_size_to_drop)（バイト単位）を超えると、[`DROP PARTITION`](../../sql-reference/statements/alter/partition.md#drop-partitionpart) クエリを使用してパーティションを削除することはできません。
この設定は、ClickHouse サーバーを再起動することなく適用できます。制限を無効にする別の方法は、`<clickhouse-path>/flags/force_drop_table` ファイルを作成することです。

:::note
`0` の値はパーティションを無制限に削除できることを意味します。

この制限は、テーブルを削除およびトランケートすることを制限するものではありません。[max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)を参照してください。
:::

**例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```
## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />非アクティブなデータパーツを同時に削除するためのスレッド数。
## max_pending_mutations_execution_time_to_warn {#max_pending_mutations_execution_time_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
保留中の変異が指定された秒数を超えると、Clickhouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```
## max_pending_mutations_to_warn {#max_pending_mutations_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="500" />
保留中の変異の数が指定された値を超えると、Clickhouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```
## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
プレフィックス逆シリアライズスレッドプール内の **アイドル** スレッドの数が `max_prefixes_deserialization_thread_pool_free_size` を超えると、ClickHouse はアイドルスレッドによって占有されていたリソースを解放し、プールサイズを減少させます。必要に応じてスレッドを再作成できます。
## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse は、MergeTree の Wide パーツからファイルプレフィックスのメタデータの列とサブカラムを並行して読み込むために、プレフィックス逆シリアライズスレッドプールからスレッドを使用します。`max_prefixes_deserialization_thread_pool_size` はプール内のスレッドの最大数を制限します。
## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
読み取りのためのネットワーク上でのデータ交換の最大速度（バイト/秒）。

:::note
`0`（デフォルト）という値は無制限を意味します。
:::
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
書き込みのためのネットワーク上でのデータ交換の最大速度（バイト/秒）。

:::note
`0`（デフォルト）という値は無制限を意味します。
:::
## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケーションフェッチのためにネットワーク上でのデータ交換の最大速度（バイト/秒）。ゼロは無制限を意味します。
## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケーション送信のためにネットワーク上でのデータ交換の最大速度（バイト/秒）。ゼロは無制限を意味します。
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
レプリケーションテーブルの数がこの値を超えると、サーバーは例外を投げます。

次のデータベースエンジンのテーブルのみがカウントされます:
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
## max_server_memory_usage {#max_server_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />
サーバーが使用することを許可された最大メモリ量（バイト単位）。

:::note
サーバーの最大メモリ消費は、`max_server_memory_usage_to_ram_ratio` の設定によりさらに制限されます。
:::

特別な場合として、`0`（デフォルト）の値は、サーバーがすべての利用可能なメモリを消費できることを意味します（`max_server_memory_usage_to_ram_ratio` により課される追加の制限を除く）。
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />
サーバーが使用することを許可された最大メモリ量（利用可能なすべてのメモリに対する比率）。

たとえば、`0.9`（デフォルト）の値は、サーバーが利用可能なメモリの 90% を消費できることを意味します。

低メモリシステムでのメモリ使用量を減らすことができます。
RAM とスワップが少ないホストでは、`max_server_memory_usage_to_ram_ratio` を 1 より大きく設定する必要があるかもしれません。

:::note
サーバーの最大メモリ消費は、`max_server_memory_usage` の設定によりさらに制限されます。
:::
## max_session_timeout {#max_session_timeout} 

最大セッションタイムアウト（秒単位）。

例:

```xml
<max_session_timeout>3600</max_session_timeout>
```

## max_table_num_to_throw {#max_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
テーブルの数がこの値を超えると、サーバーは例外をスローします。

以下のテーブルはカウントされません：
- view
- remote
- dictionary
- system

データベースエンジンのテーブルのみカウントされます：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が `0` の場合、制限はありません。
:::

**例**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```

## max_table_num_to_warn {#max_table_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="5000" />
接続されているテーブルの数が指定された値を超えると、ClickHouseサーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

## max_table_size_to_drop {#max_table_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
テーブル削除の制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが `max_table_size_to_drop`（バイト単位）を超えると、[`DROP`](../../sql-reference/statements/drop.md) クエリまたは [`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリを使用して削除することはできません。

:::note
値が `0` の場合、制限なしで全てのテーブルを削除できます。

この設定を適用するためにClickHouseサーバーの再起動は必要ありません。制限を無効にする別の方法は、`<clickhouse-path>/flags/force_drop_table` ファイルを作成することです。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
外部集約、結合、またはソート用に使用できるストレージの最大量。
この制限を超えるクエリは例外で失敗します。

:::note
値が `0` の場合、制限なしです。
:::

関連情報：
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max_thread_pool_free_size {#max_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
グローバルスレッドプールの**アイドル**スレッドの数が [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size) を超えると、ClickHouseはいくつかのスレッドが占有しているリソースを解放し、プールのサイズが減少します。必要に応じてスレッドは再作成できます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

## max_thread_pool_size {#max_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
ClickHouseはクエリを処理するためにグローバルスレッドプールのスレッドを使用します。クエリを処理するためのアイドルスレッドがない場合、新しいスレッドがプール内に作成されます。 `max_thread_pool_size` はプール内の最大スレッド数を制限します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />起動時に非アクティブなデータパーツ（予期しないパーツ）をロードするスレッドの数。

## max_view_num_to_throw {#max_view_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
ビューの数がこの値を超えると、サーバーは例外をスローします。

データベースエンジンのテーブルのみカウントされます：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が `0` の場合、制限はありません。
:::

**例**
```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```

## max_view_num_to_warn {#max_view_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
接続されているビューの数が指定された値を超えると、ClickHouseサーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時待機中のクエリの合計数の制限。
必要なテーブルが非同期に読み込まれている間、待機中のクエリの実行はブロックされます（[`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases) を参照）。

:::note
待機中のクエリは、以下の設定によって制御される制限をチェックする際にはカウントされません：

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

この修正は、サーバーの起動後すぐにこれらの制限に達するのを防ぐために行われます。
:::

:::note

値が `0`（デフォルト）の場合、制限なしです。

この設定はランタイム中に変更可能で、即座に効果を発揮します。すでに実行中のクエリは変更されません。
:::

## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />
バックグラウンドメモリワーカーが外部ソース（jemallocやcgroupsなど）からの情報に基づいて内部メモリトラッカーを修正するべきかどうか。

## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />
バックグラウンドメモリワーカーのティック周期で、メモリトラッカーのメモリ使用量を修正し、高いメモリ使用中に未使用のページをクリーンアップします。 0に設定されている場合、メモリ使用量のソースに応じてデフォルト値が使用されます。

## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />現在のcgroupメモリ使用情報を使用してメモリトラッキングを修正します。

## merge_tree {#merge_tree} 

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの微調整。

詳細はMergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />
リソースがマージと他のワークロード間でどのように利用されて共有されるかを調整するために使用されます。指定された値は、すべてのバックグラウンドマージのための `workload` 設定値として使用されます。マージツリー設定で上書きできます。

**関連情報**
- [Workload Scheduling](/operations/workload-scheduling.md)

## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />
マージおよび変更操作を実行するために許可されるRAMの制限を設定します。
ClickHouseが設定された制限に達した場合、新しいバックグラウンドマージまたは変更操作をスケジュールせず、すでにスケジュールされたタスクの実行を続行します。

:::note
値が `0` の場合、制限なしです。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```

## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />
デフォルトの `merges_mutations_memory_usage_soft_limit` 値は `memory_amount * merges_mutations_memory_usage_to_ram_ratio` として計算されます。

**関連情報：**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric_log {#metric_log} 

デフォルトでは無効です。

**有効化**

メトリクス履歴収集の手動オンにするには [`system.metric_log`](../../operations/system-tables/metric_log.md)、次の内容で `/etc/clickhouse-server/config.d/metric_log.xml` を作成します：

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

`metric_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_metric_log.xml` ファイルを作成する必要があります：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />接続をドロップするかどうかを考慮するためのOS CPU待機時間（OSCPUWaitMicrosecondsメトリック）とビジー時間（OSCPUVirtualTimeMicrosecondsメトリック）の最小比率。最小比率と最大比率の間の線形補間が使用され、確率はこのポイントで0になります。

## mlock_executable {#mlock_executable} 

起動後に `mlockall` を実行して最初のクエリのレイテンシを低減し、高IO負荷時にClickHouse実行可能ファイルがページアウトされないようにします。

:::note
このオプションを有効にすることは推奨されますが、最大数秒までの起動時間の増加をもたらします。
この設定は「CAP_IPC_LOCK」機能なしでは機能しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```

## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />
マップファイル用のキャッシュサイズ（バイト単位）を設定します。この設定により、頻繁なオープン/クローズ呼び出し（後続のページフォールトにより非常にコストがかかります）を避け、複数のスレッドやクエリからのマッピングを再利用することができます。設定値はマップ領域の数（通常はマップファイルの数と等しい）です。

マップファイル内のデータ量は、以下のシステムテーブルにて次のメトリックで監視できます：

| システムテーブル                                                                                                                                                                                                                                                                                                                                                       | メトリック                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) および [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                              | `MMappedFiles` と `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                     | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events)、[`system.processes`](/operations/system-tables/processes)、[`system.query_log`](/operations/system-tables/query_log)、[`system.query_thread_log`](/operations/system-tables/query_thread_log)、[`system.query_views_log`](/operations/system-tables/query_views_log)  | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
マップファイル内のデータ量は直接メモリを消費せず、クエリまたはサーバーメモリ使用状況にはカウントされません — なぜなら、このメモリはOSページキャッシュのように破棄可能だからです。キャッシュはMergeTreeファミリーのテーブルから古いパーツが削除される際に自動的に削除されます。また、`SYSTEM DROP MMAP CACHE` クエリにより手動で削除することもできます。

この設定はランタイム中に変更可能で、即座に効果を発揮します。
:::

## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />
変更と他のワークロード間でリソースがどのように利用されて共有されるかを調整するために使用します。指定された値は、すべてのバックグラウンド変更のための `workload` 設定値として使用されます。マージツリー設定で上書きすることができます。

**関連情報**
- [Workload Scheduling](/operations/workload-scheduling.md)

## mysql_port {#mysql_port} 

MySQLプロトコルを通じてクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します。
- 空の値はMySQLプロトコルを通じてのクライアントとの通信を無効にします。
:::

**例**

```xml
<mysql_port>9004</mysql_port>
```

## openSSL {#openssl} 

SSLクライアント/サーバー設定。

SSLのサポートは `libpoco` ライブラリによって提供されます。利用可能な設定オプションは [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) で説明されています。デフォルト値は [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) にあります。

サーバー/クライアント設定用のキー：

| オプション                        | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                            | デフォルト値                              |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | PEM証明書の秘密鍵が含まれるファイルのパス。このファイルには鍵と証明書が同時に含まれる場合があります。                                                                                                                                                                                                                                                                                                                                              |                                            |
| `certificateFile`             | PEM形式のクライアント/サーバー証明書ファイルのパス。 `privateKeyFile` に証明書が含まれる場合は省略可能です。                                                                                                                                                                                                                                                                                                                                                |                                            |
| `caConfig`                    | 信頼されるCA証明書が含まれるファイルまたはディレクトリのパス。このパスがファイルを指している場合、それはPEM形式でなければならず、複数のCA証明書を含むことができます。このパスがディレクトリを指している場合、各CA証明書ごとに1つの.pemファイルが必要です。ファイル名はCAのサブジェクト名のハッシュ値に基づいて検索されます。詳細は [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) のマニュアルページにあります。 |                                            |
| `verificationMode`            | ノードの証明書をチェックする方法。詳細は[Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h)クラスの説明にあります。可能な値： `none`, `relaxed`, `strict`, `once`。                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | 検証チェーンの最大長。設定された値を超えると証明書チェーンの長さが超えた場合、検証は失敗します。                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | OpenSSL用に組み込みのCA証明書が使用されるかどうか。ClickHouseは組み込みCA証明書がファイル `/etc/ssl/cert.pem`（またはディレクトリ `/etc/ssl/certs`）にあると仮定します。または、環境変数 `SSL_CERT_FILE`（または `SSL_CERT_DIR`）で指定されたファイル（またはディレクトリ）に存在します。                                                                                                                                                                        | `true`                                     |
| `cipherList`                  | OpenSSLでサポートされている暗号化。                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | セッションのキャッシュを有効または無効にします。 `sessionIdContext` と組み合わせて使用する必要があります。受け入れ可能な値： `true`, `false`。                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`            | サーバーが生成する各識別子に付加するランダム文字のユニークなセット。この文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはいけません。このパラメータは、サーバーがセッションをキャッシュする際やクライアントがキャッシュを要求する際の問題を回避するのに役立つため、常に推奨されます。                                                                                                                                                        | `$\{application.name\}`                      |
| `sessionCacheSize`            | サーバーがキャッシュするセッションの最大数。値が `0` の場合は無制限のセッションを意味します。                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | サーバー上でのセッションのキャッシュ時間（時間単位）。                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | 有効にすると、証明書のCNまたはSANがピアホスト名と一致することを検証します。                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | TLSv1接続を要求します。受け入れ可能な値： `true`, `false`。                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | TLSv1.1接続を要求します。受け入れ可能な値： `true`, `false`。                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | TLSv1.2接続を要求します。受け入れ可能な値： `true`, `false`。                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | OpenSSL FIPSモードを有効にします。このライブラリのOpenSSLバージョンがFIPSをサポートしている場合のみサポートされます。                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandlerのサブクラス）。例： `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`。                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するためのクラス（CertificateHandlerのサブクラス）。例： `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` 。                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | 使用が許可されていないプロトコル。                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | クライアントが好むサーバーの暗号。                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

**設定の例：**

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
        <!-- 自己署名の場合： <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 自己署名の場合： <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```

## opentelemetry_span_log {#opentelemetry_span_log} 

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) システムテーブルの設定。

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

## os_cpu_busy_time_threshold {#os_cpu_busy_time_threshold} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />CPUが有用な作業を行っていると見なすためのOS CPUビジー時間のマイクロ秒単位の閾値（OSCPUVirtualTimeMicrosecondsメトリック）。ビジー時間がこの値を下回ると、CPUの負荷は考慮されません。

## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />ユーザー空間ページキャッシュから解放するために保持されるメモリ制限の割合。Linuxのmin_free_kbytes設定に類似します。

## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />解放されたメモリがユーザー空間ページキャッシュに使用できるまでの遅延。

## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />ユーザー空間ページキャッシュの最大サイズ。キャッシュを無効にするには0に設定します。 page_cache_min_sizeより大きい場合、キャッシュサイズはこの範囲内で継続的に調整され、ほとんどの利用可能なメモリを使用しつつ、総メモリ使用量を制限（max_server_memory_usage[_to_ram_ratio]）の下に保ちます。

## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />ユーザー空間ページキャッシュの最小サイズ。

## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ユーザー空間ページキャッシュポリシーの名前。

## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />ミューテックスの競合を減らすためにこの数だけユーザー空間ページキャッシュをストライプします。実験的で、パフォーマンス向上の可能性は低いです。
```

## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />ユーザ空間のページキャッシュにおける保護キューのサイズは、キャッシュの総サイズに対して相対的です。
## part_log {#part_log} 

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) に関連するログイベント。たとえば、データの追加またはマージです。ログを使用してマージアルゴリズムをシミュレートし、それらの特性を比較できます。マージプロセスを視覚化できます。

クエリは、[system.part_log](/operations/system-tables/part_log) テーブルに記録され、別のファイルには記録されません。このテーブルの名前は `table` パラメータで設定できます（下記参照）。

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
## parts_kill_delay_period {#parts_kill_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="30" />
SharedMergeTree のパーツを完全に削除するまでの期間。ClickHouse Cloud でのみ利用可能
## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />
kill_delay_period に 0 から x 秒の均等に分布した値を追加し、非常に多くのテーブルがある場合にサンダリングハード効果とその後の ZooKeeper の DoS を回避します。ClickHouse Cloud でのみ利用可能
## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />
共有マージツリーの古くなったスレッドをクリーンアップするためのスレッド。ClickHouse Cloud でのみ利用可能
## path {#path} 

データを含むディレクトリへのパス。

:::note
末尾のスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
```
## postgresql_port {#postgresql_port} 

PostgreSQL プロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定
- 空の値は MySQL プロトコル経由でのクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```
## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />リモートオブジェクトストレージのためのプレフェッチ用のバックグラウンドプールのサイズ
## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />プレフェッチプールにプッシュ可能なタスクの数
## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
プレフィックスの逆シリアル化スレッドプールにスケジュール可能な最大のジョブ数。

:::note
`0` の値は無制限を意味します。
:::
## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />
true に設定した場合、ClickHouse は起動前にすべての構成された `system.*_log` テーブルを作成します。これは、一部の起動スクリプトがこれらのテーブルに依存している場合に役立ちます。
## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />主インデックスキャッシュポリシーの名前。
## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />プレウォーム中に充填されるマークキャッシュの総サイズの比率。
## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />主インデックス (MergeTree ファミリーのインデックス) 用のキャッシュの最大サイズ。
## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />主インデックスキャッシュ内の保護キューのサイズ（SLRU ポリシーの場合）は、キャッシュの総サイズに対して相対的です。
## process_query_plan_packet {#process_query_plan_packet} 

<SettingsInfoBlock type="Bool" default_value="0" />
この設定は、QueryPlan パケットを読み取ることを許可します。このパケットは、serialize_query_plan が有効になっている分散クエリのために送信されます。
クエリプランのバイナリ逆シリアル化のバグによって引き起こされる可能性のあるセキュリティ問題を避けるために、デフォルトでは無効にされています。

**例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```
## processors_profile_log {#processors_profile_log} 

[`processors_profile_log`](../system-tables/processors_profile_log.md) システムテーブルの設定。

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
## prometheus {#prometheus} 

[Prometheus](https://prometheus.io) からのデータ収集のためのメトリックデータの露出。

設定：

- `endpoint` – prometheus サーバーによるメトリックの収集用の HTTP エンドポイント。`/` から始まります。
- `port` – `endpoint` のポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルのメトリックを露出します。
- `events` – [system.events](/operations/system-tables/events) テーブルのメトリックを露出します。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルからの現在のメトリック値を露出します。
- `errors` - 最後のサーバ再起動以降に発生したエラーコードによるエラーの数を露出します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。

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

確認する（`127.0.0.1` を ClickHouse サーバの IP アドレスまたはホスト名に置き換えて）：
```bash
curl 127.0.0.1:9363/metrics
```
## proxy {#proxy} 

HTTP および HTTPS リクエストのためのプロキシサーバを定義します。現在、S3 ストレージ、S3 テーブル関数、および URL 関数がサポートしています。

プロキシサーバを定義する方法は3つあります：
- 環境変数
- プロキシリスト
- リモートプロキシリゾルバー。

特定のホストに対してプロキシサーバをバイパスすることも、`no_proxy` を使用してサポートされています。

**環境変数**

`http_proxy` および `https_proxy` 環境変数を使用して、指定したプロトコルのためのプロキシサーバを指定できます。システムで設定されている場合は、シームレスに動作するはずです。

これは、指定したプロトコルに対して1つのプロキシサーバのみがあり、そのプロキシサーバが変更されない場合、最も簡単なアプローチです。

**プロキシリスト**

このアプローチを使用すると、プロトコルのために1つ以上のプロキシサーバを指定できます。複数のプロキシサーバが定義されている場合、ClickHouse は異なるプロキシをラウンドロビン方式で使用し、サーバ間の負荷をバランスさせます。複数のプロキシサーバがプロトコル用にあり、プロキシサーバのリストが変更されない場合に最も簡単なアプローチです。

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
以下のタブで親フィールドを選択して、その子を表示します：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド    | 説明                            |
|-----------|--------------------------------|
| `<http>`  | 1つ以上の HTTP プロキシのリスト   |
| `<https>` | 1つ以上の HTTPS プロキシのリスト  |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">


| フィールド   | 説明                  |
|---------|----------------------|
| `<uri>` | プロキシの URI       |

  </TabItem>
</Tabs>

**リモートプロキシリゾルバー**

プロキシサーバが動的に変更されることもあります。その場合、リゾルバーのエンドポイントを定義できます。ClickHouse はそのエンドポイントに空の GET リクエストを送信し、リモートリゾルバーはプロキシホストを返す必要があります。ClickHouse は次のテンプレートを使用してプロキシ URI を形成します：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

選択した親フィールドのための子を下記タブで表示します：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド    | 説明                      |
|----------|--------------------------|
| `<http>` | 1つ以上のリゾルバーのリスト* |
| `<https>` | 1つ以上のリゾルバーのリスト* |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド       | 説明                                   |
|-------------|---------------------------------------|
| `<resolver>` | リゾルバーのためのエンドポイントとその他の詳細 |

:::note
複数の `<resolver>` 要素を持つことができますが、特定のプロトコルに対して最初の `<resolver>` のみが使用されます。そのプロトコルに対する他の `<resolver>` 要素は無視されます。これは、負荷分散が必要な場合はリモートリゾルバーによって実装される必要があることを意味します。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| フィールド               | 説明                                                                                                                                                         |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | プロキシリゾルバーの URI                                                                                                                                         |
| `<proxy_scheme>`    | 最終プロキシ URI のプロトコル。これは `http` または `https` のいずれかです。                                                                                         |
| `<proxy_port>`      | プロキシリゾルバーのポート番号                                                                                                                                 |
| `<proxy_cache_time>` | ClickHouse がリゾルバーから値をキャッシュすべき時間（秒単位）。この値を `0` に設定すると、ClickHouse はすべての HTTP または HTTPS リクエストのたびにリゾルバーに連絡します。 |

  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決定されます：

| 順序 | 設定                   |
|-------|------------------------|
| 1.    | リモートプロキシリゾルバー |
| 2.    | プロキシリスト             |
| 3.    | 環境変数                 |

ClickHouse はリクエストプロトコルのために最も高い優先度のリゾルバータイプを確認します。定義されていない場合は、次の高い優先度のリゾルバータイプを確認し、環境リゾルバーに達するまで続けます。これにより、リゾルバータイプを混在させて使用することができます。
## query_cache {#query_cache} 

[Query cache](../query-cache.md) 設定。

利用可能な設定は以下の通りです：

| 設定                   | 説明                                                                            | デフォルト値      |
|---------------------------|--------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | 最大キャッシュサイズ（バイト単位）。 `0` はクエリキャッシュが無効であることを意味します。 | `1073741824`  |
| `max_entries`             | キャッシュに保存される `SELECT` クエリ結果の最大数。                              | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存する `SELECT` クエリ結果が持つことができる最大サイズ（バイト単位）。     | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存する `SELECT` クエリ結果が持つことができる最大行数。                 | `30000000`    |

:::note
- 設定が変更されると即座に効果を持ちます。
- クエリキャッシュのデータは DRAM に割り当てられます。メモリが不足する場合は、`max_size_in_bytes` に小さい値を設定するか、クエリキャッシュを完全に無効にしてください。
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
## query_condition_cache_policy {#query_condition_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />クエリ条件キャッシュポリシーの名前。
## query_condition_cache_size {#query_condition_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />
クエリ条件キャッシュの最大サイズ。
:::note
この設定はランタイムで変更可能であり、即座に効果を持ちます。
:::
## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />クエリ条件キャッシュ内の保護キューのサイズ（SLRU ポリシーの場合）は、キャッシュの総サイズに対して相対的です。
## query_log {#query_log} 

[log_queries=1](../../operations/settings/settings.md) 設定に従って受信したクエリをログするための設定。

クエリは、[system.query_log](/operations/system-tables/query_log) テーブルに記録され、別のファイルには記録されません。このテーブルの名前は `table` パラメータで変更できます（下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouse は自動的に作成します。ClickHouse サーバが更新されたときにクエリログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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
## query_masking_rules {#query_masking_rules} 

クエリおよびすべてのログメッセージに適用される正規表現ベースのルールで、サーバーログに保存される前に [`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブル、クライアントに送信されるログに適用されます。これにより、名前、メールアドレス、個人識別子、クレジットカード番号などを含む SQL クエリからの機密データの漏洩を防ぐことができます。

**例**

```xml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**設定フィールド**:

| 設定   | 説明                                                                   |
|-----------|--------------------------------------------------------------------------|
| `name`    | ルール名（オプション）                                                  |
| `regexp`  | RE2 互換の正規表現（必須）                                           |
| `replace` | 機密データのための置換文字列（オプション、デフォルトは六つのアスタリスク） |

マスキングルールは、不正な/解析不可能なクエリからの機密データの漏洩を防ぐために、クエリ全体に適用されます。

[`system.events`](/operations/system-tables/events) テーブルには `QueryMaskingRulesMatch` カウンターがあり、クエリマスキングルールの適合数を含みます。

分散クエリの場合、各サーバを別々に設定する必要があります。そうでなければ、他のノードに渡されたサブクエリはマスキングなしで保存されます。
## query_metric_log {#query_metric_log} 

デフォルトでは無効です。

**有効化**

手動でメトリクス履歴収集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md) を有効にするには、次の内容で `/etc/clickhouse-server/config.d/query_metric_log.xml` を作成します：

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

`query_metric_log` 設定を無効にするには、次の内容のファイル `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` を作成する必要があります：

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_thread_log {#query_thread_log} 

[log_query_threads=1](/operations/settings/settings#log_query_threads) 設定で受信したクエリのスレッドをログに記録するための設定。

クエリは、[system.query_thread_log](/operations/system-tables/query_thread_log) テーブルに記録され、別のファイルには記録されません。このテーブルの名前は `table` パラメータで変更できます（下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouse は自動的に作成します。ClickHouse サーバが更新されたときにクエリスレッドログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

[log_query_views=1](/operations/settings/settings#log_query_views) 設定に基づいて、クエリに依存するビュー（ライブ、マテリアライズドなど）をログするための設定。

クエリは、[system.query_views_log](/operations/system-tables/query_views_log) テーブルに記録され、別のファイルには記録されません。このテーブルの名前は `table` パラメータで変更できます（下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouse は自動的に作成します。ClickHouse サーバが更新されたときにクエリビューのログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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
## remap_executable {#remap_executable} 

大きなページを使用して機械コード（"テキスト"）のためのメモリを再割り当てする設定。

:::note
この機能は非常に実験的です。
:::

例：

```xml
<remap_executable>false</remap_executable>
```
## remote_servers {#remote_servers} 

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンおよび `cluster` テーブル関数で使用されるクラスタの設定。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性の値については、"[設定ファイル](/operations/configuration-files)" セクションを参照してください。

**関連情報**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [クラスタ発見](../../operations/cluster-discovery.md)
- [レプリケートされたデータベースエンジン](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts} 

URL関連のストレージエンジンおよびテーブル関数で使用を許可されているホストのリスト。

`<host>` XML タグを使ってホストを追加する場合：
- URLで指定されたとおりに正確に指定する必要があります。名前は DNS 解決の前にチェックされるためです。例: `<host>clickhouse.com</host>`
- もしポートが URL に明示的に指定されている場合、host:port が全体としてチェックされます。例: `<host>clickhouse.com:80</host>`
- もしポートなしでホストが指定されている場合、そのホストの任意のポートが許可されます。例: `<host>clickhouse.com</host>` と指定されている場合は、`clickhouse.com:20`（FTP）、`clickhouse.com:80`（HTTP）、`clickhouse.com:443`（HTTPS）などが許可されます。
- ホストが IP アドレスとして指定されている場合、それは URL に指定されたとおりにチェックされます。例: `[2a02:6b8:a::a]`。
- リダイレクトがあり、リダイレクトサポートが有効な場合、すべてのリダイレクト（location フィールド）がチェックされます。

例えば：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## replica_group_name {#replica_group_name} 

データベースのレプリケーション用のレプリカグループ名。

レプリケーションデータベースによって作成されたクラスターは、同じグループのレプリカで構成されます。
DDL クエリは同じグループのレプリカを待機します。

デフォルトでは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />パーツ取得リクエストのための HTTP 接続タイムアウト。明示的に設定されていない場合はデフォルトプロファイル `http_connection_timeout` から引き継がれます。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />パーツ取得リクエストのための HTTP 受信タイムアウト。明示的に設定されていない場合はデフォルトプロファイル `http_receive_timeout` から引き継がれます。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />パーツ取得リクエストのための HTTP 送信タイムアウト。明示的に設定されていない場合はデフォルトプロファイル `http_send_timeout` から引き継がれます。
## replicated_merge_tree {#replicated_merge_tree} 

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) のテーブルの微調整。この設定は優先度が高いです。

詳細については、MergeTreeSettings.h ヘッダファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />RESTORE リクエストを実行するための最大スレッド数。
## s3queue_log {#s3queue_log} 

`s3queue_log` システムテーブルの設定。

<SystemLogParameters/>

デフォルトの設定は次のとおりです：

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```
## send_crash_reports {#send_crash_reports} 

ClickHouse コア開発者チームへのクラッシュレポート送信のための設定。

特にプレプロダクション環境での有効化は非常に推奨されます。

キー：

| キー                   | 説明                                                                                                                         |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | この機能を有効にするブールフラグ。デフォルトは `true`。クラッシュレポートの送信を避けるには `false` に設定します。         |
| `send_logical_errors` | `LOGICAL_ERROR` は `assert` のようなもので、ClickHouse のバグです。このブールフラグを有効にすると、この例外が送信されます（デフォルト：`true`）。 |
| `endpoint`            | クラッシュレポート送信のためのエンドポイント URL をオーバーライドできます。                                                 |

**推奨使用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />
`generateSerialID` 関数によって生成された自動増分番号の Keeper 内のパス。各シーズはこのパスの下にノードになります。
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />これが true に設定されている場合、スタックトレースにアドレスを表示します。
## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />これが true に設定されている場合、ClickHouse はシャットダウン前に実行中のバックアップとリストアの完了を待機します。
## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />未完了のクエリを待機する遅延（秒）。
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />これが true に設定されている場合、ClickHouse はシャットダウン前に実行中のクエリの完了を待機します。
## ssh_server {#ssh_server} 

ホストキーの公開部分は、最初の接続時に SSH クライアント側の known_hosts ファイルに書き込まれます。

ホストキーの設定はデフォルトでは無効です。
ホストキーの設定をコメント解除し、関連する ssh キーのパスを提供して有効にします：

例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />マテリアライズドビュー生成遅延をシミュレートするためのデバッグパラメータ。
## storage_configuration {#storage_configuration} 

ストレージのマルチディスク構成を許可します。

ストレージ設定は次の構造に従います：

```xml
<storage_configuration>
    <disks>
        <!-- 構成 -->
    </disks>
    <policies>
        <!-- 構成 -->
    </policies>
</storage_configuration>
```
### ディスクの構成 {#configuration-of-disks}

`disks` の構成は以下の構造に従います：

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

上記のサブタグは、`disks` のための次の設定を定義します：

| 設定                 | 説明                                                                                          |
|-------------------------|---------------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | ディスクの名前、ユニークである必要がある。                                                        |
| `path`                  | サーバーデータが保存されるパス（`data` および `shadow` カタログ）。`/` で終わる必要があります。 |
| `keep_free_space_bytes` | ディスク上に保持するための予約済みの空きスペースのサイズ。                                           |

:::note
ディスクの順序は重要ではありません。
:::
```

### 設定ポリシーの構成 {#configuration-of-policies}

上記のサブタグは `policies` の以下の設定を定義します。

| 設定                       | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`            | ポリシーの名前。ポリシー名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`            | ボリューム名。ボリューム名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `disk`                     | ボリューム内に位置するディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes` | このボリューム内の任意のディスクに存在できるデータチャンクの最大サイズ。マージの結果、チャンクサイズが max_data_part_size_bytes を超えることが予想される場合、チャンクは次のボリュームに書き込まれます。基本的に、この機能により、新しい / 小さなチャンクをホット (SSD) ボリュームに保存し、大きなサイズに達した場合にコールド (HDD) ボリュームに移動することができます。このオプションは、ポリシーにボリュームが1つしかない場合には使用しないでください。                                                                 |
| `move_factor`              | ボリューム上の利用可能な空き容量の割合。スペースが少なくなると、データは次のボリュームに転送され始めます。転送のために、チャンクはサイズの大きい順 (降順) にソートされ、`move_factor` 条件を満たす総サイズのチャンクが選択されます。すべてのチャンクの総サイズが不足している場合、すべてのチャンクが移動されます。                                                                                                                                                                    |
| `perform_ttl_move_on_insert` | 挿入時に有効期限 (TTL) が切れたデータを移動することを無効にします。デフォルトでは (有効の場合)、有効期限ルールに基づいてすでに期限切れのデータを挿入すると、それはすぐに移動ルールで指定されたボリューム / ディスクに移動されます。ターゲットボリューム / ディスクが遅い場合 (例: S3)、挿入が大幅に遅くなる可能性があります。この設定が無効の場合、期限切れのデータはデフォルトボリュームに書き込まれ、その後すぐに期限切れの TTL ルールで指定されたボリュームに移動されます。 |
| `load_balancing`           | ディスクバランス政策。`round_robin` または `least_used` を指定します。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`        | すべてのディスクで利用可能な空き容量を更新するためのタイムアウト (ミリ秒) を設定します (`0` - 常に更新、`-1` - 決して更新しない、デフォルト値は `60000`)。ディスクが ClickHouse のみで使用され、ファイルシステムの動的サイズ変更が行われない場合は、`-1` の値を使用できます。それ以外の場合はこれを使用しないことが推奨されます。最終的に不正なスペース割り当てにつながります。                                                                                                                   |
| `prefer_not_to_merge`      | このボリュームでのデータのマージを無効にします。注意: これは潜在的に有害であり、パフォーマンスの低下を引き起こす可能性があります。この設定が有効な場合 (これをしないでください)、このボリュームでのデータのマージが禁止されます (これは悪いことです)。これにより、ClickHouse が遅いディスクとどのように相互作用するかを制御できます。この設定をまったく使用しないことをお勧めします。                                                                                                                                                                                       |
| `volume_priority`          | ボリュームの充填順序を定義します。値が小さいほど優先度が高くなります。パラメータ値は自然数であり、1 から N (N は指定された最大パラメータ値) までの範囲を網羅し、間隔を置かない必要があります。                                                                                                                                                                                                                                                                                                                                |

`volume_priority` について:
- すべてのボリュームがこのパラメーターを持っている場合、指定された順序で優先されます。
- _一部_ のボリュームのみがこのパラメーターを持っている場合、持っていないボリュームは最低の優先度を持ちます。持っているボリュームはタグの値に基づいて優先され、残りの優先度は設定ファイル内の各設定の記述の順序によって決まります。
- _どの_ ボリュームにもこのパラメーターが指定されていない場合、その順序は設定ファイル内の記述の順序によって決まります。
- ボリュームの優先度は同一である必要はありません。

## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この制限を超える接続は、短い寿命を持ちます。制限はストレージ接続に適用されます。
## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限を超える接続は使用後にリセットされます。接続キャッシュをオフにするには、0 に設定します。制限はストレージ接続に適用されます。
## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />使用中の接続の数がこの制限を超えると、警告メッセージがログに書き込まれます。制限はストレージ接続に適用されます。
## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="0" />VERSION_FULL_OBJECT_KEY形式でディスクメタデータファイルを書き込みます。
## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />有効にすると、SharedSet と SharedJoin の作成時に内部 UUID が生成されます。ClickHouse Cloud のみ
## table_engines_require_grant {#table_engines_require_grant} 

true に設定されている場合、特定のエンジンを使用してテーブルを作成するには、ユーザーに権限が必要です。例: `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
デフォルトでは、後方互換性のために、特定のテーブルエンジンを使用してテーブルを作成する際には権限を無視しますが、これを true に設定することでこの動作を変更できます。
:::
## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
サーバー起動後に非同期でテーブルを読み込むためのスレッド数を設定します。バックグラウンドプールは、ポートで待機しているクエリがない場合にテーブルを非同期で読み込むために使用されます。多数のテーブルがある場合、バックグラウンドプール内のスレッド数を低く保つことで、CPUリソースを同時クエリの実行に予約することが有利です。

:::note
 `0` の値は、すべての利用可能な CPU が使用されることを意味します。
:::
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
フォアグラウンドプールでのロードジョブを実行するためのスレッド数を設定します。フォアグラウンドプールは、サーバーがポートで待機を開始する前や、待機しているテーブルを読み込むために使用されます。フォアグラウンドプールはバックグラウンドプールよりも優先順位が高いため、フォアグラウンドプールで実行中のジョブがある場合はバックグラウンドプールでジョブを開始することはありません。

:::note
 `0` の値は、すべての利用可能な CPU が使用されることを意味します。
:::
## tcp_port {#tcp_port} 

TCP プロトコルを介してクライアントと通信するためのポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure} 

クライアントとの安全な通信のための TCP ポート。 [OpenSSL](#openssl) 設定と一緒に使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## tcp_ssh_port {#tcp_ssh_port} 

埋め込みクライアントを介してインタラクティブに接続し、クエリを実行するための SSH サーバーのポート。

**例**

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## temporary_data_in_cache {#temporary_data_in_cache} 

このオプションを使用すると、特定のディスクに一時的なデータがキャッシュに保存されます。このセクションでは、`cache` タイプのディスク名を指定する必要があります。その場合、キャッシュと一時データは同じスペースを共有し、ディスクキャッシュは一時データを作成するために排除される可能性があります。

:::note
一時データストレージを構成するために使用できるオプションは1つだけです: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`。
:::

**例**

`local_disk` のキャッシュと一時データの両方が、`tiny_local_cache` によって管理されているファイルシステム上の `/tiny_local_cache` に保存されます。

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
## text_log {#text_log} 

テキストメッセージをログに記録するための [text_log](/operations/system-tables/text_log) システムテーブルの設定。

<SystemLogParameters/>

さらに:

| 設定 | 説明                                                                                                                                                                                                 | デフォルト値       |
|------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `level` | テーブルに保存される最大メッセージレベル (デフォルトは `Trace`) です。                                                                                                                                 | `Trace`             |

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
## thread_pool_queue_size {#thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
グローバルスレッドプールでスケジュールできるジョブの最大数。キューサイズを増やすと、メモリ使用量が増加します。この値は [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size) と等しく保つことが推奨されます。

:::note
 `0` の値は無制限を意味します。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```
## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />オブジェクトストレージへの書き込み要求用のバックグラウンドプールのサイズ
## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />オブジェクトストレージへの書き込み要求のためにバックグラウンドプールにプッシュできるタスクの数
## throw_on_unknown_workload {#throw_on_unknown_workload} 

<SettingsInfoBlock type="Bool" default_value="0" />
クエリ設定 'workload' で未知の WORKLOAD にアクセスする際の動作を定義します。

- `true` の場合、未知のワークロードにアクセスしようとするクエリから RESOURCE_ACCESS_DENIED 例外がスローされます。これは、WORKLOAD 階層が確立され、WORKLOAD デフォルトが含まれるようにするためのリソーススケジューリングを強制するのに役立ちます。
- `false` (デフォルト) の場合、未知の WORKLOAD を指す 'workload' 設定を持つクエリには無制限のアクセスが提供されます。これは、WORKLOAD の階層を設定する際に重要です。

**例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**参照**
- [Workload Scheduling](/operations/workload-scheduling.md)
## timezone {#timezone} 

サーバーのタイムゾーン。

UTC タイムゾーンまたは地理的位置の IANA 識別子として指定されます (例: Africa/Abidjan)。

タイムゾーンは、DateTime フィールドがテキスト形式 (画面またはファイルに印刷) に出力される際、および文字列から DateTime を取得する際の変換に必要です。さらに、入力パラメータにタイムゾーンが指定されていない場合、時間と日付で動作する関数でタイムゾーンが使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**参照**

- [session_timezone](../settings/settings.md#session_timezone)
## tmp_path {#tmp_path} 

大規模なクエリ処理のために使用する一時データをローカルファイルシステムに保存するパス。

:::note
- 一時データストレージを構成するために使用できるオプションは1つだけです: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`。
- 後ろのスラッシュは必須です。
:::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## tmp_policy {#tmp_policy} 

一時データ用のストレージポリシー。詳細については [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree) ドキュメントを参照してください。

:::note
- 一時データストレージを構成するために使用できるオプションは1つだけです: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`。
- `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` は無視されます。
- ポリシーには正確に *1つのボリューム* を持つ *ローカル* ディスクが必要です。
:::

**例**

`/disk1` が満杯の場合、一時データは `/disk2` に保存されます。

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
## top_level_domains_list {#top_level_domains_list} 

各エントリが `<name>/path/to/file</name>` 形式であるカスタムトッレベルドメインのリストを定義します。

例:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

参照:
- [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) 関数とそれに関連するバリエーションで、カスタム TLD リスト名を受け取り、最初の重要なサブドメインまでトップレベルサブドメインを含むドメインの部分を返します。
## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />指定された値以下のサイズのランダム割り当てを収集し、 `total_memory_profiler_sample_probability` に等しい確率で収集します。0 は無効を意味します。これが期待通りに機能するようにするために、`max_untracked_memory` を 0 に設定することを検討してください。
## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />指定された値以上のサイズのランダム割り当てを収集し、 `total_memory_profiler_sample_probability` に等しい確率で収集します。0 は無効を意味します。これが期待通りに機能するようにするために、`max_untracked_memory` を 0 に設定することを検討してください。
## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーのメモリ使用量がバイト数で各ステップを超えるたびに、メモリプロファイラーは割り当てスタックトレースを収集します。ゼロはメモリプロファイラーを無効にします。数メガバイト未満の値はサーバーを遅くすることになります。
## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />
ランダムな割り当てと解放を収集し、指定された確率で [system.trace_log](../../operations/system-tables/trace_log.md) システムテーブルに `trace_type` を `MemorySample` に設定して書き込みます。確率は、割り当てのサイズに関係なく、すべての割り当てまたは解放に対して適用されます。サンプリングは、未追跡のメモリが未追跡メモリ制限 (デフォルト値は `4` MiB) を超えた時のみ発生します。 [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) が低く設定されると、これを下げることができます。より細かいサンプリングを行うために、`total_memory_profiler_step` を `1` に設定することができます。

可能な値:

- 正の整数。
- `0` — `system.trace_log` システムテーブル内のランダムな割り当ておよび解放の書き込みが無効になります。
## trace_log {#trace_log} 

[trace_log](/operations/system-tables/trace_log) システムテーブル操作の設定。

<SystemLogParameters/>

デフォルトのサーバー構成ファイル `config.xml` には、次の設定セクションが含まれています。

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
## uncompressed_cache_policy {#uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />非圧縮キャッシュポリシー名。
## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
MergeTree ファミリのテーブルエンジンによって使用される非圧縮データの最大サイズ (バイト数)。

サーバーに共有キャッシュがあります。メモリは要求に応じて割り当てられます。`use_uncompressed_cache` オプションが有効に設定されている場合、キャッシュは使用されます。

非圧縮キャッシュは、非常に短いクエリの場合に有利です。

:::note
 `0` の値は無効を意味します。

この設定は実行時に変更可能であり、即座に有効になります。
:::
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />非圧縮キャッシュ内の保護キューのサイズ (SLRU ポリシーの場合) がキャッシュ全体のサイズに対してどのように設定されるかを示します。
## url_scheme_mappers {#url_scheme_mappers} 

短縮または記号 URL プレフィックスをフル URL に翻訳するための構成。

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
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 

ZooKeeper でのデータパートヘッダーのストレージ方法。この設定は [`MergeTree`](/engines/table-engines/mergetree-family) ファミリのみに適用されます。グローバルに設定することができます。

**`config.xml` ファイルの [merge_tree](#merge_tree) セクションで**

ClickHouse はサーバー上のすべてのテーブルについてこの設定を使用します。いつでも設定を変更できます。設定が変更されると、既存のテーブルはその動作を変更します。

**各テーブルのために**

テーブルを作成する際に、対応する [エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) を指定します。この設定を持つ既存のテーブルの動作は、グローバル設定が変更されても変わりません。

**可能な値**

- `0` — 機能がオフになります。
- `1` — 機能がオンになります。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) の場合、[レプリケートされた](../../engines/table-engines/mergetree-family/replication.md) テーブルは、データパートのヘッダーを1つの `znode` を使用して圧縮して保存します。テーブルに多数のカラムが含まれている場合、このストレージ方法は ZooKeeper に保存されるデータの量を大幅に削減します。

:::note
`use_minimalistic_part_header_in_zookeeper = 1` を適用した後、この設定をサポートしていないバージョンに ClickHouse サーバーをダウングレードすることはできません。クラスター内のサーバーをアップグレードする際にはご注意ください。一度にすべてのサーバーをアップグレードしないでください。新しいバージョンの ClickHouse をテスト環境で、またはクラスターのいくつかのサーバーでテストする方が安全です。

この設定で既に保存されているデータパートヘッダーは、以前の (非圧縮) 表現に戻すことはできません。
:::
## user_defined_executable_functions_config {#user_defined_executable_functions_config} 

実行可能なユーザー定義関数のための設定ファイルへのパス。

パス:

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにワイルドカード * と ? を含めることができます。

参照:
- "[実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)。"

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## user_defined_path {#user_defined_path} 

ユーザー定義ファイルのディレクトリ。SQL ユーザー定義関数 [SQL User Defined Functions](/sql-reference/functions/udf) に使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## user_directories {#user_directories} 

設定ファイルセクションで、次の設定が含まれます:
- 事前定義されたユーザーのための設定ファイルへのパス。
- SQL コマンドによって作成されたユーザーが保存されるフォルダへのパス。
- SQL コマンドによって作成およびレプリケートされたユーザーが保存される ZooKeeper ノードパス (実験的)。

このセクションが指定された場合、 [users_config](/operations/server-configuration-parameters/settings#users_config) および [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) からのパスは使用されません。

`user_directories` セクションには任意の数のアイテムを含めることができ、アイテムの順序は優先順位を意味します (上に行くほど優先順位が高くなります)。

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

ユーザー、ロール、行ポリシー、クォータ、およびプロファイルも ZooKeeper に保存できます:

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

メモリ内にのみ情報を保存し、ディスクに書き込まないことを意味するセクション `memory` を定義したり、LDAP サーバーに情報を保存することを意味するセクション `ldap` を定義したりできます。

ローカルに定義されていないリモートユーザーの LDAP サーバーを追加するには、次の設定を持つ単一の `ldap` セクションを定義します。

| 設定     | 説明                                                                                                                                                                                                                                                                                                                                                                    |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | `ldap_servers` 構成セクションに定義された LDAP サーバー名の1つ。このパラメータは必須であり、空にできません。                                                                                                                                                                                                                                                            |
| `roles`  | LDAP サーバーから取得された各ユーザーに割り当てられるローカルに定義されたロールのリストを含むセクション。ロールが指定されていない場合、ユーザーは認証後にいかなるアクションも実行できません。指定されたロールの1つが認証時にローカルに定義されていない場合、その認証試行はパスワードが不正であるかのように失敗します。 |

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
## user_files_path {#user_files_path} 

ユーザーファイルのディレクトリ。テーブル関数 [file()](../../sql-reference/table-functions/file.md)、 [fileCluster()](../../sql-reference/table-functions/fileCluster.md) に使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path} 

ユーザースクリプトファイルのディレクトリ。実行可能なユーザー定義関数 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions) に使用されます。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

型:

デフォルト:
## users_config {#users_config} 

次の内容が含まれるファイルへのパス:

- ユーザー設定。
- アクセス権。
- 設定プロファイル。
- クォータ設定。

**例**

```xml
<users_config>users.xml</users_config>
```
## validate_tcp_client_information {#validate_tcp_client_information} 

<SettingsInfoBlock type="Bool" default_value="0" />クエリパケットを受信した際に、クライアント情報の検証が有効かどうかを決定します。

デフォルトでは、`false` です:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```
## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />ベクター類似度インデックスのエントリーにおけるキャッシュのサイズ。ゼロは無効を意味します。
## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ベクター類似度インデックスキャッシュポリシー名。
## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />ベクター類似度インデックスのキャッシュサイズ。ゼロは無効を意味します。

:::note
この設定は実行時に変更可能であり、即座に有効になります。
:::
## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />ベクター類似度インデックスキャッシュ内の保護キューのサイズ (SLRU ポリシーの場合) がキャッシュ全体のサイズに対してどのように設定されるかを示します。
```
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup} 

<SettingsInfoBlock type="Bool" default_value="1" />
この設定は、`dictionaries_lazy_load`が`false`の場合の動作を指定できるようにします。
(`dictionaries_lazy_load`が`true`の場合、この設定は何も影響しません。)

`wait_dictionaries_load_at_startup`が`false`の場合、サーバーは起動時にすべての辞書を読み込み始め、読み込みと並行して接続を受け付けます。
クエリで辞書が初めて使用されるとき、その辞書がまだ読み込まれていない場合は、クエリは辞書が読み込まれるまで待機します。
`wait_dictionaries_load_at_startup`を`false`に設定すると、ClickHouseの起動が速くなる可能性がありますが、一部のクエリは遅く実行されることがあります（いくつかの辞書が読み込まれるのを待たなければならないためです）。

`wait_dictionaries_load_at_startup`が`true`の場合、サーバーは起動時にすべての辞書の読み込みが完了するまで（成功でも失敗でも）接続を受け付けることを待ちます。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```
## workload_path {#workload_path} 

`CREATE WORKLOAD`および`CREATE RESOURCE`クエリのすべてのストレージとして使用されるディレクトリ。デフォルトでは、サーバーの作業ディレクトリにある`/workload/`フォルダーが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**関連項目**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path} 

`CREATE WORKLOAD`および`CREATE RESOURCE`クエリのすべてのストレージとして使用されるZooKeeperノードへのパス。整合性のために、すべてのSQL定義はこの単一のznodeの値として保存されます。デフォルトでは、ZooKeeperは使用されず、定義は[disk](#workload_path)に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**関連項目**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## zookeeper {#zookeeper} 

ClickHouseが[ZooKeeper](http://zookeeper.apache.org/)クラスターとやり取りできるようにする設定が含まれています。ClickHouseは、レプリケートされたテーブルを使用する際に、レプリカのメタデータを保存するためにZooKeeperを使用します。レプリケートされたテーブルを使用しない場合、このパラメータのセクションは省略できます。

以下の設定はサブタグによって構成できます。

| 設定                                       | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                   | ZooKeeperエンドポイント。複数のエンドポイントを設定できます。例として、`<node index="1"><host>example_host</host><port>2181</port></node>`があります。`index`属性は、ZooKeeperクラスターへの接続を試みる際のノードの順序を指定します。                                                                                                                                                                                                                                                                        |
| `session_timeout_ms`                    | クライアントセッションの最大タイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                  | 操作の最大タイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `root` (オプション)                      | ClickHouseサーバーが使用するznodeのルートとして使用されるznode。                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `fallback_session_lifetime.min` (オプション) | プライマリが利用できない場合にフォールバックノードへのZooKeeperセッションのライフタイムの最小制限（負荷分散）。秒単位で設定します。デフォルト：3時間。                                                                                                                                                                                                                                                                                                                                                              |
| `fallback_session_lifetime.max` (オプション) | プライマリが利用できない場合にフォールバックノードへのZooKeeperセッションのライフタイムの最大制限（負荷分散）。秒単位で設定します。デフォルト：6時間。                                                                                                                                                                                                                                                                                                                                                              |
| `identity` (オプション)                  | リクエストされたznodeにアクセスするためにZooKeeperが必要とするユーザー名とパスワード。                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression` (オプション)           | `true`に設定すると、Keeperプロトコルでの圧縮を有効にします。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

また、`zookeeper_load_balancing`設定（オプション）を使用すると、ZooKeeperノード選択のアルゴリズムを選択できます。

| アルゴリズム名                     | 説明                                                                                                                    |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| `random`                         | ZooKeeperノードのうちの一つをランダムに選択します。                                                                                       |
| `in_order`                       | 最初のZooKeeperノードを選択し、利用できない場合は次のノードを選択するという方法です。                                            |
| `nearest_hostname`               | サーバーのホスト名に最も似たZooKeeperノードを選択します。ホスト名は名前の接頭辞で比較されます。 |
| `hostname_levenshtein_distance`  | nearest_hostnameと同様ですが、ホスト名をレーヴェンシュタイン距離の観点で比較します。                                         |
| `first_or_random`                | 最初のZooKeeperノードを選択し、利用できない場合には残りのZooKeeperノードのうちの一つをランダムに選択します。                |
| `round_robin`                    | 最初のZooKeeperノードを選択し、再接続が発生した場合には次のノードを選択します。                                                    |

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
    <!-- オプション。Chrootサフィックス。存在する必要があります。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- オプション。ZooKeeperダイジェストACL文字列。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**関連項目**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper Programmer's Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouseとZooKeeper間のオプションでのセキュア通信](/operations/ssl-zookeeper)
