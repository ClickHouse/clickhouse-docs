---
sidebar_label: 'ClickPipes для Kafka'
description: 'Бесшовное подключение ваших источников данных Kafka к ClickHouse Cloud.'
slug: /integrations/clickpipes/kafka
sidebar_position: 1
title: 'Интеграция Kafka с ClickHouse Cloud'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';


# Интеграция Kafka с ClickHouse Cloud
## Предварительные условия {#prerequisite}
Вы ознакомились с [введением в ClickPipes](./index.md).

## Создание вашего первого ClickPipe Kafka {#creating-your-first-kafka-clickpipe}

1. Получите доступ к SQL Консоли вашего ClickHouse Cloud Service.

<Image img={cp_service} alt="Сервис ClickPipes" size="md" border/>


2. Выберите кнопку `Источники данных` в левом меню и нажмите "Настроить ClickPipe"

<Image img={cp_step0} alt="Выбор импортов" size="lg" border/>

3. Выберите ваш источник данных.

<Image img={cp_step1} alt="Выбор типа источника данных" size="lg" border/>

4. Заполните форму, указав имя вашего ClickPipe, описание (по желанию), ваши учетные данные и другие детали подключения.

<Image img={cp_step2} alt="Заполните детали подключения" size="lg" border/>

5. Настройте реестр схем. Действительная схема требуется для Avro потоков и является необязательной для JSON. Эта схема будет использоваться для парсинга [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent) или проверки сообщений JSON по выбранной теме.
- Сообщения Avro, которые не могут быть распознаны, или сообщения JSON, которые не проходят проверку, вызовут ошибку.
- "Корневая" ссылка реестра схем. Например, URL реестра схем Confluent Cloud — это просто HTTPS URL без пути, например `https://test-kk999.us-east-2.aws.confluent.cloud`. Если указан только корневой
путь, схема, используемая для определения имен и типов столбцов на шаге 4, будет определена по идентификатору, встроенному в выборочные сообщения Kafka.
- путь `/schemas/ids/[ID]` к документу схемы по числовому идентификатору схемы. Полный URL с использованием идентификатора схемы будет `https://registry.example.com/schemas/ids/1000`
- путь `/subjects/[subject_name]` к документу схемы по имени темы. Опционально, можно сослаться на конкретную версию, добавив `/versions/[version]` к URL (в противном случае ClickPipes
получит последнюю версию). Полный URL с использованием темы схемы будет `https://registry.example.com/subjects/events` или `https://registry/example.com/subjects/events/versions/4`

Обратите внимание, что во всех случаях ClickPipes автоматически извлечет обновленную или другую схему из реестра, если это указано идентификатором схемы, встроенным в сообщение. Если сообщение записано
без встроенного идентификатора схемы, то необходимо указать конкретный идентификатор схемы или тему, чтобы распарсить все сообщения.

6. Выберите вашу тему, и интерфейс пользователя отобразит пример документа из темы.

<Image img={cp_step3} alt="Установите формат и тему данных" size="lg" border/>

7. На следующем этапе вы можете выбрать, хотите ли вы загружать данные в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя своей таблицы, схему и настройки. Вы можете видеть в реальном времени предварительный просмотр ваших изменений в примерной таблице вверху.

<Image img={cp_step4a} alt="Установите таблицу, схему и настройки" size="lg" border/>

  Вы также можете настроить расширенные настройки, используя предоставленные элементы управления

<Image img={cp_step4a3} alt="Установите расширенные параметры" size="lg" border/>

8. В качестве альтернативы вы можете решить загружать ваши данные в существующую таблицу ClickHouse. В этом случае интерфейс пользователя позволит вам сопоставить поля из источника с полями ClickHouse в выбранной таблице назначения.

<Image img={cp_step4b} alt="Использовать существующую таблицу" size="lg" border/>

9. Наконец, вы можете настроить права доступа для внутреннего пользователя ClickPipes.

  **Права доступа:** ClickPipes создаст специализированного пользователя для записи данных в таблицу назначения. Вы можете выбрать роль для этого внутреннего пользователя, используя свою собственную роль или одну из предустановленных ролей:
    - `Полный доступ`: с полным доступом к кластеру. Это может быть полезно, если вы используете материализованное представление или словарь с таблицей назначения.
    - `Только таблица назначения`: с правами `INSERT` только в таблицу назначения.

<Image img={cp_step5} alt="Права доступа" size="lg" border/>

10. Нажав "Завершить настройку", система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt="Уведомление об успешном завершении" size="sm" border/>

<Image img={cp_remove} alt="Уведомление об удалении" size="lg" border/>

  Сводная таблица предоставляет элементы управления для отображения образцов данных из источника или таблицы назначения в ClickHouse

<Image img={cp_destination} alt="Просмотр назначения" size="lg" border/>

  А также элементы управления для удаления ClickPipe и отображения свода по задаче загрузки.

<Image img={cp_overview} alt="Просмотр обзора" size="lg" border/>

11. **Поздравляем!** вы успешно настроили свой первый ClickPipe. Если это потоковый ClickPipe, он будет непрерывно работать, загружая данные в реальном времени из вашего удаленного источника данных.

## Поддерживаемые источники данных {#supported-data-sources}

| Название             | Логотип | Тип      | Статус          | Описание                                                                                          |
|----------------------|---------|----------|-----------------|---------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>|Стриминг| Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Apache Kafka в ClickHouse Cloud.      |
| Confluent Cloud      |<Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>|Стриминг| Стабильный      | Разблокируйте объединенную мощь Confluent и ClickHouse Cloud через нашу прямую интеграцию.       |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Логотип Redpanda"/>|Стриминг| Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Redpanda в ClickHouse Cloud.         |
| AWS MSK              |<Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>|Стриминг| Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из AWS MSK в ClickHouse Cloud.          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>|Стриминг| Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Azure Event Hubs в ClickHouse Cloud. |
| WarpStream           |<Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>|Стриминг| Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из WarpStream в ClickHouse Cloud.       |

Больше соединителей будет добавлено в ClickPipes, вы можете узнать больше, [связавшись с нами](https://clickhouse.com/company/contact?loc=clickpipes).

## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаемые форматы:
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)


### Поддерживаемые типы данных {#supported-data-types}

В настоящее время в ClickPipes поддерживаются следующие типы данных ClickHouse:

- Основные численные типы - \[U\]Int8/16/32/64 и Float32/64
- Большие целочисленные типы - \[U\]Int128/256
- Десятичные типы
- Логический
- Строка
- FixedString
- Дата, Date32
- ДатаВремя, DateTime64 (только временные зоны UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы ClickHouse LowCardinality
- Map с ключами и значениями, использующими любой из вышеуказанных типов (включая Nullable)
- Tuple и Array с элементами, использующими любой из вышеуказанных типов (включая Nullable, только один уровень глубины)

### Avro {#avro}
#### Поддерживаемые типы данных Avro {#supported-avro-data-types}

ClickPipes поддерживает все примитивные и сложные типы Avro, а также все логические типы Avro, кроме `time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros` и `duration`. Типы `record` Avro преобразуются в Tuple, типы `array` - в Array, а `map` - в Map (только строковые ключи). В общем, преобразования, перечисленные [здесь](/interfaces/formats/Avro#data-types-matching), доступны. Мы рекомендуем использовать точное соответствие типов для числовых типов Avro, поскольку ClickPipes не проверяет на переполнение или потерю точности при преобразовании типов.

#### Nullable типы и объединения Avro {#nullable-types-and-avro-unions}

Nullable типы в Avro определяются с использованием схемы объединения `(T, null)` или `(null, T)`, где T - это основной тип Avro. Во время вывода схемы такие объединения будут сопоставлены с "Nullable" столбцом ClickHouse. Обратите внимание, что ClickHouse не поддерживает
`Nullable(Array)`, `Nullable(Map)` или `Nullable(Tuple)` типы. Null объединения Avro для этих типов будут сопоставлены с ненулевыми версиями (типы Avro Record сопоставляются с именованным Tuple ClickHouse). Avro "null" для этих типов будут вставлены как:
- Пустой массив для нулевого Avro массива
- Пустой Map для нулевого Avro Map
- Именованный Tuple со всеми значениями по умолчанию/нулями для нулевого Avro Record

ClickPipes в настоящее время не поддерживает схемы, которые содержат другие объединения Avro (в будущем это может измениться с повышением зрелости новых типов данных ClickHouse Variant и JSON). Если схема Avro содержит "ненулевое" объединение, ClickPipes сгенерирует ошибку при попытке рассчитать сопоставление между схемой Avro и типами столбцов Clickhouse.

#### Управление схемами Avro {#avro-schema-management}

ClickPipes динамически извлекает и применяет схему Avro из настроенного реестра схем с использованием идентификатора схемы, встроенного в каждое сообщение/событие. Обновления схемы обнаруживаются и обрабатываются автоматически.

В данный момент ClickPipes совместим только с реестрами схем, которые используют [API реестра схем Confluent](https://docs.confluent.io/platform/current/schema-registry/develop/api.html). В дополнение к Confluent Kafka и Cloud это включает реестры схем Redpanda, AWS MSK и Upstash. ClickPipes в настоящее время не совместим с реестром схем AWS Glue или реестром схем Azure (в ближайшее время).

Следующие правила применяются к сопоставлению между извлеченной схемой Avro и таблицей назначения ClickHouse:
- Если схема Avro содержит поле, не включенное в сопоставление с таблицей назначения ClickHouse, это поле игнорируется.
- Если схема Avro не содержит поля, определенного в сопоставлении с таблицей назначения ClickHouse, столбец ClickHouse будет заполнен "нулевым" значением, таким как 0 или пустая строка. Обратите внимание, что выражения [DEFAULT](/sql-reference/statements/create/table#default) в настоящее время не оцениваются для вставок ClickPipes (это временное ограничение, ожидающее обновления обработки по умолчанию сервера ClickHouse).
- Если поле схемы Avro и столбец ClickHouse несовместимы, вставки этой строки/сообщения потерпят неудачу, и ошибка будет записана в таблице ошибок ClickPipes. Обратите внимание, что поддерживается несколько неявных преобразований (например, между числовыми типами), но не все (например, поле Avro `record` не может быть вставлено в столбец `Int32` ClickHouse).

## Виртуальные столбцы Kafka {#kafka-virtual-columns}

Следующие виртуальные столбцы поддерживаются для совместимых с Kafka потоковых источников данных. При создании новой таблицы назначения виртуальные столбцы можно добавить, используя кнопку `Добавить столбец`.

| Название         | Описание                                      | Рекомендуемый тип данных |
|------------------|-----------------------------------------------|---------------------------|
| _key             | Ключ сообщения Kafka                          | String                    |
| _timestamp       | Временная метка Kafka (миллисекундная точность) | DateTime64(3)            |
| _partition       | Раздел Kafka                                  | Int32                     |
| _offset          | Смещение Kafka                                | Int64                     |
| _topic           | Тема Kafka                                    | String                    |
| _header_keys     | Параллельный массив ключей в заголовках записи | Array(String)             |
| _header_values   | Параллельный массив заголовков в заголовках записи | Array(String)             |
| _raw_message     | Полное сообщение Kafka                        | String                    |

Обратите внимание, что столбец _raw_message рекомендуется использовать только для данных JSON. Для случаев, когда требуется только строка JSON (например, использование функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для заполнения нижестоящего материализованного представления), может улучшить производительность ClickPipes удалить все "не виртуальные" столбцы.

## Ограничения {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) не поддерживается.

## Семантика доставки {#delivery-semantics}
ClickPipes для Kafka предоставляет семантику доставки `как минимум один раз` (это один из наиболее часто используемых подходов). Мы будем рады услышать ваши отзывы о семантике доставки [форма обратной связи](https://clickhouse.com/company/contact?loc=clickpipes). Если вам нужна семантика именно один раз, мы рекомендуем использовать наш официальный [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) приемник.

## Аутентификация {#authentication}
Для источников данных протокола Apache Kafka ClickPipes поддерживает аутентификацию [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) с TLS шифрованием, а также `SASL/SCRAM-SHA-256` и `SASL/SCRAM-SHA-512`. В зависимости от источника потоков (Redpanda, MSK и т.д.) будут включены все или некоторые из этих механизмов аутентификации в зависимости от совместимости. Если ваши потребности в аутентификации отличаются, пожалуйста, [сообщите нам](https://clickhouse.com/company/contact?loc=clickpipes).

### IAM {#iam}

:::info
Аутентификация IAM для ClickPipe MSK — это бета-функция.
:::

ClickPipes поддерживает следующую аутентификацию AWS MSK:

  - [Аутентификация SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html)
  - [Аутентификация учетных данных IAM или на основе ролей](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html)

При использовании IAM аутентификации для подключения к брокеру MSK, роль IAM должна иметь необходимые разрешения.
Ниже приведен пример необходимых IAM политик для API Apache Kafka для MSK:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:Connect"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:cluster/clickpipes-testing-brokers/b194d5ae-5013-4b5b-ad27-3ca9f56299c9-10"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:DescribeTopic",
                "kafka-cluster:ReadData"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:topic/clickpipes-testing-brokers/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:AlterGroup",
                "kafka-cluster:DescribeGroup"
            ],
            "Resource": [
                "arn:aws:kafka:us-east-1:12345678912:group/clickpipes-testing-brokers/*"
            ]
        }
    ]
}
```

#### Настройка доверительных отношений {#configuring-a-trusted-relationship}

Если вы аутентифицируетесь в MSK с помощью ARN роли IAM, вам нужно будет добавить доверительные отношения между вашим экземпляром ClickHouse Cloud, чтобы роль могла быть принята.

:::note
Доступ на основе ролей работает только для экземпляров ClickHouse Cloud, развернутых на AWS.
:::

```json
{
    "Version": "2012-10-17",
    "Statement": [
        ...
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::12345678912:role/CH-S3-your-clickhouse-cloud-role"
            },
            "Action": "sts:AssumeRole"
        },
    ]
}
```


### Пользовательские сертификаты {#custom-certificates}
ClickPipes для Kafka поддерживает загрузку пользовательских сертификатов для брокеров Kafka с SASL и общим SSL/TLS сертификатом. Вы можете загрузить свой сертификат в разделе SSL Certificate настройки ClickPipe.
:::note
Обратите внимание, что хотя мы поддерживаем загрузку единственного SSL сертификата вместе с SASL для Kafka, SSL с Mutual TLS (mTLS) в настоящее время не поддерживается.
:::

## Производительность {#performance}

### Пакетирование {#batching}
ClickPipes вставляет данные в ClickHouse пакетами. Это делается для избежания создания слишком многих частей в базе данных, что может привести к проблемам с производительностью в кластере.

Пакеты вставляются, когда выполнено одно из следующих условий:
- Размер пакета достиг максимального размера (100,000 строк или 20MB)
- Пакет открыт максимальное время (5 секунд)

### Задержка {#latency}

Задержка (определяемая как время между производством сообщения Kafka и его доступностью в ClickHouse) будет зависеть от множества факторов (например, задержка брокера, задержка сети, размер/формат сообщения). [Пакетирование](#batching), описанное в разделе выше, также повлияет на задержку. Мы всегда рекомендуем тестировать ваш конкретный случай использования с типичными нагрузками, чтобы определить ожидаемую задержку.

ClickPipes не дает никаких гарантий по поводу задержки. Если у вас есть конкретные требования к низкой задержке, пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes).

### Масштабирование {#scaling}

ClickPipes для Kafka разработан для горизонтального масштабирования. По умолчанию мы создаем группу потребителей с одним потребителем.
Это можно изменить с помощью элементов управления масштабированием в представлении деталей ClickPipe.

ClickPipes обеспечивает высокую доступность благодаря архитектуре, распределенной по зонам доступности.
Это требует масштабирования хотя бы до двух потребителей.

Независимо от числа работающих потребителей, отказоустойчивость предусмотрена по умолчанию.
Если потребитель или его основная инфраструктура выходят из строя,
ClickPipe автоматически перезапустит потребителя и продолжит обработку сообщений.

## ЧаВо {#faq}

### Общие вопросы {#general}

- **Как работает ClickPipes для Kafka?**

  ClickPipes использует специализированную архитектуру, которая работает с API потребителей Kafka, чтобы читать данные из указанной темы и затем вставлять данные в таблицу ClickHouse в конкретном ClickHouse Cloud сервисе.

- **В чем разница между ClickPipes и движком таблиц ClickHouse Kafka?**

  Движок таблиц Kafka - это основная возможность ClickHouse, которая реализует "модель вытягивания", при которой сервер ClickHouse сам подключается к Kafka, вытягивает события, а затем записывает их локально.

  ClickPipes - это отдельный облачный сервис, который работает независимо от сервиса ClickHouse, он подключается к Kafka (или другим источникам данных) и отправляет события в связанный с ними ClickHouse Cloud сервис. Эта раздельная архитектура предоставляет превосходную операционную гибкость, четкое разделение обязанностей, масштабируемую загрузку, надежное управление сбоями, расширяемость и многое другое.

- **Каковы требования к использованию ClickPipes для Kafka?**

  Чтобы использовать ClickPipes для Kafka, вам понадобится работающий брокер Kafka и ClickHouse Cloud сервис с включенными ClickPipes. Вам также нужно будет убедиться, что ClickHouse Cloud может получить доступ к вашему брокеру Kafka. Это можно сделать, разрешив удаленное соединение на стороне Kafka, внесением [IP адресов исходящего трафика ClickHouse Cloud](/manage/security/cloud-endpoints-api) в белый список в вашей настройке Kafka.

- **Поддерживает ли ClickPipes для Kafka AWS PrivateLink?**

  AWS PrivateLink поддерживается. Пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes) для получения дополнительной информации.

- **Могу ли я использовать ClickPipes для Kafka, чтобы записывать данные в тему Kafka?**

  Нет, ClickPipes для Kafka предназначен для чтения данных из тем Kafka, а не для записи данных в них. Чтобы записать данные в тему Kafka, вам нужно будет использовать специализированный производитель Kafka.

- **Поддерживает ли ClickPipes несколько брокеров?**

  Да, если брокеры входят в один и тот же кворум, их можно настроить вместе, разделив запятыми `,`.

### Upstash {#upstash}

- **Поддерживает ли ClickPipes Upstash?**

  Да. Продукт Upstash Kafka вошел в период снятия с поддержки 11 сентября 2024 года на 6 месяцев. Существующие клиенты могут продолжать использовать ClickPipes с их существующими брокерами Upstash Kafka, используя универсальный шаблон Kafka в интерфейсе пользователя ClickPipes. Существующие ClickPipes Upstash Kafka не затронуты до уведомления о снятии с поддержки. Когда период снятия с поддержки закончится, ClickPipe перестанет функционировать.

- **Поддерживает ли ClickPipes реестр схем Upstash?**

  Нет. ClickPipes не совместим с реестром схем Upstash Kafka.

- **Поддерживает ли ClickPipes рабочий процесс Upstash QStash?**

  Нет. Если в рабочем процессе QStash не будет введен совместимый с Kafka интерфейс, он не будет работать с ClickPipes Kafka.

### Azure EventHubs {#azure-eventhubs}

- **Работает ли ClickPipe Azure Event Hubs без интерфейса Kafka?**

  Нет. ClickPipes требует, чтобы Azure Event Hubs был включен с поддержкой интерфейса Kafka. Протокол Kafka поддерживается только для их стандартного, премиум и специализированного уровней акций.

- **Работает ли реестр схем Azure с ClickPipes?**

  Нет. ClickPipes в настоящее время не совместим с реестром событий Event Hubs.

- **Какие разрешения нужны моей политике для потребления из Azure Event Hubs?**

  Для перечисления тем и потребления событий, политика общего доступа, предоставленная ClickPipes, по меньшей мере, будет требовать претензии 'Listen'.

- **Почему мои Event Hubs не возвращают никаких данных?**

 Если ваш экземпляр ClickHouse находится в другом регионе или континенте по сравнению с вашим развертыванием Event Hubs, вы можете столкнуться с тайм-аутами при подключении ваших ClickPipes и повышенной задержкой при потреблении данных из Event Hub. Рекомендуется размещать развертывание ClickHouse Cloud и развертывание Azure Event Hubs в облачных регионах, находящихся близко друг к другу, чтобы избежать негативного влияния на производительность.

- **Должен ли я включать номер порта для Azure Event Hubs?**

  Да. ClickPipes ожидает, что вы включите номер вашего порта для интерфейса Kafka, который должен быть `:9093`.

- **Актуальны ли IP-адреса ClickPipes для Azure Event Hubs?**

  Да. Если вы ограничиваете трафик к вашему экземпляру Event Hubs, пожалуйста, добавьте [документированные статические NAT IP-адреса](./index.md#list-of-static-ips).

- **Является ли строка соединения для Event Hub, или она для пространства имен Event Hub?**

  Оба варианта будут работать, однако мы рекомендуем использовать политику общего доступа на уровне пространства имен, чтобы получать образцы из нескольких Event Hubs.

