---
'description': 'このセクションには、セッションまたはクエリレベルで変更できないサーバー設定の説明が含まれています。'
'keywords':
- 'global server settings'
'sidebar_label': 'サーバー設定'
'sidebar_position': 57
'slug': '/operations/server-configuration-parameters/settings'
'title': 'サーバー設定'
'doc_type': 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';



# サーバー設定

このセクションには、サーバー設定の説明が含まれています。これらはセッションまたはクエリレベルで変更できない設定です。

ClickHouseの設定ファイルに関する詳細は、["設定ファイル"](/operations/configuration-files) を参照してください。

他の設定については、""[設定](/operations/settings/overview)"" セクションで説明されています。設定を学習する前に、[設定ファイル](/operations/configuration-files) セクションを読み、置換（`incl` および `optional` 属性）の使用について注意してください。

## abort_on_logical_error {#abort_on_logical_error}

<SettingsInfoBlock type="Bool" default_value="0" /> LOGICAL_ERROR 例外でサーバーがクラッシュします。専門家向けのみです。

## access_control_improvements {#access_control_improvements} 

アクセス制御システムのオプションの改善に関する設定。

| 設定                                         | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | デフォルト |
|----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| `users_without_row_policies_can_read_rows`      | 緩和された行ポリシーのないユーザーがまだ行を `SELECT` クエリを使用して読み取れるかどうかを設定します。たとえば、2人のユーザーAとBがいて、行ポリシーがAのためだけに定義されている場合、この設定がtrueであれば、ユーザーBはすべての行を見ることができます。この設定がfalseの場合、ユーザーBは行を見ません。                                                                                                                                                                | `true`    |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` クエリが `CLUSTER` 権限を必要とするかどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                    | `true`    |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>` が権限を必要とし、任意のユーザーによって実行できるかどうかを設定します。trueに設定すると、このクエリは `GRANT SELECT ON system.<table>` を必要とします。例外として、いくつかのシステムテーブル（`tables`, `columns`, `databases`, および `one`、`contributors` のような定数テーブル）はまだすべてのユーザーがアクセス可能であり、`SHOW` 権限（例：`SHOW USERS`）が与えられている場合、対応するシステムテーブル（すなわち `system.users`）にアクセス可能となります。 | `true`    |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` が権限を必要とし、任意のユーザーによって実行できるかどうかを設定します。trueに設定すると、このクエリは `GRANT SELECT ON information_schema.<table>` を必要とします。                                                                                                                                                                                                                                                                                        | `true`    |
| `settings_constraints_replace_previous`         | ある設定の設定プロファイルにおける制約が、その設定に対して以前の制約（他のプロファイルに定義された）に対するアクションをキャンセルできるかどうかを設定します。これには、新しい制約によって設定されないフィールドも含まれます。また、`changeable_in_readonly` 制約タイプを有効にします。                                                                                                                                                                        | `true`    |
| `table_engines_require_grant`                   | 特定のテーブルエンジンでテーブルを作成するために権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                         | `false`   |
| `role_cache_expiration_time_seconds`            | ロールキャッシュにロールが保存されている最大アクセス後の秒数を設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                       | `600`     |

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

SQLコマンドによって作成されたユーザーおよびロールの構成をClickHouseサーバーが保存するフォルダへのパス。

**参照**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" /> groupArray において最大配列要素サイズが超えた場合に実行するアクション：`throw` 例外、または `discard` 追加値。

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" /> groupArray 関数のバイト単位での最大配列要素サイズ。この制限はシリアル化時にチェックされ、大きな状態サイズを回避するのに役立ちます。

## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />
ユーザーが異なる機能層に関連する設定を変更できるかどうかを制御します。

- `0` - すべての設定の変更が許可されます（実験的、ベータ、商用）。
- `1` - ベータおよび商用機能設定の変更のみが許可されます。実験的設定の変更は拒否されます。
- `2` - 商用設定の変更のみが許可されます。実験的またはベータ設定の変更は拒否されます。

これは、すべての `EXPERIMENTAL` / `BETA` 機能に対して読み取り専用の制約を設定することに相当します。

:::note
値が `0` の場合、すべての設定が変更可能であることを意味します。
:::

## allow_implicit_no_password {#allow_implicit_no_password} 

'IDENTIFIED WITH no_password' が明示的に指定されていない限り、パスワードなしでユーザーを作成することは禁止されています。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
``` 

## allow_no_password {#allow_no_password} 

不安全なパスワードタイプの no_password が許可されるかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
``` 

## allow_plaintext_password {#allow_plaintext_password} 

プレーンテキストパスワードタイプ（不安全）が許可されるかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
``` 

## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" /> jemalloc メモリの使用を許可します。

## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

Iceberg での使用が許可されているディスクのリスト。

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" /> true の場合、非同期挿入のキューが正常にシャットダウン時にフラッシュされます。

## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" /> バックグラウンドでデータを解析および挿入するための最大スレッド数。ゼロは非同期モードが無効であることを意味します。

## async_load_databases {#async_load_databases} 

<SettingsInfoBlock type="Bool" default_value="1" />
データベースおよびテーブルの非同期ロード。

- `true` の場合、ClickHouseサーバー起動後、すべての非システムデータベースが `Ordinary`、`Atomic` および `Replicated` エンジンで非同期にロードされます。`system.asynchronous_loader` テーブル、`tables_loader_background_pool_size` および `tables_loader_foreground_pool_size` サーバー設定を参照してください。まだ読み込まれていないテーブルにアクセスしようとするクエリは、正確にそのテーブルの起動を待機します。ロードジョブが失敗した場合、クエリはエラーを再スローします（`async_load_databases = false` の場合にサーバー全体をシャットダウンするのではなく）。少なくとも1つのクエリによって待機されているテーブルは、より高い優先度でロードされます。データベースに対するDDLクエリは、正確にそのデータベースの起動を待機します。また、待機クエリの総数に対して `max_waiting_queries` の制限を設定することも考慮してください。
- `false` の場合、サーバー起動時にすべてのデータベースがロードされます。

**例**

```xml
<async_load_databases>true</async_load_databases>
``` 

## async_load_system_database {#async_load_system_database} 

<SettingsInfoBlock type="Bool" default_value="0" />
システムテーブルの非同期ロード。`system` データベースに多量のログテーブルやパーツが存在する場合に便利です。`async_load_databases` 設定に依存しません。

- `true` に設定すると、ClickHouseサーバー起動後、すべてのシステムデータベースが `Ordinary`、`Atomic` および `Replicated` エンジンで非同期にロードされます。`system.asynchronous_loader` テーブル、`tables_loader_background_pool_size` および `tables_loader_foreground_pool_size` サーバー設定を参照してください。まだ読み込まれていないシステムテーブルにアクセスしようとするクエリは、正確にそのテーブルの起動を待機します。少なくとも1つのクエリによって待機されているテーブルは、より高い優先度でロードされます。`max_waiting_queries` 設定を設定して、待機クエリの総数を制限することも考慮してください。
- `false` に設定すると、サーバー起動前にシステムデータベースがロードされます。

**例**

```xml
<async_load_system_database>true</async_load_system_database>
``` 

## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" /> 重い非同期メトリックを更新するための期間（秒単位）。

## asynchronous_insert_log {#asynchronous_insert_log} 

非同期挿入をログするための [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) システムテーブルの設定。

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

ClickHouse Cloud デプロイメントではデフォルトで有効になっています。

あなたの環境でデフォルトでこの設定が有効になっていない場合は、ClickHouse がインストールされた方法に応じて、以下の手順に従ってオンまたはオフにできます。

**有効化**

非同期メトリックログの履歴収集を手動でオンにするには、[`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md) のためにコンテンツを含む `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します:

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

`asynchronous_metric_log` 設定を無効にするには、次の内容を含むファイル `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` を作成してください。

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>

## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" /> 重い非同期メトリックの計算を有効にします。

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" /> 非同期メトリックを更新するための期間（秒単位）。

## auth_use_forwarded_address {#auth_use_forwarded_address} 

プロキシ経由で接続されたクライアントの認証に元のアドレスを使用します。

:::note
この設定は細心の注意を払って使用する必要があります。なぜなら、転送されたアドレスは簡単に偽造される可能性があるからです - そのような認証を受け入れるサーバーには直接アクセスせず、信頼できるプロキシ経由でのみアクセスすべきです。
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" /> [Buffer-engine tables](/engines/table-engines/special/buffer) の背景でフラッシュ操作を実行するために使用される最大スレッド数。

## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" /> [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルのさまざまな操作（主にガーベジコレクション）をバックグラウンドで実行するために使用される最大スレッド数。

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" /> 分散送信を実行するために使用される最大スレッド数。

## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" /> バックグラウンドで [*MergeTree-engine](/engines/table-engines/mergetree-family) テーブルの他のレプリカからデータパーツを取得するために使用される最大スレッド数。

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />
スレッド数とバックグラウンドマージおよびミューテーションの同時実行可能数との比率を設定します。

たとえば、比率が2で、[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) が16に設定されている場合、ClickHouseは32のバックグラウンドマージを同時に実行することができます。これは、バックグラウンド操作が一時停止および延期される可能性があるためです。これは、小さなマージに実行優先度を与えるために必要です。

:::note
この比率は実行時にのみ増やすことができます。下げるにはサーバーを再起動する必要があります。

[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 設定と同様に、[`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) は後方互換性のために `default` プロファイルから適用されることがあります。
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />
バックグラウンドマージおよびミューテーションのスケジューリングを実行するポリシー。可能な値は：`round_robin` と `shortest_task_first`。

次のマージまたはミューテーションをバックグラウンドスレッドプールによって実行するアルゴリズムの選択方法。ポリシーは、サーバーの再起動なしで実行時に変更できます。
後方互換性のために `default` プロファイルから適用されることがあります。

可能な値：

- `round_robin` — 各同時マージおよびミューテーションは、スタベーションのない操作を保証するためにラウンドロビン順に実行されます。小さなマージは、大きなものよりもブロックが少ないため、より速く完了します。
- `shortest_task_first` — 常に小さなマージまたはミューテーションを実行します。マージおよびミューテーションは、作成されるサイズに基づいて優先順位が与えられます。小さいマージは大きいものよりも厳格に優先されます。このポリシーは、小さな部分の最速のマージを保証しますが、`INSERT` によって過度に負荷がかかったパーティション内の大きなマージの無限のスタベーションにつながる可能性があります。

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" /> メッセージストリーミングのバックグラウンド操作を実行するために使用される最大スレッド数。

## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" /> バックグラウンドで *MergeTree-engine テーブル にデータパーツを他のディスクまたはボリュームに移動するために使用される最大スレッド数。

## background_pool_size {#background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
MergeTreeエンジンを持つテーブルのバックグラウンドマージおよびミューテーションを実行するスレッド数を設定します。

:::note
- この設定は、ClickHouseサーバーの起動時に `default` プロファイル設定から適用することもできます。
- 実行時にのみスレッド数を増やすことができます。
- スレッド数を減らすにはサーバーを再起動する必要があります。
- この設定を調整することにより、CPUおよびディスクの負荷を管理します。
:::

:::danger
プールサイズが小さいと、CPUおよびディスクリソースをあまり使用せず、バックグラウンドプロセスが遅く進行する可能性があります。結果としてクエリパフォーマンスに影響を与える可能性があります。
:::

変更する前に、次の関連するMergeTree設定にも目を通してください：
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge)。
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation)。
- [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**例**

```xml
<background_pool_size>16</background_pool_size>
``` 

## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio} 

<SettingsInfoBlock type="Float" default_value="0.8" /> 同じタイプのタスクを同時に実行できるプール内の最大スレッド比。

## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" /> レプリケートされたテーブル、Kafkaストリーミング、およびDNSキャッシュ更新に対して定期的な軽量操作を継続的に実行するために使用される最大スレッド数。

## backup_log {#backup_log} 

`BACKUP` および `RESTORE` 操作のログ記録用の [backup_log](../../operations/system-tables/backup_log.md) システムテーブルの設定。

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

`BACKUP` リクエストを実行するための最大スレッド数。

## backups {#backups} 

`BACKUP TO File()` の書き込み時に使用されるバックアップに関する設定。

次の設定はサブタグによって構成できます：

| 設定                             | 説明                                                                                                                                                                    | デフォルト |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| `allowed_path`                    | `File()` を使用する際のバックアップ先のパス。この設定は、`File` を使用するために設定する必要があります。パスはインスタンスディレクトリに対して相対的であるか、絶対的であることができます。 | `true`    |
| `remove_backup_files_after_failure` | `BACKUP` コマンドが失敗した場合、ClickHouseは失敗前にバックアップにコピーされたファイルを削除しようとします。それ以外の場合は、コピーされたファイルをそのまま残します。     | `true`    |

この設定はデフォルトで次のように構成されています：

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
``` 

## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
バックアップ IOスレッドプールでスケジュール可能な最大ジョブ数。現在のS3バックアップロジックのため、このキューを無制限に保つことをお勧めします。

:::note
値が `0`（デフォルト）は無制限を意味します。
:::

## bcrypt_workfactor {#bcrypt_workfactor} 

[Bcryptアルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)を使用する `bcrypt_password` 認証タイプのワークファクター。
ワークファクターは、ハッシュを計算し、パスワードを確認するために必要な計算量と時間を定義します。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
高頻度認証を持つアプリケーションの場合、bcryptの計算オーバーヘッドを考慮して、代替の認証方法を検討してください。
:::

## blob_storage_log {#blob_storage_log} 

[`blob_storage_log`](../system-tables/blob_storage_log.md) システムテーブルの設定です。

<SystemLogParameters/>

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

## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval} 

組み込み辞書の再読み込み間隔（秒単位）。

ClickHouseは、x秒ごとに組み込み辞書を再読み込みします。これにより、サーバーを再起動することなく、「その場で」辞書を編集できます。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
``` 

## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" /> RAMの最大比率に対するキャッシュサイズを設定します。低メモリシステムでキャッシュサイズを減らすことを可能にします。

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" /> テスト目的のため。

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />
cgroupsでの対応するしきい値によって、サーバーの最大許可メモリ消費が調整される秒単位の間隔。

cgroupオブザーバーを無効にするには、この値を `0` に設定してください。

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" /> [コンパイルされた式](../../operations/caches.md) のためのキャッシュサイズ（要素数）を設定します。

## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" /> [コンパイルされた式](../../operations/caches.md) のためのキャッシュサイズ（バイト単位）を設定します。

## compression {#compression} 

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)-engineテーブルのデータ圧縮設定。

:::note
ClickHouseの使用を始めたばかりの場合は、これを変更しないことをお勧めします。
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

**`<case>` のフィールド**：

- `min_part_size` – データパートの最小サイズ。
- `min_part_size_ratio` – データパートサイズとテーブルサイズの比率。
- `method` – 圧縮方法。受け入れられる値：`lz4`、`lz4hc`、`zstd`、`deflate_qpl`。
- `level` – 圧縮レベル。 [コーデック](/sql-reference/statements/create/table#general-purpose-codecs)を参照してください。

:::note
複数の `<case>` セクションを構成できます。
:::

**条件が満たされた場合のアクション**：

- データパートがセットされた条件に一致する場合、ClickHouseは指定された圧縮方法を使用します。
- データパートが複数の条件セットに一致した場合、ClickHouseは最初に一致した条件セットを使用します。

:::note
データパートに対して条件が満たされない場合、ClickHouseは `lz4` 圧縮を使用します。
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
`concurrent_threads_soft_limit_num` および `concurrent_threads_soft_limit_ratio_to_cores` で指定された CPUスロットのスケジューリングをどのように行うかに関するポリシー。制限された数のCPUスロットが同時実行クエリ間にどのように配分されるか制御するアルゴリズム。スケジューラーはサーバーの再起動なしで実行時に変更できます。

可能な値：

- `round_robin` — `use_concurrency_control` = 1 の各クエリは最大 `max_threads` CPUスロットを割り当てます。スレッドごとに1スロット。競合が発生した場合、CPUスロットはラウンドロビンを使用してクエリに与えられます。最初のスロットは無条件に与えられるため、高 `max_threads` のクエリが多数存在する場合、遅延が発生する可能性があります。
- `fair_round_robin` — `use_concurrency_control` = 1 の各クエリは最大 `max_threads - 1` CPUスロットを割り当てます。すべてのクエリの最初のスレッドにCPUスロットを必要としない `round_robin` の変種です。このようにすると、`max_threads` = 1 のクエリはスロットを必要とせず、不公平にすべてのスロットを割り当てることはありません。

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />
リモートサーバーからデータを取得するためのスレッドを除く、すべてのクエリに対して実行を許可される最大のクエリ処理スレッド数。これはハードリミットではありません。制限に達した場合、クエリは実行するために少なくとも1スレッドを取得します。実行中に、より多くのスレッドを取得できればクエリは希望のスレッド数にスケールアップできます。

:::note
値が `0`（デフォルト）は無制限です。
:::

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" /> [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) と同様ですが、コアに対する比率です。

## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" /> ClickHouseがどのくらいの頻度で設定を再読み込みし、新しい変更を確認するか。

## core_dump {#core_dump} 

コアダンプファイルのサイズに対するソフトリミットを構成します。

:::note
ハードリミットはシステムツールを通じて構成されています。
:::

**例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
``` 

## cpu_slot_preemption {#cpu_slot_preemption} 

<SettingsInfoBlock type="Bool" default_value="0" />
CPUリソース（マスタースレッドとワーカー スレッド）の負荷スケジューリングがどのように行われるかを定義します。

- `true`（推奨）の場合、会計は実際に消費されたCPU時間に基づいて行われます。競合するワークロードに対して適正な量のCPU時間が割り当てられます。スロットは限られた時間だけ割り当てられ、期限が切れた後に再リクエストされます。スロットのリクエストはCPUリソースの過負荷が発生した場合、スレッドの実行をブロックする可能性がある、すなわち、前方排除が起こり得ます。これにより、CPU時間の公平性が確保されます。
- `false`（デフォルト）の場合、会計は割り当てられたCPUスロットの数に基づいて行われます。競合するワークロードに対して適正な量のCPUスロットが割り当てられます。スレッドが開始するとスロットが割り当てられ、継続的に保持され、スレッドが実行を終えると解放されます。クエリ実行のために割り当てられるスレッド数は1から `max_threads` に増加するだけで、減少することはありません。これは長期間実行するクエリに有利であり、ショートクエリに対してCPUストベーションを引き起こす可能性があります。
  
**例**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
``` 

**参照**
- [ワークロードスケジューリング](/operations/workload-scheduling.md)

## cpu_slot_preemption_timeout_ms {#cpu_slot_preemption_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
ワーカー スレッドが前方排除の間に、新しいCPUスロットを取得するのを待機することができるミリ秒の数を定義します。このタイムアウト後、スレッドが新しいCPUスロットを取得できなかった場合、それは終了し、クエリは動的に同時操作しているスレッドの数が少なくなるようにスケールダウンします。マスタースレッドは決してダウンスケールされませんが、無限に前方排除される可能性があります。`cpu_slot_preemption` が有効になっており、CPUリソースがワーカー スレッド用に設定されている場合にのみ意味があります。

**例**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
``` 

**参照**
- [ワークロードスケジューリング](/operations/workload-scheduling.md)

## cpu_slot_quantum_ns {#cpu_slot_quantum_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />
スレッドがCPUスロットを取得した後、新しいCPUスロットをリクエストする前に消費できるCPUナノ秒数を定義します。`cpu_slot_preemption` が有効になっており、CPUリソースがマスタースレッドまたはワーカー スレッド用に設定されている場合にのみ意味があります。

**例**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
``` 

**参照**
- [ワークロードスケジューリング](/operations/workload-scheduling.md)

## crash_log {#crash_log} 

[crash_log](../../operations/system-tables/crash_log.md) システムテーブル操作の設定。

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
`custom_cached_disks_base_directory` は、`filesystem_caches_path`（`filesystem_caches_path.xml` に見つかる）の上位にあるカスタムディスク用です。
前者が存在しない場合、後者が使用されます。
ファイルシステムキャッシュ設定パスは、このディレクトリ内に存在しなければならず、さもなければ作成を防ぐ例外が発生します。

:::note
これにより、サーバーがアップグレードされた古いバージョンで作成されたディスクには影響しません。
この場合、例外は発生しないため、サーバーは正常に起動します。
:::

例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
``` 

## custom_settings_prefixes {#custom_settings_prefixes} 

[カスタム設定](/operations/settings/query-level#custom_settings) のプレフィックスリスト。プレフィックスはカンマで区切る必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
``` 

**参照**

- [カスタム設定](/operations/settings/query-level#custom_settings)

## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" /> ドロップされたテーブルを [`UNDROP`](/sql-reference/statements/undrop.md) ステートメントを使用して復元できる遅延。 `DROP TABLE` が `SYNC` 修飾子で実行された場合、設定は無視されます。
この設定のデフォルトは `480`（8分）です。

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" /> テーブル削除が失敗した場合、ClickHouseはこのタイムアウトの間、操作を再試行するのを待ちます。

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" /> テーブル削除に使用されるスレッドプールのサイズ。

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
`store/` ディレクトリからゴミを掃除するタスクのパラメータ。
タスクのスケジューリング期間を設定します。

:::note
値が `0` は「決して」を意味します。デフォルト値は1日です。
:::

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />
`store/` ディレクトリからゴミを掃除するタスクのパラメータ。
ClickHouseサーバーによって使用されていないサブディレクトリがある場合、そのディレクトリが最後に修正されてから、[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒が経過すると、タスクはこのディレクトリを「隠す」ためにすべてのアクセス権を削除します。これは ClickHouse サーバーが `store/` 内に存在することを期待しないディレクトリにも機能します。

:::note
値が `0` は「即時」を意味します。
:::

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />
`store/` ディレクトリからゴミをクリーンアップするタスクのパラメータです。
もしクリックハウスサーバーによって使用されていないサブディレクトリがあり、以前に「隠されていた」
（[database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)を参照）
このディレクトリが最後の [`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒間変更されていなければ、タスクはこのディレクトリを削除します。
これはクリックハウスサーバーが `store/` 内で見ることを期待していないディレクトリにも適用されます。

:::note
`0` の値は「決してない」を意味します。デフォルト値は30日です。
:::
## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />レプリケートされたデータベースでテーブルを永続的に切り離すことを許可します。
## dead_letter_queue {#dead_letter_queue} 

`dead_letter_queue` システムテーブルの設定。

<SystemLogParameters/>

デフォルトの設定は以下の通りです。

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
## default_password_type {#default_password_type} 

`CREATE USER u IDENTIFIED BY 'p'` のようなクエリに自動的に設定されるパスワードのタイプを設定します。

受け入れられる値は次の通りです：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## default_profile {#default_profile} 

デフォルトの設定プロファイル。設定プロファイルは `user_config` で指定されたファイルに位置します。

**サンプル**

```xml
<default_profile>default</default_profile>
```
## default_replica_name {#default_replica_name} 

<SettingsInfoBlock type="String" default_value="{replica}" />
ZooKeeperにおけるレプリカ名です。

**サンプル**

```xml
<default_replica_name>{replica}</default_replica_name>
```
## default_replica_path {#default_replica_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />
ZooKeeperにおけるテーブルのパスです。

**サンプル**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```
## default_session_timeout {#default_session_timeout} 

デフォルトのセッションタイムアウト、秒単位です。

```xml
<default_session_timeout>60</default_session_timeout>
```
## dictionaries_config {#dictionaries_config} 

辞書用の設定ファイルのパスです。

パス：

- サーバー設定ファイルに対する絶対パスまたは相対パスを指定します。
- パスにはワイルドカード \* と ? を含めることができます。

さらに見る：
- "[Dictionaries](../../sql-reference/dictionaries/index.md)"。

**サンプル**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load} 

<SettingsInfoBlock type="Bool" default_value="1" />
辞書のレイジーロード。

- `true` の場合、各辞書は最初の使用時にロードされます。ロードが失敗した場合、辞書を使用していた関数は例外をスローします。
- `false` の場合、サーバーは起動時にすべての辞書をロードします。

:::note
サーバーは、接続を受け取る前に、すべての辞書がロードを完了するまで待機します
（例外：`wait_dictionaries_load_at_startup` が `false` に設定されている場合）。
:::

**サンプル**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />MySQLおよびPostgres辞書の再接続リトライの間隔（ミリ秒単位）。 `background_reconnect` が有効になっている場合。
## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />
すべての挿入/変更/削除クエリを無効にします。この設定は、挿入と変更が読み取りパフォーマンスに影響を与えないようにしたい場合に有効になります。
## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />内部DNSキャッシュを無効にします。Kubernetesのような頻繁に変わるインフラストラクチャでClickHouseを運用する場合に推奨されます。
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy} 

デフォルトでは、トンネリング（すなわち、`HTTP CONNECT`）が `HTTP` プロキシ経由で `HTTPS` リクエストを行うために使用されます。この設定を使用すると、それを無効にできます。

**no_proxy**

デフォルトでは、すべてのリクエストはプロキシを通過します。特定のホストについてプロキシを無効にするには、`no_proxy` 変数を設定する必要があります。
リストおよびリモートリゾルバに対して `<proxy>` 句内に設定でき、環境リゾルバのための環境変数として設定できます。
IPアドレス、ドメイン、サブドメイン、および完全バイパス用の `'*'` ワイルドカードをサポートしています。先頭のドットはcurlのように削除されます。

**サンプル**

以下の設定は、`clickhouse.cloud` とそのすべてのサブドメイン（例：`auth.clickhouse.cloud`）へのプロキシ要求をバイパスします。
同様に、GitLabにも適用され、リーディングドットがあります。`gitlab.com` と `about.gitlab.com` の両方がプロキシをバイパスします。

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

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限を超える接続は、著しく短い生存時間を持ちます。この制限はディスク接続に適用されます。
## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="30000" />この制限を超える接続は使用後にリセットされます。 接続キャッシュを無効にするには、0に設定します。この制限はディスク接続に適用されます。
## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />使用中の接続数がこの制限を超えると、警告メッセージがログに書き込まれます。この制限はディスク接続に適用されます。
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />
テーブル、データベース、テーブル関数、辞書に対する `SHOW` および `SELECT` クエリでシークレットを表示するかどうかを有効または無効にします。

シークレットを表示したいユーザーは、`format_display_secrets_in_show_and_select` フォーマット設定を有効にしており、`displaySecretsInShowAndSelect` (/sql-reference/statements/grant#displaysecretsinshowandselect) 権限を持っている必要があります。

可能な値:

- `0` — 無効。
- `1` — 有効。
## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client} 

<SettingsInfoBlock type="Bool" default_value="1" />キャッシュサーバーがクライアントから受け取ったスロットリング設定を適用するかどうか。
## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />アクティブな接続のソフト制限を分散キャッシュが維持しようとします。無料接続数が `distributed_cache_keep_up_free_connections_ratio * max_connections` を下回ると、最も古いアクティビティの接続が閉じられ、数が制限を超えるまで続きます。
## distributed_ddl {#distributed_ddl} 

クラスター上で [distributed ddl queries](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）を実行する管理設定。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) が有効な場合にのみ機能します。

`<distributed_ddl>` 内の設定可能な項目は以下の通りです：

| 設定                | 説明                                                                                                                           | デフォルト値                          |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| `path`               | DDLクエリの `task_queue` 用のKeeper内のパス                                                                                  |                                        |
| `profile`            | DDLクエリを実行するために使用されるプロファイル                                                                               |                                        |
| `pool_size`          | 同時に実行可能な `ON CLUSTER` クエリの数                                                                                  |                                        |
| `max_tasks_in_queue` | キューに保持できる最大タスク数。                                                                                             | `1,000`                                |
| `task_max_lifetime`  | 年齢がこの値を超えるノードを削除します。                                                                                       | `7 * 24 * 60 * 60`（秒単位で1週間）     |
| `cleanup_delay_period` | 新しいノードイベントの受信があった場合、最初のクリーンアップが `cleanup_delay_period` 秒以上前に行われていない場合にクリーンアップを開始します。 | `60` 秒                              |

**サンプル**

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
## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />名前をipv4アドレスに解決することを許可します。
## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />名前をipv6アドレスに解決することを許可します。
## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />内部DNSキャッシュの最大エントリ数です。
## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />内部DNSキャッシュの更新期間（秒単位）です。
## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />ホスト名の最大DNS解決失敗の回数。これを超えるとホスト名はClickHouse DNSキャッシュから削除されます。
## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />分散キャッシュを削除するために使用されるスレッドプールのサイズです。
## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />分散キャッシュを削除するために使用されるスレッドプールのキューサイズです。
## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Azure SDKからのロギングを有効にします。
## encryption {#encryption} 

[encryption codecs](/sql-reference/statements/create/table#encryption-codecs) に使用するキーを取得するためのコマンドを構成します。キー（またはキー）は環境変数内に書き込むか、設定ファイルに設定する必要があります。

キーは16バイトの長さの16進数または文字列である必要があります。

**サンプル**

設定からの読み込み：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
設定ファイル内にキーを保存することは推奨されません。安全ではありません。キーを安全なディスク上の別の設定ファイルに移動し、その設定ファイルへのシンボリックリンクを `config.d/` フォルダーに配置することをお勧めします。
:::

設定からの読み込み、キーが16進数の場合：

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

ここで、`current_key_id` は暗号化のための現在のキーを設定し、すべての指定されたキーは復号に使用されます。

これらの方法は複数のキーに対して適用できます：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで、`current_key_id` は暗号化のための現在のキーを示します。

また、ユーザーは12バイトの長さである必要のあるノンスを追加できます（デフォルトでは、暗号化および復号のプロセスはゼロバイトからなるノンスを使用します）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または16進数で設定できます：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上記で述べたすべてのことは `aes_256_gcm_siv` に適用できます（ただし、キーの長さは32バイトでなければなりません）。
:::
## error_log {#error_log} 

デフォルトでは無効になっています。

**有効にする**

エラー履歴収集を手動で有効にするには、[`system.error_log`](../../operations/system-tables/error_log.md) のために、次の内容を持つ `/etc/clickhouse-server/config.d/error_log.xml` を作成します。

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

**無効にする**

`error_log` 設定を無効にするには、次の内容を持つファイル `/etc/clickhouse-server/config.d/disable_error_log.xml` を作成する必要があります。

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
入力を解析するためにスレッドプールでスケジュール可能な最大ジョブ数です。

:::note
`0` の値は無制限を意味します。
:::
## format_schema_path {#format_schema_path} 

入力データのスキーマが格納されているディレクトリのパス、[CapnProto](../../interfaces/formats.md#capnproto) フォーマットのスキーマなど。

**サンプル**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="0" />グローバルプロファイラのCPUクロックタイマーの期間（ナノ秒単位）。0の値を設定すると、CPUクロックグローバルプロファイラがオフになります。推奨値は、単一クエリに対しては少なくとも10000000（1秒あたり100回）、クラスター全体のプロファイリングに対しては1000000000（1秒あたり1回）です。
## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="0" />グローバルプロファイラの実時間クロックタイマーの期間（ナノ秒単位）。0の値を設定すると、実時間グローバルプロファイラがオフになります。推奨値は、単一クエリに対しては少なくとも10000000（1秒あたり100回）、クラスター全体のプロファイリングに対しては1000000000（1秒あたり1回）です。
## google_protos_path {#google_protos_path} 

Protobufタイプのprotoファイルを含むディレクトリを定義します。

例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## graphite {#graphite} 

[Graphite](https://github.com/graphite-project) にデータを送信します。

設定：

- `host` – Graphiteサーバー。
- `port` – Graphiteサーバー上のポート。
- `interval` – 送信の間隔、秒単位。
- `timeout` – データ送信のタイムアウト、秒単位。
- `root_path` – キーの接頭辞。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからのデータ送信。
- `events` – [system.events](/operations/system-tables/events) テーブルからの期間中に蓄積されたデータの送信。
- `events_cumulative` – [system.events](/operations/system-tables/events) テーブルからの累積データの送信。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルからのデータ送信。

複数の `<graphite>` 句を構成できます。たとえば、異なる間隔で異なるデータを送信するために使用できます。

**サンプル**

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

Graphite用のデータを圧縮する設定。

詳細については、[GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)を参照してください。

**サンプル**

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
`0` の値はClickHouseがHSTSを無効にすることを意味します。正の数を設定すると、HSTSが有効になり、max-ageは設定した数値になります。
:::

**サンプル**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この制限を超える接続は著しく短い生存時間を持ちます。この制限は、ディスクやストレージに属さないHTTP接続に適用されます。
## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限を超える接続は使用後にリセットされます。接続キャッシュを無効にするには、0に設定します。この制限は、ディスクやストレージに属さないHTTP接続に適用されます。
## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />使用中の接続数がこの制限を超えると、警告メッセージがログに書き込まれます。この制限は、ディスクやストレージに属さないHTTP接続に適用されます。
## http_handlers {#http_handlers} 

カスタムHTTPハンドラを使用できるようにします。
新しいhttpハンドラを追加するには、新しい `<rule>` を追加します。
ルールは定義された通り、上から下へとチェックされます。
最初の一致がハンドラを実行します。

次の設定はサブタグによって構成できます：

| サブタグ             | 定義                                                                                                                                  |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | リクエストURLを一致させるために、オプションで `regex:` プレフィックスを使用してRegex一致を使えます。                                       |
| `methods`            | リクエストメソッドに一致させるために、複数のメソッドをコンマで分けることができます（オプション）。                                             |
| `headers`            | リクエストヘッダーに一致させるために、各子要素（子要素の名前はヘッダー名）を一致させます。オプションで `regex:` プレフィックスを使用できます。 |
| `handler`            | リクエストハンドラ                                                                                                                   |
| `empty_query_string` | URLにクエリストリングがないことを確認します                                                                                               |

`handler` には次の設定が含まれ、サブタグで構成できます：

| サブタグ           | 定義                                                                                                                                                         |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | リダイレクトの場所                                                                                                                                              |
| `type`             | サポートされているタイプ：static、dynamic_query_handler、predefined_query_handler、redirect                                                                       |
| `status`           | staticタイプで使用、レスポンスのステータスコード                                                                                                             |
| `query_param_name` | dynamic_query_handlerタイプで使用、HTTPリクエストパラメータ内の `<query_param_name>` 値に対応する値を抽出して実行します。                               |
| `query`            | predefined_query_handlerタイプで使用、ハンドラが呼び出されるときにクエリを実行します。                                                                       |
| `content_type`     | staticタイプで使用、レスポンスのコンテンツタイプ                                                                                                           |
| `response_content` | staticタイプで使用、クライアントに送信されるレスポンスコンテンツ。`file://`または`config://`というプレフィックスを使用する場合、ファイルまたは設定からコンテンツを取得します。 |

ルールのリストに加えて、すべてのデフォルトハンドラを有効にするために `<defaults/>` を指定できます。

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

`OPTIONS` HTTP リクエストのレスポンスにヘッダーを追加するために使用されます。
`OPTIONS` メソッドはCORSのプレフライトリクエストを行う際に使用されます。

詳細情報については、[OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS) を参照してください。

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

ClickHouse HTTP(S) サーバーにアクセスしたときにデフォルトで表示されるページです。
デフォルト値は "Ok."（最後に改行があります）。

**例**

`http://localhost: http_port` にアクセスすると `https://tabix.io/` が開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />アイスバーグカタログのバックグラウンドプールのサイズ
## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />アイスバーグカタログプールにプッシュ可能なタスクの数
## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

アイスバーグメタデータファイルキャッシュのエントリ数の最大サイズ。ゼロは無効を意味します。
## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

アイスバーグメタデータキャッシュポリシー名。
## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

アイスバーグメタデータキャッシュの最大サイズ（バイト単位）。ゼロは無効を意味します。
## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

アイスバーグメタデータキャッシュ内の保護キューのサイズ（SLRUポリシーの場合）、キャッシュの全体的なサイズに対する比率です。
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />
`true` の場合、ClickHouseは `CREATE VIEW` クエリの空のSQLセキュリティステートメントにデフォルトを書き込まない。
:::note
この設定は移行期間のみに必要であり、24.4で廃止されます。
:::
## include_from {#include_from} 

置換が含まれるファイルのパスです。XML形式とYAML形式の両方がサポートされています。

詳細については、"[Configuration files](/operations/configuration-files)" のセクションを参照してください。

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
`0` の値は無効を意味します。

この設定はランタイムで変更可能で、即座に効果を発揮します。
:::
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />セカンダリインデックスマークキャッシュ内の保護キューのサイズ（SLRUポリシーが適用される場合）、キャッシュの全体的なサイズに対する比率です。
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />セカンダリインデックスの非圧縮キャッシュポリシー名。
## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
`MergeTree` インデックスの非圧縮ブロック用のキャッシュの最大サイズ。

:::note
`0` の値は無効を意味します。

この設定はランタイムで変更可能で、即座に効果を発揮します。
:::
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />セカンダリインデックスの非圧縮キャッシュ内の保護キューのサイズ（SLRUポリシーが適用される場合）、キャッシュの全体的なサイズに対する比率です。
## interserver_http_credentials {#interserver_http_credentials} 

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md) 時に他のサーバーに接続するために使用されるユーザー名とパスワードです。さらに、サーバーはこれらの資格情報を使用して他のレプリカを認証します。
`interserver_http_credentials` はしたがって、クラスター内のすべてのレプリカで同じでなければなりません。

:::note
- デフォルトでは、`interserver_http_credentials` セクションが省略されると、レプリケーション中に認証が使用されません。
- `interserver_http_credentials` 設定は、ClickHouseクライアント資格情報の[構成](../../interfaces/cli.md#configuration_files)に関連していません。
- これらの資格情報は、`HTTP` および `HTTPS` によるレプリケーションで共通です。
:::

次の設定はサブタグによって構成できます：

- `user` — ユーザー名。
- `password` — パスワード。
- `allow_empty` — `true` の場合、他のレプリカは資格情報が設定されていても認証なしで接続できます。 `false` の場合、無認証での接続は拒否されます。デフォルトは `false`です。
- `old` — 資格情報のローテーション中に使用された古い`user` および `password`を含みます。複数の`old`セクションを指定できます。

**資格情報のローテーション**

ClickHouseは、すべてのレプリカを同時に停止せずに、動的なインタサーバー資格情報ローテーションをサポートしています。資格情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、資格情報を追加します。これにより、認証された接続と無認証の接続が可能になります。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカの設定が完了したら、`allow_empty` を `false` に設定するか、この設定を削除します。これにより、新しい資格情報による認証が義務付けられます。

既存の資格情報を変更するには、ユーザー名とパスワードを `interserver_http_credentials.old` セクションに移動し、新しい値で `user` と `password` を更新します。この時点で、サーバーは新しい資格情報を使用して他のレプリカに接続し、新しい資格情報または古い資格情報のいずれかで接続を受け入れます。

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

新しい資格情報がすべてのレプリカに適用されると、古い資格情報を削除できます。
## interserver_http_host {#interserver_http_host} 

他のサーバーがこのサーバーにアクセスするために使用できるホスト名です。

省略した場合、`hostname -f` コマンドと同じ方法で決定されます。

特定のネットワークインターフェースから切り替えるのに便利です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_http_port {#interserver_http_port} 

ClickHouseサーバー間のデータ交換のためのポートです。

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

`HTTPS` 経由でClickHouseサーバー間のデータ交換のためのポートです。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_listen_host {#interserver_listen_host} 

ClickHouseサーバー間でデータを交換できるホストに対する制限です。
Keeperが使用されている場合、異なるKeeperインスタンス間の通信にも同じ制限が適用されます。

:::note
デフォルトでは、値は [`listen_host`](#listen_host) 設定と等しくなります。
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
IOスレッドプールでスケジュールできるジョブの最大数です。

:::note
`0` の値は無制限を意味します。
:::
## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />jemallocのサンプリングされたメモリ割り当てをsystem.trace_logに保存します。
## jemalloc_enable_background_threads {#jemalloc_enable_background_threads} 

<SettingsInfoBlock type="Bool" default_value="1" />jemallocのバックグラウンドスレッドを有効にします。jemallocはバックグラウンドスレッドを使用して未使用のメモリページをクリーンアップします。これを無効にすることはパフォーマンスの低下を引き起こす可能性があります。
## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />すべてのスレッドのためにjemallocの割当プロファイラを有効にします。jemallocはサンプリング割当てとサンプリングされた割当てのすべての解放をサンプリングします。
プロファイルは、割当分析に使用することができるSYSTEM JEMALLOC FLUSH PROFILEを使用してフラッシュできます。
サンプルは、jemalloc_collect_global_profile_samples_in_trace_logの設定を使用してsystem.trace_logに保存することもできます。
[Allocation Profiling](/operations/allocation-profiling)を参照してください。
## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes} 

jemallocプロファイルのフラッシュは、全体のピークメモリ使用量がjemalloc_flush_profile_interval_bytesによって増加した後に行われます。
## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded} 

全体のメモリ超過エラーが発生したときにjemallocプロファイルのフラッシュが行われます。
## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num} 

作成するjemallocバックグラウンドスレッドの最大数で、0を設定するとjemallocのデフォルトの値を使用します。
## keep_alive_timeout {#keep_alive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />
ClickHouseが接続を閉じる前にHTTPプロトコルでの受信リクエストを待機する秒数です。

**例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## keeper_hosts {#keeper_hosts} 

動的設定。ClickHouseが接続できる可能性のある[Zoo]Keeperホストのセットを含みます。 ``<auxiliary_zookeepers>`` の情報は公開されません。
## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />バッチをサポートする [Zoo]KeeperへのMultiRead要求の最大バッチサイズ。0に設定すると、バッチ処理が無効になります。ClickHouse Cloud のみで利用可能です。
## ldap_servers {#ldap_servers} 

LDAP サーバーとその接続パラメータをここにリストします：
- 「password」ではなく「ldap」認証メカニズムを指定された専用ローカルユーザーの認証者として使用するため
- リモートユーザーディレクトリとして使用するため

以下の設定はサブタグで構成できます：

| 設定                          | 説明                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                        | LDAP サーバーのホスト名または IP。これは必須のパラメータで空にはできません。                                                                                                                                                                                                                                                                                                                                                       |
| `port`                        | LDAP サーバーのポート。`enable_tls` が true に設定されている場合、デフォルトは 636 です。それ以外は 389 です。                                                                                                                                                                                                                                                                                                                 |
| `bind_dn`                     | バインドに使用される DN を構築するためのテンプレート。結果として得られる DN は、各認証attemptの際にテンプレートのすべての`\{user_name\}`サブストリングを実際のユーザー名に置き換えることによって構築されます。                                                                                                                                                                                                                                     |
| `user_dn_detection`           | バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータのセクション。これは主にサーバーが Active Directory の場合、さらなる役割マッピングのための検索フィルタに使用されます。` \{user_dn\}` サブストリングが指定できる場所で使用される結果のユーザー DN が適用されます。デフォルトでは、ユーザー DN はバインド DN と等しく設定されますが、検索が実行されると、実際の検出されたユーザー DN 値で更新されます。 |
| `verification_cooldown`       | 成功したバインド試行の後、LDAP サーバーに連絡せずに、連続するすべてのリクエストに対してユーザーが正常に認証されたと見なされる時間（秒単位）。デフォルトは `0`（キャッシングを無効にし、各認証リクエストごとに LDAP サーバーに連絡するよう強制）。                                                                                                            |
| `enable_tls`                  | LDAP サーバーへの安全な接続を使用するためのフラグ。プレーンテキスト (`ldap://`) プロトコルのために `no` を指定（推奨されません）。SSL/TLS (`ldaps://`) プロトコルのために `yes` を指定（推奨、デフォルト）。レガシー StartTLS プロトコルのために `starttls` を指定（プレーンテキスト (`ldap://`) プロトコルを TLS にアップグレード）。                                                                  |
| `tls_minimum_protocol_version`| SSL/TLS の最小プロトコルバージョン。受け入れられる値は `ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（デフォルト）。                                                                                                                                                                                                                                                                                                           |
| `tls_require_cert`            | SSL/TLS ピア証明書検証の動作。受け入れられる値は `never`、`allow`、`try`、`demand`（デフォルト）。                                                                                                                                                                                                                                                                                                                         |
| `tls_cert_file`               | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tls_key_file`                | 証明書キーのファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tls_ca_cert_file`            | CA 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tls_ca_cert_dir`             | CA 証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                          |
| `tls_cipher_suite`            | 許可された暗号スイート（OpenSSL 表記）。                                                                                                                                                                                                                                                                                                                                                                                         |

`user_dn_detection` の設定はサブタグで構成できます：

| 設定             | 説明                                                                                                                                                                                                                                            |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`        | LDAP 検索のためのベース DN を構築するためのテンプレート。LDAP 検索中にテンプレートのすべての `\{user_name\}` および `\{bind_dn\}` サブストリングを実際のユーザー名およびバインド DN に置き換えることによって構築されます。                                                                         |
| `scope`          | LDAP 検索の範囲。受け入れられる値は： `base`、`one_level`、`children`、`subtree`（デフォルト）。                                                                                                                                                     |
| `search_filter`  | LDAP 検索のための検索フィルタを構築するためのテンプレート。LDAP 検索中にテンプレートのすべての `\{user_name\}`、`\{bind_dn\}`、および `\{base_dn\}` サブストリングを実際のユーザー名、バインド DN、およびベース DN に置き換えることによって構築されます。特別な文字は XML で適切にエスケープする必要があります。 |

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

例（ユーザ DN 検出が構成された典型的な Active Directory）：

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

リッスンソケットのバックログ（保留中の接続のキューサイズ）。デフォルト値の `4096` は、linux の [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4) の値と同じです。

通常、この値は変更する必要がありません。理由は次のとおりです：
- デフォルト値は十分に大きい。
- クライアントの接続を受け入れるためにサーバーには別のスレッドがあります。

したがって、`TcpExtListenOverflows`（`nstat` から）が非ゼロで、このカウンターが ClickHouse サーバーで増加していても、値を増加させる必要があるわけではありません。理由は次のとおりです：
- 通常、`4096` では不十分な場合は、何らかの内部の ClickHouse スケーリングの問題を示しているため、問題を報告する方が良い。
- それはサーバーが後でさらに多くの接続を処理できることを意味するわけではありません（仮にできたとしても、その時点でクライアントは切断されているかもしれません）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```
## listen_host {#listen_host} 

リクエストが来るホストの制限。サーバーがすべてのリクエストに応答するようにする場合は、`::` を指定します。

例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_reuse_port {#listen_reuse_port} 

同じアドレス:ポートで複数のサーバーがリッスンすることを許可します。リクエストはオペレーティングシステムによってランダムなサーバーにルーティングされます。この設定を有効にすることは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

タイプ：

デフォルト：
## listen_try {#listen_try} 

IPv6 または IPv4 ネットワークが利用不可能な場合にリッスンしようとする際にサーバーが終了しません。

**例**

```xml
<listen_try>0</listen_try>
```
## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />マークの読み込み用バックグラウンドプールのサイズ
## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />プリフェッチプールにプッシュできるタスクの数
## logger {#logger} 

ログメッセージの場所と形式。

**キー**：

| キー                    | 説明                                                                                                                                                        |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                 | ログレベル。許容される値: `none`（ログオフ）、`fatal`、`critical`、`error`、`warning`、`notice`、`information`,`debug`、`trace`、`test`                 |
| `log`                   | ログファイルへのパス。                                                                                                                                          |
| `errorlog`              | エラーログファイルへのパス。                                                                                                                                    |
| `size`                  | ローテーションポリシー：ログファイルの最大サイズ（バイト単位）。ログファイルのサイズがこのしきい値を超えると、ファイル名が変更されアーカイブされ、新しいログファイルが作成されます。 |
| `count`                 | ローテーションポリシー：Clickhouse が保持する履歴ログファイルの最大数。                                                                                        |
| `stream_compress`       | LZ4 を使用してログメッセージを圧縮します。`1` または `true` に設定して有効にします。                                                                             |
| `console`               | コンソールへのロギングを有効にします。`1` または `true` に設定して有効にします。デーモンモードで Clickhouse が実行されていない場合はデフォルトで `1`、それ以外は `0` です。                          |
| `console_log_level`     | コンソール出力のログレベル。デフォルトは `level`。                                                                                                                 |
| `formatting.type`       | コンソール出力のログ形式。現在は `json` のみがサポートされています。                                                                                                 |
| `use_syslog`            | ログ出力を syslog にも転送します。                                                                                                                                 |
| `syslog_level`          | syslog にログを記録するためのログレベル。                                                                                                                                   |
| `async`                 | `true`（デフォルト）の場合、ロギングは非同期に行われます（出力チャネルごとに1つのバックグラウンドスレッド）。さもなければ、LOG を呼び出しているスレッド内でロギングされます。           |
| `async_queue_max_size`  | 非同期ロギングを使用する場合、フラッシュ待ちのメッセージの最大数。余分なメッセージはドロップされます。                                                                 |
| `startup_level`         | サーバー起動時にルートロガーレベルを設定するために使用する起動レベル。起動後、ログレベルは `level` 設定に元に戻ります。                                   |
| `shutdown_level`        | シャットダウン時にルートロガーレベルを設定するために使用するシャットダウンレベル。                                                                                            |

**ログ形式仕様**

`log` と `errorLog` パスのファイル名は、結果のファイル名のための以下の形式指定子をサポートします（ディレクトリ部分はサポートされません）。

「例」列に `2023-07-06 18:32:07` での出力を示します。

| 指定子      | 説明                                                                                                           | 例                       |
|-------------|-----------------------------------------------------------------------------------------------------------------|-------------------------|
| `%%`        | リテラル %                                                                                                        | `%`                       |
| `%n`        | 改行文字                                                                                                       |                          |
| `%t`        | 水平タブ文字                                                                                                    |                          |
| `%Y`        | 10進数で表された年（例：2017）                                                                                        | `2023`                    |
| `%y`        | 年の最後の 2 桁を 10 進数で表す（範囲 [00,99]）                                                                      | `23`                      |
| `%C`        | 年の最初の 2 桁を 10 進数で示す（範囲 [00,99]）                                                                     | `20`                      |
| `%G`        | 4 桁の [ISO 8601 週ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、すなわち指定された週を含む年です。通常は `%V` と一緒に使用します。  | `2023`        |
| `%g`        | 最後の 2 桁の [ISO 8601 週ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、すなわち指定された週を含む年。                              | `23`         |
| `%b`        | 省略形の月名（ロケール依存）、例: Oct                                                                                | `Jul`                     |
| `%h`        | %b の同義語                                                                                                      | `Jul`                     |
| `%B`        | フルの月名（ロケール依存）、例: October                                                                               | `July`                   |
| `%m`        | 10進数で表された月（範囲 [01,12]）                                                                                | `07`                      |
| `%U`        | 年の週番号（日曜日が週の最初の日）（範囲 [00,53]）                                                                  | `27`                      |
| `%W`        | 年の週番号（月曜日が週の最初の日）（範囲 [00,53]）                                                                  | `27`                      |
| `%V`        | ISO 8601 週番号（範囲 [01,53]）                                                                                    | `27`                      |
| `%j`        | 年の 10 進数で表された日（範囲 [001,366]）                                                                         | `187`                     |
| `%d`        | 日付（月日）を 0 パディングされた 10 進数で表した数字（範囲 [01,31]）。 1 桁は 0 で前置されます。                                        | `06`                      |
| `%e`        | 日付（月日）をスペースでパディングされた 10 進数で表した数字（範囲 [1,31]）。1 桁はスペースで前置されます。                                             | `&nbsp; 6`                 |
| `%a`        | 省略形の曜日名（ロケール依存）、例: Fri                                                                                  | `Thu`                     |
| `%A`        | フルの曜日名（ロケール依存）、例: Friday                                                                               | `Thursday`                |
| `%w`        | 曜日を整数で示す（日曜日は0）（範囲 [0-6]）                                                                       | `4`                       |
| `%u`        | 曜日を 10 進数で示す（月曜日は1）（ISO 8601 形式）（範囲 [1-7]）                                               | `4`                       |
| `%H`        | 24 時間制の時を 10 進数で表した数字（範囲 [00-23]）                                                                  | `18`                      |
| `%I`        | 12 時間制の時を 10 進数で表した数字（範囲 [01,12]）                                                                | `06`                      |
| `%M`        | 分を 10 進数で表した数字（範囲 [00,59]）                                                                          | `32`                      |
| `%S`        | 秒を 10 進数で表した数字（範囲 [00,60]）                                                                          | `07`                      |
| `%c`        | 標準の日付と時刻の文字列（ロケール依存）、例：Sun Oct 17 04:41:13 2010                                              | `Thu Jul  6 18:32:07 2023` |
| `%x`        | ローカライズされた日付表現（ロケール依存）                                                                          | `07/06/23`                 |
| `%X`        | ローカライズされた時刻表現、例: 18:40:20 または 6:40:20 PM （ロケール依存）                                                  | `18:32:07`                 |
| `%D`        | 短い MM/DD/YY 日付（%m/%d/%y と同等）                                                                                  | `07/06/23`                 |
| `%F`        | 短い YYYY-MM-DD 日付（%Y-%m-%d と同等）                                                                              | `2023-07-06`               |
| `%r`        | ローカライズされた 12 時間形式の時刻（ロケール依存）                                                                   | `06:32:07 PM`             |
| `%R`        | "%H:%M" と同等                                                                                                      | `18:32`                   |
| `%T`        | "%H:%M:%S" と同等（ISO 8601 時刻形式）                                                                                 | `18:32:07`               |
| `%p`        | ローカライズされた a.m. または p.m. 指示（ロケール依存）                                                          | `PM`                      |
| `%z`        | UTC からのオフセットを ISO 8601 形式で（例：-0430）、またはタイムゾーン情報が利用できない場合は文字がない                               | `+0800`                   |
| `%Z`        | ロケール依存のタイムゾーン名または省略形、またはタイムゾーン情報が利用できない場合は文字がない                           | `Z AWST `                 |

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

コンソールにのみログメッセージを出力するには：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個々のログ名のログレベルをオーバーライドできます。たとえば、「Backup」および「RBAC」のロガーのすべてのメッセージをミュートするには。

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

ログメッセージを追加で syslog に書き込むには：

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

`<syslog>` のためのキー：

| キー        | 説明                                                                                                                                                                                                                                                     |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`   | `host\[:port\]` 形式の syslog のアドレス。省略された場合は、ローカルデーモンが使用されます。                                                                                                                                                          |
| `hostname`  | ログを送信するホストの名前（オプション）。                                                                                                                                                                                                     |
| `facility`  | syslog の [ファシリティキーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。大文字で「LOG_」プレフィックスをつけて指定しなければなりません。例：`LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` 等。`address` が指定されている場合はデフォルトは `LOG_USER`、それ以外は `LOG_DAEMON` です。  |
| `format`    | ログメッセージ形式。可能な値：`bsd` と `syslog`。                                                                                                                                                                                                                         |

**ログ形式**

コンソールログに出力されるログ形式を指定できます。現在、JSON のみがサポートされています。

**例**

出力 JSON ログの例：

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

JSON ロギングサポートを有効にするには、次のスニペットを使用します：

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

**JSON ログ用のキーのリネーム**

キー名は `<names>` タグ内の値を変更することにより変更できます。たとえば、`DATE_TIME` を `MY_DATE_TIME` に変更するには、`<date_time>MY_DATE_TIME</date_time>` を使用します。

**JSON ログ用のキーを省略**

ログプロパティはプロパティをコメントアウトすることにより省略できます。たとえば、ログに `query_id` を印刷したくない場合は、`<query_id>` タグをコメントアウトできます。
## macros {#macros} 

レプリケートテーブルのパラメータ置換。

レプリケートテーブルが使用されない場合は省略できます。

詳細については、[レプリケートテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) セクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```
## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />マークキャッシュポリシー名。
## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />プレウォーム時に埋めるマークキャッシュの合計サイズに対する比率。
## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
マークのキャッシュの最大サイズ（[`MergeTree`](/engines/table-engines/mergetree-family) テーブルファミリのインデックス）。

:::note
この設定は実行時に変更でき、直ちに効果を発揮します。
:::
## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />マークキャッシュの総サイズに対する保護キューのサイズ（SLRU ポリシーの場合）。
## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />起動時にアクティブなデータパーツのセットを読み込むために使用するスレッドの数。
## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ユーザーが作成または変更できる認証メソッドの最大数。
この設定を変更しても既存のユーザーには影響しません。この設定で指定された制限を超える認証関連のクエリを作成または変更すると失敗します。
非認証の作成または変更のクエリは成功します。

:::note
値が `0` の場合は無制限です。
:::
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーでのすべてのバックアップの最大読み取り速度（バイト毎秒）。ゼロは無制限を意味します。
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />バックアップ I/O スレッドプール内の**アイドル**スレッドの数が `max_backup_io_thread_pool_free_size` を超えた場合、ClickHouse はアイドルスレッドが占有しているリソースを解放し、プールサイズを減少させます。必要に応じてスレッドを再作成できます。
## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse は S3 バックアップ I/O 操作を行うためにバックアップ I/O スレッドプールからスレッドを使用します。`max_backups_io_thread_pool_size` はプール内のスレッドの最大数を制限します。
## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
ベクトルインデックスを構築するために使用する最大スレッド数。

:::note
値が `0` の場合はすべてのコアを意味します。
:::
## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時挿入クエリの総数に対する制限。

:::note

値が `0`（デフォルト）は無制限を意味します。

この設定は実行時に変更でき、直ちに効果を発揮します。すでに実行中のクエリは変わりません。
:::
## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に実行されるクエリの総数に対する制限。`INSERT` および `SELECT` クエリの制限、およびユーザーの最大クエリ数も考慮する必要があります。

また、参照してください：
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

値が `0`（デフォルト）は無制限を意味します。

この設定は実行時に変更でき、直ちに効果を発揮します。すでに実行中のクエリは変わりません。
:::
## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時に選択されるクエリの総数の制限。

:::note

値が `0`（デフォルト）は無制限を意味します。

この設定は実行時に変更でき、直ちに効果を発揮します。すでに実行中のクエリは変わりません。
:::
## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />サーバーの最大接続数。
## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />データベースの数がこの値を超えると、サーバーは例外を投げます。0 は制限なしを意味します。
## max_database_num_to_warn {#max_database_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
接続されたデータベースの数が指定された値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```
## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />DatabaseReplicated でレプリカの回復中にテーブルを作成するためのスレッドの数。ゼロはスレッドの数がコアの数に等しいことを意味します。
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
辞書の数がこの値を超えると、サーバーは例外を投げます。

データベースエンジン用のテーブルのみをカウントします：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
値が `0` の場合は制限なしを意味します。
:::

**例**
```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```
## max_dictionary_num_to_warn {#max_dictionary_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
接続された辞書の数が指定された値を超えると、ClickHouse サーバーは `system.warnings` テーブルに警告メッセージを追加します。

**例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```
## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーの分散キャッシュからの最大読み取り速度（バイト毎秒）。ゼロは無制限を意味します。
## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーの分散キャッシュへの最大書き込み速度（バイト毎秒）。ゼロは無制限を意味します。
## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />集約中に収集されたハッシュテーブル統計の許可されるエントリ数
## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITIONのためのスレッド数です。
## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
入力を解析するためにスレッドプール内に保持すべき最大のアイドル待機スレッド数です。
## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
入力を解析するために使用する最大のスレッド数の合計です。
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
IOスレッドプール内の**アイドル**スレッドの数が`max_io_thread_pool_free_size`を超えると、ClickHouseはアイドルスレッドによって占有されているリソースを解放し、プールサイズを減少させます。必要に応じて再度スレッドを作成できます。
## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouseはIOスレッドプールからスレッドを使用していくつかのIO操作（例：S3との相互作用）を行います。`max_io_thread_pool_size`はプール内のスレッド数の最大数を制限します。
## max_keep_alive_requests {#max_keep_alive_requests} 

単一のキープアライブ接続を通じて、ClickHouseサーバーによって閉じられる前までの最大リクエスト数。

**例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
ローカル読み取りの最大速度（バイト/秒）です。

:::note
`0`の値は制限がないことを意味します。
:::
## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
ローカル書き込みの最大速度（バイト/秒）です。

:::note
`0`の値は制限がないことを意味します。
:::
## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

テーブルに接続されているマテリアライズドビューの数の制限です。

:::note
ここでは直接依存するビューのみが考慮され、他のビューの上に作成されたビューは考慮されません。
:::
## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

サーバー上のすべてのマージの最大読み取り速度（バイト/秒）です。ゼロは制限なしを意味します。
## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

サーバー上のすべてのミューテーションの最大読み取り速度（バイト/秒）です。ゼロは制限なしを意味します。
## max_named_collection_num_to_throw {#max_named_collection_num_to_throw} 

名前付きコレクションの数がこの値を超えると、サーバーは例外をスローします。

:::note
`0`の値は制限がないことを意味します。
:::

**例**
```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```
## max_named_collection_num_to_warn {#max_named_collection_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
名前付きコレクションの数が指定した値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```
## max_open_files {#max_open_files} 

最大オープンファイル数です。

:::note
`getrlimit()`関数が不正確な値を返すため、macOSでこのオプションを使用することを推奨します。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```
## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
接続を削除するために考慮されるOS CPU待機（OSCPUWaitMicrosecondsメトリック）とビジー（OSCPUVirtualTimeMicrosecondsメトリック）時間の最大比率です。最小値と最大値の比率の間の線形補間が確率を計算するために使用され、この時点での確率は1です。
詳細については、[サーバーのCPUオーバーロード時の動作制御](/operations/settings/server-overload)を参照してください。
## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

起動時に非アクティブなデータパーツ（古いもの）をロードするためのスレッド数です。
## max_part_num_to_warn {#max_part_num_to_warn} 

アクティブなパーツの数が指定した値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```
## max_partition_size_to_drop {#max_partition_size_to_drop} 

パーティションを削除するための制限です。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのサイズが[`max_partition_size_to_drop`](#max_partition_size_to_drop)（バイト）を超えると、[DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart)クエリを使用してパーティションを削除することはできません。
この設定を適用するために、ClickHouseサーバーを再起動する必要はありません。制限を無効にする別の方法は、`<clickhouse-path>/flags/force_drop_table`ファイルを作成することです。

:::note
値`0`は、制限なしでパーティションを削除できることを意味します。

この制限は、テーブルの削除および切り捨てには影響しません。詳細は[max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)を参照してください。
:::

**例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```
## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />非アクティブなデータパーツの同時削除のためのスレッド数です。
## max_pending_mutations_execution_time_to_warn {#max_pending_mutations_execution_time_to_warn} 

保留中のミューテーションのいずれかが指定された秒数を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```
## max_pending_mutations_to_warn {#max_pending_mutations_to_warn} 

保留中のミューテーションの数が指定した値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```
## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
プレフィックスデシリアライズスレッドプール内の**アイドル**スレッドの数が`max_prefixes_deserialization_thread_pool_free_size`を超えると、ClickHouseはアイドルスレッドによって占有されているリソースを解放し、プールサイズを減少させます。必要に応じて再度スレッドを作成できます。
## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouseはプレフィックスデシリアライズスレッドプールからスレッドを使用して、MergeTreeのWideパーツのファイルプレフィックスからカラムとサブカラムのメタデータを並行して読み取ります。`max_prefixes_deserialization_thread_pool_size`はプール内のスレッド数の最大数を制限します。
## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
読み取りのためのネットワーク上のデータ交換の最大速度（バイト/秒）です。

:::note
`0`（デフォルト）の値は制限なしを意味します。
:::
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
書き込みのためのネットワーク上のデータ交換の最大速度（バイト/秒）です。

:::note
`0`（デフォルト）の値は制限なしを意味します。
:::
## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

レプリケートされたフェッチのためのネットワーク上のデータ交換の最大速度（バイト/秒）です。ゼロは制限なしを意味します。
## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

レプリケートされた送信のためのネットワーク上のデータ交換の最大速度（バイト/秒）です。ゼロは制限なしを意味します。
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw} 

レプリケートされたテーブルの数がこの値を超えると、サーバーは例外をスローします。

データベースエンジンのためにカウントされるテーブルのみ:
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0`の値は制限がないことを意味します。
:::

**例**
```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```
## max_server_memory_usage {#max_server_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />
サーバーが使用できる最大メモリ量（バイト単位）です。

:::note
サーバーの最大メモリ消費量は、さらに`max_server_memory_usage_to_ram_ratio`によって制限されます。
:::

特別な場合として、`0`（デフォルト）の値は、サーバーが使用可能なすべてのメモリを消費できることを意味します（`max_server_memory_usage_to_ram_ratio`によって課されるさらなる制限を除く）。
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />
サーバーが使用できる最大メモリ量を、使用可能な全メモリに対する比率として表現したものです。

たとえば、`0.9`（デフォルト）の値は、サーバーが使用可能なメモリの90％を消費できることを意味します。

低メモリシステムでのメモリ使用量を減少させることを許可します。
RAMとスワップが少ないホストでは、[`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio)を1以上に設定する必要がある可能性があります。

:::note
サーバーの最大メモリ消費量はさらに`max_server_memory_usage`によって制限されます。
:::
## max_session_timeout {#max_session_timeout} 

最大セッションタイムアウト（秒単位）です。

例：

```xml
<max_session_timeout>3600</max_session_timeout>
```
## max_table_num_to_throw {#max_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
テーブルの数がこの値を超えると、サーバーは例外をスローします。

次のテーブルはカウントされません:
- view
- remote
- dictionary
- system

データベースエンジンのためにカウントされるテーブルのみ:
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0`の値は制限がないことを意味します。
:::

**例**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```
## max_table_num_to_warn {#max_table_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="5000" />
接続されたテーブルの数が指定した値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```
## max_table_size_to_drop {#max_table_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
テーブル削除に関する制限です。

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのサイズが`max_table_size_to_drop`（バイト）を超えると、[`DROP`](../../sql-reference/statements/drop.md)クエリまたは[`TRUNCATE`](../../sql-reference/statements/truncate.md)クエリを使用して削除することはできません。

:::note
`0`の値は、制限なしで全てのテーブルを削除できることを意味します。

この設定を適用するために、ClickHouseサーバーを再起動する必要はありません。制限を無効にするための別の方法は、`<clickhouse-path>/flags/force_drop_table`ファイルを作成することです。
:::

**例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
外部集約、結合、またはソートのために使用できる最大ストレージ量です。
この制限を超えるクエリは例外を発生します。

:::note
`0`の値は制限なしを意味します。
:::

以下も参照してください：
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)
## max_thread_pool_free_size {#max_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
グローバルスレッドプール内の**アイドル**スレッド数が[`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size)を超えると、ClickHouseは一部のスレッドによって占有されているリソースを解放し、プールサイズを減少させます。必要に応じて再度スレッドを作成できます。

**例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```
## max_thread_pool_size {#max_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
ClickHouseはクエリを処理するためにグローバルスレッドプールからスレッドを使用します。クエリを処理するためのアイドルスレッドがない場合、新しいスレッドがプールに作成されます。`max_thread_pool_size`はプール内のスレッド数の最大数を制限します。

**例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```
## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />非アクティブなデータパーツ（予期しないもの）を起動時にロードするためのスレッド数です。
## max_view_num_to_throw {#max_view_num_to_throw} 

ビューの数がこの値を超えると、サーバーは例外をスローします。

データベースエンジンのためにカウントされるテーブルのみ:
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0`の値は制限がないことを意味します。
:::

**例**
```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```
## max_view_num_to_warn {#max_view_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
接続されたビューの数が指定した値を超えると、ClickHouseサーバーは`system.warnings`テーブルに警告メッセージを追加します。

**例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```
## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
同時待機クエリの総数に対する制限です。
待機中のクエリの実行は、必要なテーブルが非同期的にロードされている間、ブロックされます（[`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)を参照）。

:::note
待機中のクエリは、次の設定によって制御される制限がチェックされるときにはカウントされません：

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

この修正は、サーバー起動後にこれらの制限に到達するのを回避するために行われます。
:::

:::note

値`0`（デフォルト）は制限なしを意味します。

この設定はランタイムに変更可能で、即座に有効になります。既に実行中のクエリは変更されません。
:::
## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

バックグラウンドメモリワーカーが、jemallocやcgroupsなどの外部情報に基づいて内部メモリトラッカーを修正するかどうかを示します。
## memory_worker_period_ms {#memory_worker_period_ms} 

バックグラウンドメモリワーカーのティック期間で、メモリトラッカーのメモリ使用量を修正し、高いメモリ使用時に未使用ページをクリーンアップします。0に設定すると、メモリ使用量のソースに応じてデフォルト値が使用されます。
## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

メモリトラッキングを修正するために現在のcgroupメモリ使用情報を使用します。
## merge_tree {#merge_tree} 

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)内のテーブルの微調整です。

詳細については、MergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />
マージとその他のワークロード間でリソースの使用および共有を調整するために使用されます。指定された値は、すべてのバックグラウンドマージの`workload`設定値として使用されます。マージツリー設定によって上書き可能です。

**参考**
- [ワークロードスケジューリング](/operations/workload-scheduling.md)
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />
マージおよびミューテーション操作のために許可されるRAMの制限を設定します。
ClickHouseが設定された制限に達すると、新しいバックグラウンドマージやミューテーション操作はスケジュールされませんが、すでにスケジュールされたタスクは引き続き実行されます。

:::note
`0`の値は制限なしを意味します。
:::

**例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```
## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />
デフォルトの`merges_mutations_memory_usage_soft_limit`値は、`memory_amount * merges_mutations_memory_usage_to_ram_ratio`として計算されます。

**その他参照:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)
## metric_log {#metric_log} 

デフォルトでは無効です。

**有効化**

メトリクス履歴収集[`system.metric_log`](../../operations/system-tables/metric_log.md)を手動でオンにするには、次の内容で`/etc/clickhouse-server/config.d/metric_log.xml`を作成します：

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

`metric_log`設定を無効にするには、次の内容のファイル`/etc/clickhouse-server/config.d/disable_metric_log.xml`を作成する必要があります：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
接続を削除するために考慮されるOS CPU待機（OSCPUWaitMicrosecondsメトリック）とビジー（OSCPUVirtualTimeMicrosecondsメトリック）間の最小比率です。最小値と最大値の比率の間の線形補間が確率を計算するために使用され、この時点での確率は0です。
詳細については、[サーバーのCPUオーバーロード時の動作制御](/operations/settings/server-overload)を参照してください。
## mlock_executable {#mlock_executable} 

高IO負荷の下でClickHouse実行可能ファイルがページアウトされるのを防ぐために、サーバー起動後に`mlockall`を実行して最初のクエリのレイテンシを低下させます。

:::note
このオプションを有効にすることは推奨されますが、起動時間が数秒遅くなる可能性があります。
この設定は「CAP_IPC_LOCK」機能がないと動作しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```
## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />
この設定は、頻繁なオープン/クローズ呼び出しを避け、複数のスレッドやクエリからのマッピングを再利用することを可能にします。設定値はマッピングされた領域の数（通常、マッピングされたファイルの数と等しい）です。

マッピングされたファイル内のデータ量は、以下のシステムテーブルで次のメトリックを使用して監視できます：

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells`は[`system.metrics`](/operations/system-tables/metrics)、[`system.metric_log`](/operations/system-tables/metric_log)内
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses`は[`system.events`](/operations/system-tables/events)、[`system.processes`](/operations/system-tables/processes)、[`system.query_log`](/operations/system-tables/query_log)、[`system.query_thread_log`](/operations/system-tables/query_thread_log)、[`system.query_views_log`](/operations/system-tables/query_views_log)内

:::note
マッピングされたファイル内のデータ量は直接メモリを消費せず、クエリやサーバーのメモリ使用量にはカウントされません — これはこのメモリがOSページキャッシュに似ていて破棄可能だからです。このキャッシュは、MergeTreeファミリーのテーブルで古い部分が削除されると自動的に削除され、`SYSTEM DROP MMAP CACHE`クエリを通じて手動で削除することもできます。

この設定はランタイムに変更可能で、即座に有効になります。
:::
## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />
ミューテーションと他のワークロード間でリソースの使用および共有を調整するために使用されます。指定された値は、すべてのバックグラウンドミューテーションの`workload`設定値として使用されます。マージツリー設定によって上書き可能です。

**参考**
- [ワークロードスケジューリング](/operations/workload-scheduling.md)
## mysql_port {#mysql_port} 

MySQLプロトコルを介してクライアントと通信するためのポートです。

:::note
- 正の整数はリッスンするポート番号を指定します
- 空の値はMySQLプロトコルを介したクライアントとの通信を無効にします。
:::

**例**

```xml
<mysql_port>9004</mysql_port>
```
## mysql_require_secure_transport {#mysql_require_secure_transport} 

trueに設定された場合、[mysql_port](#mysql_port)を介してクライアントとの安全な通信が必要です。`--ssl-mode=none`オプションでの接続は拒否されます。これを[OpenSSL](#openssl)設定と一緒に使用してください。
## openSSL {#openssl}

SSLクライアント/サーバーの設定。

SSLのサポートは `libpoco` ライブラリによって提供されています。利用可能な設定オプションについては [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) を参照してください。デフォルト値は [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) にあります。

サーバー/クライアント設定のためのキー:

| オプション                       | 説明                                                                                                                                                                                                                                                                                                                                                                 | デフォルト値                               |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `privateKeyFile`               | PEM証明書の秘密鍵を含むファイルへのパス。ファイルは鍵と証明書を同時に含むことができます。                                                                                                                                                                                                                                                                      |                                          |
| `certificateFile`              | PEMフォーマットのクライアント/サーバー証明書ファイルへのパス。`privateKeyFile`に証明書が含まれている場合、これを省略することができます。                                                                                                                                                                                                                                 |                                          |
| `caConfig`                     | 信頼できるCA証明書を含むファイルまたはディレクトリへのパス。このファイルが指定されている場合、有効な形式はPEMで、複数のCA証明書を含むことができます。ディレクトリが指定されている場合、CA証明書ごとに1つの.pemファイルを含む必要があります。ファイル名はCAの主題名ハッシュ値で検索されます。詳細は[SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html)のマニュアルをご覧ください。    |                                          |
| `verificationMode`             | ノードの証明書を検証する方法。詳細は[Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h)クラスの説明にあります。可能な値: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                  | `relaxed`                               |
| `verificationDepth`            | 検証チェーンの最大の長さ。証明書チェーンの長さが設定値を超える場合、検証は失敗します。                                                                                                                                                                                                                                                                                       | `9`                                     |
| `loadDefaultCAFile`            | OpenSSL用の組み込みCA証明書を使用するかどうか。ClickHouseは、組み込みCA証明書が `/etc/ssl/cert.pem` （またはディレクトリ `/etc/ssl/certs`）または環境変数 `SSL_CERT_FILE` （または `SSL_CERT_DIR`）で指定されたファイル（またはディレクトリ）にあると仮定します。                                                                                                                                      | `true`                                  |
| `cipherList`                   | サポートされているOpenSSL暗号。                                                                                                                                                                                                                                                                                                                                                           | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`                | セッションキャッシュを有効または無効にします。`sessionIdContext`と組み合わせて使用する必要があります。許容される値: `true`, `false`.                                                                                                                                                                                                                                                                           | `false`                                 |
| `sessionIdContext`             | サーバーが生成した各識別子に付加する一意のランダム文字列のセット。文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはなりません。このパラメータは、セッションがサーバーにキャッシュされている場合やクライアントがキャッシュを要求した場合の問題を避けるために常に推奨されます。                                                                                                                              | `$\{application.name\}`                      |
| `sessionCacheSize`             | サーバーがキャッシュするセッションの最大数。`0`の値は無制限のセッションを意味します。                                                                                                                                                                                                                                                                                                     | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`               | サーバー上でセッションをキャッシュする時間（時間単位）。                                                                                                                                                                                                                                                                                                                                          | `2`                                     |
| `extendedVerification`         | 有効にすると、証明書のCNまたはSANがピアのホスト名と一致するかどうかを検証します。                                                                                                                                                                                                                                                                                                       | `false`                                 |
| `requireTLSv1`                 | TLSv1接続を必要とします。許容される値: `true`, `false`.                                                                                                                                                                                                                                                                                                                                      | `false`                                 |
| `requireTLSv1_1`               | TLSv1.1接続を必要とします。許容される値: `true`, `false`.                                                                                                                                                                                                                                                                                                                                    | `false`                                 |
| `requireTLSv1_2`               | TLSv1.2接続を必要とします。許容される値: `true`, `false`.                                                                                                                                                                                                                                                                                                                                    | `false`                                 |
| `fips`                         | OpenSSLのFIPSモードを有効にします。ライブラリのOpenSSLバージョンがFIPSをサポートしている場合に限ります。                                                                                                                                                                                                                                                                                          | `false`                                 |
| `privateKeyPassphraseHandler`  | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandlerのサブクラス）。例えば: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                          | `KeyConsoleHandler`                     |
| `invalidCertificateHandler`    | 無効な証明書を検証するためのクラス（CertificateHandlerのサブクラス）。例えば: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                          | `RejectCertificateHandler`              |
| `disableProtocols`             | 使用が許可されていないプロトコル。                                                                                                                                                                                                                                                                                                                                                                        |                                          |
| `preferServerCiphers`          | クライアントが好むサーバーの暗号。                                                                                                                                                                                                                                                                                                                                                                            | `false`                                 |

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
## opentelemetry_span_log {#opentelemetry_span_log} 

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md)システムテーブルの設定。

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

OSが有用な作業を行っていると見なすためのマイクロ秒単位のOS CPUビジータイムの閾値（OSCPUVirtualTimeMicrosecondsメトリック）で、この値未満のビジータイムはCPUオーバーロードとは見なされません。
## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

分散キャッシュTCPハンドラーのスレッドのLinuxニース値。低い値は高いCPU優先度を意味します。

CAP_SYS_NICE機能が必要です。それ以外は、無効になります。

可能な値: -20から19。
## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

マージとミューテーションスレッドのLinuxニース値。低い値は高いCPU優先度を意味します。

CAP_SYS_NICE機能が必要です。それ以外は、無効になります。

可能な値: -20から19。
## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

ZooKeeperクライアントでの送受信スレッドのLinuxニース値。低い値は高いCPU優先度を意味します。

CAP_SYS_NICE機能が必要です。それ以外は、無効になります。

可能な値: -20から19。
## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

ユーザースペースページキャッシュから解放するために保持するメモリ制限の割合。Linuxのmin_free_kbytes設定に類似しています。
## page_cache_history_window_ms {#page_cache_history_window_ms} 

解放されたメモリがユーザースペースページキャッシュで使用できる前の遅延時間。
## page_cache_max_size {#page_cache_max_size} 

ユーザースペースページキャッシュの最大サイズ。キャッシュを無効にするには0に設定します。page_cache_min_sizeより大きい場合、キャッシュサイズはこの範囲内で継続的に調整され、利用可能なメモリのほとんどを使用しつつ、合計メモリ使用量を制限（max_server_memory_usage[_to_ram_ratio]）内に保ちます。
## page_cache_min_size {#page_cache_min_size} 

ユーザースペースページキャッシュの最小サイズ。
## page_cache_policy {#page_cache_policy} 

ユーザースペースページキャッシュポリシー名。
## page_cache_shards {#page_cache_shards} 

ミューテックス競合を減らすために、この数のシャードにユーザースペースページキャッシュをストライプします。実験的であり、パフォーマンスの改善は期待できません。
## page_cache_size_ratio {#page_cache_size_ratio} 

ユーザースペースページキャッシュ内の保護されたキューのサイズをキャッシュの全体のサイズに対して表します。
## part_log {#part_log} 

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)に関連するイベントをロギングします。例えば、データの追加やマージです。ログを利用してマージアルゴリズムをシミュレーションし、その特性を比較することができます。マージプロセスを視覚化できます。

クエリは[system.part_log](/operations/system-tables/part_log)テーブルにログされ、別のファイルには保存されません。このテーブルの名前は `table` パラメータで設定できます（以下を参照）。

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

SharedMergeTree用のパーツを完全に削除するための期間。ClickHouse Cloudでのみ利用可能です。
## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

非常に大きなテーブル数の場合、thundering herd 効果とZooKeeperのその後のDoSを回避するためにkill_delay_periodに0からx秒までの均一に分布した値を追加します。ClickHouse Cloudでのみ利用可能です。
## parts_killer_pool_size {#parts_killer_pool_size} 

共有マージツリーの時代遅れのスレッドのクリーンアップ用スレッド。ClickHouse Cloudでのみ利用可能です。
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

PostgreSQLプロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します。
- 空の値はPostgreSQLプロトコルを介したクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```
## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

trueに設定されている場合、クライアントとの安全な通信が必要です [postgresql_port](#postgresql_port) 従来の接続は `sslmode=disable`のオプションが拒否されます。[OpenSSL](#openssl) 設定と一緒に使用します。
## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

リモートオブジェクトストレージのためのプレフェッチ用のバックグラウンドプールのサイズ。
## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

プレフェッチプールにプッシュ可能なタスク数。
## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

プレフィックスデシリアライズスレッドプールにスケジュールできるジョブの最大数。

:::note
`0`の値は無制限を意味します。
:::
## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

trueの場合、ClickHouseはすべての構成された `system.*_log` テーブルを起動前に作成します。一部の起動スクリプトがこれらのテーブルに依存している場合に便利です。
## primary_index_cache_policy {#primary_index_cache_policy} 

主インデックスキャッシュポリシー名。
## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

プレウォーム中にフィルするためのマークキャッシュの総サイズに対する比率。
## primary_index_cache_size {#primary_index_cache_size} 

主インデックス（MergeTreeファミリのインデックス）のためのキャッシュの最大サイズ。
## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

主インデックスキャッシュ内の保護されたキューのサイズ（SLRUポリシーの場合）をキャッシュの全サイズに対して表します。
## process_query_plan_packet {#process_query_plan_packet} 

この設定はクエリプランパケットの読み取りを可能にします。このパケットは、serialize_query_planが有効なときに分散クエリのために送信されます。
デフォルトでは無効であり、これはクエリプランのバイナリデシリアライズにおけるバグによる可能性のあるセキュリティ問題を避けるためです。

**例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```
## processors_profile_log {#processors_profile_log} 

[`processors_profile_log`](../system-tables/processors_profile_log.md)システムテーブルの設定。

<SystemLogParameters/>

デフォルト設定は次の通りです：

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

[Prometheus](https://prometheus.io)からスクレイピングするためのメトリクスデータの公開。

設定：

- `endpoint` – prometheusサーバーによるメトリクスをスクレイピングするためのHTTPエンドポイント。 '/' から始まります。
- `port` – `endpoint`のためのポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics)テーブルからメトリクスを公開。
- `events` – [system.events](/operations/system-tables/events)テーブルからメトリクスを公開。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルから現在のメトリクス値を公開。
- `errors` - 最後のサーバー再起動以来発生したエラーコードによるエラー数を公開。この情報は [system.errors](/operations/system-tables/errors) からも取得可能です。

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

チェック（`127.0.0.1` をClickHouseサーバーのIPアドレスまたはホスト名に置き換えます）：
```bash
curl 127.0.0.1:9363/metrics
```
## proxy {#proxy} 

HTTPおよびHTTPSリクエスト用のプロキシサーバーを定義します。現在サポートされているのはS3ストレージ、S3テーブル関数、URL関数です。

プロキシサーバーを定義する方法は3つあります：
- 環境変数
- プロキシリスト
- リモートプロキシリゾルバ

特定のホストのためにプロキシサーバーをバイパスすることも、`no_proxy`を使用してサポートされています。

**環境変数**

`http_proxy` および `https_proxy` 環境変数は、指定されたプロトコル用のプロキシサーバーを指定することを許可します。システム上で設定されている場合、シームレスに機能するはずです。

これは、指定されたプロトコルに対してプロキシサーバーが1つのみであり、そのプロキシサーバーが変更されない場合に最も簡単なアプローチです。

**プロキシリスト**

このアプローチでは、プロトコルのために1つまたは複数のプロキシサーバーを指定することができます。複数のプロキシサーバーが定義されている場合、ClickHouseはラウンドロビン方式で異なるプロキシを使用し、サーバー間の負荷を均等にします。このアプローチは、プロトコルに対して複数のプロキシサーバーがあり、プロキシサーバーのリストが変更されない場合に最も単純です。

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
以下のタブで親フィールドを選択すると、その子供たちを見ることができます：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド     | 説明                         |
|-----------|-------------------------------------|
| `<http>`  | 1つ以上のHTTPプロキシのリスト  |
| `<https>` | 1つ以上のHTTPSプロキシのリスト |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド   | 説明          |
|---------|----------------------|
| `<uri>` | プロキシのURI |

  </TabItem>
</Tabs>

**リモートプロキシリゾルバ**

プロキシサーバーが動的に変更される可能性もあります。その場合、リゾルバのエンドポイントを定義できます。ClickHouseはそのエンドポイントに空のGETリクエストを送信し、リモートリゾルバはプロキシホストを返す必要があります。ClickHouseは次のテンプレートを使用してプロキシURIを形成します： `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

以下のタブで親フィールドを選択すると、その子供たちを見ることができます：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド    | 説明                      |
|----------|----------------------------------|
| `<http>` | 1つ以上のリゾルバのリスト* |
| `<https>` | 1つ以上のリゾルバのリスト* |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド       | 説明                                   |
|-------------|-----------------------------------------------|
| `<resolver>` | リゾルバのためのエンドポイントとその他の詳細 |

:::note
複数の `<resolver>` 要素を持つことができますが、指定されたプロトコルの最初の `<resolver>` しか使用されません。その他の `<resolver>` 要素は無視されます。これは、ロードバランシング（必要な場合）はリモートリゾルバによって実装されるべきことを意味します。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| フィールド               | 説明                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | プロキシリゾルバのURI                                                                                                                                                          |
| `<proxy_scheme>`    | 最終的なプロキシURIのプロトコル。これは`http`または`https`のいずれかです。                                                                                                             |
| `<proxy_port>`      | プロキシリゾルバのポート番号                                                                                                                                                  |
| `<proxy_cache_time>` | リゾルバからの値がClickHouseによってキャッシュされる秒数。これを`0`に設定すると、ClickHouseはすべてのHTTPまたはHTTPSリクエストのたびにリゾルバに連絡します。 |

  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決定されます：

| 順序 | 設定                |
|-------|------------------------|
| 1.    | リモートプロキシリゾルバ |
| 2.    | プロキシリスト            |
| 3.    | 環境変数                  |

ClickHouseは、リクエストプロトコルのための最も高い優先度のリゾルバタイプを確認します。それが定義されていない場合は、それに次ぐ優先順位のリゾルバタイプを確認し、環境リゾルバに達するまで続けます。これにより、リゾルバタイプの混在使用も可能です。
## query_cache {#query_cache} 

[クエリキャッシュ](../query-cache.md)の設定。

以下の設定が利用可能です：

| 設定                   | 説明                                                                             | デフォルト値 |
|---------------------------|--------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | 最大キャッシュサイズ（バイト単位）。 `0`はクエリキャッシュが無効であることを意味します。            | `1073741824`  |
| `max_entries`             | キャッシュに保存される `SELECT` クエリ結果の最大数。                                       | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存される可能性のある`SELECT`クエリ結果の最大サイズ（バイト単位）。                   | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存される可能性のある`SELECT`クエリ結果の最大行数。                             | `30000000`    |

:::note
- 変更された設定は直ちに有効になります。
- クエリキャッシュのデータはDRAMに割り当てられます。メモリが不足している場合は、`max_size_in_bytes`に小さな値を設定するか、クエリキャッシュをまったく無効にすることを確認してください。
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

<SettingsInfoBlock type="String" default_value="SLRU" />クエリ条件キャッシュポリシー名。
## query_condition_cache_size {#query_condition_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />クエリ条件キャッシュの最大サイズ。
:::note
この設定はランタイム中に変更可能であり、即時に有効になります。
:::
## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />クエリ条件キャッシュ内の保護されたキューのサイズ（SLRUポリシーの場合）をキャッシュの全体のサイズに対して表します。
## query_log {#query_log} 

[log_queries=1](../../operations/settings/settings.md)設定で受信したクエリのロギング設定。

クエリは [system.query_log](/operations/system-tables/query_log) テーブルにログされ、別のファイルには保存されません。このテーブルの名前は `table` パラメータで変更できます（以下を参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはテーブルを作成します。ClickHouseサーバーが更新されたときにクエリログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

サーバーログに保存する前にクエリおよびすべてのログメッセージに適用される正規表現ベースのルール、[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes)テーブル、クライアントに送信されるログに適用されます。これにより、名前、メールアドレス、個人識別子、クレジットカード番号などのSQLクエリからの機密データ漏洩を防ぐことができます。

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

| 設定      | 説明                                                                   |
|-----------|-------------------------------------------------------------------------|
| `name`    | ルールの名前（オプション）                                              |
| `regexp`  | RE2互換の正規表現（必須）                                             |
| `replace` | 機密データのための置換文字列（オプション、デフォルトは6つのアスタリスク） |

マスキングルールはクエリ全体に適用されます（不正な/解析できないクエリからの機密データの漏洩を防ぐため）。

[`system.events`](/operations/system-tables/events)テーブルには、クエリマスキングルールの一致数を示すカウンター `QueryMaskingRulesMatch` があります。

分散クエリの場合、各サーバーは別々に構成する必要があります。そうしないと、他のノードに渡された部分クエリはマスキングなしで保存されます。
## query_metric_log {#query_metric_log} 

デフォルトでは無効です。

**有効化**

メトリクス履歴収集を手動で有効にするには、[`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)を作成します `/etc/clickhouse-server/config.d/query_metric_log.xml` で以下の内容を記述してください。

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

`query_metric_log`設定を無効にするには、次のファイルを作成する必要があります `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` で以下の内容を含めます。

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_thread_log {#query_thread_log} 

[log_query_threads=1](/operations/settings/settings#log_query_threads)設定で受信したクエリのスレッドをロギングするための設定。

クエリは [system.query_thread_log](/operations/system-tables/query_thread_log) テーブルにログされ、別のファイルには保存されません。このテーブルの名前は `table` パラメータで変更できます（以下を参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはテーブルを作成します。ClickHouseサーバーが更新されたときにクエリスレッドログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

クエリ受信に依存するビュー（ライブ、マテリアライズなど）をログに記録する設定です。これは [log_query_views=1](/operations/settings/settings#log_query_views) 設定を使用します。

クエリは、[system.query_views_log](/operations/system-tables/query_views_log) テーブルにログされ、別のファイルには保存されません。`table` パラメータでテーブルの名前を変更できます（以下参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouse がそれを作成します。ClickHouse サーバーが更新された際にクエリビューのログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

巨大ページを使用して機械コード（「テキスト」）のメモリを再割り当てするための設定です。

:::note
この機能は非常に実験的です。
:::

例：

```xml
<remap_executable>false</remap_executable>
```
## remote_servers {#remote_servers} 

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンと `cluster` テーブル関数によって使用されるクラスタの設定です。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性の値については、"[Configuration files](/operations/configuration-files)" セクションを参照してください。

**関連情報**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Cluster Discovery](../../operations/cluster-discovery.md)
- [Replicated database engine](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts} 

URL関連のストレージエンジンおよびテーブル関数で使用が許可されているホストのリストです。

`\<host\>` XML タグを使用してホストを追加する際：
- URL と同じように正確に指定する必要があり、名前は DNS 解決前にチェックされます。例：`<host>clickhouse.com</host>`
- URL にポートが明示的に指定されている場合は、ホスト:ポート全体がチェックされます。例：`<host>clickhouse.com:80</host>`
- ポートなしでホストが指定された場合は、そのホストの任意のポートが許可されます。例：`<host>clickhouse.com</host>` が指定された場合、`clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) などが許可されます。
- ホストがIPアドレスとして指定された場合は、URL に指定されたようにチェックされます。例：[2a02:6b8:a::a]。
- リダイレクトがある場合でリダイレクトのサポートが有効な場合は、各リダイレクト（ロケーションフィールド）がチェックされます。

例：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## replica_group_name {#replica_group_name} 

データベース Replicated のレプリカグループ名です。

Replicatedデータベースによって作成されたクラスタは、同じグループのレプリカで構成されます。
DDLクエリは、同じグループ内のレプリカを待機します。

デフォルトでは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" /> 部品取得リクエストのための HTTP 接続タイムアウト。明示的に設定されていない場合、デフォルトプロファイル `http_connection_timeout` から継承されます。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" /> 部品取得リクエストのための HTTP 受信タイムアウト。明示的に設定されていない場合、デフォルトプロファイル `http_receive_timeout` から継承されます。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" /> 部品取得リクエストのための HTTP 送信タイムアウト。明示的に設定されていない場合、デフォルトプロファイル `http_send_timeout` から継承されます。
## replicated_merge_tree {#replicated_merge_tree} 

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) のテーブル用のファインチューニング。この設定は優先度が高いです。

詳細については、MergeTreeSettings.h ヘッダー ファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" /> RESTORE リクエストを実行するための最大スレッド数です。
## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />許可される最大の S3 リダイレクトホップ数です。
## s3_retry_attempts {#s3_retry_attempts} 

Aws::Client::RetryStrategy の設定です。Aws::Client 自身がリトライを行い、0 はリトライなしを意味します。
## s3queue_disable_streaming {#s3queue_disable_streaming} 

テーブルが作成され、それに接続されたマテリアライズドビューがあっても S3Queue でのストリーミングを無効にします。
## s3queue_log {#s3queue_log} 

`s3queue_log` システムテーブルのための設定です。

<SystemLogParameters/>

デフォルトの設定は以下です：

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```
## send_crash_reports {#send_crash_reports} 

ClickHouse コア開発者チームにクラッシュレポートを送信するための設定です。

特に本番前環境での有効化は非常に評価されます。

キー：

| キー                     | 説明                                                                                                                                                                                                 |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`               | 機能を有効にするためのブーリアンフラグ、デフォルトは `true`。クラッシュレポートの送信を避けるには `false` に設定します。                                                 |
| `send_logical_errors`   | `LOGICAL_ERROR` は `assert` のようなもので、ClickHouse のバグです。このブーリアンフラグはこの例外の送信を有効にします（デフォルト: `true`）。              |
| `endpoint`              | クラッシュレポートの送信先 URL をオーバーライドすることができます。                                                                                                                                            |

**推奨使用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />
`generateSerialID` 関数によって生成された自動インクリメンタル番号を持つ Keeper 内のパス。各系列はこのパスの下にノードとなります。
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />真に設定されている場合、スタックトレース内のアドレスを表示します。
## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />真に設定されている場合、ClickHouse はシャットダウン前に実行中のバックアップと復元が終了するのを待ちます。
## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />未完了のクエリを待つための遅延（秒数）です。
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

真に設定された場合、ClickHouse はシャットダウン前に実行中のクエリが終了するまで待ちます。
## skip_binary_checksum_checks {#skip_binary_checksum_checks} 

ClickHouse バイナリチェックサム整合性チェックをスキップします。
## ssh_server {#ssh_server} 

ホストキーの公開部分は最初の接続時に SSH クライアント側の known_hosts ファイルに書き込まれます。

ホストキーの設定はデフォルトで無効になっています。
ホストキーの設定をコメント解除し、関連する ssh キーのパスを提供すると、有効化されます：

例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />マテリアライズドビュー作成の遅延をシミュレートするためのデバッグパラメータです。
## storage_configuration {#storage_configuration} 

ストレージのマルチディスク構成を許可します。

ストレージ構成は以下の構造に従います：

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
### Configuration of disks {#configuration-of-disks}

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

上記のサブタグは `disks` のための以下の設定を定義します：

| 設定                     | 説明                                                                                                                                                                                                 |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | ディスクの名前、ユニークである必要があります。                                                  |
| `path`                  | サーバーデータが保存されるパス（`data`および`shadow`カタログ）。`/` で終わる必要があります。|
| `keep_free_space_bytes` | ディスク上に予約される自由空間のサイズです。                                                                                                                                                                                                           |

:::note
ディスクの順序は重要ではありません。
:::
### Configuration of policies {#configuration-of-policies}

上記のサブタグは `policies` のための以下の設定を定義します：

| 設定                      | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`          | ポリシー名。ポリシー名は一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                                  |
| `volume_name_N`          | ボリューム名。ボリューム名も一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                               |
| `disk`                   | ボリューム内にあるディスクです。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `max_data_part_size_bytes`   | このボリューム内の任意のディスクに存在できるデータの最大 chunk サイズ。このマージの結果、chunk サイズが `max_data_part_size_bytes` よりも大きくなる場合、その chunk は次のボリュームに書き込まれます。この機能により、新しくて小さな chunks をホット（SSD）ボリュームに保存し、大きなサイズに達するとコールド（HDD）ボリュームに移動することができます。そのポリシーにボリュームが一つだけの場合はこのオプションを使用しないでください。       |
| `move_factor`            | ボリューム上の利用可能な空き容量の割合。空き容量が少なくなると、データは次のボリュームに転送され始めます。転送のため、chunks はサイズが大きい順に整列され（降順）選択され、`move_factor` 条件を満たす十分なサイズの合計のchunk が選ばれます。合計のサイズが不十分な場合は、すべてのchunk が移動されます。                                                                                                                               |
| `perform_ttl_move_on_insert` | 挿入時に有効期限の切れたデータを移動しないようにします。デフォルト（有効な場合）、寿命ルールに従ってすでに期限切れのデータの一部を挿入した場合、それは指定されたボリューム/ディスクに即座に移動されます。ターゲットボリューム/ディスクが遅い場合は、挿入が著しく遅くなる可能性があります（例: S3）。無効にした場合、有効期限が切れたデータの部分はデフォルトボリュームに書き込まれ、次にルールで指定されたボリュームに移動されます。|
| `load_balancing`         | ディスクのバランシングポリシー、`round_robin` または `least_used`。                                                                                                                                                                                                                                                                                                                                                                       |
| `least_used_ttl_ms`      | 利用可能なスペースを更新するためのタイムアウト（ミリ秒）を設定します（`0` - いつでも更新、`-1` - 決して更新しない、デフォルト値は `60000`）。ディスクがClickHouseのみに使用され、動的にファイルシステムのサイズ変更の影響を受けない場合は `-1` を使用できます。それ以外の場合は推奨されません、正しくない空間割り当てを引き起こす可能性があるからです。                                                                                                                |
| `prefer_not_to_merge`    | このボリュームのデータのマージを無効にします。注意：これは潜在的に有害で、遅延を引き起こす可能性があります。この設定が有効な場合（これは行わないでください）、このボリューム上のデータのマージは禁止されます（これは悪い）。これにより、ClickHouseが遅いディスクとどのように相互作用するかを制御できます。全く使用しないことを推奨します。                                                                               |
| `volume_priority`        | ボリュームが充填される順序（優先度）を定義します。値が小さいほど優先度が高くなります。パラメータ値は自然数でなければならず、指定された範囲（1からNまで、Nは指定された最大のパラメータ値）をカバーしてギャップがあってはなりません。                                                                                                                                                                                                       |

`volume_priority` に関して：
- すべてのボリュームがこのパラメータを持つ場合、指定された順序で優先されます。
- 一部のボリュームのみがこのパラメータを持つ場合、パラメータを持たないボリュームは最も低い優先度を持ちます。持っているボリュームはタグ値に基づいて優先され、残りの優先度は設定ファイルにおける記述の順序によって決定されます。
- パラメータを持つボリュームがまったく指定されていない場合、それらの順序は設定ファイル内の記述の順序によって決まります。
- ボリュームの優先度は同一である必要はありません。
## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />この制限を超える接続は、寿命が著しく短くなります。制限はストレージ接続に適用されます。
## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />この制限を超える接続は使用後にリセットされます。接続キャッシュをオフにするには、0 に設定します。制限はストレージ接続に適用されます。
## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />使用中の接続数がこの制限を超えると、警告メッセージがログに書き込まれます。制限はストレージ接続に適用されます。
## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="1" />VERSION_FULL_OBJECT_KEY 形式のディスクメタデータファイルを書き込みます。デフォルトで有効です。この設定は非推奨です。
## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

有効にすると、SharedSet と SharedJoin の作成時に内部 UUID が生成されます。ClickHouse Cloud のみ。
## table_engines_require_grant {#table_engines_require_grant} 

真に設定されている場合、ユーザーは特定のエンジンでテーブルを作成するために許可が必要です。例：`GRANT TABLE ENGINE ON TinyLog to user`。

:::note
デフォルトでは、後方互換性のために特定のテーブルエンジンでテーブルを作成する際に許可を無視しますが、これを真に設定することでこの動作を変更できます。
:::
## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
バックグラウンドプールで非同期読み込みジョブを実行するスレッドの数を設定します。バックグラウンドプールは、サーバーが起動した後、テーブルの待機クエリが存在しない場合にテーブルを非同期に読み込むために使用されます。テーブルが多い場合、バックグラウンドプールでのスレッド数を低く保つことは、同時クエリ実行のためにCPUリソースを予約するために有益です。

:::note
値が `0` の場合、すべての利用可能なCPUが使用されます。
:::
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
フォアグラウンドプールでの読み込みジョブを実行するスレッドの数を設定します。フォアグラウンドプールは、サーバーがポートのリスニングを開始する前にテーブルを同期的に読み込むために使用され、待機しているテーブルの読み込みにも使用されます。フォアグラウンドプールはバックグラウンドプールよりも優先度が高いです。つまり、フォアグラウンドプールで実行中のジョブがある限り、バックグラウンドプールではジョブが開始されません。

:::note
値が `0` の場合、すべての利用可能なCPUが使用されます。
:::
## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />接続が閉じられる前に、TCP接続ごとに許可される最大クエリ数です。無制限のクエリの場合は 0 に設定します。
## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />接続が閉じられる前のTCP接続の最大寿命（秒）です。無制限の接続寿命の場合は 0 に設定します。
## tcp_port {#tcp_port} 

クライアントとのTCPプロトコル通信のためのポートです。

**例**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure} 

クライアントとの安全な通信のためのTCPポートです。[OpenSSL](#openssl) 設定とともに使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## tcp_ssh_port {#tcp_ssh_port} 

SSHサーバーのためのポートで、ユーザーが埋め込みクライアントを介して対話的に接続しクエリを実行できるようにします。

例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## temporary_data_in_cache {#temporary_data_in_cache} 


このオプションを使用すると、特定のディスクに対して一時データがキャッシュに保存されます。
このセクションでは、 `cache` タイプのディスク名を指定する必要があります。
その場合、キャッシュと一時データは同じ空間を共有し、ディスクキャッシュは一時データを生成するために追い出されることがあります。

:::note
一時データストレージを構成するには、単一のオプションしか使用できません：`tmp_path` 、`tmp_policy` 、`temporary_data_in_cache`。
:::

**例**

`local_disk` のキャッシュと一時データは、ファイルシステム上で `tiny_local_cache` に保存され、`tiny_local_cache` によって管理されます。

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

<SettingsInfoBlock type="Bool" default_value="0" />分散キャッシュに一時データを保存します。
## text_log {#text_log} 

テキストメッセージをログに記録するための [text_log](/operations/system-tables/text_log) システムテーブルの設定です。

<SystemLogParameters/>

さらに：

| 設定   | 説明                                                                                                                                                                                                                | デフォルト値       |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `level` | テーブルに保存される最大メッセージレベル（デフォルトは `Trace`）                                                                                                                                                     | `Trace`             |

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
グローバルスレッドプールでスケジュール可能なジョブの最大数。キューサイズを増加させると、メモリ使用量が大きくなります。この値は [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size) と等しく保つことが推奨されます。

:::note
値が `0` の場合、無制限です。
:::

**例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```
## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" /> `local_filesystem_read_method = 'pread_threadpool'` の場合にローカルファイルシステムから読むためのスレッドプール内のスレッド数です。
## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" /> ローカルファイルシステムから読むためのスレッドプールでスケジュール可能なジョブの最大数です。
## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" /> `remote_filesystem_read_method = 'threadpool'` の場合にリモートファイルシステムから読むために使用されるスレッドプールのスレッド数です。
## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" /> リモートファイルシステムから読むためのスレッドプールでスケジュール可能なジョブの最大数です。
## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" /> オブジェクトストレージへの書き込み要求のためのバックグラウンドプールのサイズです。
## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" /> オブジェクトストレージへの書き込み要求のためにバックグラウンドプールにプッシュ可能なタスクの数です。
## throw_on_unknown_workload {#throw_on_unknown_workload} 

<SettingsInfoBlock type="Bool" default_value="0" />
クエリ設定 'workload' で不明な WORKLOAD にアクセスする際の動作を定義します。

- `true` の場合、不明なワークロードにアクセスしようとするクエリから RESOURCE_ACCESS_DENIED 例外がスローされます。WORKLOAD 階層が確立され、 WORKLOAD デフォルトを含むよう力を入れるのに便利です。
- `false`（デフォルト）の場合、不明な WORKLOAD に指し示されているクエリに対して無制限のアクセスが提供され、リソーススケジューリングは行われません。これは、WORKLOAD 階層を設定する際に重要です。

**例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**関連情報**
- [Workload Scheduling](/operations/workload-scheduling.md)
## timezone {#timezone} 

サーバーのタイムゾーンです。

UTCタイムゾーンまたは地理的な場所のためのIANA識別子として指定されます（例：Africa/Abidjan）。

タイムゾーンは、DateTime フィールドがテキスト形式（画面またはファイルに印刷）で出力される際や、文字列から DateTime を取得する際の文字列と DateTime フォーマット間の変換に必要です。さらに、タイムゾーンは、入力パラメータでタイムゾーンを受け取らなかった場合に時間と日付で動作する関数で使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連情報**

- [session_timezone](../settings/settings.md#session_timezone)
## tmp_path {#tmp_path} 

大規模なクエリを処理するための一時データをローカルファイルシステムに保存するためのパスです。

:::note
- 一時データストレージを構成するには、単一のオプションしか使用できません：`tmp_path` 、`tmp_policy` 、`temporary_data_in_cache`。
- スラッシュは必須です。
:::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## tmp_policy {#tmp_policy} 


一時データを持つストレージポリシー。`tmp` プレフィックスを持つすべてのファイルは開始時に削除されます。

:::note
オブジェクトストレージを `tmp_policy` として使用する際の推奨：
- 各サーバーで別の `bucket:path` を使用
- `metadata_type=plain` を使用
- このバケットのTTLを設定することもできます
:::

:::note
- 一時データストレージを構成するには、単一のオプションしか使用できません：`tmp_path` 、`tmp_policy` 、`temporary_data_in_cache`。
- `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` は無視されます。
- ポリシーは厳密に *1つのボリューム* を持たなければなりません。

詳細については、[MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree) ドキュメントを参照してください。
:::

**例**

`/disk1` がいっぱいになると、一時データは `/disk2` に保存されます。

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

関連情報：
- 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) およびその変種は、カスタム TLD リスト名を受け取り、最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分を返します。
## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />指定された値以下のサイズのランダム割り当てを、 `total_memory_profiler_sample_probability` に等しい確率で収集します。0は無効を意味します。この閾値が期待通りに機能するように、`max_untracked_memory` を 0 に設定することをお勧めします。
## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />指定された値以上のサイズのランダム割り当てを、 `total_memory_profiler_sample_probability` に等しい確率で収集します。0は無効を意味します。この閾値が期待通りに機能するように、`max_untracked_memory` を 0 に設定することをお勧めします。
## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />サーバーのメモリ使用量がバイト単位で次のステップを超えるたびに、メモリプロファイラーは割り当てたスタックトレースを収集します。ゼロはメモリプロファイラーを無効にします。数メガバイトを下回る値はサーバーを遅くします。
## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />
ランダムな割り当てと解放を収集し、`trace_type` が `MemorySample` に等しい [`system.trace_log`](../../operations/system-tables/trace_log.md) システムテーブルに書き込みます。確率は、サイズに関係なく、各割り当てまたは解放に対して設定されます。サンプリングは、トラッキングされていないメモリがトラッキングされていないメモリ制限（デフォルト値は `4` MiB）を超えたときのみ発生することに注意してください。`total_memory_profiler_step` が低下すれば、これを減少させることができます。`total_memory_profiler_step` を `1` に設定して、追加の細かいサンプリングを行うこともできます。

可能な値：

- 正の double。
- `0` — `system.trace_log` システムテーブルへのランダムな割り当ておよび解放の書き込みが無効になっています。
## trace_log {#trace_log} 

[trace_log](/operations/system-tables/trace_log) システムテーブルの操作設定です。

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

<SettingsInfoBlock type="String" default_value="SLRU" />非圧縮キャッシュポリシーの名前です。
## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
MergeTree 系のテーブルエンジンによって使用される非圧縮データの最大サイズ（バイト単位）です。

サーバー用に共有されたキャッシュが1つあります。メモリは要求に応じて割り当てられます。オプション `use_uncompressed_cache` が有効になっている場合、キャッシュが使用されます。

非圧縮キャッシュは非常に短いクエリにおいて個別のケースで有利です。

:::note
値が `0` の場合、無効です。

この設定はランタイム中に変更でき、即座に効果があります。
:::
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />非圧縮キャッシュのサイズに対する保護キュー（SLRU ポリシーの場合）のサイズです。
## url_scheme_mappers {#url_scheme_mappers} 

短縮されたまたは記号的な URL プレフィックスを完全な URL に変換するための構成です。

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

ZooKeeper におけるデータ部分ヘッダーの保存方法。この設定は [`MergeTree`](/engines/table-engines/mergetree-family) 系にのみ適用されます。次のように指定できます：

**全体で `config.xml` ファイルの [merge_tree](#merge_tree) セクションで**

ClickHouse はサーバー上のすべてのテーブルに対して設定を使用します。いつでも設定を変更できます。設定が変更されると、既存のテーブルはその動作を変更します。

**各テーブルに対して**

テーブルを作成する際に、対応する [エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) を指定します。この設定を持つ既存のテーブルは、グローバル設定が変更されても、その動作は変わりません。

**可能な値**

- `0` — 機能がオフにされます。
- `1` — 機能がオンにされます。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) の場合、[replicated](../../engines/table-engines/mergetree-family/replication.md) テーブルは、データ部分のヘッダーを単一の `znode` を使用してコンパクトに保存します。テーブルに多くのカラムが含まれている場合、このストレージ方法は ZooKeeper に保存されるデータ量を大幅に削減します。

:::note
`use_minimalistic_part_header_in_zookeeper = 1` を適用した後、この設定をサポートしていないバージョンに ClickHouse サーバーをダウングレードすることはできません。クラスタ内のサーバーのアップグレード時には注意が必要です。すべてのサーバーを一度にアップグレードするのは避けるべきです。テスト環境で新しいバージョンの ClickHouse をテストするか、クラスタのごく一部のサーバーで試す方が安全です。

この設定で既に保存されたデータ部分ヘッダーは、以前の（非圧縮）表現に復元することはできません。
:::

## user_defined_executable_functions_config {#user_defined_executable_functions_config} 

ユーザー定義の実行可能関数のための設定ファイルへのパス。

パス:

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにはワイルドカード \* および ? を含めることができます。

参照:
- "[実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)。"

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## user_defined_path {#user_defined_path} 

ユーザー定義ファイルのディレクトリ。SQLのユーザー定義関数 [SQL User Defined Functions](/sql-reference/functions/udf) に使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## user_directories {#user_directories} 

設定ファイルのセクションで、以下の設定を含みます:
- 定義済みユーザーを含む設定ファイルへのパス。
- SQLコマンドで作成されたユーザーが格納されるフォルダへのパス。
- SQLコマンドで作成されたユーザーが保存され、レプリケーションされるZooKeeperノードパス（実験的）。

このセクションが指定されている場合、[users_config](/operations/server-configuration-parameters/settings#users_config)および[access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path)からのパスは使用されません。

`user_directories` セクションは任意の数の項目を含むことができ、項目の順序はその優先順位を意味します（上位の項目ほど優先順位が高い）。

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

ユーザー、ロール、行ポリシー、クォータ、およびプロファイルはZooKeeperにも保存できます:

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

また、`memory`セクション — メモリ内のみに情報を保存し、ディスクには書き込まないことを意味し、`ldap`セクション — ローカルに定義されていないユーザーのリモートユーザーディレクトリとしてLDAPサーバーに情報を保存することを定義できます。

ローカルに定義されていないユーザーのリモートユーザーディレクトリとしてLDAPサーバーを追加するには、以下の設定の単一の`ldap`セクションを定義します:

| 設定       | 説明                                                                                                                                                                                                                                                                                                                                                                      |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`   | `ldap_servers`設定セクションで定義されたLDAPサーバーのいずれかの名前。このパラメータは必須であり、空ではいけません。                                                                                                                                                                                                                                              |
| `roles`    | LDAPサーバーから取得した各ユーザーに割り当てられるローカルに定義されたロールのリストを含むセクション。ロールが指定されていない場合、ユーザーは認証後に何のアクションも実行できません。認証時にリストされたロールのいずれかがローカルに定義されていない場合、認証試行は失敗し、提供されたパスワードが間違っているかのように扱われます。 |

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

ユーザーファイルのディレクトリ。テーブル関数[file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md)に使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path} 

ユーザースクリプトファイルのディレクトリ。実行可能なユーザー定義関数 [実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions) に使用されます。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

タイプ:

デフォルト:
## users_config {#users_config} 

以下を含むファイルへのパス:

- ユーザー設定。
- アクセス権。
- 設定プロファイル。
- クォータ設定。

**例**

```xml
<users_config>users.xml</users_config>
```
## validate_tcp_client_information {#validate_tcp_client_information} 

<SettingsInfoBlock type="Bool" default_value="0" />クエリパケットを受信したときにクライアント情報の検証が有効かどうかを決定します。

デフォルトでは、`false`です:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```
## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />ベクトル類似性インデックスのエントリに対するキャッシュのサイズ。ゼロは無効を意味します。
## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />ベクトル類似性インデックスキャッシュポリシー名。
## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />ベクトル類似性インデックス用キャッシュのサイズ。ゼロは無効を意味します。

:::note
この設定は実行時に変更可能で、即座に効果を持ちます。
:::
## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />ベクトル類似性インデックスキャッシュ内の保護されたキューのサイズ（SLRUポリシーの場合）、キャッシュの合計サイズに対しての比率。
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup} 

<SettingsInfoBlock type="Bool" default_value="1" />
この設定は、`dictionaries_lazy_load`が`false`の場合の動作を指定することを許可します。
（`dictionaries_lazy_load`が`true`の場合、この設定は何にも影響しません。）

`wait_dictionaries_load_at_startup`が`false`の場合、サーバーは
起動時にすべての辞書を読み込み始め、読み込んでいる間に接続を受け入れます。
辞書が初めてクエリで使用される場合、辞書がまだ読み込まれていない場合は、その読み込みが完了するまでクエリは待機します。
`wait_dictionaries_load_at_startup`を`false`に設定すると、ClickHouseがより早く起動する可能性がありますが、いくつかのクエリは実行が遅くなる可能性があります
（いくつかの辞書が読み込まれるのを待たなければならないためです）。

`wait_dictionaries_load_at_startup`が`true`の場合、サーバーは起動時に
すべての辞書の読み込みが完了するまで待機します（成功するかどうかは問わない）その後、接続を受け付けます。

**例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```
## workload_path {#workload_path} 

`CREATE WORKLOAD`および`CREATE RESOURCE`クエリのすべてのストレージとして使用されるディレクトリ。デフォルトでは、サーバー作業ディレクトリの下の`/workload/`フォルダが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**関連情報**
- [ワークロード階層](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path} 

すべての`CREATE WORKLOAD`および`CREATE RESOURCE`クエリのストレージとして使用されるZooKeeperノードへのパス。一貫性のために、すべてのSQL定義はこの単一のznodeの値として保存されます。デフォルトでは、ZooKeeperは使用されず、定義は[ディスク](#workload_path)に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**関連情報**
- [ワークロード階層](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## zookeeper {#zookeeper} 

ClickHouseが[ZooKeeper](http://zookeeper.apache.org/)クラスタと対話することを許可する設定を含みます。ClickHouseはレプリケーションされたテーブルを使用する際、レプリカのメタデータを保存するためにZooKeeperを使用します。レプリケーションされたテーブルが使用されていない場合、このパラメータのセクションは省略できます。

以下の設定がサブタグで構成できます:

| 設定                                        | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                       | ZooKeeperエンドポイント。複数のエンドポイントを設定できます。例: `<node index="1"><host>example_host</host><port>2181</port></node>`。`index`属性は、ZooKeeperクラスタに接続しようとする際のノードの順序を指定します。                                                                                                                                                                                                                                        |
| `session_timeout_ms`                         | クライアントセッションの最大タイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                       | 一つの操作の最大タイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `root` (オプション)                          | ClickHouseサーバーによって使用されるznodeのルートとして使用されるznode。                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `fallback_session_lifetime.min` (オプション) | プライマリが利用できない場合にフォールバックノードへのZooKeeperセッションの最小寿命（ロードバランシング）を秒単位で設定します。デフォルト: 3時間。                                                                                                                                                                                                                                                                                                                                   |
| `fallback_session_lifetime.max` (オプション) | プライマリが利用できない場合にフォールバックノードへのZooKeeperセッションの最大寿命（ロードバランシング）を秒単位で設定します。デフォルト: 6時間。                                                                                                                                                                                                                                                                                                                                    |
| `identity` (オプション)                      | 要求されたznodeにアクセスするためにZooKeeperに必要なユーザー名とパスワード。                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `use_compression` (オプション)               | trueに設定するとKeeperプロトコルで圧縮が有効になります。                                                                                                                                                                                                                                                                                                                                                                                                                                                |

さらに、`zookeeper_load_balancing`設定（オプション）では、ZooKeeperノード選択のアルゴリズムを選択できます:

| アルゴリズム名                       | 説明                                                                                                                                    |
|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `random`                           | ZooKeeperノードのいずれかをランダムに選択します。                                                                                        |
| `in_order`                         | 最初のZooKeeperノードを選択し、それが利用できない場合は次に進みます。                                                                        |
| `nearest_hostname`                 | サーバーのホスト名と最も類似したホスト名を持つZooKeeperノードを選択し、ホスト名を名前の接頭辞と比較します。                                        |
| `hostname_levenshtein_distance`    | nearest_hostname同様ですが、ホスト名をレーベンシュタイン距離で比較します。                                                                    |
| `first_or_random`                  | 最初のZooKeeperノードを選択し、それが利用できない場合は残りのZooKeeperノードのいずれかをランダムに選択します。                                    |
| `round_robin`                      | 最初のZooKeeperノードを選択し、再接続が発生した場合は次のノードを選択します。                                                               |

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
    <!-- Optional. Chroot suffix. Should exist. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Optional. Zookeeper digest ACL string. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**関連情報**

- [レプリケーション](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeperプログラマーガイド](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouseとZooKeeper間のオプションによる安全な通信](/operations/ssl-zookeeper)
