---
slug: /interfaces/cli
sidebar_position: 17
sidebar_label: ClickHouseクライアント
title: ClickHouseクライアント
---

ClickHouseは、ClickHouseサーバーに対して直接SQLクエリを実行するためのネイティブなコマンドラインクライアントを提供します。インタラクティブモード（ライブクエリ実行用）とバッチモード（スクリプトおよび自動化用）の両方をサポートしています。クエリ結果はターミナルに表示するか、ファイルにエクスポートでき、Pretty、CSV、JSONなどのすべてのClickHouse出力 [フォーマット](formats.md) をサポートしています。

クライアントは、プログレスバーや読み取った行数、処理されたバイト数、クエリ実行時間を使用して、クエリ実行に関するリアルタイムのフィードバックを提供します。[コマンドラインオプション](#command-line-options) と [構成ファイル](#configuration_files) の両方をサポートしています。


## インストール {#install}

ClickHouseをダウンロードするには、次のコマンドを実行します。

```bash
curl https://clickhouse.com/ | sh
```

インストールするには、次のコマンドを実行します。
```bash
sudo ./clickhouse install
```

その他のインストールオプションについては、[ClickHouseのインストール](../getting-started/install.md)を参照してください。

異なるクライアントとサーバーのバージョンは互換性がありますが、古いクライアントでは一部の機能が利用できない場合があります。クライアントとサーバーは同じバージョンを使用することをお勧めします。


## 実行 {#run}

:::note
ClickHouseをダウンロードしただけでインストールしていない場合は、`clickhouse-client`の代わりに`./clickhouse client`を使用してください。
:::

ClickHouseサーバーに接続するには、次のコマンドを実行します。

```bash
$ clickhouse-client --host server

ClickHouseクライアントバージョン 24.12.2.29 (公式ビルド)。
サーバー:9000 に接続中、ユーザー default として。
ClickHouseサーバーバージョン 24.12.2 に接続済み。

:)
```

必要に応じて追加の接続詳細を指定します：

**`--port <port>`** - ClickHouseサーバーが接続を受け付けているポート。デフォルトのポートは9440 (TLS) と9000 (非TLS) です。ClickHouseクライアントはネイティブプロトコルを使用し、HTTP(S)ではありません。

**`-s [ --secure ]`** - TLSを使用するかどうか（通常は自動検出されます）。

**`-u [ --user ] <username>`** - 接続するデータベースユーザー。デフォルトでは`default`ユーザーとして接続します。

**`--password <password>`** - データベースユーザーのパスワード。構成ファイルで接続用のパスワードを指定することもできます。パスワードを指定しない場合、クライアントはパスワードを尋ねます。

**`-c [ --config ] <path-to-file>`** - ClickHouseクライアント用の構成ファイルの場所。デフォルトの場所にない場合。

**`--connection <name>`** - 構成ファイルからの事前設定された接続詳細の名前。

コマンドラインオプションの完全なリストについては、[コマンドラインオプション](#command-line-options)を参照してください。


### ClickHouse Cloudへの接続 {#connecting-cloud}

ClickHouse Cloudサービスの詳細はClickHouse Cloudコンソールで入手できます。接続したいサービスを選択し、**接続**をクリックします：

<img src={require('../_snippets/images/cloud-connect-button.png').default}
  class="image"
  alt="ClickHouse Cloudサービス接続ボタン"
  style={{width: '30em'}} />

<br/><br/>

**Native**を選択すると、詳細が表示され、例として`clickhouse-client`コマンドが示されます：

<img src={require('../_snippets/images/connection-details-native.png').default}
  class="image"
  alt="ClickHouse Cloud Native TCP接続詳細"
  style={{width: '40em'}} />


### 構成ファイルに接続を保存する {#connection-credentials}

1つまたは複数のClickHouseサーバーの接続詳細を[構成ファイル](#configuration_files)に保存できます。

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

詳細については、[構成ファイルのセクション](#configuration_files)を参照してください。

:::note
クエリ構文に集中するために、他の例では接続詳細（`--host`、`--port`など）を省略しています。コマンドを使用する時は、これらを追加することを忘れないでください。
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

データを挿入する：

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query`が指定されると、入力はリクエストの後に改行が追加されます。

**リモートClickHouseサービスにCSVファイルを挿入する**

この例は、サンプルデータセットCSVファイル`cell_towers.csv`を`default`データベース内の既存のテーブル`cell_towers`に挿入します：

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

**データを挿入するさらに多くの例**

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


## ノート {#notes}

インタラクティブモードでは、デフォルトの出力形式は`PrettyCompact`です。フォーマットをクエリの`FORMAT`句で変更するか、`--format`コマンドラインオプションを指定します。垂直形式を使用するには、`--vertical`を使用するか、クエリの最後に`\G`を指定します。この形式では、各値が別々の行に印刷され、広いテーブルを表示するのに便利です。

バッチモードでは、デフォルトのデータ [フォーマット](formats.md) は`TabSeparated`です。フォーマットはクエリの`FORMAT`句で設定できます。

インタラクティブモードでは、デフォルトでは入力された内容は`Enter`を押すと実行されます。クエリの最後にセミコロンは必要ありません。

クライアントを`-m, --multiline`パラメータで起動できます。マルチラインのクエリを入力するには、改行の前にバックスラッシュ `\` を入力します。`Enter`を押すと、次の行のクエリを入力するように求められます。クエリを実行するには、セミコロンで終了し、`Enter`を押します。

ClickHouseクライアントは`replxx`（`readline`に似ています）に基づいているため、馴染みのあるキーボードショートカットを使用し、履歴を保持します。履歴はデフォルトで`~/.clickhouse-client-history`に書き込まれます。

クライアントを終了するには、`Ctrl+D`を押すか、クエリの代わりに次のいずれかを入力します：`exit`, `quit`, `logout`, `exit;`, `quit;`, `logout;`, `q`, `Q`, `:q`。

クエリを処理すると、クライアントは次の情報を表示します：

1. プログレスはデフォルトで1秒あたり最大10回更新されます。クイッククエリの場合、プログレスが表示される時間がない場合があります。
2. デバッグ用の解析後のクエリのフォーマットされた形。
3. 指定された形式での結果。
4. 結果の行数、経過時間、およびクエリ処理の平均速度。すべてのデータ量は非圧縮データに関連します。

長いクエリをキャンセルするには、`Ctrl+C`を押します。ただし、サーバーにリクエストを中止するのを待つ必要があります。特定の段階でクエリをキャンセルすることはできません。待たずにもう一度`Ctrl+C`を押すと、クライアントは終了します。

ClickHouseクライアントは、クエリ処理のために外部データ（外部一時テーブル）を渡すことができます。詳細については、[クエリ処理のための外部データ](../engines/table-engines/special/external-data.md)のセクションを参照してください。


## パラメータ付きクエリ {#cli-queries-with-parameters}

クエリ内でパラメータを指定し、コマンドラインオプションで値を渡すことができます。これにより、クライアント側で特定の動的値を使用してクエリをフォーマットすることが回避されます。例えば：

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT * FROM table WHERE a = {parName:Array(UInt16)}"
```

インタラクティブセッションからパラメータを設定することも可能です：
```bash
$ clickhouse-client --query "SET param_parName='[1, 2]'; SELECT {parName:Array(UInt16)}"
```

### クエリ構文 {#cli-queries-with-parameters-syntax}

クエリ内で、コマンドラインパラメータを使って埋めたい値を次の形式の中かっこで指定します：

```sql
{<name>:<data type>}
```

- `name` — プレースホルダー識別子。対応するコマンドラインオプションは`--param_<name> = value`です。
- `data type` — パラメータの[データ型](../sql-reference/data-types/index.md)。例えば、`(integer, ('string', integer))`のようなデータ構造は、`Tuple(UInt8, Tuple(String, UInt8))`データ型を持つことができます（他の[整数](../sql-reference/data-types/int-uint.md)型も使用可能です）。テーブル名、データベース名、カラム名をパラメータとして渡すことも可能で、その場合はデータ型として`Identifier`を使用する必要があります。

### 例 {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```


## エイリアス {#cli_aliases}

- `\l` - データベースの表示
- `\d` - テーブルの表示
- `\c <DATABASE>` - データベースの使用
- `.` - 最後のクエリを繰り返す


## キーボードショートカット {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 現在のクエリでエディタを開きます。使用するエディタは環境変数`EDITOR`で指定できます。デフォルトでは`vim`が使用されます。
- `Alt (Option) + #` - 行をコメントアウト。
- `Ctrl + r` - フォuzzy履歴検索。

利用可能なキーボードショートカットの完全なリストは、[replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)にあります。

:::tip
MacOSでメタキー（Option）の正しい動作を設定するには：

iTerm2: 設定 -> プロファイル -> キー -> 左のOptionキーをエスケープに設定します。
:::


## 接続文字列 {#connection_string}

ClickHouseクライアントは、[MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri)に類似の接続文字列を使用してClickHouseサーバーに接続することをサポートしています。次のような構文を持っています：

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

**構成要素**

- `user` - （オプション）データベースユーザー名。デフォルト：`default`。
- `password` - （オプション）データベースユーザーパスワード。`:`が指定され、パスワードが空白の場合、クライアントはユーザーのパスワードを入力するように促します。
- `hosts_and_ports` - （オプション）ホストとオプションのポートのリスト `host[:port] [, host:[port]], ...`。デフォルト：`localhost:9000`。
- `database` - （オプション）データベース名。デフォルト：`default`。
- `query_parameters` - （オプション）キーと値のペアのリスト `param1=value1[,&param2=value2], ...`。一部のパラメータでは、値は不要です。パラメータ名と値は大文字と小文字が区別されます。

接続文字列内にユーザー名、パスワード、またはデータベースが指定されている場合は、`--user`、`--password`、`--database`（その逆も可）で指定することはできません。

ホストコンポーネントは、ホスト名またはIPv4またはIPv6アドレスである必要があります。IPv6アドレスは角括弧内に指定する必要があります：

```text
clickhouse://[2001:db8::1234]
```

接続文字列には複数のホストを含めることができます。ClickHouseクライアントは、これらのホストに左から右の順で接続を試みます。接続が確立されると、残りのホストへの接続を試みることはありません。

接続文字列は`clickHouse-client`の最初の引数として指定する必要があります。接続文字列は`--host`および`--port`を除く任意の他の[コマンドラインオプション](#command-line-options)と組み合わせることができます。

`query_parameters`に許可されるキーは以下の通りです：

- `secure`または短縮形の`s`。指定されている場合、クライアントは安全な接続（TLS）経由でサーバーに接続します。[コマンドラインオプション](#command-line-options)の`--secure`を参照してください。

**パーセントエンコーディング**

非US ASCII、スペース、特別な文字が`user`、`password`、`hosts`、`database`および`query parameters`に含まれる場合、[パーセントエンコード](https://en.wikipedia.org/wiki/URL_encoding)される必要があります。

### 例 {#connection_string_examples}

ポート9000で`localhost`に接続し、クエリ`SELECT 1`を実行します。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

ユーザー`john`としてパスワード`secret`で`localhost`に接続し、ホスト`127.0.0.1`とポート`9000`。

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

デフォルトユーザーとして`localhost`に接続し、IPv6アドレス`[::1]`のホストとポート`9000`を使用します。

```bash
clickhouse-client clickhouse://[::1]:9000
```

マルチラインモードでポート9000の`localhost`に接続します。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

デフォルトユーザー`default`としてポート9000の`localhost`に接続します。

```bash
clickhouse-client clickhouse://default@localhost:9000

# 次のコマンドと同等：
clickhouse-client clickhouse://localhost:9000 --user default
```

ポート9000で`localhost`に接続し、接続文字列で指定されたデフォルトの`my_database`データベースを使用します。

```bash
clickhouse-client clickhouse://localhost:9000/my_database

# 次のコマンドと同等：
clickhouse-client clickhouse://localhost:9000 --database my_database
```

ポート9000で`localhost`に接続し、接続文字列で指定された`my_database`データベースを使用して短縮形の`s`パラメータを使った安全な接続。

```bash
clickhouse-client clickhouse://localhost/my_database?s

# 次のコマンドと同等：
clickhouse-client clickhouse://localhost/my_database -s
```

デフォルトホストとデフォルトポート、デフォルトユーザー、デフォルトデータベースで接続します。

```bash
clickhouse-client clickhouse:
```

デフォルトポートを使用してデフォルトホストに接続し、ユーザー`my_user`としてパスワードなしで接続します。

```bash
clickhouse-client clickhouse://my_user@

# :と@の間に空白のパスワードがある場合、接続開始前にユーザーにパスワードの入力を促します。
clickhouse-client clickhouse://my_user:@
```

メールアドレスをユーザー名として使用して`localhost`に接続します。`@`記号は`%40`にパーセントエンコードされます。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

2つのホストのいずれかに接続します：`192.168.1.15`、`192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```


## クエリID形式 {#query-id-format}

インタラクティブモードでは、ClickHouseクライアントは各クエリのクエリIDを表示します。デフォルトでは、IDは次のようにフォーマットされています：

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

カスタムフォーマットは、`query_id_formats`タグ内の構成ファイルで指定できます。フォーマット文字列内の`{query_id}`プレースホルダーはクエリIDに置き換えられます。タグ内には複数のフォーマット文字列が許可されます。
この機能は、クエリのプロファイリングを促進するURLを生成するために使用されます。

**例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

上記の構成を使うと、クエリのIDは次の形式で表示されます：

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```


## 構成ファイル {#configuration_files}

ClickHouseクライアントは、次のいずれかのファイルの最初に存在するものを使用します：

- `-c [ -C, --config, --config-file ]`パラメータで定義されたファイル。
- `./clickhouse-client.[xml|yaml|yml]`
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

ClickHouseリポジトリ内のサンプル構成ファイルを参照してください：[`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

例のXML構文：

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

同じ構成をYAML形式で：

```yaml
user: username
password: 'password'
secure: true
openSSL:
  client:
    caConfig: '/etc/ssl/cert.pem'
```


## コマンドラインオプション {#command-line-options}

すべてのコマンドラインオプションは、コマンドラインで直接指定することも、[構成ファイル](#configuration_files)のデフォルトとして指定することもできます。

### 一般オプション {#command-line-options-general}

**`-c [ -C, --config, --config-file ] <path-to-file>`**

クライアントの構成ファイルの場所。デフォルトの場所にない場合は、[構成ファイル](#configuration_files)を参照してください。

**`--help`**

使用法の要約を表示して終了します。`--verbose`と組み合わせて、クエリ設定を含むすべてのオプションを表示します。

**`--history_file <path-to-file>`**

コマンド履歴を含むファイルのパス。

**`--history_max_entries`**

履歴ファイル内のエントリの最大数。

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

構成ファイルからの事前設定された接続詳細の名前。接続資格情報については、[接続資格情報](#connection-credentials)を参照してください。

**`-d [ --database ] <database>`**

この接続のデフォルトにするデータベースを選択します。

デフォルト値：サーバー設定からの現在のデータベース（デフォルトでは`default`）。

**`-h [ --host ] <host>`**

接続するClickHouseサーバーのホスト名。ホスト名またはIPv4またはIPv6アドレスのいずれかです。複数のホストを複数の引数で指定できます。

デフォルト値：localhost

**`--jwt <value>`**

認証のためにJSON Webトークン（JWT）を使用します。

サーバーJWT認証はClickHouse Cloudでのみ利用可能です。

**`--no-warnings`**

クライアントがサーバーに接続するとき、`system.warnings`からの警告を表示しないようにします。

**`--password <password>`**

データベースユーザーのパスワード。接続用のパスワードを構成ファイルで指定することもできます。パスワードを指定しない場合、クライアントはそれを尋ねます。

**`--port <port>`**

サーバーが接続を受け付けているポート。デフォルトのポートは9440（TLS）と9000（非TLS）です。

注意：クライアントはネイティブプロトコルを使用し、HTTP(S)ではありません。

デフォルト値：`--secure`が指定されている場合は9440、そうでない場合は9000。ホスト名が`.clickhouse.cloud`で終わる場合、常に9440がデフォルトです。

**`-s [ --secure ]`**

TLSを使用するかどうか。

ポート9440（デフォルトの安全なポート）またはClickHouse Cloudに接続する際に自動的に有効になります。

[構成ファイル](#configuration_files)でCA証明書を構成する必要がある場合があります。使用可能な構成設定は、[サーバー側のTLS構成](../operations/server-configuration-parameters/settings.md#openssl)と同じです。

**`--ssh-key-file <path-to-file>`**

サーバー認証用SSH秘密鍵を含むファイル。

**`--ssh-key-passphrase <value>`**

`--ssh-key-file`で指定されたSSH秘密鍵のパスフレーズ。

**`-u [ --user ] <username>`**

接続するデータベースユーザー。

デフォルト値：default

`--host`、`--port`、`--user`、`--password`オプションの代わりに、クライアントは[接続文字列](#connection_string)もサポートしています。

### クエリオプション {#command-line-options-query}

**`--param_<name>=<value>`**

[パラメータ付きクエリ](#cli-queries-with-parameters)のパラメータの置換値。

**`-q [ --query ] <query>`**

バッチモードで実行するクエリ。複数回指定でき（`--query "SELECT 1" --query "SELECT 2"`）、またはセミコロンで区切った複数のクエリを一度に指定できます（`--query "SELECT 1; SELECT 2;"`）。後者の場合、`VALUES`以外のフォーマットの`INSERT`クエリは空白行で区切る必要があります。

単一のクエリは、パラメータなしで指定することも可能です：
```bash
$ clickhouse-client "SELECT 1"
1
```

`--queries-file`と一緒に使用することはできません。

**`--queries-file <path-to-file>`**

クエリを含むファイルへのパス。`--queries-file`を複数回指定できます。例：`--queries-file  queries1.sql --queries-file  queries2.sql`。

`--query`と一緒に使用することはできません。

**`-m [ --multiline ]`**

指定された場合、マルチラインのクエリを許可します（`Enter`でクエリを送信しない）。クエリはセミコロンで終了するまで送信されません。

### クエリ設定 {#command-line-options-query-settings}

クエリ設定は、クライアント内のコマンドラインオプションとして指定できます。例えば：
```bash
$ clickhouse-client --max_threads 1
```

設定のリストについては、[設定](../operations/settings/settings.md)を参照してください。

### フォーマットオプション {#command-line-options-formatting}

**`-f [ --format ] <format>`**

指定したフォーマットを使用して結果を出力します。

サポートされているフォーマットのリストについては、[入力および出力データのフォーマット](formats.md)を参照してください。

デフォルト値：TabSeparated

**`--pager <command>`**

すべての出力をこのコマンドにパイプします。通常は`less`（例：広い結果セットを表示するための`less -S`）または同様のものです。

**`-E [ --vertical ]`**

[垂直フォーマット](../interfaces/formats.md#vertical)を使用して結果を出力します。これは`–-format Vertical`と同じです。この形式では、各値が別々の行に印刷され、広いテーブルを表示するのに便利です。

### 実行の詳細 {#command-line-options-execution-details}

**`--enable-progress-table-toggle`**

プログレステーブルのトグルを有効にします。制御キー（スペース）を押すことで実行できます。インタラクティブモードでプログレステーブルの印刷が有効な場合にのみ適用されます。

デフォルト値：有効

**`--hardware-utilization`**

プログレスバーにハードウェアの使用状況を表示します。

**`--memory-usage`**

指定された場合、非インタラクティブモードで`stderr`にメモリ使用量を表示します。

可能な値：
- `none` - メモリ使用量を表示しない
- `default` - バイト数を表示
- `readable` - 人間が読める形式でメモリ使用量を表示

**`--print-profile-events`**

`ProfileEvents`パケットを印刷します。

**`--progress`**

クエリ実行の進捗を印刷します。

可能な値：
- `tty|on|1|true|yes` - インタラクティブモードでターミナルに出力
- `err` - 非インタラクティブモードで`stderr`に出力
- `off|0|false|no` - プログレス印刷を無効にします

デフォルト値：インタラクティブモードでは`tty`、非インタラクティブ（バッチ）モードでは`off`。

**`--progress-table`**

クエリ実行中のメトリックの変化を伴うプログレステーブルを印刷します。

可能な値：
- `tty|on|1|true|yes` - インタラクティブモードでターミナルに出力
- `err` - 非インタラクティブモードで`stderr`に出力
- `off|0|false|no` - プログレステーブルを無効にします

デフォルト値：インタラクティブモードでは`tty`、非インタラクティブ（バッチ）モードでは`off`。

**`--stacktrace`**

例外のスタックトレースを印刷します。

**`-t [ --time ]`**

ベンチマーク用の非インタラクティブモードで、`stderr`にクエリ実行時間を印刷します。
