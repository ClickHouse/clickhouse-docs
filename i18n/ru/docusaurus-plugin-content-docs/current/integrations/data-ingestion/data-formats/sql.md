---
sidebar_label: 'SQL-дампы'
slug: /integrations/data-formats/sql
title: 'Вставка и выгрузка данных SQL в ClickHouse'
description: 'Страница, описывающая, как переносить данные между другими базами данных и ClickHouse с помощью SQL-дампов.'
doc_type: 'guide'
keywords: ['формат SQL', 'экспорт данных', 'импорт данных', 'резервное копирование', 'SQL-дампы']
---



# Загрузка и выгрузка SQL‑данных в ClickHouse

ClickHouse можно легко интегрировать в OLTP‑инфраструктуры баз данных многими способами. Один из них — передавать данные между другими базами данных и ClickHouse с помощью SQL‑дампов.



## Создание SQL-дампов {#creating-sql-dumps}

Данные можно выгрузить в формате SQL с помощью [SQLInsert](/interfaces/formats/SQLInsert). ClickHouse будет записывать данные в виде `INSERT INTO <table name> VALUES(...` и использовать параметр [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) в качестве имени таблицы:

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

Имена столбцов можно опустить, отключив параметр [`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names):

```sql
SET output_format_sql_insert_include_column_names = 0
```

Теперь можно загрузить файл [dump.sql](assets/dump.sql) в другую OLTP базу данных:

```bash
mysql some_db < dump.sql
```

Предполагается, что таблица `some_table` существует в базе данных MySQL `some_db`.

Некоторые СУБД могут иметь ограничения на количество значений, обрабатываемых в одном пакете. По умолчанию ClickHouse создаёт пакеты из 65 тысяч значений, но это можно изменить с помощью параметра [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size):

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### Экспорт набора значений {#exporting-a-set-of-values}

В ClickHouse есть формат [Values](/interfaces/formats/Values), который похож на SQLInsert, но опускает часть `INSERT INTO table VALUES` и возвращает только набор значений:

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```

```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```


## Вставка данных из SQL-дампов {#inserting-data-from-sql-dumps}

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

По умолчанию ClickHouse пропускает неизвестные столбцы (управляется настройкой [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)) и обрабатывает данные первой найденной таблицы в дампе (если в один файл выгружено несколько таблиц). DDL-инструкции пропускаются. Для загрузки данных из дампа MySQL в таблицу (файл [mysql.sql](assets/mysql.sql)):

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

Также можно автоматически создать таблицу из файла дампа MySQL:

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

Здесь создана таблица `table_from_mysql` на основе структуры, автоматически определённой ClickHouse. ClickHouse определяет типы данных на основе содержимого или использует DDL, если он доступен:

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

ClickHouse поддерживает множество форматов — как текстовых, так и бинарных — для работы в различных сценариях и на разных платформах. Подробнее о форматах и способах работы с ними читайте в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Parquet](parquet.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- **Форматы SQL**

Также рекомендуем ознакомиться с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — портативным полнофункциональным инструментом для работы с локальными и удалёнными файлами без необходимости запуска сервера ClickHouse.
