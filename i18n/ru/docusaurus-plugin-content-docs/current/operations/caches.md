---
slug: '/operations/caches'
sidebar_label: Кэши
sidebar_position: 65
description: 'При выполнении запросов, ClickHouse использует разные кэши.'
title: 'Типы кэшей'
doc_type: reference
---
# Типы кэшей

При выполнении запросов ClickHouse использует различные кэши для ускорения запросов и уменьшения необходимости чтения или записи на диск.

Основные типы кэшей:

- `mark_cache` — кэш [меток](/development/architecture#merge-tree), используемый движками таблиц семейства [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md).
- `uncompressed_cache` — кэш несжатых данных, используемый движками таблиц семейства [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md).
- Кэш страниц операционной системы (используется косвенно, для файлов с актуальными данными).

Существуют также дополнительные типы кэшей:

- Кэш DNS.
- Кэш [Regex](../interfaces/formats.md#data-format-regexp).
- Кэш скомпилированных выражений.
- Кэш [индекса векторного сходства](../engines/table-engines/mergetree-family/annindexes.md).
- Кэш схем [формата Avro](../interfaces/formats.md#data-format-avro).
- Кэш данных [словари](../sql-reference/dictionaries/index.md).
- Кэш вывода схемы.
- [Кэш файловой системы](storing-data.md) для S3, Azure, локальных и других дисков.
- [Кэш страниц в пользовательском пространстве](/operations/userspace-page-cache).
- [Кэш запросов](query-cache.md).
- [Кэш условий запросов](query-condition-cache.md).
- Кэш схем форматов.

Если вы хотите удалить один из кэшей для настройки производительности, устранения неполадок или обеспечения согласованности данных, вы можете использовать оператор [`SYSTEM DROP ... CACHE`](../sql-reference/statements/system.md).