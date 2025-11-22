---
description: 'ClickHouse コマンドラインクライアントインターフェイスのドキュメント'
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
このクライアントは、対話的にクエリを実行するインタラクティブモードと、スクリプトや自動化で利用するバッチモードの両方をサポートします。
クエリ結果はターミナル上に表示することも、ファイルにエクスポートすることもでき、Pretty、CSV、JSON など、すべての ClickHouse 出力[フォーマット](formats.md)をサポートします。

このクライアントは、プログレスバーや読み取られた行数、処理されたバイト数、クエリ実行時間などを用いて、クエリ実行に関するリアルタイムのフィードバックを提供します。
また、[コマンドラインオプション](#command-line-options)と[設定ファイル](#configuration_files)の両方をサポートしています。


## インストール {#install}

ClickHouseをダウンロードするには、以下を実行します:

```bash
curl https://clickhouse.com/ | sh
```

インストールする場合は、以下を実行します:

```bash
sudo ./clickhouse install
```

その他のインストールオプションについては、[ClickHouseのインストール](../getting-started/install/install.mdx)を参照してください。

クライアントとサーバーのバージョンが異なる場合でも互換性はありますが、古いクライアントでは一部の機能が利用できない可能性があります。クライアントとサーバーには同じバージョンを使用することを推奨します。


## 実行 {#run}

:::note
ClickHouseをダウンロードのみでインストールしていない場合は、`clickhouse-client`の代わりに`./clickhouse client`を使用してください。
:::

ClickHouseサーバーに接続するには、次のコマンドを実行します:

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

必要に応じて追加の接続詳細を指定します:

| オプション                           | 説明                                                                                                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--port <port>`                  | ClickHouseサーバーが接続を受け付けるポート。デフォルトポートは9440(TLS)と9000(TLS無し)です。ClickHouse ClientはHTTP(S)ではなくネイティブプロトコルを使用することに注意してください。 |
| `-s [ --secure ]`                | TLSを使用するかどうか(通常は自動検出されます)。                                                                                                                                        |
| `-u [ --user ] <username>`       | 接続するデータベースユーザー。デフォルトでは`default`ユーザーとして接続します。                                                                                                       |
| `--password <password>`          | データベースユーザーのパスワード。設定ファイルで接続のパスワードを指定することもできます。パスワードを指定しない場合、クライアントが入力を求めます。  |
| `-c [ --config ] <path-to-file>` | ClickHouse Clientの設定ファイルの場所(デフォルトの場所にない場合)。[設定ファイル](#configuration_files)を参照してください。                      |
| `--connection <name>`            | [設定ファイル](#connection-credentials)から事前設定された接続詳細の名前。                                                                              |

コマンドラインオプションの完全なリストについては、[コマンドラインオプション](#command-line-options)を参照してください。

### ClickHouse Cloudへの接続 {#connecting-cloud}

ClickHouse Cloudサービスの詳細は、ClickHouse Cloudコンソールで確認できます。接続したいサービスを選択し、**Connect**をクリックします:

<Image
  img={cloud_connect_button}
  size='md'
  alt='ClickHouse Cloudサービス接続ボタン'
/>

<br />
<br />

**Native**を選択すると、`clickhouse-client`コマンドの例とともに詳細が表示されます:

<Image
  img={connection_details_native}
  size='md'
  alt='ClickHouse Cloud Native TCP接続詳細'
/>

### 設定ファイルへの接続情報の保存 {#connection-credentials}

1つ以上のClickHouseサーバーの接続詳細を[設定ファイル](#configuration_files)に保存できます。

形式は次のようになります:

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

詳細については、[設定ファイルのセクション](#configuration_files)を参照してください。

:::note
クエリ構文に集中するため、以降の例では接続詳細(`--host`、`--port`など)を省略しています。コマンドを使用する際は、これらを追加することを忘れないでください。
:::


## 対話モード {#interactive-mode}

### 対話モードの使用 {#using-interactive-mode}

ClickHouseを対話モードで実行するには、次のコマンドを実行します：

```bash
clickhouse-client
```

これにより、SQLクエリを対話的に入力できるRead-Eval-Print Loop（REPL）が開きます。
接続されると、クエリを入力できるプロンプトが表示されます：

```bash
ClickHouse client version 25.x.x.x
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 25.x.x.x

hostname :)
```

対話モードでは、デフォルトの出力形式は`PrettyCompact`です。
クエリの`FORMAT`句で形式を変更するか、`--format`コマンドラインオプションを指定することで形式を変更できます。
Vertical形式を使用するには、`--vertical`を使用するか、クエリの末尾に`\G`を指定します。
この形式では、各値が別々の行に出力されるため、幅の広いテーブルに便利です。

対話モードでは、デフォルトで`Enter`キーを押すと入力された内容が実行されます。
クエリの末尾にセミコロンは必要ありません。

クライアントは`-m, --multiline`パラメータで起動できます。
複数行のクエリを入力するには、改行の前にバックスラッシュ`\`を入力します。
`Enter`キーを押すと、クエリの次の行の入力を求められます。
クエリを実行するには、セミコロンで終了して`Enter`キーを押します。

ClickHouse Clientは`replxx`（`readline`に類似）をベースにしているため、使い慣れたキーボードショートカットを使用でき、履歴を保持します。
履歴はデフォルトで`~/.clickhouse-client-history`に書き込まれます。

クライアントを終了するには、`Ctrl+D`を押すか、クエリの代わりに次のいずれかを入力します：

- `exit` または `exit;`
- `quit` または `quit;`
- `q`、`Q` または `:q`
- `logout` または `logout;`

### クエリ処理情報 {#processing-info}

クエリを処理する際、クライアントは次の情報を表示します：

1.  進行状況。デフォルトでは1秒あたり最大10回更新されます。
    高速なクエリの場合、進行状況が表示される時間がない場合があります。
2.  デバッグ用に、解析後のフォーマットされたクエリ。
3.  指定された形式での結果。
4.  結果の行数、経過時間、およびクエリ処理の平均速度。
    すべてのデータ量は非圧縮データを指します。

長時間実行されるクエリは`Ctrl+C`を押すことでキャンセルできます。
ただし、サーバーがリクエストを中止するまで少し待つ必要があります。
特定の段階ではクエリをキャンセルできません。
待たずに`Ctrl+C`を2回目に押すと、クライアントが終了します。

ClickHouse Clientでは、クエリ用に外部データ（外部一時テーブル）を渡すことができます。
詳細については、[クエリ処理用の外部データ](../engines/table-engines/special/external-data.md)のセクションを参照してください。

### エイリアス {#cli_aliases}

REPL内から次のエイリアスを使用できます：

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 最後のクエリを繰り返す

### キーボードショートカット {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 現在のクエリをエディタで開きます。環境変数`EDITOR`で使用するエディタを指定できます。デフォルトでは`vim`が使用されます。
- `Alt (Option) + #` - 行をコメントアウトします。
- `Ctrl + r` - あいまい履歴検索。

利用可能なすべてのキーボードショートカットの完全なリストは、[replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)で確認できます。

:::tip
MacOSでメタキー（Option）を正しく動作させるための設定：

iTerm2：Preferences -> Profile -> Keys -> Left Option keyに移動し、Esc+をクリックします
:::


## バッチモード {#batch-mode}

### バッチモードの使用 {#using-batch-mode}

ClickHouse Clientを対話的に使用する代わりに、バッチモードで実行することができます。
バッチモードでは、ClickHouseは単一のクエリを実行して即座に終了します。対話的なプロンプトやループはありません。

次のように単一のクエリを指定できます:

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

`--query`コマンドラインオプションを使用することもできます:

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

`stdin`でクエリを提供することもできます:

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

`messages`テーブルが存在する場合、コマンドラインからデータを挿入することもできます:

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query`が指定されている場合、すべての入力は改行の後にリクエストに追加されます。

### リモートClickHouseサービスへのCSVファイルの挿入 {#cloud-example}

この例では、サンプルデータセットのCSVファイル`cell_towers.csv`を、`default`データベースの既存のテーブル`cell_towers`に挿入しています:

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

### コマンドラインからのデータ挿入の例 {#more-examples}

コマンドラインからデータを挿入する方法はいくつかあります。
以下の例では、バッチモードを使用してClickHouseテーブルに2行のCSVデータを挿入しています:

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

以下の例では、`cat <<_EOF`がヒアドキュメントを開始し、再び`_EOF`が現れるまですべてを読み取り、それを出力します:

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

以下の例では、file.csvの内容が`cat`を使用してstdoutに出力され、入力として`clickhouse-client`にパイプされます:

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

バッチモードでは、デフォルトのデータ[フォーマット](formats.md)は`TabSeparated`です。
上記の例に示すように、クエリの`FORMAT`句でフォーマットを設定できます。


## パラメータを使用したクエリ {#cli-queries-with-parameters}

クエリ内でパラメータを指定し、コマンドラインオプションで値を渡すことができます。
これにより、クライアント側で特定の動的な値を使用してクエリをフォーマットする必要がなくなります。
例:

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

[対話モード](#interactive-mode)内からパラメータを設定することも可能です:

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

クエリ内で、コマンドラインパラメータを使用して埋めたい値を、次の形式で中括弧内に配置します:

```sql
{<name>:<data type>}
```

| パラメータ   | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | プレースホルダー識別子。対応するコマンドラインオプションは `--param_<name> = value` です。                                                                                                                                                                                                                                                                                                                                                                              |
| `data type` | パラメータの[データ型](../sql-reference/data-types/index.md)。<br/><br/>例えば、`(integer, ('string', integer))` のようなデータ構造は `Tuple(UInt8, Tuple(String, UInt8))` データ型を持つことができます(他の[整数](../sql-reference/data-types/int-uint.md)型も使用できます)。<br/><br/>テーブル名、データベース名、カラム名をパラメータとして渡すことも可能です。その場合、データ型として `Identifier` を使用する必要があります。 |

### 例 {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```


## AI駆動のSQL生成 {#ai-sql-generation}

ClickHouse Clientには、自然言語の記述からSQLクエリを生成するAIアシスタント機能が組み込まれています。この機能により、SQLの深い知識がなくても複雑なクエリを作成できます。

AIアシスタントは、`OPENAI_API_KEY`または`ANTHROPIC_API_KEY`環境変数のいずれかが設定されていれば、すぐに使用できます。より高度な設定については、[設定](#ai-sql-generation-configuration)セクションを参照してください。

### 使用方法 {#ai-sql-generation-usage}

AI SQL生成を使用するには、自然言語のクエリの前に`??`を付けます:

```bash
:) ?? 過去30日間に購入したすべてのユーザーを表示
```

AIは以下を実行します:

1. データベーススキーマを自動的に探索
2. 検出されたテーブルとカラムに基づいて適切なSQLを生成
3. 生成されたクエリを即座に実行

### 例 {#ai-sql-generation-example}

```bash
:) ?? 製品カテゴリ別に注文数を集計

スキーマ検出を伴うAI SQL生成を開始しています...
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

✨ SQLクエリが正常に生成されました!
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

AI SQL生成を使用するには、ClickHouse Clientの設定ファイルでAIプロバイダーを設定する必要があります。OpenAI、Anthropic、またはOpenAI互換のAPIサービスを使用できます。

#### 環境変数ベースのフォールバック {#ai-sql-generation-fallback}

設定ファイルにAI設定が指定されていない場合、ClickHouse Clientは自動的に環境変数の使用を試みます:

1. まず`OPENAI_API_KEY`環境変数を確認
2. 見つからない場合は`ANTHROPIC_API_KEY`環境変数を確認
3. どちらも見つからない場合、AI機能は無効化されます


これにより、設定ファイルなしですばやくセットアップできます。

```bash
# OpenAIの使用
export OPENAI_API_KEY=your-openai-key
clickhouse-client
```


# Anthropicの使用

export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```

#### 設定ファイル {#ai-sql-generation-configuration-file}

AI設定をより詳細に制御するには、以下の場所にあるClickHouse Clientの設定ファイルで設定します:

- `$XDG_CONFIG_HOME/clickhouse/config.xml` (or `~/.config/clickhouse/config.xml` if `XDG_CONFIG_HOME` is not set) (XML形式)
- `$XDG_CONFIG_HOME/clickhouse/config.yaml` (or `~/.config/clickhouse/config.yaml` if `XDG_CONFIG_HOME` is not set) (YAML形式)
- `~/.clickhouse-client/config.xml` (XML形式、旧ロケーション)
- `~/.clickhouse-client/config.yaml` (YAML形式、旧ロケーション)
- または`--config-file`でカスタムロケーションを指定

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- 必須: APIキー(または環境変数で設定) -->
            <api_key>your-api-key-here</api_key>

            <!-- 必須: プロバイダータイプ(openai, anthropic) -->
            <provider>openai</provider>

            <!-- 使用するモデル(デフォルトはプロバイダーによって異なる) -->
            <model>gpt-4o</model>

            <!-- オプション: OpenAI互換サービス用のカスタムAPIエンドポイント -->
            <!-- <base_url>https://openrouter.ai/api</base_url> -->

            <!-- スキーマ探索設定 -->
            <enable_schema_access>true</enable_schema_access>

            <!-- 生成パラメータ -->
            <temperature>0.0</temperature>
            <max_tokens>1000</max_tokens>
            <timeout_seconds>30</timeout_seconds>
            <max_steps>10</max_steps>

            <!-- オプション: カスタムシステムプロンプト -->
            <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
        </ai>
    </config>
    ```

  </TabItem>
  <TabItem value="yaml" label="YAML">
    ```yaml
    ai:
      # 必須: APIキー(または環境変数で設定)
      api_key: your-api-key-here

      # 必須: プロバイダータイプ(openai, anthropic)
      provider: openai

      # 使用するモデル
      model: gpt-4o

      # オプション: OpenAI互換サービス用のカスタムAPIエンドポイント
      # base_url: https://openrouter.ai/api

      # スキーマアクセスを有効化 - AIによるデータベース/テーブル情報の照会を許可
      enable_schema_access: true

      # 生成パラメータ
      temperature: 0.0      # ランダム性を制御(0.0 = 決定論的)
      max_tokens: 1000      # 最大レスポンス長
      timeout_seconds: 30   # リクエストタイムアウト
      max_steps: 10         # 最大スキーマ探索ステップ数

      # オプション: カスタムシステムプロンプト
      # system_prompt: |
      #   You are an expert ClickHouse SQL assistant. Convert natural language to SQL.
      #   Focus on performance and use ClickHouse-specific optimizations.
      #   Always return executable SQL without explanations.
    ```

  </TabItem>
</Tabs>

<br />

**OpenAI互換API(例: OpenRouter)の使用:**

```yaml
ai:
  provider: openai # 互換性のため'openai'を使用
  api_key: your-openrouter-api-key
  base_url: https://openrouter.ai/api/v1
  model: anthropic/claude-3.5-sonnet # OpenRouterのモデル命名規則を使用
```

**最小限の設定例:**


```yaml
# 最小構成 - APIキーに環境変数を使用
ai:
  provider: openai  # OPENAI_API_KEY環境変数を使用します
```


# 設定が一切ない場合 - 自動フォールバック
# （ai セクションが空、または存在しない場合は、まず OPENAI_API_KEY、その次に ANTHROPIC_API_KEY を使用しようとします）



# モデルのみを上書き - API キーは環境変数を使用

ai:
provider: openai
model: gpt-3.5-turbo

```

### パラメータ {#ai-sql-generation-parameters}

<details>
<summary>必須パラメータ</summary>

- `api_key` - AIサービスのAPIキー。環境変数で設定されている場合は省略可能:
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - 注: 設定ファイル内のAPIキーは環境変数よりも優先されます
- `provider` - AIプロバイダー: `openai` または `anthropic`
  - 省略した場合、利用可能な環境変数に基づいて自動的にフォールバックします

</details>

<details>
<summary>モデル設定</summary>

- `model` - 使用するモデル (デフォルト: プロバイダー固有)
  - OpenAI: `gpt-4o`、`gpt-4`、`gpt-3.5-turbo` など
  - Anthropic: `claude-3-5-sonnet-20241022`、`claude-3-opus-20240229` など
  - OpenRouter: `anthropic/claude-3.5-sonnet` のようなモデル名を使用

</details>

<details>
<summary>接続設定</summary>

- `base_url` - OpenAI互換サービス用のカスタムAPIエンドポイント (オプション)
- `timeout_seconds` - リクエストタイムアウト秒数 (デフォルト: `30`)

</details>

<details>
<summary>スキーマ探索</summary>

- `enable_schema_access` - AIによるデータベーススキーマの探索を許可 (デフォルト: `true`)
- `max_steps` - スキーマ探索のための最大ツール呼び出しステップ数 (デフォルト: `10`)

</details>

<details>
<summary>生成パラメータ</summary>

- `temperature` - ランダム性を制御、0.0 = 決定論的、1.0 = 創造的 (デフォルト: `0.0`)
- `max_tokens` - トークン単位での最大応答長 (デフォルト: `1000`)
- `system_prompt` - AI用のカスタム指示 (オプション)

</details>

### 動作の仕組み {#ai-sql-generation-how-it-works}

AI SQLジェネレーターは複数ステップのプロセスを使用します:

<VerticalStepper headerLevel="list">

1. **スキーマ検出**

AIは組み込みツールを使用してデータベースを探索します
- 利用可能なデータベースを一覧表示
- 関連するデータベース内のテーブルを検出
- `CREATE TABLE` 文を介してテーブル構造を調査

2. **クエリ生成**

検出されたスキーマに基づいて、AIは以下のようなSQLを生成します:
- 自然言語の意図に合致
- 正しいテーブル名とカラム名を使用
- 適切な結合と集約を適用

3. **実行**

生成されたSQLは自動的に実行され、結果が表示されます

</VerticalStepper>

### 制限事項 {#ai-sql-generation-limitations}

- アクティブなインターネット接続が必要
- APIの使用はAIプロバイダーのレート制限とコストの対象となります
- 複雑なクエリは複数回の改良が必要な場合があります
- AIはスキーマ情報への読み取り専用アクセスのみを持ち、実際のデータにはアクセスできません

### セキュリティ {#ai-sql-generation-security}

- APIキーはClickHouseサーバーに送信されることはありません
- AIはスキーマ情報(テーブル/カラム名と型)のみを参照し、実際のデータは参照しません
- 生成されたすべてのクエリは既存のデータベース権限を尊重します
```


## 接続文字列 {#connection_string}

### 使用方法 {#connection-string-usage}

ClickHouse Clientは、[MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri)と同様の接続文字列を使用したClickHouseサーバーへの接続もサポートしています。構文は以下の通りです:

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| コンポーネント(すべて任意) | 説明                                                                                                                                              | デフォルト          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `user`                   | データベースのユーザー名。                                                                                                                                       | `default`        |
| `password`               | データベースユーザーのパスワード。`:`が指定されパスワードが空白の場合、クライアントはユーザーのパスワード入力を求めます。                                   | -                |
| `hosts_and_ports`        | ホストと任意のポートのリスト `host[:port] [, host:[port]], ...`。                                                                                     | `localhost:9000` |
| `database`               | データベース名。                                                                                                                                           | `default`        |
| `query_parameters`       | キーと値のペアのリスト `param1=value1[,&param2=value2], ...`。一部のパラメータでは値の指定は不要です。パラメータ名と値は大文字小文字を区別します。 | -                |

### 注意事項 {#connection-string-notes}

接続文字列でユーザー名、パスワード、またはデータベースが指定されている場合、`--user`、`--password`、または`--database`を使用して指定することはできません(逆も同様です)。

ホストコンポーネントには、ホスト名、IPv4アドレス、またはIPv6アドレスを指定できます。
IPv6アドレスは角括弧で囲む必要があります:

```text
clickhouse://[2001:db8::1234]
```

接続文字列には複数のホストを含めることができます。
ClickHouse Clientは、これらのホストに順番に(左から右へ)接続を試みます。
接続が確立された後は、残りのホストへの接続試行は行われません。

接続文字列は`clickHouse-client`の最初の引数として指定する必要があります。
接続文字列は、`--host`と`--port`を除く任意の数の他の[コマンドラインオプション](#command-line-options)と組み合わせることができます。

`query_parameters`には以下のキーを使用できます:

| キー               | 説明                                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secure` (または `s`) | 指定された場合、クライアントは安全な接続(TLS)を介してサーバーに接続します。[コマンドラインオプション](#command-line-options)の`--secure`を参照してください。 |

**パーセントエンコーディング**

以下のパラメータ内の非US ASCII文字、スペース、特殊文字は[パーセントエンコーディング](https://en.wikipedia.org/wiki/URL_encoding)する必要があります:

- `user`
- `password`
- `hosts`
- `database`
- `query parameters`

### 例 {#connection_string_examples}

ポート9000で`localhost`に接続し、クエリ`SELECT 1`を実行します。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

ユーザー`john`、パスワード`secret`として、ホスト`127.0.0.1`、ポート`9000`に接続します

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

`default`ユーザーとして、IPv6アドレス`[::1]`のホスト、ポート`9000`に接続します。

```bash
clickhouse-client clickhouse://[::1]:9000
```

複数行モードでポート9000の`localhost`に接続します。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

ユーザー`default`としてポート9000を使用して`localhost`に接続します。

```bash
clickhouse-client clickhouse://default@localhost:9000

```


# 同等のコマンド：

clickhouse-client clickhouse://localhost:9000 --user default

````

`localhost`のポート9000に接続し、`my_database`データベースをデフォルトとして使用します。

```bash
clickhouse-client clickhouse://localhost:9000/my_database
````


# 同等のコマンド:

clickhouse-client clickhouse://localhost:9000 --database my&#95;database

````

`localhost`のポート9000に接続し、接続文字列で指定された`my_database`データベースをデフォルトとし、短縮パラメータ`s`を使用してセキュア接続を行います。

```bash
clickhouse-client clickhouse://localhost/my_database?s
````


# 以下と同等:

clickhouse-client clickhouse://localhost/my&#95;database -s

````

デフォルトのホスト、ポート、ユーザー、データベースを使用して接続します。

```bash
clickhouse-client clickhouse:
````

デフォルトのホストにデフォルトのポートで、ユーザー `my_user` としてパスワードなしで接続します。

```bash
clickhouse-client clickhouse://my_user@
```


# : と @ の間を空のパスワードのままにしておくと、接続を開始する前にユーザーにパスワードの入力を求めることになります。

clickhouse-client clickhouse://my&#95;user:@

````

メールアドレスをユーザー名として使用して`localhost`に接続します。`@`記号はパーセントエンコードされて`%40`になります。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
````

次のいずれかのホストに接続します: `192.168.1.15`, `192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```


## クエリID形式 {#query-id-format}

対話モードでは、ClickHouse Clientは各クエリのクエリIDを表示します。デフォルトでは、IDは次のように形式化されます:

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

カスタム形式は、設定ファイル内の`query_id_formats`タグで指定できます。形式文字列内の`{query_id}`プレースホルダーはクエリIDに置き換えられます。タグ内には複数の形式文字列を指定できます。
この機能を使用して、クエリのプロファイリングを容易にするURLを生成できます。

**例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

上記の設定では、クエリのIDは次の形式で表示されます:

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```


## 設定ファイル {#configuration_files}

ClickHouse Clientは、以下のファイルのうち最初に存在するものを使用します:

- `-c [ -C, --config, --config-file ]`パラメータで定義されたファイル
- `./clickhouse-client.[xml|yaml|yml]`
- `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]` (`XDG_CONFIG_HOME`が設定されていない場合は`~/.config/clickhouse/config.[xml|yaml|yml]`)
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

ClickHouseリポジトリのサンプル設定ファイルを参照してください: [`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

<Tabs>
  <TabItem value='xml' label='XML' default>
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
  <TabItem value='yaml' label='YAML'>
    ```yaml user: username password: 'password' secure: true openSSL: client:
    caConfig: '/etc/ssl/cert.pem' ```
  </TabItem>
</Tabs>


## 環境変数オプション {#environment-variable-options}

ユーザー名、パスワード、ホストは環境変数 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_HOST` で設定できます。
コマンドライン引数 `--user`、`--password`、`--host`、または[接続文字列](#connection_string)(指定された場合)は環境変数よりも優先されます。


## コマンドラインオプション {#command-line-options}

すべてのコマンドラインオプションは、コマンドライン上で直接指定するか、[設定ファイル](#configuration_files)内でデフォルト値として指定できます。

### 一般オプション {#command-line-options-general}

| オプション                                          | 説明                                                                                                                                                  | デフォルト                       |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `-c [ -C, --config, --config-file ] <path-to-file>` | クライアント用設定ファイルがデフォルト以外の場所にある場合に、そのファイルの場所を指定します。詳細は [Configuration Files](#configuration_files) を参照してください。 | -                                |
| `--help`                                            | 使用方法の概要を表示して終了します。`--verbose` と組み合わせると、クエリ設定を含むすべての利用可能なオプションを表示します。                             | -                                |
| `--history_file <path-to-file>`                     | コマンド履歴を保持するファイルへのパスを指定します。                                                                                                  | -                                |
| `--history_max_entries`                             | 履歴ファイルに保存するエントリの最大数を指定します。                                                                                                   | `1000000` (100万)                |
| `--prompt <prompt>`                                 | カスタムプロンプトを指定します。                                                                                                                      | サーバーの `display_name`        |
| `--verbose`                                         | 出力の詳細度を上げます。                                                                                                                              | -                                |
| `-V [ --version ]`                                  | バージョン情報を表示して終了します。                                                                                                                  | -                                |

### 接続オプション {#command-line-options-connection}

| オプション                      | 説明                                                                                                                                                                                                                                                                                                                                                                                                        | デフォルト                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `--connection <name>`           | 設定ファイルであらかじめ定義された接続設定の名前を指定します。詳細は [Connection credentials](#connection-credentials) を参照してください。                                                                                                                                                                                                                             | -                                                                                                                           |
| `-d [ --database ] <database>`  | この接続でデフォルトとして使用するデータベースを選択します。                                                                                                                                                                                                                                                                                                         | サーバー設定での現在のデータベース（デフォルトは `default`）                                                                |
| `-h [ --host ] <host>`          | 接続先の ClickHouse サーバーのホスト名を指定します。ホスト名、IPv4 アドレス、または IPv6 アドレスを指定できます。複数のホストは、このオプションを複数回指定することで渡せます。                                                                                                                                                                                         | `localhost`                                                                                                                 |
| `--jwt <value>`                 | 認証に JSON Web Token (JWT) を使用します。<br/><br/>JWT によるサーバー側の認可は ClickHouse Cloud でのみ利用可能です。                                                                                                                                                                                                                                               | -                                                                                                                           |
| `--no-warnings`                 | クライアントがサーバーに接続する際に、`system.warnings` からの警告を表示しないようにします。                                                                                                                                                                                                                                                                       | -                                                                                                                           |
| `--password <password>`         | データベースユーザーのパスワードを指定します。接続用のパスワードは設定ファイル内でも指定できます。パスワードを指定しなかった場合、クライアントが対話的にパスワードの入力を求めます。                                                                                                                                                                                          | -                                                                                                                           |
| `--port <port>`                 | サーバーが接続を受け付けるポート番号を指定します。デフォルトのポートは 9440（TLS）と 9000（非 TLS）です。<br/><br/>注意: クライアントは HTTP(S) ではなくネイティブプロトコルを使用します。                                                                                                                                                                                              | `--secure` が指定されている場合は `9440`、それ以外は `9000`。ホスト名が `.clickhouse.cloud` で終わる場合は常に `9440` がデフォルトになります。 |
| `-s [ --secure ]`               | TLS を使用するかどうかを指定します。<br/><br/>ポート 9440（デフォルトのセキュアポート）または ClickHouse Cloud に接続する場合は自動的に有効になります。<br/><br/>必要に応じて、[設定ファイル](#configuration_files) で CA 証明書を設定してください。利用可能な設定項目は、[サーバー側 TLS 設定](../operations/server-configuration-parameters/settings.md#openssl) と同じです。 | ポート 9440 または ClickHouse Cloud に接続する場合は自動的に有効になります                                                 |
| `--ssh-key-file <path-to-file>` | サーバーへの認証に使用する SSH 秘密鍵を格納したファイルを指定します。                                                                                                                                                                                                                                                                                                | -                                                                                                                           |
| `--ssh-key-passphrase <value>`  | `--ssh-key-file` で指定した SSH 秘密鍵のパスフレーズを指定します。                                                                                                                                                                                                                                                                                                  | -                                                                                                                           |
| `-u [ --user ] <username>`      | 接続時に使用するデータベースユーザー名を指定します。                                                                                                                                                                                                                                                                                                               | `default`                                                                                                                   |

:::note
`--host`、`--port`、`--user`、`--password` オプションの代わりに、クライアントは [接続文字列](#connection_string) もサポートします。
:::

### クエリオプション {#command-line-options-query}


| オプション                          | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--param_<name>=<value>`        | [パラメータ付きクエリ](#cli-queries-with-parameters)のパラメータの置換値。                                                                                                                                                                                                                                                                                                                                                                                     |
| `-q [ --query ] <query>`        | バッチモードで実行するクエリ。複数回指定可能(`--query "SELECT 1" --query "SELECT 2"`)、またはセミコロンで区切られた複数のクエリを一度に指定可能(`--query "SELECT 1; SELECT 2;"`)。後者の場合、`VALUES`以外の形式を使用する`INSERT`クエリは空行で区切る必要があります。<br/><br/>単一のクエリはパラメータなしでも指定可能: `clickhouse-client "SELECT 1"` <br/><br/>`--queries-file`と併用できません。 |
| `--queries-file <path-to-file>` | クエリを含むファイルへのパス。`--queries-file`は複数回指定可能、例: `--queries-file queries1.sql --queries-file queries2.sql`。<br/><br/>`--query`と併用できません。                                                                                                                                                                                                                                                                             |
| `-m [ --multiline ]`            | 指定された場合、複数行クエリを許可します(Enterキーでクエリを送信しません)。クエリはセミコロンで終了した場合にのみ送信されます。                                                                                                                                                                                                                                                                                                                            |

### クエリ設定 {#command-line-options-query-settings}

クエリ設定はクライアントのコマンドラインオプションとして指定できます。例:

```bash
$ clickhouse-client --max_threads 1
```

設定の一覧については[設定](../operations/settings/settings.md)を参照してください。

### フォーマットオプション {#command-line-options-formatting}

| オプション                     | 説明                                                                                                                                                                                                                    | デフォルト        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `-f [ --format ] <format>` | 指定された形式で結果を出力します。<br/><br/>サポートされている形式の一覧については[入出力データの形式](formats.md)を参照してください。                                                                                  | `TabSeparated` |
| `--pager <command>`        | すべての出力をこのコマンドにパイプします。通常は`less`(例: 幅の広い結果セットを表示するための`less -S`)または類似のコマンドを使用します。                                                                                                                  | -              |
| `-E [ --vertical ]`        | [Vertical形式](/interfaces/formats/Vertical)を使用して結果を出力します。これは`–-format Vertical`と同じです。この形式では、各値が個別の行に出力されるため、幅の広いテーブルを表示する際に便利です。 | -              |

### 実行の詳細 {#command-line-options-execution-details}


| Option                            | 説明                                                                                                                                                                                                                                                                                                               | デフォルト                                                          |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `--enable-progress-table-toggle`  | Control キー（Space）を押すことで progress テーブルの表示切り替えを有効にします。progress テーブルの出力が有効なインタラクティブモードでのみ有効です。                                                                                                                                                           | `enabled`                                                           |
| `--hardware-utilization`          | プログレスバーにハードウェア利用状況の情報を出力します。                                                                                                                                                                                                                                                          | -                                                                   |
| `--memory-usage`                  | 指定した場合、非インタラクティブモードでメモリ使用量を `stderr` に出力します。<br/><br/>指定可能な値: <br/>• `none` - メモリ使用量を出力しない <br/>• `default` - バイト数を出力する <br/>• `readable` - メモリ使用量を人間が読みやすい形式で出力する                                                     | -                                                                   |
| `--print-profile-events`          | `ProfileEvents` パケットを出力します。                                                                                                                                                                                                                                                                             | -                                                                   |
| `--progress`                      | クエリ実行の進行状況を出力します。<br/><br/>指定可能な値: <br/>• `tty\|on\|1\|true\|yes` - インタラクティブモードでターミナルに出力する <br/>• `err` - 非インタラクティブモードで `stderr` に出力する <br/>• `off\|0\|false\|no` - 進行状況の出力を無効にする                                         | インタラクティブモードでは `tty`、非インタラクティブ（バッチ）モードでは `off` |
| `--progress-table`                | クエリ実行中に変化するメトリクスを含む progress テーブルを出力します。<br/><br/>指定可能な値: <br/>• `tty\|on\|1\|true\|yes` - インタラクティブモードでターミナルに出力する <br/>• `err` - 非インタラクティブモードで `stderr` に出力する <br/>• `off\|0\|false\|no` - progress テーブルを無効にする | インタラクティブモードでは `tty`、非インタラクティブ（バッチ）モードでは `off` |
| `--stacktrace`                    | 例外のスタックトレースを出力します。                                                                                                                                                                                                                                                                                | -                                                                   |
| `-t [ --time ]`                   | 非インタラクティブモードでクエリ実行時間を `stderr` に出力します（ベンチマーク用）。                                                                                                                                                                                                                              | -                                                                   |
