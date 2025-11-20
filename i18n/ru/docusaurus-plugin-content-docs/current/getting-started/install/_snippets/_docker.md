# Установка ClickHouse с помощью Docker

Руководство с [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/)
приведено ниже для удобства. Доступные образы Docker основаны на
официальных deb-пакетах ClickHouse.

Команда `docker pull`:

```bash
docker pull clickhouse/clickhouse-server
```


## Версии {#versions}

- Тег `latest` указывает на последний релиз последней стабильной ветки.
- Теги веток, такие как `22.2`, указывают на последний релиз соответствующей ветки.
- Теги полных версий, такие как `22.2.3` и `22.2.3.5`, указывают на соответствующий релиз.
- Тег `head` собирается из последнего коммита в ветку по умолчанию.
- Каждый тег имеет необязательный суффикс `-alpine`, указывающий, что образ собран на основе `alpine`.

### Совместимость {#compatibility}

- Образ amd64 требует поддержки [инструкций SSE3](https://en.wikipedia.org/wiki/SSE3).
  Практически все процессоры x86, выпущенные после 2005 года, поддерживают SSE3.
- Образ arm64 требует поддержки [архитектуры ARMv8.2-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A), а также
  регистра Load-Acquire RCpc. Этот регистр является опциональным в версии ARMv8.2-A и обязательным в
  [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A). Поддерживается в Graviton >=2, инстансах Azure и GCP.
  Примеры неподдерживаемых устройств: Raspberry Pi 4 (ARMv8.0-A) и Jetson AGX Xavier/Orin (ARMv8.2-A).
- Начиная с ClickHouse 24.11, образы Ubuntu используют `ubuntu:22.04` в качестве базового образа. Требуется версия Docker >= `20.10.10`,
  содержащая [патч](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468). В качестве обходного решения можно
  использовать `docker run --security-opt seccomp=unconfined`, однако это имеет последствия для безопасности.


## Как использовать этот образ {#how-to-use-image}

### Запуск экземпляра сервера {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

По умолчанию ClickHouse будет доступен только через сеть Docker. См. раздел о настройке сети ниже.

По умолчанию запущенный выше экземпляр сервера будет работать от имени пользователя `default` без пароля.

### Подключение через нативный клиент {#connect-to-it-from-native-client}


```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server
# ИЛИ
docker exec -it some-clickhouse-server clickhouse-client
```

Подробнее о клиенте ClickHouse см. в разделе [Клиент ClickHouse](/interfaces/cli).

### Подключение с помощью curl {#connect-to-it-using-curl}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

Подробнее об HTTP-интерфейсе см. в разделе [HTTP-интерфейс ClickHouse](/interfaces/http).

### Остановка и удаление контейнера {#stopping-removing-container}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```

### Сетевое взаимодействие {#networking}

:::note
Предопределённый пользователь `default` не имеет сетевого доступа, пока не установлен пароль.
См. разделы «Создание базы данных и пользователя по умолчанию при запуске» и «Управление пользователем `default`» ниже.
:::

Вы можете открыть доступ к ClickHouse, запущенному в Docker, [сопоставив определённый порт](https://docs.docker.com/config/containers/container-networking/)
внутри контейнера с портами хоста:

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

Или разрешив контейнеру использовать [порты хоста напрямую](https://docs.docker.com/network/host/) с помощью `--network=host`
(это также позволяет достичь более высокой производительности сети):

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
Пользователь default в примере выше доступен только для запросов с localhost
:::

### Тома {#volumes}

Обычно для обеспечения сохранности данных требуется смонтировать следующие папки внутри контейнера:

- `/var/lib/clickhouse/` — основная папка, где ClickHouse хранит данные
- `/var/log/clickhouse-server/` — логи

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

Также может потребоваться смонтировать:

- `/etc/clickhouse-server/config.d/*.xml` — файлы с настройками конфигурации сервера
- `/etc/clickhouse-server/users.d/*.xml` — файлы с настройками пользователей
- `/docker-entrypoint-initdb.d/` — папка со скриптами инициализации базы данных (см. ниже).


## Возможности Linux {#linear-capabilities}

ClickHouse обладает расширенной функциональностью, для использования которой необходимо включить несколько [возможностей Linux](https://man7.org/linux/man-pages/man7/capabilities.7.html).

Они являются необязательными и могут быть включены с помощью следующих [аргументов командной строки docker](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities):

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

Дополнительную информацию см. в разделе ["Настройка возможностей CAP_IPC_LOCK и CAP_SYS_NICE в Docker"](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)


## Конфигурация {#configuration}

Контейнер предоставляет порт 8123 для [HTTP-интерфейса](https://clickhouse.com/docs/interfaces/http_interface/) и порт 9000 для [нативного клиента](https://clickhouse.com/docs/interfaces/tcp/).

Конфигурация ClickHouse задается в файле "config.xml" ([документация](https://clickhouse.com/docs/operations/configuration_files/))

### Запуск экземпляра сервера с пользовательской конфигурацией {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### Запуск сервера от имени указанного пользователя {#start-server-custom-user}


```bash
# $PWD/data/clickhouse должна существовать и принадлежать текущему пользователю
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

При использовании образа с подключенными локальными директориями необходимо указать пользователя для сохранения корректных прав владения файлами. Используйте аргумент `--user` и смонтируйте `/var/lib/clickhouse` и `/var/log/clickhouse-server` внутри контейнера. В противном случае образ выдаст ошибку и не запустится.

### Запуск сервера от имени root {#start-server-from-root}

Запуск сервера от имени root полезен в случаях, когда включено пространство имен пользователей (user namespace).
Для этого выполните:

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### Как создать базу данных и пользователя по умолчанию при запуске {#how-to-create-default-db-and-user}

Иногда требуется создать пользователя (по умолчанию используется пользователь с именем `default`) и базу данных при запуске контейнера. Это можно сделать с помощью переменных окружения `CLICKHOUSE_DB`, `CLICKHOUSE_USER`, `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` и `CLICKHOUSE_PASSWORD`:

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### Управление пользователем `default` {#managing-default-user}

У пользователя `default` по умолчанию отключен сетевой доступ, если не заданы переменные `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` или `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`.

Существует способ сделать пользователя `default` доступным без защиты, установив переменную окружения `CLICKHOUSE_SKIP_USER_SETUP` в значение 1:

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```


## Как расширить этот образ {#how-to-extend-image}

Чтобы выполнить дополнительную инициализацию в образе, производном от данного, добавьте один или несколько скриптов `*.sql`, `*.sql.gz` или `*.sh` в каталог `/docker-entrypoint-initdb.d`. После того как точка входа вызовет `initdb`, будут выполнены все файлы `*.sql`, запущены все исполняемые скрипты `*.sh` и загружены все неисполняемые скрипты `*.sh`, найденные в этом каталоге, для выполнения дополнительной инициализации перед запуском службы.  
Также можно указать переменные окружения `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD`, которые будут использоваться для clickhouse-client во время инициализации.

Например, чтобы добавить ещё одного пользователя и базу данных, добавьте следующее в `/docker-entrypoint-initdb.d/init-db.sh`:

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
```
