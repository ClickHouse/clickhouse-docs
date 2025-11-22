---
description: 'このセクションでは、サーバーレベルの設定、すなわちセッションやクエリレベルでは変更できない設定について説明します。'
keywords: ['グローバルサーバー設定']
sidebar_label: 'サーバー設定'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: 'サーバー設定'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# サーバー設定

このセクションでは、サーバー設定について説明します。これらはセッションレベルやクエリレベルでは変更できない設定です。

ClickHouse における設定ファイルの詳細については、[Configuration Files](/operations/configuration-files) を参照してください。

その他の設定については、[Settings](/operations/settings/overview) セクションで説明しています。
設定について理解する前に、[Configuration Files](/operations/configuration-files) セクションを読み、置換機能（`incl` および `optional` 属性）の使い方に注意することをお勧めします。



## abort_on_logical_error {#abort_on_logical_error}

<SettingsInfoBlock type='Bool' default_value='0' />
LOGICAL_ERROR例外が発生した際にサーバーをクラッシュさせます。エキスパート専用です。


## access_control_improvements {#access_control_improvements}

アクセス制御システムのオプション改善に関する設定。

| 設定                                         | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | デフォルト |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | 許可的な行ポリシーを持たないユーザーが`SELECT`クエリで行を読み取れるかどうかを設定します。例えば、ユーザーAとBが存在し、行ポリシーがAに対してのみ定義されている場合、この設定がtrueであればユーザーBはすべての行を参照できます。この設定がfalseの場合、ユーザーBは行を参照できません。                                                                                                                                                                                                                    | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER`クエリに`CLUSTER`権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>`に権限が必要かどうか、およびすべてのユーザーが実行できるかどうかを設定します。trueに設定すると、このクエリは非システムテーブルと同様に`GRANT SELECT ON system.<table>`が必要になります。例外: 一部のシステムテーブル(`tables`、`columns`、`databases`、および`one`、`contributors`などの定数テーブル)は引き続きすべてのユーザーがアクセス可能です。また、`SHOW`権限(例: `SHOW USERS`)が付与されている場合、対応するシステムテーブル(例: `system.users`)にアクセスできます。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>`に権限が必要かどうか、およびすべてのユーザーが実行できるかどうかを設定します。trueに設定すると、このクエリは通常のテーブルと同様に`GRANT SELECT ON information_schema.<table>`が必要になります。                                                                                                                                                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | 設定プロファイル内のある設定に対する制約が、その設定に対する以前の制約(他のプロファイルで定義されたもの)のアクションをキャンセルするかどうかを設定します。これには新しい制約で設定されていないフィールドも含まれます。また、`changeable_in_readonly`制約タイプも有効になります。                                                                                                                                                                                                                            | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンでテーブルを作成する際に権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`            | ロールキャッシュにロールが保存される、最終アクセスからの秒数を設定します。                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`   |

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

SQLコマンドで作成されたユーザーおよびロール設定をClickHouseサーバーが保存するフォルダへのパス。

**関連項目**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)


## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached}

<SettingsInfoBlock
  type='GroupArrayActionWhenLimitReached'
  default_value='throw'
/>
groupArrayで配列要素の最大サイズを超過した場合に実行するアクション：例外を`throw`するか、余分な値を`discard`する


## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size}

<SettingsInfoBlock type='UInt64' default_value='16777215' />
groupArray関数における配列要素の最大サイズ(バイト単位)。この制限はシリアライゼーション時にチェックされ、大きな状態サイズを回避するために役立ちます。


## allow_feature_tier {#allow_feature_tier}

<SettingsInfoBlock type='UInt32' default_value='0' />
ユーザーが各機能ティアに関連する設定を変更できるかどうかを制御します。

- `0` - すべての設定の変更が許可されます（experimental、beta、production）。
- `1` - betaおよびproduction機能の設定変更のみが許可されます。experimentalの設定変更は拒否されます。
- `2` - productionの設定変更のみが許可されます。experimentalまたはbetaの設定変更は拒否されます。

これは、すべての`EXPERIMENTAL` / `BETA`機能に読み取り専用制約を設定することと同等です。

:::note
値`0`は、すべての設定を変更可能であることを意味します。
:::


## allow_impersonate_user {#allow_impersonate_user}

<SettingsInfoBlock type='Bool' default_value='0' />
IMPERSONATE機能(EXECUTE AS target_user)の有効化/無効化を行います。


## allow_implicit_no_password {#allow_implicit_no_password}

`IDENTIFIED WITH no_password`が明示的に指定されていない場合、パスワードなしでのユーザー作成を禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow_no_password {#allow_no_password}

安全でないパスワードタイプ `no_password` を許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```


## allow_plaintext_password {#allow_plaintext_password}

平文パスワードタイプ（安全ではない）を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

<SettingsInfoBlock type='Bool' default_value='1' />
jemallocメモリの使用を許可します。


## allowed_disks_for_table_engines {#allowed_disks_for_table_engines}

Icebergで使用可能なディスクのリスト


## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown}

<SettingsInfoBlock type='Bool' default_value='1' />
trueの場合、非同期挿入のキューは正常なシャットダウン時にフラッシュされます


## async_insert_threads {#async_insert_threads}

<SettingsInfoBlock type='UInt64' default_value='16' />
バックグラウンドで実際にデータの解析と挿入を行うスレッドの最大数。0の場合、非同期モードは無効になります


## async_load_databases {#async_load_databases}

<SettingsInfoBlock type='Bool' default_value='1' />
データベースとテーブルの非同期ロード。

- `true`の場合、`Ordinary`、`Atomic`、`Replicated`エンジンを持つすべての非システムデータベースは、ClickHouseサーバーの起動後に非同期でロードされます。`system.asynchronous_loader`テーブル、`tables_loader_background_pool_size`および`tables_loader_foreground_pool_size`サーバー設定を参照してください。まだロードされていないテーブルにアクセスしようとするクエリは、そのテーブルが起動するまで待機します。ロードジョブが失敗した場合、クエリはエラーを再スローします(`async_load_databases = false`の場合のようにサーバー全体をシャットダウンする代わりに)。少なくとも1つのクエリによって待機されているテーブルは、より高い優先度でロードされます。データベースに対するDDLクエリは、そのデータベースが起動するまで待機します。また、待機中のクエリの総数に対して`max_waiting_queries`の制限を設定することも検討してください。
- `false`の場合、すべてのデータベースはサーバー起動時にロードされます。

**例**

```xml
<async_load_databases>true</async_load_databases>
```


## async_load_system_database {#async_load_system_database}

<SettingsInfoBlock type='Bool' default_value='0' />
システムテーブルの非同期読み込み。`system`データベースに大量のログテーブルやパーツが存在する場合に有用です。`async_load_databases`設定とは独立しています。

- `true`に設定すると、`Ordinary`、`Atomic`、`Replicated`エンジンを持つすべてのシステムデータベースは、ClickHouseサーバーの起動後に非同期で読み込まれます。`system.asynchronous_loader`テーブル、`tables_loader_background_pool_size`および`tables_loader_foreground_pool_size`サーバー設定を参照してください。まだ読み込まれていないシステムテーブルにアクセスしようとするクエリは、そのテーブルが起動するまで待機します。少なくとも1つのクエリによって待機されているテーブルは、より高い優先度で読み込まれます。また、待機中のクエリの総数を制限するために`max_waiting_queries`設定も検討してください。
- `false`に設定すると、システムデータベースはサーバー起動前に読み込まれます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

<SettingsInfoBlock type='UInt32' default_value='120' />
重い非同期メトリクスの更新間隔（秒単位）。


## asynchronous_insert_log {#asynchronous_insert_log}

非同期挿入をログに記録するための[asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log)システムテーブルの設定。

<SystemLogParameters />

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

ClickHouse Cloudデプロイメントではデフォルトで有効になっています。

お使いの環境でこの設定がデフォルトで有効になっていない場合は、ClickHouseのインストール方法に応じて、以下の手順で有効化または無効化できます。

**有効化**

非同期メトリックログの履歴収集[`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)を手動で有効にするには、以下の内容で`/etc/clickhouse-server/config.d/asynchronous_metric_log.xml`を作成します:

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

`asynchronous_metric_log`設定を無効にするには、以下の内容で`/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`ファイルを作成します:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics}

<SettingsInfoBlock type='Bool' default_value='0' />
負荷の高い非同期メトリクスの計算を有効にします。


## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

<SettingsInfoBlock type='UInt32' default_value='1' />
非同期メトリクスの更新間隔（秒単位）。


## auth_use_forwarded_address {#auth_use_forwarded_address}

プロキシ経由で接続されたクライアントの認証に、送信元アドレスを使用します。

:::note
転送されたアドレスは容易に偽装される可能性があるため、この設定は十分な注意を払って使用してください。このような認証を受け入れるサーバーには直接アクセスせず、信頼できるプロキシを経由した場合のみアクセスするようにしてください。
:::


## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
バックグラウンドで[Bufferエンジンテーブル](/engines/table-engines/special/buffer)に対するフラッシュ操作を実行する際に使用されるスレッドの最大数。


## background_common_pool_size {#background_common_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
[*MergeTreeエンジン](/engines/table-engines/mergetree-family)テーブルに対して、バックグラウンドで各種操作(主にガベージコレクション)を実行する際に使用されるスレッドの最大数。


## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
分散送信を実行するために使用されるスレッドの最大数。


## background_fetches_pool_size {#background_fetches_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
バックグラウンドで[*MergeTreeエンジン](/engines/table-engines/mergetree-family)テーブルの他のレプリカからデータパーツを取得するために使用される最大スレッド数。


## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

<SettingsInfoBlock type='Float' default_value='2' />
スレッド数と同時実行可能なバックグラウンドマージおよびミューテーションの数との比率を設定します。

例えば、比率が2で[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size)が16に設定されている場合、ClickHouseは32個のバックグラウンドマージを同時に実行できます。これは、バックグラウンド操作が一時停止および延期可能であるため実現できます。これにより、小規模なマージに高い実行優先度を与えることができます。

:::note
この比率は実行時に増加させることのみ可能です。減少させるにはサーバーの再起動が必要です。

[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size)設定と同様に、[`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio)は後方互換性のため`default`プロファイルから適用可能です。
:::


## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

<SettingsInfoBlock type='String' default_value='round_robin' />
バックグラウンドマージとミューテーションのスケジューリング方法を制御するポリシー。
設定可能な値: `round_robin` および `shortest_task_first`。

バックグラウンドスレッドプールで実行する次のマージまたはミューテーションを選択するために使用されるアルゴリズム。ポリシーはサーバーを再起動せずに実行時に変更できます。
後方互換性のため、`default` プロファイルから適用可能です。

設定可能な値:

- `round_robin` — すべての同時実行マージとミューテーションをラウンドロビン順で実行し、スターベーションフリーな動作を保証します。小さなマージは、マージするブロック数が少ないため、大きなマージよりも高速に完了します。
- `shortest_task_first` — 常に小さなマージまたはミューテーションを実行します。マージとミューテーションは、結果のサイズに基づいて優先度が割り当てられます。小さなサイズのマージは、大きなマージよりも厳密に優先されます。このポリシーは小さなパーツの最速マージを保証しますが、`INSERT` によって過負荷状態にあるパーティションでは、大きなマージが無期限にスターベーション状態になる可能性があります。


## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
メッセージストリーミングのバックグラウンド操作の実行に使用されるスレッドの最大数。


## background_move_pool_size {#background_move_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
*MergeTreeエンジンテーブルのデータパーツを別のディスクまたはボリュームへバックグラウンドで移動する際に使用される最大スレッド数。


## background_pool_size {#background_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
MergeTreeエンジンを使用するテーブルに対して、バックグラウンドでマージとミューテーションを実行するスレッド数を設定します。

:::note

- この設定は、後方互換性のため、ClickHouseサーバー起動時に`default`プロファイル設定から適用することもできます。
- 実行時にはスレッド数の増加のみ可能です。
- スレッド数を減らすには、サーバーの再起動が必要です。
- この設定を調整することで、CPUとディスクの負荷を管理します。
  :::

:::danger
プールサイズを小さくすると、CPUとディスクリソースの使用量は減少しますが、バックグラウンドプロセスの進行が遅くなり、最終的にクエリパフォーマンスに影響を与える可能性があります。
:::

変更する前に、以下のような関連するMergeTree設定も確認してください:

- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
- [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**例**

```xml
<background_pool_size>16</background_pool_size>
```


## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio}

<SettingsInfoBlock type='Float' default_value='0.8' />
プール内で同一タイプのタスクを同時に実行できるスレッドの最大比率。


## background_schedule_pool_size {#background_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='512' />
レプリケートテーブル、Kafkaストリーミング、およびDNSキャッシュ更新のための軽量な定期操作を継続的に実行するために使用されるスレッドの最大数。


## backup_log {#backup_log}

`BACKUP`および`RESTORE`操作をログに記録するための[backup_log](../../operations/system-tables/backup_log.md)システムテーブルの設定。

<SystemLogParameters />

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

<SettingsInfoBlock type='NonZeroUInt64' default_value='16' />
`BACKUP`リクエストの実行に使用する最大スレッド数。


## backups {#backups}

バックアップの設定。[`BACKUP`および`RESTORE`](../backup.md)ステートメントの実行時に使用されます。

以下の設定はサブタグで設定できます:


<!-- SQL
WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','Determines whether multiple backup operations can run concurrently on the same host.', 'true'),
    ('allow_concurrent_restores', 'Bool', 'Determines whether multiple restore operations can run concurrently on the same host.', 'true'),
    ('allowed_disk', 'String', 'Disk to backup to when using `File()`. This setting must be set in order to use `File`.', ''),
    ('allowed_path', 'String', 'Path to backup to when using `File()`. This setting must be set in order to use `File`.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', 'Number of attempts to collect metadata before sleeping in case of inconsistency after comparing collected metadata.', '2'),
    ('collect_metadata_timeout', 'UInt64', 'Timeout in milliseconds for collecting metadata during backup.', '600000'),
    ('compare_collected_metadata', 'Bool', 'If true, compares the collected metadata with the existing metadata to ensure they are not changed during backup .', 'true'),
    ('create_table_timeout', 'UInt64', 'Timeout in milliseconds for creating tables during restore.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', 'Maximum number of attempts to retry after encountering a bad version error during coordinated backup/restore.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Maximum sleep time in milliseconds before the next attempt to collect metadata.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Minimum sleep time in milliseconds before the next attempt to collect metadata.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', 'If the `BACKUP` command fails, ClickHouse will try to remove the files already copied to the backup before the failure,  otherwise it will leave the copied files as they are.', 'true'),
    ('sync_period_ms', 'UInt64', 'Synchronization period in milliseconds for coordinated backup/restore.', '5000'),
    ('test_inject_sleep', 'Bool', 'Testing related sleep', 'false'),
    ('test_randomize_order', 'Bool', 'If true, randomizes the order of certain operations for testing purposes.', 'false'),
    ('zookeeper_path', 'String', 'Path in ZooKeeper where backup and restore metadata is stored when using `ON CLUSTER` clause.', '/clickhouse/backups')
  ]) AS t )
SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
-->

| 設定                                             | 型   | 説明                                                                                                                                                                   | デフォルト               |
| :-------------------------------------------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 同一ホスト上で複数のバックアップ操作を同時実行できるかどうかを決定します。                                                                                          | `true`                |
| `allow_concurrent_restores`                         | Bool   | 同一ホスト上で複数のリストア操作を同時実行できるかどうかを決定します。                                                                                         | `true`                |
| `allowed_disk`                                      | String | `File()`使用時のバックアップ先ディスク。`File`を使用するには、この設定が必須です。                                                                                       | ``                    |
| `allowed_path`                                      | String | `File()`使用時のバックアップ先パス。`File`を使用するには、この設定が必須です。                                                                                       | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 収集したメタデータの比較後に不整合が発生した場合、スリープ前にメタデータ収集を試行する回数。                                                           | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | バックアップ中のメタデータ収集のタイムアウト(ミリ秒単位)。                                                                                                                | `600000`              |
| `compare_collected_metadata`                        | Bool   | trueの場合、収集したメタデータと既存のメタデータを比較し、バックアップ中に変更されていないことを確認します。                                                            | `true`                |
| `create_table_timeout`                              | UInt64 | リストア中のテーブル作成のタイムアウト(ミリ秒単位)。                                                                                                                   | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | 協調バックアップ/リストア中に不正なバージョンエラーが発生した後の最大再試行回数。                                                                 | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次のメタデータ収集試行前の最大スリープ時間(ミリ秒単位)。                                                                                               | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次のメタデータ収集試行前の最小スリープ時間(ミリ秒単位)。                                                                                               | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | `BACKUP`コマンドが失敗した場合、ClickHouseは失敗前にバックアップへコピー済みのファイルを削除しようとします。それ以外の場合は、コピーされたファイルをそのまま残します。 | `true`                |
| `sync_period_ms`                                    | UInt64 | 協調バックアップ/リストアの同期期間(ミリ秒単位)。                                                                                                        | `5000`                |
| `test_inject_sleep`                                 | Bool   | テスト関連のスリープ                                                                                                                                                         | `false`               |
| `test_randomize_order`                              | Bool   | trueの場合、テスト目的で特定の操作の順序をランダム化します。                                                                                                     | `false`               |
| `zookeeper_path`                                    | String | `ON CLUSTER`句使用時に、バックアップおよびリストアのメタデータが保存されるZooKeeper内のパス。                                                                                 | `/clickhouse/backups` |

この設定はデフォルトで次のように構成されています。

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Backups IOスレッドプールにスケジュール可能なジョブの最大数です。
現在のS3バックアップロジックのため、このキューは無制限に保つことを推奨します。

:::note
値`0`（デフォルト）は無制限を意味します。
:::


## bcrypt_workfactor {#bcrypt_workfactor}

[Bcryptアルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)を使用する`bcrypt_password`認証タイプのワークファクターです。
ワークファクターは、ハッシュの計算とパスワードの検証に必要な計算量と時間を定義します。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
高頻度で認証を行うアプリケーションでは、
ワークファクターが高い場合のbcryptの計算オーバーヘッドを考慮し、
代替の認証方法の使用を検討してください。
:::


## blob_storage_log {#blob_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) システムテーブルの設定。

<SystemLogParameters />

例:

```xml
<blob_storage_log>
    <database>system</database
    <table>blob_storage_log</table
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```


## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

組み込み辞書を再読み込みする間隔(秒単位)。

ClickHouseは組み込み辞書をx秒ごとに再読み込みします。これにより、サーバーを再起動せずに辞書を「オンザフライ」で編集することが可能になります。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
キャッシュサイズとRAMの最大比率を設定します。メモリ容量が少ないシステムでキャッシュサイズを削減できます。


## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability}

<SettingsInfoBlock type='Double' default_value='0' />
テスト目的で使用されます。


## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

<SettingsInfoBlock type='UInt64' default_value='15' />
cgroupsの対応する閾値に基づいてサーバーの最大許容メモリ消費量が調整される間隔(秒単位)。

cgroupオブザーバーを無効にする場合は、この値を`0`に設定します。


## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
[コンパイル済み式](../../operations/caches.md)のキャッシュサイズ（要素単位）を設定します。


## compiled_expression_cache_size {#compiled_expression_cache_size}

<SettingsInfoBlock type='UInt64' default_value='134217728' />
[コンパイル済み式](../../operations/caches.md)のキャッシュサイズをバイト単位で設定します。


## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)エンジンテーブルのデータ圧縮設定。

:::note
ClickHouseを使い始めたばかりの場合は、この設定を変更しないことを推奨します。
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
- `method` – 圧縮方式。指定可能な値: `lz4`、`lz4hc`、`zstd`、`deflate_qpl`。
- `level` – 圧縮レベル。[コーデック](/sql-reference/statements/create/table#general-purpose-codecs)を参照してください。

:::note
複数の`<case>`セクションを設定できます。
:::

**条件が満たされた場合の動作**:

- データパートが条件セットに一致する場合、ClickHouseは指定された圧縮方式を使用します。
- データパートが複数の条件セットに一致する場合、ClickHouseは最初に一致した条件セットを使用します。

:::note
データパートがいずれの条件にも一致しない場合、ClickHouseは`lz4`圧縮を使用します。
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

<SettingsInfoBlock type='String' default_value='fair_round_robin' />
`concurrent_threads_soft_limit_num`および`concurrent_threads_soft_limit_ratio_to_cores`で指定されたCPUスロットのスケジューリング方法に関するポリシーです。限られた数のCPUスロットを同時実行クエリ間でどのように配分するかを制御するアルゴリズムです。スケジューラはサーバーを再起動せずに実行時に変更できます。

設定可能な値:

- `round_robin` — `use_concurrency_control` = 1の設定を持つすべてのクエリは、最大`max_threads`個のCPUスロットを割り当てます。スレッドごとに1つのスロットです。競合時には、ラウンドロビン方式でクエリにCPUスロットが付与されます。最初のスロットは無条件に付与されるため、`max_threads` = 1のクエリが多数存在する場合、`max_threads`の値が大きいクエリに不公平性とレイテンシの増加が生じる可能性があることに注意してください。
- `fair_round_robin` — `use_concurrency_control` = 1の設定を持つすべてのクエリは、最大`max_threads - 1`個のCPUスロットを割り当てます。各クエリの最初のスレッドにCPUスロットを必要としない`round_robin`の変形版です。この方式により、`max_threads` = 1のクエリはスロットを必要とせず、すべてのスロットを不公平に占有することがありません。無条件に付与されるスロットはありません。


## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

<SettingsInfoBlock type='UInt64' default_value='0' />
リモートサーバーからのデータ取得用スレッドを除く、全クエリの実行に使用できるクエリ処理スレッドの最大数です。これはハードリミットではありません。
制限に達した場合でも、クエリには少なくとも1つのスレッドが割り当てられます。実行中により多くのスレッドが利用可能になった場合、クエリは必要な数のスレッドまでスケールアップできます。

:::note
値 `0`(デフォルト)は無制限を意味します。
:::


## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

<SettingsInfoBlock type='UInt64' default_value='0' />
[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num)と同様ですが、
コア数に対する比率として指定します。


## config_reload_interval_ms {#config_reload_interval_ms}

<SettingsInfoBlock type='UInt64' default_value='2000' />
ClickHouseが設定ファイルを再読み込みして新しい変更を確認する頻度


## core_dump {#core_dump}

コアダンプファイルサイズのソフトリミットを設定します。

:::note
ハードリミットはシステムツールで設定されます
:::

**例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## cpu_slot_preemption {#cpu_slot_preemption}

<SettingsInfoBlock type='Bool' default_value='0' />
CPUリソース（MASTER THREADおよびWORKER THREAD）のワークロードスケジューリング方法を定義します。

- `true`（推奨）の場合、実際に消費されたCPU時間に基づいて計測が行われます。競合するワークロードに対して公平なCPU時間が割り当てられます。スロットは限られた時間のみ割り当てられ、期限切れ後に再要求されます。CPUリソースの過負荷時には、スロット要求によってスレッド実行がブロックされる可能性があります。つまり、プリエンプションが発生する可能性があります。これによりCPU時間の公平性が保証されます。
- `false`（デフォルト）の場合、割り当てられたCPUスロット数に基づいて計測が行われます。競合するワークロードに対して公平な数のCPUスロットが割り当てられます。スロットはスレッド開始時に割り当てられ、継続的に保持され、スレッドの実行終了時に解放されます。クエリ実行に割り当てられるスレッド数は1から`max_threads`まで増加するのみで、減少することはありません。これは長時間実行されるクエリに有利ですが、短時間のクエリのCPU枯渇を引き起こす可能性があります。

**例**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**関連項目**

- [ワークロードスケジューリング](/operations/workload-scheduling.md)


## cpu_slot_preemption_timeout_ms {#cpu_slot_preemption_timeout_ms}

<SettingsInfoBlock type='UInt64' default_value='1000' />
ワーカースレッドがプリエンプション中に待機できる時間をミリ秒単位で定義します。
つまり、別のCPUスロットが割り当てられるまでの待機時間です。このタイムアウト後、
スレッドが新しいCPUスロットを取得できなかった場合、そのスレッドは終了し、クエリは
同時実行スレッド数を動的に削減してスケールダウンされます。マスタースレッドは
スケールダウンされませんが、無期限にプリエンプトされる可能性があることに注意してください。
この設定は、`cpu_slot_preemption`が有効で、WORKER THREADに対してCPUリソースが定義されている場合にのみ
有効です。

**例**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**関連項目**

- [ワークロードスケジューリング](/operations/workload-scheduling.md)


## cpu_slot_quantum_ns {#cpu_slot_quantum_ns}

<SettingsInfoBlock type='UInt64' default_value='10000000' />
CPUスロットを取得したスレッドが、次のCPUスロットを要求するまでに消費可能なCPUナノ秒数を定義します。`cpu_slot_preemption`が有効化されており、かつMASTER THREADまたはWORKER THREADに対してCPUリソースが定義されている場合にのみ有効です。

**例**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**関連項目**

- [ワークロードスケジューリング](/operations/workload-scheduling.md)


## crash_log {#crash_log}

[crash_log](../../operations/system-tables/crash_log.md)システムテーブルの動作設定です。

以下の設定はサブタグで設定できます:

| 設定                            | 説明                                                                                                                                  | デフォルト             | 注記                                                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `database`                         | データベース名。                                                                                                                        |                     |                                                                                                                    |
| `table`                            | システムテーブル名。                                                                                                                    |                     |                                                                                                                    |
| `engine`                           | システムテーブルの[MergeTreeエンジン定義](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。 |                     | `partition_by`または`order_by`が定義されている場合は使用できません。指定されていない場合、デフォルトで`MergeTree`が選択されます        |
| `partition_by`                     | システムテーブルの[カスタムパーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                            |                     | システムテーブルに`engine`が指定されている場合、`partition_by`パラメータは'engine'内で直接指定する必要があります   |
| `ttl`                              | テーブルの[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)を指定します。                                     |                     | システムテーブルに`engine`が指定されている場合、`ttl`パラメータは'engine'内で直接指定する必要があります            |
| `order_by`                         | システムテーブルの[カスタムソートキー](/engines/table-engines/mergetree-family/mergetree#order_by)。`engine`が定義されている場合は使用できません。      |                     | システムテーブルに`engine`が指定されている場合、`order_by`パラメータは'engine'内で直接指定する必要があります       |
| `storage_policy`                   | テーブルに使用するストレージポリシー名(オプション)。                                                                                  |                     | システムテーブルに`engine`が指定されている場合、`storage_policy`パラメータは'engine'内で直接指定する必要があります |
| `settings`                         | MergeTreeの動作を制御する[追加パラメータ](/engines/table-engines/mergetree-family/mergetree/#settings)(オプション)。  |                     | システムテーブルに`engine`が指定されている場合、`settings`パラメータは'engine'内で直接指定する必要があります       |
| `flush_interval_milliseconds`      | メモリ内のバッファからテーブルへデータをフラッシュする間隔。                                                                           | `7500`              |                                                                                                                    |
| `max_size_rows`                    | ログの最大行数。フラッシュされていないログの量がmax_sizeに達すると、ログはディスクにダンプされます。                   | `1024`              |                                                                                                                    |
| `reserved_size_rows`               | ログ用に事前割り当てされるメモリサイズ(行数)。                                                                                             | `1024`              |                                                                                                                    |
| `buffer_size_rows_flush_threshold` | 行数のしきい値。しきい値に達すると、ディスクへのログフラッシュがバックグラウンドで開始されます。                             | `max_size_rows / 2` |                                                                                                                    |
| `flush_on_crash`                   | クラッシュ時にログをディスクにダンプするかどうかを設定します。                                                                           | `false`             |                                                                                                                    |

デフォルトのサーバー設定ファイル`config.xml`には、以下の設定セクションが含まれています:

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

この設定は、カスタム(SQLから作成された)キャッシュディスクのキャッシュパスを指定します。
`custom_cached_disks_base_directory`は、カスタムディスクに対して`filesystem_caches_path`(`filesystem_caches_path.xml`に記載)よりも優先されます。前者が存在しない場合は後者が使用されます。
ファイルシステムキャッシュ設定のパスは、このディレクトリ内に配置する必要があります。そうでない場合、例外がスローされ、ディスクの作成が阻止されます。

:::note
これは、サーバーがアップグレードされる前の旧バージョンで作成されたディスクには影響しません。この場合、サーバーが正常に起動できるように例外はスローされません。
:::

例:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## custom_settings_prefixes {#custom_settings_prefixes}

[カスタム設定](/operations/settings/query-level#custom_settings)のプレフィックスのリスト。プレフィックスはカンマで区切る必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**関連項目**

- [カスタム設定](/operations/settings/query-level#custom_settings)


## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec}

<SettingsInfoBlock type='UInt64' default_value='480' />
削除されたテーブルを[`UNDROP`](/sql-reference/statements/undrop.md)文で復元できる期間の遅延時間です。`DROP TABLE`が`SYNC`修飾子付きで実行された場合、この設定は無視されます。この設定のデフォルト値は`480`（8分）です。


## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

<SettingsInfoBlock type='UInt64' default_value='5' />
テーブルの削除が失敗した場合、ClickHouseは操作を再試行する前にこのタイムアウト期間待機します。


## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

<SettingsInfoBlock type='UInt64' default_value='16' />
テーブルの削除に使用されるスレッドプールのサイズ。


## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}

<SettingsInfoBlock type='UInt64' default_value='86400' />
`store/` ディレクトリからガベージをクリーンアップするタスクのパラメータ。タスクの実行間隔を設定します。

:::note
`0` を指定すると「実行しない」ことを意味します。デフォルト値は1日です。
:::


## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}

<SettingsInfoBlock type='UInt64' default_value='3600' />
`store/`ディレクトリからガベージをクリーンアップするタスクのパラメータです。あるサブディレクトリがclickhouse-serverによって使用されておらず、かつこのディレクトリが過去
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)
秒間変更されていない場合、タスクはすべてのアクセス権を削除することでこのディレクトリを「非表示」にします。これは、clickhouse-serverが`store/`内に存在することを想定していないディレクトリに対しても機能します。

:::note
値`0`は「即座に」を意味します。
:::


## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

<SettingsInfoBlock type='UInt64' default_value='2592000' />
`store/` ディレクトリからガベージをクリーンアップするタスクのパラメータです。あるサブディレクトリがclickhouse-serverによって使用されておらず、以前に「非表示」にされており
（[database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)を参照）、
かつこのディレクトリが過去
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec)
秒間変更されていない場合、タスクはこのディレクトリを削除します。これは、clickhouse-serverが`store/`内に存在することを想定していないディレクトリに対しても機能します。

:::note
値`0`は「削除しない」を意味します。デフォルト値は30日に相当します。
:::


## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently}

<SettingsInfoBlock type='Bool' default_value='1' />
Replicatedデータベースでテーブルを永続的にデタッチすることを許可します


## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables}

<SettingsInfoBlock type='Bool' default_value='0' />
予期しないテーブルを別のローカルデータベースに移動する代わりに、Replicatedデータベースから削除します


## dead_letter_queue {#dead_letter_queue}

`dead_letter_queue`システムテーブルの設定。

<SystemLogParameters />

デフォルト設定は以下の通りです:

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```


## default_database {#default_database}

<SettingsInfoBlock type='String' default_value='default' />
デフォルトのデータベース名です。


## default_password_type {#default_password_type}

`CREATE USER u IDENTIFIED BY 'p'`のようなクエリで自動的に設定されるパスワードタイプを指定します。

指定可能な値:

- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## default_profile {#default_profile}

デフォルト設定プロファイル。設定プロファイルは`user_config`設定で指定されたファイルに配置されています。

**例**

```xml
<default_profile>default</default_profile>
```


## default_replica_name {#default_replica_name}

<SettingsInfoBlock type='String' default_value='{replica}' />
ZooKeeper内のレプリカ名。

**例**

```xml
<default_replica_name>{replica}</default_replica_name>
```


## default_replica_path {#default_replica_path}

<SettingsInfoBlock
  type='String'
  default_value='/clickhouse/tables/{uuid}/{shard}'
/>
ZooKeeper内のテーブルへのパス。

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

辞書の設定ファイルへのパス。

パス:

- 絶対パスまたはサーバー設定ファイルからの相対パスを指定します。
- パスにはワイルドカード \* および ? を含めることができます。

関連項目:

- 「[辞書](../../sql-reference/dictionaries/index.md)」

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## dictionaries_lazy_load {#dictionaries_lazy_load}

<SettingsInfoBlock type='Bool' default_value='1' />
ディクショナリの遅延ロード。

- `true`の場合、各ディクショナリは初回使用時にロードされます。ロードに失敗した場合、そのディクショナリを使用していた関数は例外をスローします。
- `false`の場合、サーバーは起動時にすべてのディクショナリをロードします。

:::note
サーバーは起動時に、すべてのディクショナリのロードが完了するまで接続を受け付けずに待機します
(例外: [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup)が`false`に設定されている場合)。
:::

**例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval}

<SettingsInfoBlock type='UInt64' default_value='1000' />
`background_reconnect`が有効になっている、接続に失敗したMySQLおよびPostgres辞書の再接続試行間隔をミリ秒単位で指定します。


## disable_insertion_and_mutation {#disable_insertion_and_mutation}

<SettingsInfoBlock type='Bool' default_value='0' />
INSERT/ALTER/DELETEクエリを無効化します。この設定は、読み取り専用ノードが必要な場合に有効化され、挿入とミューテーションによる読み取りパフォーマンスへの影響を防ぎます。この設定に関わらず、外部エンジン(S3、DataLake、MySQL、PostgreSQL、Kafkaなど)への挿入は許可されます。


## disable_internal_dns_cache {#disable_internal_dns_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
内部DNSキャッシュを無効にします。Kubernetesなど、インフラストラクチャが頻繁に変更されるシステムでClickHouseを運用する際に推奨されます。


## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

デフォルトでは、`HTTP`プロキシ経由で`HTTPS`リクエストを行う際にトンネリング(すなわち`HTTP CONNECT`)が使用されます。この設定を使用してトンネリングを無効化できます。

**no_proxy**

デフォルトでは、すべてのリクエストがプロキシを経由します。特定のホストに対してプロキシを無効化するには、`no_proxy`変数を設定する必要があります。
この変数は、リストリゾルバおよびリモートリゾルバの場合は`<proxy>`句内に設定でき、環境リゾルバの場合は環境変数として設定できます。
IPアドレス、ドメイン、サブドメイン、および完全バイパス用の`'*'`ワイルドカードをサポートしています。先頭のドットはcurlと同様に削除されます。

**例**

以下の設定は、`clickhouse.cloud`およびそのすべてのサブドメイン(例:`auth.clickhouse.cloud`)へのプロキシリクエストをバイパスします。
先頭にドットがある場合でも、GitLabにも同様に適用されます。`gitlab.com`と`about.gitlab.com`の両方がプロキシをバイパスします。

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

<SettingsInfoBlock type='UInt64' default_value='5000' />
この制限を超える接続は、存続時間が大幅に短縮されます。この制限はディスク接続に適用されます。


## disk_connections_store_limit {#disk_connections_store_limit}

<SettingsInfoBlock type='UInt64' default_value='30000' />
この制限を超える接続は使用後にリセットされます。接続キャッシュを無効にする場合は0に設定します。この制限はディスク接続に適用されます。


## disk_connections_warn_limit {#disk_connections_warn_limit}

<SettingsInfoBlock type='UInt64' default_value='10000' />
使用中の接続数がこの制限を超えた場合、警告メッセージがログに記録されます。この制限はディスク接続に適用されます。


## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

<SettingsInfoBlock type='Bool' default_value='0' />
テーブル、データベース、テーブル関数、およびディクショナリに対する`SHOW`および`SELECT`クエリでのシークレットの表示を有効または無効にします。

シークレットを表示するには、ユーザーは[`format_display_secrets_in_show_and_select`フォーマット設定](../settings/formats#format_display_secrets_in_show_and_select)を有効にし、[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect)権限を持っている必要があります。

設定可能な値:

- `0` — 無効。
- `1` — 有効。


## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client}

<SettingsInfoBlock type='Bool' default_value='1' />
キャッシュサーバーがクライアントから受信したスロットリング設定を適用するかどうかを指定します。


## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio}

<SettingsInfoBlock type='Float' default_value='0.1' />
分散キャッシュが空き状態を維持しようとするアクティブ接続数のソフトリミットです。空き接続数が
distributed_cache_keep_up_free_connections_ratio * max_connections を下回ると、
最も古いアクティビティを持つ接続から順に閉じられ、接続数が制限値を上回るまで継続されます。


## distributed_ddl {#distributed_ddl}

クラスタ上での[分散DDLクエリ](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）の実行を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper)が有効な場合のみ動作します。

`<distributed_ddl>`内で設定可能な項目は以下の通りです：

| 設定項目                | 説明                                                                                                                       | デフォルト値                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `path`                 | DDLクエリ用の`task_queue`のKeeper内パス                                                                           |                                        |
| `profile`              | DDLクエリの実行に使用するプロファイル                                                                                       |                                        |
| `pool_size`            | 同時に実行可能な`ON CLUSTER`クエリの数                                                                           |                                        |
| `max_tasks_in_queue`   | キューに格納できるタスクの最大数                                                                             | `1,000`                                |
| `task_max_lifetime`    | この値を超える経過時間のノードを削除                                                                                | `7 * 24 * 60 * 60`（1週間を秒で表した値） |
| `cleanup_delay_period` | 新しいノードイベント受信後、前回のクリーニングから`cleanup_delay_period`秒以上経過している場合にクリーニングを開始 | `60`秒                           |

**例**

```xml
<distributed_ddl>
    <!-- DDLクエリのキューのZooKeeper内パス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- このプロファイルの設定がDDLクエリの実行に使用されます -->
    <profile>default</profile>

    <!-- 同時に実行可能なON CLUSTERクエリの数を制御します -->
    <pool_size>1</pool_size>

    <!--
         クリーニング設定（アクティブなタスクは削除されません）
    -->

    <!-- タスクのTTLを制御します（デフォルトは1週間） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- クリーニングの実行頻度を制御します（秒単位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- キューに格納できるタスク数を制御します -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```


## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles}

<SettingsInfoBlock type='Bool' default_value='0' />
有効にすると、ON CLUSTERクエリは、リモートシャードでの実行時に開始者のユーザーとロールを保持して使用します。これにより、クラスタ全体で一貫したアクセス制御が保証されますが、すべてのノードにユーザーとロールが存在している必要があります。


## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4}

<SettingsInfoBlock type='Bool' default_value='1' />
名前のIPv4アドレスへの解決を許可します。


## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6}

<SettingsInfoBlock type='Bool' default_value='1' />
名前のIPv6アドレスへの解決を許可します。


## dns_cache_max_entries {#dns_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='10000' />
内部DNSキャッシュの最大エントリ数。


## dns_cache_update_period {#dns_cache_update_period}

<SettingsInfoBlock type='Int32' default_value='15' />
内部DNSキャッシュの更新間隔（秒）。


## dns_max_consecutive_failures {#dns_max_consecutive_failures}

<SettingsInfoBlock type='UInt32' default_value='10' />
ClickHouse DNSキャッシュからホスト名を削除するまでに許容される、ホスト名のDNS解決失敗の最大回数。


## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
分散キャッシュを削除する際に使用されるスレッドプールのサイズ。


## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />
分散キャッシュを削除するために使用されるスレッドプールのキューサイズ。


## enable_azure_sdk_logging {#enable_azure_sdk_logging}

<SettingsInfoBlock type='Bool' default_value='0' />
Azure SDKからのログ記録を有効化します


## encryption {#encryption}

[暗号化コーデック](/sql-reference/statements/create/table#encryption-codecs)で使用する鍵を取得するためのコマンドを設定します。鍵は環境変数に記述するか、設定ファイルに設定する必要があります。

鍵は16バイト長の16進数または文字列で指定できます。

**例**

設定ファイルからの読み込み:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
設定ファイルに鍵を保存することは推奨されません。安全ではないためです。鍵を安全なディスク上の別の設定ファイルに移動し、その設定ファイルへのシンボリックリンクを`config.d/`フォルダに配置することができます。
:::

鍵が16進数の場合の設定ファイルからの読み込み:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

環境変数からの鍵の読み込み:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで`current_key_id`は暗号化に使用する現在の鍵を設定し、指定されたすべての鍵は復号化に使用できます。

これらの各方法は複数の鍵に適用できます:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで`current_key_id`は暗号化に使用する現在の鍵を示します。

また、12バイト長のnonceを追加することもできます(デフォルトでは、暗号化および復号化プロセスはゼロバイトで構成されるnonceを使用します):

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
上記のすべては`aes_256_gcm_siv`にも適用できます(ただし、鍵は32バイト長である必要があります)。
:::


## error_log {#error_log}

デフォルトでは無効になっています。

**有効化**

エラー履歴収集[`system.error_log`](../../operations/system-tables/error_log.md)を手動で有効にするには、以下の内容で`/etc/clickhouse-server/config.d/error_log.xml`を作成します:

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

`error_log`設定を無効にするには、以下の内容で`/etc/clickhouse-server/config.d/disable_error_log.xml`ファイルを作成します:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
入力解析用のスレッドプールにスケジュール可能なジョブの最大数。

:::note
値 `0` は無制限を意味します。
:::


## format_schema_path {#format_schema_path}

[CapnProto](/interfaces/formats/CapnProto)形式のスキーマなど、入力データのスキーマを含むディレクトリへのパスです。

**例**

```xml
<!-- 各種入力形式のスキーマファイルを含むディレクトリ -->
<format_schema_path>format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns}

<SettingsInfoBlock type='UInt64' default_value='10000000000' />
グローバルプロファイラのCPUクロックタイマーの周期(ナノ秒単位)。CPUクロックグローバルプロファイラを無効にするには0を設定してください。推奨値は、単一クエリの場合は最低10000000(秒間100回)、クラスタ全体のプロファイリングの場合は1000000000(秒間1回)です。


## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns}

<SettingsInfoBlock type='UInt64' default_value='10000000000' />
グローバルプロファイラの実時間タイマーの周期（ナノ秒単位）。0に設定すると実時間グローバルプロファイラが無効になります。推奨値は、単一クエリの場合は最低10000000（秒間100回）、クラスタ全体のプロファイリングの場合は1000000000（秒間1回）です。


## google_protos_path {#google_protos_path}

Protobuf型のprotoファイルを格納するディレクトリを定義します。

例:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## graphite {#graphite}

[Graphite](https://github.com/graphite-project)へのデータ送信。

設定:

- `host` – Graphiteサーバー。
- `port` – Graphiteサーバーのポート。
- `interval` – 送信間隔(秒単位)。
- `timeout` – データ送信のタイムアウト(秒単位)。
- `root_path` – キーのプレフィックス。
- `metrics` – [system.metrics](/operations/system-tables/metrics)テーブルからデータを送信。
- `events` – [system.events](/operations/system-tables/events)テーブルから期間中に蓄積された差分データを送信。
- `events_cumulative` – [system.events](/operations/system-tables/events)テーブルから累積データを送信。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルからデータを送信。

複数の`<graphite>`句を設定できます。例えば、異なる間隔で異なるデータを送信する場合に使用できます。

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

Graphiteのデータ間引き設定。

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


## hsts_max_age {#hsts_max_age}

HSTSの有効期限を秒単位で指定します。

:::note
`0` を設定すると、ClickHouseはHSTSを無効化します。正の数値を設定すると、HSTSが有効化され、max-ageには設定した数値が使用されます。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_soft_limit {#http_connections_soft_limit}

<SettingsInfoBlock type='UInt64' default_value='100' />
この制限を超える接続は、存続時間が大幅に短縮されます。この制限は、ディスクまたはストレージに属さないHTTP接続に適用されます。


## http_connections_store_limit {#http_connections_store_limit}

<SettingsInfoBlock type='UInt64' default_value='5000' />
この制限を超える接続は使用後にリセットされます。接続キャッシュを無効にする場合は0に設定します。この制限は、ディスクまたはストレージに属していないHTTP接続に適用されます。


## http_connections_warn_limit {#http_connections_warn_limit}

<SettingsInfoBlock type='UInt64' default_value='1000' />
使用中の接続数がこの制限値を超えた場合、警告メッセージがログに記録されます。この制限は、ディスクまたはストレージに属さないHTTP接続に適用されます。


## http_handlers {#http_handlers}

カスタムHTTPハンドラーを使用できます。
新しいHTTPハンドラーを追加するには、新しい`<rule>`を追加するだけです。
ルールは定義された順に上から下へチェックされ、
最初にマッチしたルールがハンドラーを実行します。

以下の設定をサブタグで構成できます:

| サブタグ             | 定義                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | リクエストURLをマッチさせます。正規表現マッチを使用する場合は'regex:'プレフィックスを使用できます(オプション)                                                           |
| `methods`            | リクエストメソッドをマッチさせます。複数のメソッドをマッチさせる場合はカンマで区切って指定できます(オプション)                                                       |
| `headers`            | リクエストヘッダーをマッチさせます。各子要素をマッチさせます(子要素名はヘッダー名)。正規表現マッチを使用する場合は'regex:'プレフィックスを使用できます(オプション) |
| `handler`            | リクエストハンドラー                                                                                                                               |
| `empty_query_string` | URLにクエリ文字列が存在しないことを確認します                                                                                                    |

`handler`には以下の設定が含まれ、サブタグで構成できます:

| サブタグ           | 定義                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | リダイレクト先の場所                                                                                                                                               |
| `type`             | サポートされるタイプ: static、dynamic_query_handler、predefined_query_handler、redirect                                                                                    |
| `status`           | staticタイプで使用します。レスポンスステータスコード                                                                                                                            |
| `query_param_name` | dynamic_query_handlerタイプで使用します。HTTPリクエストパラメータ内の`<query_param_name>`値に対応する値を抽出して実行します                           |
| `query`            | predefined_query_handlerタイプで使用します。ハンドラーが呼び出されたときにクエリを実行します                                                                                     |
| `content_type`     | staticタイプで使用します。レスポンスのcontent-type                                                                                                                           |
| `response_content` | staticタイプで使用します。クライアントに送信されるレスポンスコンテンツ。'file://'または'config://'プレフィックスを使用する場合、ファイルまたは設定からコンテンツを検索してクライアントに送信します |

ルールのリストと共に、すべてのデフォルトハンドラーを有効にする`<defaults/>`を指定できます。

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


## http_options_response {#http_options_response}

`OPTIONS` HTTPリクエストに対するレスポンスにヘッダーを追加する際に使用します。
`OPTIONS`メソッドは、CORSプリフライトリクエストを実行する際に使用されます。

詳細は、[OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)を参照してください。

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


## http_server_default_response {#http_server_default_response}

ClickHouse HTTP(s)サーバーにアクセスした際にデフォルトで表示されるページです。
デフォルト値は "Ok." です（末尾に改行が含まれます）

**例**

`http://localhost: http_port` にアクセスすると `https://tabix.io/` が開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size}

<SettingsInfoBlock type='UInt64' default_value='50' />
Icebergカタログのバックグラウンドプールサイズ


## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
Icebergカタログプールにプッシュできるタスクの数


## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Icebergメタデータファイルキャッシュの最大エントリ数。0を指定すると無効になります。


## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Icebergメタデータのキャッシュポリシー名。


## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
Icebergメタデータキャッシュの最大サイズ（バイト単位）。0を指定すると無効になります。


## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Icebergメタデータキャッシュにおける保護キュー（SLRUポリシー使用時）のサイズを、キャッシュ全体のサイズに対する比率で指定します。


## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}

<SettingsInfoBlock type='Bool' default_value='1' />
trueの場合、ClickHouseは`CREATE VIEW`クエリ内の空のSQLセキュリティステートメントに対してデフォルト値を書き込みません。

:::note
この設定は移行期間中にのみ必要であり、バージョン24.4で廃止予定です
:::


## include_from {#include_from}

置換を含むファイルへのパスです。XML形式とYAML形式の両方がサポートされています。

詳細については、「[設定ファイル](/operations/configuration-files)」のセクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## index_mark_cache_policy {#index_mark_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
セカンダリインデックスマークのキャッシュポリシー名。


## index_mark_cache_size {#index_mark_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
インデックスマークキャッシュの最大サイズ。

:::note

`0` を指定すると無効になります。

この設定は実行時に変更でき、即座に反映されます。
:::


## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.3' />
セカンダリインデックスマークキャッシュにおける保護キュー（SLRUポリシーの場合）のサイズを、キャッシュ全体のサイズに対する比率で指定します。


## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
セカンダリインデックスの非圧縮キャッシュポリシー名。


## index_uncompressed_cache_size {#index_uncompressed_cache_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
`MergeTree`インデックスの非圧縮ブロック用キャッシュの最大サイズ。

:::note
値が`0`の場合は無効です。

この設定は実行時に変更でき、即座に反映されます。
:::


## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
セカンダリインデックスの非圧縮キャッシュにおける保護キュー（SLRUポリシー使用時）のサイズを、キャッシュ全体のサイズに対する比率で指定します。


## interserver_http_credentials {#interserver_http_credentials}

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)時に他のサーバーへ接続する際に使用するユーザー名とパスワードです。また、サーバーはこれらの認証情報を使用して他のレプリカを認証します。
そのため、`interserver_http_credentials`はクラスター内のすべてのレプリカで同一である必要があります。

:::note

- デフォルトでは、`interserver_http_credentials`セクションが省略されている場合、レプリケーション時に認証は使用されません。
- `interserver_http_credentials`設定は、ClickHouseクライアントの認証情報[設定](../../interfaces/cli.md#configuration_files)とは関係ありません。
- これらの認証情報は、`HTTP`および`HTTPS`経由のレプリケーションで共通して使用されます。
  :::

以下の設定をサブタグで構成できます:

- `user` — ユーザー名。
- `password` — パスワード。
- `allow_empty` — `true`の場合、認証情報が設定されていても、他のレプリカは認証なしで接続できます。`false`の場合、認証なしの接続は拒否されます。デフォルト: `false`。
- `old` — 認証情報のローテーション時に使用する古い`user`と`password`を含みます。複数の`old`セクションを指定できます。

**認証情報のローテーション**

ClickHouseは、すべてのレプリカを同時に停止して設定を更新することなく、サーバー間認証情報の動的なローテーションをサポートしています。認証情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty`を`true`に設定し、認証情報を追加します。これにより、認証ありと認証なしの両方の接続が許可されます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカの設定が完了したら、`allow_empty`を`false`に設定するか、この設定を削除します。これにより、新しい認証情報による認証が必須になります。

既存の認証情報を変更するには、ユーザー名とパスワードを`interserver_http_credentials.old`セクションに移動し、`user`と`password`を新しい値で更新します。この時点で、サーバーは他のレプリカへの接続に新しい認証情報を使用し、新旧いずれかの認証情報による接続を受け入れます。

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

新しい認証情報がすべてのレプリカに適用されたら、古い認証情報を削除できます。


## interserver_http_host {#interserver_http_host}

他のサーバーがこのサーバーにアクセスする際に使用できるホスト名。

省略した場合、`hostname -f` コマンドと同じ方法で定義されます。

特定のネットワークインターフェースに依存しない構成にする際に有用です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_http_port {#interserver_http_port}

ClickHouseサーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_https_host {#interserver_https_host}

[`interserver_http_host`](#interserver_http_host)と同様ですが、このホスト名は他のサーバーが`HTTPS`経由でこのサーバーにアクセスする際に使用されます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_https_port {#interserver_https_port}

ClickHouseサーバー間で`HTTPS`を使用してデータを交換するためのポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_listen_host {#interserver_listen_host}

ClickHouseサーバー間でデータ交換が可能なホストに対する制限。
Keeperを使用している場合、異なるKeeperインスタンス間の通信にも同じ制限が適用されます。

:::note
デフォルトでは、[`listen_host`](#listen_host)設定と同じ値になります。
:::

**例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

型:

デフォルト値:


## io_thread_pool_queue_size {#io_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
IOスレッドプールにスケジュール可能なジョブの最大数。

:::note
値を`0`に設定すると無制限になります。
:::


## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log}

<SettingsInfoBlock type='Bool' default_value='0' />
jemallocのサンプリングされたアロケーションをsystem.trace_logに格納します


## jemalloc_enable_background_threads {#jemalloc_enable_background_threads}

<SettingsInfoBlock type='Bool' default_value='1' />
jemallocのバックグラウンドスレッドを有効にします。jemallocはバックグラウンドスレッドを使用して未使用のメモリページをクリーンアップします。これを無効にすると、パフォーマンスが低下する可能性があります。


## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler}

<SettingsInfoBlock type='Bool' default_value='0' />
すべてのスレッドに対してjemallocのアロケーションプロファイラを有効にします。jemallocはメモリ割り当てと、サンプリングされた割り当てに対する解放をサンプリングします。プロファイルはSYSTEM JEMALLOC FLUSH PROFILEを使用してフラッシュでき、メモリ割り当ての分析に使用できます。サンプルは、設定jemalloc_collect_global_profile_samples_in_trace_logを使用するか、クエリ設定jemalloc_collect_profile_samples_in_trace_logを使用してsystem.trace_logに保存することもできます。[アロケーションプロファイリング](/operations/allocation-profiling)を参照してください


## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes}

<SettingsInfoBlock type='UInt64' default_value='0' />
グローバルピークメモリ使用量が jemalloc_flush_profile_interval_bytes 分増加した後に、jemalloc プロファイルのフラッシュが実行されます


## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded}

<SettingsInfoBlock type='Bool' default_value='0' />
総メモリ超過エラー発生時にjemallocプロファイルのフラッシュが実行されます


## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num}

<SettingsInfoBlock type='UInt64' default_value='0' />
作成するjemallocバックグラウンドスレッドの最大数。0に設定するとjemallocのデフォルト値が使用されます


## keep_alive_timeout {#keep_alive_timeout}

<SettingsInfoBlock type='Seconds' default_value='30' />
ClickHouseがHTTPプロトコルの受信リクエストを待機してから接続を閉じるまでの秒数です。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts {#keeper_hosts}

動的設定。ClickHouseが接続可能な[Zoo]Keeperホストのセットを含みます。`<auxiliary_zookeepers>`の情報は公開されません


## keeper_multiread_batch_size {#keeper_multiread_batch_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
バッチ処理をサポートする[Zoo]KeeperへのMultiReadリクエストの最大バッチサイズ。0に設定した場合、バッチ処理は無効化されます。ClickHouse Cloudでのみ利用可能です。


## ldap_servers {#ldap_servers}

以下の目的でLDAPサーバーとその接続パラメータをここに列挙します:

- 'password'の代わりに'ldap'認証メカニズムが指定された専用ローカルユーザーの認証機能として使用する
- リモートユーザーディレクトリとして使用する

以下の設定はサブタグで構成できます:

| 設定                        | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `host`                         | LDAPサーバーのホスト名またはIP。このパラメータは必須であり、空にすることはできません。                                                                                                                                                                                                                                                                                                                                               |
| `port`                         | LDAPサーバーのポート。`enable_tls`がtrueに設定されている場合のデフォルトは636、それ以外の場合は`389`です。                                                                                                                                                                                                                                                                                                                                                          |
| `bind_dn`                      | バインド先のDNを構築するために使用されるテンプレート。結果のDNは、各認証試行時にテンプレート内のすべての`\{user_name\}`部分文字列を実際のユーザー名に置き換えることで構築されます。                                                                                                                                                                                                                               |
| `user_dn_detection`            | バインドされたユーザーの実際のユーザーDNを検出するためのLDAP検索パラメータを含むセクション。これは主に、サーバーがActive Directoryである場合の追加のロールマッピングのための検索フィルタで使用されます。結果のユーザーDNは、許可されている箇所で`\{user_dn\}`部分文字列を置き換える際に使用されます。デフォルトでは、ユーザーDNはバインドDNと同じに設定されますが、検索が実行されると、実際に検出されたユーザーDN値に更新されます。 |
| `verification_cooldown`        | バインド試行が成功した後、LDAPサーバーに接続することなく、すべての連続したリクエストに対してユーザーが正常に認証されたと見なされる期間(秒単位)。キャッシュを無効にし、各認証リクエストでLDAPサーバーへの接続を強制するには、`0`(デフォルト)を指定します。                                                                                                                    |
| `enable_tls`                   | LDAPサーバーへのセキュア接続の使用をトリガーするフラグ。プレーンテキスト(`ldap://`)プロトコルの場合は`no`を指定します(非推奨)。LDAP over SSL/TLS(`ldaps://`)プロトコルの場合は`yes`を指定します(推奨、デフォルト)。レガシーStartTLSプロトコル(プレーンテキスト(`ldap://`)プロトコルをTLSにアップグレード)の場合は`starttls`を指定します。                                                                                                                 |
| `tls_minimum_protocol_version` | SSL/TLSの最小プロトコルバージョン。受け入れられる値: `ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`(デフォルト)。                                                                                                                                                                                                                                                                                                                                  |
| `tls_require_cert`             | SSL/TLSピア証明書検証の動作。受け入れられる値: `never`、`allow`、`try`、`demand`(デフォルト)。                                                                                                                                                                                                                                                                                                                                      |
| `tls_cert_file`                | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tls_key_file`                 | 証明書鍵ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_ca_cert_file`             | CA証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tls_ca_cert_dir`              | CA証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                                          |
| `tls_cipher_suite`             | 許可される暗号スイート(OpenSSL表記)。                                                                                                                                                                                                                                                                                                                                                                                                |

設定`user_dn_detection`はサブタグで構成できます:

| 設定         | 説明                                                                                                                                                                                                                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base_dn`       | LDAP検索のベースDNを構築するために使用されるテンプレート。結果のDNは、LDAP検索中にテンプレート内のすべての`\{user_name\}`および'\{bind_dn\}'部分文字列を実際のユーザー名とバインドDNに置き換えることで構築されます。                                                                                                                                                                                        |
| `scope`         | LDAP検索のスコープ。受け入れられる値: `base`、`one_level`、`children`、`subtree`(デフォルト)。                                                                                                                                                                                                                                            |
| `search_filter` | LDAP検索の検索フィルタを構築するために使用されるテンプレート。結果のフィルタは、LDAP検索中にテンプレート内のすべての`\{user_name\}`、`\{bind_dn\}`、および`\{base_dn\}`部分文字列を実際のユーザー名、バインドDN、およびベースDNに置き換えることで構築されます。特殊文字はXMLで適切にエスケープする必要があることに注意してください。 |

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

例（ロールマッピングのための user DN 検出を構成した典型的な Active Directory の場合）:

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

ClickHouse Enterprise Edition のライセンスキー


## listen_backlog {#listen_backlog}

listenソケットのバックログ(保留中の接続のキューサイズ)。デフォルト値の`4096`はLinux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)と同じ値です。

通常、この値を変更する必要はありません。理由は以下の通りです:

- デフォルト値が十分に大きい
- クライアント接続の受け入れには専用のスレッドが存在する

したがって、`TcpExtListenOverflows`(`nstat`から取得)がゼロ以外でClickHouseサーバーのこのカウンターが増加している場合でも、この値を増やす必要があるとは限りません。理由は以下の通りです:

- 通常、`4096`が不十分な場合、ClickHouse内部のスケーリングの問題を示しているため、問題を報告する方が適切です
- サーバーが後でより多くの接続を処理できることを意味するわけではありません(仮に処理できたとしても、その時点でクライアントは既に離脱または切断されている可能性があります)

**例**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen_host {#listen_host}

リクエストの送信元ホストを制限します。サーバーがすべてのホストからのリクエストに応答するようにする場合は、`::` を指定してください。

例:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen_reuse_port {#listen_reuse_port}

複数のサーバーが同じアドレス:ポートでリッスンできるようにします。リクエストはオペレーティングシステムによってランダムにサーバーへルーティングされます。この設定の有効化は推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

型:

デフォルト:


## listen_try {#listen_try}

リッスン試行時にIPv6またはIPv4ネットワークが利用できない場合でも、サーバーは終了しません。

**例**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size}

<SettingsInfoBlock type='UInt64' default_value='50' />
マーク読み込み用バックグラウンドプールのサイズ


## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
プリフェッチプールに投入可能なタスク数


## logger {#logger}

ログメッセージの出力先と形式。

**キー**:

| キー                    | 説明                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `level`                | ログレベル。指定可能な値: `none`(ログ出力を無効化)、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                 |
| `log`                  | ログファイルのパス。                                                                                                                                          |
| `errorlog`             | エラーログファイルのパス。                                                                                                                                    |
| `size`                 | ローテーションポリシー: ログファイルの最大サイズ(バイト単位)。ログファイルサイズがこの閾値を超えると、リネームされてアーカイブされ、新しいログファイルが作成されます。 |
| `count`                | ローテーションポリシー: ClickHouseが保持する過去のログファイルの最大数。                                                                                        |
| `stream_compress`      | LZ4を使用してログメッセージを圧縮します。有効にするには`1`または`true`を設定します。                                                                                                   |
| `console`              | コンソールへのログ出力を有効にします。有効にするには`1`または`true`を設定します。デフォルトはClickHouseがデーモンモードで実行されていない場合は`1`、それ以外は`0`です。                            |
| `console_log_level`    | コンソール出力のログレベル。デフォルトは`level`です。                                                                                                                 |
| `formatting.type`      | コンソール出力のログ形式。現在は`json`のみがサポートされています。                                                                                                 |
| `use_syslog`           | ログ出力をsyslogにも転送します。                                                                                                                                 |
| `syslog_level`         | syslogへのログ出力のログレベル。                                                                                                                                   |
| `async`                | `true`(デフォルト)の場合、ログ出力は非同期で行われます(出力チャネルごとに1つのバックグラウンドスレッド)。それ以外の場合は、LOGを呼び出すスレッド内でログ出力が行われます。           |
| `async_queue_max_size` | 非同期ログ使用時に、フラッシュ待ちのキューに保持されるメッセージの最大数。超過したメッセージは破棄されます。                       |
| `startup_level`        | 起動レベルは、サーバー起動時にルートロガーのレベルを設定するために使用されます。起動後、ログレベルは`level`設定に戻されます。                                   |
| `shutdown_level`       | シャットダウンレベルは、サーバーシャットダウン時にルートロガーのレベルを設定するために使用されます。                                                                                            |

**ログ形式指定子**

`log`および`errorLog`パスのファイル名は、以下の形式指定子をサポートします(ディレクトリ部分はサポートしません)。

「例」列は`2023-07-06 18:32:07`時点の出力を示しています。


| 指定子  | 概要                                                                                                                | 例                          |
| ---- | ----------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%` | % リテラル                                                                                                            | `%`                        |
| `%n` | 改行文字                                                                                                              |                            |
| `%t` | 水平タブ文字                                                                                                            |                            |
| `%Y` | 10進表記の年。例: 2017                                                                                                   | `2023`                     |
| `%y` | 年の下2桁を表す10進数（範囲 00～99）                                                                                            | `23`                       |
| `%C` | 年の上位2桁を10進数で表した値（範囲 [00,99]）                                                                                      | `20`                       |
| `%G` | 4桁の[ISO 8601 週基準年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、つまり指定された週を含む年。通常は `%V` と組み合わせて使用する場合にのみ有用です | `2023`                     |
| `%g` | [ISO 8601 週基準年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)の末尾2桁、つまり指定された週を含む年。                            | `23`                       |
| `%b` | 月名の省略表記。例: Oct（ロケールに依存）                                                                                           | `7月`                       |
| `%h` | %b の同義語                                                                                                           | `Jul`                      |
| `%B` | 月名を省略せずに表示。例: October（ロケールに依存）                                                                                    | `7月`                       |
| `%m` | 月を10進数で表した数値（範囲 [01,12]）                                                                                          | `07`                       |
| `%U` | 年内の週番号（10進数、週の開始曜日は日曜日）（範囲 [00,53]）                                                                               | `27`                       |
| `%W` | 年内の週番号を10進数で表したもの（週の初日は月曜日）（範囲 [00,53]）                                                                           | `27`                       |
| `%V` | ISO 8601 の週番号（範囲 [01,53]）                                                                                         | `27`                       |
| `%j` | 年内通算日を10進数で表した数値（範囲 [001,366]）                                                                                    | `187`                      |
| `%d` | 月内の日をゼロ埋めした 10 進数で表した値（範囲 [01, 31]）。1 桁の場合は先頭にゼロを付けます。                                                            | `06`                       |
| `%e` | 月の日を、先頭をスペースで埋めた 10 進数で表します（範囲 [1,31]）。1 桁の場合は、先頭にスペースが付きます。                                                      | `&nbsp; 6`                 |
| `%a` | 曜日名の短縮形。例：Fri（ロケールに依存）                                                                                            | `Thu`                      |
| `%A` | 曜日名のフルスペル。例: Friday（ロケール依存）                                                                                       | `Thursday`                 |
| `%w` | 日曜日を0とする0〜6の整数で表される曜日                                                                                             | `4`                        |
| `%u` | 月曜日を 1 とする曜日を 10 進数で表した値（ISO 8601 形式、範囲は [1-7]）                                                                   | `4`                        |
| `%H` | 時を10進数で表したもの（24時間制、範囲 [00-23]）                                                                                    | `18`                       |
| `%I` | 時を10進数で表した値（12時間制、範囲 [01,12]）                                                                                     | `06`                       |
| `%M` | 分を表す10進数（範囲 [00,59]）                                                                                              | `32`                       |
| `%S` | 秒（10進数、範囲 [00,60]）                                                                                                | `07`                       |
| `%c` | 標準的な日付と時刻を表す文字列、例: Sun Oct 17 04:41:13 2010（ロケールに依存）                                                              | `Thu Jul  6 18:32:07 2023` |
| `%x` | ロケールに応じた日付表記（ロケール依存）                                                                                              | `2023/07/06`               |
| `%X` | ローカライズされた時刻表現。例: 18:40:20 または 6:40:20 PM（ロケールに依存）                                                                 | `18:32:07`                 |
| `%D` | 短い MM/DD/YY 形式の日付で、%m/%d/%y と同等                                                                                   | `2023/07/06`               |
| `%F` | 短い形式の YYYY-MM-DD 日付。`%Y-%m-%d` と同等。                                                                               | `2023-07-06`               |
| `%r` | ローカライズされた 12 時間制の時刻（ロケール依存）                                                                                       | `06:32:07 PM`              |
| `%R` | &quot;%H:%M&quot; と同じ                                                                                             | `18:32`                    |
| `%T` | &quot;%H:%M:%S&quot;（ISO 8601 の時刻形式）と同等                                                                           | `18:32:07`                 |
| `%p` | ローカライズされた a.m./p.m. の表記（ロケールに依存）                                                                                  | `PM`                       |
| `%z` | ISO 8601 形式で表した UTC からのオフセット（例: -0430）、またはタイムゾーン情報がない場合は空文字列                                                      | `+0800`                    |
| `%Z` | ロケール依存のタイムゾーン名または略称。タイムゾーン情報が利用できない場合は空文字列。                                                                       | `Z AWST `                  |

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

ログメッセージをコンソールのみに出力するには:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベル単位での上書き**

個々のログ名ごとにログレベルを上書きできます。たとえば、ロガー「Backup」と「RBAC」のすべてのメッセージを出力しないように設定できます。

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

ログメッセージを `syslog` にも出力するには、次のようにします。

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

| Key        | Description                                                                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | `host\[:port\]` 形式の syslog のアドレス。省略した場合はローカルデーモンが使用されます。                                                                                                                                                                     |
| `hostname` | ログを送信するホスト名（省略可能）。                                                                                                                                                                                                           |
| `facility` | syslog の [facility keyword](https://en.wikipedia.org/wiki/Syslog#Facility)。先頭に &quot;LOG&#95;&quot; を付け、大文字で指定する必要があります。例：`LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` など。デフォルト：`address` が指定されている場合は `LOG_USER`、それ以外は `LOG_DAEMON`。 |
| `format`   | ログメッセージの形式。指定可能な値：`bsd` および `syslog`。                                                                                                                                                                                        |

**ログ形式**

コンソールログに出力されるログ形式を指定できます。現在は JSON のみがサポートされています。

**例**

出力される JSON ログの例は次のとおりです。

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "シグナル2を受信",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

JSON ログ出力を有効にするには、次のコードスニペットを使用します。

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- チャネル単位(log、errorlog、console、syslog)で設定するか、全チャネルに対してグローバルに設定できます(グローバル設定の場合は省略してください)。 -->
        <!-- <channel></channel> -->
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

**JSON ログのキー名の変更**

キー名は、`<names>` タグ内のタグの値を変更することで変更できます。たとえば、`DATE_TIME` を `MY_DATE_TIME` に変更するには、`<date_time>MY_DATE_TIME</date_time>` を使用します。

**JSON ログのキーの省略**

ログのプロパティは、そのプロパティをコメントアウトすることで省略できます。たとえば、ログに `query_id` を出力したくない場合は、`<query_id>` タグをコメントアウトします。


## macros {#macros}

レプリケーテッドテーブルのパラメータ置換。

レプリケーテッドテーブルを使用しない場合は省略可能です。

詳細については、[レプリケーテッドテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)のセクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```


## mark_cache_policy {#mark_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
マークキャッシュのポリシー名。


## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio}

<SettingsInfoBlock type='Double' default_value='0.95' />
プレウォーム中に充填するマークキャッシュの総サイズに対する比率。


## mark_cache_size {#mark_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
マーク（[`MergeTree`](/engines/table-engines/mergetree-family)ファミリーのテーブルのインデックス）のキャッシュの最大サイズ。

:::note
この設定は実行時に変更でき、即座に反映されます。
:::


## mark_cache_size_ratio {#mark_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
マークキャッシュにおける保護キュー(SLRUポリシー使用時)のサイズを、キャッシュ全体のサイズに対する比率で指定します。


## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='64' />
起動時にアクティブなデータパーツのセットを読み込むために使用するスレッド数。


## max_authentication_methods_per_user {#max_authentication_methods_per_user}

<SettingsInfoBlock type='UInt64' default_value='100' />
ユーザーの作成時または変更時に設定できる認証方式の最大数。この設定を変更しても既存のユーザーには影響しません。認証関連の作成/変更クエリは、この設定で指定された制限を超えると失敗します。認証に関連しない作成/変更クエリは成功します。

:::note
`0` を指定すると無制限になります。
:::


## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
サーバー上のすべてのバックアップに対する最大読み取り速度(バイト/秒単位)。0は無制限を意味します。


## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Backups IO スレッドプール内の**アイドル状態**のスレッド数が
`max_backup_io_thread_pool_free_size` を超えた場合、ClickHouse はアイドル状態のスレッドが占有しているリソースを解放し、プールサイズを削減します。必要に応じてスレッドは再作成されます。


## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />
ClickHouseは、S3バックアップのIO操作を実行するために、バックアップIOスレッドプールのスレッドを使用します。`max_backups_io_thread_pool_size`は、プール内のスレッドの最大数を制限します。


## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
ベクトルインデックスの構築に使用するスレッドの最大数。

:::note
値 `0` は全てのコアを使用することを意味します。
:::


## max_concurrent_insert_queries {#max_concurrent_insert_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
同時実行可能なINSERTクエリの総数を制限します。

:::note

`0`（デフォルト）を指定すると無制限になります。

この設定は実行時に変更でき、即座に反映されます。既に実行中のクエリには影響しません。
:::


## max_concurrent_queries {#max_concurrent_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
同時実行されるクエリの総数の制限です。`INSERT`および`SELECT`クエリに対する制限、およびユーザーごとのクエリの最大数も考慮する必要があることに注意してください。

関連項目:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

値`0`(デフォルト)は無制限を意味します。

この設定は実行時に変更可能で、即座に有効になります。既に実行中のクエリは影響を受けません。
:::


## max_concurrent_select_queries {#max_concurrent_select_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
同時実行可能なSELECTクエリの総数の上限。

:::note

`0`（デフォルト）の場合は無制限です。

この設定は実行時に変更可能で、即座に反映されます。既に実行中のクエリには影響しません。
:::


## max_connections {#max_connections}

<SettingsInfoBlock type='Int32' default_value='4096' />
サーバーへの最大接続数。


## max_database_num_to_throw {#max_database_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
データベース数がこの値を超えた場合、サーバーは例外をスローします。0は制限なしを意味します。


## max_database_num_to_warn {#max_database_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='1000' />
アタッチされたデータベースの数が指定された値を超えた場合、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size}

<SettingsInfoBlock type='UInt32' default_value='1' />
DatabaseReplicatedでレプリカ復旧中にテーブルを作成する際に使用するスレッド数。0を指定した場合、スレッド数はコア数と同じになります。


## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
辞書の数がこの値より大きい場合、サーバーは例外をスローします。

以下のデータベースエンジンのテーブルのみをカウントします:

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が`0`の場合は制限なしを意味します。
:::

**例**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```


## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='1000' />
アタッチされたディクショナリの数が指定された値を超えた場合、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
サーバー上の分散キャッシュからの最大合計読み取り速度(バイト/秒単位)。0は無制限を意味します。


## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
サーバー上の分散キャッシュへの最大合計書き込み速度(バイト/秒単位)。0は無制限を意味します。


## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats}

<SettingsInfoBlock type='UInt64' default_value='10000' />
集約処理中に収集されるハッシュテーブル統計が保持可能なエントリ数の上限


## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='64' />
ALTER TABLE FETCH PARTITION のスレッド数。


## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
入力解析用のスレッドプールに保持するアイドル状態のスタンバイスレッドの最大数。


## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
入力解析に使用するスレッドの最大総数。


## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
IOスレッドプール内の**アイドル状態**のスレッド数が`max_io_thread_pool_free_size`を超えた場合、ClickHouseはアイドル状態のスレッドが占有しているリソースを解放し、プールサイズを縮小します。必要に応じてスレッドを再作成できます。


## max_io_thread_pool_size {#max_io_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
ClickHouseは、一部のIO操作（S3との通信など）を実行するために、IOスレッドプールのスレッドを使用します。`max_io_thread_pool_size`は、プール内のスレッドの最大数を制限します。


## max_keep_alive_requests {#max_keep_alive_requests}

<SettingsInfoBlock type='UInt64' default_value='10000' />
単一のキープアライブ接続でClickHouseサーバーが接続を閉じるまでに処理できる最大リクエスト数。

**例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
ローカル読み取りの最大速度(バイト/秒)。

:::note
値が`0`の場合は無制限を意味します。
:::


## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
ローカル書き込みの最大速度(バイト/秒単位)。

:::note
値`0`は無制限を意味します。
:::


## max_materialized_views_count_for_table {#max_materialized_views_count_for_table}

<SettingsInfoBlock type='UInt64' default_value='0' />テーブルにアタッチされたマテリアライズドビューの数の制限です。

:::note
ここでは直接依存するビューのみが対象となり、あるビューの上に別のビューを作成する場合は対象外です。
:::


## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
サーバー上のすべてのマージの最大読み取り速度(バイト/秒単位)。0は無制限を意味します。


## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
サーバー上のすべてのミューテーションの最大読み取り速度（バイト/秒単位）。0は無制限を意味します。


## max_named_collection_num_to_throw {#max_named_collection_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
名前付きコレクションの数がこの値を超えた場合、サーバーは例外をスローします。

:::note
値が`0`の場合は制限なしを意味します。
:::

**例**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max_named_collection_num_to_warn {#max_named_collection_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='1000' />
名前付きコレクションの数が指定された値を超えた場合、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max_open_files {#max_open_files}

開くことができるファイルの最大数。

:::note
macOSでは`getrlimit()`関数が正しくない値を返すため、このオプションの使用を推奨します。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```


## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection}

<SettingsInfoBlock type='Float' default_value='0' />
接続を切断するかどうかを判断するための、OS CPU待機時間（OSCPUWaitMicrosecondsメトリック）とビジー時間（OSCPUVirtualTimeMicrosecondsメトリック）の最大比率。
最小比率と最大比率の間で線形補間を使用して確率を計算し、この時点で確率は1となります。
詳細については、[サーバーCPU過負荷時の動作制御](/operations/settings/server-overload)を参照してください。


## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='32' />
起動時に非アクティブなデータパーツ（古いパーツ）を読み込むためのスレッド数。


## max_part_num_to_warn {#max_part_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='100000' />
アクティブなパート数が指定された値を超えた場合、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max_partition_size_to_drop {#max_partition_size_to_drop}

<SettingsInfoBlock type='UInt64' default_value='50000000000' />
パーティション削除の制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのサイズが[`max_partition_size_to_drop`](#max_partition_size_to_drop)(バイト単位)を超える場合、[DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart)クエリを使用してパーティションを削除できません。
この設定の適用にClickHouseサーバーの再起動は不要です。制限を無効にする別の方法として、`<clickhouse-path>/flags/force_drop_table`ファイルを作成する方法があります。

:::note
値`0`は、制限なしでパーティションを削除できることを意味します。

この制限はDROP TABLEおよびTRUNCATE TABLEには適用されません。[max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)を参照してください
:::

**例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='128' />
非アクティブなデータパーツを並行削除するためのスレッド数。


## max_pending_mutations_execution_time_to_warn {#max_pending_mutations_execution_time_to_warn}

<SettingsInfoBlock type='UInt64' default_value='86400' />
保留中のミューテーションのいずれかが指定された秒数を超えた場合、
ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max_pending_mutations_to_warn {#max_pending_mutations_to_warn}

<SettingsInfoBlock type='UInt64' default_value='500' />
保留中のミューテーション数が指定された値を超えた場合、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
プレフィックスデシリアライゼーションスレッドプール内の**アイドル状態**のスレッド数が
`max_prefixes_deserialization_thread_pool_free_size` を超えた場合、ClickHouseは
アイドル状態のスレッドが占有しているリソースを解放し、プールサイズを縮小します。必要に応じて
スレッドを再作成できます。


## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
ClickHouseは、MergeTreeのWideパートにおいて、ファイルプレフィックスからカラムおよびサブカラムのメタデータを並列読み取りするために、プレフィックスデシリアライゼーションスレッドプールのスレッドを使用します。`max_prefixes_deserialization_thread_pool_size`は、プール内の最大スレッド数を制限します。


## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
読み取り時のネットワーク経由のデータ交換の最大速度（バイト/秒）。

:::note
`0`（デフォルト）の場合は無制限を意味します。
:::


## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
書き込み時のネットワーク経由のデータ交換の最大速度(バイト/秒)。

:::note
値が `0`(デフォルト)の場合は無制限を意味します。
:::


## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
レプリケートされたフェッチにおけるネットワーク経由のデータ交換の最大速度（バイト/秒）。0は無制限を意味します。


## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
レプリケーション送信時のネットワーク経由のデータ交換の最大速度（バイト/秒単位）。0は無制限を意味します。


## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
レプリケートされたテーブルの数がこの値を超えた場合、サーバーは例外をスローします。

次のデータベースエンジンのテーブルのみがカウント対象となります：

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0` を指定すると制限なしを意味します。
:::

**例**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```


## max_server_memory_usage {#max_server_memory_usage}

<SettingsInfoBlock type='UInt64' default_value='0' />
サーバーが使用できる最大メモリ量をバイト単位で表します。

:::note
サーバーの最大メモリ消費量は、`max_server_memory_usage_to_ram_ratio`設定によってさらに制限されます。
:::

特殊なケースとして、値が`0`(デフォルト)の場合、サーバーは利用可能なすべてのメモリを消費できます(`max_server_memory_usage_to_ram_ratio`による追加の制限を除く)。


## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

<SettingsInfoBlock type='Double' default_value='0.9' />
サーバーが使用できる最大メモリ量を、利用可能な全メモリに対する比率で表します。

例えば、`0.9`(デフォルト)の場合、サーバーは利用可能なメモリの90%まで使用できます。

メモリが少ないシステムでメモリ使用量を抑えることができます。
RAMとスワップが少ないホストでは、[`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio)を1より大きく設定する必要がある場合があります。

:::note
サーバーの最大メモリ消費量は、`max_server_memory_usage`設定によってさらに制限されます。
:::


## max_session_timeout {#max_session_timeout}

最大セッションタイムアウト（秒単位）。

例：

```xml
<max_session_timeout>3600</max_session_timeout>
```


## max_table_num_to_throw {#max_table_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
テーブル数がこの値より大きい場合、サーバーは例外をスローします。

以下のテーブルはカウント対象外です：

- view
- remote
- dictionary
- system

以下のデータベースエンジンのテーブルのみカウントされます：

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が `0` の場合は制限なしを意味します。
:::

**例**

```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```


## max_table_num_to_warn {#max_table_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='5000' />
アタッチされたテーブルの数が指定された値を超えた場合、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```


## max_table_size_to_drop {#max_table_size_to_drop}

<SettingsInfoBlock type='UInt64' default_value='50000000000' />
テーブル削除の制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのサイズが`max_table_size_to_drop`(バイト単位)を超える場合、[`DROP`](../../sql-reference/statements/drop.md)クエリまたは[`TRUNCATE`](../../sql-reference/statements/truncate.md)クエリを使用して削除できません。

:::note
値`0`は、制限なくすべてのテーブルを削除できることを意味します。

この設定の適用にClickHouseサーバーの再起動は不要です。制限を無効にする別の方法として、`<clickhouse-path>/flags/force_drop_table`ファイルを作成する方法があります。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
外部集約、結合、またはソートに使用できるストレージの最大量。この制限を超えるクエリは例外により失敗します。

:::note
値 `0` は無制限を意味します。
:::

関連項目:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)


## max_thread_pool_free_size {#max_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />
グローバルスレッドプール内の**アイドル状態**のスレッド数が
[`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size)
を超えた場合、ClickHouseは一部のスレッドが占有しているリソースを解放し、プールサイズを
縮小します。必要に応じてスレッドは再作成できます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```


## max_thread_pool_size {#max_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
ClickHouseはクエリ処理にグローバルスレッドプールのスレッドを使用します。クエリを処理できるアイドル状態のスレッドが存在しない場合、プール内に新しいスレッドが作成されます。
`max_thread_pool_size`はプール内のスレッドの最大数を制限します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```


## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
起動時に非アクティブなデータパーツ(予期しないもの)を読み込むためのスレッド数。


## max_view_num_to_throw {#max_view_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
ビューの数がこの値より大きい場合、サーバーは例外をスローします。

以下のデータベースエンジンのテーブルのみをカウントします:

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0` を指定すると制限なしを意味します。
:::

**例**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```


## max_view_num_to_warn {#max_view_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='10000' />
アタッチされたビューの数が指定された値を超えた場合、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries {#max_waiting_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
同時に待機するクエリの総数に対する制限。待機中のクエリの実行は、必要なテーブルが非同期で読み込まれている間ブロックされます([`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)を参照)。

:::note
待機中のクエリは、以下の設定によって制御される制限のチェック時にはカウントされません:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

この調整は、サーバー起動直後にこれらの制限に達することを回避するために行われます。
:::

:::note

値`0`(デフォルト)は無制限を意味します。

この設定は実行時に変更可能で、即座に有効になります。既に実行中のクエリは変更されません。
:::


## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker}

<SettingsInfoBlock type='Bool' default_value='0' />
バックグラウンドメモリワーカーが、jemallocやcgroupsなどの外部ソースからの情報に基づいて内部メモリトラッカーを修正するかどうかを指定します


## memory_worker_period_ms {#memory_worker_period_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />
メモリトラッカーのメモリ使用量を修正し、メモリ使用量が高い場合に未使用ページをクリーンアップするバックグラウンドメモリワーカーのティック周期。0に設定した場合、メモリ使用量のソースに応じてデフォルト値が使用されます


## memory_worker_use_cgroup {#memory_worker_use_cgroup}

<SettingsInfoBlock type='Bool' default_value='1' />
現在のcgroupメモリ使用量情報を使用してメモリトラッキングを補正します。


## merge_tree {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルの詳細設定。

詳細については、MergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload {#merge_workload}

<SettingsInfoBlock type='String' default_value='default' />
マージと他のワークロード間でのリソースの利用と共有を制御するために使用されます。指定された値は、すべてのバックグラウンドマージの `workload` 設定値として使用されます。マージツリー設定によって上書き可能です。

**関連項目**

- [ワークロードスケジューリング](/operations/workload-scheduling.md)


## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit}

<SettingsInfoBlock type='UInt64' default_value='0' />
マージおよびミューテーション操作の実行に使用可能なRAMの上限を設定します。ClickHouseが設定された上限に達すると、新しいバックグラウンドマージまたはミューテーション操作はスケジュールされませんが、既にスケジュールされているタスクは引き続き実行されます。

:::note
値`0`は無制限を意味します。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
デフォルトの`merges_mutations_memory_usage_soft_limit`値は、
`memory_amount * merges_mutations_memory_usage_to_ram_ratio`として計算されます。

**関連項目:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)


## metric_log {#metric_log}

デフォルトでは無効になっています。

**有効化**

メトリクス履歴収集[`system.metric_log`](../../operations/system-tables/metric_log.md)を手動で有効にするには、以下の内容で`/etc/clickhouse-server/config.d/metric_log.xml`を作成します:

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

`metric_log`設定を無効にするには、以下の内容で`/etc/clickhouse-server/config.d/disable_metric_log.xml`ファイルを作成します:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection}

<SettingsInfoBlock type='Float' default_value='0' />
接続を切断するかどうかを判断するための、OS CPU待機時間（OSCPUWaitMicrosecondsメトリック）とビジー時間（OSCPUVirtualTimeMicrosecondsメトリック）の最小比率。
最小比率と最大比率の間で線形補間を使用して確率を計算します。この時点での確率は0です。
詳細については、[サーバーCPU過負荷時の動作制御](/operations/settings/server-overload)を参照してください。


## mlock_executable {#mlock_executable}

起動後に`mlockall`を実行して、初回クエリのレイテンシを低減し、高IO負荷下でClickHouse実行ファイルがページアウトされるのを防ぎます。

:::note
このオプションの有効化を推奨しますが、起動時間が最大数秒増加します。
この設定は"CAP_IPC_LOCK"ケーパビリティなしでは機能しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```


## mmap_cache_size {#mmap_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1024' />
この設定により、頻繁なopen/close呼び出し(連続するページフォルトにより非常にコストが高い)を回避し、複数のスレッドやクエリ間でマッピングを再利用できます。設定値はマップされた領域の数を表します(通常はマップされたファイルの数と等しくなります)。

マップされたファイル内のデータ量は、以下のシステムテーブルで次のメトリクスを使用して監視できます:

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` in [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` in [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
マップされたファイル内のデータ量は、メモリを直接消費せず、クエリやサーバーのメモリ使用量にも計上されません。これは、このメモリがOSページキャッシュと同様に破棄可能であるためです。キャッシュは、MergeTreeファミリーのテーブルで古いパートが削除される際に自動的に破棄され(ファイルが閉じられ)、また`SYSTEM DROP MMAP CACHE`クエリによって手動で破棄することもできます。

この設定は実行時に変更可能で、即座に有効になります。
:::


## mutation_workload {#mutation_workload}

<SettingsInfoBlock type='String' default_value='default' />
ミューテーションと他のワークロード間でのリソースの利用と共有を制御するために使用されます。指定された値は、すべてのバックグラウンドミューテーションの `workload` 設定値として使用されます。マージツリー設定によって上書き可能です。

**関連項目**

- [ワークロードスケジューリング](/operations/workload-scheduling.md)


## mysql_port {#mysql_port}

MySQLプロトコルでクライアントと通信するためのポート。

:::note

- 正の整数でリッスンするポート番号を指定します
- 空の値を指定すると、MySQLプロトコルでのクライアント通信が無効になります。
  :::

**例**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport {#mysql_require_secure_transport}

trueに設定すると、[mysql_port](#mysql_port)を介したクライアントとのセキュアな通信が必須になります。`--ssl-mode=none`オプションを指定した接続は拒否されます。[OpenSSL](#openssl)の設定と併用してください。


## openSSL {#openssl}

SSLクライアント/サーバーの設定。

SSLのサポートは`libpoco`ライブラリによって提供されています。利用可能な設定オプションについては[SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)で説明されています。デフォルト値は[SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp)で確認できます。

サーバー/クライアント設定用のキー:


| オプション                         | 説明                                                                                                                                                                                                                                                                                                                      | デフォルト値                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 証明書の秘密鍵ファイルへのパス。ファイルには鍵と証明書の両方が同時に含まれている場合があります。                                                                                                                                                                                                                                                                    |                                                                                            |
| `certificateFile`             | PEM 形式のクライアント／サーバー証明書ファイルへのパス。`privateKeyFile` に証明書が含まれている場合は指定を省略できます。                                                                                                                                                                                                                                                 |                                                                                            |
| `caConfig`                    | 信頼済み CA 証明書を含むファイルまたはディレクトリへのパス。ファイルを指す場合は PEM 形式である必要があり、複数の CA 証明書を含めることができます。ディレクトリを指す場合は、各 CA 証明書ごとに 1 つの .pem ファイルを含める必要があります。ファイル名は CA のサブジェクト名のハッシュ値で検索されます。詳細は [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) の man ページを参照してください。 |                                                                                            |
| `verificationMode`            | ノードの証明書の検証方法です。詳細は [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明を参照してください。設定可能な値: `none`, `relaxed`, `strict`, `once`。                                                                                                                              | `relaxed`                                                                                  |
| `verificationDepth`           | 検証チェーンの最大長。証明書チェーンの長さが設定された値を超えると、検証は失敗します。                                                                                                                                                                                                                                                                             | `9`                                                                                        |
| `loadDefaultCAFile`           | OpenSSL の組み込み CA 証明書を使用するかどうか。ClickHouse は、組み込みの CA 証明書がファイル `/etc/ssl/cert.pem`（またはディレクトリ `/etc/ssl/certs`）、あるいは環境変数 `SSL_CERT_FILE`（または `SSL_CERT_DIR`）で指定されたファイル（またはディレクトリ）内にあると想定します。                                                                                                                               | `true`                                                                                     |
| `cipherList`                  | サポートされている OpenSSL の暗号化方式。                                                                                                                                                                                                                                                                                               | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | セッションのキャッシュを有効化または無効化します。`sessionIdContext` と組み合わせて使用する必要があります。指定可能な値: `true`、`false`。                                                                                                                                                                                                                                  | `false`                                                                                    |
| `sessionIdContext`            | サーバーが生成する各識別子に付加する、ランダムな文字からなる一意の文字列です。文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはなりません。サーバーがセッションをキャッシュする場合にも、クライアントがセッションのキャッシュを要求した場合にも問題を回避するのに役立つため、このパラメーターの設定は常に推奨されます。                                                                                                                                        | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | サーバーがキャッシュするセッションの最大数です。`0` を指定すると、セッション数は無制限になります。                                                                                                                                                                                                                                                                     | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | サーバー側でのセッションのキャッシュ保持時間（時間単位）。                                                                                                                                                                                                                                                                                           | `2`                                                                                        |
| `extendedVerification`        | 有効にすると、証明書の CN または SAN がピアのホスト名と一致するかどうかを検証します。                                                                                                                                                                                                                                                                         | `false`                                                                                    |
| `requireTLSv1`                | TLSv1 接続を必須とします。許容される値は `true`、`false` です。                                                                                                                                                                                                                                                                              | `false`                                                                                    |
| `requireTLSv1_1`              | TLSv1.1 接続を要求します。指定可能な値: `true`, `false`。                                                                                                                                                                                                                                                                               | `false`                                                                                    |
| `requireTLSv1_2`              | TLSv1.2 での接続を必須とします。許容される値は `true` または `false` です。                                                                                                                                                                                                                                                                      | `false`                                                                                    |
| `fips`                        | OpenSSL の FIPS モードを有効化します。ライブラリの OpenSSL バージョンが FIPS をサポートしている場合にのみ有効です。                                                                                                                                                                                                                                                | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandler のサブクラス）。例えば：`<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`。                                                                                                   | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するためのクラス（CertificateHandler のサブクラス）。例：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`                                                                                                                                                                         | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 使用が許可されていないプロトコル。                                                                                                                                                                                                                                                                                                       |                                                                                            |
| `preferServerCiphers`         | クライアント優先のサーバー側暗号スイート。                                                                                                                                                                                                                                                                                                   | `false`                                                                                    |

**設定例:**

```xml
<openSSL>
    <server>
        <!-- openssl req -subj "/CN=localhost" -new -newkey rsa:2048 -days 365 -nodes -x509 -keyout /etc/clickhouse-server/server.key -out /etc/clickhouse-server/server.crt で生成 -->
        <certificateFile>/etc/clickhouse-server/server.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/server.key</privateKeyFile>
        <!-- openssl dhparam -out /etc/clickhouse-server/dhparam.pem 4096 で生成 -->
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
        <!-- 自己署名証明書を使用する場合: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 自己署名証明書を使用する場合: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```


## opentelemetry_span_log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) システムテーブルの設定。

<SystemLogParameters />

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


## os_cpu_busy_time_threshold {#os_cpu_busy_time_threshold}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
CPUが有用な処理を実行していると判断するためのOS CPUビジー時間の閾値(マイクロ秒単位、OSCPUVirtualTimeMicrosecondsメトリック)。ビジー時間がこの値を下回る場合、CPU過負荷とは見なされません。


## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler}

<SettingsInfoBlock type='Int32' default_value='0' />
分散キャッシュTCPハンドラのスレッドに対するLinuxのnice値。値が小さいほどCPU優先度が高くなります。

CAP_SYS_NICE権限が必要です。権限がない場合は何も実行されません。

設定可能な値:-20から19。


## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate}

<SettingsInfoBlock type='Int32' default_value='0' />
マージおよびミューテーションスレッドのLinux nice値。値が小さいほどCPU優先度が高くなります。

CAP_SYS_NICE権限が必要です。権限がない場合は動作しません。

設定可能な値: -20から19。


## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive}

<SettingsInfoBlock type='Int32' default_value='0' />
ZooKeeperクライアントの送受信スレッドに対するLinux nice値。値が小さいほどCPU優先度が高くなります。

CAP_SYS_NICE権限が必要です。権限がない場合は何も実行されません。

設定可能な値: -20から19。


## page_cache_free_memory_ratio {#page_cache_free_memory_ratio}

<SettingsInfoBlock type='Double' default_value='0.15' />
ユーザースペースページキャッシュから解放状態に保つメモリ制限の割合。
Linuxのmin_free_kbytes設定に類似しています。


## page_cache_history_window_ms {#page_cache_history_window_ms}

<SettingsInfoBlock type='UInt64' default_value='1000' />
解放されたメモリがユーザー空間ページキャッシュで使用できるようになるまでの遅延時間。


## page_cache_max_size {#page_cache_max_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
ユーザー空間ページキャッシュの最大サイズ。キャッシュを無効にする場合は0に設定します。page_cache_min_sizeより大きい値を設定した場合、総メモリ使用量を制限値(max_server_memory_usage[_to_ram_ratio])以下に保ちながら、利用可能なメモリを最大限活用するため、キャッシュサイズはこの範囲内で継続的に調整されます。


## page_cache_min_size {#page_cache_min_size}

<SettingsInfoBlock type='UInt64' default_value='104857600' />
ユーザー空間ページキャッシュの最小サイズ。


## page_cache_policy {#page_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
ユーザー空間ページキャッシュポリシーの名前。


## page_cache_shards {#page_cache_shards}

<SettingsInfoBlock type='UInt64' default_value='4' />
ミューテックス競合を軽減するため、ユーザー空間ページキャッシュをこの数のシャードにストライプ化します。
実験的機能であり、パフォーマンス向上の可能性は低いです。


## page_cache_size_ratio {#page_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
ユーザー空間ページキャッシュ内の保護キューのサイズを、キャッシュの総サイズに対する比率で指定します。


## part_log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)に関連するイベントをログに記録します。例えば、データの追加やマージなどです。このログを使用してマージアルゴリズムをシミュレートし、その特性を比較できます。マージプロセスを可視化することも可能です。

イベントは別ファイルではなく、[system.part_log](/operations/system-tables/part_log)テーブルにログ記録されます。このテーブルの名前は`table`パラメータで設定できます(以下を参照)。

<SystemLogParameters />

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

<SettingsInfoBlock type='UInt64' default_value='30' />
SharedMergeTreeのパーツを完全に削除するまでの期間。ClickHouse Cloudでのみ使用可能


## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add}

<SettingsInfoBlock type='UInt64' default_value='10' />
kill_delay_periodに0からx秒の一様分布値を追加することで、
非常に多数のテーブルが存在する場合のサンダリングハード現象とそれに伴うZooKeeperのDoSを回避します。ClickHouse Cloudでのみ利用可能です


## parts_killer_pool_size {#parts_killer_pool_size}

<SettingsInfoBlock type='UInt64' default_value='128' />
共有マージツリーの古いパーツをクリーンアップするためのスレッド数。ClickHouse Cloudでのみ利用可能


## path {#path}

データを格納するディレクトリへのパスです。

:::note
末尾のスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
```


## postgresql_port {#postgresql_port}

PostgreSQLプロトコルでクライアントと通信するためのポート。

:::note

- 正の整数でリッスンするポート番号を指定します
- 空の値を指定すると、PostgreSQLプロトコルでのクライアント通信が無効になります。
  :::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport {#postgresql_require_secure_transport}

trueに設定すると、[postgresql_port](#postgresql_port)を介したクライアントとのセキュアな通信が必須になります。`sslmode=disable`オプションを指定した接続は拒否されます。[OpenSSL](#openssl)の設定と併用してください。


## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='100' />
リモートオブジェクトストレージのプリフェッチ用バックグラウンドプールのサイズ


## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
プリフェッチプールに投入可能なタスク数


## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
プレフィックスデシリアライゼーションスレッドプールにスケジュール可能なジョブの最大数。

:::note
値が `0` の場合は無制限を意味します。
:::


## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup}

<SettingsInfoBlock type='Bool' default_value='0' />
trueに設定すると、ClickHouseは起動前に設定されたすべての`system.*_log`テーブルを作成します。起動スクリプトがこれらのテーブルに依存している場合に役立ちます。


## primary_index_cache_policy {#primary_index_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
プライマリインデックスのキャッシュポリシー名。


## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio}

<SettingsInfoBlock type='Double' default_value='0.95' />
プレウォーム時に充填するマークキャッシュの総サイズに対する比率。


## primary_index_cache_size {#primary_index_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
プライマリインデックス(MergeTreeファミリーテーブルのインデックス)のキャッシュの最大サイズ。


## primary_index_cache_size_ratio {#primary_index_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
プライマリインデックスキャッシュの全体サイズに対する、保護キュー(SLRUポリシーの場合)のサイズ。


## process_query_plan_packet {#process_query_plan_packet}

<SettingsInfoBlock type='Bool' default_value='0' />
この設定はQueryPlanパケットの読み取りを許可します。このパケットは、serialize_query_planが有効になっている場合、分散クエリに対して送信されます。クエリプランのバイナリデシリアライゼーションにおけるバグに起因する潜在的なセキュリティ問題を回避するため、デフォルトでは無効になっています。

**例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors_profile_log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) システムテーブルの設定。

<SystemLogParameters />

デフォルト設定は次の通りです:

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

[Prometheus](https://prometheus.io)からスクレイピングするためのメトリクスデータを公開します。

設定:

- `endpoint` – PrometheusサーバーがメトリクスをスクレイピングするためのHTTPエンドポイント。'/'で始める必要があります。
- `port` – `endpoint`のポート番号。
- `metrics` – [system.metrics](/operations/system-tables/metrics)テーブルのメトリクスを公開します。
- `events` – [system.events](/operations/system-tables/events)テーブルのメトリクスを公開します。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルの現在のメトリクス値を公開します。
- `errors` - 最後のサーバー再起動以降に発生したエラーコード別のエラー数を公開します。この情報は[system.errors](/operations/system-tables/errors)からも取得できます。

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

確認方法(`127.0.0.1`をClickHouseサーバーのIPアドレスまたはホスト名に置き換えてください):

```bash
curl 127.0.0.1:9363/metrics
```


## proxy {#proxy}

HTTPおよびHTTPSリクエスト用のプロキシサーバーを定義します。現在、S3ストレージ、S3テーブル関数、およびURL関数でサポートされています。

プロキシサーバーを定義する方法は3つあります:

- 環境変数
- プロキシリスト
- リモートプロキシリゾルバー

特定のホストに対してプロキシサーバーをバイパスすることも、`no_proxy`を使用してサポートされています。

**環境変数**

`http_proxy`および`https_proxy`環境変数を使用すると、特定のプロトコルに対してプロキシサーバーを指定できます。システムに設定されている場合、シームレスに動作します。

特定のプロトコルに対してプロキシサーバーが1つだけで、そのプロキシサーバーが変更されない場合、これが最も簡単な方法です。

**プロキシリスト**

この方法では、プロトコルに対して1つ以上のプロキシサーバーを指定できます。複数のプロキシサーバーが定義されている場合、ClickHouseはラウンドロビン方式で異なるプロキシを使用し、サーバー間で負荷を分散します。プロトコルに対して複数のプロキシサーバーがあり、プロキシサーバーのリストが変更されない場合、これが最も簡単な方法です。

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

以下のタブで親フィールドを選択すると、その子要素が表示されます:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド | 説明                                |
| --------- | ----------------------------------- |
| `<http>`  | 1つ以上のHTTPプロキシのリスト        |
| `<https>` | 1つ以上のHTTPSプロキシのリスト       |

  </TabItem>
  <TabItem value="http_https" label="<http>と<https>">

| フィールド | 説明                 |
| ------- | -------------------- |
| `<uri>` | プロキシのURI         |

  </TabItem>
</Tabs>

**リモートプロキシリゾルバー**

プロキシサーバーが動的に変更される可能性があります。その場合、リゾルバーのエンドポイントを定義できます。ClickHouseはそのエンドポイントに空のGETリクエストを送信し、リモートリゾルバーはプロキシホストを返す必要があります。ClickHouseはこれを使用して、次のテンプレートでプロキシURIを構成します: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

以下のタブで親フィールドを選択すると、その子要素が表示されます:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド | 説明                              |
| --------- | --------------------------------- |
| `<http>`  | 1つ以上のリゾルバーのリスト\*      |
| `<https>` | 1つ以上のリゾルバーのリスト\*      |

  </TabItem>
  <TabItem value="http_https" label="<http>と<https>">

| フィールド    | 説明                                          |
| ------------ | --------------------------------------------- |
| `<resolver>` | リゾルバーのエンドポイントおよびその他の詳細   |

:::note
複数の`<resolver>`要素を持つことができますが、特定のプロトコルに対して最初の`<resolver>`のみが使用されます。そのプロトコルに対する他の`<resolver>`要素は無視されます。つまり、負荷分散(必要な場合)はリモートリゾルバーによって実装される必要があります。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| フィールド            | 説明                                                                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<endpoint>`         | プロキシリゾルバーのURI                                                                                                                                                                 |
| `<proxy_scheme>`     | 最終的なプロキシURIのプロトコル。`http`または`https`のいずれかを指定できます。                                                                                                           |
| `<proxy_port>`       | プロキシリゾルバーのポート番号                                                                                                                                                          |
| `<proxy_cache_time>` | リゾルバーからの値をClickHouseがキャッシュする時間(秒単位)。この値を`0`に設定すると、ClickHouseはHTTPまたはHTTPSリクエストごとにリゾルバーに接続します。                                    |

  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決定されます:


| 優先順 | 設定                     |
|--------|--------------------------|
| 1.     | リモートプロキシリゾルバ |
| 2.     | プロキシリスト           |
| 3.     | 環境変数                 |

ClickHouse は、リクエストプロトコルに対して最も優先度の高いリゾルバタイプを確認します。そこに設定がなければ、
環境リゾルバに到達するまで、次に優先度の高いリゾルバタイプを順に確認します。
これにより、複数種類のリゾルバタイプを組み合わせて使用することも可能です。



## query_cache {#query_cache}

[クエリキャッシュ](../query-cache.md)の設定。

以下の設定が利用可能です:

| 設定                      | 説明                                                                                 | デフォルト値  |
| ------------------------- | ------------------------------------------------------------------------------------ | ------------- |
| `max_size_in_bytes`       | キャッシュの最大サイズ(バイト単位)。`0`を指定するとクエリキャッシュが無効になります。 | `1073741824`  |
| `max_entries`             | キャッシュに保存される`SELECT`クエリ結果の最大数。                                    | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存可能な`SELECT`クエリ結果の最大サイズ(バイト単位)。                    | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存可能な`SELECT`クエリ結果の最大行数。                                  | `30000000`    |

:::note

- 設定の変更は即座に反映されます。
- クエリキャッシュのデータはDRAMに割り当てられます。メモリが不足している場合は、`max_size_in_bytes`に小さい値を設定するか、クエリキャッシュを完全に無効化してください。
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

<SettingsInfoBlock type='String' default_value='SLRU' />
クエリ条件キャッシュのポリシー名。


## query_condition_cache_size {#query_condition_cache_size}

<SettingsInfoBlock type='UInt64' default_value='104857600' />
クエリ条件キャッシュの最大サイズ。 :::note この設定は実行時に変更でき、即座に有効になります。 :::


## query_condition_cache_size_ratio {#query_condition_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
クエリ条件キャッシュにおける保護キュー（SLRUポリシーの場合）のサイズを、キャッシュの総サイズに対する相対的な割合で指定します。


## query_log {#query_log}

[log_queries=1](../../operations/settings/settings.md) 設定で受信したクエリをログに記録するための設定です。

クエリは別ファイルではなく、[system.query_log](/operations/system-tables/query_log) テーブルにログ記録されます。テーブル名は `table` パラメータで変更できます(以下を参照)。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse が自動的に作成します。ClickHouse サーバーの更新時にクエリログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

正規表現ベースのルールで、サーバーログ、[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes)テーブル、およびクライアントに送信されるログに保存される前に、クエリおよびすべてのログメッセージに適用されます。これにより、名前、メールアドレス、個人識別子、クレジットカード番号などの機密データがSQLクエリからログに漏洩することを防止できます。

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

| 設定      | 説明                                                                          |
| --------- | ----------------------------------------------------------------------------- |
| `name`    | ルールの名前(オプション)                                                      |
| `regexp`  | RE2互換の正規表現(必須)                                                       |
| `replace` | 機密データの置換文字列(オプション、デフォルトはアスタリスク6個)               |

マスキングルールはクエリ全体に適用されます(不正な形式または解析不可能なクエリからの機密データ漏洩を防ぐため)。

[`system.events`](/operations/system-tables/events)テーブルには、クエリマスキングルールの一致総数を保持する`QueryMaskingRulesMatch`カウンターがあります。

分散クエリの場合、各サーバーを個別に設定する必要があります。そうしないと、他のノードに渡されるサブクエリがマスキングなしで保存されます。


## query_metric_log {#query_metric_log}

デフォルトでは無効になっています。

**有効化**

メトリクス履歴収集[`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)を手動で有効にするには、以下の内容で`/etc/clickhouse-server/config.d/query_metric_log.xml`を作成します:

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

`query_metric_log`設定を無効にするには、以下の内容で`/etc/clickhouse-server/config.d/disable_query_metric_log.xml`ファイルを作成します:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query_thread_log {#query_thread_log}

[log_query_threads=1](/operations/settings/settings#log_query_threads)設定で受信したクエリのスレッドをログに記録するための設定です。

クエリは個別のファイルではなく、[system.query_thread_log](/operations/system-tables/query_thread_log)テーブルにログ記録されます。テーブル名は`table`パラメータで変更できます(以下を参照)。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouseが自動的に作成します。ClickHouseサーバーの更新時にクエリスレッドログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

[log_query_views=1](/operations/settings/settings#log_query_views)設定で受信したクエリに依存するビュー(ライブ、マテリアライズドなど)のログ記録を行うための設定です。

クエリは別ファイルではなく、[system.query_views_log](/operations/system-tables/query_views_log)テーブルに記録されます。テーブル名は`table`パラメータで変更できます(以下を参照)。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouseが自動的に作成します。ClickHouseサーバーの更新時にクエリビューログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

ヒュージページを使用してマシンコード（「テキスト」）のメモリを再割り当てするための設定です。

:::note
この機能は実験的な機能です。
:::

例：

```xml
<remap_executable>false</remap_executable>
```


## remote_servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md)テーブルエンジンおよび`cluster`テーブル関数で使用されるクラスタの設定。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl`属性の値については、「[設定ファイル](/operations/configuration-files)」のセクションを参照してください。

**関連項目**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [クラスタディスカバリー](../../operations/cluster-discovery.md)
- [レプリケーテッドデータベースエンジン](../../engines/database-engines/replicated.md)


## remote_url_allow_hosts {#remote_url_allow_hosts}

URL関連のストレージエンジンおよびテーブル関数で使用を許可するホストのリストです。

`\<host\>` XMLタグでホストを追加する際:

- DNS解決前に名前がチェックされるため、URLに記載されている通りに正確に指定する必要があります。例: `<host>clickhouse.com</host>`
- URLでポートが明示的に指定されている場合、host:port全体がチェックされます。例: `<host>clickhouse.com:80</host>`
- ホストがポートなしで指定されている場合、そのホストの任意のポートが許可されます。例: `<host>clickhouse.com</host>`が指定されている場合、`clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) などが許可されます。
- ホストがIPアドレスとして指定されている場合、URLに指定された通りにチェックされます。例: `[2a02:6b8:a::a]`
- リダイレクトが存在し、リダイレクトのサポートが有効になっている場合、すべてのリダイレクト(locationフィールド)がチェックされます。

例:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica_group_name {#replica_group_name}

Replicatedデータベースのレプリカグループ名。

Replicatedデータベースによって作成されるクラスタは、同じグループ内のレプリカで構成されます。
DDLクエリは同じグループ内のレプリカのみを待機します。

デフォルトでは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```


## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

<SettingsInfoBlock type='Seconds' default_value='0' />
パート取得リクエストのHTTP接続タイムアウト。明示的に設定されていない場合は、デフォルトプロファイルの`http_connection_timeout`から継承されます。


## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout}

<SettingsInfoBlock type='Seconds' default_value='0' />
パート取得リクエストのHTTP受信タイムアウト。明示的に設定されていない場合、デフォルトプロファイルの`http_receive_timeout`から継承されます。


## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout}

<SettingsInfoBlock type='Seconds' default_value='0' />
パートフェッチリクエストのHTTP送信タイムアウト。明示的に設定されていない場合は、デフォルトプロファイルの`http_send_timeout`から継承されます。


## replicated_merge_tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルの詳細設定です。この設定はより高い優先度を持ちます。

詳細については、MergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## restore_threads {#restore_threads}

<SettingsInfoBlock type='NonZeroUInt64' default_value='16' />
RESTOREリクエストの実行に使用する最大スレッド数。


## s3_credentials_provider_max_cache_size {#s3_credentials_provider_max_cache_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
キャッシュできるS3認証情報プロバイダーの最大数


## s3_max_redirects {#s3_max_redirects}

<SettingsInfoBlock type='UInt64' default_value='10' />
許可されるS3リダイレクトホップの最大数。


## s3_retry_attempts {#s3_retry_attempts}

<SettingsInfoBlock type='UInt64' default_value='500' />
Aws::Client::RetryStrategyの設定です。Aws::Clientは自動的にリトライを実行します。0を指定するとリトライを行いません


## s3queue_disable_streaming {#s3queue_disable_streaming}

<SettingsInfoBlock type='Bool' default_value='0' />
テーブルが作成され、マテリアライズドビューがアタッチされている場合でも、S3Queueのストリーミングを無効化します


## s3queue_log {#s3queue_log}

`s3queue_log`システムテーブルの設定です。

<SystemLogParameters />

デフォルト設定は以下の通りです:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```


## send_crash_reports {#send_crash_reports}

ClickHouseコア開発チームへクラッシュレポートを送信するための設定です。

特に本番前環境での有効化を強く推奨します。

キー:

| キー                   | 説明                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`             | 機能を有効にするブール値フラグ。デフォルトは`true`。クラッシュレポートの送信を無効にするには`false`に設定します。                                |
| `send_logical_errors` | `LOGICAL_ERROR`は`assert`のようなもので、ClickHouseのバグを示します。このブール値フラグはこれらの例外の送信を有効にします(デフォルト: `true`)。 |
| `endpoint`            | クラッシュレポート送信用のエンドポイントURLをオーバーライドできます。                                                                         |

**推奨される使用方法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path {#series_keeper_path}

<SettingsInfoBlock type='String' default_value='/clickhouse/series' />
`generateSerialID`関数によって生成される自動増分番号を持つKeeper内のパス。各シリーズはこのパス配下のノードになります。


## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

<SettingsInfoBlock type='Bool' default_value='1' />
trueに設定すると、スタックトレースにアドレスを表示します


## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores}

<SettingsInfoBlock type='Bool' default_value='1' />
trueに設定した場合、ClickHouseはシャットダウン前に実行中のバックアップおよびリストアの完了を待機します。


## shutdown_wait_unfinished {#shutdown_wait_unfinished}

<SettingsInfoBlock type='UInt64' default_value='5' />
未完了のクエリを待機する秒数


## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

<SettingsInfoBlock type='Bool' default_value='0' />
trueに設定すると、ClickHouseはシャットダウン前に実行中のクエリの完了を待機します。


## skip_binary_checksum_checks {#skip_binary_checksum_checks}

<SettingsInfoBlock type='Bool' default_value='0' />
ClickHouseバイナリのチェックサム整合性検証をスキップします


## ssh_server {#ssh_server}

ホストキーの公開鍵は、初回接続時にSSHクライアント側のknown_hostsファイルに書き込まれます。

ホストキーの設定はデフォルトで無効になっています。
ホストキーの設定のコメントを解除し、各SSHキーへのパスを指定して有効化してください:

例:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## startup_mv_delay_ms {#startup_mv_delay_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />
マテリアライズドビュー作成の遅延をシミュレートするデバッグパラメータ


## storage_configuration {#storage_configuration}

ストレージのマルチディスク構成を可能にします。

ストレージ構成は以下の構造に従います:

```xml
<storage_configuration>
    <disks>
        <!-- configuration -->
    </disks>
    <policies>
        <!-- configuration -->
    </policies>
</storage_configuration>
```

### ディスクの構成 {#configuration-of-disks}

`disks`の構成は以下の構造に従います:

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

上記のサブタグは`disks`に対して以下の設定を定義します:

| 設定                    | 説明                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `<disk_name_N>`         | ディスクの名前。一意である必要があります。                                                         |
| `path`                  | サーバーデータが保存されるパス(`data`および`shadow`ディレクトリ)。末尾は`/`で終わる必要があります |
| `keep_free_space_bytes` | ディスク上に予約される空き容量のサイズ。                                                              |

:::note
ディスクの順序は重要ではありません。
:::

### ポリシーの構成 {#configuration-of-policies}

上記のサブタグは`policies`に対して以下の設定を定義します:


| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシー名。ポリシー名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `volume_name_N`              | ボリューム名。ボリューム名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `disk`                       | ボリューム内にあるディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `max_data_part_size_bytes`   | このボリューム内の任意のディスクに配置できるデータチャンクの最大サイズ。マージの結果としてチャンクサイズが `max_data_part_size_bytes` を超えると見込まれる場合、そのチャンクは次のボリュームに書き込まれます。基本的に、この機能により、新規 / 小さなチャンクをホット (SSD) ボリュームに保存し、大きなサイズに達したときにコールド (HDD) ボリュームに移動できます。ポリシーに 1 つのボリュームしかない場合は、このオプションを使用しないでください。                                                                 |
| `move_factor`                | ボリューム上で利用可能な空き容量の割合。この値を下回ると、次のボリュームが存在する場合はデータの転送が開始されます。転送にあたっては、チャンクはサイズの大きいものから小さいものへ（降順で）ソートされ、合計サイズが `move_factor` の条件を満たすのに十分なチャンクが選択されます。すべてのチャンクの合計サイズでも不十分な場合は、すべてのチャンクが移動されます。                                                                                                             |
| `perform_ttl_move_on_insert` | 挿入時に TTL が期限切れとなっているデータの移動を無効にします。デフォルト（有効）の場合、ライフタイムに基づく移動ルールに従ってすでに期限切れとなっているデータを挿入すると、それは直ちに移動ルールで指定されたボリューム / ディスクに移動されます。ターゲットのボリューム / ディスクが遅い場合（例: S3）、これは挿入を大きく低速化する可能性があります。無効にした場合、期限切れ部分のデータはいったんデフォルトボリュームに書き込まれた後、期限切れ TTL に対するルールで指定されたボリュームに直ちに移動されます。 |
| `load_balancing`             | ディスクのバランシングポリシー。`round_robin` または `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`          | すべてのディスク上の利用可能な空き容量を更新するためのタイムアウト（ミリ秒）を設定します（`0` - 常に更新、`-1` - 一切更新しない、デフォルト値は `60000`）。ディスクが ClickHouse のみによって使用され、ファイルシステムが動的にリサイズされることがない場合は、`-1` の値を使用できます。それ以外のすべての場合、この設定は推奨されません。最終的に不正確な容量割り当てを引き起こすためです。                                                                                                                   |
| `prefer_not_to_merge`        | このボリューム上のデータパーツのマージを無効にします。注意: これは潜在的に有害で、低速化を引き起こす可能性があります。この設定が有効な場合（しないことを推奨します）、このボリューム上でのデータマージは禁止されます（これは好ましくありません）。これにより、ClickHouse が低速なディスクとどのようにやり取りするかを制御できます。この設定は使用しないことを推奨します。                                                                                                                                                                                       |
| `volume_priority`            | ボリュームにデータを格納する優先度（順序）を定義します。値が小さいほど優先度が高くなります。パラメータ値は自然数でなければならず、1 から N（N は指定されたパラメータ値の最大値）までの範囲を欠番なく埋める必要があります。                                                                                                                                                                                                                                                                |

For the `volume_priority`:
- すべてのボリュームにこのパラメータがある場合、指定された順序で優先されます。
- _一部の_ ボリュームのみに設定されている場合、設定されていないボリュームは最も低い優先度となります。設定されているボリュームはパラメータ値に従って優先され、それ以外のボリュームの優先度は設定ファイル内での記述順によって互いに決定されます。
- _どの_ ボリュームにもこのパラメータが指定されていない場合、その順序は設定ファイル内での記述順によって決定されます。
- ボリュームの優先度は同一である必要はありません。



## storage_connections_soft_limit {#storage_connections_soft_limit}

<SettingsInfoBlock type='UInt64' default_value='100' />
この制限を超える接続は、存続時間が大幅に短縮されます。この制限はストレージ接続に適用されます。


## storage_connections_store_limit {#storage_connections_store_limit}

<SettingsInfoBlock type='UInt64' default_value='5000' />
この制限を超える接続は使用後にリセットされます。接続キャッシュを無効にする場合は0に設定します。この制限はストレージ接続に適用されます。


## storage_connections_warn_limit {#storage_connections_warn_limit}

<SettingsInfoBlock type='UInt64' default_value='1000' />
使用中の接続数がこの制限を超えた場合、警告メッセージがログに記録されます。この制限はストレージ接続に適用されます。


## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key}

<SettingsInfoBlock type='Bool' default_value='1' />
ディスクメタデータファイルをVERSION_FULL_OBJECT_KEY形式で書き込みます。デフォルトで有効です。この設定は非推奨です。


## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid}

<SettingsInfoBlock type='Bool' default_value='1' />
有効にすると、SharedSetおよびSharedJoinの作成時に内部UUIDが生成されます。ClickHouse Cloudのみ対応


## table_engines_require_grant {#table_engines_require_grant}

trueに設定すると、ユーザーは特定のエンジンでテーブルを作成する際に権限の付与が必要になります。例：`GRANT TABLE ENGINE ON TinyLog to user`

:::note
デフォルトでは、後方互換性のため、特定のテーブルエンジンでテーブルを作成する際に権限の付与は不要ですが、この設定をtrueにすることでこの動作を変更できます。
:::


## tables_loader_background_pool_size {#tables_loader_background_pool_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
バックグラウンドプールで非同期ロードジョブを実行するスレッド数を設定します。
バックグラウンドプールは、サーバー起動後、テーブルを待機しているクエリが存在しない場合に、
テーブルを非同期でロードするために使用されます。多数のテーブルが存在する場合、
バックグラウンドプールのスレッド数を少なく保つことで、
同時クエリ実行のためのCPUリソースを確保できるため有益です。

:::note
値が `0` の場合、利用可能なすべてのCPUが使用されます。
:::


## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
フォアグラウンドプールでロードジョブを実行するスレッド数を設定します。フォアグラウンドプールは、サーバーがポートでのリッスンを開始する前にテーブルを同期的にロードする際や、待機対象のテーブルをロードする際に使用されます。フォアグラウンドプールはバックグラウンドプールよりも優先度が高く、フォアグラウンドプールでジョブが実行されている間は、バックグラウンドプールでジョブが開始されません。

:::note
`0` を指定すると、利用可能なすべてのCPUが使用されます。
:::


## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num}

<SettingsInfoBlock type='UInt64' default_value='0' />
TCP接続が閉じられる前に許可されるクエリの最大数。無制限にする場合は0に設定します。


## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds}

<SettingsInfoBlock type='UInt64' default_value='0' />
TCP接続が閉じられるまでの最大存続時間(秒単位)。無制限にする場合は0に設定します。


## tcp_port {#tcp_port}

TCPプロトコルでクライアントと通信するためのポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```


## tcp_port_secure {#tcp_port_secure}

クライアントとのセキュアな通信用のTCPポート。[OpenSSL](#openssl)設定と併用してください。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## tcp_ssh_port {#tcp_ssh_port}

PTY経由で組み込みクライアントを使用し、ユーザーが接続して対話的にクエリを実行できるようにするSSHサーバーのポートです。

例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary_data_in_cache {#temporary_data_in_cache}

このオプションを使用すると、一時データは指定したディスクのキャッシュに保存されます。
このセクションでは、`cache`タイプのディスク名を指定する必要があります。
この場合、キャッシュと一時データは同じ領域を共有し、一時データを作成するためにディスクキャッシュが退避される可能性があります。

:::note
一時データストレージの設定には、`tmp_path`、`tmp_policy`、`temporary_data_in_cache`のいずれか1つのオプションのみを使用できます。
:::

**例**

`local_disk`のキャッシュと一時データの両方が、`tiny_local_cache`によって管理されるファイルシステム上の`/tiny_local_cache`に保存されます。

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


## temporary_data_in_distributed_cache {#temporary_data_in_distributed_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
分散キャッシュに一時データを格納します。


## text_index_dictionary_block_cache_max_entries {#text_index_dictionary_block_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
テキストインデックス辞書ブロックのキャッシュサイズ(エントリ数)。0の場合は無効。


## text_index_dictionary_block_cache_policy {#text_index_dictionary_block_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
テキストインデックス辞書ブロックキャッシュポリシーの名前。


## text_index_dictionary_block_cache_size {#text_index_dictionary_block_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
テキストインデックス辞書ブロックのキャッシュサイズ。0の場合は無効になります。

:::note
この設定は実行時に変更でき、即座に反映されます。
:::


## text_index_dictionary_block_cache_size_ratio {#text_index_dictionary_block_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
テキストインデックス辞書ブロックキャッシュにおける保護キュー（SLRUポリシー使用時）のサイズを、キャッシュ全体のサイズに対する比率で指定します。


## text_index_header_cache_max_entries {#text_index_header_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='100000' />
テキストインデックスヘッダーのキャッシュサイズ（エントリ数単位）。0の場合は無効になります。


## text_index_header_cache_policy {#text_index_header_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
テキストインデックスヘッダーのキャッシュポリシー名。


## text_index_header_cache_size {#text_index_header_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
テキストインデックスヘッダーのキャッシュサイズ。0 の場合は無効です。

:::note
この設定は実行時に変更でき、即座に有効になります。
:::


## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
テキストインデックスヘッダーキャッシュの総サイズに対する保護キュー(SLRUポリシーの場合)のサイズ。


## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
テキストインデックスのポスティングリストのキャッシュサイズ（エントリ数単位）。0 に設定すると無効になります。


## text_index_postings_cache_policy {#text_index_postings_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
テキストインデックスのポスティングリストのキャッシュポリシー名。


## text_index_postings_cache_size {#text_index_postings_cache_size}

<SettingsInfoBlock type='UInt64' default_value='2147483648' />
テキストインデックスのポスティングリスト用キャッシュのサイズ。0の場合は無効になります。

:::note
この設定は実行時に変更でき、即座に反映されます。
:::


## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
テキストインデックスのポスティングリストキャッシュにおける保護キュー（SLRUポリシーの場合）のサイズを、キャッシュ全体のサイズに対する比率で指定します。


## text_log {#text_log}

テキストメッセージのログ記録を行う[text_log](/operations/system-tables/text_log)システムテーブルの設定です。

<SystemLogParameters />

追加設定:

| 設定 | 説明                                                                 | デフォルト値 |
| ------- | --------------------------------------------------------------------------- | ------------- |
| `level` | テーブルに保存される最大メッセージレベル(デフォルトは`Trace`)。 | `Trace`       |

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

<SettingsInfoBlock type='UInt64' default_value='10000' />
グローバルスレッドプールにスケジュールできるジョブの最大数です。
キューサイズを増やすと、メモリ使用量が増加します。この値は
[`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size)と等しく保つことを推奨します。

:::note
値`0`は無制限を意味します。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='100' />
`local_filesystem_read_method = 'pread_threadpool'`の場合に、ローカルファイルシステムからの読み取りに使用されるスレッドプール内のスレッド数。


## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
ローカルファイルシステムから読み取りを行うスレッドプールにスケジュール可能なジョブの最大数。


## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='250' />
`remote_filesystem_read_method = 'threadpool'`の場合に、リモートファイルシステムからの読み取りに使用されるスレッドプール内のスレッド数。


## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
リモートファイルシステムからの読み取り用スレッドプールにスケジュール可能なジョブの最大数。


## threadpool_writer_pool_size {#threadpool_writer_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='100' />
オブジェクトストレージへの書き込みリクエスト用バックグラウンドプールのサイズ


## threadpool_writer_queue_size {#threadpool_writer_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
オブジェクトストレージへの書き込みリクエスト用のバックグラウンドプールにプッシュできるタスクの数


## throw_on_unknown_workload {#throw_on_unknown_workload}

<SettingsInfoBlock type='Bool' default_value='0' />
クエリ設定'workload'で未知のWORKLOADにアクセスする際の動作を定義します。

- `true`の場合、未知のワークロードにアクセスしようとするクエリからRESOURCE_ACCESS_DENIED例外がスローされます。WORKLOAD階層が確立され、デフォルトのWORKLOADが含まれた後、すべてのクエリに対してリソーススケジューリングを強制する際に有用です。
- `false`(デフォルト)の場合、未知のWORKLOADを指す'workload'設定を持つクエリに対して、リソーススケジューリングなしの無制限アクセスが提供されます。これは、デフォルトのWORKLOADが追加される前のWORKLOAD階層のセットアップ中に重要です。

**例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**関連項目**

- [ワークロードスケジューリング](/operations/workload-scheduling.md)


## timezone {#timezone}

サーバーのタイムゾーン。

UTCタイムゾーンまたは地理的位置のIANA識別子として指定します（例：Africa/Abidjan）。

タイムゾーンは、DateTimeフィールドがテキスト形式で出力される際（画面またはファイルへの出力時）や、文字列からDateTimeを取得する際に、StringとDateTime形式間の変換に必要です。また、入力パラメータでタイムゾーンが指定されていない場合、時刻と日付を扱う関数でもタイムゾーンが使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連項目**

- [session_timezone](../settings/settings.md#session_timezone)


## tmp_path {#tmp_path}

大規模なクエリ処理のための一時データを保存するローカルファイルシステム上のパス。

:::note

- 一時データストレージの設定には、`tmp_path`、`tmp_policy`、`temporary_data_in_cache`のいずれか1つのオプションのみを使用できます。
- 末尾のスラッシュは必須です。
  :::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp_policy {#tmp_policy}

一時データを格納するストレージのポリシーです。`tmp`プレフィックスを持つすべてのファイルは起動時に削除されます。

:::note
オブジェクトストレージを`tmp_policy`として使用する際の推奨事項:

- 各サーバーで個別の`bucket:path`を使用する
- `metadata_type=plain`を使用する
- このバケットにTTLを設定することも検討する
  :::

:::note

- 一時データストレージの設定には、`tmp_path`、`tmp_policy`、`temporary_data_in_cache`のいずれか1つのオプションのみ使用できます。
- `move_factor`、`keep_free_space_bytes`、`max_data_part_size_bytes`は無視されます。
- ポリシーは正確に_1つのボリューム_を持つ必要があります

詳細については、[MergeTreeテーブルエンジン](/engines/table-engines/mergetree-family/mergetree)のドキュメントを参照してください。
:::

**例**

`/disk1`が満杯になった場合、一時データは`/disk2`に保存されます。

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

追加するカスタムトップレベルドメインのリストを定義します。各エントリは `<name>/path/to/file</name>` の形式で指定します。

例:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

関連項目:

- 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) およびそのバリエーション。
  カスタムTLDリスト名を受け取り、トップレベルサブドメインから最初の有意なサブドメインまでを含むドメイン部分を返します。


## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
指定された値以下のサイズのランダムなメモリ割り当てを、`total_memory_profiler_sample_probability`に等しい確率で収集します。0は無効を意味します。この閾値が期待通りに動作するようにするには、'max_untracked_memory'を0に設定することを推奨します。


## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
指定された値以上のサイズのメモリ割り当てを、`total_memory_profiler_sample_probability`と等しい確率でランダムに収集します。0は無効を意味します。このしきい値が期待通りに動作するようにするには、'max_untracked_memory'を0に設定することを推奨します。


## total_memory_profiler_step {#total_memory_profiler_step}

<SettingsInfoBlock type='UInt64' default_value='0' />
サーバーのメモリ使用量が設定されたステップのバイト数を超えるたびに、メモリプロファイラはメモリ割り当て時のスタックトレースを収集します。0に設定するとメモリプロファイラは無効になります。数メガバイト未満の値はサーバーのパフォーマンスを低下させます。


## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

<SettingsInfoBlock type='Double' default_value='0' />
指定された確率でランダムなメモリ割り当てと解放を収集し、`trace_type`が`MemorySample`である
[system.trace_log](../../operations/system-tables/trace_log.md)システムテーブルに書き込みます。
この確率は、割り当てサイズに関係なく、すべての割り当てまたは解放に対して適用されます。サンプリングは、未追跡メモリの量が未追跡メモリ制限(デフォルト値は`4` MiB)を超えた場合にのみ発生することに注意してください。この制限は、
[total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step)
を下げることで低減できます。より細かいサンプリングを行うには、`total_memory_profiler_step`を`1`に設定できます。

使用可能な値:

- 正の浮動小数点数。
- `0` — `system.trace_log`システムテーブルへのランダムな割り当てと解放の書き込みが無効になります。


## trace_log {#trace_log}

[trace_log](/operations/system-tables/trace_log)システムテーブルの動作設定。

<SystemLogParameters />

デフォルトのサーバー設定ファイル`config.xml`には、以下の設定セクションが含まれています:

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

<SettingsInfoBlock type='String' default_value='SLRU' />
非圧縮キャッシュのポリシー名。


## uncompressed_cache_size {#uncompressed_cache_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
MergeTreeファミリーのテーブルエンジンで使用される非圧縮データの最大サイズ(バイト単位)。

サーバーには1つの共有キャッシュがあります。メモリは必要に応じて割り当てられます。このキャッシュは`use_uncompressed_cache`オプションが有効な場合に使用されます。

非圧縮キャッシュは、特定のケースにおいて非常に短いクエリに対して有効です。

:::note
値`0`は無効を意味します。

この設定は実行時に変更可能で、即座に反映されます。
:::


## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
非圧縮キャッシュにおける保護キュー（SLRUポリシーの場合）のサイズを、キャッシュ全体のサイズに対する相対的な割合で指定します。


## url_scheme_mappers {#url_scheme_mappers}

短縮またはシンボリックなURLプレフィックスを完全なURLに変換するための設定です。

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

ZooKeeperにおけるデータパートヘッダーの保存方法を指定します。この設定は[`MergeTree`](/engines/table-engines/mergetree-family)ファミリーにのみ適用されます。以下の方法で指定できます:

**`config.xml`ファイルの[merge_tree](#merge_tree)セクションでグローバルに設定**

ClickHouseはサーバー上のすべてのテーブルに対してこの設定を使用します。設定はいつでも変更可能です。既存のテーブルは設定変更時に動作が変わります。

**各テーブル単位で設定**

テーブル作成時に対応する[エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)を指定します。この設定を持つ既存のテーブルの動作は、グローバル設定が変更されても影響を受けません。

**設定可能な値**

- `0` — 機能を無効にします。
- `1` — 機能を有効にします。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)の場合、[レプリケート](../../engines/table-engines/mergetree-family/replication.md)テーブルは単一の`znode`を使用してデータパートヘッダーをコンパクトに保存します。テーブルに多数のカラムが含まれる場合、この保存方法によりZooKeeperに保存されるデータ量が大幅に削減されます。

:::note
`use_minimalistic_part_header_in_zookeeper = 1`を適用した後は、この設定をサポートしていないバージョンへのClickHouseサーバーのダウングレードはできません。クラスター内のサーバーでClickHouseをアップグレードする際は注意が必要です。すべてのサーバーを一度にアップグレードしないでください。テスト環境、またはクラスターの一部のサーバーで新しいバージョンのClickHouseをテストする方が安全です。

この設定で既に保存されているデータパートヘッダーは、以前の(非コンパクトな)表現に復元できません。
:::


## user_defined_executable_functions_config {#user_defined_executable_functions_config}

実行可能なユーザー定義関数の設定ファイルへのパス。

パス:

- 絶対パス、またはサーバー設定ファイルからの相対パスを指定します。
- パスにはワイルドカード \* および ? を含めることができます。

関連項目:

- 「[実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)」

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user_defined_path {#user_defined_path}

ユーザー定義ファイルを格納するディレクトリです。SQL ユーザー定義関数 [SQL User Defined Functions](/sql-reference/functions/udf) で使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user_directories {#user_directories}

以下の設定を含む設定ファイルのセクション：

- 事前定義されたユーザーを含む設定ファイルへのパス。
- SQLコマンドで作成されたユーザーが保存されるフォルダへのパス。
- SQLコマンドで作成され、レプリケートされるユーザーが保存されるZooKeeperノードパス。

このセクションが指定されている場合、[users_config](/operations/server-configuration-parameters/settings#users_config)および[access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path)のパスは使用されません。

`user_directories`セクションには任意の数の項目を含めることができ、項目の順序が優先順位を表します（上位の項目ほど優先順位が高くなります）。

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

ユーザー、ロール、行ポリシー、クォータ、およびプロファイルはZooKeeperに保存することもできます：

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

また、`memory`セクション（情報をメモリのみに保存し、ディスクに書き込まない）および`ldap`セクション（情報をLDAPサーバーに保存する）を定義することもできます。

ローカルに定義されていないユーザーのリモートユーザーディレクトリとしてLDAPサーバーを追加するには、以下の設定で単一の`ldap`セクションを定義します：

| 設定  | 説明                                                                                                                                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `server` | `ldap_servers`設定セクションで定義されたLDAPサーバー名のいずれか。このパラメータは必須であり、空にすることはできません。                                                                                                                                                                                                                                                            |
| `roles`  | LDAPサーバーから取得された各ユーザーに割り当てられる、ローカルに定義されたロールのリストを含むセクション。ロールが指定されていない場合、ユーザーは認証後に何も操作を実行できません。認証時にリストされたロールのいずれかがローカルに定義されていない場合、提供されたパスワードが誤っていたかのように認証の試行は失敗します。 |

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

ユーザーファイルを格納するディレクトリです。テーブル関数[file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md)で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_scripts_path {#user_scripts_path}

ユーザースクリプトファイルを格納するディレクトリです。実行可能ユーザー定義関数 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions) で使用されます。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

型:

デフォルト:


## users_config {#users_config}

以下を含むファイルへのパス：

- ユーザー設定
- アクセス権限
- 設定プロファイル
- クォータ設定

**例**

```xml
<users_config>users.xml</users_config>
```


## validate_tcp_client_information {#validate_tcp_client_information}

<SettingsInfoBlock type='Bool' default_value='0' />
クエリパケット受信時にクライアント情報の検証を有効にするかどうかを決定します。

デフォルトは `false` です：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='10000000' />
ベクトル類似性インデックスのキャッシュサイズ（エントリ数）。0 の場合は無効。


## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
ベクトル類似性インデックスキャッシュのポリシー名。


## vector_similarity_index_cache_size {#vector_similarity_index_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
ベクトル類似性インデックス用のキャッシュサイズ。0を指定すると無効化されます。

:::note
この設定は実行時に変更可能で、変更は即座に反映されます。
:::


## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
ベクトル類似性インデックスキャッシュにおける保護キュー(SLRUポリシーの場合)のサイズを、キャッシュの総サイズに対する相対値として指定します。


## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup}

<SettingsInfoBlock type='Bool' default_value='1' />
この設定は、`dictionaries_lazy_load` が `false` の場合の動作を指定できます。
（`dictionaries_lazy_load` が `true` の場合、この設定は影響しません。）

`wait_dictionaries_load_at_startup` が `false` の場合、サーバーは起動時にすべてのディクショナリの読み込みを開始し、読み込みと並行して接続を受け付けます。
ディクショナリがクエリで初めて使用される際、まだ読み込まれていない場合、クエリはディクショナリの読み込みが完了するまで待機します。
`wait_dictionaries_load_at_startup` を `false` に設定すると ClickHouse の起動を高速化できますが、一部のクエリの実行速度が低下する可能性があります
（一部のディクショナリの読み込み完了を待つ必要があるため）。

`wait_dictionaries_load_at_startup` が `true` の場合、サーバーは起動時に、すべてのディクショナリの読み込みが完了する（成功または失敗に関わらず）まで待機してから接続を受け付けます。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload_path {#workload_path}

すべての`CREATE WORKLOAD`および`CREATE RESOURCE`クエリの保存先として使用されるディレクトリです。デフォルトでは、サーバーの作業ディレクトリ配下の`/workload/`フォルダが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**関連項目**

- [ワークロード階層](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)


## workload_zookeeper_path {#workload_zookeeper_path}

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリのストレージとして使用される ZooKeeper ノードへのパスです。一貫性を保つため、すべての SQL 定義はこの単一の znode の値として格納されます。デフォルトでは ZooKeeper は使用されず、定義は[ディスク](#workload_path)上に格納されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**関連項目**

- [ワークロード階層](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)


## zookeeper {#zookeeper}

ClickHouseが[ZooKeeper](http://zookeeper.apache.org/)クラスタと連携するための設定を含みます。ClickHouseはレプリケートテーブルを使用する際に、レプリカのメタデータを保存するためにZooKeeperを使用します。レプリケートテーブルを使用しない場合、このパラメータセクションは省略できます。

以下の設定をサブタグで構成できます:

| 設定                                        | 説明                                                                                                                                                                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeperエンドポイント。複数のエンドポイントを設定できます。例: `<node index="1"><host>example_host</host><port>2181</port></node>`。`index`属性はZooKeeperクラスタへの接続を試みる際のノード順序を指定します。 |
| `session_timeout_ms`                       | クライアントセッションの最大タイムアウト(ミリ秒単位)。                                                                                                                                                                      |
| `operation_timeout_ms`                     | 1つの操作の最大タイムアウト(ミリ秒単位)。                                                                                                                                                                           |
| `root` (任意)                          | ClickHouseサーバーが使用するznodeのルートとして使用されるznode。                                                                                                                                                 |
| `fallback_session_lifetime.min` (任意) | プライマリが利用できない場合のフォールバックノードへのZooKeeperセッションの最小有効期間(負荷分散)。秒単位で設定します。デフォルト: 3時間。                                                                   |
| `fallback_session_lifetime.max` (任意) | プライマリが利用できない場合のフォールバックノードへのZooKeeperセッションの最大有効期間(負荷分散)。秒単位で設定します。デフォルト: 6時間。                                                                   |
| `identity` (任意)                      | ZooKeeperが要求されたznodeにアクセスするために必要なユーザー名とパスワード。                                                                                                                                                          |
| `use_compression` (任意)               | trueに設定するとKeeperプロトコルで圧縮を有効にします。                                                                                                                                                                       |

ZooKeeperノード選択のアルゴリズムを選択できる`zookeeper_load_balancing`設定(任意)もあります:

| アルゴリズム名                  | 説明                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `random`                        | ZooKeeperノードの中からランダムに1つを選択します。                                                                                       |
| `in_order`                      | 最初のZooKeeperノードを選択し、利用できない場合は2番目、というように順番に選択します。                                            |
| `nearest_hostname`              | サーバーのホスト名に最も類似したホスト名を持つZooKeeperノードを選択します。ホスト名は名前の接頭辞で比較されます。 |
| `hostname_levenshtein_distance` | nearest_hostnameと同様ですが、ホスト名をレーベンシュタイン距離で比較します。                                         |
| `first_or_random`               | 最初のZooKeeperノードを選択し、利用できない場合は残りのZooKeeperノードの中からランダムに1つを選択します。                |
| `round_robin`                   | 最初のZooKeeperノードを選択し、再接続が発生した場合は次のノードを選択します。                                                    |

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
    <!-- 任意。Chrootサフィックス。存在する必要があります。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- 任意。ZooKeeperダイジェストACL文字列。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**関連項目**

- [レプリケーション](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeperプログラマーズガイド](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouseとZooKeeper間のオプションのセキュア通信](/operations/ssl-zookeeper)


## zookeeper_log {#zookeeper_log}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) システムテーブルの設定。

以下の設定はサブタグで設定できます:

<SystemLogParameters />

**例**

```xml
<clickhouse>
    <zookeeper_log>
        <database>system</database>
        <table>zookeeper_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <ttl>event_date + INTERVAL 1 WEEK DELETE</ttl>
    </zookeeper_log>
</clickhouse>
```
