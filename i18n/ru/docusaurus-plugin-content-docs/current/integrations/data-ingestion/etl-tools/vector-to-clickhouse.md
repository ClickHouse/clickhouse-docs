---
sidebar_label: 'Vector'
sidebar_position: 220
slug: /integrations/vector
description: 'Как передавать данные из лог-файла в ClickHouse с помощью Vector'
title: 'Интеграция Vector с ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://vector.dev/'
keywords: ['vector', 'сбор логов', 'наблюдаемость', 'ингестия данных', 'конвейер']
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Integrating Vector with ClickHouse \\{#integrating-vector-with-clickhouse\\}

<PartnerBadge />

Возможность анализировать логи в реальном времени критически важна для production-приложений.
ClickHouse превосходно справляется с хранением и анализом логов благодаря отличному сжатию (до [170x](https://clickhouse.com/blog/log-compression-170x) для логов)
и способности быстро агрегировать большие объемы данных.

Данное руководство показывает, как использовать популярный конвейер данных [Vector](https://vector.dev/docs/about/what-is-vector/) для отслеживания файла логов Nginx и отправки данных в ClickHouse.
Приведенные ниже шаги аналогичны для отслеживания файлов логов любого типа.

**Предварительные требования:**

* У вас уже установлен и запущен ClickHouse
* У вас установлен Vector

<VerticalStepper headerLevel="h2">

## Создайте базу данных и таблицу \\{#1-create-a-database-and-table\\}

Создайте таблицу для хранения событий логов:

1. Начните с новой базы данных с именем `nginxdb`:

```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. Вставьте всё событие лога одной строкой. Очевидно, что это не лучший формат для аналитики по данным логов, но ниже мы разберёмся с этим, используя ***материализованные представления***.

```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
  message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```

:::note
**ORDER BY** установлен в значение **tuple()** (пустой кортеж), так как пока нет необходимости задавать первичный ключ.
:::

## Настройка Nginx \\{#2--configure-nginx\\}

На этом шаге будет показано, как настроить логирование Nginx.

1. Следующее свойство `access_log` отправляет логи в `/var/log/nginx/my_access.log` в формате **combined**.
   Это значение указывается в секции `http` файла `nginx.conf`:

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

2. Обязательно перезапустите Nginx, если вам пришлось изменить `nginx.conf`.

3. Сгенерируйте несколько записей в журнале доступа, посетив страницы на вашем веб-сервере.
   Логи в формате **combined** выглядят следующим образом:

```bash
 192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
 192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
 192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
 ```

## Настройка Vector \\{#3-configure-vector\\}

Vector собирает, преобразует и маршрутизирует логи, метрики и трейсы (далее — **sources**) в различные системы/клиентов (далее — **sinks**), включая поддержку ClickHouse «из коробки».
Sources и sinks задаются в конфигурационном файле **vector.toml**.

1. Следующий файл **vector.toml** определяет **source** типа **file**, который отслеживает (tail) конец файла **my_access.log**, а также **sink**, использующий таблицу **access_logs**, описанную выше:

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

2. Запустите Vector, используя приведённую выше конфигурацию. Обратитесь к [документации Vector](https://vector.dev/docs/) для получения дополнительных сведений об определении источников и приёмников.

3. Убедитесь, что журналы доступа записываются в ClickHouse, выполнив следующий запрос. В вашей таблице должны отобразиться журналы доступа:

```sql
SELECT * FROM nginxdb.access_logs
```

<Image img={vector01} size="lg" border alt="Просмотр журналов ClickHouse в табличном виде" />

## Разбор логов \\{#4-parse-the-logs\\}

Хранить логи в ClickHouse полезно, но сохранение каждого события в виде одной строки не дает больших возможностей для анализа данных.
Далее мы рассмотрим, как разбирать события логов с помощью [материализованного представления](/materialized-view/incremental-materialized-view).

**Материализованное представление** работает подобно триггеру на INSERT в SQL. Когда строки данных вставляются в исходную таблицу, материализованное представление выполняет над ними некоторые преобразования и вставляет результаты в целевую таблицу.
Материализованное представление можно настроить так, чтобы формировать разобранное представление событий логов в **access_logs**.
Ниже приведен пример одного такого события лога:

```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

В ClickHouse есть различные функции для разбора приведённой выше строки. Функция [`splitByWhitespace`](/sql-reference/functions/splitting-merging-functions#splitByWhitespace) разбирает строку по пробельным символам и возвращает каждый токен в виде элемента массива.
Для демонстрации выполните следующую команду:

```sql title="Query"
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

```text title="Response"
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

В некоторых строках есть лишние символы, а user agent (сведения о браузере) не требуется парсить, но
получившийся массив близок к нужному.

Аналогично функции `splitByWhitespace`, функция [`splitByRegexp`](/sql-reference/functions/splitting-merging-functions#splitByRegexp) разбивает строку на массив по регулярному выражению.
Выполните следующую команду, которая вернёт две строки.

```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

Обратите внимание, что вторая возвращаемая строка — это User-Agent, успешно разобранный из лога:

```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

Прежде чем перейти к итоговой команде `CREATE MATERIALIZED VIEW`, давайте рассмотрим ещё пару функций, используемых для очистки данных.
Например, поле `RequestMethod` имеет значение `"GET`, то есть содержит лишнюю двойную кавычку.
Вы можете использовать функцию [`trimBoth` (псевдоним `trim`)](/sql-reference/functions/string-functions#trimBoth), чтобы удалить двойную кавычку:

```sql
SELECT trim(LEADING '"' FROM '"GET')
```

Строка с датой начинается с квадратной скобки и при этом имеет формат, который ClickHouse не может разобрать как дату.
Однако, если мы заменим разделитель с двоеточия (**:**) на запятую (**,**), разбор уже работает отлично:

```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```

Теперь мы готовы определить материализованное представление.
Определение ниже включает `POPULATE`, что означает, что существующие строки в **access_logs** будут обработаны и вставлены сразу же.
Выполните следующую SQL-команду:

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

Теперь убедитесь, что всё работает.
Вы должны увидеть журналы доступа, корректно разобранные по столбцам:

```sql
SELECT * FROM nginxdb.access_logs_view
```

<Image img={vector02} size="lg" border alt="Просмотр разобранных журналов ClickHouse в табличном формате" />

:::note
В приведённом выше примере данные сохраняются в двух таблицах, но вы можете изменить исходную таблицу `nginxdb.access_logs`, чтобы использовать движок таблиц [`Null`](/engines/table-engines/special/null).
Разобранные данные по-прежнему будут попадать в таблицу `nginxdb.access_logs_view`, но исходные данные не будут сохраняться в таблице.
:::
</VerticalStepper>

> Используя Vector, который требует лишь простой установки и быстрой настройки, вы можете отправлять журналы с сервера Nginx в таблицу ClickHouse. Используя материализованное представление, вы можете разобрать эти журналы по столбцам для упрощения аналитики.
