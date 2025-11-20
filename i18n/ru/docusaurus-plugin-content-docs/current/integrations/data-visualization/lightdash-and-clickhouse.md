---
sidebar_label: 'Lightdash'
sidebar_position: 131
slug: /integrations/lightdash
keywords: ['clickhouse', 'lightdash', 'визуализация данных', 'BI', 'семантический слой', 'dbt', 'самостоятельная аналитика', 'подключение']
description: 'Lightdash — современный инструмент бизнес-аналитики с открытым исходным кодом, построенный на основе dbt. Позволяет командам исследовать и визуализировать данные из ClickHouse через семантический слой. Узнайте, как подключить Lightdash к ClickHouse для быстрой контролируемой аналитики на базе dbt.'
title: 'Подключение Lightdash к ClickHouse'
doc_type: 'guide'
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
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Lightdash

<PartnerBadge/>

Lightdash — это **BI-платформа с поддержкой AI**, созданная для современных команд по работе с данными, которая объединяет открытость dbt с производительностью ClickHouse. Подключив ClickHouse к Lightdash, команды получают **самостоятельную аналитику на основе AI**, базирующуюся на их семантическом слое dbt, благодаря чему на каждый вопрос даётся ответ с использованием управляемых и согласованных метрик.

Разработчики ценят Lightdash за открытую архитектуру, модели YAML с контролем версий и интеграции, которые органично встраиваются в их рабочий процесс — от GitHub до IDE.

Это партнёрство объединяет **скорость ClickHouse** и **удобство работы для разработчиков Lightdash**, делая исследование, визуализацию и автоматизацию инсайтов с помощью AI проще, чем когда-либо.



## Создание интерактивной панели мониторинга с Lightdash и ClickHouse {#build-an-interactive-dashboard}

В этом руководстве вы узнаете, как **Lightdash** подключается к **ClickHouse** для работы с вашими dbt-моделями и создания интерактивных панелей мониторинга.  
Ниже приведен пример готовой панели мониторинга, работающей на данных из ClickHouse.

<Image size='md' img={lightdash_02} alt='Пример панели мониторинга Lightdash' border />

<VerticalStepper headerLevel="h3">

### Сбор данных для подключения {#connection-data-required}

При настройке подключения между Lightdash и ClickHouse вам потребуются следующие данные:

- **Host:** Адрес, по которому работает ваша база данных ClickHouse
- **User:** Имя пользователя базы данных ClickHouse
- **Password:** Пароль базы данных ClickHouse
- **DB name:** Имя вашей базы данных ClickHouse
- **Schema:** Схема по умолчанию, используемая dbt для компиляции и выполнения вашего проекта (указана в файле `profiles.yml`)
- **Port:** Порт HTTPS-интерфейса ClickHouse (по умолчанию: `8443`)
- **Secure:** Включите эту опцию для использования HTTPS/SSL для безопасных соединений
- **Retries:** Количество повторных попыток выполнения неудачных запросов ClickHouse в Lightdash (по умолчанию: `3`)
- **Start of week:** Выберите день начала отчетной недели; по умолчанию используется настройка вашего хранилища данных

<ConnectionDetails />

---

### Настройка профиля dbt для ClickHouse {#configuring-your-dbt-profile-for-clickhouse}

В Lightdash подключения основаны на вашем существующем **dbt-проекте**.  
Для подключения ClickHouse убедитесь, что ваш локальный файл `~/.dbt/profiles.yml` содержит корректную конфигурацию целевого подключения ClickHouse.

Например:

<Image
  size='md'
  img={lightdash_01}
  alt='Пример конфигурации profiles.yml для проекта lightdash-clickhouse'
  border
/>
<br />

### Создание проекта Lightdash с подключением к ClickHouse {#creating-a-lightdash-project-connected-to-clickhouse}

После настройки профиля dbt для ClickHouse вам также необходимо подключить ваш **dbt-проект** к Lightdash.

Поскольку этот процесс одинаков для всех хранилищ данных, мы не будем вдаваться в подробности — вы можете следовать официальному руководству Lightdash по импорту dbt-проекта:

[Import a dbt project → Lightdash Docs](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#2-import-a-dbt-project?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

После подключения вашего dbt-проекта Lightdash автоматически определит конфигурацию ClickHouse из файла `profiles.yml`. После успешного тестирования подключения вы сможете начать работу с вашими dbt-моделями и создание панелей мониторинга на основе ClickHouse.

---

### Исследование данных ClickHouse в Lightdash {#exploring-your-clickhouse-data-in-lightdash}

После подключения Lightdash автоматически синхронизирует ваши dbt-модели и предоставляет доступ к:

- **Измерениям** и **показателям**, определенным в YAML
- **Логике семантического слоя**, такой как метрики, объединения и исследования
- **Панелям мониторинга**, работающим на запросах ClickHouse в реальном времени

Теперь вы можете создавать панели мониторинга, делиться аналитическими данными и даже использовать **Ask AI** для генерации визуализаций непосредственно на основе ClickHouse — без необходимости писать SQL вручную.

---

### Определение метрик и измерений в Lightdash {#defining-metrics-and-dimensions-in-lightdash}

В Lightdash все **метрики** и **измерения** определяются непосредственно в `.yml`-файлах ваших dbt-моделей. Это делает вашу бизнес-логику версионируемой, согласованной и полностью прозрачной.

<Image
  size='md'
  img={lightdash_03}
  alt='Пример определения метрик в файле .yml'
  border
/>
<br />

Определение этих элементов в YAML гарантирует, что ваша команда использует одинаковые определения во всех панелях мониторинга и анализах. Например, вы можете создать переиспользуемые метрики, такие как `total_order_count`, `total_revenue` или `avg_order_value`, прямо рядом с вашими dbt-моделями — без необходимости дублирования в пользовательском интерфейсе.

Чтобы узнать больше о том, как их определять, обратитесь к следующим руководствам Lightdash:

- [How to create metrics](https://docs.lightdash.com/guides/how-to-create-metrics?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
- [How to create dimensions](https://docs.lightdash.com/guides/how-to-create-dimensions?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Запрос данных из таблиц {#querying-your-data-from-tables}

После подключения и синхронизации вашего dbt-проекта с Lightdash вы можете начать работу с данными непосредственно из ваших **таблиц** (или «исследований»).  
Каждая таблица представляет dbt-модель и включает метрики и измерения, которые вы определили в YAML.

Страница **Explore** состоит из пяти основных областей:


1. **Измерения и метрики** — все поля, доступные в выбранной таблице
2. **Фильтры** — ограничение данных, возвращаемых запросом
3. **График** — визуализация результатов запроса
4. **Результаты** — просмотр необработанных данных из базы данных ClickHouse
5. **SQL** — просмотр сгенерированного SQL-запроса, на основе которого получены результаты

<Image
  size='lg'
  img={lightdash_04}
  alt='Представление Lightdash Explore с измерениями, фильтрами, графиком, результатами и SQL'
  border
/>

Здесь вы можете интерактивно создавать и настраивать запросы — перетаскивать поля, добавлять фильтры и переключаться между типами визуализации, такими как таблицы, столбчатые диаграммы или временные ряды.

Подробнее об исследовании данных и работе с таблицами см.:  
[Введение в таблицы и страницу Explore → Документация Lightdash](https://docs.lightdash.com/get-started/exploring-data/using-explores#an-intro-to-tables-and-the-explore-page?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Создание дашбордов {#building-dashboards}

После изучения данных и сохранения визуализаций вы можете объединить их в **дашборды** для совместной работы с командой.

Дашборды в Lightdash полностью интерактивны — вы можете применять фильтры, добавлять вкладки и просматривать графики на основе запросов ClickHouse в реальном времени.

Вы также можете создавать новые графики **непосредственно в дашборде**, что помогает поддерживать порядок в проектах. Графики, созданные таким образом, **принадлежат только этому дашборду** — их нельзя использовать в других частях проекта.

Чтобы создать график только для дашборда:

1. Нажмите **Add tile**
2. Выберите **New chart**
3. Создайте визуализацию в конструкторе графиков
4. Сохраните её — она появится в нижней части дашборда

<Image
  size='lg'
  img={lightdash_05}
  alt='Создание и организация графиков в дашборде Lightdash'
  border
/>

Подробнее о создании и организации дашбордов:  
[Создание дашбордов → Документация Lightdash](https://docs.lightdash.com/get-started/exploring-data/dashboards?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Ask AI: самостоятельная аналитика на основе dbt {#ask-ai}

**AI-агенты** в Lightdash делают исследование данных по-настоящему самостоятельным.  
Вместо написания запросов пользователи могут просто задавать вопросы на естественном языке — например, _«Каким был наш ежемесячный рост выручки?»_ — и AI-агент автоматически создаст нужную визуализацию, используя метрики и модели, определённые в dbt, для обеспечения точности и согласованности.

Он работает на основе того же семантического слоя, который используется в dbt, поэтому каждый ответ остаётся управляемым, объяснимым и быстрым — всё это при поддержке ClickHouse.

<Image
  size='lg'
  img={lightdash_06}
  alt='Интерфейс Lightdash Ask AI с запросом на естественном языке на основе метрик dbt'
  border
/>

:::tip
Подробнее об AI-агентах: [AI-агенты → Документация Lightdash](https://docs.lightdash.com/guides/ai-agents?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
:::

</VerticalStepper>


## Дополнительная информация {#learn-more}

Подробнее о подключении проектов dbt к Lightdash см. в разделе [Документация Lightdash → Настройка ClickHouse](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#clickhouse?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs).
