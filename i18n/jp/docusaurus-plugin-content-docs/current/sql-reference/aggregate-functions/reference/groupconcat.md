---
description: '文字列のグループから連結された文字列を生成します。必要に応じて区切り文字を挟んで連結し、さらに要素数の上限で制限できます。'
sidebar_label: 'groupConcat'
sidebar_position: 363
slug: /sql-reference/aggregate-functions/reference/groupconcat
title: 'groupConcat'
doc_type: 'reference'
---

文字列のグループから連結された文字列を生成します。必要に応じて区切り文字を挟んで連結し、さらに要素数の上限で制限できます。

**構文**

```sql
groupConcat[(delimiter [, limit])](expression);
```

Alias: `group_concat`

**引数**

* `expression` — 連結する文字列を出力する式またはカラム名。
* `delimiter` — 連結した値同士を区切るために使用される[文字列](../../../sql-reference/data-types/string.md)。このパラメータは省略可能で、指定されていない場合は空文字列、またはパラメータ側で指定された区切り文字が使用されます。

**パラメータ**

* `delimiter` — 連結した値同士を区切るために使用される[文字列](../../../sql-reference/data-types/string.md)。このパラメータは省略可能で、指定されていない場合は空文字列が使用されます。
* `limit` — 連結する要素数の上限を指定する正の[整数](../../../sql-reference/data-types/int-uint.md)。要素数が多い場合、上限を超えた要素は無視されます。このパラメータは省略可能です。

:::note
`limit` を指定せずに `delimiter` を指定する場合、`delimiter` は最初のパラメータでなければなりません。`delimiter` と `limit` の両方を指定する場合、`delimiter` は `limit` より前に指定する必要があります。

また、パラメータと引数の両方で異なる区切り文字が指定されている場合、引数で指定された区切り文字のみが使用されます。
:::

**戻り値**

* カラムまたは式の連結された値から成る[文字列](../../../sql-reference/data-types/string.md)を返します。グループに要素が存在しない、または null 要素のみであり、かつ関数が「null のみ」の扱いを特別に指定していない場合、結果は null 値を持つ Nullable 型の文字列になります。

**例**

入力テーブル:

```text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1. デリミタを指定しない基本的な使い方:

クエリ：

```sql
SELECT groupConcat(Name) FROM Employees;
```

結果：

```text
JohnJaneBob
```

これは、区切り文字を使わずに、すべての名前を一続きの 1 つの文字列に連結します。

2. カンマを区切り文字として使用する方法:

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

3. 連結される要素の数の制限

クエリ:

```sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

結果：

```text
John, Jane
```

このクエリは、テーブルにそれ以上の名前があっても、出力を先頭2件の名前に制限します。
