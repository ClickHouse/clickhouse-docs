---
slug: '/sql-reference/data-types/date32'
sidebar_label: Date32
sidebar_position: 14
description: 'Документация для типа данных Date32 в ClickHouse, который хранит даты'
title: Date32
doc_type: reference
---
# Date32

Дата. Поддерживает такой же диапазон дат, как и [DateTime64](../../sql-reference/data-types/datetime64.md). Хранится как подписанное 32-битное целое число в нативном порядке байтов, при этом значение представляет собой количество дней с `1900-01-01`. **Важно!** 0 представляет собой `1970-01-01`, а отрицательные значения представляют собой дни до `1970-01-01`.

**Примеры**

Создание таблицы с колонкой типа `Date32` и вставка данных в неё:

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

- [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
- [toDate32OrZero](/sql-reference/functions/type-conversion-functions#todate32orzero)
- [toDate32OrNull](/sql-reference/functions/type-conversion-functions#todate32ornull)