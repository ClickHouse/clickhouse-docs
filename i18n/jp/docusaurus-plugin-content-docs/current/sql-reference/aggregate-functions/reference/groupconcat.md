---
'description': 'Calculates a concatenated string from a group of strings, optionally
  separated by a delimiter, and optionally limited by a maximum number of elements.'
'sidebar_label': 'groupConcat'
'sidebar_position': 363
'slug': '/sql-reference/aggregate-functions/reference/groupconcat'
'title': 'groupConcat'
---



計算されるのは、一連の文字列からの連結された文字列で、オプションで区切り文字で区切られ、オプションで最大要素数で制限されます。

**構文**

```sql
groupConcat[(delimiter [, limit])](expression);
```

**引数**

- `expression` — 連結される文字列を出力する式またはカラム名。
- `delimiter` — 連結された値を区切るために使用される[文字列](../../../sql-reference/data-types/string.md)。このパラメータはオプションで、指定されていない場合はデフォルトで空の文字列またはパラメータからの区切り文字になります。

**パラメータ**

- `delimiter` — 連結された値を区切るために使用される[文字列](../../../sql-reference/data-types/string.md)。このパラメータはオプションで、指定されていない場合はデフォルトで空の文字列になります。
- `limit` — 連結する最大要素数を指定する正の[整数](../../../sql-reference/data-types/int-uint.md)。要素がそれ以上存在する場合、余分な要素は無視されます。このパラメータはオプションです。

:::note
区切り文字が指定されていて、制限が指定されていない場合、最初のパラメータでなければなりません。区切り文字と制限の両方が指定されている場合、区切り文字は制限の前に来なければなりません。

また、異なる区切り文字がパラメータと引数として指定されている場合、引数の区切り文字のみが使用されます。
:::

**返される値**

- カラムまたは式の連結された値からなる[string](../../../sql-reference/data-types/string.md)を返します。グループに要素がない場合や、すべての要素がnullの場合、かつ関数がnull値だけの処理を指定していない場合、結果はnull値を持つnullableな文字列になります。

**例**

入力テーブル:

```text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1. 区切りなしでの基本的な使用法：

クエリ:

```sql
SELECT groupConcat(Name) FROM Employees;
```

結果:

```text
JohnJaneBob
```

これは、すべての名前を区切りなしで1つの連続した文字列に連結します。


2. カンマを区切りとして使用：

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

この出力は、カンマとスペースで区切られた名前を示しています。


3. 連結する要素数を制限する

クエリ:

```sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

結果:

```text
John, Jane
```

このクエリは、テーブルに他の名前があっても、最初の2つの名前に出力を制限します。
