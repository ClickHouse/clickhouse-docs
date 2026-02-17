---
description: 'Параметры настройки пользователей и ролей.'
sidebar_label: 'Настройки пользователей'
sidebar_position: 63
slug: /operations/settings/settings-users
title: 'Настройки пользователей и ролей'
doc_type: 'reference'
---

# Настройки пользователей и ролей \{#users-and-roles-settings\}

Раздел `users` конфигурационного файла `users.xml` содержит настройки пользователей.

:::note
ClickHouse также поддерживает [SQL-управляемый подход](/operations/access-rights#access-control-usage) к управлению пользователями. Мы рекомендуем использовать его.
:::

Структура раздела `users`:

```xml
<users>
    <!-- If user name was not specified, 'default' user is used. -->
    <user_name>
        <password></password>
        <!-- Or -->
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
    <!-- Other users settings -->
</users>
```


### user_name/password \{#user-namepassword\}

Пароль может быть указан в открытом виде или в виде SHA256-хэша (в шестнадцатеричном формате).

- Чтобы задать пароль в открытом виде (**не рекомендуется**), поместите его в элемент `password`.

    Например, `<password>qwerty</password>`. Пароль может быть пустым.

<a id="password_sha256_hex"></a>

- Чтобы задать пароль, используя его SHA256-хэш, поместите его в элемент `password_sha256_hex`.

Например, `<password_sha256_hex>65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5</password_sha256_hex>`.

Пример генерации пароля в командной оболочке:

```bash
    PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha256sum | tr -d '-'
    ```

Первая строка результата — это пароль. Вторая строка — соответствующий хэш SHA256.

<a id="password_double_sha1_hex" />

* Для совместимости с клиентами MySQL пароль может быть указан в виде двойного хэша SHA1. Поместите его в элемент `password_double_sha1_hex`.

  Например, `<password_double_sha1_hex>08b4a0f1de6ad37da17359e592c8d74788a83eb0</password_double_sha1_hex>`.

  Пример генерации пароля в командной оболочке:

  ```bash
    PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
    ```

  Первая строка результата — это пароль. Вторая строка — соответствующий двойной хэш SHA1.

### Конфигурация аутентификации с использованием TOTP \{#totp-authentication-configuration\}

Time-Based One-Time Password (TOTP) можно использовать для аутентификации пользователей ClickHouse путём генерации временных кодов доступа, действительных в течение ограниченного периода времени.
Этот метод аутентификации с использованием TOTP соответствует стандарту [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238), что делает его совместимым с популярными TOTP‑приложениями, такими как Google Authenticator, 1Password и аналогичными инструментами.
Он может быть настроен через конфигурационный файл `users.xml` в дополнение к аутентификации по паролю.
Пока не поддерживается в управлении доступом, основанном на SQL.

Чтобы аутентифицироваться с использованием TOTP, пользователи должны предоставить основной пароль вместе с одноразовым паролем, сгенерированным их TOTP‑приложением, через параметр командной строки `--one-time-password` или путём объединения его с основным паролем с использованием символа &#39;+&#39;.
Например, если основной пароль `some_password`, а сгенерированный TOTP‑код `345123`, пользователь может указать `--password some_password+345123` или `--password some_password --one-time-password 345123` при подключении к ClickHouse. Если пароль не указан, `clickhouse-client` запросит его интерактивно.

Чтобы включить аутентификацию TOTP для пользователя, настройте раздел `time_based_one_time_password` в `users.xml`. В этом разделе определяются параметры TOTP, такие как секретный ключ, период действия, количество цифр и хэш‑алгоритм.

**Пример**

````xml
<clickhouse>
    <!-- ... -->
    <users>
        <my_user>
            <!-- Primary password-based authentication: -->
            <password>some_password</password>
            <password_sha256_hex>1464acd6765f91fccd3f5bf4f14ebb7ca69f53af91b0a5790c2bba9d8819417b</password_sha256_hex>
            <!-- ... or any other supported authentication method ... -->

            <!-- TOTP authentication configuration -->
            <time_based_one_time_password>
                <secret>JBSWY3DPEHPK3PXP</secret>      <!-- Base32-encoded TOTP secret -->
                <period>30</period>                    <!-- Optional: OTP validity period in seconds -->
                <digits>6</digits>                     <!-- Optional: Number of digits in the OTP -->
                <algorithm>SHA1</algorithm>            <!-- Optional: Hash algorithm: SHA1, SHA256, SHA512 -->
            </time_based_one_time_password>
        </my_user>
    </users>
</clickhouse>

Parameters:

- secret - (Required) The base32-encoded secret key used to generate TOTP codes.
- period - Optional. Sets the validity period of each OTP in seconds. Must be a positive number not exceeding 120. Default is 30.
- digits - Optional. Specifies the number of digits in each OTP. Must be between 4 and 10. Default is 6.
- algorithm - Optional. Defines the hash algorithm for generating OTPs. Supported values are SHA1, SHA256, and SHA512. Default is SHA1.

Generating a TOTP Secret

To generate a TOTP-compatible secret for use with ClickHouse, run the following command in the terminal:

```bash
$ base32 -w32 < /dev/urandom | head -1
````

Эта команда создаст секрет в кодировке base32, который можно добавить в поле secret в users.xml.

Чтобы включить TOTP для конкретного пользователя, добавьте к любому существующему полю, использующему пароль (например, `password` или `password_sha256_hex`), ещё один раздел `time_based_one_time_password`.

Инструмент [qrencode](https://linux.die.net/man/1/qrencode) можно использовать для генерации QR-кода для секрета TOTP.

```bash
$ qrencode -t ansiutf8 'otpauth://totp/ClickHouse?issuer=ClickHouse&secret=JBSWY3DPEHPK3PXP'
```

После настройки TOTP для пользователя одноразовый пароль может использоваться как часть процесса аутентификации, описанного выше.


### username/ssh-key

Эта настройка позволяет аутентифицироваться с помощью SSH-ключей.

Имея SSH-ключ (сгенерированный с помощью `ssh-keygen`) следующего вида

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj john@example.com
```

Элемент `ssh_key` должен иметь следующий вид

```xml
<ssh_key>
     <type>ssh-ed25519</type>
     <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
 </ssh_key>
```

Замените `ssh-ed25519` на `ssh-rsa` или `ecdsa-sha2-nistp256` для использования других поддерживаемых алгоритмов.


### access&#95;management {#access&#95;management-user-setting}

Этот параметр включает или отключает использование управляемого с помощью SQL [контроля доступа и управления учетными записями](/operations/access-rights#access-control-usage) для пользователя.

Возможные значения:

* 0 — Отключено.
* 1 — Включено.

Значение по умолчанию: 0.

### grants

Этот параметр позволяет предоставлять любые права выбранному пользователю.
Каждый элемент списка должен представлять собой запрос `GRANT` без указания получателей прав.

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

Этот параметр не может быть указан одновременно с параметрами
`dictionaries`, `access_management`, `named_collection_control`, `show_named_collections_secrets`
и `allow_databases`.


### user_name/networks

Список сетей, из которых пользователь может подключаться к серверу ClickHouse.

Каждый элемент списка может иметь одну из следующих форм:

* `<ip>` — IP‑адрес или маска сети.

  Примеры: `213.180.204.3`, `10.0.0.1/8`, `10.0.0.1/255.255.255.0`, `2a02:6b8::3`, `2a02:6b8::3/64`, `2a02:6b8::3/ffff:ffff:ffff:ffff::`.

* `<host>` — Имя хоста.

  Пример: `example01.host.ru`.

  Чтобы проверить доступ, выполняется DNS‑запрос, и все возвращённые IP‑адреса сравниваются с адресом пира.

* `<host_regexp>` — Регулярное выражение для имён хостов.

  Пример: `^example\d\d-\d\d-\d\.host\.ru$`

  Чтобы проверить доступ, выполняется [DNS PTR‑запрос](https://en.wikipedia.org/wiki/Reverse_DNS_lookup) для адреса пира, после чего к результату применяется указанное регулярное выражение. Затем выполняется ещё один DNS‑запрос по результатам PTR‑запроса, и все полученные адреса сравниваются с адресом пира. Настоятельно рекомендуем, чтобы регулярное выражение заканчивалось символом $.

Все результаты DNS‑запросов кэшируются до перезапуска сервера.

**Примеры**

Чтобы открыть доступ пользователю из любой сети, укажите:

```xml
<ip>::/0</ip>
```

:::note
Открывать доступ из любой сети небезопасно, если только у вас не настроен должным образом брандмауэр или сервер не подключён напрямую к интернету.
:::

Чтобы открыть доступ только с localhost, укажите:

```xml
<ip>::1</ip>
<ip>127.0.0.1</ip>
```


### user&#95;name/profile {#user-nameprofile}

Вы можете назначить пользователю профиль настроек. Профили настроек конфигурируются в отдельном разделе файла `users.xml`. Для получения дополнительной информации см. [Профили настроек](../../operations/settings/settings-profiles.md).

### user_name/quota {#user-namequota}

Квоты позволяют отслеживать или ограничивать использование ресурсов за определённый период времени. Квоты настраиваются в разделе `quotas` конфигурационного файла `users.xml`.

Вы можете назначить пользователю набор квот. Подробное описание настройки квот см. в разделе [Quotas](/operations/quotas).

### user_name/databases

В этом разделе вы можете ограничить строки, возвращаемые ClickHouse для запросов `SELECT`, выполняемых текущим пользователем, тем самым реализуя базовую построчную безопасность (row-level security).

**Пример**

Следующая конфигурация гарантирует, что пользователь `user1` в результате запросов `SELECT` может видеть только строки таблицы `table1`, в которых значение поля `id` равно 1000.

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

`filter` может быть любым выражением, которое возвращает значение типа [UInt8](../../sql-reference/data-types/int-uint.md). Обычно оно содержит операторы сравнения и логические операторы. Строки из `database_name.table1`, для которых результат фильтра равен 0, этому пользователю не возвращаются. Фильтрация несовместима с операциями `PREWHERE` и отключает оптимизацию `WHERE→PREWHERE`.


## Роли

Вы можете создавать любые предопределённые роли, используя раздел `roles` в конфигурационном файле `user.xml`.

Структура раздела `roles`:

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

Эти роли также могут быть назначены пользователям из раздела `users`:

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
