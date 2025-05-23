---
'slug': '/sql-reference/table-functions/generate_series'
'sidebar_position': 146
'sidebar_label': 'generate_series'
'title': 'generate_series (generateSeries)'
'description': 'start から stop までの整数を含む、単一の `generate_series` カラム (UInt64) を持つテーブルを返します。'
---




# generate_series テーブル関数

エイリアス: `generateSeries`

## 構文 {#syntax}

開始から終了までの整数を含む単一の 'generate_series' カラム (`UInt64`) を持つテーブルを返します:

```sql
generate_series(START, STOP)
```

値間の間隔が `STEP` によって与えられる、開始から終了までの整数を含む単一の 'generate_series' カラム (`UInt64`) を持つテーブルを返します:

```sql
generate_series(START, STOP, STEP)
```

## 例 {#examples}

以下のクエリは同じ内容のテーブルを返しますが、カラム名は異なります:

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

また、以下のクエリは同じ内容のテーブルを返しますが、カラム名は異なります（ただし、2 番目のオプションの方が効率的です）:

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);

