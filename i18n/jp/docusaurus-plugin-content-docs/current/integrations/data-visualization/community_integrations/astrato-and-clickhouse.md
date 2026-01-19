---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato は、あらゆるユーザーの手にアナリティクスを委ね、ユーザー自身がダッシュボード、レポート、データアプリを構築できるようにすることで、真のセルフサービス BI をエンタープライズおよびデータビジネス企業にもたらし、IT 部門の支援なしにデータに関する疑問に答えられるようにします。Astrato は導入を加速し、意思決定を迅速化し、1 つのプラットフォーム上でアナリティクス、組み込みアナリティクス、データ入力、データアプリを統合します。Astrato はアクションとアナリティクスを一体化し、ライブ書き戻しや ML モデルとの連携、AI によるアナリティクスの高速化を実現します。Astrato のプッシュダウン SQL サポートにより、ダッシュボードの枠を超えた高度な分析が可能になります。'
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

Astrato は Pushdown SQL を使用して、ClickHouse Cloud またはオンプレミスの ClickHouse 環境に直接クエリを実行します。つまり、業界をリードする ClickHouse のパフォーマンスを活用して、必要なすべてのデータにアクセスできます。

## 接続に必要な情報 \{#connection-data-required\}

データ接続を設定するには、以下の情報が必要です。

- データ接続: ホスト名、ポート
- データベースの認証情報: ユーザー名、パスワード

<ConnectionDetails />

## ClickHouse へのデータ接続の作成 \{#creating-the-data-connection-to-clickhouse\}

- サイドバーで **Data** を選択し、**Data Connection** タブを選択します  
（または、次のリンクにアクセスします: https://app.astrato.io/data/sources）
​
- 画面右上の **New Data Connection** ボタンをクリックします。

<Image size="sm" img={astrato_1_dataconnection} alt="Astrato データ接続" border />

- **ClickHouse** を選択します。

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Astrato ClickHouse データ接続" border />

- 接続ダイアログボックス内の必須フィールドを入力します。

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato ClickHouse 接続の必須フィールド" border />

- **Test Connection** をクリックします。接続に成功したら、そのデータ接続に名前を付けて **Next** をクリックします。

- データ接続に対するユーザーアクセスを設定し、**Connect** をクリックします。

<Image size="md" img={astrato_3_user_access} alt="Astrato ClickHouse 接続のユーザーアクセス設定" border />

-   接続が作成され、データビューが作成されます。

:::note
重複が作成された場合、データソース名にタイムスタンプが追加されます。
:::

## セマンティックモデル / データビューの作成 \{#creating-a-semantic-model--data-view\}

Data View エディターでは、ClickHouse 上のすべてのテーブルとスキーマが表示されます。開始するには、そこからいくつかを選択します。

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Astrato を ClickHouse に接続するユーザーアクセス" border />

データを選択したら、次に **データビュー** を定義します。Web ページ右上の [Define] をクリックします。

ここでは、データの結合に加えて、**ガバナンスされたディメンションやメジャーを作成** することができます。これは、さまざまなチーム間でビジネスロジックの一貫性を維持するのに最適です。

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Astrato を ClickHouse に接続するユーザーアクセス" border />

**Astrato は結合をインテリジェントに提案します。** その際、ClickHouse のキーを活用するなど、メタデータを利用します。提案される結合により、適切にガバナンスされた ClickHouse データを一から作り直すことなく、そのまま簡単に使い始めることができます。さらに Astrato では、**結合の品質** も表示されるため、すべての提案内容を詳細に確認することが可能です。

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Astrato を ClickHouse に接続するユーザーアクセス" border />

## ダッシュボードの作成 \{#creating-a-dashboard\}

わずか数ステップで、Astrato で最初のチャートを作成できます。
1. ビジュアルパネルを開きます
2. ビジュアルを選択します（まずは「Column Bar Chart」から始めましょう）
3. ディメンションを追加します
4. メジャーを追加します

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato と ClickHouse の接続 ユーザーアクセス" border />

### 各ビジュアルに対応する生成 SQL を表示する \{#view-generated-sql-supporting-each-visualization\}

Astrato では透明性と正確性を最重視しています。生成されたすべてのクエリを確認できるため、常に完全にコントロールできます。すべての計算処理は ClickHouse 上で直接実行され、その高速性を活用しつつ、堅牢なセキュリティとガバナンスを維持します。

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato と ClickHouse の接続 ユーザーアクセス" border />

### 完成したダッシュボードの例 \{#example-completed-dashboard\}

完成度の高い美しいダッシュボードやデータアプリも、もう目前です。さらに多くの作成例を見るには、当社ウェブサイトのデモギャラリーをご覧ください。https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato と ClickHouse の接続 ユーザーアクセス" border />