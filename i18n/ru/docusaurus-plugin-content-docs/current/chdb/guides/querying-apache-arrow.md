---
title: Как запрашивать Apache Arrow с помощью chDB
sidebar_label: Запросы к Apache Arrow
slug: /chdb/guides/apache-arrow
description: В этом руководстве мы научимся запрашивать таблицы Apache Arrow с помощью chDB
keywords: [chdb, Apache Arrow]
---

[Apache Arrow](https://arrow.apache.org/) — это стандартизированный колоночный формат памяти, который находит все более широкое применение в области данных. 
В этом руководстве мы научимся запрашивать Apache Arrow, используя функцию таблицы `Python`.

## Настройка {#setup}

Сначала создадим виртуальную среду:

```bash
python -m venv .venv
source .venv/bin/activate
```

Теперь мы установим chDB.
Убедитесь, что у вас версия 2.0.2 или выше:

```bash
pip install "chdb>=2.0.2"
```

Затем мы установим PyArrow, pandas и ipython:

```bash
pip install pyarrow pandas ipython
```

Мы будем использовать `ipython` для выполнения команд в остальной части руководства, который вы можете запустить, выполнив:

```bash
ipython
```

Также вы можете использовать код в скрипте Python или в вашем любимом блокноте.

## Создание таблицы Apache Arrow из файла {#creating-an-apache-arrow-table-from-a-file}

Сначала давайте загрузим один из файлов Parquet из [набор данных Ookla](https://github.com/teamookla/ookla-open-data), используя [AWS CLI tool](https://aws.amazon.com/cli/):

```bash
aws s3 cp \
  --no-sign \
  s3://ookla-open-data/parquet/performance/type=mobile/year=2023/quarter=2/2023-04-01_performance_mobile_tiles.parquet .
```

:::note
Если вы хотите загрузить больше файлов, используйте `aws s3 ls`, чтобы получить список всех файлов, а затем обновите приведенную выше команду.
:::

Затем мы импортируем модуль Parquet из пакета `pyarrow`:

```python
import pyarrow.parquet as pq
```

Затем мы можем прочитать файл Parquet в таблицу Apache Arrow:

```python
arrow_table = pq.read_table("./2023-04-01_performance_mobile_tiles.parquet")
```

Схема показана ниже:

```python
arrow_table.schema
```

```text
quadkey: string
tile: string
tile_x: double
tile_y: double
avg_d_kbps: int64
avg_u_kbps: int64
avg_lat_ms: int64
avg_lat_down_ms: int32
avg_lat_up_ms: int32
tests: int64
devices: int64
```

Мы также можем получить количество строк и колонок, вызвав атрибут `shape`:

```python
arrow_table.shape
```

```text
(3864546, 11)
```

## Запросы к Apache Arrow {#querying-apache-arrow}

Теперь давайте запросим таблицу Arrow из chDB.
Сначала давайте импортируем chDB:

```python
import chdb
```

Затем мы можем описать таблицу:

```python
chdb.query("""
DESCRIBE Python(arrow_table)
SETTINGS describe_compact_output=1
""", "DataFrame")
```

```text
               name     type
0           quadkey   String
1              tile   String
2            tile_x  Float64
3            tile_y  Float64
4        avg_d_kbps    Int64
5        avg_u_kbps    Int64
6        avg_lat_ms    Int64
7   avg_lat_down_ms    Int32
8     avg_lat_up_ms    Int32
9             tests    Int64
10          devices    Int64
```

Мы также можем посчитать количество строк:

```python
chdb.query("SELECT count() FROM Python(arrow_table)", "DataFrame")
```

```text
   count()
0  3864546
```

Теперь давайте сделаем что-то немного более интересное. 
Следующий запрос исключает колонки `quadkey` и `tile.*`, а затем вычисляет средние и максимальные значения для всех оставшихся колонок:

```python
chdb.query("""
WITH numericColumns AS (
  SELECT * EXCEPT ('tile.*') EXCEPT(quadkey)
  FROM Python(arrow_table)
)
SELECT * APPLY(max), * APPLY(avg) APPLY(x -> round(x, 2))
FROM numericColumns
""", "Vertical")
```

```text
Row 1:
──────
max(avg_d_kbps):                4155282
max(avg_u_kbps):                1036628
max(avg_lat_ms):                2911
max(avg_lat_down_ms):           2146959360
max(avg_lat_up_ms):             2146959360
max(tests):                     111266
max(devices):                   1226
round(avg(avg_d_kbps), 2):      84393.52
round(avg(avg_u_kbps), 2):      15540.4
round(avg(avg_lat_ms), 2):      41.25
round(avg(avg_lat_down_ms), 2): 554355225.76
round(avg(avg_lat_up_ms), 2):   552843178.3
round(avg(tests), 2):           6.31
round(avg(devices), 2):         2.88
```
