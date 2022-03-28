---
sidebar_label: MySQL Table Engine
sidebar_position: 20
keywords: [clickhouse, mysql, connect, integrate]
---

# Connecting ClickHouse to MySQL using the MySQL table engine

The MySQL table engine allows the connection to be made for SELECT and INSERT statements to be made in either ClickHouse or in the MySQL database.
This article is to illustrate basic methods of integration.


***In the following procedures, the mysql CLI and the clickhouse CLI are used***

## 1. In MySQL
1.  Create a database in MySQL:
```sql
CREATE DATABASE db1;
```
2. Create a table:
```sql
CREATE TABLE db1.table1 (
  id INT,
  column1 VARCHAR(255)
);
```
3. Insert sample rows:
```sql
INSERT INTO db1.table1 
  (id, column1) 
VALUES 
  (1, 'abc'),
  (2, 'def'),
  (3, 'ghi');
```
4. Create a user to connect from ClickHouse:
```sql
CREATE USER 'mysql_clickhouse'@'%' IDENTIFIED BY 'Password123!';
```
5. Grant privileges as needed. 

_For demonstration purposes, the `mysql_clickhouse` user is granted admin prvileges._
```sql
GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
```
## 2. In ClickHouse
1. Create a table:
```sql
CREATE TABLE mysql_table1 (
  id UInt64,
  column1 String
)
ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
```
minimum options:

|parameter|Description        |example              |
|---------|----------------------------|---------------------|
|host     |hostname or IP              |mysql-host.domain.com|
|database |mysql database name         |db1                  |
|table    |mysql table name            |table1               |
|user     |username to connect to mysql|mysql_clickhouse     |
|password |password to connect to mysql|Password123!         |


**For complete guide to the MySQL table engine refer to: **

https://clickhouse.com/docs/en/engines/table-engines/integrations/mysql/



## 3. Testing the integration
1. In MySQL, insert a sample row:
```sql
INSERT INTO db1.table1 
  (id, column1) 
VALUES 
  (4, 'jkl');
```
2. View the new data in ClickHouse:
```bash
clickhouse :) SELECT id, column1 FROM mysql_table1;

SELECT
    id,
    column1
FROM mysql_table1

Query id: 6d590083-841e-4e95-8715-ef37d3e95197

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘

4 rows in set. Elapsed: 0.044 sec.

```

3. In ClickHouse, insert a sample row:

```sql
INSERT INTO mysql_table1
  (id, column1)
VALUES
  (5,'mno')
```
4.  View the the new data in MySQL:

```bash
mysql> select id,column1 from db1.table1;
+------+---------+
| id   | column1 |
+------+---------+
|    1 | abc     |
|    2 | def     |
|    3 | ghi     |
|    4 | jkl     |
|    5 | mno     |
+------+---------+
5 rows in set (0.01 sec)

```

## 4. Summary

This integration example demontrated the basic capabilties and integration methods using the MYSQL table engine.
*Additionally, there exists database engine MySQL integration with MaterializedMySQL and also ODBC engine.

