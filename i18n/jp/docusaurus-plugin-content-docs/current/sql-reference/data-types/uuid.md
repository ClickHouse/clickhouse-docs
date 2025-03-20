---
slug: '/sql-reference/data-types/uuid'
sidebar_position: 24
sidebar_label: 'UUID'
keywords: ['UUID', 'ClickHouse', 'データ型']
description: 'UUIDの詳細な情報と使用方法について説明します。'
---


# UUID

Universally Unique Identifier (UUID) は、レコードを識別するために使用される16バイトの値です。UUIDの詳細については、[Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier)を参照してください。

異なるUUIDのバリアントが存在します（[こちら](https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis)を参照）が、ClickHouseでは挿入されたUUIDが特定のバリアントに準拠しているかどうかの検証は行われません。UUIDは内部的に、SQLレベルで[8-4-4-4-12の表現](https://en.wikipedia.org/wiki/Universally_unique_identifier#Textual_representation)を持つ16バイトのランダムなバイト列として扱われます。

UUIDの例:

``` text
61f0c404-5cb3-11e7-907b-a6006ad3dba0
```

デフォルトのUUIDは全ゼロです。これは、新しいレコードが挿入される際に、UUIDカラムの値が指定されない場合などに使用されます。

``` text
00000000-0000-0000-0000-000000000000
```

歴史的な理由から、UUIDはその後半でソートされます。したがって、UUIDはテーブルの主キー、ソートキー、またはパーティションキーに直接使用すべきではありません。

例:

``` sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;
INSERT INTO tab SELECT generateUUIDv4() FROM numbers(50);
SELECT * FROM tab ORDER BY uuid;
```

結果:

``` text
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

回避策として、UUIDを直感的なソート順を持つ型に変換することができます。

UInt128への変換を使用した例:

``` sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;
INSERT INTO tab SELECT generateUUIDv4() FROM numbers(50);
SELECT * FROM tab ORDER BY toUInt128(uuid);
```

結果:

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

## UUIDの生成 {#generating-uuids}

ClickHouseは、ランダムなUUIDバージョン4の値を生成するために[generateUUIDv4](../../sql-reference/functions/uuid-functions.md)関数を提供しています。

## 使用例 {#usage-example}

**例 1**

この例では、UUIDカラムを持つテーブルの作成と、そのテーブルへの値の挿入を示します。

``` sql
CREATE TABLE t_uuid (x UUID, y String) ENGINE=TinyLog;

INSERT INTO t_uuid SELECT generateUUIDv4(), 'Example 1';

SELECT * FROM t_uuid;
```

結果:

``` text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ Example 1 │
└──────────────────────────────────────┴───────────┘
```

**例 2**

この例では、レコードが挿入される際にUUIDカラムの値が指定されておらず、デフォルトのUUID値が挿入されます。

``` sql
INSERT INTO t_uuid (y) VALUES ('Example 2');

SELECT * FROM t_uuid;
```

``` text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ Example 1 │
│ 00000000-0000-0000-0000-000000000000 │ Example 2 │
└──────────────────────────────────────┴───────────┘
```

## 制約 {#restrictions}

UUIDデータ型は、[String](../../sql-reference/data-types/string.md)データ型がサポートする関数（例えば、[min](/sql-reference/aggregate-functions/reference/min)、[max](/sql-reference/aggregate-functions/reference/max)、および[count](/sql-reference/aggregate-functions/reference/count)）のみをサポートします。

UUIDデータ型は、[abs](/sql-reference/functions/arithmetic-functions#abs)などの算術演算や、[sum](/sql-reference/aggregate-functions/reference/sum)および[avg](/sql-reference/aggregate-functions/reference/avg)などの集約関数をサポートしていません。
