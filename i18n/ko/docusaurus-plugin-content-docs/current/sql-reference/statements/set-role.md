---
'description': 'Set Role에 대한 문서'
'sidebar_label': 'SET ROLE'
'sidebar_position': 51
'slug': '/sql-reference/statements/set-role'
'title': 'SET ROLE 문'
'doc_type': 'reference'
---

현재 사용자에 대한 역할을 활성화합니다.

```sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## 기본 역할 설정 {#set-default-role}

사용자에 대한 기본 역할을 설정합니다.

기본 역할은 사용자가 로그인할 때 자동으로 활성화됩니다. 이전에 부여된 역할만 기본으로 설정할 수 있습니다. 사용자가 역할을 부여받지 않은 경우 ClickHouse는 예외를 발생시킵니다.

```sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## 예제 {#examples}

사용자에게 여러 기본 역할을 설정합니다:

```sql
SET DEFAULT ROLE role1, role2, ... TO user
```

부여된 모든 역할을 사용자에게 기본으로 설정합니다:

```sql
SET DEFAULT ROLE ALL TO user
```

사용자에게서 기본 역할을 제거합니다:

```sql
SET DEFAULT ROLE NONE TO user
```

특정 역할 `role1`과 `role2`를 제외하고 부여된 모든 역할을 사용자에게 기본으로 설정합니다:

```sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
