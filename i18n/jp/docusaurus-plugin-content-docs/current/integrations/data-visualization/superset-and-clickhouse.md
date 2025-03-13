---
sidebar_label: Superset
sidebar_position: 198
slug: /integrations/superset
keywords: [clickhouse, superset, connect, integrate, ui]
description: Apache Supersetはオープンソースのデータ探索および視覚化プラットフォームです。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import superset_01 from '@site/static/images/integrations/data-visualization/superset_01.png';
import superset_02 from '@site/static/images/integrations/data-visualization/superset_02.png';
import superset_03 from '@site/static/images/integrations/data-visualization/superset_03.png';
import superset_04 from '@site/static/images/integrations/data-visualization/superset_04.png';
import superset_05 from '@site/static/images/integrations/data-visualization/superset_05.png';
import superset_06 from '@site/static/images/integrations/data-visualization/superset_06.png';
import superset_08 from '@site/static/images/integrations/data-visualization/superset_08.png';
import superset_09 from '@site/static/images/integrations/data-visualization/superset_09.png';
import superset_10 from '@site/static/images/integrations/data-visualization/superset_10.png';
import superset_11 from '@site/static/images/integrations/data-visualization/superset_11.png';
import superset_12 from '@site/static/images/integrations/data-visualization/superset_12.png';


# SupersetをClickHouseに接続する

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a>は、Pythonで書かれたオープンソースのデータ探索および視覚化プラットフォームです。SupersetはClickHouseに接続するために、ClickHouseが提供するPythonドライバーを使用します。その仕組みを見てみましょう...

## 目標 {#goal}

このガイドでは、ClickHouseデータベースのデータを使用してSupersetにダッシュボードを作成します。ダッシュボードは次のようになります:

<img alt="New Dashboard" src={superset_12}/>
<br/>

:::tip データを追加する
作業するデータセットがない場合は、例の1つを追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用するので、それを選択することができます。同じ文書カテゴリ内には、他にもいくつかの選択肢があります。
:::

## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ドライバーをインストールする {#2-install-the-driver}

1. Supersetは、ClickHouseに接続するために`clickhouse-connect`ドライバーを使用します。`clickhouse-connect`の詳細は<a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>にあり、次のコマンドでインストールできます:

    ```console
    pip install clickhouse-connect
    ```

2. Supersetを開始（または再起動）します。

## 3. SupersetをClickHouseに接続する {#3-connect-superset-to-clickhouse}

1. Superset内で、上部メニューから**Data**を選択し、ドロップダウンメニューから**Databases**を選択します。**+ Database**ボタンをクリックして新しいデータベースを追加します:

<img alt="Add a new database" src={superset_01}/>
<br/>

2. 最初のステップで、データベースのタイプとして**ClickHouse Connect**を選択します:

<img alt="Select Clickhouse" src={superset_02}/>
<br/>

3. 2番目のステップでは:
  - SSLをオンまたはオフに設定します。
  - 先に収集した接続情報を入力します。
  - **DISPLAY NAME**を指定します: これはお好みの名前にすることができます。複数のClickHouseデータベースに接続する場合は、より説明的な名前にしてください。

<img alt="Test the connection" src={superset_03}/>
<br/>

4. **CONNECT**ボタンをクリックし、次に**FINISH**ボタンをクリックしてセットアップウィザードを完了すると、データベースがデータベースのリストに表示されるはずです。

## 4. データセットを追加する {#4-add-a-dataset}

1. SupersetでClickHouseデータと対話するためには、**_データセット_**を定義する必要があります。Supersetの上部メニューから**Data**を選択し、ドロップダウンメニューから**Datasets**を選択します。

2. データセットを追加するためのボタンをクリックします。新しいデータベースをデータソースとして選択すると、データベース内で定義されているテーブルが表示されます:

<img alt="New dataset" src={superset_04}/>
<br/>

3. ダイアログウィンドウの下部にある**ADD**ボタンをクリックすると、あなたのテーブルがデータセットのリストに表示されます。これでダッシュボードの作成とClickHouseデータの分析を行う準備が整いました！

## 5. Supersetでのチャートとダッシュボードの作成 {#5--creating-charts-and-a-dashboard-in-superset}

Supersetに慣れている方には、この次のセクションはすぐに理解できるでしょう。Supersetが初めての方には...他のクールな視覚化ツールと同様に、始めるのは簡単ですが、詳細やニュアンスは使用しながら学んでいくことになります。

1. ダッシュボードから始めます。Supersetの上部メニューから**Dashboards**を選択します。右上のボタンをクリックして新しいダッシュボードを追加します。次のダッシュボードの名前は**UK property prices**です:

<img alt="New dashboard" src={superset_05}/>
<br/>

2. 新しいチャートを作成するには、上部メニューから**Charts**を選択し、新しいチャートを追加するためのボタンをクリックします。たくさんのオプションが表示されます。次の例では、**CHOOSE A DATASET**ドロップダウンから**uk_price_paid**データセットを使用した**Pie Chart**チャートを示しています:

<img alt="New chart" src={superset_06}/>
<br/>

3. Supersetの円グラフには**Dimension**と**Metric**が必要で、残りの設定はオプションです。次元とメトリックのためのフィールドを自分で選ぶことができ、この例ではClickHouseフィールド`district`を次元として、`AVG(price)`をメトリックとして使用しています。

<img alt="The SUM metric" src={superset_08}/>
<img alt="The SUM metric" src={superset_09}/>
<br/>

5. 円グラフの代わりにドーナツグラフを好む場合は、**CUSTOMIZE**の下でそれと他のオプションを設定できます:

<img alt="Add Chart to Dashboard" src={superset_10}/>
<br/>

6. **SAVE**ボタンをクリックしてチャートを保存し、次に**ADD TO DASHBOARD**のドロップダウンから**UK property prices**を選択し、最後に**SAVE & GO TO DASHBOARD**を選択すると、チャートが保存されてダッシュボードに追加されます:

<img alt="Add Chart to Dashboard" src={superset_11}/>
<br/>

7. これで終了です。ClickHouseのデータを基にSupersetでダッシュボードを構築すると、超高速のデータ分析の世界が開けます！

<img alt="New Dashboard" src={superset_12}/>
<br/>

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでのデータ視覚化 - パート2 - Superset](https://clickhouse.com/blog/visualizing-data-with-superset)
