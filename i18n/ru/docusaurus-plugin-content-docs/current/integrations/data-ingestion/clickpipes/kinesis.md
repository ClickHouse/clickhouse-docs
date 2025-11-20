---
sidebar_label: 'ClickPipes для Amazon Kinesis'
description: 'Легко подключайте источники данных Amazon Kinesis к ClickHouse Cloud.'
slug: /integrations/clickpipes/kinesis
title: 'Интеграция Amazon Kinesis с ClickHouse Cloud'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
keywords: ['clickpipes', 'kinesis', 'streaming', 'aws', 'data ingestion']
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_kinesis.png';
import cp_step3_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_kinesis.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';


# Интеграция Amazon Kinesis с ClickHouse Cloud

## Предварительные требования {#prerequisite}

Убедитесь, что вы ознакомились с [введением в ClickPipes](./index.md) и настроили [учетные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [роль IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Следуйте [руководству по ролевому доступу для Kinesis](./secure-kinesis.md), чтобы узнать, как настроить роль для работы с ClickHouse Cloud.


## Создание первого ClickPipe {#creating-your-first-clickpipe}

1. Откройте SQL Console для вашего сервиса ClickHouse Cloud.

<Image img={cp_service} alt='Сервис ClickPipes' size='lg' border />

2. Нажмите кнопку `Data Sources` в меню слева и выберите "Set up a ClickPipe"

<Image img={cp_step0} alt='Выбор импорта' size='lg' border />

3. Выберите источник данных.

<Image img={cp_step1} alt='Выбор типа источника данных' size='lg' border />

4. Заполните форму, указав имя для вашего ClickPipe, описание (необязательно), IAM-роль или учетные данные, а также другие параметры подключения.

<Image
  img={cp_step2_kinesis}
  alt='Заполнение параметров подключения'
  size='lg'
  border
/>

5. Выберите поток Kinesis и начальное смещение. В интерфейсе отобразится пример документа из выбранного источника (топик Kafka и т. д.). Вы также можете включить Enhanced Fan-out для потоков Kinesis, чтобы повысить производительность и стабильность вашего ClickPipe (дополнительную информацию об Enhanced Fan-out можно найти [здесь](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout))

<Image
  img={cp_step3_kinesis}
  alt='Установка формата данных и топика'
  size='lg'
  border
/>

6. На следующем шаге вы можете выбрать, загружать ли данные в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и настройки. Вы можете видеть предварительный просмотр изменений в реальном времени в примере таблицы вверху.

<Image img={cp_step4a} alt='Установка таблицы, схемы и настроек' size='lg' border />

Вы также можете настроить расширенные параметры с помощью предоставленных элементов управления

<Image img={cp_step4a3} alt='Установка расширенных параметров' size='lg' border />

7. Альтернативно, вы можете загружать данные в существующую таблицу ClickHouse. В этом случае интерфейс позволит вам сопоставить поля из источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt='Использование существующей таблицы' size='lg' border />

8. Наконец, вы можете настроить права доступа для внутреннего пользователя ClickPipes.

   **Права доступа:** ClickPipes создаст выделенного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя пользовательскую роль или одну из предопределенных ролей:
   - `Full access`: с полным доступом к кластеру. Это может быть полезно, если вы используете материализованное представление или словарь с целевой таблицей.
   - `Only destination table`: с правами `INSERT` только для целевой таблицы.

<Image img={cp_step5} alt='Права доступа' border />

9. Нажав "Complete Setup", система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt='Уведомление об успехе' size='sm' border />

<Image img={cp_remove} alt='Уведомление об удалении' size='lg' border />

Сводная таблица предоставляет элементы управления для отображения примеров данных из источника или целевой таблицы в ClickHouse

<Image img={cp_destination} alt='Просмотр назначения' size='lg' border />

А также элементы управления для удаления ClickPipe и отображения сводки задачи загрузки.

<Image img={cp_overview} alt='Просмотр обзора' size='lg' border />

10. **Поздравляем!** Вы успешно настроили свой первый ClickPipe. Если это потоковый ClickPipe, он будет непрерывно работать, загружая данные в реальном времени из вашего удаленного источника данных. В противном случае он загрузит пакет данных и завершит работу.


## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаются следующие форматы:

- [JSON](/interfaces/formats/JSON)


## Поддерживаемые типы данных {#supported-data-types}

### Поддержка стандартных типов {#standard-types-support}

В настоящее время в ClickPipes поддерживаются следующие типы данных ClickHouse:

- Базовые числовые типы — \[U\]Int8/16/32/64, Float32/64 и BFloat16
- Большие целочисленные типы — \[U\]Int128/256
- Типы Decimal
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64 (только для часовых поясов UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы LowCardinality ClickHouse
- Map с ключами и значениями любых из перечисленных выше типов (включая Nullable)
- Tuple и Array с элементами любых из перечисленных выше типов (включая Nullable, только один уровень вложенности)
- типы SimpleAggregateFunction (для целевых таблиц AggregatingMergeTree или SummingMergeTree)

### Поддержка типа Variant {#variant-type-support}

Вы можете вручную указать тип Variant (например, `Variant(String, Int64, DateTime)`) для любого поля JSON
во входном потоке данных. Из-за особенностей определения ClickPipes корректного подтипа варианта в определении Variant может использоваться только один целочисленный тип или тип даты-времени — например, `Variant(Int64, UInt32)` не поддерживается.

### Поддержка типа JSON {#json-type-support}

Поля JSON, которые всегда являются объектом JSON, могут быть назначены целевому столбцу типа JSON. Вам потребуется вручную изменить тип целевого
столбца на желаемый тип JSON, включая любые фиксированные или пропускаемые пути.


## Виртуальные колонки Kinesis {#kinesis-virtual-columns}

Для потока Kinesis поддерживаются следующие виртуальные колонки. При создании новой целевой таблицы виртуальные колонки можно добавить с помощью кнопки `Add Column`.

| Имя               | Описание                                                      | Рекомендуемый тип данных |
| ----------------- | ------------------------------------------------------------- | ------------------------ |
| \_key             | Ключ партиции Kinesis                                         | String                   |
| \_timestamp       | Приблизительная временная метка поступления Kinesis (с точностью до миллисекунд) | DateTime64(3)            |
| \_stream          | Имя потока Kinesis                                            | String                   |
| \_sequence_number | Порядковый номер Kinesis                                      | String                   |
| \_raw_message     | Полное сообщение Kinesis                                      | String                   |

Поле \_raw_message можно использовать в случаях, когда требуется только полная JSON-запись Kinesis (например, при использовании функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для заполнения материализованного представления). Для таких конвейеров удаление всех «невиртуальных» колонок может повысить производительность ClickPipes.


## Ограничения {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) не поддерживается.


## Производительность {#performance}

### Пакетная обработка {#batching}

ClickPipes вставляет данные в ClickHouse пакетами. Это позволяет избежать создания слишком большого количества частей в базе данных, что может привести к проблемам с производительностью кластера.

Пакеты вставляются при выполнении одного из следующих условий:

- Размер пакета достиг максимального значения (100 000 строк или 32 МБ на 1 ГБ памяти реплики)
- Пакет открыт в течение максимального времени (5 секунд)

### Задержка {#latency}

Задержка (определяемая как время между отправкой сообщения Kinesis в поток и его доступностью в ClickHouse) зависит от ряда факторов (например, задержка Kinesis, сетевая задержка, размер/формат сообщения). [Пакетная обработка](#batching), описанная в разделе выше, также влияет на задержку. Мы всегда рекомендуем тестировать ваш конкретный сценарий использования, чтобы понять ожидаемую задержку.

Если у вас есть особые требования к низкой задержке, пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes).

### Масштабирование {#scaling}

ClickPipes для Kinesis спроектирован для горизонтального и вертикального масштабирования. По умолчанию создается группа потребителей с одним потребителем. Это можно настроить при создании ClickPipe или в любой момент в разделе **Настройки** -> **Расширенные настройки** -> **Масштабирование**.

ClickPipes обеспечивает высокую доступность благодаря архитектуре, распределенной по зонам доступности.
Для этого требуется масштабирование как минимум до двух потребителей.

Независимо от количества работающих потребителей, отказоустойчивость обеспечивается по умолчанию.
Если потребитель или его базовая инфраструктура выходят из строя,
ClickPipe автоматически перезапустит потребителя и продолжит обработку сообщений.


## Аутентификация {#authentication}

Для доступа к потокам Amazon Kinesis можно использовать [учетные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [роль IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Подробнее о настройке роли IAM см. в [этом руководстве](./secure-kinesis.md), где описана настройка роли для работы с ClickHouse Cloud
