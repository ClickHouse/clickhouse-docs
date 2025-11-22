## asynchronous_metric_log {#asynchronous_metric_log}

ClickHouse Cloudデプロイメントではデフォルトで有効です。

この設定がお使いの環境でデフォルトで有効になっていない場合は、ClickHouseのインストール方法に応じて、以下の手順で有効化または無効化できます。

**有効化**

非同期メトリックログの履歴収集[`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)を手動で有効にするには、以下の内容で`/etc/clickhouse-server/config.d/asynchronous_metric_log.xml`を作成してください:

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

`asynchronous_metric_log`設定を無効にするには、以下の内容で`/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`ファイルを作成してください:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## auth_use_forwarded_address {#auth_use_forwarded_address}

プロキシ経由で接続されたクライアントの認証に、送信元アドレスを使用します。

:::note
転送されたアドレスは容易に偽装される可能性があるため、この設定は十分な注意を払って使用する必要があります。このような認証を受け入れるサーバーには直接アクセスせず、信頼できるプロキシを経由してのみアクセスするようにしてください。
:::


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

この設定はデフォルトで次のように設定されています：

```xml
<backups>
    ....
</backups>
```


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


## table_engines_require_grant {#table_engines_require_grant}

trueに設定すると、ユーザーは特定のエンジンでテーブルを作成するために権限付与が必要になります。例：`GRANT TABLE ENGINE ON TinyLog to user`

:::note
デフォルトでは、後方互換性のため、特定のテーブルエンジンでのテーブル作成時に権限付与は無視されますが、この設定をtrueにすることでこの動作を変更できます。
:::


## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

組み込み辞書を再読み込みする間隔(秒単位)。

ClickHouseは組み込み辞書をx秒ごとに再読み込みします。これにより、サーバーを再起動せずに辞書を「オンザフライ」で編集することが可能になります。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


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
- `method` – 圧縮方式。指定可能な値: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`。
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

ここで`current_key_id`は暗号化に使用する現在の鍵を設定し、指定されたすべての鍵を復号化に使用できます。

これらの方法はそれぞれ複数の鍵に適用できます:

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

また、ユーザーは12バイト長のnonceを追加できます(デフォルトでは、暗号化および復号化プロセスはゼロバイトで構成されるnonceを使用します):

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


## custom_settings_prefixes {#custom_settings_prefixes}

[カスタム設定](/operations/settings/query-level#custom_settings)のプレフィックスのリスト。プレフィックスはカンマで区切ります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**関連項目**

- [カスタム設定](/operations/settings/query-level#custom_settings)


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


## default_profile {#default_profile}

デフォルト設定プロファイル。設定プロファイルは`user_config`設定で指定されたファイルに配置されています。

**例**

```xml
<default_profile>default</default_profile>
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


## user_defined_executable_functions_config {#user_defined_executable_functions_config}

実行可能なユーザー定義関数の設定ファイルへのパス。

パス:

- 絶対パスまたはサーバー設定ファイルからの相対パスを指定します。
- パスにはワイルドカード \* および ? を含めることができます。

関連項目:

- 「[実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)」

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## format_schema_path {#format_schema_path}

入力データのスキーマを含むディレクトリへのパスです。例えば、[CapnProto](/interfaces/formats/CapnProto)形式のスキーマなどが該当します。

**例**

```xml
<!-- 各種入力形式のスキーマファイルを含むディレクトリ -->
<format_schema_path>format_schemas/</format_schema_path>
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

Graphiteのデータ集約設定です。

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


## google_protos_path {#google_protos_path}

Protobuf型のprotoファイルを格納するディレクトリを定義します。

例:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## http_handlers {#http_handlers}

カスタムHTTPハンドラーを使用できます。
新しいHTTPハンドラーを追加するには、新しい`<rule>`を追加するだけです。
ルールは定義された順に上から下へチェックされ、
最初にマッチしたルールがハンドラーを実行します。

以下の設定をサブタグで構成できます:

| サブタグ             | 定義                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | リクエストURLとマッチさせます。正規表現マッチを使用する場合は'regex:'プレフィックスを使用できます(オプション)                                                           |
| `methods`            | リクエストメソッドとマッチさせます。複数のメソッドをマッチさせる場合はカンマで区切って指定できます(オプション)                                                       |
| `headers`            | リクエストヘッダーとマッチさせます。各子要素とマッチします(子要素名はヘッダー名)。正規表現マッチを使用する場合は'regex:'プレフィックスを使用できます(オプション) |
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


## http_server_default_response {#http_server_default_response}

ClickHouse HTTP(s)サーバーにアクセスした際にデフォルトで表示されるページです。
デフォルト値は "Ok." です（末尾に改行が含まれます）

**例**

`http://localhost: http_port`にアクセスした際に`https://tabix.io/`を開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## http_options_response {#http_options_response}

`OPTIONS` HTTPリクエストに対するレスポンスにヘッダーを追加するために使用します。
`OPTIONS`メソッドは、CORSプリフライトリクエストを行う際に使用されます。

詳細については、[OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)を参照してください。

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


## hsts_max_age {#hsts_max_age}

HSTSの有効期限を秒単位で指定します。

:::note
`0` を設定すると、ClickHouseはHSTSを無効化します。正の数値を設定すると、HSTSが有効化され、max-ageには設定した数値が使用されます。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## mlock_executable {#mlock_executable}

起動後に `mlockall` を実行して、初回クエリのレイテンシを低減し、高IO負荷下でClickHouse実行ファイルがページアウトされるのを防ぎます。

:::note
このオプションの有効化を推奨しますが、起動時間が最大数秒増加します。
この設定は "CAP_IPC_LOCK" ケーパビリティなしでは機能しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```


## include_from {#include_from}

置換を含むファイルへのパスです。XML形式とYAML形式の両方がサポートされています。

詳細については、「[設定ファイル](/operations/configuration-files)」のセクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
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


## interserver_http_port {#interserver_http_port}

ClickHouseサーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_http_host {#interserver_http_host}

他のサーバーがこのサーバーにアクセスする際に使用できるホスト名。

省略した場合、`hostname -f` コマンドと同じ方法で定義されます。

特定のネットワークインターフェースに依存しない構成にする際に有用です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_https_port {#interserver_https_port}

ClickHouseサーバー間で`HTTPS`を介してデータを交換するためのポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_https_host {#interserver_https_host}

[`interserver_http_host`](#interserver_http_host)と同様ですが、このホスト名は他のサーバーが`HTTPS`経由でこのサーバーにアクセスする際に使用されます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_http_credentials {#interserver_http_credentials}

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)時に他のサーバーへ接続する際に使用するユーザー名とパスワードです。また、サーバーはこれらの認証情報を使用して他のレプリカを認証します。
そのため、`interserver_http_credentials`はクラスタ内のすべてのレプリカで同一である必要があります。

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


## ldap_servers {#ldap_servers}

以下の目的でLDAPサーバーとその接続パラメータをここに記載します:

- 'password'の代わりに'ldap'認証メカニズムが指定された専用ローカルユーザーの認証機能として使用する
- リモートユーザーディレクトリとして使用する

以下の設定はサブタグで構成できます:

| 設定                        | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `host`                         | LDAPサーバーのホスト名またはIP。このパラメータは必須であり、空にすることはできません。                                                                                                                                                                                                                                                                                                                                                               |
| `port`                         | LDAPサーバーのポート。`enable_tls`がtrueに設定されている場合のデフォルトは636、それ以外の場合は`389`です。                                                                                                                                                                                                                                                                                                                                                                                          |
| `bind_dn`                      | バインド先のDNを構築するために使用されるテンプレート。結果のDNは、各認証試行時にテンプレート内のすべての`\{user_name\}`部分文字列を実際のユーザー名に置き換えることで構築されます。                                                                                                                                                                                                                               |
| `user_dn_detection`            | バインドされたユーザーの実際のユーザーDNを検出するためのLDAP検索パラメータを含むセクション。これは主に、サーバーがActive Directoryの場合のさらなるロールマッピングのための検索フィルタで使用されます。結果のユーザーDNは、許可されている箇所で`\{user_dn\}`部分文字列を置き換える際に使用されます。デフォルトでは、ユーザーDNはバインドDNと同じ値に設定されますが、検索が実行されると、実際に検出されたユーザーDN値に更新されます。 |
| `verification_cooldown`        | バインド試行が成功した後の期間(秒単位)。この期間中、ユーザーはLDAPサーバーに接続することなく、すべての連続したリクエストに対して正常に認証されたものと見なされます。キャッシュを無効にし、各認証リクエストでLDAPサーバーへの接続を強制するには、`0`(デフォルト)を指定します。                                                                                                                    |
| `enable_tls`                   | LDAPサーバーへのセキュア接続の使用を有効にするフラグ。平文(`ldap://`)プロトコル(非推奨)には`no`を指定します。LDAP over SSL/TLS(`ldaps://`)プロトコル(推奨、デフォルト)には`yes`を指定します。レガシーStartTLSプロトコル(平文(`ldap://`)プロトコルからTLSにアップグレード)には`starttls`を指定します。                                                                                                                 |
| `tls_minimum_protocol_version` | SSL/TLSの最小プロトコルバージョン。指定可能な値: `ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`(デフォルト)。                                                                                                                                                                                                                                                                                                                                  |
| `tls_require_cert`             | SSL/TLSピア証明書検証の動作。指定可能な値: `never`、`allow`、`try`、`demand`(デフォルト)。                                                                                                                                                                                                                                                                                                                      |
| `tls_cert_file`                | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tls_key_file`                 | 証明書キーファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_ca_cert_file`             | CA証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tls_ca_cert_dir`              | CA証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                                          |
| `tls_cipher_suite`             | 許可される暗号スイート(OpenSSL表記)。                                                                                                                                                                                                                                                                                                                                                                                                                |

設定`user_dn_detection`はサブタグで構成できます:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base_dn`       | LDAP検索のベースDNを構築するために使用されるテンプレート。結果のDNは、LDAP検索中にテンプレート内のすべての`\{user_name\}`および'\{bind_dn\}'部分文字列を実際のユーザー名とバインドDNに置き換えることで構築されます。                                                                                                        |
| `scope`         | LDAP検索のスコープ。指定可能な値: `base`、`one_level`、`children`、`subtree`(デフォルト)。                                                                                                                                                                                                                                            |
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

例（以降のロールマッピングのためにユーザー DN 検出を設定した典型的な Active Directory 環境）:

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

リクエストの送信元ホストに対する制限です。サーバーがすべてのホストからのリクエストに応答するようにする場合は、`::` を指定します。

例:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen_try {#listen_try}

リッスン試行時にIPv6またはIPv4ネットワークが利用できない場合でも、サーバーは終了しません。

**例**

```xml
<listen_try>0</listen_try>
```


## listen_reuse_port {#listen_reuse_port}

複数のサーバーが同じアドレス:ポートでリッスンできるようにします。リクエストはオペレーティングシステムによってランダムにサーバーへルーティングされます。この設定の有効化は推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

型:

デフォルト:


## listen_backlog {#listen_backlog}

listenソケットのバックログ（保留中の接続のキューサイズ）。デフォルト値の`4096`はLinux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)と同じ値です。

通常、この値を変更する必要はありません。理由は以下の通りです：

- デフォルト値は十分に大きい
- クライアントの接続を受け入れるために、サーバーは専用のスレッドを持っている

したがって、`TcpExtListenOverflows`（`nstat`から取得）がゼロ以外で、このカウンターがClickHouseサーバーで増加している場合でも、この値を増やす必要があるとは限りません。理由は以下の通りです：

- 通常、`4096`が不十分な場合、それはClickHouse内部のスケーリングの問題を示しているため、問題を報告する方が良い
- サーバーが後でより多くの接続を処理できることを意味するわけではない（たとえ処理できたとしても、その時点でクライアントはすでに離脱または切断されている可能性がある）

**例**

```xml
<listen_backlog>4096</listen_backlog>
```


## logger {#logger}

ログメッセージの出力先と形式。

**キー**:

| キー                    | 説明                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `level`                | ログレベル。指定可能な値: `none`(ログ記録を無効化)、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                 |
| `log`                  | ログファイルのパス。                                                                                                                                          |
| `errorlog`             | エラーログファイルのパス。                                                                                                                                    |
| `size`                 | ローテーションポリシー: ログファイルの最大サイズ(バイト単位)。ログファイルのサイズがこの閾値を超えると、名前が変更されてアーカイブされ、新しいログファイルが作成される。 |
| `count`                | ローテーションポリシー: ClickHouseが保持する過去のログファイルの最大数。                                                                                        |
| `stream_compress`      | LZ4を使用してログメッセージを圧縮する。有効にするには`1`または`true`を設定する。                                                                                   |
| `console`              | コンソールへのログ記録を有効にする。有効にするには`1`または`true`を設定する。デフォルトはClickHouseがデーモンモードで実行されていない場合は`1`、それ以外は`0`。            |
| `console_log_level`    | コンソール出力のログレベル。デフォルトは`level`。                                                                                                                 |
| `formatting.type`      | コンソール出力のログ形式。現在、`json`のみがサポートされている。                                                                                                 |
| `use_syslog`           | ログ出力をsyslogにも転送する。                                                                                                                                 |
| `syslog_level`         | syslogへのログ記録のログレベル。                                                                                                                                   |
| `async`                | `true`(デフォルト)の場合、ログ記録は非同期で行われる(出力チャネルごとに1つのバックグラウンドスレッド)。それ以外の場合は、LOGを呼び出すスレッド内でログ記録される。           |
| `async_queue_max_size` | 非同期ログ記録を使用する場合、フラッシュ待ちのキューに保持されるメッセージの最大数。超過したメッセージは破棄される。                       |
| `startup_level`        | 起動レベルは、サーバー起動時にルートロガーレベルを設定するために使用される。起動後、ログレベルは`level`設定に戻される。                                   |
| `shutdown_level`       | シャットダウンレベルは、サーバーシャットダウン時にルートロガーレベルを設定するために使用される。                                                                                            |

**ログ形式指定子**

`log`および`errorLog`パスのファイル名は、結果のファイル名に対して以下の形式指定子をサポートする(ディレクトリ部分はサポートしない)。

「Example」列は`2023-07-06 18:32:07`時点の出力を示す。


| 指定子  | 説明                                                                                                               | 例                          |
| ---- | ---------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%` | リテラルの % 記号                                                                                                       | `%`                        |
| `%n` | 改行文字                                                                                                             |                            |
| `%t` | 水平タブ文字                                                                                                           |                            |
| `%Y` | 年を10進数で表した数値。例：2017                                                                                              | `2023`                     |
| `%y` | 年の下2桁を10進数で表した数（範囲 [00,99]）                                                                                      | `23`                       |
| `%C` | 年の上位2桁を10進数で表した値（範囲 [00,99]）                                                                                     | `20`                       |
| `%G` | 4 桁の [ISO 8601 の週単位暦年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、すなわち指定された週を含む年。通常は `%V` と併用する場合にのみ有用です | `2023`                     |
| `%g` | [ISO 8601 週基準年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)の下位2桁、つまり指定された週を含む年を表します。                      | `23`                       |
| `%b` | 月名の略称。例：Oct（ロケールに依存）                                                                                             | `Jul`                      |
| `%h` | %b の別名                                                                                                           | `Jul`                      |
| `%B` | 月名（完全な表記）。例：October（ロケール依存）                                                                                      | `7月`                       |
| `%m` | 10進数の月番号（01〜12）                                                                                                  | `07`                       |
| `%U` | 年内の週番号を10進数で表したもの（週の開始曜日は日曜日）（範囲 [00,53]）                                                                        | `27`                       |
| `%W` | 年内の週番号を10進数で表したもの（月曜日を週の最初の曜日とする）（範囲 [00,53]）                                                                    | `27`                       |
| `%V` | ISO 8601 の週番号（範囲 [01,53]）                                                                                        | `27`                       |
| `%j` | 年内通算日を10進数で表した値（範囲 [001,366]）                                                                                    | `187`                      |
| `%d` | 月内の日をゼロ埋めした10進数で表したもの（範囲 [01,31]）。1桁の場合は先頭に 0 が付きます。                                                             | `06`                       |
| `%e` | 月内の日を、前を空白で埋めた 10 進数で表します（範囲 [1,31]）。1 桁の場合は、その前に空白が付きます。                                                        | `&nbsp; 6`                 |
| `%a` | 省略された曜日名。例: Fri（ロケールに依存）                                                                                         | `木`                        |
| `%A` | 曜日のフル名。例: Friday（ロケール依存）                                                                                         | `木曜日`                      |
| `%w` | 日曜日を0とする整数値で表した曜日（範囲 [0-6]）                                                                                      | `4`                        |
| `%u` | 曜日を表す10進数値で、月曜日を1とする（ISO 8601 形式）（範囲 [1-7]）                                                                      | `4`                        |
| `%H` | 24時間制における時を10進数で表したもの（範囲 [00-23]）                                                                                | `18`                       |
| `%I` | 時間（10 進数、12 時間制、範囲 [01,12]）                                                                                      | `06`                       |
| `%M` | 10進数表記の分（範囲 [00,59]）                                                                                             | `32`                       |
| `%S` | 10進数の秒（範囲 [00,60]）                                                                                               | `07`                       |
| `%c` | 標準的な日付と時刻の文字列、例: Sun Oct 17 04:41:13 2010（ロケール依存）                                                                | `Thu Jul  6 18:32:07 2023` |
| `%x` | ロケールに依存したローカライズ済みの日付表現                                                                                           | `07/06/23`                 |
| `%X` | ローカライズされた時刻表記。例: 18:40:20 または 6:40:20 PM（ロケールに依存）                                                                | `18:32:07`                 |
| `%D` | 短い MM/DD/YY 形式の日付で、%m/%d/%y と同等です。                                                                               | `07/06/23`                 |
| `%F` | 短い形式の YYYY-MM-DD 日付で、`%Y-%m-%d` と同等。                                                                             | `2023-07-06`               |
| `%r` | ロケールに依存するローカライズされた12時間制の時刻                                                                                       | `06:32:07 PM`              |
| `%R` | &quot;%H:%M&quot; と同じ                                                                                            | `18:32`                    |
| `%T` | &quot;%H:%M:%S&quot;（ISO 8601 の時刻形式）と同等                                                                          | `18:32:07`                 |
| `%p` | ローカライズされた午前／午後の表記（ロケール依存）                                                                                        | `PM`                       |
| `%z` | ISO 8601 形式の UTC からのオフセット（例: -0430）、またはタイムゾーン情報が利用できない場合は何も出力されません                                               | `+0800`                    |
| `%Z` | ロケール依存のタイムゾーン名またはその略称。タイムゾーン情報が利用できない場合は空文字列                                                                     | `Z AWST `                  |

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

ログメッセージをコンソールにのみ出力するには、次のようにします。

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個々のログ名ごとにログレベルを上書きできます。たとえば、ロガー「Backup」と「RBAC」のすべてのメッセージを抑制するには、次のように設定します。

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

ログメッセージを syslog にも書き出すには：

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

| Key        | Description                                                                                                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | `host\[:port\]` 形式の syslog のアドレス。省略された場合はローカルデーモンが使用されます。                                                                                                                                                            |
| `hostname` | ログを送信するホスト名 (省略可能)。                                                                                                                                                                                                  |
| `facility` | syslog の [facility キーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。必ず先頭に「LOG&#95;」を付け、大文字で指定する必要があります。例: `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` など。デフォルト: `address` が指定されている場合は `LOG_USER`、それ以外は `LOG_DAEMON`。 |
| `format`   | ログメッセージの形式。指定可能な値: `bsd` および `syslog`。                                                                                                                                                                               |

**ログ形式**

コンソールログに出力されるログ形式を指定できます。現在は JSON のみがサポートされています。

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
  "message": "シグナル2を受信",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

JSON ログ出力のサポートを有効にするには、次のスニペットを使用します。

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

`<names>` タグ内のタグの値を変更することで、キー名を変更できます。たとえば、`DATE_TIME` を `MY_DATE_TIME` に変更するには、`<date_time>MY_DATE_TIME</date_time>` と指定します。

**JSON ログのキーの省略**

ログのプロパティは、そのプロパティをコメントアウトすることで省略できます。たとえば、ログに `query_id` を出力したくない場合は、`<query_id>` タグをコメントアウトします。


## send_crash_reports {#send_crash_reports}

ClickHouseコア開発チームへクラッシュレポートを送信するための設定です。

特に本番前環境では、この機能を有効にすることを強く推奨します。

キー:

| Key                   | Description                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`             | 機能を有効にするためのブール値フラグです。デフォルトは`true`です。クラッシュレポートの送信を無効にするには`false`に設定します。                                |
| `send_logical_errors` | `LOGICAL_ERROR`は`assert`のようなもので、ClickHouseのバグを示します。このブール値フラグはこれらの例外の送信を有効にします（デフォルト: `true`）。 |
| `endpoint`            | クラッシュレポート送信先のエンドポイントURLを上書きできます。                                                                         |

**推奨される使用方法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


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


## tcp_ssh_port {#tcp_ssh_port}

PTY経由で組み込みクライアントを使用し、ユーザーが接続して対話的にクエリを実行できるようにするSSHサーバーのポートです。

例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


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
| `path`                  | サーバーデータが保存されるパス（`data`および`shadow`ディレクトリ）。末尾は`/`で終わる必要があります。 |
| `keep_free_space_bytes` | ディスク上で予約される空き容量のサイズ。                                                              |

:::note
ディスクの順序は重要ではありません。
:::

### ポリシーの構成 {#configuration-of-policies}

上記のサブタグは`policies`に対して以下の設定を定義します:


| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシー名。ポリシー名は一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | ボリューム名。ボリューム名は一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `disk`                       | ボリューム内に存在するディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `max_data_part_size_bytes`   | このボリューム内のいずれかのディスク上に存在できるデータチャンクの最大サイズ。マージの結果として、チャンクサイズが `max_data_part_size_bytes` を超えると見込まれる場合、そのチャンクは次のボリュームに書き込まれます。基本的にこの機能により、新規／小さいチャンクをホット（SSD）ボリュームに保存し、十分な大きさに達したときにコールド（HDD）ボリュームへ移動できます。ポリシーにボリュームが 1 つしかない場合は、このオプションを使用しないでください。                                                                 |
| `move_factor`                | ボリューム上で利用可能な空き容量の割合。この割合より空き容量が少なくなると、（存在する場合は）データは次のボリュームへの移動を開始します。移動にあたっては、チャンクはサイズの大きいものから小さいものへ（降順で）ソートされ、合計サイズが `move_factor` の条件を満たすのに十分なチャンクが選択されます。すべてのチャンクの合計サイズでも条件を満たせない場合は、すべてのチャンクが移動されます。                                                                                                             |
| `perform_ttl_move_on_insert` | 挿入時に、TTL 期限切れデータの移動を無効にします。デフォルト（有効な場合）では、有効期間に基づく移動ルールに従って既に期限切れとなっているデータを挿入すると、そのデータは直ちにその移動ルールで指定されたボリューム／ディスクに移動されます。ターゲットのボリューム／ディスクが遅い（例: S3）場合、これは挿入処理を大きく低速化する可能性があります。無効にした場合、期限切れ部分のデータは一旦デフォルトボリュームに書き込まれ、その後すぐに、期限切れ TTL に対するルールで指定されたボリュームへ移動されます。 |
| `load_balancing`             | ディスクのバランシングポリシー。`round_robin` または `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                       |
| `least_used_ttl_ms`          | すべてのディスク上の利用可能容量を更新するためのタイムアウト（ミリ秒）を設定します（`0` - 常に更新、`-1` - 決して更新しない、デフォルト値は `60000`）。ディスクが ClickHouse によってのみ使用され、オンラインでのファイルシステムのリサイズが行われない場合は、`-1` の値を使用できます。それ以外の場合には、最終的に不正確な容量割り当てを招くため、これは推奨されません。                                                                                                                   |
| `prefer_not_to_merge`        | このボリューム上のデータパーツのマージを無効にします。注意: これは潜在的に有害であり、パフォーマンス低下を引き起こす可能性があります。この設定が有効な場合（行わないことを推奨します）、このボリューム上でのデータマージは禁止されます（これは望ましくありません）。これにより、ClickHouse が遅いディスクとどのようにやり取りするかを制御できます。使用しないことを推奨します。                                                                                                                                                                                       |
| `volume_priority`            | ボリュームがどの順序で埋められるかの優先度（順序）を定義します。値が小さいほど優先度が高くなります。パラメータ値は自然数でなければならず、1 から N（N は指定されたパラメータ値の最大値）までの範囲を欠番なしでカバーする必要があります。                                                                                                                                                                                                                                                                |

`volume_priority` について:
- すべてのボリュームがこのパラメータを持つ場合、指定された順序で優先されます。
- _一部の_ ボリュームだけがこのパラメータを持つ場合、パラメータを持たないボリュームは最も低い優先度になります。パラメータを持つボリュームはパラメータ値に従って優先され、残りのボリュームの優先度は、設定ファイル内で互いに対して記述されている順序によって決まります。
- _いずれの_ ボリュームにもこのパラメータが与えられていない場合、その順序は設定ファイル内での記述順により決定されます。
- ボリュームの優先度は同一である必要はありません。



## macros {#macros}

レプリケーテッドテーブルのパラメータ置換。

レプリケーテッドテーブルを使用しない場合は省略できます。

詳細については、[レプリケーテッドテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)のセクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```


## replica_group_name {#replica_group_name}

Replicatedデータベースのレプリカグループ名。

Replicatedデータベースによって作成されるクラスターは、同じグループ内のレプリカで構成されます。
DDLクエリは同じグループ内のレプリカのみを待機します。

デフォルトでは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```


## remap_executable {#remap_executable}

ヒュージページを使用してマシンコード（「テキスト」）のメモリを再割り当てする設定。

:::note
この機能は実験的な段階です。
:::

例:

```xml
<remap_executable>false</remap_executable>
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


## max_session_timeout {#max_session_timeout}

最大セッションタイムアウト（秒単位）。

例：

```xml
<max_session_timeout>3600</max_session_timeout>
```


## merge_tree {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルの詳細設定。

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


## replicated_merge_tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルの詳細設定です。この設定はより高い優先度を持ちます。

詳細については、MergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
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


## openSSL {#openSSL}

SSLクライアント/サーバーの設定。

SSLのサポートは`libpoco`ライブラリによって提供されています。利用可能な設定オプションについては[SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)で説明されています。デフォルト値は[SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp)で確認できます。

サーバー/クライアント設定用のキー:


| オプション                         | 説明                                                                                                                                                                                                                                                                                                                       | 既定値                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 証明書の秘密鍵が格納されているファイルへのパス。このファイルには、鍵と証明書の両方を含めることができます。                                                                                                                                                                                                                                                                |                                                                                            |
| `certificateFile`             | PEM 形式のクライアント／サーバー証明書ファイルへのパス。`privateKeyFile` に証明書が含まれている場合は、指定を省略できます。                                                                                                                                                                                                                                                 |                                                                                            |
| `caConfig`                    | 信頼された CA 証明書を含むファイルまたはディレクトリへのパス。ファイルを指す場合は PEM 形式である必要があり、複数の CA 証明書を含めることができます。ディレクトリを指す場合は、CA 証明書ごとに .pem ファイルを 1 つ含める必要があります。ファイル名は CA のサブジェクト名ハッシュ値に基づいて検索されます。詳細は [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) の man ページを参照してください。 |                                                                                            |
| `verificationMode`            | ノードの証明書を検証する方法。詳細は [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明を参照してください。設定可能な値: `none`、`relaxed`、`strict`、`once`。                                                                                                                                  | `relaxed`                                                                                  |
| `verificationDepth`           | 検証チェーンの最大長。証明書チェーンの長さが設定値を超えると、検証は失敗します。                                                                                                                                                                                                                                                                                 | `9`                                                                                        |
| `loadDefaultCAFile`           | OpenSSL の組み込み CA 証明書を使用するかどうかを指定します。ClickHouse は、組み込み CA 証明書がファイル `/etc/ssl/cert.pem`（またはディレクトリ `/etc/ssl/certs`）にあるか、環境変数 `SSL_CERT_FILE`（または `SSL_CERT_DIR`）で指定されたファイル（またはディレクトリ）に存在すると想定します。                                                                                                                          | `true`                                                                                     |
| `cipherList`                  | サポートされている OpenSSL 暗号化方式                                                                                                                                                                                                                                                                                                  | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | セッションキャッシュを有効または無効にします。`sessionIdContext` と組み合わせて使用する必要があります。使用可能な値: `true`、`false`。                                                                                                                                                                                                                                     | `false`                                                                                    |
| `sessionIdContext`            | サーバーが生成する各識別子にサーバーが付加する、ランダムな文字からなる一意の集合です。文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはなりません。サーバー側でセッションをキャッシュする場合にも、クライアントがキャッシュを要求した場合にも問題を回避するのに役立つため、このパラメーターの設定を行うことが常に推奨されます。                                                                                                                                     | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | サーバーがキャッシュするセッションの最大数です。値が `0` の場合、セッション数は無制限です。                                                                                                                                                                                                                                                                         | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | サーバー上でセッションをキャッシュしておく時間（時間単位）。                                                                                                                                                                                                                                                                                           | `2`                                                                                        |
| `extendedVerification`        | 有効にすると、証明書の CN または SAN がピアのホスト名と一致していることを検証します。                                                                                                                                                                                                                                                                          | `false`                                                                                    |
| `requireTLSv1`                | TLSv1 接続を必須にします。指定可能な値: `true`, `false`。                                                                                                                                                                                                                                                                                 | `false`                                                                                    |
| `requireTLSv1_1`              | TLSv1.1 の接続を必須とします。許容される値: `true`、`false`。                                                                                                                                                                                                                                                                               | `false`                                                                                    |
| `requireTLSv1_2`              | TLSv1.2 接続を必須にします。指定可能な値: `true`, `false`。                                                                                                                                                                                                                                                                               | `false`                                                                                    |
| `fips`                        | OpenSSL の FIPS モードを有効にします。ライブラリの OpenSSL バージョンが FIPS をサポートしている場合にのみ有効です。                                                                                                                                                                                                                                                 | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandler のサブクラス）。例：`<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                      | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するためのクラス（CertificateHandler のサブクラス）。例えば、`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` 。                                                                                                                                                                      | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 使用が禁止されているプロトコル。                                                                                                                                                                                                                                                                                                         |                                                                                            |
| `preferServerCiphers`         | クライアント優先のサーバー暗号スイート。                                                                                                                                                                                                                                                                                                     | `false`                                                                                    |

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


## path {#path}

データを格納するディレクトリへのパス。

:::note
末尾のスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
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

- `endpoint` – PrometheusサーバーがメトリクスをスクレイピングするためのHTTPエンドポイント。'/'で始まる必要があります。
- `port` – `endpoint`のポート番号。
- `metrics` – [system.metrics](/operations/system-tables/metrics)テーブルのメトリクスを公開します。
- `events` – [system.events](/operations/system-tables/events)テーブルのメトリクスを公開します。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルの現在のメトリクス値を公開します。
- `errors` - 前回のサーバー再起動以降に発生したエラーコード別のエラー数を公開します。この情報は[system.errors](/operations/system-tables/errors)からも取得できます。

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


## query_log {#query_log}

[log_queries=1](../../operations/settings/settings.md) 設定で受信したクエリをログに記録するための設定です。

クエリは個別のファイルではなく、[system.query_log](/operations/system-tables/query_log) テーブルに記録されます。テーブル名は `table` パラメータで変更できます(下記参照)。

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


## text_log {#text_log}

テキストメッセージのログ記録を行う [text_log](/operations/system-tables/text_log) システムテーブルの設定です。

<SystemLogParameters />

追加設定:

| 設定 | 説明                                                                 | デフォルト値 |
| ------- | --------------------------------------------------------------------------- | ------------- |
| `level` | テーブルに保存される最大メッセージレベル(デフォルトは `Trace`)。 | `Trace`       |

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


## asynchronous_insert_log {#asynchronous_insert_log}

非同期挿入をログに記録する[asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log)システムテーブルの設定です。

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


## crash_log {#crash_log}

[crash_log](../../operations/system-tables/crash_log.md) システムテーブルの動作に関する設定です。

以下の設定はサブタグで構成できます:

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
| `buffer_size_rows_flush_threshold` | 行数のしきい値。しきい値に達すると、ログのディスクへのフラッシュがバックグラウンドで開始されます。                             | `max_size_rows / 2` |                                                                                                                    |
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

この設定は、カスタム（SQLから作成された）キャッシュディスクのキャッシュパスを指定します。
`custom_cached_disks_base_directory`は、カスタムディスクに対して`filesystem_caches_path`（`filesystem_caches_path.xml`内に存在）よりも優先されます。前者が存在しない場合は後者が使用されます。
ファイルシステムキャッシュ設定のパスは、このディレクトリ内に配置する必要があります。そうでない場合、例外がスローされ、ディスクの作成が阻止されます。

:::note
これは、サーバーがアップグレードされる前の古いバージョンで作成されたディスクには影響しません。この場合、サーバーが正常に起動できるように、例外はスローされません。
:::

例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


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


## query_masking_rules {#query_masking_rules}

正規表現ベースのルールで、サーバーログ、[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes)テーブル、およびクライアントに送信されるログに保存される前に、クエリおよびすべてのログメッセージに適用されます。これにより、名前、メールアドレス、個人識別子、クレジットカード番号などの機密データがSQLクエリからログに漏洩することを防止できます。

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
| --------- | ----------------------------------------------------------------------------- |
| `name`    | ルールの名前（任意）                                                  |
| `regexp`  | RE2互換の正規表現（必須）                                 |
| `replace` | 機密データの置換文字列（任意、デフォルトはアスタリスク6個） |

マスキングルールはクエリ全体に適用されます（不正な形式または解析不可能なクエリからの機密データ漏洩を防ぐため）。

[`system.events`](/operations/system-tables/events)テーブルには、クエリマスキングルールの一致総数を保持する`QueryMaskingRulesMatch`カウンターがあります。

分散クエリの場合、各サーバーを個別に設定する必要があります。そうしないと、他のノードに渡されるサブクエリがマスキングなしで保存されます。


## remote_servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md)テーブルエンジンおよび`cluster`テーブル関数で使用されるクラスターの設定。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl`属性の値については、「[設定ファイル](/operations/configuration-files)」のセクションを参照してください。

**関連項目**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [クラスター検出](../../operations/cluster-discovery.md)
- [レプリケーテッドデータベースエンジン](../../engines/database-engines/replicated.md)


## remote_url_allow_hosts {#remote_url_allow_hosts}

URL関連のストレージエンジンおよびテーブル関数で使用を許可するホストのリスト。

`\<host\>` XMLタグでホストを追加する際：

- DNS解決前に名前がチェックされるため、URLに記載されている通りに正確に指定する必要があります。例：`<host>clickhouse.com</host>`
- URLでポートが明示的に指定されている場合、host:portが全体としてチェックされます。例：`<host>clickhouse.com:80</host>`
- ホストがポートなしで指定されている場合、そのホストの任意のポートが許可されます。例：`<host>clickhouse.com</host>`が指定されている場合、`clickhouse.com:20`（FTP）、`clickhouse.com:80`（HTTP）、`clickhouse.com:443`（HTTPS）などが許可されます。
- ホストがIPアドレスとして指定されている場合、URLに指定された通りにチェックされます。例：`[2a02:6b8:a::a]`
- リダイレクトが存在し、リダイレクトのサポートが有効になっている場合、すべてのリダイレクト（locationフィールド）がチェックされます。

例：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


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


## mysql_require_secure_transport {#mysql_require_secure_transport}

trueに設定すると、[mysql_port](#mysql_port)経由でクライアントとの安全な通信が必須になります。`--ssl-mode=none`オプションを指定した接続は拒否されます。[OpenSSL](#openssl)の設定と併用してください。


## postgresql_require_secure_transport {#postgresql_require_secure_transport}

trueに設定すると、[postgresql_port](#postgresql_port)経由でクライアントとの安全な通信が必須になります。`sslmode=disable`オプションを使用した接続は拒否されます。[OpenSSL](#openssl)設定と併用してください。


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


## user_defined_path {#user_defined_path}

ユーザー定義ファイルを格納するディレクトリです。SQL ユーザー定義関数 [SQL ユーザー定義関数](/sql-reference/functions/udf) で使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


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


## access_control_improvements {#access_control_improvements}

アクセス制御システムのオプション改善に関する設定です。

| 設定                                         | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | デフォルト |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | 許可的な行ポリシーを持たないユーザーが`SELECT`クエリで行を読み取れるかどうかを設定します。例えば、ユーザーAとBが存在し、行ポリシーがAに対してのみ定義されている場合、この設定がtrueであればユーザーBはすべての行を閲覧できます。この設定がfalseの場合、ユーザーBは行を閲覧できません。                                                                                                                                                                                                                    | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER`クエリに`CLUSTER`権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>`に権限が必要かどうか、および任意のユーザーが実行できるかどうかを設定します。trueに設定すると、このクエリは非システムテーブルと同様に`GRANT SELECT ON system.<table>`が必要になります。例外: 一部のシステムテーブル(`tables`、`columns`、`databases`、および`one`、`contributors`などの定数テーブル)は引き続きすべてのユーザーがアクセス可能です。また、`SHOW`権限(例: `SHOW USERS`)が付与されている場合、対応するシステムテーブル(すなわち`system.users`)にアクセスできます。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>`に権限が必要かどうか、および任意のユーザーが実行できるかどうかを設定します。trueに設定すると、このクエリは通常のテーブルと同様に`GRANT SELECT ON information_schema.<table>`が必要になります。                                                                                                                                                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | 設定プロファイル内のある設定に対する制約が、その設定に対する以前の制約(他のプロファイルで定義されたもの)のアクションをキャンセルするかどうかを設定します。これには新しい制約によって設定されていないフィールドも含まれます。また、`changeable_in_readonly`制約タイプを有効にします。                                                                                                                                                                                                                            | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンでテーブルを作成する際に権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`            | ロールがRole Cacheに保存される、最終アクセスからの秒数を設定します。                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`   |

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


## zookeeper {#zookeeper}

ClickHouseが[ZooKeeper](http://zookeeper.apache.org/)クラスタと連携するための設定を含みます。ClickHouseはレプリケートテーブルを使用する際に、レプリカのメタデータを保存するためにZooKeeperを使用します。レプリケートテーブルを使用しない場合、このパラメータセクションは省略できます。

以下の設定をサブタグで構成できます:

| 設定                                        | 説明                                                                                                                                                                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeperエンドポイント。複数のエンドポイントを設定できます。例: `<node index="1"><host>example_host</host><port>2181</port></node>`。`index`属性はZooKeeperクラスタへの接続を試みる際のノード順序を指定します。 |
| `session_timeout_ms`                       | クライアントセッションの最大タイムアウト(ミリ秒単位)。                                                                                                                                                                      |
| `operation_timeout_ms`                     | 1つの操作の最大タイムアウト(ミリ秒単位)。                                                                                                                                                                           |
| `root` (オプション)                          | ClickHouseサーバーが使用するznodeのルートとして使用されるznode。                                                                                                                                                 |
| `fallback_session_lifetime.min` (オプション) | プライマリが利用できない場合のフォールバックノードへのZooKeeperセッションの最小有効期間(負荷分散)。秒単位で設定します。デフォルト: 3時間。                                                                   |
| `fallback_session_lifetime.max` (オプション) | プライマリが利用できない場合のフォールバックノードへのZooKeeperセッションの最大有効期間(負荷分散)。秒単位で設定します。デフォルト: 6時間。                                                                   |
| `identity` (オプション)                      | ZooKeeperが要求されたznodeにアクセスするために必要なユーザーとパスワード。                                                                                                                                                          |
| `use_compression` (オプション)               | trueに設定するとKeeperプロトコルで圧縮を有効にします。                                                                                                                                                                       |

ZooKeeperノード選択のアルゴリズムを選択できる`zookeeper_load_balancing`設定(オプション)もあります:

| アルゴリズム名                  | 説明                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `random`                        | ZooKeeperノードの中からランダムに1つを選択します。                                                                                       |
| `in_order`                      | 最初のZooKeeperノードを選択し、利用できない場合は2番目、というように順番に選択します。                                            |
| `nearest_hostname`              | サーバーのホスト名に最も類似したホスト名を持つZooKeeperノードを選択します。ホスト名は名前のプレフィックスで比較されます。 |
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
    <!-- オプション。Chrootサフィックス。存在する必要があります。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- オプション。ZooKeeper digest ACL文字列。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**関連項目**

- [レプリケーション](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper プログラマーズガイド](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouseとZooKeeper間のオプションのセキュア通信](/operations/ssl-zookeeper)


## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeper内のデータパートヘッダーの保存方法を指定します。この設定は[`MergeTree`](/engines/table-engines/mergetree-family)ファミリーにのみ適用されます。以下の方法で指定できます:

**`config.xml`ファイルの[merge_tree](#merge_tree)セクションでグローバルに設定**

ClickHouseはサーバー上のすべてのテーブルに対してこの設定を使用します。設定はいつでも変更可能です。既存のテーブルは設定変更時に動作が変わります。

**各テーブル単位で設定**

テーブル作成時に対応する[エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)を指定します。この設定を持つ既存のテーブルの動作は、グローバル設定が変更されても影響を受けません。

**設定可能な値**

- `0` — 機能は無効です。
- `1` — 機能は有効です。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)の場合、[レプリケート](../../engines/table-engines/mergetree-family/replication.md)テーブルは単一の`znode`を使用してデータパートのヘッダーをコンパクトに保存します。テーブルに多数のカラムが含まれる場合、この保存方法によりZooKeeperに保存されるデータ量が大幅に削減されます。

:::note
`use_minimalistic_part_header_in_zookeeper = 1`を適用した後は、この設定をサポートしていないバージョンにClickHouseサーバーをダウングレードすることはできません。クラスター内のサーバーでClickHouseをアップグレードする際は注意が必要です。すべてのサーバーを一度にアップグレードしないでください。テスト環境、またはクラスターの一部のサーバーで新しいバージョンのClickHouseをテストする方が安全です。

この設定で既に保存されているデータパートヘッダーは、以前の(非コンパクトな)表現に復元することはできません。
:::


## distributed_ddl {#distributed_ddl}

クラスタ上での[分散DDLクエリ](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）の実行を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper)が有効な場合のみ動作します。

`<distributed_ddl>`内で設定可能な項目は以下の通りです：

| 設定項目                | 説明                                                                                                                       | デフォルト値                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `path`                 | DDLクエリ用の`task_queue`のKeeper内パス                                                                           |                                        |
| `profile`              | DDLクエリの実行に使用するプロファイル                                                                                       |                                        |
| `pool_size`            | 同時に実行可能な`ON CLUSTER`クエリの数                                                                           |                                        |
| `max_tasks_in_queue`   | キューに格納可能なタスクの最大数                                                                             | `1,000`                                |
| `task_max_lifetime`    | この値を超える経過時間のノードを削除                                                                                | `7 * 24 * 60 * 60`（1週間を秒で表した値） |
| `cleanup_delay_period` | 新しいノードイベント受信後、前回のクリーニングから`cleanup_delay_period`秒以上経過している場合にクリーニングを開始 | `60`秒                           |

**例**

```xml
<distributed_ddl>
    <!-- ZooKeeper内のDDLクエリキューへのパス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- このプロファイルの設定をDDLクエリの実行に使用 -->
    <profile>default</profile>

    <!-- 同時に実行可能なON CLUSTERクエリの数を制御 -->
    <pool_size>1</pool_size>

    <!--
         クリーニング設定（アクティブなタスクは削除されません）
    -->

    <!-- タスクのTTLを制御（デフォルトは1週間） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- クリーニングの実行頻度を制御（秒単位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- キューに格納可能なタスク数を制御 -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```


## access_control_path {#access_control_path}

SQLコマンドで作成されたユーザーおよびロール設定をClickHouseサーバーが保存するフォルダへのパス。

**関連項目**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)


## allow_plaintext_password {#allow_plaintext_password}

平文パスワードタイプ（安全ではない）を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_no_password {#allow_no_password}

安全でないパスワードタイプ `no_password` を許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```


## allow_implicit_no_password {#allow_implicit_no_password}

`IDENTIFIED WITH no_password`が明示的に指定されていない場合、パスワードなしでのユーザー作成を禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## default_session_timeout {#default_session_timeout}

デフォルトのセッションタイムアウト（秒単位）。

```xml
<default_session_timeout>60</default_session_timeout>
```


## default_password_type {#default_password_type}

`CREATE USER u IDENTIFIED BY 'p'` のようなクエリで自動的に設定されるパスワードタイプを設定します。

使用可能な値:

- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## user_directories {#user_directories}

以下の設定を含む設定ファイルのセクション:

- 事前定義されたユーザーを含む設定ファイルへのパス。
- SQLコマンドで作成されたユーザーが保存されるフォルダへのパス。
- SQLコマンドで作成され、レプリケートされるユーザーが保存されるZooKeeperノードパス。

このセクションが指定されている場合、[users_config](/operations/server-configuration-parameters/settings#users_config)および[access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path)のパスは使用されません。

`user_directories`セクションには任意の数の項目を含めることができ、項目の順序はその優先順位を意味します(上位の項目ほど優先順位が高くなります)。

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

ユーザー、ロール、行ポリシー、クォータ、およびプロファイルはZooKeeperに保存することもできます:

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

また、`memory`セクション(情報をメモリのみに保存し、ディスクに書き込まない)および`ldap`セクション(情報をLDAPサーバーに保存する)を定義することもできます。

ローカルで定義されていないユーザーのリモートユーザーディレクトリとしてLDAPサーバーを追加するには、以下の設定で単一の`ldap`セクションを定義します:

| 設定  | 説明                                                                                                                                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `server` | `ldap_servers`設定セクションで定義されたLDAPサーバー名の1つ。このパラメータは必須であり、空にすることはできません。                                                                                                                                                                                                                                                            |
| `roles`  | LDAPサーバーから取得された各ユーザーに割り当てられる、ローカルで定義されたロールのリストを含むセクション。ロールが指定されていない場合、ユーザーは認証後に何も操作を実行できません。認証時にリストされたロールのいずれかがローカルで定義されていない場合、提供されたパスワードが正しくなかったかのように認証の試行は失敗します。 |

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

追加するカスタムトップレベルドメインのリストを定義します。各エントリは `<name>/path/to/file</name>` の形式で指定します。

例:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

関連項目:

- 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) およびそのバリエーション。
  カスタムTLDリスト名を受け取り、最初の有意なサブドメインまでのトップレベルサブドメインを含むドメイン部分を返します。


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

以下のタブで親フィールドを選択して、その子要素を表示します:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド | 説明                                    |
| --------- | --------------------------------------- |
| `<http>`  | 1つ以上のHTTPプロキシのリスト            |
| `<https>` | 1つ以上のHTTPSプロキシのリスト           |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド | 説明                 |
| --------- | -------------------- |
| `<uri>`   | プロキシのURI        |

  </TabItem>
</Tabs>

**リモートプロキシリゾルバー**

プロキシサーバーが動的に変更される可能性があります。その場合、リゾルバーのエンドポイントを定義できます。ClickHouseはそのエンドポイントに空のGETリクエストを送信し、リモートリゾルバーはプロキシホストを返す必要があります。ClickHouseはこれを使用して、次のテンプレートでプロキシURIを形成します: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

以下のタブで親フィールドを選択して、その子要素を表示します:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド | 説明                              |
| --------- | --------------------------------- |
| `<http>`  | 1つ以上のリゾルバーのリスト\*     |
| `<https>` | 1つ以上のリゾルバーのリスト\*     |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド   | 説明                                          |
| ------------ | --------------------------------------------- |
| `<resolver>` | リゾルバーのエンドポイントおよびその他の詳細  |

:::note
複数の`<resolver>`要素を持つことができますが、特定のプロトコルに対して最初の`<resolver>`のみが使用されます。そのプロトコルに対する他の`<resolver>`要素は無視されます。つまり、負荷分散(必要な場合)はリモートリゾルバーによって実装される必要があります。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| フィールド           | 説明                                                                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<endpoint>`         | プロキシリゾルバーのURI                                                                                                                                                                |
| `<proxy_scheme>`     | 最終的なプロキシURIのプロトコル。`http`または`https`のいずれかを指定できます。                                                                                                         |
| `<proxy_port>`       | プロキシリゾルバーのポート番号                                                                                                                                                         |
| `<proxy_cache_time>` | リゾルバーからの値をClickHouseがキャッシュする時間(秒単位)。この値を`0`に設定すると、ClickHouseはHTTPまたはHTTPSリクエストごとにリゾルバーに接続します。                              |

  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決定されます:


| 優先順 | 設定                     |
|--------|--------------------------|
| 1.     | リモートプロキシリゾルバ |
| 2.     | プロキシリスト           |
| 3.     | 環境変数リゾルバ         |

ClickHouse は、リクエストプロトコルに対して最も優先度の高い種類のリゾルバを確認します。定義されていない場合は、
環境変数リゾルバに到達するまで、次に優先度の高い種類のリゾルバを順に確認していきます。
これにより、異なる種類のリゾルバを組み合わせて使用することもできます。



## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

デフォルトでは、`HTTP`プロキシ経由で`HTTPS`リクエストを行う際にトンネリング(すなわち`HTTP CONNECT`)が使用されます。この設定を使用してトンネリングを無効化できます。

**no_proxy**

デフォルトでは、すべてのリクエストがプロキシを経由します。特定のホストに対してプロキシを無効化するには、`no_proxy`変数を設定する必要があります。
この変数は、リストリゾルバおよびリモートリゾルバの場合は`<proxy>`句内に設定でき、環境リゾルバの場合は環境変数として設定できます。
IPアドレス、ドメイン、サブドメイン、および完全バイパス用の`'*'`ワイルドカードをサポートしています。先頭のドットはcurlと同様に削除されます。

**例**

以下の設定は、`clickhouse.cloud`およびそのすべてのサブドメイン(例:`auth.clickhouse.cloud`)へのプロキシリクエストをバイパスします。
GitLabについても、先頭にドットがあるにもかかわらず同様に適用されます。`gitlab.com`と`about.gitlab.com`の両方がプロキシをバイパスします。

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

すべての`CREATE WORKLOAD`および`CREATE RESOURCE`クエリのストレージとして使用されるZooKeeperノードへのパスです。一貫性を保つため、すべてのSQL定義はこの単一のznodeの値として保存されます。デフォルトではZooKeeperは使用されず、定義は[ディスク](#workload_path)に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**関連項目**

- [ワークロード階層](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)


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
