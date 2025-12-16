---
description: 'ClickHouse コマンドラインクライアントインターフェースのドキュメント'
sidebar_label: 'ClickHouse クライアント'
sidebar_position: 17
slug: /interfaces/cli
title: 'ClickHouse クライアント'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickHouse は、ClickHouse サーバーに対して直接 SQL クエリを実行するためのネイティブなコマンドラインクライアントを提供します。
このクライアントは、対話型モード（その場でのクエリ実行）とバッチモード（スクリプトや自動化向け）の両方をサポートします。
クエリ結果はターミナルに表示することも、ファイルにエクスポートすることもでき、Pretty、CSV、JSON などを含むすべての ClickHouse 出力[フォーマット](formats.md)に対応しています。

このクライアントでは、プログレスバーや読み取られた行数、処理されたバイト数、クエリの実行時間などを通じて、クエリの実行状況をリアルタイムに確認できます。
[コマンドラインオプション](#command-line-options)と[設定ファイル](#configuration_files)の両方をサポートします。

## インストール {#install}

ClickHouse をダウンロードするには、次のコマンドを実行します。

```bash
curl https://clickhouse.com/ | sh
```

これもインストールするには、次を実行してください：

```bash
sudo ./clickhouse install
```

他のインストール方法については、[Install ClickHouse](../getting-started/install/install.mdx) を参照してください。

クライアントとサーバーのバージョンが異なっていても互換性はありますが、古いクライアントでは一部の機能が利用できない場合があります。クライアントとサーバーには同じバージョンを使用することを推奨します。

## 実行 {#run}

:::note
ClickHouse をダウンロードしただけでインストールしていない場合は、`clickhouse-client` ではなく `./clickhouse client` を使用してください。
:::

ClickHouse サーバーに接続するには、次を実行してください。

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

必要に応じて、以下の追加接続設定を指定します:

| Option                           | Description                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `--port <port>`                  | ClickHouse サーバーが接続を受け付けるポートです。デフォルトのポートは 9440（TLS）と 9000（TLS なし）です。ClickHouse Client は HTTP(S) ではなくネイティブプロトコルを使用する点に注意してください。 |
| `-s [ --secure ]`                | TLS を使用するかどうか（通常は自動検出されます）。                                                                                                   |
| `-u [ --user ] <username>`       | 接続に使用するデータベースユーザーです。デフォルトでは `default` ユーザーとして接続します。                                                                           |
| `--password <password>`          | データベースユーザーのパスワードです。接続に使用するパスワードは、構成ファイル内で指定することもできます。パスワードを指定しない場合、クライアントが入力を求めます。                                            |
| `-c [ --config ] <path-to-file>` | ClickHouse Client の構成ファイルのパスです。構成ファイルがデフォルトのいずれかの場所にない場合に指定します。詳しくは [Configuration Files](#configuration_files) を参照してください。    |
| `--connection <name>`            | [configuration file](#connection-credentials) で事前定義された接続設定の名前です。                                                              |

コマンドラインオプションの完全な一覧については、[Command Line Options](#command-line-options) を参照してください。

### ClickHouse Cloud への接続 {#connecting-cloud}

ClickHouse Cloud サービスの詳細は、ClickHouse Cloud コンソールで確認できます。接続したいサービスを選択し、**Connect** をクリックします。

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloud サービスの Connect ボタン"
/>

<br/>

<br/>

**Native** を選択すると、詳細情報が表示され、例として `clickhouse-client` コマンドが示されます。

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse Cloud のネイティブ TCP 接続の詳細"
/>

### 接続情報を設定ファイルに保存する {#connection-credentials}

1台以上のClickHouseサーバーに対する接続情報を[設定ファイル](#configuration_files)に保存できます。

フォーマットは次のようになります。

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

[設定ファイルに関するセクション](#configuration_files)を参照してください。

:::note
クエリ構文に焦点を当てるため、以降の例では接続情報（`--host`、`--port` など）を省略しています。実際にコマンドを使用する際は、必ずこれらを指定してください。
:::

## インタラクティブモード {#interactive-mode}

### インタラクティブモードを使用する {#using-interactive-mode}

ClickHouse をインタラクティブモードで実行するには、次のコマンドを実行します。

```bash
clickhouse-client
```

これで Read-Eval-Print Loop (REPL) が開き、対話的に SQL クエリを入力できるようになります。
接続が確立されると、クエリを入力するためのプロンプトが表示されます。

```bash
ClickHouse client version 25.x.x.x
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 25.x.x.x

hostname :)
```

対話モードでは、デフォルトの出力フォーマットは `PrettyCompact` です。
クエリの `FORMAT` 句でフォーマットを変更するか、コマンドラインオプション `--format` を指定して変更できます。
`Vertical` フォーマットを使うには、`--vertical` を利用するか、クエリの末尾に `\G` を指定します。
このフォーマットでは、それぞれの値が別々の行に出力されるため、横に長いテーブルを扱う際に便利です。

対話モードでは、`Enter` を押すと入力した内容がそのまま実行されます。
クエリの末尾にセミコロンは必須ではありません。

クライアントは `-m, --multiline` パラメータを付けて起動できます。
複数行のクエリを入力するには、改行の前にバックスラッシュ `\` を入力します。
`Enter` を押した後、クエリの次の行の入力が求められます。
クエリを実行するには、末尾にセミコロンを付けて `Enter` を押します。

ClickHouse Client は `replxx`（`readline` に類似）をベースとしているため、使い慣れたキーボードショートカットが利用でき、履歴も保持されます。
履歴はデフォルトで `~/.clickhouse-client-history` に書き込まれます。

クライアントを終了するには、`Ctrl+D` を押すか、クエリの代わりに次のいずれかを入力します。

* `exit` または `exit;`
* `quit` または `quit;`
* `q`、`Q` または `:q`
* `logout` または `logout;`

### クエリ処理情報 {#processing-info}

クエリを処理するとき、クライアントは次の情報を表示します。

1.  進捗状況。デフォルトでは 1 秒間に最大 10 回まで更新されます。
    短時間で完了するクエリの場合、進捗が表示される前に処理が完了することがあります。
2.  デバッグ用の、パース後に整形されたクエリ。
3.  指定されたフォーマットでの結果。
4.  結果の行数、経過時間、およびクエリ処理の平均速度。
    ここでのデータ量はすべて非圧縮データに対するものです。

長時間実行中のクエリは、`Ctrl+C` を押すことでキャンセルできます。
ただし、サーバー側でリクエストが中断されるまで、しばらく待つ必要があります。
処理の特定の段階では、クエリをキャンセルすることはできません。
待たずに 2 回目の `Ctrl+C` を押した場合、クライアントは終了します。

ClickHouse Client では、クエリ用に外部データ（外部一時テーブル）を渡すことができます。
詳細については、「[クエリ処理用の外部データ](../engines/table-engines/special/external-data.md)」のセクションを参照してください。

### エイリアス {#cli_aliases}

REPL 内では次のエイリアスを使用できます：

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 直前のクエリを再実行する

### キーボードショートカット {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 現在のクエリをエディタで開きます。使用するエディタは環境変数 `EDITOR` で指定できます。デフォルトでは `vim` が使用されます。
- `Alt (Option) + #` - 行をコメントアウトします。
- `Ctrl + r` - あいまい検索で履歴を検索します。

利用可能なすべてのキーボードショートカットの一覧は [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262) にあります。

:::tip
macOS で Meta キー (Option) を正しく動作させるには:

iTerm2: Preferences -> Profile -> Keys -> Left Option key に移動し、Esc+ をクリックします。
:::

## バッチモード {#batch-mode}

### バッチモードの使用 {#using-batch-mode}

ClickHouse Client を対話的に使用する代わりに、バッチモードで実行できます。
バッチモードでは、ClickHouse は単一のクエリを実行するとすぐに終了し、対話的なプロンプトやループはありません。

次のように単一のクエリを指定できます：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

`--query` コマンドラインオプションを利用することもできます：

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

クエリは `stdin` からも指定できます:

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

テーブル `messages` が存在することを前提として、コマンドラインからデータを挿入することもできます。

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query` が指定されている場合、入力された内容は改行文字の後にリクエストへ追加されます。

### リモート ClickHouse サービスに CSV ファイルを挿入する {#cloud-example}

この例では、サンプルデータセットの CSV ファイル `cell_towers.csv` を、`default` データベース内の既存のテーブル `cell_towers` に挿入します。

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

### コマンドラインからデータを挿入する例 {#more-examples}

コマンドラインからデータを挿入する方法はいくつかあります。
以下の例では、バッチモードを使用して、2行の CSV データを ClickHouse テーブルに挿入します。

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

以下の例では、`cat <<_EOF` でヒアドキュメントを開始し、再度 `_EOF` が現れるまでのすべての内容を読み取って出力します。

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

次の例では、`cat` を使用して file.csv の内容を標準出力に書き出し、その内容をパイプで `clickhouse-client` の入力として渡します。

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

バッチモードでは、デフォルトのデータ[フォーマット](formats.md)は `TabSeparated` です。
上の例に示したように、クエリの `FORMAT` 句でフォーマットを指定できます。

## パラメーター付きクエリ {#cli-queries-with-parameters}

クエリ内でパラメーターを指定し、コマンドラインオプションを使って値を渡すことができます。
これにより、クライアント側で特定の動的な値を埋め込んだクエリ文字列を組み立てる必要がなくなります。
例えば、次のようにします。

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

また、[インタラクティブ セッション](#interactive-mode)内からパラメータを設定することもできます。

```text
$ clickhouse-client
ClickHouse client version 25.X.X.XXX (official build).

#highlight-next-line
:) SET param_parName='[1, 2]';

SET param_parName = '[1, 2]'

Query id: 7ac1f84e-e89a-4eeb-a4bb-d24b8f9fd977

Ok.

0 rows in set. Elapsed: 0.000 sec.

#highlight-next-line
:) SELECT {parName:Array(UInt16)}

SELECT {parName:Array(UInt16)}

Query id: 0358a729-7bbe-4191-bb48-29b063c548a7

   ┌─_CAST([1, 2]⋯y(UInt16)')─┐
1. │ [1,2]                    │
   └──────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```

### クエリ構文 {#cli-queries-with-parameters-syntax}

クエリ内で、コマンドライン引数で指定したい値は、次の形式で中かっこで囲んで記述します。

```sql
{<name>:<data type>}
```

| Parameter   | Description                                                                                                                                                                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | プレースホルダー用の識別子。対応するコマンドラインオプションは `--param_<name>=value` です。                                                                                                                                                                                                                                                          |
| `data type` | パラメータの[データ型](../sql-reference/data-types/index.md)。<br /><br />たとえば、`(integer, ('string', integer))` のようなデータ構造は、`Tuple(UInt8, Tuple(String, UInt8))` 型を持つことができます（他の[整数](../sql-reference/data-types/int-uint.md)型も使用できます）。<br /><br />テーブル名、データベース名、カラム名をパラメータとして渡すことも可能であり、その場合はデータ型として `Identifier` を使用する必要があります。 |

### 使用例 {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```

## AI を活用した SQL 生成 {#ai-sql-generation}

ClickHouse クライアントには、自然言語による説明から SQL クエリを生成するための AI 支援機能が組み込まれています。この機能により、ユーザーは高度な SQL の知識がなくても複雑なクエリを作成できます。

`OPENAI_API_KEY` または `ANTHROPIC_API_KEY` のいずれかの環境変数が設定されていれば、AI 支援機能は追加の設定なしでそのまま利用できます。より高度な設定については、[Configuration](#ai-sql-generation-configuration) セクションを参照してください。

### 使用方法 {#ai-sql-generation-usage}

AI SQL 生成機能を利用するには、自然言語のクエリの先頭に `??` を付けてください：

```bash
:) ?? show all users who made purchases in the last 30 days
```

AI は次のことを行います：

1. データベーススキーマを自動的に解析します
2. 把握したテーブルやカラムに基づいて、適切な SQL を生成します
3. 生成したクエリを直ちに実行します

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

AI による SQL 生成を行うには、ClickHouse Client の設定ファイルで AI プロバイダーを構成する必要があります。OpenAI、Anthropic、または OpenAI 互換の API サービスを使用できます。

#### 環境変数によるフォールバック {#ai-sql-generation-fallback}

設定ファイルで AI 設定が指定されていない場合、ClickHouse Client は自動的に環境変数の利用を試みます。

1. まず `OPENAI_API_KEY` 環境変数を確認します
2. 見つからない場合は `ANTHROPIC_API_KEY` 環境変数を確認します
3. どちらも見つからない場合、AI 機能は無効になります

これにより、設定ファイルなしで迅速にセットアップできます。

```bash
# Using OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client

# Using Anthropic
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```

#### 設定ファイル {#ai-sql-generation-configuration-file}

AI 設定をより細かく制御するには、次の場所にある ClickHouse Client の設定ファイルで設定します:

* `$XDG_CONFIG_HOME/clickhouse/config.xml`（または `XDG_CONFIG_HOME` が設定されていない場合は `~/.config/clickhouse/config.xml`）（XML 形式）
* `$XDG_CONFIG_HOME/clickhouse/config.yaml`（または `XDG_CONFIG_HOME` が設定されていない場合は `~/.config/clickhouse/config.yaml`）（YAML 形式）
* `~/.clickhouse-client/config.xml`（XML 形式、旧来の場所）
* `~/.clickhouse-client/config.yaml`（YAML 形式、旧来の場所）
* または `--config-file` で任意のパスを指定

<Tabs>
  <TabItem value="xml" label="XML" default>
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
  </TabItem>

  <TabItem value="yaml" label="YAML">
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
  </TabItem>
</Tabs>

<br />

**OpenAI 互換 API（例: OpenRouter）の使用:**

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

### パラメーター {#ai-sql-generation-parameters}

<details>
<summary>必須パラメーター</summary>

- `api_key` - AI サービス用の API キー。環境変数で設定している場合は省略可能:
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - 注意: 設定ファイル内の API キーが環境変数より優先されます
- `provider` - AI プロバイダー: `openai` または `anthropic`
  - 省略した場合は、利用可能な環境変数に基づいて自動的に選択されます

</details>

<details>
<summary>モデル設定</summary>

- `model` - 使用するモデル (デフォルト: プロバイダーごとのデフォルト値)
  - OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` など
  - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` など
  - OpenRouter: `anthropic/claude-3.5-sonnet` のようなモデル名を使用

</details>

<details>
<summary>接続設定</summary>

- `base_url` - OpenAI 互換サービス向けのカスタム API エンドポイント (任意)
- `timeout_seconds` - リクエストのタイムアウト秒数 (デフォルト: `30`)

</details>

<details>
<summary>スキーマ探索</summary>

- `enable_schema_access` - AI にデータベーススキーマを探索させるかどうか (デフォルト: `true`)
- `max_steps` - スキーマ探索でツールを呼び出すステップ数の上限 (デフォルト: `10`)

</details>

<details>
<summary>生成パラメーター</summary>

- `temperature` - 出力のランダム性を制御します。0.0 = 決定的、1.0 = 創造的 (デフォルト: `0.0`)
- `max_tokens` - レスポンスの最大長 (トークン数) (デフォルト: `1000`)
- `system_prompt` - AI へのカスタム指示 (任意)

</details>

### 仕組み {#ai-sql-generation-how-it-works}

AI SQL ジェネレーターは、複数のステップで処理を行います。

<VerticalStepper headerLevel="list">

1. **スキーマ検出**

AI は組み込みツールを使ってデータベースを探索します。
- 利用可能なデータベースを一覧表示します
- 関連するデータベース内のテーブルを検出します
- `CREATE TABLE` ステートメントを用いてテーブル構造を確認します

2. **クエリ生成**

検出したスキーマに基づいて、AI が次のような SQL を生成します：
- 自然言語による意図に合致する
- 正しいテーブル名とカラム名を使用する
- 適切な結合や集約を適用する

3. **実行**

生成された SQL は自動的に実行され、その結果が表示されます。

</VerticalStepper>

### 制限事項 {#ai-sql-generation-limitations}

- 有効なインターネット接続が必要
- API の利用には、AI プロバイダーによるレート制限があり、料金が発生する
- 複雑なクエリでは、複数回の調整・改善が必要になる場合がある
- AI はスキーマ情報への読み取り専用アクセスのみを持ち、実データにはアクセスできない

### セキュリティ {#ai-sql-generation-security}

- API キーが ClickHouse サーバーに送信されることはありません
- AI はスキーマ情報（テーブル／カラム名と型）のみを参照し、実データにはアクセスしません
- 生成されるすべてのクエリは、既存のデータベース権限に従います

## 接続文字列 {#connection_string}

### 使用方法 {#connection-string-usage}

ClickHouse Client は、[MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) と同様の接続文字列を使用して ClickHouse サーバーに接続する方法にも対応しています。構文は次のとおりです。

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| コンポーネント（すべて任意）     | 説明                                                                                                  | デフォルト            |
| ------------------ | --------------------------------------------------------------------------------------------------- | ---------------- |
| `user`             | データベースのユーザー名。                                                                                       | `default`        |
| `password`         | データベースユーザーのパスワード。`:` が指定されていてパスワードが空の場合、クライアントはユーザーのパスワードの入力を求めます。                                  | -                |
| `hosts_and_ports`  | ホストおよび任意のポートのリスト `host[:port] [, host:[port]], ...`。                                                | `localhost:9000` |
| `database`         | データベース名。                                                                                            | `default`        |
| `query_parameters` | キーと値のペアのリスト `param1=value1[,&param2=value2], ...`。一部のパラメータでは値を指定する必要はありません。パラメータ名と値は大文字・小文字が区別されます。 | -                |

### 注意事項 {#connection-string-notes}

ユーザー名、パスワード、またはデータベースを接続文字列で指定している場合、`--user`、`--password`、`--database` で再度指定することはできません（その逆も同様です）。

host コンポーネントには、ホスト名または IPv4 / IPv6 アドレスを指定できます。
IPv6 アドレスは角括弧で囲む必要があります。

```text
clickhouse://[2001:db8::1234]
```

接続文字列には複数のホストを含めることができます。
ClickHouse クライアントは、これらのホストに左から右の順番で接続を試行します。
一度接続が確立されると、残りのホストへの接続は試行されません。

接続文字列は `clickHouse-client` の最初の引数として指定する必要があります。
接続文字列は、`--host` と `--port` を除く任意個数の他の [コマンドラインオプション](#command-line-options) と組み合わせて使用できます。

`query_parameters` には次のキーを指定できます:

| Key                | Description                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| `secure` (または `s`) | 指定すると、クライアントは TLS を利用した安全な接続でサーバーに接続します。詳細は [コマンドラインオプション](#command-line-options) の `--secure` を参照してください。 |

**パーセントエンコード**

以下のパラメータに含まれる US ASCII 以外の文字、スペース、および特殊文字は、[パーセントエンコード](https://en.wikipedia.org/wiki/URL_encoding)する必要があります:

* `user`
* `password`
* `hosts`
* `database`
* `query parameters`

### 例 {#connection_string_examples}

`localhost` のポート 9000 に接続し、クエリ `SELECT 1` を実行します。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

ユーザー `john`、パスワード `secret` を使用し、ホスト `127.0.0.1`、ポート `9000` で `localhost` に接続します

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

`default` ユーザーとして、IPv6 アドレス `[::1]` を持つホスト `localhost` に、ポート `9000` で接続します。

```bash
clickhouse-client clickhouse://[::1]:9000
```

マルチラインモードで、ポート 9000 の `localhost` に接続します。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

ユーザー `default` として、ポート 9000 で `localhost` に接続します。

```bash
clickhouse-client clickhouse://default@localhost:9000

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

ポート 9000 で `localhost` に接続し、デフォルトのデータベースとして `my_database` を使用します。

```bash
clickhouse-client clickhouse://localhost:9000/my_database

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

ポート 9000 の `localhost` に接続し、接続文字列で指定された `my_database` をデフォルトデータベースとして使用し、短縮パラメータ `s` によるセキュア接続を行います。

```bash
clickhouse-client clickhouse://localhost/my_database?s

# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

デフォルトのホスト、ポート、ユーザー、データベースを使用して接続します。

```bash
clickhouse-client clickhouse:
```

デフォルトのホストのデフォルトポートに、ユーザー `my_user` としてパスワードなしで接続します。

```bash
clickhouse-client clickhouse://my_user@

# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

メールアドレスをユーザー名として使用して `localhost` に接続します。`@` 記号は `%40` にパーセントエンコードされます。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

2つのホストのいずれか（`192.168.1.15` または `192.168.1.25`）に接続します。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## クエリ ID の形式 {#query-id-format}

インタラクティブモードでは、ClickHouse Client は各クエリに対してクエリ ID を表示します。既定では、ID は次のような形式です。

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

設定ファイル内の `query_id_formats` タグでカスタムフォーマットを指定できます。フォーマット文字列内の `{query_id}` プレースホルダーはクエリ ID に置き換えられます。タグ内には複数のフォーマット文字列を指定できます。
この機能を利用すると、クエリのプロファイリングを容易にする URL を生成できます。

**例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

上記の設定では、クエリ ID は次の形式で表示されます。

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```

## 設定ファイル {#configuration_files}

ClickHouse Client は、次のうち最初に存在するファイルを使用します。

- `-c [ -C, --config, --config-file ]` パラメータで指定されたファイル
- `./clickhouse-client.[xml|yaml|yml]`
- `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]`（`XDG_CONFIG_HOME` が設定されていない場合は `~/.config/clickhouse/config.[xml|yaml|yml]`）
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

ClickHouse リポジトリにあるサンプル設定ファイルを参照してください：[`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

<Tabs>
  <TabItem value="xml" label="XML" default>
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
  </TabItem>
  <TabItem value="yaml" label="YAML">
    ```yaml
    user: username
    password: 'password'
    secure: true
    openSSL:
      client:
        caConfig: '/etc/ssl/cert.pem'
    ```
  </TabItem>
</Tabs>

## 環境変数オプション {#environment-variable-options}

ユーザー名、パスワード、ホストは、環境変数 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_HOST` で指定できます。
コマンドライン引数 `--user`、`--password`、`--host`、または（指定されている場合）[接続文字列](#connection_string) は、環境変数による設定よりも優先されます。

## コマンドラインオプション {#command-line-options}

すべてのコマンドラインオプションは、コマンドラインで直接指定することも、[設定ファイル](#configuration_files)で既定値として指定することもできます。

### 一般オプション {#command-line-options-general}

| Option                                              | Description                                                                                                                        | Default                      |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| `-c [ -C, --config, --config-file ] <path-to-file>` | クライアント設定ファイルの場所を指定します。設定ファイルがデフォルトの検索パス上にない場合に使用します。詳細は [Configuration Files](#configuration_files) を参照してください。 | -                            |
| `--help`                                            | 使用方法の概要を表示して終了します。`--verbose` と組み合わせると、クエリ設定を含む利用可能なすべてのオプションを表示します。                  | -                            |
| `--history_file <path-to-file>`                     | コマンド履歴を保存するファイルのパスを指定します。                                                                                     | -                            |
| `--history_max_entries`                             | 履歴ファイルに保存するエントリの最大数を指定します。                                                                                     | `1000000` (100万)        |
| `--prompt <prompt>`                                 | カスタムプロンプトを指定します。                                                                                                           | サーバーの `display_name` |
| `--verbose`                                         | 出力の詳細度を上げます。                                                                                                         | -                            |
| `-V [ --version ]`                                  | バージョンを表示して終了します。                                                                                                            | -                            |

### 接続オプション {#command-line-options-connection}

| Option                           | Description                                                                                                                                                                                                                                                                                                                        | Default                                                                                                          |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `--connection <name>`            | 設定ファイルで事前設定されている接続設定の名前。[Connection credentials](#connection-credentials) を参照してください。                                                                                                                                                                                                                | -                                                                                                                |
| `-d [ --database ] <database>`   | この接続でデフォルトとして使用するデータベースを選択します。                                                                                                                                                                                                                                                                           | サーバー設定で現在有効なデータベース（デフォルトでは `default`）                                                 |
| `-h [ --host ] <host>`           | 接続先の ClickHouse サーバーのホスト名。ホスト名、IPv4 アドレス、または IPv6 アドレスを指定できます。複数のホストを指定する場合は、このオプションを複数回指定します。                                                                                                                                                                    | `localhost`                                                                                                      |
| `--jwt <value>`                  | 認証に JSON Web Token (JWT) を使用します。<br/><br/>JWT によるサーバー側の認可は ClickHouse Cloud でのみ利用可能です。                                                                                                                                                                                                                | -                                                                                                                |
| `--no-warnings`                  | クライアントがサーバーに接続するときに `system.warnings` からの警告を表示しないようにします。                                                                                                                                                                                                                                         | -                                                                                                                |
| `--no-server-client-version-message`                  | クライアントがサーバーに接続するときに、サーバーとクライアントのバージョン不一致メッセージを表示しないようにします。                                                                                                                                                                                                                | -                                                                                                                |
| `--password <password>`          | データベースユーザーのパスワード。接続用パスワードは設定ファイルでも指定できます。パスワードを指定しない場合、クライアントが入力を求めます。                                                                                                                                                                                         | -                                                                                                                |
| `--port <port>`                  | サーバーが接続を受け付けるポート番号。デフォルトのポートは 9440 (TLS) と 9000 (非 TLS) です。<br/><br/>注: クライアントは HTTP(S) ではなくネイティブプロトコルを使用します。                                                                                                                                                         | `--secure` が指定されている場合は `9440`、それ以外の場合は `9000`。ホスト名が `.clickhouse.cloud` で終わる場合は常に `9440` がデフォルトになります。 |
| `-s [ --secure ]`                | TLS を使用するかどうか。<br/><br/>ポート 9440（デフォルトのセキュアポート）または ClickHouse Cloud に接続する場合は自動的に有効になります。<br/><br/>[設定ファイル](#configuration_files) で CA 証明書を設定する必要がある場合があります。利用可能な設定項目は [サーバー側の TLS 設定](../operations/server-configuration-parameters/settings.md#openssl) と同じです。 | ポート 9440 または ClickHouse Cloud に接続する場合に自動的に有効化                                               |
| `--ssh-key-file <path-to-file>`  | サーバーに対して認証を行うための SSH 秘密鍵を格納したファイル。                                                                                                                                                                                                                                                                        | -                                                                                                                |
| `--ssh-key-passphrase <value>`   | `--ssh-key-file` で指定した SSH 秘密鍵のパスフレーズ。                                                                                                                                                                                                                                                                             | -                                                                                                                |
| `-u [ --user ] <username>`       | 接続時に使用するデータベースユーザー。                                                                                                                                                                                                                                                                                              | `default`                                                                                                        |

:::note
`--host`、`--port`、`--user`、`--password` オプションの代わりに、クライアントは [connection strings](#connection_string)（接続文字列）もサポートしています。
:::

### クエリオプション {#command-line-options-query}

| Option                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--param_<name>=<value>`        | [パラメータ付きクエリ](#cli-queries-with-parameters) のパラメータ用の置換値。                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `-q [ --query ] <query>`        | バッチモードで実行するクエリ。複数回指定できます（`--query "SELECT 1" --query "SELECT 2"`）、またはセミコロン区切りの複数クエリを 1 回で指定することもできます（`--query "SELECT 1; SELECT 2;"`）。後者の場合、フォーマットが `VALUES` 以外の `INSERT` クエリは空行で区切る必要があります。<br/><br/>単一のクエリは、パラメータ指定なしでも指定できます: `clickhouse-client "SELECT 1"` <br/><br/>`--queries-file` と同時には使用できません。                               |
| `--queries-file <path-to-file>` | クエリを含むファイルへのパス。`--queries-file` は複数回指定できます（例: `--queries-file queries1.sql --queries-file queries2.sql`）。<br/><br/>`--query` と同時には使用できません。                                                                                                                                                                                                                                                                                            |
| `-m [ --multiline ]`            | 指定された場合、複数行のクエリを許可します（Enter キーを押してもクエリを送信しません）。クエリは末尾がセミコロンで終わったときのみ送信されます。                                                                                                                                                                                                                                                                                                                                                  |

### クエリ設定 {#command-line-options-query-settings}

クエリ設定は、クライアントのコマンドラインオプションとして指定できます。たとえば次のようにします。

```bash
$ clickhouse-client --max_threads 1
```

設定の一覧は [Settings](../operations/settings/settings.md) を参照してください。

### フォーマットオプション {#command-line-options-formatting}

| オプション                | 説明                                                                                                                                                                                                                         | デフォルト      |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| `-f [ --format ] <format>` | 結果を指定した形式で出力します。<br/><br/>サポートされている形式の一覧については、[入力および出力データのフォーマット](formats.md) を参照してください。                                                                        | `TabSeparated` |
| `--pager <command>`       | すべての出力をこのコマンドにパイプします。通常は `less`（例: 幅の広い結果セットを表示するための `less -S`）などを指定します。                                                                                                   | -              |
| `-E [ --vertical ]`       | 結果の出力に [Vertical フォーマット](/interfaces/formats/Vertical) を使用します。これは `–-format Vertical` と同じです。このフォーマットでは、各値が個別の行に出力されるため、幅の広いテーブルを表示する際に便利です。               | -              |

### 実行の詳細 {#command-line-options-execution-details}

| Option                            | Description                                                                                                                                                                                                                                                                                                         | Default                                                             |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `--enable-progress-table-toggle`  | Ctrl+Space キーを押すことで進捗テーブルの表示／非表示を切り替えられるようにします。進捗テーブルの出力が有効なインタラクティブモードでのみ有効です。                                                                                                                                                                      | `enabled`                                                           |
| `--hardware-utilization`          | 進捗バーにハードウェア使用状況（利用率）の情報を出力します。                                                                                                                                                                                                                                                         | -                                                                   |
| `--memory-usage`                  | 指定した場合、非インタラクティブモードでメモリ使用量を `stderr` に出力します。<br/><br/>指定可能な値: <br/>• `none` - メモリ使用量を出力しない <br/>• `default` - バイト数を出力する <br/>• `readable` - メモリ使用量を人間が読みやすい形式で出力する                                                       | -                                                                   |
| `--print-profile-events`          | `ProfileEvents` パケットを出力します。                                                                                                                                                                                                                                                                              | -                                                                   |
| `--progress`                      | クエリ実行の進捗を出力します。<br/><br/>指定可能な値: <br/>• `tty\|on\|1\|true\|yes` - インタラクティブモードで端末に出力する <br/>• `err` - 非インタラクティブモードで `stderr` に出力する <br/>• `off\|0\|false\|no` - 進捗の出力を無効にする                                                       | インタラクティブモードでは `tty`、非インタラクティブ（バッチ）モードでは `off` |
| `--progress-table`                | クエリ実行中に変化するメトリクスを含む進捗テーブルを出力します。<br/><br/>指定可能な値: <br/>• `tty\|on\|1\|true\|yes` - インタラクティブモードで端末に出力する <br/>• `err` - 非インタラクティブモードで `stderr` に出力する <br/>• `off\|0\|false\|no` - 進捗テーブルの出力を無効にする                  | インタラクティブモードでは `tty`、非インタラクティブ（バッチ）モードでは `off` |
| `--stacktrace`                    | 例外のスタックトレースを出力します。                                                                                                                                                                                                                                                                                 | -                                                                   |
| `-t [ --time ]`                   | 非インタラクティブモードでクエリ実行時間を `stderr` に出力します（ベンチマーク用）。                                                                                                                                                                                                                                | -                                                                   |