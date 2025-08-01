---
description: 'このセクションには、セッションまたはクエリレベルで変更できないサーバー設定に関する説明が含まれています。'
keywords:
- 'global server settings'
sidebar_label: 'サーバー設定'
sidebar_position: 57
slug: '/operations/server-configuration-parameters/settings'
title: 'サーバー設定'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';

# サーバー設定

このセクションにはサーバー設定の説明が含まれています。これらはセッションまたはクエリレベルで変更できない設定です。

ClickHouseの設定ファイルに関する詳細は、["設定ファイル"](/operations/configuration-files)を参照してください。

他の設定については、""[設定](/operations/settings/overview)"" セクションで説明されています。設定を学ぶ前に、[設定ファイル](/operations/configuration-files) セクションを読むことをお勧めし、置き換えの使用（`incl` と `optional` 属性）に注意してください。

## access_control_improvements {#access_control_improvements} 

アクセス制御システムのオプション改善のための設定です。

| 設定名                                           | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | デフォルト |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`      | 許可された行ポリシーがないユーザーが `SELECT` クエリを使用して行を読み取ることができるかどうかを設定します。たとえば、ユーザー A と B がいて、A のみに対して行ポリシーが定義されている場合、この設定が真であれば、ユーザー B はすべての行を見ることができます。この設定が偽であれば、ユーザー B は行を見ません。                                                                                                                                                                 | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` クエリが `CLUSTER` 権限を必要とするかどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                      | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>` が任何権限を必要とし、任意のユーザーによって実行できるかどうかを設定します。これが真に設定されている場合、このクエリは `GRANT SELECT ON system.<table>` を必要とし、通常のテーブルと同様です。例外: 一部のシステムテーブル（`tables`、`columns`、`databases`、および `one`、`contributors` のような一部の定数テーブル）は、すべての人がアクセス可能です。`SHOW` 権限（例: `SHOW USERS`）が付与されている場合、対応するシステムテーブル（すなわち `system.users`）にもアクセスできます。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` が任何権限を必要とし、任意のユーザーによって実行できるかどうかを設定します。これが真に設定されている場合、このクエリは `GRANT SELECT ON information_schema.<table>` を必要とし、普通のテーブルと同様です。                                                                                                                                                                                                                                            | `true`  |
| `settings_constraints_replace_previous`         | 設定プロファイル内のある設定に対する制約が、他のプロファイルで定義されたその設定の前の制約の行動をキャンセルするかどうかを設定します。これには新しい制約によって設定されていないフィールドも含まれます。また、`changeable_in_readonly` 制約タイプを有効にします。                                                                                                                                                                                                                       | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンを使用してテーブルを作成するために権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`            | 最後のアクセスからの時間（秒）を設定し、その時間が経過すると役割がロールキャッシュに保存されます。                                                                                                                                                                                                                                                                                                                                                                                                                                  | `600`   |

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

ClickHouseサーバーがSQLコマンドによって作成されたユーザーおよびロール設定を保存するフォルダーへのパスです。

**関連事項**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)
## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />groupArray で最大配列要素サイズが超えたときに実行されるアクション: `throw` 例外、または `discard` 余分な値
## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray関数の最大配列要素サイズ（バイト単位）。この制限はシリアル化時にチェックされ、大きな状態サイズを回避するのに役立ちます。
## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />
異なる機能階層に関連する設定をユーザーが変更できるかどうかを制御します。

- `0` - すべての設定変更が許可されます（実験的、ベータ、プロダクション）。
- `1` - ベータおよびプロダクション機能設定に対する変更のみが許可されます。実験的設定の変更は拒否されます。
- `2` - プロダクション設定に対する変更のみが許可されます。実験的またはベータ設定の変更は拒否されます。

これはすべての `EXPERIMENTAL` / `BETA` 機能に対する読み取り専用制約を設定することと同等です。

:::note
値が `0` の場合、すべての設定を変更できます。
:::
## allow_implicit_no_password {#allow_implicit_no_password} 

明示的に 'IDENTIFIED WITH no_password' が指定されていない場合、パスワードなしのユーザーを作成することを禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## allow_no_password {#allow_no_password} 

安全でないパスワードタイプのno_passwordを許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```
## allow_plaintext_password {#allow_plaintext_password} 

プレーンテキストパスワードタイプ（安全でない）を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />jemallocメモリの使用を許可します。
## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />真の場合、優雅なシャットダウン時に非同期挿入のキューがフラッシュされます。
## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドでデータを解析して挿入するための最大スレッド数。ゼロは非同期モードが無効であることを意味します。
## async_load_databases {#async_load_databases} 

<SettingsInfoBlock type="Bool" default_value="1" />
データベースおよびテーブルの非同期ロード。

- `true` の場合、ClickHouseサーバーの起動後、`Ordinary`、`Atomic`、および `Replicated` エンジンを持つすべての非システムデータベースが非同期でロードされます。`system.asynchronous_loader` テーブル、`tables_loader_background_pool_size`、および `tables_loader_foreground_pool_size` サーバー設定を参照してください。まだロードされていないテーブルにアクセスしようとする任意のクエリは、正確にそのテーブルが起動するまで待機します。ロードジョブが失敗した場合、クエリはエラーを再スローします（`async_load_databases = false`のケースではサーバー全体をシャットダウンするのではなく）。少なくとも1つのクエリによって待機されるテーブルは、高い優先度でロードされます。データベースに対するDDLクエリは、正確にそのデータベースが起動するまで待機します。また、待機クエリの総数の制限 `max_waiting_queries` を設定することを考慮してください。
- `false` の場合、すべてのデータベースはサーバー起動時にロードされます。

**例**

```xml
<async_load_databases>true</async_load_databases>
```
## async_load_system_database {#async_load_system_database} 

<SettingsInfoBlock type="Bool" default_value="0" />
システムテーブルの非同期ロード。`system` データベース内に多数のログテーブルとパーツがある場合に便利です。`async_load_databases` 設定とは独立しています。

- `true` に設定すると、ClickHouseサーバーの起動後、`Ordinary`、`Atomic`、および `Replicated` エンジンを持つすべてのシステムデータベースが非同期でロードされます。`system.asynchronous_loader` テーブル、`tables_loader_background_pool_size`、および `tables_loader_foreground_pool_size` サーバー設定を参照してください。まだロードされていないシステムテーブルにアクセスしようとする任意のクエリは、正確にそのテーブルが起動するまで待機します。少なくとも1つのクエリによって待機されるテーブルは、高い優先度でロードされます。また、待機クエリの総数を制限するために、`max_waiting_queries` 設定を設定することを考慮してください。
- `false` に設定すると、サーバー起動前にシステムデータベースがロードされます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
```
## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />重い非同期メトリックの更新のための期間（秒単位）。
## asynchronous_insert_log {#asynchronous_insert_log} 

[asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) のシステムテーブル用の設定で、非同期挿入をログします。

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

ClickHouse Cloud展開では、デフォルトで有効になっています。

環境にデフォルトでこの設定が有効でない場合、ClickHouseがインストールされた方法に応じて、次に示す手順に従って有効または無効にできます。

**有効化**

非同期メトリックログ履歴収集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md) を手動でオンにするには、次の内容で `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します。

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

`asynchronous_metric_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` ファイルを作成する必要があります。

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />重い非同期メトリックの計算を有効にします。
## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />非同期メトリックの更新のための期間（秒単位）。
## auth_use_forwarded_address {#auth_use_forwarded_address} 

プロキシを介して接続されたクライアントの認証に起源のアドレスを使用します。

:::note
この設定は特に注意して使用する必要があります。なぜなら、転送されたアドレスは簡単に偽造できるからです。このような認証を受け入れるサーバーには直接ではなく、信頼できるプロキシを介してのみアクセスしてください。
:::
## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [Buffer-engine tables](/engines/table-engines/special/buffer) のフラッシュ操作を実行するために使用される最大スレッド数。
## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルのさまざまな操作（主にガベージコレクション）を実行するために使用される最大スレッド数。
## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />分散送信を実行するために使用される最大スレッド数。
## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルの別のレプリカからデータパーツを取得するために使用される最大スレッド数。
## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />
同時に実行できるバックグラウンドマージとミューテーションのスレッド数とバックグラウンドマージおよびミューテーションの数との比率を設定します。

たとえば、比率が2で `background_pool_size` が16に設定されている場合、ClickHouseは同時に32のバックグラウンドマージを実行できます。これは、バックグラウンド操作が一時停止されて延期されることができるためです。これにより、小規模なマージにより実行優先度が高くなります。

:::note
この比率は実行中にのみ増加させることができます。下げるにはサーバーを再起動する必要があります。

[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 設定と同様に、[`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) は後方互換性のために `default` プロファイルから適用される場合があります。
:::
## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />
バックグラウンドでのマージおよびミューテーションのスケジューリングを実行するためのポリシー。可能な値は `round_robin` および `shortest_task_first` です。

バックグラウンドスレッドプールによって実行される次のマージまたはミューテーションを選択するために使用されるアルゴリズム。ポリシーはサーバーの再起動なしに実行中に変更できます。

可能な値:

- `round_robin` — 各同時マージとミューテーションは、飢餓なしの操作を確保するためにラウンドロビン順で実行されます。小さなマージは、大きなマージと比較してブロック数が少ないため、より早く完了します。
- `shortest_task_first` — 常に小さなマージまたはミューテーションを実行します。マージとミューテーションは、その結果のサイズに基づいて優先順位が割り当てられます。サイズの小さいマージは、サイズの大きなマージよりも厳密に優先されます。このポリシーは、小さな部品の最も迅速なマージを保証しますが、`INSERT` で過度に過負荷になっているパーティション内の大きなマージの無限の飢えにつながる可能性があります。
## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />メッセージストリーミングのバックグラウンド操作を実行するために使用される最大スレッド数。
## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドで *MergeTree-engine テーブルのデータパーツを別のディスクまたはボリュームに移動するために使用される最大スレッド数。
## background_pool_size {#background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
MergeTreeエンジンのテーブルに対するバックグラウンドマージおよびミューテーションを行うスレッド数を設定します。

:::note
- この設定は、ClickHouseサーバーの起動時に `default` プロファイル設定からも適用される場合があります。
- 実行中にスレッド数を増やすことができます。
- スレッド数を減らすには、サーバーを再起動する必要があります。
- この設定を調整することで、CPUおよびディスクの負荷を管理できます。
:::

:::danger
小さいプールサイズは、CPUおよびディスクリソースを少なく使用しますが、バックグラウンドプロセスの進行が遅くなる可能性があり、最終的にはクエリ性能に影響を与える可能性があります。
:::

これを変更する前に、次のような関連する MergeTree 設定も確認してください。
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).

**例**

```xml
<background_pool_size>16</background_pool_size>
```
## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />複製テーブル、Kafkaストリーミング、およびDNSキャッシュ更新のために常にライトな周期的操作を実行するために使用される最大スレッド数。
## backup_log {#backup_log} 

`BACKUP` および `RESTORE` 操作をログするための [backup_log](../../operations/system-tables/backup_log.md) システムテーブルの設定。

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

`BACKUP TO File()` の際に書き込むために使用されるバックアップの設定。

次の設定をサブタグで構成できます。

| 設定名                             | 説明                                                                                                                                                                    | デフォルト |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                      | `File()`を使用する際にバックアップを取得するパス。この設定は、`File` を使用するために設定する必要があります。このパスはインスタンスディレクトリに対して相対的なものか、または絶対パスである可能性があります。 | `true`  |
| `remove_backup_files_after_failure` | `BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップにコピーされているファイルを削除しようとします。さもなければ、コピーされたファイルはそのままになります。 | `true`  |

この設定は、デフォルトで以下のように構成されています。

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
バックアップの IO スレッドプールにスケジュールできる最大ジョブ数。現在の S3 バックアップロジックのために、このキューは制限なしに保つことをお勧めします。

:::note
値が `0` （デフォルト）は無制限を意味します。
:::
## bcrypt_workfactor {#bcrypt_workfactor} 

[bcryptアルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)を使用するbcrypt_password 認証タイプの作業係数。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
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
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval} 

組み込み辞書の再読み込み間隔（秒単位）。

ClickHouseは、毎x秒に組み込み辞書を再読み込みします。これにより、サーバーを再起動せずに辞書を「オンザフライ」で編集できます。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />キャッシュサイズをRAMの最大比率に設定します。低メモリシステムでキャッシュサイズを下げることができます。
## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />テスト目的。
## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />
サーバープロセスのメモリ消費の「ハード」しきい値をcgroupsに従って指定し、その後サーバーの最大メモリ消費量がしきい値値に調整されます。

設定を参照してください:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio)
## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />
サーバープロセスのメモリ消費の「ソフト」しきい値をcgroupsに従って指定し、その後jemalloc内のアリーナがクリアされます。

設定を参照してください:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />
cgroupsの対応するしきい値に従って、サーバーの最大メモリ消費を調整する間隔（秒単位）。

cgroupオブザーバーを無効にするには、この値を `0` に設定します。

設定を参照してください:
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio)。
## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />[コンパイル済み式](../../operations/caches.md)のキャッシュサイズ（要素単位）を設定します。
## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />[コンパイル済み式](../../operations/caches.md)のキャッシュサイズ（バイト単位）を設定します。
## compression {#compression} 

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)エンジンテーブルのデータ圧縮設定。

:::note
ClickHouseの使用を始めたばかりの場合は、これを変更しないことをお勧めします。
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

**`<case>` フィールド**:

- `min_part_size` – データパートの最小サイズ。
- `min_part_size_ratio` – テーブルサイズに対するデータパートサイズの比率。
- `method` – 圧縮方法。受け入れ可能な値: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`。
- `level` – 圧縮レベル。詳細は [Codecs](/sql-reference/statements/create/table#general-purpose-codecs) を参照してください。

:::note
複数の `<case>` セクションを構成できます。
:::

**条件が満たされる場合のアクション**:

- データパートが設定された条件に一致する場合、ClickHouse は指定された圧縮方法を使用します。
- データパートが複数の条件に一致する場合、ClickHouse は最初の一致した条件を使用します。

:::note
データパートに対して条件が満たされない場合、ClickHouse は `lz4` 圧縮を使用します。
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
`concurrent_threads_soft_limit_num` および `concurrent_threads_soft_limit_ratio_to_cores` で指定されたCPUスロットをスケジューリングするポリシー。制限された数のCPUスロットが同時クエリにどのように分配されるかを管理するために使用されるアルゴリズム。スケジューラーはサーバーの再起動なしで実行中に変更できます。

可能な値:

- `round_robin` — `use_concurrency_control` = 1 を設定した各クエリは、`max_threads` のCPUスロットを最大まで割り当てます。スレッドごとに1スロット。競合がある場合、CPUスロットはラウンドロビン順にクエリに付与されます。最初のスロットは無条件に与えられるので、これは不公平を引き起こし、`max_threads`が高いクエリのレイテンシが高くなる可能性があります。
- `fair_round_robin` — `use_concurrency_control` = 1 を設定した各クエリは、`max_threads - 1` のCPUスロットを最大まで割り当てます。すべてのクエリの最初のスレッドにCPUスロットを必要としないラウンドロビンのバリエーション。このように、`max_threads` = 1 のクエリはスロットを必要とせず、すべてのスロットを不公平に割り当てることができません。無条件で与えられるスロットはありません。
## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />
リモートサーバーからデータを取得するためのスレッドを除外して、すべてのクエリを実行するために許可される最大クエリ処理スレッド数。これは厳格な制限ではありません。この制限に達した場合、クエリはそれでも1つのスレッドを受け取ります。クエリは、実行中により多くのスレッドが利用可能になると、希望の数のスレッドにアップスケールできます。

:::note
値が `0` （デフォルト）は無制限を意味します。
:::
## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" /> [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) と同じですが、コアに対する比率です。
```
## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />
ClickHouse が構成を再読み込みし、新しい変更を確認する頻度

## core_dump {#core_dump} 

コアダンプファイルのサイズに対するソフトリミットを設定します。

:::note
ハードリミットはシステムツールを介して設定されます
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

デフォルトのサーバー構成ファイル `config.xml` には、次の設定セクションが含まれています：

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
`custom_cached_disks_base_directory` はカスタムディスクに対して `filesystem_caches_path` （`filesystem_caches_path.xml`に見つかる）よりも優先されます。
前者が存在しない場合、後者が使用されます。
ファイルシステムキャッシュ設定パスは、そのディレクトリ内に存在しなければなりません。
さもなければ、ディスクの作成を防ぐ例外がスローされます。

:::note
これは、サーバーがアップグレードされた古いバージョンで作成されたディスクには影響しません。
この場合、サーバーが正常に起動できるように、例外はスローされません。
:::

例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```

## custom_settings_prefixes {#custom_settings_prefixes} 

[カスタム設定](/operations/settings/query-level#custom_settings) の接頭辞のリスト。接頭辞はカンマで区切らなければなりません。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**参照先**

- [カスタム設定](/operations/settings/query-level#custom_settings)

## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" />
削除されたテーブルを [`UNDROP`](/sql-reference/statements/undrop.md) ステートメントを使用して復元できるまでの遅延時間。 `DROP TABLE` が `SYNC` 修飾子と共に実行された場合、この設定は無視されます。
この設定のデフォルトは `480` （8分）です。

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />テーブルの削除に失敗した場合、ClickHouse はこのタイムアウトを待機してから操作を再試行します。

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />テーブルを削除するために使用されるスレッドプールのサイズ。

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
`store/` ディレクトリからガーベジをクリーンアップするタスクのパラメータ。
タスクのスケジューリング期間を設定します。

:::note
`0` の値は「決して」を意味します。デフォルト値は1日です。
:::

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />
`store/` ディレクトリからガーベジをクリーンアップするタスクのパラメータ。
もし特定のサブディレクトリが clickhouse-server によって使用されておらず、最後の [`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒間このディレクトリが変更されていない場合、タスクはこのディレクトリを「隠す」ために 
全てのアクセス権を削除します。これは、clickhouse-server が `store/` 内部に見越していないディレクトリでも機能します。

:::note
`0` の値は「即座に」を意味します。
:::

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />
`store/` ディレクトリからガーベジをクリーンアップするタスクのパラメータ。
もし特定のサブディレクトリが clickhouse-server によって使用されておらず、以前「隠されていた」
（[database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) を参照）で、かつこのディレクトリが最後の [`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒間に変更されていない場合、タスクはこのディレクトリを削除します。
これは、clickhouse-server が `store/` 内部に見越していないディレクトリでも機能します。

:::note
`0` の値は「決して」を意味します。デフォルト値は30日です。
:::

## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />レプリケーションデータベースでテーブルを永久にデタッチすることを許可します。

## default_database {#default_database} 

<SettingsInfoBlock type="String" default_value="default" />デフォルトのデータベース名。

## default_password_type {#default_password_type} 

クエリ `CREATE USER u IDENTIFIED BY 'p'` のために自動的に設定されるパスワードタイプを設定します。

受け入れられる値：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```

## default_profile {#default_profile} 

デフォルトの設定プロファイル。設定プロファイルは `user_config` で指定されたファイルにあります。

**例**

```xml
<default_profile>default</default_profile>
```

## default_replica_name {#default_replica_name} 

<SettingsInfoBlock type="String" default_value="{replica}" />
ZooKeeper におけるレプリカ名。

**例**

```xml
<default_replica_name>{replica}</default_replica_name>
```

## default_replica_path {#default_replica_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />
ZooKeeper 内のテーブルへのパス。

**例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```

## default_session_timeout {#default_session_timeout} 

デフォルトのセッションタイムアウト（秒単位）。

```xml
<default_session_timeout>60</default_session_timeout>
```

## dictionaries_config {#dictionaries_config} 

辞書用構成ファイルのパス。

パス：

- 絶対パスまたはサーバー構成ファイルに対する相対パスを指定します。
- パスにはワイルドカード * および ? を含めることができます。

参照先:
- "[Dictionaries](../../sql-reference/dictionaries/index.md)".

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```

## dictionaries_lazy_load {#dictionaries_lazy_load} 

<SettingsInfoBlock type="Bool" default_value="1" />
辞書の遅延ロード。

- `true` の場合、各辞書は最初の使用時にロードされます。ロードに失敗した場合、その辞書を使用している関数は例外をスローします。
- `false` の場合、サーバーは起動時にすべての辞書をロードします。

:::note
サーバーは、すべての辞書がロードを終えるまで接続を受け付けるのを待機します（例外: [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) が `false` に設定されている場合）。
:::

**例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```

## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />MySQL および Postgres 辞書の再接続試行の間隔（ミリ秒単位）で、`background_reconnect` が有効になっています。

## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />
すべての挿入/更新/削除クエリを無効にします。この設定は、読み取り性能に挿入や更新が影響しないようにするために、読み取り専用ノードが必要な場合に有効になります。

## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />内部 DNS キャッシュを無効にします。頻繁にインフラストラクチャが変わるようなシステム（Kubernetes など）で ClickHouse を運用することが推奨されます。

## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy} 

デフォルトでは、トンネリング（つまり、 `HTTP CONNECT`）は `HTTP` プロキシ上で `HTTPS` リクエストを行うために使用されます。この設定はそれを無効にするために使用できます。

**no_proxy**

デフォルトでは、すべてのリクエストはプロキシを通過します。特定のホストのためにこれを無効にするには、`no_proxy` 変数を設定しなければなりません。
それはリストとリモートリゾルバの `<proxy>` 句内および環境リゾルバの環境変数として設定できます。
IPアドレス、ドメイン、サブドメインおよびフルバイパスのために `'*'` ワイルドカードをサポートします。先頭のドットは、curl が実行するときのように削除されます。

**例**

以下の構成は、`clickhouse.cloud` とその全てのサブドメインに対するプロキシリクエストをバイパスします (例: `auth.clickhouse.cloud`)。
同様に GitLab にも適用されますが、先頭にドットがあります。`gitlab.com` と `about.gitlab.com` の両方がプロキシをバイパスします。

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

<SettingsInfoBlock type="UInt64" default_value="5000" />このリミットを超えた接続は、寿命が大幅に短くなります。このリミットはディスク接続に適用されます。

## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="30000" />このリミットを超えた接続は使用後にリセットされます。接続キャッシュをオフにするには0に設定します。このリミットはディスク接続に適用されます。

## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />使用中の接続数がこのリミットを超えると警告メッセージがログに記録されます。このリミットはディスク接続に適用されます。

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />
テーブル、データベース、テーブル関数、および辞書に対する `SHOW` および `SELECT` クエリでシークレットを表示するかどうかを有効または無効にします。

シークレットを表示したいユーザーは、[`format_display_secrets_in_show_and_select` フォーマット設定](../settings/formats#format_display_secrets_in_show_and_select) をオンにし、
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限を持っている必要があります。

可能な値：

- `0` — 無効。
- `1` — 有効。

## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />アクティブ接続の数を保持できるソフトリミット。自由接続数が`distributed_cache_keep_up_free_connections_ratio * max_connections` 未満になると、古い活動を持つ接続を閉じ、数がリミットを上回るまで続けます。

## distributed_ddl {#distributed_ddl} 

クラスター上で [分散 DDL クエリ](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）を実行する管理。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) が有効になっていなければ、機能しません。

`<distributed_ddl>` 内の設定には次のものがあります：

| 設定                  | 説明                                                                                                                               | デフォルト値                          |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| `path`                 | DDL クエリの `task_queue` の Keeper 内のパス                                                                                      |                                        |
| `profile`              | DDL クエリを実行するために使用されるプロファイル                                                                                  |                                        |
| `pool_size`            | 何件の `ON CLUSTER` クエリを同時に実行できるか                                                                                   |                                        |
| `max_tasks_in_queue`   | キューに存在できるタスクの最大数。                                                                                           | `1,000`                                |
| `task_max_lifetime`    | ノードの年齢がこの値を超えた場合に削除します。                                                                                     | `7 * 24 * 60 * 60` （1週間（秒単位）) |
| `cleanup_delay_period` | 新しいノードイベントが受信された後、最後のクリーンアップが `cleanup_delay_period` 秒未満でなかった場合、クリーンアップが開始されます。 | `60` 秒                              |

**例**

```xml
<distributed_ddl>
    <!-- DDLクエリのキューに対するZooKeeperのパス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- このプロファイルの設定がDDLクエリの実行に使用されます -->
    <profile>default</profile>

    <!-- 同時に実行できるON CLUSTERクエリの数を制御します。 -->
    <pool_size>1</pool_size>

    <!--
         クリーンアップ設定（アクティブタスクは削除されません）
    -->

    <!-- タスクのTTLを制御します（デフォルト1週間） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- クリーンアップが実行される頻度を制御します（秒単位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- キュー内に存在できるタスク数を制御します -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />名前を ipv4 アドレスに解決することを許可します。

## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />名前を ipv6 アドレスに解決することを許可します。

## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />内部 DNS キャッシュの最大エントリ。

## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />内部 DNS キャッシュの更新期間（秒単位）。

## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />ホスト名の最大 DNS 解決失敗数。この数を超えると、ホスト名は ClickHouse DNS キャッシュから削除されます。

## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Azure SDK からのログを有効にします。

## encryption {#encryption} 

[暗号化コーデック](/sql-reference/statements/create/table#encryption-codecs) に使用するキーを取得するコマンドを構成します。キー（またはキー）は環境変数に書かれるか、構成ファイルに設定されるべきです。

キーは 16 バイトの長さを持つ 16 進数または文字列である可能性があります。

**例**

構成からの読み込み：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
キーを構成ファイルに保存することは推奨されません。安全ではないからです。キーを安全なディスク上の別の構成ファイルに移し、その構成ファイルへのシンボリックリンクを `config.d/` フォルダに配置できます。
:::

構成からの読み込み、キーが 16 進数の場合：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

環境変数からのキーの読み込み：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで `current_key_id` は暗号化に使用される現在のキーを設定し、指定されたすべてのキーは復号化に使用できます。

これらのメソッドは複数のキーに対して適用できます：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで `current_key_id` は暗号化に使われる現在のキーを示します。

また、12 バイトの長さを持つノンスを追加することもできます（デフォルトでは、暗号化および復号化プロセスでは、ゼロバイトで構成されたノンスが使用されます）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または、16 進数で設定することもできます：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上記のすべては `aes_256_gcm_siv` にも適用可能です（ただし、キーは 32 バイト長である必要があります）。
:::

## error_log {#error_log} 

デフォルトでは無効です。

**有効化**

エラーヒストリーコレクション [`system.error_log`](../../operations/system-tables/error_log.md) を手動でオンにするには、`/etc/clickhouse-server/config.d/error_log.xml` を作成し、次の内容を設定します：

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

`error_log` 設定を無効にするには、次のファイル `/etc/clickhouse-server/config.d/disable_error_log.xml` を作成し、次の内容を設定します：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## format_schema_path {#format_schema_path} 

入力データ用のスキーマを持つディレクトリへのパス、例えば [CapnProto](../../interfaces/formats.md#capnproto) 形式用のスキーマ。

**例**

```xml
<!-- 様々な入力形式のためのスキーマファイルを含むディレクトリ。 -->
<format_schema_path>format_schemas/</format_schema_path>
```

## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="0" />グローバルプロファイラの CPU クロックタイマーの期間（ナノ秒）。 0 の値を設定すると、CPU クロックグローバルプロファイラをオフにします。単一クエリの場合は少なくとも 10000000（1 秒に 100 回）、クラスター全体のプロファイリングの場合は少なくとも 1000000000（1 秒に 1 回）を推奨します。

## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="0" />グローバルプロファイラのリアルクロックタイマーの期間（ナノ秒）。 0 の値を設定すると、リアルクロックグローバルプロファイラをオフにします。単一クエリの場合は少なくとも 10000000（1 秒に 100 回）、クラスター全体のプロファイリングの場合は少なくとも 1000000000（1 秒に 1 回）を推奨します。

## google_protos_path {#google_protos_path} 

Protobuf タイプ用の proto ファイルを含むディレクトリを定義します。

**例**

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```

## graphite {#graphite} 

[Graphite](https://github.com/graphite-project) にデータを送信します。

設定：

- `host` – Graphite サーバー。
- `port` – Graphite サーバー上のポート。
- `interval` – 送信間隔（秒単位）。
- `timeout` – データ送信時のタイムアウト（秒単位）。
- `root_path` – キーのプレフィックス。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからのデータ送信。
- `events` – [system.events](/operations/system-tables/events) テーブルからの期間中に蓄積されたデルタデータを送信。
- `events_cumulative` – [system.events](/operations/system-tables/events) テーブルからの累積データを送信。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルからのデータ送信。

複数の `<graphite>` 句を設定できます。例えば、異なる間隔で異なるデータを送信するために使用できます。

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

Graphite 用のデータをスリムさせる設定。

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

HSTS の有効期限（秒単位）。

:::note
`0` の値は ClickHouse が HSTS を無効にすることを意味します。正の数を設定した場合、HSTS が有効になり、max-age は設定した数になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```

## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />このリミットを超える接続は、寿命が大幅に短くなります。このリミットは、ディスクまたはストレージに属さない http 接続に適用されます。

## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />このリミットを超える接続は使用後にリセットされます。接続キャッシュをオフにするには0に設定します。このリミットは、ディスクまたはストレージに属さない http 接続に適用されます。

## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />使用中の接続数がこのリミットを超えると警告メッセージがログに記録されます。このリミットは、ディスクまたはストレージに属さない http 接続に適用されます。

## http_handlers {#http_handlers} 

カスタム HTTP ハンドラーの使用を許可します。
新しい http ハンドラーを追加するには、新しい `<rule>` を追加するだけです。
ルールは、定義されたとおりに上から下へとチェックされ、最初の一致がハンドラーを実行します。

以下の設定は、サブタグによって構成できます：

| サブタグ              | 定義                                                                                                                                 |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------|
| `url`                 | リクエスト URL を一致させるためのもので、`regex:` プレフィックスを使用して正規表現マッチを利用できます（オプション）                                                      |
| `methods`             | リクエストメソッドを一致させるもので、複数のメソッドマッチをカンマで区切ることができます（オプション）                                                                         |
| `headers`             | リクエストヘッダーを一致させるためのもので、各子要素を一致させます（子要素名はヘッダー名）、`regex:` プレフィックスを使って正規表現マッチを利用できます（オプション）                           |
| `handler`             | リクエストハンドラー                                                                                                              |
| `empty_query_string`  | URL にクエリ文字列が存在しないことを確認します                                                                                        |

`handler` には以下の設定が含まれ、サブタグで構成できます：

| サブタグ               | 定義                                                                                                                                     |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                  | リダイレクト先                                                                                                                                 |
| `type`                 | サポートされているタイプ: static, dynamic_query_handler, predefined_query_handler, redirect                                                    |
| `status`               | 静的タイプで使用、レスポンスステータスコード                                                                                                     |
| `query_param_name`     | dynamic_query_handler タイプと共に使用し、HTTP リクエストパラメータ内の `<query_param_name>` 値に対応する値を抽出し実行します                  |
| `query`                | predefined_query_handler タイプと共に使用し、ハンドラーが呼び出されるとクエリを実行します                                                            |
| `content_type`         | 静的タイプと共に使用し、レスポンスコンテンツタイプ                                                                                             |
| `response_content`     | 静的タイプと共に使用し、クライアントへ送信されるレスポンスコンテンツ。プレフィックス 'file://' または 'config://' を使用すると、ファイルまたは構成から内容を見つけてクライアントに送信します |

ルールのリストと共に、すべてのデフォルトハンドラーを有効にする `<defaults/>` を指定することもできます。

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

`OPTIONS` HTTP リクエストのレスポンスにヘッダーを追加するために使用します。
`OPTIONS` メソッドは、CORS プレフライトリクエストを実行する際に使用されます。

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

ClickHouse HTTP(S) サーバーにアクセスしたときにデフォルトで表示されるページ。
デフォルト値は "Ok." （最後に改行が含まれます。）

**例**

`http://localhost: http_port` にアクセスすると `https://tabix.io/` を開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```

## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />アイスバーグカタログ用のバックグラウンドプールのサイズ

## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />アイスバーグカタログプールにプッシュ可能なタスク数

## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />エントリ数に関するアイスバーグメタデータファイルキャッシュの最大サイズ。ゼロは無効を意味します。

## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />アイスバーグメタデータキャッシュポリシー名。

## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />バイト単位のアイスバーグメタデータキャッシュの最大サイズ。ゼロは無効を意味します。

## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />アイスバーグメタデータキャッシュにおける保護されたキューのサイズ（SLRU ポリシーの場合）。
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />
この設定が true の場合、ClickHouse は `CREATE VIEW` クエリにおいて空の SQL セキュリティステートメントのデフォルトを記述しません。

:::note
この設定は移行期間中のみ必要であり、バージョン 24.4 で廃止されます。
:::
## include_from {#include_from} 

置換のためのファイルのパス。XML 形式と YAML 形式の両方がサポートされています。

詳細については、セクション「[設定ファイル](/operations/configuration-files)」を参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリインデックスマークキャッシュポリシー名。
## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
インデックスマークのキャッシュの最大サイズ。

:::note

値が `0` の場合、無効です。

この設定はランタイム中に変更でき、即時に反映されます。
:::
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />セカンダリインデックスマークキャッシュにおいて、キャッシュの総サイズに対する保護されたキューのサイズ（SLRU ポリシーの場合）。
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリインデックス非圧縮キャッシュポリシー名。
## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
`MergeTree` インデックスの非圧縮ブロックのキャッシュの最大サイズ。

:::note
値が `0` の場合、無効です。

この設定はランタイム中に変更でき、即時に反映されます。
:::
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />セカンダリインデックス非圧縮キャッシュにおいて、キャッシュの総サイズに対する保護されたキューのサイズ（SLRU ポリシーの場合）。
## interserver_http_credentials {#interserver_http_credentials} 

他のサーバーに接続するために使用されるユーザー名とパスワード、[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)の間で。さらに、このサーバーはこれらの資格情報を使用して他のレプリカを認証します。
そのため、`interserver_http_credentials` はクラスター内のすべてのレプリカで同じである必要があります。

:::note
- デフォルトでは、`interserver_http_credentials` セクションが省略されると、レプリケーション中に認証は使用されません。
- `interserver_http_credentials` 設定は、ClickHouse クライアントの資格情報 [構成](../../interfaces/cli.md#configuration_files) に関係しません。
- これらの資格情報は、`HTTP` および `HTTPS` 経由のレプリケーションに共通です。
:::

次の設定はサブタグで構成できます：

- `user` — ユーザー名。
- `password` — パスワード。
- `allow_empty` — `true` の場合、他のレプリカは資格情報が設定されていても認証なしで接続できます。`false` の場合、認証なしの接続は拒否されます。デフォルト: `false`。
- `old` — 資格情報のローテーション中に使用された古い `user` および `password` を含みます。複数の `old` セクションを指定できます。

**資格情報のローテーション**

ClickHouse は、すべてのレプリカを同時に停止せずに動的なインタサーバー資格情報のローテーションをサポートします。資格情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、資格情報を追加します。これにより、認証ありおよびなしでの接続が可能になります。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカの構成が完了したら、`allow_empty` を `false` に設定するか、この設定を削除します。これにより、新しい資格情報での認証が必須となります。

既存の資格情報を変更するには、ユーザー名とパスワードを `interserver_http_credentials.old` セクションに移動し、新しい値で `user` と `password` を更新します。この時点で、サーバーは新しい資格情報を使用して他のレプリカに接続し、新しい資格情報または古い資格情報のいずれかでの接続を受け入れます。

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

他のサーバーがこのサーバーにアクセスするために使用できるホスト名。

省略された場合、`hostname -f` コマンドと同じ方法で定義されます。

特定のネットワークインターフェースからの切り離しに有効です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_http_port {#interserver_http_port} 

ClickHouse サーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_https_host {#interserver_https_host} 

[`interserver_http_host`](#interserver_http_host) と似ていますが、このホスト名は他のサーバーが `HTTPS` 経由でこのサーバーにアクセスするために使用できます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_https_port {#interserver_https_port} 

`HTTPS` 経由で ClickHouse サーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_listen_host {#interserver_listen_host} 

ClickHouse サーバー間でデータを交換できるホストの制限。
Keeper が使用されている場合、この制限は異なる Keeper インスタンス間の通信にも適用されます。

:::note
デフォルトでは、値は [`listen_host`](#listen_host) 設定と同じです。
:::

**例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

タイプ：

デフォルト：
## io_thread_pool_queue_size {#io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
IO スレッドプールにスケジュールできるジョブの最大数。

:::note
値が `0` の場合、無制限です。
:::
## keep_alive_timeout {#keep_alive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />
ClickHouse が接続を閉じる前に HTTP プロトコルのために incoming requests を待機する秒数。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
バッチをサポートする [Zoo]Keeper への MultiRead リクエストの最大バッチサイズ。0 に設定すると、バッチ処理が無効になります。ClickHouse Cloud のみで利用可能です。
## latency_log {#latency_log} 

デフォルトでは無効です。

**有効化**

遅延履歴収集を手動で有効にするために [`system.latency_log`](../../operations/system-tables/latency_log.md) を作成します。以下の内容で `/etc/clickhouse-server/config.d/latency_log.xml` を作成します。

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

`latency_log` 設定を無効にするには、以下のファイル `/etc/clickhouse-server/config.d/disable_latency_log.xml` を作成し、以下の内容を記述します。

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## ldap_servers {#ldap_servers} 

ここに LDAP サーバーとその接続パラメータのリストを記述して：
- `password` の代わりに `ldap` 認証メカニズムが指定された専用ローカルユーザーの認証者として使用する
- リモートユーザーディレクトリとして利用することができます。

次の設定はサブタグで構成できます：

| 設定                         | 説明                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                       | LDAP サーバーのホスト名または IP、これは必須パラメータで空にはできません。                                                                                                                                                                                                                                                                                                                                                |
| `port`                       | LDAP サーバーポート、`enable_tls` が true に設定されている場合はデフォルトが 636、そうでない場合は 389 です。                                                                                                                                                                                                                                                                                                          |
| `bind_dn`                    | バインドするための DN を作成するために使用されるテンプレート。認証を試みるたびにテンプレートのすべての `\{user_name\}` サブストリングが実際のユーザー名に置き換えられることによって、結果の DN が構築されます。                                                                                                                                                                                                 |
| `user_dn_detection`          | バインドユーザーの実際のユーザー DN を検出するための LDAP 検索パラメーターを含むセクション。これは主にサーバーが Active Directory であるときの役割マッピングのための検索フィルタに使用されます。結果のユーザー DN は、許可されている場所で `\{user_dn\}` サブストリングを置き換える際に使用されます。デフォルトでは、ユーザー DN はバインド DN と同じに設定されていますが、検索が実行されると、実際の検出されたユーザー DN 値で更新されます。 |
| `verification_cooldown`      | 成功したバインド試行の後、ユーザーがLDAPサーバーに接続せずにすべての連続リクエストに対して成功した認証を仮定する期間（秒単位）。`0`（デフォルト）を指定すると、キャッシングが無効になり、各認証リクエストに対してLDAPサーバーとの接触が強制されます。                                                                                                                      |
| `enable_tls`                 | LDAP サーバーへの安全な接続をトリガーするフラグ。平文の (`ldap://`) プロトコルには `no` を指定します（推奨されません）。SSL/TLS を介した LDAP (`ldaps://`) プロトコル（推奨、デフォルト）には `yes` を指定します。従来の StartTLS プロトコル（平文の (`ldap://`) プロトコルをTLSにアップグレード）には `starttls` を指定します。                                                         |
| `tls_minimum_protocol_version`| SSL/TLS の最小プロトコルバージョン。受け入れられる値は `ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（デフォルト）です。                                                                                                                                                                                                                                                                                                 |
| `tls_require_cert`           | SSL/TLS ピア証明書の検証動作。受け入れられる値は `never`、`allow`、`try`、`demand`（デフォルト）です。                                                                                                                                                                                                                                                                                                                                              |
| `tls_cert_file`              | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `tls_key_file`               | 証明書鍵ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tls_ca_cert_file`           | CA 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tls_ca_cert_dir`            | CA 証明書を格納しているディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                                 |
| `tls_cipher_suite`           | 許可される暗号スイート（OpenSSL の表記法で）。                                                                                                                                                                                                                                                                                                                                                                                                  |

`user_dn_detection` の設定はサブタグで構成できます：

| 設定                   | 説明                                                                                                                                                                                                                                                                                                                                                          |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`             | LDAP 検索のためのベース DN を構築するために使用されるテンプレート。結果の DN は、LDAP 検索中にテンプレートのすべての `\{user_name\}` および `\{bind_dn\}` サブストリングが、実際のユーザー名およびバインド DN に置き換えられることによって構築されます。                                                                                                                                        |
| `scope`               | LDAP 検索のスコープ。受け入れられる値は `base`、`one_level`、`children`、`subtree`（デフォルト）です。                                                                                                                                                                                                                                                                                                           |
| `search_filter`       | LDAP 検索のための検索フィルタを構築するために使用されるテンプレート。結果のフィルタは、LDAP 検索中にテンプレートのすべての `\{user_name\}`、`\{bind_dn\}` および `\{base_dn\}` サブストリングが、実際のユーザー名、バインド DN、およびベース DN に置き換えられることによって構築されます。特別な文字は、XML で正しくエスケープされる必要があります。 |

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

例（設定されたユーザ DN 検出を備えた典型的な Active Directory での役割マッピング）：

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

ClickHouse エンタープライズエディションのライセンスキー
## listen_backlog {#listen_backlog} 

リッスンソケットのバックログ（保留中の接続のキューサイズ）。デフォルト値は `4096` で、これは linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4) と同じです。

通常、この値は変更する必要はありません。なぜなら：
- デフォルト値は十分に大きく、
- クライアントの接続を受け入れるためには、サーバーに別のスレッドがあります。

したがって、`TcpExtListenOverflows`（`nstat` からの）値がゼロでなく、ClickHouse サーバーのこのカウンターが増加しても、この値を増やす必要があるわけではありません。なぜなら：
- 通常、`4096` では足りない場合は、何らかの内部の ClickHouse スケーリングの問題を示しているため、問題を報告する方が良いです。
- サーバーが後でより多くの接続を扱えるわけでもなく（仮にそうだった場合、時点でクライアントが消えているか、切断されている可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```
## listen_host {#listen_host} 

リクエストが来ることができるホストの制限。サーバーがすべてのリクエストに応答するようにしたい場合は、`::` を指定します。

例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_reuse_port {#listen_reuse_port} 

複数のサーバーが同じアドレス:ポートでリッスンすることを許可します。リクエストはオペレーティングシステムによってランダムなサーバーにルーティングされます。この設定を有効にすることは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

タイプ：

デフォルト：
## listen_try {#listen_try} 

IPv6 または IPv4 ネットワークが利用できない場合でも、リッスン時にサーバーは終了しません。

**例**

```xml
<listen_try>0</listen_try>
```
## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />マークのロード用バックグラウンドプールのサイズ
## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />プリフェッチプールにプッシュ可能なタスクの数
```md
## logger {#logger} 

ログメッセージの場所とフォーマット。

**キー**:

| Key                       | Description                                                                                                                                                                         |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | ログレベル。許可される値: `none` (ロギングをオフにする)、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                                  |
| `log`                     | ログファイルへのパス。                                                                                                                                                           |
| `errorlog`                | エラーログファイルへのパス。                                                                                                                                                     |
| `size`                    | 回転ポリシー: ログファイルの最大サイズ（バイト単位）。ログファイルのサイズがこのしきい値を超えると、リネームされてアーカイブされ、新しいログファイルが作成されます。                  |
| `count`                   | 回転ポリシー: Clickhouseが保持する最大履歴ログファイル数。                                                                                                         |
| `stream_compress`         | LZ4を使用してログメッセージを圧縮します。`1` または `true` に設定して有効にします。                                                                                                                    |
| `console`                 | ログメッセージをログファイルに書き込まず、代わりにコンソールに出力します。`1` または `true` に設定して有効にします。Clickhouseがデーモンモードで実行されていない場合、デフォルトは `1`、それ以外は `0` です。 |
| `console_log_level`       | コンソール出力のログレベル。デフォルトは `level`。                                                                                                                                  |
| `formatting`              | コンソール出力のログフォーマット。現在は `json` のみがサポートされています。                                                                                                                  |
| `use_syslog`              | ログ出力をsyslogにも転送します。                                                                                                                                                  |
| `syslog_level`            | syslogへのログのログレベル。                                                                                                                                                    |

**ログフォーマット指定子**

`log` および `errorLog` パスのファイル名は、結果のファイル名のために以下のフォーマット指定子をサポートしています（ディレクトリ部分はサポートしていません）。

"Example"列には `2023-07-06 18:32:07` での出力が示されています。

| Specifier    | Description                                                                                                         | Example                  |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | リテラル %                                                                                                           | `%`                        |
| `%n`         | 改行文字                                                                                                  |                          |
| `%t`         | 水平タブ文字                                                                                            |                          |
| `%Y`         | 年を10進数で表示、例: 2017                                                                                 | `2023`                     |
| `%y`         | 年の最後の2桁を10進数で表示（範囲[00,99]）                                                           | `23`                       |
| `%C`         | 年の最初の2桁を10進数で表示（範囲[00,99]）                                                          | `20`                       |
| `%G`         | 4桁の[ISO 8601週間ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) 、指定された週を含む年を表示。通常、`%V` と組み合わせると便利です。  | `2023`       |
| `%g`         | [ISO 8601週間ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)の最後の2桁を表示、指定された週を含む年。                         | `23`         |
| `%b`         | 短縮された月名、例: Oct (ロケール依存)                                                                 | `Jul`                      |
| `%h`         | %bの同義語                                                                                                       | `Jul`                      |
| `%B`         | 完全な月名、例: October (ロケール依存)                                                                    | `July`                     |
| `%m`         | 月を10進数で表示（範囲[01,12]）                                                                           | `07`                       |
| `%U`         | 週番号を10進数で表示（日曜日が最初の日）（範囲[00,53]）                          | `27`                       |
| `%W`         | 週番号を10進数で表示（月曜日が最初の日）（範囲[00,53]）                          | `27`                       |
| `%V`         | ISO 8601週間番号（範囲[01,53]）                                                                                | `27`                       |
| `%j`         | 年の日を10進数で表示（範囲[001,366]）                                                               | `187`                      |
| `%d`         | 月の日を0埋めされた10進数で表示（範囲[01,31]）。単一桁の値にはゼロが前に付きます。                 | `06`                       |
| `%e`         | 月の日を空白埋めされた10進数で表示（範囲[1,31]）。単一桁の値には空白が前に付きます。              | `&nbsp; 6`                 |
| `%a`         | 短縮された曜日名、例: Fri (ロケール依存)                                                               | `Thu`                      |
| `%A`         | 完全な曜日名、例: Friday (ロケール依存)                                                                   | `Thursday`                 |
| `%w`         | 曜日を整数で表示（0-6、日曜日 = 0）                                                          | `4`                        |
| `%u`         | 曜日を10進数で表示（ISO 8601フォーマット）（1-7、月曜日 = 1）                                      | `4`                        |
| `%H`         | 時間を10進数で表示、24時間制（範囲[00-23]）                                                             | `18`                       |
| `%I`         | 時間を10進数で表示、12時間制（範囲[01,12]）                                                             | `06`                       |
| `%M`         | 分を10進数で表示（範囲[00,59]）                                                                          | `32`                       |
| `%S`         | 秒を10進数で表示（範囲[00,60]）                                                                          | `07`                       |
| `%c`         | 標準日付および時間文字列、例: Sun Oct 17 04:41:13 2010 (ロケール依存)                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | ローカライズされた日付表現 (ロケール依存)                                                                    | `07/06/23`                 |
| `%X`         | ローカライズされた時刻表現、例: 18:40:20 または 6:40:20 PM (ロケール依存)                                       | `18:32:07`                 |
| `%D`         | 短いMM/DD/YY形式の日時、`%m/%d/%y`に相当                                                                         | `07/06/23`                 |
| `%F`         | 短いYYYY-MM-DD形式の日時、`%Y-%m-%d`に相当                                                                       | `2023-07-06`               |
| `%r`         | ローカライズされた12時間制の時刻 (ロケール依存)                                                                     | `06:32:07 PM`              |
| `%R`         | "%H:%M"に相当                                                                                               | `18:32`                    |
| `%T`         | "%H:%M:%S"に相当（ISO 8601時刻フォーマット）                                                                 | `18:32:07`                 |
| `%p`         | ローカライズされた午前または午後の表記 (ロケール依存)                                                               | `PM`                       |
| `%z`         | UTCからのオフセット（ISO 8601形式、例: -0430）、またはタイムゾーン情報がない場合は文字がありません | `+0800`                    |
| `%Z`         | ロケール依存のタイムゾーン名または略称、またはタイムゾーン情報がない場合は文字がありません     | `Z AWST `                  |

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

ログメッセージをコンソールにのみ出力するには:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個別のログ名のログレベルをオーバーライドできます。例えば、"Backup"と"RBAC"のロガーのすべてのメッセージをミュートするには。

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

ログメッセージをsyslogにも書き込むには:

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

| Key        | Description                                                                                                                                                                                                                                                    |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | `host\[:port\]`形式のsyslogアドレス。省略すると、ローカルデーモンが使用されます。                                                                                                                                                                         |
| `hostname` | ログを送信するホストの名前（オプション）。                                                                                                                                                                                                      |
| `facility` | syslogの[ファシリティキーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。必ず大文字で「LOG_」プレフィックスを付けて指定します。例: `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3`など。デフォルト: 指定された`address`がある場合は `LOG_USER`、それ以外は `LOG_DAEMON`。                                           |
| `format`   | ログメッセージフォーマット。可能な値: `bsd` および `syslog.`                                                                                                                                                                                                       |

**ログフォーマット**

コンソールログに出力するログフォーマットを指定できます。現在、JSONのみがサポートされています。

**例**

出力JSONログの例:

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

JSONログサポートを有効にするには、次のスニペットを使用します:

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

キー名は `<names>` タグ内のタグ値を変更することで修正できます。たとえば、`DATE_TIME` を `MY_DATE_TIME` に変更したい場合は、`<date_time>MY_DATE_TIME</date_time>` を使用します。

**JSONログのキーを省略する**

ログプロパティはそのプロパティをコメントアウトすることで省略できます。たとえば、`query_id` を出力しないようにするには、`<query_id>` タグをコメントアウトします。
## macros {#macros} 

レプリケートされたテーブル用のパラメーター置換。

レプリケートされたテーブルを使用しない場合は省略できます。

詳細については、[レプリケートされたテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)のセクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```
## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />マークキャッシュポリシー名。
## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" /> プリウォーム中に埋めるマークキャッシュの総サイズに対する比率。
## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
マーク（[`MergeTree`](/engines/table-engines/mergetree-family) テーブルファミリーのインデックス）用のキャッシュの最大サイズ。

:::note
この設定はランタイム中に変更でき、即座に効果が現れます。
:::
## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />マークキャッシュ内の保護キュー（SLRUポリシーの場合）のサイズをキャッシュの総サイズに対して示します。
## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" /> 起動時にアクティブなデータパーツセット（アクティブなもの）をロードするためのスレッド数。
## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ユーザーが作成または変更できる認証メソッドの最大数。
この設定を変更しても既存のユーザーには影響しません。この設定で指定された制限を超える認証関連のクエリを作成または変更すると失敗します。
非認証の作成/変更クエリは成功します。

:::note
`0` の値は無制限を意味します。
:::
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべてのバックアップの最大読み取り速度（バイト/秒）。ゼロは無制限を意味します。
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />バックアップIOスレッドプールの**アイドル**スレッドの数が `max_backup_io_thread_pool_free_size` を超えると、ClickHouseはアイドルスレッドが占有していたリソースを解放し、プールサイズを減らします。スレッドは必要に応じて再作成できます。
## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouseはS3バックアップIO操作を行うためにバックアップIOスレッドプールのスレッドを使用します。 `max_backups_io_thread_pool_size` はプール内のスレッドの最大数を制限します。
## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
ベクトルインデックスを構築するための最大スレッド数。

:::note
`0` の値はすべてのコアを意味します。
:::
## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に実行できるINSERTクエリの総数に対する制限。

:::note

`0` （デフォルト）の値は無制限を意味します。

この設定はランタイム中に変更でき、即座に効果が現れます。既に実行中のクエリは変更されません。
:::
## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に実行されるクエリの総数に対する制限。 `INSERT` および `SELECT` クエリの制限、およびユーザー用の最大クエリ数も考慮する必要があります。

他にも:
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

`0` （デフォルト）の値は無制限を意味します。

この設定はランタイム中に変更でき、即座に効果が現れます。既に実行中のクエリは変更されません。
:::
## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に実行されるSELECTクエリの総数に対する制限。

:::note

`0` （デフォルト）の値は無制限を意味します。

この設定はランタイム中に変更でき、即座に効果が現れます。既に実行中のクエリは変更されません。
:::
## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />最大サーバー接続数。
## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />データベースの数がこの値を超えた場合、サーバーは例外をスローします。0は制限なしを意味します。
## max_database_num_to_warn {#max_database_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
接続されているデータベースの数が指定された値を超えた場合、clickhouseサーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```
## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />データベースレプリケーション中にテーブルを作成するためのスレッド数。ゼロはスレッド数がコア数に等しいことを意味します。
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
辞書の数がこの値を超えた場合、サーバーは例外をスローします。

データベースエンジンの場合のみカウント:
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
接続されている辞書の数が指定された値を超えた場合、clickhouseサーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```
## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />集計中に収集されたハッシュテーブル統計が許可されるエントリ数
## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITION用のスレッド数。
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
IOスレッドプールの**アイドル**スレッドの数が `max_io_thread_pool_free_size` を超えると、ClickHouseはアイドルスレッドが占有していたリソースを解放し、プールサイズを減らします。スレッドは必要に応じて再作成できます。
## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouseはS3とやり取りするためのIO操作などを行うためにIOスレッドプールのスレッドを使用します。 `max_io_thread_pool_size` はプール内のスレッドの最大数を制限します。
## max_keep_alive_requests {#max_keep_alive_requests} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
ClickHouseサーバーによって閉じられるまでの単一のキープアライブ接続を通じて最大リクエスト数。

**例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
ローカル読み取りの最大速度（バイト/秒）。

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
テーブルに添付できるマテリアライズドビューの数に対する制限。

:::note
ここで考慮されるのは直接依存しているビューのみで、あるビューの上に別のビューを作成することは考慮されません。
:::
## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべてのマージの最大読み取り速度（バイト/秒）。ゼロは無制限を意味します。
## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべての変更の最大読み取り速度（バイト/秒）。ゼロは無制限を意味します。
## max_open_files {#max_open_files} 

オープンファイルの最大数。

:::note
macOSでは、このオプションを使用することを推奨します。なぜなら、`getrlimit()`関数が不正確な値を返すからです。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```
## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
接続をドロップするために考慮されるOS CPU待機（OSCPUWaitMicrosecondsメトリック）とビジー（OSCPUVirtualTimeMicrosecondsメトリック）時間の最大比率。確率を計算するために最小および最大比率の線形補間が使用され、この時点で確率は1です。
詳細については、[サーバーCPUオーバーロード時の動作制御](/operations/settings/server-overload)を参照してください。
## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />起動時に非アクティブなデータパーツセット（古いもの）をロードするためのスレッド数。
## max_part_num_to_warn {#max_part_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="100000" />
アクティブパーツの数が指定された値を超えた場合、clickhouseサーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```
## max_partition_size_to_drop {#max_partition_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
パーティションをドロップする制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのサイズが[`max_partition_size_to_drop`](#max_partition_size_to_drop)（バイト単位）を超えると、[DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart)クエリを使用してパーティションをドロップできません。
この設定はClickHouseサーバーを再起動する必要はありません。制限を無効にする別の方法は、`<clickhouse-path>/flags/force_drop_table`ファイルを作成することです。

:::note
値`0` は、制限なしでパーティションをドロップできることを意味します。

この制限はテーブルのドロップやトランケートには制限をかけません。詳細については、[max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)を参照してください。
:::

**例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```
## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />非アクティブなデータパーツを同時に削除するためのスレッド数。
## max_pending_mutations_execution_time_to_warn {#max_pending_mutations_execution_time_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
保留中の変更が指定された値を秒で超えた場合、clickhouseサーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```
## max_pending_mutations_to_warn {#max_pending_mutations_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="500" />
保留中の変更の数が指定された値を超えた場合、clickhouseサーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```
## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
プレフィックスデシリアライズのスレッドプール内の**アイドル**スレッドの数が `max_prefixes_deserialization_thread_pool_free_size` を超えると、ClickHouseはアイドルスレッドが占有していたリソースを解放し、プールサイズを減らします。スレッドは必要に応じて再作成できます。
## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouseはMergeTreeのワイドパーツからファイルプレフィックスのメタデータを並行して読み取るためにプレフィックスデシリアライズのスレッドプールのスレッドを使用します。 `max_prefixes_deserialization_thread_pool_size` はプール内のスレッドの最大数を制限します。
## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
リモート読み取りの最大ネットワークデータ転送速度（バイト/秒）。

:::note
`0` （デフォルト）の値は無制限を意味します。
:::
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
リモート書き込みの最大ネットワークデータ転送速度（バイト/秒）。

:::note
`0` （デフォルト）の値は無制限を意味します。
:::
## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケートされた取得のためのネットワークデータ転送速度の最大値（バイト/秒）。ゼロは無制限を意味します。
## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケートされた送信のためのネットワークデータ転送速度の最大値（バイト/秒）。ゼロは無制限を意味します。
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
レプリケートされたテーブルの数がこの値を超えた場合、サーバーは例外をスローします。

データベースエンジンの場合のみカウント:
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
サーバーが使用できる最大メモリ量（バイト単位）。

:::note
サーバーの最大メモリ消費量は、`max_server_memory_usage_to_ram_ratio`の設定によってさらに制限されます。
:::

特殊なケースとして、`0`（デフォルト）の値はサーバーが利用可能なすべてのメモリを消費できることを意味します（`max_server_memory_usage_to_ram_ratio` による制限を除く）。
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />
サーバーが使用できる最大メモリ量を、すべての使用可能なメモリに対する比率として示します。

例えば、`0.9`（デフォルト）の値は、サーバーが使用可能なメモリの90%を消費できることを意味します。

低メモリシステムでのメモリ使用量を減らすことができます。
RAMとスワップが少ないホストでは、[`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio)を1より大きく設定する必要があるかもしれません。

:::note
サーバーの最大メモリ消費量は、`max_server_memory_usage`によってさらに制限されます。
:::
## max_session_timeout {#max_session_timeout} 

最大セッションタイムアウト（秒）。

例:

```xml
<max_session_timeout>3600</max_session_timeout>
```
```
## max_table_num_to_throw {#max_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
テーブルの数がこの値を超える場合、サーバーは例外を投げます。

以下のテーブルはカウントされません：
- view
- remote
- dictionary
- system

データベースエンジンに対してのみテーブルをカウントします：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0`の値は制限なしを意味します。
:::

**例**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```
## max_table_num_to_warn {#max_table_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="5000" />
添付されたテーブルの数が指定された値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```
## max_table_size_to_drop {#max_table_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
テーブルを削除する制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが`max_table_size_to_drop`（バイト単位）を超える場合、[`DROP`](../../sql-reference/statements/drop.md) クエリまたは [`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリを使用して削除することはできません。

:::note
`0`の値は全てのテーブルを制限なしで削除できることを意味します。

この設定はClickHouseサーバーの再起動を必要とせずに適用されます。制限を無効にする別の方法は、`<clickhouse-path>/flags/force_drop_table`ファイルを作成することです。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
外部集計、結合、またはソートに使用できる最大ストレージ量。
この制限を超えるクエリは例外で失敗します。

:::note
`0`の値は無制限を意味します。
:::

参照：
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)
## max_thread_pool_free_size {#max_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
グローバルスレッドプール内の**アイドル**スレッドの数が[`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size)を超えると、ClickHouseは一部のスレッドが占有しているリソースを解放し、プールサイズを減少させます。必要に応じてスレッドを再作成できます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```
## max_thread_pool_size {#max_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
ClickHouseはクエリを処理するためにグローバルスレッドプールからスレッドを使用します。クエリを処理するためのアイドルスレッドがない場合、プールに新しいスレッドが作成されます。`max_thread_pool_size`はプール内のスレッドの最大数を制限します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```
## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />起動時に非アクティブなデータパーツ（予期しないもの）をロードするためのスレッド数。
## max_view_num_to_throw {#max_view_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
ビューの数がこの値を超える場合、サーバーは例外を投げます。

データベースエンジンに対してのみテーブルをカウントします：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0`の値は制限なしを意味します。
:::

**例**
```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```
## max_view_num_to_warn {#max_view_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
添付されたビューの数が指定された値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```
## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に待機するクエリの総数の制限。
待機クエリの実行は、必要なテーブルが非同期で読み込まれている間にブロックされます（[`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)を参照）。

:::note
待機クエリは、以下の設定によって制御された制限がチェックされるときにはカウントされません：

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

この修正は、サーバー起動後にこれらの制限に達するのを避けるために行われます。
:::

:::note

`0`（デフォルト）の値は無制限を意味します。

この設定はランタイムで変更可能であり、即座に効果を発揮します。既に実行中のクエリは変更されません。
:::
## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />
バックグラウンドメモリワーカーがjemallocやcgroupsなどの外部ソースの情報に基づいて内部メモリトラッカーを修正すべきかどうか。
## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />
バックグラウンドメモリワーカーのティック周期。これはメモリトラッカーのメモリ使用量を修正し、高いメモリ使用時に未使用ページをクリーンアップします。0に設定されている場合は、メモリ使用のソースに応じてデフォルト値が使用されます。
## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />現在のcgroupメモリ使用情報を使用してメモリトラッキングを修正します。
## merge_tree {#merge_tree} 

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)のテーブルに対する詳細設定。

詳細は、MergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />
マージと他のワークロードの間でリソースの利用と共有を調整するために使用されます。指定された値は、全てのバックグラウンドマージの`workload`設定値として使用されます。マージツリー設定によって上書きすることができます。

**参照**
- [Workload Scheduling](/operations/workload-scheduling.md)
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />
マージおよびミューテーション操作に使用することが許可されているRAMの制限を設定します。
ClickHouseが設定された制限に達した場合、新しいバックグラウンドマージまたはミューテーション操作をスケジュールしなくなりますが、すでにスケジュールされたタスクは実行し続けます。

:::note
`0`の値は無制限を意味します。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```
## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />
デフォルトの`merges_mutations_memory_usage_soft_limit`値は`memory_amount * merges_mutations_memory_usage_to_ram_ratio`として計算されます。

**参照：**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)
## metric_log {#metric_log} 

デフォルトでは無効になっています。

**有効化**

メトリクス履歴収集[`system.metric_log`](../../operations/system-tables/metric_log.md)を手動でオンにするには、次の内容で`/etc/clickhouse-server/config.d/metric_log.xml`を作成してください：

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

`metric_log`設定を無効にするには、次の内容で`/etc/clickhouse-server/config.d/disable_metric_log.xml`というファイルを作成してください：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
接続を切断することを検討するためのOS CPU待機（OSCPUWaitMicrosecondsメトリック）とビジー（OSCPUVirtualTimeMicrosecondsメトリック）時間の間の最小比率。最小値と最大値の間でリニア補間が使用され、確率はこのポイントで0です。
[サーバーのCPUオーバーロード時の動作制御](/operations/settings/server-overload)の詳細を参照してください。
## mlock_executable {#mlock_executable} 

起動後に`mlockall`を実行して、最初のクエリのレイテンシを低下させ、高IO負荷下でClickHouse実行可能ファイルがページアウトされるのを防ぎます。

:::note
このオプションを有効にすることは推奨されますが、起動時間が数秒延びることになります。
この設定は、「CAP_IPC_LOCK」権限がないと機能しません。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```
## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />
マッピングファイルのキャッシュサイズ（バイト単位）を設定します。この設定は、頻繁なオープン/クローズコールを回避することを可能にし（結果としてページフォールトが非常に高価になるため）、複数のスレッドやクエリからのマッピングを再利用します。設定値はマッピングされたリージョンの数（通常はマッピングされたファイルの数に等しい）です。

マッピングファイル内のデータ量は、次のシステムテーブルで次のメトリックを使用して監視できます：

| システムテーブル                                                                                                                                                                                                                                                                                                                                                       | メトリック                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) および [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                                   | `MMappedFiles` および `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                                      | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)  | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
マッピングファイル内のデータ量は直接メモリを消費せず、クエリやサーバーのメモリ使用量にはカウントされません。なぜなら、このメモリはOSページキャッシュのように破棄可能だからです。キャッシュは、MergeTreeファミリーのテーブル内の古いパーツが削除されるときに自動的に削除されるか、`SYSTEM DROP MMAP CACHE`クエリによって手動で削除できます。

この設定はランタイムで変更可能であり、即座に効果を発揮します。
:::
## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />
ミューテーションと他のワークロードの間でリソースの利用と共有を調整するために使用されます。指定された値は、全てのバックグラウンドミューテーションの`workload`設定値として使用されます。マージツリー設定によって上書きすることができます。

**参照**
- [Workload Scheduling](/operations/workload-scheduling.md)
## mysql_port {#mysql_port} 

MySQLプロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します
- 空の値は、MySQLプロトコルを介したクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<mysql_port>9004</mysql_port>
```
## openSSL {#openssl} 

SSLクライアント/サーバー設定。

SSLのサポートは`libpoco`ライブラリによって提供されます。利用可能な構成オプションは、[SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)で説明されています。デフォルト値は、[SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp)に記載されています。

サーバー/クライアント設定のキー：

| オプション                        | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                            | デフォルト値                              |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | PEM証明書の秘密鍵を含むファイルへのパス。そのファイルには、鍵と証明書が同時に含まれることがあります。                                                                                                                                                                                                                                                                                                                                              |                                            |
| `certificateFile`             | PEM形式のクライアント/サーバー証明書ファイルへのパス。`privateKeyFile`に証明書が含まれている場合は省略できます。                                                                                                                                                                                                                                                                                                                                                |                                            |
| `caConfig`                    | 信頼されたCA証明書を含むファイルまたはディレクトリへのパス。このパスがファイルを指す場合、PEM形式であり、複数のCA証明書を含むことができます。このパスがディレクトリを指す場合は、CA証明書ごとに1つの.pemファイルが必要です。ファイル名はCAのサブジェクト名のハッシュ値で検索されます。詳細は、[SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html)のmanページで見つけることができます。 |                                            |
| `verificationMode`            | ノードの証明書を確認するための方法。詳細は[Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h)クラスの説明にあります。可能な値：`none`、`relaxed`、`strict`、`once`。                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | 検証チェーンの最大長。検証は、証明書チェーンの長さが設定値を超えた場合に失敗します。                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | OpenSSL用の組み込みCA証明書を使用するかどうか。ClickHouseは、組み込みCA証明書が`/etc/ssl/cert.pem`（またはディレクトリ`/etc/ssl/certs`）にあるか、環境変数`SSL_CERT_FILE`（または`SSL_CERT_DIR`）で指定されたファイル（またはディレクトリ）にあると仮定します。                                                                                                                                                                        | `true`                                     |
| `cipherList`                  | サポートされているOpenSSL暗号化。                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | セッションのキャッシングを有効または無効にします。必ず`sessionIdContext`と組み合わせて使用してください。受け入れ可能な値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`            | サーバーが生成する各識別子を付加する一意のランダム文字列のセット。文字列の長さは`SSL_MAX_SSL_SESSION_ID_LENGTH`を超えてはいけません。このパラメータは、セッションのキャッシュに問題を避けるために常に推奨されます。                                                                                                                                                        | `$\{application.name\}`                      |
| `sessionCacheSize`            | サーバーがキャッシュするセッションの最大数。`0`の値は無制限のセッションを意味します。                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | サーバー上でセッションをキャッシュするための時間（時間単位）。                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | 有効にされた場合、証明書のCNまたはSANがピアのホスト名と一致することを検証します。                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | TLSv1接続を要求します。受け入れ可能な値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | TLSv1.1接続を要求します。受け入れ可能な値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | TLSv1.2接続を要求します。受け入れ可能な値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | OpenSSLのFIPSモードをアクティブ化します。ライブラリのOpenSSLバージョンがFIPSをサポートしている場合に限ります。                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandlerのサブクラス）。例：`<privateKeyPassphraseHandler>`、`<name>KeyFileHandler</name>`、`<options><password>test</password></options>`、`</privateKeyPassphraseHandler>`。                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するためのクラス（CertificateHandlerのサブクラス）。例：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`。                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
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
        <!-- 自己署名の使用：<verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 自己署名の使用：<name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```
## opentelemetry_span_log {#opentelemetry_span_log} 

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md)システムテーブルのための設定。

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

<SettingsInfoBlock type="UInt64" default_value="1000000" />CPUが有用な作業を行っているとみなすためのOS CPUビジー時間の閾値（OSCPUVirtualTimeMicrosecondsメトリック）。ビジー時間がこの値未満の場合、CPUオーバーロードとはみなされません。
## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />ユーザースペースページキャッシュから無効にしておくメモリ制限の割合。Linuxのmin_free_kbytes設定に類似しています。
## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ユーザースペースページキャッシュによって使用されるまでの待機時間。
## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />ユーザースペースページキャッシュの最大サイズ。0に設定するとキャッシュが無効になります。page_cache_min_sizeを超える場合、キャッシュサイズはこの範囲内で継続的に調整され、総メモリ使用量が制限（max_server_memory_usage[_to_ram_ratio]）を下回るようにしながら利用可能なメモリをできる限り使用します。
## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />ユーザースペースページキャッシュの最小サイズ。
## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ユーザースペースページキャッシュポリシーの名前。
## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />この数のシャードでユーザースペースページキャッシュをストライプし、ミューテックスの競合を減らします。実験的であり、パフォーマンスが改善される可能性は低いです。
## page_cache_size_ratio {#page_cache_size_ratio}

<SettingsInfoBlock type="Double" default_value="0.5" />ユーザースペースのページキャッシュ内の保護されたキューのサイズはキャッシュの総サイズに対して相対的です。

## part_log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) に関連するログイベント。例えば、データの追加やマージです。ログを使用してマージアルゴリズムをシミュレーションし、それらの特性を比較することができます。マージプロセスを視覚化できます。

クエリは [system.part_log](/operations/system-tables/part_log) テーブルにログされ、別のファイルには記録されません。このテーブルの名前は `table` パラメータで構成できます（下記参照）。

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
SharedMergeTree のパーツを完全に削除するまでの期間。ClickHouse Cloud でのみ利用可能です。

## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add}

<SettingsInfoBlock type="UInt64" default_value="10" />
kill_delay_period に0からx秒の均等に分布した値を追加して、非常に多くのテーブルがある場合の雷鳴のような効果とZooKeeperの後続のDoSを回避します。ClickHouse Cloud でのみ利用可能です。

## parts_killer_pool_size {#parts_killer_pool_size}

<SettingsInfoBlock type="UInt64" default_value="128" />
共有マージツリーの時代のクリーンアップ用のスレッド。ClickHouse Cloud でのみ利用可能です。

## path {#path}

データを含むディレクトリへのパス。

:::note
後ろのスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
```

## postgresql_port {#postgresql_port}

PostgreSQLプロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します
- 空の値は、MySQLプロトコルを介してクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```

## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size}

<SettingsInfoBlock type="UInt64" default_value="100" />リモートオブジェクトストレージのためのプレフェッチ用のバックグラウンドプールのサイズ。

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size}

<SettingsInfoBlock type="UInt64" default_value="1000000" />プレフェッチプールにプッシュ可能なタスクの数。

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />
プレフィックスデシリアライズスレッドプールにスケジュールできる最大のジョブ数。

:::note
値が `0` の場合、制限はありません。
:::

## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup}

<SettingsInfoBlock type="Bool" default_value="0" />
trueの場合、ClickHouseは起動前にすべての構成された `system.*_log` テーブルを作成します。これは、特定の起動スクリプトがこれらのテーブルに依存している場合に便利です。

## primary_index_cache_policy {#primary_index_cache_policy}

<SettingsInfoBlock type="String" default_value="SLRU" />主インデックスキャッシュポリシーの名前。

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio}

<SettingsInfoBlock type="Double" default_value="0.95" />プレウォーム中に満たすマークキャッシュの総サイズに対する比率。

## primary_index_cache_size {#primary_index_cache_size}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />主キーインデックス（MergeTreeファミリーのテーブルのインデックス）用の最大キャッシュサイズ。

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio}

<SettingsInfoBlock type="Double" default_value="0.5" />主インデックスキャッシュ内の保護されたキューのサイズ（SLRUポリシーの場合）はキャッシュの総サイズに対して相対的です。

## process_query_plan_packet {#process_query_plan_packet}

<SettingsInfoBlock type="Bool" default_value="0" />
この設定により、QueryPlanパケットを読み取ることができます。このパケットは、serialize_query_planが有効になっている場合の分散クエリに送信されます。
セキュリティ上の問題が発生する可能性があるため、クエリプランのバイナリデシリアライズにバグがある場合は無効にすることをお勧めします。

**例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```

## processors_profile_log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) システムテーブルの設定。

<SystemLogParameters/>

デフォルトの設定は次のとおりです。

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

[Prometheus](https://prometheus.io)からのスクレイピングデータを公開します。

設定：

- `endpoint` - prometheusサーバによるメトリクスのスクレイピングのためのHTTPエンドポイント。 '/' から始まります。
- `port` - `endpoint`のためのポート。
- `metrics` - [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開します。
- `events` - [system.events](/operations/system-tables/events) テーブルからメトリクスを公開します。
- `asynchronous_metrics` - [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開します。
- `errors` - 最後のサーバの再起動以来発生した各エラーコードによるエラーの数を公開します。この情報は、[system.errors](/operations/system-tables/errors) からも取得できます。

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

チェック（`127.0.0.1` を ClickHouse サーバの IP アドレスまたはホスト名に置き換えます）：
```bash
curl 127.0.0.1:9363/metrics
```

## proxy {#proxy}

HTTPおよびHTTPSリクエスト用のプロキシサーバを定義します。現在、S3ストレージ、S3テーブル関数、URL関数でサポートされています。

プロキシサーバを定義する方法は3つあります：
- 環境変数
- プロキシリスト
- リモートプロキシリゾルバ

特定のホスト用にプロキシサーバをバイパスすることも、`no_proxy`を使用することでサポートされています。

**環境変数**

`http_proxy` および `https_proxy` 環境変数は、指定されたプロトコル用のプロキシサーバを指定することを可能にします。システムに設定があれば、シームレスに機能するはずです。

特定のプロトコルに対してプロキシサーバが1つしかない場合、またそのプロキシサーバが変更されない場合、このアプローチが最も簡単です。

**プロキシリスト**

このアプローチでは、プロトコル用の1つ以上のプロキシサーバを指定することができます。複数のプロキシサーバが定義されている場合、ClickHouseはサーバ間で負荷を均等に分配し、ラウンドロビン方式で異なるプロキシを使用します。このアプローチは、プロトコルに対して複数のプロキシサーバがあり、プロキシサーバのリストが変更されない場合に最も簡単です。

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

以下のタブで親フィールドを選択すると、その子要素が表示されます：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド     | 説明                                         |
|-----------|---------------------------------------------|
| `<http>`  | 1つ以上のHTTPプロキシのリスト                |
| `<https>` | 1つ以上のHTTPSプロキシのリスト               |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド   | 説明                  |
|---------|----------------------|
| `<uri>` | プロキシのURI         |

  </TabItem>
</Tabs>

**リモートプロキシリゾルバ**

プロキシサーバが動的に変更される可能性があります。その場合、リゾルバのエンドポイントを定義できます。ClickHouseはそのエンドポイントに空のGETリクエストを送り、リモートリゾルバはプロキシホストを返す必要があります。ClickHouseは次のテンプレートを使用してプロキシURIを形成します： `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

以下のタブで親フィールドを選択すると、その子要素が表示されます：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド    | 説明                      |
|----------|--------------------------|
| `<http>` | 1つ以上のリゾルバのリスト* |
| `<https>` | 1つ以上のリゾルバのリスト* |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド       | 説明                                    |
|-------------|---------------------------------------|
| `<resolver>` | リゾルバのためのエンドポイントとその他の詳細 |

:::note
複数の `<resolver>` 要素を持つことができますが、指定されたプロトコルについて最初の `<resolver>` のみが使用されます。それ以外の `<resolver>` 要素は無視されます。これは、負荷分散（必要に応じて）がリモートリゾルバによって実装されるべきであることを意味します。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| フィールド               | 説明                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | プロキシリゾルバのURI                                                                                                          |
| `<proxy_scheme>`    | 最終プロキシURIのプロトコル。`http`または`https`のいずれかです。                                                              |
| `<proxy_port>`      | プロキシリゾルバのポート番号                                                                                                   |
| `<proxy_cache_time>` | リゾルバからの値をClickHouseがキャッシュすべき時間（秒単位）。この値を`0`に設定すると、ClickHouseはすべてのHTTPまたはHTTPSリクエストに対してリゾルバに連絡します。 |

  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決定されます。

| 順序 | 設定                |
|-------|------------------------|
| 1.    | リモートプロキシリゾルバ |
| 2.    | プロキシリスト            |
| 3.    | 環境変数                  |

ClickHouseはリクエストプロトコルに最も優先度の高いリゾルバタイプを確認します。定義されていない場合は、次に優先度の高いリゾルバタイプを確認し、環境リゾルバに到達するまで続けます。これにより、リゾルバタイプの混合も可能です。

## query_cache {#query_cache}

[クエリキャッシュ](../query-cache.md)の設定。

次の設定が利用可能です。

| 設定                   | 説明                                                                                | デフォルト値     |
|---------------------------|----------------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | 最大キャッシュサイズ（バイト単位）。 `0` はクエリキャッシュが無効であることを意味します。      | `1073741824`  |
| `max_entries`             | キャッシュに格納される `SELECT` クエリ結果の最大数。                                    | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存される可能性のある `SELECT` クエリ結果の最大サイズ（バイト単位）。           | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存される可能性のある `SELECT` クエリ結果の最大行数。                       | `30000000`    |

:::note
- 設定を変更すると、即座に効果が現れます。
- クエリキャッシュのデータはDRAMに割り当てられます。メモリが不足している場合、`max_size_in_bytes`に小さな値を設定するか、クエリキャッシュ全体を無効にしてください。
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
この設定はランタイムで変更可能で、すぐに効果が現れます。
:::

## query_condition_cache_size_ratio {#query_condition_cache_size_ratio}

<SettingsInfoBlock type="Double" default_value="0.5" />クエリ条件キャッシュ内の保護されたキューのサイズ（SLRUポリシーの場合）はキャッシュの総サイズに対して相対的です。

## query_log {#query_log}

[log_queries=1](../../operations/settings/settings.md) 設定で受信したクエリをログするための設定。

クエリは [system.query_log](/operations/system-tables/query_log) テーブルにログされ、別のファイルには記録されません。このテーブルの名前は `table` パラメータで変更できます（下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバが更新されたときにクエリログの構造が変更された場合、古い構造を持つテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

クエリおよびすべてのログメッセージに適用される正規表現ベースのルールで、サーバーログ、[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブル、およびクライアントに送信されるログに保存されます。これにより、SQLクエリから名前、電子メール、個人識別子、クレジットカード番号などの機密データの漏洩を防ぐことができます。

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

**設定フィールド**：

| 設定     | 説明                                                                                     |
|-----------|-----------------------------------------------------------------------------------------|
| `name`    | ルールの名前（オプション）                                                               |
| `regexp`  | RE2互換の正規表現（必須）                                                               |
| `replace` | 機密データの置換文字列（オプション。デフォルトは六つのアスタリスク）                              |

マスキングルールはクエリ全体に適用され（感情的/解析不可能なクエリから機密データが漏れないように）、[`system.events`](/operations/system-tables/events) テーブルには、クエリマスキングルール一致数を示すカウンター `QueryMaskingRulesMatch` があります。

分散クエリの場合、各サーバは個別に設定する必要があります。さもなければ、他のノードに渡されたサブクエリはマスキングなしで保存されます。

## query_metric_log {#query_metric_log}

デフォルトでは無効です。

**有効化**

手動でメトリクス履歴収集を有効にするには、[`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)、次の内容の `/etc/clickhouse-server/config.d/query_metric_log.xml` を作成します。

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

`query_metric_log` 設定を無効にするには、次の内容のファイル `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` を作成する必要があります。

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## query_thread_log {#query_thread_log}

[log_query_threads=1](/operations/settings/settings#log_query_threads) 設定で受信したクエリスレッドをログするための設定。

クエリは [system.query_thread_log](/operations/system-tables/query_thread_log) テーブルにログされ、別のファイルには記録されません。このテーブルの名前は `table` パラメータで変更できます（下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバが更新されたときにクエリスレッドログの構造が変更された場合、古い構造を持つテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

[log_query_views=1](/operations/settings/settings#log_query_views) 設定で受信したクエリに依存するビュー（ライブ、マテリアライズなど）をログするための設定。

クエリは [system.query_views_log](/operations/system-tables/query_views_log) テーブルにログされ、別のファイルには記録されません。このテーブルの名前は `table` パラメータで変更できます（下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバが更新されたときにクエリビューのログの構造が変更された場合、古い構造を持つテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

巨大なページを使用して機械コード（"テキスト"）のメモリを再割り当てする設定。

:::note
この機能は非常に実験的です。
:::

**例**

```xml
<remap_executable>false</remap_executable>
```

## remote_servers {#remote_servers}

[分散](../../engines/table-engines/special/distributed.md) テーブルエンジンおよび `cluster` テーブル関数で使用されるクラスターの設定。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性の値については、"[設定ファイル](/operations/configuration-files)" セクションを参照してください。

**関連する内容**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [クラスターの発見](../../operations/cluster-discovery.md)
- [レプリケートデータベースエンジン](../../engines/database-engines/replicated.md)

## remote_url_allow_hosts {#remote_url_allow_hosts}

URL関連のストレージエンジンとテーブル関数で使用を許可されているホストのリスト。

`\<host\>` xml タグでホストを追加する際は：
- URL と同じように正確に指定する必要があります。名前はDNS解決の前にチェックされます。たとえば： `<host>clickhouse.com</host>`
- ポートがURLで明示的に指定されている場合、ホスト:ポートが全体としてチェックされます。たとえば： `<host>clickhouse.com:80</host>`
- ポートなしでホストが指定されている場合は、ホストの任意のポートが許可されます。たとえば、`<host>clickhouse.com</host>` が指定されている場合、`clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) などが許可されます。
- ホストがIPアドレスとして指定されている場合は、URLに指定された通りにチェックされます。たとえば：[2a02:6b8:a::a]。
- リダイレクトがあり、リダイレクトのサポートが有効になっている場合、すべてのリダイレクト（locationフィールド）がチェックされます。

例えば：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## replica_group_name {#replica_group_name}

レプリケートデータベースのレプリカグループ名。

レプリケートデータベースによって作成されたクラスターは、同じグループ内のレプリカで構成されます。
DDLクエリは、同じグループ内のレプリカを待機します。

デフォルトでは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

<SettingsInfoBlock type="Seconds" default_value="0" />パートフェッチリクエスト用のHTTP接続のタイムアウト。明示的に設定されていない場合、デフォルトプロファイルの `http_connection_timeout` から継承されます。

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout}

<SettingsInfoBlock type="Seconds" default_value="0" />パートフェッチリクエスト用のHTTP受信タイムアウト。明示的に設定されていない場合、デフォルトプロファイルの `http_receive_timeout` から継承されます。

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout}

<SettingsInfoBlock type="Seconds" default_value="0" />パートフェッチリクエスト用のHTTP送信タイムアウト。明示的に設定されていない場合、デフォルトプロファイルの `http_send_timeout` から継承されます。

## replicated_merge_tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの微調整。この設定にはより高い優先順位があります。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```

## restore_threads {#restore_threads}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />RESTOREリクエストを実行するためのスレッドの最大数。

## s3queue_log {#s3queue_log}

`s3queue_log` システムテーブルの設定。

<SystemLogParameters/>

デフォルトの設定は次のとおりです。

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```

## send_crash_reports {#send_crash_reports}

ClickHouse コア開発者チームへのクラッシュレポート送信の設定。

特にプレプロダクション環境での有効化は非常に感謝されます。

キー：

| キー                   | 説明                                                                                                                          |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | この機能を有効にするためのブールフラグ。デフォルトは `true`。クラッシュレポートを送信しないには `false` に設定します。                    |
| `send_logical_errors` | `LOGICAL_ERROR` は `assert` のようなもので、ClickHouseのバグです。このブールフラグはこの例外を送信することを有効にします（デフォルト：`true`）。 |
| `endpoint`            | クラッシュレポート送信のためのエンドポイントURLを上書きできます。                                                                     |

**推奨利用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## series_keeper_path {#series_keeper_path}

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />
`generateSerialID` 関数によって生成された自動インクリメント番号を持つKeeper内のパス。各シリーズはこのパスの下にノードになります。

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

<SettingsInfoBlock type="Bool" default_value="1" />trueに設定されている場合、スタックトレースにアドレスを表示します。

## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores}

<SettingsInfoBlock type="Bool" default_value="1" />trueに設定されている場合、ClickHouseはシャットダウンする前に実行中のバックアップと復元を完了するまで待機します。

## shutdown_wait_unfinished {#shutdown_wait_unfinished}

<SettingsInfoBlock type="UInt64" default_value="5" />未完成のクエリを待機するための遅延（秒）。

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

<SettingsInfoBlock type="Bool" default_value="0" />trueに設定されている場合、ClickHouseはシャットダウンする前に実行中のクエリが終了するまで待機します。

## ssh_server {#ssh_server}

ホスト鍵の公開部分は、最初の接続時にSSHクライアント側のknown_hostsファイルに書き込まれます。

ホスト鍵設定はデフォルトでは無効です。
ホスト鍵設定のコメントを解除し、関連するssh鍵へのパスを提供して有効にします。

**例**

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## startup_mv_delay_ms {#startup_mv_delay_ms}

<SettingsInfoBlock type="UInt64" default_value="0" />マテリアライズドビュー作成遅延をシミュレートするためのデバッグパラメータ。

## storage_configuration {#storage_configuration}

ストレージのマルチディスク設定を可能にします。

ストレージ設定は次の構造に従います。

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

### ディスクの設定 {#configuration-of-disks}

`disks` の設定は、以下の構造に従います。

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

上記のサブタグは、`disks` に対する次の設定を定義します：

| 設定                 | 説明                                                                                                      |
|-------------------------|----------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | ユニークである必要があるディスクの名前。                                                                    |
| `path`                  | サーバデータが保存されるパス（`data` および `shadow` カタログ）。スラッシュで終了する必要があります。 |
| `keep_free_space_bytes` | ディスク上に保留するための自由なスペースのサイズ。                                                       |

:::note
ディスクの順序は重要ではありません。
:::
### ポリシーの設定 {#configuration-of-policies}

上記のサブタグは `policies` の以下の設定を定義します：

| 設定                         | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシーの名前。ポリシー名は一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `volume_name_N`              | ボリューム名。ボリューム名は一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `disk`                       | ボリューム内にあるディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `max_data_part_size_bytes`   | このボリューム内のディスクのいずれかに存在できるデータチャンクの最大サイズ。マージの結果、チャンクサイズが max_data_part_size_bytes より大きくなることが予想される場合、チャンクは次のボリュームに書き込まれます。基本的にこの機能により、新しい/小さなチャンクをホット（SSD）ボリュームに格納し、大きなサイズに達した際にそれらをコールド（HDD）ボリュームに移動できます。このオプションはポリシーにボリュームが1つだけの場合には使用しないでください。                                                                                  |
| `move_factor`                | ボリュームの利用可能な空きスペースの割合。スペースが減少した場合、次のボリュームへのデータ転送が始まります。転送のために、チャンクは大きい順にソートされ、`move_factor` 条件を満たす総サイズのチャンクが選択されます。すべてのチャンクの合計サイズが不十分な場合、すべてのチャンクが移動されます。                                                                                                                                                                                 |
| `perform_ttl_move_on_insert` | 挿入時に期限切れの TTL を持つデータを移動しないようにします。デフォルト（有効な場合）は、TTL に従って既に期限切れのデータを挿入すると、それはすぐに移動ルールで指定されたボリューム/ディスクに移動されます。この場合、ターゲットボリューム/ディスクが遅い（例：S3）と、挿入が大幅に遅くなる可能性があります。無効にすると、期限切れのデータ部分はデフォルトのボリュームに書き込まれ、その後すぐに期限切れの TTL に対して指定されたボリュームに移動されます。 |
| `load_balancing`             | ディスクのバランスポリシー。`round_robin` または `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `least_used_ttl_ms`          | すべてのディスクの利用可能なスペースを更新するためのタイムアウト（ミリ秒単位）。`0` は常に更新、`-1` は決して更新しないことを意味します。デフォルト値は `60000` です。ディスクが ClickHouse のみで使用され、ファイルシステムが動的にサイズ変更されることがない場合は、`-1` の値を使用できます。他の場合には推奨されません。最終的に不正確なスペース割り当てにつながる可能性があるためです。                                                                                   |
| `prefer_not_to_merge`        | このボリュームのデータ部分のマージを無効にします。この設定は潜在的に有害であり、遅延を引き起こす可能性があります。この設定が有効になると（こうするべきではありません）、このボリュームでのデータのマージが禁止され、ClickHouse が遅いディスクとどのようにインタラクトするかを制御します。この設定は基本的に使用しないことをお勧めします。                                                                                                           |
| `volume_priority`            | ボリュームが満たされる優先順位（順序）を定義します。値が小さいほど優先順位が高くなります。パラメータの値は自然数で、1からNまで（Nは指定された最大パラメータ値）の範囲をカバーし、ギャップを持ってはいけません。                                                                                                                                                                                                                                                      |

`volume_priority` の場合:
- すべてのボリュームがこのパラメータを持っている場合、指定された順序で優先されます。
- 一部のボリュームのみがこのパラメータを持つ場合、持たないボリュームは最低の優先順位になります。持っているボリュームはタグの値に従って優先され、残りのボリュームの優先順位は設定ファイル内の相対的な記述の順序によって決まります。
- ボリュームがこのパラメータを持たない場合、その順序は設定ファイルにおける記述の順序によって決まります。
- ボリュームの優先度は同一であってはならない場合があります。
## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この制限を超える接続は、著しく短い寿命を持ちます。この制限はストレージの接続に適用されます。
## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限を超える接続は、使用後にリセットされます。接続キャッシュを無効にするには `0` に設定します。この制限はストレージの接続に適用されます。
## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />使用中の接続数がこの制限を超えると警告メッセージがログに記録されます。この制限はストレージの接続に適用されます。
## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="0" />VERSION_FULL_OBJECT_KEY 形式のディスクメタデータファイルを書き込みます。
## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />有効にすると、SharedSet および SharedJoin の作成中に内部 UUID が生成されます。ClickHouse Cloud のみ対象です。
## table_engines_require_grant {#table_engines_require_grant} 

true に設定すると、特定のエンジンを使用してテーブルを作成するにはユーザーに権限が必要になります。例：`GRANT TABLE ENGINE ON TinyLog to user`。

:::note
デフォルトでは、後方互換性のために特定のテーブルエンジンでテーブルを作成することは権限を無視しますが、これを true に設定することでこの動作を変更できます。
:::
## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
バックグラウンドプールで非同期ロードジョブを実行するスレッドの数を設定します。バックグラウンドプールは、サーバーが起動した後、テーブルを待機しているクエリがない場合に、テーブルを非同期にロードするために使用されます。テーブルの数が多い場合、バックグラウンドプールのスレッド数を少なく保つと、同時クエリの実行のために CPU リソースが予約されることがあります。

:::note
`0` の値は、すべての利用可能な CPU が使用されることを意味します。
:::
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
フォアグラウンドプールでロードジョブを実行するスレッドの数を設定します。フォアグラウンドプールは、サーバーがポートでリッスンを開始する前にテーブルを同期的にロードしたり、待機しているテーブルをロードするために使用されます。フォアグラウンドプールはバックグラウンドプールよりも優先度が高いため、フォアグラウンドプールで実行中のジョブがある間は、バックグラウンドプールでジョブは開始されません。

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

クライアントとの安全な通信のための TCP ポート。 [OpenSSL](#openssl) 設定と共に使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## tcp_ssh_port {#tcp_ssh_port} 

埋め込みクライアントを使用してインタラクティブにクエリを実行するためにユーザーが接続できる SSH サーバーのポート。

例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## temporary_data_in_cache {#temporary_data_in_cache} 

このオプションを使用すると、一時データは特定のディスクのキャッシュに保存されます。
このセクションでは、`cache` タイプのディスク名を指定する必要があります。その場合、キャッシュと一時データは同じスペースを共有し、ディスクキャッシュは一時データを作成するために追い出される可能性があります。

:::note
`tmp_path` 、`tmp_policy` 、 `temporary_data_in_cache` のいずれか1つのオプションのみを使用して、一時データストレージを構成できます。
:::

**例**

`local_disk` のキャッシュと一時データは、`tiny_local_cache` によって管理されるファイルシステム上の `/tiny_local_cache` に保存されます。

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

テキストメッセージをログ記録するための [text_log](/operations/system-tables/text_log) システムテーブルの設定。

<SystemLogParameters/>

さらに：

| 設定   | 説明                                                                                                                                                                                                                                                                | デフォルト値       |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `level` | テーブルに保存される最大メッセージレベル（デフォルトは `Trace`）。                                                                                                                                                                                                     | `Trace`             |

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
グローバルスレッドプールにスケジュールできるジョブの最大数。キューサイズを増加させるとメモリ使用量が増加します。この値は [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size) と等しく保つことをお勧めします。

:::note
`0` の値は無制限を意味します。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```
## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />オブジェクトストレージへの書き込みリクエスト用のバックグラウンドプールのサイズ
## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />オブジェクトストレージへの書き込みリクエストのためにバックグラウンドプールにプッシュ可能なタスクの数
## throw_on_unknown_workload {#throw_on_unknown_workload} 

<SettingsInfoBlock type="Bool" default_value="0" />
クエリ設定 'workload' で未知の WORKLOAD にアクセスした際の動作を定義します。

- `true` の場合、未知の WORKLOAD にアクセスしようとするクエリから RESOURCE_ACCESS_DENIED 例外がスローされます。これは、WORKLOAD 階層が確立され、WORKLOAD デフォルトが含まれた後、すべてのクエリに対してリソーススケジューリングを強制するのに役立ちます。
- `false`（デフォルト）の場合、未知の WORKLOAD を指す 'workload' 設定を持つクエリに対し、リソーススケジューリングなしで無制限にアクセスすることが提供されます。これは WORKLOAD の階層を設定している間重要です。

**例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**関連情報**
- [ワークロードスケジューリング](/operations/workload-scheduling.md)
## timezone {#timezone} 

サーバーのタイムゾーン。

UTC タイムゾーンまたは地理的な場所を示す IANA 識別子として指定します（例：Africa/Abidjan）。

タイムゾーンは、String と DateTime フォーマット間の変換に必要であり、DateTime フィールドがテキストフォーマット（画面やファイルに出力）で出力されるときや、文字列から DateTime を取得するときに使用されます。さらに、タイムゾーンは、入力パラメータでタイムゾーンが提供されなかった場合に、時刻や日付で動作する関数に使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連情報**

- [session_timezone](../settings/settings.md#session_timezone)
## tmp_path {#tmp_path} 

大規模なクエリを処理するための一時データをローカルファイルシステムに保存するパス。

:::note
- 一時データストレージを構成するために使用できるのは `tmp_path` 、`tmp_policy` 、`temporary_data_in_cache` のいずれか1つのオプションのみです。
- トレーリングスラッシュは必須です。
:::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## tmp_policy {#tmp_policy} 

一時データを持つストレージのポリシー。詳細については、[MergeTree テーブルエンジン](/engines/table-engines/mergetree-family/mergetree) ドキュメントを参照してください。

:::note
- 一時データストレージを構成するために使用できるのは `tmp_path` 、`tmp_policy` 、`temporary_data_in_cache` のいずれか1つのオプションのみです。
- `move_factor` 、`keep_free_space_bytes` 、`max_data_part_size_bytes` は無視されます。
- ポリシーには正確に *1つのボリューム* と *ローカル* ディスクが必要です。
:::

**例**

`/disk1` が満杯になると、一時データは `/disk2` に保存されます。

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

各エントリが `<name>/path/to/file</name>` 形式のカスタムトップレベルドメインのリストを定義します。

例えば：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

その他参照
- 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) などが、カスタム TLD リスト名を受け取り、最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分を返します。
## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />指定された値以下のサイズでランダムな割当てを収集します。0 は無効を意味します。期待通りに動作させるために 'max_untracked_memory' を0に設定することを検討してください。
## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />指定された値以上のサイズでランダムな割当てを収集します。0 は無効を意味します。期待通りに動作させるために 'max_untracked_memory' を0に設定することを検討してください。
## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーのメモリ使用量が指定されたバイト数の次のステップを超えるたびに、メモリプロファイラはアロケートスタックトレースを収集します。ゼロはメモリプロファイラを無効にします。数メガバイト未満の値はサーバーを遅延させます。
## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />
ランダムな割当てと解放を収集し、指定された確率で `trace_type` が `MemorySample` の [system.trace_log](../../operations/system-tables/trace_log.md) システムテーブルに書き込みます。この確率は、割当てのサイズに関係なく、すべての割当てまたは解放に対するものです。サンプリングは、追跡されていないメモリが追跡されていないメモリの制限を超えるときにのみ発生します（デフォルト値は `4` MiB です）。 `total_memory_profiler_step` を引き下げると、このしきい値を下げることができます。`total_memory_profiler_step` を `1` に設定すると、非常に詳細なサンプリングが行われます。

可能な値：

- 正の整数。
- `0` — ランダムな割当てと解放の `system.trace_log` システムテーブルへの書き込みが無効です。
## trace_log {#trace_log} 

[trace_log](/operations/system-tables/trace_log) システムテーブルの操作に関する設定。

<SystemLogParameters/>

デフォルトのサーバー構成ファイル `config.xml` には、以下の設定セクションが含まれています：

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

<SettingsInfoBlock type="String" default_value="SLRU" />未圧縮キャッシュポリシー名。
## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
MergeTree ファミリーのテーブルエンジンによって使用される未圧縮データの最大サイズ（バイト単位）。

サーバーには共有キャッシュがあります。メモリは必要に応じて割り当てられます。`use_uncompressed_cache` オプションが有効な場合、キャッシュが使用されます。

未圧縮キャッシュは、特定のケースで非常に短いクエリに対して有利です。

:::note
`0` の値は無効を意味します。

この設定は実行時に変更可能であり、即座に効果を発揮します。
:::
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />未圧縮キャッシュの保護キューのサイズ（SLRU ポリシーの場合）、キャッシュの総サイズに対する比率。
## url_scheme_mappers {#url_scheme_mappers} 

短縮または記号化された URL プレフィックスを完全な URL に変換するための設定。

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
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 

ZooKeeper 内のデータパートヘッダーのストレージ方法。この設定は [`MergeTree`](/engines/table-engines/mergetree-family) ファミリーにのみ適用されます。次のように指定できます：

**`config.xml` ファイルの [merge_tree](#merge_tree) セクションでグローバルに**

ClickHouse はこの設定をサーバー上のすべてのテーブルに対して使用します。設定はいつでも変更できます。既存のテーブルは設定が変更されると動作が変わります。

**各テーブルのために**

テーブルを作成するときに、対応する [エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) を指定します。この設定を持つ既存のテーブルの動作は、グローバル設定が変更されても変わりません。

**可能な値**

- `0` — 機能はオフです。
- `1` — 機能はオンです。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) の場合、[replicated](../../engines/table-engines/mergetree-family/replication.md) テーブルは、1つの `znode` を使用してデータパートのヘッダーをコンパクトに格納します。テーブルに多くのカラムがある場合、このストレージ方法は ZooKeeper に保存されるデータのボリュームを大幅に削減します。

:::note
`use_minimalistic_part_header_in_zookeeper = 1` を適用した後は、この設定をサポートしていないバージョンに ClickHouse サーバーをダウングレードすることはできません。クラスター内のサーバーがアップグレードされる際には注意してください。一度にすべてのサーバーをアップグレードしない方が安全です。ClickHouse の新しいバージョンは、テスト環境で、またはクラスターの数台のサーバーでテストすることをお勧めします。

この設定で既に保存されているデータパートヘッダーは、以前の（非コンパクトな）表現に復元することはできません。
:::
## user_defined_executable_functions_config {#user_defined_executable_functions_config} 

実行可能なユーザー定義関数の設定ファイルへのパス。

パス：

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにはワイルドカード * および ? を含めることができます。

その他参照：
- "[実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)".

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## user_defined_path {#user_defined_path} 

ユーザー定義ファイルが格納されているディレクトリ。SQL ユーザー定義関数 [SQL ユーザー定義関数](/sql-reference/functions/udf) に使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## user_directories {#user_directories} 

設定ファイルのセクションで、次の設定が含まれています：
- 定義済みユーザーの設定ファイルへのパス。
- SQL コマンドにより作成されたユーザーが格納されるフォルダーへのパス。
- SQL コマンドによって作成されたユーザーが保存され、レプリケートされる ZooKeeper ノードのパス（実験的）。

このセクションが指定されている場合、[users_config](/operations/server-configuration-parameters/settings#users_config) および [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) のパスは使用されません。

`user_directories` セクションには任意の数のアイテムを含めることができ、アイテムの順序は優先度を意味します（アイテムが高いほど優先順位が高い）。

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

ユーザー、ロール、行ポリシー、クォータ、およびプロファイルも ZooKeeper に保存できます：

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

メモリ内に情報を保存するセクション `memory` —ディスクに書き込まないことを意味し、LDAPサーバーに情報を保存するセクション `ldap` —はローカルに定義されていないユーザーのリモートユーザーディレクトリを追加します。

LDAP サーバーをリモートユーザーディレクトリとして追加するには、次の設定を持つ単一の `ldap` セクションを定義します：

| 設定    | 説明                                                                                                                                                                                                                                                         |
|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | `ldap_servers` 設定セクションで定義された LDAP サーバー名の1つ。このパラメータは必須で、空にすることはできません。                                                                                                                                                        |
| `roles`  | LDAP サーバーから取得した各ユーザーに割り当てられるローカルに定義された役割のリストを含むセクション。ロールが指定されていない場合、ユーザーは認証後に何のアクションも実行できません。リストされたロールのいずれかが認証時にローカルで定義されていない場合、認証試行は失敗します。 |

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

ユーザーファイルが格納されているディレクトリ。テーブル関数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) に使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path} 

ユーザースクリプトファイルが格納されているディレクトリ。実行可能なユーザー定義関数 [実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions) に使用されます。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

タイプ：

デフォルト：
## users_config {#users_config} 

以下を含むファイルへのパス：

- ユーザーの設定。
- アクセス権。
- 設定プロフィール。
- クォータ設定。

**例**

```xml
<users_config>users.xml</users_config>
```
## validate_tcp_client_information {#validate_tcp_client_information} 

<SettingsInfoBlock type="Bool" default_value="0" />クエリパケットを受信したときにクライアント情報の検証が有効かどうかを決定します。

デフォルトでは、`false` です：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```
## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />エントリでのベクトル類似性インデックスのキャッシュサイズ。ゼロは無効を意味します。
## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ベクトル類似性インデックスキャッシュポリシー名。
## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />ベクトル類似性インデックス用のキャッシュサイズ。ゼロは無効を意味します。

:::note
この設定は実行時に変更可能であり、即座に影響を与えます。
:::
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup} 

<SettingsInfoBlock type="Bool" default_value="1" />
この設定は、`dictionaries_lazy_load`が`false`の場合の動作を指定します。
(`dictionaries_lazy_load`が`true`の場合、この設定は何も影響しません。)

`wait_dictionaries_load_at_startup`が`false`の場合、サーバーは起動時にすべての辞書を読み込み始め、接続を受け付けながら読み込みを行います。
辞書がクエリで初めて使用されると、その辞書がまだ読み込まれていない場合は、クエリは辞書が読み込まれるまで待機します。
`wait_dictionaries_load_at_startup`を`false`に設定すると、ClickHouseの起動が速くなる可能性がありますが、一部のクエリは遅く実行される可能性があります
（なぜなら、一部の辞書が読み込まれるまで待たなければならないからです）。

`wait_dictionaries_load_at_startup`が`true`の場合、サーバーは起動時にすべての辞書の読み込みが完了するまで（成功または失敗にかかわらず）待機し、その後に接続を受け付けます。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```

## workload_path {#workload_path} 

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリのストレージとして使用されるディレクトリ。デフォルトでは、サーバーの作業ディレクトリの下にある `/workload/` フォルダが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**参照**

- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)

## workload_zookeeper_path {#workload_zookeeper_path} 

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリのストレージとして使用されるZooKeeperノードへのパス。同一性を保つため、すべてのSQL定義はこの単一のznodeの値として保存されます。デフォルトではZooKeeperは使用されず、定義は[ディスク](#workload_path)に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**参照**

- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)

## zookeeper {#zookeeper} 

ClickHouseが[ZooKeeper](http://zookeeper.apache.org/)クラスタと対話できるようにする設定を含みます。ClickHouseは、レプリケートされたテーブルを使用する際にレプリカのメタデータを保存するためにZooKeeperを使用します。レプリケートされたテーブルが使用されない場合、このパラメータセクションは省略できます。

以下の設定はサブタグによって構成できます：

| 設定                                      | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                    | ZooKeeperのエンドポイント。複数のエンドポイントを設定できます。例えば、`<node index="1"><host>example_host</host><port>2181</port></node>`のように。`index`属性は、ZooKeeperクラスタへの接続を試みる際のノードの順序を指定します。                                                                                                                                                                                                                                                                                            |
| `session_timeout_ms`                      | クライアントセッションの最大タイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                    | 1つの操作の最大タイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `root` (オプション)                       | ClickHouseサーバーによって使用されるznodeのルートとして使用されるznode。                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min` (オプション) | プライマリが利用できない場合にフォールバックノードへのZooKeeperセッションの最小寿命（負荷分散）。秒単位で設定します。デフォルト：3時間。                                                                                                                                                                                                                                                                                                                                                              |
| `fallback_session_lifetime.max` (オプション) | プライマリが利用できない場合にフォールバックノードへのZooKeeperセッションの最大寿命（負荷分散）。秒単位で設定します。デフォルト：6時間。                                                                                                                                                                                                                                                                                                                                                              |
| `identity` (オプション)                   | 要求されたznodeにアクセスするためにZooKeeperが必要とするユーザー名とパスワード。                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression` (オプション)            | trueに設定するとKeeperプロトコルで圧縮を有効にします。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

`zookeeper_load_balancing`設定（オプション）もあり、ZooKeeperノード選択のアルゴリズムを選択できます：

| アルゴリズム名                       | 説明                                                                                                                    |
|--------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `random`                             | ZooKeeperノードのいずれかを無作為に選択します。                                                                                       |
| `in_order`                           | 最初のZooKeeperノードを選択し、利用できない場合は次、そしてその次へと選択します。                                            |
| `nearest_hostname`                   | サーバーのホスト名に最も似ているZooKeeperノードを選択します。ホスト名は名前の接頭辞で比較されます。 |
| `hostname_levenshtein_distance`      | nearest_hostnameと同じですが、ホスト名をレーベンシュタイン距離の方法で比較します。                                         |
| `first_or_random`                    | 最初のZooKeeperノードを選択し、利用できない場合は残りのZooKeeperノードから無作為に選択します。                |
| `round_robin`                        | 最初のZooKeeperノードを選択し、再接続が発生した場合は次のノードを選択します。                                                    |

**設定例**

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

**参照**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper Programmer's Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Optional secured communication between ClickHouse and Zookeeper](/operations/ssl-zookeeper)
