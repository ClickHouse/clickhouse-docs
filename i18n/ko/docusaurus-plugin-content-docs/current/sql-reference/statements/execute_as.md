---
'description': 'EXECUTE AS 문에 대한 문서'
'sidebar_label': 'EXECUTE AS'
'sidebar_position': 53
'slug': '/sql-reference/statements/execute_as'
'title': 'EXECUTE AS 문'
'doc_type': 'reference'
---


# EXECUTE AS 문

다른 사용자를 대신하여 쿼리를 실행할 수 있습니다.

## 구문 {#syntax}

```sql
EXECUTE AS target_user;
EXECUTE AS target_user subquery;
```

첫 번째 형태(`subquery` 없이)는 현재 세션의 모든 후속 쿼리가 지정된 `target_user`를 대신하여 실행되도록 설정합니다.

두 번째 형태(`subquery` 포함)는 오직 지정된 `target_user`를 대신하여 지정된 `subquery`만 실행합니다.

작동하기 위해 두 형태 모두 서버 설정 [allow_impersonate_user](/operations/server-configuration-parameters/settings#allow_impersonate_user)가 `1`로 설정되어야 하며 `IMPERSONATE` 권한이 부여되어야 합니다. 예를 들어, 다음 명령은
```sql
GRANT IMPERSONATE ON user1 TO user2;
GRANT IMPERSONATE ON * TO user3;
```
사용자 `user2`가 `EXECUTE AS user1 ...` 명령을 실행할 수 있도록 허용하고, 사용자 `user3`가 다른 사용자로서 명령을 실행할 수 있도록 허용합니다.

다른 사용자를 사칭하는 동안 함수 [currentUser()](/sql-reference/functions/other-functions#currentUser)는 그 다른 사용자의 이름을 반환하고, 함수 [authenticatedUser()](/sql-reference/functions/other-functions#authenticatedUser)는 실제로 인증된 사용자의 이름을 반환합니다.

## 예제 {#examples}

```sql
SELECT currentUser(), authenticatedUser(); -- outputs "default    default"
CREATE USER james;
EXECUTE AS james SELECT currentUser(), authenticatedUser(); -- outputs "james    default"
```
