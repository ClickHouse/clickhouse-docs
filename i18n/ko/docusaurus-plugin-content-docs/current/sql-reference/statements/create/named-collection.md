---
'description': 'CREATE NAMED COLLECTION에 대한 문서'
'sidebar_label': 'NAMED COLLECTION'
'slug': '/sql-reference/statements/create/named-collection'
'title': 'CREATE NAMED COLLECTION'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />


# CREATE NAMED COLLECTION

새로운 이름이 지정된 컬렉션을 생성합니다.

**구문**

```sql
CREATE NAMED COLLECTION [IF NOT EXISTS] name [ON CLUSTER cluster] AS
key_name1 = 'some value' [[NOT] OVERRIDABLE],
key_name2 = 'some value' [[NOT] OVERRIDABLE],
key_name3 = 'some value' [[NOT] OVERRIDABLE],
...
```

**예시**

```sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2' OVERRIDABLE;
```

**관련 문서**

- [CREATE NAMED COLLECTION](/sql-reference/statements/alter/named-collection)
- [DROP NAMED COLLECTION](/sql-reference/statements/drop#drop-function)

**참조**

- [이름이 지정된 컬렉션 가이드](/operations/named-collections.md)
