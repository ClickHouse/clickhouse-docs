---
slug: /interfaces/postgresql
sidebar_position: 20
sidebar_label: Интерфейс PostgreSQL
---


# Интерфейс PostgreSQL

ClickHouse поддерживает проводной протокол PostgreSQL, который позволяет вам использовать клиенты Postgres для подключения к ClickHouse. В некотором смысле, ClickHouse может делать вид, что он является экземпляром PostgreSQL - позволяя подключить клиентское приложение PostgreSQL к ClickHouse, которое еще не поддерживается напрямую ClickHouse (например, Amazon Redshift).

Чтобы включить проводной протокол PostgreSQL, добавьте настройку [postgresql_port](../operations/server-configuration-parameters/settings.md#postgresql_port) в файл конфигурации вашего сервера. Например, вы можете определить порт в новом XML-файле в вашей папке `config.d`:

```xml
<clickhouse>
	<postgresql_port>9005</postgresql_port>
</clickhouse>
```

Запустите ваш сервер ClickHouse и ищите сообщение в журнале, подобное следующему, которое упоминает **Прослушивание протокола совместимости с PostgreSQL**:

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
Клиент `psql` требует входа с паролем, поэтому вы не сможете подключиться, используя пользователя `default` без пароля. Либо назначьте пароль для пользователя `default`, либо войдите под другим пользователем.
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

И все! Теперь у вас есть клиент PostgreSQL, подключенный к ClickHouse, и все команды и запросы выполняются на ClickHouse.

:::note
Протокол PostgreSQL в настоящее время поддерживает только пароли в открытом виде.
:::

## Использование SSL {#using-ssl}

Если у вас настроен SSL/TLS на вашем экземпляре ClickHouse, то `postgresql_port` будет использовать те же настройки (порт общий для защищенных и незащищенных клиентов).

Каждый клиент имеет свой собственный метод подключения с использованием SSL. Следующая команда демонстрирует, как передать сертификаты и ключ для безопасного подключения `psql` к ClickHouse:

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

Просмотрите [документацию PostgreSQL](https://jdbc.postgresql.org/documentation/head/ssl-client.html) для получения более подробной информации о их настройках SSL.
