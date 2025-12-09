---
description: 'このセクションでは、サーバー設定、すなわちセッションレベルやクエリレベルでは変更できない設定について説明します。'
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

このセクションでは、サーバー設定について説明します。これらは、セッションレベルやクエリレベルでは変更できない設定です。

ClickHouse の設定ファイルの詳細については、[「Configuration Files」](/operations/configuration-files) を参照してください。

その他の設定については「[Settings](/operations/settings/overview)」セクションで説明しています。
設定を理解する前に、[Configuration files](/operations/configuration-files)
セクションを読み、置換（`incl` および `optional` 属性）の使い方に留意してください。

## abort_on_logical_error {#abort_on_logical_error} 

<SettingsInfoBlock type="Bool" default_value="0" />LOGICAL_ERROR 例外発生時にサーバーを異常終了させます。専門家向けの設定です。

## access&#95;control&#95;improvements {#access_control_improvements}

アクセス制御システムにおけるオプションの改善に関する設定。

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                                                  | Default |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | 許可する ROW POLICY を持たないユーザーが、`SELECT` クエリを使用して行を読み取れるかどうかを設定します。たとえば、ユーザー A と B がいて、ROW POLICY が A に対してのみ定義されている場合、この設定が true であれば、ユーザー B はすべての行を参照できます。この設定が false の場合、ユーザー B は行を一切参照できません。                                                                                                                                                                                                   | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` クエリに `CLUSTER` 権限が必須かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                 | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.&lt;table&gt;` に何らかの権限が必要かどうか（false の場合は権限なしで任意のユーザーが実行可能かどうか）を設定します。true に設定した場合、このクエリには、非 system テーブルと同様に `GRANT SELECT ON system.&lt;table&gt;` が必要になります。例外: 一部の system テーブル（`tables`、`columns`、`databases` および `one`、`contributors` のような定数テーブル）は依然としてすべてのユーザーがアクセス可能です。また、もし `SHOW` 権限（例: `SHOW USERS`）が付与されている場合は、対応する system テーブル（すなわち `system.users`）にアクセスできます。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.&lt;table&gt;` に何らかの権限が必要かどうか（false の場合は権限なしで任意のユーザーが実行可能かどうか）を設定します。true に設定した場合、このクエリには通常のテーブルと同様に `GRANT SELECT ON information_schema.&lt;table&gt;` が必要になります。                                                                                                                                                                                          | `true`  |
| `settings_constraints_replace_previous`         | ある SETTINGS PROFILE 内で特定の設定に対して定義された CONSTRAINT が、その設定に対して以前に定義された CONSTRAINT（他のプロファイルで定義されたもの）による動作を、新しい CONSTRAINT で値が設定されていないフィールドも含めて打ち消すかどうかを設定します。また、`changeable_in_readonly` CONSTRAINT タイプを有効にします。                                                                                                                                                                                   | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンを使用してテーブルを作成する際に、権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                 | `false` |
| `role_cache_expiration_time_seconds`            | 最終アクセスから、ロールが Role Cache に保持される秒数を設定します。                                                                                                                                                                                                                                                                                                                                                     | `600`   |

Example:

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

ClickHouse サーバーが、SQL コマンドで作成されたユーザーおよびロールの設定を保存するフォルダーへのパスです。

**関連項目**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />groupArray で配列要素の最大サイズを超えた場合に実行するアクション：`throw` で例外を送出するか、`discard` で余分な値を破棄する

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray 関数における配列要素の最大サイズ（バイト単位）。この制限はシリアル化時にチェックされ、状態サイズが過度に大きくなるのを防ぐのに役立ちます。

## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />

ユーザーが異なる機能ティアに関連する設定を変更できるかどうかを制御します。

- `0` - すべての設定（experimental、beta、production）の変更が許可されます。
- `1` - beta および production 機能に関する設定のみ変更が許可されます。experimental に関する設定の変更は拒否されます。
- `2` - production 機能に関する設定のみ変更が許可されます。experimental または beta に関する設定の変更は拒否されます。

これは、すべての `EXPERIMENTAL` / `BETA` 機能に対して読み取り専用の CONSTRAINT を設定することと同等です。

:::note
値が `0` の場合、すべての設定を変更できます。
:::

## allow_impersonate_user {#allow_impersonate_user} 

<SettingsInfoBlock type="Bool" default_value="0" />IMPERSONATE 機能（EXECUTE AS target_user）を有効または無効にします。

## allow&#95;implicit&#95;no&#95;password {#allow_implicit_no_password}

&#39;IDENTIFIED WITH no&#95;password&#39; が明示的に指定されていない限り、パスワードなしでユーザーを作成することを禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## allow&#95;no&#95;password {#allow_no_password}

安全ではないパスワード方式である `no_password` を許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```

## allow&#95;plaintext&#95;password {#allow_plaintext_password}

平文パスワード型（安全ではない）の使用を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc メモリの使用を許可します。

## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

Iceberg での使用が許可されているディスクの一覧

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />true の場合、グレースフルシャットダウン時に非同期 insert キューがフラッシュされます

## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドでデータをパースして挿入するスレッドの最大数。0 を指定すると非同期モードは無効になります

## async&#95;load&#95;databases {#async_load_databases}

<SettingsInfoBlock type="Bool" default_value="1" />

データベースおよびテーブルを非同期でロードします。

* `true` の場合、`Ordinary`、`Atomic`、`Replicated` エンジンを持つすべての非システムデータベースは、ClickHouse サーバーの起動後に非同期でロードされます。`system.asynchronous_loader` テーブル、およびサーバー設定 `tables_loader_background_pool_size` と `tables_loader_foreground_pool_size` を参照してください。まだロードされていないテーブルにアクセスしようとするクエリは、そのテーブルが利用可能になるまで待機します。ロード処理が失敗した場合、クエリは（`async_load_databases = false` の場合のようにサーバー全体をシャットダウンする代わりに）エラーを再スローします。少なくとも 1 つのクエリによって待機されているテーブルは、より高い優先度でロードされます。データベースに対する DDL クエリは、そのデータベースが利用可能になるまで待機します。また、待機中のクエリの総数に対する上限として `max_waiting_queries` を設定することも検討してください。
* `false` の場合、すべてのデータベースはサーバー起動時にロードされます。

**例**

```xml
<async_load_databases>true</async_load_databases>
```

## async&#95;load&#95;system&#95;database {#async_load_system_database}

<SettingsInfoBlock type="Bool" default_value="0" />

system テーブルを非同期で読み込みます。`system` データベース内に大量のログテーブルやパーツがある場合に有用です。`async_load_databases` 設定とは独立しています。

* `true` に設定すると、ClickHouse サーバーの起動後に、`Ordinary`、`Atomic`、`Replicated` エンジンを持つすべての system データベースが非同期で読み込まれます。`system.asynchronous_loader` テーブル、および `tables_loader_background_pool_size` と `tables_loader_foreground_pool_size` のサーバー設定を参照してください。まだ読み込まれていない system テーブルへアクセスしようとするクエリは、そのテーブルの起動が完了するまで待機します。少なくとも 1 つのクエリによって待機されているテーブルは、より高い優先度で読み込まれます。また、待機中のクエリの総数を制限するために `max_waiting_queries` 設定の利用も検討してください。
* `false` に設定すると、system データベースはサーバーの起動前に読み込まれます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
```

## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />重い非同期メトリクスの更新間隔（秒）。

## asynchronous&#95;insert&#95;log {#asynchronous_insert_log}

非同期インサートをログに記録するための [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) システムテーブルの設定。

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

ClickHouse Cloud のデプロイメントでは、デフォルトで有効になっています。

お使いの環境でこの設定がデフォルトで有効になっていない場合は、ClickHouse のインストール方法に応じて、以下の手順に従って設定を有効または無効にできます。

**有効化**

非同期メトリクスログの履歴収集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します。

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

`asynchronous_metric_log` SETTING を無効化するには、次の内容で `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` ファイルを作成する必要があります。

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />

## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />重い非同期メトリクスの計算を有効にします。

## asynchronous_metrics_keeper_metrics_only {#asynchronous_metrics_keeper_metrics_only} 

<SettingsInfoBlock type="Bool" default_value="0" />非同期メトリクスで keeper 関連のメトリクスのみを計算します。

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />非同期メトリクスを更新する間隔（秒単位）。

## auth_use_forwarded_address {#auth_use_forwarded_address} 

プロキシ経由で接続しているクライアントに対して、認証に元の送信元アドレスを使用します。

:::note
転送されたアドレスは容易に偽装されうるため、この設定を使用する際は特に注意が必要です。このような認証を受け入れるサーバーには直接アクセスせず、必ず信頼できるプロキシ経由でのみアクセスするようにしてください。
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [Buffer エンジンテーブル](/engines/table-engines/special/buffer) のフラッシュ処理を行うために使用されるスレッド数の上限。

## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルに対して、主にガーベジコレクションを含むさまざまな処理を実行するために使用されるスレッド数の最大値です。

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />分散送信の実行に使用されるスレッド数の上限。

## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルの他のレプリカからデータパーツを取得するために使用されるスレッドの最大数。

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />

スレッド数に対する、同時に実行可能なバックグラウンドのマージおよびミューテーション数の比率を設定します。

たとえば、この比率が 2 で [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) が 16 に設定されている場合、ClickHouse は 32 個のバックグラウンドマージを同時に実行できます。これは、バックグラウンド処理を一時停止したり、後回しにしたりできるためです。小さなマージにより高い実行優先度を与えるために必要となります。

:::note
この比率は実行時に増やすことのみが可能です。小さくするにはサーバーを再起動する必要があります。

[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) SETTING と同様に、[`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) も後方互換性のために `default` プロファイルから適用できます。
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />

背景マージおよびミューテーションのスケジューリング方法を決定するポリシーです。指定可能な値は `round_robin` と `shortest_task_first` です。

バックグラウンドスレッドプールで次に実行するマージまたはミューテーションを選択する際に使用されるアルゴリズムです。ポリシーはサーバーを再起動せずに、実行時に変更できます。
後方互換性のために、`default` プロファイルからも適用できます。

指定可能な値:

- `round_robin` — すべての同時実行中のマージおよびミューテーションをラウンドロビン順に実行し、スタベーション（飢餓状態）を防ぎます。小さいマージはマージ対象のブロック数が少ないため、大きなマージよりも速く完了します。
- `shortest_task_first` — 常により小さいマージまたはミューテーションを実行します。マージおよびミューテーションには、結果のサイズに基づいて優先度が割り当てられます。サイズの小さいマージは大きいマージよりも厳密に優先されます。このポリシーは小さいパーツをできるだけ速くマージすることを保証しますが、`INSERT` が非常に多いパーティションでは、大きなマージが無期限にスタベーションに陥る可能性があります。

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />メッセージストリーミングのバックグラウンド処理に使用されるスレッドの最大数。

## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドで *MergeTree-engine テーブルのデータパーツを別のディスクまたはボリュームへ移動する際に使用される最大スレッド数。

## background&#95;pool&#95;size {#background_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />

MergeTree エンジンを使用するテーブルで、バックグラウンドのマージおよびミューテーションを実行するスレッド数を設定します。

:::note

* この設定は、後方互換性のため、ClickHouse サーバーの起動時に `default` プロファイルの設定からも適用できます。
* 実行中にスレッド数を増やすことだけが可能です。
* スレッド数を減らすにはサーバーを再起動する必要があります。
* この設定を調整することで、CPU とディスクの負荷を管理できます。
  :::

:::danger
プールサイズを小さくすると CPU とディスクリソースの消費は減りますが、バックグラウンド処理の進行が遅くなり、最終的にクエリ性能に影響する可能性があります。
:::

この値を変更する前に、次のような関連する MergeTree 設定も確認してください。

* [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge)
* [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation)
* [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**例**

```xml
<background_pool_size>16</background_pool_size>
```

## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio} 

<SettingsInfoBlock type="Float" default_value="0.8" />同じ種類のタスクを同時に実行できるスレッド数が、プール内の全スレッド数に対して占める最大比率。

## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />レプリケートテーブル、Kafka ストリーミング、および DNS キャッシュ更新のための軽量な定期処理を継続的に実行する際に使用されるスレッドの最大数。

## backup&#95;log {#backup_log}

`BACKUP` および `RESTORE` 操作を記録するための [backup&#95;log](../../operations/system-tables/backup_log.md) システムテーブルの設定。

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

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />`BACKUP` リクエストの実行に使用されるスレッドの最大数。

## backups {#backups}

[`BACKUP` および `RESTORE`](/operations/backup/overview) 文を実行する際に使用される、バックアップに関する設定です。

以下の設定はサブタグで構成できます。

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','同一ホスト上で複数のバックアップ処理を同時に実行できるかどうかを制御します。', 'true'),
    ('allow_concurrent_restores', 'Bool', '同一ホスト上で複数のリストア処理を同時に実行できるかどうかを制御します。', 'true'),
    ('allowed_disk', 'String', '`File()` を使用する場合のバックアップ先ディスク。この設定を指定しないと `File` は使用できません。', ''),
    ('allowed_path', 'String', '`File()` を使用する場合のバックアップ先パス。この設定を指定しないと `File` は使用できません。', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '収集したメタデータを比較した結果に不整合があった場合、スリープに入る前にメタデータ収集を行う試行回数。', '2'),
    ('collect_metadata_timeout', 'UInt64', 'バックアップ中のメタデータ収集に対するタイムアウト（ミリ秒）。', '600000'),
    ('compare_collected_metadata', 'Bool', 'true の場合、収集したメタデータを既存のメタデータと比較し、バックアップ中に変更されていないことを確認します。', 'true'),
    ('create_table_timeout', 'UInt64', 'リストア中にテーブルを作成する際のタイムアウト（ミリ秒）。', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '協調バックアップ／リストア中に不正なバージョンのエラーが発生した後で、再試行を行う最大回数。', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'メタデータ収集を次に試行するまでの最大スリープ時間（ミリ秒）。', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'メタデータ収集を次に試行するまでの最小スリープ時間（ミリ秒）。', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '`BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップにコピー済みのファイルを削除しようとします。そうでない場合は、コピー済みファイルはそのまま残されます。', 'true'),
    ('sync_period_ms', 'UInt64', '協調バックアップ／リストアにおける同期周期（ミリ秒）。', '5000'),
    ('test_inject_sleep', 'Bool', 'テスト関連のスリープ。', 'false'),
    ('test_randomize_order', 'Bool', 'true の場合、テスト目的で一部の処理の実行順序をランダム化します。', 'false'),
    ('zookeeper_path', 'String', '`ON CLUSTER` 句を使用する場合に、バックアップおよびリストア用メタデータが保存される ZooKeeper 上のパス。', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Setting                                             | Type   | Description                                                                                      | Default               |
| :-------------------------------------------------- | :----- | :----------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 同一ホストで複数のバックアップ処理を同時に実行できるかどうかを制御します。                                                            | `true`                |
| `allow_concurrent_restores`                         | Bool   | 同一ホストで複数のリストア処理を同時に実行できるかどうかを制御します。                                                              | `true`                |
| `allowed_disk`                                      | String | `File()` を使用する場合にバックアップを書き出すディスク。この設定を指定しないと `File` は使用できません。                                    | ``                    |
| `allowed_path`                                      | String | `File()` を使用する場合にバックアップを書き出すパス。この設定を指定しないと `File` は使用できません。                                      | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 収集したメタデータを比較した結果、不整合があった場合にスリープへ移行する前、メタデータ収集を試行する回数。                                            | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | バックアップ中にメタデータを収集する際のタイムアウト（ミリ秒）。                                                                 | `600000`              |
| `compare_collected_metadata`                        | Bool   | true の場合、バックアップ中にメタデータが変更されていないことを確認するために、収集したメタデータを既存のメタデータと比較します。                              | `true`                |
| `create_table_timeout`                              | UInt64 | リストア時にテーブルを作成する際のタイムアウト（ミリ秒）。                                                                    | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | 協調バックアップ／リストア中にバージョン不整合エラーが発生した後に、リトライを行う最大試行回数。                                                 | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次のメタデータ収集を試行する前にスリープする最大時間（ミリ秒）。                                                                 | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次のメタデータ収集を試行する前にスリープする最小時間（ミリ秒）。                                                                 | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | `BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップ先へコピー済みのファイルを削除しようとします。false の場合、コピー済みファイルはそのまま残されます。 | `true`                |
| `sync_period_ms`                                    | UInt64 | 協調バックアップ／リストアの同期周期（ミリ秒）。                                                                         | `5000`                |
| `test_inject_sleep`                                 | Bool   | テスト用途でスリープを挿入するための設定。                                                                            | `false`               |
| `test_randomize_order`                              | Bool   | true の場合、テスト目的で特定の処理順序をランダム化します。                                                                 | `false`               |
| `zookeeper_path`                                    | String | `ON CLUSTER` 句を使用する場合に、バックアップおよびリストアのメタデータを保存する ZooKeeper 上のパス。                                  | `/clickhouse/backups` |

これらの設定のデフォルト値は次のとおりです。

```xml
<backups>
    ....
</backups>
```

## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Backups IO スレッドプールにスケジュールできるジョブの最大数です。現在の S3 バックアップのロジックのため、このキューは無制限のままにしておくことを推奨します。

:::note
`0`（デフォルト）の値は、無制限を意味します。
:::

## bcrypt&#95;workfactor {#bcrypt_workfactor}

`bcrypt_password` 認証タイプで使用される [Bcrypt アルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/) のワークファクターです。
ワークファクターによって、ハッシュの計算およびパスワードの検証に必要な計算量と時間が決まります。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
高頻度で認証を行うアプリケーションでは、
ワークファクターを高く設定した場合の bcrypt の計算コストを考慮し、
別の認証方式の利用を検討してください。
:::

## blob&#95;storage&#95;log {#blob_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) システムテーブルの設定。

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

組み込み辞書を再読み込みするまでの間隔（秒）。

ClickHouse は組み込み辞書を x 秒ごとに再読み込みします。これにより、サーバーを再起動することなく、稼働中に辞書を編集できます。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />キャッシュサイズのRAMに対する最大比率を設定します。メモリの少ないシステムでキャッシュサイズを小さく抑えることができます。

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />テスト目的で使用する設定です。

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />

サーバーで許可される最大メモリ使用量が、cgroups 内の対応するしきい値に基づいて調整される秒単位の間隔です。

cgroup オブザーバーを無効にするには、この値を `0` に設定します。

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />[コンパイル済み式](../../operations/caches.md)のキャッシュサイズ（要素数）を設定します。

## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />[compiled expressions](../../operations/caches.md) 用のキャッシュのサイズ（バイト単位）を設定します。

## 圧縮 {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンを使用するテーブルのデータ圧縮設定。

:::note
ClickHouse の利用を開始したばかりの場合は、この設定は変更しないことを推奨します。
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

**`<case>` フィールド**:

* `min_part_size` – データパートの最小サイズ。
* `min_part_size_ratio` – データパートサイズとテーブルサイズの比率。
* `method` – 圧縮方式。指定可能な値: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`。
* `level` – 圧縮レベル。[Codecs](/sql-reference/statements/create/table#general-purpose-codecs) を参照してください。

:::note
複数の `<case>` セクションを設定できます。
:::

**条件を満たしたときの動作**:

* データパートが条件セットに一致した場合、ClickHouse は指定された圧縮方式を使用します。
* データパートが複数の条件セットに一致した場合、ClickHouse は最初に一致した条件セットを使用します。

:::note
データパートがいずれの条件セットにも一致しない場合、ClickHouse は `lz4` 圧縮を使用します。
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

`concurrent_threads_soft_limit_num` および `concurrent_threads_soft_limit_ratio_to_cores` で指定される CPU スロットのスケジューリング方法を決定するポリシーです。制限された数の CPU スロットを同時実行クエリ間でどのように分配するかを制御するアルゴリズムです。スケジューラはサーバーの再起動なしに実行時に変更できます。

指定可能な値:

- `round_robin` — `use_concurrency_control` = 1 に設定されているすべてのクエリは、最大で `max_threads` 個の CPU スロットを確保します。スレッドにつき 1 スロットです。競合が発生した場合、CPU スロットはクエリに対してラウンドロビン方式で付与されます。最初のスロットは無条件に付与される点に注意してください。これにより、多数の `max_threads` = 1 のクエリが存在する状況では、`max_threads` が大きいクエリの不公平さやレイテンシ増大を招く可能性があります。
- `fair_round_robin` — `use_concurrency_control` = 1 に設定されているすべてのクエリは、最大で `max_threads - 1` 個の CPU スロットを確保します。各クエリの最初のスレッドに CPU スロットを要求しない、`round_robin` のバリエーションです。これにより、`max_threads` = 1 のクエリはスロットを一切必要とせず、スロットを不公平に占有することがなくなります。無条件に付与されるスロットは存在しません。

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />

リモートサーバーからのデータ取得用スレッドを除き、すべてのクエリの処理に使用できるクエリ処理スレッドの最大数です。これはハードリミットではありません。上限に達した場合でも、クエリには少なくとも 1 つのスレッドが割り当てられて実行されます。より多くのスレッドが利用可能になれば、実行中のクエリは必要なスレッド数までスケールアップできます。

:::note
`0`（デフォルト）の値は無制限を意味します。
:::

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) と同様ですが、コア数に対する比率として指定します。

## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />

ClickHouse が設定を再読み込みし、変更の有無を確認する間隔

## core&#95;dump {#core_dump}

コアダンプファイルのサイズに対するソフトリミットを設定します。

:::note
ハードリミットはシステムツールで設定します
:::

**例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

## cpu&#95;slot&#95;preemption {#cpu_slot_preemption}

<SettingsInfoBlock type="Bool" default_value="0" />

CPU リソース（MASTER THREAD と WORKER THREAD）に対するワークロードのスケジューリング方法を定義します。

* `true`（推奨）の場合、実際に消費された CPU 時間に基づいて計測を行います。競合するワークロードには、CPU 時間が公平に割り当てられます。スロットは一定時間だけ割り当てられ、有効期限後に再度リクエストされます。CPU リソースが過負荷の場合、スロットのリクエストがスレッド実行をブロックする可能性があり、その結果プリエンプションが発生する場合があります。これにより、CPU 時間の公平性が保証されます。
* `false`（デフォルト）の場合、計測は割り当てられた CPU スロット数に基づいて行われます。競合するワークロードには、CPU スロットが公平に割り当てられます。スロットはスレッド開始時に割り当てられ、終了するまで継続的に保持され、スレッドの実行が終了すると解放されます。クエリ実行に割り当てられるスレッド数は 1 から `max_threads` まで増加するだけで、減少することはありません。これは長時間実行されるクエリに有利ですが、短いクエリが CPU 飢餓状態に陥る可能性があります。

**Example**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**関連項目**

* [ワークロードのスケジューリング](/operations/workload-scheduling.md)

## cpu&#95;slot&#95;preemption&#95;timeout&#95;ms {#cpu_slot_preemption_timeout_ms}

<SettingsInfoBlock type="UInt64" default_value="1000" />

この設定は、プリエンプション中、つまり別の CPU スロットが付与されるのを待っている間に、ワーカースレッドが待機できる最大ミリ秒数を定義します。このタイムアウト後もスレッドが新しい CPU スロットを取得できなかった場合、そのスレッドは終了し、クエリは同時実行スレッド数がより少ない構成へと動的にスケールダウンされます。なお、マスタースレッド自体がスケールダウンされることはありませんが、無期限にプリエンプトされる可能性があります。この設定は、`cpu_slot_preemption` が有効であり、かつ WORKER THREAD に対して CPU リソースが定義されている場合にのみ意味を持ちます。

**例**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**関連項目**

* [Workload Scheduling](/operations/workload-scheduling.md)

## cpu&#95;slot&#95;quantum&#95;ns {#cpu_slot_quantum_ns}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

スレッドが CPU スロットを取得した後、別の CPU スロットを再度要求するまでに消費できる CPU ナノ秒数を定義します。`cpu_slot_preemption` が有効であり、MASTER THREAD または WORKER THREAD に対して CPU リソースが定義されている場合にのみ意味を持ちます。

**例**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**関連項目**

* [ワークロードスケジューリング](/operations/workload-scheduling.md)

## crash&#95;log {#crash_log}

[crash&#95;log](../../operations/system-tables/crash_log.md) システムテーブルの動作に関する設定。

次の設定はサブタグで指定できます。

| Setting                            | Description                                                                                                                          | Default             | Note                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------- |
| `database`                         | データベース名。                                                                                                                             |                     |                                                                                     |
| `table`                            | システムテーブル名。                                                                                                                           |                     |                                                                                     |
| `engine`                           | システムテーブル用の [MergeTree Engine Definition](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。 |                     | `partition_by` または `order_by` が定義されている場合は使用できません。指定しない場合、デフォルトで `MergeTree` が選択されます |
| `partition_by`                     | システムテーブル用の [Custom partitioning key](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                            |                     | システムテーブルに `engine` を指定する場合、`partition_by` パラメータは直接 &#39;engine&#39; 内で指定する必要があります   |
| `ttl`                              | テーブルの [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) を指定します。                                    |                     | システムテーブルに `engine` を指定する場合、`ttl` パラメータは直接 &#39;engine&#39; 内で指定する必要があります            |
| `order_by`                         | システムテーブル用の [Custom sorting key](/engines/table-engines/mergetree-family/mergetree#order_by)。`engine` が定義されている場合は使用できません。             |                     | システムテーブルに `engine` を指定する場合、`order_by` パラメータは直接 &#39;engine&#39; 内で指定する必要があります       |
| `storage_policy`                   | テーブルに使用するストレージポリシー名（任意）。                                                                                                             |                     | システムテーブルに `engine` を指定する場合、`storage_policy` パラメータは直接 &#39;engine&#39; 内で指定する必要があります |
| `settings`                         | MergeTree の動作を制御する [Additional parameters](/engines/table-engines/mergetree-family/mergetree/#settings)（任意）。                         |                     | システムテーブルに `engine` を指定する場合、`settings` パラメータは直接 &#39;engine&#39; 内で指定する必要があります       |
| `flush_interval_milliseconds`      | メモリ上のバッファからテーブルへデータをフラッシュする間隔。                                                                                                       | `7500`              |                                                                                     |
| `max_size_rows`                    | ログの最大サイズ（行数）。フラッシュされていないログの量が max&#95;size に達すると、ログはディスクに書き出されます。                                                                    | `1024`              |                                                                                     |
| `reserved_size_rows`               | ログ用にあらかじめ確保されるメモリサイズ（行数）。                                                                                                            | `1024`              |                                                                                     |
| `buffer_size_rows_flush_threshold` | 行数のしきい値。このしきい値に達すると、バックグラウンドでディスクへのログフラッシュが開始されます。                                                                                   | `max_size_rows / 2` |                                                                                     |
| `flush_on_crash`                   | クラッシュ時にログをディスクへ書き出すかどうかを設定します。                                                                                                       | `false`             |                                                                                     |

デフォルトのサーバー設定ファイル `config.xml` には、次の設定セクションが含まれています。

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
`custom_cached_disks_base_directory` はカスタムディスクに対して `filesystem_caches_path`（`filesystem_caches_path.xml` 内に記載）よりも優先され、
前者が設定されていない場合には後者が使用されます。
ファイルシステムキャッシュのパスは、このディレクトリ配下でなければなりません。
そうでない場合、ディスクの作成を防ぐために例外がスローされます。

:::note
これは、サーバーをアップグレードする前の古いバージョンで作成されたディスクには影響しません。
この場合、サーバーが正常に起動できるように、例外はスローされません。
:::

例:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```

## custom&#95;settings&#95;prefixes {#custom_settings_prefixes}

[カスタム設定](/operations/settings/query-level#custom_settings) 用の接頭辞の一覧です。複数指定する場合は、カンマ区切りで指定します。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**関連項目**

* [カスタム設定](/operations/settings/query-level#custom_settings)

## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" />

削除されたテーブルを [`UNDROP`](/sql-reference/statements/undrop.md) 文を使用して復元できる時間です。`DROP TABLE` が `SYNC` 修飾子付きで実行された場合、この設定は無視されます。
この設定のデフォルト値は `480`（8 分）です。

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />テーブルの削除に失敗した場合、ClickHouse はこのタイムアウト時間が経過するまで待ってから操作を再試行します。

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />テーブルを削除するために使用されるスレッドプールのサイズ。

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />

`store/` ディレクトリから不要なデータをクリーンアップするタスクのパラメーターです。
タスクの実行間隔（スケジューリング周期）を設定します。

:::note
値 `0` は「実行しない」を意味します。デフォルト値は 1 日に相当します。
:::

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

`store/` ディレクトリから不要なディレクトリをクリーンアップするタスクのパラメータです。
あるサブディレクトリが clickhouse-server によって使用されておらず、かつ直近
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒の間に更新されていない場合、このタスクは
そのディレクトリのすべてのアクセス権を削除することでディレクトリを「非表示」にします。これは、clickhouse-server が
`store/` 内に存在することを想定していないディレクトリに対しても動作します。

:::note
`0` の値は「即時」を意味します。
:::

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />

`store/` ディレクトリ内の不要なディレクトリをクリーンアップするタスクのパラメータです。
あるサブディレクトリが clickhouse-server によって使用されておらず、以前に「非表示」にされていて
（[database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) を参照）、
かつ、そのディレクトリが直近
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒の間に更新されていない場合、このタスクはそのディレクトリを削除します。
また、clickhouse-server が `store/` 内に存在することを想定していないディレクトリにも適用されます。

:::note
値が `0` の場合は「削除しない（無期限）」を意味します。デフォルト値は 30 日に相当します。
:::

## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />Replicated データベースでテーブルを永続的にデタッチできるようにする

## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />予期しないテーブルを、別のローカルデータベースに移動するのではなく Replicated データベースから削除します

## dead&#95;letter&#95;queue {#dead_letter_queue}

「dead&#95;letter&#95;queue」システムテーブルの設定です。

<SystemLogParameters />

デフォルトの設定は次のとおりです。

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```

## default_database {#default_database} 

<SettingsInfoBlock type="String" default_value="default" />既定のデータベース名です。

## default&#95;password&#95;type {#default_password_type}

`CREATE USER u IDENTIFIED BY 'p'` のようなクエリで自動的に設定されるパスワードの種類を指定します。

指定可能な値は次のとおりです:

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```

## default&#95;profile {#default_profile}

デフォルトのSETTINGS PROFILE。SETTINGS PROFILEは、`user_config` SETTINGで指定されたファイルに定義されています。

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

ZooKeeper内のテーブルへのパス。

**例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```

## default&#95;session&#95;timeout {#default_session_timeout}

セッションのデフォルトタイムアウト時間（秒）。

```xml
<default_session_timeout>60</default_session_timeout>
```

## dictionaries&#95;config {#dictionaries_config}

dictionaries の設定ファイルへのパスです。

パス:

* 絶対パス、またはサーバー設定ファイルからの相対パスを指定します。
* パスにはワイルドカードの * および ? を含めることができます。

関連項目:

* 「[Dictionaries](../../sql-reference/dictionaries/index.md)」。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```

## dictionaries&#95;lazy&#95;load {#dictionaries_lazy_load}

<SettingsInfoBlock type="Bool" default_value="1" />

Dictionary の遅延読み込みを行います。

* `true` の場合、各 Dictionary は最初に使用されたときに読み込まれます。読み込みに失敗した場合、その Dictionary を使用していた関数は例外をスローします。
* `false` の場合、サーバーは起動時にすべての Dictionary を読み込みます。

:::note
サーバーは、すべての Dictionary の読み込みが完了するまで起動時に待機し、その後にのみ接続を受け付けます
（ただし、[`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) が `false` に設定されている場合を除きます）。
:::

**例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```

## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />`background_reconnect` が有効になっている MySQL および Postgres の Dictionary について、接続に失敗した場合に再接続を試行する間隔（ミリ秒単位）。

## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />

INSERT/ALTER/DELETE クエリを無効にします。読み取り専用ノードが必要な場合に、この設定を有効にすると、挿入やミューテーションが読み取りパフォーマンスに影響を与えるのを防げます。S3、DataLake、MySQL、PostrgeSQL、Kafka などの外部エンジンへの INSERT は、この設定にかかわらず許可されます。

## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />内部 DNS キャッシュを無効にします。Kubernetes のようにインフラストラクチャが頻繁に変化するシステムで ClickHouse を運用する場合に、この設定を推奨します。

## disable&#95;tunneling&#95;for&#95;https&#95;requests&#95;over&#95;http&#95;proxy {#disable_tunneling_for_https_requests_over_http_proxy}

デフォルトでは、トンネリング（`HTTP CONNECT`）を使用して `HTTP` プロキシ経由で `HTTPS` リクエストを行います。この設定を使用すると、トンネリングを無効化できます。

**no&#95;proxy**

デフォルトでは、すべてのリクエストがプロキシを経由します。特定のホストに対してプロキシを無効にするには、`no_proxy` 変数を設定する必要があります。
これは、list および remote resolver では `<proxy>` 句の中で、environment resolver では環境変数として設定できます。
IP アドレス、ドメイン、サブドメイン、および完全にバイパスするためのワイルドカード `'*'` をサポートします。curl と同様に、先頭のドットは削除されます。

**Example**

次の設定では、`clickhouse.cloud` およびそのすべてのサブドメイン（例: `auth.clickhouse.cloud`）へのリクエストはプロキシをバイパスします。
GitLab についても同様で、先頭にドットを付けて指定した場合でも同じように扱われます。`gitlab.com` と `about.gitlab.com` の両方がプロキシをバイパスします。

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

## disk_connections_hard_limit {#disk_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="20000" />この制限に達すると、作成時に例外がスローされます。0 に設定するとハード制限を無効にできます。この制限はディスク接続数に適用されます。

## disk_connections_soft_limit {#disk_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この上限を超えた接続は、有効期間 (time to live, TTL) が大幅に短くなります。この上限はディスク接続に適用されます。

## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />この上限を超える接続は、使用後にリセットされます。接続キャッシュを無効にするには 0 に設定します。この上限はディスクへの接続に適用されます。

## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="8000" />使用中の接続数がこの制限を超えた場合、警告メッセージがログに書き込まれます。この制限はディスクの接続に適用されます。

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

テーブル、データベース、テーブル関数、およびディクショナリに対して実行される `SHOW` および `SELECT` クエリで、シークレットを表示するかどうかを有効または無効にします。

シークレットを表示したいユーザーは、
[`format_display_secrets_in_show_and_select` フォーマット設定](../settings/formats#format_display_secrets_in_show_and_select)
を有効にし、かつ
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限を持っている必要があります。

取り得る値:

- `0` — 無効。
- `1` — 有効。

## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client} 

<SettingsInfoBlock type="Bool" default_value="1" />キャッシュサーバーがクライアントから受信したスロットリング設定を適用するかどうかを制御します。

## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />distributed cache が維持しようとする空き接続数に対するソフトリミットです。空き接続数が distributed_cache_keep_up_free_connections_ratio * max_connections を下回ると、この制限を上回るまで、最後のアクティビティが最も古い接続から順に閉じられます。

## distributed&#95;ddl {#distributed_ddl}

クラスタ上で [分散 DDL クエリ](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）の実行を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) が有効になっている場合にのみ動作します。

`<distributed_ddl>` 内で設定可能な項目は次のとおりです。

| Setting                | Description                                                                    | Default Value                 |
| ---------------------- | ------------------------------------------------------------------------------ | ----------------------------- |
| `path`                 | DDL クエリ用の `task_queue` がある Keeper 内のパス                                         |                               |
| `profile`              | DDL クエリの実行に使用されるプロファイル                                                         |                               |
| `pool_size`            | 同時に実行できる `ON CLUSTER` クエリの数                                                    |                               |
| `max_tasks_in_queue`   | キュー内に保持できるタスクの最大数                                                              | `1,000`                       |
| `task_max_lifetime`    | ノードの存続時間がこの値を超えた場合、そのノードを削除します。                                                | `7 * 24 * 60 * 60`（秒単位で 1 週間） |
| `cleanup_delay_period` | 新しいノードイベントを受信したとき、前回のクリーンアップから `cleanup_delay_period` 秒以上経過していればクリーンアップを開始します。 | `60` 秒                        |

**例**

```xml
<distributed_ddl>
    <!-- ZooKeeper内のDDLクエリキューへのパス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- このプロファイルの設定を使用してDDLクエリを実行します -->
    <profile>default</profile>

    <!-- ON CLUSTERクエリの同時実行数を制御します -->
    <pool_size>1</pool_size>

    <!--
         クリーンアップ設定（アクティブなタスクは削除されません）
    -->

    <!-- タスクの有効期限 (TTL) を制御します（デフォルト: 1週間） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- クリーンアップの実行間隔を制御します（秒単位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- キューに保持できるタスク数を制御します -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles} 

<SettingsInfoBlock type="Bool" default_value="0" />有効にすると、ON CLUSTER クエリはリモート分片での実行時に、クエリを開始したユーザーとロールを引き継いで使用します。これによりクラスタ全体でアクセス制御の一貫性が保たれますが、すべてのノードに同じユーザーとロールが存在している必要があります。

## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />ホスト名を IPv4 アドレスへ名前解決することを許可します。

## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />ホスト名を IPv6 アドレスに解決できるようにします。

## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />内部 DNS キャッシュのエントリの最大数。

## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />内部 DNS キャッシュを更新する間隔（秒）。

## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />ClickHouse の DNS キャッシュからホスト名を削除する前に許容される、そのホスト名の DNS 解決失敗の連続発生の最大回数。

## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />分散キャッシュを削除する際に使用されるスレッドプールのサイズ。

## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />分散キャッシュをドロップする際に使用されるスレッドプールのキューサイズ。

## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Azure SDK によるログ出力を有効にします

## encryption {#encryption}

[encryption codecs](/sql-reference/statements/create/table#encryption-codecs) で使用されるキーを取得するコマンドを設定します。キー（または複数のキー）は、環境変数に書き込むか、設定ファイル内で設定する必要があります。

キーは、16 バイト長の 16 進数または文字列である必要があります。

**例**

設定ファイルから読み込む:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
キーを設定ファイルに保存することは推奨されません。安全ではありません。安全なディスク上の別の設定ファイルにキーを移動し、その設定ファイルへのシンボリックリンクを `config.d/` フォルダに配置できます。
:::

キーが 16 進数表記の場合の、設定ファイルからの読み込み:

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

ここで `current_key_id` は暗号化に使用する現在のキーを指定し、指定したすべてのキーを復号に使用できます。

これらの各手法は、複数のキーに対して適用できます。

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

また、ユーザーは長さが 12 バイトでなければならないノンスを追加することもできます（デフォルトでは、暗号化および復号処理はゼロバイトのみで構成されたノンスを使用します）:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または16進数で指定することもできます：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
上記の内容はすべて `aes_256_gcm_siv` にも適用できます（ただし、キーは32バイト長である必要があります）。
:::

## error&#95;log {#error_log}

デフォルトでは無効になっています。

**有効化**

エラー履歴の収集 [`system.error_log`](../../operations/system-tables/error_log.md) を手動で有効化するには、次の内容で `/etc/clickhouse-server/config.d/error_log.xml` を作成します。

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

`error_log` 設定を無効化するには、次の内容で `/etc/clickhouse-server/config.d/disable_error_log.xml` ファイルを作成します。

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

入力のパースに使用されるスレッドプールにスケジュールできるジョブ数の上限。

:::note
`0` の値は無制限を意味します。
:::

## format&#95;schema&#95;path {#format_schema_path}

入力データ用のスキーマが含まれるディレクトリへのパスです。たとえば、[CapnProto](/interfaces/formats/CapnProto) 形式のスキーマなどです。

**例**

```xml
<!-- 各種入力フォーマットのスキーマファイルを格納するディレクトリ。 -->
<format_schema_path>format_schemas/</format_schema_path>
```

## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />グローバルプロファイラにおけるCPUクロックタイマーの周期（ナノ秒単位）。グローバルCPUクロックプロファイラを無効にするには、値を 0 に設定します。単一クエリのプロファイリングには少なくとも 10000000（1秒あたり100回）、クラスター全体のプロファイリングには 1000000000（1秒あたり1回）以上の値を推奨します。

## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />グローバルプロファイラの実時間クロックタイマーの周期（ナノ秒単位）。実時間クロックを用いるグローバルプロファイラを無効にするには 0 を設定します。推奨値は、単一クエリの場合は少なくとも 10000000（1 秒間に 100 回）、クラスタ全体のプロファイリングの場合は 1000000000（1 秒に 1 回）です。

## google&#95;protos&#95;path {#google_protos_path}

Protobuf 型の proto ファイルが格納されているディレクトリを指定します。

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
* `timeout` – データ送信のタイムアウト（秒）。
* `root_path` – キーのプレフィックス。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルのデータを送信。
* `events` – [system.events](/operations/system-tables/events) テーブルから、指定期間に蓄積された差分データを送信。
* `events_cumulative` – [system.events](/operations/system-tables/events) テーブルの累積データを送信。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルのデータを送信。

複数の `<graphite>` 句を設定できます。たとえば、異なる種類のデータを異なる間隔で送信するために利用できます。

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

Graphite 向けのデータ間引き設定です。

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

## hsts&#95;max&#95;age {#hsts_max_age}

HSTS の有効期限（秒単位）。

:::note
値が `0` の場合、ClickHouse は HSTS を無効にします。正の値を設定すると HSTS が有効になり、その値が max-age として使用されます。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```

## http_connections_hard_limit {#http_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限に達している状態で新規作成を試みると、例外がスローされます。ハード制限を無効にするには 0 に設定します。この制限は、いずれのディスクやストレージにも属さない HTTP 接続に適用されます。

## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この上限を超えた接続の有効期間は、大幅に短くなります。この制限は、いずれのディスクやストレージにも属さない HTTP 接続に適用されます。

## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />この制限を超えた接続は、使用後にリセットされます。接続キャッシュを無効にするには 0 に設定します。この制限は、どのディスクやストレージにも属さない HTTP 接続に適用されます。

## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="500" />使用中の接続の数がこの制限を超えた場合、警告メッセージがログに書き込まれます。この制限は、いずれのディスクやストレージにも属さない HTTP 接続に適用されます。

## http&#95;handlers {#http_handlers}

カスタム HTTP ハンドラーを定義して使用できるようにします。
新しい HTTP ハンドラーを追加するには、新しい `<rule>` を追加するだけです。
ルールは定義された順に上から下へチェックされ、
最初にマッチしたもののハンドラーが実行されます。

以下の設定はサブタグで設定できます:

| Sub-tags             | Definition                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `url`                | リクエスト URL をマッチさせるために使用します。`regex:` プレフィックスを付けると、正規表現でのマッチが可能です (任意)                           |
| `methods`            | リクエストメソッドをマッチさせるために使用します。カンマ区切りで複数のメソッドを指定できます (任意)                                           |
| `headers`            | リクエストヘッダーをマッチさせるために使用します。各子要素 (子要素名がヘッダー名) をマッチさせます。`regex:` プレフィックスを付けると、正規表現でのマッチが可能です (任意) |
| `handler`            | リクエストハンドラー                                                                                    |
| `empty_query_string` | URL にクエリ文字列が存在しないことをチェックします                                                                   |

`handler` には以下の設定が含まれ、サブタグで設定できます:

| Sub-tags           | Definition                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `url`              | リダイレクト先の URL                                                                                                          |
| `type`             | サポートされるタイプ: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                         |
| `status`           | static タイプで使用します。レスポンスのステータスコード                                                                                       |
| `query_param_name` | dynamic&#95;query&#95;handler タイプで使用します。HTTP リクエストパラメータ内で `<query_param_name>` に対応する値を取り出して実行します                      |
| `query`            | predefined&#95;query&#95;handler タイプで使用します。ハンドラーが呼び出されたときにクエリを実行します                                                   |
| `content_type`     | static タイプで使用します。レスポンスの Content-Type                                                                                  |
| `response_content` | static タイプで使用します。クライアントに送信されるレスポンスコンテンツです。`file://` または `config://` のプレフィックスを使用した場合、ファイルまたは設定からコンテンツを取得してクライアントに送信します |

ルールの一覧に加えて、すべてのデフォルトハンドラーを有効にする `<defaults/>` を指定できます。

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

`OPTIONS` HTTP リクエストのレスポンスヘッダーを追加するために使用します。
`OPTIONS` メソッドは、CORS プリフライトリクエストを行う際に使用されます。

詳細は [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS) を参照してください。

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

ClickHouse の HTTP(S) サーバーにアクセスしたときに、デフォルトで表示されるページです。
デフォルト値は「Ok.」（末尾に改行付き）です。

**例**

`http://localhost:http_port` にアクセスしたときに `https://tabix.io/` を開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```

## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Iceberg カタログのバックグラウンドプールのサイズ

## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Iceberg カタログプールにキューイング可能なタスク数

## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Iceberg メタデータファイルキャッシュの最大エントリ数。0 を指定すると無効になります。

## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Iceberg のメタデータファイルキャッシュポリシー名。

## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Iceberg メタデータキャッシュの最大サイズ（バイト単位）。0 を指定すると無効になります。

## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />iceberg メタデータキャッシュにおいて、キャッシュ全体サイズに対する（SLRU ポリシー使用時の）保護キューサイズの割合。

## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、ClickHouse は `CREATE VIEW` クエリで空の SQL security ステートメントに対して既定値を保存しません。

:::note
この設定は移行期間中にのみ必要であり、バージョン 24.4 では不要になります。
:::

## include&#95;from {#include_from}

置換定義が記述されたファイルへのパスです。XML と YAML の両方の形式がサポートされています。

詳細については、「[設定ファイル](/operations/configuration-files)」のセクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```

## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリ索引マークキャッシュのポリシー名。

## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

インデックスマークキャッシュの最大サイズ。

:::note

`0` を指定すると無効になります。

この設定は実行時に変更でき、直ちに反映されます。
:::

## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />セカンダリ索引マークキャッシュにおける保護キュー（SLRU ポリシーの場合）のサイズを、キャッシュ全体のサイズに対する比率として指定します。

## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリ索引用の非圧縮キャッシュポリシー名。

## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

非圧縮の `MergeTree` 索引ブロックキャッシュの最大サイズ。

:::note
`0` を指定するとキャッシュは無効になります。

この設定は実行時に変更でき、直ちに反映されます。
:::

## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />セカンダリ索引の非圧縮キャッシュにおいて、保護キュー（SLRU ポリシーの場合）のサイズがキャッシュ全体サイズに対して占める比率を表します。

## interserver&#95;http&#95;credentials {#interserver_http_credentials}

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)時に他のサーバーへ接続するために使用されるユーザー名とパスワードです。加えて、サーバーはこれらの認証情報を使って他のレプリカを認証します。
したがって、`interserver_http_credentials` はクラスター内のすべてのレプリカで同一である必要があります。

:::note

* 既定では、`interserver_http_credentials` セクションが省略された場合、レプリケーション時に認証は使用されません。
* `interserver_http_credentials` の設定は、ClickHouse クライアント認証情報の[設定](../../interfaces/cli.md#configuration_files)とは関係ありません。
* これらの認証情報は、`HTTP` および `HTTPS` を介したレプリケーションに共通です。
  :::

次の設定はサブタグで構成できます:

* `user` — ユーザー名。
* `password` — パスワード。
* `allow_empty` — `true` の場合、認証情報が設定されていても、他のレプリカが認証なしで接続することを許可します。`false` の場合、認証なしの接続は拒否されます。既定値: `false`。
* `old` — 認証情報ローテーション時に使用される、古い `user` と `password` を保持します。複数の `old` セクションを指定できます。

**認証情報のローテーション**

ClickHouse は、すべてのレプリカを同時に停止して設定を更新することなく、インターサーバー認証情報の動的なローテーションをサポートします。認証情報は複数の手順で変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、認証情報を追加します。これにより、認証の有無にかかわらず接続を許可できます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカの構成が完了したら、`allow_empty` を `false` に設定するか、この SETTING を削除します。これにより、新しい認証情報の指定が必須になります。

既存の認証情報を変更するには、ユーザー名とパスワードを `interserver_http_credentials.old` セクションに移動し、`user` と `password` を新しい値に更新します。この時点では、サーバーは他のレプリカに接続する際に新しい認証情報を使用し、新旧どちらの認証情報での接続も受け付けます。

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

他のサーバーがこのサーバーにアクセスするために使用できるホスト名です。

省略した場合は、`hostname -f` コマンドと同じ方法で決定されます。

特定のネットワークインターフェイスに依存したくない場合に便利です。

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

[`interserver_http_host`](#interserver_http_host) と類似していますが、このホスト名は他のサーバーから `HTTPS` 経由でこのサーバーにアクセスするために使用されます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```

## interserver&#95;https&#95;port {#interserver_https_port}

`HTTPS` 経由で ClickHouse サーバー間のデータ交換に使用するポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```

## interserver&#95;listen&#95;host {#interserver_listen_host}

ClickHouse サーバー間でデータを交換できるホストを制限します。
Keeper を使用している場合は、異なる Keeper インスタンス間の通信にも同じ制限が適用されます。

:::note
デフォルトでは、この値は [`listen_host`](#listen_host) 設定と同じです。
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

I/O スレッドプールにスケジュールできるジョブの最大数。

:::note
値が `0` の場合は無制限を意味します。
:::

## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />jemalloc がサンプリングしたメモリアロケーションを system.trace_log に保存します

## jemalloc_enable_background_threads {#jemalloc_enable_background_threads} 

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc のバックグラウンドスレッド機能を有効にします。jemalloc はバックグラウンドスレッドを使用して未使用のメモリページを解放します。これを無効にするとパフォーマンスの低下を招く可能性があります。

## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />すべてのスレッドに対して jemalloc のアロケーションプロファイラを有効にします。jemalloc は割り当てと、サンプリング対象となった割り当てに対するすべての解放をサンプリングします。
プロファイルは、SYSTEM JEMALLOC FLUSH PROFILE を使用してフラッシュでき、アロケーション分析に利用できます。
サンプルは、設定項目 jemalloc_collect_global_profile_samples_in_trace_log を使用して system.trace_log に保存することもでき、あるいはクエリ設定 jemalloc_collect_profile_samples_in_trace_log を使用して保存することもできます。
[Allocation Profiling](/operations/allocation-profiling) を参照してください。

## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />jemalloc によるグローバルなピークメモリ使用量が jemalloc_flush_profile_interval_bytes だけ増加すると、jemalloc プロファイルがフラッシュされます

## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded} 

<SettingsInfoBlock type="Bool" default_value="0" />総メモリ超過エラー発生時に jemalloc プロファイルをフラッシュします

## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />作成する jemalloc のバックグラウンドスレッドの最大数。0 に設定すると jemalloc のデフォルト値が使用されます。

## keep&#95;alive&#95;timeout {#keep_alive_timeout}

<SettingsInfoBlock type="Seconds" default_value="30" />

HTTP プロトコルで新しいリクエストを待機する最大秒数。この秒数を経過すると、ClickHouse は接続を閉じます。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```

## keeper_hosts {#keeper_hosts} 

動的な設定です。ClickHouse が接続できる可能性のある [Zoo]Keeper ホストの集合を含みます。`<auxiliary_zookeepers>` の情報は公開されません。

## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

バッチ処理をサポートしている [Zoo]Keeper への MultiRead リクエストにおけるバッチの最大サイズです。0 に設定すると、バッチ処理は無効になります。ClickHouse Cloud でのみ利用可能です。

## ldap_servers {#ldap_servers} 

ここには、LDAP サーバーとその接続パラメータを列挙します。用途は次のとおりです。

- `password` の代わりに `ldap` 認証メカニズムが指定されている専用ローカルユーザーの認証器として利用する
- リモートユーザーディレクトリとして利用する

以下の設定はサブタグで構成できます:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP サーバーのホスト名または IP。必須パラメータであり、空にはできません。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP サーバーのポート。`enable_tls` が true に設定されている場合のデフォルトは 636、それ以外の場合は `389` です。                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                      | バインドに使用する DN を構成するためのテンプレート。最終的な DN は、各認証試行時にこのテンプレート内のすべての `\{user_name\}` 部分文字列を実際のユーザー名に置き換えることで構成されます。                                                                                                                                                                                                                               |
| `user_dn_detection`            | バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータを指定するセクションです。これは主に、サーバーが Active Directory の場合に、後続のロールマッピングのための検索フィルタで使用されます。結果として得られるユーザー DN は、許可されている箇所での `\{user_dn\}` 部分文字列の置き換えに使用されます。デフォルトではユーザー DN は bind DN と同一に設定されますが、一度検索が実行されると、実際に検出されたユーザー DN の値で更新されます。 |
| `verification_cooldown`        | バインドが成功した後、指定された秒数の間、そのユーザーについては LDAP サーバーへ問い合わせを行わず、すべての連続するリクエストに対して認証済みとみなす期間です。`0`（デフォルト）を指定するとキャッシュが無効化され、各認証リクエストごとに LDAP サーバーへ問い合わせを行います。                                                                                                                  |
| `enable_tls`                   | LDAP サーバーへのセキュアな接続を使用するかどうかを制御するフラグです。プレーンテキストのプロトコル（`ldap://`、非推奨）を使用するには `no` を指定します。SSL/TLS 上の LDAP（`ldaps://`、推奨、デフォルト）を使用するには `yes` を指定します。レガシーな StartTLS プロトコル（プレーンテキストの `ldap://` プロトコルを TLS にアップグレードする方式）を使用するには `starttls` を指定します。                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLS の最小プロトコルバージョン。指定可能な値は: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）です。                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`             | SSL/TLS ピア証明書の検証動作。指定可能な値は: `never`, `allow`, `try`, `demand`（デフォルト）です。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 証明書キーファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | CA 証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 許可される暗号スイート（OpenSSL 表記）。                                                                                                                                                                                                                                                                                                                                                                                              |

`user_dn_detection` はサブタグで構成できます:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP 検索のベース DN を構成するためのテンプレート。最終的な DN は、LDAP 検索中にこのテンプレート内のすべての `\{user_name\}` および `\{bind_dn\}` 部分文字列を、実際のユーザー名および bind DN に置き換えることで構成されます。                                                                                                       |
| `scope`         | LDAP 検索のスコープ。指定可能な値は: `base`, `one_level`, `children`, `subtree`（デフォルト）です。                                                                                                                                                                                                                                       |
| `search_filter` | LDAP 検索の検索フィルタを構成するためのテンプレート。最終的なフィルタは、LDAP 検索中にこのテンプレート内のすべての `\{user_name\}`、`\{bind_dn\}`、および `\{base_dn\}` 部分文字列を、実際のユーザー名、bind DN、および base DN に置き換えることで構成されます。特殊文字は XML 内で適切にエスケープする必要がある点に注意してください。  |

Example:

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

例（後続のロールマッピングのためにユーザー DN 検出を設定した典型的な Active Directory）：

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

listen ソケットの backlog（保留中接続のキューサイズ）。デフォルト値の `4096` は Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)) のデフォルト値と同じです。

通常、この値を変更する必要はありません。理由は次のとおりです。

* デフォルト値が十分に大きいこと
* クライアント接続を accept するためにサーバー側に専用スレッドがあること

そのため、たとえ `TcpExtListenOverflows`（`nstat` から取得）がゼロ以外で、このカウンタが ClickHouse サーバーで増加していたとしても、この値を増やす必要があるとは限りません。理由は次のとおりです。

* 通常、`4096` で足りない場合は、ClickHouse 内部のスケーリングに何らかの問題があることを示しているため、問題として報告する方が望ましいです。
* それはサーバーがその後、より多くの接続を処理できることを意味しません（仮に処理できたとしても、その時点ではクライアントはすでにいなくなっている、または切断されている可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```

## listen&#95;host {#listen_host}

リクエストを受け付ける送信元ホストを制限します。サーバーがすべてのホストからのリクエストに応答するようにするには、`::` を指定します。

例:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```

## listen&#95;reuse&#95;port {#listen_reuse_port}

複数のサーバーが同一のアドレスとポートで待ち受けできるようにします。リクエストはオペレーティングシステムによってランダムなサーバーへルーティングされます。この設定を有効にすることは推奨されていません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

タイプ:

デフォルト:

## listen&#95;try {#listen_try}

サーバーは、リッスンを開始しようとした際に IPv6 または IPv4 ネットワークが利用できない場合でも、終了しません。

**例**

```xml
<listen_try>0</listen_try>
```

## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />マーク読み込み用バックグラウンドスレッドプールのサイズ

## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />プリフェッチ用プールに投入可能なタスク数の上限

## logger {#logger} 

ログメッセージの出力先とフォーマットを指定します。

**キー**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | ログレベル。指定可能な値: `none` (ログ出力を無効化)、`fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                     |
| `log`                  | ログファイルへのパス。                                                                                                                                             |
| `errorlog`             | エラーログファイルへのパス。                                                                                                                                       |
| `size`                 | ローテーションポリシー: ログファイルの最大サイズ (バイト数)。ログファイルサイズがこの閾値を超えると、リネームおよびアーカイブされ、新しいログファイルが作成されます。 |
| `count`                | ローテーションポリシー: 履歴として保持するログファイルの最大個数。                                                                                                 |
| `stream_compress`      | LZ4 を使用してログメッセージを圧縮します。有効にするには `1` または `true` を設定します。                                                                          |
| `console`              | コンソールへのログ出力を有効にします。有効にするには `1` または `true` を設定します。ClickHouse がデーモンモードで動作していない場合のデフォルトは `1`、それ以外は `0` です。 |
| `console_log_level`    | コンソール出力用のログレベル。デフォルトは `level` の値です。                                                                                                      |
| `formatting.type`      | コンソール出力のログフォーマット。現在は `json` のみがサポートされています。                                                                                       |
| `use_syslog`           | syslog にもログ出力を転送します。                                                                                                                                  |
| `syslog_level`         | syslog へのログ出力で使用するログレベル。                                                                                                                          |
| `async`                | `true` (デフォルト) の場合、ログ出力は非同期で行われます (出力チャネルごとにバックグラウンドスレッド 1 本)。`false` の場合は LOG を呼び出したスレッド内で出力されます。 |
| `async_queue_max_size` | 非同期ログ出力時に、フラッシュ待ちキューに保持されるメッセージの最大数。この上限を超えたメッセージは破棄されます。                                                 |
| `startup_level`        | サーバー起動時にルートロガーのレベルを設定するために使用するログレベル。起動後はログレベルが `level` の設定値に戻されます。                                        |
| `shutdown_level`       | サーバーのシャットダウン時にルートロガーのレベルを設定するために使用するログレベル。                                                                               |

**ログフォーマット指定子**

`log` と `errorLog` のパスに含まれるファイル名部分では、以下のフォーマット指定子を使用して実際のファイル名を生成できます (ディレクトリ部分では使用できません)。

「Example」カラムは、`2023-07-06 18:32:07` 時点での出力例を示します。

| 指定子  | 説明                                                                                                                      | 例                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%` | リテラルの %                                                                                                                 | `%`                        |
| `%n` | 改行文字                                                                                                                    |                            |
| `%t` | 水平タブ文字                                                                                                                  |                            |
| `%Y` | 年を10進数で表した数値（例: 2017）                                                                                                   | `2023`                     |
| `%y` | 年の下2桁を10進数で表した値（範囲 [00,99]）                                                                                             | `23`                       |
| `%C` | 年の最初の2桁を10進数で表した数値（範囲 [00,99]）                                                                                          | `20`                       |
| `%G` | 4 桁の[ISO 8601 週単位の年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、つまり指定した週を含む年を表します。通常は `%V` と組み合わせて使用する場合にのみ有用です | `2023`                     |
| `%g` | [ISO 8601 の週を基準とした年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)の下位2桁、すなわち指定された週を含む年を表す2桁の値。                     | `23`                       |
| `%b` | 省略された月名。例: Oct（ロケールに依存）                                                                                                 | `Jul`                      |
| `%h` | %b の同義語                                                                                                                 | `Jul`                      |
| `%B` | 完全な月名。例: October（ロケール依存）                                                                                                | `7月`                       |
| `%m` | 月を10進数で表す値（範囲 [01,12]）                                                                                                  | `07`                       |
| `%U` | 年内の週番号（10進数）（日曜日を週の最初の曜日とする）（範囲 [00,53]）                                                                                | `27`                       |
| `%W` | 年内の週番号（週の開始曜日は月曜日）を10進数で表したもの（範囲 [00,53]）                                                                               | `27`                       |
| `%V` | ISO 8601 の週番号（範囲 [01,53]）                                                                                               | `27`                       |
| `%j` | 年内通算日を10進数で表した数値（範囲 [001,366]）                                                                                          | `187`                      |
| `%d` | 月内の日をゼロ埋めした10進数で表します（範囲 [01,31]）。1桁の場合は先頭に 0 が付きます。                                                                     | `06`                       |
| `%e` | 月の日付を、左側をスペースで埋めた10進数で表します（範囲 [1,31]）。1桁の場合は前にスペースが入ります。                                                                | `&nbsp; 6`                 |
| `%a` | 省略された曜日名。例: Fri（ロケールに依存）                                                                                                | `木`                        |
| `%A` | 曜日名（フルスペル）。例: Friday（ロケールに依存）                                                                                           | `木曜日`                      |
| `%w` | 日曜日を0とする整数値で表した曜日（範囲 [0-6]）                                                                                             | `4`                        |
| `%u` | 曜日を表す10進数で、月曜日を1とする（ISO 8601 形式、範囲 [1-7]）                                                                               | `4`                        |
| `%H` | 24時間制における時を10進数で表現（範囲 [00-23]）                                                                                          | `18`                       |
| `%I` | 10 進数で表した時（12 時間制、範囲 [01,12]）                                                                                           | `06`                       |
| `%M` | 分を表す10進数（範囲 [00,59]）                                                                                                    | `32`                       |
| `%S` | 秒を表す10進数（範囲 [00,60]）                                                                                                    | `07`                       |
| `%c` | 標準的な日付と時刻の文字列。例: Sun Oct 17 04:41:13 2010（ロケールに依存）                                                                      | `Thu Jul  6 18:32:07 2023` |
| `%x` | ロケールに応じた日付表記（ロケール依存）                                                                                                    | `2023/07/06`               |
| `%X` | ローカライズされた時刻表現（例: 18:40:20 や 6:40:20 PM など、ロケールに依存）                                                                      | `18:32:07`                 |
| `%D` | 短い MM/DD/YY 形式の日付。%m/%d/%y と同等です。                                                                                       | `07/06/23`                 |
| `%F` | 短い YYYY-MM-DD 形式の日付で、%Y-%m-%d と同等です                                                                                     | `2023-07-06`               |
| `%r` | ロケールに応じた12時間制の時刻                                                                                                        | `06:32:07 PM`              |
| `%R` | 「%H:%M」と同等                                                                                                              | `18:32`                    |
| `%T` | &quot;%H:%M:%S&quot;（ISO 8601 の時刻形式）と同等                                                                                 | `18:32:07`                 |
| `%p` | ロケールに応じた午前／午後（a.m./p.m.）の表記                                                                                             | `PM`                       |
| `%z` | ISO 8601 形式の UTC からのオフセット（例: -0430）、またはタイムゾーン情報がない場合は文字を含めません                                                           | `+0800`                    |
| `%Z` | ロケールに応じたタイムゾーン名または略称。タイムゾーン情報が利用できない場合は何も出力されない                                                                         | `Z AWST `                  |

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

ログメッセージをコンソールのみに出力するには次のようにします:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個々のログ名ごとにログレベルを上書きできます。たとえば、ロガー「Backup」と「RBAC」のすべてのメッセージ出力を抑制する場合です。

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

ログメッセージを syslog にも出力するには、次のようにします。

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

`&lt;syslog&gt;` 用のキー:

| Key        | Description                                                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `address`  | `host\[:port\]` 形式で指定する syslog のアドレス。省略した場合はローカルの syslog デーモンが使用されます。                                                                                                                                                                      |
| `hostname` | ログを送信するホスト名（省略可能）。                                                                                                                                                                                                                         |
| `facility` | syslog の [facility keyword](https://en.wikipedia.org/wiki/Syslog#Facility)。必ず大文字で、かつ &quot;LOG&#95;&quot; プレフィックスを付けて指定する必要があります（例: `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` など）。デフォルト: `address` が指定されている場合は `LOG_USER`、それ以外は `LOG_DAEMON`。 |
| `format`   | ログメッセージの形式。指定可能な値: `bsd` および `syslog.`                                                                                                                                                                                                     |

**Log formats**

コンソールログに出力されるログ形式を指定できます。現在は JSON のみがサポートされています。

**Example**

出力される JSON ログの例を次に示します:

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

JSON ログのサポートを有効にするには、次のスニペットを使用します。

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- チャネルごと(log、errorlog、console、syslog)に設定することも、全チャネルに対してグローバルに設定すること(その場合は省略)も可能です。 -->
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

キー名は、`<names>` タグ内のタグ値を変更することで変更できます。たとえば、`DATE_TIME` を `MY_DATE_TIME` に変更するには、`<date_time>MY_DATE_TIME</date_time>` を使用します。

**JSON ログのキーの省略**

ログプロパティは、そのプロパティをコメントアウトすることで省略できます。たとえば、ログに `query_id` を出力しないようにしたい場合は、`<query_id>` タグをコメントアウトします。

## macros {#macros}

レプリケートテーブル向けのパラメータ代入です。

レプリケートテーブルを使用しない場合は省略できます。

詳細については、[Creating replicated tables](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) セクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```

## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />マークキャッシュポリシーの名前。

## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />事前ウォームアップ時にプリウォームする mark cache の総サイズに対する割合。

## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

[`MergeTree`](/engines/table-engines/mergetree-family) ファミリーのテーブルで使用されるマーク（索引）のキャッシュの最大サイズです。

:::note
この設定は実行時に変更でき、直ちに反映されます。
:::

## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />マークキャッシュにおいて、SLRU ポリシー使用時の保護キューのサイズを、キャッシュ全体のサイズに対する比率で指定します。

## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />起動時にアクティブなデータパーツ集合をロードするスレッド数。

## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ユーザーごとに作成または変更できる認証方式の最大数です。
この設定を変更しても既存のユーザーには影響しません。認証に関連する CREATE/ALTER クエリが、この設定で指定された上限を超えると失敗します。
認証に関連しない CREATE/ALTER クエリは成功します。

:::note
値が `0` の場合は無制限を意味します。
:::

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべてのバックアップに対する、1 秒あたりの最大読み取り帯域幅（バイト数）です。0 を指定すると無制限になります。

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Backups IO Thread プール内の**アイドル**スレッド数が `max_backup_io_thread_pool_free_size` を超えた場合、ClickHouse はアイドル状態のスレッドが占有しているリソースを解放し、プールサイズを縮小します。必要に応じて、スレッドは再度作成されます。

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse は Backups IO Thread プール内のスレッドを使用して、S3 バックアップの I/O 操作を実行します。`max_backups_io_thread_pool_size` は、このプール内のスレッド数の上限を設定します。

## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

ベクトル索引を構築する際に使用するスレッド数の上限です。

:::note
`0` を指定すると、すべてのコアが使用されます。
:::

## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行できる挿入クエリの総数の上限。

:::note

値が `0`（デフォルト）の場合は無制限となります。

この設定は実行時に変更でき、即座に反映されます。すでに実行中のクエリには影響しません。
:::

## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行できるクエリの総数の上限です。`INSERT` および `SELECT` クエリに対する上限や、ユーザーのクエリ数の最大値に対する制限も合わせて考慮する必要があります。

関連項目:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

`0`（デフォルト）の場合は無制限を意味します。

この設定は実行時に変更でき、即座に反映されます。すでに実行中のクエリには適用されません。
:::

## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行できる `SELECT` クエリ数の合計の上限。

:::note

`0`（デフォルト）の場合は無制限を意味します。

この設定は実行時に変更でき、即座に反映されます。すでに実行中のクエリには影響しません。
:::

## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />サーバーの最大接続数。

## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />データベース数がこの値を超えると、サーバーは例外を発生させます。0 を指定すると制限なしになります。

## max&#95;database&#95;num&#95;to&#95;warn {#max_database_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

アタッチ済みのデータベース数が指定された値を超えた場合、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />DatabaseReplicated データベースでレプリカのリカバリ中にテーブルを作成するためのスレッド数。0 の場合、スレッド数はコア数と同じになります。

## max&#95;dictionary&#95;num&#95;to&#95;throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Dictionary の数がこの値を超えると、サーバーは例外を送出します。

次のデータベースエンジンを使用するテーブルのみをカウントします:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
値が `0` の場合、制限はありません。
:::

**例**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```

## max&#95;dictionary&#95;num&#95;to&#95;warn {#max_dictionary_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

アタッチされている Dictionary の数が指定した値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーにおける分散キャッシュからの合計読み取り速度の上限（1 秒あたりのバイト数）。0 は無制限を意味します。

## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーの分散キャッシュに対する合計書き込み速度の上限を、1 秒あたりのバイト数で指定します。0 は無制限を意味します。

## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />集約中に収集されるハッシュテーブル統計に含めることができるエントリ数の上限

## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITION 操作に使用されるスレッド数。

## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

入力をパースするためのスレッドプールにおいて、アイドル状態で待機させておくスレッドの最大数。

## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

入力の解析に使用されるスレッドの合計最大数。

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

IO スレッドプール内の**アイドル**スレッド数が `max_io_thread_pool_free_size` を超えると、ClickHouse はこれらのスレッドが占有しているリソースを解放し、プールサイズを縮小します。必要に応じて、スレッドは再作成されます。

## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse は IO スレッドプール内のスレッドを使用して、S3 とのやり取りなどの一部の IO 処理を実行します。`max_io_thread_pool_size` は、プール内のスレッド数の上限を指定します。

## max&#95;keep&#95;alive&#95;requests {#max_keep_alive_requests}

<SettingsInfoBlock type="UInt64" default_value="10000" />

1 つの keep-alive 接続で、ClickHouse サーバーによって接続が閉じられるまでに許可されるリクエストの最大数。

**例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```

## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカル読み取りの最大速度（バイト/秒）。

:::note
値が `0` の場合、無制限を意味します。
:::

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカルへの書き込み速度の上限（1 秒あたりのバイト数）。

:::note
値が `0` の場合は無制限を意味します。
:::

## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルに関連付けられる materialized view の数の上限。

:::note
ここではテーブルに直接依存する view のみが対象であり、ある view を基に別の view を作成する場合は対象外です。
:::

## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーで実行されるすべてのマージ処理における最大読み取り速度（1 秒あたりのバイト数）。0 の場合は無制限を意味します。

## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべての mutation の最大読み取り帯域幅（1 秒あたりのバイト数）。0 の場合は無制限です。

## max&#95;named&#95;collection&#95;num&#95;to&#95;throw {#max_named_collection_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

名前付きコレクションの数がこの値を超える場合、サーバーは例外をスローします。

:::note
`0` は、制限がないことを意味します。
:::

**例**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```

## max&#95;named&#95;collection&#95;num&#95;to&#95;warn {#max_named_collection_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

名前付きコレクションの数が指定された値を超えた場合、ClickHouse server は警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```

## max&#95;open&#95;files {#max_open_files}

最大で開くことのできるファイル数。

:::note
`getrlimit()` 関数が誤った値を返すため、macOS ではこのオプションの使用を推奨しています。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```

## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

接続を切断するかどうかを判断するために使用される、OS における CPU の待機時間（`OSCPUWaitMicroseconds` メトリクス）とビジー時間（`OSCPUVirtualTimeMicroseconds` メトリクス）の最大比。切断の発生確率の計算には、この比の最小値と最大値の間の線形補間が使用され、この値に達した時点で確率は 1 になります。
詳細については、[サーバー CPU 高負荷時の動作制御](/operations/settings/server-overload) を参照してください。

## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />起動時に非アクティブなデータパーツ（古いパーツ）の集合を読み込むためのスレッド数。

## max&#95;part&#95;num&#95;to&#95;warn {#max_part_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="100000" />

アクティブなパーツの数が指定した値を超えた場合、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

## max&#95;partition&#95;size&#95;to&#95;drop {#max_partition_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

パーティション削除に対する制限です。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが [`max_partition_size_to_drop`](#max_partition_size_to_drop)（バイト単位）を超える場合、[DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) クエリを使用してパーティションを削除することはできません。
この設定を適用するために ClickHouse サーバーを再起動する必要はありません。制限を無効化する別の方法として、`<clickhouse-path>/flags/force_drop_table` ファイルを作成する手段もあります。

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

保留中のミューテーションのいずれかが指定した値（秒）を超えた場合、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```

## max&#95;pending&#95;mutations&#95;to&#95;warn {#max_pending_mutations_to_warn}

<SettingsInfoBlock type="UInt64" default_value="500" />

保留中の mutation の数が指定された値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```

## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

prefixes のデシリアライゼーション用スレッドプール内の**アイドル**スレッド数が `max_prefixes_deserialization_thread_pool_free_size` を超えた場合、ClickHouse はそれらのスレッドが占有しているリソースを解放し、プールのサイズを縮小します。スレッドは必要に応じて再作成されます。

## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse は、MergeTree の Wide パーツにおけるファイルプレフィックスからカラムおよびサブカラムのメタデータを並列に読み取るために、プレフィックスのデシリアライズ用スレッドプールからスレッドを使用します。`max_prefixes_deserialization_thread_pool_size` は、このプール内のスレッド数の上限を指定します。

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時に、ネットワーク経由で行われるデータ転送の最大速度を、1 秒あたりのバイト数で指定します。

:::note
`0`（デフォルト）の場合は無制限を意味します。
:::

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

サーバーへの書き込み時に、ネットワーク上で行われるデータ交換の最大速度（1 秒あたりのバイト数）。

:::note
`0`（デフォルト）の場合は無制限を意味します。
:::

## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケートされたフェッチに対する、ネットワークでのデータ転送の最大速度（1 秒あたりのバイト数）。0 は無制限を意味します。

## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケート送信におけるネットワーク上でのデータ転送の最大速度（バイト/秒）。0 を指定すると無制限になります。

## max&#95;replicated&#95;table&#95;num&#95;to&#95;throw {#max_replicated_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

レプリケートテーブルの数がこの値を超えると、サーバーは例外をスローします。

次のデータベースエンジンに属するテーブルのみがカウント対象です：

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
値 `0` は制限なしを意味します。
:::

**例**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```

## max_server_memory_usage {#max_server_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

サーバーが使用できるメモリの最大量をバイト単位で指定します。

:::note
サーバーのメモリ最大使用量は、`max_server_memory_usage_to_ram_ratio` の設定によってさらに制限されます。
:::

例外的に、値が `0`（デフォルト）の場合、サーバーは利用可能なすべてのメモリを使用できます（ただし、`max_server_memory_usage_to_ram_ratio` による制限は引き続き適用されます）。

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />

サーバーが使用することを許可されているメモリの最大量を、利用可能なメモリ全体に対する比率で指定します。

たとえば、`0.9`（デフォルト）の場合、サーバーは利用可能なメモリの 90% までを使用できます。

メモリ容量の少ないシステムで、メモリ使用量を抑えるために利用します。
RAM やスワップが少ないホストでは、[`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) を 1 より大きな値に設定する必要がある場合があります。

:::note
サーバーの最大メモリ消費量は、`max_server_memory_usage` の設定によってさらに制限されます。
:::

## max&#95;session&#95;timeout {#max_session_timeout}

セッションの最大タイムアウト時間（秒）。

例:

```xml
<max_session_timeout>3600</max_session_timeout>
```

## max&#95;table&#95;num&#95;to&#95;throw {#max_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブル数がこの値を超える場合、サーバーは例外をスローします。

次のテーブルはカウントに含まれません:

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
`0` の値は制限がないことを意味します。
:::

**例**

```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```

## max&#95;table&#95;num&#95;to&#95;warn {#max_table_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="5000" />

アタッチされているテーブルの数が指定された値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

## max&#95;table&#95;size&#95;to&#95;drop {#max_table_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

テーブルの削除に関する制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが `max_table_size_to_drop`（バイト単位）を超える場合、[`DROP`](../../sql-reference/statements/drop.md) クエリや [`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリを使用して削除することはできません。

:::note
`0` を指定すると、すべてのテーブルを制限なしで削除できます。

この設定は ClickHouse サーバーを再起動しなくても反映されます。制限を無効化する別の方法として、`<clickhouse-path>/flags/force_drop_table` ファイルを作成することもできます。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部集約、JOIN、ソート処理で使用される一時データに対して、ディスク上で使用できる最大容量を指定します。
この制限を超えたクエリは、例外が発生して失敗します。

:::note
`0` の値は無制限を意味します。
:::

関連項目:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max&#95;thread&#95;pool&#95;free&#95;size {#max_thread_pool_free_size}

<SettingsInfoBlock type="UInt64" default_value="1000" />

グローバルスレッドプール内の**アイドル**スレッド数が [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size) を超えると、ClickHouse は一部のスレッドによって占有されているリソースを解放し、プールサイズを縮小します。必要に応じてスレッドは再び作成されます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

## max&#95;thread&#95;pool&#95;size {#max_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse はクエリを処理する際に Global Thread pool に属するスレッドを使用します。クエリを処理するためのアイドルスレッドがない場合は、プール内に新しいスレッドが作成されます。`max_thread_pool_size` は、プール内のスレッド数の上限を設定します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />起動時に非アクティブな予期しないデータパーツ集合を読み込むスレッド数。

## max&#95;view&#95;num&#95;to&#95;throw {#max_view_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

ビュー数がこの値を超えると、サーバーは例外をスローします。

次のデータベースエンジンのテーブルのみがカウントされます:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
`0` の場合は制限なしを意味します。
:::

**例**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```

## max&#95;view&#95;num&#95;to&#95;warn {#max_view_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="10000" />

アタッチされているビューの数が指定された値を超えると、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに記録します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に待機状態となるクエリの総数の上限。
待機中のクエリの実行は、必要なテーブルが非同期で読み込まれている間はブロックされます（[`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases) を参照）。

:::note
待機中のクエリは、以下の設定で制御される制限をチェックする際にはカウントされません。

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

この調整は、サーバー起動直後にこれらの制限にすぐに達してしまうことを避けるために行われます。
:::

:::note

値 `0`（デフォルト）は無制限を意味します。

この設定は実行時に変更でき、直ちに有効になります。すでに実行中のクエリには影響しません。
:::

## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />

jemalloc や cgroups などの外部ソースからの情報に基づいて、バックグラウンドのメモリワーカーが内部メモリトラッカーを補正するかどうかを制御します。

## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

バックグラウンドのメモリワーカーのティック間隔を指定します。このワーカーはメモリトラッカーによるメモリ使用量を補正し、メモリ使用量が高い場合に未使用ページをクリーンアップします。0 に設定すると、メモリ使用元に応じてデフォルト値が使用されます。

## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />現在の cgroup メモリ使用量情報を利用して、メモリトラッキングを補正します。

## merge&#95;tree {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの細かなチューニングを行うための設定です。

詳細については、`MergeTreeSettings.h` ヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />

マージ処理とその他のワークロードとの間で、リソースの利用および共有を制御するために使用します。指定した値は、すべてのバックグラウンドマージに対する `workload` 設定値として使用されます。MergeTree の設定で上書きできます。

**関連項目**

- [ワークロードスケジューリング](/operations/workload-scheduling.md)

## merges&#95;mutations&#95;memory&#95;usage&#95;soft&#95;limit {#merges_mutations_memory_usage_soft_limit}

<SettingsInfoBlock type="UInt64" default_value="0" />

マージおよびミューテーション処理の実行に使用できる RAM の上限を設定します。
ClickHouse がこの上限に達すると、新しいバックグラウンドのマージやミューテーション処理はスケジュールされなくなりますが、すでにスケジュール済みのタスクの実行は継続されます。

:::note
`0` の値は無制限を意味します。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```

## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />

デフォルト値 `merges_mutations_memory_usage_soft_limit` は、`memory_amount * merges_mutations_memory_usage_to_ram_ratio` で計算されます。

**関連項目:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric&#95;log {#metric_log}

デフォルトでは無効になっています。

**有効化**

メトリクスの履歴収集 [`system.metric_log`](../../operations/system-tables/metric_log.md) を手動で有効化するには、以下の内容を記述した `/etc/clickhouse-server/config.d/metric_log.xml` を作成します。

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

`metric_log` の設定を無効化するには、次の内容で `/etc/clickhouse-server/config.d/disable_metric_log.xml` ファイルを作成します：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

接続を切断するかどうかを判断するための、OS における CPU の待機時間（`OSCPUWaitMicroseconds` メトリクス）とビジー時間（`OSCPUVirtualTimeMicroseconds` メトリクス）の最小比率です。切断確率を計算するために、最小比率と最大比率の間で線形補間が使用され、この比率では確率は 0 になります。
詳細は [サーバー CPU 過負荷時の動作制御](/operations/settings/server-overload) を参照してください。

## mlock&#95;executable {#mlock_executable}

起動後に `mlockall` を実行し、最初のクエリのレイテンシを低減し、高い I/O 負荷時に ClickHouse 実行ファイルがページアウトされるのを防ぎます。

:::note
このオプションを有効にすることは推奨されますが、その場合、起動時間が最大で数秒ほど長くなります。
また、この設定は「CAP&#95;IPC&#95;LOCK」ケーパビリティが付与されていないと機能しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```

## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

この設定により、頻繁な open/close 呼び出し（それに伴うページフォルトのため非常にコストが高い）を回避し、複数のスレッドやクエリ間でマッピングを再利用できます。設定値はマッピングされた領域の数（通常はマッピングされたファイル数と同じ）を表します。

マッピングされたファイル内のデータ量は、次のシステムテーブルの以下のメトリクスで監視できます。

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` in [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` in [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
マッピングされたファイル内のデータ量はメモリを直接消費せず、クエリやサーバーのメモリ使用量にも計上されません。これは、このメモリが OS のページキャッシュと同様に破棄可能であるためです。キャッシュは、MergeTree ファミリーのテーブルで古いパーツが削除されるとき（ファイルがクローズされるとき）に自動的にドロップされ、`SYSTEM DROP MMAP CACHE` クエリにより手動でドロップすることもできます。

この設定は実行時に変更でき、即座に有効になります。
:::

## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />

ミューテーションとその他のワークロード間で、リソースの利用および共有を制御するために使用します。指定した値は、すべてのバックグラウンドミューテーションで `workload` 設定の値として使用されます。MergeTree の設定で上書きできます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## mysql&#95;port {#mysql_port}

MySQL プロトコルでクライアントと通信するためのポート。

:::note

* 正の整数は待ち受けるポート番号を指定します
* 空値は、MySQL プロトコルでのクライアントとの通信を無効にするために使用されます
  :::

**例**

```xml
<mysql_port>9004</mysql_port>
```

## mysql_require_secure_transport {#mysql_require_secure_transport} 

true に設定されている場合、[mysql_port](#mysql_port) を介したクライアントとのセキュアな通信が必須になります。`--ssl-mode=none` オプションでの接続は拒否されます。[OpenSSL](#openssl) の設定と併用してください。

## openSSL {#openssl} 

SSL クライアント/サーバー構成。

SSL のサポートは `libpoco` ライブラリによって提供されます。利用可能な構成オプションについては [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) を参照してください。デフォルト値は [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) で確認できます。

サーバー/クラアイント構成用のキー:

| オプション                         | 概要                                                                                                                                                                                                                                                                                                                                     | デフォルト値                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 証明書の秘密鍵ファイルへのパス。このファイルには、鍵と証明書の両方を同時に含めることができます。                                                                                                                                                                                                                                                                                   |                                                                                            |
| `certificateFile`             | PEM 形式のクライアント／サーバー証明書ファイルへのパス。`privateKeyFile` に証明書が含まれている場合は指定を省略できます。                                                                                                                                                                                                                                                                |                                                                                            |
| `caConfig`                    | 信頼された CA 証明書を含むファイルまたはディレクトリへのパス。ファイルを指す場合、そのファイルは PEM 形式でなければならず、複数の CA 証明書を含めることができます。ディレクトリを指す場合、そのディレクトリには CA 証明書ごとに 1 つの .pem ファイルを含める必要があります。ファイル名は CA サブジェクト名のハッシュ値で解決されます。詳細は [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) の man ページを参照してください。 |                                                                                            |
| `verificationMode`            | ノード証明書の検証方法です。詳細は [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明を参照してください。設定可能な値: `none`, `relaxed`, `strict`, `once`。                                                                                                                                              | `relaxed`                                                                                  |
| `verificationDepth`           | 検証対象となる証明書チェーンの最大長。証明書チェーンの長さが設定値を超えると、検証は失敗します。                                                                                                                                                                                                                                                                                       | `9`                                                                                        |
| `loadDefaultCAFile`           | OpenSSL で組み込み CA 証明書を使用するかどうかを指定します。ClickHouse は、組み込み CA 証明書がファイル `/etc/ssl/cert.pem`（またはディレクトリ `/etc/ssl/certs`）か、環境変数 `SSL_CERT_FILE`（または `SSL_CERT_DIR`）で指定されたファイル（またはディレクトリ）に存在すると想定します。                                                                                                                                           | `true`                                                                                     |
| `cipherList`                  | サポートされている OpenSSL の暗号スイート                                                                                                                                                                                                                                                                                                              | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | セッションのキャッシュを有効または無効にします。`sessionIdContext` と組み合わせて使用する必要があります。指定可能な値: `true`, `false`。                                                                                                                                                                                                                                                 | `false`                                                                                    |
| `sessionIdContext`            | サーバーが生成する各識別子に付加する、一意なランダム文字列です。文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはなりません。サーバー側でセッションをキャッシュする場合にも、クライアントがキャッシュを要求した場合にも問題を回避できるため、このパラメータの指定を常に推奨します。                                                                                                                                                                         | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | サーバーがキャッシュするセッションの最大数です。値を `0` にすると、セッション数は無制限になります。                                                                                                                                                                                                                                                                                   | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | セッションをサーバー側にキャッシュしておく時間（時間単位）。                                                                                                                                                                                                                                                                                                         | `2`                                                                                        |
| `extendedVerification`        | 有効にした場合は、証明書の CN または SAN がピアのホスト名と一致していることを確認してください。                                                                                                                                                                                                                                                                                   | `false`                                                                                    |
| `requireTLSv1`                | TLSv1 接続を必須とします。有効な値: `true`, `false`。                                                                                                                                                                                                                                                                                                 | `false`                                                                                    |
| `requireTLSv1_1`              | TLSv1.1 接続を必須とします。指定可能な値：`true`、`false`。                                                                                                                                                                                                                                                                                               | `false`                                                                                    |
| `requireTLSv1_2`              | TLSv1.2 接続を必須とします。許容値: `true`、`false`。                                                                                                                                                                                                                                                                                                 | `false`                                                                                    |
| `fips`                        | OpenSSL の FIPS モードを有効にします。ライブラリで使用している OpenSSL のバージョンが FIPS をサポートしている場合にのみ有効です。                                                                                                                                                                                                                                                        | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandler のサブクラス）。たとえば、`<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>` のように指定します。                                                                                                       | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するためのクラス（CertificateHandler のサブクラス）。例：`<invalidCertificateHandler><name>RejectCertificateHandler</name></invalidCertificateHandler>`。                                                                                                                                                                                         | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 使用が禁止されているプロトコル。                                                                                                                                                                                                                                                                                                                       |                                                                                            |
| `preferServerCiphers`         | サーバー側暗号スイート（クライアント優先）。                                                                                                                                                                                                                                                                                                                 | `false`                                                                                    |

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

<SettingsInfoBlock type="UInt64" default_value="1000000" />CPU が有用な処理を行っていると見なすための、OS の CPU ビジー時間（OSCPUVirtualTimeMicroseconds メトリクス）に対する閾値（マイクロ秒単位）です。ビジー時間がこの値未満の場合は、CPU が過負荷状態であるとは見なされません。

## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

<SettingsInfoBlock type="Int32" default_value="0" />

分散キャッシュ TCP ハンドラーのスレッドに対する Linux の nice 値です。値が小さいほど CPU の優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要です。付与されていない場合は何も行われません (no-op) となります。

取りうる値の範囲: -20 〜 19。

## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

<SettingsInfoBlock type="Int32" default_value="0" />

マージおよびミューテーションスレッドに対する Linux の nice 値です。値が低いほど CPU 優先度は高くなります。

CAP_SYS_NICE ケーパビリティが必要です。ない場合は設定は無効になります。

取り得る値: -20 〜 19。

## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

<SettingsInfoBlock type="Int32" default_value="0" />

ZooKeeper クライアントの送受信スレッドに対する Linux の nice 値です。値が小さいほど CPU の優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要です。ない場合は何も行われません。

取りうる値: -20 〜 19。

## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />ユーザー空間のページキャッシュには使わずに空けておくメモリ制限値に対する割合。Linux の `min_free_kbytes` の設定に相当します。

## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />解放されたメモリがユーザー空間のページキャッシュで利用可能になるまでの遅延時間。

## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />ユーザー空間ページキャッシュの最大サイズです。キャッシュを無効にするには 0 を設定します。この値が `page_cache_min_size` より大きい場合、キャッシュサイズはこの範囲内で継続的に調整され、合計メモリ使用量が上限（`max_server_memory_usage[_to_ram_ratio]`）を下回るように保ちつつ、利用可能なメモリの大部分を使用するようになります。

## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />ユーザー空間ページキャッシュの最小サイズ。

## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ユーザー空間ページキャッシュのポリシー名。

## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />ミューテックス競合を減らすため、ユーザー空間ページキャッシュをこの数の分片にストライプします。実験的な機能であり、性能向上が見込める可能性は低いです。

## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />ユーザースペースページキャッシュ内の保護キューのサイズを、キャッシュ全体のサイズに対する比率で指定します。

## part&#95;log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) に関連するログイベントを記録します。たとえば、データの追加やマージなどです。ログを使用してマージアルゴリズムをシミュレートし、その特性を比較できます。マージ処理を可視化することもできます。

クエリは、別のファイルではなく [system.part&#95;log](/operations/system-tables/part_log) テーブルに記録されます。このテーブル名は `table` パラメータで構成できます（後述）。

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

SharedMergeTree のパーツを完全に削除するまでの期間。ClickHouse Cloud でのみ利用できます。

## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

非常に多数のテーブルがある場合に、サンダリング・ハード (thundering herd) 問題が発生して ZooKeeper が DoS 状態になることを避けるために、kill_delay_period に 0〜x 秒の範囲で一様分布に従う値を加算します。ClickHouse Cloud でのみ利用可能です。

## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />

共有された MergeTree の不要なパーツをクリーンアップするためのスレッド数です。ClickHouse Cloud でのみ利用可能です。

## path {#path}

データを格納しているディレクトリへのパス。

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

* 正の整数は待ち受けるポート番号を指定します。
* 空値は、PostgreSQL プロトコル経由でのクライアントとの通信を無効にするために使用されます。
  :::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```

## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

true に設定すると、[postgresql_port](#postgresql_port) 経由でクライアントとのセキュアな通信が必須になります。`sslmode=disable` オプションでの接続は拒否されます。[OpenSSL](#openssl) の設定と併用してください。

## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />リモートオブジェクトストレージ用プリフェッチのバックグラウンドプールのサイズ

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />プリフェッチ用プールに投入可能なタスクの最大数

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

prefixes deserialization スレッドプールでスケジュール可能なジョブの最大数。

:::note
値が `0` の場合は無制限を意味します。
:::

## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定されている場合、ClickHouse は起動前に設定されているすべての `system.*_log` テーブルを作成します。これらのテーブルに依存する起動スクリプトがある場合に有用です。

## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />プライマリ索引キャッシュポリシーの名前です。

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />プリウォーム時にマークキャッシュの合計サイズのうち、どの程度を事前に読み込むかを指定する比率です。

## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />プライマリ索引（MergeTree ファミリーのテーブルの索引）用キャッシュの最大サイズ。

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />プライマリ索引キャッシュにおいて、保護キュー（SLRU ポリシーの場合）のサイズがキャッシュ全体サイズに対して占める比率。

## process&#95;query&#95;plan&#95;packet {#process_query_plan_packet}

<SettingsInfoBlock type="Bool" default_value="0" />

この設定を有効にすると、QueryPlan パケットを読み込めるようになります。このパケットは、`serialize_query_plan` が有効な場合に分散クエリ向けに送信されます。
クエリプランのバイナリデシリアライズ処理に存在するバグに起因するセキュリティ上の問題を避けるため、デフォルトでは無効になっています。

**例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```

## processors&#95;profile&#95;log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) システムテーブルの設定です。

<SystemLogParameters />

既定の設定は以下のとおりです。

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

[Prometheus](https://prometheus.io) からスクレイプされるメトリクスデータを公開します。

Settings:

* `endpoint` – Prometheus サーバーがメトリクスをスクレイプするための HTTP エンドポイント。先頭は &#39;/&#39; とします。
* `port` – `endpoint` 用のポート。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルのメトリクスを公開します。
* `events` – [system.events](/operations/system-tables/events) テーブルのメトリクスを公開します。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開します。
* `errors` - 直近のサーバー再起動以降に発生した、エラーコードごとのエラー発生回数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。

**Example**

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

次を確認します（`127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えてください）:

```bash
curl 127.0.0.1:9363/metrics
```

## proxy {#proxy}

HTTP および HTTPS リクエスト用のプロキシサーバーを定義します。現在、S3 ストレージ、S3 テーブル関数、および URL 関数で利用できます。

プロキシサーバーを定義する方法は 3 つあります。

* 環境変数
* プロキシリスト
* リモートプロキシリゾルバー

特定のホストについては、`no_proxy` を使用してプロキシサーバーをバイパスすることもできます。

**環境変数**

`http_proxy` および `https_proxy` 環境変数を使用すると、特定のプロトコルに対して
プロキシサーバーを指定できます。これらがシステムに設定されていれば、そのまま利用できます。

これは、あるプロトコルに対してプロキシサーバーが 1 つだけであり、そのプロキシサーバーが変更されない場合に最も簡単な方法です。

**プロキシリスト**

この方法では、あるプロトコルに対して 1 つ以上の
プロキシサーバーを指定できます。複数のプロキシサーバーが定義されている場合、
ClickHouse は異なるプロキシをラウンドロビン方式で使用し、サーバー間で
負荷を分散します。これは、あるプロトコルに対して複数の
プロキシサーバーが存在し、プロキシサーバーのリストが変更されない場合に最も簡単な方法です。

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
    | フィールド     | 説明                    |
    | --------- | --------------------- |
    | `<http>`  | 1 つ以上の HTTP プロキシのリスト  |
    | `<https>` | 1 つ以上の HTTPS プロキシのリスト |
  </TabItem>

  <TabItem value="http_https" label="<http> と <https>">
    | フィールド   | 説明        |
    | ------- | --------- |
    | `<uri>` | プロキシの URI |
  </TabItem>
</Tabs>

**リモートプロキシリゾルバ**

プロキシサーバーが動的に変化することがあります。その場合は、リゾルバのエンドポイントを定義できます。ClickHouse はそのエンドポイントに空の GET リクエストを送信し、リモートリゾルバはプロキシホストを返す必要があります。
ClickHouse はそれを使用して、次のテンプレートに従ってプロキシ URI を生成します: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

以下のタブで親フィールドを選択すると、その子フィールドが表示されます:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description          |
    | --------- | -------------------- |
    | `<http>`  | 1つ以上の resolver のリスト* |
    | `<https>` | 1つ以上の resolver のリスト* |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Field        | Description              |
    | ------------ | ------------------------ |
    | `<resolver>` | resolver のエンドポイントとその他の詳細 |

    :::note
    複数の `<resolver>` 要素を指定できますが、特定のプロトコルについて実際に使用されるのは最初の
    `<resolver>` だけです。そのプロトコルに対するその他の `<resolver>`
    要素は無視されます。つまり、(必要な場合は) 負荷分散はリモート側の resolver で実装する必要があります。
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | Field                | Description                                                                                                         |
    | -------------------- | ------------------------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | プロキシ resolver の URI                                                                                                 |
    | `<proxy_scheme>`     | 最終的なプロキシ URI のプロトコル。`http` または `https` のいずれかを指定できます。                                                                |
    | `<proxy_port>`       | プロキシ resolver のポート番号                                                                                                |
    | `<proxy_cache_time>` | resolver から取得した値を ClickHouse がキャッシュする秒数。この値を `0` に設定すると、ClickHouse はすべての HTTP および HTTPS リクエストごとに resolver に問い合わせます。 |
  </TabItem>
</Tabs>

**Precedence**

プロキシ設定は次の優先順位で決定されます。

| Order | Setting           |
| ----- | ----------------- |
| 1.    | リモートプロキシ resolver |
| 2.    | プロキシリスト           |
| 3.    | 環境変数              |

ClickHouse は、リクエストプロトコルに対して、最も優先度の高い resolver の種類を確認します。定義されていなければ、
環境 resolver に到達するまで、次に優先度の高い resolver の種類を順に確認します。
これにより、複数種類の resolver を併用することも可能になります。

## query&#95;cache {#query_cache}

[Query cache](../query-cache.md) の設定。

利用可能な設定は以下のとおりです。

| Setting                   | Description                                  | Default Value |
| ------------------------- | -------------------------------------------- | ------------- |
| `max_size_in_bytes`       | キャッシュの最大サイズ（バイト単位）。`0` の場合、クエリキャッシュは無効化されます。 | `1073741824`  |
| `max_entries`             | キャッシュに保存される `SELECT` クエリ結果の最大件数。             | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存できる `SELECT` クエリ結果の最大サイズ（バイト単位）。     | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存できる `SELECT` クエリ結果の最大行数。             | `30000000`    |

:::note

* 設定の変更は直ちに有効になります。
* クエリキャッシュ用のデータは DRAM 上に確保されます。メモリが逼迫している場合は、`max_size_in_bytes` を小さい値に設定するか、クエリキャッシュを無効化するようにしてください。
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

クエリ条件キャッシュの最大サイズ。
:::note
このSETTINGは実行時に変更でき、その変更は即座に反映されます。
:::

## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />クエリ条件キャッシュにおける保護キューのサイズ（SLRU ポリシーの場合）を、キャッシュ全体のサイズに対する比率で表します。

## query&#95;log {#query_log}

[log&#95;queries=1](../../operations/settings/settings.md) 設定で受信したクエリをログに記録するための設定です。

クエリは別ファイルではなく、[system.query&#95;log](/operations/system-tables/query_log) テーブルに記録されます。`table` パラメータでテーブル名を変更できます（下記参照）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse がテーブルを作成します。ClickHouse サーバーをアップデートした際にクエリログの構造が変更されていた場合は、古い構造のテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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

正規表現に基づくルールで、サーバーログに保存される前にクエリおよびすべてのログメッセージに適用されます。
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブル、およびクライアントへ送信されるログが対象です。これにより、SQL クエリ内の名前、メールアドレス、個人識別子、クレジットカード番号などの機密データがログに漏えいするのを防ぐことができます。

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

**設定項目**:

| Setting   | Description                               |
| --------- | ----------------------------------------- |
| `name`    | ルール名（オプション）                               |
| `regexp`  | RE2 互換の正規表現（必須）                           |
| `replace` | 機密データを置き換えるための文字列（オプション、デフォルトはアスタリスク 6 個） |

マスキングルールはクエリ全体に適用されます（不正な形式の / 解析不能なクエリから機密データが漏えいするのを防ぐため）。

[`system.events`](/operations/system-tables/events) テーブルには `QueryMaskingRulesMatch` カウンタがあり、クエリマスキングルールにマッチした総件数が記録されます。

分散クエリの場合は、各サーバーを個別に設定する必要があります。そうしないと、他ノードに渡されたサブクエリはマスキングされずに保存されます。

## query&#95;metric&#95;log {#query_metric_log}

デフォルトでは無効になっています。

**有効化**

メトリクス履歴の収集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/query_metric_log.xml` を作成します：

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

`query_metric_log` 設定を無効にするには、次の内容でファイル `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` を作成します。

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## query&#95;thread&#95;log {#query_thread_log}

[log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads) 設定を有効にした場合に、受信したクエリのスレッドをログに記録するための設定です。

クエリは、個別のファイルではなく [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) テーブルに記録されます。テーブル名は `table` パラメータで変更できます（下記参照）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse はテーブルを作成します。ClickHouse サーバーのアップグレード時にクエリスレッドログの構造が変更された場合は、古い構造のテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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

[log&#95;query&#95;views=1](/operations/settings/settings#log_query_views) 設定により受信したクエリに応じて、ビュー（ライブビュー、マテリアライズドビューなど）をログに記録するための設定です。

クエリは、別ファイルではなく [system.query&#95;views&#95;log](/operations/system-tables/query_views_log) テーブルに記録されます。`table` パラメータ（後述）でテーブル名を変更できます。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse が作成します。ClickHouse サーバーのアップデート時に query views ログの構造が変更された場合は、古い構造のテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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

マシンコード（「text」）用メモリをヒュージページを用いて再割り当てするための設定です。

:::note
この機能は非常に実験的なものです。
:::

例:

```xml
<remap_executable>false</remap_executable>
```

## remote&#95;servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンおよび `cluster` テーブル関数で使用されるクラスタの設定。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性の設定値については、「[Configuration files](/operations/configuration-files)」セクションを参照してください。

**関連項目**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Cluster Discovery](../../operations/cluster-discovery.md)
* [Replicated database engine](../../engines/database-engines/replicated.md)

## remote&#95;url&#95;allow&#95;hosts {#remote_url_allow_hosts}

URL 関連のストレージエンジンおよびテーブル関数で使用を許可するホストの一覧を指定します。

`\<host\>` XML タグでホストを追加する場合:

* 名前解決 (DNS 解決) の前に名前がチェックされるため、URL 内に記載されているものと完全に同一に指定する必要があります。例: `<host>clickhouse.com</host>`
* URL 内でポートが明示的に指定されている場合は、host:port 全体が一体としてチェックされます。例: `<host>clickhouse.com:80</host>`
* ホストをポートなしで指定した場合、そのホストの任意のポートが許可されます。例: `<host>clickhouse.com</host>` が指定されている場合、`clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) などが許可されます。
* ホストを IP アドレスとして指定した場合は、URL に記載されているとおりの形でチェックされます。例: `[2a02:6b8:a::a]`。
* リダイレクトが存在し、リダイレクトのサポートが有効になっている場合は、すべてのリダイレクト (location フィールド) がチェックされます。

例:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## replica&#95;group&#95;name {#replica_group_name}

Replicated データベース用のレプリカグループ名。

Replicated データベースによって作成されるクラスターは、同じグループ内のレプリカで構成されます。
DDL クエリは同じグループ内のレプリカのみを待機します。

デフォルトは空です。

**例**

```xml
<replica_group_name>バックアップ</replica_group_name>
```

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />パーツのフェッチ要求に対する HTTP 接続のタイムアウトです。明示的に設定されていない場合は、デフォルトプロファイルの `http_connection_timeout` を継承します。

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />フェッチパーツリクエストに対する HTTP 受信タイムアウト。明示的に設定しない場合は、デフォルトプロファイルの `http_receive_timeout` の値を継承します。

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />パーツ取得リクエストに対する HTTP 送信タイムアウト。明示的に設定されていない場合は、デフォルトプロファイル `http_send_timeout` の値が継承されます。

## replicated&#95;merge&#95;tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブル向けの微調整用設定です。この設定が優先されます。

詳細については、ヘッダーファイル `MergeTreeSettings.h` を参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```

## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />RESTORE リクエストの実行に使用されるスレッドの最大数。

## s3_credentials_provider_max_cache_size {#s3_credentials_provider_max_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />キャッシュできる S3 資格情報プロバイダの最大数

## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />S3 リダイレクトに対して許可されるホップ数の最大値。

## s3_retry_attempts {#s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="500" />Aws::Client::RetryStrategy 用の設定です。Aws::Client 自体がリトライを行い、0 はリトライしないことを意味します。

## s3queue_disable_streaming {#s3queue_disable_streaming} 

<SettingsInfoBlock type="Bool" default_value="0" />テーブルが作成済みでマテリアライズドビューがアタッチされている場合でも、S3Queue のストリーミングを無効化します

## s3queue&#95;log {#s3queue_log}

`s3queue_log` システムテーブルに関する設定です。

<SystemLogParameters />

既定の設定は次のとおりです。

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```

## send&#95;crash&#95;reports {#send_crash_reports}

ClickHouse コア開発チームにクラッシュレポートを送信するための設定です。

特に本番導入前の環境では、有効化しておくことを強く推奨します。

Keys:

| Key                   | Description                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| `enabled`             | 機能を有効にするかどうかを制御するブール型フラグです。デフォルトは `true` です。クラッシュレポートを送信したくない場合は `false` に設定します。                        |
| `send_logical_errors` | `LOGICAL_ERROR` は `assert` のようなもので、ClickHouse のバグを示します。このブール型フラグは、これらの例外を送信するかどうかを制御します（デフォルト: `true`）。 |
| `endpoint`            | クラッシュレポートの送信先エンドポイント URL を上書きできます。                                                                      |

**推奨される使い方**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />

`generateSerialID` 関数によって生成される、自動インクリメント番号付きの Keeper 内のパスです。各シリーズはこのパス配下のノードになります。

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />true に設定すると、スタックトレースにアドレスを表示します

## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />true に設定すると、ClickHouse はシャットダウン前に、実行中のバックアップおよびリストアが完了するまで待機します。

## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />未完了のクエリが終了するまで待機する秒数

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />true に設定すると、ClickHouse はシャットダウン前に実行中のクエリが完了するまで待機します。

## skip_binary_checksum_checks {#skip_binary_checksum_checks} 

<SettingsInfoBlock type="Bool" default_value="0" />ClickHouse バイナリに対するチェックサム整合性検証をスキップします

## ssh&#95;server {#ssh_server}

ホストキーの公開鍵部分は、最初の接続時に SSH クライアント側の known&#95;hosts ファイルに書き込まれます。

Host Key Configurations はデフォルトでは無効になっています。
ホストキー設定のコメントアウトを外し、対応する ssh キーへのパスを指定して有効化してください：

例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />マテリアライズドビュー作成の遅延をシミュレートするためのデバッグ用パラメータ。

## storage&#95;configuration {#storage_configuration}

ストレージの複数ディスク構成を行えるようにします。

ストレージ構成は次の構造になります：

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

上記のサブタグでは、`disks` に対して次の設定を定義します。

| Setting                 | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `<disk_name_N>`         | 一意である必要があるディスクの名前。                                            |
| `path`                  | サーバーデータ（`data` および `shadow` カタログ）が保存されるパス。末尾は `/` である必要があります。 |
| `keep_free_space_bytes` | ディスク上で予約しておく空き領域のサイズ。                                         |

:::note
ディスクの順序は問いません。
:::

### ポリシーの設定 {#configuration-of-policies}

上記のサブタグは、`policies` に対して次の設定を定義します。

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシー名。ポリシー名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `volume_name_N`              | ボリューム名。ボリューム名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `disk`                       | ボリューム内にあるディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `max_data_part_size_bytes`   | このボリューム内の任意のディスク上に存在できるデータ chunk の最大サイズ。マージの結果として予測される chunk サイズが `max_data_part_size_bytes` を超える場合、その chunk は次のボリュームに書き込まれます。基本的に、この機能により、新規 / 小さい chunk をホット (SSD) ボリュームに保存し、大きなサイズに達したときにコールド (HDD) ボリュームへ移動できます。ポリシーにボリュームが 1 つしかない場合、このオプションは使用しないでください。                                                                 |
| `move_factor`                | ボリューム上の利用可能な空き容量の割合。空き容量がこの割合を下回ると、（存在する場合は）次のボリュームへデータの移動が開始されます。移動の際、chunk はサイズの大きいものから小さいものへ（降順で）ソートされ、合計サイズが `move_factor` の条件を満たす chunk が選択されます。すべての chunk を合わせても条件を満たせない場合は、すべての chunk が移動されます。                                                                                                             |
| `perform_ttl_move_on_insert` | 挿入時の有効期限 (TTL) 切れデータの移動を無効にします。デフォルト（有効な場合）では、すでに TTL に基づく移動ルールに従って有効期限切れとなっているデータを挿入すると、即座にその移動ルールで指定されたボリューム / ディスクに移動されます。ターゲットのボリューム / ディスクが遅い場合（例: S3）、これは挿入処理を大きく低速化する可能性があります。無効にした場合、有効期限切れのデータ部分はいったんデフォルトのボリュームに書き込まれ、その後すぐに有効期限 (TTL) 用ルールで指定されたボリュームに移動されます。 |
| `load_balancing`             | ディスクのバランシングポリシー。`round_robin` または `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `least_used_ttl_ms`          | すべてのディスク上の利用可能な空き容量を更新するためのタイムアウト（ミリ秒）を設定します（`0` - 常に更新、`-1` - 一切更新しない、デフォルト値は `60000`）。ディスクが ClickHouse のみで使用され、ファイルシステムのオンラインリサイズの対象とならない場合は、`-1` を使用できます。その他のケースでは、最終的に誤った容量割り当てにつながるため、推奨されません。                                                                                                                   |
| `prefer_not_to_merge`        | このボリューム上のデータパーツのマージを無効にします。注意: これは潜在的に有害で、パフォーマンス低下を引き起こす可能性があります。この設定を有効にすると（推奨しません）、このボリューム上でのデータマージは禁止されます（これは好ましくありません）。これにより、ClickHouse が低速ディスクとどのようにやり取りするかを制御できますが、基本的には使用しないことを推奨します。                                                                                                                        |
| `volume_priority`            | ボリュームが埋められる優先度（順序）を定義します。値が小さいほど優先度が高くなります。パラメータ値は自然数であり、1 から N（N は指定されたパラメータ値の最大値）までの範囲を欠番なくカバーしている必要があります。                                                                                                                                                                                                                                                       |

`volume_priority` について:

- すべてのボリュームにこのパラメータが設定されている場合、指定された順序で優先されます。
- _一部の_ ボリュームのみに設定されている場合、設定されていないボリュームは最も低い優先度になります。設定されているボリュームはタグ値に従って優先され、それ以外のボリュームは設定ファイル内での記述順によって相互の優先度が決まります。
- _どの_ ボリュームにもこのパラメータが設定されていない場合、設定ファイル内での記述順によって順序が決まります。
- ボリュームの優先度は、同一である必要はありません。

## storage_connections_hard_limit {#storage_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限に達した状態で新規作成を行おうとすると、例外がスローされます。ハードリミットを無効にするには 0 に設定します。この制限はストレージの接続に適用されます。

## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この上限を超えた接続の有効期間 (TTL) は大幅に短くなります。この上限はストレージへの接続に適用されます。

## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />この上限を超えた接続は、使用後にリセットされます。接続キャッシュを無効にするには 0 を設定します。この上限はストレージの接続に適用されます。

## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="500" />使用中の接続数がこの上限を超えた場合、警告メッセージがログに書き込まれます。この上限はストレージへの接続に適用されます。

## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="1" />VERSION_FULL_OBJECT_KEY 形式でディスクのメタデータファイルを書き込みます。デフォルトで有効です。この設定は非推奨となっています。

## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />有効にすると、SharedSet と SharedJoin の作成時に内部 UUID が生成されます。ClickHouse Cloud でのみ利用可能です。

## table_engines_require_grant {#table_engines_require_grant} 

true に設定すると、特定のエンジンを使用してテーブルを作成するには、ユーザーに対する GRANT が必要になります（例: `GRANT TABLE ENGINE ON TinyLog to user`）。

:::note
デフォルトでは、後方互換性のため、特定のテーブルエンジンを使用してテーブルを作成する際の GRANT はチェックされませんが、これを true に設定することで、この動作を変更できます。
:::

## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

バックグラウンドプールで非同期ロードジョブを実行するスレッド数を設定します。バックグラウンドプールは、そのテーブルを待っているクエリが存在しない場合に、サーバー起動後にテーブルを非同期でロードするために使用されます。テーブル数が多い場合は、バックグラウンドプール内のスレッド数を少なく保つことが有用な場合があります。これにより、同時クエリ実行のための CPU リソースを確保できます。

:::note
`0` を指定すると、利用可能なすべての CPU が使用されます。
:::

## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

フォアグラウンドプールでロードジョブを実行するスレッド数を設定します。フォアグラウンドプールは、サーバーがポートでの待ち受けを開始する前にテーブルを同期的にロードする場合や、ロード完了を待機しているテーブルをロードする場合に使用されます。フォアグラウンドプールはバックグラウンドプールより高い優先度を持ちます。つまり、フォアグラウンドプールでジョブが実行されている間は、バックグラウンドプールで新たなジョブは開始されません。

:::note
値 `0` の場合は、利用可能なすべての CPU が使用されます。
:::

## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 接続ごとに、接続を閉じるまでに実行を許可されるクエリの最大数です。無制限にするには 0 を設定します。

## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 接続が閉じられるまでの最大存続時間（秒）。接続の存続時間を無制限にするには 0 に設定します。

## tcp&#95;port {#tcp_port}

TCPプロトコル経由でクライアントとの通信に使用するポートです。

**例**

```xml
<tcp_port>9000</tcp_port>
```

## tcp&#95;port&#95;secure {#tcp_port_secure}

クライアントとのセキュアな通信に使用される TCP ポートです。[OpenSSL](#openssl) の設定と併せて使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## tcp&#95;ssh&#95;port {#tcp_ssh_port}

SSH サーバー用のポートです。ユーザーは、このポートを利用して接続し、PTY 上の組み込みクライアントを使って対話的にクエリを実行できます。

例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```

## temporary&#95;data&#95;in&#95;cache {#temporary_data_in_cache}

このオプションを使用すると、一時データは特定のディスクに対応するキャッシュ内に保存されます。
このセクションでは、タイプが `cache` のディスク名を指定する必要があります。
その場合、キャッシュと一時データは同じ領域を共有し、一時データを作成するためにディスクキャッシュが追い出されることがあります。

:::note
一時データの保存を構成する際に使用できるオプションは、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか 1 つだけです。
:::

**例**

`local_disk` 用のキャッシュと一時データの両方が、ファイルシステム上の `/tiny_local_cache` に保存され、`tiny_local_cache` によって管理されます。

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

<SettingsInfoBlock type="Bool" default_value="0" />一時データを分散キャッシュに保存するかどうかを制御します。

## text_index_dictionary_block_cache_max_entries {#text_index_dictionary_block_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />テキスト索引用Dictionaryブロックのキャッシュサイズ（エントリ数）。0 を指定すると無効になります。

## テキスト索引 Dictionary ブロックキャッシュポリシー {#text_index_dictionary_block_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキスト索引 Dictionary のブロックキャッシュポリシー名。

## text_index_dictionary_block_cache_size {#text_index_dictionary_block_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />テキスト索引用のDictionaryブロックキャッシュのサイズです。0 に設定すると無効になります。

:::note
この設定は実行時に変更でき、即座に有効になります。
:::

## text_index_dictionary_block_cache_size_ratio {#text_index_dictionary_block_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキスト索引 Dictionary のブロックキャッシュにおける、保護キュー（SLRU ポリシーの場合）のサイズを、キャッシュ全体サイズに対する比率で指定します。

## text_index_header_cache_max_entries {#text_index_header_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="100000" />テキスト索引ヘッダー用キャッシュのサイズ（エントリ数）。0 の場合はキャッシュは無効になります。

## text_index_header_cache_policy {#text_index_header_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキスト索引ヘッダーのキャッシュポリシー名。

## text_index_header_cache_size {#text_index_header_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />テキストインデックスヘッダー用キャッシュのサイズ。0 の場合は無効になります。

:::note
この設定は実行時に変更可能で、即座に反映されます。
:::

## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキストインデックスヘッダーキャッシュにおいて、SLRU ポリシー使用時の保護キューのサイズを、キャッシュ全体サイズに対する比率で指定します。

## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />テキストインデックスのポスティングリスト用キャッシュのサイズ（エントリ数）。0 の場合は無効です。

## text_index_postings_cache_policy {#text_index_postings_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキスト索引のポスティングリストキャッシュポリシーの名前です。

## text_index_postings_cache_size {#text_index_postings_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="2147483648" />テキストインデックスのポスティングリスト用キャッシュのサイズです。0 の場合は無効になります。

:::note
この設定は実行時に変更でき、直ちに反映されます。
:::

## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキストインデックスのポスティングリストキャッシュにおいて、SLRU ポリシーを使用する場合の保護キューのサイズを、キャッシュ全体のサイズに対する比率で指定します。

## text&#95;log {#text_log}

テキストメッセージをログに記録するための [text&#95;log](/operations/system-tables/text_log) システムテーブルの設定です。

<SystemLogParameters />

加えて、次の設定があります：

| 設定項目    | 説明                                           | デフォルト値  |
| ------- | -------------------------------------------- | ------- |
| `level` | テーブルに保存されるメッセージの最大レベル（デフォルトは `Trace`）を指定します。 | `Trace` |

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

グローバルスレッドプールにスケジュールできるジョブの最大数です。キューサイズを増やすとメモリ使用量が増加します。この値は [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size) と同じにすることを推奨します。

:::note
`0` を指定すると無制限になります。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />`local_filesystem_read_method = 'pread_threadpool'` の場合に、ローカルファイルシステムからの読み取りに使用するスレッドプールのスレッド数。

## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />ローカルファイルシステムからの読み取りを行うスレッドプールに対してスケジュール可能なジョブの最大数。

## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />`remote_filesystem_read_method = 'threadpool'` の場合に、リモートファイルシステムからの読み取りに使用されるスレッドプールのスレッド数。

## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />リモートファイルシステムの読み取りを行うためにスレッドプール上でスケジュール可能なジョブの最大数。

## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />オブジェクトストレージへの書き込みリクエストを処理するバックグラウンドプールのサイズ

## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />オブジェクトストレージへの書き込みリクエスト用にバックグラウンドプールへ投入できるタスクの最大数

## throw&#95;on&#95;unknown&#95;workload {#throw_on_unknown_workload}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ SETTING `workload` で参照される不明な WORKLOAD へのアクセス時の挙動を定義します。

* `true` の場合、不明な WORKLOAD へアクセスしようとしたクエリから RESOURCE&#95;ACCESS&#95;DENIED 例外がスローされます。WORKLOAD の階層が確立され、WORKLOAD default を含むようになった後に、すべてのクエリに対してリソーススケジューリングを強制するのに有用です。
* `false`（デフォルト）の場合、不明な WORKLOAD を指す `workload` SETTING を持つクエリには、リソーススケジューリングなしで無制限のアクセスが許可されます。これは、WORKLOAD 階層を構成している段階で、WORKLOAD default が追加される前に重要です。

**Example**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**関連項目**

* [ワークロードのスケジューリング](/operations/workload-scheduling.md)

## timezone {#timezone}

サーバーのタイムゾーン。

UTC または地理的な場所を表す IANA タイムゾーン識別子として指定します（例: Africa/Abidjan）。

タイムゾーンは、DateTime 型フィールドをテキスト形式（画面表示やファイル出力）に変換する際や、文字列から DateTime を取得する際に、String と DateTime の形式を相互変換するために必要です。また、入力パラメータとしてタイムゾーンを受け取らない日付や時刻を扱う関数でも、タイムゾーンが使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連項目**

* [session&#95;timezone](../settings/settings.md#session_timezone)

## tmp&#95;path {#tmp_path}

大規模なクエリを処理するための一時データを保存する、ローカルファイルシステム上のパス。

:::note

* 一時データの保存方法を構成するために指定できるオプションは、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか 1 つのみです。
* パスの末尾のスラッシュは必須です。
  :::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## tmp&#95;policy {#tmp_policy}

一時データ用ストレージのポリシーです。`tmp` プレフィックスを持つすべてのファイルは起動時に削除されます。

:::note
`tmp_policy` としてオブジェクトストレージを使用する際の推奨事項:

* 各サーバーごとに別々の `bucket:path` を使用する
* `metadata_type=plain` を使用する
* このバケットに対して有効期限 (TTL) を設定することも検討してください
  :::

:::note

* 一時データストレージを構成するために使用できるオプションは `tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか 1 つだけです。
* `move_factor`、`keep_free_space_bytes`、`max_data_part_size_bytes` は無視されます。
* ポリシーはボリュームを *ちょうど 1 つだけ* 持つ必要があります。

詳細については [MergeTree テーブルエンジン](/engines/table-engines/mergetree-family/mergetree) のドキュメントを参照してください。
:::

**例**

`/disk1` が満杯になった場合、一時データは `/disk2` に保存されます。

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

追加するカスタムトップレベルドメインのリストを定義します。各エントリは `<name>/path/to/file</name>` という形式です。

例えば:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

こちらも参照してください:

* 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) およびそのバリエーション。
  これらはカスタム TLD リスト名を引数に取り、トップレベルドメインから最初の有意なサブドメインまでを含むドメイン部分を返します。

## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />`total_memory_profiler_sample_probability` に等しい確率で、サイズが指定値以下のメモリアロケーションをランダムに収集します。0 は無効を意味します。このしきい値が期待どおりに機能するようにするには、`max_untracked_memory` を 0 に設定することを検討してください。

## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />`total_memory_profiler_sample_probability` と同じ確率で、指定した値以上のサイズのランダムなメモリアロケーションを収集します。0 は無効を意味します。このしきい値を想定どおりに機能させるには、`max_untracked_memory` を 0 に設定することを推奨します。

## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーのメモリ使用量が、指定したステップごとのバイト数しきい値を超えるたびに、メモリプロファイラは割り当て元のスタックトレースを収集します。0 はメモリプロファイラが無効であることを意味します。数メガバイト未満の値を指定すると、サーバーの動作が遅くなります。

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />

ランダムなメモリアロケーションおよび解放を収集し、指定した確率で `trace_type` が `MemorySample` のレコードとして [system.trace_log](../../operations/system-tables/trace_log.md) システムテーブルに書き込みます。この確率は、アロケーションまたは解放 1 回ごとに適用され、アロケーションサイズには依存しません。サンプリングは、未追跡メモリ量が未追跡メモリの上限（デフォルト値は `4` MiB）を超えた場合にのみ行われることに注意してください。[total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) を小さくすると、この上限も小さくできます。より細かい粒度でサンプリングするには、`total_memory_profiler_step` を `1` に設定できます。

可能な値:

- 正の倍精度浮動小数点数。
- `0` — ランダムなアロケーションおよび解放を `system.trace_log` システムテーブルに書き込む処理を無効にします。

## trace&#95;log {#trace_log}

[trace&#95;log](/operations/system-tables/trace_log) システムテーブルの動作に関する設定です。

<SystemLogParameters />

デフォルトのサーバー設定ファイル `config.xml` には、次の設定セクションが含まれています。

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

<SettingsInfoBlock type="String" default_value="SLRU" />非圧縮キャッシュポリシーの名前。

## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

MergeTree ファミリーのテーブルエンジンで使用される非圧縮データの最大サイズ（バイト単位）。

サーバー全体で 1 つの共有キャッシュがあります。メモリは要求に応じて割り当てられます。オプション `use_uncompressed_cache` が有効な場合にキャッシュが使用されます。

非圧縮キャッシュは、特にごく短時間で完了するクエリに有効です。

:::note
値が `0` の場合は無効であることを意味します。

この設定は実行時に変更でき、即座に反映されます。
:::

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />非圧縮キャッシュにおける保護キューのサイズを、キャッシュ全体のサイズに対する比率で指定します（SLRU ポリシーの場合）。

## url&#95;scheme&#95;mappers {#url_scheme_mappers}

短縮またはシンボリックな URL プレフィックスを完全な URL へマッピングするための設定。

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

ZooKeeper におけるデータパーツヘッダーの保存方法を制御します。この設定は [`MergeTree`](/engines/table-engines/mergetree-family) ファミリーにのみ適用されます。次の場所で指定できます。

**`config.xml` ファイルの [merge_tree](#merge_tree) セクションでグローバルに指定する場合**

ClickHouse はサーバー上のすべてのテーブルに対してこの設定を使用します。設定はいつでも変更できます。既存のテーブルも、設定が変更されるとその挙動が変わります。

**テーブルごとに指定する場合**

テーブルを作成する際に、対応する [engine setting](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) を指定します。この設定をテーブルに個別指定した場合、そのテーブルの挙動は、グローバル設定が変わっても変化しません。

**設定可能な値**

- `0` — 機能を無効にします。
- `1` — 機能を有効にします。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) の場合、[replicated](../../engines/table-engines/mergetree-family/replication.md) テーブルは、データパーツのヘッダーを 1 つの `znode` を用いてコンパクトに保存します。テーブルに多くのカラムが含まれている場合、この保存方式により ZooKeeper に保存されるデータ量を大幅に削減できます。

:::note
`use_minimalistic_part_header_in_zookeeper = 1` を適用した後は、この設定をサポートしていないバージョンの ClickHouse サーバーへダウングレードできません。クラスタ内のサーバーで ClickHouse をアップグレードする際は注意してください。すべてのサーバーを一度にアップグレードしないでください。ClickHouse の新バージョンは、テスト環境、またはクラスタ内の一部のサーバーで試験する方が安全です。

この設定で既に保存されたデータパーツヘッダーは、以前の（非コンパクトな）表現に戻すことはできません。
:::

## user&#95;defined&#95;executable&#95;functions&#95;config {#user_defined_executable_functions_config}

実行可能なユーザー定義関数用の設定ファイルへのパスです。

パス:

* 絶対パス、またはサーバーの設定ファイルからの相対パスを指定します。
* パスにはワイルドカードの * や ? を含めることができます。

参照:

* 「[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)」。

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```

## user&#95;defined&#95;path {#user_defined_path}

ユーザー定義のファイルを格納するディレクトリです。SQL のユーザー定義関数で使用されます。詳しくは [SQL User Defined Functions](/sql-reference/functions/udf) を参照してください。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## user&#95;directories {#user_directories}

以下の設定を含む設定ファイルのセクションです:

* 事前定義されたユーザーを記述した設定ファイルへのパス。
* SQL コマンドで作成されたユーザーが保存されるフォルダへのパス。
* SQL コマンドで作成されたユーザーが保存およびレプリケートされる ZooKeeper ノードパス。

このセクションが指定されている場合、[users&#95;config](/operations/server-configuration-parameters/settings#users_config) と [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) からのパスは使用されません。

`user_directories` セクションには任意の数の項目を含めることができ、項目の順序は優先順位を意味します（上にある項目ほど優先順位が高くなります）。

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

ユーザー、ロール、行ポリシー、QUOTA、およびプロファイルは ZooKeeper に格納することもできます：

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

`memory` セクションおよび `ldap` セクションを定義することもできます。`memory` は情報をディスクに書き込まずメモリ内のみに保存することを意味し、`ldap` は情報を LDAP サーバー上に保存することを意味します。

ローカルに定義されていないユーザーのリモートユーザーディレクトリとして LDAP サーバーを追加するには、次の設定を持つ 1 つの `ldap` セクションを定義します:

| Setting  | Description                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | `ldap_servers` 設定セクションで定義された LDAP サーバー名のいずれか。このパラメータは必須で、空にはできません。                                                                                                  |
| `roles`  | LDAP サーバーから取得された各ユーザーに割り当てられる、ローカルに定義されたロールの一覧を持つセクション。ロールが指定されていない場合、ユーザーは認証後にいかなる操作も実行できません。列挙されたロールのいずれかが認証時点でローカルに定義されていない場合、指定されたパスワードが誤っている場合と同様に、認証試行は失敗します。 |

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

ユーザーファイルを格納するディレクトリです。テーブル関数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## user&#95;scripts&#95;path {#user_scripts_path}

ユーザースクリプトファイルを格納するディレクトリです。Executable ユーザー定義関数で使用されます。詳細は [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions) を参照してください。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

型:

デフォルト値:

## users&#95;config {#users_config}

次の内容を含むファイルへのパスです：

* ユーザー設定
* アクセス権限
* 設定プロファイル
* クォータ設定

**例**

```xml
<users_config>users.xml</users_config>
```

## validate&#95;tcp&#95;client&#95;information {#validate_tcp_client_information}

<SettingsInfoBlock type="Bool" default_value="0" />クエリパケットを受信した際にクライアント情報の検証を有効にするかどうかを制御します。

デフォルトでは `false` です：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```

## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />ベクトル類似度索引用キャッシュのサイズ（エントリ数）。設定値が 0 の場合は無効になります。

## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ベクトル類似度索引キャッシュポリシーの名前。

## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />ベクトル類似性索引用キャッシュのサイズです。0 を指定すると無効になります。

:::note
この設定は実行時に変更可能で、直ちに反映されます。
:::

## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />ベクトル類似度索引キャッシュにおける（SLRU ポリシーの場合の）保護キューのサイズが、キャッシュ全体サイズに対して占める割合を表します。

## wait&#95;dictionaries&#95;load&#95;at&#95;startup {#wait_dictionaries_load_at_startup}

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は、`dictionaries_lazy_load` が `false` の場合の動作を指定します。
（`dictionaries_lazy_load` が `true` の場合、この設定は何の影響も与えません。）

`wait_dictionaries_load_at_startup` が `false` の場合、サーバーは起動時にすべての Dictionary の読み込みを開始し、その読み込みと並行して接続を受け付けます。
ある Dictionary がクエリ内で初めて使用されるとき、その Dictionary がまだ読み込まれていない場合は、クエリはその Dictionary の読み込みが完了するまで待機します。
`wait_dictionaries_load_at_startup` を `false` に設定すると、ClickHouse の起動を高速化できますが、一部のクエリの実行が遅くなる可能性があります
（いくつかの Dictionary の読み込み完了を待つ必要があるため）。

`wait_dictionaries_load_at_startup` が `true` の場合、サーバーは起動時に、すべての Dictionary の読み込み（成功・失敗を問わず）が完了するまで待機し、その後で接続の受け付けを開始します。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```

## workload&#95;path {#workload_path}

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリの保存先として使用されるディレクトリです。デフォルトでは、サーバーのワーキングディレクトリ配下の `/workload/` フォルダが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**関連項目**

* [ワークロード階層](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)

## workload&#95;zookeeper&#95;path {#workload_zookeeper_path}

ZooKeeper ノードへのパスです。すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリのストレージとして使用されます。整合性を保つため、すべての SQL 定義は 1 つの znode の値として保存されます。デフォルトでは ZooKeeper は使用されず、定義は [ディスク](#workload_path) 上に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**関連項目**

* [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)

## zookeeper {#zookeeper}

ClickHouse が [ZooKeeper](http://zookeeper.apache.org/) クラスターと連携するための設定を含みます。ClickHouse は、レプリケーテッドテーブルを使用する場合に、レプリカのメタデータを保存するために ZooKeeper を使用します。レプリケーテッドテーブルを使用しない場合、このセクションのパラメータは省略できます。

以下の設定はサブタグで指定できます:

| Setting                                    | Description                                                                                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeper エンドポイント。複数のエンドポイントを設定できます。例: `<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性は、ZooKeeper クラスターへの接続を試行する際のノードの順序を指定します。 |
| `session_timeout_ms`                       | クライアントセッションの最大タイムアウト時間 (ミリ秒)。                                                                                                                                  |
| `operation_timeout_ms`                     | 1 つの操作の最大タイムアウト時間 (ミリ秒)。                                                                                                                                       |
| `root` (optional)                          | ClickHouse サーバーが使用する znode のルートとして使用される znode。                                                                                                                 |
| `fallback_session_lifetime.min` (optional) | プライマリが利用できない場合にフォールバックノードへの ZooKeeper セッション存続時間の最小制限 (ロードバランシング)。秒単位で指定。デフォルト: 3 時間。                                                                           |
| `fallback_session_lifetime.max` (optional) | プライマリが利用できない場合にフォールバックノードへの ZooKeeper セッション存続時間の最大制限 (ロードバランシング)。秒単位で指定。デフォルト: 6 時間。                                                                           |
| `identity` (optional)                      | 要求された znode にアクセスするために ZooKeeper によって要求されるユーザー名とパスワード。                                                                                                         |
| `use_compression` (optional)               | `true` に設定すると Keeper プロトコルで圧縮を有効にします。                                                                                                                          |

また、ZooKeeper ノードの選択アルゴリズムを指定できる `zookeeper_load_balancing` 設定 (任意) もあります:

| Algorithm Name                  | Description                                                            |
| ------------------------------- | ---------------------------------------------------------------------- |
| `random`                        | ZooKeeper ノードのうち 1 つをランダムに選択します。                                       |
| `in_order`                      | 最初の ZooKeeper ノードを選択し、それが利用できない場合は 2 番目、その次という順に選択します。                 |
| `nearest_hostname`              | サーバーのホスト名と最も類似したホスト名を持つ ZooKeeper ノードを選択します。ホスト名は名前の接頭辞で比較されます。        |
| `hostname_levenshtein_distance` | `nearest_hostname` と同様ですが、ホスト名をレーベンシュタイン距離で比較します。                      |
| `first_or_random`               | 最初の ZooKeeper ノードを選択し、それが利用できない場合は残りの ZooKeeper ノードのうち 1 つをランダムに選択します。 |
| `round_robin`                   | 最初の ZooKeeper ノードを選択し、再接続が発生した場合は次のノードを選択します。                          |

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
    <!-- オプション。Chroot サフィックス。存在している必要があります。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- オプション。Zookeeper ダイジェスト ACL 文字列。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**関連項目**

* [レプリケーション](../../engines/table-engines/mergetree-family/replication.md)
* [ZooKeeper Programmer&#39;s Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [ClickHouse と ZooKeeper 間のオプションのセキュア通信](/operations/ssl-zookeeper)

## zookeeper&#95;log {#zookeeper_log}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) システムテーブルに関する設定です。

以下の設定は、サブタグごとに構成できます:

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
