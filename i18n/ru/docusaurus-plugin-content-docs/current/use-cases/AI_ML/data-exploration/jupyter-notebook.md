---
slug: /use-cases/AI/jupyter-notebook
sidebar_label: 'Исследование данных в Jupyter Notebook с помощью chDB'
title: 'Исследование данных в Jupyter Notebook с помощью chDB'
description: 'В этом руководстве описано, как настроить и использовать chDB для исследования данных из ClickHouse Cloud или локальных файлов в Jupyter Notebook'
keywords: ['ML', 'Jupyer', 'chDB', 'pandas']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import image_1 from '@site/static/images/use-cases/AI_ML/jupyter/1.png';
import image_2 from '@site/static/images/use-cases/AI_ML/jupyter/2.png';
import image_3 from '@site/static/images/use-cases/AI_ML/jupyter/3.png';
import image_4 from '@site/static/images/use-cases/AI_ML/jupyter/4.png';
import image_5 from '@site/static/images/use-cases/AI_ML/jupyter/5.png';
import image_6 from '@site/static/images/use-cases/AI_ML/jupyter/6.png';
import image_7 from '@site/static/images/use-cases/AI_ML/jupyter/7.png';
import image_8 from '@site/static/images/use-cases/AI_ML/jupyter/8.png';
import image_9 from '@site/static/images/use-cases/AI_ML/jupyter/9.png';


# Исследование данных с помощью Jupyter Notebook и chDB

В этом руководстве вы узнаете, как исследовать набор данных в ClickHouse Cloud в Jupyter Notebook с помощью [chDB](/chdb) — быстрого встраиваемого SQL OLAP-движка на базе ClickHouse.

**Предварительные требования**:
- виртуальное окружение
- работающий сервис ClickHouse Cloud и ваши [параметры подключения](/cloud/guides/sql-console/gather-connection-details)

:::tip
Если у вас ещё нет аккаунта ClickHouse Cloud, вы можете [зарегистрироваться](https://console.clickhouse.cloud/signUp?loc=docs-juypter-chdb),
чтобы получить пробный доступ и $300 в виде бесплатных кредитов на старт.
:::

**Чему вы научитесь:**
- Подключаться к ClickHouse Cloud из Jupyter Notebook с помощью chDB
- Выполнять запросы к удалённым наборам данных и преобразовывать результаты в DataFrame библиотеки Pandas
- Комбинировать данные из облака с локальными CSV-файлами для анализа
- Визуализировать данные с помощью matplotlib

Мы будем использовать набор данных UK Property Price, который доступен в ClickHouse Cloud как один из стартовых датасетов.
Он содержит данные о ценах, по которым продавались дома в Великобритании с 1995 по 2024 год.



## Настройка {#setup}

Чтобы добавить этот набор данных в существующий сервис ClickHouse Cloud, войдите в [console.clickhouse.cloud](https://console.clickhouse.cloud/) с учетными данными вашей учетной записи.

В меню слева нажмите `Data sources`. Затем нажмите `Predefined sample data`:

<Image size='md' img={image_1} alt='Добавить пример набора данных' />

Выберите `Get started` в карточке UK property price paid data (4GB):

<Image size='md' img={image_2} alt='Выбрать набор данных UK price paid' />

Затем нажмите `Import dataset`:

<Image size='md' img={image_3} alt='Импортировать набор данных UK price paid' />

ClickHouse автоматически создаст таблицу `pp_complete` в базе данных `default` и заполнит её 28,92 миллионами строк данных о ценах.

Чтобы снизить вероятность раскрытия учетных данных, рекомендуется добавить имя пользователя и пароль Cloud в качестве переменных окружения на локальной машине.
Выполните в терминале следующую команду, чтобы добавить имя пользователя и пароль в качестве переменных окружения:

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=your_actual_password
```

:::note
Переменные окружения выше сохраняются только на время сеанса терминала.
Чтобы установить их постоянно, добавьте их в конфигурационный файл оболочки.
:::

Теперь активируйте виртуальное окружение.
Из виртуального окружения установите Jupyter Notebook следующей командой:

```python
pip install notebook
```

Запустите Jupyter Notebook следующей командой:

```python
jupyter notebook
```

Должно открыться новое окно браузера с интерфейсом Jupyter на `localhost:8888`.
Нажмите `File` > `New` > `Notebook`, чтобы создать новый Notebook.

<Image size='md' img={image_4} alt='Создать новый notebook' />

Вам будет предложено выбрать ядро.
Выберите любое доступное ядро Python, в этом примере мы выберем `ipykernel`:

<Image size='md' img={image_5} alt='Выбрать ядро' />

В пустой ячейке введите следующую команду для установки chDB, который мы будем использовать для подключения к удаленному экземпляру ClickHouse Cloud:

```python
pip install chdb
```

Теперь можно импортировать chDB и выполнить простой запрос, чтобы проверить правильность настройки:

```python
import chdb

result = chdb.query("SELECT 'Hello, ClickHouse!' as message")
print(result)
```


## Исследование данных {#exploring-the-data}

Теперь, когда набор данных о ценах на недвижимость в Великобритании настроен и chDB запущен в Jupyter notebook, можно приступить к исследованию данных.

Предположим, нас интересует, как менялась цена с течением времени в конкретном регионе Великобритании, например, в столице — Лондоне.
Функция [`remoteSecure`](/sql-reference/table-functions/remote) ClickHouse позволяет легко получать данные из ClickHouse Cloud.
Вы можете настроить chDB так, чтобы он возвращал эти данные непосредственно в виде Pandas DataFrame — это удобный и привычный способ работы с данными.

Напишите следующий запрос, чтобы получить данные о ценах на недвижимость в Великобритании из вашего сервиса ClickHouse Cloud и преобразовать их в `pandas.DataFrame`:

```python
import os
from dotenv import load_dotenv
import chdb
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

```


# Загрузка переменных среды из файла .env

load&#95;dotenv()

username = os.environ.get(&#39;CLICKHOUSE&#95;USER&#39;)
password = os.environ.get(&#39;CLICKHOUSE&#95;PASSWORD&#39;)

query = f&quot;&quot;&quot;
SELECT
toYear(date) AS year,
avg(price) AS avg&#95;price
FROM remoteSecure(
&#39;****.europe-west4.gcp.clickhouse.cloud&#39;,
default.pp&#95;complete,
&#39;{username}&#39;,
&#39;{password}&#39;
)
WHERE town = &#39;LONDON&#39;
GROUP BY toYear(date)
ORDER BY year;
&quot;&quot;&quot;

df = chdb.query(query, &quot;DataFrame&quot;)
df.head()

````

В приведенном выше фрагменте кода `chdb.query(query, "DataFrame")` выполняет указанный запрос и выводит результат в терминал в виде Pandas DataFrame.
В запросе используется функция `remoteSecure` для подключения к ClickHouse Cloud.
Функция `remoteSecure` принимает следующие параметры:
- строку подключения
- имя базы данных и таблицы
- имя пользователя
- пароль

В качестве рекомендации по безопасности следует использовать переменные окружения для передачи имени пользователя и пароля, а не указывать их непосредственно в функции, хотя при необходимости это допустимо.

Функция `remoteSecure` подключается к удаленному сервису ClickHouse Cloud, выполняет запрос и возвращает результат.
В зависимости от объема данных выполнение может занять несколько секунд.
В данном случае возвращается средняя цена по годам с фильтрацией по условию `town='LONDON'`.
Результат сохраняется в виде DataFrame в переменной `df`.

Метод `df.head` отображает только первые несколько строк возвращенных данных:

<Image size="md" img={image_6} alt="предварительный просмотр dataframe"/>

Выполните следующую команду в новой ячейке для проверки типов столбцов:

```python
df.dtypes
````

```response
year          uint16
avg_price    float64
dtype: object
```

Обратите внимание, что хотя `date` имеет тип `Date` в ClickHouse, в результирующем фрейме данных он имеет тип `uint16`.
chDB автоматически определяет наиболее подходящий тип при возврате DataFrame.

Теперь, когда данные доступны нам в привычной форме, давайте посмотрим, как со временем изменялись цены на недвижимость в Лондоне.

В новой ячейке выполните следующую команду, чтобы построить простой график зависимости цены от времени для Лондона с использованием matplotlib:

```python
plt.figure(figsize=(12, 6))
plt.plot(df['year'], df['avg_price'], marker='o')
plt.xlabel('Год')
plt.ylabel('Цена (£)')
plt.title('Динамика цен на недвижимость в Лондоне')
```


# Показывать каждый второй год, чтобы избежать перегруженности

years&#95;to&#95;show = df[&#39;year&#39;][::2]  # Every 2nd year
plt.xticks(years&#95;to&#95;show, rotation=45)

plt.grid(True, alpha=0.3)
plt.tight&#95;layout()
plt.show()

````

<Image size="md" img={image_7} alt="dataframe preview"/>

Неудивительно, что цены на недвижимость в Лондоне значительно выросли с течением времени.

Коллега-специалист по данным прислал нам CSV-файл с дополнительными переменными, связанными с жильём, и хочет узнать, как 
изменилось количество проданных домов в Лондоне с течением времени.
Давайте построим графики некоторых из этих переменных относительно цен на жильё и посмотрим, сможем ли мы обнаружить какую-либо корреляцию.

Вы можете использовать движок таблиц `file` для чтения файлов непосредственно с вашего локального компьютера.
В новой ячейке выполните следующую команду для создания нового DataFrame из локального CSV-файла.

```python
query = f"""
SELECT 
    toYear(date) AS year,
    sum(houses_sold)*1000
    FROM file('/Users/datasci/Desktop/housing_in_london_monthly_variables.csv')
WHERE area = 'city of london' AND houses_sold IS NOT NULL
GROUP BY toYear(date)
ORDER BY year;
"""

df_2 = chdb.query(query, "DataFrame")
df_2.head()
````

<details>
  <summary>Чтение из нескольких источников за один шаг</summary>
  Также можно читать из нескольких источников за один шаг. Для этого вы можете использовать приведённый ниже запрос с `JOIN`:

  ```python
  query = f"""
  SELECT 
      toYear(date) AS year,
      avg(price) AS avg_price, housesSold
  FROM remoteSecure(
  '****.europe-west4.gcp.clickhouse.cloud',
  default.pp_complete,
  '{username}',
  '{password}'
  ) AS remote
  JOIN (
    SELECT 
      toYear(date) AS year,
      sum(houses_sold)*1000 AS housesSold
      FROM file('/Users/datasci/Desktop/housing_in_london_monthly_variables.csv')
    WHERE area = 'city of london' AND houses_sold IS NOT NULL
    GROUP BY toYear(date)
    ORDER BY year
  ) AS local ON local.year = remote.year
  WHERE town = 'LONDON'
  GROUP BY toYear(date)
  ORDER BY year;
  """
  ```
</details>

<Image size="md" img={image_8} alt="предварительный просмотр датафрейма" />

Хотя у нас отсутствуют данные, начиная с 2020 года, мы можем построить график для обоих наборов данных за период с 1995 по 2019 годы.
В новой ячейке выполните следующую команду:


```python
# Создаём фигуру с двумя осями Y
fig, ax1 = plt.subplots(figsize=(14, 8))
```


# Построение графика проданных домов по левой оси Y
color = 'tab:blue'
ax1.set_xlabel('Year')
ax1.set_ylabel('Houses Sold', color=color)
ax1.plot(df_2['year'], df_2['houses_sold'], marker='o', color=color, label='Houses Sold', linewidth=2)
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(True, alpha=0.3)



# Создайте вторую ось Y для данных о цене
ax2 = ax1.twinx()
color = 'tab:red'
ax2.set_ylabel('Average Price (£)', color=color)



# Построение графика данных о ценах до 2019 года включительно

ax2.plot(df[df['year'] <= 2019]['year'], df[df['year'] <= 2019]['avg_price'], marker='s', color=color, label='Средняя цена', linewidth=2)
ax2.tick_params(axis='y', labelcolor=color)


# Форматирование оси цен с форматированием валюты

ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'£{x:,.0f}'))


# Задать заголовок и отображать каждый 2-й год
plt.title('Рынок жилья Лондона: объем продаж и динамика цен', fontsize=14, pad=20)



# Использовать только годы до 2019 включительно для обоих наборов данных

all_years = sorted(list(set(df_2[df_2['year'] <= 2019]['year']).union(set(df[df['year'] <= 2019]['year']))))
years_to_show = all_years[::2] # Каждый второй год
ax1.set_xticks(years_to_show)
ax1.set_xticklabels(years_to_show, rotation=45)


# Добавление легенды

ax1.legend(loc=&#39;upper left&#39;)
ax2.legend(loc=&#39;upper right&#39;)

plt.tight&#95;layout()
plt.show()

```

<Image size="md" img={image_9} alt="График удалённого и локального набора данных"/>

Из представленных данных видно, что объём продаж в 1995 году составлял около 160 000 единиц и быстро вырос, достигнув пика примерно в 540 000 в 1999 году.
После этого объёмы резко снизились в середине 2000-х годов, существенно упав во время финансового кризиса 2007–2008 годов до уровня около 140 000.
Цены, напротив, демонстрировали стабильный, устойчивый рост — примерно от £150 000 в 1995 году до около £300 000 к 2005 году.
Рост значительно ускорился после 2012 года, резко поднявшись примерно с £400 000 до более чем £1 000 000 к 2019 году.
В отличие от объёма продаж, цены практически не испытали влияния кризиса 2008 года и сохранили восходящую траекторию. Впечатляет!
```


## Резюме {#summary}

Это руководство показало, как chDB обеспечивает удобное исследование данных в Jupyter-блокнотах, соединяя ClickHouse Cloud с локальными источниками данных.
На примере набора данных UK Property Price мы продемонстрировали, как выполнять запросы к удалённым данным ClickHouse Cloud с помощью функции `remoteSecure()`, читать локальные CSV-файлы с помощью движка таблиц `file()` и преобразовывать результаты напрямую в Pandas DataFrames для анализа и визуализации.
Благодаря chDB специалисты по данным могут использовать мощные SQL-возможности ClickHouse вместе со знакомыми инструментами Python, такими как Pandas и matplotlib, что упрощает объединение нескольких источников данных для комплексного анализа.

Хотя многие лондонские специалисты по данным вряд ли смогут позволить себе собственное жильё в ближайшее время, по крайней мере они могут проанализировать рынок, который сделал его для них недоступным!
