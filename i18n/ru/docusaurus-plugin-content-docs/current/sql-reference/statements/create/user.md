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

## Идентификация \\{#identification\\}

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
По умолчанию в ClickHouse Cloud пароли должны соответствовать следующим требованиям к сложности:

* Иметь длину не менее 12 символов
* Содержать как минимум 1 цифру
* Содержать как минимум 1 заглавную букву
* Содержать как минимум 1 строчную букву
* Содержать как минимум 1 специальный символ
  :::

## Примеры \\{#examples\\}

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

## Хост пользователя \\{#user-host\\}

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

## Оператор VALID UNTIL \\{#valid-until-clause\\}

Позволяет задать дату окончания срока действия и, при необходимости, время для метода аутентификации. В качестве параметра принимает строку. Рекомендуется использовать формат `YYYY-MM-DD [hh:mm:ss] [timezone]` для даты и времени. По умолчанию этот параметр имеет значение `'infinity'`.
Оператор `VALID UNTIL` может быть указан только вместе с методом аутентификации, за исключением случая, когда в запросе не задан ни один метод аутентификации. В этом случае оператор `VALID UNTIL` будет применён ко всем существующим методам аутентификации.

Примеры:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01''`

## GRANTEES Clause \\{#grantees-clause\\}

Specifies users or roles which are allowed to receive [privileges](../../../sql-reference/statements/grant.md#privileges) from this user on the condition this user has also all required access granted with [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Options of the `GRANTEES` clause:

- `user` — Specifies a user this user can grant privileges to.
- `role` — Specifies a role this user can grant privileges to.
- `ANY` — This user can grant privileges to anyone. It's the default setting.
- `NONE` — This user can grant privileges to none.

You can exclude any user or role by using the `EXCEPT` expression. For example, `CREATE USER user1 GRANTEES ANY EXCEPT user2`. It means if `user1` has some privileges granted with `GRANT OPTION` it will be able to grant those privileges to anyone except `user2`.

## Examples \\{#examples-1\\}

Create the user account `mira` protected by the password `qwerty`:

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` should start client app at the host where the ClickHouse server runs.

Create the user account `john`, assign roles to it and make this roles default:

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

Create the user account `john` and make all his future roles default:

```sql
CREATE USER john DEFAULT ROLE ALL;
```

When some role is assigned to `john` in the future, it will become default automatically.

Create the user account `john` and make all his future roles default excepting `role1` and `role2`:

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

Create the user account `john` and allow him to grant his privileges to the user with `jack` account:

```sql
CREATE USER john GRANTEES jack;
```

Use a query parameter to create the user account `john`:

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```
