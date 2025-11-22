---
description: 'Документация по функции'
sidebar_label: 'FUNCTION'
sidebar_position: 38
slug: /sql-reference/statements/create/function
title: 'CREATE FUNCTION — функция, определяемая пользователем (UDF)'
doc_type: 'reference'
---

Создает функцию, определяемую пользователем (UDF), из лямбда-выражения. Выражение должно состоять из параметров функции, констант, операторов или других вызовов функций.

**Синтаксис**

```sql
CREATE FUNCTION имя [ON CLUSTER кластер] AS (параметр0, ...) -> выражение
```

Функция может иметь произвольное количество параметров.

Существуют некоторые ограничения:

* Имя функции должно быть уникальным среди пользовательских и системных функций.
* Рекурсивные функции не допускаются.
* Все переменные, используемые функцией, должны быть указаны в её списке параметров.

При нарушении любого из этих ограничений выбрасывается исключение.

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

[Условная функция](../../../sql-reference/functions/conditional-functions.md) вызывается в определяемой пользователем функции в следующем запросе:

```sql
CREATE FUNCTION parity_str AS (n) -> if(n % 2, 'odd', 'even');
SELECT number, parity_str(number) FROM numbers(3);
```

Результат:

```text
┌─number─┬─if(modulo(number, 2), 'нечётное', 'чётное')─┐
│      0 │ чётное                                 │
│      1 │ нечётное                                  │
│      2 │ чётное                                 │
└────────┴──────────────────────────────────────┘
```


## Связанный контент {#related-content}

### [Исполняемые пользовательские функции](/sql-reference/functions/udf.md). {#executable-udfs}

### [Пользовательские функции в ClickHouse Cloud](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
