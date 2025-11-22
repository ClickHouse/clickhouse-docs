---
description: 'ClickHouse における FixedString データ型のリファレンス'
sidebar_label: 'FixedString(N)'
sidebar_position: 10
slug: /sql-reference/data-types/fixedstring
title: 'FixedString(N)'
doc_type: 'reference'
---

# FixedString(N)

`N` バイトの固定長文字列（文字数やコードポイント数ではありません）。

`FixedString` 型の列を宣言するには、次の構文を使用します。

```sql
<column_name> FixedString(N)
```

ここで `N` は自然数です。

`FixedString` 型は、データの長さがちょうど `N` バイトである場合に効率的です。それ以外の場合は、かえって非効率になる可能性があります。

`FixedString` 型の列に効率的に保存できる値の例:

* IP アドレスのバイナリ表現（IPv6 の場合は `FixedString(16)`）。
* 言語コード（ru&#95;RU, en&#95;US ... ）。
* 通貨コード（USD, RUB ... ）。
* ハッシュのバイナリ表現（MD5 の場合は `FixedString(16)`、SHA256 の場合は `FixedString(32)`）。

UUID 値を保存するには、[UUID](../../sql-reference/data-types/uuid.md) データ型を使用します。

データを挿入する際、ClickHouse は次のように動作します:

* 文字列が `N` バイト未満の場合、ヌルバイトで文字列を埋めます。
* 文字列が `N` バイトを超える場合、`Too large value for FixedString(N)` という例外をスローします。

次のような、`FixedString(2)` の単一列を持つテーブルを考えます:

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

`FixedString(N)` の値の長さは一定です。[length](/sql-reference/functions/array-functions#length) 関数は、`FixedString(N)` の値がヌルバイトのみで埋められている場合でも `N` を返しますが、この場合 [empty](/sql-reference/functions/array-functions#empty) 関数は `1` を返します。

`WHERE` 句を用いてデータを選択する場合、条件の指定方法によって結果が異なります。

* 等価演算子 `=` または `==`、あるいは `equals` 関数が使用されている場合、ClickHouse は `\0` 文字を考慮 *しません*。つまり、`SELECT * FROM FixedStringTable WHERE name = 'a';` と `SELECT * FROM FixedStringTable WHERE name = 'a\0';` というクエリは同じ結果を返します。
* `LIKE` 句が使用されている場合、ClickHouse は `\0` 文字を考慮 *します*。したがって、フィルター条件内で `\0` 文字を明示的に指定する必要が生じる場合があります。

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

クエリID: c32cec28-bb9e-4650-86ce-d74a1694d79e

{"name":"a\u0000"}


SELECT name
FROM FixedStringTable
WHERE name LIKE 'a'
FORMAT JSONStringsEachRow

0行のセット。


SELECT name
FROM FixedStringTable
WHERE name LIKE 'a\0'
FORMAT JSONStringsEachRow

{"name":"a\u0000"}
```
