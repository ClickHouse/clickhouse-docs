---
description: 'Создает таблицу из данных по `URL` с указанными `format` и `structure`'
sidebar_label: 'url'
sidebar_position: 200
slug: /sql-reference/table-functions/url
title: 'url'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Табличная функция url \\{#url-table-function\\}

Функция `url` создаёт таблицу на основе `URL` с заданными `format` и `structure`.

Функция `url` может использоваться в запросах `SELECT` и `INSERT` к данным в таблицах [URL](../../engines/table-engines/special/url.md).

## Синтаксис \\{#syntax\\}

```sql
url(URL [,format] [,structure] [,headers])
```

## Параметры \\{#parameters\\}

| Параметр   | Описание                                                                                                                                            |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `URL`       | HTTP- или HTTPS-адрес сервера в одинарных кавычках, который может принимать запросы `GET` или `POST` (для запросов `SELECT` или `INSERT` соответственно). Тип: [String](../../sql-reference/data-types/string.md). |
| `format`    | [Формат](/sql-reference/formats) данных. Тип: [String](../../sql-reference/data-types/string.md).                                                  |
| `structure` | Структура таблицы в формате `'UserID UInt64, Name String'`. Определяет имена и типы столбцов. Тип: [String](../../sql-reference/data-types/string.md).     |
| `headers`   | Заголовки в формате `'headers('key1'='value1', 'key2'='value2')'`. Позволяет задать заголовки для HTTP-запроса.                                                  |

## Возвращаемое значение \\{#returned_value\\}

Таблица с указанным форматом и структурой, содержащая данные из заданного `URL`-адреса.

## Примеры \\{#examples\\}

Получение первых трёх строк таблицы, содержащей столбцы типов `String` и [UInt32](../../sql-reference/data-types/int-uint.md), с HTTP-сервера, который отвечает в формате [CSV](/interfaces/formats/CSV).

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

Вставка данных из `URL`-адреса в таблицу:

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## Глоб-шаблоны в URL \\{#globs-in-url\\}

Шаблоны в фигурных скобках `{ }` используются для формирования набора шардов или указания резервных адресов. Поддерживаемые типы шаблонов и примеры см. в описании функции [remote](remote.md#globs-in-addresses).
Символ `|` внутри шаблонов используется для указания резервных адресов. Они перебираются в том же порядке, в котором перечислены в шаблоне. Количество сгенерированных адресов ограничивается настройкой [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements).

## Виртуальные столбцы \\{#virtual-columns\\}

- `_path` — Путь к `URL`. Тип: `LowCardinality(String)`.
- `_file` — Имя ресурса в `URL`. Тип: `LowCardinality(String)`.
- `_size` — Размер ресурса в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_headers` — Заголовки HTTP-ответа. Тип: `Map(LowCardinality(String), LowCardinality(String))`.

## настройка use&#95;hive&#95;partitioning \\{#hive-style-partitioning\\}

Когда настройка `use_hive_partitioning` установлена в 1, ClickHouse будет распознавать секционирование в стиле Hive в пути (`/name=value/`) и позволит использовать столбцы секций как виртуальные столбцы в запросе. Эти виртуальные столбцы будут иметь те же имена, что и в пути секционирования, но с префиксом `_`.

**Пример**

Использование виртуального столбца, созданного с помощью секционирования в стиле Hive

```sql
SELECT * FROM url('http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## Настройки хранения \\{#storage-settings\\}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) — позволяет пропускать пустые файлы при чтении. По умолчанию отключено.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) — позволяет включать или отключать декодирование/кодирование пути в URI. По умолчанию включено.

## Разрешения \\{#permissions\\}

Функция `url` требует прав `CREATE TEMPORARY TABLE`. Поэтому она не будет работать для пользователей с настройкой [`readonly`](/operations/settings/permissions-for-queries#readonly) = 1. Требуется как минимум `readonly` = 2.

## См. также \\{#related\\}

- [Виртуальные столбцы](/engines/table-engines/index.md#table_engines-virtual_columns)
