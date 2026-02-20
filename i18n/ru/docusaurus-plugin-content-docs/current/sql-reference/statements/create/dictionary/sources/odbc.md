---
slug: /sql-reference/statements/create/dictionary/sources/odbc
title: 'Источник словаря ODBC'
sidebar_position: 6
sidebar_label: 'ODBC'
description: 'Настройка подключения по ODBC как источника словаря в ClickHouse.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Вы можете использовать этот метод для подключения любой базы данных, для которой существует ODBC‑драйвер.

Пример настроек:

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

Поля настроек:

| Setting                | Description                                                                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `db`                   | Имя базы данных. Опустите это поле, если имя базы данных задано в параметрах `<connection_string>`.                                                                                       |
| `table`                | Имя таблицы и схемы, если указана.                                                                                                                                                        |
| `connection_string`    | Строка подключения.                                                                                                                                                                       |
| `invalidate_query`     | Запрос для проверки статуса словаря. Необязательный параметр. Подробнее см. раздел [Refreshing dictionary data using LIFETIME](../lifetime.md#refreshing-dictionary-data-using-lifetime). |
| `background_reconnect` | Фоновое переподключение к реплике при сбое соединения. Необязательный параметр.                                                                                                           |
| `query`                | Произвольный запрос. Необязательный параметр.                                                                                                                                             |

:::note
Поля `table` и `query` не могут использоваться одновременно. При этом одно из полей `table` или `query` должно быть объявлено.
:::

ClickHouse получает символы кавычек от ODBC‑драйвера и заключает все настройки в кавычки в запросах к драйверу, поэтому необходимо указывать имя таблицы с учетом регистра, используемого в базе данных.

Если у вас возникают проблемы с кодировками при использовании Oracle, см. соответствующий пункт [FAQ](/knowledgebase/oracle-odbc).

### Известная уязвимость функциональности словаря ODBC \{#known-vulnerability-of-the-odbc-dictionary-functionality\}

:::note
При подключении к базе данных через драйвер ODBC параметр соединения `Servername` может быть подменён. В этом случае значения `USERNAME` и `PASSWORD` из `odbc.ini` отправляются на удалённый сервер и могут быть скомпрометированы.
:::

**Пример небезопасного использования**

Настроим unixODBC для PostgreSQL. Содержимое `/etc/odbc.ini`:

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

Если затем вы выполните, например, такой запрос

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC-драйвер будет отправлять значения `USERNAME` и `PASSWORD` из `odbc.ini` на `some-server.com`.

### Пример подключения к PostgreSQL \{#example-of-connecting-postgresql\}

Ubuntu.

Установка unixODBC и драйвера ODBC для PostgreSQL:

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

Настройка `/etc/odbc.ini` (или `~/.odbc.ini`, если вы вошли в систему под пользователем, от имени которого запускается ClickHouse):

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

Конфигурация словаря в ClickHouse:

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

  <TabItem value="xml" label="Configuration file">
    ```xml
    <clickhouse>
        <dictionary>
            <name>table_name</name>
            <source>
                <odbc>
                    <!-- В параметре connection_string вы можете указать следующие параметры: -->
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

Вам может потребоваться отредактировать `odbc.ini`, чтобы указать полный путь к библиотеке драйвера `DRIVER=/usr/local/lib/psqlodbcw.so`.

### Пример подключения MS SQL Server \{#example-of-connecting-ms-sql-server\}

ОС Ubuntu.

Установка ODBC-драйвера для подключения к MS SQL Server:

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

Настройка драйвера:

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

Примечания:

* чтобы определить самую раннюю версию TDS, поддерживаемую конкретной версией SQL Server, обратитесь к документации по продукту или см. [MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)

Настройка словаря в ClickHouse:

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

  <TabItem value="xml" label="Файл конфигурации">
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
