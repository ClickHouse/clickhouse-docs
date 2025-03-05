---
sidebar_position: 1
slug: /cloud/get-started/cloud-quick-start
sidebar_label: Cloud Quick Start
keywords: [clickhouse, install, getting started, quick start]
pagination_next: cloud/get-started/sql-console
---
import signup_page from '@site/static/images/_snippets/signup_page.png';
import select_plan from '@site/static/images/_snippets/select_plan.png';
import createservice1 from '@site/static/images/_snippets/createservice1.png';
import scaling_limits from '@site/static/images/_snippets/scaling_limits.png';
import createservice8 from '@site/static/images/_snippets/createservice8.png';
import show_databases from '@site/static/images/_snippets/show_databases.png';
import service_connect from '@site/static/images/_snippets/service_connect.png';
import data_sources from '@site/static/images/_snippets/data_sources.png';
import select_data_source from '@site/static/images/_snippets/select_data_source.png';
import client_details from '@site/static/images/_snippets/client_details.png';
import new_rows_from_csv from '@site/static/images/_snippets/new_rows_from_csv.png';
import SQLConsoleDetail from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_launch_sql_console.md';


# ClickHouse Cloudクイックスタート

ClickHouseを立ち上げる最も迅速で簡単な方法は、[ClickHouse Cloud](https://console.clickhouse.cloud)に新しいサービスを作成することです。

## 1. ClickHouseサービスを作成する {#1-create-a-clickhouse-service}

[ClickHouse Cloud](https://console.clickhouse.cloud)で無料のClickHouseサービスを作成するには、以下の手順を完了してサインアップする必要があります：

  - [サインアップページ](https://console.clickhouse.cloud/signUp)でアカウントを作成する
  - メールアドレスまたはGoogle SSO、Microsoft SSO、AWS Marketplace、Google Cloud、Microsoft Azureを使用してサインアップできます
  - メールアドレスとパスワードを使用してサインアップした場合は、受信したメールのリンクを介して次の24時間以内にメールアドレスを確認してください
  - 作成したユーザー名とパスワードを使用してログインします

<div class="eighty-percent">
    <img src={signup_page} class="image" alt="Select Plan" />
</div>
<br/>

ログインすると、ClickHouse Cloudは新しいClickHouseサービスの作成を案内するオンボーディングウィザードを開始します。最初に[プランを選択する](/cloud/manage/cloud-tiers)ように要求されます：

<div class="eighty-percent">
    <img src={select_plan} class="image" alt="Select Plan" />
</div>
<br/>

:::tip
ほとんどのワークロードにはスケールティアをお勧めします。
ティアに関する詳細は[こちら](/cloud/manage/cloud-tiers)で見つけることができます。
:::

プランを選択するには、最初のサービスをデプロイする地域を選択する必要があります。
利用可能なオプションは選択されたティアによって異なります。
以下のステップでは、ユーザーが推奨されるスケールティアを選択したと仮定しています。

サービスをデプロイするための希望の地域を選択し、新しいサービスに名前を付けます：

<div class="eighty-percent">
    <img src={createservice1} class="image" alt="New ClickHouse Service" />
</div>
<br/>

デフォルトでは、スケールティアは各4VCPUと16GiB RAMの3つのレプリカを作成します。[垂直自動スケーリング](/manage/scaling#vertical-auto-scaling)は、スケールティアではデフォルトで有効になります。

必要に応じて、ユーザーはサービスリソースをカスタマイズし、レプリカの最小および最大サイズを指定してスケーリング範囲を設定することができます。準備ができたら、`Create service`を選択します。

<div class="eighty-percent">
    <img src={scaling_limits} class="image" alt="Scaling Limits" />
</div>
<br/>

おめでとうございます！あなたのClickHouse Cloudサービスは稼働を開始し、オンボーディングが完了しました。データの取り込みとクエリの実行を開始する方法についての詳細を読み続けてください。

## 2. ClickHouseに接続する {#2-connect-to-clickhouse}
ClickHouseに接続するには2つの方法があります：
  - ウェブベースのSQLコンソールを使用して接続する
  - アプリから接続する

### SQLコンソールを使用して接続する {#connect-using-sql-console}

すぐに始めるには、ClickHouseはオンボーディングを完了した後、リダイレクトされるウェブベースのSQLコンソールを提供します。

<div class="eighty-percent">
    <img src={createservice8} class="image" alt="SQL Console" />
</div>
<br/>

クエリタブを作成し、接続が正常に動作していることを確認するために簡単なクエリを入力します：

<br/>
```sql
SHOW databases
```

リストには4つのデータベースが表示されるはずです。さらに、追加したものがあればそれも表示されます。

<div class="eighty-percent">
    <img src={show_databases} class="image" alt="SQL Console" />
</div>
<br/>

これで完了です - 新しいClickHouseサービスの使用を開始する準備が整いました！

### アプリから接続する {#connect-with-your-app}

ナビゲーションメニューから接続ボタンを押してください。モーダルが開き、サービスへの資格情報と、インターフェースまたは言語クライアントへの接続方法の指示が表示されます。

<div class="eighty-percent">
    <img src={service_connect} class="image" alt="Service Connect" />
</div>
<br/>

言語クライアントが表示されない場合、[統合](/integrations)のリストを確認することをお勧めします。

## 3. データを追加する {#3-add-data}

ClickHouseはデータがあればより良くなります！データを追加する方法は複数あり、そのほとんどがナビゲーションメニューでアクセスできるデータソースページで利用可能です。

<div class="eighty-percent">
    <img src={data_sources} class="image" alt="Data sources" />
</div>
<br/>

次の方法でデータをアップロードできます：
  - ClickPipeを設定して、S3、Postgres、Kafka、GCSなどのデータソースからデータを取り込む
  - SQLコンソールを使用する
  - ClickHouseクライアントを使用する
  - ファイルをアップロードする - 受け入れられる形式にはJSON、CSV、TSVが含まれます
  - ファイルURLからデータをアップロードする

### ClickPipes {#clickpipes}

[ClickPipes](http://clickhouse.com/docs/integrations/clickpipes)は、さまざまなソースからデータを簡単に取り込むための管理された統合プラットフォームです。最も要求の厳しいワークロード向けに設計されたClickPipesの堅牢でスケーラブルなアーキテクチャは、一貫したパフォーマンスと信頼性を確保します。ClickPipesは、長期的なストリーミングニーズや一回限りのデータロードジョブに使用できます。

<div class="eighty-percent">
    <img src={select_data_source} class="image" alt="Select data source" />
</div>
<br/>

### SQLコンソールを使用してデータを追加する {#add-data-using-the-sql-console}

ほとんどのデータベース管理システムと同様に、ClickHouseはテーブルを**データベース**に論理的にグループ化します。ClickHouseで新しいデータベースを作成するには、[`CREATE DATABASE`](../../sql-reference/statements/create/database.md)コマンドを使用します：

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

次のコマンドを実行して、`helloworld`データベースに`my_first_table`という名前のテーブルを作成します：

```sql
CREATE TABLE helloworld.my_first_table
(
    user_id UInt32,
    message String,
    timestamp DateTime,
    metric Float32
)
ENGINE = MergeTree()
PRIMARY KEY (user_id, timestamp)
```

上記の例では、`my_first_table`は4つのカラムを持つ[`MergeTree`](../../engines/table-engines/mergetree-family/mergetree.md)テーブルです：

  - `user_id`: 32ビット符号なし整数（[UInt32](../../sql-reference/data-types/int-uint.md)）
  - `message`: 他のデータベースシステムの`VARCHAR`、`BLOB`、`CLOB`などの型を置き換える[String](../../sql-reference/data-types/string.md)データ型
  - `timestamp`: 時間の単位を表す[DateTime](../../sql-reference/data-types/datetime.md)値
  - `metric`: 32ビット浮動小数点数（[Float32](../../sql-reference/data-types/float.md)）

:::note テーブルエンジン
テーブルエンジンは以下を決定します：
  - データがどのようにどこに保存されるか
  - サポートされるクエリ
  - データがレプリケートされるかどうか
<br/>
選択肢は多くのテーブルエンジンがありますが、単一ノードのClickHouseサーバー上の単純なテーブルの場合、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)が最も適しているでしょう。
:::

#### 主キーの簡単な紹介 {#a-brief-intro-to-primary-keys}

これ以上進む前に、ClickHouseで主キーがどのように機能するかを理解することが重要です（主キーの実装は予想外に思えるかもしれません！）：

  - ClickHouseの主キーは、テーブル内の各行に対して**一意ではない**です

ClickHouseテーブルの主キーは、ディスクに書き込まれる際のデータのソート方法を決定します。8,192行または10MBのデータ（**インデックスの粒度**と呼ばれます）ごとに、主キーインデックスファイルにエントリが作成されます。この粒度の概念は、メモリ内に簡単に収まる**スパースインデックス**を作成し、粒子は`SELECT`クエリ中に処理されるカラムデータの最小のストライプを表します。

主キーは`PRIMARY KEY`パラメータを使用して定義できます。`PRIMARY KEY`が指定されていないテーブルを定義すると、キーは`ORDER BY`句に指定されているタプルになります。`PRIMARY KEY`および`ORDER BY`の両方を指定すると、主キーはソート順序のサブセットでなければなりません。

主キーはまた、ソートキーでもあり、これは`(user_id, timestamp)`というタプルです。したがって、各カラムファイルに保存されるデータは`user_id`でソートされ、その後に`timestamp`でソートされます。

ClickHouseのコア概念について詳しく知りたい場合は、["コア概念"](../../managing-data/core-concepts/index.md)を参照してください。

#### テーブルにデータを挿入する {#insert-data-into-your-table}

ClickHouseでは、慣れ親しんだ[`INSERT INTO TABLE`](../../sql-reference/statements/insert-into.md)コマンドを使用できますが、`MergeTree`(/engines/table-engines/mergetree-family/mergetree.md)テーブルに挿入するたびにストレージに**パーツ**が作成されることを理解することが重要です。

:::tip ClickHouseのベストプラクティス
一度に数万行または数百万行をバッチで挿入してください。心配しないでください - ClickHouseはそのようなボリュームを簡単に処理できます - そして、サービスへの書き込み要求を減らすことで[コストを節約](/cloud/bestpractices/bulkinserts.md)できます。
:::

<br/>

単純な例でも、複数の行を一度に挿入してみましょう：

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

:::note
`timestamp`カラムは、さまざまな[**Date**](../../sql-reference/data-types/date.md)および[**DateTime**](../../sql-reference/data-types/datetime.md)関数を使用してデータがポピュレートされていることに注意してください。ClickHouseには、[**関数**セクション](/sql-reference/functions/)で見ることができる便利な関数が数百あります。
:::

すると、挿入が成功したか確認できます：

```sql
SELECT * FROM helloworld.my_first_table
```

### ClickHouseクライアントを使用してデータを追加する {#add-data-using-the-clickhouse-client}

コマンドラインツール[**clickhouse client**](/interfaces/cli)を使用してClickHouse Cloudサービスに接続することも可能です。左メニューの`Connect`をクリックしてこれらの詳細にアクセスします。ダイアログからドロップダウンメニューで`Native`を選択します：

<div class="eighty-percent">
    <img src={client_details} class="image" alt="clickhouse client connection details" />
</div>
<br/>

1. [ClickHouse](/interfaces/cli)をインストールします。

2. 次のコマンドを実行し、ホスト名、ユーザー名、パスワードを置き換えてください：

```bash
./clickhouse client --host HOSTNAME.REGION.CSP.clickhouse.cloud \
--secure --port 9440 \
--user default \
--password <password>
```
スマイリーフェイスのプロンプトが表示されれば、クエリを実行する準備が整いました！
```response
:)
```

3. 次のクエリを実行してみましょう：

<br/>

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

レスポンスがきれいなテーブル形式で返ってくるのに気付きます：

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

4. [`FORMAT`](../../sql-reference/statements/select/format.md)句を追加して、ClickHouseの[多くのサポートされている出力形式](/interfaces/formats/)の1つを指定します：

<br/>

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```
上記のクエリでは、出力がタブ区切りで返されます：
```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch	2022-03-21 00:00:00	1.41421
102 Sort your data based on your commonly-used queries	2022-03-22 00:00:00	2.718
101 Hello, ClickHouse!	2022-03-22 14:04:09	-1
101 Granules are the smallest chunks of data read	2022-03-22 14:04:14	3.14159

4 rows in set. Elapsed: 0.005 sec.
```

5. `clickhouse client`を終了するには、**exit**コマンドを入力します：

<br/>

```bash
exit
```

### ファイルをアップロードする {#upload-a-file}

データベースを始める際の一般的な作業は、すでにファイルにあるデータを挿入することです。ユーザーID、訪問されたURL、およびイベントのタイムスタンプを含むクリックストリームデータを表すサンプルデータをオンラインに用意しています。

次のような内容のCSVファイル`data.csv`があると仮定しましょう：

```bash title="data.csv"
102,This is data in a file,2022-02-22 10:43:28,123.45
101,It is comma-separated,2022-02-23 00:00:00,456.78
103,Use FORMAT to specify the format,2022-02-21 10:43:30,678.90
```

1. 以下のコマンドは、`my_first_table`にデータを挿入します：

<br/>

```bash
./clickhouse client --host HOSTNAME.REGION.CSP.clickhouse.cloud \
--secure --port 9440 \
--user default \
--password <password> \
--query='INSERT INTO helloworld.my_first_table FORMAT CSV' < data.csv
```

2. SQLコンソールからのクエリを実行すると、テーブルに新しい行が表示されることに注目します：

<br/>

<div class="eighty-percent">
    <img src={new_rows_from_csv} class="image" alt="New rows from CSV file" />
</div>
<br/>

## 次は何ですか？ {#whats-next}

- [チュートリアル](/tutorial.md)では、2百万行をテーブルに挿入して、いくつかの分析クエリを作成します
- データセットの[例のリスト](/getting-started/index.md)があり、それらを挿入する方法についての指示があります
- [ClickHouseの使い方に関する25分のビデオ](https://clickhouse.com/company/events/getting-started-with-clickhouse/)をチェックしてください
- 外部ソースからデータを取得する場合、メッセージキュー、データベース、パイプラインなどに接続するための[統合ガイドのコレクション](/integrations/index.mdx)をご覧ください
- UI/BI可視化ツールを使用している場合は、ClickHouseにUIを接続するための[ユーザーガイド](/integrations/data-visualization)を確認してください
- [主キー](/guides/best-practices/sparse-primary-indexes.md)に関するユーザーガイドは、主キーとは何か、どのように定義するかについて必要なすべての情報を提供します。
