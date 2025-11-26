---
description: '指定した列について、おおよその最頻出値とその出現回数を配列で返します。'
sidebar_position: 107
slug: /sql-reference/aggregate-functions/reference/approxtopk
title: 'approx_top_k'
doc_type: 'reference'
---

# approx&#95;top&#95;k

指定した列において、おおよそ最も頻出する値とその出現回数を配列として返します。結果の配列は、値そのものではなく、値のおおよその出現頻度の高い順（降順）にソートされます。

```sql
approx_top_k(N)(column)
approx_top_k(N, reserved)(column)
```

この関数は厳密な結果を保証するものではありません。特定の状況では誤差が生じる可能性があり、最頻値ではない値が頻出値として返される場合があります。

`N < 10` の値を使用することを推奨します。`N` が大きいとパフォーマンスが低下します。`N` の最大値は 65536 です。

**パラメータ**

* `N` — 返す要素数。省略可能。デフォルト値: 10。
* `reserved` — 値のために確保するセル数を定義します。uniq(column) が reserved を超える場合、topK 関数の結果は近似値になります。省略可能。デフォルト値: N * 3。

**引数**

* `column` — 出現頻度を計算する対象の値を含むカラム。

**例**

クエリ:

```sql
SELECT approx_top_k(2)(k)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10));
```

結果：

```text
┌─approx_top_k(2)(k)────┐
│ [('y',3,0),('x',1,0)] │
└───────────────────────┘
```


# approx_top_count

`approx_top_k` 関数のエイリアスです。

**関連項目**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)