---
description: 'Документация по табличному движку TinyLog'
slug: /engines/table-engines/log-family/tinylog
toc_priority: 34
toc_title: 'TinyLog'
title: 'Табличный движок TinyLog'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Табличный движок TinyLog

<CloudNotSupportedBadge/>

Движок относится к семейству лог‑движков. Общие свойства лог‑движков и их отличия см. в разделе [Log Engine Family](../../../engines/table-engines/log-family/index.md).

Этот табличный движок обычно используется в режиме однократной записи: данные записываются один раз, а затем читаются столько раз, сколько необходимо. Например, вы можете использовать таблицы типа `TinyLog` для промежуточных данных, которые обрабатываются небольшими пакетами. Обратите внимание, что хранение данных в большом количестве маленьких таблиц неэффективно.

Запросы выполняются в одном потоке. Другими словами, этот движок предназначен для относительно небольших таблиц (порядка 1 000 000 строк). Имеет смысл использовать этот табличный движок, если у вас множество небольших таблиц, поскольку он проще, чем движок [Log](../../../engines/table-engines/log-family/log.md) (нужно открывать меньше файлов).



## Характеристики {#characteristics}

- **Упрощённая структура**: В отличие от движка Log, TinyLog не использует файлы меток. Это упрощает архитектуру, но ограничивает возможности оптимизации производительности для больших наборов данных.
- **Однопоточное выполнение запросов**: Запросы к таблицам TinyLog выполняются в одном потоке, что делает движок подходящим для относительно небольших таблиц, обычно до 1 000 000 строк.
- **Эффективность для небольших таблиц**: Простота движка TinyLog делает его предпочтительным при работе с множеством небольших таблиц, поскольку он требует меньше файловых операций по сравнению с движком Log.

В отличие от движка Log, TinyLog не использует файлы меток. Это упрощает архитектуру, но ограничивает возможности оптимизации производительности для больших наборов данных.


## Создание таблицы {#table_engines-tinylog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

Подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table) см. в соответствующем разделе.


## Запись данных {#table_engines-tinylog-writing-the-data}

Движок `TinyLog` хранит все столбцы в одном файле. При каждом запросе `INSERT` ClickHouse добавляет блок данных в конец файла таблицы, записывая столбцы последовательно.

Для каждой таблицы ClickHouse создаёт следующие файлы:

- `<column>.bin` — файл данных для каждого столбца, содержащий сериализованные и сжатые данные.

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

ClickHouse использует один поток для выборки данных. В результате порядок блоков строк в выходных данных соответствует порядку тех же блоков во входных данных. Например:

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
