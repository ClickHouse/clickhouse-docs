---
sidebar_label: '개요'
sidebar_position: 10
title: 'JSON 사용하기'
slug: /integrations/data-formats/json/overview
description: 'ClickHouse에서 JSON 사용하기'
keywords: ['json', 'clickhouse']
score: 10
doc_type: 'guide'
---

# JSON 개요 \{#json-overview\}

<iframe
  src="//www.youtube.com/embed/gCg5ISOujtc"
  frameborder="0"
  allow="autoplay;
fullscreen;
picture-in-picture"
  allowfullscreen
/>

<br />

ClickHouse는 JSON을 처리하기 위한 여러 가지 방법을 제공하며, 각 방법에는 고유한 장단점과 활용 방식이 있습니다. 이 가이드에서는 JSON을 적재하는 방법과 스키마를 최적으로 설계하는 방법을 다룹니다. 이 가이드는 다음과 같은 섹션으로 구성됩니다.

* [JSON 로드](/integrations/data-formats/json/loading) - 단순한 스키마를 사용하여 ClickHouse에서 구조화 및 반구조화된 JSON을 적재하고 쿼리하는 방법.
* [JSON 스키마 추론](/integrations/data-formats/json/inference) - JSON 스키마 추론(JSON schema inference)을 사용하여 JSON을 쿼리하고 테이블 스키마를 생성하는 방법.
* [JSON 스키마 설계](/integrations/data-formats/json/schema) - JSON 스키마를 설계하고 최적화하는 단계.
* [JSON 내보내기](/integrations/data-formats/json/exporting) - JSON을 내보내는 방법.
* [기타 JSON 포맷 처리](/integrations/data-formats/json/other-formats) - newline-delimited JSON(NDJSON)이 아닌 기타 JSON 포맷을 처리하기 위한 몇 가지 팁.
* [JSON 모델링을 위한 기타 접근 방식](/integrations/data-formats/json/other-approaches) - JSON을 모델링하기 위한 레거시 접근 방식. **권장되지 않습니다.**