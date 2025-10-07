---
'slug': '/use-cases/observability/clickstack/migration/elastic/types'
'title': 'Отображение типов'
'pagination_prev': null
'pagination_next': null
'sidebar_label': 'Типы'
'sidebar_position': 2
'description': 'Отображение типов в ClickHouse и Elasticsearch'
'show_related_blogs': true
'keywords':
- 'JSON'
- 'Codecs'
'doc_type': 'reference'
---

Elasticsearch и ClickHouse поддерживают широкий спектр типов данных, но их базовые модели хранения и запросов существенно различаются. Этот раздел отображает общепринятые типы полей Elasticsearch на их эквиваленты в ClickHouse, где это возможно, и предоставляет контекст, чтобы помочь в миграции. В случаях, когда эквивалент отсутствует, в комментариях приведены альтернативы или заметки.

| **Тип Elasticsearch**        | **Эквивалент ClickHouse**   | **Комментарии** |
|-------------------------------|------------------------------|--------------|
| `boolean`                     | [`UInt8`](/sql-reference/data-types/int-uint)  или [`Bool`](/sql-reference/data-types/boolean)        | ClickHouse поддерживает `Boolean` как псевдоним для `UInt8` в более новых версиях. |
| `keyword`                     | [`String`](/sql-reference/data-types/string)                    | Используется для фильтрации по точному совпадению, группировки и сортировки. |
| `text`                        | [`String`](/sql-reference/data-types/string)                    | Полнотекстовый поиск ограничен в ClickHouse; токенизация требует пользовательской логики с использованием таких функций, как `tokens`, в сочетании с массивными функциями. |
| `long`                        | [`Int64`](/sql-reference/data-types/int-uint)                     | 64-битное целое со знаком. |
| `integer`                     | [`Int32`](/sql-reference/data-types/int-uint)                      | 32-битное целое со знаком. |
| `short`                       | [`Int16`](/sql-reference/data-types/int-uint)                      | 16-битное целое со знаком. |
| `byte`                        | [`Int8`](/sql-reference/data-types/int-uint)                       | 8-битное целое со знаком. |
| `unsigned_long`              | [`UInt64`](/sql-reference/data-types/int-uint)                    | Беззнаковое 64-битное целое число. |
| `double`                      | [`Float64`](/sql-reference/data-types/float)                   | 64-битное число с плавающей точкой. |
| `float`                       | [`Float32`](/sql-reference/data-types/float)                   | 32-битное число с плавающей точкой. |
| `half_float`                 | [`Float32`](/sql-reference/data-types/float) или [`BFloat16`](/sql-reference/data-types/float)      | Ближайший эквивалент. В ClickHouse нет 16-битного числа с плавающей точкой. В ClickHouse есть `BFloat16` - это отличается от Half-float IEE-754: half-float предлагает более высокую точность с меньшим диапазоном, в то время как bfloat16 жертвует точностью ради более широкого диапазона, что делает его более подходящим для нагрузки машинного обучения. |
| `scaled_float`              | [`Decimal(x, y)`](/sql-reference/data-types/decimal)             | Хранение чисел с фиксированной точкой. |
| `date`                       | [`DateTime`](/sql-reference/data-types/datetime)    | Эквивалентные типы даты с точностью до секунд. |
| `date_nanos`                | [`DateTime64`](/sql-reference/data-types/datetime64)    | ClickHouse поддерживает наносекундную точность с `DateTime64(9)`. |
| `binary`                     | [`String`](/sql-reference/data-types/string), [`FixedString(N)`](/sql-reference/data-types/fixedstring)  | Требуется декодирование base64 для бинарных полей. |
| `ip`                         | [`IPv4`](/sql-reference/data-types/ipv4), [`IPv6`](/sql-reference/data-types/ipv6)    | Доступны нативные типы `IPv4` и `IPv6`. |
| `object`                     | [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Map`](/sql-reference/data-types/map), [`Tuple`](/sql-reference/data-types/tuple), [`JSON`](/sql-reference/data-types/newjson) | ClickHouse может моделировать объекты, подобные JSON, с использованием [`Nested`](/sql-reference/data-types/nested-data-structures/nested) или [`JSON`](/sql-reference/data-types/newjson). |
| `flattened`                  | [`String`](/sql-reference/data-types/string)                      | Развёрнутый тип в Elasticsearch хранит целые JSON-объекты как отдельные поля, обеспечивая гибкий, безсхемный доступ к вложенным ключам без полного отображения. В ClickHouse аналогичная функциональность может быть достигнута с использованием типа String, но требует обработки в материализованных представлениях. |
| `nested`                      | [`Nested`](/sql-reference/data-types/nested-data-structures/nested)                    | Столбцы `Nested` в ClickHouse обеспечивают аналогичную семантику для сгруппированных подполей, при условии что пользователи используют `flatten_nested=0`. |
| `join`                        | NA                           | Нет прямого понятия родительских и дочерних отношений. Не требуется в ClickHouse, так как поддерживаются соединения между таблицами. |
| `alias`                       | [`Alias`](/sql-reference/statements/create/table#alias) модификатор столбца      | Псевдонимы [поддерживаются](/sql-reference/statements/create/table#alias) через модификатор полей. Функции могут применяться к этим псевдонимам, например `size String ALIAS formatReadableSize(size_bytes)` |
| `range` types (`*_range`)     | [`Tuple(start, end)`](/sql-reference/data-types/tuple) или [`Array(T)`](/sql-reference/data-types/array) | В ClickHouse нет нативного типа диапазона, но числовые и временные диапазоны могут быть представлены с помощью структур [`Tuple(start, end)`](/sql-reference/data-types/tuple) или [`Array`](/sql-reference/data-types/array). Для диапазонов IP (`ip_range`) храните значения CIDR как `String` и оценивайте с помощью функций, таких как `isIPAddressInRange()`. Альтернативный вариант - рассмотреть `ip_trie` на основе справочных словарей для эффективной фильтрации. |
| `aggregate_metric_double`     | [`AggregateFunction(...)`](/sql-reference/data-types/aggregatefunction) и [`SimpleAggregateFunction(...)`](/sql-reference/data-types/simpleaggregatefunction)    | Используйте состояния агрегатных функций и материализованные представления для моделирования предварительно агрегированных метрик. Все агрегатные функции поддерживают агрегатные состояния. |
| `histogram`                   | [`Tuple(Array(Float64), Array(UInt64))`](/sql-reference/data-types/tuple) | Вручную представляйте корзины и подсчёты с использованием массивов или пользовательских схем. |
| `annotated-text`              | [`String`](/sql-reference/data-types/string)                    | Нет встроенной поддержки для поиска с учётом сущностей или аннотаций. |
| `completion`, `search_as_you_type` | NA                    | Нет нативного движка автозаполнения или предложений. Может быть воспроизведено с помощью `String` и [функций поиска](/sql-reference/functions/string-search-functions). |
| `semantic_text`               | NA                           | Нет нативного семантического поиска - генерируйте встраивания и используйте векторный поиск. |
| `token_count`                 | [`Int32`](/sql-reference/data-types/int-uint)                    | Используйте во время приёма данных для ручного вычисления количества токенов, например, используя `length(tokens())` с материализованным столбцом. |
| `dense_vector`                | [`Array(Float32)`](/sql-reference/data-types/array)            | Используйте массивы для хранения встраиваний. |
| `sparse_vector`               | [`Map(UInt32, Float32)`](/sql-reference/data-types/map)      | Симулируйте разрежённые векторы с помощью карт. Нет нативной поддержки разрежённых векторов. |
| `rank_feature` / `rank_features` | [`Float32`](/sql-reference/data-types/float), [`Array(Float32)`](/sql-reference/data-types/array) | Нет нативного повышения в момент запроса, но его можно смоделировать вручную в логике оценки. |
| `geo_point`                   | [`Tuple(Float64, Float64)`](/sql-reference/data-types/tuple) или [`Point`](/sql-reference/data-types/geo#point) | Используйте кортеж из (широта, долгота). [`Point`](/sql-reference/data-types/geo#point) доступен как тип ClickHouse. |
| `geo_shape`, `shape`          | [`Ring`](/sql-reference/data-types/geo#ring), [`LineString`](/sql-reference/data-types/geo#linestring), [`MultiLineString`](/sql-reference/data-types/geo#multilinestring), [`Polygon`](/sql-reference/data-types/geo#polygon), [`MultiPolygon`](/sql-reference/data-types/geo#multipolygon)                          | Нативная поддержка геоформ и пространственной индексации. |
| `percolator`                  | NA                           | Нет понятия индексирования запросов. Вместо этого используйте стандартный SQL + Инкрементные материализованные представления. |
| `version`                     | [`String`](/sql-reference/data-types/string)                    | ClickHouse не имеет нативного типа версии. Храните версии как строки и используйте пользовательские функции UDF для выполнения семантических сравнений, если это необходимо. Рассмотрите возможность нормализации до числовых форматов, если требуются диапазонные запросы. |

### Заметки {#notes}

- **Массивы**: В Elasticsearch все поля нативно поддерживают массивы. В ClickHouse массивы должны быть явно определены (например, `Array(String)`), с преимуществом доступа и запроса к конкретным позициям, например `an_array[1]`.
- **Мультиполя**: Elasticsearch позволяет индексировать [одно и то же поле несколькими способами](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/multi-fields#_multi_fields_with_multiple_analyzers) (например, как `text`, так и `keyword`). В ClickHouse этот шаблон должен быть смоделирован с помощью отдельных столбцов или представлений.
- **Типы Map и JSON** - В ClickHouse тип [`Map`](/sql-reference/data-types/map) обычно используется для моделирования динамических структур ключ-значение, таких как `resourceAttributes` и `logAttributes`. Этот тип позволяет гибкий безсхемный прием, позволяя добавлять произвольные ключи во время выполнения — аналогично объектам JSON в Elasticsearch. Однако есть важные ограничения, которые необходимо учитывать:

  - **Единообразные типы значений**: Столбцы ClickHouse [`Map`](/sql-reference/data-types/map) должны иметь единообразный тип значения (например, `Map(String, String)`). Значения смешанного типа не поддерживаются без приведения типов.
  - **Стоимость производительности**: доступ к любому ключу в [`Map`](/sql-reference/data-types/map) требует загрузки всей карты в память, что может быть не оптимально с точки зрения производительности.
  - **Нет подстолбцов**: в отличие от JSON, ключи в [`Map`](/sql-reference/data-types/map) не представляются как истинные подстолбцы, что ограничивает возможности ClickHouse по индексации, сжатию и эффективному запросу.

  Из-за этих ограничений ClickStack переходит от использования [`Map`](/sql-reference/data-types/map) к улучшенному типу [`JSON`](/sql-reference/data-types/newjson) ClickHouse. Тип [`JSON`](/sql-reference/data-types/newjson) устраняет многие недостатки `Map`:

  - **Истинное колонное хранилище**: каждый путь JSON хранится как подстолбец, позволяя эффективное сжатие, фильтрацию и векторизованное выполнение запросов.
  - **Поддержка смешанных типов**: разные типы данных (например, целые числа, строки, массивы) могут сосуществовать под одним и тем же путем без приведения типов или унификации типов.
  - **Масштабируемость файловой системы**: внутренние ограничения на динамические ключи (`max_dynamic_paths`) и типы (`max_dynamic_types`) предотвращают взрыв файлов столбцов на диске, даже при наборах ключей с высокой кардинальностью.
  - **Плотное хранение**: нули и отсутствующие значения хранятся разреженно, чтобы избежать ненужных накладных расходов.

    Тип [`JSON`](/sql-reference/data-types/newjson) особенно хорошо подходит для задач мониторинга, предлагая гибкость безсхемного приема с производительностью и масштабируемостью нативных типов ClickHouse — делая его идеальной заменой для [`Map`](/sql-reference/data-types/map) в полях динамических атрибутов.

    Для получения дополнительной информации о типе JSON мы рекомендуем ознакомиться с [руководством по JSON](https://clickhouse.com/docs/integrations/data-formats/json/overview) и статьёй ["Как мы создали новый мощный тип данных JSON для ClickHouse"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse).
