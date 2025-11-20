# Установка ClickHouse с помощью скрипта через curl

Если вам не нужно устанавливать ClickHouse для production-среды, самый быстрый способ начать работу — запустить установочный скрипт с помощью curl. Скрипт автоматически определит подходящий бинарный файл для вашей ОС.

<VerticalStepper>


## Установка ClickHouse с помощью curl {#install-clickhouse-using-curl}

Выполните следующую команду для загрузки единого бинарного файла для вашей операционной системы.

```bash
curl https://clickhouse.com/ | sh
```

:::note
Для пользователей Mac: Если вы получаете ошибки о том, что разработчик бинарного файла не может быть верифицирован, см. [здесь](/knowledgebase/fix-developer-verification-error-in-macos).
:::


## Запуск clickhouse-local {#start-clickhouse-local}

`clickhouse-local` позволяет обрабатывать локальные и удалённые файлы с использованием
мощного SQL-синтаксиса ClickHouse без необходимости настройки. Данные таблиц хранятся
во временном расположении, что означает, что после перезапуска `clickhouse-local`
ранее созданные таблицы становятся недоступны.

Выполните следующую команду для запуска [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```


## Запуск clickhouse-server {#start-clickhouse-server}

Если вы хотите сохранять данные, вам потребуется запустить `clickhouse-server`. Запустить сервер ClickHouse можно следующей командой:

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

Данные таблиц хранятся в текущем каталоге и останутся доступными после перезапуска
сервера ClickHouse. При необходимости можно передать
`-C config.xml` в качестве дополнительного аргумента командной строки для `./clickhouse server`
и указать дополнительные настройки в конфигурационном
файле. Все доступные параметры конфигурации описаны [здесь](/operations/server-configuration-parameters/settings) и в
[шаблоне конфигурационного файла](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

Теперь вы готовы отправлять SQL-команды в ClickHouse!

:::tip
[Быстрый старт](/get-started/quick-start) содержит пошаговые инструкции по созданию таблиц и вставке данных.
:::

</VerticalStepper>
