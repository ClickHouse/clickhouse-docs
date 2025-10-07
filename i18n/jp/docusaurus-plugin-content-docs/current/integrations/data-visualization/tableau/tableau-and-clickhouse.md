---
'sidebar_label': 'Tableau Desktop'
'sidebar_position': 1
'slug': '/integrations/tableau'
'keywords':
- 'clickhouse'
- 'tableau'
- 'connect'
- 'integrate'
- 'ui'
'description': 'TableauはClickHouse データベースおよびテーブルをデータソースとして使用できます。'
'title': 'TableauをClickHouseに接続する'
'doc_type': 'guide'
---

import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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

ClickHouseは公式のTableauコネクタを提供しており、
[Tableau Exchange](https://exchange.tableau.com/products/1064)で特集されています。
このコネクタは、ClickHouseの高度な[JDBCドライバ](/integrations/language-clients/java/jdbc)に基づいています。

このコネクタを使用すると、TableauはClickHouseのデータベースとテーブルをデータソースとして統合します。この機能を有効にするには、以下のセットアップガイドに従ってください。

<TOCInline toc={toc}/>

## 使用前に必要なセットアップ {#setup-required-prior-usage}

1. 接続詳細を収集する
   <ConnectionDetails />

2. <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau Desktop</a>をダウンロードしてインストールします。
3. `clickhouse-tableau-connector-jdbc`の指示に従って、<a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBCドライバ</a>の互換バージョンをダウンロードします。

:::note
[clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases) JARファイルをダウンロードしてください。このアーティファクトはバージョン`0.9.2`以降で利用可能です。
:::

4. JDBCドライバを以下のフォルダに保存します（OSに基づいており、フォルダが存在しない場合は作成できます）：
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. TableauでClickHouseデータソースを設定し、データビジュアライゼーションを構築を開始しましょう！

## TableauでClickHouseデータソースを設定する {#configure-a-clickhouse-data-source-in-tableau}

`clickhouse-jdbc`ドライバをインストールして設定したので、ClickHouseの**TPCD**データベースに接続するデータソースをTableauで定義する方法を見てみましょう。

1. Tableauを起動します。（すでに実行している場合は、再起動してください。）

2. 左側のメニューから、**サーバーに接続**セクションの**その他**をクリックします。利用できるコネクタ一覧で**ClickHouse by ClickHouse**を検索します：

<Image size="md" img={tableau_connecttoserver} alt="ClickHouse by ClickHouseオプションがハイライトされたコネクタ選択メニューを示すTableau接続画面" border />
<br/>

:::note
コネクタ一覧に**ClickHouse by ClickHouse**が表示されませんか？古いTableau Desktopバージョンが関係している可能性があります。
それを解決するために、Tableau Desktopアプリケーションをアップグレードするか、[コネクタを手動でインストール](#install-the-connector-manually)することを検討してください。
:::

3. **ClickHouse by ClickHouse**をクリックすると、次のダイアログが表示されます：

<Image size="md" img={tableau_connector_details} alt="ClickHouse JDBCコネクタの詳細とインストールボタンを示すTableauコネクタインストールダイアログ" border />
<br/>
 
4. **インストールしてTableauを再起動**をクリックします。アプリケーションを再起動します。
5. 再起動後、コネクタは完全な名前を持ちます：`ClickHouse JDBC by ClickHouse, Inc.`。これをクリックすると、次のダイアログが表示されます：

<Image size="md" img={tableau_connector_dialog} alt="サーバー、ポート、データベース、ユーザー名、パスワードのフィールドを示すTableau接続ダイアログ" border />
<br/>

6. 接続詳細を入力します：

    | 設定  | 値                                                  |
    | ----------- |--------------------------------------------------------|
    | サーバー      | **ClickHouseホスト（接頭辞または接尾辞なし）** |
    | ポート   | **8443**                                               |
    | データベース | **default**                                            |
    | ユーザー名 | **default**                                            |
    | パスワード | *\*****                                                |

:::note
ClickHouseクラウドを使用する場合は、安全な接続のためにSSLチェックボックスを有効にする必要があります。
:::
<br/>

:::note
私たちのClickHouseデータベースは**TPCD**と呼ばれていますが、上記のダイアログで**データベース**を**default**に設定し、次のステップで**スキーマ**に**TPCD**を選択する必要があります。（これはコネクタのバグによる可能性があるため、この動作が変わる可能性がありますが、現状では**default**をデータベースとして使用する必要があります。）
:::

7. **サインイン**ボタンをクリックすると、新しいTableauワークブックが表示されます：

<Image size="md" img={tableau_newworkbook} alt="データベース選択オプションを持つ最初の接続画面を示す新しいTableauワークブック" border />
<br/>

8. **スキーマ**のドロップダウンから**TPCD**を選択すると、**TPCD**のテーブルのリストが表示されます：

<Image size="md" img={tableau_tpcdschema} alt="CUSTOMER、LINEITEM、NATION、ORDERSなどのTPCDデータベーステーブルを示すTableauスキーマ選択画面" border />
<br/>

これでTableauでビジュアライゼーションを構築する準備が整いました！

## Tableauでのビジュアライゼーション構築 {#building-visualizations-in-tableau}

TableauにClickHouseデータソースが設定されたので、データを可視化してみましょう...

1. **CUSTOMER**テーブルをワークブックにドラッグします。カラムが表示されますが、データテーブルは空です：

<Image size="md" img={tableau_workbook1} alt="カラムヘッダーは表示されるがデータがない状態のCUSTOMERテーブルがキャンバスにドラッグされたTableauワークブック" border />
<br/>

2. **今すぐ更新**ボタンをクリックすると、**CUSTOMER**から100行がテーブルに入力されます。

3. **ORDERS**テーブルをワークブックにドラッグし、2つのテーブルの関係フィールドとして**Custkey**を設定します：

<Image size="md" img={tableau_workbook2} alt="Custkeyフィールドを使用してCUSTOMERとORDERSテーブルの接続を示すTableauリレーションシップエディタ" border />
<br/>

4. 現在、データソースとして**ORDERS**と**LINEITEM**テーブルが関連付けられているので、この関係を使用してデータに関する質問に答えることができます。ワークブックの一番下にある**シート1**タブを選択します。

<Image size="md" img={tableau_workbook3} alt="分析のために利用可能なClickHouseテーブルからの次元とメジャーを示すTableauワークシート" border />
<br/>

5. 特定の項目が各年にどれだけ注文されたかを知りたいとします。**ORDERS**から**OrderDate**を**列**セクション（横のフィールド）にドラッグし、次に**LINEITEM**から**Quantity**を**行**にドラッグします。Tableauは次の折れ線グラフを生成します：

<Image size="sm" img={tableau_workbook4} alt="ClickHouseデータから年ごとの注文数を示すTableau折れ線グラフ" border />
<br/>

非常に刺激的な折れ線グラフではありませんが、データセットはスクリプトによって生成され、クエリパフォーマンスをテストするために構築されたため、TCPDデータの模擬注文にはあまり変動がないことに気づくでしょう。

6. 四半期ごとや出荷モード（航空、郵送、出荷、トラックなど）ごとの平均注文額（ドル）を知りたいとします：

    - **新しいワークシート**タブをクリックして新しいシートを作成する
    - **ORDERS**から**OrderDate**を**列**にドラッグし、**年**から**四半期**に変更する
    - **LINEITEM**から**Shipmode**を**行**にドラッグする

次のような画面が表示されるはずです：

<Image size="sm" img={tableau_workbook5} alt="四半期を列、出荷モードを行として示すTableauクロス集計ビュー" border />
<br/>

7. **Abc**の値は、テーブルにメトリックをドラッグするまで、そのスペースを埋めるためのものです。**ORDERS**から**Totalprice**をテーブルにドラッグします。既定の計算は**Totalprices**を**合計**することです：

<Image size="md" img={tableau_workbook6} alt="四半期と出荷モードごとの合計価格を示すTableauクロス集計" border />
<br/>

8. **SUM**をクリックして**メジャー**を**平均**に変更します。同じドロップダウンメニューから**形式**を選択し、**数字**を**通貨（標準）**に変更します：

<Image size="md" img={tableau_workbook7} alt="通貨形式で四半期と出荷モードごとの平均注文額を示すTableauクロス集計" border />
<br/>

素晴らしい！TableauをClickHouseに成功裏に接続し、ClickHouseデータの分析と可視化の新たな可能性を開きました。

## コネクタを手動でインストールする {#install-the-connector-manually}

デフォルトでコネクタが含まれていない古いTableau Desktopバージョンを使用している場合は、以下の手順に従って手動でインストールできます：

1. [Tableau Exchange](https://exchange.tableau.com/products/1064)から最新のtacoファイルをダウンロードします
2. tacoファイルを以下の場所に配置します：
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Tableau Desktopを再起動します。セットアップが成功した場合、`新しいデータソース`セクションにコネクタが表示されます。

## 接続と分析のヒント {#connection-and-analysis-tips}

Tableau-ClickHouse統合を最適化するためのさらなるガイダンスについては、
[接続のヒント](/integrations/tableau/connection-tips)と[分析のヒント](/integrations/tableau/analysis-tips)をご覧ください。

## テスト {#tests}
コネクタは[TDVTフレームワーク](https://tableau.github.io/connector-plugin-sdk/docs/tdvt)を使用してテストされており、現在97％のカバレッジ率を維持しています。

## 概要 {#summary}
一般的なODBC/JDBC ClickHouseドライバを使用してTableauをClickHouseに接続できます。ただし、このコネクタは接続設定プロセスを簡素化しています。コネクタに関する問題がある場合は、<a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>でお問い合わせください。
