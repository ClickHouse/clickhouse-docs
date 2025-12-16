---
sidebar_label: 'Создайте свой первый Kafka ClickPipe'
description: 'Пошаговое руководство по созданию первого Kafka ClickPipe.'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: 'Создание первого Kafka ClickPipe'
doc_type: 'guide'
keywords: ['создать kafka clickpipe', 'kafka', 'clickpipes', 'источники данных', 'руководство по настройке']
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


# Создание первого Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

> В этом руководстве описан процесс создания первого Kafka ClickPipe.

<VerticalStepper type="numbered" headerLevel="h2">


## Перейдите к источникам данных {#1-load-sql-console}
На панели слева нажмите кнопку `Data Sources` и выберите "Set up a ClickPipe".
<Image img={cp_step0} alt="Select imports" size="md"/>



## Выберите источник данных {#2-select-data-source}
Выберите источник данных Kafka из списка.
<Image img={cp_step1} alt="Выберите тип источника данных" size="md"/>



## Настройте источник данных {#3-configure-data-source}
Заполните форму, указав для ClickPipe имя, при необходимости описание, ваши учетные данные и другие параметры подключения.
<Image img={cp_step2} alt="Заполните параметры подключения" size="md"/>



## Настройте реестр схем (необязательно) {#4-configure-your-schema-registry}
Для потоков Avro требуется корректная схема. См. раздел [Schema registries](./02_schema-registries.md) для получения подробной информации о том, как настроить реестр схем.



## Настройка обратной приватной конечной точки (необязательно) {#5-configure-reverse-private-endpoint}
Настройте обратную приватную конечную точку, чтобы ClickPipes могли подключаться к вашему кластеру Kafka через AWS PrivateLink.
Дополнительную информацию см. в нашей [документации по AWS PrivateLink](../aws-privatelink.md).



## Выберите топик {#6-select-your-topic}
Выберите топик, и в интерфейсе отобразится пример документа из этого топика.
<Image img={cp_step3} alt="Выбор топика" size="md"/>



## Настройте целевую таблицу {#7-configure-your-destination-table}

На следующем шаге вы можете выбрать, хотите ли вы настроить приём данных в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и параметры. В верхней части экрана вы можете в реальном времени видеть предварительный просмотр изменений в образце таблицы.

<Image img={cp_step4a} alt="Задание таблицы, схемы и параметров" size="md"/>

Вы также можете настроить расширенные параметры с помощью доступных элементов управления.

<Image img={cp_table_settings} alt="Настройка расширенных параметров" size="md"/>



## Настройка прав доступа {#8-configure-permissions}
ClickPipes создаёт отдельного пользователя для записи данных в целевую таблицу. Вы можете назначить этому внутреннему пользователю роль, выбрав пользовательскую или одну из предопределённых ролей:
- `Full access`: с полным доступом к кластеру. Эта роль может быть полезна, если вы используете материализованное представление или словарь Dictionary с целевой таблицей.
- `Only destination table`: с правом `INSERT` только для целевой таблицы.

<Image img={cp_step5} alt="Права доступа" size="md"/>



## Завершение настройки {#9-complete-setup}

Нажмите «Create ClickPipe», чтобы создать и запустить ваш ClickPipe. Он появится в разделе Data Sources.

<Image img={cp_overview} alt='Просмотр обзора' size='md' />

</VerticalStepper>
