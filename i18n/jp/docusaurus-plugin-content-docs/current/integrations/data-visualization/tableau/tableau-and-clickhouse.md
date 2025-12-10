---
sidebar_label: 'Tableau Desktop'
sidebar_position: 1
slug: /integrations/tableau
keywords: ['clickhouse', 'tableau', 'connect', 'integrate', 'ui']
description: 'Tableau では ClickHouse のデータベースやテーブルをデータソースとして利用できます。'
title: 'Tableau を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc'
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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Tableau を ClickHouse に接続する {#connecting-tableau-to-clickhouse}

<ClickHouseSupportedBadge/>

ClickHouse は公式の Tableau コネクタを提供しており、
[Tableau Exchange](https://exchange.tableau.com/products/1064) に掲載されています。
このコネクタは、ClickHouse の高度な [JDBC ドライバー](/integrations/language-clients/java/jdbc) をベースとしています。

このコネクタを使用すると、Tableau から ClickHouse のデータベースやテーブルをデータソースとして利用できます。この機能を有効にするには、
以下のセットアップガイドに従ってください。

<TOCInline toc={toc}/>

## 利用開始前のセットアップ {#setup-required-prior-usage}

1. 接続情報を準備します
   <ConnectionDetails />

2. <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   Desktop</a> をダウンロードしてインストールします。
3. `clickhouse-tableau-connector-jdbc` の手順に従って、互換性のあるバージョンの
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC driver</a> をダウンロードします。

:::note
[clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases) JAR ファイルを必ずダウンロードしてください。このアーティファクトはバージョン `0.9.2` から利用可能です。
:::

4. JDBC ドライバーを、以下のフォルダーに配置します（OS に応じて、フォルダーが存在しない場合は作成してください）:
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. Tableau で ClickHouse のデータソースを設定し、データの可視化を開始します。

## Tableau で ClickHouse データソースを構成する {#configure-a-clickhouse-data-source-in-tableau}

`clickhouse-jdbc` ドライバーのインストールと設定が完了したので、ClickHouse の **TPCD** データベースに接続する
Tableau のデータソースをどのように定義するかを説明します。

1. Tableau を起動します。（すでに起動している場合は再起動してください。）

2. 左側メニューの **To a Server** セクションで **More** をクリックします。利用可能なコネクタ一覧で **ClickHouse by ClickHouse** を検索します:

<Image size="md" img={tableau_connecttoserver} alt="ClickHouse by ClickHouse オプションがハイライトされたコネクタ選択メニューを表示している Tableau の接続画面" border />
<br/>

:::note
コネクタ一覧に **ClickHouse by ClickHouse** が見つからない場合は、古いバージョンの Tableau Desktop を使用している可能性があります。
その場合は、Tableau Desktop アプリケーションのアップグレードを検討するか、[コネクタを手動でインストール](#install-the-connector-manually)してください。
:::

3. **ClickHouse by ClickHouse** をクリックすると、次のダイアログが表示されます:

<Image size="md" img={tableau_connector_details} alt="ClickHouse JDBC コネクタの詳細とインストールボタンを表示している Tableau のコネクタインストールダイアログ" border />
<br/>
 
4. **Install and Restart Tableau** をクリックします。アプリケーションを再起動します。
5. 再起動後、コネクタは `ClickHouse JDBC by ClickHouse, Inc.` という完全な名前で表示されます。これをクリックすると、次のダイアログが表示されます:

<Image size="md" img={tableau_connector_dialog} alt="サーバー、ポート、データベース、ユーザー名、パスワードのフィールドが表示されている Tableau の ClickHouse 接続ダイアログ" border />
<br/>

6. 接続情報を入力します:

    | Setting  | Value                                                  |
    | ----------- |--------------------------------------------------------|
    | Server      | **プレフィックスやサフィックスを付けない ClickHouse ホスト名** |
    | Port   | **8443**                                               |
    | Database | **default**                                            |
    | Username | **default**                                            |
    | Password | *\*****                                                |

:::note
ClickHouse Cloud を利用する場合は、安全な接続のために SSL のチェックボックスを有効にする必要があります。
:::
<br/>

:::note
今回の ClickHouse データベース名は **TPCD** ですが、上のダイアログでは **Database** を **default** に設定し、その次のステップで
**Schema** に **TPCD** を選択する必要があります。（これはコネクタ側のバグによるものと思われ、この動作は将来的に変更される可能性がありますが、
現時点ではデータベースとして **default** を使用する必要があります。）
:::

7. **Sign In** ボタンをクリックすると、新しい Tableau ワークブックが表示されます:

<Image size="md" img={tableau_newworkbook} alt="データベース選択オプションを含む初期接続画面を表示している新しい Tableau ワークブック" border />
<br/>

8. **Schema** のドロップダウンから **TPCD** を選択すると、**TPCD** 内のテーブル一覧が表示されます:

<Image size="md" img={tableau_tpcdschema} alt="CUSTOMER、LINEITEM、NATION、ORDERS などを含む TPCD データベーステーブルを表示している Tableau のスキーマ選択画面" border />
<br/>

これで Tableau で可視化を作成する準備が整いました。

## Tableau での可視化の作成 {#building-visualizations-in-tableau}

Tableau で ClickHouse のデータソースを構成できたので、さっそくデータを可視化してみましょう。

1. **CUSTOMER** テーブルをワークブック上にドラッグします。列は表示されますが、データテーブルは空であることが分かります:

<Image size="md" img={tableau_workbook1} alt="CUSTOMER テーブルをキャンバスにドラッグし、列ヘッダーのみが表示されていてデータが空の Tableau ワークブック" border />
<br/>

2. **Update Now** ボタンをクリックすると、**CUSTOMER** から 100 行がテーブルに読み込まれます。

3. **ORDERS** テーブルをワークブックにドラッグし、2 つのテーブル間のリレーションシップフィールドとして **Custkey** を設定します:

<Image size="md" img={tableau_workbook2} alt="Custkey フィールドを使って CUSTOMER テーブルと ORDERS テーブルを関連付けている Tableau のリレーションシップエディター" border />
<br/>

4. これで、データソースとして **ORDERS** と **LINEITEM** テーブルが互いに関連付けられました。このリレーションシップを利用して、
   データに関するさまざまな問いに答えることができます。ワークブック下部の **Sheet 1** タブを選択します。

<Image size="md" img={tableau_workbook3} alt="分析に利用可能な ClickHouse テーブルのディメンションとメジャーが表示されている Tableau のワークシート" border />
<br/>

5. たとえば、特定のアイテムが各年にどれだけ注文されたかを知りたいとします。**ORDERS** の **OrderDate** を
   **Columns** セクション（横方向のフィールド）にドラッグし、**LINEITEM** の **Quantity** を **Rows** にドラッグします。Tableau は
   次のような折れ線グラフを生成します:

<Image size="sm" img={tableau_workbook4} alt="ClickHouse データから年別の注文数量を示す Tableau の折れ線グラフ" border />
<br/>

あまり面白い折れ線グラフではありませんが、このデータセットはスクリプトによって生成され、クエリのパフォーマンステスト用に構築されているため、
TCPD データのシミュレートされた注文には大きな変動がないことに気付くでしょう。

6. 次に、四半期ごとの平均注文額（ドル）を、配送モード（航空、郵便、船舶、トラックなど）ごとにも知りたいとします。

    - **New Worksheet** タブをクリックして新しいシートを作成します
    - **ORDERS** の **OrderDate** を **Columns** にドラッグし、**Year** から **Quarter** に変更します
    - **LINEITEM** の **Shipmode** を **Rows** にドラッグします

次のように表示されるはずです:

<Image size="sm" img={tableau_workbook5} alt="列に四半期、行に配送モードが表示された Tableau のクロス集計ビュー" border />
<br/>

7. **Abc** の値は、テーブルにメトリクスをドラッグするまでの空きスペースを埋めるプレースホルダーです。**ORDERS** の **Totalprice** をテーブル上にドラッグします。
   デフォルトの集計は **Totalprices** の **SUM**（合計）になっていることに注意してください:

<Image size="md" img={tableau_workbook6} alt="四半期と配送モードごとの合計注文金額が表示された Tableau のクロス集計" border />
<br/>

8. **SUM** をクリックし、**Measure** を **Average** に変更します。同じドロップダウンメニューから **Format** を選択し、
   **Numbers** を **Currency (Standard)** に変更します:

<Image size="md" img={tableau_workbook7} alt="四半期と配送モードごとの平均注文金額が通貨形式で表示された Tableau のクロス集計" border />
<br/>

これで完了です。Tableau を ClickHouse に正常に接続できました。これにより、ClickHouse データを分析および可視化するための
可能性が大きく広がりました。

## コネクタを手動でインストールする {#install-the-connector-manually}

デフォルトでコネクタが含まれていない古いバージョンの Tableau Desktop を使用している場合は、次の手順で手動インストールできます。

1. [Tableau Exchange](https://exchange.tableau.com/products/1064) から最新の taco ファイルをダウンロードします。
2. taco ファイルを次の場所に配置します。
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Tableau Desktop を再起動します。インストールが正常に完了していれば、「New Data Source」セクションにコネクタが表示されます。

## 接続と分析に関するヒント {#connection-and-analysis-tips}

Tableau と ClickHouse の統合を最適化するための、より詳しい説明やベストプラクティスについては、[接続のヒント](/integrations/tableau/connection-tips) および [分析のヒント](/integrations/tableau/analysis-tips) を参照してください。

## テスト {#tests}
このコネクタは [TDVT フレームワーク](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) でテストされており、現在テストカバレッジ 97% を維持しています。

## 概要 {#summary}
Tableau を ClickHouse に接続するには、汎用の ODBC/JDBC 用 ClickHouse ドライバーを使用できます。ただし、このコネクターを使用すると、接続設定の手順を簡略化できます。コネクターに関して問題が発生した場合は、<a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a> でお気軽にお問い合わせください。
