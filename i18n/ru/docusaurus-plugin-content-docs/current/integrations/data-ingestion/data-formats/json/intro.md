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

# Обзор JSON

<iframe src="//www.youtube.com/embed/gCg5ISOujtc"
frameborder="0"
allow="autoplay;
fullscreen;
picture-in-picture"
allowfullscreen>
</iframe>

<br/>

ClickHouse предоставляет несколько подходов к работе с JSON, каждый со своими преимуществами, недостатками и сценариями использования. В этом руководстве мы рассмотрим, как загружать JSON и оптимально проектировать схему. Руководство состоит из следующих разделов:

- [Загрузка JSON](/integrations/data-formats/json/loading) — загрузка и выполнение запросов к структурированному и полуструктурированному JSON в ClickHouse с использованием простых схем.
- [Вывод схемы JSON](/integrations/data-formats/json/inference) — использование вывода схемы JSON для выполнения запросов к JSON и создания схем таблиц.
- [Проектирование схемы JSON](/integrations/data-formats/json/schema) — шаги по проектированию и оптимизации схемы JSON.
- [Экспорт JSON](/integrations/data-formats/json/exporting) — как экспортировать JSON.
- [Обработка других форматов JSON](/integrations/data-formats/json/other-formats) — несколько советов по обработке форматов JSON, отличных от формата с разделением записей переводом строки (NDJSON).
- [Другие подходы к моделированию JSON](/integrations/data-formats/json/other-approaches) — устаревшие подходы к моделированию JSON. **Не рекомендуется.**