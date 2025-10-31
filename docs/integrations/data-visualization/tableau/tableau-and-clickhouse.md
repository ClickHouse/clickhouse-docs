---
sidebar_label: 'Tableau Desktop'
sidebar_position: 1
slug: /integrations/tableau
keywords: ['clickhouse', 'tableau', 'connect', 'integrate', 'ui']
description: 'Tableau can use ClickHouse databases and tables as a data source.'
title: 'Connecting Tableau to ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc'
---

import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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

# Connecting Tableau to ClickHouse

<ClickHouseSupportedBadge/>

ClickHouse offers an official Tableau Connector, featured on
the [Tableau Exchange](https://exchange.tableau.com/products/1064).
The connector is based on ClickHouse's advanced [JDBC driver](/integrations/language-clients/java/jdbc).

With this connector, Tableau integrates ClickHouse databases and tables as data sources. To enable this functionality,
follow the setup guide below.

<TOCInline toc={toc}/>

## Setup required prior usage {#setup-required-prior-usage}

1. Gather your connection details
   <ConnectionDetails />

2. Download and install  <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>.
3. Follow `clickhouse-tableau-connector-jdbc` instructions to download the compatible version
   of <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC driver</a>.

:::note
Make sure you download the [clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases) JAR file. This artifact is available from version `0.9.2`.
:::

4. Store the JDBC driver in the following folder (based on your OS, if the folder doesn't exist, you can create it):
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. Configure a ClickHouse data source in Tableau and start building data visualizations!

## Configure a ClickHouse data source in Tableau {#configure-a-clickhouse-data-source-in-tableau}

Now that you have the `clickhouse-jdbc` driver installed and set, let's see how to define a data
source in Tableau that connects to the **TPCD** database in ClickHouse.

1. Start Tableau. (If you already had it running, then restart it.)

2. From the left-side menu, click on **More** under the **To a Server** section. Search for **ClickHouse by ClickHouse** in the available connectors list:

<Image size="md" img={tableau_connecttoserver} alt="Tableau connection screen showing the connector selection menu with ClickHouse by ClickHouse option highlighted" border />
<br/>

:::note
Don't see the **ClickHouse by ClickHouse** connector in your connectors list? It might be related to an old Tableau Desktop version.
To solve that, consider upgrading your Tableau Desktop application, or [install the connector manually](#install-the-connector-manually).
:::

3. Click on **ClickHouse by ClickHouse**  and the following dialog will pop up:

<Image size="md" img={tableau_connector_details} alt="Tableau connector installation dialog showing ClickHouse JDBC connector details and install button" border />
<br/>
 
4. Click **Install and Restart Tableau**. Restart the application.
5. After restarting, the connector will have its full name: `ClickHouse JDBC by ClickHouse, Inc.`. When clicking it, the following dialog will pop up:

<Image size="md" img={tableau_connector_dialog} alt="ClickHouse connection dialog in Tableau showing fields for server, port, database, username and password" border />
<br/>

6. Enter your connection details:

    | Setting  | Value                                                  |
    | ----------- |--------------------------------------------------------|
    | Server      | **Your ClickHouse host (with no prefixes or suffix)** |
    | Port   | **8443**                                               |
    | Database | **default**                                            |
    | Username | **default**                                            |
    | Password | *\*****                                                |

:::note
When working with ClickHouse cloud, it's required to enable the SSL checkbox for secured connections.
:::
<br/>

:::note
Our ClickHouse database is named **TPCD**, but you must set the **Database** to **default** in the dialog above, then
select **TPCD** for the **Schema** in the next step. (This is likely due to a bug in the connector, so this behavior
could change, but for now you must use **default** as the database.)
:::

7. Click the **Sign In** button and you should see a new Tableau workbook:

<Image size="md" img={tableau_newworkbook} alt="New Tableau workbook showing the initial connection screen with database selection options" border />
<br/>

8. Select **TPCD** from the **Schema** dropdown and you should see the list of tables in **TPCD**:

<Image size="md" img={tableau_tpcdschema} alt="Tableau schema selection showing TPCD database tables including CUSTOMER, LINEITEM, NATION, ORDERS, and others" border />
<br/>

You are now ready to build some visualizations in Tableau!

## Building Visualizations in Tableau {#building-visualizations-in-tableau}

Now that we have a ClickHouse data source configured in Tableau, let's visualize the data...

1. Drag the **CUSTOMER** table onto the workbook. Notice the columns appear, but the data table is empty:

<Image size="md" img={tableau_workbook1} alt="Tableau workbook with CUSTOMER table dragged to canvas showing column headers but no data" border />
<br/>

2. Click the **Update Now** button and 100 rows from **CUSTOMER** will populate the table.

3. Drag the **ORDERS** table into the workbook, then set **Custkey** as the relationship field between the two tables:

<Image size="md" img={tableau_workbook2} alt="Tableau relationship editor showing connection between CUSTOMER and ORDERS tables using Custkey field" border />
<br/>

4. You now have the **ORDERS** and **LINEITEM** tables associated with each other as your data source, so you can use
   this relationship to answer questions about the data. Select the **Sheet 1** tab at the bottom of the workbook.

<Image size="md" img={tableau_workbook3} alt="Tableau worksheet showing the dimensions and measures from ClickHouse tables available for analysis" border />
<br/>

5. Suppose you want to know how many specific items were ordered each year. Drag **OrderDate** from **ORDERS** into the
   **Columns** section (the horizontal field), then drag **Quantity** from **LINEITEM** into the **Rows**. Tableau will
   generate the following line chart:

<Image size="sm" img={tableau_workbook4} alt="Tableau line chart showing quantity ordered by year from ClickHouse data" border />
<br/>

Not a very exciting line chart, but the dataset was generated by a script and built for testing query performance, so
you will notice there is not a lot of variations in the simulated orders of the TCPD data.

6. Suppose you want to know the average order amount (in dollars) by quarter and also by shipping mode (air, mail, ship,
   truck, etc.):

    - Click the **New Worksheet** tab create a new sheet
    - Drag **OrderDate** from **ORDERS** into **Columns** and change it from **Year** to **Quarter**
    - Drag **Shipmode** from **LINEITEM** into **Rows**

You should see the following:

<Image size="sm" img={tableau_workbook5} alt="Tableau crosstab view with quarters as columns and shipment modes as rows" border />
<br/>

7. The **Abc** values are just filling in the space until you drag a metric onto the table. Drag **Totalprice** from *
   *ORDERS** onto the table. Notice the default calculation is to **SUM** the **Totalprices**:

<Image size="md" img={tableau_workbook6} alt="Tableau crosstab showing sum of total price by quarter and shipment mode" border />
<br/>

8. Click on **SUM** and change the **Measure** to **Average**. From the same dropdown menu, select **Format** change the
   **Numbers** to **Currency (Standard)**:

<Image size="md" img={tableau_workbook7} alt="Tableau crosstab showing average order price by quarter and shipment mode with currency formatting" border />
<br/>

Well done! You have successfully connected Tableau to ClickHouse, and you have opened up a whole world of possibilities
for analyzing and visualizing your ClickHouse data.

## Install the connector manually {#install-the-connector-manually}

In case you use an outdated Tableau Desktop version that doesn't include the connector by default, you can install it manually by following these steps:

1. Download the latest taco file from [Tableau Exchange](https://exchange.tableau.com/products/1064)
2. Place the taco file in
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Restart Tableau Desktop, if your setup went successfully, you will set the connector under the `New Data Source` section.

## Connection and analysis tips {#connection-and-analysis-tips}

For more guidance on optimizing your Tableau-ClickHouse integration, 
please visit [Connection Tips](/integrations/tableau/connection-tips) and [Analysis Tips](/integrations/tableau/analysis-tips).

## Tests {#tests}
The connector is being tested with the [TDVT framework](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) and currently maintains a 97% coverage ratio.

## Summary {#summary}
You can connect Tableau to ClickHouse using the generic ODBC/JDBC ClickHouse driver. However, this
connector streamlines the connection setup process. If you have any issues with the connector, feel free to reach out
on <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>.
