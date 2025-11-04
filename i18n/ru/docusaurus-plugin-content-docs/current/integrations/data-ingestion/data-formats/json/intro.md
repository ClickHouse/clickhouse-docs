---
slug: '/integrations/data-formats/json/overview'
sidebar_label: Обзор
sidebar_position: 10
description: 'Работа с JSON в ClickHouse'
title: 'Работа с JSON'
keywords: ['json', 'clickhouse']
doc_type: guide
score: 10
---
# Обзор JSON

<div style={{width:'1024px', height: '576px'}}>
  <iframe src="//www.youtube.com/embed/gCg5ISOujtc"
    width="1024"
    height="576"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br/>
ClickHouse предоставляет несколько подходов для работы с JSON, каждый из которых имеет свои плюсы и минусы. В этом руководстве мы рассмотрим, как загружать JSON и оптимально проектировать вашу схему. Это руководство состоит из следующих разделов:

- [Загрузка JSON](/integrations/data-formats/json/loading) - Загрузка и выполнение запросов к структурированному и полуструктурированному JSON в ClickHouse с простыми схемами.
- [Вывод схемы JSON](/integrations/data-formats/json/inference) - Использование вывода схемы JSON для выполнения запросов к JSON и создания схем таблиц.
- [Проектирование схемы JSON](/integrations/data-formats/json/schema) - Шаги по проектированию и оптимизации вашей схемы JSON.
- [Экспорт JSON](/integrations/data-formats/json/exporting) - Как экспортировать JSON.
- [Работа с другими форматами JSON](/integrations/data-formats/json/other-formats) - Несколько советов по работе с форматами JSON, отличными от формата с разделением по строкам (NDJSON).
- [Другие подходы к моделированию JSON](/integrations/data-formats/json/other-approaches) - Устаревшие подходы к моделированию JSON. **Не рекомендовано.**