---
slug: /en/cloud/bestpractices/avoid-optimize-final
sidebar_label: Avoid Optimize Final
title: Avoid Optimize Final
---

Using the [OPTIMIZE TABLE ... FINAL](/docs/en/sql-reference/statements/optimize/) query will initiate an unscheduled merge of data parts for the specific table into one data part. During this process, ClickHouse reads all the data parts, uncompresses, merges, compresses them into a single part, and then rewrites back into object store, causing huge CPU and IO consumption. Note that this optimization rewrites the one part even if they are already merged into a single part.
