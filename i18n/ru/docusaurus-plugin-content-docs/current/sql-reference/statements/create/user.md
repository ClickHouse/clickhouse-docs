---
description: 'Документация по USER'
sidebar_label: 'USER'
sidebar_position: 39
slug: /sql-reference/statements/create/user
title: 'CREATE USER'
doc_type: 'reference'
---

Создаёт [учётные записи пользователей](../../../guides/sre/user-management/index.md#user-account-management).

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

Предложение `ON CLUSTER` позволяет создавать пользователей на кластере, см. [Распределённый DDL](../../../sql-reference/distributed-ddl.md).

## Идентификация {#identification}

Существует несколько способов идентификации пользователя:

* `IDENTIFIED WITH no_password`
* `IDENTIFIED WITH plaintext_password BY 'qwerty'`
* `IDENTIFIED WITH sha256_password BY 'qwerty'` или `IDENTIFIED BY 'password'`
* `IDENTIFIED WITH sha256_hash BY 'hash'` или `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
* `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
* `IDENTIFIED WITH double_sha1_hash BY 'hash'`
* `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
* `IDENTIFIED WITH bcrypt_hash BY 'hash'`
* `IDENTIFIED WITH ldap SERVER 'server_name'`
* `IDENTIFIED WITH kerberos` или `IDENTIFIED WITH kerberos REALM 'realm'`
* `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
* `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
* `IDENTIFIED WITH http SERVER 'http_server'` или `IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
* `IDENTIFIED BY 'qwerty'`

Требования к сложности паролей можно изменить в [config.xml](/operations/configuration-files). Ниже приведён пример конфигурации, который требует, чтобы пароли были длиной не менее 12 символов и содержали как минимум 1 цифру. Для каждого правила сложности пароля задаются регулярное выражение, по которому проверяются пароли, и описание правила.

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>должен содержать не менее 12 символов</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>должен содержать хотя бы 1 цифру</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
По умолчанию в ClickHouse Cloud пароли должны соответствовать следующим требованиям к сложности:

* Иметь длину не менее 12 символов
* Содержать как минимум 1 цифру
* Содержать как минимум 1 заглавную букву
* Содержать как минимум 1 строчную букву
* Содержать как минимум 1 специальный символ
  :::

## Примеры {#examples}

1. Следующее имя пользователя — `name1`, и для него не требуется пароль — что, очевидно, практически не обеспечивает безопасность:

    ```sql
    CREATE USER name1 NOT IDENTIFIED
    ```

2. Чтобы указать пароль в виде открытого текста:

    ```sql
    CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
    ```

    :::tip
    Пароль сохраняется в SQL-файле в `/var/lib/clickhouse/access`, поэтому использование `plaintext_password` — не лучшая идея. Вместо этого используйте `sha256_password`, как показано ниже...
    :::

3. Наиболее распространённый вариант — использовать пароль, хэшированный с помощью SHA-256. ClickHouse вычислит хэш пароля за вас, когда вы укажете `IDENTIFIED WITH sha256_password`. Например:

    ```sql
    CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
    ```

    Пользователь `name3` теперь может входить, используя `my_password`, но пароль хранится в виде хэшированного значения, приведённого выше. В `/var/lib/clickhouse/access` был создан следующий SQL-файл, который выполняется при запуске сервера:

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    Если вы уже вычислили значение хэша и соответствующее значение соли для имени пользователя, вы можете использовать `IDENTIFIED WITH sha256_hash BY 'hash'` или `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`. Для идентификации с `sha256_hash` с использованием `SALT` хэш должен быть вычислен из конкатенации 'password' и 'salt'.
    :::

4. Тип `double_sha1_password` обычно не требуется, но бывает полезен при работе с клиентами, которые его требуют (например, интерфейс MySQL):

    ```sql
    CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
    ```

    ClickHouse генерирует и выполняет следующий запрос:

    ```response
    CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. Тип `bcrypt_password` является самым безопасным вариантом хранения паролей. Он использует алгоритм [bcrypt](https://en.wikipedia.org/wiki/Bcrypt), который устойчив к атакам перебором, даже если хэш пароля скомпрометирован.

    ```sql
    CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
    ```

    Длина пароля при этом методе ограничена 72 символами. 
    Параметр work factor для bcrypt, определяющий объём вычислений и время, необходимое для вычисления хэша и проверки пароля, можно изменить в конфигурации сервера:

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    Значение work factor должно быть в диапазоне от 4 до 31, по умолчанию — 12.

   :::warning
   Для приложений с частой аутентификацией
   рассмотрите альтернативные методы аутентификации
   из-за вычислительных накладных расходов bcrypt при высоких значениях work factor.
   :::
6. 
6. Тип пароля также можно опустить:

    ```sql
    CREATE USER name6 IDENTIFIED BY 'my_password'
    ```

    В этом случае ClickHouse использует тип пароля по умолчанию, указанный в конфигурации сервера:

    ```xml
    <default_password_type>sha256_password</default_password_type>
    ```

    Доступные типы паролей: `plaintext_password`, `sha256_password`, `double_sha1_password`.

7. Можно указать несколько методов аутентификации: 

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
   ```

Примечания:
1. Более старые версии ClickHouse могут не поддерживать синтаксис с несколькими методами аутентификации. Поэтому, если на сервере ClickHouse есть пользователи с такими настройками и сервер понижен до версии, которая этого не поддерживает, эти пользователи станут недоступны, а некоторые операции, связанные с пользователями, перестанут работать. Чтобы выполнить понижение версии корректно, необходимо перед понижением настроить всех пользователей так, чтобы у каждого был только один метод аутентификации. Либо, если сервер был понижен без соблюдения предусмотренной процедуры, проблемных пользователей следует удалить.
2. `no_password` не может сосуществовать с другими методами аутентификации по соображениям безопасности. Поэтому вы можете указать
`no_password` только если это единственный метод аутентификации в запросе. 

## Хост пользователя {#user-host}

Хост пользователя — это хост, с которого может быть установлено соединение с сервером ClickHouse. Хост может быть указан в секции запроса `HOST` следующими способами:

- `HOST IP 'ip_address_or_subnetwork'` — Пользователь может подключаться к серверу ClickHouse только с указанного IP‑адреса или [подсети](https://en.wikipedia.org/wiki/Subnetwork). Примеры: `HOST IP '192.168.0.0/16'`, `HOST IP '2001:DB8::/32'`. Для использования в продакшене указывайте только элементы `HOST IP` (IP‑адреса и их маски), так как использование `host` и `host_regexp` может привести к дополнительным задержкам.
- `HOST ANY` — Пользователь может подключаться из любого места. Это вариант по умолчанию.
- `HOST LOCAL` — Пользователь может подключаться только локально.
- `HOST NAME 'fqdn'` — Хост пользователя может быть указан как FQDN. Например, `HOST NAME 'mysite.com'`.
- `HOST REGEXP 'regexp'` — Можно использовать регулярные выражения [PCRE](http://www.pcre.org/) при указании хостов пользователя. Например, `HOST REGEXP '.*\.mysite\.com'`.
- `HOST LIKE 'template'` — Позволяет использовать оператор [LIKE](/sql-reference/functions/string-search-functions#like) для фильтрации хостов пользователя. Например, `HOST LIKE '%'` эквивалентен `HOST ANY`, `HOST LIKE '%.mysite.com'` отбирает все хосты в домене `mysite.com`.

Другой способ указания хоста — использовать синтаксис `@` после имени пользователя. Примеры:

- `CREATE USER mira@'127.0.0.1'` — Эквивалентно синтаксису `HOST IP`.
- `CREATE USER mira@'localhost'` — Эквивалентно синтаксису `HOST LOCAL`.
- `CREATE USER mira@'192.168.%.%'` — Эквивалентно синтаксису `HOST LIKE`.

:::tip
ClickHouse рассматривает `user_name@'address'` как имя пользователя целиком. Таким образом, технически вы можете создать несколько пользователей с одинаковым `user_name` и разными конструкциями после `@`. Однако мы не рекомендуем делать это.
:::

## Оператор VALID UNTIL {#valid-until-clause}

Позволяет задать дату окончания срока действия и, при необходимости, время для метода аутентификации. В качестве параметра принимает строку. Рекомендуется использовать формат `YYYY-MM-DD [hh:mm:ss] [timezone]` для даты и времени. По умолчанию этот параметр имеет значение `'infinity'`.
Оператор `VALID UNTIL` может быть указан только вместе с методом аутентификации, за исключением случая, когда в запросе не задан ни один метод аутентификации. В этом случае оператор `VALID UNTIL` будет применён ко всем существующим методам аутентификации.

Примеры:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01''`

## Клауза GRANTEES {#grantees-clause}

Указывает пользователей или роли, которым разрешено получать [привилегии](../../../sql-reference/statements/grant.md#privileges) от этого пользователя при условии, что этому пользователю также выданы все требуемые привилегии с [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Варианты клаузы `GRANTEES`:

- `user` — Указывает пользователя, которому этот пользователь может выдавать привилегии.
- `role` — Указывает роль, которой этот пользователь может выдавать привилегии.
- `ANY` — Этот пользователь может выдавать привилегии кому угодно. Значение по умолчанию.
- `NONE` — Этот пользователь не может выдавать привилегии никому.

Вы можете исключить любого пользователя или роль с помощью выражения `EXCEPT`. Например, `CREATE USER user1 GRANTEES ANY EXCEPT user2`. Это означает, что если у `user1` есть некоторые привилегии, выданные с `GRANT OPTION`, он сможет выдавать эти привилегии кому угодно, кроме `user2`.

## Примеры {#examples-1}

Создайте учетную запись пользователя `mira` с паролем `qwerty`:

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

Клиентское приложение `mira` следует запускать на хосте, где запущен сервер ClickHouse.

Создайте учетную запись пользователя `john`, назначьте ей роли и сделайте эти роли ролями по умолчанию:

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

Создайте учетную запись пользователя `john` и назначьте все его будущие роли ролями по умолчанию:

```sql
CREATE USER john DEFAULT ROLE ALL;
```

Когда в дальнейшем пользователю `john` будет назначена какая-либо роль, она автоматически станет ролью по умолчанию.

Создайте учетную запись пользователя `john` и сделайте все его будущие роли ролями по умолчанию, за исключением ролей `role1` и `role2`:

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

Создайте учётную запись пользователя `john` и разрешите ему передавать свои привилегии пользователю `jack`:

```sql
CREATE USER john GRANTEES jack;
```

Используйте параметр запроса для создания учетной записи пользователя `john`:

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```
