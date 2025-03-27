---
description: 'Документация для TinyLog'
slug: /engines/table-engines/log-family/tinylog
toc_priority: 34
toc_title: 'TinyLog'
title: 'TinyLog'
---


# TinyLog

Этот движок принадлежит семейству логов. См. [Семейство логов](../../../engines/table-engines/log-family/index.md) для общих свойств логов и их различий.

Этот движок таблиц обычно используется с методом записи один раз: записать данные один раз, а затем считывать их столько раз, сколько необходимо. Например, вы можете использовать таблицы типа `TinyLog` для промежуточных данных, которые обрабатываются малыми партиями. Обратите внимание, что хранение данных в большом количестве маленьких таблиц неэффективно.

Запросы выполняются в одном потоке. Другими словами, этот движок предназначен для относительно небольших таблиц (до aproximadamente 1 000 000 строк). Имеет смысл использовать этот движок таблиц, если у вас много маленьких таблиц, поскольку он проще, чем движок [Log](../../../engines/table-engines/log-family/log.md) (открывается меньше файлов).

## Характеристики {#characteristics}

- **Упрощенная структура**: В отличие от движка Log, TinyLog не использует файлы меток. Это уменьшает сложность, но также ограничивает возможности оптимизации производительности для больших наборов данных.
- **Запросы в одном потоке**: Запросы к таблицам TinyLog выполняются в одном потоке, что делает его подходящим для относительно небольших таблиц, как правило, до 1 000 000 строк.
- **Эффективность для маленьких таблиц**: Простота движка TinyLog делает его выгодным при управлении многими маленькими таблицами, так как требуется меньше операций с файлами по сравнению с движком Log.

В отличие от движка Log, TinyLog не использует файлы меток. Это уменьшает сложность, но также ограничивает возможности оптимизации производительности для больших наборов данных.

## Создание таблицы {#table_engines-tinylog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

Смотрите подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

## Запись данных {#table_engines-tinylog-writing-the-data}

Движок `TinyLog` хранит все столбцы в одном файле. Для каждого запроса `INSERT` ClickHouse добавляет блок данных в конец файла таблицы, записывая столбцы по одному.

Для каждой таблицы ClickHouse записывает файлы:

- `<column>.bin`: Файл данных для каждого столбца, содержащий сериализованные и сжатые данные.

Движок `TinyLog` не поддерживает операции `ALTER UPDATE` и `ALTER DELETE`.

## Пример использования {#table_engines-tinylog-example-of-use}

Создание таблицы:

```sql
CREATE TABLE tiny_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = TinyLog
```

Вставка данных:

```sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

Мы использовали два запроса `INSERT` для создания двух блоков данных внутри файлов `<column>.bin`.

ClickHouse использует один поток для выборки данных. В результате порядок блоков строк в выходных данных совпадает с порядком тех же блоков во входных данных. Например:

```sql
SELECT * FROM tiny_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2024-12-10 13:11:58 │ REGULAR      │ The first regular message  │
│ 2024-12-10 13:12:12 │ REGULAR      │ The second regular message │
│ 2024-12-10 13:12:12 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
