---
description: 'Документация по USER'
sidebar_label: 'USER'
sidebar_position: 45
slug: /sql-reference/statements/alter/user
title: 'ALTER USER'
doc_type: 'reference'
---

Изменяет учетные записи пользователей в ClickHouse.

Синтаксис:

```sql
ALTER USER [IF EXISTS] name1 [RENAME TO new_name |, name2 [,...]] 
    [ON CLUSTER cluster_name]
    [NOT IDENTIFIED | RESET AUTHENTICATION METHODS TO NEW | {IDENTIFIED | ADD IDENTIFIED} {[WITH {plaintext_password | sha256_password | sha256_hash | double_sha1_password | double_sha1_hash}] BY {'password' | 'hash'}} | WITH NO_PASSWORD | {WITH ldap SERVER 'server_name'} | {WITH kerberos [REALM 'realm']} | {WITH ssl_certificate CN 'common_name' | SAN 'TYPE:subject_alt_name'} | {WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa|...'} | {WITH http SERVER 'server_name' [SCHEME 'Basic']} [VALID UNTIL datetime]
    [, {[{plaintext_password | sha256_password | sha256_hash | ...}] BY {'password' | 'hash'}} | {ldap SERVER 'server_name'} | {...} | ... [,...]]]
    [[ADD | DROP] HOST {LOCAL | NAME 'name' | REGEXP 'name_regexp' | IP 'address' | LIKE 'pattern'} [,...] | ANY | NONE]
    [VALID UNTIL datetime]
    [DEFAULT ROLE role [,...] | ALL | ALL EXCEPT role [,...] ]
    [GRANTEES {user | role | ANY | NONE} [,...] [EXCEPT {user | role} [,...]]]
    [DROP ALL PROFILES]
    [DROP ALL SETTINGS]
    [DROP SETTINGS variable [,...] ]
    [DROP PROFILES 'profile_name' [,...] ]
    [ADD|MODIFY SETTINGS variable [=value] [MIN [=] min_value] [MAX [=] max_value] [READONLY|WRITABLE|CONST|CHANGEABLE_IN_READONLY] [,...] ]
    [ADD PROFILES 'profile_name' [,...] ]
```

Чтобы использовать `ALTER USER`, необходимо иметь привилегию [ALTER USER](../../../sql-reference/statements/grant.md#access-management).

## Клауза GRANTEES \\{#grantees-clause\\}

Определяет пользователей или роли, которым разрешено получать [привилегии](../../../sql-reference/statements/grant.md#privileges) от этого пользователя при условии, что этому пользователю также выданы все необходимые привилегии с [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Параметры клаузы `GRANTEES`:

- `user` — Указывает пользователя, которому этот пользователь может выдавать привилегии.
- `role` — Указывает роль, которой этот пользователь может выдавать привилегии.
- `ANY` — Этот пользователь может выдавать привилегии любому пользователю или роли. Значение по умолчанию.
- `NONE` — Этот пользователь не может выдавать привилегии никому.

Вы можете исключить любого пользователя или роль с помощью выражения `EXCEPT`. Например, `ALTER USER user1 GRANTEES ANY EXCEPT user2`. Это означает, что если у `user1` есть какие‑то привилегии, выданные с `GRANT OPTION`, то он сможет выдавать эти привилегии кому угодно, кроме `user2`.

## Примеры \\{#examples\\}

Сделайте назначенные роли ролями по умолчанию:

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

Если роли ранее не были назначены пользователю, ClickHouse сгенерирует исключение.

Сделайте все назначенные роли ролями по умолчанию:

```sql
ALTER USER user DEFAULT ROLE ALL
```

Если в будущем пользователю назначат роль, она автоматически станет ролью по умолчанию.

Сделайте все назначенные роли ролями по умолчанию, кроме `role1` и `role2`:

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

Позволяет пользователю с учётной записью `john` предоставлять свои привилегии пользователю с учётной записью `jack`:

```sql
ALTER USER john GRANTEES jack;
```

Добавляет новые методы аутентификации пользователю, сохраняя уже существующие:

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Notes:

1. Более старые версии ClickHouse могут не поддерживать синтаксис с несколькими методами аутентификации. Поэтому, если сервер ClickHouse содержит таких пользователей и понижен до версии, которая этого не поддерживает, такие пользователи станут непригодными к использованию, а некоторые операции, связанные с пользователями, перестанут работать. Чтобы выполнить понижение версии без последствий, необходимо перед понижением оставить для всех пользователей только один метод аутентификации. Если же сервер был понижен без соблюдения этой процедуры, проблемных пользователей следует удалить.
2. `no_password` не может сосуществовать с другими методами аутентификации по соображениям безопасности.
   По этой причине невозможно добавить метод аутентификации `no_password` с помощью `ADD`. Приведённый ниже запрос вызовет ошибку:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

Если вы хотите удалить методы аутентификации пользователя и полагаться только на `no_password`, необходимо воспользоваться приведённой ниже формой с заменой.

Сбрасывает методы аутентификации и добавляет те, что указаны в запросе (эквивалент ведущего IDENTIFIED без ключевого слова ADD):

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Сбросить методы аутентификации и сохранить только последний добавленный:

```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## Оператор VALID UNTIL \\{#valid-until-clause\\}

Позволяет задать дату окончания срока действия и, при необходимости, время для метода аутентификации. Принимает строку в качестве параметра. Рекомендуется использовать формат `YYYY-MM-DD [hh:mm:ss] [timezone]` для значения даты и времени. По умолчанию этот параметр равен `'infinity'`.
Оператор `VALID UNTIL` может быть указан только вместе с методом аутентификации, за исключением случая, когда в запросе метод аутентификации не задан. В этом случае оператор `VALID UNTIL` будет применён ко всем существующим методам аутентификации.

Примеры:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01''`
