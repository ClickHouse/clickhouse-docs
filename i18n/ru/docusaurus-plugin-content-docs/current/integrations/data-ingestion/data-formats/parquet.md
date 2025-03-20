---
sidebar_label: Parquet
sidebar_position: 3
slug: /integrations/data-formats/parquet
---


# Работа с Parquet в ClickHouse

Parquet — это эффективный формат файла для хранения данных в колоночном виде. ClickHouse поддерживает как чтение, так и запись файлов Parquet.

:::tip
Когда вы ссылаетесь на путь к файлу в запросе, из которого ClickHouse попытается прочитать, будет зависеть от варианта ClickHouse, который вы используете.

Если вы используете [`clickhouse-local`](/operations/utilities/clickhouse-local.md), он будет читать из местоположения, относительно того, где вы запустили ClickHouse Local. Если вы используете ClickHouse Server или ClickHouse Cloud через `clickhouse client`, он будет читать из местоположения, относительно каталога `/var/lib/clickhouse/user_files/` на сервере.
:::

## Импорт из Parquet {#importing-from-parquet}

Перед загрузкой данных мы можем использовать [file()](/sql-reference/functions/files.md/#file) функцию, чтобы изучить структуру [пример файла parquet](assets/data.parquet):

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

Мы использовали [Parquet](/interfaces/formats.md/#data-format-parquet) в качестве второго аргумента, чтобы ClickHouse знал формат файла. Это выведет колонки с типами:

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Мы также можем изучить файлы перед фактическим импортом данных, используя всю мощь SQL:

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
Мы можем пропустить явную установку формата для `file()` и `INFILE`/`OUTFILE`. В этом случае ClickHouse автоматически определит формат на основе расширения файла.
:::

## Импорт в существующую таблицу {#importing-to-an-existing-table}

Давайте создадим таблицу, в которую мы импортируем данные Parquet:

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

Теперь мы можем импортировать данные с помощью инструкции `FROM INFILE`:


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

Обратите внимание, как ClickHouse автоматически преобразовал строки Parquet (в колонке `date`) в тип `Date`. Это происходит потому, что ClickHouse автоматически выполняет преобразование типа на основе типов в целевой таблице.

## Вставка локального файла на удаленный сервер {#inserting-a-local-file-to-remote-server}

Если вы хотите вставить локальный файл Parquet на удаленный сервер ClickHouse, вы можете сделать это, перенаправив содержимое файла в `clickhouse-client`, как показано ниже:

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```

## Создание новых таблиц из файлов Parquet {#creating-new-tables-from-parquet-files}

Поскольку ClickHouse читает схему файла parquet, мы можем создавать таблицы на лету:

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

Это автоматически создаст и заполнит таблицу из заданного файла parquet:

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

По умолчанию ClickHouse строг к именам колонок, типам и значениям. Но иногда мы можем пропустить несуществующие колонки или неподдерживаемые значения во время импорта. Это можно настроить с помощью [настроек Parquet](/interfaces/formats/Parquet#format-settings).


## Экспорт в формат Parquet {#exporting-to-parquet-format}

:::tip
При использовании `INTO OUTFILE` с ClickHouse Cloud вам нужно будет выполнять команды в `clickhouse client` на машине, где файл будет записан.
:::

Чтобы экспортировать любую таблицу или результат запроса в файл Parquet, мы можем использовать инструкцию `INTO OUTFILE`:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

Это создаст файл `export.parquet` в рабочем каталоге.

## Типы данных ClickHouse и Parquet {#clickhouse-and-parquet-data-types}
Типы данных ClickHouse и Parquet в основном идентичны, но все же [немного различаются](/interfaces/formats/Parquet#data-types-matching-parquet). Например, ClickHouse экспортирует тип `DateTime` как `int64` Parquet. Если мы затем импортируем это обратно в ClickHouse, мы увидим числа ([файл time.parquet](assets/time.parquet)):

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

В этом случае может быть использовано [преобразование типов](/sql-reference/functions/type-conversion-functions.md):

```sql
SELECT
    n,
    toDateTime(time)                 <--- int to time
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


## Дальнейшее чтение {#further-reading}

ClickHouse вводит поддержку множества форматов, как текстовых, так и двоичных, чтобы покрыть различные сценарии и платформы. Изучите больше форматов и способы работы с ними в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Avro, Arrow и ORC](arrow-avro-orc.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex и шаблоны](templates-regex.md)
- [Нативные и двоичные форматы](binary.md)
- [SQL форматы](sql.md)

Также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - переносным полнофункциональным инструментом для работы с локальными/удаленными файлами без необходимости в сервере ClickHouse.
