---
'alias': []
'description': 'Native 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'Native'
'output_format': true
'slug': '/interfaces/formats/Native'
'title': 'Native'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

`Native` 포맷은 ClickHouse의 가장 효율적인 포맷으로, 진정한 "컬럼형" 포맷으로서 컬럼을 행으로 변환하지 않습니다.  

이 포맷에서는 데이터가 바이너리 형식으로 [블록](/development/architecture#block) 단위로 기록되고 읽힙니다. 
각 블록에 대해 행 수, 컬럼 수, 컬럼 이름과 타입, 블록 내 컬럼의 부품이 차례대로 기록됩니다. 

이 포맷은 서버 간의 상호작용을 위한 네이티브 인터페이스, 커맨드라인 클라이언트 사용, C++ 클라이언트에 사용되는 형식입니다.

:::tip
이 포맷을 사용하여 ClickHouse DBMS에서만 읽을 수 있는 덤프를 신속하게 생성할 수 있습니다. 
이 포맷을 직접 작업하는 것은 실용적이지 않을 수 있습니다.
:::

## 예제 사용법 {#example-usage}

## 포맷 설정 {#format-settings}
