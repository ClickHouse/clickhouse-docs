---
sidebar_label: 'Fivetran'
slug: /integrations/fivetran
sidebar_position: 2
description: 'Используйте Fivetran, чтобы переносить данные из любого источника в ClickHouse Cloud с автоматическим созданием schema, дедупликацией и режимом History Mode (SCD Type 2).'
title: 'Fivetran и ClickHouse Cloud'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://github.com/ClickHouse/clickhouse-fivetran-destination'
keywords: ['fivetran', 'перенос данных', 'etl', 'приёмник ClickHouse', 'автоматизированная платформа данных', 'режим History', 'SCD Type 2']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Fivetran и ClickHouse Cloud \{#fivetran-and-clickhouse-cloud\}

<ClickHouseSupportedBadge/>

## Обзор \{#overview\}

[Fivetran](https://www.fivetran.com) — это платформа автоматизированного перемещения данных, обеспечивающая перенос данных из, в и между вашими облачными платформами для работы с данными.

[ClickHouse Cloud](https://clickhouse.com/cloud) поддерживается в качестве пункта назначения (пункт назначения) в [Fivetran](https://fivetran.com/docs/destinations/clickhouse), что позволяет загружать данные из различных источников в ClickHouse. Версия ClickHouse с открытым исходным кодом не поддерживается в качестве пункта назначения.

Коннектор пункта назначения совместно разрабатывается и поддерживается ClickHouse и Fivetran. Исходный код доступен на [GitHub](https://github.com/ClickHouse/clickhouse-fivetran-destination).

:::note
[Пункт назначения ClickHouse Cloud](https://fivetran.com/docs/destinations/clickhouse) в настоящее время находится в стадии **бета**, но мы работаем над тем, чтобы вскоре сделать его общедоступным.
:::

<div class="vimeo-container">
  <iframe
    src="//www.youtube.com/embed/sWe5JHW3lAs"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
fullscreen;
picture-in-picture"
    allowfullscreen
  />
</div>

## Ключевые возможности \{#key-features\}

* **Совместимость с ClickHouse Cloud**: используйте свою базу данных ClickHouse Cloud как пункт назначения для Fivetran.
* **SaaS-модель развертывания**: полностью управляется Fivetran, поэтому вам не нужно управлять собственной инфраструктурой.
* **Режим History Mode (SCD Type 2)**: сохраняет полную историю всех версий записей для анализа на определенный момент времени и аудита.
* **Настраиваемые размеры пакетов**: Вы можете адаптировать Fivetran под свой сценарий использования, настроив размеры пакетов записи, выборки, mutation и окончательного удаления через файл конфигурации JSON.

## Ограничения \{#limitations\}

* Миграции schema пока не поддерживаются, но мы работаем над этим.
* Добавление, удаление или изменение столбцов первичного ключа не поддерживается.
* Пользовательские настройки ClickHouse в командах `CREATE TABLE` не поддерживаются.
* Гранты на основе ролей поддерживаются не полностью. Проверка грантов в коннекторе учитывает только прямые пользовательские гранты. Вместо этого используйте [прямые гранты](/integrations/fivetran/troubleshooting#role-based-grants).

## Связанные страницы \{#related-pages\}

* [Технический справочник](/integrations/fivetran/reference): соответствия типов, движки таблиц, столбцы метаданных и дополнительные настройки
* [Устранение неполадок и лучшие практики](/integrations/fivetran/troubleshooting): распространённые ошибки, рекомендации по оптимизации и запросы для отладки
* [Пункт назначения ClickHouse для Fivetran на GitHub](https://github.com/ClickHouse/clickhouse-fivetran-destination)

## Руководство по настройке \{#setup-guide\}

* Если вам нужны параметры конфигурации и общие технические сведения, см. [технический справочник](/integrations/fivetran/reference).
* Подробное руководство см. в [руководстве по настройке](https://fivetran.com/docs/destinations/clickhouse/setup-guide) в документации Fivetran.

## Контакты и поддержка \{#contact-us\}

Для пункта назначения ClickHouse в Fivetran используется модель разделения ответственности:

* **ClickHouse** разрабатывает и поддерживает код коннектора пункта назначения.
* **Fivetran** размещает коннектор и отвечает за перемещение данных, планирование пайплайнов и коннекторы источников.

Поддержку по пункту назначения ClickHouse в Fivetran предоставляют и Fivetran, и ClickHouse. По общим вопросам рекомендуем обращаться в Fivetran, так как именно они лучше всего знают платформу Fivetran. Если у вас есть вопросы или проблемы, связанные именно с ClickHouse, наша служба поддержки будет рада помочь. Создайте [запрос в поддержку](/about-us/support), чтобы задать вопрос или сообщить о проблеме.