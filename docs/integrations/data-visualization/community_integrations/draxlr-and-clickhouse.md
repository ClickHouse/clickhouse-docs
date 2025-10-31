---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'connect', 'integrate', 'ui']
description: 'Draxlr is a Business intelligence tool with data visualization and analytics.'
title: 'Connecting Draxlr to ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import draxlr_01 from '@site/static/images/integrations/data-visualization/draxlr_01.png';
import draxlr_02 from '@site/static/images/integrations/data-visualization/draxlr_02.png';
import draxlr_03 from '@site/static/images/integrations/data-visualization/draxlr_03.png';
import draxlr_04 from '@site/static/images/integrations/data-visualization/draxlr_04.png';
import draxlr_05 from '@site/static/images/integrations/data-visualization/draxlr_05.png';
import draxlr_06 from '@site/static/images/integrations/data-visualization/draxlr_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Connecting Draxlr to ClickHouse

<CommunityMaintainedBadge/>

Draxlr offers an intuitive interface for connecting to your ClickHouse database, enabling your team to explore, visualize, and publish insights within minutes. This guide will walk you through the steps to establish a successful connection.

## 1. Get your ClickHouse credentials {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2.  Connect Draxlr to ClickHouse {#2--connect-draxlr-to-clickhouse}

1. Click on the **Connect a Database** button on the navbar.

2. Select **ClickHouse** from the list of available databases and click next.

3. Choose one of the hosting services and click next.

4. Use any name in the **Connection Name** field.

5. Add the connection details in the form.

  <Image size="md" img={draxlr_01} alt="Draxlr connection form showing ClickHouse database configuration options" border />

6. Click on the **Next** button and wait for the connection to be established. You will see the tables page if the connection is successful.

## 4. Explore your data {#4-explore-your-data}

1. Click on one of the tables in the list.

2. It will take you to the explore page to see the data in the table.

3. You can start adding the filters, make joins and add sort to your data.

  <Image size="md" img={draxlr_02} alt="Draxlr data exploration interface showing filters and sorting options" border />

4. You can also use the **Graph** button and select the graph type to visualize the data.

  <Image size="md" img={draxlr_05} alt="Draxlr graph visualization options for ClickHouse data" border />

## 4. Using SQL queries {#4-using-sql-queries}

1. Click on the Explore button on the navbar.

2. Click the **Raw Query** button and enter your query in the text area.

  <Image size="md" img={draxlr_03} alt="Draxlr SQL query interface for ClickHouse" border />

3. Click on the **Execute Query** button to see the results.

## 4. Saving you query {#4-saving-you-query}

1. After executing your query, click on the **Save Query** button.

  <Image size="md" img={draxlr_04} alt="Draxlr save query dialog with dashboard options" border />

2. You can name to query in **Query Name** text box and select a folder to categories it.

3. You can also use **Add to dashboard** option to add the result to dashboard.

4. Click on the **Save** button to save the query.

## 5. Building dashboards {#5-building-dashboards}

1. Click on the **Dashboards** button on the navbar.

  <Image size="md" img={draxlr_06} alt="Draxlr dashboard management interface" border />

2. You can add a new dashboard by clicking on the **Add +** button on the left sidebar.

3. To add a new widget, click on the **Add** button on the top right corner.

4. You can select a query from the list of saved queries and choose the visualization type then click on the **Add Dashboard Item** button.

## Learn more {#learn-more}
To know more about Draxlr you can visit [Draxlr documentation](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928) site.
