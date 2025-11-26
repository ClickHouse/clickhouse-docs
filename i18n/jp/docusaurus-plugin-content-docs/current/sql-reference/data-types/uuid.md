---
description: 'ClickHouse における UUID データ型に関するドキュメント'
sidebar_label: 'UUID'
sidebar_position: 24
slug: /sql-reference/data-types/uuid
title: 'UUID'
doc_type: 'reference'
---



# UUID

Universally Unique Identifier (UUID、汎用一意識別子) は、レコードを識別するために使用される 16 バイトの値です。UUID の詳細については、[Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier) を参照してください。

異なる UUID バリアントが存在しますが（[こちら](https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis) を参照）、ClickHouse は挿入された UUID が特定のバリアントに準拠しているかどうかを検証しません。
UUID は内部的には 16 バイトのランダムなバイト列として扱われ、SQL レベルでは [8-4-4-4-12 表記](https://en.wikipedia.org/wiki/Universally_unique_identifier#Textual_representation) で表現されます。

UUID 値の例：

```text
61f0c404-5cb3-11e7-907b-a6006ad3dba0
```

デフォルトの UUID はすべて 0 です。これは、たとえば新しいレコードを挿入する際に、UUID 列の値が指定されていない場合などに使用されます。

```text
00000000-0000-0000-0000-000000000000
```

歴史的経緯により、UUID は後半部分によってソートされます。
したがって、UUID をテーブルの主キー、ソートキー、またはパーティションキーとして直接使用すべきではありません。

例:

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;
INSERT INTO tab SELECT generateUUIDv4() FROM numbers(50);
SELECT * FROM tab ORDER BY uuid;
```

結果：

```text
┌─uuid─────────────────────────────────┐
│ 36a0b67c-b74a-4640-803b-e44bb4547e3c │
│ 3a00aeb8-2605-4eec-8215-08c0ecb51112 │
│ 3fda7c49-282e-421a-85ab-c5684ef1d350 │
│ 16ab55a7-45f6-44a8-873c-7a0b44346b3e │
│ e3776711-6359-4f22-878d-bf290d052c85 │
│                [...]                 │
│ 9eceda2f-6946-40e3-b725-16f2709ca41a │
│ 03644f74-47ba-4020-b865-be5fd4c8c7ff │
│ ce3bc93d-ab19-4c74-b8cc-737cb9212099 │
│ b7ad6c91-23d6-4b5e-b8e4-a52297490b56 │
│ 06892f64-cc2d-45f3-bf86-f5c5af5768a9 │
└──────────────────────────────────────┘
```

回避策として、UUID を直感的に分かりやすい並び順を持つ型に変換できます。

UInt128 に変換する例:

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;
INSERT INTO tab SELECT generateUUIDv4() FROM numbers(50);
SELECT * FROM tab ORDER BY toUInt128(uuid);
```

結果：

```sql
┌─uuid─────────────────────────────────┐
│ 018b81cd-aca1-4e9c-9e56-a84a074dc1a8 │
│ 02380033-c96a-438e-913f-a2c67e341def │
│ 057cf435-7044-456a-893b-9183a4475cea │
│ 0a3c1d4c-f57d-44cc-8567-60cb0c46f76e │
│ 0c15bf1c-8633-4414-a084-7017eead9e41 │
│                [...]                 │
│ f808cf05-ea57-4e81-8add-29a195bde63d │
│ f859fb5d-764b-4a33-81e6-9e4239dae083 │
│ fb1b7e37-ab7b-421a-910b-80e60e2bf9eb │
│ fc3174ff-517b-49b5-bfe2-9b369a5c506d │
│ fece9bf6-3832-449a-b058-cd1d70a02c8b │
└──────────────────────────────────────┘
```


## UUID の生成 {#generating-uuids}

ClickHouse は、ランダムな UUID バージョン 4 の値を生成するための関数 [generateUUIDv4](../../sql-reference/functions/uuid-functions.md) を提供します。



## 使用例

**例 1**

この例では、UUID 列を持つテーブルを作成し、そのテーブルに値を挿入する方法を示します。

```sql
CREATE TABLE t_uuid (x UUID, y String) ENGINE=TinyLog

INSERT INTO t_uuid SELECT generateUUIDv4(), '例 1'

SELECT * FROM t_uuid
```

結果：

```text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ 例1 │
└──────────────────────────────────────┴───────────┘
```

**例 2**

この例では、レコード挿入時に UUID 列の値を指定しないため、つまりデフォルトの UUID 値が挿入されます。

```sql
INSERT INTO t_uuid (y) VALUES ('例2')

SELECT * FROM t_uuid
```

```text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ 例1 │
│ 00000000-0000-0000-0000-000000000000 │ 例2 │
└──────────────────────────────────────┴───────────┘
```


## 制限事項 {#restrictions}

`UUID` データ型は、[String](../../sql-reference/data-types/string.md) データ型がサポートする関数のみをサポートします（たとえば [min](/sql-reference/aggregate-functions/reference/min)、[max](/sql-reference/aggregate-functions/reference/max)、[count](/sql-reference/aggregate-functions/reference/count) など）。

`UUID` データ型は、[abs](/sql-reference/functions/arithmetic-functions#abs) などの算術演算や、[sum](/sql-reference/aggregate-functions/reference/sum)、[avg](/sql-reference/aggregate-functions/reference/avg) などの集約関数はサポートされません。
