---
sidebar_label: ArcType
description: Arctype is the fast and easy-to-use SQL client for developers and teams.
---

# Connect Arctype to ClickHouse

Arctype has built-in support for ClickHouse, and the configuration is very simple.  If ClickHouse is not shown as one of the database types you will have to update Arctype.

## 1. Gather your ClickHouse details
To connect Arctype to ClickHouse; you will need this information about your ClickHouse deployment:
- endpoint
- port number
- username
- password

## 2. Download Arctype

Arctype is available at https://arctype.com/

## 3. Add a database

- Start Arctype and click **+ Add Connection**, and select ClickHouse:
<img src={require('./images/arctype-add-database.png').default} class="image" alt="Add a new database" />

- On the **Credentials** tab set the Host, Port, User, Password, and SSL Mode:
<img src={require('./images/arctype-set-creds-and-test.png').default} class="image" alt="Set endpoint, user, password, port" />

:::note
In this example the SSL Mode is set to `verify-full`.  If you are not using SSL, or using a self-signed cert you may have to choose a different setting or upload your certificate(s).
:::

- Test the connection and click **Save**.

## 4. Query ClickHouse

- You can select databases and then tables by clicking on the **Tables** icon in the left navigation, and then selecting the database and table.  You will see a tabular view of the selected table:
<img src={require('./images/arctype-table-view.png').default} class="image" alt="Select databases and tables" />

- The next choice in the left navigation is **Queries**.  After choosing Queries you can add a new query with the **Add Query** button, and then type your query in the query pane.  As you type Arctype will provide you with table and column names: 
<img src={require('./images/arctype-queries-builder.png').default} class="image" alt="Query the ClickHouse database using Arctype type ahead log" />

## Next Steps
See the [Arctype documentation](https://docs.arctype.com/) to learn about the capabilities of Arctype, and the [ClickHouse documentation](https://clickhouse.com/docs) to learn about the capabilities of ClickHouse.