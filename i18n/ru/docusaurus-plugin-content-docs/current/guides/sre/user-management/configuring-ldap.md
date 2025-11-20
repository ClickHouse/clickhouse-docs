---
sidebar_label: 'Настройка LDAP'
sidebar_position: 2
slug: /guides/sre/configuring-ldap
title: 'Настройка ClickHouse для использования LDAP для аутентификации и отображения ролей'
description: 'Описывает, как настроить ClickHouse для использования LDAP для аутентификации и отображения ролей'
keywords: ['LDAP configuration', 'LDAP authentication', 'role mapping', 'user management', 'SRE guide']
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# Настройка ClickHouse для использования LDAP для аутентификации и сопоставления ролей

<SelfManaged />

ClickHouse можно настроить для использования LDAP для аутентификации пользователей базы данных ClickHouse. В этом руководстве приведён простой пример интеграции ClickHouse с системой LDAP, использующей общедоступный каталог для аутентификации.



## 1. Настройка параметров подключения LDAP в ClickHouse {#1-configure-ldap-connection-settings-in-clickhouse}

1. Проверьте подключение к этому публичному LDAP-серверу:

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
   Тег `<test_ldap_server>` — это произвольная метка для идентификации конкретного LDAP-сервера.
   :::

   Ниже приведены основные параметры, используемые выше:

   | Параметр         | Описание                                           | Пример                              |
   | ---------------- | -------------------------------------------------- | ----------------------------------- |
   | host             | имя хоста или IP-адрес LDAP-сервера                | ldap.forumsys.com                   |
   | port             | порт каталога для LDAP-сервера                     | 389                                 |
   | bind_dn          | шаблон пути к пользователям                        | `uid={user_name},dc=example,dc=com` |
   | enable_tls       | использовать ли защищённый LDAP                    | no                                  |
   | tls_require_cert | требовать ли сертификат для подключения            | never                               |

   :::note
   В этом примере, поскольку публичный сервер использует порт 389 и не использует защищённый порт, мы отключаем TLS в демонстрационных целях.
   :::

   :::note
   Подробнее о настройках LDAP см. на [странице документации LDAP](../../../operations/external-authenticators/ldap.md).
   :::

3. Добавьте секцию `<ldap>` в секцию `<user_directories>` для настройки сопоставления ролей пользователей. Эта секция определяет, когда пользователь проходит аутентификацию и какую роль он получит. В этом базовом примере любой пользователь, прошедший аутентификацию через LDAP, получит роль `scientists_role`, которая будет определена на следующем шаге в ClickHouse. Секция должна выглядеть примерно так:

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

   Ниже приведены основные параметры, используемые выше:

   | Параметр      | Описание                                                                       | Пример                                                        |
   | ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
   | server        | метка, определённая в предыдущей секции ldap_servers                           | test_ldap_server                                              |
   | roles         | имя ролей, определённых в ClickHouse, которым будут сопоставлены пользователи  | scientists_role                                               |
   | base_dn       | базовый путь для начала поиска групп с пользователем                           | dc=example,dc=com                                             |
   | search_filter | фильтр поиска LDAP для идентификации групп для сопоставления пользователей     | `(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))` |
   | attribute     | имя атрибута, из которого должно быть возвращено значение                      | cn                                                            |

4. Перезапустите сервер ClickHouse, чтобы применить настройки.


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


## Резюме {#summary}

В данной статье были рассмотрены основы настройки ClickHouse для аутентификации на LDAP-сервере и сопоставления пользователей с ролями. Также возможна настройка отдельных пользователей в ClickHouse с аутентификацией через LDAP без автоматического сопоставления ролей. Модуль LDAP может также использоваться для подключения к Active Directory.
