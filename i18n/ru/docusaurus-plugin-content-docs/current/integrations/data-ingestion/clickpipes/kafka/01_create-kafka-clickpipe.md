---
sidebar_label: 'Создание первого Kafka ClickPipe'
description: 'Пошаговое руководство по созданию вашего первого Kafka ClickPipe.'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: 'Создание первого Kafka ClickPipe'
doc_type: 'guide'
keywords: ['create kafka clickpipe', 'kafka', 'clickpipes', 'data sources', 'setup guide']
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


## Переход к источникам данных {#1-load-sql-console}

Нажмите кнопку `Data Sources` в меню слева и выберите «Set up a ClickPipe».

<Image img={cp_step0} alt='Выбор импорта' size='md' />


## Выберите источник данных {#2-select-data-source}

Выберите источник данных Kafka из списка.

<Image img={cp_step1} alt='Выберите тип источника данных' size='md' />


## Настройка источника данных {#3-configure-data-source}

Заполните форму, указав имя для вашего ClickPipe, описание (необязательно), учетные данные и другие сведения о подключении.

<Image img={cp_step2} alt='Заполните сведения о подключении' size='md' />


## Настройка реестра схем (необязательно) {#4-configure-your-schema-registry}

Для потоков Avro требуется корректная схема. Подробнее о настройке реестра схем см. в разделе [Реестры схем](./02_schema-registries.md).


## Настройка обратной приватной конечной точки (опционально) {#5-configure-reverse-private-endpoint}

Настройте обратную приватную конечную точку (Reverse Private Endpoint), чтобы ClickPipes мог подключаться к вашему кластеру Kafka через AWS PrivateLink.
Подробнее см. в [документации по AWS PrivateLink](../aws-privatelink.md).


## Выберите топик {#6-select-your-topic}

Выберите топик, и в интерфейсе отобразится пример документа из этого топика.

<Image img={cp_step3} alt='Выберите топик' size='md' />


## Настройка целевой таблицы {#7-configure-your-destination-table}

На следующем шаге вы можете выбрать, загружать ли данные в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране для изменения имени таблицы, схемы и настроек. Предварительный просмотр изменений в реальном времени отображается в примере таблицы в верхней части экрана.

<Image img={cp_step4a} alt='Настройка таблицы, схемы и параметров' size='md' />

Вы также можете настроить дополнительные параметры с помощью предоставленных элементов управления

<Image img={cp_table_settings} alt='Настройка дополнительных параметров' size='md' />


## Настройка разрешений {#8-configure-permissions}

ClickPipes создаст выделенного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя пользовательскую роль или одну из предопределённых ролей:

- `Full access`: полный доступ к кластеру. Может быть полезно при использовании материализованных представлений или словарей с целевой таблицей.
- `Only destination table`: только разрешения `INSERT` для целевой таблицы.

<Image img={cp_step5} alt='Разрешения' size='md' />


## Завершение настройки {#9-complete-setup}

Нажмите «Create ClickPipe», чтобы создать и запустить ваш ClickPipe. Он появится в разделе Data Sources.

<Image img={cp_overview} alt='Просмотр обзора' size='md' />

</VerticalStepper>
