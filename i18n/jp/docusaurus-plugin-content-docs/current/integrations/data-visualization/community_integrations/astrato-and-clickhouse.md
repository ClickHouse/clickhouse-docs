---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato は、すべてのユーザーにアナリティクスを届け、ユーザー自身がダッシュボード、レポート、データアプリを作成して、IT 部門の支援なしにデータに関する疑問に答えられるようにすることで、真のセルフサービス BI をエンタープライズやデータビジネスにもたらします。Astrato は導入を加速し、意思決定のスピードを高め、アナリティクス、組み込みアナリティクス、データ入力、データアプリを 1 つのプラットフォームに統合します。Astrato はアクションとアナリティクスを 1 つに結び付け、ライブライトバックを実現し、ML モデルとの対話を可能にし、AI によってアナリティクスを加速します。Astrato のプッシュダウン SQL サポートにより、ダッシュボードの作成を超えた活用が可能になります。'
title: 'Astrato を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
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
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Astrato を ClickHouse に接続する

<CommunityMaintainedBadge/>

Astrato は Pushdown SQL を使用して、ClickHouse Cloud またはオンプレミス環境の ClickHouse デプロイメントに対して直接クエリを実行します。つまり、業界トップクラスの ClickHouse のパフォーマンスを活用しながら、必要なあらゆるデータにアクセスできます。



## 必要な接続情報 {#connection-data-required}

データ接続を設定する際には、以下の情報が必要です:

- データ接続: ホスト名、ポート

- データベース認証情報: ユーザー名、パスワード

<ConnectionDetails />


## ClickHouseへのデータ接続の作成 {#creating-the-data-connection-to-clickhouse}

- サイドバーで**Data**を選択し、**Data Connection**タブを選択します
  (または、次のリンクに移動します: https://app.astrato.io/data/sources)
  ​
- 画面右上の**New Data Connection**ボタンをクリックします。

<Image
  size='sm'
  img={astrato_1_dataconnection}
  alt='Astratoデータ接続'
  border
/>

- **ClickHouse**を選択します。

<Image
  size='sm'
  img={astrato_2a_clickhouse_connection}
  alt='Astrato ClickHouseデータ接続'
  border
/>

- 接続ダイアログボックスの必須フィールドに入力します

<Image
  size='sm'
  img={astrato_2b_clickhouse_connection}
  alt='Astrato ClickHouse接続の必須フィールド'
  border
/>

- **Test Connection**をクリックします。接続が成功した場合は、データ接続に**名前**を付けて**Next**をクリックします。

- データ接続の**ユーザーアクセス**を設定し、**connect**をクリックします。

<Image
  size='md'
  img={astrato_3_user_access}
  alt='Astrato ClickHouse接続のユーザーアクセス'
  border
/>

- 接続とデータビューが作成されます。

:::note
重複が作成された場合、データソース名にタイムスタンプが追加されます。
:::


## セマンティックモデル / データビューの作成 {#creating-a-semantic-model--data-view}

Data Viewエディタでは、ClickHouse内のすべてのテーブルとスキーマが表示されます。いくつか選択して開始してください。

<Image
  size='lg'
  img={astrato_4a_clickhouse_data_view}
  alt='AstratoをClickHouseユーザーアクセスに接続'
  border
/>

データを選択したら、**データビュー**を定義します。Webページの右上にある「define」をクリックしてください。

ここでは、データの結合に加えて、**ガバナンスされたディメンションとメジャーを作成**できます。これは、複数のチーム間でビジネスロジックの一貫性を維持するのに最適です。

<Image
  size='lg'
  img={astrato_4b_clickhouse_data_view_joins}
  alt='AstratoをClickHouseユーザーアクセスに接続'
  border
/>

**Astratoはメタデータを使用してインテリジェントに結合を提案します**。これには、ClickHouseのキーの活用も含まれます。提案される結合により、適切に管理されたClickHouseデータを活用して簡単に作業を開始でき、車輪の再発明を避けることができます。また、**結合品質**も表示されるため、Astratoからのすべての提案を詳細に確認することができます。

<Image
  size='lg'
  img={astrato_4c_clickhouse_completed_data_view}
  alt='AstratoをClickHouseユーザーアクセスに接続'
  border
/>


## ダッシュボードの作成 {#creating-a-dashboard}

わずか数ステップで、Astratoで最初のチャートを構築できます。

1. ビジュアルパネルを開く
2. ビジュアルを選択する（縦棒グラフから始めましょう）
3. ディメンションを追加する
4. メジャーを追加する

<Image
  size='lg'
  img={astrato_5a_clickhouse_build_chart}
  alt='AstratoをClickHouseユーザーアクセスに接続'
  border
/>

### 各ビジュアライゼーションを支える生成されたSQLの表示 {#view-generated-sql-supporting-each-visualization}

透明性と正確性はAstratoの中核です。生成されたすべてのクエリが可視化されることを保証し、完全な制御を維持できます。すべての計算はClickHouse内で直接実行され、その速度を活用しながら、堅牢なセキュリティとガバナンスを維持します。

<Image
  size='lg'
  img={astrato_5b_clickhouse_view_sql}
  alt='AstratoをClickHouseユーザーアクセスに接続'
  border
/>

### 完成したダッシュボードの例 {#example-completed-dashboard}

美しく完成したダッシュボードやデータアプリの実現はもう間近です。私たちが構築したものをさらにご覧になりたい場合は、当社ウェブサイトのデモギャラリーをご覧ください。https://astrato.io/gallery

<Image
  size='lg'
  img={astrato_5c_clickhouse_complete_dashboard}
  alt='AstratoをClickHouseユーザーアクセスに接続'
  border
/>
