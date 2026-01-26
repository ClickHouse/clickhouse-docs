---
sidebar_label: 'Создайте свой первый Kafka ClickPipe'
description: 'Пошаговое руководство по созданию первого Kafka ClickPipe.'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: 'Создание первого Kafka ClickPipe'
doc_type: 'guide'
keywords: ['создать kafka clickpipe', 'kafka', 'clickpipes', 'источники данных', 'руководство по настройке']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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

# Создание вашего первого Kafka ClickPipe \{#creating-your-first-kafka-clickpipe\}

> В этом руководстве мы шаг за шагом рассмотрим процесс создания вашего первого Kafka ClickPipe.

<VerticalStepper type="numbered" headerLevel="h2">

## Перейдите к источникам данных \{#1-load-sql-console\}
Выберите кнопку `Data Sources` в меню слева и нажмите кнопку «Set up a ClickPipe».
<Image img={cp_step0} alt="Выбор импортируемых данных" size="md"/>

## Выберите источник данных \{#2-select-data-source\}
Выберите ваш источник данных Kafka из списка.
<Image img={cp_step1} alt="Выбор типа источника данных" size="md"/>

## Настройте источник данных \{#3-configure-data-source\}
Заполните форму, указав для ClickPipe имя, описание (необязательно), учётные данные и другие параметры подключения.
<Image img={cp_step2} alt="Заполнение параметров подключения" size="md"/>

## Настройте реестр схем (необязательно) \{#4-configure-your-schema-registry\}
Для потоков Avro требуется корректная схема. См. раздел [Schema registries](./02_schema-registries.md) для получения дополнительной информации о настройке реестра схем.

## Настройте reverse private endpoint (необязательно) \{#5-configure-reverse-private-endpoint\}
Настройте Reverse Private Endpoint, чтобы разрешить ClickPipes подключаться к вашему кластеру Kafka с использованием AWS PrivateLink.
Дополнительную информацию см. в нашей [документации по AWS PrivateLink](../aws-privatelink.md).

## Выберите топик \{#6-select-your-topic\}
Выберите ваш топик, и в интерфейсе будет отображён пример сообщения из этого топика.
<Image img={cp_step3} alt="Выбор топика" size="md"/>

## Настройте целевую таблицу \{#7-configure-your-destination-table\}

На следующем шаге вы можете выбрать, хотите ли вы настроить приём данных в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и параметры. В верхней части экрана вы можете в реальном времени видеть предварительный просмотр изменений в образце таблицы.

<Image img={cp_step4a} alt="Задание таблицы, схемы и параметров" size="md"/>

Вы также можете настроить расширенные параметры с помощью доступных элементов управления.

<Image img={cp_table_settings} alt="Настройка расширенных параметров" size="md"/>

## Настройте права доступа \{#8-configure-permissions\}
ClickPipes создаст выделенного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя пользовательскую роль или одну из предопределённых ролей:
- `Full access`: с полным доступом к кластеру. Это может быть полезно, если вы используете Materialized View или словарь вместе с целевой таблицей.
- `Only destination table`: только с правами `INSERT` на целевую таблицу.

<Image img={cp_step5} alt="Права доступа" size="md"/>

## Завершите настройку \{#9-complete-setup\}
Нажатие кнопки «Create ClickPipe» создаст и запустит ваш ClickPipe. После этого он будет отображаться в разделе `Data Sources`.

<Image img={cp_overview} alt="Просмотр сводной информации" size="md"/>

</VerticalStepper>