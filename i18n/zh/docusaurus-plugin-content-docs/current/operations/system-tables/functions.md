---
description: '包含有关普通和聚合函数的信息的系统表。'
slug: /operations/system-tables/functions
title: 'system.functions'
keywords: ['system table', 'functions']
---

包含有关普通和聚合函数的信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) – 函数的名称。
- `is_aggregate` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 函数是否为聚合函数。
- `case_insensitive` ([UInt8](../../sql-reference/data-types/int-uint.md)) - 函数名称是否可以不区分大小写地使用。
- `alias_to` ([String](../../sql-reference/data-types/string.md)) - 如果函数名称是别名，则原始函数名称。
- `create_query` ([String](../../sql-reference/data-types/enum.md)) - 未使用。
- `origin` ([Enum8](../../sql-reference/data-types/string.md)) - 未使用。
- `description` ([String](../../sql-reference/data-types/string.md)) - 对函数所做内容的高级描述。
- `syntax` ([String](../../sql-reference/data-types/string.md)) - 函数的签名。
- `arguments` ([String](../../sql-reference/data-types/string.md)) - 函数接受哪些参数。
- `returned_value` ([String](../../sql-reference/data-types/string.md)) - 函数返回什么。
- `examples` ([String](../../sql-reference/data-types/string.md)) - 函数的示例用法。
- `categories` ([String](../../sql-reference/data-types/string.md)) - 函数的类别。

**示例**

```sql
 SELECT name, is_aggregate, is_deterministic, case_insensitive, alias_to FROM system.functions LIMIT 5;
```

```text
┌─name─────────────────────┬─is_aggregate─┬─is_deterministic─┬─case_insensitive─┬─alias_to─┐
│ BLAKE3                   │            0 │                1 │                0 │          │
│ sipHash128Reference      │            0 │                1 │                0 │          │
│ mapExtractKeyLike        │            0 │                1 │                0 │          │
│ sipHash128ReferenceKeyed │            0 │                1 │                0 │          │
│ mapPartialSort           │            0 │                1 │                0 │          │
└──────────────────────────┴──────────────┴──────────────────┴──────────────────┴──────────┘

5 行。在集合中。耗时：0.002 秒。
```
