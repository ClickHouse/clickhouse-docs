---
'description': '時系列の値の指数移動加重平均を時点 `t` で返します。'
'sidebar_position': 133
'slug': '/sql-reference/aggregate-functions/reference/exponentialTimeDecayedAvg'
'title': 'exponentialTimeDecayedAvg'
'doc_type': 'reference'
---

## exponentialTimeDecayedAvg {#exponentialtimedecayedavg}

時系列の値の指数的に平滑化された加重移動平均を、時点 `t` で返します。

**構文**

```sql
exponentialTimeDecayedAvg(x)(v, t)
```

**引数**

- `v` — 値。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点数](../../../sql-reference/data-types/float.md) または [小数](../../../sql-reference/data-types/decimal.md)。
- `t` — 時間。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点数](../../../sql-reference/data-types/float.md) または [小数](../../../sql-reference/data-types/decimal.md)、[DateTime](../../data-types/datetime.md)、[DateTime64](../../data-types/datetime64.md)。

**パラメーター**

- `x` — 半減期。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点数](../../../sql-reference/data-types/float.md) または [小数](../../../sql-reference/data-types/decimal.md)。

**返される値**

- 時間インデックス `t` における指数的に平滑化された加重移動平均を返します。 [Float64](../../data-types/float.md)。

**例**

クエリ:

```sql
SELECT
    value,
    time,
    round(exp_smooth, 3),
    bar(exp_smooth, 0, 5, 50) AS bar
FROM
    (
    SELECT
    (number = 0) OR (number >= 25) AS value,
    number AS time,
    exponentialTimeDecayedAvg(10)(value, time) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS exp_smooth
    FROM numbers(50)
    );
```

レスポンス:

```sql
   ┌─value─┬─time─┬─round(exp_smooth, 3)─┬─bar────────┐
1. │     1 │    0 │                    1 │ ██████████ │
2. │     0 │    1 │                0.475 │ ████▊      │
3. │     0 │    2 │                0.301 │ ███        │
4. │     0 │    3 │                0.214 │ ██▏        │
5. │     0 │    4 │                0.162 │ █▌         │
6. │     0 │    5 │                0.128 │ █▎         │
7. │     0 │    6 │                0.104 │ █          │
8. │     0 │    7 │                0.086 │ ▊          │
9. │     0 │    8 │                0.072 │ ▋          │
0. │     0 │    9 │                0.061 │ ▌          │
1. │     0 │   10 │                0.052 │ ▌          │
2. │     0 │   11 │                0.045 │ ▍          │
3. │     0 │   12 │                0.039 │ ▍          │
4. │     0 │   13 │                0.034 │ ▎          │
5. │     0 │   14 │                 0.03 │ ▎          │
6. │     0 │   15 │                0.027 │ ▎          │
7. │     0 │   16 │                0.024 │ ▏          │
8. │     0 │   17 │                0.021 │ ▏          │
9. │     0 │   18 │                0.018 │ ▏          │
0. │     0 │   19 │                0.016 │ ▏          │
1. │     0 │   20 │                0.015 │ ▏          │
2. │     0 │   21 │                0.013 │ ▏          │
3. │     0 │   22 │                0.012 │            │
4. │     0 │   23 │                 0.01 │            │
5. │     0 │   24 │                0.009 │            │
6. │     1 │   25 │                0.111 │ █          │
7. │     1 │   26 │                0.202 │ ██         │
8. │     1 │   27 │                0.283 │ ██▊        │
9. │     1 │   28 │                0.355 │ ███▌       │
0. │     1 │   29 │                 0.42 │ ████▏      │
1. │     1 │   30 │                0.477 │ ████▊      │
2. │     1 │   31 │                0.529 │ █████▎     │
3. │     1 │   32 │                0.576 │ █████▊     │
4. │     1 │   33 │                0.618 │ ██████▏    │
5. │     1 │   34 │                0.655 │ ██████▌    │
6. │     1 │   35 │                0.689 │ ██████▉    │
7. │     1 │   36 │                0.719 │ ███████▏   │
8. │     1 │   37 │                0.747 │ ███████▍   │
9. │     1 │   38 │                0.771 │ ███████▋   │
0. │     1 │   39 │                0.793 │ ███████▉   │
1. │     1 │   40 │                0.813 │ ████████▏  │
2. │     1 │   41 │                0.831 │ ████████▎  │
3. │     1 │   42 │                0.848 │ ████████▍  │
4. │     1 │   43 │                0.862 │ ████████▌  │
5. │     1 │   44 │                0.876 │ ████████▊  │
6. │     1 │   45 │                0.888 │ ████████▉  │
7. │     1 │   46 │                0.898 │ ████████▉  │
8. │     1 │   47 │                0.908 │ █████████  │
9. │     1 │   48 │                0.917 │ █████████▏ │
0. │     1 │   49 │                0.925 │ █████████▏ │
   └───────┴──────┴──────────────────────┴────────────┘
```
