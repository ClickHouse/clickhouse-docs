---
sidebar_label: 'Explo'
sidebar_position: 131
slug: /integrations/explo
keywords: ['clickhouse', 'Explo', 'connect', 'integrate', 'ui']
description: 'Explo は、データに関する疑問に簡単に答えるための、使いやすいオープンソースの UI ツールです。'
title: 'Explo を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import explo_01 from '@site/static/images/integrations/data-visualization/explo_01.png';
import explo_02 from '@site/static/images/integrations/data-visualization/explo_02.png';
import explo_03 from '@site/static/images/integrations/data-visualization/explo_03.png';
import explo_04 from '@site/static/images/integrations/data-visualization/explo_04.png';
import explo_05 from '@site/static/images/integrations/data-visualization/explo_05.png';
import explo_06 from '@site/static/images/integrations/data-visualization/explo_06.png';
import explo_07 from '@site/static/images/integrations/data-visualization/explo_07.png';
import explo_08 from '@site/static/images/integrations/data-visualization/explo_08.png';
import explo_09 from '@site/static/images/integrations/data-visualization/explo_09.png';
import explo_10 from '@site/static/images/integrations/data-visualization/explo_10.png';
import explo_11 from '@site/static/images/integrations/data-visualization/explo_11.png';
import explo_12 from '@site/static/images/integrations/data-visualization/explo_12.png';
import explo_13 from '@site/static/images/integrations/data-visualization/explo_13.png';
import explo_14 from '@site/static/images/integrations/data-visualization/explo_14.png';
import explo_15 from '@site/static/images/integrations/data-visualization/explo_15.png';
import explo_16 from '@site/static/images/integrations/data-visualization/explo_16.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Explo を ClickHouse に接続する {#connecting-explo-to-clickhouse}

<CommunityMaintainedBadge/>

あらゆるプラットフォームで利用できる顧客向けアナリティクス。美しい可視化のために設計され、シンプルさを追求して実装されています。



## 目標 {#goal}

このガイドでは、ClickHouse のデータを Explo に接続して結果を可視化します。チャートは次のようになります。
<Image img={explo_15} size="md" alt="Explo ダッシュボード" />

<p/>

:::tip データを追加する
まだ扱うデータセットがない場合は、サンプルデータセットのいずれかを追加できます。このガイドでは [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) データセットを使用しているので、それを選んでもよいでしょう。同じドキュメントカテゴリに、他にもいくつかのデータセットが掲載されています。
:::



## 1. 接続情報を取得する {#1-gather-your-connection-details}
<ConnectionDetails />



## 2.  Explo を ClickHouse に接続する {#2--connect-explo-to-clickhouse}

1. Explo アカウントにサインアップします。

2. 左側のサイドバーにある Explo の **data** タブをクリックします。

<Image img={explo_01} size="sm" alt="Data タブ" border />

3. 右上の **Connect Data Source** をクリックします。

<Image img={explo_02} size="sm" alt="Connect Data Source" border />

4. **Getting Started** ページの情報を入力します。

<Image img={explo_03} size="md" alt="Getting Started" border />

5. **ClickHouse** を選択します。

<Image img={explo_04} size="md" alt="ClickHouse" border />

6. **ClickHouse Credentials** を入力します。

<Image img={explo_05} size="md" alt="Credentials" border />

7. **Security** を設定します。

<Image img={explo_06} size="md" alt="Security" border />

8. ClickHouse 内で **Explo の IP アドレスをホワイトリストに登録します**。
`
54.211.43.19, 52.55.98.121, 3.214.169.94, and 54.156.141.148
`



## 3. ダッシュボードを作成する {#3-create-a-dashboard}

1. 左側のナビゲーションバーから **Dashboard** タブを開きます。

<Image img={explo_07} size="sm" alt="Dashboard" border />

2. 右上の **Create Dashboard** をクリックし、ダッシュボード名を指定します。これでダッシュボードが作成されました。

<Image img={explo_08} size="sm" alt="Create Dashboard" border />

3. 次のような画面が表示されているはずです。

<Image img={explo_09} size="md" alt="Explo Dashboard" border />



## 4. SQL クエリを実行する {#4-run-a-sql-query}

1. 右側のサイドバーで、スキーマ名の下に表示されているテーブル名を確認します。その後、データセットエディタに次のコマンドを入力します:
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`

<Image img={explo_10} size="md" alt="Explo ダッシュボード" border />

2. 「Run」をクリックし、「Preview」タブに移動してデータを確認します。

<Image img={explo_11} size="md" alt="Explo ダッシュボード" border />



## 5. チャートを作成する {#5-build-a-chart}

1. 左側の棒グラフアイコンを画面上にドラッグ＆ドロップします。

<Image img={explo_16} size="sm" alt="Explo ダッシュボード" border />

2. データセットを選択します。次のような画面が表示されるはずです。

<Image img={explo_12} size="sm" alt="Explo ダッシュボード" border />

3. X 軸には **county** を、Y 軸セクションには **Price** を次のように設定します。

<Image img={explo_13} size="sm" alt="Explo ダッシュボード" border />

4. 次に、集計方法を **AVG** に変更します。

<Image img={explo_14} size="sm" alt="Explo ダッシュボード" border />

5. これで、郡ごとの住宅の平均価格を示すチャートができました。

<Image img={explo_15} size="md" alt="Explo ダッシュボード" />



## 詳細情報 {#learn-more}

Explo の詳細やダッシュボードの作成方法については、<a href="https://docs.explo.co/" target="_blank">Explo ドキュメントをご覧ください</a>。
