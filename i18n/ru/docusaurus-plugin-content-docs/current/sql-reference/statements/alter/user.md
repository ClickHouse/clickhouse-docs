---
description: 'Документация пользователя'
sidebar_label: 'ПОЛЬЗОВАТЕЛЬ'
sidebar_position: 45
slug: /sql-reference/statements/alter/user
title: 'ALTER USER'
doc_type: 'reference'
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


## Секция GRANTEES {#grantees-clause}

Указывает пользователей или роли, которым разрешено получать [привилегии](../../../sql-reference/statements/grant.md#privileges) от данного пользователя при условии, что у этого пользователя также есть все необходимые права доступа, предоставленные с опцией [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Параметры секции `GRANTEES`:

- `user` — Указывает пользователя, которому данный пользователь может предоставлять привилегии.
- `role` — Указывает роль, которой данный пользователь может предоставлять привилегии.
- `ANY` — Данный пользователь может предоставлять привилегии любому пользователю. Это значение по умолчанию.
- `NONE` — Данный пользователь не может предоставлять привилегии никому.

Вы можете исключить любого пользователя или роль с помощью выражения `EXCEPT`. Например, `ALTER USER user1 GRANTEES ANY EXCEPT user2`. Это означает, что если у `user1` есть привилегии, предоставленные с опцией `GRANT OPTION`, он сможет предоставить эти привилегии любому пользователю, кроме `user2`.


## Примеры {#examples}

Установить назначенные роли по умолчанию:

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

Если роли не были назначены пользователю ранее, ClickHouse выдаст исключение.

Установить все назначенные роли по умолчанию:

```sql
ALTER USER user DEFAULT ROLE ALL
```

Если роль будет назначена пользователю в будущем, она автоматически станет ролью по умолчанию.

Установить все назначенные роли по умолчанию, за исключением `role1` и `role2`:

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

Разрешить пользователю с учетной записью `john` предоставлять свои привилегии пользователю с учетной записью `jack`:

```sql
ALTER USER john GRANTEES jack;
```

Добавить новые методы аутентификации пользователю с сохранением существующих:

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Примечания:

1. Старые версии ClickHouse могут не поддерживать синтаксис множественных методов аутентификации. Поэтому, если сервер ClickHouse содержит таких пользователей и понижается до версии, которая не поддерживает эту функциональность, такие пользователи станут неработоспособными, а некоторые операции, связанные с пользователями, будут нарушены. Для корректного понижения версии необходимо настроить всех пользователей на использование единственного метода аутентификации перед понижением версии. В качестве альтернативы, если сервер был понижен без соблюдения надлежащей процедуры, проблемных пользователей следует удалить.
2. `no_password` не может сосуществовать с другими методами аутентификации по соображениям безопасности.
   По этой причине невозможно добавить (`ADD`) метод аутентификации `no_password`. Следующий запрос выдаст ошибку:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

Если вы хотите удалить методы аутентификации для пользователя и использовать `no_password`, необходимо указать это в следующей форме замены.

Сбросить методы аутентификации и добавить указанные в запросе (эффект использования IDENTIFIED без ключевого слова ADD):

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Сбросить методы аутентификации с сохранением последнего добавленного:

```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```


## Секция VALID UNTIL {#valid-until-clause}

Позволяет указать дату истечения срока действия и, при необходимости, время для метода аутентификации. Принимает строку в качестве параметра. Рекомендуется использовать формат `YYYY-MM-DD [чч:мм:сс] [часовой_пояс]` для даты и времени. По умолчанию этот параметр имеет значение `'infinity'`.
Секция `VALID UNTIL` может быть указана только вместе с методом аутентификации, за исключением случая, когда метод аутентификации не указан в запросе. В этом случае секция `VALID UNTIL` будет применена ко всем существующим методам аутентификации.

Примеры:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01''`
