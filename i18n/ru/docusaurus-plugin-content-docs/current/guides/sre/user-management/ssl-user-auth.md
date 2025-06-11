---
sidebar_label: 'Аутентификация пользователя с помощью сертификата SSL'
sidebar_position: 3
slug: /guides/sre/ssl-user-auth
title: 'Настройка сертификата пользователя SSL для аутентификации'
description: 'В этом руководстве представлены простые и минимальные настройки для конфигурации аутентификации с использованием сертификатов пользователей SSL.'
---


# Настройка сертификата пользователя SSL для аутентификации
import SelfManaged from '@site/i18n/docusaurus-plugin-content-docs/ru/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

В этом руководстве представлены простые и минимальные настройки для конфигурации аутентификации с использованием сертификатов пользователей SSL. Туториал основывается на [руководстве по настройке SSL-TLS](../configuring-ssl.md).

:::note
Аутентификация пользователя SSL поддерживается при использовании интерфейсов `https`, `native`, `mysql` и `postgresql`.

Узлы ClickHouse должны иметь установлено `<verificationMode>strict</verificationMode>` для безопасной аутентификации (хотя `relaxed` будет работать для целей тестирования).

Если вы используете AWS NLB с интерфейсом MySQL, вам нужно обратиться в службу поддержки AWS, чтобы включить недокументированную опцию:

> Я хотел бы иметь возможность настраивать наш NLB-прокси протокол v2 следующим образом `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`.
:::

## 1. Создание сертификатов пользователя SSL {#1-create-ssl-user-certificates}

:::note
В этом примере используются самоподписанные сертификаты с самоподписанным УЦ. Для производственных сред создайте CSR и отправьте его команде PKI или поставщику сертификатов, чтобы получить правильный сертификат.
:::

1. Сгенерируйте запрос на подпись сертификата (CSR) и ключ. Основной формат таков:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
    ```
    В этом примере мы будем использовать это для домена и пользователя, которые будут использоваться в этой тестовой среде:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
    ```
    :::note
    CN произвольный, и любая строка может быть использована в качестве идентификатора для сертификата. Он используется при создании пользователя на следующих этапах.
    :::

2.  Сгенерируйте и подпользуйте новый сертификат пользователя, который будет использоваться для аутентификации. Основной формат таков:
    ```bash
    openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
    ```
    В этом примере мы будем использовать это для домена и пользователя, которые будут использоваться в этой тестовой среде:
    ```bash
    openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
    ```

## 2. Создание SQL-пользователя и предоставление прав {#2-create-a-sql-user-and-grant-permissions}

:::note
Для получения информации о том, как включить SQL-пользователей и задать роли, обратитесь к [Определение SQL пользователей и ролей](index.md).
:::

1. Создайте SQL-пользователя, определенного для использования аутентификации по сертификату:
    ```sql
    CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
    ```

2. Предоставьте привилегии новому пользователю сертификата:
    ```sql
    GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
    ```
    :::note
    В этом упражнении пользователю предоставляются полные права администратора для демонстрационных целей. Обратитесь к [документации ClickHouse по RBAC](/guides/sre/user-management/index.md) для настройки прав доступа.
    :::

    :::note
    Мы рекомендуем использовать SQL для определения пользователей и ролей. Однако, если вы в настоящее время определяете пользователей и роли в файлах конфигурации, пользователь будет выглядеть так:
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
            <!-- дополнительные опции -->
        </cert_user>
    </users>
    ```
    :::


## 3. Тестирование {#3-testing}

1. Скопируйте сертификат пользователя, ключ пользователя и сертификат CA на удаленный узел.

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

1. Скопируйте сертификат пользователя, ключ пользователя и сертификат CA на удаленный узел.

2. Используйте `curl` для тестирования образца SQL-команды. Основной формат:
    ```bash
    echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
    ```
    Например:
    ```bash
    echo 'SHOW TABLES' | curl 'https://chnode1:8443' --cert chnode1_cert_user.crt --key chnode1_cert_user.key --cacert marsnet_ca.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: cert_user" --data-binary @-
    ```
    Вывод будет похож на следующий:
    ```response
    INFORMATION_SCHEMA
    default
    information_schema
    system
    ```
    :::note
    Обратите внимание, что пароль не был указан, сертификат используется вместо пароля и именно так ClickHouse будет аутентифицировать пользователя.
    :::


## Резюме {#summary}

В этой статье рассмотрены основы создания и настройки пользователя для аутентификации по сертификату SSL. Этот метод можно использовать с `clickhouse-client` или любыми клиентами, которые поддерживают интерфейс `https` и где можно установить HTTP-заголовки. Сгенерированный сертификат и ключ следует хранить в секрете и с ограниченным доступом, поскольку сертификат используется для аутентификации и авторизации пользователя для операций с базой данных ClickHouse. Относитесь к сертификату и ключу так, как если бы они были паролями.
