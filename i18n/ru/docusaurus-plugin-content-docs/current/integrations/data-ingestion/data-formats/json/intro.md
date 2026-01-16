---
sidebar_label: 'Обзор'
sidebar_position: 10
title: 'Работа с JSON'
slug: /integrations/data-formats/json/overview
description: 'Работа с JSON в ClickHouse'
keywords: ['json', 'clickhouse']
score: 10
doc_type: 'guide'
---

# Обзор работы с JSON \{#json-overview\}

<iframe
  src="//www.youtube.com/embed/gCg5ISOujtc"
  frameborder="0"
  allow="autoplay;
fullscreen;
picture-in-picture"
  allowfullscreen
/>

<br />

ClickHouse предоставляет несколько подходов к работе с JSON, каждый из которых имеет свои преимущества, недостатки и области применения. В этом руководстве мы рассмотрим, как загружать JSON и оптимально проектировать схему. Руководство состоит из следующих разделов:

* [Loading JSON](/integrations/data-formats/json/loading) - Загрузка и выполнение запросов к структурированному и полуструктурированному JSON в ClickHouse с использованием простых схем.
* [JSON schema inference](/integrations/data-formats/json/inference) - Использование автоматического вывода схемы JSON для выполнения запросов к JSON и создания схем таблиц.
* [Designing JSON schema](/integrations/data-formats/json/schema) - Этапы проектирования и оптимизации схемы JSON.
* [Exporting JSON](/integrations/data-formats/json/exporting) - Как экспортировать JSON.
* [Handling other JSON Formats](/integrations/data-formats/json/other-formats) - Рекомендации по работе с форматами JSON, отличными от формата с разделением по строкам (NDJSON).
* [Other approaches to modeling JSON](/integrations/data-formats/json/other-approaches) - Устаревшие подходы к моделированию JSON. **Не рекомендуется к использованию.**