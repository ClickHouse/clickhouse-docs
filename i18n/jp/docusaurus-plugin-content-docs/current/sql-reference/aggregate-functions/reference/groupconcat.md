---
slug: /sql-reference/aggregate-functions/reference/groupconcat
sidebar_position: 363
sidebar_label: groupConcat
title: "groupConcat"
description: "文字列のグループから連結された文字列を計算し、オプションで区切り文字を使用し、オプションで最大要素数で制限します。"
---

文字列のグループから連結された文字列を計算し、オプションで区切り文字を使用し、オプションで最大要素数で制限します。

**構文**

``` sql
groupConcat[(delimiter [, limit])](expression);
```

**引数**

- `expression` — 連結する文字列を出力する式またはカラム名。
- `delimiter` — 連結された値を区切るために使用される [string](../../../sql-reference/data-types/string.md)。このパラメータはオプションで、指定されていない場合は空文字列またはパラメータからの区切り文字がデフォルトとなります。


**パラメータ**

- `delimiter` — 連結された値を区切るために使用される [string](../../../sql-reference/data-types/string.md)。このパラメータはオプションで、指定されていない場合は空文字列がデフォルトとなります。
- `limit` — 連結する要素の最大数を指定する正の [integer](../../../sql-reference/data-types/int-uint.md)。要素がより多く存在する場合、余分な要素は無視されます。このパラメータはオプションです。

:::note
区切り文字が指定されているが制限がない場合、最初のパラメータである必要があります。区切り文字と制限の両方が指定されている場合、区切り文字は制限の前に来る必要があります。

また、異なる区切り文字がパラメータおよび引数として指定されている場合、引数からの区切り文字のみが使用されます。
:::

**返される値**

- 連結されたカラムまたは表現の値から構成される [string](../../../sql-reference/data-types/string.md) を返します。グループに要素がない場合、またはすべての要素が null の場合、関数が null 値のみの取り扱いを指定していない場合、結果は null 値を持つ Nullable な文字列になります。

**例**

入力テーブル:

``` text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1. 区切り文字なしの基本的な使用法:

クエリ:

``` sql
SELECT groupConcat(Name) FROM Employees;
```

結果:

``` text
JohnJaneBob
```

これは、区切りなしで全ての名前を1つの連続した文字列に連結します。


2. カンマを区切り文字として使用:

クエリ:

``` sql
SELECT groupConcat(', ')(Name)  FROM Employees;
```

または

``` sql
SELECT groupConcat(Name, ', ')  FROM Employees;
```

結果:

``` text
John, Jane, Bob
```

この出力は、カンマとスペースで区切られた名前を表示します。


3. 連結する要素数の制限

クエリ:

``` sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

結果:

``` text
John, Jane
```

このクエリは、テーブルにさらに名前があるにもかかわらず、出力を最初の二つの名前に制限します。
