---
'slug': '/use-cases/observability/clickstack/migration/elastic/search'
'title': 'Поиск в ClickStack и Elastic'
'pagination_prev': null
'pagination_next': null
'sidebar_label': 'Поиск'
'sidebar_position': 3
'description': 'Поиск в ClickStack и Elastic'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';

## Поиск в ClickStack и Elastic {#search-in-clickstack-and-elastic}

ClickHouse — это SQL-ориентированный движок, разработанный с нуля для высокопроизводительных аналитических нагрузок. В отличие от этого, Elasticsearch предоставляет SQL-подобный интерфейс, транспилируя SQL в основной язык запросов Elasticsearch DSL — это означает, что он не является первым классом, и [сравнение возможностей](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations) ограничено.

ClickHouse не только поддерживает полный SQL, но и расширяет его рядом функций, ориентированных на мониторинг, таких как [`argMax`](/sql-reference/aggregate-functions/reference/argmax), [`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) и [`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming), которые упрощают запросы к структурированным логам, метрикам и трассам.

Для простой работы с логами и трассами HyperDX предоставляет [синтаксис в стиле Lucene](/use-cases/observability/clickstack/search) для интуитивного текстового фильтрации запросов на основе поля-значения, диапазонов, подстановочных знаков и многого другого. Это сопоставимо с [синтаксисом Lucene](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) в Elasticsearch и элементами [языка запросов Kibana](https://www.elastic.co/docs/reference/query-languages/kql).

<Image img={hyperdx_search} alt="Поиск" size="lg"/>

Интерфейс поиска HyperDX поддерживает этот знакомый синтаксис, но переводит его за кулисами в эффективные SQL-операторы `WHERE`, создавая знакомый опыт для пользователей Kibana, в то время как все еще позволяя пользователям использовать мощность SQL при необходимости. Это позволяет пользователям использовать весь спектр [функций поиска строк](/sql-reference/functions/string-search-functions), [функций схожести](/sql-reference/functions/string-functions#stringjaccardindex) и [функций работы с датами](/sql-reference/functions/date-time-functions) в ClickHouse.

<Image img={hyperdx_sql} alt="SQL" size="lg"/>

Ниже мы сравниваем языки запросов Lucene в ClickStack и Elasticsearch.

## Синтаксис поиска ClickStack против строки запроса Elasticsearch {#hyperdx-vs-elasticsearch-query-string}

Как HyperDX, так и Elasticsearch предоставляют гибкие языки запросов для интуитивной фильтрации логов и трасс. В то время как строка запроса Elasticsearch тесно интегрирована с его DSL и движком индексации, HyperDX поддерживает синтаксис, вдохновленный Lucene, который транслируется в SQL ClickHouse под капотом. В таблице ниже описано, как общие шаблоны поиска ведут себя в обеих системах, подчеркивая сходства в синтаксисе и различия в выполнении на бэкенде.

| **Особенность**        | **Синтаксис HyperDX**                 | **Синтаксис Elasticsearch**            | **Комментарии** |
|------------------------|----------------------------------------|----------------------------------------|-----------------|
| Поиск по свободному тексту | `error`                             | `error`                             | Совпадения во всех индексированных полях; в ClickStack это переписывается в многоцелевой SQL `ILIKE`. |
| Совпадение по полю     | `level:error`                          | `level:error`                          | Идентичный синтаксис. HyperDX соответствует точным значениям полей в ClickHouse. |
| Поиск по фразе        | `"disk full"`                          | `"disk full"`                          | Текст в кавычках соответствует точной последовательности; ClickHouse использует равенство строк или `ILIKE`. |
| Совпадение по фразе поля | `message:"disk full"`                | `message:"disk full"`                  | Переводится в SQL `ILIKE` или точное совпадение. |
| Условия OR             | `error OR warning`                     | `error OR warning`                     | Логическое ИЛИ для терминов; обе системы поддерживают это на родном уровне. |
| Условия AND            | `error AND db`                         | `error AND db`                         | Оба переводятся в пересечение; нет различий в синтаксисе для пользователя. |
| Отрицание              | `NOT error` или `-error`              | `NOT error` или `-error`              | Поддерживается идентично; HyperDX переводит в SQL `NOT ILIKE`. |
| Группировка            | `(error OR fail) AND db`              | `(error OR fail) AND db`              | Стандартная булева группировка в обеих системах. |
| Подстановочные знаки    | `error*` или `*fail*`                 | `error*`, `*fail*`                     | HyperDX поддерживает подстановочные знаки в начале/конце; ES по умолчанию отключает ведущие подстановочные знаки для производительности. Подстановочные знаки внутри терминов не поддерживаются, например `f*ail.` Подстановочные знаки должны применяться с совпадением по полю. |
| Диапазоны (числовые/датовые) | `duration:[100 TO 200]`          | `duration:[100 TO 200]`               | HyperDX использует SQL `BETWEEN`; Elasticsearch расширяет до диапазонных запросов. Непредельные `*` в диапазонах не поддерживаются, например `duration:[100 TO *]`. Если необходимо, используйте `Непредельные диапазоны` ниже. |
| Непредельные диапазоны (числовые/датовые) | `duration:>10` или `duration:>=10` | `duration:>10` или `duration:>=10` | HyperDX использует стандартные SQL-операторы |
| Включительно/исключительно | `duration:{100 TO 200}` (исключительно) | То же самое                          | Фигурные скобки обозначают исключительные границы. `*` в диапазонах не поддерживаются. например `duration:[100 TO *]` |
| Проверка на существование | N/A                                  | `_exists_:user` или `field:*`         | `_exists_` не поддерживается. Используйте `LogAttributes.log.file.path: *` для колонок `Map`, например `LogAttributes`. Для корневых колонок они должны существовать и будут иметь значение по умолчанию, если не включены в событие. Для поиска значений по умолчанию или отсутствующих колонок используйте тот же синтаксис, что и в Elasticsearch `ServiceName:*` или `ServiceName != ''`. |
| Regex                   | `match` функция                        | `name:/joh?n(ath[oa]n)/`               | В настоящее время не поддерживается в синтаксисе Lucene. Пользователи могут использовать SQL и [`match`](/sql-reference/functions/string-search-functions#match) функцию или другие [функции поиска строк](/sql-reference/functions/string-search-functions). |
| Нечеткое совпадение    | `editDistance('quikc', field) = 1`    | `quikc~`                               | В настоящее время не поддерживается в синтаксисе Lucene. Функции расстояния могут использоваться в SQL, например `editDistance('rror', SeverityText) = 1` или [другие функции схожести](/sql-reference/functions/string-functions#jarosimilarity). |
| Поиск по близости      | Не поддерживается                      | `"fox quick"~5`                        | В настоящее время не поддерживается в синтаксе Lucene. |
| Увеличение             | `quick^2 fox`                         | `quick^2 fox`                          | В настоящее время не поддерживается в HyperDX. |
| Подстановочный знак поля | `service.*:error`                    | `service.*:error`                      | В настоящее время не поддерживается в HyperDX. |
| Экранированные специальные символы | Экранировать резервированные символы с помощью `\` | То же самое                          | Экранирование требуется для зарезервированных символов. |

## Различия в существовании/отсутствии {#empty-value-differences}

В отличие от Elasticsearch, где поле может быть полностью исключено из события и, следовательно, действительно "не существует", ClickHouse требует, чтобы все колонки в схеме таблицы существовали. Если поле не предоставлено в событии вставки:

- Для [`Nullable`](/sql-reference/data-types/nullable) полей оно будет установлено в `NULL`.
- Для непустых полей (по умолчанию) будет заполнено значением по умолчанию (обычно пустой строкой, 0 или эквивалентным).

В ClickStack мы используем последнее, поскольку [`Nullable`](/sql-reference/data-types/nullable) [не рекомендуется](/optimize/avoid-nullable-columns).

Это поведение означает, что проверка существования поля в смысле Elasticsearch напрямую не поддерживается.

Вместо этого пользователи могут использовать `field:*` или `field != ''` для проверки наличия непустого значения. Таким образом, невозможно различить действительно отсутствующие и явно пустые поля.

На практике эта разница редко вызывает проблемы для случаев мониторинга, но важно помнить об этом при переводе запросов между системами.
