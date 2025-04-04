---
description: 'Документация по SQL-справочнику ClickHouse'
keywords: ['clickhouse', 'docs', 'sql справочник', 'sql операторы', 'sql', 'синтаксис']
slug: /sql-reference
title: 'SQL Справочник'
---

import { TwoColumnList } from '/src/components/two_column_list'
import { ClickableSquare } from '/src/components/clickable_square'
import { HorizontalDivide } from '/src/components/horizontal_divide'
import { ViewAllLink } from '/src/components/view_all_link'
import { VideoContainer } from '/src/components/video_container'

import LinksDeployment from './sql-reference-links.json'


# Справочник SQL ClickHouse

ClickHouse поддерживает декларативный язык запросов на основе SQL, который во многих случаях идентичен стандарту ANSI SQL.

Поддерживаемые запросы включают GROUP BY, ORDER BY, подзапросы в FROM, JOIN, оператор IN, оконные функции и скалярные подзапросы.

<HorizontalDivide />

<TwoColumnList items={LinksDeployment} />
