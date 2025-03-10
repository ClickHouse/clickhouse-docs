---
slug: /sql-reference/table-functions/url
sidebar_position: 200
sidebar_label: url
title: "url"
description: "Создает таблицу из `URL` с заданным `форматом` и `структурой`"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# url Функция Таблицы

Функция `url` создает таблицу из `URL` с заданным `форматом` и `структурой`.

Функция `url` может быть использована в `SELECT` и `INSERT` запросах на данные в [URL](../../engines/table-engines/special/url.md) таблицах.

**Синтаксис**

``` sql
url(URL [,format] [,structure] [,headers])
```

**Параметры**

- `URL` — адрес HTTP или HTTPS сервера, который может принимать `GET` или `POST` запросы (для `SELECT` или `INSERT` запросов соответственно). Тип: [String](../../sql-reference/data-types/string.md).
- `format` — [Формат](/sql-reference/formats) данных. Тип: [String](../../sql-reference/data-types/string.md).
- `structure` — Структура таблицы в формате `'UserID UInt64, Name String'`. Определяет имена и типы колонок. Тип: [String](../../sql-reference/data-types/string.md).
- `headers` - Заголовки в формате `'headers('key1'='value1', 'key2'='value2')'`. Вы можете задать заголовки для HTTP вызова.

**Возвращаемое значение**

Таблица с указанным форматом и структурой и с данными из определенного `URL`.

**Примеры**

Получение первых 3 строк таблицы, которая содержит колонки типа `String` и [UInt32](../../sql-reference/data-types/int-uint.md) из HTTP-сервера, который отвечает в [CSV](../../interfaces/formats.md#csv) формате.

``` sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

Вставка данных из `URL` в таблицу:

``` sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## Globs в URL {#globs-in-url}

Шаблоны в фигурных скобках `{ }` используются для генерации набора шардов или для указания резервных адресов. Поддерживаемые типы шаблонов и примеры см. в описании функции [remote](remote.md#globs-in-addresses).
Символ `|` внутри шаблонов используется для указания резервных адресов. Они перебираются в том же порядке, в котором указаны в шаблоне. Количество сгенерированных адресов ограничено настройкой [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements).

## Виртуальные колонки {#virtual-columns}

- `_path` — Путь к `URL`. Тип: `LowCardinality(String)`.
- `_file` — Имя ресурса `URL`. Тип: `LowCardinality(String)`.
- `_size` — Размер ресурса в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение будет `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение будет `NULL`.
- `_headers` - Заголовки ответа HTTP. Тип: `Map(LowCardinality(String), LowCardinality(String))`.

## Разделение в стиле Hive {#hive-style-partitioning}

Когда параметр `use_hive_partitioning` установлен в 1, ClickHouse будет выявлять разделение в стиле Hive в пути (`/name=value/`) и позволит использовать колонки раздела в качестве виртуальных колонок в запросе. Эти виртуальные колонки будут иметь такие же имена, как в разделенном пути, но начинаться с `_`.

**Пример**

Использование виртуальной колонки, созданной с разделением в стиле Hive

``` sql
SELECT * from url('http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## Настройки Хранения {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - позволяет пропускать пустые файлы во время чтения. Отключено по умолчанию.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - позволяет включать/выключать декодирование/кодирование пути в uri. Включено по умолчанию.

**См. также**

- [Виртуальные колонки](/engines/table-engines/index.md#table_engines-virtual_columns)
