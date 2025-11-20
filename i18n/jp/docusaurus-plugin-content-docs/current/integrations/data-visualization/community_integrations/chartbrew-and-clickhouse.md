---
title: 'Chartbrew を ClickHouse に接続する'
sidebar_label: 'Chartbrew'
sidebar_position: 131
slug: /integrations/chartbrew-and-clickhouse
keywords: ['ClickHouse', 'Chartbrew', 'connect', 'integrate', 'visualization']
description: 'Chartbrew を ClickHouse に接続して、リアルタイムダッシュボードやクライアント向けレポートを作成します。'
doc_type: 'guide'
---

import chartbrew_01 from '@site/static/images/integrations/data-visualization/chartbrew_01.png';
import chartbrew_02 from '@site/static/images/integrations/data-visualization/chartbrew_02.png';
import chartbrew_03 from '@site/static/images/integrations/data-visualization/chartbrew_03.png';
import chartbrew_04 from '@site/static/images/integrations/data-visualization/chartbrew_04.png';
import chartbrew_05 from '@site/static/images/integrations/data-visualization/chartbrew_05.png';
import chartbrew_06 from '@site/static/images/integrations/data-visualization/chartbrew_06.png';
import chartbrew_07 from '@site/static/images/integrations/data-visualization/chartbrew_07.png';
import chartbrew_08 from '@site/static/images/integrations/data-visualization/chartbrew_08.png';
import chartbrew_09 from '@site/static/images/integrations/data-visualization/chartbrew_09.png';

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import Image from '@theme/IdealImage';


# Chartbrew を ClickHouse に接続する

<CommunityMaintainedBadge/>

[Chartbrew](https://chartbrew.com) は、ユーザーがダッシュボードを作成し、データをリアルタイムで監視できるデータ可視化プラットフォームです。ClickHouse を含む複数のデータソースをサポートしており、チャートやレポートをノーコードで作成するためのインターフェイスを提供します。



## 目標 {#goal}

このガイドでは、ChartbrewをClickHouseに接続し、SQLクエリを実行して可視化を作成します。完成すると、ダッシュボードは次のようになります:

<Image img={chartbrew_01} size='lg' alt='Chartbrewダッシュボード' />

:::tip データを追加する
使用するデータセットがない場合は、サンプルデータセットのいずれかを追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用します。
:::


## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. ChartbrewをClickHouseに接続する {#2-connect-chartbrew-to-clickhouse}

1. [Chartbrew](https://chartbrew.com/login)にログインし、**Connections**タブに移動します。
2. **Create connection**をクリックし、利用可能なデータベースオプションから**ClickHouse**を選択します。

   <Image
     img={chartbrew_02}
     size='lg'
     alt='ChartbrewでClickHouse接続を選択'
   />

3. ClickHouseデータベースの接続情報を入力します:
   - **Display Name**: Chartbrew内で接続を識別するための名前
   - **Host**: ClickHouseサーバーのホスト名またはIPアドレス
   - **Port**: HTTPS接続の場合は通常`8443`
   - **Database Name**: 接続先のデータベース名
   - **Username**: ClickHouseのユーザー名
   - **Password**: ClickHouseのパスワード

   <Image
     img={chartbrew_03}
     size='lg'
     alt='ChartbrewでのClickHouse接続設定'
   />

4. **Test connection**をクリックして、ChartbrewがClickHouseに接続できることを確認します。
5. テストが成功したら、**Save connection**をクリックします。ChartbrewはClickHouseからスキーマを自動的に取得します。

   <Image
     img={chartbrew_04}
     size='lg'
     alt='ChartbrewでのClickHouse JSONスキーマ'
   />


## 3. データセットを作成してSQLクエリを実行する {#3-create-a-dataset-and-run-a-sql-query}

1. **Create dataset**ボタンをクリックするか、**Datasets**タブに移動してデータセットを作成します。
2. 先ほど作成したClickHouse接続を選択します。

<Image
  img={chartbrew_05}
  size='lg'
  alt='データセット用のClickHouse接続を選択'
/>

可視化したいデータを取得するSQLクエリを記述します。例えば、次のクエリは`uk_price_paid`データセットから年ごとの平均支払価格を計算します:

```sql
SELECT toYear(date) AS year, avg(price) AS avg_price
FROM uk_price_paid
GROUP BY year
ORDER BY year;
```

<Image img={chartbrew_07} size='lg' alt='ChartbrewでのClickHouse SQLクエリ' />

**Run query**をクリックしてデータを取得します。

クエリの記述方法が不明な場合は、**ChartbrewのAIアシスタント**を使用してデータベーススキーマに基づいたSQLクエリを生成できます。

<Image
  img={chartbrew_06}
  size='lg'
  alt='ChartbrewのClickHouse AI SQLアシスタント'
/>

データが取得されたら、**Configure dataset**をクリックして可視化パラメータを設定します。


## 4. 可視化を作成する {#4-create-a-visualization}

1. 可視化に使用するメトリック（数値）とディメンション（カテゴリ値）を定義します。
2. データセットをプレビューして、クエリ結果が正しく構造化されていることを確認します。
3. チャートタイプ（折れ線グラフ、棒グラフ、円グラフなど）を選択し、ダッシュボードに追加します。
4. **Complete dataset** をクリックして設定を完了します。

<Image
  img={chartbrew_08}
  size='lg'
  alt='ClickHouseデータを使用したChartbrewダッシュボード'
/>

データのさまざまな側面を可視化するために、必要な数だけデータセットを作成できます。これらのデータセットを使用して、異なるメトリックを追跡するための複数のダッシュボードを作成できます。

<Image
  img={chartbrew_01}
  size='lg'
  alt='ClickHouseデータを使用したChartbrewダッシュボード'
/>


## 5. データ更新の自動化 {#5-automate-data-updates}

ダッシュボードを最新の状態に保つために、データの自動更新をスケジュール設定できます:

1. データセット更新ボタンの横にあるカレンダーアイコンをクリックします。
2. 更新間隔を設定します（例: 1時間ごと、1日ごと）。
3. 設定を保存して自動更新を有効化します。

<Image img={chartbrew_09} size='lg' alt='Chartbrewデータセット更新設定' />


## 詳細情報 {#learn-more}

詳細については、[ChartbrewとClickHouse](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/)に関するブログ記事をご確認ください。
