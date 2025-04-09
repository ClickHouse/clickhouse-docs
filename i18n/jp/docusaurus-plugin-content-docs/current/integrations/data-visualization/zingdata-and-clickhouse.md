---
sidebar_label: Zing Data
sidebar_position: 206
slug: /integrations/zingdata
keywords: [clickhouse, Zing Data, connect, integrate, ui]
description: Zing Dataは、iOS、Android、Web用に作られたClickHouseのシンプルなソーシャルビジネスインテリジェンスです。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import zing_01 from '@site/static/images/integrations/data-visualization/zing_01.png';
import zing_02 from '@site/static/images/integrations/data-visualization/zing_02.png';
import zing_03 from '@site/static/images/integrations/data-visualization/zing_03.png';
import zing_04 from '@site/static/images/integrations/data-visualization/zing_04.png';
import zing_05 from '@site/static/images/integrations/data-visualization/zing_05.png';
import zing_06 from '@site/static/images/integrations/data-visualization/zing_06.png';
import zing_07 from '@site/static/images/integrations/data-visualization/zing_07.png';
import zing_08 from '@site/static/images/integrations/data-visualization/zing_08.png';
import zing_09 from '@site/static/images/integrations/data-visualization/zing_09.png';


# Zing DataをClickHouseに接続する

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a>は、データ探索と可視化のプラットフォームです。Zing Dataは、ClickHouseが提供するJSドライバーを使用してClickHouseに接続します。

## 接続方法 {#how-to-connect}
1. 接続情報を収集します。
<ConnectionDetails />

2. Zing Dataをダウンロードするか、訪問します。

    * モバイルでZing Dataを使用するには、[Google Play ストア](https://play.google.com/store/apps/details?id=com.getzingdata.android)または[Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091)からZing Dataアプリをダウンロードしてください。

    * WebでZing Dataを使用するには、[Zingウェブコンソール](https://console.getzingdata.com/)にアクセスしてアカウントを作成してください。

3. データソースを追加します。

    * Zing DataでClickHouseデータと対話するには、**_datasource_**を定義する必要があります。Zing Dataのモバイルアプリメニューで**Sources**を選択し、次に**Add a Datasource**をクリックします。

    * Webでデータソースを追加するには、上部メニューの**Data Sources**をクリックし、**New Datasource**をクリックしてドロップダウンメニューから**Clickhouse**を選択します。

    <img src={zing_01} alt="Zing 01"/>
    <br/>

4. 接続情報を入力し、**Check Connection**をクリックします。

    <img src={zing_02} alt="Zing 02"/>
    <br/>

5. 接続が成功すると、Zingはテーブル選択に進みます。必要なテーブルを選択し、**Save**をクリックします。Zingがデータソースに接続できない場合は、資格情報を確認して再試行するように促すメッセージが表示されます。資格情報を確認して再試行してもまだ問題がある場合は、<a id="contact_link" href="mailto:hello@getzingdata.com">こちらでZingサポートに連絡してください。</a>

    <img src={zing_03} alt="Zing 03"/>
    <br/>

6. Clickhouseデータソースが追加されると、あなたのZing組織のすべてのメンバーが**Data Sources** / **Sources**タブで利用できるようになります。

## Zing Dataでのチャートとダッシュボードの作成 {#creating-charts-and-dashboards-in-zing-data}

1. Clickhouseデータソースが追加されたら、Webで**Zing App**をクリックするか、モバイルでデータソースをクリックしてチャートの作成を開始します。

2. チャートを作成するには、テーブルリストの下のテーブルをクリックします。

    <img src={zing_04} alt="Zing 04"/>
    <br/>

3. ビジュアルクエリビルダーを使用して、必要なフィールド、集計などを選択し、**Run Question**をクリックします。

    <img src={zing_05} alt="Zing 05"/>
    <br/>

4. SQLに慣れている場合は、カスタムSQLを記述してクエリを実行し、チャートを作成することもできます。

    <img src={zing_06} alt="Zing 06"/>
    <img src={zing_07} alt="Zing 07"/>

5. サンプルチャートは以下のようになります。質問は三点リーダーメニューを使用して保存できます。チャートにコメントを追加したり、チームメンバーをタグ付けしたり、リアルタイムアラートを作成したり、チャートタイプを変更したりできます。

    <img src={zing_08} alt="Zing 08"/>
    <br/>

6. ダッシュボードは、ホーム画面の**Dashboards**の下にある"+"アイコンを使用して作成できます。既存の質問をドラッグしてダッシュボードに表示できます。

    <img src={zing_09} alt="Zing 09"/>
    <br/>

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseを使用したデータの可視化 - Zing Data](https://getzingdata.com/blog/zing-adds-support-for-clickhouse-as-a-data-source/)
- [ドキュメント](https://docs.getzingdata.com/docs/)
- [クイックスタート](https://getzingdata.com/quickstart/)
- ダッシュボードの作成に関するガイド [Create Dashboards](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
