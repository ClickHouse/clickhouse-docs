---
description: 'При выполнении запросов ClickHouse использует различные кэши.'
sidebar_label: 'Кэши'
sidebar_position: 65
slug: /operations/caches
title: 'Типы кэша'
keywords: ['cache']
doc_type: 'reference'
---

# Типы кэшей

При выполнении запросов ClickHouse использует различные кэши для ускорения выполнения
и снижения необходимости чтения с диска и записи на диск.

Основные типы кэшей:

- `mark_cache` — кэш [меток](/development/architecture#merge-tree), используемый движками таблиц семейства [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md).
- `uncompressed_cache` — кэш несжатых данных, используемый движками таблиц семейства [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md).
- Кэш страниц операционной системы (используется косвенно, для файлов с фактическими данными).

Существует также множество дополнительных типов кэшей:

- DNS-кэш.
- Кэш [Regexp](/interfaces/formats/Regexp).
- Кэш скомпилированных выражений.
- Кэш [индекса векторного сходства](../engines/table-engines/mergetree-family/annindexes.md).
- Кэш [текстового индекса](../engines/table-engines/mergetree-family/invertedindexes.md#caching).
- Кэш схем для формата [Avro](/interfaces/formats/Avro).
- Кэш данных [словарей](../sql-reference/dictionaries/index.md).
- Кэш вывода схемы.
- [Файловый кэш](storing-data.md) над S3, Azure, локальными и другими дисками.
- [Пользовательский кэш страниц](/operations/userspace-page-cache).
- [Кэш запросов](query-cache.md).
- [Кэш условий запроса](query-condition-cache.md).
- Кэш схем форматов.

Если требуется сбросить один из кэшей для настройки производительности, устранения неполадок или по причинам согласованности данных,
можно использовать оператор [`SYSTEM DROP ... CACHE`](../sql-reference/statements/system.md).