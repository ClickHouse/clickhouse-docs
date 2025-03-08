---
sidebar_label: ClickPipes для Kafka
description: Бесшовно подключите свои источники данных Kafka к ClickHouse Cloud.
slug: /integrations/clickpipes/kafka
sidebar_position: 1
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


# Интеграция Kafka с ClickHouse Cloud
## Предварительные требования {#prerequisite}
Вы ознакомились с [вводной информацией по ClickPipes](./index.md).

## Создание вашего первого Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

1. Получите доступ к SQL Консоли вашего ClickHouse Cloud Service.

<img src={cp_service} alt="Служба ClickPipes" />


2. Выберите кнопку `Data Sources` в боковом меню и нажмите "Настроить ClickPipe"

<img src={cp_step0} alt="Выберите импорты" />

3. Выберите ваш источник данных.

<img src={cp_step1} alt="Выберите тип источника данных" />

4. Заполните форму, указав имя для вашего ClickPipe, описание (по желанию), ваши учетные данные и другие детали подключения.

<img src={cp_step2} alt="Заполните данные подключения" />

5. Настройте реестр схем. Корректная схема обязательна для потоков Avro и является необязательной для JSON. Эта схема будет использоваться для парсинга [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent) или валидации сообщений JSON в выбранной теме.
- Сообщения Avro, которые не могут быть распознаны, или сообщения JSON, которые не прошли валидацию, вызовут ошибку.
- "корневой" путь реестра схем. Например, URL реестра схем Confluent Cloud - это просто HTTPS URL без пути, вроде `https://test-kk999.us-east-2.aws.confluent.cloud`. Если указан только корневой
путь, схема, используемая для определения названий и типов колонок на этапе 4, будет определена по ID, встроенному в выборочные сообщения Kafka.
- путь `/schemas/ids/[ID]` к документу схемы по числовому ID схемы. Полный URL с использованием ID схемы будет выглядеть как `https://registry.example.com/schemas/ids/1000`
- путь `/subjects/[subject_name]` к документу схемы по названию темы. При желании можно указать конкретную версию, добавив `/versions/[version]` к URL (в противном случае ClickPipes
получит последнюю версию). Полный URL с использованием названия схемы будет выглядеть как `https://registry.example.com/subjects/events` или `https://registry/example.com/subjects/events/versions/4`

Обратите внимание, что во всех случаях ClickPipes автоматически извлечет обновленную или другую схему из реестра, если это указано ID схемы, встроенному в сообщение. Если сообщение записано
без встроенного ID схемы, то конкретный ID схемы или название темы должны быть указаны для парсинга всех сообщений.

6. Выберите вашу тему, и интерфейс отобразит образец документа из темы.

<img src={cp_step3} alt="Установите формат данных и тему" />

7. На следующем шаге вы можете выбрать, хотите ли вы загружать данные в новую таблицу ClickHouse или переиспользовать существующую. Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и настройки. Вы можете видеть предварительный просмотр своих изменений в образец таблице вверху.

<img src={cp_step4a} alt="Установите таблицу, схему и настройки" />

  Вы также можете настроить дополнительные параметры, используя предоставленные контроли

<img src={cp_step4a3} alt="Установите расширенные параметры" />

8. В качестве альтернативы вы можете решить загрузить данные в существующую таблицу ClickHouse. В этом случае интерфейс позволит вам сопоставить поля из источника с полями ClickHouse в выбранной целевой таблице.

<img src={cp_step4b} alt="Используйте существующую таблицу" />

9. Наконец, вы можете настроить разрешения для внутреннего пользователя ClickPipes.

  **Разрешения:** ClickPipes создаст выделенного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя пользовательскую роль или одну из предопределенных ролей:
    - `Full access`: с полным доступом к кластеру. Это может быть полезно, если вы используете Materialized View или Dictionary с целевой таблицей.
    - `Only destination table`: с разрешениями `INSERT` только на целевую таблицу.

<img src={cp_step5} alt="Разрешения" />

10. Нажав на "Завершить настройку", система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<img src={cp_success} alt="Уведомление об успехе" />

<img src={cp_remove} alt="Уведомление об удалении" />

  Сводная таблица предоставляет контроли для отображения образцовых данных из источника или целевой таблицы в ClickHouse

<img src={cp_destination} alt="Просмотреть назначение" />

  А также контроли для удаления ClickPipe и отображения сводки задачи загрузки.

<img src={cp_overview} alt="Просмотреть сводку" />

11. **Поздравляем!** вы успешно настроили свой первый ClickPipe. Если это потоковый ClickPipe, он будет работать непрерывно, загружая данные в реальном времени из вашего удаленного источника данных.

## Поддерживаемые источники данных {#supported-data-sources}

| Название             | Логотип | Тип     | Статус          | Описание                                                                                          |
|----------------------|---------|---------|-----------------|---------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Apache Kafka в ClickHouse Cloud.     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>|Потоковый| Стабильный      | Разблокируйте объединенную мощь Confluent и ClickHouse Cloud через нашу прямую интеграцию.          |
| Redpanda             |<img src={redpanda_logo} class="image" alt="Логотип Redpanda" style={{width: '2.5rem', 'background-color': 'transparent'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Redpanda в ClickHouse Cloud.         |
| AWS MSK              |<Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из AWS MSK в ClickHouse Cloud.          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Azure Event Hubs в ClickHouse Cloud. |
| WarpStream           |<Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из WarpStream в ClickHouse Cloud.       |

Больше соединителей будет добавлено в ClickPipes, вы можете узнать больше, [связавшись с нами](https://clickhouse.com/company/contact?loc=clickpipes).

## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаемые форматы:
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### Поддерживаемые типы данных {#supported-data-types}

Следующие типы данных ClickHouse в настоящее время поддерживаются в ClickPipes:

- Базовые числовые типы - \[U\]Int8/16/32/64 и Float32/64
- Большие целочисленные типы - \[U\]Int128/256
- Типы Decimal
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64 (только временные зоны UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы LowCardinality ClickHouse
- Map с ключами и значениями, использующими любой из вышеперечисленных типов (включая Nullable)
- Tuple и Array с элементами, использующими любой из вышеперечисленных типов (включая Nullable, только один уровень глубины)

### Avro {#avro}
#### Поддерживаемые типы данных Avro {#supported-avro-data-types}

ClickPipes поддерживает все примитивные и сложные типы Avro, а также все логические типы Avro, кроме `time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros` и `duration`. Типы Avro `record` преобразуются в Tuple, типы `array` в Array, а `map` в Map (только строковые ключи). В общем, доступные преобразования перечислены [здесь](/interfaces/formats/Avro#data-types-matching). Мы рекомендуем использовать точное сопоставление типов для числовых типов Avro, так как ClickPipes не проверяет переполнение или потерю точности при преобразовании типов.

#### Nullable типы и Avro объединения {#nullable-types-and-avro-unions}

Nullable типы в Avro определяются с помощью схемы объединения `(T, null)` или `(null, T)`, где T - базовый тип Avro. Во время вывода схемы такие объединения будут сопоставлены с колонкой "Nullable" в ClickHouse. Обратите внимание, что ClickHouse не поддерживает
типы `Nullable(Array)`, `Nullable(Map)` или `Nullable(Tuple)`. Объединения Avro null для этих типов будут сопоставлены с не-null версиями (типы Avro Record сопоставляются с именованным Tuple ClickHouse). "Null" Avro для этих типов будут вставлены как:
- Пустой массив для нулевого Avro массива
- Пустой Map для нулевого Avro Map
- Именованный Tuple со всеми значениями по умолчанию/нулевыми для нулевого Avro Record

ClickPipes в настоящее время не поддерживает схемы, содержащие другие объединения Avro (это может измениться в будущем с внедрением новых типов данных ClickHouse Variant и JSON). Если схема Avro содержит "не-null" объединение, ClickPipes сгенерирует ошибку при попытке вычислить сопоставление между схемой Avro и типами колонок ClickHouse.

#### Управление схемами Avro {#avro-schema-management}

ClickPipes динамически извлекает и применяет схему Avro из настроенного реестра схем, используя ID схемы, встроенный в каждое сообщение/событие. Обновления схем обнаруживаются и обрабатываются автоматически.

В настоящее время ClickPipes совместим только с реестрами схем, использующими [API реестра схем Confluent](https://docs.confluent.io/platform/current/schema-registry/develop/api.html). В дополнение к Confluent Kafka и Cloud, это включает в себя Redpanda, AWS MSK и Upstash. ClickPipes в настоящее время не совместим с реестром схем AWS Glue или реестром схем Azure (в скоро).

Следующие правила применяются к сопоставлению между извлекаемой схемой Avro и целевой таблицей ClickHouse:
- Если схема Avro содержит поле, которое не включено в сопоставление с целью ClickHouse, это поле игнорируется.
- Если схема Avro не содержит поля, определенного в сопоставлении с целью ClickHouse, колонка ClickHouse будет заполнена значением "ноль", таким как 0 или пустая строка. Обратите внимание, что выражения [DEFAULT](/sql-reference/statements/create/table#default) в настоящее время не оцениваются для вставок ClickPipes (это временное ограничение, ожидающее обновлений обработки значений по умолчанию на сервере ClickHouse).
- Если поле схемы Avro и колонка ClickHouse несовместимы, вставки этой строки/сообщения потерпят неудачу, и ошибка будет зафиксирована в таблице ошибок ClickPipes. Обратите внимание, что поддерживаются несколько неявных преобразований (например, между числовыми типами), но не все (например, поле Avro `record` не может быть вставлено в колонку ClickHouse типа `Int32`).

## Виртуальные колонки Kafka {#kafka-virtual-columns}

Для совместимых с Kafka потоковых источников данных поддерживаются следующие виртуальные колонки. При создании новой целевой таблицы виртуальные колонки можно добавить, используя кнопку `Add Column`.

| Название         | Описание                                        | Рекомендуемый тип данных |
|------------------|-------------------------------------------------|--------------------------|
| _key             | Ключ сообщения Kafka                           | String                   |
| _timestamp       | Временная метка Kafka (миллисекундная точность) | DateTime64(3)            |
| _partition       | Партиция Kafka                                 | Int32                    |
| _offset          | Смещение Kafka                                  | Int64                    |
| _topic           | Тема Kafka                                     | String                   |
| _header_keys     | Параллельный массив ключей в заголовках записи | Array(String)            |
| _header_values   | Параллельный массив заголовков в записи        | Array(String)            |
| _raw_message     | Полное сообщение Kafka                         | String                   |

Обратите внимание, что колонка _raw_message рекомендуется только для данных JSON. Для случаев, когда требуется только строка JSON (например, при использовании функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для заполнения потока материала), может улучшить производительность ClickPipes удаление всех "не виртуальных" колонок.

## Ограничения {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) не поддерживается.

## Семантика доставки {#delivery-semantics}
ClickPipes для Kafka предоставляет семантику доставки `at-least-once` (как один из наиболее часто используемых подходов). Мы будем рады услышать ваши отзывы о семантике доставки [на форме обратной связи](https://clickhouse.com/company/contact?loc=clickpipes). Если вам нужна семантика exactly-once, мы рекомендуем использовать наш официальный [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) приемник.

## Аутентификация {#authentication}
Для источников данных протокола Apache Kafka ClickPipes поддерживает аутентификацию [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) с шифрованием TLS, а также `SASL/SCRAM-SHA-256` и `SASL/SCRAM-SHA-512`. В зависимости от источника потоков (Redpanda, MSK и т.д.) будет доступны вся или часть этих механизмов аутентификации в зависимости от совместимости. Если ваши потребности в аутентификации отличаются, пожалуйста, [сообщите нам об этом](https://clickhouse.com/company/contact?loc=clickpipes).

### IAM {#iam}

:::info
Аутентификация IAM для ClickPipe MSK является функцией бета-версии.
:::

ClickPipes поддерживает следующую аутентификацию AWS MSK

  - [Аутентификация SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html)
  - [Аутентификация с использованием учетных данных IAM или доступа на основе ролей](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html)

При использовании IAM аутентификации для подключения к брокеру MSK роли IAM должны иметь необходимые разрешения.
Ниже приведен пример необходимой IAM политики для API Apache Kafka для MSK:

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

Если вы выполняете аутентификацию с помощью ARN роли IAM, вам необходимо добавить доверительные отношения между вашим экземпляром ClickHouse Cloud, чтобы роль могла быть принята.

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
Обратите внимание, что, хотя мы поддерживаем загрузку одного SSL сертификата вместе с SASL для Kafka, SSL с использованием Mutual TLS (mTLS) в настоящее время не поддерживается.
:::

## Производительность {#performance}

### Пакетная обработка {#batching}
ClickPipes вставляет данные в ClickHouse партиями. Это необходимо, чтобы избежать создания слишком большого количества частей в базе данных, что может привести к проблемам с производительностью в кластере.

Партии вставляются, когда выполнено одно из следующих условий:
- Размер партии достиг максимального значения (100,000 строк или 20MB)
- Партия открыта не более максимального времени (5 секунд)

### Задержка {#latency}

Задержка (определяемая как время между производством сообщения Kafka и его доступностью в ClickHouse) будет зависеть от многих факторов (например, задержка брокера, сетевые задержки, размер/формат сообщения). Пакетная обработка, описанная в разделе выше, также будет влиять на задержку. Мы всегда рекомендуем протестировать ваш конкретный случай использования с типичными нагрузками, чтобы определить ожидаемую задержку.

ClickPipes не предоставляет никаких гарантий по поводу задержки. Если у вас есть конкретные требования к низкой задержке, пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes).

### Масштабирование {#scaling}

ClickPipes для Kafka спроектирован для горизонтального масштабирования. По умолчанию мы создаем группу потребителей с одним потребителем.
Это можно изменить с помощью инструментов масштабирования в отображении деталей ClickPipe.

ClickPipes обеспечивает высокую доступность с распределенной архитектурой по зонам доступности.
Это требует масштабирования до как минимум двух потребителей.

Независимо от количества работающих потребителей, отказоустойчивость доступна по умолчанию.
Если потребитель или его подлежащая инфраструктура выйдет из строя,
ClickPipe автоматически перезапустит потребителя и продолжит обработку сообщений.

## ЧаВО {#faq}

### Общие вопросы {#general}

- **Как работает ClickPipes для Kafka?**

  ClickPipes использует специализированную архитектуру, работающую с API потребителя Kafka для чтения данных из указанной темы, а затем вставляет данные в таблицу ClickHouse на конкретном ClickHouse Cloud service.

- **В чем разница между ClickPipes и ClickHouse Kafka Table Engine?**

  Kafka Table Engine - это основная возможность ClickHouse, которая реализует "модель вытягивания", где сам сервер ClickHouse подключается к Kafka, вытягивает события, а затем записывает их локально.

  ClickPipes - это отдельный облачный сервис, который работает независимо от службы ClickHouse, он подключается к Kafka (или другим источникам данных) и отправляет события в связанную службу ClickHouse Cloud. Эта раздельная архитектура позволяет добиться большей операционной гибкости, явного разделения задач, масштабируемой загрузки, надежного управления сбоями, расширяемости и многого другого.

- **Каковы требования для использования ClickPipes для Kafka?**

  Для использования ClickPipes для Kafka вам потребуется работающий брокер Kafka и служба ClickHouse Cloud с включенными ClickPipes. Вам также необходимо убедиться, что ClickHouse Cloud может получить доступ к вашему брокеру Kafka. Это можно сделать, разрешив удаленное подключение со стороны Kafka, добавив [IP-адреса ClickHouse Cloud Egress](/manage/security/cloud-endpoints-api) в белый список в настройках Kafka.

- **Поддерживает ли ClickPipes для Kafka AWS PrivateLink?**

  AWS PrivateLink поддерживается. Пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes) для получения дополнительной информации.

- **Могу ли я использовать ClickPipes для Kafka для записи данных в тему Kafka?**

  Нет, ClickPipes для Kafka предназначен для чтения данных из тем Kafka, а не для их записи. Для записи данных в тему Kafka вам потребуется использовать специализированный продюсер Kafka.

- **Поддерживает ли ClickPipes несколько брокеров?**

  Да, если брокеры являются частью одного кворума, они могут быть настроены вместе, разделенные `,`.

### Upstash {#upstash}

- **Поддерживает ли ClickPipes Upstash?**

  Да. Продукт Upstash Kafka вступил в период устаревания 11 сентября 2024 года на 6 месяцев. Существующие клиенты могут продолжать использовать ClickPipes с их существующими брокерами Upstash Kafka, используя общий кафка плитку в интерфейсе ClickPipes. Существующие ClickPipes Upstash Kafka не затрагиваются до получения уведомления об устаревании. Когда период устаревания закончится, ClickPipe перестанет функционировать.

- **Поддерживает ли ClickPipes реестр схем Upstash?**

  Нет. ClickPipes не совместим с реестром схем Upstash Kafka.

- **Поддерживает ли ClickPipes рабочий процесс Upstash QStash?**

  Нет. Если Kafka совместимый интерфейс не будет введен в рабочий процесс QStash, он не будет работать с ClickPipes Kafka.

### Azure EventHubs {#azure-eventhubs}

- **Работает ли ClickPipe Azure Event Hubs без интерфейса Kafka?**

  Нет. ClickPipes требует, чтобы Azure Event Hubs имел включенный интерфейс Kafka. Протокол Kafka поддерживается только для их стандартных, премиум и выделенных SKU.

- **Работает ли реестр схем Azure с ClickPipes?**

  Нет. ClickPipes в настоящее время не совместим с реестром схем Event Hubs.

- **Какие разрешения нужны моей политике для потребления из Azure Event Hubs?**

  Чтобы перечислить темы и потреблять события, политика общего доступа, предоставленная ClickPipes, должна как минимум содержать претензию 'Listen'.

- **Почему мой Event Hubs не возвращает данные?**

 Если ваш экземпляр ClickHouse находится в другом регионе или континенте от развертывания Event Hubs, вы можете столкнуться с тайм-аутом при загрузке ваших ClickPipes и задержкой при потреблении данных из Event Hub. Считается хорошей практикой размещать ваше развертывание ClickHouse Cloud и развертывание Azure Event Hubs в облачных регионах, находящихся близко друг к другу, чтобы избежать негативного влияния на производительность.

- **Должен ли я включать номер порта для Azure Event Hubs?**

  Да. ClickPipes ожидает, что вы включите номер порта для интерфейса Kafka, который должен быть `:9093`.

- **Актуальны ли еще IP-адреса ClickPipes для Azure Event Hubs?**

  Да. Если вы ограничиваете трафик к своему экземпляру Event Hubs, пожалуйста, добавьте [документированные статические NAT IP-адреса](./index.md#list-of-static-ips).

- **Является ли строка подключения для Event Hub или для пространства имен Event Hub?**

  Оба будут работать, однако, мы рекомендуем использовать политику общего доступа на уровне пространства имен для получения выборок из нескольких Event Hubs.
