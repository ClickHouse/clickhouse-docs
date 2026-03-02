---
sidebar_label: 'Superset'
sidebar_position: 198
slug: /integrations/superset
keywords: ['superset']
description: 'Apache Superset はオープンソースのデータ探索および可視化プラットフォームです。'
title: 'Superset を ClickHouse に接続する'
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


# Superset を ClickHouse に接続する \{#connect-superset-to-clickhouse\}

<ClickHouseSupportedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> は、Python で実装されたオープンソースのデータ探索および可視化プラットフォームです。Superset は ClickHouse が提供する Python ドライバーを利用して ClickHouse に接続します。どのように動作するのか見ていきましょう。

## 目的 \{#goal\}

このガイドでは、ClickHouse データベースのデータを使って Superset でダッシュボードを作成します。作成するダッシュボードは次のようになります:

<Image size="md" img={superset_12} alt="複数の円グラフやテーブルなどの可視化を含む、英国の不動産価格を表示する Superset ダッシュボード" border />

<br/>

:::tip データを追加する
まだ扱うデータセットがない場合は、サンプルデータセットのいずれかを追加できます。このガイドでは [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) データセットを使用するので、それを選ぶとよいでしょう。同じドキュメントカテゴリ内に、他にもいくつかのデータセットがあります。
:::

## 1. 接続情報を確認する \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. ドライバーをインストールする \{#2-install-the-driver\}

1. Superset は ClickHouse へ接続するために `clickhouse-connect` ドライバーを使用します。`clickhouse-connect` の詳細は <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a> に記載されており、次のコマンドでインストールできます。

    ```console
    pip install clickhouse-connect
    ```

    :::note Docker Compose Setup
    Docker ベースのセットアップの場合は、コンテナに `clickhouse-connect` を追加する手順について、[Superset database configuration guide](https://superset.apache.org/docs/configuration/databases/#clickhouse) を参照してください。
    :::

2. Superset を起動（または再起動）します。

## 3. Superset を ClickHouse に接続する \{#3-connect-superset-to-clickhouse\}

1. Superset で、上部メニューから **Data** を選択し、ドロップダウンメニューから **Databases** を選択します。**+ Database** ボタンをクリックして新しいデータベースを追加します：

<Image size="lg" img={superset_01} alt="Superset のインターフェイスで、Database メニューと強調表示された + Database ボタンが表示されている画面" border />

<br/>

2. 最初のステップで、データベースの種類として **ClickHouse Connect** を選択します：

<Image size="sm" img={superset_02} alt="ClickHouse Connect オプションが選択されている Superset のデータベース接続ウィザード" border />

<br/>

3. 2 番目のステップでは、次を行います：

- SSL を有効または無効に設定します。
- 先ほど収集した接続情報を入力します。
- **DISPLAY NAME** を指定します。これは任意の名前で構いません。複数の ClickHouse データベースに接続する場合は、より説明的な名前にします。

<Image size="sm" img={superset_03} alt="ClickHouse 接続パラメータが表示されている Superset の接続設定フォーム" border />

<br/>

4. **CONNECT** をクリックし、その後 **FINISH** ボタンをクリックしてセットアップウィザードを完了します。完了すると、データベース一覧に対象のデータベースが表示されます。

## 4. データセットを追加する \{#4-add-a-dataset\}

1. Superset で ClickHouse のデータを扱うには、**_データセット_** を定義する必要があります。Superset の上部メニューから **Data** を選択し、ドロップダウンメニューから **Datasets** を選択します。

2. データセットを追加するボタンをクリックします。新しいデータベースをデータソースとして選択すると、そのデータベース内で定義されているテーブルが表示されます。

<Image size="sm" img={superset_04} alt="ClickHouse データベースから利用可能なテーブルを表示している Superset のデータセット作成ダイアログ" border />

<br/>

3. ダイアログウィンドウ下部の **ADD** ボタンをクリックすると、テーブルがデータセット一覧に表示されます。これでダッシュボードを作成して ClickHouse のデータを分析する準備が整いました。

## 5.  Superset でチャートとダッシュボードを作成する \{#5--creating-charts-and-a-dashboard-in-superset\}

Superset に慣れている場合は、このセクションもすぐに理解できるはずです。Superset を初めて利用する場合でも、世の中にある他の多くの高機能な可視化ツールと同様に、使い始めるまでに時間はかからず、細かな使い方やコツはツールを使い込む中で徐々に身についていきます。

1. まずはダッシュボードから始めます。Superset の上部メニューから **Dashboards** を選択します。右上のボタンをクリックして新しいダッシュボードを追加します。次のダッシュボードは **UK property prices** という名前になっています。

<Image size="md" img={superset_05} alt="UK property prices という名前の空の Superset ダッシュボード。チャートを追加できる状態" border />

<br/>

2. 新しいチャートを作成するには、上部メニューから **Charts** を選択し、新しいチャートを追加するボタンをクリックします。多くのオプションが表示されます。次の例では、**CHOOSE A DATASET** ドロップダウンから **uk_price_paid** データセットを選択し、チャートタイプとして **Pie Chart** を使用しています。

<Image size="md" img={superset_06} alt="Pie Chart の可視化タイプが選択された Superset のチャート作成画面" border />

<br/>

3. Superset の円グラフには **Dimension** と **Metric** が必要で、その他の設定は任意です。ディメンションとメトリクスには任意のフィールドを選択できます。この例では、ディメンションに ClickHouse の `district` フィールドを、メトリクスに `AVG(price)` を使用しています。

<Image size="md" img={superset_08} alt="円グラフ用に district フィールドが選択されている Dimension 設定画面" border />

<Image size="md" img={superset_09} alt="円グラフ用に AVG(price) 集約関数が選択されている Metric 設定画面" border />

<br/>

5. 円グラフよりドーナツチャートの方が好みであれば、**CUSTOMIZE** セクションでその設定やその他のオプションを変更できます。

<Image size="sm" img={superset_10} alt="ドーナツチャートのオプションやその他の円グラフ設定が表示された Customize パネル" border />

<br/>

6. **SAVE** ボタンをクリックしてチャートを保存し、**ADD TO DASHBOARD** ドロップダウンから **UK property prices** を選択します。その後 **SAVE & GO TO DASHBOARD** をクリックすると、チャートが保存され、ダッシュボードに追加されます。

<Image size="md" img={superset_11} alt="ダッシュボード選択ドロップダウンと Save & Go to Dashboard ボタンが表示されたチャート保存ダイアログ" border />

<br/>

7. 以上です。ClickHouse のデータに基づいて Superset でダッシュボードを構築することで、超高速なデータ分析の世界が広がります。

<Image size="md" img={superset_12} alt="ClickHouse の UK property price データに対する複数の可視化を含む完成した Superset ダッシュボード" border />

<br/>