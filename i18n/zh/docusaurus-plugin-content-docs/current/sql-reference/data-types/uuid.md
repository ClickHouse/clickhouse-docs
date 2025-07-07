---
'description': 'Documentation for UUID 数据类型 in ClickHouse'
'sidebar_label': 'UUID'
'sidebar_position': 24
'slug': '/sql-reference/data-types/uuid'
'title': 'UUID'
---


# UUID

一个通用唯一标识符（UUID）是一个用于标识记录的16字节值。有关UUID的详细信息，请参见 [Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier)。

虽然存在不同的UUID变体（请参见 [这里](https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis)），但ClickHouse并不验证插入的UUID是否符合特定的变体。
UUID在内部被视为具有[8-4-4-4-12表示法](https://en.wikipedia.org/wiki/Universally_unique_identifier#Textual_representation)的16个随机字节序列，在SQL级别进行处理。

示例UUID值：

```text
61f0c404-5cb3-11e7-907b-a6006ad3dba0
```

默认的UUID是全零。它在插入新记录但未指定UUID列值时使用，例如：

```text
00000000-0000-0000-0000-000000000000
```

由于历史原因，UUID按其后半部分进行排序。
因此，UUID不应直接用于表的主键、排序键或分区键中。

示例：

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;
INSERT INTO tab SELECT generateUUIDv4() FROM numbers(50);
SELECT * FROM tab ORDER BY uuid;
```

结果：

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

作为替代方案，可以将UUID转换为具有直观排序顺序的类型。

使用转换为UInt128的示例：

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;
INSERT INTO tab SELECT generateUUIDv4() FROM numbers(50);
SELECT * FROM tab ORDER BY toUInt128(uuid);
```

结果：

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

## 生成UUID {#generating-uuids}

ClickHouse提供了 [generateUUIDv4](../../sql-reference/functions/uuid-functions.md) 函数，用于生成随机的UUID版本4值。

## 使用示例 {#usage-example}

**示例 1**

此示例演示了创建一个带有UUID列的表并向该表插入值。

```sql
CREATE TABLE t_uuid (x UUID, y String) ENGINE=TinyLog

INSERT INTO t_uuid SELECT generateUUIDv4(), 'Example 1'

SELECT * FROM t_uuid
```

结果：

```text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ Example 1 │
└──────────────────────────────────────┴───────────┘
```

**示例 2**

在这个示例中，当记录被插入时，没有指定UUID列的值，即插入默认的UUID值：

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

## 限制 {#restrictions}

UUID数据类型仅支持[字符串](../../sql-reference/data-types/string.md)数据类型也支持的函数（例如，[min](/sql-reference/aggregate-functions/reference/min)、[max](/sql-reference/aggregate-functions/reference/max)和[count](/sql-reference/aggregate-functions/reference/count)）。

UUID数据类型不支持算术操作（例如，[abs](/sql-reference/functions/arithmetic-functions#abs)）或聚合函数，如[sum](/sql-reference/aggregate-functions/reference/sum)和[avg](/sql-reference/aggregate-functions/reference/avg)。
