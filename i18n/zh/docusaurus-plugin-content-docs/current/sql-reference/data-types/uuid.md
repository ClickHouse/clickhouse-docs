
# UUID

一个通用唯一识别码（UUID）是一个 16 字节的值，用于标识记录。有关 UUID 的详细信息，请参见 [Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier)。

虽然存在不同的 UUID 变体（请参见 [here](https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis)），但 ClickHouse 不会验证插入的 UUID 是否符合特定变体。UUID 在内部被视为一系列 16 个随机字节，在 SQL 级别上采用 [8-4-4-4-12 表示法](https://en.wikipedia.org/wiki/Universally_unique_identifier#Textual_representation)。

示例 UUID 值：

```text
61f0c404-5cb3-11e7-907b-a6006ad3dba0
```

默认的 UUID 是全零。这在例如插入新记录但未指定 UUID 列值时使用：

```text
00000000-0000-0000-0000-000000000000
```

由于历史原因，UUID 按其后半部分进行排序。因此，不应直接在表的主键、排序键或分区键中使用 UUID。

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

作为变通方法，可以将 UUID 转换为具有直观排序顺序的类型。

使用转换为 UInt128 的示例：

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

## 生成 UUID {#generating-uuids}

ClickHouse 提供了 [generateUUIDv4](../../sql-reference/functions/uuid-functions.md) 函数来生成随机的 UUID 版本 4 值。

## 使用示例 {#usage-example}

**示例 1**

此示例演示了创建一个具有 UUID 列的表，并向表中插入一个值。

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

在此示例中，插入记录时未指定 UUID 列值，即插入默认的 UUID 值：

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

UUID 数据类型仅支持 [String](../../sql-reference/data-types/string.md) 数据类型也支持的函数（例如， [min](/sql-reference/aggregate-functions/reference/min)、[max](/sql-reference/aggregate-functions/reference/max) 和 [count](/sql-reference/aggregate-functions/reference/count)）。

UUID 数据类型不支持算术运算（例如，[abs](/sql-reference/functions/arithmetic-functions#abs)）或聚合函数，例如 [sum](/sql-reference/aggregate-functions/reference/sum) 和 [avg](/sql-reference/aggregate-functions/reference/avg)。
