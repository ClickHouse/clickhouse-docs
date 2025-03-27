---
description: 'Настройки для конфигурирования пользователей и ролей.'
sidebar_label: 'Настройки пользователей'
sidebar_position: 63
slug: /operations/settings/settings-users
title: 'Настройки пользователей и ролей'
---


# Настройки пользователей и ролей

Секция `users` в файле конфигурации `users.xml` содержит настройки пользователей.

:::note
ClickHouse также поддерживает [SQL-управляемый рабочий процесс](/operations/access-rights#access-control-usage) для управления пользователями. Мы рекомендуем использовать его.
:::

Структура секции `users`:

```xml
<users>
    <!-- Если имя пользователя не указано, используется пользователь 'default'. -->
    <user_name>
        <password></password>
        <!-- Или -->
        <password_sha256_hex></password_sha256_hex>

        <ssh_keys>
            <ssh_key>
                <type>ssh-ed25519</type>
                <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
            </ssh_key>
            <ssh_key>
                <type>ecdsa-sha2-nistp256</type>
                <base64_key>AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBNxeV2uN5UY6CUbCzTA1rXfYimKQA5ivNIqxdax4bcMXz4D0nSk2l5E1TkR5mG8EBWtmExSPbcEPJ8V7lyWWbA8=</base64_key>
            </ssh_key>
            <ssh_key>
                <type>ssh-rsa</type>
                <base64_key>AAAAB3NzaC1yc2EAAAADAQABAAABgQCpgqL1SHhPVBOTFlOm0pu+cYBbADzC2jL41sPMawYCJHDyHuq7t+htaVVh2fRgpAPmSEnLEC2d4BEIKMtPK3bfR8plJqVXlLt6Q8t4b1oUlnjb3VPA9P6iGcW7CV1FBkZQEVx8ckOfJ3F+kI5VsrRlEDgiecm/C1VPl0/9M2llW/mPUMaD65cM9nlZgM/hUeBrfxOEqM11gDYxEZm1aRSbZoY4dfdm3vzvpSQ6lrCrkjn3X2aSmaCLcOWJhfBWMovNDB8uiPuw54g3ioZ++qEQMlfxVsqXDGYhXCrsArOVuW/5RbReO79BvXqdssiYShfwo+GhQ0+aLWMIW/jgBkkqx/n7uKLzCMX7b2F+aebRYFh+/QXEj7SnihdVfr9ud6NN3MWzZ1ltfIczlEcFLrLJ1Yq57wW6wXtviWh59WvTWFiPejGjeSjjJyqqB49tKdFVFuBnIU5u/bch2DXVgiAEdQwUrIp1ACoYPq22HFFAYUJrL32y7RxX3PGzuAv3LOc=</base64_key>
            </ssh_key>
        </ssh_keys>

        <access_management>0|1</access_management>

        <networks incl="networks" replace="replace">
        </networks>

        <profile>profile_name</profile>

        <quota>default</quota>
        <default_database>default</default_database>
        <databases>
            <database_name>
                <table_name>
                    <filter>expression</filter>
                </table_name>
            </database_name>
        </databases>
        
        <grants>
            <query>GRANT SELECT ON system.*</query>
        </grants>
    </user_name>
    <!-- Другие настройки пользователей -->
</users>
```

### user_name/password {#user-namepassword}

Пароль может быть указан в открытом виде или в SHA256 (в шестнадцатеричном формате).

- Чтобы задать пароль в открытом виде (**не рекомендуется**), поместите его в элемент `password`.

    Например, `<password>qwerty</password>`. Пароль может быть оставлен пустым.

<a id="password_sha256_hex"></a>

- Чтобы задать пароль с использованием его SHA256 хеша, поместите его в элемент `password_sha256_hex`.

    Например, `<password_sha256_hex>65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5</password_sha256_hex>`.

    Пример генерации пароля из оболочки:

          PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha256sum | tr -d '-'

    Первая строка результата — это пароль. Вторая строка — соответствующий SHA256 хеш.

<a id="password_double_sha1_hex"></a>

- Для совместимости с клиентами MySQL пароль может быть указан в двойном SHA1 хеш-форте. Поместите его в элемент `password_double_sha1_hex`.

    Например, `<password_double_sha1_hex>08b4a0f1de6ad37da17359e592c8d74788a83eb0</password_double_sha1_hex>`.

    Пример генерации пароля из оболочки:

          PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'

    Первая строка результата — это пароль. Вторая строка — соответствующий двойной SHA1 хеш.

### username/ssh-key {#user-sshkey}

Эта настройка позволяет аутентификацию с помощью SSH ключей.

Учитывая SSH ключ (созданный с помощью `ssh-keygen`) как
```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj john@example.com
```
Элемент `ssh_key` ожидается следующим образом:
```xml
<ssh_key>
     <type>ssh-ed25519</type>
     <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
 </ssh_key>
```

Замените `ssh-ed25519` на `ssh-rsa` или `ecdsa-sha2-nistp256` для других поддерживаемых алгоритмов.

### access_management {#access_management-user-setting}

Эта настройка включает или отключает использование SQL-управляемого [контроля доступа и управления аккаунтами](/operations/access-rights#access-control-usage) для пользователя.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

Значение по умолчанию: 0.

### grants {#grants-user-setting}

Эта настройка позволяет предоставлять любые права выбранному пользователю.
Каждый элемент списка должен быть запросом `GRANT`, без указания получателей.

Пример:

```xml
<user1>
    <grants>
        <query>GRANT SHOW ON *.*</query>
        <query>GRANT CREATE ON *.* WITH GRANT OPTION</query>
        <query>GRANT SELECT ON system.*</query>
    </grants>
</user1>
```

Эта настройка не может быть указана одновременно с
`dictionaries`, `access_management`, `named_collection_control`, `show_named_collections_secrets`
и `allow_databases` настройками.


### user_name/networks {#user-namenetworks}

Список сетей, из которых пользователь может подключаться к серверу ClickHouse.

Каждый элемент списка может иметь одну из следующих форм:

- `<ip>` — IP-адрес или маска сети.

    Примеры: `213.180.204.3`, `10.0.0.1/8`, `10.0.0.1/255.255.255.0`, `2a02:6b8::3`, `2a02:6b8::3/64`, `2a02:6b8::3/ffff:ffff:ffff:ffff::`.

- `<host>` — Имя хоста.

    Пример: `example01.host.ru`.

    Для проверки доступа выполняется DNS-запрос, и все возвращенные IP-адреса сравниваются с адресом пира.

- `<host_regexp>` — Регулярное выражение для имен хостов.

    Пример: `^example\d\d-\d\d-\d\.host\.ru$`

    Для проверки доступа выполняется [DNS PTR запрос](https://en.wikipedia.org/wiki/Reverse_DNS_lookup) для адреса пира, и затем применяется указанное регулярное выражение. Затем выполняется еще один DNS-запрос для результатов запроса PTR, и все полученные адреса сравниваются с адресом пира. Мы настоятельно рекомендуем, чтобы регулярное выражение заканчивалось на $.

Все результаты DNS запросов кэшируются до перезагрузки сервера.

**Примеры**

Чтобы открыть доступ пользователю из любой сети, укажите:

```xml
<ip>::/0</ip>
```

:::note
Открытие доступа из любой сети небезопасно, если у вас не настроен брандмауэр или сервер не подключен напрямую к Интернету.
:::

Чтобы открыть доступ только с локального хоста, укажите:

```xml
<ip>::1</ip>
<ip>127.0.0.1</ip>
```

### user_name/profile {#user-nameprofile}

Вы можете назначить профиль настроек для пользователя. Профили настроек конфигурируются в отдельной секции файла `users.xml`. Более подробную информацию см. в [Профили настроек](../../operations/settings/settings-profiles.md).

### user_name/quota {#user-namequota}

Квоты позволяют отслеживать или ограничивать использование ресурсов в течение периода времени. Квоты настраиваются в секции `quotas`
файла `users.xml`.

Вы можете назначить набор квот для пользователя. Для детального описания конфигурирования квот см. [Квоты](/operations/quotas).

### user_name/databases {#user-namedatabases}

В этой секции вы можете ограничить строки, которые возвращает ClickHouse для запросов `SELECT`, выполняемых текущим пользователем, тем самым реализуя базовую безопасность на уровне строк.

**Пример**

Следующая конфигурация заставляет пользователя `user1` видеть только строки таблицы `table1` в результате запросов `SELECT`, где значение поля `id` равно 1000.

```xml
<user1>
    <databases>
        <database_name>
            <table1>
                <filter>id = 1000</filter>
            </table1>
        </database_name>
    </databases>
</user1>
```

`filter` может быть любым выражением, дающим значение типа [UInt8](../../sql-reference/data-types/int-uint.md). Обычно оно содержит сравнения и логические операторы. Строки из `database_name.table1`, где фильтр дает 0, не возвращаются для этого пользователя. Фильтрация несовместима с операциями `PREWHERE` и отключает оптимизацию `WHERE→PREWHERE`.

## Роли {#roles}

Вы можете создать любые предопределенные роли с помощью секции `roles` файла конфигурации `user.xml`.

Структура секции `roles`:

```xml
<roles>
    <test_role>
        <grants>
            <query>GRANT SHOW ON *.*</query>
            <query>REVOKE SHOW ON system.*</query>
            <query>GRANT CREATE ON *.* WITH GRANT OPTION</query>
        </grants>
    </test_role>
</roles>
```

Эти роли также могут быть предоставлены пользователям из секции `users`:

```xml
<users>
    <user_name>
        ...
        <grants>
            <query>GRANT test_role</query>
        </grants>
    </user_name>
<users>
```
