---
description: 'ClickHouse コマンドラインクライアント インターフェイスのドキュメント'
sidebar_label: 'ClickHouse クライアント'
sidebar_position: 18
slug: /interfaces/client
title: 'ClickHouse クライアント'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickHouse は、ClickHouse サーバーに対して SQL クエリを直接実行するためのネイティブなコマンドラインクライアントを提供しています。
対話モード (クエリをその場で実行する場合) とバッチモード (スクリプト化や自動化を行う場合) の両方をサポートしています。
クエリ結果はターミナルに表示することも、ファイルにエクスポートすることもでき、Pretty、CSV、JSON など、すべての ClickHouse 出力[フォーマット](formats.md)に対応しています。

このクライアントは、進行状況バー、読み取った行数、処理したバイト数、クエリ実行時間など、クエリ実行に関するリアルタイムのフィードバックを提供します。
[コマンドラインオプション](#command-line-options)と[設定ファイル](#configuration_files)の両方をサポートしています。

## インストール \{#install\}

ClickHouseをダウンロードするには、以下を実行します。

```bash
curl https://clickhouse.com/ | sh
```

これもインストールするには、次を実行します。

```bash
sudo ./clickhouse install
```

インストール方法の詳細については、[ClickHouse のインストール](../getting-started/install/install.mdx)を参照してください。

異なるバージョンのクライアントとサーバー間にも互換性はありますが、古いクライアントでは一部の機能を利用できない場合があります。クライアントとサーバーには同じバージョンを使用することを推奨します。

## 実行 \{#run\}

:::note
ClickHouse をダウンロードしただけで、まだインストールしていない場合は、`clickhouse-client` ではなく `./clickhouse client` を使用してください。
:::

ClickHouse サーバーに接続するには、次を実行します。

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

必要に応じて、追加の接続情報を指定します。

| Option                           | Description                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `--port <port>`                  | ClickHouse サーバーが接続を受け付けているポートです。デフォルトのポートは 9440 (TLS) と 9000 (TLS なし) です。ClickHouse クライアント は HTTP(S) ではなくネイティブプロトコルを使用する点に注意してください。 |
| `-s [ --secure ]`                | TLS を使用するかどうかを指定します (通常は自動検出されます) 。                                                                                                 |
| `-u [ --user ] <username>`       | 接続に使用するデータベースユーザーです。デフォルトでは `default` ユーザーとして接続します。                                                                                 |
| `--password <password>`          | データベースユーザーのパスワードです。接続のパスワードは設定ファイルで指定することもできます。パスワードを指定しない場合、クライアントが入力を求めます。                                                        |
| `-c [ --config ] <path-to-file>` | ClickHouse クライアント の設定ファイルの場所です。デフォルトの場所にない場合に指定します。[設定ファイル](#configuration_files) を参照してください。                                        |
| `--connection <name>`            | [設定ファイル](#connection-credentials) で事前設定された接続情報の名前です。                                                                                |

コマンドラインオプションの完全な一覧については、[Command Line Options](#command-line-options) を参照してください。

### ClickHouse Cloud への接続 \{#connecting-cloud\}

ClickHouse Cloud サービスの詳細は、ClickHouse Cloud コンソールで確認できます。接続先のサービスを選択し、**Connect** をクリックします。

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud サービスの接続ボタン" />

<br />

<br />

**Native** を選択すると、`clickhouse-client` コマンドの例とともに接続の詳細が表示されます。

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud Native TCP 接続の詳細" />

### 設定ファイルに接続情報を保存する \{#connection-credentials\}

[設定ファイル](#configuration_files)に、1 台以上の ClickHouse サーバーの接続情報を保存できます。

フォーマットは次のとおりです。

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

詳細は、[設定ファイルのセクション](#configuration_files)を参照してください。

:::note
クエリの構文に焦点を当てるため、以降の例では接続の詳細 (`--host`、`--port` など) を省略しています。コマンドを使用する際は、忘れずにこれらを追加してください。
:::

## 対話型モード \{#interactive-mode\}

### 対話型モードの使用 \{#using-interactive-mode\}

ClickHouse を対話型モードで実行するには、次を実行してください。

```bash
clickhouse-client
```

これにより、Read-Eval-Print Loop (REPL) が開き、対話形式で SQL クエリを入力できます。
接続すると、クエリを入力できるプロンプトが表示されます。

```bash
ClickHouse client version 25.x.x.x
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 25.x.x.x

hostname :)
```

対話型モードでは、デフォルトの出力フォーマットは `PrettyCompact` です。
フォーマットは、クエリの `FORMAT` 句、またはコマンドラインオプション `--format` で変更できます。
Vertical フォーマットを使用するには、`--vertical` を使用するか、クエリの末尾に `\G` を指定します。
このフォーマットでは各値が別々の行に出力されるため、列数の多いテーブルで便利です。

対話型モードでは、デフォルトで入力した内容は `Enter` を押すとそのまま実行されます。
クエリの末尾にセミコロンは必要ありません。

`-m, --multiline` パラメータを指定してクライアントを起動できます。
複数行のクエリを入力するには、改行の前にバックスラッシュ `\` を入力します。
`Enter` を押すと、クエリの次の行の入力を求められます。
クエリを実行するには、末尾にセミコロンを付けて `Enter` を押します。

ClickHouse クライアント は `replxx` (`readline` に類似) をベースとしているため、一般的なキーボードショートカットを使用でき、履歴も保持されます。
履歴はデフォルトで `~/.clickhouse-client-history` に書き込まれます。

クライアントを終了するには、`Ctrl+D` を押すか、クエリの代わりに次のいずれかを入力します。

* `exit` または `exit;`
* `quit` または `quit;`
* `q`、`Q` または `:q`
* `logout` または `logout;`

### クエリ処理情報 \{#processing-info\}

クエリの処理中、クライアントには次の情報が表示されます。

1. 進行状況。既定では、1 秒あたり最大 10 回更新されます。
   短時間で完了するクエリでは、進行状況が表示される前に処理が終わることがあります。
2. デバッグ用に、解析後のフォーマット済みのクエリ。
3. 指定したフォーマットでの結果。
4. 結果の行数、経過時間、およびクエリ処理の平均速度。
   すべてのデータ量は非圧縮データを基準としています。

長時間実行されるクエリは、`Ctrl+C` を押してキャンセルできます。
ただし、サーバーがリクエストを中止するまで、少し待つ必要があります。
特定の段階では、クエリをキャンセルできません。
待たずに `Ctrl+C` をもう一度押すと、クライアントは終了します。

ClickHouse Client では、クエリ実行用に外部データ (外部一時テーブル) を渡すことができます。
詳細は、[クエリ処理用の外部データ](../engines/table-engines/special/external-data.md) のセクションを参照してください。

### 別名 \{#cli_aliases\}

REPL 内では、次の別名を使用できます:

* `\l` - SHOW DATABASES
* `\d` - SHOW TABLES
* `\c <DATABASE>` - USE DATABASE
* `.` - 直前のクエリを繰り返す

### キーボードショートカット \{#keyboard_shortcuts\}

* `Alt (Option) + Shift + e` - 現在のクエリを読み込んだ状態でエディタを開きます。使用するエディタは環境変数 `EDITOR` で指定できます。デフォルトでは `vim` が使用されます。
* `Alt (Option) + #` - 行をコメントアウトします。
* `Ctrl + r` - 履歴をあいまい検索します。

利用可能なすべてのキーボードショートカットの一覧は、[replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262) にあります。

:::tip
MacOS でメタキー (Option) が正しく動作するように設定するには:

iTerm2: Preferences -&gt; Profile -&gt; Keys -&gt; Left Option key に移動して、Esc+ をクリックします
:::

## バッチモード \{#batch-mode\}

### バッチモードの使用 \{#using-batch-mode\}

ClickHouse クライアント を対話的に使用する代わりに、バッチモードで実行できます。
バッチモードでは、ClickHouse は単一のクエリを実行するとすぐに終了し、対話型のプロンプトやループはありません。

次のように単一のクエリを指定できます。

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

また、`--query` コマンドラインオプションも使用できます:

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

`stdin` 経由でクエリを指定できます:

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

`messages` テーブルが存在するものとして、コマンドラインからデータを挿入することもできます:

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query` が指定されている場合、入力内容はすべて、改行文字の後にリクエストへ追加されます。

### リモートのClickHouseサービスにCSVファイルを挿入する \{#cloud-example\}

この例では、サンプルデータセットのCSVファイル `cell_towers.csv` を、`default` データベース内の既存の `cell_towers` テーブルに挿入します。

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

### コマンドラインからデータを挿入する例 \{#more-examples\}

コマンドラインからデータを挿入する方法はいくつかあります。
以下の例では、バッチモードで 2 行の CSV データを ClickHouse テーブルに挿入します。

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

以下の例では、`cat <<_EOF` によってヒアドキュメントが開始され、再び `_EOF` が現れるまでの内容をすべて読み取り、その後それを出力します。

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

以下の例では、`cat` を使って file.csv の内容を標準出力に出力し、その出力を入力として `clickhouse-client` にパイプします。

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

バッチモードでは、デフォルトのデータ[フォーマット](formats.md)は `TabSeparated` です。
前述の例のように、クエリの `FORMAT` 句でフォーマットを設定できます。

## パラメータ付きクエリ \{#cli-queries-with-parameters\}

クエリ内でパラメータを指定し、コマンドラインオプションで値を渡せます。
これにより、クライアント側で特定の動的な値を使ってクエリを組み立てる必要がなくなります。
例:

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

[対話型セッション](#interactive-mode)内でパラメータを設定することもできます。

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

### クエリ構文 \{#cli-queries-with-parameters-syntax\}

クエリでは、コマンドラインパラメータで指定する値を、次の形式で波括弧内に記述します。

```sql
{<name>:<data type>}
```

| パラメータ       | 説明                                                                                                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`      | プレースホルダーの識別子です。対応するコマンドラインオプションは `--param_<name> = value` です。                                                                                                                                                                                                                                                                  |
| `data type` | パラメータの[データ型](../sql-reference/data-types/index.md)です。 <br /><br />たとえば、`(integer, ('string', integer))` のようなデータ構造には、`Tuple(UInt8, Tuple(String, UInt8))` というデータ型を指定できます (ほかの[整数](../sql-reference/data-types/int-uint.md)型も使用できます) 。 <br /><br />テーブル名、データベース名、カラム名をパラメータとして渡すこともできます。その場合は、データ型として `Identifier` を使用する必要があります。 |

### 例 \{#cli-queries-with-parameters-examples\}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```

## AI による SQL 生成 \{#ai-sql-generation\}

ClickHouse クライアント には、自然言語による説明から SQL クエリを生成する組み込みの AI 支援機能があります。この機能により、SQL の深い知識がなくても複雑なクエリを作成できます。

`OPENAI_API_KEY` または `ANTHROPIC_API_KEY` のいずれかの環境変数が設定されていれば、AI 支援機能をそのまま利用できます。より詳細な設定については、[設定](#ai-sql-generation-configuration) セクションを参照してください。

### 使用方法 \{#ai-sql-generation-usage\}

AI による SQL 生成を使用するには、自然言語のクエリの先頭に `??` を付けます：

```bash
:) ?? show all users who made purchases in the last 30 days
```

AI は次のことを行います。

1. データベースの schema を自動的に調査します
2. 検出されたテーブルとカラムに基づいて、適切な SQL を生成します
3. 生成されたクエリを直ちに実行します

### 例 \{#ai-sql-generation-example\}

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

### 設定 \{#ai-sql-generation-configuration\}

AI SQL 生成を使用するには、ClickHouse クライアント の設定ファイルで AI プロバイダーを設定する必要があります。使用できるのは、OpenAI、Anthropic、または OpenAI 互換の API サービスです。

#### 環境変数ベースのフォールバック \{#ai-sql-generation-fallback\}

設定ファイルで AI の設定が指定されていない場合、ClickHouse Clientは自動的に環境変数の使用を試みます。

1. まず `OPENAI_API_KEY` 環境変数を確認します
2. 見つからない場合は、`ANTHROPIC_API_KEY` 環境変数を確認します
3. どちらも見つからない場合は、AI 機能は無効になります

これにより、設定ファイルを使わずにすばやくセットアップできます。

```bash
# Using OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client

# Using Anthropic
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```

#### 設定ファイル \{#ai-sql-generation-configuration-file\}

AI 設定をより細かく制御するには、以下の場所にある ClickHouse Client の設定ファイルで設定します。

* `$XDG_CONFIG_HOME/clickhouse/config.xml` (`XDG_CONFIG_HOME` が設定されていない場合は `~/.config/clickhouse/config.xml`)  (XML フォーマット)
* `$XDG_CONFIG_HOME/clickhouse/config.yaml` (`XDG_CONFIG_HOME` が設定されていない場合は `~/.config/clickhouse/config.yaml`)  (YAML フォーマット)
* `~/.clickhouse-client/config.xml` (XML フォーマット、従来の場所)
* `~/.clickhouse-client/config.yaml` (YAML フォーマット、従来の場所)
* または、`--config-file` で任意の場所を指定します

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- 必須: API キー（または環境変数で設定） -->
            <api_key>your-api-key-here</api_key>

            <!-- 必須: プロバイダーの種類（openai、anthropic） -->
            <provider>openai</provider>

            <!-- 使用するモデル（デフォルト値はプロバイダーによって異なります） -->
            <model>gpt-4o</model>

            <!-- 任意: OpenAI 互換サービス用のカスタム API エンドポイント -->
            <!-- <base_url>https://openrouter.ai/api</base_url> -->

            <!-- schema 探索の設定 -->
            <enable_schema_access>true</enable_schema_access>

            <!-- 生成パラメータ -->
            <temperature>0.0</temperature>
            <max_tokens>1000</max_tokens>
            <timeout_seconds>30</timeout_seconds>
            <max_steps>10</max_steps>

            <!-- 任意: カスタムのシステムプロンプト -->
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

      # 必須: プロバイダーの種類（openai、anthropic）
      provider: openai

      # 使用するモデル
      model: gpt-4o

      # 任意: OpenAI 互換サービス用のカスタム API エンドポイント
      # base_url: https://openrouter.ai/api

      # schema アクセスを有効化 - AI がデータベースやテーブルの情報をクエリできるようにします
      enable_schema_access: true

      # 生成パラメータ
      temperature: 0.0      # ランダム性を制御します（0.0 = 決定論的）
      max_tokens: 1000      # 応答の最大長
      timeout_seconds: 30   # リクエストのタイムアウト
      max_steps: 10         # schema 探索の最大ステップ数

      # 任意: カスタムのシステムプロンプト
      # system_prompt: |
      #   あなたは ClickHouse SQL のエキスパートアシスタントです。自然言語を SQL に変換してください。
      #   パフォーマンスを重視し、ClickHouse 特有の最適化を使用してください。
      #   説明は付けず、常に実行可能な SQL のみを返してください。
    ```
  </TabItem>
</Tabs>

<br />

**OpenAI 互換 API の使用 (例: OpenRouter) :**

```yaml
ai:
  provider: openai  # Use 'openai' for compatibility
  api_key: your-openrouter-api-key
  base_url: https://openrouter.ai/api/v1
  model: anthropic/claude-3.5-sonnet  # Use OpenRouter model naming
```

**最小限の設定例:**

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

### パラメータ \{#ai-sql-generation-parameters\}

<details>
  <summary>必須パラメータ</summary>

  * `api_key` - AI サービス用の API キーです。環境変数で設定している場合は省略できます:
    * OpenAI: `OPENAI_API_KEY`
    * Anthropic: `ANTHROPIC_API_KEY`
    * 注意: 設定ファイル内の API キーは環境変数より優先されます
  * `provider` - AI プロバイダー: `openai` または `anthropic`
    * 省略した場合、利用可能な環境変数に基づいて自動的にフォールバックします
</details>

<details>
  <summary>モデル設定</summary>

  * `model` - 使用するモデル (デフォルト: プロバイダー固有)
    * OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` など
    * Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` など
    * OpenRouter: `anthropic/claude-3.5-sonnet` のようなモデル名を使用します
</details>

<details>
  <summary>接続設定</summary>

  * `base_url` - OpenAI 互換サービス用のカスタム API エンドポイント (任意)
  * `timeout_seconds` - リクエストのタイムアウト (秒)  (デフォルト: `30`)
</details>

<details>
  <summary>schema の探索</summary>

  * `enable_schema_access` - AI がデータベース schema を探索できるようにします (デフォルト: `true`)
  * `max_steps` - schema の探索で許可するツール呼び出しの最大ステップ数 (デフォルト: `10`)
</details>

<details>
  <summary>生成パラメータ</summary>

  * `temperature` - ランダム性を制御します。0.0 = 決定論的、1.0 = 創造的 (デフォルト: `0.0`)
  * `max_tokens` - 応答の最大長 (トークン数)  (デフォルト: `1000`)
  * `system_prompt` - AI へのカスタム指示 (任意)
</details>

### 仕組み \{#ai-sql-generation-how-it-works\}

AI SQL ジェネレーターは、次の複数ステップのプロセスで動作します。

<VerticalStepper headerLevel="list">
  1. **schema の検出**

  AI は組み込みツールを使用してデータベースを探索します

  * 利用可能なデータベースを一覧表示します
  * 関連するデータベース内のテーブルを検出します
  * `CREATE TABLE` 文を使用してテーブル構造を調べます

  2. **クエリ生成**

  検出した schema に基づいて、AI は次の条件を満たす SQL を生成します。

  * 自然言語による意図に一致する
  * 正しいテーブル名とカラム名を使用する
  * 適切な結合と集約を適用する

  3. **実行**

  生成された SQL は自動的に実行され、結果が表示されます
</VerticalStepper>

### 制限事項 \{#ai-sql-generation-limitations\}

* 有効なインターネット接続が必要です
* API の利用には、AI プロバイダーによるレート制限とコストが適用されます
* 複雑なクエリでは、複数回の調整が必要になる場合があります
* AI が読み取り専用でアクセスできるのは schema 情報のみであり、実際のデータにはアクセスできません

### セキュリティ \{#ai-sql-generation-security\}

* API キーが ClickHouse サーバーに送信されることはありません
* AI が参照するのは schema 情報 (テーブル名/カラム名と型) のみで、実際のデータは参照しません
* 生成されるすべてのクエリは、既存のデータベース権限に従います

## 接続文字列 \{#connection_string\}

### 使用方法 \{#connection-string-usage\}

ClickHouse Client は、[MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) と同様の接続文字列を使用して ClickHouse サーバーに接続することもできます。構文は次のとおりです。

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| 構成要素 (すべて任意)       | 説明                                                                                           | デフォルト            |
| ------------------ | -------------------------------------------------------------------------------------------- | ---------------- |
| `user`             | データベースのユーザー名。                                                                                | `default`        |
| `password`         | データベースユーザーのパスワード。`:` が指定され、パスワードが空の場合、クライアントはユーザーのパスワードの入力を求めます。                             | -                |
| `hosts_and_ports`  | ホストと任意のポートのリスト `host[:port] [, host:[port]], ...`。                                           | `localhost:9000` |
| `database`         | データベース名。                                                                                     | `default`        |
| `query_parameters` | キーと値のペアのリスト `param1=value1[,&param2=value2], ...`。一部のパラメータでは値は不要です。パラメータ名と値では大文字と小文字が区別されます。 | -                |

### 注意 \{#connection-string-notes\}

接続文字列でユーザー名、パスワード、またはデータベースを指定した場合、`--user`、`--password`、`--database` で指定することはできません (逆も同様です) 。

host 部分には、ホスト名、IPv4 アドレス、または IPv6 アドレスを指定できます。
IPv6 アドレスは `[]` で囲んでください。

```text
clickhouse://[2001:db8::1234]
```

接続文字列には複数のホストを含めることができます。
ClickHouse Client は、これらのホストへの接続を左から右の順に試行します。
接続が確立されると、残りのホストへの接続は試行されません。

接続文字列は、`clickHouse-client` の最初の引数として指定する必要があります。
接続文字列は、`--host` と `--port` を除き、任意の数の他の[コマンドラインオプション](#command-line-options)と組み合わせることができます。

`query_parameters` では、次のキーを指定できます。

| Key               | Description                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `secure` (or `s`) | 指定すると、クライアントはセキュアな接続 (TLS) でサーバーに接続します。[コマンドラインオプション](#command-line-options)の `--secure` を参照してください。 |

**パーセントエンコーディング**

次のパラメータ内の US-ASCII 以外の文字、スペース、および特殊文字は、[パーセントエンコード](https://en.wikipedia.org/wiki/URL_encoding)する必要があります。

* `user`
* `password`
* `hosts`
* `database`
* `query parameters`

### 例 \{#connection_string_examples\}

ポート9000で`localhost`に接続し、クエリ`SELECT 1`を実行します。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

ユーザー `john`、パスワード `secret`、ホスト `127.0.0.1`、ポート `9000` で `localhost` に接続

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

IPV6 アドレス `[::1]`、ポート `9000` のホスト `localhost` に、`default` ユーザーとして接続します。

```bash
clickhouse-client clickhouse://[::1]:9000
```

マルチラインモードで、ポート9000の`localhost`に接続します。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

`localhost` に、ポート9000でユーザー `default` として接続します。

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

ポート9000の`localhost`に接続し、接続文字列で指定した`my_database`データベースを既定で使用し、短縮形の`s`パラメータでセキュアな接続を使用します。

```bash
clickhouse-client clickhouse://localhost/my_database?s

# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

デフォルトのホストに、デフォルトのポート、デフォルトのユーザー、デフォルトのデータベースを使用して接続します。

```bash
clickhouse-client clickhouse:
```

デフォルトのホストのデフォルトのポートに、ユーザー `my_user`、パスワードなしで接続します。

```bash
clickhouse-client clickhouse://my_user@

# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

ユーザー名としてメールアドレスを使用して `localhost` に接続します。`@` 記号は `%40` にパーセントエンコードされます。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

2 つのホストのいずれかに接続します: `192.168.1.15`, `192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## クエリIDのフォーマット \{#query-id-format\}

インタラクティブモードでは、ClickHouse Clientに各クエリのクエリIDが表示されます。デフォルトでは、IDは次の形式になります。

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

カスタムフォーマットは、設定ファイル内の `query_id_formats` タグで指定できます。フォーマット文字列内の `{query_id}` プレースホルダーは、クエリ ID に置き換えられます。タグ内には複数のフォーマット文字列を指定できます。
この機能を使用すると、クエリの性能分析を容易にする URL を生成できます。

**例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

上記の設定では、クエリ ID は次のフォーマットで表示されます。

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```

## 設定ファイル \{#configuration_files\}

ClickHouse Clientは、次のファイルのうち最初に見つかったものを使用します。

* `-c [ -C, --config, --config-file ]` パラメータで指定されたファイル。
* `./clickhouse-client.[xml|yaml|yml]`
* `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]` (`XDG_CONFIG_HOME` が設定されていない場合は `~/.config/clickhouse/config.[xml|yaml|yml]`)
* `~/.clickhouse-client/config.[xml|yaml|yml]`
* `/etc/clickhouse-client/config.[xml|yaml|yml]`

ClickHouseリポジトリ内の設定ファイルのサンプルを参照してください: [`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

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

## 環境変数オプション \{#environment-variable-options\}

ユーザー名、パスワード、ホストは、環境変数 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_HOST` を使用して設定できます。
コマンドライン引数 `--user`、`--password`、`--host`、または[接続文字列](#connection_string) (指定されている場合) は、環境変数より優先されます。

## コマンドラインオプション \{#command-line-options\}

すべてのコマンドラインオプションは、コマンドラインで直接指定することも、[設定ファイル](#configuration_files)でデフォルト値として指定することもできます。

### 一般オプション \{#command-line-options-general\}

| Option                                              | Description                                                                                   | Default              |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------- |
| `-c [ -C, --config, --config-file ] <path-to-file>` | クライアントの設定ファイルがデフォルトの場所のいずれにも存在しない場合に、そのファイルの場所を指定します。[設定ファイル](#configuration_files)を参照してください。 | -                    |
| `--help`                                            | 使用方法の概要を表示して終了します。`--verbose` と組み合わせると、クエリ設定を含む使用可能なすべてのオプションが表示されます。                         | -                    |
| `--history_file <path-to-file>`                     | コマンド履歴を含むファイルのパス。                                                                             | -                    |
| `--history_max_entries`                             | 履歴ファイルに保持するエントリの最大数。                                                                          | `1000000` (100万)     |
| `--prompt <prompt>`                                 | カスタムプロンプトを指定します。                                                                              | サーバーの `display_name` |
| `--verbose`                                         | 出力の詳細度を上げます。                                                                                  | -                    |
| `-V [ --version ]`                                  | バージョンを表示して終了します。                                                                              | -                    |

### 接続オプション \{#command-line-options-connection\}

| オプション                                | 説明                                                                                                                                                                                                                                                                       | デフォルト                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `--connection <name>`                | 設定ファイル内で事前設定された接続情報の名前です。[接続資格情報](#connection-credentials)を参照してください。                                                                                                                                                                                                     | -                                                                                               |
| `-d [ --database ] <database>`       | この接続で既定として使用するデータベースを選択します。                                                                                                                                                                                                                                              | サーバー設定の現在のデータベース (デフォルトは `default`)                                                             |
| `-h [ --host ] <host>`               | 接続先の ClickHouse サーバーのホスト名です。ホスト名、IPv4 アドレス、IPv6 アドレスのいずれも指定できます。複数の引数を指定して複数のホストを渡すこともできます。                                                                                                                                                                              | `localhost`                                                                                     |
| `--jwt <value>`                      | 認証に JSON Web Token (JWT) を使用します。<br /><br />サーバーでの JWT 認可は ClickHouse Cloud でのみ利用できます。                                                                                                                                                                                   | -                                                                                               |
| `login`                              | IdP 経由で認証するために、デバイス許可の OAuth フローを開始します。<br /><br />ClickHouse Cloud ホストでは OAuth 変数は自動的に推定されます。それ以外の場合は、`--oauth-url`、`--oauth-client-id`、`--oauth-audience` で指定する必要があります。                                                                                                | -                                                                                               |
| `--no-warnings`                      | クライアントがサーバーに接続したときに、`system.warnings` の警告を表示しないようにします。                                                                                                                                                                                                                   | -                                                                                               |
| `--no-server-client-version-message` | クライアントがサーバーに接続したときに、サーバーとクライアントのバージョン不一致メッセージを表示しません。                                                                                                                                                                                                                    | -                                                                                               |
| `--password <password>`              | データベースユーザーのパスワードです。設定ファイル内で接続のパスワードを指定することもできます。パスワードを指定しない場合、クライアントが入力を求めます。                                                                                                                                                                                            | -                                                                                               |
| `--port <port>`                      | サーバーが接続を受け付けるポートです。デフォルトのポートは 9440 (TLS) および 9000 (TLS なし) です。<br /><br />注意: クライアントは HTTP(S) ではなくネイティブプロトコルを使用します。                                                                                                                                                      | `--secure` が指定されている場合は `9440`、それ以外は `9000`。ホスト名が `.clickhouse.cloud` で終わる場合は常に `9440` がデフォルトです。 |
| `-s [ --secure ]`                    | TLS を使用するかどうかを指定します。<br /><br />ポート 9440 (デフォルトのセキュアポート) または ClickHouse Cloud に接続する場合は自動的に有効になります。<br /><br />[設定ファイル](#configuration_files)で CA 証明書を設定する必要がある場合があります。使用できる設定項目は、[サーバー側 TLS 設定](../operations/server-configuration-parameters/settings.md#openssl)と同じです。 | ポート 9440 または ClickHouse Cloud への接続時に自動的に有効                                                      |
| `--ssh-key-file <path-to-file>`      | サーバー認証に使用する SSH 秘密鍵を格納したファイルです。                                                                                                                                                                                                                                          | -                                                                                               |
| `--ssh-key-passphrase <value>`       | `--ssh-key-file` で指定した SSH 秘密鍵のパスフレーズです。                                                                                                                                                                                                                                 | -                                                                                               |
| `--tls-sni-override <server name>`   | TLS を使用する場合、ハンドシェイク時に渡すサーバー名 (SNI) です。                                                                                                                                                                                                                                   | `-h` または `--host` で指定したホスト。                                                                     |
| `-u [ --user ] <username>`           | 接続に使用するデータベースユーザーです。                                                                                                                                                                                                                                                     | `default`                                                                                       |

:::note
`--host`、`--port`、`--user`、`--password` オプションの代わりに、クライアントは[接続文字列](#connection_string)もサポートしています。
:::

### クエリオプション \{#command-line-options-query\}

| Option                          | Description                                                                                                                                                                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--param_<name>=<value>`        | [パラメータ付きクエリ](#cli-queries-with-parameters)のパラメータに対する置換値。                                                                                                                                                                                                                                                                      |
| `-q [ --query ] <query>`        | バッチモードで実行するクエリを指定します。複数回指定することもでき (`--query "SELECT 1" --query "SELECT 2"`)、1 回の指定で複数のクエリをセミコロン区切りで渡すこともできます (`--query "SELECT 1; SELECT 2;"`)。後者の場合、`VALUES` 以外のフォーマットを使用する `INSERT` クエリは空行で区切る必要があります。 <br /><br />単一のクエリは、パラメータを付けずに指定することもできます: `clickhouse-client "SELECT 1"` <br /><br />`--queries-file` と同時には使用できません。 |
| `--queries-file <path-to-file>` | クエリを含むファイルのパス。`--queries-file` は複数回指定できます。たとえば、`--queries-file queries1.sql --queries-file queries2.sql` のように指定します。 <br /><br />`--query` と同時には使用できません。                                                                                                                                                                       |
| `-m [ --multiline ]`            | 指定すると、複数行のクエリを入力できます (Enter を押してもクエリは送信されません) 。クエリはセミコロンで終わった場合にのみ送信されます。                                                                                                                                                                                                                                                     |

### クエリ設定 \{#command-line-options-query-settings\}

クエリ設定は、たとえば次のようにクライアントのコマンドラインオプションとして指定できます。

```bash
$ clickhouse-client --max_threads 1
```

設定の一覧は、[設定](../operations/settings/settings.md)を参照してください。

### フォーマットオプション \{#command-line-options-formatting\}

| オプション                      | 説明                                                                                                                                           | デフォルト          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `-f [ --format ] <format>` | 指定したフォーマットで結果を出力します。 <br /><br />サポートされているフォーマットの一覧については、[入力データと出力データのフォーマット](formats.md)を参照してください。                                          | `TabSeparated` |
| `--pager <command>`        | すべての出力をこの命令語にパイプします。通常は `less` (例: 横に広い結果セットを表示するには `less -S`) または同様のものを使用します。                                                               | -              |
| `-E [ --vertical ]`        | 結果の出力に [Verticalフォーマット](/interfaces/formats/Vertical) を使用します。これは `–-format Vertical` と同じです。このフォーマットでは各値が別々の行に出力されるため、列数の多いテーブルを表示する場合に役立ちます。 | -              |

### 実行の詳細 \{#command-line-options-execution-details\}

| Option                           | Description                                                                                                                                                                          | Default                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| `--enable-progress-table-toggle` | Ctrlキー (Space) を押して進行状況テーブルの表示を切り替えられるようにします。進行状況テーブルの表示が有効な対話モードでのみ適用されます。                                                                                                          | `enabled`                           |
| `--hardware-utilization`         | 進行状況バーにハードウェア使用率の情報を表示します。                                                                                                                                                           | -                                   |
| `--memory-usage`                 | 指定した場合、非対話モードでメモリ使用量を`stderr`に表示します。 <br /><br />設定可能な値: <br />• `none` - メモリ使用量を表示しない <br />• `default` - バイト数を表示 <br />• `readable` - 人が読みやすい形式でメモリ使用量を表示                          | -                                   |
| `--print-profile-events`         | `ProfileEvents`パケットを表示します。                                                                                                                                                           | -                                   |
| `--progress`                     | クエリ実行の進行状況を表示します。 <br /><br />設定可能な値: <br />• `tty\|on\|1\|true\|yes` - 対話モードで端末に出力 <br />• `err` - 非対話モードで`stderr`に出力 <br />• `off\|0\|false\|no` - 進行状況の表示を無効化                     | 対話モードでは`tty`、非対話 (batch) モードでは`off` |
| `--progress-table`               | クエリ実行中に変化するメトリクスを表示する進行状況テーブルを出力します。 <br /><br />設定可能な値: <br />• `tty\|on\|1\|true\|yes` - 対話モードで端末に出力 <br />• `err` - 非対話モードで`stderr`に出力 <br />• `off\|0\|false\|no` - 進行状況テーブルを無効化 | 対話モードでは`tty`、非対話 (batch) モードでは`off` |
| `--stacktrace`                   | 例外のスタックトレースを表示します。                                                                                                                                                                   | -                                   |
| `-t [ --time ]`                  | 非対話モードでクエリ実行時間を`stderr`に表示します (ベンチマーク用) 。                                                                                                                                            | -                                   |