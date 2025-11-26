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
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# サーバー設定

このセクションでは、サーバー設定について説明します。これらはセッションやクエリ単位では変更できない設定です。

ClickHouse における設定ファイルの詳細については、[「Configuration Files」](/operations/configuration-files) を参照してください。

その他の設定については、「[Settings](/operations/settings/overview)」セクションで説明しています。
設定について理解する前に、[Configuration files](/operations/configuration-files) セクションを読み、置換（`incl` および `optional` 属性）の使い方に注意することを推奨します。



## abort_on_logical_error {#abort_on_logical_error} 

<SettingsInfoBlock type="Bool" default_value="0" />LOGICAL_ERROR 例外発生時にサーバーをクラッシュさせます。上級者向けの設定です。



## access&#95;control&#95;improvements

アクセス制御システムに対する任意の改善用設定です。

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                             | Default |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | 行ポリシーを持たないユーザーでも、`SELECT` クエリを使用して行を読み取れるかどうかを設定します。たとえば、ユーザー A と B がいて、行ポリシーが A に対してのみ定義されている場合、この設定が true であれば、ユーザー B はすべての行を閲覧できます。この設定が false の場合、ユーザー B はいずれの行も閲覧できません。                                                                                                                                                                                            | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` クエリに `CLUSTER` 権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                            | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>` を実行する際に、権限が必要かどうか、また任意のユーザーが実行できるかどうかを設定します。true に設定した場合、このクエリには `system` 以外のテーブルと同様に `GRANT SELECT ON system.<table>` が必要です。例外として、いくつかの `system` テーブル（`tables`、`columns`、`databases`、および `one`、`contributors` のような一部の定数テーブル）は引き続き全ユーザーが参照可能です。また、`SHOW` 権限（例: `SHOW USERS`）が付与されている場合、対応する `system` テーブル（つまり `system.users`）にはアクセスできます。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` を実行する際に、権限が必要かどうか、また任意のユーザーが実行できるかどうかを設定します。true に設定した場合、このクエリには通常のテーブルと同様に `GRANT SELECT ON information_schema.<table>` が必要です。                                                                                                                                                                                              | `true`  |
| `settings_constraints_replace_previous`         | ある設定に対する設定プロファイル内の制約が、その設定に対して以前に定義された制約（他のプロファイル内で定義されたもの）の動作を、新しい制約で値が設定されていないフィールドも含めて打ち消すかどうかを設定します。また、`changeable_in_readonly` 制約タイプを有効にします。                                                                                                                                                                                                                       | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンを用いてテーブルを作成する際に、権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                             | `false` |
| `role_cache_expiration_time_seconds`            | 最終アクセスからの経過秒数として、ロールが `Role Cache` に保持される時間を設定します。                                                                                                                                                                                                                                                                                                                      | `600`   |

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

ClickHouse サーバーが、SQL コマンドで作成されたユーザーおよびロールの設定を格納するディレクトリへのパス。

**関連項目**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)



## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />groupArray で配列要素数の上限を超えた場合に実行する動作: 例外を `throw` するか、超過した値を `discard` するかを指定します



## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray 関数における配列要素の最大サイズ（バイト単位）。この制限はシリアル化時に検証され、集約状態が過度に大きくなるのを防ぎます。



## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />
異なる機能ティアごとの設定をユーザーが変更できるかどうかを制御します。

- `0` - すべての設定の変更が許可されます（experimental、beta、production）。
- `1` - beta および production の機能設定のみ変更が許可されます。experimental 設定の変更は拒否されます。
- `2` - production の設定のみ変更が許可されます。experimental および beta の設定の変更は拒否されます。

これは、すべての `EXPERIMENTAL` / `BETA` 機能に読み取り専用の制約を設定するのと同等です。

:::note
値が `0` の場合、すべての設定を変更できます。
:::




## allow_impersonate_user {#allow_impersonate_user} 

<SettingsInfoBlock type="Bool" default_value="0" />`IMPERSONATE` 機能（`EXECUTE AS target_user`）を有効または無効にします。



## allow&#95;implicit&#95;no&#95;password

&#39;IDENTIFIED WITH no&#95;password&#39; が明示的に指定されていない限り、ユーザーをパスワードなしで作成することを禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow&#95;no&#95;password

安全ではないパスワード種別である no&#95;password を許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```


## allow&#95;plaintext&#95;password

プレーンテキストのパスワード方式（安全ではない）を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc によるメモリの使用を許可します。



## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

Iceberg で使用が許可されているディスクの一覧



## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />`true` の場合、グレースフルシャットダウン時に非同期挿入キューがフラッシュされます



## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドでデータを解析して挿入するために使用されるスレッドの最大数。0 の場合、非同期モードは無効になります



## async&#95;load&#95;databases

<SettingsInfoBlock type="Bool" default_value="1" />

データベースおよびテーブルの非同期ロード。

* `true` の場合、すべての非システムデータベースのうち、エンジンが `Ordinary`、`Atomic`、`Replicated` のものは、ClickHouse サーバーの起動後に非同期でロードされます。`system.asynchronous_loader` テーブルおよび `tables_loader_background_pool_size`、`tables_loader_foreground_pool_size` サーバー設定を参照してください。まだロードされていないテーブルへアクセスしようとするクエリは、そのテーブルが起動して利用可能になるまで待機します。ロードジョブが失敗した場合、クエリは（`async_load_databases = false` の場合のようにサーバー全体をシャットダウンするのではなく）エラーを再スローします。少なくとも 1 つのクエリが待機しているテーブルは、より高い優先度でロードされます。データベースに対する DDL クエリは、そのデータベースが起動して利用可能になるまで待機します。また、待機中のクエリ総数に対する制限として `max_waiting_queries` の設定も検討してください。
* `false` の場合、すべてのデータベースはサーバー起動時にロードされます。

**例**

```xml
<async_load_databases>true</async_load_databases>
```


## async&#95;load&#95;system&#95;database

<SettingsInfoBlock type="Bool" default_value="0" />

`system` データベース内に多数のログテーブルやパーツがある場合に有用な、システムテーブルの非同期読み込みを有効にします。`async_load_databases` 設定とは独立しています。

* `true` に設定した場合、ClickHouse サーバー起動後に、`Ordinary`、`Atomic`、`Replicated` エンジンを持つすべての `system` データベースが非同期に読み込まれます。`system.asynchronous_loader` テーブル、およびサーバー設定 `tables_loader_background_pool_size` と `tables_loader_foreground_pool_size` を参照してください。まだ読み込まれていないシステムテーブルへアクセスしようとするクエリは、そのテーブルの読み込みが完了するまで待機します。少なくとも 1 件のクエリから待機されているテーブルは、より高い優先度で読み込まれます。また、待機中のクエリ総数を制限するために `max_waiting_queries` 設定の利用も検討してください。
* `false` に設定した場合、システムデータベースはサーバー起動前に読み込まれます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />負荷の高い非同期メトリクスを更新する間隔（秒単位）。



## asynchronous&#95;insert&#95;log

非同期インサートのログを記録するための [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) システムテーブルの設定。

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


## asynchronous&#95;metric&#95;log

ClickHouse Cloud のデプロイメントでは、デフォルトで有効になっています。

お使いの環境でこの設定がデフォルトで有効になっていない場合は、ClickHouse のインストール方法に応じて、以下の手順に従って設定を有効化または無効化できます。

**有効化**

非同期メトリックログ履歴の収集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します。

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

`asynchronous_metric_log` 設定を無効にするには、次の内容のファイル `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` を作成します：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />負荷の高い非同期メトリクスの計算を有効にします。



## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />非同期メトリクスの更新間隔（秒）。



## auth_use_forwarded_address {#auth_use_forwarded_address} 

プロキシ経由で接続されたクライアントに対して、認証時に元の発信元アドレスを使用します。

:::note
転送されたアドレスは容易に偽装できるため、この設定は細心の注意を払って使用する必要があります。そのような認証を受け入れるサーバーには、直接アクセスせず、必ず信頼できるプロキシ経由でのみアクセスするようにしてください。
:::



## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [Buffer エンジン](/engines/table-engines/special/buffer) テーブルのフラッシュ処理を実行するために使用されるスレッドの最大数。



## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドで [*MergeTree エンジン](/engines/table-engines/mergetree-family) テーブルに対して各種処理（主にガーベジコレクション）を実行するために使用されるスレッド数の最大値。



## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />分散送信の実行に使用されるスレッド数の上限。



## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルの他のレプリカからデータパーツを取得するために使用されるスレッド数の最大値です。



## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />
スレッド数に対する、同時に実行できるバックグラウンドのマージおよびミューテーション処理数の比率を設定します。

たとえば、この比率が 2 で、[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) が 16 に設定されている場合、ClickHouse は 32 個のバックグラウンドマージを同時に実行できます。これは、バックグラウンド処理を一時停止および延期できるためです。これは、小さいマージにより高い実行優先度を与えるために必要です。

:::note
この比率は実行時には増やすことしかできません。値を下げるにはサーバーを再起動する必要があります。

[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 設定と同様に、[`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) も後方互換性のために `default` プロファイルから適用できます。
:::




## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />
バックグラウンドマージおよびミューテーションのスケジューリング方法を決定するポリシーです。指定可能な値は `round_robin` と `shortest_task_first` です。

バックグラウンドスレッドプールが、次に実行するマージまたはミューテーションを選択する際に用いるアルゴリズムです。ポリシーはサーバーの再起動なしに、実行時に変更できます。
後方互換性のために `default` プロファイルから適用することができます。

設定可能な値:

- `round_robin` — すべての同時マージおよびミューテーションは、ラウンドロビン順に実行され、飢餓状態が発生しないようにします。小さいマージはマージ対象のブロック数が少ないため、大きいマージよりも速く完了します。
- `shortest_task_first` — 常にサイズの小さいマージまたはミューテーションを実行します。マージおよびミューテーションには、結果のサイズに基づいて優先度が割り当てられます。サイズの小さいマージは大きいマージよりも厳密に優先されます。このポリシーは小さいパーツを可能な限り速くマージすることを保証しますが、`INSERT` が大量に発生しているパーティションでは、大きなマージが無期限に実行されないまま飢餓状態になる可能性があります。




## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />メッセージストリーミングのバックグラウンド処理を実行するために使用されるスレッドの最大数。



## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />バックグラウンドでデータパーツを別のディスクまたはボリュームに移動する際に使用される、*MergeTree エンジンテーブル用の最大スレッド数です。



## background&#95;pool&#95;size

<SettingsInfoBlock type="UInt64" default_value="16" />

MergeTree エンジンを使用するテーブルに対して、バックグラウンドでマージおよびミューテーションを実行するスレッド数を設定します。

:::note

* この設定は、後方互換性のために、ClickHouse サーバー起動時に `default` プロファイルの設定から適用することもできます。
* 実行中に変更できるのは、スレッド数を増やす場合のみです。
* スレッド数を減らすにはサーバーを再起動する必要があります。
* この設定を調整することで、CPU とディスクの負荷を制御できます。
  :::

:::danger
プールサイズを小さくすると CPU とディスクのリソース消費は減りますが、バックグラウンド処理の進行が遅くなり、最終的にはクエリ性能に影響を与える可能性があります。
:::

この値を変更する前に、次のような関連する MergeTree 設定も確認してください。

* [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
* [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
* [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**例**

```xml
<background_pool_size>16</background_pool_size>
```


## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio} 

<SettingsInfoBlock type="Float" default_value="0.8" />同一種別のタスクを同時に実行できる、プール内スレッド数の最大比率。



## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />レプリケーテッドテーブル、Kafka ストリーミング、DNS キャッシュの更新などの軽量な定期的処理を継続的に実行するために使用されるスレッドの最大数です。



## backup&#95;log

`BACKUP` および `RESTORE` 操作を記録するための [backup&#95;log](../../operations/system-tables/backup_log.md) システムテーブル用の設定。

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

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />`BACKUP` リクエストを実行するスレッド数の上限。



## backups {#backups} 

[`BACKUP` および `RESTORE`](../backup.md) ステートメントを実行する際に使用されるバックアップ設定です。

次の設定はサブタグごとに構成できます。



{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','同一ホスト上で複数のバックアップ処理を同時に実行できるかどうかを決定します。', 'true'),
    ('allow_concurrent_restores', 'Bool', '同一ホスト上で複数のリストア処理を同時に実行できるかどうかを決定します。', 'true'),
    ('allowed_disk', 'String', '`File()` を使用する際のバックアップ先ディスクです。この設定は `File` を使用するために必須です。', ''),
    ('allowed_path', 'String', '`File()` を使用する際のバックアップ先パスです。この設定は `File` を使用するために必須です。', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '収集したメタデータの比較後に不整合があった場合、スリープに入る前にメタデータ収集を試行する回数です。', '2'),
    ('collect_metadata_timeout', 'UInt64', 'バックアップ中にメタデータを収集する際のタイムアウト（ミリ秒）です。', '600000'),
    ('compare_collected_metadata', 'Bool', '`true` の場合、バックアップ中にメタデータが変更されていないことを保証するために、収集したメタデータを既存のメタデータと比較します。', 'true'),
    ('create_table_timeout', 'UInt64', 'リストア中にテーブルを作成する際のタイムアウト（ミリ秒）です。', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '協調バックアップ／リストア中に bad version エラーが発生した後にリトライを行う最大試行回数です。', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '次回のメタデータ収集を試行する前にスリープする最大時間（ミリ秒）です。', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '次回のメタデータ収集を試行する前にスリープする最小時間（ミリ秒）です。', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '`BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップへコピー済みのファイルを削除しようとします。そうしない場合、コピー済みファイルはそのまま残ります。', 'true'),
    ('sync_period_ms', 'UInt64', '協調バックアップ／リストアの同期間隔（ミリ秒）です。', '5000'),
    ('test_inject_sleep', 'Bool', 'テスト用途のスリープ挿入設定です。', 'false'),
    ('test_randomize_order', 'Bool', '`true` の場合、テスト目的で特定の処理順序をランダム化します。', 'false'),
    ('zookeeper_path', 'String', '`ON CLUSTER` 句を使用する場合に、バックアップおよびリストアのメタデータが保存される ZooKeeper 上のパスです。', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }

| 設定                                                  | 型         | 概要                                                                                                    | デフォルト                 |
| :-------------------------------------------------- | :-------- | :---------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool      | 同一ホスト上で複数のバックアップ処理を同時に実行できるかどうかを制御します。                                                                | `true`                |
| `allow_concurrent_restores`                         | Bool（ブール） | 同一ホストで複数の復元処理を並行実行できるかどうかを指定します。                                                                      | `true`                |
| `allowed_disk`                                      | 文字列       | `File()` を使用する際にバックアップ先として利用するディスク。この設定を行わないと `File()` は使用できません。                                      | ``                    |
| `allowed_path`                                      | String    | `File()` 使用時のバックアップ先パス。この設定を指定しないと `File` は使用できません。                                                   | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt      | 収集したメタデータを比較して不整合があった場合に、スリープに入る前にメタデータの収集を再試行する回数。                                                   | `2`                   |
| `collect_metadata_timeout`                          | UInt64    | バックアップ時のメタデータ収集のタイムアウト（ミリ秒単位）。                                                                        | `600000`              |
| `compare_collected_metadata`                        | Bool      | true の場合、収集したメタデータを既存のメタデータと比較し、バックアップ中に変更されていないことを検証します。                                             | `true`                |
| `create_table_timeout`                              | UInt64    | 復元中のテーブル作成タイムアウト（ミリ秒）。                                                                                | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64    | 協調バックアップ／リストア処理中に「bad version」エラーが発生した場合に行う再試行の最大回数。                                                  | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64    | 次回のメタデータ収集試行までの最大スリープ時間（ミリ秒）。                                                                         | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64    | 次のメタデータ収集を試行するまでの最小スリープ時間（ミリ秒）。                                                                       | `5000`                |
| `remove_backup_files_after_failure`                 | Bool      | `BACKUP` コマンドが失敗した場合、ClickHouse は失敗が発生する前にバックアップにコピーされたファイルを削除しようとしますが、削除できなかったファイルについてはコピーされたまま残します。 | `true`                |
| `sync_period_ms`                                    | UInt64    | バックアップ／リストアを連携して実行するための同期間隔（ミリ秒単位）。                                                                   | `5000`                |
| `test_inject_sleep`                                 | Bool      | テスト用スリープ処理                                                                                            | `false`               |
| `test_randomize_order`                              | Bool      | true に設定すると、テスト目的で一部の操作の実行順序をランダム化します。                                                                | `false`               |
| `zookeeper_path`                                    | String    | `ON CLUSTER` 句使用時に、バックアップおよびリストアのメタデータが保存される ZooKeeper 内のパス。                                          | `/clickhouse/backups` |

この設定はデフォルトで次のように構成されています：

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Backups IO Thread プールにスケジュールできるジョブの最大数です。現在の S3 バックアップのロジック上、このキューは無制限のままにしておくことが推奨されます。

:::note
`0`（デフォルト）の値は無制限を意味します。
:::




## bcrypt&#95;workfactor

`bcrypt_password` 認証タイプで使用される [Bcrypt アルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/) のワークファクタです。
ワークファクタは、ハッシュの計算およびパスワード検証に必要な計算量と時間を定義します。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
認証処理を頻繁に行うアプリケーションでは、
高いワークファクター設定時の bcrypt の計算コストを考慮し、
別の認証方式の利用を検討してください。
:::


## blob&#95;storage&#95;log

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


## builtin&#95;dictionaries&#95;reload&#95;interval

組み込みディクショナリを再読み込みするまでの間隔を秒単位で指定します。

ClickHouse は、組み込みディクショナリを x 秒ごとに再読み込みします。これにより、サーバーを再起動することなくディクショナリを即時に編集できます。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />キャッシュサイズを RAM の最大値に対する比率として設定します。メモリ容量の小さいシステムでキャッシュサイズを小さく抑えることができます。



## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />テスト目的のための設定です。



## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />
サーバーの最大許容メモリ使用量を、cgroups 内の対応するしきい値に基づいて調整する際の、秒単位の間隔。

cgroup オブザーバーを無効にするには、この値を `0` に設定します。




## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />[コンパイル済み式](../../operations/caches.md)用キャッシュのサイズ（要素数）を設定します。



## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />[コンパイル済み式](../../operations/caches.md)のキャッシュサイズをバイト単位で設定します。



## compression

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブルに対するデータ圧縮設定です。

:::note
ClickHouse を使い始めたばかりの場合は、この設定は変更しないことをお勧めします。
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

* `min_part_size` – データパートの最小サイズ。
* `min_part_size_ratio` – データパートサイズとテーブルサイズの比率。
* `method` – 圧縮方式。指定可能な値: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`。
* `level` – 圧縮レベル。[Codecs](/sql-reference/statements/create/table#general-purpose-codecs) を参照。

:::note
複数の `<case>` セクションを設定できます。
:::

**条件が満たされたときの動作**:

* データパートがいずれかの条件セットに一致した場合、ClickHouse は指定された圧縮方式を使用します。
* データパートが複数の条件セットに一致した場合、ClickHouse は最初に一致した条件セットを使用します。

:::note
データパートに対していずれの条件も満たされない場合、ClickHouse は `lz4` 圧縮を使用します。
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
`concurrent_threads_soft_limit_num` と `concurrent_threads_soft_limit_ratio_to_cores` で指定された CPU スロットをどのようにスケジューリングするかを決定するポリシーです。制限された数の CPU スロットを同時実行クエリ間でどのように分配するかを制御するアルゴリズムでもあります。スケジューラは、サーバーを再起動することなく実行時に変更できます。

設定可能な値:

- `round_robin` — `use_concurrency_control` = 1 に設定された各クエリは、最大で `max_threads` 個の CPU スロットを確保します。スレッドごとに 1 スロットです。競合が発生した場合、CPU スロットはクエリ間でラウンドロビン方式で割り当てられます。最初のスロットは無条件に付与される点に注意してください。このため、多数の `max_threads` = 1 のクエリが存在する状況では、`max_threads` が大きいクエリが不公平に扱われ、レイテンシーが増加する可能性があります。
- `fair_round_robin` — `use_concurrency_control` = 1 に設定された各クエリは、最大で `max_threads - 1` 個の CPU スロットを確保します。各クエリの最初のスレッドには CPU スロットを必要としないという点で、`round_robin` のバリエーションです。これにより、`max_threads` = 1 のクエリはスロットを一切必要とせず、不公平に全スロットを占有してしまうことがなくなります。無条件に付与されるスロットは存在しません。




## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />
リモートサーバーからデータを取得するスレッドを除き、すべてのクエリで使用できるクエリ処理スレッドの最大数です。これはハードリミットではありません。制限に達した場合でも、そのクエリには少なくとも 1 つのスレッドが割り当てられて実行されます。より多くのスレッドが利用可能になった場合、実行中のクエリは必要なスレッド数までスケールアップできます。

:::note
`0`（デフォルト）の場合は無制限を意味します。
:::




## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) と同様ですが、コア数に対する比率として指定します。



## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />
ClickHouse が設定を再読み込みし、新しい変更の有無を確認する間隔




## core&#95;dump

コアダンプファイルサイズのソフトリミットを設定します。

:::note
ハードリミットはシステムツールで構成します
:::

**例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## cpu&#95;slot&#95;preemption

<SettingsInfoBlock type="Bool" default_value="0" />

CPU リソース（MASTER THREAD と WORKER THREAD）のワークロードスケジューリング方法を定義します。

* `true`（推奨）の場合、実際に消費された CPU 時間に基づいて使用状況の計測が行われます。競合するワークロードに対して、公平な量の CPU 時間が割り当てられます。スロットは一定時間のみ割り当てられ、有効期限後に再度要求されます。CPU リソースが過負荷の場合、スロット要求がスレッド実行をブロックすることがあり、つまりプリエンプションが発生する可能性があります。これにより CPU 時間の公平性が確保されます。
* `false`（デフォルト）の場合、計測は割り当てられた CPU スロット数に基づいて行われます。競合するワークロードに対して、公平な数の CPU スロットが割り当てられます。スレッド開始時にスロットが割り当てられ、スレッドの実行が終了するまで継続的に保持され、その後解放されます。クエリ実行に割り当てられるスレッド数は 1 から `max_threads` までしか増加せず、減少することはありません。これは長時間実行されるクエリに有利に働き、短時間クエリが CPU リソースの飢餓状態に陥る可能性があります。

**例**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**関連項目**

* [Workload Scheduling](/operations/workload-scheduling.md)


## cpu&#95;slot&#95;preemption&#95;timeout&#95;ms

<SettingsInfoBlock type="UInt64" default_value="1000" />

プリエンプション中、つまり別の CPU スロットが付与されるのを待つ間に、ワーカースレッドが待機できる時間（ミリ秒）を定義します。このタイムアウト後も新しい CPU スロットを取得できなかった場合、そのスレッドは終了し、クエリは同時実行スレッド数がより少ない状態へ動的にスケールダウンされます。マスタースレッド自体がスケールダウンされることはありませんが、無期限にプリエンプトされる可能性がある点に注意してください。`cpu_slot_preemption` が有効であり、かつ WORKER THREAD に対して CPU リソースが定義されている場合にのみ意味を持ちます。

**例**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**関連項目**

* [Workload Scheduling](/operations/workload-scheduling.md)


## cpu&#95;slot&#95;quantum&#95;ns

<SettingsInfoBlock type="UInt64" default_value="10000000" />

これは、スレッドが CPU スロットを取得してから、別の CPU スロットを再度要求するまでに消費できる CPU ナノ秒数を定義します。`cpu_slot_preemption` が有効であり、かつ MASTER THREAD または WORKER THREAD に CPU リソースが定義されている場合にのみ有効です。

**例**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**関連項目**

* [ワークロードのスケジューリング](/operations/workload-scheduling.md)


## crash&#95;log

[crash&#95;log](../../operations/system-tables/crash_log.md) システムテーブルの動作に関する設定です。

以下の設定はサブタグで構成できます。

| Setting                            | Description                                                                                                               | Default             | Note                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------- |
| `database`                         | データベース名。                                                                                                                  |                     |                                                                                     |
| `table`                            | システムテーブル名。                                                                                                                |                     |                                                                                     |
| `engine`                           | システムテーブル用の [MergeTree エンジン定義](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。 |                     | `partition_by` または `order_by` が定義されている場合は使用できません。指定しない場合、デフォルトで `MergeTree` が選択されます |
| `partition_by`                     | システムテーブル用の [カスタムパーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                         |                     | システムテーブルに対して `engine` を指定する場合、`partition_by` パラメータは直接 `engine` 内で指定する必要があります        |
| `ttl`                              | テーブルの [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) を指定します。                         |                     | システムテーブルに対して `engine` を指定する場合、`ttl` パラメータは直接 `engine` 内で指定する必要があります                 |
| `order_by`                         | システムテーブル用の [カスタムソートキー](/engines/table-engines/mergetree-family/mergetree#order_by)。`engine` が定義されている場合は使用できません。           |                     | システムテーブルに対して `engine` を指定する場合、`order_by` パラメータは直接 `engine` 内で指定する必要があります            |
| `storage_policy`                   | テーブルに使用するストレージポリシー名（任意）。                                                                                                  |                     | システムテーブルに対して `engine` を指定する場合、`storage_policy` パラメータは直接 `engine` 内で指定する必要があります      |
| `settings`                         | MergeTree の動作を制御する [追加パラメータ](/engines/table-engines/mergetree-family/mergetree/#settings)（任意）。                            |                     | システムテーブルに対して `engine` を指定する場合、`settings` パラメータは直接 `engine` 内で指定する必要があります            |
| `flush_interval_milliseconds`      | メモリ上のバッファからテーブルへデータをフラッシュする間隔。                                                                                            | `7500`              |                                                                                     |
| `max_size_rows`                    | ログの最大行数。未フラッシュのログ数が `max_size_rows` に達すると、ログがディスクにダンプされます。                                                                | `1024`              |                                                                                     |
| `reserved_size_rows`               | ログ用に事前に確保しておくメモリサイズ（行数）。                                                                                                  | `1024`              |                                                                                     |
| `buffer_size_rows_flush_threshold` | 行数に対するしきい値。このしきい値に達すると、バックグラウンドでログのディスクへのフラッシュが実行されます。                                                                    | `max_size_rows / 2` |                                                                                     |
| `flush_on_crash`                   | クラッシュ時にログをディスクへダンプするかどうかを設定します。                                                                                           | `false`             |                                                                                     |

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


## custom&#95;cached&#95;disks&#95;base&#95;directory

この設定は、カスタム（SQL から作成された）キャッシュディスクのキャッシュパスを指定します。
`custom_cached_disks_base_directory` はカスタムディスクに対して `filesystem_caches_path`（`filesystem_caches_path.xml` 内にあります）よりも高い優先度を持ち、
前者が存在しない場合に後者が使用されます。
ファイルシステムキャッシュのパスは必ずこのディレクトリ配下でなければなりません。
そうでない場合は、ディスクの作成を防ぐために例外がスローされます。

:::note
これは、サーバーのアップグレード前に古いバージョンで作成されたディスクには影響しません。
この場合、サーバーが正常に起動できるように、例外はスローされません。
:::

例:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## custom&#95;settings&#95;prefixes

[カスタム設定](/operations/settings/query-level#custom_settings)用のプレフィックスの一覧です。複数指定する場合はカンマ区切りで指定します。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**関連項目**

* [カスタム設定](/operations/settings/query-level#custom_settings)


## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" />
[`UNDROP`](/sql-reference/statements/undrop.md) ステートメントを使用して削除されたテーブルを復元できる猶予時間です。`DROP TABLE` が `SYNC` 修飾子付きで実行された場合、この設定は無視されます。
この設定のデフォルト値は `480`（8 分）です。




## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />テーブルの削除に失敗した場合、ClickHouse はこのタイムアウト時間が経過するまで待機してから操作を再試行します。



## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />テーブルを削除する際に使用されるスレッドプールのサイズ。



## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
`store/` ディレクトリから不要なデータをクリーンアップするタスクのパラメータです。
このタスクの実行間隔（スケジューリング周期）を設定します。

:::note
`0` を指定するとタスクは実行されません。デフォルト値は 1 日に相当します。
:::




## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />
`store/` ディレクトリから不要なデータをクリーンアップするタスクのパラメータです。
あるサブディレクトリが clickhouse-server によって使用されておらず、かつ直近
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒の間に更新されていない場合、このタスクはそのディレクトリの
すべてのアクセス権を削除することで、そのディレクトリを「非表示」にします。これは、clickhouse-server が
`store/` 内に存在することを想定していないディレクトリにも適用されます。

:::note
`0` の値は「即時」を意味します。
:::




## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />
`store/` ディレクトリから不要なディレクトリをクリーンアップするタスクのパラメータです。
サブディレクトリが clickhouse-server によって使用されておらず、以前に「非表示」
（[database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) を参照）
にされていて、そのディレクトリが直近
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒間変更されていない場合、このタスクはそのディレクトリを削除します。
また、clickhouse-server が
`store/` 内に存在することを想定していないディレクトリに対しても動作します。

:::note
値が `0` の場合は「削除しない（無期限に保持する）」ことを意味します。デフォルト値は 30 日に相当します。
:::




## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />Replicated データベースでテーブルを恒久的にデタッチできるようにします



## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />予期しないテーブルを、別のローカルデータベースに移動するのではなく Replicated データベースから削除します



## dead&#95;letter&#95;queue

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

<SettingsInfoBlock type="String" default_value="default" />デフォルトのデータベース名です。



## default&#95;password&#95;type

`CREATE USER u IDENTIFIED BY 'p'` のようなクエリで、自動的に使用されるパスワードの種類を指定します。

指定可能な値は次のとおりです:

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## default&#95;profile

既定の設定プロファイルです。設定プロファイルは、設定 `user_config` で指定されたファイルに定義されています。

**例**

```xml
<default_profile>default</default_profile>
```


## default&#95;replica&#95;name

<SettingsInfoBlock type="String" default_value="{replica}" />

ZooKeeper 上のレプリカ名。

**例**

```xml
<default_replica_name>{replica}</default_replica_name>
```


## default&#95;replica&#95;path

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />

ZooKeeper 上のテーブルへのパス。

**例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```


## default&#95;session&#95;timeout

セッションのデフォルトタイムアウト時間（秒単位）。

```xml
<default_session_timeout>60</default_session_timeout>
```


## dictionaries&#95;config

ディクショナリ設定ファイルへのパス。

パス:

* 絶対パス、またはサーバー設定ファイルからの相対パスを指定します。
* パスにはワイルドカードの * や ? を含めることができます。

関連項目:

* &quot;[Dictionaries](../../sql-reference/dictionaries/index.md)&quot;。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## dictionaries&#95;lazy&#95;load

<SettingsInfoBlock type="Bool" default_value="1" />

ディクショナリを遅延ロードします。

* `true` の場合、各ディクショナリは最初に使用されたときに読み込まれます。読み込みに失敗した場合、そのディクショナリを使用していた関数は例外をスローします。
* `false` の場合、サーバーは起動時にすべてのディクショナリを読み込みます。

:::note
サーバーは、すべてのディクショナリの読み込みが完了するまで起動時に待機し、それまでは接続を受け付けません
（例外: [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) が `false` に設定されている場合）。
:::

**例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />`background_reconnect` が有効になっている、接続に失敗した MySQL および Postgres 辞書に対して行う再接続試行の間隔（ミリ秒単位）。



## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />
`INSERT`/`ALTER`/`DELETE` クエリを無効化します。読み取り専用ノードが必要で、挿入やミューテーションが読み取りパフォーマンスに影響するのを防ぎたい場合に、この設定を有効化します。この設定が有効な場合でも、外部エンジン（S3、DataLake、MySQL、PostgreSQL、Kafka など）への `INSERT` は許可されます。




## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />内部 DNS キャッシュを無効にします。Kubernetes など、インフラが頻繁に変化するシステムで ClickHouse を運用する場合に推奨されます。



## disable&#95;tunneling&#95;for&#95;https&#95;requests&#95;over&#95;http&#95;proxy

デフォルトでは、`HTTP` プロキシ経由で `HTTPS` リクエストを送信する際、トンネリング（つまり `HTTP CONNECT`）が使用されます。この設定でトンネリングを無効化できます。

**no&#95;proxy**

デフォルトでは、すべてのリクエストがプロキシを経由します。特定のホストに対してプロキシ経由を無効化するには、`no_proxy` 変数を設定する必要があります。
これは、list resolver と remote resolver では `<proxy>` 句の中で、environment resolver では環境変数として設定できます。
IP アドレス、ドメイン、サブドメインに加え、完全にバイパスするためのワイルドカード `'*'` をサポートします。curl と同様に、先頭のドットは取り除かれます。

**Example**

次の設定では、`clickhouse.cloud` およびそのすべてのサブドメイン（例: `auth.clickhouse.cloud`）へのリクエストはプロキシを経由しません。
GitLab に対しても同様で、先頭にドットが付いていても同じ挙動になります。`gitlab.com` と `about.gitlab.com` の両方がプロキシをバイパスします。

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

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限を超える接続は、保持期間が大幅に短くなります。この制限はディスクへの接続に適用されます。



## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="30000" />この上限を超えると、使用後に接続はリセットされます。接続キャッシュを無効にするには 0 を設定します。この上限はディスク接続に適用されます。



## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />使用中の接続数がこの制限を超えると、警告メッセージがログに書き込まれます。この制限はディスクへの接続に適用されます。



## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />
テーブル、データベース、テーブル関数、およびディクショナリに対する `SHOW` および `SELECT` クエリでシークレットを表示するかどうかを切り替えます。

シークレットを表示したいユーザーは、
[`format_display_secrets_in_show_and_select` フォーマット設定](../settings/formats#format_display_secrets_in_show_and_select)
を有効にし、
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限
を付与されている必要があります。

設定可能な値:

- `0` — 無効。
- `1` — 有効。




## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client} 

<SettingsInfoBlock type="Bool" default_value="1" />キャッシュサーバーがクライアントから受信したスロットリング設定を適用するかどうか。



## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />分散キャッシュが空き状態として確保しておこうとするアクティブ接続数のソフトリミットです。空き接続数が distributed_cache_keep_up_free_connections_ratio * max_connections を下回ると、空き接続数がこの閾値を上回るまで、最後にアクティビティが発生してからの経過時間が最も長い接続から順に閉じられます。



## distributed&#95;ddl

クラスタ上で [分散 DDL クエリ](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）の実行を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) が有効化されている場合にのみ機能します。

`<distributed_ddl>` 内で設定可能な項目は次のとおりです。

| Setting                | Description                                                                         | Default Value                 |
| ---------------------- | ----------------------------------------------------------------------------------- | ----------------------------- |
| `path`                 | DDL クエリ用の `task_queue` に対応する Keeper 上のパス                                            |                               |
| `profile`              | DDL クエリの実行に使用されるプロファイル                                                              |                               |
| `pool_size`            | 同時に実行できる `ON CLUSTER` クエリの数                                                         |                               |
| `max_tasks_in_queue`   | キュー内に保持できるタスクの最大数                                                                   | `1,000`                       |
| `task_max_lifetime`    | ノードの存続時間がこの値を超えた場合に、そのノードを削除します。                                                    | `7 * 24 * 60 * 60`（秒換算で 1 週間） |
| `cleanup_delay_period` | 直近のクリーンアップが `cleanup_delay_period` 秒よりも前に実行されている場合に、新しいノードイベントを受信した後でクリーンアップを開始します。 | `60` 秒                        |

**例**

```xml
<distributed_ddl>
    <!-- ZooKeeper内のDDLクエリキューへのパス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- DDLクエリの実行に使用されるプロファイルの設定 -->
    <profile>default</profile>

    <!-- ON CLUSTERクエリの同時実行数を制御します -->
    <pool_size>1</pool_size>

    <!--
         クリーンアップ設定（アクティブなタスクは削除されません）
    -->

    <!-- タスクのTTLを制御します（デフォルト: 1週間） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- クリーンアップの実行間隔を制御します（秒単位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- キューに保持できるタスク数を制御します -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```


## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles} 

<SettingsInfoBlock type="Bool" default_value="0" />有効にすると、ON CLUSTER クエリはリモートシャード上での実行時に、実行元のユーザーおよびロールを保持して使用します。これによりクラスタ全体で一貫したアクセス制御が実現されますが、そのユーザーおよびロールがすべてのノードに存在している必要があります。



## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />ホスト名を IPv4 アドレスに解決することを許可します。



## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />IPv6 アドレスへの名前解決を許可します。



## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />内部 DNS キャッシュに格納されるエントリの最大数。



## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />内部 DNS キャッシュの更新間隔（秒）。



## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />あるホスト名が ClickHouse の DNS キャッシュから削除されるまでに許容される DNS 解決失敗の最大回数。



## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />分散キャッシュを削除する際に使用されるスレッドプールのサイズ。



## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />分散キャッシュの削除に使用されるスレッドプールのキューサイズ。



## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Azure SDK からのログ出力を有効にします



## encryption

[encryption codecs](/sql-reference/statements/create/table#encryption-codecs) で使用するキーを取得するためのコマンドを構成します。キー（複数可）は環境変数で指定するか、設定ファイルで設定する必要があります。

キーは長さ 16 バイトの 16 進数値または文字列でなければなりません。

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
キーを設定ファイルに保存することは推奨されません。安全ではないためです。キーは安全なディスク上の別の設定ファイルに移動し、その設定ファイルへのシンボリックリンクを `config.d/` フォルダに配置できます。
:::

キーが16進数表現である場合の、設定ファイルからの読み込み:

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

ここでは `current_key_id` で暗号化に使用する現在のキーを指定し、指定したすべてのキーを復号に使用できます。

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

また、ユーザーは長さ 12 バイトの nonce を追加できます（デフォルトでは、暗号化および復号処理では、すべてゼロバイトの nonce が使用されます）:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または 16進数で指定できます：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
上記で説明した内容は、`aes_256_gcm_siv` にもすべて適用できます（ただしキーは 32 バイトである必要があります）。
:::


## error&#95;log

デフォルトでは無効になっています。

**有効化**

エラー履歴の収集 [`system.error_log`](../../operations/system-tables/error_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/error_log.xml` を作成します。

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
入力のパース用スレッドプールにスケジュールできるジョブの最大数。

:::note
`0` の値は無制限を意味します。
:::




## format&#95;schema&#95;path

[CapnProto](/interfaces/formats/CapnProto) フォーマットなどの入力データ用スキーマファイルを含むディレクトリへのパスです。

**例**

```xml
<!-- 各種入力形式のスキーマファイルを格納するディレクトリ。 -->
<format_schema_path>format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />グローバルプロファイラにおける CPU クロックタイマーの周期（ナノ秒単位）です。CPU クロックグローバルプロファイラを無効にするには、値 0 を設定します。推奨値は、単一クエリのプロファイリングには少なくとも 10000000（1 秒間に 100 回）、クラスタ全体のプロファイリングには 1000000000（1 秒に 1 回）です。



## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />グローバルプロファイラの実時間クロックタイマーの周期（ナノ秒単位）。実時間グローバルプロファイラを無効にするには、値を 0 に設定します。推奨値は、単一クエリの場合は少なくとも 10000000（1 秒あたり 100 回）、クラスタ全体のプロファイリングの場合は 1000000000（1 秒に 1 回）です。



## google&#95;protos&#95;path

Protobuf 型の proto ファイルを含むディレクトリを指定します。

例:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## graphite

[Graphite](https://github.com/graphite-project) へデータを送信します。

設定:

* `host` – Graphite サーバー。
* `port` – Graphite サーバーのポート。
* `interval` – 送信間隔（秒）。
* `timeout` – データ送信のタイムアウト（秒）。
* `root_path` – キーのプレフィックス。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからデータを送信。
* `events` – [system.events](/operations/system-tables/events) テーブルから、指定期間に蓄積された差分データを送信。
* `events_cumulative` – [system.events](/operations/system-tables/events) テーブルから累積データを送信。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルからデータを送信。

複数の `<graphite>` 句を設定できます。たとえば、異なるデータを異なる間隔で送信する用途に利用できます。

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


## graphite&#95;rollup

Graphite のデータを間引くための設定です。

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


## hsts&#95;max&#95;age

HSTS の有効期限を秒単位で指定します。

:::note
`0` を指定すると、ClickHouse は HSTS を無効化します。正の数値を設定すると HSTS が有効化され、max-age は設定した数値になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この制限を超えた接続は、有効期間が大幅に短くなります。この制限は、いずれのディスクやストレージにも属さない HTTP 接続に適用されます。



## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限を超えた接続は、使用後にリセットされます。接続キャッシュを無効にするには 0 を設定します。この制限は、いずれのディスクやストレージにも紐づけられていない HTTP 接続に適用されます。



## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />使用中の接続数がこの制限値を超えた場合、警告メッセージがログに書き込まれます。この制限は、ディスクやストレージのいずれにも属さない HTTP 接続に適用されます。



## http&#95;handlers

カスタム HTTP ハンドラーを使用できるようにします。
新しい HTTP ハンドラーを追加するには、新しい `<rule>` を追加するだけです。
ルールは定義された順に上からチェックされ、
最初にマッチしたもののハンドラーが実行されます。

以下の設定はサブタグによって構成できます:

| Sub-tags             | Definition                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `url`                | リクエスト URL にマッチさせます。正規表現マッチを使用するには、プレフィックスとして &#39;regex:&#39; を付与します（任意）                        |
| `methods`            | リクエストメソッドにマッチさせます。複数のメソッドを指定する場合はカンマ区切りで指定します（任意）                                               |
| `headers`            | リクエストヘッダーにマッチさせます。各子要素（子要素名がヘッダー名）ごとにマッチさせ、正規表現マッチを使用するにはプレフィックスとして &#39;regex:&#39; を付与します（任意） |
| `handler`            | リクエストハンドラー                                                                                      |
| `empty_query_string` | URL にクエリ文字列が存在しないことをチェックします                                                                     |

`handler` には以下の設定が含まれており、サブタグによって構成できます:

| Sub-tags           | Definition                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | リダイレクト先の場所                                                                                                                             |
| `type`             | サポートされるタイプ: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                          |
| `status`           | static タイプと併用し、レスポンスのステータスコードを指定します                                                                                                    |
| `query_param_name` | dynamic&#95;query&#95;handler タイプと併用し、HTTP リクエストパラメータから `<query_param_name>` に対応する値を抽出して実行します                                          |
| `query`            | predefined&#95;query&#95;handler タイプと併用し、ハンドラーが呼び出されたときにクエリを実行します                                                                      |
| `content_type`     | static タイプと併用し、レスポンスの Content-Type を指定します                                                                                              |
| `response_content` | static タイプと併用し、クライアントに送信するレスポンスコンテンツを指定します。プレフィックスに &#39;file://&#39; または &#39;config://&#39; を使用すると、ファイルまたは設定からコンテンツを取得してクライアントに送信します |

ルールの一覧に加えて、すべてのデフォルトハンドラーを有効にする `<defaults/>` を指定できます。

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


## http&#95;options&#95;response

`OPTIONS` HTTP リクエストのレスポンスにヘッダーを追加するために使用します。
`OPTIONS` メソッドは、CORS プリフライト リクエストを行う際に使用されます。

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


## http&#95;server&#95;default&#95;response

ClickHouse の HTTP(S) サーバーにアクセスしたときに、デフォルトで表示されるページです。
デフォルト値は &quot;Ok.&quot;（末尾に改行（LF）付き）です。

**例**

`http://localhost: http_port` にアクセスしたときに `https://tabix.io/` が開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Iceberg カタログ用バックグラウンドスレッドプールのサイズ



## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Iceberg カタログプールに投入可能なタスクの最大数



## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />iceberg メタデータファイルキャッシュの最大エントリ数。0 の場合は無効になります。



## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Iceberg メタデータファイルのキャッシュポリシー名。



## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Iceberg メタデータキャッシュの最大サイズ（バイト単位）。0 を指定すると無効になります。



## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />SLRU ポリシーの場合、iceberg メタデータキャッシュにおける保護キューのサイズがキャッシュ全体サイズに対して占める割合。



## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />
true の場合、ClickHouse は `CREATE VIEW` クエリ内で空の SQL security ステートメントに対するデフォルト値を記録しません。

:::note
この設定は移行期間中にのみ必要であり、24.4 で廃止される予定です。
:::




## include&#95;from

置換定義を含むファイルへのパスです。XML 形式と YAML 形式の両方がサポートされています。

詳細については、「[設定ファイル](/operations/configuration-files)」セクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリインデックスのマークキャッシュポリシー名。



## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
インデックスマーク用キャッシュの最大サイズ。

:::note

`0` を指定すると無効になります。

この設定は実行時に変更でき、即座に反映されます。
:::




## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />セカンダリインデックスマークキャッシュにおける保護キュー（SLRU ポリシーの場合）のサイズを、キャッシュ全体に対する比率で指定します。



## セカンダリインデックス非圧縮キャッシュポリシー {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリインデックスの非圧縮キャッシュ用のポリシー名。



## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
圧縮されていない `MergeTree` インデックスブロック用キャッシュの最大サイズです。

:::note
値が `0` の場合は無効になります。

この設定は実行時に変更でき、変更は直ちに反映されます。
:::




## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />セカンダリインデックスの非圧縮キャッシュにおける保護キュー（SLRU ポリシーの場合）のサイズを、そのキャッシュの総サイズに対する比率で指定します。



## interserver&#95;http&#95;credentials

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)時に他のサーバーへ接続する際に使用されるユーザー名とパスワードです。加えて、サーバーはこれらの認証情報を用いて他のレプリカを認証します。
そのため、`interserver_http_credentials` はクラスター内のすべてのレプリカで同一である必要があります。

:::note

* 既定では、`interserver_http_credentials` セクションを省略した場合、レプリケーション時に認証は使用されません。
* `interserver_http_credentials` の設定は、ClickHouse クライアント認証情報の[設定](../../interfaces/cli.md#configuration_files)とは関係ありません。
* これらの認証情報は、`HTTP` および `HTTPS` によるレプリケーションで共通です。
  :::

次の設定はサブタグで指定できます。

* `user` — ユーザー名。
* `password` — パスワード。
* `allow_empty` — `true` の場合、認証情報が設定されていても、他のレプリカが認証なしで接続することを許可します。`false` の場合、認証なしの接続は拒否されます。既定値: `false`。
* `old` — 認証情報ローテーション時に使用されていた古い `user` と `password` を含みます。複数の `old` セクションを指定できます。

**認証情報のローテーション**

ClickHouse は、すべてのレプリカを同時に停止して設定を更新することなく、インターサーバー認証情報の動的なローテーションをサポートします。認証情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、認証情報を追加します。これにより、認証ありおよび認証なしの両方の接続が許可されます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカの設定が完了したら、`allow_empty` を `false` に設定するか、この設定を削除してください。これにより、新しい認証情報での認証が必須になります。

既存の認証情報を変更するには、ユーザー名とパスワードを `interserver_http_credentials.old` セクションに移動し、`user` と `password` を新しい値に更新します。この時点で、サーバーは他のレプリカへの接続には新しい認証情報を使用し、接続の受け入れ時には新旧どちらの認証情報も受け付けます。

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


## interserver&#95;http&#95;host

他のサーバーがこのサーバーへアクセスする際に使用するホスト名です。

省略した場合は、`hostname -f` コマンドと同様に決定されます。

特定のネットワークインターフェイスに依存しないようにする場合に便利です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver&#95;http&#95;port

ClickHouse サーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver&#95;https&#95;host

[`interserver_http_host`](#interserver_http_host) と同様ですが、このホスト名は、他のサーバーが `HTTPS` 経由でこのサーバーにアクセスするために使用されます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver&#95;https&#95;port

`HTTPS` 経由で ClickHouse サーバー間のデータを交換するためのポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver&#95;listen&#95;host

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
IO スレッドプールにスケジュールできるジョブ数の最大値。

:::note
値が `0` の場合は無制限を意味します。
:::




## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />jemalloc によるサンプリング済みのアロケーションを system.trace_log に保存する



## jemalloc_enable_background_threads {#jemalloc_enable_background_threads} 

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc のバックグラウンドスレッドを有効にします。jemalloc はバックグラウンドスレッドを使って未使用のメモリページをクリーンアップします。これを無効にすると、パフォーマンスが低下する可能性があります。



## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />すべてのスレッドで jemalloc のアロケーションプロファイラを有効にします。jemalloc はアロケーションをサンプリングし、サンプリングされたアロケーションに対するすべての解放を追跡します。
プロファイルは、アロケーション解析に使用できる `SYSTEM JEMALLOC FLUSH PROFILE` を用いてフラッシュできます。
サンプルは、設定 `jemalloc_collect_global_profile_samples_in_trace_log` またはクエリ設定 `jemalloc_collect_profile_samples_in_trace_log` を使用して `system.trace_log` に保存することもできます。
[Allocation Profiling](/operations/allocation-profiling) を参照してください。



## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />グローバルなピークメモリ使用量が jemalloc_flush_profile_interval_bytes バイト増加するたびに、jemalloc プロファイルがフラッシュされます



## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded} 

<SettingsInfoBlock type="Bool" default_value="0" />総メモリ超過エラー発生時に jemalloc プロファイルのフラッシュが行われます



## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />作成する jemalloc バックグラウンドスレッドの最大数です。0 に設定すると jemalloc のデフォルト値を使用します



## keep&#95;alive&#95;timeout

<SettingsInfoBlock type="Seconds" default_value="30" />

HTTP プロトコルで、ClickHouse が接続を閉じる前に受信リクエストを待機する秒数です。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts {#keeper_hosts} 

動的な設定です。ClickHouse が接続候補とする [Zoo]Keeper ホストの集合を含みます。`<auxiliary_zookeepers>` の情報は含まれません。



## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
バッチ処理をサポートしている [Zoo]Keeper への MultiRead リクエストにおけるバッチの最大サイズ。0 に設定した場合、バッチ処理は無効になります。ClickHouse Cloud でのみ利用可能です。




## ldap_servers {#ldap_servers} 

接続パラメータ付きで LDAP サーバーをここに列挙します。これにより、次のことが可能になります:
- `password` の代わりに `ldap` 認証メカニズムが指定された専用のローカルユーザーの認証手段として使用する
- リモートユーザーディレクトリとして使用する

次の設定はサブタグで構成できます:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP サーバーのホスト名または IP。必須パラメータであり、空にはできません。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP サーバーポート。`enable_tls` が true の場合のデフォルトは 636、それ以外の場合は `389` です。                                                                                                                                                                                                                                                                                                                                          |
| `bind_dn`                      | バインドする DN を構築するために使用されるテンプレート。最終的な DN は、各認証試行時にテンプレート中のすべての `\{user_name\}` 部分文字列を実際のユーザー名で置き換えることによって構築されます。                                                                                                                                                                                                                               |
| `user_dn_detection`            | バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータを含むセクション。これは主に、サーバーが Active Directory の場合のロールマッピングに用いる検索フィルターで使用されます。結果として得られるユーザー DN は、許可されている場所で `\{user_dn\}` 部分文字列を置き換える際に使用されます。デフォルトではユーザー DN は bind DN と同一に設定されますが、一度検索が実行されると、検出された実際のユーザー DN の値に更新されます。 |
| `verification_cooldown`        | 正常にバインドが行われた後、その後のすべてのリクエストに対して LDAP サーバーへ接続することなく、ユーザーが認証済みであるとみなされる秒数。キャッシュを無効にし、各認証リクエストごとに LDAP サーバーへの接続を強制するには、`0`（デフォルト）を指定します。                                                                                                                  |
| `enable_tls`                   | LDAP サーバーへの安全な接続の使用を有効にするフラグ。プレーンテキストの (`ldap://`) プロトコル（非推奨）を使用するには `no` を指定します。SSL/TLS 上の LDAP (`ldaps://`) プロトコル（推奨、デフォルト）を使用するには `yes` を指定します。レガシーな StartTLS プロトコル（プレーンテキスト (`ldap://`) プロトコルから TLS へアップグレード）を使用するには `starttls` を指定します。                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLS の最小プロトコルバージョン。指定可能な値は: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）。                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`             | SSL/TLS ピア証明書の検証動作。指定可能な値は: `never`, `allow`, `try`, `demand`（デフォルト）。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 証明書鍵ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | CA 証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 許可される暗号スイート（OpenSSL 表記）。                                                                                                                                                                                                                                                                                                                                                                                              |

`user_dn_detection` 設定はサブタグで構成できます:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP 検索用のベース DN を構築するために使用されるテンプレート。最終的な DN は、LDAP 検索中にテンプレート中のすべての `\{user_name\}` および `\{bind_dn\}` 部分文字列を、実際のユーザー名および bind DN で置き換えることによって構築されます。                                                                                                       |
| `scope`         | LDAP 検索のスコープ。指定可能な値は: `base`, `one_level`, `children`, `subtree`（デフォルト）。                                                                                                                                                                                                                                       |
| `search_filter` | LDAP 検索用の検索フィルターを構築するために使用されるテンプレート。最終的なフィルターは、LDAP 検索中にテンプレート中のすべての `\{user_name\}`, `\{bind_dn\}`, `\{base_dn\}` 部分文字列を、実際のユーザー名、bind DN、および base DN で置き換えることによって構築されます。特別な文字は XML 内で適切にエスケープされている必要がある点に注意してください。  |

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

例（以降のロールマッピングのためにユーザー DN 検出を設定した典型的な Active Directory）:

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



## listen&#95;backlog

listen ソケットのバックログ（保留中接続のキューサイズ）。デフォルト値の `4096` は Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)) と同じです。

通常、この値を変更する必要はありません。理由は次のとおりです。

* デフォルト値が十分に大きいこと、
* クライアントからの接続を受け付ける処理はサーバーの別スレッドで行われること。

そのため、`nstat` の `TcpExtListenOverflows` が 0 以外で、このカウンタが ClickHouse サーバーに対して増加していたとしても、必ずしもこの値を増やす必要があることを意味しません。理由は次のとおりです。

* 通常、`4096` で足りない場合は ClickHouse の内部スケーリングの問題を示しているため、issue として報告した方がよいです。
* それはサーバーが後からより多くの接続を処理できることを意味しません（仮に処理できたとしても、その時点ではクライアントがすでにいない、あるいは切断されている可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen&#95;host

リクエストを受け付けるホストを制限する設定です。すべてのホストからのリクエストにサーバーで応答させたい場合は、`::` を指定します。

例:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen&#95;reuse&#95;port

同一のアドレスとポート番号で複数のサーバーが待ち受けできるようにします。リクエストはオペレーティングシステムによってランダムに選ばれたサーバーへルーティングされます。この設定を有効化することは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

型:

デフォルト:


## listen&#95;try

サーバーは、リッスンを試みている際に IPv6 または IPv4 ネットワークが利用できなくても終了しません。

**例**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />マーク読み込み用のバックグラウンドプールのサイズ



## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />プリフェッチプールに投入可能なタスクの最大数



## logger {#logger} 

ログメッセージの出力場所とフォーマットを設定します。

**キー**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | ログレベル。指定可能な値: `none` (ログ出力を無効化)、`fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                 |
| `log`                  | ログファイルへのパス。                                                                                                                                          |
| `errorlog`             | エラーログファイルへのパス。                                                                                                                                    |
| `size`                 | ローテーションポリシー: ログファイルの最大サイズ (バイト単位)。ログファイルサイズがこのしきい値を超えると、名前が変更されてアーカイブされ、新しいログファイルが作成されます。 |
| `count`                | ローテーションポリシー: ClickHouse で保持される履歴ログファイルの最大数。                                                                                        |
| `stream_compress`      | LZ4 を使用してログメッセージを圧縮します。有効にするには `1` または `true` を設定します。                                                                       |
| `console`              | コンソールへのログ出力を有効にします。有効にするには `1` または `true` を設定します。ClickHouse がデーモンモードで動作していない場合のデフォルトは `1`、それ以外は `0` です。                            |
| `console_log_level`    | コンソール出力用のログレベル。デフォルトは `level` の値です。                                                                                                    |
| `formatting.type`      | コンソール出力のログフォーマット。現在は `json` のみサポートされています。                                                                                       |
| `use_syslog`           | ログ出力を syslog にも転送します。                                                                                                                                |
| `syslog_level`         | syslog へのログ出力時のログレベル。                                                                                                                               |
| `async`                | `true` (デフォルト) の場合、ログは非同期に出力されます (出力チャネルごとに 1 本のバックグラウンドスレッド)。それ以外の場合は、LOG を呼び出したスレッド内でログを出力します。           |
| `async_queue_max_size` | 非同期ログ出力を使用する場合、書き出し待ちキューに保持されるメッセージ数の最大値。超過したメッセージは破棄されます。                                           |
| `startup_level`        | サーバー起動時にルートロガーのレベルを設定するために使用される起動レベル。起動後はログレベルが `level` 設定値に戻されます。                                        |
| `shutdown_level`       | サーバーのシャットダウン時にルートロガーのレベルを設定するために使用されるシャットダウンレベル。                                                                  |

**ログフォーマット指定子**

`log` および `errorLog` パス内のファイル名では、生成されるファイル名に対して以下の書式指定子を使用できます (ディレクトリ部分では使用できません)。

「Example」列は、`2023-07-06 18:32:07` 時点での出力例を示します。



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

ログメッセージをコンソールのみに出力するには：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個々のログ名ごとにログレベルをオーバーライドできます。たとえば、ロガー「Backup」と「RBAC」のすべてのメッセージを出力しないようにするには、次のようにします。

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

ログメッセージを `syslog` にも出力するには、次のように設定します。

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
| `address`  | `host\[:port\]` 形式の syslog アドレス。省略した場合はローカルデーモンが使用されます。                                                                                                                                                                      |
| `hostname` | ログを送信するホストの名前（任意）。                                                                                                                                                                                                           |
| `facility` | syslog の [facility キーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。すべて大文字で、先頭に `"LOG_"` プレフィックスを付けて指定する必要があります（例: `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` など）。デフォルト: `address` が指定されている場合は `LOG_USER`、それ以外は `LOG_DAEMON`。 |
| `format`   | ログメッセージの形式。指定可能な値: `bsd` および `syslog`。                                                                                                                                                                                       |

**ログ形式**

コンソールログに出力されるログ形式を指定できます。現在は JSON のみがサポートされています。

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
  "message": "シグナル2を受信",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

JSON ログのサポートを有効にするには、次のスニペットを使用してください。

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- チャネル単位(log、errorlog、console、syslog)で設定するか、全チャネルに対してグローバルに設定可能です(グローバル設定の場合は省略してください)。 -->
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

キー名は、`<names>` タグ内のタグの値を変更することで変更できます。たとえば、`DATE_TIME` を `MY_DATE_TIME` に変更するには、`<date_time>MY_DATE_TIME</date_time>` と指定します。

**JSON ログのキーの省略**

ログプロパティは、そのプロパティをコメントアウトすることで省略できます。たとえば、ログに `query_id` を出力したくない場合は、`<query_id>` タグをコメントアウトします。


## macros

レプリケートテーブル用のパラメータマクロです。

レプリケートテーブルを使用しない場合は省略可能です。

詳細については、[レプリケートテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)を参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```


## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />マークキャッシュのポリシー名。



## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />マークキャッシュの合計サイズのうち、プリウォームで事前に埋めておく割合。



## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
[`MergeTree`](/engines/table-engines/mergetree-family) ファミリーのテーブルにおけるマーク（インデックス）キャッシュの最大サイズ。

:::note
この設定は実行時に変更でき、すぐに有効になります。
:::




## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />SLRU ポリシー使用時に、マークキャッシュ内の保護キューのサイズを、キャッシュ全体サイズに対する比率で指定します。



## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />起動時にアクティブなデータパーツ集合（Active のもの）を読み込むためのスレッド数。



## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />
1 人のユーザーについて、作成または変更時に設定できる認証方式の最大数です。
この設定を変更しても、既存のユーザーには影響しません。認証に関連する create/alter クエリがこの設定で指定された上限を超えると、クエリは失敗します。
認証に関係しない create/alter クエリは成功します。

:::note
値を `0` にすると無制限になります。
:::




## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上で実行されるすべてのバックアップの最大読み取り速度（1 秒あたりのバイト数）。0 は無制限を意味します。



## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Backups IO スレッドプール内のアイドル状態のスレッド数が `max_backup_io_thread_pool_free_size` を超える場合、ClickHouse はアイドル状態のスレッドによって占有されているリソースを解放し、プールサイズを縮小します。必要に応じてスレッドは再作成されます。



## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse は S3 バックアップの I/O 処理を行うために Backups IO Thread プールのスレッドを使用します。`max_backups_io_thread_pool_size` は、このプール内のスレッド数の上限を設定します。



## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
ベクトルインデックスを構築する際に使用するスレッド数の上限。

:::note
値が `0` の場合は、すべてのコアを使用します。
:::




## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に実行できる `INSERT` クエリの総数の上限。

:::note

`0`（デフォルト）の場合は無制限を意味します。

この設定は実行時に変更でき、即座に反映されます。すでに実行中のクエリには影響しません。
:::




## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に実行できるクエリの総数の上限です。`INSERT` および `SELECT` クエリの上限や、ユーザーごとの最大クエリ数の上限も合わせて考慮する必要があります。

あわせて参照:
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

`0`（デフォルト）の場合は無制限を意味します。

この設定は実行時に変更可能で、直ちに反映されます。すでに実行中のクエリには影響しません。
:::




## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に実行できる `SELECT` クエリの総数の上限。

:::note

`0`（デフォルト）の場合は無制限を意味します。

この設定は実行時に変更でき、直ちに反映されます。すでに実行中のクエリには影響しません。
:::




## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />サーバーの最大接続数。



## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />データベースの数がこの値を超えると、サーバーは例外をスローします。0 は制限なしを意味します。



## max&#95;database&#95;num&#95;to&#95;warn

<SettingsInfoBlock type="UInt64" default_value="1000" />

アタッチされているデータベースの数が指定した値を超えると、ClickHouseサーバーが警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />DatabaseReplicated において、レプリカ復旧中にテーブルを作成するために使用するスレッド数です。0 を指定すると、スレッド数はコア数と同じになります。



## max&#95;dictionary&#95;num&#95;to&#95;throw

<SettingsInfoBlock type="UInt64" default_value="0" />

辞書の数がこの値より大きい場合、サーバーは例外を発生させます。

次のデータベースエンジンのテーブルのみを数えます:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
値を `0` に設定すると、制限がなくなります。
:::

**例**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```


## max&#95;dictionary&#95;num&#95;to&#95;warn

<SettingsInfoBlock type="UInt64" default_value="1000" />

アタッチされているディクショナリの数が指定値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーの分散キャッシュからの合計読み取り速度の最大値（秒あたりのバイト数）。0 は無制限を意味します。



## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーにおける分散キャッシュへの合計書き込み帯域幅の上限（1 秒あたりのバイト数）。0 は無制限を意味します。



## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />集約時に収集されるハッシュテーブル統計情報に含めることができるエントリ数の上限



## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITION 操作に使用するスレッド数。



## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
入力のパースに使用するスレッドプールに保持しておく、アイドル状態の待機スレッドの最大数。




## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
入力データのパースに使用するスレッドの合計最大数。




## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
IO スレッドプール内の**アイドル状態の**スレッド数が `max_io_thread_pool_free_size` を超えた場合、ClickHouse はアイドル状態のスレッドによって占有されているリソースを解放し、プールサイズを縮小します。必要に応じてスレッドは再作成されます。




## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse は I/O スレッドプール内のスレッドを使用して、一部の I/O 処理（例：S3 とのやり取り）を実行します。`max_io_thread_pool_size` は、このプール内のスレッド数の上限を設定します。




## max&#95;keep&#95;alive&#95;requests

<SettingsInfoBlock type="UInt64" default_value="10000" />

1 つの keep-alive 接続で、ClickHouse サーバーによって接続がクローズされるまでに処理されるリクエストの最大数。

**例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
ローカルでの読み取りの最大速度を、1 秒あたりのバイト数で指定します。

:::note
`0` を指定すると無制限になります。
:::




## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
ローカル書き込みの最大速度（1 秒あたりのバイト数）。

:::note
値が `0` の場合は無制限を意味します。
:::




## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />
1つのテーブルに関連付けられるマテリアライズドビューの数の上限。

:::note
この設定ではテーブルに直接依存するビューのみが対象であり、あるビューを基に別のビューを作成する場合は考慮されません。
:::




## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべてのマージ処理に対する最大読み取り速度（1 秒あたりのバイト数）。0 の場合は無制限です。



## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバー上のすべてのミューテーションの最大読み取り速度を、1 秒あたりのバイト数で指定します。0 の場合は無制限です。



## max&#95;named&#95;collection&#95;num&#95;to&#95;throw

<SettingsInfoBlock type="UInt64" default_value="0" />

名前付きコレクションの数がこの値を超えると、サーバーは例外を送出します。

:::note
`0` の値は制限なしを意味します。
:::

**例**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max&#95;named&#95;collection&#95;num&#95;to&#95;warn

<SettingsInfoBlock type="UInt64" default_value="1000" />

名前付きコレクションの数が指定された値を超えた場合、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max&#95;open&#95;files

同時に開くことができるファイル数の上限。

:::note
`getrlimit()` 関数が誤った値を返すため、macOS ではこのオプションを使用することを推奨します。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```


## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
接続を切断するかどうかを判断するための、OS の CPU 待機時間（`OSCPUWaitMicroseconds` メトリクス）とビジー時間（`OSCPUVirtualTimeMicroseconds` メトリクス）の最大比率です。確率を計算するために、最小値と最大値の間で線形補間が行われ、この値では確率が 1 になります。
詳細は [サーバー CPU 過負荷時の動作制御](/operations/settings/server-overload) を参照してください。




## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />起動時に非アクティブなデータパーツ（古いパーツ）の集合を読み込むためのスレッド数。



## max&#95;part&#95;num&#95;to&#95;warn

<SettingsInfoBlock type="UInt64" default_value="100000" />

アクティブなパーツの数が指定された値を超えた場合、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max&#95;partition&#95;size&#95;to&#95;drop

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

パーティション削除に関する制限。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが [`max_partition_size_to_drop`](#max_partition_size_to_drop)（バイト単位）を超える場合、[DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) クエリを使用してパーティションを削除することはできません。
この設定は ClickHouse サーバーの再起動なしで反映されます。この制限を無効にする別の方法として、`<clickhouse-path>/flags/force_drop_table` ファイルを作成する方法があります。

:::note
値 `0` は、パーティションを制限なく削除できることを意味します。

この制限は DROP TABLE および TRUNCATE TABLE には適用されません。[max&#95;table&#95;size&#95;to&#95;drop](/operations/settings/settings#max_table_size_to_drop) を参照してください。
:::

**例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />非アクティブなデータパーツを同時に削除するためのスレッド数。



## max&#95;pending&#95;mutations&#95;execution&#95;time&#95;to&#95;warn

<SettingsInfoBlock type="UInt64" default_value="86400" />

保留中の mutation のいずれかが設定値（秒）を超えた場合、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max&#95;pending&#95;mutations&#95;to&#95;warn

<SettingsInfoBlock type="UInt64" default_value="500" />

保留中のミューテーションの数が指定された値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
prefixes のデシリアライズ用スレッドプール内の**アイドル**スレッド数が `max_prefixes_deserialization_thread_pool_free_size` を超えた場合、ClickHouse はそれらのスレッドが占有しているリソースを解放し、プールのサイズを縮小します。必要に応じてスレッドは再び作成されます。




## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse は、MergeTree の Wide 形式パーツ内のファイルプレフィックスから列およびサブ列のメタデータを並列に読み取るために、prefixes のデシリアライズ用スレッドプールのスレッドを使用します。`max_prefixes_deserialization_thread_pool_size` は、このプール内のスレッド数の最大値を設定します。




## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
読み取り時にネットワーク経由でデータを送受信する際の最大速度（1 秒あたりのバイト数）です。

:::note
値が `0`（デフォルト）の場合は、無制限を意味します。
:::




## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
書き込み時におけるネットワーク経由のデータ交換の最大速度（1 秒あたりのバイト数）。

:::note
`0`（デフォルト）の場合は無制限を意味します。
:::




## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケートフェッチにおけるネットワーク経由のデータ交換速度の上限（1秒あたりのバイト数）。0 は無制限を意味します。



## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />レプリケート送信における、ネットワーク経由でのデータ交換の最大速度（1 秒あたりのバイト数）。0 は無制限を意味します。



## max&#95;replicated&#95;table&#95;num&#95;to&#95;throw

<SettingsInfoBlock type="UInt64" default_value="0" />

レプリケートテーブルの数がこの値を超えると、サーバーは例外をスローします。

次のデータベースエンジンのテーブルのみをカウントします:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
`0` の場合は制限なしを意味します。
:::

**例**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```


## max_server_memory_usage {#max_server_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />
サーバーが使用することを許可されるメモリの最大量です。バイト単位で指定されます。

:::note
サーバーの最大メモリ消費量は、`max_server_memory_usage_to_ram_ratio` の設定によってさらに制限されます。
:::

特例として、値が `0`（デフォルト）の場合、サーバーは（`max_server_memory_usage_to_ram_ratio` によって課される追加の制限を除き）利用可能なメモリをすべて使用できます。




## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />
サーバーが使用することを許可されているメモリの最大量を、利用可能なメモリ全体に対する比率で指定します。

たとえば、値が `0.9`（デフォルト）の場合、サーバーは利用可能なメモリの 90% までを消費することができます。

メモリの少ないシステムでのメモリ使用量を抑えることができます。
RAM とスワップが少ないホストでは、[`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) を 1 より大きい値に設定する必要が生じる場合があります。

:::note
サーバーの最大メモリ使用量は、`max_server_memory_usage` の設定によってさらに制限されます。
:::




## max&#95;session&#95;timeout

セッションの最大タイムアウト時間（秒単位）。

例：

```xml
<max_session_timeout>3600</max_session_timeout>
```


## max&#95;table&#95;num&#95;to&#95;throw

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブル数がこの値を超える場合、サーバーは例外をスローします。

次の種類のテーブルはカウントされません:

* view
* remote
* dictionary
* system

次のデータベースエンジンのテーブルのみがカウントされます:

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


## max&#95;table&#95;num&#95;to&#95;warn

<SettingsInfoBlock type="UInt64" default_value="5000" />

アタッチされているテーブル数が指定された値を超えると、ClickHouse サーバーは警告メッセージを `system.warnings` テーブルに追加します。

**例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```


## max&#95;table&#95;size&#95;to&#95;drop

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

テーブルの削除に関する制限です。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが `max_table_size_to_drop`（バイト単位）を超える場合、[`DROP`](../../sql-reference/statements/drop.md) クエリや [`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリを使用して削除することはできません。

:::note
`0` を設定すると、制限なしで任意のテーブルを削除できます。

この設定を適用するために ClickHouse サーバーの再起動は不要です。制限を無効にする別の方法として、`<clickhouse-path>/flags/force_drop_table` ファイルを作成することもできます。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
外部集計、結合、ソートに使用できる一時データの最大ディスク使用量。
この制限を超えたクエリは、例外を送出して失敗します。

:::note
`0` の値は無制限を意味します。
:::

関連項目:
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)




## max&#95;thread&#95;pool&#95;free&#95;size

<SettingsInfoBlock type="UInt64" default_value="1000" />

グローバルスレッドプール内の**アイドル**スレッド数が[`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size)より大きい場合、ClickHouse は一部のスレッドによって占有されているリソースを解放し、プールサイズを縮小します。必要に応じて、スレッドは再作成されます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```


## max&#95;thread&#95;pool&#95;size

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse はクエリを処理するために、グローバルスレッドプール内のスレッドを使用します。クエリを処理するための空きスレッドがない場合、プールに新しいスレッドが作成されます。`max_thread_pool_size` はプール内のスレッド数の上限を設定します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```


## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />起動時に非アクティブな予期しないデータパーツ集合を読み込むためのスレッド数。



## max&#95;view&#95;num&#95;to&#95;throw

<SettingsInfoBlock type="UInt64" default_value="0" />

ビュー数がこの値を超えると、サーバーは例外をスローします。

次のデータベースエンジンのテーブルのみをカウント対象とします:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
値が `0` の場合は制限がありません。
:::

**例**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```


## max&#95;view&#95;num&#95;to&#95;warn

<SettingsInfoBlock type="UInt64" default_value="10000" />

アタッチされているビューの数が指定値を超えると、ClickHouseサーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に待機状態となるクエリの総数に対する上限。
待機中のクエリの実行は、必要なテーブルが非同期で読み込まれている間ブロックされます（[`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases) を参照）。

:::note
待機中のクエリは、次の設定で制御される制限をチェックする際のカウントには含まれません。

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

この調整は、サーバー起動直後にこれらの制限にすぐ達してしまうことを避けるために行われます。
:::

:::note

`0`（デフォルト）の値は無制限を意味します。

この設定は実行時に変更でき、即座に反映されます。すでに実行中のクエリには影響しません。
:::




## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />
バックグラウンドのメモリワーカーが、`jemalloc` や `cgroups` などの外部ソースからの情報に基づいて内部メモリトラッカーを補正するかどうかを制御します。




## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />
メモリ使用量が高くなった場合に、メモリトラッカーによるメモリ使用量を補正し、未使用ページをクリーンアップするバックグラウンド メモリワーカーのティック周期（ミリ秒）。0 に設定した場合、メモリ使用元の種類に応じてデフォルト値が使用されます。




## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />現在の cgroup のメモリ使用量情報を利用して、メモリトラッキングを補正します。



## merge&#95;tree

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのための詳細な設定項目です。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />
マージ処理とその他のワークロード間でのリソースの使用および共有方法を制御するために使用します。指定した値は、すべてのバックグラウンドマージに対して `workload` 設定の値として使用されます。マージツリーの設定で上書きできます。

**関連項目**
- [Workload Scheduling](/operations/workload-scheduling.md)




## merges&#95;mutations&#95;memory&#95;usage&#95;soft&#95;limit

<SettingsInfoBlock type="UInt64" default_value="0" />

マージおよびミューテーション操作を実行する際に使用が許可される RAM の上限（ソフトリミット）を設定します。
ClickHouse が設定された上限に達すると、新しいバックグラウンドのマージまたはミューテーション操作はスケジュールされなくなりますが、すでにスケジュール済みのタスクの実行は継続されます。

:::note
値が `0` の場合は無制限を意味します。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />
`merges_mutations_memory_usage_soft_limit` のデフォルト値は、`memory_amount * merges_mutations_memory_usage_to_ram_ratio` によって算出されます。

**関連項目:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)




## metric&#95;log

既定では無効です。

**有効化**

メトリクスの履歴収集機能 [`system.metric_log`](../../operations/system-tables/metric_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/metric_log.xml` を作成します。

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

`metric_log` 設定を無効化するには、以下の内容で `/etc/clickhouse-server/config.d/disable_metric_log.xml` ファイルを作成します。

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
接続の切断を検討する際の、OS の CPU 待機時間（`OSCPUWaitMicroseconds` メトリクス）とビジー時間（`OSCPUVirtualTimeMicroseconds` メトリクス）の比率における最小値です。切断確率の計算には、最小比率と最大比率の間で線形補間が使用され、この最小比率では確率は 0 になります。
詳細については、[サーバー CPU 過負荷時の動作制御](/operations/settings/server-overload) を参照してください。




## mlock&#95;executable

起動後に `mlockall` を実行し、最初のクエリのレイテンシを低減し、高い I/O 負荷時に ClickHouse の実行ファイルがページアウトされるのを防ぎます。

:::note
このオプションの有効化を推奨しますが、起動時間が最大で数秒ほど長くなります。
また、この設定は &quot;CAP&#95;IPC&#95;LOCK&quot; ケーパビリティがない場合は機能しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```


## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />
この設定は、頻繁な open/close 呼び出し（後続のページフォールトにより非常にコストが高い）を回避し、複数のスレッドおよびクエリ間でマッピングを再利用できるようにします。設定値はマッピングされた領域の数（通常はマッピングされたファイル数と等しい）です。

マッピングされたファイル内のデータ量は、次のシステムテーブルにおいて、以下のメトリクスで監視できます。

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` — [`system.metrics`](/operations/system-tables/metrics)、[`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` — [`system.events`](/operations/system-tables/events)、[`system.processes`](/operations/system-tables/processes)、[`system.query_log`](/operations/system-tables/query_log)、[`system.query_thread_log`](/operations/system-tables/query_thread_log)、[`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
マッピングされたファイル内のデータ量はメモリを直接消費せず、クエリまたはサーバーのメモリ使用量にも計上されません。これは、このメモリが OS のページキャッシュと同様に破棄可能であるためです。キャッシュは、MergeTree ファミリーのテーブルで古いパーツが削除されるタイミングで（ファイルがクローズされることで）自動的に破棄されます。また、`SYSTEM DROP MMAP CACHE` クエリを使用して手動で破棄することもできます。

この設定は実行時に変更可能であり、変更は即座に有効になります。
:::




## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />
ミューテーションと他のワークロード間で、リソースの利用・共有を制御するために使用します。指定した値は、すべてのバックグラウンドミューテーションに対して `workload` 設定値として使用されます。MergeTree の設定で上書きできます。

**関連項目**
- [Workload Scheduling](/operations/workload-scheduling.md)




## mysql&#95;port

MySQL プロトコルでクライアントと通信するためのポート。

:::note

* 正の整数を指定すると、そのポート番号で待ち受けます。
* 空の値を指定すると、MySQL プロトコルによるクライアントとの通信が無効になります。
  :::

**例**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport {#mysql_require_secure_transport} 

true に設定すると、[mysql_port](#mysql_port) 経由でクライアントとのセキュアな通信が必須となります。`--ssl-mode=none` オプションでの接続は拒否されます。[OpenSSL](#openssl) の設定と併せて使用してください。



## openSSL {#openssl} 

SSL クライアント／サーバーの構成。

SSL のサポートは `libpoco` ライブラリによって提供されます。利用可能な構成オプションについては [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) を参照してください。デフォルト値は [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) で確認できます。

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


## opentelemetry&#95;span&#95;log

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

<SettingsInfoBlock type="UInt64" default_value="1000000" />CPU が有用な処理を行っていると見なすための、OS 上の CPU のビジー時間（`OSCPUVirtualTimeMicroseconds` メトリクス）の閾値（マイクロ秒単位）。ビジー時間がこの値未満の場合は、CPU 過負荷状態とは見なされません。



## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

<SettingsInfoBlock type="Int32" default_value="0" />
分散キャッシュ TCP ハンドラーのスレッドに対する Linux の nice 値です。値が小さいほど CPU の優先度は高くなります。

CAP_SYS_NICE ケーパビリティが必要で、ない場合は効果がありません（no-op）。

取りうる値: -20 ～ 19。




## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

<SettingsInfoBlock type="Int32" default_value="0" />
マージおよびミューテーション処理用スレッドに対する Linux の nice 値。値が小さいほど CPU 優先度は高くなります。

CAP_SYS_NICE ケーパビリティが必要です。付与されていない場合は無効です。

取りうる値: -20 〜 19。




## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

<SettingsInfoBlock type="Int32" default_value="0" />
ZooKeeper クライアントの送信スレッドおよび受信スレッド用の、Linux における nice 値。値が小さいほど CPU 優先度は高くなります。

CAP_SYS_NICE ケーパビリティが必要で、付与されていない場合は何も行われません。

取りうる値: -20 ～ 19。




## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />メモリ上限に対し、ユーザースペースページキャッシュとしては使用せずに空けておく割合。Linux の `min_free_kbytes` 設定に相当します。



## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />解放されたメモリがユーザー空間のページキャッシュとして利用可能になるまでの遅延。



## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />ユーザー空間ページキャッシュの最大サイズです。キャッシュを無効にするには 0 に設定します。`page_cache_min_size` より大きい場合、キャッシュサイズはこの範囲内で継続的に調整され、利用可能なメモリを最大限活用しつつ、合計メモリ使用量が上限（`max_server_memory_usage[_to_ram_ratio]`）を下回るように保たれます。



## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />ユーザー空間ページキャッシュの最小サイズ。



## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ユーザー空間のページキャッシュポリシー名。



## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />ユーザー空間のページキャッシュをこの数のシャードに分割してストライピングし、ミューテックスの競合を減らします。実験的機能であり、性能向上はあまり見込めません。



## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />ユーザー空間ページキャッシュにおける保護キューのサイズを、キャッシュ全体のサイズに対する割合で表します。



## part&#95;log

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) に関連するログイベントを記録します。例えば、データの追加やマージなどです。ログを使用してマージアルゴリズムの動作をシミュレートし、その特性を比較できます。マージ処理を可視化することもできます。

クエリは別ファイルではなく、[system.part&#95;log](/operations/system-tables/part_log) テーブルに記録されます。このテーブル名は `table` パラメータで設定できます（以下を参照）。

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
SharedMergeTree のパーツを完全に削除するまでの猶予期間。ClickHouse Cloud でのみ利用可能です




## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />
極めて多くのテーブルが存在する場合に、`kill_delay_period` に 0 から x 秒までの一様分布に従う値を加算して、thundering herd 問題およびその結果として発生しうる ZooKeeper への DoS を回避します。ClickHouse Cloud でのみ利用可能です。




## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />
共有 MergeTree テーブルの古くなったパーツをクリーンアップするためのスレッド数です。ClickHouse Cloud でのみ利用可能です。




## path

データが格納されているディレクトリへのパス。

:::note
末尾のスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
```


## postgresql&#95;port

PostgreSQL プロトコル経由でクライアントと通信するためのポート。

:::note

* 正の整数はリッスンするポート番号を指定します。
* 空の値は、PostgreSQL プロトコル経由でのクライアントとの通信を無効にするために使用します。
  :::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

true に設定すると、[postgresql_port](#postgresql_port) を介したクライアントとの通信にはセキュアな経路が必須になります。`sslmode=disable` オプションによる接続は拒否されます。[OpenSSL](#openssl) の設定と併用してください。



## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />リモートオブジェクトストレージのプリフェッチを行うバックグラウンドプールのサイズ



## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />プリフェッチプールに投入可能なタスクの最大数



## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
prefixes deserialization スレッドプールにスケジュールできるジョブの最大数です。

:::note
`0` の場合は無制限を意味します。
:::




## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />
true の場合、ClickHouse は起動前にあらかじめ、設定されているすべての `system.*_log` テーブルを作成します。起動時に実行されるスクリプトがこれらのテーブルに依存している場合に役立ちます。




## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />プライマリインデックスキャッシュポリシーの名前。



## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />マークキャッシュ全体サイズのうち、プリウォームで事前に埋める部分の割合。



## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />プライマリインデックスキャッシュの最大サイズ（MergeTree ファミリーのテーブルで使用されるインデックス）。



## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />primary index キャッシュにおいて、（SLRU ポリシーの場合の）保護キューのサイズがキャッシュの総サイズに占める比率です。



## process&#95;query&#95;plan&#95;packet

<SettingsInfoBlock type="Bool" default_value="0" />

この設定を有効にすると、QueryPlan パケットを読み取れるようになります。これは、`serialize_query_plan` が有効な場合に、分散クエリに対して送信されるパケットです。
クエリプランのバイナリデシリアライズ処理におけるバグによって発生しうるセキュリティ上の問題を回避するため、デフォルトでは無効になっています。

**例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors&#95;profile&#95;log

[`processors_profile_log`](../system-tables/processors_profile_log.md) システムテーブルの設定です。

<SystemLogParameters />

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


## prometheus

[Prometheus](https://prometheus.io) によるスクレイプ向けにメトリクスデータを公開します。

設定項目:

* `endpoint` – Prometheus サーバーがメトリクスをスクレイプするための HTTP エンドポイント。先頭は &#39;/&#39; から開始します。
* `port` – `endpoint` 用のポート。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開します。
* `events` – [system.events](/operations/system-tables/events) テーブルからメトリクスを公開します。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開します。
* `errors` - サーバーの最後の再起動以降に発生したエラーコードごとのエラー数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。

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

確認します（`127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えてください）:

```bash
curl 127.0.0.1:9363/metrics
```


## proxy

HTTP および HTTPS リクエスト向けのプロキシサーバーを定義します。現在は S3 ストレージ、S3 テーブル関数、および URL 関数でサポートされています。

プロキシサーバーを定義する方法は 3 通りあります。

* 環境変数
* プロキシリスト
* リモートプロキシリゾルバ

特定のホストについては、`no_proxy` を使用してプロキシサーバーをバイパスすることもできます。

**Environment variables**

`http_proxy` と `https_proxy` 環境変数を使用すると、
特定のプロトコルに対してプロキシサーバーを指定できます。システム上でこれらが設定されていれば、そのまま問題なく動作します。

この方法は、特定のプロトコルに対して
プロキシサーバーが 1 つだけであり、そのプロキシサーバーが変更されない場合に最も簡単です。

**Proxy lists**

この方法では、あるプロトコル向けのプロキシサーバーを 1 つ以上指定できます。複数のプロキシサーバーが定義されている場合、
ClickHouse は各プロキシをラウンドロビン方式で使用し、サーバー間で負荷を分散します。これは、1 つのプロトコルに対して複数の
プロキシサーバーが存在し、そのプロキシサーバーのリストが変更されない場合に最も簡単な方法です。

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

下のタブから親フィールドを選択すると、その子フィールドが表示されます:

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

**リモートプロキシリゾルバ**

プロキシサーバーが動的に変更される可能性があります。
その場合、リゾルバのエンドポイントを定義できます。ClickHouse は
そのエンドポイントに空の GET リクエストを送信し、リモートリゾルバはプロキシホストを返す必要があります。
ClickHouse は、次のテンプレートを使用してプロキシ URI を組み立てる際にこれを利用します: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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
    | Field        | Description                |
    | ------------ | -------------------------- |
    | `<resolver>` | resolver のエンドポイントおよびその他の詳細 |

    :::note
    複数の `<resolver>` 要素を定義できますが、特定のプロトコルごとに使用されるのは
    最初の `<resolver>` だけです。そのプロトコルに対するその他の `<resolver>`
    要素は無視されます。つまり、必要に応じたロードバランシングはリモート側の resolver で実装する必要があります。
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

**優先順位**

プロキシ設定は、次の順序で決定されます:


| 順序 | 設定                     |
|------|--------------------------|
| 1.   | リモートプロキシリゾルバ |
| 2.   | プロキシリスト           |
| 3.   | 環境変数                 |

ClickHouse は、リクエストプロトコルに対して最も優先度の高いリゾルバタイプを参照します。定義されていない場合は、
環境変数リゾルバに到達するまで、次に優先度の高いリゾルバタイプを順に参照します。
これにより、複数種類のリゾルバタイプを組み合わせて使用することも可能です。



## query&#95;cache

[Query cache](../query-cache.md) の設定です。

利用可能な設定は次のとおりです。

| Setting                   | Description                                    | Default Value |
| ------------------------- | ---------------------------------------------- | ------------- |
| `max_size_in_bytes`       | キャッシュの最大サイズ（バイト数）。`0` の場合、クエリキャッシュは無効になります。    | `1073741824`  |
| `max_entries`             | キャッシュに保存される `SELECT` クエリ結果の最大件数。               | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存される `SELECT` クエリ結果 1 件あたりの最大サイズ（バイト数）。 | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存される `SELECT` クエリ結果 1 件あたりの最大行数。        | `30000000`    |

:::note

* 設定を変更すると即座に反映されます。
* クエリキャッシュ用のデータは DRAM に割り当てられます。メモリが逼迫している場合は、`max_size_in_bytes` を小さい値に設定するか、クエリキャッシュを無効化することを検討してください。
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
クエリ条件キャッシュの最大サイズです。
:::note
この設定は実行時に変更でき、即座に反映されます。
:::




## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />クエリ条件キャッシュ内の保護キュー（SLRU ポリシーの場合）のサイズが、キャッシュ全体サイズに対して占める比率です。



## query&#95;log

[log&#95;queries=1](../../operations/settings/settings.md) 設定で受信したクエリのログ出力に関する設定です。

クエリは個別のファイルではなく、[system.query&#95;log](/operations/system-tables/query_log) テーブルに記録されます。テーブル名は `table` パラメーターで変更できます（下記参照）。

<SystemLogParameters />

テーブルが存在しない場合は、ClickHouse によって作成されます。ClickHouse サーバーのアップデートによって query log の構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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


## query&#95;masking&#95;rules

正規表現ベースのルールで、サーバーログに保存される前のクエリおよびすべてのログメッセージに適用されます。
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブル、ならびにクライアントに送信されるログに適用されます。これにより、氏名、メールアドレス、個人識別子、クレジットカード番号など、SQL クエリに含まれる機密データがログに漏洩するのを防ぐことができます。

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

| Setting   | Description                                |
| --------- | ------------------------------------------ |
| `name`    | ルール名（省略可）                                  |
| `regexp`  | RE2 互換正規表現（必須）                             |
| `replace` | 機微データを置き換えるための文字列（省略可。指定しない場合はアスタリスク 6 文字） |

マスキングルールはクエリ全体に適用されます（不正な／パース不能なクエリから機微データが漏洩するのを防ぐため）。

[`system.events`](/operations/system-tables/events) テーブルには `QueryMaskingRulesMatch` というカウンタがあり、クエリマスキングルールにマッチした回数の総計を保持します。

分散クエリの場合は、各サーバーを個別に設定する必要があります。そうしないと、他のノードに渡されるサブクエリはマスキングされずに保存されます。


## query&#95;metric&#95;log

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

`query_metric_log` 設定を無効化するには、以下の内容で `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` ファイルを作成します。

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query&#95;thread&#95;log

[log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads) 設定で受信したクエリのスレッドをログに記録するための設定です。

クエリは個別のファイルではなく、[system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) テーブルに記録されます。テーブル名は `table` パラメータで変更できます（後述）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse はテーブルを作成します。ClickHouse サーバーを更新した際にクエリスレッドログの構造が変更されていた場合は、旧構造を持つテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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


## query&#95;views&#95;log

[log&#95;query&#95;views=1](/operations/settings/settings#log_query_views) 設定付きで受信したクエリに応じて、ビュー（ライブビュー、マテリアライズドビューなど）をログに記録するための設定です。

クエリは別ファイルではなく、[system.query&#95;views&#95;log](/operations/system-tables/query_views_log) テーブルに記録されます。`table` パラメータ（後述）でテーブル名を変更できます。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse が作成します。ClickHouse サーバーのアップデート時に query views log の構造が変更されている場合は、古い構造のテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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


## remap&#95;executable

ヒュージページを使用して機械コード（「text」セクション）用のメモリを再割り当てするための設定です。

:::note
この機能は非常に実験的です。
:::

例:

```xml
<remap_executable>false</remap_executable>
```


## remote&#95;servers

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンおよび `cluster` テーブル関数で使用されるクラスターを設定します。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性の値については、「[設定ファイル](/operations/configuration-files)」セクションを参照してください。

**関連項目**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [クラスターディスカバリー](../../operations/cluster-discovery.md)
* [Replicated データベースエンジン](../../engines/database-engines/replicated.md)


## remote&#95;url&#95;allow&#95;hosts

URL 関連のストレージエンジンおよびテーブル関数で使用することが許可されているホストのリストです。

`\<host\>` XML タグでホストを追加する場合:

* DNS 解決の前に名前がチェックされるため、URL に記載されているものと完全に同一の形式で指定する必要があります。例: `<host>clickhouse.com</host>`
* URL でポートが明示的に指定されている場合は、host:port 全体としてチェックされます。例: `<host>clickhouse.com:80</host>`
* ホストがポートなしで指定されている場合、そのホストの任意のポートが許可されます。例えば `<host>clickhouse.com</host>` が指定されている場合、`clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) などが許可されます。
* ホストが IP アドレスとして指定されている場合、URL に記載されたとおりにチェックされます。例: `[2a02:6b8:a::a]`。
* リダイレクトが存在し、リダイレクトのサポートが有効な場合は、すべてのリダイレクト (`Location` フィールド) がチェックされます。

例:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica&#95;group&#95;name

Replicated データベースで使用するレプリカグループ名。

Replicated データベースによって作成されるクラスターは、同じグループに属するレプリカのみで構成されます。
DDL クエリは、同じグループに属するレプリカのみに対して待機します。

デフォルトでは空です。

**例**

```xml
<replica_group_name>バックアップ</replica_group_name>
```


## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />パーツフェッチリクエスト用の HTTP 接続タイムアウト。明示的に設定しない場合は、デフォルトプロファイルの `http_connection_timeout` を継承します。



## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />フェッチパーツリクエストに対する HTTP の受信タイムアウト。明示的に設定されていない場合は、デフォルトプロファイルの `http_receive_timeout` の値が使用されます。



## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />パーツのフェッチリクエストに対する HTTP 送信タイムアウト。明示的に設定されていない場合は、デフォルトプロファイルの `http_send_timeout` を継承します。



## replicated&#95;merge&#95;tree

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) のテーブル用の微調整設定です。この設定の優先順位が高くなります。

詳細は MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />RESTORE リクエストの実行に使用する最大スレッド数。



## s3_credentials_provider_max_cache_size {#s3_credentials_provider_max_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />キャッシュできる S3 クレデンシャルプロバイダの最大数



## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />許可されるS3リダイレクトのホップ回数の上限。



## s3_retry_attempts {#s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="500" />Aws::Client::RetryStrategy 用の設定です。Aws::Client は自身でリトライ処理を行い、0 はリトライしないことを意味します。



## s3queue_disable_streaming {#s3queue_disable_streaming} 

<SettingsInfoBlock type="Bool" default_value="0" />テーブルが作成済みで、マテリアライズドビューがアタッチされている場合でも、S3Queue でのストリーミングを無効化します



## s3queue&#95;log

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


## send&#95;crash&#95;reports

ClickHouse コア開発チームにクラッシュレポートを送信するための設定です。

特に本番前環境では、有効化していただけると非常に助かります。

キー:

| Key                   | Description                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `enabled`             | 機能を有効にするかどうかを指定するブール値フラグ。デフォルトは `true`。クラッシュレポートを送信したくない場合は `false` に設定します。                              |
| `send_logical_errors` | `LOGICAL_ERROR` は `assert` のようなもので、ClickHouse におけるバグを示します。このブール値フラグを有効にすると、これらの例外も送信されます（デフォルト: `true`）。 |
| `endpoint`            | クラッシュレポート送信先のエンドポイント URL を上書きできます。                                                                       |

**推奨される使い方**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />
Keeper 内のパスであり、`generateSerialID` 関数によって自動インクリメントされる番号が割り当てられます。各シリーズはこのパス直下のノードとして作成されます。




## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />true に設定すると、スタックトレースにアドレスが表示されます



## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />true に設定されている場合、ClickHouse はシャットダウンする前に、実行中のバックアップおよびリストアが完了するまで待機します。



## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />未完了のクエリが完了するまで待機する秒数



## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />true に設定すると、ClickHouse はシャットダウンする前に実行中のクエリが完了するまで待機します。



## skip_binary_checksum_checks {#skip_binary_checksum_checks} 

<SettingsInfoBlock type="Bool" default_value="0" />ClickHouse バイナリのチェックサムによる整合性検証をスキップします



## ssh&#95;server

ホストキーの公開鍵部分は、初回接続時に SSH クライアント側の known&#95;hosts ファイルに書き込まれます。

ホストキー設定はデフォルトでは無効です。
ホストキー設定のコメントアウトを解除し、対応する SSH キーへのパスを指定して有効化してください。

例:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />マテリアライズドビューの作成遅延をシミュレートするためのデバッグパラメータ



## storage&#95;configuration

ストレージのマルチディスク構成を行うための設定です。

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

### ディスクの設定

`disks` の設定は、以下のような構成になります。

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

上記のサブタグは、`disks` に対して次の設定を指定します:

| Setting                 | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `<disk_name_N>`         | 一意である必要があるディスクの名前。                                         |
| `path`                  | サーバーデータ（`data` および `shadow` カタログ）が保存されるパス。`/` で終わる必要があります。 |
| `keep_free_space_bytes` | ディスク上で確保しておく空き領域のサイズ。                                      |

:::note
ディスクの順序は関係ありません。
:::

### ポリシーの設定

上記のサブタグは、`policies` に対して次の設定を指定します:


| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシー名。ポリシー名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | ボリューム名。ボリューム名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `disk`                       | ボリューム内に配置されているディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `max_data_part_size_bytes`   | このボリューム内の任意のディスク上に存在できるデータチャンクの最大サイズ。この値より大きくなると予想されるチャンクサイズでマージが行われる場合、そのチャンクは次のボリュームに書き込まれます。基本的に、この機能により、新規／小さいチャンクをホット（SSD）ボリュームに保存し、サイズが大きくなったらコールド（HDD）ボリュームに移動できます。ポリシー内にボリュームが 1 つしかない場合は、このオプションを使用しないでください。                                                                 |
| `move_factor`                | ボリューム上で利用可能な空き容量の割合。この割合を下回ると、（存在する場合は）データの次のボリュームへの転送が開始されます。転送時には、チャンクはサイズの大きい順（降順）に並べ替えられ、合計サイズが `move_factor` の条件を満たすのに十分なチャンクが選択されます。すべてのチャンクの合計サイズが不十分な場合は、すべてのチャンクが移動されます。                                                                                                             |
| `perform_ttl_move_on_insert` | 挿入時に、TTL が期限切れのデータを移動する動作を無効にします。デフォルト（有効）の場合、TTL ベースの移動ルールに従ってすでに期限切れとなっているデータを挿入すると、即座に移動ルールで指定されたボリューム／ディスクに移動されます。ターゲットのボリューム／ディスクが遅い場合（例: S3）、これにより挿入が大幅に低速化する可能性があります。無効にした場合、期限切れのデータ部分はいったんデフォルトボリュームに書き込まれ、その後すぐに、期限切れ TTL 用のルールで指定されたボリュームに移動されます。 |
| `load_balancing`             | ディスクの負荷分散ポリシー。`round_robin` または `least_used` を指定します。                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `least_used_ttl_ms`          | すべてのディスク上の空き容量を更新するタイムアウト（ミリ秒）を設定します（`0` - 常に更新、`-1` - 更新しない、デフォルト値は `60000`）。ディスクが ClickHouse だけに使用され、オンラインでファイルシステムをリサイズしない場合は、`-1` の値を使用できます。それ以外の場合、この値は推奨されません。最終的に不正確な空き容量の割り当てにつながるためです。                                                                                                                   |
| `prefer_not_to_merge`        | このボリューム上でのデータパーツのマージを無効にします。注意: これは潜在的に有害であり、パフォーマンス低下の原因となる可能性があります。この設定を有効にすると（推奨しません）、このボリューム上でのデータのマージは禁止されます（望ましくありません）。これにより、ClickHouse が低速ディスクとどのようにやり取りするかを制御できますが、基本的には使用しないことを推奨します。                                                                                                                                                                                       |
| `volume_priority`            | ボリュームがどの順序で埋められるかの優先度（順序）を定義します。値が小さいほど優先度は高くなります。パラメータの値は自然数であり、1 から N（N は指定されたパラメータ値の最大値）までの範囲を欠番なく網羅している必要があります。                                                                                                                                                                                                                                                                |

`volume_priority` について:
- すべてのボリュームにこのパラメータが設定されている場合、指定された順序で優先されます。
- _一部の_ ボリュームにだけ設定されている場合、設定されていないボリュームは最も低い優先度になります。設定されているボリュームはタグ値に従って優先され、残りのボリュームの優先度は、設定ファイル内での記述順によって決まります。
- _いずれの_ ボリュームにもこのパラメータが設定されていない場合、優先度は設定ファイル内での記述順によって決まります。
- ボリュームの優先度が同一である必要はありません。



## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この上限を超えた接続は、有効期間（TTL）が大幅に短くなります。この上限はストレージへの接続に適用されます。



## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この上限を超えた接続は、使用後にリセットされます。接続キャッシュを無効にするには 0 を設定します。この上限はストレージ接続に適用されます。



## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />使用中の接続数がこの閾値を超えた場合、警告メッセージがログに書き込まれます。この閾値はストレージの接続に適用されます。



## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="1" />ディスクメタデータファイルを VERSION_FULL_OBJECT_KEY 形式で書き込みます。既定で有効になっています。この設定は非推奨です。



## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />有効にすると、SharedSet および SharedJoin の作成時に内部 UUID が生成されます。ClickHouse Cloud 専用です。



## table_engines_require_grant {#table_engines_require_grant} 

true に設定した場合、ユーザーは特定のテーブルエンジンを使用してテーブルを作成するための GRANT 権限が必要になります（例: `GRANT TABLE ENGINE ON TinyLog TO user`）。

:::note
既定では後方互換性のため、特定のテーブルエンジンを指定してテーブルを作成する際に GRANT 権限は無視されますが、この設定を true にすることでこの動作を変更できます。
:::



## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
バックグラウンドプールで非同期ロードジョブを実行するスレッド数を設定します。バックグラウンドプールは、そのテーブルを待っているクエリがない場合に、サーバー起動後にテーブルを非同期でロードするために使用されます。テーブル数が多い場合は、バックグラウンドプール内のスレッド数を少なく保つことで有利になる場合があります。これにより、同時クエリ実行のための CPU リソースを確保できます。

:::note
値が `0` の場合、利用可能なすべての CPU が使用されます。
:::




## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
フォアグラウンドプールでロードジョブを実行するスレッド数を設定します。フォアグラウンドプールは、サーバーがポートでのリッスンを開始する前にテーブルを同期的にロードする場合や、ロード完了を待機しているテーブルをロードする場合に使用されます。フォアグラウンドプールはバックグラウンドプールよりも優先度が高く、フォアグラウンドプールでジョブが実行中の間は、バックグラウンドプールでジョブは開始されません。

:::note
値が `0` の場合、利用可能なすべての CPU が使用されます。
:::




## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />1 つの TCP 接続で、接続を閉じるまでに実行できるクエリの最大数です。無制限にするには 0 を設定します。



## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 接続が閉じられるまでの最大存続期間（秒）。接続の存続期間を無制限にするには 0 に設定します。



## tcp&#95;port

クライアントとの TCP 通信に使用するポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```


## tcp&#95;port&#95;secure

クライアントとのセキュアな通信に使用する TCP ポートです。[OpenSSL](#openssl) の設定と組み合わせて使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## tcp&#95;ssh&#95;port

ユーザーが PTY 経由で組み込みクライアントを使用して対話的に接続し、クエリを実行するための SSH サーバーのポート。

例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary&#95;data&#95;in&#95;cache

このオプションを使用すると、特定のディスクについて、一時データがそのディスクのキャッシュに保存されます。
このセクションでは、タイプが `cache` のディスク名を指定する必要があります。
この場合、キャッシュと一時データは同じ領域を共有し、一時データを作成するためにディスクキャッシュが破棄される（追い出される）可能性があります。

:::note
一時データの保存先を設定するには、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか 1 つのみを使用できます。
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

<SettingsInfoBlock type="Bool" default_value="0" />一時データを分散キャッシュ内に保存するかどうかを指定します。



## text_index_dictionary_block_cache_max_entries {#text_index_dictionary_block_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />テキストインデックス辞書ブロックのキャッシュサイズ（エントリ数）。0 を指定すると無効になります。



## text_index_dictionary_block_cache_policy {#text_index_dictionary_block_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキストインデックス辞書ブロックキャッシュのポリシー名です。



## text_index_dictionary_block_cache_size {#text_index_dictionary_block_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />テキストインデックス辞書ブロック用キャッシュのサイズ。ゼロの場合は無効になります。

:::note
この設定は実行時に変更でき、即座に反映されます。
:::



## text_index_dictionary_block_cache_size_ratio {#text_index_dictionary_block_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキストインデックス辞書ブロックキャッシュにおける、キャッシュ全体サイズに対する保護キュー（SLRU ポリシーの場合）のサイズ比率。



## text_index_header_cache_max_entries {#text_index_header_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="100000" />テキストインデックスヘッダー用キャッシュのサイズ（エントリ数）。0 を指定すると無効になります。



## text_index_header_cache_policy {#text_index_header_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキストインデックスヘッダーキャッシュポリシーの名前。



## text_index_header_cache_size {#text_index_header_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />テキストインデックスヘッダー用キャッシュのサイズ。0 の場合は無効になります。

:::note
この設定は実行時に変更でき、変更は直ちに反映されます。
:::



## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキストインデックスヘッダーキャッシュにおける、SLRU ポリシー使用時の保護キューのサイズを、キャッシュ全体サイズに対する比率で指定します。



## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />テキストインデックスのポスティングリスト用キャッシュのサイズ（エントリ数）。0 に設定すると無効になります。



## text_index_postings_cache_policy {#text_index_postings_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />テキストインデックスのポスティングリストのキャッシュポリシー名。



## text_index_postings_cache_size {#text_index_postings_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="2147483648" />テキストインデックスのポスティングリスト用キャッシュサイズ。0 にすると無効になります。

:::note
この設定は実行時に変更でき、即座に反映されます。
:::



## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />テキストインデックスのポスティングリストキャッシュにおいて、保護キュー（SLRU ポリシーの場合）のサイズがキャッシュ全体サイズに対して占める割合を指定します。



## text&#95;log

テキストメッセージをログ出力するための [text&#95;log](/operations/system-tables/text_log) システムテーブルの設定です。

<SystemLogParameters />

加えて、次の設定があります。

| Setting | Description                          | Default Value |
| ------- | ------------------------------------ | ------------- |
| `level` | テーブルに保存されるメッセージの最大レベル（既定値は `Trace`）。 | `Trace`       |

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


## thread&#95;pool&#95;queue&#95;size

<SettingsInfoBlock type="UInt64" default_value="10000" />

グローバルスレッドプールにスケジュールできるジョブの最大数です。キューサイズを大きくするとメモリ使用量が増加します。この値は [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size) と同じ値にすることを推奨します。

:::note
`0` は無制限を意味します。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />`local_filesystem_read_method = 'pread_threadpool'` の場合に、ローカルファイルシステムからの読み込みを行うスレッドプールのスレッド数。



## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />ローカルファイルシステムからの読み込みを行うためにスレッドプールにスケジュールできるジョブの最大数。



## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />`remote_filesystem_read_method = 'threadpool'` の場合に、リモートファイルシステムからの読み取りに使用されるスレッドプールのスレッド数。



## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />リモートファイルシステムからの読み取りのためにスレッドプールにスケジュールできるジョブの最大数。



## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />オブジェクトストレージへの書き込みリクエストを処理するバックグラウンドプールのサイズ



## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />オブジェクトストレージへの書き込みリクエストを処理するバックグラウンドプールに投入できるタスクの最大数



## throw&#95;on&#95;unknown&#95;workload

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ設定 &#39;workload&#39; を使用して未知の WORKLOAD にアクセスした際の動作を定義します。

* `true` の場合、未知の WORKLOAD へアクセスしようとするクエリから RESOURCE&#95;ACCESS&#95;DENIED 例外がスローされます。これは、WORKLOAD 階層が確立され、`WORKLOAD default` を含むようになった後に、すべてのクエリに対してリソーススケジューリングを強制するのに有用です。
* `false`（デフォルト）の場合、&#39;workload&#39; 設定が未知の WORKLOAD を指していても、そのクエリはリソーススケジューリングなしで無制限にアクセスできます。これは、`WORKLOAD default` が追加される前の WORKLOAD 階層の設定中に重要となります。

**例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**関連項目**

* [ワークロードのスケジューリング](/operations/workload-scheduling.md)


## timezone

サーバーのタイムゾーンです。

UTC タイムゾーンまたは地理的位置を表す IANA 識別子で指定します（例: Africa/Abidjan）。

タイムゾーンは、DateTime フィールドをテキスト形式で出力する際（画面表示やファイル出力）、および文字列から DateTime を取得する際に、String と DateTime の形式を相互に変換するために必要です。さらに、入力パラメータとしてタイムゾーンを受け取らない時間・日付関連の関数においても、内部で使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連項目**

* [session&#95;timezone](../settings/settings.md#session_timezone)


## tmp&#95;path

大規模なクエリを処理するための一時データを保存するローカルファイルシステム上のパス。

:::note

* 一時データの保存先を設定するオプションとして使用できるのは、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか 1 つだけです。
* 末尾のスラッシュは必須です。
  :::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp&#95;policy

一時データを格納するストレージ用のポリシーです。`tmp` プレフィックスを持つすべてのファイルは起動時に削除されます。

:::note
`tmp_policy` としてオブジェクトストレージを使用する際の推奨事項:

* 各サーバーで個別の `bucket:path` を使用する
* `metadata_type=plain` を使用する
* このバケットに対して TTL を設定することも検討してください
  :::

:::note

* 一時データストレージの設定には、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか一つしか使用できません。
* `move_factor`、`keep_free_space_bytes`、`max_data_part_size_bytes` は無視されます。
* ポリシーは *1 つのボリューム* のみを持つ必要があります

詳細については [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree) のドキュメントを参照してください。
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


## top&#95;level&#95;domains&#95;list

追加するカスタムトップレベルドメインのリストを定義します。各エントリは `<name>/path/to/file</name>` という形式です。

例えば次のようになります。

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

関連項目:

* 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) およびそのバリエーション。
  これらはカスタムの TLD リスト名を受け取り、トップレベルドメイン直下から最初の意味のあるサブドメインまでを含むドメイン部分を返します。


## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />`total_memory_profiler_sample_probability` と同じ確率で、指定した値以下のサイズのランダムなメモリ割り当てを収集します。0 は無効を意味します。このしきい値が意図したとおりに動作するようにするには、`max_untracked_memory` を 0 に設定することを推奨します。



## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />指定した値以上のサイズのメモリアロケーションを、`total_memory_profiler_sample_probability` の確率でランダムに収集します。0 の場合は無効です。このしきい値が想定どおりに動作するように、`max_untracked_memory` を 0 に設定することを検討してください。



## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーのメモリ使用量が、指定されたバイト数ごとの各ステップを超えるたびに、メモリプロファイラがメモリ割り当て時のスタックトレースを収集します。ゼロを指定すると、メモリプロファイラは無効になります。数メガバイトより小さい値を指定すると、サーバーが遅くなります。



## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />
ランダムなメモリの割り当ておよび解放を収集し、指定した確率で `trace_type` が `MemorySample` の行として [system.trace_log](../../operations/system-tables/trace_log.md) システムテーブルに書き込みます。この確率は、割り当てサイズに関係なく、各割り当ておよび解放ごとに適用されます。サンプリングは、未追跡メモリ量が未追跡メモリ制限（デフォルト値は `4` MiB）を超えた場合にのみ行われる点に注意してください。[total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) を小さくすると、この制限を下げることができます。より細かい粒度でサンプリングするには、`total_memory_profiler_step` を `1` に設定できます。

設定可能な値:

- 正の倍精度実数。
- `0` — `system.trace_log` システムテーブルへのランダムな割り当ておよび解放の書き込みを無効にします。




## trace&#95;log

[trace&#95;log](/operations/system-tables/trace_log) システムテーブルの動作を制御するための設定です。

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

<SettingsInfoBlock type="String" default_value="SLRU" />非圧縮キャッシュのポリシー名。



## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
MergeTree ファミリーのテーブルエンジンが使用する非圧縮データ用キャッシュの最大サイズ（バイト単位）。

サーバー全体で共有されるキャッシュが 1 つだけ存在します。メモリはオンデマンドで割り当てられます。オプション `use_uncompressed_cache` が有効な場合にキャッシュが使用されます。

非圧縮キャッシュは、一部のケースでの非常に短いクエリに対して有利に働きます。

:::note
値が `0` の場合は無効を意味します。

この設定は実行時に変更でき、即座に反映されます。
:::




## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />非圧縮キャッシュにおいて（SLRU ポリシーの場合）、保護キューのサイズがキャッシュの総サイズに対して占める比率。



## url&#95;scheme&#95;mappers

短縮された、またはシンボリックな URL プレフィックスをフル URL に変換するための設定。

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

ZooKeeper 内でのデータパートヘッダーの保存方法を指定します。この設定は [`MergeTree`](/engines/table-engines/mergetree-family) ファミリーにのみ適用されます。次のいずれかの方法で指定できます。

**`config.xml` ファイルの [merge_tree](#merge_tree) セクションでグローバルに指定**

ClickHouse はサーバー上のすべてのテーブルに対してこの設定を適用します。この設定はいつでも変更できます。既存のテーブルも、設定が変更されるとその動作が変わります。

**テーブルごとに指定**

テーブルを作成するときに、対応する [エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) を指定します。この設定を持つ既存のテーブルの動作は、グローバル設定が変わっても変化しません。

**設定可能な値**

- `0` — 機能を無効にします。
- `1` — 機能を有効にします。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) の場合、[replicated](../../engines/table-engines/mergetree-family/replication.md) テーブルは、1 つの `znode` を使ってデータパートヘッダーをコンパクトに保存します。テーブルに多くのカラムが含まれている場合、この保存方法により ZooKeeper に保存されるデータ量を大幅に削減できます。

:::note
`use_minimalistic_part_header_in_zookeeper = 1` を適用した後は、この設定をサポートしていないバージョンの ClickHouse サーバーにダウングレードすることはできません。クラスタ内のサーバーで ClickHouse をアップグレードする際は注意してください。すべてのサーバーを一度にアップグレードしないでください。ClickHouse の新バージョンは、テスト環境やクラスタ内の一部のサーバーで事前に検証しておく方が安全です。

この設定を有効にした状態で既に保存されたデータパートヘッダーは、以前の（非コンパクトな）形式に復元することはできません。
:::



## user&#95;defined&#95;executable&#95;functions&#95;config

実行可能なユーザー定義関数の設定ファイルへのパスです。

パス：

* 絶対パスまたはサーバー設定ファイルからの相対パスを指定します。
* パスにはワイルドカードの * と ? を含めることができます。

参照：

* &quot;[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).&quot;

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user&#95;defined&#95;path

ユーザー定義ファイルを配置するディレクトリです。[SQL User Defined Functions](/sql-reference/functions/udf) による SQL ユーザー定義関数で使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user&#95;directories

各種設定を含む設定ファイル内のセクションです。

* 事前定義されたユーザーが記述されている設定ファイルへのパス。
* SQL コマンドで作成されたユーザーが保存されるフォルダーへのパス。
* SQL コマンドで作成されたユーザーが保存およびレプリケートされる ZooKeeper ノードのパス。

このセクションが指定されている場合、[users&#95;config](/operations/server-configuration-parameters/settings#users_config) と [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) のパスは使用されません。

`user_directories` セクションには任意の数の項目を含めることができ、項目の並び順が優先順位を表します（上にある項目ほど優先順位が高くなります）。

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

ユーザー、ロール、行ポリシー、クオータおよびプロファイルは、ZooKeeperに保存することもできます。

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

セクションとして `memory` を定義することもできます。これは情報をディスクに書き込まずメモリ上のみに保持することを意味します。また、`ldap` は LDAP サーバー上に情報を保存することを意味します。

ローカルに定義されていないユーザーのリモートユーザーディレクトリとして LDAP サーバーを追加するには、次の設定を持つ 1 つの `ldap` セクションを定義します。

| Setting  | Description                                                                                                                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | `ldap_servers` 設定セクションで定義された LDAP サーバー名のいずれか。このパラメータは必須で、空にはできません。                                                                                                |
| `roles`  | LDAP サーバーから取得された各ユーザーに割り当てられる、ローカルで定義されたロールの一覧を持つセクション。ロールが指定されていない場合、ユーザーは認証後に一切の操作を実行できません。列挙されたロールのいずれかが認証時点でローカルに定義されていない場合、認証試行は与えられたパスワードが誤っている場合と同様に失敗します。 |

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


## user&#95;files&#95;path

ユーザーファイルが格納されているディレクトリです。テーブル関数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user&#95;scripts&#95;path

ユーザースクリプトファイルを配置するディレクトリです。実行可能なユーザー定義関数で使用されます。詳しくは[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)を参照してください。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

型:

デフォルト値:


## users&#95;config

次の内容を含むファイルへのパスです:

* ユーザー設定
* アクセス権
* 設定プロファイル
* クォータ設定

**例**

```xml
<users_config>users.xml</users_config>
```


## validate&#95;tcp&#95;client&#95;information

<SettingsInfoBlock type="Bool" default_value="0" />クエリパケットを受信したときに、クライアント情報の検証を有効にするかどうかを指定します。

デフォルトでは `false` です。

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />ベクトル類似度インデックス用キャッシュのサイズ（エントリ数）。0 を指定すると無効になります。



## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ベクトル類似インデックスのキャッシュポリシー名。



## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />ベクトル類似性インデックス用キャッシュのサイズ。0 の場合は無効になります。

:::note
この設定は実行時に変更でき、直ちに反映されます。
:::



## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />ベクトル類似インデックスキャッシュにおいて、SLRU ポリシー使用時の保護キューの大きさを、キャッシュ全体のサイズに対する比率で指定します。



## wait&#95;dictionaries&#95;load&#95;at&#95;startup

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は、`dictionaries_lazy_load` が `false` の場合の動作を指定します。
（`dictionaries_lazy_load` が `true` の場合、この設定は何の影響も与えません。）

`wait_dictionaries_load_at_startup` が `false` の場合、サーバーは起動時に
すべてのディクショナリのロードを開始し、そのロードと並行して接続を受け付けます。
あるディクショナリがクエリ内で初めて使用されるとき、そのディクショナリがまだロードされていなければ、
クエリはそのディクショナリのロードが完了するまで待機します。
`wait_dictionaries_load_at_startup` を `false` に設定すると、ClickHouse の起動を高速化できますが、
一部のクエリの実行が遅くなる場合があります（特定のディクショナリのロード完了を待つ必要があるため）。

`wait_dictionaries_load_at_startup` が `true` の場合、サーバーは起動時に
すべてのディクショナリのロード（成功／失敗を問わず）が完了するまで待機し、それが完了してから接続を受け付けます。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload&#95;path

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリの保存先として使用されるディレクトリです。デフォルトでは、サーバーのワーキングディレクトリ配下の `/workload/` ディレクトリが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**関連項目**

* [ワークロード階層構造](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)


## workload&#95;zookeeper&#95;path

ZooKeeper ノードへのパスです。`CREATE WORKLOAD` および `CREATE RESOURCE` クエリすべての保存先として使用されます。一貫性を保つため、すべての SQL 定義はこの単一の znode の値として保存されます。デフォルトでは ZooKeeper は使用されず、定義は [disk](#workload_path) に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**関連項目**

* [ワークロード階層構造](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)


## zookeeper

ClickHouse が [ZooKeeper](http://zookeeper.apache.org/) クラスターと連携するための設定を含みます。ClickHouse はレプリケーテッドテーブルを使用する際に、レプリカのメタデータを保存するために ZooKeeper を使用します。レプリケーテッドテーブルを使用しない場合、このセクションのパラメータは省略できます。

次の設定はサブタグで指定できます。

| Setting                                    | Description                                                                                                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeper のエンドポイント。複数のエンドポイントを設定できます。例: `<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性は、ZooKeeper クラスターへの接続を試行する際のノードの順序を指定します。 |
| `session_timeout_ms`                       | クライアントセッションの最大タイムアウト（ミリ秒）。                                                                                                                                      |
| `operation_timeout_ms`                     | 1 回の操作の最大タイムアウト（ミリ秒）。                                                                                                                                           |
| `root` (optional)                          | ClickHouse サーバーが使用する znode 群に対してルートとして使用される znode。                                                                                                              |
| `fallback_session_lifetime.min` (optional) | プライマリが利用できないとき（ロードバランシング）のフォールバックノードに対する ZooKeeper セッション存続期間の最小制限。秒単位で指定します。デフォルト: 3 時間。                                                                        |
| `fallback_session_lifetime.max` (optional) | プライマリが利用できないとき（ロードバランシング）のフォールバックノードに対する ZooKeeper セッション存続期間の最大制限。秒単位で指定します。デフォルト: 6 時間。                                                                        |
| `identity` (optional)                      | 要求された znode にアクセスするために ZooKeeper が要求するユーザーとパスワード。                                                                                                               |
| `use_compression` (optional)               | true に設定すると Keeper プロトコルで圧縮を有効にします。                                                                                                                             |

また、ZooKeeper ノードの選択アルゴリズムを選べる `zookeeper_load_balancing` 設定（オプション）もあります。

| Algorithm Name                  | Description                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| `random`                        | ZooKeeper ノードのうち 1 つをランダムに選択します。                                     |
| `in_order`                      | 最初の ZooKeeper ノードを選択し、それが利用できない場合は 2 番目、その次という順に選択します。               |
| `nearest_hostname`              | サーバーのホスト名と最も類似したホスト名を持つ ZooKeeper ノードを選択します。ホスト名は名前のプレフィックスで比較されます。  |
| `hostname_levenshtein_distance` | `nearest_hostname` と同様ですが、ホスト名をレーベンシュタイン距離で比較します。                    |
| `first_or_random`               | 最初の ZooKeeper ノードを選択し、それが利用できない場合は残りの ZooKeeper ノードからランダムに 1 つ選択します。 |
| `round_robin`                   | 最初の ZooKeeper ノードを選択し、再接続が発生した場合は次のノードを選択します。                        |

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
* [ClickHouse と ZooKeeper 間のオプションのセキュア通信](/operations/ssl-zookeeper)


## zookeeper&#95;log

[`zookeeper_log`](/operations/system-tables/zookeeper_log) システムテーブルの設定です。

以下の設定はサブタグで指定できます。

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
