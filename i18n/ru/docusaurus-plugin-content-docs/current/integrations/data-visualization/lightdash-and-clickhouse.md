---
sidebar_label: 'Lightdash'
sidebar_position: 131
slug: /integrations/lightdash
keywords: ['clickhouse', 'lightdash', 'визуализация данных', 'BI', 'семантический слой', 'dbt', 'самообслуживаемая аналитика', 'подключение']
description: 'Lightdash — это современный open source BI-инструмент, построенный на базе dbt, который позволяет командам исследовать и визуализировать данные из ClickHouse через семантический слой. Узнайте, как подключить Lightdash к ClickHouse для быстрой, управляемой аналитики на базе dbt.'
title: 'Подключение Lightdash к ClickHouse'
doc_type: 'руководство'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import lightdash_01 from '@site/static/images/integrations/data-visualization/lightdash_01.png';
import lightdash_02 from '@site/static/images/integrations/data-visualization/lightdash_02.png';
import lightdash_03 from '@site/static/images/integrations/data-visualization/lightdash_03.png';
import lightdash_04 from '@site/static/images/integrations/data-visualization/lightdash_04.png';
import lightdash_05 from '@site/static/images/integrations/data-visualization/lightdash_05.png';
import lightdash_06 from '@site/static/images/integrations/data-visualization/lightdash_06.png';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Lightdash {#lightdash}

<PartnerBadge/>

Lightdash — это **AI-first BI-платформа**, созданная для современных команд по работе с данными, которая сочетает открытость dbt с производительностью ClickHouse. Подключив ClickHouse к Lightdash, команды получают **самообслуживаемую аналитику на базе ИИ**, опирающуюся на их семантический слой dbt, так что на каждый вопрос даётся ответ с контролируемыми и согласованными метриками.

Разработчики ценят Lightdash за его открытую архитектуру, версионируемые YAML-модели и интеграции, которые напрямую встраиваются в их рабочий процесс — от GitHub до IDE.

Это партнёрство объединяет **скорость ClickHouse** и **удобство Lightdash для разработчиков**, упрощая как никогда ранее исследование, визуализацию и автоматизацию получения инсайтов с помощью ИИ.

## Создание интерактивной панели мониторинга с Lightdash и ClickHouse {#build-an-interactive-dashboard}

В этом руководстве показано, как **Lightdash** подключается к **ClickHouse** для исследования ваших dbt-моделей и создания интерактивных панелей мониторинга.  
На примере ниже показана готовая панель мониторинга, построенная на данных из ClickHouse.

<Image size='md' img={lightdash_02} alt='Пример панели мониторинга Lightdash' border />

<VerticalStepper headerLevel="h3">
  ### Сбор данных для подключения

  При настройке подключения между Lightdash и ClickHouse вам понадобятся следующие параметры:

  * **Host:** Адрес сервера, на котором запущена ваша база данных ClickHouse
  * **User:** Имя пользователя базы данных ClickHouse
  * **Password:** Пароль пользователя базы данных ClickHouse
  * **DB name:** Имя вашей базы данных ClickHouse
  * **Schema:** Схема по умолчанию, которую dbt использует для компиляции и выполнения вашего проекта (указана в `profiles.yml`)
  * **Port:** Порт HTTPS-интерфейса ClickHouse (по умолчанию: `8443`)
  * **Secure:** Включите этот параметр, чтобы использовать HTTPS/SSL для защищённых соединений
  * **Retries:** Количество повторных попыток выполнения неуспешных запросов к ClickHouse в Lightdash (по умолчанию: `3`)
  * **Start of week:** Выберите, с какого дня начинается отчётная неделя; по умолчанию используется параметр, заданный в вашем хранилище данных

  <ConnectionDetails />

  ***

  ### Настройка профиля dbt для ClickHouse

  В Lightdash подключения основаны на вашем существующем **dbt-проекте**.
  Чтобы подключить ClickHouse, убедитесь, что ваш локальный файл `~/.dbt/profiles.yml` содержит корректную конфигурацию целевого подключения к ClickHouse.

  Например:

  <Image size="md" img={lightdash_01} alt="Пример конфигурации profiles.yml для проекта lightdash-clickhouse" border />

  <br />

  ### Создание проекта Lightdash, подключённого к ClickHouse

  После того как ваш профиль dbt настроен для ClickHouse, вам также нужно подключить **dbt-проект** к Lightdash.

  Поскольку этот процесс одинаков для всех хранилищ данных, мы не будем подробно рассматривать его здесь — вы можете воспользоваться официальным руководством Lightdash по импорту dbt-проекта:

  [Импорт dbt-проекта → Lightdash Docs](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#2-import-a-dbt-project?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  После подключения вашего dbt-проекта Lightdash автоматически определит конфигурацию ClickHouse из файла `profiles.yml`. Как только проверка подключения пройдёт успешно, вы сможете начать исследовать свои dbt-модели и создавать панели мониторинга на базе ClickHouse.

  ***

  ### Исследование данных ClickHouse в Lightdash

  После подключения Lightdash автоматически синхронизирует ваши dbt-модели и предоставляет доступ к следующим объектам:

  * **Измерения** и **меры**, определённые в YAML
  * **Логика семантического слоя**, например метрики, соединения (joins) и explores
  * **Панели мониторинга**, работающие на основе запросов к ClickHouse в режиме реального времени

  Теперь вы можете создавать панели мониторинга, делиться аналитическими выводами и даже использовать **Ask AI** для генерации визуализаций непосредственно поверх ClickHouse — без необходимости писать SQL вручную.

  ***

  ### Определение метрик и измерений в Lightdash

  В Lightdash все **метрики** и **измерения** определяются непосредственно в `.yml`-файлах ваших dbt-моделей. Это делает бизнес-логику управляемой по версиям, согласованной и полностью прозрачной.

  <Image size="md" img={lightdash_03} alt="Пример определения метрик в файле .yml" border />

  <br />

  Определение этих сущностей в YAML гарантирует, что ваша команда использует единые определения во всех панелях мониторинга и аналитических отчётах. Например, вы можете создавать повторно используемые метрики, такие как `total_order_count`, `total_revenue` или `avg_order_value`, прямо рядом с dbt-моделями — без необходимости дублировать их в интерфейсе.

  Чтобы узнать больше о том, как определять эти сущности, ознакомьтесь со следующими руководствами Lightdash:

  * [Как создавать метрики](https://docs.lightdash.com/guides/how-to-create-metrics?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)
  * [Как создавать измерения](https://docs.lightdash.com/guides/how-to-create-dimensions?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### Выполнение запросов к данным из таблиц

  После того как ваш dbt-проект подключён и синхронизирован с Lightdash, вы можете начать исследовать данные непосредственно из **таблиц** (или «explores»).
  Каждая таблица представляет собой dbt-модель и включает метрики и измерения, которые вы определили в YAML.

  Страница **Explore** состоит из пяти основных областей:

  1. **Измерения и метрики** — все поля, доступные в данной таблице
  2. **Фильтры** — ограничивают набор данных, возвращаемый вашим запросом
  3. **Chart** — визуализируйте результаты запросов
  4. **Results** — просмотреть сырые данные, возвращаемые вашей базой данных ClickHouse
  5. **SQL** — просмотреть сгенерированный SQL-запрос, который стоит за вашими результатами

  <Image size="lg" img={lightdash_04} alt="Страница Explore в Lightdash, отображающая измерения, фильтры, диаграмму, результаты и SQL" border />

  Отсюда вы можете создавать и настраивать запросы в интерактивном режиме — перетаскивая поля, добавляя фильтры и переключаясь между типами визуализации, такими как таблицы, столбчатые диаграммы или временные ряды.

  Для более подробного изучения explores и выполнения запросов к таблицам см.:
  [Введение в таблицы и страницу Explore → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/using-explores#an-intro-to-tables-and-the-explore-page?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### Создание панелей мониторинга

  После того как вы исследовали данные и сохранили визуализации, вы можете объединить их в **панели мониторинга**, чтобы поделиться ими с командой.

  Панели мониторинга в Lightdash полностью интерактивны — вы можете применять фильтры, добавлять вкладки и просматривать графики, работающие на запросах к ClickHouse в режиме реального времени.

  Вы также можете создавать новые графики **непосредственно внутри панели мониторинга**, что помогает поддерживать порядок в проектах и избегать беспорядка. Графики, созданные таким образом, являются **эксклюзивными для этой панели мониторинга** — их нельзя повторно использовать в других частях проекта.

  Чтобы создать диаграмму только для панели мониторинга:

  1. Нажмите **Add tile**
  2. Выберите **New chart**
  3. Создайте визуализацию в конструкторе диаграмм
  4. Сохраните её — она появится в нижней части панели мониторинга

  <Image size="lg" img={lightdash_05} alt="Создание и упорядочение диаграмм на панели мониторинга Lightdash" border />

  Узнайте больше о том, как создавать и организовывать панели мониторинга, здесь:
  [Создание панелей мониторинга → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/dashboards?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### Ask AI: самообслуживаемая аналитика на базе dbt

  **AI-агенты** в Lightdash делают исследование данных по-настоящему самостоятельным.
  Вместо написания запросов вы можете просто задавать вопросы на естественном языке — например, *«Каким был наш ежемесячный рост выручки?»* — и AI-агент автоматически создаст подходящую визуализацию, используя ваши метрики и модели, определённые в dbt, чтобы обеспечить точность и согласованность.

  Он работает на том же семантическом слое, который вы используете в dbt, а это значит, что каждый ответ остаётся управляемым, объяснимым и быстрым — всё это обеспечивается ClickHouse.

  <Image size="lg" img={lightdash_06} alt="Интерфейс Lightdash Ask AI с запросом на естественном языке, построенным на метриках dbt" border />

  :::tip
  Узнайте больше об AI-агентах здесь: [AI Agents → Lightdash Docs](https://docs.lightdash.com/guides/ai-agents?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)
  :::
</VerticalStepper>

## Подробнее {#learn-more}

Чтобы узнать больше о подключении проектов dbt к Lightdash, посетите раздел [Документация Lightdash → Настройка ClickHouse](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#clickhouse?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs).