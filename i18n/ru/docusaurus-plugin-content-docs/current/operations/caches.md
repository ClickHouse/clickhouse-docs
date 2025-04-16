---
description: 'При выполнении запросов ClickHouse использует различные кэши.'
sidebar_label: 'Кэши'
sidebar_position: 65
slug: /operations/caches
title: 'Типы кэшей'
---


# Типы кэшей

При выполнении запросов ClickHouse использует различные кэши.

Основные типы кэшей:

- `mark_cache` — Кэш меток, используемый движками таблиц семейства [MergeTree](../engines/table-engines/mergetree-family/mergetree.md).
- `uncompressed_cache` — Кэш несжатых данных, используемый движками таблиц семейства [MergeTree](../engines/table-engines/mergetree-family/mergetree.md).
- Кэш страниц операционной системы (используется косвенно для файлов с фактическими данными).

Дополнительные типы кэшей:

- Кэш DNS.
- Кэш [Regexp](../interfaces/formats.md#data-format-regexp).
- Кэш скомпилированных выражений.
- Кэш [индекса векторного сходства](../engines/table-engines/mergetree-family/annindexes.md).
- Кэш схем формата [Avro](../interfaces/formats.md#data-format-avro).
- Кэш данных [словари](../sql-reference/dictionaries/index.md).
- Кэш вывода схемы.
- Кэш [файловой системы](storing-data.md) для S3, Azure, Local и других дисков.
- Кэш [пользовательского пространства](/operations/userspace-page-cache).
- [Кэш запросов](query-cache.md).
- [Кэш условий запросов](query-condition-cache.md).
- Кэш схем формата.

Чтобы удалить один из кэшей, используйте операторы [SYSTEM DROP ... CACHE](../sql-reference/statements/system.md).
