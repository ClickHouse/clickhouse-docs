---
title: 'Устранение неисправностей'
---

## Установка {#installation}

### Невозможно импортировать GPG ключи с keyserver.ubuntu.com с помощью apt-key {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

Функция `apt-key` с [Advanced package tool (APT) устарела](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html). Пользователям следует вместо этого использовать команду `gpg`. Пожалуйста, обратитесь к статье [руководство по установке](../getting-started/install.md).

### Невозможно импортировать GPG ключи с keyserver.ubuntu.com с помощью gpg {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. Проверьте, установлена ли ваша `gpg`:

```shell
sudo apt-get install gnupg
```

### Невозможно получить deb пакеты из репозитория ClickHouse с помощью apt-get {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. Проверьте настройки брандмауэра.
1. Если вы не можете получить доступ к репозиторию по какой-либо причине, загрузите пакеты, как описано в статье [руководство по установке](../getting-started/install.md), и установите их вручную с помощью команды `sudo dpkg -i <packages>`. Вам также потребуется пакет `tzdata`.

### Невозможно обновить deb пакеты из репозитория ClickHouse с помощью apt-get {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

Проблема может возникнуть, если GPG ключ изменился.

Пожалуйста, используйте руководство с страницы [настройка](../getting-started/install.md#setup-the-debian-repository) для обновления конфигурации репозитория.

### Вы получаете различные предупреждения с `apt-get update` {#you-get-different-warnings-with-apt-get-update}

Полные сообщения об ошибках могут быть одними из следующих:

```shell
N: Пропуск получения сконфигурированного файла 'main/binary-i386/Packages', так как репозиторий 'https://packages.clickhouse.com/deb stable InRelease' не поддерживает архитектуру 'i386'
```

```shell
E: Не удалось получить https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  Файл имеет неожидаемый размер (30451 != 28154). Синхронизация зеркала в процессе?
```

```shell
E: Репозиторий 'https://packages.clickhouse.com/deb stable InRelease' изменил значение 'Origin' с 'Artifactory' на 'ClickHouse'
E: Репозиторий 'https://packages.clickhouse.com/deb stable InRelease' изменил значение 'Label' с 'Artifactory' на 'ClickHouse'
N: Репозиторий 'https://packages.clickhouse.com/deb stable InRelease' изменил значение 'Suite' с 'stable' на ''
N: Это должно быть явно принято перед тем, как можно будет применить обновления для этого репозитория. См. man-страницу apt-secure(8) для деталей.
```

```shell
Err:11 https://packages.clickhouse.com/deb stable InRelease
400  Неверный запрос [IP: 172.66.40.249 443]
```

Чтобы решить вышеперечисленные проблемы, пожалуйста, используйте следующий скрипт:

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Невозможно получить пакеты с Yum из-за неверной подписи {#cant-get-packages-with-yum-because-of-wrong-signature}

Возможная проблема: кэш неверный, возможно, он поврежден после обновления GPG ключа в 2022-09.

Решением является очистка кэша и библиотеки для Yum:

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

После этого следуйте [руководству по установке](../getting-started/install.md#from-rpm-packages)

## Подключение к серверу {#connecting-to-the-server}

Возможные проблемы:

- Сервер не запущен.
- Неожиданные или неправильные параметры конфигурации.

### Сервер не запущен {#server-is-not-running}

#### Проверьте, работает ли сервер {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

Если сервер не запущен, запустите его с помощью команды:

```shell
sudo service clickhouse-server start
```

#### Проверьте журналы {#check-the-logs}

Основной журнал `clickhouse-server` по умолчанию находится в `/var/log/clickhouse-server/clickhouse-server.log`.

Если сервер успешно запустился, вы должны увидеть строки:

- `<Information> Application: starting up.` — Сервер запустился.
- `<Information> Application: Ready for connections.` — Сервер работает и готов к подключению.

Если запуск `clickhouse-server` завершился неудачей из-за ошибки конфигурации, вы должны увидеть строку `<Error>` с описанием ошибки. Например:

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Ошибка перезагрузки внешнего словаря 'event2id': Poco::Exception. Код: 1000, e.code() = 111, e.displayText() = Подключение отклонено, e.what() = Подключение отклонено
```

Если вы не видите ошибки в конце файла, просмотрите весь файл, начиная с строки:

```plaintext
<Information> Application: starting up.
```

Если вы попытаетесь запустить второй экземпляр `clickhouse-server` на сервере, вы увидите следующий журнал:

```plaintext
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : Запуск ClickHouse 19.1.0 с ревизией 54413
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: starting up
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: Файл состояния ./status уже существует - некорректный перезапуск. Содержимое:
PID: 8510
Запущен: 2019-01-11 15:24:23
Ревизия: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: Невозможно заблокировать файл ./status. Другой экземпляр сервера в той же директории уже работает.
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: завершение работы
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: Разинициализация подсистемы: Подсистема ведения журналов
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: Остановка потока SignalListener
```

#### Просмотр журналов system.d {#see-systemd-logs}

Если вы не нашли никаких полезных сведений в журналах `clickhouse-server` или там нет журналов, вы можете просмотреть журналы `system.d` с помощью команды:

```shell
sudo journalctl -u clickhouse-server
```

#### Запуск clickhouse-server в интерактивном режиме {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

Эта команда запускает сервер как интерактивное приложение с параметрами стандартного скрипта автозапуска. В этом режиме `clickhouse-server` выводит все сообщения событий в консоль.

### Параметры конфигурации {#configuration-parameters}

Проверьте:

1. Настройки Docker:

    - Если вы запускаете ClickHouse в Docker в сети IPv6, убедитесь, что `network=host` установлен.

1. Настройки конечной точки.
    - Проверьте параметры [listen_host](/operations/server-configuration-parameters/settings#listen_host) и [tcp_port](/operations/server-configuration-parameters/settings#tcp_port).
    - По умолчанию сервер ClickHouse принимает соединения только от localhost.

1. Настройки протокола HTTP:

    - Проверьте настройки протокола для HTTP API.

1. Настройки защищенного соединения.

    - Проверьте:
        - Параметр [tcp_port_secure](/operations/server-configuration-parameters/settings#tcp_port_secure).
        - Параметры [SSL сертификатов](/operations/server-configuration-parameters/settings#openssl).
    - Используйте правильные параметры при подключении. Например, используйте параметр `port_secure` с `clickhouse_client`.

1. Настройки пользователя:

    - Возможно, вы используете неправильное имя пользователя или пароль.

## Обработка запросов {#query-processing}

Если ClickHouse не может обработать запрос, он отправляет описание ошибки клиенту. В `clickhouse-client` вы получаете описание ошибки в консоли. Если вы используете HTTP интерфейс, ClickHouse отправляет описание ошибки в теле ответа. Например:

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Неизвестный идентификатор: a. Обратите внимание, что в вашем запросе нет таблиц (FROM clause), context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

Если вы запускаете `clickhouse-client` с параметром `stack-trace`, ClickHouse возвращает стек вызовов сервера вместе с описанием ошибки.

Вы можете видеть сообщение о разорванном соединении. В этом случае вы можете повторить запрос. Если соединение разрывается каждый раз во время выполнения запроса, проверьте журналы сервера на наличие ошибок.

## Эффективность обработки запросов {#efficiency-of-query-processing}

Если вы видите, что ClickHouse работает слишком медленно, вам нужно профилировать нагрузку на ресурсы сервера и сеть для ваших запросов.

Вы можете использовать утилиту clickhouse-benchmark для профилирования запросов. Она показывает количество запросов, обрабатываемых в секунду, количество строк, обрабатываемых в секунду, и_percentiles_ времени обработки запросов.
