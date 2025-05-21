---
description: 'ClickHouseコマンドラインクライアントインターフェースのドキュメント'
sidebar_label: 'ClickHouseクライアント'
sidebar_position: 17
slug: /interfaces/cli
title: 'ClickHouseクライアント'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png'

ClickHouseは、ClickHouseサーバーに対してSQLクエリを直接実行するためのネイティブコマンドラインクライアントを提供しています。インタラクティブモード（ライブクエリ実行用）とバッチモード（スクリプティングおよび自動化用）の両方をサポートします。クエリの結果は、ターミナルに表示するか、ファイルにエクスポートできます。また、Pretty、CSV、JSONなど、すべてのClickHouse出力[形式](formats.md)に対応しています。

クライアントは、クエリ実行の進捗を示すプログレスバーや読み取った行数、処理したバイト数、クエリ実行時間を提供します。また、[コマンドラインオプション](#command-line-options)と[設定ファイル](#configuration_files)の両方をサポートしています。


## インストール {#install}

ClickHouseをダウンロードするには、次のコマンドを実行します：

```bash
curl https://clickhouse.com/ | sh
```

また、インストールも行うには、次のコマンドを実行します：
```bash
sudo ./clickhouse install
```

他のインストールオプションについては、[ClickHouseのインストール](../getting-started/install/install.mdx)を参照してください。

異なるクライアントとサーバーのバージョンは互換性がありますが、古いクライアントでは一部の機能が利用できない場合があります。クライアントとサーバーには同じバージョンを使用することをお勧めします。


## 実行 {#run}

:::note
ClickHouseをダウンロードしただけでインストールしていない場合は、`./clickhouse client`を使用してください。
:::

ClickHouseサーバーに接続するには、次のコマンドを実行します：

```bash
$ clickhouse-client --host server

ClickHouseクライアントバージョン 24.12.2.29 (公式ビルド)。
サーバーへの接続中:9000、ユーザーdefaultとして。
ClickHouseサーバーバージョン24.12.2に接続しました。

:)
```

必要に応じて追加の接続詳細を指定します：

**`--port <port>`** - ClickHouseサーバーが接続を受け付けているポート。デフォルトのポートは9440（TLS）および9000（非TLS）です。ClickHouseクライアントはネイティブプロトコルを使用し、HTTP(S)ではないことに注意してください。

**`-s [ --secure ]`** - TLSを使用するかどうか（通常は自動検出されます）。

**`-u [ --user ] <username>`** - 接続するデータベースユーザー。デフォルトでは`default`ユーザーとして接続します。

**`--password <password>`** - データベースユーザーのパスワード。設定ファイルで接続のパスワードを指定することもできます。パスワードを指定しない場合、クライアントはパスワードの入力を求めます。

**`-c [ --config ] <path-to-file>`** - ClickHouseクライアントの設定ファイルがデフォルトの場所にない場合、そのファイルの位置。

**`--connection <name>`** - 設定ファイルからの事前設定された接続詳細の名前。

コマンドラインオプションの完全なリストについては、[コマンドラインオプション](#command-line-options)を参照してください。


### ClickHouse Cloudに接続する {#connecting-cloud}

ClickHouse Cloudサービスの詳細は、ClickHouse Cloudコンソールで確認できます。接続したいサービスを選択し、**接続**をクリックしてください：

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloudサービス接続ボタン"
/>

<br/><br/>

**ネイティブ**を選択すると、詳細が表示され、例の`clickhouse-client`コマンドが示されます：

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse CloudネイティブTCP接続の詳細"
/>


### 設定ファイルに接続を保存する {#connection-credentials}

1つまたは複数のClickHouseサーバーの接続詳細を[設定ファイル](#configuration_files)に保存できます。

形式は次のようになります：
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

詳細については、[設定ファイルのセクション](#configuration_files)を参照してください。

:::note
クエリ構文に集中するため、残りの例では接続の詳細（`--host`、`--port`など）は省略しています。コマンドを実行する際は、これらを追加することを忘れないでください。
:::

## バッチモード {#batch-mode}

ClickHouseクライアントをインタラクティブに使用する代わりに、バッチモードで実行できます。

次のように単一のクエリを指定できます：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

`--query`コマンドラインオプションを使用することも可能です：

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

`stdin`からクエリを提供することもできます：

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

データを挿入する：

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query`が指定されている場合、任意の入力は改行の後にリクエストに追加されます。

**リモートClickHouseサービスにCSVファイルを挿入する**

この例は、`default`データベースの`cell_towers`という既存のテーブルにサンプルデータセットCSVファイル`cell_towers.csv`を挿入しています：

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

**データ挿入のさらなる例**

```bash
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

インタラクティブモードでは、デフォルトの出力形式は`PrettyCompact`です。クエリの`FORMAT`句や`--format`コマンドラインオプションを指定することで、この形式を変更できます。垂直形式を使用したい場合は、`--vertical`を使用するか、クエリの末尾に`\G`を指定してください。この形式では、各値が別の行に印刷されるため、広いテーブルを表示するのに便利です。

バッチモードでは、デフォルトのデータ[形式](formats.md)は`TabSeparated`です。クエリの`FORMAT`句で形式を設定できます。

インタラクティブモードでは、デフォルトでは入力したものが`Enter`を押したときに実行されます。クエリの末尾にセミコロンは必要ありません。

クライアントを`-m, --multiline`パラメーターを使って起動できます。複数行のクエリを入力するには、改行の前にバックスラッシュ`\`を入力します。`Enter`を押すと、次の行の入力を求められます。クエリを実行するには、セミコロンで終わらせてから`Enter`を押します。

ClickHouseクライアントは`replxx`に基づいているため（`readline`に似ています）、一般的なキーボードショートカットを使用し、履歴を保持します。履歴はデフォルトで`~/.clickhouse-client-history`に書き込まれます。

クライアントを終了するには、`Ctrl+D`を押すか、クエリの代わりに次のいずれかを入力します：`exit`、`quit`、`logout`、`exit;`、`quit;`、`logout;`、`q`、`Q`、`:q`。

クエリを処理中、クライアントは次の情報を表示します：

1. プログレスは、デフォルトで1秒あたり10回以上更新されません。クイッククエリの場合、進捗が表示される余裕がないこともあります。
2. デバッグ用に解析後の整形されたクエリ。
3. 指定された形式での結果。
4. 結果の行数、経過時間、クエリ処理の平均速度。すべてのデータ量は非圧縮データを指します。

長いクエリをキャンセルするには、`Ctrl+C`を押します。ただし、サーバーがリクエストを中止するまで少し待つ必要があります。特定の段階でクエリをキャンセルすることはできません。待たずにもう一度`Ctrl+C`を押すと、クライアントが終了します。

ClickHouseクライアントは、クエリ処理用の外部データ（外部一時テーブル）を渡すことを可能にします。詳細については、[クエリ処理用の外部データのセクション](../engines/table-engines/special/external-data.md)を参照してください。


## パラメータを持つクエリ {#cli-queries-with-parameters}

クエリにパラメータを指定し、コマンドラインオプションで値を渡すことができます。これにより、特定の動的値を持つクエリをクライアント側でフォーマットする必要がなくなります。例えば：

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT * FROM table WHERE a = {parName:Array(UInt16)}"
```

インタラクティブセッション内からパラメータを設定することも可能です：
```bash
$ clickhouse-client --query "SET param_parName='[1, 2]'; SELECT {parName:Array(UInt16)}"
```

### クエリ構文 {#cli-queries-with-parameters-syntax}

クエリ内で、コマンドラインパラメータで埋めたい値を以下の形式で波括弧内に置きます：

```sql
{<name>:<data type>}
```

- `name` — プレースホルダーの識別子。対応するコマンドラインオプションは`--param_<name> = value`です。
- `data type` — パラメータの[データ型](../sql-reference/data-types/index.md)。例えば、データ構造の`(integer, ('string', integer))`は`Tuple(UInt8, Tuple(String, UInt8))`データ型を持つことができます（他の[整数](../sql-reference/data-types/int-uint.md)型も使用できます）。テーブル名、データベース名、およびカラム名をパラメータとして渡すことも可能で、その場合は`Identifier`をデータ型として使用する必要があります。

### 例 {#cli-queries-with-parameters-examples}

```bash
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

- `Alt (Option) + Shift + e` - 現在のクエリでエディタを開く。`EDITOR`環境変数で使用するエディタを指定できます。デフォルトでは`vim`が使用されます。
- `Alt (Option) + #` - 行をコメントアウトする。
- `Ctrl + r` - フォズィ履歴検索。

すべての利用可能なキーボードショートカットの完全なリストは、[replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)で確認できます。

:::tip
MacOSでメタキー（オプション）の正しい動作を設定するには：

iTerm2：Preferences -> Profile -> Keys -> Left Option keyに移動し、Esc+をクリックします。
:::


## 接続文字列 {#connection_string}

ClickHouseクライアントは、[MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri)に似た接続文字列を使用してClickHouseサーバーに接続することもサポートしています。以下の構文を持ちます：

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

**コンポーネント**

- `user` - （オプション）データベースユーザー名。デフォルト：`default`。
- `password` - （オプション）データベースユーザーのパスワード。`:`が指定され、パスワードが空白の場合、クライアントはユーザーのパスワードを要求します。
- `hosts_and_ports` - （オプション）ホストとオプションのポートのリスト`host[:port] [, host:[port]], ...`。デフォルト：`localhost:9000`。
- `database` - （オプション）データベース名。デフォルト：`default`。
- `query_parameters` - （オプション）キーと値のペアのリスト`param1=value1[,&param2=value2], ...`。一部のパラメータには値が必要ありません。パラメータ名と値は大文字と小文字が区別されます。

接続文字列でユーザー名、パスワード、データベースが指定されている場合、`--user`、`--password`、または`--database`を使用して指定することはできません（その逆も同様です）。

ホストコンポーネントは、ホスト名またはIPv4またはIPv6アドレスである必要があります。IPv6アドレスは角括弧で囲む必要があります：

```text
clickhouse://[2001:db8::1234]
```

接続文字列には複数のホストを含めることができます。ClickHouseクライアントは、これらのホストに左から右に接続を試みます。接続が確立されると、残りのホストへの接続は試みられません。

接続文字列は`clickHouse-client`の最初の引数として指定する必要があります。接続文字列は、`--host`や`--port`を除く任意の他の[コマンドラインオプション](#command-line-options)と組み合わせることができます。

`query_parameters`に許可されるキーは以下の通りです：

- `secure` もしくは短縮形の`s`。指定された場合、クライアントはセキュアな接続（TLS）でサーバーに接続します。詳細は[コマンドラインオプション](#command-line-options)の`--secure`を参照してください。

**パーセントエンコーディング**

`user`、`password`、`hosts`、`database`、および`query parameters`の非US ASCII文字、空白、特殊文字は[パーセントエンコーディング](https://en.wikipedia.org/wiki/URL_encoding)される必要があります。

### 例 {#connection_string_examples}

`localhost`のポート9000に接続し、クエリ`SELECT 1`を実行します。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

`localhost`にユーザー`john`で接続し、パスワード`secret`、ホスト`127.0.0.1`、ポート`9000`を指定します。

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

`localhost`に`default`ユーザーとして、IPV6アドレス`[::1]`のホストでポート`9000`に接続します。

```bash
clickhouse-client clickhouse://[::1]:9000
```

ポート9000で`localhost`に接続し、マルチラインモードで実行します。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

ポート9000で`localhost`に接続し、`default`ユーザーとして接続します。

```bash
clickhouse-client clickhouse://default@localhost:9000


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

ポート9000で`localhost`に接続し、接続文字列で指定された`my_database`データベースにデフォルトで接続します。

```bash
clickhouse-client clickhouse://localhost:9000/my_database


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

ポート9000で`localhost`に接続し、接続文字列で指定された`my_database`データベースにデフォルトで接続し、短縮形の`s`パラメータを使用してセキュアな接続を使用します。

```bash
clickhouse-client clickhouse://localhost/my_database?s


# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

デフォルトのホストに接続し、デフォルトのポート、デフォルトのユーザー、およびデフォルトのデータベースを使用します。

```bash
clickhouse-client clickhouse:
```

デフォルトのホストに接続し、デフォルトのポートを使用し、`my_user`ユーザーとして接続します（パスワードなし）。

```bash
clickhouse-client clickhouse://my_user@


# Using a blank password between : and @ means asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

ユーザー名としてメールを使用して`localhost`に接続します。`@`記号は`%40`にパーセントエンコードされます。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

2つのホストのいずれかに接続します：`192.168.1.15`、`192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```


## クエリID形式 {#query-id-format}

インタラクティブモードでは、ClickHouseクライアントは各クエリに対してクエリIDを表示します。デフォルトでは、IDは次のようにフォーマットされます：

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

カスタム形式は、`query_id_formats`タグ内の設定ファイルに指定できます。フォーマット文字列内の`{query_id}`プレースホルダーはクエリIDで置き換えられます。タグ内には複数のフォーマット文字列を指定できます。
この機能は、クエリのプロファイルを促進するURLを生成するのに使用できます。

**例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

上の設定を使用すると、クエリのIDは次の形式で表示されます：

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```


## 設定ファイル {#configuration_files}

ClickHouseクライアントは、次のいずれかの最初に存在するファイルを使用します：

- `-c [ -C, --config, --config-file ]`パラメータで指定されたファイル。
- `./clickhouse-client.[xml|yaml|yml]`
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

ClickHouseリポジトリのサンプル設定ファイルを参照してください：[`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

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

YAML形式での同じ設定：

```yaml
user: username
password: 'password'
secure: true
openSSL:
  client:
    caConfig: '/etc/ssl/cert.pem'
```


## コマンドラインオプション {#command-line-options}

すべてのコマンドラインオプションは、コマンドラインに直接指定するか、[設定ファイル](#configuration_files)にデフォルト値として指定できます。

### 一般オプション {#command-line-options-general}

**`-c [ -C, --config, --config-file ] <path-to-file>`**

クライアントの設定ファイルの位置。デフォルトの場所にない場合は、[設定ファイル](#configuration_files)を参照してください。

**`--help`**

使用法の概要を表示し、終了します。`--verbose`と組み合わせると、クエリ設定を含むすべての可能なオプションを表示します。

**`--history_file <path-to-file>`**

コマンド履歴を含むファイルへのパス。

**`--history_max_entries`**

履歴ファイル内の最大エントリ数。

デフォルト値：1000000（100万）

**`--prompt <prompt>`**

カスタムプロンプトを指定します。

デフォルト値：サーバーの`display_name`。

**`--verbose`**

出力の詳細度を増加させます。

**`-V [ --version ]`**

バージョンを表示して終了します。

### 接続オプション {#command-line-options-connection}

**`--connection <name>`**

設定ファイルからの事前設定された接続詳細の名前。[接続資格情報](#connection-credentials)を参照してください。

**`-d [ --database ] <database>`**

この接続のデフォルトとして使用するデータベースを選択します。

デフォルト値：サーバー設定の現在のデータベース（デフォルトは`default`）。

**`-h [ --host ] <host>`**

接続するClickHouseサーバーのホスト名。ホスト名またはIPv4またはIPv6アドレスのいずれかです。複数のホストを複数の引数を使用して渡すことができます。

デフォルト値：localhost

**`--jwt <value>`**

認証にJSON Web Token（JWT）を使用します。

サーバーJWT認証は、ClickHouse Cloudでのみ利用可能です。

**`--no-warnings`**

クライアントがサーバーに接続するとき、`system.warnings`からの警告メッセージを表示しないようにします。

**`--password <password>`**

データベースユーザーのパスワード。設定ファイルで接続のパスワードを指定することもできます。パスワードを指定しない場合、クライアントはパスワードの入力を求めます。

**`--port <port>`**

サーバーが接続を受け付けるポート。デフォルトのポートは9440（TLS）および9000（非TLS）。

注：クライアントはネイティブプロトコルを使用し、HTTP(S)ではありません。

デフォルト値：指定された場合は9440（`--secure`）、それ以外は9000。ホスト名が`.clickhouse.cloud`で終わる場合は常に9440にデフォルト設定されます。

**`-s [ --secure ]`**

TLSを使用するかどうか。

ポート9440（デフォルトのセキュアポート）またはClickHouse Cloudに接続する際は、自動的に有効になります。

[設定ファイル](#configuration_files)内でCA証明書を設定する必要がある場合があります。利用可能な設定は、[サーバー側のTLS設定](../operations/server-configuration-parameters/settings.md#openssl)と同じです。

**`--ssh-key-file <path-to-file>`**

サーバーに認証するためのSSH秘密鍵を含むファイル。

**`--ssh-key-passphrase <value>`**

`--ssh-key-file`で指定されたSSH秘密鍵のパスフレーズ。

**`-u [ --user ] <username>`**

接続するデータベースユーザー。

デフォルト値：default

`--host`、`--port`、`--user`、および`--password`オプションの代わりに、クライアントは[接続文字列](#connection_string)もサポートしています。

### クエリオプション {#command-line-options-query}

**`--param_<name>=<value>`**

[パラメータ付きクエリ](#cli-queries-with-parameters)のパラメータの代入値。

**`-q [ --query ] <query>`**

バッチモードで実行するクエリ。複数回（`--query "SELECT 1" --query "SELECT 2"`）指定したり、複数のセミコロンで区切られたクエリを一度に指定したりできます（`--query "SELECT 1; SELECT 2;"`）。後者の場合、`VALUES`以外のフォーマットの`INSERT`クエリは空白行で区切る必要があります。

次のようにパラメータなしで単一のクエリも指定できます：
```bash
$ clickhouse-client "SELECT 1"
1
```

`--queries-file`と一緒に使用することはできません。

**`--queries-file <path-to-file>`**

クエリを含むファイルへのパス。`--queries-file`は複数回指定できます（例えば、`--queries-file queries1.sql --queries-file queries2.sql`）。

`--query`と同時に使用することはできません。

**`-m [ --multiline ]`**

指定した場合、マルチラインクエリを許可します（Enterを押してもクエリを送信しない）。クエリはセミコロンで終わるまで送信されません。

### クエリ設定 {#command-line-options-query-settings}

クエリ設定は、クライアント内でコマンドラインオプションとして指定できます。例えば：
```bash
$ clickhouse-client --max_threads 1
```

設定のリストについては、[設定](../operations/settings/settings.md)を参照してください。

### フォーマットオプション {#command-line-options-formatting}

**`-f [ --format ] <format>`**

結果を出力するために指定された形式を使用します。

サポートされている形式のリストについては、[入出力データの形式](formats.md)を参照してください。

デフォルト値：TabSeparated

**`--pager <command>`**

すべての出力をこのコマンドにパイプします。通常は`less`（例えば、広い結果セットを表示するには`less -S`）です。

**`-E [ --vertical ]`**

結果を出力するために[垂直形式](../interfaces/formats.md#vertical)を使用します。これは`–-format Vertical`と同じです。この形式では、各値が独立した行に印刷され、広いテーブルを表示するのに便利です。

### 実行詳細 {#command-line-options-execution-details}

**`--enable-progress-table-toggle`**

進捗テーブルの切り替えを、制御キー（Space）を押すことで有効にします。インタラクティブモードの進捗テーブル印刷が有効になる場合のみ適用されます。

デフォルト値：有効

**`--hardware-utilization`**

進捗バーにハードウェアの利用情報を表示します。

**`--memory-usage`**

指定した場合、非インタラクティブモードでメモリ使用量を`stderr`に表示します。

可能な値：
- `none` - メモリ使用量を表示しない
- `default` - バイト数を表示する
- `readable` - 可読性のある形式でメモリ使用量を表示する

**`--print-profile-events`**

`ProfileEvents`パケットを印刷します。

**`--progress`**

クエリ実行の進捗を印刷します。

可能な値：
- `tty|on|1|true|yes` - インタラクティブモードで端末に出力
- `err` - 非インタラクティブモードで`stderr`に出力
- `off|0|false|no` - 進捗印刷を無効にする

デフォルト値：インタラクティブモードで`tty`、非インタラクティブ（バッチ）モードで`off`。

**`--progress-table`**

クエリ実行中のメトリックの変化を示す進捗テーブルを印刷します。

可能な値：
- `tty|on|1|true|yes` - インタラクティブモードで端末に出力
- `err` - 非インタラクティブモードで`stderr`に出力
- `off|0|false|no` - 進捗テーブルを無効にする

デフォルト値：インタラクティブモードで`tty`、非インタラクティブ（バッチ）モードで`off`。

**`--stacktrace`**

例外のスタックトレースを印刷します。

**`-t [ --time ]`**

ベンチマーク用に非インタラクティブモードでクエリ実行時間を`stderr`に印刷します。
