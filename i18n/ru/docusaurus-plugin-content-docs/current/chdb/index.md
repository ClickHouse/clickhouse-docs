---
title: 'chDB'
sidebar_label: 'Обзор'
slug: /chdb
description: 'chDB — это внутрипроцессный SQL OLAP-движок на базе ClickHouse'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'in-process', 'in process']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import dfBench from '@site/static/images/chdb/df_bench.png';


# chDB \{#chdb\}

chDB — это быстрый встраиваемый in-process SQL OLAP‑движок на базе [ClickHouse](https://github.com/clickhouse/clickhouse) версии v25.8.2.1.
Вы можете использовать его, когда вам нужны возможности ClickHouse в языке программирования без необходимости подключаться к отдельному серверу ClickHouse.

## Ключевые возможности \{#key-features\}

- **Встраиваемый SQL OLAP-движок** — на базе ClickHouse, нет необходимости устанавливать сервер ClickHouse
- **Поддержка множества форматов данных** — ввод и вывод данных в форматах Parquet, CSV, JSON, Arrow, ORC и [70+ других форматов](/interfaces/formats)
- **Минимизация копирования данных** — из C++ в Python с использованием [python memoryview](https://docs.python.org/3/c-api/memoryview.html)
- **Глубокая интеграция с экосистемой Python** — нативная поддержка Pandas, Arrow, DB API 2.0, органично встраивается в существующие data science‑процессы
- **Отсутствие зависимостей** — не требуется установка внешних баз данных
- **DataStore API** — API, совместимый с Pandas, с SQL-оптимизацией, поддерживающий более 630 методов

## DataStore: API, совместимый с pandas \{#datastore\}

**НОВИНКА!** DataStore предоставляет совместимый с pandas API, который сочетает привычный синтаксис pandas с производительностью ClickHouse.

### Однострочная миграция \{#one-line-migration\}

```python
# Just change your import - your pandas code works unchanged
- import pandas as pd
+ from chdb import datastore as pd

df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()
```


### Основные показатели производительности \{#performance-highlights\}

| Операция | pandas | DataStore | Прирост скорости |
|-----------|--------|-----------|------------------|
| GroupBy count | 347ms | 17ms | **19.93x** |
| Сложный пайплайн | 2,047ms | 380ms | **5.39x** |
| Filter+Sort+Head | 1,537ms | 350ms | **4.40x** |

*Результаты бенчмарка на 10M строк*

### Возможности DataStore \{#datastore-features\}

- **630+ методов API** — 209 методов pandas DataFrame, 185+ методов аксессоров
- **Отложенные вычисления (lazy evaluation)** — операции компилируются в оптимизированный SQL
- **SQL pushdown** — фильтры и агрегаты выполняются на стороне источника данных
- **Универсальные источники данных** — чтение из файлов, S3, баз данных и озёр данных

Подробнее: [Документация DataStore](datastore/index.md)

## Какие языки поддерживает chDB? \{#what-languages-are-supported-by-chdb\}

chDB поддерживает следующие языковые привязки:

* [Python](install/python.md) - [Справочник API](api/python.md)
* [Go](install/go.md)
* [Rust](install/rust.md)
* [NodeJS](install/nodejs.md)
* [Bun](install/bun.md)
* [C и C++](install/c.md)

## С чего начать? \{#how-do-i-get-started\}

* Если вы используете [Go](install/go.md), [Rust](install/rust.md), [NodeJS](install/nodejs.md), [Bun](install/bun.md) или [C и C++](install/c.md), ознакомьтесь с соответствующими страницами для этих языков.
* Если вы используете Python, см. [руководство для разработчиков по началу работы](getting-started.md) или [самостоятельный онлайн-курс chDB](https://learn.clickhouse.com/user_catalog_class/show/1901178).

### Для пользователей pandas \{#for-pandas-users\}

Начните с DataStore API, чтобы получить привычную работу в стиле pandas с производительностью ClickHouse:

* [Быстрый старт с DataStore](datastore/quickstart.md) — установка и миграция одной строкой
* [Миграция с pandas](guides/migration-from-pandas.md) — пошаговое руководство по миграции
* [Сборник рецептов по pandas](guides/pandas-cookbook.md) — распространённые шаблоны использования
* [Ключевые отличия](guides/pandas-differences.md) — важные отличия от pandas
* [Руководство по производительности](guides/pandas-performance.md) — рекомендации по оптимизации

### Справочник по API DataStore \{#datastore-reference\}

* [Factory Methods](datastore/factory-methods.md) - создание из файлов, баз данных и облачных хранилищ
* [Query Building](datastore/query-building.md) - построение запросов в стиле SQL
* [Pandas Compatibility](datastore/pandas-compat.md) - 209 совместимых методов
* [Accessors](datastore/accessors.md) - .str, .dt, .arr, .json, .url, .ip, .geo
* [Configuration](configuration/index.md) - движок, логирование, профилирование
* [Debugging](debugging/index.md) - explain(), профилирование, логирование

### Руководства по SQL API \{#sql-guides\}

* [Python API Reference](api/python.md) - Полная документация по SQL API
* [JupySQL](guides/jupysql.md)
* [Запросы к Pandas](guides/querying-pandas.md)
* [Запросы к Apache Arrow](guides/querying-apache-arrow.md)
* [Запросы к данным в S3](guides/querying-s3-bucket.md)
* [Запросы к файлам Parquet](guides/querying-parquet.md)
* [Запросы к удалённому ClickHouse](guides/query-remote-clickhouse.md)
* [Использование базы данных clickhouse-local](guides/clickhouse-local.md)

## Вводное видео \{#an-introductory-video\}

Посмотрите краткое введение в chDB и узнайте, как он переносит мощь ClickHouse в вашу среду Python:

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/e_yL0dlX6k4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## Показатели производительности \{#performance-benchmarks\}

chDB демонстрирует выдающуюся производительность в различных сценариях:

* **[ClickBench встраиваемых движков](https://benchmark.clickhouse.com/#eyJzeXN0ZW0iOnsiQXRoZW5hIChwYXJ0aXRpb25lZCkiOnRydWUsIkF0aGVuYSAoc2luZ2xlKSI6dHJ1ZSwiQXVyb3JhIGZvciBNeVNRTCI6dHJ1ZSwiQXVyb3JhIGZvciBQb3N0Z3JlU1FMIjp0cnVlLCJCeXRlSG91c2UiOnRydWUsImNoREIiOnRydWUsIkNpdHVzIjp0cnVlLCJjbGlja2hvdXNlLWxvY2FsIChwYXJ0aXRpb25lZCkiOnRydWUsImNsaWNraG91c2UtbG9jYWwgKHNpbmdsZSkiOnRydWUsIkNsaWNrSG91c2UiOnRydWUsIkNsaWNrSG91c2UgKHR1bmVkKSI6dHJ1ZSwiQ2xpY2tIb3VzZSAoenN0ZCkiOnRydWUsIkNsaWNrSG91c2UgQ2xvdWQiOnRydWUsIkNsaWNrSG91c2UgKHdlYikiOnRydWUsIkNyYXRlREIiOnRydWUsIkRhdGFiZW5kIjp0cnVlLCJEYXRhRnVzaW9uIChzaW5nbGUpIjp0cnVlLCJBcGFjaGUgRG9yaXMiOnRydWUsIkRydWlkIjp0cnVlLCJEdWNrREIgKFBhcnF1ZXQpIjp0cnVlLCJEdWNrREIiOnRydWUsIkVsYXN0aWNzZWFyY2giOnRydWUsIkVsYXN0aWNzZWFyY2ggKHR1bmVkKSI6ZmFsc2UsIkdyZWVucGx1bSI6dHJ1ZSwiSGVhdnlBSSI6dHJ1ZSwiSHlkcmEiOnRydWUsIkluZm9icmlnaHQiOnRydWUsIktpbmV0aWNhIjp0cnVlLCJNYXJpYURCIENvbHVtblN0b3JlIjp0cnVlLCJNYXJpYURCIjpmYWxzZSwiTW9uZXREQiI6dHJ1ZSwiTW9uZ29EQiI6dHJ1ZSwiTXlTUUwgKE15SVNBTSkiOnRydWUsIk15U1FMIjp0cnVlLCJQaW5vdCI6dHJ1ZSwiUG9zdGdyZVNRTCI6dHJ1ZSwiUG9zdGdyZVNRTCAodHVuZWQpIjpmYWxzZSwiUXVlc3REQiAocGFydGl0aW9uZWQpIjp0cnVlLCJRdWVzdERCIjp0cnVlLCJSZWRzaGlmdCI6dHJ1ZSwiU2VsZWN0REIiOnRydWUsIlNpbmdsZVN0b3JlIjp0cnVlLCJTbm93Zmxha2UiOnRydWUsIlNRTGl0ZSI6dHJ1ZSwiU3RhclJvY2tzIjp0cnVlLCJUaW1lc2NhbGVEQiAoY29tcHJlc3Npb24pIjp0cnVlLCJUaW1lc2NhbGVEQiI6dHJ1ZX0sInR5cGUiOnsic3RhdGVsZXNzIjpmYWxzZSwibWFuYWdlZCI6ZmFsc2UsIkphdmEiOmZhbHNlLCJjb2x1bW4tb3JpZW50ZWQiOmZhbHNlLCJDKysiOmZhbHNlLCJNeVNRTCBjb21wYXRpYmxlIjpmYWxzZSwicm93LW9yaWVudGVkIjpmYWxzZSwiQyI6ZmFsc2UsIlBvc3RncmVTUUwgY29tcGF0aWJsZSI6ZmFsc2UsIkNsaWNrSG91c2UgZGVyaXZhdGl2ZSI6ZmFsc2UsImVtYmVkZGVkIjp0cnVlLCJzZXJ2ZXJsZXNzIjpmYWxzZSwiUnVzdCI6ZmFsc2UsInNlYXJjaCI6ZmFsc2UsImRvY3VtZW50IjpmYWxzZSwidGltZS1zZXJpZXMiOmZhbHNlfSwibWFjaGluZSI6eyJzZXJ2ZXJsZXNzIjp0cnVlLCIxNmFjdSI6dHJ1ZSwiTCI6dHJ1ZSwiTSI6dHJ1ZSwiUyI6dHJ1ZSwiWFMiOnRydWUsImM2YS5tZXRhbCwgNTAwZ2IgZ3AyIjp0cnVlLCJjNmEuNHhsYXJnZSwgNTAwZ2IgZ3AyIjp0cnVlLCJjNS40eGxhcmdlLCA1MDBnYiBncDIiOnRydWUsIjE2IHRocmVhZHMiOnRydWUsIjIwIHRocmVhZHMiOnRydWUsIjI0IHRocmVhZHMiOnRydWUsIjI4IHRocmVhZHMiOnRydWUsIjMwIHRocmVhZHMiOnRydWUsIjQ4IHRocmVhZHMiOnRydWUsIjYwIHRocmVhZHMiOnRydWUsIm01ZC4yNHhsYXJnZSI6dHJ1ZSwiYzVuLjR4bGFyZ2UsIDIwMGdiIGdwMiI6dHJ1ZSwiYzZhLjR4bGFyZ2UsIDE1MDBnYiBncDIiOnRydWUsImRjMi44eGxhcmdlIjp0cnVlLCJyYTMuMTZ4bGFyZ2UiOnRydWUsInJhMy40eGxhcmdlIjp0cnVlLCJyYTMueGxwbHVzIjp0cnVlLCJTMjQiOnRydWUsIlMyIjp0cnVlLCIyWEwiOnRydWUsIjNYTCI6dHJ1ZSwiNFhMIjp0cnVlLCJYTCI6dHJ1ZX0sImNsdXN0ZXJfc2l6ZSI6eyIxIjp0cnVlLCIyIjp0cnVlLCI0Ijp0cnVlLCI4Ijp0cnVlLCIxNiI6dHJ1ZSwiMzIiOnRydWUsIjY0Ijp0cnVlLCIxMjgiOnRydWUsInNlcnZlcmxlc3MiOnRydWUsInVuZGVmaW5lZCI6dHJ1ZX0sIm1ldHJpYyI6ImhvdCIsInF1ZXJpZXMiOlt0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlXX0=)** — сравнение производительности SQL API
* **[DataFrame Бенчмарк](https://benchmark.clickhouse.com/#eyJzeXN0ZW0iOnsiQWxsb3lEQiI6dHJ1ZSwiQWxsb3lEQiAodHVuZWQpIjp0cnVlLCJBdGhlbmEgKHBhcnRpdGlvbmVkKSI6dHJ1ZSwiQXRoZW5hIChzaW5nbGUpIjp0cnVlLCJBdXJvcmEgZm9yIE15U1FMIjp0cnVlLCJBdXJvcmEgZm9yIFBvc3RncmVTUUwiOnRydWUsIkJ5Q29uaXR5Ijp0cnVlLCJCeXRlSG91c2UiOnRydWUsImNoREIgKERhdGFGcmFtZSkiOnRydWUsImNoREIgKFBhcnF1ZXQsIHBhcnRpdGlvbmVkKSI6dHJ1ZSwiY2hEQiI6dHJ1ZSwiQ2l0dXMiOnRydWUsIkNsaWNrSG91c2UgQ2xvdWQgKGF3cykiOnRydWUsIkNsaWNrSG91c2UgQ2xvdWQgKGF6dXJlKSI6dHJ1ZSwiQ2xpY2tIb3VzZSBDbG91ZCAoZ2NwKSI6dHJ1ZSwiQ2xpY2tIb3VzZSAoZGF0YSBsYWtlLCBwYXJ0aXRpb25lZCkiOnRydWUsIkNsaWNrSG91c2UgKGRhdGEgbGFrZSwgc2luZ2xlKSI6dHJ1ZSwiQ2xpY2tIb3VzZSAoUGFycXVldCwgcGFydGl0aW9uZWQpIjp0cnVlLCJDbGlja0hvdXNlIChQYXJxdWV0LCBzaW5nbGUpIjp0cnVlLCJDbGlja0hvdXNlICh3ZWIpIjp0cnVlLCJDbGlja0hvdXNlIjp0cnVlLCJDbGlja0hvdXNlICh0dW5lZCkiOnRydWUsIkNsaWNrSG91c2UgKHR1bmVkLCBtZW1vcnkpIjp0cnVlLCJDbG91ZGJlcnJ5Ijp0cnVlLCJDcmF0ZURCIjp0cnVlLCJDcnVuY2h5IEJyaWRnZSBmb3IgQW5hbHl0aWNzIChQYXJxdWV0KSI6dHJ1ZSwiRGF0YWJlbmQiOnRydWUsIkRhdGFGdXNpb24gKFBhcnF1ZXQsIHBhcnRpdGlvbmVkKSI6dHJ1ZSwiRGF0YUZ1c2lvbiAoUGFycXVldCwgc2luZ2xlKSI6dHJ1ZSwiQXBhY2hlIERvcmlzIjp0cnVlLCJEcnVpZCI6dHJ1ZSwiRHVja0RCIChEYXRhRnJhbWUpIjp0cnVlLCJEdWNrREIgKFBhcnF1ZXQsIHBhcnRpdGlvbmVkKSI6dHJ1ZSwiRHVja0RCIjp0cnVlLCJFbGFzdGljc2VhcmNoIjp0cnVlLCJFbGFzdGljc2VhcmNoICh0dW5lZCkiOmZhbHNlLCJHbGFyZURCIjp0cnVlLCJHcmVlbnBsdW0iOnRydWUsIkhlYXZ5QUkiOnRydWUsIkh5ZHJhIjp0cnVlLCJJbmZvYnJpZ2h0Ijp0cnVlLCJLaW5ldGljYSI6dHJ1ZSwiTWFyaWFEQiBDb2x1bW5TdG9yZSI6dHJ1ZSwiTWFyaWFEQiI6ZmFsc2UsIk1vbmV0REIiOnRydWUsIk1vbmdvREIiOnRydWUsIk1vdGhlcmR1Y2siOnRydWUsIk15U1FMIChNeUlTQU0pIjp0cnVlLCJNeVNRTCI6dHJ1ZSwiT3hsYSI6dHJ1ZSwiUGFuZGFzIChEYXRhRnJhbWUpIjp0cnVlLCJQYXJhZGVEQiAoUGFycXVldCwgcGFydGl0aW9uZWQpIjp0cnVlLCJQYXJhZGVEQiAoUGFycXVldCwgc2luZ2xlKSI6dHJ1ZSwiUGlub3QiOnRydWUsIlBvbGFycyAoRGF0YUZyYW1lKSI6dHJ1ZSwiUG9zdGdyZVNRTCAodHVuZWQpIjpmYWxzZSwiUG9zdGdyZVNRTCI6dHJ1ZSwiUXVlc3REQiAocGFydGl0aW9uZWQpIjp0cnVlLCJRdWVzdERCIjp0cnVlLCJSZWRzaGlmdCI6dHJ1ZSwiU2luZ2xlU3RvcmUiOnRydWUsIlNub3dmbGFrZSI6dHJ1ZSwiU1FMaXRlIjp0cnVlLCJTdGFyUm9ja3MiOnRydWUsIlRhYmxlc3BhY2UiOnRydWUsIlRlbWJvIE9MQVAgKGNvbHVtbmFyKSI6dHJ1ZSwiVGltZXNjYWxlREIgKGNvbXByZXNzaW9uKSI6dHJ1ZSwiVGltZXNjYWxlREIiOnRydWUsIlVtYnJhIjp0cnVlfSwidHlwZSI6eyJDIjpmYWxzZSwiY29sdW1uLW9yaWVudGVkIjpmYWxzZSwiUG9zdGdyZVNRTCBjb21wYXRpYmxlIjpmYWxzZSwibWFuYWdlZCI6ZmFsc2UsImdjcCI6ZmFsc2UsInN0YXRlbGVzcyI6ZmFsc2UsIkphdmEiOmZhbHNlLCJDKysiOmZhbHNlLCJNeVNRTCBjb21wYXRpYmxlIjpmYWxzZSwicm93LW9yaWVudGVkIjpmYWxzZSwiQ2xpY2tIb3VzZSBkZXJpdmF0aXZlIjpmYWxzZSwiZW1iZWRkZWQiOmZhbHNlLCJzZXJ2ZXJsZXNzIjpmYWxzZSwiZGF0YWZyYW1lIjp0cnVlLCJhd3MiOmZhbHNlLCJhenVyZSI6ZmFsc2UsImFuYWx5dGljYWwiOmZhbHNlLCJSdXN0IjpmYWxzZSwic2VhcmNoIjpmYWxzZSwiZG9jdW1lbnQiOmZhbHNlLCJzb21ld2hhdCBQb3N0Z3JlU1FMIGNvbXBhdGlibGUiOmZhbHNlLCJ0aW1lLXNlcmllcyI6ZmFsc2V9LCJtYWNoaW5lIjp7IjE2IHZDUFUgMTI4R0IiOnRydWUsIjggdkNQVSA2NEdCIjp0cnVlLCJzZXJ2ZXJsZXNzIjp0cnVlLCIxNmFjdSI6dHJ1ZSwiYzZhLjR4bGFyZ2UsIDUwMGdiIGdwMiI6dHJ1ZSwiTCI6dHJ1ZSwiTSI6dHJ1ZSwiUyI6dHJ1ZSwiWFMiOnRydWUsImM2YS5tZXRhbCwgNTAwZ2IgZ3AyIjp0cnVlLCIxOTJHQiI6dHJ1ZSwiMjRHQiI6dHJ1ZSwiMzYwR0IiOnRydWUsIjQ4R0IiOnRydWUsIjcyMEdCIjp0cnVlLCI5NkdCIjp0cnVlLCJkZXYiOnRydWUsIjcwOEdCIjp0cnVlLCJjNW4uNHhsYXJnZSwgNTAwZ2IgZ3AyIjp0cnVlLCJBbmFseXRpY3MtMjU2R0IgKDY0IHZDb3JlcywgMjU2IEdCKSI6dHJ1ZSwiYzUuNHhsYXJnZSwgNTAwZ2IgZ3AyIjp0cnVlLCJjNmEuNHhsYXJnZSwgMTUwMGdiIGdwMiI6dHJ1ZSwiY2xvdWQiOnRydWUsImRjMi44eGxhcmdlIjp0cnVlLCJyYTMuMTZ4bGFyZ2UiOnRydWUsInJhMy40eGxhcmdlIjp0cnVlLCJyYTMueGxwbHVzIjp0cnVlLCJTMiI6dHJ1ZSwiUzI0Ijp0cnVlLCIyWEwiOnRydWUsIjNYTCI6dHJ1ZSwiNFhMIjp0cnVlLCJYTCI6dHJ1ZSwiTDEgLSAxNkNQVSAzMkdCIjp0cnVlLCJjNmEuNHhsYXJnZSwgNTAwZ2IgZ3AzIjp0cnVlfSwiY2x1c3Rlcl9zaXplIjp7IjEiOnRydWUsIjIiOnRydWUsIjQiOnRydWUsIjgiOnRydWUsIjE2Ijp0cnVlLCIzMiI6dHJ1ZSwiNjQiOnRydWUsIjEyOCI6dHJ1ZSwic2VydmVybGVzcyI6dHJ1ZX0sIm1ldHJpYyI6ImhvdCIsInF1ZXJpZXMiOlt0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlXX0=)** - Сравнение движков DataFrame
* **[DataStore vs Pandas](datastore/index.md#performance)** — до 20 раз быстрее, чем pandas при типичных операциях

<Image img={dfBench} alt="Результаты теста производительности DataFrame" size="md"/>

## О chDB \{#about-chdb\}

- Прочитайте полную историю появления проекта chDB в [блоге](https://clickhouse.com/blog/chdb-embedded-clickhouse-rocket-engine-on-a-bicycle)
- Узнайте о chDB и его вариантах использования в [блоге](https://clickhouse.com/blog/welcome-chdb-to-clickhouse)
- Пройдите [самостоятельный онлайн-курс по chDB](https://learn.clickhouse.com/user_catalog_class/show/1901178)
- Попробуйте chDB прямо в браузере, используя [примеры codapi](https://antonz.org/trying-chdb/)
- Дополнительные примеры см. (https://github.com/chdb-io/chdb/tree/main/examples)

## Лицензия \{#license\}

chDB доступна по лицензии Apache версии 2.0. Дополнительные сведения см. в файле [LICENSE](https://github.com/chdb-io/chdb/blob/main/LICENSE.txt).