---
slug: /sql-reference/statements/create/dictionary/sources/odbc
title: 'ODBC Dictionary ソース'
sidebar_position: 6
sidebar_label: 'ODBC'
description: 'ClickHouse で Dictionary のソースとして ODBC 接続を構成します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ODBC ドライバーを持つ任意のデータベースには、この方法を使って接続できます。

設定例:

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

  <TabItem value="xml" label="設定ファイル">
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

設定フィールド:

| Setting                | Description                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `db`                   | データベース名。データベース名が `<connection_string>` のパラメータで指定されている場合は省略します。                                                                              |
| `table`                | テーブル名と（存在する場合は）スキーマ名。                                                                                                                       |
| `connection_string`    | 接続文字列。                                                                                                                                      |
| `invalidate_query`     | Dictionary のステータスを確認するためのクエリ。任意。詳細は [LIFETIME を使用した Dictionary データの更新](../lifetime.md#refreshing-dictionary-data-using-lifetime) を参照してください。 |
| `background_reconnect` | 接続エラー時にバックグラウンドでレプリカへ再接続します。任意。                                                                                                             |
| `query`                | カスタムクエリ。任意。                                                                                                                                 |

:::note
`table` と `query` フィールドは同時に使用できません。また、`table` または `query` のいずれか一方は必ず指定する必要があります。
:::

ClickHouse は ODBC ドライバーからクオート記号を受け取り、ドライバーへのクエリ内ですべての設定値をクオートするため、テーブル名はデータベース内のテーブル名の大文字小文字の表記に正確に合わせて設定する必要があります。

Oracle を使用する際にエンコーディングに問題がある場合は、対応する [FAQ](/knowledgebase/oracle-odbc) の項目を参照してください。

### ODBC Dictionary 機能の既知の脆弱性 \{#known-vulnerability-of-the-odbc-dictionary-functionality\}

:::note
ODBC ドライバー経由でデータベースに接続する際、接続パラメータ `Servername` をすり替えられる可能性があります。この場合、`odbc.ini` に記載された `USERNAME` と `PASSWORD` の値がリモートサーバーに送信され、漏えいするおそれがあります。
:::

**安全でない使用例**

PostgreSQL 向けに unixODBC を構成します。`/etc/odbc.ini` の内容は次のとおりです。

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

その後、次のようなクエリを発行すると

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC ドライバーは、`odbc.ini` に設定された `USERNAME` と `PASSWORD` の値を `some-server.com` に送信します。

### PostgreSQL への接続例 \{#example-of-connecting-postgresql\}

環境は Ubuntu OS です。

unixODBC および PostgreSQL 用 ODBC ドライバーをインストールします:

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini`（または、ClickHouse を実行するユーザーでサインインしている場合は `~/.odbc.ini`）を設定します。

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

ClickHouse における Dictionary の設定例:

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

  <TabItem value="xml" label="構成ファイル">
    ```xml
    <clickhouse>
        <dictionary>
            <name>table_name</name>
            <source>
                <odbc>
                    <!-- connection_string で次のパラメータを指定できます: -->
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

ドライバーライブラリへのフルパスを指定するために、`DRIVER=/usr/local/lib/psqlodbcw.so` を設定するよう `odbc.ini` を編集する必要がある場合があります。

### MS SQL Server への接続例 \{#example-of-connecting-ms-sql-server\}

Ubuntu OS。

MS SQL Server に接続するための ODBC ドライバーをインストールします:

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

ドライバーの構成：

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

備考：

* 特定の SQL Server バージョンでサポートされている最も古い TDS バージョンを確認するには、製品ドキュメントを参照するか、[MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a) を参照してください。

ClickHouse で Dictionary を設定する：

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
