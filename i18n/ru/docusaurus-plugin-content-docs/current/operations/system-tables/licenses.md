---
description: 'Системная таблица, содержащая лицензии сторонних библиотек, находящихся в директории contrib исходного кода ClickHouse.'
keywords: ['системная таблица', 'лицензии']
slug: /operations/system-tables/licenses
title: 'system.licenses'
---


# system.licenses

Содержит лицензии сторонних библиотек, которые расположены в директории [contrib](https://github.com/ClickHouse/ClickHouse/tree/master/contrib) исходных кодов ClickHouse.

Столбцы:

- `library_name` ([String](../../sql-reference/data-types/string.md)) — Имя библиотеки, с которой связана лицензия.
- `license_type` ([String](../../sql-reference/data-types/string.md)) — Тип лицензии — например, Apache, MIT.
- `license_path` ([String](../../sql-reference/data-types/string.md)) — Путь к файлу с текстом лицензии.
- `license_text` ([String](../../sql-reference/data-types/string.md)) — Текст лицензии.

**Пример**

```sql
SELECT library_name, license_type, license_path FROM system.licenses LIMIT 15
```

```text
┌─library_name───────┬─license_type─┬─license_path────────────────────────┐
│ aws-c-common       │ Apache       │ /contrib/aws-c-common/LICENSE       │
│ base64             │ BSD 2-clause │ /contrib/aklomp-base64/LICENSE      │
│ brotli             │ MIT          │ /contrib/brotli/LICENSE             │
│ [...]              │ [...]        │ [...]                               │
└────────────────────┴──────────────┴─────────────────────────────────────┘

```
