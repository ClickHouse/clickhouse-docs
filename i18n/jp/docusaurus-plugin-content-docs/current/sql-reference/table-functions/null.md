---
description: '指定された構造の一時テーブルを Null テーブルエンジンで作成します。この関数は、テストの作成やデモのための利便性を考慮して使用されます。'
sidebar_label: 'null 関数'
sidebar_position: 140
slug: /sql-reference/table-functions/null
title: 'null'
---


# null テーブル関数

指定された構造の一時テーブルを [Null](../../engines/table-engines/special/null.md) テーブルエンジンで作成します。`Null` エンジンの特性に従い、テーブルのデータは無視され、クエリの実行直後にテーブル自体はすぐに削除されます。この関数は、テストの作成やデモのための利便性を考慮して使用されます。

**構文**

```sql
null('structure')
```

**パラメータ**

- `structure` — カラムおよびカラムタイプのリスト。[String](../../sql-reference/data-types/string.md)。

**戻り値**

指定された構造の一時 `Null`エンジンテーブル。

**例**

`null` 関数を使ったクエリ:

```sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```
は、次の 3 つのクエリを置き換えることができます:

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```

参照:

- [Null テーブルエンジン](../../engines/table-engines/special/null.md)
