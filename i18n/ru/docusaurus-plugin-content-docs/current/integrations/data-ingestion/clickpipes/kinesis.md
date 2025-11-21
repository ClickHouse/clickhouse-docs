---
sidebar_label: 'ClickPipes для Amazon Kinesis'
description: 'Лёгкое подключение источников данных Amazon Kinesis к ClickHouse Cloud.'
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

Убедитесь, что вы ознакомились с [введением в ClickPipes](./index.md) и настроили [учетные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [роль IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Для получения информации о настройке роли, совместимой с ClickHouse Cloud, обратитесь к [руководству по ролевому доступу для Kinesis](./secure-kinesis.md).


## Создание первого ClickPipe {#creating-your-first-clickpipe}

1. Откройте SQL-консоль для вашего сервиса ClickHouse Cloud.

<Image img={cp_service} alt='ClickPipes service' size='lg' border />

2. Нажмите кнопку `Data Sources` в меню слева и выберите "Set up a ClickPipe"

<Image img={cp_step0} alt='Select imports' size='lg' border />

3. Выберите источник данных.

<Image img={cp_step1} alt='Select data source type' size='lg' border />

4. Заполните форму, указав имя ClickPipe, описание (необязательно), IAM-роль или учетные данные, а также другие параметры подключения.

<Image
  img={cp_step2_kinesis}
  alt='Fill out connection details'
  size='lg'
  border
/>

5. Выберите поток Kinesis и начальное смещение. В интерфейсе отобразится пример документа из выбранного источника (топик Kafka и т. д.). Вы также можете включить Enhanced Fan-out для потоков Kinesis, чтобы повысить производительность и стабильность ClickPipe (дополнительную информацию об Enhanced Fan-out можно найти [здесь](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout))

<Image
  img={cp_step3_kinesis}
  alt='Set data format and topic'
  size='lg'
  border
/>

6. На следующем шаге выберите, хотите ли вы загружать данные в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране для изменения имени таблицы, схемы и настроек. В верхней части экрана отображается предварительный просмотр изменений в реальном времени.

<Image img={cp_step4a} alt='Set table, schema, and settings' size='lg' border />

Вы также можете настроить дополнительные параметры с помощью предоставленных элементов управления

<Image img={cp_step4a3} alt='Set advanced controls' size='lg' border />

7. Также вы можете загрузить данные в существующую таблицу ClickHouse. В этом случае интерфейс позволит сопоставить поля источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt='Use an existing table' size='lg' border />

8. Наконец, настройте разрешения для внутреннего пользователя ClickPipes.

   **Разрешения:** ClickPipes создаст выделенного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя — пользовательскую или одну из предопределенных:
   - `Full access`: полный доступ к кластеру. Может быть полезно при использовании материализованных представлений или словарей с целевой таблицей.
   - `Only destination table`: только разрешения `INSERT` для целевой таблицы.

<Image img={cp_step5} alt='Permissions' border />

9. Нажмите "Complete Setup" — система зарегистрирует ваш ClickPipe, и вы увидите его в сводной таблице.

<Image img={cp_success} alt='Success notice' size='sm' border />

<Image img={cp_remove} alt='Remove notice' size='lg' border />

Сводная таблица предоставляет элементы управления для отображения примеров данных из источника или целевой таблицы в ClickHouse

<Image img={cp_destination} alt='View destination' size='lg' border />

А также элементы управления для удаления ClickPipe и отображения сводки задачи загрузки.

<Image img={cp_overview} alt='View overview' size='lg' border />

10. **Поздравляем!** Вы успешно настроили свой первый ClickPipe. Если это потоковый ClickPipe, он будет непрерывно работать, загружая данные в реальном времени из удаленного источника данных. В противном случае он загрузит пакет данных и завершит работу.


## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаются следующие форматы:

- [JSON](/interfaces/formats/JSON)


## Поддерживаемые типы данных {#supported-data-types}

### Поддержка стандартных типов {#standard-types-support}

В настоящее время в ClickPipes поддерживаются следующие типы данных ClickHouse:

- Базовые числовые типы - \[U\]Int8/16/32/64, Float32/64 и BFloat16
- Типы больших целых чисел - \[U\]Int128/256
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
в исходном потоке данных. Из-за особенностей определения ClickPipes корректного подтипа варианта в определении Variant может использоваться только один целочисленный тип или тип datetime —
например, `Variant(Int64, UInt32)` не поддерживается.

### Поддержка типа JSON {#json-type-support}

Поля JSON, которые всегда являются объектом JSON, могут быть назначены целевому столбцу JSON. Вам потребуется вручную изменить тип целевого
столбца на желаемый тип JSON, включая любые фиксированные или пропущенные пути.


## Виртуальные столбцы Kinesis {#kinesis-virtual-columns}

Для потока Kinesis поддерживаются следующие виртуальные столбцы. При создании новой целевой таблицы виртуальные столбцы можно добавить с помощью кнопки `Add Column`.

| Имя               | Описание                                                      | Рекомендуемый тип данных |
| ----------------- | ------------------------------------------------------------- | ------------------------ |
| \_key             | Ключ партиции Kinesis                                         | String                   |
| \_timestamp       | Приблизительная временная метка поступления Kinesis (с точностью до миллисекунд) | DateTime64(3)            |
| \_stream          | Имя потока Kinesis                                            | String                   |
| \_sequence_number | Порядковый номер Kinesis                                      | String                   |
| \_raw_message     | Полное сообщение Kinesis                                      | String                   |

Поле \_raw_message можно использовать в случаях, когда требуется только полная JSON-запись Kinesis (например, при использовании функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для заполнения материализованного представления downstream). Для таких конвейеров удаление всех «невиртуальных» столбцов может повысить производительность ClickPipes.


## Ограничения {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) не поддерживается.


## Производительность {#performance}

### Пакетная обработка {#batching}

ClickPipes вставляет данные в ClickHouse пакетами. Это позволяет избежать создания слишком большого количества частей в базе данных, что может привести к проблемам с производительностью кластера.

Пакеты вставляются при выполнении одного из следующих критериев:

- Размер пакета достиг максимального значения (100 000 строк или 32 МБ на 1 ГБ памяти реплики)
- Пакет открыт в течение максимального времени (5 секунд)

### Задержка {#latency}

Задержка (определяется как время между отправкой сообщения Kinesis в поток и его доступностью в ClickHouse) зависит от ряда факторов (например, задержка Kinesis, сетевая задержка, размер/формат сообщения). [Пакетная обработка](#batching), описанная в разделе выше, также влияет на задержку. Мы всегда рекомендуем тестировать ваш конкретный сценарий использования, чтобы понять ожидаемую задержку.

Если у вас есть особые требования к низкой задержке, пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes).

### Масштабирование {#scaling}

ClickPipes для Kinesis спроектирован для горизонтального и вертикального масштабирования. По умолчанию создается группа потребителей с одним потребителем. Это можно настроить при создании ClickPipe или в любой момент в разделе **Settings** -> **Advanced Settings** -> **Scaling**.

ClickPipes обеспечивает высокую доступность благодаря архитектуре, распределенной по зонам доступности.
Для этого требуется масштабирование минимум до двух потребителей.

Независимо от количества работающих потребителей, отказоустойчивость обеспечивается по умолчанию.
Если потребитель или его базовая инфраструктура выходят из строя,
ClickPipe автоматически перезапустит потребителя и продолжит обработку сообщений.


## Аутентификация {#authentication}

Для доступа к потокам Amazon Kinesis можно использовать [учетные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [роль IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Подробную информацию о настройке роли IAM см. в [этом руководстве](./secure-kinesis.md), где описана настройка роли для работы с ClickHouse Cloud
