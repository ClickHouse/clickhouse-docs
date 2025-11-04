---
'title': 'ChartbrewをClickHouseに接続する'
'sidebar_label': 'Chartbrew'
'sidebar_position': 131
'slug': '/integrations/chartbrew-and-clickhouse'
'keywords':
- 'ClickHouse'
- 'Chartbrew'
- 'connect'
- 'integrate'
- 'visualization'
'description': 'ChartbrewをClickHouseに接続してリアルタイムダッシュボードとクライアントレポートを作成します。'
'doc_type': 'guide'
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

[Chartbrew](https://chartbrew.com)は、ユーザーがダッシュボードを作成し、リアルタイムでデータを監視できるデータ視覚化プラットフォームです。複数のデータソースをサポートし、ClickHouseを含み、チャートやレポートを構築するためのノーコードインターフェースを提供します。

## 目標 {#goal}

このガイドでは、ChartbrewをClickHouseに接続し、SQLクエリを実行し、視覚化を作成します。最終的には、ダッシュボードは次のように見えるかもしれません：

<Image img={chartbrew_01} size="lg" alt="Chartbrewダッシュボード" />

:::tip データを追加する
作業するデータセットがない場合、例の1つを追加できます。このガイドでは、[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用します。
:::

## 1. 接続詳細を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. ChartbrewをClickHouseに接続する {#2-connect-chartbrew-to-clickhouse}

1. [Chartbrew](https://chartbrew.com/login)にログインし、**Connections**タブに移動します。
2. **Create connection**をクリックし、利用可能なデータベースオプションから**ClickHouse**を選択します。

   <Image img={chartbrew_02} size="lg" alt="ChartbrewでClickHouse接続を選択" />

3. ClickHouseデータベースの接続詳細を入力します：

   - **Display Name**: Chartbrew内で接続を特定するための名前。
   - **Host**: ClickHouseサーバーのホスト名またはIPアドレス。
   - **Port**: 通常、HTTPS接続には`8443`を使用します。
   - **Database Name**: 接続するデータベース。
   - **Username**: あなたのClickHouseユーザー名。
   - **Password**: あなたのClickHouseパスワード。

   <Image img={chartbrew_03} size="lg" alt="ChartbrewのClickHouse接続設定" />

4. **Test connection**をクリックして、ChartbrewがClickHouseに接続できることを確認します。
5. テストが成功した場合は、**Save connection**をクリックします。Chartbrewは自動的にClickHouseからスキーマを取得します。

   <Image img={chartbrew_04} size="lg" alt="ChartbrewのClickHouse JSONスキーマ" />

## 3. データセットを作成し、SQLクエリを実行する {#3-create-a-dataset-and-run-a-sql-query}

1. **Create dataset**ボタンをクリックするか、**Datasets**タブに移動して作成します。
2. 先ほど作成したClickHouse接続を選択します。

   <Image img={chartbrew_05} size="lg" alt="データセットのためにClickHouse接続を選択" />

   視覚化するデータを取得するためのSQLクエリを書きます。たとえば、このクエリは`uk_price_paid`データセットから年ごとの平均支払価格を計算します：

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

データの取得が完了したら、**Configure dataset**をクリックして視覚化パラメータを設定します。

## 4. 視覚化を作成する {#4-create-a-visualization}

1. 視覚化のためのメトリック（数値）とディメンション（カテゴリカル値）を定義します。
2. データセットをプレビューして、クエリ結果が正しく構造化されていることを確認します。
3. チャートタイプ（例：折れ線グラフ、棒グラフ、円グラフ）を選択し、ダッシュボードに追加します。
4. **Complete dataset**をクリックして設定を完了します。

   <Image img={chartbrew_08} size="lg" alt="ClickHouseデータを使用したChartbrewダッシュボード" />

   視覚化するデータの異なる側面を追跡するために、必要なだけ多くのデータセットを作成できます。これらのデータセットを使用して、異なるメトリックを追跡するための複数のダッシュボードを作成できます。

   <Image img={chartbrew_01} size="lg" alt="ClickHouseデータを持つChartbrewダッシュボード" />

## 5. データの更新を自動化する {#5-automate-data-updates}

ダッシュボードを最新の状態に保つために、自動データ更新をスケジュールできます：

1. データセットリフレッシュボタンの横にあるカレンダーアイコンをクリックします。
2. 更新間隔を設定します（例：毎時、毎日）。
3. 設定を保存して自動リフレッシュを有効にします。

   <Image img={chartbrew_09} size="lg" alt="Chartbrewデータセット更新設定" />

## 詳細を学ぶ {#learn-more}

詳細については、[ChartbrewとClickHouse](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/)に関するブログ記事をチェックしてください。
