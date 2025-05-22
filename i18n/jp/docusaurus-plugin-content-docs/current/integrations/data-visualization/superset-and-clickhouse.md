---
'sidebar_label': 'Superset'
'sidebar_position': 198
'slug': '/integrations/superset'
'keywords':
- 'clickhouse'
- 'superset'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Apache Superset is an open-source data exploration and visualization
  platform.'
'title': 'Connect Superset to ClickHouse'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a>は、Pythonで書かれたオープンソースのデータ探索および可視化プラットフォームです。Supersetは、ClickHouseによって提供されるPythonドライバーを使用してClickHouseに接続します。どのように機能するか見てみましょう...

## 目標 {#goal}

このガイドでは、ClickHouseデータベースからのデータを使ってSupersetでダッシュボードを作成します。ダッシュボードは次のようになります。

<Image size="md" img={superset_12} alt="複数のビジュアライゼーションを含むUKの不動産価格を示すSupersetダッシュボード" border />
<br/>

:::tip データを追加する
作業するデータセットがない場合は、いずれかの例を追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用しているので、それを選択することもできます。同じドキュメントカテゴリー内には他にもいくつかの例があります。
:::

## 1. 接続情報を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ドライバーをインストールする {#2-install-the-driver}

1. SupersetはClickHouseに接続するために`clickhouse-connect`ドライバーを使用します。`clickhouse-connect`の詳細は<a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>で確認でき、次のコマンドでインストールできます：

    ```console
    pip install clickhouse-connect
    ```

2. Supersetを起動（または再起動）します。

## 3. SupersetをClickHouseに接続する {#3-connect-superset-to-clickhouse}

1. Superset内で、上部メニューから**Data**を選択し、ドロップダウンメニューから**Databases**を選択します。**+ Database**ボタンをクリックして新しいデータベースを追加します：

<Image size="lg" img={superset_01} alt="Databaseメニューを示し、+ Databaseボタンが強調表示されたSupersetインターフェイス" border />
<br/>

2. 最初のステップでは、データベースのタイプとして**ClickHouse Connect**を選択します：

<Image size="sm" img={superset_02} alt="ClickHouse Connectオプションが選択されているSupersetデータベース接続ウィザード" border />
<br/>

3. 二番目のステップでは：
  - SSLをオンまたはオフに設定します。
  - 以前に収集した接続情報を入力します。
  - **DISPLAY NAME**を指定します：これは任意の名前で構いません。他の複数のClickHouseデータベースに接続する場合は、より説明的な名前を付けてください。

<Image size="sm" img={superset_03} alt="ClickHouse接続パラメーターを示すSuperset接続構成フォーム" border />
<br/>

4. **CONNECT**ボタンをクリックし、次に**FINISH**ボタンをクリックしてセットアップウィザードを完了すると、データベースのリストにデータベースが表示されるはずです。

## 4. データセットを追加する {#4-add-a-dataset}

1. SupersetでClickHouseデータと対話するには、**_dataset_**を定義する必要があります。Supersetの上部メニューから**Data**を選択し、ドロップダウンメニューから**Datasets**を選択します。

2. データセットを追加するボタンをクリックします。データソースとして新しいデータベースを選択すると、データベースに定義されているテーブルが表示されます：

<Image size="sm" img={superset_04} alt="ClickHouseデータベースからの利用可能なテーブルを示すSupersetデータセット作成ダイアログ" border />
<br/>

3. ダイアログウィンドウの底部にある**ADD**ボタンをクリックすると、テーブルがデータセットのリストに表示されます。これでダッシュボードを作成し、ClickHouseデータを分析する準備が整いました！

## 5. Supersetでのチャートとダッシュボードを作成する {#5--creating-charts-and-a-dashboard-in-superset}

Supersetに慣れている方は、次のセクションをすぐに理解できるでしょう。Supersetが初めての方は...世界の他の多くのクールな可視化ツールのように、始めるのにそれほど時間はかかりませんが、詳細やニュアンスは使用しながら学んでいくことになります。

1. ダッシュボードから始めます。Supersetの上部メニューから**Dashboards**を選択します。右上のボタンをクリックして新しいダッシュボードを追加します。次のダッシュボードは**UK property prices**と名付けられています：

<Image size="md" img={superset_05} alt="チャートを追加する準備が整ったUK property pricesという名前の空のSupersetダッシュボード" border />
<br/>

2. 新しいチャートを作成するには、上部メニューから**Charts**を選択し、新しいチャートを追加するボタンをクリックします。多くのオプションが表示されます。次の例は、**CHOOSE A DATASET**ドロップダウンから**uk_price_paid**データセットを使用している**Pie Chart**です：

<Image size="md" img={superset_06} alt="Pie Chartビジュアライゼーションタイプが選択されているSupersetチャート作成インターフェイス" border />
<br/>

3. Supersetの円グラフには**Dimension**と**Metric**が必要で、残りの設定はオプションです。次元とメトリックには独自のフィールドを選択できます。この例では、ClickHouseフィールド`district`を次元、`AVG(price)`をメトリックとして使用しています。

<Image size="md" img={superset_08} alt="円グラフ用にdistrictフィールドが選択されている次元設定" border />
<Image size="md" img={superset_09} alt="円グラフ用にAVG(price)集約関数が設定されているメトリック設定" border />
<br/>

5. 円グラフよりもドーナツチャートを好む場合は、**CUSTOMIZE**の下でそれや他のオプションを設定できます：

<Image size="sm" img={superset_10} alt="ドーナツチャートオプションと他の円グラフ設定を示すカスタマイズパネル" border />
<br/>

6. **SAVE**ボタンをクリックしてチャートを保存し、次に**ADD TO DASHBOARD**ドロップダウンから**UK property prices**を選択し、**SAVE & GO TO DASHBOARD**を選択してチャートを保存しダッシュボードに追加します：

<Image size="md" img={superset_11} alt="ダッシュボード選択ドロップダウンとSave & Go to Dashboardボタンを含むチャート保存ダイアログ" border />
<br/>

7. 以上です。ClickHouseのデータに基づいてSupersetでダッシュボードを構築することで、高速なデータ分析の新しい世界が広がります！

<Image size="md" img={superset_12} alt="ClickHouseからのUK不動産価格データの複数のビジュアライゼーションを含む完成したSupersetダッシュボード" border />
<br/>

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでのデータの可視化 - パート2 - Superset](https://clickhouse.com/blog/visualizing-data-with-superset)
