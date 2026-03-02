---
description: 'ClickHouse의 네이티브 TCP 인터페이스에 대한 문서'
sidebar_label: '네이티브 인터페이스 (TCP)'
sidebar_position: 18
slug: /interfaces/tcp
title: '네이티브 인터페이스 (TCP)'
doc_type: 'reference'
---

# 네이티브 인터페이스 (TCP) \{#native-interface-tcp\}

네이티브 프로토콜은 [명령줄 클라이언트](/interfaces/cli), 분산 쿼리 처리 시의 서버 간 통신, 그리고 기타 C++ 프로그램에서 사용됩니다. 안타깝게도 네이티브 ClickHouse 프로토콜은 아직 공식 명세가 없지만, ClickHouse 소스 코드(예를 들어 [이 부분](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)부터)를 분석하거나 TCP 트래픽을 가로채어 분석함으로써 리버스 엔지니어링할 수 있습니다.