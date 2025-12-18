---
description: 'Documentation for the ClickHouse ODBC driver'
sidebar_label: 'ODBC Driver'
sidebar_position: 35
slug: /interfaces/odbc
title: 'ODBC Driver'
doc_type: 'reference'
---

# ODBC driver

The ClickHouse ODBC driver provides a standards-compliant interface for connecting ODBC-compatible applications to
ClickHouse. It implements the ODBC API and enables applications, BI tools, and scripting environments to execute SQL
queries, retrieve results, and interact with ClickHouse through familiar mechanisms.

The driver communicates with the ClickHouse server using the [HTTP protocol](/interfaces/http), which is the primary
protocol supported across all ClickHouse deployments. This allows the driver to operate consistently in diverse
environments, including local installations, cloud-managed services, and environments where only HTTP-based access is
available.

The source code of the driver is available in the [ClickHouse-ODBC GitHub Repository](
https://github.com/ClickHouse/clickhouse-odbc).

:::note
For better compatibility we strongly recommend to update your ClickHouse server to version 24.11 or later.
:::

:::note
This driver is under active development. Some ODBC features may not yet be fully implemented. The current version
focuses on providing essential connectivity and core ODBC functionality, with additional features planned for future
releases.

Your feedback is highly valuable and helps guide the prioritization of new features and improvements. If you encounter
limitations, missing functionality, or unexpected behavior, please share your observations or feature requests through
the issue tracker at https://github.com/ClickHouse/clickhouse-odbc/issues
:::

## Installation on Windows {#installation-on-windows}
You can find the latest version of the driver at https://github.com/ClickHouse/clickhouse-odbc/releases/latest. 
From there you can download and execute the MSI installer and follow simple installation steps.

## Testing {#testing}

You can test the driver by running this simple PowerShell script. Copy the text below, set your URL, user, password and
paste the text into your PowerShell command prompt — after running $reader.GetValue(0)it should show your ClickHouse
server version.

```powershell
$url = "http://127.0.0.1:8123/"
$user = "default"
$password = ""
$conn = New-Object System.Data.Odbc.OdbcConnection("`
    Driver={ClickHouse ODBC Driver (Unicode)};`
    Url=$url;`
    Username=$username;`
    Password=$password")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "select version()"
$reader = $cmd.ExecuteReader()
$reader.Read()
$reader.GetValue(0)
$reader.Close()
$conn.Close()
```

## Configuration parameters {#configuration-parameters}

The parameters below represent the most commonly used settings for establishing a connection with the ClickHouse ODBC
driver. They cover essential authentication, connection behavior, and data-handling options. A full list of supported
parameters is available in the project’s GitHub page https://github.com/ClickHouse/clickhouse-odbc.

- `Url` Specifies the full HTTP(S) endpoint of the ClickHouse server. This includes the protocol, host, port, and
  optional path.
- `Username` The username used for authentication with the ClickHouse server.
- `Password` The password associated with the specified username. If not provided, the driver connects without password
  authentication.
- `Database` The default database to use for the connection.
- `Timeout` The maximum time (in seconds) the driver waits for a server response before aborting the request.
- `ClientName` A custom identifier sent to the ClickHouse server as part of the client metadata. Useful for tracing or
  distinguishing traffic from different applications. This parameter will be a part of the User-Agent header in the HTTP
  requests produced by the driver.
- `Compression` Enables or disables HTTP compression for request and response payloads. When enabled, it can reduce
  bandwidth usage and improve performance for large result sets.

Here are some examples of the full connection string passed to the driver to setup a connection.

- A ClickHouse server locally installed on WSL instance
```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=http://localhost:8123//;Username=default
```
- A ClickHouse Cloud instance.
```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=https://you-instance-url.gcp.clickhouse.cloud:8443/;Username=default;Password=your-password
```

## Microsoft Power BI Integration {#powerbi-Integration}
You can use the ODBC driver to connect Microsoft Power BI to a ClickHouse server. Power BI provides two connection
options: the generic ODBC connector and the ClickHouse connector, both included in standard Power BI installations.

Both connectors rely on ODBC internally, but they differ in capabilities:

- ClickHouse Connector (recommended)
  Uses ODBC under the hood but supports DirectQuery mode. In this mode, Power BI automatically generates SQL queries and
  retrieves only the data required for each visualization or filter operation.

- ODBC Connector
  Supports only Import mode. Power BI executes the user-provided query (or selects the entire table) and imports the
  full result set into Power BI. Subsequent refreshes re-import the entire dataset.

Choose the connector based on your use case: DirectQuery for interactive dashboards with large datasets, or Import mode
when you need full local copies of the data.

For more information on integrating Microsoft Power BI with ClickHouse, see the [ClickHouse documentation page on Power
BI integration](http://localhost:3000/docs/integrations/powerbi).
