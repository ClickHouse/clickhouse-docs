---
'description': 'ClickHouse의 네이티브 TCP 인터페이스에 대한 Documentation'
'sidebar_label': '네이티브 인터페이스 (TCP)'
'sidebar_position': 18
'slug': '/interfaces/tcp'
'title': '네이티브 인터페이스 (TCP)'
'doc_type': 'reference'
---


# 네이티브 인터페이스 (TCP)

네이티브 프로토콜은 [명령줄 클라이언트](../interfaces/cli.md)에서 사용되며, 분산 쿼리 처리 중 서버 간 통신에 사용됩니다. 또한 다른 C++ 프로그램에서도 사용됩니다. 불행히도, 네이티브 ClickHouse 프로토콜은 아직 공식 사양이 없지만, ClickHouse 소스 코드에서 역공학을 통해 파악할 수 있습니다 (시작은 [여기서](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)부터) 또는 TCP 트래픽을 가로채고 분석함으로써 확인할 수 있습니다.
