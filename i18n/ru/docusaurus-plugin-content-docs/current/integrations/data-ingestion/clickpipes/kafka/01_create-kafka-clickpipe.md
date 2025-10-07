---
'sidebar_label': 'Создайте ваш первый Kafka ClickPipe'
'description': 'Пошаговое руководство по созданию вашего первого Kafka ClickPipe.'
'slug': '/integrations/clickpipes/kafka/create-your-first-kafka-clickpipe'
'sidebar_position': 1
'title': 'Создание вашего первого Kafka ClickPipe'
'doc_type': 'guide'
---
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import cp_table_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_table_settings.png';
import Image from '@theme/IdealImage';


# Создание вашего первого Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

> В этом руководстве мы проведем вас через процесс создания вашего первого Kafka ClickPipe.

<VerticalStepper type="numbered" headerLevel="h2">

## Перейдите к источникам данных {#1-load-sql-console}
Выберите кнопку `Источники данных` в левом меню и нажмите на "Настроить ClickPipe".
<Image img={cp_step0} alt="Выберите импорты" size="md"/>

## Выберите источник данных {#2-select-data-source}
Выберите ваш источник данных Kafka из списка.
<Image img={cp_step1} alt="Выберите тип источника данных" size="md"/>

## Настройка источника данных {#3-configure-data-source}
Заполните форму, предоставив вашему ClickPipe имя, описание (опционально), ваши учетные данные и другие детали подключения.
<Image img={cp_step2} alt="Заполните данные подключения" size="md"/>

## Настройка реестра схем (опционально) {#4-configure-your-schema-registry}
Для потоков Avro требуется действительная схема. См. [Реестры схем](./02_schema-registries.md) для получения дополнительной информации о том, как настроить реестр схем.

## Настройка обратной частной конечной точки (опционально) {#5-configure-reverse-private-endpoint}
Настройте обратную частную конечную точку, чтобы позволить ClickPipe подключаться к вашему кластеру Kafka с использованием AWS PrivateLink. См. нашу [документацию по AWS PrivateLink](../aws-privatelink.md) для получения дополнительной информации.

## Выберите вашу тему {#6-select-your-topic}
Выберите вашу тему, и интерфейс отобразит пример документа из темы.
<Image img={cp_step3} alt="Установите вашу тему" size="md"/>

## Настройка вашей целевой таблицы {#7-configure-your-destination-table}

На следующем шаге вы можете выбрать, хотите ли вы загружать данные в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя вашей таблицы, схему и настройки. Вы можете видеть предварительный просмотр ваших изменений в реальном времени в примере таблицы сверху.

<Image img={cp_step4a} alt="Установите таблицу, схему и настройки" size="md"/>

Вы также можете настроить расширенные настройки, используя предоставленные элементы управления.

<Image img={cp_table_settings} alt="Установите расширенные параметры" size="md"/>

## Настройка разрешений {#8-configure-permissions}
ClickPipe создаст специального пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя пользовательскую роль или одну из предопределенных ролей:
- `Полный доступ`: с полным доступом к кластеру. Это может быть полезно, если вы используете материализованное представление или словарь с целевой таблицей.
- `Только целевая таблица`: с разрешениями `INSERT` только для целевой таблицы.

<Image img={cp_step5} alt="Разрешения" size="md"/>

## Завершение настройки {#9-complete-setup}
Нажатие на "Создать ClickPipe" создаст и запустит ваш ClickPipe. Теперь он будет отображаться в разделе Источники данных.

<Image img={cp_overview} alt="Посмотреть обзор" size="md"/>

</VerticalStepper>