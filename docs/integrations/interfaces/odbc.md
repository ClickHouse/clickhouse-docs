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

:::tip
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
parameters is available in the project's GitHub page https://github.com/ClickHouse/clickhouse-odbc.

- `Url`: Specifies the full HTTP(S) endpoint of the ClickHouse server. This includes the protocol, host, port, and
  optional path.
- `Username`: The username used for authentication with the ClickHouse server.
- `Password`: The password associated with the specified username. If not provided, the driver connects without password
  authentication.
- `Database`: The default database to use for the connection.
- `Timeout`: The maximum time (in seconds) the driver waits for a server response before aborting the request.
- `ClientName`: A custom identifier sent to the ClickHouse server as part of the client metadata. Useful for tracing or
  distinguishing traffic from different applications. This parameter will be a part of the User-Agent header in the HTTP
  requests produced by the driver.
- `Compression`: Enables or disables HTTP compression for request and response payloads. When enabled, it can reduce
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

## ClickHouse settings used by the ODBC driver {#odbc-query-settings}

ClickHouse has its own unique SQL dialect, and in some cases it behaves differently from other databases such as MS SQL
Server, MySQL, or PostgreSQL. In most cases, these differences are an advantage, as they introduce improved syntax that
makes it easier to use ClickHouse features.

However, the ODBC driver is often used in environments where queries are generated by third-party tools, such as Power
BI, rather than written by the user. These queries usually rely on a minimal subset of the SQL standard. In such cases,
ClickHouse's deviations from the SQL standard may not work as expected and can produce unexpected results or errors. To
ensure that ClickHouse processes queries from the ODBC driver as closely as possible to other databases and the SQL
standard, the ODBC driver enables certain settings that modify how ClickHouse handles queries.

In most cases, this should not cause any problems. However, users who write queries manually should be aware of the
settings enabled by the ODBC driver. Additionally, users with the `readonly` setting set to `1` cannot change any
settings, even for `SELECT` queries, so running the ODBC driver with such users will result in an error.

## Making ODBC-enabled settings work for read-only users {#readonly-users}

When connecting to ClickHouse through ODBC driver with a user that has the `readonly` setting set to `1`, the driver's
attempt to set other query settings will result in an error:

```plaintext
Code: 164. DB::Exception: Cannot modify 'cast_keep_nullable' setting in readonly mode. (READONLY)
```

This happens because users in read-only mode are not allowed to change settings, even for individual `SELECT` queries.
There are several ways to fix this.

**Option 1. Setting `readonly` to `2`**

This is the simplest option. Setting `readonly` to `2` allows changing settings while keeping the user in read-only
mode.

```sql
ALTER USER your_odbc_user MODIFY SETTING
    readonly = 2
```

In most cases, setting `readonly` to `2` is the easiest and recommended way to solve this problem. If that does not work
for you, use one of the options below.

**Option 2. Changing user settings to match the settings set by the ODBC driver.**

This is also straightforward: update the user settings so they already match what the ODBC driver tries to set.

```sql
ALTER USER your_odbc_user MODIFY SETTING
    cast_keep_nullable = 1,
    prefer_column_name_to_alias = 1
```

With this change, the ODBC driver can still attempt to apply the settings, but because the values already match, no
effective change is made and the error is avoided.

This option is also simple, but it requires maintenance: newer driver versions may change the list of settings or add
new ones for compatibility. If you hard-code these settings on your ODBC user, you may need to update them whenever the
ODBC driver starts applying additional settings.

### ClickHouse settings modified by the ODBC driver {#odbc-query-settings-list}

This section describes which settings the ODBC driver modifies and why.

**[cast_keep_nullable](https://clickhouse.com/docs/operations/settings/settings#cast_keep_nullable)**

By default, ClickHouse does not allow converting nullable types to non-nullable types. However, many BI tools do not
distinguish between nullable and non-nullable types when performing type conversions. As a result, it is not uncommon to
see queries like the following generated by BI tools:

```sql
SELECT sum(CAST(value, 'Int32'))
FROM values
```

By default, when the `value` column is nullable, this query will fail with the message:

```plaintext
DB::Exception: Cannot convert NULL value to non-Nullable type: while executing 'FUNCTION CAST(__table1.value :: 2,
'Int32'_String :: 1) -> CAST(__table1.value, 'Int32'_String) Int32 : 0'. (CANNOT_INSERT_NULL_IN_ORDINARY_COLUMN)
```

Enabling `cast_keep_nullable` changes the behavior of `CAST` so it preserves the nullability of its arguments. This
makes ClickHouse's behavior closer to other databases and the SQL standard for this kind of conversion.

**[prefer_column_name_to_alias](https://clickhouse.com/docs/operations/settings/settings#prefer_column_name_to_alias)**

ClickHouse allows referencing expressions in the same `SELECT` list by their aliases. For example, this query avoids
repetition and is easier to write:

```sql
SELECT
    sum(value) AS S,
    count() AS C,
    S / C
FROM test
```

This feature is widely used, but other databases typically do not resolve aliases this way in the same `SELECT` list,
and such queries would error. Problems are most visible when an alias has the same name as a column. For example:

```sql
SELECT
    sum(value) AS value,
    avg(value)
FROM test
```

Which `value` should `avg(value)` aggregate? By default, ClickHouse prefers the alias, effectively turning this into a
nested aggregate, which is not what most tools expect.

On its own this is rarely an issue, but some BI tools generate queries with subqueries that reuse column aliases. For
example, Power BI often generates queries similar to the following:

```sql
SELECT
    sum(C1) AS C1,
    count(C1) AS C2
FROM
(
    SELECT sum(value) AS C1
    FROM test
    GROUP BY group_index
) AS TBL
```

References to `C1` can produce the following error:

```plaintext
Code: 184. DB::Exception: Received from localhost:9000. DB::Exception: Aggregate function sum(C1) AS C1 is found
inside another aggregate function in query. (ILLEGAL_AGGREGATION)
```

Other databases typically don't resolve aliases at the same level this way and instead treat `C1` as a column from the
subquery. To preserve similar behavior in ClickHouse and allow such queries to run without errors, the ODBC driver
enables `prefer_column_name_to_alias`.
