
# Установка ClickHouse через скрипт с использованием curl

Если вам не нужно устанавливать ClickHouse для продуктивной среды, самый быстрый способ настроить его — запустить скрипт установки с использованием curl. Скрипт определит подходящий бинарный файл для вашей операционной системы.

<VerticalStepper>

## Установка ClickHouse с использованием curl {#install-clickhouse-using-curl}

Запустите следующую команду, чтобы скачать единственный бинарный файл для вашей операционной системы.

```bash
curl https://clickhouse.com/ | sh
```

:::note
Для пользователей Mac: Если вы получаете ошибки о том, что разработчик бинарного файла не может быть проверен, пожалуйста, смотрите [здесь](/knowledgebase/fix-developer-verification-error-in-macos).
:::

## Запуск clickhouse-local {#start-clickhouse-local}

`clickhouse-local` позволяет вам обрабатывать локальные и удаленные файлы с использованием мощного SQL-синтаксиса ClickHouse и без необходимости в конфигурации. Данные таблиц хранятся во временном местоположении, что означает, что после перезапуска `clickhouse-local` ранее созданные таблицы больше недоступны.

Запустите следующую команду, чтобы начать [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```

## Запуск clickhouse-server {#start-clickhouse-server}

Если вы хотите сохранить данные, вам нужно запустить `clickhouse-server`. Вы можете стартовать сервер ClickHouse, используя следующую команду:

```bash
./clickhouse server
```

## Запуск clickhouse-client {#start-clickhouse-client}

Когда сервер запущен, откройте новое окно терминала и выполните следующую команду, чтобы запустить `clickhouse-client`:

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

Данные таблиц хранятся в текущем каталоге и будут по-прежнему доступны после перезапуска сервера ClickHouse. При необходимости вы можете передать `-C config.xml` как дополнительный аргумент командной строки к `./clickhouse server` и предоставить дальнейшую конфигурацию в файле конфигурации. Все доступные настройки конфигурации документированы [здесь](/operations/server-configuration-parameters/settings) и в [шаблоне файла конфигурации](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

Теперь вы готовы начать отправлять SQL команды в ClickHouse!

:::tip
[Быстрый старт](/get-started/quick-start) проводит вас через шаги по созданию таблиц и вставке данных.
:::

</VerticalStepper>
