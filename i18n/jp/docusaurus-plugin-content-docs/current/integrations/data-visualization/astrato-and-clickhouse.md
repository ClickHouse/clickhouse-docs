---
'sidebar_label': 'Astrato'
'sidebar_position': 131
'slug': '/integrations/astrato'
'keywords':
- 'clickhouse'
- 'Power BI'
- 'connect'
- 'integrate'
- 'ui'
- 'data apps'
- 'data viz'
- 'embedded analytics'
- 'Astrato'
'description': 'Astratoは、すべてのユーザーが独自のダッシュボード、レポート、データアプリを作成できるようにすることで、企業やデータビジネスに真のセルフサービスBIをもたらし、ITの助けなしにデータの質問に答えることを可能にします。Astratoは導入を加速し、意思決定を迅速化し、分析、組み込み分析、データ入力、およびデータアプリを1つのプラットフォームに統合します。Astratoはアクションと分析を1つに統合し、ライブの書き戻しを導入し、MLモデルと対話し、AIで分析を加速させます。ダッシュボードを超えた体験を提供するために、AstratoのプッシュダウンSQLのサポートのおかげです。'
'title': 'AstratoとClickHouseの接続'
'doc_type': 'guide'
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

AstratoはPushdown SQLを使用して、ClickHouse Cloudまたはオンプレミスの展開に直接クエリを実行します。これにより、業界をリードするClickHouseのパフォーマンスを活用して、必要なすべてのデータにアクセスできます。

## 接続データの必要条件 {#connection-data-required}

データ接続を設定する際に知っておくべき情報は次のとおりです。

- データ接続: ホスト名, ポート

- データベース認証情報: ユーザー名, パスワード

<ConnectionDetails />

## ClickHouseへのデータ接続を作成する {#creating-the-data-connection-to-clickhouse}

- サイドバーで**データ**を選択し、**データ接続**タブを選択します
（または、次のリンクに移動します: https://app.astrato.io/data/sources）
​
- 画面右上の**新しいデータ接続**ボタンをクリックします。

<Image size="sm" img={astrato_1_dataconnection} alt="Astrato Data Connection" border />

- **ClickHouse**を選択します。

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Astrato ClickHouse Data Connection" border />

- 接続ダイアログボックスの必要なフィールドを入力します。

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato connect to ClickHouse required fields" border />

- **接続テスト**をクリックします。接続が成功した場合は、データ接続に**名前**を付けて**次へ**クリックします。

- データ接続への**ユーザーアクセス**を設定し、**接続**をクリックします。

<Image size="md" img={astrato_3_user_access} alt="Astrato connect to ClickHouse User Access" border />

- 接続が作成され、データビューが作成されます。

:::note
重複が作成されると、データソース名にタイムスタンプが追加されます。
:::

## セマンティックモデル / データビューの作成 {#creating-a-semantic-model--data-view}

データビューエディタでは、ClickHouse内のすべてのテーブルとスキーマが表示されます。開始するためにいくつかを選択してください。

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Astrato connect to ClickHouse User Access" border />

データが選択されたら、**データビュー**を定義します。ウェブページの右上で定義をクリックします。

ここでは、データを結合することができ、**管理されたディメンションとメジャーを作成する**ことができます - さまざまなチーム間でビジネスロジックの一貫性を促進するのに最適です。

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Astrato connect to ClickHouse User Access" border />

**Astratoはメタデータを使用して結合をインテリジェントに提案**し、ClickHouseのキーを利用しています。我々の提案された結合により、再発明することなく、よく管理されたClickHouseデータから作業を開始することが簡単になります。また、**結合の質**を示し、Astratoからのすべての提案を詳細に見直すオプションも提供します。

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Astrato connect to ClickHouse User Access" border />

## ダッシュボードの作成 {#creating-a-dashboard}

数ステップで、Astratoで最初のチャートを作成できます。
1. ビジュアルパネルを開く
2. ビジュアルを選択する（カラムバーチャートから始めましょう）
3. ディメンションを追加する
4. メジャーを追加する

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato connect to ClickHouse User Access" border />

### 各ビジュアライゼーションをサポートする生成されたSQLを表示する {#view-generated-sql-supporting-each-visualization}

透明性と正確性はAstratoの中心です。生成されたすべてのクエリが可視化されることを保証し、完全なコントロールを保持します。すべての計算はClickHouseで直接行われ、その速度を活用しながら、堅牢なセキュリティとガバナンスを維持します。

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato connect to ClickHouse User Access" border />

### 完成したダッシュボードの例 {#example-completed-dashboard}

美しい完成したダッシュボードやデータアプリは、すぐそこにあります。私たちが構築したものをもっと見るには、ウェブサイトのデモギャラリーにアクセスしてください。 https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato connect to ClickHouse User Access" border />
