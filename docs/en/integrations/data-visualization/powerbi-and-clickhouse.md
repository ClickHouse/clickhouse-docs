---
sidebar_label: Power BI
slug: /en/integrations/powerbi
keywords: [clickhouse, powerbi, connect, integrate, ui]
description: Microsoft Power BI is an interactive data visualization software product developed by Microsoft with a primary focus on business intelligence.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Power BI

Power BI can load the data from ClickHouse Cloud or on-premise deployment using the [ODBC driver](https://github.com/ClickHouse/clickhouse-odbc) on a Windows machine.

## 1. Gather your connection details
<ConnectionDetails />

## 2. Connect Power BI to ClickHouse

Download the most recent ClickHouse ODBC release from [here](https://github.com/ClickHouse/clickhouse-odbc/releases).
Execute the supplied `.msi` installer and follow the wizard. 
Optional "debug symbols" are not required, so you could keep everything default.

<img src={require('./images/powerbi_01.png').default} class="image" alt="Installing the ODBC driver" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

When the driver installation is complete, an ODBC data source can be created. 
Search for ODBC in the Start menu and select "ODBC Data Sources **(64-bit)**".

<img src={require('./images/powerbi_02.png').default} class="image" alt="Creating a new ODBC Data Source" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

We need to add a new User DSN here. Click "Add" button on the left.

<img src={require('./images/powerbi_03.png').default} class="image" alt="Creating a new ODBC Data Source" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Choose the Unicode version of the ODBC driver.

<img src={require('./images/powerbi_04.png').default} class="image" alt="Selecting the driver for ODBC data source" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

Fill in the connection details. 
The "Host" field should not include the protocol (i.e. omit `http://` or `https://` part).<br/>
If you are using ClickHouse Cloud or your on-premise deployment has SSL enabled, type `require` in the "SSLMode" field.<br/>
"Timeout" field value is set in seconds and, if omitted, the default value is 30 seconds.

<img src={require('./images/powerbi_05.png').default} class="image" alt="Adding connection details" style={{width: '25%', 'background-color': 'transparent'}}/>
<br/>

Once this is finished, [download and install Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494).
On the Power BI Desktop start screen, click "Get Data".

<img src={require('./images/powerbi_06.png').default} class="image" alt="Getting started with Power BI Desktop" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Select "Other" -> "ODBC".

<img src={require('./images/powerbi_07.png').default} class="image" alt="Choosing the data source" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

Select your previously created data source from the list.

<img src={require('./images/powerbi_08.png').default} class="image" alt="Choosing the data source" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

If you specified all the credentials during the data source creation, it should connect straight away. 
Otherwise, you will be prompted to specify username and password. 

<img src={require('./images/powerbi_09.png').default} class="image" alt="Username and password prompt" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

Finally, you should see the databases and tables in the Navigator view. Select the desired table and click "Load" to import the data from ClickHouse.

<img src={require('./images/powerbi_10.png').default} class="image" alt="Navigator view" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

Once the import is complete, your ClickHouse Data should accessible in Power BI as usual.

:::note 
Unsigned integer types such as UInt64 or bigger won't be loaded into the dataset automatically, as Int64 is the maximum whole number type support by Power BI.<br/>
To import the data properly, before hitting the "Load" button in the Navigator, click "Transform Data" first.
:::

In this example, `pageviews` table has a UInt64 column, which is recognized as "Binary" by default. 
"Transform Data" opens Power Query Editor, where we can reassign the type of the column, setting it as, for example, Text.

<img src={require('./images/powerbi_11.png').default} class="image" alt="Navigator view" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

Once finished, click "Close & Apply" in the top left corner, and proceed with loading the data.