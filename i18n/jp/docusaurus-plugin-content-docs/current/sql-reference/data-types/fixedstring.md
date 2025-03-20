---
slug: /sql-reference/data-types/fixedstring
sidebar_position: 10
sidebar_label: 'FixedString(N)'
keywords: ['FixedString', 'SQL', 'data types']
description: 'Fixed length string data type in ClickHouse'
---


# FixedString(N)

`N`バイトの固定長文字列（文字でもコードポイントでもない）。

`FixedString`型のカラムを宣言するには、次の構文を使用します：

``` sql
<column_name> FixedString(N)
```

ここで、`N`は自然数です。

`FixedString`型は、データが正確に`N`バイトの長さである場合に効率的です。それ以外の場合は、効率が低下する可能性があります。

`FixedString`型のカラムに効率的に保存できる値の例：

- IPアドレスのバイナリ表現（IPv6の場合は`FixedString(16)`）。
- 言語コード（ru_RU、en_US など）。
- 通貨コード（USD、RUB など）。
- ハッシュのバイナリ表現（MD5の場合は`FixedString(16)`、SHA256の場合は`FixedString(32)`）。

UUID値を保存するには、[UUID](../../sql-reference/data-types/uuid.md)データ型を使用してください。

データを挿入するとき、ClickHouseは：

- 文字列が`N`バイト未満の場合にヌルバイトで文字列を補完します。
- 文字列が`N`バイトを超える場合、`Too large value for FixedString(N)`例外をスローします。

データを選択するとき、ClickHouseは文字列の末尾のヌルバイトを削除しません。`WHERE`句を使用する場合、`FixedString`の値に一致させるためにヌルバイトを手動で追加する必要があります。以下の例は、`FixedString`で`WHERE`句を使用する方法を示しています。

次の`FixedString(2)`カラムを持つテーブルを考えます：

``` text
┌─name──┐
│ b     │
└───────┘
```

クエリ`SELECT * FROM FixedStringTable WHERE a = 'b'`はデータを返しません。このフィルタパターンをヌルバイトで補完する必要があります。

``` sql
SELECT * FROM FixedStringTable
WHERE a = 'b\0'
```

``` text
┌─a─┐
│ b │
└───┘
```

この動作は、文字列がスペースでパディングされ、出力時にスペースが削除される`CHAR`型のMySQLとは異なります。

`FixedString(N)`値の長さは一定であることに注意してください。[length](/sql-reference/functions/array-functions#length)関数は、`FixedString(N)`値がヌルバイトのみで埋められている場合でも`N`を返しますが、[empty](../../sql-reference/functions/string-functions.md#empty)関数はこの場合`1`を返します。
