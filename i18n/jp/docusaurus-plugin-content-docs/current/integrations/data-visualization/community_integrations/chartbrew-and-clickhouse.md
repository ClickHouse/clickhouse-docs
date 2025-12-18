---
title: 'Chartbrew を ClickHouse に接続する'
sidebar_label: 'Chartbrew'
sidebar_position: 131
slug: /integrations/chartbrew-and-clickhouse
keywords: ['ClickHouse', 'Chartbrew', 'connect', 'integrate', 'visualization']
description: 'Chartbrew を ClickHouse に接続して、リアルタイムのダッシュボードやクライアント向けレポートを作成します。'
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

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import Image from '@theme/IdealImage';


# Chartbrew を ClickHouse に接続する {#connecting-chartbrew-to-clickhouse}

<CommunityMaintainedBadge/>

[Chartbrew](https://chartbrew.com) は、ユーザーがダッシュボードを作成し、データをリアルタイムで監視できるデータ可視化プラットフォームです。複数のデータソース（ClickHouse を含む）をサポートしており、チャートやレポートをノーコードで作成できるインターフェースを提供します。

## 目的 {#goal}

このガイドでは、Chartbrew を ClickHouse に接続し、SQL クエリを実行して、可視化を作成します。最後には、ダッシュボードは次のような表示になるかもしれません。

<Image img={chartbrew_01} size="lg" alt="Chartbrew ダッシュボード" />

:::tip データを追加
作業に使えるデータセットがない場合は、サンプルデータセットのいずれかを追加できます。このガイドでは [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) データセットを使用します。
:::

## 1. 接続情報を準備する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Chartbrew を ClickHouse に接続する {#2-connect-chartbrew-to-clickhouse}

1. [Chartbrew](https://chartbrew.com/login) にログインし、**Connections** タブを開きます。
2. **Create connection** をクリックし、利用可能なデータベースオプションから **ClickHouse** を選択します。

   <Image img={chartbrew_02} size="lg" alt="Chartbrew で ClickHouse 接続を選択する" />

3. ClickHouse データベースの接続情報を入力します:

   - **Display Name**: Chartbrew 内でこの接続を識別するための名前。
   - **Host**: ClickHouse サーバーのホスト名または IP アドレス。
   - **Port**: 通常、HTTPS 接続では `8443` です。
   - **Database Name**: 接続したいデータベース名。
   - **Username**: ClickHouse のユーザー名。
   - **Password**: ClickHouse のパスワード。

   <Image img={chartbrew_03} size="lg" alt="Chartbrew における ClickHouse 接続設定" />

4. **Test connection** をクリックして、Chartbrew から ClickHouse へ接続できることを確認します。
5. テストが成功したら、**Save connection** をクリックします。Chartbrew が ClickHouse からスキーマを自動的に取得します。

   <Image img={chartbrew_04} size="lg" alt="Chartbrew における ClickHouse の JSON スキーマ" />

## 3. データセットを作成して SQL クエリを実行する {#3-create-a-dataset-and-run-a-sql-query}

1. **Create dataset** ボタンをクリックするか、**Datasets** タブを開いて新しいデータセットを作成します。
2. 先ほど作成した ClickHouse 接続を選択します。

<Image img={chartbrew_05} size="lg" alt="データセット用の ClickHouse 接続を選択" />

可視化したいデータを取得するための SQL クエリを作成します。例えば、次のクエリは `uk_price_paid` データセットから、年ごとの支払価格の平均値を算出します。

```sql
  SELECT toYear(date) AS year, avg(price) AS avg_price
  FROM uk_price_paid
  GROUP BY year
  ORDER BY year;
```

<Image img={chartbrew_07} size="lg" alt="Chartbrew での ClickHouse SQL クエリ" />

データを取得するには、**Run query** をクリックします。

クエリの書き方がわからない場合は、データベーススキーマに基づいて SQL クエリを生成できる **Chartbrew の AI アシスタント** を使用できます。

<Image img={chartbrew_06} size="lg" alt="Chartbrew での ClickHouse AI SQL assistant" />

データが取得できたら、**Configure dataset** をクリックして、可視化のパラメータを設定します。


## 4. 可視化を作成する {#4-create-a-visualization}

1. 可視化用のメトリクス（数値）とディメンション（カテゴリ型の値）を定義します。
  2. データセットをプレビューし、クエリ結果の構造が正しいことを確認します。
  3. グラフの種類（例：折れ線グラフ、棒グラフ、円グラフ）を選択し、ダッシュボードに追加します。
  4. **Complete dataset** をクリックしてセットアップを完了します。

<Image img={chartbrew_08} size="lg" alt="ClickHouse データを表示している Chartbrew ダッシュボード" />

データのさまざまな側面を可視化するために、必要なだけデータセットを作成できます。これらのデータセットを使って、さまざまなメトリクスを追跡する複数のダッシュボードを作成できます。

<Image img={chartbrew_01} size="lg" alt="ClickHouse データを表示している Chartbrew ダッシュボード" />

## 5. データ更新の自動化 {#5-automate-data-updates}

ダッシュボードを最新の状態に保つために、データの自動更新をスケジュールできます。

1. データセット更新ボタンの横にあるカレンダーアイコンをクリックします。
  2. 更新間隔を設定します（例: 1時間ごと、毎日）。
  3. 設定を保存し、自動更新を有効にします。

<Image img={chartbrew_09} size="lg" alt="Chartbrew のデータセット更新設定" />

## さらに詳しく {#learn-more}

詳しくは、[Chartbrew と ClickHouse](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/) についてのブログ記事をご覧ください。