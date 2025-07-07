# Установка ClickHouse через скрипт с использованием curl

Если вам не нужно устанавливать ClickHouse для продакшена, самый быстрый способ 
начать – запустить установочный скрипт с помощью curl. Скрипт определит подходящий
бинари для вашей операционной системы.

<VerticalStepper>

## Установка ClickHouse с использованием curl {#install-clickhouse-using-curl}

Запустите следующую команду, чтобы загрузить один бинарный файл для вашей операционной системы.

```bash
curl https://clickhouse.com/ | sh
```

:::note
Для пользователей Mac: Если вы получаете ошибки, что разработчик бинарного файла не может быть проверен, пожалуйста, посмотрите [здесь](/knowledgebase/fix-developer-verification-error-in-macos).
:::

## Запуск clickhouse-local {#start-clickhouse-local}

`clickhouse-local` позволяет вам обрабатывать локальные и удаленные файлы, используя 
мощный синтаксис SQL ClickHouse и без необходимости конфигурации. Данные таблиц 
хранятся во временном месте, что означает, что после перезапуска `clickhouse-local` 
ранее созданные таблицы больше не доступны.

Запустите следующую команду, чтобы начать [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```

## Запуск clickhouse-server {#start-clickhouse-server}

Если вы хотите сохранять данные, вам нужно будет запустить `clickhouse-server`. 
Вы можете запустить сервер ClickHouse с помощью следующей команды:

```bash
./clickhouse server
```

## Запуск clickhouse-client {#start-clickhouse-client}

Когда сервер запущен, откройте новое окно терминала и выполните следующую команду, 
чтобы запустить `clickhouse-client`:

```bash
./clickhouse client
```

Вы увидите что-то вроде этого: 

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (официальная сборка).
Подключение к localhost:9000 как пользователь default.
Подключено к серверу ClickHouse версии 24.5.1.

local-host :)
```

Данные таблиц хранятся в текущем каталоге и все еще доступны после перезапуска 
сервера ClickHouse. Если необходимо, вы можете передать 
`-C config.xml` в качестве дополнительного аргумента командной строки к `./clickhouse server` 
и предоставить дополнительные настройки в файле конфигурации. Все доступные параметры конфигурации задокументированы [здесь](/operations/server-configuration-parameters/settings) и в 
[шаблоне примерного файла конфигурации](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

Теперь вы готовы отправлять SQL команды в ClickHouse!

:::tip
[Быстрый старт](/quick-start.mdx) описывает шаги по созданию таблиц и вставке данных.
:::

</VerticalStepper>
