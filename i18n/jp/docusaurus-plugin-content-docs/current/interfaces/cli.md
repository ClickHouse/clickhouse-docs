---
description: 'ClickHouse コマンドラインクライアント用ドキュメント'
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
このクライアントは、対話型モード（ライブでのクエリ実行）とバッチモード（スクリプトや自動化向け）の両方をサポートします。
クエリ結果はターミナルに表示することも、ファイルにエクスポートすることもでき、Pretty、CSV、JSON など、すべての ClickHouse 出力[フォーマット](formats.md)をサポートします。

このクライアントは、プログレスバーや読み取った行数、処理したバイト数、クエリ実行時間などを通じて、クエリ実行に関するリアルタイムのフィードバックを提供します。
[コマンドラインオプション](#command-line-options)と[設定ファイル](#configuration_files)の両方をサポートしています。


## インストール {#install}

ClickHouse をダウンロードするには、次のコマンドを実行します:

```bash
curl https://clickhouse.com/ | sh
```

これもインストールするには、次を実行します：

```bash
sudo ./clickhouse install
```

その他のインストールオプションについては、[Install ClickHouse](../getting-started/install/install.mdx) を参照してください。

クライアントとサーバーのバージョンが異なっていても互換性はありますが、古いクライアントでは一部の機能が利用できない場合があります。クライアントとサーバーの両方で同じバージョンを使用することを推奨します。


## 実行 {#run}

:::note
ClickHouse をダウンロードしただけで、まだインストールしていない場合は、`clickhouse-client` の代わりに `./clickhouse client` を使用してください。
:::

ClickHouse サーバーに接続するには、次を実行します。

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

必要に応じて、追加の接続詳細を指定します。

| Option                                 | Description                                                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `--port &lt;port&gt;`                  | ClickHouse サーバーが接続を受け付けるポートです。デフォルトのポートは 9440 (TLS) と 9000 (TLS なし) です。なお、ClickHouse Client は HTTP(S) ではなくネイティブプロトコルを使用します。 |
| `-s [ --secure ]`                      | TLS を使用するかどうかを指定します (通常は自動検出されます)。                                                                                          |
| `-u [ --user ] &lt;username&gt;`       | 接続に使用するデータベースユーザーです。指定しない場合は `default` ユーザーとして接続します。                                                                        |
| `--password &lt;password&gt;`          | データベースユーザーのパスワードです。接続用のパスワードは設定ファイル内で指定することもできます。パスワードを指定しない場合、クライアントが入力を求めます。                                              |
| `-c [ --config ] &lt;path-to-file&gt;` | ClickHouse Client の設定ファイルの場所です。デフォルトの場所にない場合に指定します。詳細は [設定ファイル](#configuration_files) を参照してください。                            |
| `--connection &lt;name&gt;`            | [設定ファイル](#connection-credentials) 内で事前定義された接続情報の名前です。                                                                       |

利用可能なコマンドラインオプションの完全な一覧については、[コマンドラインオプション](#command-line-options) を参照してください。


### ClickHouse Cloud に接続する {#connecting-cloud}

ClickHouse Cloud サービスの詳細情報は、ClickHouse Cloud コンソールで確認できます。接続したいサービスを選択し、**Connect** をクリックします。

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloud サービスの接続ボタン"
/>

<br/>

<br/>

**Native** を選択すると、サンプルの `clickhouse-client` コマンドとともに接続情報の詳細が表示されます。

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse Cloud の Native TCP 接続情報の詳細"
/>

### 設定ファイルへの接続情報の保存 {#connection-credentials}

1 つ以上の ClickHouse サーバーに対する接続情報は、[設定ファイル](#configuration_files)に保存できます。

形式は次のようになります。

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

詳しくは、[設定ファイルのセクション](#configuration_files)を参照してください。

:::note
クエリ構文に集中するため、以降の例では接続情報（`--host`、`--port` など）を省略しています。実際にコマンドを使用する際には、これらを必ず指定してください。
:::


## インタラクティブモード {#interactive-mode}

### インタラクティブモードの使用 {#using-interactive-mode}

ClickHouse をインタラクティブモードで実行するには、次のコマンドを実行します。

```bash
clickhouse-client
```

これにより、Read-Eval-Print Loop（REPL）が起動し、対話的に SQL クエリを入力できるようになります。
接続が確立されると、クエリを入力するためのプロンプトが表示されます。

```bash
ClickHouse client version 25.x.x.x
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 25.x.x.x

hostname :)
```

インタラクティブモードでは、デフォルトの出力フォーマットは `PrettyCompact` です。
`FORMAT` 句、またはコマンドラインオプション `--format` を指定してフォーマットを変更できます。
Vertical 形式を使用するには、`--vertical` を使用するか、クエリの末尾に `\G` を指定します。
この形式では、各値が別々の行に出力されるため、横に長いテーブルを扱う場合に便利です。

インタラクティブモードでは、`Enter` を押すと入力した内容がそのまま実行されます。
クエリの末尾にセミコロンは必須ではありません。

クライアントは `-m, --multiline` パラメータを指定して起動できます。
複数行のクエリを入力するには、改行の前にバックスラッシュ `\` を入力します。
`Enter` を押すと、クエリの次の行の入力を促されます。
クエリを実行するには、末尾をセミコロンで終わらせてから `Enter` を押します。

ClickHouse Client は `replxx`（`readline` に類似）をベースにしているため、なじみのあるキーボードショートカットが使え、履歴も保持します。
履歴はデフォルトで `~/.clickhouse-client-history` に書き込まれます。

クライアントを終了するには、`Ctrl+D` を押すか、クエリの代わりに次のいずれかを入力します。

* `exit` または `exit;`
* `quit` または `quit;`
* `q`、`Q` または `:q`
* `logout` または `logout;`


### クエリ処理情報 {#processing-info}

クエリを処理する際、クライアントは次の情報を表示します。

1.  進捗。デフォルトでは 1 秒間に 10 回を超えて更新されません。
    短時間で完了するクエリでは、進捗が表示されない場合があります。
2.  デバッグ用の、パース後に整形されたクエリ。
3.  指定された形式での結果。
4.  結果の行数、経過時間、およびクエリ処理の平均速度。
    すべてのデータ量は非圧縮データを基準とします。

`Ctrl+C` を押して、実行時間の長いクエリをキャンセルできます。
ただし、サーバー側でリクエストを中断するまで、少し待つ必要があります。
特定の段階では、クエリをキャンセルできない場合があります。
待たずにもう一度 `Ctrl+C` を押すと、クライアントは終了します。

ClickHouse Client では、クエリ用に外部データ（外部一時テーブル）を渡すことができます。
詳細については、[External data for query processing](../engines/table-engines/special/external-data.md) セクションを参照してください。

### エイリアス {#cli_aliases}

REPL 内では、次のエイリアスを使用できます。

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 最後のクエリを再実行する

### キーボードショートカット {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 現在のクエリをエディタで開きます。使用するエディタは環境変数 `EDITOR` で指定できます。デフォルトでは `vim` が使用されます。
- `Alt (Option) + #` - 行をコメントアウトします。
- `Ctrl + r` - 履歴をファジー検索します。

利用可能なすべてのキーボードショートカットの一覧は [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262) にあります。

:::tip
macOS で Meta キー (Option) を正しく動作させるには:

iTerm2: Preferences -> Profile -> Keys -> Left Option key を開き、Esc+ を選択します。
:::

## バッチモード {#batch-mode}

### バッチモードの使用 {#using-batch-mode}

対話的に ClickHouse Client を使用する代わりに、バッチモードで実行することもできます。
バッチモードでは、ClickHouse は単一のクエリを実行してすぐに終了し、対話的なプロンプトやループはありません。

次のように単一のクエリを指定できます：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

`--query` コマンドラインオプションを使うこともできます。

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

`stdin` からクエリを指定できます。

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

テーブル `messages` が既に存在する場合、コマンドラインからデータを挿入することもできます。

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query` が指定されている場合、入力は改行文字の後にリクエストへ追加されます。`


### リモート ClickHouse サービスへの CSV ファイルの挿入 {#cloud-example}

この例では、サンプルデータセットの CSV ファイル `cell_towers.csv` を、`default` データベース内の既存テーブル `cell_towers` に挿入します。

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
次の例では、バッチモードで 2 行の CSV データを ClickHouse テーブルに挿入します。

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

以下の例では、`cat <<_EOF` がヒアドキュメントを開始し、再び `_EOF` が現れるまでの内容をすべて読み取ってから、その内容を出力します。

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

次の例では、`cat` を使って file.csv の内容を標準出力に表示し、その出力をパイプして `clickhouse-client` の入力として渡します。

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

バッチモードでは、デフォルトのデータ[フォーマット](formats.md)は `TabSeparated` です。
上の例に示したように、クエリの `FORMAT` 句でフォーマットを指定できます。


## パラメータ付きクエリ {#cli-queries-with-parameters}

クエリ内でパラメータを指定し、コマンドラインオプションを使って値を渡すことができます。
これにより、クライアント側で特定の動的な値を埋め込んでクエリを組み立てる必要がなくなります。
例えば:

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

[対話型セッション](#interactive-mode)内からパラメータを指定することもできます。

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

クエリ内で、コマンドラインパラメータで埋め込みたい値を、次の形式で波かっこで囲んで記述します。

```sql
{<name>:<data type>}
```

| Parameter   | Description                                                                                                                                                                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | プレースホルダー識別子。対応するコマンドラインオプションは `--param_<name> = value` です。                                                                                                                                                                                                                                                                    |
| `data type` | パラメータの[データ型](../sql-reference/data-types/index.md)。<br /><br />たとえば、`(integer, ('string', integer))` のようなデータ構造は `Tuple(UInt8, Tuple(String, UInt8))` というデータ型を持つことができます（他の [integer](../sql-reference/data-types/int-uint.md) 型も使用できます）。<br /><br />テーブル名、データベース名、カラム名をパラメータとして渡すこともでき、その場合はデータ型として `Identifier` を使用する必要があります。 |


### 使用例 {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```


## AI を活用した SQL 生成 {#ai-sql-generation}

ClickHouse Client には、自然言語での説明から SQL クエリを生成するための AI 支援機能が組み込まれています。この機能により、ユーザーは高度な SQL の知識がなくても複雑なクエリを作成できます。

AI 支援機能は、`OPENAI_API_KEY` または `ANTHROPIC_API_KEY` のいずれかの環境変数が設定されていれば、追加の設定なしですぐに利用できます。より高度な設定については、[設定](#ai-sql-generation-configuration) セクションを参照してください。

### 使用方法 {#ai-sql-generation-usage}

AI SQL 生成を利用するには、自然言語クエリの先頭に `??` を付けてください。

```bash
:) ?? show all users who made purchases in the last 30 days
```

AI は次のことを行います。

1. データベーススキーマを自動的に解析する
2. 検出したテーブルとカラムに基づいて適切な SQL を生成する
3. 生成したクエリを即座に実行する


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

AI SQL 生成を利用するには、ClickHouse Client の設定ファイルで AI プロバイダーを設定する必要があります。OpenAI、Anthropic、またはその他の OpenAI 互換 API サービスを使用できます。

#### 環境変数によるフォールバック {#ai-sql-generation-fallback}

設定ファイルで AI の設定が指定されていない場合、ClickHouse Client は自動的に環境変数を参照しようとします:

1. まず `OPENAI_API_KEY` 環境変数を確認します
2. 見つからない場合は `ANTHROPIC_API_KEY` 環境変数を確認します
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
* `~/.clickhouse-client/config.xml`（XML 形式、レガシーな場所）
* `~/.clickhouse-client/config.yaml`（YAML 形式、レガシーな場所）
* または `--config-file` で任意の場所を指定します

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- 必須: API キー（または環境変数で設定） -->
            <api_key>your-api-key-here</api_key>

            <!-- 必須: プロバイダータイプ (openai, anthropic) -->
            <provider>openai</provider>

            <!-- 使用するモデル（デフォルトはプロバイダーにより異なる） -->
            <model>gpt-4o</model>

            <!-- オプション: OpenAI 互換サービス用のカスタム API エンドポイント -->
            <!-- <base_url>https://openrouter.ai/api</base_url> -->

            <!-- スキーマ探索に関する設定 -->
            <enable_schema_access>true</enable_schema_access>

            <!-- 生成パラメーター -->
            <temperature>0.0</temperature>
            <max_tokens>1000</max_tokens>
            <timeout_seconds>30</timeout_seconds>
            <max_steps>10</max_steps>

            <!-- オプション: カスタム system プロンプト -->
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

      # 必須: プロバイダータイプ (openai, anthropic)
      provider: openai

      # 使用するモデル
      model: gpt-4o

      # オプション: OpenAI 互換サービス用のカスタム API エンドポイント
      # base_url: https://openrouter.ai/api

      # スキーマアクセスを有効化 - AI にデータベース/テーブル情報の照会を許可
      enable_schema_access: true

      # 生成パラメーター
      temperature: 0.0      # ランダム性を制御 (0.0 = 決定的)
      max_tokens: 1000      # 応答の最大長
      timeout_seconds: 30   # リクエストのタイムアウト
      max_steps: 10         # スキーマ探索の最大ステップ数

      # オプション: カスタム system プロンプト
      # system_prompt: |
      #   You are an expert ClickHouse SQL assistant. Convert natural language to SQL.
      #   Focus on performance and use ClickHouse-specific optimizations.
      #   Always return executable SQL without explanations.
    ```
  </TabItem>
</Tabs>

<br />

**OpenAI 互換 API（例: OpenRouter）の利用:**

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

<details>
<summary>必須パラメータ</summary>

- `api_key` - AI サービス用の API キー。環境変数で設定されている場合は省略可能:
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - 注: 設定ファイル内の API キーが環境変数より優先されます
- `provider` - AI プロバイダー: `openai` または `anthropic`
  - 省略時は、利用可能な環境変数に基づいて自動的にフォールバックされます

</details>

<details>
<summary>モデル設定</summary>

- `model` - 使用するモデル（デフォルト: プロバイダーごとのデフォルト値）
  - OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` など
  - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` など
  - OpenRouter: `anthropic/claude-3.5-sonnet` のような OpenRouter 側のモデル名を使用

</details>

<details>
<summary>接続設定</summary>

- `base_url` - OpenAI 互換サービス向けのカスタム API エンドポイント（オプション）
- `timeout_seconds` - リクエストのタイムアウト秒数（デフォルト: `30`）

</details>

<details>
<summary>スキーマ探索</summary>

- `enable_schema_access` - AI にデータベーススキーマの探索を許可（デフォルト: `true`）
- `max_steps` - スキーマ探索時のツール呼び出しステップ数の上限（デフォルト: `10`）

</details>

<details>
<summary>生成パラメータ</summary>

- `temperature` - ランダム性の制御。0.0 = 決定的、1.0 = 創造的（デフォルト: `0.0`）
- `max_tokens` - 応答の最大トークン数（デフォルト: `1000`）
- `system_prompt` - AI へのカスタム指示（オプション）

</details>

### 仕組み {#ai-sql-generation-how-it-works}

AI SQL ジェネレーターは、複数のステップからなるプロセスで動作します：

<VerticalStepper headerLevel="list">

1. **スキーマ検出**

AI は組み込みツールを使ってデータベースを探索します
- 利用可能なデータベースを一覧表示する
- 関連するデータベース内のテーブルを検出する
- `CREATE TABLE` 文を用いてテーブル構造を確認する

2. **クエリ生成**

検出されたスキーマに基づき、AI は次のような SQL を生成します：
- 自然言語での意図に合致している
- 正しいテーブル名とカラム名を使用している
- 適切な結合と集約処理を適用している

3. **実行**

生成された SQL は自動的に実行され、その結果が表示されます

</VerticalStepper>

### 制限事項 {#ai-sql-generation-limitations}

- 常時インターネット接続が必要です
- API の利用には、AI プロバイダーによるレート制限およびコストが発生します
- 複雑なクエリには複数回の調整が必要になる場合があります
- AI はスキーマ情報に対して読み取り専用でのみアクセスでき、実データにはアクセスできません

### セキュリティ {#ai-sql-generation-security}

- API キーが ClickHouse サーバーに送信されることはありません
- AI が参照するのはスキーマ情報（テーブル名／カラム名およびその型）のみで、実データにはアクセスしません
- 生成されるすべてのクエリは、既存のデータベース権限に従います

## 接続文字列 {#connection_string}

### 利用方法 {#connection-string-usage}

ClickHouse クライアントは、[MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) と同様の接続文字列を使用して ClickHouse サーバーに接続する方法もサポートしています。構文は次のとおりです。

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| Component (all optional) | Description                                                                                              | Default          |
| ------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `user`                   | データベースのユーザー名。                                                                                            | `default`        |
| `password`               | データベースユーザーのパスワード。`:` が指定されていてパスワードが空の場合、クライアントはユーザーのパスワードの入力を求めます。                                       | -                |
| `hosts_and_ports`        | ホストおよび任意のポートのリスト `host[:port] [, host:[port]], ...`。                                                     | `localhost:9000` |
| `database`               | データベース名。                                                                                                 | `default`        |
| `query_parameters`       | キーと値からなるペアのリスト `param1=value1[,&param2=value2], ...`。一部のパラメータでは値を指定する必要はありません。パラメータ名および値は大文字と小文字が区別されます。 | -                |


### 注意事項 {#connection-string-notes}

接続文字列で username、password、database のいずれかを指定した場合、それらを `--user`、`--password`、`--database` で指定することはできません（その逆も同様です）。

host コンポーネントには、ホスト名または IPv4 / IPv6 アドレスのいずれかを指定できます。
IPv6 アドレスは角括弧で囲む必要があります：

```text
clickhouse://[2001:db8::1234]
```

接続文字列には複数のホストを含めることができます。
ClickHouse Client は、これらのホストへ左から右へ順に接続を試行します。
一度接続が確立されると、残りのホストへの接続は試行されません。

接続文字列は `clickHouse-client` の最初の引数として指定する必要があります。
接続文字列は、`--host` と `--port` を除く任意の数の他の[コマンドラインオプション](#command-line-options)と組み合わせて指定できます。

`query_parameters` では次のキーが使用できます:

| Key               | Description                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `secure` (or `s`) | 指定された場合、クライアントはセキュア接続 (TLS) を使用してサーバーに接続します。詳細は [コマンドラインオプション](#command-line-options) の `--secure` を参照してください。 |

**パーセントエンコード**

次のパラメータに含まれる US-ASCII 以外の文字、空白、および特殊文字は、[パーセントエンコード](https://en.wikipedia.org/wiki/URL_encoding)する必要があります:

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

ユーザー `john` として、パスワード `secret` を使用し、ホスト `127.0.0.1`、ポート `9000` で `localhost` に接続します

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

`default` ユーザーとして、IPv6 アドレス `[::1]` でポート `9000` のホスト `localhost` に接続します。

```bash
clickhouse-client clickhouse://[::1]:9000
```

マルチラインモードで、ポート 9000 で `localhost` に接続します。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

ポート 9000 を使用し、ユーザー `default` として `localhost` に接続します。

```bash
clickhouse-client clickhouse://default@localhost:9000

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

ポート 9000 で `localhost` に接続し、デフォルトデータベースを `my_database` に設定します。

```bash
clickhouse-client clickhouse://localhost:9000/my_database

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

接続文字列で指定された `my_database` をデフォルトデータベースとして、ポート 9000 の `localhost` に接続し、省略形の `s` パラメータを使用してセキュアな接続を確立します。

```bash
clickhouse-client clickhouse://localhost/my_database?s

# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

ホスト、ポート、ユーザー、データベースはいずれもデフォルト設定のものを使用して接続します。

```bash
clickhouse-client clickhouse:
```

デフォルトのホストにデフォルトのポートで、ユーザー `my_user` としてパスワードなしで接続します。

```bash
clickhouse-client clickhouse://my_user@

# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

メールアドレスをユーザー名として指定し、`localhost` に接続します。`@` 記号は `%40` にパーセントエンコードされます。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

`192.168.1.15` または `192.168.1.25` のいずれかのホストに接続します。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```


## クエリ ID の形式 {#query-id-format}

インタラクティブモードでは、ClickHouse Client は実行するすべてのクエリごとにクエリ ID を表示します。デフォルトでは、ID は次のような形式です。

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

カスタムフォーマットは、設定ファイル内の `query_id_formats` タグ内で指定できます。フォーマット文字列中の `{query_id}` プレースホルダーはクエリ ID に置き換えられます。タグ内には複数のフォーマット文字列を指定できます。
この機能は、クエリのプロファイリングを容易にするための URL を生成するために利用できます。

**例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

上記の設定の場合、クエリ ID は次の形式で表示されます。

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```


## 設定ファイル {#configuration_files}

ClickHouse Client は、以下の場所をこの順に検索し、最初に見つかったファイルを使用します。

- `-c [ -C, --config, --config-file ]` パラメーターで指定されたファイル
- `./clickhouse-client.[xml|yaml|yml]`
- `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]`（`XDG_CONFIG_HOME` が設定されていない場合は `~/.config/clickhouse/config.[xml|yaml|yml]`）
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

ClickHouse リポジトリ内のサンプル設定ファイルを参照してください。[`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

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

ユーザー名、パスワードおよびホストは、環境変数 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_HOST` で設定できます。
コマンドライン引数 `--user`、`--password`、`--host`、または（指定されている場合は）[接続文字列](#connection_string) が、環境変数よりも優先されて使用されます。

## コマンドラインオプション {#command-line-options}

すべてのコマンドラインオプションは、コマンドラインから直接指定するか、[設定ファイル](#configuration_files)内で既定値として定義できます。

### 一般オプション {#command-line-options-general}

| Option                                              | Description                                                                                                                        | Default                      |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| `-c [ -C, --config, --config-file ] <path-to-file>` | クライアント用の設定ファイルの場所を指定します。設定ファイルがデフォルトのいずれの場所にも存在しない場合に使用します。[Configuration Files](#configuration_files) を参照してください。 | -                            |
| `--help`                                            | 使用方法の概要を表示して終了します。`--verbose` と組み合わせると、クエリ設定を含む利用可能なすべてのオプションを表示します。                  | -                            |
| `--history_file <path-to-file>`                     | コマンド履歴を保存するファイルへのパスを指定します。                                                                                     | -                            |
| `--history_max_entries`                             | 履歴ファイル内のエントリ数の最大値を指定します。                                                                                     | `1000000` (100万)        |
| `--prompt <prompt>`                                 | カスタムプロンプトを指定します。                                                                                                           | サーバーの `display_name` |
| `--verbose`                                         | 出力の詳細度を上げます。                                                                                                         | -                            |
| `-V [ --version ]`                                  | バージョンを表示して終了します。                                                                                                            | -                            |

### 接続オプション {#command-line-options-connection}

| Option                           | Description                                                                                                                                                                                                                                                                                                                        | Default                                                                                                          |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `--connection <name>`            | 設定ファイルで事前定義された接続設定の名前。[Connection credentials](#connection-credentials) を参照してください。                                                                                                                                                                                                                | -                                                                                                                |
| `-d [ --database ] <database>`   | この接続でデフォルトとして使用するデータベースを選択します。                                                                                                                                                                                                                                                                        | サーバー設定での現在のデータベース（デフォルトでは `default`）                                                  |
| `-h [ --host ] <host>`           | 接続先の ClickHouse サーバーのホスト名。ホスト名または IPv4 / IPv6 アドレスを指定できます。複数ホストは複数の引数として指定できます。                                                                                                                                                                                            | `localhost`                                                                                                      |
| `--jwt <value>`                  | 認証に JSON Web Token (JWT) を使用します。<br/><br/>サーバー側の JWT 認可は ClickHouse Cloud でのみ利用可能です。                                                                                                                                                                                                                | -                                                                                                                |
| `login`                          | IDP を介して認証するために、デバイス認可（device grant）OAuth フローを起動します。<br/><br/>ClickHouse Cloud のホストの場合、OAuth 変数は自動的に決定されますが、それ以外の場合は `--oauth-url`、`--oauth-client-id`、`--oauth-audience` で指定する必要があります。                                                                                                                | -                                                                                                                |
| `--no-warnings`                  | クライアントがサーバーに接続する際に、`system.warnings` からの警告表示を無効にします。                                                                                                                                                                                                                                              | -                                                                                                                |
| `--no-server-client-version-message`                  | クライアントがサーバーに接続する際に、サーバーとクライアントのバージョン不一致メッセージを抑止します。                                                                                                                                                                                                                          | -                                                                                                                |
| `--password <password>`          | データベースユーザーのパスワード。パスワードは設定ファイルで接続ごとに指定することもできます。パスワードを指定しない場合、クライアントは対話的にパスワードを要求します。                                                                                                                                                         | -                                                                                                                |
| `--port <port>`                  | サーバーが接続を受け付けるポート番号です。デフォルトのポートは 9440（TLS）および 9000（非 TLS）です。<br/><br/>注: クライアントは HTTP(S) ではなくネイティブプロトコルを使用します。                                                                                                                                             | `--secure` が指定されている場合は `9440`、それ以外は `9000`。ホスト名が `.clickhouse.cloud` で終わる場合は常に `9440` がデフォルト。 |
| `-s [ --secure ]`                | TLS を使用するかどうかを指定します。<br/><br/>ポート 9440（デフォルトのセキュアポート）または ClickHouse Cloud に接続する場合は自動的に有効になります。<br/><br/>[configuration file](#configuration_files) で CA 証明書を設定する必要がある場合があります。利用可能な設定は [server-side TLS configuration](../operations/server-configuration-parameters/settings.md#openssl) と同じです。 | ポート 9440 または ClickHouse Cloud に接続する際に自動的に有効化                                                |
| `--ssh-key-file <path-to-file>`  | サーバーへの認証に使用する SSH 秘密鍵を含むファイル。                                                                                                                                                                                                                                                                               | -                                                                                                                |
| `--ssh-key-passphrase <value>`   | `--ssh-key-file` で指定された SSH 秘密鍵のパスフレーズ。                                                                                                                                                                                                                                                                           | -                                                                                                                |
| `-u [ --user ] <username>`       | 接続に使用するデータベースユーザー。                                                                                                                                                                                                                                                                                               | `default`                                                                                                        |

:::note
`--host`、`--port`、`--user`、`--password` オプションの代わりに、クライアントは [connection strings](#connection_string) にも対応しています。
:::

### クエリオプション {#command-line-options-query}

| Option                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--param_<name>=<value>`        | [パラメータ付きクエリ](#cli-queries-with-parameters) のパラメータに対する置換値。                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `-q [ --query ] <query>`        | バッチモードで実行するクエリ。複数回指定できます（`--query "SELECT 1" --query "SELECT 2"`）、またはセミコロン区切りで複数のクエリを一度に指定できます（`--query "SELECT 1; SELECT 2;"`）。後者の場合、`VALUES` 形式以外の `INSERT` クエリは空行で区切る必要があります。<br/><br/>単一のクエリはパラメータなしでも指定できます: `clickhouse-client "SELECT 1"` <br/><br/>`--queries-file` と同時には使用できません。                               |
| `--queries-file <path-to-file>` | クエリを含むファイルへのパス。`--queries-file` は複数回指定できます（例: `--queries-file queries1.sql --queries-file queries2.sql`）。<br/><br/>`--query` と同時には使用できません。                                                                                                                                                                                                                                                                                                              |
| `-m [ --multiline ]`            | 指定した場合、複数行のクエリを許可します（Enter キーでクエリを送信しません）。クエリは末尾がセミコロンで終わったときにのみ送信されます。                                                                                                                                                                                                                                                                                                                        |

### クエリ設定 {#command-line-options-query-settings}

クエリ設定は、たとえばクライアントでコマンドラインオプションとして指定できます。

```bash
$ clickhouse-client --max_threads 1
```

設定項目の一覧は [Settings](../operations/settings/settings.md) を参照してください。


### フォーマットオプション {#command-line-options-formatting}

| Option                    | Description                                                                                                                                                                                                                   | Default        |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| `-f [ --format ] <format>` | 結果を指定したフォーマットで出力します。<br/><br/>サポートされているフォーマットの一覧については、[入力および出力データのフォーマット](formats.md) を参照してください。                                                   | `TabSeparated` |
| `--pager <command>`       | すべての出力をこのコマンドにパイプします。通常は `less`（例: 幅の広い結果セットを表示するための `less -S`）などを指定します。                                                                                                     | -              |
| `-E [ --vertical ]`       | 結果の出力に [Vertical フォーマット](/interfaces/formats/Vertical) を使用します。これは `–-format Vertical` と同じです。このフォーマットでは各値が個別の行に出力されるため、横に長いテーブルを表示する際に有用です。                           | -              |

### 実行に関する詳細 {#command-line-options-execution-details}

| Option                            | Description                                                                                                                                                                                                                                                                                                         | Default                                                             |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `--enable-progress-table-toggle`  | Control+Space キーを押して progress table の表示／非表示を切り替えられるようにします。progress table の出力が有効な対話モードでのみ有効です。                                                                                                                                                                           | `enabled`                                                           |
| `--hardware-utilization`          | progress bar にハードウェア使用率情報を出力します。                                                                                                                                                                                                                                                                 | -                                                                   |
| `--memory-usage`                  | 指定した場合、非対話モードでメモリ使用量を `stderr` に出力します。<br/><br/>指定可能な値: <br/>• `none` - メモリ使用量を出力しない <br/>• `default` - バイト数を出力する <br/>• `readable` - メモリ使用量を人間が読みやすい形式で出力する                                                                | -                                                                   |
| `--print-profile-events`          | `ProfileEvents` パケットを出力します。                                                                                                                                                                                                                                                                               | -                                                                   |
| `--progress`                      | クエリ実行の進行状況を出力します。<br/><br/>指定可能な値: <br/>• `tty\|on\|1\|true\|yes` - 対話モードで端末に出力する <br/>• `err` - 非対話モードで `stderr` に出力する <br/>• `off\|0\|false\|no` - 進行状況の出力を無効にする                                                                                           | 対話モードでは `tty`、非対話（バッチ）モードでは `off`             |
| `--progress-table`                | クエリ実行中に変化するメトリクスを含む progress table を出力します。<br/><br/>指定可能な値: <br/>• `tty\|on\|1\|true\|yes` - 対話モードで端末に出力する <br/>• `err` - 非対話モードで `stderr` に出力する <br/>• `off\|0\|false\|no` - progress table の出力を無効にする                                       | 対話モードでは `tty`、非対話（バッチ）モードでは `off`             |
| `--stacktrace`                    | 例外のスタックトレースを出力します。                                                                                                                                                                                                                                                                                 | -                                                                   |
| `-t [ --time ]`                   | 非対話モードでクエリ実行時間を `stderr` に出力します（ベンチマーク用途）。                                                                                                                                                                                                                                          | -                                                                   |