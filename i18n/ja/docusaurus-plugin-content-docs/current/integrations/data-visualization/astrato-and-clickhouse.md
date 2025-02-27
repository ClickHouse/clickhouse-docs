---
sidebar_label: Astrato
sidebar_position: 131
slug: /integrations/astrato
keywords: [ clickhouse, Power BI, connect, integrate, ui, data apps, data viz, embedded analytics, Astrato]
description: Astratoは、すべてのユーザーが分析を手に入れ、独自のダッシュボード、レポート、データアプリを作成できるようにすることで、企業やデータビジネスに真のセルフサービスBIを提供します。これにより、ITの助けなしでデータの質問に答えることが可能になります。Astratoは採用を加速し、意思決定を迅速化し、分析、埋め込み分析、データ入力、データアプリを1つのプラットフォームに統合します。Astratoは、アクションと分析を統合し、ライブの書き戻しを導入し、MLモデルとインタラクションし、AIで分析を加速します。これにより、AstratoのプッシュダウンSQLサポートのおかげで、ダッシュボードを超えた分析が可能になります。
---

import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# AstratoをClickHouseに接続する

AstratoはプッシュダウンSQLを使用して、ClickHouse Cloudまたはオンプレミスのデプロイメントに直接クエリを実行します。これにより、ClickHouseの業界トップクラスの性能を活用して、必要なすべてのデータにアクセスできます。

## 接続データが必要です {#connection-data-required}

データ接続を設定するときに必要な情報：

- データ接続：ホスト名、ポート

- データベース認証情報：ユーザー名、パスワード

<ConnectionDetails />

## ClickHouseへのデータ接続を作成する {#creating-the-data-connection-to-clickhouse}

- サイドバーで**データ**を選択し、**データ接続**タブを選択します  
（または、こちらのリンクに移動してください：https://app.astrato.io/data/sources）
​
- 画面の右上隅にある**新しいデータ接続**ボタンをクリックします。

<img  src={require('./images/astrato_1_dataconnection.png').default}  class="image"  alt="Astrato Data Connection"  style={{width:'50%',  'background-color':  'transparent'}}/>

<br/>

- **ClickHouse**を選択します。 
<img  src={require('./images/astrato_2a_clickhouse_connection.png').default}  class="image"  alt="Astrato ClickHouse Data Connection"  style={{width:'50%',  'background-color':  'transparent'}}/>

- 接続ダイアログボックスで必要なフィールドを入力します 

<img  src={require('./images/astrato_2b_clickhouse_connection.png').default}  class="image"  alt="Astrato connect to ClickHouse required fields"  style={{width:'50%',  'background-color':  'transparent'}}/>

- **接続テスト**をクリックします。接続が成功した場合は、データ接続に**名前**を付けて**次へ**をクリックします。

- データ接続の**ユーザーアクセス**を設定し、**接続**をクリックします。  
​
<img  src={require('./images/astrato_3_user_access.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'50%',  'background-color':  'transparent'}}/>

- 接続が作成され、データビューが作成されます。

:::note
重複が作成された場合は、データソース名にタイムスタンプが追加されます。
:::

## セマンティックモデル / データビューを作成する {#creating-a-semantic-model--data-view}

データビューエディタでは、ClickHouseのすべてのテーブルとスキーマが表示されますので、一部を選択して開始します。

<img  src={require('./images/astrato_4a_clickhouse_data_view.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/>
<br/>

データが選択されたら、**データビュー**を定義します。ウェブページの右上にある「定義」をクリックします。

ここで、データを結合したり、**ガバナンスされた次元とメジャーを作成**することができます。これは、さまざまなチーム間でのビジネス論理の一貫性を推進するのに最適です。

<img  src={require('./images/astrato_4b_clickhouse_data_view_joins.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/>
<br/>

**Astratoはメタデータを利用して結合をインテリジェントに提案**します。ClickHouseのキーを活用することも含まれます。我々の提案する結合を元に、よくガバナンスされたClickHouseデータから簡単に開始できます。全ての提案を詳細に確認するオプションもあるので、**ジョインの品質**も表示されます。
<br/>
<img  src={require('./images/astrato_4c_clickhouse_completed_data_view.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>

## ダッシュボードを作成する {#creating-a-dashboard}

ほんの数ステップで、Astratoで最初のチャートを構築できます。
1. ビジュアルパネルを開く
2. ビジュアルを選択する（まずはカラムバーチャートから始めましょう）
3. 次元を追加する
4. メジャーを追加する

<img  src={require('./images/astrato_5a_clickhouse_build_chart.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>


### 各ビジュアライゼーションをサポートする生成されたSQLを表示する {#view-generated-sql-supporting-each-visualization}

透明性と正確性はAstratoの中心にあります。生成されるクエリはすべて可視化されており、完全な制御を保持できます。すべての計算はClickHouse内で直接行われ、高速性を活用しながら、強力なセキュリティとガバナンスを維持します。

<img  src={require('./images/astrato_5b_clickhouse_view_sql.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>


### 完成したダッシュボードの例 {#example-completed-dashboard}

美しい完成したダッシュボードまたはデータアプリは、もうすぐそこです。我々が構築したものをさらに見るには、私たちのウェブサイトのデモギャラリーにアクセスしてください。 https://astrato.io/gallery

<img  src={require('./images/astrato_5c_clickhouse_complete_dashboard.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/>
