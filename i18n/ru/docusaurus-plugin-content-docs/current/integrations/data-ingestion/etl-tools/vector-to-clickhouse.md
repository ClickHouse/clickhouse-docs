---
sidebar_label: 'Вектор'
sidebar_position: 220
slug: /integrations/vector
description: 'Как отправить файл журнала в ClickHouse, используя Vector'
title: 'Интеграция Vector с ClickHouse'
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Интеграция Vector с ClickHouse

<CommunityMaintainedBadge/>

Возможность анализа ваших журналов в реальном времени является критически важной для производственных приложений. Вы когда-нибудь задумывались, насколько хорошо ClickHouse справляется с хранением и анализом журналов? Просто посмотрите на <a href="https://eng.uber.com/logging/" target="_blank">опыт Uber</a> по переходу от инфраструктуры ELK к ClickHouse.

Этот гид показывает, как использовать популярный конвейер данных <a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a> для отправки файла журнала Nginx в ClickHouse. Шаги ниже будут схожи для отправки любого типа файла журнала. Мы предположим, что ClickHouse уже запущен и Vector установлен (пока не нужно его запускать).

## 1. Создание базы данных и таблицы {#1-create-a-database-and-table}

Давайте определим таблицу для хранения событий журнала:

1. Начнем с новой базы данных, названной `nginxdb`:
    ```sql
    CREATE DATABASE IF NOT EXISTS nginxdb
    ```

2. Для начала мы просто вставим все событие журнала как одну строку. Очевидно, что это не лучший формат для анализа данных журналов, но мы разберемся с этой частью ниже, используя ***материализованные представления***.
    ```sql
    CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
        message String
    )
    ENGINE = MergeTree()
    ORDER BY tuple()
    ```
    :::note
    Пока нет необходимости в первичном ключе, поэтому **ORDER BY** установлен на **tuple()**.
    :::


## 2. Настройка Nginx {#2--configure-nginx}

Мы определенно не хотим тратить слишком много времени на объяснение Nginx, но и не хотим скрывать все детали, поэтому на этом шаге мы предоставим вам достаточно информации, чтобы настроить журналирование Nginx.


1. Свойство `access_log` отправляет журналы в `/var/log/nginx/my_access.log` в **combined** формате. Это значение помещается в раздел `http` вашего файла `nginx.conf`:
    ```bash
    http {
        include       /etc/nginx/mime.types;
        default_type  application/octet-stream;
        access_log  /var/log/nginx/my_access.log combined;
        sendfile        on;
        keepalive_timeout  65;
        include /etc/nginx/conf.d/*.conf;
    }
    ```

2. Обязательно перезапустите Nginx, если вы изменили `nginx.conf`.

3. Сгенерируйте несколько событий журнала в журнале доступа, посетив страницы на своем веб-сервере. Журналы в **combined** формате имеют следующий вид:
    ```bash
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

## 3. Настройка Vector {#3-configure-vector}

Vector собирает, преобразует и перенаправляет журналы, метрики и трассировки (называемые **источниками**) к различным поставщикам (называемым **сборниками**), включая встроенную совместимость с ClickHouse. Источники и сборники определяются в конфигурационном файле под названием **vector.toml**.


1. Следующий **vector.toml** определяет **источник** типа **file**, который отслеживает конец **my_access.log**, и также определяет **сборник** как таблицу **access_logs**, определенную выше:
    ```bash
    [sources.nginx_logs]
    type = "file"
    include = [ "/var/log/nginx/my_access.log" ]
    read_from = "end"

    [sinks.clickhouse]
    type = "clickhouse"
    inputs = ["nginx_logs"]
    endpoint = "http://clickhouse-server:8123"
    database = "nginxdb"
    table = "access_logs"
    skip_unknown_fields = true
    ```

2. Запустите Vector, используя приведенную выше конфигурацию. <a href="https://vector.dev/docs/" target="_blank">Посетите документацию Vector</a> для получения дополнительных сведений о определении источников и сборников.

3. Убедитесь, что журналы доступа вставляются в ClickHouse. Выполните следующий запрос, и вы должны увидеть журналы доступа в вашей таблице:
    ```sql
    SELECT * FROM nginxdb.access_logs
    ```
    <Image img={vector01} size="lg" border alt="Посмотреть журналы ClickHouse в формате таблицы" />


## 4. Парсинг журналов {#4-parse-the-logs}

Иметь журналы в ClickHouse — это здорово, но хранение каждого события как одной строки не позволяет проводить много анализа данных. Давайте посмотрим, как разобрать события журнала, используя материализованное представление.


1. **Материализованное представление** (MV, для краткости) — это новая таблица, основанная на существующей таблице, и когда в существующую таблицу добавляются новые данные, новые данные также добавляются в материализованное представление. Давайте посмотрим, как определить MV, которая содержит разобранное представление событий журнала в **access_logs**, другими словами:
    ```bash
    192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

    В ClickHouse есть различные функции для разбора строки, но для начала давайте рассмотрим **splitByWhitespace** — которая разбивает строку по пробелам и возвращает каждый токен в виде массива. Чтобы продемонстрировать, выполните следующую команду:
    ```sql
    SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    Обратите внимание, что ответ довольно близок к тому, что мы хотим! У некоторых строк есть лишние символы, и агентов пользователей (данные о браузере) не нужно было разбирать, но мы решим это на следующем шаге:
    ```text
    ["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
    ```

2. Аналогично **splitByWhitespace**, функция **splitByRegexp** разбивает строку на массив на основе регулярного выражения. Выполните следующую команду, которая возвращает две строки.
    ```sql
    SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    Обратите внимание, что вторая строка, возвращенная, является агентом пользователя, успешно разобранным из журнала:
    ```text
    ["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
    ```

3. Прежде чем смотреть на финальную команду **CREATE MATERIALIZED VIEW**, давайте рассмотрим еще несколько функций, использованных для очистки данных. Например, `RequestMethod` выглядит как **"GET** с ненужной двойной кавычкой. Выполните следующую функцию **trim**, которая удаляет двойные кавычки:
    ```sql
    SELECT trim(LEADING '"' FROM '"GET')
    ```

4. Строка времени имеет ведущую квадратную скобку и также не находится в формате, который ClickHouse может разобрать в дату. Однако, если мы изменим разделитель с двоеточия (**:**) на запятую (**,**), то разбор будет работать отлично:
    ```sql
    SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
    ```

5. Теперь мы готовы определить наше материализованное представление. В наше определение включен **POPULATE**, что означает, что существующие строки в **access_logs** будут обработаны и вставлены сразу. Выполните следующий SQL-запрос:
    ```sql
    CREATE MATERIALIZED VIEW nginxdb.access_logs_view
    (
        RemoteAddr String,
        Client String,
        RemoteUser String,
        TimeLocal DateTime,
        RequestMethod String,
        Request String,
        HttpVersion String,
        Status Int32,
        BytesSent Int64,
        UserAgent String
    )
    ENGINE = MergeTree()
    ORDER BY RemoteAddr
    POPULATE AS
    WITH
        splitByWhitespace(message) as split,
        splitByRegexp('\S \d+ "([^"]*)"', message) as referer
    SELECT
        split[1] AS RemoteAddr,
        split[2] AS Client,
        split[3] AS RemoteUser,
        parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM split[4]), ':', ' ')) AS TimeLocal,
        trim(LEADING '"' FROM split[6]) AS RequestMethod,
        split[7] AS Request,
        trim(TRAILING '"' FROM split[8]) AS HttpVersion,
        split[9] AS Status,
        split[10] AS BytesSent,
        trim(BOTH '"' from referer[2]) AS UserAgent
    FROM
        (SELECT message FROM nginxdb.access_logs)
    ```

6. Теперь проверьте, что все сработало. Вы должны увидеть журналы доступа, красиво разобранные в столбцы:
    ```sql
    SELECT * FROM nginxdb.access_logs_view
    ```
    <Image img={vector02} size="lg" border alt="Посмотреть разобранные журналы ClickHouse в формате таблицы" />

    :::note
    Вышеуказанный урок сохранил данные в двух таблицах, но вы могли бы изменить начальную таблицу `nginxdb.access_logs` на использование движка таблицы **Null** — разобранные данные все равно попадут в таблицу `nginxdb.access_logs_view`, но необработанные данные не будут храниться в таблице.
    :::


**Резюме:** Используя Vector, который требует лишь простой установки и быстрой конфигурации, мы можем отправить журналы с сервера Nginx в таблицу ClickHouse. Используя умное материализованное представление, мы можем разобрать эти журналы в столбцы для облегчения аналитики.

## Связанный контент {#related-content}

- Блог: [Создание решения для наблюдаемости с ClickHouse в 2023 году - Часть 1 - Журналы](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- Блог: [Отправка журналов Nginx в ClickHouse с помощью Fluent Bit ](https://clickhouse.com/blog/nginx-logs-to-clickhouse-fluent-bit)
- Блог: [Отправка журналов Kubernetes в ClickHouse с помощью Fluent Bit](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit)
