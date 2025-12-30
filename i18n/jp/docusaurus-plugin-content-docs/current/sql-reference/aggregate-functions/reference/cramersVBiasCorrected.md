---
description: 'Cramer の V をバイアス補正付きで計算します。'
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
title: 'cramersVBiasCorrected'
doc_type: 'reference'
---

# cramersVBiasCorrected {#cramersvbiascorrected}

Cramer&#39;s V は、テーブル内の 2 つのカラム間の関連の強さを表す指標です。[`cramersV` 関数](./cramersV.md) の結果は 0（変数間に関連がないことに対応）から 1 の範囲を取り、一方の値が他方によって一意に決まる場合にのみ 1 に到達します。この関数には大きなバイアスが生じる可能性があるため、このバージョンの Cramer&#39;s V では [バイアス補正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction) を使用します。

**構文**

```sql
cramersVBiasCorrected(column1, column2)
```

**パラメータ**

* `column1`: 比較対象となる 1 番目のカラム。
* `column2`: 比較対象となる 2 番目のカラム。

**返り値**

* 0（カラムの値同士に連関がないことに対応）から 1（完全な連関があることに対応）までの値。

型: 常に [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下で比較される 2 つのカラムは、互いに中程度の連関を持っています。`cramersVBiasCorrected` の結果が `cramersV` の結果より小さいことに注意してください。

クエリ:

```sql
SELECT
    cramersV(a, b),
    cramersVBiasCorrected(a ,b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 4 AS b
        FROM
            numbers(150)
    );
```

結果：

```response
┌─────cramersV(a, b)─┬─cramersVBiasCorrected(a, b)─┐
│ 0.5798088336225178 │          0.5305112825189074 │
└────────────────────┴─────────────────────────────┘
```
