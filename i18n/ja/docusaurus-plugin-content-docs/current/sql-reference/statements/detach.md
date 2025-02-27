---
slug: /sql-reference/statements/detach
sidebar_position: 43
sidebar_label: DETACH
title: "DETACH ステートメント"
---

サーバーに対して、テーブル、マテリアライズドビュー、辞書、またはデータベースの存在を「忘れさせる」ことができます。

**構文**

``` sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

デタッチは、テーブル、マテリアライズドビュー、辞書、またはデータベースのデータやメタデータを削除しません。もしエンティティが `PERMANENTLY` デタッチされていない場合、次回サーバーが起動すると、サーバーはメタデータを読み取り、テーブル/ビュー/辞書/データベースを再度呼び出します。エンティティが `PERMANENTLY` デタッチされた場合、自動的な呼び出しは行われません。

テーブル、辞書、またはデータベースが永久にデタッチされたかどうかにかかわらず、両方のケースで [ATTACH](../../sql-reference/statements/attach.md) クエリを使用して再接続できます。システムログテーブルも再接続できます（例: `query_log`, `text_log`, など）。他のシステムテーブルは再接続できません。次回サーバーが起動すると、サーバーはそれらのテーブルを再度呼び出します。

`ATTACH MATERIALIZED VIEW` は短い構文（`SELECT`なし）では機能しませんが、`ATTACH TABLE` クエリを使用して接続できます。

すでにデタッチされている（テンポラリ）テーブルを永久にデタッチすることはできませんが、再度接続してから再度永久にデタッチすることはできます。

また、デタッチされたテーブルを [DROP](../../sql-reference/statements/drop.md#drop-table) したり、同じ名前のテーブルを永久にデタッチして [CREATE TABLE](../../sql-reference/statements/create/table.md) で作成したり、[RENAME TABLE](../../sql-reference/statements/rename.md) クエリで他のテーブルに置き換えたりすることはできません。

`SYNC` 修飾子は、遅延なしでアクションを実行します。

**例**

テーブルの作成:

クエリ:

``` sql
CREATE TABLE test ENGINE = Log AS SELECT * FROM numbers(10);
SELECT * FROM test;
```

結果:

``` text
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘
```

テーブルのデタッチ:

クエリ:

``` sql
DETACH TABLE test;
SELECT * FROM test;
```

結果:

``` text
Received exception from server (version 21.4.1):
Code: 60. DB::Exception: Received from localhost:9000. DB::Exception: Table default.test does not exist.
```

:::note
ClickHouse Cloud では、ユーザーは `PERMANENTLY` 句を使用する必要があります（例: `DETACH TABLE <table> PERMANENTLY`）。この句が使用されない場合、クラスタの再起動時（例: アップグレード中）にテーブルは再接続されます。
:::

**関連項目**

- [マテリアライズドビュー](../../sql-reference/statements/create/view.md#materialized)
- [辞書](../../sql-reference/dictionaries/index.md)
