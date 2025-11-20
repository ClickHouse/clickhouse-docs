---
slug: /use-cases/observability/clickstack/migration/elastic/search
title: 'Поиск в ClickStack и Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Поиск'
sidebar_position: 3
description: 'Поиск в ClickStack и Elastic'
doc_type: 'guide'
keywords: ['clickstack', 'search', 'logs', 'observability', 'full-text search']
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';


## Поиск в ClickStack и Elastic {#search-in-clickstack-and-elastic}

ClickHouse — это движок с нативной поддержкой SQL, спроектированный с нуля для высокопроизводительных аналитических нагрузок. В отличие от него, Elasticsearch предоставляет SQL-подобный интерфейс, транспилирующий SQL в базовый язык запросов Elasticsearch DSL — это означает, что SQL не является полноценным решением, и [функциональное соответствие](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations) ограничено.

ClickHouse не только поддерживает полноценный SQL, но и расширяет его набором функций, ориентированных на наблюдаемость, таких как [`argMax`](/sql-reference/aggregate-functions/reference/argmax), [`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) и [`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming), которые упрощают запросы к структурированным логам, метрикам и трассировкам.

Для простого исследования логов и трассировок HyperDX предоставляет [синтаксис в стиле Lucene](/use-cases/observability/clickstack/search) для интуитивной текстовой фильтрации по полям и значениям, диапазонам, подстановочным символам и многому другому. Это сопоставимо с [синтаксисом Lucene](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) в Elasticsearch и элементами [языка запросов Kibana](https://www.elastic.co/docs/reference/query-languages/kql).

<Image img={hyperdx_search} alt='Поиск' size='lg' />

Интерфейс поиска HyperDX поддерживает этот знакомый синтаксис, но за кулисами преобразует его в эффективные SQL-конструкции `WHERE`, делая работу привычной для пользователей Kibana и одновременно позволяя использовать всю мощь SQL при необходимости. Это дает пользователям возможность задействовать полный спектр [функций поиска по строкам](/sql-reference/functions/string-search-functions), [функций подобия](/sql-reference/functions/string-functions#stringJaccardIndex) и [функций работы с датой и временем](/sql-reference/functions/date-time-functions) в ClickHouse.

<Image img={hyperdx_sql} alt='SQL' size='lg' />

Ниже мы сравниваем языки запросов Lucene в ClickStack и Elasticsearch.


## Синтаксис поиска ClickStack в сравнении со строкой запроса Elasticsearch {#hyperdx-vs-elasticsearch-query-string}

HyperDX и Elasticsearch предоставляют гибкие языки запросов для интуитивной фильтрации логов и трассировок. В то время как строка запроса Elasticsearch тесно интегрирована с его DSL и движком индексирования, HyperDX поддерживает синтаксис, вдохновлённый Lucene, который преобразуется в ClickHouse SQL. В таблице ниже описано поведение распространённых шаблонов поиска в обеих системах, подчёркивая сходства в синтаксисе и различия в выполнении на уровне бэкенда.

| **Функция**                     | **Синтаксис HyperDX**                  | **Синтаксис Elasticsearch**          | **Комментарии**                                                                                                                                                                                                                                                                                                                              |
| ------------------------------- | ----------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Поиск по свободному тексту                | `error`                             | `error`                           | Поиск по всем индексированным полям; в ClickStack преобразуется в многопольный SQL `ILIKE`.                                                                                                                                                                                                                                          |
| Совпадение по полю                     | `level:error`                       | `level:error`                     | Идентичный синтаксис. HyperDX сопоставляет точные значения полей в ClickHouse.                                                                                                                                                                                                                                                                       |
| Поиск по фразе                   | `"disk full"`                       | `"disk full"`                     | Текст в кавычках соответствует точной последовательности; ClickHouse использует равенство строк или `ILIKE`.                                                                                                                                                                                                                                                        |
| Совпадение фразы в поле              | `message:"disk full"`               | `message:"disk full"`             | Преобразуется в SQL `ILIKE` или точное совпадение.                                                                                                                                                                                                                                                                                                 |
| Условия OR                   | `error OR warning`                  | `error OR warning`                | Логическое ИЛИ терминов; обе системы поддерживают это изначально.                                                                                                                                                                                                                                                                                  |
| Условия AND                  | `error AND db`                      | `error AND db`                    | Обе преобразуются в пересечение; нет различий в пользовательском синтаксисе.                                                                                                                                                                                                                                                                             |
| Отрицание                        | `NOT error` или `-error`             | `NOT error` или `-error`           | Поддерживается идентично; HyperDX преобразует в SQL `NOT ILIKE`.                                                                                                                                                                                                                                                                               |
| Группировка                        | `(error OR fail) AND db`            | `(error OR fail) AND db`          | Стандартная булева группировка в обеих системах.                                                                                                                                                                                                                                                                                                        |
| Подстановочные символы                       | `error*` или `*fail*`                | `error*`, `*fail*`                | HyperDX поддерживает начальные и конечные подстановочные символы; ES отключает начальные подстановочные символы по умолчанию для производительности. Подстановочные символы внутри терминов не поддерживаются, например `f*ail.` Подстановочные символы должны применяться с совпадением по полю.                                                                                                                                    |
| Диапазоны (числовые/даты)           | `duration:[100 TO 200]`             | `duration:[100 TO 200]`           | HyperDX использует SQL `BETWEEN`; Elasticsearch расширяет до запросов диапазона. Неограниченные `*` в диапазонах не поддерживаются, например `duration:[100 TO *]`. При необходимости используйте `Неограниченные диапазоны` ниже.                                                                                                                                                         |
| Неограниченные диапазоны (числовые/даты) | `duration:>10` или `duration:>=10`   | `duration:>10` или `duration:>=10` | HyperDX использует стандартные операторы SQL                                                                                                                                                                                                                                                                                                       |
| Включительно/исключительно             | `duration:{100 TO 200}` (исключительно) | То же                              | Фигурные скобки обозначают исключительные границы. `*` в диапазонах не поддерживается, например `duration:[100 TO *]`                                                                                                                                                                                                                                       |
| Проверка существования                    | Н/Д                                 | `_exists_:user` или `field:*`      | `_exists_` не поддерживается. Используйте `LogAttributes.log.file.path: *` для столбцов `Map`, например `LogAttributes`. Для корневых столбцов они должны существовать и будут иметь значение по умолчанию, если не включены в событие. Для поиска значений по умолчанию или отсутствующих столбцов используйте тот же синтаксис, что и в Elasticsearch: ` ServiceName:*` или `ServiceName != ''`. |
| Регулярные выражения                           | функция `match`                    | `name:/joh?n(ath[oa]n)/`          | В настоящее время не поддерживается в синтаксисе Lucene. Пользователи могут использовать SQL и функцию [`match`](/sql-reference/functions/string-search-functions#match) или другие [функции поиска по строкам](/sql-reference/functions/string-search-functions).                                                                                                      |
| Нечёткое совпадение                     | `editDistance('quikc', field) = 1`  | `quikc~`                          | В настоящее время не поддерживается в синтаксисе Lucene. Функции расстояния могут использоваться в SQL, например `editDistance('rror', SeverityText) = 1` или [другие функции подобия](/sql-reference/functions/string-functions#jaroSimilarity).                                                                                                                  |
| Поиск по близости                | Не поддерживается                       | `"fox quick"~5`                   | В настоящее время не поддерживается в синтаксисе Lucene.                                                                                                                                                                                                                                                                                                 |
| Повышение релевантности                        | `quick^2 fox`                       | `quick^2 fox`                     | В настоящее время не поддерживается в HyperDX.                                                                                                                                                                                                                                                                                                      |
| Подстановочный символ в поле                  | `service.*:error`                   | `service.*:error`                 | В настоящее время не поддерживается в HyperDX.                                                                                                                                                                                                                                                                                                      |
| Экранирование специальных символов           | Экранирование зарезервированных символов с помощью `\` | То же                              | Экранирование требуется для зарезервированных символов.                                                                                                                                                                                                                                                                                                   |


## Различия в обработке существующих и отсутствующих значений {#empty-value-differences}

В отличие от Elasticsearch, где поле может быть полностью опущено в событии и, следовательно, действительно «не существовать», в ClickHouse все столбцы в схеме таблицы должны существовать. Если поле не предоставлено в событии вставки:

- Для полей [`Nullable`](/sql-reference/data-types/nullable) оно будет установлено в `NULL`.
- Для полей, не допускающих NULL (по умолчанию), оно будет заполнено значением по умолчанию (часто пустой строкой, 0 или эквивалентным значением).

В ClickStack мы используем последний вариант, поскольку [`Nullable`](/sql-reference/data-types/nullable) [не рекомендуется](/optimize/avoid-nullable-columns).

Такое поведение означает, что проверка «существования» поля в понимании Elasticsearch напрямую не поддерживается.

Вместо этого пользователи могут использовать `field:*` или `field != ''` для проверки наличия непустого значения. Таким образом, невозможно различить действительно отсутствующие и явно пустые поля.

На практике это различие редко вызывает проблемы в сценариях наблюдаемости, но важно помнить об этом при переносе запросов между системами.
