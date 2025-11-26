---
slug: /use-cases/AI/marimo-notebook
sidebar_label: 'Исследование данных с блокнотами Marimo и chDB'
title: 'Исследование данных с блокнотами Marimo и chDB'
description: 'Это руководство объясняет, как настроить и использовать chDB для исследования данных из ClickHouse Cloud или локальных файлов в блокнотах Marimo'
keywords: ['ML', 'Marimo', 'chDB', 'pandas']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import image_1 from '@site/static/images/use-cases/AI_ML/jupyter/1.png';
import image_2 from '@site/static/images/use-cases/AI_ML/jupyter/2.png';
import image_3 from '@site/static/images/use-cases/AI_ML/jupyter/3.png';
import image_4 from '@site/static/images/use-cases/AI_ML/Marimo/4.png';
import image_5 from '@site/static/images/use-cases/AI_ML/Marimo/5.png';
import image_6 from '@site/static/images/use-cases/AI_ML/Marimo/6.png';
import image_7 from '@site/static/images/use-cases/AI_ML/Marimo/7.gif';
import image_8 from '@site/static/images/use-cases/AI_ML/Marimo/8.gif';

В этом руководстве вы узнаете, как можно исследовать набор данных в ClickHouse Cloud с помощью блокнота Marimo, используя [chDB](/docs/chdb) — быстрый внутрипроцессный SQL OLAP движок на базе ClickHouse.

**Предварительные требования:**
- Python 3.8 или выше
- виртуальная среда
- работающий сервис ClickHouse Cloud и ваши [данные для подключения](/docs/cloud/guides/sql-console/gather-connection-details)

:::tip
Если у вас ещё нет учётной записи ClickHouse Cloud, вы можете [зарегистрироваться](https://console.clickhouse.cloud/signUp?loc=docs-marimo-chdb) для
получения пробного периода и получить $300 в виде бесплатных кредитов для начала работы.
:::

**Что вы узнаете:**
- Подключение к ClickHouse Cloud из блокнотов Marimo с использованием chDB
- Запрос удалённых наборов данных и преобразование результатов в Pandas DataFrames
- Визуализация данных с помощью Plotly в Marimo
- Использование реактивной модели выполнения Marimo для интерактивного исследования данных

Мы будем использовать набор данных о ценах на недвижимость в Великобритании, который доступен в ClickHouse Cloud как один из стартовых наборов данных.
Он содержит данные о ценах, по которым были проданы дома в Великобритании с 1995 по 2024 год.

## Настройка {#setup}

### Загрузка набора данных {#loading-the-dataset}

Чтобы добавить этот набор данных к существующему сервису ClickHouse Cloud, войдите в [console.clickhouse.cloud](https://console.clickhouse.cloud/) с вашими учётными данными.

В левом меню нажмите `Data sources` (Источники данных). Затем нажмите `Predefined sample data` (Предопределённые примеры данных):

<Image size="md" img={image_1} alt="Добавление примера набора данных"/>

Выберите `Get started` (Начать) в карточке UK property price paid data (4GB) (Данные о ценах на недвижимость в Великобритании (4 ГБ)):

<Image size="md" img={image_2} alt="Выбор набора данных о ценах в Великобритании"/>

Затем нажмите `Import dataset` (Импортировать набор данных):

<Image size="md" img={image_3} alt="Импорт набора данных о ценах в Великобритании"/>

ClickHouse автоматически создаст таблицу `pp_complete` в базе данных `default` и заполнит таблицу 28,92 миллионами строк данных о ценах.

Чтобы снизить вероятность раскрытия ваших учётных данных, мы рекомендуем добавить имя пользователя и пароль Cloud в качестве переменных среды на вашем локальном компьютере.
Из терминала выполните следующую команду, чтобы добавить ваше имя пользователя и пароль в качестве переменных среды:

### Настройка учётных данных {#setting-up-credentials}

```bash
export CLICKHOUSE_CLOUD_HOSTNAME=<HOSTNAME>
export CLICKHOUSE_CLOUD_USER=default
export CLICKHOUSE_CLOUD_PASSWORD=your_actual_password
```

:::note
Переменные среды выше сохраняются только в течение вашей сессии терминала.
Чтобы установить их постоянно, добавьте их в конфигурационный файл вашей оболочки.
:::

### Установка Marimo {#installing-marimo}

Теперь активируйте вашу виртуальную среду.
Из виртуальной среды установите следующие пакеты, которые мы будем использовать в этом руководстве:

```python
pip install chdb pandas plotly marimo
```

Создайте новый блокнот Marimo с помощью следующей команды:

```bash
marimo edit clickhouse_exploration.py
```

Должно открыться новое окно браузера с интерфейсом Marimo на localhost:2718:

<Image size="md" img={image_4} alt="Интерфейс Marimo"/>

Блокноты Marimo хранятся как чистые Python-файлы, что делает их удобными для контроля версий и совместного использования с другими.

## Установка зависимостей {#installing-dependencies}

В новой ячейке импортируйте необходимые пакеты:

```python
import marimo as mo
import chdb
import pandas as pd
import os
import plotly.express as px
import plotly.graph_objects as go
```

Если вы наведёте курсор мыши на ячейку, вы увидите два кружка с символом "+".
Вы можете нажать на них, чтобы добавить новые ячейки.

Добавьте новую ячейку и выполните простой запрос, чтобы проверить, что всё настроено правильно:

```python
result = chdb.query("SELECT 'Hello ClickHouse from Marimo!'", "DataFrame")
result
```

Вы должны увидеть результат, показанный под только что выполненной ячейкой:

<Image size="md" img={image_5} alt="Marimo hello world"/>

## Исследование данных {#exploring-the-data}

Теперь, когда набор данных о ценах в Великобритании настроен, а chDB запущен и работает в блокноте Marimo, мы можем начать исследовать наши данные.
Давайте представим, что нас интересует, как цена изменялась со временем для конкретной области в Великобритании, такой как столица Лондон.
Функция [`remoteSecure`](/docs/sql-reference/table-functions/remote) ClickHouse позволяет легко извлекать данные из ClickHouse Cloud.
Вы можете указать chDB вернуть эти данные в процессе в виде фрейма данных Pandas — это удобный и знакомый способ работы с данными.

### Запрос данных ClickHouse Cloud {#querying-clickhouse-cloud-data}

Создайте новую ячейку со следующим запросом для получения данных о ценах в Великобритании из вашего сервиса ClickHouse Cloud и преобразования их в `pandas.DataFrame`:

```python
query = f"""
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year
"""

df = chdb.query(query, "DataFrame")
df.head()
```

В приведённом выше фрагменте кода `chdb.query(query, "DataFrame")` выполняет указанный запрос и выводит результат в виде фрейма данных Pandas.

В запросе мы используем функцию [`remoteSecure`](/sql-reference/table-functions/remote) для подключения к ClickHouse Cloud.

Функция `remoteSecure` принимает в качестве параметров:
- строку подключения
- имя базы данных и таблицы для использования
- ваше имя пользователя
- ваш пароль

В качестве передовой практики безопасности вы должны предпочесть использование переменных среды для параметров имени пользователя и пароля, а не указывать их непосредственно в функции, хотя это возможно, если вы хотите.

Функция `remoteSecure` подключается к удалённому сервису ClickHouse Cloud, выполняет запрос и возвращает результат.
В зависимости от размера ваших данных это может занять несколько секунд.

В этом случае мы возвращаем среднюю цену за год и фильтруем по `town='LONDON'`.
Результат затем сохраняется как DataFrame в переменной с именем `df`.

### Визуализация данных {#visualizing-the-data}

Теперь, когда данные доступны нам в знакомой форме, давайте исследуем, как цены на недвижимость в Лондоне изменялись со временем.

Marimo особенно хорошо работает с интерактивными библиотеками построения графиков, такими как Plotly.
В новой ячейке создайте интерактивную диаграмму:

```python
fig = px.line(
    df, 
    x='year', 
    y='price',
    title='Average Property Prices in London Over Time',
    labels={'price': 'Average Price (£)', 'year': 'Year'}
)

fig.update_traces(mode='lines+markers')
fig.update_layout(hovermode='x unified')
fig
```

Возможно, неудивительно, что цены на недвижимость в Лондоне со временем существенно выросли.

<Image size="md" img={image_6} alt="Визуализация данных в Marimo"/>

Одна из сильных сторон Marimo — это его реактивная модель выполнения. Давайте создадим интерактивный виджет для динамического выбора различных городов.

### Интерактивный выбор города {#interactive-town-selection}

В новой ячейке создайте выпадающий список для выбора различных городов:

```python
town_selector = mo.ui.dropdown(
    options=['LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'LIVERPOOL'],
    value='LONDON',
    label='Select a town:'
)
town_selector
```

В другой ячейке создайте запрос, который реагирует на выбор города. Когда вы измените выпадающий список, эта ячейка автоматически повторно выполнится:

```python
query_reactive = f"""
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = '{town_selector.value}'
GROUP BY year
ORDER BY year
"""

df_reactive = chdb.query(query_reactive, "DataFrame")
df_reactive
```

Теперь создайте диаграмму, которая автоматически обновляется при изменении города.
Вы можете переместить диаграмму над динамическим фреймом данных, чтобы она появлялась
под ячейкой с выпадающим списком.

```python
fig_reactive = px.line(
    df_reactive,
    x='year',
    y='price',
    title=f'Average Property Prices in {town_selector.value} Over Time',
    labels={'price': 'Average Price (£)', 'year': 'Year'}
)

fig_reactive.update_traces(mode='lines+markers')
fig_reactive.update_layout(hovermode='x unified')
fig_reactive
```

Теперь, когда вы выбираете город из выпадающего списка, диаграмма будет обновляться динамически:

<Image size="md" img={image_7} alt="Динамическая диаграмма Marimo"/>

### Исследование распределения цен с интерактивными диаграммами типа "ящик с усами" {#exploring-price-distributions}

Давайте глубже погрузимся в данные, изучив распределение цен на недвижимость в Лондоне для различных лет.
Диаграмма "ящик с усами" покажет нам медиану, квартили и выбросы, давая нам гораздо лучшее понимание, чем просто средняя цена.
Сначала давайте создадим ползунок года, который позволит нам интерактивно исследовать различные годы:

В новой ячейке добавьте следующее:

```python
year_slider = mo.ui.slider(
    start=1995,
    stop=2024,
    value=2020,
    step=1,
    label='Select Year:',
    show_value=True
)
year_slider
```

Теперь давайте запросим индивидуальные цены на недвижимость для выбранного года.
Обратите внимание, что мы не агрегируем здесь — нам нужны все индивидуальные транзакции для построения нашего распределения:

```python
query_distribution = f"""
SELECT
    price,
    toYear(date) AS year
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = 'LONDON'
  AND toYear(date) = {year_slider.value}
  AND price > 0
  AND price < 5000000
"""

df_distribution = chdb.query(query_distribution, "DataFrame")

# создаём интерактивную диаграмму "ящик с усами".
fig_box = go.Figure()

fig_box.add_trace(
    go.Box(
        y=df_distribution['price'],
        name=f'London {year_slider.value}',
        boxmean='sd',  # Показать среднее и стандартное отклонение
        marker_color='lightblue',
        boxpoints='outliers'  # Показать точки-выбросы
    )
)

fig_box.update_layout(
    title=f'Distribution of Property Prices in London ({year_slider.value})',
    yaxis=dict(
        title='Price (£)',
        tickformat=',.0f'
    ),
    showlegend=False,
    height=600
)

fig_box
```
Если вы выберете кнопку параметров в правом верхнем углу ячейки, вы можете скрыть
код.
По мере перемещения ползунка график будет автоматически обновляться благодаря реактивному выполнению Marimo:

<Image size="md" img={image_8} alt="Динамическая диаграмма Marimo"/>

## Заключение {#summary}

Это руководство продемонстрировало, как вы можете использовать chDB для исследования ваших данных в ClickHouse Cloud с помощью блокнотов Marimo.
Используя набор данных о ценах на недвижимость в Великобритании, мы показали, как запрашивать удалённые данные ClickHouse Cloud с помощью функции `remoteSecure()` и преобразовывать результаты непосредственно в фреймы данных Pandas для анализа и визуализации.
Благодаря chDB и реактивной модели выполнения Marimo специалисты по анализу данных могут использовать мощные SQL-возможности ClickHouse вместе со знакомыми инструментами Python, такими как Pandas и Plotly, с дополнительным преимуществом интерактивных виджетов и автоматического отслеживания зависимостей, которые делают исследовательский анализ более эффективным и воспроизводимым.