---
description: 'Описание оператора EXECUTE AS'
sidebar_label: 'EXECUTE AS'
sidebar_position: 53
slug: /sql-reference/statements/execute_as
title: 'Оператор EXECUTE AS'
doc_type: 'reference'
---



# Оператор EXECUTE AS

Позволяет выполнять запросы от имени другого пользователя.



## Синтаксис {#syntax}

```sql
EXECUTE AS target_user;
EXECUTE AS target_user subquery;
```

Первая форма (без `subquery`) устанавливает, что все последующие запросы в текущей сессии будут выполняться от имени указанного пользователя `target_user`.

Вторая форма (с `subquery`) выполняет только указанный подзапрос `subquery` от имени указанного пользователя `target_user`.

Для работы обеих форм требуется, чтобы серверная настройка [allow_impersonate_user](/operations/server-configuration-parameters/settings#allow_impersonate_user)
была установлена в `1` и была предоставлена привилегия `IMPERSONATE`. Например, следующие команды

```sql
GRANT IMPERSONATE ON user1 TO user2;
GRANT IMPERSONATE ON * TO user3;
```

позволяют пользователю `user2` выполнять команды `EXECUTE AS user1 ...`, а также позволяют пользователю `user3` выполнять команды от имени любого пользователя.

При имитации другого пользователя функция [currentUser()](/sql-reference/functions/other-functions#currentUser) возвращает имя этого пользователя,
а функция [authenticatedUser()](/sql-reference/functions/other-functions#authenticatedUser) возвращает имя пользователя, который был фактически аутентифицирован.


## Примеры {#examples}

```sql
SELECT currentUser(), authenticatedUser(); -- возвращает "default    default"
CREATE USER james;
EXECUTE AS james SELECT currentUser(), authenticatedUser(); -- возвращает "james    default"
```
