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
このクライアントは、対話的モード（ライブクエリ実行用）とバッチモード（スクリプト実行や自動化用）の両方をサポートします。
クエリ結果はターミナルに表示することも、ファイルにエクスポートすることもでき、Pretty、CSV、JSON など、すべての ClickHouse の出力[フォーマット](formats.md)に対応しています。

このクライアントは、プログレスバー、読み取られた行数、処理されたバイト数、クエリ実行時間などを通じて、クエリ実行に関するリアルタイムのフィードバックを提供します。
また、[コマンドラインオプション](#command-line-options)と[設定ファイル](#configuration_files)の両方をサポートします。


## インストール

ClickHouse をダウンロードするには、次のコマンドを実行します。

```bash
curl https://clickhouse.com/ | sh
```

これもインストールするには、次を実行します：

```bash
sudo ./clickhouse install
```

その他のインストール方法については、[Install ClickHouse](../getting-started/install/install.mdx) を参照してください。

クライアントとサーバーでバージョンが異なっていても互換性はありますが、一部の機能は古いクライアントでは利用できない場合があります。クライアントとサーバーには同じバージョンを使用することを推奨します。


## 実行

:::note
ClickHouse をダウンロードしただけでインストールしていない場合は、`clickhouse-client` の代わりに `./clickhouse client` を使用してください。
:::

ClickHouse サーバーに接続するには、次を実行します。

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

必要に応じて追加の接続情報を指定します:

| Option                           | Description                                                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `--port <port>`                  | ClickHouse サーバーが接続を受け付けるポートです。デフォルトのポートは 9440 (TLS) と 9000 (非 TLS) です。ClickHouse Client は HTTP(S) ではなくネイティブプロトコルを使用します。 |
| `-s [ --secure ]`                | TLS を使用するかどうか (通常は自動検出されます)。                                                                                            |
| `-u [ --user ] <username>`       | 接続に使用するデータベースユーザーです。指定しない場合は `default` ユーザーとして接続します。                                                                    |
| `--password <password>`          | データベースユーザーのパスワードです。接続用のパスワードは設定ファイル内で指定することもできます。パスワードを指定しない場合、クライアントがパスワードの入力を求めます。                                    |
| `-c [ --config ] <path-to-file>` | ClickHouse Client の設定ファイルの場所です。デフォルトの場所以外にある場合に指定します。詳細は [Configuration Files](#configuration_files) を参照してください。         |
| `--connection <name>`            | [configuration file](#connection-credentials) で事前定義された接続情報の名前です。                                                        |

コマンドラインオプションの一覧については、[Command Line Options](#command-line-options) を参照してください。

### ClickHouse Cloud への接続

ClickHouse Cloud サービスの詳細は ClickHouse Cloud コンソールで確認できます。接続したいサービスを選択し、**Connect** をクリックします:

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud サービスの接続ボタン" />

<br />

<br />

**Native** を選択すると、サンプルの `clickhouse-client` コマンド付きで接続情報が表示されます:

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud の Native TCP 接続情報" />

### 設定ファイルへの接続情報の保存

1 台以上の ClickHouse サーバーに対する接続情報を [configuration file](#configuration_files) に保存できます。

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

詳細については、[設定ファイルのセクション](#configuration_files) を参照してください。

:::note
クエリ構文に集中するため、以降の例では接続情報（`--host`、`--port` など）を省略しています。実際にコマンドを使用する際には、それらを忘れずに追加してください。
:::


## インタラクティブモード

### インタラクティブモードの利用

ClickHouse をインタラクティブモードで実行するには、次のコマンドを実行します。

```bash
clickhouse-client
```

これにより Read-Eval-Print Loop（REPL）が開き、対話的に SQL クエリを入力して実行できるようになります。
接続が確立されると、クエリを入力できるプロンプトが表示されます。

```bash
ClickHouse クライアント バージョン 25.x.x.x
localhost:9000 にユーザー default として接続中。
ClickHouse サーバー バージョン 25.x.x.x に接続しました

hostname :)

hostname :)
```

対話モードでは、デフォルトの出力フォーマットは `PrettyCompact` です。
クエリの `FORMAT` 句でフォーマットを変更するか、コマンドラインオプション `--format` を指定して変更できます。
Vertical フォーマットを使用するには、`--vertical` を使うか、クエリの末尾に `\G` を指定します。
このフォーマットでは、各値が別々の行に出力されるため、幅の広いテーブルに便利です。

対話モードでは、デフォルトでは入力した内容が `Enter` を押した時点で実行されます。
クエリの末尾にセミコロンを付ける必要はありません。

`-m, --multiline` パラメータを指定してクライアントを起動できます。
複数行のクエリを入力するには、改行の前にバックスラッシュ `\` を入力します。
`Enter` を押すと、クエリの次の行の入力が求められます。
クエリを実行するには、末尾をセミコロンで終わらせて `Enter` を押します。

ClickHouse Client は `replxx`（`readline` に類似）をベースとしているため、親しみのあるキーボードショートカットが使え、履歴も保持されます。
履歴はデフォルトで `~/.clickhouse-client-history` に書き込まれます。

クライアントを終了するには、`Ctrl+D` を押すか、クエリの代わりに次のいずれかを入力します。

* `exit` または `exit;`
* `quit` または `quit;`
* `q`、`Q` または `:q`
* `logout` または `logout;`

### クエリ処理に関する情報

クエリを処理する際、クライアントは次の情報を表示します。

1. 進捗。デフォルトでは 1 秒間に 10 回を超えない頻度で更新されます。
   実行が速いクエリでは、進捗が表示される前に終了してしまう場合があります。
2. デバッグ用の、パース後に整形されたクエリ。
3. 指定されたフォーマットでの結果。
4. 結果の行数、経過時間、およびクエリ処理の平均速度。
   すべてのデータ量は非圧縮データを基準としています。

長時間実行中のクエリは、`Ctrl+C` を押すことでキャンセルできます。
ただし、サーバーがリクエストを中止するまで、少し待つ必要があります。
クエリは特定の段階ではキャンセルできない場合があります。
待たずに 2 回目の `Ctrl+C` を押した場合、クライアントは終了します。

ClickHouse Client では、クエリ実行時に外部データ（外部一時テーブル）を渡すことができます。
詳細については、[External data for query processing](../engines/table-engines/special/external-data.md) セクションを参照してください。

### エイリアス

REPL 内からは次のエイリアスを使用できます。

* `\l` - SHOW DATABASES
* `\d` - SHOW TABLES
* `\c <DATABASE>` - USE DATABASE
* `.` - 直前のクエリを再実行

### キーボードショートカット

* `Alt (Option) + Shift + e` - 現在のクエリをエディタで開きます。使用するエディタは環境変数 `EDITOR` で指定できます。デフォルトでは `vim` が使用されます。
* `Alt (Option) + #` - 行をコメントアウトします。
* `Ctrl + r` - 履歴のあいまい検索を行います。

利用可能なすべてのキーボードショートカットを含む完全な一覧は、[replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262) にあります。

:::tip
macOS で Meta キー（Option）の動作を正しく設定するには:

iTerm2: Preferences -&gt; Profile -&gt; Keys -&gt; Left Option key に移動し、Esc+ をクリックします。
:::


## バッチモード

### バッチモードの使用

ClickHouse Client を対話的に使用する代わりに、バッチモードで起動できます。
バッチモードでは、ClickHouse は単一のクエリだけを実行するとすぐに終了し、対話的なプロンプトやループは提供されません。

次のように単一のクエリを指定できます。

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

`--query` コマンドラインオプションを使用することもできます。

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

`stdin` からクエリを渡すことができます。

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

テーブル `messages` が存在する前提で、コマンドラインからデータを挿入することもできます。

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query` が指定されている場合、あらゆる入力は改行文字の後にリクエストへ追記されます。

### リモートの ClickHouse サービスに CSV ファイルを挿入する

次の例では、サンプルデータセットの CSV ファイル `cell_towers.csv` を、`default` データベース内の既存テーブル `cell_towers` に挿入しています。

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

### コマンドラインからデータを挿入する例

コマンドラインからデータを挿入する方法はいくつかあります。
次の例では、バッチモードを使用して 2行の CSV データを ClickHouse テーブルに挿入します。

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

以下の例では、`cat <<_EOF` でヒアドキュメントを開始し、再度 `_EOF` が現れるまでの内容をすべて読み取り、その内容を出力します。

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

次の例では、`cat` を使用して `file.csv` の内容を標準出力に表示し、その出力を `clickhouse-client` の入力としてパイプしています。

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

バッチモードでは、デフォルトのデータ[形式](formats.md)は `TabSeparated` です。
上記の例に示すように、クエリの `FORMAT` 句で形式を指定できます。


## パラメータ付きクエリ

クエリ内でパラメータを指定し、コマンドラインオプションを使って値を渡すことができます。
これにより、クライアント側で特定の動的値を含むクエリ文字列を組み立てる必要がなくなります。
例えば、次のように指定できます。

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

[インタラクティブセッション](#interactive-mode)中にパラメータを設定することもできます。

```text
$ clickhouse-client
ClickHouseクライアント バージョン 25.X.X.XXX (公式ビルド)

#highlight-next-line
:) SET param_parName='[1, 2]';

SET param_parName = '[1, 2]'

Query id: 7ac1f84e-e89a-4eeb-a4bb-d24b8f9fd977

Ok.

0行のセット。経過時間: 0.000秒

#highlight-next-line
:) SELECT {parName:Array(UInt16)}

SELECT {parName:Array(UInt16)}

Query id: 0358a729-7bbe-4191-bb48-29b063c548a7

   ┌─_CAST([1, 2]⋯y(UInt16)')─┐
1. │ [1,2]                    │
   └──────────────────────────┘

1行のセット。経過時間: 0.006秒
```

### クエリ構文

クエリ内で、コマンドライン引数で指定する値を埋め込む場合は、次の形式で中かっこで囲んで記述します。

```sql
{<name>:<data type>}
```

| Parameter   | Description                                                                                                                                                                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | プレースホルダーの識別子。対応するコマンドラインオプションは `--param_<name> = value` です。                                                                                                                                                                                                                                                                  |
| `data type` | パラメーターの[データ型](../sql-reference/data-types/index.md)。<br /><br />たとえば、`(integer, ('string', integer))` のようなデータ構造は、`Tuple(UInt8, Tuple(String, UInt8))` 型を持つことができます（他の[integer](../sql-reference/data-types/int-uint.md) 型も使用できます）。<br /><br />テーブル名、データベース名、および列名をパラメーターとして渡すことも可能であり、その場合はデータ型として `Identifier` を使用する必要があります。 |

### 例

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```


## AI を活用した SQL 生成

ClickHouse Client には、自然言語での説明から SQL クエリを生成するための AI 支援機能が組み込まれています。この機能により、高度な SQL の知識がなくても複雑なクエリを作成できます。

AI 支援機能は、`OPENAI_API_KEY` または `ANTHROPIC_API_KEY` のいずれかの環境変数が設定されていれば、すぐに利用できます。より高度な設定については、[Configuration](#ai-sql-generation-configuration) セクションを参照してください。

### 使用方法

AI による SQL 生成を利用するには、自然言語で記述したクエリの先頭に `??` を付けてください。

```bash
:) ?? 過去30日間に購入を行った全ユーザーを表示
```

AI は次の処理を行います:

1. データベーススキーマを自動的に解析します
2. 取得したテーブルおよびカラムに基づいて適切な SQL を生成します
3. 生成したクエリを即座に実行します

### 例

```bash
:) ?? 商品カテゴリ別に注文数を集計

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

### 設定

AI による SQL 生成を使用するには、ClickHouse Client の設定ファイルで AI プロバイダーを設定する必要があります。OpenAI、Anthropic、または任意の OpenAI 互換 API サービスを使用できます。

#### 環境変数によるフォールバック

設定ファイルに AI 設定が指定されていない場合、ClickHouse Client は自動的に環境変数の使用を試みます。

1. まず `OPENAI_API_KEY` 環境変数を確認します
2. 見つからない場合は `ANTHROPIC_API_KEY` 環境変数を確認します
3. どちらも見つからない場合、AI 機能は無効になります


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

AI設定をより詳細に制御するには、以下の場所にあるClickHouseクライアント設定ファイルで設定します:

- `$XDG_CONFIG_HOME/clickhouse/config.xml` (または`XDG_CONFIG_HOME`が設定されていない場合は`~/.config/clickhouse/config.xml`) (XML形式)
- `$XDG_CONFIG_HOME/clickhouse/config.yaml` (または`XDG_CONFIG_HOME`が設定されていない場合は`~/.config/clickhouse/config.yaml`) (YAML形式)
- `~/.clickhouse-client/config.xml` (XML形式、レガシーの場所)
- `~/.clickhouse-client/config.yaml` (YAML形式、レガシーの場所)
- または`--config-file`でカスタムの場所を指定

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- 必須: APIキー (または環境変数で設定) -->
            <api_key>your-api-key-here</api_key>

            <!-- 必須: プロバイダータイプ (openai, anthropic) -->
            <provider>openai</provider>

            <!-- 使用するモデル (デフォルトはプロバイダーによって異なります) -->
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
      # 必須: APIキー (または環境変数で設定)
      api_key: your-api-key-here

      # 必須: プロバイダータイプ (openai, anthropic)
      provider: openai

      # 使用するモデル
      model: gpt-4o

      # オプション: OpenAI互換サービス用のカスタムAPIエンドポイント
      # base_url: https://openrouter.ai/api

      # スキーマアクセスを有効化 - AIがデータベース/テーブル情報をクエリ可能にします
      enable_schema_access: true

      # 生成パラメータ
      temperature: 0.0      # ランダム性を制御 (0.0 = 決定論的)
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

**OpenAI互換API (例: OpenRouter) の使用:**

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


# 設定なし - 自動フォールバック
# (ai セクションが空、または存在しない場合は、まず OPENAI_API_KEY、次に ANTHROPIC_API_KEY を使用しようとします)



# モデルのみを上書き - API キーには環境変数を使用

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
- `timeout_seconds` - リクエストタイムアウト (秒単位) (デフォルト: `30`)

</details>

<details>
<summary>スキーマ探索</summary>

- `enable_schema_access` - AIによるデータベーススキーマの探索を許可 (デフォルト: `true`)
- `max_steps` - スキーマ探索のための最大ツール呼び出しステップ数 (デフォルト: `10`)

</details>

<details>
<summary>生成パラメータ</summary>

- `temperature` - ランダム性を制御、0.0 = 決定論的、1.0 = 創造的 (デフォルト: `0.0`)
- `max_tokens` - 最大応答長 (トークン単位) (デフォルト: `1000`)
- `system_prompt` - AI用のカスタム指示 (オプション)

</details>

### 動作の仕組み {#ai-sql-generation-how-it-works}

AI SQLジェネレーターは複数ステップのプロセスを使用します:

<VerticalStepper headerLevel="list">

1. **スキーマ検出**

AIは組み込みツールを使用してデータベースを探索します
- 利用可能なデータベースを一覧表示
- 関連するデータベース内のテーブルを検出
- `CREATE TABLE` ステートメントを介してテーブル構造を調査

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
- API使用はAIプロバイダーのレート制限とコストの対象となります
- 複雑なクエリは複数回の改良が必要な場合があります
- AIはスキーマ情報への読み取り専用アクセスのみを持ち、実際のデータにはアクセスしません

### セキュリティ {#ai-sql-generation-security}

- APIキーはClickHouseサーバーに送信されません
- AIはスキーマ情報 (テーブル/カラム名と型) のみを参照し、実際のデータは参照しません
- 生成されたすべてのクエリは既存のデータベース権限を尊重します
```


## 接続文字列

### 使用方法

ClickHouse Client では、[MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) と同様の形式の接続文字列を使用して ClickHouse サーバーに接続することもできます。構文は次のとおりです。

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| Component (all optional) | Description                                                                                 | Default          |
| ------------------------ | ------------------------------------------------------------------------------------------- | ---------------- |
| `user`                   | データベースのユーザー名。                                                                               | `default`        |
| `password`               | データベースユーザーのパスワード。`:` が指定されていてパスワードが空の場合、クライアントはユーザーのパスワードの入力を求めます。                          | -                |
| `hosts_and_ports`        | ホストおよび任意のポートのリスト `host[:port] [, host:[port]], ...`。                                        | `localhost:9000` |
| `database`               | データベース名。                                                                                    | `default`        |
| `query_parameters`       | キーと値のペアのリスト `param1=value1[,&param2=value2], ...`。一部のパラメータでは値が不要です。パラメータ名と値は大文字と小文字が区別されます。 | -                |

### Notes

ユーザー名、パスワード、またはデータベースが接続文字列で指定されている場合は、`--user`、`--password`、または `--database` で指定することはできません（その逆も同様です）。

host コンポーネントには、ホスト名、IPv4 アドレス、または IPv6 アドレスを指定できます。
IPv6 アドレスは角括弧で囲む必要があります:

```text
clickhouse://[2001:db8::1234]
```

接続文字列には複数のホストを含めることができます。
ClickHouse クライアントは、これらのホストに左から右の順に接続を試行します。
一度接続が確立されると、残りのホストへの接続は試行されません。

接続文字列は `clickHouse-client` の最初の引数として指定する必要があります。
接続文字列は、`--host` および `--port` を除く任意数の他の[コマンドラインオプション](#command-line-options)と組み合わせて指定できます。

`query_parameters` では、次のキーが使用できます。

| Key               | Description                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `secure` (or `s`) | 指定された場合、クライアントは安全な接続 (TLS) を使用してサーバーに接続します。`--secure` については[コマンドラインオプション](#command-line-options)を参照してください。 |

**パーセントエンコード**

次のパラメータ内の非 US-ASCII 文字、スペース、および特殊文字は、[パーセントエンコード](https://en.wikipedia.org/wiki/URL_encoding)する必要があります。

* `user`
* `password`
* `hosts`
* `database`
* `query parameters`

### 例

`localhost` のポート 9000 に接続して、クエリ `SELECT 1` を実行します。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

ユーザー `john` とパスワード `secret` を使用し、ホスト `127.0.0.1`、ポート `9000` で `localhost` に接続します

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

`default` ユーザーとして、IPv6 アドレス `[::1]`、ポート `9000` のホストである `localhost` に接続します。

```bash
clickhouse-client clickhouse://[::1]:9000
```

マルチラインモードで、`localhost` の 9000 番ポートに接続します。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

ユーザー `default` で、ポート 9000 を使用して `localhost` に接続します。

```bash
clickhouse-client clickhouse://default@localhost:9000
```


# 以下と同等です:

clickhouse-client clickhouse://localhost:9000 --user default

````

`localhost`のポート9000に接続し、`my_database`データベースをデフォルトとして使用します。

```bash
clickhouse-client clickhouse://localhost:9000/my_database
````


# 次のコマンドと同等です：

clickhouse-client clickhouse://localhost:9000 --database my&#95;database

````

`localhost`のポート9000に接続し、接続文字列で指定された`my_database`データベースをデフォルトとし、短縮形の`s`パラメータを使用してセキュア接続を行います。

```bash
clickhouse-client clickhouse://localhost/my_database?s
````


# 同等のコマンド:

clickhouse-client clickhouse://localhost/my&#95;database -s

````

デフォルトのホスト、ポート、ユーザー、データベースを使用して接続します。

```bash
clickhouse-client clickhouse:
````

デフォルトのホストおよびポートを使用し、ユーザー `my_user` としてパスワードなしで接続します。

```bash
clickhouse-client clickhouse://my_user@
```


# : と @ の間を空にしておくと、接続を開始する前にユーザーにパスワードの入力を求めます。

clickhouse-client clickhouse://my&#95;user:@

````

メールアドレスをユーザー名として使用し、`localhost`に接続します。`@`記号はパーセントエンコードされて`%40`になります。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
````

次のいずれかのホストに接続します: `192.168.1.15`, `192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```


## クエリ ID の形式

インタラクティブモードでは、ClickHouse Client は各クエリのクエリ ID を表示します。デフォルトでは、ID は次のような形式で表示されます。

```sql
クエリ ID: 927f137d-00f1-4175-8914-0dd066365e96
```

カスタムフォーマットは、設定ファイル内の `query_id_formats` タグで指定できます。フォーマット文字列中の `{query_id}` プレースホルダーはクエリ ID に置き換えられます。タグ内には複数のフォーマット文字列を指定できます。
この機能は、クエリのプロファイリングを容易にするための URL を生成する際に利用できます。

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

ClickHouse Client は、次のうち最初に見つかったファイルを使用します：

- `-c [ -C, --config, --config-file ]` オプションで指定されたファイル
- `./clickhouse-client.[xml|yaml|yml]`
- `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]`（`XDG_CONFIG_HOME` が設定されていない場合は `~/.config/clickhouse/config.[xml|yaml|yml]`）
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

ClickHouse リポジトリ内のサンプルの設定ファイルを参照してください: [`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

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

ユーザー名、パスワード、およびホストは、環境変数 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_HOST` で設定できます。
コマンドライン引数 `--user`、`--password`、`--host`、または（指定されている場合）[接続文字列](#connection_string) が、環境変数よりも優先して使用されます。



## コマンドラインオプション {#command-line-options}

すべてのコマンドラインオプションは、コマンドライン上で直接指定するか、[設定ファイル](#configuration_files)内のデフォルト値として指定できます。

### 一般オプション {#command-line-options-general}

| Option                                              | Description                                                                                                                        | Default                      |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| `-c [ -C, --config, --config-file ] <path-to-file>` | クライアント用の設定ファイルの場所を指定します。既定の検索パス以外にある場合に使用します。詳細は [Configuration Files](#configuration_files) を参照してください。 | -                            |
| `--help`                                            | 使用方法の概要を表示して終了します。`--verbose` と組み合わせると、クエリ設定を含む利用可能なすべてのオプションを表示します。 | -                            |
| `--history_file <path-to-file>`                     | コマンド履歴を保存するファイルのパスを指定します。                                                                                 | -                            |
| `--history_max_entries`                             | 履歴ファイルに保持するエントリの最大数を指定します。                                                                               | `1000000`（100万）           |
| `--prompt <prompt>`                                 | カスタムプロンプトを指定します。                                                                                                   | サーバーの `display_name`   |
| `--verbose`                                         | 出力の詳細度を上げます。                                                                                                           | -                            |
| `-V [ --version ]`                                  | バージョンを表示して終了します。                                                                                                   | -                            |

### 接続オプション {#command-line-options-connection}

| Option                           | Description                                                                                                                                                                                                                                                                                                                        | Default                                                                                                          |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `--connection <name>`            | 設定ファイル内であらかじめ定義された接続設定の名前を指定します。詳しくは [Connection credentials](#connection-credentials) を参照してください。                                                                                                                                                                                     | -                                                                                                                |
| `-d [ --database ] <database>`   | この接続でデフォルトとして使用するデータベースを指定します。                                                                                                                                                                                                                                                                       | サーバー設定での現在のデータベース（デフォルトは `default`）                                                    |
| `-h [ --host ] <host>`           | 接続先の ClickHouse サーバーのホスト名を指定します。ホスト名または IPv4 / IPv6 アドレスを指定できます。複数のホストを指定するには、このオプションを複数回指定します。                                                                                                                                                                 | `localhost`                                                                                                      |
| `--jwt <value>`                  | 認証に JSON Web Token (JWT) を使用します。<br/><br/>サーバー側の JWT 認可は ClickHouse Cloud でのみ利用可能です。                                                                                                                                                                                                                | -                                                                                                                |
| `--no-warnings`                  | クライアントがサーバーに接続する際に、`system.warnings` からの警告を表示しないようにします。                                                                                                                                                                                                                                      | -                                                                                                                |
| `--password <password>`          | データベースユーザーのパスワードを指定します。パスワードは設定ファイル内で接続ごとに指定することもできます。パスワードを指定しない場合、クライアントはパスワードの入力を求めます。                                                                                                                                                 | -                                                                                                                |
| `--port <port>`                  | サーバーが接続を受け付けるポートを指定します。デフォルトポートは 9440（TLS）と 9000（非 TLS）です。<br/><br/>注意: クライアントはネイティブプロトコルを使用し、HTTP(S) は使用しません。                                                                                                                                             | `--secure` が指定されている場合は `9440`、それ以外は `9000`。ホスト名が `.clickhouse.cloud` で終わる場合は常に `9440` がデフォルト。 |
| `-s [ --secure ]`                | TLS を使用するかどうかを指定します。<br/><br/>ポート 9440（デフォルトのセキュアポート）または ClickHouse Cloud に接続する場合、自動的に有効になります。<br/><br/>必要に応じて、[設定ファイル](#configuration_files) で CA 証明書を設定する必要があります。利用可能な設定項目は [サーバー側 TLS 設定](../operations/server-configuration-parameters/settings.md#openssl) と同じです。 | ポート 9440 または ClickHouse Cloud に接続する場合は自動的に有効化                                              |
| `--ssh-key-file <path-to-file>`  | サーバーとの認証に使用する SSH 秘密鍵を含むファイルを指定します。                                                                                                                                                                                                                                                                  | -                                                                                                                |
| `--ssh-key-passphrase <value>`   | `--ssh-key-file` で指定した SSH 秘密鍵のパスフレーズを指定します。                                                                                                                                                                                                                                                                | -                                                                                                                |
| `-u [ --user ] <username>`       | 接続に使用するデータベースユーザーを指定します。                                                                                                                                                                                                                                                                                   | `default`                                                                                                        |

:::note
`--host`、`--port`、`--user`、`--password` オプションの代わりに、クライアントは [connection strings](#connection_string)（接続文字列）もサポートしています。
:::

### クエリオプション {#command-line-options-query}



| Option                          | Description                                                                                                                                                                                                                                                                                                |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--param_<name>=<value>`        | [パラメータ付きクエリ](#cli-queries-with-parameters) のパラメータに対する置換値。                                                                                                                                                                                                                                                  |
| `-q [ --query ] <query>`        | バッチモードで実行するクエリです。複数回指定できます（`--query "SELECT 1" --query "SELECT 2"`）、またはセミコロン区切りで 1 回だけ指定することもできます（`--query "SELECT 1; SELECT 2;"`）。後者の場合、`VALUES` 以外のフォーマットを使用する `INSERT` クエリは空行で区切る必要があります。<br /><br />単一のクエリはパラメータ指定なしでも指定できます: `clickhouse-client "SELECT 1"`<br /><br />`--queries-file` と同時には使用できません。 |
| `--queries-file <path-to-file>` | クエリを含むファイルへのパス。`--queries-file` は複数回指定できます（例: `--queries-file queries1.sql --queries-file queries2.sql`）。<br /><br />`--query` と同時には使用できません。                                                                                                                                                               |
| `-m [ --multiline ]`            | 指定した場合、複数行クエリを許可します（Enter キーを押してもクエリを送信しません）。クエリは末尾がセミコロンで終わったときのみ送信されます。                                                                                                                                                                                                                                  |

### Query settings

クエリ設定は、例えば次のようにクライアントのコマンドラインオプションとして指定できます。

```bash
$ clickhouse-client --max_threads 1
```

設定の一覧については [Settings](../operations/settings/settings.md) を参照してください。

### 書式オプション

| Option                     | Description                                                                                                                                  | Default        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `-f [ --format ] <format>` | 指定した形式で結果を出力します。<br /><br />サポートされている形式の一覧については、[Formats for Input and Output Data](formats.md) を参照してください。                                   | `TabSeparated` |
| `--pager <command>`        | すべての出力をこのコマンドにパイプします。通常は `less`（例: 幅の広い結果セットを表示するための `less -S`）などを指定します。                                                                     | -              |
| `-E [ --vertical ]`        | 結果の出力に [Vertical format](/interfaces/formats/Vertical) を使用します。これは `–-format Vertical` を指定するのと同じです。この形式では各値が別々の行に出力されるため、幅の広いテーブルを表示する際に便利です。 | -              |

### 実行の詳細


| Option                            | Description                                                                                                                                                                                                                                                                                                         | Default                                                             |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `--enable-progress-table-toggle`  | Ctrl+Space キーで progress table の表示を切り替えられるようにします。progress table の出力が有効なインタラクティブモードでのみ適用されます。                                                                                                                                                                | `enabled`                                                           |
| `--hardware-utilization`          | プログレスバーにハードウェア使用率の情報を出力します。                                                                                                                                                                                                                                                             | -                                                                   |
| `--memory-usage`                  | 指定した場合、非インタラクティブモードでメモリ使用量を `stderr` に出力します。<br/><br/>指定可能な値: <br/>• `none` - メモリ使用量を出力しない <br/>• `default` - バイト数を出力する <br/>• `readable` - メモリ使用量を人間が読みやすい形式で出力する                                                                | -                                                                   |
| `--print-profile-events`          | `ProfileEvents` パケットを出力します。                                                                                                                                                                                                                                                                                      | -                                                                   |
| `--progress`                      | クエリ実行の進捗を出力します。<br/><br/>指定可能な値: <br/>• `tty\|on\|1\|true\|yes` - インタラクティブモードで端末へ出力する <br/>• `err` - 非インタラクティブモードで `stderr` へ出力する <br/>• `off\|0\|false\|no` - 進捗出力を無効にする                                                       | インタラクティブモードでは `tty`、非インタラクティブ（バッチ）モードでは `off`    |
| `--progress-table`                | クエリ実行中に変化するメトリクスを含む progress table を出力します。<br/><br/>指定可能な値: <br/>• `tty\|on\|1\|true\|yes` - インタラクティブモードで端末へ出力する <br/>• `err` - 非インタラクティブモードで `stderr` へ出力する <br/>• `off\|0\|false\|no` - progress table を無効にする                      | インタラクティブモードでは `tty`、非インタラクティブ（バッチ）モードでは `off`    |
| `--stacktrace`                    | 例外のスタックトレースを出力します。                                                                                                                                                                                                                                                                                   | -                                                                   |
| `-t [ --time ]`                   | 非インタラクティブモードでクエリ実行時間を `stderr` に出力します（ベンチマーク用）。                                                                                                                                                                                                                                    | -                                                                   |
