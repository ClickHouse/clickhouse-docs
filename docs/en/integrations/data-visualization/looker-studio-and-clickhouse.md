---
sidebar_label: Looker Studio
slug: /en/integrations/lookerstudio
keywords: [clickhouse, looker, studio, connect, mysql, integrate, ui]
description: Looker Studio, formerly Google Data Studio, is an online tool for converting data into customizable informative reports and dashboards.
---

import MySQLCloudSetup from '@site/docs/en/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/en/_snippets/_clickhouse_mysql_on_premise_setup.mdx';

# Looker Studio

Looker Studio can connect to ClickHouse via the MySQL interface using the official Google MySQL data source.

## ClickHouse Cloud Setup
<MySQLCloudSetup />

## On-premise ClickHouse Server Setup
<MySQLOnPremiseSetup />

## Connecting Looker Studio to ClickHouse

First, login to https://lookerstudio.google.com using your Google account and create a new Data Source:

<img src={require('./images/looker_studio_01.png').default} class="image" alt="Creating a new data source" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Search for the official MySQL connector provided by Google (named just **MySQL**):

<img src={require('./images/looker_studio_02.png').default} class="image" alt="MySQL connector search" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Specify your connection details. Please note that MySQL interface port is 9004 by default, 
and it might be different depending on your server configuration.

<img src={require('./images/looker_studio_03.png').default} class="image" alt="Specifying the connection details" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Now, you have two options on how to fetch the data from ClickHouse. First, you could use the Table Browser feature:

<img src={require('./images/looker_studio_04.png').default} class="image" alt="Using the Table Browser" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Alternatively, you could specify a custom query to fetch your data:

<img src={require('./images/looker_studio_05.png').default} class="image" alt="Using a custom query to fetch the data" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Finally, you should be able to see the introspected table structure and adjust the data types if necessary. 

<img src={require('./images/looker_studio_06.png').default} class="image" alt="Viewing the introspected table structure" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Now you can proceed with exploring your data or creating a new report! 

## Using Looker Studio with ClickHouse Cloud

When using ClickHouse Cloud, you need to enable MySQL interface first. You can do that in connection dialog, "MySQL" tab.

<img src={require('./images/looker_studio_enable_mysql.png').default} class="image" alt="Looker Studio Require MySQL enabled first" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

In the Looker Studio UI, choose the "Enable SSL" option. ClickHouse Cloud's SSL certificate is signed by [LetsEncrypt](https://letsencrypt.org/certificates/). You can download this root cert [here](https://letsencrypt.org/certs/isrgrootx1.pem).

<img src={require('./images/looker_studio_mysql_cloud.png').default} class="image" alt="Looker Studio with ClickHouse Cloud SSL Config" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

The rest of the steps are the same as listed above in the previous section.
