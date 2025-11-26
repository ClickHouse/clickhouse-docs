---
description: 'Документация по интерфейсу сетевого протокола PostgreSQL в ClickHouse'
sidebar_label: 'Интерфейс PostgreSQL'
sidebar_position: 20
slug: /interfaces/postgresql
title: 'Интерфейс PostgreSQL'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Интерфейс PostgreSQL

<CloudNotSupportedBadge />

ClickHouse поддерживает сетевой протокол PostgreSQL (PostgreSQL wire protocol), что позволяет использовать клиентские приложения PostgreSQL для подключения к ClickHouse. В определённом смысле ClickHouse может притворяться экземпляром PostgreSQL, позволяя подключать к ClickHouse клиентские приложения PostgreSQL, которые ещё не поддерживаются ClickHouse напрямую (например, Amazon Redshift).

Чтобы включить сетевой протокол PostgreSQL, добавьте настройку [postgresql&#95;port](../operations/server-configuration-parameters/settings.md#postgresql_port) в конфигурационный файл сервера. Например, вы можете задать порт в новом XML-файле в папке `config.d`:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

Запустите сервер ClickHouse и найдите в журнале сообщение, аналогичное следующему, в котором упоминается **Listening for PostgreSQL compatibility protocol**:

```response
{} <Information> Application: Прослушивание протокола совместимости PostgreSQL: 127.0.0.1:9005
```


## Подключение psql к ClickHouse

Следующая команда демонстрирует, как подключиться к ClickHouse с помощью клиента PostgreSQL `psql`:

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

Например:

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
Клиент `psql` требует аутентификации с паролем, поэтому вы не сможете подключиться, используя пользователя `default` без пароля. Либо задайте пароль пользователю `default`, либо войдите под другим пользователем.
:::

Клиент `psql` запрашивает ввод пароля:

```response
Пароль для пользователя alice:
psql (14.2, server 22.3.1.1)
ПРЕДУПРЕЖДЕНИЕ: мажорная версия psql 14, мажорная версия сервера 22.
         Некоторые функции psql могут работать некорректно.
Введите "help" для вызова справки.

default=>
```

И готово! Теперь у вас есть клиент PostgreSQL, подключённый к ClickHouse, и все команды и запросы выполняются на стороне ClickHouse.

:::note
В настоящее время протокол PostgreSQL поддерживает только пароли в открытом виде (plain-text).
:::


## Использование SSL

Если в вашем инстансе ClickHouse настроен SSL/TLS, то `postgresql_port` будет использовать те же настройки (порт общий как для защищённых, так и для незащищённых клиентов).

У каждого клиента свой способ подключения по SSL. Следующая команда демонстрирует, как передать сертификаты и ключ для безопасного подключения `psql` к ClickHouse:

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```


## Настройка аутентификации пользователей ClickHouse с использованием SCRAM-SHA-256

Чтобы обеспечить безопасную аутентификацию пользователей в ClickHouse, рекомендуется использовать протокол SCRAM-SHA-256. Настройте пользователя, указав элемент `password_scram_sha256_hex` в файле users.xml. Хеш пароля должен быть сгенерирован с параметром num&#95;iterations=4096.

Убедитесь, что клиент psql поддерживает SCRAM-SHA-256 и использует его при согласовании параметров подключения.

Пример конфигурации для пользователя `user_with_sha256` с паролем `abacaba`:

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

См. [документацию PostgreSQL](https://jdbc.postgresql.org/documentation/head/ssl-client.html) для получения дополнительной информации о настройках SSL.
