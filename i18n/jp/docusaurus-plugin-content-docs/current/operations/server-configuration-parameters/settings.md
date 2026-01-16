---
description: 'このセクションでは、サーバー設定、すなわちセッションレベルやクエリレベルでは変更できない設定について説明します。'
keywords: ['グローバルなサーバー設定']
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


# サーバー設定 \{#server-settings\}

このセクションでは、サーバー設定について説明します。これらは、セッションレベルやクエリレベルでは変更できない設定です。

ClickHouse における設定ファイルの詳細については、[""Configuration Files""](/operations/configuration-files) を参照してください。

その他の設定については、""[Settings](/operations/settings/overview)"" セクションで説明しています。
設定について理解する前に、[Configuration files](/operations/configuration-files)
セクションを読み、置換（`incl` および `optional` 属性）の使い方を確認することを推奨します。

## abort_on_logical_error \\{#abort_on_logical_error\\}

<SettingsInfoBlock type="Bool" default_value="0" />LOGICAL_ERROR 例外発生時にサーバーを強制終了させます。上級者向けの設定です。

## access_control_improvements \{#access_control_improvements\}

アクセス制御システムにおける任意の改善機能に関する設定です。

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                | Default |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | 許可する行ポリシーを持たないユーザーが、`SELECT` クエリを使用して行を読み取れるかどうかを設定します。例えば、ユーザー A と B がいて、行ポリシーが A のみに対して定義されている場合、この設定が true であれば、ユーザー B はすべての行を閲覧できます。この設定が false の場合、ユーザー B はいかなる行も閲覧できません。                                                                                                                                                                             | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` クエリに `CLUSTER` 権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                               | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>` を実行するのに権限が必要か、また任意のユーザーが実行できるかどうかを設定します。true に設定した場合、このクエリには、通常テーブルと同様に `GRANT SELECT ON system.<table>` が必要になります。例外として、いくつかの system テーブル（`tables`、`columns`、`databases` と、`one`、`contributors` などの一部の定数テーブル）は依然として全ユーザーがアクセス可能です。また、`SHOW USERS` のような `SHOW` 権限が付与されている場合、対応する system テーブル（すなわち `system.users`）にはアクセスできます。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` を実行するのに権限が必要か、また任意のユーザーが実行できるかどうかを設定します。true に設定した場合、このクエリには通常テーブルと同様に `GRANT SELECT ON information_schema.<table>` が必要になります。                                                                                                                                                                                   | `true`  |
| `settings_constraints_replace_previous`         | ある設定に対する settings profile 内の制約が、その設定に対して以前に定義された制約（他のプロファイル内で定義されたもの）による動作を、新しい制約で設定されていないフィールドも含めて打ち消すかどうかを設定します。また、`changeable_in_readonly` 制約タイプを有効化します。                                                                                                                                                                                                | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンを使用してテーブルを作成する際に、権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                               | `false` |
| `role_cache_expiration_time_seconds`            | ロールが Role Cache 内に保持される期間（最後のアクセスからの秒数）を設定します。                                                                                                                                                                                                                                                                                                             | `600`   |

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


## access_control_path \\{#access_control_path\\}

ClickHouse サーバーが、SQL コマンドによって作成されたユーザーおよびロールの設定を格納するディレクトリのパスです。

**関連項目**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached \\{#aggregate_function_group_array_action_when_limit_is_reached\\}

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />groupArray において配列要素の最大サイズを超えたときに実行するアクション。例外を `throw` するか、余分な値を `discard` するかを指定します。

## aggregate_function_group_array_max_element_size \\{#aggregate_function_group_array_max_element_size\\}

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray 関数における配列要素の最大サイズ（バイト単位）。この制限はシリアル化時に検査され、状態のサイズが大きくなりすぎるのを防ぐのに役立ちます。

## allow_feature_tier \\{#allow_feature_tier\\}

<SettingsInfoBlock type="UInt32" default_value="0" />

ユーザーが各種機能レベルに関連する設定を変更できるかどうかを制御します。

- `0` - すべての設定（experimental、beta、production）の変更が許可されます。
- `1` - beta および production 機能設定への変更のみ許可されます。experimental 設定の変更は拒否されます。
- `2` - production 機能設定への変更のみ許可されます。experimental および beta 設定の変更は拒否されます。

これは、すべての `EXPERIMENTAL` / `BETA` 機能に対して読み取り専用の CONSTRAINT を設定するのと同等です。

:::note
値が `0` の場合、すべての設定を変更できます。
:::

## allow_impersonate_user \\{#allow_impersonate_user\\}

<SettingsInfoBlock type="Bool" default_value="0" />IMPERSONATE 機能（EXECUTE AS target_user）の有効化／無効化を行います。

## allow_implicit_no_password \{#allow_implicit_no_password\}

&#39;IDENTIFIED WITH no&#95;password&#39; が明示的に指定されていない限り、パスワードなしのユーザーの作成を禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow_no_password \{#allow_no_password\}

安全でないパスワード方式である no&#95;password を許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```


## allow_plaintext_password \{#allow_plaintext_password\}

プレーンテキストパスワード方式（安全ではありません）を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory \\{#allow_use_jemalloc_memory\\}

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc によるメモリの使用を許可します。

## allowed_disks_for_table_engines \\{#allowed_disks_for_table_engines\\}

Iceberg で使用可能なディスクの一覧

## async_insert_queue_flush_on_shutdown \\{#async_insert_queue_flush_on_shutdown\\}

<SettingsInfoBlock type="Bool" default_value="1" />true の場合、非同期挿入キューは正常終了時にフラッシュされます

## async_insert_threads \\{#async_insert_threads\\}

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドでデータをパースして挿入するスレッド数の最大値。0 の場合、非同期モードは無効になります

## async_load_databases \{#async_load_databases\}

<SettingsInfoBlock type="Bool" default_value="1" />

データベースおよびテーブルを非同期にロードします。

* `true` の場合、`Ordinary`、`Atomic`、`Replicated` エンジンを持つすべての非システムデータベースは、ClickHouse サーバーの起動後に非同期でロードされます。`system.asynchronous_loader` テーブルおよびサーバー設定 `tables_loader_background_pool_size` と `tables_loader_foreground_pool_size` を参照してください。まだロードされていないテーブルへアクセスしようとするクエリは、そのテーブルが起動するまでそのテーブルのロード完了を待機します。ロード処理が失敗した場合、クエリは（`async_load_databases = false` の場合のようにサーバー全体をシャットダウンするのではなく）エラーを再スローします。少なくとも 1 つのクエリが待機しているテーブルは、より高い優先度でロードされます。データベースに対する DDL クエリは、そのデータベースが起動するまでそのデータベースのロード完了を待機します。また、待機中のクエリ総数に対する制限として `max_waiting_queries` の設定も検討してください。
* `false` の場合、すべてのデータベースはサーバー起動時にロードされます。

**例**

```xml
<async_load_databases>true</async_load_databases>
```


## async_load_system_database \{#async_load_system_database\}

<SettingsInfoBlock type="Bool" default_value="0" />

system テーブルを非同期で読み込みます。`system` データベース内に大量のログテーブルやパーツが存在する場合に有用です。`async_load_databases` 設定とは独立しています。

* `true` に設定した場合、ClickHouse サーバー起動後に、`Ordinary`、`Atomic`、`Replicated` エンジンを持つすべての system データベースが非同期で読み込まれます。`system.asynchronous_loader` テーブル、および `tables_loader_background_pool_size` と `tables_loader_foreground_pool_size` のサーバー設定を参照してください。まだ読み込まれていない system テーブルへアクセスしようとするクエリは、そのテーブルの起動が完了するまで待機します。少なくとも 1 つのクエリにより読み込み待ちになっているテーブルは、より高い優先度で読み込まれます。また、合計待機クエリ数を制限するために `max_waiting_queries` 設定を併せて構成することを検討してください。
* `false` に設定した場合、system データベースはサーバー起動前に読み込まれます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s \\{#asynchronous_heavy_metrics_update_period_s\\}

<SettingsInfoBlock type="UInt32" default_value="120" />負荷の高い非同期メトリクスを更新する間隔（秒単位）。

## asynchronous_insert_log \{#asynchronous_insert_log\}

非同期 INSERT をログに記録するための [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) システムテーブル向けの設定。

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


## asynchronous_metric_log \{#asynchronous_metric_log\}

ClickHouse Cloud のデプロイメントではデフォルトで有効になっています。

環境によっては、この設定がデフォルトで有効になっていない場合があります。ClickHouse のインストール方法に応じて、以下の手順で有効化または無効化できます。

**有効化**

非同期メトリクスログ履歴 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md) の収集を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します。

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


## asynchronous_metrics_enable_heavy_metrics \\{#asynchronous_metrics_enable_heavy_metrics\\}

<SettingsInfoBlock type="Bool" default_value="0" />負荷の大きい非同期メトリクスの計算を有効にします。

## asynchronous_metrics_keeper_metrics_only \\{#asynchronous_metrics_keeper_metrics_only\\}

<SettingsInfoBlock type="Bool" default_value="0" />非同期メトリクスで keeper 関連のメトリクスのみを計算します。

## asynchronous_metrics_update_period_s \\{#asynchronous_metrics_update_period_s\\}

<SettingsInfoBlock type="UInt32" default_value="1" />非同期メトリクスを更新するための秒単位の間隔。

## auth_use_forwarded_address \\{#auth_use_forwarded_address\\}

プロキシ経由で接続しているクライアントに対して、認証時に元の送信元アドレスを使用します。

:::note
この設定は、転送されたアドレスが容易に偽装され得るため、細心の注意を払って使用する必要があります。このような認証を受け付けるサーバーには、信頼できるプロキシ経由でのみアクセスし、直接アクセスしないようにしてください。
:::

## background_buffer_flush_schedule_pool_size \\{#background_buffer_flush_schedule_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [Buffer エンジンテーブル](/engines/table-engines/special/buffer) のフラッシュ処理を実行するために使用されるスレッド数の上限です。

## background_common_pool_size \\{#background_common_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドで実行される [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブル向けのさまざまな処理（主にガベージコレクション）に使用されるスレッドの最大数。

## background_distributed_schedule_pool_size \\{#background_distributed_schedule_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="16" />分散送信を実行するために使用されるスレッド数の上限。

## background_fetches_pool_size \\{#background_fetches_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで、他のレプリカから [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルのデータパーツを取得するために使用されるスレッドの最大数。

## background_merges_mutations_concurrency_ratio \\{#background_merges_mutations_concurrency_ratio\\}

<SettingsInfoBlock type="Float" default_value="2" />

スレッド数と、同時に実行できるバックグラウンドのマージおよびミューテーションの数との比率を設定します。

たとえば、この比率が 2 で [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) が 16 に設定されている場合、ClickHouse は 32 個のバックグラウンドマージを同時に実行できます。これは、バックグラウンド処理を一時停止および延期できるためです。小規模なマージにより高い実行優先度を与えるために必要となります。

:::note
この比率は実行時に増やすことしかできません。小さくするにはサーバーを再起動する必要があります。

[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 設定と同様に、[`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) は後方互換性のために `default` プロファイルから適用できます。
:::

## background_merges_mutations_scheduling_policy \\{#background_merges_mutations_scheduling_policy\\}

<SettingsInfoBlock type="String" default_value="round_robin" />

バックグラウンドマージおよびミューテーションのスケジューリング方法を制御するポリシーです。利用可能な値は `round_robin` と `shortest_task_first` です。

バックグラウンドスレッドプールによって次に実行されるマージまたはミューテーションを選択するためのアルゴリズムです。ポリシーはサーバーを再起動せずに実行時に変更できます。
後方互換性のために `default` プロファイルから適用することができます。

利用可能な値:

- `round_robin` — すべての同時実行中のマージとミューテーションをラウンドロビン順に実行し、飢餓状態のない動作を保証します。小さいマージは、マージするブロック数が少ないため、大きいマージよりも速く完了します。
- `shortest_task_first` — 常により小さいマージまたはミューテーションを実行します。マージおよびミューテーションには、その結果のサイズに基づいて優先度が割り当てられます。サイズの小さいマージは、大きいマージよりも厳密に優先されます。このポリシーは小さいパーツのマージを可能な限り高速に行いますが、`INSERT` が大量に発生しているパーティションでは、大きなマージが無期限に飢餓状態となる可能性があります。

## background_message_broker_schedule_pool_size \\{#background_message_broker_schedule_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="16" />メッセージストリーミングのバックグラウンド処理に使用されるスレッドの最大数。

## background_move_pool_size \\{#background_move_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドでデータパーツを別のディスクまたはボリュームに移動するために使用されるスレッドの最大数です（*MergeTree-engine テーブルに適用されます）。

## background_pool_size \{#background_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

MergeTree エンジンを使用するテーブルに対して、バックグラウンドでマージおよびミューテーションを実行するスレッド数を設定します。

:::note

* この設定は、後方互換性のため ClickHouse サーバー起動時に `default` プロファイルの設定からも適用できます。
* 実行中に変更できるのは、スレッド数を増やす場合のみです。
* スレッド数を減らすにはサーバーを再起動する必要があります。
* この設定を調整することで、CPU とディスクの負荷を制御できます。
  :::

:::danger
プールサイズを小さくすると CPU とディスクの利用は減りますが、バックグラウンド処理の進行が遅くなり、最終的にクエリ性能に影響する可能性があります。
:::

変更する前に、以下のような関連する MergeTree 設定も参照してください。

* [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
* [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
* [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**例**

```xml
<background_pool_size>16</background_pool_size>
```


## background_schedule_pool_log \{#background_schedule_pool_log\}

さまざまなバックグラウンドプールで実行されるすべてのバックグラウンドタスクに関する情報が含まれます。

```xml
<background_schedule_pool_log>
    <database>system</database>
    <table>background_schedule_pool_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <!-- Only tasks longer than duration_threshold_milliseconds will be logged. Zero means log everything -->
    <duration_threshold_milliseconds>0</duration_threshold_milliseconds>
</background_schedule_pool_log>
```


## background_schedule_pool_max_parallel_tasks_per_type_ratio \\{#background_schedule_pool_max_parallel_tasks_per_type_ratio\\}

<SettingsInfoBlock type="Float" default_value="0.8" />プール内スレッドのうち、同時に同じ種類のタスクを実行できるものの最大比率。

## background_schedule_pool_size \\{#background_schedule_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="512" />レプリケーテッドテーブル、Kafka ストリーミング、および DNS キャッシュの更新に対して常時実行される軽量な定期的処理に利用されるスレッド数の上限。

## backup_log \{#backup_log\}

`BACKUP` および `RESTORE` 操作を記録するための [backup&#95;log](../../operations/system-tables/backup_log.md) システムテーブルに関する設定です。

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


## backup_threads \\{#backup_threads\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />`BACKUP` リクエストの実行に使用されるスレッド数の上限。

## backups \{#backups\}

[`BACKUP` および `RESTORE`](/operations/backup/overview) 文を実行する際に使用されるバックアップ関連の設定項目です。

以下の設定はサブタグで個別に設定できます。

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','同一ホスト上で複数のバックアップ処理を同時に実行できるかどうかを制御します。', 'true'),
    ('allow_concurrent_restores', 'Bool', '同一ホスト上で複数のリストア処理を同時に実行できるかどうかを制御します。', 'true'),
    ('allowed_disk', 'String', '`File()` を使用してバックアップするディスクを指定します。この設定は `File` を使用するために必須です。', ''),
    ('allowed_path', 'String', '`File()` を使用してバックアップするパスを指定します。この設定は `File` を使用するために必須です。', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '収集したメタデータを比較した結果に不整合があった場合、スリープに入る前にメタデータ収集を試行する回数。', '2'),
    ('collect_metadata_timeout', 'UInt64', 'バックアップ中のメタデータ収集処理のタイムアウト（ミリ秒）。', '600000'),
    ('compare_collected_metadata', 'Bool', 'true の場合、収集したメタデータがバックアップ中に変更されていないことを確認するため、既存のメタデータと比較します。', 'true'),
    ('create_table_timeout', 'UInt64', 'リストア中のテーブル作成処理のタイムアウト（ミリ秒）。', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '協調バックアップ／リストア中に bad version エラーが発生した場合に再試行する最大回数。', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '次回のメタデータ収集試行までの最大スリープ時間（ミリ秒）。', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '次回のメタデータ収集試行までの最小スリープ時間（ミリ秒）。', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '`BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップへコピー済みのファイルを削除しようとします。それ以外の場合はコピー済みファイルはそのまま残されます。', 'true'),
    ('sync_period_ms', 'UInt64', '協調バックアップ／リストアにおける同期間隔（ミリ秒）。', '5000'),
    ('test_inject_sleep', 'Bool', 'テスト用途のスリープ挿入。', 'false'),
    ('test_randomize_order', 'Bool', 'true の場合、テスト目的で一部の処理順序をランダム化します。', 'false'),
    ('zookeeper_path', 'String', '`ON CLUSTER` 句を使用する場合に、バックアップおよびリストアのメタデータを ZooKeeper 上に保存するパス。', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Setting                                             | Type   | Description                                                                                         | Default               |
| :-------------------------------------------------- | :----- | :-------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 同一ホスト上で複数のバックアップ操作を同時に実行できるかどうかを決定します。                                                              | `true`                |
| `allow_concurrent_restores`                         | Bool   | 同一ホスト上で複数のリストア操作を同時に実行できるかどうかを決定します。                                                                | `true`                |
| `allowed_disk`                                      | String | `File()` を使用する場合のバックアップ先ディスク。この設定を指定しなければ `File` は使用できません。                                          | ``                    |
| `allowed_path`                                      | String | `File()` を使用する場合のバックアップ先パス。この設定を指定しなければ `File` は使用できません。                                            | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 収集したメタデータを比較した結果に不整合があった場合に、スリープに入る前にメタデータ収集を試行する回数。                                                | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | バックアップ中にメタデータを収集する際のタイムアウト（ミリ秒）。                                                                    | `600000`              |
| `compare_collected_metadata`                        | Bool   | `true` の場合、バックアップ中にメタデータが変更されていないことを確認するため、収集したメタデータを既存のメタデータと比較します。                                | `true`                |
| `create_table_timeout`                              | UInt64 | リストア中にテーブルを作成する際のタイムアウト（ミリ秒）。                                                                       | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | 協調バックアップ／リストア中に bad version エラーが発生した後に再試行する最大回数。                                                    | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次のメタデータ収集を試行する前にスリープする最大時間（ミリ秒）。                                                                    | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次のメタデータ収集を試行する前にスリープする最小時間（ミリ秒）。                                                                    | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | `BACKUP` コマンドが失敗した場合、ClickHouse は失敗が発生する前にバックアップへコピー済みのファイルを削除しようとします。それ以外の場合は、コピー済みファイルはそのまま残されます。 | `true`                |
| `sync_period_ms`                                    | UInt64 | 協調バックアップ／リストアの同期周期（ミリ秒）。                                                                            | `5000`                |
| `test_inject_sleep`                                 | Bool   | テスト用途のスリープ挿入。                                                                                       | `false`               |
| `test_randomize_order`                              | Bool   | `true` の場合、テスト目的で一部の処理順序をランダム化します。                                                                  | `false`               |
| `zookeeper_path`                                    | String | `ON CLUSTER` 句を使用する場合に、バックアップおよびリストアのメタデータが保存される ZooKeeper 内のパス。                                    | `/clickhouse/backups` |

この設定はデフォルトで次のように構成されています:

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size \\{#backups_io_thread_pool_queue_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Backups IO thread プールにスケジュールできるジョブの最大数です。現在の S3 バックアップ処理の仕様上、このキューは無制限のままにしておくことを推奨します。

:::note
`0`（デフォルト）の値は、キューが無制限であることを意味します。
:::

## bcrypt_workfactor \{#bcrypt_workfactor\}

`bcrypt_password` 認証タイプで使用される [Bcrypt アルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/) のワークファクターを指定します。
ワークファクターは、ハッシュの計算およびパスワード検証に必要となる計算量と処理時間を定義します。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
高頻度で認証処理が発生するアプリケーションでは、
高いワークファクター設定を用いる場合の bcrypt の計算コストが大きいため、
別の認証方式の利用を検討してください。
:::


## blob_storage_log \{#blob_storage_log\}

[`blob_storage_log`](../system-tables/blob_storage_log.md) システムテーブルの設定です。

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


## builtin_dictionaries_reload_interval \{#builtin_dictionaries_reload_interval\}

組み込み辞書を再読み込みする間隔（秒）。

ClickHouse は、組み込み辞書を x 秒ごとに再読み込みします。これにより、サーバーを再起動することなく、その場で辞書を編集できます。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio \\{#cache_size_to_ram_max_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />キャッシュサイズの RAM に対する最大比率を設定します。メモリ容量の小さいシステムでキャッシュサイズを抑えることができます。

## cannot_allocate_thread_fault_injection_probability \\{#cannot_allocate_thread_fault_injection_probability\\}

<SettingsInfoBlock type="Double" default_value="0" />テスト目的で利用します。

## cgroups_memory_usage_observer_wait_time \\{#cgroups_memory_usage_observer_wait_time\\}

<SettingsInfoBlock type="UInt64" default_value="15" />

cgroups のしきい値に従って、サーバーで許可される最大メモリ消費量が調整される秒単位の間隔。

cgroups オブザーバーを無効にするには、この値を `0` に設定します。

## compiled_expression_cache_elements_size \\{#compiled_expression_cache_elements_size\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />[compiled expressions](../../operations/caches.md) 用キャッシュの要素数（キャッシュサイズ）を設定します。

## compiled_expression_cache_size \\{#compiled_expression_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />[コンパイル済み式](../../operations/caches.md)のキャッシュサイズ（バイト単位）を設定します。

## compression \{#compression\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブル向けのデータ圧縮設定です。

:::note
ClickHouse を使い始めたばかりの場合は、これを変更しないことをおすすめします。
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

**`<case>` フィールド**:

* `min_part_size` – データパーツの最小サイズ。
* `min_part_size_ratio` – データパーツサイズとテーブルサイズの比率。
* `method` – 圧縮方式。指定可能な値：`lz4`、`lz4hc`、`zstd`、`deflate_qpl`。
* `level` – 圧縮レベル。[Codecs](/sql-reference/statements/create/table#general-purpose-codecs) を参照。

:::note
複数の `<case>` セクションを設定できます。
:::

**条件が満たされた場合の動作**:

* データパーツが条件セットに一致した場合、ClickHouse は指定された圧縮方式を使用します。
* データパーツが複数の条件セットに一致した場合、ClickHouse は最初に一致した条件セットを使用します。

:::note
いずれの条件セットにも一致しないデータパーツには、ClickHouse は `lz4` 圧縮を使用します。
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


## concurrent_threads_scheduler \\{#concurrent_threads_scheduler\\}

<SettingsInfoBlock type="String" default_value="fair_round_robin" />

`concurrent_threads_soft_limit_num` と `concurrent_threads_soft_limit_ratio_to_cores` によって指定される CPU スロットをどのようにスケジューリングするかを決定するポリシーです。制限された数の CPU スロットを同時実行中のクエリ間でどのように分配するかを制御するアルゴリズムです。スケジューラはサーバーを再起動せずに、実行中に変更できます。

取り得る値:

- `round_robin` — `use_concurrency_control` 設定が 1 のすべてのクエリは、最大で `max_threads` 個の CPU スロットを確保します。1 スレッドあたり 1 スロットです。競合が発生した場合、CPU スロットはラウンドロビン方式でクエリに割り当てられます。最初のスロットは無条件に付与されることに注意してください。これにより、多数の `max_threads` = 1 のクエリが存在する状況では、`max_threads` が大きいクエリに対して不公平となり、そのレイテンシが増大する可能性があります。
- `fair_round_robin` — `use_concurrency_control` 設定が 1 のすべてのクエリは、最大で `max_threads - 1` 個の CPU スロットを確保します。すべてのクエリの最初のスレッドには CPU スロットを必要としない `round_robin` のバリエーションです。この方式では、`max_threads` = 1 のクエリはスロットを一切必要とせず、スロットを不公平にすべて確保してしまうことがありません。無条件に付与されるスロットは存在しません。

## concurrent_threads_soft_limit_num \\{#concurrent_threads_soft_limit_num\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

リモートサーバーからデータを取得するスレッドを除き、すべてのクエリで同時に実行可能なクエリ処理スレッド数の上限を指定します。これはハードリミットではありません。制限に達した場合でも、そのクエリには少なくとも 1 つのスレッドが割り当てられます。実行中のクエリは、追加のスレッドが利用可能になれば、必要なスレッド数までスケールアップできます。

:::note
`0`（デフォルト）の値は無制限を意味します。
:::

## concurrent_threads_soft_limit_ratio_to_cores \\{#concurrent_threads_soft_limit_ratio_to_cores\\}

<SettingsInfoBlock type="UInt64" default_value="0" />[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) と同様ですが、コア数に対する比率で指定します。

## config-file \\{#config-file\\}

<SettingsInfoBlock type="String" default_value="config.xml" />サーバーの設定ファイルへのパスを指定します。

## config_reload_interval_ms \\{#config_reload_interval_ms\\}

<SettingsInfoBlock type="UInt64" default_value="2000" />

ClickHouse が設定を再読み込みし、新しい変更を確認する間隔

## core_dump \{#core_dump\}

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


## cpu_slot_preemption \{#cpu_slot_preemption\}

<SettingsInfoBlock type="Bool" default_value="0" />

CPU リソース（MASTER THREAD および WORKER THREAD）のワークロードのスケジューリング方法を定義します。

* `true`（推奨）の場合、実際に消費された CPU 時間に基づいて計測が行われます。競合するワークロードに対して、公平な量の CPU 時間が割り当てられます。スロットは一定時間のみ割り当てられ、期限切れ後に再要求されます。CPU リソースが過負荷の場合にはスロット要求がスレッド実行をブロックすることがあり、つまりプリエンプションが発生する可能性があります。これにより CPU 時間の公平な分配が保証されます。
* `false`（デフォルト）の場合、計測は割り当てられた CPU スロット数に基づきます。競合するワークロードに対して、公平な数の CPU スロットが割り当てられます。スロットはスレッド開始時に割り当てられ、実行が終了するまで継続的に保持され、その後解放されます。クエリ実行に割り当てられるスレッド数は 1 から `max_threads` まで増加することはあっても減少することはありません。これは長時間実行されるクエリにとって有利ですが、短いクエリに対しては CPU リソースの枯渇を引き起こす可能性があります。

**例**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**関連項目**

* [ワークロードスケジューリング](/operations/workload-scheduling.md)


## cpu_slot_preemption_timeout_ms \{#cpu_slot_preemption_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

プリエンプション中、つまり別の CPU スロットが付与されるのを待っている間に、ワーカースレッドが待機できる最大時間（ミリ秒）を定義します。このタイムアウトに達してもスレッドが新しい CPU スロットを取得できなかった場合、そのスレッドは終了し、クエリの同時実行スレッド数は動的に少ない数へスケールダウンされます。なお、マスタースレッドがダウンスケールされることはありませんが、無期限にプリエンプトされる可能性があります。`cpu_slot_preemption` が有効であり、CPU リソースが WORKER THREAD 用に定義されている場合にのみ意味を持ちます。

**例**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**関連項目**

* [ワークロードのスケジューリング](/operations/workload-scheduling.md)


## cpu_slot_quantum_ns \{#cpu_slot_quantum_ns\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

スレッドが CPU スロットを取得した後、別の CPU スロットを再度要求するまでに消費できる CPU ナノ秒数を定義します。`cpu_slot_preemption` が有効であり、MASTER THREAD または WORKER THREAD に対して CPU リソースが定義されている場合にのみ有効です。

**例**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**関連項目**

* [ワークロードスケジューリング](/operations/workload-scheduling.md)


## crash_log \{#crash_log\}

[crash&#95;log](../../operations/system-tables/crash_log.md) システムテーブルの動作に関する設定です。

次の設定はサブタグで指定できます。

| Setting                            | Description                                                                                                               | Default             | Note                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| `database`                         | データベース名。                                                                                                                  |                     |                                                                                             |
| `table`                            | システムテーブル名。                                                                                                                |                     |                                                                                             |
| `engine`                           | システムテーブル用の [MergeTree エンジン定義](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。 |                     | `partition_by` または `order_by` が定義されている場合は使用できません。指定されていない場合、デフォルトで `MergeTree` が選択されます      |
| `partition_by`                     | システムテーブル用の[カスタムパーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                            |                     | システムテーブルに対して `engine` が指定されている場合、`partition_by` パラメータは直接 &#39;engine&#39; の内部に指定する必要があります   |
| `ttl`                              | テーブルの [有効期限 (TTL)](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) を指定します。                  |                     | システムテーブルに対して `engine` が指定されている場合、`ttl` パラメータは直接 &#39;engine&#39; の内部に指定する必要があります            |
| `order_by`                         | システムテーブル用の[カスタムソートキー](/engines/table-engines/mergetree-family/mergetree#order_by)。`engine` が定義されている場合は使用できません。            |                     | システムテーブルに対して `engine` が指定されている場合、`order_by` パラメータは直接 &#39;engine&#39; の内部に指定する必要があります       |
| `storage_policy`                   | テーブルに使用するストレージポリシー名 (任意)。                                                                                                 |                     | システムテーブルに対して `engine` が指定されている場合、`storage_policy` パラメータは直接 &#39;engine&#39; の内部に指定する必要があります |
| `settings`                         | MergeTree の動作を制御する[追加パラメータ](/engines/table-engines/mergetree-family/mergetree/#settings) (任意)。                            |                     | システムテーブルに対して `engine` が指定されている場合、`settings` パラメータは直接 &#39;engine&#39; の内部に指定する必要があります       |
| `flush_interval_milliseconds`      | メモリ上のバッファからテーブルへデータをフラッシュする間隔。                                                                                            | `7500`              |                                                                                             |
| `max_size_rows`                    | ログの最大サイズ (行数)。フラッシュされていないログの量が `max_size` に達すると、ログがディスクにダンプされます。                                                          | `1024`              |                                                                                             |
| `reserved_size_rows`               | ログ用に事前確保されるメモリサイズ (行数)。                                                                                                   | `1024`              |                                                                                             |
| `buffer_size_rows_flush_threshold` | 行数のしきい値。このしきい値に達すると、バックグラウンドでディスクへのログフラッシュが開始されます。                                                                        | `max_size_rows / 2` |                                                                                             |
| `flush_on_crash`                   | クラッシュ発生時にログをディスクへダンプするかどうかを設定します。                                                                                         | `false`             |                                                                                             |

デフォルトのサーバー設定ファイル `config.xml` には、次の `settings` セクションが含まれます。

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


## custom_cached_disks_base_directory \{#custom_cached_disks_base_directory\}

この設定は、カスタム（SQL から作成された）キャッシュディスクのキャッシュパスを指定します。
`custom_cached_disks_base_directory` はカスタムディスクに対して `filesystem_caches_path`（`filesystem_caches_path.xml` 内に定義）よりも高い優先度を持ち、
前者が存在しない場合にのみ後者が使用されます。
`filesystem_caches_path` で指定するファイルシステムキャッシュのパスは、このディレクトリ配下でなければなりません。
そうでない場合は、ディスクの作成を防ぐために例外がスローされます。

:::note
これは、サーバーをアップグレードする前の古いバージョンで作成されたディスクには影響しません。
この場合、サーバーが正常に起動できるように、例外はスローされません。
:::

例:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## custom_settings_prefixes \{#custom_settings_prefixes\}

[カスタム設定](/operations/settings/query-level#custom_settings) 用のプレフィックスのリストです。プレフィックスはカンマ区切りで指定する必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**関連項目**

* [カスタム設定](/operations/settings/query-level#custom_settings)


## database_atomic_delay_before_drop_table_sec \\{#database_atomic_delay_before_drop_table_sec\\}

<SettingsInfoBlock type="UInt64" default_value="480" />

削除されたテーブルを [`UNDROP`](/sql-reference/statements/undrop.md) 文を使って復元できるまでの遅延時間です。`DROP TABLE` が `SYNC` 修飾子付きで実行された場合、この設定は無視されます。
この設定のデフォルト値は `480`（8 分）です。

## database_catalog_drop_error_cooldown_sec \\{#database_catalog_drop_error_cooldown_sec\\}

<SettingsInfoBlock type="UInt64" default_value="5" />テーブルの削除に失敗した場合、ClickHouse は操作を再試行する前に、このタイムアウト時間だけ待機します。

## database_catalog_drop_table_concurrency \\{#database_catalog_drop_table_concurrency\\}

<SettingsInfoBlock type="UInt64" default_value="16" />テーブル削除に使用されるスレッドプールのスレッド数。

## database_catalog_unused_dir_cleanup_period_sec \\{#database_catalog_unused_dir_cleanup_period_sec\\}

<SettingsInfoBlock type="UInt64" default_value="86400" />

`store/` ディレクトリから不要なデータをクリーンアップするタスクのパラメータです。
タスクの実行間隔を設定します。

:::note
値が `0` の場合は「クリーンアップを実行しない」ことを意味します。デフォルト値は 1 日に相当します。
:::

## database_catalog_unused_dir_hide_timeout_sec \\{#database_catalog_unused_dir_hide_timeout_sec\\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

`store/` ディレクトリから不要なものをクリーンアップするタスクのパラメータです。
あるサブディレクトリが clickhouse-server によって使用されておらず、かつ直近
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒間変更されていない場合、このタスクはそのディレクトリに対する
すべてのアクセス権を削除することで、そのディレクトリを「隠し」ます。これは、clickhouse-server が
`store/` 内に存在することを想定していないディレクトリに対しても機能します。

:::note
`0` の値は「即時」を意味します。
:::

## database_catalog_unused_dir_rm_timeout_sec \\{#database_catalog_unused_dir_rm_timeout_sec\\}

<SettingsInfoBlock type="UInt64" default_value="2592000" />

`store/` ディレクトリから不要なサブディレクトリをクリーンアップするタスクのパラメータです。
あるサブディレクトリが clickhouse-server によって使用されておらず、以前に「隠された」
([database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) を参照)
状態となっていて、そのディレクトリが直近
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒の間に変更されていない場合、このタスクはそのディレクトリを削除します。
また、clickhouse-server が `store/` の内部に存在することを想定していないディレクトリに対しても適用されます。

:::note
値が `0` の場合は「削除しない」ことを意味します。デフォルト値は 30 日に相当します。
:::

## database_replicated_allow_detach_permanently \\{#database_replicated_allow_detach_permanently\\}

<SettingsInfoBlock type="Bool" default_value="1" />Replicated データベースでテーブルを永続的にデタッチできるようにします

## database_replicated_drop_broken_tables \\{#database_replicated_drop_broken_tables\\}

<SettingsInfoBlock type="Bool" default_value="0" />想定外のテーブルを別のローカルデータベースに移動するのではなく、Replicated データベースから削除します

## dead_letter_queue \{#dead_letter_queue\}

&#39;dead&#95;letter&#95;queue&#39; システムテーブル向けの設定です。

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


## default_database \\{#default_database\\}

<SettingsInfoBlock type="String" default_value="default" />既定のデータベース名です。

## default_password_type \{#default_password_type\}

`CREATE USER u IDENTIFIED BY 'p'` のようなクエリで、自動的に設定されるパスワードの種類を指定します。

指定可能な値は次のとおりです。

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## default_profile \{#default_profile\}

デフォルトの設定プロファイルです。設定プロファイルは、`user_config` という設定で指定されたファイル内に定義されています。

**例**

```xml
<default_profile>default</default_profile>
```


## default_replica_name \{#default_replica_name\}

<SettingsInfoBlock type="String" default_value="{replica}" />

ZooKeeper 内のレプリカの名前。

**例**

```xml
<default_replica_name>{replica}</default_replica_name>
```


## default_replica_path \{#default_replica_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />

ZooKeeper 上のテーブルへのパス。

**例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```


## default_session_timeout \{#default_session_timeout\}

セッションのデフォルトタイムアウト時間（秒）。

```xml
<default_session_timeout>60</default_session_timeout>
```


## dictionaries_config \{#dictionaries_config\}

辞書の設定ファイルへのパス。

パス:

* 絶対パス、またはサーバーの設定ファイルからの相対パスを指定します。
* パスにはワイルドカードの * および ? を含めることができます。

関連項目:

* &quot;[Dictionaries](../../sql-reference/dictionaries/index.md)&quot;。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## dictionaries_lazy_load \{#dictionaries_lazy_load\}

<SettingsInfoBlock type="Bool" default_value="1" />

Dictionary の遅延読み込みを行うかどうかを制御します。

* `true` の場合、各 Dictionary は最初に使用されたときに読み込まれます。読み込みが失敗した場合、その Dictionary を使用していた関数は例外をスローします。
* `false` の場合、サーバーは起動時にすべての Dictionary を読み込みます。

:::note
サーバーは起動時に、接続を受け付ける前にすべての Dictionary の読み込みが完了するまで待機します
（例外: [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) が `false` に設定されている場合）。
:::

**例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionaries_lib_path \{#dictionaries_lib_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/dictionaries_lib/" />

辞書ライブラリを格納するディレクトリ。

**例**

```xml
<dictionaries_lib_path>/var/lib/clickhouse/dictionaries_lib/</dictionaries_lib_path>
```


## dictionary_background_reconnect_interval \\{#dictionary_background_reconnect_interval\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />`background_reconnect` が有効になっている失敗した MySQL および Postgres の Dictionary に対する再接続試行の間隔（ミリ秒単位）。

## disable_insertion_and_mutation \\{#disable_insertion_and_mutation\\}

<SettingsInfoBlock type="Bool" default_value="0" />

`INSERT` / `ALTER` / `DELETE` クエリを無効にします。読み取り専用ノードが必要で、挿入やミューテーションが読み取りパフォーマンスに影響するのを防ぎたい場合に、この設定を有効にします。この設定が有効な場合でも、外部エンジン（S3、DataLake、MySQL、PostgreSQL、Kafka など）への挿入は許可されます。

## disable_internal_dns_cache \\{#disable_internal_dns_cache\\}

<SettingsInfoBlock type="Bool" default_value="0" />内部 DNS キャッシュを無効にします。Kubernetes のようにインフラストラクチャが頻繁に変化するシステムで ClickHouse を運用する場合に推奨されます。

## disable_tunneling_for_https_requests_over_http_proxy \{#disable_tunneling_for_https_requests_over_http_proxy\}

デフォルトでは、トンネリング（つまり `HTTP CONNECT`）を使用して、`HTTP` プロキシ経由で `HTTPS` リクエストを送信します。この設定を使用すると、トンネリングを無効化できます。

**no&#95;proxy**

デフォルトでは、すべてのリクエストがプロキシを経由します。特定のホストについてプロキシを無効化するには、`no_proxy` 変数を設定する必要があります。
`no_proxy` は、list リゾルバーおよび remote リゾルバー向けの `<proxy>` 句内、また environment リゾルバー向けの環境変数として設定できます。
IP アドレス、ドメイン、サブドメイン、および完全バイパス用の `'*'` ワイルドカードをサポートします。curl と同様に、先頭のドットは削除されます。

**Example**

以下の設定では、`clickhouse.cloud` およびそのすべてのサブドメイン（例: `auth.clickhouse.cloud`）へのリクエストがプロキシをバイパスします。
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


## disk_connections_hard_limit \\{#disk_connections_hard_limit\\}

<SettingsInfoBlock type="UInt64" default_value="200000" />この制限値に達すると、作成しようとした時点で例外がスローされます。0 に設定するとハード制限を無効化します。この制限はディスクへの接続に適用されます。

## disk_connections_soft_limit \\{#disk_connections_soft_limit\\}

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限を超える接続は、有効期間（TTL）が大幅に短くなります。この制限はディスクへの接続に適用されます。

## disk_connections_store_limit \\{#disk_connections_store_limit\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />この上限を超えた接続は、使用後にリセットされます。接続キャッシュを無効化するには 0 を設定します。この上限はディスク接続に適用されます。

## disk_connections_warn_limit \\{#disk_connections_warn_limit\\}

<SettingsInfoBlock type="UInt64" default_value="8000" />使用中の接続数がこの制限を超えた場合、警告メッセージがログに書き込まれます。この制限はディスクへの接続に適用されます。

## display_secrets_in_show_and_select \\{#display_secrets_in_show_and_select\\}

<SettingsInfoBlock type="Bool" default_value="0" />

テーブル、データベース、テーブル関数、およびディクショナリに対する `SHOW` および `SELECT` クエリでシークレット情報を表示するかどうかを有効または無効にします。

シークレット情報を表示する必要があるユーザーは、
[`format_display_secrets_in_show_and_select` フォーマット設定](../settings/formats#format_display_secrets_in_show_and_select)
を有効にし、かつ
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限を持っている必要があります。

設定可能な値:

- `0` — 無効。
- `1` — 有効。

## distributed_cache_apply_throttling_settings_from_client \\{#distributed_cache_apply_throttling_settings_from_client\\}

<SettingsInfoBlock type="Bool" default_value="1" />キャッシュサーバーがクライアントから受信したスロットリング設定を適用するかどうかを制御します。

## distributed_cache_keep_up_free_connections_ratio \\{#distributed_cache_keep_up_free_connections_ratio\\}

<SettingsInfoBlock type="Float" default_value="0.1" />分散キャッシュが確保しておこうとする空き接続数のソフトリミットです。空き接続数が distributed_cache_keep_up_free_connections_ratio * max_connections を下回ると、空き接続数がこの制限を上回るまで、最後のアクティビティ時刻が最も古い接続から順にクローズされます。

## distributed_ddl \{#distributed_ddl\}

クラスタ上での [distributed ddl queries](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）の実行を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) が有効な場合にのみ動作します。

`<distributed_ddl>` 内で設定可能な項目は次のとおりです。

| Setting                | Description                                                                    | Default Value                 |
| ---------------------- | ------------------------------------------------------------------------------ | ----------------------------- |
| `path`                 | DDL クエリ用の `task_queue` が格納される Keeper 内のパス                                      |                               |
| `profile`              | DDL クエリの実行に使用されるプロファイル                                                         |                               |
| `pool_size`            | 同時に実行できる `ON CLUSTER` クエリの数                                                    |                               |
| `max_tasks_in_queue`   | キュー内に格納できるタスクの最大数                                                              | `1,000`                       |
| `task_max_lifetime`    | ノードの経過時間がこの値を超えた場合にノードを削除                                                      | `7 * 24 * 60 * 60`（秒単位の 1 週間） |
| `cleanup_delay_period` | 直近のクリーンアップが `cleanup_delay_period` 秒以上前に実行されている場合に、新しいノードイベントを受信した後でクリーンアップを開始 | `60` 秒                        |

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


## distributed_ddl.cleanup_delay_period \\{#distributed_ddl.cleanup_delay_period\\}

<SettingsInfoBlock type="UInt64" default_value="60" />新しいノードイベントを受信した時点で、直前のクリーンアップから `<cleanup_delay_period>` 秒以上経過している場合にクリーンアップが開始されます。

## distributed_ddl.max_tasks_in_queue \\{#distributed_ddl.max_tasks_in_queue\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />キューに入れられるタスクの最大数。

## distributed_ddl.path \\{#distributed_ddl.path\\}

<SettingsInfoBlock type="String" default_value="/clickhouse/task_queue/ddl/" />DDL クエリ用の `<task_queue>` に対応する Keeper 上のパス

## distributed_ddl.pool_size \\{#distributed_ddl.pool_size\\}

<SettingsInfoBlock type="Int32" default_value="1" />同時に実行できる `<ON CLUSTER>` クエリの数

## distributed_ddl.profile \\{#distributed_ddl.profile\\}

DDL クエリを実行する際に使用されるプロファイル

## distributed_ddl.replicas_path \\{#distributed_ddl.replicas_path\\}

<SettingsInfoBlock type="String" default_value="/clickhouse/task_queue/replicas/" />Keeper 内にあるレプリカ用の `<task_queue>` のパス

## distributed_ddl.task_max_lifetime \\{#distributed_ddl.task_max_lifetime\\}

<SettingsInfoBlock type="UInt64" default_value="604800" />ノードの経過時間がこの値を超えた場合に、そのノードを削除します。

## distributed_ddl_use_initial_user_and_roles \\{#distributed_ddl_use_initial_user_and_roles\\}

<SettingsInfoBlock type="Bool" default_value="0" />有効にすると、`ON CLUSTER` クエリはリモートの分片で実行する際に、クエリを開始したユーザーとロールを保持して使用します。これによりクラスタ全体で一貫したアクセス制御が実現されますが、そのユーザーとロールがすべてのノードに存在している必要があります。

## dns_allow_resolve_names_to_ipv4 \\{#dns_allow_resolve_names_to_ipv4\\}

<SettingsInfoBlock type="Bool" default_value="1" />ホスト名を IPv4 アドレスに解決することを許可します。

## dns_allow_resolve_names_to_ipv6 \\{#dns_allow_resolve_names_to_ipv6\\}

<SettingsInfoBlock type="Bool" default_value="1" />ホスト名を IPv6 アドレスに解決することを許可します。

## dns_cache_max_entries \\{#dns_cache_max_entries\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />内部 DNS キャッシュの最大件数。

## dns_cache_update_period \\{#dns_cache_update_period\\}

<SettingsInfoBlock type="Int32" default_value="15" />内部 DNS キャッシュを更新する間隔（秒）。

## dns_max_consecutive_failures \\{#dns_max_consecutive_failures\\}

<SettingsInfoBlock type="UInt32" default_value="5" />

ホスト名の DNS キャッシュ更新がこの回数だけ連続して失敗した場合、それ以降は更新を試行しません。情報自体は DNS キャッシュ内に残ります。0 は無制限を意味します。

**関連項目**

- [`SYSTEM DROP DNS CACHE`](../../sql-reference/statements/system#drop-dns-cache)

## drop_distributed_cache_pool_size \\{#drop_distributed_cache_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="8" />分散キャッシュのドロップに使用されるスレッドプールのサイズ。

## drop_distributed_cache_queue_size \\{#drop_distributed_cache_queue_size\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />分散キャッシュの削除に使用されるスレッドプールのキューサイズ。

## enable_azure_sdk_logging \\{#enable_azure_sdk_logging\\}

<SettingsInfoBlock type="Bool" default_value="0" />Azure SDK のログ記録を有効にします

## encryption \{#encryption\}

[encryption codecs](/sql-reference/statements/create/table#encryption-codecs) で使用されるキーを取得するコマンドを構成します。キー（または複数のキー）は、環境変数に書き込むか、設定ファイルで設定する必要があります。

キーは、長さが 16 バイトの 16 進数または文字列である必要があります。

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
設定ファイルにキーを保存することは推奨されません。セキュアではありません。安全なディスク上の別の設定ファイルにキーを移動し、その設定ファイルへのシンボリックリンクを `config.d/` フォルダに配置してください。
:::

キーが 16 進数形式の場合に、設定から読み込む例:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

キーを環境変数から読み込む:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここでは `current_key_id` が暗号化に使用する現在のキーを設定し、指定されたすべてのキーを復号に使用できます。

これらのいずれの方法も、複数のキーに対して使用できます。

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

また、ユーザーは長さが 12 バイトである必要がある nonce を追加することもできます（デフォルトでは、暗号化および復号処理は、ゼロバイトのみで構成される nonce を使用します）。

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または 16 進数表記で指定できます:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
上記の内容はすべて `aes_256_gcm_siv` にも適用できます（ただしキーは 32 バイトである必要があります）。
:::


## error_log \{#error_log\}

これはデフォルトでは無効になっています。

**有効化**

エラー履歴収集 [`system.error_log`](../../operations/system-tables/error_log.md) を手動で有効にするには、次の内容の `/etc/clickhouse-server/config.d/error_log.xml` を作成します。

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

`error_log` 設定を無効にするには、次の内容でファイル `/etc/clickhouse-server/config.d/disable_error_log.xml` を作成します。

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## filesystem_caches_path \{#filesystem_caches_path\}

この設定はキャッシュのパスを指定します。

**例**

```xml
<filesystem_caches_path>/var/lib/clickhouse/filesystem_caches/</filesystem_caches_path>
```


## format_parsing_thread_pool_queue_size \\{#format_parsing_thread_pool_queue_size\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

入力をパースするためにスレッドプールにスケジュールできるジョブの最大数。

:::note
`0` を指定すると無制限になります。
:::

## format_schema_path \{#format_schema_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/format_schemas/" />

[CapnProto](/interfaces/formats/CapnProto) フォーマットのスキーマなど、入力データ用のスキーマが格納されているディレクトリパス。

**例**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>/var/lib/clickhouse/format_schemas/</format_schema_path>
```


## format_schema_path \{#format_schema_path\}

[CapnProto](/interfaces/formats/CapnProto) フォーマット用スキーマなど、入力データのスキーマが格納されているディレクトリのパス。

**例**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns \\{#global_profiler_cpu_time_period_ns\\}

<SettingsInfoBlock type="UInt64" default_value="10000000000" />グローバルプロファイラ用CPUクロックタイマーの周期（ナノ秒単位）。CPUクロックグローバルプロファイラを無効化するには、0 を設定します。単一クエリのプロファイリングには少なくとも 10000000（1 秒あたり 100 回）、クラスタ全体のプロファイリングには 1000000000（1 秒に 1 回）の値を推奨します。

## global_profiler_real_time_period_ns \\{#global_profiler_real_time_period_ns\\}

<SettingsInfoBlock type="UInt64" default_value="10000000000" />グローバルプロファイラの実時間クロックタイマーの周期（ナノ秒単位）。値を 0 に設定すると、実時間クロックグローバルプロファイラは無効になります。推奨値は、単一クエリのプロファイリングには少なくとも 10000000（1 秒間に 100 回）、クラスタ全体のプロファイリングには 1000000000（1 秒に 1 回）です。

## google_protos_path \{#google_protos_path\}

<SettingsInfoBlock type="String" default_value="/usr/share/clickhouse/protos/" />

Protobuf 型用の proto ファイルを含むディレクトリを指定します。

**例**

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## google_protos_path \{#google_protos_path\}

Protobuf 型の proto ファイルが格納されているディレクトリを指定します。

例:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## graphite \{#graphite\}

[Graphite](https://github.com/graphite-project) にデータを送信します。

設定項目:

* `host` – Graphite サーバー。
* `port` – Graphite サーバー上のポート。
* `interval` – 送信間隔（秒）。
* `timeout` – データ送信のタイムアウト（秒）。
* `root_path` – キーのプレフィックス。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルのデータを送信。
* `events` – 指定期間に蓄積された差分データを [system.events](/operations/system-tables/events) テーブルから送信。
* `events_cumulative` – [system.events](/operations/system-tables/events) テーブルの累積データを送信。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルのデータを送信。

複数の `<graphite>` 句を設定できます。たとえば、異なるデータを異なる間隔で送信するために利用できます。

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


## graphite_rollup \{#graphite_rollup\}

Graphite のデータを間引き（ロールアップ）するための設定です。

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


## hdfs.libhdfs3_conf \\{#hdfs.libhdfs3_conf\\}

libhdfs3 の構成ファイルの正しい場所を指定します。

## hsts_max_age \{#hsts_max_age\}

HSTS の有効期間（秒単位）。

:::note
値が `0` の場合、ClickHouse は HSTS を無効にします。正の値を設定すると HSTS が有効になり、`max-age` はその設定した値になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_hard_limit \\{#http_connections_hard_limit\\}

<SettingsInfoBlock type="UInt64" default_value="200000" />この制限に達した状態で新たな接続の作成を試みると、例外がスローされます。0 に設定するとハード制限を無効にできます。この制限は、いずれのディスクやストレージにも属さない http 接続に適用されます。

## http_connections_soft_limit \\{#http_connections_soft_limit\\}

<SettingsInfoBlock type="UInt64" default_value="100" />この制限を超えた接続は、有効期間が大幅に短くなります。この制限は、いずれのディスクやストレージにも属さない HTTP 接続に適用されます。

## http_connections_store_limit \\{#http_connections_store_limit\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />この上限を超えたコネクションは、使用後にリセットされます。0 を設定すると、コネクションキャッシュを無効にします。この上限は、いずれのディスクやストレージにも属さない HTTP コネクションに適用されます。

## http_connections_warn_limit \\{#http_connections_warn_limit\\}

<SettingsInfoBlock type="UInt64" default_value="500" />使用中の接続数がこの制限を超えると、警告メッセージがログに書き込まれます。この制限は、いずれのディスクやストレージにも紐付いていない HTTP 接続に適用されます。

## http_handlers \{#http_handlers\}

カスタム HTTP ハンドラーを使用できるようにします。
新しい http ハンドラーを追加するには、新しい `<rule>` を追加します。
ルールは定義された順に上から順にチェックされ、
最初にマッチしたもののハンドラーが実行されます。

以下の設定はサブタグで設定できます:

| Sub-tags             | Definition                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `url`                | リクエスト URL にマッチさせるために使用します。正規表現マッチを使用するには、接頭辞 &#39;regex:&#39; を付けます (任意)                               |
| `methods`            | リクエストメソッドにマッチさせるために使用します。複数のメソッドにマッチさせるには、カンマ区切りで複数指定します (任意)                                          |
| `headers`            | リクエストヘッダーにマッチさせるために使用します。各子要素をマッチさせます (子要素名がヘッダー名になります)。正規表現マッチを使用するには、接頭辞 &#39;regex:&#39; を付けます (任意) |
| `handler`            | リクエストハンドラー                                                                                             |
| `empty_query_string` | URL にクエリ文字列が存在しないことをチェックします                                                                            |

`handler` には以下の設定が含まれており、サブタグで設定できます:

| Sub-tags           | Definition                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | リダイレクト先の場所                                                                                                                          |
| `type`             | サポートされるタイプ: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                       |
| `status`           | static タイプと併用し、レスポンスのステータスコードを指定します                                                                                                 |
| `query_param_name` | dynamic&#95;query&#95;handler タイプと併用し、HTTP リクエストパラメータから `<query_param_name>` に対応する値を抽出して実行します                                       |
| `query`            | predefined&#95;query&#95;handler タイプと併用し、ハンドラーが呼び出されたときにクエリを実行します                                                                   |
| `content_type`     | static タイプと併用し、レスポンスの Content-Type を指定します                                                                                           |
| `response_content` | static タイプと併用し、クライアントに送信されるレスポンスコンテンツを指定します。接頭辞 &#39;file://&#39; または &#39;config://&#39; を使用する場合、ファイルまたは設定からコンテンツを取得してクライアントに送信します |

ルールの一覧に加えて、`<defaults/>` を指定して、すべてのデフォルトハンドラーを有効にすることができます。

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


## http_options_response \{#http_options_response\}

`OPTIONS` HTTP リクエストのレスポンスにヘッダーを追加するために使用します。
`OPTIONS` メソッドは、CORS プリフライトリクエストを送信する際に使用されます。

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


## http_server_default_response \{#http_server_default_response\}

ClickHouse の HTTP(s) サーバーにアクセスしたときに、デフォルトで表示されるページです。
デフォルト値は「Ok.」（末尾に改行あり）です。

**例**

`http://localhost: http_port` にアクセスすると `https://tabix.io/` が開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size \\{#iceberg_catalog_threadpool_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="50" />Iceberg カタログ用バックグラウンドスレッドプールのサイズ

## iceberg_catalog_threadpool_queue_size \\{#iceberg_catalog_threadpool_queue_size\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />Iceberg カタログプールにおいてキューに投入可能なタスクの数

## iceberg_metadata_files_cache_max_entries \\{#iceberg_metadata_files_cache_max_entries\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />iceberg メタデータファイルキャッシュの最大サイズ（エントリー数）。0 の場合は無効になります。

## iceberg_metadata_files_cache_policy \\{#iceberg_metadata_files_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />Iceberg メタデータファイルキャッシュポリシー名。

## iceberg_metadata_files_cache_size \\{#iceberg_metadata_files_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />iceberg メタデータキャッシュの最大サイズ（バイト単位）。0 の場合はキャッシュが無効化されます。

## iceberg_metadata_files_cache_size_ratio \\{#iceberg_metadata_files_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />iceberg メタデータキャッシュにおける、キャッシュ全体サイズに対する保護キューのサイズの比率（SLRU ポリシーの場合）。

## ignore_empty_sql_security_in_create_view_query \\{#ignore_empty_sql_security_in_create_view_query\\}

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、ClickHouse は `CREATE VIEW` クエリ内で空の SQL SECURITY 句に対するデフォルト値を記録しません。

:::note
この設定は移行期間中にのみ必要であり、24.4 で廃止予定です。
:::

## include_from \{#include_from\}

<SettingsInfoBlock type="String" default_value="/etc/metrika.xml" />

置換定義を含むファイルへのパスです。XML と YAML の両方の形式がサポートされています。

詳細については、[Configuration files](/operations/configuration-files) セクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## include_from \{#include_from\}

置換定義を記述したファイルへのパスです。XML と YAML の両方の形式がサポートされています。

詳細については、「[Configuration files](/operations/configuration-files)」セクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## index_mark_cache_policy \\{#index_mark_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリ索引マークキャッシュのポリシー名です。

## index_mark_cache_size \\{#index_mark_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

索引マークキャッシュの最大サイズ。

:::note

`0` を指定すると無効化されます。

この設定は実行時に変更でき、直ちに反映されます。
:::

## index_mark_cache_size_ratio \\{#index_mark_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.3" />セカンダリ索引マークキャッシュにおける（SLRU ポリシー使用時の）保護キューの、キャッシュ全体に対するサイズ比率。

## index_uncompressed_cache_policy \\{#index_uncompressed_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリ索引用の非圧縮キャッシュポリシーの名前。

## index_uncompressed_cache_size \\{#index_uncompressed_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

非圧縮の `MergeTree` 索引ブロック用キャッシュの最大サイズ。

:::note
値を `0` にすると無効になります。

この設定は実行時に変更可能であり、即座に反映されます。
:::

## index_uncompressed_cache_size_ratio \\{#index_uncompressed_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />セカンダリ索引の非圧縮キャッシュにおける保護キューのサイズを、キャッシュ全体サイズに対する比率として指定します（SLRU ポリシーの場合）。

## interserver_http_credentials \{#interserver_http_credentials\}

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)中に他のサーバーへ接続する際に使用されるユーザー名とパスワードです。加えて、サーバーはこれらの認証情報を使って他のレプリカを認証します。
したがって、`interserver_http_credentials` はクラスター内のすべてのレプリカで同一である必要があります。

:::note

* デフォルトでは、`interserver_http_credentials` セクションが省略されている場合、レプリケーション時に認証は使用されません。
* `interserver_http_credentials` 設定は、ClickHouse クライアントの認証情報[設定](../../interfaces/cli.md#configuration_files)とは無関係です。
* これらの認証情報は、`HTTP` および `HTTPS` によるレプリケーションで共通です。
  :::

以下の設定をサブタグで指定できます:

* `user` — ユーザー名。
* `password` — パスワード。
* `allow_empty` — `true` の場合、認証情報が設定されていても、他のレプリカが認証なしで接続することを許可します。`false` の場合、認証なしの接続は拒否されます。デフォルト: `false`。
* `old` — 認証情報ローテーション中に使用される旧 `user` と `password` を含みます。複数の `old` セクションを指定できます。

**認証情報のローテーション**

ClickHouse は、すべてのレプリカを同時に停止して設定を更新することなく、サーバー間認証情報の動的なローテーションをサポートします。認証情報は複数のステップに分けて変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、認証情報を追加します。これにより、認証ありおよび認証なしの両方の接続が許可されます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカの構成が完了したら、`allow_empty` を `false` に設定するか、この設定を削除してください。これにより、新しい認証情報での認証が必須になります。

既存の認証情報を変更するには、ユーザー名とパスワードを `interserver_http_credentials.old` セクションに移動し、`user` と `password` を新しい値に更新します。この時点で、サーバーは他のレプリカへの接続には新しい認証情報を使用し、他のレプリカからの接続については新旧どちらの認証情報も受け付けます。

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

新しい認証情報がすべてのレプリカに適用されたら、古い認証情報は削除して問題ありません。


## interserver_http_host \{#interserver_http_host\}

他のサーバーがこのサーバーにアクセスするために使用できるホスト名。

省略した場合は、`<hostname -f>` コマンドと同様に決定されます。

特定のネットワークインターフェースに依存しないようにしたい場合に便利です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_http_host \{#interserver_http_host\}

他のサーバーがこのサーバーにアクセスする際に利用されるホスト名です。

省略した場合は、`hostname -f` コマンドと同様の方法で決定されます。

特定のネットワークインターフェイスに依存しないようにする場合に有用です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_http_port \{#interserver_http_port\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse サーバー間のデータ交換に使用するポートです。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_http_port \{#interserver_http_port\}

ClickHouse サーバー間でデータをやり取りするためのポート。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_https_host \{#interserver_https_host\}

`<interserver_http_host>` と同様ですが、このホスト名は他のサーバーが `<HTTPS>` 経由でこのサーバーにアクセスするために使用するものです。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_https_host \{#interserver_https_host\}

[`interserver_http_host`](#interserver_http_host) と同様ですが、このホスト名は他のサーバーから `HTTPS` を介してこのサーバーへアクセスするために使用されます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_https_port \{#interserver_https_port\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`<HTTPS>` を介して ClickHouse サーバー間でデータ交換に使用するポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_https_port \{#interserver_https_port\}

ClickHouse サーバー同士が `HTTPS` 経由でデータをやり取りするためのポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_listen_host \{#interserver_listen_host\}

ClickHouse サーバー間でデータをやり取りできるホストを制限します。
Keeper を使用している場合、異なる Keeper インスタンス間の通信にも同じ制限が適用されます。

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


## io_thread_pool_queue_size \\{#io_thread_pool_queue_size\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

I/O スレッドプールでスケジュールできるジョブの最大数です。

:::note
値が `0` の場合は無制限を意味します。
:::

## jemalloc_collect_global_profile_samples_in_trace_log \\{#jemalloc_collect_global_profile_samples_in_trace_log\\}

<SettingsInfoBlock type="Bool" default_value="0" />jemalloc によるサンプリング済み割り当てを system.trace_log に保存します

## jemalloc_enable_background_threads \\{#jemalloc_enable_background_threads\\}

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc のバックグラウンドスレッドを有効にします。jemalloc は未使用のメモリページをクリーンアップするためにバックグラウンドスレッドを使用します。この設定を無効にすると、パフォーマンスが低下する可能性があります。

## jemalloc_enable_global_profiler \\{#jemalloc_enable_global_profiler\\}

<SettingsInfoBlock type="Bool" default_value="0" />すべてのスレッドに対して jemalloc のアロケーションプロファイラを有効にします。jemalloc はメモリアロケーションをサンプリングし、サンプリング対象となったアロケーションのすべての解放もサンプリングします。
プロファイルは、メモリアロケーションの解析に利用できる SYSTEM JEMALLOC FLUSH PROFILE を使用してフラッシュできます。
サンプルは、config `jemalloc_collect_global_profile_samples_in_trace_log` またはクエリ設定 `jemalloc_collect_profile_samples_in_trace_log` を使用して `system.trace_log` に保存することもできます。
[Allocation Profiling](/operations/allocation-profiling) を参照してください。

## jemalloc_flush_profile_interval_bytes \\{#jemalloc_flush_profile_interval_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />グローバルなピークメモリ使用量が jemalloc_flush_profile_interval_bytes バイト分増加するたびに、jemalloc プロファイルがフラッシュされます

## jemalloc_flush_profile_on_memory_exceeded \\{#jemalloc_flush_profile_on_memory_exceeded\\}

<SettingsInfoBlock type="Bool" default_value="0" />総メモリ使用量超過エラーが発生した場合に、jemalloc プロファイルをフラッシュします

## jemalloc_max_background_threads_num \\{#jemalloc_max_background_threads_num\\}

<SettingsInfoBlock type="UInt64" default_value="0" />作成する jemalloc のバックグラウンドスレッドの最大数。0 に設定すると jemalloc のデフォルト値に従います

## keep_alive_timeout \{#keep_alive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="30" />

ClickHouse が HTTP プロトコルでの受信リクエストを、接続を閉じる前に待機する時間（秒）。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts \\{#keeper_hosts\\}

動的に変更可能な設定です。ClickHouse が接続する可能性のある [Zoo]Keeper ホストの Set を保持します。この設定には `<auxiliary_zookeepers>` の情報は含まれません。

## keeper_multiread_batch_size \\{#keeper_multiread_batch_size\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

バッチングをサポートする [Zoo]Keeper への MultiRead リクエストで使用されるバッチの最大サイズです。0 に設定した場合、バッチングは無効になります。ClickHouse Cloud でのみ有効です。

## keeper_server.socket_receive_timeout_sec \\{#keeper_server.socket_receive_timeout_sec\\}

<SettingsInfoBlock type="UInt64" default_value="300" />Keeper サーバーのソケット受信タイムアウト。

## keeper_server.socket_send_timeout_sec \\{#keeper_server.socket_send_timeout_sec\\}

<SettingsInfoBlock type="UInt64" default_value="300" />Keeper のソケット送信タイムアウト。

## ldap_servers \\{#ldap_servers\\}

ここに LDAP サーバーとその接続パラメータを列挙して、次の目的で利用します:

- `password` の代わりに `ldap` 認証メカニズムが指定されている専用ローカルユーザーの認証に使用する
- リモートユーザーディレクトリとして使用する

以下の設定はサブタグで設定できます:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP サーバーのホスト名または IP。必須パラメータであり、空にはできません。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP サーバーのポート。`enable_tls` が true に設定されている場合のデフォルトは 636、それ以外の場合は `389` です。                                                                                                                                                                                                                                                                                                                       |
| `bind_dn`                      | バインドする DN を構成するために使用されるテンプレート。最終的な DN は、認証試行ごとにテンプレート内のすべての `\{user_name\}` 部分文字列を実際のユーザー名で置き換えることで構成されます。                                                                                                                                                                                                                                                 |
| `user_dn_detection`            | バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータを含むセクション。これは主に、サーバーが Active Directory の場合に、さらなるロールマッピングのための検索フィルターで使用されます。得られたユーザー DN は、`\{user_dn\}` 部分文字列を許可されている場所で置き換える際に使用されます。デフォルトでは、ユーザー DN は bind DN と同一に設定されますが、検索が実行されると検出された実際のユーザー DN の値で更新されます。 |
| `verification_cooldown`        | 正常にバインドされた後、その後のすべてのリクエストに対して LDAP サーバーへ問い合わせることなく、ユーザーが認証済みであると見なされる時間（秒単位）。キャッシュを無効にして、各認証リクエストごとに LDAP サーバーへの問い合わせを強制するには `0`（デフォルト）を指定します。                                                                                                                                        |
| `enable_tls`                   | LDAP サーバーへのセキュア接続を使用するかどうかを制御するフラグ。平文の (`ldap://`) プロトコル（非推奨）を使用するには `no` を指定します。SSL/TLS 上の LDAP (`ldaps://`) プロトコル（推奨、デフォルト）を使用するには `yes` を指定します。レガシーな StartTLS プロトコル（平文の (`ldap://`) プロトコルを TLS にアップグレード）を使用するには `starttls` を指定します。                                                                 |
| `tls_minimum_protocol_version` | SSL/TLS の最小プロトコルバージョン。指定可能な値は `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）です。                                                                                                                                                                                                                                                                                                                   |
| `tls_require_cert`             | SSL/TLS ピア証明書の検証動作。指定可能な値は `never`, `allow`, `try`, `demand`（デフォルト）です。                                                                                                                                                                                                                                                                                                  |
| `tls_cert_file`                | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 証明書鍵ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_ca_cert_file`             | CA 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | CA 証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                                    |
| `tls_cipher_suite`             | 許可される暗号スイート（OpenSSL の表記）。                                                                                                                                                                                                                                                                                                                                                                                              |

`user_dn_detection` 設定はサブタグで設定できます:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP 検索のベース DN を構成するために使用されるテンプレート。最終的な DN は、LDAP 検索中にテンプレート内のすべての `\{user_name\}` および '\{bind_dn\}' 部分文字列を、実際のユーザー名と bind DN で置き換えることで構成されます。                                                                                                           |
| `scope`         | LDAP 検索のスコープ。指定可能な値は `base`, `one_level`, `children`, `subtree`（デフォルト）です。                                                                                                                                                                                                                                            |
| `search_filter` | LDAP 検索の検索フィルターを構成するために使用されるテンプレート。最終的なフィルターは、LDAP 検索中にテンプレート内のすべての `\{user_name\}`、`\{bind_dn\}`、および `\{base_dn\}` 部分文字列を、実際のユーザー名、bind DN、および base DN で置き換えることで構成されます。特殊文字は XML 内で正しくエスケープする必要があることに注意してください。 |

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

例（以降のロールマッピングのためにユーザー DN 検出を設定した、典型的な Active Directory 環境）:

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


## license_file \\{#license_file\\}

ClickHouse Enterprise Edition のライセンスファイルの内容

## license_public_key_for_testing \\{#license_public_key_for_testing\\}

ライセンス検証用のデモキーで、CI での使用に限ります。

## listen_backlog \{#listen_backlog\}

<SettingsInfoBlock type="UInt32" default_value="4096" />

listen ソケットのバックログ（保留中接続キューのサイズ）。デフォルト値の `<4096>` は Linux 5.4+ と同じです。

通常、この値を変更する必要はありません。理由は次のとおりです。

* デフォルト値が十分に大きいこと
* クライアント接続の accept はサーバーの専用スレッドが処理していること

そのため、たとえ ClickHouse サーバーに対して `<TcpExtListenOverflows>`（`<nstat>` 由来）が 0 以外で、このカウンタが増え続けていても、この値を増やす必要があるとは限りません。理由は次のとおりです。

* 通常、`<4096>` では足りない状況は、ClickHouse 内部のスケーリング上の問題を示していることが多く、その場合は問題として報告した方がよいです。
* そのことはサーバーがその後さらに多くの接続を処理できることを意味しないためです（たとえ処理できたとしても、その時点ではクライアントはすでに離脱しているか切断されている可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen_backlog \{#listen_backlog\}

リッスンソケットの backlog（保留中接続のキューサイズ）。デフォルト値の `4096` は Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4) の値と同じです。

通常、この値を変更する必要はありません。理由は次のとおりです。

* デフォルト値が十分に大きいこと
* クライアント接続の受付にはサーバー側で専用スレッドがあること

そのため、`TcpExtListenOverflows`（`nstat` で取得） がゼロ以外で、このカウンタが ClickHouse サーバーで増加している場合でも、次の理由から必ずしもこの値を増やす必要があるとは限りません。

* 通常、`4096` では足りない場合は ClickHouse 内部のスケーリングに関する問題を示しているため、その場合は問題として報告することを推奨します。
* これはサーバーが後でより多くの接続を処理できることを意味するわけではありません（仮に処理できたとしても、その時点ではクライアントはすでにいなくなっているか、切断されている可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen_host \{#listen_host\}

リクエストを受け付けるホストを制限します。サーバーにすべてのホストからのリクエストに応答させたい場合は、`::` を指定します。

例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen_reuse_port \{#listen_reuse_port\}

<SettingsInfoBlock type="Bool" default_value="0" />

同じアドレス:ポートで複数のサーバーが待ち受けできるようにします。リクエストはオペレーティングシステムによってランダムなサーバーにルーティングされます。この設定を有効にすることは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```


## listen_reuse_port \{#listen_reuse_port\}

同じアドレスとポート番号で複数のサーバーが listen できるようにします。リクエストはオペレーティングシステムによってランダムに選ばれたサーバーへルーティングされます。この設定を有効化することは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

型:

デフォルト値:


## listen_try \{#listen_try\}

<SettingsInfoBlock type="Bool" default_value="0" />

リッスンを試みている際に IPv6 または IPv4 ネットワークが利用できなくても、サーバーは終了しません。

**例**

```xml
<listen_try>0</listen_try>
```


## listen_try \{#listen_try\}

listen を開始しようとしたときに IPv6 または IPv4 ネットワークが利用不能であっても、サーバーは終了しません。

**例**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size \\{#load_marks_threadpool_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="50" />マーク読み込み処理用バックグラウンドプールのサイズ

## load_marks_threadpool_queue_size \\{#load_marks_threadpool_queue_size\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />prefetch プールに投入できるタスクの数

## logger \\{#logger\\}

ログメッセージの出力先とフォーマットを指定します。

**キー**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | ログレベル。指定可能な値: `none` (ログ出力を無効化)、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                 |
| `log`                  | ログファイルへのパス。                                                                                                                                          |
| `errorlog`             | エラーログファイルへのパス。                                                                                                                                    |
| `size`                 | ローテーションポリシー: ログファイルの最大サイズ (バイト単位)。ログファイルサイズがこの閾値を超えると、ファイル名が変更されてアーカイブされ、新しいログファイルが作成されます。 |
| `rotation`             | ローテーションポリシー: ログファイルをいつローテーションするかを制御します。サイズ、時間、またはその両方の組み合わせに基づいてローテーションできます。例: 100M, daily, 100M,daily。ログファイルが指定サイズを超えるか、指定された時間間隔に達すると、ファイル名が変更されてアーカイブされ、新しいログファイルが作成されます。 |
| `count`                | ローテーションポリシー: ClickHouse が保持する履歴ログファイルの最大数。                                                                                        |
| `stream_compress`      | LZ4 を使用してログメッセージを圧縮します。有効にするには `1` または `true` を設定します。                                                                                                   |
| `console`              | コンソールへのログ出力を有効化します。有効にするには `1` または `true` を設定します。ClickHouse がデーモンモードで実行されていない場合のデフォルトは `1`、それ以外は `0` です。                            |
| `console_log_level`    | コンソール出力用のログレベル。デフォルトは `level` の値です。                                                                                                                 |
| `formatting.type`      | コンソール出力のログフォーマット。現在は `json` のみサポートされています。                                                                                                 |
| `use_syslog`           | ログ出力を syslog にも転送します。                                                                                                                                 |
| `syslog_level`         | syslog に対するログレベル。                                                                                                                                   |
| `async`                | `true` (デフォルト) の場合、ログは非同期に記録されます (出力チャネルごとに 1 つのバックグラウンドスレッド)。それ以外の場合は、LOG を呼び出したスレッド内で記録されます。           |
| `async_queue_max_size` | 非同期ロギングを使用する場合に、フラッシュ待ちとしてキューに保持されるメッセージの最大数。超過分のメッセージは破棄されます。                       |
| `startup_level`        | サーバー起動時にルートロガーのレベルを設定するために使用される起動レベル。起動後、ログレベルは `level` の設定値に戻されます。                                   |
| `shutdown_level`       | サーバー停止時にルートロガーのレベルを設定するために使用される停止レベル。                                                                                            |

**ログフォーマット指定子**

`log` および `errorLog` パス内のファイル名部分では、生成されるファイル名に対して以下のフォーマット指定子を使用できます (ディレクトリ部分では使用できません)。

「Example」カラムは、`2023-07-06 18:32:07` 時点での出力例を示します。

| 書式指定子 | 説明                                                                                                                  | 例                          |
| ----- | ------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%`  | % 記号そのもの                                                                                                            | `%`                        |
| `%n`  | 改行文字                                                                                                                |                            |
| `%t`  | 水平タブ文字                                                                                                              |                            |
| `%Y`  | 10 進数で表した西暦年。例: 2017                                                                                                | `2023`                     |
| `%y`  | 年の下位2桁を10進数で表したもの（範囲 [00,99]）                                                                                       | `23`                       |
| `%C`  | 年を10進数で表したときの最初の2桁（範囲 [00,99]）                                                                                      | `20`                       |
| `%G`  | 4桁の [ISO 8601 週を基準とした年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)。すなわち、指定された週を含む年。通常は `%V` と併用する場合にのみ有用です。 | `2023`                     |
| `%g`  | 指定された週を含む[ISO 8601 週基準の暦年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)の年の下2桁。                                | `23`                       |
| `%b`  | 月名の省略形。例: Oct（ロケールに依存）                                                                                              | `Jul`                      |
| `%h`  | %b の別名                                                                                                              | `Jul`                      |
| `%B`  | 月名の完全表記。例: October（ロケールに依存）                                                                                         | `7月`                       |
| `%m`  | 月を 10 進数で表した数値（[01,12] の範囲）                                                                                         | `07`                       |
| `%U`  | 年内の週番号（10進数表記。週の第1曜日は日曜日）（範囲 [00,53]）                                                                               | `27`                       |
| `%W`  | 年内の週番号を10進数で表したもの（週の開始曜日は月曜日）（範囲 [00,53]）                                                                           | `27`                       |
| `%V`  | ISO 8601 に準拠した週番号（範囲 [01,53]）                                                                                       | `27`                       |
| `%j`  | その年の通算日を10進数で表した値（範囲 [001,366]）                                                                                     | `187`                      |
| `%d`  | 月の日付をゼロ埋めした10進数で表します（範囲 [01,31]）。1桁の場合は先頭にゼロを付けます。                                                                  | `06`                       |
| `%e`  | 月の日をスペース埋めした10進数で表現します（範囲 [1,31]）。1 桁の場合は先頭にスペースが付きます。                                                              | `&nbsp; 6`                 |
| `%a`  | 曜日名の省略形。例：Fri（ロケールに依存）                                                                                              | `Thu`                      |
| `%A`  | 曜日名（フルスペル）。例: Friday（ロケールに依存）                                                                                       | `Thursday`                 |
| `%w`  | 曜日を表す整数値で、日曜日を 0 とする（範囲 [0-6]）                                                                                      | `4`                        |
| `%u`  | 月曜日を 1 とする 10 進数の曜日（ISO 8601 形式）（範囲 [1-7]）                                                                          | `4`                        |
| `%H`  | 時刻の時を 10 進数で表現（24 時間制、範囲 [00-23]）                                                                                   | `18`                       |
| `%I`  | 時を表す 10 進数（12 時間制、範囲 [01,12]）                                                                                       | `06`                       |
| `%M`  | 分を10進数で表した数値（範囲 [00,59]）                                                                                            | `32`                       |
| `%S`  | 秒（10進数、範囲 [00,60]）                                                                                                  | `07`                       |
| `%c`  | 標準的な日付と時刻の文字列。例: Sun Oct 17 04:41:13 2010（ロケールに依存）                                                                  | `Thu Jul  6 18:32:07 2023` |
| `%x`  | ロケールに応じた日付表現（ロケール依存）                                                                                                | `2023/07/06`               |
| `%X`  | ロケールに依存する時刻表現。例: 18:40:20 または 6:40:20 PM（ロケールに依存）                                                                   | `18:32:07`                 |
| `%D`  | 短い MM/DD/YY 形式の日付。%m/%d/%y と同等                                                                                      | `07/06/23`                 |
| `%F`  | 短い YYYY-MM-DD 形式の日付。%Y-%m-%d と同等。                                                                                   | `2023-07-06`               |
| `%r`  | ロケールに応じた12時間制の時刻                                                                                                    | `06:32:07 PM`              |
| `%R`  | &quot;%H:%M&quot; と同じ                                                                                               | `18:32`                    |
| `%T`  | &quot;%H:%M:%S&quot;（ISO 8601 の時刻形式）と同等                                                                             | `18:32:07`                 |
| `%p`  | ロケールに依存する a.m. または p.m. の表記                                                                                         | `午後`                       |
| `%z`  | UTC からのオフセットを ISO 8601 形式（例: -0430）で表したもの。タイムゾーン情報が利用できない場合は何も出力しない                                                 | `+0800`                    |
| `%Z`  | ロケールに依存するタイムゾーン名または略称。タイムゾーン情報が利用できない場合は、何も出力されません                                                                  | `Z AWST `                  |

**使用例**

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

ログメッセージのみをコンソールに出力するには、次のようにします：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとの上書き設定**

個々のロガー名ごとにログレベルを上書きできます。例えば、ロガー「Backup」と「RBAC」のすべてのメッセージを出力しないようにする場合などです。

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

| Key        | Description                                                                                                                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | `host\[:port\]` 形式の syslog アドレス。省略した場合はローカルデーモンが使用されます。                                                                                                                                                                    |
| `hostname` | ログが送信されるホストの名前（オプション）。                                                                                                                                                                                                     |
| `facility` | syslog の [facility keyword](https://en.wikipedia.org/wiki/Syslog#Facility)。`LOG&#95;` プレフィックスを付けた大文字で指定する必要があります（例: `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` など）。デフォルト: `address` が指定されている場合は `LOG_USER`、それ以外は `LOG_DAEMON`。 |
| `format`   | ログメッセージ形式。指定可能な値: `bsd` および `syslog`。                                                                                                                                                                                      |

**ログフォーマット**

コンソールログに出力されるログフォーマットを指定できます。現在は JSON のみがサポートされています。

**例**

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

JSON ログ記録を有効にするには、次のスニペットを使用します。

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

`<names>` タグ内のタグの値を変更することで、キー名を変更できます。たとえば、`DATE_TIME` を `MY_DATE_TIME` に変更するには、`<date_time>MY_DATE_TIME</date_time>` を使用します。

**JSON ログのキーの省略**

プロパティをコメントアウトすることで、ログのプロパティを省略できます。たとえば、ログに `query_id` を出力したくない場合は、`<query_id>` タグをコメントアウトします。


## logger.async \\{#logger.async\\}

<SettingsInfoBlock type="Bool" default_value="1" />`<true>`（デフォルト）の場合、ログ出力は非同期に実行されます（出力チャネルごとに 1 つのバックグラウンドスレッド）。それ以外の場合は、LOG を呼び出したスレッド内で同期的にログが記録されます。

## logger.async_queye_max_size \\{#logger.async_queye_max_size\\}

<SettingsInfoBlock type="UInt64" default_value="65536" />非同期ロギングを使用する場合に、フラッシュされるまでキューに保持されるメッセージ数の最大値です。超過したメッセージは破棄されます。

## logger.console \\{#logger.console\\}

<SettingsInfoBlock type="Bool" default_value="0" />コンソールへのログ出力を有効にします。有効にするには `<1>` または `<true>` を設定します。ClickHouse がデーモンモードで動作していない場合のデフォルトは `<1>`、それ以外の場合は `<0>` です。

## logger.console_log_level \\{#logger.console_log_level\\}

<SettingsInfoBlock type="String" default_value="trace" />コンソール出力時のログレベルを指定します。デフォルトは `<level>` です。

## logger.count \\{#logger.count\\}

<SettingsInfoBlock type="UInt64" default_value="1" />ローテーションポリシー：過去の ClickHouse ログファイルを最大いくつまで保持するかを指定します。

## logger.errorlog \\{#logger.errorlog\\}

エラーログファイルのパス。

## logger.formatting.type \\{#logger.formatting.type\\}

<SettingsInfoBlock type="String" default_value="json" />コンソール出力時のログ形式。現在は `<json>` のみがサポートされています。

## logger.level \\{#logger.level\\}

<SettingsInfoBlock type="String" default_value="trace" />ログレベル。指定可能な値: `<none>`（ログ出力を無効化）、`<fatal>`、`<critical>`、`<error>`、`<warning>`、`<notice>`、`<information>`、`<debug>`、`<trace>`、`<test>`。

## logger.log \\{#logger.log\\}

ログファイルのパス。

## logger.rotation \\{#logger.rotation\\}

<SettingsInfoBlock type="String" default_value="100M" />ローテーションポリシーです。ログファイルをどのタイミングでローテーションするかを制御します。ローテーションはサイズ、時間、またはそれらの組み合わせに基づいて行うことができます。例: 100M、daily、100M,daily。ログファイルが指定されたサイズを超えるか、指定された時間間隔に達すると、そのファイルはリネームされてアーカイブされ、新しいログファイルが作成されます。

## logger.shutdown_level \\{#logger.shutdown_level\\}

shutdown レベルは、サーバーのシャットダウン時に root logger のログレベルを設定するために使用されます。

## logger.size \\{#logger.size\\}

<SettingsInfoBlock type="String" default_value="100M" />ローテーションポリシー: ログファイルの最大サイズ（バイト単位）を指定します。このしきい値を超えると、ログファイルはリネームされてアーカイブされ、新しいログファイルが作成されます。

## logger.startup_level \\{#logger.startup_level\\}

起動レベルは、サーバー起動時にルートロガーのレベルを設定するための値です。サーバーの起動完了後は、ログレベルは `<level>` の設定値に戻ります。

## logger.stream_compress \\{#logger.stream_compress\\}

<SettingsInfoBlock type="Bool" default_value="0" />LZ4 を使用してログメッセージを圧縮します。有効化するには `<1>` または `<true>` に設定します。

## logger.syslog_level \\{#logger.syslog_level\\}

<SettingsInfoBlock type="String" default_value="trace" />syslog に出力する際のログレベル。

## logger.use_syslog \\{#logger.use_syslog\\}

<SettingsInfoBlock type="Bool" default_value="0" />ログ出力を syslog にも送信します。

## macros \{#macros\}

レプリケートテーブル用のパラメータ置換。

レプリケートテーブルを使用しない場合は省略できます。

詳細については、[レプリケートテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)セクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```


## mark_cache_policy \\{#mark_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />Mark キャッシュポリシーの名前です。

## mark_cache_prewarm_ratio \\{#mark_cache_prewarm_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.95" />mark cache をプリウォームする際に、事前に埋めておく合計サイズの比率。

## mark_cache_size \\{#mark_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

マークキャッシュの最大サイズ（[`MergeTree`](/engines/table-engines/mergetree-family) ファミリーのテーブルにおける索引）。

:::note
この設定は実行時に変更でき、即座に反映されます。
:::

## mark_cache_size_ratio \\{#mark_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />SLRU ポリシーを使用する場合のマークキャッシュにおける保護キューのサイズを、キャッシュ全体のサイズに対する比率で指定します。

## max_active_parts_loading_thread_pool_size \\{#max_active_parts_loading_thread_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="64" />起動時にアクティブなパーツセット（Active）を読み込むためのスレッド数。

## max_authentication_methods_per_user \\{#max_authentication_methods_per_user\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

1人のユーザーについて、作成時または変更時に設定できる認証方式の最大数です。
この設定を変更しても既存ユーザーには影響しません。認証に関連する CREATE / ALTER クエリが、この設定で指定された上限を超えると失敗します。
認証に関係しない CREATE / ALTER クエリは成功します。

:::note
値を `0` にすると無制限を意味します。
:::

## max_backup_bandwidth_for_server \\{#max_backup_bandwidth_for_server\\}

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上で実行されるすべてのバックアップ処理に対する最大読み取り速度（バイト/秒）。0 の場合は無制限です。

## max_backups_io_thread_pool_free_size \\{#max_backups_io_thread_pool_free_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />Backups IO スレッドプール内の**アイドル**スレッド数が `max_backup_io_thread_pool_free_size` を超えると、ClickHouse はアイドル状態のスレッドが占有しているリソースを解放し、プールのサイズを縮小します。スレッドは必要に応じて再度作成されます。

## max_backups_io_thread_pool_size \\{#max_backups_io_thread_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse は Backups IO Thread プールのスレッドを使用して S3 バックアップの I/O 処理を実行します。`max_backups_io_thread_pool_size` は、このプール内のスレッド数の上限を設定します。

## max_build_vector_similarity_index_thread_pool_size \\{#max_build_vector_similarity_index_thread_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="16" />

ベクトル索引のビルドに使用するスレッド数の上限。

:::note
`0` を指定すると、すべてのコアを使用します。
:::

## max_concurrent_insert_queries \\{#max_concurrent_insert_queries\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行できる INSERT クエリの総数の上限。

:::note

`0`（デフォルト）の場合は、無制限を意味します。

この設定は実行時に変更でき、即座に反映されます。すでに実行中のクエリには影響しません。
:::

## max_concurrent_queries \\{#max_concurrent_queries\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行されるクエリの総数に対する上限です。`INSERT` と `SELECT` クエリへの制限、およびユーザーに対するクエリ数の最大値の制限もあわせて考慮する必要があります。

関連項目:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

値が `0`（デフォルト）の場合は無制限を意味します。

この設定は実行時に変更でき、直ちに有効になります。すでに実行中のクエリには影響しません。
:::

## max_concurrent_select_queries \\{#max_concurrent_select_queries\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行できる `SELECT` クエリ総数の上限。

:::note

`0`（デフォルト）の場合は無制限を意味します。

この設定は実行時に変更でき、変更は即座に反映されます。すでに実行中のクエリには影響しません。
:::

## max_connections \\{#max_connections\\}

<SettingsInfoBlock type="Int32" default_value="4096" />サーバーの最大同時接続数。

## max_database_num_to_throw \\{#max_database_num_to_throw\\}

<SettingsInfoBlock type="UInt64" default_value="0" />データベースの数がこの値より大きい場合、サーバーは例外をスローします。0 は制限がないことを意味します。

## max_database_num_to_warn \{#max_database_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

アタッチされたデータベースの数が指定された値を超えると、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに記録します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size \\{#max_database_replicated_create_table_thread_pool_size\\}

<SettingsInfoBlock type="UInt32" default_value="1" />DatabaseReplicated データベースで、レプリカ復旧中にテーブルを作成するために使用されるスレッド数を指定します。0 を指定すると、スレッド数はコア数と同じになります。

## max_dictionary_num_to_throw \{#max_dictionary_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Dictionary の数がこの値を超える場合、サーバーは例外をスローします。

次のデータベースエンジンのテーブルのみをカウントします：

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


## max_dictionary_num_to_warn \{#max_dictionary_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

アタッチされている Dictionary の数が指定された値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server \\{#max_distributed_cache_read_bandwidth_for_server\\}

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上の分散キャッシュからの合計読み取り速度の上限を、1 秒あたりのバイト数で指定します。ゼロの場合は無制限を意味します。

## max_distributed_cache_write_bandwidth_for_server \\{#max_distributed_cache_write_bandwidth_for_server\\}

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上の分散キャッシュへの合計書き込み速度の最大値（1 秒あたりのバイト数）。0 の場合は無制限です。

## max_entries_for_hash_table_stats \\{#max_entries_for_hash_table_stats\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />集約中に収集されるハッシュテーブル統計情報に含めることが許容されるエントリ数の上限

## max_fetch_partition_thread_pool_size \\{#max_fetch_partition_thread_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITION 操作に使用されるスレッド数。

## max_format_parsing_thread_pool_free_size \\{#max_format_parsing_thread_pool_free_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

入力データのパース用スレッドプールで保持しておくアイドル状態の待機スレッド数の上限。

## max_format_parsing_thread_pool_size \\{#max_format_parsing_thread_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

入力データのパースに使用できるスレッド総数の上限。

## max_io_thread_pool_free_size \\{#max_io_thread_pool_free_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

IO スレッドプール内の**アイドル**スレッド数が `max_io_thread_pool_free_size` を超えると、ClickHouse はアイドル状態のスレッドが占有しているリソースを解放し、プールサイズを縮小します。スレッドは必要に応じて再作成されます。

## max_io_thread_pool_size \\{#max_io_thread_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse は IO スレッドプールのスレッドを使用して、各種の IO 処理（例: S3 とのやり取り）を実行します。`max_io_thread_pool_size` は、プール内のスレッド数の上限を設定します。

## max_keep_alive_requests \{#max_keep_alive_requests\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse サーバーが 1 つの keep-alive 接続を閉じるまでに許可されるリクエストの最大数。

**例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server \\{#max_local_read_bandwidth_for_server\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカル読み取りの最大速度（1 秒あたりのバイト数）。

:::note
値が `0` の場合、無制限を意味します。
:::

## max_local_write_bandwidth_for_server \\{#max_local_write_bandwidth_for_server\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカルへの書き込みの最大速度（1 秒あたりのバイト数）。

:::note
値が `0` の場合は、無制限を意味します。
:::

## max_materialized_views_count_for_table \\{#max_materialized_views_count_for_table\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1 つのテーブルに紐付け可能な materialized view の数の上限値。

:::note
ここでカウントされるのはテーブルに直接依存する view のみであり、ある view を基に別の view を作成するケースは含まれません。
:::

## max_merges_bandwidth_for_server \\{#max_merges_bandwidth_for_server\\}

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべてのマージ処理における最大読み取り速度（1 秒あたりのバイト数）。0 の場合は無制限です。

## max_mutations_bandwidth_for_server \\{#max_mutations_bandwidth_for_server\\}

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上で実行されるすべてのミューテーションに対する最大読み取り帯域（1 秒あたりのバイト数）。0 を指定すると無制限になります。

## max_named_collection_num_to_throw \{#max_named_collection_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

名前付きコレクションの数がこの値を超えると、サーバーは例外をスローします。

:::note
値 `0` は、制限がないことを意味します。
:::

**例**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max_named_collection_num_to_warn \{#max_named_collection_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

名前付きコレクションの数が指定した値を超えると、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max_open_files \\{#max_open_files\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に開いておけるファイル数の最大値。

:::note
macOS では、`getrlimit()` 関数が誤った値を返すことがあるため、このオプションを利用することを推奨します。
:::

## max_open_files \{#max_open_files\}

同時に開くことができるファイル数の最大値。

:::note
macOS では `getrlimit()` 関数が誤った値を返すため、このオプションの使用を推奨します。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```


## max_os_cpu_wait_time_ratio_to_drop_connection \\{#max_os_cpu_wait_time_ratio_to_drop_connection\\}

<SettingsInfoBlock type="Float" default_value="0" />

接続を切断するかどうかを判断するための、OS の CPU 待ち時間（`OSCPUWaitMicroseconds` メトリクス）と CPU ビジー時間（`OSCPUVirtualTimeMicroseconds` メトリクス）の比率の最大値です。最小比率と最大比率の間で線形補間を用いて接続を切断する確率を計算し、この最大比率に達した時点で確率は 1 になります。
詳細は [サーバー CPU 過負荷時の動作制御](/operations/settings/server-overload) を参照してください。

## max_outdated_parts_loading_thread_pool_size \\{#max_outdated_parts_loading_thread_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="32" />起動時に非アクティブなデータパーツ（古いパーツ）の読み込みに使用するスレッド数。

## max_part_num_to_warn \{#max_part_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

アクティブなパーツの数が指定した値を超えた場合、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max_partition_size_to_drop \{#max_partition_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

パーティションの削除に関する制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが（バイト単位で）[`max_partition_size_to_drop`](#max_partition_size_to_drop) を超えると、[DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) クエリを使用してパーティションを削除することはできません。
この設定を反映するために ClickHouse サーバーを再起動する必要はありません。制限を無効化する別の方法としては、`<clickhouse-path>/flags/force_drop_table` ファイルを作成することがあります。

:::note
値 `0` は、制限なしにパーティションを削除できることを意味します。

この制限は DROP TABLE および TRUNCATE TABLE には適用されません。詳しくは [max&#95;table&#95;size&#95;to&#95;drop](/operations/settings/settings#max_table_size_to_drop) を参照してください。
:::

**例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size \\{#max_parts_cleaning_thread_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="128" />非アクティブなパーツを同時に削除するためのスレッド数。

## max_pending_mutations_execution_time_to_warn \{#max_pending_mutations_execution_time_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="86400" />

保留中のいずれかのミューテーションが指定された秒数を超えた場合、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max_pending_mutations_to_warn \{#max_pending_mutations_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="500" />

保留中のミューテーション数が指定した値を超えると、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size \\{#max_prefixes_deserialization_thread_pool_free_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

prefixes のデシリアライズ用スレッドプール内の**アイドル**スレッド数が `max_prefixes_deserialization_thread_pool_free_size` を超えた場合、ClickHouse はアイドル状態のスレッドによって占有されているリソースを解放し、プールサイズを縮小します。必要に応じてスレッドは再作成されます。

## max_prefixes_deserialization_thread_pool_size \\{#max_prefixes_deserialization_thread_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse は、MergeTree の Wide パーツ内のファイルプレフィックスからカラムおよびサブカラムのメタデータを並列に読み取るために、プレフィックスのデシリアライズ用スレッドプールのスレッドを使用します。`max_prefixes_deserialization_thread_pool_size` は、このプール内のスレッド数の最大値を制限します。

## max_remote_read_network_bandwidth_for_server \\{#max_remote_read_network_bandwidth_for_server\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時における、ネットワーク経由でのデータ交換の最大速度（バイト/秒）。

:::note
`0`（デフォルト）の値は無制限を意味します。
:::

## max_remote_write_network_bandwidth_for_server \\{#max_remote_write_network_bandwidth_for_server\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

書き込み時のネットワーク経由のデータ交換の最大速度（バイト/秒）。

:::note
`0`（デフォルト）の値は無制限を意味します。
:::

## max_replicated_fetches_network_bandwidth_for_server \\{#max_replicated_fetches_network_bandwidth_for_server\\}

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケーションのフェッチ処理において、ネットワーク上でのデータ交換の最大速度をバイト/秒で制限します。0 の場合は無制限です。

## max_replicated_sends_network_bandwidth_for_server \\{#max_replicated_sends_network_bandwidth_for_server\\}

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケート送信時のネットワーク経由でのデータ交換速度の上限（1 秒あたりのバイト数）。0 の場合は無制限です。

## max_replicated_table_num_to_throw \{#max_replicated_table_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

レプリケーテッドテーブルの数がこの値を超えた場合、サーバーは例外を送出します。

次のデータベースエンジンのテーブルのみが対象です:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
`0` の値は、制限なしを意味します。
:::

**例**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```


## max_server_memory_usage \\{#max_server_memory_usage\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

サーバーが使用できるメモリの最大量（バイト単位）を指定します。

:::note
サーバーの最大メモリ使用量は、`max_server_memory_usage_to_ram_ratio` の設定によってさらに制限されます。
:::

特別なケースとして、値が `0`（デフォルト）の場合、サーバーは（`max_server_memory_usage_to_ram_ratio` によって課される追加の制限を除き）利用可能なメモリをすべて使用することが許可されます。

## max_server_memory_usage_to_ram_ratio \\{#max_server_memory_usage_to_ram_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.9" />

サーバーが使用することを許可されるメモリの最大量を、利用可能なメモリ全体に対する比率として指定します。

たとえば、`0.9`（デフォルト）の場合、サーバーは利用可能なメモリの 90% まで消費できます。

この設定により、メモリ容量の小さいシステムでのメモリ使用量を抑制できます。
RAM とスワップが少ないホストでは、[`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) を 1 より大きく設定する必要が生じる場合があります。

:::note
サーバーの最大メモリ使用量は、`max_server_memory_usage` 設定によってさらに制限されます。
:::

## max_session_timeout \{#max_session_timeout\}

セッションの最大タイムアウト値（秒単位）。

例:

```xml
<max_session_timeout>3600</max_session_timeout>
```


## max_table_num_to_throw \{#max_table_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブル数がこの値より大きい場合、サーバーは例外をスローします。

次のテーブルはカウントされません:

* view
* remote
* dictionary
* system

次のデータベースエンジンのテーブルのみカウントします:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
値が `0` の場合、制限がないことを意味します。
:::

**例**

```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```


## max_table_num_to_warn \{#max_table_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

アタッチされているテーブル数が指定した値を超えた場合、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```


## max_table_size_to_drop \{#max_table_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

テーブル削除に関する制限です。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが `max_table_size_to_drop`（バイト単位）を超える場合、[`DROP`](../../sql-reference/statements/drop.md) クエリまたは [`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリを使用して削除することはできません。

:::note
値が `0` の場合は、すべてのテーブルを制限なしで削除できます。

この設定を反映させるために ClickHouse サーバーの再起動は不要です。制限を無効にする別の方法として、`<clickhouse-path>/flags/force_drop_table` ファイルを作成します。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size \\{#max_temporary_data_on_disk_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

外部集約、JOIN、ソートに利用される一時データのディスク最大使用量。
この上限を超えるクエリは例外が発生して失敗します。

:::note
`0` の値は無制限を意味します。
:::

関連項目:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max_thread_pool_free_size \{#max_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

グローバルスレッドプール内の**アイドル状態の**スレッド数が [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size) より大きい場合、ClickHouse は一部のスレッドが占有しているリソースを解放し、プールサイズを縮小します。必要に応じてスレッドは再度作成されます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```


## max_thread_pool_size \{#max_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse はクエリを処理するためにグローバルスレッドプールのスレッドを使用します。クエリを処理するための空きスレッドが存在しない場合、プール内に新しいスレッドが作成されます。`max_thread_pool_size` はプール内のスレッド数の上限を設定します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```


## max_unexpected_parts_loading_thread_pool_size \\{#max_unexpected_parts_loading_thread_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="8" />起動時に非アクティブなデータパーツ群（想定外のパーツ）を読み込むスレッド数。

## max_view_num_to_throw \{#max_view_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ビューの数がこの値を超えると、サーバーは例外を送出します。

以下のデータベースエンジンのテーブルのみがカウント対象です:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
`0` は無制限を意味します。
:::

**例**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```


## max_view_num_to_warn \{#max_view_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

アタッチされているビューの数が指定値を超えた場合、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries \\{#max_waiting_queries\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に待機状態になれるクエリの総数の上限です。
待機中クエリの実行は、必要なテーブルが非同期にロードされている間はブロックされます（[`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases) を参照）。

:::note
以下の設定で制御される制限をチェックする際、待機中クエリはカウントされません。

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

これは、サーバー起動直後にこれらの制限に達してしまうことを避けるための調整です。
:::

:::note

`0`（デフォルト）の値は無制限を意味します。

この設定は実行時に変更可能で、即時に反映されます。すでに実行中のクエリには影響しません。
:::

## memory_worker_correct_memory_tracker \\{#memory_worker_correct_memory_tracker\\}

<SettingsInfoBlock type="Bool" default_value="0" />

バックグラウンドメモリワーカーが、jemalloc や cgroups などの外部情報源からの情報に基づいて内部メモリトラッカーを補正するかどうかを指定します。

## memory_worker_period_ms \\{#memory_worker_period_ms\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

バックグラウンドのメモリワーカーのティック間隔を指定します。このワーカーは、メモリトラッカーによるメモリ使用量を補正し、メモリ使用量が多い場合に未使用ページをクリーンアップします。0 に設定した場合、メモリ使用元に応じてデフォルト値が使用されます。

## memory_worker_purge_dirty_pages_threshold_ratio \\{#memory_worker_purge_dirty_pages_threshold_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.2" />

ClickHouse サーバーで利用可能なメモリに対する、jemalloc のダーティページのしきい値となる比率です。ダーティページのサイズがこの比率を超えると、バックグラウンドのメモリワーカーがダーティページのパージを強制的に実行します。0 に設定すると、強制パージは無効になります。

## memory_worker_use_cgroup \\{#memory_worker_use_cgroup\\}

<SettingsInfoBlock type="Bool" default_value="1" />現在の cgroup のメモリ使用量に関する情報を利用して、メモリトラッキングを調整します。

## merge_tree \{#merge_tree\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブル向けの微調整用設定です。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload \\{#merge_workload\\}

<SettingsInfoBlock type="String" default_value="default" />

マージ処理とその他のワークロード間で、リソースの使用および共有を調整するために使用します。指定した値は、すべてのバックグラウンドマージに対する `workload` SETTING の値として使用されます。MergeTree の設定によって上書きできます。

**関連項目**

- [Workload Scheduling](/operations/workload-scheduling.md)

## merges_mutations_memory_usage_soft_limit \{#merges_mutations_memory_usage_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

マージおよびミューテーション処理を実行する際に使用を許可する RAM の上限を設定します。
ClickHouse がこの上限値に達すると、新しいバックグラウンドのマージまたはミューテーション処理はスケジュールされなくなりますが、すでにスケジュール済みのタスクは引き続き実行されます。

:::note
`0` の値は無制限を意味します。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio \\{#merges_mutations_memory_usage_to_ram_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />

`merges_mutations_memory_usage_soft_limit` のデフォルト値は、`memory_amount * merges_mutations_memory_usage_to_ram_ratio` として計算されます。

**関連項目:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric_log \{#metric_log\}

デフォルトでは無効になっています。

**有効化**

メトリクス履歴の収集を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/metric_log.xml` を作成し、[`system.metric_log`](../../operations/system-tables/metric_log.md) を有効にします。

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


## min_os_cpu_wait_time_ratio_to_drop_connection \\{#min_os_cpu_wait_time_ratio_to_drop_connection\\}

<SettingsInfoBlock type="Float" default_value="0" />

接続を切断するかどうかを判断する際に使用される、OS の CPU 待ち時間（OSCPUWaitMicroseconds メトリクス）とビジー時間（OSCPUVirtualTimeMicroseconds メトリクス）の最小比です。切断確率の計算には、この最小比と最大比の間の線形補間が使用され、この値では確率は 0 になります。
詳細については [サーバー CPU の過負荷時の動作制御](/operations/settings/server-overload) を参照してください。

## mlock_executable \{#mlock_executable\}

<SettingsInfoBlock type="Bool" default_value="0" />

起動後に `<mlockall>` を実行して、最初のクエリのレイテンシーを低減し、高い I/O 負荷時に clickhouse 実行ファイルがページアウトされるのを防ぎます。

:::note
このオプションを有効化することを推奨しますが、起動時間が最大で数秒程度長くなります。この設定は &quot;CAP&#95;IPC&#95;LOCK&quot; ケーパビリティなしでは動作しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```


## mlock_executable \{#mlock_executable\}

起動後に `mlockall` を実行し、最初のクエリのレイテンシを下げ、I/O 負荷が高い状況で ClickHouse の実行ファイルがページアウトされるのを防ぎます。

:::note
このオプションを有効にすることは推奨されますが、起動時間が最大で数秒程度長くなります。
また、この設定は「CAP&#95;IPC&#95;LOCK」ケーパビリティがない場合は動作しない点に注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```


## mlock_executable_min_total_memory_amount_bytes \\{#mlock_executable_min_total_memory_amount_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="5000000000" />`<mlockall>` を実行するための最小メモリ量のしきい値

## mmap_cache_size \\{#mmap_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

この設定により、頻繁な open/close 呼び出し（連続するページフォルトの発生により非常にコストが高い）を回避し、複数のスレッドおよびクエリ間でメモリマッピングを再利用できます。設定値はマッピングされたリージョン数（通常はマッピングされたファイル数と等しい）です。

マッピングされたファイル内のデータ量は、以下のシステムテーブルにおいて、次のメトリクスで監視できます。

- [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log) の `MMappedFiles` / `MMappedFileBytes` / `MMapCacheCells`
- [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log) の `CreatedReadBufferMMap` / `CreatedReadBufferMMapFailed` / `MMappedFileCacheHits` / `MMappedFileCacheMisses`

:::note
マッピングされたファイル内のデータ量はメモリを直接消費せず、クエリやサーバーのメモリ使用量としては計上されません。これは、このメモリが OS のページキャッシュと同様に破棄可能であるためです。キャッシュは、MergeTree ファミリーのテーブルで古いパーツが削除される際に（ファイルがクローズされて）自動的に破棄されます。また、`SYSTEM DROP MMAP CACHE` クエリを使用して手動で破棄することもできます。

この設定は実行時に変更でき、その変更は即座に反映されます。
:::

## mutation_workload \\{#mutation_workload\\}

<SettingsInfoBlock type="String" default_value="default" />

ミューテーションと他のワークロード間でのリソースの利用および共有方法を調整するために使用します。指定した値は、すべてのバックグラウンドミューテーションに対する `workload` 設定値として使用されます。MergeTree の設定で上書きできます。

**関連項目**

- [ワークロードのスケジューリング](/operations/workload-scheduling.md)

## mysql_port \{#mysql_port\}

MySQL プロトコル経由でクライアントと通信するためのポート。

:::note

* 正の整数を指定すると、そのポート番号で待ち受けます
* 空の値を指定すると、MySQL プロトコル経由でのクライアントとの通信は無効になります。
  :::

**例**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport \\{#mysql_require_secure_transport\\}

<SettingsInfoBlock type="Bool" default_value="0" />true に設定すると、[mysql_port](/operations/server-configuration-parameters/settings#mysql_port) 経由のクライアントとのセキュアな通信が必須となります。`<--ssl-mode=none>` オプションでの接続は拒否されます。[OpenSSL](/operations/server-configuration-parameters/settings#openssl) の設定と併用してください。

## mysql_require_secure_transport \\{#mysql_require_secure_transport\\}

true に設定した場合、[mysql_port](#mysql_port) を介したクライアントとのセキュアな通信が必須になります。`--ssl-mode=none` オプションによる接続は拒否されます。[OpenSSL](#openssl) の設定とあわせて使用してください。

## oom_score \\{#oom_score\\}

<SettingsInfoBlock type="Int32" default_value="0" />Linux システムでは、これにより OOM killer の動作を制御できます。

## openSSL \\{#openssl\\}

SSL クライアント／サーバー設定。

SSL のサポートは `libpoco` ライブラリによって提供されます。利用可能な設定オプションについては [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) に記載されています。デフォルト値は [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) にあります。

サーバー／クライアント設定のキー:

| 設定項目                          | 説明                                                                                                                                                                                                                                                                                                                    | デフォルト値                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 証明書の秘密鍵が格納されたファイルへのパス。そのファイルには秘密鍵と証明書を同時に含めることもできます。                                                                                                                                                                                                                                                              |                                                                                            |
| `certificateFile`             | PEM 形式のクライアント／サーバー用証明書ファイルへのパス。`privateKeyFile` に証明書が含まれている場合は指定を省略できます。                                                                                                                                                                                                                                              |                                                                                            |
| `caConfig`                    | 信頼された CA 証明書を含むファイルまたはディレクトリへのパス。ファイルを示す場合は PEM 形式である必要があり、複数の CA 証明書を含めることができます。ディレクトリを示す場合は、CA 証明書ごとに 1 つの .pem ファイルを含める必要があります。ファイル名は CA のサブジェクト名ハッシュ値で照合されます。詳細は [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) の man ページを参照してください。 |                                                                                            |
| `verificationMode`            | ノード証明書の検証方法を指定します。詳細は [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明を参照してください。指定可能な値: `none`, `relaxed`, `strict`, `once`。                                                                                                                         | `relaxed`                                                                                  |
| `verificationDepth`           | 検証チェーンの最大長。証明書チェーンの長さが設定された値を超えると、検証は失敗します。                                                                                                                                                                                                                                                                           | `9`                                                                                        |
| `loadDefaultCAFile`           | OpenSSL 用の組み込み CA 証明書を使用するかどうかを指定します。ClickHouse は、組み込み CA 証明書がファイル `/etc/ssl/cert.pem`（対応するディレクトリは `/etc/ssl/certs`）にあるか、または環境変数 `SSL_CERT_FILE`（および対応するディレクトリを示す `SSL_CERT_DIR`）で指定されたファイルまたはディレクトリ内にあると想定します。                                                                                                       | `true`                                                                                     |
| `cipherList`                  | OpenSSL でサポートされている暗号スイート。                                                                                                                                                                                                                                                                                             | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | セッションキャッシュを有効または無効にします。`sessionIdContext` と組み合わせて使用する必要があります。指定可能な値: `true`, `false`。                                                                                                                                                                                                                                 | `false`                                                                                    |
| `sessionIdContext`            | サーバーが生成する各識別子に付加される、一意なランダム文字列です。文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはなりません。サーバーがセッションをキャッシュする場合とクライアントがキャッシュを要求した場合の両方で問題の発生を防ぐのに役立つため、このパラメータの設定は常に推奨されます。                                                                                                                                                  | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | サーバーがキャッシュするセッションの最大数です。値を `0` にすると、セッション数は無制限になります。                                                                                                                                                                                                                                                                  | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | サーバー側でのセッションキャッシュの保持時間（時間単位）。                                                                                                                                                                                                                                                                                         | `2`                                                                                        |
| `extendedVerification`        | 有効にすると、証明書の CN または SAN が接続先ホスト名と一致するか検証します。                                                                                                                                                                                                                                                                           | `false`                                                                                    |
| `requireTLSv1`                | TLSv1 の接続を必須にします。許容される値: `true`、`false`。                                                                                                                                                                                                                                                                              | `false`                                                                                    |
| `requireTLSv1_1`              | TLSv1.1 での接続を必須とします。有効な値は `true` または `false` です。                                                                                                                                                                                                                                                                      | `false`                                                                                    |
| `requireTLSv1_2`              | TLSv1.2 での接続を必須とします。指定可能な値: `true`, `false`。                                                                                                                                                                                                                                                                          | `false`                                                                                    |
| `fips`                        | OpenSSL FIPS モードを有効にします。使用中のライブラリが利用している OpenSSL バージョンが FIPS に対応している場合にのみサポートされます。                                                                                                                                                                                                                                    | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandler のサブクラス）。例えば、`<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>` のように指定します。                                                                                       | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するクラス（CertificateHandler のサブクラス）。例えば `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` のように指定します。                                                                                                                                                             | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 使用を禁止するプロトコル。                                                                                                                                                                                                                                                                                                         |                                                                                            |
| `preferServerCiphers`         | クライアント側ではなくサーバー側の暗号スイートを優先するかどうか。                                                                                                                                                                                                                                                                                     | `false`                                                                                    |

**設定例：**

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


## openSSL.client.caConfig \\{#openssl.client.caconfig\\}

信頼済み CA 証明書を含むファイルまたはディレクトリへのパス。ファイルを指す場合、そのファイルは PEM 形式でなければならず、複数の CA 証明書を含めることができます。ディレクトリを指す場合、そのディレクトリには CA 証明書ごとに 1 つの .pem ファイルが含まれている必要があります。ファイル名は CA の subject name のハッシュ値に基づいて決定されます。詳細は [SSL_CTX_load_verify_locations](https://docs.openssl.org/3.0/man3/SSL_CTX_load_verify_locations/) の man ページを参照してください。

## openSSL.client.cacheSessions \\{#openssl.client.cachesessions\\}

<SettingsInfoBlock type="Bool" default_value="0" />セッションキャッシュを有効化または無効化します。`<sessionIdContext>` と組み合わせて使用する必要があります。指定可能な値: `<true>`、`<false>`。

## openSSL.client.certificateFile \\{#openssl.client.certificatefile\\}

PEM 形式のクライアント／サーバー証明書ファイルへのパスです。`<privateKeyFile>` に証明書が含まれている場合は省略できます。

## openSSL.client.cipherList \\{#openssl.client.cipherlist\\}

<SettingsInfoBlock type="String" default_value="ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH" />サポートされている OpenSSL の暗号スイート。

## openSSL.client.disableProtocols \\{#openssl.client.disableprotocols\\}

利用を禁止するプロトコル。

## openSSL.client.extendedVerification \\{#openssl.client.extendedverification\\}

<SettingsInfoBlock type="Bool" default_value="0" />有効にすると、証明書の CN または SAN が接続先ホスト名と一致することを検証します。

## openSSL.client.fips \\{#openssl.client.fips\\}

<SettingsInfoBlock type="Bool" default_value="0" />OpenSSL の FIPS モードを有効化します。ライブラリの OpenSSL バージョンが FIPS をサポートしている場合に利用できます。

## openSSL.client.invalidCertificateHandler.name \\{#openssl.client.invalidcertificatehandler.name\\}

<SettingsInfoBlock type="String" default_value="RejectCertificateHandler" />無効な証明書を検証するためのクラスです（CertificateHandler のサブクラス）。例えば、`<<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>>` のように指定します。

## openSSL.client.loadDefaultCAFile \\{#openssl.client.loaddefaultcafile\\}

<SettingsInfoBlock type="Bool" default_value="1" />OpenSSL 用の組み込み CA 証明書を使用するかどうかを決定します。ClickHouse は、組み込み CA 証明書がファイル `</etc/ssl/cert.pem>`（またはディレクトリ `</etc/ssl/certs>`）、もしくは環境変数 `<SSL_CERT_FILE>`（または `<SSL_CERT_DIR>`）で指定されたファイル（またはディレクトリ）内に存在すると想定します。

## openSSL.client.preferServerCiphers \\{#openssl.client.preferserverciphers\\}

<SettingsInfoBlock type="Bool" default_value="0" />サーバー暗号スイートのクライアント優先設定。

## openSSL.client.privateKeyFile \\{#openssl.client.privatekeyfile\\}

PEM 形式証明書の秘密鍵を格納したファイルへのパスです。ファイルには、鍵と証明書を同時に含めることができます。

## openSSL.client.privateKeyPassphraseHandler.name \\{#openssl.client.privatekeypassphrasehandler.name\\}

<SettingsInfoBlock type="String" default_value="KeyConsoleHandler" />プライベートキーにアクセスする際のパスフレーズを要求するクラス（PrivateKeyPassphraseHandlerのサブクラス）。例: `<<privateKeyPassphraseHandler>>`, `<<name>KeyFileHandler</name>>`, `<<options><password>test</password></options>>`, `<</privateKeyPassphraseHandler>>`

## openSSL.client.requireTLSv1 \\{#openssl.client.requiretlsv1\\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1 接続を必須にします。指定可能な値: `<true>`, `<false>`。

## openSSL.client.requireTLSv1_1 \\{#openssl.client.requiretlsv1_1\\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1.1 接続を必須にします。有効な値: `<true>`, `<false>`。

## openSSL.client.requireTLSv1_2 \\{#openssl.client.requiretlsv1_2\\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1.2 接続を必須とします。有効な値: `<true>`, `<false>`。

## openSSL.client.verificationDepth \\{#openssl.client.verificationdepth\\}

<SettingsInfoBlock type="UInt64" default_value="9" />検証チェーンの最大長です。証明書チェーンの長さがこの値を超える場合、検証は失敗します。

## openSSL.client.verificationMode \\{#openssl.client.verificationmode\\}

<SettingsInfoBlock type="String" default_value="relaxed" />ノードの証明書の検証方法です。詳細は [Context](https://github.com/ClickHouse/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明を参照してください。指定可能な値: `<none>`、`<relaxed>`、`<strict>`、`<once>`。

## openSSL.server.caConfig \\{#openssl.server.caconfig\\}

信頼済み CA 証明書を含むファイルまたはディレクトリへのパスです。ファイルを指す場合、そのファイルは PEM 形式である必要があり、複数の CA 証明書を含めることができます。ディレクトリを指す場合、そのディレクトリには CA 証明書ごとに 1 つの .pem ファイルを含める必要があります。ファイル名は CA のサブジェクト名ハッシュ値によって検索されます。詳細は [SSL_CTX_load_verify_locations](https://docs.openssl.org/3.0/man3/SSL_CTX_load_verify_locations/) の man ページを参照してください。

## openSSL.server.cacheSessions \\{#openssl.server.cachesessions\\}

<SettingsInfoBlock type="Bool" default_value="0" />セッションのキャッシュを有効または無効にします。`<sessionIdContext>` と組み合わせて使用する必要があります。設定可能な値: `<true>`、`<false>`。

## openSSL.server.certificateFile \\{#openssl.server.certificatefile\\}

PEM 形式のクライアント/サーバー証明書ファイルへのパス。`<privateKeyFile>` に証明書が含まれている場合は省略できます。

## openSSL.server.cipherList \\{#openssl.server.cipherlist\\}

<SettingsInfoBlock type="String" default_value="ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH" />サポートされている OpenSSL の暗号スイート。

## openSSL.server.disableProtocols \\{#openssl.server.disableprotocols\\}

使用を許可しないプロトコルを指定します。

## openSSL.server.extendedVerification \\{#openssl.server.extendedverification\\}

<SettingsInfoBlock type="Bool" default_value="0" />有効にすると、証明書の CN または SAN がピアのホスト名と一致するかを検証します。

## openSSL.server.fips \\{#openssl.server.fips\\}

<SettingsInfoBlock type="Bool" default_value="0" />OpenSSL の FIPS モードを有効にします。ライブラリの OpenSSL バージョンが FIPS をサポートしている場合にのみ有効です。

## openSSL.server.invalidCertificateHandler.name \\{#openssl.server.invalidcertificatehandler.name\\}

<SettingsInfoBlock type="String" default_value="RejectCertificateHandler" />無効な証明書を検証するためのクラス（CertificateHandler のサブクラス）です。例: `<<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>>`。

## openSSL.server.loadDefaultCAFile \\{#openssl.server.loaddefaultcafile\\}

<SettingsInfoBlock type="Bool" default_value="1" />OpenSSL の組み込み CA 証明書を使用するかどうかを指定します。ClickHouse は、組み込み CA 証明書がファイル `</etc/ssl/cert.pem>`（またはディレクトリ `</etc/ssl/certs>`）、もしくは環境変数 `<SSL_CERT_FILE>`（または `<SSL_CERT_DIR>`）で指定されたファイルまたはディレクトリに存在すると想定します。

## openSSL.server.preferServerCiphers \\{#openssl.server.preferserverciphers\\}

<SettingsInfoBlock type="Bool" default_value="0" />クライアントが優先するサーバー暗号スイート。

## openSSL.server.privateKeyFile \\{#openssl.server.privatekeyfile\\}

PEM 証明書の秘密鍵が格納されているファイルへのパスです。ファイルには鍵と証明書の両方を含めることができます。

## openSSL.server.privateKeyPassphraseHandler.name \\{#openssl.server.privatekeypassphrasehandler.name\\}

<SettingsInfoBlock type="String" default_value="KeyConsoleHandler" />秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandler のサブクラス）。例: `<<privateKeyPassphraseHandler>>`, `<<name>KeyFileHandler</name>>`, `<<options><password>test</password></options>>`, `<</privateKeyPassphraseHandler>>`

## openSSL.server.requireTLSv1 \\{#openssl.server.requiretlsv1\\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1 接続を必須にします。指定可能な値: `<true>`, `<false>`。

## openSSL.server.requireTLSv1_1 \\{#openssl.server.requiretlsv1_1\\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1.1 接続を必須にします。有効な値: `<true>`, `<false>`。

## openSSL.server.requireTLSv1_2 \\{#openssl.server.requiretlsv1_2\\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1.2 接続を必須にします。有効な値: `<true>`, `<false>`。

## openSSL.server.sessionCacheSize \\{#openssl.server.sessioncachesize\\}

<SettingsInfoBlock type="UInt64" default_value="20480" />サーバーがキャッシュできるセッションの最大数です。0 を指定すると、セッション数は無制限になります。

## openSSL.server.sessionIdContext \\{#openssl.server.sessionidcontext\\}

<SettingsInfoBlock type="String" default_value="application.name" />サーバーが生成する各識別子に付加される、一意なランダム文字列です。文字列の長さは `<SSL_MAX_SSL_SESSION_ID_LENGTH>` を超えてはなりません。サーバー側でセッションをキャッシュする場合にも、クライアントがキャッシュを要求する場合にも問題を回避できるため、このパラメータは常に指定することを推奨します。

## openSSL.server.sessionTimeout \\{#openssl.server.sessiontimeout\\}

<SettingsInfoBlock type="UInt64" default_value="2" />サーバーでセッションをキャッシュしておく時間（単位：時間）。

## openSSL.server.verificationDepth \\{#openssl.server.verificationdepth\\}

<SettingsInfoBlock type="UInt64" default_value="9" />証明書検証チェーンの最大長です。証明書チェーンの長さが設定値を超えると、検証は失敗します。

## openSSL.server.verificationMode \\{#openssl.server.verificationmode\\}

<SettingsInfoBlock type="String" default_value="relaxed" />ノードの証明書を検証する方法です。詳細は [Context](https://github.com/ClickHouse/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明を参照してください。設定可能な値は `<none>`、`<relaxed>`、`<strict>`、`<once>` です。

## opentelemetry_span_log \{#opentelemetry_span_log\}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) システムテーブル向けの設定です。

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


## os_collect_psi_metrics \\{#os_collect_psi_metrics\\}

<SettingsInfoBlock type="Bool" default_value="1" />/proc/pressure/ ファイルからの PSI メトリクスの取得を有効にします。

## os_cpu_busy_time_threshold \\{#os_cpu_busy_time_threshold\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />OS の CPU ビジー時間（OSCPUVirtualTimeMicroseconds メトリクス）において、CPU が有用な処理を行っていると見なすマイクロ秒単位のしきい値です。ビジー時間がこの値未満の場合は、CPU の過負荷状態とは見なされません。

## os_threads_nice_value_distributed_cache_tcp_handler \\{#os_threads_nice_value_distributed_cache_tcp_handler\\}

<SettingsInfoBlock type="Int32" default_value="0" />

distributed cache TCP ハンドラーのスレッドに対する Linux の nice 値。値が小さいほど CPU の優先度は高くなります。

CAP_SYS_NICE ケーパビリティが必要で、ない場合は何も行われません。

指定可能な値: -20 から 19。

## os_threads_nice_value_merge_mutate \\{#os_threads_nice_value_merge_mutate\\}

<SettingsInfoBlock type="Int32" default_value="0" />

マージおよびミューテーションスレッドに対する Linux の nice値です。値が小さいほど CPU の優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要であり、持たない場合は効果はありません（no-op）。

取りうる値: -20 〜 19。

## os_threads_nice_value_zookeeper_client_send_receive \\{#os_threads_nice_value_zookeeper_client_send_receive\\}

<SettingsInfoBlock type="Int32" default_value="0" />

ZooKeeper クライアントにおける送信スレッドおよび受信スレッドの Linux の nice 値。値が小さいほど CPU 優先度は高くなります。

CAP_SYS_NICE ケーパビリティが必要で、付与されていない場合は何も行われません (no-op)。

取りうる値: -20 ～ 19。

## page_cache_free_memory_ratio \\{#page_cache_free_memory_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.15" />ユーザー空間ページキャッシュに割り当てずに確保しておくメモリ上限の割合。Linux の min_free_kbytes 設定に相当します。

## page_cache_history_window_ms \\{#page_cache_history_window_ms\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />解放されたメモリがユーザー空間のページキャッシュで再利用可能になるまでの待機時間。

## page_cache_max_size \\{#page_cache_max_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />ユーザースペースページキャッシュの最大サイズ。0 に設定するとキャッシュを無効化します。page_cache_min_size より大きい場合、この範囲内でキャッシュサイズが継続的に調整され、利用可能なメモリを最大限活用しつつ、合計メモリ使用量が上限（max_server_memory_usage[_to_ram_ratio]）を超えないように維持されます。

## page_cache_min_size \\{#page_cache_min_size\\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />ユーザー空間におけるページキャッシュの最小サイズ。

## page_cache_policy \\{#page_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />ユーザー空間ページキャッシュのポリシー名。

## page_cache_shards \\{#page_cache_shards\\}

<SettingsInfoBlock type="UInt64" default_value="4" />ユーザー空間ページキャッシュをこの数の分片にストライピングし、ミューテックスの競合を減らします。実験的な機能であり、性能向上はあまり期待できません。

## page_cache_size_ratio \\{#page_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />ユーザースペースのページキャッシュにおける保護キューのサイズの、キャッシュ全体サイズに対する比率です。

## part_log \{#part_log\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) に関連するイベントをログに記録します。たとえば、データの追加やマージなどです。ログを使用してマージアルゴリズムをシミュレートし、その特性を比較できます。マージ処理を可視化することもできます。

クエリは、別個のファイルではなく [system.part&#95;log](/operations/system-tables/part_log) テーブルに記録されます。このテーブル名は、`table` パラメータ（後述）で構成できます。

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


## parts_kill_delay_period \\{#parts_kill_delay_period\\}

<SettingsInfoBlock type="UInt64" default_value="30" />

SharedMergeTree のパーツを完全に削除するまでの猶予期間。ClickHouse Cloud でのみ利用可能です。

## parts_kill_delay_period_random_add \\{#parts_kill_delay_period_random_add\\}

<SettingsInfoBlock type="UInt64" default_value="10" />

非常に多くのテーブルが存在する場合に、thundering herd 効果およびそれに続く ZooKeeper への DoS を回避するため、kill_delay_period に 0 ～ x 秒の範囲で一様分布する値を加算します。ClickHouse Cloud でのみ利用可能です。

## parts_killer_pool_size \\{#parts_killer_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="128" />

共有 MergeTree の古いパーツをクリーンアップするためのスレッド数。ClickHouse Cloud でのみ利用可能です

## path \{#path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/" />

データが格納されているディレクトリへのパスです。

:::note
末尾のスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
```


## path \{#path\}

データを格納しているディレクトリへのパス。

:::note
末尾のスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
```


## postgresql_port \{#postgresql_port\}

PostgreSQL プロトコルでクライアントと通信するためのポート。

:::note

* 正の整数を指定すると、そのポート番号で待ち受けます
* 空の値を指定すると、PostgreSQL プロトコルでのクライアントとの通信が無効化されます。
  :::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport \\{#postgresql_require_secure_transport\\}

<SettingsInfoBlock type="Bool" default_value="0" />true に設定すると、[postgresql_port](/operations/server-configuration-parameters/settings#postgresql_port) を介したクライアントとの通信にセキュアな通信が必須になります。`<sslmode=disable>` オプションでの接続は拒否されます。[OpenSSL](/operations/server-configuration-parameters/settings#openssl) の設定と併用してください。

## postgresql_require_secure_transport \\{#postgresql_require_secure_transport\\}

true に設定した場合、[postgresql_port](#postgresql_port) 経由でクライアントとのセキュアな通信が必須になります。`sslmode=disable` オプションでの接続は拒否されます。[OpenSSL](#openssl) の設定と併せて使用してください。

## prefetch_threadpool_pool_size \\{#prefetch_threadpool_pool_size\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />リモートオブジェクトストレージ向けプリフェッチのためのバックグラウンドプールサイズ

## prefetch_threadpool_queue_size \\{#prefetch_threadpool_queue_size\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />prefetch 用プールに投入できるタスクの最大数

## prefixes_deserialization_thread_pool_thread_pool_queue_size \\{#prefixes_deserialization_thread_pool_thread_pool_queue_size\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

prefixes デシリアライズ用スレッドプールでスケジュール可能なジョブの最大数。

:::note
`0` の場合は無制限です。
:::

## prepare_system_log_tables_on_startup \\{#prepare_system_log_tables_on_startup\\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、ClickHouse は起動前に、設定されているすべての `system.*_log` テーブルを作成します。特定の起動スクリプトがこれらのテーブルに依存している場合に有用です。

## primary_index_cache_policy \\{#primary_index_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />プライマリ索引キャッシュポリシーの名前。

## primary_index_cache_prewarm_ratio \\{#primary_index_cache_prewarm_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.95" />事前ウォームアップ時にマークキャッシュに読み込む合計サイズの割合。

## primary_index_cache_size \\{#primary_index_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />MergeTree ファミリのテーブルで使用されるプライマリ索引（primary index）キャッシュの最大サイズ。

## primary_index_cache_size_ratio \\{#primary_index_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />プライマリ索引キャッシュ内の保護キュー（SLRU ポリシー使用時）のサイズを、キャッシュ全体サイズに対する比率で指定します。

## process_query_plan_packet \{#process_query_plan_packet\}

<SettingsInfoBlock type="Bool" default_value="0" />

この設定を有効にすると、QueryPlan パケットを読み取れるようになります。このパケットは、`serialize_query_plan` が有効な場合に分散クエリ向けに送信されます。
クエリプランのバイナリデシリアライズ処理におけるバグが原因で発生しうるセキュリティ問題を避けるため、デフォルトでは無効になっています。

**例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors_profile_log \{#processors_profile_log\}

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


## prometheus \{#prometheus\}

[Prometheus](https://prometheus.io) によるスクレイピング用にメトリクスデータを公開します。

設定:

* `endpoint` – Prometheus サーバーがメトリクスをスクレイピングするための HTTP エンドポイント。&#39;/&#39; で始めてください。
* `port` – `endpoint` 用のポート。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルのメトリクスを公開します。
* `events` – [system.events](/operations/system-tables/events) テーブルのメトリクスを公開します。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルの現在のメトリクス値を公開します。
* `errors` - 直近のサーバー再起動以降に、エラーコードごとに発生したエラー数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。

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

以下を確認してください（`127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えてください）:

```bash
curl 127.0.0.1:9363/metrics
```


## prometheus.keeper_metrics_only \\{#prometheus.keeper_metrics_only\\}

<SettingsInfoBlock type="Bool" default_value="0" />Keeper 関連メトリクスを公開する

## proxy \{#proxy\}

HTTP および HTTPS リクエスト向けのプロキシサーバーを定義します。現在は S3 ストレージ、S3 テーブル関数、URL 関数でサポートされています。

プロキシサーバーを定義する方法は 3 つあります:

* environment variables（環境変数）
* proxy lists（プロキシリスト）
* remote proxy resolvers（リモートプロキシリゾルバ）

特定のホストに対してプロキシサーバーをバイパスすることも、`no_proxy` を使用することで構成できます。

**Environment variables**

`http_proxy` および `https_proxy` の environment variables（環境変数）を使用すると、
特定のプロトコルに対してプロキシサーバーを指定できます。システム上ですでに設定されている場合は、そのまま問題なく動作します。

この方法は、あるプロトコルに対して
プロキシサーバーが 1 つだけであり、そのプロキシサーバーが変更されない場合に最も簡単です。

**Proxy lists**

この方法では、あるプロトコルに対して 1 つ以上の
プロキシサーバーを指定できます。複数のプロキシサーバーが定義されている場合、
ClickHouse は異なるプロキシをラウンドロビン方式で使用し、サーバー間で
負荷を分散します。これは、あるプロトコルに対して複数の
プロキシサーバーが存在し、かつプロキシサーバーのリストが変化しない場合に最も簡単な方法です。

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

以下のタブで親フィールドを選択すると、その子フィールドが表示されます:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | 説明                    |
    | --------- | --------------------- |
    | `<http>`  | 1 つ以上の HTTP プロキシのリスト  |
    | `<https>` | 1 つ以上の HTTPS プロキシのリスト |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Field   | 説明        |
    | ------- | --------- |
    | `<uri>` | プロキシの URI |
  </TabItem>
</Tabs>

**リモートプロキシリゾルバー**

プロキシサーバーが動的に変化する可能性があります。その場合、リゾルバーのエンドポイントを定義できます。ClickHouse はそのエンドポイントに空の GET リクエストを送信し、リモートリゾルバーはプロキシホストを返す必要があります。
ClickHouse は、次のテンプレートを使用してプロキシ URI を組み立てます: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

以下のタブで親フィールドを選択すると、その子フィールドを確認できます:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description       |
    | --------- | ----------------- |
    | `<http>`  | 1つ以上のリゾルバからなるリスト* |
    | `<https>` | 1つ以上のリゾルバからなるリスト* |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Field        | Description           |
    | ------------ | --------------------- |
    | `<resolver>` | リゾルバのエンドポイントおよびその他の詳細 |

    :::note
    複数の `<resolver>` 要素を定義できますが、特定のプロトコルに対して実際に使用されるのは
    最初の `<resolver>` のみです。そのプロトコルに対するそれ以外の `<resolver>` 要素は
    無視されます。そのため、必要に応じたロードバランシングは、リモート側のリゾルバで
    実装する必要があります。
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | Field                | Description                                                                                                    |
    | -------------------- | -------------------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | プロキシリゾルバのURI                                                                                                   |
    | `<proxy_scheme>`     | 最終的なプロキシURIのプロトコル。`http` または `https` のいずれかを指定します。                                                              |
    | `<proxy_port>`       | プロキシリゾルバのポート番号                                                                                                 |
    | `<proxy_cache_time>` | リゾルバから取得した値を ClickHouse がキャッシュする時間（秒）。この値を `0` に設定すると、ClickHouse はすべての HTTP または HTTPS リクエストごとにリゾルバへ問い合わせを行います。 |
  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決定されます:

| Order | Setting      |
| ----- | ------------ |
| 1.    | リモートプロキシリゾルバ |
| 2.    | プロキシリスト      |
| 3.    | 環境変数         |


ClickHouse は、リクエストプロトコルに対して最も優先度の高いリゾルバータイプを確認します。定義されていない場合は、
環境リゾルバーに到達するまで、次に優先度の高いリゾルバータイプを順に確認します。
これにより、複数の種類のリゾルバータイプを組み合わせて使用することも可能になります。

## query_cache \{#query_cache\}

[Query cache](../query-cache.md) の設定。

利用可能な設定は次のとおりです:

| Setting                   | Description                                       | Default Value |
| ------------------------- | ------------------------------------------------- | ------------- |
| `max_size_in_bytes`       | キャッシュサイズの最大値 (バイト単位)。`0` はクエリキャッシュが無効であることを意味します。 | `1073741824`  |
| `max_entries`             | キャッシュに保存される `SELECT` クエリ結果の最大件数。                  | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存できる `SELECT` クエリ結果の最大サイズ (バイト単位)。         | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存できる `SELECT` クエリ結果の最大行数。                  | `30000000`    |

:::note

* 設定の変更は即時に反映されます。
* クエリキャッシュ用のデータは DRAM 上に割り当てられます。メモリに余裕がない場合は、`max_size_in_bytes` を小さな値に設定するか、クエリキャッシュを無効化することを検討してください。
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


## query_cache.max_entries \\{#query_cache.max_entries\\}

<SettingsInfoBlock type="UInt64" default_value="1024" />キャッシュに保存される SELECT クエリ結果の最大数。

## query_cache.max_entry_size_in_bytes \\{#query_cache.max_entry_size_in_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />SELECT クエリ結果をキャッシュに保存する際の最大サイズ（バイト単位）。

## query_cache.max_entry_size_in_rows \\{#query_cache.max_entry_size_in_rows\\}

<SettingsInfoBlock type="UInt64" default_value="30000000" />SELECTクエリ結果をキャッシュに保存する際の最大行数。

## query_cache.max_size_in_bytes \\{#query_cache.max_size_in_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />キャッシュの最大サイズ（バイト単位）。0 の場合、クエリキャッシュ機能は無効になります。

## query_condition_cache_policy \\{#query_condition_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />クエリ条件キャッシュのポリシー名。

## query_condition_cache_size \\{#query_condition_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

クエリ条件キャッシュの最大サイズ。
:::note
この設定は実行時に変更でき、変更は即座に有効になります。
:::

## query_condition_cache_size_ratio \\{#query_condition_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />クエリ条件キャッシュにおける（SLRU ポリシーの場合の）保護キューのサイズが、キャッシュ全体のサイズに対してどの程度の比率を占めるかを指定します。

## query_log \{#query_log\}

[log&#95;queries=1](../../operations/settings/settings.md) 設定で受信したクエリをログに記録するための設定です。

クエリは個別のファイルではなく、[system.query&#95;log](/operations/system-tables/query_log) テーブルに記録されます。`table` パラメータでテーブル名を変更できます（下記参照）。

<SystemLogParameters />

テーブルが存在しない場合は ClickHouse が作成します。ClickHouse サーバーのアップデート時にクエリログの構造が変更されていた場合は、古い構造のテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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


## query_masking_rules \{#query_masking_rules\}

正規表現ベースのルールで、クエリおよびすべてのログメッセージに対して、サーバーログに保存される前に適用されます。
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブル、およびクライアントに送信されるログに適用されます。これにより、名前、メールアドレス、個人識別子、クレジットカード番号など、SQL クエリ内の機密データがログに出力されるのを防げます。

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

| 設定        | 説明                                     |
| --------- | -------------------------------------- |
| `name`    | ルール名（任意）                               |
| `regexp`  | RE2 互換の正規表現（必須）                        |
| `replace` | 機密データを書き換えるための文字列（任意。デフォルトはアスタリスク 6 個） |

マスキングルールはクエリ全体に適用されます（不正形式 / 解析不能なクエリから機密データが漏洩するのを防ぐため）。

[`system.events`](/operations/system-tables/events) テーブルには `QueryMaskingRulesMatch` カウンタがあり、クエリマスキングルールに一致したクエリの累計件数を保持します。

分散クエリの場合は、各サーバーごとに個別に設定する必要があります。そうしないと、他のノードに渡されるサブクエリがマスキングされないまま保存されてしまいます。


## query_metric_log \{#query_metric_log\}

デフォルトで無効です。

**有効化**

メトリクス履歴収集機能 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/query_metric_log.xml` を作成します。

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

`query_metric_log` 設定を無効にするには、以下の内容でファイル `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` を作成します。

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query_thread_log \{#query_thread_log\}

[log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads) 設定で受信したクエリのスレッドをログに記録するための設定です。

クエリは個別のファイルではなく、[system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) テーブルに記録されます。テーブル名は `table` パラメータで変更できます（後述）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse はテーブルを作成します。ClickHouse サーバーの更新によってクエリスレッドログの構造が変更された場合、古い構造のテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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


## query_views_log \{#query_views_log\}

[log&#95;query&#95;views=1](/operations/settings/settings#log_query_views) 設定を有効にした場合に、受信したクエリに応じて VIEW（live、materialized など）をログに記録するための設定です。

クエリは別個のファイルではなく、[system.query&#95;views&#95;log](/operations/system-tables/query_views_log) テーブルに記録されます。`table` パラメータ（後述）でテーブル名を変更できます。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse はテーブルを自動的に作成します。ClickHouse サーバーの更新によって query views log の構造が変更された場合、古い構造のテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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


## remap_executable \{#remap_executable\}

<SettingsInfoBlock type="Bool" default_value="0" />

マシンコード（&quot;text&quot;）領域をヒュージページ上に再マッピングするための設定です。

:::note
この機能は高度に実験的です。
:::

**例**

```xml
<remap_executable>false</remap_executable>
```


## remap_executable \{#remap_executable\}

Huge page を使用してマシンコード（&quot;text&quot;）用のメモリを再割り当てするための設定です。

:::note
この機能は非常に実験的です。
:::

例:

```xml
<remap_executable>false</remap_executable>
```


## remote_servers \{#remote_servers\}

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンおよび `cluster` テーブル関数で使用されるクラスタ設定です。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性に指定できる値については、「[Configuration files](/operations/configuration-files)」セクションを参照してください。

**関連項目**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Cluster Discovery](../../operations/cluster-discovery.md)
* [Replicated database engine](../../engines/database-engines/replicated.md)


## remote_url_allow_hosts \{#remote_url_allow_hosts\}

URL 関連のストレージエンジンおよびテーブル関数で使用を許可するホストのリストです。

`\<host\>` という XML タグでホストを追加する場合:

* 名前は DNS 解決の前にチェックされるため、URL 中に記載されているものと完全に同一で指定する必要があります。例: `<host>clickhouse.com</host>`
* URL でポートが明示的に指定されている場合、`host:port` 全体がまとめてチェックされます。例: `<host>clickhouse.com:80</host>`
* ホストがポートなしで指定されている場合、そのホストの任意のポートが許可されます。例: `<host>clickhouse.com</host>` が指定されている場合は、`clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) などが許可されます。
* ホストが IP アドレスとして指定されている場合は、URL に記載されたとおりにチェックされます。例: `[2a02:6b8:a::a]`。
* リダイレクトが存在し、かつリダイレクトのサポートが有効な場合、すべてのリダイレクト（location フィールド）がチェックされます。

例:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica_group_name \{#replica_group_name\}

Replicated データベースのレプリカグループ名。

Replicated データベースによって作成されるクラスタは、同一グループ内のレプリカで構成されます。
DDL クエリは同じグループ内のレプリカのみを対象に待機します。

既定では空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```


## replicated_fetches_http_connection_timeout \\{#replicated_fetches_http_connection_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="0" />パーツ取得リクエスト用の HTTP 接続のタイムアウト。明示的に指定されていない場合は、デフォルトプロファイル `http_connection_timeout` から継承されます。

## replicated_fetches_http_receive_timeout \\{#replicated_fetches_http_receive_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="0" />フェッチパーツのリクエストに対する HTTP 受信タイムアウト。明示的に設定されていない場合は、デフォルトプロファイルの `http_receive_timeout` の値を継承します。

## replicated_fetches_http_send_timeout \\{#replicated_fetches_http_send_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="0" />パーツのフェッチリクエストに対する HTTP 送信タイムアウト。明示的に設定されていない場合は、デフォルトプロファイルの `http_send_timeout` を継承します。

## replicated_merge_tree \{#replicated_merge_tree\}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルに対する微調整を行います。この設定が優先されます。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## restore_threads \\{#restore_threads\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />RESTORE リクエストの実行に使用するスレッドの最大数。

## s3_credentials_provider_max_cache_size \\{#s3_credentials_provider_max_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="100" />キャッシュに保存できる S3 認証情報プロバイダーの最大数

## s3_max_redirects \\{#s3_max_redirects\\}

<SettingsInfoBlock type="UInt64" default_value="10" />許可される S3 リダイレクトのホップ数の上限。

## s3_retry_attempts \\{#s3_retry_attempts\\}

<SettingsInfoBlock type="UInt64" default_value="500" />Aws::Client::RetryStrategy 用の設定です。Aws::Client が内部でリトライを行い、0 の場合はリトライを行わないことを意味します

## s3queue_disable_streaming \\{#s3queue_disable_streaming\\}

<SettingsInfoBlock type="Bool" default_value="0" />テーブルが作成されていてマテリアライズドビューがアタッチされている場合でも、S3Queue のストリーミングを無効にします

## s3queue_log \{#s3queue_log\}

`s3queue_log` システムテーブルに関する設定です。

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


## send_crash_reports \{#send_crash_reports\}

ClickHouse コア開発チームにクラッシュレポートを送信するための設定です。

特に本番導入前の環境で有効化していただけると非常に有用です。

Keys:

| Key                   | Description                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| `enabled`             | 機能を有効化するためのブール値フラグ。デフォルトは `true`。クラッシュレポートの送信を避けるには `false` を設定します。                                |
| `send_logical_errors` | `LOGICAL_ERROR` は `assert` のようなもので、ClickHouse におけるバグです。このブール値フラグで、これらの例外の送信を有効にします（デフォルト: `true`）。 |
| `endpoint`            | クラッシュレポート送信先のエンドポイント URL を変更できます。                                                                  |

**推奨される利用方法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path \\{#series_keeper_path\\}

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />

`generateSerialID` 関数によって生成される自動インクリメント番号を含む Keeper 内のパスです。各 series はこのパス配下のノードになります。

## show_addresses_in_stack_traces \\{#show_addresses_in_stack_traces\\}

<SettingsInfoBlock type="Bool" default_value="1" />true に設定すると、スタックトレースにアドレスが表示されます

## shutdown_wait_backups_and_restores \\{#shutdown_wait_backups_and_restores\\}

<SettingsInfoBlock type="Bool" default_value="1" />true の場合、ClickHouse はシャットダウン前に実行中のバックアップおよびリストア処理が完了するまで待機します。

## shutdown_wait_unfinished \\{#shutdown_wait_unfinished\\}

<SettingsInfoBlock type="UInt64" default_value="5" />未完了クエリを待機するための猶予時間（秒）

## shutdown_wait_unfinished_queries \\{#shutdown_wait_unfinished_queries\\}

<SettingsInfoBlock type="Bool" default_value="0" />true に設定すると、ClickHouse はシャットダウンする前に実行中のクエリがすべて完了するまで待機します。

## skip_binary_checksum_checks \\{#skip_binary_checksum_checks\\}

<SettingsInfoBlock type="Bool" default_value="0" />ClickHouse バイナリのチェックサム整合性検証をスキップします

## skip_check_for_incorrect_settings \{#skip_check_for_incorrect_settings\}

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、サーバー設定が正しいかどうかのチェックは行われません。

**例**

```xml
<skip_check_for_incorrect_settings>1</skip_check_for_incorrect_settings>
```


## ssh_server \{#ssh_server\}

ホスト鍵の公開部分は、最初の接続時に SSH クライアント側の known&#95;hosts ファイルに書き込まれます。

ホスト鍵設定はデフォルトでは無効になっています。
有効化するには、ホスト鍵設定のコメントを解除し、それぞれに対応する ssh 鍵へのパスを指定してください。

例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## startup_mv_delay_ms \\{#startup_mv_delay_ms\\}

<SettingsInfoBlock type="UInt64" default_value="0" />マテリアライズドビュー作成の遅延をシミュレートするためのデバッグ用のパラメータ

## startup_scripts.throw_on_error \\{#startup_scripts.throw_on_error\\}

<SettingsInfoBlock type="Bool" default_value="0" />true に設定すると、スクリプトの実行中にエラーが発生した場合、サーバーは起動しません。

## storage_configuration \{#storage_configuration\}

ストレージの複数ディスク構成を設定できます。

ストレージ構成は次の構造に従います。

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


### ディスクの設定 \{#configuration-of-disks\}

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

上記のサブタグでは、`disks` に対して次の設定を定義します：

| Setting                 | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `<disk_name_N>`         | 一意である必要があるディスク名。                                             |
| `path`                  | サーバーデータ（`data` および `shadow` カタログ）を保存するパス。末尾は `/` である必要があります。 |
| `keep_free_space_bytes` | ディスク上で予約しておく空き容量のサイズ。                                        |

:::note
ディスクの定義順序は問いません。
:::


### ポリシーの設定 \\{#configuration-of-policies\\}

上記のサブタグは、`policies` に対して次の設定を定義します:

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシー名。ポリシー名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `volume_name_N`              | ボリューム名。ボリューム名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `disk`                       | ボリューム内にあるディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `max_data_part_size_bytes`   | このボリューム内の任意のディスク上に存在できるデータ chunk の最大サイズ。マージの結果、chunk のサイズが `max_data_part_size_bytes` より大きくなると予測される場合、その chunk は次のボリュームに書き込まれます。基本的に、この機能により、新しい / 小さな chunk をホット (SSD) ボリュームに保存し、それらが大きなサイズに達したときにコールド (HDD) ボリュームに移動できます。ポリシーにボリュームが 1 つしかない場合は、このオプションを使用しないでください。                                                   |
| `move_factor`                | ボリューム上で利用可能な空き容量の割合。この値より空き容量が少なくなると、(存在する場合は) データの転送が次のボリュームに対して開始されます。転送では、chunk はサイズの大きいものから小さいもの (降順) にソートされ、合計サイズが `move_factor` の条件を満たす chunk が選択されます。すべての chunk の合計サイズでも条件を満たせない場合は、すべての chunk が移動されます。                                                                                                      |
| `perform_ttl_move_on_insert` | 挿入時に、有効期限 (TTL) が切れたデータの移動を無効にします。デフォルト (有効な場合) では、有効期限に基づく移動ルールに従って、すでに有効期限切れとなっているデータを挿入すると、即座にその移動ルールで指定されたボリューム / ディスクに移動されます。ターゲットのボリューム / ディスクが遅い場合 (例: S3) には、これにより挿入が大幅に遅くなる可能性があります。無効にした場合、有効期限切れのデータ部分はまずデフォルトのボリュームに書き込まれ、その直後に有効期限 (TTL) 用のルールで指定されたボリュームに移動されます。 |
| `load_balancing`             | ディスクのバランシングポリシー。`round_robin` または `least_used` を指定します。                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `least_used_ttl_ms`          | すべてのディスク上の利用可能容量を更新するためのタイムアウト (ミリ秒)。(`0` - 常に更新、`-1` - 決して更新しない、デフォルト値は `60000`)。ディスクが ClickHouse のみで使用され、ファイルシステムのオンザフライでのリサイズが行われない場合は、`-1` の値を使用できます。それ以外のケースでは、最終的に不正確な容量割り当てにつながるため、これは推奨されません。                                                                                                                   |
| `prefer_not_to_merge`        | このボリューム上でのデータパーツのマージを無効にします。注意: これは潜在的に有害であり、パフォーマンス低下を引き起こす可能性があります。この設定が有効な場合 (この設定は使用しないでください)、このボリューム上でのデータマージは禁止されます (これは望ましくありません)。これにより、ClickHouse が低速ディスクとどのようにやり取りするかを制御できます。原則として使用しないことを推奨します。                                                                                                      |
| `volume_priority`            | ボリュームがどの順序で埋められていくかを表す優先度を定義します。値が小さいほど優先度は高くなります。パラメータ値は自然数でなければならず、1 から N (N は指定されたパラメータの最大値) までを欠番なくカバーしている必要があります。                                                                                                                                                                                                                                            |

`volume_priority` について:

- すべてのボリュームにこのパラメータが設定されている場合、指定された順序で優先度が決まります。
- _一部の_ ボリュームにのみ設定されている場合、設定されていないボリュームは最も低い優先度となります。設定されているボリュームはタグの値に基づいて優先度が決まり、それ以外のボリュームの優先度は、設定ファイル内での記述順序の相対関係によって決まります。
- _いずれの_ ボリュームにもこのパラメータが設定されていない場合、その順序は設定ファイル内での記述順序によって決まります。
- ボリュームの優先度は同一である必要はありません。

## storage_connections_hard_limit \\{#storage_connections_hard_limit\\}

<SettingsInfoBlock type="UInt64" default_value="200000" />この制限に達した状態で作成を試みると、例外がスローされます。0 を設定するとハード制限を無効化します。この制限はストレージ接続に適用されます。

## storage_connections_soft_limit \\{#storage_connections_soft_limit\\}

<SettingsInfoBlock type="UInt64" default_value="100" />この上限値を超えた接続の有効期間 (TTL) は大幅に短くなります。この上限はストレージ接続に適用されます。

## storage_connections_store_limit \\{#storage_connections_store_limit\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />この制限を超える接続は、使用後にリセットされます。接続キャッシュを無効にするには 0 に設定します。この制限はストレージ接続に適用されます。

## storage_connections_warn_limit \\{#storage_connections_warn_limit\\}

<SettingsInfoBlock type="UInt64" default_value="500" />使用中の接続数がこの制限を超えた場合、警告メッセージがログに書き込まれます。この制限はストレージへの接続に適用されます。

## storage_metadata_write_full_object_key \\{#storage_metadata_write_full_object_key\\}

<SettingsInfoBlock type="Bool" default_value="1" />VERSION_FULL_OBJECT_KEY 形式でディスクのメタデータファイルを書き込みます。これはデフォルトで有効になっています。この設定は非推奨です。

## storage_shared_set_join_use_inner_uuid \\{#storage_shared_set_join_use_inner_uuid\\}

<SettingsInfoBlock type="Bool" default_value="1" />有効にすると、SharedSet および SharedJoin の作成時に内部 UUID が生成されます。ClickHouse Cloud 専用

## table_engines_require_grant \\{#table_engines_require_grant\\}

true に設定すると、ユーザーが特定のエンジンを使ってテーブルを作成するためには、権限付与が必要になります（例: `GRANT TABLE ENGINE ON TinyLog to user`）。

:::note
デフォルトでは後方互換性のため、特定のテーブルエンジンを指定してテーブルを作成する際には権限付与は無視されますが、この設定を true にすることで挙動を変更できます。
:::

## tables_loader_background_pool_size \\{#tables_loader_background_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

バックグラウンドプールで非同期ロードジョブを実行するスレッド数を設定します。バックグラウンドプールは、そのテーブルを待っているクエリが存在しない場合に、サーバー起動後のテーブルの非同期ロードに使用されます。テーブル数が多い場合は、バックグラウンドプール内のスレッド数を少なく保つと有益な場合があります。これにより、同時クエリ実行のための CPU リソースが確保されます。

:::note
値が `0` の場合、利用可能なすべての CPU が使用されます。
:::

## tables_loader_foreground_pool_size \\{#tables_loader_foreground_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

フォアグラウンドプールでロードジョブを実行するスレッド数を設定します。フォアグラウンドプールは、サーバーがポートでリッスンを開始する前にテーブルを同期的にロードする場合や、ロード完了を待機しているテーブルをロードする場合に使用されます。フォアグラウンドプールはバックグラウンドプールよりも高い優先度を持ちます。つまり、フォアグラウンドプールでジョブが実行されている間は、バックグラウンドプールで新しいジョブは開始されません。

:::note
`0` を指定した場合は、利用可能なすべての CPU が使用されます。
:::

## tcp_close_connection_after_queries_num \\{#tcp_close_connection_after_queries_num\\}

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 接続ごとに、接続を閉じる前に実行できるクエリの最大数。0 に設定すると無制限になります。

## tcp_close_connection_after_queries_seconds \\{#tcp_close_connection_after_queries_seconds\\}

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 接続が切断されるまでの最大存続期間（秒）。接続の存続期間を無制限にするには 0 を指定します。

## tcp_port \{#tcp_port\}

クライアントとの TCP 通信に使用するポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```


## tcp_port_secure \{#tcp_port_secure\}

クライアントとのセキュアな通信に使用する TCP ポートです。[OpenSSL](#openssl) の設定と併せて使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## tcp_ssh_port \{#tcp_ssh_port\}

埋め込みクライアントを使用して PTY 経由で対話的に接続し、クエリを実行できる SSH サーバーのポート番号。

例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary_data_in_cache \{#temporary_data_in_cache\}

このオプションを使用すると、特定のディスクに対して一時データをキャッシュ内に保存できます。
このセクションでは、タイプが `cache` のディスク名を指定する必要があります。
その場合、キャッシュと一時データは同じ領域を共有し、ディスクキャッシュは一時データのために追い出される（削除される）ことがあります。

:::note
一時データ用ストレージを構成する際に使用できるオプションは、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか 1 つだけです。
:::

**例**

`local_disk` のキャッシュと一時データは、ファイルシステム上の `/tiny_local_cache` に保存され、`tiny_local_cache` によって管理されます。

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


## temporary_data_in_distributed_cache \\{#temporary_data_in_distributed_cache\\}

<SettingsInfoBlock type="Bool" default_value="0" />一時データを分散キャッシュ内に保存します。

## text_index_dictionary_block_cache_max_entries \\{#text_index_dictionary_block_cache_max_entries\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />テキスト索引用 Dictionary ブロックキャッシュのエントリ数の上限。0 を指定すると無効になります。

## text_index_dictionary_block_cache_policy \\{#text_index_dictionary_block_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />テキスト索引用 Dictionary のブロックキャッシュポリシー名。

## text_index_dictionary_block_cache_size \\{#text_index_dictionary_block_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />テキスト索引 Dictionary ブロックのキャッシュサイズ。ゼロの場合は無効になります。

:::note
この設定は実行時に変更でき、直ちに反映されます。
:::

## text_index_dictionary_block_cache_size_ratio \\{#text_index_dictionary_block_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />text index dictionary ブロックキャッシュにおける、保護キュー（SLRU ポリシーの場合）のサイズを、キャッシュ全体サイズに対する比率として指定します。

## text_index_header_cache_max_entries \\{#text_index_header_cache_max_entries\\}

<SettingsInfoBlock type="UInt64" default_value="100000" />テキスト索引ヘッダーキャッシュのサイズ（エントリ数単位）。0 の場合は無効です。

## text_index_header_cache_policy \\{#text_index_header_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />テキスト索引ヘッダーキャッシュポリシーの名称。

## text_index_header_cache_size \\{#text_index_header_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />テキスト索引ヘッダー用キャッシュのサイズです。0 の場合は無効です。

:::note
この設定は実行時に変更でき、直ちに反映されます。
:::

## text_index_header_cache_size_ratio \\{#text_index_header_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />テキスト索引ヘッダーキャッシュにおける（SLRU ポリシーの場合の）保護キューのサイズを、キャッシュ全体のサイズに対する比率として指定します。

## text_index_postings_cache_max_entries \\{#text_index_postings_cache_max_entries\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />テキスト索引のポスティングリスト用キャッシュのサイズ（エントリ数単位）。0 の場合は無効です。

## text_index_postings_cache_policy \\{#text_index_postings_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />テキストインデックスのポスティングリストキャッシュポリシー名。

## text_index_postings_cache_size \\{#text_index_postings_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="2147483648" />テキスト索引のポスティングリスト用キャッシュのサイズです。0 は無効を意味します。

:::note
この設定は実行時に変更でき、変更は直ちに反映されます。
:::

## text_index_postings_cache_size_ratio \\{#text_index_postings_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />text index の posting list キャッシュにおける、保護キュー（SLRU ポリシーの場合）のサイズ比をキャッシュ全体サイズに対する割合として指定します。

## text_log \{#text_log\}

テキストメッセージをログ出力するための [text&#95;log](/operations/system-tables/text_log) システムテーブルに対する設定です。

<SystemLogParameters />

さらに次の設定があります。

| Setting | Description                              | Default Value |
| ------- | ---------------------------------------- | ------------- |
| `level` | テーブルに保存されるメッセージの最大レベルです（デフォルトは `Trace`）。 | `Trace`       |

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


## thread_pool_queue_size \{#thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

グローバルスレッドプールに投入できるジョブの最大数です。キューサイズを増やすとメモリ使用量が増加します。この値は [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size) と同じにしておくことを推奨します。

:::note
値が `0` の場合は無制限を意味します。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size \\{#threadpool_local_fs_reader_pool_size\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />`local_filesystem_read_method = 'pread_threadpool'` の場合にローカルファイルシステムからの読み取りに使用されるスレッドプールのスレッド数。

## threadpool_local_fs_reader_queue_size \\{#threadpool_local_fs_reader_queue_size\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />ローカルファイルシステムからの読み取りのためにスレッドプール上でスケジュールできるタスクの最大数。

## threadpool_remote_fs_reader_pool_size \\{#threadpool_remote_fs_reader_pool_size\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />`remote_filesystem_read_method = 'threadpool'` に設定されている場合に、リモートファイルシステムからの読み取りに使用されるスレッドプールのスレッド数。

## threadpool_remote_fs_reader_queue_size \\{#threadpool_remote_fs_reader_queue_size\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />リモートファイルシステムからの読み取りのためにスレッドプールにスケジュールできるジョブの最大数。

## threadpool_writer_pool_size \\{#threadpool_writer_pool_size\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />オブジェクトストレージへの書き込みリクエストを処理するバックグラウンドプールのサイズ

## threadpool_writer_queue_size \\{#threadpool_writer_queue_size\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />オブジェクトストレージへの書き込みリクエスト用のバックグラウンドプールに投入できるタスクの最大数

## throw_on_unknown_workload \{#throw_on_unknown_workload\}

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ設定 &#39;workload&#39; で未知の WORKLOAD にアクセスした際の動作を定義します。

* `true` の場合、未知の WORKLOAD にアクセスしようとするクエリから RESOURCE&#95;ACCESS&#95;DENIED 例外がスローされます。WORKLOAD 階層が確立され、WORKLOAD default を含むようになった後、すべてのクエリに対してリソーススケジューリングを必須にする際に有用です。
* `false`（デフォルト）の場合、未知の WORKLOAD を指す &#39;workload&#39; 設定を持つクエリには、リソーススケジューリングなしで無制限のアクセスが与えられます。これは、WORKLOAD の階層を構成している段階で、まだ WORKLOAD default が追加されていない場合に重要です。

**例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**関連項目**

* [ワークロードのスケジューリング](/operations/workload-scheduling.md)


## timezone \{#timezone\}

サーバーが使用するタイムゾーン。

UTC タイムゾーンまたは地理的な場所を表す IANA 識別子で指定します（例: Africa/Abidjan）。

タイムゾーンは、DateTime 型のフィールドをテキスト形式（画面出力またはファイル）に出力する際の String と DateTime の相互変換、および文字列から DateTime を取得する際に必要です。さらに、入力パラメータとしてタイムゾーンを受け取らない時刻・日付関連関数でも、タイムゾーンが使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連項目**

* [session&#95;timezone](../settings/settings.md#session_timezone)


## tmp_path \{#tmp_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/tmp/" />

大きなクエリを処理するための一時データを保存する、ローカルファイルシステム上のパス。

:::note

* 一時データストレージの設定に使用できるオプションは、tmp&#95;path、tmp&#95;policy、temporary&#95;data&#95;in&#95;cache のいずれか一つだけです。
* 末尾のスラッシュは必須です。
  :::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp_path \{#tmp_path\}

大規模なクエリを処理する際の一時データを保存するための、ローカルファイルシステム上のパスです。

:::note

* 一時データストレージの設定には、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか 1 つのみを使用できます。
* 末尾のスラッシュは必須です。
  :::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp_policy \{#tmp_policy\}

一時データを保存するためのポリシーです。`tmp` というプレフィックスを持つすべてのファイルは、起動時に削除されます。

:::note
`tmp_policy` としてオブジェクトストレージを使用する際の推奨事項:

* 各サーバーで個別の `bucket:path` を使用する
* `metadata_type=plain` を使用する
* このバケットに対して有効期限 (TTL) を設定することも検討してください
  :::

:::note

* 一時データストレージを構成するために使用できるオプションは 1 つだけです: `tmp_path` 、`tmp_policy`、`temporary_data_in_cache`。
* `move_factor`、`keep_free_space_bytes`、`max_data_part_size_bytes` は無視されます。
* ポリシーには *1 つのボリューム* のみを含める必要があります

詳細については、[MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree) のドキュメントを参照してください。
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


## top_level_domains_list \{#top_level_domains_list\}

追加するカスタムトップレベルドメインのリストを定義します。各エントリは `<name>/path/to/file</name>` という形式です。

例：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

関連項目:

* 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) とそのバリエーション。
  これらはカスタム TLD リストの名前を受け取り、最初の意味のあるサブドメインまでのトップレベルサブドメインを含むドメイン部分を返します。


## top_level_domains_path \{#top_level_domains_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/top_level_domains/" />

トップレベルドメインを格納するディレクトリです。

**例**

```xml
<top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path>
```


## total_memory_profiler_sample_max_allocation_size \\{#total_memory_profiler_sample_max_allocation_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />`total_memory_profiler_sample_probability` に等しい確率で、指定した値以下のサイズのランダムなメモリアロケーションを収集します。0 は無効を意味します。このしきい値が想定どおりに機能するようにするには、`max_untracked_memory` を 0 に設定することを検討してください。

## total_memory_profiler_sample_min_allocation_size \\{#total_memory_profiler_sample_min_allocation_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />`total_memory_profiler_sample_probability` と等しい確率で、指定された値以上のサイズのランダムなアロケーションを収集します。0 は無効を意味します。このしきい値が期待どおりに機能するようにするには、`max_untracked_memory` を 0 に設定することを検討してください。

## total_memory_profiler_step \\{#total_memory_profiler_step\\}

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーのメモリ使用量が、指定されたバイト数のステップごとに定義されたしきい値を超えるたびに、メモリプロファイラは割り当て元のスタックトレースを収集します。0 に設定するとメモリプロファイラは無効になります。数メガバイト未満の値を設定するとサーバーが遅くなります。

## total_memory_tracker_sample_probability \\{#total_memory_tracker_sample_probability\\}

<SettingsInfoBlock type="Double" default_value="0" />

ランダムなメモリアロケーションおよび解放を収集し、指定した確率で `trace_type` が `MemorySample` である行として [system.trace_log](../../operations/system-tables/trace_log.md) システムテーブルに書き込みます。この確率は、アロケーションまたは解放 1 回ごとに適用され、アロケーションのサイズには依存しません。サンプリングは、未追跡メモリ量が未追跡メモリ制限（デフォルト値は `4` MiB）を超えた場合にのみ行われる点に注意してください。[total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) を小さくすると、このしきい値を引き下げることができます。より細かい粒度でサンプリングするには、`total_memory_profiler_step` を `1` に設定できます。

可能な値:

- 正の倍精度実数。
- `0` — ランダムなアロケーションおよび解放を `system.trace_log` システムテーブルに書き込む処理を無効にします。

## trace_log \{#trace_log\}

[trace&#95;log](/operations/system-tables/trace_log) システムテーブルの操作に対応する設定です。

<SystemLogParameters />

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


## uncompressed_cache_policy \\{#uncompressed_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />非圧縮キャッシュのポリシー名。

## uncompressed_cache_size \\{#uncompressed_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

MergeTree ファミリーに属するテーブルエンジンで使用される非圧縮データの最大サイズ（バイト単位）。

サーバー全体で共有されるキャッシュは 1 つだけです。メモリはオンデマンドで割り当てられます。オプション `use_uncompressed_cache` が有効な場合にキャッシュが使用されます。

非圧縮キャッシュは、特定の状況における非常に短いクエリに対して有利です。

:::note
値 `0` は無効化を意味します。

この設定は実行時に変更でき、即座に反映されます。
:::

## uncompressed_cache_size_ratio \\{#uncompressed_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />非圧縮キャッシュにおける、キャッシュ全体のサイズに対する保護キュー（SLRU ポリシーの場合）のサイズの比率です。

## url_scheme_mappers \{#url_scheme_mappers\}

短縮またはシンボリックな URL プレフィックスを完全な URL に展開するための設定。

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


## use_minimalistic_part_header_in_zookeeper \\{#use_minimalistic_part_header_in_zookeeper\\}

ZooKeeper におけるデータパーツのヘッダーの保存方法を指定します。この設定は、[`MergeTree`](/engines/table-engines/mergetree-family) ファミリーにのみ適用されます。指定方法は次のとおりです。

**`config.xml` ファイルの [merge_tree](#merge_tree) セクションでグローバルに指定する**

ClickHouse はサーバー上のすべてのテーブルに対してこの設定を使用します。この設定はいつでも変更できます。既存のテーブルも、設定が変更されるとその動作が変わります。

**テーブルごとに指定する**

テーブルを作成するときに、対応する [engine setting](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) を指定します。この設定を持つ既存テーブルの動作は、グローバルな設定が変更されても変わりません。

**取りうる値**

- `0` — 機能を無効にします。
- `1` — 機能を有効にします。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) の場合、[replicated](../../engines/table-engines/mergetree-family/replication.md) テーブルはデータパーツのヘッダーを、単一の `znode` を使用してコンパクトに保存します。テーブルに多くのカラムが含まれる場合、この保存方法により ZooKeeper に保存されるデータ量を大幅に削減できます。

:::note
`use_minimalistic_part_header_in_zookeeper = 1` を適用した後、この設定をサポートしていないバージョンの ClickHouse サーバーにダウングレードすることはできません。クラスタ内のサーバーで ClickHouse をアップグレードする際は注意してください。すべてのサーバーを一度にアップグレードしないでください。ClickHouse の新バージョンは、テスト環境やクラスタ内の一部のサーバーのみで検証する方が安全です。

すでにこの設定で保存されたデータパーツヘッダーを、以前の（非コンパクトな）表現に戻すことはできません。
:::

## user_defined_executable_functions_config \{#user_defined_executable_functions_config\}

実行可能ユーザー定義関数用の設定ファイルへのパスです。

パス:

* 絶対パス、またはサーバー設定ファイルからの相対パスを指定します。
* パスにはワイルドカード * および ? を含めることができます。

関連項目:

* &quot;[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).&quot;

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user_defined_path \{#user_defined_path\}

ユーザー定義ファイルを配置するディレクトリです。SQL ユーザー定義関数 [SQL User Defined Functions](/sql-reference/functions/udf) で使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user_directories \{#user_directories\}

`user_directories` セクションには、次の設定が含まれます。

* 事前定義されたユーザーを含む設定ファイルへのパス。
* SQL コマンドで作成されたユーザーが保存されるフォルダへのパス。
* SQL コマンドで作成され、レプリケートされるユーザーが保存される ZooKeeper ノードへのパス。

このセクションが指定されている場合、[users&#95;config](/operations/server-configuration-parameters/settings#users_config) および [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) のパスは使用されません。

`user_directories` セクションには任意の数の項目を含めることができ、項目の順序は優先順位を表します（上にある項目ほど優先度が高くなります）。

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

ユーザー、ロール、行ポリシー、クォータ、プロファイルは ZooKeeper に保存することもできます。

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

`memory` セクションを定義することもできます。これは情報をディスクに書き込まず、メモリ上のみに保存することを表します。`ldap` セクションは情報を LDAP サーバー上に保存することを表します。

ローカルに定義されていないユーザーのリモートユーザーディレクトリとして LDAP サーバーを追加するには、次の設定を持つ単一の `ldap` セクションを定義します。

| Setting  | Description                                                                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | `ldap_servers` 設定セクションで定義されている LDAP サーバー名の 1 つ。このパラメーターは必須であり、空にすることはできません。                                                                                          |
| `roles`  | LDAP サーバーから取得した各ユーザーに割り当てられる、ローカルに定義されたロールの一覧を含むセクション。ロールが指定されていない場合、ユーザーは認証後にいかなる操作も実行できません。列挙されたロールのいずれかが認証時点でローカルに定義されていない場合、その認証試行は、指定されたパスワードが誤っている場合と同様に失敗します。 |

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


## user_files_path \{#user_files_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/user_files/" />

ユーザーファイルのディレクトリです。テーブル関数 [file()](/sql-reference/table-functions/file)、[fileCluster()](/sql-reference/table-functions/fileCluster) で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_files_path \{#user_files_path\}

ユーザーファイルが格納されるディレクトリです。テーブル関数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_scripts_path \{#user_scripts_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/user_scripts/" />

ユーザースクリプトファイルを配置するディレクトリです。Executable ユーザー定義関数で使用されます。詳しくは [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions) を参照してください。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```


## user_scripts_path \{#user_scripts_path\}

ユーザースクリプトファイルが置かれるディレクトリです。Executable ユーザー定義関数で使用されます。詳しくは [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions) を参照してください。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

型:

デフォルト:


## users_config \{#users_config\}

次の内容を含むファイルへのパス:

* ユーザー設定
* アクセス権
* SETTINGS PROFILE
* QUOTA 設定

**例**

```xml
<users_config>users.xml</users_config>
```


## validate_tcp_client_information \{#validate_tcp_client_information\}

<SettingsInfoBlock type="Bool" default_value="0" />クエリパケット受信時にクライアント情報を検証するかどうかを制御します。

デフォルトでは `false` です:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries \\{#vector_similarity_index_cache_max_entries\\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />ベクトル類似度索引用キャッシュのサイズ（エントリ数）。ゼロを指定すると無効になります。

## vector_similarity_index_cache_policy \\{#vector_similarity_index_cache_policy\\}

<SettingsInfoBlock type="String" default_value="SLRU" />ベクトル類似度索引キャッシュポリシーの名前。

## vector_similarity_index_cache_size \\{#vector_similarity_index_cache_size\\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />ベクトル類似度索引用キャッシュのサイズ。0 の場合は無効です。

:::note
この設定は実行時に変更でき、直ちに反映されます。
:::

## vector_similarity_index_cache_size_ratio \\{#vector_similarity_index_cache_size_ratio\\}

<SettingsInfoBlock type="Double" default_value="0.5" />ベクトル類似性索引キャッシュにおいて、（SLRU ポリシーの場合の）保護キューのサイズがキャッシュ全体のサイズに対して占める割合。

## wait_dictionaries_load_at_startup \{#wait_dictionaries_load_at_startup\}

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は、`dictionaries_lazy_load` が `false` の場合の動作を制御します。
（`dictionaries_lazy_load` が `true` の場合、この設定は何の影響も与えません。）

`wait_dictionaries_load_at_startup` が `false` の場合、サーバーは起動時にすべての Dictionary のロードを開始し、
そのロードと並行して接続を受け付けます。
ある Dictionary がクエリで初めて使用されたとき、その Dictionary がまだロードされていなければ、
クエリはその Dictionary のロード完了まで待機します。
`wait_dictionaries_load_at_startup` を `false` に設定すると ClickHouse の起動を高速化できますが、
一部のクエリは（必要な Dictionary のロード完了を待つ必要があるため）実行が遅くなる可能性があります。

`wait_dictionaries_load_at_startup` が `true` の場合、サーバーは起動時に、
すべての Dictionary のロードが（成功・失敗を問わず）完了するまで待機し、その後で接続を受け付けます。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload_path \{#workload_path\}

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリのストレージとして使用されるディレクトリです。デフォルトでは、サーバーのワーキングディレクトリ直下の `/workload/` ディレクトリが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**関連項目**

* [ワークロード階層](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)


## workload_zookeeper_path \{#workload_zookeeper_path\}

`CREATE WORKLOAD` および `CREATE RESOURCE` クエリすべての格納先として使用される ZooKeeper ノードへのパスです。整合性を保つため、すべての SQL の定義はこの単一の znode の値として保存されます。デフォルトでは ZooKeeper は使用されず、定義は [ディスク](#workload_path) に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**関連項目**

* [ワークロード階層](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)


## zookeeper \{#zookeeper\}

ClickHouse が [ZooKeeper](http://zookeeper.apache.org/) クラスターと連携するための設定を含みます。ClickHouse はレプリケーテッドテーブルを使用する際に、レプリカのメタデータを保存するために ZooKeeper を使用します。レプリケーテッドテーブルを使用しない場合は、このセクションのパラメータは省略できます。

以下の設定はサブタグで指定できます:

| Setting                                    | Description                                                                                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeper のエンドポイント。複数のエンドポイントを指定できます。例: `<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性は ZooKeeper クラスターへ接続を試行する際のノードの順序を指定します。 |
| `session_timeout_ms`                       | クライアントセッションの最大タイムアウト時間 (ミリ秒)。                                                                                                                                  |
| `operation_timeout_ms`                     | 1 回の操作の最大タイムアウト時間 (ミリ秒)。                                                                                                                                       |
| `root` (optional)                          | ClickHouse サーバーが使用する znode 群のルートとして使用される znode。                                                                                                                |
| `fallback_session_lifetime.min` (optional) | プライマリが利用できない場合にフォールバックノードへの ZooKeeper セッションの存続期間に対する最小制限 (ロードバランシング)。秒単位で指定します。デフォルト: 3 時間。                                                                    |
| `fallback_session_lifetime.max` (optional) | プライマリが利用できない場合にフォールバックノードへの ZooKeeper セッションの存続期間に対する最大制限 (ロードバランシング)。秒単位で指定します。デフォルト: 6 時間。                                                                    |
| `identity` (optional)                      | 指定された znode にアクセスするために ZooKeeper が要求するユーザー名およびパスワード。                                                                                                           |
| `use_compression` (optional)               | true に設定すると Keeper プロトコルで圧縮を有効にします。                                                                                                                            |

`zookeeper_load_balancing` 設定 (オプション) もあり、ZooKeeper ノード選択のアルゴリズムを指定できます:

| Algorithm Name                  | Description                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| `random`                        | ZooKeeper ノードのいずれかをランダムに選択します。                                       |
| `in_order`                      | 最初の ZooKeeper ノードを選択し、それが利用できない場合は 2 番目、それでもだめなら次へと順に選択します。          |
| `nearest_hostname`              | サーバーのホスト名に最も類似したホスト名を持つ ZooKeeper ノードを選択します。ホスト名は名前のプレフィックスで比較されます。  |
| `hostname_levenshtein_distance` | `nearest_hostname` と同様ですが、ホスト名をレーベンシュタイン距離に基づいて比較します。                |
| `first_or_random`               | 最初の ZooKeeper ノードを選択し、それが利用できない場合は残りの ZooKeeper ノードのいずれかをランダムに選択します。 |
| `round_robin`                   | 最初の ZooKeeper ノードを選択し、再接続が発生するたびに次のノードを選択します。                        |

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
* [ClickHouse と ZooKeeper 間のセキュア通信（オプション）](/operations/ssl-zookeeper)


## zookeeper_log \{#zookeeper_log\}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) システムテーブルに関する設定です。

以下の設定はサブタグで指定できます:

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
