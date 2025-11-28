---
sidebar_label: 'ClickPipes для Amazon Kinesis'
description: 'Бесшовно подключайте источники данных Amazon Kinesis к ClickHouse Cloud.'
slug: /integrations/clickpipes/kinesis
title: 'Интеграция Amazon Kinesis с ClickHouse Cloud'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
keywords: ['clickpipes', 'kinesis', 'streaming', 'aws', 'ингестия данных']
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
Вы ознакомились с [введением в ClickPipes](./index.md) и настроили [учётные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [роль IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Следуйте [руководству по доступу к Kinesis на основе ролей](./secure-kinesis.md), чтобы настроить роль для работы с ClickHouse Cloud.



## Создание вашего первого ClickPipe {#creating-your-first-clickpipe}

1. Откройте SQL Console для своего сервиса ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. В левом меню нажмите кнопку `Data Sources` и выберите «Set up a ClickPipe».

<Image img={cp_step0} alt="Выбор импортов" size="lg" border/>

3. Выберите источник данных.

<Image img={cp_step1} alt="Выбор типа источника данных" size="lg" border/>

4. Заполните форму, указав имя для ClickPipe, описание (необязательно), вашу IAM‑роль или учётные данные, а также другие параметры подключения.

<Image img={cp_step2_kinesis} alt="Заполнение параметров подключения" size="lg" border/>

5. Выберите Kinesis Stream и начальное смещение (offset). В интерфейсе будет отображён пример документа из выбранного источника (Kafka topic и т. д.). Вы также можете включить Enhanced Fan-out для потоков Kinesis, чтобы повысить производительность и стабильность ClickPipe (подробнее об Enhanced Fan-out можно прочитать [здесь](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)).

<Image img={cp_step3_kinesis} alt="Настройка формата данных и топика" size="lg" border/>

6. На следующем шаге вы можете выбрать, хотите ли вы выполнять приём данных в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и настройки. В верхней части вы можете видеть предварительный просмотр изменений в примерной таблице в реальном времени.

<Image img={cp_step4a} alt="Настройка таблицы, схемы и параметров" size="lg" border/>

  Также вы можете настроить расширенные параметры с помощью предоставленных элементов управления.

<Image img={cp_step4a3} alt="Настройка расширенных элементов управления" size="lg" border/>

7. Либо вы можете направлять данные в уже существующую таблицу ClickHouse. В этом случае интерфейс позволит вам сопоставить поля источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt="Использование существующей таблицы" size="lg" border/>

8. Наконец, вы можете настроить права доступа для внутреннего пользователя ClickPipes.

  **Права доступа:** ClickPipes создаст отдельного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя пользовательскую роль или одну из предопределённых ролей:
    - `Full access`: с полным доступом к кластеру. Это может быть полезно, если вы используете материализованное представление или Dictionary с целевой таблицей.
    - `Only destination table`: с правами `INSERT` только для целевой таблицы.

<Image img={cp_step5} alt="Права доступа" border/>

9. После нажатия «Complete Setup» система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt="Уведомление об успешном создании" size="sm" border/>

<Image img={cp_remove} alt="Уведомление об удалении" size="lg" border/>

  Сводная таблица предоставляет элементы управления для отображения примеров данных из источника или целевой таблицы в ClickHouse.

<Image img={cp_destination} alt="Просмотр целевой таблицы" size="lg" border/>

  А также элементы управления для удаления ClickPipe и отображения сводной информации о задании приёма.

<Image img={cp_overview} alt="Просмотр сводной информации" size="lg" border/>

10. **Поздравляем!** Вы успешно настроили свой первый ClickPipe. Если это потоковый ClickPipe, он будет постоянно работать, выполняя приём данных в реальном времени из удалённого источника данных. В противном случае приём будет выполнен пакетно и завершится.



## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаемые форматы:
- [JSON](/interfaces/formats/JSON)



## Поддерживаемые типы данных {#supported-data-types}

### Поддержка стандартных типов {#standard-types-support}
В ClickPipes в настоящее время поддерживаются следующие типы данных ClickHouse:

- Базовые числовые типы — \[U\]Int8/16/32/64, Float32/64 и BFloat16
- Большие целочисленные типы — \[U\]Int128/256
- Типы Decimal
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64 (только часовой пояс UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы ClickHouse LowCardinality
- Map с ключами и значениями любого из перечисленных выше типов (включая Nullable-типы)
- Tuple и Array с элементами любого из перечисленных выше типов (включая Nullable-типы, только один уровень вложенности)
- Типы SimpleAggregateFunction (для таблиц назначения с движком AggregatingMergeTree или SummingMergeTree)

### Поддержка типа Variant {#variant-type-support}
Вы можете вручную задать тип Variant (например, `Variant(String, Int64, DateTime)`) для любого поля JSON
в исходном потоке данных. Из-за того, как ClickPipes определяет корректный подтип Variant, в определении Variant
можно использовать только один целочисленный тип или тип даты и времени — например, `Variant(Int64, UInt32)` не поддерживается.

### Поддержка типов JSON {#json-type-support}
Поля JSON, которые всегда являются объектом JSON, можно сопоставить с целевым столбцом типа JSON. Вам потребуется вручную изменить
целевой столбец на требуемый тип JSON, включая любые фиксированные или пропускаемые пути. 



## Виртуальные столбцы Kinesis {#kinesis-virtual-columns}

Для потока Kinesis поддерживаются следующие виртуальные столбцы. При создании новой таблицы назначения виртуальные столбцы можно добавить с помощью кнопки `Add Column`.

| Name             | Description                                                            | Recommended Data Type       |
|------------------|------------------------------------------------------------------------|-----------------------------|
| _key             | Ключ партиции Kinesis                                                  | String                      |
| _timestamp       | Приблизительное время поступления в Kinesis (с точностью до миллисекунды) | DateTime64(3)           |
| _stream          | Имя потока Kinesis                                                     | String                      |
| _sequence_number | Порядковый номер в Kinesis                                             | String                      |
| _raw_message     | Полное сообщение Kinesis                                               | String                      |

Поле _raw_message можно использовать в случаях, когда требуется только полная JSON-запись Kinesis (например, при использовании функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для заполнения дочернего материализованного представления). Для таких конвейеров производительность ClickPipes может повыситься, если удалить все «невиртуальные» столбцы.



## Ограничения {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) не поддерживается.



## Производительность {#performance}

### Пакетная обработка {#batching}
ClickPipes вставляет данные в ClickHouse пакетами. Это позволяет избежать создания слишком большого количества частей в базе данных, что может привести к проблемам с производительностью кластера.

Пакеты вставляются при выполнении одного из следующих условий:
- Размер пакета достиг максимального значения (100 000 строк или 32 МБ на 1 ГБ памяти реплики).
- Пакет остается открытым максимально допустимое время (5 секунд).

### Задержка {#latency}

Задержка (определяемая как время между отправкой сообщения Kinesis в поток и моментом, когда сообщение становится доступным в ClickHouse) будет зависеть от ряда факторов (таких как задержка в Kinesis, сетевая задержка, размер и формат сообщения). Описанная в разделе выше [пакетная обработка](#batching) также влияет на задержку. Мы рекомендуем протестировать ваш конкретный сценарий использования, чтобы понять, какую задержку вы можете ожидать.

Если у вас есть особые требования по низкой задержке, пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes).

### Масштабирование {#scaling}

ClickPipes для Kinesis спроектирован для масштабирования как по горизонтали, так и по вертикали. По умолчанию мы создаем группу потребителей с одним потребителем. Это можно настроить при создании ClickPipe или в любой другой момент в разделе **Settings** -> **Advanced Settings** -> **Scaling**.

ClickPipes обеспечивает высокую доступность благодаря архитектуре с распределением по зонам доступности.
Для этого требуется масштабирование как минимум до двух потребителей.

Независимо от количества работающих потребителей, отказоустойчивость обеспечивается архитектурой системы.
Если потребитель или его базовая инфраструктура выходит из строя,
ClickPipe автоматически перезапустит потребителя и продолжит обработку сообщений.



## Аутентификация {#authentication}

Для доступа к потокам Amazon Kinesis вы можете использовать [учётные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [роль IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Более подробные сведения о настройке роли IAM см. в [этом руководстве](./secure-kinesis.md), где описано, как настроить роль, которая будет работать с ClickHouse Cloud.
