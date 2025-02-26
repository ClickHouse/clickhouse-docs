---
sidebar_label: Tableau Desktop
sidebar_position: 1
slug: /integrations/tableau
keywords: [clickhouse, tableau, connect, integrate, ui]
description: TableauはClickHouseのデータベースとテーブルをデータソースとして使用できます。
---
import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# TableauをClickHouseに接続する

ClickHouseは公式のTableauコネクタを提供しており、[Tableau Exchange](https://exchange.tableau.com/products/1064)で紹介されています。このコネクタはClickHouseの高度な[JDBCドライバ](/integrations/java/jdbc-driver)を基にしています。

このコネクタを使用すると、TableauはClickHouseのデータベースとテーブルをデータソースとして統合します。この機能を有効にするには、以下のセットアップガイドに従ってください。

<TOCInline toc={toc}/>

## 使用前に必要な設定 {#setup-required-prior-usage}

1. 接続詳細を収集する
   <ConnectionDetails />

2. <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau Desktop</a>をダウンロードしてインストールします。
3. `clickhouse-tableau-connector-jdbc`の指示に従って、互換性のある<a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBCドライバ</a>のバージョンをダウンロードします。

:::note
**clickhouse-jdbc-x.x.x-shaded-all.jar**のJARファイルをダウンロードすることを確認してください。現在は`0.8.X`のバージョンを使用することをお勧めしています。
:::

4. JDBCドライバを以下のフォルダーに保存します（OSによって異なります。フォルダーが存在しない場合は作成できます）：
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. TableauでClickHouseデータソースを設定し、データビジュアライゼーションの作成を開始してください！

## TableauでClickHouseデータソースを設定する {#configure-a-clickhouse-data-source-in-tableau}

`clickhouse-jdbc`ドライバをインストールして設定したので、ClickHouseの**TPCD**データベースに接続するデータソースをTableauで定義する方法を見てみましょう。

1. Tableauを起動します。（すでに起動している場合は、再起動してください。）

2. 左側のメニューから、**To a Server**セクションの下にある**More**をクリックします。利用可能なコネクタのリストから**ClickHouse by ClickHouse**を検索します：

   ![ClickHouse JDBC](../images/tableau_connecttoserver.png)
<br/>

:::note
コネクタのリストに**ClickHouse by ClickHouse**が表示されませんか？これは古いTableau Desktopのバージョンに関連している可能性があります。それを解決するために、Tableau Desktopアプリケーションをアップグレードするか、[手動でコネクタをインストール](#install-the-connector-manually)してください。
:::

3. **ClickHouse by ClickHouse**をクリックすると、以下のダイアログが表示されます：

   ![ClickHouse JDBC Connector Details](../images/tableau_connector_details.png)

4. **Install and Restart Tableau**をクリックします。アプリケーションを再起動します。
5. 再起動後、コネクタの正式名称は`ClickHouse JDBC by ClickHouse, Inc.`になります。クリックすると、以下のダイアログが表示されます：

   ![ClickHouse JDBC Connector Details Details](../images/tableau_connector_dialog.png)

6. 接続詳細を入力します：

    | 設定        | 値                                                   |
    | ----------- |-----------------------------------------------------|
    | サーバー    | **あなたのClickHouseホスト（プレフィックスやサフィックスなし）** |
    | ポート      | **8443**                                           |
    | データベース| **default**                                        |
    | ユーザー名  | **default**                                        |
    | パスワード  | *\*****                                            |

:::note
ClickHouseクラウドを使用している場合、安全な接続のためにSSLチェックボックスを有効にすることが必要です。
:::
<br/>

:::note
私たちのClickHouseデータベースは**TPCD**と呼ばれていますが、上のダイアログでは**データベース**を**default**に設定し、次のステップで**スキーマ**として**TPCD**を選択する必要があります。（これはコネクタのバグによるものと思われるため、この動作は今後変更される可能性がありますが、現時点ではデータベースに**default**を使用する必要があります。）
:::

7. **Sign In**ボタンをクリックすると、新しいTableauワークブックが表示されます：

   !["New Workbook"](../images/tableau_newworkbook.png)

8. **Schema**のドロップダウンから**TPCD**を選択すると、**TPCD**内のテーブルのリストが表示されます：

   !["Select TPCD for the Schema"](../images/tableau_tpcdschema.png)

これで、Tableauでビジュアライゼーションを構築する準備が整いました！

## Tableauでビジュアライゼーションを作成する {#building-visualizations-in-tableau}

ClickHouseデータソースがTableauに設定されたので、データを視覚化してみましょう...

1. **CUSTOMER**テーブルをワークブックにドラッグします。カラムは表示されますが、データテーブルは空であることに注意してください：

   ![""](../images/tableau_workbook1.png)

2. **Update Now**ボタンをクリックすると、**CUSTOMER**から100行がテーブルに表示されます。

3. **ORDERS**テーブルをワークブックにドラッグし、2つのテーブルの間のリレーションシップフィールドとして**Custkey**を設定します：

   ![""](../images/tableau_workbook2.png)

4. これで、**ORDERS**テーブルと**LINEITEM**テーブルがデータソースとして互いに関連付けられ、データに関する質問に答えるためにこの関係を利用できます。ワークブックの下部にある**Sheet 1**タブを選択します。

   ![""](../images/tableau_workbook3.png)

5. 特定のアイテムが毎年いくつ注文されたかを知りたいとしましょう。**ORDERS**から**OrderDate**を**Columns**セクション（横のフィールド）にドラッグし、**LINEITEM**から**Quantity**を**Rows**にドラッグします。Tableauは以下の折れ線グラフを生成します：

   ![""](../images/tableau_workbook4.png)

あまり面白くない折れ線グラフですが、このデータセットはスクリプトで生成され、クエリパフォーマンスのテスト用に構築されたため、TCPDデータのシミュレートされた注文にはそれほどの変動がないことに注意してください。

6. 四半期ごとの平均注文額（ドル）を知りたく、出荷モード（航空便、郵便、船、トラックなど）ごとに知りたいとしましょう：

    - **New Worksheet**タブをクリックして新しいシートを作成します
    - **ORDERS**から**OrderDate**を**Columns**にドラッグし、**Year**から**Quarter**に変更します
    - **LINEITEM**から**Shipmode**を**Rows**にドラッグします

以下のように表示されるはずです：

![""](../images/tableau_workbook5.png)

7. **Abc**の値は、テーブルにメトリクスをドラッグするまで空占めしています。**ORDERS**から**Totalprice**をテーブルにドラッグします。デフォルトの計算は**Totalprices**を**SUM**することです：

   ![""](../images/tableau_workbook6.png)

8. **SUM**をクリックして、**Measure**を**Average**に変更します。同じドロップダウンメニューから**Format**を選択し、**Numbers**を**Currency (Standard)**に変更します：

   ![""](../images/tableau_workbook7.png)

お疲れ様です！あなたは無事にTableauをClickHouseに接続し、ClickHouseデータの分析と視覚化のための数多くの可能性を広げました。

## コネクタを手動でインストールする {#install-the-connector-manually}

デフォルトでコネクタが含まれていない古いTableau Desktopバージョンを使用している場合は、以下の手順に従って手動でインストールできます：

1. [Tableau Exchange](https://exchange.tableau.com/products/1064)から最新のtacoファイルをダウンロードします。
2. tacoファイルを次の場所に置きます：
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Tableau Desktopを再起動します。セットアップが成功した場合、`New Data Source`セクションの下にコネクタが設定されます。

## 接続と分析のヒント {#connection-and-analysis-tips}

Tableau-ClickHouse統合を最適化するための詳細は、[接続のヒント](/integrations/tableau/connection-tips)および[分析のヒント](/integrations/tableau/analysis-tips)をご覧ください。


## テスト {#tests}
このコネクタは[TDVT framework](https://tableau.github.io/connector-plugin-sdk/docs/tdvt)でテストされており、現在97%のカバレッジ割合を維持しています。


## まとめ {#summary}
TableauをClickHouseに接続するには、汎用のODBC/JDBC ClickHouseドライバを使用できます。ただし、このコネクタは接続設定プロセスをスムーズにします。コネクタに問題がある場合は、<a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank">GitHub</a>でお気軽にお問い合わせください。
