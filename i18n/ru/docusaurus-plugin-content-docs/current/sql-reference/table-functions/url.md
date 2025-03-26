---
description: 'Создает таблицу из `URL` с заданным `форматом` и `структурой`'
sidebar_label: 'url'
sidebar_position: 200
slug: /sql-reference/table-functions/url
title: 'url'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Функция таблицы url

Функция `url` создает таблицу из `URL` с заданным `форматом` и `структурой`.

Функция `url` может использоваться в запросах `SELECT` и `INSERT` на данные в таблицах [URL](../../engines/table-engines/special/url.md).

**Синтаксис**

```sql
url(URL [,format] [,structure] [,headers])
```

**Параметры**

- `URL` — адрес HTTP или HTTPS сервера, который может принимать `GET` или `POST` запросы (для запросов `SELECT` или `INSERT` соответственно). Тип: [String](../../sql-reference/data-types/string.md).
- `format` — [Формат](/sql-reference/formats) данных. Тип: [String](../../sql-reference/data-types/string.md).
- `structure` — Структура таблицы в формате `'UserID UInt64, Name String'`. Определяет имена и типы столбцов. Тип: [String](../../sql-reference/data-types/string.md).
- `headers` - Заголовки в формате `'headers('key1'='value1', 'key2'='value2')'`. Вы можете установить заголовки для HTTP вызова.

**Возвращаемое значение**

Таблица с заданным форматом и структурой и с данными из определенного `URL`.

**Примеры**

Получение первых 3 строк таблицы, которая содержит столбцы типа `String` и [UInt32](../../sql-reference/data-types/int-uint.md) из HTTP-сервера, который отвечает в формате [CSV](../../interfaces/formats.md#csv).

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

Вставка данных из `URL` в таблицу:

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## Глобы в URL {#globs-in-url}

Шаблоны в фигурных скобках `{ }` используются для генерации набора шардов или для указания запасных адресов. Подробные типы поддерживаемых шаблонов и примеры см. в описании функции [remote](remote.md#globs-in-addresses). 
Символ `|` внутри шаблонов используется для указания запасных адресов. Они перебираются в том же порядке, в котором перечислены в шаблоне. Количество сгенерированных адресов ограничено настройкой [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements).

## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к `URL`. Тип: `LowCardinality(String)`.
- `_file` — Имя ресурса `URL`. Тип: `LowCardinality(String)`.
- `_size` — Размер ресурса в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.
- `_headers` - Заголовки HTTP-ответа. Тип: `Map(LowCardinality(String), LowCardinality(String))`.

## Разделение в стиле Hive {#hive-style-partitioning}

При установке `use_hive_partitioning` равным 1, ClickHouse будет обнаруживать разделение в стиле Hive в пути (`/name=value/`) и позволит использовать колонки разделов в качестве виртуальных колонок в запросе. Эти виртуальные колонки будут иметь такие же имена, как в разделенном пути, но будут начинаться с `_`.

**Пример**

Использование виртуальной колонки, созданной с помощью разделения в стиле Hive.

```sql
SELECT * from url('http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## Настройки хранения {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - позволяет пропускать пустые файлы при чтении. По умолчанию отключено.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - позволяет включать/выключать декодирование/кодирование пути в uri. По умолчанию включено.

**См. также**

- [Виртуальные колонки](/engines/table-engines/index.md#table_engines-virtual_columns)
