# Установка ClickHouse с помощью Docker \{#install-clickhouse-using-docker\}

Руководство на [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/)
приведено ниже для удобства. Доступные Docker-образы используют
официальные deb‑пакеты ClickHouse.

Команда `docker pull`:

```bash
docker pull clickhouse/clickhouse-server
```


## Версии \\{#versions\\}

- Тег `latest` указывает на последний релиз последней стабильной ветки.
- Теги веток, такие как `22.2`, указывают на последний релиз соответствующей ветки.
- Теги полной версии, такие как `22.2.3` и `22.2.3.5`, указывают на соответствующий релиз.
- Тег `head` собирается из последнего коммита в ветке по умолчанию.
- У каждого тега есть необязательный суффикс `-alpine`, который показывает, что образ собран на базе `alpine`.

### Совместимость \\{#compatibility\\}

- Образ для amd64 требует поддержки [инструкций SSE3](https://en.wikipedia.org/wiki/SSE3).
  Практически все x86‑процессоры, выпущенные после 2005 года, поддерживают SSE3.
- Образ для arm64 требует поддержки [архитектуры ARMv8.2-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A) и
  дополнительно регистра Load-Acquire RCpc. Этот регистр является необязательным в версии ARMv8.2-A и обязательным в
  [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A). Поддерживается в Graviton >=2, а также на инстансах Azure и GCP.
  Примеры неподдерживаемых устройств: Raspberry Pi 4 (ARMv8.0-A) и Jetson AGX Xavier/Orin (ARMv8.2-A).
- Начиная с ClickHouse 24.11 образы на базе Ubuntu используют `ubuntu:22.04` в качестве базового образа. Это требует версии Docker >= `20.10.10`,
  содержащей соответствующий [патч](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468). В качестве обходного решения можно
  использовать `docker run --security-opt seccomp=unconfined`, однако это имеет последствия для безопасности.

## Как использовать этот образ \\{#how-to-use-image\\}

### Запуск экземпляра сервера \\{#start-server-instance\\}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

По умолчанию ClickHouse будет доступен только через Docker-сеть. См. раздел о сетевом взаимодействии ниже.

По умолчанию описанный выше экземпляр сервера запускается от имени пользователя `default` без пароля.


### Подключение с помощью нативного клиента \\{#connect-to-it-from-native-client\\}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server
# OR
docker exec -it some-clickhouse-server clickhouse-client
```

Подробнее о клиенте ClickHouse см. в разделе [ClickHouse client](/interfaces/cli).


### Подключение с помощью curl \\{#connect-to-it-using-curl\\}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

Подробную информацию об HTTP-интерфейсе см. в разделе [ClickHouse HTTP Interface](/interfaces/http).


### Остановка и удаление контейнера \\{#stopping-removing-container\\}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```


### Сеть \\{#networking\\}

:::note
Предопределённый пользователь `default` не имеет сетевого доступа, пока для него не задан пароль,
см. разделы &quot;How to create default database and user on starting&quot; и &quot;Managing `default` user&quot; ниже.
:::

Вы можете открыть доступ к вашему ClickHouse, запущенному в Docker, [пробросив определённый порт](https://docs.docker.com/config/containers/container-networking/)
из контейнера на порт хоста:

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

Или разрешить контейнеру напрямую использовать [порты хоста](https://docs.docker.com/network/host/) с помощью `--network=host`
(это также позволяет добиться лучшей сетевой производительности):

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
Пользователь `default` в приведённом выше примере доступен только для запросов с localhost.
:::


### Томa \\{#volumes\\}

Обычно для обеспечения сохранности данных имеет смысл смонтировать в контейнер следующие каталоги:

* `/var/lib/clickhouse/` — основной каталог, где ClickHouse хранит данные
* `/var/log/clickhouse-server/` — логи

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

Также можно смонтировать:

* `/etc/clickhouse-server/config.d/*.xml` - файлы с изменениями конфигурации сервера
* `/etc/clickhouse-server/users.d/*.xml` - файлы с изменениями настроек пользователей
* `/docker-entrypoint-initdb.d/` - каталог со скриптами инициализации базы данных (см. ниже).


## Возможности Linux \\{#linear-capabilities\\}

У ClickHouse есть дополнительная функциональность, для работы которой требуется включить несколько [возможностей Linux (capabilities)](https://man7.org/linux/man-pages/man7/capabilities.7.html).

Они не являются обязательными и могут быть включены с помощью следующих [аргументов командной строки Docker](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities):

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

Дополнительные сведения см. в разделе [&quot;Настройка возможностей CAP&#95;IPC&#95;LOCK и CAP&#95;SYS&#95;NICE в Docker&quot;](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)


## Конфигурация \\{#configuration\\}

Контейнер открывает порт 8123 для [HTTP-интерфейса](https://clickhouse.com/docs/interfaces/http_interface/) и порт 9000 для [нативного клиента](https://clickhouse.com/docs/interfaces/tcp/).

Конфигурация ClickHouse представлена файлом «config.xml» ([документация](https://clickhouse.com/docs/operations/configuration_files/)).

### Запуск экземпляра сервера с собственной конфигурацией \\{#start-server-instance-with-custom-config\\}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```


### Запуск сервера под указанным пользователем \\{#start-server-custom-user\\}

```bash
# $PWD/data/clickhouse should exist and be owned by current user
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

Когда вы используете образ с примонтированными локальными каталогами, вам, вероятно, нужно указать пользователя, чтобы сохранить корректное владение файлами. Используйте аргумент `--user` и смонтируйте `/var/lib/clickhouse` и `/var/log/clickhouse-server` внутрь контейнера. В противном случае образ будет выдавать ошибку и не запустится.


### Запуск сервера от root \\{#start-server-from-root\\}

Запуск сервера от root полезен в случаях, когда включено пространство имён пользователей.
Чтобы сделать это, выполните:

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```


### Как создать базу данных и пользователя по умолчанию при запуске \\{#how-to-create-default-db-and-user\\}

Иногда может потребоваться при запуске контейнера создать пользователя (по умолчанию используется пользователь с именем `default`) и базу данных. Это можно сделать с помощью переменных окружения `CLICKHOUSE_DB`, `CLICKHOUSE_USER`, `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` и `CLICKHOUSE_PASSWORD`:

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```


#### Управление пользователем `default` \\{#managing-default-user\\}

Пользователь `default` по умолчанию не имеет сетевого доступа, если не заданы ни `CLICKHOUSE_USER`, ни `CLICKHOUSE_PASSWORD`, ни `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`.

Можно небезопасным образом открыть доступ для пользователя `default`, присвоив переменной окружения `CLICKHOUSE_SKIP_USER_SETUP` значение 1:

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```


## Как расширить этот образ \\{#how-to-extend-image\\}

Чтобы выполнить дополнительную инициализацию в образе, производном от этого, добавьте один или несколько скриптов `*.sql`, `*.sql.gz` или `*.sh` в каталог `/docker-entrypoint-initdb.d`. После того как entrypoint-скрипт вызовет `initdb`, он выполнит все файлы `*.sql`, запустит все исполняемые скрипты `*.sh` и подключит (source) все неисполняемые скрипты `*.sh`, найденные в этом каталоге, для дальнейшей инициализации перед запуском сервиса.

:::note
Скрипты в каталоге `/docker-entrypoint-initdb.d` выполняются в **алфавитном порядке** по имени файла. Если ваши скрипты зависят друг от друга (например, скрипт, создающий представления, должен выполняться после скрипта, создающего соответствующие таблицы), убедитесь, что имена файлов сортируются в правильном порядке.
:::

Также вы можете задать переменные окружения `CLICKHOUSE_USER` &amp; `CLICKHOUSE_PASSWORD`, которые будут использоваться clickhouse-client во время инициализации.

Например, чтобы добавить ещё одного пользователя и базу данных, добавьте следующее в `/docker-entrypoint-initdb.d/init-db.sh`:

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
```
