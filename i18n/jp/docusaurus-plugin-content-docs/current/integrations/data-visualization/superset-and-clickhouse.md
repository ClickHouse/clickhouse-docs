---
sidebar_label: 'Superset'
sidebar_position: 198
slug: /integrations/superset
keywords: ['superset']
description: 'Apache Superset は、オープンソースのデータ探索および可視化プラットフォームです。'
title: 'Superset を ClickHouse に接続する'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Superset を ClickHouse に接続する

<ClickHouseSupportedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> は、Python で実装されたオープンソースのデータ探索・可視化プラットフォームです。Superset は、ClickHouse が提供する Python ドライバーを使用して ClickHouse に接続します。では、その仕組みを見ていきましょう。



## Goal {#goal}

このガイドでは、ClickHouseデータベースのデータを使用してSupersetでダッシュボードを構築します。完成したダッシュボードは次のようになります:

<Image
  size='md'
  img={superset_12}
  alt='円グラフやテーブルなど複数の可視化で英国不動産価格を表示するSupersetダッシュボード'
  border
/>
<br />

:::tip データの追加
作業用のデータセットがない場合は、サンプルデータセットの1つを追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用しているため、こちらを選択することをお勧めします。同じドキュメントカテゴリには他にもいくつかのサンプルがあります。
:::


## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. ドライバーのインストール {#2-install-the-driver}

1. Supersetは`clickhouse-connect`ドライバーを使用してClickHouseに接続します。`clickhouse-connect`の詳細は<a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>で確認でき、以下のコマンドでインストールできます:

   ```console
   pip install clickhouse-connect
   ```

2. Supersetを起動(または再起動)します。


## 3. SupersetをClickHouseに接続する {#3-connect-superset-to-clickhouse}

1. Superset内で、上部メニューから**Data**を選択し、ドロップダウンメニューから**Databases**を選択します。**+ Database**ボタンをクリックして新しいデータベースを追加します:

<Image
  size='lg'
  img={superset_01}
  alt='+ Databaseボタンがハイライトされたデータベースメニューを表示するSupersetインターフェース'
  border
/>
<br />

2. 最初のステップで、データベースのタイプとして**ClickHouse Connect**を選択します:

<Image
  size='sm'
  img={superset_02}
  alt='ClickHouse Connectオプションが選択されたSupersetデータベース接続ウィザード'
  border
/>
<br />

3. 2番目のステップで:

- SSLをオンまたはオフに設定します。
- 先ほど収集した接続情報を入力します
- **DISPLAY NAME**を指定します: 任意の名前を設定できます。複数のClickHouseデータベースに接続する場合は、より説明的な名前を付けてください。

<Image
  size='sm'
  img={superset_03}
  alt='ClickHouse接続パラメータを表示するSuperset接続設定フォーム'
  border
/>
<br />

4. **CONNECT**ボタンをクリックし、次に**FINISH**ボタンをクリックしてセットアップウィザードを完了すると、データベースのリストに追加したデータベースが表示されます。


## 4. データセットの追加 {#4-add-a-dataset}

1. SupersetでClickHouseデータを操作するには、**_データセット_**を定義する必要があります。Supersetの上部メニューから**Data**を選択し、ドロップダウンメニューから**Datasets**を選択します。

2. データセット追加ボタンをクリックします。データソースとして新しいデータベースを選択すると、データベースに定義されているテーブルが表示されます:

<Image
  size='sm'
  img={superset_04}
  alt='ClickHouseデータベースから利用可能なテーブルを表示するSupersetデータセット作成ダイアログ'
  border
/>
<br />

3. ダイアログウィンドウ下部の**ADD**ボタンをクリックすると、テーブルがデータセットのリストに表示されます。これでダッシュボードを構築し、ClickHouseデータを分析する準備が整いました!


## 5. Supersetでチャートとダッシュボードを作成する {#5--creating-charts-and-a-dashboard-in-superset}

Supersetに慣れている方であれば、このセクションもスムーズに進められるでしょう。Supersetが初めての方でも心配ありません。他の優れた可視化ツールと同様に、使い始めるのは簡単ですが、細かい機能や使いこなし方はツールを使っていく中で自然と身についていきます。

1. まずダッシュボードから始めます。Supersetの上部メニューから**Dashboards**を選択します。右上のボタンをクリックして新しいダッシュボードを追加します。以下のダッシュボードは**UK property prices**という名前です:

<Image
  size='md'
  img={superset_05}
  alt='チャートを追加する準備ができたUK property pricesという名前の空のSupersetダッシュボード'
  border
/>
<br />

2. 新しいチャートを作成するには、上部メニューから**Charts**を選択し、新しいチャートを追加するボタンをクリックします。多くのオプションが表示されます。以下の例では、**CHOOSE A DATASET**ドロップダウンから**uk_price_paid**データセットを使用した**Pie Chart**を示しています:

<Image
  size='md'
  img={superset_06}
  alt='Pie Chart可視化タイプが選択されたSupersetチャート作成インターフェース'
  border
/>
<br />

3. Supersetの円グラフには**Dimension**と**Metric**が必要で、その他の設定はオプションです。ディメンションとメトリックには任意のフィールドを選択できます。この例では、ClickHouseのフィールド`district`をディメンションとして、`AVG(price)`をメトリックとして使用しています。

<Image
  size='md'
  img={superset_08}
  alt='円グラフ用にdistrictフィールドが選択されたディメンション設定'
  border
/>
<Image
  size='md'
  img={superset_09}
  alt='円グラフ用のAVG(price)集計関数を示すメトリック設定'
  border
/>
<br />

5. 円グラフよりもドーナツグラフを好む場合は、**CUSTOMIZE**でその設定やその他のオプションを変更できます:

<Image
  size='sm'
  img={superset_10}
  alt='ドーナツグラフオプションとその他の円グラフ設定を示すカスタマイズパネル'
  border
/>
<br />

6. **SAVE**ボタンをクリックしてチャートを保存し、**ADD TO DASHBOARD**ドロップダウンから**UK property prices**を選択した後、**SAVE & GO TO DASHBOARD**をクリックしてチャートを保存しダッシュボードに追加します:

<Image
  size='md'
  img={superset_11}
  alt='ダッシュボード選択ドロップダウンとSave & Go to Dashboardボタンを含むチャート保存ダイアログ'
  border
/>
<br />

7. 以上です。ClickHouseのデータに基づいてSupersetでダッシュボードを構築することで、超高速データ分析の世界が広がります!

<Image
  size='md'
  img={superset_12}
  alt='ClickHouseからのUK不動産価格データの複数の可視化を含む完成したSupersetダッシュボード'
  border
/>
<br />
