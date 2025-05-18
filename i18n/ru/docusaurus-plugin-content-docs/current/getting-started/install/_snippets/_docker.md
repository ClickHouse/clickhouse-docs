# Установка ClickHouse с использованием Docker

Руководство на [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) воспроизведено ниже для удобства. Доступные Docker-образы используют официальные пакеты deb для ClickHouse.

Команда для загрузки Docker:

```bash
docker pull clickhouse/clickhouse-server
```

## Версии {#versions}

- Тег `latest` указывает на последнюю версию из последней стабильной ветки.
- Теги веток, такие как `22.2`, указывают на последнюю версию соответствующей ветки.
- Полные теги версий, такие как `22.2.3` и `22.2.3.5`, указывают на соответствующий релиз.
- Тег `head` создается из последнего коммита в основной ветке.
- Каждый тег имеет необязательный суффикс `-alpine`, чтобы отразить, что он построен на основе `alpine`.

### Совместимость {#compatibility}

- Образ amd64 требует поддержки [инструкций SSE3](https://en.wikipedia.org/wiki/SSE3). Практически все процессоры x86 после 2005 года поддерживают SSE3.
- Образ arm64 требует поддержки [архитектуры ARMv8.2-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A) и дополнительно регистра Load-Acquire RCpc. Регистры являются необязательными в версии ARMv8.2-A и обязательными в [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A). Поддерживается в Graviton >=2, Azure и GCP инстансах. Примеры неподдерживаемых устройств: Raspberry Pi 4 (ARMv8.0-A) и Jetson AGX Xavier/Orin (ARMv8.2-A).
- Начиная с ClickHouse 24.11 образы Ubuntu начали использовать `ubuntu:22.04` в качестве базового образа. Он требует версии docker >= `20.10.10`, содержащей [патч](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468). В качестве обходного решения вы можете использовать `docker run --security-opt seccomp=unconfined`; однако это имеет последствия для безопасности.

## Как использовать этот образ {#how-to-use-image}

### Запуск экземпляра сервера {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

По умолчанию ClickHouse будет доступен только через Docker сеть. См. раздел о сетях ниже.

По умолчанию вышеуказанный экземпляр сервера будет запущен под пользователем `default` без пароля.

### Подключение к нему из родного клиента {#connect-to-it-from-native-client}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server

# ИЛИ
docker exec -it some-clickhouse-server clickhouse-client
```

См. [ClickHouse client](/interfaces/cli) для получения дополнительной информации о клиенте ClickHouse.

### Подключение к нему с помощью curl {#connect-to-it-using-curl}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

См. [ClickHouse HTTP Interface](/interfaces/http) для получения дополнительной информации о HTTP интерфейсе.

### Остановка / удаление контейнера {#stopping-removing-container}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```

### Сеть {#networking}

:::note
предопределённый пользователь `default` не имеет доступа к сети, если пароль не установлен,
см. "Как создать базу данных и пользователя по умолчанию при запуске" и "Управление пользователем `default`" ниже
:::

Вы можете сделать ваш ClickHouse, работающий в docker, доступным, [сопоставив конкретный порт](https://docs.docker.com/config/containers/container-networking/) изнутри контейнера, используя порты хоста:

```bash
docker run -d -p 18123:8123 -p 19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

Или разрешив контейнеру использовать [порты хоста напрямую](https://docs.docker.com/network/host/) с помощью `--network=host`
(также позволяет достичь лучшей производительности сети):

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
Пользователь default в приведенном выше примере доступен только для запросов localhost
:::

### Томы {#volumes}

Обычно вы можете смонтировать следующие папки внутри своего контейнера, чтобы обеспечить постоянство:

- `/var/lib/clickhouse/` - основная папка, где ClickHouse хранит данные
- `/var/log/clickhouse-server/` - журналы

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

Вы также можете смонтировать:

- `/etc/clickhouse-server/config.d/*.xml` - файлы с настройками конфигурации сервера
- `/etc/clickhouse-server/users.d/*.xml` - файлы с настройками пользователей
- `/docker-entrypoint-initdb.d/` - папка со скриптами инициализации базы данных (см. ниже).

## Возможности Linux {#linear-capabilities}

ClickHouse имеет некоторые расширенные функции, которые требуют включения нескольких [возможностей Linux](https://man7.org/linux/man-pages/man7/capabilities.7.html).

Они являются необязательными и могут быть включены с помощью следующих [аргументов командной строки docker](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities):

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

Для получения дополнительной информации см. ["Настройка возможностей CAP_IPC_LOCK и CAP_SYS_NICE в Docker"](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)

## Конфигурация {#configuration}

Контейнер открывает порт 8123 для [HTTP интерфейса](https://clickhouse.com/docs/interfaces/http_interface/) и порт 9000 для [родного клиента](https://clickhouse.com/docs/interfaces/tcp/).

Конфигурация ClickHouse представлена файлом "config.xml" ([документация](https://clickhouse.com/docs/operations/configuration_files/))

### Запуск экземпляра сервера с пользовательской конфигурацией {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### Запуск сервера как пользователь с пользовательскими правами {#start-server-custom-user}

```bash

# $PWD/data/clickhouse должен существовать и принадлежать текущему пользователю
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

Когда вы используете образ с подключёнными локальными директориями, вероятно, вы хотите указать пользователя, чтобы поддерживать правильное владение файлами. Используйте аргумент `--user` и смонтируйте `/var/lib/clickhouse` и `/var/log/clickhouse-server` внутри контейнера. В противном случае образ выдаст ошибку и не запустится.

### Запуск сервера от имени пользователя root {#start-server-from-root}

Запуск сервера от имени пользователя root полезен в случаях, когда включено пространство имен пользователей.
Для этого запустите:

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### Как создать базу данных и пользователя по умолчанию при старте {#how-to-create-default-db-and-user}

Иногда вы можете захотеть создать пользователя (по умолчанию используется пользователь с именем `default`) и базу данных при запуске контейнера. Вы можете сделать это, используя переменные окружения `CLICKHOUSE_DB`, `CLICKHOUSE_USER`, `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` и `CLICKHOUSE_PASSWORD`:

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### Управление пользователем `default` {#managing-default-user}

Пользователь `default` по умолчанию не имеет доступа к сети в случае, если ни одно из значений `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` или `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` не установлено.

Существует способ сделать пользователя `default` небезопасно доступным, установив переменную окружения `CLICKHOUSE_SKIP_USER_SETUP` в 1:

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```

## Как расширить этот образ {#how-to-extend-image}

Чтобы выполнить дополнительную инициализацию в образе, производном от этого, добавьте один или несколько скриптов `*.sql`, `*.sql.gz` или `*.sh` в папку `/docker-entrypoint-initdb.d`. После вызова точки входа `initdb`, будут выполнены все файлы `*.sql`, исполняемые скрипты `*.sh` и скрипты `*.sh`, которые не являются исполняемыми, найденные в этой директории, чтобы провести дальнейшую инициализацию перед запуском сервиса.  
Также вы можете предоставить переменные окружения `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD`, которые будут использоваться для clickhouse-client во время инициализации.

Например, чтобы добавить другого пользователя и базу данных, добавьте следующее в `/docker-entrypoint-initdb.d/init-db.sh`:

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
