---
sidebar_label: ClickPipes для Amazon Kinesis
description: Бесшовное подключение ваших источников данных Amazon Kinesis к ClickHouse Cloud.
slug: /integrations/clickpipes/kinesis
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


# Интеграция Amazon Kinesis с ClickHouse Cloud
## Требования {#prerequisite}
Вы ознакомились с [введением в ClickPipes](./index.md) и настроили [учетные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [IAM роль](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Следуйте [руководству по доступу на основе ролей Kinesis](./secure-kinesis.md) для получения информации о том, как настроить роль, которая работает с ClickHouse Cloud.

## Создание вашего первого ClickPipe {#creating-your-first-clickpipe}

1. Получите доступ к SQL Console для вашей службы ClickHouse Cloud.

<img src={cp_service} alt="Служба ClickPipes" />

2. Выберите кнопку `Источники данных` в левом меню и нажмите на "Настроить ClickPipe"

<img src={cp_step0} alt="Выберите импорты" />

3. Выберите ваш источник данных.

<img src={cp_step1} alt="Выбор типа источника данных" />

4. Заполните форму, указав вашему ClickPipe имя, описание (по желанию), вашу IAM роль или учетные данные и другие детали подключения.

<img src={cp_step2_kinesis} alt="Заполните данные для подключения" />

5. Выберите поток Kinesis и начальное смещение. Интерфейс отобразит пример документа из выбранного источника (тема Kafka и т.д.). Вы также можете включить Enhanced Fan-out для потоков Kinesis, чтобы улучшить производительность и стабильность вашего ClickPipe (больше информации о Enhanced Fan-out можно найти [здесь](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout))

<img src={cp_step3_kinesis} alt="Установите формат данных и тему" />

6. На следующем шаге вы можете выбрать, хотите ли вы загружать данные в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя, схему и настройки вашей таблицы. Вы можете увидеть предварительный просмотр ваших изменений в образце таблицы вверху.

<img src={cp_step4a} alt="Установите таблицу, схему и настройки" />

  Вы также можете настроить дополнительные параметры, используя предоставленные элементы управления

<img src={cp_step4a3} alt="Настройте дополнительные параметры" />

7. В качестве альтернативы вы можете решить загружать ваши данные в существующую таблицу ClickHouse. В этом случае интерфейс позволит вам сопоставить поля из источника с полями ClickHouse в выбранной целевой таблице.

<img src={cp_step4b} alt="Используйте существующую таблицу" />

8. Наконец, вы можете настроить разрешения для внутреннего пользователя ClickPipes.

  **Разрешения:** ClickPipes создаст отдельного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя настраиваемую роль или одну из предопределенных:
    - `Полный доступ`: с полным доступом к кластеру. Это может быть полезно, если вы используете Materialized View или Dictionary с целевой таблицей.
    - `Только целевая таблица`: с разрешениями `INSERT` только для целевой таблицы.

<img src={cp_step5} alt="Разрешения" />

9. Нажимая "Завершить настройку", система зарегистрирует ваш ClickPipe, и вы увидите его в сводной таблице.

<img src={cp_success} alt="Уведомление об успешном завершении" />

<img src={cp_remove} alt="Уведомление об удалении" />

  Сводная таблица предоставляет элементы управления для отображения образцовых данных из источника или целевой таблицы в ClickHouse

<img src={cp_destination} alt="Просмотр целевой таблицы" />

  А также элементы управления для удаления ClickPipe и отображения сводки задания по загрузке.

<img src={cp_overview} alt="Просмотр обзора" />

10. **Поздравляем!** Вы успешно настроили ваш первый ClickPipe. Если это потоковый ClickPipe, он будет работать постоянно, загружая данные в реальном времени из вашего удаленного источника данных. В противном случае он загрузит пакет и завершит работу.


## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаемые форматы:
- [JSON](../../../interfaces/formats.md/#json)

## Поддерживаемые типы данных {#supported-data-types}

В ClickPipes в настоящее время поддерживаются следующие типы данных ClickHouse:

- Основные числовые типы - \[U\]Int8/16/32/64 и Float32/64
- Большие целочисленные типы - \[U\]Int128/256
- Десятичные типы
- Логический
- Строка
- FixedString
- Дата, Date32
- DateTime, DateTime64 (только часовые пояса UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы LowCardinality ClickHouse
- Map с ключами и значениями, использующими любые из вышеуказанных типов (включая Nullable)
- Tuple и Array с элементами, использующими любые из вышеуказанных типов (включая Nullable, только один уровень глубины)

## Виртуальные колонки Kinesis {#kinesis-virtual-columns}

Следующие виртуальные колонки поддерживаются для потока Kinesis. При создании новой целевой таблицы виртуальные колонки могут быть добавлены с помощью кнопки `Добавить колонку`.

| Название          | Описание                                                   | Рекомендуемый тип данных |
|-------------------|-----------------------------------------------------------|-------------------------|
| _key              | Ключ партиции Kinesis                                     | String                  |
| _timestamp        | Приблизительное время прибытия Kinesis (миллисекундная точность) | DateTime64(3)           |
| _stream           | Имя потока Kinesis                                        | String                  |
| _sequence_number  | Номер последовательности Kinesis                           | String                  |
| _raw_message      | Полное сообщение Kinesis                                   | String                  |

Поле _raw_message может использоваться в случаях, когда требуется только полный JSON-запись Kinesis (например, с использованием функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для заполнения нижестоящего материализованного представления). Для таких труб может быть целесообразным улучшить производительность ClickPipes, удалив все "невиртуальные" колонки.

## Ограничения {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) не поддерживается.

## Производительность {#performance}

### Пакетирование {#batching}
ClickPipes вставляет данные в ClickHouse пакетами. Это необходимо для предотвращения создания слишком большого количества частей в базе данных, что может привести к проблемам с производительностью в кластере.

Пакеты вставляются, когда выполнено одно из следующих условий:
- Размер пакета достиг максимального размера (100,000 строк или 20MB)
- Пакет открыт максимальное время (5 секунд)

### Задержка {#latency}

Задержка (определяемая как время между отправкой сообщения Kinesis в поток и доступностью сообщения в ClickHouse) будет зависеть от множества факторов (т.е. задержка Kinesis, задержка сети, размер/формат сообщения). Описание [пакетирования](#batching) в предыдущем разделе также повлияет на задержку. Мы всегда рекомендуем тестировать ваш конкретный случай использования, чтобы понять ожидаемую задержку.

Если у вас есть конкретные требования к низкой задержке, пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes).

### Масштабирование {#scaling}

ClickPipes для Kinesis разработан для горизонтального масштабирования. По умолчанию мы создаем группу потребителей с одним потребителем. Это можно изменить с помощью элементов управления масштабированием в представлении деталей ClickPipe.

ClickPipes обеспечивает высокую доступность с распределенной архитектурой по зонам доступности. Это требует масштабирования как минимум до двух потребителей.

Независимо от количества запущенных потребителей, отказоустойчивость предусмотрена по дизайну. Если потребитель или его инфраструктура выходит из строя, ClickPipe автоматически перезапустит потребителя и продолжит обработку сообщений.

## Аутентификация {#authentication}

Для доступа к потокам Amazon Kinesis вы можете использовать [учетные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [IAM роль](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Для получения более подробной информации о том, как настроить IAM роль, вы можете [обратиться к этому руководству](./secure-kinesis.md) для получения информации о том, как настроить роль, которая работает с ClickHouse Cloud.
