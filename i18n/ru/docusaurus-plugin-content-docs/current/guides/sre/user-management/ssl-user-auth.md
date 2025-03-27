---
sidebar_label: 'Аутентификация с помощью SSL пользовательских сертификатов'
sidebar_position: 3
slug: /guides/sre/ssl-user-auth
title: 'Настройка SSL пользовательского сертификата для аутентификации'
description: 'Этот гид предоставляет простые и минимальные настройки для конфигурации аутентификации с SSL пользовательскими сертификатами.'
---


# Настройка SSL пользовательского сертификата для аутентификации
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

Этот гид предоставляет простые и минимальные настройки для конфигурации аутентификации с SSL пользовательскими сертификатами. Учебник основан на [Руководстве по настройке SSL-TLS](../configuring-ssl.md).

:::note
Аутентификация пользователей по SSL поддерживается при использовании интерфейсов `https`, `native`, `mysql` и `postgresql`.

Узлы ClickHouse должны иметь `<verificationMode>strict</verificationMode>` для безопасной аутентификации (хотя `relaxed` будет работать для тестирования).

Если вы используете AWS NLB с интерфейсом MySQL, вам необходимо обратиться в службу поддержки AWS, чтобы включить не задокументированную опцию:

> Я хотел бы иметь возможность настроить наш NLB прокси-протокол v2, как указано ниже `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`.
:::

## 1. Создание SSL пользовательских сертификатов {#1-create-ssl-user-certificates}

:::note
В этом примере используются самоподписанные сертификаты с самоподписанным CA. Для производственных сред создайте CSR и отправьте его вашей команде PKI или поставщику сертификатов, чтобы получить правильный сертификат.
:::


1. Сгенерируйте Запрос на Подписание Сертификата (CSR) и ключ. Основной формат следующий:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
    ```
    В этом примере мы будем использовать это для домена и пользователя, которые будут использоваться в этой тестовой среде:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
    ```
    :::note
    CN произвольный, и любую строку можно использовать в качестве идентификатора для сертификата. Он используется при создании пользователя на следующих этапах.
    :::

2.  Сгенерируйте и подпишите новый пользовательский сертификат, который будет использоваться для аутентификации. Основной формат следующий:
    ```bash
    openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
    ```
    В этом примере мы будем использовать это для домена и пользователя, которые будут использоваться в этой тестовой среде:
    ```bash
    openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
    ```

## 2. Создание пользователя SQL и предоставление привилегий {#2-create-a-sql-user-and-grant-permissions}

:::note
Для получения подробной информации о том, как включить пользователей SQL и установить роли, обратитесь к руководству [Определение пользователей и ролей SQL](index.md).
:::

1. Создайте пользователя SQL, определенного для использования аутентификации сертификатов:
    ```sql
    CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
    ```

2. Предоставьте привилегии новому пользователю сертификата:
    ```sql
    GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
    ```
    :::note
    В этом упражнении пользователю предоставляются полные административные привилегии для демонстрационных целей. Обратитесь к [документации ClickHouse по RBAC](/guides/sre/user-management/index.md) для настройки разрешений.
    :::

    :::note
    Мы рекомендуем использовать SQL для определения пользователей и ролей. Тем не менее, если вы в настоящее время определяете пользователей и роли в файлах конфигурации, пользователь будет выглядеть следующим образом:
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
            <!-- дополнительные опции-->
        </cert_user>
    </users>
    ```
    :::


## 3. Тестирование {#3-testing}

1. Скопируйте пользовательский сертификат, пользовательский ключ и сертификат CA на удаленный узел.

2. Настройте OpenSSL в [конфигурации клиента ClickHouse](/interfaces/cli.md#configuration_files) с сертификатом и путями.

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
    Обратите внимание, что пароль, переданный в clickhouse-client, игнорируется, когда сертификат указан в конфигурации.
    :::


## 4. Тестирование HTTP {#4-testing-http}

1. Скопируйте пользовательский сертификат, пользовательский ключ и сертификат CA на удаленный узел.

2. Используйте `curl`, чтобы протестировать пример SQL-команды. Основной формат:
    ```bash
    echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
    ```
    Например:
    ```bash
    echo 'SHOW TABLES' | curl 'https://chnode1:8443' --cert chnode1_cert_user.crt --key chnode1_cert_user.key --cacert marsnet_ca.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: cert_user" --data-binary @-
    ```
    Результат будет похож на следующий:
    ```response
    INFORMATION_SCHEMA
    default
    information_schema
    system
    ```
    :::note
    Обратите внимание, что пароль не указывается, сертификат используется вместо пароля и является способом, которым ClickHouse будет аутентифицировать пользователя.
    :::


## Резюме {#summary}

В этой статье были показаны основы создания и конфигурации пользователя для аутентификации с помощью SSL сертификатов. Этот метод можно использовать с `clickhouse-client` или любыми клиентами, которые поддерживают интерфейс `https` и где могут быть установлены HTTP заголовки. Сгенерированный сертификат и ключ должны храниться в секрете и с ограниченным доступом, так как сертификат используется для аутентификации и авторизации пользователя для операций в базе данных ClickHouse. Обращайтесь с сертификатом и ключом так, как если бы это были пароли.
