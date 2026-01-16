# Установка ClickHouse через скрипт с использованием curl \\{#install-clickhouse-via-script-using-curl\\}

Если вам не нужно устанавливать ClickHouse для production-среды, самый быстрый способ настройки — запустить установочный скрипт с помощью curl. Скрипт автоматически определит подходящий бинарный файл для вашей ОС.

<VerticalStepper>

## Установка ClickHouse с помощью curl \\{#install-clickhouse-using-curl\\}

Выполните следующую команду, чтобы скачать один бинарный файл для вашей операционной системы.

```bash
curl https://clickhouse.com/ | sh
```

:::note
Для пользователей Mac: если вы получаете сообщение об ошибке о том, что разработчик бинарного файла не может быть проверен, подробнее см. [здесь](/knowledgebase/fix-developer-verification-error-in-macos).
:::

## Запустите clickhouse-local \\{#start-clickhouse-local\\}

`clickhouse-local` позволяет обрабатывать локальные и удалённые файлы, используя
мощный SQL-синтаксис ClickHouse и без какой-либо предварительной настройки. Данные таблиц
хранятся во временном хранилище, то есть после перезапуска `clickhouse-local`
ранее созданные таблицы больше не будут доступны.

Выполните следующую команду, чтобы запустить [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```

## Запуск clickhouse-server \\{#start-clickhouse-server\\}

Если вы хотите хранить данные, вам потребуется запустить `clickhouse-server`. Вы можете
запустить сервер ClickHouse с помощью следующей команды:

```bash
./clickhouse server
```

## Запуск clickhouse-client \\{#start-clickhouse-client\\}

После запуска сервера откройте новое окно терминала и выполните следующую команду для запуска `clickhouse-client`:

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

Данные таблиц хранятся в текущем каталоге и останутся доступными после перезапуска сервера ClickHouse. При необходимости можно передать `-C config.xml` в качестве дополнительного аргумента командной строки для `./clickhouse server` и указать дополнительные настройки в конфигурационном файле. Все доступные параметры конфигурации задокументированы [здесь](/operations/server-configuration-parameters/settings) и в [шаблоне конфигурационного файла](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

Теперь можно отправлять SQL-команды в ClickHouse!

:::tip
[Краткое руководство](/get-started/quick-start) содержит пошаговые инструкции по созданию таблиц и вставке данных.
:::

</VerticalStepper>
