---
sidebar_label: 'Looker Studio'
slug: /integrations/lookerstudio
keywords: ['clickhouse', 'looker', 'studio', 'connect', 'mysql', 'integrate', 'ui']
description: 'Looker Studio, formerly Google Data Studio, is an online tool for converting data into customizable informative reports and dashboards.'
title: 'Looker Studio'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
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
import PartnerBadge from '@theme/badges/PartnerBadge';

# Looker Studio

<PartnerBadge/>

Looker Studio can connect to ClickHouse via the MySQL interface using the official Google MySQL data source.

## ClickHouse Cloud setup {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## On-premise ClickHouse server setup {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Connecting Looker Studio to ClickHouse {#connecting-looker-studio-to-clickhouse}

First, login to https://lookerstudio.google.com using your Google account and create a new Data Source:

<Image size="md" img={looker_studio_01} alt="Creating a new data source in Looker Studio interface" border />
<br/>

Search for the official MySQL connector provided by Google (named just **MySQL**):

<Image size="md" img={looker_studio_02} alt="MySQL connector search in Looker Studio connectors list" border />
<br/>

Specify your connection details. Please note that MySQL interface port is 9004 by default,
and it might be different depending on your server configuration.

<Image size="md" img={looker_studio_03} alt="Specifying the ClickHouse MySQL connection details in Looker Studio" border />
<br/>

Now, you have two options on how to fetch the data from ClickHouse. First, you could use the Table Browser feature:

<Image size="md" img={looker_studio_04} alt="Using the Table Browser to select ClickHouse tables in Looker Studio" border />
<br/>

Alternatively, you could specify a custom query to fetch your data:

<Image size="md" img={looker_studio_05} alt="Using a custom SQL query to fetch data from ClickHouse in Looker Studio" border />
<br/>

Finally, you should be able to see the introspected table structure and adjust the data types if necessary.

<Image size="md" img={looker_studio_06} alt="Viewing the introspected ClickHouse table structure in Looker Studio" border />
<br/>

Now you can proceed with exploring your data or creating a new report!

## Using Looker Studio with ClickHouse Cloud {#using-looker-studio-with-clickhouse-cloud}

When using ClickHouse Cloud, you need to enable MySQL interface first. You can do that in connection dialog, "MySQL" tab.

<Image size="md" img={looker_studio_enable_mysql} alt="Enabling MySQL interface in ClickHouse Cloud settings" border />
<br/>

In the Looker Studio UI, choose the "Enable SSL" option. ClickHouse Cloud's SSL certificate is signed by [Let's Encrypt](https://letsencrypt.org/certificates/). You can download this root cert [here](https://letsencrypt.org/certs/isrgrootx1.pem).

<Image size="md" img={looker_studio_mysql_cloud} alt="Looker Studio connection configuration with ClickHouse Cloud SSL settings" border />
<br/>

The rest of the steps are the same as listed above in the previous section.
