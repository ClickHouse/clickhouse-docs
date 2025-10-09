---
'description': '文字列のグループから、区切り文字でオプション的に区切られ、要素の最大数でオプション的に制限された連結された文字列を計算します。'
'sidebar_label': 'groupConcat'
'sidebar_position': 363
'slug': '/sql-reference/aggregate-functions/reference/groupconcat'
'title': 'groupConcat'
'doc_type': 'reference'
---

文字列のグループから連結された文字列を計算し、オプションで区切り文字で区切ることができ、オプションで最大要素数によって制限することができます。

**構文**

```sql
groupConcat[(delimiter [, limit])](expression);
```

エイリアス: `group_concat`

**引数**

- `expression` — 連結する文字列を出力する式またはカラム名。
- `delimiter` — 連結された値を区切るために使用される[文字列](../../../sql-reference/data-types/string.md)。このパラメータはオプションで、指定されていない場合は空の文字列またはパラメータからの区切り文字がデフォルトとなります。

**パラメータ**

- `delimiter` — 連結された値を区切るために使用される[文字列](../../../sql-reference/data-types/string.md)。このパラメータはオプションで、指定されていない場合は空の文字列がデフォルトとなります。
- `limit` — 連結する最大要素数を指定する正の[整数](../../../sql-reference/data-types/int-uint.md)。要素がそれ以上存在する場合は、余分な要素は無視されます。このパラメータはオプションです。

:::note
区切り文字が指定されている場合、制限なしでは最初のパラメータである必要があります。区切り文字と制限が両方指定されている場合は、区切り文字が制限の前に来る必要があります。

また、異なる区切り文字がパラメータと引数として指定された場合、引数からの区切り文字のみが使用されます。
:::

**返される値**

- カラムまたは式の連結された値から構成される[string](../../../sql-reference/data-types/string.md)を返します。グループに要素がない場合やnull要素のみが含まれている場合、かつ関数がnull値のみの処理を指定していない場合、結果はnull値を持つnullableな文字列になります。

**例**

入力テーブル:

```text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1. 区切り文字なしの基本的な使用法:

クエリ:

```sql
SELECT groupConcat(Name) FROM Employees;
```

結果:

```text
JohnJaneBob
```

これはすべての名前を区切りなしの連続した文字列に連結します。

2. カンマを区切り文字として使用:

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

この出力は、カンマとその後にスペースで区切られた名前を示します。

3. 連結される要素の数を制限

クエリ:

```sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

結果:

```text
John, Jane
```

このクエリは、テーブルに他の名前があっても最初の2つの名前に出力を制限します。
