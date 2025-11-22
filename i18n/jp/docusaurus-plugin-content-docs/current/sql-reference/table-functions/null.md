---
description: '指定された構造を持つ一時テーブルを Null テーブルエンジンを使用して作成します。この関数は、テストやデモンストレーションを記述しやすくするために使用されます。'
sidebar_label: 'null 関数'
sidebar_position: 140
slug: /sql-reference/table-functions/null
title: 'null'
doc_type: 'reference'
---



# null テーブル関数

指定された構造を持つ一時テーブルを、[Null](../../engines/table-engines/special/null.md) テーブルエンジンを使って作成します。`Null` エンジンの性質により、テーブルのデータは破棄され、クエリ実行直後にテーブル自体も即座に削除されます。この関数は、テストやデモの記述を簡便にするために使用されます。



## 構文 {#syntax}

```sql
null('structure')
```


## 引数 {#argument}

- `structure` — カラムとカラム型のリスト。[String](../../sql-reference/data-types/string.md)。


## 戻り値 {#returned_value}

指定された構造を持つ一時的な `Null` エンジンテーブル。


## 例 {#example}

`null`関数を使用したクエリ:

```sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```

は、次の3つのクエリを置き換えることができます:

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```


## 関連項目 {#related}

- [Nullテーブルエンジン](../../engines/table-engines/special/null.md)
