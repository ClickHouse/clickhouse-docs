---
description: '指定した列について、おおよその最頻出値とその出現回数を配列で返します。'
sidebar_position: 107
slug: /sql-reference/aggregate-functions/reference/approxtopk
title: 'approx_top_k'
doc_type: 'reference'
---

# approx&#95;top&#95;k {#approx&#95;top&#95;k}

指定されたカラムにおいて、おおよそ最も頻出する値とその出現回数からなる配列を返します。結果の配列は、値そのものではなく、値の推定頻度に基づいて高い順にソートされます。

```sql
approx_top_k(N)(column)
approx_top_k(N, reserved)(column)
```

この関数の結果は保証されません。特定の状況ではエラーが発生する場合があり、最頻値ではない値を頻出値として返すことがあります。

`N = 65536` が最大値です。

**パラメータ**

* `N` — 返す要素数。省略可能。デフォルト値: 10。
* `reserved` — 値のために予約するセルの数を定義します。uniq(column) &gt; reserved の場合、topK 関数の結果は近似値になります。省略可能。デフォルト値: N * 3。

**引数**

* `column` — 出現頻度を計算する対象のカラム。

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

# approx&#95;top&#95;count {#approx&#95;top&#95;count}

`approx_top_k` 関数のエイリアスです。

**関連項目**

* [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
* [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
* [approx&#95;top&#95;sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)