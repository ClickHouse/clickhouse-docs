---
sidebar_label: 'MySQL'
sidebar_position: 10
slug: /integrations/connecting-to-mysql
description: 'Движок таблиц MySQL позволяет подключить ClickHouse к MySQL.'
keywords: ['clickhouse', 'mysql', 'connect', 'integrate', 'table', 'engine']
title: 'Интеграция MySQL с ClickHouse'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Интеграция MySQL с ClickHouse

Эта страница описывает использование движка таблиц `MySQL` для чтения из таблицы MySQL.

## Подключение ClickHouse к MySQL с использованием движка таблиц MySQL {#connecting-clickhouse-to-mysql-using-the-mysql-table-engine}

Движок таблиц `MySQL` позволяет подключить ClickHouse к MySQL. **SELECT** и **INSERT** операторы могут выполняться как в ClickHouse, так и в таблице MySQL. В этой статье показаны основные методы использования движка таблиц `MySQL`.

### 1. Настройка MySQL {#1-configure-mysql}

1.  Создайте базу данных в MySQL:
  ```sql
  CREATE DATABASE db1;
  ```

2. Создайте таблицу:
  ```sql
  CREATE TABLE db1.table1 (
    id INT,
    column1 VARCHAR(255)
  );
  ```

3. Вставьте образцы строк:
  ```sql
  INSERT INTO db1.table1
    (id, column1)
  VALUES
    (1, 'abc'),
    (2, 'def'),
    (3, 'ghi');
  ```

4. Создайте пользователя для подключения из ClickHouse:
  ```sql
  CREATE USER 'mysql_clickhouse'@'%' IDENTIFIED BY 'Password123!';
  ```

5. Предоставьте привилегии по мере необходимости. (Для демонстрационных целей пользователю `mysql_clickhouse` предоставляются административные привилегии.)
  ```sql
  GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
  ```

:::note
Если вы используете эту функцию в ClickHouse Cloud, вам может понадобиться разрешить IP-адреса ClickHouse Cloud для доступа к вашему экземпляру MySQL.
Проверьте документацию ClickHouse [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) для получения информации о выходящем трафике.
:::

### 2. Определите таблицу в ClickHouse {#2-define-a-table-in-clickhouse}

1. Теперь давайте создадим таблицу ClickHouse, которая использует движок таблиц `MySQL`:
  ```sql
  CREATE TABLE mysql_table1 (
    id UInt64,
    column1 String
  )
  ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
  ```

  Минимальные параметры:

  |parameter|Description        |example              |
  |---------|----------------------------|---------------------|
  |host     |hostname или IP              |mysql-host.domain.com|
  |database |имя базы данных MySQL         |db1                  |
  |table    |имя таблицы MySQL            |table1               |
  |user     |имя пользователя для подключения к mysql|mysql_clickhouse     |
  |password |пароль для подключения к mysql|Password123!         |

  :::note
  Просмотрите страницу документации [MySQL table engine](/engines/table-engines/integrations/mysql.md) для полного списка параметров.
  :::

### 3. Протестируйте интеграцию {#3-test-the-integration}

1. В MySQL вставьте образец строки:
  ```sql
  INSERT INTO db1.table1
    (id, column1)
  VALUES
    (4, 'jkl');
  ```

2. Обратите внимание, что существующие строки из таблицы MySQL находятся в таблице ClickHouse вместе с новой строкой, которую вы только что добавили:
  ```sql
  SELECT
      id,
      column1
  FROM mysql_table1
  ```

  Вы должны увидеть 4 строки:
  ```response
  Query id: 6d590083-841e-4e95-8715-ef37d3e95197

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  │  3 │ ghi     │
  │  4 │ jkl     │
  └────┴─────────┘

  4 rows in set. Elapsed: 0.044 sec.
  ```

3. Давайте добавим строку в таблицу ClickHouse:
  ```sql
  INSERT INTO mysql_table1
    (id, column1)
  VALUES
    (5,'mno')
  ```

4. Обратите внимание, что новая строка появилась в MySQL:
  ```bash
  mysql> select id,column1 from db1.table1;
  ```

  Вы должны увидеть новую строку:
  ```response
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

### Резюме {#summary}

Движок таблиц `MySQL` позволяет подключать ClickHouse к MySQL для обмена данными в обе стороны. Для получения дополнительных сведений не забудьте ознакомиться с документацией на странице [MySQL table engine](/sql-reference/table-functions/mysql.md).
