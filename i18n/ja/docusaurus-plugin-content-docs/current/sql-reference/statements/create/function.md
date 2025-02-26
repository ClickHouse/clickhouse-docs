---
slug: /sql-reference/statements/create/function
sidebar_position: 38
sidebar_label: FUNCTION
title: "CREATE FUNCTION - ユーザー定義関数 (UDF)"
---

ラムダ式からユーザー定義関数 (UDF) を作成します。この式は、関数パラメータ、定数、演算子、または他の関数呼び出しで構成される必要があります。

**構文**

```sql
CREATE FUNCTION name [ON CLUSTER cluster] AS (parameter0, ...) -> expression
```
関数は任意の数のパラメータを持つことができます。

いくつかの制限があります：

- 関数の名前は、ユーザー定義関数とシステム関数の中で一意でなければなりません。
- 再帰関数は許可されていません。
- 関数で使用されるすべての変数は、そのパラメータリストに指定されていなければなりません。

いずれかの制限に違反した場合、例外が発生します。

**例**

クエリ：

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
SELECT number, linear_equation(number, 2, 1) FROM numbers(3);
```

結果：

``` text
┌─number─┬─plus(multiply(2, number), 1)─┐
│      0 │                            1 │
│      1 │                            3 │
│      2 │                            5 │
└────────┴──────────────────────────────┘
```

以下のクエリで、ユーザー定義関数内で[条件付き関数](../../../sql-reference/functions/conditional-functions.md)が呼び出されます：

```sql
CREATE FUNCTION parity_str AS (n) -> if(n % 2, 'odd', 'even');
SELECT number, parity_str(number) FROM numbers(3);
```

結果：

``` text
┌─number─┬─if(modulo(number, 2), 'odd', 'even')─┐
│      0 │ even                                 │
│      1 │ odd                                  │
│      2 │ even                                 │
└────────┴──────────────────────────────────────┘
```

## 関連コンテンツ {#related-content}

### [実行可能な UDF](/sql-reference/functions/udf.md)。 {#executable-udfs}

### [ClickHouse Cloud でのユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
