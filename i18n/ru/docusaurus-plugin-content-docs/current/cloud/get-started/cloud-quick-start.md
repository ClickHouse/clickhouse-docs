---
sidebar_position: 1
slug: /cloud/get-started/cloud-quick-start
sidebar_label: 'Быстрый старт с облаком'
keywords: ['clickhouse', 'установка', 'начало работы', 'быстрый старт']
pagination_next: cloud/get-started/sql-console
title: 'Быстрый старт с ClickHouse Cloud'
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
import SQLConsoleDetail from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_launch_sql_console.md';


# Быстрый старт с ClickHouse Cloud

Самый быстрый и простой способ начать работать с ClickHouse — создать новый
сервис в [ClickHouse Cloud](https://console.clickhouse.cloud).

## 1. Создайте сервис ClickHouse {#1-create-a-clickhouse-service}

Чтобы создать бесплатный сервис ClickHouse в [ClickHouse Cloud](https://console.clickhouse.cloud), вам просто нужно зарегистрироваться, выполнив следующие шаги:

  - Создайте учетную запись на [странице регистрации](https://console.clickhouse.cloud/signUp)
  - Вы можете зарегистрироваться с помощью вашей электронной почты или через Google SSO, Microsoft SSO, AWS Marketplace, Google Cloud или Microsoft Azure
  - Если вы зарегистрировались с помощью электронной почты и пароля, не забудьте подтвердить ваш адрес электронной почты в течение следующих 24 часов по ссылке, которую вы получите на свою почту
  - Войдите, используя имя пользователя и пароль, которые вы только что создали

<Image img={signup_page} size="md" alt='Выбор плана' border/>
<br/>

После входа в систему ClickHouse Cloud запускает мастер настройки, который проводит вас через создание нового сервиса ClickHouse. Вам изначально будет предложено [выбрать план](/cloud/manage/cloud-tiers):

<Image img={select_plan} size="md" alt='Выбор плана' border/>
<br/>

:::tip
Мы рекомендуем уровень Scale для большинства рабочих нагрузок.
Дополнительные сведения о уровнях можно найти [здесь](/cloud/manage/cloud-tiers)
:::

Выбор плана требует от вас выбора желаемого региона для развертывания вашего первого сервиса.
Конкретные доступные варианты будут зависеть от выбранного уровня.
В следующем шаге предполагается, что пользователь выбрал рекомендованный уровень Scale.

Выберите желаемый регион для развертывания сервиса и дайте вашему новому сервису название:

<Image img={createservice1} size="md" alt='Новый сервис ClickHouse' border/>
<br/>

По умолчанию уровень Scale создаст 3 реплики, каждая из которых будет иметь 4 VCPUs и 16 GiB ОЗУ. [Вертикальное автомасштабирование](/manage/scaling#vertical-auto-scaling) будет включено по умолчанию в уровне Scale.

Пользователи могут настроить ресурсы сервиса, если это необходимо, указав минимальный и максимальный размер для реплик, между которыми они будут масштабироваться. Когда будете готовы, выберите `Создать сервис`.

<Image img={scaling_limits} size="md" alt='Ограничения масштабирования' border/>
<br/>

Поздравляем! Ваш сервис ClickHouse Cloud запущен, и настройка завершена. Продолжайте читать, чтобы узнать, как начать загружать и запрашивать ваши данные.

## 2. Подключитесь к ClickHouse {#2-connect-to-clickhouse}
Существует 2 способа подключения к ClickHouse:
  - Подключиться с помощью нашего веб-интерфейса SQL
  - Подключиться с помощью вашего приложения

### Подключение с помощью SQL-интерфейса {#connect-using-sql-console}

Для быстрого старта ClickHouse предоставляет веб-интерфейс SQL, на который вы будете перенаправлены после завершения настройки.

<Image img={createservice8} size="md" alt='SQL Интерфейс' border/>
<br/>

Создайте вкладку запроса и введите простой запрос, чтобы убедиться, что ваше соединение работает:

<br/>
```sql
SHOW databases
```

Вы должны увидеть 4 базы данных в списке, плюс любые, которые вы могли добавить.

<Image img={show_databases} size="md" alt='SQL Интерфейс' border/>
<br/>

Вот и все - вы готовы начать использовать ваш новый сервис ClickHouse!

### Подключение с вашим приложением {#connect-with-your-app}

Нажмите кнопку подключения в навигационном меню. Откроется модальное окно, предлагающее учетные данные для вашего сервиса и набор инструкций о том, как подключиться с помощью вашего интерфейса или клиентских библиотек.

<Image img={service_connect} size="md" alt='Подключение к сервису' border/>
<br/>

Если вы не видите свой клиент языка, вам стоит проверить наш список [Интеграций](/integrations).

## 3. Добавьте данные {#3-add-data}

ClickHouse лучше с данными! Существует множество способов добавления данных, и большинство из них доступны на странице Источники данных, к которой можно получить доступ в навигационном меню.

<Image img={data_sources} size="md" alt='Источники данных' border/>
<br/>

Вы можете загрузить данные следующими способами:
  - Настройте ClickPipe для начала приема данных из источников, таких как S3, Postgres, Kafka, GCS
  - Используйте SQL интерфейс
  - Используйте клиент ClickHouse
  - Загрузите файл - поддерживаемые форматы включают JSON, CSV и TSV
  - Загрузите данные с URL файла

### ClickPipes {#clickpipes}

[ClickPipes](http://clickhouse.com/docs/integrations/clickpipes) - это управляемая интеграционная платформа, которая упрощает прием данных из разнообразных источников всего несколькими нажатиями кнопок. Спроектированная для самых требовательных рабочих нагрузок, надежная и масштабируемая архитектура ClickPipes обеспечивает стабильную производительность и надежность. ClickPipes можно использовать для долгосрочного стриминга или одноразовой загрузки данных.

<Image img={select_data_source} size="md" alt='Выбор источника данных' border/>
<br/>

### Добавьте данные с помощью SQL-интерфейса {#add-data-using-the-sql-console}

Как и большинство систем управления базами данных, ClickHouse логически группирует таблицы в **базы данных**. Используйте команду [`CREATE DATABASE`](../../sql-reference/statements/create/database.md), чтобы создать новую базу данных в ClickHouse:

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

В приведенном выше примере `my_first_table` — это таблица [`MergeTree`](../../engines/table-engines/mergetree-family/mergetree.md) с четырьмя столбцами:

  - `user_id`:  32-битное беззнаковое целое число ([UInt32](../../sql-reference/data-types/int-uint.md))
  - `message`: тип данных [String](../../sql-reference/data-types/string.md), который заменяет такие типы, как `VARCHAR`, `BLOB`, `CLOB` и другие из других систем управления базами данных
  - `timestamp`: значение [DateTime](../../sql-reference/data-types/datetime.md), которое представляет момент времени
  - `metric`: 32-битное число с плавающей запятой ([Float32](../../sql-reference/data-types/float.md))

:::note Движки таблиц
Движки таблиц определяют:
  - Как и где хранятся данные
  - Какие запросы поддерживаются
  - Реплицируются ли данные или нет
<br/>
Существует множество движков таблиц на выбор, но для простой таблицы на одноузловом сервере ClickHouse [`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) будет вашим вероятным выбором.
:::

#### Краткое введение в первичные ключи {#a-brief-intro-to-primary-keys}

Прежде чем продолжать, важно понять, как работают первичные ключи в ClickHouse (реализация
первичных ключей может показаться неожиданной!):

  - первичные ключи в ClickHouse **_не уникальны_** для каждой строки в таблице

Первичный ключ таблицы ClickHouse определяет, как данные сортируются при записи на диск. Каждые 8,192 строки или 10MB
данных (известных как **гранулярность индекса**) создают запись в файле индекса первичного ключа. Эта концепция гранулярности
создает **разреженный индекс**, который может легко поместиться в памяти, а гранулы представляют собой полосу наименьшего объема
данных столбца, которая обрабатывается во время запросов `SELECT`.

Первичный ключ может быть определен с помощью параметра `PRIMARY KEY`. Если вы создаете таблицу без указанного `PRIMARY KEY`,
то ключом становится кортеж, указанный вclause `ORDER BY`. Если вы указываете как `PRIMARY KEY`, так и `ORDER BY`, первичный ключ должен быть подмножеством порядка сортировки.

Первичный ключ также является ключом сортировки, который представляет собой кортеж из `(user_id, timestamp)`. Таким образом, данные, хранящиеся в каждом
файле столбца, будут отсортированы по `user_id`, затем по `timestamp`.

Для подробного изучения основных концепций ClickHouse смотрите ["Основные концепции"](../../managing-data/core-concepts/index.md).

#### Вставка данных в вашу таблицу {#insert-data-into-your-table}

Вы можете использовать знакомую команду [`INSERT INTO TABLE`](../../sql-reference/statements/insert-into.md) с ClickHouse, но важно понимать, что каждая вставка в таблицу [`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) создает **часть**, которая хранится.

:::tip Рекомендация ClickHouse
Вставляйте большое количество строк за один раз - десятки тысяч или даже миллионы.
Не переживайте - ClickHouse легко справится с таким объемом - и это [сохранит ваши деньги](/cloud/bestpractices/bulkinserts.md), отправляя меньше запросов на запись вашему сервису.
:::

<br/>

Даже для простого примера, давайте вставим более одной строки за раз:

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Привет, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Вставьте много строк за раз',                     yesterday(), 1.41421 ),
    (102, 'Отсортируйте ваши данные на основе часто используемых запросов', today(),     2.718   ),
    (101, 'Гранулы - это наименьшие части данных, которые читаются',      now() + 5,   3.14159 )
```

:::note
Обратите внимание, что столбец `timestamp` заполняется с использованием различных [**Date**](../../sql-reference/data-types/date.md) и [**DateTime**](../../sql-reference/data-types/datetime.md) функций. ClickHouse имеет сотни полезных функций, которые вы можете [посмотреть в разделе **Функции**](/sql-reference/functions/).
:::

Давайте проверим, что это сработало:

```sql
SELECT * FROM helloworld.my_first_table
```

### Добавьте данные с помощью клиента ClickHouse {#add-data-using-the-clickhouse-client}

Вы также можете подключиться к вашему сервису ClickHouse Cloud с помощью командной утилиты под названием [**клиент ClickHouse**](/interfaces/cli). Нажмите `Подключиться` в левом меню, чтобы получить эти сведения. В открывшемся окне выберите `Native` из выпадающего списка:

<Image img={client_details} size="md" alt='Подключение клиента ClickHouse' border/>
<br/>

1. Установите [ClickHouse](/interfaces/cli).

2. Выполните команду, заменяя ваше имя хоста, имя пользователя и пароль:

```bash
./clickhouse client --host HOSTNAME.REGION.CSP.clickhouse.cloud \
--secure --port 9440 \
--user default \
--password <пароль>
```
Если вы получите подсказку в виде смайлика, вы готовы запускать запросы!
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

Обратите внимание, что ответ приходит в удобном формате таблицы:

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Вставьте много строк за раз                         │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Отсортируйте ваши данные на основе часто используемых запросов │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Привет, ClickHouse!                                   │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Гранулы - это наименьшие части данных, которые читаются │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 строки в наборе. Затраченное время: 0.008 сек.
```

4. Добавьте клаузу [`FORMAT`](../../sql-reference/statements/select/format.md), чтобы указать один из [многих поддерживаемых форматов вывода ClickHouse](/interfaces/formats/):

<br/>

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```
В приведенном выше запросе вывод возвращается в табульном формате:
```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Вставьте много строк за раз  2022-03-21 00:00:00     1.41421
102 Отсортируйте ваши данные на основе часто используемых запросов  2022-03-22 00:00:00     2.718
101 Привет, ClickHouse!  2022-03-22 14:04:09     -1
101 Гранулы - это наименьшие части данных, которые читаются  2022-03-22 14:04:14     3.14159

4 строки в наборе. Затраченное время: 0.005 сек.
```

5. Чтобы выйти из `клиента ClickHouse`, введите команду **exit**:

<br/>

```bash
exit
```

### Загрузка файла {#upload-a-file}

Распространенной задачей при начале работы с базой данных является вставка некоторых данных, которые у вас уже есть в файлах. У нас есть несколько
примеров данных онлайн, которые вы можете вставить, представляющих данные о кликах - они включают идентификатор пользователя, URL, который был посещен, и
время события.

Предположим, у нас есть следующий текст в CSV файле с именем `data.csv`:

```bash title="data.csv"
102,Это данные из файла,2022-02-22 10:43:28,123.45
101,Они разделены запятыми,2022-02-23 00:00:00,456.78
103,Используйте FORMAT, чтобы указать формат,2022-02-21 10:43:30,678.90
```

1. Следующая команда вставляет данные в `my_first_table`:

<br/>

```bash
./clickhouse client --host HOSTNAME.REGION.CSP.clickhouse.cloud \
--secure --port 9440 \
--user default \
--password <пароль> \
--query='INSERT INTO helloworld.my_first_table FORMAT CSV' < data.csv
```

2. Обратите внимание, что новые строки теперь появляются в таблице, если выполнять запрос из SQL интерфейса:

<br/>

<Image img={new_rows_from_csv} size="md" alt='Новые строки из CSV файла' />
<br/>

## Что дальше? {#whats-next}

- [Учебник](/tutorial.md) предлагает вставить 2 миллиона строк в таблицу и написать несколько аналитических запросов
- У нас есть список [примеров наборов данных](/getting-started/index.md) с инструкциями по их вставке
- Посмотрите наше 25-минутное видео о [Начале работы с ClickHouse](https://clickhouse.com/company/events/getting-started-with-clickhouse/)
- Если ваши данные поступают из внешнего источника, ознакомьтесь с нашей [коллекцией руководств по интеграции](/integrations/index.mdx) для подключения к очередям сообщений, базам данных, конвейерам и другим
- Если вы используете инструмент визуализации UI/BI, ознакомьтесь с [руководствами пользователя для подключения UI к ClickHouse](/integrations/data-visualization)
- Руководство пользователя по [первичным ключам](/guides/best-practices/sparse-primary-indexes.md) содержит все, что вам нужно знать о первичных ключах и их определении
