---
sidebar_label: 'Tableau Desktop'
sidebar_position: 1
slug: /integrations/tableau
keywords: ['clickhouse', 'tableau', 'connect', 'integrate', 'ui']
description: 'TableauはClickHouseデータベースとテーブルをデータソースとして使用できます。'
title: 'TableauをClickHouseに接続する'
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


# TableauをClickHouseに接続する

ClickHouseは、[Tableau Exchange](https://exchange.tableau.com/products/1064)に掲載されている公式のTableauコネクタを提供しています。
このコネクタは、ClickHouseの高度な[ JDBC ドライバ ](/integrations/language-clients/java/jdbc)に基づいています。

このコネクタを使用すると、TableauはClickHouseのデータベースやテーブルをデータソースとして統合します。この機能を有効にするには、以下のセットアップガイドに従ってください。

<TOCInline toc={toc}/>

## 使用前に必要なセットアップ {#setup-required-prior-usage}


1. 接続の詳細を収集します
   <ConnectionDetails />

2.  <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   Desktop</a>をダウンロードしてインストールします。
3. `clickhouse-tableau-connector-jdbc`の指示に従って、 <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC ドライバ</a>の互換バージョンをダウンロードします。

:::note
**clickhouse-jdbc-x.x.x-shaded-all.jar** JARファイルをダウンロードすることを確認してください。現在、`0.8.X` のバージョンの使用を推奨しています。
:::

4. JDBCドライバを次のフォルダに保存します（OSに応じて、フォルダが存在しない場合は作成できます）：
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. TableauでClickHouseデータソースを構成し、データビジュアライゼーションを作成し始めましょう！

## TableauでClickHouseデータソースを構成する {#configure-a-clickhouse-data-source-in-tableau}

`clickhouse-jdbc`ドライバをインストールして設定したので、ClickHouseの**TPCD**データベースに接続するデータソースをTableauで定義する方法を見てみましょう。

1. Tableauを起動します。（既に実行中であれば、再起動してください。）

2. 左側のメニューから、**サーバーに接続**セクションの下にある**その他**をクリックします。利用可能なコネクタリストで**ClickHouse by ClickHouse**を検索します：

<Image size="md" img={tableau_connecttoserver} alt="Tableau接続画面でClickHouse by ClickHouseオプションが強調表示されたコネクタ選択メニュー" border />
<br/>

:::note
コネクタリストに**ClickHouse by ClickHouse**が表示されないですか？それは古いTableau Desktopのバージョンが原因かもしれません。
その場合は、Tableau Desktopアプリケーションをアップグレードするか、[コネクタを手動でインストール](#install-the-connector-manually)を検討してください。
:::

3. **ClickHouse by ClickHouse**をクリックすると、次のダイアログが表示されます：

<Image size="md" img={tableau_connector_details} alt="TableauコネクタインストールダイアログでClickHouse JDBCコネクタの詳細とインストールボタンが表示される" border />
<br/>
 
4. **インストールしてTableauを再起動**をクリックします。アプリケーションを再起動します。
5. 再起動後、コネクタはフルネーム「`ClickHouse JDBC by ClickHouse, Inc.`」で表示されます。それをクリックすると、次のダイアログがポップアップします：

<Image size="md" img={tableau_connector_dialog} alt="TableauのClickHouse接続ダイアログでサーバー、ポート、データベース、ユーザー名、パスワードのフィールドが表示される" border />
<br/>

6. 接続の詳細を入力します：

    | 設定  | 値                                                  |
    | ----------- |--------------------------------------------------------|
    | サーバー      | **プレフィックスやサフィックスなしのClickHouseホスト** |
    | ポート   | **8443**                                               |
    | データベース | **default**                                            |
    | ユーザー名 | **default**                                            |
    | パスワード | *\*****                                                |

:::note
ClickHouse cloudを使用する場合は、安全な接続のためにSSLチェックボックスを有効にする必要があります。
:::
<br/>


:::note
私たちのClickHouseデータベースは**TPCD**という名前ですが、上のダイアログでは**データベース**を**default**に設定し、次のステップで**スキーマ**に**TPCD**を選択する必要があります。（これはコネクタのバグによる可能性が高いので、この動作は変更される可能性がありますが、現時点ではデータベースとして**default**を使用する必要があります。）
:::

7. **サインイン**ボタンをクリックし、新しいTableauワークブックが表示されるはずです：

<Image size="md" img={tableau_newworkbook} alt="新しいTableauワークブックでデータベース選択オプションを持つ初期接続画面が表示される" border />
<br/>

8. **スキーマ**のドロップダウンから**TPCD**を選択すると、**TPCD**のテーブル一覧が表示されます：

<Image size="md" img={tableau_tpcdschema} alt="Tableauスキーマ選択でTPCDデータベースのテーブル、顧客、行項目、国、注文などが表示される" border />
<br/>

これで、Tableauでビジュアライゼーションを作成する準備が整いました！

## Tableauでビジュアライゼーションを作成する {#building-visualizations-in-tableau}

TableauでClickHouseデータソースを構成したので、データを視覚化しましょう...

1. **CUSTOMER**テーブルをワークブックにドラッグします。カラムが表示されますが、データテーブルは空です：

<Image size="md" img={tableau_workbook1} alt="CUSTOMERテーブルがキャンバスにドラッグされているTableauワークブック、カラムヘッダーは表示されているがデータはない" border />
<br/>

2. **今すぐ更新**ボタンをクリックすると、**CUSTOMER**から100行がテーブルに入力されます。


3. **ORDERS**テーブルをワークブックにドラッグし、2つのテーブル間のリレーションシップフィールドとして**Custkey**を設定します：

<Image size="md" img={tableau_workbook2} alt="TableauリレーションシップエディタでCUSTOMERテーブルとORDERSテーブル間のCustkeyフィールドによる接続が表示される" border />
<br/>

4. 現在、**ORDERS**と**LINEITEM**テーブルがデータソースとして関連付けられたため、このリレーションシップを使用してデータに関する質問に答えることができます。ワークブックの下部で**Sheet 1**タブを選択します。

<Image size="md" img={tableau_workbook3} alt="Tableauワークシートでクリックハウステーブルからの分析に利用可能な次元とメジャーが表示される" border />
<br/>

5. 特定のアイテムが毎年いくつ注文されたかを知りたいとしましょう。**ORDERS**から**OrderDate**を**Columns**セクション（横のフィールド）にドラッグし、**LINEITEM**から**Quantity**を**Rows**にドラッグします。Tableauは次のような折れ線グラフを生成します：

<Image size="sm" img={tableau_workbook4} alt="Tableau折れ線グラフ、ClickHouseデータから年ごとの発注数量が表示される" border />
<br/>

あまり興味深い折れ線グラフではありませんが、このデータセットはスクリプトによって生成され、クエリパフォーマンスをテストするために構築されたため、TCPDデータの模擬注文にはあまり変動がないことに注意してください。

6. 四半期ごとおよび配送料モード（航空便、郵便、船、トラックなど）による平均注文金額（米ドル）が知りたいとしましょう：

    - **New Worksheet**タブをクリックして新しいシートを作成します
    - **ORDERS**から**OrderDate**を**Columns**にドラッグし、**年**から**四半期**に変更します
    - **LINEITEM**から**Shipmode**を**Rows**にドラッグします

次のような結果が表示されます：

<Image size="sm" img={tableau_workbook5} alt="Tableauクロス集計ビュー、四半期が列になり配送モードが行になっている" border />
<br/>

7. **Abc**値は、メトリックをテーブルにドラッグするまでのスペースを埋めているだけです。**ORDERS**から**Totalprice**をテーブルにドラッグします。デフォルトの計算は**Totalprices**を**SUM**します：

<Image size="md" img={tableau_workbook6} alt="Tableauクロス集計表示、四半期および配送モードごとの合計価格の合計が表示される" border />
<br/>

8. **SUM**をクリックして、**Measure**を**Average**に変更します。同じドロップダウンメニューから**Format**を選択し、**Numbers**を**Currency (Standard)**に変更します：

<Image size="md" img={tableau_workbook7} alt="Tableauクロス集計表示、四半期および配送モードごとの平均注文価格を通貨形式で表示" border />
<br/>

お疲れ様でした！あなたは成功裏にTableauをClickHouseに接続し、ClickHouseデータの分析と視覚化のための新しい可能性の世界を開きました。

## コネクタを手動でインストールする {#install-the-connector-manually}

コネクタがデフォルトで含まれていない古いTableau Desktopバージョンを使用している場合、以下の手順で手動でインストールできます。

1. [Tableau Exchange](https://exchange.tableau.com/products/1064)から最新のtacoファイルをダウンロードします
2. tacoファイルを次のディレクトリに置きます
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Tableau Desktopを再起動します。セットアップが成功した場合、`New Data Source`セクションでコネクタが設定されます。

## 接続と分析のヒント {#connection-and-analysis-tips}

Tableau-ClickHouse統合の最適化に関する詳しいガイダンスは、[接続のヒント](/integrations/tableau/connection-tips)や[分析のヒント](/integrations/tableau/analysis-tips)をご覧ください。

## テスト {#tests}
コネクタは[TDVTフレームワーク](https://tableau.github.io/connector-plugin-sdk/docs/tdvt)でテストされており、現在97％のカバレッジ比率を維持しています。

## 概要 {#summary}
一般的なODBC/JDBC ClickHouseドライバを使用してTableauをClickHouseに接続できます。ただし、このコネクタは接続設定プロセスを簡素化します。コネクタに関して問題が発生した場合は、<a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank">GitHub</a>でお問い合わせください。
