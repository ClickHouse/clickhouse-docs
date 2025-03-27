---
sidebar_label: 'Обзор'
sidebar_position: 10
title: 'Работа с JSON'
slug: /integrations/data-formats/json/overview
description: 'Работа с JSON в ClickHouse'
keywords: ['json', 'clickhouse']
---


# Обзор

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

ClickHouse предоставляет несколько подходов для работы с JSON, каждый из которых имеет свои преимущества, недостатки и области применения. В этом руководстве мы рассмотрим, как загружать JSON и оптимально разрабатывать вашу схему. Это руководство состоит из следующих разделов:

- [Загрузка JSON](/integrations/data-formats/json/loading) - Загрузка и запрос JSON (в частности, [NDJSON](https://github.com/ndjson/ndjson-spec)) в ClickHouse с простыми схемами.
- [Вывод схемы JSON](/integrations/data-formats/json/inference) - Использование вывода схемы JSON для запроса JSON и создания схем таблиц.
- [Проектирование схемы JSON](/integrations/data-formats/json/schema) - Шаги для проектирования и оптимизации вашей схемы JSON.
- [Экспорт JSON](/integrations/data-formats/json/exporting) - Как экспортировать JSON.
- [Обработка других форматов JSON](/integrations/data-formats/json/other-formats) - Некоторые советы по обработке форматов JSON, отличных от NDJSON.
- [Другие подходы к моделированию JSON](/integrations/data-formats/json/other-approaches) - Расширенные подходы к моделированию JSON. **Не рекомендуется.**

:::note Важно: Новый тип JSON доступен в бета-версии
Это руководство рассматривает существующие методы работы с JSON. Новый тип JSON доступен в бета-версии. Дополнительные сведения [здесь](/sql-reference/data-types/newjson).
:::
