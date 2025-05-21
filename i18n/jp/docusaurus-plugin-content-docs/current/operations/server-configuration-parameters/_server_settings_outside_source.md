title: '非同期メトリックログ'
sidebar_label: '非同期メトリックログ'
keywords: ['非同期メトリックログ', 'ClickHouse Cloud', '設定']
description: 'ClickHouse Cloud デプロイメントでデフォルトで有効になっています。'
```

## 非同期メトリックログ {#asynchronous_metric_log}

ClickHouse Cloud デプロイメントでデフォルトで有効になっています。

設定がデフォルトで有効になっていない環境では、ClickHouse のインストール方法に応じて、以下の手順に従って有効または無効にできます。

**有効化**

非同期メトリックログ履歴の収集を手動でオンにするには [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)、次の内容で `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` を作成します:

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

`asynchronous_metric_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` を作成する必要があります:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## auth_use_forwarded_address {#auth_use_forwarded_address}

プロキシを介して接続されたクライアントの認証に元のアドレスを使用します。

:::note
この設定は注意して使用する必要があります。なぜなら、転送されたアドレスは簡単に偽装できるからです。このような認証を受け入れるサーバーには直接アクセスせず、信頼できるプロキシを介してのみアクセスするべきです。
:::
## backups {#backups}

`BACKUP TO File()` を使用する際のバックアップ設定。

以下の設定はサブタグで構成できます:

| 設定                                 | 説明                                                                                                                                                                        | デフォルト |
|--------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| `allowed_path`                      | `File()` を使用してバックアップする際のパス。この設定は `File` を使用するために設定する必要があります。パスはインスタンスディレクトリに対して相対的であったり、絶対的であったりできます。 | `true`     |
| `remove_backup_files_after_failure` | `BACKUP` コマンドが失敗した場合、ClickHouse は失敗前にバックアップにコピーされたファイルを削除しようとします。そうでない場合は、コピーされたファイルはそのままにされます。              | `true`     |

この設定はデフォルトで次のように構成されています:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## bcrypt_workfactor {#bcrypt_workfactor}

[Bcrypt アルゴリズム](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)を使用する bcrypt_password 認証タイプの作業係数。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```
## table_engines_require_grant {#table_engines_require_grant}

true に設定されている場合、ユーザーは特定のエンジンを持つテーブルを作成するためにグラントが必要です。例： `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
デフォルトでは、特定のテーブルエンジンを持つテーブルの作成はグラントを無視しますが、この挙動はこれを true に設定することで変更できます。
:::
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

組み込み辞書を再読み込みする前の間隔（秒単位）。

ClickHouse は組み込み辞書を毎 x 秒ごとに再読み込みします。これにより、サーバーを再起動せずに辞書を「オン・ザ・フライ」で編集できます。

**例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブルに対するデータ圧縮設定。

:::note
ClickHouse を使い始めたばかりの場合は、これを変更しないことをお勧めします。
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

- `min_part_size` – データパートの最小サイズ。
- `min_part_size_ratio` – データパートのサイズとテーブルのサイズの比率。
- `method` – 圧縮方法。許可される値: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`。
- `level` – 圧縮レベル。詳細は [Codecs](/sql-reference/statements/create/table#general-purpose-codecs) を参照。

:::note
複数の `<case>` セクションを構成できます。
:::

**条件が満たされた場合のアクション**:

- データパートが設定された条件に一致した場合、ClickHouse は指定された圧縮方法を使用します。
- データパートが複数の条件セットに一致した場合、ClickHouse は最初に一致した条件セットを使用します。

:::note
条件がデータパートに対して満たされない場合、ClickHouse は `lz4` 圧縮を使用します。
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

[暗号化コーデック](/sql-reference/statements/create/table#encryption-codecs)で使用されるキーを取得するためのコマンドを構成します。キー（またはキー）は環境変数に書き込むか、構成ファイルに設定する必要があります。

キーは16バイトに等しい長さの16進数または文字列である必要があります。

**例**

構成からの読み込み:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
構成ファイルにキーを保存することは推奨されません。安全ではありません。キーを安全なディスク上の別の構成ファイルに移動し、その構成ファイルへのシンボリックリンクを `config.d/` フォルダに置くことができます。
:::

構成からの読み込み、キーが16進数の場合:

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

ここで `current_key_id` は暗号化のための現在のキーを設定し、すべての指定されたキーは復号に使用できます。

これらの方法は複数のキーに適用できます:

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

また、ユーザーは12バイトの長さのノンスも追加できます（デフォルトでは、暗号化および復号プロセスはゼロバイトからなるノンスを使用します）:

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
上記のすべては `aes_256_gcm_siv` にも適用されます（ただし、キーは32バイトの長さである必要があります）。
:::
## error_log {#error_log}

デフォルトでは無効になっています。

**有効化**

エラーログ収集を手動でオンにするには [`system.error_log`](../../operations/system-tables/error_log.md)、次の内容で `/etc/clickhouse-server/config.d/error_log.xml` を作成します:

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

`error_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_error_log.xml` を作成する必要があります:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## custom_settings_prefixes {#custom_settings_prefixes}

[カスタム設定](/operations/settings/query-level#custom_settings)のプレフィックスのリスト。プレフィックスはコンマで区切る必要があります。

**例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**参考文献**

- [カスタム設定](/operations/settings/query-level#custom_settings)
## core_dump {#core_dump}

コアダンプファイルサイズのソフトリミットを構成します。

:::note
ハードリミットはシステムツールを介して構成されます
:::

**例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## default_profile {#default_profile}

デフォルトの設定プロファイル。設定プロファイルは `user_config` 設定で指定されたファイルに配置されています。

**例**

```xml
<default_profile>default</default_profile>
```
## dictionaries_config {#dictionaries_config}

辞書のための構成ファイルのパス。

パス:

- 絶対パスまたはサーバー構成ファイルに対する相対パスを指定します。
- パスにはワイルドカード \* と ? を含めることができます。

参照してください:
- "[辞書](../../sql-reference/dictionaries/index.md)"。

**例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

実行可能なユーザー定義関数のための構成ファイルのパス。

パス:

- 絶対パスまたはサーバー構成ファイルに対する相対パスを指定します。
- パスにはワイルドカード \* と ? を含めることができます。

参照してください:
- "[実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions).".

**例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## format_schema_path {#format_schema_path}

入力データのスキーマ（[CapnProto](../../interfaces/formats.md#capnproto) フォーマットのスキーマなど）を持つディレクトリのパス。

**例**

```xml
<!-- 様々な入力フォーマットのスキーマファイルを含むディレクトリ。 -->
<format_schema_path>format_schemas/</format_schema_path>
```
## graphite {#graphite}

[Graphite](https://github.com/graphite-project) へのデータ送信。

設定:

- `host` – Graphite サーバー。
- `port` – Graphite サーバーのポート。
- `interval` – 送信の間隔（秒単位）。
- `timeout` – データ送信のタイムアウト（秒単位）。
- `root_path` – キーのプレフィックス。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからデータを送信します。
- `events` – [system.events](/operations/system-tables/events) テーブルからの時間期間に累積されたデータの送信。
- `events_cumulative` – [system.events](/operations/system-tables/events) テーブルからの累積データの送信。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルからのデータの送信。

複数の `<graphite>` 句を構成できます。たとえば、異なる間隔で異なるデータを送信するために使用できます。

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

Graphite 用のデータを薄くするための設定。

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

Protobuf タイプの proto ファイルを含むディレクトリを定義します。

**例**

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

カスタム HTTP ハンドラーを使用することを可能にします。
新しい HTTP ハンドラーを追加するには、新しい `<rule>` を追加します。
ルールは、上から下に定義された順にチェックされ、最初に一致したルールがハンドラーを実行します。

以下の設定はサブタグで構成できます:

| サブタグ               | 定義                                                                                                                                                                 |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | リクエスト URL と一致させるために、'regex:' プレフィックスを使用して正規表現一致を使用することができます（オプション）                                                      |
| `methods`            | リクエストメソッドと一致させるために、複数のメソッドの一致をカンマで区切って使用することができます（オプション）                                                          |
| `headers`            | リクエストヘッダーに一致させるために、各子要素が子要素名（ヘッダー名）で、'regex:' プレフィックスを使用して正規表現一致を使用することができます（オプション）                |
| `handler`            | リクエストハンドラー                                                                                                                                               |
| `empty_query_string` | URL にクエリ文字列がないことを確認します                                                                                                                                |

`handler` には、サブタグで構成できる以下の設定が含まれます:

| サブタグ               | 定義                                                                                                                                                                 |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | リダイレクト先                                                                                                                                                     |
| `type`               | サポートされるタイプ: static, dynamic_query_handler, predefined_query_handler, redirect                                                                         |
| `status`             | static タイプで使用する、応答ステータスコード                                                                                                                      |
| `query_param_name`   | dynamic_query_handler タイプで使用する、HTTP リクエストパラメータの `<query_param_name>` 値に対応する値を抽出して実行します                                              |
| `query`              | predefined_query_handler タイプで使用する、ハンドラーが呼び出されたときにクエリを実行します                                                                                   |
| `content_type`       | static タイプで使用する、応答コンテンツタイプ                                                                                                                       |
| `response_content`   | static タイプで使用する、クライアントに送信されるレスポンスコンテンツ。'file://' または 'config://' プレフィックスを使用する場合、ファイルまたは構成からコンテンツを見つけてクライアントに送信します |

ルールのリストに加えて、すべてのデフォルトハンドラーを有効にする `<defaults/>` を指定できます。

**例**:

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

ClickHouse HTTP(S) サーバーにアクセスしたときにデフォルトで表示されるページ。
デフォルト値は「Ok.」（末尾に改行あり）

**例**

`http://localhost: http_port` にアクセスすると `https://tabix.io/` が開きます。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

`OPTIONS` HTTP リクエストの応答にヘッダーを追加するために使用されます。
`OPTIONS` メソッドは、CORS プレフライトリクエストを行うときに使用されます。

詳細については、[OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)を参照してください。

**例**:

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
値が `0` の場合、ClickHouse は HSTS を無効にします。正の数を設定すると、HSTS が有効になり、max-age は設定した数になります。
:::

**例**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

スタートアップ後に `mlockall` を実行して、最初のクエリのレイテンシを低下させ、高い I/O 負荷の下で ClickHouse 実行可能ファイルがページアウトされるのを防ぎます。

:::note
このオプションを有効にすることは推奨されますが、スタートアップ時間が最大数秒増加する可能性があります。
この設定は「CAP_IPC_LOCK」機能なしでは機能しないことを覚えておいてください。
:::

**例**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

置き換え用のファイルへのパス。XML と YAML の両方の形式がサポートされています。

詳細については、"[構成ファイル](/operations/configuration-files)" セクションを参照してください。

**例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

ClickHouse サーバー間でデータを交換できるホストの制限。
Keeper を使用している場合、異なる Keeper インスタンス間の通信にも同じ制限が適用されます。

:::note
デフォルトでは、この値は [`listen_host`](#listen_host) 設定と等しくなります。
:::

**例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

タイプ:

デフォルト:
## interserver_http_port {#interserver_http_port}

ClickHouse サーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_http_host {#interserver_http_host}

他のサーバーがこのサーバーにアクセスするために使用できるホスト名。

省略された場合は、`hostname -f` コマンドと同じ方法で定義されます。

特定のネットワークインターフェースから離れるために便利です。

**例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_https_port {#interserver_https_port}

`HTTPS` 経由で ClickHouse サーバー間でデータを交換するためのポート。

**例**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_https_host {#interserver_https_host}

[`interserver_http_host`](#interserver_http_host) と似ていますが、このホスト名は他のサーバーが `HTTPS` 経由でこのサーバーにアクセスするために使用できます。

**例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)中に他のサーバーに接続するために使用されるユーザー名とパスワード。加えて、サーバーはこれらの資格情報を使用して他のレプリカを認証します。
したがって、`interserver_http_credentials` はクラスタ内のすべてのレプリカで同じである必要があります。

:::note
- デフォルトでは、`interserver_http_credentials` セクションが省略されると、レプリケーション中に認証は使用されません。
- `interserver_http_credentials` 設定は ClickHouse クライアント資格情報との関連性はありません [構成](../../interfaces/cli.md#configuration_files)。
- これらの資格情報は `HTTP` と `HTTPS` 経由のレプリケーションに共通です。
:::

以下の設定はサブタグで構成できます:

- `user` — ユーザー名。
- `password` — パスワード。
- `allow_empty` — `true` の場合、資格情報が設定されている場合でも、他のレプリカが認証なしで接続することが許可されます。`false` の場合、認証なしの接続は拒否されます。デフォルト: `false`。
- `old` — 資格情報のローテーション中に使用された古い `user` および `password` を含みます。複数の `old` セクションを指定できます。

**資格情報のローテーション**

ClickHouse はすべてのレプリカを同時に停止することなく、動的なインターネットサーバー資格情報のローテーションをサポートします。資格情報は複数のステップで変更できます。

認証を有効にするには、`interserver_http_credentials.allow_empty` を `true` に設定し、資格情報を追加します。これにより、認証ありと認証なしの接続が許可されます。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

すべてのレプリカが構成された後は、`allow_empty` を `false` に設定するか、この設定を削除します。これにより、新しい資格情報での認証が必須となります。

既存の資格情報を変更する場合、ユーザー名とパスワードを `interserver_http_credentials.old` セクションに移動し、`user` と `password` を新しい値に更新します。この時点で、サーバーは新しい資格情報を使用して他のレプリカに接続し、新しい資格情報または古い資格情報のどちらでも接続を受け入れます。

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

新しい資格情報がすべてのレプリカに適用されたら、古い資格情報を削除することができます。
```
```yaml
title: 'LDAP サーバーの設定'
sidebar_label: 'LDAP サーバー'
keywords: ['LDAP', '設定', 'サーバー']
description: 'LDAP サーバーと接続パラメータの設定について'
```

## ldap_servers {#ldap_servers}

LDAP サーバーとその接続パラメータのリストをここに示します：
- 'password' の代わりに 'ldap' 認証メカニズムが指定された専用のローカルユーザーの認証に使用します。
- リモートユーザーディレクトリとして使用します。

次の設定はサブタグによって構成できます：

| 設定                           | 説明                                                                                                                                                                                                                                                                                                                                                                       |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                        | LDAP サーバーのホスト名または IP。このパラメータは必須であり、空にすることはできません。                                                                                                                                                                                                                                                                                     |
| `port`                        | LDAP サーバーポート。 `enable_tls` が true に設定されている場合はデフォルトで 636、そうでない場合は 389 です。                                                                                                                                                                                                                                                                      |
| `bind_dn`                     | バインドするための DN を構築するために使用されるテンプレート。結果的に得られる DN は、各認証試行時にテンプレート内のすべての `\{user_name\}` サブストリングを実際のユーザー名に置き換えることによって構築されます。                                                                                                                                                                                  |
| `user_dn_detection`           | バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータを含むセクション。この設定は主に、サーバーが Active Directory のときのさらなる役割マッピングのための検索フィルターで使用されます。結果的なユーザー DN は、許可されている場所では `\{user_dn\}` サブストリングの置き換えに使用されます。デフォルトでは、ユーザー DN はバインド DN と等しく設定されますが、一度検索が行われると、実際に検出されたユーザー DN 値で更新されます。 |
| `verification_cooldown`       | 成功したバインド試行の後、LDAP サーバーに連絡せずに連続リクエストのすべてに対してユーザーが成功裏に認証されたと見なされる期間（秒）。キャッシュを無効にして、各認証リクエストのために LDAP サーバーに連絡するようにするには `0`（デフォルト）を指定します。                                                                                                   |
| `enable_tls`                  | LDAP サーバーへの安全な接続の使用をトリガーするフラグ。プレーンテキスト（`ldap://`）プロトコルには `no` を指定します（推奨されません）。LDAP over SSL/TLS（`ldaps://`）プロトコルには `yes` を指定します（推奨、デフォルト）。レガシー StartTLS プロトコル（プレーンテキスト（`ldap://`）プロトコル、TLS にアップグレード）には `starttls` を指定します。                                   |
| `tls_minimum_protocol_version` | SSL/TLS の最小プロトコルバージョン。受け入れられる値は、`ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）です。                                                                                                                                                                                                                                                                                                      |
| `tls_require_cert`            | SSL/TLS ピア証明書の検証動作。受け入れられる値は、`never`, `allow`, `try`, `demand`（デフォルト）です。                                                                                                                                                                                                                                                                                                                         |
| `tls_cert_file`               | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                    |
| `tls_key_file`                | 証明書鍵ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                  |
| `tls_ca_cert_file`            | CA 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                                                                                  |
| `tls_ca_cert_dir`             | CA 証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`            | 許可された暗号スイート（OpenSSL 表記）。                                                                                                                                                                                                                                                                                                                                     |

設定 `user_dn_detection` はサブタグで構成できます：

| 設定             | 説明                                                                                                                                                                                                                                                                                                                          |
|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`        | LDAP 検索のためのベース DN を構築するために使用されるテンプレート。結果的な DN は、LDAP 検索中にテンプレート内のすべての `\{user_name\}` および `\{bind_dn\}` サブストリングを実際のユーザー名とバインド DN に置き換えることによって構築されます。                                                                           |
| `scope`          | LDAP 検索のスコープ。受け入れられる値は、`base`, `one_level`, `children`, `subtree`（デフォルト）です。                                                                                                                                                                                                                  |
| `search_filter`  | LDAP 検索のための検索フィルターを構築するために使用されるテンプレート。結果的なフィルターは、LDAP 検索中にテンプレート内のすべての `\{user_name\}`, `\{bind_dn\}`, および `\{base_dn\}` サブストリングを実際のユーザー名、バインド DN、ベース DN に置き換えることによって構築されます。特別な文字は XML で適切にエスケープされる必要があります。 |

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

例（ユーザー DN 検出のために構成された典型的な Active Directory としての設定）：

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

リクエストが受け付けられるホストの制限。サーバーがすべてのリクエストに応答する場合、`::` を指定します。

例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

IPv6 または IPv4 ネットワークが利用できない場合でも、リッスンしようとするときにサーバーは終了しません。

**例**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

複数のサーバーが同じアドレス:ポートでリッスンできるようにします。リクエストはオペレーティングシステムによってランダムなサーバーにルーティングされます。この設定を有効にすることは推奨されません。

**例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

タイプ：

デフォルト：
## listen_backlog {#listen_backlog}

リッスンソケットのバックログ（保留中の接続のキューサイズ）。デフォルト値は `4096` で、これは linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4) と同じです。

通常、この値を変更する必要はありません。なぜなら：
- デフォルト値は十分に大きいから、
- クライアントの接続を受け入れるためにサーバーには別のスレッドがあります。

したがって、`TcpExtListenOverflows`（`nstat` から）が非ゼロで ClickHouse サーバーに対するこのカウンターが増加しても、この値を増加させる必要はありません。なぜなら：
- 通常、`4096` で十分でない場合は、何らかの内部 ClickHouse スケーリングの問題を示し、問題を報告することが望ましいためです。
- サーバーが後でより多くの接続を処理できることを意味するわけではありません（たとえ可能であっても、その時点でクライアントが同行しているか切断されている可能性があります）。

**例**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

ログメッセージの場所とフォーマット。

**キー**：

| キー                       | 説明                                                                                                                                                                                             |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | ログレベル。受け入れ可能な値：`none`（ロギングをオフにする）、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                                  |
| `log`                     | ログファイルへのパス。                                                                                                                                                                           |
| `errorlog`                | エラーログファイルへのパス。                                                                                                                                                                     |
| `size`                    | 回転ポリシー：ログファイルの最大サイズ（バイト）。ログファイルのサイズがこのしきい値を超えると、ファイル名が変更されてアーカイブされ、新しいログファイルが作成されます。                                                            |
| `count`                   | 回転ポリシー：ClickHouse が最大で保持する履歴ログファイルの数。                                                                                                                                 |
| `stream_compress`         | LZ4 を使用してログメッセージを圧縮します。`1` または `true` に設定して有効にします。                                                                                                           |
| `console`                 | ログメッセージをログファイルに書き込まず、代わりにコンソールに出力します。`1` または `true` に設定して有効にします。デフォルトは、ClickHouse がデーモンモードで実行していない場合は `1`、それ以外は `0` です。                      |
| `console_log_level`       | コンソール出力のログレベル。デフォルトは `level` です。                                                                                                                                         |
| `formatting`              | コンソール出力のログ形式。現在は `json` のみサポートされています。                                                                                                                                 |
| `use_syslog`              | ログ出力を syslog にも転送します。                                                                                                                                                                |
| `syslog_level`            | syslog へのロギングのためのログレベル。                                                                                                                                                            |

**ログ形式の指定子**

`log` および `errorLog` パスのファイル名は、結果ファイル名用の以下のフォーマット指定子をサポートします（ディレクトリ部分はサポートされていません）。

カラム「例」は `2023-07-06 18:32:07` における出力を示します。

| 指定子    | 説明                                                                                                      | 例                      |
|-----------|----------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`      | リテラル %                                                                                               | `%`                       |
| `%n`      | 改行文字                                                                                                |                          |
| `%t`      | 水平タブ文字                                                                                            |                          |
| `%Y`      | 年を10進数で表したもの（例：2017）                                                                      | `2023`                   |
| `%y`      | 年の最後の2桁を10進数で表したもの（範囲 [00,99]）                                                      | `23`                     |
| `%C`      | 年の最初の2桁を10進数で表したもの（範囲 [00,99]）                                                    | `20`                     |
| `%G`      | 4桁の [ISO 8601 週間ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)、つまり指定された週を含む年です。通常 `%V` と一緒に使用されます。 | `2023`                   |
| `%g`      | [ISO 8601 週間ベースの年](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) の最後の2桁、指定された週を含む年。                                      | `23`                     |
| `%b`      | 短縮月名（例：Oct、ロケール依存）                                                                        | `Jul`                    |
| `%h`      | %b の同義語                                                                                             | `Jul`                    |
| `%B`      | 完全な月名（例：October、ロケール依存）                                                                  | `July`                   |
| `%m`      | 月を10進数で表したもの（範囲 [01,12]）                                                                  | `07`                     |
| `%U`      | その年の週番号（日曜日が週の最初の日、範囲 [00,53]）                                                  | `27`                     |
| `%W`      | その年の週番号（月曜日が週の最初の日、範囲 [00,53]）                                                  | `27`                     |
| `%V`      | ISO 8601 週番号（範囲 [01,53]）                                                                        | `27`                     |
| `%j`      | 年のその日の番号（範囲 [001,366]）                                                                      | `187`                    |
| `%d`      | 月のその日の番号（ゼロ埋めされた10進数、範囲 [01,31]）。単一桁の場合、前にゼロが付きます。                             | `06`                     |
| `%e`      | 月のその日の番号（スペース埋めされた10進数、範囲 [1,31]）。単一桁の場合、前にスペースが付きます。                           | `&nbsp; 6`              |
| `%a`      | 短縮曜日名（例：Fri、ロケール依存）                                                                      | `Thu`                    |
| `%A`      | 完全な曜日名（例：Friday、ロケール依存）                                                                | `Thursday`               |
| `%w`      | 曜日を整数で表したもの（日曜日が0、範囲 [0-6]）                                                       | `4`                      |
| `%u`      | 曜日を10進数で表したもの（ISO 8601 フォーマットで月曜日が1、範囲 [1-7]）                            | `4`                      |
| `%H`      | 24 時間制の時間を10進数で表したもの（範囲 [00-23]）                                                   | `18`                     |
| `%I`      | 12 時間制の時間を10進数で表したもの（範囲 [01,12]）                                                   | `06`                     |
| `%M`      | 分を10進数で表したもの（範囲 [00,59]）                                                                 | `32`                     |
| `%S`      | 秒を10進数で表したもの（範囲 [00,60]）                                                                 | `07`                     |
| `%c`      | 標準の日付と時間の文字列（例：Sun Oct 17 04:41:13 2010、ロケール依存）                                   | `Thu Jul  6 18:32:07 2023` |
| `%x`      | ローカライズされた日付表記（ロケール依存）                                                             | `07/06/23`              |
| `%X`      | ローカライズされた時間の表記（例：18:40:20 または 6:40:20 PM、ロケール依存）                             | `18:32:07`              |
| `%D`      | 短い MM/DD/YY 日付、%m/%d/%y に相当                                                                     | `07/06/23`              |
| `%F`      | 短い YYYY-MM-DD 日付、%Y-%m-%d に相当                                                                   | `2023-07-06`            |
| `%r`      | ローカライズされた 12 時間制の時刻（ロケール依存）                                                     | `06:32:07 PM`           |
| `%R`      | "%H:%M" に相当                                                                                          | `18:32`                  |
| `%T`      | "%H:%M:%S" に相当（ISO 8601 時間形式）                                                                  | `18:32:07`               |
| `%p`      | ローカライズされた a.m. または p.m. の指定（ロケール依存）                                               | `PM`                     |
| `%z`      | ISO 8601 形式の UTC からのオフセット（例：-0430）。タイムゾーン情報が利用できない場合は文字がありません。        | `+0800`                  |
| `%Z`      | ロケール依存のタイムゾーン名または略語。または、タイムゾーン情報が利用できない場合は文字がありません。             | `Z AWST `                |

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

ログメッセージをコンソールにのみ出力する：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**レベルごとのオーバーライド**

個々のログ名のログレベルをオーバーライドできます。例えば、"Backup" と "RBAC" のログメッセージをミュートするため。

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

ログメッセージを syslog にも出力する：

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

`<syslog>` 用のキー：

| キー         | 説明                                                                                                                                                                                                                                                            |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`    | `host\[:port\]` 形式の syslog アドレス。省略されると、ローカルデーモンが使用されます。                                                                                                                                                                          |
| `hostname`   | ログを送信するホストの名前（オプション）。                                                                                                                                                                                                                     |
| `facility`   | syslog [ファシリティキーワード](https://en.wikipedia.org/wiki/Syslog#Facility)。大文字で "LOG_" プレフィックスを付けて指定しなければなりません（例：`LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` など）。`address` を指定した場合はデフォルトで `LOG_USER`、そうでない場合は `LOG_DAEMON` です。                |
| `format`     | ログメッセージフォーマット。可能な値：`bsd` と `syslog`。                                                                                                                                                                                                       |

**ログフォーマット**

コンソールログに出力されるログフォーマットを指定できます。現在は JSON のみがサポートされています。

**例**

JSON ログの出力例：

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

キー名は、`<names>` タグ内の値を変更することによって修正できます。例えば、`DATE_TIME` を `MY_DATE_TIME` に変更したい場合は、`<date_time>MY_DATE_TIME</date_time>` を使用します。

**JSON ログのキーの省略**

ログプロパティは、プロパティをコメントアウトすることによって省略できます。例えば、ログに `query_id` を表示したくない場合は `<query_id>` タグをコメントアウトできます。
## send_crash_reports {#send_crash_reports}

ClickHouse コア開発者チームにクラッシュレポートを送信するための設定。

特に前述の現場での使用においてこれを有効にすることが強く推奨されます。

キー：

| キー                   | 説明                                                                                                                 |
|-----------------------|----------------------------------------------------------------------------------------------------------------------|
| `enabled`             | この機能を有効にするためのブールフラグ。デフォルトは `true` 。クラッシュレポートの送信を避けるためには `false` に設定します。 |
| `send_logical_errors` | `LOGICAL_ERROR` は `assert` のようなもので、ClickHouse のバグです。このブールフラグはこの例外の送信を有効にします（デフォルト：`true`）。                   |
| `endpoint`            | クラッシュレポートを送信するエンドポイント URL をオーバーライドできます。                                                                              |

**推奨使用方法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## ssh_server {#ssh_server}

ホストキーの公開部分は、最初の接続時に SSH クライアント側の known_hosts ファイルに書き込まれます。

ホストキー設定はデフォルトで無効です。ホストキー設定のコメントを外し、対応する ssh キーへのパスを提供して有効にします：

例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## tcp_ssh_port {#tcp_ssh_port}

ユーザーが埋め込みクライアントを使用してインタラクティブな形で接続し、クエリを実行できる SSH サーバーのポート。

例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## storage_configuration {#storage_configuration}

マルチディスクストレージの構成を可能にします。

ストレージ構成は次の構造に従います：

```xml
<storage_configuration>
    <disks>
        <!-- 構成 -->
    </disks>
    <policies>
        <!-- 構成 -->
    </policies>
</storage_configuration>
```
### ディスクの構成 {#configuration-of-disks}

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

上記のサブタグは `disks` のために以下の設定を定義します：

| 設定                     | 説明                                                                                   |
|-------------------------|----------------------------------------------------------------------------------------|
| `<disk_name_N>`         | ユニークであるべきディスクの名前。                                                    |
| `path`                  | サーバーデータが格納されるパス（`data` と `shadow` カタログ）。 `/` で終わる必要があります。 |
| `keep_free_space_bytes` | ディスク上の予約された空きスペースのサイズ。                                           |

:::note
ディスクの順序は重要ではありません。
:::

### ポリシーの設定 {#configuration-of-policies}

上記のサブタグは `policies` の以下の設定を定義します:

| 設定                          | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | ポリシーの名前。ポリシー名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `volume_name_N`              | ボリューム名。ボリューム名は一意である必要があります。                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `disk`                       | ボリューム内にあるディスク。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `max_data_part_size_bytes`   | このボリューム内の任意のディスクに存在できるデータのチャンクの最大サイズ。マージの結果、チャンクサイズが `max_data_part_size_bytes` より大きくなる場合、チャンクは次のボリュームに書き込まれます。基本的には、この機能により新しい / 小さなチャンクをホットな (SSD) ボリュームに保存し、大きなサイズに達した時にコールドな (HDD) ボリュームに移動できます。このオプションは、ポリシーに一つのボリュームしかない場合には使用しないでください。                                                                 |
| `move_factor`                | ボリュームの利用可能な空きスペースの割合。スペースが少なくなると、データは次のボリュームへ転送され始めます。転送の際、チャンクはサイズの大きい方から小さい方へ（降順）にソートされ、`move_factor` 条件を満たすのに十分な総サイズのチャンクが選択されます。全チャンクの総サイズが不十分な場合は、全チャンクが移動します。                                                                                                                     |
| `perform_ttl_move_on_insert` | 挿入時に有効期限が切れたデータを移動することを無効にします。デフォルトでは（有効な場合）、有効期限ルールに従って既に期限切れのデータを挿入すると、即座に移動ルールで指定されたボリューム / ディスクに移動されます。対象のボリューム / ディスクが遅い場合（例えば、S3）、挿入が著しく遅くなる可能性があります。無効にすると、期限切れのデータ部分はデフォルトボリュームに書き込まれ、その後即座に期限切れのTTLに指定されたボリュームに移動されます。                      |
| `load_balancing`             | ディスクバランシングポリシー、`round_robin` または `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `least_used_ttl_ms`          | 利用可能なスペースをすべてのディスクで更新するためのタイムアウト（ミリ秒単位）。`0` - 常に更新、`-1` - 絶対に更新しない、デフォルト値は `60000`。注意: ディスクが ClickHouse のみで使用され、ファイルシステムのリサイズが行われることがない場合は `-1` 値を使用できます。それ以外の場合は推奨されず、最終的に不正確なスペース割り当てにつながります。                                                                                                  |
| `prefer_not_to_merge`        | このボリュームのデータのマージを無効にします。注意: これは潜在的に害を及ぼす可能性があり、スローダウンを引き起こすことがあります。この設定を有効にすると（この設定は行わないでください）、このボリュームでのデータのマージは禁じられます（これは良くありません）。これにより、ClickHouse が遅いディスクとどのように相互作用するかを制御できます。私たちはこの設定の使用を全く推奨しません。                                                                                                                                             |
| `volume_priority`            | ボリュームにデータが書き込まれる優先順位（順序）を定義します。値が小さいほど優先順位が高くなります。パラメータの値は自然数で、1 から N まで（N は指定された最大のパラメータ値）をカバーし、ギャップがあってはいけません。                                                                                                                                                                                                                                                                |

`volume_priority` の場合:
- すべてのボリュームがこのパラメータを持っている場合、指定された順序で優先順位が付けられます。
- 一部のボリュームのみがこのパラメータを持っている場合、持っていないボリュームは最低の優先順位を持ち、持っているボリュームはタグの値に従って優先されます。他のボリュームの優先順位は、設定ファイル内での記述順序によって決まります。
- パラメータが与えられていないボリュームには、設定ファイル内での記述順序に基づいて優先順位が付けられます。
- ボリュームの優先順位は同一であってはなりません。

## マクロ {#macros}

レプリケートテーブルのためのパラメータの置換。

レプリケートテーブルが使用されない場合は省略できます。

詳細については、[レプリケートテーブルの作成](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)のセクションを参照してください。

**例**

```xml
<macros incl="macros" optional="true" />
```

## replica_group_name {#replica_group_name}

データベース Replicated のレプリカグループ名。

Replicated データベースによって作成されるクラスタは、同じグループ内のレプリカで構成されます。
DDL クエリは同じグループ内のレプリカのみを待機します。

デフォルトでは空です。

**例**

```xml
<replica_group_name>backups</replica_group_name>
```

## remap_executable {#remap_executable}

巨大ページを使用して機械コード（"テキスト"）のメモリを再割り当てするための設定。

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
`getrlimit()` 関数が不正確な値を返すため、macOS でこのオプションを使用することを推奨します。
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

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) のテーブルの微調整。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## metric_log {#metric_log}

デフォルトでは無効です。

**有効化**

手動でメトリック履歴収集 [`system.metric_log`](../../operations/system-tables/metric_log.md) をオンにするには、次の内容で `/etc/clickhouse-server/config.d/metric_log.xml` を作成します:

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

`metric_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_metric_log.xml` を作成する必要があります:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## latency_log {#latency_log}

デフォルトでは無効です。

**有効化**

手動でレイテンシ履歴収集 [`system.latency_log`](../../operations/system-tables/latency_log.md) をオンにするには、次の内容で `/etc/clickhouse-server/config.d/latency_log.xml` を作成します:

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

`latency_log` 設定を無効にするには、次の内容で `/etc/clickhouse-server/config.d/disable_latency_log.xml` を作成する必要があります:

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```

## replicated_merge_tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) のテーブルの微調整。この設定は優先度が高いです。

詳細については、MergeTreeSettings.h ヘッダーファイルを参照してください。

**例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```

## opentelemetry_span_log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) システムテーブルのための設定。

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

SSL クライアント/サーバー設定。

SSL のサポートは `libpoco` ライブラリによって提供されます。使用可能な設定オプションは [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) に説明されています。デフォルト値は [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) に記載されています。

サーバー/クライアント設定のためのキー:

| オプション                    | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                            | デフォルト値                              |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | PEM 証明書の秘密鍵を含むファイルへのパス。このファイルには鍵と証明書の両方を含めることができます。                                                                                                                                                                                                                                                                                                                                                               |                                            |
| `certificateFile`             | PEM 形式のクライアント/サーバー証明書ファイルへのパス。`privateKeyFile` に証明書が含まれている場合は省略できます。                                                                                                                                                                                                                                                                                                                                          |                                            |
| `caConfig`                    | 信頼できる CA 証明書を含むファイルまたはディレクトリへのパス。このファイルが PEM 形式で複数の CA 証明書を含む場合、ディレクトリが CA 証明書ごとに 1 つの .pem ファイルを含む必要があります。ファイル名は CA サブジェクト名のハッシュ値によって参照されます。詳細は [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) の man ページを参照してください。 |                                            |
| `verificationMode`            | ノードの証明書を検証する方法。詳細は [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) クラスの説明にあります。可能な値: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                          | `relaxed`                                  |
| `verificationDepth`           | 検証チェーンの最大長。証明書チェーンの長さが設定値を超えると、検証に失敗します。                                                                                                                                                                                                                                                                                                                                                                                  | `9`                                        |
| `loadDefaultCAFile`           | OpenSSL の組込み CA 証明書が使用されるかどうか。ClickHouse は組込み CA 証明書がファイル `/etc/ssl/cert.pem` (もしくはディレクトリ `/etc/ssl/certs`) または環境変数 `SSL_CERT_FILE`（もしくは `SSL_CERT_DIR`）で指定されたファイル（またはディレクトリ）にあると仮定します。                                                                                                                                                                            | `true`                                     |
| `cipherList`                  | サポートする OpenSSL 暗号化。                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | セッションのキャッシュを有効または無効にします。`sessionIdContext` と併用する必要があります。受け入れ可能な値: `true`, `false`.                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`            | サーバーが生成した各識別子に追加するランダム文字のユニークなセット。文字列の長さは `SSL_MAX_SSL_SESSION_ID_LENGTH` を超えてはなりません。このパラメータは、サーバーがセッションをキャッシュしている場合でも、クライアントがキャッシュを要求した場合でも問題を回避するのに役立つため、常に推奨されます。                                                                                                                                                                              | `$\{application.name\}`                      |
| `sessionCacheSize`            | サーバーがキャッシュするセッションの最大数。`0` の値は無制限セッションを意味します。                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | サーバー上でのセッションキャッシュの時間（時間単位）。                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | 有効にすると、証明書の CN または SAN がピアのホスト名と一致するかどうかを検証します。                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | TLSv1 接続を要求します。受け入れ可能な値: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | TLSv1.1 接続を要求します。受け入れ可能な値: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | TLSv1.2 接続を要求します。受け入れ可能な値: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | OpenSSL FIPS モードをアクティブにします。ライブラリの OpenSSL バージョンが FIPS をサポートしている場合。                                                                                                                                                                                                                                                                                                                                                                              | `false`                                    |
| `privateKeyPassphraseHandler` | 秘密鍵にアクセスするためのパスフレーズを要求するクラス（PrivateKeyPassphraseHandler のサブクラス）。例えば: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                           | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | 無効な証明書を検証するためのクラス（CertificateHandler のサブクラス）。例えば: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` 。                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | 使用が許可されないプロトコル。                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | クライアントが優先するサーバーの暗号。                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

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
        <!-- 自己署名に使用: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 自己署名に使用: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```

## part_log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) に関連するイベントのロギング。例えば、データの追加またはマージ。ログを使用してマージアルゴリズムをシミュレートし、その特性を比較できます。マージプロセスを視覚化することができます。

クエリは [system.part_log](/operations/system-tables/part_log) テーブルにロギングされ、別のファイルには保存されません。このテーブルの名前は `table` パラメータで設定できます（詳細は下記参照）。

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

[`processors_profile_log`](../system-tables/processors_profile_log.md) システムテーブルのための設定。

<SystemLogParameters/>

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

[Prometheus](https://prometheus.io) からスクレイピングするためのメトリックデータを公開します。

設定:

- `endpoint` – prometheus サーバーによるメトリックのスクレイピングのための HTTP エンドポイント。 `/` から始まります。
- `port` – `endpoint` のためのポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルのメトリックを公開します。
- `events` – [system.events](/operations/system-tables/events) テーブルのメトリックを公開します。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリック値を公開します。
- `errors` - サーバーの最後の再起動以降に発生したエラーコードによるエラーの数を公開します。この情報は [system.errors](/operations/system-tables/errors) から取得できます。

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

チェック (ここで `127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えます):
```bash
curl 127.0.0.1:9363/metrics
```

## query_log {#query_log}

[log_queries=1](../../operations/settings/settings.md) 設定で受信したクエリをロギングするための設定。

クエリは [system.query_log](/operations/system-tables/query_log) テーブルにロギングされ、別のファイルには保存されません。テーブル名は `table` パラメータで変更できます（詳細は下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouse はこれを作成します。ClickHouse サーバーが更新された際にクエリログの構造が変更された場合、古い構造のテーブルはリネームされ、新しいテーブルが自動的に作成されます。

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

メトリック履歴収集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md) を手動でオンにするには、次の内容の `/etc/clickhouse-server/config.d/query_metric_log.xml` を作成します。

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

`query_metric_log` 設定を無効にするには、次の内容のファイル `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` を作成してください。

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

[クエリキャッシュ](../query-cache.md) の設定。

次の設定が利用可能です。

| 設定                       | 説明                                                                                   | デフォルト値      |
|---------------------------|----------------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | キャッシュの最大サイズ（バイト単位）。`0` はクエリキャッシュが無効であることを意味します。     | `1073741824`  |
| `max_entries`             | キャッシュに保存される `SELECT` クエリの結果の最大数。                                    | `1024`        |
| `max_entry_size_in_bytes` | キャッシュに保存される `SELECT` クエリの結果の最大サイズ（バイト単位）。                    | `1048576`     |
| `max_entry_size_in_rows`  | キャッシュに保存される `SELECT` クエリの結果の最大行数。                                | `30000000`    |

:::note
- 変更された設定は直ちに有効になります。
- クエリキャッシュ用のデータは DRAM に割り当てられます。メモリが不足している場合は、`max_size_in_bytes` を小さな値に設定するか、クエリキャッシュを完全に無効にしてください。
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

クエリは、[system.query_thread_log](/operations/system-tables/query_thread_log) テーブルにログ記録され、別のファイルに記録されることはありません。テーブル名は `table` パラメータで変更できます（下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouse はそれを作成します。ClickHouse サーバーが更新された際にクエリスレッドログの構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

[log_query_views=1](/operations/settings/settings#log_query_views) 設定で受信したクエリに依存するビュー（ライブ、マテリアライズドなど）をログに記録するための設定。

クエリは [system.query_views_log](/operations/system-tables/query_views_log) テーブルにログ記録され、別のファイルには記録されません。テーブル名は `table` パラメータで変更できます（下記参照）。

<SystemLogParameters/>

テーブルが存在しない場合、ClickHouse はそれを作成します。ClickHouse サーバーが更新された際にクエリビューのログ構造が変更された場合、古い構造のテーブルは名前が変更され、新しいテーブルが自動的に作成されます。

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

| 設定 | 説明                                                                                                                                                                                                        | デフォルト値       |
|------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `level` | テーブルに保存される最大メッセージレベル（デフォルトは `Trace`）。                                                                                                                                         | `Trace`             |

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
## asynchronous_insert_log {#asynchronous_insert_log}

非同期挿入のログを記録するための [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) システムテーブルの設定。

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

[crash_log](../../operations/system-tables/crash-log.md) システムテーブル操作の設定。

<SystemLogParameters/>

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
## custom_cached_disks_base_directory {#custom_cached_disks_base_directory}

この設定は、カスタム（SQL によって作成された）キャッシュディスクのキャッシュパスを指定します。 
`custom_cached_disks_base_directory` は `filesystem_caches_path`（`filesystem_caches_path.xml` に見られる）よりもカスタムディスクに対して優先度が高く、前者がない場合に使用されます。
ファイルシステムキャッシュ設定パスはそのディレクトリ内である必要があり、そうでない場合はディスクを作成できなくなる例外がスローされます。

:::note
この設定は、サーバーがアップグレードされた古いバージョンで作成されたディスクには影響を及ぼしません。
この場合、サーバーが正常に起動できるようにするために例外はスローされません。
:::

例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## backup_log {#backup_log}

`BACKUP` および `RESTORE` 操作のログを記録するための [backup_log](../../operations/system-tables/backup_log.md) システムテーブルの設定。

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
    <database>system</database
    <table>blob_storage_log</table
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```
## query_masking_rules {#query_masking_rules}

クエリおよびすべてのログメッセージに適用される正規表現ベースのルール。これらはサーバーログに保存されます。
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) テーブル及びクライアントに送信されるログに適用されます。これにより、SQL クエリからの名前、メールアドレス、個人識別子またはクレジットカード番号などの機密データの漏洩を防止できます。

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

| 設定     | 説明                                                                       |
|----------|----------------------------------------------------------------------------|
| `name`   | ルールの名前（オプション）                                                |
| `regexp` | RE2 互換の正規表現（必須）                                               |
| `replace`| 機密データの代替文字列（オプション、デフォルトで 6 つのアスタリスク） |

マスキングルールは、クエリ全体に適用されます（不正確または解析不可能なクエリからの機密データの漏洩を防止するため）。

[`system.events`](/operations/system-tables/events) テーブルには `QueryMaskingRulesMatch` カウンタがあり、クエリマスキングルールの一致回数を示します。

分散クエリでは、各サーバーを別々に設定する必要があります。そうでない場合、他のノードに渡されたサブクエリはマスキングなしで保存されます。
## remote_servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンと `cluster` テーブル関数で使用されるクラスターの設定。

**例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 属性の値については、"[設定ファイル](/operations/configuration-files)" セクションを参照してください。

**関連リンク**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [クラスタ検出](../../operations/cluster-discovery.md)
- [レプリケーションクラスターデータベースエンジン](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

URL 関連のストレージエンジンやテーブル関数で使用が許可されるホストのリスト。

`<host>` XML タグでホストを追加する際には、次のことを考慮する必要があります。
- URL と同じように正確に指定する必要があり、名前は DNS 解決の前にチェックされます。例えば：`<host>clickhouse.com</host>`
- ポートが URL で明示的に指定されている場合、host:port 全体がチェックされます。例えば：`<host>clickhouse.com:80</host>`
- ポートなしでホストが指定されている場合、そのホストの任意のポートが許可されます。例えば：`<host>clickhouse.com</host>` が指定されている場合、`clickhouse.com:20`（FTP）、`clickhouse.com:80`（HTTP）、`clickhouse.com:443`（HTTPS）などが許可されます。
- IP アドレスとしてホストが指定されている場合は、URL に明示されている通りにチェックされます。例えば：`[2a02:6b8:a::a]`。
- リダイレクトがあり、リダイレクトがサポートされている場合、すべてのリダイレクト（location フィールド）がチェックされます。

例えば：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## timezone {#timezone}

サーバーのタイムゾーン。

UTC タイムゾーンまたは地理的ロケーションの IANA 識別子で指定されます（例えば、Africa/Abidjan）。

タイムゾーンは、String と DateTime 形式間での変換に必要です。DateTime フィールドがテキスト形式に出力されるとき（画面表示やファイルへの印刷時）、文字列から DateTime を取得する時に必要です。また、タイムゾーンは、入力パラメータでタイムゾーンを受け取らなかった場合に、時間や日付で動作する関数にも使用されます。

**例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**参照してください**

- [session_timezone](../settings/settings.md#session_timezone)
## tcp_port {#tcp_port}

TCP プロトコル経由でクライアントと通信するためのポート。

**例**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

クライアントとの安全な通信のための TCP ポート。 [OpenSSL](#openssl) 設定とともに使用します。

**デフォルト値**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## mysql_port {#mysql_port}

MySQL プロトコル経由でクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します。
- 空の値は MySQL プロトコル経由でのクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<mysql_port>9004</mysql_port>
```
## postgresql_port {#postgresql_port}

PostgreSQL プロトコル経由でクライアントと通信するためのポート。

:::note
- 正の整数はリッスンするポート番号を指定します。
- 空の値は MySQL プロトコル経由でのクライアントとの通信を無効にするために使用されます。
:::

**例**

```xml
<postgresql_port>9005</postgresql_port>
```
## tmp_path {#tmp_path}

大きなクエリの処理における一時データを保存するためのローカルファイルシステム上のパス。

:::note
- 一時データストレージを設定するためには、次のいずれかのオプションを使用できます：`tmp_path`, `tmp_policy`, `temporary_data_in_cache`。
- 後ろのスラッシュは必須です。
:::

**例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

短縮された URL プレフィックスまたは記号を完全な URL に変換するための設定。

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

ユーザーファイルのあるディレクトリ。 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) テーブル関数で使用されます。

**例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path}

ユーザースクリプトファイルのあるディレクトリ。 実行可能なユーザー定義関数 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions) に使用されます。

**例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

タイプ：

デフォルト：
## user_defined_path {#user_defined_path}

ユーザー定義ファイルのあるディレクトリ。 SQL ユーザー定義関数 [SQL User Defined Functions](/sql-reference/functions/udf) に使用されます。

**例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## users_config {#users_config}

次の情報を含むファイルへのパス：

- ユーザー設定。
- アクセス権。
- 設定プロファイル。
- クォータ設定。

**例**

```xml
<users_config>users.xml</users_config>
```
## access_control_improvements {#access_control_improvements}

アクセス制御システムのオプションの改善設定。

| 設定                                        | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | デフォルト |
|---------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `users_without_row_policies_can_read_rows` | 列挙政策がないユーザーが `SELECT` クエリを使用して行を読むことができるか設定します。例えば、ユーザー A と B がいて、A のみに対して行ポリシーが定義されている場合、この設定が true であれば、ユーザー B はすべての行を見ます。この設定が false であれば、ユーザー B は行を見ません。                                                                                                                                                                                                            | `true`   |
| `on_cluster_queries_require_cluster_grant` | `ON CLUSTER` クエリが `CLUSTER` 権限を要求するか設定します。                                                                                                                                                                                                                                                                                                                                                                                                                                          | `true`   |
| `select_from_system_db_requires_grant`     | `SELECT * FROM system.<table>` が権限を要求し、任意のユーザーが実行できるか設定します。true に設定されると、このクエリは `GRANT SELECT ON system.<table>` を要求しますが、一般のテーブルに対しても同様です。例外として、いくつかのシステムテーブル（`tables`、`columns`、`databases` そして `one`、`contributors` などの定数テーブル）はすべてのユーザーにアクセス可能であり、`SHOW` 特権（例：`SHOW USERS`）が付与されている場合は、その対応するシステムテーブル（すなわち `system.users`）にアクセス可能です。 | `true`   |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` が権限を要求し、任意のユーザーが実行できるか設定します。true に設定されると、このクエリは `GRANT SELECT ON information_schema.<table>` を要求します。                                                                                                                                                                                                                                                                                                       | `true`   |
| `settings_constraints_replace_previous`    | 設定プロファイル内の特定の設定に対する制約が、以前の制約のアクションをキャンセルするか設定します（他のプロファイル内で定義されたものを含む）。新しい制約によって設定されていないフィールドも含まれます。また、`changeable_in_readonly` 制約タイプを有効にします。                                                                                                                                                               | `true`   |
| `table_engines_require_grant`              | 特定のテーブルエンジンを使用したテーブルの作成には権限が必要か設定します。                                                                                                                                                                                                                                                                                                                                                                                                                           | `false`  |
| `role_cache_expiration_time_seconds`       | ロールが最後にアクセスされた後の秒数をロールキャッシュに保存します。                                                                                                                                                                                                                                                                                                                                                                                                                                  | `600`    |

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

ClickHouseが[ZooKeeper](http://zookeeper.apache.org/)クラスターと対話するための設定を含みます。ClickHouseは、レプリケートされたテーブルを使用する際に、レプリカのメタデータを保存するためにZooKeeperを使用します。レプリケートされたテーブルを使用しない場合、このパラメーターのセクションは省略できます。

以下の設定は、サブタグによって構成できます：

| 設定                                       | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                     | ZooKeeperのエンドポイント。複数のエンドポイントを設定できます。例：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index`属性は、ZooKeeperクラスターへの接続を試みるときのノードの順序を指定します。                                                                                                                                                                                                                                                                                            |
| `session_timeout_ms`                       | クライアントセッションの最大タイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                     | 1つの操作に対する最大タイムアウト（ミリ秒単位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `root` (オプション)                        | ClickHouseサーバーが使用するznodeのルートとして使用されるznode。                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min` (オプション) | プライマリが利用できない場合（負荷分散）にフォールバックノードへのZooKeeperセッションの寿命の最小限界。秒単位で設定します。デフォルト値：3時間。                                                                                                                                                                                                                                                                                                                                                              |
| `fallback_session_lifetime.max` (オプション) | プライマリが利用できない場合（負荷分散）にフォールバックノードへのZooKeeperセッションの寿命の最大限界。秒単位で設定します。デフォルト値：6時間。                                                                                                                                                                                                                                                                                                                                                              |
| `identity` (オプション)                    | ZooKeeperが要求されたznodeにアクセスするために必要とするユーザー名とパスワード。                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression` (オプション)             | trueに設定すると、Keeperプロトコルでの圧縮を有効にします。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

また、ZooKeeperノード選択のアルゴリズムを選択できる`zookeeper_load_balancing`設定（オプション）もあります：

| アルゴリズム名               | 説明                                                                                                                    |
|------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `random`                     | ZooKeeperノードの1つをランダムに選択します。                                                                                       |
| `in_order`                   | 最初のZooKeeperノードを選択し、利用できない場合は次のノードを選択します。                                            |
| `nearest_hostname`           | サーバーのホスト名に最も似たZooKeeperノードを選択し、ホスト名は名前のプレフィックスと比較されます。 |
| `hostname_levenshtein_distance` | nearest_hostnameのように動作しますが、ホスト名をレーヴェンシュタイン距離に基づいて比較します。                                         |
| `first_or_random`            | 最初のZooKeeperノードを選択し、利用できない場合は残りのZooKeeperノードの1つをランダムに選択します。                |
| `round_robin`                | 最初のZooKeeperノードを選択し、再接続が発生した場合は次のノードを選択します。                                                    |

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

**参照**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper Programmer's Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouseとZooKeeper間のオプションのセキュア通信](/operations/ssl-zookeeper)

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeperにおけるデータパートヘッダーのストレージ方法。この設定は[`MergeTree`](/engines/table-engines/mergetree-family)ファミリーにのみ適用されます。次のように指定できます：

**グローバルに`config.xml`ファイルの[merge_tree](#merge_tree)セクションで**

ClickHouseは、この設定をサーバー上のすべてのテーブルに使用します。設定はいつでも変更できます。設定が変更されると、既存のテーブルの動作が変わります。

**各テーブルに対して**

テーブルを作成する際に、対応する[エンジン設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)を指定します。この設定を持つ既存のテーブルの動作は、グローバル設定が変更されても変更されません。

**可能な値**

- `0` — 機能はオフになります。
- `1` — 機能はオンになります。

もし[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)の場合、[レプリケートされた](../../engines/table-engines/mergetree-family/replication.md)テーブルは、データパーツのヘッダーを1つの`znode`を使用してコンパクトに保存します。テーブルが多くのカラムを含む場合、このストレージ方法はZooKeeperに保存されるデータのボリュームを大幅に削減します。

:::note
`use_minimalistic_part_header_in_zookeeper = 1`を適用した後、ClickHouseサーバーをこの設定をサポートしていないバージョンにダウングレードすることはできません。クラスタ内のサーバーでClickHouseをアップグレードする際は注意が必要です。すべてのサーバーを一度にアップグレードしないでください。派生環境での新しいバージョンのClickHouseのテスト、またはクラスタ内のごく少数のサーバーでのテストが安全です。

すでにこの設定で保存されたデータパートヘッダーは、以前の（非コンパクト）表現に復元することはできません。
:::

## distributed_ddl {#distributed_ddl}

クラスター上で[分散DDLクエリ](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）を管理します。
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper)が有効になっている場合にのみ機能します。

`<distributed_ddl>`内で構成可能な設定には以下が含まれます：

| 設定                  | 説明                                                                                                                       | デフォルト値                          |
|------------------------|---------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| `path`                 | DDLクエリの`task_queue`のためのKeeper内のパス                                                                           |                                        |
| `profile`              | DDLクエリを実行するために使用されるプロファイル                                                                         |                                        |
| `pool_size`            | 同時に実行できる`ON CLUSTER`クエリの数                                                                               |                                        |
| `max_tasks_in_queue`   | キューに存在できるタスクの最大数                                                                                         | `1,000`                                |
| `task_max_lifetime`    | ノードの年齢がこの値を超えた場合、ノードを削除します。                                                                    | `7 * 24 * 60 * 60`（秒単位の1週間）   |
| `cleanup_delay_period` | 新しいノードイベントが受信された後、最後のクリーンアップが`cleanup_delay_period`秒よりも早く行われていない場合にのみクリーンアップが開始されます。 | `60`秒                               |

**例**

```xml
<distributed_ddl>
    <!-- DDLクエリとキューのZooKeeper内のパス -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- このプロファイルからの設定がDDLクエリ実行に使用されます -->
    <profile>default</profile>

    <!-- 同時に実行できるON CLUSTERクエリの数を制御します。 -->
    <pool_size>1</pool_size>

    <!--
         クリーンアップ設定（アクティブなタスクは削除されません）
    -->

    <!-- タスクTTLを制御します（デフォルトは1週間） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- クリーンアップを行う頻度を制御します（秒単位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- キューに存在できるタスクの数を制御します -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## access_control_path {#access_control_path}

ClickHouseサーバーがSQLコマンドによって作成されたユーザーとロールの設定を保存するフォルダへのパス。

**参照**

- [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)

## allow_plaintext_password {#allow_plaintext_password}

プレーンテキストパスワードタイプ（安全でない）の使用を許可するかどうかを設定します。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_no_password {#allow_no_password}

安全でないパスワードタイプのno_passwordを許可するかどうかを設定します。

```xml
<allow_no_password>1</allow_no_password>
```
## allow_implicit_no_password {#allow_implicit_no_password}

'IDENTIFIED WITH no_password'が明示的に指定されていない限り、パスワードなしでユーザーの作成を禁止します。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## default_session_timeout {#default_session_timeout}

デフォルトのセッションタイムアウト（秒単位）。

```xml
<default_session_timeout>60</default_session_timeout>
```
## default_password_type {#default_password_type}

`CREATE USER u IDENTIFIED BY 'p'`のようなクエリに自動的に設定されるパスワードタイプを設定します。

受け入れられる値は：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## user_directories {#user_directories}

次の設定を含む構成ファイルのセクション：
- 事前定義されたユーザーを含む設定ファイルへのパス。
- SQLコマンドによって作成されたユーザーが保存されるフォルダへのパス。
- SQLコマンドによって作成され、レプリケートされたユーザーが保存されるZooKeeperノードパス（実験的）。

このセクションが指定されると、[users_config](/operations/server-configuration-parameters/settings#users_config)および[access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path)のパスは使用されません。

`user_directories`セクションは任意の数の項目を含むことができ、項目の順序はその優先順位を意味します（上位の項目ほど優先順位が高い）。

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

ユーザー、ロール、行ポリシー、クォータ、およびプロファイルはZooKeeperにも保存できます：

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

ユーザー定義されていないリモートユーザーディレクトリとしてLDAPサーバーを追加することもできます。これは、LDAPサーバーから取得した各ユーザーに、ローカルで定義された役割を割り当てる必要があります。

ローカルで定義された役割のリストが含まれる`roles`セクションを定義します。役割が指定されていない場合、ユーザーは認証後に何のアクションも実行できません。指定された役割のいずれかが認証時にローカルで定義されていない場合、その認証試行は、提供されたパスワードが不正のように失敗します。

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

各エントリが`<name>/path/to/file</name>`の形式となるカスタムのトップレベルドメインのリストを定義します。

例えば：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

参照：
- 関数[`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom)およびその変種、
  カスタムTLDリスト名を受け取り、最初の重要なサブドメインまでの部分を含むドメインを返します。

## proxy {#proxy}

HTTPおよびHTTPSリクエストのためのプロキシサーバーを定義します。現在はS3ストレージ、S3テーブル関数およびURL関数がサポートされています。

プロキシサーバーを定義する方法は3つあります：
- 環境変数
- プロキシリスト
- リモートプロキシリゾルバー。

特定のホストに対してプロキシサーバーをバイパスすることも、`no_proxy`を使用してサポートされています。

**環境変数**

`http_proxy`および`https_proxy`環境変数を使用して、特定のプロトコルのプロキシサーバーを指定できます。システムに設定されていれば、シームレスに動作するはずです。

特定のプロトコルのプロキシサーバーが1つだけで、そのプロキシサーバーが変更されない場合、このアプローチは最もシンプルです。

**プロキシリスト**

このアプローチでは、プロトコルのプロキシサーバーを1つ以上指定できます。1つ以上のプロキシサーバーが定義されている場合、ClickHouseはラウンドロビン方式で異なるプロキシを使用してサーバー間の負荷を均等にします。このアプローチは、プロトコルのプロキシサーバーが1つ以上あり、そのプロキシサーバーリストが変わらない場合に最もシンプルです。

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
以下のタブで親フィールドを選択して、その子を表示します：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド     | 説明                         |
|----------------|------------------------------|
| `<http>`       | 1つ以上のHTTPプロキシのリスト  |
| `<https>`      | 1つ以上のHTTPSプロキシのリスト |

  </TabItem>
  <TabItem value="http_https" label="<http>および<https>">

| フィールド   | 説明          |
|--------------|----------------|
| `<uri>`     | プロキシのURI |

  </TabItem>
</Tabs>

**リモートプロキシリゾルバー**

プロキシサーバーが動的に変更される可能性があります。その場合、リゾルバーのエンドポイントを定義できます。ClickHouseはそのエンドポイントに空のGETリクエストを送信し、リモートリゾルバーはプロキシホストを返すべきです。ClickHouseは以下のテンプレートを使用してプロキシURIを形成します：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

以下のタブで親フィールドを選択して、その子を表示します：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| フィールド    | 説明                      |
|---------------|---------------------------|
| `<http>`      | 1つ以上のリゾルバーのリスト* |
| `<https>`     | 1つ以上のリゾルバーのリスト* |

  </TabItem>
  <TabItem value="http_https" label="<http>および<https>">

| フィールド     | 説明                                   |
|----------------|----------------------------------------|
| `<resolver>`   | リゾルバーのエンドポイントおよびその他の詳細 |

  </TabItem>
</Tabs>

:::note
複数の`<resolver>`要素を持つことができますが、特定のプロトコルに対して使用されるのは最初の`<resolver>`のみです。その他のプロトコルの`<resolver>`要素は無視されます。つまり、必要に応じてロードバランシングはリモートリゾルバーによって実装されるべきです。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| フィールド               | 説明                                                                                                                                                                            |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`             | プロキシリゾルバーのURI                                                                                                                                                          |
| `<proxy_scheme>`          | 最終的なプロキシURIのプロトコル。これは`http`または`https`のいずれかです。                                                                                                              |
| `<proxy_port>`           | プロキシリゾルバーのポート番号                                                                                                                                                  |
| `<proxy_cache_time>`      | リゾルバーからの値がClickHouseによってキャッシュされる時間（秒単位）。この値を`0`に設定すると、ClickHouseはすべてのHTTPまたはHTTPSリクエストに対してリゾルバーに連絡します。 |

  </TabItem>
</Tabs>

**優先順位**

プロキシ設定は以下の順序で決定されます：

| 順序 | 設定                |
|-------|---------------------|
| 1.    | リモートプロキシリゾルバー |
| 2.    | プロキシリスト            |
| 3.    | 環境変数               |

ClickHouseは、要求プロトコルのための最も高い優先順位のリゾルバータイプを確認します。それが定義されていない場合、次の高い優先順位のリゾルバータイプを確認し、環境リゾルバーに達するまで続けます。これにより、リゾルバータイプの混在も使用できます。

## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

デフォルトでは、トンネリング（つまり、`HTTP CONNECT`）がHTTPプロキシ経由でHTTPSリクエストを行うために使用されます。この設定はそれを無効にするために使用できます。

**no_proxy**

デフォルトでは、すべてのリクエストがプロキシを経由します。特定のホストに対してそれを無効にするために、`no_proxy`変数を設定する必要があります。
これは、リストおよびリモートリゾルバーの`<proxy>`句の内部で、環境リゾルバーの環境変数として設定できます。
IPアドレス、ドメイン、サブドメイン、およびフルバイパスのための`'*'`ワイルドカードをサポートしています。先頭のドットは、curlのように取り除かれます。

**例**

以下の構成では、`clickhouse.cloud`およびすべてのサブドメイン（例：`auth.clickhouse.cloud`）へのプロキシリクエストをバイパスします。
このことはGitLabにも当てはまりますが、先頭にドットがあります。`gitlab.com`および`about.gitlab.com`の両方がプロキシをバイパスします。

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

すべての`CREATE WORKLOAD`および`CREATE RESOURCE`クエリのストレージに使用されるディレクトリ。デフォルトでは、サーバーの作業ディレクトリの下に`/workload/`フォルダが使用されます。

**例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**参照**
- [ワークロード階層](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)

## workload_zookeeper_path {#workload_zookeeper_path}

すべての`CREATE WORKLOAD`および`CREATE RESOURCE`クエリのストレージとして使用されるZooKeeperノードへのパス。一貫性のために、すべてのSQL定義はこの単一のznodeの値として保存されます。デフォルトではZooKeeperは使用されず、定義は[ディスク](#workload_path)に保存されます。

**例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**参照**
- [ワークロード階層](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
