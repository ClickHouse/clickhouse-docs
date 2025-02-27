---
slug: /sql-reference/aggregate-functions/reference/groupconcat
sidebar_position: 363
sidebar_label: groupConcat
title: groupConcat
---

文字列のグループから連結された文字列を計算し、オプションで区切り文字で分割し、オプションで最大要素数で制限します。

**構文**

``` sql
groupConcat[(delimiter [, limit])](expression);
```

**引数**

- `expression` — 連結される文字列を出力する表現またはカラム名。
- `delimiter` — 連結された値を分割するために使用される[文字列](../../../sql-reference/data-types/string.md)。このパラメータはオプションで、指定されない場合は空の文字列またはパラメータからの区切り文字がデフォルトとなります。

**パラメータ**

- `delimiter` — 連結された値を分割するために使用される[文字列](../../../sql-reference/data-types/string.md)。このパラメータはオプションで、指定されない場合は空の文字列がデフォルトとなります。
- `limit` — 連結する最大要素数を指定する正の[整数](../../../sql-reference/data-types/int-uint.md)。要素がより多く存在する場合、余分な要素は無視されます。このパラメータはオプションです。

:::note
区切り文字が指定されている場合、制限は最初のパラメータでなければなりません。区切り文字と制限の両方が指定されている場合、区切り文字は制限の前に来る必要があります。

また、異なる区切り文字がパラメータと引数として指定されている場合、引数からの区切り文字のみが使用されます。
:::

**返される値**

- 連結されたカラムまたは表現の値からなる[string](../../../sql-reference/data-types/string.md)を返します。グループに要素がない場合や、null要素のみがある場合、関数がnull値のみの処理を指定していない場合、結果はnull値を持つnullable文字列です。

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

これは、すべての名前を区切りなしの連続した文字列に連結します。


2. カンマを区切り文字として使用する:

クエリ:

``` sql
SELECT groupConcat(', ')(Name) FROM Employees;
```

または

``` sql
SELECT groupConcat(Name, ', ') FROM Employees;
```

結果:

``` text
John, Jane, Bob
```

この出力は、カンマとスペースで区切られた名前を示します。


3. 連結される要素数を制限する

クエリ:

``` sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

結果:

``` text
John, Jane
```

このクエリは、テーブルに他の名前があっても最初の二つの名前に出力を制限します。
