---
sidebar_label: 'SQL Dumps'
slug: /integrations/data-formats/sql
title: 'Вставка и выгрузка SQL данных в ClickHouse'
description: 'Страница, описывающая, как передавать данные между другими базами данных и ClickHouse с использованием SQL дампов.'
---


# Вставка и выгрузка SQL данных в ClickHouse

ClickHouse можно легко интегрировать в инфраструктуру OLTP баз данных различными способами. Один из способов — передача данных между другими базами данных и ClickHouse с использованием SQL дампов.

## Создание SQL дампов {#creating-sql-dumps}

Данные могут быть выгружены в SQL формате с помощью [SQLInsert](/interfaces/formats.md/#sqlinsert). ClickHouse будет записывать данные в форме `INSERT INTO <имя таблицы> VALUES(...` и использовать настройку [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) в качестве имени таблицы:

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

Названия столбцов могут быть пропущены, если отключить опцию [`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names):

```sql
SET output_format_sql_insert_include_column_names = 0
```

Теперь мы можем передать файл [dump.sql](assets/dump.sql) в другую OLTP базу данных:

```bash
mysql some_db < dump.sql
```

Мы предполагаем, что таблица `some_table` существует в базе данных `some_db` MySQL.

Некоторые СУБД могут иметь ограничения на количество значений, которые могут быть обработаны за один раз. По умолчанию ClickHouse будет создавать пакеты по 65k значений, но это можно изменить с помощью опции [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size):

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### Экспорт набора значений {#exporting-a-set-of-values}

ClickHouse имеет формат [Values](/interfaces/formats.md/#data-format-values), который похож на SQLInsert, но опускает часть `INSERT INTO table VALUES` и возвращает только набор значений:

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```
```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```


## Вставка данных из SQL дампов {#inserting-data-from-sql-dumps}

Для чтения SQL дампов используется [MySQLDump](/interfaces/formats.md/#mysqldump):

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

По умолчанию ClickHouse будет пропускать неизвестные столбцы (это контролируется опцией [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)) и обрабатывать данные для первой найденной таблицы в дампе (в случае, если несколько таблиц были выгружены в один файл). DDL-запросы будут пропущены. Чтобы загрузить данные из MySQL дампа в таблицу (файл [mysql.sql](assets/mysql.sql)):

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

Мы также можем автоматически создать таблицу из файла MySQL дампа:

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

Здесь мы создали таблицу с именем `table_from_mysql` на основе структуры, которую ClickHouse автоматически вывел. ClickHouse определяет типы на основе данных или использует DDL, когда это возможно:

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

ClickHouse поддерживает множество форматов, как текстовых, так и бинарных, чтобы покрыть различные сценарии и платформы. Узнайте больше о форматах и способах работы с ними в следующих статьях:

- [CSV и TSV форматы](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON форматы](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- **SQL форматы**

Также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - портативным полнофункциональным инструментом для работы с локальными/удаленными файлами без необходимости в сервере ClickHouse.
