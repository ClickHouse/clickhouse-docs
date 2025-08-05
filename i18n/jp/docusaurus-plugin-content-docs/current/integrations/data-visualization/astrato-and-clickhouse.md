---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: '/integrations/astrato'
keywords:
- 'clickhouse'
- 'Power BI'
- 'connect'
- 'integrate'
- 'ui'
- 'data apps'
- 'data viz'
- 'embedded analytics'
- 'Astrato'
description: 'Astrato brings true Self-Service BI to Enterprises & Data Businesses
  by putting analytics in the hands of every user, enabling them to build their own
  dashboards, reports and data apps, enabling the answering of data questions without
  IT help. Astrato accelerates adoption, speeds up decision-making, and unifies analytics,
  embedded analytics, data input, and data apps in one platform. Astrato unites action
  and analytics in one,  introduce live write-back, interact with ML models, accelerate
  your analytics with AI – go beyond dashboarding, thanks to pushdown SQL support
  in Astrato.'
title: 'Connecting Astrato to ClickHouse'
---

import astrato_1_dataconnection from '@site/static/images/integrations/data-visualization/astrato_1_dataconnection.png';
import astrato_2a_clickhouse_connection from '@site/static/images/integrations/data-visualization/astrato_2a_clickhouse_connection.png';
import astrato_2b_clickhouse_connection from '@site/static/images/integrations/data-visualization/astrato_2b_clickhouse_connection.png';
import astrato_3_user_access from '@site/static/images/integrations/data-visualization/astrato_3_user_access.png';
import astrato_4a_clickhouse_data_view from '@site/static/images/integrations/data-visualization/astrato_4a_clickhouse_data_view.png';
import astrato_4b_clickhouse_data_view_joins from '@site/static/images/integrations/data-visualization/astrato_4b_clickhouse_data_view_joins.png';
import astrato_4c_clickhouse_completed_data_view from '@site/static/images/integrations/data-visualization/astrato_4c_clickhouse_completed_data_view.png';
import astrato_5a_clickhouse_build_chart from '@site/static/images/integrations/data-visualization/astrato_5a_clickhouse_build_chart.png';
import astrato_5b_clickhouse_view_sql from '@site/static/images/integrations/data-visualization/astrato_5b_clickhouse_view_sql.png';
import astrato_5c_clickhouse_complete_dashboard from '@site/static/images/integrations/data-visualization/astrato_5c_clickhouse_complete_dashboard.png';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# AstratoをClickHouseに接続する

<CommunityMaintainedBadge/>

AstratoはPushdown SQLを使用して、ClickHouse Cloudまたはオンプレミスのデプロイに直接クエリを実行します。これにより、ClickHouseの業界トップクラスのパフォーマンスを活用しながら、必要なすべてのデータにアクセスできます。

## 接続データが必要です {#connection-data-required}

データ接続を設定する際に必要な情報は次のとおりです：

- データ接続：ホスト名、ポート

- データベース資格情報：ユーザー名、パスワード

<ConnectionDetails />

## ClickHouseへのデータ接続を作成する {#creating-the-data-connection-to-clickhouse}

- サイドバーで**データ**を選択し、**データ接続**タブを選択します
（または、こちらのリンクに移動します： https://app.astrato.io/data/sources）
​
- 画面の右上にある**新しいデータ接続**ボタンをクリックします。

<Image size="sm" img={astrato_1_dataconnection} alt="Astrato Data Connection" border />

- **ClickHouse**を選択します。

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Astrato ClickHouse Data Connection" border />

- 接続ダイアログボックスで必須項目を入力します。

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato connect to ClickHouse required fields" border />

- **接続テスト**をクリックします。接続が成功した場合は、データ接続に**名前**を付け、**次へ**をクリックします。

- データ接続への**ユーザーアクセス**を設定し、**接続**をクリックします。

<Image size="md" img={astrato_3_user_access} alt="Astrato connect to ClickHouse User Access" border />

- 接続が作成され、データビューが作成されます。

:::note
重複が作成された場合、データソース名にタイムスタンプが追加されます。
:::

## セマンティックモデル / データビューを作成する {#creating-a-semantic-model--data-view}

私たちのデータビューエディターでは、ClickHouse内のすべてのテーブルとスキーマを見ることができ、始めるためにいくつかを選択します。

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Astrato connect to ClickHouse User Access" border />

データを選択したら、**データビュー**を定義するために、ウェブページの右上にある定義をクリックします。

ここでは、データを結合したり、**管理されたディメンションとメジャーを作成**したりできます。これは、さまざまなチーム間でのビジネスロジックの一貫性を促進するのに理想的です。

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Astrato connect to ClickHouse User Access" border />

**Astratoはメタデータを使用して結合をインテリジェントに提案**します。これにより、ClickHouseのキーを活用します。提案された結合を使用することで、うまく管理されたClickHouseデータから簡単に作業を開始できます。私たちはまた、**結合の質**を表示し、Astratoからすべての提案を詳細に確認するオプションを提供します。

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Astrato connect to ClickHouse User Access" border />

## ダッシュボードを作成する {#creating-a-dashboard}

数ステップで、Astratoで最初のチャートを作成できます。
1. ビジュアルパネルを開く
2. ビジュアルを選択する（まずはカラムバーチャートを始めましょう）
3. ディメンションを追加する
4. メジャーを追加する

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato connect to ClickHouse User Access" border />


### 各ビジュアライゼーションをサポートする生成されたSQLを見る {#view-generated-sql-supporting-each-visualization}

透明性と正確性はAstratoの中心です。生成されたすべてのクエリを可視化し、完全にコントロールできるようにしています。すべての計算は直接ClickHouse内で行われ、そのスピードを活用しながら、強力なセキュリティとガバナンスを維持しています。

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato connect to ClickHouse User Access" border />


### 完成したダッシュボードの例 {#example-completed-dashboard}

美しい完成したダッシュボードやデータアプリはもうすぐ手に入ります。私たちが構築したものをもっと見たい場合は、私たちのウェブサイトのデモギャラリーにアクセスしてください。 https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato connect to ClickHouse User Access" border />
