---
sidebar_label: 'QuickSight'
slug: /integrations/quicksight
keywords: ['clickhouse', 'aws', 'amazon', 'QuickSight', 'mysql', 'connect', 'integrate', 'ui']
description: 'Amazon QuickSight powers data-driven organizations with unified business intelligence (BI).'
title: 'QuickSight'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import quicksight_01 from '@site/static/images/integrations/data-visualization/quicksight_01.png';
import quicksight_02 from '@site/static/images/integrations/data-visualization/quicksight_02.png';
import quicksight_03 from '@site/static/images/integrations/data-visualization/quicksight_03.png';
import quicksight_04 from '@site/static/images/integrations/data-visualization/quicksight_04.png';
import quicksight_05 from '@site/static/images/integrations/data-visualization/quicksight_05.png';
import quicksight_06 from '@site/static/images/integrations/data-visualization/quicksight_06.png';
import quicksight_07 from '@site/static/images/integrations/data-visualization/quicksight_07.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# QuickSight

<ClickHouseSupportedBadge/>

QuickSight can connect to on-premise ClickHouse setup (23.11+) via MySQL interface using the official MySQL data source and Direct Query mode.

## On-premise ClickHouse server setup {#on-premise-clickhouse-server-setup}

Please refer to [the official documentation](/interfaces/mysql) on how to set up a ClickHouse server with enabled MySQL interface.

Aside from adding an entry to the server's `config.xml`

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

it is also _required_ to use [Double SHA1 password encryption](/operations/settings/settings-users#user-namepassword) for the user that will be using MySQL interface.

Generating a random password encrypted with Double SHA1 from the shell:

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

The output should look like the following:

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

The first line is the generated password, and the second line is the hash we could use to configure ClickHouse.

Here is an example configuration for `mysql_user` that uses the generated hash:

`/etc/clickhouse-server/users.d/mysql_user.xml`

```xml
<users>
    <mysql_user>
        <password_double_sha1_hex>fbc958cc745a82188a51f30de69eebfc67c40ee4</password_double_sha1_hex>
        <networks>
            <ip>::/0</ip>
        </networks>
        <profile>default</profile>
        <quota>default</quota>
    </mysql_user>
</users>
```

Replace `password_double_sha1_hex` entry with your own generated Double SHA1 hash.

QuickSight requires several additional settings in the MySQL user's profile.

`/etc/clickhouse-server/users.d/mysql_user.xml`

```xml
<profiles>
    <default>
        <prefer_column_name_to_alias>1</prefer_column_name_to_alias>
        <mysql_map_string_to_text_in_show_columns>1</mysql_map_string_to_text_in_show_columns>
        <mysql_map_fixed_string_to_text_in_show_columns>1</mysql_map_fixed_string_to_text_in_show_columns>
    </default>
</profiles>
```

However, it is recommended to assign it to a different profile that can be used by your MySQL user instead of the default one.

Finally, configure the Clickhouse Server to listen on the desired IP address(es).
In `config.xml`, uncomment out the following to listen on all addresses:

```bash
<listen_host>::</listen_host>
```

If you have the `mysql` binary available, you can test the connection from the command line.
Using the sample username (`mysql_user`) and password (`LZOQYnqQN4L/T6L0`) from above the command line would be:

```bash
mysql --protocol tcp -h localhost -u mysql_user -P 9004 --password=LZOQYnqQN4L/T6L0
```

```response
mysql> show databases;
+--------------------+
| name               |
+--------------------+
| INFORMATION_SCHEMA |
| default            |
| information_schema |
| system             |
+--------------------+
4 rows in set (0.00 sec)
Read 4 rows, 603.00 B in 0.00156 sec., 2564 rows/sec., 377.48 KiB/sec.
```

## Connecting QuickSight to ClickHouse {#connecting-quicksight-to-clickhouse}

First of all, go to [https://quicksight.aws.amazon.com](https://quicksight.aws.amazon.com), navigate to Datasets and click "New dataset":

<Image size="md" img={quicksight_01} alt="Amazon QuickSight dashboard showing the New dataset button in Datasets section" border />
<br/>

Search for the official MySQL connector bundled with QuickSight (named just **MySQL**):

<Image size="md" img={quicksight_02} alt="QuickSight data source selection screen with MySQL highlighted in search results" border />
<br/>

Specify your connection details. Please note that MySQL interface port is 9004 by default,
and it might be different depending on your server configuration.

<Image size="md" img={quicksight_03} alt="QuickSight MySQL connection configuration form with hostname, port, database and credential fields" border />
<br/>

Now, you have two options on how to fetch the data from ClickHouse. First, you could select a table from the list:

<Image size="md" img={quicksight_04} alt="QuickSight table selection interface showing database tables available from ClickHouse" border />
<br/>

Alternatively, you could specify a custom SQL to fetch your data:

<Image size="md" img={quicksight_05} alt="QuickSight custom SQL query editor for fetching data from ClickHouse" border />
<br/>

By clicking "Edit/Preview data", you should be able to see the introspected table structure or adjust your custom SQL, if that's how you decided to access the data:

<Image size="md" img={quicksight_06} alt="QuickSight data preview showing table structure with columns and sample data" border />
<br/>

Make sure you have "Direct Query" mode selected in the bottom left corner of the UI:

<Image size="md" img={quicksight_07} alt="QuickSight interface with Direct Query mode option highlighted in bottom corner" border />
<br/>

Now you can proceed with publishing your dataset and creating a new visualization!

## Known limitations {#known-limitations}

- SPICE import doesn't work as expected; please use Direct Query mode instead. See [#58553](https://github.com/ClickHouse/ClickHouse/issues/58553).
