---
description: 'ClickHouse コマンドラインクライアントインターフェースのドキュメント'
sidebar_label: 'ClickHouse クライアント'
sidebar_position: 17
slug: '/interfaces/cli'
title: 'ClickHouse クライアント'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png'

ClickHouseは、ClickHouseサーバーに対して直接SQLクエリを実行するためのネイティブなコマンドラインクライアントを提供します。インタラクティブモード（ライブクエリ実行用）とバッチモード（スクリプトと自動化用）の両方をサポートしています。クエリ結果は端末に表示するか、ファイルにエクスポートでき、Pretty、CSV、JSONなどのすべてのClickHouse出力[フォーマット](formats.md)をサポートしています。

このクライアントは、プログレスバーや読み取った行数、処理したバイト数、クエリ実行時間とともに、クエリ実行に関するリアルタイムのフィードバックを提供します。また、[コマンドラインオプション](#command-line-options)と[構成ファイル](#configuration_files)の両方をサポートしています。

## インストール {#install}

ClickHouseをダウンロードするには、次のコマンドを実行します：

```bash
curl https://clickhouse.com/ | sh
```

次にインストールするには、以下を実行します：
```bash
sudo ./clickhouse install
```

さらに多くのインストールオプションについては、[ClickHouseをインストール](../getting-started/install/install.mdx)を参照してください。

クライアントとサーバーの異なるバージョンは互換性がありますが、古いクライアントでは一部の機能が利用できない場合があります。クライアントとサーバーには同じバージョンを使用することをお勧めします。

## 実行する {#run}

:::note
ClickHouseをダウンロードしただけでインストールしていない場合は、`./clickhouse client`を使用してください。`clickhouse-client`を使用しないでください。
:::

ClickHouseサーバーに接続するには、次のコマンドを実行します：

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

必要に応じて、追加の接続詳細を指定します：

**`--port <port>`** - ClickHouseサーバーが接続を受け付けるポート。デフォルトポートは9440（TLS）と9000（非TLS）です。ClickHouse Clientはネイティブプロトコルを使用し、HTTP(S)は使用しません。

**`-s [ --secure ]`** - TLSを使用するかどうか（通常は自動検出されます）。

**`-u [ --user ] <username>`** - 接続するデータベースユーザー。デフォルトでは`default`ユーザーとして接続します。

**`--password <password>`** - データベースユーザーのパスワード。構成ファイル内に接続用のパスワードを指定することもできます。パスワードを指定しない場合は、クライアントがパスワードを尋ねます。

**`-c [ --config ] <path-to-file>`** - ClickHouse Clientの構成ファイルの場所（デフォルトの場所でない場合）。

**`--connection <name>`** - 構成ファイルから事前に構成された接続詳細の名前。

コマンドラインオプションの完全なリストについては、[コマンドラインオプション](#command-line-options)を参照してください。

### ClickHouse Cloudへの接続 {#connecting-cloud}

ClickHouse Cloudサービスの詳細は、ClickHouse Cloudコンソールで確認できます。接続したいサービスを選択し、**接続**をクリックします：

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloud service connect button"
/>

<br/><br/>

**ネイティブ**を選択すると、詳細が表示され、`clickhouse-client`コマンドの例が示されます：

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse Cloud Native TCP connection details"
/>

### 構成ファイルに接続を保存する {#connection-credentials}

1つまたは複数のClickHouseサーバーの接続詳細を[構成ファイル](#configuration_files)に保存できます。

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

詳細は[構成ファイルに関するセクション](#configuration_files)を参照してください。

:::note
クエリ構文に集中するため、残りの例では接続詳細（`--host`、`--port`など）を省略しています。コマンドを使用するときはそれらを追加することを忘れないでください。
:::

## バッチモード {#batch-mode}

ClickHouse Clientをインタラクティブに使用するのではなく、バッチモードで実行できます。

単一のクエリを次のように指定できます：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

`--query`コマンドラインオプションも使用できます：

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

`stdin`にクエリを提供することもできます：

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

データの挿入：

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query`が指定された場合、入力は行送りの後にリクエストに追加されます。

**リモートClickHouseサービスへのCSVファイルの挿入**

この例では、サンプルデータセットCSVファイル`cell_towers.csv`を、`default`データベースの既存のテーブル`cell_towers`に挿入しています：

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

インタラクティブモードでは、デフォルトの出力形式は`PrettyCompact`です。クエリの`FORMAT`句で形式を変更するか、`--format`コマンドラインオプションを指定できます。垂直形式を使用するには、`--vertical`またはクエリの末尾に`\G`を指定します。この形式では、各値が別の行に印刷され、広いテーブルには便利です。

バッチモードでは、デフォルトのデータ[フォーマット](formats.md)は`TabSeparated`です。クエリの`FORMAT`句で形式を設定できます。

インタラクティブモードでは、デフォルトで入力したものがEnterキーを押すと実行されます。クエリの末尾にセミコロンは必要ありません。

`-m, --multiline`パラメーターを指定してクライアントを起動できます。マルチラインクエリを入力するには、行送りの前にバックスラッシュ`\`を入力します。Enterを押すと、クエリの次の行を入力するように求められます。クエリを実行するには、セミコロンで終了してEnterを押します。

ClickHouse Clientは`replxx`（`readline`類似）に基づいているため、親しみのあるキーボードショートカットを使用し、履歴を保持します。履歴はデフォルトで`~/.clickhouse-client-history`に書き込まれます。

クライアントを終了するには、`Ctrl+D`を押すか、クエリの代わりに次のいずれかを入力します：`exit`、`quit`、 `logout`、 `exit;`、 `quit;`、 `logout;`、 `q`、 `Q`、 `:q`。

クエリを処理する際、クライアントは以下を表示します：

1. プログレスは、デフォルトで1秒あたり10回以上更新されません。クイッククエリの場合、プログレスが表示される暇がないことがあります。
2. デバッグ用に解析後のフォーマットされたクエリ。
3. 指定されたフォーマットでの結果。
4. 結果の行数、経過時間、クエリ処理の平均速度。すべてのデータ量は未圧縮データ参照します。

長いクエリをキャンセルするには`Ctrl+C`を押します。ただし、サーバーがリクエストを中断するのを待つ必要があります。特定の段階でクエリをキャンセルすることはできません。待たずに2度目に`Ctrl+C`を押すと、クライアントが終了します。

ClickHouse Clientは、クエリのために外部データ（外部一時テーブル）を渡すことも可能です。詳細については、[クエリ処理用の外部データに関するセクション](../engines/table-engines/special/external-data.md)を参照してください。

## パラメーターを使用したクエリ {#cli-queries-with-parameters}

クエリ内でパラメーターを指定し、コマンドラインオプションでその値を渡すことができます。これにより、クライアントサイドで特定の動的値でクエリをフォーマットする必要がなくなります。例：

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT * FROM table WHERE a = {parName:Array(UInt16)}"
```

インタラクティブセッション内からパラメーターを設定することも可能です：
```bash
$ clickhouse-client --query "SET param_parName='[1, 2]'; SELECT {parName:Array(UInt16)}"
```

### クエリ構文 {#cli-queries-with-parameters-syntax}

クエリ内では、コマンドラインパラメータを使用して埋め込みたい値を次の形式で中括弧で囲みます：

```sql
{<name>:<data type>}
```

- `name` — プレースホルダー識別子。対応するコマンドラインオプションは`--param_<name> = value`です。
- `data type` — パラメータの[データ型](../sql-reference/data-types/index.md)。例えば、データ構造`(integer, ('string', integer))`は`Tuple(UInt8, Tuple(String, UInt8))`データ型を持ち得ます（他の[整数](../sql-reference/data-types/int-uint.md)型も使用可能です）。テーブル名やデータベース名、カラム名をパラメータとして渡すことも可能で、その場合はデータ型として`Identifier`を使用する必要があります。

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
- `.` - 前のクエリを繰り返す


## キーボードショートカット {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 現在のクエリでエディタを開く。環境変数`EDITOR`で使用するエディタを指定することができます。デフォルトでは`vim`が使用されます。
- `Alt (Option) + #` - 行をコメントアウト。
- `Ctrl + r` - ファジー履歴検索。

すべての利用可能なキーボードショートカットの完全なリストは、[replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)で確認できます。

:::tip
MacOSでメタキー（Option）の正しい動作を設定するには：

iTerm2：Preferences -> Profile -> Keys -> Left Option keyに移動し、Esc+をクリックします。
:::


## 接続文字列 {#connection_string}

ClickHouse Clientは、接続文字列を使用してClickHouseサーバーに接続することもサポートしています。これはMongoDBやPostgreSQL、MySQLに類似しています。構文は次のようになります：

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

**構成要素**

- `user` - （オプション）データベースのユーザー名。デフォルト：`default`。
- `password` - （オプション）データベースユーザーのパスワード。`:`が指定され、パスワードが空の場合、クライアントはユーザーのパスワードを求めます。
- `hosts_and_ports` - （オプション）ホストとオプションのポートのリスト`host[:port] [, host:[port]], ...`。デフォルト：`localhost:9000`。
- `database` - （オプション）データベース名。デフォルト：`default`。
- `query_parameters` - （オプション）キーと値のペアのリスト`param1=value1[,&param2=value2], ...`。パラメータのいくつかでは、値は必要ありません。パラメータ名と値は大文字と小文字を区別します。

接続文字列でユーザー名、パスワード、またはデータベースを指定した場合、`--user`、`--password`、または`--database`で指定することはできません（その逆も然り）。

ホストコンポーネントは、ホスト名またはIPv4またはIPv6アドレスのいずれかです。IPv6アドレスは中括弧[]で囲む必要があります：

```text
clickhouse://[2001:db8::1234]
```

接続文字列には、複数のホストを含めることができます。ClickHouse Clientは、これらのホストに順番に接続を試みます（左から右へ）。接続が確立されると、残りのホストへの接続は試みられません。

接続文字列は、`clickHouse-client`の最初の引数として指定する必要があります。接続文字列は、`--host`および`--port`を除く任意の[コマンドラインオプション](#command-line-options)と組み合わせることができます。

`query_parameters`に対しては、以下のキーが許可されています：

- `secure`または省略形`ス`。指定された場合、クライアントはセキュアな接続（TLS）を介してサーバーに接続します。[コマンドラインオプション](#command-line-options)の`--secure`を参照してください。

**パーセントエンコーディング**

非US ASCII、スペース、`user`、`password`、`hosts`、`database`および`query parameters`内の特殊文字は[パーセントエンコード](https://en.wikipedia.org/wiki/URL_encoding)する必要があります。

### 例 {#connection_string_examples}

ポート9000の`localhost`に接続し、`SELECT 1`クエリを実行します。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

ユーザー`john`として、パスワード`secret`で、ホスト`127.0.0.1`およびポート`9000`に接続します。

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

ユーザー`default`の`localhost`に、IPV6アドレス`[::1]`のホストとポート`9000`に接続します。

```bash
clickhouse-client clickhouse://[::1]:9000
```

マルチラインモードでポート9000の`localhost`に接続します。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

ユーザー`default`としてポート9000の`localhost`に接続します。

```bash
clickhouse-client clickhouse://default@localhost:9000


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

ポート9000の`localhost`に接続し、デフォルトで`my_database`データベースを使用します。

```bash
clickhouse-client clickhouse://localhost:9000/my_database


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

ポート9000の`localhost`に接続し、接続文字列で指定された`my_database`データベースにデフォルトで接続し、省略形の`ス`パラメータを使用して安全な接続を確立します。

```bash
clickhouse-client clickhouse://localhost/my_database?s


# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

デフォルトのホストを使用して、デフォルトのポート、デフォルトのユーザー、デフォルトのデータベースに接続します。

```bash
clickhouse-client clickhouse:
```

デフォルトのポートを使用して、デフォルトのホストに接続し、ユーザー`my_user`として、パスワードなしで接続します。

```bash
clickhouse-client clickhouse://my_user@


# 上記の:と@の間の空白のパスワードは、接続を開始する前にユーザーにパスワードを入力するよう求めることを意味します。
clickhouse-client clickhouse://my_user:@
```

ユーザー名にメールを使用して`localhost`に接続します。`@`記号はパーセントエンコードして`%40`になります。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

2つのホストのいずれかに接続します：`192.168.1.15`、`192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## クエリID形式 {#query-id-format}

インタラクティブモードでは、ClickHouse Clientは各クエリのクエリIDを表示します。デフォルトでは、IDは次のようにフォーマットされます：

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

カスタムフォーマットは、構成ファイル内の`query_id_formats`タグ内で指定できます。フォーマット文字列内の`{query_id}`プレースホルダーはクエリIDで置き換えられます。タグ内には複数のフォーマット文字列が許可されています。この機能は、クエリのプロファイリングを促進するためのURLを生成するために使用できます。

**例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

上記の構成では、クエリのIDは次の形式で表示されます：

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```


## 構成ファイル {#configuration_files}

ClickHouse Clientは次のいずれかの最初に存在するファイルを使用します：

- `-c [ -C, --config, --config-file ]`パラメータで定義されているファイル。
- `./clickhouse-client.[xml|yaml|yml]`
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

ClickHouseリポジトリ内にあるサンプル構成ファイル：[`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

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

YAML形式の同じ構成：

```yaml
user: username
password: 'password'
secure: true
openSSL:
  client:
    caConfig: '/etc/ssl/cert.pem'
```

## コマンドラインオプション {#command-line-options}

すべてのコマンドラインオプションは、コマンドラインで直接指定するか、[構成ファイル](#configuration_files)のデフォルトとして指定できます。

### 一般オプション {#command-line-options-general}

**`-c [ -C, --config, --config-file ] <path-to-file>`**

クライアントの構成ファイルの場所（デフォルトの場所でない場合）。[構成ファイル](#configuration_files)を参照してください。

**`--help`**

使用法の概要を表示し、終了します。`--verbose`と組み合わせることで、クエリ設定を含むすべての可能なオプションを表示します。

**`--history_file <path-to-file>`**

コマンド履歴を含むファイルへのパス。

**`--history_max_entries`**

履歴ファイル内の最大エントリ数。

デフォルト値：1000000（100万）

**`--prompt <prompt>`**

カスタムプロンプトを指定します。

デフォルト値：サーバーの`display_name`。

**`--verbose`**

出力の冗長性を増加させます。

**`-V [ --version ]`**

バージョンを表示して終了します。

### 接続オプション {#command-line-options-connection}

**`--connection <name>`**

構成ファイルから事前に構成された接続詳細の名前。詳細は[接続資格情報](#connection-credentials)を参照してください。

**`-d [ --database ] <database>`**

この接続のデフォルトとして選択するデータベース。

デフォルト値：サーバー設定の現在のデータベース（デフォルトで`default`）。

**`-h [ --host ] <host>`**

接続先のClickHouseサーバーのホスト名。ホスト名またはIPv4またはIPv6アドレスになります。複数のホストを渡すことができます。

デフォルト値：localhost

**`--jwt <value>`**

認証のためにJSON Web Token（JWT）を使用します。

サーバーJWT認証はClickHouse Cloudでのみ利用可能です。

**`--no-warnings`**

クライアントがサーバーに接続するときに、`system.warnings`からの警告を表示しないようにします。

**`--password <password>`**

データベースユーザーのパスワード。接続用のパスワードを構成ファイル内に指定することもできます。パスワードを指定しない場合、クライアントがパスワードを尋ねてきます。

**`--port <port>`**

サーバーが接続を受け付けているポート。デフォルトのポートは9440（TLS）と9000（非TLS）です。

注：クライアントはネイティブプロトコルを使用し、HTTP(S)は使用しません。

デフォルト値：`--secure`が指定されている場合は9440、そうでない場合は9000。ホスト名が`.clickhouse.cloud`で終わる場合は常に9440がデフォルトです。

**`-s [ --secure ]`**

TLSを使用するかどうか。

ポート9440（デフォルトのセキュアポート）またはClickHouse Cloudに接続されると自動的に有効になります。

[構成ファイル](#configuration_files)内でCA証明書を設定する必要がある場合があります。利用可能な構成設定は、[サーバー側のTLS構成](../operations/server-configuration-parameters/settings.md#openssl)と同じです。

**`--ssh-key-file <path-to-file>`**

サーバーとの認証のために使用されるSSHプライベートキーを含むファイル。

**`--ssh-key-passphrase <value>`**

`--ssh-key-file`で指定されたSSHプライベートキーのパスフレーズ。

**`-u [ --user ] <username>`**

接続するデータベースユーザー。

デフォルト値：default

`--host`、`--port`、`--user`、および`--password`オプションの代わりに、クライアントは[接続文字列](#connection_string)もサポートしています。

### クエリオプション {#command-line-options-query}

**`--param_<name>=<value>`**

[パラメータ付きクエリ](#cli-queries-with-parameters)のパラメータの置換値。

**`-q [ --query ] <query>`**

バッチモードで実行するクエリ。複数回指定できます（例：`--query "SELECT 1" --query "SELECT 2"`）または、セミコロンで区切られた複数のクエリを一度に指定できます（例：`--query "SELECT 1; SELECT 2;"`）。後者の場合、`VALUES`以外の形式の`INSERT`クエリは空の行で区切る必要があります。

単一のクエリはパラメータなしでも指定できます：
```bash
$ clickhouse-client "SELECT 1"
1
```

`--queries-file`と同時に使用することはできません。

**`--queries-file <path-to-file>`**

クエリを含むファイルへのパス。複数回指定できます（例：`--queries-file  queries1.sql --queries-file  queries2.sql`）。

`--query`と同時に使用することはできません。

**`-m [ --multiline ]`**

指定された場合、マルチラインクエリを許可します（Enterを押さないでクエリを送信しない）。クエリはセミコロンで終了するまで送信されません。

### クエリ設定 {#command-line-options-query-settings}

クエリ設定は、クライアント内でコマンドラインオプションとして指定できます。例えば：
```bash
$ clickhouse-client --max_threads 1
```

設定のリストについては、[設定](../operations/settings/settings.md)を参照してください。

### フォーマットオプション {#command-line-options-formatting}

**`-f [ --format ] <format>`**

結果を出力するために指定された形式を使用します。

サポートされているフォーマットのリストについては、[入力および出力データの形式](formats.md)を参照してください。

デフォルト値：TabSeparated

**`--pager <command>`**

すべての出力をこのコマンドにパイプします。通常の使用法は`less`（例：広い結果セットを表示するために`less -S`）です。

**`-E [ --vertical ]`**

結果を出力するために[垂直形式](../interfaces/formats.md#vertical)を使用します。これは`–-format Vertical`と同じです。この形式では、各値が別の行に印刷され、広いテーブルを表示する際に役立ちます。

### 実行の詳細 {#command-line-options-execution-details}

**`--enable-progress-table-toggle`**

プログレステーブルの切り替えを有効にします。Controlキー（スペース）を押すことで切り替えが行えます。プログレステーブル表示が有効なインタラクティブモードでのみ適用可能です。

デフォルト値：有効

**`--hardware-utilization`**

プログレスバーにハードウェアの利用状況情報を表示します。

**`--memory-usage`**

指定された場合、非インタラクティブモードで`stderr`にメモリ使用量を印刷します。

可能な値：
- `none` - メモリ使用量を印刷しない
- `default` - バイト数を印刷する
- `readable` - 可読形式でメモリ使用量を印刷する

**`--print-profile-events`**

`ProfileEvents`パケットを印刷します。

**`--progress`**

クエリ実行の進捗を印刷します。

可能な値：
- `tty|on|1|true|yes` - インタラクティブモードで端末に出力します
- `err` - 非インタラクティブモードで`stderr`に出力します
- `off|0|false|no` - プログレス印刷を無効にします

デフォルト値：インタラクティブモードで`tty`、非インタラクティブモード（バッチモード）で`off`。

**`--progress-table`**

クエリ実行中に変化するメトリックを含む進捗テーブルを印刷します。

可能な値：
- `tty|on|1|true|yes` - インタラクティブモードで端末に出力します
- `err` - 非インタラクティブモードで`stderr`に出力します
- `off|0|false|no` - プログレステーブルを無効にします

デフォルト値：インタラクティブモードで`tty`、非インタラクティブモード（バッチモード）で`off`。

**`--stacktrace`**

例外のスタックトレースを印刷します。

**`-t [ --time ]`**

非インタラクティブモードでクエリ実行時間を`stderr`に印刷します（ベンチマーク用）。
