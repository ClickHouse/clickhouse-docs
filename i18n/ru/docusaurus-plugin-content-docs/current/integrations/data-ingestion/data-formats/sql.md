---
sidebar_label: 'Дампы SQL'
slug: /integrations/data-formats/sql
title: 'Вставка данных и создание дампов SQL в ClickHouse'
description: 'Страница, описывающая, как передавать данные между другими базами данных и ClickHouse с помощью дампов SQL.'
doc_type: 'guide'
keywords: ['формат SQL', 'экспорт данных', 'импорт данных', 'резервное копирование', 'дампы SQL']
---

# Вставка и выгрузка SQL-данных в ClickHouse {#inserting-and-dumping-sql-data-in-clickhouse}

ClickHouse можно легко интегрировать в OLTP‑инфраструктуры баз данных разными способами. Один из вариантов — передавать данные между другими базами данных и ClickHouse с помощью SQL‑дампов.

## Создание SQL-дампов {#creating-sql-dumps}

Данные можно выгрузить в формате SQL с помощью [SQLInsert](/interfaces/formats/SQLInsert). ClickHouse запишет данные в виде `INSERT INTO <table name> VALUES(...` и будет использовать настройку [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) в качестве имени таблицы:

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

Имена столбцов можно опустить, отключив настройку [`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names):

```sql
SET output_format_sql_insert_include_column_names = 0
```

Теперь мы можем загрузить файл [dump.sql](assets/dump.sql) в другую OLTP-базу данных:

```bash
mysql some_db < dump.sql
```

Мы предполагаем, что таблица `some_table` существует в базе данных MySQL `some_db`.

Некоторые СУБД могут иметь ограничения на количество значений, которые могут быть обработаны в одном пакете. По умолчанию ClickHouse будет создавать пакеты по 65 тыс. значений, но это можно изменить с помощью опции [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size):

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### Экспорт набора значений {#exporting-a-set-of-values}

В ClickHouse есть формат [Values](/interfaces/formats/Values), который аналогичен SQL INSERT, но опускает оператор `INSERT INTO table VALUES` и содержит только набор значений:

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```

```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```

## Импорт данных из SQL-дампов {#inserting-data-from-sql-dumps}

Для чтения SQL-дампов используется формат [MySQLDump](/interfaces/formats/MySQLDump):

```sql
SELECT *
FROM file('dump.sql', MySQLDump)
LIMIT 5
```

```response
┌─path───────────────────────────┬──────month─┬─hits─┐
│ Bangor_City_Forest             │ 2015-07-01 │   34 │
│ Alireza_Afzal                  │ 2017-02-01 │   24 │
│ Akhaura-Laksam-Chittagong_Line │ 2015-09-01 │   30 │
│ 1973_National_500              │ 2017-10-01 │   80 │
│ Attachment                     │ 2017-09-01 │ 1356 │
└────────────────────────────────┴────────────┴──────┘
```

По умолчанию ClickHouse будет пропускать неизвестные столбцы (за это отвечает опция [input&#95;format&#95;skip&#95;unknown&#95;fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)) и обрабатывать данные для первой найденной в дампе таблицы (если в один файл выгружено несколько таблиц). Операторы DDL будут пропущены. Чтобы загрузить данные из дампа MySQL в таблицу (файл [mysql.sql](assets/mysql.sql)):

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

Мы также можем автоматически создать таблицу на основе файла дампа MySQL:

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

Здесь мы создали таблицу с именем `table_from_mysql` на основе структуры, которую ClickHouse автоматически определил. ClickHouse либо определяет типы на основе данных, либо использует DDL, если она доступна:

```sql
DESCRIBE TABLE table_from_mysql;
```

```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ Nullable(String) │              │                    │         │                  │                │
│ month │ Nullable(Date32) │              │                    │         │                  │                │
│ hits  │ Nullable(UInt32) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## Другие форматы {#other-formats}

ClickHouse поддерживает множество форматов, как текстовых, так и бинарных, чтобы охватить различные сценарии и платформы. Узнайте больше о форматах и способах работы с ними в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Parquet](parquet.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения (Regex) и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- **SQL-форматы**

Также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — переносимым полнофункциональным инструментом для работы с локальными и удалёнными файлами без необходимости запускать сервер ClickHouse.
