---
slug: /sql-reference/statements/detach
sidebar_position: 43
sidebar_label: DETACH
title: "DETACHステートメント"
---

サーバーにテーブル、マテリアライズドビュー、辞書、またはデータベースの存在を「忘れさせる」ことができます。

**構文**

``` sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

デタッチすることは、テーブル、マテリアライズドビュー、辞書、またはデータベースのデータやメタデータを削除することはありません。もしエンティティが`PERMANENTLY`でデタッチされなかった場合、次回サーバーが起動した際に、サーバーはメタデータを読み取り、テーブル/ビュー/辞書/データベースを再び思い出します。もしエンティティが`PERMANENTLY`でデタッチされた場合、自動的に思い出すことはありません。

テーブル、辞書、またはデータベースが永久にデタッチされたかどうかにかかわらず、どちらの場合でも[ATTACH](../../sql-reference/statements/attach.md)クエリを使用して再アタッチすることができます。システムログテーブルも再アタッチ可能です（例: `query_log`、`text_log`など）。他のシステムテーブルは再アタッチできません。次回サーバーが起動した際に、サーバーはこれらのテーブルを再び思い出します。

`ATTACH MATERIALIZED VIEW`は簡短構文（`SELECT`なし）では機能しませんが、`ATTACH TABLE`クエリを使用してアタッチできます。

すでにデタッチされているテーブルを永久にデタッチすることはできませんが、再アタッチしてから再び永久にデタッチすることは可能です。

また、デタッチされたテーブルを[DROP](../../sql-reference/statements/drop.md#drop-table)することや、同じ名前で永久にデタッチされたテーブルを持つ[CREATE TABLE](../../sql-reference/statements/create/table.md)を作成すること、または他のテーブルと[RENAME TABLE](../../sql-reference/statements/rename.md)クエリで置き換えることはできません。

`SYNC`修飾子は、遅延なしでアクションを実行します。

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
ClickHouse Cloudでは、ユーザーは`PERMANENTLY`句を使用する必要があります。例えば、`DETACH TABLE <table> PERMANENTLY`のように。この句が使用されない場合、テーブルはクラスター再起動時（例: アップグレード中）に再アタッチされます。
:::

**関連情報**

- [マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)
- [辞書](../../sql-reference/dictionaries/index.md)
