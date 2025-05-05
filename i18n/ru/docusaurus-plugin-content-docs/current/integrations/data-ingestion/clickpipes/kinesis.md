---
sidebar_label: 'ClickPipes для Amazon Kinesis'
description: 'Бесшовное подключение ваших источников данных Amazon Kinesis к ClickHouse Cloud.'
slug: /integrations/clickpipes/kinesis
title: 'Интеграция Amazon Kinesis с ClickHouse Cloud'
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
Вы ознакомились с [вводом в ClickPipes](./index.md) и настроили [учетные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [IAM роль](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Следуйте руководству по [контролю доступа на основе ролей для Kinesis](./secure-kinesis.md), чтобы узнать, как настроить роль, которая будет работать с ClickHouse Cloud.

## Создание вашего первого ClickPipe {#creating-your-first-clickpipe}

1. Получите доступ к SQL консоли вашего сервиса ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. Выберите кнопку `Data Sources` в левом меню и нажмите "Настроить ClickPipe"

<Image img={cp_step0} alt="Выбор импорта" size="lg" border/>

3. Выберите ваш источник данных.

<Image img={cp_step1} alt="Выбор типа источника данных" size="lg" border/>

4. Заполните форму, предоставив вашему ClickPipe имя, описание (по желанию), вашу IAM роль или учетные данные, а также другие детали подключения.

<Image img={cp_step2_kinesis} alt="Заполнение деталей подключения" size="lg" border/>

5. Выберите поток Kinesis и начальное смещение. Интерфейс отобразит пример документа из выбранного источника (тема Kafka и т.д.). Вы также можете включить Enhanced Fan-out для потоков Kinesis, чтобы улучшить производительность и стабильность вашего ClickPipe (Дополнительную информацию о Enhanced Fan-out можно найти [здесь](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout))

<Image img={cp_step3_kinesis} alt="Настройка формата данных и темы" size="lg" border/>

6. На следующем шаге вы можете выбрать, хотите ли вы загружать данные в новую таблицу ClickHouse или использовать уже существующую. Следуйте инструкциям на экране, чтобы изменить имя вашей таблицы, схему и настройки. Вы можете увидеть реальный предварительный просмотр ваших изменений в образце таблицы сверху.

<Image img={cp_step4a} alt="Настройка таблицы, схемы и настроек" size="lg" border/>

  Вы также можете настроить расширенные параметры, используя предоставленные элементы управления

<Image img={cp_step4a3} alt="Настройка расширенных элементов управления" size="lg" border/>

7. В качестве альтернативы вы можете решить, что хотите загружать ваши данные в уже существующую таблицу ClickHouse. В этом случае интерфейс позволит вам сопоставить поля из источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt="Использование существующей таблицы" size="lg" border/>

8. Наконец, вы можете настроить разрешения для внутреннего пользователя ClickPipes.

  **Разрешения:** ClickPipes создаст выделенного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя пользовательскую роль или одну из предопределенных ролей:
    - `Full access`: с полным доступом к кластеру. Это может быть полезно, если вы используете материализованное представление или словарь с целевой таблицей.
    - `Only destination table`: с разрешениями `INSERT` только в целевую таблицу.

<Image img={cp_step5} alt="Разрешения" border/>

9. Нажав на "Завершить настройку", система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt="Уведомление об успехе" size="sm" border/>

<Image img={cp_remove} alt="Уведомление о удалении" size="lg" border/>

  Сводная таблица предоставляет элементы управления для отображения примерных данных из источника или целевой таблицы в ClickHouse

<Image img={cp_destination} alt="Просмотр назначения" size="lg" border/>

  А также элементы управления для удаления ClickPipe и отображения сводки задания по загрузке.

<Image img={cp_overview} alt="Просмотр обзора" size="lg" border/>

10. **Поздравляем!** Вы успешно настроили ваш первый ClickPipe. Если это потоковый ClickPipe, он будет работать непрерывно, загружая данные в реальном времени из вашего удаленного источника данных. В противном случае он загрузит пакет и завершит.


## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаемые форматы:
- [JSON](../../../interfaces/formats.md/#json)

## Поддерживаемые типы данных {#supported-data-types}

В настоящее время в ClickPipes поддерживаются следующие типы данных ClickHouse:

- Базовые числовые типы - \[U\]Int8/16/32/64 и Float32/64
- Большие целочисленные типы - \[U\]Int128/256
- Десятичные типы
- Логический
- Строка
- FixedString
- Дата, Date32
- DateTime, DateTime64 (только временные зоны UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы LowCardinality в ClickHouse
- Map с ключами и значениями используя любой из вышеупомянутых типов (включая Nullables)
- Tuple и Array с элементами, используя любой из вышеупомянутых типов (включая Nullables, только одна глубина)

## Виртуальные колонки Kinesis {#kinesis-virtual-columns}

Поддерживаются следующие виртуальные колонки для потоков Kinesis. При создании новой целевой таблицы виртуальные колонки могут быть добавлены с помощью кнопки `Add Column`.

| Название          | Описание                                                   | Рекомендуемый тип данных |
|------------------|-----------------------------------------------------------|--------------------------|
| _key             | Ключ партиции Kinesis                                     | String                   |
| _timestamp       | Приблизительное время прибытия Kinesis (миллисекундная точность) | DateTime64(3)           |
| _stream          | Имя потока Kinesis                                        | String                   |
| _sequence_number | Номер последовательности Kinesis                           | String                   |
| _raw_message     | Полное сообщение Kinesis                                   | String                   |

Поле _raw_message может быть использовано в случаях, когда требуется только полный JSON-запись Kinesis (например, используя функции ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для заполнения нижестоящего материализованного представления). Для таких трубок может улучшить производительность ClickPipes удаление всех "не виртуальных" колонок.

## Ограничения {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) не поддерживается.

## Производительность {#performance}

### Пакетная обработка {#batching}
ClickPipes вставляет данные в ClickHouse пакетами. Это делается для того, чтобы избежать создания слишком большого количества частей в базе данных, что может привести к проблемам с производительностью кластера.

Пакеты вставляются, когда выполнено одно из следующих условий:
- Размер пакета достиг максимального размера (100,000 строк или 20MB)
- Пакет открыт максимальное время (5 секунд)

### Задержка {#latency}

Задержка (определяемая как время между отправкой сообщения Kinesis в поток и доступностью сообщения в ClickHouse) будет зависеть от ряда факторов (то есть задержки Kinesis, задержки сети, размера/формата сообщения). Пакетная обработка, описанная в разделе выше, также повлияет на задержку. Мы всегда рекомендуем тестировать ваш конкретный сценарий, чтобы понять, какую задержку можно ожидать.

Если у вас есть конкретные требования к низкой задержке, пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes).

### Масштабирование {#scaling}

ClickPipes для Kinesis разработан для горизонтального масштабирования. По умолчанию мы создаем группу потребителей с одним потребителем.
Это можно изменить с помощью элементов управления масштабированием в окне деталей ClickPipe.

ClickPipes обеспечивает высокую доступность с распределенной архитектурой по зонам доступности.
Это требует масштабирования до как минимум двух потребителей.

Независимо от количества работающих потребителей, отказоустойчивость предусмотрена по замыслу.
Если потребитель или его базовая инфраструктура выйдут из строя,
ClickPipe автоматически перезапустит потребителя и продолжит обработку сообщений.

## Аутентификация {#authentication}

Для доступа к потокам Amazon Kinesis вы можете использовать [учетные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [IAM роль](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Для получения дополнительной информации о том, как настроить IAM роль, вы можете [обратиться к этому руководству](./secure-kinesis.md), чтобы получить информацию о том, как настроить роль, которая будет работать с ClickHouse Cloud.
