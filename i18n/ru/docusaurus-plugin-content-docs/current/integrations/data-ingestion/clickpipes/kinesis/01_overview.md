---
sidebar_label: 'ClickPipes для Amazon Kinesis'
description: 'Бесшовно подключайте источники данных Amazon Kinesis к ClickHouse Cloud.'
slug: /integrations/clickpipes/kinesis
title: 'Интеграция Amazon Kinesis с ClickHouse Cloud'
doc_type: 'руководство'
keywords: ['clickpipes', 'kinesis', 'потоковая передача', 'aws', 'ингестия данных']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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


# Интеграция Amazon Kinesis с ClickHouse Cloud \{#integrating-amazon-kinesis-with-clickhouse-cloud\}

## Предварительные требования \{#prerequisite\}

Вы ознакомились с [введением в ClickPipes](../index.md) и настроили [учётные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [роль IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Следуйте [руководству по доступу к Kinesis на основе ролей](./02_auth.md), чтобы узнать, как настроить роль для работы с ClickHouse Cloud.

## Создание вашего первого ClickPipe \{#creating-your-first-clickpipe\}

1. Откройте SQL Console для вашего ClickHouse Cloud Service.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. В левом меню выберите кнопку `Data Sources` и нажмите «Set up a ClickPipe».

<Image img={cp_step0} alt="Выбрать импорт" size="lg" border/>

3. Выберите источник данных.

<Image img={cp_step1} alt="Выбрать тип источника данных" size="lg" border/>

4. Заполните форму, указав для вашего ClickPipe имя, описание (необязательно), роль IAM или учётные данные и другие параметры подключения.

<Image img={cp_step2_kinesis} alt="Заполнить параметры подключения" size="lg" border/>

5. Выберите Kinesis Stream и начальное смещение (starting offset). В интерфейсе будет показан пример документа из выбранного источника (топика Kafka и т. д.). Вы также можете включить Enhanced Fan-out для потоков Kinesis, чтобы повысить производительность и стабильность вашего ClickPipe (подробнее об Enhanced Fan-out можно узнать [здесь](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)).

<Image img={cp_step3_kinesis} alt="Задать формат данных и топик" size="lg" border/>

6. На следующем шаге вы можете выбрать, хотите ли вы выполнять приём данных в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и настройки. В верхней части вы увидите интерактивный предпросмотр изменений на примере таблицы.

<Image img={cp_step4a} alt="Задать таблицу, схему и настройки" size="lg" border/>

Вы также можете настроить расширенные параметры, используя предоставленные элементы управления.

<Image img={cp_step4a3} alt="Задать расширенные элементы управления" size="lg" border/>

7. Либо вы можете выполнять приём данных в существующую таблицу ClickHouse. В этом случае интерфейс позволит вам сопоставить поля источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt="Использовать существующую таблицу" size="lg" border/>

8. Наконец, вы можете настроить права доступа для внутреннего пользователя ClickPipes.

**Права доступа:** ClickPipes создаст отдельного пользователя для записи данных в целевую таблицу. Вы можете выбрать для этого внутреннего пользователя роль: использовать пользовательскую роль или одну из предопределённых ролей:

- `Full access`: с полным доступом к кластеру. Это может быть полезно, если вы используете materialized view или словарь (Dictionary) с целевой таблицей.
    - `Only destination table`: с правами `INSERT` только для целевой таблицы.

<Image img={cp_step5} alt="Права доступа" border/>

9. После нажатия «Complete Setup» система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt="Уведомление об успешном выполнении" size="sm" border/>

<Image img={cp_remove} alt="Уведомление об удалении" size="lg" border/>

Сводная таблица предоставляет элементы управления для отображения примеров данных из источника или целевой таблицы в ClickHouse.

<Image img={cp_destination} alt="Просмотр целевой таблицы" size="lg" border/>

А также элементы управления для удаления ClickPipe и отображения сводной информации о задаче приёма данных.

<Image img={cp_overview} alt="Просмотр сводки" size="lg" border/>

10. **Поздравляем!** Вы успешно настроили свой первый ClickPipe. Если это стриминговый ClickPipe, он будет постоянно работать, выполняя приём данных в режиме реального времени из вашего удалённого источника данных. В противном случае будет выполнен приём пакетных данных, после чего ClickPipe завершит работу.

## Поддерживаемые форматы данных \{#supported-data-formats\}

Поддерживаемые форматы:

- [JSON](/interfaces/formats/JSON)

## Поддерживаемые типы данных \{#supported-data-types\}

### Поддержка стандартных типов \{#standard-types-support\}

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
- все типы LowCardinality в ClickHouse
- Map с ключами и значениями любого из перечисленных выше типов (включая Nullable)
- Tuple и Array с элементами любого из перечисленных выше типов (включая Nullable, только один уровень вложенности)
- Типы SimpleAggregateFunction (для целевых таблиц AggregatingMergeTree или SummingMergeTree)

### Поддержка типа Variant \{#variant-type-support\}

Вы можете вручную указать тип Variant (например, `Variant(String, Int64, DateTime)`) для любого JSON-поля
во входящем потоке данных. Из-за способа, которым ClickPipes определяет корректный подтип Variant, в определении Variant
можно использовать только один целочисленный или тип даты и времени — например, `Variant(Int64, UInt32)` не поддерживается.

### Поддержка типа JSON \{#json-type-support\}

Поля JSON, которые всегда представляют собой объект JSON, можно назначить целевому столбцу типа JSON. Вам потребуется вручную изменить целевой
столбец на нужный тип JSON, включая любые фиксированные или пропускаемые пути. 

## Виртуальные столбцы Kinesis \{#kinesis-virtual-columns\}

Для потока Kinesis поддерживаются следующие виртуальные столбцы. При создании новой таблицы-приёмника виртуальные столбцы можно добавить с помощью кнопки `Add Column`.

| Name             | Description                                                                 | Recommended Data Type |
|------------------|-----------------------------------------------------------------------------|-----------------------|
| _key             | Ключ партиции Kinesis                                                       | String                |
| _timestamp       | Примерная метка времени поступления в Kinesis (точность в миллисекундах)   | DateTime64(3)         |
| _stream          | Имя потока Kinesis                                                          | String                |
| _sequence_number | Порядковый номер Kinesis                                                    | String                |
| _raw_message     | Полное сообщение Kinesis                                                    | String                |

Поле _raw_message можно использовать в случаях, когда требуется только полная JSON-запись Kinesis (например, при использовании функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для заполнения нижестоящего материализованного представления). Для таких конвейеров производительность ClickPipes может быть выше, если удалить все «невиртуальные» столбцы.

## Ограничения \{#limitations\}

- [DEFAULT](/sql-reference/statements/create/table#default) не поддерживается.
- Размер отдельных сообщений по умолчанию ограничен 8 МБ (в несжатом виде) при работе с наименьшим размером реплики (XS) и 16 МБ (в несжатом виде) для более крупных реплик. Сообщения, превышающие этот лимит, будут отклонены с ошибкой. Если вам необходимо обрабатывать более крупные сообщения, свяжитесь со службой поддержки.

## Производительность \{#performance\}

### Пакетирование \{#batching\}

ClickPipes вставляет данные в ClickHouse пакетами. Это позволяет избежать создания слишком большого количества частей в базе данных, что может привести к проблемам с производительностью кластера.

Пакеты вставляются, когда выполняется одно из следующих условий:

- Размер пакета достиг максимального значения (100 000 строк или 32 МБ на 1 ГБ памяти реплики)
- Пакет находится в открытом состоянии максимально допустимое время (5 секунд)

### Задержка \{#latency\}

Задержка (определяется как время между отправкой сообщения в поток Kinesis и моментом, когда сообщение становится доступным в ClickHouse) зависит от ряда факторов (например, задержка в Kinesis, сетевая задержка, размер и формат сообщения). [Пакетирование](#batching), описанное в разделе выше, также влияет на задержку. Мы всегда рекомендуем протестировать ваш конкретный сценарий использования, чтобы понять, какого уровня задержки вы можете ожидать.

Если у вас есть строгие требования к низкой задержке, пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes).

### Активные сегменты \{#active-shards\}

Мы настоятельно рекомендуем ограничивать количество одновременно активных сегментов в соответствии с вашими требованиями к пропускной способности. Для потока Kinesis типа «On Demand» AWS автоматически назначит соответствующее количество сегментов исходя из пропускной способности,
но для потоков типа «Provisioned» избыточное количество сегментов может привести к задержкам, как описано ниже, а также к увеличению стоимости, поскольку цена Kinesis для таких потоков рассчитывается «за сегмент».

Если ваше приложение-продьюсер непрерывно записывает данные в большое количество активных сегментов, это может приводить к задержкам, если ваш конвейер масштабирован недостаточно для их эффективной обработки. Исходя из ограничений пропускной способности Kinesis,
ClickPipes назначает определённое количество «workers» на реплику для чтения данных сегментов. Например, для наименьшей конфигурации реплика ClickPipes будет иметь 4 таких рабочих потока. Если продьюсер записывает
одновременно более чем в 4 сегмента, данные из «дополнительных» сегментов не будут обрабатываться до тех пор, пока не освободится рабочий поток. В частности, если конвейер использует режим «enhanced fanout», каждый рабочий поток будет подписан на
один сегмент на 5 минут и не сможет читать другие сегменты в течение этого времени. Это может вызывать «скачки» задержки, кратные 5 минутам.

### Масштабирование \{#scaling\}

ClickPipes для Kinesis предназначен для горизонтального и вертикального масштабирования. По умолчанию мы создаем группу потребителей с одним потребителем. Это можно настроить при создании ClickPipe или в любой момент в разделе **Settings** -> **Advanced Settings** -> **Scaling**.

ClickPipes обеспечивает высокую доступность благодаря архитектуре с распределением по зонам доступности.
Для этого требуется масштабирование как минимум до двух потребителей.

Независимо от количества запущенных потребителей, отказоустойчивость заложена в архитектуру по умолчанию.
Если потребитель или его базовая инфраструктура выходит из строя,
ClickPipe автоматически перезапустит потребителя и продолжит обработку сообщений.

## Аутентификация \{#authentication\}

Для доступа к потокам Amazon Kinesis вы можете использовать [учётные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [роль IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Подробную информацию о настройке роли IAM вы можете найти [в этом руководстве](./02_auth.md), где описано, как настроить роль для работы с ClickHouse Cloud.