---
slug: '/sql-reference/table-functions/url'
sidebar_label: url
sidebar_position: 200
description: 'Создаёт таблицу из `URL` с заданным `форматом` и `структурой`'
title: url
doc_type: reference
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Функция Таблицы url

`url` функция создает таблицу из `URL` с заданным `форматом` и `структурой`.

`url` функция может использоваться в запросах `SELECT` и `INSERT` для данных в [URL](../../engines/table-engines/special/url.md) таблицах.

## Синтаксис {#syntax}

```sql
url(URL [,format] [,structure] [,headers])
```

## Параметры {#parameters}

| Параметр   | Описание                                                                                                                                          |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `URL`       | Адрес сервера HTTP или HTTPS в одинарных кавычках, который может принимать `GET` или `POST` запросы (соответственно для запросов `SELECT` или `INSERT`). Тип: [String](../../sql-reference/data-types/string.md). |
| `format`    | [Формат](/sql-reference/formats) данных. Тип: [String](../../sql-reference/data-types/string.md).                                                  |
| `structure` | Структура таблицы в формате `'UserID UInt64, Name String'`. Определяет названия и типы колонок. Тип: [String](../../sql-reference/data-types/string.md).     |
| `headers`   | Заголовки в формате `'headers('key1'='value1', 'key2'='value2')'`. Вы можете задать заголовки для HTTP вызова.                                 |

## Возвращаемое значение {#returned_value}

Таблица с указанным форматом и структурой, и с данными из заданного `URL`.

## Примеры {#examples}

Получение первых 3 строк таблицы, содержащей колонки типа `String` и [UInt32](../../sql-reference/data-types/int-uint.md) с HTTP-сервера, который отвечает в формате [CSV](../../interfaces/formats.md#csv).

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

Вставка данных из `URL` в таблицу:

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## Шаблоны в URL {#globs-in-url}

Шаблоны в фигурных скобках `{ }` используются для генерации набора шардов или для указания запасных адресов. Поддерживаемые типы шаблонов и примеры смотрите в описании функции [remote](remote.md#globs-in-addresses).
Символ `|` внутри шаблонов используется для указания запасных адресов. Они перебираются в том же порядке, в котором указаны в шаблоне. Количество сгенерированных адресов ограничено настройкой [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements).

## Виртуальные колонки {#virtual-columns}

- `_path` — Путь к `URL`. Тип: `LowCardinality(String)`.
- `_file` — Имя ресурса `URL`. Тип: `LowCardinality(String)`.
- `_size` — Размер ресурса в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение будет `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение будет `NULL`.
- `_headers` - Заголовки HTTP-ответа. Тип: `Map(LowCardinality(String), LowCardinality(String))`.

## Настройка use_hive_partitioning {#hive-style-partitioning}

Когда настройка `use_hive_partitioning` установлена в 1, ClickHouse будет обнаруживать партиционирование в стиле Hive в пути (`/name=value/`) и позволит использовать колонки партиции в качестве виртуальных колонок в запросе. Эти виртуальные колонки будут иметь такие же имена, как в партиционированном пути, но начинаются с `_`.

**Пример**

Использование виртуальной колонки, созданной с помощью партиционирования в стиле Hive

```sql
SELECT * FROM url('http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## Настройки хранения {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - позволяет пропускать пустые файлы при чтении. По умолчанию отключено.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - позволяет включать/отключать декодирование/кодирование пути в uri. По умолчанию включено.

## Права {#permissions}

Функция `url` требует разрешение `CREATE TEMPORARY TABLE`. Таким образом — она не будет работать для пользователей с настройкой [readonly](/operations/settings/permissions-for-queries#readonly) = 1. Требуется как минимум readonly = 2.

## Связанные материалы {#related}

- [Виртуальные колонки](/engines/table-engines/index.md#table_engines-virtual_columns)