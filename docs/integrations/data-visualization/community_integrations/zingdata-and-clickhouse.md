---
sidebar_label: 'Zing Data'
sidebar_position: 206
slug: /integrations/zingdata
keywords: ['Zing Data']
description: 'Zing Data is simple social business intelligence for ClickHouse, made for iOS, Android and the web.'
title: 'Connect Zing Data to ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
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

# Connect Zing Data to ClickHouse

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> is a data exploration and visualization platform. Zing Data connects to ClickHouse using the JS driver provided by ClickHouse.

## How to connect {#how-to-connect}
1. Gather your connection details.
<ConnectionDetails />

2. Download or visit Zing Data

    * To use Clickhouse with Zing Data on mobile, download the Zing data app on [Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) or the [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091).

    * To use Clickhouse with Zing Data on the web, visit the [Zing web console](https://console.getzingdata.com/) and create an account.

3. Add a datasource

    * To interact with your ClickHouse data with Zing Data, you need to define a **_datasource_**. On the mobile app menu in Zing Data, select **Sources**, then click on **Add a Datasource**.

    * To add a datasource on web, click on **Data Sources** on the top menu, click on **New Datasource** and select **Clickhouse** from the dropdown menu

    <Image size="md" img={zing_01} alt="Zing Data interface showing New Datasource button and ClickHouse option in the dropdown menu" border />
    <br/>

4. Fill out the connection details and click on **Check Connection**.

    <Image size="md" img={zing_02} alt="ClickHouse connection configuration form in Zing Data with fields for server, port, database, username and password" border />
    <br/>

5. If the connection is successful, Zing will proceed you to table selection. Select the required tables and click on **Save**. If Zing cannot connect to your data source, you'll see a message asking your to check your credentials and retry. If even after checking your credentials and retrying you still experience issues, <a id="contact_link" href="mailto:hello@getzingdata.com">reach out to Zing support here.</a>

    <Image size="md" img={zing_03} alt="Zing Data table selection interface showing available ClickHouse tables with checkboxes" border />
    <br/>

6. Once the Clickhouse datasource is added, it will be available to everyone in your Zing organization, under the **Data Sources** / **Sources** tab.

## Creating charts and dashboards in Zing Data {#creating-charts-and-dashboards-in-zing-data}

1. After your Clickhouse datasource is added, click on **Zing App** on the web, or click on the datasource on mobile to start creating charts.

2. Click on a table under the table's list to create a chart.

    <Image size="sm" img={zing_04} alt="Zing Data interface showing the table list with available ClickHouse tables" border />
    <br/>

3. Use the visual query builder to pick the desired fields, aggregations, etc., and click on **Run Question**.

    <Image size="md" img={zing_05} alt="Zing Data visual query builder interface with field selection and aggregation options" border />
    <br/>

4. If you familiar with SQL, you can also write custom SQL to run queries and create a chart.

    <Image size="md" img={zing_06} alt="SQL editor mode in Zing Data showing SQL query writing interface" border />
    <Image size="md" img={zing_07} alt="SQL query results in Zing Data with data displayed in tabular format" border />

5. An example chart would look as follows. The question can be saved using the three-dot menu. You can comment on the chart, tag your team members, create real-time alerts, change the chart type, etc.

    <Image size="md" img={zing_08} alt="Example chart visualization in Zing Data showing data from ClickHouse with options menu" border />
    <br/>

6. Dashboards can be created using the "+" icon under **Dashboards** on the Home screen. Existing questions can be dragged in, to be displayed on the dashboard.

    <Image size="md" img={zing_09} alt="Zing Data dashboard view showing multiple visualizations arranged in a dashboard layout" border />
    <br/>

## Related content {#related-content}

- [Documentation](https://docs.getzingdata.com/docs/)
- [Quick Start](https://getzingdata.com/quickstart/)
- Guide to [Create Dashboards](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
