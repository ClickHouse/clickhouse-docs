---
description: 'Табличный движок Alias создает прозрачный прокси к другой таблице. Все операции перенаправляются в целевую таблицу, при этом сам алиас не хранит данные.'
sidebar_label: 'Alias'
sidebar_position: 5
slug: /engines/table-engines/special/alias
title: 'Табличный движок Alias'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# Движок таблицы Alias \\{#alias-table-engine\\}

<ExperimentalBadge/>

Движок `Alias` создаёт прокси для другой таблицы. Все операции чтения и записи перенаправляются в целевую таблицу, при этом сама таблица-алиас не хранит данных и только поддерживает ссылку на целевую таблицу.

:::info
Это экспериментальная функция, которая может измениться в будущих релизах с нарушением обратной совместимости.
Включите использование движка таблицы Alias
с помощью настройки [allow_experimental_alias_table_engine](/operations/settings/settings#allow_experimental_alias_table_engine).
Введите команду `set allow_experimental_alias_table_engine = 1`.
:::

## Создание таблицы \\{#creating-a-table\\}

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_table)
```

Или с указанием имени базы данных:

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_db, target_table)
```

:::note
Таблица `Alias` не поддерживает явное определение столбцов. Столбцы автоматически наследуются от целевой таблицы. Это гарантирует, что таблица `Alias` всегда соответствует схеме целевой таблицы.
:::

## Параметры движка \\{#engine-parameters\\}

- **`target_db (optional)`** — Имя базы данных, содержащей целевую таблицу.
- **`target_table`** — Имя целевой таблицы.

## Поддерживаемые операции \\{#supported-operations\\}

Движок таблицы `Alias` поддерживает все основные операции. 

### Операции с целевой таблицей \\{#operations-on-target\\}

Эти операции проксируются на целевую таблицу:

| Операция | Поддержка | Описание |
|-----------|-----------|----------|
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

### Операции с самим алиасом \\{#operations-on-alias\\}

Эти операции применяются только к алиасу, **а не** к целевой таблице:

| Операция | Поддержка | Описание |
|----------|-----------|----------|
| `DROP TABLE` | ✅ | Удаляет только алиас, целевая таблица остаётся без изменений |
| `RENAME TABLE` | ✅ | Переименовывает только алиас, целевая таблица остаётся без изменений |

## Примеры использования \\{#usage-examples\\}

### Создание простого алиаса \\{#basic-alias-creation\\}

Создайте простой алиас в этой же базе данных:

```sql
-- Create source table
CREATE TABLE source_data (
    id UInt32,
    name String,
    value Float64
) ENGINE = MergeTree
ORDER BY id;

-- Insert some data
INSERT INTO source_data VALUES (1, 'one', 10.1), (2, 'two', 20.2);

-- Create alias
CREATE TABLE data_alias ENGINE = Alias('source_data');

-- Query through alias
SELECT * FROM data_alias;
```

```text
┌─id─┬─name─┬─value─┐
│  1 │ one  │  10.1 │
│  2 │ two  │  20.2 │
└────┴──────┴───────┘
```

### Межбазовый псевдоним \\{#cross-database-alias\\}

Создайте псевдоним, ссылающийся на таблицу в другой базе данных:

```sql
-- Create databases
CREATE DATABASE db1;
CREATE DATABASE db2;

-- Create source table in db1
CREATE TABLE db1.events (
    timestamp DateTime,
    event_type String,
    user_id UInt32
) ENGINE = MergeTree
ORDER BY timestamp;

-- Create alias in db2 pointing to db1.events
CREATE TABLE db2.events_alias ENGINE = Alias('db1', 'events');

-- Or using database.table format
CREATE TABLE db2.events_alias2 ENGINE = Alias('db1.events');

-- Both aliases work identically
INSERT INTO db2.events_alias VALUES (now(), 'click', 100);
SELECT * FROM db2.events_alias2;
```

### Операции записи через алиас \\{#write-operations\\}

Все операции записи перенаправляются в целевую таблицу:

```sql
CREATE TABLE metrics (
    ts DateTime,
    metric_name String,
    value Float64
) ENGINE = MergeTree
ORDER BY ts;

CREATE TABLE metrics_alias ENGINE = Alias('metrics');

-- Insert through alias
INSERT INTO metrics_alias VALUES 
    (now(), 'cpu_usage', 45.2),
    (now(), 'memory_usage', 78.5);

-- Insert with SELECT
INSERT INTO metrics_alias 
SELECT now(), 'disk_usage', number * 10 
FROM system.numbers 
LIMIT 5;

-- Verify data is in the target table
SELECT count() FROM metrics;  -- Returns 7
SELECT count() FROM metrics_alias;  -- Returns 7
```

### Изменение схемы \\{#schema-modification\\}

Операции ALTER изменяют схему целевой таблицы:

```sql
CREATE TABLE users (
    id UInt32,
    name String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE users_alias ENGINE = Alias('users');

-- Add column through alias
ALTER TABLE users_alias ADD COLUMN email String DEFAULT '';

-- Column is added to target table
DESCRIBE users;
```

```text
┌─name──┬─type───┬─default_type─┬─default_expression─┐
│ id    │ UInt32 │              │                    │
│ name  │ String │              │                    │
│ email │ String │ DEFAULT      │ ''                 │
└───────┴────────┴──────────────┴────────────────────┘
```

### Мутации данных \\{#data-mutations\\}

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

-- Update through alias
ALTER TABLE products_alias UPDATE price = price * 1.1 WHERE status = 'active';

-- Delete through alias
ALTER TABLE products_alias DELETE WHERE status = 'inactive';

-- Changes are applied to target table
SELECT * FROM products ORDER BY id;
```

```text
┌─id─┬─name─────┬─price─┬─status─┐
│  1 │ item_one │ 110.0 │ active │
│  2 │ item_two │ 220.0 │ active │
└────┴──────────┴───────┴────────┘
```

### Операции с партициями \\{#partition-operations\\}

Для секционированных таблиц операции с партициями передаются далее:

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

-- Detach partition through alias
ALTER TABLE logs_alias DETACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- Returns 2 (partition 202402 detached)

-- Attach partition back
ALTER TABLE logs_alias ATTACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- Returns 3
```

### Оптимизация таблицы \\{#table-optimization\\}

Оптимизируйте операции по слиянию частей в целевой таблице:

```sql
CREATE TABLE events (
    id UInt32,
    data String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE events_alias ENGINE = Alias('events');

-- Multiple inserts create multiple parts
INSERT INTO events_alias VALUES (1, 'data1');
INSERT INTO events_alias VALUES (2, 'data2');
INSERT INTO events_alias VALUES (3, 'data3');

-- Check parts count
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;

-- Optimize through alias
OPTIMIZE TABLE events_alias FINAL;

-- Parts are merged in target table
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;  -- Returns 1
```

### Управление алиасами \\{#alias-management\\}

Алиасы можно переименовывать или удалять независимо:

```sql
CREATE TABLE important_data (
    id UInt32,
    value String
) ENGINE = MergeTree
ORDER BY id;

INSERT INTO important_data VALUES (1, 'critical'), (2, 'important');

CREATE TABLE old_alias ENGINE = Alias('important_data');

-- Rename alias (target table unchanged)
RENAME TABLE old_alias TO new_alias;

-- Create another alias to same table
CREATE TABLE another_alias ENGINE = Alias('important_data');

-- Drop one alias (target table and other aliases unchanged)
DROP TABLE new_alias;

SELECT * FROM another_alias;  -- Still works
SELECT count() FROM important_data;  -- Data intact, returns 2
```
