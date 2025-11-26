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

ClickHouse — это SQL-нативный движок, изначально спроектированный для высокопроизводительных аналитических нагрузок. В отличие от него, Elasticsearch предоставляет SQL-подобный интерфейс, транслируя SQL в базовый Elasticsearch query DSL — то есть SQL не является полноценным «первоклассным» языком, и [функциональное соответствие](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations) ограничено. 

ClickHouse не только полностью поддерживает SQL, но и расширяет его набором функций, ориентированных на наблюдаемость, таких как [`argMax`](/sql-reference/aggregate-functions/reference/argmax), [`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) и [`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming), упрощающих запросы к структурированным логам, метрикам и трейсам.

Для простого исследования логов и трейсов HyperDX предоставляет [синтаксис в стиле Lucene](/use-cases/observability/clickstack/search) для интуитивной текстовой фильтрации по запросам вида поле–значение, диапазонам, подстановочным символам и многому другому. Это сопоставимо с [синтаксисом Lucene](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) в Elasticsearch и элементами [Kibana Query Language](https://www.elastic.co/docs/reference/query-languages/kql).

<Image img={hyperdx_search} alt="Search" size="lg"/>

Интерфейс поиска HyperDX поддерживает этот привычный синтаксис, но под капотом транслирует его в эффективные SQL-выражения `WHERE`, делая работу знакомой для пользователей Kibana и при этом позволяя при необходимости использовать всю мощь SQL. Это дает возможность использовать полный набор [функций строкового поиска](/sql-reference/functions/string-search-functions), [функций сходства](/sql-reference/functions/string-functions#stringJaccardIndex) и [функций работы с датой и временем](/sql-reference/functions/date-time-functions) в ClickHouse.

<Image img={hyperdx_sql} alt="SQL" size="lg"/>

Ниже мы сравниваем языки запросов Lucene в ClickStack и Elasticsearch.



## Синтаксис поиска в ClickStack и строка запроса Elasticsearch {#hyperdx-vs-elasticsearch-query-string}

И HyperDX, и Elasticsearch предоставляют гибкие языки запросов для интуитивной фильтрации логов и трассировок. В то время как строка запроса Elasticsearch тесно интегрирована с его DSL и движком индексации, HyperDX поддерживает синтаксис, вдохновлённый Lucene, который под капотом транслируется в ClickHouse SQL. В таблице ниже показано, как распространённые шаблоны поиска ведут себя в обеих системах, с указанием сходства синтаксиса и различий в выполнении на стороне бэкенда.

| **Feature** | **HyperDX Syntax** | **Elasticsearch Syntax** | **Comments** |
|-------------------------|----------------------------------------|----------------------------------------|--------------|
| Free text search        | `error` | `error` | Совпадения по всем индексированным полям; в ClickStack это переписывается в многополевой SQL‑запрос с `ILIKE`. |
| Field match             | `level:error` | `level:error` | Идентичный синтаксис. HyperDX сопоставляет точные значения полей в ClickHouse. |
| Phrase search           | `"disk full"` | `"disk full"` | Заключённый в кавычки текст соответствует точной последовательности; ClickHouse использует сравнение строк на равенство или `ILIKE`. |
| Field phrase match      | `message:"disk full"` | `message:"disk full"` | Транслируется в SQL `ILIKE` или точное совпадение. |
| OR conditions           | `error OR warning` | `error OR warning` | Логическое OR для терминов; обе системы поддерживают это нативно. |
| AND conditions          | `error AND db` | `error AND db` | Обе транслируются в пересечение; в пользовательском синтаксисе нет отличий. |
| Negation                | `NOT error` or `-error` | `NOT error` or `-error` | Поддерживается одинаково; HyperDX конвертирует в SQL `NOT ILIKE`. |
| Grouping                | `(error OR fail) AND db` | `(error OR fail) AND db` | Стандартная булева группировка в обеих системах. |
| Wildcards               | `error*` or `*fail*` | `error*`, `*fail*` | HyperDX поддерживает подстановочные символы в начале и конце; в ES подстановочные символы в начале терма по умолчанию отключены из‑за производительности. Подстановки внутри термов не поддерживаются, например `f*ail.` Подстановки должны применяться с указанием поля.|
| Ranges (numeric/date)   | `duration:[100 TO 200]` | `duration:[100 TO 200]` | HyperDX использует SQL `BETWEEN`; Elasticsearch разворачивает в range‑запросы. Неограниченный `*` в диапазонах не поддерживается, например `duration:[100 TO *]`. При необходимости используйте `Unbounded ranges` ниже.|
| Unbounded ranges (numeric/date)   | `duration:>10` or `duration:>=10` | `duration:>10` or `duration:>=10` | HyperDX использует стандартные SQL‑операторы.|
| Inclusive/exclusive     | `duration:{100 TO 200}` (exclusive)    | Same                                   | Фигурные скобки обозначают исключающие границы. `*` в диапазонах не поддерживается, например `duration:[100 TO *]`.|
| Exists check            | N/A                       | `_exists_:user` or `field:*` | `_exists_` не поддерживается. Используйте `LogAttributes.log.file.path: *` для столбцов типа `Map`, например `LogAttributes`. Для корневых столбцов требуется их наличие, и они будут иметь значение по умолчанию, если не включены в событие. Для поиска значений по умолчанию или отсутствующих столбцов используйте тот же синтаксис, что и в Elasticsearch: `ServiceName:*` или `ServiceName != ''`. |
| Regex                   |      `match` function          | `name:/joh?n(ath[oa]n)/` | В данный момент не поддерживается в синтаксисе Lucene. Можно использовать SQL и функцию [`match`](/sql-reference/functions/string-search-functions#match) или другие [функции поиска по строкам](/sql-reference/functions/string-search-functions).|
| Fuzzy match             |      `editDistance('quikc', field) = 1` | `quikc~` | В данный момент не поддерживается в синтаксисе Lucene. В SQL можно использовать функции расстояния, например `editDistance('rror', SeverityText) = 1` или [другие функции схожести](/sql-reference/functions/string-functions#jaroSimilarity). |
| Proximity search        | Not supported                       | `"fox quick"~5` | В данный момент не поддерживается в синтаксисе Lucene. |
| Boosting                | `quick^2 fox` | `quick^2 fox` | В данный момент не поддерживается в HyperDX. |
| Field wildcard          | `service.*:error` | `service.*:error` | В данный момент не поддерживается в HyperDX. |
| Escaped special chars   | Escape reserved characters with `\` | Same      | Для зарезервированных символов требуется экранирование. |



## Различия между существующими и отсутствующими значениями {#empty-value-differences}

В отличие от Elasticsearch, где поле может быть полностью опущено в событии и, следовательно, действительно «не существовать», в ClickHouse все столбцы в схеме таблицы должны присутствовать. Если поле не передано при вставке события:

- Для полей [`Nullable`](/sql-reference/data-types/nullable) ему будет присвоено значение `NULL`.
- Для полей, не допускающих значение `NULL` (по умолчанию), оно будет заполнено значением по умолчанию (часто пустой строкой, 0 или эквивалентом).

В ClickStack мы используем второй подход, так как [`Nullable`](/sql-reference/data-types/nullable) [не рекомендуется](/optimize/avoid-nullable-columns).

Такое поведение означает, что проверка того, «существует» ли поле в смысле Elasticsearch, напрямую не поддерживается. 

Вместо этого пользователи могут использовать `field:*` или `field != ''` для проверки наличия непустого значения. Таким образом, невозможно различить действительно отсутствующие и явно пустые поля.

На практике это различие редко вызывает проблемы в сценариях наблюдаемости, но важно иметь его в виду при переносе запросов между системами.
