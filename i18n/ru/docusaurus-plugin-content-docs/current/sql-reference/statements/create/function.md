---
slug: '/sql-reference/statements/create/function'
sidebar_label: FUNCTION
sidebar_position: 38
description: 'Документация для функции'
title: 'CREATE FUNCTION - пользовательская функция (UDF)'
doc_type: reference
---
Создает пользовательскую функцию (UDF) на основе лямбда-выражения. Выражение должно состоять из параметров функции, констант, операторов или других вызовов функций.

**Синтаксис**

```sql
CREATE FUNCTION name [ON CLUSTER cluster] AS (parameter0, ...) -> expression
```
Функция может иметь произвольное количество параметров.

Существует несколько ограничений:

- Имя функции должно быть уникальным среди пользовательских и системных функций.
- Рекурсивные функции не допускаются.
- Все переменные, используемые функцией, должны быть указаны в ее списке параметров.

Если какое-либо ограничение нарушено, будет вызвано исключение.

**Пример**

Запрос:

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
SELECT number, linear_equation(number, 2, 1) FROM numbers(3);
```

Результат:

```text
┌─number─┬─plus(multiply(2, number), 1)─┐
│      0 │                            1 │
│      1 │                            3 │
│      2 │                            5 │
└────────┴──────────────────────────────┘
```

В [условной функции](../../../sql-reference/functions/conditional-functions.md) вызывается пользовательская функция в следующем запросе:

```sql
CREATE FUNCTION parity_str AS (n) -> if(n % 2, 'odd', 'even');
SELECT number, parity_str(number) FROM numbers(3);
```

Результат:

```text
┌─number─┬─if(modulo(number, 2), 'odd', 'even')─┐
│      0 │ even                                 │
│      1 │ odd                                  │
│      2 │ even                                 │
└────────┴──────────────────────────────────────┘
```

## Связанный контент {#related-content}

### [Исполнимые UDF](/sql-reference/functions/udf.md). {#executable-udfs}

### [Пользовательские функции в ClickHouse Cloud](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}