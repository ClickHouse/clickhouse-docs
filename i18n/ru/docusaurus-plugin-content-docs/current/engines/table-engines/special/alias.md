---
description: 'Движок таблицы Alias создает прозрачный прокси к другой таблице. Все операции перенаправляются в целевую таблицу, при этом сам алиас не хранит никаких данных.'
sidebar_label: 'Alias'
sidebar_position: 5
slug: /engines/table-engines/special/alias
title: 'Движок таблицы Alias'
doc_type: 'reference'
---



# Движок таблицы Alias

Движок `Alias` создает прокси к другой таблице. Все операции чтения и записи перенаправляются в целевую таблицу, при этом сама таблица-алиас не хранит данные и лишь содержит ссылку на целевую таблицу.



## Создание таблицы

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_table)
```

Либо с явным указанием имени базы данных:

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_db, target_table)
```

:::note
Таблица `Alias` не поддерживает явное задание столбцов. Столбцы автоматически наследуются от целевой таблицы. Это гарантирует, что псевдоним всегда соответствует схеме целевой таблицы.
:::


## Параметры движка {#engine-parameters}

- **`target_db (optional)`** — Имя базы данных, содержащей целевую таблицу.
- **`target_table`** — Имя целевой таблицы.



## Поддерживаемые операции {#supported-operations}

Движок таблицы `Alias` поддерживает все основные операции. 
### Операции с целевой таблицей {#operations-on-target}

Эти операции пробрасываются в целевую таблицу:

| Operation | Support | Description |
|-----------|---------|-------------|
| `SELECT` | ✅ | Чтение данных из целевой таблицы |
| `INSERT` | ✅ | Запись данных в целевую таблицу |
| `INSERT SELECT` | ✅ | Пакетная вставка в целевую таблицу |
| `ALTER TABLE ADD COLUMN` | ✅ | Добавление столбцов в целевую таблицу |
| `ALTER TABLE MODIFY SETTING` | ✅ | Изменение настроек целевой таблицы |
| `ALTER TABLE PARTITION` | ✅ | Операции с партициями (DETACH/ATTACH/DROP) для целевой таблицы |
| `ALTER TABLE UPDATE` | ✅ | Обновление строк в целевой таблице (мутация) |
| `ALTER TABLE DELETE` | ✅ | Удаление строк из целевой таблицы (мутация) |
| `OPTIMIZE TABLE` | ✅ | Оптимизация целевой таблицы (слияние частей) |
| `TRUNCATE TABLE` | ✅ | Очистка целевой таблицы |

### Операции с самим алиасом {#operations-on-alias}

Эти операции затрагивают только алиас, а **не** целевую таблицу:

| Operation | Support | Description |
|-----------|---------|-------------|
| `DROP TABLE` | ✅ | Удаляет только алиас, целевая таблица остаётся без изменений |
| `RENAME TABLE` | ✅ | Переименовывает только алиас, целевая таблица остаётся без изменений |



## Примеры использования

### Создание простого псевдонима

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

### Псевдоним для другой базы данных

Создайте псевдоним, который ссылается на таблицу в другой базе данных:

```sql
-- Создание баз данных
CREATE DATABASE db1;
CREATE DATABASE db2;

-- Создание исходной таблицы в db1
CREATE TABLE db1.events (
    timestamp DateTime,
    event_type String,
    user_id UInt32
) ENGINE = MergeTree
ORDER BY timestamp;

-- Создание псевдонима в db2, ссылающегося на db1.events
CREATE TABLE db2.events_alias ENGINE = Alias('db1', 'events');

-- Или с использованием формата database.table
CREATE TABLE db2.events_alias2 ENGINE = Alias('db1.events');

-- Оба псевдонима работают одинаково
INSERT INTO db2.events_alias VALUES (now(), 'click', 100);
SELECT * FROM db2.events_alias2;
```

### Операции записи через алиас

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

-- Проверка наличия данных в целевой таблице
SELECT count() FROM metrics;  -- Возвращает 7
SELECT count() FROM metrics_alias;  -- Возвращает 7
```

### Изменение схемы

Операции `ALTER` изменяют схему целевой таблицы:

```sql
CREATE TABLE users (
    id UInt32,
    name String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE users_alias ENGINE = Alias('users');

-- Добавить столбец через псевдоним
ALTER TABLE users_alias ADD COLUMN email String DEFAULT '';

-- Столбец добавляется в целевую таблицу
DESCRIBE users;
```

```text
┌─name──┬─type───┬─default_type─┬─default_expression─┐
│ id    │ UInt32 │              │                    │
│ name  │ String │              │                    │
│ email │ String │ DEFAULT      │ ''                 │
└───────┴────────┴──────────────┴────────────────────┘
```

### Модификации данных

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

-- Обновление через алиас
ALTER TABLE products_alias UPDATE price = price * 1.1 WHERE status = 'active';

-- Удаление через алиас
ALTER TABLE products_alias DELETE WHERE status = 'inactive';

-- Изменения применяются к целевой таблице
SELECT * FROM products ORDER BY id;
```

```text
┌─id─┬─name─────┬─price─┬─status─┐
│  1 │ item_one │ 110.0 │ активный │
│  2 │ item_two │ 220.0 │ активный │
└────┴──────────┴───────┴────────┘
```

### Операции с партициями

Для партиционированных таблиц операции с партициями перенаправляются:


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

-- Отключение партиции через псевдоним
ALTER TABLE logs_alias DETACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- Возвращает 2 (партиция 202402 отключена)

-- Подключение партиции обратно
ALTER TABLE logs_alias ATTACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- Возвращает 3
```

### Оптимизация таблицы

Выполните операцию `OPTIMIZE` для слияния частей в целевой таблице:

```sql
CREATE TABLE events (
    id UInt32,
    data String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE events_alias ENGINE = Alias('events');

-- Множественные вставки создают несколько частей
INSERT INTO events_alias VALUES (1, 'data1');
INSERT INTO events_alias VALUES (2, 'data2');
INSERT INTO events_alias VALUES (3, 'data3');

-- Проверка количества частей
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;

-- Оптимизация через псевдоним
OPTIMIZE TABLE events_alias FINAL;

-- Части объединены в целевой таблице
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;  -- Возвращает 1
```

### Управление псевдонимами

Псевдонимы можно переименовывать или удалять по отдельности:

```sql
CREATE TABLE important_data (
    id UInt32,
    value String
) ENGINE = MergeTree
ORDER BY id;

INSERT INTO important_data VALUES (1, 'critical'), (2, 'important');

CREATE TABLE old_alias ENGINE = Alias('important_data');

-- Переименование псевдонима (целевая таблица остаётся без изменений)
RENAME TABLE old_alias TO new_alias;

-- Создание ещё одного псевдонима для той же таблицы
CREATE TABLE another_alias ENGINE = Alias('important_data');

-- Удаление одного псевдонима (целевая таблица и остальные псевдонимы остаются без изменений)
DROP TABLE new_alias;

SELECT * FROM another_alias;  -- Всё ещё работает
SELECT count() FROM important_data;  -- Данные целы, возвращает 2
```
