---
description: 'Документация по оператору EXECUTE AS'
sidebar_label: 'EXECUTE AS'
sidebar_position: 53
slug: /sql-reference/statements/execute_as
title: 'Оператор EXECUTE AS'
doc_type: 'reference'
---

# Оператор EXECUTE AS {#execute-as-statement}

Позволяет выполнять запросы от имени другого пользователя.

## Синтаксис {#syntax}

```sql
EXECUTE AS target_user;
EXECUTE AS target_user subquery;
```

Первая форма (без `subquery`) означает, что все последующие запросы в текущей сессии будут выполняться от имени указанного `target_user`.

Вторая форма (с `subquery`) выполняет только указанный `subquery` от имени указанного `target_user`.

Для работы обеих форм необходимо, чтобы параметр сервера [allow&#95;impersonate&#95;user](/operations/server-configuration-parameters/settings#allow_impersonate_user)
был установлен в значение `1`, а привилегия `IMPERSONATE` была выдана. Например, следующие команды

```sql
GRANT IMPERSONATE ON user1 TO user2;
GRANT IMPERSONATE ON * TO user3;
```

позволяет пользователю `user2` выполнять команды `EXECUTE AS user1 ...`, а также позволяет пользователю `user3` выполнять команды от имени любого пользователя.

При работе от имени другого пользователя функция [currentUser()](/sql-reference/functions/other-functions#currentUser) возвращает имя этого пользователя,
а функция [authenticatedUser()](/sql-reference/functions/other-functions#authenticatedUser) возвращает имя пользователя, который был фактически аутентифицирован.

## Примеры {#examples}

```sql
SELECT currentUser(), authenticatedUser(); -- outputs "default    default"
CREATE USER james;
EXECUTE AS james SELECT currentUser(), authenticatedUser(); -- outputs "james    default"
```
