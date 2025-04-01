---
slug: /integrations/marimo
sidebar_label: 'marimo'
description: 'marimo is a next-generation Python notebook for interacting with data'
title: 'Using marimo with ClickHouse'
---

import Image from '@theme/IdealImage';
import marimo_add_db_panel from '@site/static/images/integrations/sql-clients/marimo/panel-arrow.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Using marimo with ClickHouse

<CommunityMaintainedBadge/>

[marimo](marimo.io) is a next generation Python notebook for interacting with data. You can perform visualizations, data transformations and switch between SQL and Python on-the-fly.

1. Install marimo with SQL support

```
pip install "marimo[sql]"
marimo edit notebook.py
```
This should open up a web browser running on localhost.

2. Connecting to ClickHouse

Navigate to the datasources panel in marimo and click on 'Add database'.

<Image img={marimo_add_db_panel} size="sm" border alt="Add a new database" />

It will then popup a convenient database form for you to fill up.


