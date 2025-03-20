---
slug: /sql-reference/statements/create/function
sidebar_position: 38
sidebar_label: FUNCTION
title: "CREATE FUNCTION - ユーザー定義関数 (UDF)"
---

ラムダ式からユーザー定義関数 (UDF) を作成します。式は関数の引数、定数、演算子、または他の関数呼び出しで構成される必要があります。

**構文**

```sql
CREATE FUNCTION name [ON CLUSTER cluster] AS (parameter0, ...) -> expression
```
関数は任意の数の引数を持つことができます。

いくつかの制限があります。

- 関数の名前はユーザー定義関数およびシステム関数の中で一意でなければなりません。
- 再帰関数は許可されていません。
- 関数で使用されるすべての変数は、パラメータリストに指定されなければなりません。

制限が違反された場合、例外が発生します。

**例**

クエリ:

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
SELECT number, linear_equation(number, 2, 1) FROM numbers(3);
```

結果:

``` text
┌─number─┬─plus(multiply(2, number), 1)─┐
│      0 │                            1 │
│      1 │                            3 │
│      2 │                            5 │
└────────┴──────────────────────────────┘
```

[条件関数](../../../sql-reference/functions/conditional-functions.md) は次のクエリのユーザー定義関数内で呼び出されます。

```sql
CREATE FUNCTION parity_str AS (n) -> if(n % 2, 'odd', 'even');
SELECT number, parity_str(number) FROM numbers(3);
```

結果:

``` text
┌─number─┬─if(modulo(number, 2), 'odd', 'even')─┐
│      0 │ even                                 │
│      1 │ odd                                  │
│      2 │ even                                 │
└────────┴──────────────────────────────────────┘
```

## 関連コンテンツ {#related-content}

### [実行可能な UDFs](/sql-reference/functions/udf.md). {#executable-udfs}

### [ClickHouse Cloudにおけるユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
