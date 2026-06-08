---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-05-29
title: 'Демо-дни — 2026-05-29'
sidebar_label: '2026-05-29'
sidebar_position: -20260529
pagination_prev: null
pagination_next: null
description: 'Демо-дни ClickStack на 2026-05-29'
doc_type: 'guide'
keywords: ['ClickStack', 'Демо-дни']
---

## Улучшенная фильтрация схем с учётом версии \{#version-aware-improved-schema-filtering\}

*Демонстрация от [@knudtty](https://github.com/knudtty)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/bAVaBnfJ82Y" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Теперь ClickStack применяет оптимизацию direct&#95;read только в ClickHouse версии 26.2 и выше, где индекс полнотекстового поиска корректно поддерживает столбцы-псевдонимы, добавленные в open-source-схемы. Ранее оптимизация могла применяться и в более старых версиях, где работала некорректно. Проверка версии выполняется во время запроса на основе схемы, а сами столбцы-псевдонимы теперь по умолчанию включены в open-source-схемы.

Также показано: работа по замене materialized view для автодополнения прямыми запросами к text index всё ещё продолжается. Сейчас оба механизма частично дублируют друг друга, увеличивая нагрузку на приём данных. Если тесты подтвердят, что запросы к text index не уступают по производительности, materialized view можно будет упростить или убрать. Аарон также ответил на вопросы команды о том, как позиционное кодирование в будущих версиях ClickHouse text index может сделать lookup в фильтрах ключ-значение ещё точнее.

**Связанные PR:** [#2341](https://github.com/hyperdxio/hyperdx/pull/2341) feat: по умолчанию добавляет оптимизацию direct&#95;read для журналов и traces, [#2405](https://github.com/hyperdxio/hyperdx/pull/2405) feat(common-utils): применяет оптимизацию direct&#95;read для элементов KV к SQL-фильтрам, [#2376](https://github.com/hyperdxio/hyperdx/pull/2376) feat: использует text index для фильтров и автодополнения

## Улучшенный разбор журналов \{#better-log-parsing\}

*Демонстрация от [@dhable](https://github.com/dhable)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/vhkMlddahu4" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

У одного клиента были журналы, в которых тело события представляло собой JSON-объект с полем `level`. Логика определения уровня серьёзности делала две вещи: разбирала тело как JSON, чтобы извлечь атрибуты, а затем, если уровень серьёзности не был задан на уровне OTel, переходила к сопоставлению по строкам. При таком сопоставлении срабатывало слово &quot;alert&quot; из имени alert manager внутри тела, из-за чего уровень журнала определялся неверно.

Исправление добавляет защитное условие: если тело разбирается как JSON и уже содержит поле `level`, шаг строкового определения полностью пропускается. Набор smoke-тестов, созданный около года назад, позволил легко проверить исправление и отловить связанные пограничные случаи, просто добавив новые тестовые сценарии, — именно для этого он и был задуман.

**Связанные PR:** [#2363](https://github.com/hyperdxio/hyperdx/pull/2363) fix(log-parser): пропускать строковое определение, когда тело разбирается как JSON с полем level

## Улучшения MCP Server \{#mcp-server-improvements\}

*Демо от [@brandon-pereira](https://github.com/brandon-pereira)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/aIy1zfmlz3Y" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

На этой неделе вышло несколько улучшений для MCP: более точная группировка и оценка шаблонов событий, улучшенные подсказки об ошибках и очистка общих хелперов. Префиксы инструментов также были переименованы с `hyperdx_` на `clickstack_`, чтобы соответствовать названию продукта.

**Связанные PR:** [#2337](https://github.com/hyperdxio/hyperdx/pull/2337) feat(mcp): улучшить качество инструментов MCP — подсказки об ошибках, общие хелперы, более понятные сообщения, [#2396](https://github.com/hyperdxio/hyperdx/pull/2396) refactor(mcp): переименовать префиксы инструментов с hyperdx&#95; на clickstack&#95;, [#2343](https://github.com/hyperdxio/hyperdx/pull/2343) feat(mcp): добавить инструменты patch&#95;dashboard, get&#95;dashboard&#95;tile, search&#95;dashboards, [#2418](https://github.com/hyperdxio/hyperdx/pull/2418) fix(mcp): улучшить описания псевдонимов и примеры для читаемых легенд графиков, [#2412](https://github.com/hyperdxio/hyperdx/pull/2412) refactor: упростить валидацию MCP ObjectId с помощью общих хелперов и проверок на уровне схемы

## Палитра цветов для серий \{#new-series-color-palette\}

*Демо от [@elizabetdev](https://github.com/elizabetdev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/YzECP3diWvg" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Elizabet работала над унификацией палитры цветов для визуализации данных в темах HyperDX и ClickStack, в рамках работы Alex над выбором цвета. Для двух тем использовались отдельные палитры с собственными правилами-исключениями, из-за чего работа с цветами была излишне сложной. Цель состояла в том, чтобы создать единую палитру, подходящую для обеих тем.

Она протестировала отраслевые стандартные палитры (Tableau, Observable, IBM) с помощью инструмента симуляции цветового зрения, чтобы проверить контрастность и доступность. Палитра ClickHouse показала слабый результат — зелёный цвет недостаточно контрастен на белом фоне. И Tableau, и Observable не проходят как минимум одну из проверок; палитра IBM проходит все, но в ней всего пять цветов, а этого недостаточно. В целом ближе всего подошла палитра Observable с небольшой корректировкой синего, и теперь она будет общей для обеих тем.

**Связанные PR:** [#2362](https://github.com/hyperdxio/hyperdx/pull/2362) refactor(theme): rename chart palette tokens to hue names + unify across themes

## Новая компоновка страницы с закреплённым заголовком \{#new-page-layout-with-sticky-header\}

*Демо от [@elizabetdev](https://github.com/elizabetdev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/e7d3ocqi4Ac" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Новая пара компонентов PageHeader и PageLayout была внедрена на всех основных страницах: панелях мониторинга, карте сервисов, клиентских сеансах, Kubernetes и панели мониторинга ClickHouse. Теперь у всех страниц одинаковые отступы, линия-разделитель под заголовком и единая структура заголовков. Раньше оформление страниц различалось: где-то заголовок был слева, а элементы управления справа, а где-то заголовка не было вовсе.

Закрепление включается через prop. Всё, что вы передаёте в sticky slot, остаётся закреплённым под заголовком при прокрутке; всё остальное прокручивается как обычно. Если туда ничего не передано, автоматически закрепляются хлебные крошки или параметры страницы.

**Связанные PR:** [#2282](https://github.com/hyperdxio/hyperdx/pull/2282) Добавить PageHeader/PageLayout и перенести Sessions, [#2345](https://github.com/hyperdxio/hyperdx/pull/2345) Использовать заголовок PageHeader на страницах списков, [#2346](https://github.com/hyperdxio/hyperdx/pull/2346) Перенести Service Map на PageLayout, [#2347](https://github.com/hyperdxio/hyperdx/pull/2347) Перенести панель мониторинга Kubernetes на PageLayout, [#2348](https://github.com/hyperdxio/hyperdx/pull/2348) Перенести панель мониторинга ClickHouse на PageLayout, [#2364](https://github.com/hyperdxio/hyperdx/pull/2364) feat(dashboard): перенести на PageLayout с закреплённой панелью инструментов запросов, [#2394](https://github.com/hyperdxio/hyperdx/pull/2394) fix(PageHeader): удерживать закреплённый заголовок ниже перекрывающих drawer-элементов

## Новый селектор источников данных и выбор цвета для серий \{#new-datasource-selector-and-color-picking-for-series\}

*Демо от [@alex-fedotyev](https://github.com/alex-fedotyev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/DKfJs9onl50" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Два улучшения интерфейса от Alex. Селектор источников данных стал проще: при нажатии теперь показывается только список источников данных. Действия управления, такие как просмотр схемы или создание нового источника, перенесены в отдельное kebab-меню. Это разделяет выбор и настройку — давняя задача из списка дел, которая также учитывает отзывы команды.

Для плиток Number теперь также доступен статический выбор цвета, чтобы можно было назначить метрике конкретный цвет. Условные правила цвета (когда цвет становится красным, зелёным или жёлтым в зависимости от порогового значения или столбца) тоже уже в работе. Когда появится унифицированная палитра Elizabet, в обоих случаях будут использоваться цвета с понятными названиями вместо текущих меток «цвет 1, 2, 3», что должно стать заметным улучшением для пользователей, переходящих с таких инструментов, как Grafana.

**Связанные PR:** [#2365](https://github.com/hyperdxio/hyperdx/pull/2365) feat(source-picker): chip + kebab menu UX, [#2265](https://github.com/hyperdxio/hyperdx/pull/2265) feat(app): number tile static color picker

## Более понятные подсказки к действиям на панели мониторинга \{#better-hints-for-dashboard-actions\}

*Демонстрация от [@alex-fedotyev](https://github.com/alex-fedotyev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/yQaKMSXp8YA" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Строки табличной плитки на панели мониторинга теперь показывают более информативное состояние при наведении. При наведении курсор и значок меняются, подсказывая, что произойдёт при щелчке: либо откроется связанная панель мониторинга, либо будет выполнен переход к деталям в источнике данных. До этого изменения было неочевидно, что строки вообще кликабельны, не говоря уже о том, что именно произойдёт при нажатии.

**Связанные PR:** [#2321](https://github.com/hyperdxio/hyperdx/pull/2321) feat(app): подсказка при наведении и стандартный индикатор ссылки для щелчка по строке табличной плитки на панели мониторинга