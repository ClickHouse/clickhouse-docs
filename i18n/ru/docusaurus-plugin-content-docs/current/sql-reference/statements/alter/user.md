---
description: 'Документация для пользователя'
sidebar_label: 'ПОЛЬЗОВАТЕЛЬ'
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

Чтобы использовать `ALTER USER`, вы должны иметь привилегию [ALTER USER](../../../sql-reference/statements/grant.md#access-management).

## Клаузула GRANTEES {#grantees-clause}

Указывает пользователей или роли, которым разрешено получать [привилегии](../../../sql-reference/statements/grant.md#privileges) от данного пользователя при условии, что этому пользователю также предоставлены все необходимые доступы с помощью [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Опции клаузулы `GRANTEES`:

- `user` — Указывает пользователя, которому данный пользователь может предоставлять привилегии.
- `role` — Указывает роль, которой данный пользователь может предоставлять привилегии.
- `ANY` — Данный пользователь может предоставлять привилегии любому. Это настройка по умолчанию.
- `NONE` — Данный пользователь не может предоставлять привилегии никому.

Вы можете исключить любого пользователя или роль, используя выражение `EXCEPT`. Например, `ALTER USER user1 GRANTEES ANY EXCEPT user2`. Это означает, что если `user1` имеет какие-либо привилегии, предоставленные с помощью `GRANT OPTION`, он сможет предоставить эти привилегии любому, кроме `user2`.

## Примеры {#examples}

Установить назначенные роли как роль по умолчанию:

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

Если роли ранее не были назначены пользователю, ClickHouse выбрасывает исключение.

Установить все назначенные роли как роль по умолчанию:

```sql
ALTER USER user DEFAULT ROLE ALL
```

Если роль будет назначена пользователю в будущем, она автоматически станет по умолчанию.

Установить все назначенные роли как роль по умолчанию, кроме `role1` и `role2`:

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

Разрешает пользователю с учетной записью `john` предоставлять свои привилегии пользователю с учетной записью `jack`:

```sql
ALTER USER john GRANTEES jack;
```

Добавляет новые методы аутентификации для пользователя, сохраняя существующие:

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Примечания:
1. Более ранние версии ClickHouse могут не поддерживать синтаксис нескольких методов аутентификации. Поэтому, если сервер ClickHouse содержит таких пользователей и будет понижен до версии, которая этого не поддерживает, такие пользователи станут несостоятельными, и некоторые операции, связанные с пользователями, будут нарушены. Для плавного понижения версии необходимо установить всех пользователей на один метод аутентификации до понижения. В противном случае, если сервер был понижен без надлежащей процедуры, неисправные пользователи должны быть удалены.
2. `no_password` не может сосуществовать с другими методами аутентификации по соображениям безопасности. Поэтому невозможно `ADD` метод аутентификации `no_password`. Следующий запрос вызовет ошибку:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

Если вы хотите удалить методы аутентификации для пользователя и полагаться на `no_password`, вы должны указать в следующей форме замены.

Сбросить методы аутентификации и добавить указанные в запросе (эффект ведущей идентификации без ключевого слова ADD):

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Сбросить методы аутентификации и сохранить последний добавленный:

```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## Клаузула VALID UNTIL {#valid-until-clause}

Позволяет вам указать дату истечения срока действия и, опционально, время для метода аутентификации. Она принимает строку в качестве параметра. Рекомендуется использовать формат `YYYY-MM-DD [hh:mm:ss] [timezone]` для даты и времени. По умолчанию этот параметр равен `'infinity'`.
Клаузулу `VALID UNTIL` можно указывать только вместе с методом аутентификации, за исключением случая, когда в запросе не был указан ни один метод аутентификации. В этом сценарии клаузула `VALID UNTIL` будет применена ко всем существующим методам аутентификации.

Примеры:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

