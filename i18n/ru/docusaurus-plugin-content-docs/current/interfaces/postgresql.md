---
description: 'Документация для интерфейса протокола связи PostgreSQL в ClickHouse'
sidebar_label: 'Интерфейс PostgreSQL'
sidebar_position: 20
slug: /interfaces/postgresql
title: 'Интерфейс PostgreSQL'
---


# Интерфейс PostgreSQL

ClickHouse поддерживает протокол связи PostgreSQL, который позволяет использовать клиентские приложения Postgres для подключения к ClickHouse. В некотором смысле, ClickHouse может притворяться экземпляром PostgreSQL - позволяя подключать клиентское приложение PostgreSQL к ClickHouse, которое еще не поддерживается напрямую ClickHouse (например, Amazon Redshift).

Чтобы включить протокол связи PostgreSQL, добавьте параметр [postgresql_port](../operations/server-configuration-parameters/settings.md#postgresql_port) в файл конфигурации вашего сервера. Например, вы можете определить порт в новом XML файле в вашей папке `config.d`:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

Запустите ваш сервер ClickHouse и ищите сообщение в логах, похожее на следующее, которое упоминает **Listening for PostgreSQL compatibility protocol**:

```response
{} <Information> Application: Listening for PostgreSQL compatibility protocol: 127.0.0.1:9005
```

## Подключение psql к ClickHouse {#connect-psql-to-clickhouse}

Следующая команда демонстрирует, как подключить клиент PostgreSQL `psql` к ClickHouse:

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

Например:

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
Клиент `psql` требует входа с паролем, поэтому вы не сможете подключиться с пользователем `default`, у которого нет пароля. Либо задайте пароль для пользователя `default`, либо войдите как другой пользователь.
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

И всё! Теперь у вас есть клиент PostgreSQL, подключенный к ClickHouse, и все команды и запросы выполняются на ClickHouse.

:::note
Протокол PostgreSQL в настоящее время поддерживает только пароли в открытом тексте.
:::

## Использование SSL {#using-ssl}

Если у вас настроен SSL/TLS на экземпляре ClickHouse, тогда `postgresql_port` будет использовать те же настройки (порт общий для безопасных и небезопасных клиентов).

Каждый клиент имеет свой метод подключения с использованием SSL. Следующая команда демонстрирует, как передать сертификаты и ключ для безопасного подключения `psql` к ClickHouse:

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

## Настройка аутентификации пользователя ClickHouse с использованием SCRAM-SHA-256 {#using-scram-sha256}

Чтобы обеспечить безопасную аутентификацию пользователей в ClickHouse, рекомендуется использовать протокол SCRAM-SHA-256. Настройте пользователя, указав элемент `password_scram_sha256_hex` в файле users.xml. Хеш пароля должен быть сгенерирован с num_iterations=4096.

Убедитесь, что клиент psql поддерживает и согласовывает SCRAM-SHA-256 во время подключения.

Пример конфигурации для пользователя `user_with_sha256` с паролем `abacaba`:

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

Посмотрите [документацию PostgreSQL](https://jdbc.postgresql.org/documentation/head/ssl-client.html) для получения дополнительной информации о их настройках SSL.
