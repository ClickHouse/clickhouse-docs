---
description: 'При выполнении запросов ClickHouse использует различные кэши.'
sidebar_label: 'Кэши'
sidebar_position: 65
slug: /operations/caches
title: 'Типы кэша'
keywords: ['cache']
doc_type: 'reference'
---

# Типы кэша {#cache-types}

При выполнении запросов ClickHouse использует различные кэши, чтобы ускорить выполнение запросов
и сократить необходимость чтения с диска или записи на диск.

Основные типы кэша:

* `mark_cache` — кэш [меток](/development/architecture#merge-tree), используемый движками таблиц семейства [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md).
* `uncompressed_cache` — кэш несжатых данных, используемый движками таблиц семейства [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md).
* Кэш страниц операционной системы (используется косвенно, для файлов с данными).

Также существует множество дополнительных типов кэша:

* DNS-кэш.
* Кэш [Regexp](/interfaces/formats/Regexp).
* Кэш скомпилированных выражений.
* Кэш [индекса векторного сходства](../engines/table-engines/mergetree-family/annindexes.md).
* Кэш [текстового индекса](../engines/table-engines/mergetree-family/invertedindexes.md#caching).
* Кэш схем [формата Avro](/interfaces/formats/Avro).
* Кэш данных [словарей](../sql-reference/dictionaries/index.md).
* Кэш инференса схем.
* [Кэш файловой системы](storing-data.md) поверх S3, Azure, локальных и других дисков.
* [Пользовательский (userspace) кэш страниц](/operations/userspace-page-cache).
* [Кэш запросов](query-cache.md).
* [Кэш условий запросов](query-condition-cache.md).
* Кэш схем форматов.

Если требуется сбросить один из кэшей для настройки производительности, устранения неполадок или по причинам,
связанным с согласованностью данных, вы можете использовать оператор [`SYSTEM DROP ... CACHE`](../sql-reference/statements/system.md).