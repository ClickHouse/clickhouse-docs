---
slug: /troubleshooting/error-codes/135_ZERO_ARRAY_OR_TUPLE_INDEX
sidebar_label: '135 ZERO_ARRAY_OR_TUPLE_INDEX'
doc_type: 'reference'
keywords: ['error codes', 'ZERO_ARRAY_OR_TUPLE_INDEX', '135', 'tuple', 'index', 'zero', 'tupleElement']
title: '135 ZERO_ARRAY_OR_TUPLE_INDEX'
description: 'ClickHouse error code - 135 ZERO_ARRAY_OR_TUPLE_INDEX'
---

# Error 135: ZERO_ARRAY_OR_TUPLE_INDEX

:::tip
This error occurs when you attempt to access a **tuple** element using index 0. ClickHouse tuples use 1-based indexing, meaning the first element is at index 1, not 0.
:::
