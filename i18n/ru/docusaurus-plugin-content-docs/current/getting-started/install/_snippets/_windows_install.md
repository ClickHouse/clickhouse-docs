# Установка ClickHouse на Windows с WSL

## Требования {#requirements}

:::note
Для установки ClickHouse на Windows вам потребуется WSL (Подсистема Windows для Linux).
:::

<VerticalStepper>

## Установите WSL {#install-wsl}

Откройте Windows PowerShell с правами администратора и выполните следующую команду:

```bash
wsl --install
```

Вам будет предложено ввести новое имя пользователя и пароль UNIX. После того как вы введете желаемое имя пользователя и пароль, вы должны увидеть сообщение, подобное этому:

```bash
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```

## Установите ClickHouse через скрипт с использованием curl {#install-clickhouse-via-script-using-curl}

Выполните следующую команду для установки ClickHouse через скрипт с использованием curl:

```bash
curl https://clickhouse.com/ | sh
```

Если скрипт успешно выполнен, вы увидите сообщение:

```bash
Successfully downloaded the ClickHouse binary, you can run it as:
  ./clickhouse
```

## Запустите clickhouse-local {#start-clickhouse-local}

`clickhouse-local` позволяет вам обрабатывать локальные и удаленные файлы с использованием мощного SQL-синтаксиса ClickHouse и без необходимости настройки. Данные таблицы хранятся во временном месте, что означает, что после перезапуска `clickhouse-local` ранее созданные таблицы больше не будут доступны.

Выполните следующую команду, чтобы запустить [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```

## Запустите clickhouse-server {#start-clickhouse-server}

Если вы хотите сохранить данные, вам нужно запустить `clickhouse-server`. Вы можете запустить сервер ClickHouse, используя следующую команду:

```bash
./clickhouse server
```

## Запустите clickhouse-client {#start-clickhouse-client}

После того как сервер запущен, откройте новое окно терминала и выполните следующую команду, чтобы запустить `clickhouse-client`:

```bash
./clickhouse client
```

Вы увидите что-то вроде этого:

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

Данные таблицы хранятся в текущем каталоге и по-прежнему доступны после перезапуска сервера ClickHouse. При необходимости вы можете передать `-C config.xml` в качестве дополнительного аргумента командной строки для `./clickhouse server` и предоставить дополнительные параметры конфигурации в файле конфигурации. Все доступные параметры конфигурации задокументированы [здесь](/operations/server-configuration-parameters/settings) и в [шаблоне файла конфигурации](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

Теперь вы готовы начать отправлять SQL-команды в ClickHouse!

</VerticalStepper>