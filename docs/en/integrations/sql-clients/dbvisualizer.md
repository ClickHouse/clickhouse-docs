---
sidebar_label: DbVisualizer
slug: /en/integrations/dbvisualizer
description: DbVisualizer is a database tool with extended support for ClickHouse.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Connecting DbVisualizer to ClickHouse

## Start or download DbVisualizer

DbVisualizer is available at https://www.dbvis.com/download/

## 1. Gather your connection details

<ConnectionDetails />

## 2. Built-in JDBC driver management

DbVisualizer has the most up-to-date JDBC drivers for ClickHouse included. It has full JDBC driver management built right in that points to the latest releases as well as historical versions for the drivers.

![](@site/docs/en/integrations/sql-clients/images/dbvisualizer-driver-manager.png)

## 3. Connect to ClickHouse

To connect a database with DbVisualizer, you must first create and setup a Database Connection. 

1. Create a new connection from **Database->Create Database Connection** and select a driver for your database from the popup menu.

2. An **Object View** tab for the new connection is opened.

3. Enter a name for the connection in the **Name** field, and optionally enter a description of the connection in the **Notes** field.

4. Leave the **Database Type** as **Auto Detect**.

5. If the selected driver in **Driver Type** is marked with a green checkmark then it is ready to use. If it is not marked with a green checkmark, you may have to configure the driver in the **Driver Manager**.

6. Enter information about the database server in the remaining fields.

7. Verify that a network connection can be established to the specified address and port by clicking the **Ping Server** button.

8. If the result from Ping Server shows that the server can be reached, click **Connect** to connect to the database server.

:::tip
See [Fixing Connection Issues](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues) for some tips if you have problems connecting to the database.

## Learn more

Find more information about DbVisualizer visit the [DbVisualizer documentation](https://confluence.dbvis.com/display/UG231/Users+Guide).