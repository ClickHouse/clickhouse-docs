description: '文字列のグループから、区切り文字で分けられ、最大要素数で制限されるオプションを持つ連結文字列を計算します。'
sidebar_label: 'groupConcat'
sidebar_position: 363
slug: /sql-reference/aggregate-functions/reference/groupconcat
title: 'groupConcat'
```

文字列のグループから、区切り文字で分けられ、最大要素数で制限されるオプションを持つ連結文字列を計算します。

**構文**

```sql
groupConcat[(delimiter [, limit])](expression);
```

**引数**

- `expression` — 連結される文字列を出力する式またはカラム名。
- `delimiter` — 連結値を分けるために使用される [string](../../../sql-reference/data-types/string.md)。このパラメータはオプションで、指定されていない場合は空の文字列またはパラメータからの区切り文字がデフォルトになります。

**パラメータ**

- `delimiter` — 連結値を分けるために使用される [string](../../../sql-reference/data-types/string.md)。このパラメータはオプションで、指定されていない場合は空の文字列がデフォルトです。
- `limit` — 連結する最大要素数を指定する正の [integer](../../../sql-reference/data-types/int-uint.md)。要素数がこの数を超える場合は、超過した要素が無視されます。このパラメータはオプションです。

:::note
区切り文字が指定されている場合、制限は最初のパラメータでなければなりません。区切り文字と制限の両方が指定されている場合、区切り文字は制限の前でなければなりません。

また、異なる区切り文字がパラメータと引数として指定されている場合、引数からの区切り文字のみが使用されます。
:::

**返される値**

- 連結されたカラムまたは式の値からなる [string](../../../sql-reference/data-types/string.md) を返します。グループに要素がない場合や、すべての要素が NULL の場合、かつ関数が NULL 値のみの処理を指定していない場合、結果は NULL 値を持つ nullable string になります。

**例**

入力テーブル:

```text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1.    区切り文字なしの基本的な使用法:

クエリ:

```sql
SELECT groupConcat(Name) FROM Employees;
```

結果:

```text
JohnJaneBob
```

これは、区切り文字なしで全ての名前を一つの連続した文字列に連結します。


2. コンマを区切り文字として使用:

クエリ:

```sql
SELECT groupConcat(', ')(Name)  FROM Employees;
```

または

```sql
SELECT groupConcat(Name, ', ')  FROM Employees;
```

結果:

```text
John, Jane, Bob
```

この出力は、コンマとスペースで区切られた名前を表示します。


3. 連結される要素数を制限

クエリ:

```sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

結果:

```text
John, Jane
```

このクエリは、テーブルに他の名前が存在するにもかかわらず、出力を最初の二つの名前に制限します。
