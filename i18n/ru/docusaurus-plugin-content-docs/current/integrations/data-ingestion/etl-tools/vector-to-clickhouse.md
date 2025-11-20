---
sidebar_label: 'Vector'
sidebar_position: 220
slug: /integrations/vector
description: 'Как считывать лог-файл в ClickHouse с помощью Vector'
title: 'Интеграция Vector с ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://vector.dev/'
keywords: ['vector', 'log collection', 'observability', 'data ingestion', 'pipeline']
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Интеграция Vector с ClickHouse

<PartnerBadge />

Возможность анализировать логи в реальном времени критически важна для production-приложений.
ClickHouse превосходно справляется с хранением и анализом логов благодаря отличному сжатию (до [170x](https://clickhouse.com/blog/log-compression-170x) для логов)
и способности быстро агрегировать большие объемы данных.

Это руководство показывает, как использовать популярный конвейер данных [Vector](https://vector.dev/docs/about/what-is-vector/) для чтения лог-файла Nginx и отправки данных в ClickHouse.
Приведенные ниже шаги аналогичны для чтения любого типа лог-файлов.

**Предварительные требования:**

- У вас уже установлен и запущен ClickHouse
- У вас установлен Vector

<VerticalStepper headerLevel="h2">


## Создание базы данных и таблицы {#1-create-a-database-and-table}

Определите таблицу для хранения событий лога:

1. Начните с создания новой базы данных с именем `nginxdb`:

```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. Вставьте всё событие лога как одну строку. Очевидно, что это не лучший формат для аналитики данных лога, но мы разберёмся с этим ниже, используя **_материализованные представления_**.

```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
  message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```

:::note
**ORDER BY** установлен в **tuple()** (пустой кортеж), так как первичный ключ пока не нужен.
:::


## Настройка Nginx {#2--configure-nginx}

На этом шаге вы узнаете, как настроить логирование Nginx.

1. Следующее свойство `access_log` записывает логи в `/var/log/nginx/my_access.log` в формате **combined**.
   Это значение добавляется в секцию `http` файла `nginx.conf`:

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

2. Обязательно перезапустите Nginx, если вы внесли изменения в `nginx.conf`.

3. Сгенерируйте несколько событий в логе доступа, посетив страницы вашего веб-сервера.
   Логи в формате **combined** выглядят следующим образом:

```bash
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```


## Настройка Vector {#3-configure-vector}

Vector собирает, преобразует и маршрутизирует логи, метрики и трассировки (называемые **источниками**) к различным получателям (называемым **приёмниками**), включая встроенную поддержку ClickHouse.
Источники и приёмники определяются в конфигурационном файле **vector.toml**.

1. Следующий файл **vector.toml** определяет **источник** типа **file**, который отслеживает конец файла **my_access.log**, а также определяет **приёмник** в виде таблицы **access_logs**, определённой выше:

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

2. Запустите Vector, используя приведённую выше конфигурацию. Посетите [документацию](https://vector.dev/docs/) Vector для получения дополнительной информации об определении источников и приёмников.

3. Убедитесь, что логи доступа вставляются в ClickHouse, выполнив следующий запрос. Вы должны увидеть логи доступа в вашей таблице:

```sql
SELECT * FROM nginxdb.access_logs
```

<Image
  img={vector01}
  size='lg'
  border
  alt='Просмотр логов ClickHouse в табличном формате'
/>


## Парсинг логов {#4-parse-the-logs}

Хранить логи в ClickHouse удобно, но сохранение каждого события в виде одной строки не позволяет проводить полноценный анализ данных.
Далее мы рассмотрим, как парсить события логов с помощью [материализованного представления](/materialized-view/incremental-materialized-view).

**Материализованное представление** работает аналогично триггеру вставки в SQL. Когда строки данных вставляются в исходную таблицу, материализованное представление выполняет преобразования этих строк и вставляет результаты в целевую таблицу.
Материализованное представление можно настроить для создания распарсенного представления событий логов в **access_logs**.
Пример такого события лога показан ниже:

```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

В ClickHouse есть различные функции для парсинга приведённой выше строки. Функция [`splitByWhitespace`](/sql-reference/functions/splitting-merging-functions#splitByWhitespace) разбивает строку по пробельным символам и возвращает каждый токен в массиве.
Для демонстрации выполните следующую команду:

```sql title="Query"
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

```text title="Response"
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

Некоторые строки содержат лишние символы, а user agent (информация о браузере) не был распарсен должным образом, но
полученный массив близок к требуемому результату.

Аналогично `splitByWhitespace`, функция [`splitByRegexp`](/sql-reference/functions/splitting-merging-functions#splitByRegexp) разбивает строку на массив на основе регулярного выражения.
Выполните следующую команду, которая вернёт две строки.

```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

Обратите внимание, что вторая возвращённая строка — это успешно извлечённый из лога user agent:

```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

Прежде чем рассмотреть финальную команду `CREATE MATERIALIZED VIEW`, давайте изучим ещё несколько функций, используемых для очистки данных.
Например, значение `RequestMethod` равно `"GET` и содержит нежелательную двойную кавычку.
Вы можете использовать функцию [`trimBoth` (псевдоним `trim`)](/sql-reference/functions/string-functions#trimBoth) для удаления двойной кавычки:

```sql
SELECT trim(LEADING '"' FROM '"GET')
```

Строка времени имеет ведущую квадратную скобку и находится в формате, который ClickHouse не может распарсить в дату.
Однако если мы изменим разделитель с двоеточия (**:**) на пробел, то парсинг будет работать корректно:

```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```


Теперь мы готовы определить материализованное представление.
Определение ниже включает `POPULATE`, что означает, что существующие строки в **access_logs** будут обработаны и вставлены сразу же.
Выполните следующий SQL-запрос:

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

Теперь проверьте, что всё работает.
Вы должны увидеть журналы доступа, корректно разобранные по столбцам:

```sql
SELECT * FROM nginxdb.access_logs_view
```

<Image
  img={vector02}
  size='lg'
  border
  alt='Просмотр разобранных журналов ClickHouse в табличном формате'
/>

:::note
В приведённом выше примере данные сохраняются в двух таблицах, но вы можете изменить исходную таблицу `nginxdb.access_logs`, чтобы использовать движок таблиц [`Null`](/engines/table-engines/special/null).
Разобранные данные по-прежнему будут попадать в таблицу `nginxdb.access_logs_view`, но исходные данные не будут сохраняться в таблице.
:::

</VerticalStepper>

> Используя Vector, который требует только простой установки и быстрой настройки, вы можете отправлять журналы с сервера Nginx в таблицу ClickHouse. Используя материализованное представление, вы можете разобрать эти журналы по столбцам для упрощения аналитики.
