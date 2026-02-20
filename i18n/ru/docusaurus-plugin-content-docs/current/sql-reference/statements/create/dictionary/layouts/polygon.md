---
slug: /sql-reference/statements/create/dictionary/layouts/polygon
title: "Полигональные словари"
sidebar_label: "Polygon"
sidebar_position: 12
description: "Настройка полигональных словарей для поиска точек внутри полигонов."
doc_type: "reference"
---

import CloudDetails from "@site/i18n/ru/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

Словарь `polygon` (`POLYGON`) оптимизирован для запросов на определение принадлежности точки полигону — по сути, для операций «обратного геокодирования».
По заданной координате (широта/долгота) он эффективно определяет, какой полигон или регион (из набора множества полигонов, например границ стран или регионов) содержит данную точку.
Он хорошо подходит для привязки координат местоположения к соответствующему региону.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="Словари многоугольников в ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Пример настройки полигонального словаря:

<CloudDetails />

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    CREATE DICTIONARY polygon_dict_name (
        key Array(Array(Array(Array(Float64)))),
        name String,
        value UInt64
    )
    PRIMARY KEY key
    LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
    ...
    ```
  </TabItem>

  <TabItem value="xml" label="Файл конфигурации">
    ```xml
    <dictionary>
        <structure>
            <key>
                <attribute>
                    <name>key</name>
                    <type>Array(Array(Array(Array(Float64))))</type>
                </attribute>
            </key>

            <attribute>
                <name>name</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>

            <attribute>
                <name>value</name>
                <type>UInt64</type>
                <null_value>0</null_value>
            </attribute>
        </structure>

        <layout>
            <polygon>
                <store_polygon_key_column>1</store_polygon_key_column>
            </polygon>
        </layout>

        ...
    </dictionary>
    ```
  </TabItem>
</Tabs>

<br />

При настройке полигонального словаря ключ должен быть одного из двух типов:

* Простой многоугольник. Он представлен в виде массива точек.
* MultiPolygon. Это массив многоугольников. Каждый многоугольник — это двумерный массив точек. Первый элемент этого массива — внешняя граница многоугольника, а последующие элементы задают области, которые должны быть из него исключены.

Точки могут быть заданы в виде массива или кортежа их координат. В текущей реализации поддерживаются только двумерные точки.

Пользователь может загружать собственные данные во всех форматах, поддерживаемых ClickHouse.

Доступны 3 типа [хранилища в памяти](./#storing-dictionaries-in-memory):

| Схема                | Описание                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POLYGON_SIMPLE`     | Наивная реализация. Для каждого запроса выполняется линейный проход по всем полигонам с проверкой принадлежности без использования дополнительных индексов.                                                                                                                                                                                                                              |
| `POLYGON_INDEX_EACH` | Для каждого полигона строится отдельный индекс, что в большинстве случаев позволяет быстро проверять принадлежность (оптимизировано для географических регионов). На область накладывается сетка, рекурсивно делящая ячейки на 16 равных частей. Деление прекращается, когда глубина рекурсии достигает `MAX_DEPTH` или ячейка пересекается не более чем `MIN_INTERSECTIONS` полигонами. |
| `POLYGON_INDEX_CELL` | Также создаёт описанную выше сетку с теми же параметрами. Для каждой конечной ячейки строится индекс по всем фрагментам полигонов, попадающим в неё, что обеспечивает быстрые ответы на запросы.                                                                                                                                                                                         |
| `POLYGON`            | Синоним `POLYGON_INDEX_CELL`.                                                                                                                                                                                                                                                                                                                                                            |

Запросы к словарю выполняются с использованием стандартных [функций](../../../functions/ext-dict-functions.md) для работы со словарями.
Важное отличие состоит в том, что здесь ключами являются точки, для которых необходимо найти содержащий их полигон.

**Пример**

Пример работы со словарём, определённым выше:

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

В результате выполнения последней команды для каждой точки в таблице &#39;points&#39; будет найден полигон минимальной площади, содержащий данную точку, и выведены запрошенные атрибуты.

**Пример**

Вы можете читать столбцы из полигональных словарей с помощью запроса SELECT — для этого включите `store_polygon_key_column = 1` в конфигурации словаря или в соответствующем DDL-запросе.

```sql title="Query"
CREATE TABLE polygons_test_table
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
) ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO polygons_test_table VALUES ([[[(3, 1), (0, 1), (0, -1), (3, -1)]]], 'Value');

CREATE DICTIONARY polygons_test_dictionary
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
)
PRIMARY KEY key
SOURCE(CLICKHOUSE(TABLE 'polygons_test_table'))
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
LIFETIME(0);

SELECT * FROM polygons_test_dictionary;
```

```text title="Response"
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```
