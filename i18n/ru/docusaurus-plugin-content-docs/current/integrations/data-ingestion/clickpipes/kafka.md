---
sidebar_label: 'ClickPipes для Kafka'
description: 'Бесшовно подключайте свои источники данных Kafka к ClickHouse Cloud.'
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
## Предварительные требования {#prerequisite}
Вы ознакомились с [введением в ClickPipes](./index.md).

## Создание вашего первого Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

1. Получите доступ к SQL Console для вашего ClickHouse Cloud Service.

<Image img={cp_service} alt="Служба ClickPipes" size="md" border/>


2. Выберите кнопку `Data Sources` в левом меню и нажмите на "Настроить ClickPipe"

<Image img={cp_step0} alt="Выбор импорта" size="lg" border/>

3. Выберите ваш источник данных.

<Image img={cp_step1} alt="Выбор типа источника данных" size="lg" border/>

4. Заполните форму, указав название ClickPipe, описание (необязательно), ваши учетные данные и другие детали подключения.

<Image img={cp_step2} alt="Заполнение деталей подключения" size="lg" border/>

5. Настройте регистр схем. Валидная схема требуется для потоков Avro и является необязательной для JSON. Эта схема будет использоваться для разбора [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent) или проверки сообщений JSON на выбранной теме.
- Avro сообщения, которые не могут быть разобраны, или JSON сообщения, которые не прошли проверку, вызовут ошибку.
- "корневой" путь регистра схемы. Например, URL для регистра схем Confluent Cloud - это просто HTTPS URL без пути, как `https://test-kk999.us-east-2.aws.confluent.cloud`. Если указан только корневой путь, схема, используемая для определения названий и типов колонок на шаге 4, будет определяться id, встроенным в образцы сообщений Kafka.
- путь `/schemas/ids/[ID]` к документу схемы по числовому id схемы. Полный URL с использованием id схемы: `https://registry.example.com/schemas/ids/1000`
- путь `/subjects/[subject_name]` к документу схемы по названию темы. Необязательно можно сослаться на конкретную версию, добавив `/versions/[version]` к URL (в противном случае ClickPipes получит последнюю версию). Полный URL с использованием темы схемы: `https://registry.example.com/subjects/events` или `https://registry/example.com/subjects/events/versions/4`

Обратите внимание, что во всех случаях ClickPipes автоматически получит обновленную или другую схему из регистра, если это указано по id схемы, встроенному в сообщение. Если сообщение записано без встроенного id схемы, тогда необходимо указать конкретный id схемы или тему для разбора всех сообщений.

6. Выберите вашу тему, и пользовательский интерфейс покажет документ образца из темы.

<Image img={cp_step3} alt="Установить формат данных и тему" size="lg" border/>

7. На следующем шаге вы можете выбрать, хотите ли вы загрузить данные в новую таблицу ClickHouse или повторно использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя вашей таблицы, схему и настройки. Вы можете видеть реальный просмотр ваших изменений в образцовой таблице вверху.

<Image img={cp_step4a} alt="Установить таблицу, схему и настройки" size="lg" border/>

  Вы также можете настроить расширенные параметры, используя предоставленные элементы управления

<Image img={cp_step4a3} alt="Установить расширенные параметры" size="lg" border/>

8. В качестве альтернативы вы можете решить загрузить ваши данные в существующую таблицу ClickHouse. В этом случае пользовательский интерфейс позволит вам сопоставить поля из источника с полями ClickHouse в выбранной таблице назначения.

<Image img={cp_step4b} alt="Использовать существующую таблицу" size="lg" border/>

9. Наконец, вы можете настроить разрешения для внутреннего пользователя ClickPipes.

  **Разрешения:** ClickPipes создаст отдельного пользователя для записи данных в таблицу назначения. Вы можете выбрать роль для этого внутреннего пользователя, используя пользовательскую роль или одну из предопределенных ролей:
    - `Полный доступ`: с полным доступом к кластеру. Это может быть полезно, если вы используете материализованное представление или словарь с таблицей назначения.
    - `Только таблица назначения`: с разрешениями `INSERT` только для таблицы назначения.

<Image img={cp_step5} alt="Разрешения" size="lg" border/>

10. Нажав на "Завершить настройку", система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt="Уведомление об успешном" size="sm" border/>

<Image img={cp_remove} alt="Уведомление об удалении" size="lg" border/>

  Сводная таблица предоставляет элементы управления для отображения образца данных из источника или таблицы назначения в ClickHouse

<Image img={cp_destination} alt="Просмотр назначения" size="lg" border/>

  А также элементы управления для удаления ClickPipe и отображения сводки задания по загрузке.

<Image img={cp_overview} alt="Просмотр обзора" size="lg" border/>

11. **Поздравляем!** Вы успешно настроили свой первый ClickPipe. Если это потоковый ClickPipe, он будет работать непрерывно, загружая данные в реальном времени из вашего удаленного источника данных.

## Поддерживаемые источники данных {#supported-data-sources}

| Название             | Логотип| Тип       | Статус          | Описание                                                                                          |
|----------------------|--------|-----------|-----------------|--------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>| Потоковые   | Стабильно      | Настройте ClickPipes и начните загружать потоковые данные из Apache Kafka в ClickHouse Cloud.   |
| Confluent Cloud      |<Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>| Потоковые   | Стабильно      | Используйте комбинированные возможности Confluent и ClickHouse Cloud через нашу прямую интеграцию. |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Логотип Redpanda"/>| Потоковые   | Стабильно      | Настройте ClickPipes и начните загружать потоковые данные из Redpanda в ClickHouse Cloud.        |
| AWS MSK              |<Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>| Потоковые   | Стабильно      | Настройте ClickPipes и начните загружать потоковые данные из AWS MSK в ClickHouse Cloud.         |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>| Потоковые   | Стабильно      | Настройте ClickPipes и начните загружать потоковые данные из Azure Event Hubs в ClickHouse Cloud. |
| WarpStream           |<Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>| Потоковые   | Стабильно      | Настройте ClickPipes и начните загружать потоковые данные из WarpStream в ClickHouse Cloud.       |

Более  соединителей будет добавлено в ClickPipes, вы можете узнать больше, связавшись с нами [по этой ссылке](https://clickhouse.com/company/contact?loc=clickpipes).

## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаемые форматы:
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)


### Поддерживаемые типы данных {#supported-data-types}

Следующие типы данных ClickHouse в настоящее время поддерживаются в ClickPipes:

- Базовые числовые типы - \[U\]Int8/16/32/64 и Float32/64
- Большие целые типы - \[U\]Int128/256
- Десятичные типы
- Логический тип
- Строка
- FixedString
- Дата, Date32
- ДатаВремя, DateTime64 (только временные зоны UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы ClickHouse LowCardinality
- Карта с ключами и значениями, использующими любые из вышеперечисленных типов (включая Nullables)
- Кортеж и массив с элементами, использующими любые из вышеперечисленных типов (включая Nullables, только один уровень глубины)

### Avro {#avro}
#### Поддерживаемые типы данных Avro {#supported-avro-data-types}

ClickPipes поддерживает все примитивные и сложные типы Avro, а также все логические типы Avro, за исключением `time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros` и `duration`. Типы `record` Avro преобразуются в Tuple, типы `array` в Array, а `map` в Map (только строковые ключи). В общем, преобразования, перечисленные [здесь](/interfaces/formats/Avro#data-types-matching), доступны. Мы рекомендуем использовать точное соответствие типов для числовых типов Avro, так как ClickPipes не проверяет переполнение или потерю точности при преобразовании типов.

#### Nullable типы и объединения Avro {#nullable-types-and-avro-unions}

Nullable типы в Avro определяются с использованием схемы Union, состоящей из `(T, null)` или `(null, T)`, где T - базовый тип Avro. При выводе схемы такие объединения будут сопоставляться с колонкой "Nullable" в ClickHouse. Обратите внимание, что ClickHouse не поддерживает
`Nullable(Array)`, `Nullable(Map)` или `Nullable(Tuple)`. Avro null объединения для этих типов будут сопоставлены с ненулевыми версиями (типы Avro Record сопоставляются с именованным Tuple в ClickHouse). Avro "null" для этих типов будет вставлен как:
- Пустой массив для пустого Avro массива
- Пустая карта для пустой Avro Map
- Именованный кортеж со всеми значениями по умолчанию/нулевыми для пустого Avro Record

ClickPipes в настоящее время не поддерживает схемы, содержащие другие объединения Avro (это может измениться в будущем с развитием новых типов Variant и JSON в ClickHouse). Если схема Avro содержит "не-null" объединение, ClickPipes вызовет ошибку при попытке рассчитать сопоставление между схемой Avro и типами колонок Clickhouse.

#### Управление схемой Avro {#avro-schema-management}

ClickPipes динамически получает и применяет схему Avro из настроенного регистра схем, используя id схемы, встроенный в каждое сообщение/событие. Обновления схемы обнаруживаются и обрабатываются автоматически.

На данный момент ClickPipes совместим только с регистрами схем, которые используют [API регистра схем Confluent](https://docs.confluent.io/platform/current/schema-registry/develop/api.html). В дополнение к Confluent Kafka и Cloud, это включает регистры схем Redpanda, AWS MSK и Upstash. ClickPipes в настоящее время не совместим с регистром схем AWS Glue или Azure Schema Registry (скоро выйдет).

Следующие правила применяются к сопоставлению между полученной схемой Avro и целевой таблицей ClickHouse:
- Если схема Avro содержит поле, которое не включено в сопоставление ClickHouse, это поле игнорируется.
- Если в схеме Avro отсутствует поле, определенное в сопоставлении ClickHouse, колонка ClickHouse будет заполнена значением "нулевой", таким как 0 или пустая строка. Обратите внимание, что [DEFAULT](/sql-reference/statements/create/table#default) выражения в настоящее время не оцениваются для вставок ClickPipes (это временное ограничение в ожидании обновления серверного процесса по умолчанию ClickHouse).
- Если поле схемы Avro и колонка ClickHouse несовместимы, вставки этой строки/сообщения будут терпеть неудачу, и ошибка будет записана в таблице ошибок ClickPipes. Обратите внимание, что несколько неявных преобразований поддерживаются (например, между числовыми типами), но не все (например, поле Avro `record` не может быть вставлено в колонку `Int32` ClickHouse).

## Виртуальные колонки Kafka {#kafka-virtual-columns}

Следующие виртуальные колонки поддерживаются для совместимых с Kafka потоковых источников данных. При создании новой целевой таблицы виртуальные колонки могут быть добавлены с помощью кнопки `Add Column`.

| Название         | Описание                                  | Рекомендуемый тип данных  |
|------------------|-------------------------------------------|---------------------------|
| _key             | Ключ сообщения Kafka                      | String                    |
| _timestamp       | Временная метка Kafka (миллисекундная точность)| DateTime64(3)         |
| _partition       | Партиция Kafka                           | Int32                     |
| _offset          | Смещение Kafka                           | Int64                     |
| _topic           | Тема Kafka                               | String                    |
| _header_keys     | Параллельный массив ключей в заголовках записи    | Array(String)         |
| _header_values   | Параллельный массив заголовков в заголовках записи| Array(String)         |
| _raw_message     | Полное сообщение Kafka                   | String                    |

Обратите внимание, что колонка _raw_message рекомендуется только для данных JSON. Для случаев, когда требуется только строка JSON (например, при использовании ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) функций для заполнения последующего материализованного представления), может повысить производительность ClickPipes удаление всех "не-виртуальных" колонок.

## Ограничения {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) не поддерживается.

## Семантика доставки {#delivery-semantics}
ClickPipes для Kafka предоставляет семантику доставки `at-least-once` (как один из наиболее распространенных подходов). Мы будем рады услышать ваш отзыв о семантике доставки [по этой ссылке](https://clickhouse.com/company/contact?loc=clickpipes). Если вам нужна семантика exactly-once, мы рекомендуем использовать наш официальный [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) приемник.

## Аутентификация {#authentication}
Для источников данных протокола Apache Kafka ClickPipes поддерживает аутентификацию [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) с шифрованием TLS, а также `SASL/SCRAM-SHA-256` и `SASL/SCRAM-SHA-512`. В зависимости от потокового источника (Redpanda, MSK и т.д.) будут включены все или подмножество этих механизмов аутентификации в зависимости от совместимости. Если у вас есть другие требования к аутентификации, пожалуйста, [сообщите нам](https://clickhouse.com/company/contact?loc=clickpipes).

### IAM {#iam}

:::info
Аутентификация IAM для ClickPipe MSK является бета-функцией.
:::

ClickPipes поддерживает следующую аутентификацию AWS MSK

  - аутентификация [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html)
  - аутентификация [IAM Credentials или основанная на ролях доступ](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html)

При использовании аутентификации IAM для подключения к брокеру MSK роль IAM должна иметь необходимые разрешения.
Вот пример необходимой IAM политики для API Apache Kafka для MSK:

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

Если вы аутентифицируетесь в MSK с помощью ARN роли IAM, вам необходимо добавить доверительные отношения между вашим экземпляром ClickHouse Cloud, чтобы роль могла быть присвоена.

:::note
Доступ на основе ролей работает только для экземпляров ClickHouse Cloud, развернутых в AWS.
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
Обратите внимание, что хотя мы поддерживаем загрузку одного SSL сертификата вместе с SASL для Kafka, SSL с взаимной TLS (mTLS) в настоящее время не поддерживается.
:::

## Производительность {#performance}

### Пакетирование {#batching}
ClickPipes вставляет данные в ClickHouse пакетами. Это делается для предотвращения создания слишком большого количества частей в базе данных, что может привести к проблемам с производительностью в кластере.

Пакеты вставляются, когда выполнено одно из следующих условий:
- Размер пакета достиг максимального размера (100000 строк или 20 МБ)
- Пакет открыт максимум в течение времени (5 секунд)

### Задержка {#latency}

Задержка (определяемая как время между производством сообщения Kafka и временем, когда сообщение становится доступным в ClickHouse) будет зависеть от множества факторов (например, задержка брокера, задержка сети, размер/формат сообщения). Пакетирование, описанное в разделе выше, также повлияет на задержку. Мы всегда рекомендуем тестировать ваш конкретный случай использования с типичными нагрузками, чтобы определить ожидаемую задержку.

ClickPipes не предоставляет никаких гарантий по поводу задержки. Если у вас есть специфические требования к низкой задержке, пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes).

### Масштабируемость {#scaling}

ClickPipes для Kafka разработан для горизонтального масштабирования. По умолчанию мы создаем группу потребителей с одним потребителем.
Это можно изменить с помощью элементов управления масштабированием в представлении деталей ClickPipe.

ClickPipes обеспечивает высокую доступность с архитектурой, распределенной по зонам доступности.
Это требует масштабирования как минимум до двух потребителей.

Независимо от количества работающих потребителей, отказоустойчивость доступна по умолчанию.
Если потребитель или его инфраструктура не справляются,
ClickPipe автоматически перезапустит потребителя и продолжит обработку сообщений.

## ЧаВо {#faq}

### Общие вопросы {#general}

- **Как работает ClickPipes для Kafka?**

  ClickPipes использует специальную архитектуру, работающую через API потребителей Kafka, чтобы читать данные из указанной темы, а затем вставляет данные в таблицу ClickHouse на конкретной службе ClickHouse Cloud.

- **В чем разница между ClickPipes и движком таблиц ClickHouse Kafka?**

  Движок таблиц Kafka является функциональностью ядра ClickHouse, который реализует "модель вытягивания", где сервер ClickHouse сам подключается к Kafka, вытягивает события и затем записывает их локально.

  ClickPipes - это отдельная облачная служба, работающая независимо от службы ClickHouse, она подключается к Kafka (или другим источникам данных) и отправляет события в связанную службу ClickHouse Cloud. Эта декомпанированная архитектура позволяет достичь превосходной оперативной гибкости, четкого разделения задач, масштабируемой загрузки, плавного управления сбоями, расширяемости и многого другого.

- **Каковы требования для использования ClickPipes для Kafka?**

  Для использования ClickPipes для Kafka вам потребуется работающий брокер Kafka и служба ClickHouse Cloud с включенным ClickPipes. Вам также необходимо убедиться, что ClickHouse Cloud может получить доступ к вашему брокеру Kafka. Это можно достигнуть, разрешив удаленные подключения на стороне Kafka, добавив IP-адреса [выхода ClickHouse Cloud](/manage/security/cloud-endpoints-api) в настройку вашего Kafka.

- **Поддерживает ли ClickPipes для Kafka AWS PrivateLink?**

  AWS PrivateLink поддерживается. Пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes) для получения более подробной информации.

- **Могу ли я использовать ClickPipes для Kafka для записи данных в тему Kafka?**

  Нет, ClickPipes для Kafka предназначен для чтения данных из тем Kafka, а не для записи их. Чтобы записать данные в тему Kafka, вам нужно использовать специальный продюсер Kafka.

- **Поддерживает ли ClickPipes нескольких брокеров?**

  Да, если брокеры являются частью одного и того же кворума, их можно настроить совместно, разделив запятыми.

### Upstash {#upstash}

- **Поддерживает ли ClickPipes Upstash?**

  Да. Продукт Upstash Kafka вступил в период устаревания 11 сентября 2024 года на 6 месяцев. Существующие клиенты могут продолжить использование ClickPipes с их существующими брокерами Upstash Kafka, используя обобщенные tile для Kafka в пользовательском интерфейсе ClickPipes. Существующие ClickPipes Upstash Kafka не будут затронуты до уведомления об устаревании. По окончании периода устаревания ClickPipe перестанет функционировать.

- **Поддерживает ли ClickPipes регистры схем Upstash?**

  Нет. ClickPipes не совместим с регистром схем Upstash Kafka.

- **Поддерживает ли ClickPipes рабочий процесс Upstash QStash?**

  Нет. Если в рабочий процесс QStash не будет внедрена совместимая с Kafka поверхность, он не будет работать с ClickPipes для Kafka.

### Azure EventHubs {#azure-eventhubs}

- **Работает ли ClickPipe Azure Event Hubs без поверхности Kafka?**

  Нет. ClickPipes требует, чтобы Azure Event Hubs имели включенную поверхность Kafka. Протокол Kafka поддерживается только для их стандартных, премиум и выделенных уровней цен.

- **Работает ли регистр схем Azure с ClickPipes?**

  Нет. ClickPipes в настоящее время не совместим с Event Hubs Schema Registry.

- **Какие разрешения нужны моей политике для потребления из Azure Event Hubs?**

  Чтобы перечислять темы и потреблять события, общая политика доступа, предоставленная ClickPipes, как минимум, должна требовать 'Listen' претензию.

- **Почему мой Event Hubs не возвращает данные?**

Если ваш экземпляр ClickHouse находится в другом регионе или континенте по сравнению с развертыванием Event Hubs, вы можете испытать тайм-ауты при присоединении вашего ClickPipes и более высокую задержку при потреблении данных из Event Hub. Рекомендуется развернуть ваш ClickHouse Cloud и Azure Event Hubs в облачных регионах, расположенных близко друг к другу, чтобы избежать негативного влияния на производительность.

- **Должен ли я указывать номер порта для Azure Event Hubs?**

  Да. ClickPipes ожидает, что вы укажете номер порта для поверхности Kafka, который должен быть `:9093`.

- **Все ли IP-адреса ClickPipes все еще актуальны для Azure Event Hubs?**

  Да. Если вы ограничиваете трафик на экземпляр вашего Event Hubs, пожалуйста, добавьте [документированные статические NAT IP-адреса](./index.md#list-of-static-ips).

- **Является ли строка подключения для Event Hub или для пространства имен Event Hub?**

  Оба варианта подойдут, однако мы рекомендуем использовать политику общего доступа на уровне пространства имен, чтобы получать образцы из нескольких Event Hubs.

