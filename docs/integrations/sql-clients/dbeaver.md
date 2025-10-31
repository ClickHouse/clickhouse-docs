---
slug: /integrations/dbeaver
sidebar_label: 'DBeaver'
description: 'DBeaver is a multi-platform database tool.'
title: 'Connect DBeaver to ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
  - website: 'https://github.com/dbeaver/dbeaver'
keywords: ['DBeaver', 'database management', 'SQL client', 'JDBC connection', 'multi-platform']
---

import Image from '@theme/IdealImage';
import dbeaver_add_database from '@site/static/images/integrations/sql-clients/dbeaver-add-database.png';
import dbeaver_host_port from '@site/static/images/integrations/sql-clients/dbeaver-host-port.png';
import dbeaver_use_ssl from '@site/static/images/integrations/sql-clients/dbeaver-use-ssl.png';
import dbeaver_test_connection from '@site/static/images/integrations/sql-clients/dbeaver-test-connection.png';
import dbeaver_download_driver from '@site/static/images/integrations/sql-clients/dbeaver-download-driver.png';
import dbeaver_sql_editor from '@site/static/images/integrations/sql-clients/dbeaver-sql-editor.png';
import dbeaver_query_log_select from '@site/static/images/integrations/sql-clients/dbeaver-query-log-select.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Connect DBeaver to ClickHouse

<PartnerBadge/>

DBeaver is available in multiple offerings. In this guide [DBeaver Community](https://dbeaver.io/) is used. See the various offerings and capabilities [here](https://dbeaver.com/edition/).  DBeaver connects to ClickHouse using JDBC.

:::note
Please use DBeaver version 23.1.0 or above for improved support of `Nullable` columns in ClickHouse.
:::

## 1. Gather your ClickHouse details {#1-gather-your-clickhouse-details}

DBeaver uses JDBC over HTTP(S) to connect to ClickHouse; you need:

- endpoint
- port number
- username
- password

## 2. Download DBeaver {#2-download-dbeaver}

DBeaver is available at https://dbeaver.io/download/

## 3. Add a database {#3-add-a-database}

- Either use the **Database > New Database Connection** menu or the **New Database Connection** icon in the **Database Navigator** to bring up the **Connect to a database** dialog:

<Image img={dbeaver_add_database} size="md" border alt="Add a new database" />

- Select **Analytical** and then **ClickHouse**:

- Build the JDBC URL. On the **Main** tab set the Host, Port, Username, Password, and Database:

<Image img={dbeaver_host_port} size="md" border alt="Set the hostname, port, user, password, and database name" />

- By default the **SSL > Use SSL** property will be unset, if you are connecting to ClickHouse Cloud or a server that requires SSL on the HTTP port, then set **SSL > Use SSL** on:

<Image img={dbeaver_use_ssl} size="md" border alt="Enable SSL if required" />

- Test the connection:

<Image img={dbeaver_test_connection} size="md" border alt="Test the connection" />

If DBeaver detects that you do not have the ClickHouse driver installed it will offer to download them for you:

<Image img={dbeaver_download_driver} size="md" border alt="Download the ClickHouse driver" />

- After downloading the driver **Test** the connection again:

<Image img={dbeaver_test_connection} size="md" border alt="Test the connection" />

## 4. Query ClickHouse {#4-query-clickhouse}

Open a query editor and run a query.

- Right click on your connection and choose **SQL Editor > Open SQL Script** to open a query editor:

<Image img={dbeaver_sql_editor} size="md" border alt="Open the SQL editor" />

- An example query against `system.query_log`:

<Image img={dbeaver_query_log_select} size="md" border alt="A sample query" />

## Next steps {#next-steps}

See the [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki) to learn about the capabilities of DBeaver, and the [ClickHouse documentation](https://clickhouse.com/docs) to learn about the capabilities of ClickHouse.
