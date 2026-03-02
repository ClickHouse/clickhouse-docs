---
slug: /whats-new/security-changelog
sidebar_position: 20
sidebar_label: '보안 변경 내역'
title: '보안 변경 내역'
description: '보안 관련 업데이트와 변경 사항을 정리한 변경 내역 로그'
doc_type: 'changelog'
keywords: ['보안', 'CVE', '취약점', '보안 수정', '패치']
---



# 보안 변경 로그 \{#security-changelog\}



## ClickHouse v25.1.5.5에서 수정됨, 2025-01-05 \{#fixed-in-clickhouse-release-2025-01-05\}

### [CVE-2025-1385](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-5phv-x8x4-83x5) \{#CVE-2025-1385\}

library bridge 기능이 활성화되어 있을 때, clickhouse-library-bridge는 localhost에서 HTTP API를 노출합니다. 이를 통해 clickhouse-server는 지정된 경로에서 라이브러리를 동적으로 로드하여 격리된 프로세스에서 실행할 수 있습니다. 특정 디렉터리로의 파일 업로드를 허용하는 ClickHouse 테이블 엔진(table engines) 기능과 결합되면, 두 테이블 엔진 모두에 접근할 수 있는 권한을 가진 공격자가 잘못 구성된 서버를 악용하여 ClickHouse 서버에서 임의의 코드를 실행할 수 있습니다.

다음 오픈 소스 버전에 수정 사항이 반영되었습니다: v24.3.18.6, v24.8.14.27, v24.11.5.34, v24.12.5.65, v25.1.5.5

ClickHouse Cloud는 이 취약점의 영향을 받지 않습니다.

기여자: [Arseniy Dugin](https://github.com/ZerLes)



## ClickHouse v24.5에서 수정됨, 2024-08-01 \{#fixed-in-clickhouse-release-2024-08-01\}

### [CVE-2024-6873](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-432f-r822-j66f) \{#CVE-2024-6873\}

인증되지 않은 공격 경로를 통해 ClickHouse 서버 네이티브 인터페이스로 특수하게 제작된 요청을 전송함으로써, ClickHouse 서버 프로세스의 실행 흐름을 변경하는 것이 가능합니다. 이 변경은 실행 시점에 메모리에서 256바이트 범위 내에 존재하는 값으로만 제한됩니다. 이 취약성은 Bugbounty 프로그램을 통해 식별되었으며, 원격 코드 실행(Remote Code Execution, RCE)에 대한 알려진 개념 증명(Proof of Concept) 코드가 생성되었거나 악용된 사례는 없습니다.

다음 오픈 소스 버전에 수정 사항이 적용되었습니다: v23.8.15.35-lts, v24.3.4.147-lts, v24.4.2.141-stable, v24.5.1.1763, v24.6.1.4423-stable

ClickHouse Cloud는 다른 버전 체계를 사용하며, 이 취약성에 대한 수정은 v24.2 이상을 실행 중인 모든 인스턴스에 적용되었습니다.

Credits:  malacupa (독립 연구원)



## ClickHouse v24.1에서 수정됨, 2024-01-30 \{#fixed-in-clickhouse-release-24-01-30\}

### [CVE-2024-22412](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r) \{#CVE-2024-22412\}

ClickHouse에서 쿼리 캐시가 활성화된 상태로 사용자 역할 간 전환을 수행할 때, 부정확한 데이터를 얻을 수 있는 위험이 있습니다. 취약한 버전의 ClickHouse를 사용하는 경우, 애플리케이션이 여러 역할을 동적으로 전환하는 상황에서는 쿼리 캐시를 사용하지 않을 것을 권장합니다.

다음 오픈 소스 버전에 수정 사항이 반영되었습니다: v24.1.1.2048, v24.1.8.22-stable, v23.12.6.19-stable, v23.8.12.13-lts, v23.3.22.3-lts

ClickHouse Cloud는 다른 버전 체계를 사용하며, 이 취약점에 대한 수정은 v24.0.2.54535에 적용되었습니다.

공로: Runreveal 팀의 Evan Johnson 및 Alan Braithwaite - 자세한 정보는 [해당 블로그 게시글](https://blog.runreveal.com/cve-2024-22412-behind-the-bug-a-classic-caching-problem-in-the-clickhouse-query-cache/)에서 확인할 수 있습니다.



## ClickHouse v23.10.5.20에서 수정됨, 2023-11-26 \{#fixed-in-clickhouse-release-23-10-5-20-2023-11-26\}

### [CVE-2023-47118](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-g22g-p6q2-x39v) \{#CVE-2023-47118\}

기본적으로 포트 9000/tcp에서 실행되는 네이티브 인터페이스에 영향을 주는 힙 버퍼 오버플로 취약점입니다. 공격자는 T64 압축 코덱의 버그를 유발하여 ClickHouse 서버 프로세스를 비정상 종료시킬 수 있습니다. 이 취약점은 인증 없이도 악용될 수 있습니다.

다음 오픈 소스 버전에 수정 사항이 반영되었습니다: v23.10.2.13, v23.9.4.11, v23.8.6.16, v23.3.16.7

ClickHouse Cloud는 서로 다른 버전 체계를 사용하며, 이 취약점에 대한 수정은 v23.9.2.47475에서 적용되었습니다.

Credits:  malacupa (독립 연구원)

### [CVE-2023-48298](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-qw9f-qv29-8938) \{#CVE-2023-48298\}

FPC 압축 코덱에서의 정수 언더플로 취약점입니다. 공격자는 이를 이용하여 ClickHouse 서버 프로세스를 비정상 종료시킬 수 있습니다. 이 취약점은 인증 없이도 악용될 수 있습니다.

다음 오픈 소스 버전에 수정 사항이 반영되었습니다: v23.10.4.25, v23.9.5.29, v23.8.7.24, v23.3.17.13.

ClickHouse Cloud는 서로 다른 버전 체계를 사용하며, 이 취약점에 대한 수정은 v23.9.2.47475에서 적용되었습니다.

Credits:  malacupa (독립 연구원)

### [CVE-2023-48704](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-5rmf-5g48-xv63) \{#CVE-2023-48704\}

기본적으로 포트 9000/tcp에서 실행되는 네이티브 인터페이스에 영향을 주는 힙 버퍼 오버플로 취약점입니다. 공격자는 Gorilla 코덱의 버그를 유발하여 ClickHouse 서버 프로세스를 비정상 종료시킬 수 있습니다. 이 취약점은 인증 없이도 악용될 수 있습니다.

다음 오픈 소스 버전에 수정 사항이 반영되었습니다: v23.10.5.20, v23.9.6.20, v23.8.8.20, v23.3.18.15.

ClickHouse Cloud는 서로 다른 버전 체계를 사용하며, 이 취약점에 대한 수정은 v23.9.2.47551에서 적용되었습니다.

Credits:  malacupa (독립 연구원)



## ClickHouse 22.9.1.2603에서 수정됨, 2022-09-22 \{#fixed-in-clickhouse-release-22-9-1-2603-2022-9-22\}

### CVE-2022-44011 \{#CVE-2022-44011\}

ClickHouse 서버에서 힙 버퍼 오버플로우 문제가 발견되었습니다. ClickHouse 서버에 데이터를 로드할 수 있는 권한을 가진 악의적인 사용자는 잘못된 CapnProto 객체를 삽입하여 ClickHouse 서버를 비정상 종료시킬 수 있습니다.

해결 사항은 버전 22.9.1.2603, 22.8.2.11, 22.7.4.16, 22.6.6.16, 22.3.12.19에 반영되었습니다.

공로자: Kiojj (독립 연구원)

### CVE-2022-44010 \{#CVE-2022-44010\}

ClickHouse 서버에서 힙 버퍼 오버플로우 문제가 발견되었습니다. 공격자는 기본적으로 포트 8123에서 수신 대기하는 HTTP 엔드포인트로 특정 방식으로 조작한 HTTP 요청을 전송하여, 힙 기반 버퍼 오버플로우를 유발하고 ClickHouse 서버 프로세스를 비정상 종료시킬 수 있습니다. 이 공격에는 인증이 필요하지 않습니다.

해결 사항은 버전 22.9.1.2603, 22.8.2.11, 22.7.4.16, 22.6.6.16, 22.3.12.19에 반영되었습니다.

공로자: Kiojj (독립 연구원)



## ClickHouse 21.10.2.15에서 수정됨, 2021-10-18 \{#fixed-in-clickhouse-release-21-10-2-215-2021-10-18\}

### CVE-2021-43304 \{#cve-2021-43304\}

악의적인 쿼리를 파싱할 때 ClickHouse의 LZ4 압축 코덱에서 힙 버퍼 오버플로가 발생합니다. LZ4::decompressImpl 루프에서의 복사 연산, 특히 임의 복사 연산 `wildCopy<copy_amount>(op, ip, copy_end)`이 대상 버퍼의 한계를 초과하지 않는다는 검증이 수행되지 않습니다.

제보: JFrog Security Research Team

### CVE-2021-43305 \{#cve-2021-43305\}

악의적인 쿼리를 파싱할 때 ClickHouse의 LZ4 압축 코덱에서 힙 버퍼 오버플로가 발생합니다. LZ4::decompressImpl 루프에서의 복사 연산, 특히 임의 복사 연산 `wildCopy<copy_amount>(op, ip, copy_end)`이 대상 버퍼의 한계를 초과하지 않는다는 검증이 수행되지 않습니다. 이 이슈는 CVE-2021-43304와 매우 유사하지만, 취약한 복사 연산이 다른 wildCopy 호출에 존재합니다.

제보: JFrog Security Research Team

### CVE-2021-42387 \{#cve-2021-42387\}

악의적인 쿼리를 파싱할 때 ClickHouse의 LZ4 압축 코덱에서 힙 경계를 벗어난 읽기가 발생합니다. LZ4::decompressImpl() 루프의 일부로, 압축 데이터에서 16비트 부호 없는 사용자가 제공한 값 「offset」을 읽습니다. 이 offset은 이후 복사 연산의 길이에 사용되지만, 해당 복사 연산 소스의 상한을 확인하지 않습니다.

제보: JFrog Security Research Team

### CVE-2021-42388 \{#cve-2021-42388\}

악의적인 쿼리를 파싱할 때 ClickHouse의 LZ4 압축 코덱에서 힙 경계를 벗어난 읽기가 발생합니다. LZ4::decompressImpl() 루프의 일부로, 압축 데이터에서 16비트 부호 없는 사용자가 제공한 값 「offset」을 읽습니다. 이 offset은 이후 복사 연산의 길이에 사용되지만, 해당 복사 연산 소스의 하한을 확인하지 않습니다.

제보: JFrog Security Research Team

### CVE-2021-42389 \{#cve-2021-42389\}

악의적인 쿼리를 파싱할 때 ClickHouse의 Delta 압축 코덱에서 0으로 나누기(divide-by-zero)가 발생합니다. 압축 버퍼의 첫 번째 바이트가 0인지 확인하지 않고 나머지 연산(modulo 연산)에 사용됩니다.

제보: JFrog Security Research Team

### CVE-2021-42390 \{#cve-2021-42390\}

악의적인 쿼리를 파싱할 때 ClickHouse의 DeltaDouble 압축 코덱에서 0으로 나누기(divide-by-zero)가 발생합니다. 압축 버퍼의 첫 번째 바이트가 0인지 확인하지 않고 나머지 연산(modulo 연산)에 사용됩니다.

제보: JFrog Security Research Team

### CVE-2021-42391 \{#cve-2021-42391\}

악의적인 쿼리를 파싱할 때 ClickHouse의 Gorilla 압축 코덱에서 0으로 나누기(divide-by-zero)가 발생합니다. 압축 버퍼의 첫 번째 바이트가 0인지 확인하지 않고 나머지 연산(modulo 연산)에 사용됩니다.

제보: JFrog Security Research Team



## ClickHouse 21.4.3.21에서 수정됨, 2021-04-12 \{#fixed-in-clickhouse-release-21-4-3-21-2021-04-12\}

### CVE-2021-25263 \{#cve-2021-25263\}

CREATE DICTIONARY 권한을 가진 공격자는 허용된 디렉터리 외부의 임의의 파일을 읽을 수 있습니다.

해당 수정 사항은 20.8.18.32-lts, 21.1.9.41-stable, 21.2.9.41-stable, 21.3.6.55-lts, 21.4.3.21-stable 및 이후 버전에 반영되었습니다.

공로: [Vyacheslav Egoshin](https://twitter.com/vegoshin)



## ClickHouse 19.14.3.3 릴리스(2019-09-10)에서 수정됨 \{#fixed-in-clickhouse-release-19-14-3-3-2019-09-10\}

### CVE-2019-15024 \{#cve-2019-15024\}

ZooKeeper에 대한 쓰기 권한이 있고, ClickHouse가 실행되는 네트워크에서 접근 가능한 사용자 정의 서버를 실행할 수 있는 공격자는 ClickHouse 레플리카처럼 동작하고 ZooKeeper에 자신을 등록하는 특수 제작된 악성 서버를 생성할 수 있습니다. 다른 레플리카가 해당 악성 레플리카로부터 데이터 파트를 가져올 때, `clickhouse-server`가 파일 시스템의 임의 경로에 데이터를 쓰도록 강제할 수 있습니다.

제보: Yandex Information Security Team의 Eldar Zaitov

### CVE-2019-16535 \{#cve-2019-16535\}

디컴프레션 알고리즘에서의 OOB 읽기, OOB 쓰기 및 정수 언더플로우 취약점이 존재하여, 네이티브 프로토콜을 통해 RCE 또는 DoS를 수행하는 데 악용될 수 있습니다.

제보: Yandex Information Security Team의 Eldar Zaitov

### CVE-2019-16536 \{#cve-2019-16536\}

DoS로 이어지는 스택 오버플로우가 악의적인 인증된 클라이언트에 의해 트리거될 수 있습니다.

제보: Yandex Information Security Team의 Eldar Zaitov



## ClickHouse 19.13.6.1 릴리스에서 수정됨, 2019-09-20 \{#fixed-in-clickhouse-release-19-13-6-1-2019-09-20\}

### CVE-2019-18657 \{#cve-2019-18657\}

테이블 함수 `url`에 존재하던 취약점으로 인해 공격자가 요청에 임의의 HTTP 헤더를 주입할 수 있었습니다.

제보: [Nikita Tikhomirov](https://github.com/NSTikhomirov)



## ClickHouse 릴리스 18.12.13에서 수정됨, 2018-09-10 \{#fixed-in-clickhouse-release-18-12-13-2018-09-10\}

### CVE-2018-14672 \{#cve-2018-14672\}

CatBoost 모델을 로드하는 함수에서 경로 조작(path traversal)이 허용되어, 오류 메시지를 통해 임의의 파일을 읽을 수 있었습니다.

Credits: Yandex Information Security Team 소속 Andrey Krasichkov



## ClickHouse 릴리스 18.10.3에서 수정됨, 2018-08-13 \{#fixed-in-clickhouse-release-18-10-3-2018-08-13\}

### CVE-2018-14671 \{#cve-2018-14671\}

unixODBC는 파일 시스템에서 임의의 공유 객체를 로드할 수 있도록 허용했으며, 이로 인해 원격 코드 실행(Remote Code Execution) 취약점이 발생했습니다.

공로: Yandex Information Security Team 소속 Andrey Krasichkov 및 Evgeny Sidorov



## ClickHouse 릴리스 1.1.54388에서 수정됨, 2018-06-28 \{#fixed-in-clickhouse-release-1-1-54388-2018-06-28\}

### CVE-2018-14668 \{#cve-2018-14668\}

"remote" 테이블 함수가 "user", "password", "default_database" 필드에 임의의 문자를 허용하여 교차 프로토콜 요청 위조(Cross Protocol Request Forgery) 공격이 가능했습니다.

공로자: Yandex Information Security Team의 Andrey Krasichkov



## ClickHouse 릴리스 1.1.54390에서 수정됨, 2018-07-06 \{#fixed-in-clickhouse-release-1-1-54390-2018-07-06\}

### CVE-2018-14669 \{#cve-2018-14669\}

ClickHouse MySQL 클라이언트에는 "LOAD DATA LOCAL INFILE" 기능이 활성화되어 있어 악의적인 MySQL 데이터베이스가 연결된 ClickHouse 서버의 임의의 파일을 읽을 수 있었습니다.

공로: Yandex Information Security Team 소속 Andrey Krasichkov 및 Evgeny Sidorov



## ClickHouse 릴리스 1.1.54131에서 수정됨, 2017-01-10 \{#fixed-in-clickhouse-release-1-1-54131-2017-01-10\}

### CVE-2018-14670 \{#cve-2018-14670\}

deb 패키지의 잘못된 설정으로 인해 데이터베이스가 무단으로 사용될 수 있습니다.

제보: 영국 국가 사이버 보안 센터(National Cyber Security Centre, NCSC)

