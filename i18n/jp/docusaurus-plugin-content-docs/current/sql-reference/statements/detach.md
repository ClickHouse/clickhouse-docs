---
description: 'DETACH のドキュメント'
sidebar_label: 'DETACH'
sidebar_position: 43
slug: /sql-reference/statements/detach
title: 'DETACH ステートメント'
doc_type: 'reference'
---

サーバーに、テーブル、マテリアライズドビュー、辞書、またはデータベースの存在を「忘れさせ」ます。

**構文**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

`DETACH` はテーブル、マテリアライズドビュー、ディクショナリ、データベースのデータやメタデータを削除しません。エンティティが `PERMANENTLY` を指定せずにデタッチされていた場合、次回サーバー起動時にサーバーはメタデータを読み込み、そのテーブル / ビュー / ディクショナリ / データベースを再度利用可能にします。エンティティが `PERMANENTLY` を指定してデタッチされていた場合、自動での再利用は行われません。

テーブル、ディクショナリ、データベースが永続的にデタッチされているかどうかにかかわらず、どちらの場合も [ATTACH](../../sql-reference/statements/attach.md) クエリを使用して再アタッチできます。
システムログテーブルも再アタッチできます（例: `query_log`, `text_log` など）。その他のシステムテーブルは再アタッチできませんが、次回サーバー起動時にサーバーがそれらのテーブルを再度利用可能にします。

`ATTACH MATERIALIZED VIEW` は短い構文（`SELECT` を伴わない形式）では動作しませんが、`ATTACH TABLE` クエリを使用してアタッチできます。

すでにデタッチされている（一時的にデタッチされた）テーブルを、永続的にデタッチすることはできない点に注意してください。ただし、一度アタッチし直した上で、再度永続的にデタッチすることは可能です。

また、デタッチされたテーブルを [DROP](../../sql-reference/statements/drop.md#drop-table) することはできません。さらに、永続的にデタッチされたテーブルと同じ名前で [CREATE TABLE](../../sql-reference/statements/create/table.md) を行ったり、[RENAME TABLE](../../sql-reference/statements/rename.md) クエリで別のテーブルに置き換えたりすることもできません。

`SYNC` 修飾子は、遅延なくアクションを実行します。

**例**

テーブルの作成:

クエリ:

```sql
CREATE TABLE test ENGINE = Log AS SELECT * FROM numbers(10);
SELECT * FROM test;
```

結果：

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
サーバーから例外を受信しました（バージョン 21.4.1）：
Code: 60. DB::Exception: localhost:9000 から受信しました。DB::Exception: テーブル default.test は存在しません。
```

:::note
ClickHouse Cloud では、ユーザーは `PERMANENTLY` 句（例: `DETACH TABLE <table> PERMANENTLY`）を使用することを推奨します。この句を使用しない場合、テーブルはクラスターの再起動時（例: アップグレード時）に自動的に再アタッチされます。
:::

**関連項目**

* [Materialized View](/sql-reference/statements/create/view#materialized-view)
* [Dictionaries](../../sql-reference/dictionaries/index.md)
