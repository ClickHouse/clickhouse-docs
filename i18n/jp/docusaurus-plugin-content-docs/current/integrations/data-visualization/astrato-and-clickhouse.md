---
sidebar_label: Astrato
sidebar_position: 131
slug: /integrations/astrato
keywords: [ clickhouse, Power BI, connect, integrate, ui, data apps, data viz, embedded analytics, Astrato]
description: Astratoは、すべてのユーザーの手に分析を届け、ダッシュボード、レポート、データアプリを自分で構築できるようにすることで、企業やデータビジネスに真のセルフサービスBIを提供します。これにより、ITの助けを借りずにデータに関する質問に答えることが可能になります。Astratoは、導入を加速させ、意思決定を迅速化し、1つのプラットフォームで分析、埋め込み分析、データ入力、データアプリを統一します。Astratoは、アクションと分析を統合し、ライブの書き戻しを導入し、MLモデルと相互作用し、AIを使って分析を加速させます。ダッシュボードを超えて、AstratoのプッシュダウンSQLサポートのおかげで実現できます。
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


# AstratoをClickHouseに接続する

AstratoはプッシュダウンSQLを使用して、ClickHouse Cloudまたはオンプレミスのデプロイメントに直接クエリを実行します。これにより、業界をリードするClickHouseのパフォーマンスに後押しされて、必要なすべてのデータにアクセスできるようになります。

## 接続に必要なデータ {#connection-data-required}

データ接続を設定する際には、以下の情報が必要です。

- データ接続: ホスト名、ポート

- データベースの資格情報: ユーザー名、パスワード

<ConnectionDetails />

## ClickHouseへのデータ接続の作成 {#creating-the-data-connection-to-clickhouse}

- サイドバーの**データ**を選択し、**データ接続**タブを選択します
（または、こちらのリンクに移動します: https://app.astrato.io/data/sources）
​
- 画面右上の**新しいデータ接続**ボタンをクリックします。

<img  src={astrato_1_dataconnection}  class="image"  alt="Astrato Data Connection"  style={{width:'50%',  'background-color':  'transparent'}}/>

<br/>

- **ClickHouse**を選択します。
<img  src={astrato_2a_clickhouse_connection}  class="image"  alt="Astrato ClickHouse Data Connection"  style={{width:'50%',  'background-color':  'transparent'}}/>

- 接続ダイアログボックスの必須フィールドを入力します

<img  src={astrato_2b_clickhouse_connection}  class="image"  alt="Astrato connect to ClickHouse required fields"  style={{width:'50%',  'background-color':  'transparent'}}/>

- **接続テスト**をクリックします。接続に成功した場合、データ接続に**名前**を付けて**次へ**をクリックします。

- データ接続の**ユーザーアクセス**を設定し、**接続**をクリックします。
​
<img  src={astrato_3_user_access}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'50%',  'background-color':  'transparent'}}/>

- 接続が作成され、データビューが作成されます。

:::note
もし重複が作成された場合、データソース名にタイムスタンプが追加されます。
:::

## セマンティックモデル / データビューの作成 {#creating-a-semantic-model--data-view}

データビューエディタでは、ClickHouseのすべてのテーブルとスキーマが表示されますので、いくつか選択して開始します。

<img  src={astrato_4a_clickhouse_data_view}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/>
<br/>

データを選択したら、**データビュー**を定義します。ウェブページの右上にある定義をクリックします。

ここでは、データを結合したり、**管理されたディメンションおよびメジャーを作成**することができます。これは、さまざまなチーム間でビジネスロジックの一貫性を促進するのに理想的です。

<img  src={astrato_4b_clickhouse_data_view_joins}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/>
<br/>

**Astratoはメタデータを利用して結合の提案を行います**。ClickHouseのキーを活用して、提案された結合を用いることで、管理されたClickHouseデータから始めることが容易になります。私たちはまた、**結合の質**を示すことで、Astratoからのすべての提案を詳細にレビューする選択肢を提供します。
<br/>
<img  src={astrato_4c_clickhouse_completed_data_view}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>

## ダッシュボードの作成 {#creating-a-dashboard}

わずか数ステップで、Astratoで最初のチャートを作成できます。
1. ビジュアルパネルを開く
2. ビジュアルを選択する（柱状グラフから始めましょう）
3. ディメンションを追加
4. メジャーを追加

<img  src={astrato_5a_clickhouse_build_chart}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>


### 各ビジュアライゼーションをサポートする生成SQLの表示 {#view-generated-sql-supporting-each-visualization}

透明性と正確性はAstratoの中心です。生成されたすべてのクエリが可視化され、完全なコントロールを維持できるようにしています。すべての計算は直接ClickHouse内で行われ、その速度を利用しつつ、しっかりしたセキュリティとガバナンスを維持します。

<img  src={astrato_5b_clickhouse_view_sql}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>


### 完成したダッシュボードの例 {#example-completed-dashboard}

美しい完成したダッシュボードやデータアプリが間近に迫っています。私たちが構築したものの詳細を見たい場合は、当社のウェブサイトのデモギャラリーにアクセスしてください。 https://astrato.io/gallery

<img  src={astrato_5c_clickhouse_complete_dashboard}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/>
