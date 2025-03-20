---
slug: /sql-reference/table-functions/null
sidebar_position: 140
sidebar_label: null 関数
title: 'null'
description: "指定された構造の一時テーブルを Null テーブルエンジンで作成します。この関数は、テストの記述やデモンストレーションの便宜のために使用されます。"
---


# null テーブル関数

指定された構造の一時テーブルを [Null](../../engines/table-engines/special/null.md) テーブルエンジンで作成します。 `Null`エンジンのプロパティに従って、テーブルのデータは無視され、クエリ実行後すぐにテーブル自体が削除されます。この関数は、テストの記述やデモンストレーションの便宜のために使用されます。

**構文**

``` sql
null('structure')
```

**パラメータ**

- `structure` — カラムとカラムタイプのリスト。 [String](../../sql-reference/data-types/string.md)。

**返される値**

指定された構造の一時 `Null`エンジンテーブル。

**例**

`null` 関数を使ったクエリ：

``` sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```
は、以下の三つのクエリを置き換えることができます：

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```

関連情報:

- [Null テーブルエンジン](../../engines/table-engines/special/null.md)
