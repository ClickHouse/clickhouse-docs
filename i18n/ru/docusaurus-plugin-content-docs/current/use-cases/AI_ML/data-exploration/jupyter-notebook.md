---
slug: /use-cases/AI/jupyter-notebook
sidebar_label: 'Исследование данных с помощью блокнотов Jupyter и chDB'
title: 'Исследование данных в блокнотах Jupyter с помощью chDB'
description: 'В этом руководстве рассказывается, как настроить и использовать chDB для исследования в блокнотах Jupyter данных из ClickHouse Cloud или локальных файлов'
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


# Исследование данных с помощью Jupyter Notebook и chDB {#exploring-data-with-jupyter-notebooks-and-chdb}

В этом руководстве вы узнаете, как исследовать данные в ClickHouse Cloud в Jupyter Notebook с помощью [chDB](/chdb) — быстрого встроенного SQL OLAP-движка на базе ClickHouse.

**Предварительные требования**:

- виртуальное окружение
- работающий сервис ClickHouse Cloud и ваши [параметры подключения](/cloud/guides/sql-console/gather-connection-details)

:::tip
Если у вас ещё нет учётной записи ClickHouse Cloud, вы можете [зарегистрироваться](https://console.clickhouse.cloud/signUp?loc=docs-juypter-chdb)
и получить тестовый доступ с $300 бесплатных кредитов.
:::

**Чему вы научитесь:**

- Подключаться к ClickHouse Cloud из Jupyter Notebook с использованием chDB
- Выполнять запросы к удалённым наборам данных и преобразовывать результаты в объекты Pandas DataFrame
- Объединять данные из облака с локальными CSV-файлами для анализа
- Визуализировать данные с помощью matplotlib

Мы будем использовать набор данных UK Property Price, который доступен в ClickHouse Cloud как один из стартовых наборов данных.
Он содержит данные о ценах, по которым продавались дома в Великобритании с 1995 по 2024 год.

## Настройка {#setup}

Чтобы добавить этот набор данных в существующий сервис ClickHouse Cloud, войдите в [console.clickhouse.cloud](https://console.clickhouse.cloud/) с данными своей учетной записи.

В меню слева нажмите `Data sources`. Затем нажмите `Predefined sample data`:

<Image size="md" img={image_1} alt="Добавление примерного набора данных" />

Выберите `Get started` на карточке UK property price paid data (4GB):

<Image size="md" img={image_2} alt="Выбор набора данных UK price paid" />

Затем нажмите `Import dataset`:

<Image size="md" img={image_3} alt="Импорт набора данных UK price paid" />

ClickHouse автоматически создаст таблицу `pp_complete` в базе данных `default` и заполнит её 28,92 миллионами строк данных о ценах.

Чтобы снизить вероятность случайного раскрытия ваших учетных данных, рекомендуется добавить имя пользователя и пароль ClickHouse Cloud в качестве переменных окружения на локальной машине.
В терминале выполните следующую команду, чтобы добавить имя пользователя и пароль в качестве переменных окружения:

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=ваш_реальный_пароль
```

:::note
Переменные окружения, указанные выше, сохраняются только на время текущего сеанса терминала.
Чтобы сделать их постоянными, добавьте их в конфигурационный файл оболочки.
:::

Теперь активируйте виртуальное окружение.
Находясь в виртуальном окружении, установите Jupyter Notebook следующей командой:

```python
pip install notebook
```

Запустите Jupyter Notebook с помощью следующей команды:

```python
jupyter notebook
```

В новом окне браузера должен открыться интерфейс Jupyter по адресу `localhost:8888`.
Нажмите `File` &gt; `New` &gt; `Notebook`, чтобы создать новый notebook.

<Image size="md" img={image_4} alt="Создать новый notebook" />

Вам будет предложено выбрать ядро.
Выберите любое доступное Python-ядро, в этом примере мы выберем `ipykernel`:

<Image size="md" img={image_5} alt="Выбор ядра" />

В пустой ячейке введите следующую команду, чтобы установить chDB, который мы будем использовать для подключения к нашему удалённому экземпляру ClickHouse Cloud:

```python
pip install chdb
```

Теперь вы можете импортировать chDB и выполнить простой запрос, чтобы убедиться, что всё настроено корректно:

```python
import chdb

result = chdb.query("SELECT 'Привет, ClickHouse!' as message")
print(result)
```


## Исследование данных {#exploring-the-data}

После того как набор данных UK price paid настроен, а chDB запущен в Jupyter Notebook, мы можем приступить к исследованию наших данных.

Представим, что нас интересует, как цена изменялась со временем для конкретного района в Великобритании, например для столицы — Лондона.
Функция ClickHouse [`remoteSecure`](/sql-reference/table-functions/remote) позволяет легко получать данные из ClickHouse Cloud.
Вы можете указать chDB вернуть эти данные напрямую в виде фрейма данных Pandas — это удобный и знакомый способ работы с данными.

Напишите следующий запрос, чтобы получить данные UK price paid из вашего сервиса ClickHouse Cloud и преобразовать их в `pandas.DataFrame`:

```python
import os
from dotenv import load_dotenv
import chdb
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# Загрузить переменные окружения из файла .env {#load-environment-variables-from-env-file}
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

В приведённом выше фрагменте `chdb.query(query, "DataFrame")` выполняет указанный запрос и выводит результат в терминал в виде Pandas DataFrame.
В запросе мы используем функцию `remoteSecure` для подключения к ClickHouse Cloud.
Функция `remoteSecure` принимает в качестве параметров:

* строку подключения (connection string)
* имя базы данных и таблицы, которые нужно использовать
* ваше имя пользователя
* ваш пароль

С точки зрения безопасности рекомендуется использовать переменные окружения для параметров имени пользователя и пароля, а не указывать их непосредственно в функции, хотя при желании это возможно.

Функция `remoteSecure` подключается к удалённому сервису ClickHouse Cloud, выполняет запрос и возвращает результат.
В зависимости от объёма ваших данных это может занять несколько секунд.
В данном случае мы возвращаем среднюю цену по годам и фильтруем по `town='LONDON'`.
Результат затем сохраняется в виде DataFrame в переменную с именем `df`.

`df.head` отображает только первые несколько строк возвращённых данных:

<Image size="md" img={image_6} alt="предпросмотр DataFrame" />

Выполните следующую команду в новой ячейке, чтобы проверить типы столбцов:

```python
df.dtypes
```

```response
year          uint16
avg_price    float64
dtype: object
```

Обратите внимание, что хотя `date` имеет тип `Date` в ClickHouse, в результирующем фрейме данных он имеет тип `uint16`.
chDB автоматически определяет наиболее подходящий тип при возврате DataFrame.

Теперь, когда данные доступны нам в знакомой форме, давайте рассмотрим, как со временем менялись цены на недвижимость в Лондоне.

В новой ячейке выполните следующую команду, чтобы построить простой график зависимости цены от времени для Лондона с использованием matplotlib:

```python
plt.figure(figsize=(12, 6))
plt.plot(df['year'], df['avg_price'], marker='o')
plt.xlabel('Year')
plt.ylabel('Price (£)')
plt.title('Price of London property over time')

# Показывать каждый второй год во избежание перегруженности {#show-every-2nd-year-to-avoid-crowding}
years_to_show = df['year'][::2]  # Каждый второй год
plt.xticks(years_to_show, rotation=45)

plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

<Image size="md" img={image_7} alt="предварительный просмотр фрейма данных" />

Вполне ожидаемо, цены на недвижимость в Лондоне существенно выросли со временем.

Коллега‑специалист по данным прислал нам файл .csv с дополнительными переменными, связанными с жильём, и хочет узнать,
как менялось со временем количество домов, проданных в Лондоне.
Давайте построим некоторые из этих показателей по отношению к ценам на жильё и посмотрим, удастся ли обнаружить какую‑нибудь корреляцию.

Вы можете использовать табличный движок `file`, чтобы считывать файлы напрямую с локальной машины.
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
  Также можно читать данные из нескольких источников за один шаг. Для этого вы можете использовать приведённый ниже запрос с `JOIN`:

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

<Image size="md" img={image_8} alt="предварительный просмотр DataFrame" />

Хотя у нас отсутствуют данные, начиная с 2020 года, мы можем построить график, сравнив два набора данных за 1995–2019 годы.
В новой ячейке выполните следующую команду:

```python
# Создание графика с двумя осями Y {#create-a-figure-with-two-y-axes}
fig, ax1 = plt.subplots(figsize=(14, 8))

# Построение графика проданных домов на левой оси Y {#plot-houses-sold-on-the-left-y-axis}
color = 'tab:blue'
ax1.set_xlabel('Year')
ax1.set_ylabel('Проданные дома', color=color)
ax1.plot(df_2['year'], df_2['houses_sold'], marker='o', color=color, label='Проданные дома', linewidth=2)
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(True, alpha=0.3)

# Создание второй оси Y для данных о ценах {#create-a-second-y-axis-for-price-data}
ax2 = ax1.twinx()
color = 'tab:red'
ax2.set_ylabel('Средняя цена (£)', color=color)

# Построение графика данных о ценах до 2019 года включительно {#plot-price-data-up-until-2019}
ax2.plot(df[df['year'] <= 2019]['year'], df[df['year'] <= 2019]['avg_price'], marker='s', color=color, label='Средняя цена', linewidth=2)
ax2.tick_params(axis='y', labelcolor=color)

# Форматирование оси цен с отображением валюты {#format-price-axis-with-currency-formatting}
ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'£{x:,.0f}'))

# Установка заголовка и отображение каждого второго года {#set-title-and-show-every-2nd-year}
plt.title('Рынок недвижимости Лондона: объём продаж и цены в динамике', fontsize=14, pad=20)

# Использование годов только до 2019 включительно для обоих наборов данных {#use-years-only-up-to-2019-for-both-datasets}
all_years = sorted(list(set(df_2[df_2['year'] <= 2019]['year']).union(set(df[df['year'] <= 2019]['year']))))
years_to_show = all_years[::2]  # Каждый второй год
ax1.set_xticks(years_to_show)
ax1.set_xticklabels(years_to_show, rotation=45)

# Добавление легенд {#add-legends}
ax1.legend(loc='upper left')
ax2.legend(loc='upper right')

plt.tight_layout()
plt.show()
```

<Image size="md" img={image_9} alt="График удалённого набора данных и локального набора данных" />

Из построенного графика видно, что объём продаж составлял примерно 160 000 в 1995 году и быстро вырос, достигнув пика около 540 000 в 1999 году.
После этого объёмы резко снизились в середине 2000‑х, сильно просели во время финансового кризиса 2007–2008 годов и упали до примерно 140 000.
Цены, напротив, демонстрировали стабильный и плавный рост: с примерно £150 000 в 1995 году до около £300 000 к 2005 году.
После 2012 года рост существенно ускорился, резко поднявшись примерно с £400 000 до более чем £1 000 000 к 2019 году.
В отличие от объёма продаж, цены испытали минимальное влияние кризиса 2008 года и сохранили восходящую тенденцию. Вот это да!


## Итоги {#summary}

В этом руководстве показано, как chDB обеспечивает удобное исследование данных в Jupyter-ноутбуках за счет подключения ClickHouse Cloud к локальным источникам данных.
На примере набора данных UK Property Price мы продемонстрировали, как выполнять запросы к удаленным данным в ClickHouse Cloud с помощью функции `remoteSecure()`, читать локальные CSV-файлы с использованием движка таблиц `file()` и преобразовывать результаты непосредственно в объекты DataFrame библиотеки Pandas для анализа и визуализации.
С помощью chDB специалисты по анализу данных могут использовать мощные SQL-возможности ClickHouse вместе с привычными инструментами Python, такими как Pandas и matplotlib, что упрощает объединение нескольких источников данных для комплексного анализа.

И хотя многие лондонские специалисты по анализу данных, возможно, еще не скоро смогут позволить себе собственный дом или квартиру, по крайней мере они могут проанализировать рынок, который сделал для них жилье недоступным!