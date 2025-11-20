---
sidebar_label: 'Создайте свой первый ClickPipe для объектного хранилища'
description: 'Бесшовно подключайте объектное хранилище к ClickHouse Cloud.'
slug: /integrations/clickpipes/object-storage
title: 'Создание первого ClickPipe для объектного хранилища'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_object_storage.png';
import cp_step3_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_object_storage.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';

ClickPipes для объектного хранилища обеспечивают простой и устойчивый к сбоям способ загрузки данных из Amazon S3, Google Cloud Storage, Azure Blob Storage и DigitalOcean Spaces в ClickHouse Cloud. Поддерживаются как разовая, так и непрерывная загрузка с семантикой exactly-once.


# Создание первого ClickPipe для объектного хранилища {#creating-your-first-clickpipe}


## Предварительные требования {#prerequisite}

- Вы ознакомились с [введением в ClickPipes](../index.md).


## Переход к источникам данных {#1-load-sql-console}

В облачной консоли выберите кнопку `Data Sources` в меню слева и нажмите «Set up a ClickPipe»

<Image img={cp_step0} alt='Выбор импорта' size='lg' border />


## Выберите источник данных {#2-select-data-source}

Выберите источник данных.

<Image img={cp_step1} alt='Выберите тип источника данных' size='lg' border />


## Настройка ClickPipe {#3-configure-clickpipe}

Заполните форму, указав имя для вашего ClickPipe, описание (необязательно), IAM-роль или учетные данные и URL корзины.
Вы можете указать несколько файлов, используя подстановочные символы в стиле bash.
Подробнее см. в [документации по использованию подстановочных символов в пути](/integrations/clickpipes/object-storage/reference/#limitations).

<Image
  img={cp_step2_object_storage}
  alt='Заполните данные подключения'
  size='lg'
  border
/>


## Выбор формата данных {#4-select-format}

В интерфейсе отобразится список файлов в указанном бакете.
Выберите формат данных (в настоящее время поддерживается подмножество форматов ClickHouse) и укажите, нужно ли включить непрерывную загрузку.
([Подробнее ниже](/integrations/clickpipes/object-storage/reference/#continuous-ingest)).

<Image
  img={cp_step3_object_storage}
  alt='Настройка формата данных и топика'
  size='lg'
  border
/>


## Настройка таблицы, схемы и параметров {#5-configure-table-schema-settings}

На следующем шаге можно выбрать, загружать ли данные в новую таблицу ClickHouse или использовать существующую.
Следуйте инструкциям на экране для изменения имени таблицы, схемы и параметров.
Предварительный просмотр изменений в реальном времени отображается в примере таблицы в верхней части экрана.

<Image img={cp_step4a} alt='Настройка таблицы, схемы и параметров' size='lg' border />

Также можно настроить дополнительные параметры с помощью предоставленных элементов управления

<Image img={cp_step4a3} alt='Настройка дополнительных параметров' size='lg' border />

Кроме того, можно загрузить данные в существующую таблицу ClickHouse.
В этом случае интерфейс позволит сопоставить поля источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt='Использование существующей таблицы' size='lg' border />

:::info
Также можно сопоставить [виртуальные столбцы](../../sql-reference/table-functions/s3#virtual-columns), такие как `_path` или `_size`, с полями.
:::


## Настройка прав доступа {#6-configure-permissions}

На последнем шаге можно настроить права доступа для внутреннего пользователя ClickPipes.

**Права доступа:** ClickPipes создаст выделенного пользователя для записи данных в целевую таблицу. Вы можете назначить этому внутреннему пользователю роль — пользовательскую или одну из предопределённых:

- `Full access`: полный доступ к кластеру. Требуется при использовании материализованных представлений или словарей с целевой таблицей.
- `Only destination table`: права `INSERT` только для целевой таблицы.

<Image img={cp_step5} alt='Права доступа' size='lg' border />


## Завершение настройки {#7-complete-setup}

Нажав на «Complete Setup», система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt='Уведомление об успешном выполнении' size='sm' border />

<Image img={cp_remove} alt='Уведомление об удалении' size='lg' border />

Сводная таблица предоставляет элементы управления для отображения примеров данных из источника или целевой таблицы в ClickHouse

<Image img={cp_destination} alt='Просмотр целевой таблицы' size='lg' border />

А также элементы управления для удаления ClickPipe и отображения сводки задачи приёма данных.

<Image img={cp_overview} alt='Просмотр обзора' size='lg' border />

**Поздравляем!** Вы успешно настроили свой первый ClickPipe.
Если это потоковый ClickPipe, он будет непрерывно работать, принимая данные в реальном времени из вашего удалённого источника данных.
В противном случае он обработает пакет данных и завершит работу.
