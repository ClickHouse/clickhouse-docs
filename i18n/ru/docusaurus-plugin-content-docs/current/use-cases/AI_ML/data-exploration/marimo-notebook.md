---
slug: /use-cases/AI/marimo-notebook
sidebar_label: 'Исследование данных в блокнотах Marimo и chDB'
title: 'Исследование данных в блокнотах Marimo и chDB'
description: 'В этом руководстве объясняется, как настроить и использовать chDB для исследования данных из ClickHouse Cloud или локальных файлов в блокнотах Marimo'
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

В этом руководстве вы узнаете, как исследовать набор данных в ClickHouse Cloud в блокноте Marimo с помощью [chDB](/docs/chdb) — быстрого встроенного SQL OLAP-движка на базе ClickHouse.

**Предварительные требования:**

* Python 3.8 или выше
* виртуальное окружение
* работающий сервис ClickHouse Cloud и ваши [данные для подключения](/docs/cloud/guides/sql-console/gather-connection-details)

:::tip
Если у вас ещё нет аккаунта ClickHouse Cloud, вы можете [зарегистрироваться](https://console.clickhouse.cloud/signUp?loc=docs-marimo-chdb)
и получить пробный период с бесплатными кредитами на сумму $300.
:::

**Чему вы научитесь:**

* Подключаться к ClickHouse Cloud из блокнотов Marimo с помощью chDB
* Выполнять запросы к удалённым наборам данных и преобразовывать результаты в Pandas DataFrame
* Визуализировать данные с помощью Plotly в Marimo
* Использовать реактивную модель выполнения Marimo для интерактивного исследования данных

Мы будем использовать набор данных UK Property Price, который доступен в ClickHouse Cloud как один из стартовых наборов данных.
Он содержит данные о ценах, по которым продавались дома в Соединённом Королевстве с 1995 по 2024 год.


## Настройка {#setup}

### Загрузка набора данных {#loading-the-dataset}

Чтобы добавить этот набор данных в существующий сервис ClickHouse Cloud, войдите в [console.clickhouse.cloud](https://console.clickhouse.cloud/) с данными вашей учетной записи.

В меню слева нажмите `Data sources`. Затем нажмите `Predefined sample data`:

<Image size='md' img={image_1} alt='Добавить пример набора данных' />

Выберите `Get started` в карточке UK property price paid data (4GB):

<Image size='md' img={image_2} alt='Выбрать набор данных UK price paid' />

Затем нажмите `Import dataset`:

<Image size='md' img={image_3} alt='Импортировать набор данных UK price paid' />

ClickHouse автоматически создаст таблицу `pp_complete` в базе данных `default` и заполнит её 28,92 миллионами строк данных о ценах.

Чтобы снизить риск раскрытия ваших учетных данных, рекомендуется добавить имя пользователя и пароль Cloud в качестве переменных окружения на локальной машине.
Выполните в терминале следующую команду, чтобы добавить имя пользователя и пароль в качестве переменных окружения:

### Настройка учетных данных {#setting-up-credentials}

```bash
export CLICKHOUSE_CLOUD_HOSTNAME=<HOSTNAME>
export CLICKHOUSE_CLOUD_USER=default
export CLICKHOUSE_CLOUD_PASSWORD=your_actual_password
```

:::note
Переменные окружения выше сохраняются только на время сеанса терминала.
Чтобы установить их постоянно, добавьте их в конфигурационный файл вашей оболочки.
:::

### Установка Marimo {#installing-marimo}

Теперь активируйте виртуальное окружение.
Находясь в виртуальном окружении, установите следующие пакеты, которые мы будем использовать в этом руководстве:

```python
pip install chdb pandas plotly marimo
```

Создайте новый блокнот Marimo с помощью следующей команды:

```bash
marimo edit clickhouse_exploration.py
```

Должно открыться новое окно браузера с интерфейсом Marimo на localhost:2718:

<Image size='md' img={image_4} alt='Интерфейс Marimo' />

Блокноты Marimo хранятся в виде чистых файлов Python, что упрощает контроль версий и обмен ими с другими пользователями.


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

Если навести курсор мыши на ячейку, появятся два кружка с символом «+».
Нажмите на них, чтобы добавить новые ячейки.

Добавьте новую ячейку и выполните простой запрос, чтобы проверить правильность настройки:

```python
result = chdb.query("SELECT 'Hello ClickHouse from Marimo!'", "DataFrame")
result
```

Результат должен отобразиться под только что выполненной ячейкой:

<Image size='md' img={image_5} alt='Marimo hello world' />


## Исследование данных {#exploring-the-data}

Теперь, когда набор данных о ценах на недвижимость в Великобритании настроен, а chDB запущен в ноутбуке Marimo, мы можем приступить к исследованию данных.
Предположим, нас интересует, как изменялась цена с течением времени для конкретного региона Великобритании, например столицы — Лондона.
Функция [`remoteSecure`](/docs/sql-reference/table-functions/remote) в ClickHouse позволяет легко получать данные из ClickHouse Cloud.
Вы можете указать chDB вернуть эти данные в процессе в виде Pandas DataFrame — это удобный и привычный способ работы с данными.

### Запрос данных из ClickHouse Cloud {#querying-clickhouse-cloud-data}

Создайте новую ячейку со следующим запросом, чтобы получить данные о ценах на недвижимость в Великобритании из вашего сервиса ClickHouse Cloud и преобразовать их в `pandas.DataFrame`:

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

В приведенном выше фрагменте `chdb.query(query, "DataFrame")` выполняет указанный запрос и выводит результат в виде Pandas DataFrame.

В запросе мы используем функцию [`remoteSecure`](/sql-reference/table-functions/remote) для подключения к ClickHouse Cloud.

Функция `remoteSecure` принимает в качестве параметров:

- строку подключения
- имя базы данных и таблицы для использования
- ваше имя пользователя
- ваш пароль

В качестве рекомендации по безопасности следует использовать переменные окружения для параметров имени пользователя и пароля, а не указывать их непосредственно в функции, хотя это возможно при желании.

Функция `remoteSecure` подключается к удаленному сервису ClickHouse Cloud, выполняет запрос и возвращает результат.
В зависимости от размера данных это может занять несколько секунд.

В данном случае мы возвращаем среднюю цену за год и фильтруем по `town='LONDON'`.
Результат затем сохраняется в виде DataFrame в переменной `df`.

### Визуализация данных {#visualizing-the-data}

Теперь, когда данные доступны нам в привычной форме, давайте исследуем, как изменялись цены на недвижимость в Лондоне с течением времени.

Marimo особенно хорошо работает с интерактивными библиотеками визуализации, такими как Plotly.
В новой ячейке создайте интерактивный график:

```python
fig = px.line(
    df,
    x='year',
    y='price',
    title='Средние цены на недвижимость в Лондоне с течением времени',
    labels={'price': 'Средняя цена (£)', 'year': 'Год'}
)

fig.update_traces(mode='lines+markers')
fig.update_layout(hovermode='x unified')
fig
```

Возможно, неудивительно, что цены на недвижимость в Лондоне существенно выросли с течением времени.

<Image size='md' img={image_6} alt='Визуализация данных в Marimo' />

Одна из сильных сторон Marimo — это реактивная модель выполнения. Давайте создадим интерактивный виджет для динамического выбора различных городов.

### Интерактивный выбор города {#interactive-town-selection}

В новой ячейке создайте выпадающий список для выбора различных городов:

```python
town_selector = mo.ui.dropdown(
    options=['LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'LIVERPOOL'],
    value='LONDON',
    label='Выберите город:'
)
town_selector
```

В другой ячейке создайте запрос, который реагирует на выбор города. При изменении выпадающего списка эта ячейка будет автоматически выполнена повторно:

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

Теперь создайте график, который автоматически обновляется при изменении города.
Вы можете переместить график над динамическим DataFrame, чтобы он отображался
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

Теперь при выборе города из выпадающего списка график будет обновляться автоматически:

<Image size='md' img={image_7} alt='Marimo dynamic chart' />

### Исследование распределения цен с помощью интерактивных диаграмм размаха {#exploring-price-distributions}

Давайте углубимся в данные, изучив распределение цен на недвижимость в Лондоне за разные годы.
Диаграмма размаха покажет медиану, квартили и выбросы, что даст гораздо более полное представление, чем просто средняя цена.
Сначала создадим ползунок для выбора года, который позволит интерактивно исследовать различные годы:

В новой ячейке добавьте следующий код:

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

Теперь запросим индивидуальные цены на недвижимость за выбранный год.
Обратите внимание, что здесь мы не выполняем агрегацию — нам нужны все отдельные транзакции для построения распределения:

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

```


# создайте интерактивный box plot.

fig&#95;box = go.Figure()

fig&#95;box.add&#95;trace(
go.Box(
y=df&#95;distribution[&#39;price&#39;],
name=f&#39;London {year_slider.value}&#39;,
boxmean=&#39;sd&#39;,  # Показать среднее и стандартное отклонение
marker&#95;color=&#39;lightblue&#39;,
boxpoints=&#39;outliers&#39;  # Показать выбросы
)
)

fig&#95;box.update&#95;layout(
title=f&#39;Distribution of Property Prices in London ({year_slider.value})&#39;,
yaxis=dict(
title=&#39;Price (£)&#39;,
tickformat=&#39;,.0f&#39;
),
showlegend=False,
height=600
)

fig&#95;box

```
Если нажать кнопку настроек в правом верхнем углу ячейки, можно скрыть
код.
При перемещении ползунка график будет автоматически обновляться благодаря реактивному выполнению Marimo:

<Image size="md" img={image_8} alt="Динамический график Marimo"/>
```


## Резюме {#summary}

В этом руководстве показано, как использовать chDB для исследования данных в ClickHouse Cloud с помощью блокнотов Marimo.
На примере набора данных UK Property Price мы продемонстрировали, как выполнять запросы к удалённым данным ClickHouse Cloud с помощью функции `remoteSecure()` и преобразовывать результаты напрямую в Pandas DataFrames для анализа и визуализации.
Благодаря chDB и реактивной модели выполнения Marimo специалисты по работе с данными могут использовать мощные SQL-возможности ClickHouse вместе со знакомыми инструментами Python, такими как Pandas и Plotly, получая дополнительные преимущества в виде интерактивных виджетов и автоматического отслеживания зависимостей, что делает исследовательский анализ более эффективным и воспроизводимым.
