---
sidebar_label: 'Zing Data'
sidebar_position: 206
slug: /integrations/zingdata
keywords: ['clickhouse', 'Zing Data', '接続', '統合', 'ui']
description: 'Zing Dataは、iOS、AndroidおよびWeb用に設計されたClickHouseのためのシンプルなソーシャルビジネスインテリジェンスです。'
title: 'Zing DataをClickHouseに接続する'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import zing_01 from '@site/static/images/integrations/data-visualization/zing_01.png';
import zing_02 from '@site/static/images/integrations/data-visualization/zing_02.png';
import zing_03 from '@site/static/images/integrations/data-visualization/zing_03.png';
import zing_04 from '@site/static/images/integrations/data-visualization/zing_04.png';
import zing_05 from '@site/static/images/integrations/data-visualization/zing_05.png';
import zing_06 from '@site/static/images/integrations/data-visualization/zing_06.png';
import zing_07 from '@site/static/images/integrations/data-visualization/zing_07.png';
import zing_08 from '@site/static/images/integrations/data-visualization/zing_08.png';
import zing_09 from '@site/static/images/integrations/data-visualization/zing_09.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Zing DataをClickHouseに接続する

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a>はデータ探索および視覚化プラットフォームです。Zing Dataは、ClickHouseが提供するJSドライバーを使ってClickHouseに接続します。

## 接続方法 {#how-to-connect}
1. 接続詳細を収集します。
<ConnectionDetails />

2. Zing Dataをダウンロードまたは訪問します。

    * モバイルでZing Dataを使うには、[Google Play ストア](https://play.google.com/store/apps/details?id=com.getzingdata.android)または[Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091)からZing Dataアプリをダウンロードします。

    * WebでZing Dataを使うには、[Zing Webコンソール](https://console.getzingdata.com/)にアクセスしてアカウントを作成します。

3. データソースを追加します。

    * Zing DataでClickHouseデータとやり取りするには、**_データソース_**を定義する必要があります。Zing Dataのモバイルアプリメニューで、**ソース**を選択し、次に**データソースを追加**をクリックします。

    * Webでデータソースを追加するには、上部メニューの**データソース**をクリックし、**新しいデータソース**をクリックしてドロップダウンメニューから**Clickhouse**を選択します。

    <Image size="md" img={zing_01} alt="Zing Dataインターフェイスで新しいデータソースボタンとドロップダウンメニューにクリックハウスオプションが表示されている" border />
    <br/>

4. 接続詳細を入力し、**接続チェック**をクリックします。

    <Image size="md" img={zing_02} alt="ClickHouse接続設定フォームでサーバー、ポート、データベース、ユーザー名、パスワードのフィールドが表示されている" border />
    <br/>

5. 接続が成功した場合、Zingはテーブル選択に進みます。必要なテーブルを選択し、**保存**をクリックします。Zingがデータソースに接続できない場合、資格情報を確認して再試行するように求めるメッセージが表示されます。資格情報を確認して再試行しても問題が解決しない場合は、<a id="contact_link" href="mailto:hello@getzingdata.com">ここでZingサポートに連絡してください。</a>

    <Image size="md" img={zing_03} alt="Zing Dataテーブル選択インターフェイスで利用可能なClickHouseテーブルがチェックボックスと共に表示されている" border />
    <br/>

6. Clickhouseデータソースが追加されたら、Zingの**データソース** / **ソース**タブの下で全員が利用可能になります。

## Zing Dataでのチャートとダッシュボードの作成 {#creating-charts-and-dashboards-in-zing-data}

1. Clickhouseデータソースが追加されたら、Webで**Zingアプリ**をクリックするか、モバイルでデータソースをクリックしてチャートの作成を開始します。

2. チャートを作成するには、テーブルリストの下にあるテーブルをクリックします。

    <Image size="sm" img={zing_04} alt="Zing Dataインターフェイスで利用可能なClickHouseテーブルのリストが表示されている" border />
    <br/>

3. ビジュアルクエリビルダーを使用して、希望のフィールド、集約などを選択し、**質問を実行**をクリックします。

    <Image size="md" img={zing_05} alt="Zing Dataビジュアルクエリビルダーインターフェイスでフィールド選択および集約オプションが表示されている" border />
    <br/>

4. SQLに慣れている場合は、カスタムSQLを書いてクエリを実行し、チャートを作成することもできます。

    <Image size="md" img={zing_06} alt="Zing DataのSQLエディタモードでSQLクエリ作成インターフェイスが表示されている" border />
    <Image size="md" img={zing_07} alt="Zing DataでのSQLクエリ結果が表形式で表示されている" border />

5. チャートの例は次のようになります。質問は三点リーダーメニューを使って保存できます。チャートにコメントを追加したり、チームメンバーにタグを付けたり、リアルタイムアラートを作成したり、チャートタイプを変更したりできます。

    <Image size="md" img={zing_08} alt="Zing DataにおけるClickHouseデータのチャート視覚化の例で、オプションメニューが表示されている" border />
    <br/>

6. ダッシュボードは、ホーム画面の**ダッシュボード**の下にある"+"アイコンを使って作成できます。既存の質問をダッシュボードに表示するためにドラッグインできます。

    <Image size="md" img={zing_09} alt="Zing Dataダッシュボードビューで複数の視覚化がダッシュボードレイアウトで表示されている" border />
    <br/>

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでのデータ視覚化 - Zing Data](https://getzingdata.com/blog/zing-adds-support-for-clickhouse-as-a-data-source/)
- [ドキュメンテーション](https://docs.getzingdata.com/docs/)
- [クイックスタート](https://getzingdata.com/quickstart/)
- ダッシュボードの作成ガイド: [ダッシュボードの作成](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
