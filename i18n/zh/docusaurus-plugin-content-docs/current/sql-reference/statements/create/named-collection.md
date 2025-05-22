import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />


# 创建命名集合

创建一个新的命名集合。

**语法**

```sql
CREATE NAMED COLLECTION [IF NOT EXISTS] name [ON CLUSTER cluster] AS
key_name1 = 'some value' [[NOT] OVERRIDABLE],
key_name2 = 'some value' [[NOT] OVERRIDABLE],
key_name3 = 'some value' [[NOT] OVERRIDABLE],
...
```

**示例**

```sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2' OVERRIDABLE;
```

**相关语句**

- [CREATE NAMED COLLECTION](/sql-reference/statements/alter/named-collection)
- [DROP NAMED COLLECTION](/sql-reference/statements/drop#drop-function)

**另见**

- [命名集合指南](/operations/named-collections.md)
