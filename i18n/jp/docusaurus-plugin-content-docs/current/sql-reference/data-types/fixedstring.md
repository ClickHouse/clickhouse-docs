---
slug: /sql-reference/data-types/fixedstring
sidebar_position: 10
sidebar_label: FixedString(N)
---


# FixedString(N)

`N` バイトの固定長文字列 (文字やコードポイントではありません)。

`FixedString` 型のカラムを宣言するには、次の構文を使用します:

``` sql
<column_name> FixedString(N)
```

ここで `N` は自然数です。

データが正確に `N` バイトの長さを持つ場合、`FixedString` 型は効率的です。それ以外の場合は、効率が低下する可能性があります。

`FixedString` 型のカラムに効率よく格納できる値の例:

- IP アドレスのバイナリ表現 (`FixedString(16)` は IPv6 用)。
- 言語コード (ru_RU, en_US ... )。
- 通貨コード (USD, RUB ... )。
- ハッシュのバイナリ表現 (`FixedString(16)` は MD5 用、`FixedString(32)` は SHA256 用)。

UUID 値を格納するには、[UUID](../../sql-reference/data-types/uuid.md) データ型を使用してください。

データを挿入する際、ClickHouse は次のようにします:

- 文字列が `N` バイト未満の場合、ヌルバイトで文字列を補完します。
- 文字列が `N` バイトを超える場合、`Too large value for FixedString(N)` 例外をスローします。

データを選択する際、ClickHouse は文字列の末尾のヌルバイトを削除しません。`WHERE` 句を使用する場合、`FixedString` 値と一致させるために手動でヌルバイトを追加する必要があります。以下の例は、`FixedString` を用いた `WHERE` 句の使い方を示しています。

次の `FixedString(2)` の単一カラムを持つテーブルを考えます:

``` text
┌─name──┐
│ b     │
└───────┘
```

クエリ `SELECT * FROM FixedStringTable WHERE a = 'b'` は結果としてデータを返しません。フィルタパターンにヌルバイトを補完する必要があります。

``` sql
SELECT * FROM FixedStringTable
WHERE a = 'b\0'
```

``` text
┌─a─┐
│ b │
└───┘
```

この動作は、文字列が空白でパディングされ、出力のために空白が削除される MySQL の `CHAR` 型とは異なります。

`FixedString(N)` の値の長さは一定であることに注意してください。[length](../../sql-reference/functions/array-functions.md#array_functions-length) 関数は、`FixedString(N)` の値がヌルバイトのみで埋められていても `N` を返しますが、[empty](../../sql-reference/functions/string-functions.md#empty) 関数はこの場合 `1` を返します。
