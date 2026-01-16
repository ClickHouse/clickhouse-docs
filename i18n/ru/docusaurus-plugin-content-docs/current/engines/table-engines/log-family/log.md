---
description: 'Документация по движку Log'
slug: /engines/table-engines/log-family/log
toc_priority: 33
toc_title: 'Log'
title: 'Движок таблиц Log'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Движок таблицы Log \\{#log-table-engine\\}

<CloudNotSupportedBadge/>

Этот движок относится к семейству движков `Log`. Общие свойства движков `Log` и их различия см. в статье [Семейство движков Log](../../../engines/table-engines/log-family/index.md).

`Log` отличается от [TinyLog](../../../engines/table-engines/log-family/tinylog.md) тем, что рядом с файлами столбцов хранится небольшой файл «меток». Эти метки записываются для каждого блока данных и содержат смещения, которые указывают, откуда нужно начать чтение файла, чтобы пропустить заданное количество строк. Это позволяет читать данные таблицы в несколько потоков.
Для параллельного доступа к данным операции чтения могут выполняться одновременно, при этом операции записи блокируют чтение и друг друга.
Движок `Log` не поддерживает индексы. Аналогично, если запись в таблицу завершилась ошибкой, таблица считается повреждённой, и чтение из неё приводит к ошибке. Движок `Log` подходит для временных данных, таблиц с однократной записью, а также для тестирования или демонстрационных целей.

## Создание таблицы \\{#table_engines-log-creating-a-table\\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Log
```

См. подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

## Запись данных \\{#table_engines-log-writing-the-data\\}

Движок `Log` эффективно хранит данные, записывая каждый столбец в отдельный файл. Для каждой таблицы движок `Log` записывает следующие файлы в указанный путь хранения:

- `<column>.bin`: файл данных для каждого столбца, содержащий сериализованные и сжатые данные.
`__marks.mrk`: файл меток, в котором хранятся смещения и количество строк для каждого вставленного блока данных. Метки используются для эффективного выполнения запросов, позволяя движку пропускать нерелевантные блоки данных при чтении.

### Процесс записи \\{#writing-process\\}

Когда данные записываются в таблицу `Log`:

1.    Данные сериализуются и сжимаются в блоки.
2.    Для каждого столбца сжатые данные дописываются в соответствующий файл `<column>.bin`.
3.    В файл `__marks.mrk` добавляются соответствующие записи, фиксирующие смещение и количество строк вновь вставленных данных.

## Чтение данных \\{#table_engines-log-reading-the-data\\}

Файл меток позволяет ClickHouse выполнять параллельное чтение данных. Это означает, что запрос `SELECT` может возвращать строки в непредсказуемом порядке. Используйте конструкцию `ORDER BY`, чтобы отсортировать строки.

## Пример использования \\{#table_engines-log-example-of-use\\}

Создание таблицы:

```sql
CREATE TABLE log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = Log
```

Вставка данных:

```sql
INSERT INTO log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

Мы использовали два запроса `INSERT`, чтобы создать два блока данных внутри файлов `<column>.bin`.

ClickHouse использует несколько потоков при выборке данных. Каждый поток читает отдельный блок данных и по завершении независимо возвращает результирующие строки. В результате порядок блоков строк в выводе может не совпадать с порядком этих же блоков на входе. Например:

```sql
SELECT * FROM log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message │
└─────────────────────┴──────────────┴───────────────────────────┘
```

Сортировка результатов (по умолчанию — по возрастанию):

```sql
SELECT * FROM log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
