---
slug: /sql-reference/functions/comparison-functions
sidebar_position: 35
sidebar_label: 比較
---

# 比較関数

以下の比較関数は、型 [UInt8](/sql-reference/data-types/int-uint) の `0` または `1` を返します。同じグループ内の値のみが比較可能です（例えば、`UInt16` と `UInt64`）が、グループを超えた比較はできません（例えば、`UInt16` と `DateTime`）。数値と文字列の比較は可能であり、文字列と日付、日付と時間の比較も可能です。タプルと配列の場合、比較は辞書式で行われ、左側と右側のタプル/配列の各対応する要素で比較が行われます。

比較可能な型は以下のとおりです：
- 数値および小数
- 文字列および固定長文字列
- 日付
- 時間を含む日付
- タプル（辞書式比較）
- 配列（辞書式比較）

:::note
文字列はバイト単位で比較されます。これにより、一方の文字列にUTF-8エンコードのマルチバイト文字が含まれている場合に予期しない結果になることがあります。
他の文字列S2を接頭辞として持つ文字列S1は、S2よりも長いと見なされます。
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
