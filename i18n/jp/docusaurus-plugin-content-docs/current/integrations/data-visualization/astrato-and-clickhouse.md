---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astratoは、すべてのユーザーに分析機能を提供することで、企業やデータビジネスに真のセルフサービスBIをもたらします。これにより、ユーザーは独自のダッシュボード、レポート、データアプリを構築し、ITの助けを借りずにデータの質問に答えることができます。Astratoは採用を加速し、意思決定を迅速化し、分析、組み込み分析、データ入力、データアプリを1つのプラットフォームで統合します。Astratoは行動と分析を1つに統合し、ライブライティングを導入し、MLモデルと対話し、AIで分析を加速させます。ダッシュボードを超えて進化することができ、AstratoのプッシュダウンSQLサポートのおかげで可能になります。'
title: 'AstratoをClickHouseに接続する'
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


# AstratoをClickHouseに接続する

<CommunityMaintainedBadge/>

Astratoは、プッシュダウンSQLを使用して、ClickHouse Cloudまたはオンプレミスのデプロイメントに直接クエリを実行します。これにより、業界最高のパフォーマンスを誇るClickHouseが支えるすべてのデータにアクセスできます。

## 接続データの必要事項 {#connection-data-required}

データ接続を設定する際に知っておくべきこと：

- データ接続：ホスト名、ポート

- データベースの資格情報：ユーザー名、パスワード

<ConnectionDetails />

## ClickHouseへのデータ接続の作成 {#creating-the-data-connection-to-clickhouse}

- サイドバーで**データ**を選択し、**データ接続**タブを選択します  
（または、次のリンクに移動します: https://app.astrato.io/data/sources）
​
- 画面の右上にある**新しいデータ接続**ボタンをクリックします。

<Image size="sm" img={astrato_1_dataconnection} alt="Astrato Data Connection" border />

- **ClickHouse**を選択します。

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Astrato ClickHouse Data Connection" border />

- 接続ダイアログボックスの必須フィールドを入力します。

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato connect to ClickHouse required fields" border />

- **テスト接続**をクリックします。接続が成功した場合は、データ接続に**名前**を付けて**次へ**クリックします。

- データ接続に対する**ユーザーアクセス**を設定し、**接続**をクリックします。

<Image size="md" img={astrato_3_user_access} alt="Astrato connect to ClickHouse User Access" border />

- 接続が作成され、データビューが作成されます。

:::note
重複が生成された場合、データソース名にタイムスタンプが追加されます。
:::

## セマンティックモデル / データビューの作成 {#creating-a-semantic-model--data-view}

データビューエディタで、ClickHouseのすべてのテーブルとスキーマを確認し、いくつかを選択して始めます。

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Astrato connect to ClickHouse User Access" border />

データが選択されたら、**データビュー**を定義します。ウェブページの右上で「定義」をクリックします。

ここでは、データを結合したり、**管理された次元とメジャーを作成する**ことができます – さまざまなチーム間でビジネスロジックの一貫性を促進するのに最適です。

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Astrato connect to ClickHouse User Access" border />

**Astratoはメタデータを使用して結合を賢く提案します。** ClickHouseのキーを活用することを含む、私たちの提案する結合は、あなたが開始するのを容易にし、適切に管理されたClickHouseデータから作業できます。私たちはまた、あなたが**結合の品質**をレビューするオプションを持つために、Astratoからのすべての提案を詳細に表示します。

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Astrato connect to ClickHouse User Access" border />

## ダッシュボードの作成 {#creating-a-dashboard}

わずか数ステップで、Astratoで最初のチャートを構築できます。
1. ビジュアルパネルを開く
2. ビジュアルを選択する（まずはカラムバーグラフから始めましょう）
3. 次元を追加する
4. メジャーを追加する

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato connect to ClickHouse User Access" border />


### 各ビジュアライゼーションをサポートする生成SQLを表示 {#view-generated-sql-supporting-each-visualization}

透明性と正確性は、Astratoの中心にあります。生成されたすべてのクエリが表示されており、完全にコントロールを維持できます。すべての計算は直接ClickHouseで行われ、そのスピードを活用しながら、堅牢なセキュリティとガバナンスを維持します。

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato connect to ClickHouse User Access" border />


### 完成したダッシュボードの例 {#example-completed-dashboard}

美しい完成したダッシュボードやデータアプリはすぐ近くです。私たちが作ったものの詳細を見るには、ウェブサイトのデモギャラリーにアクセスしてください。 https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato connect to ClickHouse User Access" border />
