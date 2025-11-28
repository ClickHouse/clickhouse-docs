---
sidebar_label: 'Создайте свой первый ClickPipe для объектного хранилища'
description: 'Легко подключайте ваше объектное хранилище к ClickHouse Cloud.'
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

Object Storage ClickPipes обеспечивают простой и надёжный способ приёма данных из Amazon S3, Google Cloud Storage, Azure Blob Storage и DigitalOcean Spaces в ClickHouse Cloud. Поддерживаются как разовая, так и непрерывная ингестия с гарантией exactly-once.


# Создание первого ClickPipe для объектного хранилища {#creating-your-first-clickpipe}



## Предварительное условие {#prerequisite}

- Вы ознакомились с [вводной информацией о ClickPipes](../index.md).



## Перейдите к источникам данных {#1-load-sql-console}

В облачной консоли в меню слева нажмите кнопку `Data Sources`, затем — «Set up a ClickPipe».

<Image img={cp_step0} alt="Выбор импортов" size="lg" border/>



## Выберите источник данных {#2-select-data-source}

Выберите источник данных.

<Image img={cp_step1} alt="Выбор типа источника данных" size="lg" border/>



## Настройка ClickPipe {#3-configure-clickpipe}

Заполните форму, указав для ClickPipe имя, описание (необязательно), вашу IAM‑роль или учетные данные и URL‑адрес бакета.
Вы можете указать несколько файлов, используя шаблоны в стиле bash.
Дополнительную информацию см. в [документации по использованию шаблонов в путях](/integrations/clickpipes/object-storage/reference/#limitations).

<Image img={cp_step2_object_storage} alt="Заполните сведения о подключении" size="lg" border/>



## Выберите формат данных {#4-select-format}

В интерфейсе пользователя отобразится список файлов в указанном бакете.
Выберите формат данных (сейчас поддерживается подмножество форматов ClickHouse) и определите, хотите ли вы включить непрерывную ингестию.
([Подробнее об этом ниже](/integrations/clickpipes/object-storage/reference/#continuous-ingest)).

<Image img={cp_step3_object_storage} alt="Задайте формат данных и топик" size="lg" border/>



## Настройка таблицы, схемы и параметров {#5-configure-table-schema-settings}

На следующем шаге вы можете выбрать, нужно ли настраивать приём данных в новую таблицу ClickHouse или использовать существующую.
Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и параметры.
В верхней части экрана вы увидите предварительный просмотр изменений в примерной таблице в режиме реального времени.

<Image img={cp_step4a} alt="Настройка таблицы, схемы и параметров" size="lg" border/>

Вы также можете настроить расширенные параметры с помощью доступных элементов управления.

<Image img={cp_step4a3} alt="Настройка расширенных параметров" size="lg" border/>

Либо вы можете настроить приём данных в существующую таблицу ClickHouse.
В этом случае интерфейс позволит сопоставить поля из источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt="Использование существующей таблицы" size="lg" border/>

:::info
Вы также можете сопоставлять [виртуальные столбцы](../../sql-reference/table-functions/s3#virtual-columns), такие как `_path` или `_size`, с полями.
:::



## Настройка прав доступа {#6-configure-permissions}

Наконец, вы можете настроить права доступа для внутреннего пользователя ClickPipes.

**Права доступа:** ClickPipes создаст отдельного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, указав пользовательскую роль или одну из предопределённых ролей:
- `Full access`: с полным доступом к кластеру. Требуется, если вы используете материализованное представление или Dictionary с целевой таблицей.
- `Only destination table`: с правами `INSERT` только для целевой таблицы.

<Image img={cp_step5} alt="Permissions" size="lg" border/>



## Завершение настройки {#7-complete-setup}

При нажатии на «Complete Setup» система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt="Уведомление об успешной настройке" size="sm" border/>

<Image img={cp_remove} alt="Уведомление об удалении" size="lg" border/>

Сводная таблица предоставляет элементы управления для отображения образцов данных из таблицы-источника или целевой таблицы в ClickHouse.

<Image img={cp_destination} alt="Просмотр целевой таблицы" size="lg" border/>

А также элементы управления для удаления ClickPipe и отображения сводной информации о задаче приёма данных.

<Image img={cp_overview} alt="Просмотр сводки" size="lg" border/>

**Поздравляем!** вы успешно настроили свой первый ClickPipe.
Если это потоковый ClickPipe, он будет непрерывно работать, выполняя приём данных в режиме реального времени из вашего удалённого источника данных.
В противном случае он выполнит пакетный приём данных и завершится.
