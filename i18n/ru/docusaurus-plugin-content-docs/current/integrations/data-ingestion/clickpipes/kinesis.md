---
sidebar_label: 'ClickPipes для Amazon Kinesis'
description: 'Подключайте источники данных Amazon Kinesis к ClickHouse Cloud без лишних усилий.'
slug: /integrations/clickpipes/kinesis
title: 'Интеграция Amazon Kinesis с ClickHouse Cloud'
doc_type: 'guide'
keywords: ['clickpipes', 'kinesis', 'streaming', 'aws', 'ингестия данных']
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

Вы ознакомились с [введением в ClickPipes](./index.md) и настроили [учётные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [роль IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Следуйте [руководству по доступу к Kinesis на основе ролей](./secure-kinesis.md), чтобы узнать, как настроить роль для работы с ClickHouse Cloud.

## Создание вашего первого ClickPipe \{#creating-your-first-clickpipe\}

1. Откройте SQL Console для своего сервиса ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. Выберите кнопку `Data Sources` в меню слева и нажмите «Set up a ClickPipe».

<Image img={cp_step0} alt="Выбор импорта" size="lg" border/>

3. Выберите источник данных.

<Image img={cp_step1} alt="Выбор типа источника данных" size="lg" border/>

4. Заполните форму, указав имя для ClickPipe, описание (необязательно), вашу роль IAM или учётные данные и другие параметры подключения.

<Image img={cp_step2_kinesis} alt="Заполнение параметров подключения" size="lg" border/>

5. Выберите Kinesis Stream и начальное смещение (offset). В интерфейсе будет показан пример документа из выбранного источника (Kafka topic и т. д.). Вы также можете включить Enhanced Fan-out для потоков Kinesis, чтобы повысить производительность и стабильность вашего ClickPipe (дополнительную информацию о Enhanced Fan-out можно найти [здесь](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)).

<Image img={cp_step3_kinesis} alt="Задание формата данных и топика" size="lg" border/>

6. На следующем шаге вы можете выбрать, хотите ли вы настраивать приём данных в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и настройки. В верхней части вы увидите предварительный просмотр изменений в образце таблицы в реальном времени.

<Image img={cp_step4a} alt="Настройка таблицы, схемы и параметров" size="lg" border/>

Вы также можете настроить расширенные параметры с помощью предоставленных элементов управления.

<Image img={cp_step4a3} alt="Настройка расширенных параметров" size="lg" border/>

7. В качестве альтернативы вы можете настроить приём данных в существующую таблицу ClickHouse. В этом случае интерфейс позволит сопоставить поля из источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt="Использование существующей таблицы" size="lg" border/>

8. Наконец, вы можете настроить права доступа для внутреннего пользователя ClickPipes.

**Permissions:** ClickPipes создаст отдельного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя настраиваемую роль или одну из предопределённых ролей:

- `Full access`: с полным доступом к кластеру. Может быть полезно, если вы используете materialized view или словарь с целевой таблицей.
    - `Only destination table`: с правами `INSERT` только для целевой таблицы.

<Image img={cp_step5} alt="Права доступа" border/>

9. Нажав «Complete Setup», вы зарегистрируете свой ClickPipe, и он появится в списке в сводной таблице.

<Image img={cp_success} alt="Уведомление об успешном создании" size="sm" border/>

<Image img={cp_remove} alt="Уведомление об удалении" size="lg" border/>

Сводная таблица предоставляет элементы управления для отображения примеров данных из источника или целевой таблицы в ClickHouse.

<Image img={cp_destination} alt="Просмотр целевой таблицы" size="lg" border/>

А также элементы управления для удаления ClickPipe и отображения сводной информации о задаче приёма.

<Image img={cp_overview} alt="Просмотр сводной информации" size="lg" border/>

10. **Поздравляем!** Вы успешно настроили свой первый ClickPipe. Если это потоковый ClickPipe, он будет работать непрерывно, выполняя приём данных в реальном времени из вашего удалённого источника данных. В противном случае он выполнит однократный пакетный приём данных и завершится.

## Поддерживаемые форматы данных \{#supported-data-formats\}

Поддерживаются следующие форматы:

- [JSON](/interfaces/formats/JSON)

## Поддерживаемые типы данных \{#supported-data-types\}

### Поддержка стандартных типов \{#standard-types-support\}

В ClickPipes на данный момент поддерживаются следующие типы данных ClickHouse:

- Базовые числовые типы — \[U\]Int8/16/32/64, Float32/64 и BFloat16
- Большие целочисленные типы — \[U\]Int128/256
- Типы Decimal
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64 (только часовые пояса UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы ClickHouse LowCardinality
- Map с ключами и значениями любого из вышеперечисленных типов (включая Nullable)
- Tuple и Array с элементами любого из вышеперечисленных типов (включая Nullable, только один уровень вложенности)
- Типы SimpleAggregateFunction (для целевых таблиц на AggregatingMergeTree или SummingMergeTree)

### Поддержка типа Variant \{#variant-type-support\}

Вы можете вручную указать тип Variant (например, `Variant(String, Int64, DateTime)`) для любого JSON-поля
во входящем потоке данных. Из-за того, как ClickPipes определяет корректный подтип Variant, в определении Variant
можно использовать только один целочисленный тип или тип даты и времени — например, `Variant(Int64, UInt32)` не поддерживается.

### Поддержка типа JSON \{#json-type-support\}

Поля JSON, которые всегда представляют собой объект JSON, могут быть сопоставлены с целевым столбцом типа JSON. Вам потребуется вручную изменить целевой столбец на нужный тип JSON, включая любые фиксированные или пропускаемые пути. 

## Виртуальные столбцы Kinesis \{#kinesis-virtual-columns\}

Для потока Kinesis поддерживаются следующие виртуальные столбцы. При создании новой целевой таблицы виртуальные столбцы можно добавить с помощью кнопки `Add Column`.

| Name             | Description                                                                    | Recommended Data Type |
|------------------|--------------------------------------------------------------------------------|-----------------------|
| _key             | Ключ партиции Kinesis                                                          | String                |
| _timestamp       | Приблизительное время поступления сообщения в Kinesis (точность до миллисекунд) | DateTime64(3)       |
| _stream          | Имя потока Kinesis                                                             | String                |
| _sequence_number | Порядковый номер сообщения Kinesis                                             | String                |
| _raw_message     | Полное сообщение Kinesis                                                       | String                |

Поле _raw_message можно использовать в случаях, когда требуется только полная JSON-запись Kinesis (например, при использовании функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для заполнения последующего материализованного представления). Для таких ClickPipes может повысить производительность удаление всех «невиртуальных» столбцов.

## Ограничения \{#limitations\}

- [DEFAULT](/sql-reference/statements/create/table#default) не поддерживается.
- Размер отдельных сообщений по умолчанию ограничен 8&nbsp;МБ (в несжатом виде) при использовании минимального размера реплики (XS) и 16&nbsp;МБ (в несжатом виде) для более крупных реплик. Сообщения, превышающие этот лимит, будут отклонены с ошибкой. Если вам требуются сообщения большего размера, свяжитесь со службой поддержки.

## Производительность \{#performance\}

### Пакетирование \{#batching\}

ClickPipes вставляет данные в ClickHouse пакетами. Это позволяет избежать создания слишком большого количества частей в базе данных, что может привести к снижению производительности кластера.

Пакеты вставляются, как только выполняется одно из следующих условий:

- Размер пакета достиг максимального значения (100 000 строк или 32 МБ на 1 ГБ памяти реплики)
- Пакет открыт в течение максимально допустимого времени (5 секунд)

### Задержка \{#latency\}

Задержка (определяемая как время между отправкой сообщения в поток Kinesis и моментом, когда оно становится доступным в ClickHouse) будет зависеть от ряда факторов (таких как задержка в Kinesis, задержка в сети, размер и формат сообщения). Описанное в разделе выше [пакетирование](#batching) также будет влиять на задержку. Мы всегда рекомендуем тестировать ваш конкретный сценарий использования, чтобы понять, какой уровень задержки вы можете ожидать.

Если у вас есть жёсткие требования по низкой задержке, пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes).

### Масштабирование \{#scaling\}

ClickPipes для Kinesis спроектирован для горизонтального и вертикального масштабирования. По умолчанию создаётся группа потребителей с одним потребителем. Это можно настроить при создании ClickPipe или в любой момент позже в **Settings** -> **Advanced Settings** -> **Scaling**.

ClickPipes обеспечивает высокую доступность благодаря архитектуре, распределённой по зонам доступности.
Для этого требуется масштабирование как минимум до двух потребителей.

Независимо от числа запущенных потребителей, отказоустойчивость предусмотрена изначально.
Если потребитель или его базовая инфраструктура выходит из строя,
ClickPipe автоматически перезапустит потребителя и продолжит обработку сообщений.

## Аутентификация \{#authentication\}

Для доступа к потокам Amazon Kinesis вы можете использовать [учётные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [роль IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Подробные сведения о настройке роли IAM см. в [этом руководстве](./secure-kinesis.md), где описано, как настроить роль для работы с ClickHouse Cloud.