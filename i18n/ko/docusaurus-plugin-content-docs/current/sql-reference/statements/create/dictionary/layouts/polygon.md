---
slug: /sql-reference/statements/create/dictionary/layouts/polygon
title: "폴리곤 딕셔너리"
sidebar_label: "Polygon"
sidebar_position: 12
description: "포인트-인-폴리곤(point-in-polygon) 조회를 위한 폴리곤 딕셔너리를 구성합니다."
doc_type: "reference"
---

import CloudDetails from "@site/i18n/ko/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

`polygon` (`POLYGON`) 딕셔너리는 포인트-인-폴리곤(point-in-polygon) 쿼리, 즉 &quot;역지오코딩(reverse geocoding)&quot; 조회에 최적화되어 있습니다.
좌표(위도/경도)가 주어지면, 국가 또는 지역 경계와 같은 다수의 폴리곤 집합 중에서 해당 좌표를 포함하는 폴리곤/지역을 효율적으로 찾아냅니다.
위치 좌표를 해당 지역에 매핑하는 데 적합합니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="ClickHouse의 폴리곤 사전(Polygon Dictionaries)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

폴리곤 딕셔너리 구성 예시:

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

  <TabItem value="xml" label="구성 파일">
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

폴리곤 딕셔너리를 구성할 때 키는 다음 두 가지 유형 중 하나이어야 합니다:

* 단순 폴리곤입니다. 점들의 배열로 이루어져 있습니다.
* MultiPolygon. 폴리곤의 배열입니다. 각 폴리곤은 점들의 2차원 배열입니다. 이 배열의 첫 번째 요소는 폴리곤의 외곽 경계를 나타내며, 이후 요소들은 제외할 영역을 지정합니다.

포인트는 좌표의 배열 또는 튜플로 지정할 수 있습니다. 현재 구현에서는 2차원 포인트만 지원됩니다.

사용자는 ClickHouse에서 지원하는 모든 형식으로 자신의 데이터를 업로드할 수 있습니다.

사용 가능한 [인메모리 스토리지](./#storing-dictionaries-in-memory) 유형은 3가지입니다:

| 레이아웃                 | 설명                                                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POLYGON_SIMPLE`     | 단순한 구현입니다. 각 쿼리마다 모든 폴리곤을 순차적으로 한 번씩만 탐색하면서, 별도의 인덱스 없이 포함 여부를 검사합니다.                                                                                                                                     |
| `POLYGON_INDEX_EACH` | 각 폴리곤마다 별도의 인덱스를 구축하여 대부분의 경우 포함 여부를 빠르게 확인할 수 있도록 합니다(지리적 영역에 최적화됨). 영역 위에 그리드를 중첩한 다음, 셀을 16개의 동일한 부분으로 재귀적으로 분할합니다. 재귀 깊이가 `MAX_DEPTH`에 도달하거나 하나의 셀과 교차하는 폴리곤 수가 `MIN_INTERSECTIONS` 이하가 되면 분할을 중단합니다. |
| `POLYGON_INDEX_CELL` | 또한 위에서 설명한 것과 동일한 옵션으로 그리드를 생성합니다. 각 리프 셀에 대해서는, 해당 셀에 속하는 모든 폴리곤 조각에 대해 인덱스를 구축하여 쿼리에 빠르게 응답할 수 있도록 합니다.                                                                                                 |
| `POLYGON`            | `POLYGON_INDEX_CELL`과 동일한 의미입니다.                                                                                                                                                                          |

딕셔너리 쿼리는 딕셔너리 작업을 위한 표준 [함수](../../../functions/ext-dict-functions.md)를 사용하여 수행됩니다.
중요한 차이점은 여기서 키가 해당 점을 포함하는 폴리곤을 찾으려는 좌표 점이 된다는 것입니다.

**예시**

위에서 정의한 딕셔너리를 사용하는 예시:

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

&#39;points&#39; 테이블의 각 점에 대해 마지막 명령을 실행하면, 해당 점을 포함하는 최소 면적 다각형을 찾고 요청된 속성을 출력합니다.

**예시**

딕셔너리 설정 또는 해당 DDL 쿼리에서 `store_polygon_key_column = 1`을 활성화하면 SELECT 쿼리를 통해 폴리곤 딕셔너리의 컬럼을 읽을 수 있습니다.

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
