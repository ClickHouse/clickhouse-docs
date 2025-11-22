---
description: '関数のドキュメント'
sidebar_label: 'FUNCTION（関数）'
sidebar_position: 38
slug: /sql-reference/statements/create/function
title: 'CREATE FUNCTION -ユーザー定義関数 (UDF)'
doc_type: 'reference'
---

ラムダ式からユーザー定義関数 (UDF) を作成します。式は関数パラメーター、定数、演算子、または他の関数の呼び出しのみで構成されている必要があります。

**構文**

```sql
CREATE FUNCTION name [ON CLUSTER cluster] AS (parameter0, ...) -> expression
```

関数は任意の数のパラメータを取ることができます。

次のような制約があります。

* 関数名は、ユーザー定義関数およびシステム関数の中で一意でなければなりません。
* 再帰関数は許可されません。
* 関数で使用されるすべての変数は、そのパラメータリストで指定されていなければなりません。

いずれかの制約に違反した場合は、例外が送出されます。

**例**

クエリ:

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
SELECT number, linear_equation(number, 2, 1) FROM numbers(3);
```

結果:

```text
┌─number─┬─plus(multiply(2, number), 1)─┐
│      0 │                            1 │
│      1 │                            3 │
│      2 │                            5 │
└────────┴──────────────────────────────┘
```

次のクエリでは、ユーザー定義関数内で[条件関数](../../../sql-reference/functions/conditional-functions.md)が呼び出されています。

```sql
CREATE FUNCTION parity_str AS (n) -> if(n % 2, 'odd', 'even');
SELECT number, parity_str(number) FROM numbers(3);
```

結果:

```text
┌─number─┬─if(modulo(number, 2), 'odd', 'even')─┐
│      0 │ even                                 │
│      1 │ odd                                  │
│      2 │ even                                 │
└────────┴──────────────────────────────────────┘
```


## 関連コンテンツ {#related-content}

### [実行可能UDF](/sql-reference/functions/udf.md) {#executable-udfs}

### [ClickHouse Cloudのユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
