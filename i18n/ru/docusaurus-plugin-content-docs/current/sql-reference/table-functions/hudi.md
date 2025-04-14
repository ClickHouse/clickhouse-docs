---
description: 'Предоставляет интерфейс таблицы только для чтения для таблиц Apache Hudi в Amazon S3.'
sidebar_label: 'hudi'
sidebar_position: 85
slug: /sql-reference/table-functions/hudi
title: 'hudi'
---


# Функция таблицы hudi

Предоставляет интерфейс таблицы только для чтения для таблиц Apache [Hudi](https://hudi.apache.org/) в Amazon S3.

## Синтаксис {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## Аргументы {#arguments}

- `url` — URL корзины с путем к существующей таблице Hudi в S3.
- `aws_access_key_id`, `aws_secret_access_key` - Долгосрочные учетные данные для пользователя учетной записи [AWS](https://aws.amazon.com/). Вы можете использовать их для аутентификации ваших запросов. Эти параметры являются необязательными. Если учетные данные не указаны, используются из конфигурации ClickHouse. Для получения дополнительной информации см. [Использование S3 для хранения данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).
- `format` — [формат](/interfaces/formats) файла.
- `structure` — Структура таблицы. Формат: `'column1_name column1_type, column2_name column2_type, ...'`.
- `compression` — Параметр является необязательным. Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию сжатие будет автоматически определено по расширению файла.

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных в указанной таблице Hudi в S3.

**См. также**

- [Hudi engine](/engines/table-engines/integrations/hudi.md)
- [Hudi cluster table function](/sql-reference/table-functions/hudiCluster.md)
