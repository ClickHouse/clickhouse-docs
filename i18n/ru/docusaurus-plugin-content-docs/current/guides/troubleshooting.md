---
'title': 'Устранение неполадок'
'description': 'Руководство по устранению неполадок установки'
'slug': '/guides/troubleshooting'
'doc_type': 'guide'
---

## Установка {#installation}

### Невозможно импортировать GPG-ключи из keyserver.ubuntu.com с помощью apt-key {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

Функция `apt-key` с [Advanced package tool (APT) устарела](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html). Пользователи должны использовать команду `gpg`. Пожалуйста, обратитесь к статье [руководство по установке](../getting-started/install/install.mdx).

### Невозможно импортировать GPG-ключи из keyserver.ubuntu.com с помощью gpg {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. Проверьте, установлен ли ваш `gpg`:

```shell
sudo apt-get install gnupg
```

### Невозможно получить deb-пакеты из репозитория ClickHouse с помощью apt-get {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. Проверьте настройки межсетевого экрана.
1. Если вы не можете получить доступ к репозиторию по какой-либо причине, загрузите пакеты, как описано в статье [руководство по установке](../getting-started/install/install.mdx), и установите их вручную с помощью команды `sudo dpkg -i <packages>`. Вам также потребуется пакет `tzdata`.

### Невозможно обновить deb-пакеты из репозитория ClickHouse с помощью apt-get {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

Проблема может возникнуть, когда GPG-ключ изменится.

Пожалуйста, используйте инструкцию на странице [настройки](/install/debian_ubuntu) для обновления конфигурации репозитория.

### Вы получаете различные предупреждения с `apt-get update` {#you-get-different-warnings-with-apt-get-update}

Завершенные сообщения предупреждений представлены одним из следующих:

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

Чтобы решить вышеуказанную проблему, пожалуйста, используйте следующий скрипт:

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Невозможно получить пакеты с помощью Yum из-за неверной подписи {#cant-get-packages-with-yum-because-of-wrong-signature}

Возможная проблема: кэш неверный, возможно, он испорчен после обновления GPG-ключа в 2022-09.

Решение состоит в очистке кэша и каталога lib для Yum:

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

После этого следуйте [руководству по установке](/install/redhat).

## Подключение к серверу {#connecting-to-the-server}

Возможные проблемы:

- Сервер не запущен.
- Непредвиденные или неверные параметры конфигурации.

### Сервер не запущен {#server-is-not-running}

#### Проверьте, запущен ли сервер {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

Если сервер не запущен, начните его с помощью команды:

```shell
sudo service clickhouse-server start
```

#### Проверьте журналы {#check-the-logs}

Основной журнал `clickhouse-server` по умолчанию находится в `/var/log/clickhouse-server/clickhouse-server.log`.

Если сервер успешно запущен, вы должны увидеть строки:

- `<Information> Application: starting up.` — Сервер запущен.
- `<Information> Application: Ready for connections.` — Сервер работает и готов к подключениям.

Если `clickhouse-server` не удалось запустить из-за ошибки конфигурации, вы должны увидеть строку `<Error>` с описанием ошибки. Например:

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

Если вы не видите ошибки в конце файла, просмотрите весь файл, начиная со строки:

```plaintext
<Information> Application: starting up.
```

Если вы пытаетесь запустить второй экземпляр `clickhouse-server` на сервере, вы увидите следующий журнал:

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

#### Просмотр журналов system.d {#see-systemd-logs}

Если вы не нашли полезной информации в журналах `clickhouse-server` или там нет никаких журналов, вы можете просмотреть журналы `system.d`, используя команду:

```shell
sudo journalctl -u clickhouse-server
```

#### Запуск clickhouse-server в интерактивном режиме {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

Эта команда запускает сервер как интерактивное приложение с стандартными параметрами сценария автозагрузки. В этом режиме `clickhouse-server` выводит все сообщения событий в консоль.

### Параметры конфигурации {#configuration-parameters}

Проверьте:

1. Настройки Docker:

    - Если вы запускаете ClickHouse в Docker в сети IPv6, убедитесь, что установлен `network=host`.

1. Настройки конечной точки.
    - Проверьте настройки [listen_host](/operations/server-configuration-parameters/settings#listen_host) и [tcp_port](/operations/server-configuration-parameters/settings#tcp_port).
    - По умолчанию сервер ClickHouse принимает соединения только с localhost.

1. Настройки HTTP-протокола:

    - Проверьте настройки протокола для HTTP API.

1. Настройки защищенного соединения.

    - Проверьте:
        - Настройку [tcp_port_secure](/operations/server-configuration-parameters/settings#tcp_port_secure).
        - Настройки для [SSL-сертификатов](/operations/server-configuration-parameters/settings#openssl).
    - Используйте правильные параметры при подключении. Например, используйте параметр `port_secure` с `clickhouse_client`.

1. Настройки пользователя:

    - Вы могли использовать неверное имя пользователя или пароль.

## Обработка запросов {#query-processing}

Если ClickHouse не может обработать запрос, он отправляет описание ошибки клиенту. В `clickhouse-client` вы получите описание ошибки в консоли. Если вы используете HTTP-интерфейс, ClickHouse отправляет описание ошибки в теле ответа. Например:

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

Если вы запускаете `clickhouse-client` с параметром `stack-trace`, ClickHouse возвращает стек вызовов сервера с описанием ошибки.

Вы можете увидеть сообщение о разорванном соединении. В этом случае вы можете повторить запрос. Если соединение разрывается каждый раз при выполнении запроса, проверьте журналы сервера на наличие ошибок.

## Эффективность обработки запросов {#efficiency-of-query-processing}

Если вы видите, что ClickHouse работает слишком медленно, вам нужно профилировать нагрузку на ресурсы сервера и сеть для ваших запросов.

Вы можете использовать утилиту clickhouse-benchmark для профилирования запросов. Она показывает количество запросов, обработанных в секунду, количество строк, обработанных в секунду, и перцентили времени обработки запросов.
