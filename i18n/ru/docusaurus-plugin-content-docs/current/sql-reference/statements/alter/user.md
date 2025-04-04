---
description: 'Документация для USER'
sidebar_label: 'USER'
sidebar_position: 45
slug: /sql-reference/statements/alter/user
title: 'ALTER USER'
---

Изменяет учетные записи пользователей ClickHouse.

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

Для использования `ALTER USER` вы должны иметь права [ALTER USER](../../../sql-reference/statements/grant.md#access-management).

## GRANTEES Clause {#grantees-clause}

Указывает пользователей или роли, которые могут получать [привилегии](../../../sql-reference/statements/grant.md#privileges) от этого пользователя при условии, что у этого пользователя также есть все необходимые права, предоставленные с помощью [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Опции пункта `GRANTEES`:

- `user` — Указывает пользователя, которому этот пользователь может предоставлять привилегии.
- `role` — Указывает роль, которой этот пользователь может предоставлять привилегии.
- `ANY` — Этот пользователь может предоставлять привилегии любому. Это значение по умолчанию.
- `NONE` — Этот пользователь не может предоставлять привилегии никому.

Вы можете исключить любого пользователя или роль, используя выражение `EXCEPT`. Например, `ALTER USER user1 GRANTEES ANY EXCEPT user2`. Это означает, что если `user1` получил некоторые привилегии с помощью `GRANT OPTION`, он сможет предоставить эти привилегии любому, кроме `user2`.

## Примеры {#examples}

Установить назначенные роли по умолчанию:

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

Если роли ранее не были назначены пользователю, ClickHouse выдаст исключение.

Установить все назначенные роли по умолчанию:

```sql
ALTER USER user DEFAULT ROLE ALL
```

Если в будущем роли будут назначены пользователю, они автоматически станут по умолчанию.

Установить все назначенные роли по умолчанию, исключая `role1` и `role2`:

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

Позволяет пользователю с аккаунтом `john` предоставлять свои привилегии пользователю с аккаунтом `jack`:

```sql
ALTER USER john GRANTEES jack;
```

Добавляет новые методы аутентификации пользователю, сохраняя существующие:

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Примечания:
1. Более ранние версии ClickHouse могут не поддерживать синтаксис нескольких методов аутентификации. Поэтому, если сервер ClickHouse содержит таких пользователей и был понижен до версии, которая не поддерживает это, такие пользователи станут неработоспособными, и некоторые операции, связанные с пользователями, будут нарушены. Для плавного понижения необходимо установить для всех пользователей единственный метод аутентификации перед понижением. В качестве альтернативы, если сервер был понижен без надлежащей процедуры, недействительные пользователи должны быть удалены.
2. `no_password` не может сосуществовать с другими методами аутентификации по соображениям безопасности. Поэтому невозможно `ADD` метод аутентификации `no_password`. Запрос ниже выдаст ошибку:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

Если вы хотите удалить методы аутентификации для пользователя и использовать `no_password`, вы должны указать в следующем заменяющем формате.

Сбросить методы аутентификации и добавить указанные в запросе (эффект ведет к IDENTIFIED без ключевого слова ADD):

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Сбросить методы аутентификации и сохранить наиболее недавно добавленный:
```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL Clause {#valid-until-clause}

Позволяет указать дату истечения срока действия и, необязательно, время для метода аутентификации. Принимает строку в качестве параметра. Рекомендуется использовать формат `YYYY-MM-DD [hh:mm:ss] [timezone]` для даты и времени. По умолчанию этот параметр равен `'infinity'`. 
Пункт `VALID UNTIL` может быть указан только вместе с методом аутентификации, за исключением случая, когда в запросе не был указан метод аутентификации. В этом сценарии пункт `VALID UNTIL` будет применяться ко всем существующим методам аутентификации.

Примеры:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`
