---
sidebar_label: 'Конфигурирование LDAP'
sidebar_position: 2
slug: /guides/sre/configuring-ldap
title: 'Конфигурирование ClickHouse для использования LDAP для аутентификации и сопоставления ролей'
description: 'Описание конфигурации ClickHouse для использования LDAP для аутентификации и сопоставления ролей'
---

import SelfManaged from '@site/i18n/ru/current/_snippets/_self_managed_only_no_roadmap.md';


# Конфигурирование ClickHouse для использования LDAP для аутентификации и сопоставления ролей

<SelfManaged />

ClickHouse можно настроить для использования LDAP для аутентификации пользователей базы данных ClickHouse. Этот гайд предоставляет простой пример интеграции ClickHouse с системой LDAP, аутентифицирующей к общедоступному каталогу.

## 1. Настройка параметров подключения к LDAP в ClickHouse {#1-configure-ldap-connection-settings-in-clickhouse}

1. Протестируйте ваше соединение с этим общедоступным LDAP сервером:
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

2. Отредактируйте файл `config.xml` и добавьте следующее, чтобы настроить LDAP:
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
    Тег `<test_ldap_server>` является произвольной меткой для идентификации конкретного LDAP сервера.
    :::

    Вот основные параметры, используемые выше:

    |Параметр |Описание                     |Пример                |
    |---------|----------------------------|---------------------|
    |host     |имя хоста или IP LDAP сервера|ldap.forumsys.com    |
    |port     |порт каталога для LDAP сервера|389                  |
    |bind_dn  |шаблонный путь к пользователям|`uid={user_name},dc=example,dc=com`|
    |enable_tls|использовать ли безопасный LDAP|no                   |
    |tls_require_cert|требовать ли сертификат для соединения|never|

    :::note
    В этом примере, поскольку общедоступный сервер использует 389 и не использует безопасный порт, мы отключаем TLS для демонстрационных целей.
    :::

    :::note
    Посмотрите [страницу документации LDAP](../../../operations/external-authenticators/ldap.md) для получения более подробной информации о настройках LDAP.
    :::

3. Добавьте секцию `<ldap>` в секцию `<user_directories>`, чтобы настроить сопоставление ролей пользователей. Эта секция определяет, когда пользователь аутентифицирован и какую роль получит пользователь. В этом базовом примере любой пользователь, аутентифицирующийся в LDAP, получит роль `scientists_role`, которая будет определена позже в ClickHouse. Секция должна выглядеть примерно так:
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

    Вот основные параметры, используемые выше:

    |Параметр  |Описание                                           |Пример              |
    |----------|--------------------------------------------------|---------------------|
    |server    |метка, определенная в предыдущем разделе ldap_servers|test_ldap_server     |
    |roles     |имя ролей, определенных в ClickHouse, к которым будут сопоставлены пользователи|scientists_role      |
    |base_dn   |базовый путь для начала поиска групп с пользователями|dc=example,dc=com   |
    |search_filter|ldap-фильтр поиска для выбора групп для сопоставления пользователей|`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute |имя атрибута, значение которого должно быть возвращено|cn                   |


4. Перезапустите ваш сервер ClickHouse, чтобы применить настройки.

## 2. Настройка ролей и прав доступа базы данных ClickHouse {#2-configure-clickhouse-database-roles-and-permissions}

:::note
Процедуры в этом разделе предполагают, что управление доступом на уровне SQL и управление учетными записями в ClickHouse были включены. Чтобы включить, посмотрите [гид по SQL пользователям и ролям](index.md).
:::

1. Создайте роль в ClickHouse с тем же именем, что и в секции сопоставления ролей файла `config.xml`
    ```sql
    CREATE ROLE scientists_role;
    ```

2. Предоставьте необходимые привилегии этой роли. Следующее выражение предоставляет административные привилегии любому пользователю, способному аутентифицироваться через LDAP:
    ```sql
    GRANT ALL ON *.* TO scientists_role;
    ```

## 3. Протестируйте конфигурацию LDAP {#3-test-the-ldap-configuration}

1. Войдите, используя клиент ClickHouse
    ```bash
    $ clickhouse-client --user einstein --password password
    ClickHouse client version 22.2.2.1.
    Подключение к localhost:9000 как пользователь einstein.
    Подключен к серверу ClickHouse version 22.2.2 revision 54455.

    chnode1 :)
    ```

    :::note
    Используйте команду `ldapsearch` на этапе 1, чтобы просмотреть всех пользователей, доступных в каталоге, и для всех пользователей пароль равен `password`
    :::

2.  Проверьте, что пользователь был сопоставлен правильно к роли `scientists_role` и имеет административные права
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
В этой статье были показаны основы настройки ClickHouse для аутентификации на LDAP сервере и сопоставления с ролью. Также есть возможность настройки индивидуальных пользователей в ClickHouse, но аутентификация этих пользователей осуществляется через LDAP без настройки автоматизированного сопоставления ролей. Модуль LDAP также может использоваться для подключения к Active Directory.
