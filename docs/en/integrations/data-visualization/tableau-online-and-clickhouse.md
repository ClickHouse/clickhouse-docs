---
sidebar_label: Tableau Online
slug: /en/integrations/tableau-online
keywords: [clickhouse, tableau, online, mysql, connect, integrate, ui]
description: Tableau Online streamlines the power of data to make people faster and more confident decision makers from anywhere.
---

import MySQLCloudSetup from '@site/docs/en/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/en/_snippets/_clickhouse_mysql_on_premise_setup.mdx';

# Tableau Online

Tableau Online can connect to ClickHouse Cloud or on-premise ClickHouse setup via MySQL interface using the official MySQL data source.

## ClickHouse Cloud Setup
<MySQLCloudSetup />

## On-premise ClickHouse Server Setup
<MySQLOnPremiseSetup />

## Connecting Tableau Online to ClickHouse

Login to your Tableau Cloud site and add a new Published Data Source.

<img src={require('./images/tableau_online_01.png').default} class="image" alt="Creating a new published data source" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Select "MySQL" from the list of available connectors.

<img src={require('./images/tableau_online_02.png').default} class="image" alt="Selecting MySQL connector" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Specify your connection details gathered during the ClickHouse setup.

<img src={require('./images/tableau_online_03.png').default} class="image" alt="Specifying your connection details" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Tableau Online will introspect the database and provide a list of available tables. Drag the desired table to the canvas on the right. Additionally, you can click "Update Now" to preview the data, as well as fine-tune the introspected field types or names.

<img src={require('./images/tableau_online_04.png').default} class="image" alt="Selecting the tables to use" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

After that, all that remains is to click "Publish As" in the top right corner, and you should be able to use a newly created dataset in Tableau Online as usual.

NB: if you want to use Tableau Online in combination with Tableau Desktop and share ClickHouse datasets between them, make sure you use Tableau Desktop with the default MySQL connector as well, following the setup guide that is displayed [here](https://www.tableau.com/support/drivers) if you select MySQL from the Data Source drop-down. If you have an M1 Mac, check [this troubleshooting thread](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) for a driver installation workaround.

## Known limitations
* Aggregation by week number does not work. Should be resolved after [#54794](https://github.com/ClickHouse/ClickHouse/issues/54794).
* Aggregations by truncated dates don't work. Should be resolved after [#54795](https://github.com/ClickHouse/ClickHouse/issues/54795).
* Aggregations over tables joined with "relationships" feature don't work. Should be resolved after [#55182](https://github.com/ClickHouse/ClickHouse/issues/55182).
* (Tableau Desktop via MySQL only) A table cannot be selected from the table browser during the connection setup. Use "Custom SQL" as a workaround. Should be resolved after [#55183](https://github.com/ClickHouse/ClickHouse/issues/55183).