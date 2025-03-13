---
sidebar_position: 1
slug: /cloud/get-started/cloud-quick-start
sidebar_label: Быстрый старт Cloud
keywords: [clickhouse, установка, начало работы, быстрый старт]
pagination_next: cloud/get-started/sql-console
---
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


# Быстрый старт ClickHouse Cloud

Самый быстрый и простой способ начать работу с ClickHouse - создать новую
услугу в [ClickHouse Cloud](https://console.clickhouse.cloud).

## 1. Создать службу ClickHouse {#1-create-a-clickhouse-service}

Чтобы создать бесплатную службу ClickHouse в [ClickHouse Cloud](https://console.clickhouse.cloud), выполните следующие шаги:

  - Создайте аккаунт на [странице регистрации](https://console.clickhouse.cloud/signUp)
  - Вы можете выбрать регистрацию с помощью электронной почты или через Google SSO, Microsoft SSO, AWS Marketplace, Google Cloud или Microsoft Azure
  - Если вы зарегистрировались с помощью электронной почты и пароля, не забудьте подтвердить свой адрес электронной почты в течение следующих 24 часов по ссылке, которую вы получили на почту
  - Войдите, используя имя пользователя и пароль, который вы только что создали

<div class="eighty-percent">
    <img src={signup_page} class="image" alt="Выбор плана" />
</div>
<br/>

После входа в систему ClickHouse Cloud запускает мастер адаптации, который проведет вас через процесс создания новой службы ClickHouse. Сначала будет предложено [выбрать план](/cloud/manage/cloud-tiers):

<div class="eighty-percent">
    <img src={select_plan} class="image" alt="Выбор плана" />
</div>
<br/>

:::tip
Мы рекомендуем уровень Scale для большинства нагрузок.
Дополнительные сведения о уровнях можно найти [здесь](/cloud/manage/cloud-tiers)
:::

Выбор плана требует от вас указать желаемый регион, в котором будет развернута ваша первая служба.
Точные доступные опции будут зависеть от выбранного уровня.
На следующем шаге мы предполагаем, что пользователь выбрал рекомендуемый уровень Scale.

Выберите желаемый регион для развертывания службы и дайте вашей новой службе имя:

<div class="eighty-percent">
    <img src={createservice1} class="image" alt="Новая служба ClickHouse" />
</div>
<br/>

По умолчанию уровень scale создаст 3 реплики, каждая с 4 VCPU и 16 GiB RAM. [Вертикальное автоскалирование](/manage/scaling#vertical-auto-scaling) будет включено по умолчанию на уровне Scale.

Пользователи могут настраивать ресурсы службы при необходимости, указывая минимальный и максимальный размер для реплик, между которыми будет происходить масштабирование. Когда вы будете готовы, выберите `Create service`.

<div class="eighty-percent">
    <img src={scaling_limits} class="image" alt="Ограничения масштабирования" />
</div>
<br/>

Поздравляем! Ваша служба ClickHouse Cloud запущена, и процесс адаптации завершен. Продолжайте читать для получения информации о том, как начать загружать и выполнять запросы к вашим данным.

## 2. Подключение к ClickHouse {#2-connect-to-clickhouse}
Существует 2 способа подключения к ClickHouse:
  - Подключение с помощью нашего веб-консоли SQL
  - Подключение с помощью вашего приложения

### Подключение с помощью консоли SQL {#connect-using-sql-console}

Для быстрого старта ClickHouse предоставляет веб-консоль SQL, в которую вас перенаправят по завершении адаптации.

<div class="eighty-percent">
    <img src={createservice8} class="image" alt="Консоль SQL" />
</div>
<br/>


Создайте вкладку запроса и введите простой запрос, чтобы проверить, что ваше соединение работает:

<br/>
```sql
SHOW databases
```

Вы должны увидеть 4 базы данных в списке, а также любые, которые вы могли добавить.

<div class="eighty-percent">
    <img src={show_databases} class="image" alt="Консоль SQL" />
</div>
<br/>


Вот и все - вы готовы начать использовать вашу новую службу ClickHouse!

### Подключение с помощью вашего приложения {#connect-with-your-app}

Нажмите кнопку подключения в навигационном меню. Откроется модальное окно с предоставлением учетных данных для вашей службы и набором инструкций о том, как подключиться с помощью вашего интерфейса или клиентских языков.

<div class="eighty-percent">
    <img src={service_connect} class="image" alt="Подключение службы" />
</div>
<br/>

Если вы не видите ваш клиент языка, возможно, вам стоит проверить наш список [Интеграций](/integrations).

## 3. Добавление данных {#3-add-data}

ClickHouse лучше с данными! Существует несколько способов добавления данных, и большинство из них доступны на странице Источники данных, к которой можно получить доступ в навигационном меню.

<div class="eighty-percent">
    <img src={data_sources} class="image" alt="Источники данных" />
</div>
<br/>

Вы можете загрузить данные следующими способами:
  - Настроить ClickPipe для начала загрузки данных из источников, таких как S3, Postgres, Kafka, GCS
  - Использовать консоль SQL
  - Использовать клиент ClickHouse
  - Загрузить файл - поддерживаемые форматы включают JSON, CSV и TSV
  - Загрузить данные по URL файла

### ClickPipes {#clickpipes}

[ClickPipes](http://clickhouse.com/docs/integrations/clickpipes) - это управляемая интеграционная платформа, которая делает загрузку данных из разнообразных источников такой же простой, как нажатие нескольких кнопок. Разработанная для самых требовательных нагрузок, надежная и масштабируемая архитектура ClickPipes обеспечивает постоянную производительность и надежность. ClickPipes можно использовать для долгосрочных потоковых нужд или одноразовой загрузки данных.

<div class="eighty-percent">
    <img src={select_data_source} class="image" alt="Выбор источника данных" />
</div>
<br/>

### Добавление данных с помощью консоли SQL {#add-data-using-the-sql-console}

Подобно большинству систем управления базами данных, ClickHouse логически группирует таблицы в **базы данных**. Используйте команду [`CREATE DATABASE`](../../sql-reference/statements/create/database.md) для создания новой базы данных в ClickHouse:

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

Запустите следующую команду, чтобы создать таблицу с именем `my_first_table` в базе данных `helloworld`:

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

В приведенном выше примере `my_first_table` - это таблица [`MergeTree`](../../engines/table-engines/mergetree-family/mergetree.md) с четырьмя колонками:

  - `user_id`:  32-битное беззнаковое целое число ([UInt32](../../sql-reference/data-types/int-uint.md))
  - `message`: тип данных [String](../../sql-reference/data-types/string.md), который заменяет такие типы, как `VARCHAR`, `BLOB`, `CLOB` и другие из других систем управления базами данных
  - `timestamp`: значение [DateTime](../../sql-reference/data-types/datetime.md), которое представляет момент времени
  - `metric`: 32-битное число с плавающей запятой ([Float32](../../sql-reference/data-types/float.md))

:::note Двигатели таблиц
Двигатели таблиц определяют:
  - Как и где хранятся данные
  - Какие запросы поддерживаются
  - Будет ли данные реплицированы
<br/>
Существует множество двигателей таблиц на выбор, но для простой таблицы на сервере ClickHouse с одним узлом [`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) является вашим вероятным выбором.
:::

#### Краткое введение в первичные ключи {#a-brief-intro-to-primary-keys}

Перед тем как продолжить, важно понять, как работают первичные ключи в ClickHouse (реализация
первичных ключей может показаться неожиданной!):

  - первичные ключи в ClickHouse **_не уникальны_** для каждой строки в таблице

Первичный ключ таблицы ClickHouse определяет, как данные сортируются при записи на диск. Каждые 8,192 строки или 10MB
данных (именуемых **гранулярностью индекса**) создают запись в файле индекса первичного ключа. Эта концепция гранулярности
создает **разреженный индекс**, который может легко помещаться в памяти, и гранулы представляют собой полосу наименьшего объема
данных колонок, обрабатываемых во время запросов `SELECT`.

Первичный ключ можно определить с помощью параметра `PRIMARY KEY`. Если вы определяете таблицу без указанного `PRIMARY KEY`,
то ключом становится кортеж, указанный в операторе `ORDER BY`. Если вы укажете и `PRIMARY KEY`, и `ORDER BY`, первичный ключ должен быть подмножеством порядка сортировки.

Первичный ключ также является ключом сортировки, представляющим собой кортеж из `(user_id, timestamp)`. Таким образом, данные, хранящиеся в каждом
файле колонки, будут отсортированы по `user_id`, затем `timestamp`.

Для глубокого погружения в ключевые концепции ClickHouse см. раздел ["Ключевые концепции"](../../managing-data/core-concepts/index.md).

#### Вставка данных в вашу таблицу {#insert-data-into-your-table}


Вы можете использовать знакомую команду [`INSERT INTO TABLE`](../../sql-reference/statements/insert-into.md) в ClickHouse, но важно понимать, что каждое вставка в таблицу [`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) создает **часть** в хранилище.

:::tip Рекомендации ClickHouse
Вставляйте большое количество строк за один раз - десятки тысяч или даже миллионы
строк за раз. Не волнуйтесь - ClickHouse легко справляется с таким объемом - и это поможет вам [сэкономить деньги](/cloud/bestpractices/bulkinserts.md), отправляя меньше запросов записи в вашу службу.
:::

<br/>

Даже для простого примера давайте вставим более одной строки за раз:

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

:::note
Обратите внимание, что колонка `timestamp` заполняется с использованием различных функций [**Date**](../../sql-reference/data-types/date.md) и [**DateTime**](../../sql-reference/data-types/datetime.md). В ClickHouse есть сотни полезных функций, которые вы можете [просмотреть в разделе **Функции**](/sql-reference/functions/).
:::

Давайте проверим, что все сработало:

```sql
SELECT * FROM helloworld.my_first_table
```

### Добавление данных с помощью клиента ClickHouse {#add-data-using-the-clickhouse-client}

Вы также можете подключиться к вашей службе ClickHouse Cloud, используя командный инструмент под названием [**клиент clickhouse**](/interfaces/cli). Нажмите `Connect` в левом меню, чтобы получить эти данные. В диалоговом окне выберите `Native` из выпадающего меню:

<div class="eighty-percent">
    <img src={client_details} class="image" alt="данные подключения клиента clickhouse" />
</div>
<br/>

1. Установите [ClickHouse](/interfaces/cli).

2. Запустите команду, заменив ваше имя хоста, имя пользователя и пароль:

```bash
./clickhouse client --host HOSTNAME.REGION.CSP.clickhouse.cloud \
--secure --port 9440 \
--user default \
--password <password>
```
Если вы увидите приглашение с улыбкой, вы готовы выполнять запросы!
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

Обратите внимание, что ответ возвращается в удобном формате таблицы:

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Вставить много строк за один раз                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Сортируйте свои данные на основе часто используемых запросов │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Привет, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Гранулы - это наименьшие части считываемых данных      │ 2022-03-22 14:04:14 │ 3.14159 │
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
В приведенном выше запросе вывод возвращается в табулированном виде:
```response
ID запроса: 3604df1c-acfd-4117-9c56-f86c69721121

102 Вставить много строк за один раз	2022-03-21 00:00:00	1.41421
102 Сортируйте свои данные на основе часто используемых запросов	2022-03-22 00:00:00	2.718
101 Привет, ClickHouse!	2022-03-22 14:04:09	-1
101 Гранулы - это наименьшие части считываемых данных	2022-03-22 14:04:14	3.14159

4 строки в наборе. Затраченное время: 0.005 сек.
```

5. Чтобы выйти из `клиента clickhouse`, введите команду **exit**:

<br/>

```bash
exit
```

### Загрузка файла {#upload-a-file}

Распространенной задачей при начале работы с базой данных является вставка данных, которые у вас уже есть в файлах. У нас есть некоторые
образцы данных онлайн, которые вы можете вставить, представляющие clickstream данные - они включают идентификатор пользователя, URL-адрес, который был посещен, и
время события.

Предположим, у нас есть следующий текст в CSV файле с именем `data.csv`:

```bash title="data.csv"
102,Это данные в файле,2022-02-22 10:43:28,123.45
101,Это запятая-разделенная,2022-02-23 00:00:00,456.78
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

2. Обратите внимание, что новые строки теперь появляются в таблице при запросе из консоли SQL:

<br/>

<div class="eighty-percent">
    <img src={new_rows_from_csv} class="image" alt="Новые строки из CSV файла" />
</div>
<br/>

## Что дальше? {#whats-next}

- [Учебник](/tutorial.md) предлагает вставить 2 миллиона строк в таблицу и написать некоторые аналитические запросы
- У нас есть список [примеров наборов данных](/getting-started/index.md) с инструкциями по их вставке
- Посмотрите наше 25-минутное видео о [Начале работы с ClickHouse](https://clickhouse.com/company/events/getting-started-with-clickhouse/)
- Если ваши данные поступают из внешнего источника, ознакомьтесь с нашей [коллекцией руководств по интеграции](/integrations/index.mdx) для подключения к очередям сообщений, базам данных, конвейерам и другим
- Если вы используете инструмент визуализации UI/BI, посмотрите [руководства пользователя для подключения UI к ClickHouse](/integrations/data-visualization)
- Руководство пользователя о [первичных ключах](/guides/best-practices/sparse-primary-indexes.md) - это всё, что вам нужно знать о первичных ключах и как их определять
