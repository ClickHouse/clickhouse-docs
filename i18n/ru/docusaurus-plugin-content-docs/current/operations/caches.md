---
slug: /operations/caches
sidebar_position: 65
sidebar_label: Кэши
title: "Типы кэшей"
description: При выполнении запросов ClickHouse использует разные кэши.
---

При выполнении запросов ClickHouse использует разные кэши.

Основные типы кэшей:

- `mark_cache` — Кэш меток, используемый таблицами движка [MergeTree](../engines/table-engines/mergetree-family/mergetree.md).
- `uncompressed_cache` — Кэш несжатых данных, используемый таблицами движка [MergeTree](../engines/table-engines/mergetree-family/mergetree.md).
- `skipping_index_cache` — Кэш гранул в памяти для индексов пропуска, используемый таблицами движка [MergeTree](../engines/table-engines/mergetree-family/mergetree.md).
- Кэш страниц операционной системы (используется косвенно, для файлов с фактическими данными).

Дополнительные типы кэшей:

- Кэш DNS.
- Кэш [Regexp](../interfaces/formats.md#data-format-regexp).
- Кэш скомпилированных выражений.
- Кэш схем формата [Avro](../interfaces/formats.md#data-format-avro).
- Кэш данных [Словарей](../sql-reference/dictionaries/index.md).
- Кэш вывода схемы.
- [Файловый кэш](storing-data.md) для S3, Azure, Local и других дисков.
- [Кэш запросов](query-cache.md).
- Кэш схем формата.

Чтобы удалить один из кэшей, используйте инструкции [SYSTEM DROP ... CACHE](../sql-reference/statements/system.md#drop-mark-cache).

Чтобы удалить кэш схемы формата, используйте инструкцию [SYSTEM DROP FORMAT SCHEMA CACHE](/sql-reference/statements/system#system-drop-schema-format).
