---
description: 'ClickHouse における UUID データ型に関するドキュメント'
sidebar_label: 'UUID'
sidebar_position: 24
slug: /sql-reference/data-types/uuid
title: 'UUID'
doc_type: 'reference'
---

# UUID \{#uuid\}

Universally Unique Identifier (UUID、汎用一意識別子) は、レコードを識別するために使用される 16 バイトの値です。UUID の詳細については、[Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier) を参照してください。

UUIDv4 や UUIDv7 など、異なる UUID バリアントが存在しますが ([こちら](https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis) を参照) 、ClickHouse は挿入された UUID が特定のバリアントに準拠しているかどうかを検証しません。
UUID は内部的には 16 バイトのランダムなバイト列として扱われ、SQL レベルでは [8-4-4-4-12 表記](https://en.wikipedia.org/wiki/Universally_unique_identifier#Textual_representation) で表現されます。

UUID 値の例：

```text
61f0c404-5cb3-11e7-907b-a6006ad3dba0
```

デフォルトの UUID はすべて 0 です。これは、たとえば新しいレコードを挿入する際に、UUID カラムの値が指定されていない場合などに使用されます。

```text
00000000-0000-0000-0000-000000000000
```

:::warning
歴史的経緯により、UUID は後半部分によってソートされます。

これは UUIDv4 の値については問題ありませんが、主キー索引の定義に UUIDv7 カラムを使用する場合にはパフォーマンスが低下する可能性があります (ソートキーやパーティションキーでの使用は問題ありません) 。
より具体的には、UUIDv7 の値は前半がタイムスタンプ、後半がカウンタで構成されます。
したがって、スパースな主キー索引 (すなわち、各インデックスグラニュールの先頭の値) における UUIDv7 のソートはカウンタフィールドに基づくものになります。
UUID が前半 (タイムスタンプ) でソートされていると仮定した場合、クエリの先頭に行われる主キー索引の解析ステップでは、1 つのパーツを除くすべてのパーツで全マークを刈り込むことが期待されます。
しかし、後半 (カウンタ) によるソートでは、すべてのパーツから少なくとも 1 つのマークが返されることになり、不要なディスクアクセスにつながります。
:::

例:

```sql
CREATE TABLE tab (uuid UUID) ENGINE = MergeTree PRIMARY KEY (uuid);

INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
SELECT * FROM tab;
```

結果：

```text
┌─uuid─────────────────────────────────┐
│ 019d2555-7874-7e9d-a284-9b45a0b2f165 │
│ 019d2555-7874-7e9d-a284-9b46c3353be7 │
│ 019d2555-7878-77fc-a36f-4081aa58ec2b │
│ 019d2555-7878-77fc-a36f-40826555fb9b │
│ 019d2555-7870-7432-ba62-5250ac595328 │
│ 019d2555-7870-7432-ba62-5251da22bd19 │
│ 019d2555-786c-73e9-a031-4a7936df7d56 │
│ 019d2555-786c-73e9-a031-4a7a35a9544f │
│ 019d2555-7868-7333-89d1-2bd1639899c3 │
│ 019d2555-7868-7333-89d1-2bd297eb7d42 │
└──────────────────────────────────────┘

```

回避策として、UUID を後半部分から抽出したタイムスタンプに変換できます。

```sql
CREATE TABLE tab (uuid UUID) ENGINE = MergeTree PRIMARY KEY (UUIDv7ToDateTime(uuid));
-- Or alternatively:                      [...] PRIMARY KEY (toStartOfHour(UUIDv7ToDateTime(uuid)));

INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
SELECT * FROM tab;
```

結果 (同じデータを挿入したと仮定した場合) ：


```text
┌─uuid─────────────────────────────────┐
│ 019d2555-7868-7333-89d1-2bd1639899c3 │
│ 019d2555-7868-7333-89d1-2bd297eb7d42 │
│ 019d2555-786c-73e9-a031-4a7936df7d56 │
│ 019d2555-786c-73e9-a031-4a7a35a9544f │
│ 019d2555-7870-7432-ba62-5250ac595328 │
│ 019d2555-7870-7432-ba62-5251da22bd19 │
│ 019d2555-7874-7e9d-a284-9b45a0b2f165 │
│ 019d2555-7874-7e9d-a284-9b46c3353be7 │
│ 019d2555-7878-77fc-a36f-4081aa58ec2b │
│ 019d2555-7878-77fc-a36f-40826555fb9b │
└──────────────────────────────────────┘

```

ORDER BY (UUIDv7ToDateTime(uuid), uuid)


## UUID の生成 \{#generating-uuids\}

ClickHouse は、ランダムな UUID バージョン 4 の値を生成するための関数 [generateUUIDv4](../../sql-reference/functions/uuid-functions.md) を提供します。

## 使用例 \{#usage-example\}

**例 1**

この例では、UUID カラムを持つテーブルを作成し、そのテーブルに値を挿入する方法を示します。

```sql
CREATE TABLE t_uuid (x UUID, y String) ENGINE=TinyLog

INSERT INTO t_uuid SELECT generateUUIDv4(), 'Example 1'

SELECT * FROM t_uuid
```

結果：

```text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ Example 1 │
└──────────────────────────────────────┴───────────┘
```

**例 2**

この例では、レコード挿入時に UUID 列の値を指定しないため、つまりデフォルトの UUID 値が挿入されます。

```sql
INSERT INTO t_uuid (y) VALUES ('Example 2')

SELECT * FROM t_uuid
```

```text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ Example 1 │
│ 00000000-0000-0000-0000-000000000000 │ Example 2 │
└──────────────────────────────────────┴───────────┘
```


## 制限事項 \{#restrictions\}

`UUID` データ型は、[String](../../sql-reference/data-types/string.md) データ型がサポートする関数のみをサポートします（たとえば [min](/sql-reference/aggregate-functions/reference/min)、[max](/sql-reference/aggregate-functions/reference/max)、[count](/sql-reference/aggregate-functions/reference/count) など）。

`UUID` データ型は、[abs](/sql-reference/functions/arithmetic-functions#abs) などの算術演算や、[sum](/sql-reference/aggregate-functions/reference/sum)、[avg](/sql-reference/aggregate-functions/reference/avg) などの集約関数はサポートされません。