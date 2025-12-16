---
sidebar_label: 'Superset'
sidebar_position: 198
slug: /integrations/superset
keywords: ['superset']
description: 'Apache Superset は、オープンソースのデータ探索および可視化プラットフォームです。'
title: 'ClickHouse と Superset を接続する'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Superset を ClickHouse に接続する {#connect-superset-to-clickhouse}

<ClickHouseSupportedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> は、Python で構築されたオープンソースのデータ探索および可視化プラットフォームです。Superset は、ClickHouse が提供する Python ドライバーを使用して ClickHouse に接続します。ここでは、その仕組みを見ていきましょう。

## 目標 {#goal}

このガイドでは、ClickHouse データベースのデータを用いて、Superset でダッシュボードを作成します。ダッシュボードは次のようになります。

<Image size="md" img={superset_12} alt="複数の円グラフやテーブルなどの可視化を含む、英国の不動産価格を表示している Superset ダッシュボード" border />
<br/>

:::tip データを追加する
まだ扱うデータセットを持っていない場合は、サンプルデータセットのいずれかを追加できます。このガイドでは [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) データセットを使用しているので、それを選択するとよいでしょう。同じドキュメントカテゴリには、他にもいくつかのデータセットが用意されています。
:::

## 1. 接続情報を準備する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ドライバーをインストールする {#2-install-the-driver}

1. Superset は ClickHouse に接続するために `clickhouse-connect` ドライバーを使用します。`clickhouse-connect` の詳細は <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a> に記載されており、次のコマンドでインストールできます：

    ```console
    pip install clickhouse-connect
    ```

2. Superset を起動（または再起動）します。

## 3. Superset を ClickHouse に接続する {#3-connect-superset-to-clickhouse}

1. Superset で、上部メニューから **Data** を選択し、ドロップダウンメニューから **Databases** を選択します。**+ Database** ボタンをクリックして新しいデータベースを追加します:

<Image size="lg" img={superset_01} alt="Superset のインターフェイスで、Database メニューと強調表示された + Database ボタンが表示されている画面" border />
<br/>

2. 最初のステップで、データベース種別として **ClickHouse Connect** を選択します:

<Image size="sm" img={superset_02} alt="ClickHouse Connect オプションが選択された Superset のデータベース接続ウィザード" border />
<br/>

3. 2 番目のステップでは、次の設定を行います:
- SSL を有効または無効に設定します。
- 先ほど収集した接続情報を入力します。
- **DISPLAY NAME** を指定します。ここには任意の名前を設定できます。複数の ClickHouse データベースに接続する場合は、より説明的な名前にしてください。

<Image size="sm" img={superset_03} alt="ClickHouse 接続パラメータを示す Superset の接続設定フォーム" border />
<br/>

4. **CONNECT** ボタンをクリックし、続けて **FINISH** ボタンをクリックしてセットアップウィザードを完了します。完了後、データベース一覧に対象のデータベースが表示されます。

## 4. データセットを追加する {#4-add-a-dataset}

1. Superset で ClickHouse のデータを操作するには、**_dataset_** を定義する必要があります。Superset の上部メニューから **Data** を選択し、ドロップダウンメニューで **Datasets** を選択します。

2. データセットを追加するボタンをクリックします。新しいデータベースをデータソースとして選択すると、そのデータベース内で定義されているテーブルが表示されます。

<Image size="sm" img={superset_04} alt="ClickHouse データベースから利用可能なテーブルが表示された Superset のデータセット作成ダイアログ" border />
<br/>

3. ダイアログウィンドウの下部にある **ADD** ボタンをクリックすると、テーブルがデータセット一覧に表示されます。これでダッシュボードを作成し、ClickHouse のデータを分析する準備が整いました。

## 5.  Superset でチャートとダッシュボードを作成する {#5--creating-charts-and-a-dashboard-in-superset}

Superset に慣れている場合は、このセクションもすぐに馴染めるはずです。Superset を初めて使う場合でも、世の中にある他の多くの優れた可視化ツールと同様に、使い始めるのに時間はかからず、細かな設定やちょっとしたコツは、ツールを使い込む中で徐々に身についていきます。

1. まずはダッシュボードを作成します。Superset の上部メニューから **Dashboards** を選択します。右上のボタンをクリックして、新しいダッシュボードを追加します。次のダッシュボードは **UK property prices** という名前です:

<Image size="md" img={superset_05} alt="チャートを追加する準備ができた UK property prices という名前の空の Superset ダッシュボード" border />
<br/>

2. 新しいチャートを作成するには、上部メニューから **Charts** を選択し、新しいチャートを追加するボタンをクリックします。多くのオプションが表示されます。次の例では、**CHOOSE A DATASET** ドロップダウンメニューから **uk_price_paid** データセットを選択し、可視化タイプとして **Pie Chart** を使用しています:

<Image size="md" img={superset_06} alt="Pie Chart 可視化タイプが選択された Superset のチャート作成インターフェイス" border />
<br/>

3. Superset の円グラフには **Dimension** と **Metric** が必要で、それ以外の設定は任意です。Dimension と Metric に使うフィールドは自由に選択できます。この例では、Dimension に ClickHouse のフィールド `district` を、Metric に `AVG(price)` を使用しています。

<Image size="md" img={superset_08} alt="円グラフの Dimension 設定で district フィールドが選択されている例" border />
<Image size="md" img={superset_09} alt="円グラフの Metric 設定で AVG(price) 集計関数が選択されている例" border />
<br/>

5. 円グラフよりドーナツチャートが好みであれば、**CUSTOMIZE** セクションでその設定やその他のオプションを変更できます:

<Image size="sm" img={superset_10} alt="ドーナツチャートのオプションとその他の円グラフ設定を示す Customize パネル" border />
<br/>

6. **SAVE** ボタンをクリックしてチャートを保存し、**ADD TO DASHBOARD** ドロップダウンから **UK property prices** を選択してから **SAVE & GO TO DASHBOARD** をクリックすると、チャートが保存されてダッシュボードに追加されます:

<Image size="md" img={superset_11} alt="ダッシュボード選択ドロップダウンと Save & Go to Dashboard ボタンが表示されたチャート保存ダイアログ" border />
<br/>

7. 以上です。ClickHouse のデータに基づいて Superset でダッシュボードを構築することで、超高速なデータ分析の世界が一気に広がります。

<Image size="md" img={superset_12} alt="ClickHouse の UK property price データを複数の可視化で表示した完成済み Superset ダッシュボード" border />
<br/>
