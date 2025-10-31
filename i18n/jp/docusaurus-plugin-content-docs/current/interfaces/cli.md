---
'description': 'ClickHouse コマンドライン クライアント インターフェースのドキュメント'
'sidebar_label': 'ClickHouse Client'
'sidebar_position': 17
'slug': '/interfaces/cli'
'title': 'ClickHouse Client'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png'

ClickHouseは、ClickHouseサーバーに対してSQLクエリを直接実行するためのネイティブなコマンドラインクライアントを提供します。これはインタラクティブモード（ライブクエリ実行のため）とバッチモード（スクリプト作成や自動化のため）の両方をサポートしています。クエリの結果はターミナルに表示したり、ファイルにエクスポートしたりでき、Pretty、CSV、JSONなどのすべてのClickHouse出力[形式](formats.md)をサポートしています。

このクライアントは、進行状況バーと読み取った行数、処理されたバイト数、クエリ実行時間に関するリアルタイムのフィードバックを提供します。また、[コマンドラインオプション](#command-line-options)と[設定ファイル](#configuration_files)の両方をサポートしています。

## インストール {#install}

ClickHouseをダウンロードするには、次のコマンドを実行します：

```bash
curl https://clickhouse.com/ | sh
```

さらにインストールするには、次のコマンドを実行します：
```bash
sudo ./clickhouse install
```

詳細なインストールオプションについては、[ClickHouseをインストールする](../getting-started/install/install.mdx)を参照してください。

異なるクライアントとサーバーバージョンは互換性がありますが、一部の機能は古いクライアントでは利用できない場合があります。クライアントとサーバーは同じバージョンを使用することをお勧めします。

## 実行 {#run}

:::note
ClickHouseをダウンロードしたがインストールしていない場合は、`./clickhouse client`を使用してください。
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

**`--port <port>`** - ClickHouseサーバーが接続を受け入れるポート。デフォルトのポートは9440（TLS）および9000（非TLS）です。注意：ClickHouseクライアントはネイティブプロトコルを使用し、HTTP(S)ではありません。

**`-s [ --secure ]`** - TLSを使用するかどうか（通常は自動検出されます）。

**`-u [ --user ] <username>`** - 接続するデータベースユーザー。デフォルトでは`default`ユーザーとして接続します。

**`--password <password>`** - データベースユーザーのパスワード。設定ファイルで接続のためのパスワードを指定することもできます。パスワードを指定しない場合、クライアントはそれを要求します。

**`-c [ --config ] <path-to-file>`** - ClickHouseクライアントの設定ファイルの位置。デフォルトの場所ではない場合。

**`--connection <name>`** - 設定ファイルから事前構成された接続詳細の名前。

コマンドラインオプションの完全なリストについては、[コマンドラインオプション](#command-line-options)を参照してください。

### ClickHouse Cloudへの接続 {#connecting-cloud}

ClickHouse Cloudサービスの詳細はClickHouse Cloudコンソールで利用できます。接続したいサービスを選択し、**接続**をクリックします：

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloudサービス接続ボタン"
/>

<br/><br/>

**Native**を選択すると、詳細が表示され、`clickhouse-client`の例が示されます：

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse Cloud Native TCP接続の詳細"
/>

### 設定ファイルに接続を保存する {#connection-credentials}

1つ以上のClickHouseサーバーの接続詳細を[設定ファイル](#configuration_files)に保存することができます。

フォーマットは次のようになります：
```xml
<config>
    <connections_credentials>
        <connection>
            <name>default</name>
            <hostname>hostname</hostname>
            <port>9440</port>
            <secure>1</secure>
            <user>default</user>
            <password>password</password>
            <!-- <history_file></history_file> -->
            <!-- <history_max_entries></history_max_entries> -->
            <!-- <accept-invalid-certificate>false</accept-invalid-certificate> -->
            <!-- <prompt></prompt> -->
        </connection>
    </connections_credentials>
</config>
```

詳細については、[設定ファイルに関するセクション](#configuration_files)を参照してください。

:::note
クエリ構文に集中するために、残りの例では接続の詳細（`--host`、`--port`など）が省略されています。コマンドを実行するときは、必ず追加してください。
:::

## バッチモード {#batch-mode}

ClickHouseクライアントをインタラクティブに使用する代わりに、バッチモードで実行できます。

次のように単一のクエリを指定できます：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

また、`--query`コマンドラインオプションを使用することもできます：

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

`--query`が指定されている場合、任意の入力は行送りの後にリクエストに追加されます。

**リモートClickHouseサービスにCSVファイルを挿入する**

この例では、サンプルデータセットCSVファイル`cell_towers.csv`を、`default`データベースの既存のテーブル`cell_towers`に挿入しています：

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

**データを挿入する他の例**

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

インタラクティブモードでは、デフォルトの出力形式は`PrettyCompact`です。クエリの`FORMAT`句で形式を変更するか、`--format`コマンドラインオプションを指定することができます。垂直形式を使用するには、`--vertical`を使用するか、クエリの最後に`\G`を指定します。この形式では、各値が別の行に印刷され、広いテーブルの場合に便利です。

バッチモードでは、デフォルトのデータ[形式](formats.md)は`TabSeparated`です。クエリの`FORMAT`句で形式を設定できます。

インタラクティブモードでは、デフォルトで入力されたものは`Enter`キーを押すと実行されます。クエリの最後にセミコロンは必要ありません。

クライアントは`-m, --multiline`パラメータで起動できます。マルチラインクエリを入力するには、改行の前にバックスラッシュ`\`を入力します。`Enter`を押すと、クエリの次の行を入力するよう求められます。クエリを実行するには、セミコロンで終わらせて`Enter`を押します。

ClickHouseクライアントは`replxx`（`readline`に似ています）に基づいているため、馴染みのあるキーボードショートカットを使用し、履歴を保持します。履歴はデフォルトで`~/.clickhouse-client-history`に書き込まれます。

クライアントを終了するには、`Ctrl+D`を押すか、クエリの代わりに次のいずれかを入力します：`exit`、`quit`、`logout`、`exit;`、`quit;`、`logout;`、`q`、`Q`、`:q`。

クエリを処理している間、クライアントは次の情報を表示します：

1. デフォルトでは、進行状況が1秒あたり10回以上更新されます。クイッククエリの場合、進行状況が表示される時間がない場合があります。
2. デバッグ用に解析後のフォーマットされたクエリ。
3. 指定された形式での結果。
4. 結果の行数、経過時間、クエリ処理の平均速度。すべてのデータ量は未圧縮データに関連しています。

長いクエリをキャンセルするには、`Ctrl+C`を押します。ただし、リクエストを中止するまで少し待つ必要があります。特定の段階でクエリをキャンセルすることはできません。待たずに`Ctrl+C`を2回押すと、クライアントが終了します。

ClickHouseクライアントは、外部データ（外部一時テーブル）をクエリ用に渡すことを許可します。詳細については、[クエリ処理のための外部データ](../engines/table-engines/special/external-data.md)のセクションを参照してください。

## パラメータ付きクエリ {#cli-queries-with-parameters}

クエリ内にパラメータを指定し、コマンドラインオプションを使って値を渡すことができます。これにより、クライアント側で特定の動的値を使用してクエリをフォーマットする手間が省けます。例えば：

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT * FROM table WHERE a = {parName:Array(UInt16)}"
```

インタラクティブセッション内からパラメータを設定することもできます：
```bash
$ clickhouse-client --query "SET param_parName='[1, 2]'; SELECT {parName:Array(UInt16)}"
```

### クエリ構文 {#cli-queries-with-parameters-syntax}

クエリの中で、コマンドラインパラメータを使用して埋めたい値を次のフォーマットで波括弧で囲んでおきます：

```sql
{<name>:<data type>}
```

- `name` — プレースホルダー識別子。対応するコマンドラインオプションは`--param_<name>=value`です。
- `data type` — パラメータの[データタイプ](../sql-reference/data-types/index.md)。例えば、データ構造`(整数、('文字列', 整数))`は`Tuple(UInt8, Tuple(String, UInt8))`データタイプを持つことができます（他の[整数](../sql-reference/data-types/int-uint.md)タイプも使えます）。テーブル名、データベース名、カラム名をパラメータとして渡すことも可能で、その場合はデータ型として`Identifier`を使用する必要があります。

### 例 {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```

## AIによるSQL生成 {#ai-sql-generation}

ClickHouseクライアントには、自然言語の説明からSQLクエリを生成するための組み込みAIアシスタンスが含まれています。この機能は、ユーザーが深いSQL知識なしに複雑なクエリを書く手助けをします。

AIアシスタンスは、`OPENAI_API_KEY`または`ANTHROPIC_API_KEY`の環境変数が設定されている場合に、そのまま機能します。より高度な設定については、[設定](#ai-sql-generation-configuration)のセクションを参照してください。

### 使用方法 {#ai-sql-generation-usage}

AI SQL生成を使用するには、あなたの自然言語のクエリの前に`??`を付けます：

```bash
:) ?? show all users who made purchases in the last 30 days
```

AIは以下を行います：
1. データベーススキーマを自動的に探索します
2. 発見したテーブルとカラムに基づいて適切なSQLを生成します
3. 生成されたクエリをすぐに実行します

### 例 {#ai-sql-generation-example}

```bash
:) ?? count orders by product category

Starting AI SQL generation with schema discovery...
──────────────────────────────────────────────────

🔍 list_databases
   ➜ system, default, sales_db

🔍 list_tables_in_database
   database: sales_db
   ➜ orders, products, categories

🔍 get_schema_for_table
   database: sales_db
   table: orders
   ➜ CREATE TABLE orders (order_id UInt64, product_id UInt64, quantity UInt32, ...)

✨ SQL query generated successfully!
──────────────────────────────────────────────────

SELECT 
    c.name AS category,
    COUNT(DISTINCT o.order_id) AS order_count
FROM sales_db.orders o
JOIN sales_db.products p ON o.product_id = p.product_id
JOIN sales_db.categories c ON p.category_id = c.category_id
GROUP BY c.name
ORDER BY order_count DESC
```

### 設定 {#ai-sql-generation-configuration}

AI SQL生成には、ClickHouseクライアントの設定ファイルでAIプロバイダーを設定する必要があります。OpenAI、Anthropic、またはOpenAI互換のAPIサービスを使用できます。

#### 環境に基づくフォールバック {#ai-sql-generation-fallback}

設定ファイルにAIの設定が指定されていない場合、ClickHouseクライアントは環境変数を自動的に使用しようとします：

1. まず`OPENAI_API_KEY`環境変数を確認します
2. 見つからなければ、`ANTHROPIC_API_KEY`環境変数を確認します
3. どちらも見つからなければ、AI機能は無効になります

これにより、設定ファイルなしで迅速にセットアップ可能です：
```bash

# Using OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client


# Using Anthropic
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```

#### 設定ファイル {#ai-sql-generation-configuration-file}

AI設定に対するより詳細な制御のために、ClickHouseクライアントの設定ファイルで設定します：
- `~/.clickhouse-client/config.xml`（XMLフォーマット）
- `~/.clickhouse-client/config.yaml`（YAMLフォーマット）
- または、`--config-file`でカスタム位置を指定します

**XMLフォーマットの例：**

```xml
<config>
    <ai>
        <!-- Required: Your API key (or set via environment variable) -->
        <api_key>your-api-key-here</api_key>

        <!-- Required: Provider type (openai, anthropic) -->
        <provider>openai</provider>

        <!-- Model to use (defaults vary by provider) -->
        <model>gpt-4o</model>

        <!-- Optional: Custom API endpoint for OpenAI-compatible services -->
        <!-- <base_url>https://openrouter.ai/api</base_url> -->

        <!-- Schema exploration settings -->
        <enable_schema_access>true</enable_schema_access>

        <!-- Generation parameters -->
        <temperature>0.0</temperature>
        <max_tokens>1000</max_tokens>
        <timeout_seconds>30</timeout_seconds>
        <max_steps>10</max_steps>

        <!-- Optional: Custom system prompt -->
        <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
    </ai>
</config>
```

**YAMLフォーマットの例：**

```yaml
ai:
  # Required: Your API key (or set via environment variable)
  api_key: your-api-key-here

  # Required: Provider type (openai, anthropic)
  provider: openai

  # Model to use
  model: gpt-4o

  # Optional: Custom API endpoint for OpenAI-compatible services
  # base_url: https://openrouter.ai/api

  # Enable schema access - allows AI to query database/table information
  enable_schema_access: true

  # Generation parameters
  temperature: 0.0      # Controls randomness (0.0 = deterministic)
  max_tokens: 1000      # Maximum response length
  timeout_seconds: 30   # Request timeout
  max_steps: 10         # Maximum schema exploration steps

  # Optional: Custom system prompt
  # system_prompt: |
  #   You are an expert ClickHouse SQL assistant. Convert natural language to SQL.
  #   Focus on performance and use ClickHouse-specific optimizations.
  #   Always return executable SQL without explanations.
```

**OpenAI互換APIを使用（例：OpenRouter）：**

```yaml
ai:
  provider: openai  # Use 'openai' for compatibility
  api_key: your-openrouter-api-key
  base_url: https://openrouter.ai/api/v1
  model: anthropic/claude-3.5-sonnet  # Use OpenRouter model naming
```

**最小限の設定例：**

```yaml

# Minimal config - uses environment variable for API key
ai:
  provider: openai  # Will use OPENAI_API_KEY env var


# No config at all - automatic fallback

# (Empty or no ai section - will try OPENAI_API_KEY then ANTHROPIC_API_KEY)


# Only override model - uses env var for API key
ai:
  provider: openai
  model: gpt-3.5-turbo
```

### パラメータ {#ai-sql-generation-parameters}

**必要なパラメータ：**
- `api_key` - AIサービスのAPIキー。環境変数で設定されている場合は省略可能：
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - 注：設定ファイル内のAPIキーは環境変数よりも優先されます
- `provider` - AIプロバイダー：`openai`または`anthropic`
  - 省略された場合、利用可能な環境変数に基づいて自動的にフォールバックします

**モデル設定：**
- `model` - 使用するモデル（デフォルト：プロバイダ固有）
  - OpenAI: `gpt-4o`、`gpt-4`、`gpt-3.5-turbo`など
  - Anthropic: `claude-3-5-sonnet-20241022`、`claude-3-opus-20240229`など
  - OpenRouter: 例として`anthropic/claude-3.5-sonnet`のようにモデル名を使用

**接続設定：**
- `base_url` - OpenAI互換サービスのカスタムAPIエンドポイント（オプション）
- `timeout_seconds` - リクエストタイムアウト（デフォルト: `30`）

**スキーマ探索：**
- `enable_schema_access` - AIがデータベースのスキーマを探索できるようにします（デフォルト: `true`）
- `max_steps` - スキーマ探索のための最大ツールコールステップ（デフォルト: `10`）

**生成パラメータ：**
- `temperature` - ランダム性を制御します。0.0 = 決定的、1.0 = 創造的（デフォルト: `0.0`）
- `max_tokens` - トークン内の最大応答長（デフォルト: `1000`）
- `system_prompt` - AIへのカスタム指示（オプション）

### 仕組み {#ai-sql-generation-how-it-works}

AI SQLジェネレーターは、以下の多段階プロセスを使用します：

1. **スキーマ発見**: AIは内蔵ツールを使用してあなたのデータベースを探索します：
   - 利用可能なデータベースをリストします
   - 関連するデータベース内のテーブルを発見します
   - `CREATE TABLE`ステートメントを介してテーブル構造を調査します

2. **クエリ生成**: 発見されたスキーマに基づいて、AIは次の条件に一致するSQLを生成します：
   - 自然言語の意図に一致します
   - 正しいテーブルとカラム名を使用します
   - 適切な結合や集計を適用します

3. **実行**: 生成されたSQLは自動的に実行され、結果が表示されます

### 制限事項 {#ai-sql-generation-limitations}

- インターネット接続が必要です
- APIの使用はAIプロバイダーのレート制限およびコストの対象となります
- 複雑なクエリは複数の修正を必要とする場合があります
- AIはスキーマ情報に対する読み取り専用アクセス権しか持たず、実際のデータにはアクセスできません

### セキュリティ {#ai-sql-generation-security}

- APIキーはClickHouseサーバーに送信されることはありません
- AIはスキーマ情報（テーブル/カラム名および型）のみを参照し、実際のデータにはアクセスできません
- すべての生成されたクエリは、既存のデータベース権限を尊重します

## エイリアス {#cli_aliases}

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 最後のクエリを再実行する

## キーボードショートカット {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 現在のクエリでエディタを開きます。使用するエディタを`EDITOR`環境変数で指定することができます。デフォルトでは`vim`が使用されます。
- `Alt (Option) + #` - 行をコメントアウトします。
- `Ctrl + r` - ファジー履歴検索を行います。

すべての利用可能なキーボードショートカットのフルリストは[replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)で利用可能です。

:::tip
MacOSでのメタキー（Option）の正しい動作を設定するには：

iTerm2: Preferences -> Profile -> Keys -> Left Option keyに移動し、Esc+をクリックします。
:::

## 接続文字列 {#connection_string}

ClickHouseクライアントは、[MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri)のように接続文字列を使ってClickHouseサーバーに接続することもできます。以下の構文を持ちます：

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

**コンポーネント**

- `user` - (オプション) データベースユーザー名。デフォルト: `default`。
- `password` - (オプション) データベースユーザーパスワード。`:`が指定され、パスワードが空白の場合、クライアントはユーザーのパスワードを要求します。
- `hosts_and_ports` - (オプション) ホストとオプションポートのリスト`host[:port] [, host:[port]], ...`。デフォルト: `localhost:9000`。
- `database` - (オプション) データベース名。デフォルト: `default`。
- `query_parameters` - (オプション) キーと値のペアのリスト`param1=value1[,&param2=value2], ...`。いくつかのパラメータに対しては値は必要ありません。パラメータ名と値は大文字と小文字を区別します。

接続文字列でユーザー名、パスワード、またはデータベースが指定されている場合、`--user`、`--password`、または`--database`（およびその逆）で再指定することはできません。

ホストコンポーネントはホスト名またはIPv4またはIPv6アドレスのいずれかであることができます。IPv6アドレスは角括弧内に表記する必要があります：

```text
clickhouse://[2001:db8::1234]
```

接続文字列には複数のホストを含めることができます。ClickHouseクライアントは左から右の順にこれらのホストに接続しようとします。接続が確立された後、残りのホストへの接続を試みることはありません。

接続文字列は`clickHouse-client`の最初の引数として指定する必要があります。接続文字列は、`--host`と`--port`以外の任意の他の[コマンドラインオプション](#command-line-options)と組み合わせることができます。

`query_parameters`に許可されるキーは以下の通りです：

- `secure`または省略形の`s`。指定された場合、クライアントは安全な接続（TLS）を通じてサーバーに接続します。詳細は[コマンドラインオプション](#command-line-options)の`--secure`を参照してください。

**パーセントエンコーディング**

非米国ASCII、スペース、および`user`、`password`、`hosts`、`database`、`query parameters`の特殊文字は[パーセントエンコーディング](https://en.wikipedia.org/wiki/URL_encoding)を施さなければなりません。

### 例 {#connection_string_examples}

ポート9000の`localhost`に接続し、クエリ`SELECT 1`を実行します。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

パスワード`secret`を持つユーザー`john`として、ホスト`127.0.0.1`のポート9000に`localhost`に接続します。

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

`default`ユーザーとして、IPv6アドレス`[::1]`のホスト、ポート9000に`localhost`に接続します。

```bash
clickhouse-client clickhouse://[::1]:9000
```

マルチラインモードでポート9000の`localhost`に接続します。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

ユーザー`default`として、ポート9000の`localhost`に接続します。

```bash
clickhouse-client clickhouse://default@localhost:9000


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

接続文字列で指定された`my_database`データベースにデフォルトで`localhost`にポート9000で接続します。

```bash
clickhouse-client clickhouse://localhost:9000/my_database


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

接続文字列で指定されたデフォルトの`my_database`データベースと省略形の`s`パラメータを使用して、安全な接続を持つポート9000の`localhost`に接続します。

```bash
clickhouse-client clickhouse://localhost/my_database?s


# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

デフォルトホストに、デフォルトのポート、デフォルトのユーザー、およびデフォルトのデータベースで接続します。

```bash
clickhouse-client clickhouse:
```

デフォルトホストに、デフォルトのポートを使用して、ユーザー`my_user`およびパスワードなしで接続します。

```bash
clickhouse-client clickhouse://my_user@


# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

ユーザー名として電子メールを使用して`localhost`に接続します。`@`記号は`%40`にパーセントエンコーディングされます。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

2つのホストのいずれかに接続します：`192.168.1.15`、`192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## クエリIDフォーマット {#query-id-format}

インタラクティブモードでは、ClickHouseクライアントは各クエリに対してクエリIDを表示します。デフォルトでは、IDは次のようにフォーマットされます：

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

カスタムフォーマットは、設定ファイル内の`query_id_formats`タグで指定できます。フォーマット文字列内の`{query_id}`プレースホルダーは、クエリIDに置き換えられます。複数のフォーマット文字列をタグ内に指定することができます。この機能は、クエリのプロファイリングを容易にするURLを生成するために使用できます。

**例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

上記の設定により、クエリのIDが次のフォーマットで表示されます：

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```

## 設定ファイル {#configuration_files}

ClickHouseクライアントは、次のいずれかの最初に存在するファイルを使用します：

- `-c [ -C, --config, --config-file ]`パラメータで定義されたファイル。
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
    <host>hostname</host>
    <connections_credentials>
      <connection>
        <name>cloud</name>
        <hostname>abc.clickhouse.cloud</hostname>
        <user>username</user>
        <password>password</password>
      </connection>
    </connections_credentials>
    <openSSL>
      <client>
        <caConfig>/etc/ssl/cert.pem</caConfig>
      </client>
    </openSSL>
</config>
```

YAMLフォーマットでの同じ構成：

```yaml
user: username
password: 'password'
secure: true
connections_credentials:
  connection:
    - name: cloud
      hostname: abc.clickhouse.cloud
      user: username
      password: 'password'
openSSL:
  client:
    caConfig: '/etc/ssl/cert.pem'
```

## クライアント設定の解決 {#config_resolution}

クライアントの構成は次のパターンに従います：

1. [コマンドラインオプション](#command-line-options)で渡されたパラメータは
    最も高い優先順位を持ちます。
2. コマンドラインで渡されていないパラメータには、[環境変数オプション](#environment-variable-options)が使用されます。
3. その他の接続オプションは、設定ファイル内の`connections_credentials`キーの下の1つ以上の`connection`オブジェクトから引き出されます。ここで、`connection.name`は接続名と一致します。その名前は、`--connection`の値、ルート`connection`パラメータ、`--host`オプションまたはルート`host`パラメータ、または`default`によって決まります。名前に一致するすべての`connections`が、出現順に評価されます。それぞれの`connection`オブジェクトでサポートされるキーは次の通りです：
    *   `name`
    *   `hostname`
    *   `port`
    *   `secure`
    *   `user`
    *   `password`
    *   `database`
    *   `history_file`
    *   `history_max_entries`
    *   `accept-invalid-certificate`
    *   `prompt`
4. 最後に、ルートレベルで設定されたパラメータが適用されます。
    これには以下が含まれます：
    *   `connection`
    *   `secure`および`no-secure`
    *   `bind_host`
    *   `host`
    *   `port`
    *   `user`
    *   `password`
    *   `database`
    *   `history_file`
    *   `history_max_entries`
    *   `accept-invalid-certificate`
    *   `prompt`
    *   `jwt`
    *   `ssh-key-file`
    *   `ssh-key-passphrase`
    *   `ask-password`

## 追加の設定パラメータ {#additional_configuration}

これらの追加のパラメータも、設定のルートレベルで設定でき、他の方法で上書きされません：

*   `quota_key`
*   `compression`
*   `connect_timeout`
*   `send_timeout`
*   `receive_timeout`
*   `tcp_keep_alive_timeout`
*   `handshake_timeout_ms`
*   `sync_request_timeout`
*   `tcp_port`
*   `tcp_port_secure`

### セキュア接続 {#secure_connections}

`openSSL`オブジェクトは、TLS暗号化と認証の動作を決定します。詳細は、[OpenSSL](https://clickhouse.com/docs/operations/server-configuration-parameters/settings#openssl)を参照してください。

`openSSL`オブジェクトおよび他のパラメータは、安全な接続を使用するかどうかの決定にも影響します：

*   `--secure`が渡された場合、またはルートまたは`connection`構成パラメータに`secure`が設定されている場合、接続は暗号化されます。
*   `--no-secure`が渡された場合、またはルートの`no-secure`パラメータが`true`の場合、接続は暗号化されません。
*   ホスト名が`clickhouse.cloud`のサブドメインに解決された場合、接続は暗号化されます。
*   [ポート](https://clickhouse.com/docs/guides/sre/network-ports)がネイティブプロトコルのSSL/TLSポート`9440`に解決された場合、接続は暗号化されます。

## 環境変数オプション {#environment-variable-options}

ユーザー名、パスワード、およびホストは、環境変数`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_HOST`経由で設定できます。コマンドライン引数`--user`、`--password`、または`--host`、または[接続文字列](#connection_string)（指定された場合）が環境変数よりも優先されます。

## コマンドラインオプション {#command-line-options}

すべてのコマンドラインオプションは、コマンドラインで直接指定するか、[設定ファイル](#configuration_files)にデフォルトとして指定できます。

### 一般オプション {#command-line-options-general}

**`-c [ -C, --config, --config-file ] <path-to-file>`**

クライアントの設定ファイルの場所。デフォルトの場所でない場合。[設定ファイル](#configuration_files)を参照してください。

**`--help`**

使用法の概要を表示し、終了します。`--verbose`と組み合わせることで、クエリ設定を含むすべての可能なオプションを表示します。

**`--history_file <path-to-file>`**

 コマンド履歴を含むファイルへのパス。

**`--history_max_entries`**

履歴ファイルの最大エントリ数。

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

設定ファイルから事前構成された接続詳細の名前。[接続認証情報](#connection-credentials)を参照してください。

**`-d [ --database ] <database>`**

この接続のデフォルトにするデータベースを選択します。

デフォルト値：サーバー設定からの現在のデータベース（デフォルトでは`default`）。

**`-h [ --host ] <host>`**

接続するClickHouseサーバーのホスト名。ホスト名またはIPv4またはIPv6アドレスのいずれかであることができます。複数のホストを複数の引数で渡すことができます。

デフォルト値：localhost

**`--login`**

IDPを介して認証するためにデバイスGrant OAuthフローを呼び出します。ClickHouse Cloudホストの場合、OAuth変数は推測され、そうでない場合は`--oauth-url`、`--oauth-client-id`および`--oauth-audience`で提供される必要があります。

**`--jwt <value>`**

認証にJSON Web Token（JWT）を使用します。

サーバーJWT認証はClickHouse Cloudでのみ使用可能です。

**`--no-warnings`**

クライアントがサーバーに接続するとき、`system.warnings`からの警告の表示を無効にします。

**`--password <password>`**

データベースユーザーのパスワード。設定ファイルで接続のためのパスワードを指定することもできます。パスワードを指定しない場合、クライアントはそれを要求します。

**`--port <port>`**

サーバーが接続を受け入れているポート。デフォルトのポートは9440（TLS）と9000（非TLS）です。

注意：クライアントはネイティブプロトコルを使用し、HTTP(S)ではありません。

デフォルト値：`--secure`が指定されている場合は9440、そうでない場合は9000です。ホスト名が`.clickhouse.cloud`で終わる場合は、常に9440がデフォルトです。

**`-s [ --secure ]`**

TLSを使用するかどうか。

ポート9440（デフォルトの安全なポート）またはClickHouse Cloudに接続する際に自動的に有効になります。

[設定ファイル](#configuration_files)にCA証明書を設定する必要があるかもしれません。利用可能な設定は[サーバー側TLS設定](../operations/server-configuration-parameters/settings.md#openssl)と同じです。

**`--ssh-key-file <path-to-file>`**

サーバーと認証するためのSSH秘密鍵を含むファイル。

**`--ssh-key-passphrase <value>`**

`--ssh-key-file`で指定されたSSH秘密鍵のパスフレーズ。

**`-u [ --user ] <username>`**

接続するデータベースユーザー。

デフォルト値：default

`--host`、`--port`、`--user`、および`--password`オプションの代わりに、クライアントは[接続文字列](#connection_string)もサポートします。

### クエリオプション {#command-line-options-query}

**`--param_<name>=<value>`**

[パラメータ付きクエリ](#cli-queries-with-parameters)のパラメータの代入値。

**`-q [ --query ] <query>`**

バッチモードで実行するクエリ。複数回指定できます（`--query "SELECT 1" --query "SELECT 2"`）または、セミコロン区切りの複数クエリを1回で指定できます（`--query "SELECT 1; SELECT 2;"`）。後者の場合、フォーマットが`VALUES`以外の`INSERT`クエリは空行で区切る必要があります。

単一のクエリもパラメータなしで指定できます：
```bash
$ clickhouse-client "SELECT 1"
1
```

`--queries-file`と一緒に使用することはできません。

**`--queries-file <path-to-file>`**

クエリを含むファイルへのパス。`--queries-file`は複数回指定できます（例：`--queries-file queries1.sql --queries-file queries2.sql`）。

`--query`と一緒に使用することはできません。

**`-m [ --multiline ]`**

指定された場合、マルチラインクエリを許可します（Enterでクエリを送信しない）。クエリはセミコロンで終了したときにのみ送信されます。

### クエリ設定 {#command-line-options-query-settings}

クエリ設定は、クライアント内でコマンドラインオプションとして指定できます。例：
```bash
$ clickhouse-client --max_threads 1
```

設定のリストについては[設定](../operations/settings/settings.md)を参照してください。

### フォーマットオプション {#command-line-options-formatting}

**`-f [ --format ] <format>`**

結果を出力するために指定された形式を使用します。

サポートされている形式のリストについては[入力および出力データの形式](formats.md)を参照してください。

デフォルト値：TabSeparated

**`--pager <command>`**

すべての出力をこのコマンドにパイプします。一般的には`less`（例：広い結果セットを表示するために`less -S`）あるいは同様のものです。

**`-E [ --vertical ]`**

結果を出力するために[垂直形式](../interfaces/formats.md#vertical)を使用します。これは`–-format Vertical`と同じです。この形式では、各値が別の行に印刷され、広いテーブルを表示するときに便利です。

### 実行の詳細 {#command-line-options-execution-details}

**`--enable-progress-table-toggle`**

進捗テーブルの切り替えを有効にします（制御キーを押すことで）。進捗テーブル印刷が有効になっているインタラクティブモードでのみ適用されます。

デフォルト値：有効

**`--hardware-utilization`**

進行状況バーにハードウェア使用情報を印刷します。

**`--memory-usage`**

指定された場合、非インタラクティブモードで`stderr`にメモリ使用量を印刷します。

可能な値：
- `none` - メモリ使用量を印刷しない
- `default` - バイト数を印刷する
- `readable` - 人間が読みやすい形式でメモリ使用量を印刷する

**`--print-profile-events`**

`ProfileEvents`パケットを印刷します。

**`--progress`**

クエリ実行の進行状況を印刷します。

可能な値：
- `tty|on|1|true|yes` - インタラクティブモードで端末に出力
- `err` - 非インタラクティブモードで`stderr`に出力
- `off|0|false|no` - 進捗印刷を無効にする

デフォルト値：インタラクティブモードでは`tty`、非インタラクティブモード（バッチ）では`off`。

**`--progress-table`**

クエリ実行中に変化するメトリックを持つ進捗テーブルを印刷します。

可能な値：
- `tty|on|1|true|yes` - インタラクティブモードで端末に出力
- `err` - 非インタラクティブモードで`stderr`に出力
- `off|0|false|no` - 進捗テーブルを無効にする

デフォルト値：インタラクティブモードでは`tty`、非インタラクティブモード（バッチ）では`off`。

**`--stacktrace`**

例外のスタックトレースを印刷します。

**`-t [ --time ]`**

ベンチマーク用に、非インタラクティブモードでクエリ実行時間を`stderr`に印刷します。
