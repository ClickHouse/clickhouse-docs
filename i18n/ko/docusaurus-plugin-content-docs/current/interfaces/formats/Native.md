---
alias: []
description: 'Native 형식에 대한 설명서'
input_format: true
keywords: ['Native']
output_format: true
slug: /interfaces/formats/Native
title: 'Native'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 \{#description\}

`Native` 포맷은 컬럼을 행으로 변환하지 않는 진정한 「열 지향(columnar)」 방식이기 때문에 ClickHouse에서 가장 효율적인 포맷입니다.  

이 포맷에서는 데이터가 바이너리 형식의 [블록](/development/architecture#block) 단위로 기록되고 읽힙니다. 
각 블록마다 행 수, 컬럼 수, 컬럼 이름과 타입, 그리고 블록 내 컬럼의 파트가 차례대로 기록됩니다. 

이 포맷은 서버 간 상호 작용을 위한 네이티브 인터페이스, 커맨드라인 클라이언트 및 C++ 클라이언트에서 사용됩니다.

:::tip
이 포맷을 사용하면 ClickHouse DBMS에서만 읽을 수 있는 덤프를 빠르게 생성할 수 있습니다. 
직접 이 포맷을 사용하여 작업하는 것은 실용적이지 않을 수 있습니다.
:::