---
slug: '/integrations/vector'
sidebar_label: Вектор
sidebar_position: 220
description: 'Как дополнять файл журнала в ClickHouse, используя Vector'
title: 'Интеграция Vector с ClickHouse'
doc_type: guide
show_related_blogs: true
---
import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Интеграция Vector с ClickHouse

<CommunityMaintainedBadge/>

Возможность анализировать ваши логи в реальном времени критически важна для производственных приложений. Вы когда-нибудь задумывались, хорошо ли ClickHouse подходит для хранения и анализа логов? Просто посмотрите на <a href="https://eng.uber.com/logging/" target="_blank">опыт Uber</a> по преобразованию своей инфраструктуры логирования с ELK на ClickHouse.

Этот гид показывает, как использовать популярный конвейер данных <a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a> для получения (tail) файла логов Nginx и отправки его в ClickHouse. Шаги, описанные ниже, будут аналогичны для получения любого типа файла логов. Мы предположим, что ClickHouse уже запущен и Vector установлен (пока его запускать не нужно).

## 1. Создать базу данных и таблицу {#1-create-a-database-and-table}

Давайте определим таблицу для хранения событий логов:

1. Мы начнем с новой базы данных с именем `nginxdb`:
```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. Для начала мы просто вставим все событие лога в виде одной строки. Очевидно, это не лучший формат для выполнения аналитики по данным логов, но мы разберемся с этим ниже, используя ***материализованные представления***.
```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
    message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```
    :::note
    На данный момент нет реальной необходимости в первичном ключе, поэтому **ORDER BY** установлен на **tuple()**.
    :::

## 2. Настроить Nginx {#2--configure-nginx}

Мы, конечно, не хотим тратить слишком много времени на объяснение Nginx, но также не хотим скрывать все детали, поэтому на этом этапе мы предоставим вам достаточно информации, чтобы настроить логирование в Nginx.

1. Следующее свойство `access_log` отправляет логи в `/var/log/nginx/my_access.log` в формате **combined**. Это значение добавляется в секцию `http` вашего файла `nginx.conf`:
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

2. Не забудьте перезапустить Nginx, если вам пришлось изменить `nginx.conf`.

3. Сгенерируйте несколько событий логов в журнале доступа, посетив страницы на вашем веб-сервере. Логи в формате **combined** имеют следующий формат:
```bash
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

## 3. Настроить Vector {#3-configure-vector}

Vector собирает, преобразует и маршрутизирует логи, метрики и трассировки (называемые **источниками**) множеству разных поставщиков (называемых **приемниками**), включая готовую совместимость с ClickHouse. Источники и приемники определяются в файле конфигурации с именем **vector.toml**.

1. Следующий **vector.toml** определяет **источник** типа **file**, который получает конец **my_access.log**, и также определяет **приемник** как таблицу **access_logs**, определенную выше:
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

2. Запустите Vector, используя указанную выше конфигурацию. <a href="https://vector.dev/docs/" target="_blank">Посетите документацию Vector</a> для получения дополнительной информации о том, как определить источники и приемники.

3. Проверьте, что логи доступа вставляются в ClickHouse. Выполните следующий запрос, и вы должны увидеть логи доступа в вашей таблице:
```sql
SELECT * FROM nginxdb.access_logs
```
    <Image img={vector01} size="lg" border alt="Просмотр логов ClickHouse в табличном формате" />

## 4. Обработка логов {#4-parse-the-logs}

Важно иметь логи в ClickHouse, но хранение каждого события в виде одной строки не позволяет проводить много аналитики данных. Давайте посмотрим, как парсить события логов, используя материализованное представление.

1. **Материализованное представление** (коротко MV) — это новая таблица на основе существующей таблицы, и когда вставляются данные в существующую таблицу, новые данные также добавляются в материализованное представление. Давайте увидим, как определить MV, который содержит разобранное представление событий логов в **access_logs**, другими словами:
```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

    В ClickHouse есть различные функции для разбора строки, но для начала давайте рассмотрим **splitByWhitespace** — которая разбивает строку по пробелам и возвращает каждый токен в массиве. Для демонстрации выполните следующую команду:
```sql
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

    Обратите внимание, что ответ довольно близок к тому, что нам нужно! У нескольких строк есть лишние символы, а пользовательский агент (детали браузера) не требует разбора, но мы разберемся с этим на следующем шаге:
```text
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

2. Подобно **splitByWhitespace**, функция **splitByRegexp** разбивает строку на массив на основе регулярного выражения. Выполните следующую команду, которая возвращает две строки.
```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

    Обратите внимание, что вторая строка — это пользовательский агент, успешно разобранный из лога:
```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

3. Перед тем, как рассмотреть финальную команду **CREATE MATERIALIZED VIEW**, давайте посмотрим на несколько дополнительных функций, используемых для очистки данных. Например, `RequestMethod` выглядит как **"GET** с нежелательной двойной кавычкой. Выполните следующую функцию **trim**, которая удаляет двойную кавычку:
```sql
SELECT trim(LEADING '"' FROM '"GET')
```

4. Строка времени содержит открывающую квадратную скобку и также не находится в формате, который ClickHouse может разобрать на дату. Однако если мы изменим разделитель с двоеточия (**:**) на запятую (**,**), то разбор будет работать отлично:
```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```

5. Теперь мы готовы определить наше материализованное представление. Наша запись включает **POPULATE**, что означает, что существующие строки в **access_logs** будут обработаны и вставлены немедленно. Выполните следующий SQL-запрос:
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

6. Теперь убедитесь, что это сработало. Вы должны увидеть логи доступа аккуратно разобранные по колонкам:
```sql
SELECT * FROM nginxdb.access_logs_view
```
    <Image img={vector02} size="lg" border alt="Просмотр разобранных логов ClickHouse в табличном формате" />

    :::note
    Урок выше сохранил данные в две таблицы, но вы можете изменить исходную таблицу `nginxdb.access_logs`, чтобы использовать движок таблицы **Null** — разобранные данные все равно окажутся в таблице `nginxdb.access_logs_view`, но необработанные данные не будут храниться в таблице.
    :::

**Итог:** Используя Vector, для которого требовалась всего лишь простая установка и быстрая настройка, мы можем отправлять логи с сервера Nginx в таблицу в ClickHouse. С помощью умного материализованного представления мы можем разобрать эти логи на колонки для упрощенной аналитики.