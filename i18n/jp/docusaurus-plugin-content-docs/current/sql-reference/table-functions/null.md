---
'description': '指定された構造の一時テーブルを Null テーブルエンジンで作成します。この関数は、テストの記述やデモの便利さのために使用されます。'
'sidebar_label': 'null 関数'
'sidebar_position': 140
'slug': '/sql-reference/table-functions/null'
'title': 'null'
'doc_type': 'reference'
---


# null テーブル関数

指定された構造の一時テーブルを [Null](../../engines/table-engines/special/null.md) テーブルエンジンで作成します。`Null` エンジンのプロパティに従って、テーブルのデータは無視され、クエリ実行後にテーブル自体は即座に削除されます。この関数は、テストの作成やデモンストレーションの利便性を高めるために使用されます。

## 構文 {#syntax}

```sql
null('structure')
```

## 引数 {#argument}

- `structure` — カラムとカラムタイプのリスト。 [String](../../sql-reference/data-types/string.md)。

## 戻り値 {#returned_value}

指定された構造の一時 `Null` エンジンテーブル。

## 例 {#example}

`null` 関数を使用したクエリ：

```sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```
は3つのクエリを置き換えることができます：

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```

## 関連 {#related}

- [Null テーブルエンジン](../../engines/table-engines/special/null.md)
