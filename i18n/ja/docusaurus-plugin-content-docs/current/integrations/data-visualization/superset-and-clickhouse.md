---
sidebar_label: Superset
sidebar_position: 198
slug: /integrations/superset
keywords: [clickhouse, superset, connect, integrate, ui]
description: Apache Supersetはオープンソースのデータ探索と可視化プラットフォームです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# SupersetをClickHouseに接続する

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a>は、Pythonで書かれたオープンソースのデータ探索と可視化プラットフォームです。SupersetはClickHouseにClickHouseが提供するPythonドライバを使用して接続します。では、これがどのように機能するか見てみましょう...

## 目標 {#goal}

このガイドでは、ClickHouseデータベースからのデータを使用してSuperset内にダッシュボードを構築します。ダッシュボードは以下のようになります：

![新しいダッシュボード](./images/superset_12.png)

:::tip データを追加する
作業するデータセットがない場合は、サンプルのいずれかを追加できます。このガイドでは、[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用しますので、そのデータセットを選ぶことができます。同じドキュメントカテゴリには他にもいくつかのデータセットがあります。
:::

## 1. 接続情報を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ドライバをインストールする {#2-install-the-driver}

1. SupersetはClickHouseに接続するために`clickhouse-connect`ドライバを使用します。`clickhouse-connect`の詳細は<a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>にあり、以下のコマンドでインストールできます：

    ```console
    pip install clickhouse-connect
    ```

2. Supersetを起動（または再起動）します。

## 3. SupersetをClickHouseに接続する {#3-connect-superset-to-clickhouse}

1. Superset内で、上部メニューから**Data**を選択し、ドロップダウンメニューから**Databases**を選びます。**+ Database**ボタンをクリックして新しいデータベースを追加します：

![新しいデータベースを追加](./images/superset_01.png)

2. 最初のステップでは、データベースのタイプとして**ClickHouse Connect**を選択します：

![Clickhouseを選択](./images/superset_02.png)

3. 次のステップでは：
  - SSLをオンまたはオフに設定します。
  - 事前に収集した接続情報を入力します。
  - **DISPLAY NAME**を指定します：これはお好みの名前にできます。複数のClickHouseデータベースに接続する場合は、より説明的な名前にしてください。

![接続をテストする](./images/superset_03.png)

4. **CONNECT**ボタンをクリックし、その後**FINISH**ボタンをクリックしてセットアップウィザードを完了させます。これでデータベースのリストに表示されるはずです。

## 4. データセットを追加する {#4-add-a-dataset}

1. Supersetを使用してClickHouseデータと対話するためには、**_データセット_**を定義する必要があります。Supersetの上部メニューから**Data**を選択し、次にドロップダウンメニューから**Datasets**を選択します。

2. データセットを追加するボタンをクリックします。新しいデータベースをデータソースとして選択すると、データベースに定義されたテーブルが表示されるはずです：

![新しいデータセット](./images/superset_04.png)

3. ダイアログウィンドウの下部にある**ADD**ボタンをクリックすると、テーブルがデータセットのリストに表示されます。これでダッシュボードを構築し、ClickHouseデータを分析する準備が整いました！

## 5. Supersetでチャートとダッシュボードを作成する {#5--creating-charts-and-a-dashboard-in-superset}

Supersetに慣れている場合、この次のセクションはとても簡単に感じるでしょう。Supersetが初めての場合...これは世界にある他の多くの素晴らしい可視化ツールのようなもので、始めるのにはさほど時間がかかりませんが、詳細やニュアンスはツールを使用する中で徐々に学んでいきます。

1. ダッシュボードから始めます。Supersetの上部メニューから**Dashboards**を選択します。右上のボタンをクリックして新しいダッシュボードを追加します。次のダッシュボードは**UK property prices**という名前です：

![新しいダッシュボード](./images/superset_05.png)

2. 新しいチャートを作成するには、上部メニューから**Charts**を選択し、新しいチャートを追加するボタンをクリックします。多くのオプションが表示されます。次の例では、**CHOOSE A DATASET**のドロップダウンから**uk_price_paid**データセットを使用した**Pie Chart**のチャートを示しています：

![新しいチャート](./images/superset_06.png)

3. Supersetの円グラフには**Dimension**と**Metric**が必要で、その他の設定はオプションです。次のように、自分のフィールドを次元とメトリックとして選択できます。この例では、ClickHouseのフィールド`district`を次元として、`AVG(price)`をメトリックに使用しています。

![SUMメトリック](./images/superset_08.png)
![SUMメトリック](./images/superset_09.png)

5. 円グラフよりもドーナツグラフを好む場合は、**CUSTOMIZE**の下でそれを設定できます：

![ダッシュボードにチャートを追加](./images/superset_10.png)

6. **SAVE**ボタンをクリックしてチャートを保存し、次に**ADD TO DASHBOARD**のドロップダウンから**UK property prices**を選択し、**SAVE & GO TO DASHBOARD**をクリックすると、チャートが保存され、ダッシュボードに追加されます：

![ダッシュボードにチャートを追加](./images/superset_11.png)

7. これで完了です。ClickHouseのデータに基づいたダッシュボードをSupersetで構築することで、高速なデータ分析の世界が開けます！

![新しいダッシュボード](./images/superset_12.png)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでデータを可視化する - パート2 - Superset](https://clickhouse.com/blog/visualizing-data-with-superset)
