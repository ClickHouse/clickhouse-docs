---
slug: /sql-reference/statements/create/dictionary/sources/http
title: 'Источник словаря HTTP(S)'
sidebar_position: 5
sidebar_label: 'HTTP(S)'
description: 'Настройка HTTP- или HTTPS-эндпоинта в качестве источника словаря в ClickHouse.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Работа с HTTP(S)-сервером зависит от того, [как словарь хранится в памяти](../layouts/). Если словарь хранится с использованием `cache` и `complex_key_cache`, ClickHouse запрашивает необходимые ключи, отправляя запрос методом `POST`.

Пример настроек:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(HTTP(
        url 'http://[::1]/os.tsv'
        format 'TabSeparated'
        credentials(user 'user' password 'password')
        headers(header(name 'API-KEY' value 'key'))
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <http>
            <url>http://[::1]/os.tsv</url>
            <format>TabSeparated</format>
            <credentials>
                <user>user</user>
                <password>password</password>
            </credentials>
            <headers>
                <header>
                    <name>API-KEY</name>
                    <value>key</value>
                </header>
            </headers>
        </http>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

Для того чтобы ClickHouse мог получить доступ к HTTPS-ресурсу, необходимо [настроить OpenSSL](/operations/server-configuration-parameters/settings#openssl) в конфигурации сервера.

Поля настроек:

| Setting       | Description                                                                                |
| ------------- | ------------------------------------------------------------------------------------------ |
| `url`         | Исходный URL.                                                                              |
| `format`      | Формат файла. Поддерживаются все форматы, описанные в [Formats](/sql-reference/formats).   |
| `credentials` | Базовая HTTP-аутентификация. Необязательный параметр.                                      |
| `user`        | Имя пользователя, необходимое для аутентификации.                                          |
| `password`    | Пароль, необходимый для аутентификации.                                                    |
| `headers`     | Все пользовательские HTTP-заголовки, используемые в HTTP-запросе. Необязательный параметр. |
| `header`      | Отдельная запись HTTP-заголовка.                                                           |
| `name`        | Имя идентификатора, используемое для заголовка, отправляемого в запросе.                   |
| `value`       | Значение, установленное для конкретного имени идентификатора.                              |

При создании словаря с помощью DDL-команды (`CREATE DICTIONARY ...`) удалённые хосты для HTTP-словарей проверяются на соответствие содержимому секции `remote_url_allow_hosts` в конфигурации, чтобы предотвратить доступ пользователей базы данных к произвольным HTTP-серверам.
