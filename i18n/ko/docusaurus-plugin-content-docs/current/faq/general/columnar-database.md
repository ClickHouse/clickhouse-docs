---
'slug': '/faq/general/columnar-database'
'title': '컬럼형 데이터베이스란 무엇입니까?'
'toc_hidden': true
'toc_priority': 101
'description': '이 페이지는 컬럼형 데이터베이스가 무엇인지 설명합니다.'
'keywords':
- 'columnar database'
- 'column-oriented database'
- 'OLAP database'
- 'analytical database'
- 'data warehousing'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# 무엇이 컬럼형 데이터베이스인가? {#what-is-a-columnar-database}

컬럼형 데이터베이스는 각 컬럼의 데이터를 독립적으로 저장합니다. 이로 인해 주어진 쿼리에서 사용되는 컬럼에 대해서만 디스크에서 데이터를 읽을 수 있습니다. 대가로 전체 행에 영향을 미치는 작업은 비례적으로 더 비쌉니다. 컬럼형 데이터베이스의 동의어는 컬럼 지향 데이터베이스 관리 시스템입니다. ClickHouse는 이러한 시스템의 전형적인 예입니다.

컬럼형 데이터베이스의 주요 장점은 다음과 같습니다:

- 많은 컬럼 중 몇 개만 사용하는 쿼리.
- 대량의 데이터에 대한 집계 쿼리.
- 컬럼별 데이터 압축.

다음은 보고서를 작성할 때 전통적인 행 지향 시스템과 컬럼형 데이터베이스 간의 차이를 보여주는 일러스트입니다:

**전통적인 행 지향**
<Image img={RowOriented} alt="전통적인 행 지향 데이터베이스" size="md" border />

**컬럼형**
<Image img={ColumnOriented} alt="컬럼형 데이터베이스" size="md" border />

컬럼형 데이터베이스는 분석 애플리케이션을 위해 선호되는 선택입니다. 왜냐하면 여러 컬럼을 테이블에 미리 두더라도 읽기 쿼리 실행 시간에 사용되지 않는 컬럼의 비용을 지불하지 않도록 할 수 있기 때문입니다(전통적인 OLTP 데이터베이스는 데이터가 행에 저장되기 때문에 쿼리 중 모든 데이터를 읽습니다). 컬럼 지향 데이터베이스는 빅 데이터 처리 및 데이터 웨어하우징을 위해 설계되었으며, 일반적으로 저비용 하드웨어의 분산 클러스터를 사용하여 기본적으로 확장하여 처리량을 늘립니다. ClickHouse는 [분산](../../engines/table-engines/special/distributed.md) 테이블과 [복제된](../../engines/table-engines/mergetree-family/replication.md) 테이블의 조합으로 이를 수행합니다.

컬럼 데이터베이스의 역사, 행 지향 데이터베이스와의 차이점, 컬럼 데이터베이스의 사용 사례에 대해 자세히 알고 싶다면 [컬럼 데이터베이스 가이드](https://clickhouse.com/engineering-resources/what-is-columnar-database)를 참조하세요.
