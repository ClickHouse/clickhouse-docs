---
description: 'Документация по пользователю'
sidebar_label: 'ПОЛЬЗОВАТЕЛЬ'
sidebar_position: 45
slug: /sql-reference/statements/alter/user
title: 'ALTER USER'
doc_type: 'reference'
---

Изменяет учётные записи пользователей ClickHouse.

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

Чтобы использовать `ALTER USER`, вы должны иметь право [ALTER USER](../../../sql-reference/statements/grant.md#access-management).


## Предложение GRANTEES {#grantees-clause}

Указывает пользователей или роли, которым разрешено получать [привилегии](../../../sql-reference/statements/grant.md#privileges) от данного пользователя при условии, что этому пользователю также предоставлены все необходимые права с опцией [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Варианты предложения `GRANTEES`:

- `user` — Указывает пользователя, которому этот пользователь может выдавать привилегии.
- `role` — Указывает роль, которой этот пользователь может выдавать привилегии.
- `ANY` — Этот пользователь может выдавать привилегии кому угодно. Значение по умолчанию.
- `NONE` — Этот пользователь не может выдавать привилегии никому.

Вы можете исключить любого пользователя или роль, используя выражение `EXCEPT`. Например, `ALTER USER user1 GRANTEES ANY EXCEPT user2`. Это означает, что если у пользователя `user1` есть некоторые привилегии, выданные с `GRANT OPTION`, он сможет выдавать эти привилегии кому угодно, кроме `user2`.



## Примеры

Сделать назначенные роли ролями по умолчанию:

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

Если роли ранее не были назначены пользователю, ClickHouse выдаст исключение.

Назначьте все выданные роли как роли по умолчанию:

```sql
ALTER USER user DEFAULT ROLE ALL
```

Если в будущем пользователю назначат роль, она автоматически станет ролью по умолчанию.

Сделайте все назначенные роли ролями по умолчанию, кроме `role1` и `role2`:

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

Позволяет пользователю с учётной записью `john` передавать свои привилегии пользователю с учётной записью `jack`:

```sql
ALTER USER john GRANTEES jack;
```

Добавляет пользователю новые методы аутентификации, при этом сохраняя существующие:

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Notes:

1. Более старые версии ClickHouse могут не поддерживать синтаксис с несколькими методами аутентификации. Поэтому, если на сервере ClickHouse есть такие пользователи и выполняется откат до версии, которая этого не поддерживает, такие пользователи станут непригодны для использования, а некоторые операции, связанные с пользователями, перестанут работать. Чтобы выполнить откат версии корректно, необходимо заранее настроить всех пользователей так, чтобы у каждого был только один метод аутентификации. Либо, если сервер уже был откатан без соблюдения правильной процедуры, проблемные учетные записи пользователей нужно удалить.
2. `no_password` не может сосуществовать с другими методами аутентификации по соображениям безопасности.
   По этой причине невозможно выполнить `ADD` метода аутентификации `no_password`. Приведенный ниже запрос завершится ошибкой:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

Если вы хотите удалить методы аутентификации для пользователя и полагаться на `no_password`, вы должны указать это в форме с заменой ниже.

Сбрасывает методы аутентификации и добавляет те, которые указаны в запросе (эквивалентно использованию ведущего IDENTIFIED без ключевого слова ADD):

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Сбросьте методы аутентификации, оставив только последний добавленный:

```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```


## Оператор VALID UNTIL {#valid-until-clause}

Позволяет указать дату окончания срока действия и, при необходимости, время для метода аутентификации. В качестве параметра принимает строку. Рекомендуется использовать формат `YYYY-MM-DD [hh:mm:ss] [timezone]` для значения даты и времени. По умолчанию значение этого параметра — `'infinity'`.
Оператор `VALID UNTIL` может быть указан только вместе с методом аутентификации, за исключением случая, когда метод аутентификации в запросе не указан. В этом случае оператор `VALID UNTIL` будет применён ко всем существующим методам аутентификации.

Примеры:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01''`
