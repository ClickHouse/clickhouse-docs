---
'description': 'ALTER NAMED COLLECTION에 대한 문서'
'sidebar_label': 'NAMED COLLECTION'
'slug': '/sql-reference/statements/alter/named-collection'
'title': 'ALTER NAMED COLLECTION'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />


# ALTER NAMED COLLECTION

이 쿼리는 이미 존재하는 이름이 지정된 컬렉션을 수정하려고 합니다.

**문법**

```sql
ALTER NAMED COLLECTION [IF EXISTS] name [ON CLUSTER cluster]
[ SET
key_name1 = 'some value' [[NOT] OVERRIDABLE],
key_name2 = 'some value' [[NOT] OVERRIDABLE],
key_name3 = 'some value' [[NOT] OVERRIDABLE],
... ] |
[ DELETE key_name4, key_name5, ... ]
```

**예시**

```sql
CREATE NAMED COLLECTION foobar AS a = '1' NOT OVERRIDABLE, b = '2';

ALTER NAMED COLLECTION foobar SET a = '2' OVERRIDABLE, c = '3';

ALTER NAMED COLLECTION foobar DELETE b;
```
