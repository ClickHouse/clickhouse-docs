---
sidebar_label: Tableau Desktop
sidebar_position: 1
slug: /integrations/tableau
keywords: [ clickhouse, tableau, connect, integrate, ui ]
description: TableauはClickHouseデータベースやテーブルをデータソースとして使用できます。
---
import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# TableauをClickHouseに接続する

ClickHouseは公式のTableauコネクタを提供しており、これは
[Tableau Exchange](https://exchange.tableau.com/products/1064)に掲載されています。
このコネクタは、ClickHouseの高度な[ JDBCドライバ](/integrations/language-clients/java/jdbc)に基づいています。

このコネクタを使用すると、TableauはClickHouseデータベースやテーブルをデータソースとして統合します。この機能を有効にするには、
以下のセットアップガイドに従ってください。

<TOCInline toc={toc}/>

## 使用前に必要な設定 {#setup-required-prior-usage}

1. 接続詳細を収集します
   <ConnectionDetails />

2. <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>をダウンロードしてインストールします。
3. `clickhouse-tableau-connector-jdbc`の指示に従って、互換性のある<a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBCドライバ</a>のバージョンをダウンロードします。

:::note
**clickhouse-jdbc-x.x.x-shaded-all.jar** JARファイルをダウンロードしてください。現在、バージョン`0.8.X`の使用を推奨しています。
:::

4. JDBCドライバを以下のフォルダーに保存します（OSに基づき、フォルダーが存在しない場合は作成できます）：
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. TableauでClickHouseデータソースを構成し、データビジュアライゼーションを作成し始めます！

## TableauでClickHouseデータソースを構成する {#configure-a-clickhouse-data-source-in-tableau}

`clickhouse-jdbc`ドライバをインストールし設定したので、ClickHouseの**TPCD**データベースに接続するデータソースをTableauで定義する方法を見てみましょう。

1. Tableauを起動します。（既に起動している場合は再起動してください。）

2. 左側のメニューから、**サーバーへの接続**セクションにある**その他**をクリックします。利用可能なコネクタリストで**ClickHouse by ClickHouse**を検索します：

<img alt="ClickHouse JDBC" src={tableau_connecttoserver}/>
<br/>

:::note
コネクタリストに**ClickHouse by ClickHouse**が表示されない場合、古いTableau Desktopバージョンが原因かもしれません。
その場合、Tableau Desktopアプリケーションをアップグレードするか、[コネクタを手動でインストール](#install-the-connector-manually)してみてください。
:::

3. **ClickHouse by ClickHouse**をクリックすると、以下のダイアログが表示されます：

<img alt="ClickHouse JDBC Connector Details" src={tableau_connector_details}/>
<br/>

4. **インストールしてTableauを再起動**をクリックします。アプリケーションを再起動します。
5. 再起動後、コネクタの完全名は`ClickHouse JDBC by ClickHouse, Inc.`になります。それをクリックすると、以下のダイアログが表示されます：

<img alt="ClickHouse JDBC Connector Details Details" src={tableau_connector_dialog}/>
<br/>

6. 接続詳細を入力します：

    | 設定  | 値                                                  |
    | ----- |---------------------------------------------------|
    | サーバー      | **あなたのClickHouseホスト（接頭辞や接尾辞なし）** |
    | ポート   | **8443**                                           |
    | データベース | **default**                                        |
    | ユーザー名 | **default**                                        |
    | パスワード | *\*****                                            |

:::note
ClickHouse cloudを利用している場合、安全な接続のためにSSLチェックボックスを有効にする必要があります。
:::
<br/>

:::note
私たちのClickHouseデータベースの名前は**TPCD**ですが、上記のダイアログで**データベース**を**default**に設定し、次のステップで**スキーマ**に**TPCD**を選択する必要があります。（これはコネクタのバグによるもので、この動作は変更される可能性がありますが、現在は**default**をデータベースとして使用する必要があります。）
:::

7. **サインイン**ボタンをクリックすると、新しいTableauワークブックが表示されます：

<img alt="New Workbook" src={tableau_newworkbook}/>
<br/>

8. **スキーマ**のドロップダウンから**TPCD**を選択すると、**TPCD**内のテーブルの一覧が表示されます：

<img alt="Select TPCD for the Schema" src={tableau_tpcdschema}/>
<br/>

これでTableauでビジュアライゼーションを構築する準備が整いました！

## Tableauでビジュアライゼーションを作成する {#building-visualizations-in-tableau}

TableauにClickHouseデータソースが構成されたので、データを可視化してみましょう...

1. **CUSTOMER**テーブルをワークブックにドラッグします。カラムは表示されますが、データテーブルは空です：

<img alt="Tableau workbook" src={tableau_workbook1}/>
<br/>

2. **今すぐ更新**ボタンをクリックすると、**CUSTOMER**から100行がテーブルを埋めます。

3. **ORDERS**テーブルをワークブックにドラッグし、2つのテーブル間のリレーションシップフィールドとして**Custkey**を設定します：

<img alt="Tableau workbook" src={tableau_workbook2}/>
<br/>

4. 現在、**ORDERS**テーブルと**LINEITEM**テーブルがデータソースとして関連付けられたので、このリレーションシップを使用してデータに関する質問に答えることができます。ワークブックの下にある**Sheet 1**タブを選択します。

<img alt="Tableau workbook" src={tableau_workbook3}/>
<br/>

5. 例えば、毎年どれだけの特定のアイテムが注文されたかを知りたいとします。**ORDERS**の**OrderDate**を**Columns**セクション（水平フィールド）にドラッグし、次に**LINEITEM**の**Quantity**を**Rows**にドラッグします。Tableauは次のような折れ線グラフを生成します：

<img alt="Tableau workbook" src={tableau_workbook4}/>
<br/>

それほど興味深い折れ線グラフではありませんが、データセットはスクリプトによって生成され、クエリパフォーマンスをテストするために構築されたため、TCPDデータのシミュレートされたオーダーにはあまり変動がないことに気付くでしょう。

6. 四半期ごとの平均注文額（ドル）や配送モード（航空、郵送、船、トラックなど）を知りたいとしましょう：

    - **新しいワークシート**タブをクリックして新しいシートを作成します
    - **ORDERS**から**OrderDate**を**Columns**にドラッグし、それを**年**から**四半期**に変更します
    - **LINEITEM**から**Shipmode**を**Rows**にドラッグします

次のようになります：

<img alt="Tableau workbook" src={tableau_workbook5}/>
<br/>

7. **Abc**の値は、テーブルにメトリックをドラッグするまでのスペースを埋めるためのものです。**ORDERS**から**Totalprice**をテーブルにドラッグします。デフォルトの計算は**Totalprices**の**SUM**となります：

<img alt="Tableau workbook" src={tableau_workbook6}/>
<br/>

8. **SUM**をクリックして**Measure**を**Average**に変更します。同じドロップダウンメニューから**Format**を選択し、**Numbers**を**Currency (Standard)**に変更します：

<img alt="Tableau workbook" src={tableau_workbook7}/>
<br/>

よくできました！あなたはTableauをClickHouseに正常に接続し、ClickHouseデータを分析し可視化するための無限の可能性を開きました。

## コネクタを手動でインストールする {#install-the-connector-manually}

コネクタがデフォルトで含まれていない古いTableau Desktopバージョンを使用している場合、以下の手順に従って手動でインストールできます：

1. [Tableau Exchange](https://exchange.tableau.com/products/1064)から最新のtacoファイルをダウンロードします
2. tacoファイルを次の場所に置きます：
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Tableau Desktopを再起動します。設定が成功した場合、`新しいデータソース`セクションにコネクタが表示されます。

## 接続と分析のヒント {#connection-and-analysis-tips}

Tableau-ClickHouse統合を最適化するためのさらなるガイダンスについては、
[接続のヒント](/integrations/tableau/connection-tips)と[分析のヒント](/integrations/tableau/analysis-tips)をご覧ください。

## テスト {#tests}
このコネクタは[TDVTフレームワーク](https://tableau.github.io/connector-plugin-sdk/docs/tdvt)でテストされており、現在97%のカバレッジ比率を維持しています。

## 概要 {#summary}
一般的なODBC/JDBC ClickHouseドライバを使用してTableauをClickHouseに接続できます。ただし、このコネクタは接続設定プロセスを簡素化します。コネクタに問題がある場合は、<a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>にお問い合わせください。
