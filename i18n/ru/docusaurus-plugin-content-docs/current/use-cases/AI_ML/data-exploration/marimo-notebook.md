---
slug: /use-cases/AI/marimo-notebook
sidebar_label: 'Исследование данных с помощью ноутбуков Marimo и chDB'
title: 'Исследование данных с помощью ноутбуков Marimo и chDB'
description: 'В этом руководстве показано, как настроить и использовать chDB для исследования данных из ClickHouse Cloud или локальных файлов в ноутбуках Marimo'
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

В этом руководстве вы узнаете, как исследовать набор данных в ClickHouse Cloud в ноутбуке Marimo с помощью [chDB](/docs/chdb) — быстрого внутрипроцессного SQL OLAP-движка на базе ClickHouse.

**Предварительные требования:**

* Python 3.8 или выше
* виртуальное окружение
* работающий сервис ClickHouse Cloud и ваши [данные для подключения](/docs/cloud/guides/sql-console/gather-connection-details)

:::tip
Если у вас ещё нет аккаунта ClickHouse Cloud, вы можете [зарегистрироваться](https://console.clickhouse.cloud/signUp?loc=docs-marimo-chdb) и оформить пробную подписку, получив $300 в виде бесплатных кредитов для начала работы.
:::

**Чему вы научитесь:**

* Подключаться к ClickHouse Cloud из ноутбуков Marimo с использованием chDB
* Выполнять запросы к удалённым наборам данных и преобразовывать результаты в объекты DataFrame библиотеки Pandas
* Визуализировать данные с помощью Plotly в Marimo
* Использовать реактивную модель выполнения Marimo для интерактивного исследования данных

Мы будем использовать набор данных UK Property Price, который доступен в ClickHouse Cloud как один из стартовых наборов данных.
Он содержит данные о ценах, по которым дома продавались в Соединённом Королевстве с 1995 по 2024 год.


## Настройка {#setup}

### Загрузка набора данных {#loading-the-dataset}

Чтобы добавить этот набор данных в существующий сервис ClickHouse Cloud, войдите на [console.clickhouse.cloud](https://console.clickhouse.cloud/) с использованием данных своей учётной записи.

В меню слева нажмите `Data sources`. Затем нажмите `Predefined sample data`:

<Image size="md" img={image_1} alt="Добавить пример набора данных" />

Выберите `Get started` в карточке UK property price paid data (4GB):

<Image size="md" img={image_2} alt="Выбор набора данных UK price paid" />

Затем нажмите `Import dataset`:

<Image size="md" img={image_3} alt="Импорт набора данных UK price paid" />

ClickHouse автоматически создаст таблицу `pp_complete` в базе данных `default` и заполнит таблицу 28,92 миллионами строк ценовых данных.

Чтобы снизить вероятность раскрытия ваших учётных данных, мы рекомендуем добавить имя пользователя и пароль ClickHouse Cloud в виде переменных окружения на локальной машине.
В терминале выполните следующую команду, чтобы добавить имя пользователя и пароль как переменные окружения:

### Настройка учётных данных {#setting-up-credentials}

```bash
export CLICKHOUSE_CLOUD_HOSTNAME=<ИМЯ_ХОСТА>
export CLICKHOUSE_CLOUD_USER=default
export CLICKHOUSE_CLOUD_PASSWORD=ваш_реальный_пароль
```

:::note
Переменные окружения, указанные выше, сохраняются только на время текущего сеанса терминала.
Чтобы сделать их постоянными, добавьте их в конфигурационный файл вашей оболочки.
:::

### Установка Marimo {#installing-marimo}

Теперь активируйте ваше виртуальное окружение.
Находясь в виртуальном окружении, установите следующие пакеты, которые мы будем использовать в этом руководстве:

```python
pip install chdb pandas plotly marimo
```

Создайте новый ноутбук Marimo с помощью следующей команды:

```bash
marimo edit clickhouse_exploration.py
```

В новом окне браузера должен открыться интерфейс Marimo по адресу localhost:2718:

<Image size="md" img={image_4} alt="Интерфейс Marimo" />

Ноутбуки Marimo представляют собой обычные файлы Python, поэтому их легко размещать в системах контроля версий и делиться ими с другими.


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

Если вы наведёте курсор мыши на ячейку, вы увидите, что появляются два кружка с символом «+».
Вы можете нажать на них, чтобы добавить новые ячейки.

Добавьте новую ячейку и выполните простой запрос, чтобы убедиться, что всё настроено правильно:

```python
result = chdb.query("SELECT 'Привет, ClickHouse, от Marimo!'", "DataFrame")
result
```

Под ячейкой, которую вы только что запустили, должен появиться результат:

<Image size="md" img={image_5} alt="Marimo hello world" />


## Исследование данных {#exploring-the-data}

После того как мы настроили набор данных UK price paid и запустили chDB в блокноте Marimo, можно приступать к исследованию данных.
Представим, что нас интересует, как изменялась цена со временем для определённого района в Великобритании, например столицы — Лондона.
Функция ClickHouse [`remoteSecure`](/docs/sql-reference/table-functions/remote) позволяет легко получать данные из ClickHouse Cloud.
Вы можете указать chDB вернуть эти данные напрямую в виде фрейма данных Pandas — это удобный и хорошо знакомый способ работы с данными.

### Выполнение запросов к данным в ClickHouse Cloud {#querying-clickhouse-cloud-data}

Создайте новую ячейку со следующим запросом, чтобы получить данные UK price paid из вашего сервиса ClickHouse Cloud и преобразовать их в `pandas.DataFrame`:

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

В приведённом выше фрагменте `chdb.query(query, "DataFrame")` выполняет указанный запрос и выводит результат в виде Pandas DataFrame.

В запросе мы используем функцию [`remoteSecure`](/sql-reference/table-functions/remote) для подключения к ClickHouse Cloud.

Функция `remoteSecure` принимает в качестве параметров:

* строку подключения
* имя базы данных и таблицы
* ваше имя пользователя
* ваш пароль

В целях безопасности рекомендуется использовать переменные окружения для параметров имени пользователя и пароля, а не указывать их непосредственно в функции, хотя при необходимости это возможно.

Функция `remoteSecure` подключается к удалённому сервису ClickHouse Cloud, выполняет запрос и возвращает результат.
В зависимости от объёма ваших данных это может занять несколько секунд.

В данном случае мы возвращаем среднюю цену за год и фильтруем по `town='LONDON'`.
Затем результат сохраняется как DataFrame в переменной `df`.

### Визуализация данных {#visualizing-the-data}

Теперь, когда данные доступны нам в привычной форме, давайте посмотрим, как со временем изменялись цены на недвижимость в Лондоне.

Marimo особенно хорошо работает с интерактивными библиотеками визуализации, такими как Plotly.
В новой ячейке создайте интерактивный график:

```python
fig = px.line(
    df, 
    x='year', 
    y='price',
    title='Средние цены на недвижимость в Лондоне по годам',
    labels={'price': 'Средняя цена (£)', 'year': 'Год'}
)

fig.update_traces(mode='lines+markers')
fig.update_layout(hovermode='x unified')
fig
```

Вполне ожидаемо, что со временем цены на недвижимость в Лондоне значительно выросли.

<Image size="md" img={image_6} alt="Визуализация данных Marimo" />

Одна из сильных сторон Marimo — её реактивная модель исполнения. Давайте создадим интерактивный виджет для динамического выбора городов.

### Интерактивный выбор города {#interactive-town-selection}

В новой ячейке создайте выпадающий список для выбора городов:

```python
town_selector = mo.ui.dropdown(
    options=['LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'LIVERPOOL'],
    value='LONDON',
    label='Выберите город:'
)
town_selector
```

В другой ячейке создайте запрос, который реагирует на выбор города. Когда вы измените значение в выпадающем списке, эта ячейка будет выполняться повторно автоматически:

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

Теперь создайте диаграмму, которая будет автоматически обновляться при смене города.
Вы можете переместить диаграмму выше динамического датафрейма, чтобы она располагалась
под ячейкой с выпадающим списком.


```python
fig_reactive = px.line(
    df_reactive,
    x='year',
    y='price',
    title=f'Средние цены на недвижимость в {town_selector.value} по годам',
    labels={'price': 'Средняя цена (£)', 'year': 'Год'}
)

fig_reactive.update_traces(mode='lines+markers')
fig_reactive.update_layout(hovermode='x unified')
fig_reactive
```

Теперь, когда вы выбираете город из выпадающего списка, график будет динамически обновляться:

<Image size="md" img={image_7} alt="Динамический график Marimo" />

### Изучение распределения цен с помощью интерактивных коробчатых диаграмм {#exploring-price-distributions}

Давайте глубже изучим данные, рассмотрев распределение цен на недвижимость в Лондоне по разным годам.
Коробчатая диаграмма (box-and-whisker plot) покажет медиану, квартили и выбросы, давая гораздо более полное представление, чем просто средняя цена.
Сначала создадим ползунок выбора года, который позволит нам интерактивно исследовать данные за разные годы:

В новой ячейке добавьте следующее:

```python
year_slider = mo.ui.slider(
    start=1995,
    stop=2024,
    value=2020,
    step=1,
    label='Выберите год:',
    show_value=True
)
year_slider
```

Теперь давайте запросим цены отдельных объектов недвижимости за выбранный год.
Обратите внимание, что мы здесь не выполняем агрегацию — нам нужны все отдельные сделки, чтобы построить наше распределение:

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

# Создадим интерактивную диаграмму размаха
fig_box = go.Figure()

fig_box.add_trace(
    go.Box(
        y=df_distribution['price'],
        name=f'London {year_slider.value}',
        boxmean='sd',  # Показать среднее значение и стандартное отклонение
        marker_color='lightblue',
        boxpoints='outliers'  # Показать значения-выбросы
    )
)

fig_box.update_layout(
    title=f'Распределение цен на недвижимость в Лондоне ({year_slider.value})',
    yaxis=dict(
        title='Цена (£)',
        tickformat=',.0f'
    ),
    showlegend=False,
    height=600
)

fig_box
```

Если нажать кнопку параметров в правом верхнем углу ячейки, можно скрыть
код.
При перемещении ползунка график будет автоматически обновляться благодаря реактивному выполнению Marimo:

<Image size="md" img={image_8} alt="Динамический график Marimo"/>


## Итоги {#summary}

В этом руководстве было показано, как использовать chDB для исследования данных в ClickHouse Cloud с помощью ноутбуков Marimo.
На примере набора данных UK Property Price мы продемонстрировали, как выполнять запросы к удалённым данным ClickHouse Cloud с помощью функции `remoteSecure()` и преобразовывать результаты непосредственно в DataFrame библиотеки Pandas для анализа и визуализации.
Благодаря chDB и реактивной модели выполнения Marimo дата-сайентисты могут использовать мощные возможности SQL в ClickHouse вместе с привычными инструментами Python, такими как Pandas и Plotly, с дополнительным преимуществом интерактивных виджетов и автоматического отслеживания зависимостей, что делает исследовательский анализ более эффективным и воспроизводимым.
