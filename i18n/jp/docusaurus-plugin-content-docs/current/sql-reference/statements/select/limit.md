---
description: 'LIMIT 句のドキュメント'
sidebar_label: 'LIMIT'
slug: /sql-reference/statements/select/limit
title: 'LIMIT 句'
doc_type: 'reference'
---

# LIMIT 句 {#limit-clause}

`LIMIT` 句は、クエリの結果として返される行数を制御します。

## 基本構文 {#basic-syntax}

**先頭の行を選択:**

```sql
LIMIT m
```

結果セットから先頭の `m` 行を返します。結果セットのレコード数が `m` 未満の場合は、すべてのレコードを返します。

**代替 TOP 構文（MS SQL Server 互換）：**

```sql
-- SELECT TOP 数値|パーセント カラム名 FROM テーブル名
SELECT TOP 10 * FROM numbers(100);
SELECT TOP 0.1 * FROM numbers(100);
```

これは `LIMIT m` と同等であり、Microsoft SQL Server 用のクエリとの互換性を保つために使用できます。

**オフセット指定付き SELECT:**

```sql
LIMIT m OFFSET n
-- または同等に:
LIMIT n, m
```

最初の `n` 行をスキップし、その後の `m` 行を返します。

どちらの形式でも、`n` と `m` は 0 以上の整数でなければなりません。


## 負の LIMIT {#negative-limits}

負の値を使用して、結果セットの*末尾*から行を選択します。

| 構文 | 結果 |
|--------|--------|
| `LIMIT -m` | 末尾の `m` 行 |
| `LIMIT -m OFFSET -n` | 末尾の `n` 行をスキップした後の末尾の `m` 行 |
| `LIMIT m OFFSET -n` | 末尾の `n` 行をスキップした後の先頭の `m` 行 |
| `LIMIT -m OFFSET n` | 先頭の `n` 行をスキップした後の末尾の `m` 行 |

`LIMIT -n, -m` 構文は `LIMIT -m OFFSET -n` と同等です。

## 小数による LIMIT {#fractional-limits}

0 から 1 の間の小数値を使って、行の一定割合を選択できます:

| 構文 | 結果 |
|--------|--------|
| `LIMIT 0.1` | 先頭 10% の行 |
| `LIMIT 1 OFFSET 0.5` | 中央の行 |
| `LIMIT 0.25 OFFSET 0.5` | 第3四分位（先頭 50% をスキップした後の 25% の行） |

:::note

- 小数は 0 より大きく 1 より小さい [Float64](../../data-types/float.md) 型の値でなければなりません。
- 小数で指定された行数は、最も近い整数に丸められます。
:::

## 制限タイプの組み合わせ {#combining-limit-types}

標準の整数と小数や負のオフセットを組み合わせて使用できます。

```sql
LIMIT 10 OFFSET 0.5    -- 中間地点から10行
LIMIT 10 OFFSET -20    -- 最後の20行をスキップした後の10行
```


## LIMIT ... WITH TIES {#limit--with-ties-modifier}

`WITH TIES` 修飾子は、LIMIT 句で取得される最後の行と同じ `ORDER BY` の値を持つ行を、追加で結果に含めます。

```sql
SELECT * FROM (
    SELECT number % 50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5
```

```response
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

`WITH TIES` を指定すると、最後の値と同じ値を持つすべての行が含まれます。

```sql
SELECT * FROM (
    SELECT number % 50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5 WITH TIES
```

```response
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
│ 2 │
└───┘
```

行 6 は、行 5 と同じ値（`2`）を持つため含まれます。

:::note
`WITH TIES` は負の LIMIT 値ではサポートされていません。
:::

この修飾子は、[`ORDER BY ... WITH FILL`](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier) 修飾子と組み合わせて使用できます。


## 考慮事項 {#considerations}

**非決定的な結果:** [`ORDER BY`](../../../sql-reference/statements/select/order-by.md) 句がない場合、返される行は任意のものとなり、クエリの実行ごとに結果が変わる可能性があります。

**サーバー側の制限:** 返される行数は、[limit 設定](../../../operations/settings/settings.md#limit) によっても影響を受けます。

## 関連項目 {#see-also}

- [LIMIT BY](/sql-reference/statements/select/limit-by) — 値のグループごとに行数を制限でき、各カテゴリ内で上位 N 件の結果を取得するのに便利です。