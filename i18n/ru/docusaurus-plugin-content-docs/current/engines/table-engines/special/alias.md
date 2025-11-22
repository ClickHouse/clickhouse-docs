---
description: 'Табличный движок Alias создает прозрачный прокси к другой таблице. Все операции перенаправляются в целевую таблицу, при этом сам псевдоним не хранит данные.'
sidebar_label: 'Alias'
sidebar_position: 5
slug: /engines/table-engines/special/alias
title: 'Табличный движок Alias'
doc_type: 'reference'
---



# Движок таблицы Alias

Движок `Alias` создаёт прокси для другой таблицы. Все операции чтения и записи перенаправляются в целевую таблицу, при этом сам псевдоним не хранит данные и лишь поддерживает ссылку на целевую таблицу.



## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_table)
```

Или с явным указанием имени базы данных:

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_db, target_table)
```

:::note
Таблица `Alias` не поддерживает явное определение столбцов. Столбцы автоматически наследуются из целевой таблицы. Это гарантирует, что алиас всегда соответствует схеме целевой таблицы.
:::


## Параметры движка {#engine-parameters}

- **`target_db (необязательный)`** — имя базы данных, содержащей целевую таблицу.
- **`target_table`** — имя целевой таблицы.


## Поддерживаемые операции {#supported-operations}

Движок таблиц `Alias` поддерживает все основные операции.

### Операции над целевой таблицей {#operations-on-target}

Эти операции передаются целевой таблице:

| Операция                     | Поддержка | Описание                                                       |
| ---------------------------- | --------- | -------------------------------------------------------------- |
| `SELECT`                     | ✅        | Чтение данных из целевой таблицы                               |
| `INSERT`                     | ✅        | Запись данных в целевую таблицу                                |
| `INSERT SELECT`              | ✅        | Пакетная вставка в целевую таблицу                             |
| `ALTER TABLE ADD COLUMN`     | ✅        | Добавление столбцов в целевую таблицу                          |
| `ALTER TABLE MODIFY SETTING` | ✅        | Изменение настроек целевой таблицы                             |
| `ALTER TABLE PARTITION`      | ✅        | Операции с партициями (DETACH/ATTACH/DROP) над целевой таблицей |
| `ALTER TABLE UPDATE`         | ✅        | Обновление строк в целевой таблице (мутация)                   |
| `ALTER TABLE DELETE`         | ✅        | Удаление строк из целевой таблицы (мутация)                    |
| `OPTIMIZE TABLE`             | ✅        | Оптимизация целевой таблицы (слияние кусков)                   |
| `TRUNCATE TABLE`             | ✅        | Очистка целевой таблицы                                        |

### Операции над самим псевдонимом {#operations-on-alias}

Эти операции влияют только на псевдоним, **не затрагивая** целевую таблицу:

| Операция       | Поддержка | Описание                                                               |
| -------------- | --------- | ---------------------------------------------------------------------- |
| `DROP TABLE`   | ✅        | Удаление только псевдонима, целевая таблица остаётся без изменений     |
| `RENAME TABLE` | ✅        | Переименование только псевдонима, целевая таблица остаётся без изменений |


## Примеры использования {#usage-examples}

### Создание простого псевдонима {#basic-alias-creation}

Создайте простой псевдоним в той же базе данных:

```sql
-- Создать исходную таблицу
CREATE TABLE source_data (
    id UInt32,
    name String,
    value Float64
) ENGINE = MergeTree
ORDER BY id;

-- Вставить данные
INSERT INTO source_data VALUES (1, 'one', 10.1), (2, 'two', 20.2);

-- Создать псевдоним
CREATE TABLE data_alias ENGINE = Alias('source_data');

-- Выполнить запрос через псевдоним
SELECT * FROM data_alias;
```

```text
┌─id─┬─name─┬─value─┐
│  1 │ one  │  10.1 │
│  2 │ two  │  20.2 │
└────┴──────┴───────┘
```

### Псевдоним для таблицы в другой базе данных {#cross-database-alias}

Создайте псевдоним, указывающий на таблицу в другой базе данных:

```sql
-- Создать базы данных
CREATE DATABASE db1;
CREATE DATABASE db2;

-- Создать исходную таблицу в db1
CREATE TABLE db1.events (
    timestamp DateTime,
    event_type String,
    user_id UInt32
) ENGINE = MergeTree
ORDER BY timestamp;

-- Создать псевдоним в db2, указывающий на db1.events
CREATE TABLE db2.events_alias ENGINE = Alias('db1', 'events');

-- Или используя формат database.table
CREATE TABLE db2.events_alias2 ENGINE = Alias('db1.events');

-- Оба псевдонима работают одинаково
INSERT INTO db2.events_alias VALUES (now(), 'click', 100);
SELECT * FROM db2.events_alias2;
```

### Операции записи через псевдоним {#write-operations}

Все операции записи перенаправляются в целевую таблицу:

```sql
CREATE TABLE metrics (
    ts DateTime,
    metric_name String,
    value Float64
) ENGINE = MergeTree
ORDER BY ts;

CREATE TABLE metrics_alias ENGINE = Alias('metrics');

-- Вставка через псевдоним
INSERT INTO metrics_alias VALUES
    (now(), 'cpu_usage', 45.2),
    (now(), 'memory_usage', 78.5);

-- Вставка с помощью SELECT
INSERT INTO metrics_alias
SELECT now(), 'disk_usage', number * 10
FROM system.numbers
LIMIT 5;

-- Проверить, что данные находятся в целевой таблице
SELECT count() FROM metrics;  -- Возвращает 7
SELECT count() FROM metrics_alias;  -- Возвращает 7
```

### Изменение схемы {#schema-modification}

Операции ALTER изменяют схему целевой таблицы:

```sql
CREATE TABLE users (
    id UInt32,
    name String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE users_alias ENGINE = Alias('users');

-- Добавить столбец через псевдоним
ALTER TABLE users_alias ADD COLUMN email String DEFAULT '';

-- Столбец добавлен в целевую таблицу
DESCRIBE users;
```

```text
┌─name──┬─type───┬─default_type─┬─default_expression─┐
│ id    │ UInt32 │              │                    │
│ name  │ String │              │                    │
│ email │ String │ DEFAULT      │ ''                 │
└───────┴────────┴──────────────┴────────────────────┘
```

### Мутации данных {#data-mutations}

Поддерживаются операции UPDATE и DELETE:

```sql
CREATE TABLE products (
    id UInt32,
    name String,
    price Float64,
    status String DEFAULT 'active'
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE products_alias ENGINE = Alias('products');

INSERT INTO products_alias VALUES
    (1, 'item_one', 100.0, 'active'),
    (2, 'item_two', 200.0, 'active'),
    (3, 'item_three', 300.0, 'inactive');

-- Обновление через псевдоним
ALTER TABLE products_alias UPDATE price = price * 1.1 WHERE status = 'active';

-- Удаление через псевдоним
ALTER TABLE products_alias DELETE WHERE status = 'inactive';

-- Изменения применены к целевой таблице
SELECT * FROM products ORDER BY id;
```

```text
┌─id─┬─name─────┬─price─┬─status─┐
│  1 │ item_one │ 110.0 │ active │
│  2 │ item_two │ 220.0 │ active │
└────┴──────────┴───────┴────────┘
```

### Операции с партициями {#partition-operations}

Для партиционированных таблиц операции с партициями перенаправляются в целевую таблицу:


```sql
CREATE TABLE logs (
    date Date,
    level String,
    message String
) ENGINE = MergeTree
PARTITION BY toYYYYMM(date)
ORDER BY date;

CREATE TABLE logs_alias ENGINE = Alias('logs');

INSERT INTO logs_alias VALUES
    ('2024-01-15', 'INFO', 'message1'),
    ('2024-02-15', 'ERROR', 'message2'),
    ('2024-03-15', 'INFO', 'message3');

-- Отсоединение партиции через псевдоним
ALTER TABLE logs_alias DETACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- Возвращает 2 (партиция 202402 отсоединена)

-- Присоединение партиции обратно
ALTER TABLE logs_alias ATTACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- Возвращает 3
```

### Оптимизация таблицы {#table-optimization}

Операции оптимизации объединяют куски данных в целевой таблице:

```sql
CREATE TABLE events (
    id UInt32,
    data String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE events_alias ENGINE = Alias('events');

-- Множественные вставки создают несколько кусков данных
INSERT INTO events_alias VALUES (1, 'data1');
INSERT INTO events_alias VALUES (2, 'data2');
INSERT INTO events_alias VALUES (3, 'data3');

-- Проверка количества кусков данных
SELECT count() FROM system.parts
WHERE database = currentDatabase()
  AND table = 'events'
  AND active;

-- Оптимизация через псевдоним
OPTIMIZE TABLE events_alias FINAL;

-- Куски данных объединены в целевой таблице
SELECT count() FROM system.parts
WHERE database = currentDatabase()
  AND table = 'events'
  AND active;  -- Возвращает 1
```

### Управление псевдонимами {#alias-management}

Псевдонимы можно переименовывать или удалять независимо:

```sql
CREATE TABLE important_data (
    id UInt32,
    value String
) ENGINE = MergeTree
ORDER BY id;

INSERT INTO important_data VALUES (1, 'critical'), (2, 'important');

CREATE TABLE old_alias ENGINE = Alias('important_data');

-- Переименование псевдонима (целевая таблица остается без изменений)
RENAME TABLE old_alias TO new_alias;

-- Создание еще одного псевдонима для той же таблицы
CREATE TABLE another_alias ENGINE = Alias('important_data');

-- Удаление одного псевдонима (целевая таблица и другие псевдонимы остаются без изменений)
DROP TABLE new_alias;

SELECT * FROM another_alias;  -- По-прежнему работает
SELECT count() FROM important_data;  -- Данные сохранены, возвращает 2
```
