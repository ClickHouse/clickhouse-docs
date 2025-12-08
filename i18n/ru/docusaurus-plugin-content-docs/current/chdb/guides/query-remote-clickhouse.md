---
title: 'Как выполнять запросы к удалённому серверу ClickHouse'
sidebar_label: 'Запросы к удалённому серверу ClickHouse'
slug: /chdb/guides/query-remote-clickhouse
description: 'В этом руководстве мы рассмотрим, как выполнять запросы к удалённому серверу ClickHouse из chDB.'
keywords: ['chdb', 'clickhouse']
doc_type: 'guide'
---

В этом руководстве мы рассмотрим, как выполнять запросы к удалённому серверу ClickHouse из chDB.

## Настройка {#setup}

Сначала создадим виртуальное окружение:

```bash
python -m venv .venv
source .venv/bin/activate
```

Теперь установим chDB.
Убедитесь, что у вас установлена версия 2.0.2 или выше:

```bash
pip install "chdb>=2.0.2"
```

Теперь установим pandas и ipython:

```bash
pip install pandas ipython
```

Мы будем использовать `ipython` для выполнения команд далее в этом руководстве. Для его запуска выполните:

```bash
ipython
```

Вы также можете использовать этот код в Python-скрипте или в вашем любимом ноутбуке (например, Jupyter Notebook).

## Введение в ClickPy {#an-intro-to-clickpy}

Удалённый сервер ClickHouse, к которому мы будем выполнять запросы, — это [ClickPy](https://clickpy.clickhouse.com).
ClickPy отслеживает все загрузки пакетов PyPI и позволяет исследовать статистику по пакетам через пользовательский интерфейс.
Лежащая в основе база данных доступна для запросов с использованием пользователя `play`.

Подробнее о ClickPy вы можете узнать в [его репозитории на GitHub](https://github.com/ClickHouse/clickpy).

## Выполнение запросов к сервису ClickPy ClickHouse {#querying-the-clickpy-clickhouse-service}

Давайте импортируем chDB:

```python
import chdb
```

Мы будем выполнять запрос к ClickPy с помощью функции `remoteSecure`.
Минимальный набор аргументов этой функции — имя хоста, имя таблицы и имя пользователя.

Мы можем написать следующий запрос, чтобы получить количество ежедневных загрузок пакета [`openai`](https://clickpy.clickhouse.com/dashboard/openai) в виде объекта Pandas DataFrame:

```python
query = """
SELECT
    toStartOfDay(date)::Date32 AS x,
    sum(count) AS y
FROM remoteSecure(
  'clickpy-clickhouse.clickhouse.com', 
  'pypi.pypi_downloads_per_day', 
  'play'
)
WHERE project = 'openai'
GROUP BY x
ORDER BY x ASC
"""

openai_df = chdb.query(query, "DataFrame")
openai_df.sort_values(by=["x"], ascending=False).head(n=10)
```

```text
               x        y
2392  2024-10-02  1793502
2391  2024-10-01  1924901
2390  2024-09-30  1749045
2389  2024-09-29  1177131
2388  2024-09-28  1157323
2387  2024-09-27  1688094
2386  2024-09-26  1862712
2385  2024-09-25  2032923
2384  2024-09-24  1901965
2383  2024-09-23  1777554
```

Теперь проделаем то же самое, чтобы получить данные о загрузках для [`scikit-learn`](https://clickpy.clickhouse.com/dashboard/scikit-learn):

```python
query = """
SELECT
    toStartOfDay(date)::Date32 AS x,
    sum(count) AS y
FROM remoteSecure(
  'clickpy-clickhouse.clickhouse.com', 
  'pypi.pypi_downloads_per_day', 
  'play'
)
WHERE project = 'scikit-learn'
GROUP BY x
ORDER BY x ASC
"""

sklearn_df = chdb.query(query, "DataFrame")
sklearn_df.sort_values(by=["x"], ascending=False).head(n=10)
```

```text
               x        y
2392  2024-10-02  1793502
2391  2024-10-01  1924901
2390  2024-09-30  1749045
2389  2024-09-29  1177131
2388  2024-09-28  1157323
2387  2024-09-27  1688094
2386  2024-09-26  1862712
2385  2024-09-25  2032923
2384  2024-09-24  1901965
2383  2024-09-23  1777554
```

## Объединение датафреймов в pandas {#merging-pandas-dataframes}

Теперь у нас есть два датафрейма, которые мы можем объединить по дате (это столбец `x`) следующим образом:

```python
df = openai_df.merge(
  sklearn_df, 
  on="x", 
  suffixes=("_openai", "_sklearn")
)
df.head(n=5)
```

```text
            x  y_openai  y_sklearn
0  2018-02-26        83      33971
1  2018-02-27        31      25211
2  2018-02-28         8      26023
3  2018-03-01         8      20912
4  2018-03-02         5      23842
```

Затем мы можем вычислить отношение количества загрузок OpenAI к количеству загрузок `scikit-learn` следующим образом:

```python
df['ratio'] = df['y_openai'] / df['y_sklearn']
df.head(n=5)
```

```text
            x  y_openai  y_sklearn     ratio
0  2018-02-26        83      33971  0.002443
1  2018-02-27        31      25211  0.001230
2  2018-02-28         8      26023  0.000307
3  2018-03-01         8      20912  0.000383
4  2018-03-02         5      23842  0.000210
```

## Выполнение запросов к фреймам данных Pandas {#querying-pandas-dataframes}

Далее предположим, что мы хотим найти даты с наилучшим и наихудшим отношением.
Мы можем вернуться к chDB и вычислить эти значения:

```python
chdb.query("""
SELECT max(ratio) AS bestRatio,
       argMax(x, ratio) AS bestDate,
       min(ratio) AS worstRatio,
       argMin(x, ratio) AS worstDate
FROM Python(df)
""", "DataFrame")
```

```text
   лучшийПоказатель    датаЛучшего  худшийПоказатель   датаХудшего
0   0.693855  2024-09-19    0.000003  2020-02-09
```

Если вы хотите узнать больше о выполнении запросов к объектам DataFrame в Pandas, см. [руководство разработчика по работе с Pandas DataFrame](querying-pandas.md).
