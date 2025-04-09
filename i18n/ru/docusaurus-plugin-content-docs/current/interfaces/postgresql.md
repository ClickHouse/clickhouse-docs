---
description: 'Документация по интерфейсу проводного протокола PostgreSQL в ClickHouse'
sidebar_label: 'Интерфейс PostgreSQL'
sidebar_position: 20
slug: /interfaces/postgresql
title: 'Интерфейс PostgreSQL'
---


# Интерфейс PostgreSQL

ClickHouse поддерживает проводной протокол PostgreSQL, что позволяет использовать клиенты Postgres для подключения к ClickHouse. В некотором смысле, ClickHouse может притворяться экземпляром PostgreSQL — позволяя подключать клиентское приложение PostgreSQL к ClickHouse, которое еще не поддерживается напрямую ClickHouse (например, Amazon Redshift).

Чтобы включить проводной протокол PostgreSQL, добавьте параметр [postgresql_port](../operations/server-configuration-parameters/settings.md#postgresql_port) в файл конфигурации вашего сервера. Например, вы можете определить порт в новом XML-файле в папке `config.d`:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

Запустите ваш сервер ClickHouse и ищите сообщение в журнале подобное следующему, которое упоминает **Прослушивание протокола совместимости с PostgreSQL**:

```response
{} <Information> Приложение: Прослушивание протокола совместимости с PostgreSQL: 127.0.0.1:9005
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
Клиент `psql` требует входа с паролем, поэтому вы не сможете подключиться, используя пользователя `default` без пароля. Либо назначьте пароль пользователю `default`, либо войдите как другой пользователь.
:::

Клиент `psql` запросит пароль:

```response
Пароль для пользователя alice:
psql (14.2, сервер 22.3.1.1)
ПРЕДУПРЕЖДЕНИЕ: основная версия psql 14, основная версия сервера 22.
         Некоторые функции psql могут не работать.
Введите "help" для справки.

default=>
```

И всё! Теперь у вас есть клиент PostgreSQL, подключенный к ClickHouse, и все команды и запросы выполняются на ClickHouse.

:::note
Протокол PostgreSQL в настоящее время поддерживает только пароли в открытом виде.
:::

## Использование SSL {#using-ssl}

Если у вас настроен SSL/TLS на экземпляре ClickHouse, то `postgresql_port` будет использовать те же настройки (порт общий для защищённых и незащищённых клиентов).

Каждый клиент имеет свой собственный метод подключения с использованием SSL. Следующая команда демонстрирует, как передать сертификаты и ключ для безопасного подключения `psql` к ClickHouse:

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

## Конфигурирование аутентификации пользователей ClickHouse с SCRAM-SHA-256 {#using-scram-sha256}

Чтобы обеспечить безопасную аутентификацию пользователей в ClickHouse, рекомендуется использовать протокол SCRAM-SHA-256. Настройте пользователя, указав элемент `password_scram_sha256_hex` в файле users.xml. Хеш пароля должен быть сгенерирован с num_iterations=4096.

Убедитесь, что клиент psql поддерживает и согласовывает SCRAM-SHA-256 во время подключения.

Пример конфигурации для пользователя `user_with_sha256` с паролем `abacaba`:

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

Посмотрите [документацию PostgreSQL](https://jdbc.postgresql.org/documentation/head/ssl-client.html) для получения дополнительной информации о их настройках SSL.
