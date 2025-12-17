---
sidebar_label: 'Настройка LDAP'
sidebar_position: 2
slug: /guides/sre/configuring-ldap
title: 'Настройка ClickHouse для использования LDAP при аутентификации и сопоставлении ролей'
description: 'Описывает, как настроить ClickHouse для использования LDAP при аутентификации и сопоставлении ролей'
keywords: ['конфигурация LDAP', 'аутентификация LDAP', 'сопоставление ролей', 'управление пользователями', 'руководство для SRE']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# Настройка ClickHouse для использования LDAP при аутентификации и сопоставлении ролей {#configuring-clickhouse-to-use-ldap-for-authentication-and-role-mapping}

<SelfManaged />

ClickHouse можно настроить на использование LDAP для аутентификации пользователей базы данных. В этом руководстве приведён простой пример интеграции ClickHouse с системой LDAP, которая аутентифицирует пользователей по общедоступному каталогу.

## 1. Настройка параметров подключения LDAP в ClickHouse {#1-configure-ldap-connection-settings-in-clickhouse}

1. Протестируйте подключение к этому публичному серверу LDAP:
    ```bash
    $ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
    ```

    Ответ будет примерно таким:
    
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
    Тег `<test_ldap_server>` — это произвольная метка для идентификации конкретного сервера LDAP.
    :::

    Ниже перечислены основные параметры, используемые выше:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |host      |имя хоста или IP сервера LDAP |ldap.forumsys.com    |
    |port      |порт каталога для сервера LDAP|389                  |
    |bind_dn   |шаблон пути к пользователям   |`uid={user_name},dc=example,dc=com`|
    |enable_tls|использовать ли защищённый LDAP|no     |
    |tls_require_cert |требовать ли сертификат для подключения|never|

    :::note
    В этом примере, поскольку публичный сервер использует порт 389 и не использует защищённый порт, мы отключаем TLS в демонстрационных целях.
    :::

    :::note
    Дополнительные сведения о параметрах LDAP см. на [странице документации LDAP](../../../operations/external-authenticators/ldap.md).
    :::

3. Добавьте раздел `<ldap>` в раздел `<user_directories>` для настройки сопоставления ролей пользователей. Этот раздел определяет, когда пользователь аутентифицирован и какую роль он получит. В этом базовом примере любой пользователь, аутентифицирующийся в LDAP, получит роль `scientists_role`, которая будет определена на следующем шаге в ClickHouse. Раздел должен выглядеть примерно так:
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

    Ниже перечислены основные параметры, используемые выше:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |server    |метка, определённая в предыдущем разделе ldap_servers|test_ldap_server|
    |roles      |имена ролей в ClickHouse, к которым будут сопоставлены пользователи|scientists_role|
    |base_dn   |базовый путь, с которого начинается поиск групп с пользователем|dc=example,dc=com|
    |search_filter|фильтр поиска LDAP для определения групп, выбираемых для сопоставления пользователей|`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute |из какого атрибута должно возвращаться значение|cn|

4. Перезапустите сервер ClickHouse, чтобы применить настройки.

## 2. Настройте роли и разрешения базы данных ClickHouse {#2-configure-clickhouse-database-roles-and-permissions}

:::note
В этом разделе предполагается, что в ClickHouse включены управление доступом на уровне SQL и управление учётными записями (SQL Access Control and Account Management). Инструкции по включению см. в руководстве [SQL Users and Roles](index.md).
:::

1. Создайте роль в ClickHouse с тем же именем, которое использовалось в разделе сопоставления ролей в файле `config.xml`:
    ```sql
    CREATE ROLE scientists_role;
    ```

2. Назначьте необходимые привилегии этой роли. Следующий оператор назначает административные привилегии любому пользователю, который может пройти аутентификацию через LDAP:
    ```sql
    GRANT ALL ON *.* TO scientists_role;
    ```

## 3. Тестирование конфигурации LDAP {#3-test-the-ldap-configuration}

1. Войдите в систему с помощью клиента ClickHouse
    ```bash
    $ clickhouse-client --user einstein --password password
    ClickHouse client version 22.2.2.1.
    Connecting to localhost:9000 as user einstein.
    Connected to ClickHouse server version 22.2.2 revision 54455.

    chnode1 :)
    ```

    :::note
    Используйте команду `ldapsearch` на шаге 1, чтобы просмотреть всех пользователей, доступных в каталоге. Для всех этих пользователей пароль — `password`.
    :::

2.  Проверьте, что пользователь был корректно сопоставлен с ролью `scientists_role` и имеет права администратора
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

## Итоги {#summary}
В этой статье были продемонстрированы основы настройки ClickHouse для аутентификации через LDAP-сервер, а также для привязки к роли. Также доступны варианты настройки отдельных пользователей в ClickHouse, при этом аутентифицируя этих пользователей через LDAP без настройки автоматического сопоставления ролей. Модуль LDAP также можно использовать для подключения к Active Directory.
