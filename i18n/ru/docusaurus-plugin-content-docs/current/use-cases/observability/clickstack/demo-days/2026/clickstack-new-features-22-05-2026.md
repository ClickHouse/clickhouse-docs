---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-05-22
title: 'Демо-дни — 2026-05-22'
sidebar_label: '2026-05-22'
sidebar_position: -20260522
pagination_prev: null
pagination_next: null
description: 'Демо-дни ClickStack от 2026-05-22'
doc_type: 'guide'
keywords: ['ClickStack', 'Демо-дни']
---

## Обновление генерации данных в ClickCannon \{#clickcannon-data-generation-update\}

*Демонстрация от [@SpencerTorres](https://github.com/SpencerTorres)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Zljd07_4uF4" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

[ClickCannon](https://github.com/clickhouse/clickcannon) — это инструмент, который мы используем внутри компании для подбора конфигурации: он генерирует большие объёмы данных OpenTelemetry и одновременно выполняет запросы, чтобы оценить, какие ресурсы нужны клиентам для заданной рабочей нагрузки по приёму данных и выполнению запросов. На OpenHouse мы впервые представили его публично, а Spencer показал его последнюю версию.

Теперь вместо предварительной подготовки данных на диске генератор можно настраивать прямо в конфигурации. Включите его, задайте число потоков, число строк в блоке, общее число строк в секунду и несколько ограничений по памяти. Больше не нужно заранее записывать на диск два терабайта тестовых данных — именно поэтому раньше инструментом было сложно делиться.

Мы будем рекомендовать ClickCannon большему числу пользователей для их собственных задач по подбору конфигурации. Репозиторий находится по адресу [https://github.com/clickhouse/clickcannon](https://github.com/clickhouse/clickcannon).

## Выбор даты для полноэкранных плиток и фильтров с привязкой к источникам \{#date-input-for-full-screen-tiles-and-source-scoped-filters\}

*Демонстрация от [@pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Mop1EYtGwKc" title="Видеопроигрыватель YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Одновременно появились два связанных улучшения панели мониторинга. Когда вы открываете отдельную плитку в полноэкранном режиме, для неё теперь доступны собственные селектор времени и выбор детализации, не зависящие от временного диапазона самой панели мониторинга. Это значит, что вы можете приблизить большой исторический интервал для одной конкретной метрики (например, одного графика на панели мониторинга кластера ClickHouse), не заставляя обновляться все остальные плитки на панели мониторинга. Название панели мониторинга теперь также отображается в заголовке вкладки браузера.

Второе изменение — привязка фильтров панели мониторинга к источникам. Фильтры можно ограничить так, чтобы они распространялись только на плитки, связанные с определёнными источниками, а не применялись глобально ко всем плиткам. На панели мониторинга со смешанными источниками, где объединяются, например, журналы и трассировки, можно не допустить, чтобы фильтр попадал в плитку, к которой он не относится.

**Связанные PR:** [#2302](https://github.com/hyperdxio/hyperdx/pull/2302) feat: Незначительные улучшения панели мониторинга, [#2331](https://github.com/hyperdxio/hyperdx/pull/2331) feat: Добавить привязку фильтров панели мониторинга к источникам

## Текстовый индекс распознаётся для lower(Body) \{#text-index-recognised-on-lower-body\}

*Демо от [@pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/l0GpNBP859o" title="Видеопроигрыватель YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Небольшое, но важное исправление, связанное с корректностью регистронезависимого поиска. Если в вашем источнике определён текстовый индекс для `lower(Body)` без аргумента `preprocessor`, планировщик запросов ранее генерировал условие `hasAllTokens(Body, ...)`. Поскольку это выражение не совпадало с выражением индекса, текстовый индекс не использовался, и запрос переключался на сканирование.

Теперь запрос генерируется как `hasAllTokens(lower(Body), ...)`, что соответствует выражению индекса. Благодаря этому регистронезависимый поиск по источникам, настроенным таким образом, теперь корректно ускоряется текстовым индексом.

**Связанные PR:** [#2326](https://github.com/hyperdxio/hyperdx/pull/2326) feat: поддержка текстового индекса для lower(Body) без `preprocessor`

## Более простой сценарий работы с Event Deltas \{#simpler-event-deltas-experience\}

*Демо от [@alex-fedotyev](https://github.com/alex-fedotyev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BrIHHFz_Aw8" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Раньше для работы с Event Deltas требовался дополнительный шаг. Перед тем как выделить область на тепловой карте, нужно было нажать кнопку и перейти в режим сравнения. Теперь этого шага нет: столбцы распределения появляются сразу после загрузки, а как только вы выделяете область на тепловой карте, они переключаются в режим сравнения выделения с фоном. Щёлкните за пределами выделенной области — и интерфейс вернётся к представлению всех спанов.

Изначально это изменение попало в OSS несколько недель назад, но в Управляемом ClickStack не хватало одной его части. Теперь этот пробел устранён, и упрощённый сценарий одинаков в обеих редакциях.

**Связанные PR:** [#1899](https://github.com/hyperdxio/hyperdx/pull/1899) feat: всегда включённый режим распределения атрибутов

## Оглавление панели мониторинга и массовое сворачивание \{#dashboard-table-of-contents-and-bulk-collapse\}

*Демонстрация от [@teeohhem](https://github.com/teeohhem)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Pojo5zf_hrE" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Когда в панели мониторинга становится больше нескольких разделов (а это именно то, что нужно, потому что разделы помогают организовать большую панель мониторинга), навигация по ней становится неудобной. Том добавил справа оглавление со списком всех разделов, которое позволяет сразу переходить к нужному. Также появился элемент массового сворачивания и разворачивания, который разом скрывает содержимое всех разделов, чтобы можно было быстро просмотреть структуру длинной панели мониторинга, не прокручивая её целиком.

Пока это ещё черновой вариант, но он уже полезен в многосекционных панелях мониторинга, которые мы поставляем для представлений кластера ClickHouse и Kubernetes.

**Связанные PR:** [#2350](https://github.com/hyperdxio/hyperdx/pull/2350) feat(dashboard): add Table of Contents right rail with bulk collapse/expand

## Изменение размера столбцов сохраняется между сеансами \{#column-resize-persisted-across-sessions\}

*Демо от [@teeohhem](https://github.com/teeohhem)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/7l-Rz1tFlq8" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Вчера от клиента поступил запрос: если изменить ширину столбца в таблице результатов, она должна сохраняться. Теперь это работает именно так. Ширина столбцов хранится в локальном хранилище с привязкой к ID таблицы, поэтому для разных таблиц сохраняются независимые настройки столбцов. Закройте браузер, вернитесь позже — столбцы останутся в том виде, в котором вы их оставили. Добавление или удаление столбца из таблицы тоже не сбрасывает ширину остальных столбцов.

**Связанные PR:** [#2327](https://github.com/hyperdxio/hyperdx/pull/2327) fix: persist column widths in search results table