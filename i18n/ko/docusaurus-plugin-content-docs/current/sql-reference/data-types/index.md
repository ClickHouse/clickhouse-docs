---
description: 'ClickHouse 데이터 타입에 대한 문서'
sidebar_label: '데이터 타입 목록'
sidebar_position: 1
slug: /sql-reference/data-types/
title: 'ClickHouse 데이터 타입'
doc_type: 'reference'
---

# ClickHouse의 데이터 타입 \{#data-types-in-clickhouse\}

이 섹션에서는 ClickHouse에서 지원하는 데이터 타입을 설명합니다. 예를 들어 [정수](int-uint.md), [실수](float.md), [문자열](string.md) 등이 있습니다.

시스템 테이블 [system.data&#95;type&#95;families](/operations/system-tables/data_type_families)는 사용 가능한 모든 데이터 타입에 대한 개요를 제공합니다.
또한 각 데이터 타입이 다른 데이터 타입의 별칭인지, 그리고 그 이름이 대소문자를 구분하는지(예: `bool` vs. `BOOL`) 여부도 보여줍니다.