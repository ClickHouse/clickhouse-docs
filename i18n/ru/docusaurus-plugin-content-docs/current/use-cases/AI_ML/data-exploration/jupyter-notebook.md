---
slug: /use-cases/AI/jupyter-notebook
sidebar_label: 'Исследование данных в блокнотах Jupyter и chDB'
title: 'Исследование данных в блокнотах Jupyter с помощью chDB'
description: 'В этом руководстве объясняется, как настроить и использовать chDB для исследования данных из ClickHouse Cloud или локальных файлов в блокнотах Jupyter'
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

В этом руководстве вы узнаете, как исследовать набор данных в ClickHouse Cloud в Jupyter Notebook с помощью [chDB](/chdb) — быстрого встроенного SQL OLAP-движка на базе ClickHouse.

**Предварительные требования**:
- виртуальное окружение
- работающий сервис ClickHouse Cloud и ваши [параметры подключения](/cloud/guides/sql-console/gather-connection-details)

:::tip
Если у вас еще нет учетной записи ClickHouse Cloud, вы можете [зарегистрироваться](https://console.clickhouse.cloud/signUp?loc=docs-juypter-chdb)
и получить пробный период с $300 бесплатных кредитов на начало работы.
:::

**Чему вы научитесь:**
- Подключаться к ClickHouse Cloud из Jupyter Notebook с помощью chDB
- Выполнять запросы к удалённым наборам данных и преобразовывать результаты во фреймы данных Pandas (Pandas DataFrame)
- Объединять данные из облака с локальными CSV-файлами для анализа
- Визуализировать данные с помощью matplotlib

Мы будем использовать набор данных UK Property Price, который доступен в ClickHouse Cloud как один из стартовых наборов данных.
Он содержит данные о ценах, по которым дома продавались в Соединённом Королевстве с 1995 по 2024 год.



## Настройка

Чтобы добавить этот набор данных к существующему сервису ClickHouse Cloud, войдите на [console.clickhouse.cloud](https://console.clickhouse.cloud/) с использованием данных вашей учётной записи.

В меню слева нажмите `Data sources`. Затем нажмите `Predefined sample data`:

<Image size="md" img={image_1} alt="Добавление примерного набора данных" />

Выберите `Get started` в карточке набора данных UK property price paid data (4GB):

<Image size="md" img={image_2} alt="Выбор набора данных по стоимости недвижимости в Великобритании" />

Затем нажмите `Import dataset`:

<Image size="md" img={image_3} alt="Импорт набора данных по стоимости недвижимости в Великобритании" />

ClickHouse автоматически создаст таблицу `pp_complete` в базе данных `default` и заполнит её 28,92 миллионами строк данных о ценах.

Чтобы снизить вероятность раскрытия ваших учётных данных, рекомендуем добавить имя пользователя и пароль ClickHouse Cloud как переменные окружения на вашей локальной машине.
В терминале выполните следующую команду, чтобы добавить имя пользователя и пароль как переменные окружения:

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=ваш_реальный_пароль
```

:::note
Указанные выше переменные окружения сохраняются только на время текущей сессии терминала.
Чтобы сделать их постоянными, добавьте их в файл конфигурации оболочки.
:::

Теперь активируйте виртуальное окружение.
Находясь в виртуальном окружении, установите Jupyter Notebook следующей командой:

```python
pip install notebook
```

Запустите Jupyter Notebook с помощью следующей команды:

```python
Jupyter Notebook
```

В новом окне браузера должен открыться интерфейс Jupyter по адресу `localhost:8888`.
Нажмите `File` &gt; `New` &gt; `Notebook`, чтобы создать новый Notebook.

<Image size="md" img={image_4} alt="Создать новый notebook" />

Вам будет предложено выбрать ядро (kernel).
Выберите любое доступное вам Python-ядро, в этом примере мы выберем `ipykernel`:

<Image size="md" img={image_5} alt="Выбор ядра" />

В пустой ячейке введите следующую команду, чтобы установить chDB, которое мы будем использовать для подключения к нашему удалённому экземпляру ClickHouse Cloud:

```python
pip install chdb
```

Теперь вы можете импортировать chDB и выполнить простой запрос, чтобы убедиться, что всё корректно настроено:

```python
import chdb

result = chdb.query("SELECT 'Привет, ClickHouse!' as message")
print(result)
```


## Исследование данных

После того как подготовлен набор данных UK price paid и запущен chDB в Jupyter Notebook, можно приступать к исследованию данных.

Представим, что нас интересует, как цена менялась со временем для конкретного района в Великобритании, например для столицы — Лондона.
Функция ClickHouse [`remoteSecure`](/sql-reference/table-functions/remote) позволяет легко получать данные из ClickHouse Cloud.
Вы можете указать chDB вернуть эти данные непосредственно в виде DataFrame библиотеки pandas — это удобный и привычный способ работы с данными.

Выполните следующий запрос, чтобы получить данные UK price paid из вашего сервиса ClickHouse Cloud и преобразовать их в `pandas.DataFrame`:

```python
import os
from dotenv import load_dotenv
import chdb
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
```


# Загрузка переменных окружения из файла .env

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
В запросе мы используем функцию `remoteSecure` для подключения к ClickHouse Cloud.
Функция `remoteSecure` принимает следующие параметры:
- строку подключения
- имя базы данных и таблицы
- имя пользователя
- пароль

В качестве рекомендуемой практики безопасности следует использовать переменные окружения для передачи имени пользователя и пароля вместо их прямого указания в функции, хотя при желании это также возможно.

Функция `remoteSecure` подключается к удаленному сервису ClickHouse Cloud, выполняет запрос и возвращает результат.
В зависимости от объема данных выполнение может занять несколько секунд.
В данном случае мы получаем среднюю цену за год с фильтрацией по `town='LONDON'`.
Результат сохраняется в виде DataFrame в переменной `df`.

`df.head` отображает только первые несколько строк полученных данных:

<Image size="md" img={image_6} alt="предварительный просмотр dataframe"/>

Выполните следующую команду в новой ячейке, чтобы проверить типы столбцов:

```python
df.dtypes
````

```response
year          uint16
avg_price    float64
dtype: object
```

Обратите внимание, что хотя `date` имеет тип `Date` в ClickHouse, в результирующем датафрейме он имеет тип `uint16`.
chDB автоматически определяет наиболее подходящий тип при формировании DataFrame.

Теперь, когда данные доступны нам в привычной форме, давайте посмотрим, как цены на недвижимость в Лондоне изменялись со временем.

В новой ячейке выполните следующую команду, чтобы построить простой график зависимости цены от времени для Лондона с использованием matplotlib:

```python
plt.figure(figsize=(12, 6))
plt.plot(df['year'], df['avg_price'], marker='o')
plt.xlabel('Год')
plt.ylabel('Цена (£)')
plt.title('Динамика цен на недвижимость в Лондоне')
```


# Показывать каждый 2-й год, чтобы не загромождать график

years&#95;to&#95;show = df[&#39;year&#39;][::2]  # Каждый 2-й год
plt.xticks(years&#95;to&#95;show, rotation=45)

plt.grid(True, alpha=0.3)
plt.tight&#95;layout()
plt.show()

````

<Image size="md" img={image_7} alt="dataframe preview"/>

Неудивительно, что цены на недвижимость в Лондоне значительно выросли с течением времени.

Коллега-специалист по данным прислал нам CSV-файл с дополнительными переменными, связанными с жильём, и интересуется, как изменилось количество проданных домов в Лондоне с течением времени.
Построим графики некоторых из этих данных относительно цен на жильё и посмотрим, сможем ли мы обнаружить какую-либо корреляцию.

Вы можете использовать табличный движок `file` для чтения файлов непосредственно на локальной машине.
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
  Также можно считывать данные из нескольких источников за один шаг. Для этого вы можете использовать приведённый ниже запрос с `JOIN`:

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

Хотя у нас нет данных, начиная с 2020 года, мы можем построить на одном графике оба набора данных за период с 1995 по 2019 годы.
В новой ячейке выполните следующую команду:


```python
# Создание графика с двумя осями Y
fig, ax1 = plt.subplots(figsize=(14, 8))
```


# Построим график числа проданных домов по левой оси Y
color = 'tab:blue'
ax1.set_xlabel('Year')
ax1.set_ylabel('Houses Sold', color=color)
ax1.plot(df_2['year'], df_2['houses_sold'], marker='o', color=color, label='Houses Sold', linewidth=2)
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(True, alpha=0.3)



# Создаём вторую ось Y для данных о цене
ax2 = ax1.twinx()
color = 'tab:red'
ax2.set_ylabel('Средняя цена (£)', color=color)



# Построение графика ценовых данных до 2019 года включительно

ax2.plot(df[df['year'] <= 2019]['year'], df[df['year'] <= 2019]['avg_price'], marker='s', color=color, label='Средняя цена', linewidth=2)
ax2.tick_params(axis='y', labelcolor=color)


# Форматирование оси цен с форматированием валюты

ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'£{x:,.0f}'))


# Устанавливаем заголовок и показываем каждый второй год
plt.title('Рынок жилья Лондона: объём продаж и динамика цен', fontsize=14, pad=20)



# Использовать только годы до 2019 года включительно для обоих наборов данных

all_years = sorted(list(set(df_2[df_2['year'] <= 2019]['year']).union(set(df[df['year'] <= 2019]['year']))))
years_to_show = all_years[::2] # Каждый второй год
ax1.set_xticks(years_to_show)
ax1.set_xticklabels(years_to_show, rotation=45)


# Добавим легенды

ax1.legend(loc=&#39;upper left&#39;)
ax2.legend(loc=&#39;upper right&#39;)

plt.tight&#95;layout()
plt.show()

```

<Image size="md" img={image_9} alt="График удаленного и локального набора данных"/>

Из графика видно, что объем продаж в 1995 году составлял около 160 000 единиц и быстро вырос, достигнув пика примерно в 540 000 в 1999 году.
После этого объемы резко снизились в середине 2000-х годов, значительно упав во время финансового кризиса 2007–2008 годов и опустившись до уровня около 140 000.
Цены, напротив, демонстрировали стабильный, последовательный рост — от примерно £150 000 в 1995 году до около £300 000 к 2005 году.
Рост значительно ускорился после 2012 года, резко поднявшись с примерно £400 000 до более чем £1 000 000 к 2019 году.
В отличие от объема продаж, цены практически не пострадали от кризиса 2008 года и сохранили восходящую траекторию. Впечатляет!
```


## Итоги {#summary}

В этом руководстве показано, как chDB обеспечивает удобное исследование данных в Jupyter-ноутбуках за счёт подключения ClickHouse Cloud к локальным источникам данных.
На примере набора данных UK Property Price мы продемонстрировали, как выполнять запросы к удалённым данным в ClickHouse Cloud с помощью функции `remoteSecure()`, читать локальные CSV-файлы с движком таблиц `file()` и конвертировать результаты напрямую в DataFrame-объекты Pandas для анализа и визуализации.
Благодаря chDB специалисты по анализу данных могут использовать мощные SQL-возможности ClickHouse вместе с привычными Python-инструментами, такими как Pandas и matplotlib, что упрощает объединение нескольких источников данных для всестороннего анализа.

Хотя многие специалисты по анализу данных, живущие в Лондоне, вряд ли смогут позволить себе собственный дом или квартиру в ближайшее время, по крайней мере они могут проанализировать рынок, который вытеснил их с него!
