---
description: 'Набор данных и запросов бенчмарка TPC-DS.'
sidebar_label: 'TPC-DS'
slug: /getting-started/example-datasets/tpcds
title: 'TPC-DS (2012)'
doc_type: 'guide'
keywords: ['пример набора данных', 'tpcds', 'бенчмарк', 'пример данных', 'тестирование производительности']
---

Аналогично [Star Schema Benchmark (SSB)](star-schema.md), TPC-DS основан на [TPC-H](tpch.md), но пошёл в противоположном направлении: увеличил количество необходимых соединений за счёт хранения данных в сложной схеме типа «снежинка» (24 таблицы вместо 8).
Распределение данных является несбалансированным (например, нормальное распределение и распределение Пуассона).
Он включает 99 отчётных и ad-hoc-запросов со случайными подстановками.

**Ссылки**

* [The Making of TPC-DS](https://dl.acm.org/doi/10.5555/1182635.1164217) (Nambiar), 2006

## Генерация и импорт данных \{#data-generation-and-import\}

Сначала клонируйте репозиторий TPC-DS и скомпилируйте генератор данных:

```bash
git clone https://github.com/gregrahn/tpcds-kit.git
cd tpcds-kit/tools
make
```

Затем сгенерируйте данные. Параметр `-scale` задаёт коэффициент масштабирования.

```bash
./dsdgen -scale 1
```

Теперь создайте таблицы в ClickHouse. Определения таблиц приведены в файле [`init.sql`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/init.sql) в репозитории ClickHouse.

Данные можно импортировать следующим образом:

```bash
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO call_center FORMAT CSV" < call_center.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO catalog_page FORMAT CSV" < catalog_page.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO catalog_returns FORMAT CSV" < catalog_returns.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO catalog_sales FORMAT CSV" < catalog_sales.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO customer FORMAT CSV" < customer.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO customer_address FORMAT CSV" < customer_address.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO customer_demographics FORMAT CSV" < customer_demographics.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO date_dim FORMAT CSV" < date_dim.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO household_demographics FORMAT CSV" < household_demographics.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO income_band FORMAT CSV" < income_band.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO inventory FORMAT CSV" < inventory.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO item FORMAT CSV" < item.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO promotion FORMAT CSV" < promotion.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO reason FORMAT CSV" < reason.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO ship_mode FORMAT CSV" < ship_mode.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO store FORMAT CSV" < store.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO store_returns FORMAT CSV" < store_returns.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO store_sales FORMAT CSV" < store_sales.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO time_dim FORMAT CSV" < time_dim.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO warehouse FORMAT CSV" < warehouse.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO web_page FORMAT CSV" < web_page.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO web_returns FORMAT CSV" < web_returns.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO web_sales FORMAT CSV" < web_sales.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO web_site FORMAT CSV" < web_site.dat
```

Затем выполните сгенерированные запросы.

## Запросы \{#queries\}

99 запросов TPC-DS можно найти [здесь](https://github.com/ClickHouse/ClickHouse/tree/master/tests/benchmarks/tpc-ds/queries) в репозитории ClickHouse.

Чтобы получить поведение, совместимое со стандартом SQL, и ожидаемые результаты, примените настройки из [`settings.json`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/settings.json).
Известные проблемы и примечания по отдельным запросам см. в файле [README](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/README.md).

**Корректность**

Результаты запросов соответствуют официальным результатам, если не оговорено иное. Возможны небольшие расхождения в точности, которые допускаются спецификацией TPC-DS.