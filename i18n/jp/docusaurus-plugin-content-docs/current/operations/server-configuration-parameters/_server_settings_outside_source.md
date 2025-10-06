

## asynchronous_metric_log {#asynchronous_metric_log}

ClickHouse Cloud のデプロイメントではデフォルトで有効になっています。

環境でデフォルトでこの設定が有効になっていない場合は、ClickHouse のインストール方法によって、以下の手順に従って有効または無効にすることができます。

**有効化**

非同期メトリックログの履歴収集を手動でオンにするには [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)、次の内容で `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します。

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

プロキシ経由で接続されているクライアントの認証に元のアドレスを使用します。

:::note
この設定は、転送されたアドレスが簡単に偽装できるため、特に注意して使用する必要があります。このような認証を受け入れるサーバーには直接アクセスすることはせず、信頼できるプロキシを介してのみアクセスするべきです。
:::
## backups {#backups}

`BACKUP TO File()` 書き込み時に使用されるバックアップの設定。

以下の設定はサブタグによって構成できます：

| Setting                             | Description                                                                                                                                                                    | Default |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                      | `File()`使用時のバックアップパス。この設定は `File` を使用するために設定する必要があります。パスはインスタンスディレクトリに対して相対であるか、絶対であることができます。              | `true`  |
| `remove_backup_files_after_failure` | `BACKUP` コマンドが失敗した場合、ClickHouseは失敗前にバックアップにコピーされたファイルを削除しようとします。そうでなければ、コピーされたファイルはそのまま残ります。 | `true`  |

この設定はデフォルトでは次のように構成されています：

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## bcrypt_workfactor {#bcrypt_workfactor}

[Bcryptアルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)を使用する `bcrypt_password` 認証タイプの作業係数。
作業係数は、ハッシュの計算とパスワードの確認に必要な計算と時間の量を定義します。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
高頻度認証を使用するアプリケーションの場合、
bcryptの計算オーバーヘッドを考慮して
代替の認証方法を検討してください。
:::
## table_engines_require_grant {#table_engines_require_grant}

true に設定されている場合、ユーザーは特定のエンジンを使用してテーブルを作成するための権限を必要とします。例： `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
デフォルトでは、後方互換性のために特定のテーブルエンジンを使用してテーブルを作成する際には権限が無視されますが、これを true に設定することでこの動作を変更できます。
:::
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

組み込みの辞書を再ロードする間隔（秒単位）。

ClickHouseはx秒ごとに組み込み辞書を再ロードします。これにより、サーバーを再起動せずに辞書を「オンザフライ」で編集することが可能になります。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)エンジンテーブルのデータ圧縮設定。

:::note
ClickHouseを使い始めたばかりの場合は、これを変更しないことをお勧めします。
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

- `min_part_size` – データパーツの最小サイズ。
- `min_part_size_ratio` – データパーツサイズとテーブルサイズの比率。
- `method` – 圧縮方法。許容される値： `lz4`, `lz4hc`, `zstd`,`deflate_qpl`。
- `level` – 圧縮レベル。詳細は [Codecs](/sql-reference/statements/create/table#general-purpose-codecs) を参照してください。

:::note
複数の `<case>` セクションを構成できます。
:::

**条件が満たされた場合のアクション**:

- データパーツが設定された条件に一致する場合、ClickHouseは指定された圧縮方法を使用します。
- データパーツが複数の条件セットに一致する場合、ClickHouseは最初に一致した条件セットを使用します。

:::note
データパーツに対して条件が満たされない場合、ClickHouseは `lz4` 圧縮を使用します。
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

[暗号化コーデックス](/sql-reference/statements/create/table#encryption-codecs)に使用されるキーを取得するコマンドを構成します。キー（または複数のキー）は環境変数に記述されるか、構成ファイルで設定される必要があります。

キーは16バイトの長さを持つ16進数または文字列であることができます。

**例**

設定からの読み込み:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
構成ファイルにキーを保存することは推奨されません。それは安全ではありません。キーを安全なディスク上の別の構成ファイルに移動し、その構成ファイルへのシンボリックリンクを `config.d/` フォルダーに置くことができます。
:::

構成からの読み込み、キーが16進数の場合：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

環境変数からのキーの読み込み：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

ここで `current_key_id` は暗号化のための現在のキーを設定し、すべての指定されたキーは復号化に使用できます。

これらの方法は複数のキーに適用できます：

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

また、ユーザーは長さ12バイトでなければならないノンスを追加することができます（デフォルトでは、暗号化及び復号化プロセスはゼロバイトからなるノンスを使用します）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

または、16進数で設定することもできます：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上記のすべては `aes_256_gcm_siv` に適用できます（ただし、キーは32バイトの長さでなければなりません）。
:::
## error_log {#error_log}

デフォルトでは無効です。

**有効化**

エラーヒストリー収集を手動でオンにするには[`system.error_log`](../../operations/system-tables/error_log.md)、次の内容で `/etc/clickhouse-server/config.d/error_log.xml` を作成します。

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

[カスタム設定](/operations/settings/query-level#custom_settings) のためのプレフィックスのリスト。プレフィックスはコンマで区切る必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**参照**

- [カスタム設定](/operations/settings/query-level#custom_settings)
## core_dump {#core_dump}

コアダンプファイルサイズのソフトリミットを構成します。

:::note
ハードリミットはシステムツールを介して構成されます。
:::

**例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## default_profile {#default_profile}

デフォルト設定プロファイル。設定プロファイルは `user_config` 設定で指定されたファイルにあります。

**例**

```xml
<default_profile>default</default_profile>
```
## dictionaries_config {#dictionaries_config}

辞書用の設定ファイルのパス。

パス：

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにはワイルドカード * と ? を含めることができます。

詳細：
- "[辞書](../../sql-reference/dictionaries/index.md)"。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

実行可能なユーザー定義関数用の設定ファイルのパス。

パス：

- 絶対パスまたはサーバー設定ファイルに対する相対パスを指定します。
- パスにはワイルドカード * と ? を含めることができます。

詳細：
- "[実行可能ユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)。".

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## format_schema_path {#format_schema_path}

入力データのスキーム用のディレクトリのパス、例えば [CapnProto](../../interfaces/formats.md#capnproto) フォーマットのスキーム。

**例**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## graphite {#graphite}

[Graphite](https://github.com/graphite-project) へデータを送信します。

設定：

- `host` – Graphite サーバー。
- `port` – Graphite サーバーのポート。
- `interval` – 送信の間隔（秒）。
- `timeout` – データ送信のタイムアウト（秒）。
- `root_path` – キーのプレフィックス。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからのデータ送信。
- `events` – [system.events](/operations/system-tables/events) テーブルからの一定期間に蓄積されたデルタデータの送信。
- `events_cumulative` – [system.events](/operations/system-tables/events) テーブルからの累積データの送信。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルからのデータ送信。

複数の `<graphite>` クローズを構成できます。たとえば、異なる間隔で異なるデータを送信するために使用できます。

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

Graphite 用のデータの細分化設定。

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
## google_protos_path {#google_protos_path}

Protobuf タイプの proto ファイルが含まれるディレクトリを定義します。

例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

カスタム HTTP ハンドラを使用できるようにします。新しい HTTP ハンドラを追加するには、新しい `<rule>` を追加してください。ルールは上から下にチェックされ、最初に一致したものがハンドラを実行します。

以下の設定はサブタグによって構成できます：

| Sub-tags             | Definition                                                                                                                                        |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | リクエスト URL を一致させるために、'regex:' プレフィックスを使用して正規表現マッチを利用することができます（オプション）                                                    |
| `methods`            | リクエストメソッドを一致させるために、複数のメソッドマッチをカンマで区切ることができます（オプション）                                                 |
| `headers`            | リクエストヘッダーを一致させるために、各子要素を一致させます（子要素名はヘッダー名）、正規表現マッチを使用するには 'regex:' プレフィックスを使用できます（オプション）  |
| `handler`            | リクエストハンドラ                                                                                                                               |
| `empty_query_string` | URL にクエリ文字列が存在しないことを確認します                                                                                                  |

`handler` は以下の設定を含み、サブタグによって構成できます：

| Sub-tags           | Definition                                                                                                                                                            |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | リダイレクト先                                                                                                                                                       |
| `type`             | サポートされているタイプ： static, dynamic_query_handler, predefined_query_handler, redirect                                                                              |
| `status`           | 静的タイプで使用、レスポンスステータスコード                                                                                                                        |
| `query_param_name` | dynamic_query_handler タイプで使用、HTTP リクエストパラメータ内の `<query_param_name>` に対応する値を抽出および実行します                                                |
| `query`            | predefined_query_handler タイプで使用、ハンドラが呼び出されるときにクエリを実行します                                                                                             |
| `content_type`     | 静的タイプで使用、レスポンスのコンテンツタイプ                                                                                                                        |
| `response_content` | 静的タイプで使用、クライアントに送信されるレスポンスコンテンツ。'file://' または 'config://' プレフィックスを使用する際は、ファイルまたは設定からコンテンツを見つけてクライアントへ送信します |

ルールのリストに加えて、デフォルトハンドラをすべて有効にする `<defaults/>` を指定できます。

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
## http_server_default_response {#http_server_default_response}

ClickHouse HTTP(s) サーバーにアクセスしたときにデフォルトで表示されるページ。
デフォルト値は「Ok.」（行末に改行あり）です。

**例**

`http://localhost: http_port` にアクセスすると `https://tabix.io/` を開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

`OPTIONS` HTTP リクエストにヘッダーを追加するために使用されます。
`OPTIONS` メソッドは CORS プレフライトリクエストを行う際に使用されます。

詳細は [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS) を参照してください。

**例**

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

HSTS の有効期限（秒単位）。

:::note
`0` の値は ClickHouse が HSTS を無効にすることを意味します。正の数を設定すると、HSTS が有効になり、max-age は設定した数値になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

起動後に `mlockall` を実行して最初のクエリのレイテンシを低下させ、高負荷 IO 環境下で ClickHouse 実行ファイルがページアウトされるのを防ぎます。

:::note
このオプションを有効にすることは推奨されていますが、起動時間が数秒増加します。
この設定は "CAP_IPC_LOCK" 機能がないと機能しないことに注意してください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

置換を含むファイルのパス。XML および YAML 形式の両方がサポートされています。

詳細は "[設定ファイル](/operations/configuration-files)" のセクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

ClickHouse サーバー間でデータを交換できるホストに制限をかけます。
Keeper を使う場合、異なる Keeper インスタンス間のコミュニケーションにも同じ制限が適用されます。

:::note
デフォルトでは、この値は [`listen_host`](#listen_host) 設定と同じです。
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

省略した場合は、 `hostname -f` コマンドと同様に定義されます。

特定のネットワークインターフェイスを外れたい場合に便利です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_https_port {#interserver_https_port}

`HTTPS` 経由で ClickHouse サーバー間のデータを交換するためのポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_https_host {#interserver_https_host}

[`interserver_http_host`](#interserver_http_host) と同様ですが、このホスト名は他のサーバーがこのサーバーに `HTTPS` 経由でアクセスするために使用できます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)中に他のサーバーに接続するために使用されるユーザー名とパスワード。さらに、サーバーはこれらの資格情報を使用して他のレプリカを認証します。
`interserver_http_credentials` はクラスタ内のすべてのレプリカで同じである必要があります。

:::note
- デフォルトでは、`interserver_http_credentials` セクションが省略された場合、レプリケーション中に認証は使用されません。
- `interserver_http_credentials` 設定は ClickHouse クライアント資格情報の [構成](../../interfaces/cli.md#configuration_files) とは関連しません。
- これらの資格情報は `HTTP` および `HTTPS` 経由のレプリケーション共通です。
:::

以下の設定はサブタグによって構成できます：

- `user` — ユーザー名。
- `password` — パスワード。
- `allow_empty` — `true` の場合、資格情報が設定されていても認証なしで他のレプリカの接続が許可されます。`false` の場合、認証なしの接続は拒否されます。デフォルト：`false`。
- `old` — 資格情報のローテーション中に使用された古い `user` と `password` を含みます。複数の `old` セクションを指定できます。

**資格情報ローテーション**

ClickHouse は、すべてのレプリカの設定を同時に更新することなく動的なインタサーバー資格情報ローテーションをサポートしています。資格情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、資格情報を追加します。これにより、認証ありおよびなしの接続が許可されます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカが構成された後、`allow_empty` を `false` に設定するか、この設定を削除します。これにより、新しい資格情報による認証が必須になります。

既存の資格情報を変更するには、ユーザー名とパスワードを `interserver_http_credentials.old` セクションに移動し、`user` と `password` を新しい値で更新します。この時点で、サーバーは他のレプリカに接続するために新しい資格情報を使用し、新旧の資格情報がどちらでも接続を受け付けます。

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

すべてのレプリカに新しい資格情報が適用されたら、古い資格情報は削除される可能性があります。
## ldap_servers {#ldap_servers}

以下の接続パラメータを持つ LDAP サーバーのリスト：
- 'password' の代わりに 'ldap' 認証メカニズムが指定された専用のローカルユーザーの認証に使用します。
- リモートユーザーディレクトリとして使用します。

以下の設定はサブタグによって構成できます：

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP サーバーのホスト名または IP、これは必須で空にすることはできません。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP サーバーのポート、`enable_tls` が true に設定されている場合はデフォルトで 636、そうでない場合は 389 です。                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                      | バインド用 DN を構成するために使用されるテンプレート。結果として得られる DN は、各認証試行中にテンプレートのすべての `\{user_name\}` サブストリングを実際のユーザー名に置き換えることによって構成されます。                                                                                                                                                                                                                               |
| `user_dn_detection`            | バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータを含むセクション。これは主に Active Directory でサーバーが役割をマッピングする際に使用される検索フィルタで使用されます。結果として得られるユーザー DN は、許可されている場所のすべてで `\{user_dn\}` を置き換える際に使用されます。デフォルトでは、ユーザー DN はバインド DN に設定されますが、検索が実行されると、実際の検出されたユーザー DN 値で更新されます。 |
| `verification_cooldown`        | 成功したバインドの試行後、ユーザーが LDAP サーバーに連絡することなくすべての連続リクエストに対して認証されると見なされる期間（秒単位）。キャッシュを無効にして LDAP サーバーへの各認証リクエストの強制アクセスを行うには `0` （デフォルト）を指定します。                                                                                                                  |
| `enable_tls`                   | LDAP サーバーへの安全な接続をトリガーするフラグ。平文の (`ldap://`) プロトコル（推奨されません）の場合は `no` を指定します。SSL/TLS（`ldaps://`）プロトコル（推奨、デフォルト）の場合は `yes` を指定します。レガシー StartTLS プロトコル（平文 `ldap://` プロトコル、TLS にアップグレード）には `starttls` を指定します。                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLS の最小プロトコルバージョン。許可される値は： `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）。                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`             | SSL/TLS ピア証明書の検証動作。許可される値は： `never`, `allow`, `try`, `demand` （デフォルト）。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 証明書ファイルのパス。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 証明書鍵ファイルのパス。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA 証明書ファイルのパス。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | CA 証明書が含まれるディレクトリのパス。                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 許可される暗号スイート（OpenSSL 表記）。                                                                                                                                                                                                                                                                                                                                                                                              |

`user_dn_detection` を設定する場合は、サブタグで構成できます：

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP 検索のために構成されるベース DN を生成するために使用されるテンプレート。結果として得られる DN は、LDAP 検索中にテンプレートのすべての `\{user_name\}` と '\{bind_dn\}' サブストリングを実際のユーザー名とバインド DN に置き換えることによって構成されます。                                                                                                       |
| `scope`         | LDAP 検索のスコープ。許可される値は： `base`, `one_level`, `children`, `subtree`（デフォルト）。                                                                                                                                                                                                                                       |
| `search_filter` | LDAP 検索のための検索フィルタを生成するために使用されるテンプレート。結果として得られるフィルタは、LDAP 検索中にテンプレートのすべての `\{user_name\}`、`\{bind_dn\}`、および `\{base_dn\}` サブストリングを実際のユーザー名、バインド DN、およびベース DN に置き換えることによって構成されます。特別な文字は XML で適切にエスケープされる必要があります。  |

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

例（一般的な Active Directory で、役割マッピングのためにユーザー DN 検出が構成されています）：

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

リクエストが来るホストに制限をかけます。サーバーにすべてのリクエストに応答させたい場合は、`::` を指定してください。

例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

IPv6 または IPv4 ネットワークが使用できない場合、サーバーは終了しません。

**例**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

複数のサーバーが同じアドレス:ポートでリッスンできるようにします。リクエストはOSによってランダムなサーバーにルーティングされます。この設定を有効にすることは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

タイプ：

デフォルト：
## listen_backlog {#listen_backlog}

リッスンソケットのバックログ（保留中の接続のキューサイズ）。デフォルト値の `4096` は linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4) と同じです。

通常、この値を変更する必要はなく、理由は次のとおりです：
- デフォルト値は十分に大きい、
- クライアントの接続を受け入れるためにサーバーには別のスレッドがあります。

したがって、 `TcpExtListenOverflows` （`nstat` から）の値がゼロでなく、このカウンターが ClickHouse サーバーで増加しても、この値を増加させる必要があるとは限りません。理由は次のとおりです：
- 通常、 `4096` が不十分であれば、何らかの内部 ClickHouse スケーリングの問題を示しているため、問題を報告する方が良いでしょう。
- サーバーが後でより多くの接続を処理できるとは限りません（できたとしても、その時点でクライアントが切断されている可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

ログメッセージの場所と形式。

**キー**:

| キー                   | 説明                                                                                                                                                        |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | ログレベル。受け入れ可能な値: `none`（ログをオフにする）、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`         |
| `log`                  | ログファイルへのパス。                                                                                                                                      |
| `errorlog`             | エラーログファイルへのパス。                                                                                                                                 |
| `size`                 | ローテーションポリシー: ログファイルの最大サイズ（バイト単位）。ログファイルのサイズがこの閾値を超えると、名前が変更されてアーカイブされ、新しいログファイルが作成されます。 |
| `count`                | ローテーションポリシー: Clickhouseが保持する最大の履歴ログファイル数。                                                                                       |
| `stream_compress`      | LZ4を使用してログメッセージを圧縮します。`1`または`true`に設定して有効にします。                                                                             |
| `console`              | コンソールへのログ出力を有効にします。`1`または`true`に設定して有効にします。Clickhouseがデーモンモードで実行されていない場合のデフォルトは `1`、そうでない場合は `0`。                    |
| `console_log_level`    | コンソール出力のログレベル。デフォルトは `level`。                                                                                                        |
| `formatting.type`      | コンソール出力用のログ形式。現在のところ `json` のみがサポートされています。                                                                                   |
| `use_syslog`           | ログ出力をsyslogに転送することもできます。                                                                                                                      |
| `syslog_level`         | syslogへのログ用のログレベル。                                                                                                                                 |
| `async`                | `true`の場合（デフォルト）、ロギングは非同期で行われます（出力チャネルごとに1つのバックグラウンドスレッド）。そうでない場合、LOGを呼び出しているスレッド内でログを記録します。     
| `async_queue_max_size` | 非同期ログを使用する場合、フラッシングを待つキュー内に保持するメッセージの最大数。余分なメッセージはドロップされます。                                           |
| `startup_level`        | サーバー起動時にルートロガーレベルを設定するために使用されるスタートアップレベル。起動後はログレベルが `level` 設定に戻される。                              |
| `shutdown_level`       | サーバーシャットダウン時にルートロガーレベルを設定するために使用されるシャットダウンレベル。                                                                      |

**ログ形式指定子**

`log` および `errorLog` パスのファイル名は、結果のファイル名に対して以下の形式指定子をサポートしています（ディレクトリ部分はサポートしていません）。

"Example" 列は `2023-07-06 18:32:07` での出力を示しています。

| 指定子    | 説明                                                                                                               | 例                       |
|-----------|--------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`      | リテラル %                                                                                                       | `%`                      |
| `%n`      | 改行文字                                                                                                          |                          |
| `%t`      | 水平タブ文字                                                                                                      |                          |
| `%Y`      | 10進数の年、例: 2017                                                                                                | `2023`                   |
| `%y`      | 年の下2桁を10進数で示す（範囲 [00,99]）                                                                          | `23`                     |
| `%C`      | 年の最初の2桁を10進数で示す（範囲 [00,99]）                                                                     | `20`                     |
| `%G`      | 4桁の[ISO 8601週ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)。指定された週を含む年。通常は `%V` と一緒に使用されます。 | `2023`                   |
| `%g`      | [ISO 8601週ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)の下2桁。指定された週を含む年。                                       | `23`                     |
| `%b`      | 短縮された月名、例: Oct（ロケール依存）                                                                            | `Jul`                    |
| `%h`      | `%b`の同義語                                                                                                     | `Jul`                    |
| `%B`      | 完全な月名、例: October（ロケール依存）                                                                            | `July`                   |
| `%m`      | 月を10進数で示す（範囲 [01,12]）                                                                                 | `07`                     |
| `%U`      | 年の週を10進数で示す（週の最初の日は日曜日）（範囲 [00,53]）                                                     | `27`                     |
| `%W`      | 年の週を10進数で示す（週の最初の日は月曜日）（範囲 [00,53]）                                                     | `27`                     |
| `%V`      | ISO 8601週番号（範囲 [01,53]）                                                                                   | `27`                     |
| `%j`      | 年のうちの日を10進数で示す（範囲 [001,366]）                                                                     | `187`                    |
| `%d`      | 月の日をゼロパディングされた10進数で示す（範囲 [01,31]）。1桁の数字はゼロで前置きされます。                     | `06`                     |
| `%e`      | 月の日をスペースパディングされた10進数で示す（範囲 [1,31]）。1桁の数字はスペースで前置きされます。                 | `&nbsp; 6`               |
| `%a`      | 短縮された曜日名、例: Fri（ロケール依存）                                                                          | `Thu`                    |
| `%A`      | 完全な曜日名、例: Friday（ロケール依存）                                                                          | `Thursday`               |
| `%w`      | 整数値としての曜日（0が日曜日）（範囲 [0-6]）                                                                     | `4`                      |
| `%u`      | 10進数による曜日（ISO 8601形式で月曜日を1とする）（範囲 [1-7]）                                               | `4`                      |
| `%H`      | 24時間制での時を10進数で示す（範囲 [00-23]）                                                                    | `18`                     |
| `%I`      | 12時間制での時を10進数で示す（範囲 [01,12]）                                                                    | `06`                     |
| `%M`      | 分を10進数で示す（範囲 [00,59]）                                                                                | `32`                     |
| `%S`      | 秒を10進数で示す（範囲 [00,60]）                                                                                | `07`                     |
| `%c`      | 標準の日付および時刻の文字列、例: Sun Oct 17 04:41:13 2010（ロケール依存）                                       | `Thu Jul  6 18:32:07 2023` |
| `%x`      | ローカライズされた日付表現（ロケール依存）                                                                      | `07/06/23`               |
| `%X`      | ローカライズされた時間表現、例: 18:40:20 または 6:40:20 PM（ロケール依存）                                       | `18:32:07`               |
| `%D`      | 短いMM/DD/YYの日付、%m/%d/%yに相当                                                                                | `07/06/23`               |
| `%F`      | 短いYYYY-MM-DDの日付、%Y-%m-%dに相当                                                                              | `2023-07-06`             |
| `%r`      | ローカライズされた12時間制の時間（ロケール依存）                                                                 | `06:32:07 PM`            |
| `%R`      | "%H:%M" に相当                                                                                                   | `18:32`                  |
| `%T`      | "%H:%M:%S"（ISO 8601時間形式）に相当                                                                             | `18:32:07`               |
| `%p`      | ローカライズされた午前または午後の表示（ロケール依存）                                                           | `PM`                     |
| `%z`      | ISO 8601形式でのUTCからのオフセット（例: -0430）、またはタイムゾーン情報がない場合は文字なし                        | `+0800`                  |
| `%Z`      | ロケール依存のタイムゾーン名または略称、またはタイムゾーン情報がない場合は文字なし                               | `Z AWST `                |

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

コンソールにのみログメッセージを出力するには:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベル別オーバーライド**

個々のログ名のログレベルをオーバーライドできます。たとえば、「Backup」と「RBAC」というロガーのすべてのメッセージをミュートする場合。

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

ログメッセージをsyslogにも書き込むには:

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

`<syslog>`のキー:

| キー        | 説明                                                                                                                                                                                                                                                    |
|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`   | `host[:]port`形式のsyslogのアドレス。省略した場合はローカルデーモンが使用されます。                                                                                                                                                                       |
| `hostname`  | ログが送信されるホストの名前（オプション）。                                                                                                                                                                                                           |
| `facility`  | syslogの[ファシリティキーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。必ず大文字で「LOG_」プレフィックスを付けて指定する必要があります。例: `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` など。`address`が指定されている場合はデフォルトは `LOG_USER`、そうでない場合は `LOG_DAEMON`。   |
| `format`    | ログメッセージの形式。可能な値: `bsd` と `syslog`。                                                                                                                                                                                                  |

**ログ形式**

コンソールログに出力されるログ形式を指定できます。現在のところ、JSONのみがサポートされています。

**例**

JSONログの出力例です:

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

JSONログサポートを有効にするには、次のスニペットを使用してください:

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

**JSONログのキー名の変更**

キー名は `<names>` タグ内のタグ値を変更することで変更できます。たとえば、`DATE_TIME` を `MY_DATE_TIME`に変更するには、`<date_time>MY_DATE_TIME</date_time>`を使用します。

**JSONログのキーの省略**

ログプロパティは、そのプロパティをコメントアウトすることで省略できます。たとえば、`query_id`を出力させたくない場合は、`<query_id>`タグをコメントアウトできます。

## send_crash_reports {#send_crash_reports}

ClickHouseコア開発者チームにクラッシュレポートを送信するための設定。

特にプレプロダクション環境でこれを有効にすることは非常に評価されます。

キー:

| キー                   | 説明                                                                                                                          |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | 機能を有効にするためのブールフラグ。デフォルトは `true`。クラッシュレポートを送信しないようにするには `false` に設定します。                       |
| `send_logical_errors` | `LOGICAL_ERROR` は `assert`のようなもので、ClickHouseのバグです。このブールフラグはこの例外の送信を有効にします（デフォルト: `true`）。  |
| `endpoint`            | クラッシュレポートを送信するエンドポイントURLを上書きできます。                                                                    |

**推奨使用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## ssh_server {#ssh_server}

ホストキーの公開部分は、最初の接続時にSSHクライアント側のknown_hostsファイルに書き込まれます。

ホストキー設定はデフォルトでは無効になっています。
ホストキー設定をコメント解除し、対応するSSHキーへのパスを提供して有効にします：

例:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## tcp_ssh_port {#tcp_ssh_port}

ユーザーが埋め込まれたクライアントを介して対話的にクエリを実行できるSSHサーバー用のポート。

例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```

## storage_configuration {#storage_configuration}

マルチディスクのストレージ構成を許可します。

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

### ディスクの構成 {#configuration-of-disks}

`disks`の構成は以下の構造に従います：

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

上記のサブタグは `disks` に対して以下の設定を定義します：

| 設定                     | 説明                                                                                          |
|-------------------------|------------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | ディスクの名前は、一意である必要があります。                                                   |
| `path`                  | サーバーデータが保存されるパス（`data`および`shadow`カタログ）。`/`で終わる必要があります。   |
| `keep_free_space_bytes` | ディスク上に予約される空きスペースのサイズ。                                                  |

:::note
ディスクの順序は重要ではありません。
:::

### ポリシーの構成 {#configuration-of-policies}

上記のサブタグは `policies` に対して以下の設定を定義します：

| 設定                      | 説明                                                                                                                                                                                                                                                                                                                                                             |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`           | ポリシーの名前。ポリシー名は一意である必要があります。                                                                                                                                                                                                                                                                                          |
| `volume_name_N`           | ボリュームの名前。ボリューム名は一意である必要があります。                                                                                                                                                                                                                                                                                         |
| `disk`                    | ボリューム内にあるディスク。                                                                                                                                                                                                                                                                                                                                      |
| `max_data_part_size_bytes`| このボリュームのすべてのディスクに格納される可能性のあるデータチャンクの最大サイズ。マージの結果、チャンクサイズが `max_data_part_size_bytes`を超える場合、そのチャンクは次のボリュームに書き込まれます。基本的にこの機能を使用すると、新しい / 小さなチャンクをホット（SSD）ボリュームに保存し、大きなサイズになるとコールド（HDD）ボリュームに移動できます。このオプションはポリシーが1つのボリュームのみの場合は使用しないでください。 |
| `move_factor`             | ボリュームの空きスペースの割合。空きスペースが不足すると、データは次のボリュームに転送され始めます。転送のために、チャンクはサイズに基づいて大きいものから小さいものへ（降順）ソートされ、`move_factor`条件を満たすチャンクが選択されます。すべてのチャンクの合計サイズが不足している場合は、すべてのチャンクが移動されます。                                |
| `perform_ttl_move_on_insert`| 挿入時に期限切れのTTLを持つデータを移動させないようにします。デフォルト（有効）で、ライフルールで期限切れたデータを挿入すると、それは直ちに移動ルールで指定されたボリューム / ディスクに移動されます。ターゲットボリューム / ディスクが遅い場合（例: S3）は、挿入速度が大幅に低下する可能性があります。無効にすると、期限切れ部分のデータはデフォルトのボリュームに書き込まれ、その後ルールに従って期限切れのTTLが指定されたボリュームに直ちに移動されます。 |
| `load_balancing`          | ディスクバランスのポリシー、`round_robin`または`least_used`。                                                                                                                                                                                                                                                                              |
| `least_used_ttl_ms`       | すべてのディスクで利用可能なスペースを更新するためのタイムアウト（ミリ秒単位）を設定します（`0` - いつでも更新、`-1` - 決して更新しない、デフォルト値は`60000`）。ClickHouseのみに使用され、ファイルシステムのサイズ変更が行われない場合は値 `-1` を使用できます。他のケースでは、最終的に不正確なスペース割り当てを引き起こすため、推奨されません。                                                   |
| `prefer_not_to_merge`     | このボリュームのデータのマージを無効にします。この設定が有効になると（行わないでください）、このボリュームのデータのマージは禁止されます（これは悪い結果を生む可能性があります）。これによりClickHouseが遅いディスクとどのように相互作用するかを制御できます。このオプションは全く使用すべきではないと推奨されます。                                                                  |
| `volume_priority`         | ボリュームの埋め方の優先順位（順序）を定義します。値が小さいほど優先順位が高くなります。このパラメータの値は自然数で、1からN（Nは指定された最大パラメータ値）までの範囲を網羅し、ギャップがない必要があります。                                                                                                                                                                    |

`volume_priority`について:
- すべてのボリュームがこのパラメータを持っている場合は、指定された順序で優先順位が設定されます。
- このパラメータを持つボリュームが一部だけの場合は、持たないボリュームが最低の優先順位となります。このパラメータを持つボリュームはタグの値に基づいて優先され、その他のボリュームの優先度は構成ファイル内の記述順によって決まります。
- すべてのボリュームがこのパラメータを持たない場合は、記述の順序に基づいて優先度が決まります。
- ボリュームの優先度が同一であってはなりません。

## macros {#macros}

レプリケートテーブルのパラメータ置換。

レプリケートテーブルを使用しない場合は省略可能です。

詳細については、[レプリケートテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)のセクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```

## replica_group_name {#replica_group_name}

データベース `Replicated` のレプリカグループ名。

`Replicated`データベースによって作成されたクラスタは、同じグループ内のレプリカで構成されます。
DDLクエリは同じグループ内のレプリカのみ待機します。

デフォルトは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```

## remap_executable {#remap_executable}

ヒュージページを使用してマシンコード（"text"）のためのメモリを再割り当てするための設定。

:::note
この機能は非常に実験的です。
:::

例:

```xml
<remap_executable>false</remap_executable>
```

## max_open_files {#max_open_files}

オープンファイルの最大数。

:::note
`getrlimit()`関数が不正確な値を返すため、macOSではこのオプションの使用を推奨します。
:::

**例**

```xml
<max_open_files>262144</max_open_files>
```

## max_session_timeout {#max_session_timeout}

最大セッションタイムアウト（秒単位）。

例:

```xml
<max_session_timeout>3600</max_session_timeout>
```

## merge_tree {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)のテーブルの微調整のためのもの。

詳細については、MergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## metric_log {#metric_log}

デフォルトで無効です。

**有効化**

メトリック履歴収集を手動で有効にするには [`system.metric_log`](../../operations/system-tables/metric_log.md)、次の内容で `/etc/clickhouse-server/config.d/metric_log.xml` を作成します：

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

`metric_log`設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_metric_log.xml` を作成する必要があります：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## replicated_merge_tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md)のテーブルの微調整のためのもの。この設定の優先度は高いです。

詳細については、MergeTreeSettings.hヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```

## opentelemetry_span_log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md)システムテーブルの設定。

<SystemLogParameters/>

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

SSL クライアント/サーバーの構成。

SSL のサポートは `libpoco` ライブラリによって提供されます。利用可能な構成オプションは [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) に説明されています。デフォルト値は [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) にあります。

サーバー/クライアント設定のためのキー：

| オプション                       | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                            | デフォルト値                              |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`                 | PEM 証明書の秘密鍵を含むファイルのパス。ファイルには鍵と証明書を同時に含めることができます。                                                                                                                                                                                                                                                                                                                                                                  |                                            |
| `certificateFile`                | PEM 形式のクライアント/サーバー証明書ファイルのパス。`privateKeyFile` に証明書が含まれている場合は、省略できます。                                                                                                                                                                                                                                                                                                                                            |                                            |
| `caConfig`                       | 信頼できる CA 証明書を含むファイルまたはディレクトリのパス。このパスがファイルを指す場合、PEM 形式であり、複数の CA 証明書を含むことができます。このパスがディレクトリを指す場合、CA 証明書ごとに 1 つの .pem ファイルを含む必要があります。ファイル名は CA サブジェクト名のハッシュ値で検索されます。詳細は [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) のマニュアルページにあります。 |                                            |
| `verificationMode`               | ノードの証明書をチェックする方法。詳細は [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明にあります。可能な値: `none`, `relaxed`, `strict`, `once`。                                                                                                                                                                                                  | `relaxed`                                  |
| `verificationDepth`              | 検証チェーンの最大長。証明書チェーンの長さが設定した値を超えると、検証が失敗します。                                                                                                                                                                                                                                                                                                                                                                        | `9`                                        |
| `loadDefaultCAFile`              | OpenSSL の組み込み CA 証明書を使用するかどうか。ClickHouse は、組み込み CA 証明書がファイル `/etc/ssl/cert.pem` (またはディレクトリ `/etc/ssl/certs`) にあると仮定するか、環境変数 `SSL_CERT_FILE` (または `SSL_CERT_DIR`) で指定されたファイル (またはディレクトリ) にあると仮定します。                                                                                                                                | `true`                                     |
| `cipherList`                     | サポートされている OpenSSL 暗号化。                                                                                                                                                                                                                                                                                                                                                                                                                                     | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`                  | セッションキャッシュを有効または無効にします。`sessionIdContext` と組み合わせて使用する必要があります。許可される値: `true`, `false`。                                                                                                                                                                                                                                                                                                                       | `false`                                    |
| `sessionIdContext`               | サーバーが生成した各識別子に追加する一意のランダム文字列。文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはいけません。このパラメータは、サーバーがセッションをキャッシュし、クライアントがキャッシュを要求した場合の問題を回避するのに役立つため、常に推奨されます。                                                                                                                                                            | `$\{application.name\}`                   |
| `sessionCacheSize`               | サーバーがキャッシュするセッションの最大数。`0` の値は無制限のセッションを意味します。                                                                                                                                                                                                                                                                                                                                                                              | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                             |
| `sessionTimeout`                 | サーバー上でのセッションキャッシュの時間 (時間単位)。                                                                                                                                                                                                                                                                                                                                                                                                          | `2`                                        |
| `extendedVerification`           | 有効な場合、証明書の CN または SAN がピアホスト名と一致することを確認します。                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |
| `requireTLSv1`                   | TLSv1 接続を要求します。許可される値: `true`, `false`。                                                                                                                                                                                                                                                                                                                                                                                                     | `false`                                    |
| `requireTLSv1_1`                 | TLSv1.1 接続を要求します。許可される値: `true`, `false`。                                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                    |
| `requireTLSv1_2`                 | TLSv1.2 接続を要求します。許可される値: `true`, `false`。                                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                    |
| `fips`                           | OpenSSL FIPS モードを有効にします。ライブラリの OpenSSL バージョンが FIPS をサポートしている場合にサポートされます。                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `privateKeyPassphraseHandler`    | プライベートキーにアクセスするためのパスフレーズを要求するクラス (PrivateKeyPassphraseHandler サブクラス)。例: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`。                                                                                                                                                       | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`      | 無効な証明書を検証するためのクラス (CertificateHandler のサブクラス)。例: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` 。                                                                                                                                                                                                                                                                          | `RejectCertificateHandler`                 |
| `disableProtocols`               | 使用が許可されていないプロトコル。                                                                                                                                                                                                                                                                                                                                                                                                                              |                                            |
| `preferServerCiphers`            | クライアントが優先するサーバー暗号。                                                                                                                                                                                                                                                                                                                                                                                                                                    | `false`                                    |

**設定の例:**

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
## part_log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) に関連するロギングイベント。たとえば、データの追加やマージなど。マージアルゴリズムをシミュレートして、その特性を比較するためにログを使用できます。マージプロセスを視覚化することもできます。

クエリは [system.part_log](/operations/system-tables/part_log) テーブルにログされます。別のファイルにはログされません。このテーブルの名前は `table` パラメータで設定できます (以下を参照)。

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

データを含むディレクトリへのパス。

:::note
末尾のスラッシュは必須です。
:::

**例**

```xml
<path>/var/lib/clickhouse/</path>
```
## processors_profile_log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) システムテーブルの設定。

<SystemLogParameters/>

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

[Prometheus](https://prometheus.io) からスクレイピングするためのメトリクスデータを公開します。

設定：

- `endpoint` – prometheus サーバーによるメトリクスのスクレイピング用の HTTP エンドポイント。'/' から始めます。
- `port` – `endpoint` のポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開します。
- `events` – [system.events](/operations/system-tables/events) テーブルからメトリクスを公開します。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開します。
- `errors` - 最後のサーバー再起動以降に発生したエラーコードごとのエラーの数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。

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

確認 (クリックハウスサーバーの IP アドレスまたはホスト名は `127.0.0.1` と置き換えてください):
```bash
curl 127.0.0.1:9363/metrics
```
## query_log {#query_log}

[log_queries=1](../../operations/settings/settings.md) 設定で受信したクエリをログに記録するための設定。

クエリは [system.query_log](/operations/system-tables/query_log) テーブルにログされ、別のファイルにはログされません。テーブルの名前は `table` パラメータで変更できます (以下を参照)。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバーが更新されたときにクエリログの構造が変更された場合、古い構造を持つテーブルは名前変更され、新しいテーブルが自動的に作成されます。

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

手動でメトリクス履歴コレクションを有効にするには、[`system.query_metric_log`](../../operations/system-tables/query_metric_log.md) に `/etc/clickhouse-server/config.d/query_metric_log.xml` を作成し、次の内容を含めます。

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

`query_metric_log` 設定を無効にするには、次の内容を含むファイル `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` を作成する必要があります。

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

[クエリキャッシュ](../query-cache.md) の設定。

以下の設定が利用可能です：

| 設定                      | 説明                                                                           | デフォルト値                |
|---------------------------|-------------------------------------------------------------------------------|-----------------------------|
| `max_size_in_bytes`       | 最大キャッシュサイズ（バイト単位）。`0` はクエリキャッシュが無効であることを意味します。     | `1073741824`                |
| `max_entries`             | キャッシュに保存される `SELECT` クエリ結果の最大数。                             | `1024`                      |
| `max_entry_size_in_bytes` | キャッシュに保存される可能性のある `SELECT` クエリ結果の最大サイズ（バイト単位）。 | `1048576`                   |
| `max_entry_size_in_rows`  | キャッシュに保存される可能性のある `SELECT` クエリ結果の最大行数。               | `30000000`                  |

:::note
- 変更された設定はすぐに有効になります。
- クエリキャッシュのデータは DRAM で割り当てられます。メモリが不足している場合は、`max_size_in_bytes` に小さい値を設定するか、クエリキャッシュを完全に無効にしてください。
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

[log_query_threads=1](/operations/settings/settings#log_query_threads) 設定で受信したクエリのスレッドをログに記録するための設定。

クエリは [system.query_thread_log](/operations/system-tables/query_thread_log) テーブルにログされ、別のファイルにはログされません。テーブルの名前は `table` パラメータで変更できます (以下を参照)。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバーが更新されたときにクエリスレッドログの構造が変更された場合、古い構造を持つテーブルは名前変更され、新しいテーブルが自動的に作成されます。

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

[log_query_views=1](/operations/settings/settings#log_query_views) 設定で受信したクエリに依存するビュー (ライブ、マテリアライズなど) をログに記録するための設定。

クエリは [system.query_views_log](/operations/system-tables/query_views_log) テーブルにログされ、別のファイルにはログされません。テーブルの名前は `table` パラメータで変更できます (以下を参照)。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouseはそれを作成します。ClickHouseサーバーが更新されたときにクエリビューのログの構造が変更された場合、古い構造を持つテーブルは名前変更され、新しいテーブルが自動的に作成されます。

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

テキストメッセージをログに記録するための [text_log](/operations/system-tables/text_log) システムテーブルの設定。

<SystemLogParameters/>

さらに：

| 設定   | 説明                                                                                                                                                                                                        | デフォルト値       |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| `level` | テーブルに保存される最大メッセージレベル (デフォルトは `Trace`)。                                                                                                                                                  | `Trace`           |

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

[trace_log](/operations/system-tables/trace_log) システムテーブル操作の設定。

<SystemLogParameters/>

デフォルトのサーバー構成ファイル `config.xml` には次の設定セクションが含まれています：

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

非同期挿入のロギング用の [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) システムテーブルの設定。

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

[crash_log](../../operations/system-tables/crash_log.md) システムテーブル操作の設定。

<SystemLogParameters/>

デフォルトのサーバー構成ファイル `config.xml` には次の設定セクションが含まれています：

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

この設定は、カスタム (SQL から作成された) キャッシュディスクのキャッシュパスを指定します。
`custom_cached_disks_base_directory` は、`filesystem_caches_path` ( `filesystem_caches_path.xml` にあります) よりもカスタムディスクの優先順位が高く、前者が存在しない場合に使用されます。
ファイルシステムキャッシュ設定パスは、そのディレクトリ内にある必要があり、それ以外の場合は例外がスローされ、ディスクの作成が防止されます。

:::note
これは、サーバーがアップグレードされた古いバージョンで作成されたディスクには影響しません。この場合、サーバーが正常に起動するようにするために例外はスローされません。
:::

例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
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
## blob_storage_log {#blob_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) システムテーブルの設定。

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
## query_masking_rules {#query_masking_rules}

クエリやすべてのログメッセージに適用される正規表現ベースのルールで、サーバーログに保存される前に [`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブルにおよびクライアントに送信されるログに適用されます。これは、名前、電子メール、個人識別子またはクレジットカード番号などの SQL クエリからの機密データ漏洩を防ぐことができます。

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

**設定フィールド**：

| 設定     | 説明                                                                  |
|----------|----------------------------------------------------------------------|
| `name`   | ルールの名前 (オプション)                                             |
| `regexp` | RE2 互換の正規表現 (必須)                                           |
| `replace`| 機密データの置換文字列 (オプション、デフォルト - 6 つのアスタリスク) |

マスキングルールはクエリ全体に適用されます (不正な/パース不可能なクエリからの機密データ漏洩を防ぐため)。

[`system.events`](/operations/system-tables/events) テーブルには、`QueryMaskingRulesMatch` カウンターがあり、クエリマスキングルールに一致した全体の数があります。

分散クエリの場合、各サーバーを別々に構成する必要があります。そうでない場合、他のノードに渡されたサブクエリはマスキングなしで保存されます。
## remote_servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンと `cluster` テーブル関数で使用されるクラスターの構成。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性の値については、"[構成ファイル](/operations/configuration-files)" セクションを参照してください。

**関連情報**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [クラスターの発見](../../operations/cluster-discovery.md)
- [レプリケートデータベースエンジン](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

URL 関連のストレージエンジンおよびテーブル関数で使用することが許可されているホストのリスト。

`\<host\>` XML タグでホストを追加する際には：
- DNS 解決の前に名前がチェックされるため、URL に正確に指定する必要があります。例えば： `<host>clickhouse.com</host>`
- URL にポートが明示的に指定されている場合、host:port 全体がチェックされます。例えば： `<host>clickhouse.com:80</host>`
- ポートなしでホストを指定する場合、そのホストの任意のポートが許可されます。例： `<host>clickhouse.com</host>` が指定されると、`clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) などが許可されます。
- ホストが IP アドレスとして指定される場合、URL で指定された通りにチェックされます。例： `[2a02:6b8:a::a]`。
- リダイレクトがある場合で、リダイレクトのサポートが有効な場合は、すべてのリダイレクト (location フィールド) がチェックされます。

例えば：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## timezone {#timezone}

サーバーのタイムゾーン。

IANA タイムゾーンまたは地理的位置 (例: Africa/Abidjan) の識別子として指定します。

タイムゾーンは、DateTime フィールドをテキスト形式 (画面やファイルに印刷) で出力するときや、文字列から DateTime を取得するときに、String と DateTime フォーマット間の変換に必要です。また、時間と日付を扱う関数で使用され、入力パラメーターでタイムゾーンを受け取っていない場合にも使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**関連情報**

- [session_timezone](../settings/settings.md#session_timezone)
## tcp_port {#tcp_port}

クライアントと TCP プロトコルで通信するためのポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

クライアントとの安全な通信用の TCP ポート。[OpenSSL](#openssl) 設定とともに使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## mysql_port {#mysql_port}

MySQL プロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します
- 空の値は MySQL プロトコルを介したクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<mysql_port>9004</mysql_port>
```
## postgresql_port {#postgresql_port}

PostgreSQL プロトコルを介してクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します
- 空の値は PostgreSQL プロトコルを介したクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```
## mysql_require_secure_transport {#mysql_require_secure_transport}

`true` に設定されている場合、[mysql_port](#mysql_port) を介してクライアントとの安全な通信が要求されます。`--ssl-mode=none` オプションの接続は拒否されます。[OpenSSL](#openssl) 設定とともに使用します。
## postgresql_require_secure_transport {#postgresql_require_secure_transport}

`true` に設定されている場合、[postgresql_port](#postgresql_port) を介してクライアントとの安全な通信が要求されます。`sslmode=disable` オプションの接続は拒否されます。[OpenSSL](#openssl) 設定とともに使用します。
## tmp_path {#tmp_path}

大きなクエリを処理するために、一時データを格納するためのローカルファイルシステム上のパス。

:::note
- 一時データストレージを構成するには、`tmp_path`、`tmp_policy`、`temporary_data_in_cache` のいずれか 1 つのオプションを使用できる。
- 末尾のスラッシュは必須です。
:::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

短縮または記号的な URL プレフィックスを完全な URL に変換するための構成。

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

ユーザーファイルのディレクトリ。[file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) テーブル関数で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path}

ユーザースクリプトファイルのディレクトリ。実行可能なユーザー定義関数 [実行可能ユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions) に使用されます。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

タイプ：

デフォルト：
## user_defined_path {#user_defined_path}

ユーザー定義ファイルのディレクトリ。SQL ユーザー定義関数 [SQL ユーザー定義関数](/sql-reference/functions/udf) に使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## users_config {#users_config}

次の内容が含まれるファイルへのパス：

- ユーザー構成。
- アクセス権。
- 設定プロファイル。
- クォータ設定。

**例**

```xml
<users_config>users.xml</users_config>
```
## access_control_improvements {#access_control_improvements}

アクセス制御システムのオプション改善に関する設定。

| 設定                                           | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | デフォルト  |
|----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `users_without_row_policies_can_read_rows`      | 許可された行ポリシーを持たないユーザーが、`SELECT` クエリを使用して行を読み取ることができるかどうかを設定します。例えば、ユーザー A と B がいて、行ポリシーが A のみのために定義されている場合、この設定が真であれば、ユーザー B はすべての行を見ることができます。この設定が偽の場合、ユーザー B は行を見えません。                                                                                                                                                             | `true`     |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` クエリが `CLUSTER` の権限を必要とするかどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                         | `true`     |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>` が特定の権限を必要とし、任意のユーザーが実行できるかどうかを設定します。真に設定すると、このクエリは非システムテーブルと同様に `GRANT SELECT ON system.<table>` を必要とします。例外として、いくつかのシステムテーブル（`tables`, `columns`, `databases`, および `one`, `contributors` などの定数テーブル）は、すべてのユーザーがアクセス可能です。また、`SHOW` 権限（例：`SHOW USERS`）が付与されている場合、対応するシステムテーブル（つまり、`system.users`）にアクセスできます。 | `true`     |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` が特定の権限を必要とし、任意のユーザーが実行できるかどうかを設定します。真に設定すると、このクエリは通常のテーブルと同様に `GRANT SELECT ON information_schema.<table>` を必要とします。                                                                                                                                                                                                                                            | `true`     |
| `settings_constraints_replace_previous`         | ある設定に対する設定プロファイル内の制約が、他のプロファイルで定義されたその設定の以前の制約のアクションをキャンセルするかどうかを設定します。この新しい制約によって設定されていないフィールドが含まれます。また、`changeable_in_readonly` 制約タイプを有効にします。                                                                                                                                                                                                                       | `true`     |
| `table_engines_require_grant`                   | 特定のテーブルエンジンを使用してテーブルを作成するために権限が必要かどうかを設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                              | `false`    |
| `role_cache_expiration_time_seconds`            | 最後のアクセスからの秒数で、ロールがロールキャッシュに保存される時間を設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                      | `600`      |

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

`s3queue_log` システムテーブルの設定。

<SystemLogParameters/>

デフォルト設定：

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```
## dead_letter_queue {#dead_letter_queue}

'ddead_letter_queue' システムテーブルの設定。

<SystemLogParameters/>

デフォルト設定：

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```
## zookeeper {#zookeeper}

ClickHouse が [ZooKeeper](http://zookeeper.apache.org/) クラスターとやり取りするための設定を含みます。ClickHouse は、レプリケーティッドテーブルを使用する際にレプリカのメタデータを保存するために ZooKeeper を使います。レプリケーティッドテーブルが使用されていない場合、このパラメータセクションは省略できます。

以下の設定は、サブタグによって構成できます：

| 設定                                      | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                  | ZooKeeper エンドポイント。複数のエンドポイントを設定できます。例：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性は、ZooKeeper クラスターに接続しようとする際のノードの順序を指定します。                                                                                                                                                                                                                             |
| `session_timeout_ms`                    | クライアントセッションの最大タイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `operation_timeout_ms`                  | 一つの操作の最大タイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `root` (オプション)                     | ClickHouse サーバーが使用する znode のルートとして使用される znode。                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min` (オプション) | プライマリが利用できない場合のフォールバックノードへの ZooKeeper セッションの最小限のライフタイム（ロードバランシングのため）。秒単位で設定します。デフォルト：3 時間。                                                                                                                                                                                                                                                                                                                 |
| `fallback_session_lifetime.max` (オプション) | プライマリが利用できない場合のフォールバックノードへの ZooKeeper セッションの最大限のライフタイム（ロードバランシングのため）。秒単位で設定します。デフォルト：6 時間。                                                                                                                                                                                                                                                                                                                 |
| `identity` (オプション)                 | 要求された znode にアクセスするために ZooKeeper によって必要とされるユーザー名とパスワード。                                                                                                                                                                                                                                                                                                                                                                                                      |
| `use_compression` (オプション)          | これを真に設定すると、Keeper プロトコルで圧縮が有効になります。                                                                                                                                                                                                                                                                                                                                                                                                                                   |

`zookeeper_load_balancing` 設定（オプション）もあり、ZooKeeper ノード選択のためのアルゴリズムを選択できます：

| アルゴリズム名               | 説明                                                                                                                         |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `random`                   | ZooKeeper ノードの中からランダムに一つ選択します。                                                                              |
| `in_order`                 | 最初の ZooKeeper ノードを選択し、利用できない場合は次のノードを選択します。                                                          |
| `nearest_hostname`         | サーバーのホスト名と最も類似したホスト名を持つ ZooKeeper ノードを選択します。ホスト名は名前のプレフィックスと比較されます。                               |
| `hostname_levenshtein_distance` | nearest_hostname と同様に、ホスト名をレーヴェンシュタイン距離によって比較します。                                                   |
| `first_or_random`          | 最初の ZooKeeper ノードを選択し、利用できない場合は残りの ZooKeeper ノードの中からランダムに一つ選択します。                        |
| `round_robin`              | 最初の ZooKeeper ノードを選択し、再接続が発生すると次のノードを選択します。                                                          |

**例の構成**

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
- [ZooKeeper プログラマーガイド](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse と ZooKeeper 間のオプショナルなセキュア通信](/operations/ssl-zookeeper)
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeper におけるデータパートヘッダーのストレージ方法。この設定は [`MergeTree`](/engines/table-engines/mergetree-family) ファミリーにのみ適用されます。

**グローバルにする方法**

`config.xml` ファイルの [merge_tree](#merge_tree) セクション内で指定できます。

ClickHouse はサーバー上のすべてのテーブルに対してこの設定を使用します。いつでもこの設定を変更できます。既存のテーブルは、設定が変更されると振る舞いが変わります。

**テーブルごとに**

テーブルを作成するときに、対応する [エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) を指定します。この設定を持つ既存のテーブルの振る舞いは、グローバル設定が変更されても変わりません。

**可能な値**

- `0` — 機能はオフになります。
- `1` — 機能はオンになります。

もし [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper) であれば、[レプリケートされた](../../engines/table-engines/mergetree-family/replication.md) テーブルは、単一の `znode` を使用してデータパーツのヘッダーをコンパクトに保存します。テーブルに多くのカラムが含まれている場合、このストレージ方法は ZooKeeper に保存されるデータの量を大幅に削減します。

:::note
`use_minimalistic_part_header_in_zookeeper = 1` を適用した後、この設定をサポートしないバージョンの ClickHouse サーバーにダウングレードすることはできません。クラスター内のサーバーをアップグレードする際は注意してください。すべてのサーバーを一度にアップグレードしないことをお勧めします。新しいバージョンの ClickHouse をテスト環境やクラスター内の数台のサーバーでテストする方が安全です。

この設定を使って既に保存されたデータパートヘッダーは、以前の（非コンパクトな）表現に復元することはできません。
:::

## distributed_ddl {#distributed_ddl}

クラスター上で [分散 DDL クエリ](../../sql-reference/distributed-ddl.md)（`CREATE`, `DROP`, `ALTER`, `RENAME`）を実行する管理。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) が有効である場合にのみ動作します。

`<distributed_ddl>` 内の構成可能な設定は以下の通りです：

| 設定                  | 説明                                                                                                               | デフォルト値                          |
|----------------------|--------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| `path`               | DDL クエリの `task_queue` のための Keeper 内のパス                                                                    |                                        |
| `profile`            | DDL クエリを実行するために使用されるプロファイル                                                                     |                                        |
| `pool_size`          | 同時に実行可能な `ON CLUSTER` クエリの数                                                                                |                                        |
| `max_tasks_in_queue` | キュー内に存在できるタスクの最大数                                                                                       | `1,000`                                |
| `task_max_lifetime`  | ノードの年齢がこの値を超える場合に削除します。                                                                        | `7 * 24 * 60 * 60`（1週間の秒数）      |
| `cleanup_delay_period`| 最後のクリーニングが `cleanup_delay_period` 秒より早く行われていない場合、新しいノードイベントを受け取った後にクリーニングが開始されます。 | `60` 秒                               |

**例**

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
## access_control_path {#access_control_path}

ClickHouse サーバーが SQL コマンドによって作成されたユーザーとロールの設定を保存するフォルダへのパス。

**参照**
- [アクセス制御およびアカウント管理](/operations/access-rights#access-control-usage)
## allow_plaintext_password {#allow_plaintext_password}

プレーンテキストパスワードタイプ（安全でない）を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_no_password {#allow_no_password}

安全でないパスワードタイプの no_password を許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```
## allow_implicit_no_password {#allow_implicit_no_password}

'IDENTIFIED WITH no_password' が明示的に指定されていない限り、パスワードなしのユーザーの作成を禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## default_session_timeout {#default_session_timeout}

デフォルトのセッションタイムアウト（秒単位）。

```xml
<default_session_timeout>60</default_session_timeout>
```
## default_password_type {#default_password_type}

`CREATE USER u IDENTIFIED BY 'p'` のようなクエリに自動的に設定されるパスワードのタイプを設定します。

許可された値は次の通りです：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## user_directories {#user_directories}

設定ファイルのセクションで、次の設定が含まれます：
- 事前定義されたユーザーを含む設定ファイルへのパス。
- SQL コマンドによって作成されたユーザーが保存されるフォルダへのパス。
- SQL コマンドによって作成され、レプリケートされたユーザーが保存される ZooKeeper ノードパス（実験的）。

このセクションが指定されると、[users_config](/operations/server-configuration-parameters/settings#users_config) と [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) からのパスは使用されません。

`user_directories` セクションは任意の数のアイテムを含むことができ、アイテムの順序はその優先度を意味します（アイテムが高いほど優先度が高い）。

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

ユーザー、ロール、行ポリシー、クォータ、プロファイルも ZooKeeper に保存できます：

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

ローカルに定義されていないユーザーのリモートユーザーディレクトリとして LDAP サーバーを追加するには、次の設定を持つ単一の `ldap` セクションを定義します：

| 設定    | 説明                                                                                                                                                                                                                                                                                                                                                                    |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | `ldap_servers` 設定セクションで定義されている LDAP サーバー名の一つ。このパラメータは必須で、空にすることはできません。                                                                                                                                                                                                                                   |
| `roles`  | LDAP サーバーから取得された各ユーザーに割り当てられるローカルに定義されたロールのリストを含むセクション。ロールが指定されていない場合、ユーザーは認証後に何のアクションも実行できません。ロールが認証時にローカルで定義されていない場合、認証の試みは失敗し、提供されたパスワードが間違っているかのようになります。 |

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

カスタムのトップレベルドメインを追加するためのリストを定義します。各エントリーは `<name>/path/to/file</name>` という形式です。

例えば：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

参照：
- 関数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) およびそのバリエーションは、カスタム TLD リスト名を受け取り、最初の重要なサブドメインまでのトップレベルサブドメインを含むドメイン部分を返します。
## proxy {#proxy}

HTTP および HTTPS リクエスト用のプロキシサーバーを定義します。現在は S3 ストレージ、S3 テーブル関数、および URL 関数がサポートされています。

プロキシサーバーを定義する方法は三つあります：
- 環境変数
- プロキシリスト
- リモートプロキシ解決者。

特定のホスト用にプロキシサーバーをバイパスすることも `no_proxy` を使用してサポートされています。

**環境変数**

`http_proxy` および `https_proxy` 環境変数を使用して、特定のプロトコル用のプロキシサーバーを指定できます。これをシステムに設定していれば、シームレスに動作するはずです。

これは、特定のプロトコルが一つのプロキシサーバーしか持っていない場合、最も簡単なアプローチです。

**プロキシリスト**

このアプローチでは、プロトコル用の一つまたは複数のプロキシサーバーを指定できます。プロキシサーバーが複数定義されている場合、ClickHouse は異なるプロキシをラウンドロビン方式で使用し、サーバー間の負荷を均等にします。プロトコル用に複数のプロキシサーバーがあり、プロキシサーバーのリストが変わらない場合、最も簡単なアプローチです。

**構成テンプレート**

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
以下のタブから親フィールドを選択して、その子フィールドを表示してください：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド     | 説明                         |
|----------------|------------------------------|
| `<http>`       | 一つ以上の HTTP プロキシのリスト  |
| `<https>`      | 一つ以上の HTTPS プロキシのリスト |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド   | 説明          |
|---------------|-----------------|
| `<uri>`      | プロキシの URI |

  </TabItem>
</Tabs>

**リモートプロキシ解決者**

プロキシサーバーが動的に変わる可能性があります。その場合、解決者のエンドポイントを定義できます。ClickHouse はそのエンドポイントに空の GET リクエストを送信し、リモート解決者はプロキシホストを返す必要があります。ClickHouse は、次のテンプレートを使用してプロキシ URI を形成します：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**構成テンプレート**

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

以下のタブから親フィールドを選択して、その子フィールドを表示してください：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド    | 説明                      |
|---------------|---------------------------|
| `<http>`      | 一つ以上の解決者のリスト* |
| `<https>`     | 一つ以上の解決者のリスト* |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| フィールド      | 説明                                   |
|-----------------|----------------------------------------|
| `<resolver>`     | 解決者のエンドポイントおよびその他の詳細 |

:::note
複数の `<resolver>` 要素を持つことができますが、特定のプロトコルに対して最初の `<resolver>` のみが使用されます。そのプロトコルのための他の `<resolver>` 要素は無視されます。これは、負荷分散（必要に応じて）がリモート解決者によって実装されるべきことを意味します。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| フィールド               | 説明                                                                                                                                          |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`             | プロキシ解決者の URI                                                                                                                         |
| `<proxy_scheme>`         | 最終プロキシ URI のプロトコル。`http` または `https` のいずれかです。                                                                                  |
| `<proxy_port>`           | プロキシ解決者のポート番号                                                                                                                  |
| `<proxy_cache_time>`     | 解決者からの値が ClickHouse によってキャッシュされる秒数。この値を `0` に設定すると、ClickHouse はすべての HTTP または HTTPS リクエストのたびに解決者に連絡します。                              |

  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は次の順序で決定されます：

| 順序 | 設定                    |
|-------|------------------------|
| 1.    | リモートプロキシ解決者 |
| 2.    | プロキシリスト          |
| 3.    | 環境変数                |

ClickHouse は、リクエストプロトコルに対して最も優先度の高い解決者タイプをチェックします。それが定義されていない場合は、次に優先順位の高い解決者タイプをチェックし、環境解決者に達します。これにより、解決者タイプを混在させて使用することも可能です。
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

デフォルトでは、トンネリング（つまり、`HTTP CONNECT`）が `HTTP` プロキシ経由で `HTTPS` リクエストを行うために使用されます。この設定を使用して無効にできます。

**no_proxy**

デフォルトでは、すべてのリクエストはプロキシを通過します。特定のホストに対してプロキシを無効にするには、`no_proxy` 変数を設定する必要があります。リストとリモート解決者の `<proxy>` 節内で及び環境解決者の環境変数として設定できます。IP アドレス、ドメイン、サブドメイン、及び完全バイパスのための `'*'` ワイルドカードがサポートされています。先頭のドットは、curl と同様に削除されます。

**例**

以下の設定は、`clickhouse.cloud` とそのすべてのサブドメイン（例：`auth.clickhouse.cloud`）へのプロキシリクエストをバイパスします。同じことが GitLab にも当てはまり、先頭にドットがあっても問題ありません。両方の `gitlab.com` と `about.gitlab.com` がプロキシをバイパスします。

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

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリのストレージとして使用されるディレクトリ。デフォルトでは、サーバーの作業ディレクトリの下の `/workload/` フォルダが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**参照**
- [ワークロード階層](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

すべての `CREATE WORKLOAD` および `CREATE RESOURCE` クエリのストレージとして使用される ZooKeeper ノードへのパス。一貫性のために、すべての SQL 定義はこの単一の znode の値として保存されます。デフォルトでは ZooKeeper は使用されず、定義は [ディスク](#workload_path) に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**参照**
- [ワークロード階層](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
