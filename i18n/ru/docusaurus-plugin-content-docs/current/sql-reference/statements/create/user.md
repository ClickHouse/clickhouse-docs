---
slug: '/sql-reference/statements/create/user'
sidebar_label: USER
sidebar_position: 39
description: 'Документация для User'
title: 'CREATE USER'
doc_type: reference
---
Создает [учетные записи пользователей](../../../guides/sre/user-management/index.md#user-account-management).

Синтаксис:

```sql
CREATE USER [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [NOT IDENTIFIED | IDENTIFIED {[WITH {plaintext_password | sha256_password | sha256_hash | double_sha1_password | double_sha1_hash}] BY {'password' | 'hash'}} | WITH NO_PASSWORD | {WITH ldap SERVER 'server_name'} | {WITH kerberos [REALM 'realm']} | {WITH ssl_certificate CN 'common_name' | SAN 'TYPE:subject_alt_name'} | {WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa|...'} | {WITH http SERVER 'server_name' [SCHEME 'Basic']} [VALID UNTIL datetime] 
    [, {[{plaintext_password | sha256_password | sha256_hash | ...}] BY {'password' | 'hash'}} | {ldap SERVER 'server_name'} | {...} | ... [,...]]]
    [HOST {LOCAL | NAME 'name' | REGEXP 'name_regexp' | IP 'address' | LIKE 'pattern'} [,...] | ANY | NONE]
    [VALID UNTIL datetime]
    [IN access_storage_type]
    [DEFAULT ROLE role [,...]]
    [DEFAULT DATABASE database | NONE]
    [GRANTEES {user | role | ANY | NONE} [,...] [EXCEPT {user | role} [,...]]]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [READONLY | WRITABLE] | PROFILE 'profile_name'] [,...]
```

Клаузула `ON CLUSTER` позволяет создавать пользователей в кластере, см. [Распределенный DDL](../../../sql-reference/distributed-ddl.md).

## Идентификация {#identification}

Существуют различные способы идентификации пользователей:

- `IDENTIFIED WITH no_password`
- `IDENTIFIED WITH plaintext_password BY 'qwerty'`
- `IDENTIFIED WITH sha256_password BY 'qwerty'` или `IDENTIFIED BY 'password'`
- `IDENTIFIED WITH sha256_hash BY 'hash'` или `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
- `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
- `IDENTIFIED WITH double_sha1_hash BY 'hash'`
- `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
- `IDENTIFIED WITH bcrypt_hash BY 'hash'`
- `IDENTIFIED WITH ldap SERVER 'server_name'`
- `IDENTIFIED WITH kerberos` или `IDENTIFIED WITH kerberos REALM 'realm'`
- `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
- `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
- `IDENTIFIED WITH http SERVER 'http_server'` или `IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
- `IDENTIFIED BY 'qwerty'`

Требования к сложности пароля могут быть отредактированы в [config.xml](/operations/configuration-files). Ниже приведен пример конфигурации, которая требует, чтобы пароли состояли как минимум из 12 символов и содержали 1 цифру. Каждое правило сложности пароля требует регулярное выражение для проверки паролей и описание правила.

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>be at least 12 characters long</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>contain at least 1 numeric character</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
В ClickHouse Cloud по умолчанию пароли должны соответствовать следующим требованиям по сложности:
- Состоять как минимум из 12 символов
- Содержать как минимум 1 цифровой символ
- Содержать как минимум 1 заглавный символ
- Содержать как минимум 1 строчный символ
- Содержать как минимум 1 специальный символ
:::

## Примеры {#examples}

1. Следующее имя пользователя `name1` и не требует пароля, что, очевидно, не обеспечивает большой безопасности:

```sql
CREATE USER name1 NOT IDENTIFIED
```

2. Чтобы указать открытый пароль:

```sql
CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
```

    :::tip
    Пароль хранится в SQL текстовом файле в `/var/lib/clickhouse/access`, поэтому не рекомендуется использовать `plaintext_password`. Попробуйте вместо этого использовать `sha256_password`, как показано далее...
    :::

3. Наиболее распространенный вариант — использовать пароль, который хешируется с использованием SHA-256. ClickHouse будет хешировать пароль за вас, когда вы укажете `IDENTIFIED WITH sha256_password`. Например:

```sql
CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
```

    Пользователь `name3` теперь может войти, используя `my_password`, но пароль хранится в виде хешированного значения выше. Следующий SQL файл был создан в `/var/lib/clickhouse/access` и выполняется при запуске сервера:

```bash
/var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
```

    :::tip
    Если вы уже создали хеш-значение и соответствующее значение соли для имени пользователя, вы можете использовать `IDENTIFIED WITH sha256_hash BY 'hash'` или `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`. Для идентификации с использованием `sha256_hash` и `SALT` - хеш должен быть вычислен из конкатенации 'password' и 'salt'.
    :::

4. `double_sha1_password` обычно не требуется, но может быть полезен при работе с клиентами, которые требуют его (например, интерфейс MySQL):

```sql
CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
```

    ClickHouse генерирует и выполняет следующий запрос:

```response
CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
```

5. `bcrypt_password` является наиболее безопасным вариантом для хранения паролей. Он использует алгоритм [bcrypt](https://en.wikipedia.org/wiki/Bcrypt), который устойчив к атакам методом перебора, даже если хеш пароля скомпрометирован.

```sql
CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
```

    Длина пароля ограничена 72 символами с этим методом. 
    Параметр рабочей нагрузки bcrypt, который определяет количество вычислений и времени, необходимого для вычисления хеша и проверки пароля, можно изменить в конфигурации сервера:

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

    Рабочая нагрузка должна быть между 4 и 31, со значением по умолчанию 12.

   :::warning
   Для приложений с частой аутентификацией,
   рассмотрите альтернативные методы аутентификации из-за
   вычислительных затрат bcrypt при более высоких рабочих нагрузках.
   :::

6. 
6. Тип пароля также можно опустить:

```sql
CREATE USER name6 IDENTIFIED BY 'my_password'
```

    В этом случае ClickHouse будет использовать тип пароля по умолчанию, указанный в конфигурации сервера:

```xml
<default_password_type>sha256_password</default_password_type>
```

    Доступные типы паролей: `plaintext_password`, `sha256_password`, `double_sha1_password`.

7. Можно указать несколько методов аутентификации: 

```sql
CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
```

Примечания:
1. Более старые версии ClickHouse могут не поддерживать синтаксис нескольких методов аутентификации. Поэтому, если сервер ClickHouse содержит таких пользователей и понижен до версии, которая не поддерживает это, такие пользователи станут недоступными, и некоторые операции, связанные с пользователями, будут нарушены. Чтобы безболезненно понизить версию, необходимо установить для всех пользователей наличие единственного метода аутентификации перед понижением. В противном случае, если сервер был понижен без соблюдения правильной процедуры, неисправные пользователи должны быть удалены.
2. `no_password` не может сосуществовать с другими методами аутентификации по соображениям безопасности. Поэтому вы можете указать `no_password` только если это единственный метод аутентификации в запросе. 

## Хост пользователя {#user-host}

Хост пользователя — это хост, с которого можно установить соединение с сервером ClickHouse. Хост можно указать в разделе `HOST` запроса следующими способами:

- `HOST IP 'ip_address_or_subnetwork'` — Пользователь может подключаться к серверу ClickHouse только с указанного IP-адреса или [подсети](https://en.wikipedia.org/wiki/Subnetwork). Примеры: `HOST IP '192.168.0.0/16'`, `HOST IP '2001:DB8::/32'`. Для использования в производстве указывайте только элементы `HOST IP` (IP-адреса и их маски), так как использование `host` и `host_regexp` может привести к дополнительной задержке.
- `HOST ANY` — Пользователь может подключаться из любого места. Это опция по умолчанию.
- `HOST LOCAL` — Пользователь может подключаться только локально.
- `HOST NAME 'fqdn'` — Хост пользователя можно указать как FQDN. Например, `HOST NAME 'mysite.com'`.
- `HOST REGEXP 'regexp'` — Вы можете использовать регулярные выражения [pcre](http://www.pcre.org/) при указании хостов пользователей. Например, `HOST REGEXP '.*\.mysite\.com'`.
- `HOST LIKE 'template'` — Позволяет использовать оператор [LIKE](/sql-reference/functions/string-search-functions#like) для фильтрации хостов пользователей. Например, `HOST LIKE '%'` эквивалентно `HOST ANY`, `HOST LIKE '%.mysite.com'` фильтрует все хосты в домене `mysite.com`.

Другой способ указания хоста — использовать синтаксис `@` после имени пользователя. Примеры:

- `CREATE USER mira@'127.0.0.1'` — Эквивалентно синтаксису `HOST IP`.
- `CREATE USER mira@'localhost'` — Эквивалентно синтаксису `HOST LOCAL`.
- `CREATE USER mira@'192.168.%.%'` — Эквивалентно синтаксису `HOST LIKE`.

:::tip
ClickHouse рассматривает `user_name@'address'` как имя пользователя в целом. Таким образом, технически вы можете создать несколько пользователей с одинаковым `user_name` и разными конструкциями после `@`. Однако мы не рекомендуем этого делать.
:::

## Клаузула VALID UNTIL {#valid-until-clause}

Позволяет указать дату истечения срока действия и, опционально, время для метода аутентификации. Она принимает строку в качестве параметра. Рекомендуется использовать формат `YYYY-MM-DD [hh:mm:ss] [timezone]` для даты и времени. По умолчанию этот параметр равен `'infinity'`.
Клаузулу `VALID UNTIL` можно указывать только вместе с методом аутентификации, за исключением случая, когда в запросе не указан ни один метод аутентификации. В этом случае клаузула `VALID UNTIL` будет применяться ко всем существующим методам аутентификации.

Примеры:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## Клаузула GRANTEES {#grantees-clause}

Указывает пользователей или роли, которым разрешено получать [привилегии](../../../sql-reference/statements/grant.md#privileges) от этого пользователя при условии, что у этого пользователя также есть все необходимые права, предоставленные с помощью [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Опции клаузулы `GRANTEES`:

- `user` — Указывает пользователя, которому этот пользователь может предоставлять привилегии.
- `role` — Указывает роль, которой этот пользователь может предоставлять привилегии.
- `ANY` — Этот пользователь может предоставлять привилегии любому. Это параметр по умолчанию.
- `NONE` — Этот пользователь не может предоставлять привилегии никому.

Вы можете исключить любого пользователя или роль, используя выражение `EXCEPT`. Например, `CREATE USER user1 GRANTEES ANY EXCEPT user2`. Это означает, что если у `user1` есть какие-либо привилегии, предоставленные с помощью `GRANT OPTION`, он сможет предоставить эти привилегии кому угодно, кроме `user2`.

## Примеры {#examples-1}

Создайте учетную запись пользователя `mira`, защищенную паролем `qwerty`:

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` должен запускать клиентское приложение на хосте, на котором работает сервер ClickHouse.

Создайте учетную запись пользователя `john`, назначьте роли и сделайте эти роли по умолчанию:

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

Создайте учетную запись пользователя `john` и сделайте все его будущие роли по умолчанию:

```sql
CREATE USER john DEFAULT ROLE ALL;
```

Когда какой-либо роли в будущем будет назначена роль `john`, она станет по умолчанию автоматически.

Создайте учетную запись пользователя `john` и сделайте все его будущие роли по умолчанию, исключая `role1` и `role2`:

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

Создайте учетную запись пользователя `john` и позвольте ему предоставлять свои привилегии пользователю с учетной записью `jack`:

```sql
CREATE USER john GRANTEES jack;
```

Используйте параметр запроса для создания учетной записи пользователя `john`:

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```