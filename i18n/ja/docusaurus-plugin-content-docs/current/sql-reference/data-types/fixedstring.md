---
slug: /sql-reference/data-types/fixedstring
sidebar_position: 10
sidebar_label: FixedString(N)
---

# FixedString(N)

`N` バイトの固定長文字列（文字やコードポイントではありません）。

`FixedString` 型のカラムを宣言するには、次の構文を使用します：

``` sql
<column_name> FixedString(N)
```

ここで、`N` は自然数です。

`FixedString` 型は、データが正確に `N` バイトの長さである場合に効率的です。それ以外のすべての場合、効率が低下する可能性があります。

`FixedString` 型のカラムに効率よく格納できる値の例：

- IP アドレスのバイナリ表現（IPv6 用の `FixedString(16)`）。
- 言語コード（ru_RU、en_US ...）。
- 通貨コード（USD、RUB ...）。
- ハッシュのバイナリ表現（MD5 用の `FixedString(16)`、SHA256 用の `FixedString(32)`）。

UUID 値を格納するには、[UUID](../../sql-reference/data-types/uuid.md) データ型を使用してください。

データを挿入する際、ClickHouse は以下のように処理します：

- 字符列が `N` バイト未満の場合、ヌルバイトで補完します。
- 字符列が `N` バイトを超える場合、`Too large value for FixedString(N)` 例外がスローされます。

データを選択する際、ClickHouse は文字列の末尾のヌルバイトを削除しません。`WHERE` 句を使用する場合、`FixedString` 値に一致させるために手動でヌルバイトを追加する必要があります。以下の例は、`FixedString` を使用した `WHERE` 句の使用方法を示しています。

次の `FixedString(2)` のカラムを持つテーブルを考えてみましょう：

``` text
┌─name──┐
│ b     │
└───────┘
```

クエリ `SELECT * FROM FixedStringTable WHERE a = 'b'` は、結果としてデータを返しません。フィルターパターンをヌルバイトで補完する必要があります。

``` sql
SELECT * FROM FixedStringTable
WHERE a = 'b\0'
```

``` text
┌─a─┐
│ b │
└───┘
```

この動作は、文字列がスペースでパディングされ、出力時にスペースが削除される `CHAR` 型の MySQL とは異なります。

`FixedString(N)` 値の長さは一定であることに注意してください。[length](../../sql-reference/functions/array-functions.md#array_functions-length) 関数は、`FixedString(N)` 値がヌルバイトのみで埋められている場合でも `N` を返しますが、[empty](../../sql-reference/functions/string-functions.md#empty) 関数はこの場合 `1` を返します。
