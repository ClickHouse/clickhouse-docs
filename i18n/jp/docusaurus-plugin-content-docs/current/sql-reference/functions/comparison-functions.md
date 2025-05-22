---
'description': 'Documentation for Comparison Functions'
'sidebar_label': 'Comparison'
'sidebar_position': 35
'slug': '/sql-reference/functions/comparison-functions'
'title': 'Comparison Functions'
---




# 比較関数

以下の比較関数は、型 [UInt8](/sql-reference/data-types/int-uint) の `0` または `1` を返します。同じグループ内の値のみが比較可能です（例: `UInt16` と `UInt64`）が、グループ間の比較はできません（例: `UInt16` と `DateTime`）。数値と文字列の比較は可能であり、文字列と日時、日時と時間の比較も可能です。タプルと配列については、辞書式比較が行われるため、左側と右側のタプル/配列の対応する要素ごとに比較されます。

比較可能な型は以下の通りです：
- 数値と小数
- 文字列と固定文字列
- 日付
- 時間付き日付
- タプル（辞書式比較）
- 配列（辞書式比較）

:::note
文字列はバイトごとに比較されます。そのため、文字列の1つにUTF-8エンコードのマルチバイト文字が含まれている場合、予期しない結果になることがあります。
文字列 S1 が別の文字列 S2 のプレフィックスである場合、S1 は S2 よりも長いと見なされます。
:::

## equals, `=`, `==` 演算子 {#equals}

**構文**

```sql
equals(a, b)
```

エイリアス：
- `a = b` （演算子）
- `a == b` （演算子）

## notEquals, `!=`, `<>` 演算子 {#notequals}

**構文**

```sql
notEquals(a, b)
```

エイリアス：
- `a != b` （演算子）
- `a <> b` （演算子）

## less, `<` 演算子 {#less}

**構文**

```sql
less(a, b)
```

エイリアス：
- `a < b` （演算子）

## greater, `>` 演算子 {#greater}

**構文**

```sql
greater(a, b)
```

エイリアス：
- `a > b` （演算子）

## lessOrEquals, `<=` 演算子 {#lessorequals}

**構文**

```sql
lessOrEquals(a, b)
```

エイリアス：
- `a <= b` （演算子）

## greaterOrEquals, `>=` 演算子 {#greaterorequals}

**構文**

```sql
greaterOrEquals(a, b)
```

エイリアス：
- `a >= b` （演算子）
