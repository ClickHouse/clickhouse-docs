
[//]: # (Этот файл включён в раздел FAQ > Устранение неполадок)

- [Установка](#troubleshooting-installation-errors)
- [Подключение к серверу](#troubleshooting-accepts-no-connections)
- [Обработка запросов](#troubleshooting-does-not-process-queries)
- [Эффективность обработки запросов](#troubleshooting-too-slow)

## Установка \{#troubleshooting-installation-errors\}

### Невозможно получить пакеты .deb из репозитория ClickHouse с помощью apt-get \{#you-cannot-get-deb-packages-from-clickhouse-repository-with-apt-get\}

* Проверьте настройки брандмауэра.
* Если вы по какой-либо причине не можете получить доступ к репозиторию, скачайте пакеты, как описано в статье [install guide](../getting-started/install.md), и установите их вручную с помощью команды `sudo dpkg -i <packages>`. Вам также понадобится пакет `tzdata`.

### Невозможно обновить пакеты .deb из репозитория ClickHouse с помощью apt-get \{#you-cannot-update-deb-packages-from-clickhouse-repository-with-apt-get\}

* Проблема может возникать, если ключ GPG был изменён.

Используйте руководство со страницы [setup](../getting-started/install.md#setup-the-debian-repository) для обновления конфигурации репозитория.

### При выполнении `apt-get update` появляются различные предупреждения \{#you-get-different-warnings-with-apt-get-update\}

* Полные тексты предупреждений могут быть следующими:

```bash
N: Пропущено получение настроенного файла 'main/binary-i386/Packages', так как репозиторий 'https://packages.clickhouse.com/deb stable InRelease' не поддерживает архитектуру 'i386'
```

```bash
E: Не удалось получить https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  Файл имеет неожиданный размер (30451 != 28154). Идёт синхронизация зеркала?
```

```text
E: Репозиторий 'https://packages.clickhouse.com/deb stable InRelease' изменил значение параметра 'Origin' с 'Artifactory' на 'ClickHouse'
E: Репозиторий 'https://packages.clickhouse.com/deb stable InRelease' изменил значение параметра 'Label' с 'Artifactory' на 'ClickHouse'
N: Репозиторий 'https://packages.clickhouse.com/deb stable InRelease' изменил значение параметра 'Suite' с 'stable' на ''
N: Это изменение должно быть явно подтверждено, прежде чем можно будет применять обновления для этого репозитория. Подробности см. в руководстве apt-secure(8).
```

```bash
Err:11 https://packages.clickhouse.com/deb stable InRelease
  400  Некорректный запрос [IP: 172.66.40.249 443]
```

Чтобы устранить описанную выше проблему, используйте следующий скрипт:

```bash
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Не удаётся установить пакеты через yum из‑за неверной подписи \{#you-cant-get-packages-with-yum-because-of-wrong-signature\}

Возможная причина: кэш повреждён, возможно, он сломался после обновления ключа GPG в сентябре 2022 года.

Решение — очистить кэш и каталог lib, используемые yum:

```bash
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

После этого следуйте [руководству по установке](../getting-started/install.md#from-rpm-packages)

### Не удаётся запустить Docker-контейнер \{#you-cant-run-docker-container\}

Вы выполняете простой `docker run clickhouse/clickhouse-server`, и он аварийно завершается, выводя трассировку стека, похожую на следующую:

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

Причина — устаревший демон Docker версии ниже `20.10.10`. Исправить это можно либо обновив Docker, либо запустив `docker run [--privileged | --security-opt seccomp=unconfined]`. Второй вариант несет риски для безопасности.

```

## Подключение к серверу {#troubleshooting-accepts-no-connections}

Возможные проблемы:

* Сервер не запущен.
* Некорректные или неожиданные параметры конфигурации.

### Сервер не запущен {#server-is-not-running}

**Проверьте, запущен ли сервер**

Команда:

```bash
$ sudo service clickhouse-server status
```

Если сервер не запущен, запустите его командой:

```bash
$ sudo service clickhouse-server start
```

**Проверьте логи**

Основной лог `clickhouse-server` по умолчанию расположен в `/var/log/clickhouse-server/clickhouse-server.log`.

Если сервер успешно запустился, вы увидите строки:

* `<Information> Application: starting up.` — Сервер запущен.
* `<Information> Application: Ready for connections.` — Сервер работает и готов принимать подключения.

Если запуск `clickhouse-server` завершился ошибкой конфигурации, вы увидите строку `<Error>` с описанием ошибки. Например:

```text
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Не удалось перезагрузить внешний словарь 'event2id': Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Соединение отклонено, e.what() = Соединение отклонено
```

Если в конце файла нет сообщения об ошибке, просмотрите весь файл, начиная со строки:

```text
<Information> Приложение: запускается.
```

Если вы попытаетесь запустить второй экземпляр `clickhouse-server` на сервере, вы увидите в логе следующее:

```text
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : Запуск ClickHouse 19.1.0, ревизия 54413
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Приложение: запускается
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: файл состояния ./status уже существует — некорректный перезапуск. Содержимое:
PID: 8510
Запущен: 2019-01-11 15:24:23
Ревизия: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Приложение: DB::Exception: невозможно заблокировать файл ./status. Другой экземпляр сервера в этом же каталоге уже запущен.
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Приложение: завершает работу
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Приложение: деинициализация подсистемы: подсистема журналирования
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: остановка потока SignalListener
```

**Просмотр логов systemd**

Если в логах `clickhouse-server` нет полезной информации или они отсутствуют вовсе, вы можете просмотреть логи `systemd` с помощью команды:

```bash
$ sudo journalctl -u clickhouse-server
```

**Запустите clickhouse-server в интерактивном режиме**

```bash
$ sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

Эта команда запускает сервер как интерактивное приложение со стандартными параметрами скрипта автозапуска. В этом режиме `clickhouse-server` выводит все сообщения о событиях в консоль.

### Параметры конфигурации {#configuration-parameters}

Проверьте:

* Настройки Docker.

  Если вы запускаете ClickHouse в Docker в сети IPv6, убедитесь, что задано `network=host`.

* Настройки конечной точки.

  Проверьте настройки [listen&#95;host](../operations/server-configuration-parameters/settings.md#listen_host) и [tcp&#95;port](../operations/server-configuration-parameters/settings.md#tcp_port).

  По умолчанию сервер ClickHouse принимает подключения только с localhost.

* Настройки протокола HTTP.

  Проверьте настройки протокола для HTTP API.

* Настройки защищённого соединения.

  Проверьте:

  * Настройку [tcp&#95;port&#95;secure](../operations/server-configuration-parameters/settings.md#tcp_port_secure).
  * Настройки [SSL-сертификатов](../operations/server-configuration-parameters/settings.md#openssl).

    Используйте корректные параметры при подключении. Например, используйте параметр `port_secure` с `clickhouse_client`.

* Настройки пользователя.

  Возможно, вы используете неверное имя пользователя или пароль.

## Обработка запросов {#troubleshooting-does-not-process-queries}

Если ClickHouse не может выполнить запрос, он отправляет описание ошибки клиенту. В `clickhouse-client` вы получаете описание ошибки в консоли. Если вы используете HTTP-интерфейс, ClickHouse отправляет описание ошибки в теле ответа. Например:

```bash
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Неизвестный идентификатор: a. Обратите внимание, что в вашем запросе нет таблиц (секция FROM), контекст: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

Если запустить `clickhouse-client` с параметром `stack-trace`, ClickHouse вернёт стек вызовов сервера с описанием ошибки.

Вы можете увидеть сообщение об обрыве соединения. В этом случае повторите запрос. Если соединение обрывается каждый раз при выполнении запроса, проверьте журналы сервера на наличие ошибок.

## Эффективность обработки запросов {#troubleshooting-too-slow}

Если вы замечаете, что ClickHouse работает слишком медленно, необходимо выполнить профилирование нагрузки на ресурсы сервера и сеть, создаваемой вашими запросами.

Вы можете использовать утилиту clickhouse-benchmark для профилирования запросов. Она показывает количество обработанных запросов в секунду, количество обработанных строк в секунду и перцентили времени обработки запросов.
