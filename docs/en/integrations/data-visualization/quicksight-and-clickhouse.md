---
sidebar_label: QuickSight
slug: /en/integrations/quicksight
keywords: [clickhouse, aws, amazon, quicksight, mysql, connect, integrate, ui]
description: Amazon QuickSight powers data-driven organizations with unified business intelligence (BI) at hyperscale.
---

import MySQLCloudSetup from '@site/docs/en/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/en/_snippets/_clickhouse_mysql_on_premise_setup.mdx';

# QuickSight

QuickSight can connect to ClickHouse Cloud or on-premise ClickHouse setup via MySQL interface using the official MySQL data source.

## ClickHouse Cloud Setup
<MySQLCloudSetup />

## On-premise ClickHouse Server Setup
<MySQLOnPremiseSetup />

## Connecting QuickSight to ClickHouse

First of all, go to https://quicksight.aws.amazon.com, navigate to Datasets and click "New dataset":

<img src={require('./images/quicksight_01.png').default} class="image" alt="Creating a new dataset" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Search for the official MySQL connector bundled with QuickSight (named just **MySQL**):

<img src={require('./images/quicksight_02.png').default} class="image" alt="MySQL connector search" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Specify your connection details. Please note that MySQL interface port is 9004 by default,
and it might be different depending on your server configuration.

<img src={require('./images/quicksight_03.png').default} class="image" alt="Specifying the connection details" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Now, you have two options on how to fetch the data from ClickHouse. First, you could select a table from the list:

<img src={require('./images/quicksight_04.png').default} class="image" alt="Selecting a table from the list" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Alternatively, you could specify a custom SQL to fetch your data:

<img src={require('./images/quicksight_05.png').default} class="image" alt="Using custom SQL to fetch the data" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

By clicking "Edit/Preview data", you should be able to see the introspected table structure or adjust your custom SQL, if that's how you decided to access the data:

<img src={require('./images/quicksight_06.png').default} class="image" alt="Viewing the introspected table structure" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Now you can proceed with publishing your dataset and creating a new visualization! 

## Known limitations

- Median aggregation does not work. See [#53066](https://github.com/ClickHouse/ClickHouse/issues/53066) for more details.
- String types might not be recognized properly when `use_mysql_types_in_show_columns` setting is enabled. See [#52777](https://github.com/ClickHouse/ClickHouse/issues/52777) for more details.