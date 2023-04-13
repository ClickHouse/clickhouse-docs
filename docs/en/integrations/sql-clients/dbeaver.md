---
slug: /en/integrations/dbeaver
sidebar_label: DBeaver
description: DBeaver is a multi-platform database tool.
---

# Connect DBeaver to ClickHouse

DBeaver is available in multiple offerings.  In this guide [DBeaver Community](https://dbeaver.io/) is used.  See the various offerings and capabilities [here](https://dbeaver.com/edition/).  DBeaver will
connect to ClickHouse using JDBC.

## 1. Gather your ClickHouse details
DBeaver uses JDBC over HTTP(S) to connect to ClickHouse; you will need:
- endpoint
- port number
- username
- password

## 2. Download DBeaver

DBeaver is available at https://dbeaver.io/download/

## 3. Add a database

- Either use the **Database > New Database Connection** menu or the **New Database Connection** icon in the **Database Navigator** to bring up the **Connect to a database** dialog:
<img src={require('./images/dbeaver-add-database.png').default} class="image" alt="Add a new database" />

- Select ClickHouse, this will add the ClickHouse JDBC driver to DBeaver:
<img src={require('./images/dbeaver-connect-to-a-database.png').default} class="image" alt="Select ClickHouse as a new database" />

- By default the **Driver properties > SSL** will be set to `false`, if you are connecting to a ClickHouse server that requires SSL on the HTTP port, then set **Driver properties > SSL** to `true`:
<img src={require('./images/dbeaver-set-ssl-true.png').default} class="image" alt="Set SSL as true or false" />

- Build the JDBC URL. On the **Main** tab set the Host, Port, Username, and Password:
<img src={require('./images/dbeaver-endpoint-details-test.png').default} class="image" alt="Set endpoint, user, password, port" />

- Test the connection and click **Finish**.

## 4. Query ClickHouse
Open a query editor and run a query.

- Right click on your connection and choose **SQL Editor > Open SQL Script** to open a query editor:
<img src={require('./images/dbeaver-sql-editor.png').default} class="image" alt="Open a SQL Script connected to ClickHouse" />

- An example query against `system.query_log`:
<img src={require('./images/dbeaver-query-log-select.png').default} class="image" alt="Query the system log" />

## Next Steps
See the [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki) to learn about the capabilities of DBeaver, and the [ClickHouse documentation](https://clickhouse.com/docs) to learn about the capabilities of ClickHouse.