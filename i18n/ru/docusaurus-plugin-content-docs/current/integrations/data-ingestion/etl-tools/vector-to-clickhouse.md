---
sidebar_label: 'Вектор'
sidebar_position: 220
slug: '/integrations/vector'
description: 'Как отправить файл журнала в ClickHouse с помощью Vector'
---

import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';


# Интеграция Vector с ClickHouse

Возможность анализа ваших журналов в реальном времени критически важна для приложений в производственной среде. Когда-либо задумывались о том, насколько хорошо ClickHouse может хранить и анализировать данные журналов? Просто ознакомьтесь с <a href="https://eng.uber.com/logging/" target="_blank">опытом Uber</a> по переходу от ELK к ClickHouse.

Этот гид показывает, как использовать популярный инструмент для обработки данных <a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a>, чтобы следить за файлом журнала Nginx и отправлять его в ClickHouse. Шаги ниже будут аналогичны для отслеживания любого типа файла журнала. Мы предполагаем, что ClickHouse уже установлен и работает, и Vector тоже установлен (но пока не нужно его запускать).

## 1. Создайте базу данных и таблицу {#1-create-a-database-and-table}

Давайте определим таблицу для хранения событий журнала:

1. Начнем с новой базы данных с именем `nginxdb`:
    ```sql
    CREATE DATABASE IF NOT EXISTS nginxdb
    ```

2. Для начала мы просто будем вставлять все события журнала как одну строку. Очевидно, это не лучший формат для выполнения аналитики на данных журнала, но мы решим эту часть ниже с использованием ***материализованных представлений***.
    ```sql
    CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
        message String
    )
    ENGINE = MergeTree()
    ORDER BY tuple()
    ```
    :::note
    На самом деле пока нет необходимости в первичном ключе, поэтому **ORDER BY** установлен на **tuple()**.
    :::


## 2. Настройка Nginx {#2--configure-nginx}

Мы не хотим тратить слишком много времени на объяснение Nginx, но также не хотим скрывать все детали, поэтому на этом этапе мы предоставим вам достаточно информации для настройки журналирования в Nginx.

1. Свойство `access_log` отправляет журналы в `/var/log/nginx/my_access.log` в формате **combined**. Это значение помещается в раздел `http` вашего файла `nginx.conf`:
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

2. Обязательно перезапустите Nginx, если вы вносили изменения в `nginx.conf`.

3. Сгенерируйте несколько событий журнала в журнале доступа, посетив страницы на вашем веб-сервере. Журналы в формате **combined** имеют следующий формат:
    ```bash
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, как Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

## 3. Настройка Vector {#3-configure-vector}

Vector собирает, преобразует и направляет журналы, метрики и трассировки (называемые **источниками**) к различным поставщикам (называемым **приемниками**), включая интеграцию с ClickHouse "из коробки". Источники и приемники определяются в конфигурационном файле с именем **vector.toml**.

1. Следующий **vector.toml** определяет **источник** типа **file**, который отслеживает конец **my_access.log**, и также определяет **приемник** как таблицу **access_logs**, определенную выше:
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

2. Запустите Vector, используя приведенную конфигурацию. <a href="https://vector.dev/docs/" target="_blank">Посетите документацию Vector</a> для подробной информации о том, как определять источники и приемники.

3. Проверьте, что журналы доступа вставляются в ClickHouse. Выполните следующий запрос, и вы должны увидеть журналы доступа в своей таблице:
    ```sql
    SELECT * FROM nginxdb.access_logs
    ```
    <img src={vector01} class="image" alt="Просмотр журналов" />


## 4. Парсинг журналов {#4-parse-the-logs}

Хранение журналов в ClickHouse отлично, но хранение каждого события как одной строки не позволяет проводить много анализа данных. Давайте посмотрим, как разобрать события журнала, используя материализованное представление.

1. **Материализованное представление** (сокращенно MV) — это новая таблица на основе существующей таблицы, и когда вставки выполняются в существующую таблицу, новые данные также добавляются в материализованное представление. Давайте посмотрим, как определить MV, которое содержит разобранное представление событий журнала в **access_logs**, другими словами:
    ```bash
    192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, как Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

    В ClickHouse есть различные функции для разбора строки, но для начала давайте взглянем на **splitByWhitespace** — который разбивает строку по пробелам и возвращает каждый токен в массиве. Чтобы продемонстрировать, выполните следующую команду:
    ```sql
    SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    Обратите внимание, что ответ довольно близок к тому, что мы хотим! Некоторые строки имеют дополнительные символы, и пользовательский агент (данные о браузере) не нужно разбирать, но мы решим это на следующем шаге:
    ```text
    ["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
    ```

2. Аналогично **splitByWhitespace**, функция **splitByRegexp** разбивает строку на массив, основываясь на регулярном выражении. Выполните следующую команду, которая возвращает две строки.
    ```sql
    SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, как Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    Обратите внимание, что вторая строка, возвращаемая — это пользовательский агент, успешно разобранный из журнала:
    ```text
    ["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, как Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
    ```

3. Прежде чем рассматривать окончательную команду **CREATE MATERIALIZED VIEW**, давайте посмотрим на еще несколько функций, используемых для очистки данных. Например, `RequestMethod` выглядит как **"GET** с ненужной двойной кавычкой. Выполните следующую функцию **trim**, которая удаляет двойную кавычку:
    ```sql
    SELECT trim(LEADING '"' FROM '"GET')
    ```

4. Строка времени имеет ведущую квадратную скобку и также не находится в формате, который ClickHouse может разобрать в дату. Однако, если мы изменим разделитель с двоеточия (**:**) на запятую (**,**), то парсинг будет работать отлично:
    ```sql
    SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
    ```

5. Теперь мы готовы определить наше материализованное представление. Наша определение включает **POPULATE**, что означает, что существующие строки в **access_logs** будут обработаны и вставлены сразу. Выполните следующий оператор SQL:
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

6. Теперь проверьте, что это сработало. Вы должны увидеть журналы доступа, красиво разобранные на колонки:
    ```sql
    SELECT * FROM nginxdb.access_logs_view
    ```
    <img src={vector02} class="image" alt="Просмотр журналов" />

    :::note
    В уроке выше данные были хранены в двух таблицах, но вы можете изменить начальную таблицу `nginxdb.access_logs`, чтобы использовать движок таблицы **Null** - разобранные данные все равно попадут в таблицу `nginxdb.access_logs_view`, но необработанные данные не будут храниться в таблице.
    :::


**Резюме:** Используя Vector, который требует лишь простой установки и быстрой настройки, мы можем отправлять журналы с сервера Nginx в таблицу ClickHouse. С помощью умного материализованного представления мы можем разбивать эти журналы на колонки для более удобной аналитики.

## Связанное содержимое {#related-content}

- Блог: [Создание решения для наблюдаемости с ClickHouse в 2023 году - Часть 1 - Журналы](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- Блог: [Отправка журналов Nginx в ClickHouse с помощью Fluent Bit ](https://clickhouse.com/blog/nginx-logs-to-clickhouse-fluent-bit)
- Блог: [Отправка журналов Kubernetes в ClickHouse с помощью Fluent Bit](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit)
