---
sidebar_label: Explo
sidebar_position: 131
slug: /integrations/explo
keywords: [clickhouse, Explo, connect, integrate, ui]
description: Exploはデータに関する質問をするための使いやすいオープンソースのUIツールです。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import explo_01 from '@site/static/images/integrations/data-visualization/explo_01.png';
import explo_02 from '@site/static/images/integrations/data-visualization/explo_02.png';
import explo_03 from '@site/static/images/integrations/data-visualization/explo_03.png';
import explo_04 from '@site/static/images/integrations/data-visualization/explo_04.png';
import explo_05 from '@site/static/images/integrations/data-visualization/explo_05.png';
import explo_06 from '@site/static/images/integrations/data-visualization/explo_06.png';
import explo_07 from '@site/static/images/integrations/data-visualization/explo_07.png';
import explo_08 from '@site/static/images/integrations/data-visualization/explo_08.png';
import explo_09 from '@site/static/images/integrations/data-visualization/explo_09.png';
import explo_10 from '@site/static/images/integrations/data-visualization/explo_10.png';
import explo_11 from '@site/static/images/integrations/data-visualization/explo_11.png';
import explo_12 from '@site/static/images/integrations/data-visualization/explo_12.png';
import explo_13 from '@site/static/images/integrations/data-visualization/explo_13.png';
import explo_14 from '@site/static/images/integrations/data-visualization/explo_14.png';
import explo_15 from '@site/static/images/integrations/data-visualization/explo_15.png';
import explo_16 from '@site/static/images/integrations/data-visualization/explo_16.png';


# ExploをClickHouseに接続する

顧客向けの分析ツール。美しいビジュアライゼーションのために設計されています。シンプルさを追求してエンジニアリングされています。

## 目標 {#goal}

このガイドでは、ClickHouseからExploにデータを接続し、結果を可視化します。 チャートは以下のようになります：
<img src={explo_15} class="image" alt="Explo Dashboard" />

<p/>

:::tip データを追加
作業するデータセットがない場合は、サンプルの1つを追加できます。このガイドでは [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) データセットを使用しているので、それを選択することができます。同じドキュメントカテゴリーには他にもいくつかの例があります。
:::

## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ExploをClickHouseに接続する {#2--connect-explo-to-clickhouse}

1. Exploのアカウントにサインアップします。

2. 左側のサイドバーでExploの**データ**タブをクリックします。

<img src={explo_01} class="image" alt="Data Tab" />

3. 右上の**データソースを接続**をクリックします。

<img src={explo_02} class="image" alt="Connect Data Source" />

4. **Getting Started**ページの情報を入力します。

<img src={explo_03} class="image" alt="Getting Started" />

5. **Clickhouse**を選択します。

<img src={explo_04} class="image" alt="Clickhouse" />

6. **Clickhouseの認証情報**を入力します。

<img src={explo_05} class="image" alt="Credentials" />

7. **セキュリティ**設定を構成します。

<img src={explo_06} class="image" alt="Security" />

8. Clickhouse内で、**ExploのIPをホワイトリストに追加**します。
`
54.211.43.19, 52.55.98.121, 3.214.169.94, および 54.156.141.148
`

## 3. ダッシュボードを作成する {#3-create-a-dashboard}

1. 左側のナビゲーションバーで**ダッシュボード**タブに移動します。

<img src={explo_07} class="image" alt="Dashboard" />

2. 右上の**ダッシュボードを作成**をクリックし、ダッシュボードに名前を付けます。これでダッシュボードが作成されました！

<img src={explo_08} class="image" alt="Create Dashboard" />

3. 次のような画面が表示されるはずです：

<img src={explo_09} class="image" alt="Explo Dashboard" />

## 4. SQLクエリを実行する {#4-run-a-sql-query}

1. スキーマタイトルの右側のサイドバーからテーブル名を取得します。その後、データセットエディターに以下のコマンドを入力します：
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`

<img src={explo_10} class="image" alt="Explo Dashboard" />

2. 実行をクリックし、プレビュータブに移動してデータを確認します。

<img src={explo_11} class="image" alt="Explo Dashboard" />

## 5. チャートを作成する {#5-build-a-chart}

1. 左側からバーグラフアイコンを画面にドラッグします。

<img src={explo_16} class="image" alt="Explo Dashboard" />

2. データセットを選択します。次のような画面が表示されるはずです：

<img src={explo_12} class="image" alt="Explo Dashboard" />

3. **X軸**に**county**を、**Y軸**セクションに**Price**を次のように入力します：

<img src={explo_13} class="image" alt="Explo Dashboard" />

4. 次に、集計を**AVG**に変更します。

<img src={explo_14} class="image" alt="Explo Dashboard" />

5. これで、価格別に分けた住宅の平均価格が得られました！

<img src={explo_15} class="image" alt="Explo Dashboard" />

## 詳細を学ぶ {#learn-more}

Exploについての詳細情報やダッシュボードの作成方法については、<a href="https://docs.explo.co/" target="_blank">Exploのドキュメントを訪れて</a>ください。
