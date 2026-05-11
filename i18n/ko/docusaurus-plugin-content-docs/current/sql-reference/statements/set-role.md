---
description: 'SET ROLE에 대한 문서'
sidebar_label: 'SET ROLE'
sidebar_position: 51
slug: /sql-reference/statements/set-role
title: 'SET ROLE 구문'
doc_type: 'reference'
---

현재 사용자에 대해 역할을 활성화합니다.

```sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## SET DEFAULT ROLE \{#set-default-role\}

사용자에게 기본 역할을 설정합니다.

기본 역할은 사용자가 로그인하면 자동으로 활성화됩니다. 기본 역할로 설정할 수 있는 것은 미리 부여된 역할뿐입니다. 역할이 사용자에게 부여되지 않은 경우 ClickHouse에서 예외를 발생시킵니다.

```sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## 예시 \{#examples\}

사용자에게 여러 개의 기본 역할을 지정합니다:

```sql
SET DEFAULT ROLE role1, role2, ... TO user
```

사용자에게 부여된 모든 역할을 해당 사용자의 기본 역할로 설정합니다:

```sql
SET DEFAULT ROLE ALL TO user
```

USER의 기본 역할을 제거합니다:

```sql
SET DEFAULT ROLE NONE TO user
```

특정 역할인 `role1`과 `role2`를 제외한 모든 부여된 역할을 기본 역할로 설정합니다:

```sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
