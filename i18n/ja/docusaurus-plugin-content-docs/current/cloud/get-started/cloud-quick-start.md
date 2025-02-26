---
sidebar_position: 1
slug: /cloud/get-started/cloud-quick-start
sidebar_label: クラウドクイックスタート
keywords: [clickhouse, install, getting started, quick start]
pagination_next: cloud/get-started/sql-console
---
import SQLConsoleDetail from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_launch_sql_console.md';

# ClickHouseクラウド クイックスタート

ClickHouseを使用開始する最も簡単で迅速な方法は、[ClickHouse Cloud](https://console.clickhouse.cloud)で新しいサービスを作成することです。

## 1. ClickHouseサービスの作成 {#1-create-a-clickhouse-service}

[ClickHouse Cloud](https://console.clickhouse.cloud)で無料のClickHouseサービスを作成するには、次の手順を完了してサインアップするだけです：

  - [サインアップページ](https://console.clickhouse.cloud/signUp)でアカウントを作成
  - 電子メールまたはGoogle SSO、Microsoft SSO、AWS Marketplace、Google Cloud、Microsoft Azureを使用してサインアップできます
  - 電子メールとパスワードを使用してサインアップした場合、次の24時間以内に受け取ったリンクを介して電子メールアドレスを確認することを忘れないでください
  - 作成したユーザー名とパスワードを使用してログイン

<div class="eighty-percent">
![Select Plan](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/signup_page.png)
</div>
<br/>

ログインすると、ClickHouse Cloudが新しいClickHouseサービスを作成するためのオンボーディングウィザードを開始します。最初に[プランの選択](/cloud/manage/cloud-tiers)を求められます：

<div class="eighty-percent">
![Select Plan](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/select_plan.png)
</div>
<br/>

:::tip
ほとんどのワークロードには、Scale tierを推奨します。 
プランの詳細は[こちら](/cloud/manage/cloud-tiers)で確認できます。
:::

プランを選択するには、最初のサービスをデプロイする希望のリージョンを選択する必要があります。利用可能なオプションは選択したTierに依存します。以下のステップでは、ユーザーが推奨されるScale tierを選択したと仮定します。

サービスをデプロイするための希望のリージョンを選択し、新しいサービスに名前を付けます：

<div class="eighty-percent">
![New ClickHouse Service](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/createservice1.png)
</div>
<br/>

デフォルトでは、スケールティアはそれぞれ4 VCPUと16 GiB RAMの3つのレプリカを作成します。[垂直オートスケーリング](/manage/scaling#vertical-auto-scaling)は、デフォルトでScale tierに有効になります。

ユーザーは必要に応じてサービスリソースをカスタマイズでき、レプリカがスケールする最小および最大サイズを指定できます。準備ができたら、`Create service`を選択します。

<div class="eighty-percent">
![Scaling Limits](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/scaling_limits.png)
</div>
<br/>

おめでとうございます！あなたのClickHouse Cloudサービスが稼働しており、オンボーディングが完了しました。この後、データの取り込みとクエリの実行を開始する方法についての詳細をお読みください。

## 2. ClickHouseに接続 {#2-connect-to-clickhouse}
ClickHouseに接続する方法は2つあります：
  - ウェブベースのSQLコンソールを使用して接続
  - アプリを使用して接続

### SQLコンソールを使用して接続 {#connect-using-sql-console}

迅速に開始するために、ClickHouseはウェブベースのSQLコンソールを提供しており、オンボーディングが完了するとこのコンソールにリダイレクトされます。

<div class="eighty-percent">
![SQL Console](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/createservice8.png)
</div>
<br/>

クエリタブを作成し、接続が正常に機能しているか確認するために簡単なクエリを入力します：

<br/>
```sql
SHOW databases
```

リストには4つのデータベースと、追加した可能性のあるデータベースが表示されるはずです。

<div class="eighty-percent">
![SQL Console](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/show_databases.png)
</div>
<br/>

これで、あなたの新しいClickHouseサービスの使用を開始する準備が整いました！

### アプリを使用して接続 {#connect-with-your-app}

ナビゲーションメニューから接続ボタンを押します。ダイアログが開き、サービスの認証情報や、インターフェースや言語クライアントに接続する方法に関する一連の指示が提供されます。

<div class="eighty-percent">
![Service Connect](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/service_connect.png)
</div>
<br/>

もし自分の言語クライアントが表示されない場合は、[統合のリスト](/integrations)を確認すると良いでしょう。

## 3. データを追加 {#3-add-data}

ClickHouseはデータと共により良くなります！データを追加する方法はいくつかあり、そのほとんどはナビゲーションメニューからアクセスできるデータソースページにあります。

<div class="eighty-percent">
![Data sources](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/data_sources.png)
</div>
<br/>

以下の方法を使用してデータをアップロードできます：
  - S3、Postgres、Kafka、GCSなどのデータソースからデータを取り込むためにClickPipeを設定
  - SQLコンソールを使用
  - ClickHouseクライアントを使用
  - ファイルをアップロード - 対応しているフォーマットはJSON、CSV、TSVを含む
  - ファイルURLからデータをアップロード

### ClickPipes {#clickpipes}

[ClickPipes](http://clickhouse.com/docs/integrations/clickpipes)は、多様なソースからのデータ取り込みを数回のクリックで簡単に行える管理統合プラットフォームです。最も要求の厳しいワークロードに合わせて設計されており、ClickPipesの堅牢でスケーラブルなアーキテクチャは、一貫したパフォーマンスと信頼性を保証します。ClickPipesは、長期的なストリーミングニーズや一回限りのデータロードジョブに使用できます。

<div class="eighty-percent">
![Select data source](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/select_data_source.png)
</div>
<br/>

### SQLコンソールを使ってデータを追加 {#add-data-using-the-sql-console}

ほとんどのデータベース管理システムと同様に、ClickHouseはテーブルを**データベース**に論理的にグループ化します。[`CREATE DATABASE`](../../sql-reference/statements/create/database.md)コマンドを使用してClickHouseに新しいデータベースを作成します：

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

  - `user_id`:  32ビットの符号なし整数（[UInt32](../../sql-reference/data-types/int-uint.md)）
  - `message`: ローカル環境でのデータ型である[文字列](../../sql-reference/data-types/string.md)、`VARCHAR`、`BLOB`、`CLOB`などの他のデータベースシステムの型の代わりとして使用される
  - `timestamp`: 特定の瞬間を表す[日付時間](../../sql-reference/data-types/datetime.md)値
  - `metric`: 32ビットの浮動小数点数（[Float32](../../sql-reference/data-types/float.md)）

:::note テーブルエンジン
テーブルエンジンは以下を決定します：
  - データがどのように、どこに格納されるか
  - どのクエリがサポートされるか
  - データがレプリケートされるかどうか
<br/>
選択できるテーブルエンジンは多数ありますが、シングルノードのClickHouseサーバー上のシンプルなテーブルには、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)が適しているでしょう。
:::

#### 主キーの簡単な紹介 {#a-brief-intro-to-primary-keys}

さらに進む前に、ClickHouseにおける主キーの動作を理解することが重要です（主キーの実装は予想外であるかもしれません！）：

  - ClickHouseの主キーは、テーブル内の各行に対して**_一意ではありません_**  

ClickHouseテーブルの主キーは、データがディスクに書き込まれる際にどのようにソートされるかを決定します。8,192行または10MBのデータ（**インデックスの粒度**と呼ばれる）の単位で、主キーインデックスファイルにエントリが作成されます。この粒度の概念は、メモリに収まるスパースインデックスを作成し、粒子は`SELECT`クエリの際に処理される最小限のカラムデータのストライプを表します。

主キーは、`PRIMARY KEY`パラメータを使用して定義できます。`PRIMARY KEY`を指定せずにテーブルを定義すると、キーは`ORDER BY`句で指定されたタプルになります。`PRIMARY KEY`と`ORDER BY`の両方を指定した場合、主キーはソート順のサブセットである必要があります。

主キーはまたソートキーでもあり、`(user_id, timestamp)`のタプルです。したがって、各カラムファイルに保存されたデータは`user_id`、次に`timestamp`でソートされます。

ClickHouseのコア概念の詳細については、["コア概念"](../../managing-data/core-concepts/index.md)を参照してください。

#### テーブルにデータを挿入 {#insert-data-into-your-table}

ClickHouseでは、通常の[`INSERT INTO TABLE`](../../sql-reference/statements/insert-into.md)コマンドを使用できますが、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)テーブルに挿入される各挿入は、ストレージに**パーツ**を作成することを理解することが重要です。

:::tip ClickHouseのベストプラクティス
バッチごとに大量の行を挿入します - 数万行または数百万行を一度に。心配しないでください - ClickHouseはその量を簡単に処理でき、サービスへの書き込みリクエストを少なくすることで[コストを節約できます](/cloud/bestpractices/bulkinserts.md)。
:::

<br/>

シンプルな例でも、一度に複数の行を挿入してみましょう：

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

:::note
`timestamp`カラムは、さまざまな[**日付**](../../sql-reference/data-types/date.md)および[**日付時間**](../../sql-reference/data-types/datetime.md)関数を使用して埋められていることに注意してください。ClickHouseには、[**関数**のセクション](/sql-reference/functions/)で表示できる数百の便利な関数があります。
:::

正常に動作したか確認しましょう：

```sql
SELECT * FROM helloworld.my_first_table
```

### ClickHouseクライアントを使ってデータを追加 {#add-data-using-the-clickhouse-client}

また、[**clickhouse client**](/interfaces/cli)というコマンドラインツールを使用してClickHouse Cloudサービスに接続することもできます。左メニューで`Connect`をクリックしてこれらの詳細にアクセスします。ダイアログでドロップダウンから`Native`を選択します：

<div class="eighty-percent">
![clickhouse client connection details](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/client_details.png)
</div>
<br/>

1. [ClickHouse](/interfaces/cli)をインストールします。

2. コマンドを実行し、ホスト名、ユーザー名、パスワードを置き換えます：
  
```bash
./clickhouse client --host HOSTNAME.REGION.CSP.clickhouse.cloud \
--secure --port 9440 \
--user default \
--password <password>
```
スマイリーフェイスのプロンプトが表示された場合は、クエリを実行する準備ができています！
```response
:)
```

3. 以下のクエリを実行してみましょう：

<br/>

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

レスポンスがきれいなテーブル形式で返ってくることに注意してください：

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

### ファイルをアップロード {#upload-a-file}

データベースを始めるときの一般的なタスクは、既にファイルにあるデータを挿入することです。クリックストリームデータを表すサンプルデータがオンラインにあり、ユーザーID、訪問したURL、およびイベントのタイムスタンプが含まれています。

例えば、`data.csv`という名前のCSVファイルに以下のテキストがあるとします：

```bash title="data.csv"
102,これはファイル内のデータです,2022-02-22 10:43:28,123.45
101,カンマ区切りです,2022-02-23 00:00:00,456.78
103,FORMATを使用して形式を指定,2022-02-21 10:43:30,678.90
```

1. 次のコマンドは、データを`my_first_table`に挿入します：

<br/>

```bash
./clickhouse client --host HOSTNAME.REGION.CSP.clickhouse.cloud \
--secure --port 9440 \
--user default \
--password <password> \
--query='INSERT INTO helloworld.my_first_table FORMAT CSV' < data.csv
```

2. SQLコンソールからクエリを実行した際に、新しい行がテーブルに表示されることに注意してください：

<br/>

<div class="eighty-percent">
![New rows from CSV file](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/new_rows_from_csv.png)
</div>
<br/>

## 次は何をするべきか？ {#whats-next}

- [チュートリアル](/tutorial.md)では、2百万行をテーブルに挿入し、いくつかの分析クエリを書くことができます
- 挿入方法に関する指示を含む[サンプルデータセットのリスト](/getting-started/index.md)があります
- [ClickHouseの使い方に関する25分の動画](https://clickhouse.com/company/events/getting-started-with-clickhouse/)をご覧ください
- 外部ソースからデータが来る場合、メッセージキュー、データベース、パイプラインなどへの接続に関する[統合ガイドのコレクション](/integrations/index.mdx)を参照してください
- UI/BI可視化ツールを使用している場合、ClickHouseにUIを接続するための[ユーザーガイド](/integrations/data-visualization)をご覧ください
- [主キーに関するユーザーガイド](/guides/best-practices/sparse-primary-indexes.md)では、主キーに関する情報とその定義方法についてすべての必要な情報を提供しています。
