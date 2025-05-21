---
description: 'Detachに関するドキュメント'
sidebar_label: 'DETACH'
sidebar_position: 43
slug: /sql-reference/statements/detach
title: 'DETACHステートメント'
---

サーバーがテーブル、マテリアライズドビュー、ディクショナリー、またはデータベースの存在を「忘れる」ようにします。

**構文**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

デタッチは、テーブル、マテリアライズドビュー、ディクショナリー、またはデータベースのデータやメタデータを削除しません。エンティティが `PERMANENTLY`デタッチされていない場合、次回サーバーが起動すると、サーバーはメタデータを読み込み、テーブル/ビュー/ディクショナリー/データベースを再認識します。エンティティが `PERMANENTLY`デタッチされている場合、自動的な再認識は行われません。

テーブル、ディクショナリー、またはデータベースが永久にデタッチされたかどうかにかかわらず、どちらの場合も、[ATTACH](../../sql-reference/statements/attach.md)クエリを使用して再アタッチできます。システムログテーブルも再アタッチできます（例：`query_log`、`text_log`など）。他のシステムテーブルは再アタッチできません。次回サーバーが起動すると、サーバーはそれらのテーブルを再認識します。

`ATTACH MATERIALIZED VIEW`は短縮構文（`SELECT`なし）では機能しませんが、`ATTACH TABLE`クエリを使用してアタッチできます。

すでにデタッチされているテーブルを永久にデタッチすることはできないことに注意してください（テンポラリ）。しかし、再アタッチしてから再度永久にデタッチすることは可能です。

また、デタッチされたテーブルを[DROP](../../sql-reference/statements/drop.md#drop-table)することや、同じ名前で永久にデタッチされたテーブルを[CREATE TABLE](../../sql-reference/statements/create/table.md)すること、または別のテーブルを[RENAME TABLE](../../sql-reference/statements/rename.md)クエリで置き換えることはできません。

`SYNC`修飾子は、遅延なしでアクションを実行します。

**例**

テーブルを作成する:

クエリ:

```sql
CREATE TABLE test ENGINE = Log AS SELECT * FROM numbers(10);
SELECT * FROM test;
```

結果:

```text
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

テーブルをデタッチする:

クエリ:

```sql
DETACH TABLE test;
SELECT * FROM test;
```

結果:

```text
Received exception from server (version 21.4.1):
Code: 60. DB::Exception: Received from localhost:9000. DB::Exception: Table default.test does not exist.
```

:::note
ClickHouse Cloudでは、ユーザーは`PERMANENTLY`句を使用する必要があります。例えば、`DETACH TABLE <table> PERMANENTLY`のように。この句を使用しない場合、クラスタの再起動時（例：アップグレード中）にテーブルは再アタッチされます。
:::

**関連項目**

- [マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)
- [ディクショナリー](../../sql-reference/dictionaries/index.md)
