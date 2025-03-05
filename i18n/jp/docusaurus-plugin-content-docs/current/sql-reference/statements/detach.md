---
slug: /sql-reference/statements/detach
sidebar_position: 43
sidebar_label: DETACH
title: "DETACH文"
---

サーバーにテーブル、マテリアライズドビュー、辞書、またはデータベースの存在を「忘れさせる」機能です。

**構文**

``` sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

DETACHは、テーブル、マテリアライズドビュー、辞書、またはデータベースのデータやメタデータを削除しません。エンティティが`PERMANENTLY`でデタッチされていない場合、次回サーバーが起動すると、そのサーバーはメタデータを読み取り、テーブル/ビュー/辞書/データベースを再呼び出します。エンティティが`PERMANENTLY`デタッチされている場合、自動的な呼び出しは行われません。

テーブル、辞書、データベースが永久にデタッチされたかどうかにかかわらず、いずれの場合でも、[ATTACH](../../sql-reference/statements/attach.md)クエリを使用して再接続できます。システムログテーブル（例：`query_log`、`text_log`など）も再接続が可能です。他のシステムテーブルは再接続できません。次回サーバーが起動すると、サーバーはこれらのテーブルを再び呼び出します。

`ATTACH MATERIALIZED VIEW`はショート構文（`SELECT`なし）では機能しませんが、`ATTACH TABLE`クエリを使用して接続できます。

すでに一時的にデタッチされたテーブルを永久にデタッチすることはできませんが、再接続してから再度永久にデタッチすることは可能です。

また、デタッチされたテーブルを[DROP](../../sql-reference/statements/drop.md#drop-table)することや、同名のテーブルを永久にデタッチした状態で[CREATE TABLE](../../sql-reference/statements/create/table.md)すること、あるいは[RENAME TABLE](../../sql-reference/statements/rename.md)クエリを使用して他のテーブルに置き換えることもできません。

`SYNC`修飾子は、遅延なしでアクションを実行します。

**例**

テーブルの作成：

クエリ：

``` sql
CREATE TABLE test ENGINE = Log AS SELECT * FROM numbers(10);
SELECT * FROM test;
```

結果：

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

テーブルのデタッチ：

クエリ：

``` sql
DETACH TABLE test;
SELECT * FROM test;
```

結果：

``` text
サーバーから例外を受信しました (バージョン 21.4.1):
コード: 60. DB::Exception: localhost:9000 から受信しました。DB::Exception: テーブル default.test は存在しません。
```

:::note
ClickHouse Cloudでは、ユーザーは`PERMANENTLY`句を使用する必要があります。例えば、`DETACH TABLE <table> PERMANENTLY`。この句が使用されない場合、テーブルはクラスターの再起動時（例：アップグレード中）に再接続されます。
:::

**関連項目**

- [マテリアライズドビュー](../../sql-reference/statements/create/view.md#materialized)
- [辞書](../../sql-reference/dictionaries/index.md)
