---
sidebar_label: 'Vector'
sidebar_position: 220
slug: /integrations/vector
description: 'How to tail a log file into ClickHouse using Vector'
title: 'Integrating Vector with ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://vector.dev/'
keywords: ['vector', 'log collection', 'observability', 'data ingestion', 'pipeline']
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Integrating Vector with ClickHouse

<PartnerBadge/>

Being able to analyze your logs in real time is critical for production applications.
ClickHouse excels at storing and analyzing log data due to it's excellent compression (up to [170x](https://clickhouse.com/blog/log-compression-170x) for logs)
and ability to aggregate large amounts of data quickly.

This guide shows you how to use the popular data pipeline [Vector](https://vector.dev/docs/about/what-is-vector/) to tail an Nginx log file and send it to ClickHouse.
The steps below are similar for tailing any type of log file.

**Prerequisites:**
- You already have ClickHouse up and running
- You have Vector installed

<VerticalStepper headerLevel="h2">

## Create a database and table {#1-create-a-database-and-table}

Define a table to store the log events:

1. Begin with a new database named `nginxdb`:

```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. Insert the entire log event as a single string. Obviously this is not a great format for performing analytics on the log data, but we will figure that part out below using ***materialized views***.

```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
  message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```

:::note
**ORDER BY** is set to **tuple()** (an empty tuple) as there is no need for a primary key yet.
:::

## Configure Nginx {#2--configure-nginx}

In this step, you will be shown how to get Nginx logging configured.

1. The following `access_log` property sends logs to `/var/log/nginx/my_access.log` in the **combined** format.
This value goes in the `http` section of your `nginx.conf` file:
    
```bash
http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  access_log  /var/log/nginx/my_access.log combined;
  sendfile        on;
  keepalive_timeout  65;
  include /etc/nginx/conf.d/*.conf;
}
```

2. Be sure to restart Nginx if you had to modify `nginx.conf`.

3. Generate some log events in the access log by visiting pages on your web server.
Logs in the **combined** format look as follows:

 ```bash
 192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
 192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
 192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
 ```

## Configure Vector {#3-configure-vector}

Vector collects, transforms and routes logs, metrics, and traces (referred to as **sources**) to many different vendors (referred to as **sinks**), including out-of-the-box compatibility with ClickHouse.
Sources and sinks are defined in a configuration file named **vector.toml**.

1. The following **vector.toml** file defines a **source** of type **file** that tails the end of **my_access.log**, and it also defines a **sink** as the **access_logs** table defined above:

```bash
[sources.nginx_logs]
type = "file"
include = [ "/var/log/nginx/my_access.log" ]
read_from = "end"

[sinks.clickhouse]
type = "clickhouse"
inputs = ["nginx_logs"]
endpoint = "http://clickhouse-server:8123"
database = "nginxdb"
table = "access_logs"
skip_unknown_fields = true
```

2. Start Vector using the configuration above. Visit the Vector [documentation](https://vector.dev/docs/) for more details on defining sources and sinks.

3. Verify that the access logs are being inserted into ClickHouse by running the following query. You should see the access logs in your table:

```sql
SELECT * FROM nginxdb.access_logs
```

<Image img={vector01} size="lg" border alt="View ClickHouse logs in table format" />

## Parse the Logs {#4-parse-the-logs}

Having the logs in ClickHouse is great, but storing each event as a single string does not allow for much data analysis.
We'll next look at how to parse the log events using a [materialized view](/materialized-view/incremental-materialized-view).

A **materialized view** functions similarly to an insert trigger in SQL. When rows of data are inserted into a source table, the materialized view makes some transformation of these rows and inserts the results into a target table.
The materialized view can be configured to configure a parsed representation of the log events in **access_logs**.
An example of one such log event is shown below:

```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

There are various functions in ClickHouse to parse the above string. The [`splitByWhitespace`](/sql-reference/functions/splitting-merging-functions#splitByWhitespace) function parses a string by whitespace and returns each token in an array.
To demonstrate, run the following command:

```sql title="Query"
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

```text title="Response"
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

A few of the strings have some extra characters, and the user agent (the browser details) did not need to be parsed, but
the resulting array is close to what is needed.

Similar to `splitByWhitespace`, the [`splitByRegexp`](/sql-reference/functions/splitting-merging-functions#splitByRegexp) function splits a string into an array based on a regular expression.
Run the following command, which returns two strings.

```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

Notice that the second string returned is the user agent successfully parsed from the log:

```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

Before looking at the final `CREATE MATERIALIZED VIEW` command, let's view a couple more functions used to clean up the data.
For example, the value of `RequestMethod` is `"GET` containing an unwanted double-quote.
You can use the [`trimBoth` (alias `trim`)](/sql-reference/functions/string-functions#trimBoth) function to remove the double quote:

```sql
SELECT trim(LEADING '"' FROM '"GET')
```

The time string has a leading square bracket, and is also not in a format that ClickHouse can parse into a date.
However, if we change the separator from a colon (**:**) to a comma (**,**) then the parsing works great:

```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```

We are now ready to define the materialized view.
The definition below includes `POPULATE`, which means the existing rows in **access_logs** will be processed and inserted right away.
Run the following SQL statement:

```sql
CREATE MATERIALIZED VIEW nginxdb.access_logs_view
(
  RemoteAddr String,
  Client String,
  RemoteUser String,
  TimeLocal DateTime,
  RequestMethod String,
  Request String,
  HttpVersion String,
  Status Int32,
  BytesSent Int64,
  UserAgent String
)
ENGINE = MergeTree()
ORDER BY RemoteAddr
POPULATE AS
WITH
  splitByWhitespace(message) as split,
  splitByRegexp('\S \d+ "([^"]*)"', message) as referer
SELECT
  split[1] AS RemoteAddr,
  split[2] AS Client,
  split[3] AS RemoteUser,
  parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM split[4]), ':', ' ')) AS TimeLocal,
  trim(LEADING '"' FROM split[6]) AS RequestMethod,
  split[7] AS Request,
  trim(TRAILING '"' FROM split[8]) AS HttpVersion,
  split[9] AS Status,
  split[10] AS BytesSent,
  trim(BOTH '"' from referer[2]) AS UserAgent
FROM
  (SELECT message FROM nginxdb.access_logs)
```

Now verify it worked.
You should see the access logs nicely parsed into columns:

```sql
SELECT * FROM nginxdb.access_logs_view
```

<Image img={vector02} size="lg" border alt="View parsed ClickHouse logs in table format" />

:::note
The lesson above stored the data in two tables, but you could change the initial `nginxdb.access_logs` table to use the [`Null`](/engines/table-engines/special/null) table engine.
The parsed data will still end up in the `nginxdb.access_logs_view` table, but the raw data will not be stored in a table.
:::

</VerticalStepper>

> By using Vector, which only requires a simple install and quick configuration, you can send logs from an Nginx server to a table in ClickHouse. By using a materialized view, you can parse those logs into columns for easier analytics.
