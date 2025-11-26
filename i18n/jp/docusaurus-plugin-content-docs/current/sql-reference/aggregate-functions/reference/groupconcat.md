---
description: '文字列のグループを連結して 1 つの文字列を生成します。必要に応じて区切り文字を挟み、要素数の上限を指定できます。'
sidebar_label: 'groupConcat'
sidebar_position: 363
slug: /sql-reference/aggregate-functions/reference/groupconcat
title: 'groupConcat'
doc_type: 'reference'
---

文字列のグループを連結して 1 つの文字列を生成します。必要に応じて区切り文字を挟み、要素数の上限を指定できます。

**構文**

```sql
groupConcat[(delimiter [, limit])](expression);
```

Alias: `group_concat`

**引数**

* `expression` — 連結する文字列を出力する式または列名。
* `delimiter` — 連結された値を区切るために使用される[文字列](../../../sql-reference/data-types/string.md)。この引数は省略可能で、指定されていない場合は空文字列、またはパラメータで指定された区切り文字が既定値として使用されます。

**パラメータ**

* `delimiter` — 連結された値を区切るために使用される[文字列](../../../sql-reference/data-types/string.md)。このパラメータは省略可能で、指定されていない場合は空文字列が既定値として使用されます。
* `limit` — 連結する要素数の最大値を指定する正の[整数](../../../sql-reference/data-types/int-uint.md)。より多くの要素が存在する場合、超過分の要素は無視されます。このパラメータは省略可能です。

:::note
`limit` を指定せずに `delimiter` のみを指定する場合、`delimiter` は最初のパラメータでなければなりません。`delimiter` と `limit` の両方を指定する場合は、`delimiter` を `limit` より前に指定する必要があります。

また、パラメータと引数の両方で異なる区切り文字が指定された場合は、引数で指定された区切り文字のみが使用されます。
:::

**戻り値**

* 列または式の値を連結した[文字列](../../../sql-reference/data-types/string.md)を返します。グループに要素が存在しない場合、または null 要素のみで構成されており、かつ関数で「null のみの値」の扱いが指定されていない場合、結果は値が null の Nullable 型の文字列になります。

**例**

入力テーブル:

```text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1. 区切り文字なしでの基本的な使用方法：

クエリ：

```sql
SELECT groupConcat(Name) FROM Employees;
```

結果:

```text
JohnJaneBob
```

これは、すべての name を区切りなしで 1 つの連続した文字列に連結します。

2. 区切り文字としてカンマを使用する場合:

クエリ:

```sql
SELECT groupConcat(', ')(Name)  FROM Employees;
```

または

```sql
SELECT groupConcat(Name, ', ')  FROM Employees;
```

結果：

```text
John, Jane, Bob
```

この出力は、名前がカンマとその後のスペースで区切られていることを示しています。

3. 連結する要素数の制限

クエリ:

```sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

結果:

```text
John, Jane
```

このクエリでは、テーブルにさらに多くの名前が存在していても、出力は先頭2件の名前に制限されます。
