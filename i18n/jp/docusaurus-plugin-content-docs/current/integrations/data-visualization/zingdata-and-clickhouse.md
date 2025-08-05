---
sidebar_label: 'Zing Data'
sidebar_position: 206
slug: '/integrations/zingdata'
keywords:
- 'clickhouse'
- 'Zing Data'
- 'connect'
- 'integrate'
- 'ui'
description: 'Zing Dataは、iOS、Android、およびWeb用に作成された、ClickHouse向けのシンプルなソーシャルビジネスインテリジェンスです。'
title: 'Zing DataをClickHouseに接続する'
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


# Connect Zing Data to ClickHouse

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> は、データ探索と視覚化のプラットフォームです。Zing Data は、ClickHouse が提供する JS ドライバーを使用して ClickHouse に接続します。

## How to connect {#how-to-connect}
1. 接続詳細を収集します。
<ConnectionDetails />

2. Zing Data をダウンロードまたは訪問します。

    * モバイルで Zing Data を使用して Clickhouse を利用するには、[Google Play ストア](https://play.google.com/store/apps/details?id=com.getzingdata.android) または [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091) から Zing Data アプリをダウンロードしてください。

    * ウェブで Zing Data を使用して Clickhouse を利用するには、[Zing ウェブコンソール](https://console.getzingdata.com/) にアクセスしてアカウントを作成します。

3. データソースを追加します。

    * Zing Data で ClickHouse データに対話するには、**_データソース_** を定義する必要があります。Zing Data のモバイルアプリメニューで **Sources** を選択し、次に **Add a Datasource** をクリックします。

    * ウェブでデータソースを追加するには、上部メニューの **Data Sources** をクリックし、**New Datasource** をクリックしてドロップダウンメニューから **Clickhouse** を選択します。

    <Image size="md" img={zing_01} alt="Zing Data interface showing New Datasource button and ClickHouse option in the dropdown menu" border />
    <br/>

4. 接続詳細を記入し、**Check Connection** をクリックします。

    <Image size="md" img={zing_02} alt="ClickHouse connection configuration form in Zing Data with fields for server, port, database, username and password" border />
    <br/>

5. 接続が成功すると、Zing はテーブル選択に進みます。必要なテーブルを選択し、**Save** をクリックします。Zing がデータソースに接続できない場合、認証情報を確認し再試行するように求めるメッセージが表示されます。認証情報を確認し再試行しても問題が解決しない場合は、<a id="contact_link" href="mailto:hello@getzingdata.com">こちらで Zing サポートにご連絡ください。</a>

    <Image size="md" img={zing_03} alt="Zing Data table selection interface showing available ClickHouse tables with checkboxes" border />
    <br/>

6. Clickhouse データソースが追加されると、全ての Zing 組織のメンバーが **Data Sources** / **Sources** タブの下で利用できるようになります。

## Creating Charts and Dashboards in Zing Data {#creating-charts-and-dashboards-in-zing-data}

1. Clickhouse データソースが追加された後、ウェブで **Zing App** をクリックするか、モバイルでデータソースをクリックしてチャートを作成し始めます。

2. テーブルのリストからテーブルをクリックしてチャートを作成します。

    <Image size="sm" img={zing_04} alt="Zing Data interface showing the table list with available ClickHouse tables" border />
    <br/>

3. ビジュアルクエリビルダーを使用して、必要なフィールド、集計などを選択し、**Run Question** をクリックします。

    <Image size="md" img={zing_05} alt="Zing Data visual query builder interface with field selection and aggregation options" border />
    <br/>

4. SQL に慣れている場合は、カスタム SQL を書いてクエリを実行し、チャートを作成することもできます。

    <Image size="md" img={zing_06} alt="SQL editor mode in Zing Data showing SQL query writing interface" border />
    <Image size="md" img={zing_07} alt="SQL query results in Zing Data with data displayed in tabular format" border />

5. サンプルチャートは次のようになります。質問は三点リーダーメニューを使用して保存できます。チャートにコメントを追加したり、チームメンバーをタグ付けしたり、リアルタイムアラートを作成したり、チャートの種類を変更したりできます。

    <Image size="md" img={zing_08} alt="Example chart visualization in Zing Data showing data from ClickHouse with options menu" border />
    <br/>

6. ダッシュボードは、ホーム画面の **Dashboards** の下にある "+" アイコンを使用して作成できます。既存の質問はドラッグしてダッシュボードに表示できます。

    <Image size="md" img={zing_09} alt="Zing Data dashboard view showing multiple visualizations arranged in a dashboard layout" border />
    <br/>

## Related Content {#related-content}

- Blog: [ClickHouse を用いたデータの視覚化 - Zing Data](https://getzingdata.com/blog/zing-adds-support-for-clickhouse-as-a-data-source/)
- [Documentation](https://docs.getzingdata.com/docs/)
- [Quick Start](https://getzingdata.com/quickstart/)
- Guide to [Create Dashboards](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
