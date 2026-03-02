---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato は、あらゆるユーザーの手にアナリティクスを届け、ユーザー自身がダッシュボードやレポート、データアプリを構築できるようにすることで、エンタープライズ企業およびデータビジネスに真のセルフサービス BI をもたらし、IT 部門の支援なしにデータに関する問いに答えられるようにします。Astrato は、導入を加速し、意思決定のスピードを高めるとともに、アナリティクス、組み込みアナリティクス、データ入力、データアプリを 1 つのプラットフォーム上で統合します。Astrato は、アクションとアナリティクスを一体化し、ライブ書き戻し機能を提供し、ML モデルとの対話を可能にし、AI によってアナリティクスを加速します。Astrato の pushdown SQL サポートにより、ダッシュボードの作成にとどまらない高度な活用が可能になります。'
title: 'Astrato を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'community'
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
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Astrato を ClickHouse に接続する \{#connecting-astrato-to-clickhouse\}

<CommunityMaintainedBadge/>

Astrato は Pushdown SQL を使用して、ClickHouse Cloud またはオンプレミス環境のデプロイメントに対して直接クエリを実行します。つまり、ClickHouse の業界最高クラスのパフォーマンスを活用しながら、必要なあらゆるデータにアクセスできます。

## 接続に必要な情報 \{#connection-data-required\}

データ接続を作成する際には、次の情報が必要です:

- データ接続: ホスト名、ポート

- データベース認証情報: ユーザー名、パスワード

<ConnectionDetails />

## ClickHouse へのデータ接続を作成する \{#creating-the-data-connection-to-clickhouse\}

- サイドバーで **Data** を選択し、**Data Connection** タブを選択します  
（または、次のリンクに移動します: https://app.astrato.io/data/sources）
​
- 画面右上の **New Data Connection** ボタンをクリックします。

<Image size="sm" img={astrato_1_dataconnection} alt="Astrato Data Connection" border />

- **ClickHouse** を選択します。

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Astrato ClickHouse Data Connection" border />

- 接続ダイアログボックス内の必須フィールドをすべて入力します。

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato connect to ClickHouse required fields" border />

- **Test Connection** をクリックします。接続が成功したら、データ接続に **name** を付け、**Next** をクリックします。

- データ接続の **user access** を設定し、**connect** をクリックします。

<Image size="md" img={astrato_3_user_access} alt="Astrato connect to ClickHouse User Access" border />

- 接続が作成され、データビューが作成されます。

:::note
重複したデータソースが作成された場合は、データソース名にタイムスタンプが追加されます。
:::

## セマンティックモデル / データビューの作成 \{#creating-a-semantic-model--data-view\}

Data View エディターでは、ClickHouse 内のすべてのテーブルとスキーマが表示されます。開始するには、その中からいくつか選択してください。

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Astrato から ClickHouse への接続とユーザーアクセス" border />

データを選択したら、次に **data view** を定義します。ウェブページ右上の「define」をクリックします。

ここでは、データを結合できるだけでなく、**ガバナンスが効いたディメンションとメジャーを作成することもできます**。これは、複数のチーム間でビジネスロジックの一貫性を維持するのに最適です。

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Astrato から ClickHouse への接続とユーザーアクセス" border />

**Astrato はメタデータを使用して結合をインテリジェントに提案します。** ClickHouse のキーも活用します。提案された結合により、よくガバナンスされた ClickHouse データをそのまま活用し、一から定義し直すことなく簡単に作業を開始できます。また、Astrato からすべての提案を詳細に確認できるように、**結合の品質** も表示します。

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Astrato から ClickHouse への接続とユーザーアクセス" border />

## ダッシュボードの作成 \{#creating-a-dashboard\}

数ステップで、Astrato で最初のチャートを作成できます。

1. ビジュアル パネルを開く
2. ビジュアルを選択する（まずは Column Bar Chart から始めましょう）
3. ディメンションを追加する
4. メジャーを追加する

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato の ClickHouse への接続ユーザーアクセス" border />

### 各ビジュアライゼーションに対応する生成済み SQL を表示する \{#view-generated-sql-supporting-each-visualization\}

Astrato では透明性と正確性を最重視しています。生成されるすべてのクエリを可視化し、常に完全なコントロールを維持できるようにしています。すべての計算処理は ClickHouse 上で直接実行され、その高速性を活かしつつ、堅牢なセキュリティとガバナンスを維持します。

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato から ClickHouse への接続とユーザーアクセス" border />

### 完成済みダッシュボードの例 \{#example-completed-dashboard\}

美しい完成版のダッシュボードやデータアプリケーションが、もう目前です。ここまでで作成してきたもののさらなる例を確認するには、Webサイトのデモギャラリーにアクセスしてください。 https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato から ClickHouse への接続とユーザーアクセス" border />