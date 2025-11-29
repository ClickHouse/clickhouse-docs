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

### Сбор данных для подключения {#connection-data-required}

При настройке подключения между Lightdash и ClickHouse вам понадобятся следующие параметры:

- **Host:** Адрес, по которому запущена ваша база данных ClickHouse
- **User:** Имя пользователя базы данных ClickHouse
- **Password:** Пароль пользователя базы данных ClickHouse
- **DB name:** Имя вашей базы данных ClickHouse
- **Schema:** Схема по умолчанию, которую dbt использует для компиляции и выполнения вашего проекта (указана в `profiles.yml`)
- **Port:** Порт HTTPS-интерфейса ClickHouse (по умолчанию: `8443`)
- **Secure:** Включите эту опцию, чтобы использовать HTTPS/SSL для защищённых подключений
- **Retries:** Количество попыток, которые Lightdash предпринимает при повторном выполнении неуспешных запросов к ClickHouse (по умолчанию: `3`)
- **Start of week:** Выберите, с какого дня начинается отчётная неделя; по умолчанию используется настройка вашего хранилища данных

<ConnectionDetails />

---

### Настройка профиля dbt для ClickHouse {#configuring-your-dbt-profile-for-clickhouse}

В Lightdash подключения основаны на вашем существующем **dbt-проекте**.  
Чтобы подключить ClickHouse, убедитесь, что ваш локальный файл `~/.dbt/profiles.yml` содержит корректную конфигурацию целевого подключения к ClickHouse.

Например:

<Image
  size='md'
  img={lightdash_01}
  alt='Пример конфигурации profiles.yml для проекта lightdash-clickhouse'
  border
/>
<br />

### Создание проекта Lightdash, подключённого к ClickHouse {#creating-a-lightdash-project-connected-to-clickhouse}

После того как ваш профиль dbt настроен для ClickHouse, вам также нужно подключить **dbt-проект** к Lightdash.

Поскольку этот процесс одинаков для всех хранилищ данных, мы не будем подробно рассматривать его здесь — вы можете воспользоваться официальным руководством Lightdash по импорту dbt-проекта:

[Импорт dbt-проекта → Lightdash Docs](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#2-import-a-dbt-project?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

После подключения вашего dbt-проекта Lightdash автоматически определит конфигурацию ClickHouse из файла `profiles.yml`. Как только проверка подключения пройдёт успешно, вы сможете начать исследовать свои dbt-модели и создавать панели мониторинга на базе ClickHouse.

---

### Исследование данных ClickHouse в Lightdash {#exploring-your-clickhouse-data-in-lightdash}

После подключения Lightdash автоматически синхронизирует ваши dbt-модели и предоставляет доступ к следующим объектам:

- **Измерения** и **меры**, определённые в YAML
- **Логику семантического слоя**, такую как метрики, соединения (joins) и explores
- **Панели мониторинга**, работающие на запросах к ClickHouse в режиме реального времени

Теперь вы можете создавать панели мониторинга, делиться аналитическими выводами и даже использовать **Ask AI** для генерации визуализаций непосредственно поверх ClickHouse — без необходимости писать SQL вручную.

---

### Определение метрик и измерений в Lightdash {#defining-metrics-and-dimensions-in-lightdash}

В Lightdash все **метрики** и **измерения** определяются непосредственно в `.yml`-файлах ваших dbt-моделей. Это делает бизнес-логику управляемой по версиям, согласованной и полностью прозрачной.

<Image
  size='md'
  img={lightdash_03}
  alt='Пример определения метрик в файле .yml'
  border
/>
<br />

Определение этих сущностей в YAML гарантирует, что ваша команда использует единые определения во всех панелях мониторинга и аналитических отчётах. Например, вы можете создавать повторно используемые метрики, такие как `total_order_count`, `total_revenue` или `avg_order_value`, прямо рядом с dbt-моделями — без необходимости дублировать их в интерфейсе.

Чтобы узнать больше о том, как определять эти сущности, ознакомьтесь со следующими руководствами Lightdash:

- [Как создавать метрики](https://docs.lightdash.com/guides/how-to-create-metrics?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
- [Как создавать измерения](https://docs.lightdash.com/guides/how-to-create-dimensions?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Выполнение запросов к данным из таблиц {#querying-your-data-from-tables}

После того как ваш dbt-проект подключён и синхронизирован с Lightdash, вы можете начать исследовать данные непосредственно из **таблиц** (или «explores»).  
Каждая таблица представляет собой dbt-модель и включает метрики и измерения, которые вы определили в YAML.

Страница **Explore** состоит из пяти основных областей:


1. **Размерности и метрики** — все поля, доступные в выбранной таблице
2. **Фильтры** — ограничивают данные, возвращаемые вашим запросом
3. **Диаграмма** — визуализирует результаты вашего запроса
4. **Результаты** — просматривайте необработанные данные, возвращаемые вашей базой данных ClickHouse
5. **SQL** — просматривайте сгенерированный SQL‑запрос, лежащий в основе ваших результатов

<Image
  size='lg'
  img={lightdash_04}
  alt='Представление Lightdash Explore с размерностями, фильтрами, диаграммой, результатами и SQL'
  border
/>

Отсюда вы можете интерактивно создавать и изменять запросы — перетаскивать поля, добавлять фильтры и переключаться между типами визуализаций, такими как таблицы, столбчатые диаграммы или временные ряды.

Для более подробного обзора раздела Explore и способов выполнения запросов к вашим таблицам см.:  
[An intro to tables and the Explore page → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/using-explores#an-intro-to-tables-and-the-explore-page?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Создание дашбордов {#building-dashboards}

После того как вы исследовали данные и сохранили визуализации, вы можете объединить их в **дашборды**, чтобы поделиться ими с командой.

Дашборды в Lightdash полностью интерактивны — вы можете применять фильтры, добавлять вкладки и просматривать диаграммы, построенные на запросах к ClickHouse в режиме реального времени.

Вы также можете создавать новые диаграммы **непосредственно из дашборда**, что помогает поддерживать порядок в проектах и избегать избыточности. Диаграммы, созданные таким образом, **относятся только к этому дашборду** — их нельзя повторно использовать в других частях проекта.

Чтобы создать диаграмму только для дашборда:

1. Нажмите **Add tile**
2. Выберите **New chart**
3. Создайте визуализацию в конструкторе диаграмм
4. Сохраните её — она появится в нижней части вашего дашборда

<Image
  size='lg'
  img={lightdash_05}
  alt='Создание и организация диаграмм в дашборде Lightdash'
  border
/>

Подробнее о создании и организации дашбордов читайте здесь:  
[Building dashboards → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/dashboards?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Ask AI: аналитика самообслуживания на базе dbt {#ask-ai}

**AI Agents** в Lightdash делают исследование данных по‑настоящему форматом самообслуживания.  
Вместо того чтобы писать запросы, пользователи могут просто задавать вопросы на естественном языке — например, _«Каков был наш месячный рост выручки?»_ — и AI Agent автоматически создаёт нужную визуализацию, опираясь на определённые в dbt метрики и модели для обеспечения точности и согласованности.

Оно использует тот же семантический слой, что и в dbt, поэтому каждый ответ остаётся управляемым, объяснимым и быстрым — всё это на базе ClickHouse.

<Image
  size='lg'
  img={lightdash_06}
  alt='Интерфейс Lightdash Ask AI с запросом на естественном языке, основанным на метриках dbt'
  border
/>

:::tip
Подробнее об AI Agents читайте здесь: [AI Agents → Lightdash Docs](https://docs.lightdash.com/guides/ai-agents?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
:::

</VerticalStepper>


## Подробнее {#learn-more}

Чтобы узнать больше о подключении проектов dbt к Lightdash, посетите раздел [Документация Lightdash → Настройка ClickHouse](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#clickhouse?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs).
