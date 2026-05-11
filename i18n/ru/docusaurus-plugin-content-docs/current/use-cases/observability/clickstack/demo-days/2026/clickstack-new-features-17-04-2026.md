---
slug: /use-cases/observability/clickstack/demo-days/2026/04/2026-04-17
title: 'Демо-дни — 2026-04-17'
sidebar_label: '2026-04-17'
pagination_prev: null
pagination_next: null
description: 'Демо-дни ClickStack от 2026-04-17'
doc_type: 'guide'
keywords: ['ClickStack', 'Демо-дни']
---

## Сводка по логам и трейсам \{#summarize-logs-and-traces\}

*Демо от [@alex-fedotyev](https://github.com/alex-fedotyev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/TWsFyWt-tD8" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

В HyperDX появилась функция AI summarize, которая работает с логами, трейсами и паттернами. Новая кнопка summarize преобразует ваши телеметрические данные в удобную для чтения сводку, позволяя быстро понять, что произошло в наборе событий, без необходимости разбирать их по одному вручную.

Архитектура спроектирована для интеграции с API Anthropic (или аналогичными) и поддерживает последующий диалог, чтобы пользователи могли продолжать задавать вопросы после первоначальной сводки.

**Связанные PR:** [#2108](https://github.com/hyperdxio/hyperdx/pull/2108) feat: AI summarize с поддержкой расширяемых объектов, контекста трейса и усиленной безопасности, [#2100](https://github.com/hyperdxio/hyperdx/pull/2100) Реализованы реальные callback&#39;и AI summarize с интеллектуальным режимом тона

## Тепловая карта Event deltas в конструкторе диаграмм \{#event-deltas-heatmap-into-chart-builder\}

*Демонстрация от [@alex-fedotyev](https://github.com/alex-fedotyev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BLVhIQjocwE" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Визуализация тепловой карты Event deltas переносится в основной конструктор диаграмм, благодаря чему она станет доступна как стандартный тип диаграммы наряду с другими визуализациями HyperDX. Ранее она была доступна только в отдельном представлении; теперь она работает в обозревателе диаграмм вместе с остальными типами диаграмм.

После завершения этой работы пользователи смогут добавлять тепловую карту Event deltas прямо в плитки дашборда, где будут доступны те же фильтры по полям и элементы управления временным диапазоном, что и у других диаграмм. Работа всё ещё продолжается.

**Связанные PR:** [#2107](https://github.com/hyperdxio/hyperdx/pull/2107) feat: Интеграция heatmap-диаграммы в редактор дашборда и рендеринг плиток, [#2102](https://github.com/hyperdxio/hyperdx/pull/2102) Реализация переиспользуемой heatmap-диаграммы с поддержкой Event deltas

## Бенчмаркинг улучшений schema \{#benchmarking-for-schema-improvements\}

*Демо от [@knudtty](https://github.com/knudtty)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/_B7TmIiXZyM" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Аарон разбирает результаты бенчмаркинга обновлённой schema логов OpenTelemetry по умолчанию в HyperDX. Ключевое изменение — отказ от устаревшего столбца `timestamp_time` (32-битной Unix-метки времени с точностью до секунд) в пользу использования только `timestamp`, который обеспечивает наносекундную точность и убирает один столбец из schema. В рамках широкого набора бенчмарков запросов обновлённая schema почти во всех случаях показывает такую же или более высокую производительность, чем старая.

Итоговая schema также включает оптимизации порядка чтения, которые дают заметный прирост на селективных запросах. Поиск относительно редкого значения в map выполнялся примерно в два раза быстрее по сравнению с базовым вариантом, а поиск часто встречающихся значений дал ещё больший прирост. Накладные расходы при вставке немного выше (нужно поддерживать больше столбцов), но производительность запросов в целом не уступает прежней или улучшается, что делает это обновление простым и оправданным.

**Связанные PR:** [#2125](https://github.com/hyperdxio/hyperdx/pull/2125) feat: optimized default otel-logs schema

## Улучшения в автодополнении \{#improvements-to-autocomplete\}

*Демо от [@knudtty](https://github.com/knudtty)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/8zDZx49uYQo" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Автодополнение в HyperDX получает серьёзное обновление: оно сможет работать с гораздо более высокой кардинальностью и быстрее загружать значения. Новая реализация использует rollup-таблицы (`AggregatingMergeTrees`, которые предварительно агрегируют пары «ключ-значение» в 15-минутных временных бакетах), поэтому вместо выполнения запросов к сырым данным при каждом нажатии клавиши система читает гораздо меньший, заранее вычисленный набор данных. В ходе демонстрации на staging-инстансе с 230 миллионами строк автодополнение быстро загружало значения для полей с высокой кардинальностью, таких как `hostname`, без заметной задержки.

Система поддерживает как rollup только по ключам (возвращает все ключи, но без связанных значений, что снижает накладные расходы при высокой кардинальности), так и полный rollup «ключ-значение». Если доступен только rollup по ключам, система для этапа поиска значений возвращается к существующей стратегии `fetch-values`. Если rollup-таблица вообще не обнаружена, система корректно переключается на текущее поведение. Aaron также отмечает, что полезным дополнением в будущем был бы allow-list UI для управления тем, для каких ключей создавать value rollup, особенно для клиентов с данными очень высокой кардинальности.

**Связанные PR:** [#2128](https://github.com/hyperdxio/hyperdx/pull/2128) feat: fast and full autocomplete, [#2127](https://github.com/hyperdxio/hyperdx/pull/2127) feat: better autocomplete

## Улучшения в оповещениях для сырого SQL \{#improvements-to-alerting-with-sql\}

*Демо от [@pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BOk-LC0y2no" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

В развитие добавленной на прошлой неделе поддержки оповещений для линейных и столбчатых диаграмм на основе сырого SQL, HyperDX теперь также поддерживает оповещения для числовых диаграмм на основе сырого SQL. Параметр фильтра по времени больше не обязателен при настройке оповещения: если его не указать, отображается предупреждение, но запросы вообще без временного измерения теперь полностью допустимы. Это упрощает создание оповещений по значениям конфигурации или системным метрикам, которые не меняются со временем, например для проверки того, что количество узлов в кластере ClickHouse соответствует ожидаемому значению.

Также добавлено несколько новых типов порогов: не равно, больше, не более, между и вне диапазона. Это даёт командам гораздо больше гибкости при задании условий оповещений, не ограничиваясь простыми сравнениями «больше чем». Наконец, история оповещений теперь отображается прямо в редакторе плитки, поэтому, когда сработавшее оповещение ведёт к определённой плитке дашборда, пользователи могут просмотреть полную историю, понять, что именно его вызвало, а также квитировать или заглушить оповещение, не покидая дашборд.

**Связанные PR:** [#2073](https://github.com/hyperdxio/hyperdx/pull/2073) feat: Реализовать оповещения для плиток дашборда на основе сырого SQL, [#2114](https://github.com/hyperdxio/hyperdx/pull/2114) feat: Добавить поддержку оповещений для числовых диаграмм на основе сырого SQL, [#2122](https://github.com/hyperdxio/hyperdx/pull/2122) feat: Добавить дополнительные типы порогов оповещений, [#2130](https://github.com/hyperdxio/hyperdx/pull/2130) feat: Добавить пороги оповещений between и not-between, [#2123](https://github.com/hyperdxio/hyperdx/pull/2123) feat: Добавить историю оповещений и квитирование в редактор оповещений

## Ошибки при выполнении оповещений \{#errors-during-alert-execution\}

*Демонстрация от [@pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/b3G8kFiQiUg" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Если при выполнении оповещения возникает ошибка, HyperDX теперь показывает её прямо в интерфейсе, а не молча скрывает. Раньше пользователи могли замечать пропуски в истории оповещений без каких-либо объяснений: ни сообщения об ошибке, ни возможности отладить, что именно пошло не так. Теперь для разных типов сбоев рядом отображаются отдельные значки ошибок, в том числе для некорректных запросов, ошибок доставки webhook, а также отсутствующих или неправильно настроенных параметров webhook.

При нажатии на значок ошибки отображаются конкретные сведения, необходимые для диагностики и устранения проблемы, поэтому пользователи могут исправлять неверно настроенные оповещения без изучения журналов сервера и без обращения в поддержку. Цель в том, чтобы сбои оповещений можно было устранять в режиме самообслуживания: увидеть ошибку, понять её, исправить.

**Связанные PR:** [#2132](https://github.com/hyperdxio/hyperdx/pull/2132) feat: Показывать ошибки выполнения оповещений в UI, [#2136](https://github.com/hyperdxio/hyperdx/pull/2136) fix: Скрывать потенциально чувствительные ошибки оповещений