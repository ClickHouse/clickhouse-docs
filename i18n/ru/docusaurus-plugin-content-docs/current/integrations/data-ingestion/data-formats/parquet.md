---
sidebar_label: 'Parquet'
sidebar_position: 3
slug: /integrations/data-formats/parquet
title: 'Работа с Parquet в ClickHouse'
description: 'Руководство по работе с форматом Parquet в ClickHouse'
doc_type: 'guide'
keywords: ['parquet', 'колоночный формат', 'формат данных', 'сжатие', 'apache parquet']
---



# Работа с Parquet в ClickHouse

Parquet — это эффективный файловый формат для хранения данных в колонко-ориентированном виде.
ClickHouse поддерживает как чтение, так и запись файлов Parquet.

:::tip
Когда вы указываете путь к файлу в запросе, то место, откуда ClickHouse попытается читать данные, зависит от используемого варианта ClickHouse.

Если вы используете [`clickhouse-local`](/operations/utilities/clickhouse-local.md), он будет читать из пути, заданного относительно каталога, из которого вы запустили ClickHouse Local.
Если вы используете ClickHouse Server или ClickHouse Cloud через `clickhouse client`, чтение будет происходить из пути, заданного относительно каталога `/var/lib/clickhouse/user_files/` на сервере.
:::



## Импорт из Parquet {#importing-from-parquet}

Перед загрузкой данных можно использовать функцию [file()](/sql-reference/functions/files.md/#file) для изучения структуры [примера parquet-файла](assets/data.parquet):

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

Мы использовали [Parquet](/interfaces/formats/Parquet) в качестве второго аргумента, чтобы ClickHouse определил формат файла. Эта команда выведет столбцы с их типами:

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Также можно изучать файлы перед импортом данных, используя все возможности SQL:

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

Создадим таблицу, в которую импортируем данные Parquet:

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

Теперь можно импортировать данные с помощью конструкции `FROM INFILE`:

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

Обратите внимание, что ClickHouse автоматически преобразовал строки Parquet (в столбце `date`) в тип `Date`. Это происходит потому, что ClickHouse автоматически приводит типы на основе типов в целевой таблице.


## Вставка локального файла на удалённый сервер {#inserting-a-local-file-to-remote-server}

Чтобы вставить локальный Parquet-файл на удалённый сервер ClickHouse, можно передать содержимое файла в `clickhouse-client` через конвейер, как показано ниже:

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```


## Создание новых таблиц из файлов Parquet {#creating-new-tables-from-parquet-files}

Поскольку ClickHouse читает схему файлов Parquet, можно создавать таблицы на лету:

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

Это автоматически создаст и заполнит таблицу из указанного файла Parquet:

```sql
DESCRIBE TABLE imported_from_parquet;
```

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

По умолчанию ClickHouse строго относится к именам столбцов, типам и значениям. Однако иногда при импорте можно пропускать несуществующие столбцы или неподдерживаемые значения. Это настраивается с помощью [настроек Parquet](/interfaces/formats/Parquet#format-settings).


## Экспорт в формат Parquet {#exporting-to-parquet-format}

:::tip
При использовании `INTO OUTFILE` с ClickHouse Cloud команды необходимо выполнять в `clickhouse client` на той машине, куда будет записан файл.
:::

Для экспорта таблицы или результата запроса в файл Parquet используется конструкция `INTO OUTFILE`:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

Эта команда создаст файл `export.parquet` в рабочем каталоге.


## Типы данных ClickHouse и Parquet {#clickhouse-and-parquet-data-types}

Типы данных ClickHouse и Parquet в основном идентичны, но всё же [немного отличаются](/interfaces/formats/Parquet#data-types-matching-parquet). Например, ClickHouse экспортирует тип `DateTime` как `int64` в Parquet. При последующем импорте этих данных обратно в ClickHouse мы увидим числа ([файл time.parquet](assets/time.parquet)):

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

В этом случае можно использовать [преобразование типов](/sql-reference/functions/type-conversion-functions.md):

```sql
SELECT
    n,
    toDateTime(time)                 <--- из int в time
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

ClickHouse поддерживает множество форматов данных — как текстовых, так и бинарных — для работы в различных сценариях и на разных платформах. Подробнее о форматах и способах работы с ними читайте в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Avro, Arrow и ORC](arrow-avro-orc.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- [Форматы SQL](sql.md)

Также рекомендуем ознакомиться с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — портативным полнофункциональным инструментом для работы с локальными и удалёнными файлами без необходимости запуска сервера ClickHouse.
