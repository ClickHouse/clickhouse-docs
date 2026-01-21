---
description: 'ClickHouse の FixedString データ型に関するドキュメント'
sidebar_label: 'FixedString(N)'
sidebar_position: 10
slug: /sql-reference/data-types/fixedstring
title: 'FixedString(N)'
doc_type: 'reference'
---

# FixedString(N) \{#fixedstringn\}

`N` バイトの固定長文字列（文字数でもコードポイント数でもありません）。

`FixedString` 型の列を宣言するには、次の構文を使用します。

```sql
<column_name> FixedString(N)
```

ここで、`N` は自然数です。

`FixedString` 型は、データの長さがちょうど `N` バイトである場合に効率的です。それ以外の場合は、かえって非効率になる可能性があります。

`FixedString` 型のカラムに効率的に保存できる値の例は次のとおりです。

* IP アドレスのバイナリ表現（IPv6 では `FixedString(16)`）。
* 言語コード（ru&#95;RU, en&#95;US など）。
* 通貨コード（USD, RUB など）。
* ハッシュのバイナリ表現（MD5 では `FixedString(16)`、SHA256 では `FixedString(32)`）。

UUID の値を保存するには、[UUID](../../sql-reference/data-types/uuid.md) データ型を使用します。

データを挿入する際、ClickHouse は次のように動作します。

* 文字列が `N` バイト未満の場合、ヌルバイトで文字列を埋めます。
* 文字列が `N` バイトを超える場合、`Too large value for FixedString(N)` 例外をスローします。

次のような、単一の `FixedString(2)` カラムをもつテーブルを考えます。

```sql


INSERT INTO FixedStringTable VALUES ('a'), ('ab'), ('');
```

```sql
SELECT
    name,
    toTypeName(name),
    length(name),
    empty(name)
FROM FixedStringTable;
```

```text
┌─name─┬─toTypeName(name)─┬─length(name)─┬─empty(name)─┐
│ a    │ FixedString(2)   │            2 │           0 │
│ ab   │ FixedString(2)   │            2 │           0 │
│      │ FixedString(2)   │            2 │           1 │
└──────┴──────────────────┴──────────────┴─────────────┘
```

`FixedString(N)` の値の長さは一定であることに注意してください。[length](/sql-reference/functions/array-functions#length) 関数は、`FixedString(N)` の値がヌルバイトのみで埋められている場合でも `N` を返しますが、この場合 [empty](/sql-reference/functions/array-functions#empty) 関数は `1` を返します。

`WHERE` 句でデータを選択する場合、条件の指定方法によって返される結果が変わります。

* 等価演算子 `=` または `==`、あるいは `equals` 関数が使用される場合、ClickHouse は `\0` 文字を考慮 *しません*。つまり、`SELECT * FROM FixedStringTable WHERE name = 'a';` と `SELECT * FROM FixedStringTable WHERE name = 'a\0';` というクエリは同じ結果を返します。
* `LIKE` 句が使用される場合、ClickHouse は `\0` 文字を考慮 *します*。このため、フィルタ条件で明示的に `\0` 文字を指定する必要が生じる場合があります。

```sql
SELECT name
FROM FixedStringTable
WHERE name = 'a'
FORMAT JSONStringsEachRow

{"name":"a\u0000"}


SELECT name
FROM FixedStringTable
WHERE name = 'a\0'
FORMAT JSONStringsEachRow

{"name":"a\u0000"}


SELECT name
FROM FixedStringTable
WHERE name = 'a'
FORMAT JSONStringsEachRow

Query id: c32cec28-bb9e-4650-86ce-d74a1694d79e

{"name":"a\u0000"}


SELECT name
FROM FixedStringTable
WHERE name LIKE 'a'
FORMAT JSONStringsEachRow

0 rows in set.


SELECT name
FROM FixedStringTable
WHERE name LIKE 'a\0'
FORMAT JSONStringsEachRow

{"name":"a\u0000"}
```
