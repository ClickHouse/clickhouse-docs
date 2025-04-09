---
description: 'Создает таблицу из `URL` с заданным `format` и `structure`'
sidebar_label: 'url'
sidebar_position: 200
slug: /sql-reference/table-functions/url
title: 'url'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Функция Таблицы url

Функция `url` создает таблицу из `URL` с заданным `format` и `structure`.

Функция `url` может быть использована в запросах `SELECT` и `INSERT` к данным в [URL](../../engines/table-engines/special/url.md) таблицах.

**Синтаксис**

```sql
url(URL [,format] [,structure] [,headers])
```

**Параметры**

- `URL` — адрес HTTP или HTTPS сервера, который может принимать `GET` или `POST` запросы (для запросов `SELECT` или `INSERT` соответственно). Тип: [String](../../sql-reference/data-types/string.md).
- `format` — [Формат](/sql-reference/formats) данных. Тип: [String](../../sql-reference/data-types/string.md).
- `structure` — Структура таблицы в формате `'UserID UInt64, Name String'`. Определяет имена и типы колонок. Тип: [String](../../sql-reference/data-types/string.md).
- `headers` - Заголовки в формате `'headers('key1'='value1', 'key2'='value2')'`. Вы можете установить заголовки для HTTP вызова.

**Возвращаемое значение**

Таблица с заданным форматом и структурой и с данными из определенного `URL`.

**Примеры**

Получение первых 3 строк таблицы, которая содержит колонки типа `String` и [UInt32](../../sql-reference/data-types/int-uint.md) с HTTP-сервера, который отвечает в [CSV](../../interfaces/formats.md#csv) формате.

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

Вставка данных из `URL` в таблицу:

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## Globs в URL {#globs-in-url}

Шаблоны в фигурных скобках `{ }` используются для генерации набора шардов или для указания адресов failover. Поддерживаемые типы шаблонов и примеры можно увидеть в описании функции [remote](remote.md#globs-in-addresses).
Символ `|` внутри шаблонов используется для указания адресов failover. Они перечисляются в том же порядке, в каком указаны в шаблоне. Количество сгенерированных адресов ограничено настройкой [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements).

## Виртуальные Колонки {#virtual-columns}

- `_path` — Путь к `URL`. Тип: `LowCardinality(String)`.
- `_file` — Имя ресурса `URL`. Тип: `LowCardinality(String)`.
- `_size` — Размер ресурса в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.
- `_headers` - Заголовки HTTP-ответа. Тип: `Map(LowCardinality(String), LowCardinality(String))`.

## Partitioning в стиле Hive {#hive-style-partitioning}

Когда параметр `use_hive_partitioning` установлен в 1, ClickHouse будет определять partitioning в стиле Hive в пути (`/name=value/`) и позволит использовать колонки партиции как виртуальные колонки в запросе. Эти виртуальные колонки будут иметь такие же имена, как в партиционированном пути, но будут начинаться с `_`.

**Пример**

Использование виртуальной колонки, созданной с помощью partitioning в стиле Hive.

```sql
SELECT * from url('http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## Настройки Хранения {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - позволяет пропускать пустые файлы при чтении. Отключено по умолчанию.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - позволяет включать/выключать декодирование/кодирование пути в uri. Включено по умолчанию.

**Смотрите Также**

- [Виртуальные колонки](/engines/table-engines/index.md#table_engines-virtual_columns)
