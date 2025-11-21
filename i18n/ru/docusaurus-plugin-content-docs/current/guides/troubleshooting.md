---
title: 'Устранение неполадок'
description: 'Руководство по устранению неполадок при установке'
slug: /guides/troubleshooting
doc_type: 'guide'
keywords: ['troubleshooting', 'debugging', 'problem solving', 'errors', 'diagnostics']
---



## Установка {#installation}

### Невозможно импортировать GPG-ключи с keyserver.ubuntu.com с помощью apt-key {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

Функция `apt-key` в [Advanced package tool (APT) объявлена устаревшей](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html). Пользователям следует использовать команду `gpg`. Обратитесь к [руководству по установке](../getting-started/install/install.mdx).

### Невозможно импортировать GPG-ключи с keyserver.ubuntu.com с помощью gpg {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. Проверьте, установлен ли `gpg`:

```shell
sudo apt-get install gnupg
```

### Невозможно получить deb-пакеты из репозитория ClickHouse с помощью apt-get {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. Проверьте настройки брандмауэра.
1. Если вы не можете получить доступ к репозиторию по какой-либо причине, загрузите пакеты, как описано в [руководстве по установке](../getting-started/install/install.mdx), и установите их вручную с помощью команды `sudo dpkg -i <packages>`. Вам также потребуется пакет `tzdata`.

### Невозможно обновить deb-пакеты из репозитория ClickHouse с помощью apt-get {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

Проблема может возникнуть при изменении GPG-ключа.

Используйте инструкцию со страницы [настройки](/install/debian_ubuntu) для обновления конфигурации репозитория.

### Вы получаете различные предупреждения при выполнении `apt-get update` {#you-get-different-warnings-with-apt-get-update}

Полные сообщения с предупреждениями выглядят следующим образом:

```shell
N: Skipping acquire of configured file 'main/binary-i386/Packages' as repository 'https://packages.clickhouse.com/deb stable InRelease' doesn't support architecture 'i386'
```

```shell
E: Failed to fetch https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  File has unexpected size (30451 != 28154). Mirror sync in progress?
```

```shell
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Origin' value from 'Artifactory' to 'ClickHouse'
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Label' value from 'Artifactory' to 'ClickHouse'
N: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Suite' value from 'stable' to ''
N: This must be accepted explicitly before updates for this repository can be applied. See apt-secure(8) manpage for details.
```

```shell
Err:11 https://packages.clickhouse.com/deb stable InRelease
400  Bad Request [IP: 172.66.40.249 443]
```

Для решения указанной проблемы используйте следующий скрипт:

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Невозможно получить пакеты с помощью Yum из-за неверной подписи {#cant-get-packages-with-yum-because-of-wrong-signature}

Возможная проблема: кеш поврежден, возможно, он был нарушен после обновления GPG-ключа в сентябре 2022 года.

Решение заключается в очистке кеша и директории lib для Yum:

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

После этого следуйте [руководству по установке](/install/redhat)


## Подключение к серверу {#connecting-to-the-server}

Возможные проблемы:

- Сервер не запущен.
- Неожиданные или неверные параметры конфигурации.

### Сервер не запущен {#server-is-not-running}

#### Проверка, запущен ли сервер {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

Если сервер не запущен, запустите его командой:

```shell
sudo service clickhouse-server start
```

#### Проверка логов {#check-the-logs}

По умолчанию основной лог `clickhouse-server` находится в `/var/log/clickhouse-server/clickhouse-server.log`.

Если сервер успешно запустился, вы должны увидеть следующие строки:

- `<Information> Application: starting up.` — Сервер запущен.
- `<Information> Application: Ready for connections.` — Сервер работает и готов принимать подключения.

Если запуск `clickhouse-server` завершился неудачей из-за ошибки конфигурации, вы должны увидеть строку `<Error>` с описанием ошибки. Например:

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

Если вы не видите ошибку в конце файла, просмотрите весь файл, начиная со строки:

```plaintext
<Information> Application: starting up.
```

Если вы попытаетесь запустить второй экземпляр `clickhouse-server` на сервере, вы увидите следующий лог:

```plaintext
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : Starting ClickHouse 19.1.0 with revision 54413
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: starting up
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: Status file ./status already exists - unclean restart. Contents:
PID: 8510
Started at: 2019-01-11 15:24:23
Revision: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: Cannot lock file ./status. Another server instance in same directory is already running.
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: shutting down
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: Uninitializing subsystem: Logging Subsystem
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: Stop SignalListener thread
```

#### Просмотр логов system.d {#see-systemd-logs}

Если вы не нашли полезной информации в логах `clickhouse-server` или логов нет вообще, вы можете просмотреть логи `system.d` с помощью команды:

```shell
sudo journalctl -u clickhouse-server
```

#### Запуск clickhouse-server в интерактивном режиме {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

Эта команда запускает сервер как интерактивное приложение со стандартными параметрами скрипта автозапуска. В этом режиме `clickhouse-server` выводит все сообщения о событиях в консоль.

### Параметры конфигурации {#configuration-parameters}

Проверьте:

1. Настройки Docker:
   - Если вы запускаете ClickHouse в Docker в сети IPv6, убедитесь, что установлен параметр `network=host`.

1. Настройки конечных точек:
   - Проверьте настройки [listen_host](/operations/server-configuration-parameters/settings#listen_host) и [tcp_port](/operations/server-configuration-parameters/settings#tcp_port).
   - По умолчанию сервер ClickHouse принимает подключения только с localhost.

1. Настройки протокола HTTP:
   - Проверьте настройки протокола для HTTP API.

1. Настройки безопасного подключения:
   - Проверьте:
     - Настройку [tcp_port_secure](/operations/server-configuration-parameters/settings#tcp_port_secure).
     - Настройки [SSL-сертификатов](/operations/server-configuration-parameters/settings#openssl).
   - Используйте правильные параметры при подключении. Например, используйте параметр `port_secure` с `clickhouse_client`.

1. Настройки пользователя:
   - Возможно, вы используете неверное имя пользователя или пароль.


## Обработка запросов {#query-processing}

Если ClickHouse не может обработать запрос, он отправляет описание ошибки клиенту. В `clickhouse-client` описание ошибки выводится в консоль. При использовании HTTP-интерфейса ClickHouse отправляет описание ошибки в теле ответа. Например:

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

Если запустить `clickhouse-client` с параметром `stack-trace`, ClickHouse вернёт трассировку стека сервера вместе с описанием ошибки.

Вы можете увидеть сообщение о разрыве соединения. В этом случае можно повторить запрос. Если соединение разрывается при каждом выполнении запроса, проверьте журналы сервера на наличие ошибок.


## Эффективность обработки запросов {#efficiency-of-query-processing}

Если ClickHouse работает слишком медленно, необходимо проанализировать нагрузку на ресурсы сервера и сеть при выполнении ваших запросов.

Для профилирования запросов можно использовать утилиту clickhouse-benchmark. Она показывает количество обработанных запросов в секунду, количество обработанных строк в секунду и перцентили времени обработки запросов.
