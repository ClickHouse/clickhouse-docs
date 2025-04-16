---
description: 'Системная таблица, содержащая информацию о параметрах `graphite_rollup`, которые используются в таблицах с движками типа `GraphiteMergeTree`.'
keywords: ['системная таблица', 'graphite_retentions']
slug: /operations/system-tables/graphite_retentions
title: 'system.graphite_retentions'
---

Содержит информацию о параметрах [graphite_rollup](../../operations/server-configuration-parameters/settings.md#graphite), которые используются в таблицах с [\*GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md) движками.

Колонки:

- `config_name` (String) - имя параметра `graphite_rollup`.
- `regexp` (String) - Шаблон для имени метрики.
- `function` (String) - Имя агрегатной функции.
- `age` (UInt64) - Минимальный возраст данных в секундах.
- `precision` (UInt64) - Как точно определить возраст данных в секундах.
- `priority` (UInt16) - Приоритет шаблона.
- `is_default` (UInt8) - Является ли шаблон значением по умолчанию.
- `Tables.database` (Array(String)) - Массив имен таблиц баз данных, которые используют параметр `config_name`.
- `Tables.table` (Array(String)) - Массив имен таблиц, которые используют параметр `config_name`.
