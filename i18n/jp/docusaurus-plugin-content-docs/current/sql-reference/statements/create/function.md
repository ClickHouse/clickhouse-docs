---
description: 'Functionのためのドキュメント'
sidebar_label: 'FUNCTION'
sidebar_position: 38
slug: '/sql-reference/statements/create/function'
title: 'CREATE FUNCTION -ユーザー定義関数 (UDF)'
---



ユーザー定義関数 (UDF) をラムダ式から作成します。この式は関数パラメータ、定数、演算子、または他の関数呼び出しで構成されている必要があります。

**構文**

```sql
CREATE FUNCTION name [ON CLUSTER cluster] AS (parameter0, ...) -> expression
```
関数は任意の数のパラメータを持つことができます。

いくつかの制限があります：

- 関数の名前は、ユーザー定義関数とシステム関数の間で一意である必要があります。
- 再帰関数は許可されていません。
- 関数内で使用されるすべての変数は、そのパラメータリストに指定する必要があります。

これらの制限のいずれかが違反されると、例外が発生します。

**例**

クエリ：

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
SELECT number, linear_equation(number, 2, 1) FROM numbers(3);
```

結果：

```text
┌─number─┬─plus(multiply(2, number), 1)─┐
│      0 │                            1 │
│      1 │                            3 │
│      2 │                            5 │
└────────┴──────────────────────────────┘
```

次のクエリではユーザー定義関数内で[条件付き関数](../../../sql-reference/functions/conditional-functions.md)が呼び出されています：

```sql
CREATE FUNCTION parity_str AS (n) -> if(n % 2, 'odd', 'even');
SELECT number, parity_str(number) FROM numbers(3);
```

結果：

```text
┌─number─┬─if(modulo(number, 2), 'odd', 'even')─┐
│      0 │ even                                 │
│      1 │ odd                                  │
│      2 │ even                                 │
└────────┴──────────────────────────────────────┘
```

## 関連コンテンツ {#related-content}

### [実行可能な UDF]( /sql-reference/functions/udf.md). {#executable-udfs}

### [ClickHouse Cloud のユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
