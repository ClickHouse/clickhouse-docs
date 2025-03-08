---
sidebar_label: 'SQL дампы'
slug: /integrations/data-formats/sql
---


# Вставка и дамп SQL данных в ClickHouse

ClickHouse можно легко интегрировать в инфраструктуру OLTP баз данных различными способами. Один из способов - передача данных между другими базами данных и ClickHouse с использованием SQL дампов.

## Создание SQL дампов {#creating-sql-dumps}

Данные можно экспортировать в SQL формате, используя [SQLInsert](/interfaces/formats.md/#sqlinsert). ClickHouse запишет данные в формате `INSERT INTO <имя таблицы> VALUES(...` и будет использовать параметр настройки [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) в качестве имени таблицы:

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

Имена колонок могут быть опущены, если отключить параметр настройки [`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names):

```sql
SET output_format_sql_insert_include_column_names = 0
```

Теперь мы можем передать файл [dump.sql](assets/dump.sql) в другую OLTP базу данных:

```bash
mysql some_db < dump.sql
```

Мы предполагаем, что таблица `some_table` существует в базе данных MySQL `some_db`.

Некоторые СУБД могут иметь ограничения на количество значений, которые можно обработать в одной партии. По умолчанию ClickHouse создает партии по 65k значений, но это можно изменить с помощью параметра настройки [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size):

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

По умолчанию ClickHouse пропустит неизвестные колонки (это контролируется параметром [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)) и обработает данные для первой найденной таблицы в дампе (в случае, если несколько таблиц были записаны в один файл). DDL операторы будут пропущены. Чтобы загрузить данные из MySQL дампа в таблицу (файл [mysql.sql](assets/mysql.sql)):

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

Мы также можем автоматически создать таблицу на основе файла MySQL дампа:

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

Здесь мы создали таблицу с именем `table_from_mysql` на основе структуры, которую ClickHouse определил автоматически. ClickHouse либо определяет типы на основе данных, либо использует DDL, когда это возможно:

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

ClickHouse вводит поддержку множества форматов, как текстовых, так и бинарных, чтобы охватить различные сценарии и платформы. Исследуйте больше форматов и способы работы с ними в следующих статьях:

- [CSV и TSV форматы](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON форматы](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- **SQL форматы**

Также проверьте [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - переносимый, полнофункциональный инструмент для работы с локальными/удаленными файлами без необходимости серверa ClickHouse.
