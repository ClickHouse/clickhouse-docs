---
description: 'ClickHouse コマンドライン クライアント インターフェイスに関するドキュメント'
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

ClickHouse は、ClickHouse サーバーに対して直接 SQL クエリを実行するためのネイティブなコマンドラインクライアントを提供しています。
このクライアントは、インタラクティブモード（その場でのクエリ実行）とバッチモード（スクリプトや自動化向け）の両方をサポートします。
クエリ結果はターミナルに表示することも、ファイルにエクスポートすることもでき、Pretty、CSV、JSON などを含む、すべての ClickHouse 出力[フォーマット](formats.md)に対応しています。

このクライアントは、プログレスバーの表示に加え、読み取った行数、処理したバイト数、クエリ実行時間などをリアルタイムに表示し、クエリ実行状況をフィードバックします。
また、[コマンドラインオプション](#command-line-options)と[設定ファイル](#configuration_files)の両方に対応しています。


## インストール {#install}

ClickHouse をダウンロードするには、次のコマンドを実行します:

```bash
curl https://clickhouse.com/ | sh
```

それもインストールするには、次のコマンドを実行します。

```bash
sudo ./clickhouse install
```

その他のインストールオプションについては、[Install ClickHouse](../getting-started/install/install.mdx) を参照してください。

クライアントとサーバーのバージョンが異なっていても互換性はありますが、一部の機能は古いクライアントでは利用できない場合があります。クライアントとサーバーには同一バージョンを使用することを推奨します。


## 実行 {#run}

:::note
ClickHouse をダウンロードしただけでインストールしていない場合は、`clickhouse-client` の代わりに `./clickhouse client` を使用してください。
:::

ClickHouse サーバーに接続するには、次のコマンドを実行します。

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

必要に応じて、追加の接続パラメータを指定します:

| Option                           | Description                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `--port <port>`                  | ClickHouse サーバーが接続を受け付けるポートです。デフォルトのポートは 9440 (TLS) と 9000 (非 TLS) です。ClickHouse Client は HTTP(S) ではなくネイティブプロトコルを使用する点に注意してください。 |
| `-s [ --secure ]`                | TLS を使用するかどうか (通常は自動検出されます)。                                                                                                     |
| `-u [ --user ] <username>`       | 接続に使用するデータベースユーザーです。デフォルトでは `default` ユーザーとして接続します。                                                                              |
| `--password <password>`          | データベースユーザーのパスワードです。接続に使用するパスワードは設定ファイル内で指定することもできます。パスワードを指定しない場合、クライアントが入力を求めます。                                                |
| `-c [ --config ] <path-to-file>` | ClickHouse Client 用の設定ファイルの場所です。デフォルトの場所以外にある場合に指定します。[Configuration Files](#configuration_files) を参照してください。                     |
| `--connection <name>`            | [configuration file](#connection-credentials) で事前定義された接続設定の名前です。                                                                 |

コマンドラインオプションの全一覧については、[Command Line Options](#command-line-options) を参照してください。


### ClickHouse Cloud への接続 {#connecting-cloud}

ClickHouse Cloud サービスの接続情報は、ClickHouse Cloud コンソールで確認できます。接続したいサービスを選択し、**Connect** をクリックします。

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloud サービスの Connect ボタン"
/>

<br/>

<br/>

**Native** を選択すると、例としての `clickhouse-client` コマンドとともに接続情報が表示されます。

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse Cloud の Native TCP 接続情報"
/>

### 設定ファイルへの接続情報の保存 {#connection-credentials}

1 つまたは複数の ClickHouse サーバーに対する接続情報を[設定ファイル](#configuration_files)に保存できます。

形式は次のとおりです。

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
クエリ構文に焦点を当てるため、以降の例では接続情報（`--host`、`--port` など）を省略しています。実際にコマンドを使用する際は、必ずこれらを追加してください。
:::


## 対話モード {#interactive-mode}

### インタラクティブモードの使用 {#using-interactive-mode}

ClickHouse をインタラクティブモードで実行するには、次のコマンドを実行します:

```bash
clickhouse-client
```

これにより、Read-Eval-Print ループ（REPL）が起動し、SQL クエリを対話的に入力できるようになります。
接続後は、クエリを入力するためのプロンプトが表示されます。

```bash
ClickHouse client version 25.x.x.x
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 25.x.x.x

hostname :)
```

対話モードでは、デフォルトの出力フォーマットは `PrettyCompact` です。
`FORMAT` 句、またはコマンドラインオプション `--format` を指定することでフォーマットを変更できます。
Vertical フォーマットを使用するには、`--vertical` を使用するか、クエリの末尾に `\G` を指定します。
このフォーマットでは、各値が個別の行に出力されるため、列数の多いテーブルに便利です。

対話モードでは、デフォルトでは入力した内容は `Enter` を押すとそのまま実行されます。
クエリの末尾にセミコロンを付ける必要はありません。

クライアントは `-m, --multiline` パラメータを指定して起動できます。
複数行のクエリを入力するには、改行の前にバックスラッシュ `\` を入力します。
`Enter` を押した後、クエリの次の行の入力が求められます。
クエリを実行するには、末尾をセミコロンで終わらせてから `Enter` を押します。

ClickHouse Client は `replxx`（`readline` に似たもの）を基にしているため、慣れ親しんだキーボードショートカットが使用でき、履歴も保持されます。
履歴はデフォルトで `~/.clickhouse-client-history` に書き込まれます。

クライアントを終了するには、`Ctrl+D` を押すか、クエリの代わりに次のいずれかを入力します。

* `exit` または `exit;`
* `quit` または `quit;`
* `q`、`Q` または `:q`
* `logout` または `logout;`


### クエリ処理情報 {#processing-info}

クエリを処理する際、クライアントは次の内容を表示します。

1.  進捗。デフォルトでは 1 秒間に最大 10 回まで更新されます。
    短時間で終了するクエリの場合、進捗が表示される前に処理が完了する可能性があります。
2.  デバッグ用の、パース後に整形されたクエリ。
3.  指定されたフォーマットでの結果。
4.  結果内の行数、経過時間、およびクエリ処理の平均速度。
    すべてのデータ量は非圧縮データ換算です。

長時間実行されているクエリは、`Ctrl+C` を押すことでキャンセルできます。
ただし、サーバー側でリクエストの中止処理が完了するまで、少し待つ必要があります。
特定の段階では、クエリをキャンセルすることはできません。
待たずに 2 回目の `Ctrl+C` を押すと、クライアントは終了します。

ClickHouse Client では、クエリで利用するために外部データ（外部一時テーブル）を渡すことができます。
詳細については、[クエリ処理用の外部データ](../engines/table-engines/special/external-data.md) のセクションを参照してください。

### エイリアス {#cli_aliases}

REPL 内では次のエイリアスを使用できます:

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 直前のクエリを再実行します

### キーボードショートカット {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 現在のクエリをエディタで開きます。使用するエディタは環境変数 `EDITOR` で指定できます。デフォルトでは `vim` が使用されます。
- `Alt (Option) + #` - 行をコメントアウトします。
- `Ctrl + r` - 履歴をあいまい検索します。

利用可能なすべてのキーボードショートカットの一覧は [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262) にあります。

:::tip
macOS で Meta キー (Option) を正しく動作させるには:

iTerm2: Preferences -> Profile -> Keys -> Left Option key に移動し、Esc+ をクリックします。
:::

## バッチモード {#batch-mode}

### バッチモードの使用 {#using-batch-mode}

対話的に ClickHouse Client を使用する代わりに、バッチモードで実行することもできます。
バッチモードでは、ClickHouse は単一のクエリを実行するとすぐに終了し、対話プロンプトやループはありません。

単一のクエリは次のように指定します：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

また、`--query` コマンドラインオプションを使用することもできます：

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

`stdin` 経由でクエリを渡せます:

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

テーブル `messages` が既に存在する前提で、コマンドラインからデータを挿入することもできます。

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query` が指定されている場合、入力は行末の改行の後にリクエストに追加されます。


### リモートの ClickHouse サービスに CSV ファイルを挿入する {#cloud-example}

この例では、サンプルデータセットの CSV ファイル `cell_towers.csv` を、`default` データベースの既存テーブル `cell_towers` に挿入します。

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
以下の例では、バッチモードで 2 行の CSV データを ClickHouse テーブルに挿入します。

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

次の例では、`cat <<_EOF` がヒアドキュメントを開始し、再び `_EOF` が現れるまでのすべてを読み込み、その内容を出力します。

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

次の例では、`cat` を使用して file.csv の内容を標準出力に表示し、その出力をパイプで受け渡して `clickhouse-client` の入力としています。

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

バッチモードでは、デフォルトのデータ[形式](formats.md)は `TabSeparated` です。
上記の例のように、クエリの `FORMAT` 句で形式を指定できます。


## パラメータ付きクエリ {#cli-queries-with-parameters}

クエリ内でパラメータを指定し、コマンドラインオプションを使って値を渡すことができます。
これにより、クライアント側で特定の動的な値を埋め込んだクエリ文字列をフォーマットする必要がなくなります。
例えば次のようにします。

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

[インタラクティブセッション](#interactive-mode)中にパラメータを設定することもできます。

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


### クエリの構文 {#cli-queries-with-parameters-syntax}

クエリ内で、コマンドラインパラメータで埋め込みたい値は、次の形式で波かっこ `{}` で囲んで指定します。

```sql
{<name>:<data type>}
```

| Parameter   | Description                                                                                                                                                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | プレースホルダー識別子。対応するコマンドラインオプションは `--param_<name> = value` です。                                                                                                                                                                                                                                                                      |
| `data type` | パラメータの[データ型](../sql-reference/data-types/index.md)。<br /><br />たとえば、`(integer, ('string', integer))` というデータ構造には、`Tuple(UInt8, Tuple(String, UInt8))` というデータ型を指定できます（他の[integer](../sql-reference/data-types/int-uint.md) 型を使うこともできます）。<br /><br />テーブル名、データベース名、カラム名をパラメータとして渡すことも可能であり、その場合はデータ型として `Identifier` を使用する必要があります。 |


### 例 {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```


## AI を活用した SQL 生成 {#ai-sql-generation}

ClickHouse Client には、自然言語による説明から SQL クエリを生成するための AI 支援機能が組み込まれています。この機能により、ユーザーは深い SQL の知識がなくても複雑なクエリを作成できます。

AI 支援機能は、`OPENAI_API_KEY` または `ANTHROPIC_API_KEY` のいずれかの環境変数が設定されていれば、そのまま利用できます。より高度な設定については、[Configuration](#ai-sql-generation-configuration) セクションを参照してください。

### 使用方法 {#ai-sql-generation-usage}

AI SQL 生成機能を利用するには、自然言語のクエリの前に `??` を付けてください。

```bash
:) ?? show all users who made purchases in the last 30 days
```

AI は次の処理を行います:

1. データベーススキーマを自動的に探索します
2. 検出したテーブルとカラムに基づいて適切な SQL を生成します
3. 生成したクエリをすぐに実行します


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

AI による SQL 生成を利用するには、ClickHouse Client の設定ファイルで AI プロバイダーを設定する必要があります。OpenAI、Anthropic、または OpenAI 互換の API サービスのいずれかを利用できます。

#### 環境変数によるフォールバック {#ai-sql-generation-fallback}

設定ファイルで AI の設定が指定されていない場合、ClickHouse Client は自動的に環境変数の利用を試みます:

1. まず `OPENAI_API_KEY` 環境変数を確認します
2. 見つからない場合は、`ANTHROPIC_API_KEY` 環境変数を確認します
3. どちらも見つからない場合、AI 機能は無効化されます

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

* `$XDG_CONFIG_HOME/clickhouse/config.xml`（`XDG_CONFIG_HOME` が設定されていない場合は `~/.config/clickhouse/config.xml`）（XML 形式）
* `$XDG_CONFIG_HOME/clickhouse/config.yaml`（`XDG_CONFIG_HOME` が設定されていない場合は `~/.config/clickhouse/config.yaml`）（YAML 形式）
* `~/.clickhouse-client/config.xml`（XML 形式、従来の場所）
* `~/.clickhouse-client/config.yaml`（YAML 形式、従来の場所）
* または `--config-file` で任意の場所を指定

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- 必須: API キー（または環境変数で設定） -->
            <api_key>your-api-key-here</api_key>

            <!-- 必須: プロバイダー種別 (openai, anthropic) -->
            <provider>openai</provider>

            <!-- 使用するモデル（デフォルトはプロバイダーにより異なる） -->
            <model>gpt-4o</model>

            <!-- オプション: OpenAI 互換サービス向けのカスタム API エンドポイント -->
            <!-- <base_url>https://openrouter.ai/api</base_url> -->

            <!-- スキーマ探索の設定 -->
            <enable_schema_access>true</enable_schema_access>

            <!-- 生成パラメーター -->
            <temperature>0.0</temperature>
            <max_tokens>1000</max_tokens>
            <timeout_seconds>30</timeout_seconds>
            <max_steps>10</max_steps>

            <!-- オプション: カスタム system prompt -->
            <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
        </ai>
    </config>
    ```
  </TabItem>

  <TabItem value="yaml" label="YAML">
    ```yaml
    ai:
      # 必須: API キー（または環境変数で設定）
      api_key: your-api-key-here

      # 必須: プロバイダー種別 (openai, anthropic)
      provider: openai

      # 使用するモデル
      model: gpt-4o

      # オプション: OpenAI 互換サービス向けのカスタム API エンドポイント
      # base_url: https://openrouter.ai/api

      # スキーマアクセスを有効化 - AI がデータベース/テーブル情報を取得できるようにする
      enable_schema_access: true

      # 生成パラメーター
      temperature: 0.0      # ランダム性を制御 (0.0 = 決定的)
      max_tokens: 1000      # 最大応答長
      timeout_seconds: 30   # リクエストのタイムアウト
      max_steps: 10         # スキーマ探索の最大ステップ数

      # オプション: カスタム system prompt
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

**最小限の構成例:**

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

- `api_key` - 利用する AI サービスの API キー。環境変数で設定している場合は省略可:
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - 注意: 設定ファイル内の API キーが環境変数より優先されます
- `provider` - 利用する AI プロバイダー: `openai` または `anthropic`
  - 省略時は、設定されている環境変数に基づいて自動的にフォールバック先を選択

</details>

<details>
<summary>モデル設定</summary>

- `model` - 使用するモデル (デフォルト: プロバイダー依存)
  - OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` など
  - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` など
  - OpenRouter: `anthropic/claude-3.5-sonnet` のようなモデル名を使用

</details>

<details>
<summary>接続設定</summary>

- `base_url` - OpenAI 互換サービス向けのカスタム API エンドポイント (任意)
- `timeout_seconds` - リクエストのタイムアウト時間 (秒) (デフォルト: `30`)

</details>

<details>
<summary>スキーマ探索</summary>

- `enable_schema_access` - AI にデータベーススキーマの探索を許可するかどうか (デフォルト: `true`)
- `max_steps` - スキーマ探索時のツール呼び出しステップ数の上限 (デフォルト: `10`)

</details>

<details>
<summary>生成パラメーター</summary>

- `temperature` - 生成結果のランダム性を制御。0.0 = 決定的、1.0 = 創造的 (デフォルト: `0.0`)
- `max_tokens` - 応答の最大トークン数 (デフォルト: `1000`)
- `system_prompt` - AI へのカスタム指示 (任意)

</details>

### 仕組み {#ai-sql-generation-how-it-works}

AI SQL ジェネレーターは、複数のステップからなるプロセスで動作します。

<VerticalStepper headerLevel="list">

1. **スキーマの検出**

AI は組み込みツールを使ってデータベースを探索します
- 利用可能なデータベースを一覧表示
- 関連するデータベース内のテーブルを検出
- `CREATE TABLE` 文を通じてテーブル構造を確認

2. **クエリ生成**

検出したスキーマに基づき、AI は次のような SQL を生成します
- 自然言語で表現した意図に合致する
- 正しいテーブル名およびカラム名を使用する
- 適切な結合や集約を適用する

3. **実行**

生成された SQL は自動的に実行され、その結果が表示されます

</VerticalStepper>

### 制限事項 {#ai-sql-generation-limitations}

- 有効なインターネット接続が必要
- API の利用には、AI プロバイダーによるレート制限および料金が適用される
- 複雑なクエリは複数回の調整が必要になる場合がある
- AI がアクセスできるのは実データではなくスキーマ情報のみ（読み取り専用）

### セキュリティ {#ai-sql-generation-security}

- API キーが ClickHouse サーバーに送信されることはありません
- AI が扱うのはスキーマ情報（テーブル名／カラム名とその型）のみであり、実データにはアクセスしません
- 生成されるすべてのクエリは、既存のデータベース権限を尊重します

## 接続文字列 {#connection_string}

### 使用方法 {#connection-string-usage}

ClickHouse Client は、[MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) と同様の接続文字列を用いて ClickHouse サーバーに接続する方法もサポートしています。構文は次のとおりです。

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| Component (all optional) | 説明                                                                                       | Default          |
| ------------------------ | ---------------------------------------------------------------------------------------- | ---------------- |
| `user`                   | データベースのユーザー名。                                                                            | `default`        |
| `password`               | データベースユーザーのパスワード。`:` が指定され、パスワードが空欄の場合は、クライアントがユーザーのパスワードの入力を求めます。                       | -                |
| `hosts_and_ports`        | ホストおよび任意指定のポートの一覧 `host[:port] [, host:[port]], ...`。                                    | `localhost:9000` |
| `database`               | データベース名。                                                                                 | `default`        |
| `query_parameters`       | キーと値のペアの一覧 `param1=value1[,&param2=value2], ...`。一部のパラメータでは値は不要です。パラメータ名と値は大文字小文字を区別します。 | -                |


### 注意事項 {#connection-string-notes}

接続文字列内で username、password、または database が指定されている場合、`--user`、`--password`、`--database` を使用して同じ項目を指定することはできません（逆も同様です）。

host 部には、ホスト名または IPv4/IPv6 アドレスを指定できます。
IPv6 アドレスは角括弧（[]）で囲む必要があります：

```text
clickhouse://[2001:db8::1234]
```

接続文字列には複数のホストを含めることができます。
ClickHouse Client は、これらのホストに左から右へ順番に接続を試行します。
一度接続が確立されると、残りのホストへの接続は試行されません。

接続文字列は `clickHouse-client` の最初の引数として指定する必要があります。
接続文字列は、`--host` と `--port` を除く任意の数の他の[コマンドラインオプション](#command-line-options)と組み合わせることができます。

`query_parameters` で使用できるキーは次のとおりです。

| Key               | Description                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `secure` (or `s`) | 指定した場合、クライアントはセキュア接続 (TLS) を介してサーバーに接続します。詳細は、[コマンドラインオプション](#command-line-options) の `--secure` を参照してください。 |

**パーセントエンコーディング**

次のパラメータ内の US-ASCII 以外の文字、スペース、および特殊文字は[パーセントエンコード](https://en.wikipedia.org/wiki/URL_encoding)する必要があります。

* `user`
* `password`
* `hosts`
* `database`
* `query parameters`


### 例 {#connection_string_examples}

`localhost` のポート 9000 に接続して、`SELECT 1` クエリを実行します。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

`localhost` に、ユーザー `john`、パスワード `secret`、ホスト `127.0.0.1`、ポート `9000` を指定して接続します

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

`default` USER として `localhost` に接続し、ホストには IPv6 アドレス `[::1]` とポート `9000` を使用します。

```bash
clickhouse-client clickhouse://[::1]:9000
```

マルチラインモードでポート 9000 の `localhost` に接続します。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

ポート 9000 経由で `localhost` に、ユーザー `default` として接続します。

```bash
clickhouse-client clickhouse://default@localhost:9000

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

`localhost` のポート 9000 に接続し、デフォルトのデータベースを `my_database` に設定します。

```bash
clickhouse-client clickhouse://localhost:9000/my_database

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

ポート 9000 の `localhost` に接続し、接続文字列で指定されたデータベース `my_database` をデフォルトとして使用し、短縮形のパラメータ `s` によるセキュア接続を行います。

```bash
clickhouse-client clickhouse://localhost/my_database?s

# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

デフォルトのホストに、デフォルトのポート、ユーザー、データベースを使用して接続します。

```bash
clickhouse-client clickhouse:
```

デフォルトのホストにデフォルトのポートで、ユーザー `my_user`、パスワードなしで接続します。

```bash
clickhouse-client clickhouse://my_user@

# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

メールアドレスをユーザー名として指定し、`localhost` に接続します。`@` 記号は `%40` にパーセントエンコードされます。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

次のいずれかのホストに接続します：`192.168.1.15`, `192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```


## クエリ ID の形式 {#query-id-format}

インタラクティブモードでは、ClickHouse Client はすべてのクエリに対してクエリ ID を表示します。デフォルトでは、ID の形式は次のとおりです。

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

カスタムフォーマットは、設定ファイル内の `query_id_formats` タグ内で指定できます。フォーマット文字列中の `{query_id}` プレースホルダーはクエリ ID に置き換えられます。タグ内には複数のフォーマット文字列を指定できます。
この機能は、クエリのプロファイリングを容易にするための URL を生成する目的で利用できます。

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

ClickHouse Client は、次のいずれかで最初に見つかったファイルを使用します：

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

ユーザー名、パスワード、ホストは、環境変数 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_HOST` で設定できます。
コマンドライン引数 `--user`、`--password`、`--host` や（指定されている場合は）[接続文字列](#connection_string) は、環境変数よりも優先されます。

## コマンドラインオプション {#command-line-options}

すべてのコマンドラインオプションは、コマンドラインから直接指定することも、[設定ファイル](#configuration_files)で既定値として指定することもできます。

### 一般オプション {#command-line-options-general}

| Option                                              | Description                                                                                                                        | Default                      |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| `-c [ -C, --config, --config-file ] <path-to-file>` | クライアントの設定ファイルの場所を指定します。設定ファイルが既定の場所のいずれかにない場合に使用します。[Configuration Files](#configuration_files) を参照してください。 | -                            |
| `--help`                                            | 利用方法の概要を表示して終了します。`--verbose` と併用すると、クエリ設定を含む指定可能なすべてのオプションを表示します。                  | -                            |
| `--history_file <path-to-file>`                     | コマンド履歴を保存するファイルへのパスを指定します。                                                                                     | -                            |
| `--history_max_entries`                             | 履歴ファイルに保存する履歴エントリの最大数を指定します。                                                                                     | `1000000` (100万)        |
| `--prompt <prompt>`                                 | カスタムプロンプトを指定します。                                                                                                           | サーバーの `display_name` |
| `--verbose`                                         | 出力の詳細度を上げます。                                                                                                         | -                            |
| `-V [ --version ]`                                  | バージョンを表示して終了します。                                                                                                            | -                            |

### 接続オプション {#command-line-options-connection}

| オプション                        | 説明                                                                                                                                                                                                                                                                                                                               | デフォルト                                                                                                      |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `--connection <name>`            | 設定ファイルで事前定義された接続設定の名前です。 [Connection credentials](#connection-credentials) を参照してください。                                                                                                                                                                                                            | -                                                                                                                |
| `-d [ --database ] <database>`   | この接続でデフォルトとして使用するデータベースを選択します。                                                                                                                                                                                                                                                                       | サーバー設定での現在のデータベース（デフォルトは `default`）                                                    |
| `-h [ --host ] <host>`           | 接続先の ClickHouse サーバーのホスト名です。ホスト名、IPv4 アドレス、IPv6 アドレスのいずれかを指定できます。複数のホストを指定するには、引数を複数回指定します。                                                                                                                                                                | `localhost`                                                                                                      |
| `--jwt <value>`                  | 認証に JSON Web Token (JWT) を使用します。<br/><br/>サーバー側の JWT 認可は ClickHouse Cloud でのみ利用可能です。                                                                                                                                                                                                                | -                                                                                                                |
| `login`                          | IdP 経由で認証するために、デバイスコード グラントの OAuth フローを開始します。<br/><br/>ClickHouse Cloud のホストに対しては OAuth 変数は自動的に推論されますが、それ以外の場合は `--oauth-url`、`--oauth-client-id`、`--oauth-audience` を指定する必要があります。                                                                                                      | -                                                                                                                |
| `--no-warnings`                  | クライアントがサーバーに接続する際に、`system.warnings` からの警告表示を無効にします。                                                                                                                                                                                                                                             | -                                                                                                                |
| `--no-server-client-version-message` | クライアントがサーバーに接続する際に表示される、サーバーとクライアントのバージョン不一致メッセージを抑止します。                                                                                                                                                                                                                | -                                                                                                                |
| `--password <password>`          | データベースユーザーのパスワードです。接続ごとのパスワードは設定ファイルで指定することもできます。パスワードを指定しない場合、クライアントが入力を求めます。                                                                                                                                                                      | -                                                                                                                |
| `--port <port>`                  | サーバーが接続を受け付けているポートです。デフォルトのポートは 9440（TLS）および 9000（TLS なし）です。<br/><br/>注意: クライアントは HTTP(S) ではなくネイティブプロトコルを使用します。                                                                                                                                        | `--secure` が指定されている場合は `9440`、それ以外は `9000`。ホスト名が `.clickhouse.cloud` で終わる場合は常に `9440` がデフォルト。 |
| `-s [ --secure ]`                | TLS を使用するかどうかを指定します。<br/><br/>ポート 9440（デフォルトのセキュアポート）または ClickHouse Cloud に接続する場合は自動的に有効になります。<br/><br/>CA 証明書を [設定ファイル](#configuration_files) で設定する必要がある場合があります。利用可能な設定項目は [サーバー側 TLS 設定](../operations/server-configuration-parameters/settings.md#openssl) と同じです。 | ポート 9440 または ClickHouse Cloud に接続する場合は自動的に有効                                                |
| `--ssh-key-file <path-to-file>`  | サーバーへの認証に使用する SSH 秘密鍵を含むファイルです。                                                                                                                                                                                                                                                                          | -                                                                                                                |
| `--ssh-key-passphrase <value>`   | `--ssh-key-file` で指定した SSH 秘密鍵のパスフレーズです。                                                                                                                                                                                                                                                                        | -                                                                                                                |
| `-u [ --user ] <username>`       | 接続に使用するデータベースユーザーです。                                                                                                                                                                                                                                                                                           | `default`                                                                                                        |

:::note
`--host`、`--port`、`--user`、`--password` オプションの代わりに、クライアントは [接続文字列](#connection_string) もサポートしています。
:::

### Query options {#command-line-options-query}

| Option                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--param_<name>=<value>`        | [パラメータ付きクエリ](#cli-queries-with-parameters) のパラメータに対する置換値。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `-q [ --query ] <query>`        | バッチモードで実行するクエリ。複数回指定することもできます（`--query "SELECT 1" --query "SELECT 2"`）、またはセミコロン区切りで複数のクエリを 1 回で指定することもできます（`--query "SELECT 1; SELECT 2;"`）。後者の場合、`VALUES` 以外のフォーマットを使用する `INSERT` クエリは空行で区切る必要があります。<br/><br/>単一のクエリはパラメータなしでも指定できます: `clickhouse-client "SELECT 1"` <br/><br/>`--queries-file` と同時には使用できません。 |
| `--queries-file <path-to-file>` | クエリを含むファイルへのパス。`--queries-file` は複数回指定できます（例: `--queries-file queries1.sql --queries-file queries2.sql`）。<br/><br/>`--query` と同時には使用できません。                                                                                                                                                                                                                                                                                                        |
| `-m [ --multiline ]`            | 指定された場合、複数行クエリを許可します（Enter キーを押してもクエリは送信されません）。クエリは末尾がセミコロンで終わったときにのみ送信されます。                                                                                                                                                                                                                                                                                                                                           |

### クエリ設定 {#command-line-options-query-settings}

クエリ設定は、クライアントのコマンドラインオプションとして指定できます。例えば次のように指定します。

```bash
$ clickhouse-client --max_threads 1
```

設定項目の一覧については [Settings](../operations/settings/settings.md) を参照してください。


### フォーマットオプション {#command-line-options-formatting}

| オプション                    | 説明                                                                                                                                                                                                                     | デフォルト        |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| `-f [ --format ] <format>` | 指定したフォーマットで結果を出力します。<br/><br/>サポートされているフォーマットの一覧は [Formats for Input and Output Data](formats.md) を参照してください。                                                        | `TabSeparated` |
| `--pager <command>`       | すべての出力をこのコマンドにパイプします。一般的には `less`（例: 横に広い結果セットを表示するための `less -S`）などを使用します。                                                                                         | -              |
| `-E [ --vertical ]`       | 結果の出力に [Vertical format](/interfaces/formats/Vertical) を使用します。これは `–-format Vertical` と同じです。この形式では、各値が別々の行に出力されるため、横に広いテーブルを表示する際に役立ちます。 | -              |

### 実行の詳細 {#command-line-options-execution-details}

| Option                            | Description                                                                                                                                                                                                                                                                                                         | Default                                                             |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `--enable-progress-table-toggle`  | Ctrl + Space キーを押すことで進捗テーブルの表示切り替えを有効にします。進捗テーブルの出力が有効な対話モード時にのみ適用されます。                                                                                                                                                                                     | `enabled`                                                           |
| `--hardware-utilization`          | 進捗バーにハードウェア使用状況の情報を出力します。                                                                                                                                                                                                                                                                  | -                                                                   |
| `--memory-usage`                  | 指定された場合、非対話モードでメモリ使用量を `stderr` に出力します。 <br/><br/>指定可能な値: <br/>• `none` - メモリ使用量を出力しない <br/>• `default` - バイト数を出力する <br/>• `readable` - メモリ使用量を人間が読みやすい形式で出力する                                                                      | -                                                                   |
| `--print-profile-events`          | `ProfileEvents` パケットを出力します。                                                                                                                                                                                                                                                                              | -                                                                   |
| `--progress`                      | クエリ実行の進捗を出力します。 <br/><br/>指定可能な値: <br/>• `tty\|on\|1\|true\|yes` - 対話モードで端末に出力する <br/>• `err` - 非対話モードで `stderr` に出力する <br/>• `off\|0\|false\|no` - 進捗の出力を無効にする                                                                                             | 対話モードでは `tty`、非対話（バッチ）モードでは `off`              |
| `--progress-table`                | クエリ実行中に変化するメトリクスを含む進捗テーブルを出力します。 <br/><br/>指定可能な値: <br/>• `tty\|on\|1\|true\|yes` - 対話モードで端末に出力する <br/>• `err` - 非対話モードで `stderr` に出力する <br/>• `off\|0\|false\|no` - 進捗テーブルを無効にする                                              | 対話モードでは `tty`、非対話（バッチ）モードでは `off`              |
| `--stacktrace`                    | 例外のスタックトレースを出力します。                                                                                                                                                                                                                                                                                 | -                                                                   |
| `-t [ --time ]`                   | 非対話モードでクエリ実行時間を `stderr` に出力します（ベンチマーク用途）。                                                                                                                                                                                                                                          | -                                                                   |