---
title: 'Connecting Chartbrew to ClickHouse'
sidebar_label: 'Chartbrew'
sidebar_position: 131
slug: '/integrations/chartbrew-and-clickhouse'
keywords:
- 'ClickHouse'
- 'Chartbrew'
- 'connect'
- 'integrate'
- 'visualization'
description: 'Connect Chartbrew to ClickHouse to create real-time dashboards and
  client reports.'
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
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import Image from '@theme/IdealImage';


# ChartbrewをClickHouseに接続する

<CommunityMaintainedBadge/>

[Chartbrew](https://chartbrew.com)は、ユーザーがダッシュボードを作成し、リアルタイムでデータを監視できるデータ可視化プラットフォームです。ClickHouseを含む複数のデータソースをサポートしており、チャートやレポートを作成するためのノーコードインターフェースを提供します。

## 目標 {#goal}

このガイドでは、ChartbrewをClickHouseに接続し、SQLクエリを実行し、視覚化を作成します。最後には、あなたのダッシュボードは次のようになるかもしれません：

<Image img={chartbrew_01} size="lg" alt="Chartbrewダッシュボード" />

:::tip データを追加する
作業するデータセットがない場合は、例の一つを追加できます。このガイドでは、[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用します。
:::

## 1. 接続情報を集める {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. ChartbrewをClickHouseに接続する {#2-connect-chartbrew-to-clickhouse}

1. [Chartbrew](https://chartbrew.com/login)にログインし、**Connections**タブに移動します。
2. **Create connection**をクリックし、利用可能なデータベースオプションから**ClickHouse**を選択します。

   <Image img={chartbrew_02} size="lg" alt="ChartbrewでClickHouse接続を選択" />

3. ClickHouseデータベースの接続情報を入力します：

   - **Display Name**: Chartbrew内で接続を識別するための名前。
   - **Host**: ClickHouseサーバーのホスト名またはIPアドレス。
   - **Port**: 通常はHTTPS接続のために`8443`。
   - **Database Name**: 接続したいデータベース。
   - **Username**: あなたのClickHouseユーザー名。
   - **Password**: あなたのClickHouseパスワード。

   <Image img={chartbrew_03} size="lg" alt="ChartbrewでのClickHouse接続設定" />

4. **Test connection**をクリックして、ChartbrewがClickHouseに接続できるか確認します。
5. テストが成功した場合は、**Save connection**をクリックします。ChartbrewはClickHouseからスキーマを自動的に取得します。

   <Image img={chartbrew_04} size="lg" alt="ChartbrewのClickHouse JSONスキーマ" />

## 3. データセットを作成し、SQLクエリを実行する {#3-create-a-dataset-and-run-a-sql-query}

1. **Create dataset**ボタンをクリックするか、**Datasets**タブに移動して作成します。
2. 前に作成したClickHouse接続を選択します。

   <Image img={chartbrew_05} size="lg" alt="データセット用のClickHouse接続を選択" />

  可視化するデータを取得するためのSQLクエリを書きます。たとえば、このクエリは`uk_price_paid`データセットから年ごとの平均支払価格を計算します：

  ```sql
  SELECT toYear(date) AS year, avg(price) AS avg_price
  FROM uk_price_paid
  GROUP BY year
  ORDER BY year;
  ```

   <Image img={chartbrew_07} size="lg" alt="ChartbrewのClickHouse SQLクエリ" />

  **Run query**をクリックしてデータを取得します。

  クエリの書き方がわからない場合は、**ChartbrewのAIアシスタント**を使用して、データベーススキーマに基づいたSQLクエリを生成できます。

<Image img={chartbrew_06} size="lg" alt="ChartbrewのClickHouse AI SQLアシスタント" />

データが取得されたら、**Configure dataset**をクリックして、視覚化パラメータを設定します。

## 4. 視覚化を作成する {#4-create-a-visualization}

1. 視覚化のためのメトリック（数値）とディメンション（カテゴリカル値）を定義します。
2. データセットをプレビューして、クエリ結果が正しく構造化されていることを確認します。
3. チャートタイプ（例：折れ線グラフ、棒グラフ、円グラフ）を選択し、それをダッシュボードに追加します。
4. **Complete dataset**をクリックして、設定を確定します。

   <Image img={chartbrew_08} size="lg" alt="ClickHouseデータを使用したChartbrewダッシュボード" />

   データの異なる側面を視覚化するために、希望するだけ多くのデータセットを作成できます。これらのデータセットを使用して、異なるメトリックを管理するための複数のダッシュボードを作成できます。

   <Image img={chartbrew_01} size="lg" alt="ClickHouseデータを使用したChartbrewダッシュボード" />

## 5. データの自動更新を設定する {#5-automate-data-updates}

ダッシュボードを最新の状態に保つためには、データの自動更新をスケジュールできます：

1. データセットの更新ボタンの横にあるカレンダーアイコンをクリックします。
2. 更新間隔を設定します（例：毎時、毎日）。
3. 設定を保存して、自動更新を有効にします。

   <Image img={chartbrew_09} size="lg" alt="Chartbrewデータセット更新設定" />

## もっと学ぶ {#learn-more}

詳細については、[ChartbrewとClickHouse](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/)に関するブログ記事をご覧ください。
