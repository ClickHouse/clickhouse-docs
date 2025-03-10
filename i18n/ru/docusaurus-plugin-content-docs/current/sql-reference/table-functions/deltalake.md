---
slug: /sql-reference/table-functions/deltalake
sidebar_position: 45
sidebar_label: deltaLake
title: "deltaLake"
description: "Предоставляет интерфейс в виде таблицы только для чтения к таблицам Delta Lake в Amazon S3."
---


# Функция Таблицы deltaLake

Предоставляет интерфейс в виде таблицы только для чтения к таблицам [Delta Lake](https://github.com/delta-io/delta) в Amazon S3.

## Синтаксис {#syntax}

``` sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## Аргументы {#arguments}

- `url` — URL бакета с путем к существующей таблице Delta Lake в S3.
- `aws_access_key_id`, `aws_secret_access_key` - Долгосрочные учетные данные для пользователя учетной записи [AWS](https://aws.amazon.com/). Вы можете использовать их для аутентификации ваших запросов. Эти параметры являются необязательными. Если учетные данные не указаны, они используются из конфигурации ClickHouse. Для получения дополнительной информации см. [Использование S3 для хранения данных](engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).
- `format` — [формат](/interfaces/formats) файла.
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.
- `compression` — Параметр является необязательным. Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию сжатие будет автоматически определено по расширению файла.

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных из указанной таблицы Delta Lake в S3.

**Примеры**

Выбор строк из таблицы в S3 `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/`:

``` sql
SELECT
    URL,
    UserAgent
FROM deltaLake('https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/')
WHERE URL IS NOT NULL
LIMIT 2
```

``` response
┌─URL───────────────────────────────────────────────────────────────────┬─UserAgent─┐
│ http://auto.ria.ua/search/index.kz/jobinmoscow/detail/55089/hasimages │         1 │
│ http://auto.ria.ua/search/index.kz/jobinmoscow.ru/gosushi             │         1 │
└───────────────────────────────────────────────────────────────────────┴───────────┘
```

**Смотрите Также**

- [Двигатель DeltaLake](engines/table-engines/integrations/deltalake.md)
- [Функция таблицы кластера DeltaLake](sql-reference/table-functions/deltalakeCluster.md)
