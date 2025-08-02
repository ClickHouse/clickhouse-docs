---
slug: /use-cases/observability/clickstack/search
title: 'Search with ClickStack'
sidebar_label: 'Search'
pagination_prev: null
pagination_next: null
description: 'Search with ClickStack'
keywords: ['ClickStack search', 'full-text search', 'log search', 'trace search', 'Lucene syntax', 'observability search']
---

import Image from '@theme/IdealImage';
import hyperdx_27 from '@site/static/images/use-cases/observability/hyperdx-27.png';

ClickStack allows you to do a full-text search on your events (logs and traces). You can get started searching by just typing keywords that match your events. For example, if your log contains "Error", you can find it by just typing in "Error" in the search bar.

This same search syntax is used for filtering events with Dashboards and Charts
as well.

## Natural language search syntax {#natural-language-syntax}

- Searches are not case sensitive
- Searches match by whole word by default (ex. `Error` will match `Error here`
  but not `Errors here`). You can surround a word by wildcards to match partial
  words (ex. `*Error*` will match `AnyError` and `AnyErrors`)
- Search terms are searched in any order (ex. `Hello World` will match logs that
  contain `Hello World` and `World Hello`)
- You can exclude keywords by using `NOT` or `-` (ex. `Error NOT Exception` or
  `Error -Exception`)
- You can use `AND` and `OR` to combine multiple keywords (ex.
  `Error OR Exception`)
- Exact matches can be done via double quotes (ex. `"Error tests not found"`)

<Image img={hyperdx_27} alt="Search" size="md"/>

### Column/property search {#column-search}

- You can search columns and JSON/map properties by using `column:value` (ex. `level:Error`,
  `service:app`)
- You can search for a range of values by using comparison operators (`>`, `<`,
  `>=`, `<=`) (ex. `Duration:>1000`)
- You can search for the existence of a property by using `property:*` (ex.
  `duration:*`)

## Time input {#time-input}

- Time input accepts natural language inputs (ex. `1 hour ago`, `yesterday`,
  `last week`)
- Specifying a single point in time will result in searching from that point in
  time up until now.
- Time range will always be converted into the parsed time range upon search for
  easy debugging of time queries.
- You can highlight a histogram bar to zoom into a specific time range as well.

## SQL search syntax {#sql-syntax}

You can optionally toggle search inputs to be in SQL mode. This will accept any valid
SQL WHERE clause for searching. This is useful for complex queries that cannot be
expressed in Lucene syntax.

## Select statement  {#select-statement}

To specify the columns to display in the search results, you can use the `SELECT`
input. This is a SQL SELECT expression for the columns to select in the search page.
Aliases are not supported at this time (ex. you can not use `column as "alias"`).
