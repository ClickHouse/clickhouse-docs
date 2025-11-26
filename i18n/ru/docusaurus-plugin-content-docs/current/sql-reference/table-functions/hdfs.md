---
description: 'Создает таблицу из файлов в HDFS. Эта табличная функция аналогична
  функциям url и file.'
sidebar_label: 'hdfs'
sidebar_position: 80
slug: /sql-reference/table-functions/hdfs
title: 'hdfs'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Табличная функция hdfs

Создает таблицу из файлов в HDFS. Эта табличная функция аналогична табличным функциям [url](../../sql-reference/table-functions/url.md) и [file](../../sql-reference/table-functions/file.md).



## Синтаксис

```sql
hdfs(URI, format, structure)
```


## Аргументы {#arguments}

| Аргумент  | Описание                                                                                                                                                                                                                   |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URI`     | Относительный URI файла в HDFS. Путь к файлу в режиме только для чтения поддерживает следующие glob-шаблоны: `*`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc', 'def'` — строки. |
| `format`  | [Формат](/sql-reference/formats) файла.                                                                                                                                                                                    |
| `structure`| Структура таблицы. В формате `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                              |



## Возвращаемое значение

Таблица заданной структуры для чтения или записи данных в указанный файл.

**Пример**

Таблица из `hdfs://hdfs1:9000/test` и выборка первых двух строк из неё:

```sql
SELECT *
FROM hdfs('hdfs://hdfs1:9000/test', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```


## Глоб-шаблоны в пути

В путях можно использовать глоб-шаблоны. Файлы должны соответствовать всему шаблону пути, а не только суффиксу или префиксу.

* `*` — Обозначает произвольное количество символов, кроме `/`, включая пустую строку.
* `**` — Обозначает все файлы в каталоге и его подкаталогах (рекурсивно).
* `?` — Обозначает один произвольный символ.
* `{some_string,another_string,yet_another_one}` — Подставляет любую из строк `'some_string', 'another_string', 'yet_another_one'`. Строки могут содержать символ `/`.
* `{N..M}` — Обозначает любое число от `N` до `M` включительно.

Конструкции с `{}` аналогичны табличным функциям [remote](remote.md) и [file](file.md).

**Пример**

1. Предположим, что у нас есть несколько файлов со следующими URI в HDFS:

* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;3&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;3&#39;

2. Выполним запрос, чтобы подсчитать количество строк в этих файлах:

{/* */ }

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. Выполните запрос, чтобы узнать количество строк во всех файлах в этих двух каталогах:

{/* */ }

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
Если в списке файлов есть числовые диапазоны с ведущими нулями, используйте конструкцию с фигурными скобками для каждой позиции цифры отдельно или символ `?`.
:::

**Пример**

Выполните запрос к данным из файлов `file000`, `file001`, ... , `file999`:

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.



## параметр use&#95;hive&#95;partitioning

Когда параметр `use_hive_partitioning` установлен в значение 1, ClickHouse будет обнаруживать секционирование в стиле Hive в пути (`/name=value/`) и позволит использовать столбцы секций как виртуальные столбцы в запросе. Эти виртуальные столбцы будут иметь те же имена, что и в секционированном пути, но с префиксом `_`.

**Пример**

Использование виртуального столбца, созданного при секционировании в стиле Hive

```sql
SELECT * FROM HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## Настройки хранилища {#storage-settings}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) — позволяет усекать файл перед вставкой данных в него. По умолчанию отключено.
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) — позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. По умолчанию отключено.
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) — позволяет пропускать пустые файлы при чтении. По умолчанию отключено.



## См. также {#related}

- [Виртуальные столбцы](../../engines/table-engines/index.md#table_engines-virtual_columns)
