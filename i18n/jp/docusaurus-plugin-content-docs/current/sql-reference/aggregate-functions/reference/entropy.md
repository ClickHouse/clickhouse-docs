---
description: '列に含まれる値のシャノンエントロピーを計算します。'
sidebar_position: 131
slug: /sql-reference/aggregate-functions/reference/entropy
title: 'entropy'
doc_type: 'reference'
---

# entropy

値の列に対して [Shannon エントロピー](https://en.wikipedia.org/wiki/Entropy_\(information_theory\)) を計算します。

**構文**

```sql
entropy(val)
```

**引数**

* `val` — 任意の型の値を格納する列。

**戻り値**

* シャノンエントロピー。

型: [Float64](../../../sql-reference/data-types/float.md)。

**例**

クエリ:

```sql
CREATE TABLE entropy (`vals` UInt32,`strings` String) ENGINE = Memory;

INSERT INTO entropy VALUES (1, 'A'), (1, 'A'), (1,'A'), (1,'A'), (2,'B'), (2,'B'), (2,'C'), (2,'D');

SELECT entropy(vals), entropy(strings) FROM entropy;
```

結果:

```text
┌─entropy(vals)─┬─entropy(strings)─┐
│             1 │             1.75 │
└───────────────┴──────────────────┘
```
