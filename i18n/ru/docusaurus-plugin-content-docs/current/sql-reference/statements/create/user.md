---
description: 'Документация по пользователю'
sidebar_label: 'ПОЛЬЗОВАТЕЛЬ'
sidebar_position: 39
slug: /sql-reference/statements/create/user
title: 'CREATE USER'
doc_type: 'reference'
---

Создаёт [учетные записи пользователей](../../../guides/sre/user-management/index.md#user-account-management).

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

Клауза `ON CLUSTER` позволяет создавать пользователей на кластере, см. [Distributed DDL](../../../sql-reference/distributed-ddl.md).


## Идентификация {#identification}

Существует несколько способов идентификации пользователя:

- `IDENTIFIED WITH no_password`
- `IDENTIFIED WITH plaintext_password BY 'qwerty'`
- `IDENTIFIED WITH sha256_password BY 'qwerty'` or `IDENTIFIED BY 'password'`
- `IDENTIFIED WITH sha256_hash BY 'hash'` or `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
- `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
- `IDENTIFIED WITH double_sha1_hash BY 'hash'`
- `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
- `IDENTIFIED WITH bcrypt_hash BY 'hash'`
- `IDENTIFIED WITH ldap SERVER 'server_name'`
- `IDENTIFIED WITH kerberos` or `IDENTIFIED WITH kerberos REALM 'realm'`
- `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
- `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
- `IDENTIFIED WITH http SERVER 'http_server'` or `IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
- `IDENTIFIED BY 'qwerty'`

Требования к сложности пароля можно настроить в файле [config.xml](/operations/configuration-files). Ниже приведен пример конфигурации, требующей, чтобы пароли содержали не менее 12 символов и включали хотя бы 1 цифру. Каждое правило сложности пароля требует регулярное выражение для проверки паролей и описание правила.

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>содержать не менее 12 символов</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>содержать не менее 1 цифры</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
В ClickHouse Cloud по умолчанию пароли должны соответствовать следующим требованиям сложности:

- Содержать не менее 12 символов
- Содержать не менее 1 цифры
- Содержать не менее 1 символа в верхнем регистре
- Содержать не менее 1 символа в нижнем регистре
- Содержать не менее 1 специального символа
  :::


## Примеры {#examples}

1. Следующее имя пользователя — `name1`, и оно не требует пароля, что, очевидно, не обеспечивает достаточной безопасности:

   ```sql
   CREATE USER name1 NOT IDENTIFIED
   ```

2. Чтобы указать пароль в виде открытого текста:

   ```sql
   CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
   ```

   :::tip
   Пароль хранится в текстовом SQL-файле в `/var/lib/clickhouse/access`, поэтому использовать `plaintext_password` не рекомендуется. Вместо этого используйте `sha256_password`, как показано далее...
   :::

3. Наиболее распространённый вариант — использовать пароль, хешированный с помощью SHA-256. ClickHouse автоматически хеширует пароль при указании `IDENTIFIED WITH sha256_password`. Например:

   ```sql
   CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
   ```

   Пользователь `name3` теперь может войти в систему, используя `my_password`, но пароль хранится в виде хешированного значения, указанного выше. Следующий SQL-файл был создан в `/var/lib/clickhouse/access` и выполняется при запуске сервера:

   ```bash
   /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
   ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
   ```

   :::tip
   Если вы уже создали хеш-значение и соответствующее значение соли для имени пользователя, то можете использовать `IDENTIFIED WITH sha256_hash BY 'hash'` или `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`. При идентификации с помощью `sha256_hash` с использованием `SALT` хеш должен быть вычислен из конкатенации 'password' и 'salt'.
   :::

4. Метод `double_sha1_password` обычно не требуется, но может быть полезен при работе с клиентами, которым он необходим (например, интерфейс MySQL):

   ```sql
   CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
   ```

   ClickHouse генерирует и выполняет следующий запрос:

   ```response
   CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
   ```

5. Метод `bcrypt_password` является наиболее безопасным вариантом для хранения паролей. Он использует алгоритм [bcrypt](https://en.wikipedia.org/wiki/Bcrypt), который устойчив к атакам методом перебора, даже если хеш пароля скомпрометирован.

   ```sql
   CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
   ```

   При использовании этого метода длина пароля ограничена 72 символами.
   Параметр фактора работы bcrypt, который определяет объём вычислений и время, необходимое для вычисления хеша и проверки пароля, можно изменить в конфигурации сервера:

   ```xml
   <bcrypt_workfactor>12</bcrypt_workfactor>
   ```

   Фактор работы должен находиться в диапазоне от 4 до 31, значение по умолчанию — 12.

   :::warning
   Для приложений с высокочастотной аутентификацией
   рассмотрите альтернативные методы аутентификации из-за
   вычислительных затрат bcrypt при более высоких факторах работы.
   :::

6.
7. Тип пароля также можно опустить:

   ```sql
   CREATE USER name6 IDENTIFIED BY 'my_password'
   ```

   В этом случае ClickHouse будет использовать тип пароля по умолчанию, указанный в конфигурации сервера:

   ```xml
   <default_password_type>sha256_password</default_password_type>
   ```

   Доступные типы паролей: `plaintext_password`, `sha256_password`, `double_sha1_password`.

8. Можно указать несколько методов аутентификации:

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
   ```


Примечания:
1. Более старые версии ClickHouse могут не поддерживать синтаксис нескольких методов аутентификации. Поэтому, если сервер ClickHouse содержит таких пользователей и его версия понижается до версии, которая этого не поддерживает, эти пользователи станут непригодными к использованию, и некоторые операции, связанные с пользователями, перестанут работать. Чтобы выполнить понижение версии корректно, перед ним необходимо задать всем пользователям только один метод аутентификации. В противном случае, если сервер был понижен без надлежащей процедуры, проблемных пользователей следует удалить.
2. `no_password` не может сосуществовать с другими методами аутентификации по соображениям безопасности. Поэтому вы можете указывать
`no_password` только в том случае, если это единственный метод аутентификации в запросе. 



## Хост пользователя {#user-host}

Хост пользователя — это хост, с которого может быть установлено соединение с сервером ClickHouse. Хост можно указать в секции запроса `HOST` следующими способами:

- `HOST IP 'ip_address_or_subnetwork'` — Пользователь может подключаться к серверу ClickHouse только с указанного IP-адреса или из указанной [подсети](https://en.wikipedia.org/wiki/Subnetwork). Примеры: `HOST IP '192.168.0.0/16'`, `HOST IP '2001:DB8::/32'`. Для использования в production-среде указывайте только элементы `HOST IP` (IP-адреса и их маски), поскольку использование `host` и `host_regexp` может приводить к дополнительным задержкам.
- `HOST ANY` — Пользователь может подключаться из любого расположения. Это опция по умолчанию.
- `HOST LOCAL` — Пользователь может подключаться только локально.
- `HOST NAME 'fqdn'` — Хост пользователя можно указать как FQDN. Например, `HOST NAME 'mysite.com'`.
- `HOST REGEXP 'regexp'` — При указании хостов пользователей можно использовать регулярные выражения [pcre](http://www.pcre.org/). Например, `HOST REGEXP '.*\.mysite\.com'`.
- `HOST LIKE 'template'` — Позволяет использовать оператор [LIKE](/sql-reference/functions/string-search-functions#like) для фильтрации хостов пользователей. Например, `HOST LIKE '%'` эквивалентен `HOST ANY`, `HOST LIKE '%.mysite.com'` фильтрует все хосты в домене `mysite.com`.

Другой способ указания хоста — использование синтаксиса `@` после имени пользователя. Примеры:

- `CREATE USER mira@'127.0.0.1'` — Эквивалентно синтаксису `HOST IP`.
- `CREATE USER mira@'localhost'` — Эквивалентно синтаксису `HOST LOCAL`.
- `CREATE USER mira@'192.168.%.%'` — Эквивалентно синтаксису `HOST LIKE`.

:::tip
ClickHouse рассматривает `user_name@'address'` как имя пользователя целиком. Таким образом, технически можно создать несколько пользователей с одинаковым `user_name` и разными конструкциями после `@`. Однако мы не рекомендуем так делать.
:::


## Секция VALID UNTIL {#valid-until-clause}

Позволяет указать дату истечения срока действия и, при необходимости, время для метода аутентификации. Принимает строку в качестве параметра. Рекомендуется использовать формат `YYYY-MM-DD [hh:mm:ss] [timezone]` для даты и времени. По умолчанию этот параметр имеет значение `'infinity'`.
Секция `VALID UNTIL` может быть указана только вместе с методом аутентификации, за исключением случая, когда метод аутентификации не указан в запросе. В этом случае секция `VALID UNTIL` будет применена ко всем существующим методам аутентификации.

Примеры:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ``CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'``
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01''`


## Секция GRANTEES {#grantees-clause}

Определяет пользователей или роли, которым разрешено получать [привилегии](../../../sql-reference/statements/grant.md#privileges) от данного пользователя при условии, что у этого пользователя также есть все необходимые права доступа, предоставленные с опцией [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Параметры секции `GRANTEES`:

- `user` — Указывает пользователя, которому данный пользователь может предоставлять привилегии.
- `role` — Указывает роль, которой данный пользователь может предоставлять привилегии.
- `ANY` — Данный пользователь может предоставлять привилегии любому пользователю. Это значение по умолчанию.
- `NONE` — Данный пользователь не может предоставлять привилегии никому.

Можно исключить любого пользователя или роль с помощью выражения `EXCEPT`. Например, `CREATE USER user1 GRANTEES ANY EXCEPT user2`. Это означает, что если у `user1` есть привилегии, предоставленные с опцией `GRANT OPTION`, он сможет предоставить эти привилегии любому пользователю, кроме `user2`.


## Примеры {#examples-1}

Создать учетную запись пользователя `mira`, защищенную паролем `qwerty`:

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

Пользователь `mira` должен запускать клиентское приложение на хосте, где запущен сервер ClickHouse.

Создать учетную запись пользователя `john`, назначить ему роли и сделать эти роли ролями по умолчанию:

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

Создать учетную запись пользователя `john` и сделать все его будущие роли ролями по умолчанию:

```sql
CREATE USER john DEFAULT ROLE ALL;
```

Когда в будущем пользователю `john` будет назначена какая-либо роль, она автоматически станет ролью по умолчанию.

Создать учетную запись пользователя `john` и сделать все его будущие роли ролями по умолчанию, за исключением `role1` и `role2`:

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

Создать учетную запись пользователя `john` и разрешить ему передавать свои привилегии пользователю с учетной записью `jack`:

```sql
CREATE USER john GRANTEES jack;
```

Использовать параметр запроса для создания учетной записи пользователя `john`:

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```
