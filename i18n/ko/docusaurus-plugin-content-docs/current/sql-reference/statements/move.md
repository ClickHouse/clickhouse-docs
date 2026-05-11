---
description: 'MOVE access entity SQL 문에 대한 설명서'
sidebar_label: 'MOVE'
sidebar_position: 54
slug: /sql-reference/statements/move
title: 'MOVE access entity SQL 문'
doc_type: 'reference'
---

# MOVE access entity 구문 \{#move-access-entity-statement\}

이 구문은 access entity를 한 access storage에서 다른 access storage로 이동합니다.

문법:

```sql
MOVE {USER, ROLE, QUOTA, SETTINGS PROFILE, ROW POLICY} name1 [, name2, ...] TO access_storage_type
```

현재 ClickHouse에는 다음과 같은 다섯 가지 access storage가 있습니다:

* `local_directory`
* `memory`
* `replicated`
* `users_xml` (ro)
* `ldap` (ro)

예시:

```sql
MOVE USER test TO local_directory
```

```sql
MOVE ROLE test TO memory
```
