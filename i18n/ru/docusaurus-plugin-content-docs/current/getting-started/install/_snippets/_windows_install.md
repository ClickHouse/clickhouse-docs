# Установка ClickHouse на Windows с помощью WSL \{#install-clickhouse-on-windows-with-wsl\}

## Требования \{#requirements\}

:::note
Для установки ClickHouse на Windows вам понадобится WSL (Windows Subsystem for Linux).
:::

<VerticalStepper>

## Установите WSL \{#install-wsl\}

Откройте Windows PowerShell от имени администратора и выполните следующую команду:

```bash
wsl --install
```

Вас попросят ввести новое имя пользователя и пароль UNIX. После того как вы
введёте желаемые имя пользователя и пароль, вы должны увидеть сообщение, похожее на:

```bash
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```

## Установите ClickHouse с помощью скрипта через curl \{#install-clickhouse-via-script-using-curl\}

Выполните следующую команду, чтобы установить ClickHouse с помощью скрипта через curl:

```bash
curl https://clickhouse.com/ | sh
```

Если скрипт был успешно выполнен, вы увидите сообщение:

```bash
Successfully downloaded the ClickHouse binary, you can run it as:
  ./clickhouse
```

## Запустите clickhouse-local \{#start-clickhouse-local\}

`clickhouse-local` позволяет обрабатывать локальные и удалённые файлы, используя
мощный SQL-синтаксис ClickHouse, без необходимости в конфигурации. Данные таблиц
хранятся во временном каталоге, поэтому после перезапуска `clickhouse-local`
ранее созданные таблицы больше недоступны.

Выполните следующую команду, чтобы запустить [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```

## Запустите clickhouse-server \{#start-clickhouse-server\}

Если вы хотите сохранять данные, вам потребуется запустить `clickhouse-server`. Вы можете
запустить сервер ClickHouse с помощью следующей команды:

```bash
./clickhouse server
```

## Start clickhouse-client \{#start-clickhouse-client\}

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