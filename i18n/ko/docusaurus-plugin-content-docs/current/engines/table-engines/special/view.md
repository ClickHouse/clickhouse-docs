---
description: '뷰(View)를 구현하는 데 사용합니다(자세한 내용은 `CREATE VIEW query`를 참조하십시오). 데이터 자체는 저장하지 않고 지정된 `SELECT` 쿼리만 저장합니다. 테이블에서 읽기를 수행할 때 이 쿼리를 실행하며, 쿼리에서 불필요한 컬럼을 모두 제거합니다.'
sidebar_label: 'View'
sidebar_position: 90
slug: /engines/table-engines/special/view
title: 'View 테이블 엔진'
doc_type: 'reference'
---

# View 테이블 엔진 \{#view-table-engine\}

뷰를 구현하는 데 사용합니다 (`CREATE VIEW` 쿼리 참고). 이 엔진은 데이터를 저장하지 않고, 지정된 `SELECT` 쿼리만 저장합니다. 이 테이블에서 데이터를 읽을 때는 해당 쿼리를 실행하며, 쿼리에서 불필요한 컬럼은 모두 제거합니다.