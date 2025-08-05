---
description: 'Creates a temporary table of the specified structure with the Null
  table engine. The function is used for the convenience of test writing and demonstrations.'
sidebar_label: 'null function'
sidebar_position: 140
slug: '/sql-reference/table-functions/null'
title: 'null'
---




# null テーブル関数

指定された構造の一時テーブルを [Null](../../engines/table-engines/special/null.md) テーブルエンジンで作成します。 `Null` エンジンの特性に従って、テーブルデータは無視され、クエリ実行後にテーブル自体は即座に削除されます。この関数は、テストの記述やデモの便宜のために使用されます。

## 構文 {#syntax}

```sql
null('structure')
```

## 引数 {#argument}

- `structure` — カラムとカラムタイプのリスト。 [String](../../sql-reference/data-types/string.md)。

## 戻り値 {#returned_value}

指定された構造を持つ一時 `Null` エンジンテーブル。

## 例 {#example}

`null` 関数を使用したクエリ:

```sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```
は、以下の3つのクエリを置き換えることができます:

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```

## 関連 {#related}

- [Null テーブルエンジン](../../engines/table-engines/special/null.md)
