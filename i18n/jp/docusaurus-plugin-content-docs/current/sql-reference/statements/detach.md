---
'description': 'DETACHに関するドキュメント'
'sidebar_label': 'DETACH'
'sidebar_position': 43
'slug': '/sql-reference/statements/detach'
'title': 'DETACH ステートメント'
'doc_type': 'reference'
---

サーバーがテーブル、マテリアライズドビュー、ディクショナリー、またはデータベースの存在を「忘れる」ようにします。

**構文**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

デタッチは、テーブル、マテリアライズドビュー、ディクショナリー、またはデータベースのデータやメタデータを削除するものではありません。エンティティが `PERMANENTLY` デタッチされていない場合、次回サーバーが起動した際に、サーバーはメタデータを読み込み、テーブル/ビュー/ディクショナリー/データベースを再認識します。エンティティが `PERMANENTLY` デタッチされている場合、自動的に再認識されることはありません。

テーブル、ディクショナリー、またはデータベースが永久にデタッチされたかどうかに関係なく、どちらの場合も [ATTACH](../../sql-reference/statements/attach.md) クエリを使用して再アタッチすることができます。システムログテーブルも再アタッチ可能です（例：`query_log`、`text_log` など）。他のシステムテーブルは再アタッチできません。次回サーバーが起動した際、サーバーはそれらのテーブルを再び認識します。

`ATTACH MATERIALIZED VIEW` は短い構文（`SELECT`なし）では機能しませんが、`ATTACH TABLE` クエリを使用してアタッチできます。

すでにデタッチ（テンポラリ）されているテーブルは永久にデタッチすることはできないことに注意してください。しかし、それを再アタッチし、その後再び永久にデタッチすることはできます。

また、デタッチされたテーブルを [DROP](../../sql-reference/statements/drop.md#drop-table) することや、永久にデタッチされたことと同じ名前で [CREATE TABLE](../../sql-reference/statements/create/table.md) すること、または [RENAME TABLE](../../sql-reference/statements/rename.md) クエリを使用して別のテーブルに置き換えることはできません。

`SYNC` 修飾子は、遅延なくアクションを実行します。

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
ClickHouse Cloud では、ユーザーは `PERMANENTLY` 句を使用する必要があります。例: `DETACH TABLE <table> PERMANENTLY`。この句を使用しない場合、クラスターの再起動（例: アップグレード中）時にテーブルが再アタッチされます。
:::

**参照**

- [マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)
- [ディクショナリー](../../sql-reference/dictionaries/index.md)
