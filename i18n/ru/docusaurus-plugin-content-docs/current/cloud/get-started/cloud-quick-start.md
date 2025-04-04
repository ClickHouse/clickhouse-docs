---
sidebar_position: 1
slug: /cloud/get-started/cloud-quick-start
sidebar_label: 'Быстрый старт в Cloud'
keywords: ['clickhouse', 'установка', 'начало работы', 'быстрый старт']
pagination_next: cloud/get-started/sql-console
title: 'Быстрый старт в ClickHouse Cloud'
description: 'Руководство по быстрому старту для ClickHouse Cloud'
---

import Image from '@theme/IdealImage';
import signup_page from '@site/static/images/_snippets/signup_page.png';
import select_plan from '@site/static/images/_snippets/select_plan.png';
import createservice1 from '@site/static/images/_snippets/createservice1.png';
import scaling_limits from '@site/static/images/_snippets/scaling_limits.png';
import createservice8 from '@site/static/images/_snippets/createservice8.png';
import show_databases from '@site/static/images/_snippets/show_databases.png';
import service_connect from '@site/static/images/_snippets/service_connect.png';
import data_sources from '@site/static/images/_snippets/data_sources.png';
import select_data_source from '@site/static/images/_snippets/select_data_source.png';
import client_details from '@site/static/images/_snippets/client_details.png';
import new_rows_from_csv from '@site/static/images/_snippets/new_rows_from_csv.png';
import SQLConsoleDetail from '@site/docs/_snippets/_launch_sql_console.md';


# Быстрый старт в ClickHouse Cloud

Самый быстрый и простой способ начать работу с ClickHouse - создать новую
услугу в [ClickHouse Cloud](https://console.clickhouse.cloud).

## 1. Создание сервиса ClickHouse {#1-create-a-clickhouse-service}

Чтобы создать бесплатный сервис ClickHouse в [ClickHouse Cloud](https://console.clickhouse.cloud), вам нужно просто зарегистрироваться, выполнив следующие шаги:

  - Создайте аккаунт на [странице регистрации](https://console.clickhouse.cloud/signUp)
  - Вы можете выбрать регистрацию с помощью электронной почты или через Google SSO, Microsoft SSO, AWS Marketplace, Google Cloud или Microsoft Azure
  - Если вы зарегистрировались с помощью электронной почты и пароля, не забудьте подтвердить свой адрес электронной почты в течение следующих 24 часов по ссылке, которую вы получите по электронной почте
  - Войдите, используя имя пользователя и пароль, которые вы только что создали

<Image img={signup_page} size="md" alt='Выбор плана' border/>
<br/>

После входа в систему ClickHouse Cloud запускает мастер настройки, который проводит вас через создание нового сервиса ClickHouse. Изначально вам будет предложено [выбрать план](/cloud/manage/cloud-tiers):

<Image img={select_plan} size="md" alt='Выбор плана' border/>
<br/>

:::tip
Мы рекомендуем уровень Scale для большинства рабочей нагрузки.
Дополнительные сведения о уровнях можно найти [здесь](/cloud/manage/cloud-tiers)
:::

Выбор плана требует от вас указать желаемый регион для развертывания вашего первого сервиса.
Точные доступные варианты будут зависеть от выбранного уровня.
В следующем шаге мы предполагаем, что пользователь выбрал рекомендуемый уровень Scale.

Выберите желаемый регион для развертывания сервиса и дайте вашему новому сервису имя:

<Image img={createservice1} size="md" alt='Новый сервис ClickHouse' border/>
<br/>

По умолчанию уровень Scale создаст 3 реплики, каждая из которых будет иметь 4 VCPU и 16 GiB ОЗУ. [Вертикальная автоподстройка](/manage/scaling#vertical-auto-scaling) будет включена по умолчанию в уровне Scale.

Пользователи могут настраивать ресурсы сервиса при необходимости, указывая минимальный и максимальный размер для масштабирования реплик. Когда будете готовы, выберите `Create service`.

<Image img={scaling_limits} size="md" alt='Ограничения масштабирования' border/>
<br/>

Поздравляем! Ваш сервис ClickHouse Cloud запущен, и настройка завершена. Продолжайте читать, чтобы узнать, как начать принимать и запрашивать ваши данные.

## 2. Подключение к ClickHouse {#2-connect-to-clickhouse}
Существует 2 способа подключения к ClickHouse:
  - Подключение с помощью нашего веб-интерфейса SQL консоли
  - Подключение с вашим приложением

### Подключение с помощью SQL консоли {#connect-using-sql-console}

Чтобы быстро начать, ClickHouse предоставляет веб-интерфейс SQL консоли, в который вы будете перенаправлены по завершении настройки.

<Image img={createservice8} size="md" alt='SQL Консоль' border/>
<br/>

Создайте вкладку запроса и введите простой запрос, чтобы проверить, что ваше соединение работает:

<br/>
```sql
SHOW databases
```

Вы должны увидеть в списке 4 базы данных, а также любые, которые вы могли добавить.

<Image img={show_databases} size="md" alt='SQL Консоль' border/>
<br/>

Вот и всё - вы готовы начать использовать ваш новый сервис ClickHouse!

### Подключение с вашим приложением {#connect-with-your-app}

Нажмите кнопку подключения в навигационном меню. Откроется модальное окно с учетными данными вашего сервиса и с набором инструкций о том, как подключиться с использованием ваших интерфейсов или языковых клиентов.

<Image img={service_connect} size="md" alt='Подключение сервиса' border/>
<br/>

Если вы не видите своего языкового клиента, возможно, вам стоит проверить наш список [Интеграций](/integrations).

## 3. Добавление данных {#3-add-data}

ClickHouse лучше с данными! Существует несколько способов добавления данных, и большинство из них доступны на странице Источники данных, к которой можно получить доступ через навигационное меню.

<Image img={data_sources} size="md" alt='Источники данных' border/>
<br/>

Вы можете загружать данные с помощью следующих методов:
  - Настройка ClickPipe для начала приема данных из таких источников, как S3, Postgres, Kafka, GCS
  - Использование SQL консоли
  - Использование клиента ClickHouse
  - Загрузка файла - поддерживаемые форматы включают JSON, CSV и TSV
  - Загрузка данных по URL файла

### ClickPipes {#clickpipes}

[ClickPipes](http://clickhouse.com/docs/integrations/clickpipes) - это управляемая интеграционная платформа, которая делает прием данных из разнообразных источников таким же простым, как нажатие нескольких кнопок. Разработанная для самых требовательных рабочих нагрузок, надежная и масштабируемая архитектура ClickPipes гарантирует стабильную производительность и надежность. ClickPipes может использоваться для долгосрочных потоковых задач или одноразовых загрузок данных.

<Image img={select_data_source} size="md" alt='Выбор источника данных' border/>
<br/>

### Добавление данных с помощью SQL Консоли {#add-data-using-the-sql-console}

Как и большинство систем управления базами данных, ClickHouse логически группирует таблицы в **базы данных**. Используйте команду [`CREATE DATABASE`](../../sql-reference/statements/create/database.md) для создания новой базы данных в ClickHouse:

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

Выполните следующую команду, чтобы создать таблицу с именем `my_first_table` в базе данных `helloworld`:

```sql
CREATE TABLE helloworld.my_first_table
(
    user_id UInt32,
    message String,
    timestamp DateTime,
    metric Float32
)
ENGINE = MergeTree()
PRIMARY KEY (user_id, timestamp)
```

В приведенном выше примере, `my_first_table` - это таблица [`MergeTree`](../../engines/table-engines/mergetree-family/mergetree.md) с четырьмя колонками:

  - `user_id`:  32-битное беззнаковое целое число ([UInt32](../../sql-reference/data-types/int-uint.md))
  - `message`: тип данных [String](../../sql-reference/data-types/string.md), который заменяет такие типы, как `VARCHAR`, `BLOB`, `CLOB` и другие из других систем баз данных
  - `timestamp`: значение [DateTime](../../sql-reference/data-types/datetime.md), которое представляет момент времени
  - `metric`: 32-битное число с плавающей точкой ([Float32](../../sql-reference/data-types/float.md))

:::note Движки таблиц
Движки таблиц определяют:
  - Как и где хранятся данные
  - Какие запросы поддерживаются
  - Реплицируются ли данные
<br/>
Существует множество движков таблиц на выбор, но для простой таблицы на сервере ClickHouse с одним узлом, [`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) будет вашим вероятным выбором.
:::

#### Краткое введение в первичные ключи {#a-brief-intro-to-primary-keys}

Перед тем, как продолжить, важно понять, как работают первичные ключи в ClickHouse (реализация
первичных ключей может показаться неожиданной!):

  - первичные ключи в ClickHouse **_не уникальны_** для каждой строки в таблице

Первичный ключ таблицы ClickHouse определяет, как данные сортируются при записи на диск. Каждые 8,192 строки или 10MB
данных (что называется **гранулярностью индекса**) создают запись в файле индекса первичного ключа. Эта концепция гранулярности
создает **разреженный индекс**, который легко помещается в память, а гранулы представляют собой полоску наименьшего объема
колонковых данных, которые обрабатываются во время `SELECT` запросов.

Первичный ключ может быть определен с помощью параметра `PRIMARY KEY`. Если вы определяете таблицу без указанного первичного ключа,
тогда ключ становится кортежем, указанным в предложении `ORDER BY`. Если вы укажете и `PRIMARY KEY`, и `ORDER BY`, первичный ключ должен быть подмножеством порядка сортировки.

Первичный ключ также является ключом сортировки из кортежа `(user_id, timestamp)`. Поэтому данные, хранящиеся в каждом
файле колонки, будут отсортированы по `user_id`, затем `timestamp`.

Для глубокого погружения в основные концепции ClickHouse, смотрите ["Основные концепции"](../../managing-data/core-concepts/index.md).

#### Вставка данных в вашу таблицу {#insert-data-into-your-table}

Вы можете использовать знакомую команду [`INSERT INTO TABLE`](../../sql-reference/statements/insert-into.md) с ClickHouse, но важно понимать, что каждое вставка в таблицу [`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) приводит к созданию **части** в хранилище.

:::tip Рекомендация по лучшим практикам ClickHouse
Вставляйте большое количество строк за раз - десятки тысяч или даже миллионы
строк одновременно. Не волнуйтесь - ClickHouse легко справляется с таким объемом - и это [сэкономит вам деньги](/cloud/bestpractices/bulkinserts.md) за счет отправки меньшего количества запросов на запись в ваш сервис.
:::

<br/>

Даже для простого примера давайте вставим более одной строки за раз:

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Привет, ClickHouse!',                               now(),       -1.0    ),
    (102, 'Вставляйте много строк за раз',                    yesterday(), 1.41421 ),
    (102, 'Сортируйте ваши данные на основе часто используемых запросов', today(),     2.718   ),
    (101, 'Гранулы - это наименьшие кусочки читаемых данных',  now() + 5,   3.14159 )
```

:::note
Обратите внимание, что колонка `timestamp` заполняется с использованием различных [**Date**](../../sql-reference/data-types/date.md) и [**DateTime**](../../sql-reference/data-types/datetime.md) функций. ClickHouse имеет сотни полезных функций, которые вы можете [посмотреть в разделе **Функции**](/sql-reference/functions/).
:::

Давайте проверим, что всё прошло успешно:

```sql
SELECT * FROM helloworld.my_first_table
```

### Добавление данных с помощью клиента ClickHouse {#add-data-using-the-clickhouse-client}

Вы также можете подключиться к вашему сервису ClickHouse Cloud, используя инструмент командной строки под названием [**клиент clickhouse**](/interfaces/cli). Нажмите `Connect` в левом меню, чтобы получить эти данные. В диалоговом окне выберите `Native` из выпадающего меню:

<Image img={client_details} size="md" alt='детали подключения клиента clickhouse' border/>
<br/>

1. Установите [ClickHouse](/interfaces/cli).

2. Выполните команду, заменив ваш хост, имя пользователя и пароль:

```bash
./clickhouse client --host HOSTNAME.REGION.CSP.clickhouse.cloud \
--secure --port 9440 \
--user default \
--password <password>
```
Если вы видите подсказку с улыбающимся смайлом, вы готовы выполнять запросы!
```response
:)
```

3. Попробуйте выполнить следующий запрос:

<br/>

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

Обратите внимание, что ответ возвращается в удобном табличном формате:

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Вставляйте много строк за раз                      │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Сортируйте ваши данные на основе часто используемых запросов │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Привет, ClickHouse!                                │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Гранулы - это наименьшие кусочки читаемых данных │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 строки в наборе. Затраченное время: 0.008 сек.
```

4. Добавьте предложение [`FORMAT`](../../sql-reference/statements/select/format.md), чтобы указать один из [многих поддерживаемых форматов вывода ClickHouse](/interfaces/formats/):

<br/>

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```
В приведенном запросе, вывод возвращается в виде табуляции:
```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Вставляйте много строк за раз      2022-03-21 00:00:00     1.41421
102 Сортируйте ваши данные на основе часто используемых запросов  2022-03-22 00:00:00     2.718
101 Привет, ClickHouse!  2022-03-22 14:04:09     -1
101 Гранулы - это наименьшие кусочки читаемых данных  2022-03-22 14:04:14     3.14159

4 строки в наборе. Затраченное время: 0.005 сек.
```

5. Чтобы выйти из `clickhouse client`, введите команду **exit**:

<br/>

```bash
exit
```

### Загрузка файла {#upload-a-file}

Распространенной задачей при работе с базами данных является вставка некоторых данных, которые у вас уже есть в файлах. У нас есть некоторые образцы данных в интернете, которые вы можете вставить, представляющие данные потоков кликов - они включают идентификатор пользователя, URL, который был посещен, и временную метку события.

Предположим, у нас есть следующий текст в CSV-файле с именем `data.csv`:

```bash title="data.csv"
102,Это данные в файле,2022-02-22 10:43:28,123.45
101,Это разделенные запятыми,2022-02-23 00:00:00,456.78
103,Используйте FORMAT, чтобы указать формат,2022-02-21 10:43:30,678.90
```

1. Следующая команда вставляет данные в `my_first_table`:

<br/>

```bash
./clickhouse client --host HOSTNAME.REGION.CSP.clickhouse.cloud \
--secure --port 9440 \
--user default \
--password <password> \
--query='INSERT INTO helloworld.my_first_table FORMAT CSV' < data.csv
```

2. Обратите внимание, что новые строки теперь появляются в таблице, если вы запрашиваете из SQL консоли:

<br/>

<Image img={new_rows_from_csv} size="md" alt='Новые строки из файла CSV' />
<br/>

## Что дальше? {#whats-next}

- В [Учебник](/tutorial.md) у вас есть возможность вставить 2 миллиона строк в таблицу и написать некоторые аналитические запросы
- У нас есть список [примеров наборов данных](/getting-started/index.md) с инструкциями о том, как их вставить
- Посмотрите наше 25-минутное видео о [Начале работы с ClickHouse](https://clickhouse.com/company/events/getting-started-with-clickhouse/)
- Если ваши данные поступают из внешнего источника, посмотрите нашу [коллекцию руководств по интеграции](/integrations/index.mdx) для подключения к очередям сообщений, базам данных, конвейерам и другим
- Если вы используете инструмент визуализации UI/BI, ознакомьтесь с [руководствами пользователя по подключению UI к ClickHouse](/integrations/data-visualization)
- Руководство пользователя по [первичным ключам](/guides/best-practices/sparse-primary-indexes.md) содержит все, что вам нужно знать о первичных ключах и том, как их определить
