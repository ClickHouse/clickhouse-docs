---
sidebar_label: Looker Studio
slug: /integrations/lookerstudio
keywords: [clickhouse, looker, studio, connect, mysql, integrate, ui]
description: Looker Studio, formerly Google Data Studio, is an online tool for converting data into customizable informative reports and dashboards.
---

import MySQLCloudSetup from '@site/docs/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import looker_studio_01 from '@site/static/images/integrations/data-visualization/looker_studio_01.png';
import looker_studio_02 from '@site/static/images/integrations/data-visualization/looker_studio_02.png';
import looker_studio_03 from '@site/static/images/integrations/data-visualization/looker_studio_03.png';
import looker_studio_04 from '@site/static/images/integrations/data-visualization/looker_studio_04.png';
import looker_studio_05 from '@site/static/images/integrations/data-visualization/looker_studio_05.png';
import looker_studio_06 from '@site/static/images/integrations/data-visualization/looker_studio_06.png';
import looker_studio_enable_mysql from '@site/static/images/integrations/data-visualization/looker_studio_enable_mysql.png';
import looker_studio_mysql_cloud from '@site/static/images/integrations/data-visualization/looker_studio_mysql_cloud.png';

# Looker Studio

Looker Studio can connect to ClickHouse via the MySQL interface using the official Google MySQL data source.

## ClickHouse Cloud Setup {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## On-premise ClickHouse Server Setup {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Connecting Looker Studio to ClickHouse {#connecting-looker-studio-to-clickhouse}

First, login to https://lookerstudio.google.com using your Google account and create a new Data Source:

<img src={looker_studio_01} class="image" alt="Creating a new data source" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Search for the official MySQL connector provided by Google (named just **MySQL**):

<img src={looker_studio_02} class="image" alt="MySQL connector search" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Specify your connection details. Please note that MySQL interface port is 9004 by default, 
and it might be different depending on your server configuration.

<img src={looker_studio_03} class="image" alt="Specifying the connection details" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Now, you have two options on how to fetch the data from ClickHouse. First, you could use the Table Browser feature:

<img src={looker_studio_04} class="image" alt="Using the Table Browser" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Alternatively, you could specify a custom query to fetch your data:

<img src={looker_studio_05} class="image" alt="Using a custom query to fetch the data" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Finally, you should be able to see the introspected table structure and adjust the data types if necessary. 

<img src={looker_studio_06} class="image" alt="Viewing the introspected table structure" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Now you can proceed with exploring your data or creating a new report! 

## Using Looker Studio with ClickHouse Cloud {#using-looker-studio-with-clickhouse-cloud}

When using ClickHouse Cloud, you need to enable MySQL interface first. You can do that in connection dialog, "MySQL" tab.

<img src={looker_studio_enable_mysql} class="image" alt="Looker Studio Require MySQL enabled first" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

In the Looker Studio UI, choose the "Enable SSL" option. ClickHouse Cloud's SSL certificate is signed by [Let's Encrypt](https://letsencrypt.org/certificates/). You can download this root cert [here](https://letsencrypt.org/certs/isrgrootx1.pem).

<img src={looker_studio_mysql_cloud} class="image" alt="Looker Studio with ClickHouse Cloud SSL Config" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

The rest of the steps are the same as listed above in the previous section.
