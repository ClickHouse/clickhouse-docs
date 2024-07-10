---
sidebar_label: Overview
sidebar_position: 10
title: Working with JSON
slug: /en/integrations/data-formats/json/overview
description: Working with JSON in ClickHouse
keywords: [json, clickhouse]
---

# Overview

<div style={{width:'640px', height: '360px'}}>
  <iframe src="//www.youtube.com/embed/gCg5ISOujtc"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br />

ClickHouse provides several approaches for handling JSON, each with its respective pros and cons and usage. In this guide, we will cover how to load json and design your schema optimally.

:::note Important: New JSON type
This guide considers existing techniques for handling JSON. A new JSON type is being actively developed and will be available soon. You can track the progress of this feature by following [this GitHub issue](https://github.com/ClickHouse/ClickHouse/issues/54864). This new data type will replace the existing deprecated [JSON object](/docs/en/sql-reference/data-types/json).
:::
