---
slug: /sql-reference/functions/comparison-functions
sidebar_position: 35
sidebar_label: 比較
---


# 比較関数

以下の比較関数は、型 [UInt8](/sql-reference/data-types/int-uint) の `0` または `1` を返します。同じグループ内の値のみ比較可能です（例: `UInt16` と `UInt64`）が、グループ間での比較はできません（例: `UInt16` と `DateTime`）。数値と文字列の比較、文字列と日付の比較、日付と時刻の比較が可能です。タプルや配列の場合、比較は辞書式で行われ、左側と右側のタプル/配列の対応する要素ごとに比較が行われます。

以下の型が比較可能です:
- 数値と小数
- 文字列と固定長文字列
- 日付
- 時刻付きの日付
- タプル（辞書式比較）
- 配列（辞書式比較）

:::note
文字列はバイト単位で比較されます。これにより、文字列の1つがUTF-8エンコードされたマルチバイト文字を含む場合、予期しない結果が生じる可能性があります。
文字列 S1 が別の文字列 S2 をプレフィックスとして持つ場合、S1 は S2 よりも長いと見なされます。
:::

## equals, `=`, `==` 演算子 {#equals}

**構文**

```sql
equals(a, b)
```

エイリアス:
- `a = b` (演算子)
- `a == b` (演算子)

## notEquals, `!=`, `<>` 演算子 {#notequals}

**構文**

```sql
notEquals(a, b)
```

エイリアス:
- `a != b` (演算子)
- `a <> b` (演算子)

## less, `<` 演算子 {#less}

**構文**

```sql
less(a, b)
```

エイリアス:
- `a < b` (演算子)

## greater, `>` 演算子 {#greater}

**構文**

```sql
greater(a, b)
```

エイリアス:
- `a > b` (演算子)

## lessOrEquals, `<=` 演算子 {#lessorequals}

**構文**

```sql
lessOrEquals(a, b)
```

エイリアス:
- `a <= b` (演算子)

## greaterOrEquals, `>=` 演算子 {#greaterorequals}

**構文**

```sql
greaterOrEquals(a, b)
```

エイリアス:
- `a >= b` (演算子)
