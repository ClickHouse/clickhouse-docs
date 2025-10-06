---
'sidebar_label': 'Zing Data'
'sidebar_position': 206
'slug': '/integrations/zingdata'
'keywords':
- 'Zing Data'
'description': 'Zing Dataは、iOS、Android、ウェブ用に作られたClickHouse向けのシンプルなソーシャルビジネスインテリジェンスです。'
'title': 'Zing DataをClickHouseに接続する'
'show_related_blogs': true
'doc_type': 'guide'
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

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> はデータ探索および可視化プラットフォームです。Zing Data は ClickHouse の提供する JS ドライバーを使用して ClickHouse に接続します。

## How to connect {#how-to-connect}
1. 接続詳細を収集します。
<ConnectionDetails />

2. Zing Data をダウンロードまたは訪問します。

    * モバイルで Zing Data と Clickhouse を使用するには、[Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) または [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091) から Zing Data アプリをダウンロードします。

    * ウェブで Zing Data と Clickhouse を使用するには、[Zing ウェブコンソール](https://console.getzingdata.com/) にアクセスし、アカウントを作成します。

3. データソースを追加します。

    * Zing Data で ClickHouse データと対話するには、**_datasource_** を定義する必要があります。Zing Data のモバイルアプリメニューで **Sources** を選択し、次に **Add a Datasource** をクリックします。

    * ウェブでデータソースを追加するには、上部メニューの **Data Sources** をクリックし、**New Datasource** をクリックして、ドロップダウンメニューから **Clickhouse** を選択します。

    <Image size="md" img={zing_01} alt="Zing Data interface showing New Datasource button and ClickHouse option in the dropdown menu" border />
    <br/>

4. 接続詳細を入力し、**Check Connection** をクリックします。

    <Image size="md" img={zing_02} alt="ClickHouse connection configuration form in Zing Data with fields for server, port, database, username and password" border />
    <br/>

5. 接続が成功した場合、Zing はテーブル選択に進みます。必要なテーブルを選択し、**Save** をクリックします。Zing がデータソースに接続できない場合は、認証情報を確認して再試行するように求めるメッセージが表示されます。認証情報を確認して再試行してもなお問題が発生する場合は、<a id="contact_link" href="mailto:hello@getzingdata.com">こちらから Zing サポートにお問い合わせください。</a>

    <Image size="md" img={zing_03} alt="Zing Data table selection interface showing available ClickHouse tables with checkboxes" border />
    <br/>

6. Clickhouse データソースが追加されると、あなたの Zing 組織内の全員が **Data Sources** / **Sources** タブで利用できるようになります。

## Creating charts and dashboards in Zing Data {#creating-charts-and-dashboards-in-zing-data}

1. Clickhouse データソースが追加された後、ウェブで **Zing App** をクリックするか、モバイルでデータソースをクリックしてチャートを作成します。

2. チャートを作成するには、テーブルのリストの下にあるテーブルをクリックします。

    <Image size="sm" img={zing_04} alt="Zing Data interface showing the table list with available ClickHouse tables" border />
    <br/>

3. ビジュアルクエリビルダーを使用して、希望するフィールド、集約などを選択し、**Run Question** をクリックします。

    <Image size="md" img={zing_05} alt="Zing Data visual query builder interface with field selection and aggregation options" border />
    <br/>

4. SQL に慣れている場合は、カスタム SQL を記述してクエリを実行し、チャートを作成することもできます。

    <Image size="md" img={zing_06} alt="SQL editor mode in Zing Data showing SQL query writing interface" border />
    <Image size="md" img={zing_07} alt="SQL query results in Zing Data with data displayed in tabular format" border />

5. 例として、チャートは以下のようになります。質問は3点メニューを使用して保存できます。チャートにコメントを付けたり、チームメンバーにタグを付けたり、リアルタイムアラートを作成したり、チャートの種類を変更したりできます。

    <Image size="md" img={zing_08} alt="Example chart visualization in Zing Data showing data from ClickHouse with options menu" border />
    <br/>

6. ダッシュボードは、ホーム画面の **Dashboards** の下にある "+" アイコンを使用して作成できます。既存の質問をドラッグしてダッシュボードに表示できます。

    <Image size="md" img={zing_09} alt="Zing Data dashboard view showing multiple visualizations arranged in a dashboard layout" border />
    <br/>

## Related content {#related-content}

- [Documentation](https://docs.getzingdata.com/docs/)
- [Quick Start](https://getzingdata.com/quickstart/)
- Guide to [Create Dashboards](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
