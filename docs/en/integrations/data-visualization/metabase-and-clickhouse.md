---
sidebar_label: Metabase
sidebar_position: 131
slug: /en/integrations/metabase
keywords: [clickhouse, metabase, connect, integrate, ui]
description: Metabase is an easy-to-use, open source UI tool for asking questions about your data.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Connecting Metabase to ClickHouse

Metabase is an easy-to-use, open source UI tool for asking questions about your data. Metabase is a Java application that can be run by simply <a href="https://www.metabase.com/start/oss/jar" target="_blank">downloading the JAR file</a> and running it with `java -jar metabase.jar`. Metabase connects to ClickHouse using a JDBC driver that you download and put in the `plugins` folder:

## Goal

In this guide you will ask some questions of your ClickHouse data with Metabase and visualize the answers.  One of the answers will look like this:

  <img src={require('./images/metabase_08.png').default} class="image" alt="Pie Chart" />
<p/>

:::tip Add some data
If you do not have a dataset to work with you can add one of the examples.  This guide uses the [UK Price Paid](/docs/en/getting-started/example-datasets/uk-price-paid.md) dataset, so you might choose that one.  There are several others to look at in the same documentation category.
:::

## 1. Gather your connection details
<ConnectionDetails />

## 2.  Download the ClickHouse plugin for Metabase

1. If you do not have a `plugins` folder, create one as a subfolder of where you have `metabase.jar` saved.

2. The plugin is a JAR file named `clickhouse.metabase-driver.jar`. Download the latest version of the JAR file at <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>

3. Save `clickhouse.metabase-driver.jar` in your `plugins` folder.

4. Start (or restart) Metabase so that the driver gets loaded properly.

5. Access Metabase at <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>. On the initial startup, you will see a welcome screen and have to work your way through a list of questions. If prompted to select a database, select "**I'll add my data later**":


## 3.  Connect Metabase to ClickHouse

1. Click on the gear icon in the top-right corner and select **Admin Settings** to visit your <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase admin page</a>.

2. Click on **Add a database**. Alternately, you can click on the **Databases** tab and select the **Add database** button.

3. If your driver installation worked, you will see **ClickHouse** in the dropdown menu for **Database type**:

    <img src={require('./images/metabase_01.png').default} class="image" alt="Add a ClickHouse database" />

4. Give your database a **Display name**, which is a Metabase setting - so use any name you like.

5. Enter the connection details of your ClickHouse database. Enable a secure connection if your ClickHouse server is configured to use SSL. For example:

    <img src={require('./images/metabase_02.png').default} class="image" style={{width: '80%'}}  alt="Connection details" />

6. Click the **Save** button and Metabase will scan your database for tables.

## 4. Run a SQL query

1. Exit the **Admin settings** by clicking the **Exit admin** button in the top-right corner.

2. In the top-right corner, click the **+ New** menu and notice you can ask questions, run SQL queries, and build a dashboard:

    <img src={require('./images/metabase_03.png').default} class="image" style={{width: 283}} alt="New menu" />

3. For example, here is a SQL query run on a table named `uk_price_paid` that returns the average price paid by year from 1995 to 2022:

    <img src={require('./images/metabase_04.png').default} class="image" alt="Run a SQL query" />

## 5. Ask a question

1. Click on **+ New** and select **Question**. Notice you can build a question by starting with a database and table. For example, the following question is being asked of a table named `uk_price_paid` in the `default` database. Here is a simple question that calculates the average price by town, within the county of Greater Manchester:

    <img src={require('./images/metabase_06.png').default} class="image" alt="New question" />

2. Click the **Visualize** button to see the results in a tabular view.

    <img src={require('./images/metabase_07.png').default} class="image" alt="New question" />

3. Below the results, click the **Visualization** button to change the visualization to a bar chart (or any of the other options available):

    <img src={require('./images/metabase_08.png').default} class="image" alt="Pie Chart visualization" />

## Learn more

Find more information about Metabase and how to build dashboards by <a href="https://www.metabase.com/docs/latest/" target="_blank">visiting the Metabase documentation</a>.

## Related Content

- Blog: [Visualizing Data with ClickHouse - Part 3 - Metabase](https://clickhouse.com/blog/visualizing-data-with-metabase)
