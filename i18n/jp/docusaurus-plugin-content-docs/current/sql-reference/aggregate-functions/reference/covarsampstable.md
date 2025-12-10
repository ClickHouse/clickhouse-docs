---
description: 'covarSamp と同様ですが、計算誤差を小さく抑える代わりに処理が遅くなります。'
sidebar_position: 126
slug: /sql-reference/aggregate-functions/reference/covarsampstable
title: 'covarSampStable'
doc_type: 'reference'
---

# covarSampStable {#covarsampstable}

`Σ((x - x̅)(y - y̅)) / (n - 1)` の値を計算します。[covarSamp](../reference/covarsamp.md) と同様ですが、計算誤差をより小さく抑えられる一方で、処理速度は低下します。

**構文**

```sql
covarSampStable(x, y)
```

**引数**

* `x` — 1 番目の変数。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal](../../data-types/decimal.md)。
* `y` — 2 番目の変数。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal](../../data-types/decimal.md)。

**戻り値**

* `x` と `y` の標本共分散。`n <= 1` の場合は `inf` が返されます。[Float64](../../data-types/float.md)。

**例**

クエリ:

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series(i UInt32, x_value Float64, y_value Float64) ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6,-4.4),(2, -9.6,3),(3, -1.3,-4),(4, 5.3,9.7),(5, 4.4,0.037),(6, -8.6,-7.8),(7, 5.1,9.3),(8, 7.9,-3.6),(9, -8.2,0.62),(10, -3,7.3);
```

```sql
SELECT covarSampStable(x_value, y_value)
FROM
(
    SELECT
        x_value,
        y_value
    FROM series
);
```

結果：

```reference
┌─covarSampStable(x_value, y_value)─┐
│                 7.206275555555556 │
└───────────────────────────────────┘
```

クエリ：

```sql
SELECT covarSampStable(x_value, y_value)
FROM
(
    SELECT
        x_value,
        y_value
    FROM series LIMIT 1
);
```

結果：

```reference
┌─covarSampStable(x_value, y_value)─┐
│                               inf │
└───────────────────────────────────┘
```
