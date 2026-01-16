---
sidebar_label: 'Zing Data'
sidebar_position: 206
slug: /integrations/zingdata
keywords: ['Zing Data']
description: 'Zing Data は ClickHouse 向けのシンプルなソーシャル型ビジネスインテリジェンスで、iOS、Android および Web 向けに提供されています。'
title: 'Zing Data を ClickHouse と接続する'
show_related_blogs: true
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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

# Zing Data を ClickHouse に接続する \\{#connect-zing-data-to-clickhouse\\}

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> は、データ探索および可視化のためのプラットフォームです。Zing Data は、ClickHouse が提供する JS ドライバーを使用して ClickHouse に接続します。

## 接続方法 \\{#how-to-connect\\}

1. 接続情報を収集します。

<ConnectionDetails />

2. Zing Data をダウンロードまたは利用します

    * モバイルで ClickHouse を Zing Data と一緒に使用するには、[Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) または [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091) から Zing Data アプリをダウンロードします。

    * Web で ClickHouse を Zing Data と一緒に使用するには、[Zing web console](https://console.getzingdata.com/) にアクセスしてアカウントを作成します。

3. データソースを追加します

    * Zing Data で ClickHouse のデータを操作するには、**_データソース_** を定義する必要があります。Zing Data モバイルアプリのメニューで **Sources** を選択し、**Add a Datasource** をクリックします。

    * Web でデータソースを追加するには、上部メニューの **Data Sources** をクリックし、**New Datasource** をクリックして、ドロップダウンメニューから **ClickHouse** を選択します。

    <Image size="md" img={zing_01} alt="Zing Data のインターフェースで、New Datasource ボタンとドロップダウンメニュー内の ClickHouse オプションが表示されている画面" border />
    <br/>

4. 接続情報を入力し、**Check Connection** をクリックします。

    <Image size="md" img={zing_02} alt="Zing Data における ClickHouse 接続設定フォーム。server、port、database、username、password の各フィールドが表示されている画面" border />
    <br/>

5. 接続が成功すると、Zing はテーブル選択画面に進みます。必要なテーブルを選択し、**Save** をクリックします。Zing がデータソースに接続できない場合は、認証情報を確認して再試行するよう求めるメッセージが表示されます。認証情報を確認して再試行しても問題が解決しない場合は、<a id="contact_link" href="mailto:hello@getzingdata.com">こちらから Zing サポートにお問い合わせください。</a>

    <Image size="md" img={zing_03} alt="Zing Data のテーブル選択インターフェース。利用可能な ClickHouse テーブルがチェックボックス付きで表示されている画面" border />
    <br/>

6. ClickHouse データソースが追加されると、Zing の組織内の全ユーザーが **Data Sources** / **Sources** タブから利用できるようになります。

## Zing Data でチャートとダッシュボードを作成する \\{#creating-charts-and-dashboards-in-zing-data\\}

1. ClickHouse データソースを追加したら、Web では **Zing App** をクリックし、モバイルではそのデータソースをタップしてチャートの作成を開始します。

2. テーブル一覧の中からテーブルをクリックして、チャートを作成します。

    <Image size="sm" img={zing_04} alt="利用可能な ClickHouse テーブルを含むテーブル一覧が表示された Zing Data のインターフェイス" border />
    <br/>

3. ビジュアルクエリビルダーを使用して、必要なフィールドや集計などを選択し、**Run Question** をクリックします。

    <Image size="md" img={zing_05} alt="フィールド選択と集計オプションを備えた Zing Data のビジュアルクエリビルダーインターフェイス" border />
    <br/>

4. SQL に慣れている場合は、カスタム SQL を記述してクエリを実行し、チャートを作成することもできます。

    <Image size="md" img={zing_06} alt="SQL クエリ作成インターフェイスが表示された Zing Data の SQL エディターモード" border />
    <Image size="md" img={zing_07} alt="Zing Data で SQL クエリの結果が表形式のデータとして表示されている画面" border />

5. チャートの例は次のようになります。三点リーダーのメニューからこの Question（クエリ）を保存できます。チャートにコメントを追加したり、チームメンバーをタグ付けしたり、リアルタイムアラートを作成したり、チャートタイプを変更したりできます。

    <Image size="md" img={zing_08} alt="ClickHouse のデータとオプションメニューが表示された、Zing Data におけるチャート可視化の例" border />
    <br/>

6. ダッシュボードは、ホーム画面の **Dashboards** の下にある「+」アイコンから作成できます。既存の Question をドラッグして、ダッシュボード上に配置できます。

    <Image size="md" img={zing_09} alt="複数の可視化がダッシュボードレイアウトに配置された Zing Data のダッシュボードビュー" border />
    <br/>

## 関連コンテンツ \\{#related-content\\}

- [ドキュメント](https://docs.getzingdata.com/docs/)
- [クイックスタート](https://getzingdata.com/quickstart/)
- [ダッシュボード作成ガイド](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)