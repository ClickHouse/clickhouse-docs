---
'description': '与 ULID 一起使用的函数的文档'
'sidebar_label': 'ULID'
'sidebar_position': 190
'slug': '/sql-reference/functions/ulid-functions'
'title': '与 ULID 一起使用的函数'
---


# 与 ULID 相关的函数

## generateULID {#generateulid}

生成 [ULID](https://github.com/ulid/spec)。

**语法**

```sql
generateULID([x])
```

**参数**

- `x` — [表达式](/sql-reference/syntax#expressions)，结果为任意 [支持的数据类型](/sql-reference/data-types)。结果值会被丢弃，但表达式本身用于绕过 [常见子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)，如果函数在一个查询中被多次调用。可选参数。

**返回值**

返回 [FixedString](../data-types/fixedstring.md) 类型的值。

**使用示例**

```sql
SELECT generateULID()
```

```text
┌─generateULID()─────────────┐
│ 01GNB2S2FGN2P93QPXDNB4EN2R │
└────────────────────────────┘
```

**如果需要在一行中生成多个值的使用示例**

```sql
SELECT generateULID(1), generateULID(2)
```

```text
┌─generateULID(1)────────────┬─generateULID(2)────────────┐
│ 01GNB2SGG4RHKVNT9ZGA4FFMNP │ 01GNB2SGG4V0HMQVH4VBVPSSRB │
└────────────────────────────┴────────────────────────────┘
```

## ULIDStringToDateTime {#ulidstringtodatetime}

该函数从 ULID 中提取时间戳。

**语法**

```sql
ULIDStringToDateTime(ulid[, timezone])
```

**参数**

- `ulid` — 输入的 ULID。 [字符串](../data-types/string.md) 或 [FixedString(26)](../data-types/fixedstring.md)。
- `timezone` — 返回值的 [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。 [字符串](../data-types/string.md)。

**返回值**

- 精确到毫秒的时间戳。 [DateTime64(3)](../data-types/datetime64.md)。

**使用示例**

```sql
SELECT ULIDStringToDateTime('01GNB2S2FGN2P93QPXDNB4EN2R')
```

```text
┌─ULIDStringToDateTime('01GNB2S2FGN2P93QPXDNB4EN2R')─┐
│                            2022-12-28 00:40:37.616 │
└────────────────────────────────────────────────────┘
```

## 另请参见 {#see-also}

- [UUID](../../sql-reference/functions/uuid-functions.md)
