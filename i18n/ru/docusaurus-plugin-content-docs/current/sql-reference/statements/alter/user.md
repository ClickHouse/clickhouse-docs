---
slug: '/sql-reference/statements/alter/user'
sidebar_label: USER
sidebar_position: 45
description: 'Документация для User'
title: 'ALTER USER'
doc_type: reference
---
Изменения учетных записей пользователей ClickHouse.

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

## Класс GRANTEES {#grantees-clause}

Указывает пользователей или роли, которым разрешено получать [привилегии](../../../sql-reference/statements/grant.md#privileges) от этого пользователя при условии, что у этого пользователя также есть все необходимые права, предоставленные с [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Опции класса `GRANTEES`:

- `user` — Указывает пользователя, которому этот пользователь может предоставлять привилегии.
- `role` — Указывает роль, которой этот пользователь может предоставлять привилегии.
- `ANY` — Этот пользователь может предоставлять привилегии любому. Это значение по умолчанию.
- `NONE` — Этот пользователь не может предоставлять привилегии никому.

Вы можете исключить любого пользователя или роль, используя выражение `EXCEPT`. Например, `ALTER USER user1 GRANTEES ANY EXCEPT user2`. Это означает, что если у `user1` есть какие-либо привилегии, предоставленные с `GRANT OPTION`, он сможет предоставить эти привилегии кому угодно, кроме `user2`.

## Примеры {#examples}

Установите назначенные роли по умолчанию:

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

Если роли ранее не были назначены пользователю, ClickHouse выбрасывает исключение.

Установите все назначенные роли по умолчанию:

```sql
ALTER USER user DEFAULT ROLE ALL
```

Если роль будет назначена пользователю в будущем, она автоматически станет ролью по умолчанию.

Установите все назначенные роли по умолчанию, исключая `role1` и `role2`:

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

Позволяет пользователю с учетной записью `john` предоставить свои привилегии пользователю с учетной записью `jack`:

```sql
ALTER USER john GRANTEES jack;
```

Добавляет новые методы аутентификации пользователю, сохраняя существующие:

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Примечания:
1. Более старые версии ClickHouse могут не поддерживать синтаксис нескольких методов аутентификации. Поэтому, если сервер ClickHouse содержит таких пользователей и будет понижен до версии, которая не поддерживает это, такие пользователи станут непригодными, и некоторые операции, связанные с пользователем, будут нарушены. Чтобы понизить версию без проблем, необходимо установить всем пользователям использование одного метода аутентификации перед понижением. В качестве альтернативы, если сервер был понижен без проведения надлежащей процедуры, ошибочные пользователи должны быть удалены.
2. `no_password` не может совместно существовать с другими методами аутентификации по соображениям безопасности. Из-за этого нельзя `ADD` метод аутентификации `no_password`. Следующий запрос вызовет ошибку:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

Если вы хотите удалить методы аутентификации для пользователя и полагаться на `no_password`, вы должны указать в следующей форме замены.

Сбросьте методы аутентификации и добавьте указанные в запросе (эффект от начального IDENTIFIED без ключевого слова ADD):

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Сбросьте методы аутентификации и сохраните последний добавленный:
```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## Класс VALID UNTIL {#valid-until-clause}

Позволяет вам указать дату истечения срока действия и, опционально, время для метода аутентификации. Он принимает строку в качестве параметра. Рекомендуется использовать формат `YYYY-MM-DD [hh:mm:ss] [timezone]` для даты и времени. По умолчанию этот параметр равен `'infinity'`. Класс `VALID UNTIL` может быть указан только вместе с методом аутентификации, за исключением случая, когда в запросе не был указан метод аутентификации. В этом случае класс `VALID UNTIL` будет применен ко всем существующим методам аутентификации.

Примеры:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01'`