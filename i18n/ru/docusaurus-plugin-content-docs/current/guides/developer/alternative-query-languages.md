---
slug: /guides/developer/alternative-query-languages
sidebar_label: 'Альтернативные языки запросов'
title: 'Альтернативные языки запросов'
description: 'Использование альтернативных языков запросов в ClickHouse'
keywords: ['альтернативные языки запросов', 'диалекты запросов', 'диалект MySQL', 'диалект PostgreSQL', 'руководство для разработчиков']
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

Помимо стандартного SQL, ClickHouse поддерживает различные альтернативные языки запросов для работы с данными.

Поддерживаемые в настоящее время диалекты:

* `clickhouse`: Диалект [SQL](../../chdb/reference/sql-reference.md) ClickHouse по умолчанию
* `prql`: [Pipelined Relational Query Language (PRQL)](https://prql-lang.org/)
* `kusto`: [Kusto Query Language (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

Выбор используемого языка запросов задаётся параметром `dialect`.


## Стандартный SQL {#standard-sql}

Стандартный SQL является языком запросов по умолчанию в ClickHouse.

```sql
SET dialect = 'clickhouse'
```


## Конвейерный язык реляционных запросов (PRQL) {#pipelined-relational-query-language-prql}

<ExperimentalBadge />

Чтобы включить PRQL:

```sql
SET allow_experimental_prql_dialect = 1; -- эта инструкция SET требуется только для версий ClickHouse >= v25.1
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

Внутренне ClickHouse использует транспиляцию из PRQL в SQL для выполнения запросов PRQL.


## Язык запросов Kusto (KQL) {#kusto-query-language-kql}

<ExperimentalBadge />

Чтобы включить KQL:

```sql
SET allow_experimental_kusto_dialect = 1; -- эта команда SET требуется только для версий ClickHouse >= 25.1
SET dialect = 'kusto'
```

```kql title="Query"
numbers(10) | project number
```

```response title="Response"
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

Обратите внимание, что запросы KQL могут не иметь доступа ко всем функциям, определённым в ClickHouse.
