---
slug: '/engines/table-engines/log-family/stripelog'
description: 'Документация для StripeLog'
title: StripeLog
doc_type: reference
toc_priority: 32
toc_title: StripeLog
---
# StripeLog

Этот движок относится к семейству логов. Ознакомьтесь с общими свойствами логов и их различиями в статье [Семейство логов](../../../engines/table-engines/log-family/index.md).

Используйте этот движок в сценариях, когда необходимо записывать много таблиц с малым количеством данных (менее 1 миллиона строк). Например, эту таблицу можно использовать для хранения входящих пакетов данных для трансформации, где требуется атомарная обработка. 100 тысяч экземпляров такого типа таблицы жизнеспособны для сервера ClickHouse. Этот движок таблицы следует предпочесть движку [Log](./log.md), когда требуется высокое количество таблиц. Это происходит за счет эффективности чтения.

## Создание таблицы {#table_engines-stripelog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

Смотрите подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

## Запись данных {#table_engines-stripelog-writing-the-data}

Движок `StripeLog` хранит все колонки в одном файле. Для каждого запроса `INSERT` ClickHouse добавляет блок данных в конец файла таблицы, записывая колонки по одной.

Для каждой таблицы ClickHouse записывает файлы:

- `data.bin` — Файл с данными.
- `index.mrk` — Файл с метками. Метки содержат смещения для каждой колонки каждого вставленного блока данных.

Движок `StripeLog` не поддерживает операции `ALTER UPDATE` и `ALTER DELETE`.

## Чтение данных {#table_engines-stripelog-reading-the-data}

Файл с метками позволяет ClickHouse параллелить чтение данных. Это означает, что запрос `SELECT` возвращает строки в непредсказуемом порядке. Используйте оператор `ORDER BY`, чтобы отсортировать строки.

## Пример использования {#table_engines-stripelog-example-of-use}

Создание таблицы:

```sql
CREATE TABLE stripe_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = StripeLog
```

Вставка данных:

```sql
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

Мы использовали два запроса `INSERT`, чтобы создать два блока данных внутри файла `data.bin`.

ClickHouse использует несколько потоков при выборе данных. Каждый поток читает отдельный блок данных и возвращает результирующие строки независимо по мере завершения. В результате порядок блоков строк в выводе не совпадает с порядком тех же блоков во входных данных в большинстве случаев. Например:

```sql
SELECT * FROM stripe_log_table
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

Сортировка результатов (по умолчанию в порядке возрастания):

```sql
SELECT * FROM stripe_log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```