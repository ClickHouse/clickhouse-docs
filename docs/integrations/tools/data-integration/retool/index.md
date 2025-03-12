---
sidebar_label: 'Retool'
slug: /integrations/retool
keywords: ['clickhouse', 'retool', 'connect', 'integrate', 'ui', 'admin', 'panel', 'dashboard', 'nocode', 'no-code']
description: 'Quickly build web and mobile apps with rich user interfaces, automate complex tasks, and integrate AI—all powered by your data.'
title: 'TODO: Add title'
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';

# Connecting Retool to ClickHouse

## 1. Gather your connection details {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Create a ClickHouse resource {#2-create-a-clickhouse-resource}

Login to your Retool account and navigate to the _Resources_ tab. Choose "Create New" -> "Resource":

<img src={retool_01} className="image" alt="Creating a new resource" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Select "JDBC" from the list of available connectors:

<img src={retool_02} className="image" alt="Choosing JDBC connector" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

In the setup wizard, make sure you select `com.clickhouse.jdbc.ClickHouseDriver` as the "Driver name":

<img src={retool_03} className="image" alt="Selecting the right driver" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Fill in your ClickHouse credentials in the following format: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`. 
If your instance requires SSL or you are using ClickHouse Cloud, add `&ssl=true` to the connection string, so it looks like `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`

<img src={retool_04} className="image" alt="Specifying your credentials" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

After that, test your connection:

<img src={retool_05} className="image" alt="Testing your connection" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Now, you should be able to proceed to your app using your ClickHouse resource.
