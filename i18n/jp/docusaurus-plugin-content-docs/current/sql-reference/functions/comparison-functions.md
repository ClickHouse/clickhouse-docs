---
description: '比較関数のドキュメント'
sidebar_label: '比較'
sidebar_position: 35
slug: /sql-reference/functions/comparison-functions
title: '比較関数'
---


# 比較関数

以下の比較関数は、型 [UInt8](/sql-reference/data-types/int-uint) の `0` または `1` を返します。同じグループ内の値（例: `UInt16` と `UInt64`）のみ比較可能ですが、グループ間（例: `UInt16` と `DateTime`）では比較できません。数値と文字列の比較、また文字列と日付、日付と時間の比較が可能です。タプルや配列については、比較は字典順（lexicographic）で行われ、左側と右側のタプル/配列の各対応する要素について比較が行われます。

比較できるデータ型は以下の通りです：
- 数値と小数
- 文字列と固定長文字列
- 日付
- 日付と時間
- タプル（字典順比較）
- 配列（字典順比較）

:::note
文字列はバイト単位で比較されます。これにより、いずれかの文字列が UTF-8 エンコードのマルチバイト文字を含んでいる場合に予期しない結果になる可能性があります。
別の文字列 S2 をプレフィックスとして持つ文字列 S1 は、S2 よりも長いと見なされます。
:::

## equals, `=`, `==` 演算子 {#equals}

**構文**

```sql
equals(a, b)
```

エイリアス：
- `a = b` (演算子)
- `a == b` (演算子)

## notEquals, `!=`, `<>` 演算子 {#notequals}

**構文**

```sql
notEquals(a, b)
```

エイリアス：
- `a != b` (演算子)
- `a <> b` (演算子)

## less, `<` 演算子 {#less}

**構文**

```sql
less(a, b)
```

エイリアス：
- `a < b` (演算子)

## greater, `>` 演算子 {#greater}

**構文**

```sql
greater(a, b)
```

エイリアス：
- `a > b` (演算子)

## lessOrEquals, `<=` 演算子 {#lessorequals}

**構文**

```sql
lessOrEquals(a, b)
```

エイリアス：
- `a <= b` (演算子)

## greaterOrEquals, `>=` 演算子 {#greaterorequals}

**構文**

```sql
greaterOrEquals(a, b)
```

エイリアス：
- `a >= b` (演算子)
