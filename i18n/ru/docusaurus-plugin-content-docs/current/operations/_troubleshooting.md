[//]: # (Этот файл включен в FAQ > Устранение неполадок)

- [Установка](#troubleshooting-installation-errors)
- [Подключение к серверу](#troubleshooting-accepts-no-connections)
- [Обработка запросов](#troubleshooting-does-not-process-queries)
- [Эффективность обработки запросов](#troubleshooting-too-slow)

## Установка {#troubleshooting-installation-errors}

### Вы не можете получить deb пакеты из репозитория ClickHouse с помощью apt-get {#you-cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

- Проверьте настройки брандмауэра.
- Если вы не можете получить доступ к репозиторию по какой-либо причине, загрузите пакеты, как описано в статье [инструкции по установке](../getting-started/install.md), и установите их вручную с помощью команды `sudo dpkg -i <packages>`. Вам также понадобится пакет `tzdata`.

### Вы не можете обновить deb пакеты из репозитория ClickHouse с помощью apt-get {#you-cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

- Проблема может возникнуть, когда GPG ключ был изменен.

Пожалуйста, используйте инструкцию с страницы [настройки](../getting-started/install.md#setup-the-debian-repository) для обновления конфигурации репозитория.

### Вы получаете разные предупреждения с `apt-get update` {#you-get-different-warnings-with-apt-get-update}

- Завершенные сообщения предупреждений выглядят следующим образом:

```bash
N: Skipping acquire of configured file 'main/binary-i386/Packages' as repository 'https://packages.clickhouse.com/deb stable InRelease' doesn't support architecture 'i386'
```

```bash
E: Failed to fetch https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  File has unexpected size (30451 != 28154). Mirror sync in progress?
```

```text
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Origin' value from 'Artifactory' to 'ClickHouse'
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Label' value from 'Artifactory' to 'ClickHouse'
N: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Suite' value from 'stable' to ''
N: This must be accepted explicitly before updates for this repository can be applied. See apt-secure(8) manpage for details.
```

```bash
Err:11 https://packages.clickhouse.com/deb stable InRelease
  400  Bad Request [IP: 172.66.40.249 443]
```

Чтобы решить вышеуказанную проблему, используйте следующий скрипт:

```bash
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Вы не можете получить пакеты с помощью yum из-за неверной подписи {#you-cant-get-packages-with-yum-because-of-wrong-signature}

Возможная проблема: кеш неверный, возможно, он испорчен после обновления GPG ключа в 2022-09.

Решение — очистить кеш и каталог lib для yum:

```bash
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

После этого следуйте [инструкции по установке](../getting-started/install.md#from-rpm-packages).

### Вы не можете запустить контейнер Docker {#you-cant-run-docker-container}

Вы запускаете простую команду `docker run clickhouse/clickhouse-server`, и она завершается с трассировкой стека, подобной следующей:

```bash
$ docker run -it clickhouse/clickhouse-server
........
Poco::Exception. Code: 1000, e.code() = 0, System exception: cannot start thread, Stack trace (when copying this message, always include the lines below):

0. Poco::ThreadImpl::startImpl(Poco::SharedPtr<Poco::Runnable, Poco::ReferenceCounter, Poco::ReleasePolicy<Poco::Runnable>>) @ 0x00000000157c7b34
1. Poco::Thread::start(Poco::Runnable&) @ 0x00000000157c8a0e
2. BaseDaemon::initializeTerminationAndSignalProcessing() @ 0x000000000d267a14
3. BaseDaemon::initialize(Poco::Util::Application&) @ 0x000000000d2652cb
4. DB::Server::initialize(Poco::Util::Application&) @ 0x000000000d128b38
5. Poco::Util::Application::run() @ 0x000000001581cfda
6. DB::Server::run() @ 0x000000000d1288f0
7. Poco::Util::ServerApplication::run(int, char**) @ 0x0000000015825e27
8. mainEntryClickHouseServer(int, char**) @ 0x000000000d125b38
9. main @ 0x0000000007ea4eee
10. ? @ 0x00007f67ff946d90
11. ? @ 0x00007f67ff946e40
12. _start @ 0x00000000062e802e
 (version 24.10.1.2812 (official build))
```

Причина — устаревший демон Docker версии ниже `20.10.10`. Способ исправить это — либо обновить его, либо запустить команду `docker run [--privileged | --security-opt seccomp=unconfined]`. Последний вариант имеет последствия для безопасности.

## Подключение к серверу {#troubleshooting-accepts-no-connections}

Возможные проблемы:

- Сервер не запущен.
- Неожиданные или неверные параметры конфигурации.

### Сервер не запущен {#server-is-not-running}

**Проверьте, работает ли сервер**

Команда:

```bash
$ sudo service clickhouse-server status
```

Если сервер не запущен, запустите его с помощью команды:

```bash
$ sudo service clickhouse-server start
```

**Проверьте журналы**

Основной журнал `clickhouse-server` по умолчанию находится в `/var/log/clickhouse-server/clickhouse-server.log`.

Если сервер был успешно запущен, вы должны увидеть строки:

- `<Information> Application: starting up.` — Сервер запущен.
- `<Information> Application: Ready for connections.` — Сервер работает и готов принимать соединения.

Если запуск `clickhouse-server` не удался из-за ошибки конфигурации, вы должны увидеть строку `<Error>` с описанием ошибки. Например:

```text
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

Если вы не видите ошибку в конце файла, просмотрите весь файл, начиная с строки:

```text
<Information> Application: starting up.
```

Если вы пытаетесь запустить второй экземпляр `clickhouse-server` на сервере, вы увидите следующий журнал:

```text
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

**Просмотрите логи system.d**

Если вы не найдете полезной информации в журналах `clickhouse-server` или если журналов нет, вы можете просмотреть логи `system.d`, используя команду:

```bash
$ sudo journalctl -u clickhouse-server
```

**Запустите clickhouse-server в интерактивном режиме**

```bash
$ sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

Эта команда запускает сервер как интерактивное приложение с стандартными параметрами автозагрузки. В этом режиме `clickhouse-server` выводит все сообщения событий в консоль.

### Параметры конфигурации {#configuration-parameters}

Проверьте:

- Настройки Docker.

    Если вы запускаете ClickHouse в Docker в сети IPv6, убедитесь, что установлено `network=host`.

- Настройки конечной точки.

    Проверьте настройки [listen_host](../operations/server-configuration-parameters/settings.md#listen_host) и [tcp_port](../operations/server-configuration-parameters/settings.md#tcp_port).

    Сервер ClickHouse по умолчанию принимает соединения только с localhost.

- Настройки протокола HTTP.

    Проверьте настройки протокола для HTTP API.

- Настройки безопасного соединения.

    Проверьте:

  - Параметр [tcp_port_secure](../operations/server-configuration-parameters/settings.md#tcp_port_secure).
  - Настройки для [SSL сертификатов](../operations/server-configuration-parameters/settings.md#openssl).

    Используйте правильные параметры при подключении. Например, используйте параметр `port_secure` с `clickhouse_client`.

- Настройки пользователя.

    Возможно, вы используете неверное имя пользователя или пароль.

## Обработка запросов {#troubleshooting-does-not-process-queries}

Если ClickHouse не может обработать запрос, он отправляет описание ошибки клиенту. В `clickhouse-client` вы получаете описание ошибки в консоли. Если вы используете HTTP интерфейс, ClickHouse отправляет описание ошибки в теле ответа. Например:

```bash
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

Если вы запускаете `clickhouse-client` с параметром `stack-trace`, ClickHouse возвращает трассировку стека сервера с описанием ошибки.

Вы можете увидеть сообщение о разорванном соединении. В этом случае вы можете повторить запрос. Если соединение разрывается каждый раз, когда вы выполняете запрос, проверьте журналы сервера на наличие ошибок.

## Эффективность обработки запросов {#troubleshooting-too-slow}

Если вы видите, что ClickHouse работает слишком медленно, вам нужно профилировать нагрузку на ресурсы сервера и сеть для ваших запросов.

Вы можете использовать утилиту clickhouse-benchmark для профилирования запросов. Она показывает количество обработанных запросов в секунду, количество строк, обработанных в секунду, и процентиль времени обработки запросов.