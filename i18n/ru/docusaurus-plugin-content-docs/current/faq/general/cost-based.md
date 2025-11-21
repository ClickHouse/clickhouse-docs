---
title: 'Есть ли в ClickHouse стоимостной оптимизатор'
toc_hidden: true
toc_priority: 10
slug: /faq/general/cost-based
description: 'В ClickHouse реализованы отдельные механизмы стоимостной оптимизации'
doc_type: 'reference'
keywords: ['CBE', 'optimizer']
---

# Есть ли у ClickHouse стоимостной оптимизатор?

В ClickHouse есть отдельные механизмы стоимостной оптимизации, например порядок чтения столбцов определяется стоимостью чтения сжатых диапазонов данных с диска.

ClickHouse также выполняет перестановку JOIN на основе статистики по столбцам, однако (по состоянию на 2025 год) это пока далеко не настолько продвинуто, как CBE в Postgres, Oracle, MS SQL Server.