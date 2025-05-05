---
sidebar_label: 'Вектор'
sidebar_position: 220
slug: /integrations/vector
description: 'Как отправить файл журнала в ClickHouse с помощью Vector'
title: 'Интеграция Vector с ClickHouse'
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Интеграция Vector с ClickHouse

<CommunityMaintainedBadge/>

Способность анализировать ваши журналы в реальном времени критически важна для производственных приложений. Вы когда-нибудь задумывались, хорош ли ClickHouse для хранения и анализа журнальных данных? Просто посмотрите на <a href="https://eng.uber.com/logging/" target="_blank">опыт Uber</a> в преобразовании своей инфраструктуры журналирования с ELK на ClickHouse.

Этот гид показывает, как использовать популярный конвейер данных <a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a> для отслеживания файла журнала Nginx и отправки его в ClickHouse. Шаги, приведенные ниже, будут аналогичны для отслеживания любого типа файла журнала. Мы будем считать, что ClickHouse уже запущен и что Vector установлен (правда, пока нет необходимости его запускать).

## 1. Создайте базу данных и таблицу {#1-create-a-database-and-table}

Давайте определим таблицу для хранения событий журналов:

1. Начнем с новой базы данных с именем `nginxdb`:
    ```sql
    CREATE DATABASE IF NOT EXISTS nginxdb
    ```

2. Для начала мы просто вставим все событие журнала как одну строку. Очевидно, это не лучший формат для выполнения аналитики по журналам, но мы разберёмся с этой частью ниже, используя ***материализованные представления***.
    ```sql
    CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
        message String
    )
    ENGINE = MergeTree()
    ORDER BY tuple()
    ```
    :::note
    На данный момент нет необходимости в первичном ключе, поэтому **ORDER BY** установлен на **tuple()**.
    :::


## 2. Настройте Nginx {#2--configure-nginx}

Мы, конечно, не хотим тратить слишком много времени на объяснение Nginx, но также не хотим прятать все детали, поэтому на этом этапе мы предоставим вам достаточно информации для настройки журналирования Nginx.

1. Следующее свойство `access_log` отправляет журналы в `/var/log/nginx/my_access.log` в **смешанном** формате. Это значение помещается в секцию `http` вашего файла `nginx.conf`:
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

2. Убедитесь, что вы перезапустили Nginx, если вам нужно было изменить `nginx.conf`.

3. Сгенерируйте некоторые события журнала в журнале доступа, посетив страницы на вашем веб-сервере. Журналы в **смешанном** формате имеют следующий вид:
    ```bash
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

## 3. Настройте Vector {#3-configure-vector}

Vector собирает, преобразовывает и маршрутизирует журналы, метрики и трассировки (называемые **источниками**) к множеству различных поставщиков (называемых **стоками**), включая совместимость с ClickHouse из коробки. Источники и стоки определяются в файле конфигурации с именем **vector.toml**.

1. Следующий **vector.toml** определяет **источник** типа **file**, который отслеживает конец **my_access.log**, а также определяет **сток** как таблицу **access_logs**, описанную выше:
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

2. Запустите Vector, используя приведенную выше конфигурацию. <a href="https://vector.dev/docs/" target="_blank">Посетите документацию Vector</a> для получения дополнительной информации о том, как определять источники и стоки.

3. Убедитесь, что журналы доступа вставляются в ClickHouse. Выполните следующий запрос, и вы должны увидеть журналы доступа в вашей таблице:
    ```sql
    SELECT * FROM nginxdb.access_logs
    ```
    <Image img={vector01} size="lg" border alt="Просмотр журналов ClickHouse в табличном формате" />


## 4. Разбор журналов {#4-parse-the-logs}

Иметь журналы в ClickHouse — это здорово, но хранение каждого события как одной строки не позволяет проводить серьезный анализ данных. Давайте посмотрим, как разобрать события журналов, используя материализованное представление.

1. **Материализованное представление** (МП, сокращенно) — это новая таблица, основанная на существующей таблице, и когда вставляются данные в существующую таблицу, новые данные также добавляются в материализованное представление. Давайте определим МП, которое содержит разобранное представление событий журналов в **access_logs**, другими словами:
    ```bash
    192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

    В ClickHouse есть различные функции для разбора строки, но для начала давайте рассмотрим **splitByWhitespace** - которая разбивает строку по пробелам и возвращает каждый токен в массиве. Для демонстрации выполните следующую команду:
    ```sql
    SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    Обратите внимание, что ответ довольно близок к тому, что мы хотим! Несколько строк содержат лишние символы, и пользовательский агент (данные о браузере) не требовалось разбирать, но мы решим эту проблему на следующем шаге:
    ```text
    ["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
    ```

2. Аналогично **splitByWhitespace**, функция **splitByRegexp** разбивает строку на массив на основе регулярного выражения. Выполните следующую команду, которая возвращает две строки.
    ```sql
    SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    Обратите внимание, что вторая возвращенная строка — это успешно разобранный пользовательский агент из журнала:
    ```text
    ["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
    ```

3. Прежде чем рассмотреть окончательную команду **CREATE MATERIALIZED VIEW**, давайте взглянем на пару дополнительных функций, используемых для очистки данных. Например, `RequestMethod` выглядит как **"GET** с нежелательной двойной кавычкой. Выполните следующую функцию **trim**, которая удаляет двойную кавычку:
    ```sql
    SELECT trim(LEADING '"' FROM '"GET')
    ```

4. Строка времени имеет ведущую квадратную скобку и также не находится в формате, который ClickHouse может разобрать в дату. Однако, если мы изменим разделитель с двоеточия (**:**) на запятую (**,**), то разбор будет работать отлично:
    ```sql
    SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
    ```

5. Теперь мы готовы определить наше материализованное представление. Наша реализация включает **POPULATE**, что означает, что существующие строки в **access_logs** будут обработаны и вставлены немедленно. Выполните следующий SQL-запрос:
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

6. Теперь проверьте, что это сработало. Вы должны увидеть журналы доступа, красиво разбитые на столбцы:
    ```sql
    SELECT * FROM nginxdb.access_logs_view
    ```
    <Image img={vector02} size="lg" border alt="Просмотр разобранных журналов ClickHouse в табличном формате" />

    :::note
    Урок выше сохранил данные в двух таблицах, но вы можете изменить первоначальную таблицу `nginxdb.access_logs`, чтобы использовать движок таблиц **Null** - разобранные данные все равно окажутся в таблице `nginxdb.access_logs_view`, но необработанные данные не будут храниться в таблице.
    :::


**Резюме:** Используя Vector, для установки и быстрой настройки которого требовалось всего лишь немного времени, мы можем отправлять журналы с сервера Nginx в таблицу ClickHouse. С помощью умного материализованного представления мы можем разбить эти журналы на столбцы для упрощения аналитики.

## Связанный контент {#related-content}

- Блог: [Построение решения по наблюдаемости с ClickHouse в 2023 году - Часть 1 - Журналы](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- Блог: [Отправка журналов Nginx в ClickHouse с помощью Fluent Bit ](https://clickhouse.com/blog/nginx-logs-to-clickhouse-fluent-bit)
- Блог: [Отправка журналов Kubernetes в ClickHouse с помощью Fluent Bit](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit)
