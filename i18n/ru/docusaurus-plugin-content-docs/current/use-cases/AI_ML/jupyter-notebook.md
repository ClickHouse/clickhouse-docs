---
'slug': '/use-cases/AI/jupyter-notebook'
'sidebar_label': 'Исследование данных в Jupyter ноутбуках с chDB'
'title': 'Исследование данных в Jupyter ноутбуках с chDB'
'description': 'Это руководство объясняет, как настроить и использовать chDB для исследования
  данных из ClickHouse Cloud или локальных файлов в Jupyter ноутбуках'
'keywords':
- 'ML'
- 'Jupyer'
- 'chDB'
- 'pandas'
'doc_type': 'guide'
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


# Изучение данных с помощью Jupyter notebooks и chDB

В этом руководстве вы узнаете, как исследовать набор данных в ClickHouse Cloud в Jupyter notebook с помощью [chDB](/chdb) - быстрого SQL OLAP движка, работающего в процессе и основанного на ClickHouse.

**Предварительные условия**:
- виртуальная среда
- работающий сервис ClickHouse Cloud и ваши [данные для подключения](/cloud/guides/sql-console/gather-connection-details)

**Что вы узнаете:**
- Подключение к ClickHouse Cloud из Jupyter notebooks с использованием chDB
- Запрос удаленных наборов данных и преобразование результатов в Pandas DataFrames
- Сочетание облачных данных с локальными CSV файлами для анализа
- Визуализация данных с помощью matplotlib

Мы будем использовать набор данных о ценах на недвижимость в Великобритании, который доступен в ClickHouse Cloud как один из стартовых наборов данных.
Он содержит данные о ценах, по которым были проданы дома в Великобритании с 1995 по 2024 год.

## Настройка {#setup}

Чтобы добавить этот набор данных к существующему сервису ClickHouse Cloud, войдите в [console.clickhouse.cloud](https://console.clickhouse.cloud/) с вашими учетными данными.

В левом меню нажмите на `Источники данных`. Затем нажмите `Предопределенные образцы данных`:

<Image size="md" img={image_1} alt="Добавить пример набора данных"/>

Выберите `Начать` в карточке данных о ценах на недвижимость в Великобритании (4GB): 

<Image size="md" img={image_2} alt="Выберите набор данных о ценах в Великобритании"/>

Затем нажмите `Импортировать набор данных`:

<Image size="md" img={image_3} alt="Импортировать набор данных о ценах в Великобритании"/>

ClickHouse автоматически создаст таблицу `pp_complete` в базе данных `default` и заполнит таблицу 28.92 миллионами строк данных о ценах.

Чтобы уменьшить вероятность раскрытия ваших учетных данных, мы рекомендуем добавить ваше имя пользователя и пароль в облаке как переменные окружения на вашем локальном компьютере.
В терминале выполните следующую команду, чтобы добавить свое имя пользователя и пароль как переменные окружения:

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=your_actual_password
```

:::note
Переменные окружения выше сохраняются только на время вашей сессии терминала.
Чтобы установить их постоянно, добавьте их в файл конфигурации вашего шелла.
:::

Теперь активируйте вашу виртуальную среду.
Из нее установите Jupyter Notebook с помощью следующей команды:

```python
pip install notebook
```

запустите Jupyter Notebook с помощью следующей команды:

```python
jupyter notebook
```

В новом окне браузера должен открыться интерфейс Jupyter на `localhost:8888`.
Нажмите `Файл` > `Новый` > `Notebook`, чтобы создать новый Notebook.

<Image size="md" img={image_4} alt="Создайте новый блокнот"/>

Вам будет предложено выбрать ядро.
Выберите любое доступное ядро Python, в этом примере мы выберем `ipykernel`:

<Image size="md" img={image_5} alt="Выбрать ядро"/>

В пустой ячейке вы можете ввести следующую команду для установки chDB, используя который мы подключимся к нашему удаленному экземпляру ClickHouse Cloud:

```python
pip install chdb
```

Теперь вы можете импортировать chDB и выполнить простой запрос, чтобы убедиться, что все настроено правильно:

```python
import chdb

result = chdb.query("SELECT 'Hello, ClickHouse!' as message")
print(result)
```

## Изучение данных {#exploring-the-data}

С набором данных о ценах в Великобритании, настроенным и chDB, который работает в Jupyter notebook, мы можем начать изучение наших данных.

Представим, что мы заинтересованы в том, как цены изменялись со временем для конкретной области в Великобритании, такой как столица, Лондон.
Функция ClickHouse [`remoteSecure`](/sql-reference/table-functions/remote) позволяет легко извлекать данные из ClickHouse Cloud.
Вы можете указать chDB вернуть эти данные в процессе в виде Pandas DataFrame - это удобный и привычный способ работы с данными.

Напишите следующий запрос, чтобы получить данные о ценах в Великобритании из вашего сервиса ClickHouse Cloud и преобразовать их в `pandas.DataFrame`:

```python
import os
from dotenv import load_dotenv
import chdb
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates


# Load environment variables from .env file
load_dotenv()

username = os.environ.get('CLICKHOUSE_USER')
password = os.environ.get('CLICKHOUSE_PASSWORD')

query = f"""
SELECT 
    toYear(date) AS year,
    avg(price) AS avg_price
FROM remoteSecure(
'****.europe-west4.gcp.clickhouse.cloud',
default.pp_complete,
'{username}',
'{password}'
)
WHERE town = 'LONDON'
GROUP BY toYear(date)
ORDER BY year;
"""

df = chdb.query(query, "DataFrame")
df.head()
```

В приведенном выше фрагменте `chdb.query(query, "DataFrame")` выполняет указанный запрос и выводит результат в терминал в виде Pandas DataFrame.
В запросе мы используем функцию `remoteSecure` для подключения к ClickHouse Cloud.
Функция `remoteSecure` принимает в качестве параметров:
- строку подключения
- имя базы данных и таблицы для использования
- ваше имя пользователя
- ваш пароль

В качестве лучшей практики безопасности, вам следует предпочитать использование переменных окружения для параметров имени пользователя и пароля, а не указывать их напрямую в функции, хотя это возможно, если вы хотите.

Функция `remoteSecure` подключается к удаленному сервису ClickHouse Cloud, выполняет запрос и возвращает результат.
В зависимости от размера ваших данных, это может занять несколько секунд.
В данном случае мы возвращаем среднюю цену за год и фильтруем по `town='LONDON'`.
Результат затем хранится как DataFrame в переменной с именем `df`.

`df.head` отображает только первые несколько строк возвращенных данных:

<Image size="md" img={image_6} alt="предварительный просмотр dataframe"/>

Выполните следующую команду в новой ячейке, чтобы проверить типы столбцов:

```python
df.dtypes
```

```response
year          uint16
avg_price    float64
dtype: object
```

Обратите внимание, что хотя `date` имеет тип `Date` в ClickHouse, в результате DataFrame он имеет тип `uint16`.
chDB автоматически определяет наиболее подходящий тип при возвращении DataFrame.

Учитывая, что данные теперь доступны в привычной форме, давайте исследуем, как изменялись цены на недвижимость в Лондоне со временем.

В новой ячейке выполните следующую команду, чтобы построить простой график времени против цены для Лондона с использованием matplotlib:

```python
plt.figure(figsize=(12, 6))
plt.plot(df['year'], df['avg_price'], marker='o')
plt.xlabel('Year')
plt.ylabel('Price (£)')
plt.title('Price of London property over time')


# Show every 2nd year to avoid crowding
years_to_show = df['year'][::2]  # Every 2nd year
plt.xticks(years_to_show, rotation=45)

plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

<Image size="md" img={image_7} alt="предварительный просмотр dataframe"/>

Возможно, это не удивительно, но цены на недвижимость в Лондоне существенно возросли со временем.

Другой ученый данных отправил нам файл .csv с дополнительными переменными, связанными с жильем, и интересуется, как 
число проданных домов в Лондоне изменялось со временем.
Давайте построим некоторые из этих данных вместе с ценами на жилье и посмотрим, можем ли мы обнаружить какую-либо корреляцию.

Вы можете использовать движок таблицы `file`, чтобы читать файлы непосредственно на вашем локальном компьютере.
В новой ячейке выполните следующую команду, чтобы создать новый DataFrame из локального файла .csv.

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
```

<details>
<summary>Чтение из нескольких источников за один шаг</summary>
Также возможно читать из нескольких источников за один шаг. Вы можете использовать приведенный ниже запрос с `JOIN` для этого:

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

<Image size="md" img={image_8} alt="предварительный просмотр dataframe"/>

Хотя у нас нет данных с 2020 года и позже, мы можем сопоставить два набора данных друг с другом за годы с 1995 по 2019.
В новой ячейке выполните следующую команду:

```python

# Create a figure with two y-axes
fig, ax1 = plt.subplots(figsize=(14, 8))


# Plot houses sold on the left y-axis
color = 'tab:blue'
ax1.set_xlabel('Year')
ax1.set_ylabel('Houses Sold', color=color)
ax1.plot(df_2['year'], df_2['houses_sold'], marker='o', color=color, label='Houses Sold', linewidth=2)
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(True, alpha=0.3)


# Create a second y-axis for price data
ax2 = ax1.twinx()
color = 'tab:red'
ax2.set_ylabel('Average Price (£)', color=color)


# Plot price data up until 2019
ax2.plot(df[df['year'] <= 2019]['year'], df[df['year'] <= 2019]['avg_price'], marker='s', color=color, label='Average Price', linewidth=2)
ax2.tick_params(axis='y', labelcolor=color)


# Format price axis with currency formatting
ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'£{x:,.0f}'))


# Set title and show every 2nd year
plt.title('London Housing Market: Sales Volume vs Prices Over Time', fontsize=14, pad=20)


# Use years only up to 2019 for both datasets
all_years = sorted(list(set(df_2[df_2['year'] <= 2019]['year']).union(set(df[df['year'] <= 2019]['year']))))
years_to_show = all_years[::2]  # Every 2nd year
ax1.set_xticks(years_to_show)
ax1.set_xticklabels(years_to_show, rotation=45)


# Add legends
ax1.legend(loc='upper left')
ax2.legend(loc='upper right')

plt.tight_layout()
plt.show()
```

<Image size="md" img={image_9} alt="График удаленного набора данных и локального набора данных"/>

Из построенных данных мы видим, что продажи начались около 160,000 в 1995 году и быстро возросли, достигнув пика около 540,000 в 1999 году.
После этого объемы резко сократились в середине 2000-х, сильно упав во время финансового кризиса 2007-2008 годов и упав до около 140,000.
Цены, с другой стороны, показали стабильный, последовательный рост с примерно £150,000 в 1995 году до около £300,000 к 2005 году.
Рост резко ускорился после 2012 года, резко поднявшись с примерно £400,000 до свыше £1,000,000 к 2019 году.
В отличие от объема продаж, цены продемонстрировали минимальное влияние со стороны кризиса 2008 года и сохранили восходящую траекторию. Упс!

## Резюме {#summary}

Это руководство продемонстрировало, как chDB позволяет бесшовно исследовать данные в Jupyter notebooks, связывая ClickHouse Cloud с локальными источниками данных.
Используя набор данных о ценах на недвижимость в Великобритании, мы показали, как запрашивать удаленные данные ClickHouse Cloud с помощью функции `remoteSecure()`, читать локальные CSV файлы с помощью движка таблицы `file()`, и преобразовывать результаты напрямую в Pandas DataFrames для анализа и визуализации.
С помощью chDB, ученые данных могут использовать мощные SQL возможности ClickHouse наряду с привычными инструментами Python, такими как Pandas и matplotlib, что упрощает объединение нескольких источников данных для комплексного анализа.

Хотя многие ученые данных, базирующиеся в Лондоне, могут не иметь возможности вскоре позволить себе собственный дом или квартиру, по крайней мере, они могут анализировать рынок, который вынудил их покинуть!
