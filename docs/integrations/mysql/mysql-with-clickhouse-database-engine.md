---
sidebar_label: MySQL Database Engine
sidebar_position: 20
keywords: [clickhouse, mysql, connect, integrate]
---

# Connecting ClickHouse to MySQL using the MaterializedMySQL database engine

The MySQL database engine allows the connection to be made for SELECT statements to be made in ClickHouse. 
On the MySQL side, DDL and DML operations can continue to made and ClickHouse will be able to detect the changes and acts as a replica to MySQL database.
This article is to illustrate basic methods of integration.


***In the following procedures, the mysql CLI and the clickhouse CLI are used. The MySQL server is installed on CentOS 7 linux***

## 1. In MySQL
1.  Set MySQL database to allow for replication and native authentication:

_*ClickHouse will only work with native password authentication_
```bash
vim /etc/my.cnf
```
add the following entries:
```
default-authentication-plugin=mysql_native_password
gtid-mode = ON
enforce-gtid-consistency = ON
```


2. Using an admin account, create a user to connect from ClickHouse:
```sql
CREATE USER clickhouse_user IDENTIFIED BY 'ClickHouse_123';
```

3. grant needed permissions to the new user:

_*for demonstration purposes, full admin rights have been granted._

```sql
GRANT ALL PRIVILEGES ON *.* TO 'clickhouse_user'@'%';
```
_*minimal permissions needed for the Sync user are:_
```
RELOAD, REPLICATION SLAVE, REPLICATION CLIENT and SELECT PRIVILEGE 
```

4.  Create a database in MySQL:
```sql
CREATE DATABASE db1;
```
2. Create a table:
```sql
CREATE TABLE db1.table_1 (
    id INT,
    column1 VARCHAR(10),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;
```
3. Insert sample rows:
```sql
INSERT INTO db1.table_1 
  (id, column1) 
VALUES 
  (1, 'abc'),
  (2, 'def'),
  (3, 'ghi');
```

## 2. In ClickHouse
1. Set parameter to allow use of experimental feature:
```sql
set allow_experimental_database_materialized_mysql = 1;
```
2. Create the database:
```sql
CREATE DATABASE db1_mysql ENGINE = MaterializedMySQL('mysql-host.domain.com:3306', 'db1', 'clickhouse_user', 'ClickHouse_123');
```

minimum options:

|parameter|Description                 |example              |
|---------|----------------------------|---------------------|
|host:port|hostname or IP and port     |mysql-host.domain.com|
|database |mysql database name         |db1                  |
|user     |username to connect to mysql|clickhouse_user    |
|password |password to connect to mysql|ClickHouse_123       |


**For complete guide to the MySQL database engine, refer to: **

https://clickhouse.com/docs/en/engines/database-engines/materialized-mysql/


## 3. Testing the integration
1. In MySQL, insert a sample row:
```sql
INSERT INTO db1.table_1 
  (id, column1) 
VALUES 
  (4, 'jkl');
```
2. View the new data in ClickHouse:
```sql
ch_env_2 :) SELECT id, column1 FROM db1_mysql.table_1;

SELECT
    id,
    column1
FROM db1_mysql.table_1

Query id: d61a5840-63ca-4a3d-8fac-c93235985654

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  4 │ jkl     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘

4 rows in set. Elapsed: 0.030 sec.


```

3. In MySQL, add a column:
```sql
alter table db1.table_1 add column column2 varchar(10) after column1;
```

4. In MySQL, insert new sample row:
```sql
INSERT INTO db1.table_1 
  (id, column1, column2) 
VALUES 
  (5, 'mno', 'pqr');
```
5. In ClickHouse, view the new structure and row:
```sql
ch_env_2 :) SELECT id, column1, column2 FROM db1_mysql.table_1;

SELECT
    id,
    column1,
    column2
FROM db1_mysql.table_1

Query id: 2c32fd15-3c83-480b-9bfc-cba5d932d674

Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 22.2.2 revision 54455.

┌─id─┬─column1─┬─column2─┐
│  3 │ ghi     │ ᴺᵁᴸᴸ    │
└────┴─────────┴─────────┘
┌─id─┬─column1─┬─column2─┐
│  2 │ def     │ ᴺᵁᴸᴸ    │
└────┴─────────┴─────────┘
┌─id─┬─column1─┬─column2─┐
│  1 │ abc     │ ᴺᵁᴸᴸ    │
│  5 │ mno     │ pqr     │
└────┴─────────┴─────────┘
┌─id─┬─column1─┬─column2─┐
│  4 │ jkl     │ ᴺᵁᴸᴸ    │
└────┴─────────┴─────────┘

5 rows in set. Elapsed: 0.017 sec.
```


## 4. Summary

This integration example demonstrated the basic capabilties and integration methods using the MYSQL database engine.
*Additionally, there exists table engine MySQL integration and also ODBC engine.

