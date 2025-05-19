---
sidebar_label: 'Обзор'
sidebar_position: 10
title: 'Работа с JSON'
slug: /integrations/data-formats/json/overview
description: 'Работа с JSON в ClickHouse'
keywords: ['json', 'clickhouse']
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
ClickHouse предоставляет несколько подходов для работы с JSON, каждый из которых имеет свои плюсы и минусы, а также области применения. В этом руководстве мы рассмотрим, как загружать JSON и оптимально проектировать вашу схему. Это руководство состоит из следующих разделов:

- [Загрузка JSON](/integrations/data-formats/json/loading) - Загрузка и запрос структурированного и полуструктурированного JSON в ClickHouse с простыми схемами.
- [Вывод схемы JSON](/integrations/data-formats/json/inference) - Использование вывода схемы JSON для запроса JSON и создания схем таблиц.
- [Проектирование схемы JSON](/integrations/data-formats/json/schema) - Шаги по проектированию и оптимизации вашей схемы JSON.
- [Экспорт JSON](/integrations/data-formats/json/exporting) - Как экспортировать JSON.
- [Обработка других форматов JSON](/integrations/data-formats/json/other-formats) - Несколько советов по обработке форматов JSON, отличных от разделенного новой строкой (NDJSON).
- [Другие подходы к моделированию JSON](/integrations/data-formats/json/other-approaches) - Устаревшие подходы к моделированию JSON. **Не рекомендуется.**
