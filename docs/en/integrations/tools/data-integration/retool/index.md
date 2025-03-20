---
sidebar_label: Retool
slug: /en/integrations/retool
keywords: [clickhouse, retool, connect, integrate, ui, admin, panel, dashboard, nocode, no-code]
description: Quickly build web and mobile apps with rich user interfaces, automate complex tasks, and integrate AI—all powered by your data.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Connecting Retool to ClickHouse

## 1. Gather your connection details
<ConnectionDetails />

## 2. Create a ClickHouse resource

Login to your Retool account and navigate to the _Resources_ tab. Choose "Create New" -> "Resource":

<img src={require('./images/retool_01.png').default} className="image" alt="Creating a new resource" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Select "JDBC" from the list of available connectors:

<img src={require('./images/retool_02.png').default} className="image" alt="Choosing JDBC connector" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

In the setup wizard, make sure you select `com.clickhouse.jdbc.ClickHouseDriver` as the "Driver name":

<img src={require('./images/retool_03.png').default} className="image" alt="Selecting the right driver" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Fill in your ClickHouse credentials in the following format: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`. 
If your instance requires SSL or you are using ClickHouse Cloud, add `&ssl=true` to the connection string, so it looks like `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`

<img src={require('./images/retool_04.png').default} className="image" alt="Specifying your credentials" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

After that, test your connection:

<img src={require('./images/retool_05.png').default} className="image" alt="Testing your connection" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Now, you should be able to proceed to your app using your ClickHouse resource.
