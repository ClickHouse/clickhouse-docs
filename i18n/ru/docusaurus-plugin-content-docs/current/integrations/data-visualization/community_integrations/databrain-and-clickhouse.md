---
sidebar_label: 'Databrain'
sidebar_position: 131
slug: /integrations/databrain
keywords: ['clickhouse', 'Databrain', 'подключение', 'интеграция', 'ui', 'аналитика', 'встроенная', 'дашборд', 'визуализация']
description: 'Databrain — платформа встраиваемой аналитики, которая бесшовно интегрируется с ClickHouse для создания клиентских дашбордов, метрик и визуализаций данных.'
title: 'Подключение Databrain к ClickHouse'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import databrain_01 from '@site/static/images/integrations/data-visualization/databrain_01.png';
import databrain_02 from '@site/static/images/integrations/data-visualization/databrain_02.png';
import databrain_03 from '@site/static/images/integrations/data-visualization/databrain_03.png';
import databrain_04 from '@site/static/images/integrations/data-visualization/databrain_04.png';
import databrain_05 from '@site/static/images/integrations/data-visualization/databrain_05.png';
import databrain_06 from '@site/static/images/integrations/data-visualization/databrain_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Databrain к ClickHouse

<CommunityMaintainedBadge/>

[Databrain](https://usedatabrain.com) — это платформа встроенной аналитики, которая позволяет создавать и публиковать интерактивные дашборды, метрики и визуализации данных для ваших клиентов. Databrain подключается к ClickHouse через HTTPS-интерфейс, что упрощает визуализацию и анализ ваших данных в ClickHouse с помощью современного и удобного интерфейса.

<Image size="md" img={databrain_01} alt="Интерфейс дашборда Databrain с визуализацией данных из ClickHouse" border />

<br/>

В этом руководстве пошагово показано, как подключить Databrain к вашему экземпляру ClickHouse.



## Предварительные требования {#pre-requisites}

- База данных ClickHouse, размещённая на собственной инфраструктуре или в [ClickHouse Cloud](https://clickhouse.com/).
- [Учётная запись Databrain](https://app.usedatabrain.com/users/sign-up).
- Рабочее пространство Databrain для подключения источника данных.


## Шаги по подключению Databrain к ClickHouse {#steps-to-connect-databrain-to-clickhouse}

### 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Разрешите IP-адреса Databrain (при необходимости) {#2-allow-databrain-ip-addresses}

Если в вашем экземпляре ClickHouse включена фильтрация по IP-адресам, необходимо добавить IP-адреса Databrain в список разрешенных.

Для пользователей ClickHouse Cloud:

1. Перейдите к вашему сервису в консоли ClickHouse Cloud
2. Откройте **Settings** → **Security**
3. Добавьте IP-адреса Databrain в список разрешенных

:::tip
Обратитесь к [документации Databrain по добавлению IP-адресов в список разрешенных](https://docs.usedatabrain.com/guides/datasources/allow-access-to-our-ip) для получения актуального списка IP-адресов.
:::

### 3. Добавьте ClickHouse в качестве источника данных в Databrain {#3-add-clickhouse-as-a-data-source}

1. Войдите в свою учетную запись Databrain и перейдите в рабочее пространство, в которое хотите добавить источник данных.

2. Нажмите на **Data Sources** в навигационном меню.

<Image size='md' img={databrain_02} alt='Меню источников данных Databrain' border />

3. Нажмите **Add a Data Source** или **Connect Data Source**.

4. Выберите **ClickHouse** из списка доступных коннекторов.

<Image
  size='md'
  img={databrain_03}
  alt='Выбор коннектора Databrain с опцией ClickHouse'
  border
/>

5. Заполните данные для подключения:
   - **Destination Name**: Введите описательное имя для этого подключения (например, «Production ClickHouse» или «Analytics DB»)
   - **Host**: Введите URL хоста ClickHouse (например, `https://your-instance.region.aws.clickhouse.cloud`)
   - **Port**: Введите `8443` (стандартный HTTPS-порт для ClickHouse)
   - **Username**: Введите имя пользователя ClickHouse
   - **Password**: Введите пароль ClickHouse

<Image
  size='md'
  img={databrain_04}
  alt='Форма подключения Databrain к ClickHouse с полями конфигурации'
  border
/>

6. Нажмите **Test Connection**, чтобы проверить, что Databrain может подключиться к вашему экземпляру ClickHouse.

7. После успешного подключения нажмите **Save** или **Connect**, чтобы добавить источник данных.

### 4. Настройте права пользователя {#4-configure-user-permissions}

Убедитесь, что пользователь ClickHouse, с которым вы подключаетесь, имеет необходимые права:

```sql
-- Предоставление прав на чтение информации о схеме
GRANT SELECT ON information_schema.* TO your_databrain_user;

-- Предоставление прав на чтение вашей базы данных и таблиц
GRANT SELECT ON your_database.* TO your_databrain_user;
```

Замените `your_databrain_user` и `your_database` на фактическое имя пользователя и имя базы данных.


## Использование Databrain с ClickHouse {#using-databrain-with-clickhouse}

### Исследование данных {#explore-your-data}

1. После подключения перейдите в рабочую область Databrain.

2. В обозревателе данных отобразится список таблиц ClickHouse.

<Image
  size='md'
  img={databrain_05}
  alt='Обозреватель данных Databrain с таблицами ClickHouse'
  border
/>

3. Нажмите на таблицу, чтобы изучить её схему и просмотреть данные.

### Создание метрик и визуализаций {#create-metrics-and-visualizations}

1. Нажмите **Create Metric**, чтобы начать создание визуализаций на основе данных ClickHouse.

2. Выберите источник данных ClickHouse и таблицу для визуализации.

3. Используйте интуитивно понятный интерфейс Databrain для:
   - Выбора измерений и показателей
   - Применения фильтров и агрегаций
   - Выбора типов визуализации (столбчатые диаграммы, линейные графики, круговые диаграммы, таблицы и т. д.)
   - Добавления пользовательских SQL-запросов для расширенного анализа

4. Сохраните метрику для повторного использования в дашбордах.

### Создание дашбордов {#build-dashboards}

1. Нажмите **Create Dashboard**, чтобы начать создание дашборда.

2. Добавьте метрики на дашборд, перетащив сохранённые метрики.

3. Настройте макет и внешний вид дашборда.

<Image
  size='md'
  img={databrain_06}
  alt='Дашборд Databrain с несколькими визуализациями ClickHouse'
  border
/>

4. Поделитесь дашбордом с командой или встройте его в приложение.

### Расширенные возможности {#advanced-features}

Databrain предлагает несколько расширенных возможностей при работе с ClickHouse:

- **Консоль пользовательских SQL-запросов**: написание и выполнение пользовательских SQL-запросов непосредственно к базе данных ClickHouse
- **Многопользовательская и однопользовательская архитектура**: подключение базы данных ClickHouse с поддержкой как однопользовательской, так и многопользовательской архитектуры
- **Планирование отчётов**: планирование автоматических отчётов и отправка их заинтересованным лицам по электронной почте
- **Аналитика на основе ИИ**: использование искусственного интеллекта для создания сводок и аналитических выводов из данных
- **Встроенная аналитика**: встраивание дашбордов и метрик непосредственно в приложения
- **Семантический слой**: создание переиспользуемых моделей данных и бизнес-логики


## Устранение неполадок {#troubleshooting}

### Сбой подключения {#connection-fails}

Если не удается подключиться к ClickHouse:

1. **Проверьте учетные данные**: Дважды проверьте имя пользователя, пароль и URL хоста
2. **Проверьте порт**: Убедитесь, что используется порт `8443` для HTTPS (или `8123` для HTTP без SSL)
3. **Белый список IP-адресов**: Убедитесь, что IP-адреса Databrain внесены в белый список в настройках брандмауэра/безопасности ClickHouse
4. **SSL/TLS**: Убедитесь, что SSL/TLS правильно настроен при использовании HTTPS
5. **Права пользователя**: Убедитесь, что у пользователя есть права SELECT для `information_schema` и целевых баз данных

### Низкая производительность запросов {#slow-query-performance}

Если запросы выполняются медленно:

1. **Оптимизируйте запросы**: Эффективно используйте фильтры и агрегации
2. **Создайте материализованные представления**: Для часто используемых агрегаций рассмотрите возможность создания материализованных представлений в ClickHouse
3. **Используйте подходящие типы данных**: Убедитесь, что схема ClickHouse использует оптимальные типы данных
4. **Оптимизация индексов**: Используйте первичные ключи и индексы с пропуском гранул ClickHouse


## Узнайте больше {#learn-more}

Дополнительную информацию о возможностях Databrain и создании мощной аналитики см. в следующих материалах:

- [Документация Databrain](https://docs.usedatabrain.com/)
- [Руководство по интеграции с ClickHouse](https://docs.usedatabrain.com/guides/datasources/connecting-data-sources-to-databrain/clickhouse)
- [Создание дашбордов](https://docs.usedatabrain.com/guides/dashboards/create-a-dashboard)
- [Создание метрик](https://docs.usedatabrain.com/guides/metrics/create-metrics)
