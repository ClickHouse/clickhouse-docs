---
title: Как выполнить запрос к удаленному серверу ClickHouse
sidebar_label: Выполнение запросов к удаленному ClickHouse
slug: /chdb/guides/query-remote-clickhouse
description: В этом руководстве мы узнаем, как выполнить запрос к удаленному серверу ClickHouse из chDB.
keywords: [chdb, clickhouse]
---

В этом руководстве мы узнаем, как выполнить запрос к удаленному серверу ClickHouse из chDB.

## Настройка {#setup}

Сначала создадим виртуальное окружение:

```bash
python -m venv .venv
source .venv/bin/activate
```

Теперь мы установим chDB.
Убедитесь, что у вас версия 2.0.2 или выше:

```bash
pip install "chdb>=2.0.2"
```

Теперь мы установим pandas и ipython:

```bash
pip install pandas ipython
```

Мы будем использовать `ipython` для выполнения команд в остальной части руководства, который можно запустить, выполнив:

```bash
ipython
```

Вы также можете использовать код в Python-скрипте или в своем любимом блокноте.

## Введение в ClickPy {#an-intro-to-clickpy}

Удаленный сервер ClickHouse, к которому мы будем выполнять запрос, это [ClickPy](https://clickpy.clickhouse.com).
ClickPy отслеживает все загрузки пакетов PyPI и позволяет вам исследовать статистику пакетов через интерфейс.
Основная база данных доступна для запросов с использованием пользователя `play`.

Вы можете узнать больше о ClickPy в [его репозитории на GitHub](https://github.com/ClickHouse/clickpy).

## Запрос к службе ClickPy ClickHouse {#querying-the-clickpy-clickhouse-service}

Импортируем chDB:

```python
import chdb
```

Мы будем выполнять запрос к ClickPy, используя функцию `remoteSecure`.
Эта функция принимает как минимум имя хоста, имя таблицы и имя пользователя.

Мы можем написать следующий запрос, чтобы вернуть количество загрузок в день для пакета [`openai`](https://clickpy.clickhouse.com/dashboard/openai) в формате DataFrame Pandas:

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

Теперь сделаем то же самое, чтобы вернуть загрузки для [`scikit-learn`](https://clickpy.clickhouse.com/dashboard/scikit-learn):

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

## Объединение DataFrames Pandas {#merging-pandas-dataframes}

Теперь у нас есть два DataFrame, которые мы можем объединить по дате (которая является колонкой `x`) следующим образом:

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

Затем мы можем вычислить соотношение загрузок Open AI к загрузкам `scikit-learn` следующим образом:

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

## Запрос к DataFrames Pandas {#querying-pandas-dataframes}

Теперь давайте скажем, что мы хотим найти даты с наилучшими и наихудшими соотношениями.
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
   bestRatio    bestDate  worstRatio   worstDate
0   0.693855  2024-09-19    0.000003  2020-02-09
```

Если вы хотите узнать больше о запросах к DataFrames Pandas, смотрите [руководство для разработчиков по DataFrames Pandas](querying-pandas.md).
