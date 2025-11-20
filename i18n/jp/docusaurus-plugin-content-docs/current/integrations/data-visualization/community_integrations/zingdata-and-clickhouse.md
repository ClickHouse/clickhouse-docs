---
sidebar_label: 'Zing Data'
sidebar_position: 206
slug: /integrations/zingdata
keywords: ['Zing Data']
description: 'Zing Data は、iOS、Android、および Web 向けに提供される、ClickHouse 用のシンプルでソーシャルなビジネスインテリジェンスツールです。'
title: 'Zing Data を ClickHouse に接続する'
show_related_blogs: true
doc_type: 'guide'
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


# Zing Data を ClickHouse に接続する

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> は、データ探索および可視化のためのプラットフォームです。Zing Data は、ClickHouse が提供する JS ドライバーを使用して ClickHouse に接続します。



## 接続方法 {#how-to-connect}

1. 接続情報を収集します。

   <ConnectionDetails />

2. Zing Dataをダウンロードまたはアクセスする
   - モバイルでClickHouseとZing Dataを使用するには、[Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android)または[Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091)からZing Dataアプリをダウンロードしてください。

   - WebでClickHouseとZing Dataを使用するには、[Zing Webコンソール](https://console.getzingdata.com/)にアクセスしてアカウントを作成してください。

3. データソースを追加する
   - Zing DataでClickHouseデータを操作するには、**_データソース_**を定義する必要があります。Zing Dataのモバイルアプリメニューで**Sources**を選択し、**Add a Datasource**をクリックしてください。

   - Webでデータソースを追加するには、上部メニューの**Data Sources**をクリックし、**New Datasource**をクリックして、ドロップダウンメニューから**Clickhouse**を選択してください

   <Image
     size='md'
     img={zing_01}
     alt='New DatasourceボタンとドロップダウンメニューのClickHouseオプションを表示するZing Dataインターフェース'
     border
   />
   <br />

4. 接続情報を入力し、**Check Connection**をクリックします。

   <Image
     size='md'
     img={zing_02}
     alt='サーバー、ポート、データベース、ユーザー名、パスワードのフィールドを含むZing DataのClickHouse接続設定フォーム'
     border
   />
   <br />

5. 接続が成功すると、Zingはテーブル選択画面に進みます。必要なテーブルを選択し、**Save**をクリックしてください。Zingがデータソースに接続できない場合は、認証情報を確認して再試行するよう求めるメッセージが表示されます。認証情報を確認して再試行しても問題が解決しない場合は、<a id="contact_link" href="mailto:hello@getzingdata.com">こちらからZingサポートにお問い合わせください。</a>

   <Image
     size='md'
     img={zing_03}
     alt='チェックボックス付きで利用可能なClickHouseテーブルを表示するZing Dataテーブル選択インターフェース'
     border
   />
   <br />

6. ClickHouseデータソースが追加されると、**Data Sources** / **Sources**タブの下で、Zing組織内のすべてのユーザーが利用できるようになります。


## Zing Dataでチャートとダッシュボードを作成する {#creating-charts-and-dashboards-in-zing-data}

1. ClickHouseデータソースを追加した後、Webで**Zing App**をクリックするか、モバイルでデータソースをクリックしてチャートの作成を開始します。

2. テーブルリストからテーブルをクリックしてチャートを作成します。

   <Image
     size='sm'
     img={zing_04}
     alt='利用可能なClickHouseテーブルを含むテーブルリストを表示するZing Dataインターフェース'
     border
   />
   <br />

3. ビジュアルクエリビルダーを使用して、必要なフィールドや集計などを選択し、**Run Question**をクリックします。

   <Image
     size='md'
     img={zing_05}
     alt='フィールド選択と集計オプションを備えたZing Dataビジュアルクエリビルダーインターフェース'
     border
   />
   <br />

4. SQLに精通している場合は、カスタムSQLを記述してクエリを実行し、チャートを作成することもできます。

   <Image
     size='md'
     img={zing_06}
     alt='SQLクエリ記述インターフェースを表示するZing DataのSQLエディターモード'
     border
   />
   <Image
     size='md'
     img={zing_07}
     alt='表形式でデータが表示されたZing DataのSQLクエリ結果'
     border
   />

5. チャートの例は以下のようになります。質問は3点メニューを使用して保存できます。チャートにコメントを付けたり、チームメンバーをタグ付けしたり、リアルタイムアラートを作成したり、チャートタイプを変更したりできます。

   <Image
     size='md'
     img={zing_08}
     alt='オプションメニュー付きでClickHouseからのデータを表示するZing Dataのチャート可視化例'
     border
   />
   <br />

6. ダッシュボードは、ホーム画面の**Dashboards**の下にある「+」アイコンを使用して作成できます。既存の質問をドラッグしてダッシュボードに表示できます。

   <Image
     size='md'
     img={zing_09}
     alt='ダッシュボードレイアウトに配置された複数の可視化を表示するZing Dataダッシュボードビュー'
     border
   />
   <br />


## 関連コンテンツ {#related-content}

- [ドキュメント](https://docs.getzingdata.com/docs/)
- [クイックスタート](https://getzingdata.com/quickstart/)
- [ダッシュボードの作成](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)ガイド
