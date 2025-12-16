---
sidebar_label: 'Databrain'
sidebar_position: 131
slug: /integrations/databrain
keywords: ['clickhouse', 'Databrain', 'connect', 'integrate', 'ui', 'analytics', 'embedded', 'dashboard', 'visualization']
description: 'Databrain — это платформа встраиваемой аналитики, которая бесшовно интегрируется с ClickHouse для создания клиентских дашбордов, метрик и визуализаций данных.'
title: 'Подключение Databrain к ClickHouse'
doc_type: 'guide'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import databrain_01 from '@site/static/images/integrations/data-visualization/databrain_01.png';
import databrain_02 from '@site/static/images/integrations/data-visualization/databrain_02.png';
import databrain_03 from '@site/static/images/integrations/data-visualization/databrain_03.png';
import databrain_04 from '@site/static/images/integrations/data-visualization/databrain_04.png';
import databrain_05 from '@site/static/images/integrations/data-visualization/databrain_05.png';
import databrain_06 from '@site/static/images/integrations/data-visualization/databrain_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Подключение Databrain к ClickHouse {#connecting-databrain-to-clickhouse}

<CommunityMaintainedBadge/>

[Databrain](https://usedatabrain.com) — это встраиваемая аналитическая платформа, которая позволяет создавать и предоставлять вашим клиентам интерактивные дашборды, метрики и визуализации данных. Databrain подключается к ClickHouse с использованием HTTPS-интерфейса, что упрощает визуализацию и анализ данных ClickHouse с помощью современного и удобного интерфейса.

<Image size="md" img={databrain_01} alt="Интерфейс дашборда Databrain, показывающий визуализацию данных ClickHouse" border />

<br/>

В этом руководстве пошагово описано, как подключить Databrain к вашему инстансу ClickHouse.

## Предварительные требования {#pre-requisites}

- База данных ClickHouse, развернутая как в вашей собственной инфраструктуре, так и в [ClickHouse Cloud](https://clickhouse.com/).
- [Учетная запись Databrain](https://app.usedatabrain.com/users/sign-up).
- Рабочее пространство Databrain для подключения вашего источника данных.

## Шаги по подключению Databrain к ClickHouse {#steps-to-connect-databrain-to-clickhouse}

### 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Разрешите IP-адреса Databrain (если требуется) {#2-allow-databrain-ip-addresses}

Если в вашем экземпляре ClickHouse включена фильтрация по IP, вам нужно добавить IP-адреса Databrain в список разрешённых.

Для пользователей ClickHouse Cloud:

1. Перейдите к своему сервису в консоли ClickHouse Cloud
2. Откройте **Settings** → **Security**
3. Добавьте IP-адреса Databrain в список разрешённых

:::tip
Обратитесь к [документации по добавлению IP-адресов Databrain в список разрешённых](https://docs.usedatabrain.com/guides/datasources/allow-access-to-our-ip) для получения актуального списка IP-адресов, которые нужно разрешить.
:::

### 3. Добавьте ClickHouse как источник данных в Databrain {#3-add-clickhouse-as-a-data-source}

1. Войдите в свою учётную запись Databrain и перейдите в рабочее пространство, в котором вы хотите добавить источник данных.

2. Нажмите **Data Sources** в навигационном меню.

<Image size="md" img={databrain_02} alt="Меню источников данных в Databrain" border />

3. Нажмите **Add a Data Source** или **Connect Data Source**.

4. Выберите **ClickHouse** из списка доступных коннекторов.

<Image size="md" img={databrain_03} alt="Выбор коннектора в Databrain с отображением варианта ClickHouse" border />

5. Заполните данные для подключения:
   * **Destination Name**: Укажите понятное имя для этого подключения (например, &quot;Production ClickHouse&quot; или &quot;Analytics DB&quot;)
   * **Host**: Укажите URL хоста ClickHouse (например, `https://your-instance.region.aws.clickhouse.cloud`)
   * **Port**: Укажите `8443` (порт HTTPS по умолчанию для ClickHouse)
   * **Username**: Укажите имя пользователя ClickHouse
   * **Password**: Укажите пароль пользователя ClickHouse

<Image size="md" img={databrain_04} alt="Форма подключения ClickHouse в Databrain с полями конфигурации" border />

6. Нажмите **Test Connection**, чтобы проверить, что Databrain может подключиться к вашему экземпляру ClickHouse.

7. После успешного подключения нажмите **Save** или **Connect**, чтобы добавить источник данных.

### 4. Настройте пользовательские права {#4-configure-user-permissions}

Убедитесь, что у пользователя ClickHouse, с которым вы выполняете подключение, есть необходимые права доступа:

```sql
-- Grant permissions to read schema information
GRANT SELECT ON information_schema.* TO your_databrain_user;

-- Grant read access to your database and tables
GRANT SELECT ON your_database.* TO your_databrain_user;
```

Замените `your_databrain_user` и `your_database` на фактические имя пользователя и имя базы данных.

## Использование Databrain с ClickHouse {#using-databrain-with-clickhouse}

### Исследуйте данные {#explore-your-data}

1. После подключения перейдите в своё рабочее пространство Databrain.

2. В обозревателе данных Databrain вы увидите свои таблицы ClickHouse.

<Image size="md" img={databrain_05} alt="Обозреватель данных Databrain с таблицами ClickHouse" border />

3. Нажмите на таблицу, чтобы изучить её схему и просмотреть данные.

### Создание метрик и визуализаций {#create-metrics-and-visualizations}

1. Нажмите **Create Metric**, чтобы начать построение визуализаций на основе данных ClickHouse.

2. Выберите источник данных ClickHouse и таблицу, которую вы хотите визуализировать.

3. Используйте интуитивный интерфейс Databrain, чтобы:
   - выбирать измерения и показатели;
   - применять фильтры и агрегации;
   - выбирать типы визуализаций (гистограммы, линейные графики, круговые диаграммы, таблицы и т. д.);
   - добавлять произвольные SQL-запросы для продвинутого анализа.

4. Сохраните метрику, чтобы повторно использовать её на разных дашбордах.

### Создание дашбордов {#build-dashboards}

1. Нажмите **Create Dashboard**, чтобы начать создание дашборда.

2. Добавляйте метрики на дашборд, перетаскивая сохранённые метрики.

3. Настройте компоновку и внешний вид дашборда.

<Image size="md" img={databrain_06} alt="Дашборд Databrain с несколькими визуализациями ClickHouse" border />

4. Поделитесь дашбордом с вашей командой или встроите его в приложение.

### Расширенные возможности {#advanced-features}

Databrain предлагает несколько расширенных возможностей при работе с ClickHouse:

- **Пользовательская SQL-консоль**: пишите и выполняйте произвольные SQL-запросы напрямую к вашей базе данных ClickHouse
- **Многотенантная и однотенантная архитектуры (multi-tenancy и single-tenancy)**: подключайте вашу базу данных ClickHouse как с однотенантной, так и с многотенантной архитектурой
- **Планирование отчётов**: планируйте автоматическую генерацию отчётов и отправляйте их по электронной почте заинтересованным сторонам
- **Инсайты на основе ИИ**: используйте ИИ для генерации сводок и инсайтов из ваших данных
- **Встраиваемая аналитика**: встраивайте дашборды и метрики напрямую в ваши приложения
- **Семантический уровень**: создавайте повторно используемые модели данных и бизнес-логику

## Устранение неполадок {#troubleshooting}

### Ошибка подключения {#connection-fails}

Если не удаётся подключиться к ClickHouse:

1. **Проверьте учётные данные**: Ещё раз проверьте имя пользователя, пароль и URL хоста
2. **Проверьте порт**: Убедитесь, что используется порт `8443` для HTTPS (или `8123` для HTTP, если не используется SSL)
3. **Белый список IP-адресов**: Убедитесь, что IP-адреса Databrain внесены в белый список в настройках файервола/безопасности ClickHouse
4. **SSL/TLS**: Убедитесь, что SSL/TLS корректно настроен, если используется HTTPS
5. **Права пользователя**: Убедитесь, что у пользователя есть привилегии SELECT на `information_schema` и целевые базы данных

### Низкая производительность запросов {#slow-query-performance}

Если запросы выполняются медленно:

1. **Оптимизируйте запросы**: Эффективно используйте фильтры и агрегирующие функции
2. **Создавайте материализованные представления**: Для часто используемых агрегаций рассмотрите возможность создания материализованных представлений в ClickHouse
3. **Используйте подходящие типы данных**: Убедитесь, что в схеме ClickHouse используются оптимальные типы данных
4. **Оптимизируйте индексы**: Используйте первичные ключи и пропускающие индексы ClickHouse

## Подробнее {#learn-more}

Дополнительные сведения о возможностях Databrain и создании эффективной аналитики:

- [Документация по Databrain](https://docs.usedatabrain.com/)
- [Руководство по интеграции с ClickHouse](https://docs.usedatabrain.com/guides/datasources/connecting-data-sources-to-databrain/clickhouse)
- [Создание дашбордов](https://docs.usedatabrain.com/guides/dashboards/create-a-dashboard)
- [Построение метрик](https://docs.usedatabrain.com/guides/metrics/create-metrics)
