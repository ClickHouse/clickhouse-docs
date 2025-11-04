---
slug: '/guides/sre/ssl-user-auth'
sidebar_label: 'Аутентификация пользователя с помощью сертификата SSL'
sidebar_position: 3
description: 'Этот гид предоставляет простые и минимальные настройки для конфигурации'
title: 'Настройка сертификата пользователя SSL для аутентификации'
doc_type: guide
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Конфигурация пользовательского сертификата SSL для аутентификации
<SelfManaged />

Этот гид предоставляет простые и минимальные настройки для конфигурации аутентификации с использованием пользовательских сертификатов SSL. Туториал основывается на [Руководстве по настройке SSL-TLS](../configuring-ssl.md).

:::note
Аутентификация пользователей с помощью SSL поддерживается при использовании интерфейсов `https`, `native`, `mysql` и `postgresql`.

Для безопасной аутентификации на узлах ClickHouse необходимо установить `<verificationMode>strict</verificationMode>` (хотя `relaxed` сработает для тестирования).

Если вы используете AWS NLB с интерфейсом MySQL, вам нужно обратиться в службу поддержки AWS, чтобы включить не задокументированную опцию:

> Я хотел бы иметь возможность настроить наш NLB proxy protocol v2, как указано ниже: `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`.
:::

## 1. Создание пользовательских сертификатов SSL {#1-create-ssl-user-certificates}

:::note
В этом примере используются самоподписанные сертификаты с самоподписанным CA. Для производственных сред создайте CSR и отправьте его вашей команде PKI или поставщику сертификатов, чтобы получить правильный сертификат.
:::

1. Сгенерируйте Запрос на Подпись Сертификата (CSR) и ключ. Основной формат таков:
```bash
openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
```
    В этом примере мы будем использовать это для домена и пользователя, которые будут использоваться в этой образцовой среде:
```bash
openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
```
    :::note
    CN произвольен, и любую строку можно использовать в качестве идентификатора сертификата. Он используется при создании пользователя на следующих шагах.
    :::

2.  Сгенерируйте и подпишите новый пользовательский сертификат, который будет использоваться для аутентификации. Основной формат таков:
```bash
openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
```
    В этом примере мы будем использовать это для домена и пользователя, которые будут использоваться в этой образцовой среде:
```bash
openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
```

## 2. Создание SQL пользователя и предоставление прав {#2-create-a-sql-user-and-grant-permissions}

:::note
Для подробной информации о том, как включить SQL пользователей и установить роли, обратитесь к [Определению SQL Пользователей и Ролей](index.md).
:::

1. Создайте SQL пользователя, определенного для использования аутентификации по сертификату:
```sql
CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
```

2. Предоставьте привилегии новому пользователю с сертификатом:
```sql
GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
```
    :::note
    В этом упражнении пользователю предоставлены полные административные привилегии для демонстрационных целей. Обратитесь к [документации по RBAC ClickHouse](/guides/sre/user-management/index.md) для настройки прав.
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
        <!-- additional options-->
    </cert_user>
</users>
```
    :::

## 3. Тестирование {#3-testing}

1. Скопируйте сертификат пользователя, ключ пользователя и сертификат CA на удаленный узел.

2. Настройте OpenSSL в [конфигурации клиента](//interfaces/cli.md#configuration_files) ClickHouse с сертификатом и путями.

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
    Обратите внимание, что пароль, передаваемый в clickhouse-client, игнорируется, если в конфигурации указан сертификат.
    :::

## 4. Тестирование HTTP {#4-testing-http}

1. Скопируйте сертификат пользователя, ключ пользователя и сертификат CA на удаленный узел.

2. Используйте `curl`, чтобы протестировать пример SQL команды. Основной формат таков:
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
    Обратите внимание, что пароль не был указан, сертификат используется вместо пароля, и именно так ClickHouse будет аутентифицировать пользователя.
    :::

## Резюме {#summary}

В этой статье были показаны основы создания и настройки пользователя для аутентификации сертификатов SSL. Этот метод можно использовать с `clickhouse-client` или любыми клиентами, поддерживающими интерфейс `https` и где можно устанавливать HTTP заголовки. Сгенерированные сертификат и ключ должны храниться в секрете и иметь ограниченный доступ, так как сертификат используется для аутентификации и авторизации пользователя для операций в базе данных ClickHouse. Обращайтесь с сертификатом и ключом так, как будто это пароли.