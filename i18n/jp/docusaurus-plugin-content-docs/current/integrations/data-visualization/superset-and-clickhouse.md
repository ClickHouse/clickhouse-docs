---
'sidebar_label': 'Superset'
'sidebar_position': 198
'slug': '/integrations/superset'
'keywords':
- 'superset'
'description': 'Apache Supersetはオープンソースのデータ探索および可視化プラットフォームです。'
'title': 'SupersetをClickHouseに接続する'
'show_related_blogs': true
'doc_type': 'guide'
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

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a>は、Pythonで書かれたオープンソースのデータ探索および可視化プラットフォームです。Supersetは、ClickHouseが提供するPythonドライバーを使用してClickHouseに接続します。どのように機能するか見てみましょう...

## 目標 {#goal}

このガイドでは、ClickHouseデータベースからのデータを使用してSupersetでダッシュボードを構築します。ダッシュボードは以下のようになります：

<Image size="md" img={superset_12} alt="UKの不動産価格を複数の視覚化（円グラフや表を含む）で示したSupersetダッシュボード" border />
<br/>

:::tip データを追加する
作業するデータセットがない場合は、例の一つを追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用するので、それを選ぶことができます。同じドキュメントカテゴリに他にもいくつかありますので、確認してみてください。
:::

## 1. 接続の詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ドライバーをインストールする {#2-install-the-driver}

1. Supersetは、ClickHouseに接続するために`clickhouse-connect`ドライバーを使用します。`clickhouse-connect`の詳細は<a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>にあり、以下のコマンドでインストールできます：

```console
pip install clickhouse-connect
```

2. Supersetを開始（または再起動）します。

## 3. SupersetをClickHouseに接続する {#3-connect-superset-to-clickhouse}

1. Superset内で、上部メニューから**データ**を選択し、ドロップダウンメニューから**データベース**を選択します。**+ データベース**ボタンをクリックして新しいデータベースを追加します：

<Image size="lg" img={superset_01} alt="データベースメニューに+ データベースボタンがハイライトされたSupersetインターフェース" border />
<br/>

2. 最初のステップでは、データベースのタイプとして**ClickHouse Connect**を選択します：

<Image size="sm" img={superset_02} alt="ClickHouse Connectオプションが選択されたSupersetデータベース接続ウィザード" border />
<br/>

3. 2番目のステップで：
- SSLをオンまたはオフに設定します。
- 前に収集した接続情報を入力します。
- **表示名**を指定します：これはお好みの名前にできます。複数のClickHouseデータベースに接続する場合は、より説明的な名前をつけてください。

<Image size="sm" img={superset_03} alt="ClickHouse接続パラメーターを示すSuperset接続設定フォーム" border />
<br/>

4. **接続**ボタンと次に**完了**ボタンをクリックしてセットアップウィザードを完了させると、データベースのリストにあなたのデータベースが表示されるはずです。

## 4. データセットを追加する {#4-add-a-dataset}

1. SupersetでClickHouseデータと対話するには、**_データセット_**を定義する必要があります。Supersetの上部メニューから**データ**を選択し、ドロップダウンメニューから**データセット**を選択します。

2. データセットを追加するボタンをクリックします。データソースとして新しいデータベースを選択すると、そのデータベースで定義されたテーブルが表示されます：

<Image size="sm" img={superset_04} alt="ClickHouseデータベースからの利用可能なテーブルを示すSupersetデータセット作成ダイアログ" border />
<br/>

3. ダイアログウィンドウの下部にある**追加**ボタンをクリックすると、テーブルがデータセットのリストに表示されます。ダッシュボードを構築し、ClickHouseデータを分析する準備が整いました！

## 5. Supersetでのチャートとダッシュボードの作成 {#5--creating-charts-and-a-dashboard-in-superset}

Supersetに慣れている方には、このセクションは楽に感じられるでしょう。Supersetが初めての方へ...他の素晴らしい可視化ツールと同様に、始めるのはあまり時間がかかりませんが、詳細やニュアンスはツールを使用する中で徐々に学ばれていきます。

1. ダッシュボードから始めます。Supersetの上部メニューから**ダッシュボード**を選択します。右上のボタンをクリックして新しいダッシュボードを追加します。以下のダッシュボードは**UK property prices**と名付けられています：

<Image size="md" img={superset_05} alt="チャート追加の準備が整ったUK property pricesという名前の空のSupersetダッシュボード" border />
<br/>

2. 新しいチャートを作成するには、上部メニューから**チャート**を選択し、新しいチャートを追加するボタンをクリックします。多くのオプションが表示されます。以下の例では、**CHOOSE A DATASET**ドロップダウンからの**uk_price_paid**データセットを使用した**円グラフ**の例です：

<Image size="md" img={superset_06} alt="円グラフの視覚化タイプが選択されたSupersetチャート作成インターフェース" border />
<br/>

3. Supersetの円グラフには**次元**と**メトリック**が必要で、他の設定はオプションです。次元とメトリックのフィールドを自分で選ぶことができます。この例では、次元としてClickHouseフィールド`district`を、メトリックとして`AVG(price)`を使用しています。

<Image size="md" img={superset_08} alt="円グラフ用に選択されたdistrictフィールドを示す次元設定" border />
<Image size="md" img={superset_09} alt="円グラフ用の集計関数AVG(price)を示すメトリック設定" border />
<br/>

5. 円グラフよりもドーナツグラフを好む場合は、**カスタマイズ**の下で設定できます：

<Image size="sm" img={superset_10} alt="ドーナツグラフオプションと他の円グラフ設定を示すカスタマイズパネル" border />
<br/>

6. **保存**ボタンをクリックしてチャートを保存し、次に**ADD TO DASHBOARD**ドロップダウンから**UK property prices**を選択し、**SAVE & GO TO DASHBOARD**をクリックするとチャートが保存され、ダッシュボードに追加されます：

<Image size="md" img={superset_11} alt="ダッシュボード選択ドロップダウンとSave & Go to Dashboardボタンを含むチャート保存ダイアログ" border />
<br/>

7. これで完了です。ClickHouseのデータに基づくSupersetでのダッシュボードの構築は、驚異的に速いデータ分析の世界を開きます！

<Image size="md" img={superset_12} alt="ClickHouseからのUKプロパティ価格データのさまざまな視覚化が含まれる完成したSupersetダッシュボード" border />
<br/>
