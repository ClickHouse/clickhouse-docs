---
{}
---




## asynchronous_metric_log {#asynchronous_metric_log}

ClickHouse Cloud デプロイメントではデフォルトで有効になっています。

環境でデフォルトでこの設定が有効になっていない場合は、ClickHouse のインストール方法に応じて、以下の手順に従って有効または無効にできます。

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

`asynchronous_metric_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` を作成する必要があります。

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## auth_use_forwarded_address {#auth_use_forwarded_address}

プロキシを介して接続されたクライアントの認証に元のアドレスを使用します。

:::note
フォワードアドレスは簡単に偽造される可能性があるため、この設定は特に注意して使用する必要があります。そうした認証を受け入れるサーバーには直接アクセスするのではなく、信頼できるプロキシを介してのみアクセスするべきです。
:::
## backups {#backups}

`BACKUP TO File()` の書き込み時に使用されるバックアップの設定。

次の設定はサブタグによって構成できます：

| 設定                                   | 説明                                                                                                                                                               | デフォルト |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                        | `File()` を使用する際にバックアップするパス。この設定は `File` を使用するために設定する必要があります。パスはインスタンスディレクトリに対して相対的であるか、絶対的であることができます。 | `true`  |
| `remove_backup_files_after_failure`   | `BACKUP` コマンドが失敗した場合、ClickHouse は失敗の前にバックアップにすでにコピーされたファイルを削除しようとします。そうでない場合、コピーされたファイルはそのままにされます。 | `true`  |

この設定はデフォルトで次のように構成されています：

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## bcrypt_workfactor {#bcrypt_workfactor}

[Bcrypt アルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/) を使用する bcrypt_password 認証タイプの作業係数。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```
## table_engines_require_grant {#table_engines_require_grant}

これが true に設定されている場合、ユーザーは特定のエンジンでテーブルを作成するために権限を必要とします。例えば、 `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
デフォルトでは、後方互換性のために特定のテーブルエンジンを使用してテーブルを作成することは権限を無視しますが、これを true に設定することでこの動作を変更できます。
:::
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

組み込み辞書を再読み込みするまでのインターバル（秒）。

ClickHouse は x 秒ごとに組み込み辞書を再読み込みします。これにより、サーバーを再起動せずに「リアルタイム」で辞書を編集することが可能になります。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンテーブルのデータ圧縮設定。

:::note
ClickHouse の使用を始めたばかりの場合は、この設定を変更しないことをお勧めします。
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

**`<case>` フィールド**：

- `min_part_size` – データパーツの最小サイズ。
- `min_part_size_ratio` – データパートサイズとテーブルサイズの比率。
- `method` – 圧縮方法。許容される値: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`。
- `level` – 圧縮レベル。 [Codecs](/sql-reference/statements/create/table#general-purpose-codecs) を参照してください。

:::note
複数の `<case>` セクションを構成できます。
:::

**条件が満たされたときのアクション**：

- データパーツが条件セットに一致する場合、ClickHouse は指定された圧縮方法を使用します。
- データパーツが複数の条件セットに一致する場合、ClickHouse は最初に一致した条件セットを使用します。

:::note
データパーツに対する条件が満たされない場合、ClickHouse は `lz4` 圧縮を使用します。
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

[暗号化コーデック](/sql-reference/statements/create/table#encryption-codecs) に使用されるキーを取得するためのコマンドを構成します。キー（またはキー）は環境変数に書き込むか、設定ファイルに設定する必要があります。

キーは16バイトの長さの16進数または文字列です。

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
設定ファイルにキーを保存することは推奨されません。セキュリティが確保されないためです。キーを安全なディスク上の別の構成ファイルに移動し、その構成ファイルへのシンボリックリンクを `config.d/` フォルダに配置できます。
:::

構成からの読み込み、キーが16進数の場合：

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

ここで `current_key_id` は暗号化のための現在のキーを設定し、指定されたすべてのキーは復号に使用できます。

これらのメソッドは複数のキーに適用できます：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで `current_key_id` は暗号化のための現在のキーを示します。

また、ユーザーは12バイトの長さが必要なノンスを追加できます（デフォルトでは、暗号化および復号プロセスはゼロバイトで構成されたノンスを使用します）：

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
上記のすべては `aes_256_gcm_siv` に適用可能です（ただし、キーは32バイトの長さでなければなりません）。
:::
## error_log {#error_log}

デフォルトでは無効になっています。

**有効化**

エラーログ履歴収集 [`system.error_log`](../../operations/system-tables/error_log.md) を手動でオンにするには、次の内容で `/etc/clickhouse-server/config.d/error_log.xml` を作成します。

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

`error_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_error_log.xml` を作成する必要があります。

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## custom_settings_prefixes {#custom_settings_prefixes}

[カスタム設定](/operations/settings/query-level#custom_settings) のプレフィックスのリスト。プレフィックスはコンマで区切る必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**参照**

- [カスタム設定](/operations/settings/query-level#custom_settings)
## core_dump {#core_dump}

コアダンプファイルサイズのソフトリミットを構成します。

:::note
ハードリミットはシステムツールを使用して構成されます。
:::

**例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## default_profile {#default_profile}

デフォルト設定プロファイル。設定プロファイルは `user_config` 設定に指定されたファイルにあります。

**例**

```xml
<default_profile>default</default_profile>
```
## dictionaries_config {#dictionaries_config}

辞書の設定ファイルへのパス。

パス：

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにはワイルドカード * と ? を含めることができます。

参照：
- "[辞書](../../sql-reference/dictionaries/index.md)"。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

ユーザー定義の実行可能関数に対する設定ファイルへのパス。

パス：

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにはワイルドカード * と ? を含めることができます。

参照：
- "[実行可能ユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)。"

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## format_schema_path {#format_schema_path}

入力データ用のスキーマのディレクトリへのパス、例えば [CapnProto](../../interfaces/formats.md#capnproto) フォーマットのスキーマなど。

**例**

```xml
<!-- 様々な入力フォーマット用のスキーマファイルを含むディレクトリ。 -->
<format_schema_path>format_schemas/</format_schema_path>
```
## graphite {#graphite}

[Graphite](https://github.com/graphite-project) にデータを送信します。

設定：

- `host` – Graphite サーバー。
- `port` – Graphite サーバーのポート。
- `interval` – 送信間隔（秒）。
- `timeout` – データ送信のタイムアウト（秒）。
- `root_path` – キーのプレフィックス。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからのデータ送信。
- `events` – [system.events](/operations/system-tables/events) テーブルからの期間中に集計されたデルタデータの送信。
- `events_cumulative` – [system.events](/operations/system-tables/events) テーブルからの累積データの送信。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルからのデータ送信。

複数の `<graphite>` 条項を構成できます。たとえば、異なる間隔で異なるデータを送信するために使用できます。

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

Graphite のデータの薄化設定。

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
## google_protos_path {#google_protos_path}

Protobuf タイプ用のプロトファイルが含まれるディレクトリを定義します。

例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

カスタム HTTP ハンドラーの使用を許可します。
新しい HTTP ハンドラーを追加するには、新しい `<rule>` を追加するだけです。
ルールは上から下へとチェックされ、最初に一致したものがハンドラーを実行します。

次の設定はサブタグによって構成できます：

| サブタグ               | 定義                                                                                                                              |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `url`                  | リクエスト URL に一致させるために、`regex:` プレフィックスを使って正規表現マッチを使用することができます（オプション）                       |
| `methods`              | リクエストメソッドに一致させるため、複数のメソッドマッチをカンマで区切ります（オプション）                                         |
| `headers`              | リクエストヘッダーに一致させるため、各子要素（子要素名はヘッダー名）に一致させます。正規表現マッチを使用するために `regex:` プレフィックスを使用できます（オプション） |
| `handler`              | リクエストハンドラー                                                                                                            |
| `empty_query_string`   | URL にクエリ文字列が存在しないことを確認します                                                                                     |

`handler` には次の設定がサブタグによって構成されます：

| サブタグ               | 定義                                                                                                                                                       |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                  | リダイレクトするための場所                                                                                                                                 |
| `type`                 | サポートされるタイプ: static, dynamic_query_handler, predefined_query_handler, redirect                                                                     |
| `status`               | static タイプで使用し、レスポンスステータスコード                                                                                                           |
| `query_param_name`     | dynamic_query_handler タイプで使用し、HTTP リクエストパラメータの `<query_param_name>` の値に対応する値を抽出して実行します                               |
| `query`                | predefined_query_handler タイプで使用し、ハンドラーが呼び出されたときにクエリを実行します                                                                 |
| `content_type`         | static タイプで使用し、レスポンスのコンテントタイプ                                                                                                          |
| `response_content`     | static タイプで使用し、クライアントに送信されるレスポンスコンテンツ。`file://` または `config://` プレフィックスを使用する場合、ファイルまたは設定からコンテンツを見つけ付けます |

ルールのリストに加えて、すべてのデフォルトハンドラーを有効にする `<defaults/>` を指定することもできます。

**例**：

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

ClickHouse HTTP(s) サーバーにアクセスしたときにデフォルトで表示されるページ。
デフォルト値は "Ok." （行送り付き）です。

**例**

`http://localhost: http_port` にアクセスしたときに `https://tabix.io/` を開く。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

`OPTIONS` HTTP リクエストのレスポンスにヘッダーを追加するために使用されます。
`OPTIONS` メソッドは CORS のプリフライトリクエストを行う際に使用されます。

詳細については [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS) を参照してください。

**例**：

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

HSTS の有効期限（秒）。

:::note
値が `0` の場合、ClickHouse は HSTS を無効にします。正の数値を設定すると、HSTS が有効になり、max-age が設定した数値になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

起動後に `mlockall` を実行し、最初のクエリのレイテンシを低下させ、高IO負荷の下でClickhouse実行可能ファイルのページアウトを防ぎます。

:::note
このオプションを有効にすることは推奨されますが、起動時間が数秒増加する可能性があります。
この設定は「CAP_IPC_LOCK」機能無しでは機能しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

置換を含むファイルへのパス。XML と YAML フォーマットの両方がサポートされています。

詳細については "[構成ファイル](/operations/configuration-files)" のセクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

ClickHouse サーバー間でデータを交換できるホストの制限。
Keeper が使用されている場合、異なる Keeper インスタンス間の通信にも同様の制限が適用されます。

:::note
デフォルトでは、値は [`listen_host`](#listen_host) 設定と等しいです。
:::

**例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

タイプ：

デフォルト：
## interserver_http_port {#interserver_http_port}

ClickHouse サーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_http_host {#interserver_http_host}

他のサーバーがこのサーバーにアクセスするために使用できるホスト名。

省略した場合、`hostname -f` コマンドと同様に定義されます。

特定のネットワークインターフェースから切り離すのに便利です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_https_port {#interserver_https_port}

ClickHouse サーバー間で `HTTPS` 経由でデータを交換するためのポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_https_host {#interserver_https_host}

[`interserver_http_host`](#interserver_http_host) と似ていますが、このホスト名は他のサーバーが `HTTPS` 経由でこのサーバーにアクセスするために使用できるホスト名です。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md) の際に他のサーバーに接続するために使用されるユーザー名とパスワード。加えて、サーバーはこれらの資格情報を使用して他のレプリカを認証します。
したがって、`interserver_http_credentials` はクラスタ内のすべてのレプリカで同じでなければなりません。

:::note
- デフォルトでは、`interserver_http_credentials` セクションが省略されている場合、レプリケーション中の認証は使用されません。
- `interserver_http_credentials` 設定は ClickHouse クライアント資格情報 [設定](../../interfaces/cli.md#configuration_files) に関係しません。
- これらの資格情報は `HTTP` と `HTTPS` を介したレプリケーション共通です。
:::

次の設定はサブタグによって構成できます：

- `user` — ユーザー名。
- `password` — パスワード。
- `allow_empty` — `true` の場合、資格情報が設定されていても認証なしで他のレプリカが接続できるようになります。`false` の場合、認証なしの接続は拒否されます。デフォルト: `false`。
- `old` — 資格情報のローテーション中に使用された古い `user` および `password` を含みます。複数の `old` セクションを指定できます。

**資格情報のローテーション**

ClickHouse は、すべてのレプリカを同時に停止することなく、動的なインターネットサーバー資格情報のローテーションをサポートしています。資格情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、資格情報を追加します。これにより、認証ありおよび認証なしの接続が可能になります。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカを構成した後、`allow_empty` を `false` に設定するか、この設定を削除します。これにより、新しい資格情報を使用した認証が必須になります。

既存の資格情報を変更するには、ユーザー名とパスワードを `interserver_http_credentials.old` セクションに移動し、`user` と `password` を新しい値に更新します。この時点で、サーバーは新しい資格情報を使用して他のレプリカに接続し、新しい資格情報または古い資格情報のいずれかで接続を受け入れます。

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

新しい資格情報がすべてのレプリカに適用されると、古い資格情報は削除できます。
```
## ldap_servers {#ldap_servers}

ここに接続パラメータを持つLDAPサーバーのリストを作成します：
- `password`の代わりに`ldap`認証メカニズムが指定された専用のローカルユーザーの認証機構として使用するため
- リモートユーザーディレクトリとして使用するため。

次の設定はサブタグにより構成できます：

| 設定                          | 説明                                                                                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                        | LDAPサーバーのホスト名またはIP、これは必須であり、空にすることはできません。                                                                                                                                                                                                                                                                                                                                                  |
| `port`                        | LDAPサーバーポート、`enable_tls`が真に設定されている場合はデフォルトで636、そうでない場合は`389`です。                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                     | バインドするためのDNを生成するために使用されるテンプレート。結果として得られるDNは、各認証試行中にテンプレートのすべての`\{user_name\}`サブ文字列を実際のユーザー名で置き換えることによって構成されます。                                                                                                                                                                                                                          |
| `user_dn_detection`           | バインドユーザーの実際のユーザーDNを検出するためのLDAP検索パラメータを含むセクション。これは主にサーバーがActive Directoryの場合、さらなるロールマッピングのための検索フィルターで使用されます。結果として得られるユーザーDNは、可能な場合に`\{user_dn\}`サブ文字列を置き換えるときに使用されます。デフォルトでは、ユーザーDNはバインドDNと等しく設定されますが、検索が実行されると、実際に検出されたユーザーDNの値で更新されます。      |
| `verification_cooldown`       | 成功したバインド試行の後、LDAPサーバーに連絡することなくすべての連続リクエストに対してユーザーが正常に認証されると見なされる期間（秒単位）。キャッシュを無効にして、各認証リクエストのためにLDAPサーバーに連絡を強制するには`0`（デフォルト）を指定します。                                                                                                                                                                            |
| `enable_tls`                  | LDAPサーバーへの安全な接続の使用をトリガーするフラグ。プレーンテキストの`ldap://`プロトコルには`no`を指定します（推奨されません）。LDAP over SSL/TLSの`ldaps://`プロトコルには`yes`を指定します（推奨、デフォルト）。レガシーStartTLSプロトコル（プレーンテキストの`ldap://`プロトコル、TLSへアップグレード）には`starttls`を指定します。                                                                                              |
| `tls_minimum_protocol_version`| SSL/TLSの最小プロトコルバージョン。受け入れられる値は：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（デフォルト）です。                                                                                                                                                                                                                                                                                                             |
| `tls_require_cert`            | SSL/TLSピア証明書検証の動作。受け入れられる値は：`never`、`allow`、`try`、`demand`（デフォルト）です。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`               | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tls_key_file`                | 証明書キーファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_ca_cert_file`            | CA証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                                                                 |
| `tls_ca_cert_dir`             | CA証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                                                                       |
| `tls_cipher_suite`            | 許可された暗号スイート（OpenSSL表記）。                                                                                                                                                                                                                                                                                                                                                                                      |

`user_dn_detection`の設定はサブタグにより構成できます：

| 設定          | 説明                                                                                                                                                                                                                                                                                                                                        |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`     | LDAP検索のためのベースDNを構成するために使用されるテンプレート。結果として得られるDNは、LDAP検索中にテンプレートのすべての`\{user_name\}`および`\{bind_dn\}`サブ文字列を実際のユーザー名およびバインドDNで置き換えることによって構成されます。                                                                                         |
| `scope`       | LDAP検索の範囲。受け入れられる値は：`base`、`one_level`、`children`、`subtree`（デフォルト）です。                                                                                                                                                                                                                                  |
| `search_filter`| LDAP検索のための検索フィルターを構成するために使用されるテンプレート。結果として得られるフィルターは、LDAP検索中にテンプレートのすべての`\{user_name\}`、`\{bind_dn\}`、および`\{base_dn\}`サブ文字列を実際のユーザー名、バインドDN、およびベースDNで置き換えることによって構成されます。特に、特別な文字はXMLで適切にエスケープする必要があります。|

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

例（ユーザーDN検出のための設定された典型的なActive Directoryとさらなるロールマッピング）：

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

リクエストが来るホストに対する制限。サーバーがすべてのリクエストに応答するようにしたい場合は、 `::` を指定します。

例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

IPv6またはIPv4ネットワークがリッスンしようとした際に利用できない場合でも、サーバーは終了しません。

**例**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

複数のサーバーが同じアドレス:ポートでリッスンすることを許可します。リクエストはオペレーティングシステムによってランダムなサーバーにルーティングされます。この設定を有効にすることは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

タイプ：

デフォルト：
## listen_backlog {#listen_backlog}

リッスンソケットのバックログ（保留中接続のキューサイズ）。デフォルト値は `4096` で、これはlinuxの[5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)と同じです。

通常、この値は変更する必要はありません。なぜなら：
- デフォルト値は十分に大きいから、
- クライアントの接続を受け入れるために、サーバーには別のスレッドがあるためです。

したがって、`TcpExtListenOverflows`（`nstat`から）がゼロでない場合、このカウンターがClickHouseサーバーのために増加していたとしても、この値を増やす必要があるわけではありません。理由は次の通りです：
- 通常、`4096`が不十分であれば、内部のClickHouseスケーリングの問題を示しているため、問題を報告する方が良いです。
- それはサーバーが後でより多くの接続を処理できることを意味するわけではありません（たとえできたとしても、その時にはクライアントが消えていたり、切断されているかもしれません）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

ログメッセージの場所と形式。

**キー**：

| キー                       | 説明                                                                                                                                                                         |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | ログレベル。許容される値：`none`（ロギングをオフにする）、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                                  |
| `log`                     | ログファイルへのパス。                                                                                                                                                           |
| `errorlog`                | エラーログファイルへのパス。                                                                                                                                                     |
| `size`                    | ローテーションポリシー：最大のログファイルサイズ（バイト単位）。ログファイルのサイズがこのしきい値を超えると、名前が変更されアーカイブされ、新しいログファイルが作成されます。                  |
| `count`                   | ローテーションポリシー：Clickhouseが保持する履歴ログファイルの最大数。                                                                                                         |
| `stream_compress`         | LZ4を使用してログメッセージを圧縮します。有効にするには`1`または`true`を設定します。                                                                                                                    |
| `console`                 | ログメッセージをログファイルに書き込まず、代わりにコンソールに印刷します。有効にするには`1`または`true`を設定します。Clickhouseがデーモンモードで実行されていない場合はデフォルトで`1`、そうでない場合は`0`です。 |
| `console_log_level`       | コンソール出力のログレベル。デフォルトは`level`です。                                                                                                                                  |
| `formatting`              | コンソール出力のログ形式。現在は`json`のみがサポートされています。                                                                                                                  |
| `use_syslog`              | ログ出力をsyslogにも転送します。                                                                                                                                                  |
| `syslog_level`            | syslogへのログ記録のためのログレベル。                                                                                                                                                    |

**ログ形式指定子**

`log` および `errorLog` パスのファイル名は、結果のファイル名のための以下の形式指定子をサポートします（ディレクトリ部分はサポートされていません）。

"例" の列は `2023-07-06 18:32:07` での出力を示します。

| 指定子       | 説明                                                                                                        | 例                      |
|--------------|-------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | リテラル %                                                                                                  | `%`                        |
| `%n`         | 改行文字                                                                                                   |                          |
| `%t`         | 水平タブ文字                                                                                               |                          |
| `%Y`         | 小数で表した年（例：2017）                                                                                 | `2023`                     |
| `%y`         | 小数で表した年の最後の2桁（範囲 [00,99]）                                                                     | `23`                       |
| `%C`         | 小数で表した年の最初の2桁（範囲 [00,99]）                                                                  | `20`                       |
| `%G`         | 4桁の[ISO 8601 ウィークベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)で、指定された週を含む年。通常、`%V`と共に使用される場合のみ有益です。 | `2023`        |
| `%g`         | 最後の2桁の[ISO 8601 ウィークベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)で、指定された週を含む年。                                         | `23`         |
| `%b`         | 略称の月名（例：Oct）（ロケールに依存）                                                                       | `Jul`                      |
| `%h`         | %bの同義語                                                                                                   | `Jul`                      |
| `%B`         | 完全な月名（例：October）（ロケールに依存）                                                                  | `July`                     |
| `%m`         | 小数で表した月（範囲 [01,12]）                                                                              | `07`                       |
| `%U`         | 週の年を小数で表したもの（日曜日が週の初日）（範囲 [00,53]）                                                   | `27`                       |
| `%W`         | 週の年を小数で表したもの（月曜日が週の初日）（範囲 [00,53]）                                                | `27`                       |
| `%V`         | ISO 8601ウィーク番号（範囲 [01,53]）                                                                        | `27`                       |
| `%j`         | 年中の曜日を小数で表したもの（範囲 [001,366]）                                                               | `187`                      |
| `%d`         | 月の中の曜日をゼロパディングした小数で表したもの（範囲 [01,31]）。単一桁はゼロで埋められます。                    | `06`                       |
| `%e`         | 月の中の曜日をスペースでパディングした小数で表したもの（範囲 [1,31]）。単一桁はスペースで埋められます。              | `&nbsp; 6`                 |
| `%a`         | 略称の曜日名（例：Fri）（ロケールに依存）                                                                     | `Thu`                      |
| `%A`         | 完全な曜日名（例：Friday）（ロケールに依存）                                                                 | `Thursday`                 |
| `%w`         | 曜日を整数で表したもの（日曜日は0）（範囲 [0-6]）                                                             | `4`                        |
| `%u`         | 曜日を小数で表したもの、月曜日は1（ISO 8601形式）（範囲 [1-7]）                                               | `4`                        |
| `%H`         | 小数で表した時間（24時間制）（範囲 [00-23]）                                                                 | `18`                       |
| `%I`         | 小数で表した時間（12時間制）（範囲 [01,12]）                                                                 | `06`                       |
| `%M`         | 小数で表した分（範囲 [00,59]）                                                                                | `32`                       |
| `%S`         | 小数で表した秒（範囲 [00,60]）                                                                                | `07`                       |
| `%c`         | 標準的な日付と時刻の文字列（例：Sun Oct 17 04:41:13 2010）（ロケールに依存）                                 | `Thu Jul  6 18:32:07 2023` |
| `%x`         | ローカライズされた日付表現（ロケールに依存）                                                                  | `07/06/23`                 |
| `%X`         | ローカライズされた時刻表現（例：18:40:20または6:40:20 PM）（ロケールに依存）                                   | `18:32:07`                 |
| `%D`         | 短いMM/DD/YYの日付、%m/%d/%yと同等                                                                              | `07/06/23`                 |
| `%F`         | 短いYYYY-MM-DDの日付、%Y-%m-%dと同等                                                                            | `2023-07-06`               |
| `%r`         | ローカライズされた12時間制の時刻（ロケールに依存）                                                            | `06:32:07 PM`              |
| `%R`         | "%H:%M"と同等                                                                                                  | `18:32`                    |
| `%T`         | "%H:%M:%S"と同等（ISO 8601時刻形式）                                                                             | `18:32:07`                 |
| `%p`         | ローカライズされたa.m.またはp.m.の指定（ロケールに依存）                                                      | `PM`                       |
| `%z`         | ISO 8601形式のUTCからのオフセット（例：-0430）、またはタイムゾーン情報がない場合は文字がありません               | `+0800`                    |
| `%Z`         | ロケールに依存したタイムゾーン名または略語、タイムゾーン情報がない場合は文字がありません                     | `Z AWST `                  |

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

ログメッセージをコンソールにだけ出力するには：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベル毎のオーバーライド**

個別のログ名のログレベルをオーバーライドできます。たとえば、"Backup"および"RBAC"のすべてのメッセージをミュートする場合：

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

ログメッセージをsyslogにも追加で書き込むには：

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

`<syslog>`のキー：

| キー        | 説明                                                                                                                                                                                                                                                    |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | `host\[:port\]`形式のsyslogのアドレス。省略するとローカルデーモンが使用されます。                                                                                                                                                                        |
| `hostname` | ログが送信されるホストの名前（オプション）。                                                                                                                                                                                                       |
| `facility` | syslogの[ファシリティキーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。大文字で"LOG_"プレフィックスを付けて指定する必要があります（例：`LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3`など）。デフォルト：`address`が指定された場合は`LOG_USER`、それ以外は`LOG_DAEMON`。 |
| `format`   | ログメッセージの形式。可能な値：`bsd`および `syslog`。                                                                                                                                                                                                  |

**ログ形式**

コンソールログに出力されるログ形式を指定できます。現在はJSONのみがサポートされています。

**例**

こちらは出力JSONログの例です：

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

JSONロギングサポートを有効にするには、以下のスニペットを使用します：

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

キー名は、`<names>`タグ内のタグの値を変更することで変更できます。たとえば、`DATE_TIME`を`MY_DATE_TIME`に変更するには、`<date_time>MY_DATE_TIME</date_time>`を使用します。

**JSONログのキーの省略**

ログプロパティは、プロパティのコメントアウトによって省略できます。たとえば、ログに`query_id`を印刷させたくない場合は、`<query_id>`タグをコメントアウトできます。
## send_crash_reports {#send_crash_reports}

ClickHouseのコア開発者チームにクラッシュレポートを送信するための設定。

それを有効にすることは、特に生産前環境で高く評価されます。

キー：

| キー                   | 説明                                                                                                                          |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | 機能を有効にするためのブールフラグ、デフォルトは`true`。クラッシュレポートを送信しないために`false`に設定します。                                |
| `send_logical_errors` | `LOGICAL_ERROR`は`assert`のようなもので、ClickHouseのバグです。このブールフラグはこの例外を送信することを可能にします（デフォルト：`true`）。 |
| `endpoint`            | クラッシュレポートを送信するためのエンドポイントURLをオーバーライドできます。                                                           |

**推奨される使用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## ssh_server {#ssh_server}

ホストキーの公開部分は、最初の接続時にSSHクライアント側のknown_hostsファイルに書き込まれます。

ホストキーの設定はデフォルトでは非アクティブです。
ホストキーの設定のコメントアウトを解除し、対応するssh鍵へのパスを提供してアクティブにします：

例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## tcp_ssh_port {#tcp_ssh_port}

ユーザーがPTPを介して埋め込みクライアントを使用してインタラクティブな方法で接続し、クエリを実行できるSSHサーバーのポート。

例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## storage_configuration {#storage_configuration}

ストレージのマルチディスク設定を許可します。

ストレージ構成は、次の構造に従います：

```xml
<storage_configuration>
    <disks>
        <!-- config -->
    </disks>
    <policies>
        <!-- config -->
    </policies>
</storage_configuration>
```
### ディスクの構成 {#configuration-of-disks}

`disks`の構成は、以下の構造に従います：

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

上記のサブタグは `disks` のための次の設定を定義します：

| 設定                      | 説明                                                                                           |
|--------------------------|------------------------------------------------------------------------------------------------|
| `<disk_name_N>`          | ディスクの名前、これは一意である必要があります。                                                |
| `path`                   | サーバーデータが保存されるパス（`data`および`shadow`カタログ）です。`/`で終わる必要があります。 |
| `keep_free_space_bytes`  | ディスク上に予約される空き領域のサイズ。                                                          |

:::note
ディスクの順序は重要ではありません。
:::
### Configuration of policies {#configuration-of-policies}

上記のサブタグは `policies` に対する以下の設定を定義します：

| 設定                          | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシーの名前。ポリシー名は一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | ボリュームの名前。ボリューム名は一意でなければなりません。                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `disk`                       | ボリューム内に存在するディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`   | このボリューム内のいずれかのディスクに存在できるデータのチャンクの最大サイズ。マージの結果、チャンクサイズが max_data_part_size_bytes を超えると予想された場合、そのチャンクは次のボリュームに書き込まれます。基本的に、この機能は、新しい/小さなチャンクをホット（SSD）ボリュームに保存し、サイズが大きくなったときにコールド（HDD）ボリュームに移動させることを可能にします。このオプションは、ポリシーにボリュームが1つしかない場合は使用しないでください。                                                                 |
| `move_factor`                | ボリューム上の利用可能な空き容量の割合。空きスペースが少なくなると、データは次のボリュームに移動し始めます（存在する場合）。転送のために、チャンクは大きいものから小さいものへ（降順）にサイズによってソートされ、`move_factor` 条件を満たす十分な合計サイズのチャンクが選択されます。すべてのチャンクの合計サイズが不十分な場合、すべてのチャンクが移動されます。                                                                                                             |
| `perform_ttl_move_on_insert` | 挿入時に有効期限が切れた TTL を持つデータの移動を無効にします。デフォルトでは（有効な場合）、有効期限ルールに従って期限切れのデータを挿入すると、それは指定されたボリューム/ディスクに即座に移動されます。ターゲットボリューム/ディスクが遅い場合（例えば S3）、挿入が大幅に遅くなる可能性があります。無効にすると、データの期限切れ部分はデフォルトのボリュームに書き込まれ、その後、期限切れの TTL に対してルールに指定されたボリュームに即座に移動されます。 |
| `load_balancing`             | ディスクバランスポリシー、`round_robin` または `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`          | すべてのディスクでの利用可能なスペースを更新するためのタイムアウト（ミリ秒）。 (`0` - 常に更新、`-1` - 決して更新しない、デフォルト値は `60000`）。ディスクが ClickHouse のみで使用され、ファイルシステムが即時にサイズ変更されない場合は、`-1` 値を使用できます。それ以外の場合はお勧めできません。最終的には不正確な空間割り当てにつながります。                                                                                                                   |
| `prefer_not_to_merge`        | このボリューム内のデータのマージを無効にします。注意：これは潜在的に有害で、速度低下を引き起こす可能性があります。この設定が有効な場合（これを行わないでください）、このボリュームでのデータのマージは禁止されます（これは悪いことです）。これにより、ClickHouse が遅いディスクとどのように相互作用するかを制御できます。私たちはこれを全く使用しないことをお勧めします。                                                                                                                                                                                       |
| `volume_priority`            | ボリュームが埋め込まれる優先度（順序）を定義します。値が小さいほど優先度が高くなります。このパラメータの値は自然数でなければならず、1 から N までの範囲をカバーし（N は指定された最大のパラメータ値）、ギャップがあってはいけません。                                                                                                                                                                                                                                                                |

`volume_priority` に関して：
- すべてのボリュームがこのパラメータを持っている場合は、指定された順序で優先されます。
- 一部のボリュームのみがこのパラメータを持っている場合、持っていないボリュームは最も低い優先度になります。持っているものはタグの値に従って優先され、その他の優先度は構成ファイル内での相互間の記述順によって決まります。
- プロパティが与えられていないボリュームがある場合、それらの順序は構成ファイル内の記述の順序によって決まります。
- ボリュームの優先度は必ずしも同一とは限りません。
## macros {#macros}

複製テーブル用のパラメータ置換。

複製テーブルが使用されていない場合は省略可能です。

詳細については、セクション[Creating replicated tables](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)を参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

データベース Replicated のレプリカグループ名。

Replicated データベースによって作成されたクラスタは、同じグループ内のレプリカで構成されます。DDL クエリは、同じグループ内のレプリカのみ待機します。

デフォルトでは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```
## remap_executable {#remap_executable}

巨大ページを使用して機械コード（「テキスト」）のメモリを再割り当てする設定。

:::note
この機能は非常に実験的です。
:::

例：

```xml
<remap_executable>false</remap_executable>
```
## max_open_files {#max_open_files}

オープンファイルの最大数。

:::note
`getrlimit()` 関数が不正確な値を返すため、macOS でこのオプションの使用をお勧めします。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```
## max_session_timeout {#max_session_timeout}

最大セッションタイムアウト（秒）。

例：

```xml
<max_session_timeout>3600</max_session_timeout>
```
## merge_tree {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)のテーブルの微調整。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

デフォルトで無効になっています。

**有効化**

手動でメトリクス履歴の収集 [`system.metric_log`](../../operations/system-tables/metric_log.md) をオンにするには、次の内容で `/etc/clickhouse-server/config.d/metric_log.xml` を作成します。

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

<SystemLogParameters/>
## latency_log {#latency_log}

デフォルトで無効になっています。

**有効化**

手動でレイテンシ履歴の収集 [`system.latency_log`](../../operations/system-tables/latency_log.md) をオンにするには、次の内容で `/etc/clickhouse-server/config.d/latency_log.xml` を作成します。

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

`latency_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_latency_log.xml` ファイルを作成する必要があります。

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## replicated_merge_tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) のテーブルの微調整。この設定はより高い優先度を持ちます。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## opentelemetry_span_log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) システムテーブルの設定。

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
## openSSL {#openSSL}

SSL クライアント/サーバー設定。

SSL のサポートは `libpoco` ライブラリによって提供されます。利用可能な設定オプションは [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) で説明されています。デフォルト値は [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) で確認できます。

サーバー/クライアント設定用のキー：

| オプション                    | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                            | デフォルト値                              |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | PEM 証明書の秘密鍵を含むファイルのパス。そのファイルにはキーと証明書が同時に含まれる場合があります。                                                                                                                                                                                                                                                                                                                                              |                                            |
| `certificateFile`             | PEM 形式のクライアント/サーバー証明書ファイルのパス。`privateKeyFile` に証明書が含まれている場合は省略できます。                                                                                                                                                                                                                                                                                                                                                |                                            |
| `caConfig`                    | 信頼された CA 証明書を含むファイルまたはディレクトリのパス。これがファイルを指している場合、PEM 形式でなければならず、複数の CA 証明書を含むことができます。これがディレクトリを指している場合は、CA 証明書ごとに1つの .pem ファイルを含まなければなりません。ファイル名は CA 主題名ハッシュ値によって照会されます。詳細は [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) の man ページに記載されています。 |                                            |
| `verificationMode`            | ノードの証明書を確認する方法。詳細は [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明に記載されています。可能な値：`none`、`relaxed`、`strict`、`once`。                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | 検証チェーンの最大長。証明書チェーンの長さが設定値を超えている場合、検証は失敗します。                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | OpenSSL に組み込まれた CA 証明書が使用されるかどうか。ClickHouse は、組み込みの CA 証明書が `/etc/ssl/cert.pem`（またはディレクトリ `/etc/ssl/certs`）内にあるか、環境変数 `SSL_CERT_FILE`（または `SSL_CERT_DIR`）によって指定されたファイル（またはディレクトリ）に存在すると想定します。                                                                                                                                                                        | `true`                                     |
| `cipherList`                  | サポートされている OpenSSL 暗号化方法。                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | セッションキャッシュを有効または無効にします。`sessionIdContext` と組み合わせて使用する必要があります。許可される値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`            | サーバーが生成する各識別子に追加するユニークなランダム文字列のセット。文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはいけません。このパラメータは常に推奨されます。なぜなら、セッションをキャッシュした場合でも、キャッシュを要求した場合でも問題を避けるのに役立つからです。                                                                                                                                                        | `$\{application.name\}`                      |
| `sessionCacheSize`            | サーバーがキャッシュするセッションの最大数。`0` の値は無制限のセッションを意味します。                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | サーバー上におけるセッションキャッシュの時間（時間単位）。                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | 有効にした場合、証明書の CN または SAN がピアのホスト名と一致することを確認します。                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | TLSv1 接続を要求します。許可される値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | TLSv1.1 接続を要求します。許可される値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | TLSv1.2 接続を要求します。許可される値：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | OpenSSL FIPS モードをアクティブにします。ライブラリの OpenSSL バージョンが FIPS をサポートしている場合にサポートされます。                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandler サブクラス）。例えば：`<privateKeyPassphraseHandler>`、`<name>KeyFileHandler</name>`、`<options><password>test</password></options>`、`</privateKeyPassphraseHandler>`。                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | 無効な証明書を確認するためのクラス（CertificateHandler のサブクラス）。例えば：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` 。                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | 使用が許可されていないプロトコル。                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | クライアントが好むサーバー暗号。                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

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
        <!-- 自己署名に使用：<verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 自己署名に使用：<name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```
## part_log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) に関連するイベントのロギング。例えば、データの追加またはマージ。ログを使用してマージアルゴリズムをシミュレーションし、その特性を比較できます。マージプロセスを視覚化できます。

クエリは [system.part_log](/operations/system-tables/part_log) テーブルに記録され、別のファイルには記録されません。このテーブルの名前は `table` パラメータで構成できます（以下参照）。

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
## path {#path}

データを含むディレクトリのパス。

:::note
末尾のスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
```
## processors_profile_log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) システムテーブル用の設定。

<SystemLogParameters/>

デフォルト設定は以下の通りです：

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

[Prometheus](https://prometheus.io) からのスクレイピング用にメトリクスデータを公開します。

設定：

- `endpoint` – prometheus サーバーによるメトリクスのスクレイピング用の HTTP エンドポイント。'/' から始まります。
- `port` – `endpoint` 用のポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開します。
- `events` – [system.events](/operations/system-tables/events) テーブルからメトリクスを公開します。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルからの現在のメトリクス値を公開します。
- `errors` - 最後のサーバー再起動以来発生したエラーコードによるエラーの数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも入手できます。

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

チェック（`127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えてください）：
```bash
curl 127.0.0.1:9363/metrics
```
## query_log {#query_log}

[log_queries=1](../../operations/settings/settings.md) 設定で受信したクエリをログするための設定。

クエリは [system.query_log](/operations/system-tables/query_log) テーブルに記録され、別のファイルには記録されません。テーブルの名前は `table` パラメータで変更できます（以下参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouse がそれを作成します。ClickHouse サーバーの更新時にクエリログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

メトリクス履歴収集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md) を手動で有効にするには、以下の内容で`/etc/clickhouse-server/config.d/query_metric_log.xml`を作成します。

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

`query_metric_log` 設定を無効にするには、以下の内容で`/etc/clickhouse-server/config.d/disable_query_metric_log.xml`ファイルを作成する必要があります。

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

[クエリキャッシュ](../query-cache.md)の設定。

利用できる設定は以下の通りです：

| 設定                       | 説明                                                                                      | デフォルト値      |
|---------------------------|-------------------------------------------------------------------------------------------|------------------|
| `max_size_in_bytes`       | キャッシュの最大サイズ（バイト単位）。`0`はクエリキャッシュが無効であることを意味します。        | `1073741824`     |
| `max_entries`             | キャッシュに保存される`SELECT`クエリ結果の最大数。                                         | `1024`           |
| `max_entry_size_in_bytes` | キャッシュに保存される`SELECT`クエリ結果の最大サイズ（バイト単位）。                        | `1048576`        |
| `max_entry_size_in_rows`  | キャッシュに保存される`SELECT`クエリ結果の最大行数。                                     | `30000000`       |

:::note
- 変更された設定はすぐに適用されます。
- クエリキャッシュのためのデータはDRAMに割り当てられます。メモリが不足している場合は、`max_size_in_bytes`に小さい値を設定するか、クエリキャッシュ全体を無効にすることをお勧めします。
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

[log_query_threads=1](/operations/settings/settings#log_query_threads) 設定で受信したクエリのスレッドをログするための設定。

クエリは、[system.query_thread_log](/operations/system-tables/query_thread_log) テーブルにログされ、別ファイルには記録されません。テーブルの名前は`table`パラメータで変更できます（下記参照）。

<SystemLogParameters/>

もしテーブルが存在しない場合、ClickHouseが自動で作成します。ClickHouseサーバーがアップデートされた際にクエリスレッドログの構造が変更された場合、古い構造のテーブルはリネームされ、新しいテーブルが自動で作成されます。

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

[log_query_views=1](/operations/settings/settings#log_query_views) 設定で受信したクエリに依存するビュー（ライブ、マテリアライズドなど）をログするための設定。

クエリは、[system.query_views_log](/operations/system-tables/query_views_log) テーブルにログされ、別ファイルには記録されません。テーブルの名前は`table`パラメータで変更できます（下記参照）。

<SystemLogParameters/>

もしテーブルが存在しない場合、ClickHouseが自動で作成します。ClickHouseサーバーがアップデートされた際にクエリビューズログの構造が変更された場合、古い構造のテーブルはリネームされ、新しいテーブルが自動で作成されます。

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

テキストメッセージをログするための[テキストログ](/operations/system-tables/text_log) システムテーブルの設定。

<SystemLogParameters/>

さらに：

| 設定   | 説明                                                                                                                                                                                                           | デフォルト値      |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| `level` | テーブルに保存される最大メッセージレベル（デフォルトは`Trace`）。                                                                                                                                               | `Trace`          |

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

[trace_log](/operations/system-tables/trace_log) システムテーブルの操作設定。

<SystemLogParameters/>

デフォルトのサーバー設定ファイル `config.xml` には、以下の設定セクションが含まれています：

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

非同期挿入のログ用に設定された[asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) システムテーブルの設定。

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
## crash_log {#crash_log}

[crash_log](../../operations/system-tables/crash-log.md) システムテーブルの操作用設定。

<SystemLogParameters/>

デフォルトのサーバー設定ファイル `config.xml` には、以下の設定セクションが含まれています：

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

この設定は、カスタム（SQLから作成された）キャッシュディスクのキャッシュパスを指定します。`custom_cached_disks_base_directory`は、`filesystem_caches_path`（`filesystem_caches_path.xml`に記述）よりもカスタムディスクに対して優先され、前者が存在しない場合に使用されます。このファイルシステムキャッシュ設定パスは、指定されたディレクトリ内に存在する必要があります。そうでない場合、ディスク作成を妨げる例外が発生します。

:::note
これは、サーバーがアップグレードされた旧バージョンで作成されたディスクには影響しません。この場合、サーバーが正常に開始できるように例外は発生しません。
:::

例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## backup_log {#backup_log}

`BACKUP` および `RESTORE` 操作のログ用に設定された[backup_log](../../operations/system-tables/backup_log.md) システムテーブル。

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
## blog_storage_log {#blog_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) システムテーブルの設定。

<SystemLogParameters/>

例：

```xml
<blob_storage_log>
    <database>system</database>
    <table>blob_storage_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```
## query_masking_rules {#query_masking_rules}

クエリおよびすべてのログメッセージに適用され、サーバーログに格納される前に正規表現ベースのルール、[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブル、およびクライアントに送信されるログ。これにより、名前、メールアドレス、個人識別子、クレジットカード番号などのSQLクエリから機密データの漏洩を防ぐことができます。

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

**設定フィールド**：

| 設定   | 説明                                                                    |
|--------|-------------------------------------------------------------------------|
| `name` | ルールの名前（オプション）                                              |
| `regexp` | RE2互換の正規表現（必須）                                          |
| `replace` | 機密データのための置換文字列（オプション、デフォルトは六つのアスタリスク） |

マスキングルールは、機密データの漏洩を防ぐために、整形されていない/解析できないクエリ全体に適用されます。

[`system.events`](/operations/system-tables/events) テーブルには、クエリマスキングルールの一致回数が記録される`QueryMaskingRulesMatch`があります。

分散クエリの場合、各サーバーはそれぞれ別に設定する必要があり、そうでないと他のノードに渡されたサブクエリがマスキングなしで保存されます。
## remote_servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンおよび`cluster`テーブル関数によって使用されるクラスタの設定。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl`属性の値については、"[設定ファイル](/operations/configuration-files)"セクションを参照してください。

**参照**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [クラスタディスカバリ](../../operations/cluster-discovery.md)
- [レプリケーションデータベースエンジン](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

URL関連のストレージエンジンとテーブル関数で使用が許可されているホストのリストです。

`\<host\>` XMLタグでホストを追加する際は：
- URLと同じように正確に指定する必要があります。名前はDNS解決の前にチェックされます。例えば：`<host>clickhouse.com</host>`
- ポートがURLに明示的に指定されている場合、ホスト:ポート全体がチェックされます。例えば：`<host>clickhouse.com:80</host>`
- ポートなしでホストが指定されている場合、そのホストの任意のポートが許可されます。例えば、`<host>clickhouse.com</host>`が指定されている場合、`clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) などが許可されます。
- ホストがIPアドレスとして指定された場合、URLに指定されたとおりにチェックされます。例えば：`[2a02:6b8:a::a]`。
- リダイレクトがあり、リダイレクトのサポートが有効になっている場合、各リダイレクト（locationフィールド）がチェックされます。

例：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## timezone {#timezone}

サーバーのタイムゾーン。

UTCタイムゾーンや地理的位置のIANA識別子（例：Africa/Abidjan）として指定されます。

タイムゾーンは、DateTimeフィールドがテキスト形式（画面またはファイルに印刷される）で出力される際や、文字列からDateTimeを取得する際のStringとDateTime形式の変換に必要です。また、タイムゾーンは、入力パラメータで受け取らなかった場合の時間と日付を扱う関数でも使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**参照**

- [session_timezone](../settings/settings.md#session_timezone)
## tcp_port {#tcp_port}

クライアントとTCPプロトコルを介して通信するためのポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

クライアントとの安全な通信のためのTCPポート。 [OpenSSL](#openssl) の設定と共に使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## mysql_port {#mysql_port}

MySQLプロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数は、リッスンするポート番号を指定します。
- 空の値は、MySQLプロトコルを介したクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<mysql_port>9004</mysql_port>
```
## postgresql_port {#postgresql_port}

PostgreSQLプロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数は、リッスンするポート番号を指定します。
- 空の値は、PostgreSQLプロトコルを介したクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```
## tmp_path {#tmp_path}

大きなクエリを処理するための一時データをローカルファイルシステムに保存するパス。

:::note
- 一時データの保存を構成するには、`tmp_path`, `tmp_policy`, `temporary_data_in_cache`のどれか一つだけを使用できます。
- スラッシュの後は必須です。
:::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

短縮されたまたは記号的なURLプレフィックスをフルURLに変換するための設定。

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
## user_files_path {#user_files_path}

ユーザーファイルのディレクトリ。テーブル関数[file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md)で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path}

ユーザースクリプトファイルのディレクトリ。実行可能なユーザー定義関数[実行可能ユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)で使用されます。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

タイプ：

デフォルト：
## user_defined_path {#user_defined_path}

ユーザー定義ファイルのディレクトリ。SQLユーザー定義関数[SQLユーザー定義関数](/sql-reference/functions/udf)で使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## users_config {#users_config}

次を含むファイルへのパス：

- ユーザー設定。
- アクセス権。
- 設定プロファイル。
- クォータ設定。

**例**

```xml
<users_config>users.xml</users_config>
```
## access_control_improvements {#access_control_improvements}

アクセス制御システムのオプションの改善に関する設定。

| 設定                                           | 説明                                                                                                                                                                                                            | デフォルト |
|------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`      | 行ポリシーを持たないユーザーが`SELECT`クエリを使用して行を読み取ることができるかどうかを設定します。例えば、ユーザーAとBがいる場合、Aのみに定義された行ポリシーがある場合、この設定がtrueであれば、ユーザーBはすべての行を表示します。この設定がfalseであれば、ユーザーBは行を表示しません。 | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER`クエリが`CLUSTER`権限を必要とするかどうかを設定します。                                                                                                                                         | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>`が任意の権限を必要とするかどうか、すべてのユーザーが実行できるかどうかを設定します。trueに設定されている場合、このクエリは`GRANT SELECT ON system.<table>`を必要とします。例外として、いくつかのシステムテーブル（`tables`、`columns`、`databases`、および定数テーブルの`one`、`contributors`など）はすべての人にアクセス可能です。 | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>`が任意の権限を必要とするかどうか、すべてのユーザーが実行できるかどうかを設定します。trueに設定されている場合、このクエリは`GRANT SELECT ON information_schema.<table>`を必要とします。         | `true`  |
| `settings_constraints_replace_previous`         | ある設定の設定プロファイルにおいての制約が、別のプロファイルで定義された同じ設定の以前の制約の行動をキャンセルするかどうかを設定します。また、`changeable_in_readonly`制約タイプを有効にします。                                                      | `true`  |
| `table_engines_require_grant`                   | 特定のテーブルエンジンでテーブルを作成することが権限を必要とするかどうかを設定します。                                                                                                                                       | `false` |
| `role_cache_expiration_time_seconds`            | 最後のアクセスからの秒数で、ロールがロールキャッシュに保存されます。                                                                                                                                                   | `600`   |

例：

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

`s3queue_log`システムテーブルの設定。

<SystemLogParameters/>

デフォルト設定は以下の通りです：

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```

## zookeeper {#zookeeper}

ClickHouseが[ZooKeeper](http://zookeeper.apache.org/)クラスターと連携するための設定を含みます。ClickHouseは、レプリケートテーブルを使用する際にレプリカのメタデータを保存するためにZooKeeperを使用します。レプリケートテーブルを使用しない場合、このパラメータのセクションは省略できます。

以下の設定はサブタグで構成できます：

| 設定                                       | 説明                                                                                                                                                                                                                       |
|--------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                     | ZooKeeperエンドポイント。複数のエンドポイントを設定できます。例：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index`属性はZooKeeperクラスターへの接続時のノードの順序を示します。                                                        |
| `session_timeout_ms`                       | クライアントセッションの最大タイムアウト（ミリ秒）。                                                                                                                                                            |
| `operation_timeout_ms`                     | 1つの操作の最大タイムアウト（ミリ秒）。                                                                                                                                                                                 |
| `root` (オプション)                        | ClickHouseサーバーが使用するznodeのルートとして使用されるznode。                                                                                                                                                       |
| `fallback_session_lifetime.min` (オプション) | プライマリが利用できないときにフォールバックノードへのZooKeeperセッションの最小寿命の制限（ロードバランシング）。秒単位で設定。デフォルト：3時間。                                                                                          |
| `fallback_session_lifetime.max` (オプション) | プライマリが利用できないときにフォールバックノードへのZooKeeperセッションの最大寿命の制限（ロードバランシング）。秒単位で設定。デフォルト：6時間。                                                                                           |
| `identity` (オプション)                    | ZooKeeperに要求されたznodeにアクセスするために必要なユーザー名とパスワード。                                                                                                                                                 |
| `use_compression` (オプション)             | trueに設定するとKeeperプロトコルでの圧縮を有効にします。                                                                                                                                                            |

`zookeeper_load_balancing`設定（オプション）もあり、ZooKeeperノード選択のアルゴリズムを選択できます：

| アルゴリズム名                      | 説明                                                                                                                    |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `random`                           | ZooKeeperノードの1つをランダムに選択します。                                                                               |
| `in_order`                         | 最初のZooKeeperノードを選択し、利用できない場合は次のノードを選択します。                                                       |
| `nearest_hostname`                 | サーバーのホスト名に最も似たZooKeeperノードを選択します。ホスト名は名前のプレフィックスで比較されます。                                 |
| `hostname_levenshtein_distance`    | nearest_hostnameと同様ですが、ホスト名をレーヴェンシュタイン距離の方式で比較します。                                          |
| `first_or_random`                  | 最初のZooKeeperノードを選択し、利用できない場合は残りのZooKeeperノードの1つをランダムに選択します。                              |
| `round_robin`                      | 最初のZooKeeperノードを選択し、再接続が必要な場合は次のノードを選択します。                                                |

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
    <!-- オプション。Chrootサフィックス。存在する必要があります。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- オプション。ZooKeeperダイジェストACL文字列。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**参考**

- [レプリケーション](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeperプログラマーズガイド](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouseとZooKeeper間のオプションでのセキュアな通信](/operations/ssl-zookeeper)

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeperにおけるデータパートヘッダーのストレージ方法。この設定は[`MergeTree`](/engines/table-engines/mergetree-family)ファミリーにのみ適用されます。指定可能です：

**`config.xml`ファイルの[merge_tree](#merge_tree)セクションでグローバルに**

ClickHouseはサーバー上のすべてのテーブルに対して設定を使用します。設定はいつでも変更できます。既存のテーブルは設定変更時に動作が変わります。

**各テーブルごとに**

テーブルを作成する際に、対応する[エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)を指定します。この設定を持つ既存のテーブルの動作は、グローバル設定が変更されても変わりません。

**可能な値**

- `0` — 機能がオフになります。
- `1` — 機能がオンになります。

もし[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)の場合、[レプリケート](../../engines/table-engines/mergetree-family/replication.md)テーブルはデータパートのヘッダーを単一の`znode`を使用してコンパクトに格納します。テーブルに多くのカラムが含まれている場合、このストレージ方法はZooKeeperに格納されるデータ量を大幅に削減します。

:::note
`use_minimalistic_part_header_in_zookeeper = 1`を適用後、その設定をサポートしていないバージョンのClickHouseサーバーにダウングレードすることはできません。クラスタ上のサーバーでClickHouseをアップグレードする際は注意してください。一度にすべてのサーバーをアップグレードしないでください。新しいバージョンのClickHouseをテスト環境で、またはクラスタのいくつかのサーバーでテストする方が安全です。

この設定で既に保存されたデータパートヘッダーは、以前の（非コンパクト）表現に復元することはできません。
:::

## distributed_ddl {#distributed_ddl}

クラスタ上で[分散DDLクエリ](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）の実行を管理します。 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper)が有効な場合のみ機能します。

`<distributed_ddl>`内の設定は次の通りです：

| 設定                  | 説明                                                                                                                     | デフォルト値            |
|----------------------|--------------------------------------------------------------------------------------------------------------------------|-------------------------|
| `path`               | DDLクエリの`task_queue`のKeeper内のパス                                                                                  |                         |
| `profile`            | DDLクエリを実行するために使用されるプロファイル                                                                          |                         |
| `pool_size`          | 何件の`ON CLUSTER`クエリを同時に実行できるか                                                                                 |                         |
| `max_tasks_in_queue` | キュー内に存在できるタスクの最大数                                                                                          | `1,000`                 |
| `task_max_lifetime`  | ノードの年齢がこの値を超える場合、ノードを削除します。                                                                     | `7 * 24 * 60 * 60`（週ごとに秒） |
| `cleanup_delay_period` | 新しいノードイベントが受信された後に、前回のクリーンアップが`cleanup_delay_period`秒未満で行われていない場合にクリーンアップが開始されます。 | `60`秒                   |

**例**

```xml
<distributed_ddl>
    <!-- ZooKeeper内のDDLクエリを処理するためのキューへのパス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- このプロファイルからの設定がDDLクエリを実行するために使用されます -->
    <profile>default</profile>

    <!-- 同時に実行できるON CLUSTERクエリの制御。 -->
    <pool_size>1</pool_size>

    <!--
        クリーンアップ設定（アクティブなタスクは削除されません）
    -->

    <!-- タスクTTLの制御（デフォルトは1週間） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- クリーンアップを行う頻度の制御（秒単位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- キュー内に存在できるタスク数の制御 -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## access_control_path {#access_control_path}

ClickHouseサーバーがSQLコマンドで作成されたユーザーとロールの設定を保存するフォルダーへのパス。

**参考**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)

## allow_plaintext_password {#allow_plaintext_password}

プレーンテキストパスワードタイプ（安全でない）の使用を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow_no_password {#allow_no_password}

no_passwordという安全でないパスワードタイプの使用を許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```

## allow_implicit_no_password {#allow_implicit_no_password}

'IDENTIFIED WITH no_password'が明示的に指定されていない限り、パスワードなしのユーザーを作成することを禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## default_session_timeout {#default_session_timeout}

デフォルトのセッションタイムアウト（秒単位）。

```xml
<default_session_timeout>60</default_session_timeout>
```

## default_password_type {#default_password_type}

`CREATE USER u IDENTIFIED BY 'p'`のようなクエリに対して自動的に設定されるパスワードタイプを設定します。

受け入れ可能な値は以下です：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```

## user_directories {#user_directories}

設定ファイルのセクションで、以下の設定を含みます：
- 事前定義されたユーザーの設定ファイルへのパス。
- SQLコマンドで作成されたユーザーを保存するフォルダーへのパス。
- SQLコマンドで作成され、レプリケートされるユーザーのZooKeeperノードパス（実験的）。

このセクションが指定されている場合、[users_config](/operations/server-configuration-parameters/settings#users_config)および[access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path)のパスは使用されません。

`user_directories`セクションには任意の数の項目が含まれることができ、項目の順序はその優先順位を意味します（上にあるほど優先順位が高い）。

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

ユーザー、ロール、行ポリシー、クオータ、およびプロファイルはZooKeeperに保存することも可能です：

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

また、情報をディスクに書き込まずにメモリのみで保存する`memory`セクションや、LDAPサーバーに情報を保存する`ldap`セクションを定義することもできます。

ローカルで定義されていないリモートユーザーのLDAPサーバーをユーザーディレクトリとして追加する場合は、以下の設定を持つ単一の`ldap`セクションを定義します：

| 設定   | 説明                                                                                                                                                                                                                                    |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | `ldap_servers`設定セクションで定義されているLDAPサーバー名の1つ。必須で空にすることはできません。                                                                                                                                 |
| `roles`  | LDAPサーバーから取得された各ユーザーに割り当てられるローカルで定義されたロールのリストを含むセクション。ロールが指定されていない場合、ユーザーは認証後に何のアクションも実行できません。認証時にリストのいずれかのロールがローカルで定義されていない場合、認証の試行は失敗します。 |

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

各エントリが`<name>/path/to/file</name>`形式のカスタムのトップレベルドメインのリストを定義します。

例えば：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

参考：
- 関数[`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom)およびそのバリエーションは、
  カスタムTLDリスト名を受け取り、重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分を返します。

## proxy {#proxy}

HTTPとHTTPSリクエスト用のプロキシサーバーを定義します。現在、S3ストレージ、S3テーブル関数、およびURL関数でサポートされています。

プロキシサーバーを定義する方法は3つあります：
- 環境変数
- プロキシリスト
- リモートプロキシリゾルバー

特定のホストに対してプロキシサーバーをバイパスすることも、`no_proxy`を使用してサポートされています。

**環境変数**

`http_proxy`および`https_proxy`環境変数を使用して、特定のプロトコル用のプロキシサーバーを指定できます。システム上で設定されている場合、シームレスに機能するはずです。

これは、特定のプロトコルに対して1つのプロキシサーバーしかない場合に最も簡単なアプローチです。

**プロキシリスト**

このアプローチでは、プロトコル用の1つ以上のプロキシサーバーを指定できます。複数のプロキシサーバーが定義されている場合、ClickHouseはラウンドロビン式で異なるプロキシを使用して、サーバー間で負荷をバランスします。これは、プロトコルに対して1つ以上のプロキシサーバーがある場合に最も簡単なアプローチです。

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

以下のタブで親フィールドを選択すると、その子要素を表示できます：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド   | 説明                                   |
|--------------|----------------------------------------|
| `<http>`     | 1つ以上のHTTPプロキシのリスト             |
| `<https>`    | 1つ以上のHTTPSプロキシのリスト            |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド   | 説明                      |
|--------------|---------------------------|
| `<uri>`      | プロキシのURI             |

  </TabItem>
</Tabs>

**リモートプロキシリゾルバー**

プロキシサーバーが動的に変化する可能性があります。その場合、リゾルバーのエンドポイントを定義できます。ClickHouseはそのエンドポイントに空のGETリクエストを送信し、リモートリゾルバーはプロキシホストを返す必要があります。ClickHouseは次のテンプレートを使用してプロキシURIを形成します：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

以下のタブで親フィールドを選択すると、その子要素を表示できます：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド    | 説明                                   |
|---------------|----------------------------------------|
| `<http>`      | 1つ以上のリゾルバーのリスト*                |
| `<https>`     | 1つ以上のリゾルバーのリスト*                |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド      | 説明                                     |
|----------------|------------------------------------------|
| `<resolver>`    | リゾルバーのエンドポイントおよびその他の詳細 |

  </TabItem>
</Tabs>

:::note
複数の`<resolver>`要素を持つことはできますが、特定のプロトコルに対して最初の`<resolver>`のみが使用されます。そのプロトコルに対する他の`<resolver>`要素は無視されます。これは、負荷分散が必要な場合はリモートリゾルバーによって実装されるべきであることを意味します。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| フィールド                | 説明                                                                                         |
|--------------------------|----------------------------------------------------------------------------------------------|
| `<endpoint>`             | プロキシリゾルバーのURI                                                                     |
| `<proxy_scheme>`         | 最終プロキシURIのプロトコル。これは`http`または`https`のいずれかです。                                   |
| `<proxy_port>`           | プロキシリゾルバーのポート番号                                                               |
| `<proxy_cache_time>`     | リゾルバーからの値がClickHouseによってキャッシュされる秒数。0に設定すると、ClickHouseはすべてのHTTPまたはHTTPSリクエストのたびにリゾルバーに連絡します。 |

  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は以下の順序で決定されます：

| 順序 | 設定                    |
|------|-------------------------|
| 1.   | リモートプロキシリゾルバー |
| 2.   | プロキシリスト             |
| 3.   | 環境変数                  |

ClickHouseは、要求されたプロトコルのために最も優先度の高いリゾルバータイプをチェックします。定義されていない場合は、次に高い優先順位のリゾルバータイプをチェックし、環境リゾルバーに達します。これにより、リゾルバータイプの混合も使用できます。

## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

デフォルトでは、トンネリング（つまり、`HTTP CONNECT`）は`HTTP`プロキシを介して`HTTPS`リクエストを行うために使用されます。この設定を使用して無効にできます。

**no_proxy**

デフォルトでは、すべてのリクエストはプロキシを経由します。特定のホストに対してこれを無効にするには、`no_proxy`変数を設定する必要があります。
これは、リストおよびリモートリゾルバーの`<proxy>`句内で設定することができ、環境リゾルバーの環境変数として設定することもできます。
IPアドレス、ドメイン、サブドメイン、および全体のバイパス用の`'*'`ワイルドカードをサポートします。リーディングドットは、curlのように取り除かれます。

**例**

以下の設定では、`clickhouse.cloud`およびそのすべてのサブドメイン（例：`auth.clickhouse.cloud`）へのプロキシリクエストをバイパスします。
GitLabにも同じことが当てはまりますが、先頭にドットがあります。`gitlab.com`と`about.gitlab.com`の両方がプロキシをバイパスします。

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

すべての`CREATE WORKLOAD`および`CREATE RESOURCE`クエリのストレージとして使用されるディレクトリ。デフォルトでは、サーバー作業ディレクトリの下に`/workload/`フォルダが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**参考**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)

## workload_zookeeper_path {#workload_zookeeper_path}

すべての`CREATE WORKLOAD`および`CREATE RESOURCE`クエリのストレージとして使用されるZooKeeperノードへのパス。このパス上にすべてのSQL定義が単一のznodeの値として保存されます。デフォルトではZooKeeperは使用されず、定義は[ディスク](#workload_path)に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**参考**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
