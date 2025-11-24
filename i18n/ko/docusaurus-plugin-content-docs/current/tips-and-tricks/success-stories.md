---
'sidebar_position': 1
'slug': '/community-wisdom/creative-use-cases'
'sidebar_label': '성공 사례'
'doc_type': 'guide'
'keywords':
- 'clickhouse creative use cases'
- 'clickhouse success stories'
- 'unconventional database uses'
- 'clickhouse rate limiting'
- 'analytics database applications'
- 'clickhouse mobile analytics'
- 'customer-facing analytics'
- 'database innovation'
- 'clickhouse real-time applications'
- 'alternative database solutions'
- 'breaking database conventions'
- 'production success stories'
'title': 'Lessons - Creative Use Cases'
'description': '가장 일반적인 ClickHouse 문제에 대한 솔루션을 찾아보세요. 여기에는 느린 쿼리, 메모리 오류, 연결 문제 및
  구성 문제가 포함됩니다.'
---


# 성공 사례 {#breaking-the-rules}

*이 가이드는 커뮤니티 모임에서 얻은 연구 결과 모음의 일부입니다. 더 많은 실제 솔루션과 통찰력을 원하시면 [특정 문제별로 탐색해 보세요](./community-wisdom.md).*
*프로덕션에서 문제를 디버깅하는 팁이 필요하신가요? [디버깅 통찰력](./debugging-insights.md) 커뮤니티 가이드를 확인해 보세요.*

이 이야기는 회사들이 ClickHouse를 사용하여 성공을 거둔 사례를 보여줍니다. 일부는 전통적인 데이터베이스 범주에 도전하고 때로는 "잘못된" 도구가 바로 적합한 솔루션이 된다는 것을 증명합니다.

## ClickHouse를 이용한 레이트 리미터 {#clickhouse-rate-limiter}

Craigslist가 사용자 보호를 위해 1계층 레이트 리미팅을 추가해야 할 때, 그들은 모든 엔지니어링 팀이 마주치는 결정을 내리게 되었습니다 - 기존의 지혜를 따르고 Redis를 사용할 것인지, 아니면 다른 방안을 탐색할 것인지. Craigslist에서 일하는 Brad Lhotsky는 Redis가 표준 선택이라는 것을 알고 있었습니다 - 거의 모든 레이트 리미팅 튜토리얼과 온라인 예제가 Redis를 사용하는 이유가 있었습니다. 레이트 리미팅 작업을 위한 풍부한 기본 요소와 잘 정립된 패턴, 검증된 실적을 가지고 있습니다. 하지만 Craigslist의 Redis 경험은 교과서에서 본 예제와 일치하지 않았습니다. *"우리가 Redis를 사용할 때의 경험은 당신이 영화에서 본 것과는 다릅니다... 우리가 Redis 클러스터의 노드를 재부팅할 때 여러 가지 이상한 유지 관리 문제에 직면했습니다. 그 결과 프론트 엔드에서 지연이 발생하곤 했습니다."* 유지 관리의 단순성을 중시하는 작은 팀에게 이러한 운영상의 문제는 정말로 큰 문제가 되고 있었습니다.

그래서 Brad가 레이트 리미팅 요구 사항을 제기받았을 때, 그는 다른 접근 방식을 취했습니다: *"저는 제 상사에게 '이 생각이 어떠세요? ClickHouse로 이것을 시도해 볼 수 있을까요?'라고 물었습니다."* 이 아이디어는 비전통적이었습니다 - 일반적으로 캐싱 계층 문제에 대한 분석 데이터베이스 사용이었지만, 그들의 핵심 요구 사항을 충족했습니다: 실패 시 오픈, 지연 페널티 없음, 그리고 작은 팀에 대한 유지 관리 안전성. 이 솔루션은 기존 인프라를 활용했습니다. 접근 로그는 이미 Kafka를 통해 ClickHouse로 흐르고 있었습니다. 그들은 별도의 Redis 클러스터를 유지하는 대신 접근 로그 데이터에서 요청 패턴을 직접 분석하고 그들의 기존 ACL API에 레이트 리미팅 규칙을 주입할 수 있었습니다. 이 접근 방식은 Redis보다 약간 높은 지연 시간을 의미했습니다. *"Redis가 미리 데이터 세트를 인스턴스화해서 그렇게 된 것일 뿐"* 실제 시간 집계 쿼리를 수행하지 않은 것과 마찬가지이지만, 쿼리는 여전히 100밀리초 이내로 완료되었습니다.

**주요 결과:**
- Redis 인프라에 비해 극적인 개선
- 자동 정리를 위한 내장 TTL로 유지 관리 오버헤드 eliminated
- SQL 유연성 덕분에 단순 카운터를 넘어 복잡한 레이트 리미팅 규칙 가능
- 별도의 인프라가 필요 없는 기존 데이터 파이프라인 활용

## ClickHouse를 통한 고객 분석 {#customer-analytics}

ServiceNow가 모바일 분석 플랫폼을 업그레이드해야 할 때, 그들은 간단한 질문에 직면했습니다: *"왜 잘 작동하는 것을 교체해야 하죠?"* ServiceNow의 Amir Vaza는 기존 시스템이 신뢰할 수 있다는 것을 알고 있었지만 고객 요구가 시스템이 처리할 수 있는 것 이상으로 증가하고 있었습니다. *"기존의 신뢰할 수 있는 모델을 교체하려는 동기는 사실 제품 세계에서 온 것 같습니다,"* Amir는 설명했습니다. ServiceNow는 웹, 모바일 및 챗봇을 위한 솔루션의 일환으로 모바일 분석을 제공했지만, 고객은 사전 집계된 데이터를 넘어서 분석 유연성을 원했습니다.

그들의 이전 시스템은 고정된 차원(응용 프로그램, 앱 버전, 플랫폼)으로 세분화된 사전 집계된 데이터로 약 30개의 서로 다른 테이블을 사용하고 있었습니다. 고객이 보낼 수 있는 맞춤 속성(키-값 쌍)에 대해 각 그룹에 대해 별도의 카운터를 만들었습니다. 이 접근 방식은 빠른 대시보드 성능을 제공했지만, 큰 한계가 있었습니다. *"이는 빠른 값 분해에 유용하지만, 제가 언급했듯이 이러한 제한은 많은 분석 맥락의 손실로 이어집니다,"* Amir는 지적했습니다. 고객은 복잡한 고객 여정 분석을 수행하거나 "어떤 세션이 'research RSA token' 검색어로 시작되었는지"와 같은 질문을 하고 해당 사용자들이 다음에 무슨 일을 했는지 분석할 수 없었습니다. 사전 집계된 구조는 다단계 분석에 필요한 순차적 맥락을 파괴하였고, 모든 새로운 분석 차원은 사전 집계 및 저장을 위한 엔지니어링 작업이 필요했습니다.

이러한 한계가 명확해지므로, ServiceNow는 ClickHouse로 전환하고 이러한 사전 계산 제약을 완전히 제거했습니다. 모든 변수를 미리 계산하는 대신 메타데이터를 데이터 포인트로 분해하고 모든 것을 ClickHouse에 직접 삽입했습니다. Amir는 ClickHouse의 비동기 삽입 큐를 *"정말 놀라운 것"*이라며 데이터 수집을 효율적으로 처리할 수 있었습니다. 이 접근 방식 덕분에 고객은 이제 자신만의 세그먼트를 만들고, 자유롭게 데이터를 자르고, 이전에는 불가능했던 복잡한 고객 여정 분석을 수행할 수 있었습니다.

**주요 결과:**
- 사전 계산 없이 모든 차원에서 동적 세그멘테이션
- 복잡한 고객 여정 분석 가능
- 고객이 자신만의 세그먼트를 만들고 자유롭게 데이터 자르기  
- 새로운 분석 요구를 위한 엔지니어링 병목 현상 제거

## 비디오 출처 {#video-sources}

- **[규칙 깨기 - ClickHouse로 레이트 리미터 만들기](https://www.youtube.com/watch?v=wRwqrbUjRe4)** - Brad Lhotsky (Craigslist)
- **[ServiceNow에서의 분석 솔루션으로서 ClickHouse](https://www.youtube.com/watch?v=b4Pmpx3iRK4)** - Amir Vaza (ServiceNow)

*이 이야기들은 기존 데이터베이스의 지혜에 의문을 제기하는 것이 분석 데이터베이스로 가능한 것을 재정의하는 돌파구 솔루션으로 이어질 수 있음을 보여줍니다.*
