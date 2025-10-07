---
'sidebar_label': 'SQL выгрузки'
'slug': '/integrations/data-formats/sql'
'title': 'Вставка и выгрузка SQL данных в ClickHouse'
'description': 'Страница, описывающая, как передавать данные между другими БАЗАМИ
  ДАННЫХ и ClickHouse с использованием SQL выгрузок.'
'doc_type': 'guide'
---


# Вставка и выгрузка SQL данных в ClickHouse

ClickHouse может быть легко интегрирован в инфраструктуры баз данных OLTP различными способами. Один из способов - передать данные между другими базами данных и ClickHouse с помощью SQL дампов.

## Создание SQL дампов {#creating-sql-dumps}

Данные могут быть выгружены в формате SQL с использованием [SQLInsert](/interfaces/formats.md/#sqlinsert). ClickHouse запишет данные в формате `INSERT INTO <имя таблицы> VALUES(...` и будет использовать настройку [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) в качестве имени таблицы:

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

Имена колонок могут быть опущены, если отключить настройку [`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names):

```sql
SET output_format_sql_insert_include_column_names = 0
```

Теперь мы можем передать файл [dump.sql](assets/dump.sql) в другую OLTP базу данных:

```bash
mysql some_db < dump.sql
```

Мы предполагаем, что таблица `some_table` существует в базе данных `some_db` MySQL.

Некоторые СУБД могут иметь ограничения на количество значений, которые могут быть обработаны в одном пакете. По умолчанию ClickHouse создаст пакеты из 65 тыс. значений, но это можно изменить с помощью опции [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size):

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### Экспорт набора значений {#exporting-a-set-of-values}

ClickHouse имеет формат [Values](/interfaces/formats.md/#data-format-values), который аналогичен SQLInsert, но опускает часть `INSERT INTO table VALUES` и возвращает только набор значений:

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

По умолчанию ClickHouse будет пропускать неизвестные колонки (что контролируется опцией [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)) и обрабатывать данные для первой найденной таблицы в дампе (в случае если несколько таблиц были выгружены в один файл). DDL операции будут пропущены. Чтобы загрузить данные из дампа MySQL в таблицу ([mysql.sql](assets/mysql.sql) файл):

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

Мы также можем автоматически создать таблицу из файла дампа MySQL:

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

Здесь мы создали таблицу с именем `table_from_mysql` на основе структуры, которую ClickHouse автоматически вывел. ClickHouse либо определяет типы на основе данных, либо использует DDL, если это возможно:

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

ClickHouse вводит поддержку многих форматов, как текстовых, так и бинарных, чтобы охватить различные сценарии и платформы. Исследуйте больше форматов и способы работы с ними в следующих статьях:

- [CSV и TSV форматы](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON форматы](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- **SQL форматы**

Также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - переносным полнофункциональным инструментом для работы с локальными/удаленными файлами без необходимости в сервере ClickHouse.
