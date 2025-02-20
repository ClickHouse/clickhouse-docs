---
slug: /materialized-views
title: Materialized Views
description: Index page for materialized views
keywords: [materialized views, speed up queries, query optimization, refreshable, incremental]
---

| Page                                                                                      | Description                                                                                                                                                                                    |
|-------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Incremental Materialized View](/materialized-view/incremental-materialized-view) | Allow users to shift the cost of computation from query time to insert time, resulting in faster `SELECT` queries.                                                                             |
| [Refreshable Materialized View](/materialized-view/refreshable-materialized-view) | Conceptually similar to incremental materialized views but require the periodic execution of the query over the full dataset - the results of which are stored in a target table for querying. |
