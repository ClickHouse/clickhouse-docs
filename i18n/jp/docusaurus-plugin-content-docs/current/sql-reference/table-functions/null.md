---
description: '指定された構造を持つ一時テーブルを、Null テーブルエンジンで作成します。この関数はテストやデモを行う際の利便性のために使用されます。'
sidebar_label: 'null 関数'
sidebar_position: 140
slug: /sql-reference/table-functions/null
title: 'null'
doc_type: 'reference'
---

# null テーブル関数 \\{#null-table-function\\}

指定した構造を持つ一時テーブルを、[Null](../../engines/table-engines/special/null.md) テーブルエンジンで作成します。`Null` エンジンの特性に従い、テーブルのデータは破棄され、クエリの実行が完了すると同時にテーブル自体も即座に削除されます。この関数は、テストやデモンストレーション用のクエリを作成しやすくするために使用されます。

## 構文 \\{#syntax\\}

```sql
null('structure')
```

## 引数 \\{#argument\\}

- `structure` — 列とその型のリスト。[String](../../sql-reference/data-types/string.md)。

## 返される値 \\{#returned_value\\}

指定された構造を持つ一時的な `Null` エンジンのテーブル。

## 例 \\{#example\\}

`null` 関数を使用したクエリ：

```sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```

3つのクエリの代わりになります：

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```

## 関連項目 \\{#related\\}

- [Null テーブルエンジン](../../engines/table-engines/special/null.md)
