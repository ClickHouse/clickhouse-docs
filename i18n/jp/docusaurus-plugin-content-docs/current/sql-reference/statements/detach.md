---
description: 'DETACH に関するドキュメント'
sidebar_label: 'DETACH'
sidebar_position: 43
slug: /sql-reference/statements/detach
title: 'DETACH ステートメント'
doc_type: 'reference'
---

サーバーにテーブル、マテリアライズドビュー、ディクショナリ、またはデータベースの存在を「忘れさせ」ます。

**構文**

```sql
テーブル|ビュー|ディクショナリ|データベースを切り離す（DETACH） [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

テーブル、マテリアライズドビュー、ディクショナリ、データベースをデタッチしても、そのデータやメタデータは削除されません。エンティティを `PERMANENTLY` を付けずにデタッチした場合、次回のサーバー起動時にサーバーはメタデータを読み込み、テーブル/ビュー/ディクショナリ/データベースを再び認識します。エンティティを `PERMANENTLY` を付けてデタッチした場合、自動的に再認識されることはありません。

テーブル、ディクショナリ、データベースが永続的にデタッチされているかどうかに関わらず、どちらの場合でも [ATTACH](../../sql-reference/statements/attach.md) クエリを使用して再アタッチできます。
`query_log`、`text_log` などのシステムログテーブルも再アタッチできます。他のシステムテーブルは再アタッチできません。次回のサーバー起動時にサーバーがそれらのテーブルを再び認識します。

`ATTACH MATERIALIZED VIEW` は短い構文（`SELECT` なし）では動作しませんが、`ATTACH TABLE` クエリを使用してアタッチできます。

すでに（一時的に）デタッチされているテーブルを永続的にデタッチすることはできません。ただし、いったんアタッチし直してから再度永続的にデタッチすることはできます。

また、デタッチされたテーブルを [DROP](../../sql-reference/statements/drop.md#drop-table) したり、永続的にデタッチされたものと同じ名前で [CREATE TABLE](../../sql-reference/statements/create/table.md) したり、[RENAME TABLE](../../sql-reference/statements/rename.md) クエリで別のテーブルに置き換えたりすることはできません。

`SYNC` 修飾子は、遅延なしでアクションを実行します。

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

テーブルの切り離し:

クエリ:

```sql
DETACH TABLE test;
SELECT * FROM test;
```

結果：

```text
サーバー (バージョン 21.4.1) から例外を受信しました:
コード: 60. DB::Exception: localhost:9000 から受信しました。DB::Exception: テーブル default.test は存在しません。
```

:::note
ClickHouse Cloud では、`PERMANENTLY` 句（例: `DETACH TABLE &lt;table&gt; PERMANENTLY`）を使用する必要があります。この句を指定しないと、テーブルはクラスターの再起動時（アップグレード時など）に自動的に再アタッチされます。
:::

**関連項目**

* [マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)
* [Dictionaries](../../sql-reference/dictionaries/index.md)
