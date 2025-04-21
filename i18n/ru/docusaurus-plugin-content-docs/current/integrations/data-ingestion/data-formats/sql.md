---
sidebar_label: 'SQL Dumps'
slug: /integrations/data-formats/sql
title: 'Вставка и выгрузка SQL данных в ClickHouse'
description: 'Страница, описывающая, как передавать данные между другими базами данных и ClickHouse с использованием SQL дампов.'
---


# Вставка и выгрузка SQL данных в ClickHouse

ClickHouse можно легко интегрировать в инфраструктуру баз данных OLTP различными способами. Один из способов — это передача данных между другими базами данных и ClickHouse с использованием SQL дампов.

## Создание SQL дампов {#creating-sql-dumps}

Данные можно выгрузить в SQL формате с использованием [SQLInsert](/interfaces/formats.md/#sqlinsert). ClickHouse будет записывать данные в форме `INSERT INTO <имя таблицы> VALUES(...` и использовать опцию настройки [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) в качестве имени таблицы:

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

Имена колонок можно пропустить, отключив опцию [`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names):

```sql
SET output_format_sql_insert_include_column_names = 0
```

Теперь мы можем передать файл [dump.sql](assets/dump.sql) в другую OLTP базу данных:

```bash
mysql some_db < dump.sql
```

Предполагаем, что таблица `some_table` существует в базе данных MySQL `some_db`.

Некоторые СУБД могут иметь ограничения на количество значений, которые могут быть обработаны в одном пакете. По умолчанию ClickHouse создаёт пакеты из 65k значений, но это можно изменить с помощью опции [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size):

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

По умолчанию ClickHouse будет пропускать неизвестные колонки (под контролем опции [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)) и обрабатывать данные для первой найденной таблицы в дампе (если в один файл было выгружено несколько таблиц). DDL операторы будут пропущены. Чтобы загрузить данные из MySQL дампа в таблицу (файл [mysql.sql](assets/mysql.sql)):

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

Здесь мы создали таблицу с именем `table_from_mysql` на основе структуры, которую ClickHouse автоматически вывел. ClickHouse либо обнаруживает типы на основе данных, либо использует DDL, если он доступен:

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

ClickHouse предлагает поддержку многих форматов, как текстовых, так и бинарных, для охвата различных сценариев и платформ. Изучите больше форматов и способы работы с ними в следующих статьях:

- [CSV и TSV форматы](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON форматы](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- **SQL форматы**

И также проверьте [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - портативный многофункциональный инструмент для работы с локальными/удалёнными файлами без необходимости в сервере ClickHouse.
