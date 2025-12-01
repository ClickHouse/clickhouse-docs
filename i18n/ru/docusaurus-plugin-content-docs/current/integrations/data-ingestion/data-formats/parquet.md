---
sidebar_label: 'Parquet'
sidebar_position: 3
slug: /integrations/data-formats/parquet
title: 'Работа с Parquet в ClickHouse'
description: 'Страница о работе с Parquet в ClickHouse'
doc_type: 'guide'
keywords: ['parquet', 'колоночный формат', 'формат данных', 'сжатие', 'apache parquet']
---



# Работа с Parquet в ClickHouse {#working-with-parquet-in-clickhouse}

Parquet — это эффективный файловый формат для хранения данных в колоночном формате.
ClickHouse поддерживает как чтение, так и запись файлов Parquet.

:::tip
Когда вы указываете путь к файлу в запросе, то, откуда ClickHouse попытается читать данные, зависит от варианта ClickHouse, который вы используете.

Если вы используете [`clickhouse-local`](/operations/utilities/clickhouse-local.md), чтение будет выполняться из пути, относительно директории, из которой вы запустили clickhouse-local.
Если вы используете ClickHouse Server или ClickHouse Cloud через `clickhouse client`, чтение будет выполняться из пути, относительно директории `/var/lib/clickhouse/user_files/` на сервере.
:::



## Импорт из Parquet {#importing-from-parquet}

Перед загрузкой данных мы можем использовать функцию [file()](/sql-reference/functions/files.md/#file), чтобы изучить структуру [примерного файла формата Parquet](assets/data.parquet):

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

Мы использовали [Parquet](/interfaces/formats/Parquet) в качестве второго аргумента, чтобы указать ClickHouse формат файла. Будут выведены столбцы и их типы:

```response
┌─имя──┬─тип──────────────┬─тип_по_умолчанию─┬─выражение_по_умолчанию─┬─комментарий─┬─выражение_кодека─┬─выражение_ttl─┐
│ path │ Nullable(String) │                  │                         │             │                  │               │
│ date │ Nullable(String) │                  │                         │             │                  │               │
│ hits │ Nullable(Int64)  │                  │                         │             │                  │               │
└──────┴──────────────────┴──────────────────┴─────────────────────────┴─────────────┴──────────────────┴───────────────┘
```

Мы также можем исследовать файлы перед импортом данных, используя всю мощь SQL:

```sql
SELECT *
FROM file('data.parquet', Parquet)
LIMIT 3;
```

```response
┌─path──────────────────────┬─date───────┬─hits─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
└───────────────────────────┴────────────┴──────┘
```

:::tip
Можно не указывать формат явно для `file()` и `INFILE`/`OUTFILE`.
В этом случае ClickHouse автоматически определит формат по расширению файла.
:::


## Импорт в существующую таблицу {#importing-to-an-existing-table}

Создадим таблицу, в которую будем импортировать данные в формате Parquet:

```sql
CREATE TABLE sometable
(
    `path` String,
    `date` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY (date, path);
```

Теперь можно импортировать данные с помощью предложения `FROM INFILE`:

```sql
INSERT INTO sometable
FROM INFILE 'data.parquet' FORMAT Parquet;

SELECT *
FROM sometable
LIMIT 5;
```

```response
┌─path──────────────────────────┬───────date─┬─hits─┐
│ 1988_in_philosophy            │ 2015-05-01 │   70 │
│ 2004_Green_Bay_Packers_season │ 2015-05-01 │  970 │
│ 24_hours_of_lemans            │ 2015-05-01 │   37 │
│ 25604_Karlin                  │ 2015-05-01 │   20 │
│ ASCII_ART                     │ 2015-05-01 │    9 │
└───────────────────────────────┴────────────┴──────┘
```

Обратите внимание, что ClickHouse автоматически преобразовал строки формата Parquet (в столбце `date`) в тип `Date`. Это происходит потому, что ClickHouse выполняет приведение типов на основе типов в целевой таблице.


## Загрузка локального файла на удалённый сервер {#inserting-a-local-file-to-remote-server}

Если вы хотите загрузить локальный файл Parquet на удалённый сервер ClickHouse, вы можете сделать это, передав его содержимое в `clickhouse-client` через pipe, как показано ниже:

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```


## Создание новых таблиц из файлов Parquet {#creating-new-tables-from-parquet-files}

Поскольку ClickHouse читает схему файлов Parquet, мы можем динамически создавать таблицы:

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

Это автоматически создаст и заполнит таблицу на основе указанного parquet-файла:

```sql
DESCRIBE TABLE imported_from_parquet;
```

```response
┌─имя──┬─тип──────────────┬─тип_по_умолчанию─┬─выражение_по_умолчанию─┬─комментарий─┬─выражение_кодека─┬─выражение_ttl─┐
│ path │ Nullable(String) │                  │                         │             │                  │               │
│ date │ Nullable(String) │                  │                         │             │                  │               │
│ hits │ Nullable(Int64)  │                  │                         │             │                  │               │
└──────┴──────────────────┴──────────────────┴─────────────────────────┴─────────────┴──────────────────┴───────────────┘
```

По умолчанию ClickHouse строго проверяет имена столбцов, их типы и значения. Но иногда при импорте можно игнорировать несуществующие столбцы или неподдерживаемые значения. Это можно настроить с помощью [настроек Parquet](/interfaces/formats/Parquet#format-settings).


## Экспорт в формат Parquet {#exporting-to-parquet-format}

:::tip
При использовании `INTO OUTFILE` с ClickHouse Cloud команды в `clickhouse client` нужно запускать на той машине (хосте), на которую будет записан файл.
:::

Чтобы экспортировать любую таблицу или результат запроса в файл Parquet, можно использовать конструкцию `INTO OUTFILE`:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

В результате в текущем рабочем каталоге будет создан файл `export.parquet`.


## Типы данных ClickHouse и Parquet {#clickhouse-and-parquet-data-types}

Типы данных ClickHouse и Parquet в основном совпадают, но всё же [имеют некоторые отличия](/interfaces/formats/Parquet#data-types-matching-parquet). Например, ClickHouse экспортирует тип `DateTime` как значение типа `int64` в формате Parquet. Если затем импортировать его обратно в ClickHouse, мы увидим числа ([файл time.parquet](assets/time.parquet)):

```sql
SELECT * FROM file('time.parquet', Parquet);
```

```response
┌─n─┬───────time─┐
│ 0 │ 1673622611 │
│ 1 │ 1673622610 │
│ 2 │ 1673622609 │
│ 3 │ 1673622608 │
│ 4 │ 1673622607 │
└───┴────────────┘
```

В этом случае можно использовать [функции преобразования типов](/sql-reference/functions/type-conversion-functions.md):

```sql
SELECT
    n,
    toDateTime(time)                 <--- преобразование целого числа в DateTime
FROM file('time.parquet', Parquet);
```

```response
┌─n─┬────toDateTime(time)─┐
│ 0 │ 2023-01-13 15:10:11 │
│ 1 │ 2023-01-13 15:10:10 │
│ 2 │ 2023-01-13 15:10:09 │
│ 3 │ 2023-01-13 15:10:08 │
│ 4 │ 2023-01-13 15:10:07 │
└───┴─────────────────────┘
```


## Дополнительные материалы {#further-reading}

ClickHouse поддерживает множество форматов, как текстовых, так и бинарных, для самых разных сценариев и платформ. Подробнее о форматах и работе с ними см. в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Avro, Arrow и ORC](arrow-avro-orc.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- [Форматы SQL](sql.md)

Также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — переносимым полнофункциональным инструментом для работы с локальными и удалёнными файлами без необходимости развёртывать сервер ClickHouse.
