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
'description': 'TableauはClickHouseデータベースとテーブルをデータソースとして使用できます。'
'title': 'Connecting Tableau to ClickHouse'
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

ClickHouseは公式のTableauコネクタを提供しており、[Tableau Exchange](https://exchange.tableau.com/products/1064)に掲載されています。このコネクタはClickHouseの高度な[JDBCドライバ](/integrations/language-clients/java/jdbc)を基にしています。

このコネクタを使用することで、TableauはClickHouseのデータベースやテーブルをデータソースとして統合します。この機能を有効にするには、以下のセットアップガイドに従ってください。

<TOCInline toc={toc}/>

## 使用前に必要なセットアップ {#setup-required-prior-usage}

1. 接続の詳細を集める
   <ConnectionDetails />

2. <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau desktop</a>をダウンロードしてインストールします。
3. `clickhouse-tableau-connector-jdbc`の指示に従って、<a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBCドライバ</a>の互換性のあるバージョンをダウンロードします。

:::note
**clickhouse-jdbc-x.x.x-shaded-all.jar** JARファイルをダウンロードしてください。現在、バージョン`0.8.X`の使用を推奨しています。
:::

4. JDBCドライバを以下のフォルダに保存します（OSに応じて、フォルダが存在しない場合は新しく作成できます）：
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. TableauでClickHouseデータソースを構成し、データビジュアライゼーションの作成を開始します！

## TableauでClickHouseデータソースを構成する {#configure-a-clickhouse-data-source-in-tableau}

`clickhouse-jdbc`ドライバがインストールされ、設定されたので、ClickHouseの**TPCD**データベースに接続するデータソースをTableauで定義する方法を見てみましょう。

1. Tableauを起動します。（既に起動している場合は再起動します。）

2. 左側のメニューから、**サーバーに接続**セクションの**その他**をクリックします。利用可能なコネクタのリストから**ClickHouse by ClickHouse**を検索します：

<Image size="md" img={tableau_connecttoserver} alt="コネクタ選択メニューに「ClickHouse by ClickHouse」オプションがハイライトされたTableau接続画面" border />
<br/>

:::note
コネクタのリストに**ClickHouse by ClickHouse**が表示されないですか？それは古いTableau Desktopバージョンに関連している可能性があります。それを解決するには、Tableau Desktopアプリケーションをアップグレードするか、[コネクタを手動でインストールする](#install-the-connector-manually)ことを検討してください。
:::

3. **ClickHouse by ClickHouse**をクリックすると、以下のダイアログがポップアップします：

<Image size="md" img={tableau_connector_details} alt="TableauコネクタインストールダイアログにClickHouse JDBCコネクタの詳細とインストールボタンが表示されている" border />
<br/>

4. **インストールしてTableauを再起動**をクリックします。アプリケーションを再起動します。
5. 再起動後、コネクタは完全な名称で表示されます：`ClickHouse JDBC by ClickHouse, Inc.`。これをクリックすると、以下のダイアログがポップアップします：

<Image size="md" img={tableau_connector_dialog} alt="Tableauの接続ダイアログにサーバー、ポート、データベース、ユーザー名、パスワードのフィールドが表示されている" border />
<br/>

6. 接続の詳細を入力します：

    | 設定  | 値                                                       |
    |-----------|--------------------------------------------------------|
    | サーバー      | **あなたのClickHouseホスト（プレフィックスやサフィックスなし）** |
    | ポート   | **8443**                                                  |
    | データベース | **default**                                            |
    | ユーザー名 | **default**                                            |
    | パスワード | *\*****                                               |

:::note
ClickHouseクラウドを使用する場合、セキュア接続のためにSSLチェックボックスを有効にする必要があります。
:::
<br/>

:::note
私たちのClickHouseデータベースは**TPCD**という名前ですが、上記のダイアログでは**データベース**を**default**に設定し、次のステップで**スキーマ**に**TPCD**を選択してください。（これはコネクタのバグによるものと思われるため、この動作は変更される可能性がありますが、現時点ではデータベースには**default**を使用する必要があります。）
:::

7. **サインイン**ボタンをクリックすると、新しいTableauワークブックが表示されます：

<Image size="md" img={tableau_newworkbook} alt="新しいTableauワークブックの初期接続画面がデータベース選択オプションと共に表示されている" border />
<br/>

8. **スキーマ**のドロップダウンから**TPCD**を選択すると、**TPCD**内のテーブルのリストが表示されます：

<Image size="md" img={tableau_tpcdschema} alt="Tableauスキーマ選択がTPCDデータベースのテーブル（CUSTOMER、LINEITEM、NATION、ORDERSなど）を表示している" border />
<br/>

これでTableauでビジュアライゼーションを作成する準備が整いました！

## Tableauでビジュアライゼーションを構築する {#building-visualizations-in-tableau}

TableauでClickHouseデータソースが設定されたので、データを視覚化してみましょう...

1. **CUSTOMER**テーブルをワークブックにドラッグします。カラムが表示されますが、データテーブルは空です：

<Image size="md" img={tableau_workbook1} alt="CUSTOMERテーブルをキャンバスにドラッグしたTableauワークブック、カラムヘッダーは表示されているがデータはない" border />
<br/>

2. **今すぐ更新**ボタンをクリックすると、**CUSTOMER**から100行がテーブルに入ります。

3. **ORDERS**テーブルをワークブックにドラッグし、両方のテーブル間のリレーションシップフィールドを**Custkey**として設定します：

<Image size="md" img={tableau_workbook2} alt="CUSTOMERとORDERSテーブル間の接続をCustkeyフィールドを使用して表示しているTableauリレーションシップエディタ" border />
<br/>

4. **ORDERS**および**LINEITEM**テーブルがデータソースとして関連付けられたので、この関係を利用してデータに関する質問に答えることができます。ワークブックの下部で**シート1**タブを選択します。

<Image size="md" img={tableau_workbook3} alt="分析に利用可能なClickHouseテーブルの次元やメジャーを表示しているTableauワークシート" border />
<br/>

5. 特定のアイテムが毎年いくつ注文されたかを知りたいとします。**ORDERS**から**OrderDate**を**Columns**セクション（横のフィールド）にドラッグし、**LINEITEM**から**Quantity**を**Rows**にドラッグします。Tableauは以下の折れ線グラフを生成します：

<Image size="sm" img={tableau_workbook4} alt="ClickHouseデータから年ごとの注文数量を表示するTableau折れ線グラフ" border />
<br/>

あまり魅力的な折れ線グラフではありませんが、このデータセットはスクリプトによって生成され、クエリパフォーマンスをテストするために構築されたため、TPCDデータのシミュレートされた注文にはあまり変動がないことに注意してください。

6. 各四半期の平均注文額（ドル単位）を知りたいとします。また、配送モード（航空、郵便、船、トラックなど）についても：

    - **新しいワークシート**タブをクリックして新しいシートを作成します。
    - **ORDERS**から**OrderDate**を**Columns**にドラッグし、**Year**から**Quarter**に変更します。
    - **LINEITEM**から**Shipmode**を**Rows**にドラッグします。

以下のようになります：

<Image size="sm" img={tableau_workbook5} alt="四半期を列、配送モードを行としたTableauのクロス集計ビュー" border />
<br/>

7. **Abc**の値は、テーブルにメトリックをドラッグするまでのスペースを埋めているだけです。**ORDERS**から**Totalprice**をテーブルにドラッグします。デフォルトの計算が**Totalprices**の**SUM**であることに注意してください：

<Image size="md" img={tableau_workbook6} alt="四半期と配送モードごとの合計価格の合計を表示しているTableauのクロス集計" border />
<br/>

8. **SUM**をクリックし、**Measure**を**Average**に変更します。同じドロップダウンメニューから**Format**を選択し、**Numbers**を**通貨（標準）**に変更します：

<Image size="md" img={tableau_workbook7} alt="通貨フォーマット付きの四半期および配送モードごとの平均注文価格を表示しているTableauのクロス集計" border />
<br/>

素晴らしい！TableauをClickHouseに接続し、ClickHouseデータの分析と視覚化に向けた新たな可能性を開拓しました。

## コネクタを手動でインストールする {#install-the-connector-manually}

デフォルトでコネクタが含まれていない古いTableau Desktopバージョンを使用している場合は、次の手順に従って手動でインストールできます：

1. [Tableau Exchange](https://exchange.tableau.com/products/1064)から最新のtacoファイルをダウンロードします。
2. tacoファイルを以下の場所に置きます：
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Tableau Desktopを再起動します。設定が成功した場合は、`新しいデータソース`セクションにコネクタが表示されます。

## 接続と分析のヒント {#connection-and-analysis-tips}

Tableau-ClickHouse統合の最適化に関するさらなるガイダンスについては、[接続のヒント](/integrations/tableau/connection-tips)および[分析のヒント](/integrations/tableau/analysis-tips)をご覧ください。

## テスト {#tests}
コネクタは[TDVTフレームワーク](https://tableau.github.io/connector-plugin-sdk/docs/tdvt)でテストされており、現在97％のカバレッジ比率を維持しています。

## まとめ {#summary}
一般的なODBC/JDBC ClickHouseドライバを使用してTableauをClickHouseに接続できます。ただし、このコネクタは接続設定プロセスを簡素化します。コネクタに関して問題がある場合は、お気軽に<a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank">GitHub</a>でお問い合わせください。
