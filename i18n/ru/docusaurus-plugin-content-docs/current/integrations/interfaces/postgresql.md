---
description: 'Документация по интерфейсу сетевого протокола PostgreSQL в ClickHouse'
sidebar_label: 'Интерфейс PostgreSQL'
sidebar_position: 20
slug: /interfaces/postgresql
title: 'Интерфейс PostgreSQL'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Интерфейс PostgreSQL \{#postgresql-interface\}

<CloudNotSupportedBadge />

ClickHouse поддерживает сетевой протокол PostgreSQL (PostgreSQL wire protocol), что позволяет использовать клиенты PostgreSQL для подключения к ClickHouse. В некотором смысле ClickHouse может выдавать себя за экземпляр PostgreSQL, позволяя подключать к ClickHouse клиентские приложения PostgreSQL, которые ещё не поддерживаются ClickHouse напрямую (например, Amazon Redshift).

Чтобы включить сетевой протокол PostgreSQL, добавьте настройку [postgresql&#95;port](/operations/server-configuration-parameters/settings#postgresql_port) в конфигурационный файл сервера. Например, вы можете определить этот порт в новом XML‑файле в папке `config.d`:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

Запустите сервер ClickHouse и найдите в его журнале сообщение, похожее на следующее и содержащее фразу **Listening for PostgreSQL compatibility protocol**:

```response
{} <Information> Application: Listening for PostgreSQL compatibility protocol: 127.0.0.1:9005
```

## Подключение psql к ClickHouse \{#connect-psql-to-clickhouse\}

Следующая команда показывает, как подключить клиент PostgreSQL `psql` к ClickHouse:

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

Например:

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
Клиент `psql` требует входа с использованием пароля, поэтому вы не сможете подключиться, используя пользователя `default` без пароля. Либо задайте пароль пользователю `default`, либо войдите под учетной записью другого пользователя.
:::

Клиент `psql` запрашивает пароль:

```response
Password for user alice:
psql (14.2, server 22.3.1.1)
WARNING: psql major version 14, server major version 22.
         Some psql features might not work.
Type "help" for help.

default=>
```

Вот и всё! Теперь у вас есть клиент PostgreSQL, подключённый к ClickHouse, и все команды и запросы выполняются в ClickHouse.

:::note
Протокол PostgreSQL в настоящий момент поддерживает только пароли в виде открытого текста.
:::

## Использование SSL \{#using-ssl\}

Если в экземпляре ClickHouse у вас настроен SSL/TLS, то `postgresql_port` будет использовать те же настройки (порт общий для защищённых и незащищённых клиентов).

У каждого клиента свой способ подключения с использованием SSL. Следующая команда показывает, как передать сертификаты и ключ для безопасного подключения `psql` к ClickHouse:

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

## Настройка аутентификации пользователей ClickHouse с использованием SCRAM-SHA-256 \{#using-scram-sha256\}

Чтобы обеспечить безопасную аутентификацию пользователей в ClickHouse, рекомендуется использовать протокол SCRAM-SHA-256. Настройте пользователя, указав элемент `password_scram_sha256_hex` в файле users.xml. Хеш пароля должен быть сгенерирован с числом итераций num&#95;iterations=4096.

Убедитесь, что клиент psql поддерживает SCRAM-SHA-256 и использует его при установлении соединения.

Пример конфигурации для пользователя `user_with_sha256` с паролем `abacaba`:

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

Подробнее о параметрах SSL см. в [документации PostgreSQL](https://jdbc.postgresql.org/documentation/head/ssl-client.html).
