---
'sidebar_label': 'Explo'
'sidebar_position': 131
'slug': '/integrations/explo'
'keywords':
- 'clickhouse'
- 'Explo'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Exploは、あなたのデータに関する質問をするための使いやすいオープンソースのUIツールです。'
'title': 'ExploをClickHouseに接続する'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ExploをClickHouseに接続する

<CommunityMaintainedBadge/>

顧客向けの分析をすべてのプラットフォーム向けに。美しいビジュアライゼーションのために設計されています。シンプルさのためにエンジニアリングされています。

## 目標 {#goal}

このガイドでは、ClickHouseからExploにデータを接続し、結果をビジュアライズします。チャートは以下のようになります：
<Image img={explo_15} size="md" alt="Explo Dashboard" />

<p/>

:::tip データを追加する
作業するためのデータセットをお持ちでない場合は、例の1つを追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用しているので、それを選ぶことができます。同じドキュメントカテゴリーに他のいくつかのデータセットもあります。
:::

## 1. 接続詳細を取得する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ExploをClickHouseに接続する {#2--connect-explo-to-clickhouse}

1. Exploアカウントにサインアップします。

2. 左側のサイドバーのExplo **データ**タブをクリックします。

<Image img={explo_01} size="sm" alt="Data Tab" border />

3. 右上の**データソースを接続**をクリックします。

<Image img={explo_02} size="sm" alt="Connect Data Source" border />

4. **はじめに**ページの情報を記入します。

<Image img={explo_03} size="md" alt="Getting Started" border />

5. **Clickhouse**を選択します。

<Image img={explo_04} size="md" alt="Clickhouse" border />

6. **Clickhouseクレデンシャル**を入力します。

<Image img={explo_05} size="md" alt="Credentials" border />

7. **セキュリティ**を設定します。

<Image img={explo_06} size="md" alt="Security" border />

8. Clickhouse内で、**ExploのIPをホワイトリスト**に追加します。
`
54.211.43.19, 52.55.98.121, 3.214.169.94, and 54.156.141.148
`

## 3. ダッシュボードを作成する {#3-create-a-dashboard}

1. 左側のナビゲーションバーの**ダッシュボード**タブに移動します。

<Image img={explo_07} size="sm" alt="Dashboard" border />

2. 右上の**ダッシュボードを作成**をクリックし、ダッシュボードに名前を付けます。これでダッシュボードが作成されました！

<Image img={explo_08} size="sm" alt="Create Dashboard" border />

3. 次に、以下のような画面が表示されるはずです：

<Image img={explo_09} size="md" alt="Explo Dashboard" border />

## 4. SQLクエリを実行する {#4-run-a-sql-query}

1. スキーマタイトルの下にある右側のサイドバーからテーブル名を取得します。次に、データセットエディターに以下のコマンドを入力します：
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`

<Image img={explo_10} size="md" alt="Explo Dashboard" border />

2. それから実行をクリックし、プレビュータブに移動してデータを表示してください。

<Image img={explo_11} size="md" alt="Explo Dashboard" border />

## 5. チャートを作成する {#5-build-a-chart}

1. 左側から、棒グラフアイコンを画面にドラッグします。

<Image img={explo_16} size="sm" alt="Explo Dashboard" border />

2. データセットを選択します。次に、以下のような画面が表示されるはずです：

<Image img={explo_12} size="sm" alt="Explo Dashboard" border />

3. X軸に**county**、Y軸セクションに**Price**を以下のように記入します：

<Image img={explo_13} size="sm" alt="Explo Dashboard" border />

4. 次に、集計を**AVG**に変更します。

<Image img={explo_14} size="sm" alt="Explo Dashboard" border />

5. これで価格別に分けた住宅の平均価格が得られました！

<Image img={explo_15} size="md" alt="Explo Dashboard" />

## さらに学ぶ {#learn-more}

Exploやダッシュボードの作成方法についての詳細は、<a href="https://docs.explo.co/" target="_blank">Exploのドキュメントを訪問する</a>ことで見つけることができます。
