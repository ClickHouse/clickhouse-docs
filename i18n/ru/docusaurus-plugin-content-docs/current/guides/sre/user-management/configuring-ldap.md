---
sidebar_label: 'Настройка LDAP'
sidebar_position: 2
slug: /guides/sre/configuring-ldap
title: 'Настройка ClickHouse для использования LDAP для аутентификации и назначения ролей'
description: 'Описывает, как настроить ClickHouse для использования LDAP для аутентификации и назначения ролей'
keywords: ['LDAP configuration', 'LDAP authentication', 'role mapping', 'user management', 'SRE guide']
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# Настройка ClickHouse для использования LDAP для аутентификации и сопоставления ролей

<SelfManaged />

ClickHouse можно настроить на использование LDAP для аутентификации пользователей базы данных ClickHouse. В этом руководстве приведён простой пример интеграции ClickHouse с системой LDAP, которая аутентифицируется через общедоступный каталог.



## 1. Configure LDAP connection settings in ClickHouse {#1-configure-ldap-connection-settings-in-clickhouse}

1. Test your connection to this public LDAP server:

   ```bash
   $ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
   ```

   The reply will be something like this:

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

2. Edit the `config.xml` file and add the following to configure LDAP:

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
   The `<test_ldap_server>` tags is an arbitrary label to identify a particular LDAP server.
   :::

   These are the basic settings used above:

   | Parameter        | Description                                   | Example                             |
   | ---------------- | --------------------------------------------- | ----------------------------------- |
   | host             | hostname or IP of LDAP server                 | ldap.forumsys.com                   |
   | port             | directory port for LDAP server                | 389                                 |
   | bind_dn          | template path to users                        | `uid={user_name},dc=example,dc=com` |
   | enable_tls       | whether to use secure ldap                    | no                                  |
   | tls_require_cert | whether to require certificate for connection | never                               |

   :::note
   In this example, since the public server uses 389 and does not use a secure port, we disable TLS for demonstration purposes.
   :::

   :::note
   View the [LDAP doc page](../../../operations/external-authenticators/ldap.md) for more details on the LDAP settings.
   :::

3. Add the `<ldap>` section to `<user_directories>` section to configure the user role mapping. This section defines when a user is authenticated and what role the user will receive. In this basic example, any user authenticating to LDAP will receive the `scientists_role` which will be defined at a later step in ClickHouse. The section should look similar to this:

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

   These are the basic settings used above:

   | Parameter     | Description                                                                      | Example                                                       |
   | ------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------- |
   | server        | метка, определённая в предыдущей секции `ldap_servers`                           | test_ldap_server                                              |
   | roles         | имя ролей в ClickHouse, к которым будут сопоставляться пользователи             | scientists_role                                               |
   | base_dn       | базовый путь, с которого начинается поиск групп с пользователем                  | dc=example,dc=com                                             |
   | search_filter | фильтр поиска LDAP для определения групп, выбираемых для сопоставления пользователей | `(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))` |
   | attribute     | из какого атрибута должно быть возвращено значение                               | cn                                                            |

4. Restart your ClickHouse server to apply the settings.


## 2. Настройка ролей и прав доступа к базе данных ClickHouse {#2-configure-clickhouse-database-roles-and-permissions}

:::note
Процедуры в этом разделе предполагают, что в ClickHouse включено управление доступом SQL и управление учётными записями. Для включения см. [руководство по пользователям и ролям SQL](index.md).
:::

1. Создайте роль в ClickHouse с тем же именем, которое используется в разделе сопоставления ролей файла `config.xml`

   ```sql
   CREATE ROLE scientists_role;
   ```

2. Предоставьте роли необходимые привилегии. Следующая инструкция предоставляет права администратора любому пользователю, который может пройти аутентификацию через LDAP:
   ```sql
   GRANT ALL ON *.* TO scientists_role;
   ```


## 3. Тестирование конфигурации LDAP {#3-test-the-ldap-configuration}

1. Войдите в систему, используя клиент ClickHouse

   ```bash
   $ clickhouse-client --user einstein --password password
   ClickHouse client version 22.2.2.1.
   Connecting to localhost:9000 as user einstein.
   Connected to ClickHouse server version 22.2.2 revision 54455.

   chnode1 :)
   ```

   :::note
   Используйте команду `ldapsearch` из шага 1 для просмотра всех пользователей, доступных в каталоге. Пароль для всех пользователей — `password`
   :::

2. Убедитесь, что пользователь был корректно сопоставлен с ролью `scientists_role` и имеет права администратора

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


## Заключение {#summary}

В этой статье рассмотрены основы настройки ClickHouse для аутентификации на LDAP-сервере и сопоставления пользователей с ролями. Также возможна настройка отдельных пользователей в ClickHouse с аутентификацией через LDAP без автоматического сопоставления ролей. Модуль LDAP можно использовать и для подключения к Active Directory.
