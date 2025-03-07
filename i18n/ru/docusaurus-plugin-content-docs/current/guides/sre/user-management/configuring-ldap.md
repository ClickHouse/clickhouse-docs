---
sidebar_label: 'Настройка LDAP'
sidebar_position: 2
slug: /guides/sre/configuring-ldap
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Настройка ClickHouse для использования LDAP для аутентификации и сопоставления ролей

<SelfManaged />

ClickHouse может быть настроен для использования LDAP для аутентификации пользователей базы данных ClickHouse. Этот документ предоставляет простой пример интеграции ClickHouse с системами LDAP, аутентифицирующими в общедоступном каталоге.

## 1. Настройка параметров подключения LDAP в ClickHouse {#1-configure-ldap-connection-settings-in-clickhouse}

1. Проверьте ваше соединение с этим публичным LDAP сервером:
    ```bash
    $ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
    ```

    Ответ будет выглядеть примерно так:
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
    Теги `<test_ldap_server>` являются произвольной меткой для идентификации конкретного LDAP сервера.
    :::

    Это основные настройки, использованные выше:

    | Параметр  | Описание                        | Пример              |
    |-----------|---------------------------------|---------------------|
    | host      | имя хоста или IP-адрес LDAP сервера | ldap.forumsys.com    |
    | port      | порт каталога для LDAP сервера  | 389                  |
    | bind_dn   | шаблонный путь к пользователям   | `uid={user_name},dc=example,dc=com`|
    | enable_tls| использовать ли защищенный ldap   | no     |
    | tls_require_cert | требуется ли сертификат для подключения | never |

    :::note
    В этом примере, так как публичный сервер использует 389 и не использует защищенный порт, мы отключаем TLS для демонстрационных целей.
    :::

    :::note
    Посмотрите [страницу документации LDAP](../../../operations/external-authenticators/ldap.md) для получения дополнительных сведений о настройках LDAP.
    :::

3. Добавьте секцию `<ldap>` в секцию `<user_directories>`, чтобы настроить сопоставление ролей пользователей. Эта секция определяет, когда пользователь аутентифицирован и какую роль получит пользователь. В этом базовом примере любой пользователь, аутентифицирующийся через LDAP, получит роль `scientists_role`, которая будет определена на более позднем этапе в ClickHouse. Секция должна выглядеть примерно так:
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

    Это основные настройки, использованные выше:

    | Параметр  | Описание                        | Пример              |
    |-----------|---------------------------------|---------------------|
    | server    | метка, определенная в предыдущем разделе ldap_servers | test_ldap_server|
    | roles     | имена ролей, определенных в ClickHouse, к которым будут сопоставлены пользователи | scientists_role|
    | base_dn   | базовый путь для начала поиска групп с пользователем | dc=example,dc=com|
    | search_filter | ldap-фильтр поиска для идентификации групп, которые нужно выбрать для сопоставления пользователей | `(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    | attribute | какое имя атрибута должно быть возвращено | cn |

4. Перезапустите ваш сервер ClickHouse, чтобы применить настройки.

## 2. Настройка ролей и разрешений базы данных ClickHouse {#2-configure-clickhouse-database-roles-and-permissions}

:::note
Процедуры в этом разделе предполагают, что контроль доступа SQL и управление учетными записями в ClickHouse были включены. Чтобы включить, посмотрите [руководство по SQL пользователям и ролям](index.md).
:::

1. Создайте роль в ClickHouse с тем же именем, которое используется в разделе сопоставления ролей файла `config.xml`:
    ```sql
    CREATE ROLE scientists_role;
    ```

2. Предоставьте необходимые привилегии роли. Следующее утверждение предоставляет привилегии администратора любому пользователю, способному аутентифицироваться через LDAP:
    ```sql
    GRANT ALL ON *.* TO scientists_role;
    ```

## 3. Тестирование конфигурации LDAP {#3-test-the-ldap-configuration}

1. Войдите с помощью клиента ClickHouse:
    ```bash
    $ clickhouse-client --user einstein --password password
    ClickHouse client version 22.2.2.1.
    Connecting to localhost:9000 as user einstein.
    Connected to ClickHouse server version 22.2.2 revision 54455.

    chnode1 :)
    ```

    :::note
    Используйте команду `ldapsearch` на шаге 1, чтобы просмотреть всех пользователей, доступных в каталоге, и для всех пользователей пароль - `password`
    :::

2. Проверьте, что пользователю было сопоставлено правильное значение роли `scientists_role` и что у него есть административные разрешения:
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
В этой статье были продемонстрированы основы настройки ClickHouse для аутентификации на LDAP сервере и сопоставления с ролью. Также есть варианты настройки отдельных пользователей в ClickHouse, но при этом аутентифицировать этих пользователей по LDAP без конфигурации автоматического сопоставления ролей. Модуль LDAP также может быть использован для подключения к Active Directory.
