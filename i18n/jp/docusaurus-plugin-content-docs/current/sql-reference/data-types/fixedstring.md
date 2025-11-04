---
'description': 'ClickHouseのFixedStringデータ型に関するDocumentation'
'sidebar_label': 'FixedString(N)'
'sidebar_position': 10
'slug': '/sql-reference/data-types/fixedstring'
'title': 'FixedString(N)'
'doc_type': 'reference'
---


# FixedString(N)

`N` バイトの固定長文字列（文字やコードポイントではない）。

`FixedString` 型のカラムを宣言するには、以下の構文を使用します：

```sql
<column_name> FixedString(N)
```

ここで、`N` は自然数です。

`FixedString` 型は、データの長さが正確に `N` バイトである場合に効率的です。それ以外のすべてのケースでは、効率性が低下する可能性があります。

`FixedString` 型のカラムに効率的に格納できる値の例：

- IP アドレスのバイナリ表現（IPv6 用の `FixedString(16)`）。
- 言語コード（ru_RU, en_US ...）。
- 通貨コード（USD, RUB ...）。
- ハッシュのバイナリ表現（MD5 用の `FixedString(16)`、SHA256 用の `FixedString(32)`）。

UUID 値を格納するには、[UUID](../../sql-reference/data-types/uuid.md) データ型を使用します。

データを挿入する際、ClickHouse は：

- 文字列が `N` バイト未満の場合、文字列にヌルバイトを追加します。
- 文字列が `N` バイトより大きい場合に `Too large value for FixedString(N)` 例外をスローします。

次のテーブルは、1つの `FixedString(2)` カラムを持っています：

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

`FixedString(N)` 値の長さは一定であることに注意してください。[length](/sql-reference/functions/array-functions#length) 関数は、`FixedString(N)` 値がヌルバイトだけで埋められている場合でも `N` を返しますが、[empty](../../sql-reference/functions/string-functions.md#empty) 関数はこの場合 `1` を返します。

`WHERE` 節を使用してデータを選択すると、条件が指定される方法によって異なる結果が返されます：

- 等号演算子 `=` または `==` または `equals` 関数が使用される場合、ClickHouse は `\0` 文字を考慮しません。つまり、クエリ `SELECT * FROM FixedStringTable WHERE name = 'a';` と `SELECT * FROM FixedStringTable WHERE name = 'a\0';` は同じ結果を返します。
- `LIKE` 節が使用される場合、ClickHouse は `\0` 文字を考慮するため、フィルタ条件に明示的に `\0` 文字を指定する必要があるかもしれません。

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
