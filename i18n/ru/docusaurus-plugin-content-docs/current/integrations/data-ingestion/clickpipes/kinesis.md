---
'sidebar_label': 'ClickPipes для Amazon Kinesis'
'description': 'Бесшовно подключите ваши источники данных Amazon Kinesis к ClickHouse
  Cloud.'
'slug': '/integrations/clickpipes/kinesis'
'title': 'Интеграция Amazon Kinesis с ClickHouse Cloud'
'doc_type': 'guide'
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
## Предварительные условия {#prerequisite}
Вы ознакомились с [введением в ClickPipes](./index.md) и настроили [учетные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [IAM роль](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Следуйте [руководству по контролю доступа на основе ролей Kinesis](./secure-kinesis.md) для получения информации о том, как настроить роль, которая будет работать с ClickHouse Cloud.

## Создание вашего первого ClickPipe {#creating-your-first-clickpipe}

1. Получите доступ к SQL Console для вашего ClickHouse Cloud Service.

<Image img={cp_service} alt="Служба ClickPipes" size="lg" border/>

2. Выберите кнопку `Data Sources` в левом меню и нажмите "Настроить ClickPipe"

<Image img={cp_step0} alt="Выберите импорт" size="lg" border/>

3. Выберите источник данных.

<Image img={cp_step1} alt="Выберите тип источника данных" size="lg" border/>

4. Заполните форму, указав имя вашего ClickPipe, описание (по желанию), вашу роль IAM или учетные данные, а также другие данные подключения.

<Image img={cp_step2_kinesis} alt="Заполните данные подключения" size="lg" border/>

5. Выберите поток Kinesis и начальное смещение. Интерфейс отобразит образец документа из выбранного источника (тема Kafka и др.). Вы также можете включить расширенный Fan-out для потоков Kinesis, чтобы улучшить производительность и стабильность вашего ClickPipe (Дополнительную информацию о расширенном Fan-out можно найти [здесь](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout))

<Image img={cp_step3_kinesis} alt="Установите формат данных и тему" size="lg" border/>

6. На следующем шаге вы можете выбрать, хотите ли вы загружать данные в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и настройки. Вы можете видеть предварительный просмотр ваших изменений в образце таблицы вверху.

<Image img={cp_step4a} alt="Установите таблицу, схему и настройки" size="lg" border/>

  Вы также можете настроить расширенные параметры, используя предоставленные элементы управления.

<Image img={cp_step4a3} alt="Установите расширенные параметры" size="lg" border/>

7. Альтернативно, вы можете решить загрузить ваши данные в существующую таблицу ClickHouse. В этом случае интерфейс позволит вам сопоставить поля из источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt="Использовать существующую таблицу" size="lg" border/>

8. Наконец, вы можете настроить разрешения для внутреннего пользователя ClickPipes.

  **Разрешения:** ClickPipes создаст специального пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя кастомную роль или одну из предопределенных ролей:
    - `Полный доступ`: с полным доступом к кластеру. Это может быть полезно, если вы используете материализованное представление или словарь с целевой таблицей.
    - `Только целевая таблица`: с разрешением `INSERT` только для целевой таблицы.

<Image img={cp_step5} alt="Разрешения" border/>

9. Нажав "Завершить настройку", система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt="Уведомление об успешном завершении" size="sm" border/>

<Image img={cp_remove} alt="Уведомление об удалении" size="lg" border/>

  Сводная таблица предоставляет элементы управления для отображения образца данных из источника или целевой таблицы в ClickHouse.

<Image img={cp_destination} alt="Посмотреть целевую таблицу" size="lg" border/>

  А также элементы управления для удаления ClickPipe и отображения сводки задания по загрузке.

<Image img={cp_overview} alt="Посмотреть сводку" size="lg" border/>

10. **Поздравляем!** Вы успешно настроили ваш первый ClickPipe. Если это потоковый ClickPipe, он будет работать непрерывно, загружая данные в реальном времени из вашего удаленного источника данных. В противном случае он загрузит пакет и завершит работу.

## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаемые форматы:
- [JSON](../../../interfaces/formats.md/#json)

## Поддерживаемые типы данных {#supported-data-types}

### Поддержка стандартных типов {#standard-types-support}
В ClickPipes в настоящее время поддерживаются следующие типы данных ClickHouse:

- Основные числовые типы - \[U\]Int8/16/32/64, Float32/64 и BFloat16
- Большие целочисленные типы - \[U\]Int128/256
- Десятичные типы
- Логический
- Строка
- FixedString
- Дата, Date32
- DateTime, DateTime64 (только UTC-часовые зоны)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы ClickHouse LowCardinality
- Map с ключами и значениями, использующими любой из указанных выше типов (включая Nullables)
- Tuple и Array с элементами, использующими любой из указанных выше типов (включая Nullables, только одна глубина)
- Типы SimpleAggregateFunction (для назначения AggregatingMergeTree или SummingMergeTree)

### Поддержка типа Variant {#variant-type-support}
Вы можете вручную указать тип Variant (например, `Variant(String, Int64, DateTime)`) для любого поля JSON в потоке исходных данных. Из-за способа, которым ClickPipes определяет правильный подтип variant, в определении variant может быть использован только один целочисленный или временной тип - например, `Variant(Int64, UInt32)` не поддерживается.

### Поддержка типа JSON {#json-type-support}
Поля JSON, которые всегда являются объектом JSON, могут быть назначены столбцу назначения JSON. Вам нужно будет вручную изменить столбец назначения на необходимый тип JSON, включая любые фиксированные или пропущенные пути.

## Виртуальные столбцы Kinesis {#kinesis-virtual-columns}

Для потока Kinesis поддерживаются следующие виртуальные столбцы. При создании новой целевой таблицы виртуальные столбцы могут быть добавлены, используя кнопку `Добавить столбец`.

| Имя               | Описание                                                      | Рекомендуемый тип данных |
|-------------------|---------------------------------------------------------------|--------------------------|
| _key              | Ключ партиции Kinesis                                        | String                   |
| _timestamp        | Приблизительное время прибытия Kinesis (миллисекундная точность) | DateTime64(3)            |
| _stream           | Имя потока Kinesis                                           | String                   |
| _sequence_number  | Номер последовательности Kinesis                              | String                   |
| _raw_message      | Полное сообщение Kinesis                                     | String                   |

Поле _raw_message может быть использовано в случаях, когда требуется только полная запись JSON Kinesis (например, используя функции ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для заполнения материального представления downstream). Для таких потоков может повысить производительность ClickPipes удаление всех "невиртуальных" столбцов.

## Ограничения {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) не поддерживается.

## Производительность {#performance}

### Пакетная обработка {#batching}
ClickPipes вставляет данные в ClickHouse пакетами. Это сделано для того, чтобы избежать создания слишком большого количества частей в базе данных, что может привести к проблемам с производительностью в кластере.

Пакеты вставляются, когда выполнено одно из следующих условий:
- Размер пакета достиг максимального размера (100,000 строк или 32MB на 1GB памяти реплики)
- Пакет открыт максимальное количество времени (5 секунд)

### Задержка {#latency}

Задержка (определяемая как время между отправкой сообщения Kinesis в поток и доступностью сообщения в ClickHouse) будет зависеть от множества факторов (например, задержка Kinesis, задержка сети, размер/формат сообщения). Описанная в предыдущем разделе [пакетная обработка](#batching) также повлияет на задержку. Мы всегда рекомендуем тестировать ваш конкретный сценарий, чтобы понять, какую задержку вы можете ожидать.

Если у вас есть специфические требования к низкой задержке, пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact?loc=clickpipes).

### Масштабирование {#scaling}

ClickPipes для Kinesis разработан для горизонтального и вертикального масштабирования. По умолчанию мы создаем группу потребителей с одним потребителем. Это может быть настроено во время создания ClickPipe или в любой другой момент в разделе **Настройки** -> **Расширенные настройки** -> **Масштабирование**.

ClickPipes обеспечивает высокую доступность с архитектурой, распределенной по зонам доступности.
Это требует масштабирования как минимум до двух потребителей.

Независимо от количества работающих потребителей, отказоустойчивость доступна по умолчанию.
Если потребитель или его инфраструктура потерпит неудачу,
ClickPipe автоматически перезапустит потребителя и продолжит обработку сообщений.

## Аутентификация {#authentication}

Для доступа к потокам Amazon Kinesis вы можете использовать [учетные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [IAM роль](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html). Для получения дополнительных деталей о том, как настроить IAM роль, вы можете [обратиться к этому руководству](./secure-kinesis.md) для получения информации о том, как настроить роль, которая будет работать с ClickHouse Cloud.
