---
sidebar_label: 'Аутентификация по пользовательскому SSL-сертификату'
sidebar_position: 3
slug: /guides/sre/ssl-user-auth
title: 'Настройка пользовательского SSL-сертификата для аутентификации'
description: 'В этом руководстве приведены простые и минимальные настройки для аутентификации по пользовательским SSL-сертификатам.'
doc_type: 'guide'
keywords: ['ssl', 'authentication', 'security', 'certificates', 'user management']
---



# Настройка SSL‑сертификата пользователя для аутентификации

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

В этом руководстве приведены простые и минимальные настройки для конфигурации аутентификации с помощью пользовательских SSL-сертификатов. Этот учебник основан на [руководстве по настройке SSL-TLS](../configuring-ssl.md).

:::note
Аутентификация пользователей по SSL поддерживается при использовании интерфейсов `https`, `native`, `mysql` и `postgresql`.

Для безопасной аутентификации на узлах ClickHouse необходимо установить значение `<verificationMode>strict</verificationMode>` (хотя `relaxed` подойдет для целей тестирования).

Если вы используете AWS NLB с интерфейсом MySQL, вам нужно обратиться в службу поддержки AWS с просьбой включить недокументированную опцию:

> I would like to be able to configure our NLB proxy protocol v2 as below `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`.
> :::


## 1. Создание SSL-сертификатов пользователя {#1-create-ssl-user-certificates}

:::note
В этом примере используются самоподписанные сертификаты с самоподписанным центром сертификации (CA). Для промышленных окружений создайте CSR и передайте его вашей команде PKI или поставщику сертификатов для получения корректного сертификата.
:::

1. Сгенерируйте запрос на подпись сертификата (CSR) и ключ. Базовый формат команды:

   ```bash
   openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
   ```

   В этом примере используется следующая команда для домена и пользователя в данном тестовом окружении:

   ```bash
   openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
   ```

   :::note
   Значение CN является произвольным — в качестве идентификатора сертификата может использоваться любая строка. Оно используется при создании пользователя на следующих шагах.
   :::

2. Сгенерируйте и подпишите новый сертификат пользователя, который будет использоваться для аутентификации. Базовый формат команды:
   ```bash
   openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
   ```
   В этом примере используется следующая команда для домена и пользователя в данном тестовом окружении:
   ```bash
   openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
   ```


## 2. Создание SQL-пользователя и предоставление прав доступа {#2-create-a-sql-user-and-grant-permissions}

:::note
Подробную информацию о включении SQL-пользователей и настройке ролей см. в руководстве [Defining SQL Users and Roles](index.md).
:::

1. Создайте SQL-пользователя, настроенного для аутентификации по сертификату:

   ```sql
   CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
   ```

2. Предоставьте привилегии новому пользователю с сертификатом:

   ```sql
   GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
   ```

   :::note
   В данном примере пользователю предоставлены полные права администратора в демонстрационных целях. Информацию о настройке прав доступа см. в [документации RBAC](/guides/sre/user-management/index.md) ClickHouse.
   :::

   :::note
   Мы рекомендуем использовать SQL для определения пользователей и ролей. Однако если вы в настоящее время определяете пользователей и роли в конфигурационных файлах, пользователь будет выглядеть следующим образом:

   ```xml
   <users>
       <cert_user>
           <ssl_certificates>
               <common_name>chnode1.marsnet.local:cert_user</common_name>
           </ssl_certificates>
           <networks>
               <ip>::/0</ip>
           </networks>
           <profile>default</profile>
           <access_management>1</access_management>
           <!-- additional options-->
       </cert_user>
   </users>
   ```

   :::


## 3. Тестирование {#3-testing}

1. Скопируйте пользовательский сертификат, пользовательский ключ и сертификат CA на удалённый узел.

2. Настройте OpenSSL в [конфигурации клиента](/interfaces/cli.md#configuration_files) ClickHouse, указав сертификат и пути к файлам.

   ```xml
   <openSSL>
       <client>
           <certificateFile>my_cert_name.crt</certificateFile>
           <privateKeyFile>my_cert_name.key</privateKeyFile>
           <caConfig>my_ca_cert.crt</caConfig>
       </client>
   </openSSL>
   ```

3. Запустите `clickhouse-client`.
   ```bash
   clickhouse-client --user <my_user> --query 'SHOW TABLES'
   ```
   :::note
   Обратите внимание, что пароль, переданный в clickhouse-client, игнорируется, если в конфигурации указан сертификат.
   :::


## 4. Тестирование HTTP {#4-testing-http}

1. Скопируйте сертификат пользователя, ключ пользователя и сертификат CA на удалённый узел.

2. Используйте `curl` для тестирования примера SQL-команды. Базовый формат:
   ```bash
   echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
   ```
   Например:
   ```bash
   echo 'SHOW TABLES' | curl 'https://chnode1:8443' --cert chnode1_cert_user.crt --key chnode1_cert_user.key --cacert marsnet_ca.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: cert_user" --data-binary @-
   ```
   Результат будет примерно следующим:
   ```response
   INFORMATION_SCHEMA
   default
   information_schema
   system
   ```
   :::note
   Обратите внимание, что пароль не указывается — сертификат используется вместо пароля, и именно так ClickHouse выполняет аутентификацию пользователя.
   :::


## Резюме {#summary}

В этой статье рассмотрены основы создания и настройки пользователя для аутентификации с помощью SSL-сертификата. Этот метод можно использовать с `clickhouse-client` или любыми клиентами, поддерживающими интерфейс `https` и позволяющими устанавливать HTTP-заголовки. Сгенерированные сертификат и ключ должны храниться в секрете с ограниченным доступом, поскольку сертификат используется для аутентификации и авторизации пользователя при выполнении операций в базе данных ClickHouse. Относитесь к сертификату и ключу как к паролям.
