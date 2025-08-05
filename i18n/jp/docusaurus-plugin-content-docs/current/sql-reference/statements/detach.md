---
description: 'Detach のドキュメント'
sidebar_label: 'DETACH'
sidebar_position: 43
slug: '/sql-reference/statements/detach'
title: 'DETACH ステートメント'
---



サーバーがテーブル、マテリアライズドビュー、辞書、またはデータベースの存在を「忘れ」させます。

**構文**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

デタッチは、テーブル、マテリアライズドビュー、辞書、またはデータベースのデータやメタデータを削除しません。エンティティが `PERMANENTLY` デタッチされていなければ、次回サーバーが起動するとメタデータを読み込み、テーブル/ビュー/辞書/データベースを再認識します。エンティティが `PERMANENTLY` デタッチされている場合、自動的な再認識はありません。

テーブル、辞書、データベースが永久にデタッチされたかどうかにかかわらず、いずれの場合も、[ATTACH](../../sql-reference/statements/attach.md) クエリを使用してそれらを再アタッチできます。システムログテーブルも再アタッチ可能です（例: `query_log`, `text_log` など）。他のシステムテーブルは再アタッチできません。次回サーバーが起動すると、それらのテーブルは再認識されます。

`ATTACH MATERIALIZED VIEW` は短い構文（`SELECT`なし）では機能しませんが、`ATTACH TABLE` クエリを使用してアタッチできます。

すでにデタッチされたテーブル（暫定的なもの）を永久にデタッチすることはできないことに注意してください。しかし、再アタッチしてから再度永久にデタッチすることは可能です。

また、デタッチされたテーブルを [DROP](../../sql-reference/statements/drop.md#drop-table) したり、同じ名前で永久にデタッチされたテーブルを [CREATE TABLE](../../sql-reference/statements/create/table.md) したり、[RENAME TABLE](../../sql-reference/statements/rename.md) クエリで他のテーブルと置き換えたりすることはできません。

`SYNC` 修飾子は、遅延なくアクションを実行します。

**例**

テーブルの作成:

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

テーブルのデタッチ:

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
ClickHouse Cloud では、ユーザーは `PERMANENTLY` 句を使用する必要があります。例えば `DETACH TABLE <table> PERMANENTLY` とします。この句を使用しない場合、テーブルはクラスター再起動中（例えば、アップグレード中）に再アタッチされます。
:::

**関連項目**

- [Materialized View](/sql-reference/statements/create/view#materialized-view)
- [Dictionaries](../../sql-reference/dictionaries/index.md)
