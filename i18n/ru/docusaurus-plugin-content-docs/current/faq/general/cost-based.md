---
title: 'Есть ли в ClickHouse стоимостной оптимизатор'
toc_hidden: true
toc_priority: 10
slug: /faq/general/cost-based
description: 'В ClickHouse реализованы определённые механизмы стоимостной оптимизации'
doc_type: 'reference'
keywords: ['CBE', 'optimizer']
---

# Есть ли у ClickHouse стоимостной оптимизатор? \{#does-clickhouse-have-a-cost-based-optimizer\}

В ClickHouse есть отдельные механизмы стоимостной оптимизации, например, порядок чтения столбцов определяется оценочной стоимостью чтения сжатых диапазонов данных с диска.

ClickHouse также выполняет переупорядочивание `JOIN` на основе статистики по столбцам, однако (по состоянию на 2025 год) это далеко не настолько продвинуто, как CBE в Postgres, Oracle, MS SQL Server.