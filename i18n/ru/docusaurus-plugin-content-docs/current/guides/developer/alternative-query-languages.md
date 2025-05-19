---
slug: /guides/developer/alternative-query-languages
sidebar_label: 'Альтернативные языки запросов'
title: 'Альтернативные языки запросов'
description: 'Используйте альтернативные языки запросов в ClickHouse'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

Кроме стандартного SQL, ClickHouse поддерживает различные альтернативные языки запросов для выполнения запросов к данным.

В настоящее время поддерживаемые диалекты:
- `clickhouse`: Стандартный [SQL диалект](../../chdb/reference/sql-reference.md) ClickHouse
- `prql`: [Язык Запросов Пайплайновых Реляционных Данных (PRQL)](https://prql-lang.org/)
- `kusto`: [Язык Запросов Kusto (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

Какой язык запросов используется, контролируется с помощью установки `dialect`.

## Стандартный SQL {#standard-sql}

Стандартный SQL является языком запросов по умолчанию в ClickHouse.

```sql
SET dialect = 'clickhouse'
```

## Язык Запросов Пайплайновых Реляционных Данных (PRQL) {#pipelined-relational-query-language-prql}

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

Под капотом ClickHouse использует транспиляцию из PRQL в SQL для выполнения запросов PRQL.

## Язык Запросов Kusto (KQL) {#kusto-query-language-kql}

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
