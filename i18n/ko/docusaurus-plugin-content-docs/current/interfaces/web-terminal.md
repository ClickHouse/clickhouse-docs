---
description: 'WebSocket을 통해 브라우저에서 `clickhouse-client` 세션을 제공하는 웹 터미널 문서'
sidebar_label: '웹 터미널'
sidebar_position: 22
slug: /interfaces/web-terminal
title: '웹 터미널'
doc_type: '참고'
---

웹 터미널은 WebSocket을 통해 대화형 `clickhouse-client` 세션을 제공하는 실험적인 브라우저 내 인터페이스입니다. 임의의 ClickHouse HTTP 포트의 `/webterminal` 경로에서 제공됩니다.

:::note
웹 터미널은 실험적 기능이며 기본적으로 비활성화되어 있습니다. 아래의 [기능 활성화](#enabling-the-feature)를 참조하십시오.
:::

## 기능 활성화 \{#enabling-the-feature\}

`/webterminal` 엔드포인트는 `allow_experimental_webterminal` 서버 설정에 의해 제어됩니다. 이 설정이 `false`(기본값)로 되어 있으면 `/webterminal` 요청에 대해 HTTP 상태 코드 `403 Forbidden`이 반환됩니다.

활성화하려면 서버 구성에 다음 내용을 추가하십시오:

```xml
<clickhouse>
    <allow_experimental_webterminal>true</allow_experimental_webterminal>
</clickhouse>
```

활성화한 후 터미널을 열려면 아무 ClickHouse HTTP 포트에서나 `/webterminal`로 이동하십시오(예: `http://localhost:8123/webterminal`).

## 인증 \{#authentication\}

웹 터미널은 HTTP 프로토콜과 동일한 `Session` 및 접근 제어 검사를 사용해 사용자를 인증하지만, 자격 증명은 HTTP 업그레이드 요청이 아니라 설정된 WebSocket 연결을 통해 인밴드 방식으로 교환됩니다. WebSocket 핸드셰이크가 완료되면 브라우저는 첫 번째 메시지를 JSON 형식으로 전송합니다:

```json
{"type": "auth", "user": "<user>", "password": "<password>"}
```

이렇게 하면 자격 증명이 업그레이드 요청에 포함된 URL 쿼리 매개변수나 `Authorization` 헤더에 실리는 일을 방지할 수 있으며, 이러한 정보는 브라우저 이력, 서버 액세스 로그, 리버스 프록시 로그에 남을 수 있습니다. `/webterminal`은 업그레이드 요청의 URL 매개변수, HTTP Basic, `X-ClickHouse-User`/`X-ClickHouse-Key` 헤더를 의도적으로 **참조하지 않습니다**.

유효하지 않은 자격 증명이 제공되면 서버는 코드 `1008`로 WebSocket 연결을 종료하며, 브라우저 UI는 자격 증명을 다시 입력하도록 요청합니다.

## 세션 화면 \{#session\}

인증이 완료되면 서버는 의사 터미널에 연결된 `clickhouse-client`를 실행하고, 입력과 출력을 WebSocket을 통해 중계합니다. 이 세션에서는 다음을 포함한 `clickhouse-client`의 전체 기능을 사용할 수 있습니다.

* 구문 강조.
* 자동 완성.
* 여러 줄 쿼리.
* 명령 이력(세션이 유지되는 동안 서버 측에 저장됨).

터미널 렌더링에는 [xterm.js](https://xtermjs.org/)를 사용합니다. 모든 자산은 ClickHouse 바이너리 자체에서 제공되며, 서드파티 CDN은 전혀 로드하지 않습니다.

## `/play`와의 통합 \{#play-integration\}

[`/play`](/interfaces/http) Web SQL UI는 웹 터미널을 도킹 가능한 패널로 내장합니다. 사이드바의 터미널 아이콘으로 표시를 전환하거나, 쿼리 편집기가 비어 있을 때 `~` 키를 누르십시오. `/play` 페이지는 로드 시점에 `/webterminal`의 사용 가능 여부를 감지하며, 엔드포인트를 사용할 수 없으면(예를 들어 실험적 설정이 활성화되지 않은 경우) 터미널 컨트롤을 숨깁니다.

## 보안 고려 사항 \{#security\}

웹 터미널은 ClickHouse HTTP 엔드포인트에 인증할 수 있는 모든 사용자에게 대화형 셸과 유사한 세션을 제공하므로, HTTP 프로토콜에 적용되는 주의 사항이 여기에도 동일하게 적용됩니다:

* 신뢰할 수 없는 환경에서는 자격 증명과 세션 트래픽을 보호하기 위해 항상 `/webterminal`을 HTTPS로 제공하십시오.
* HTTP 프로토콜에 대한 접근을 제한하는 것과 동일한 방식으로 네트워크 수준에서 접근을 제한하십시오(방화벽, 리버스 프록시 또는 `listen_host` 구성 사용).
* 이 엔드포인트는 교차 출처 WebSocket 하이재킹을 완화하기 위해 `Origin` 헤더를 `Host`와 대조해 검증하므로, TLS를 외부에서 종료하는 경우 이에 맞게 리버스 프록시를 구성하십시오.
* TLS를 종료하는 리버스 프록시 뒤에서는 브라우저가 `https`를 사용하더라도 ClickHouse로의 업스트림 연결은 일반 `http`이므로, 엄격한 동일 출처 검사가 정상적인 연결까지 거부하게 됩니다. 이러한 배포에서는 WebSocket 세션을 열 수 있도록 허용할 전체 origin 목록을 쉼표로 구분하여 `webterminal_allowed_origins`에 설정하십시오. 이 설정이 비어 있지 않으면 기본 동일 출처 검사를 대체합니다. 예시: `<webterminal_allowed_origins>https://example.com,https://app.example.com:8443</webterminal_allowed_origins>`.

또한 이 핸들러는 RFC 6455에 따라 WebSocket 프로토콜 준수도 강제합니다. 마스킹되지 않은 클라이언트 프레임, 예약된 opcode, 지나치게 크거나 조각난 제어 프레임, 그리고 예약된 RSV 비트는 protocol-error 종료 코드와 함께 거부됩니다.

## 플랫폼 가용성 \{#platform\}

이 핸들러는 ClickHouse가 지원하는 모든 플랫폼에서 컴파일됩니다. 내장 `clickhouse-client` 실행기에 사용되는 의사 터미널 계층은 이식 가능한 POSIX 기본 함수(`posix_openpt`/`grantpt`/`unlockpt`)를 기반으로 구현되어 있으며, Linux 전용 경로에서는 스레드 안전한 `ptsname_r`를 사용합니다. 엔드포인트를 사용할 수 없으면(예: `allow_experimental_webterminal`이 활성화되어 있지 않은 경우) ClickHouse 시작 페이지와 `/play`의 `/webterminal` 링크는 자동으로 숨겨집니다.