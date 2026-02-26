---
title: 'system.fail_points'
slug: '/en/operations/system-tables/fail_points'
description: "Содержит перечень всех доступных failpoint'ов с указанием их типа и текущего статуса."
keywords: ['системная таблица', 'fail_points', 'failpoint', 'тестирование', 'отладка']
doc_type: 'reference'
---

# system.fail_points \{#fail_points\}

Содержит список всех доступных точек отказа, зарегистрированных на сервере, с указанием их типа и того, включены ли они в данный момент.

Точки отказа могут быть включены и отключены во время работы с помощью команд `SYSTEM ENABLE FAILPOINT` и `SYSTEM DISABLE FAILPOINT`.

## Столбцы \{#columns\}

- `name` ([String](../../sql-reference/data-types/string.md)) — Имя failpoint-а.
- `type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип failpoint-а. Возможные значения:
  - `'once'` — Срабатывает один раз и затем автоматически отключается.
  - `'regular'` — Срабатывает каждый раз при срабатывании failpoint-а.
  - `'pauseable_once'` — Блокирует выполнение один раз до явного возобновления.
  - `'pauseable'` — Блокирует выполнение каждый раз при срабатывании failpoint-а до явного возобновления.
- `enabled` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Включен ли в данный момент failpoint. `1` означает включен, `0` — выключен.

## Пример \{#example\}

```sql
SYSTEM ENABLE FAILPOINT replicated_merge_tree_insert_retry_pause;
SELECT * FROM system.fail_points WHERE enabled = 1
```

```text
┌─name──────────────────────────────────────┬─type────────────┬─enabled─┐
│ replicated_merge_tree_insert_retry_pause  │ pauseable_once  │       1 │
└───────────────────────────────────────────┴─────────────────┴─────────┘
```
