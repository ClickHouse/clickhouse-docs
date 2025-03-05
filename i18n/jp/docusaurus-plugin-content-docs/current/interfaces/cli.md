---
slug: /interfaces/cli
sidebar_position: 17
sidebar_label: ClickHouseクライアント
title: ClickHouseクライアント
---

import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png'

ClickHouseは、ClickHouseサーバーに対して直接SQLクエリを実行するためのネイティブコマンドラインクライアントを提供します。インタラクティブモード（ライブクエリ実行用）とバッチモード（スクリプト作成および自動化用）の両方をサポートしています。クエリの結果はターミナルに表示することも、ファイルにエクスポートすることもでき、Pretty、CSV、JSONなどのすべてのClickHouse出力 [形式](formats.md) をサポートしています。

クライアントは、クエリ実行に関するリアルタイムフィードバックを提供し、プログレスバー、読み取られた行数、処理されたバイト数、およびクエリ実行時間を表示します。[コマンドラインオプション](#command-line-options) と [設定ファイル](#configuration_files) の両方をサポートしています。


## インストール {#install}

ClickHouseをダウンロードするには、次のコマンドを実行します。

```bash
curl https://clickhouse.com/ | sh
```

インストールも行うには、次のコマンドを実行します：
```bash
sudo ./clickhouse install
```

さらに多くのインストールオプションについては、[ClickHouseのインストール](../getting-started/install.md)を参照してください。

異なるクライアントとサーバーのバージョンは互換性がありますが、一部の機能は古いクライアントでは使用できない場合があります。クライアントとサーバーで同じバージョンを使用することを推奨します。


## 実行 {#run}

:::note
ClickHouseをダウンロードしただけでインストールしていない場合は、`./clickhouse client`を使用してください。
:::

ClickHouseサーバーに接続するには、次のコマンドを実行します：

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

必要に応じて追加の接続詳細を指定します：

**`--port <port>`** - ClickHouseサーバーが接続を受け付けているポート。デフォルトのポートは9440（TLS）および9000（TLSなし）です。ClickHouseクライアントはネイティブプロトコルを使用するため、HTTP(S)ではありません。

**`-s [ --secure ]`** - TLSを使用するかどうか（通常は自動検出されます）。

**`-u [ --user ] <username>`** - 接続するデータベースユーザー。デフォルトでは`default`ユーザーとして接続します。

**`--password <password>`** - データベースユーザーのパスワード。接続のためのパスワードを設定ファイルで指定することもできます。パスワードを指定しない場合、クライアントは入力を要求します。

**`-c [ --config ] <path-to-file>`** - ClickHouseクライアントの設定ファイルの場所。デフォルトの位置にない場合。詳細は [設定ファイル](#configuration_files) を参照してください。

**`--connection <name>`** - 設定ファイルからの事前設定された接続詳細の名前。

コマンドラインオプションの完全なリストについては、[コマンドラインオプション](#command-line-options)を参照してください。


### ClickHouse Cloudへの接続 {#connecting-cloud}

ClickHouse Cloudサービスの詳細は、ClickHouse Cloudコンソールで確認できます。接続したいサービスを選択し、**接続**をクリックします：

<img src={cloud_connect_button}
  class="image"
  alt="ClickHouse Cloudサービスの接続ボタン"
  style={{width: '30em'}} />

<br/><br/>

**ネイティブ**を選択すると、詳細と例の`clickhouse-client`コマンドが表示されます：

<img src={connection_details_native}
  class="image"
  alt="ClickHouse CloudネイティブTCP接続詳細"
  style={{width: '40em'}} />


### 設定ファイルに接続を保存 {#connection-credentials}

1つ以上のClickHouseサーバーの接続詳細を[設定ファイル](#configuration_files)に保存できます。

フォーマットは次のようになります：
```xml
<config>
    <connections_credentials>
        <name>default</name>
        <hostname>hostname</hostname>
        <port>9440</port>
        <secure>1</secure>
        <user>default</user>
        <password>password</password>
    </connections_credentials>
</config>
```

詳細については、[設定ファイルに関するセクション](#configuration_files)を参照してください。

:::note
クエリ構文に集中するため、残りの例では接続の詳細（`--host`、`--port`など）を省略しています。コマンドを使用するときは、それらを追加することを忘れないでください。
:::


## バッチモード {#batch-mode}

ClickHouseクライアントをインタラクティブに使用する代わりに、バッチモードで実行できます。

次のように単一のクエリを指定できます：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

`--query`コマンドラインオプションを使用することもできます：

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

`stdin`でクエリを提供できます：

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

データの挿入：

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query`を指定すると、入力は行の改行の後に要求に追加されます。

**リモートClickHouseサービスへのCSVファイルの挿入**

この例では、サンプルデータセットCSVファイル`cell_towers.csv`を、既存のテーブル`cell_towers`に挿入しています。データベースは`default`です：

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

**データ挿入の他の例**

``` bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```


## 注意事項 {#notes}

インタラクティブモードでは、デフォルトの出力形式は`PrettyCompact`です。クエリの`FORMAT`句で形式を変更するか、`--format`コマンドラインオプションを指定することができます。垂直フォーマットを使用するには、`--vertical`を使用するか、クエリの最後に`\G`を指定します。この形式では、各値が別の行に印刷されるため、幅の広いテーブルに便利です。

バッチモードでは、デフォルトのデータ [形式](formats.md) は`TabSeparated`です。形式はクエリの`FORMAT`句で設定できます。

インタラクティブモードでは、デフォルトでエンターを押すと入力したものが実行されます。クエリの最後にセミコロンは不要です。

クライアントを`-m, --multiline`パラメーターで起動できます。複数行のクエリを入力するには、行の改行の前にバックスラッシュ`\`を入力します。エンターを押すと、次の行のクエリを入力するよう求められます。クエリを実行するには、セミコロンで終了させてエンターを押します。

ClickHouseクライアントは`replxx`（`readline`に似ている）に基づいているため、親しみのあるキーボードショートカットを使用し、履歴を保持します。履歴はデフォルトで`~/.clickhouse-client-history`に書き込まれます。

クライアントを終了するには、`Ctrl+D`を押すか、次のいずれかを入力します： `exit`, `quit`, `logout`, `exit;`, `quit;`, `logout;`, `q`, `Q`, `:q`。

クエリを処理する際、クライアントは次のことを表示します：

1.  進捗は、デフォルトでは1秒間に10回以上更新されません。クイッククエリの場合、進捗が表示される時間がないかもしれません。
2.  デバッグ用に解析後のフォーマットされたクエリ。
3.  指定された形式での結果。
4.  結果の行数、経過時間、クエリ処理の平均速度。すべてのデータ量は圧縮されていないデータに関連します。

長いクエリをキャンセルするには`Ctrl+C`を押します。ただし、サーバーがリクエストを中止するまでしばらく待つ必要があります。特定の段階でクエリをキャンセルすることはできません。待たずにもう一度`Ctrl+C`を押すと、クライアントは終了します。

ClickHouseクライアントでは、外部データ（外部一時テーブル）を使用してクエリを実行できます。詳細については、[クエリ処理のための外部データ](../engines/table-engines/special/external-data.md)のセクションを参照してください。


## パラメータを含むクエリ {#cli-queries-with-parameters}

クエリ内のパラメータを指定し、コマンドラインオプションで値を渡すことができます。これにより、特定の動的値をクライアント側でフォーマットする必要がなくなります。例えば：

``` bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT * FROM table WHERE a = {parName:Array(UInt16)}"
```

インタラクティブセッション内でパラメータを設定することも可能です：
``` bash
$ clickhouse-client --query "SET param_parName='[1, 2]'; SELECT {parName:Array(UInt16)}"
```

### クエリ構文 {#cli-queries-with-parameters-syntax}

クエリ内で、コマンドラインパラメータを使って埋めたい値を次の形式の波括弧で囲みます：

``` sql
{<name>:<data type>}
```

- `name` — プレースホルダー識別子。対応するコマンドラインオプションは`--param_<name> = value`です。
- `data type` — パラメータの[データ型](../sql-reference/data-types/index.md)。例えば、データ構造のように`(integer, ('string', integer))`を持つ`Tuple(UInt8, Tuple(String, UInt8))`データ型になり得る（他の[整数](../sql-reference/data-types/int-uint.md)タイプを使用することも可能）。テーブル名、データベース名、およびカラム名をパラメータとして渡すこともでき、その場合はデータ型として`Identifier`を使用する必要があります。

### 例 {#cli-queries-with-parameters-examples}

``` bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```


## エイリアス {#cli_aliases}

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 最後のクエリを繰り返す


## キーボードショートカット {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 現在のクエリでエディタを開く。使用するエディタは環境変数`EDITOR`で指定できます。デフォルトでは`vim`が使用されます。
- `Alt (Option) + #` - 行をコメントアウトする。
- `Ctrl + r` - フォズィ履歴検索。

使用可能なすべてのキーボードショートカットの完全なリストは、[replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)で入手できます。

:::tip
MacOSでメタキー（Option）の正しい動作を設定するために：

iTerm2:  Preferences -> Profile -> Keys -> 左のOptionキーをクリックし、Esc+をクリック。
:::


## 接続文字列 {#connection_string}

ClickHouseクライアントは、[MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri)の接続文字列を使用してClickHouseサーバーに接続することをサポートしています。その構文は次の通りです：

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

**コンポーネント**

- `user` - （オプション）データベースのユーザー名。デフォルト：`default`。
- `password` - （オプション）データベースユーザーのパスワード。`:`が指定され、パスワードが空白の場合、クライアントはユーザーのパスワードを入力するよう求めます。
- `hosts_and_ports` - （オプション）ホストとオプションのポートのリスト`host[:port] [, host:[port]], ...`。デフォルト：`localhost:9000`。
- `database` - （オプション）データベース名。デフォルト：`default`。
- `query_parameters` - （オプション）キーと値のペアのリスト`param1=value1[,&param2=value2], ...`。いくつかのパラメータには値は必要ありません。パラメータ名と値は大文字と小文字を区別します。

接続文字列にユーザー名、パスワードまたはデータベースが指定されている場合、`--user`、`--password`や`--database`（その逆も）を使用して指定することはできません。

ホストコンポーネントは、ホスト名またはIPv4またはIPv6アドレスであることができます。IPv6アドレスは角括弧内にする必要があります：

```text
clickhouse://[2001:db8::1234]
```

接続文字列は複数のホストを含むことができます。ClickHouseクライアントは、これらのホストに左から右に順番に接続しようとします。接続が確立されると、残りのホストへの接続を試みることはありません。

接続文字列は`clickHouse-client`の最初の引数として指定する必要があります。接続文字列は、`--host`や`--port`を除く任意の他の[コマンドラインオプション](#command-line-options)と組み合わせることができます。

`query_parameters`に許可されているキーは：

- `secure`または省略形の`s`。指定されている場合、クライアントはセキュア接続(TLS)でサーバーに接続します。[コマンドラインオプション](#command-line-options)の`--secure`を参照してください。

**パーセントエンコーディング**

US以外のASCII、スペース、特殊文字は、`user`、`password`、`hosts`、`database`および`query parameters`内で[パーセントエンコード](https://en.wikipedia.org/wiki/URL_encoding)する必要があります。

### 例 {#connection_string_examples}

ポート9000の`localhost`に接続し、`SELECT 1`クエリを実行します。

``` bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

ユーザー`john`でパスワード`secret`を使用し、ホスト`127.0.0.1`とポート`9000`に接続します。

``` bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

`default`ユーザーとして`localhost`に接続し、IPV6アドレス`[::1]`を持つホストとポート`9000`。

``` bash
clickhouse-client clickhouse://[::1]:9000
```

マルチラインモードでポート9000の`localhost`に接続します。

``` bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

ユーザー`default`としてポート9000の`localhost`に接続します。

``` bash
clickhouse-client clickhouse://default@localhost:9000


# これは次のコマンドと同等です：
clickhouse-client clickhouse://localhost:9000 --user default
```

ポート9000の`localhost`に接続し、`my_database`データベースをデフォルトとします。

``` bash
clickhouse-client clickhouse://localhost:9000/my_database


# これは次のコマンドと同等です：
clickhouse-client clickhouse://localhost:9000 --database my_database
```

接続文字列で指定された`my_database`データベースをデフォルトとして、ポート9000の`localhost`に接続し、shorthanded `s`パラメータを使用してセキュア接続を行います。

```bash
clickhouse-client clickhouse://localhost/my_database?s


# これは次のコマンドと同等です：
clickhouse-client clickhouse://localhost/my_database -s
```

デフォルトホストにデフォルトポート、デフォルトユーザー、デフォルトデータベースで接続します。

``` bash
clickhouse-client clickhouse:
```

デフォルトポートのデフォルトホストに、ユーザー`my_user`として接続し、パスワードなしで接続します。

``` bash
clickhouse-client clickhouse://my_user@


# `:`と`@`の間に空のパスワードを指定することは、接続開始前にユーザーにパスワードを入力させることを意味します。
clickhouse-client clickhouse://my_user:@
```

メールをユーザー名として使用して`localhost`に接続します。`@`記号は`%40`にパーセントエンコードされます。

``` bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

2つのホストのうちの1つに接続します：`192.168.1.15`、`192.168.1.25`。

``` bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```


## クエリIDフォーマット {#query-id-format}

インタラクティブモードでは、ClickHouseクライアントは各クエリのクエリIDを表示します。デフォルトで、IDは次のようにフォーマットされます：

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

カスタムフォーマットは、`query_id_formats`タグ内の設定ファイルで指定できます。フォーマット文字列の中の`{query_id}`プレースホルダーはクエリIDに置き換えられます。タグ内には複数のフォーマット文字列を許可します。この機能は、クエリのプロファイリングを容易にするためのURLを生成するのに使用できます。

**例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

上記の設定では、クエリのIDは次のように表示されます：

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```


## 設定ファイル {#configuration_files}

ClickHouseクライアントは、次のいずれかの最初に存在するファイルを使用します：

- `-c [ -C, --config, --config-file ]`パラメータで定義されたファイル。
- `./clickhouse-client.[xml|yaml|yml]`
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

ClickHouseリポジトリ内のサンプル設定ファイルを参照してください：[`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

XML構文の例：

```xml
<config>
    <user>username</user>
    <password>password</password>
    <secure>true</secure>
    <openSSL>
      <client>
        <caConfig>/etc/ssl/cert.pem</caConfig>
      </client>
    </openSSL>
</config>
```

YAML形式で同じ設定：

```yaml
user: username
password: 'password'
secure: true
openSSL:
  client:
    caConfig: '/etc/ssl/cert.pem'
```


## コマンドラインオプション {#command-line-options}

すべてのコマンドラインオプションは、コマンドラインで直接指定するか、[設定ファイル](#configuration_files)にデフォルトとして指定できます。

### 一般オプション {#command-line-options-general}

**`-c [ -C, --config, --config-file ] <path-to-file>`**

クライアント用の設定ファイルの場所。デフォルトの位置にない場合。詳細は [設定ファイル](#configuration_files) を参照してください。

**`--help`**

使用法要約を印刷し、終了します。`--verbose`と組み合わせると、クエリ設定を含むすべての可能なオプションを表示します。

**`--history_file <path-to-file>`**

コマンド履歴を含むファイルへのパス。

**`--history_max_entries`**

履歴ファイルに保持する最大エントリ数。

デフォルト値：1000000（100万）

**`--prompt <prompt>`**

カスタムプロンプトを指定します。

デフォルト値：サーバーの`display_name`。

**`--verbose`**

出力の冗長性を増加させます。

**`-V [ --version ]`**

バージョンを印刷し、終了します。

### 接続オプション {#command-line-options-connection}

**`--connection <name>`**

設定ファイルからの事前設定された接続詳細の名前。 [接続資格情報](#connection-credentials)を参照してください。

**`-d [ --database ] <database>`**

この接続のデフォルトにするデータベースを選択します。

デフォルト値：サーバー設定からの現在のデータベース（デフォルトでは`default`）。

**`-h [ --host ] <host>`**

接続するClickHouseサーバーのホスト名。ホスト名またはIPv4またはIPv6アドレスのいずれかです。複数のホストは、複数の引数を通じて渡すことができます。

デフォルト値：localhost

**`--jwt <value>`**

認証にJSON Web Token（JWT）を使用します。

サーバーJWT認証は、ClickHouse Cloudでのみ利用可能です。

**`--no-warnings`**

クライアントがサーバーに接続する際に、`system.warnings`からの警告の表示を無効にします。

**`--password <password>`**

データベースユーザーのパスワード。接続のためのパスワードを設定ファイルで指定することもできます。パスワードを指定しない場合、クライアントは入力を要求します。

**`--port <port>`**

サーバーが接続を受け付けているポート。デフォルトポートは9440（TLS）および9000（TLSなし）です。

注意：クライアントはネイティブプロトコルを使用し、HTTP(S)ではありません。

デフォルト値：`--secure`が指定されている場合は9440、それ以外の場合は9000。ホスト名が`.clickhouse.cloud`で終わる場合は、常に9440にデフォルト設定されます。

**`-s [ --secure ]`**

TLSを使用するかどうか。

ポート9440（デフォルトの安全ポート）またはClickHouse Cloudに接続する際に自動的に有効になります。

CA証明書を[設定ファイル](#configuration_files)で構成する必要があるかもしれません。利用可能な設定は、[サーバー側TLS設定](../operations/server-configuration-parameters/settings.md#openssl)と同じです。

**`--ssh-key-file <path-to-file>`**

サーバーへの認証のためにSSHプライベートキーを含むファイル。

**`--ssh-key-passphrase <value>`**

`--ssh-key-file`で指定されたSSHプライベートキーのパスフレーズ。

**`-u [ --user ] <username>`**

接続するデータベースユーザー。

デフォルト値：default

`--host`、`--port`、`--user`および`--password`オプションの代わりに、クライアントは接続文字列もサポートしています。[接続文字列](#connection_string)を参照してください。

### クエリオプション {#command-line-options-query}

**`--param_<name>=<value>`**

[パラメータを含むクエリ](#cli-queries-with-parameters)のパラメータのための置換値。

**`-q [ --query ] <query>`**

バッチモードで実行するクエリ。複数回指定可能（`--query "SELECT 1" --query "SELECT 2"`）または、セミコロン区切りの複数のクエリを一度に指定することができます（`--query "SELECT 1; SELECT 2;"`）。後者の場合、`VALUES`以外の形式の`INSERT`クエリは空の行で区切る必要があります。

単一のクエリは、パラメータを指定せずに次のように指定できます：
```bash
$ clickhouse-client "SELECT 1"
1
```

`--queries-file`との併用はできません。

**`--queries-file <path-to-file>`**

クエリを含むファイルへのパス。`--queries-file`は複数回指定可能です（例えば、`--queries-file queries1.sql --queries-file queries2.sql`）。

`--query`との併用はできません。

**`-m [ --multiline ]`**

指定した場合、複数行のクエリを許可します（エンターでクエリを送信しない）。クエリはセミコロンで終了するまで送信されません。

### クエリ設定 {#command-line-options-query-settings}

クエリ設定は、クライアント内でコマンドラインオプションとして指定できます。例えば：
```bash
$ clickhouse-client --max_threads 1
```

設定のリストは、[設定](../operations/settings/settings.md)を参照してください。

### フォーマットオプション {#command-line-options-formatting}

**`-f [ --format ] <format>`**

指定された形式を使用して結果を出力します。

サポートされている形式のリストについては、[入力および出力データの形式](formats.md)を参照してください。

デフォルト値：TabSeparated

**`--pager <command>`**

すべての出力をこのコマンドにパイプします。通常`less`（例えば、幅の広い結果セットを表示するための`less -S`）または同様のコマンドです。

**`-E [ --vertical ]`**

結果を出力するために[垂直フォーマット](../interfaces/formats.md#vertical)を使用します。これは`--format Vertical`と同じです。この形式では、各値が別の行に印刷され、幅の広いテーブルを表示するのに便利です。

### 実行詳細 {#command-line-options-execution-details}

**`--enable-progress-table-toggle`**

進捗テーブルの切り替えを制御キー（スペース）で有効にします。進捗テーブル印刷が有効なインタラクティブモードでのみ適用されます。

デフォルト値：有効

**`--hardware-utilization`**

進捗バーにハードウェア使用情報を印刷します。

**`--memory-usage`**

指定した場合、非インタラクティブモードで`stderr`にメモリ使用量を印刷します。

可能な値：
- `none` - メモリ使用量を印刷しない
- `default` - バイト数を印刷
- `readable` - 人間に読みやすい形式でメモリ使用量を印刷

**`--print-profile-events`**

`ProfileEvents`パケットを印刷します。

**`--progress`**

クエリ実行の進捗を印刷します。

可能な値：
- `tty|on|1|true|yes` - インタラクティブモードで端末に出力されます
- `err` - 非インタラクティブモードで`stderr`に出力されます
- `off|0|false|no` - 進捗印刷を無効にします

デフォルト値：インタラクティブモードで`tty`、非インタラクティブ（バッチ）モードで`off`。

**`--progress-table`**

クエリ実行中にメトリクスが変化する進捗テーブルを印刷します。

可能な値：
- `tty|on|1|true|yes` - インタラクティブモードで端末に出力されます
- `err` - 非インタラクティブモードで`stderr`に出力されます
- `off|0|false|no` - 進捗テーブルを無効にします

デフォルト値：インタラクティブモードで`tty`、非インタラクティブ（バッチ）モードで`off`。

**`--stacktrace`**

例外のスタックトレースを印刷します。

**`-t [ --time ]`**

非インタラクティブモードで`stderr`にクエリ実行時間を印刷します（ベンチマーク用）。

