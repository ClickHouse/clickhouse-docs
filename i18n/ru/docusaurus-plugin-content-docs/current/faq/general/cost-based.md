---
title: 'Есть ли у ClickHouse стоимостной оптимизатор'
toc_hidden: true
toc_priority: 10
slug: /faq/general/cost-based
description: 'В ClickHouse есть определённые механизмы стоимостной оптимизации'
doc_type: 'reference'
keywords: ['CBE', 'optimizer']
---

# Есть ли в ClickHouse стоимостной оптимизатор?

В ClickHouse есть отдельные механизмы стоимостной оптимизации, например: порядок чтения столбцов определяется стоимостью чтения сжатых диапазонов данных с диска.

ClickHouse также выполняет переупорядочивание `JOIN` на основе статистики по столбцам, однако (по состоянию на 2025 год) эти механизмы пока значительно менее развиты, чем CBE в Postgres, Oracle, MS SQL Server.