---
description: 'このセクションでは、サーバー設定、すなわちセッション単位やクエリ単位では変更できない設定について説明します。'
keywords: ['グローバルサーバー設定']
sidebar_label: 'サーバー設定'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: 'サーバー設定'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# サーバー設定 {#server-settings}

このセクションでは、サーバー設定について説明します。これらは
セッションやクエリレベルでは変更できない設定です。

ClickHouse における設定ファイルの詳細については、[「Configuration Files」](/operations/configuration-files) を参照してください。

その他の設定については、「[Settings](/operations/settings/overview)」セクションを参照してください。
各種設定を確認する前に、[Configuration files](/operations/configuration-files)
セクションを読み、置換（`incl` および `optional` 属性）の使い方を理解しておくことを推奨します。

## abort_on_logical_error {#abort_on_logical_error} 

<SettingsInfoBlock type="Bool" default_value="0" />`LOGICAL_ERROR` 例外が発生した場合にサーバーをクラッシュさせます。専門家のみ使用してください。

## access&#95;control&#95;improvements {#access_control_improvements}

アクセス制御システムにおける任意の改善向け設定。

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                            | Default |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | 行ポリシー（row policy）によって許可されていないユーザーでも、`SELECT` クエリを使用して行を読み取れるかどうかを設定します。たとえば、ユーザー A と B がいて、行ポリシーが A に対してのみ定義されている場合、この設定が `true` であればユーザー B はすべての行を参照できます。この設定が `false` であれば、ユーザー B はいかなる行も参照できません。                                                                                                                                                                    | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` クエリに `CLUSTER` 権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                           | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.&lt;table&gt;` が権限なしで任意のユーザーによって実行できるかどうかを設定します。`true` に設定した場合、このクエリには非 system テーブルと同様に `GRANT SELECT ON system.&lt;table&gt;` が必要になります。例外として、いくつかの system テーブル（`tables`、`columns`、`databases`、および `one`、`contributors` のような一部の定数テーブル）は依然として全員がアクセス可能です。また、`SHOW USERS` のような `SHOW` 権限が付与されている場合、対応する system テーブル（つまり `system.users`）にはアクセス可能です。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.&lt;table&gt;` が権限なしで任意のユーザーによって実行できるかどうかを設定します。`true` に設定した場合、このクエリには通常のテーブルと同様に `GRANT SELECT ON information_schema.&lt;table&gt;` が必要になります。                                                                                                                                                                                       | `true`  |
| `settings_constraints_replace_previous`         | ある設定について、設定プロファイル内の制約が、その設定に対して他のプロファイルで以前に定義された制約の動作を（新しい制約で設定されていないフィールドも含めて）打ち消すかどうかを設定します。また、`changeable_in_readonly` 制約タイプを有効にします。                                                                                                                                                                                                                                | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンを用いてテーブルを作成する際に、権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                            | `false` |
| `role_cache_expiration_time_seconds`            | 最終アクセスから何秒間、そのロールをロールキャッシュ（Role Cache）に保持するかを設定します。                                                                                                                                                                                                                                                                                                                    | `600`   |

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

ClickHouse サーバーが、SQL コマンドによって作成されたユーザーおよびロールの設定を保存するディレクトリへのパス。

**関連項目**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />groupArray で配列要素数の上限を超えた場合に実行するアクション: `throw` は例外を送出し、`discard` は超過した値を破棄します

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray 関数における配列要素の最大サイズ（バイト単位）。この制限はシリアル化時に検査され、状態のサイズが大きくなりすぎるのを防ぐのに役立ちます。

## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />

ユーザーが、異なる機能ティアに関連する設定を変更できるかどうかを制御します。

- `0` - すべての設定の変更が許可されます（experimental、beta、production）。
- `1` - beta および production 機能設定のみ変更が許可されます。experimental 設定の変更は拒否されます。
- `2` - production 設定のみ変更が許可されます。experimental または beta 設定の変更は拒否されます。

これは、すべての `EXPERIMENTAL` / `BETA` 機能に対して `readonly` 制約を設定することと同等です。

:::note
値が `0` の場合、すべての設定を変更できます。
:::

## allow_impersonate_user {#allow_impersonate_user} 

<SettingsInfoBlock type="Bool" default_value="0" />IMPERSONATE 機能 (EXECUTE AS target_user) を有効化または無効化します。

## allow&#95;implicit&#95;no&#95;password {#allow_implicit_no_password}

&#39;IDENTIFIED WITH no&#95;password&#39; が明示的に指定されていない限り、パスワードなしのユーザーを作成することを禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow&#95;no&#95;password {#allow_no_password}

安全性の低いパスワード種別 no&#95;password を許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```


## allow&#95;plaintext&#95;password {#allow_plaintext_password}

安全ではない平文パスワードタイプの使用を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc によるメモリ使用を許可します。

## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

Iceberg で使用可能なディスクの一覧

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />true の場合、グレースフルシャットダウン時に非同期挿入のキューがフラッシュされます

## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドでデータを実際にパースして挿入するスレッドの最大数。0 を指定すると非同期モードは無効になります。

## async&#95;load&#95;databases {#async_load_databases}

<SettingsInfoBlock type="Bool" default_value="1" />

データベースおよびテーブルを非同期で読み込みます。

* `true` の場合、`Ordinary`、`Atomic`、`Replicated` エンジンを持つすべてのシステム以外のデータベースは、ClickHouse サーバーの起動後に非同期で読み込まれます。`system.asynchronous_loader` テーブル、およびサーバー設定 `tables_loader_background_pool_size` と `tables_loader_foreground_pool_size` を参照してください。まだ読み込まれていないテーブルへアクセスしようとするクエリは、そのテーブルが起動するまで待機します。読み込みジョブが失敗した場合、クエリは（`async_load_databases = false` の場合のようにサーバー全体をシャットダウンするのではなく）エラーを再スローします。少なくとも 1 つのクエリによって待機されているテーブルは、より高い優先度で読み込まれます。データベースに対する DDL クエリも、そのデータベースが起動するまで待機します。さらに、待機中のクエリの総数に対する上限として `max_waiting_queries` の設定も検討してください。
* `false` の場合、サーバーの起動時にすべてのデータベースが読み込まれます。

**例**

```xml
<async_load_databases>true</async_load_databases>
```


## async&#95;load&#95;system&#95;database {#async_load_system_database}

<SettingsInfoBlock type="Bool" default_value="0" />

`system` データベース内のテーブルを非同期に読み込みます。`system` データベース内に大量のログテーブルやパーツがある場合に有用です。`async_load_databases` 設定とは独立しています。

* `true` に設定すると、ClickHouse サーバーの起動後に、`Ordinary`、`Atomic`、`Replicated` エンジンを持つすべての `system` データベースが非同期に読み込まれます。`system.asynchronous_loader` テーブル、およびサーバー設定 `tables_loader_background_pool_size` と `tables_loader_foreground_pool_size` を参照してください。まだ読み込まれていない system テーブルへアクセスしようとするクエリは、そのテーブルが利用可能になるまで待機します。少なくとも 1 つのクエリが待機しているテーブルは、より高い優先度で読み込まれます。また、待機中のクエリ総数を制限するために `max_waiting_queries` 設定の調整も検討してください。
* `false` に設定すると、サーバーの起動前に `system` データベースが読み込まれます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />負荷の高い非同期メトリクスを更新する間隔（秒）。

## asynchronous&#95;insert&#95;log {#asynchronous_insert_log}

非同期挿入を記録するための [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) システムテーブル向け設定です。

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


## asynchronous&#95;metric&#95;log {#asynchronous_metric_log}

ClickHouse Cloud のデプロイメントではデフォルトで有効になっています。

お使いの環境でこの設定がデフォルトで有効になっていない場合は、ClickHouse のインストール方法に応じて、以下の手順に従って有効または無効にできます。

**有効化**

非同期メトリクスログ履歴の収集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します。

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

`asynchronous_metric_log` 設定を無効化するには、次の内容で `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` ファイルを作成します。

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />負荷の高い非同期メトリクスの計算を有効にします。

## asynchronous_metrics_keeper_metrics_only {#asynchronous_metrics_keeper_metrics_only} 

<SettingsInfoBlock type="Bool" default_value="0" />非同期メトリクスに、keeper 関連のメトリクスのみを計算させます。

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />非同期メトリクスの更新間隔（秒）。

## auth_use_forwarded_address {#auth_use_forwarded_address} 

プロキシ経由で接続しているクライアントの認証において、元の接続元アドレスを使用します。

:::note
転送されたアドレスは容易に偽装されうるため、この設定は細心の注意を払って使用する必要があります。この種の認証を受け付けるサーバーには直接アクセスせず、必ず信頼できるプロキシ経由のみでアクセスするようにしてください。
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [Buffer エンジンテーブル](/engines/table-engines/special/buffer) のフラッシュ処理を実行するために使用されるスレッドの最大数。

## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドで [*MergeTree エンジン](/engines/table-engines/mergetree-family) テーブルに対して、さまざまな処理（主にガベージコレクション）を実行するために使用されるスレッドの最大数です。

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />分散送信の実行に使用されるスレッド数の上限。

## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルに対して別のレプリカからデータパーツを取得する際に使用されるスレッドの最大数。

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />

実行可能なバックグラウンドマージおよびミューテーションの並行実行数に対するスレッド数の比率を設定します。

例えば、この比率が 2 で、[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) が 16 に設定されている場合、ClickHouse は 32 個のバックグラウンドマージを同時に実行できます。これは、バックグラウンド処理を一時停止して延期できるためです。小さなマージの実行優先度を高めるために必要となります。

:::note
この比率は、実行時には増やすことしかできません。減らすにはサーバーを再起動する必要があります。

[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 設定と同様に、[`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) も後方互換性のために `default` プロファイルから適用できます。
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />

バックグラウンドでのマージおよびミューテーションのスケジューリング方法を制御するポリシーです。指定可能な値は `round_robin` と `shortest_task_first` です。

バックグラウンドスレッドプールによって、次に実行されるマージまたはミューテーションを選択するためのアルゴリズムです。ポリシーはサーバーを再起動することなく実行時に変更できます。
後方互換性のため、`default` プロファイルから適用できます。

指定可能な値:

- `round_robin` — すべての同時実行中のマージおよびミューテーションをラウンドロビン方式で実行し、飢餓状態が発生しないようにします。小さいマージは、マージ対象のブロック数が少ないため、大きいマージよりも速く完了します。
- `shortest_task_first` — 常により小さいマージまたはミューテーションを実行します。マージとミューテーションには、結果のサイズに基づいて優先度が割り当てられます。サイズの小さいマージは、大きいマージより厳密に優先されます。このポリシーは小さなパーツのマージを可能な限り高速に行えますが、大量の `INSERT` が行われているパーティションでは、大きなマージが無期限に飢餓状態に陥る可能性があります。

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />メッセージストリーミングのバックグラウンド処理を実行するために使用されるスレッド数の上限。

## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドで *MergeTree-engine テーブルのデータパーツを別のディスクまたはボリュームへ移動する際に使用されるスレッドの最大数。

## background&#95;pool&#95;size {#background_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />

MergeTree エンジンを使用するテーブルに対して、バックグラウンドでマージおよびミューテーションを実行するスレッド数を設定します。

:::note

* この設定は、ClickHouse サーバーの起動時に、後方互換性のため `default` プロファイルの設定から適用することもできます。
* 実行中に変更できるのは、スレッド数を増加させる場合のみです。
* スレッド数を減らすには、サーバーを再起動する必要があります。
* この設定を調整することで、CPU とディスクの負荷を制御できます。
  :::

:::danger
プールサイズを小さくすると CPU とディスクの使用量は減りますが、バックグラウンド処理の進行が遅くなり、最終的にはクエリ性能に影響を与える可能性があります。
:::

この設定を変更する前に、次のような関連する MergeTree の設定も確認してください。

* [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
* [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
* [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**例**

```xml
<background_pool_size>16</background_pool_size>
```


## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio} 

<SettingsInfoBlock type="Float" default_value="0.8" />プール内のスレッドのうち、同一タイプのタスクを同時に実行できる最大比率。

## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />レプリケーテッドテーブル、Kafka ストリーミング、および DNS キャッシュの更新のための軽量な定期的処理を継続的に実行する際に使用されるスレッドの最大数です。

## backup&#95;log {#backup_log}

`BACKUP` および `RESTORE` 操作を記録するための [backup&#95;log](../../operations/system-tables/backup_log.md) システムテーブルに関する設定。

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

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />`BACKUP` リクエストを実行するためのスレッドの最大数。

## backups {#backups}

[`BACKUP` および `RESTORE`](../backup.md) ステートメントを実行する際に使用されるバックアップ用の設定です。

以下の設定はサブタグで指定できます。

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','同一ホスト上で複数のバックアップ処理を同時に実行できるかどうかを制御します。', 'true'),
    ('allow_concurrent_restores', 'Bool', '同一ホスト上で複数のリストア処理を同時に実行できるかどうかを制御します。', 'true'),
    ('allowed_disk', 'String', '`File()` を使用する場合のバックアップ先ディスク。この設定は `File` を使用するために必ず設定する必要があります。', ''),
    ('allowed_path', 'String', '`File()` を使用する場合のバックアップ先パス。この設定は `File` を使用するために必ず設定する必要があります。', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '収集したメタデータを比較した結果に不整合があった場合に、スリープに入る前にメタデータ収集を試行する回数。', '2'),
    ('collect_metadata_timeout', 'UInt64', 'バックアップ中にメタデータを収集する際のタイムアウト（ミリ秒）。', '600000'),
    ('compare_collected_metadata', 'Bool', 'true の場合、バックアップ中に変更されていないことを確認するために、収集したメタデータを既存のメタデータと比較します。', 'true'),
    ('create_table_timeout', 'UInt64', 'リストア中にテーブルを作成する際のタイムアウト（ミリ秒）。', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '協調バックアップ/リストア中に不正なバージョンエラーが発生した後で再試行する最大回数。', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '次のメタデータ収集を試行するまでの最大スリープ時間（ミリ秒）。', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '次のメタデータ収集を試行するまでの最小スリープ時間（ミリ秒）。', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '`BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップへコピー済みのファイルを削除しようとします。そうでない場合は、コピー済みファイルはそのまま残ります。', 'true'),
    ('sync_period_ms', 'UInt64', '協調バックアップ/リストア用の同期周期（ミリ秒）。', '5000'),
    ('test_inject_sleep', 'Bool', 'テスト関連のスリープを挿入するかどうか。', 'false'),
    ('test_randomize_order', 'Bool', 'true の場合、テスト目的で一部の処理の順序をランダム化します。', 'false'),
    ('zookeeper_path', 'String', '`ON CLUSTER` 句を使用する場合に、バックアップおよびリストアのメタデータを保存する ZooKeeper 上のパス。', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Setting                                             | Type   | Description                                                                                   | Default               |
| :-------------------------------------------------- | :----- | :-------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 同一ホスト上で複数のバックアップ処理を同時に実行できるかどうかを決定します。                                                        | `true`                |
| `allow_concurrent_restores`                         | Bool   | 同一ホスト上で複数のリストア処理を同時に実行できるかどうかを決定します。                                                          | `true`                |
| `allowed_disk`                                      | String | `File()` を使用する場合にバックアップ先とするディスク。この設定を指定しないと `File` は使用できません。                                  | ``                    |
| `allowed_path`                                      | String | `File()` を使用する場合にバックアップ先とするパス。この設定を指定しないと `File` は使用できません。                                    | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 収集したメタデータを比較して不整合が見つかった場合に、スリープに入るまでにメタデータ収集を再試行する回数。                                         | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | バックアップ時にメタデータを収集する際のタイムアウト（ミリ秒）。                                                              | `600000`              |
| `compare_collected_metadata`                        | Bool   | true の場合、バックアップ中にメタデータが変更されていないことを確認するため、収集したメタデータを既存のメタデータと比較します。                            | `true`                |
| `create_table_timeout`                              | UInt64 | リストア中にテーブルを作成する際のタイムアウト（ミリ秒）。                                                                 | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | 協調バックアップ／リストアで bad version エラーが発生した場合に行う、再試行の最大回数。                                            | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次のメタデータ収集を試行する前にスリープする最大時間（ミリ秒）。                                                              | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次のメタデータ収集を試行する前にスリープする最小時間（ミリ秒）。                                                              | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | `BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップへコピー済みのファイルを削除しようとします。そうしない場合は、コピー済みファイルをそのまま残します。 | `true`                |
| `sync_period_ms`                                    | UInt64 | 協調バックアップ／リストアの同期周期（ミリ秒）。                                                                      | `5000`                |
| `test_inject_sleep`                                 | Bool   | テスト関連で使用するスリープ動作。                                                                             | `false`               |
| `test_randomize_order`                              | Bool   | true の場合、テスト目的で特定の処理順序をランダム化します。                                                              | `false`               |
| `zookeeper_path`                                    | String | `ON CLUSTER` 句を使用する場合に、バックアップおよびリストアのメタデータを保存する ZooKeeper 上のパス。                               | `/clickhouse/backups` |

この設定はデフォルトで次のように構成されています。

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Backups IO スレッドプールでスケジュール可能なジョブの最大数です。現在の S3 バックアップロジックのため、このキューは無制限に設定しておくことを推奨します。

:::note
`0`（デフォルト）の値は無制限を意味します。
:::

## bcrypt&#95;workfactor {#bcrypt_workfactor}

[Bcrypt アルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/) を使用する `bcrypt_password` 認証タイプのワークファクター。
ワークファクターは、ハッシュの計算およびパスワード検証に必要な計算量と時間を決定します。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
認証処理が高頻度で発生するアプリケーションでは、
高い work factor を使用した場合の bcrypt の計算コストを考慮し、
別の認証方式の採用を検討してください。
:::


## blob&#95;storage&#95;log {#blob_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) システムテーブル用の設定です。

<SystemLogParameters />

例：

```xml
<blob_storage_log>
    <database>system</database
    <table>blob_storage_log</table
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```


## builtin&#95;dictionaries&#95;reload&#95;interval {#builtin_dictionaries_reload_interval}

組み込みディクショナリを再読み込みするまでの間隔（秒）。

ClickHouse は、組み込みディクショナリを x 秒ごとに再読み込みします。これにより、サーバーを再起動することなく、ディクショナリを稼働中に編集できます。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />キャッシュサイズを RAM に対する最大比率として設定します。メモリ容量の少ないシステムでキャッシュサイズをより小さく設定できます。

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />テスト目的に使用します。

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />

サーバーの許可されている最大メモリ消費量を、cgroups 内の対応するしきい値に基づいて調整する際の間隔（秒）です。

cgroup オブザーバーを無効にするには、この値を `0` に設定します。

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />[コンパイル済み式](../../operations/caches.md)のキャッシュサイズ（要素数）を設定します。

## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />[コンパイル済み式](../../operations/caches.md)のキャッシュサイズ（バイト単位）を設定します。

## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブルに対するデータ圧縮設定です。

:::note
ClickHouse を使い始めたばかりの場合は、これを変更しないことをお勧めします。
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

* `min_part_size` – データパーツの最小サイズ。
* `min_part_size_ratio` – データパーツサイズとテーブルサイズの比率。
* `method` – 圧縮方式。使用可能な値: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`。
* `level` – 圧縮レベル。[Codecs](/sql-reference/statements/create/table#general-purpose-codecs) を参照。

:::note
複数の `<case>` セクションを設定できます。
:::

**条件が満たされたときの動作**:

* データパーツが条件セットに一致した場合、ClickHouse は指定された圧縮方式を使用します。
* データパーツが複数の条件セットに一致した場合、ClickHouse は最初に一致した条件セットを使用します。

:::note
どの条件セットにも一致しないデータパーツの場合、ClickHouse は `lz4` 圧縮を使用します。
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

<SettingsInfoBlock type="String" default_value="fair_round_robin" />

`concurrent_threads_soft_limit_num` と `concurrent_threads_soft_limit_ratio_to_cores` で指定される CPU スロットのスケジューリング方針を指定します。制限された数の CPU スロットを同時実行クエリ間でどのように分配するかを制御するアルゴリズムです。スケジューラは、サーバーの再起動なしに実行時に変更できます。

指定可能な値:

- `round_robin` — `use_concurrency_control` 設定が 1 のすべてのクエリは、最大で `max_threads` 個の CPU スロットを確保します。1 スレッドあたり 1 スロットです。競合が発生した場合、CPU スロットはクエリ間でラウンドロビン方式により付与されます。最初のスロットは無条件に付与される点に注意してください。このため、`max_threads` = 1 のクエリが多数存在する状況では、高い `max_threads` を持つクエリに対して不公平が生じたり、レイテンシが増大したりする可能性があります。
- `fair_round_robin` — `use_concurrency_control` 設定が 1 のすべてのクエリは、最大で `max_threads - 1` 個の CPU スロットを確保します。各クエリの最初のスレッドに対して CPU スロットを要求しない `round_robin` のバリエーションです。これにより、`max_threads` = 1 のクエリは一切スロットを必要とせず、全スロットを不公平に占有することがなくなります。無条件に付与されるスロットはありません。

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />

リモートサーバーからデータを取得するためのスレッドを除き、クエリ全体で使用が許可されるクエリ処理スレッドの最大数です。これは厳密な上限ではありません。制限に達した場合でも、そのクエリには少なくとも 1 つのスレッドが割り当てられます。実行中に追加のスレッドが利用可能になった場合、クエリは必要なスレッド数までスケールアップできます。

:::note
`0`（デフォルト）の値は無制限を意味します。
:::

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) と同様ですが、コア数に対する比率として指定します。

## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />

ClickHouse が設定を再読み込みし、新しい変更がないかを確認する間隔

## core&#95;dump {#core_dump}

コアダンプファイルのサイズに対するソフトリミットを設定します。

:::note
ハードリミットはシステムツールで設定します。
:::

**例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## cpu&#95;slot&#95;preemption {#cpu_slot_preemption}

<SettingsInfoBlock type="Bool" default_value="0" />

CPU リソース（MASTER THREAD と WORKER THREAD）向けのワークロードのスケジューリング方法を定義します。

* `true`（推奨）の場合、使用状況の管理は実際に消費された CPU 時間に基づいて行われます。競合するワークロードには公平な量の CPU 時間が割り当てられます。スロットは限定された時間だけ割り当てられ、有効期限後に再度要求されます。CPU リソースが逼迫している場合、スロットの要求がスレッドの実行をブロックする可能性があり、つまりプリエンプションが発生する可能性があります。これにより CPU 時間の公平性が保証されます。
* `false`（デフォルト）の場合、使用状況の管理は割り当てられた CPU スロット数に基づいて行われます。競合するワークロードには公平な数の CPU スロットが割り当てられます。スロットはスレッド開始時に割り当てられ、スレッドの実行が終了するまで保持され、終了時に解放されます。クエリ実行に割り当てられるスレッド数は 1 から `max_threads` まで増加することはあっても減少することはありません。これは長時間実行されるクエリに有利であり、短いクエリの CPU 枯渇を引き起こす可能性があります。

**例**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**関連項目**

* [ワークロードのスケジューリング](/operations/workload-scheduling.md)


## cpu&#95;slot&#95;preemption&#95;timeout&#95;ms {#cpu_slot_preemption_timeout_ms}

<SettingsInfoBlock type="UInt64" default_value="1000" />

プリエンプション中、つまり別の CPU スロットが付与されるのを待っている間に、ワーカースレッドが待機できるミリ秒数を定義します。このタイムアウト後もスレッドが新しい CPU スロットを取得できなかった場合、そのスレッドは終了し、クエリは同時実行スレッド数をより少ない数に動的にスケールダウンします。なお、マスタースレッドはスケールダウンされることはありませんが、無期限にプリエンプトされる可能性があります。`cpu_slot_preemption` が有効であり、WORKER THREAD に対して CPU リソースが定義されている場合にのみ意味を持ちます。

**例**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**関連項目**

* [Workload Scheduling](/operations/workload-scheduling.md)


## cpu&#95;slot&#95;quantum&#95;ns {#cpu_slot_quantum_ns}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

スレッドが CPU スロットを取得してから、別の CPU スロットを要求するまでに消費することが許可される CPU 時間（ナノ秒単位）を定義します。`cpu_slot_preemption` が有効であり、`MASTER THREAD` または `WORKER THREAD` に対して CPU リソースが定義されている場合にのみ意味があります。

**例**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**関連情報**

* [ワークロードのスケジューリング](/operations/workload-scheduling.md)


## crash&#95;log {#crash_log}

[crash&#95;log](../../operations/system-tables/crash_log.md) システムテーブルの動作に関する設定です。

以下の設定はサブタグで構成します。

| Setting                            | Description                                                                                                                            | Default             | Note                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| `database`                         | データベース名。                                                                                                                               |                     |                                                                                             |
| `table`                            | システムテーブル名。                                                                                                                             |                     |                                                                                             |
| `engine`                           | システムテーブルに対する [MergeTree Engine Definition](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。 |                     | `partition_by` または `order_by` が定義されている場合には使用できません。指定されていない場合は既定で `MergeTree` が選択されます        |
| `partition_by`                     | システムテーブルに対する [Custom partitioning key](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                            |                     | システムテーブルに対して `engine` が指定されている場合、`partition_by` パラメータは直接 &#39;engine&#39; の内側に指定する必要があります   |
| `ttl`                              | テーブルの [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) を指定します。                                      |                     | システムテーブルに対して `engine` が指定されている場合、`ttl` パラメータは直接 &#39;engine&#39; の内側に指定する必要があります            |
| `order_by`                         | システムテーブルに対する [Custom sorting key](/engines/table-engines/mergetree-family/mergetree#order_by)。`engine` が定義されている場合は使用できません。             |                     | システムテーブルに対して `engine` が指定されている場合、`order_by` パラメータは直接 &#39;engine&#39; の内側に指定する必要があります       |
| `storage_policy`                   | テーブルに使用するストレージポリシー名（任意）。                                                                                                               |                     | システムテーブルに対して `engine` が指定されている場合、`storage_policy` パラメータは直接 &#39;engine&#39; の内側に指定する必要があります |
| `settings`                         | MergeTree の動作を制御する [Additional parameters](/engines/table-engines/mergetree-family/mergetree/#settings)（任意）。                           |                     | システムテーブルに対して `engine` が指定されている場合、`settings` パラメータは直接 &#39;engine&#39; の内側に指定する必要があります       |
| `flush_interval_milliseconds`      | メモリ上のバッファからテーブルへデータをフラッシュする間隔。                                                                                                         | `7500`              |                                                                                             |
| `max_size_rows`                    | ログの最大行数。フラッシュされていないログ数が `max_size_rows` に達すると、ログがディスクにダンプされます。                                                                         | `1024`              |                                                                                             |
| `reserved_size_rows`               | ログのために事前に確保されるメモリサイズ（行数）。                                                                                                              | `1024`              |                                                                                             |
| `buffer_size_rows_flush_threshold` | 行数のしきい値。このしきい値に達すると、バックグラウンドでログをディスクにフラッシュする処理が開始されます。                                                                                 | `max_size_rows / 2` |                                                                                             |
| `flush_on_crash`                   | 障害発生時にログをディスクへダンプするかどうかを設定します。                                                                                                         | `false`             |                                                                                             |

デフォルトのサーバー設定ファイル `config.xml` には、次の settings セクションが含まれています。

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


## custom&#95;cached&#95;disks&#95;base&#95;directory {#custom_cached_disks_base_directory}

この設定は、カスタム（SQL から作成された）キャッシュディスク用のキャッシュパスを指定します。
`custom_cached_disks_base_directory` は、カスタムディスクに対しては `filesystem_caches_path`（`filesystem_caches_path.xml` 内で指定）よりも優先されます。
前者が存在しない場合は `filesystem_caches_path` が使用されます。
ファイルシステムキャッシュとして設定するパスは、このディレクトリ配下でなければならず、
そうでない場合はディスクが作成されないようにするための例外がスローされます。

:::note
これは、古いバージョンで作成され、その後サーバーがアップグレードされたディスクには影響しません。
この場合、サーバーが正常に起動できるようにするため、例外はスローされません。
:::

例:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## custom&#95;settings&#95;prefixes {#custom_settings_prefixes}

[カスタム設定](/operations/settings/query-level#custom_settings)に使用するプレフィックスの一覧です。プレフィックスはカンマ区切りで指定する必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**関連項目**

* [カスタム設定](/operations/settings/query-level#custom_settings)


## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" />

[`UNDROP`](/sql-reference/statements/undrop.md) ステートメントを使用して削除されたテーブルを復元できる猶予時間。`DROP TABLE` が `SYNC` 修飾子付きで実行された場合、この設定は無視されます。
この設定のデフォルト値は `480`（8 分）です。

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />テーブルの削除に失敗した場合、ClickHouse はこのタイムアウト時間が経過するまで待機してから操作を再試行します。

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />テーブル削除に使用するスレッドプールのサイズです。

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />

`store/` ディレクトリから不要なデータ（ガベージ）をクリーンアップするタスクのパラメータです。
このタスクの実行間隔を設定します。

:::note
`0` を指定すると「実行しない（never）」ことを意味します。デフォルト値は 1 日を意味します。
:::

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

`store/` ディレクトリ内の不要なディレクトリをクリーンアップするタスクのパラメータです。
あるサブディレクトリが clickhouse-server によって使用されておらず、かつ直近
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒の間に更新されていない場合、このタスクはそのディレクトリの
すべてのアクセス権を削除することで、そのディレクトリを「非表示」にします。これは、clickhouse-server が
`store/` 内に存在すると想定していないディレクトリにも適用されます。

:::note
`0` を指定すると「即時」を意味します。
:::

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />

`store/` ディレクトリから不要なディレクトリをクリーンアップするタスクのパラメータです。
あるサブディレクトリが clickhouse-server によって使用されておらず、以前に「非表示」にされていて
（[database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) を参照）、
かつ直近
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒の間にそのディレクトリが変更されていない場合、このタスクはそのディレクトリを削除します。
また、clickhouse-server が `store/` 配下に存在することを想定していないディレクトリに対しても動作します。

:::note
値が `0` の場合は「削除しない（無期限）」を意味します。デフォルト値は 30 日に相当します。
:::

## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />Replicated データベースでテーブルを永久にデタッチすることを許可します

## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />予期しないテーブルを、別のローカルデータベースに移動するのではなく、Replicated データベースから削除します

## dead&#95;letter&#95;queue {#dead_letter_queue}

&#39;dead&#95;letter&#95;queue&#39; システムテーブルの設定です。

<SystemLogParameters />

デフォルト設定は次のとおりです。

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```


## default_database {#default_database} 

<SettingsInfoBlock type="String" default_value="default" />既定のデータベース名。

## default&#95;password&#95;type {#default_password_type}

`CREATE USER u IDENTIFIED BY 'p'` のようなクエリで、自動的に設定されるパスワードの種類を指定します。

指定可能な値は次のとおりです：

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## default&#95;profile {#default_profile}

デフォルトの設定プロファイルです。設定プロファイルは、設定 `user_config` で指定されたファイル内に格納されます。

**例**

```xml
<default_profile>default</default_profile>
```


## default&#95;replica&#95;name {#default_replica_name}

<SettingsInfoBlock type="String" default_value="{replica}" />

ZooKeeper 上のレプリカ名。

**例**

```xml
<default_replica_name>{replica}</default_replica_name>
```


## default&#95;replica&#95;path {#default_replica_path}

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />

ZooKeeper 内にあるテーブルへのパス。

**例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```


## default&#95;session&#95;timeout {#default_session_timeout}

セッションのデフォルトのタイムアウト時間（秒単位）。

```xml
<default_session_timeout>60</default_session_timeout>
```


## dictionaries&#95;config {#dictionaries_config}

辞書の設定ファイルへのパス。

パス:

* 絶対パス、またはサーバー設定ファイルからの相対パスを指定します。
* パスにはワイルドカードの * と ? を含めることができます。

関連項目:

* &quot;[Dictionaries](../../sql-reference/dictionaries/index.md)&quot;。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## dictionaries&#95;lazy&#95;load {#dictionaries_lazy_load}

<SettingsInfoBlock type="Bool" default_value="1" />

ディクショナリの遅延ロード方式を制御します。

* `true` の場合、各ディクショナリは初回使用時にロードされます。ロードに失敗した場合、そのディクショナリを使用していた関数は例外をスローします。
* `false` の場合、サーバーは起動時にすべてのディクショナリをロードします。

:::note
サーバーは、接続を受け付ける前に、すべてのディクショナリのロードが完了するまで起動時に待機します
（例外: [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) が `false` に設定されている場合）。
:::

**例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />`background_reconnect` が有効になっている、接続に失敗した MySQL および Postgres ディクショナリの再接続を試行する間隔（ミリ秒単位）。

## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />

insert/alter/delete クエリを無効化します。読み取り専用ノードが必要で、挿入やミューテーションが読み取りパフォーマンスに影響するのを防ぎたい場合に、この設定を有効にします。S3、DataLake、MySQL、PostrgeSQL、Kafka などの外部エンジンへの挿入は、この設定に関係なく許可されます。

## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />内部 DNS キャッシュを無効にします。Kubernetes のようにインフラストラクチャが頻繁に変更されるシステムで ClickHouse を運用する場合に推奨されます。

## disable&#95;tunneling&#95;for&#95;https&#95;requests&#95;over&#95;http&#95;proxy {#disable_tunneling_for_https_requests_over_http_proxy}

デフォルトでは、`HTTP` プロキシ経由で `HTTPS` リクエストを行う際にトンネリング（つまり `HTTP CONNECT`）が使用されます。この設定でトンネリングを無効にできます。

**no&#95;proxy**

デフォルトでは、すべてのリクエストはプロキシ経由になります。特定のホストに対してプロキシを無効化するには、`no_proxy` 変数を設定する必要があります。
これは list resolver および remote resolver では `<proxy>` 句の内部で、environment resolver では環境変数として設定できます。
IP アドレス、ドメイン、サブドメイン、および完全にバイパスするためのワイルドカード `'*'` をサポートします。先頭のドットは curl と同様に削除されます。

**Example**

以下の設定では、`clickhouse.cloud` およびそのすべてのサブドメイン（例：`auth.clickhouse.cloud`）へのリクエストはプロキシをバイパスします。
GitLab についても同様で、先頭にドットが付いていても同じ動作になります。`gitlab.com` と `about.gitlab.com` の両方がプロキシをバイパスします。

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

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限を超えた接続は、有効期間が大幅に短くなります。この制限はディスクへの接続に適用されます。

## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="30000" />この上限を超えた接続は、使用後にリセットされます。接続キャッシュを無効にするには 0 を設定します。この上限はディスクへの接続に適用されます。

## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />使用中の接続数がこの上限値を超えた場合、警告メッセージがログに書き込まれます。この上限値はディスクへの接続に適用されます。

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

テーブル、データベース、テーブル関数、およびディクショナリに対する `SHOW` および `SELECT` クエリでシークレットを表示するかどうかを制御します。

シークレットを表示したいユーザーは、
[`format_display_secrets_in_show_and_select` フォーマット設定](../settings/formats#format_display_secrets_in_show_and_select)
を有効にし、
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限を持っている必要があります。

設定可能な値:

- `0` — 無効。
- `1` — 有効。

## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client} 

<SettingsInfoBlock type="Bool" default_value="1" />キャッシュサーバーがクライアントから受信したスロットリング設定を適用するかどうかを制御します。

## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />分散キャッシュが空きとして維持しようとするアクティブな接続数のソフト上限。空き接続数が distributed_cache_keep_up_free_connections_ratio * max_connections を下回った場合、空き接続数がこの上限を上回るまで、最後のアクティビティ時刻が最も古い接続から順にクローズされます。

## distributed&#95;ddl {#distributed_ddl}

クラスタ上で [分散 DDL クエリ](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）の実行を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) が有効な場合にのみ機能します。

`<distributed_ddl>` 内で設定可能な項目は次のとおりです。

| Setting                | Description                                                                      | Default Value                 |
| ---------------------- | -------------------------------------------------------------------------------- | ----------------------------- |
| `path`                 | DDL クエリ用の `task_queue` の Keeper 上のパス                                             |                               |
| `profile`              | DDL クエリを実行する際に使用されるプロファイル                                                        |                               |
| `pool_size`            | 同時に実行できる `ON CLUSTER` クエリの数                                                      |                               |
| `max_tasks_in_queue`   | キュー内に保持できるタスクの最大数                                                                | `1,000`                       |
| `task_max_lifetime`    | ノードの経過時間がこの値を超えた場合に、そのノードを削除します                                                  | `7 * 24 * 60 * 60`（1 週間（秒単位）） |
| `cleanup_delay_period` | 直近のクリーンアップから `cleanup_delay_period` 秒以上経過している場合に、新しいノードイベントを受信した後でクリーンアップを開始します。 | `60` 秒                        |

**例**

```xml
<distributed_ddl>
    <!-- ZooKeeper内のDDLクエリキューへのパス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- DDLクエリの実行時にこのプロファイルの設定が使用されます -->
    <profile>default</profile>

    <!-- ON CLUSTERクエリの同時実行数を制御します -->
    <pool_size>1</pool_size>

    <!--
         クリーンアップ設定（実行中のタスクは削除されません）
    -->

    <!-- タスクのTTLを制御します（デフォルト: 1週間） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- クリーンアップの実行間隔を制御します（秒単位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- キューに保持可能なタスク数を制御します -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```


## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles} 

<SettingsInfoBlock type="Bool" default_value="0" />有効にすると、`ON CLUSTER` クエリはリモートシャードでの実行時に、実行を開始したユーザーとそのロールを保持して使用します。これによりクラスタ全体で一貫したアクセス制御を行えますが、そのユーザーとロールがすべてのノードに存在している必要があります。

## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />ホスト名を IPv4 アドレスに解決することを許可します。

## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />名前を IPv6 アドレスに解決できるようにします。

## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />内部 DNS キャッシュの最大エントリ数。

## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />内部 DNS キャッシュの更新間隔（秒）。

## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />ホスト名を ClickHouse の DNS キャッシュから削除する前に許容される、当該ホスト名の DNS 解決失敗の最大連続回数。

## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />分散キャッシュの削除に使用されるスレッドプールのサイズ。

## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />分散キャッシュの削除に使用されるスレッドプールのキューサイズです。

## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Azure SDK からのログ出力を有効にします

## encryption {#encryption}

[encryption codecs](/sql-reference/statements/create/table#encryption-codecs) で使用されるキーを取得するためのコマンドを設定します。キー（複数可）は環境変数に書き込むか、設定ファイル内で指定する必要があります。

キーは、長さが 16 バイトの 16 進数または文字列として指定できます。

**例**

設定ファイルから読み込む場合:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
キーを設定ファイルに保存することは推奨されません。セキュアではありません。キーは安全なディスク上の別の設定ファイルに移動し、その設定ファイルへのシンボリックリンクを `config.d/` フォルダに配置することができます。
:::

キーが16進数の場合、設定から読み込む場合:

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

ここで `current_key_id` は暗号化に使用する現在のキーを設定し、指定されたすべてのキーは復号に使用できます。

これらのいずれの方法も、複数のキーに対して適用できます。

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで `current_key_id` は、暗号化に使用されている現在のキーを示します。

また、ユーザーは長さが 12 バイトである必要がある nonce を追加できます（デフォルトでは、暗号化および復号処理はゼロバイトのみで構成された nonce を使用します）:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または16進数表記で指定できます。

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
上記で説明した内容はすべて `aes_256_gcm_siv` にも適用できます（ただしキーは 32 バイトである必要があります）。
:::


## error&#95;log {#error_log}

デフォルトでは無効になっています。

**有効化**

エラー履歴の収集機能 [`system.error_log`](../../operations/system-tables/error_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/error_log.xml` を作成します。

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

`error_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_error_log.xml` ファイルを作成します。

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

入力を解析するためにスレッドプールにスケジュールできるジョブの最大数。

:::note
`0` の値は無制限を意味します。
:::

## format&#95;schema&#95;path {#format_schema_path}

入力データ用のスキーマを格納したディレクトリへのパスです。たとえば、[CapnProto](/interfaces/formats/CapnProto) フォーマット用のスキーマなどです。

**例**

```xml
<!-- 各種入力形式のスキーマファイルを格納するディレクトリ。 -->
<format_schema_path>format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />グローバルプロファイラの CPU クロックタイマーの期間（ナノ秒単位）。CPU クロックグローバルプロファイラを無効化するには 0 を設定します。推奨値は、単一クエリの場合は少なくとも 10000000（1 秒間に 100 回）、クラスタ全体のプロファイリングの場合は 1000000000（1 秒に 1 回）です。

## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />グローバルプロファイラの実時間クロックタイマーの周期（ナノ秒単位）。0 に設定すると実時間グローバルプロファイラを無効にします。推奨値は、単一クエリの場合は少なくとも 10000000（1 秒間に 100 回）、クラスタ全体のプロファイリングの場合は 1000000000（1 秒に 1 回）です。

## google&#95;protos&#95;path {#google_protos_path}

Protobuf 型用の proto ファイルを含むディレクトリを定義します。

例:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## graphite {#graphite}

[Graphite](https://github.com/graphite-project) にデータを送信します。

設定:

* `host` – Graphite サーバー。
* `port` – Graphite サーバー上のポート。
* `interval` – 送信間隔（秒）。
* `timeout` – データ送信のタイムアウト時間（秒）。
* `root_path` – キーのプレフィックス。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからデータを送信します。
* `events` – 指定期間に [system.events](/operations/system-tables/events) テーブルに蓄積された差分データを送信します。
* `events_cumulative` – [system.events](/operations/system-tables/events) テーブルから累積データを送信します。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルからデータを送信します。

`<graphite>` 句は複数設定できます。たとえば、異なるデータを異なる間隔で送信するために利用できます。

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


## graphite&#95;rollup {#graphite_rollup}

Graphite のデータを間引くための設定です。

詳細については [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md) を参照してください。

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


## hsts&#95;max&#95;age {#hsts_max_age}

HSTS の有効期間（秒単位）。

:::note
値が `0` の場合、ClickHouse は HSTS を無効にします。正の数値を設定すると HSTS は有効になり、`max-age` はその設定した値になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この上限を超えた接続の寿命は大幅に短くなります。この上限は、特定のディスクやストレージに紐づかない HTTP 接続に適用されます。

## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この上限を超えた接続は、使用後にリセットされます。0 を設定すると接続キャッシュが無効になります。この制限は、いずれのディスクまたはストレージにも属さない HTTP 接続に適用されます。

## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />使用中の接続数がこの制限を超えた場合、警告メッセージがログに書き込まれます。この制限は、いずれのディスクやストレージにも属さない HTTP 接続に適用されます。

## http&#95;handlers {#http_handlers}

カスタム HTTP ハンドラーを利用できるようにします。
新しい HTTP ハンドラーを追加するには、新しい `<rule>` を追加するだけです。
ルールは定義された順（上から下）にチェックされ、
最初にマッチしたもののハンドラーが実行されます。

以下の設定はサブタグで指定できます:

| Sub-tags             | Definition                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `url`                | リクエスト URL にマッチさせます。正規表現によるマッチを使用するには、プレフィックスとして &#39;regex:&#39; を付けます（任意）                           |
| `methods`            | リクエストメソッドにマッチさせます。カンマ区切りで複数のメソッドを指定できます（任意）                                                          |
| `headers`            | リクエストヘッダーにマッチさせます。各子要素（子要素名がヘッダー名）ごとにマッチさせます。正規表現によるマッチを使用するには、プレフィックスとして &#39;regex:&#39; を付けます（任意） |
| `handler`            | リクエストハンドラー                                                                                           |
| `empty_query_string` | URL にクエリ文字列が存在しないことをチェックします                                                                          |

`handler` には次の設定が含まれ、サブタグで指定できます:

| Sub-tags           | Definition                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | リダイレクト先の URL                                                                                                                      |
| `type`             | サポートされるタイプ: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                     |
| `status`           | static タイプで使用するレスポンスステータスコード                                                                                                      |
| `query_param_name` | dynamic&#95;query&#95;handler タイプで使用します。HTTP リクエストパラメータから `<query_param_name>` に対応する値を取り出して実行します                                  |
| `query`            | predefined&#95;query&#95;handler タイプで使用します。ハンドラーが呼び出されたときにクエリを実行します                                                               |
| `content_type`     | static タイプで使用するレスポンスの Content-Type                                                                                                |
| `response_content` | static タイプで使用します。クライアントに送信するレスポンスコンテンツです。プレフィックス &#39;file://&#39; または &#39;config://&#39; を使用した場合、ファイルまたは設定から内容を取得してクライアントに送信します |

ルールのリストに加えて、すべてのデフォルトハンドラーを有効化する `<defaults/>` を指定できます。

Example:

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


## http&#95;options&#95;response {#http_options_response}

`OPTIONS` HTTP リクエストのレスポンスにヘッダーを追加するために使用します。
`OPTIONS` メソッドは、CORS のプリフライトリクエストで使用されます。

詳細については、[OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS) を参照してください。

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


## http&#95;server&#95;default&#95;response {#http_server_default_response}

ClickHouse HTTP(S) サーバーにアクセスしたときに、デフォルトで表示されるページ。
デフォルト値は &quot;Ok.&quot;（末尾に改行文字を含む）です。

**例**

`http://localhost:http_port` にアクセスしたときに `https://tabix.io/` を開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Iceberg カタログ用バックグラウンドプールのサイズ

## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Iceberg カタログプールに投入可能なタスクの最大数

## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />エントリ数で指定する iceberg メタデータファイルキャッシュの最大サイズ。ゼロの場合は無効を意味します。

## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Iceberg メタデータファイルのキャッシュポリシー名。

## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />iceberg メタデータキャッシュの最大サイズ（バイト単位）。0 を指定すると無効です。

## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />SLRU ポリシー使用時における `iceberg` メタデータキャッシュで、キャッシュ全体のサイズに対する保護キューサイズの比率。

## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定されている場合、ClickHouse は `CREATE VIEW` クエリ内で空の SQL セキュリティステートメントに対するデフォルト値を書き込みません。

:::note
この設定は移行期間中にのみ必要であり、バージョン 24.4 では不要になります。
:::

## include&#95;from {#include_from}

置換定義を記述したファイルへのパスです。XML と YAML の両方の形式がサポートされています。

詳細については、「[Configuration files](/operations/configuration-files)」セクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリインデックスマークキャッシュポリシーの名前。

## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

インデックスマークキャッシュの最大サイズ。

:::note

値が `0` の場合は無効になります。

この設定は実行時に変更でき、即座に反映されます。
:::

## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />セカンダリインデックスマークキャッシュにおいて、キャッシュ全体サイズに対して保護キューが占める割合（SLRU ポリシー適用時）を表します。

## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリインデックス用の非圧縮キャッシュポリシーの名前。

## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

未圧縮の `MergeTree` インデックスブロック用キャッシュの最大サイズです。

:::note
`0` を指定すると無効になります。

この設定は実行時に変更でき、変更は即座に反映されます。
:::

## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />セカンダリインデックスの非圧縮キャッシュで、SLRU ポリシーを使用する場合の保護キューのサイズを、キャッシュ全体のサイズに対する比率として指定します。

## interserver&#95;http&#95;credentials {#interserver_http_credentials}

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)中に他のサーバーに接続するために使用されるユーザー名とパスワードです。加えて、サーバーはこれらの認証情報を使用して他のレプリカを認証します。
したがって、`interserver_http_credentials` はクラスター内のすべてのレプリカで同一である必要があります。

:::note

* デフォルトでは、`interserver_http_credentials` セクションを省略すると、レプリケーション時に認証は使用されません。
* `interserver_http_credentials` の設定は、ClickHouse クライアント認証情報の[設定](../../interfaces/cli.md#configuration_files)とは関係ありません。
* これらの認証情報は、`HTTP` および `HTTPS` を介したレプリケーションで共通です。
  :::

次の設定はサブタグで構成できます:

* `user` — ユーザー名。
* `password` — パスワード。
* `allow_empty` — `true` の場合、認証情報が設定されていても、他のレプリカが認証なしで接続することが許可されます。`false` の場合、認証なしの接続は拒否されます。デフォルト: `false`。
* `old` — 認証情報のローテーション中に使用される旧 `user` と `password` を含みます。複数の `old` セクションを指定できます。

**認証情報のローテーション**

ClickHouse は、すべてのレプリカを同時に停止して設定を更新することなく、サーバー間の認証情報の動的なローテーションをサポートします。認証情報は複数の段階に分けて変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、認証情報を追加します。これにより、認証ありおよび認証なしの両方の接続が許可されます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカの設定が完了したら、`allow_empty` を `false` に設定するか、この設定項目を削除してください。これにより、新しい認証情報での認証が必須になります。

既存の認証情報を変更するには、`username` と `password` を `interserver_http_credentials.old` セクションに移動し、`user` と `password` を新しい値に更新します。この時点で、サーバーは他のレプリカへの接続には新しい認証情報を使用しつつ、新旧いずれの認証情報による接続も受け付けます。

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


## interserver&#95;http&#95;host {#interserver_http_host}

他のサーバーからこのサーバーにアクセスする際に使用されるホスト名。

省略した場合は、`hostname -f` コマンドと同様の方法で定義されます。

特定のネットワークインターフェースに依存しない構成にしたい場合に便利です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver&#95;http&#95;port {#interserver_http_port}

ClickHouse サーバー間でデータをやり取りするためのポート。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver&#95;https&#95;host {#interserver_https_host}

[`interserver_http_host`](#interserver_http_host) と同様ですが、このホスト名は他のサーバーが `HTTPS` 経由でこのサーバーにアクセスする際に使用されます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver&#95;https&#95;port {#interserver_https_port}

`HTTPS` 経由で ClickHouse サーバー間のデータをやり取りするためのポートです。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver&#95;listen&#95;host {#interserver_listen_host}

ClickHouse サーバー間でデータを交換できるホストを制限します。
Keeper が使用されている場合、異なる Keeper インスタンス間の通信にも同じ制限が適用されます。

:::note
デフォルトでは、この設定値は [`listen_host`](#listen_host) と同じです。
:::

**例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

型:

デフォルト:


## io_thread_pool_queue_size {#io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

IO スレッドプールにスケジュールできるジョブの最大数。

:::note
`0` の値は無制限を意味します。
:::

## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />jemalloc のサンプリングされたアロケーションを system.trace_log テーブルに保存します

## jemalloc_enable_background_threads {#jemalloc_enable_background_threads} 

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc のバックグラウンドスレッドを有効にします。jemalloc は未使用のメモリページを解放するためにバックグラウンドスレッドを使用します。無効化するとパフォーマンスの低下につながる可能性があります。

## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />すべてのスレッドに対して jemalloc のアロケーションプロファイラを有効にします。jemalloc はアロケーションをサンプリングし、サンプリング対象となったアロケーションのすべての解放もサンプリングします。
プロファイルは、アロケーション分析に利用できる SYSTEM JEMALLOC FLUSH PROFILE を実行してフラッシュできます。
サンプルは、設定 `jemalloc_collect_global_profile_samples_in_trace_log` またはクエリ設定 `jemalloc_collect_profile_samples_in_trace_log` を使用して `system.trace_log` に保存することもできます。
[Allocation Profiling](/operations/allocation-profiling) を参照してください。

## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />グローバルなピークメモリ使用量が jemalloc_flush_profile_interval_bytes バイト分増加した後に、jemalloc プロファイルのフラッシュが行われます

## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded} 

<SettingsInfoBlock type="Bool" default_value="0" />総メモリ超過エラーが発生した場合に、jemalloc プロファイルをフラッシュします

## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />作成する jemalloc バックグラウンドスレッドの最大数。0 に設定すると jemalloc のデフォルト値を使用します。

## keep&#95;alive&#95;timeout {#keep_alive_timeout}

<SettingsInfoBlock type="Seconds" default_value="30" />

ClickHouse が、HTTP プロトコルでの新規受信リクエストを接続を閉じる前に待機する時間（秒）。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts {#keeper_hosts} 

動的な設定です。ClickHouse が接続可能な [Zoo]Keeper ホストの集合を保持します。`<auxiliary_zookeepers>` に含まれる情報は公開しません。

## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

バッチ処理をサポートする [Zoo]Keeper への MultiRead リクエストに対するバッチの最大サイズです。0 に設定すると、バッチ処理は無効になります。ClickHouse Cloud でのみ利用可能です。

## ldap_servers {#ldap_servers} 

次の目的で、接続パラメータ付きの LDAP サーバーをここに定義します:

- `'password'` の代わりに `'ldap'` 認証メカニズムが指定されている専用ローカルユーザーの認証に使用する
- リモートユーザーディレクトリとして使用する

次の設定はサブタグで構成できます:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP サーバーのホスト名または IP。必須パラメータであり、空にすることはできません。                                                                                                                                                                                                                                                                                                                                                     |
| `port`                         | LDAP サーバーのポート。`enable_tls` が true に設定されている場合のデフォルトは 636、それ以外の場合は `389` です。                                                                                                                                                                                                                                                                                                                     |
| `bind_dn`                      | バインドする DN を構成するために使用されるテンプレート。認証試行ごとに、テンプレート内のすべての `\{user_name\}` 部分文字列が実際のユーザー名に置き換えられて、最終的な DN が構成されます。                                                                                                                                                                                                                                        |
| `user_dn_detection`            | バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータを含むセクション。これは主に、サーバーが Active Directory である場合の、さらなるロールマッピングのための検索フィルターで使用されます。結果として得られるユーザー DN は、`\{user_dn\}` 部分文字列が許可されている箇所の置換に使用されます。デフォルトでは、ユーザー DN は bind DN と同一に設定されますが、検索が実行されると、検出された実際のユーザー DN の値で更新されます。 |
| `verification_cooldown`        | 正常にバインドされた後、その秒数の間、ユーザーは LDAP サーバーに問い合わせることなく、連続するすべてのリクエストに対して認証済みと見なされる期間。キャッシュを無効にして、各認証リクエストごとに LDAP サーバーへの問い合わせを強制するには、`0`（デフォルト）を指定します。                                                                                                                               |
| `enable_tls`                   | LDAP サーバーへのセキュアな接続を使用するかどうかを制御するフラグ。プレーンテキスト（`ldap://`）プロトコルを使用するには `no` を指定します（非推奨）。SSL/TLS 上の LDAP（`ldaps://`）プロトコルを使用するには `yes` を指定します（推奨、デフォルト）。レガシーな StartTLS プロトコル（プレーンテキスト（`ldap://`）プロトコルを TLS にアップグレード）を使用するには `starttls` を指定します。                                                                                                            |
| `tls_minimum_protocol_version` | SSL/TLS の最小プロトコルバージョン。指定可能な値は `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）です。                                                                                                                                                                                                                                                                                                                   |
| `tls_require_cert`             | SSL/TLS ピア証明書の検証動作。指定可能な値は `never`, `allow`, `try`, `demand`（デフォルト）です。                                                                                                                                                                                                                                                                                                                                         |
| `tls_cert_file`                | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `tls_key_file`                 | 証明書鍵ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_ca_cert_file`             | CA 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_ca_cert_dir`              | CA 証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                                    |
| `tls_cipher_suite`             | 許可される暗号スイート（OpenSSL の表記）。                                                                                                                                                                                                                                                                                                                                                                                               |

`user_dn_detection` 設定はサブタグで構成できます:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP 検索のベース DN を構成するために使用されるテンプレート。LDAP 検索中に、テンプレート内のすべての `\{user_name\}` および '\{bind_dn\}' 部分文字列が、実際のユーザー名と bind DN に置き換えられて、最終的な DN が構成されます。                                                                                                                                        |
| `scope`         | LDAP 検索のスコープ。指定可能な値は `base`, `one_level`, `children`, `subtree`（デフォルト）です。                                                                                                                                                                                                                                            |
| `search_filter` | LDAP 検索の検索フィルターを構成するために使用されるテンプレート。LDAP 検索中に、テンプレート内のすべての `\{user_name\}`、`\{bind_dn\}`、および `\{base_dn\}` 部分文字列が、実際のユーザー名、bind DN、および base DN に置き換えられて、最終的なフィルターが構成されます。特殊文字は XML 内で正しくエスケープする必要がある点に注意してください。  |

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

例（ロールマッピングに利用するユーザー DN 検出を構成済みの一般的な Active Directory）:

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

## listen&#95;backlog {#listen_backlog}

listen ソケットのバックログ（保留中接続のキュー長）。デフォルト値の `4096` は Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)) と同じ値です。

通常、この値を変更する必要はありません。理由は次のとおりです。

* デフォルト値が十分に大きい。
* クライアントからの接続を受け付けるために、サーバー側で accept 専用のスレッドが別に動作している。

そのため、たとえ `TcpExtListenOverflows`（`nstat` で確認）が非ゼロで、このカウンタが ClickHouse サーバーで増加していたとしても、それだけでこの値を増やす必要があるとは限りません。理由は次のとおりです。

* 通常、`4096` で足りない場合は ClickHouse の内部スケーリングに問題があることを示していることが多いため、Issue として報告したほうがよいです。
* それはサーバーが後からより多くの接続を処理できることを意味しません（たとえ処理できたとしても、その時点までにクライアントが離脱したり切断されている可能性があります）。

**Example**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen&#95;host {#listen_host}

リクエスト元となるホストを制限します。すべてのホストからのリクエストに応答させたい場合は、`::` を指定します。

例:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen&#95;reuse&#95;port {#listen_reuse_port}

複数のサーバーが同じアドレスとポートで待ち受けできるようにします。リクエストはオペレーティングシステムによってランダムなサーバーにルーティングされます。この設定を有効にすることは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

型:

デフォルト値:


## listen&#95;try {#listen_try}

リッスンを試みている際に IPv6 または IPv4 ネットワークが利用不能でも、サーバーは終了しません。

**例**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />マーク読み込み用バックグラウンドスレッドプールのサイズ

## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />プリフェッチ用プールに投入可能なタスクの最大数

## logger {#logger} 

ログメッセージの出力場所とフォーマットを指定します。

**キー**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | ログレベル。指定可能な値: `none` (ログ出力を無効化), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                      |
| `log`                  | ログファイルへのパス。                                                                                                                                             |
| `errorlog`             | エラーログファイルへのパス。                                                                                                                                       |
| `size`                 | ローテーションポリシー: ログファイルの最大サイズ (バイト単位)。ログファイルサイズがこの閾値を超えると、ファイル名を変更してアーカイブし、新しいログファイルを作成します。 |
| `count`                | ローテーションポリシー: 保持する ClickHouse の過去ログファイル数の上限。                                                                                           |
| `stream_compress`      | LZ4 を用いてログメッセージを圧縮します。有効にするには `1` または `true` を設定します。                                                                            |
| `console`              | コンソールへのログ出力を有効にします。有効にするには `1` または `true` を設定します。ClickHouse がデーモンモードで動作していない場合のデフォルトは `1`、それ以外は `0` です。 |
| `console_log_level`    | コンソール出力のログレベル。デフォルトは `level` の値です。                                                                                                        |
| `formatting.type`      | コンソール出力のログフォーマット。現在は `json` のみがサポートされています。                                                                                       |
| `use_syslog`           | ログ出力を syslog にも転送します。                                                                                                                                  |
| `syslog_level`         | syslog へのログ出力時のログレベル。                                                                                                                                |
| `async`                | `true` (デフォルト) の場合、ログ出力は非同期に行われます (出力チャネルごとに 1 つのバックグラウンドスレッド)。それ以外の場合は、LOG を呼び出したスレッド内でログを書き込みます。 |
| `async_queue_max_size` | 非同期ロギングを使用する場合、フラッシュ待ちでキューに保持されるメッセージ数の最大値。超過したメッセージは破棄されます。                                           |
| `startup_level`        | サーバー起動時にルートロガーのレベルを設定するために使用される起動レベル。起動後はログレベルが `level` 設定の値に戻されます。                                        |
| `shutdown_level`       | サーバー停止時にルートロガーのレベルを設定するために使用される停止レベル。                                                                                         |

**ログフォーマット指定子**

`log` および `errorLog` パス内のファイル名では、最終的なファイル名に対して以下のフォーマット指定子を使用できます (ディレクトリ部分では使用できません)。

「Example」列は `2023-07-06 18:32:07` のときの出力例を示します。

| 指定子  | 概要                                                                                                                     | 例                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `%%` | リテラルの % 文字                                                                                                             | `%`                     |
| `%n` | 改行文字                                                                                                                   |                         |
| `%t` | 水平タブ文字                                                                                                                 |                         |
| `%Y` | 年を10進数で表した値（例: 2017）                                                                                                   | `2023`                  |
| `%y` | 年の下2桁を10進数で表した値（範囲 [00,99]）                                                                                            | `23`                    |
| `%C` | 年を10進数で表したときの先頭2桁（範囲 [00,99]）                                                                                          | `20`                    |
| `%G` | 4桁の[ISO 8601 週番号ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、つまり指定された週を含む年。通常は `%V` と組み合わせて使用する場合にのみ意味がある | `2023`                  |
| `%g` | [ISO 8601 週基準年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)の末尾2桁（指定された週を含む年）。                                   | `23`                    |
| `%b` | 省略された月名。例: Oct（ロケールに依存）                                                                                                | `Jul`                   |
| `%h` | %b の同義語                                                                                                                | `7月`                    |
| `%B` | 月名をフルスペルで表示（例: October。ロケールに依存）                                                                                        | `7月`                    |
| `%m` | 月を 10 進数で表した値（範囲 [01,12]）                                                                                              | `07`                    |
| `%U` | 年内の週番号（10進数）（週の始まりは日曜日）（範囲 [00,53]）                                                                                    | `27`                    |
| `%W` | 年内の週番号を10進数で表したもの（週の始まりは月曜日）（範囲 [00,53]）                                                                               | `27`                    |
| `%V` | ISO 8601 の週番号（範囲 [01,53]）                                                                                              | `27`                    |
| `%j` | 年内通算日を 10 進数の 3 桁で表した値（範囲 [001,366]）                                                                                   | `187`                   |
| `%d` | 月の日付をゼロ埋めした 10 進数で表したもの（範囲 [01,31]）。1 桁の値は先頭にゼロを付けます。                                                                  | `06`                    |
| `%e` | 月内の日を、先頭にスペースを入れた10進数で表します（範囲 [1,31]）。1桁の場合は先頭にスペースが付きます。                                                              | `&nbsp; 6`              |
| `%a` | 省略形の曜日名。例: Fri（ロケールに依存）                                                                                                | `木`                     |
| `%A` | 曜日名のフルスペル。例: Friday（ロケール依存）                                                                                            | `木曜日`                   |
| `%w` | 曜日を表す整数値。日曜日を0とする（範囲 [0-6]）                                                                                            | `4`                     |
| `%u` | 曜日を表す10進数。月曜日を1とする（ISO 8601 形式）（範囲 [1-7]）                                                                              | `4`                     |
| `%H` | 24 時間制における時を 10 進数で表現（範囲 [00-23]）                                                                                      | `18`                    |
| `%I` | 12 時間制における 10 進数表記の時（範囲 [01,12]）                                                                                       | `06`                    |
| `%M` | 分（10 進数、範囲 [00,59]）                                                                                                    | `32`                    |
| `%S` | 秒を表す10進数（範囲 [00,60]）                                                                                                   | `07`                    |
| `%c` | 標準的な日付と時刻の文字列表現。例: Sun Oct 17 04:41:13 2010（ロケールに依存）                                                                   | `2023年7月6日(木) 18:32:07` |
| `%x` | ロケールに応じた日付表現（ロケール依存）                                                                                                   | `2023/07/06`            |
| `%X` | ローカライズされた時刻表記（例：18:40:20 や 6:40:20 PM、ロケールに依存）                                                                         | `18:32:07`              |
| `%D` | 短い MM/DD/YY 形式の日付（%m/%d/%y と同等）。                                                                                       | `2023/07/06`            |
| `%F` | 短い YYYY-MM-DD 形式の日付。%Y-%m-%d と同等です。                                                                                    | `2023-07-06`            |
| `%r` | ロケールに応じた12時間制の時刻表記                                                                                                     | `06:32:07 PM`           |
| `%R` | 「%H:%M」と同等です                                                                                                           | `18:32`                 |
| `%T` | &quot;%H:%M:%S&quot;（ISO 8601 の時刻形式）と同等                                                                                | `18:32:07`              |
| `%p` | ローカライズされた午前/午後（a.m./p.m.）の表記（ロケール依存）                                                                                   | `PM`                    |
| `%z` | UTC からのオフセットを ISO 8601 形式で表したもの（例: -0430）、タイムゾーン情報が利用できない場合は空文字                                                        | `+0800`                 |
| `%Z` | ロケール依存のタイムゾーン名または略称。タイムゾーン情報が利用できない場合は何も出力されません                                                                        | `Z AWST `               |

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

ログメッセージのみをコンソールに出力するには、次のようにします。

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個々のログ名ごとにログレベルを上書きできます。たとえば、ロガー「Backup」と「RBAC」からのすべてのメッセージを抑制する場合などです。

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

`<syslog>` 用のキー:

| Key        | Description                                                                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | `host\[:port\]` 形式の syslog のアドレス。省略された場合はローカルデーモンが使用されます。                                                                                                                                                                       |
| `hostname` | ログが送信されるホスト名（省略可能）。                                                                                                                                                                                                             |
| `facility` | syslog の [facility キーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。必ず大文字で &quot;LOG&#95;&quot; プレフィックス付きで指定する必要があります（例: `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` など）。既定値：`address` が指定されている場合は `LOG_USER`、それ以外は `LOG_DAEMON`。 |
| `format`   | ログメッセージの形式。指定可能な値：`bsd` および `syslog.`                                                                                                                                                                                           |

**Log formats**

コンソールログに出力されるログ形式を指定できます。現在は JSON のみがサポートされています。

**Example**

出力される JSON ログの例を次に示します。

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

JSON 形式のログ出力を有効にするには、以下のスニペットを使用してください。

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- チャネルごと（log、errorlog、console、syslog）に設定するか、全チャネルに対してグローバルに設定可能（グローバル設定の場合は省略）。 -->
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

レプリケーテッドテーブル用のパラメータ置換です。

レプリケーテッドテーブルを使用しない場合は省略できます。

詳細については、[レプリケーテッドテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)セクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```


## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />マークキャッシュポリシーの名前。

## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />プリウォーム時に、マークキャッシュの総容量のうち事前にウォームアップする割合。

## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

[`MergeTree`](/engines/table-engines/mergetree-family) ファミリーのテーブルにおけるマーク（インデックス）キャッシュの最大サイズです。

:::note
この設定は実行時に変更でき、直ちに反映されます。
:::

## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />マークキャッシュにおける保護キュー（SLRU ポリシーの場合）のサイズを、キャッシュ全体のサイズに対する比率として指定します。

## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />起動時にアクティブなデータパーツの集合（Active）を読み込むためのスレッド数。

## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ユーザーの作成または変更時に設定できる認証方式の最大数。
この設定を変更しても、既存ユーザーには影響しません。この設定で指定された上限を超えた場合、認証関連の CREATE/ALTER クエリは失敗します。
認証に関連しない CREATE/ALTER クエリは成功します。

:::note
値が `0` の場合は無制限を意味します。
:::

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上で実行されるすべてのバックアップに対する 1 秒あたりの最大読み取り速度（バイト単位）。0 の場合は無制限を意味します。

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Backups IO スレッドプール内の**アイドル状態の**スレッド数が `max_backup_io_thread_pool_free_size` を超えた場合、ClickHouse はアイドル状態のスレッドが占有しているリソースを解放し、プールサイズを縮小します。必要に応じてスレッドは再度作成されます。

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse は、S3 へのバックアップ I/O 処理を実行するために Backups IO Thread プールのスレッドを使用します。`max_backups_io_thread_pool_size` は、このプール内のスレッド数の最大値を制限します。

## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

ベクトルインデックスの構築に使用するスレッドの最大数。

:::note
`0` を指定すると、すべてのコアを使用します。
:::

## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行できる INSERT クエリの総数の上限。

:::note

`0`（デフォルト）の場合は無制限を意味します。

この設定は実行中に変更でき、即座に反映されます。すでに実行中のクエリには影響しません。
:::

## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行できるクエリの総数の上限を設定します。`INSERT` および `SELECT` クエリに対する制限や、ユーザーごとの最大クエリ数に対する制限もあわせて考慮する必要があります。

あわせて参照してください:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

値が `0`（デフォルト）の場合は無制限を意味します。

この設定は実行時に変更でき、即座に有効になります。すでに実行中のクエリには影響しません。
:::

## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行できる `SELECT` クエリの総数の上限。

:::note

`0`（デフォルト値）の場合は無制限を意味します。

この設定は実行時に変更でき、即座に反映されます。すでに実行中のクエリには影響しません。
:::

## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />サーバーの最大接続数。

## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />データベースの数がこの値を超えた場合、サーバーは例外をスローします。0 は制限がないことを意味します。

## max&#95;database&#95;num&#95;to&#95;warn {#max_database_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

アタッチされているデータベースの数が指定した値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />DatabaseReplicated において、レプリカ復旧中にテーブルを作成するために使用するスレッド数。0 を指定すると、コア数と同じ数のスレッドが使用されます。

## max&#95;dictionary&#95;num&#95;to&#95;throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

ディクショナリの数がこの値を超えると、サーバーは例外を送出します。

次のデータベースエンジンのテーブルのみがカウントされます:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
`0` を指定すると、制限なしを意味します。
:::

**例**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```


## max&#95;dictionary&#95;num&#95;to&#95;warn {#max_dictionary_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

アタッチされている辞書の数が指定した値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上の分散キャッシュからの読み取りに対する最大合計帯域幅（毎秒のバイト数）。0 は無制限を意味します。

## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーにおける分散キャッシュへの最大合計書き込み速度（1 秒あたりのバイト数）。0 の場合は無制限です。

## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />集約中に収集されるハッシュテーブル統計が保持できるエントリ数の上限値

## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITION に使用されるスレッド数です。

## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

入力のパース用スレッドプールで待機させておくアイドルスレッドの最大数。

## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

入力を解析するために使用するスレッドの総数の上限。

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

IO スレッドプール内の**アイドル**スレッド数が `max_io_thread_pool_free_size` を超えた場合、ClickHouse はアイドル状態のスレッドが占有しているリソースを解放し、プールサイズを縮小します。必要に応じてスレッドは再度作成されます。

## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse は I/O スレッドプールのスレッドを使用して、一部の I/O 処理（例：S3 とのやり取り）を実行します。`max_io_thread_pool_size` はプール内のスレッド数の最大値を制限します。

## max&#95;keep&#95;alive&#95;requests {#max_keep_alive_requests}

<SettingsInfoBlock type="UInt64" default_value="10000" />

1 つの keep-alive 接続で、ClickHouse サーバーによって接続が閉じられるまでに処理されるリクエストの最大数。

**例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカルでの読み取りの最大帯域幅（1 秒あたりのバイト数）。

:::note
値が `0` の場合は無制限を意味します。
:::

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカルへの書き込み速度の上限（秒あたりのバイト数）。

:::note
値が `0` の場合は無制限を意味します。
:::

## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルに関連付けられるマテリアライズドビューの数の上限です。

:::note
ここでカウントされるのはテーブルに直接依存しているビューのみであり、あるビューの上に別のビューを作成する場合はカウント対象外です。
:::

## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上で実行されるすべてのマージに対する最大読み取り速度（バイト/秒）。0 は無制限を意味します。

## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上で実行されるすべてのミューテーションの最大読み取り帯域幅（1 秒あたりのバイト数）。0 は無制限を意味します。

## max&#95;named&#95;collection&#95;num&#95;to&#95;throw {#max_named_collection_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

名前付きコレクションの数がこの値を超えると、サーバーは例外を送出します。

:::note
値が `0` の場合は、制限がないことを意味します。
:::

**例**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max&#95;named&#95;collection&#95;num&#95;to&#95;warn {#max_named_collection_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

名前付きコレクションの数が指定された値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max&#95;open&#95;files {#max_open_files}

開いておけるファイルの最大数です。

:::note
`getrlimit()` 関数が正しくない値を返すため、macOS ではこのオプションの使用を推奨します。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```


## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

接続を切断するかどうかを判断する際に使用される、OS の CPU 待機時間（OSCPUWaitMicroseconds メトリクス）とビジー時間（OSCPUVirtualTimeMicroseconds メトリクス）の最大比率です。切断確率の計算には、最小比率と最大比率の間での線形補間が使用され、この設定値の時点で確率は 1 になります。
詳細は [サーバー CPU 過負荷時の動作制御](/operations/settings/server-overload) を参照してください。

## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />起動時に非アクティブなデータパーツ群（古いパーツ）を読み込むためのスレッド数。

## max&#95;part&#95;num&#95;to&#95;warn {#max_part_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="100000" />

アクティブなパーツ数が指定された値を超えた場合、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max&#95;partition&#95;size&#95;to&#95;drop {#max_partition_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

パーティション削除に対する制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが [`max_partition_size_to_drop`](#max_partition_size_to_drop)（バイト単位）を超えている場合、[DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) クエリを使用してパーティションを削除することはできません。
この設定は、ClickHouse サーバーを再起動せずに適用されます。制限を無効にする別の方法として、`<clickhouse-path>/flags/force_drop_table` ファイルを作成することもできます。

:::note
値が `0` の場合、制限なしでパーティションを削除できます。

この制限は DROP TABLE および TRUNCATE TABLE には適用されません。[max&#95;table&#95;size&#95;to&#95;drop](/operations/settings/settings#max_table_size_to_drop) を参照してください。
:::

**例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />非アクティブなデータパーツを同時に削除するためのスレッド数。

## max&#95;pending&#95;mutations&#95;execution&#95;time&#95;to&#95;warn {#max_pending_mutations_execution_time_to_warn}

<SettingsInfoBlock type="UInt64" default_value="86400" />

保留中の mutation のいずれかが、この設定で指定した秒数を超えた場合、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max&#95;pending&#95;mutations&#95;to&#95;warn {#max_pending_mutations_to_warn}

<SettingsInfoBlock type="UInt64" default_value="500" />

未処理のミューテーション数が指定した値を超えた場合、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

prefixes deserialization 用のスレッドプール内の**アイドル状態の**スレッド数が `max_prefixes_deserialization_thread_pool_free_size` を超えた場合、ClickHouse はアイドル状態のスレッドが占有しているリソースを解放し、プールのサイズを縮小します。スレッドは必要に応じて再作成されます。

## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse は、MergeTree の Wide パーツ内のファイルプレフィックスからカラムおよびサブカラムのメタデータを並列に読み取るために、プレフィックスのデシリアライズ用スレッドプールのスレッドを使用します。`max_prefixes_deserialization_thread_pool_size` は、このプール内のスレッド数の最大値を制限します。

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時にネットワーク経由で行われるデータ転送の最大速度（1 秒あたりのバイト数）。

:::note
`0`（デフォルト）の場合は無制限です。
:::

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

書き込み時における、ネットワーク経由でのデータ送受信の最大速度（1 秒あたりのバイト数）。

:::note
`0`（デフォルト）の場合は無制限を意味します。
:::

## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケートフェッチにおけるネットワーク上のデータ交換速度の最大値（バイト/秒）。0 は無制限を意味します。

## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケーションでの送信におけるネットワーク上のデータ交換の最大速度を、1 秒あたりのバイト数で指定します。0 を指定すると無制限になります。

## max&#95;replicated&#95;table&#95;num&#95;to&#95;throw {#max_replicated_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

レプリケーテッドテーブルの数がこの値を超えると、サーバーは例外をスローします。

次のデータベースエンジンに属するテーブルのみがカウントされます:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
値が `0` の場合は、制限がないことを意味します。
:::

**例**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```


## max_server_memory_usage {#max_server_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

サーバーが使用できるメモリの最大量をバイト単位で指定します。

:::note
サーバーの最大メモリ使用量は、`max_server_memory_usage_to_ram_ratio` の設定によってさらに制限されます。
:::

特例として、値が `0`（デフォルト）の場合は、サーバーは（`max_server_memory_usage_to_ram_ratio` による追加の制限を除き）利用可能なメモリをすべて使用できることを意味します。

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />

サーバーが使用することを許可されているメモリの最大量を、利用可能なメモリ全体に対する比率で指定します。

たとえば、値を `0.9`（デフォルト）とした場合、サーバーは利用可能なメモリの 90% まで使用できることを意味します。

メモリの少ないシステムでメモリ使用量を抑えることができます。
RAM とスワップが少ないホストでは、[`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) を 1 より大きい値に設定する必要がある場合があります。

:::note
サーバーの最大メモリ使用量は、`max_server_memory_usage` の設定によってさらに制限されます。
:::

## max&#95;session&#95;timeout {#max_session_timeout}

セッションの最大タイムアウト時間（秒）。

例：

```xml
<max_session_timeout>3600</max_session_timeout>
```


## max&#95;table&#95;num&#95;to&#95;throw {#max_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブル数がこの値を超えると、サーバーは例外をスローします。

次のテーブルはカウントされません:

* view
* remote
* dictionary
* system

次のデータベースエンジンのテーブルのみをカウントします:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
値が `0` の場合は、制限なしを意味します。
:::

**例**

```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```


## max&#95;table&#95;num&#95;to&#95;warn {#max_table_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="5000" />

アタッチされているテーブルの数が指定された値を超えると、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```


## max&#95;table&#95;size&#95;to&#95;drop {#max_table_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

テーブル削除に対する制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが `max_table_size_to_drop`（バイト単位）を超える場合、[`DROP`](../../sql-reference/statements/drop.md) クエリや [`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリを使用して削除することはできません。

:::note
`0` を指定すると、すべてのテーブルを制限なく削除できます。

この設定を反映させるために ClickHouse サーバーを再起動する必要はありません。制限を無効化する別の方法として、`<clickhouse-path>/flags/force_drop_table` ファイルを作成する方法もあります。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部集約、結合、ソートに使用できる一時データの最大ディスク使用量。
この上限を超えたクエリは、例外を送出して失敗します。

:::note
`0` の値は無制限を意味します。
:::

関連項目:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max&#95;thread&#95;pool&#95;free&#95;size {#max_thread_pool_free_size}

<SettingsInfoBlock type="UInt64" default_value="1000" />

グローバルスレッドプール内の**アイドル**スレッドの数が [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size) より大きい場合、ClickHouse は一部のスレッドが占有しているリソースを解放し、プールのサイズを縮小します。必要に応じてスレッドは再度作成されます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```


## max&#95;thread&#95;pool&#95;size {#max_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse はクエリを処理するためにグローバルスレッドプールからスレッドを使用します。クエリを処理するための空きスレッドがない場合は、プール内に新しいスレッドが作成されます。`max_thread_pool_size` はプール内のスレッド数の上限を設定します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```


## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />起動時に非アクティブなデータパーツ集合（予期しないパーツ）を読み込むために使用するスレッド数。

## max&#95;view&#95;num&#95;to&#95;throw {#max_view_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

ビュー数がこの値を超える場合、サーバーは例外をスローします。

次のデータベースエンジンのテーブルのみがカウントされます:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
値 `0` は制限なしを意味します。
:::

**例**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```


## max&#95;view&#95;num&#95;to&#95;warn {#max_view_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="10000" />

アタッチされているビューの数が指定された値を超えると、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に待機状態となるクエリの総数に対する上限値。
必要なテーブルが非同期で読み込まれている間、待機中のクエリの実行はブロックされます（[`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases) を参照）。

:::note
待機中のクエリは、次の設定で制御される制限を判定する際にはカウントされません。

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

これは、サーバー起動直後にこれらの制限にすぐ達してしまうことを避けるための補正です。
:::

:::note

値が `0`（デフォルト）の場合は無制限を意味します。

この設定は実行時に変更でき、即座に有効になります。すでに実行中のクエリには影響しません。
:::

## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />

バックグラウンドメモリワーカーが、jemalloc や cgroups などの外部ソースから得られる情報に基づいて内部メモリトラッカーを補正するかどうか

## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

メモリ使用量が高い場合に、メモリトラッカーのメモリ使用量を補正し、未使用ページをクリーンアップするバックグラウンドメモリワーカーのティック間隔です。0 に設定すると、メモリ使用量のソースに応じてデフォルト値が使用されます。

## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />現在の cgroup メモリ使用量情報を使用して、メモリトラッキングを補正します。

## merge&#95;tree {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブル向けの細かなチューニング設定。

詳細については、`MergeTreeSettings.h` ヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />

マージ処理とその他のワークロードとの間でのリソースの使用および共有方法を制御するために使用します。指定した値は、すべてのバックグラウンドマージに対する `workload` 設定値として使用されます。MergeTree の設定で上書きできます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## merges&#95;mutations&#95;memory&#95;usage&#95;soft&#95;limit {#merges_mutations_memory_usage_soft_limit}

<SettingsInfoBlock type="UInt64" default_value="0" />

マージおよびミューテーション処理で使用を許可する RAM の上限を設定します。
ClickHouse がこの上限に達した場合、新しいバックグラウンドのマージおよびミューテーション処理はスケジュールされなくなりますが、すでにスケジュール済みのタスクの実行は継続されます。

:::note
値 `0` は無制限を意味します。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />

デフォルトの `merges_mutations_memory_usage_soft_limit` の値は、`memory_amount * merges_mutations_memory_usage_to_ram_ratio` によって計算されます。

**関連項目:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric&#95;log {#metric_log}

デフォルトでは無効になっています。

**有効化**

メトリクス履歴の収集 [`system.metric_log`](../../operations/system-tables/metric_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/metric_log.xml` を作成します。

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

`metric_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_metric_log.xml` ファイルを作成します。

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

接続の切断を検討する際に基準とする、OS の CPU 待機時間（`OSCPUWaitMicroseconds` メトリクス）とビジー時間（`OSCPUVirtualTimeMicroseconds` メトリクス）の比率の下限値です。切断確率の計算には、この下限値と上限値の間の線形補間が使用され、この値における確率は 0 になります。
詳細は [サーバー CPU 過負荷時の動作制御](/operations/settings/server-overload) を参照してください。

## mlock&#95;executable {#mlock_executable}

起動後に `mlockall` を実行して、最初のクエリのレイテンシを低減し、高負荷の IO 時に ClickHouse 実行ファイルがページアウトされるのを防ぎます。

:::note
このオプションを有効にすることは推奨されますが、起動時間が最大で数秒ほど長くなります。
また、この設定は &quot;CAP&#95;IPC&#95;LOCK&quot; ケーパビリティがないと機能しない点に注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```


## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

この設定により、頻繁な open/close 呼び出し（それに伴うページフォールトのため非常にコストが高い）を回避し、複数のスレッドおよびクエリ間でメモリマッピングを再利用できます。設定値はマップされたリージョンの数です（通常はマップされたファイル数と同等です）。

マップされたファイル内のデータ量は、以下のシステムテーブルにおいて、次のメトリクスで監視できます。

- [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log) 内の `MMappedFiles` / `MMappedFileBytes` / `MMapCacheCells`
- [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log) 内の `CreatedReadBufferMMap` / `CreatedReadBufferMMapFailed` / `MMappedFileCacheHits` / `MMappedFileCacheMisses`

:::note
マップされたファイル内のデータ量はメモリを直接消費せず、クエリやサーバーのメモリ使用量としてはカウントされません。これは、このメモリが OS のページキャッシュと同様に破棄可能であるためです。キャッシュは、MergeTree ファミリーのテーブルで古いパーツが削除される際に（ファイルがクローズされることで）自動的にドロップされます。また、`SYSTEM DROP MMAP CACHE` クエリを実行することで手動でドロップすることもできます。

この設定は実行時に変更でき、即座に反映されます。
:::

## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />

`mutation` とその他のワークロード間でのリソースの使用および共有方法を制御するために使用します。指定した値は、すべてのバックグラウンド `mutation` に対して `workload` 設定値として使用されます。MergeTree テーブルエンジンの設定で上書きできます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## mysql&#95;port {#mysql_port}

MySQL プロトコル経由でクライアントと通信するためのポート。

:::note

* 正の整数を指定すると、待ち受けるポート番号になります
* 空の値を指定すると、MySQL プロトコル経由でのクライアントとの通信が無効化されます。
  :::

**例**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport {#mysql_require_secure_transport} 

true に設定すると、[mysql_port](#mysql_port) 経由でクライアントと通信する際には、セキュアな通信が必須となります。`--ssl-mode=none` オプションを指定した接続は拒否されます。[OpenSSL](#openssl) の設定と併せて使用してください。

## openSSL {#openssl} 

SSL クライアント／サーバー構成。

SSL のサポートは `libpoco` ライブラリによって提供されます。利用可能な構成オプションは [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) で説明されています。デフォルト値は [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) に記載されています。

サーバー／クライアント構成用のキー:

| オプション                         | 概要                                                                                                                                                                                                                                                                                                                                                   | デフォルト値                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 証明書の秘密鍵を格納したファイルへのパスです。ファイルには鍵と証明書を同一ファイル内に含めることができます。                                                                                                                                                                                                                                                                                           |                                                                                            |
| `certificateFile`             | PEM 形式のクライアント／サーバー証明書ファイルへのパス。`privateKeyFile` に証明書が含まれている場合は指定を省略できます。                                                                                                                                                                                                                                                                              |                                                                                            |
| `caConfig`                    | 信頼された CA 証明書を含むファイルまたはディレクトリへのパスです。ファイルを参照している場合、そのファイルは PEM 形式である必要があり、複数の CA 証明書を含めることができます。ディレクトリを参照している場合、そのディレクトリには CA 証明書ごとに 1 つの .pem ファイルが含まれている必要があります。ファイル名は CA のサブジェクト名のハッシュ値で検索されます。詳細は [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) の man ページを参照してください。 |                                                                                            |
| `verificationMode`            | ノードの証明書の検証方法。詳細は [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明を参照してください。設定可能な値: `none`, `relaxed`, `strict`, `once`。                                                                                                                                                             | `relaxed`                                                                                  |
| `verificationDepth`           | 検証チェーンの最大長です。証明書チェーンの長さがこの値を超えると、検証は失敗します。                                                                                                                                                                                                                                                                                                           | `9`                                                                                        |
| `loadDefaultCAFile`           | OpenSSL 用の組み込み CA 証明書を使用するかどうかを指定します。ClickHouse は、組み込み CA 証明書がファイル `/etc/ssl/cert.pem`（またはディレクトリ `/etc/ssl/certs`）にあるか、環境変数 `SSL_CERT_FILE`（または `SSL_CERT_DIR`）で指定されたファイル（またはディレクトリ）内にあると想定します。                                                                                                                                                      | `true`                                                                                     |
| `cipherList`                  | サポートされている OpenSSL の暗号スイート                                                                                                                                                                                                                                                                                                                            | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | セッションキャッシュを有効または無効にします。`sessionIdContext` と組み合わせて使用する必要があります。設定可能な値：`true`、`false`。                                                                                                                                                                                                                                                                  | `false`                                                                                    |
| `sessionIdContext`            | サーバーが生成する各識別子に付加される、サーバー固有のランダムな文字列です。文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはなりません。サーバー側でセッションをキャッシュする場合とクライアントがキャッシュを要求した場合の両方で問題を回避するのに役立つため、このパラメータを設定することを常に推奨します。                                                                                                                                                                         | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | サーバーがキャッシュするセッションの最大数。値を `0` にすると、セッション数は無制限になります。                                                                                                                                                                                                                                                                                                   | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | サーバー上でのセッションキャッシュの保持時間（時間単位）。                                                                                                                                                                                                                                                                                                                        | `2`                                                                                        |
| `extendedVerification`        | 有効化されている場合は、証明書の CN または SAN がピアのホスト名と一致していることを確認します。                                                                                                                                                                                                                                                                                                 | `false`                                                                                    |
| `requireTLSv1`                | TLSv1 接続を要求します。指定可能な値は `true` または `false` です。                                                                                                                                                                                                                                                                                                        | `false`                                                                                    |
| `requireTLSv1_1`              | TLSv1.1 接続を必須とします。指定可能な値：`true`、`false`。                                                                                                                                                                                                                                                                                                             | `false`                                                                                    |
| `requireTLSv1_2`              | TLSv1.2 接続を必須とします。有効な値: `true`, `false`。                                                                                                                                                                                                                                                                                                             | `false`                                                                                    |
| `fips`                        | OpenSSL の FIPS モードを有効化します。ライブラリで使用している OpenSSL のバージョンが FIPS をサポートしている場合にのみ有効です。                                                                                                                                                                                                                                                                      | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandler のサブクラス）。例えば: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`。                                                                                                                               | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するためのクラス（CertificateHandler のサブクラス）。例えば、`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` のように指定します。                                                                                                                                                                                         | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 使用が禁止されているプロトコル。                                                                                                                                                                                                                                                                                                                                     |                                                                                            |
| `preferServerCiphers`         | クライアント優先のサーバー側暗号スイート。                                                                                                                                                                                                                                                                                                                                | `false`                                                                                    |

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
        <!-- 自己署名証明書を使用する場合: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 自己署名証明書を使用する場合: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```


## opentelemetry&#95;span&#95;log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) システムテーブルに関する設定です。

<SystemLogParameters />

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

<SettingsInfoBlock type="UInt64" default_value="1000000" />CPU が有効な処理を行っていると見なすための、OS の CPU ビジー時間（`OSCPUVirtualTimeMicroseconds` メトリクス）に対するしきい値（マイクロ秒単位）。ビジー時間がこの値未満の場合、CPU が過負荷状態であるとは見なされません。

## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

<SettingsInfoBlock type="Int32" default_value="0" />

分散キャッシュ TCP ハンドラー用スレッドの Linux の nice 値。値が小さいほど CPU の優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要で、付与されていない場合は何も行われません。

設定可能な値の範囲: -20 〜 19。

## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

<SettingsInfoBlock type="Int32" default_value="0" />

マージおよびミューテーションスレッドに対する Linux の nice 値。値が低いほど CPU 優先度は高くなります。

CAP_SYS_NICE ケイパビリティが必要で、このケイパビリティがない場合は何も行われません。

指定可能な値: -20 ～ 19。

## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

<SettingsInfoBlock type="Int32" default_value="0" />

ZooKeeper クライアントにおける送信スレッドおよび受信スレッドの Linux の nice 値。値が小さいほど CPU 優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要で、ない場合は何も実行されません。

指定可能な値: -20 ～ 19。

## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />メモリ上限値のうち、ユーザースペースのページキャッシュとして使用せずに空けておく割合です。Linux の `min_free_kbytes` 設定に相当します。

## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />解放されたメモリがユーザースペースのページキャッシュで再利用可能になるまでの遅延。

## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />ユーザー空間ページキャッシュの最大サイズです。キャッシュを無効にするには 0 に設定します。`page_cache_min_size` より大きい場合、この範囲内でキャッシュサイズが継続的に調整され、利用可能なメモリの大部分を使用しつつ、合計メモリ使用量が制限値（`max_server_memory_usage[_to_ram_ratio]`）を下回るように保たれます。

## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />ユーザー空間ページキャッシュの最小サイズ。

## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ユーザー空間ページキャッシュポリシーの名前。

## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />ミューテックスの競合を減らすため、ユーザースペースのページキャッシュをこの数のシャードにストライプ化します。実験的な機能であり、性能向上はほとんど期待できません。

## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />ユーザースペースページキャッシュにおける保護キューのサイズを、キャッシュの総サイズに対する比率で表します。

## part&#95;log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) に関連するログイベントを記録します。たとえば、データの追加やマージなどです。このログを利用してマージアルゴリズムをシミュレートし、その特性を比較できます。マージ処理を可視化することもできます。

クエリは個別のファイルではなく、[system.part&#95;log](/operations/system-tables/part_log) テーブルに記録されます。このテーブル名は `table` パラメータで設定できます（後述）。

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

<SettingsInfoBlock type="UInt64" default_value="30" />

SharedMergeTree のパーツを完全に削除するまでの期間。ClickHouse Cloud でのみ利用可能です

## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

非常に多くのテーブルが存在する場合に、一斉アクセス（thundering herd）問題とそれに続く ZooKeeper への DoS を回避するため、`kill_delay_period` に 0 から x 秒までの一様分布の乱数を加算します。ClickHouse Cloud でのみ利用可能です。

## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />

共有 MergeTree テーブルの古くなったパーツをクリーンアップするためのスレッド数です。ClickHouse Cloud でのみ利用可能です。

## path {#path}

データが格納されているディレクトリへのパス。

:::note
末尾のスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
```


## postgresql&#95;port {#postgresql_port}

PostgreSQL プロトコル経由でクライアントと通信するためのポート。

:::note

* 正の整数は待ち受けるポート番号を指定します
* 空値にすると、PostgreSQL プロトコル経由でクライアントとの通信が無効化されます。
  :::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

true に設定すると、[postgresql_port](#postgresql_port) を介したクライアントとのセキュアな通信が必須になります。`sslmode=disable` オプションでの接続は拒否されます。[OpenSSL](#openssl) の設定と併用してください。

## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />リモートオブジェクトストレージ向けのプリフェッチ用バックグラウンドプールのサイズ

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />プリフェッチ用プールに投入できるタスクの最大数

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

prefixes deserialization 用スレッドプールにスケジュールできるジョブの最大数。

:::note
値が `0` の場合は無制限を意味します。
:::

## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、ClickHouse は起動する前に、設定されているすべての `system.*_log` テーブルを作成します。一部の起動スクリプトがこれらのテーブルに依存している場合に役立ちます。

## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />プライマリインデックスキャッシュポリシーの名前。

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />プリウォーム時に、マークキャッシュの総サイズのうちどの程度まで埋めるかを指定する比率。

## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />プライマリインデックス（MergeTree ファミリーのテーブルのインデックス）のキャッシュの最大サイズ。

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />プライマリインデックスキャッシュにおける、保護キュー（SLRU ポリシーの場合）のサイズをキャッシュ全体サイズに対する比率として指定します。

## process&#95;query&#95;plan&#95;packet {#process_query_plan_packet}

<SettingsInfoBlock type="Bool" default_value="0" />

この設定により、QueryPlan パケットを読み取れるようになります。このパケットは、`serialize_query_plan` が有効な場合に分散クエリで送信されます。
クエリプランのバイナリ逆シリアル化におけるバグが原因となる可能性のあるセキュリティ上の問題を避けるため、デフォルトでは無効になっています。

**例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors&#95;profile&#95;log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) システムテーブルの設定です。

<SystemLogParameters />

デフォルトの設定は以下のとおりです。

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

[Prometheus](https://prometheus.io) によるスクレイピング向けにメトリクスデータを公開します。

設定:

* `endpoint` – Prometheus サーバーがメトリクスをスクレイピングするための HTTP エンドポイントです。&#39;/&#39; で始めます。
* `port` – `endpoint` 用のポート。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルのメトリクスを公開します。
* `events` – [system.events](/operations/system-tables/events) テーブルのメトリクスを公開します。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開します。
* `errors` - サーバーの直近の再起動以降に発生したエラーコードごとのエラー数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。

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

確認（`127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えてください）:

```bash
curl 127.0.0.1:9363/metrics
```


## proxy {#proxy}

HTTP および HTTPS リクエスト用のプロキシサーバーを定義します。現在、S3 ストレージ、S3 テーブル関数、および URL 関数でサポートされています。

プロキシサーバーを定義する方法は 3 通りあります。

* environment variables（環境変数）
* proxy lists（プロキシリスト）
* remote proxy resolvers（リモートプロキシリゾルバ）

`no_proxy` を使用することで、特定のホストに対してプロキシサーバーをバイパスすることもできます。

**Environment variables**

`http_proxy` および `https_proxy` 環境変数を使用すると、
特定のプロトコルに対するプロキシサーバーを指定できます。システム上でこれらを設定している場合は、そのままシームレスに動作します。

あるプロトコルに対して
プロキシサーバーが 1 つだけで、そのプロキシサーバーが変更されない場合、この方法が最も簡単です。

**Proxy lists**

この方法では、1 つ以上の
プロキシサーバーをプロトコルごとに指定できます。複数のプロキシサーバーが定義されている場合、
ClickHouse はそれらのプロキシをラウンドロビン方式で使用し、サーバー間で
負荷を分散します。あるプロトコルに対して複数の
プロキシサーバーがあり、その一覧が変化しない場合は、この方法が最も簡単です。

**Configuration template**

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

下のタブで親フィールドを選択すると、その子フィールドが表示されます:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description           |
    | --------- | --------------------- |
    | `<http>`  | 1 つ以上の HTTP プロキシのリスト  |
    | `<https>` | 1 つ以上の HTTPS プロキシのリスト |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Field   | Description |
    | ------- | ----------- |
    | `<uri>` | プロキシの URI   |
  </TabItem>
</Tabs>

**リモートプロキシリゾルバー**

プロキシサーバーが動的に変更される場合があります。その場合は、リゾルバーのエンドポイントを定義できます。ClickHouse はそのエンドポイントに空の GET リクエストを送信し、リモートリゾルバーはプロキシホストを返す必要があります。
ClickHouse は、それを使用して次のテンプレートに従ってプロキシ URI を構成します: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

下のタブから親フィールドを選択して、その子要素を確認してください：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | フィールド     | 説明                   |
    | --------- | -------------------- |
    | `<http>`  | 1つ以上の resolver のリスト* |
    | `<https>` | 1つ以上の resolver のリスト* |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | フィールド        | 説明                         |
    | ------------ | -------------------------- |
    | `<resolver>` | resolver のエンドポイントおよびその他の情報 |

    :::note
    複数の `<resolver>` 要素を定義できますが、特定のプロトコルに対して実際に使用されるのは
    最初の `<resolver>` だけです。そのプロトコル用のその他の `<resolver>` 要素は
    無視されます。そのため、ロードバランシングが必要な場合は、リモート側の resolver で
    実装する必要があります。
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | フィールド                | 説明                                                                                                                  |
    | -------------------- | ------------------------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | プロキシ resolver の URI                                                                                                 |
    | `<proxy_scheme>`     | 最終的なプロキシ URI のプロトコル。`http` または `https` のいずれかを指定します。                                                                 |
    | `<proxy_port>`       | プロキシ resolver のポート番号                                                                                                |
    | `<proxy_cache_time>` | resolver から取得した値を ClickHouse がキャッシュする秒数。この値を `0` に設定すると、ClickHouse はすべての HTTP または HTTPS リクエストごとに resolver に問い合わせます。 |
  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決まります：

| 優先順位 | 設定                |
| ---- | ----------------- |
| 1.   | リモートプロキシ resolver |
| 2.   | プロキシリスト           |
| 3.   | 環境変数              |


ClickHouse は、リクエストプロトコルに対して最も優先度の高いリゾルバータイプを確認します。もしそれが定義されていない場合、
環境リゾルバーに到達するまで、次に優先度の高いリゾルバータイプを順に確認します。
これにより、複数種類のリゾルバーを組み合わせて使用することも可能になります。

## query&#95;cache {#query_cache}

[クエリキャッシュ](../query-cache.md) の設定です。

利用可能な設定項目は次のとおりです。

| Setting                   | Description                                     | Default Value |
| ------------------------- | ----------------------------------------------- | ------------- |
| `max_size_in_bytes`       | キャッシュの最大サイズ（バイト単位）。`0` の場合、クエリキャッシュは無効になります。    | `1073741824`  |
| `max_entries`             | キャッシュに保存される `SELECT` クエリ結果の最大件数。                | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存できる `SELECT` クエリ結果 1 件あたりの最大サイズ（バイト単位）。 | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存できる `SELECT` クエリ結果 1 件あたりの最大行数。         | `30000000`    |

:::note

* 設定を変更すると、ただちに有効になります。
* クエリキャッシュ用のデータは DRAM 上に確保されます。メモリが逼迫している場合は、`max_size_in_bytes` を小さな値に設定するか、クエリキャッシュを完全に無効にしてください。
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

<SettingsInfoBlock type="String" default_value="SLRU" />クエリ条件キャッシュのポリシー名。

## query_condition_cache_size {#query_condition_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

クエリ条件キャッシュの最大サイズです。
:::note
この設定は実行時に変更でき、その変更は即座に反映されます。
:::

## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />クエリ条件キャッシュにおける、保護キュー（SLRU ポリシーの場合）のサイズが、キャッシュ全体のサイズに対して占める比率です。

## query&#95;log {#query_log}

[log&#95;queries=1](../../operations/settings/settings.md) 設定で受信したクエリをログに記録するための設定です。

クエリは別ファイルではなく、[system.query&#95;log](/operations/system-tables/query_log) テーブルに記録されます。`table` パラメータでテーブル名を変更できます（以下参照）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse が自動的に作成します。ClickHouse サーバーのアップデート時にクエリログの構造が変更された場合は、古い構造のテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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


## query&#95;masking&#95;rules {#query_masking_rules}

正規表現に基づくルールで、クエリおよびすべてのログメッセージに対して、サーバーログへの保存やクライアントへの送信を行う前に適用されます。
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブル、およびクライアントに送信されるログが対象です。これにより、名前、メールアドレス、個人識別子、クレジットカード番号などの機密データが、SQL クエリからログへ漏えいするのを防止できます。

**例**

```xml
<query_masking_rules>
    <rule>
        <name>SSNを非表示</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**設定フィールド**:

| 設定項目      | 説明                                       |
| --------- | ---------------------------------------- |
| `name`    | ルールの名前（任意）                               |
| `regexp`  | RE2 互換の正規表現（必須）                          |
| `replace` | 機微データを置き換えるための置換文字列（任意、デフォルトはアスタリスク 6 個） |

マスキングルールはクエリ全体に適用されます（不正形式／解析不能なクエリから機微データが漏洩するのを防ぐため）。

[`system.events`](/operations/system-tables/events) テーブルには `QueryMaskingRulesMatch` というカウンタがあり、クエリマスキングルールがマッチした総数を記録します。

分散クエリの場合、各サーバーを個別に設定する必要があります。そうしないと、他のノードに渡されるサブクエリはマスキングされないまま保存されます。


## query&#95;metric&#95;log {#query_metric_log}

デフォルトでは無効になっています。

**有効化**

メトリクス履歴の収集を手動で有効にするには、次の内容を含む `/etc/clickhouse-server/config.d/query_metric_log.xml` を作成します：[`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)。

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

`query_metric_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` ファイルを作成します。

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query&#95;thread&#95;log {#query_thread_log}

[log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads) 設定で受信したクエリのスレッドをログに記録するための設定です。

クエリは個別のファイルではなく、[system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) テーブルに記録されます。テーブル名は `table` パラメータで変更できます（以下を参照）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse が作成します。ClickHouse サーバーのアップデートによりクエリスレッドログの構造が変更された場合、旧構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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


## query&#95;views&#95;log {#query_views_log}

[log&#95;query&#95;views=1](/operations/settings/settings#log_query_views) 設定を有効にした状態で受信したクエリに応じて、ビュー（ライブビュー、マテリアライズドビューなど）をログ出力するための設定です。

クエリは、個別のファイルではなく [system.query&#95;views&#95;log](/operations/system-tables/query_views_log) テーブルにログ出力されます。`table` パラメータでテーブル名を変更できます（下記参照）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse が作成します。ClickHouse サーバーをアップデートした際に query&#95;views&#95;log の構造が変更されていた場合は、旧構造のテーブルがリネームされ、新しいテーブルが自動的に作成されます。

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


## remap&#95;executable {#remap_executable}

Hugeページを使用してマシンコード（「text」）用のメモリを再割り当てするための設定です。

:::note
この機能は非常に実験的です。
:::

例:

```xml
<remap_executable>false</remap_executable>
```


## remote&#95;servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンおよび `cluster` テーブル関数で使用されるクラスターの設定です。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性の値については、「[Configuration files](/operations/configuration-files)」セクションを参照してください。

**関連項目**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Cluster Discovery](../../operations/cluster-discovery.md)
* [Replicated database engine](../../engines/database-engines/replicated.md)


## remote&#95;url&#95;allow&#95;hosts {#remote_url_allow_hosts}

URL 関連のストレージエンジンおよびテーブル関数での使用が許可されているホストの一覧です。

`\<host\>` XML タグでホストを追加する場合:

* DNS 解決の前に名前がチェックされるため、URL に記載されているものとまったく同じように指定する必要があります。例: `<host>clickhouse.com</host>`
* URL 内でポートが明示的に指定されている場合は、host:port 全体としてチェックされます。例: `<host>clickhouse.com:80</host>`
* ホストをポートなしで指定した場合、そのホスト上の任意のポートが許可されます。例: `<host>clickhouse.com</host>` が指定されている場合、`clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) などが許可されます。
* ホストを IP アドレスで指定した場合は、URL に記載されているとおりにチェックされます。例: `[2a02:6b8:a::a]`。
* リダイレクトが存在し、リダイレクトのサポートが有効な場合は、すべてのリダイレクト（`location` フィールド）がチェックされます。

例:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica&#95;group&#95;name {#replica_group_name}

Replicated データベースのレプリカグループ名。

Replicated データベースで作成されるクラスターは、同一グループに属するレプリカで構成されます。
DDL クエリは、同一グループ内のレプリカに対してのみ待機します。

既定では空です。

**例**

```xml
<replica_group_name>バックアップ</replica_group_name>
```


## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />パーツ取得リクエスト用の HTTP 接続タイムアウトです。明示的に設定されていない場合は、デフォルトプロファイル `http_connection_timeout` から継承されます。

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />フェッチパーツリクエスト用の HTTP 受信タイムアウト。明示的に設定されていない場合は、デフォルトプロファイルの `http_receive_timeout` を継承します。

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />パーツ取得リクエストに対する HTTP 送信タイムアウト。明示的に設定されていない場合は、デフォルトプロファイルの `http_send_timeout` を継承します。

## replicated&#95;merge&#95;tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブル向けの詳細設定です。この設定の優先度は他より高くなります。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />RESTORE リクエストの実行に使用されるスレッドの最大数。

## s3_credentials_provider_max_cache_size {#s3_credentials_provider_max_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />キャッシュできる S3 認証情報プロバイダーの最大数

## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />許可される S3 リダイレクトのホップ数の上限。

## s3_retry_attempts {#s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="500" />Aws::Client::RetryStrategy の設定です。Aws::Client 自体がリトライを行い、0 を指定するとリトライしないことを意味します。

## s3queue_disable_streaming {#s3queue_disable_streaming} 

<SettingsInfoBlock type="Bool" default_value="0" />テーブルが作成されていて、マテリアライズドビューがアタッチされている場合でも、S3Queue のストリーミングを無効にします

## s3queue&#95;log {#s3queue_log}

`s3queue_log` システムテーブルに関する設定です。

<SystemLogParameters />

デフォルト設定は次のとおりです。

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```


## send&#95;crash&#95;reports {#send_crash_reports}

ClickHouse コア開発チームへクラッシュレポートを送信するための設定です。

特に本番前の環境では、有効化しておくことを強く推奨します。

Keys:

| Key                   | Description                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| `enabled`             | 機能を有効化するブール値フラグ。デフォルトは `true`。クラッシュレポートの送信を行わない場合は `false` に設定します。                               |
| `send_logical_errors` | `LOGICAL_ERROR` は `assert` のようなもので、ClickHouse 側のバグです。このブール値フラグで、これらの例外の送信を有効にします（デフォルト: `true`）。 |
| `endpoint`            | クラッシュレポートの送信先エンドポイント URL を上書きできます。                                                               |

**推奨される使用方法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />

`generateSerialID` 関数によって生成される、自動インクリメントされる番号付きの Keeper 内のパスです。各シリーズは、このパス配下のノードとして作成されます。

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />この設定を true にすると、スタックトレースにアドレスが表示されます

## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />`true` に設定すると、ClickHouse はシャットダウン前に、実行中のバックアップおよびリストア処理が完了するまで待機します。

## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />未完了のクエリを待機する秒数

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />true に設定すると、ClickHouse はシャットダウン前に実行中のクエリが完了するのを待ちます。

## skip_binary_checksum_checks {#skip_binary_checksum_checks} 

<SettingsInfoBlock type="Bool" default_value="0" />ClickHouse バイナリのチェックサムによる整合性検証をスキップします

## ssh&#95;server {#ssh_server}

ホスト鍵の公開部分は、最初の接続時に SSH クライアント側の known&#95;hosts ファイルに書き込まれます。

ホスト鍵設定はデフォルトでは無効になっています。
ホスト鍵の設定行のコメントを外し、対応する SSH 鍵へのパスを指定して有効にします。

例:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />マテリアライズドビュー作成の遅延をシミュレートするためのデバッグ用パラメーター

## storage&#95;configuration {#storage_configuration}

ストレージのマルチディスク構成をサポートします。

ストレージ構成は次の構造に従います。

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

`disks` の設定は、以下の構成に従います。

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

上記のサブタグは、`disks` に対して次の設定を定義します：

| Setting                 | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `<disk_name_N>`         | 一意である必要があるディスク名。                                           |
| `path`                  | サーバーデータ（`data` および `shadow` カタログ）が保存されるパス。`/` で終わる必要があります。 |
| `keep_free_space_bytes` | ディスク上に確保しておく空き容量のサイズ。                                      |

:::note
ディスクの並び順は問いません。
:::


### ポリシーの設定 {#configuration-of-policies}

上記のサブタグは `policies` に対して以下の設定を定義します:

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシー名。ポリシー名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `volume_name_N`              | ボリューム名。ボリューム名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `disk`                       | ボリューム内にあるディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `max_data_part_size_bytes`   | このボリューム内のいずれかのディスクに存在できるデータパーツの最大サイズ。マージの結果として得られるパーツサイズが `max_data_part_size_bytes` を超えると予想される場合、そのパーツは次のボリュームに書き込まれます。基本的にこの機能により、新規・小さなパーツをホット (SSD) ボリュームに保存し、それらが大きなサイズに達したときにコールド (HDD) ボリュームに移動できます。ポリシーにボリュームが 1 つしかない場合は、このオプションを使用しないでください。                                                                |
| `move_factor`                | ボリューム上で利用可能な空き容量の割合。空き容量がこの割合を下回ると、次のボリュームが存在する場合はデータの転送が開始されます。転送に際しては、パーツはサイズの大きいものから小さいものへ (降順) にソートされ、合計サイズが `move_factor` の条件を満たすパーツが選択されます。すべてのパーツの合計サイズが不十分な場合は、すべてのパーツが移動されます。                                                                                                             |
| `perform_ttl_move_on_insert` | 挿入時に TTL 期限切れデータの移動を無効にします。デフォルト (有効な場合) では、ライフタイムに基づく移動ルールによって既に期限切れとなっているデータを挿入すると、そのデータは直ちに移動ルールで指定されたボリューム / ディスクへ移動されます。ターゲットのボリューム / ディスクが遅い場合 (例: S3) には、これにより挿入が大幅に遅くなる可能性があります。無効にした場合、期限切れのデータ部分はまずデフォルトボリュームに書き込まれ、その後すぐに期限切れ TTL 用のルールで指定されたボリュームへ移動されます。 |
| `load_balancing`             | ディスクのバランシングポリシー。`round_robin` または `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `least_used_ttl_ms`          | すべてのディスク上の空き容量を更新するためのタイムアウト (ミリ秒) を設定します (`0` - 常に更新、`-1` - 一切更新しない、デフォルト値は `60000`)。ディスクが ClickHouse のみによって使用され、ファイルシステムのオンラインリサイズを受けない場合は、`-1` の値を使用できます。それ以外のすべてのケースでは、最終的に誤った容量割り当てにつながるため、この値の使用は推奨されません。                                                                                                                   |
| `prefer_not_to_merge`        | このボリューム上でのデータパーツのマージを無効にします。注意: これは潜在的に有害であり、パフォーマンス低下を引き起こす可能性があります。この設定を有効にすると (推奨しません)、このボリューム上でのデータマージが禁止されます (これは望ましくありません)。これにより、ClickHouse が遅いディスクとどのようにやり取りするかを制御できますが、基本的には使用しないことを推奨します。                                                                                                                                                                                       |
| `volume_priority`            | ボリュームがどの順序で埋められるかの優先度 (順序) を定義します。値が小さいほど優先度が高くなります。パラメータ値は自然数である必要があり、1 から N (N は指定されたパラメータ値の最大値) までの範囲をギャップなくカバーしなければなりません。                                                                                                                                                                                                                                                                |

`volume_priority` について:

- すべてのボリュームにこのパラメータが設定されている場合、指定された順序で優先度が決まります。
- 一部のボリュームにのみ設定されている場合、設定されていないボリュームは最も優先度が低くなります。設定されているボリュームはタグの値によって優先度が決まり、残りのボリュームの優先度は、設定ファイル内での相互の記述順序によって決定されます。
- どのボリュームにもこのパラメータが与えられていない場合、優先度は設定ファイル内での記述順序によって決まります。
- ボリュームの優先度は同一である必要はありません。

## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この上限を超えた接続は、有効期間が大幅に短くなります。この上限はストレージの接続に適用されます。

## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この上限を超えた接続は、使用後にリセットされます。接続キャッシュを無効化するには 0 に設定します。この上限はストレージの接続に適用されます。

## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />使用中の接続数がこの制限を超えた場合、警告メッセージがログに出力されます。この制限はストレージの接続に適用されます。

## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="1" />ディスクのメタデータファイルを `VERSION_FULL_OBJECT_KEY` 形式で書き込みます。これはデフォルトで有効です。この設定は非推奨です。

## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />有効にすると、SharedSet および SharedJoin の作成時に内部 UUID が生成されます。ClickHouse Cloud でのみ利用可能です。

## table_engines_require_grant {#table_engines_require_grant} 

true に設定すると、特定のエンジンを使用してテーブルを作成するには権限付与が必要になります（例: `GRANT TABLE ENGINE ON TinyLog to user`）。

:::note
デフォルトでは、後方互換性のため、特定のテーブルエンジンを指定してテーブルを作成しても権限チェックは行われませんが、これを true に設定することでこの動作を変更できます。
:::

## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

バックグラウンドプールで非同期ロード処理を実行するスレッド数を設定します。バックグラウンドプールは、そのテーブルを待っているクエリが存在しない場合に、サーバー起動後にテーブルを非同期でロードするために使用されます。テーブル数が多い場合は、バックグラウンドプール内のスレッド数を少なく抑えると効果的な場合があります。これにより、同時クエリ実行のための CPU リソースを確保できます。

:::note
値が `0` の場合、使用可能なすべての CPU が使用されます。
:::

## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

フォアグラウンドプールでロードジョブを実行するスレッド数を設定します。フォアグラウンドプールは、サーバーがポートでリッスンを開始する前にテーブルを同期的にロードする場合や、ロード完了を待機しているテーブルをロードする場合に使用されます。フォアグラウンドプールにはバックグラウンドプールより高い優先度が与えられます。つまり、フォアグラウンドプールでジョブが実行中の間は、バックグラウンドプールではジョブは開始されません。

:::note
`0` の値は、利用可能なすべての CPU が使用されることを意味します。
:::

## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 接続を閉じる前に、1 つの TCP 接続で実行を許可するクエリの最大数です。無制限のクエリを許可するには 0 に設定します。

## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 接続が閉じられるまでの最大存続期間（秒単位）。接続の存続期間を無制限にするには 0 を設定します。

## tcp&#95;port {#tcp_port}

TCP プロトコルを使用してクライアントと通信するためのポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```


## tcp&#95;port&#95;secure {#tcp_port_secure}

クライアントとの安全な通信に使用する TCP ポートです。[OpenSSL](#openssl) の設定と併せて使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## tcp&#95;ssh&#95;port {#tcp_ssh_port}

SSH サーバー用のポートです。このサーバーに接続すると、PTY 上で組み込みクライアントを使用して対話的にクエリを実行できます。

例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary&#95;data&#95;in&#95;cache {#temporary_data_in_cache}

このオプションを使用すると、特定のディスク用の一時データが、そのディスクのキャッシュに保存されます。
このセクションでは、タイプが `cache` のディスク名を指定する必要があります。
この場合、キャッシュと一時データは同じ領域を共有し、一時データを確保するためにディスクキャッシュが破棄されることがあります。

:::note
一時データの保存場所を設定するために使用できるオプションは、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか 1 つだけです。
:::

**例**

`local_disk` 向けキャッシュと一時データの両方が、ファイルシステム上の `/tiny_local_cache` に保存され、`tiny_local_cache` によって管理されます。

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

<SettingsInfoBlock type="Bool" default_value="0" />一時データを分散キャッシュに保存します。

## text_index_dictionary_block_cache_max_entries {#text_index_dictionary_block_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />テキストインデックス辞書ブロック用キャッシュのエントリ数。0 の場合は無効です。

## text_index_dictionary_block_cache_policy {#text_index_dictionary_block_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキストインデックス辞書ブロックキャッシュポリシーの名前。

## text_index_dictionary_block_cache_size {#text_index_dictionary_block_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />テキストインデックス辞書ブロック用キャッシュのサイズ。0 を指定すると無効になります。

:::note
この設定は実行時に変更でき、即座に反映されます。
:::

## text_index_dictionary_block_cache_size_ratio {#text_index_dictionary_block_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキストインデックス辞書ブロックキャッシュ内の保護キュー（SLRU ポリシーの場合）のサイズが、キャッシュ全体サイズに対して占める割合。

## text_index_header_cache_max_entries {#text_index_header_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="100000" />テキストインデックスヘッダー用キャッシュのサイズ（エントリ数単位）。0 を指定すると無効になります。

## text_index_header_cache_policy {#text_index_header_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキストインデックスヘッダーキャッシュポリシーの名前。

## text_index_header_cache_size {#text_index_header_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />テキストインデックスヘッダーのキャッシュサイズ。ゼロの場合は無効になります。

:::note
この設定は実行時に変更可能で、直ちに反映されます。
:::

## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキストインデックスヘッダーキャッシュにおいて、保護キュー（SLRU ポリシーの場合）のサイズがキャッシュ全体サイズに占める割合。

## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />テキストインデックスのポスティングリスト用キャッシュのサイズ（エントリ数）。0 の場合は無効になります。

## text_index_postings_cache_policy {#text_index_postings_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキストインデックスのポスティングリスト用キャッシュポリシーの名前。

## text_index_postings_cache_size {#text_index_postings_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="2147483648" />テキストインデックスのポスティングリスト用キャッシュのサイズ。ゼロの場合は無効になります。

:::note
この設定はサーバー稼働中でも変更でき、その場で即座に有効になります。
:::

## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキストインデックスのポスティングリストキャッシュにおいて、SLRU ポリシー使用時に保護キューのサイズがキャッシュ全体サイズに対して占める比率。

## text&#95;log {#text_log}

テキストメッセージをログに記録するための [text&#95;log](/operations/system-tables/text_log) システムテーブルに関する設定です。

<SystemLogParameters />

さらに次の設定項目があります。

| Setting | Description                             | Default Value |
| ------- | --------------------------------------- | ------------- |
| `level` | テーブルに保存される最大メッセージレベル（デフォルトは `Trace`）です。 | `Trace`       |

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


## thread&#95;pool&#95;queue&#95;size {#thread_pool_queue_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />

グローバルスレッドプールにスケジュールできるジョブ数の最大値です。キューサイズを大きくするとメモリ使用量が増加します。この値は [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size) と同じにすることを推奨します。

:::note
`0` は無制限を意味します。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />`local_filesystem_read_method = 'pread_threadpool'` の場合に、ローカルファイルシステムからの読み取りに使用されるスレッドプールのスレッド数。

## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />ローカルファイルシステムからの読み取りを行うスレッドプールでスケジューリングできるジョブの最大数。

## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />`remote_filesystem_read_method = 'threadpool'` の場合に、リモートファイルシステムからの読み取りに使用するスレッドプールのスレッド数。

## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />リモートファイルシステムからの読み取りを行うスレッドプールに投入できるジョブの最大数。

## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />オブジェクトストレージへの書き込みリクエストを処理するバックグラウンドプールのサイズ

## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />オブジェクトストレージへの書き込みリクエスト用バックグラウンドプールに投入可能なタスク数の上限

## throw&#95;on&#95;unknown&#95;workload {#throw_on_unknown_workload}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ設定 &#39;workload&#39; を使用して未知の WORKLOAD にアクセスした場合の動作を定義します。

* `true` の場合、未知の WORKLOAD にアクセスしようとしたクエリから RESOURCE&#95;ACCESS&#95;DENIED 例外がスローされます。WORKLOAD の階層が確立され、WORKLOAD default を含むようになった後、すべてのクエリに対してリソーススケジューリングを強制するのに役立ちます。
* `false`（デフォルト）の場合、&#39;workload&#39; 設定が未知の WORKLOAD を指していても、そのクエリにはリソーススケジューリングなしで無制限のアクセスが許可されます。これは、WORKLOAD の階層を構築している途中で、まだ WORKLOAD default が追加されていない段階では重要です。

**例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**関連項目**

* [ワークロードのスケジューリング](/operations/workload-scheduling.md)


## timezone {#timezone}

サーバーのタイムゾーンを指定します。

UTC タイムゾーンまたは地理的な場所を表す IANA タイムゾーン識別子で指定します（例: Africa/Abidjan）。

タイムゾーンは、DateTime 型のフィールドをテキスト形式で出力する際（画面表示やファイル出力）や、文字列から DateTime を取得する際に、String と DateTime の形式を相互に変換するために必要です。また、入力パラメータとしてタイムゾーンが指定されていない日時関連関数でも、この設定が使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連項目**

* [session&#95;timezone](../settings/settings.md#session_timezone)


## tmp&#95;path {#tmp_path}

大規模なクエリを処理するための一時データを保存する、ローカルファイルシステム上のパス。

:::note

* 一時データストレージの設定には、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか 1 つだけを使用できます。
* 末尾のスラッシュは必須です。
  :::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp&#95;policy {#tmp_policy}

一時データ用ストレージのポリシーです。`tmp` プレフィックスを持つすべてのファイルは起動時に削除されます。

:::note
`tmp_policy` としてオブジェクトストレージを使用する場合の推奨事項:

* 各サーバーで別々の `bucket:path` を使用する
* `metadata_type=plain` を使用する
* 必要に応じて、このバケットに TTL を設定することも検討する
  :::

:::note

* 一時データストレージの設定には、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか一つのみを使用できます。
* `move_factor`、`keep_free_space_bytes`、`max_data_part_size_bytes` は無視されます。
* ポリシーは *1 つのボリューム* のみを持つ必要があります

詳細については、[MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree) のドキュメントを参照してください。
:::

**例**

`/disk1` がいっぱいになった場合、一時データは `/disk2` に保存されます。

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


## top&#95;level&#95;domains&#95;list {#top_level_domains_list}

追加するカスタムトップレベルドメインを列挙するリストを定義します。各エントリは `<name>/path/to/file</name>` の形式です。

例:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

関連項目:

* 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) およびそのバリエーションで、カスタム TLD リスト名を引数に取り、最初の有意なサブドメインまでのトップレベルサブドメインを含むドメイン部分を返します。


## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />指定した値以下のサイズのメモリアロケーションを、`total_memory_profiler_sample_probability` と等しい確率でランダムに収集します。0 は無効を意味します。このしきい値が期待どおりに機能するよう、`max_untracked_memory` を 0 に設定することを検討してください。

## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />指定された値以上のサイズのメモリアロケーションを、`total_memory_profiler_sample_probability` と同じ確率でランダムにサンプリングして収集します。0 は無効を意味します。このしきい値が期待どおりに動作するようにするには、'max_untracked_memory' を 0 に設定することを検討してください。

## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーのメモリ使用量が、バイト数で指定されたステップ値を新たに超えるたびに、メモリプロファイラは割り当て元のスタックトレースを収集します。0 を指定するとメモリプロファイラは無効になります。数メガバイト未満の値を指定すると、サーバーが遅くなります。

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />

ランダムなメモリの確保および解放を収集し、指定した確率で `trace_type` が `MemorySample` であるレコードとして [system.trace_log](../../operations/system-tables/trace_log.md) システムテーブルに書き込みます。この確率は、アロケーションまたは解放 1 回ごとに適用され、アロケーションサイズには依存しません。サンプリングは、未追跡メモリ量が未追跡メモリの上限（デフォルト値は `4` MiB）を超えたときにのみ行われることに注意してください。[total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) を小さくすると、この上限を引き下げることができます。より細かい粒度のサンプリングを行うには、`total_memory_profiler_step` を `1` に設定できます。

設定可能な値:

- 正の倍精度浮動小数点数。
- `0` — ランダムなメモリの確保および解放を `system.trace_log` システムテーブルに書き込む処理を無効にします。

## trace&#95;log {#trace_log}

[trace&#95;log](/operations/system-tables/trace_log) システムテーブルの動作に関する設定です。

<SystemLogParameters />

デフォルトのサーバー設定ファイル `config.xml` には、次の設定セクションが含まれます。

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

<SettingsInfoBlock type="String" default_value="SLRU" />非圧縮キャッシュのポリシー名。

## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

MergeTree ファミリーのテーブルエンジンで使用される非圧縮データの最大サイズ（バイト単位）。

サーバー全体で共有されるキャッシュが 1 つあります。メモリはオンデマンドで割り当てられます。オプション `use_uncompressed_cache` が有効な場合にキャッシュが使用されます。

非圧縮キャッシュは、一部のケースでの非常に短いクエリに対して有効です。

:::note
値が `0` の場合は無効を意味します。

この設定は実行時に変更でき、直ちに有効になります。
:::

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />非圧縮キャッシュにおいて、キャッシュ全体のサイズに対する（SLRU ポリシー使用時の）保護キューのサイズの比率です。

## url&#95;scheme&#95;mappers {#url_scheme_mappers}

短縮されたまたはシンボリックな URL プレフィックスをフル URL にマッピングするための設定です。

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

ZooKeeper におけるデータパートヘッダの保存方式を指定します。この設定は [`MergeTree`](/engines/table-engines/mergetree-family) ファミリーにのみ適用されます。指定方法は次のとおりです。

**`config.xml` ファイルの [merge_tree](#merge_tree) セクションでグローバルに指定**

ClickHouse はサーバー上のすべてのテーブルに対してこの設定を使用します。設定はいつでも変更できます。設定が変更されると、既存のテーブルも挙動が変わります。

**テーブルごとに指定**

テーブルを作成するときに、対応する [engine setting](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) を指定します。この設定を持つ既存のテーブルの挙動は、グローバル設定が変更されても変わりません。

**取りうる値**

- `0` — 機能を無効にします。
- `1` — 機能を有効にします。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) の場合、[replicated](../../engines/table-engines/mergetree-family/replication.md) テーブルは、1 つの `znode` を使用してデータパートヘッダをコンパクトに保存します。テーブルに多数のカラムが含まれる場合、この保存方式によって ZooKeeper に保存されるデータ量を大幅に削減できます。

:::note
`use_minimalistic_part_header_in_zookeeper = 1` を適用した後、この設定をサポートしていないバージョンに ClickHouse サーバーをダウングレードすることはできません。クラスタ内のサーバーで ClickHouse をアップグレードする際は注意してください。すべてのサーバーを一度にアップグレードしないでください。ClickHouse の新しいバージョンは、テスト環境やクラスタ内の一部のサーバーで検証してから導入する方が安全です。

すでにこの設定で保存されたデータパートヘッダは、以前の（非コンパクトな）表現には戻せません。
:::

## user&#95;defined&#95;executable&#95;functions&#95;config {#user_defined_executable_functions_config}

実行可能なユーザー定義関数の設定ファイルへのパスです。

Path:

* 絶対パス、またはサーバーの設定ファイルからの相対パスを指定します。
* パスにはワイルドカードの * および ? を含めることができます。

See also:

* &quot;[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).&quot;.

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user&#95;defined&#95;path {#user_defined_path}

ユーザー定義ファイルを配置するディレクトリです。[SQL ユーザー定義関数](/sql-reference/functions/udf)で使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user&#95;directories {#user_directories}

次の設定を含む構成ファイル内のセクションです:

* 事前定義されたユーザーを含む構成ファイルへのパス。
* SQL コマンドで作成されたユーザーが保存されるディレクトリへのパス。
* SQL コマンドで作成され、レプリケートされるユーザーが保存される ZooKeeper ノードのパス。

このセクションが指定されている場合、[users&#95;config](/operations/server-configuration-parameters/settings#users_config) と [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) の設定は使用されません。

`user_directories` セクションには任意の数の項目を含めることができ、項目の順序は優先順位を表します（上にある項目ほど優先順位が高くなります）。

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

ユーザー、ロール、行ポリシー、クオータ、およびプロファイルは、ZooKeeper に格納することもできます。

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

`memory` セクション — 情報をディスクに書き込まずメモリ内のみに保存することを意味します。`ldap` セクション — 情報を LDAP サーバー上に保存することを意味します。

ローカルに定義されていないユーザー用のリモートユーザーディレクトリとして LDAP サーバーを追加するには、次の設定を持つ単一の `ldap` セクションを定義します。

| Setting  | Description                                                                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | `ldap_servers` 設定セクションで定義されている LDAP サーバー名のいずれか。このパラメーターは必須であり、空にすることはできません。                                                                                          |
| `roles`  | LDAP サーバーから取得された各ユーザーに割り当てられる、ローカルに定義されたロールの一覧を含むセクション。ロールが指定されていない場合、ユーザーは認証後も一切の操作を実行できません。列挙されたロールのいずれかが認証時点でローカルに定義されていない場合、その認証試行は、提供されたパスワードが誤っている場合と同様に失敗します。 |

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


## user&#95;files&#95;path {#user_files_path}

ユーザーファイルが格納されているディレクトリです。テーブル関数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user&#95;scripts&#95;path {#user_scripts_path}

ユーザースクリプトファイルを配置するディレクトリです。実行可能なユーザー定義関数で使用されます。詳しくは [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions) を参照してください。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

型:

デフォルト:


## users&#95;config {#users_config}

次の内容を含むファイルへのパスです:

* ユーザーの設定
* アクセス権限
* 設定プロファイル
* クォータの設定

**例**

```xml
<users_config>users.xml</users_config>
```


## validate&#95;tcp&#95;client&#95;information {#validate_tcp_client_information}

<SettingsInfoBlock type="Bool" default_value="0" />クエリパケット受信時にクライアント情報を検証するかどうかを制御します。

デフォルトでは `false` です：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />ベクター類似性インデックス用キャッシュのサイズ（エントリ数）。0 は無効を意味します。

## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ベクトル類似インデックスのキャッシュポリシー名。

## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />ベクトル類似性インデックス用キャッシュのサイズです。0 を指定すると無効になります。

:::note
この設定は実行時に変更でき、即座に反映されます。
:::

## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />ベクトル類似性インデックスキャッシュにおいて、SLRU ポリシー使用時の保護キューのサイズが、キャッシュ全体のサイズに対して占める割合。

## wait&#95;dictionaries&#95;load&#95;at&#95;startup {#wait_dictionaries_load_at_startup}

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は、`dictionaries_lazy_load` が `false` の場合の挙動を指定します。
（`dictionaries_lazy_load` が `true` の場合、この設定は影響しません。）

`wait_dictionaries_load_at_startup` が `false` の場合、サーバーは起動時に
すべてのディクショナリの読み込みを開始し、その読み込みと並行して接続を受け付けます。
クエリでディクショナリが初めて使用されるとき、そのディクショナリがまだ読み込まれていなければ、
クエリはディクショナリの読み込みが完了するまで待機します。
`wait_dictionaries_load_at_startup` を `false` に設定すると、ClickHouse の起動は速くなりますが、
一部のクエリは（一部のディクショナリの読み込み完了を待つ必要があるため）実行が遅くなる可能性があります。

`wait_dictionaries_load_at_startup` が `true` の場合、サーバーは起動時に
いずれかの接続を受け付ける前に、すべてのディクショナリの読み込みが（成功・失敗にかかわらず）完了するまで待機します。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload&#95;path {#workload_path}

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリの保存先として使用されるディレクトリです。デフォルトでは、サーバーの作業ディレクトリ配下の `/workload/` フォルダが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**関連項目**

* [ワークロード階層](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)


## workload&#95;zookeeper&#95;path {#workload_zookeeper_path}

ZooKeeper ノードへのパスです。`CREATE WORKLOAD` および `CREATE RESOURCE` クエリのすべての定義を保存するために使用されます。整合性を保つため、すべての SQL 定義はこの単一の znode の値として保存されます。デフォルトでは ZooKeeper は使用されず、定義は [ディスク](#workload_path) 上に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**関連項目**

* [ワークロード階層](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)


## zookeeper {#zookeeper}

ClickHouse が [ZooKeeper](http://zookeeper.apache.org/) クラスターと連携するための設定を含みます。ClickHouse は、レプリケーテッドテーブルを使用する際に、レプリカのメタデータを保存するために ZooKeeper を使用します。レプリケーテッドテーブルを使用しない場合、このセクションのパラメータは省略できます。

以下の設定はサブタグで指定できます:

| Setting                                    | Description                                                                                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeper のエンドポイント。複数のエンドポイントを設定できます。例: `<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性は ZooKeeper クラスターへの接続を試みる際のノードの順序を指定します。 |
| `session_timeout_ms`                       | クライアントセッションの最大タイムアウト（ミリ秒）。                                                                                                                                     |
| `operation_timeout_ms`                     | 1 つの操作の最大タイムアウト（ミリ秒）。                                                                                                                                          |
| `root` (optional)                          | ClickHouse サーバーが使用する znode 群のルートとして使用される znode。                                                                                                                |
| `fallback_session_lifetime.min` (optional) | プライマリが利用不可のとき（ロードバランシング）、フォールバックノードに対する ZooKeeper セッションの有効期間の最小値。秒単位で設定。デフォルト: 3 時間。                                                                           |
| `fallback_session_lifetime.max` (optional) | プライマリが利用不可のとき（ロードバランシング）、フォールバックノードに対する ZooKeeper セッションの有効期間の最大値。秒単位で設定。デフォルト: 6 時間。                                                                           |
| `identity` (optional)                      | 要求された znode にアクセスするために ZooKeeper が必要とするユーザーとパスワード。                                                                                                             |
| `use_compression` (optional)               | `true` に設定すると Keeper プロトコルで圧縮を有効化します。                                                                                                                          |

さらに、ZooKeeper ノードの選択アルゴリズムを指定できる `zookeeper_load_balancing` 設定（オプション）があります:

| Algorithm Name                  | Description                                                              |
| ------------------------------- | ------------------------------------------------------------------------ |
| `random`                        | ZooKeeper ノードのうち 1 つをランダムに選択します。                                         |
| `in_order`                      | 最初の ZooKeeper ノードを選択し、それが利用できない場合は 2 番目、それ以降と順に選択します。                    |
| `nearest_hostname`              | サーバーのホスト名に最も類似したホスト名を持つ ZooKeeper ノードを選択します。ホスト名は名前のプレフィックスで比較されます。      |
| `hostname_levenshtein_distance` | `nearest_hostname` と同様ですが、ホスト名をレーベンシュタイン距離で比較します。                        |
| `first_or_random`               | 最初の ZooKeeper ノードを選択し、それが利用できない場合は残りの ZooKeeper ノードのうちからランダムに 1 つを選択します。 |
| `round_robin`                   | 最初の ZooKeeper ノードを選択し、再接続が発生した場合は次のノードを選択します。                            |

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
    <!-- オプション。Chroot サフィックス。存在する必要があります。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- オプション。ZooKeeper ダイジェスト ACL 文字列。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**関連項目**

* [レプリケーション](../../engines/table-engines/mergetree-family/replication.md)
* [ZooKeeper プログラマーズガイド](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [ClickHouse と ZooKeeper 間のセキュア通信（オプション）](/operations/ssl-zookeeper)


## zookeeper&#95;log {#zookeeper_log}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) システムテーブルに関する設定です。

以下の設定はサブタグごとに構成できます。

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
