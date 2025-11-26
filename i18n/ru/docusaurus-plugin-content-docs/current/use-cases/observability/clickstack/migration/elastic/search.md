---
slug: /use-cases/observability/clickstack/migration/elastic/search
title: 'Поиск в ClickStack и Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Поиск'
sidebar_position: 3
description: 'Поиск в ClickStack и Elastic'
doc_type: 'guide'
keywords: ['clickstack', 'поиск', 'логи', 'наблюдаемость', 'полнотекстовый поиск']
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';


## Поиск в ClickStack и Elastic {#search-in-clickstack-and-elastic}

ClickHouse — это нативный SQL-движок, изначально спроектированный для высокопроизводительных аналитических нагрузок. В отличие от него, Elasticsearch предоставляет SQL-подобный интерфейс, который транслирует SQL в базовый Elasticsearch query DSL — то есть SQL не является для него языком первого класса, и [функциональный паритет](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations) ограничен. 

ClickHouse не только полностью поддерживает SQL, но и расширяет его набором функций, ориентированных на наблюдаемость, таких как [`argMax`](/sql-reference/aggregate-functions/reference/argmax), [`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) и [`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming), которые упрощают выполнение запросов к структурированным логам, метрикам и трейсам.

Для простой работы с логами и трейсами HyperDX предоставляет [синтаксис в стиле Lucene](/use-cases/observability/clickstack/search) для интуитивно понятной текстовой фильтрации по запросам вида поле-значение, диапазонам, шаблонам с подстановками (wildcards) и другим условиям. Это сопоставимо с [синтаксисом Lucene](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) в Elasticsearch и элементами [Kibana Query Language](https://www.elastic.co/docs/reference/query-languages/kql).

<Image img={hyperdx_search} alt="Поиск" size="lg"/>

Интерфейс поиска HyperDX поддерживает этот привычный синтаксис, но «за кулисами» транслирует его в эффективные выражения SQL `WHERE`, делая работу привычной для пользователей Kibana и при этом позволяя использовать мощь SQL при необходимости. Это даёт возможность задействовать весь спектр [функций строкового поиска](/sql-reference/functions/string-search-functions), [функций сходства](/sql-reference/functions/string-functions#stringJaccardIndex) и [функций работы с датой и временем](/sql-reference/functions/date-time-functions) в ClickHouse.

<Image img={hyperdx_sql} alt="SQL" size="lg"/>

Ниже мы сравниваем языки запросов в стиле Lucene в ClickStack и Elasticsearch.

## Синтаксис поиска ClickStack vs Elasticsearch query string {#hyperdx-vs-elasticsearch-query-string}

И HyperDX, и Elasticsearch предоставляют гибкие языки запросов для интуитивной фильтрации логов и трассировок. Хотя query string в Elasticsearch тесно интегрирован с его DSL и движком индексирования, HyperDX поддерживает синтаксис, вдохновлённый Lucene, который под капотом транслируется в ClickHouse SQL. В таблице ниже показано, как распространённые шаблоны поиска работают в обеих системах, с акцентом на сходство синтаксиса и различия в выполнении на стороне бэкенда.

| **Feature** | **HyperDX Syntax** | **Elasticsearch Syntax** | **Comments** |
|-------------------------|----------------------------------------|----------------------------------------|--------------|
| Free text search        | `error` | `error` | Совпадения по всем индексированным полям; в ClickStack это переписывается в SQL-запрос по нескольким полям с использованием `ILIKE`. |
| Field match             | `level:error` | `level:error` | Идентичный синтаксис. HyperDX сопоставляет точные значения полей в ClickHouse. |
| Phrase search           | `"disk full"` | `"disk full"` | Заключённый в кавычки текст соответствует точной последовательности; ClickHouse использует сравнение строк на равенство или `ILIKE`. |
| Field phrase match      | `message:"disk full"` | `message:"disk full"` | Транслируется в SQL `ILIKE` или точное совпадение. |
| OR conditions           | `error OR warning` | `error OR warning` | Логическое ИЛИ терминов; обе системы нативно поддерживают это. |
| AND conditions          | `error AND db` | `error AND db` | Обе системы транслируют в пересечение; различий в пользовательском синтаксисе нет. |
| Negation                | `NOT error` or `-error` | `NOT error` or `-error` | Поддерживается одинаково; HyperDX конвертирует в SQL `NOT ILIKE`. |
| Grouping                | `(error OR fail) AND db` | `(error OR fail) AND db` | Стандартная булева группировка в обеих системах. |
| Wildcards               | `error*` or `*fail*` | `error*`, `*fail*` | HyperDX поддерживает начальные и конечные подстановочные символы; в Elasticsearch начальные подстановки по умолчанию отключены из соображений производительности. Подстановки внутри термов не поддерживаются, например `f*ail.` Подстановки должны применяться вместе с указанием поля.|
| Ranges (numeric/date)   | `duration:[100 TO 200]` | `duration:[100 TO 200]` | HyperDX использует SQL `BETWEEN`; Elasticsearch разворачивает в диапазонные запросы. Неограниченные `*` в диапазонах не поддерживаются, например `duration:[100 TO *]`. При необходимости используйте `Unbounded ranges` ниже.|
| Unbounded ranges (numeric/date)   | `duration:>10` or `duration:>=10` | `duration:>10` or `duration:>=10` | HyperDX использует стандартные SQL-операторы. |
| Inclusive/exclusive     | `duration:{100 TO 200}` (exclusive)    | Same                                   | Фигурные скобки обозначают исключающие границы. `*` в диапазонах не поддерживается, например `duration:[100 TO *]`. |
| Exists check            | N/A                       | `_exists_:user` or `field:*` | `_exists_` не поддерживается. Используйте `LogAttributes.log.file.path: *` для столбцов типа `Map`, например `LogAttributes`. Для корневых столбцов требуется их существование, и они будут иметь значение по умолчанию, если не были включены в событие. Для поиска значений по умолчанию или отсутствующих столбцов используйте тот же синтаксис, что и в Elasticsearch: `ServiceName:*` или `ServiceName != ''`. |
| Regex                   |      `match` function          | `name:/joh?n(ath[oa]n)/` | В настоящее время не поддерживается в синтаксисе Lucene. Пользователи могут использовать SQL и функцию [`match`](/sql-reference/functions/string-search-functions#match) или другие [функции поиска по строкам](/sql-reference/functions/string-search-functions).|
| Fuzzy match             |      `editDistance('quikc', field) = 1` | `quikc~` | В настоящее время не поддерживается в синтаксисе Lucene. В SQL можно использовать функции расстояния, например `editDistance('rror', SeverityText) = 1`, или [другие функции сходства](/sql-reference/functions/string-functions#jaroSimilarity). |
| Proximity search        | Not supported                       | `"fox quick"~5` | В настоящее время не поддерживается в синтаксисе Lucene. |
| Boosting                | `quick^2 fox` | `quick^2 fox` | В настоящее время не поддерживается в HyperDX. |
| Field wildcard          | `service.*:error` | `service.*:error` | В настоящее время не поддерживается в HyperDX. |
| Escaped special chars   | Escape reserved characters with `\` | Same      | Для зарезервированных символов требуется экранирование. |

## Отличия между существующими и отсутствующими значениями {#empty-value-differences}

В отличие от Elasticsearch, где поле может быть полностью опущено в событии и, следовательно, действительно «не существовать», в ClickHouse требуется наличие всех столбцов, определённых в схеме таблицы. Если поле не указано в событии при вставке:

- Для полей типа [`Nullable`](/sql-reference/data-types/nullable) ему будет присвоено значение `NULL`.
- Для полей, не допускающих `NULL` (это поведение по умолчанию), оно будет заполнено значением по умолчанию (часто пустой строкой, 0 или эквивалентом).

В ClickStack мы используем второй вариант, так как тип [`Nullable`](/sql-reference/data-types/nullable) [не рекомендуется](/optimize/avoid-nullable-columns).

Такое поведение означает, что проверка, «существует» ли поле в смысле Elasticsearch, напрямую не поддерживается. 

Вместо этого пользователи могут использовать `field:*` или `field != ''` для проверки наличия непустого значения. Таким образом, невозможно различить действительно отсутствующие и явно пустые поля.

На практике это различие редко приводит к проблемам для сценариев наблюдаемости, но его важно учитывать при переносе запросов между системами.