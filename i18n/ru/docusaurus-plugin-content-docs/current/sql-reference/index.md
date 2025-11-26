---
description: 'Справочная документация по SQL в ClickHouse'
keywords: ['clickhouse', 'документация', 'sql-справочник', 'операторы sql', 'sql', 'синтаксис']
slug: /sql-reference
title: 'Справочник по SQL'
doc_type: 'reference'
---

import { TwoColumnList } from '/src/components/two_column_list'
import { ClickableSquare } from '/src/components/clickable_square'
import { HorizontalDivide } from '/src/components/horizontal_divide'
import { ViewAllLink } from '/src/components/view_all_link'
import { VideoContainer } from '/src/components/video_container'

import LinksDeployment from './sql-reference-links.json'


# Справочник по SQL в ClickHouse

ClickHouse поддерживает декларативный язык запросов на основе SQL, который во многих случаях идентичен стандарту ANSI SQL.

Поддерживаются запросы с GROUP BY, ORDER BY, подзапросами в FROM, клаузой JOIN, оператором IN, оконными функциями и скалярными подзапросами.

<HorizontalDivide />

<TwoColumnList items={LinksDeployment} />