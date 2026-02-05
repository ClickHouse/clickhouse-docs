---
sidebar_label: 'Начало работы'
description: 'Пошаговое руководство по созданию вашего первого ClickPipe для BigQuery.'
slug: /integrations/clickpipes/bigquery/get-started
title: 'Создание вашего первого ClickPipe для BigQuery'
doc_type: 'guide'
---

import IntroClickPipe from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/clickpipes/bigquery/_intro.md';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step3.png';
import cp_step4 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step4.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step5.png';
import Image from '@theme/IdealImage';


# Создание первого BigQuery ClickPipe \{#creating-your-first-bigquery-clickpipe\}

<IntroClickPipe/>

## Предварительные требования \{#pre-requisites\}

* У вас должны быть привилегии для управления [service accounts](https://docs.cloud.google.com/iam/docs/service-account-overview) и [IAM roles](https://docs.cloud.google.com/iam/docs/roles-overview) в вашем GCP-проекте, либо вам нужно обратиться за помощью к администратору. Мы рекомендуем создать отдельный service account с минимально необходимым набором [permissions](./01_overview.md#permissions) в соответствии с [официальной документацией](https://docs.cloud.google.com/iam/docs/service-accounts-create).

* Для первичной загрузки требуется Google Cloud Storage (GCS) bucket, предоставленный пользователем, для промежуточного хранения (staging). Мы рекомендуем создать отдельный bucket для вашего ClickPipe согласно [официальной документации](https://docs.cloud.google.com/storage/docs/creating-buckets). В дальнейшем промежуточный bucket будет предоставляться и управляться ClickPipes.

<VerticalStepper type="numbered" headerLevel="h2">

## Выбор источника данных \{#1-select-the-data-source\}

**1.** В ClickHouse Cloud выберите **Data sources** в основном навигационном меню и нажмите **Create ClickPipe**.

    <Image img={cp_step0} alt="Выбор импорта" size="lg" border/>

**2.** Нажмите на плитку **BigQuery**.

    <Image img={cp_step1} alt="Выбор плитки BigQuery" size="lg" border/>

## Настройка подключения ClickPipe \{#2-setup-your-clickpipe-connection\}

Чтобы настроить новый ClickPipe, необходимо указать параметры подключения и аутентификации к вашему хранилищу данных BigQuery, а также staging GCS bucket.

**1.** Загрузите `.json`-ключ для service account, который вы создали для ClickPipes. Убедитесь, что у service account есть минимально необходимый набор [permissions](./01_overview.md#permissions).

    <Image img={cp_step2} alt="Загрузка ключа service account" size="lg" border/>    

**2.** Выберите **Replication method**. В рамках Private Preview поддерживается только вариант [**Initial load only**](./01_overview.md#initial-load).

**3.** Укажите путь к GCS bucket для промежуточного хранения данных во время первичной загрузки.

**4.** Нажмите **Next** для проверки.

## Конфигурация ClickPipe \{#3-configure-your-clickpipe\}

В зависимости от размера вашего набора данных BigQuery или общего объёма таблиц, которые вы хотите синхронизировать, может потребоваться скорректировать настройки ингестии по умолчанию для ClickPipe.

## Настройка таблиц \{#4-configure-tables\}

**1.** Выберите базу данных ClickHouse, в которую должны реплицироваться таблицы BigQuery. Вы можете выбрать существующую базу данных или создать новую.

**2.** Выберите таблицы и, при необходимости, столбцы, которые вы хотите реплицировать. Будут перечислены только те наборы данных, к которым имеет доступ указанный service account.

    <Image img={cp_step3} alt="Права доступа" size="lg" border/>

**3.** Для каждой выбранной таблицы обязательно задайте пользовательский ключ сортировки в разделе **Advanced settings** > **Use a custom sorting key**. В дальнейшем ключ сортировки будет автоматически определяться на основе существующих ключей кластеризации или партиционирования во внешней базе данных.

    :::warning
    Вы **обязаны** задать [sorting key](../../../../best-practices/choosing_a_primary_key.md) для реплицируемых таблиц, чтобы оптимизировать производительность запросов в ClickHouse. В противном случае ключ сортировки будет установлен как `tuple()`, что означает отсутствие первичного индекса, и ClickHouse будет выполнять полное сканирование таблицы для всех запросов к этой таблице.
    :::

    <Image img={cp_step4} alt="Права доступа" size="lg" border/>

## Настройка прав доступа \{#6-configure-permissions\}

Наконец, вы можете настроить права доступа для внутреннего пользователя ClickPipes.

**Permissions:** ClickPipes создаст отдельного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя настраиваемую роль или одну из предопределённых ролей:
- `Full access`: полный доступ к кластеру. Требуется, если вы используете materialized views или словарь с целевой таблицей.
- `Only destination`: права на вставку только в целевую таблицу.

## Завершение настройки \{#7-complete-setup\}

Нажмите **Create ClickPipe**, чтобы завершить настройку. Вы будете перенаправлены на страницу обзора, где сможете просматривать прогресс первичной загрузки и переходить к деталям ваших BigQuery ClickPipes.

<Image img={cp_step5} alt="Права доступа" size="lg" border/>

</VerticalStepper>