---
sidebar_label: 'Настройка LDAP'
sidebar_position: 2
slug: /guides/sre/configuring-ldap
title: 'Настройка ClickHouse для использования LDAP для аутентификации и сопоставления ролей'
description: 'Описание процесса настройки ClickHouse для использования LDAP для аутентификации и сопоставления ролей'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# Настройка ClickHouse для использования LDAP для аутентификации и сопоставления ролей

<SelfManaged />

ClickHouse можно настроить для использования LDAP для аутентификации пользователей базы данных ClickHouse. Этот гид предоставляет простой пример интеграции ClickHouse с LDAP-системой, аутентифицирующей в общедоступном каталоге.

## 1. Настройка параметров подключения к LDAP в ClickHouse {#1-configure-ldap-connection-settings-in-clickhouse}

1. Проверьте соединение с этим общедоступным LDAP-сервером:
    ```bash
    $ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
    ```

    Ответ будет что-то вроде этого:
    ```response
    # extended LDIF
    #
    # LDAPv3
    # base <dc=example,dc=com> with scope subtree
    # filter: (objectclass=*)
    # requesting: ALL
    #

    # example.com
    dn: dc=example,dc=com
    objectClass: top
    objectClass: dcObject
    objectClass: organization
    o: example.com
    dc: example
    ...
    ```

2. Отредактируйте файл `config.xml` и добавьте следующее для настройки LDAP:
    ```xml
    <ldap_servers>
        <test_ldap_server>
        <host>ldap.forumsys.com</host>
        <port>389</port>
        <bind_dn>uid={user_name},dc=example,dc=com</bind_dn>
        <enable_tls>no</enable_tls>
        <tls_require_cert>never</tls_require_cert>
        </test_ldap_server>
    </ldap_servers>
    ```

    :::note
    Тег `<test_ldap_server>` является произвольной меткой для идентификации определенного LDAP-сервера.
    :::

    Вот основные настройки, используемые выше:

    | Параметр  | Описание                            | Пример               |
    |-----------|--------------------------------------|----------------------|
    | host      | имя хоста или IP LDAP-сервера       | ldap.forumsys.com    |
    | port      | порт каталога для LDAP-сервера      | 389                  |
    | bind_dn   | шаблонный путь к пользователям      | `uid={user_name},dc=example,dc=com`|
    | enable_tls| использование безопасного LDAP       | no                   |
    | tls_require_cert | требуется ли сертификат для соединения | never              |

    :::note
    В этом примере, поскольку публичный сервер использует порт 389 и не использует защищенный порт, мы отключаем TLS для демонстрационных целей.
    :::

    :::note
    Посмотрите [страницу документации LDAP](../../../operations/external-authenticators/ldap.md) для получения дополнительных сведений о настройках LDAP.
    :::

3. Добавьте секцию `<ldap>` в секцию `<user_directories>`, чтобы настроить сопоставление ролей пользователей. Эта секция определяет, когда пользователь аутентифицирован и какую роль он получит. В этом базовом примере любой пользователь, аутентифицирующий в LDAP, получит роль `scientists_role`, которая будет определена на следующем этапе в ClickHouse. Секция должна выглядеть примерно так:
    ```xml
    <user_directories>
        <users_xml>
            <path>users.xml</path>
        </users_xml>
        <local_directory>
            <path>/var/lib/clickhouse/access/</path>
        </local_directory>
        <ldap>
              <server>test_ldap_server</server>
              <roles>
                 <scientists_role />
              </roles>
              <role_mapping>
                 <base_dn>dc=example,dc=com</base_dn>
                 <search_filter>(&amp;(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))</search_filter>
                 <attribute>cn</attribute>
              </role_mapping>
        </ldap>
    </user_directories>
    ```

    Вот основные настройки, используемые выше:

    | Параметр    | Описание                                | Пример               |
    |-------------|------------------------------------------|----------------------|
    | server      | метка, определенная в предыдущем разделе ldap_servers | test_ldap_server     |
    | roles       | название ролей, определенных в ClickHouse, к которым будут сопоставляться пользователи | scientists_role      |
    | base_dn     | базовый путь для начала поиска групп с пользователем | dc=example,dc=com    |
    | search_filter| LDAP фильтр поиска для идентификации групп, которые будут выбраны для сопоставления пользователей | `(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))` |
    | attribute   | из какого имени атрибута должно возвращаться значение | cn                   |


4. Перезапустите сервер ClickHouse, чтобы применить настройки.

## 2. Настройка ролей и разрешений базы данных ClickHouse {#2-configure-clickhouse-database-roles-and-permissions}

:::note
Процедуры в этом разделе предполагают, что контроль доступа SQL и управление учетными записями в ClickHouse были включены. Для их включения смотрите [гид по SQL пользователям и ролям](index.md).
:::

1. Создайте роль в ClickHouse с тем же именем, которое использовалось в разделе сопоставления ролей файла `config.xml`:
    ```sql
    CREATE ROLE scientists_role;
    ```

2. Предоставьте необходимые привилегии роли. Следующее утверждение предоставляет администраторские привилегии любому пользователю, способному аутентифицироваться через LDAP:
    ```sql
    GRANT ALL ON *.* TO scientists_role;
    ```

## 3. Проверка конфигурации LDAP {#3-test-the-ldap-configuration}

1. Войдите, используя клиент ClickHouse:
    ```bash
    $ clickhouse-client --user einstein --password password
    ClickHouse client version 22.2.2.1.
    Connecting to localhost:9000 as user einstein.
    Connected to ClickHouse server version 22.2.2 revision 54455.

    chnode1 :)
    ```

    :::note
    Используйте команду `ldapsearch` на этапе 1, чтобы просмотреть всех доступных пользователей в каталоге, для всех пользователей пароль - `password`.
    :::

2. Проверьте, что пользователь был правильно сопоставлен с ролью `scientists_role` и имеет административные разрешения:
    ```sql
    SHOW DATABASES
    ```

    ```response
    Query id: 93b785ff-1482-4eda-95b0-b2d68b2c5e0f

    ┌─name───────────────┐
    │ INFORMATION_SCHEMA │
    │ db1_mysql          │
    │ db2                │
    │ db3                │
    │ db4_mysql          │
    │ db5_merge          │
    │ default            │
    │ information_schema │
    │ system             │
    └────────────────────┘

    9 rows in set. Elapsed: 0.004 sec.
    ```

## Резюме {#summary}
В этой статье были продемонстрированы основы настройки ClickHouse для аутентификации в LDAP-сервере, а также сопоставления к роли. Также существуют варианты конфигурирования отдельных пользователей в ClickHouse, но аутентификация этих пользователей через LDAP не требует настройки автоматического сопоставления ролей. Модуль LDAP также может использоваться для подключения к Active Directory.
