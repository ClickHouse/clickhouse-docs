---
description: '関数のドキュメント'
sidebar_label: 'FUNCTION'
sidebar_position: 38
slug: /sql-reference/statements/create/function
title: 'CREATE FUNCTION -ユーザー定義関数 (UDF)'
doc_type: 'reference'
---

ラムダ式からユーザー定義関数 (UDF) を作成します。式は、関数パラメータ、定数、演算子、または別の関数呼び出しで構成されている必要があります。

**構文**

```sql
CREATE [OR REPLACE] FUNCTION name [ON CLUSTER cluster] AS (parameter0, ...) -> expression
```

関数は任意の数のパラメータを取ることができます。

次の制約があります:

* 関数名は、ユーザー定義関数およびシステム関数の中で一意でなければなりません。
* 再帰関数は許可されていません。
* 関数が使用するすべての変数は、そのパラメータリスト内で指定されていなければなりません。

いずれかの制約に違反した場合は、例外がスローされます。

**例**

クエリ:

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

次のクエリでは、[条件関数](../../../sql-reference/functions/conditional-functions.md) がユーザー定義関数内で呼び出されています。

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

既存の UDF の置き換え:

```sql
CREATE FUNCTION exampleReplaceFunction AS frame -> frame;
SELECT create_query FROM system.functions WHERE name = 'exampleReplaceFunction';
CREATE OR REPLACE FUNCTION exampleReplaceFunction AS frame -> frame + 1;
SELECT create_query FROM system.functions WHERE name = 'exampleReplaceFunction';
```

結果：

```text
┌─create_query─────────────────────────────────────────────┐
│ CREATE FUNCTION exampleReplaceFunction AS frame -> frame │
└──────────────────────────────────────────────────────────┘

┌─create_query───────────────────────────────────────────────────┐
│ CREATE FUNCTION exampleReplaceFunction AS frame -> (frame + 1) │
└────────────────────────────────────────────────────────────────┘
```


## 関連コンテンツ \{#related-content\}

### [実行可能な UDF](/sql-reference/functions/udf.md) \{#executable-udfs\}

### [ClickHouse Cloud におけるユーザー定義関数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) \{#user-defined-functions-in-clickhouse-cloud\}