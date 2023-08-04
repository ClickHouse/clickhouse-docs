---
sidebar_label: QuickSight
slug: /en/integrations/quicksight
keywords: [clickhouse, aws, amazon, quicksight, connect, integrate, ui]
description: Amazon QuickSight powers data-driven organizations with unified business intelligence (BI) at hyperscale.
---

# QuickSight

QuickSight can connect to on-premise ClickHouse via MySQL interface using the official MySQL data source.

:::note
Currently, it is not possible to connect QuickSight to [ClickHouse Cloud](https://clickhouse.com/cloud).
:::

## On-premise ClickHouse server setup

Please refer to [the official documentation](https://clickhouse.com/docs/en/interfaces/mysql)
on how to set up a ClickHouse server with enabled MySQL interface.

Aside from adding an entry to the server's `config.xml`

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

it is also _required_ to use
[Double SHA1 password encryption](https://clickhouse.com/docs/en/operations/settings/settings-users#user-namepassword)
for the user that will be using MySQL interface.

Generating a random password encrypted with Double SHA1 from the shell:

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

The output should look like the following:

```
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

Once the configuration is done, QuickSight should be able to connect to ClickHouse via MySQL interface.

If you have the `mysql` binary available, you can test the connection from the commandline.
Using the sample username (`mysql_user`) and password (`LZOQYnqQN4L/T6L0`) from above the command line would be:

```bash
mysql --protocol tcp -h localhost -u mysql_user -P 9004 --password=LZOQYnqQN4L/T6L0
```

```
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

## Connecting QuickSight to ClickHouse

First of all, go to https://quicksight.aws.amazon.com, navigate to Datasets and click "New dataset":

<img src={require('./images/quicksight_01.png').default} class="image" alt="Creating a new dataset" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Search for the official MySQL connector bundled with QuickSight (named just **MySQL**):

<img src={require('./images/quicksight_02.png').default} class="image" alt="MySQL connector search" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Specify your connection details. Please note that MySQL interface port is 9004 by default,
and it might be different depending on your server configuration.

<img src={require('./images/quicksight_03.png').default} class="image" alt="Specifying the connection details" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Now, you have two options on how to fetch the data from ClickHouse. First, you could select a table from the list:

<img src={require('./images/quicksight_04.png').default} class="image" alt="Selecting a table from the list" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Alternatively, you could specify a custom SQL to fetch your data:

<img src={require('./images/quicksight_05.png').default} class="image" alt="Using custom SQL to fetch the data" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

By clicking "Edit/Preview data", you should be able to see the introspected table structure or adjust your custom SQL, if that's how you decided to access the data:

<img src={require('./images/quicksight_06.png').default} class="image" alt="Viewing the introspected table structure" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Now you can proceed with publishing your dataset and creating a new visualization! 