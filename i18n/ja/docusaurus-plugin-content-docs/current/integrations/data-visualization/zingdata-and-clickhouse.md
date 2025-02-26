---
sidebar_label: Zing Data
sidebar_position: 206
slug: /integrations/zingdata
keywords: [clickhouse, Zing Data, 接続, 統合, UI]
description: Zing Dataは、iOS、Androidおよびウェブ向けに作られたClickHouseのためのシンプルなソーシャルビジネスインテリジェンスです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Zing DataをClickHouseに接続する

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a>はデータ探索および視覚化プラットフォームです。Zing Dataは、ClickHouseが提供するJSドライバーを使用してClickHouseに接続します。

## 接続方法 {#how-to-connect}
1. 接続詳細を集めます。
<ConnectionDetails />

2. Zing Dataをダウンロードまたは訪問します。

    * モバイルでZing Dataを使用するには、[Google Playストア](https://play.google.com/store/apps/details?id=com.getzingdata.android)または[Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091)からZing Dataアプリをダウンロードします。
    
    * ウェブでZing Dataを使用するには、[Zingウェブコンソール](https://console.getzingdata.com/)を訪問し、アカウントを作成します。

3. データソースを追加します。

    * Zing DataでClickHouseデータと対話するには、**_データソース_**を定義する必要があります。Zing Dataのモバイルアプリメニューで**ソース**を選択し、次に**データソースを追加**をクリックします。

    * ウェブでデータソースを追加するには、上部メニューの**データソース**をクリックし、**新しいデータソース**をクリックしてドロップダウンメニューから**Clickhouse**を選択します。
    
      ![""](./images/zing_01.png)

4. 接続詳細を入力し、**接続を確認**をクリックします。

    ![](./images/zing_02.png)

5. 接続が成功すると、Zingはテーブル選択に進みます。必要なテーブルを選択し、**保存**をクリックします。Zingがデータソースに接続できない場合、資格情報を確認して再試行するように求めるメッセージが表示されます。資格情報を確認して再試行しても問題が解決しない場合は、<a id="contact_link" href="mailto:hello@getzingdata.com">こちらからZingサポートにお問い合わせください。</a>

    ![""](./images/zing_03.png)

6. Clickhouseデータソースが追加されると、あなたのZing組織のすべてのユーザーが**データソース** / **ソース**タブで利用できるようになります。

## Zing Dataでのチャートとダッシュボードの作成 {#creating-charts-and-dashboards-in-zing-data}

1. Clickhouseデータソースが追加されたら、ウェブ上で**Zingアプリ**をクリックするか、モバイル上でデータソースをクリックしてチャートの作成を開始します。

2. テーブルのリストからテーブルをクリックしてチャートを作成します。

  ![""](./images/zing_04.png)

3. ビジュアルクエリビルダーを使用して、必要なフィールド、集計などを選択し、**クエリを実行**をクリックします。

    ![""](./images/zing_05.png)

4. SQLに慣れている場合は、カスタムSQLを記述してクエリを実行し、チャートを作成することもできます。

    ![""](./images/zing_06.png)

    ![""](./images/zing_07.png)

5. 例のチャートは次のようになります。質問は三点リーダーメニューを使用して保存できます。チャートにコメントを付けたり、チームメンバーをタグ付けしたり、リアルタイムのアラートを作成したり、チャートの種類を変更したりできます。

    ![""](./images/zing_08.png)

6. ダッシュボードは、ホーム画面の**ダッシュボード**の下にある"+"アイコンを使用して作成できます。既存の質問はドラッグしてダッシュボードに表示できます。

    ![""](./images/zing_09.png)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseを使ったデータの視覚化 - Zing Data](https://getzingdata.com/blog/zing-adds-support-for-clickhouse-as-a-data-source/)
- [ドキュメント](https://docs.getzingdata.com/docs/)
- [クイックスタート](https://getzingdata.com/quickstart/)
- [ダッシュボードの作成に関するガイド](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)

