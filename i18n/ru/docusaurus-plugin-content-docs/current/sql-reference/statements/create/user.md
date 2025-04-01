---
description: 'Документация для пользователей'
sidebar_label: 'ПОЛЬЗОВАТЕЛЬ'
sidebar_position: 39
slug: /sql-reference/statements/create/user
title: 'СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ'
---

Создает [учетные записи пользователей](../../../guides/sre/user-management/index.md#user-account-management).

Синтаксис:

```sql
СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ [ЕСЛИ НЕ СУЩЕСТВУЕТ | ИЛИ ЗАМЕНИТЬ] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [НЕ УДИДЕНТИФИЦИРОВАН | ИДЕНТИФИЦИРОВАН {[С {plaintext_password | sha256_password | sha256_hash | double_sha1_password | double_sha1_hash}] ПО {'password' | 'hash'}} | БЕЗ ПАРОЛЯ | {С ldap SERVER 'server_name'} | {С kerberos [REALM 'realm']} | {С ssl_certificate CN 'common_name' | SAN 'TYPE:subject_alt_name'} | {С ssh_key ПО KEY 'public_key' TYPE 'ssh-rsa|...'} | {С http SERVER 'server_name' [SCHEME 'Basic']} [ДЕЙСТВИТЕЛЬНО ДО datetime] 
    [, {[{plaintext_password | sha256_password | sha256_hash | ...}] ПО {'password' | 'hash'}} | {ldap SERVER 'server_name'} | {...} | ... [,...]]]
    [HOST {LOCAL | NAME 'name' | REGEXP 'name_regexp' | IP 'address' | LIKE 'pattern'} [,...] | ANY | NONE]
    [ДЕЙСТВИТЕЛЬНО ДО datetime]
    [В access_storage_type]
    [DEFAULT ROLE role [,...]]
    [DEFAULT DATABASE database | NONE]
    [GRANTEES {user | role | ANY | NONE} [,...] [EXCEPT {user | role} [,...]]]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [READONLY | WRITABLE] | PROFILE 'profile_name'] [,...]
```

Клавиша `ON CLUSTER` позволяет создавать пользователей на кластере, см. [Распределенный DDL](../../../sql-reference/distributed-ddl.md).

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

Требования к сложности пароля могут быть отредактированы в [config.xml](/operations/configuration-files). Ниже представлен пример конфигурации, которая требует, чтобы пароли содержали не менее 12 символов и хотя бы 1 цифру. Каждое правило сложности пароля требует регулярное выражение для сопоставления с паролями и описание правила.

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>содержать не менее 12 символов</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>содержать хотя бы 1 числовой символ</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
В ClickHouse Cloud по умолчанию, пароли должны соответствовать следующим требованиям сложности:
- Содержать не менее 12 символов
- Содержать хотя бы 1 числовой символ
- Содержать хотя бы 1 заглавный символ
- Содержать хотя бы 1 строчный символ
- Содержать хотя бы 1 специальный символ
:::

## Примеры {#examples}

1. Следующее имя пользователя — `name1` и не требует пароля — что, очевидно, не обеспечивает много безопасности:

    ```sql
    СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name1 НЕ ИДЕНТИФИЦИРОВАН
    ```

2. Чтобы указать открытый пароль:

    ```sql
    СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name2 ИДЕНТИФИЦИРОВАН С помощью plaintext_password BY 'my_password'
    ```

    :::tip
    Пароль хранится в текстовом файле SQL в `/var/lib/clickhouse/access`, поэтому использовать `plaintext_password` не рекомендуется. Попробуйте вместо этого `sha256_password`, как показано далее...
    :::

3. Наиболее распространенным вариантом является использование пароля, который хешируется с помощью SHA-256. ClickHouse сам хеширует пароль, когда вы указываете `IDENTIFIED WITH sha256_password`. Например:

    ```sql
    СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name3 ИДЕНТИФИЦИРОВАН С помощью sha256_password BY 'my_password'
    ```

    Пользователь `name3` теперь может войти, используя `my_password`, но пароль хранится как хешированное значение выше. Следующий SQL файл был создан в `/var/lib/clickhouse/access` и будет выполнен при старте сервера:

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    Если вы уже создали значение хеша и соответствующее значение соли для имени пользователя, вы можете использовать `IDENTIFIED WITH sha256_hash BY 'hash'` или `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`. Для идентификации с помощью `sha256_hash` с использованием `SALT` — хеш должен быть вычислен из конкатенации 'password' и 'salt'.
    :::

4. `double_sha1_password` обычно не требуется, но может быть полезным при работе с клиентами, которые этого требуют (например, интерфейс MySQL):

    ```sql
    СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name4 ИДЕНТИФИЦИРОВАН С помощью double_sha1_password BY 'my_password'
    ```

    ClickHouse генерирует и выполняет следующий запрос:

    ```response
    СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name4 ИДЕНТИФИЦИРОВАН С помощью double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. `bcrypt_password` — самый безопасный вариант для хранения паролей. Он использует алгоритм [bcrypt](https://en.wikipedia.org/wiki/Bcrypt), который устойчив к атакам грубой силы, даже если хеш пароля скомпрометирован.

    ```sql
    СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name5 ИДЕНТИФИЦИРОВАН С помощью bcrypt_password BY 'my_password'
    ```

    Длина пароля с этим методом ограничена 72 символами. Параметр рабочего фактора bcrypt, который определяет количество вычислений и времени, необходимого для вычисления хеша и проверки пароля, можно изменить в конфигурации сервера:

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    Рабочий фактор должен находиться в пределах от 4 до 31, со значением по умолчанию равным 12.

6. Тип пароля также можно опустить:

    ```sql
    СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name6 ИДЕНТИФИЦИРОВАН ПО 'my_password'
    ```

    В этом случае ClickHouse использует тип пароля по умолчанию, указанный в конфигурации сервера:

    ```xml
    <default_password_type>sha256_password</default_password_type>
    ```

    Доступные типы паролей: `plaintext_password`, `sha256_password`, `double_sha1_password`.

7. Можно указать несколько методов аутентификации: 

   ```sql
   СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ user1 ИДЕНТИФИЦИРОВАН С помощью plaintext_password BY '1', bcrypt_password BY '2', plaintext_password BY '3'
   ```

Примечания:
1. Более ранние версии ClickHouse могут не поддерживать синтаксис нескольких методов аутентификации. Поэтому, если сервер ClickHouse содержит таких пользователей и переходит на версию, которая этого не поддерживает, такие пользователи станут недоступными, и некоторые операции, связанные с пользователями, будут нарушены. Для плавного перехода на более раннюю версию все пользователи должны содержать единственный метод аутентификации перед понижением версии. В противном случае, если сервер был понижен без должной процедуры, неисправные пользователи должны быть удалены.
2. `no_password` не может сосуществовать с другими методами аутентификации по соображениям безопасности. Поэтому вы можете указать `no_password` только в том случае, если это единственный метод аутентификации в запросе.

## Хост пользователя {#user-host}

Хост пользователя — это хост, с которого можно установить соединение с сервером ClickHouse. Хост можно указать в разделе `HOST` запроса следующими способами:

- `HOST IP 'ip_address_or_subnetwork'` — Пользователь может подключаться к серверу ClickHouse только с указанного IP-адреса или [подсети](https://en.wikipedia.org/wiki/Subnetwork). Примеры: `HOST IP '192.168.0.0/16'`, `HOST IP '2001:DB8::/32'`. Для использования в производственной среде следует указывать только элементы `HOST IP` (IP-адреса и их маски), так как использование `host` и `host_regexp` может вызвать дополнительную задержку.
- `HOST ANY` — Пользователь может подключаться из любого места. Это значение по умолчанию.
- `HOST LOCAL` — Пользователь может подключаться только локально.
- `HOST NAME 'fqdn'` — Хост пользователя можно указать как FQDN. Например, `HOST NAME 'mysite.com'`.
- `HOST REGEXP 'regexp'` — Вы можете использовать регулярные выражения [pcre](http://www.pcre.org/) при указании хостов пользователей. Например, `HOST REGEXP '.*\.mysite\.com'`.
- `HOST LIKE 'template'` — Позволяет использовать оператор [LIKE](/sql-reference/functions/string-search-functions#like) для фильтрации хостов пользователей. Например, `HOST LIKE '%'` эквивалентен `HOST ANY`, `HOST LIKE '%.mysite.com'` фильтрует все хосты в домене `mysite.com`.

Другой способ указать хост — использовать синтаксис `@` после имени пользователя. Примеры:

- `СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ mira@'127.0.0.1'` — Эквивалентно синтаксису `HOST IP`.
- `СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ mira@'localhost'` — Эквивалентно синтаксису `HOST LOCAL`.
- `СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ mira@'192.168.%.%'` — Эквивалентно синтаксису `HOST LIKE`.

:::tip
ClickHouse рассматривает `user_name@'address'` как имя пользователя в целом. Таким образом, технически вы можете создать нескольких пользователей с одинаковым `user_name` и различными конструкциями после `@`. Однако мы не рекомендуем это делать.
:::

## Клавиша VALID UNTIL {#valid-until-clause}

Позволяет указать дату истечения срока действия и, при необходимости, время для метода аутентификации. Она принимает строку в качестве параметра. Рекомендуется использовать формат `YYYY-MM-DD [hh:mm:ss] [timezone]` для даты и времени. По умолчанию этот параметр равен `'infinity'`. 
Клавиша `VALID UNTIL` может быть указана только вместе с методом аутентификации, за исключением случая, когда в запросе не указан метод аутентификации. В этом сценарии клаузула `VALID UNTIL` будет применена ко всем существующим методам аутентификации.

Примеры:

- `СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name1 VALID UNTIL '2025-01-01'`
- `СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name1 VALID UNTIL 'infinity'`
- ```СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ name1 ИДЕНТИФИЦИРОВАН С помощью plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## Клавиша GRANTEES {#grantees-clause}

Указывает пользователей или роли, которым разрешено получать [привилегии](../../../sql-reference/statements/grant.md#privileges) от этого пользователя при условии, что у этого пользователя также есть все необходимые права, предоставленные с помощью [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Опции клавиши `GRANTEES`:

- `user` — Указывает пользователя, которому этот пользователь может предоставлять привилегии.
- `role` — Указывает роль, которой этот пользователь может предоставлять привилегии.
- `ANY` — Этот пользователь может предоставлять привилегии кому угодно. Это значение по умолчанию.
- `NONE` — Этот пользователь не может предоставлять привилегии никому.

Вы можете исключить любого пользователя или роль, используя выражение `EXCEPT`. Например, `СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ user1 GRANTEES ANY EXCEPT user2`. Это означает, что если `user1` имеет определенные привилегии, предоставленные с помощью `GRANT OPTION`, он сможет предоставить эти привилегии всем, кроме `user2`.

## Примеры {#examples-1}

Создайте учетную запись пользователя `mira`, защищенную паролем `qwerty`:

```sql
СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ mira HOST IP '127.0.0.1' ИДЕНТИФИЦИРОВАН С помощью sha256_password BY 'qwerty';
```

`mira` должен запустить клиентское приложение на хосте, где работает сервер ClickHouse.

Создайте учетную запись пользователя `john`, назначьте ему роли и сделайте эти роли по умолчанию:

```sql
СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ john DEFAULT ROLE role1, role2;
```

Создайте учетную запись пользователя `john` и сделайте все его будущие роли по умолчанию:

```sql
СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ john DEFAULT ROLE ALL;
```

Когда в будущем какой-либо роли будет назначена роль `john`, она автоматически станет ролью по умолчанию.

Создайте учетную запись пользователя `john` и сделайте все его будущие роли по умолчанию, за исключением `role1` и `role2`:

```sql
СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ john DEFAULT ROLE ALL EXCEPT role1, role2;
```

Создайте учетную запись пользователя `john` и разрешите ему передавать свои привилегии пользователю с учетной записью `jack`:

```sql
СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ john GRANTEES jack;
```
