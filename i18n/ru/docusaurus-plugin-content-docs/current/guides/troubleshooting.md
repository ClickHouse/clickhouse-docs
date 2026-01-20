---
title: 'Устранение неполадок'
description: 'Руководство по устранению неполадок при установке'
slug: /guides/troubleshooting
doc_type: 'guide'
keywords: ['устранение неполадок', 'отладка', 'решение проблем', 'ошибки', 'диагностика']
---

## Установка \{#installation\}

### Не удаётся импортировать ключи GPG с keyserver.ubuntu.com с помощью apt-key \{#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key\}

Команда `apt-key` в [Advanced Package Tool (APT) признана устаревшей](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html). Вместо неё следует использовать команду `gpg`. Обратитесь к статье [руководства по установке](../getting-started/install/install.mdx).

### Не удаётся импортировать ключи GPG с keyserver.ubuntu.com с помощью gpg \{#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg\}

1. Проверьте, установлен ли у вас `gpg`:

```shell
sudo apt-get install gnupg
```


### Не удаётся получить deb-пакеты из репозитория ClickHouse с помощью apt-get \{#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get\}

1. Проверьте настройки брандмауэра.
1. Если вы по какой-либо причине не можете получить доступ к репозиторию, загрузите пакеты, как описано в статье [руководства по установке](../getting-started/install/install.mdx), и установите их вручную с помощью команды `sudo dpkg -i <packages>`. Вам также понадобится пакет `tzdata`.

### Не удаётся обновить deb-пакеты из репозитория ClickHouse с помощью apt-get \{#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get\}

Проблема может возникнуть, если был изменён ключ GPG.

Используйте инструкцию со страницы [setup](/install/debian_ubuntu), чтобы обновить конфигурацию репозитория.

### Вы получаете различные предупреждения при выполнении `apt-get update` \{#you-get-different-warnings-with-apt-get-update\}

Полные сообщения предупреждений выглядят как один из следующих вариантов:

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

Для решения описанной выше проблемы используйте следующий скрипт:

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```


### Не удаётся получить пакеты через Yum из‑за неверной подписи \{#cant-get-packages-with-yum-because-of-wrong-signature\}

Возможная причина: некорректный кэш; возможно, он был повреждён после обновления ключа GPG в сентябре 2022 года.

Решение — очистить кэш и каталог lib для Yum:

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

Затем следуйте [руководству по установке](/install/redhat)


## Подключение к серверу \{#connecting-to-the-server\}

Возможные проблемы:

* Сервер не запущен.
* Неожиданные или неверные параметры конфигурации.

### Сервер не запущен \{#server-is-not-running\}

#### Проверьте, запущен ли сервер \{#check-if-server-is-running\}

```shell
sudo service clickhouse-server status
```

Если сервер не запущен, запустите его с помощью команды:

```shell
sudo service clickhouse-server start
```


#### Проверьте логи \{#check-the-logs\}

Основной лог `clickhouse-server` по умолчанию находится в `/var/log/clickhouse-server/clickhouse-server.log`.

Если сервер успешно запустился, вы увидите строки:

* `<Information> Application: starting up.` — Сервер запущен.
* `<Information> Application: Ready for connections.` — Сервер работает и готов принимать подключения.

Если запуск `clickhouse-server` завершился ошибкой конфигурации, вы увидите строку `<Error>` с описанием ошибки. Например:

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

Если в конце файла нет сообщения об ошибке, просмотрите весь файл, начиная со строки:

```plaintext
<Information> Application: starting up.
```

Если вы попытаетесь запустить второй экземпляр `clickhouse-server` на сервере, вы увидите следующую запись в журнале:

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


#### Просмотр журналов systemd \{#see-systemd-logs\}

Если вы не находите полезной информации в журналах `clickhouse-server` или их вовсе нет, вы можете просмотреть журналы `systemd` с помощью команды:

```shell
sudo journalctl -u clickhouse-server
```


#### Запустите clickhouse-server в интерактивном режиме \{#start-clickhouse-server-in-interactive-mode\}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

Эта команда запускает сервер как интерактивное приложение со стандартными параметрами, используемыми скриптом автозапуска. В этом режиме `clickhouse-server` выводит все сообщения о событиях в консоль.


### Параметры конфигурации \{#configuration-parameters\}

Проверьте:

1. Настройки Docker:

   * Если вы запускаете ClickHouse в Docker в сети IPv6, убедитесь, что задано `network=host`.

2. Настройки конечной точки (endpoint).
   * Проверьте параметры [listen&#95;host](/operations/server-configuration-parameters/settings#listen_host) и [tcp&#95;port](/operations/server-configuration-parameters/settings#tcp_port).
   * По умолчанию сервер ClickHouse принимает подключения только с localhost.

3. Настройки протокола HTTP:

   * Проверьте параметры протокола для HTTP API.

4. Настройки защищённого соединения.

   * Проверьте:
     * Параметр [tcp&#95;port&#95;secure](/operations/server-configuration-parameters/settings#tcp_port_secure).
     * Параметры для [SSL-сертификатов](/operations/server-configuration-parameters/settings#openssl).
   * Используйте корректные параметры при подключении. Например, используйте параметр `port_secure` с `clickhouse_client`.

5. Настройки пользователей:

   * Возможно, вы используете неверное имя пользователя или пароль.

## Обработка запросов \{#query-processing\}

Если ClickHouse не может выполнить запрос, он отправляет описание ошибки клиенту. В `clickhouse-client` вы получаете описание ошибки в консоли. Если вы используете HTTP-интерфейс, ClickHouse отправляет описание ошибки в теле ответа. Например:

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

Если вы запускаете `clickhouse-client` с параметром `stack-trace`, ClickHouse возвращает стек вызовов сервера с описанием ошибки.

Вы можете увидеть сообщение о разорванном соединении. В этом случае можно повторить запрос. Если соединение обрывается каждый раз при выполнении запроса, проверьте журналы сервера на наличие ошибок.


## Эффективность обработки запросов \{#efficiency-of-query-processing\}

Если вы замечаете, что ClickHouse работает слишком медленно, следует проанализировать нагрузку на ресурсы сервера и сеть при выполнении ваших запросов.

Для профилирования запросов вы можете использовать утилиту clickhouse-benchmark. Она показывает количество запросов, обрабатываемых в секунду, количество строк, обрабатываемых в секунду, а также перцентили времени обработки запросов.