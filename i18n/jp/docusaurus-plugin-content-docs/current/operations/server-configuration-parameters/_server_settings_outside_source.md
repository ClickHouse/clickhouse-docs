## asynchronous&#95;metric&#95;log {#asynchronous_metric_log}

ClickHouse Cloud のデプロイメントでは、デフォルトで有効になっています。

この設定がデフォルトで有効になっていない環境では、ClickHouse のインストール方法に応じて、以下の手順で有効化または無効化できます。

**有効化**

非同期メトリクスログ履歴の収集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md) を手動で有効にするには、以下の内容で `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します。

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

`asynchronous_metric_log` 設定を無効化するには、次の内容でファイル `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` を作成します。

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />

## auth_use_forwarded_address {#auth_use_forwarded_address}

プロキシ経由で接続しているクライアントに対して、認証に発信元アドレスを使用します。

:::note
この設定は、転送されたアドレスが容易になりすまし可能であるため、細心の注意を払って使用する必要があります。このような認証を受け付けるサーバーには、信頼できるプロキシ経由のみでアクセスし、直接アクセスしないようにしてください。
:::

## backups {#backups}

[`BACKUP` および `RESTORE`](../backup.md) ステートメントの実行時に使用されるバックアップ関連の設定です。

以下の設定はサブタグを使用して構成できます。

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','同一ホスト上で複数のバックアップ処理を同時に実行できるかどうかを決定します。', 'true'),
    ('allow_concurrent_restores', 'Bool', '同一ホスト上で複数のリストア処理を同時に実行できるかどうかを決定します。', 'true'),
    ('allowed_disk', 'String', '`File()` を使用する際のバックアップ先ディスク。この設定を指定しないと `File` は使用できません。', ''),
    ('allowed_path', 'String', '`File()` を使用する際のバックアップ先パス。この設定を指定しないと `File` は使用できません。', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '収集済みメタデータを比較した結果に不整合があった場合、スリープに入る前にメタデータ収集を試行する回数。', '2'),
    ('collect_metadata_timeout', 'UInt64', 'バックアップ中のメタデータ収集に対するタイムアウト（ミリ秒）。', '600000'),
    ('compare_collected_metadata', 'Bool', 'true の場合、バックアップ中にメタデータが変更されていないことを保証するため、収集したメタデータと既存のメタデータを比較します。', 'true'),
    ('create_table_timeout', 'UInt64', 'リストア中のテーブル作成に対するタイムアウト（ミリ秒）。', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '協調バックアップ／リストア中に bad version エラーが発生した際に、リトライを行う最大試行回数。', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '次回のメタデータ収集を試行する前にスリープする最大時間（ミリ秒）。', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '次回のメタデータ収集を試行する前にスリープする最小時間（ミリ秒）。', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '`BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップへコピー済みのファイルを削除しようとします。それ以外の場合は、コピー済みファイルはそのまま残されます。', 'true'),
    ('sync_period_ms', 'UInt64', '協調バックアップ／リストアにおける同期間隔（ミリ秒）。', '5000'),
    ('test_inject_sleep', 'Bool', 'テスト用のスリープを挿入します。', 'false'),
    ('test_randomize_order', 'Bool', 'true の場合、テスト目的で特定の処理の順序をランダム化します。', 'false'),
    ('zookeeper_path', 'String', '`ON CLUSTER` 句を使用する場合に、バックアップおよびリストア用メタデータを格納する ZooKeeper 上のパス。', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }

| 設定                                                  | 型      | 説明                                                                                                     | デフォルト                 |
| :-------------------------------------------------- | :----- | :----------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 同一ホスト上で複数のバックアップ処理を同時に実行できるかどうかを制御します。                                                                 | `true`                |
| `allow_concurrent_restores`                         | Bool   | 同一ホスト上で複数のリストア処理を同時に実行できるかどうかを制御します。                                                                   | `true`                |
| `allowed_disk`                                      | String | `File()` を使用する際のバックアップ先ディスク。この設定を行わないと `File()` は使用できません。                                              | ``                    |
| `allowed_path`                                      | 文字列    | `File()` を使用する場合のバックアップ先となるパス。`File` を使用するには、この設定を必ず指定する必要があります。                                       | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 収集したメタデータを比較して不整合が検出された場合に、スリープに入る前にメタデータ収集を再試行する回数。                                                   | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | バックアップ時にメタデータを収集するためのタイムアウト（ミリ秒）。                                                                      | `600000`              |
| `compare_collected_metadata`                        | Bool型  | true の場合、バックアップ中に変更されていないことを確認するために、収集したメタデータを既存のメタデータと比較します。                                          | `true`                |
| `create_table_timeout`                              | UInt64 | リストア時のテーブル作成タイムアウト（ミリ秒単位）。                                                                             | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | 協調バックアップ／リストア中に不正バージョンエラーが発生した場合に再試行を行う最大回数。                                                           | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次回のメタデータ収集を試行するまでの最大スリープ時間（ミリ秒）。                                                                       | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 次のメタデータ収集試行までの最小スリープ時間（ミリ秒）。                                                                           | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | `BACKUP` コマンドが失敗した場合、ClickHouse は失敗が発生する前にバックアップにコピーされたファイルを削除しようとします。削除できなかった場合は、コピー済みのファイルはそのまま残ります。 | `true`                |
| `sync_period_ms`                                    | UInt64 | 協調バックアップ／リストア用の同期周期（ミリ秒単位）。                                                                            | `5000`                |
| `test_inject_sleep`                                 | Bool   | テスト用のスリープ                                                                                              | `false`               |
| `test_randomize_order`                              | Bool   | true の場合、テスト目的で一部の操作の実行順序をランダムに入れ替えます。                                                                 | `false`               |
| `zookeeper_path`                                    | 文字列    | `ON CLUSTER` 句を使用する場合に、バックアップおよびリストアのメタデータが保存される ZooKeeper 上のパス。                                       | `/clickhouse/backups` |

この設定はデフォルトで次のように設定されています。

```xml
<backups>
    ....
</backups>
```

## bcrypt&#95;workfactor {#bcrypt_workfactor}

[Bcrypt アルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/) を使用する `bcrypt_password` 認証タイプのワークファクターです。
ワークファクターは、ハッシュを計算してパスワードを検証するのに必要な計算量と時間を決定します。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
認証処理が高頻度で発生するアプリケーションでは、
高いワークファクター設定時の bcrypt の計算コストの高さを考慮し、
別の認証方式の採用を検討してください。
:::

## table_engines_require_grant {#table_engines_require_grant}

true に設定した場合、ユーザーが特定のエンジンを使用してテーブルを作成するには、対応する GRANT が必要になります（例: `GRANT TABLE ENGINE ON TinyLog to user`）。

:::note
デフォルトでは、後方互換性のため、特定のテーブルエンジンを指定してテーブルを作成する際の GRANT 要件は無視されますが、これを true に設定することでこの挙動を変更できます。
:::

## builtin&#95;dictionaries&#95;reload&#95;interval {#builtin_dictionaries_reload_interval}

組み込みディクショナリを再読み込みする間隔（秒）。

ClickHouse は、組み込みディクショナリを x 秒ごとに再読み込みします。これにより、サーバーを再起動せずに、ディクショナリを「オンザフライ」で編集できるようになります。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

## 圧縮 {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンテーブル向けのデータ圧縮設定です。

:::note
ClickHouse を使い始めたばかりの場合は、この設定は変更しないことを推奨します。
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
* `method` – 圧縮方式。使用可能な値: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`。
* `level` – 圧縮レベル。[Codecs](/sql-reference/statements/create/table#general-purpose-codecs) を参照。

:::note
複数の `<case>` セクションを設定できます。
:::

**条件が満たされたときの動作**:

* データパートがある条件セットに一致した場合、ClickHouse は指定された圧縮方式を使用します。
* データパートが複数の条件セットに一致した場合、ClickHouse は最初に一致した条件セットを使用します。

:::note
データパートがいずれの条件も満たさない場合、ClickHouse は `lz4` 圧縮を使用します。
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

[暗号化コーデック](/sql-reference/statements/create/table#encryption-codecs)で使用するキーを取得するためのコマンドを設定します。キー（複数可）は環境変数として指定するか、設定ファイルで設定する必要があります。

キーは、長さが 16 バイトの 16 進数、または文字列で指定できます。

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
キーを設定ファイルに保存することは推奨されません。セキュアではありません。キーをセキュアなディスク上の別の設定ファイルに移動し、その設定ファイルへのシンボリックリンクを `config.d/` フォルダに配置できます。
:::

キーが 16 進数形式の場合に、設定から読み込むには次のようにします：

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

ここで `current_key_id` は暗号化に使用する現在のキーを指定し、指定されたすべてのキーを復号に使用できます。

これらの各方法は、複数のキーに対して適用できます。

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

また、ユーザーはノンスを追加することもでき、その長さは 12 バイトである必要があります（デフォルトでは、暗号化および復号処理にはゼロバイトのみで構成されたノンスが使用されます）:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または 16 進数表記で設定できます:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
上記の内容はすべて `aes_256_gcm_siv` にも適用できます（ただし、キーは 32 バイトである必要があります）。
:::

## error&#95;log {#error_log}

これはデフォルトでは無効です。

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

`error_log` 設定を無効にするには、以下の内容で `/etc/clickhouse-server/config.d/disable_error_log.xml` ファイルを作成します。

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## custom&#95;settings&#95;prefixes {#custom_settings_prefixes}

[カスタム設定](/operations/settings/query-level#custom_settings) に使用するプレフィックスのリスト。プレフィックスはカンマ区切りで指定する必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**関連情報**

* [カスタム設定](/operations/settings/query-level#custom_settings)

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

## default&#95;profile {#default_profile}

デフォルトの設定プロファイルです。設定プロファイルは、`user_config` 設定で指定されたファイル内に定義されます。

**例**

```xml
<default_profile>default</default_profile>
```

## dictionaries&#95;config {#dictionaries_config}

辞書の設定ファイルへのパス。

パス:

* 絶対パス、またはサーバー設定ファイルからの相対パスを指定します。
* パスにはワイルドカード * および ? を含めることができます。

参照:

* 「[Dictionaries](../../sql-reference/dictionaries/index.md)」。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```

## user&#95;defined&#95;executable&#95;functions&#95;config {#user_defined_executable_functions_config}

実行可能なユーザー定義関数用の設定ファイルのパスです。

Path:

* 絶対パス、またはサーバー設定ファイルからの相対パスを指定します。
* パスにはワイルドカードの * と ? を含めることができます。

See also:

* &quot;[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).&quot;

**Example**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```

## format&#95;schema&#95;path {#format_schema_path}

入力データ用のスキーマ（例：[CapnProto](/interfaces/formats/CapnProto) フォーマットのスキーマ）が格納されているディレクトリへのパス。

**例**

```xml
<!-- 各種入力形式のスキーマファイルを格納するディレクトリ。 -->
<format_schema_path>format_schemas/</format_schema_path>
```

## graphite {#graphite}

[Graphite](https://github.com/graphite-project) にデータを送信します。

設定:

* `host` – Graphite サーバー。
* `port` – Graphite サーバー上のポート。
* `interval` – 送信間隔（秒）。
* `timeout` – データ送信のタイムアウト（秒）。
* `root_path` – キーのプレフィックス。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからデータを送信します。
* `events` – [system.events](/operations/system-tables/events) テーブルから、一定期間に蓄積された差分データを送信します。
* `events_cumulative` – [system.events](/operations/system-tables/events) テーブルから累積データを送信します。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルからデータを送信します。

`<graphite>` 句は複数設定できます。たとえば、送信するデータごとに異なる送信間隔を設定できます。

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

Graphite データを間引くための設定です。

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

## google&#95;protos&#95;path {#google_protos_path}

Protobuf 型の proto ファイルを格納したディレクトリを指定します。

例:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```

## http&#95;handlers {#http_handlers}

カスタム HTTP ハンドラーを使用できるようにします。
新しい http ハンドラーを追加するには、新しい `<rule>` を追加するだけです。
ルールは定義された順に上から下へ評価され、
最初に一致したルールのハンドラーが実行されます。

以下の設定はサブタグで指定できます:

| Sub-tags             | Definition                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `url`                | リクエスト URL をマッチさせるために使用します。正規表現によるマッチを行うには、プレフィックス &#39;regex:&#39; を付けてください (オプション)              |
| `methods`            | リクエストメソッドをマッチさせるために使用します。複数メソッドを指定する場合はカンマで区切ります (オプション)                                         |
| `headers`            | リクエストヘッダーをマッチさせます。各子要素 (子要素名がヘッダー名) をマッチさせ、正規表現マッチを行うにはプレフィックス &#39;regex:&#39; を付けてください (オプション) |
| `handler`            | リクエストハンドラー                                                                                       |
| `empty_query_string` | URL にクエリ文字列が存在しないことを確認します                                                                        |

`handler` には以下の設定が含まれており、サブタグで指定できます:

| Sub-tags           | Definition                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `url`              | リダイレクト先の場所                                                                                                                           |
| `type`             | サポートされるタイプ: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                        |
| `status`           | static タイプで使用します。レスポンスステータスコード                                                                                                       |
| `query_param_name` | dynamic&#95;query&#95;handler タイプで使用します。HTTP リクエストパラメータ内で `<query_param_name>` に対応する値を抽出して実行します                                      |
| `query`            | predefined&#95;query&#95;handler タイプで使用します。ハンドラーが呼び出されたときにクエリを実行します                                                                  |
| `content_type`     | static タイプで使用します。レスポンスの content-type                                                                                                 |
| `response_content` | static タイプで使用します。クライアントに送信されるレスポンスコンテンツです。&#39;file://&#39; または &#39;config://&#39; プレフィックスを使用する場合、ファイルまたは設定から取得したコンテンツをクライアントに送信します |

ルールのリストに加えて、すべてのデフォルトハンドラーを有効にする `<defaults/>` を指定できます。

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

## http&#95;server&#95;default&#95;response {#http_server_default_response}

ClickHouse の HTTP(S) サーバーにアクセスしたときに、デフォルトで表示されるページです。
デフォルト値は「Ok.」（末尾に改行文字付き）です。

**例**

`http://localhost:http_port` にアクセスした際に `https://tabix.io/` が開かれます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```

## http&#95;options&#95;response {#http_options_response}

`OPTIONS` HTTP リクエストに対するレスポンスにヘッダーを追加するために使用します。
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

## hsts&#95;max&#95;age {#hsts_max_age}

HSTS の有効期限（秒単位）。

:::note
`0` の場合、ClickHouse は HSTS を無効化します。正の数値を設定すると HSTS が有効になり、`max-age` は指定した数値になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```

## mlock&#95;executable {#mlock_executable}

起動後に `mlockall` を実行して、最初のクエリのレイテンシーを下げ、高い I/O 負荷時に ClickHouse の実行ファイルがページアウトされるのを防ぎます。

:::note
このオプションを有効にすることを推奨しますが、起動時間が数秒程度長くなります。
また、この設定は「CAP&#95;IPC&#95;LOCK」ケーパビリティがないと動作しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```

## include&#95;from {#include_from}

置換設定を含むファイルへのパスです。XML と YAML の両方の形式がサポートされています。

詳細については「[設定ファイル](/operations/configuration-files)」のセクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```

## interserver&#95;listen&#95;host {#interserver_listen_host}

ClickHouse サーバー間でデータを交換できるホストを制限する設定。
Keeper が使用されている場合は、異なる Keeper インスタンス間の通信にも同じ制限が適用されます。

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

## interserver&#95;http&#95;port {#interserver_http_port}

ClickHouse サーバー間のデータ交換に使用するポート。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```

## interserver&#95;http&#95;host {#interserver_http_host}

他のサーバーがこのサーバーにアクセスする際に使用されるホスト名です。

省略した場合は、`hostname -f` コマンドと同様に定義されます。

特定のネットワークインターフェイスに依存しないようにする場合に便利です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```

## interserver&#95;https&#95;port {#interserver_https_port}

`HTTPS` 経由で ClickHouse サーバー間のデータを交換するためのポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```

## interserver&#95;https&#95;host {#interserver_https_host}

[`interserver_http_host`](#interserver_http_host) と同様ですが、このホスト名は他のサーバーが `HTTPS` 経由でこのサーバーにアクセスする際に使用されます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```

## interserver&#95;http&#95;credentials {#interserver_http_credentials}

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)中に他のサーバーへ接続するために使用されるユーザー名とパスワードです。さらに、サーバーはこれらの認証情報を使用して他のレプリカを認証します。
そのため、`interserver_http_credentials` はクラスター内のすべてのレプリカで同一である必要があります。

:::note

* 既定では、`interserver_http_credentials` セクションが省略された場合、レプリケーション時に認証は使用されません。
* `interserver_http_credentials` 設定は ClickHouse クライアント認証情報の[設定](../../interfaces/cli.md#configuration_files)とは関係ありません。
* これらの認証情報は、`HTTP` および `HTTPS` を介したレプリケーションで共通です。
  :::

以下の設定はサブタグで構成できます。

* `user` — ユーザー名。
* `password` — パスワード。
* `allow_empty` — `true` の場合、認証情報が設定されていても、他のレプリカは認証なしで接続することが許可されます。`false` の場合、認証なしの接続は拒否されます。既定値: `false`。
* `old` — 認証情報ローテーション時に使用される、古い `user` と `password` を保持します。複数の `old` セクションを指定できます。

**認証情報のローテーション**

ClickHouse は、すべてのレプリカを同時に停止して設定を更新することなく、interserver 用認証情報の動的なローテーションをサポートします。認証情報は複数の段階に分けて変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、認証情報を追加します。これにより、認証ありおよび認証なしの両方の接続が許可されます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカの設定が完了したら、`allow_empty` を `false` に設定するか、この設定を削除してください。これにより、新しい認証情報での認証が必須になります。

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

新しい認証情報がすべてのレプリカに適用されたら、古い認証情報は削除できます。

## ldap_servers {#ldap_servers}

接続パラメータ付きの LDAP サーバーをここに列挙します。これにより次のことができます:
- `'password'` の代わりに `'ldap'` 認証メカニズムが指定されたローカル専用ユーザーの認証器として使用する。
- リモートユーザーディレクトリとして使用する。

以下の設定はサブタグで構成できます:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP サーバーのホスト名または IP。必須パラメータであり、空にはできません。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP サーバーのポート。`enable_tls` が true の場合のデフォルトは 636、それ以外の場合は `389` です。                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                      | バインドする DN を構成するために使用されるテンプレート。認証試行ごとに、テンプレート内の `\{user_name\}` のすべての部分文字列が実際のユーザー名に置き換えられて、最終的な DN が構成されます。                                                                                                                                                                                                                                               |
| `user_dn_detection`            | バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータを含むセクション。これは主に、サーバーが Active Directory の場合に、後続のロールマッピングのための検索フィルターで使用されます。最終的なユーザー DN は、`\{user_dn\}` が許可されている場所の部分文字列を置き換える際に使用されます。デフォルトでは、ユーザー DN は bind DN と同じに設定されますが、一度検索が実行されると、実際に検出されたユーザー DN の値で更新されます。 |
| `verification_cooldown`        | 正常にバインドされた後に、そのユーザーが LDAP サーバーへ問い合わせることなく、連続するすべてのリクエストに対して認証済みであるとみなされる時間（秒単位）。キャッシュを無効化し、各認証リクエストごとに LDAP サーバーへの問い合わせを強制するには、`0`（デフォルト）を指定します。                                                                                                                  |
| `enable_tls`                   | LDAP サーバーへのセキュア接続を使用するかどうかを制御するフラグ。プレーンテキスト（`ldap://`）プロトコルを使用するには `no` を指定します（非推奨）。SSL/TLS 上の LDAP（`ldaps://`）プロトコルを使用するには `yes` を指定します（推奨、デフォルト）。レガシーな StartTLS プロトコル（プレーンテキストの `ldap://` プロトコルを TLS にアップグレードする方式）を使用するには `starttls` を指定します。                                   |
| `tls_minimum_protocol_version` | SSL/TLS の最小プロトコルバージョン。指定可能な値は: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）です。                                                                                                                                                                                                                                                                                                                    |
| `tls_require_cert`             | SSL/TLS ピア証明書の検証動作。指定可能な値は: `never`, `allow`, `try`, `demand`（デフォルト）です。                                                                                                                                                                                                                                                                                                                                        |
| `tls_cert_file`                | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tls_key_file`                 | 証明書鍵ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_ca_cert_file`             | CA 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_ca_cert_dir`              | CA 証明書を格納しているディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_cipher_suite`             | 許可される暗号スイート（OpenSSL 表記）。                                                                                                                                                                                                                                                                                                                                                                                                  |

`user_dn_detection` 設定はサブタグで構成できます:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP 検索用のベース DN を構成するために使用されるテンプレート。LDAP 検索時に、テンプレート内の `\{user_name\}` および `\{bind_dn\}` のすべての部分文字列が、実際のユーザー名および bind DN に置き換えられて、最終的な DN が構成されます。                                                                                                       |
| `scope`         | LDAP 検索のスコープ。指定可能な値は: `base`, `one_level`, `children`, `subtree`（デフォルト）です。                                                                                                                                                                                                                                           |
| `search_filter` | LDAP 検索用の検索フィルターを構成するために使用されるテンプレート。LDAP 検索時に、テンプレート内の `\{user_name\}`, `\{bind_dn\}`, `\{base_dn\}` のすべての部分文字列が、実際のユーザー名、bind DN、base DN に置き換えられて、最終的なフィルターが構成されます。なお、特殊文字は XML 内で正しくエスケープされている必要があります。  |

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

例（後続のロールマッピング用にユーザー DN 検出を設定した一般的な Active Directory 環境）:

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

## listen&#95;host {#listen_host}

リクエスト元ホストを制限します。サーバーがすべてのホストからのリクエストを受け付けるようにするには、`::` を指定します。

例:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```

## listen&#95;try {#listen_try}

`listen` しようとした際に IPv6 または IPv4 ネットワークが利用できなくても、サーバーは終了しません。

**例**

```xml
<listen_try>0</listen_try>
```

## listen&#95;reuse&#95;port {#listen_reuse_port}

複数のサーバーが同じアドレスとポート番号で待ち受けできるようにします。リクエストはオペレーティングシステムによってランダムなサーバーにルーティングされます。この設定を有効にすることは推奨されていません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

型:

デフォルト:

## listen&#95;backlog {#listen_backlog}

listen ソケットのバックログ（保留中の接続のキューサイズ）。デフォルト値 `4096` は Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)) と同じです。

通常、この値を変更する必要はありません。理由は次のとおりです：

* デフォルト値が十分に大きいこと
* クライアント接続の accept 用にサーバー側で専用スレッドがあること

そのため、`TcpExtListenOverflows`（`nstat` から取得）が 0 以外であり、かつ ClickHouse サーバーでこのカウンターが増加していても、この値を増やす必要があるとは限りません。理由は次のとおりです：

* 通常、`4096` で足りない場合は ClickHouse 内部のスケーリング上の問題を示していることが多いため、Issue を作成して報告した方がよいです。
* だからといって、サーバーが後からより多くの接続を処理できることを意味しません（たとえ処理できたとしても、その時点ではクライアントがすでに離脱または切断している可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```

## logger {#logger}

ログメッセージの出力先とフォーマットを設定します。

**キー**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | ログレベル。指定可能な値: `none` (ログ出力を無効化)、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                      |
| `log`                  | ログファイルのパス。                                                                                                                                               |
| `errorlog`             | エラーログファイルのパス。                                                                                                                                         |
| `size`                 | ローテーションポリシー: ログファイルの最大サイズ (バイト数)。ログファイルがこの閾値を超えると、名前が変更されてアーカイブされ、新しいログファイルが作成されます。     |
| `count`                | ローテーションポリシー: 過去のログファイルを最大いくつまで ClickHouse に保持するかを指定します。                                                                   |
| `stream_compress`      | LZ4 を使用してログメッセージを圧縮します。有効化するには `1` または `true` を設定します。                                                                          |
| `console`              | コンソールへのログ出力を有効にします。有効化するには `1` または `true` を設定します。ClickHouse がデーモンモードで動作していない場合のデフォルトは `1`、それ以外は `0` です。 |
| `console_log_level`    | コンソール出力用のログレベル。デフォルトは `level` と同じです。                                                                                                    |
| `formatting.type`      | コンソール出力のログフォーマット。現在は `json` のみサポートされています。                                                                                        |
| `use_syslog`           | syslog にもログ出力を転送します。                                                                                                                                  |
| `syslog_level`         | syslog へのログ出力に使用するログレベル。                                                                                                                          |
| `async`                | `true` (デフォルト) の場合、ログは非同期に出力されます (出力チャネルごとに 1 つのバックグラウンドスレッド)。それ以外の場合は、`LOG` を呼び出したスレッド内で出力されます。 |
| `async_queue_max_size` | 非同期ログを使用する場合に、フラッシュ待ちのメッセージをキューに保持しておける最大数。超過したメッセージは破棄されます。                                          |
| `startup_level`        | サーバー起動時にルートロガーのレベルを設定するための起動時レベル。起動後は、ログレベルは `level` 設定の値に戻されます。                                             |
| `shutdown_level`       | サーバー停止時にルートロガーのレベルを設定するための停止時レベル。                                                                                                 |

**ログフォーマット指定子**

`log` および `errorLog` パスに含まれるファイル名部分では、以下のフォーマット指定子を使用して生成されるファイル名を制御できます (ディレクトリ部分では使用できません)。

「Example」列では、`2023-07-06 18:32:07` のときの出力例を示しています。

| 指定子  | 概要                                                                                                                      | 例                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%` | リテラルの % 記号                                                                                                              | `%`                        |
| `%n` | 改行文字                                                                                                                    |                            |
| `%t` | 水平タブ文字                                                                                                                  |                            |
| `%Y` | 10進数で表した年（例: 2017）                                                                                                      | `2023`                     |
| `%y` | 年を10進数で表した場合の下2桁（範囲 [00,99]）                                                                                            | `23`                       |
| `%C` | 年の上2桁を10進数で表した数値（範囲 [00,99]）                                                                                            | `20`                       |
| `%G` | 4桁の [ISO 8601 週を基準とする年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、つまり指定された週を含む年。通常は `%V` と組み合わせて使用する場合にのみ有効です。 | `2023`                     |
| `%g` | [ISO 8601 週単位暦年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)の末尾2桁。すなわち、指定された週を含む年。                               | `23`                       |
| `%b` | 省略形の月名。例: Oct（ロケールに依存）                                                                                                  | `Jul`                      |
| `%h` | 「%b」の同義語                                                                                                                | `Jul`                      |
| `%B` | 月名をフル表記。例: October（ロケールに依存）                                                                                             | `7月`                       |
| `%m` | 月を表す10進数（範囲 [01,12]）                                                                                                    | `07`                       |
| `%U` | 年内の週番号（10 進数。週の最初の曜日は日曜日）（範囲 [00,53]）                                                                                   | `27`                       |
| `%W` | 年内の週番号を 10 進数で表す（週の開始曜日は月曜日）（範囲 [00,53]）                                                                                | `27`                       |
| `%V` | ISO 8601 の週番号（範囲 [01,53]）                                                                                               | `27`                       |
| `%j` | 年内通算日を10進数で表したもの（範囲 [001,366]）                                                                                          | `187`                      |
| `%d` | 月の日付をゼロ埋めした10進数で表します（範囲 [01,31]）。1桁の場合は先頭にゼロを付けます。                                                                      | `06`                       |
| `%e` | 月の日を、先頭をスペースで桁埋めした 10 進数で表します（範囲 [1,31]）。1 桁の場合は先頭にスペースが入ります。                                                           | `&nbsp; 6`                 |
| `%a` | 曜日名の省略形。例: Fri（ロケールに依存）                                                                                                 | `木`                        |
| `%A` | 曜日の完全な名称。例: Friday（ロケールに依存）                                                                                             | `木曜日`                      |
| `%w` | 日曜日を0とする整数値で表した曜日（範囲 [0-6]）                                                                                             | `4`                        |
| `%u` | 曜日を表す10進数で、月曜日を1とする（ISO 8601 形式）（範囲 [1-7]）                                                                              | `4`                        |
| `%H` | 時を表す10進数、24時間制（範囲 [00-23]）                                                                                              | `18`                       |
| `%I` | 時を 10 進数で表した値（12 時間制、範囲 [01,12]）                                                                                        | `06`                       |
| `%M` | 分を表す 10 進数（範囲 [00,59]）                                                                                                  | `32`                       |
| `%S` | 秒を表す 10 進数（範囲 [00,60]）                                                                                                  | `07`                       |
| `%c` | 標準的な日付と時刻の文字列表現。例: Sun Oct 17 04:41:13 2010（ロケールに依存）                                                                    | `Thu Jul  6 18:32:07 2023` |
| `%x` | ロケールに応じた日付表記（ロケール依存）                                                                                                    | `07/06/23`                 |
| `%X` | ロケールに応じた時刻表現。例: 18:40:20 または 6:40:20 PM（ロケールに依存）                                                                        | `18:32:07`                 |
| `%D` | 短い MM/DD/YY 形式の日付（%m/%d/%y と同等）                                                                                         | `07/06/23`                 |
| `%F` | 短い YYYY-MM-DD 形式の日付。%Y-%m-%d に相当                                                                                        | `2023-07-06`               |
| `%r` | ロケールに応じた12時間制の時刻表記                                                                                                      | `06:32:07 PM`              |
| `%R` | 「%H:%M」と同じ                                                                                                              | `18:32`                    |
| `%T` | &quot;%H:%M:%S&quot;（ISO 8601 の時刻形式）と同等                                                                                 | `18:32:07`                 |
| `%p` | ローカライズされた午前／午後の表記（ロケールに依存）                                                                                              | `PM`                       |
| `%z` | ISO 8601 形式の UTC からのオフセット（例: -0430）、またはタイムゾーン情報が利用できない場合は空文字列                                                           | `+0800`                    |
| `%Z` | ロケールに依存したタイムゾーン名またはその略称。タイムゾーン情報が利用できない場合は空文字列                                                                          | `Z AWST `                  |

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

ログメッセージのみをコンソールに出力するには：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

特定のログ名ごとにログレベルを上書きできます。例えば、ロガー「Backup」と「RBAC」のすべてのメッセージを出力しないようにする場合です。

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

ログメッセージを syslog にも書き込むには、次のようにします。

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

`&lt;syslog&gt;` のキー:

| Key        | Description                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | `host\[:port\]` 形式で指定する syslog のアドレス。省略した場合はローカルデーモンが使用されます。                                                                                                                                                   |
| `hostname` | ログが送信されるホスト名（任意）。                                                                                                                                                                                              |
| `facility` | syslog の[facility キーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。必ず大文字で `"LOG_"` 接頭辞を付けて指定します（例: `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` など）。デフォルト: `address` が指定されている場合は `LOG_USER`、それ以外は `LOG_DAEMON`。 |
| `format`   | ログメッセージの形式。指定可能な値: `bsd` および `syslog`。                                                                                                                                                                         |

**Log formats**

コンソールログに出力されるログ形式を指定できます。現在は JSON のみがサポートされています。

**Example**

出力される JSON ログの例を次に示します：

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

JSON ログ出力を有効にするには、以下のスニペットを使用します。

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- チャネル単位（log、errorlog、console、syslog）で設定するか、全チャネルに対してグローバルに設定可能（グローバル設定の場合は省略）。 -->
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

ログプロパティは、そのプロパティをコメントアウトすることで省略できます。たとえば、ログに `query_id` を出力したくない場合は、`<query_id>` タグをコメントアウトします。

## send&#95;crash&#95;reports {#send_crash_reports}

ClickHouse コア開発チームへクラッシュレポートを送信するための設定です。

特に本番前の環境では有効化していただけると非常に助かります。

Keys:

| Key                   | Description                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| `enabled`             | 機能を有効にするためのブールフラグ。デフォルトは `true`。クラッシュレポート送信を行いたくない場合は `false` に設定します。                          |
| `send_logical_errors` | `LOGICAL_ERROR` は `assert` のようなもので、ClickHouse のバグです。このブールフラグは、これらの例外の送信を有効にします（デフォルト: `true`）。 |
| `endpoint`            | クラッシュレポートの送信先エンドポイント URL を上書きできます。                                                             |

**推奨される使用方法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## ssh&#95;server {#ssh_server}

ホスト鍵の公開鍵部分は、最初に接続した際に SSH クライアント側の known&#95;hosts ファイルに書き込まれます。

Host Key Configurations はデフォルトでは無効です。
Host Key Configurations のコメントアウトを解除し、それぞれに対応する ssh 鍵へのパスを指定して有効にします:

例:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## tcp&#95;ssh&#95;port {#tcp_ssh_port}

ユーザーが組み込みクライアントを使用して PTY 経由で接続し、対話的にクエリを実行できるようにする SSH サーバーのポートです。

例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```

## storage&#95;configuration {#storage_configuration}

ストレージの複数ディスク構成を行うための設定です。

ストレージ構成は次のような構造になります。

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

### ディスクの構成 {#configuration-of-disks}

`disks` の構成は、以下に示す構造に従います。

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

上記のサブタグでは、`disks` に対して次の設定を行います:

| Setting                 | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `<disk_name_N>`         | 一意である必要があるディスク名。                                              |
| `path`                  | サーバーデータ（`data` および `shadow` カタログ）が保存されるパス。末尾は `/` である必要があります。 |
| `keep_free_space_bytes` | ディスク上で予約される空き容量のサイズ。                                          |

:::note
ディスクの順序は関係ありません。
:::

### ポリシーの設定 {#configuration-of-policies}

上記のサブタグでは、`policies` に対して次の設定を行います:

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシー名。ポリシー名は一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | ボリューム名。ボリューム名は一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `disk`                       | ボリューム内にあるディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `max_data_part_size_bytes`   | このボリューム内の任意のディスク上に存在できるデータパーツの最大サイズ。マージの結果として生成されるパーツサイズが `max_data_part_size_bytes` より大きくなると予想される場合、そのパーツは次のボリュームに書き込まれます。基本的に、この機能により、新規 / 小さいパーツをホット（SSD）ボリュームに保存し、サイズが大きくなった時点でコールド（HDD）ボリュームに移動できます。ポリシーにボリュームが 1 つしかない場合は、このオプションを使用しないでください。                                                                 |
| `move_factor`                | ボリューム上の利用可能な空き容量の割合。この値を下回ると、（存在する場合は）データの転送が次のボリュームに開始されます。転送では、パーツはサイズの大きいものから小さいもの（降順）にソートされ、合計サイズが `move_factor` 条件を満たすのに十分なパーツが選択されます。すべてのパーツの合計サイズでも条件を満たせない場合は、すべてのパーツが移動されます。                                                                                                             |
| `perform_ttl_move_on_insert` | 挿入時の TTL 期限切れデータの移動を無効にします。デフォルト（有効な場合）では、TTL に基づく移動ルールに従ってすでに期限切れとなっているデータを挿入すると、そのデータは直ちに移動ルールで指定されたボリューム / ディスクに移動されます。ターゲットのボリューム / ディスクが遅い場合（例: S3）、これにより挿入が大幅に遅くなる可能性があります。無効にした場合、期限切れ部分のデータはまずデフォルトボリュームに書き込まれ、その後直ちに、期限切れ TTL 用のルールで指定されたボリュームに移動されます。 |
| `load_balancing`             | ディスクのバランシングポリシー。`round_robin` または `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `least_used_ttl_ms`          | すべてのディスク上の利用可能な空き容量を更新するためのタイムアウト（ミリ秒）を設定します（`0` - 常に更新、`-1` - 一切更新しない、デフォルト値は `60000`）。ディスクが ClickHouse のみによって使用され、ファイルシステムのオンラインでのリサイズが発生しない場合は、`-1` の値を使用できます。それ以外のすべての場合、この設定は推奨されません。最終的に不正確な空き容量の割り当てにつながるためです。                                                                                                                   |
| `prefer_not_to_merge`        | このボリューム上でのデータパーツのマージを無効にします。注意: これは潜在的に有害であり、パフォーマンス低下を引き起こす可能性があります。この設定が有効な場合（有効にしないでください）、このボリューム上でのデータマージは禁止されます（これは望ましくありません）。この設定により、ClickHouse が低速なディスクとどのようにやり取りするかを制御できますが、基本的には使用しないことを推奨します。                                                                                                                                                                                       |
| `volume_priority`            | ボリュームを埋めていく際の優先度（順序）を定義します。値が小さいほど優先度が高くなります。パラメーター値は自然数でなければならず、1 から N（N は指定されたパラメーター値の最大値）までの範囲を欠番なく網羅する必要があります。                                                                                                                                                                                                                                                                |

`volume_priority` について:
- すべてのボリュームにこのパラメーターが設定されている場合、指定された順序で優先されます。
- _一部の_ ボリュームのみに設定されている場合、設定されていないボリュームは最も低い優先度になります。設定されているボリュームはパラメーター値に基づいて優先され、残りについては設定ファイル内での記述順によって互いの優先度が決まります。
- _どの_ ボリュームにもこのパラメーターが設定されていない場合、その順序は設定ファイル内での記述順によって決まります。
- ボリュームの優先度は同一である必要はありません。

## マクロ {#macros}

レプリケーテッドテーブル向けのパラメータ置換です。

レプリケーテッドテーブルを使用しない場合は省略できます。

詳細については、[レプリケーテッドテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)のセクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```

## replica&#95;group&#95;name {#replica_group_name}

Replicated データベースのレプリカグループ名。

Replicated データベースで作成されるクラスタは、同一グループ内のレプリカで構成されます。
DDL クエリは同一グループ内のレプリカに対してのみ待機します。

既定値は空です。

**例**

```xml
<replica_group_name>バックアップ</replica_group_name>
```

## remap&#95;executable {#remap_executable}

ヒュージページを使用して、マシンコード（「text」）用のメモリを再割り当てするための設定です。

:::note
この機能は非常に実験的な機能です。
:::

例:

```xml
<remap_executable>false</remap_executable>
```

## max&#95;open&#95;files {#max_open_files}

同時に開くことができるファイルの最大数です。

:::note
`getrlimit()` 関数が誤った値を返すため、macOS ではこのオプションの使用を推奨します。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```

## max&#95;session&#95;timeout {#max_session_timeout}

セッションの最大タイムアウト時間（秒）。

例：

```xml
<max_session_timeout>3600</max_session_timeout>
```

## merge&#95;tree {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブル向けの微調整。

詳細については、`MergeTreeSettings.h` ヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## metric&#95;log {#metric_log}

デフォルトでは無効になっています。

**有効化**

メトリクス履歴の収集を手動で有効化するには、次の内容で `/etc/clickhouse-server/config.d/metric_log.xml` を作成します：[`system.metric_log`](../../operations/system-tables/metric_log.md)。

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

`metric_log` 設定を無効にするには、以下の内容でファイル `/etc/clickhouse-server/config.d/disable_metric_log.xml` を作成する必要があります。

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## replicated&#95;merge&#95;tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブル向けの微調整用設定です。この設定はより高い優先度を持ちます。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```

## opentelemetry&#95;span&#95;log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) システムテーブルの設定。

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

## openSSL {#openSSL}

SSL クライアント／サーバーの設定。

SSL のサポートは `libpoco` ライブラリによって提供されます。利用可能な設定オプションについては、[SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) を参照してください。デフォルト値は [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) で確認できます。

サーバー／クライアント設定用のキー:

| オプション                         | 説明                                                                                                                                                                                                                                                                                                                              | デフォルト値                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 証明書の秘密鍵を含むファイルへのパスです。ファイルには鍵と証明書の両方を含めることができます。                                                                                                                                                                                                                                                                             |                                                                                            |
| `certificateFile`             | PEM 形式のクライアント／サーバー証明書ファイルへのパス。`privateKeyFile` に証明書が含まれている場合は省略可能です。                                                                                                                                                                                                                                                            |                                                                                            |
| `caConfig`                    | 信頼された CA 証明書を含むファイルまたはディレクトリへのパス。ファイルを指す場合、そのファイルは PEM 形式であり、複数の CA 証明書を含めることができます。ディレクトリを指す場合、そのディレクトリには CA 証明書ごとに 1 つの .pem ファイルが必要です。ファイル名は CA のサブジェクト名ハッシュ値に基づいて検索されます。詳細は [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) の man ページを参照してください。 |                                                                                            |
| `verificationMode`            | ノードの証明書を検証する方法を指定します。詳細は [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明を参照してください。指定可能な値は `none`, `relaxed`, `strict`, `once` です。                                                                                                                             | `relaxed`                                                                                  |
| `verificationDepth`           | 検証チェーンの最大長。証明書チェーンの長さが設定値を超えると、検証は失敗します。                                                                                                                                                                                                                                                                                        | `9`                                                                                        |
| `loadDefaultCAFile`           | OpenSSL の組み込み CA 証明書を使用するかどうかを指定します。ClickHouse は、組み込み CA 証明書がファイル `/etc/ssl/cert.pem`（またはディレクトリ `/etc/ssl/certs`）にあるか、環境変数 `SSL_CERT_FILE`（または `SSL_CERT_DIR`）で指定されたファイル（またはディレクトリ）にあると想定します。                                                                                                                                   | `true`                                                                                     |
| `cipherList`                  | サポートされている OpenSSL の暗号方式。                                                                                                                                                                                                                                                                                                        | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | セッションのキャッシュを有効または無効にします。`sessionIdContext` と組み合わせて使用する必要があります。設定可能な値: `true`、`false`。                                                                                                                                                                                                                                           | `false`                                                                                    |
| `sessionIdContext`            | サーバーが生成する各識別子に付加される、一意のランダム文字列です。文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはなりません。サーバー側でセッションをキャッシュする場合にも、クライアントがキャッシュを要求した場合にも問題の発生を防ぐのに役立つため、このパラメータは常に指定することを推奨します。                                                                                                                                                        | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | サーバーがキャッシュするセッションの最大数。値を `0` にすると、セッション数が無制限であることを意味します。                                                                                                                                                                                                                                                                        | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | サーバー側でセッションをキャッシュしておく時間（単位：時間）。                                                                                                                                                                                                                                                                                                 | `2`                                                                                        |
| `extendedVerification`        | 有効にすると、証明書の CN または SAN がピアのホスト名と一致するか検証します。                                                                                                                                                                                                                                                                                     | `false`                                                                                    |
| `requireTLSv1`                | TLSv1 接続を必須とします。有効な値: `true`、`false`。                                                                                                                                                                                                                                                                                           | `false`                                                                                    |
| `requireTLSv1_1`              | TLSv1.1 接続を必須にします。設定可能な値: `true`, `false`。                                                                                                                                                                                                                                                                                      | `false`                                                                                    |
| `requireTLSv1_2`              | TLSv1.2 接続を必須とします。指定可能な値: `true`, `false`。                                                                                                                                                                                                                                                                                      | `false`                                                                                    |
| `fips`                        | OpenSSL の FIPS モードを有効にします。ライブラリで使用している OpenSSL のバージョンが FIPS に対応している場合に有効です。                                                                                                                                                                                                                                                     | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandler のサブクラス）。例：`<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`。                                                                                                             | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するクラス（CertificateHandler のサブクラス）。例：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`。                                                                                                                                                                                   | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 使用禁止のプロトコル。                                                                                                                                                                                                                                                                                                                     |                                                                                            |
| `preferServerCiphers`         | クライアント優先のサーバー側暗号スイート。                                                                                                                                                                                                                                                                                                           | `false`                                                                                    |

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

## part&#95;log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) に関連するイベントを記録するログです。たとえば、データの追加やマージなどです。ログを使用してマージアルゴリズムをシミュレートし、その特性を比較できます。マージ処理を可視化することもできます。

クエリは個別のファイルではなく、[system.part&#95;log](/operations/system-tables/part_log) テーブルに記録されます。このテーブル名は `table` パラメータ（以下参照）で構成できます。

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

データが格納されているディレクトリへのパス。

:::note
末尾のスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
```

## processors&#95;profile&#95;log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) システムテーブルの設定です。

<SystemLogParameters />

既定の設定は次のとおりです。

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

設定項目:

* `endpoint` – Prometheus サーバーがメトリクスをスクレイプするための HTTP エンドポイント。必ず &#39;/&#39; から始めます。
* `port` – `endpoint` のポート。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開します。
* `events` – [system.events](/operations/system-tables/events) テーブルからメトリクスを公開します。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開します。
* `errors` - 最後にサーバーが再起動されてから発生したエラーコードごとのエラー数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。

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

## query&#95;log {#query_log}

[log&#95;queries=1](../../operations/settings/settings.md) 設定が有効な場合に受信したクエリをログに記録するための設定です。

クエリは個別のファイルではなく、[system.query&#95;log](/operations/system-tables/query_log) テーブルに記録されます。テーブル名は `table` パラメータで変更できます（後述）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse はテーブルを作成します。ClickHouse サーバーのアップデートによってクエリログの構造が変更された場合は、古い構造のテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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

## query&#95;metric&#95;log {#query_metric_log}

デフォルトでは無効です。

**有効化**

メトリクス履歴収集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md) を手動で有効にするには、次の内容で `/etc/clickhouse-server/config.d/query_metric_log.xml` を作成します。

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

`query_metric_log` 設定を無効にするには、以下の内容のファイル `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` を作成してください。

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## query&#95;cache {#query_cache}

[クエリキャッシュ](../query-cache.md)の設定です。

利用可能な設定は次のとおりです。

| Setting                   | Description                                  | Default Value |
| ------------------------- | -------------------------------------------- | ------------- |
| `max_size_in_bytes`       | キャッシュの最大サイズ（バイト単位）。`0` の場合、クエリキャッシュは無効になります。 | `1073741824`  |
| `max_entries`             | キャッシュに保存される `SELECT` クエリ結果の最大件数。             | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存できる `SELECT` クエリ結果の最大サイズ（バイト単位）。     | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存できる `SELECT` クエリ結果の最大行数。             | `30000000`    |

:::note

* 設定変更は即座に有効になります。
* クエリキャッシュ用のデータは DRAM に確保されます。メモリに余裕がない場合は、`max_size_in_bytes` を小さな値に設定するか、クエリキャッシュを無効化することを検討してください。
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

## query&#95;thread&#95;log {#query_thread_log}

[log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads) が設定されたクエリのスレッドをログに記録するための設定です。

クエリは個別のファイルではなく、[system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) テーブルに記録されます。`table` パラメータでテーブル名を変更できます（後述）。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse はテーブルを作成します。ClickHouse サーバーの更新時にクエリスレッドログの構造が変更された場合は、古い構造を持つテーブルの名前が変更され、新しいテーブルが自動的に作成されます。

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

[log&#95;query&#95;views=1](/operations/settings/settings#log_query_views) 設定を指定して受信したクエリに応じて、ビュー（live、materialized など）をログに記録するための設定です。

クエリは別ファイルではなく、[system.query&#95;views&#95;log](/operations/system-tables/query_views_log) テーブルに記録されます。テーブル名は（後述の）`table` パラメータで変更できます。

<SystemLogParameters />

テーブルが存在しない場合、ClickHouse が作成します。ClickHouse サーバーの更新時にクエリビューのログ構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

## text&#95;log {#text_log}

テキストメッセージをログに記録するための [text&#95;log](/operations/system-tables/text_log) システムテーブルの設定。

<SystemLogParameters />

追加の設定:

| Setting | Description                            | Default Value |
| ------- | -------------------------------------- | ------------- |
| `level` | テーブルに保存されるメッセージレベルの上限（デフォルトは `Trace`）。 | `Trace`       |

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

## trace&#95;log {#trace_log}

[trace&#95;log](/operations/system-tables/trace_log) システムテーブルの動作設定。

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

## asynchronous&#95;insert&#95;log {#asynchronous_insert_log}

非同期挿入をログとして記録するための [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) システムテーブル用の設定です。

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

## crash&#95;log {#crash_log}

[crash&#95;log](../../operations/system-tables/crash_log.md) システムテーブルの動作に関する設定です。

以下の設定はサブタグで構成できます。

| Setting                            | Description                                                                                                               | Default             | Note                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| `database`                         | データベース名。                                                                                                                  |                     |                                                                                         |
| `table`                            | システムテーブル名。                                                                                                                |                     |                                                                                         |
| `engine`                           | システムテーブル用の [MergeTree エンジン定義](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。 |                     | `partition_by` または `order_by` が定義されている場合には使用できません。指定されていない場合、デフォルトで `MergeTree` が選択されます |
| `partition_by`                     | システムテーブル用の [カスタムパーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                         |                     | システムテーブルに対して `engine` が指定されている場合、`partition_by` パラメータは直接 `engine` の内部で指定する必要があります       |
| `ttl`                              | テーブルの [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) を指定します。                         |                     | システムテーブルに対して `engine` が指定されている場合、`ttl` パラメータは直接 `engine` の内部で指定する必要があります                |
| `order_by`                         | システムテーブル用の [カスタムソートキー](/engines/table-engines/mergetree-family/mergetree#order_by)。`engine` が定義されている場合は使用できません。           |                     | システムテーブルに対して `engine` が指定されている場合、`order_by` パラメータは直接 `engine` の内部で指定する必要があります           |
| `storage_policy`                   | テーブルに使用するストレージポリシー名 (オプション)。                                                                                              |                     | システムテーブルに対して `engine` が指定されている場合、`storage_policy` パラメータは直接 `engine` の内部で指定する必要があります     |
| `settings`                         | MergeTree の動作を制御する [追加パラメータ](/engines/table-engines/mergetree-family/mergetree/#settings) (オプション)。                        |                     | システムテーブルに対して `engine` が指定されている場合、`settings` パラメータは直接 `engine` の内部で指定する必要があります           |
| `flush_interval_milliseconds`      | メモリ上のバッファからテーブルへデータをフラッシュする間隔。                                                                                            | `7500`              |                                                                                         |
| `max_size_rows`                    | ログの行数の最大値。フラッシュされていないログの量が `max_size_rows` に達すると、ログはディスクにダンプされます。                                                         | `1024`              |                                                                                         |
| `reserved_size_rows`               | ログ用に事前確保されるメモリサイズ (行数)。                                                                                                   | `1024`              |                                                                                         |
| `buffer_size_rows_flush_threshold` | 行数に対するしきい値。このしきい値に達すると、バックグラウンドでディスクへのログフラッシュが開始されます。                                                                     | `max_size_rows / 2` |                                                                                         |
| `flush_on_crash`                   | クラッシュ時にログをディスクへダンプするかどうかを設定します。                                                                                           | `false`             |                                                                                         |

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

## custom&#95;cached&#95;disks&#95;base&#95;directory {#custom_cached_disks_base_directory}

この設定は、カスタム（SQL から作成した）キャッシュディスクのキャッシュパスを指定します。
`custom_cached_disks_base_directory` は、カスタムディスクに対しては `filesystem_caches_path`（`filesystem_caches_path.xml` に記載）より高い優先度を持ち、
前者が未設定の場合にのみ後者が使用されます。
ファイルシステムキャッシュの設定パスは、このディレクトリ配下に含まれている必要があり、
そうでない場合はディスクの作成を防ぐために例外がスローされます。

:::note
これは、古いバージョンで作成され、その後サーバーをアップグレードしたディスクには影響しません。
この場合、サーバーが正常に起動できるように、例外はスローされません。
:::

例:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```

## backup&#95;log {#backup_log}

`BACKUP` および `RESTORE` 操作をログに記録するための [backup&#95;log](../../operations/system-tables/backup_log.md) システムテーブル用の設定です。

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

## query&#95;masking&#95;rules {#query_masking_rules}

正規表現に基づくルールです。クエリおよびすべてのログメッセージに対して、サーバーログ
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブルに保存される前と、クライアントに送信されるログの両方に適用されます。これにより、名前、メールアドレス、個人識別子、クレジットカード番号などの機密データが、SQL クエリからログへ漏洩するのを防ぐことができます。

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

| Setting   | Description                         |
| --------- | ----------------------------------- |
| `name`    | ルール名（任意）                            |
| `regexp`  | RE2 互換の正規表現（必須）                     |
| `replace` | 機微なデータを置換する文字列（任意、デフォルトはアスタリスク 6 個） |

マスキングルールは、不正な形式または解析不能なクエリから機微なデータが漏洩するのを防ぐため、クエリ全体に適用されます。

[`system.events`](/operations/system-tables/events) テーブルには `QueryMaskingRulesMatch` というカウンタがあり、クエリマスキングルールがマッチした総回数を表します。

分散クエリの場合は、各サーバーを個別に設定する必要があります。そうしないと、他ノードに渡されるサブクエリはマスクされないまま保存されます。

## remote&#95;servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンおよび `cluster` テーブル関数で使用されるクラスタの設定です。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性の値については、「[設定ファイル](/operations/configuration-files)」のセクションを参照してください。

**関連項目**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [クラスタディスカバリ](../../operations/cluster-discovery.md)
* [Replicatedデータベースエンジン](../../engines/database-engines/replicated.md)

## remote&#95;url&#95;allow&#95;hosts {#remote_url_allow_hosts}

URL 関連のストレージエンジンおよびテーブル関数で使用を許可するホストのリスト。

`\<host\>` XML タグでホストを追加する場合:

* URL 内に記載されているものとまったく同じように指定する必要があります。名前は DNS 解決の前にチェックされます。例: `<host>clickhouse.com</host>`
* URL でポートが明示的に指定されている場合は、host:port の組み合わせとしてチェックされます。例: `<host>clickhouse.com:80</host>`
* ホストがポートなしで指定されている場合、そのホストの任意のポートが許可されます。例: `<host>clickhouse.com</host>` が指定されていると、`clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) などが許可されます。
* ホストが IP アドレスとして指定されている場合は、URL に記載されたとおりにチェックされます。例: `[2a02:6b8:a::a]`。
* リダイレクトが存在し、リダイレクトのサポートが有効になっている場合は、すべてのリダイレクト (`Location` フィールド) がチェックされます。

例:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## timezone {#timezone}

サーバーのタイムゾーンです。

UTC タイムゾーンまたは地理的位置を表す IANA 識別子として指定します（例: Africa/Abidjan）。

タイムゾーンは、DateTime 型のフィールドをテキスト形式（画面への表示やファイル出力）に変換する際の String 型との相互変換や、文字列から DateTime を取得する際に必要です。さらに、時間や日付を扱う関数が入力パラメータとしてタイムゾーンを受け取らない場合には、それらの関数の内部でもこのタイムゾーンが使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連項目**

* [session&#95;timezone](../settings/settings.md#session_timezone)

## tcp&#95;port {#tcp_port}

TCP プロトコルでクライアントと通信するためのポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```

## tcp&#95;port&#95;secure {#tcp_port_secure}

クライアントとの安全な通信に使用する TCP ポートです。[OpenSSL](#openssl) の設定と併用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## mysql&#95;port {#mysql_port}

MySQL プロトコル経由でクライアントと通信するためのポート。

:::note

* 正の整数は待ち受けるポート番号を指定する
* 空の値は、MySQL プロトコル経由でのクライアントとの通信を無効にするために使用される
  :::

**例**

```xml
<mysql_port>9004</mysql_port>
```

## postgresql&#95;port {#postgresql_port}

PostgreSQL プロトコル経由でクライアントと通信するためのポートです。

:::note

* 正の整数は待ち受けるポート番号を指定します
* 空にすると、PostgreSQL プロトコル経由でのクライアントとの通信が無効になります
  :::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```

## mysql_require_secure_transport {#mysql_require_secure_transport}

true に設定した場合、[mysql_port](#mysql_port) 経由のクライアントとの通信にはセキュアな接続が必須になります。`--ssl-mode=none` オプションでの接続は拒否されます。[OpenSSL](#openssl) の設定と併用してください。

## postgresql_require_secure_transport {#postgresql_require_secure_transport}

true に設定すると、[postgresql_port](#postgresql_port) を介したクライアントとのセキュアな通信が必須となります。`sslmode=disable` オプションでの接続は拒否されます。[OpenSSL](#openssl) の設定と併用してください。

## tmp&#95;path {#tmp_path}

大規模なクエリを処理するための一時データを保存する、ローカルファイルシステム上のパスです。

:::note

* 一時データストレージを構成する際に使用できるオプションは、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか一つだけです。
* 末尾のスラッシュは必須です。
  :::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## url&#95;scheme&#95;mappers {#url_scheme_mappers}

短縮またはシンボリックな URL プレフィックスを完全な URL にマッピングするための設定です。

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

## user&#95;files&#95;path {#user_files_path}

ユーザーファイルを格納するディレクトリです。テーブル関数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## user&#95;scripts&#95;path {#user_scripts_path}

ユーザースクリプトファイルを格納するディレクトリです。[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions) で使用されます。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

型:

デフォルト:

## user&#95;defined&#95;path {#user_defined_path}

ユーザー定義ファイルを格納するディレクトリです。SQL のユーザー定義関数で使用されます。詳細は [SQL User Defined Functions](/sql-reference/functions/udf) を参照してください。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## users&#95;config {#users_config}

次の内容を含むファイルへのパス:

* ユーザー設定
* アクセス権
* 設定プロファイル
* クォータ設定

**例**

```xml
<users_config>users.xml</users_config>
```

## access&#95;control&#95;improvements {#access_control_improvements}

アクセス制御システムにおける任意の改善用設定です。

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                           | Default |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | パーミッシブな行ポリシーを持たないユーザーが、`SELECT` クエリを使用して行を読み取れるかどうかを設定します。たとえば、ユーザー A と B がいて、行ポリシーが A に対してのみ定義されている場合、この設定が true であれば、ユーザー B はすべての行を閲覧できます。この設定が false の場合、ユーザー B はどの行も閲覧できません。                                                                                                                                                                                      | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` クエリに `CLUSTER` 権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                          | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>` を実行する際に権限が必要かどうか（権限が不要な場合は任意のユーザーが実行可能かどうか）を設定します。true に設定した場合、このクエリには非 system テーブルと同様に `GRANT SELECT ON system.<table>` が必要です。例外として、いくつかの system テーブル（`tables`、`columns`、`databases`、および `one`、`contributors` のような一部の定数テーブル）は依然として全員がアクセス可能です。また、`SHOW` 権限（例: `SHOW USERS`）が付与されている場合、対応する system テーブル（つまり `system.users`）にはアクセスできます。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` を実行する際に権限が必要かどうか（権限が不要な場合は任意のユーザーが実行可能かどうか）を設定します。true に設定した場合、このクエリには、通常のテーブルと同様に `GRANT SELECT ON information_schema.<table>` が必要です。                                                                                                                                                                                     | `true`  |
| `settings_constraints_replace_previous`         | ある設定に対して設定プロファイル内で定義された制約が、その設定に対する以前の制約（他のプロファイルで定義されたもの）による動作を、新しい制約で設定されていないフィールドも含めて打ち消すかどうかを設定します。また、`changeable_in_readonly` 制約タイプを有効にします。                                                                                                                                                                                                                      | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンを使用してテーブルを作成する際に、権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                          | `false` |
| `role_cache_expiration_time_seconds`            | ロールが最後にアクセスされてから、ロールキャッシュに保持される時間（秒）を設定します。                                                                                                                                                                                                                                                                                                                           | `600`   |

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

## dead&#95;letter&#95;queue {#dead_letter_queue}

&#39;dead&#95;letter&#95;queue&#39; システムテーブルの設定です。

<SystemLogParameters />

既定の設定値は次のとおりです。

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```

## zookeeper {#zookeeper}

ClickHouse が [ZooKeeper](http://zookeeper.apache.org/) クラスターと連携するための設定です。ClickHouse は、レプリケーテッドテーブルを使用する場合に、レプリカのメタデータを保存するために ZooKeeper を使用します。レプリケーテッドテーブルを使用しない場合は、このセクションのパラメーターは省略できます。

次の設定はサブタグで指定できます:

| Setting                                    | Description                                                                                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeper のエンドポイント。複数のエンドポイントを設定できます。例: `<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性は、ZooKeeper クラスターへの接続を試行するときのノードの順序を指定します。 |
| `session_timeout_ms`                       | クライアントセッションの最大タイムアウト (ミリ秒単位)。                                                                                                                                    |
| `operation_timeout_ms`                     | 1 つの操作の最大タイムアウト (ミリ秒単位)。                                                                                                                                         |
| `root` (optional)                          | ClickHouse サーバーが使用する znode 群のルートとして使用される znode。                                                                                                                  |
| `fallback_session_lifetime.min` (optional) | プライマリが利用できない場合に、フォールバックノードへの ZooKeeper セッションの存続期間に対する最小制限 (ロードバランシング)。秒単位で設定します。デフォルト: 3 時間。                                                                     |
| `fallback_session_lifetime.max` (optional) | プライマリが利用できない場合に、フォールバックノードへの ZooKeeper セッションの存続期間に対する最大制限 (ロードバランシング)。秒単位で設定します。デフォルト: 6 時間。                                                                     |
| `identity` (optional)                      | 要求された znode にアクセスするために ZooKeeper によって要求されるユーザーとパスワード。                                                                                                            |
| `use_compression` (optional)               | `true` に設定すると、Keeper プロトコルでの圧縮を有効にします。                                                                                                                           |

また、ZooKeeper ノードの選択アルゴリズムを選択できる `zookeeper_load_balancing` 設定 (オプション) もあります:

| Algorithm Name                  | Description                                                             |
| ------------------------------- | ----------------------------------------------------------------------- |
| `random`                        | ZooKeeper ノードの 1 つをランダムに選択します。                                          |
| `in_order`                      | 最初の ZooKeeper ノードを選択し、それが利用できない場合は 2 番目、その次へと順に選択します。                   |
| `nearest_hostname`              | サーバーのホスト名と最も似ているホスト名を持つ ZooKeeper ノードを選択します。ホスト名は名前プレフィックスで比較されます。      |
| `hostname_levenshtein_distance` | `nearest_hostname` と同様ですが、ホスト名をレーベンシュタイン距離で比較します。                       |
| `first_or_random`               | 最初の ZooKeeper ノードを選択し、それが利用できない場合は残りの ZooKeeper ノードの中からランダムに 1 つを選択します。 |
| `round_robin`                   | 最初の ZooKeeper ノードを選択し、再接続が発生した場合は次のノードを選択します。                           |

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
* [ZooKeeper プログラマー向けガイド](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [ClickHouse と ZooKeeper 間の通信をセキュアにする（オプション）](/operations/ssl-zookeeper)

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeper におけるデータパートヘッダーの保存方式を指定します。この設定は [`MergeTree`](/engines/table-engines/mergetree-family) ファミリーにのみ適用されます。次のいずれかで指定できます。

**`config.xml` ファイルの [merge_tree](#merge_tree) セクションでグローバルに指定**

ClickHouse はサーバー上のすべてのテーブルに対してこの設定を使用します。設定はいつでも変更できます。既存のテーブルも、設定が変更されると動作が変わります。

**テーブルごとに指定**

テーブル作成時に、対応する [エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)を指定します。この設定を持つ既存テーブルの動作は、グローバル設定が変わっても変化しません。

**指定可能な値**

- `0` — 機能を無効にします。
- `1` — 機能を有効にします。

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) の場合、[replicated](../../engines/table-engines/mergetree-family/replication.md) テーブルは、データパートのヘッダーを 1 つの `znode` を用いてコンパクトに保存します。テーブルに多数のカラムが含まれる場合、この保存方式により ZooKeeper に保存されるデータ量を大幅に削減できます。

:::note
`use_minimalistic_part_header_in_zookeeper = 1` を適用した後は、この設定をサポートしないバージョンの ClickHouse サーバーにダウングレードすることはできません。クラスタ内のサーバーで ClickHouse をアップグレードする際は注意してください。すべてのサーバーを一度にアップグレードしないでください。ClickHouse の新バージョンは、テスト環境やクラスタ内の一部のサーバーだけで検証する方が安全です。

この設定で既に保存されたデータパートヘッダーは、以前の（非コンパクトな）表現に戻すことはできません。
:::

## distributed&#95;ddl {#distributed_ddl}

クラスタ上での[分散 DDL クエリ](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）の実行を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) が有効な場合にのみ動作します。

`<distributed_ddl>` 内で設定可能な項目は次のとおりです：

| Setting                | Description                                                                    | Default Value                 |
| ---------------------- | ------------------------------------------------------------------------------ | ----------------------------- |
| `path`                 | DDL クエリ用の `task_queue` に対して Keeper 上で使用するパス                                    |                               |
| `profile`              | DDL クエリの実行に使用するプロファイル                                                          |                               |
| `pool_size`            | 同時に実行可能な `ON CLUSTER` クエリの数                                                    |                               |
| `max_tasks_in_queue`   | キュー内に存在できるタスクの最大数                                                              | `1,000`                       |
| `task_max_lifetime`    | ノードの経過時間がこの値を超えた場合にノードを削除します                                                   | `7 * 24 * 60 * 60`（秒単位で 1 週間） |
| `cleanup_delay_period` | 直近のクリーンアップから `cleanup_delay_period` 秒以上経過している場合に、新しいノードイベントを受信するとクリーンアップを開始します | `60` 秒                        |

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

## access_control_path {#access_control_path}

ClickHouse サーバーが SQL コマンドで作成したユーザーおよびロールの設定ファイルを保存するディレクトリへのパス。

**関連項目**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)

## allow&#95;plaintext&#95;password {#allow_plaintext_password}

平文パスワードタイプ（安全ではない）の使用を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow&#95;no&#95;password {#allow_no_password}

安全ではないパスワード種別 `no&#95;password` を許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```

## allow&#95;implicit&#95;no&#95;password {#allow_implicit_no_password}

明示的に &#39;IDENTIFIED WITH no&#95;password&#39; が指定されていない限り、パスワードなしのユーザーは作成できません。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## default&#95;session&#95;timeout {#default_session_timeout}

セッションのデフォルトのタイムアウト時間（秒）。

```xml
<default_session_timeout>60</default_session_timeout>
```

## default&#95;password&#95;type {#default_password_type}

`CREATE USER u IDENTIFIED BY 'p'` のようなクエリにおいて、自動的に設定されるパスワードの種類を指定します。

指定可能な値は次のとおりです：

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```

## user&#95;directories {#user_directories}

次の設定を含む設定ファイルのセクションです:

* 事前定義されたユーザーを含む設定ファイルへのパス。
* SQL コマンドで作成されたユーザーが保存されるフォルダへのパス。
* SQL コマンドで作成されたユーザーが保存およびレプリケートされる ZooKeeper ノードパス。

このセクションが指定されている場合、[users&#95;config](/operations/server-configuration-parameters/settings#users_config) および [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) のパスは使用されません。

`user_directories` セクションには任意の数の項目を含めることができ、項目の順序は優先順位を表します (上にある項目ほど優先されます)。

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

ユーザー、ロール、行ポリシー、クォータ、プロファイルは ZooKeeperに保存することもできます。

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

`memory` セクションも定義できます。これは情報をディスクに書き込まず、メモリ上にのみ保持することを意味します。また、`ldap` セクションは情報を LDAP サーバー上に保存することを意味します。

ローカルに定義されていないユーザーのリモートユーザーディレクトリとして LDAP サーバーを追加するには、以下の設定を持つ単一の `ldap` セクションを定義します。

| Setting  | Description                                                                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | `ldap_servers` 設定セクションで定義された LDAP サーバー名のいずれか。必須パラメータであり、空にすることはできません。                                                                                                |
| `roles`  | LDAP サーバーから取得された各ユーザーに割り当てられる、ローカルに定義されたロールの一覧を含むセクション。ロールが一切指定されていない場合、ユーザーは認証後も一切の操作を実行できません。認証時点で一覧内のロールのいずれかがローカルに定義されていない場合、その認証試行は指定されたパスワードが誤っている場合と同様に失敗します。 |

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

## top&#95;level&#95;domains&#95;list {#top_level_domains_list}

追加で登録するカスタムトップレベルドメインのリストを定義します。各エントリは `<name>/path/to/file</name>` という形式です。

例えば：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

See also:

* 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) およびそのバリエーション。\
  カスタムの TLD リスト名を受け取り、最初の有意なサブドメインまでのトップレベルサブドメインを含むドメイン部分を返します。

## proxy {#proxy}

HTTP および HTTPS リクエスト向けのプロキシサーバーを定義します。現在、S3 ストレージ、S3 テーブル関数、および URL 関数でサポートされています。

プロキシサーバーを定義する方法は 3 通りあります。

* 環境変数
* プロキシリスト
* リモートプロキシリゾルバー

`no_proxy` を使用することで、特定のホストをプロキシサーバー経由の通信から除外することもできます。

**環境変数**

`http_proxy` および `https_proxy` 環境変数を使用すると、
プロトコルごとにプロキシサーバーを指定できます。システム上で設定されていれば、そのまま問題なく動作します。

特定のプロトコルに対してプロキシサーバーが 1 つだけ存在し、そのプロキシサーバーが変更されない場合には、これが最も簡単な方法です。

**プロキシリスト**

この方法では、プロトコルごとに 1 つ以上の
プロキシサーバーを指定できます。複数のプロキシサーバーが定義されている場合、
ClickHouse は異なるプロキシをラウンドロビン方式で使用し、サーバー間で
負荷を分散します。特定のプロトコルに複数のプロキシサーバーがあり、プロキシサーバーのリストが変わらない場合には、これが最も簡単な方法です。

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

以下のタブで親フィールドを選択して、その子要素を確認してください:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | フィールド     | 説明                    |
    | --------- | --------------------- |
    | `<http>`  | 1 つ以上の HTTP プロキシのリスト  |
    | `<https>` | 1 つ以上の HTTPS プロキシのリスト |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | フィールド   | 説明        |
    | ------- | --------- |
    | `<uri>` | プロキシの URI |
  </TabItem>
</Tabs>

**リモートプロキシリゾルバー**

プロキシサーバーが動的に変更される場合があります。
その場合は、リゾルバーのエンドポイントを定義できます。ClickHouse は
そのエンドポイントに対して空の GET リクエストを送信し、リモートリゾルバーはプロキシホストを返す必要があります。
ClickHouse はそれを使用し、次のテンプレートでプロキシ URI を構成します: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

下のタブから親フィールドを選択すると、その子要素が表示されます:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description              |
    | --------- | ------------------------ |
    | `<http>`  | 1 つ以上の resolver からなるリスト* |
    | `<https>` | 1 つ以上の resolver からなるリスト* |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Field        | Description                |
    | ------------ | -------------------------- |
    | `<resolver>` | resolver のエンドポイントとその他の詳細情報 |

    :::note
    複数の `<resolver>` 要素を指定できますが、特定のプロトコルに対して使用されるのは
    最初の `<resolver>` のみです。そのプロトコルに対するその他の `<resolver>`
    要素は無視されます。つまり、ロードバランシングが必要な場合は、
    リモート側の resolver で実装する必要があります。
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | Field                | Description                                                                                                            |
    | -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | プロキシ resolver の URI                                                                                                    |
    | `<proxy_scheme>`     | 最終的なプロキシ URI のプロトコル。`http` または `https` のいずれかを指定できます。                                                                   |
    | `<proxy_port>`       | プロキシ resolver のポート番号                                                                                                   |
    | `<proxy_cache_time>` | resolver から取得した値を ClickHouse がキャッシュする秒数。この値を `0` に設定すると、ClickHouse はすべての HTTP または HTTPS リクエストごとに resolver に問い合わせを行います。 |
  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決定されます。

| 順序 | 設定                     |
|------|--------------------------|
| 1.   | リモートプロキシリゾルバ |
| 2.   | プロキシリスト           |
| 3.   | 環境変数                 |

ClickHouse は、リクエストプロトコルに対して最も優先度の高いリゾルバタイプを確認します。それが定義されていない場合は、
環境リゾルバに到達するまで、次に優先度の高いリゾルバタイプを順に確認します。
これにより、異なる種類のリゾルバタイプを組み合わせて使用することも可能になります。

## disable&#95;tunneling&#95;for&#95;https&#95;requests&#95;over&#95;http&#95;proxy {#disable_tunneling_for_https_requests_over_http_proxy}

デフォルトでは、`HTTP` プロキシ経由で `HTTPS` リクエストを行う際にトンネリング（`HTTP CONNECT`）が利用されます。この設定でトンネリングを無効化できます。

**no&#95;proxy**

デフォルトでは、すべてのリクエストがプロキシを経由します。特定のホストについてプロキシを無効化するには、`no_proxy` 変数を設定する必要があります。
これは、list resolver と remote resolver では `<proxy>` 句の中で、environment resolver では環境変数として設定できます。
IP アドレス、ドメイン、サブドメイン、および完全なバイパス用の `'*'` ワイルドカードをサポートします。先頭のドットは、curl と同様に削除されます。

**Example**

次の設定では、`clickhouse.cloud` とそのすべてのサブドメイン（例: `auth.clickhouse.cloud`）へのリクエストはプロキシをバイパスします。
GitLab についても同様で、先頭にドットが付いていても同じ挙動になります。`gitlab.com` と `about.gitlab.com` の両方がプロキシをバイパスします。

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

## workload&#95;path {#workload_path}

すべての `CREATE WORKLOAD` クエリおよび `CREATE RESOURCE` クエリの保存先として使用されるディレクトリです。デフォルトでは、サーバーの作業ディレクトリ配下の `/workload/` フォルダが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**関連項目**

* [ワークロード階層](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)

## workload&#95;zookeeper&#95;path {#workload_zookeeper_path}

ZooKeeper ノードへのパスです。すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリの保存先として使用されます。一貫性を保つため、すべての SQL 定義はこの単一の znode に値として保存されます。デフォルトでは ZooKeeper は使用されず、定義は [ディスク](#workload_path) 上に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**関連項目**

* [ワークロード階層](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)

## zookeeper&#95;log {#zookeeper_log}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) システムテーブルに関する設定です。

次の設定はサブタグで指定できます:

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
