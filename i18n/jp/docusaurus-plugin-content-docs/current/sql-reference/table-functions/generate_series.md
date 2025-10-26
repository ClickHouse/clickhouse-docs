---
'slug': '/sql-reference/table-functions/generate_series'
'sidebar_position': 146
'sidebar_label': 'generate_series'
'title': 'generate_series (generateSeries)'
'description': '開始から停止までの整数を含む単一の `generate_series` カラム (UInt64) を持つテーブルを返します。'
'doc_type': 'reference'
---


# generate_series テーブル関数

エイリアス: `generateSeries`

## 構文 {#syntax}

開始から停止までの整数を含む単一の 'generate_series' カラム (`UInt64`) を持つテーブルを返します:

```sql
generate_series(START, STOP)
```

値の間隔は `STEP` によって指定される、開始から停止までの整数を含む単一の 'generate_series' カラム (`UInt64`) を持つテーブルを返します:

```sql
generate_series(START, STOP, STEP)
```

## 例 {#examples}

以下のクエリは同じ内容を持つが異なるカラム名のテーブルを返します:

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

次のクエリは同じ内容を持つが異なるカラム名のテーブルを返します（ただし、2番目のオプションの方が効率的です）:

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
