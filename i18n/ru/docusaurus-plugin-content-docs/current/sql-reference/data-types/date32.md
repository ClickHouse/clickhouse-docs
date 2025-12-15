---
description: 'Документация по типу данных Date32 в ClickHouse, который хранит даты
  с более широким диапазоном значений по сравнению с Date'
sidebar_label: 'Date32'
sidebar_position: 14
slug: /sql-reference/data-types/date32
title: 'Date32'
doc_type: 'reference'
---

# Date32 {#date32}

Дата. Поддерживает тот же диапазон дат, что и [DateTime64](../../sql-reference/data-types/datetime64.md). Хранится как знаковое 32-битное целое число в нативном порядке байтов, значение которого равно количеству дней, прошедших с `1900-01-01`. **Важно!** 0 соответствует `1970-01-01`, а отрицательные значения — дням до `1970-01-01`.

**Примеры**

Создание таблицы со столбцом типа `Date32` и вставка данных в него:

```sql
CREATE TABLE dt32
(
    `timestamp` Date32,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse Date
-- - from string,
-- - from 'small' integer interpreted as number of days since 1970-01-01, and
-- - from 'big' integer interpreted as number of seconds since 1970-01-01.
INSERT INTO dt32 VALUES ('2100-01-01', 1), (47482, 2), (4102444800, 3);

SELECT * FROM dt32;
```

```text
┌──timestamp─┬─event_id─┐
│ 2100-01-01 │        1 │
│ 2100-01-01 │        2 │
│ 2100-01-01 │        3 │
└────────────┴──────────┘
```

**Смотрите также**

* [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
* [toDate32OrZero](/sql-reference/functions/type-conversion-functions#toDate32OrZero)
* [toDate32OrNull](/sql-reference/functions/type-conversion-functions#toDate32OrNull)
