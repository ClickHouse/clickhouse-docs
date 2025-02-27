---
sidebar_label: Explo
sidebar_position: 131
slug: /integrations/explo
keywords: [clickhouse, Explo, 接続, 統合, UI]
description: Exploは、データに関する質問を行うための使いやすく、オープンソースのUIツールです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# ExploをClickHouseに接続する

顧客向け分析はあらゆるプラットフォームに対応。美しいビジュアライゼーションのためにデザインされ、シンプルさを追求しています。

## 目的 {#goal}

このガイドでは、ClickHouseのデータをExploに接続して結果を可視化します。 チャートは以下のようになります。
<img src={require('./images/explo_15.png').default} class="image" alt="Explo Dashboard" />

<p/>

:::tip データを追加する
使用するデータセットがない場合は、例の一つを追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用するので、それを選択しても良いでしょう。同じドキュメンテーションカテゴリには、他にもいくつかのデータセットがあります。
:::

## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ExploをClickHouseに接続する {#2--connect-explo-to-clickhouse}

1. Exploアカウントにサインアップします。

2. 左側のサイドバーでExploの**データ**タブをクリックします。

<img src={require('./images/explo_01.png').default} class="image" alt="Data Tab" />

3. 右上の**データソースに接続**をクリックします。

<img src={require('./images/explo_02.png').default} class="image" alt="Connect Data Source" />

4. **始めに**ページの情報を入力します。

<img src={require('./images/explo_03.png').default} class="image" alt="Getting Started" />

5. **Clickhouse**を選択します。

<img src={require('./images/explo_04.png').default} class="image" alt="Clickhouse" />

6. **Clickhouseの認証情報**を入力します。

<img src={require('./images/explo_05.png').default} class="image" alt="Credentials" />

7. **セキュリティ**を設定します。

<img src={require('./images/explo_06.png').default} class="image" alt="Security" />

8. ClickHouse内で**ExploのIPをホワイトリストに追加**します。
`
54.211.43.19, 52.55.98.121, 3.214.169.94, その他
`

## 3. ダッシュボードを作成する {#3-create-a-dashboard}

1. 左側のナビゲーションバーで**ダッシュボード**タブに移動します。

<img src={require('./images/explo_07.png').default} class="image" alt="Dashboard" />

2. 右上の**ダッシュボードを作成**をクリックし、ダッシュボードに名前を付けます。これでダッシュボードが作成されました！

<img src={require('./images/explo_08.png').default} class="image" alt="Create Dashboard" />

3. あなたは今、以下のような画面を見ることができるはずです：

<img src={require('./images/explo_09.png').default} class="image" alt="Explo Dashboard" />

## 4. SQLクエリを実行する {#4-run-a-sql-query}

1. スキーマタイトルの下にある右側のサイドバーからテーブル名を取得します。次に、データセットエディターに以下のコマンドを入力します：
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`

<img src={require('./images/explo_10.png').default} class="image" alt="Explo Dashboard" />

2. 次に実行をクリックし、プレビュータブに移動してデータを確認します。

<img src={require('./images/explo_11.png').default} class="image" alt="Explo Dashboard" />

## 5. チャートを作成する {#5-build-a-chart}

1. 左側から棒グラフアイコンを画面にドラッグします。

<img src={require('./images/explo_16.png').default} class="image" alt="Explo Dashboard" />

2. データセットを選択します。次のような画面が表示されるはずです：

<img src={require('./images/explo_12.png').default} class="image" alt="Explo Dashboard" />

3. X軸に**county**、Y軸のセクションに**Price**を以下のように入力します：

<img src={require('./images/explo_13.png').default} class="image" alt="Explo Dashboard" />

4. 集計方法を**AVG**に変更します。

<img src={require('./images/explo_14.png').default} class="image" alt="Explo Dashboard" />

5. これで、住宅の平均価格を価格別に分解したものが得られました！

<img src={require('./images/explo_15.png').default} class="image" alt="Explo Dashboard" />

## 詳細情報 {#learn-more}

Exploについてのさらなる情報やダッシュボードの作成方法は、<a href="https://docs.explo.co/" target="_blank">Exploのドキュメントを訪問する</a>ことで確認できます。
