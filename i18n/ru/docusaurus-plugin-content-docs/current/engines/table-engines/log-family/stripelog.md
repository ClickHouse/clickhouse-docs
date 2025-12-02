---
description: 'Документация по движку таблицы StripeLog'
slug: /engines/table-engines/log-family/stripelog
toc_priority: 32
toc_title: 'StripeLog'
title: 'Движок таблицы StripeLog'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Движок таблицы StripeLog {#stripelog-table-engine}

<CloudNotSupportedBadge/>

Этот движок относится к семейству лог-движков. Общие свойства лог-движков и их различия см. в статье [Log Engine Family](../../../engines/table-engines/log-family/index.md).

Используйте этот движок в сценариях, когда необходимо создавать большое количество таблиц с небольшим объёмом данных (менее 1 миллиона строк). Например, такую таблицу можно использовать для хранения входящих пакетов данных для последующей трансформации, когда требуется их атомарная обработка. До 100 тыс. экземпляров таблиц этого типа являются нормальной конфигурацией для одного сервера ClickHouse. Этот табличный движок следует предпочесть движку [Log](./log.md), когда требуется большое количество таблиц, однако это происходит за счёт эффективности чтения.



## Создание таблицы {#table_engines-stripelog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

См. подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).


## Запись данных {#table_engines-stripelog-writing-the-data}

Движок `StripeLog` хранит все столбцы в одном файле. Для каждого запроса `INSERT` ClickHouse добавляет блок данных в конец файла таблицы, записывая столбцы по отдельности.

Для каждой таблицы ClickHouse создает следующие файлы:

- `data.bin` — файл с данными.
- `index.mrk` — файл с метками. Метки содержат смещения для каждого столбца каждого вставленного блока данных.

Движок `StripeLog` не поддерживает операции `ALTER UPDATE` и `ALTER DELETE`.



## Чтение данных {#table_engines-stripelog-reading-the-data}

Файл с метками позволяет ClickHouse параллелизировать чтение данных. Это означает, что запрос `SELECT` возвращает строки в непредсказуемом порядке. Используйте оператор `ORDER BY` для сортировки строк.



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
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','Первое обычное сообщение')
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','Второе обычное сообщение'),(now(),'WARNING','Первое предупреждение')
```

Мы использовали два запроса `INSERT`, чтобы создать два блока данных в файле `data.bin`.

ClickHouse использует несколько потоков при выборке данных. Каждый поток читает отдельный блок данных и по мере завершения возвращает соответствующие строки независимо от других. В результате порядок блоков строк в выходных данных в большинстве случаев не совпадает с порядком этих же блоков во входных данных. Например:

```sql
SELECT * FROM stripe_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ Второе обычное сообщение │
│ 2019-01-18 14:34:53 │ WARNING      │ Первое предупреждение  │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ Первое обычное сообщение │
└─────────────────────┴──────────────┴───────────────────────────┘
```

Сортировка результатов (по умолчанию — по возрастанию):

```sql
SELECT * FROM stripe_log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ Первое обычное сообщение   │
│ 2019-01-18 14:27:32 │ REGULAR      │ Второе обычное сообщение   │
│ 2019-01-18 14:34:53 │ WARNING      │ Первое предупреждение      │
└─────────────────────┴──────────────┴────────────────────────────┘
```
