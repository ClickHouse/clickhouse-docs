---
sidebar_label: 'Аутентификация по пользовательскому SSL-сертификату'
sidebar_position: 3
slug: /guides/sre/ssl-user-auth
title: 'Настройка пользовательского SSL-сертификата для аутентификации'
description: 'В этом руководстве приведены простые и минимальные настройки для аутентификации с использованием пользовательских SSL-сертификатов.'
doc_type: 'guide'
keywords: ['ssl', 'authentication', 'security', 'certificates', 'user management']
---



# Настройка аутентификации по пользовательскому SSL‑сертификату

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

В этом руководстве приведены простые и минимально необходимые настройки для аутентификации с помощью пользовательских SSL-сертификатов. Настоящее руководство основано на разделе [Configuring SSL-TLS user guide](../configuring-ssl.md).

:::note
Аутентификация пользователей по SSL поддерживается при использовании интерфейсов `https`, `native`, `mysql` и `postgresql`.

Для безопасной аутентификации на узлах ClickHouse необходимо установить `<verificationMode>strict</verificationMode>` (хотя значение `relaxed` подойдет для целей тестирования).

Если вы используете AWS NLB с интерфейсом MySQL, вам необходимо обратиться в службу поддержки AWS с просьбой включить недокументированную опцию:

> I would like to be able to configure our NLB proxy protocol v2 as below `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`.
> :::


## 1. Создание пользовательских сертификатов SSL {#1-create-ssl-user-certificates}

:::note
В этом примере используются самоподписанные сертификаты с самоподписанным центром сертификации (CA). Для продуктивных сред создайте CSR и отправьте его вашей PKI‑команде или поставщику сертификатов, чтобы получить корректный сертификат.
:::

1. Сгенерируйте запрос на подпись сертификата (CSR) и ключ. Базовый формат следующий:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
    ```
    В этом примере мы используем следующие значения для домена и пользователя в тестовом окружении:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
    ```
    :::note
    Значение CN произвольно, и любая строка может быть использована в качестве идентификатора сертификата. Оно используется при создании пользователя на дальнейших шагах.
    :::

2.  Сгенерируйте и подпишите новый пользовательский сертификат, который будет использоваться для аутентификации. Базовый формат следующий:
    ```bash
    openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
    ```
    В этом примере мы используем следующие значения для домена и пользователя в тестовом окружении:
    ```bash
    openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
    ```



## 2. Создание SQL‑пользователя и выдача прав {#2-create-a-sql-user-and-grant-permissions}

:::note
Подробные сведения о включении SQL‑пользователей и настройке ролей см. в руководстве пользователя [Определение SQL‑пользователей и ролей](index.md).
:::

1. Создайте SQL‑пользователя, использующего аутентификацию по сертификату:
    ```sql
    CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
    ```

2. Выдайте привилегии новому пользователю, аутентифицируемому по сертификату:
    ```sql
    GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
    ```
    :::note
    В этом упражнении пользователю для демонстрации предоставляются полные административные привилегии. Параметры прав доступа см. в [документации по RBAC](/guides/sre/user-management/index.md) ClickHouse.
    :::

    :::note
    Мы рекомендуем использовать SQL для определения пользователей и ролей. Однако, если вы сейчас определяете пользователей и роли в конфигурационных файлах, пользователь будет выглядеть следующим образом:
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
            <!-- дополнительные параметры-->
        </cert_user>
    </users>
    ```
    :::



## 3. Тестирование {#3-testing}

1. Скопируйте пользовательский сертификат, пользовательский ключ и сертификат CA (центра сертификации) на удалённый узел.

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

1. Скопируйте пользовательский сертификат, пользовательский ключ и сертификат УЦ на удалённый узел.

2. Используйте `curl`, чтобы проверить выполнение примерной SQL-команды. Базовый формат команды:
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
    Обратите внимание, что пароль не указывался: сертификат используется вместо пароля, и именно с его помощью ClickHouse аутентифицирует пользователя.
    :::



## Итоги {#summary}

В этой статье мы рассмотрели основы создания и настройки пользователя для аутентификации с использованием SSL-сертификата. Этот метод может применяться с `clickhouse-client` или любыми клиентами, которые поддерживают интерфейс `https` и позволяют задавать HTTP-заголовки. Сгенерированные сертификат и ключ должны храниться в конфиденциальности и с ограниченным доступом, поскольку сертификат используется для аутентификации и авторизации пользователя при выполнении операций в базе данных ClickHouse. Относитесь к сертификату и ключу так же, как к паролям.
