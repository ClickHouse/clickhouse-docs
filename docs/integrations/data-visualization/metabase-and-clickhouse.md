---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: /integrations/metabase
keywords: ['Metabase']
description: 'Metabase is an easy-to-use, open source UI tool for asking questions about your data.'
title: 'Connecting Metabase to ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
  - website: 'https://github.com/clickhouse/metabase-clickhouse-driver'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Connecting Metabase to ClickHouse

<PartnerBadge/>

Metabase is an easy-to-use, open source UI tool for asking questions about your data. Metabase is a Java application that can be run by simply <a href="https://www.metabase.com/start/oss/jar" target="_blank">downloading the JAR file</a> and running it with `java -jar metabase.jar`. Metabase connects to ClickHouse using a JDBC driver that you download and put in the `plugins` folder:

## Goal {#goal}

In this guide you will ask some questions of your ClickHouse data with Metabase and visualize the answers.  One of the answers will look like this:

  <Image size="md" img={metabase_08} alt="Metabase pie chart visualization showing data from ClickHouse" border />
<p/>

:::tip Add some data
If you do not have a dataset to work with you can add one of the examples.  This guide uses the [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) dataset, so you might choose that one.  There are several others to look at in the same documentation category.
:::

## 1. Gather your connection details {#1-gather-your-connection-details}
<ConnectionDetails />

## 2.  Download the ClickHouse plugin for Metabase {#2--download-the-clickhouse-plugin-for-metabase}

1. If you do not have a `plugins` folder, create one as a subfolder of where you have `metabase.jar` saved.

2. The plugin is a JAR file named `clickhouse.metabase-driver.jar`. Download the latest version of the JAR file at <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>

3. Save `clickhouse.metabase-driver.jar` in your `plugins` folder.

4. Start (or restart) Metabase so that the driver gets loaded properly.

5. Access Metabase at <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>. On the initial startup, you will see a welcome screen and have to work your way through a list of questions. If prompted to select a database, select "**I'll add my data later**":

## 3.  Connect Metabase to ClickHouse {#3--connect-metabase-to-clickhouse}

1. Click on the gear icon in the top-right corner and select **Admin Settings** to visit your <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase admin page</a>.

2. Click on **Add a database**. Alternately, you can click on the **Databases** tab and select the **Add database** button.

3. If your driver installation worked, you will see **ClickHouse** in the dropdown menu for **Database type**:

    <Image size="md" img={metabase_01} alt="Metabase database selection showing ClickHouse as an option" border />

4. Give your database a **Display name**, which is a Metabase setting - so use any name you like.

5. Enter the connection details of your ClickHouse database. Enable a secure connection if your ClickHouse server is configured to use SSL. For example:

    <Image size="md" img={metabase_02} alt="Metabase connection details form for ClickHouse database" border />

6. Click the **Save** button and Metabase will scan your database for tables.

## 4. Run a SQL query {#4-run-a-sql-query}

1. Exit the **Admin settings** by clicking the **Exit admin** button in the top-right corner.

2. In the top-right corner, click the **+ New** menu and notice you can ask questions, run SQL queries, and build a dashboard:

    <Image size="sm" img={metabase_03} alt="Metabase New menu showing options to create questions, SQL queries, and dashboards" border />

3. For example, here is a SQL query run on a table named `uk_price_paid` that returns the average price paid by year from 1995 to 2022:

    <Image size="md" img={metabase_04} alt="Metabase SQL editor showing a query on UK price paid data" border />

## 5. Ask a question {#5-ask-a-question}

1. Click on **+ New** and select **Question**. Notice you can build a question by starting with a database and table. For example, the following question is being asked of a table named `uk_price_paid` in the `default` database. Here is a simple question that calculates the average price by town, within the county of Greater Manchester:

    <Image size="md" img={metabase_06} alt="Metabase question builder interface with UK price data" border />

2. Click the **Visualize** button to see the results in a tabular view.

    <Image size="md" img={metabase_07} alt="Metabase visualization showing tabular results of average prices by town" border />

3. Below the results, click the **Visualization** button to change the visualization to a bar chart (or any of the other options available):

    <Image size="md" img={metabase_08} alt="Metabase pie chart visualization of average prices by town in Greater Manchester" border />

## Learn more {#learn-more}

Find more information about Metabase and how to build dashboards by <a href="https://www.metabase.com/docs/latest/" target="_blank">visiting the Metabase documentation</a>.
