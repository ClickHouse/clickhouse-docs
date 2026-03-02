---
description: 'EXECUTE AS SQL 문 문서'
sidebar_label: 'EXECUTE AS'
sidebar_position: 53
slug: /sql-reference/statements/execute_as
title: 'EXECUTE AS SQL 문'
doc_type: 'reference'
---

# EXECUTE AS Statement \{#execute-as-statement\}

다른 USER 권한으로 쿼리를 실행할 수 있습니다.

## 구문 \{#syntax\}

```sql
EXECUTE AS target_user;
EXECUTE AS target_user subquery;
```

첫 번째 형식( `subquery` 없이 사용)은 현재 세션에서 이어지는 모든 쿼리가 지정된 `target_user` 를 대신하여 실행되도록 설정합니다.

두 번째 형식( `subquery` 를 사용하는 경우)은 지정된 `subquery` 만 지정된 `target_user` 를 대신하여 실행합니다.

두 형식이 모두 동작하려면 설정값 `access_control_improvements.allow_impersonate_user` 를 `1` 로 설정하고 `IMPERSONATE` 권한을 부여해야 합니다. 예를 들어, 다음 명령은

```sql
GRANT IMPERSONATE ON user1 TO user2;
GRANT IMPERSONATE ON * TO user3;
```

`user2` 사용자에게는 `EXECUTE AS user1 ...` 명령을 실행할 수 있는 권한을 부여하고, `user3` 사용자에게는 임의의 사용자로서 명령을 실행할 수 있는 권한을 부여합니다.

다른 사용자로 가장하여 명령을 실행하는 경우 함수 [currentUser()](/sql-reference/functions/other-functions#currentUser)는 그 다른 사용자의 이름을 반환하고,
함수 [authenticatedUser()](/sql-reference/functions/other-functions#authenticatedUser)는 실제로 인증된 사용자의 이름을 반환합니다.

## 예시 \{#examples\}

```sql
SELECT currentUser(), authenticatedUser(); -- outputs "default    default"
CREATE USER james;
EXECUTE AS james SELECT currentUser(), authenticatedUser(); -- outputs "james    default"
```
