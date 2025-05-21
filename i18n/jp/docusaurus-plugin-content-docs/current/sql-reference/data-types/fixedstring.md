---
description: 'ClickHouseにおけるFixedStringデータ型のドキュメント'
sidebar_label: 'FixedString(N)'
sidebar_position: 10
slug: /sql-reference/data-types/fixedstring
title: 'FixedString(N)'
---


# FixedString(N)

`N`バイト（文字やコードポイントではない）の固定長文字列。

`FixedString`型のカラムを宣言するには、次の構文を使用します：

```sql
<column_name> FixedString(N)
```

ここで`N`は自然数です。

`FixedString`型は、データの長さが正確に`N`バイトである場合に効率的です。それ以外の場合は、効率が低下する可能性があります。

`FixedString`型のカラムに効率的に格納できる値の例：

- IPアドレスのバイナリ表現（IPv6の場合は`FixedString(16)`）。
- 言語コード（ru_RU、en_US...）。
- 通貨コード（USD、RUB...）。
- ハッシュのバイナリ表現（MD5の場合は`FixedString(16)`、SHA256の場合は`FixedString(32)`）。

UUID値を格納するには、[UUID](../../sql-reference/data-types/uuid.md)データ型を使用してください。

データを挿入する際、ClickHouseは以下の動作を行います：

- 文字列が`N`バイト未満の場合、文字列をヌルバイトで補完します。
- 文字列が`N`バイトを超える場合、`Too large value for FixedString(N)`例外をスローします。

データを選択する際、ClickHouseは文字列の末尾にあるヌルバイトを削除しません。`WHERE`句を使用する場合、`FixedString`値に一致させるためにヌルバイトを手動で追加する必要があります。以下の例は、`FixedString`と共に`WHERE`句を使用する方法を示しています。

次のような単一の`FixedString(2)`カラムを持つテーブルを考えます：

```text
┌─name──┐
│ b     │
└───────┘
```

クエリ`SELECT * FROM FixedStringTable WHERE a = 'b'`は結果としてデータを返しません。フィルターパターンをヌルバイトで補完する必要があります。

```sql
SELECT * FROM FixedStringTable
WHERE a = 'b\0'
```

```text
┌─a─┐
│ b │
└───┘
```

この動作は、`CHAR`型のMySQLとは異なります（そこでは文字列がスペースでパディングされ、出力用にスペースが削除されます）。

`FixedString(N)`値の長さは一定であることに注意してください。[length](/sql-reference/functions/array-functions#length)関数は、`FixedString(N)`値がヌルバイトのみで埋められている場合でも`N`を返しますが、[empty](../../sql-reference/functions/string-functions.md#empty)関数はこの場合`1`を返します。
