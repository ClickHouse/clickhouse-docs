# Установка ClickHouse в Windows с использованием WSL



## Требования {#requirements}

:::note
Для установки ClickHouse в Windows потребуется WSL (подсистема Windows для Linux).
:::

<VerticalStepper>


## Установка WSL {#install-wsl}

Откройте Windows PowerShell от имени администратора и выполните следующую команду:

```bash
wsl --install
```

Вам будет предложено ввести новое имя пользователя и пароль UNIX. После того как вы введёте желаемое имя пользователя и пароль, вы увидите сообщение следующего вида:

```bash
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```


## Установка ClickHouse с помощью скрипта через curl {#install-clickhouse-via-script-using-curl}

Выполните следующую команду для установки ClickHouse с помощью скрипта через curl:

```bash
curl https://clickhouse.com/ | sh
```

При успешном выполнении скрипта вы увидите сообщение:

```bash
Successfully downloaded the ClickHouse binary, you can run it as:
  ./clickhouse
```


## Запуск clickhouse-local {#start-clickhouse-local}

`clickhouse-local` позволяет обрабатывать локальные и удалённые файлы с использованием
мощного SQL-синтаксиса ClickHouse без необходимости конфигурации. Данные таблиц хранятся
во временном расположении, что означает, что после перезапуска `clickhouse-local`
ранее созданные таблицы становятся недоступны.

Выполните следующую команду для запуска [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```


## Запуск clickhouse-server {#start-clickhouse-server}

Если требуется сохранение данных, необходимо запустить `clickhouse-server`. Запустить
сервер ClickHouse можно следующей командой:

```bash
./clickhouse server
```


## Запуск clickhouse-client {#start-clickhouse-client}

После запуска сервера откройте новое окно терминала и выполните следующую команду
для запуска `clickhouse-client`:

```bash
./clickhouse client
```

Вы увидите примерно следующее:

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

Данные таблиц хранятся в текущем каталоге и остаются доступными после перезапуска
сервера ClickHouse. При необходимости можно передать
`-C config.xml` в качестве дополнительного аргумента командной строки для `./clickhouse server`
и задать дополнительные настройки в конфигурационном
файле. Все доступные параметры конфигурации описаны [здесь](/operations/server-configuration-parameters/settings) и в
[шаблоне конфигурационного файла](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

Теперь вы готовы отправлять SQL-команды в ClickHouse!

</VerticalStepper>
