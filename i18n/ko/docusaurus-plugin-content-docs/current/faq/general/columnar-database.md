---
slug: /faq/general/columnar-database
title: '컬럼형 데이터베이스란 무엇입니까?'
toc_hidden: true
toc_priority: 101
description: '이 페이지에서는 컬럼형 데이터베이스가 무엇인지 설명합니다.'
keywords: ['컬럼형 데이터베이스', '컬럼 지향 데이터베이스', 'OLAP 데이터베이스', '분석용 데이터베이스', '데이터 웨어하우징']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# 컬럼형 데이터베이스란 무엇인가? \{#what-is-a-columnar-database\}

컬럼형 데이터베이스는 각 컬럼의 데이터를 독립적으로 저장합니다. 이를 통해 특정 쿼리에서 사용되는 컬럼의 데이터만 디스크에서 읽을 수 있습니다. 그 대가로, 전체 행에 영향을 미치는 연산의 비용은 그에 비례해 더 커집니다. 컬럼형 데이터베이스는 컬럼 지향 데이터베이스 관리 시스템이라고도 합니다. ClickHouse는 이러한 시스템의 전형적인 예입니다.

컬럼형 데이터베이스의 주요 장점은 다음과 같습니다:

- 많은 컬럼 중 일부 컬럼만 사용하는 쿼리
- 대용량 데이터에 대한 집계 쿼리
- 컬럼 단위 데이터 압축

다음은 보고서를 생성할 때 전통적인 행 지향 시스템과 컬럼형 데이터베이스의 차이를 보여 주는 그림입니다:

**전통적인 행 지향**
<Image img={RowOriented} alt="전통적인 행 지향 데이터베이스" size="md" border />

**컬럼형**
<Image img={ColumnOriented} alt="컬럼형 데이터베이스" size="md" border />

컬럼형 데이터베이스는 분석 애플리케이션에서 우선적으로 선택되는 옵션입니다. 테이블에 많은 컬럼을 「혹시 몰라서」 포함하더라도, 읽기 쿼리를 실행할 때 사용되지 않는 컬럼에 대한 비용을 지불하지 않아도 되기 때문입니다(전통적인 OLTP 데이터베이스는 데이터가 컬럼이 아니라 행 단위로 저장되어 있어 쿼리 시 모든 데이터를 읽습니다). 컬럼 지향 데이터베이스는 빅데이터 처리와 데이터 웨어하우징을 위해 설계되며, 처리량을 높이기 위해 저비용 하드웨어로 구성된 분산 클러스터로 자연스럽게 확장되는 경우가 많습니다. ClickHouse는 [distributed](../../engines/table-engines/special/distributed.md) 테이블과 [replicated](../../engines/table-engines/mergetree-family/replication.md) 테이블의 조합을 통해 이를 구현합니다.

컬럼형 데이터베이스의 역사, 행 지향 데이터베이스와의 차이, 그리고 컬럼형 데이터베이스의 사용 사례를 자세히 알고 싶다면 [컬럼 데이터베이스 가이드](https://clickhouse.com/engineering-resources/what-is-columnar-database)를 참고하십시오.
