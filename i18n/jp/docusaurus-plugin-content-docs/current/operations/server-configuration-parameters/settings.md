---
description: '本セクションでは、サーバー設定のうち、セッションレベルやクエリレベルでは変更できないものについて説明します。'
keywords: ['global server settings']
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

このセクションでは、サーバー設定について説明します。これらはセッションレベルやクエリレベルでは変更できない設定です。

ClickHouse の設定ファイルの詳細については、[""Configuration Files""](/operations/configuration-files) を参照してください。

その他の設定については、""[Settings](/operations/settings/overview)"" セクションで説明しています。
設定を確認する前に、[Configuration files](/operations/configuration-files) セクションを読み、`incl` および `optional` 属性を用いた置換の使い方を把握しておくことを推奨します。

## abort_on_logical_error {#abort_on_logical_error} 

<SettingsInfoBlock type="Bool" default_value="0" />LOGICAL_ERROR 例外が発生した際にサーバーをクラッシュさせます。専門家向けです。

## access&#95;control&#95;improvements {#access_control_improvements}

アクセス制御システムにおけるオプションの改善用設定です。

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                     | Default |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | ROW POLICY を持たないユーザーが、`SELECT` クエリを使用して行を読み取れるかどうかを設定します。例えば、ユーザー A と B がいて、ROW POLICY が A に対してのみ定義されている場合、この設定が true であれば、ユーザー B はすべての行を閲覧できます。この設定が false であれば、ユーザー B はどの行も閲覧できません。                                                                                                                                                                           | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` クエリに `CLUSTER` 権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                    | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>` に権限が必要かどうか、また権限なしに任意のユーザーが実行できるかどうかを設定します。true に設定した場合、このクエリには、非 system テーブルと同様に `GRANT SELECT ON system.<table>` が必要になります。例外: 一部の system テーブル（`tables`、`columns`、`databases`、および `one`、`contributors` のような一部の定数テーブル）は依然として全ユーザーがアクセス可能です。また、`SHOW` 権限（例: `SHOW USERS`）が付与されている場合、対応する system テーブル（つまり `system.users`）にアクセスできます。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` に権限が必要かどうか、また権限なしに任意のユーザーが実行できるかどうかを設定します。true に設定した場合、このクエリには、通常のテーブルと同様に `GRANT SELECT ON information_schema.<table>` が必要になります。                                                                                                                                                                                    | `true`  |
| `settings_constraints_replace_previous`         | 特定の SETTING に対する SETTINGS PROFILE 内の CONSTRAINT が、その SETTING について以前の CONSTRAINT（他の PROFILE で定義されたもの）の動作を、新しい CONSTRAINT で設定されていないフィールドも含めて打ち消すかどうかを設定します。また、`changeable_in_readonly` という CONSTRAINT タイプを有効にします。                                                                                                                                                 | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンを指定してテーブルを作成する際に、GRANT が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                | `false` |
| `role_cache_expiration_time_seconds`            | Role Cache にロールが保持される時間を、最後のアクセスからの経過秒数で設定します。                                                                                                                                                                                                                                                                                                                  | `600`   |

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

ClickHouse サーバーが、SQL コマンドで作成されたユーザーおよびロールの設定を格納するディレクトリへのパス。

**関連項目**

- [Access Control and Account Management](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />groupArray で配列要素数の上限を超えたときに実行するアクション：`throw` で例外を送出するか、`discard` で余分な値を破棄する

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray 関数における配列要素の最大サイズ（バイト単位）。この制限はシリアライズ時にチェックされ、状態サイズが過度に大きくなるのを防ぐのに役立ちます。

## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />

異なる機能ティアに関連する設定をユーザーが変更できるかどうかを制御します。

- `0` - すべての設定の変更が許可されます（experimental、beta、production）。
- `1` - beta および production 機能の設定のみ変更が許可されます。experimental 設定の変更は拒否されます。
- `2` - production 設定のみ変更が許可されます。experimental および beta 設定の変更は拒否されます。

これは、すべての `EXPERIMENTAL` / `BETA` 機能に対して readonly の CONSTRAINT を設定することと同等です。

:::note
値が `0` の場合、すべての設定を変更できます。
:::

## allow_impersonate_user {#allow_impersonate_user} 

<SettingsInfoBlock type="Bool" default_value="0" />IMPERSONATE 機能（EXECUTE AS target_user）を有効化／無効化します。

## allow&#95;implicit&#95;no&#95;password {#allow_implicit_no_password}

&#39;IDENTIFIED WITH no&#95;password&#39; が明示的に指定されていない限り、パスワードなしのユーザーを作成することを禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow&#95;no&#95;password {#allow_no_password}

安全でないパスワード方式である no&#95;password を許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```


## allow&#95;plaintext&#95;password {#allow_plaintext_password}

平文パスワード（安全でない）の使用を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc によるメモリ使用を許可します。

## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

Iceberg で使用が許可されているディスクのリスト

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />`true` の場合、グレースフルシャットダウン時に非同期挿入のキューがフラッシュされます

## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドでデータを実際にパースして挿入するスレッドの最大数です。0 を指定すると、非同期モードは無効になります

## async&#95;load&#95;databases {#async_load_databases}

<SettingsInfoBlock type="Bool" default_value="1" />

データベースおよびテーブルを非同期でロードします。

* `true` の場合、`Ordinary`、`Atomic`、`Replicated` エンジンを持つすべての非システムデータベースは、ClickHouse サーバーの起動後に非同期でロードされます。`system.asynchronous_loader` テーブル、およびサーバー設定 `tables_loader_background_pool_size` と `tables_loader_foreground_pool_size` を参照してください。まだロードされていないテーブルへアクセスしようとするクエリは、そのテーブルが利用可能になるまで待機します。ロード処理が失敗した場合、クエリは（`async_load_databases = false` の場合のようにサーバー全体を停止させる代わりに）エラーを再スローします。少なくとも 1 つのクエリが待機しているテーブルは、より高い優先度でロードされます。データベースに対する DDL クエリは、そのデータベースが利用可能になるまで待機します。また、待機中のクエリ総数に対する上限として `max_waiting_queries` の設定も検討してください。
* `false` の場合、すべてのデータベースはサーバー起動時にロードされます。

**例**

```xml
<async_load_databases>true</async_load_databases>
```


## async&#95;load&#95;system&#95;database {#async_load_system_database}

<SettingsInfoBlock type="Bool" default_value="0" />

system テーブルを非同期でロードします。`system` データベース内に大量のログテーブルやパーツがある場合に有用です。`async_load_databases` 設定とは独立しています。

* `true` に設定した場合、ClickHouse サーバーの起動後に、`Ordinary`、`Atomic`、`Replicated` エンジンを持つすべての system データベースが非同期でロードされます。`system.asynchronous_loader` テーブル、`tables_loader_background_pool_size` および `tables_loader_foreground_pool_size` サーバー設定を参照してください。まだロードされていない system テーブルへアクセスしようとするクエリは、そのテーブルが利用可能になるまで待機します。少なくとも 1 つのクエリが待機しているテーブルは、より高い優先度でロードされます。さらに、待機中のクエリの総数を制限するために、`max_waiting_queries` 設定の構成も検討してください。
* `false` に設定した場合、system データベースはサーバーの起動前に同期的にロードされます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />重い非同期メトリクスの更新間隔（秒単位）。

## asynchronous&#95;insert&#95;log {#asynchronous_insert_log}

非同期インサートをログに記録する system テーブル [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) 用の設定。

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

お使いの環境でこの設定がデフォルトで有効になっていない場合は、ClickHouse のインストール方法に応じて、以下の手順に従って有効化または無効化できます。

**有効化**

非同期メトリックログの履歴収集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します。

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

`asynchronous_metric_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` ファイルを作成します。

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />高負荷な非同期メトリクスの計算を有効にします。

## asynchronous_metrics_keeper_metrics_only {#asynchronous_metrics_keeper_metrics_only} 

<SettingsInfoBlock type="Bool" default_value="0" />非同期メトリクスで keeper 関連のメトリクスのみを計算します。

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />非同期メトリクスの更新間隔（秒）。

## auth_use_forwarded_address {#auth_use_forwarded_address} 

プロキシ経由で接続しているクライアントに対して、認証時にクライアントの元の送信元アドレスを使用します。

:::note
転送されたアドレスは容易に詐称され得るため、この設定を使用する際は特に注意が必要です。このような認証を受け付けるサーバーには、直接アクセスせず、必ず信頼できるプロキシ経由のみでアクセスするようにしてください。
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [Buffer エンジンのテーブル](/engines/table-engines/special/buffer) に対するフラッシュ処理を実行するために使用されるスレッド数の最大値。

## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドで実行される [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルに対する各種処理（主にガベージコレクション）に使用されるスレッド数の最大値。

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />分散送信の実行に使用されるスレッド数の上限です。

## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルのデータパーツを別のレプリカから取得する際に使用されるスレッド数の最大値。

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />

スレッド数に対する、並行して実行できるバックグラウンドのマージおよびミューテーション数の比率を設定します。

たとえば、この比率が 2 で、[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) が 16 に設定されている場合、ClickHouse はバックグラウンドマージを最大 32 個まで同時に実行できます。これは、バックグラウンド処理を一時停止したり、後回しにしたりできるためです。小さなマージにより高い実行優先度を与えるために、この仕組みが必要となります。

:::note
この比率は、サーバー実行中には増やすことしかできません。小さくするにはサーバーを再起動する必要があります。

[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 設定と同様に、後方互換性のため [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) は `default` プロファイルから適用できます。
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />

バックグラウンドでのマージおよびミューテーションのスケジューリング方法を決定するポリシーです。指定可能な値は `round_robin` と `shortest_task_first` です。

バックグラウンドスレッドプールで、次に実行するマージまたはミューテーションを選択する際に使用されるアルゴリズムです。ポリシーは、サーバーを再起動せずに実行時に変更できます。
後方互換性のため、`default` プロファイルから適用できます。

指定可能な値:

- `round_robin` — すべての並行マージおよびミューテーションをラウンドロビン順に実行し、飢餓状態が発生しない動作を保証します。マージ対象のブロック数が少ないため、小規模なマージは大規模なマージよりも速く完了します。
- `shortest_task_first` — 常に小規模なマージまたはミューテーションを優先して実行します。マージおよびミューテーションには、その結果のサイズに基づいて優先度が割り当てられます。サイズの小さいマージは、大きいマージよりも厳密に優先されます。このポリシーは小さいパーツを可能なかぎり速くマージすることを保証しますが、`INSERT` が集中して行われているパーティションでは、大規模なマージが無期限に飢餓状態になる可能性があります。

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />メッセージストリーミングのバックグラウンド処理を実行するために使用されるスレッドの最大数を指定します。

## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドで *MergeTree-engine テーブルのデータパーツを別のディスクまたはボリュームに移動する際に使用されるスレッド数の上限。

## background&#95;pool&#95;size {#background_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />

MergeTree エンジンを使用するテーブルに対して、バックグラウンドでマージとミューテーションを実行するスレッド数を設定します。

:::note

* この設定は、後方互換性のために、ClickHouse サーバー起動時の `default` プロファイル構成からも適用できます。
* サーバー稼働中に変更できるのは、スレッド数を増やす場合だけです。
* スレッド数を減らすには、サーバーを再起動する必要があります。
* この設定を調整することで、CPU とディスクの負荷を制御できます。
  :::

:::danger
プールサイズを小さくすると CPU とディスクのリソース使用量は減りますが、バックグラウンド処理の進行が遅くなり、最終的にクエリ性能に影響を与える可能性があります。
:::

この値を変更する前に、次のような関連する MergeTree 設定も確認してください：

* [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge)。
* [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation)。
* [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**例**

```xml
<background_pool_size>16</background_pool_size>
```


## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio} 

<SettingsInfoBlock type="Float" default_value="0.8" />プール内のスレッドのうち、同一タイプのタスクを同時に実行できる最大比率を指定します。

## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />レプリケートされたテーブル、Kafka ストリーミング、および DNS キャッシュの更新といった軽量な周期的処理を継続的に実行するために使用されるスレッドの最大数です。

## backup&#95;log {#backup_log}

`BACKUP` および `RESTORE` 操作を記録する [backup&#95;log](../../operations/system-tables/backup_log.md) システムテーブルに関する設定です。

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

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />`BACKUP` リクエストの実行に使用されるスレッド数の最大値。

## backups {#backups}

バックアップのための設定で、[`BACKUP` および `RESTORE`](/operations/backup/overview) 文を実行する際に使用されます。

以下の設定はサブタグで個別に構成できます。

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','同一ホスト上で複数のバックアップ処理を同時に実行できるかどうかを制御します。', 'true'),
    ('allow_concurrent_restores', 'Bool', '同一ホスト上で複数のリストア処理を同時に実行できるかどうかを制御します。', 'true'),
    ('allowed_disk', 'String', '`File()` を使用する場合のバックアップ先ディスク。この設定を指定しないと `File` は使用できません。', ''),
    ('allowed_path', 'String', '`File()` を使用する場合のバックアップ先パス。この設定を指定しないと `File` は使用できません。', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '収集したメタデータを比較した結果に不整合がある場合に、スリープに入る前にメタデータ収集を試行する回数。', '2'),
    ('collect_metadata_timeout', 'UInt64', 'バックアップ中にメタデータを収集する際のタイムアウト（ミリ秒）。', '600000'),
    ('compare_collected_metadata', 'Bool', 'true の場合、バックアップ中にメタデータが変更されていないことを確認するために、収集したメタデータと既存のメタデータを比較します。', 'true'),
    ('create_table_timeout', 'UInt64', 'リストア中にテーブルを作成する際のタイムアウト（ミリ秒）。', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '協調バックアップ／リストア中に不正なバージョンエラーが発生した場合に、再試行する最大回数。', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '次回のメタデータ収集を試行する前にスリープする最大時間（ミリ秒）。', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '次回のメタデータ収集を試行する前にスリープする最小時間（ミリ秒）。', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '`BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップへコピー済みのファイルを削除しようとします。削除に失敗した場合は、コピー済みファイルはそのまま残されます。', 'true'),
    ('sync_period_ms', 'UInt64', '協調バックアップ／リストアの同期周期（ミリ秒）。', '5000'),
    ('test_inject_sleep', 'Bool', 'テスト関連のスリープ処理。', 'false'),
    ('test_randomize_order', 'Bool', 'true の場合、テスト目的で一部の操作の実行順序をランダム化します。', 'false'),
    ('zookeeper_path', 'String', '`ON CLUSTER` 句を使用する場合に、バックアップおよびリストアのメタデータを保存する ZooKeeper 内のパス。', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Setting                                             | Type   | Description                                                                                    | Default               |
| :-------------------------------------------------- | :----- | :--------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 同一ホスト上で複数のバックアップ処理を同時に実行できるかどうかを制御します。                                                         | `true`                |
| `allow_concurrent_restores`                         | Bool   | 同一ホスト上で複数のリストア処理を同時に実行できるかどうかを制御します。                                                           | `true`                |
| `allowed_disk`                                      | String | `File()` を使用する際にバックアップ先とするディスクを指定します。この設定は `File` を使用するために必須です。                                | ``                    |
| `allowed_path`                                      | String | `File()` を使用する際にバックアップ先とするパスを指定します。この設定は `File` を使用するために必須です。                                  | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 収集したメタデータを比較した結果、不整合があった場合にスリープに入るまでにメタデータ収集を試行する回数です。                                         | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | バックアップ中にメタデータを収集する際のタイムアウト時間（ミリ秒）です。                                                           | `600000`              |
| `compare_collected_metadata`                        | Bool   | true の場合、バックアップ中に収集したメタデータを既存のメタデータと比較し、バックアップ処理中に変更されていないことを確認します。                            | `true`                |
| `create_table_timeout`                              | UInt64 | リストア中にテーブルを作成する際のタイムアウト時間（ミリ秒）です。                                                              | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | 協調バックアップ／リストア中に bad version エラーが発生した場合にリトライを行う最大試行回数です。                                        | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次のメタデータ収集を試行する前にスリープする最大時間（ミリ秒）です。                                                             | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次のメタデータ収集を試行する前にスリープする最小時間（ミリ秒）です。                                                             | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | `BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップへコピー済みのファイルを削除しようとします。false の場合、コピー済みファイルはそのまま残ります。 | `true`                |
| `sync_period_ms`                                    | UInt64 | 協調バックアップ／リストアにおける同期周期（ミリ秒）です。                                                                  | `5000`                |
| `test_inject_sleep`                                 | Bool   | テスト用途のスリープを有効にします。                                                                             | `false`               |
| `test_randomize_order`                              | Bool   | true の場合、テスト目的で特定の処理順序をランダム化します。                                                               | `false`               |
| `zookeeper_path`                                    | String | `ON CLUSTER` 句を使用する場合に、バックアップおよびリストアのメタデータが保存される ZooKeeper 上のパスです。                             | `/clickhouse/backups` |

この設定はデフォルトで次のように構成されています。

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

バックアップ用 IO スレッドプールにスケジュールできるジョブの最大数です。現在の S3 バックアップロジックのため、このキューは無制限にしておくことを推奨します。

:::note
値が `0`（デフォルト）の場合は無制限を意味します。
:::

## bcrypt&#95;workfactor {#bcrypt_workfactor}

`bcrypt_password` 認証タイプ用のワークファクターです。この認証タイプは [Bcrypt アルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/) を使用します。
ワークファクターは、ハッシュの計算およびパスワード検証に必要な計算量と時間を決定します。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
高頻度で認証を行うアプリケーションでは、
より高いワークファクターを設定した場合の bcrypt の計算コストを考慮し、
別の認証方式の利用を検討してください。
:::


## blob&#95;storage&#95;log {#blob_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) システムテーブルに関する設定です。

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

組み込みディクショナリを再読み込みするまでの間隔（秒）です。

ClickHouse は、組み込みディクショナリを x 秒ごとに再読み込みします。これにより、サーバーを再起動せずに、動作中にディクショナリを編集できます。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />キャッシュサイズと RAM の最大容量との比率を設定します。メモリが少ないシステムでキャッシュサイズを抑えることができます。

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />テスト目的で使用します。

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />

cgroups の対応するしきい値によって、サーバーで許可される最大メモリ使用量が調整される秒単位の間隔。

cgroup オブザーバーを無効にするには、この値を `0` に設定します。

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />[compiled expressions](../../operations/caches.md) 用のキャッシュのサイズ（要素数）を設定します。

## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />[コンパイル済み式](../../operations/caches.md)用キャッシュのサイズ（バイト単位）を設定します。

## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブルに対するデータ圧縮設定です。

:::note
ClickHouse を使い始めたばかりの場合は、これを変更しないことを推奨します。
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
* `method` – 圧縮方式。指定可能な値: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`。
* `level` – 圧縮レベル。[Codecs](/sql-reference/statements/create/table#general-purpose-codecs)を参照してください。

:::note
複数の `<case>` セクションを設定できます。
:::

**条件が満たされたときの動作**:

* データパーツが条件セットに一致した場合、ClickHouse は指定された圧縮方式を使用します。
* データパーツが複数の条件セットに一致した場合、ClickHouse は最初に一致した条件セットを使用します。

:::note
データパーツがいずれの条件も満たさない場合、ClickHouse は `lz4` 圧縮を使用します。
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

`concurrent_threads_soft_limit_num` と `concurrent_threads_soft_limit_ratio_to_cores` によって指定される CPU スロットのスケジューリング方法を制御するポリシーです。制限された数の CPU スロットを同時実行中のクエリ間でどのように分配するかを決定するアルゴリズムです。スケジューラはサーバーを再起動せずに実行時に変更できます。

設定可能な値:

- `round_robin` — `use_concurrency_control` = 1 に設定された各クエリは、最大で `max_threads` 個の CPU スロットを確保します。スレッドごとに 1 スロットです。競合が発生した場合、CPU スロットはラウンドロビン方式でクエリに割り当てられます。最初のスロットは無条件に付与される点に注意してください。このため、多数の `max_threads` = 1 のクエリが存在する状況では、`max_threads` が大きいクエリに対して不公平となり、そのレイテンシーが増加する可能性があります。
- `fair_round_robin` — `use_concurrency_control` = 1 に設定された各クエリは、最大で `max_threads - 1` 個の CPU スロットを確保します。これは、各クエリの最初のスレッドに CPU スロットを必要としない `round_robin` のバリエーションです。このため、`max_threads` = 1 のクエリはスロットをまったく必要とせず、スロットを不公平に独占することはできません。無条件に付与されるスロットは存在しません。

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />

リモートサーバーからデータを取得するためのスレッドを除き、すべてのクエリの処理に使用できるクエリ処理スレッドの最大数です。これは厳密な上限値ではありません。上限に達した場合でも、そのクエリには少なくとも 1 つのスレッドが割り当てられて実行されます。実行中に追加のスレッドが利用可能になった場合、クエリは必要なスレッド数までスケールアップできます。

:::note
`0`（デフォルト）の値は無制限を意味します。
:::

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) と同様ですが、値を CPU コア数に対する比率で指定します。

## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />

ClickHouse が設定を再読み込みし、変更の有無を確認する間隔

## core&#95;dump {#core_dump}

コアダンプファイルサイズのソフトリミットを設定します。

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

CPU リソース（MASTER THREAD および WORKER THREAD）のワークロードスケジューリングをどのように行うかを定義します。

* `true`（推奨）の場合、実際に消費された CPU 時間に基づいて計測が行われます。競合するワークロードに対して、公平な量の CPU 時間が割り当てられます。スロットは一定期間だけ割り当てられ、有効期限後に再要求されます。CPU リソースが過負荷の場合、スロットの要求がスレッドの実行をブロックすることがあり、その結果プリエンプションが発生する可能性があります。これにより CPU 時間の公平性が保証されます。
* `false`（デフォルト）の場合、計測は割り当てられた CPU スロット数に基づいて行われます。競合するワークロードに対して、公平な数の CPU スロットが割り当てられます。スロットはスレッドの開始時に割り当てられ、実行が終了するまで継続的に保持され、その後解放されます。クエリ実行に割り当てられるスレッド数は 1 から `max_threads` まで増加することはあっても減少することはありません。これは長時間実行されるクエリに有利であり、短いクエリの CPU リソース枯渇を引き起こす可能性があります。

**例**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**関連項目**

* [ワークロードのスケジューリング](/operations/workload-scheduling.md)


## cpu&#95;slot&#95;preemption&#95;timeout&#95;ms {#cpu_slot_preemption_timeout_ms}

<SettingsInfoBlock type="UInt64" default_value="1000" />

ワーカースレッドがプリエンプション時、すなわち別の CPU スロットが付与されるのを待機できる最大時間（ミリ秒）を定義します。このタイムアウト後もスレッドが新しい CPU スロットを取得できない場合、そのスレッドは終了し、クエリは同時に実行されるスレッド数がより少ない状態へ動的にスケールダウンされます。マスタースレッドは決してスケールダウンされませんが、無期限にプリエンプションを受ける可能性がある点に注意してください。これは `cpu_slot_preemption` が有効化されており、WORKER THREAD に対して CPU リソースが定義されている場合にのみ意味を持ちます。

**例**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**関連項目**

* [ワークロードのスケジューリング](/operations/workload-scheduling.md)


## cpu&#95;slot&#95;quantum&#95;ns {#cpu_slot_quantum_ns}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

スレッドが CPU スロットを取得してから、別の CPU スロットを要求するまでに消費できる CPU ナノ秒数を定義します。`cpu_slot_preemption` が有効であり、MASTER THREAD または WORKER THREAD に対して CPU リソースが定義されている場合にのみ有効です。

**例**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**関連項目**

* [Workload Scheduling](/operations/workload-scheduling.md)


## crash&#95;log {#crash_log}

[crash&#95;log](../../operations/system-tables/crash_log.md) システムテーブルの動作に関する設定です。

以下の設定はサブタグとして構成できます:

| Setting                            | 説明                                                                                                                        | デフォルト               | 注記                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| `database`                         | データベース名。                                                                                                                  |                     |                                                                                            |
| `table`                            | システムテーブル名。                                                                                                                |                     |                                                                                            |
| `engine`                           | システムテーブル用の [MergeTree エンジン定義](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。 |                     | `partition_by` または `order_by` が定義されている場合は使用できません。指定されていない場合はデフォルトで `MergeTree` が選択されます     |
| `partition_by`                     | システムテーブル用の[カスタムパーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                            |                     | システムテーブルに対して `engine` が指定されている場合、`partition_by` パラメータは直接 &#39;engine&#39; の中で指定する必要があります   |
| `ttl`                              | テーブルの [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) を指定します。                         |                     | システムテーブルに対して `engine` が指定されている場合、`ttl` パラメータは直接 &#39;engine&#39; の中で指定する必要があります            |
| `order_by`                         | システムテーブル用の[カスタムソートキー](/engines/table-engines/mergetree-family/mergetree#order_by)。`engine` が定義されている場合は使用できません。            |                     | システムテーブルに対して `engine` が指定されている場合、`order_by` パラメータは直接 &#39;engine&#39; の中で指定する必要があります       |
| `storage_policy`                   | テーブルに使用するストレージポリシー名 (任意)。                                                                                                 |                     | システムテーブルに対して `engine` が指定されている場合、`storage_policy` パラメータは直接 &#39;engine&#39; の中で指定する必要があります |
| `settings`                         | MergeTree の動作を制御する[追加パラメータ](/engines/table-engines/mergetree-family/mergetree/#settings) (任意)。                            |                     | システムテーブルに対して `engine` が指定されている場合、`settings` パラメータは直接 &#39;engine&#39; の中で指定する必要があります       |
| `flush_interval_milliseconds`      | メモリ上のバッファからテーブルへデータをフラッシュする間隔。                                                                                            | `7500`              |                                                                                            |
| `max_size_rows`                    | ログの最大行数。未フラッシュのログ数が `max_size_rows` に達すると、ログがディスクにダンプされます。                                                                | `1024`              |                                                                                            |
| `reserved_size_rows`               | ログ用に事前確保されるメモリサイズ (行数)。                                                                                                   | `1024`              |                                                                                            |
| `buffer_size_rows_flush_threshold` | 行数のしきい値。このしきい値に達すると、バックグラウンドでログをディスクにフラッシュする処理が開始されます。                                                                    | `max_size_rows / 2` |                                                                                            |
| `flush_on_crash`                   | クラッシュ時にログをディスクへダンプするかどうかを設定します。                                                                                           | `false`             |                                                                                            |

デフォルトのサーバー設定ファイル `config.xml` には、次の `settings` セクションが含まれます:

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

この設定は、カスタム（SQL で作成された）キャッシュディスクのキャッシュパスを指定します。
`custom_cached_disks_base_directory` は、カスタムディスクに対しては `filesystem_caches_path`（`filesystem_caches_path.xml` に定義）よりも優先され、
`custom_cached_disks_base_directory` が存在しない場合にのみ `filesystem_caches_path` が使用されます。
ファイルシステムキャッシュのパス設定は、このディレクトリ配下になければならず、
そうでない場合はディスクの作成を阻止する例外がスローされます。

:::note
これは、以前のバージョンで作成され、その後サーバーがアップグレードされたディスクには影響しません。
この場合、サーバーが正常に起動できるように、例外はスローされません。
:::

例:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## custom&#95;settings&#95;prefixes {#custom_settings_prefixes}

[カスタム設定](/operations/settings/query-level#custom_settings)で使用するプレフィックスの一覧です。プレフィックスはカンマ区切りで指定する必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**関連項目**

* [カスタム設定](/operations/settings/query-level#custom_settings)


## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" />

削除されたテーブルを [`UNDROP`](/sql-reference/statements/undrop.md) 文を使用して復元できるまでの遅延時間を表します。`DROP TABLE` が `SYNC` 修飾子付きで実行された場合、この設定は無視されます。
この設定のデフォルト値は `480`（8 分）です。

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />テーブルの削除に失敗した場合、ClickHouse はこのタイムアウトまで待機してから、操作を再試行します。

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />テーブル削除処理に使用されるスレッドプールのサイズ。

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />

`store/` ディレクトリから不要なデータをクリーンアップするタスクのパラメータです。
このタスクの実行間隔（スケジュール周期）を設定します。

:::note
値が `0` の場合は「実行しない」を意味します。デフォルト値は 1 日に相当します。
:::

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

`store/` ディレクトリ内の不要なデータをクリーンアップするタスクのパラメータです。
あるサブディレクトリが clickhouse-server によって使用されておらず、かつ直近
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒間にそのディレクトリが変更されていない場合、このタスクは
すべてのアクセス権を削除することでそのディレクトリを「隠し」ます。これは、clickhouse-server が
`store/` の内部に存在することを想定していないディレクトリにも適用されます。

:::note
`0` の値は「即時」を意味します。
:::

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />

`store/` ディレクトリから不要なデータをクリーンアップするタスクのパラメータです。
あるサブディレクトリが clickhouse-server によって使用されておらず、以前に「非表示」にされていて
（[database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) を参照）
かつ直近
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒の間に更新されていない場合、そのタスクはそのディレクトリを削除します。
また、clickhouse-server が `store/` 内に存在することを想定していないディレクトリに対しても動作します。

:::note
`0` の値は「決して削除しない」ことを意味します。デフォルト値は 30 日に相当します。
:::

## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />Replicated データベースでテーブルを永続的にデタッチすることを許可します

## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />Replicated データベース内の予期しないテーブルを、別のローカルデータベースに移動する代わりに削除します

## dead&#95;letter&#95;queue {#dead_letter_queue}

&#39;dead&#95;letter&#95;queue&#39; システムテーブル用の設定です。

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

`CREATE USER u IDENTIFIED BY 'p'` のようなクエリで、自動的に設定されるパスワードの種類を指定します。

指定可能な値は次のとおりです:

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## default&#95;profile {#default_profile}

デフォルトの設定プロファイルです。設定プロファイルは、設定 `user_config` で指定されたファイル内にあります。

**例**

```xml
<default_profile>default</default_profile>
```


## default&#95;replica&#95;name {#default_replica_name}

<SettingsInfoBlock type="String" default_value="{replica}" />

ZooKeeper 内でのレプリカ名。

**例**

```xml
<default_replica_name>{replica}</default_replica_name>
```


## default&#95;replica&#95;path {#default_replica_path}

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />

ZooKeeper 内のテーブルのパス。

**例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```


## default&#95;session&#95;timeout {#default_session_timeout}

デフォルトのセッションタイムアウト時間（秒）。

```xml
<default_session_timeout>60</default_session_timeout>
```


## dictionaries&#95;config {#dictionaries_config}

dictionaries の設定ファイルへのパスです。

パス:

* 絶対パス、またはサーバーの設定ファイルからの相対パスを指定します。
* パスにはワイルドカードの * および ? を含めることができます。

関連項目:

* &quot;[Dictionaries](../../sql-reference/dictionaries/index.md)&quot;。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## dictionaries&#95;lazy&#95;load {#dictionaries_lazy_load}

<SettingsInfoBlock type="Bool" default_value="1" />

Dictionary の遅延読み込みを行います。

* `true` の場合、各 Dictionary は最初に使用されたタイミングで読み込まれます。読み込みに失敗した場合、その Dictionary を使用していた関数は例外をスローします。
* `false` の場合、サーバーは起動時にすべての Dictionary を読み込みます。

:::note
サーバーは、いかなる接続も受け付ける前に、すべての Dictionary の読み込みが完了するまで起動処理で待機します
（例外: [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) が `false` に設定されている場合）。
:::

**例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />`background_reconnect` が有効な MySQL および Postgres Dictionary で接続に失敗した場合に、再接続を試行する間隔（ミリ秒単位）。

## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />

insert/alter/delete クエリを無効にします。読み取り専用ノードが必要で、挿入やミューテーションが読み取りパフォーマンスに影響するのを防ぎたい場合に、この設定を有効にします。S3、DataLake、MySQL、PostrgeSQL、Kafka などの外部エンジンへの insert は、この設定に関係なく許可されます。

## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />内部 DNS キャッシュを無効化します。Kubernetes のようにインフラストラクチャが頻繁に変化するシステムで ClickHouse を運用する場合に推奨されます。

## disable&#95;tunneling&#95;for&#95;https&#95;requests&#95;over&#95;http&#95;proxy {#disable_tunneling_for_https_requests_over_http_proxy}

デフォルトでは、トンネリング（つまり `HTTP CONNECT`）を使用して、`HTTP` プロキシ経由で `HTTPS` リクエストを送信します。この設定でトンネリングを無効化できます。

**no&#95;proxy**

デフォルトでは、すべてのリクエストがプロキシを経由します。特定のホストに対してプロキシを無効化するには、`no_proxy` 変数を設定する必要があります。
これは、list および remote リゾルバ用の `<proxy>` 句の中、もしくは environment リゾルバ用には環境変数として設定できます。
IP アドレス、ドメイン、サブドメイン、および完全にバイパスするためのワイルドカード `'*'` をサポートします。先頭のドットは、curl と同様に取り除かれます。

**Example**

以下の設定では、`clickhouse.cloud` およびそのすべてのサブドメイン（例: `auth.clickhouse.cloud`）へのリクエストはプロキシをバイパスします。
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


## disk_connections_hard_limit {#disk_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="200000" />この制限に達した状態でさらに作成を試みると、例外がスローされます。0 に設定するとハード制限が無効になります。この制限はディスク接続に適用されます。

## disk_connections_soft_limit {#disk_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この上限を超えた接続の TTL は大幅に短くなります。この上限はディスクへの接続に適用されます。

## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />この上限を超えた接続は、使用後にリセットされます。0 に設定すると、接続キャッシュを無効にします。この上限はディスク接続に適用されます。

## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="8000" />使用中の接続数がこの上限を超えると、警告メッセージがログに書き込まれます。この上限はディスクへの接続に適用されます。

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

テーブル、データベース、テーブル関数、およびディクショナリに対する `SHOW` および `SELECT` クエリでシークレットを表示するかどうかを制御します。

シークレットを表示するには、ユーザーは
[`format_display_secrets_in_show_and_select` フォーマット設定](../settings/formats#format_display_secrets_in_show_and_select)
を有効にし、
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限も持っている必要があります。

設定可能な値:

- `0` — 無効。
- `1` — 有効。

## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client} 

<SettingsInfoBlock type="Bool" default_value="1" />キャッシュサーバーがクライアントから受信したスロットリング設定を適用するかどうかを指定します。

## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />分散キャッシュが空きとして保持しようとするアクティブ接続数のソフト上限を指定します。空き接続数が distributed_cache_keep_up_free_connections_ratio * max_connections を下回ると、空き接続数がこの制限を上回るまで、最後のアクティビティ時刻が最も古い接続から順にクローズされます。

## distributed&#95;ddl {#distributed_ddl}

クラスタ上で [distributed ddl queries](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）を実行する処理を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) が有効になっている場合にのみ動作します。

`<distributed_ddl>` 内で設定可能な項目は次のとおりです。

| Setting                | Description                                                                       | Default Value                 |
| ---------------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| `path`                 | DDL クエリ用の `task_queue` に対応する Keeper 内のパス                                          |                               |
| `profile`              | DDL クエリの実行に使用されるプロファイル                                                            |                               |
| `pool_size`            | 同時に実行できる `ON CLUSTER` クエリの数                                                       |                               |
| `max_tasks_in_queue`   | キューに入れられるタスクの最大数                                                                  | `1,000`                       |
| `task_max_lifetime`    | ノードの経過時間がこの値を超えた場合に、そのノードを削除します。                                                  | `7 * 24 * 60 * 60`（1 週間を秒で表現） |
| `cleanup_delay_period` | 新しいノードイベントを受信した際、直近のクリーンアップが `cleanup_delay_period` 秒より前に実行されている場合にクリーンアップを開始します。 | `60` 秒                        |

**Example**

```xml
<distributed_ddl>
    <!-- Path in ZooKeeper to queue with DDL queries -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Settings from this profile will be used to execute DDL queries -->
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


## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles} 

<SettingsInfoBlock type="Bool" default_value="0" />有効にすると、`ON CLUSTER` クエリはリモート分片での実行時にも、クエリを開始したユーザーおよびロールを保持して使用します。これによりクラスタ全体で一貫したアクセス制御が行えますが、そのユーザーとロールがすべてのノード上に存在している必要があります。

## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />DNS 名を IPv4 アドレスに解決することを許可します。

## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />ホスト名を IPv6 アドレスに解決できるようにします。

## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />内部 DNS キャッシュの最大件数。

## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />内部 DNS キャッシュを更新する間隔（秒単位）。

## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />ホスト名を ClickHouse の DNS キャッシュから削除する前に許容される、そのホスト名に対する DNS 解決の最大連続失敗回数。

## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />分散キャッシュの破棄に使用されるスレッドプールのサイズです。

## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />分散キャッシュを破棄する処理に使用されるスレッドプールのキューサイズです。

## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Azure SDK のログ出力を有効にします

## encryption {#encryption}

[encryption codecs](/sql-reference/statements/create/table#encryption-codecs) で使用するキーを取得するためのコマンドを設定します。キー（複数可）は環境変数に書き込むか、設定ファイルで設定する必要があります。

キーは長さが 16 バイトの 16 進数または文字列である必要があります。

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
キーを設定ファイルに保存することは推奨されません。安全とは言えません。キーは安全なディスク上の別の設定ファイルに移動し、その設定ファイルへのシンボリックリンクを `config.d/` フォルダに配置できます。
:::

キーが 16 進数形式の場合に、設定から読み込む例:

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

ここで `current_key_id` は暗号化に使用する現在の鍵を設定し、指定されたすべての鍵を復号に使用できます。

これらの各方法は、複数の鍵に対して適用できます。

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで `current_key_id` は、暗号化に使用中の現在のキーを示します。

また、ユーザーは nonce を指定することもできます。nonce の長さは 12 バイトである必要があります（デフォルトでは、暗号化および復号処理には、ゼロバイトのみで構成された nonce が使用されます）。

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または 16 進数表記で指定できます：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
上記で説明した内容はすべて `aes_256_gcm_siv` にも適用できます（ただしキーの長さは 32 バイトである必要があります）。
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

`error_log` の設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_error_log.xml` ファイルを作成します。

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

入力データのパースのためにスレッドプールのキューに登録できるジョブの最大数。

:::note
値が `0` の場合は無制限を意味します。
:::

## format&#95;schema&#95;path {#format_schema_path}

入力データ用のスキーマが格納されているディレクトリへのパスです。例えば、[CapnProto](/interfaces/formats/CapnProto) フォーマット用のスキーマなどです。

**例**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />グローバルプロファイラの CPU クロックタイマーの周期（ナノ秒）。CPU クロックのグローバルプロファイラを無効にするには 0 を設定します。推奨値は、単一クエリのプロファイリングには少なくとも 10000000（1 秒あたり 100 回）、クラスタ全体のプロファイリングには 1000000000（1 秒に 1 回）です。

## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />グローバルプロファイラのリアルクロックタイマーの周期を指定します（ナノ秒単位）。リアルクロックグローバルプロファイラを無効にするには、0 を設定します。推奨値は、単一クエリのプロファイリングには少なくとも 10000000（1 秒間に 100 回）、クラスタ全体のプロファイリングには 1000000000（1 秒に 1 回）です。

## google&#95;protos&#95;path {#google_protos_path}

Protobuf 型の proto ファイルを含むディレクトリを指定します。

例:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## graphite {#graphite}

[Graphite](https://github.com/graphite-project) にデータを送信します。

設定項目:

* `host` – Graphite サーバー。
* `port` – Graphite サーバー上のポート。
* `interval` – 送信間隔（秒）。
* `timeout` – データ送信のタイムアウト（秒）。
* `root_path` – キーのプレフィックス。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルのデータを送信。
* `events` – [system.events](/operations/system-tables/events) テーブルに一定期間蓄積された差分データを送信。
* `events_cumulative` – [system.events](/operations/system-tables/events) テーブルの累積データを送信。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルのデータを送信。

複数の `<graphite>` 句を設定できます。たとえば、異なる間隔で異なるデータを送信するために使用できます。

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

Graphite データの間引き設定です。

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

HSTS の有効期間（秒単位）。

:::note
値が `0` の場合、ClickHouse は HSTS を無効にします。正の数値を指定すると HSTS が有効になり、その `max-age` は指定した数値になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_hard_limit {#http_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="200000" />この制限に達した状態で新たに作成しようとすると、例外がスローされます。ハードリミットを無効にするには 0 を設定します。この制限は、いずれのディスクやストレージにも属さない HTTP 接続に適用されます。

## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この制限を超えた接続は、有効期間が大幅に短くなります。この制限は、いずれのディスクやストレージにも属さない http 接続に適用されます。

## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />この上限を超えた接続は、使用後にリセットされます。接続キャッシュを無効にするには 0 を設定します。この制限は、いずれのディスクやストレージにも属さない HTTP 接続に適用されます。

## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="500" />使用中の接続数がこの上限を超えた場合、警告メッセージがログに書き込まれます。この上限は、いずれのディスクやストレージにも属さない HTTP 接続に適用されます。

## http&#95;handlers {#http_handlers}

カスタム HTTP ハンドラーを定義できます。
新しい http ハンドラーを追加するには、新しい `<rule>` 要素を追加します。
ルールは定義された順に上から順にチェックされ、
最初にマッチしたもののハンドラーが実行されます。

以下の設定はサブタグで構成できます:

| Sub-tags             | Definition                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `url`                | リクエスト URL をマッチさせるために使用します。正規表現マッチを使用するには、プレフィックス &#39;regex:&#39; を付けてください（任意）                         |
| `methods`            | リクエストメソッドをマッチさせるために使用します。複数のメソッドをマッチさせるには、カンマ区切りで指定します（任意）                                             |
| `headers`            | リクエストヘッダーをマッチさせるために使用します。各子要素をマッチさせます（子要素名がヘッダー名）。正規表現マッチを使用するには、プレフィックス &#39;regex:&#39; を付けてください（任意） |
| `handler`            | リクエストハンドラー                                                                                             |
| `empty_query_string` | URL にクエリ文字列が存在しないことをチェックします                                                                            |

`handler` には、以下の設定が含まれており、サブタグで構成できます:

| Sub-tags           | Definition                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | リダイレクト先の URL                                                                                                                            |
| `type`             | サポートされる type: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                         |
| `status`           | static type と併用します。レスポンスのステータスコード                                                                                                       |
| `query_param_name` | dynamic&#95;query&#95;handler type と併用します。HTTP リクエストパラメータ内の `<query_param_name>` に対応する値を抽出して実行します                                       |
| `query`            | predefined&#95;query&#95;handler type と併用します。ハンドラーが呼び出されたときにクエリを実行します                                                                   |
| `content_type`     | static type と併用します。レスポンスの Content-Type                                                                                                  |
| `response_content` | static type と併用します。クライアントに送信されるレスポンスコンテンツです。プレフィックス &#39;file://&#39; または &#39;config://&#39; を使用する場合、ファイルまたは設定からコンテンツを取得してクライアントに送信します |

ルールのリストと合わせて、すべてのデフォルトハンドラーを有効にする `<defaults/>` を指定できます。

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
`OPTIONS` メソッドは、CORS のプリフライトリクエストを送信する際に使用されます。

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


## http&#95;server&#95;default&#95;response {#http_server_default_response}

ClickHouse の HTTP(S) サーバーにアクセスした際に、デフォルトで表示されるページです。
デフォルト値は &quot;Ok.&quot;（末尾に改行が付きます）です。

**例**

`http://localhost: http_port` にアクセスしたときに `https://tabix.io/` を開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Iceberg カタログのバックグラウンドスレッドプールのサイズ

## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Iceberg カタログプールのキューに投入可能なタスク数の上限

## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />iceberg メタデータファイルキャッシュの最大エントリ数。0 を指定すると無効になります。

## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Iceberg メタデータファイルのキャッシュポリシー名。

## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />iceberg メタデータキャッシュの最大サイズ（バイト単位）。0 にすると無効になります。

## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Iceberg メタデータキャッシュにおける、キャッシュ全体サイズに対する（SLRU ポリシーの場合の）保護キューのサイズの割合。

## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、ClickHouse は SQL セキュリティステートメントが空の `CREATE VIEW` クエリに既定値を書き込みません。

:::note
この設定が必要なのは移行期間中のみであり、24.4 以降は廃止される予定です。
:::

## include&#95;from {#include_from}

置換定義を記述したファイルへのパスです。XML と YAML の両方の形式がサポートされています。

詳細については「[Configuration files](/operations/configuration-files)」セクションを参照してください。

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

値を `0` にすると、無効化されます。

この設定は実行時に変更でき、即座に反映されます。
:::

## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />セカンダリ索引マークキャッシュにおける（SLRU ポリシーの場合の）保護キューのサイズが、そのキャッシュ全体のサイズに占める割合を指定します。

## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリ索引用の非圧縮キャッシュポリシーの名前。

## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`MergeTree` の索引における非圧縮ブロック用キャッシュの最大サイズ。

:::note
`0` を指定すると無効になります。

この設定は実行時に変更でき、直ちに反映されます。
:::

## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />セカンダリ索引の非圧縮キャッシュにおける保護キュー（SLRU ポリシー使用時）のサイズを、キャッシュ全体サイズに対する比率で指定します。

## interserver&#95;http&#95;credentials {#interserver_http_credentials}

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)中に他のサーバーへ接続するために使用されるユーザー名とパスワードです。さらに、サーバーはこれらの認証情報を使って他のレプリカを認証します。
したがって、`interserver_http_credentials` はクラスター内のすべてのレプリカで同一である必要があります。

:::note

* デフォルトでは、`interserver_http_credentials` セクションが省略されている場合、レプリケーション時に認証は使用されません。
* `interserver_http_credentials` の設定は、ClickHouse クライアント認証情報の[構成](../../interfaces/cli.md#configuration_files)とは関係ありません。
* これらの認証情報は、`HTTP` および `HTTPS` によるレプリケーションで共通です。
  :::

以下の設定はサブタグで設定できます:

* `user` — ユーザー名。
* `password` — パスワード。
* `allow_empty` — `true` の場合、認証情報が設定されていても、他のレプリカが認証なしで接続することを許可します。`false` の場合、認証なしの接続は拒否されます。デフォルト: `false`。
* `old` — 認証情報ローテーション中に使用される古い `user` と `password` を保持します。複数の `old` セクションを指定できます。

**認証情報のローテーション**

ClickHouse は、すべてのレプリカを同時に停止して設定を更新することなく、サーバー間 HTTP 認証情報の動的なローテーションをサポートします。認証情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、認証情報を追加します。これにより、認証ありおよび認証なしの両方の接続が許可されます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカの設定が完了したら、`allow_empty` を `false` に変更するか、この設定を削除してください。これにより、新しい認証情報を用いた認証が必須になります。

既存の認証情報を変更するには、`interserver_http_credentials.old` セクションにユーザー名とパスワードを移動し、`user` と `password` を新しい値に更新します。この時点で、サーバーは他のレプリカへ接続する際には新しい認証情報を使用し、他のレプリカからの接続については新旧どちらの認証情報も受け付けます。

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

他のサーバーがこのサーバーにアクセスするために利用するホスト名です。

省略した場合は、`hostname -f` コマンドと同じ方法で定義されます。

特定のネットワークインターフェイスから切り離したい場合に有用です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver&#95;http&#95;port {#interserver_http_port}

ClickHouse サーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver&#95;https&#95;host {#interserver_https_host}

[`interserver_http_host`](#interserver_http_host) と同様で、他のサーバーが `HTTPS` 経由でこのサーバーにアクセスする際に使用されるホスト名です。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver&#95;https&#95;port {#interserver_https_port}

`HTTPS` 経由で ClickHouse サーバー間でデータを交換するためのポートです。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver&#95;listen&#95;host {#interserver_listen_host}

ClickHouse サーバー間でデータをやり取りできるホストを制限します。
Keeper を使用している場合、この制限は異なる Keeper インスタンス間の通信にも適用されます。

:::note
デフォルトでは、この値は [`listen_host`](#listen_host) 設定と同じです。
:::

**例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

型:

デフォルト値:


## io_thread_pool_queue_size {#io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

I/O スレッドプールでスケジュール可能なジョブ数の最大値。

:::note
`0` の場合は無制限を意味します。
:::

## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />jemalloc によるサンプリングされたメモリ割り当てを system.trace_log に保存します

## jemalloc_enable_background_threads {#jemalloc_enable_background_threads} 

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc のバックグラウンドスレッドを有効にします。jemalloc は未使用のメモリページを解放するためにバックグラウンドスレッドを使用します。これを無効にすると、パフォーマンスの低下を招く可能性があります。

## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />すべてのスレッドでjemallocのアロケーションプロファイラを有効にします。jemallocはアロケーションをサンプリングし、サンプリングされたアロケーションに対するすべての解放を記録します。
プロファイルは、アロケーション解析に利用できる SYSTEM JEMALLOC FLUSH PROFILE を使用してフラッシュできます。
プロファイルサンプルは、設定 `jemalloc_collect_global_profile_samples_in_trace_log` またはクエリ設定 `jemalloc_collect_profile_samples_in_trace_log` を使用して `system.trace_log` に保存することもできます。
[Allocation Profiling](/operations/allocation-profiling) を参照してください。

## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />グローバルなピークメモリ使用量が jemalloc_flush_profile_interval_bytes だけ増加したタイミングで、jemalloc プロファイルがフラッシュされます

## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded} 

<SettingsInfoBlock type="Bool" default_value="0" />総メモリ超過エラー発生時に jemalloc プロファイルをフラッシュします

## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />作成する jemalloc バックグラウンドスレッドの最大数。0 に設定すると jemalloc のデフォルト値を使用します

## keep&#95;alive&#95;timeout {#keep_alive_timeout}

<SettingsInfoBlock type="Seconds" default_value="30" />

ClickHouse が HTTP プロトコルでの受信リクエストを待ち、接続を閉じるまでの待機時間（秒）。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts {#keeper_hosts} 

動的な設定です。ClickHouse が接続先として利用できる [Zoo]Keeper ホストの Set を含みます。`<auxiliary_zookeepers>` に設定された情報は反映されません。

## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

バッチ処理をサポートする [Zoo]Keeper への MultiRead リクエストに対するバッチの最大サイズです。0 に設定すると、バッチ処理は無効になります。ClickHouse Cloud でのみ利用可能です。

## ldap_servers {#ldap_servers} 

ここに LDAP サーバーとその接続パラメータを列挙して、次の用途に使用します:

- 専用ローカルユーザーに対する認証手段として使用する（`password` の代わりに `ldap` 認証メカニズムが指定されているユーザー）
- リモートユーザーディレクトリとして使用する。

以下の設定はサブタグで構成できます:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP サーバーのホスト名または IP。必須パラメータであり、空にはできません。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP サーバーのポート。`enable_tls` が true に設定されている場合のデフォルトは 636、それ以外の場合は `389` です。                                                                                                                                                                                                                                                                                                                            |
| `bind_dn`                      | バインドする DN を構成するために使用されるテンプレート。最終的な DN は、認証試行ごとに、このテンプレート内のすべての `\{user_name\}` 部分文字列を実際のユーザー名に置き換えることで構成されます。                                                                                                                                                                                                                               |
| `user_dn_detection`            | バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータを含むセクション。これは主に、サーバーが Active Directory の場合に、その後のロールマッピングのための検索フィルターで使用されます。最終的なユーザー DN は、`\{user_dn\}` 部分文字列を置き換える際に使用されます。デフォルトではユーザー DN は bind DN と同一に設定されますが、検索が実行されると、検出された実際のユーザー DN の値で更新されます。 |
| `verification_cooldown`        | バインドが一度成功した後、その後のリクエストについては LDAP サーバーに問い合わせることなく、ユーザーが認証済みであるとみなされる時間（秒単位）。キャッシュを無効にして、各認証リクエストごとに LDAP サーバーへ問い合わせるには、`0`（デフォルト）を指定します。                                                                                                                  |
| `enable_tls`                   | LDAP サーバーへの安全な接続の使用を有効化するためのフラグ。プレーンテキスト（`ldap://`）プロトコル（非推奨）には `no` を指定します。SSL/TLS 上の LDAP（`ldaps://`）プロトコル（推奨、デフォルト）には `yes` を指定します。レガシーな StartTLS プロトコル（プレーンテキスト（`ldap://`）プロトコルを TLS にアップグレード）には `starttls` を指定します。                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLS の最小プロトコルバージョン。指定可能な値は `ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（デフォルト）です。                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`             | SSL/TLS ピア証明書の検証動作。指定可能な値は `never`、`allow`、`try`、`demand`（デフォルト）です。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 証明書キー ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | CA 証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 許可される暗号スイート（OpenSSL 表記）。                                                                                                                                                                                                                                                                                                                                                                                              |

`user_dn_detection` 設定はサブタグで構成できます:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP 検索のベース DN を構成するために使用されるテンプレート。最終的な DN は、LDAP 検索中に、このテンプレート内のすべての `\{user_name\}` および `\{bind_dn\}` 部分文字列を、実際のユーザー名および bind DN に置き換えることによって構成されます。                                                                                                       |
| `scope`         | LDAP 検索のスコープ。指定可能な値は `base`、`one_level`、`children`、`subtree`（デフォルト）です。                                                                                                                                                                                                                                       |
| `search_filter` | LDAP 検索の検索フィルターを構成するために使用されるテンプレート。最終的なフィルターは、LDAP 検索中に、このテンプレート内のすべての `\{user_name\}`、`\{bind_dn\}`、および `\{base_dn\}` 部分文字列を、実際のユーザー名、bind DN、base DN に置き換えることで構成されます。特殊文字は XML 内で正しくエスケープする必要がある点に注意してください。  |

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

例：典型的な Active Directory 環境で、後続のロールマッピングのためにユーザー DN 検出を設定したもの

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

ClickHouse Enterprise Edition 用のライセンスキー

## listen&#95;backlog {#listen_backlog}

listen ソケットの backlog（保留中接続のキューサイズ）です。デフォルト値 `4096` は Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4) と同じです。

通常、この値を変更する必要はありません。理由は次のとおりです。

* デフォルト値が十分に大きいこと
* クライアント接続の accept 用にサーバー側で専用スレッドがあること

したがって、`TcpExtListenOverflows`（`nstat` の値）が 0 以外であり、ClickHouse サーバーでこのカウンタが増加していても、この値を増やす必要があるとは限りません。理由は次のとおりです。

* 通常、`4096` で足りない場合は ClickHouse 内部のスケーリング上の問題を示しているため、Issue を報告した方がよいです。
* この値を増やしても、後でサーバーがより多くの接続を処理できることを意味しません（仮に処理できたとしても、その時点までにクライアントはすでに離脱しているか切断されている可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen&#95;host {#listen_host}

リクエストの接続元ホストを制限します。すべてのホストからのリクエストをサーバーで受け付ける場合は、`::` を指定します。

例:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen&#95;reuse&#95;port {#listen_reuse_port}

複数のサーバーが同じアドレスとポート番号で待ち受けられるようにします。リクエストはオペレーティングシステムによってランダムなサーバーにルーティングされます。この設定を有効化することは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

型:

デフォルト:


## listen&#95;try {#listen_try}

listen を試みている間に IPv6 または IPv4 ネットワークが使用不能でも、サーバーは終了しません。

**例**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />マーク読み込み用バックグラウンドスレッドプールのサイズ

## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />プリフェッチプールに投入できるタスク数の上限

## logger {#logger} 

ログメッセージの出力先とフォーマットを設定します。

**キー**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | ログレベル。指定可能な値: `none`（ログ出力を無効化）、`fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                      |
| `log`                  | ログファイルへのパス。                                                                                                                                             |
| `errorlog`             | エラーログファイルへのパス。                                                                                                                                       |
| `size`                 | ローテーションポリシー: ログファイルの最大サイズ（バイト単位）。ログファイルサイズがこの閾値を超えると、名前が変更されてアーカイブされ、新しいログファイルが作成されます。 |
| `count`                | ローテーションポリシー: 保持される ClickHouse の履歴ログファイル数の上限。                                                                                        |
| `stream_compress`      | LZ4 を使用してログメッセージを圧縮します。有効化するには `1` または `true` を設定します。                                                                           |
| `console`              | コンソールへのログ出力を有効化します。有効化するには `1` または `true` を設定します。ClickHouse がデーモンモードで動作していない場合のデフォルトは `1`、それ以外は `0` です。 |
| `console_log_level`    | コンソール出力用のログレベル。デフォルトは `level` と同じです。                                                                                                    |
| `formatting.type`      | コンソール出力のログフォーマット。現在は `json` のみサポートされています。                                                                                         |
| `use_syslog`           | 併せて syslog にもログ出力を転送します。                                                                                                                           |
| `syslog_level`         | syslog へのログ出力用のログレベル。                                                                                                                                |
| `async`                | `true`（デフォルト）の場合、ログ出力は非同期で行われます（出力チャネルごとに 1 つのバックグラウンドスレッド）。`false` の場合は LOG を呼び出したスレッド内でログを出力します。 |
| `async_queue_max_size` | 非同期ロギングを使用する場合、フラッシュ待ちのメッセージをキューに保持しておける最大数。これを超えたメッセージは破棄されます。                                      |
| `startup_level`        | サーバー起動時にルートロガーのレベルを設定するための起動時レベル。起動後はログレベルが `level` 設定に戻されます。                                                   |
| `shutdown_level`       | サーバーのシャットダウン時にルートロガーのレベルを設定するためのシャットダウン時レベル。                                                                           |

**ログフォーマット指定子**

`log` および `errorLog` パス内のファイル名では、最終的なファイル名に対して以下のフォーマット指定子を使用できます（ディレクトリ部分では使用できません）。

列 "Example" には、`2023-07-06 18:32:07` における出力例が示されています。

| 書式指定子 | 説明                                                                                                                 | 例                          |
| ----- | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `%%`  | パーセント記号そのもの                                                                                                        | `%`                        |
| `%n`  | 改行文字                                                                                                               |                            |
| `%t`  | 水平タブ文字                                                                                                             |                            |
| `%Y`  | 年を10進数で表した値 (例: 2017)                                                                                              | `2023`                     |
| `%y`  | 年の末尾2桁を10進数で表したもの（範囲 [00,99]）                                                                                      | `23`                       |
| `%C`  | 年の先頭2桁を10進数で表した値（範囲 [00,99]）                                                                                       | `20`                       |
| `%G`  | 4桁の[ISO 8601 週番号に基づく年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)。指定された週を含む年を表します。通常は `%V` と組み合わせてのみ使用されます | `2023`                     |
| `%g`  | [ISO 8601 週番号付き年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)の下2桁。指定された週を含む年を指す。                            | `23`                       |
| `%b`  | 月名の省略形。例: Oct（ロケール依存）                                                                                              | `Jul`                      |
| `%h`  | %b と同じ                                                                                                             | `Jul`                      |
| `%B`  | 月名（フルスペル）。例: October（ロケールに依存）                                                                                      | `7月`                       |
| `%m`  | 月を 10 進数で表した値（範囲 [01,12]）                                                                                          | `07`                       |
| `%U`  | 年内の週番号（10進数表記、週の最初の曜日は日曜日）（[00,53] の範囲）                                                                            | `27`                       |
| `%W`  | 年内の週番号を10進数で表したもの（週の開始曜日は月曜日）（範囲 [00,53]）                                                                          | `27`                       |
| `%V`  | ISO 8601 に基づく週番号（範囲 [01,53]）                                                                                       | `27`                       |
| `%j`  | 年内通算日を表す10進数（範囲 [001,366]）                                                                                         | `187`                      |
| `%d`  | 月の日付をゼロ埋めした10進数で表します（範囲 [01,31]）。1桁の場合は先頭にゼロが付きます。                                                                 | `06`                       |
| `%e`  | 月の日付を、スペースで桁埋めした 10 進数で表します（範囲 [1,31]）。1 桁の場合は前にスペースが付きます。                                                         | `&nbsp; 6`                 |
| `%a`  | 曜日名の省略形。例: Fri（ロケール依存）                                                                                             | `Thu`                      |
| `%A`  | 曜日名の完全表記。例: Friday（ロケールに依存）                                                                                        | `木曜日`                      |
| `%w`  | 日曜日を0とする曜日を表す整数値（範囲 [0-6]）                                                                                         | `4`                        |
| `%u`  | 月曜日を1とする曜日の10進数表現（ISO 8601 形式、範囲 [1-7]）                                                                            | `4`                        |
| `%H`  | 時を10進数で表したもの（24時間制、範囲 [00-23]）                                                                                     | `18`                       |
| `%I`  | 10 進数で表した時（12 時間制、範囲 [01,12]）                                                                                      | `06`                       |
| `%M`  | 分を10進数で表した数値（範囲 [00,59]）                                                                                           | `32`                       |
| `%S`  | 10進数の秒数（範囲 [00,60]）                                                                                                | `07`                       |
| `%c`  | 標準的な日付と時刻の文字列。例: Sun Oct 17 04:41:13 2010（ロケールに依存）                                                                 | `Thu Jul  6 18:32:07 2023` |
| `%x`  | ローカライズされた日付表現（ロケール依存）                                                                                              | `2023/07/06`               |
| `%X`  | ローカライズされた時刻表記。例: 18:40:20 または 6:40:20 PM（ロケールに依存）                                                                  | `18:32:07`                 |
| `%D`  | 短い MM/DD/YY 形式の日付（%m/%d/%y と同等）                                                                                    | `07/06/23`                 |
| `%F`  | 短い YYYY-MM-DD 形式の日付（%Y-%m-%d と同等）                                                                                  | `2023-07-06`               |
| `%r`  | ロケールに依存する12時間制の時刻表記                                                                                                | `午後06:32:07`               |
| `%R`  | &quot;%H:%M&quot; と同じ                                                                                              | `18:32`                    |
| `%T`  | &quot;%H:%M:%S&quot; と同じ（ISO 8601 の時刻形式）                                                                           | `18:32:07`                 |
| `%p`  | ロケールに応じた午前/午後の表記（ロケール依存）                                                                                           | `PM`                       |
| `%z`  | ISO 8601 形式の UTC からのオフセット（例: -0430）、またはタイムゾーン情報が利用できない場合は何も出力しない                                                   | `+0800`                    |
| `%Z`  | ロケールに依存するタイムゾーン名または略語。タイムゾーン情報が利用できない場合は何も出力されません                                                                  | `Z AWST `                  |

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

コンソールにのみログメッセージを出力するには、次のようにします。

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個々のログ名ごとにログレベルを上書きできます。たとえば、ロガー「Backup」と「RBAC」のすべてのメッセージを抑制するには次のようにします。

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

| Key        | Description                                                                                                                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | `host\[:port\]` 形式の syslog のアドレス。省略した場合、ローカルのデーモンが使用されます。                                                                                                                                                                           |
| `hostname` | ログを送信するホストの名前（任意）。                                                                                                                                                                                                                  |
| `facility` | syslog の [facility keyword](https://en.wikipedia.org/wiki/Syslog#Facility)。必ず先頭に &quot;LOG&#95;&quot; を付け、大文字で指定する必要があります（例: `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` など）。デフォルト: `address` が指定されている場合は `LOG_USER`、それ以外は `LOG_DAEMON`。 |
| `format`   | ログメッセージのフォーマット。指定可能な値: `bsd` および `syslog`。                                                                                                                                                                                          |

**ログフォーマット**

コンソールログに出力されるログのフォーマットを指定できます。現在は JSON のみがサポートされています。

**例**

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
  "message": "Received signal 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

JSON ログ出力を有効にするには、次のスニペットを使用してください。

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Can be configured on a per-channel basis (log, errorlog, console, syslog), or globally for all channels (then just omit it). -->
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

ログのプロパティは、そのプロパティをコメントアウトすることで省略できます。たとえば、ログに `query_id` を出力したくない場合は、`<query_id>` タグをコメントアウトします。


## macros {#macros}

レプリケートテーブル向けのパラメータ置換に使用されます。

レプリケートテーブルを使用しない場合は省略できます。

詳細は、[レプリケートテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) セクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```


## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />mark cache のポリシー名。

## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />プリウォームで事前に埋めておく mark cache の総サイズの比率。

## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

[`MergeTree`](/engines/table-engines/mergetree-family) ファミリーのテーブルで使用されるマーク索引のキャッシュの最大サイズ。

:::note
この設定は実行時に変更でき、直ちに反映されます。
:::

## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />マークキャッシュにおいて（SLRU ポリシーの場合）保護キューのサイズがキャッシュ全体サイズに対して占める割合。

## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />起動時にアクティブ状態のデータパーツ集合を読み込むためのスレッド数。

## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />

1人のユーザーに対して、作成時または変更時に設定できる認証方法の最大数です。
この設定を変更しても、既存のユーザーには影響しません。この設定で指定した上限を超える認証関連の `CREATE` / `ALTER` クエリは失敗します。
認証に関係しない `CREATE` / `ALTER` クエリは成功します。

:::note
値が `0` の場合は、無制限を意味します。
:::

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべてのバックアップに対する、1 秒あたりの最大読み取り速度（バイト単位）。0 は無制限を意味します。

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Backups IO Thread プール内の**アイドル**スレッド数が `max_backup_io_thread_pool_free_size` を超えた場合、ClickHouse はアイドル状態にあるスレッドが占有しているリソースを解放し、プールのサイズを縮小します。必要に応じてスレッドは再度作成されます。

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse は S3 バックアップの I/O 操作を実行するために Backups IO Thread プールからスレッドを使用します。`max_backups_io_thread_pool_size` は、このプール内のスレッド数の最大値を制御します。

## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

ベクトル索引を構築する際に使用するスレッドの最大数。

:::note
値が `0` の場合、すべてのコアを使用します。
:::

## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行できる INSERT クエリ総数の上限。

:::note

値が `0`（デフォルト）の場合は無制限を意味します。

この設定は実行時に変更でき、変更は即座に反映されます。すでに実行中のクエリには影響しません。
:::

## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行されるクエリの総数の上限を指定します。`INSERT` および `SELECT` クエリに対する制限や、ユーザーごとのクエリ数の最大値に対する制限も合わせて考慮する必要があります。

参照:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

値 `0`（デフォルト）は無制限を意味します。

この設定は実行時に変更でき、即座に反映されます。すでに実行中のクエリには影響しません。
:::

## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行できる `SELECT` クエリの総数の上限。

:::note

値が `0`（デフォルト）の場合は無制限であることを意味します。

この設定は実行時に変更でき、直ちに反映されます。すでに実行中のクエリには影響しません。
:::

## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />サーバーへの最大同時接続数。

## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />データベースの数がこの値を超えた場合、サーバーは例外を発生させます。0 の場合は制限なしを意味します。

## max&#95;database&#95;num&#95;to&#95;warn {#max_database_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

ATTACH されているデータベース数が指定された値を超えた場合、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />DatabaseReplicated でレプリカ復旧中にテーブルを作成するスレッド数。0 の場合は、スレッド数はコア数と同じになります。

## max&#95;dictionary&#95;num&#95;to&#95;throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Dictionary の数がこの値より大きい場合、サーバーは例外を送出します。

次のデータベースエンジンを使用するテーブルだけがカウント対象です:

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

アタッチされている Dictionary の数が指定された値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーでの分散キャッシュからの読み取り速度の合計上限（1秒あたりのバイト数）。0 の場合は無制限を意味します。

## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上の分散キャッシュへの合計書き込み速度の上限（1 秒あたりのバイト数）。0 は無制限を意味します。

## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />集約中に収集されるハッシュテーブル統計情報に含めることができるエントリ数の上限

## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITION に使用するスレッド数。

## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

入力データのパース用スレッドプールに保持しておくアイドル状態のスレッド数の上限。

## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

入力データの解析に使用するスレッドの合計最大数。

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

IO スレッドプール内のアイドル状態のスレッド数が `max_io_thread_pool_free_size` を超えると、ClickHouse はアイドル状態のスレッドによって占有されているリソースを解放し、プールサイズを縮小します。必要に応じてスレッドは再作成されます。

## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse は IO スレッドプール内のスレッドを使用して、一部の IO 処理（例: S3 とのやり取り）を実行します。`max_io_thread_pool_size` は、このプール内のスレッド数の最大値を設定します。

## max&#95;keep&#95;alive&#95;requests {#max_keep_alive_requests}

<SettingsInfoBlock type="UInt64" default_value="10000" />

単一の keep-alive 接続で処理できるリクエストの最大数。この上限に達すると、接続は ClickHouse サーバーによって閉じられます。

**例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカル読み取りの最大速度（バイト/秒）。

:::note
値が `0` の場合は無制限です。
:::

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカル書き込みの最大速度（1 秒あたりのバイト数）。

:::note
`0` を指定すると無制限になります。
:::

## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルに紐付けられる materialized view の数の上限です。

:::note
ここで対象となるのは直接依存しているビューのみであり、あるビューの上にさらに別のビューを作成しても考慮されません。
:::

## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべてのマージ処理における最大読み取り速度（バイト/秒単位）。0 の場合は無制限です。

## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべてのミューテーションに対する最大読み取り帯域幅（1 秒あたりのバイト数）。0 は無制限を意味します。

## max&#95;named&#95;collection&#95;num&#95;to&#95;throw {#max_named_collection_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

名前付きコレクションの数がこの値を超えると、サーバーは例外を発生させます。

:::note
`0` の値は制限なしを意味します。
:::

**例**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max&#95;named&#95;collection&#95;num&#95;to&#95;warn {#max_named_collection_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

名前付きコレクションの数が指定した値を超えると、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max&#95;open&#95;files {#max_open_files}

同時に開いておくことができるファイルの最大数。

:::note
macOS では `getrlimit()` 関数が誤った値を返すため、このオプションの使用を推奨します。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```


## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

接続を切断するかどうかを判断するための、OS における CPU の待ち時間（OSCPUWaitMicroseconds メトリクス）と CPU のビジー時間（OSCPUVirtualTimeMicroseconds メトリクス）の最大比率です。確率を計算するために最小比率と最大比率の間で線形補間が行われ、この最大比率の時点では確率は 1 になります。
詳細については、[サーバー CPU 過負荷時の動作制御](/operations/settings/server-overload) を参照してください。

## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />起動時に非アクティブな（古い）データパーツ集合を読み込むスレッド数。

## max&#95;part&#95;num&#95;to&#95;warn {#max_part_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="100000" />

アクティブなパーツ数が指定した値を超えると、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max&#95;partition&#95;size&#95;to&#95;drop {#max_partition_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

パーティション削除に関する制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが [`max_partition_size_to_drop`](#max_partition_size_to_drop)（バイト単位）を超える場合、[DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) クエリを使用してパーティションを削除することはできません。
この設定を適用するために ClickHouse サーバーの再起動は不要です。この制限を無効化する別の方法としては、`<clickhouse-path>/flags/force_drop_table` ファイルを作成することもできます。

:::note
値 `0` は、制限なしでパーティションを削除できることを意味します。

この制限は DROP TABLE および TRUNCATE TABLE には影響しません。詳しくは [max&#95;table&#95;size&#95;to&#95;drop](/operations/settings/settings#max_table_size_to_drop) を参照してください。
:::

**例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />非アクティブなデータパーツを並列に削除するためのスレッド数。

## max&#95;pending&#95;mutations&#95;execution&#95;time&#95;to&#95;warn {#max_pending_mutations_execution_time_to_warn}

<SettingsInfoBlock type="UInt64" default_value="86400" />

保留中の mutation の実行時間が指定した秒数を超えた場合、clickhouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max&#95;pending&#95;mutations&#95;to&#95;warn {#max_pending_mutations_to_warn}

<SettingsInfoBlock type="UInt64" default_value="500" />

保留中のミューテーションの数が指定値を超えると、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

prefixes のデシリアライズ用スレッドプール内の**アイドル**スレッド数が `max_prefixes_deserialization_thread_pool_free_size` を超える場合、ClickHouse はアイドル状態のスレッドが占有しているリソースを解放し、プールサイズを縮小します。必要に応じてスレッドは再度作成されます。

## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse は、MergeTree の Wide パーツにおけるファイルプレフィックスからカラムおよびサブカラムのメタデータを並列に読み取るために、prefixes デシリアライズ用スレッドプールのスレッドを使用します。`max_prefixes_deserialization_thread_pool_size` は、そのプール内のスレッド数の上限を設定します。

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時における、ネットワーク経由でのデータ転送の最大速度（1 秒あたりのバイト数）。

:::note
`0`（デフォルト）の場合は無制限を意味します。
:::

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

書き込み時に、ネットワーク経由で行われるデータ交換の最大速度（1 秒あたりのバイト数）。

:::note
`0`（デフォルト）の場合は無制限を意味します。
:::

## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケートフェッチに対する、ネットワーク上でのデータ交換の最大速度（バイト/秒）。0 は無制限を意味します。

## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケート送信に対し、ネットワーク経由でのデータ送受信の最大速度をバイト/秒で指定します。0 を指定すると無制限になります。

## max&#95;replicated&#95;table&#95;num&#95;to&#95;throw {#max_replicated_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

レプリケートテーブルの数がこの値を超えると、サーバーは例外をスローします。

次のデータベースエンジンに属するテーブルのみをカウントします:

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

サーバーが使用することを許可されているメモリの最大量（バイト単位）を指定します。

:::note
サーバーの最大メモリ使用量は、`max_server_memory_usage_to_ram_ratio` の設定によってさらに制限されます。
:::

特別なケースとして、値が `0`（デフォルト）の場合、サーバーは（`max_server_memory_usage_to_ram_ratio` による追加の制限を除き）利用可能なメモリをすべて使用できることを意味します。

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />

サーバーが使用することを許可されているメモリの最大量を、利用可能なメモリ全体に対する比率で指定します。

たとえば、値が `0.9`（デフォルト）の場合、サーバーは利用可能なメモリの 90% を使用できます。

メモリ容量の少ないシステムでメモリ使用量を抑えるために利用できます。
RAM とスワップが少ないホストでは、[`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) を 1 より大きな値に設定する必要が生じる場合があります。

:::note
サーバーの最大メモリ使用量は、`max_server_memory_usage` の設定によってさらに制限されます。
:::

## max&#95;session&#95;timeout {#max_session_timeout}

セッションの最大タイムアウト値（秒単位）。

例：

```xml
<max_session_timeout>3600</max_session_timeout>
```


## max&#95;table&#95;num&#95;to&#95;throw {#max_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブル数がこの値より大きい場合、サーバーは例外をスローします。

次の種類のテーブルはカウントの対象外です:

* view
* remote
* dictionary
* system

次のデータベースエンジンを使用するテーブルのみがカウントされます:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
値 `0` は制限がないことを意味します。
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

テーブルの削除に対する制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが `max_table_size_to_drop`（バイト単位）を超える場合、[`DROP`](../../sql-reference/statements/drop.md) クエリまたは [`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリを使用して削除することはできません。

:::note
値が `0` の場合、任意のテーブルを制限なしに削除できます。

この設定を適用するために ClickHouse サーバーの再起動は不要です。この制限を無効化する別の方法として、`<clickhouse-path>/flags/force_drop_table` ファイルを作成することもできます。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部集約、結合、ソートのためにディスク上に使用できる一時データ領域の最大サイズ。
この制限を超えたクエリは、例外を発生させて失敗します。

:::note
値が `0` の場合は無制限を意味します。
:::

あわせて参照:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max&#95;thread&#95;pool&#95;free&#95;size {#max_thread_pool_free_size}

<SettingsInfoBlock type="UInt64" default_value="1000" />

グローバルスレッドプール内の**アイドル**スレッド数が [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size) を上回る場合、ClickHouse は一部のスレッドが占有しているリソースを解放し、プールサイズを縮小します。必要に応じてスレッドは再度作成されます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```


## max&#95;thread&#95;pool&#95;size {#max_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse はクエリを処理するためにグローバルスレッドプールのスレッドを使用します。クエリを処理するための空きスレッドがない場合は、プール内に新しいスレッドが作成されます。`max_thread_pool_size` はプール内のスレッド数の最大値を制限します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```


## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />起動時に、非アクティブな（予期しない）データパーツのセットを読み込むために使用するスレッド数。

## max&#95;view&#95;num&#95;to&#95;throw {#max_view_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

ビューの数がこの値を超えると、サーバーは例外をスローします。

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
<max_view_num_to_throw>400</max_view_num_to_throw>
```


## max&#95;view&#95;num&#95;to&#95;warn {#max_view_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="10000" />

アタッチされている VIEW の数が指定した値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に待機状態になっているクエリの総数に対する上限です。
待機中のクエリの実行は、必要なテーブルが非同期にロードされている間ブロックされます（[`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases) を参照）。

:::note
次の設定で制御される制限値を判定する際には、待機中のクエリはカウントされません。

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

これは、サーバー起動直後にこれらの制限にすぐ達してしまうことを避けるための調整です。
:::

:::note

値が `0`（デフォルト）の場合は無制限を意味します。

この設定は実行時に変更でき、即座に反映されます。すでに実行中のクエリには影響しません。
:::

## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />

バックグラウンドメモリワーカーが、jemalloc や cgroups などの外部ソースからの情報に基づいて内部メモリトラッカーを補正するかどうかを制御します。

## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

メモリトラッカーによるメモリ使用量を補正し、メモリ使用量が高い場合に未使用ページをクリーンアップするバックグラウンドメモリワーカーのティック間隔を指定します。0 に設定すると、メモリ使用元に応じてデフォルト値が使用されます。

## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />現在の cgroup におけるメモリ使用量の情報を使用して、メモリトラッキングを補正します。

## merge&#95;tree {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブル向けの細かなチューニングを行います。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />

マージ処理とその他のワークロード間で、リソースの利用および共有方法を調整するために使用します。指定した値は、すべてのバックグラウンドでのマージ処理に対する `workload` 設定値として使用されます。MergeTree の設定によって上書きできます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## merges&#95;mutations&#95;memory&#95;usage&#95;soft&#95;limit {#merges_mutations_memory_usage_soft_limit}

<SettingsInfoBlock type="UInt64" default_value="0" />

マージおよびミューテーション処理を実行するために使用できる RAM の使用量上限を設定します。
ClickHouse がこの上限に達すると、新しいバックグラウンドのマージおよびミューテーション処理はスケジュールされなくなりますが、すでにスケジュール済みのタスクの実行は継続されます。

:::note
値が `0` の場合は無制限を意味します。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />

`merges_mutations_memory_usage_soft_limit` のデフォルト値は、`memory_amount * merges_mutations_memory_usage_to_ram_ratio` として計算されます。

**関連項目:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric&#95;log {#metric_log}

デフォルトでは無効になっています。

**有効化**

メトリクス履歴の収集 [`system.metric_log`](../../operations/system-tables/metric_log.md) を手動で有効化するには、次の内容で `/etc/clickhouse-server/config.d/metric_log.xml` を作成します。

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

`metric_log` 設定を無効にするには、次の内容でファイル `/etc/clickhouse-server/config.d/disable_metric_log.xml` を作成します。

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

接続を切断するかどうかを判断するための、OS の CPU 待ち時間（`OSCPUWaitMicroseconds` メトリック）とビジー時間（`OSCPUVirtualTimeMicroseconds` メトリック）との最小比です。最小比と最大比の間で線形補間を用いて確率を計算し、この比における確率は 0 になります。
詳細については、[サーバー CPU 過負荷時の動作制御](/operations/settings/server-overload) を参照してください。

## mlock&#95;executable {#mlock_executable}

起動後に `mlockall` を実行して、最初のクエリのレイテンシーを下げ、高い IO 負荷時に ClickHouse の実行ファイルがスワップアウトされるのを防ぎます。

:::note
このオプションを有効にすることは推奨されます。ただし、起動時間が数秒程度長くなる場合があります。
また、この設定は &quot;CAP&#95;IPC&#95;LOCK&quot; ケーパビリティがないと動作しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```


## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

この設定により、頻繁な open/close 呼び出し（連続するページフォールトのため非常にコストが高い）を回避し、複数のスレッドやクエリ間でマッピングを再利用できます。設定値はマッピングされる領域の数（通常はマッピングされるファイル数と同じ）を表します。

マップされたファイル内のデータ量は、次の system テーブルにあるメトリクスで監視できます。

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` in [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` in [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
マップされたファイル内のデータ量はメモリを直接消費せず、クエリやサーバーのメモリ使用量としても計上されません。これは、このメモリが OS のページキャッシュと同様に破棄可能であるためです。MergeTree ファミリーに属するテーブルで古いパーツが削除されるときにキャッシュ（ファイル）は自動的にドロップされますが、`SYSTEM DROP MMAP CACHE` クエリを使用して手動でドロップすることもできます。

この設定は実行時に変更でき、即座に反映されます。
:::

## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />

ミューテーションと他のワークロード間で、リソースの利用と共有方法を制御するために使用します。指定した値は、すべてのバックグラウンドミューテーションに対する `workload` 設定値として使用されます。MergeTree エンジンの設定で上書きできます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## mysql&#95;port {#mysql_port}

MySQL プロトコルでクライアントと通信するためのポート。

:::note

* 正の整数を指定すると、そのポート番号で待ち受けます
* 空の値を指定すると、MySQL プロトコルでのクライアントとの通信は無効になります。
  :::

**例**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport {#mysql_require_secure_transport} 

true に設定した場合、[mysql_port](#mysql_port) 経由でクライアントとのセキュアな通信が必須となります。`--ssl-mode=none` オプションによる接続は拒否されます。[OpenSSL](#openssl) の設定と併せて使用してください。

## openSSL {#openssl} 

SSL クライアント/サーバーの構成。

SSL のサポートは `libpoco` ライブラリによって提供されます。利用可能な構成オプションについては、[SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) を参照してください。デフォルト値は [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) に記載されています。

サーバー/クライアント構成用のキー:

| オプション                         | 説明                                                                                                                                                                                                                                                                                                                                                  | デフォルト値                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 証明書の秘密鍵が格納されたファイルへのパス。鍵と証明書を同一ファイルに含めることもできます。                                                                                                                                                                                                                                                                                                  |                                                                                            |
| `certificateFile`             | PEM 形式のクライアント証明書／サーバー証明書ファイルへのパス。`privateKeyFile` に証明書が含まれている場合は省略できます。                                                                                                                                                                                                                                                                             |                                                                                            |
| `caConfig`                    | 信頼された CA 証明書を含むファイルまたはディレクトリへのパス。このパスがファイルを指す場合、そのファイルは PEM 形式である必要があり、複数の CA 証明書を含めることができます。このパスがディレクトリを指す場合、そのディレクトリには CA 証明書ごとに 1 つの .pem ファイルを含める必要があります。ファイル名は CA 証明書のサブジェクト名ハッシュ値で検索されます。詳細は [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) の man ページを参照してください。 |                                                                                            |
| `verificationMode`            | ノードの証明書の検証方式を指定します。詳細は [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明を参照してください。指定可能な値: `none`, `relaxed`, `strict`, `once`。                                                                                                                                                      | `relaxed`                                                                                  |
| `verificationDepth`           | 検証チェーンの最大長です。証明書チェーンの長さがこの設定値を超えると、検証は失敗します。                                                                                                                                                                                                                                                                                                        | `9`                                                                                        |
| `loadDefaultCAFile`           | OpenSSL の組み込み CA 証明書を使用するかどうかを指定します。ClickHouse は、組み込みの CA 証明書がファイル `/etc/ssl/cert.pem`（またはディレクトリ `/etc/ssl/certs`）にあるか、環境変数 `SSL_CERT_FILE`（または `SSL_CERT_DIR`）で指定されたファイル（またはディレクトリ）内に存在すると仮定します。                                                                                                                                                   | `true`                                                                                     |
| `cipherList`                  | サポートされる OpenSSL 暗号スイート。                                                                                                                                                                                                                                                                                                                             | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | セッションのキャッシュを有効または無効にします。`sessionIdContext` と組み合わせて使用する必要があります。指定可能な値: `true`, `false`。                                                                                                                                                                                                                                                              | `false`                                                                                    |
| `sessionIdContext`            | サーバーが生成する各識別子に追加される一意なランダム文字列です。文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはなりません。サーバーがセッションをキャッシュする場合とクライアントがキャッシュを要求する場合の両方で問題を回避するのに役立つため、このパラメーターは常に設定することを推奨します。                                                                                                                                                                              | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | サーバーがキャッシュできるセッションの最大数。`0` を指定すると無制限になります。                                                                                                                                                                                                                                                                                                          | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | サーバー側でのセッションキャッシュの保持時間（時間単位）。                                                                                                                                                                                                                                                                                                                       | `2`                                                                                        |
| `extendedVerification`        | 有効にすると、証明書の CN または SAN がピアのホスト名と一致しているかを検証します。                                                                                                                                                                                                                                                                                                      | `false`                                                                                    |
| `requireTLSv1`                | TLSv1 の接続を必須とします。有効な値: `true`, `false`。                                                                                                                                                                                                                                                                                                             | `false`                                                                                    |
| `requireTLSv1_1`              | TLSv1.1 接続を必須とします。有効な値: `true`, `false`。                                                                                                                                                                                                                                                                                                            | `false`                                                                                    |
| `requireTLSv1_2`              | TLSv1.2 接続を必須にします。指定可能な値: `true`, `false`。                                                                                                                                                                                                                                                                                                          | `false`                                                                                    |
| `fips`                        | OpenSSL の FIPS モードを有効にします。ライブラリで使用している OpenSSL のバージョンが FIPS をサポートしている場合にのみ利用可能です。                                                                                                                                                                                                                                                                   | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandler のサブクラス）。例：`<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`。                                                                                                                                 | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するためのクラス（CertificateHandler のサブクラス）。例：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`。                                                                                                                                                                                                    | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 使用を禁止するプロトコル。                                                                                                                                                                                                                                                                                                                                       |                                                                                            |
| `preferServerCiphers`         | サーバー側優先の暗号スイート。                                                                                                                                                                                                                                                                                                                                     | `false`                                                                                    |

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
        <!-- Use for self-signed: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Use for self-signed: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```


## opentelemetry&#95;span&#95;log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) システムテーブル用の設定。

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


## os_collect_psi_metrics {#os_collect_psi_metrics} 

<SettingsInfoBlock type="Bool" default_value="1" />/proc/pressure/ ファイルからの PSI メトリクスの取得を有効にします。

## os_cpu_busy_time_threshold {#os_cpu_busy_time_threshold} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />CPU が有用な処理を行っていると見なすための OS の CPU ビジー時間（OSCPUVirtualTimeMicroseconds メトリクス）の閾値（マイクロ秒単位）。ビジー時間がこの値未満の場合、CPU が過負荷状態であるとは見なされません。

## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

<SettingsInfoBlock type="Int32" default_value="0" />

分散キャッシュ TCP ハンドラーのスレッドに対する Linux の nice 値。値が小さいほど CPU 優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要で、ない場合はこの設定は無視されます。

取り得る値の範囲: -20 ～ 19。

## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

<SettingsInfoBlock type="Int32" default_value="0" />

マージおよびミューテーション用スレッドの Linux における nice 値。値が小さいほど CPU の優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要で、付与されていない場合は何も行われません。

指定可能な値: -20 〜 19。

## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

<SettingsInfoBlock type="Int32" default_value="0" />

ZooKeeper クライアントの送信用および受信用スレッドに対する Linux の nice 値。値が小さいほど CPU の優先度は高くなります。

CAP_SYS_NICE ケーパビリティが必要で、これがない場合は何も効果はありません (no-op)。

取りうる値: -20 ～ 19。

## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />ユーザー空間ページキャッシュに対するメモリ上限のうち、空きとして確保しておく割合。Linux の min_free_kbytes 設定に相当します。

## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />解放されたメモリをユーザー空間のページキャッシュが使用できるようになるまでの遅延時間。

## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />ユーザースペースのページキャッシュの最大サイズです。キャッシュを無効にするには 0 を設定します。`page_cache_min_size` より大きい場合、この範囲内でキャッシュサイズが継続的に調整され、利用可能なメモリの大部分を活用しつつ、合計メモリ使用量が制限値（`max_server_memory_usage[_to_ram_ratio]`）未満に保たれるようになります。

## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />ユーザー空間ページキャッシュの最小サイズ。

## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ユーザー空間のページキャッシュポリシー名です。

## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />ユーザー空間のページキャッシュを、この数の分片にストライプ分割してミューテックス競合を低減します。実験的な機能であり、性能向上効果はあまり期待できません。

## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />ユーザースペースのページキャッシュにおける保護キューのサイズが、キャッシュ全体のサイズに対して占める比率です。

## part&#95;log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) に関連するイベントをログに記録します。たとえば、データの追加やマージなどです。ログを使用してマージアルゴリズムの動作をシミュレートし、その特性を比較できます。マージ処理を可視化することもできます。

クエリは個別のファイルではなく、[system.part&#95;log](/operations/system-tables/part_log) テーブルに記録されます。このテーブル名は `table` パラメータで設定できます（下記参照）。

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

SharedMergeTree のパーツが完全に削除されるまでの猶予時間。ClickHouse Cloud でのみ利用可能です

## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

非常に大量のテーブルが存在する場合に発生しうる、同時アクセス集中によるスタンピード問題と、それに続く ZooKeeper への DoS を回避するために、`kill_delay_period` に 0〜x 秒の範囲で一様分布する値を加算します。ClickHouse Cloud でのみ利用可能です。

## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />

共有 MergeTree テーブルの古いパーツをクリーンアップするためのスレッド数です。ClickHouse Cloud でのみ利用可能です。

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

PostgreSQL プロトコルを介してクライアントと通信するためのポート。

:::note

* 正の整数は待ち受けるポート番号を指定します
* 空の値にすると、PostgreSQL プロトコルを介したクライアントとの通信が無効化されます。
  :::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

true に設定すると、[postgresql_port](#postgresql_port) 上のクライアント接続には安全な通信が必須になります。`sslmode=disable` オプションを指定した接続は拒否されます。[OpenSSL](#openssl) の設定と併用してください。

## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />リモートオブジェクトストレージに対するプリフェッチ用のバックグラウンドプールのサイズ

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />prefetch プールに投入できるタスクの最大数

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

prefixes のデシリアライゼーション用スレッドプールにスケジュールできるジョブの最大数です。

:::note
`0` の場合は無制限を意味します。
:::

## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、ClickHouse は起動前に構成されているすべての `system.*_log` テーブルを作成します。これは、一部の起動スクリプトがこれらのテーブルに依存している場合に有用です。

## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />プライマリ索引キャッシュポリシーの名前。

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />プリウォーム時に事前読み込みするマークキャッシュのサイズの、マークキャッシュの合計サイズに対する比率。

## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />MergeTree ファミリーのテーブルにおけるプライマリインデックス（索引）キャッシュの最大サイズ。

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />プライマリ索引キャッシュにおける保護キュー（SLRU ポリシーの場合）のサイズを、キャッシュの総サイズに対する比率で指定します。

## process&#95;query&#95;plan&#95;packet {#process_query_plan_packet}

<SettingsInfoBlock type="Bool" default_value="0" />

この設定を有効にすると、QueryPlan パケットを読み取れるようになります。このパケットは、`serialize_query_plan` が有効な場合に分散クエリで送信されます。
クエリプランのバイナリ逆シリアル化に存在しうるバグによって生じるセキュリティ問題を避けるため、デフォルトでは無効になっています。

**例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors&#95;profile&#95;log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) システムテーブル用の設定です。

<SystemLogParameters />

デフォルト設定は次のとおりです。

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

[Prometheus](https://prometheus.io) からスクレイプできるようにメトリクスデータを公開します。

設定:

* `endpoint` – prometheus サーバーがメトリクスをスクレイプするための HTTP エンドポイント。&#39;/&#39; で始める必要があります。
* `port` – `endpoint` 用のポート。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルのメトリクスを公開します。
* `events` – [system.events](/operations/system-tables/events) テーブルのメトリクスを公開します。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルの現在のメトリクス値を公開します。
* `errors` - 直近のサーバー再起動以降に発生したエラーコードごとのエラー数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。

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

確認（`127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えて実行してください）:

```bash
curl 127.0.0.1:9363/metrics
```


## proxy {#proxy}

HTTP および HTTPS リクエスト向けのプロキシサーバーを定義します。現在は S3 ストレージ、S3 テーブル関数、および URL 関数でサポートされています。

プロキシサーバーを定義する方法は 3 つあります。

* 環境変数
* プロキシリスト
* リモートプロキシリゾルバ

特定ホストをプロキシ経由から除外（バイパス）することも、`no_proxy` を使用して指定できます。

**Environment variables**

`http_proxy` および `https_proxy` 環境変数により、
特定のプロトコル向けのプロキシサーバーを指定できます。システム上でこれらが設定されていれば、そのまま問題なく動作します。

特定のプロトコルに対して
プロキシサーバーが 1 つだけであり、そのプロキシサーバーが変わらない場合には、これが最も簡単な方法です。

**Proxy lists**

この方法では、1 つ以上の
プロトコル用プロキシサーバーを指定できます。複数のプロキシサーバーが定義されている場合、
ClickHouse は各プロキシをラウンドロビン方式で使用し、サーバー間で負荷を分散します。これは、あるプロトコルに対して複数の
プロキシサーバーが存在し、かつプロキシサーバーのリストが変わらない場合に最も簡単な方法です。

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

タブから親フィールドを選択すると、その子フィールドが表示されます:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description          |
    | --------- | -------------------- |
    | `<http>`  | 1 つ以上の HTTP プロキシの一覧  |
    | `<https>` | 1 つ以上の HTTPS プロキシの一覧 |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Field   | Description |
    | ------- | ----------- |
    | `<uri>` | プロキシの URI   |
  </TabItem>
</Tabs>

**リモートプロキシリゾルバー**

プロキシサーバーが動的に変更される場合があります。その場合は、リゾルバーのエンドポイントを定義できます。ClickHouse はそのエンドポイントに空の GET リクエストを送信し、リモートリゾルバーはプロキシホストを返す必要があります。
ClickHouse は返された値を使用して、次のテンプレートに従ってプロキシ URI を構成します: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

下のタブから親フィールドを選択して、その子要素を表示します:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description           |
    | --------- | --------------------- |
    | `<http>`  | 1 つ以上の resolver のリスト* |
    | `<https>` | 1 つ以上の resolver のリスト* |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Field        | Description                  |
    | ------------ | ---------------------------- |
    | `<resolver>` | resolver のエンドポイントおよびその他の詳細情報 |

    :::note
    複数の `<resolver>` 要素を定義できますが、特定のプロトコルに対して使用されるのは最初の
    `<resolver>` のみです。そのプロトコルに対するそれ以外の `<resolver>` 要素は無視されます。したがって、ロードバランシングが必要な場合は、リモート側の resolver で実装する必要があります。
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | Field                | Description                                                                                                                 |
    | -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | プロキシ resolver の URI                                                                                                         |
    | `<proxy_scheme>`     | 最終的なプロキシ URI のプロトコル。`http` または `https` のいずれかになります。                                                                          |
    | `<proxy_port>`       | プロキシ resolver のポート番号                                                                                                        |
    | `<proxy_cache_time>` | resolver から取得した値を ClickHouse がキャッシュする秒数。この値を `0` に設定すると、ClickHouse はすべての HTTP または HTTPS リクエストごとに resolver へ問い合わせを行うようになります。 |
  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決定されます:

| Order | Setting           |
| ----- | ----------------- |
| 1.    | リモートプロキシ resolver |
| 2.    | プロキシリスト           |
| 3.    | 環境変数              |


ClickHouse は、リクエストプロトコルに対して最も高い優先度のリゾルバータイプを確認します。定義されていない場合は、
環境リゾルバーに到達するまで、次に優先度の高いリゾルバータイプを順に確認します。
これにより、複数の種類のリゾルバータイプを組み合わせて使用できます。

## query&#95;cache {#query_cache}

[Query cache](../query-cache.md) の設定です。

利用可能な設定は次のとおりです。

| Setting                   | Description                                     | Default Value |
| ------------------------- | ----------------------------------------------- | ------------- |
| `max_size_in_bytes`       | キャッシュの最大サイズ（バイト単位）。`0` の場合、クエリキャッシュは無効になります。    | `1073741824`  |
| `max_entries`             | キャッシュに保存される `SELECT` クエリ結果の最大件数。                | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存される `SELECT` クエリ結果 1 件あたりの最大サイズ（バイト単位）。 | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存される `SELECT` クエリ結果 1 件あたりの最大行数。         | `30000000`    |

:::note

* 変更した設定は即座に反映されます。
* クエリキャッシュ用のデータは DRAM に割り当てられます。メモリに余裕がない場合は、`max_size_in_bytes` の値を小さく設定するか、クエリキャッシュを無効化するようにしてください。
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
この設定は実行時に変更でき、変更は直ちに反映されます。
:::

## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />クエリ条件キャッシュにおける保護キュー（SLRU ポリシーの場合）のサイズの、キャッシュ全体のサイズに対する割合です。

## query&#95;log {#query_log}

[log&#95;queries=1](../../operations/settings/settings.md) によって受信したクエリをログ出力するための設定です。

クエリは別のファイルではなく、[system.query&#95;log](/operations/system-tables/query_log) テーブルに記録されます。`table` パラメータでテーブル名を変更できます（後述）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse はテーブルを作成します。ClickHouse サーバーを更新した際にクエリログの構造が変更されていた場合は、旧構造のテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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

正規表現に基づくルールで、クエリおよびすべてのログメッセージに対して、サーバーログに保存する前に適用されます。
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブル、およびクライアントへ送信されるログが対象です。これにより、SQL クエリに含まれる名前、メールアドレス、個人識別子、クレジットカード番号などの機密データがログへ漏洩することを防止できます。

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

| 設定項目      | 説明                                      |
| --------- | --------------------------------------- |
| `name`    | ルール名（任意）                                |
| `regexp`  | RE2 互換の正規表現（必須）                         |
| `replace` | 機微データを置き換えるための文字列（任意、デフォルトはアスタリスク 6 文字） |

マスキングルールはクエリ全体に対して適用されます（誤った形式 / パース不能なクエリから機微データが漏洩するのを防ぐため）。

[`system.events`](/operations/system-tables/events) テーブルには `QueryMaskingRulesMatch` カウンタがあり、クエリマスキングルールにマッチした回数の総計を保持します。

分散クエリの場合は、各サーバーを個別に設定する必要があります。そうしないと、他のノードに渡されるサブクエリはマスキングされないまま保存されます。


## query&#95;metric&#95;log {#query_metric_log}

デフォルトでは無効になっています。

**有効化**

メトリクス履歴の収集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/query_metric_log.xml` を作成します。

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

クエリは別個のファイルではなく、[system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) テーブルに記録されます。テーブル名は `table` パラメータで変更できます（後述）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse が作成します。ClickHouse サーバーのアップデート時にクエリスレッドログの構造が変更された場合、古い構造を持つテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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

[log&#95;query&#95;views=1](/operations/settings/settings#log_query_views) 設定を有効にしたクエリに応じて、ビュー（ライブビュー、マテリアライズドビューなど）をログ出力するための設定です。

クエリは、別ファイルではなく [system.query&#95;views&#95;log](/operations/system-tables/query_views_log) テーブルに記録されます。テーブル名は `table` パラメータで変更できます（後述）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse が作成します。ClickHouse サーバーをアップデートした際にクエリビューのログ構造が変更された場合、旧構造のテーブルはリネームされ、新しいテーブルが自動的に作成されます。

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

マシンコード（「text」）用のメモリをヒュージページを使って再割り当てするための設定です。

:::note
この機能は高度に実験的です。
:::

例:

```xml
<remap_executable>false</remap_executable>
```


## remote&#95;servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンおよび `cluster` テーブル関数で使用されるクラスターの構成。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性に指定できる値については、「[Configuration files](/operations/configuration-files)」セクションを参照してください。

**関連項目**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Cluster Discovery](../../operations/cluster-discovery.md)
* [Replicated database engine](../../engines/database-engines/replicated.md)


## remote&#95;url&#95;allow&#95;hosts {#remote_url_allow_hosts}

URL 関連のストレージエンジンおよびテーブル関数で利用を許可するホストのリストです。

`\<host\>` XML タグでホストを追加する際は、次の点に注意してください。

* DNS 解決の前に名前がチェックされるため、URL 中で使用されているものとまったく同じ文字列で指定する必要があります。例: `<host>clickhouse.com</host>`
* URL 内でポートが明示的に指定されている場合は、host:port 全体としてチェックされます。例: `<host>clickhouse.com:80</host>`
* ホストをポートなしで指定した場合、そのホストの任意のポートが許可されます。例: `<host>clickhouse.com</host>` を指定した場合は、`clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) などが許可されます。
* ホストを IP アドレスとして指定した場合、URL に記載されているとおりにチェックされます。例: `[2a02:6b8:a::a]`。
* リダイレクトが発生し、リダイレクトのサポートが有効になっている場合は、各リダイレクト先（location フィールド）がすべてチェックされます。

例:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica&#95;group&#95;name {#replica_group_name}

Replicated データベースで使用するレプリカグループ名。

Replicated データベースによって作成されるクラスタは、同じグループ内のレプリカで構成されます。
DDL クエリは、同じグループ内のレプリカに対してのみ待機します。

デフォルトでは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```


## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />パーツ取得リクエスト用の HTTP 接続タイムアウト値です。明示的に設定していない場合は、デフォルトプロファイルの `http_connection_timeout` から継承されます。

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />fetch part リクエストに対する HTTP の受信タイムアウト。明示的に設定されていない場合は、デフォルトプロファイルの `http_receive_timeout` から継承されます。

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />パーツ取得リクエストに対する HTTP 送信のタイムアウト。明示的に設定されていない場合は、デフォルトプロファイルの `http_send_timeout` から継承されます。

## replicated&#95;merge&#95;tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブル用の微調整設定です。この設定は他の設定よりも優先されます。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />RESTORE リクエストの実行に使用するスレッドの最大数。

## s3_credentials_provider_max_cache_size {#s3_credentials_provider_max_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />キャッシュできる S3 認証情報プロバイダの最大数

## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />S3 リダイレクトで許可されるホップ数の上限。

## s3_retry_attempts {#s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="500" />Aws::Client::RetryStrategy のための設定です。Aws::Client 自身が再試行を行い、0 を指定すると再試行しません

## s3queue_disable_streaming {#s3queue_disable_streaming} 

<SettingsInfoBlock type="Bool" default_value="0" />テーブルが作成済みで、マテリアライズドビューがアタッチされている場合でも、S3Queue でのストリーミングを無効にします

## s3queue&#95;log {#s3queue_log}

`s3queue_log` システムテーブルの設定です。

<SystemLogParameters />

デフォルトの設定は次のとおりです。

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

特にプレプロダクション環境などで有効化していただけると非常に助かります。

Keys:

| Key                   | Description                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| `enabled`             | 機能を有効にするためのブール値フラグ。デフォルトは `true` です。クラッシュレポートの送信を行わない場合は `false` に設定します。                                   |
| `send_logical_errors` | `LOGICAL_ERROR` は `assert` のようなもので、ClickHouse におけるバグを表します。このブール値フラグは、これらの例外を送信するかどうかを制御します（デフォルト: `true`）。 |
| `endpoint`            | クラッシュレポート送信用のエンドポイント URL を上書きできます。                                                                         |

**推奨される利用方法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />

`generateSerialID` 関数によって生成される、自動増分番号付きの Keeper 内のパスです。各 series は、このパス直下のノードとして作成されます。

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />true に設定すると、スタックトレースにアドレスが表示されます

## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />`true` に設定すると、ClickHouse はシャットダウンする前に、実行中のバックアップおよびリストアが完了するまで待機します。

## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />未完了のクエリを待機するための秒数

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />true に設定すると、ClickHouse はシャットダウンする前に実行中のクエリが完了するまで待機します。

## skip_binary_checksum_checks {#skip_binary_checksum_checks} 

<SettingsInfoBlock type="Bool" default_value="0" />ClickHouse バイナリのチェックサムによる整合性検証をスキップします

## ssh&#95;server {#ssh_server}

ホストキーの公開鍵部分は、初回接続時に SSH クライアント側の known&#95;hosts ファイルに書き込まれます。

Host Key Configurations セクションはデフォルトでは無効になっています。
Host Key Configurations のコメントアウトを解除し、対応する SSH 鍵へのパスを指定して有効化してください:

例:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />マテリアライズドビュー作成の遅延をシミュレートするためのデバッグ用のパラメータ

## storage&#95;configuration {#storage_configuration}

ストレージのマルチディスク構成を行うための設定です。

ストレージ構成は次の構造に従います:

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


### ディスクの設定 {#configuration-of-disks}

`disks` の設定は、以下の構造で記述します。

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

上記のサブタグでは、`disks` に対して次の設定を定義します:

| Setting                 | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `<disk_name_N>`         | 一意である必要があるディスク名。                                             |
| `path`                  | サーバーデータ（`data` および `shadow` ディレクトリ）が保存されるパス。`/` で終わる必要があります。 |
| `keep_free_space_bytes` | ディスク上で予約される空き容量（バイト数）。                                       |

:::note
ディスクの順序は問いません。
:::


### ポリシーの構成 {#configuration-of-policies}

上記のサブタグは、`policies` に対して次の設定を定義します:

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシー名。ポリシー名は一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | ボリューム名。ボリューム名は一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `disk`                       | ボリューム内に配置されるディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`   | このボリューム内の任意のディスク上に存在できるデータ chunk の最大サイズ。マージの結果として、chunk サイズが `max_data_part_size_bytes` より大きくなると予想される場合、その chunk は次のボリュームに書き込まれます。この機能により、新規 / 小さな chunk をホット (SSD) ボリュームに保存し、それらが大きなサイズに達したときにコールド (HDD) ボリュームへ移動できます。ポリシーに 1 つのボリュームしかない場合は、このオプションを使用しないでください。                                                                 |
| `move_factor`                | ボリューム上の利用可能な空き容量の割合。この値より空き容量が少なくなると、(存在する場合は) データの次のボリュームへの移動が開始されます。移動の際には、chunk はサイズの大きいものから小さいもの (降順) にソートされ、合計サイズが `move_factor` の条件を満たすのに十分な chunk が選択されます。すべての chunk の合計サイズが不十分な場合は、すべての chunk が移動されます。                                                                                                             |
| `perform_ttl_move_on_insert` | 挿入時に、有効期限 (TTL) が切れたデータの移動を無効にします。デフォルト (有効な場合) では、ライフタイムに基づく move ルールに従ってすでに期限切れとなっているデータを挿入すると、それは直ちに move ルールで指定されたボリューム / ディスクに移動されます。ターゲットのボリューム / ディスクが遅い場合 (例: S3)、これにより挿入が大幅に遅くなる可能性があります。無効化した場合、期限切れのデータ部分はいったんデフォルトボリュームに書き込まれた後、直ちに、期限切れの有効期限 (TTL) に対するルールで指定されたボリュームに移動されます。 |
| `load_balancing`             | ディスクのバランシングポリシー。`round_robin` または `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `least_used_ttl_ms`          | すべてのディスク上の利用可能な空き容量を更新するためのタイムアウト (ミリ秒) を設定します (`0` - 常に更新、`-1` - 更新しない、デフォルト値は `60000`)。なお、そのディスクが ClickHouse によってのみ使用され、ファイルシステムのオンラインリサイズの対象にならない場合は、`-1` の値を使用できます。それ以外のケースでは、最終的に不正な空き容量割り当てにつながるため推奨されません。                                                                                                                   |
| `prefer_not_to_merge`        | このボリューム上のデータパーツのマージを無効にします。注意: これは潜在的に有害であり、パフォーマンス低下の原因になります。この設定を有効にすると (推奨されません)、このボリューム上でのデータマージは禁止されます (これは望ましくありません)。これは、ClickHouse が遅いディスクとどのようにやり取りするかを制御するためのものです。これを使用しないことを推奨します。                                                                                                                                                                                       |
| `volume_priority`            | ボリュームが埋められる優先度 (順序) を定義します。値が小さいほど優先度が高くなります。パラメータの値は自然数でなければならず、1 から N (N は指定されたパラメータ値の最大値) までの範囲を隙間なくカバーする必要があります。                                                                                                                                                                                                                                                                |

`volume_priority` について:

- すべてのボリュームにこのパラメータが指定されている場合、それらは指定された順序で優先されます。
- _一部の_ ボリュームにのみ指定されている場合、指定されていないボリュームは最も低い優先度になります。指定されているボリュームはタグ値に従って優先され、それ以外のボリュームの優先度は、設定ファイル内での相互の記述順によって決まります。
- _どの_ ボリュームにもこのパラメータが指定されていない場合、それらの順序は設定ファイルでの記述順によって決まります。
- ボリュームの優先度は同一である必要はありません。

## storage_connections_hard_limit {#storage_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="200000" />この制限に達した状態で作成を試行すると、例外がスローされます。ハード制限を無効にするには 0 に設定します。この制限はストレージ接続に適用されます。

## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この上限を超える接続は、有効期間が大幅に短くなります。この上限はストレージへの接続に適用されます。

## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />この上限を超えた接続は、使用後にリセットされます。0 を設定すると、接続キャッシュを無効化します。この上限はストレージの接続に適用されます。

## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="500" />使用中の接続数がこの上限を超えた場合、警告メッセージがログに書き込まれます。この上限はストレージの接続に適用されます。

## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="1" />ディスクメタデータファイルを VERSION_FULL_OBJECT_KEY 形式で書き込みます。デフォルトで有効になっています。この設定は非推奨です。

## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />有効にすると、SharedSet および SharedJoin の作成時に内部 UUID が生成されます。ClickHouse Cloud 限定です

## table_engines_require_grant {#table_engines_require_grant} 

`true` に設定すると、特定のエンジンを使用してテーブルを作成するにはユーザーへの権限付与が必要になります（例: `GRANT TABLE ENGINE ON TinyLog TO user`）。

:::note
デフォルトでは、後方互換性のため、特定のテーブルエンジンを使用してテーブルを作成する際の権限チェックは行われませんが、この設定を `true` にすることでこの挙動を変更できます。
:::

## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

バックグラウンドプールで非同期ロード処理を実行するスレッド数を設定します。バックグラウンドプールは、テーブルを待機しているクエリがない場合に、サーバー起動後のテーブルを非同期にロードするために使用されます。テーブル数が多い場合は、バックグラウンドプール内のスレッド数を少なく保つと有効な場合があります。これにより、並行クエリ実行のための CPU リソースを確保できます。

:::note
`0` を指定すると、利用可能なすべての CPU が使用されます。
:::

## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

フォアグラウンドプールでロードジョブを実行するスレッド数を設定します。フォアグラウンドプールは、サーバーがポートでのリッスンを開始する前にテーブルを同期的にロードする場合や、ロード完了を待っているテーブルをロードする場合に使用されます。フォアグラウンドプールはバックグラウンドプールよりも優先度が高く、フォアグラウンドプールでジョブが実行されている間は、バックグラウンドプールで新たなジョブは開始されません。

:::note
`0` を指定すると、利用可能なすべての CPU が使用されます。
:::

## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 接続を閉じる前に、その接続で実行を許可するクエリの最大数。無制限にするには 0 を指定します。

## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 接続が閉じられるまでの最大存続期間（秒）。接続の存続期間を無制限にするには 0 に設定します。

## tcp&#95;port {#tcp_port}

TCP プロトコルでクライアントと通信するためのポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```


## tcp&#95;port&#95;secure {#tcp_port_secure}

クライアントとのセキュアな通信に使用する TCP ポートです。[OpenSSL](#openssl) の設定とあわせて使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## tcp&#95;ssh&#95;port {#tcp_ssh_port}

PTY 上で組み込みクライアントを使用し、対話的に接続してクエリを実行できるようにする SSH サーバーのポートです。

例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary&#95;data&#95;in&#95;cache {#temporary_data_in_cache}

このオプションを有効にすると、特定のディスク用の一時データが、そのディスクのキャッシュ内に保存されます。
このセクションでは、型が `cache` のディスク名を指定する必要があります。
この場合、キャッシュと一時データは同じ領域を共有し、一時データを作成するためにディスクキャッシュが追い出される（削除される）ことがあります。

:::note
一時データの保存場所を設定するために使用できるオプションは 1 つだけです: `tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
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

<SettingsInfoBlock type="Bool" default_value="0" />一時データを分散キャッシュに格納します。

## text_index_dictionary_block_cache_max_entries {#text_index_dictionary_block_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />テキスト索引のDictionaryブロック用キャッシュのサイズ（エントリ数）。ゼロの場合は無効です。

## text_index_dictionary_block_cache_policy {#text_index_dictionary_block_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキスト索引Dictionaryのブロックキャッシュポリシー名。

## text_index_dictionary_block_cache_size {#text_index_dictionary_block_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />テキストインデックス Dictionary ブロック用キャッシュのサイズ。0 にすると無効になります。

:::note
この設定は実行時に変更でき、即座に反映されます。
:::

## text_index_dictionary_block_cache_size_ratio {#text_index_dictionary_block_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキストインデックス Dictionary ブロックキャッシュにおいて、保護キュー（SLRU ポリシー使用時）のサイズがキャッシュ全体サイズに占める比率を指定します。

## text_index_header_cache_max_entries {#text_index_header_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="100000" />text インデックスヘッダーのキャッシュサイズ（エントリ数）。0 にすると無効になります。

## text_index_header_cache_policy {#text_index_header_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキスト索引ヘッダーキャッシュポリシーの名前。

## text_index_header_cache_size {#text_index_header_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />テキスト索引ヘッダー用キャッシュサイズ。ゼロの場合は無効になります。

:::note
この設定は実行時に変更でき、直ちに反映されます。
:::

## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキスト索引ヘッダーキャッシュにおける保護キュー（SLRU ポリシーの場合）のサイズを、キャッシュの総サイズに対する比率で指定します。

## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />テキスト索引のポスティングリスト用キャッシュのサイズ（エントリ数）。0 の場合は無効になります。

## text_index_postings_cache_policy {#text_index_postings_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキスト索引ポスティングリストのキャッシュポリシー名。

## text_index_postings_cache_size {#text_index_postings_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="2147483648" />テキスト索引のポスティングリスト用キャッシュのサイズ。0 の場合は無効になります。

:::note
この設定はサーバー稼働中でも変更でき、即座に反映されます。
:::

## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキストインデックスのポスティングリストキャッシュにおいて、保護キュー（SLRU ポリシーの場合）のサイズがキャッシュ全体サイズに対して占める割合。

## text&#95;log {#text_log}

テキストメッセージを記録するための [text&#95;log](/operations/system-tables/text_log) システムテーブル向け設定です。

<SystemLogParameters />

さらに、次の設定があります。

| Setting | 説明                                     | Default Value |
| ------- | -------------------------------------- | ------------- |
| `level` | テーブルに保存されるメッセージの最大レベル（デフォルトは `Trace`）。 | `Trace`       |

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
`0` は無制限を意味します。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />`local_filesystem_read_method = 'pread_threadpool'` の場合に、ローカルファイルシステムからの読み取りに使用されるスレッドプールのスレッド数。

## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />ローカルファイルシステムからの読み取りを行うために、スレッドプールへスケジュールできるジョブ数の上限。

## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />`remote_filesystem_read_method = 'threadpool'` が設定されている場合に、リモートファイルシステムからの読み取りを行うスレッドプールのスレッド数。

## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />リモートファイルシステムから読み取るためにスレッドプール上でスケジューリングできるジョブの最大数です。

## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />オブジェクトストレージへの書き込みリクエスト用バックグラウンドプールのサイズ

## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />オブジェクトストレージへの書き込みリクエスト用のバックグラウンドプールに投入可能なタスク数の上限

## throw&#95;on&#95;unknown&#95;workload {#throw_on_unknown_workload}

<SettingsInfoBlock type="Bool" default_value="0" />

設定 &#39;workload&#39; で指定された未知の WORKLOAD へのアクセス時の動作を定義します。

* `true` の場合、未知の WORKLOAD にアクセスしようとしたクエリから RESOURCE&#95;ACCESS&#95;DENIED 例外がスローされます。WORKLOAD の階層が確立され、WORKLOAD default を含むようになったあとに、すべてのクエリでリソーススケジューリングを必須にするのに有用です。
* `false`（デフォルト）の場合、未知の WORKLOAD を指す &#39;workload&#39; 設定を持つクエリは、リソーススケジューリングなしで無制限にアクセスできます。これは、WORKLOAD の階層を構成している段階で、WORKLOAD default が追加される前に重要です。

**例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**関連項目**

* [Workload Scheduling](/operations/workload-scheduling.md)


## timezone {#timezone}

サーバーのタイムゾーン。

UTC タイムゾーンまたは地理的な場所を示す IANA 識別子として指定します（例: Africa/Abidjan）。

タイムゾーンは、DateTime フィールドをテキスト形式（画面表示やファイル出力）に変換する際の String と DateTime の相互変換や、文字列から DateTime を取得する際に必要となります。さらに、入力パラメータでタイムゾーンが指定されていない時間・日付関連の関数でも、このタイムゾーンが使用されます。

**Example**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連項目**

* [session&#95;timezone](../settings/settings.md#session_timezone)


## tmp&#95;path {#tmp_path}

大規模なクエリを処理するための一時データを保存する、ローカルファイルシステム上のパス。

:::note

* 一時データストレージの構成に使用できるオプションは `tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか一つだけです。
* 末尾のスラッシュは必須です。
  :::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp&#95;policy {#tmp_policy}

一時データ用ストレージのポリシーです。`tmp` プレフィックスを持つすべてのファイルは、サーバー起動時に削除されます。

:::note
`tmp_policy` としてオブジェクトストレージを使用する際の推奨事項:

* 各サーバーで別々の `bucket:path` を使用する
* `metadata_type=plain` を使用する
* このバケットに対して有効期限 (TTL) を設定することも検討してください
  :::

:::note

* 一時データストレージを構成するには、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか一つしか使用できません。
* `move_factor`、`keep_free_space_bytes`、`max_data_part_size_bytes` は無視されます。
* ポリシーには *1 つのボリューム* だけを定義する必要があります。

詳細については [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree) のドキュメントを参照してください。
:::

**例**

`/disk1` がいっぱいの場合は、一時データは `/disk2` に保存されます。

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

追加するカスタムトップレベルドメインのリストを、各エントリが `<name>/path/to/file</name>` 形式になるように定義します。

例えば次のように指定します：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

以下も参照してください:

* 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) とそのバリエーション。
  これらはカスタム TLD リスト名を引数として受け取り、トップレベルドメイン配下のサブドメインを最初の意味のあるサブドメインまで含んだドメイン部分を返します。


## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />`total_memory_profiler_sample_probability` と同じ確率で、指定した値以下のサイズのランダムなメモリアロケーションを収集します。0 を指定すると無効になります。このしきい値を想定どおりに機能させるには、`max_untracked_memory` を 0 に設定することを検討してください。

## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />`total_memory_profiler_sample_probability` と等しい確率で、指定した値以上のサイズのメモリ割り当てをランダムにサンプリングします。0 は無効を意味します。このしきい値が期待どおりに機能するようにするには、`max_untracked_memory` を 0 に設定することを検討してください。

## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーのメモリ使用量が、バイト数で指定された次のステップ値を超えるたびに、メモリプロファイラは割り当て元のスタックトレースを収集します。0 に設定するとメモリプロファイラは無効になります。数メガバイト未満の値を指定すると、サーバーのパフォーマンスが低下します。

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />

ランダムなメモリの割り当ておよび解放を収集し、指定した確率で `trace_type` が `MemorySample` である行として [system.trace_log](../../operations/system-tables/trace_log.md) システムテーブルに書き込みます。確率は、割り当てのサイズに関係なく、各割り当ておよび解放ごとに適用されます。サンプリングは、未追跡メモリ量が未追跡メモリ制限（デフォルト値は `4` MiB）を超えた場合にのみ行われる点に注意してください。[total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) を小さくすることで、この制限を下げることができます。より細かい粒度でサンプリングするには、`total_memory_profiler_step` を `1` に設定できます。

設定可能な値:

- 正の倍精度浮動小数点数。
- `0` — ランダムなメモリの割り当ておよび解放を `system.trace_log` システムテーブルに書き込む処理を無効にする。

## trace&#95;log {#trace_log}

[trace&#95;log](/operations/system-tables/trace_log) システムテーブルの操作に関する設定です。

<SystemLogParameters />

デフォルトのサーバー設定ファイル `config.xml` には、次の設定項目のセクションが含まれます。

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

サーバー全体で共有されるキャッシュが 1 つだけあります。メモリはオンデマンドで割り当てられます。オプション `use_uncompressed_cache` が有効な場合にキャッシュが使用されます。

非圧縮キャッシュは、特定のケースにおける非常に短いクエリに対して有効です。

:::note
値 `0` は無効化を意味します。

この設定は実行時に変更可能で、すぐに反映されます。
:::

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />非圧縮キャッシュにおける保護キュー（SLRU ポリシーの場合）のサイズが、そのキャッシュ全体のサイズに対して占める比率を表します。

## url&#95;scheme&#95;mappers {#url_scheme_mappers}

短縮形またはシンボリックな URL プレフィックスを完全な URL に展開するための設定です。

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

ZooKeeper におけるデータパーツのヘッダーの保存方法を指定します。この設定は [`MergeTree`](/engines/table-engines/mergetree-family) ファミリーにのみ適用されます。指定方法は次のとおりです。

**`config.xml` ファイルの [merge_tree](#merge_tree) セクションでグローバルに指定する**

ClickHouse はサーバー上のすべてのテーブルに対してこの設定を使用します。この設定はいつでも変更できます。既存のテーブルも設定の変更に応じて動作が変わります。

**テーブルごとに指定する**

テーブルを作成するときに、対応する [engine setting](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) を指定します。この設定を持つ既存テーブルの動作は、グローバル設定が変更されても変わりません。

**取りうる値**

- `0` — 機能を無効にします。
- `1` — 機能を有効にします。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) の場合、[replicated](../../engines/table-engines/mergetree-family/replication.md) テーブルは、単一の `znode` を用いてデータパーツのヘッダーをコンパクトに保存します。テーブルに多くのカラムが含まれている場合、この保存方法によって ZooKeeper に保存されるデータ量を大幅に削減できます。

:::note
`use_minimalistic_part_header_in_zookeeper = 1` を適用した後は、この設定をサポートしないバージョンの ClickHouse サーバーにはダウングレードできません。クラスタ内のサーバーで ClickHouse をアップグレードする際は注意してください。すべてのサーバーを一度にアップグレードしないでください。ClickHouse の新バージョンは、テスト環境やクラスタ内の一部のサーバーのみで検証するほうが安全です。

この設定を用いてすでに保存されたデータパーツヘッダーは、以前の（非コンパクトな）表現に戻すことはできません。
:::

## user&#95;defined&#95;executable&#95;functions&#95;config {#user_defined_executable_functions_config}

実行可能なユーザー定義関数の設定ファイルへのパスです。

パス:

* 絶対パス、またはサーバー設定ファイルからの相対パスのいずれかを指定します。
* パスにはワイルドカードの * および ? を含めることができます。

関連項目:

* [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user&#95;defined&#95;path {#user_defined_path}

ユーザー定義のファイルを格納するディレクトリです。SQL のユーザー定義関数 [SQL User Defined Functions](/sql-reference/functions/udf) で使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user&#95;directories {#user_directories}

次の設定を含む設定ファイルのセクションです:

* 事前定義されたユーザーが記述された設定ファイルへのパス。
* SQL コマンドで作成されたユーザーが保存されるフォルダへのパス。
* SQL コマンドで作成されたユーザーが保存およびレプリケートされる ZooKeeper ノードパス。

このセクションが指定されている場合、[users&#95;config](/operations/server-configuration-parameters/settings#users_config) と [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) のパスは使用されません。

`user_directories` セクションには任意の数の項目を含めることができ、項目の順序が優先順位を表します（上にある項目ほど優先されます）。

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

ユーザー、ロール、行ポリシー、QUOTA、プロファイルは ZooKeeper に保存することも可能です。

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

`memory` セクションを定義することもできます。これは情報をディスクに書き込まず、メモリ内にのみ保存することを意味します。また、`ldap` セクションは情報を LDAP サーバー上に保存することを意味します。

ローカルに定義されていないユーザーのリモートユーザーディレクトリとして LDAP サーバーを追加するには、次の設定を含む単一の `ldap` セクションを定義します。

| Setting  | Description                                                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | `ldap_servers` 設定セクションで定義されている LDAP サーバー名の 1 つ。このパラメータは必須であり、空にはできません。                                                                                                      |
| `roles`  | LDAP サーバーから取得した各ユーザーに割り当てられる、ローカルに定義されたロールのリストを含むセクション。ロールが 1 つも指定されていない場合、ユーザーは認証後にいかなる操作も実行できません。列挙されたロールのいずれかが認証時点でローカルに定義されていない場合、その認証試行は、提供されたパスワードが正しくなかったかのように失敗します。 |

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

ユーザーファイルが格納されるディレクトリです。テーブル関数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user&#95;scripts&#95;path {#user_scripts_path}

ユーザースクリプトファイルを格納するディレクトリです。Executable User Defined Functions（実行可能なユーザー定義関数）で使用されます。詳細は [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions) を参照してください。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

型:

デフォルト値:


## users&#95;config {#users_config}

次の内容を含むファイルへのパス:

* ユーザーの設定
* アクセス権
* SETTINGS PROFILE
* QUOTA の設定

**例**

```xml
<users_config>users.xml</users_config>
```


## validate&#95;tcp&#95;client&#95;information {#validate_tcp_client_information}

<SettingsInfoBlock type="Bool" default_value="0" />クエリパケットを受信した際に、クライアント情報の検証を有効にするかどうかを制御します。

デフォルトでは `false` です:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />ベクター類似度索引キャッシュのサイズ（エントリ数）。0 の場合は無効です。

## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ベクトル類似度索引のキャッシュポリシー名。

## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />ベクトル類似度索引用キャッシュのサイズ。0 の場合は無効です。

:::note
この設定は実行時に変更でき、変更は直ちに反映されます。
:::

## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />ベクトル類似度索引キャッシュにおける、保護キュー（SLRU ポリシーの場合）のサイズを、キャッシュ全体サイズに対する割合で表します。

## wait&#95;dictionaries&#95;load&#95;at&#95;startup {#wait_dictionaries_load_at_startup}

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は、`dictionaries_lazy_load` が `false` の場合の挙動を指定します。
（`dictionaries_lazy_load` が `true` の場合、この設定は影響しません。）

`wait_dictionaries_load_at_startup` が `false` の場合、サーバーは起動時にすべての Dictionary の読み込みを開始し、
その読み込みと並行して接続を受け付けます。
クエリ内で Dictionary が初めて使用されるとき、その Dictionary がまだ読み込まれていなければ、
クエリは Dictionary の読み込みが完了するまで待機します。
`wait_dictionaries_load_at_startup` を `false` に設定すると ClickHouse の起動は速くなりますが、
一部のクエリは（Dictionary の読み込み完了を待つ必要があるため）実行が遅くなる可能性があります。

`wait_dictionaries_load_at_startup` が `true` の場合、サーバーは、いかなる接続も受け付ける前に、
すべての Dictionary の読み込みが（成功・失敗を問わず）完了するまで起動処理中に待機します。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload&#95;path {#workload_path}

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリの保存場所として使用されるディレクトリです。デフォルトでは、サーバーのワーキングディレクトリ配下の `/workload/` フォルダが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**関連項目**

* [ワークロードの階層構造](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)


## workload&#95;zookeeper&#95;path {#workload_zookeeper_path}

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリの保存に使用される ZooKeeper ノードへのパスです。整合性を保つため、すべての SQL 定義はこの 1 つの znode の値として保存されます。デフォルトでは ZooKeeper は使用されず、定義は [ディスク](#workload_path) に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**関連項目**

* [ワークロード階層](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)


## zookeeper {#zookeeper}

ClickHouse が [ZooKeeper](http://zookeeper.apache.org/) クラスターと連携するための設定を含みます。ClickHouse は、レプリケーテッドテーブルを使用する場合、レプリカのメタデータを保存するために ZooKeeper を使用します。レプリケーテッドテーブルを使用しない場合は、このセクションの設定は省略できます。

以下の設定はサブタグで構成できます:

| Setting                                    | Description                                                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `node`                                     | ZooKeeper エンドポイント。複数のエンドポイントを設定できます。例：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性は、ZooKeeper クラスターへの接続を試みる際のノードの順序を指定します。 |
| `session_timeout_ms`                       | クライアントセッションの最大タイムアウト時間 (ミリ秒)。                                                                                                                                |
| `operation_timeout_ms`                     | 1 回の操作の最大タイムアウト時間 (ミリ秒)。                                                                                                                                     |
| `root` (optional)                          | ClickHouse サーバーが使用する znode 群のルートとして使用される znode。                                                                                                              |
| `fallback_session_lifetime.min` (optional) | プライマリが利用できないときにフォールバックノードへの ZooKeeper セッション存続期間の最小制限 (ロードバランシング)。秒単位で指定。デフォルト: 3 時間。                                                                         |
| `fallback_session_lifetime.max` (optional) | プライマリが利用できないときにフォールバックノードへの ZooKeeper セッション存続期間の最大制限 (ロードバランシング)。秒単位で指定。デフォルト: 6 時間。                                                                         |
| `identity` (optional)                      | 要求された znode にアクセスするために ZooKeeper によって要求されるユーザーとパスワード。                                                                                                        |
| `use_compression` (optional)               | true に設定すると Keeper プロトコルで圧縮を有効にします。                                                                                                                          |

また、ZooKeeper ノードの選択アルゴリズムを指定できる `zookeeper_load_balancing` 設定 (オプション) もあります:

| Algorithm Name                  | Description                                                            |
| ------------------------------- | ---------------------------------------------------------------------- |
| `random`                        | ZooKeeper ノードの 1 つをランダムに選択します。                                         |
| `in_order`                      | 最初の ZooKeeper ノードを選択し、それが利用できない場合は 2 番目、その次へと順に選択します。                  |
| `nearest_hostname`              | サーバーのホスト名と最も類似したホスト名を持つ ZooKeeper ノードを選択します。ホスト名は名前のプレフィックスで比較されます。    |
| `hostname_levenshtein_distance` | `nearest_hostname` と同様ですが、ホスト名をレーベンシュタイン距離に基づいて比較します。                  |
| `first_or_random`               | 最初の ZooKeeper ノードを選択し、それが利用できない場合は残りの ZooKeeper ノードの中からランダムに 1 つ選択します。 |
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
    <!-- Optional. Chroot suffix. Should exist. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Optional. Zookeeper digest ACL string. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**関連項目**

* [レプリケーション](../../engines/table-engines/mergetree-family/replication.md)
* [ZooKeeper プログラマーズガイド](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [ClickHouse と ZooKeeper 間の任意のセキュアな通信](/operations/ssl-zookeeper)


## zookeeper&#95;log {#zookeeper_log}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) システムテーブルの設定です。

次の設定はサブタグで構成できます。

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
