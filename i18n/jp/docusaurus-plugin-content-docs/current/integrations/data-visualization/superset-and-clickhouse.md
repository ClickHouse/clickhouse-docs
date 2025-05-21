---
sidebar_label: 'Superset'
sidebar_position: 198
slug: /integrations/superset
keywords: ['clickhouse', 'superset', 'connect', 'integrate', 'ui']
description: 'Apache Supersetはオープンソースのデータ探索および可視化プラットフォームです。'
title: 'SupersetをClickHouseに接続する'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# SupersetをClickHouseに接続する

<CommunityMaintainedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a>は、Pythonで書かれたオープンソースのデータ探索および可視化プラットフォームです。SupersetはClickHouseに、ClickHouseが提供するPythonドライバーを使用して接続します。それがどのように機能するか見てみましょう...

## 目標 {#goal}

このガイドでは、ClickHouseデータベースのデータを使用してSupersetでダッシュボードを構築します。ダッシュボードは次のようになります：

<Image size="md" img={superset_12} alt="複数の可視化を含むUKの不動産価格を示すSupersetダッシュボード" border />
<br/>

:::tip データを追加する
作業に必要なデータセットがない場合は、いずれかの例を追加できます。このガイドでは、[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用しますので、それを選択することをお勧めします。同じドキュメントカテゴリには他にもいくつかの選択肢があります。
:::

## 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ドライバーをインストールする {#2-install-the-driver}

1. Supersetは、ClickHouseに接続するために`clickhouse-connect`ドライバーを使用します。`clickhouse-connect`の詳細は<a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>で確認でき、次のコマンドでインストールできます：

    ```console
    pip install clickhouse-connect
    ```

2. Supersetを開始（または再起動）します。

## 3. SupersetをClickHouseに接続する {#3-connect-superset-to-clickhouse}

1. Superset内で、上部メニューから**Data**を選択し、ドロップダウンメニューから**Databases**を選択します。**+ Database**ボタンをクリックして新しいデータベースを追加します：

<Image size="lg" img={superset_01} alt="データベースメニューと強調表示された+ Databaseボタンを示すSupersetインターフェース" border />
<br/>

2. 最初のステップで、データベースのタイプとして**ClickHouse Connect**を選択します：

<Image size="sm" img={superset_02} alt="ClickHouse Connectオプションが選択されたSupersetデータベース接続ウィザード" border />
<br/>

3. 2つ目のステップで：
  - SSLをオンまたはオフに設定します。
  - 以前に収集した接続情報を入力します。
  - **DISPLAY NAME**を指定します：これはお好きな名前を付けることができます。複数のClickHouseデータベースに接続する場合は、より説明的な名前を付けてください。

<Image size="sm" img={superset_03} alt="ClickHouse接続パラメータを示すSuperset接続設定フォーム" border />
<br/>

4. **CONNECT**ボタンをクリックし、次に**FINISH**ボタンをクリックしてセットアップウィザードを完了させると、データベースがデータベースのリストに表示されます。

## 4. データセットを追加する {#4-add-a-dataset}

1. SupersetでClickHouseデータと対話するには、**_dataset_**を定義する必要があります。Supersetの上部メニューから**Data**を選択し、ドロップダウンメニューから**Datasets**を選択します。

2. データセットを追加するためのボタンをクリックします。データソースとして新しいデータベースを選択すると、データベースに定義されたテーブルが表示されます：

<Image size="sm" img={superset_04} alt="ClickHouseデータベースからの利用可能なテーブルを示すSupersetデータセット作成ダイアログ" border />
<br/>

3. ダイアログウィンドウの下部にある**ADD**ボタンをクリックすると、テーブルがデータセットのリストに表示されます。ダッシュボードを構築してClickHouseデータを分析する準備が整いました！

## 5. Supersetでチャートとダッシュボードを作成する {#5--creating-charts-and-a-dashboard-in-superset}

Supersetに慣れているなら、この次のセクションで快適に感じるでしょう。Supersetが初めての場合は...、他の多くの素晴らしい可視化ツールと同様に、始めるのは簡単ですが、詳細やニュアンスは使用するにつれて学ぶことができます。

1. ダッシュボードから始めます。Supersetの上部メニューから**Dashboards**を選択します。右上のボタンをクリックして新しいダッシュボードを追加します。次のダッシュボードの名前は**UK property prices**です：

<Image size="md" img={superset_05} alt="チャートを追加する準備が整った空のSupersetダッシュボードUK property prices" border />
<br/>

2. 新しいチャートを作成するには、上部メニューから**Charts**を選択し、新しいチャートを追加するボタンをクリックします。多数のオプションが表示されます。次の例は、**CHOOSE A DATASET**ドロップダウンから**uk_price_paid**データセットを使用した**Pie Chart**チャートを示しています：

<Image size="md" img={superset_06} alt="Pie Chart可視化タイプが選択されたSupersetチャート作成インターフェース" border />
<br/>

3. Supersetの円グラフには**Dimension**と**Metric**が必要で、他の設定はオプションです。次の例ではClickHouseのフィールド`district`をDimensionとして、`AVG(price)`をMetricとして選択しています。

<Image size="md" img={superset_08} alt="円グラフ用にdistrictフィールドが選択された次元設定" border />
<Image size="md" img={superset_09} alt="円グラフ用にAVG(price)集約関数が表示されたメトリック設定" border />
<br/>

5. 円グラフよりもドーナツグラフを好む場合は、**CUSTOMIZE**の下でそれと他のオプションを設定できます：

<Image size="sm" img={superset_10} alt="ドーナツグラフオプションと他の円グラフ設定が表示されたカスタマイズパネル" border />
<br/>

6. **SAVE**ボタンをクリックしてチャートを保存し、**ADD TO DASHBOARD**ドロップダウンから**UK property prices**を選択し、**SAVE & GO TO DASHBOARD**をクリックするとチャートが保存され、ダッシュボードに追加されます：

<Image size="md" img={superset_11} alt="ダッシュボード選択ドロップダウンとSave & Go to Dashboardボタンが表示されたチャート保存ダイアログ" border />
<br/>

7. 以上で完了です。ClickHouseのデータに基づいてSupersetでダッシュボードを構築することで、驚異的に高速なデータ分析の新たな世界が開けます！

<Image size="md" img={superset_12} alt="ClickHouseのUK不動産価格データの複数の可視化が完成したSupersetダッシュボード" border />
<br/>

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseによるデータの視覚化 - パート2 - Superset](https://clickhouse.com/blog/visualizing-data-with-superset)
