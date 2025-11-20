---
sidebar_label: 'Tableau Desktop'
sidebar_position: 1
slug: /integrations/tableau
keywords: ['clickhouse', 'tableau', 'connect', 'integrate', 'ui']
description: 'Tableau は ClickHouse のデータベースおよびテーブルをデータソースとして使用できます。'
title: 'Tableau と ClickHouse の接続'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc'
---

import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import tableau_connecttoserver from '@site/static/images/integrations/data-visualization/tableau_connecttoserver.png';
import tableau_connector_details from '@site/static/images/integrations/data-visualization/tableau_connector_details.png';
import tableau_connector_dialog from '@site/static/images/integrations/data-visualization/tableau_connector_dialog.png';
import tableau_newworkbook from '@site/static/images/integrations/data-visualization/tableau_newworkbook.png';
import tableau_tpcdschema from '@site/static/images/integrations/data-visualization/tableau_tpcdschema.png';
import tableau_workbook1 from '@site/static/images/integrations/data-visualization/tableau_workbook1.png';
import tableau_workbook2 from '@site/static/images/integrations/data-visualization/tableau_workbook2.png';
import tableau_workbook3 from '@site/static/images/integrations/data-visualization/tableau_workbook3.png';
import tableau_workbook4 from '@site/static/images/integrations/data-visualization/tableau_workbook4.png';
import tableau_workbook5 from '@site/static/images/integrations/data-visualization/tableau_workbook5.png';
import tableau_workbook6 from '@site/static/images/integrations/data-visualization/tableau_workbook6.png';
import tableau_workbook7 from '@site/static/images/integrations/data-visualization/tableau_workbook7.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Tableau を ClickHouse に接続する

<ClickHouseSupportedBadge/>

ClickHouse は公式の Tableau Connector を提供しており、
[Tableau Exchange](https://exchange.tableau.com/products/1064) に掲載されています。
このコネクタは、ClickHouse の高性能な [JDBC driver](/integrations/language-clients/java/jdbc) をベースにしています。

このコネクタを使用すると、Tableau から ClickHouse のデータベースおよびテーブルをデータソースとして利用できます。この機能を有効にするには、
以下のセットアップガイドに従ってください。

<TOCInline toc={toc}/>



## 使用前に必要なセットアップ {#setup-required-prior-usage}

1. 接続情報を収集します

   <ConnectionDetails />

2. <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>をダウンロードしてインストールします。
3. `clickhouse-tableau-connector-jdbc`の手順に従って、互換性のあるバージョンの<a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBCドライバ</a>をダウンロードします。

:::note
[clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases) JARファイルをダウンロードしてください。このアーティファクトはバージョン`0.9.2`以降で利用可能です。
:::

4. JDBCドライバを以下のフォルダに保存します（OSに応じて、フォルダが存在しない場合は作成してください）：
   - macOS: `~/Library/Tableau/Drivers`
   - Windows: `C:\Program Files\Tableau\Drivers`
5. TableauでClickHouseデータソースを設定し、データビジュアライゼーションの構築を開始しましょう！


## TableauでClickHouseデータソースを設定する {#configure-a-clickhouse-data-source-in-tableau}

`clickhouse-jdbc`ドライバのインストールと設定が完了したので、ClickHouseの**TPCD**データベースに接続するTableauデータソースの定義方法を見ていきましょう。

1. Tableauを起動します。(既に起動している場合は、再起動してください。)

2. 左側のメニューから、**To a Server**セクションの下にある**More**をクリックします。利用可能なコネクタリストから**ClickHouse by ClickHouse**を検索します:

<Image
  size='md'
  img={tableau_connecttoserver}
  alt='ClickHouse by ClickHouseオプションがハイライトされたコネクタ選択メニューを表示するTableau接続画面'
  border
/>
<br />

:::note
コネクタリストに**ClickHouse by ClickHouse**コネクタが表示されない場合は、古いTableau Desktopバージョンが原因である可能性があります。
この問題を解決するには、Tableau Desktopアプリケーションのアップグレードを検討するか、[コネクタを手動でインストール](#install-the-connector-manually)してください。
:::

3. **ClickHouse by ClickHouse**をクリックすると、次のダイアログが表示されます:

<Image
  size='md'
  img={tableau_connector_details}
  alt='ClickHouse JDBCコネクタの詳細とインストールボタンを表示するTableauコネクタインストールダイアログ'
  border
/>
<br />
4. **Install and Restart Tableau**をクリックします。アプリケーションを再起動します。5. 再起動後、コネクタは完全な名前`ClickHouse JDBC by ClickHouse, Inc.`で表示されます。これをクリックすると、次のダイアログが表示されます:

<Image
  size='md'
  img={tableau_connector_dialog}
  alt='サーバー、ポート、データベース、ユーザー名、パスワードのフィールドを表示するTableauのClickHouse接続ダイアログ'
  border
/>
<br />

6. 接続情報を入力します:

   | 設定     | 値                                                    |
   | -------- | ----------------------------------------------------- |
   | Server   | **ClickHouseホスト(プレフィックスやサフィックスなし)** |
   | Port     | **8443**                                              |
   | Database | **default**                                           |
   | Username | **default**                                           |
   | Password | \*\*\*\*\*\*                                          |

:::note
ClickHouse Cloudを使用する場合は、安全な接続のためにSSLチェックボックスを有効にする必要があります。
:::

<br />

:::note
ClickHouseデータベースの名前は**TPCD**ですが、上記のダイアログでは**Database**を**default**に設定し、次のステップで**Schema**に**TPCD**を選択する必要があります。(これはコネクタのバグによるものと考えられるため、この動作は将来変更される可能性がありますが、現時点ではデータベースとして**default**を使用する必要があります。)
:::

7. **Sign In**ボタンをクリックすると、新しいTableauワークブックが表示されます:

<Image
  size='md'
  img={tableau_newworkbook}
  alt='データベース選択オプションを含む初期接続画面を表示する新しいTableauワークブック'
  border
/>
<br />

8. **Schema**ドロップダウンから**TPCD**を選択すると、**TPCD**内のテーブルのリストが表示されます:

<Image
  size='md'
  img={tableau_tpcdschema}
  alt='CUSTOMER、LINEITEM、NATION、ORDERSなどを含むTPCDデータベーステーブルを表示するTableauスキーマ選択画面'
  border
/>
<br />

これでTableauでビジュアライゼーションを構築する準備が整いました!


## Tableauでのビジュアライゼーションの構築 {#building-visualizations-in-tableau}

TableauでClickHouseデータソースの設定が完了したので、データを可視化してみましょう...

1. **CUSTOMER**テーブルをワークブックにドラッグします。列は表示されますが、データテーブルは空の状態です：

<Image
  size='md'
  img={tableau_workbook1}
  alt='CUSTOMERテーブルがキャンバスにドラッグされ、列ヘッダーは表示されているがデータがないTableauワークブック'
  border
/>
<br />

2. **Update Now**ボタンをクリックすると、**CUSTOMER**から100行がテーブルに表示されます。

3. **ORDERS**テーブルをワークブックにドラッグし、2つのテーブル間のリレーションシップフィールドとして**Custkey**を設定します：

<Image
  size='md'
  img={tableau_workbook2}
  alt='Custkeyフィールドを使用してCUSTOMERテーブルとORDERSテーブル間の接続を示すTableauリレーションシップエディター'
  border
/>
<br />

4. これで**ORDERS**テーブルと**LINEITEM**テーブルがデータソースとして相互に関連付けられたので、このリレーションシップを使用してデータに関する質問に答えることができます。ワークブック下部の**Sheet 1**タブを選択します。

<Image
  size='md'
  img={tableau_workbook3}
  alt='分析に使用可能なClickHouseテーブルのディメンションとメジャーを表示するTableauワークシート'
  border
/>
<br />

5. 各年に特定の商品が何個注文されたかを知りたいとします。**ORDERS**から**OrderDate**を**Columns**セクション（横方向のフィールド）にドラッグし、次に**LINEITEM**から**Quantity**を**Rows**にドラッグします。Tableauは次の折れ線グラフを生成します：

<Image
  size='sm'
  img={tableau_workbook4}
  alt='ClickHouseデータから年別の注文数量を示すTableau折れ線グラフ'
  border
/>
<br />

あまり変化のない折れ線グラフですが、このデータセットはスクリプトによって生成され、クエリパフォーマンスのテスト用に構築されたものであるため、TCPDデータのシミュレートされた注文にはあまり変動がないことがわかります。

6. 四半期別および配送モード別（航空、郵便、船舶、トラックなど）の平均注文金額（ドル）を知りたいとします：
   - **New Worksheet**タブをクリックして新しいシートを作成します
   - **ORDERS**から**OrderDate**を**Columns**にドラッグし、**Year**から**Quarter**に変更します
   - **LINEITEM**から**Shipmode**を**Rows**にドラッグします

次のように表示されます：

<Image
  size='sm'
  img={tableau_workbook5}
  alt='四半期を列、配送モードを行とするTableauクロス集計ビュー'
  border
/>
<br />

7. **Abc**の値は、メトリックをテーブルにドラッグするまでの仮の表示です。**ORDERS**から**Totalprice**をテーブルにドラッグします。デフォルトの計算が**Totalprices**の**SUM**になっていることに注意してください：

<Image
  size='md'
  img={tableau_workbook6}
  alt='四半期別および配送モード別の合計価格を示すTableauクロス集計'
  border
/>
<br />

8. **SUM**をクリックして**Measure**を**Average**に変更します。同じドロップダウンメニューから**Format**を選択し、**Numbers**を**Currency (Standard)**に変更します：

<Image
  size='md'
  img={tableau_workbook7}
  alt='通貨形式で四半期別および配送モード別の平均注文価格を示すTableauクロス集計'
  border
/>
<br />

お疲れ様でした！TableauとClickHouseの接続に成功し、ClickHouseデータの分析と可視化の可能性が大きく広がりました。


## コネクタを手動でインストールする {#install-the-connector-manually}

デフォルトでコネクタが含まれていない旧バージョンのTableau Desktopを使用している場合は、以下の手順に従って手動でインストールできます：

1. [Tableau Exchange](https://exchange.tableau.com/products/1064)から最新のtacoファイルをダウンロードします
2. tacoファイルを以下の場所に配置します
   - macOS: `~/Documents/My Tableau Repository/Connectors`
   - Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Tableau Desktopを再起動します。セットアップが正常に完了すると、`New Data Source`セクションにコネクタが表示されます。


## 接続と分析のヒント {#connection-and-analysis-tips}

Tableau-ClickHouse統合を最適化するための詳細なガイダンスについては、
[接続のヒント](/integrations/tableau/connection-tips)および[分析のヒント](/integrations/tableau/analysis-tips)をご参照ください。


## テスト {#tests}

このコネクタは[TDVTフレームワーク](https://tableau.github.io/connector-plugin-sdk/docs/tdvt)を使用してテストされており、現在97%のカバレッジ率を維持しています。


## Summary {#summary}

TableauとClickHouseの接続には汎用のODBC/JDBCドライバーを使用できますが、本コネクターを使用することで接続設定プロセスを簡素化できます。コネクターに関する問題が発生した場合は、<a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>までお気軽にお問い合わせください。
