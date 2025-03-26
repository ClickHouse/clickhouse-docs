---
description: 'Документация для Пользователя'
sidebar_label: 'ПОЛЬЗОВАТЕЛЬ'
sidebar_position: 39
slug: /sql-reference/statements/create/user
title: 'СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ'
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

`ON CLUSTER` позволяет создавать пользователей на кластере, см. [Распределенный DDL](../../../sql-reference/distributed-ddl.md).

## Идентификация {#identification}

Существует несколько способов идентификации пользователя:

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

Требования к сложности пароля можно изменить в [config.xml](/operations/configuration-files). Ниже приведен пример конфигурации, которая требует, чтобы пароли содержали не менее 12 символов и хотя бы 1 число. Каждое правило сложности пароля требует регулярное выражение для проверки паролей и описание правила.

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>содержать не менее 12 символов</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>содержать хотя бы 1 цифровой символ</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
В ClickHouse Cloud по умолчанию пароли должны соответствовать следующим требованиям сложности:
- Содержать не менее 12 символов
- Содержать хотя бы 1 цифровой символ
- Содержать хотя бы 1 заглавный символ
- Содержать хотя бы 1 строчный символ
- Содержать хотя бы 1 специальный символ
:::

## Примеры {#examples}

1. Следующее имя пользователя - `name1`, и для него не требуется пароль - что, очевидно, не обеспечивает большой безопасности:

    ```sql
    CREATE USER name1 NOT IDENTIFIED
    ```

2. Чтобы указать простой пароль:

    ```sql
    CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
    ```

    :::tip
    Пароль хранится в SQL текстовом файле в `/var/lib/clickhouse/access`, поэтому не рекомендуется использовать `plaintext_password`. Попробуйте `sha256_password`, как показано далее...
    :::

3. Наиболее распространенным вариантом является использование пароля, который хэшируется с помощью SHA-256. ClickHouse зашифрует пароль за вас, когда вы укажете `IDENTIFIED WITH sha256_password`. Например:

    ```sql
    CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
    ```

    Теперь пользователь `name3` может войти, используя `my_password`, но пароль хранится в виде хэшированного значения выше. В следующем SQL файле был создан файл в `/var/lib/clickhouse/access` и исполняется при запуске сервера:

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    Если вы уже создали хэш-значение и соответствующее соль для имени пользователя, тогда вы можете использовать `IDENTIFIED WITH sha256_hash BY 'hash'` или `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`. Для идентификации с `sha256_hash` с использованием `SALT` - хэш должен быть вычислен из конкатенации 'password' и 'salt'.
    :::

4. `double_sha1_password` обычно не требуется, но может быть полезен при работе с клиентами, которые этого требуют (например, интерфейс MySQL):

    ```sql
    CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
    ```

    ClickHouse сгенерирует и выполнит следующий запрос:

    ```response
    CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. `bcrypt_password` - самый безопасный вариант для хранения паролей. Он использует алгоритм [bcrypt](https://en.wikipedia.org/wiki/Bcrypt), который устойчив к атакам подбора пароля, даже если хэш пароля был скомпрометирован.

    ```sql
    CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
    ```

    Длина пароля ограничена 72 символами при этом методе. Параметр рабочей нагрузки bcrypt, который определяет количество вычислений и время, необходимое для вычисления хэша и проверки пароля, можно изменить в конфигурации сервера:

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    Рабочий фактор должен быть от 4 до 31, со значением по умолчанию 12.

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

Заметки:
1. Старые версии ClickHouse могут не поддерживать синтаксис нескольких методов аутентификации. Поэтому, если сервер ClickHouse содержит таких пользователей и будет понижен до версии, которая этого не поддерживает, такие пользователи станут невозможными, и некоторые операции, связанные с пользователями, будут нарушены. Для грациозного понижения необходимо установить для всех пользователей единственный метод аутентификации перед понижением. В противном случае, если сервер был понижен без надлежащей процедуры, дефектные пользователи должны быть удалены.
2. `no_password` не может сосуществовать с другими методами аутентификации по соображениям безопасности. Поэтому вы можете указать только `no_password`, если он является единственным методом аутентификации в запросе. 

## Хост Пользователя {#user-host}

Хост пользователя - это хост, с которого можно установить соединение с сервером ClickHouse. Хост можно указать в разделе `HOST` запроса следующими способами:

- `HOST IP 'ip_address_or_subnetwork'` — Пользователь может подключаться к серверу ClickHouse только с указанного IP-адреса или [подсети](https://en.wikipedia.org/wiki/Subnetwork). Примеры: `HOST IP '192.168.0.0/16'`, `HOST IP '2001:DB8::/32'`. Для использования в производстве указывайте только элементы `HOST IP` (IP-адреса и их маски), так как использование `host` и `host_regexp` может вызвать дополнительную задержку.
- `HOST ANY` — Пользователь может подключаться из любого места. Это настройка по умолчанию.
- `HOST LOCAL` — Пользователь может подключаться только локально.
- `HOST NAME 'fqdn'` — Хост пользователя может быть указан как FQDN. Например, `HOST NAME 'mysite.com'`.
- `HOST REGEXP 'regexp'` — Вы можете использовать регулярные выражения [pcre](http://www.pcre.org/) при указании хостов пользователей. Например, `HOST REGEXP '.*\.mysite\.com'`.
- `HOST LIKE 'template'` — Позволяет использовать оператор [LIKE](/sql-reference/functions/string-search-functions#like), чтобы отфильтровать хосты пользователей. Например, `HOST LIKE '%'` эквивалентно `HOST ANY`, `HOST LIKE '%.mysite.com'` фильтрует все хосты в домене `mysite.com`.

Еще один способ указать хост - использовать синтаксис `@`, следующий за именем пользователя. Примеры:

- `CREATE USER mira@'127.0.0.1'` — Эквивалентно синтаксису `HOST IP`.
- `CREATE USER mira@'localhost'` — Эквивалентно синтаксису `HOST LOCAL`.
- `CREATE USER mira@'192.168.%.%'` — Эквивалентно синтаксису `HOST LIKE`.

:::tip
ClickHouse рассматривает `user_name@'address'` как имя пользователя в целом. Таким образом, технически вы можете создавать несколько пользователей с одинаковым `user_name` и различными конструкциями после `@`. Однако мы не рекомендуем так поступать.
:::

## Условие VALID UNTIL {#valid-until-clause}

Позволяет вам указать дату истечения срока действия и, при необходимости, время для метода аутентификации. Принимает строку в качестве параметра. Рекомендуется использовать формат `YYYY-MM-DD [hh:mm:ss] [timezone]` для даты и времени. По умолчанию этот параметр равен `'infinity'`.
Условие `VALID UNTIL` может быть указано только вместе с методом аутентификации, за исключением случая, когда в запросе не был указан ни один метод аутентификации. В этом случае условие `VALID UNTIL` применяется ко всем существующим методам аутентификации.

Примеры:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## Условие GRANTEES {#grantees-clause}

Указывает пользователей или роли, которым разрешено получать [привилегии](../../../sql-reference/statements/grant.md#privileges) от этого пользователя при условии, что у этого пользователя также имеются все необходимые доступы, предоставленные с помощью [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Опции условия `GRANTEES`:

- `user` — Указывает пользователя, которому этот пользователь может предоставить привилегии.
- `role` — Указывает роль, которой этот пользователь может предоставить привилегии.
- `ANY` — Этот пользователь может предоставлять привилегии любому. Это настройка по умолчанию.
- `NONE` — Этот пользователь не может предоставлять привилегии никому.

Вы можете исключить любого пользователя или роль, используя выражение `EXCEPT`. Например, `CREATE USER user1 GRANTEES ANY EXCEPT user2`. Это означает, что если `user1` имеет некоторые привилегии, предоставленные с помощью `GRANT OPTION`, он сможет предоставить эти привилегии любому, кроме `user2`.

## Примеры {#examples-1}

Создать учетную запись пользователя `mira`, защищенную паролем `qwerty`:

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` должен запустить клиентское приложение на хосте, где работает сервер ClickHouse.

Создать учетную запись пользователя `john`, назначить ему роли и сделать эти роли по умолчанию:

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

Создать учетную запись пользователя `john` и сделать все его будущие роли по умолчанию:

```sql
CREATE USER john DEFAULT ROLE ALL;
```

Когда какая-либо роль будет назначена `john` в будущем, она станет по умолчанию автоматически.

Создать учетную запись пользователя `john` и сделать все его будущие роли по умолчанию, исключая `role1` и `role2`:

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

Создать учетную запись пользователя `john` и разрешить ему предоставлять свои привилегии пользователю с учетной записью `jack`:

```sql
CREATE USER john GRANTEES jack;
```
