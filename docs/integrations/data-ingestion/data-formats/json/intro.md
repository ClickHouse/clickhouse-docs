---
sidebar_label: 'Overview'
sidebar_position: 10
title: 'Working with JSON'
slug: /integrations/data-formats/json/overview
description: 'Working with JSON in ClickHouse'
keywords: ['json', 'clickhouse']
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

ClickHouse provides several approaches for handling JSON, each with its respective pros and cons and usage. In this guide, we will cover how to load JSON and design your schema optimally. This guide consists of the following sections:

- [Loading JSON](/integrations/data-formats/json/loading) - Loading and querying JSON (specifically, [NDJSON](https://github.com/ndjson/ndjson-spec)) in ClickHouse with simple schemas.
- [JSON schema inference](/integrations/data-formats/json/inference) - Using JSON schema inference to query JSON and create table schemas.
- [Designing JSON schema](/integrations/data-formats/json/schema) - Steps to design and optimize your JSON schema.
- [Exporting JSON](/integrations/data-formats/json/exporting) - How to export JSON.
- [Handling other JSON Formats](/integrations/data-formats/json/other-formats) - Some tips on handling JSON formats other than NDJSON.
- [Other approaches to modelling JSON](/integrations/data-formats/json/other-approaches) - Advanced approaches to modelling JSON. **Not recommended.**

:::note Important: A new JSON type is available in Beta
This guide considers existing techniques for handling JSON. A new JSON type is available in Beta. Further details [here](/sql-reference/data-types/newjson).
:::
