# Установка ClickHouse на Windows с помощью WSL {#install-clickhouse-on-windows-with-wsl}

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

Вас попросят ввести новое имя пользователя UNIX и пароль. После ввода выбранных имени пользователя и пароля должно появиться сообщение, подобное следующему:

```bash
Добро пожаловать в Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```

## Установите ClickHouse с помощью скрипта curl {#install-clickhouse-via-script-using-curl}

Выполните следующую команду, чтобы установить ClickHouse с помощью скрипта curl:

```bash
curl https://clickhouse.com/ | sh
```

Если скрипт успешно выполнен, вы увидите сообщение:

```bash
Бинарный файл ClickHouse успешно загружен. Запустите его следующим образом:
  ./clickhouse
```

## Запуск clickhouse-local {#start-clickhouse-local}

`clickhouse-local` позволяет обрабатывать локальные и удалённые файлы с
использованием мощного SQL-синтаксиса ClickHouse и без необходимости настройки. Данные таблиц
хранятся во временном каталоге, поэтому после перезапуска `clickhouse-local`
ранее созданные таблицы больше недоступны.

Выполните следующую команду, чтобы запустить [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```

## Запуск clickhouse-server {#start-clickhouse-server}

Если вы хотите обеспечить сохранность данных, вам нужно запустить `clickhouse-server`. Вы можете
запустить сервер ClickHouse с помощью следующей команды:

```bash
./clickhouse server
```

## Start clickhouse-client {#start-clickhouse-client}

При работающем сервере откройте новое окно терминала и выполните следующую команду
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
и задать дополнительные параметры в файле
конфигурации. Все доступные параметры конфигурации описаны [здесь](/operations/server-configuration-parameters/settings) и в
[шаблоне файла
конфигурации](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

Теперь можно отправлять SQL-команды в ClickHouse!

</VerticalStepper>
