---
description: 'データセットのサンプル分散を計算します。'
sidebar_position: 212
slug: /sql-reference/aggregate-functions/reference/varSamp
title: 'varSamp'
---

## varSamp {#varsamp}

データセットのサンプル分散を計算します。

**構文**

```sql
varSamp(x)
```

エイリアス: `VAR_SAMP`。

**パラメータ**

- `x`: サンプル分散を計算する対象の母集団。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返される値**

- 入力データセット `x` のサンプル分散を返します。[Float64](../../data-types/float.md)。

**実装の詳細**

`varSamp` 関数は次の式を用いてサンプル分散を計算します：

$$
\sum\frac{(x - \text{mean}(x))^2}{(n - 1)}
$$

ここで：

- `x` はデータセット内の各個別データポイントです。
- `mean(x)` はデータセットの算術平均です。
- `n` はデータセット内のデータポイントの数です。

この関数は、入力データセットがより大きな母集団のサンプルであると仮定しています。もし全母集団の分散を計算したい場合（完全なデータセットがある場合）は、[`varPop`](../reference/varpop.md) を使用する必要があります。

**例**

クエリ：

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    x Float64
)
ENGINE = Memory;

INSERT INTO test_data VALUES (10.5), (12.3), (9.8), (11.2), (10.7);

SELECT round(varSamp(x),3) AS var_samp FROM test_data;
```

レスポンス：

```response
┌─var_samp─┐
│    0.865 │
└──────────┘
```
