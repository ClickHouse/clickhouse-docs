---
slug: /guides/developer/alternative-query-languages
sidebar_label: 'Альтернативные языки запросов'
title: 'Альтернативные языки запросов'
description: 'Используйте альтернативные языки запросов в ClickHouse'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

Помимо стандартного SQL, ClickHouse поддерживает различные альтернативные языки запросов для выполнения запросов к данным.

В настоящее время поддерживаемые диалекты:
- `clickhouse`: Стандартный [SQL диалект](../../sql-reference/syntax.md) ClickHouse
- `prql`: [Язык запросов с конвейерной обработкой (PRQL)](https://prql-lang.org/)
- `kusto`: [Язык запросов Kusto (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

Язык запросов контролируется установкой `dialect`.

## Стандартный SQL {#standard-sql}

Стандартный SQL является языком запросов по умолчанию для ClickHouse.

```sql
SET dialect = 'clickhouse'
```

## Язык запросов с конвейерной обработкой (PRQL) {#pipelined-relational-query-language-prql}

<ExperimentalBadge/>

Чтобы включить PRQL:

```sql
SET allow_experimental_prql_dialect = 1; -- эта команда SET требуется только для версий ClickHouse >= v25.1
SET dialect = 'prql'
```

Пример запроса PRQL:

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

Под капотом ClickHouse использует трансляцию с PRQL в SQL для выполнения запросов PRQL.

## Язык запросов Kusto (KQL) {#kusto-query-language-kql}

<ExperimentalBadge/>

Чтобы включить KQL:

```sql
SET allow_experimental_kusto_dialect = 1; -- эта команда SET требуется только для версий ClickHouse >= 25.1
SET dialect = 'kusto'
```

```kql title="Запрос"
numbers(10) | project number
```

```response title="Ответ"
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘
```

Обратите внимание, что запросы KQL могут не иметь доступа ко всем функциям, определенным в ClickHouse.
