---
slug: /sql-reference/statements/create/dictionary/sources/odbc
title: 'ODBC 字典源'
sidebar_position: 6
sidebar_label: 'ODBC'
description: '将 ODBC 连接配置为 ClickHouse 中的字典源。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

你可以使用这种方法连接任何具有 ODBC 驱动的数据库。

设置示例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(ODBC(
        db 'DatabaseName'
        table 'SchemaName.TableName'
        connection_string 'DSN=some_parameters'
        invalidate_query 'SQL_QUERY'
        query 'SELECT id, value_1, value_2 FROM db_name.table_name'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <odbc>
            <db>DatabaseName</db>
            <table>ShemaName.TableName</table>
            <connection_string>DSN=some_parameters</connection_string>
            <invalidate_query>SQL_QUERY</invalidate_query>
            <query>SELECT id, value_1, value_2 FROM ShemaName.TableName</query>
        </odbc>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

设置字段说明：

| Setting                | Description                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `db`                   | 数据库名称。如果在 `<connection_string>` 参数中已经设置了数据库名称，则可以省略。                                                                          |
| `table`                | 表名，以及（如存在）对应的 schema 名称。                                                                                                      |
| `connection_string`    | 连接字符串。                                                                                                                        |
| `invalidate_query`     | 用于检查字典状态的查询。可选。详情参见 [Refreshing dictionary data using LIFETIME](../lifetime.md#refreshing-dictionary-data-using-lifetime) 一节。 |
| `background_reconnect` | 当连接失败时，在后台重新连接到副本。可选。                                                                                                         |
| `query`                | 自定义查询。可选。                                                                                                                     |

:::note
`table` 和 `query` 字段不能同时使用，并且二者中必须至少声明一个。
:::

ClickHouse 从 ODBC 驱动接收引号字符，并在发送给驱动的查询中为所有设置加上引号，因此需要确保这里配置的表名大小写与数据库中的表名完全一致。

如果在使用 Oracle 时遇到编码问题，请参阅相应的 [FAQ](/knowledgebase/oracle-odbc) 条目。

### ODBC 字典功能的已知漏洞 \{#known-vulnerability-of-the-odbc-dictionary-functionality\}

:::note
通过 ODBC 驱动并使用连接参数 `Servername` 连接到数据库时，该参数可能被替换。在这种情况下，`odbc.ini` 中的 `USERNAME` 和 `PASSWORD` 会被发送到远程服务器，并有可能被泄露。
:::

**不安全用法示例**

下面我们为 PostgreSQL 配置 unixODBC。`/etc/odbc.ini` 的内容如下：

```text
[gregtest]
Driver = /usr/lib/psqlodbca.so
Servername = localhost
PORT = 5432
DATABASE = test_db
#OPTION = 3
USERNAME = test
PASSWORD = test
```

如果随后执行如下查询：

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC 驱动程序会把 `odbc.ini` 中的 `USERNAME` 和 `PASSWORD` 的值发送到 `some-server.com`。

### 连接 PostgreSQL 的示例 \{#example-of-connecting-postgresql\}

在 Ubuntu 操作系统上。

安装 unixODBC 和 PostgreSQL 的 ODBC 驱动程序：

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

配置 `/etc/odbc.ini`（或者，如果是以运行 ClickHouse 的用户身份登录，则配置 `~/.odbc.ini`）：

```text
    [DEFAULT]
    Driver = myconnection

    [myconnection]
    Description         = PostgreSQL connection to my_db
    Driver              = PostgreSQL Unicode
    Database            = my_db
    Servername          = 127.0.0.1
    UserName            = username
    Password            = password
    Port                = 5432
    Protocol            = 9.3
    ReadOnly            = No
    RowVersioning       = No
    ShowSystemTables    = No
    ConnSettings        =
```

ClickHouse 中的字典配置：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    CREATE DICTIONARY table_name (
        id UInt64,
        some_column UInt64 DEFAULT 0
    )
    PRIMARY KEY id
    SOURCE(ODBC(connection_string 'DSN=myconnection' table 'postgresql_table'))
    LAYOUT(HASHED())
    LIFETIME(MIN 300 MAX 360)
    ```
  </TabItem>

  <TabItem value="xml" label="配置文件">
    ```xml
    <clickhouse>
        <dictionary>
            <name>table_name</name>
            <source>
                <odbc>
                    <!-- 可以在 connection_string 中指定以下参数： -->
                    <!-- DSN=myconnection;UID=username;PWD=password;HOST=127.0.0.1;PORT=5432;DATABASE=my_db -->
                    <connection_string>DSN=myconnection</connection_string>
                    <table>postgresql_table</table>
                </odbc>
            </source>
            <lifetime>
                <min>300</min>
                <max>360</max>
            </lifetime>
            <layout>
                <hashed/>
            </layout>
            <structure>
                <id>
                    <name>id</name>
                </id>
                <attribute>
                    <name>some_column</name>
                    <type>UInt64</type>
                    <null_value>0</null_value>
                </attribute>
            </structure>
        </dictionary>
    </clickhouse>
    ```
  </TabItem>
</Tabs>

<br />

您可能需要编辑 `odbc.ini`，以指定驱动程序库的完整路径：`DRIVER=/usr/local/lib/psqlodbcw.so`。

### MS SQL Server 连接示例 \{#example-of-connecting-ms-sql-server\}

Ubuntu 操作系统。

安装用于连接 MS SQL Server 的 ODBC 驱动程序：

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

配置驱动程序：

```bash
    $ cat /etc/freetds/freetds.conf
    ...

    [MSSQL]
    host = 192.168.56.101
    port = 1433
    tds version = 7.0
    client charset = UTF-8

    # test TDS connection
    $ sqsh -S MSSQL -D database -U user -P password


    $ cat /etc/odbcinst.ini

    [FreeTDS]
    Description     = FreeTDS
    Driver          = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
    Setup           = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
    FileUsage       = 1
    UsageCount      = 5

    $ cat /etc/odbc.ini
    # $ cat ~/.odbc.ini # if you signed in under a user that runs ClickHouse

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (optional) test ODBC connection (to use isql-tool install the [unixodbc](https://packages.debian.org/sid/unixodbc)-package)
    $ isql -v MSSQL "user" "password"
```

备注：

* 要确定特定 SQL Server 版本所支持的最低 TDS 版本，请参阅产品文档，或查看 [MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)

在 ClickHouse 中配置字典：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    CREATE DICTIONARY test (
        k UInt64,
        s String DEFAULT ''
    )
    PRIMARY KEY k
    SOURCE(ODBC(table 'dict' connection_string 'DSN=MSSQL;UID=test;PWD=test'))
    LAYOUT(FLAT())
    LIFETIME(MIN 300 MAX 360)
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <clickhouse>
        <dictionary>
            <name>test</name>
            <source>
                <odbc>
                    <table>dict</table>
                    <connection_string>DSN=MSSQL;UID=test;PWD=test</connection_string>
                </odbc>
            </source>

            <lifetime>
                <min>300</min>
                <max>360</max>
            </lifetime>

            <layout>
                <flat />
            </layout>

            <structure>
                <id>
                    <name>k</name>
                </id>
                <attribute>
                    <name>s</name>
                    <type>String</type>
                    <null_value></null_value>
                </attribute>
            </structure>
        </dictionary>
    </clickhouse>
    ```
  </TabItem>
</Tabs>
