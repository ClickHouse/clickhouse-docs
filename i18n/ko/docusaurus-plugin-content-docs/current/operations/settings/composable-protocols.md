---
description: 'Composable protocols은 ClickHouse 서버에 대한 TCP 액세스를 보다 유연하게 구성할 수 있도록 합니다.'
sidebar_label: '조합 가능한 프로토콜'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: '조합 가능한 프로토콜'
doc_type: 'reference'
---

# 조합형 프로토콜 \{#composable-protocols\}

## 개요 \{#overview\}

Composable 프로토콜을 사용하면 ClickHouse 서버에 대한 TCP 접근을 보다 유연하게 구성할 수 있습니다. 이 구성은 기존 구성 방식과 병행하여 사용할 수도 있고, 기존 구성 방식을 대체할 수도 있습니다.

## 조합 가능한 프로토콜 구성 \{#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml\}

조합 가능한 프로토콜은 XML 설정 파일에서 구성할 수 있습니다. 프로토콜 섹션은 XML 설정 파일에서 `protocols` 태그로 표시됩니다.

```xml
<protocols>

</protocols>
```


### 프로토콜 레이어 구성 \{#basic-modules-define-protocol-layers\}

기본 모듈을 사용하여 프로토콜 레이어를 정의할 수 있습니다. 예를 들어
HTTP 레이어를 정의하려면 `protocols` 섹션에 새 기본 모듈을 추가합니다.

```xml
<protocols>

  <!-- plain_http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```

모듈은 다음과 같이 구성할 수 있습니다:

* `plain_http` - 다른 레이어에서 참조할 수 있는 이름
* `type` - 데이터를 처리하기 위해 인스턴스화될 프로토콜 핸들러를 나타냅니다.
  다음과 같은 사전 정의된 프로토콜 핸들러 목록을 가집니다:
  * `tcp` - ClickHouse 기본 프로토콜 핸들러
  * `http` - HTTP ClickHouse 프로토콜 핸들러
  * `tls` - TLS 암호화 레이어
  * `proxy1` - PROXYv1 레이어
  * `mysql` - MySQL 호환 프로토콜 핸들러
  * `postgres` - PostgreSQL 호환 프로토콜 핸들러
  * `prometheus` - Prometheus 프로토콜 핸들러
  * `interserver` - ClickHouse 인터서버 핸들러

:::note
`Composable protocols`에서는 `gRPC` 프로토콜 핸들러가 구현되어 있지 않습니다.
:::


### 엔드포인트 구성 \{#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags\}

엔드포인트(리스닝 포트)는 `<port>` 태그와 선택적인 `<host>` 태그로 지정합니다.
예를 들어, 이전에 추가한 HTTP 레이어에 엔드포인트를 구성하려면
구성을 다음과 같이 수정합니다.

```xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- endpoint -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```

`<host>` 태그를 생략하면 루트 구성의 `<listen_host>` 값이 사용됩니다.


### 레이어 시퀀스 구성하기 \{#layers-sequence-is-defined-by-impl-tag-referencing-another-module\}

레이어 시퀀스는 `<impl>` 태그를 사용해 다른 모듈을 참조하도록 정의합니다. 예를 들어, plain&#95;http 모듈 위에 TLS 레이어를 구성하려면 다음과 같이 구성을 추가로 수정할 수 있습니다:

```xml
<protocols>

  <!-- http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- https module configured as a tls layer on top of plain_http module -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```


### 레이어에 엔드포인트를 연결하기 \{#endpoint-can-be-attached-to-any-layer\}

엔드포인트는 어떤 레이어에도 연결할 수 있습니다. 예를 들어 HTTP(포트 8123)와 HTTPS(포트 8443)에 대한 엔드포인트를 정의할 수 있습니다.

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```


### 추가 엔드포인트 정의 \{#additional-endpoints-can-be-defined-by-referencing-any-module-and-omitting-type-tag\}

추가 엔드포인트는 원하는 모듈을 참조하고 `<type>` 태그를 생략하여 정의할 수 있습니다.
예를 들어, 다음과 같이 `plain_http` 모듈에 대해 `another_http` 엔드포인트를 정의할 수 있습니다.

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

  <another_http>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8223</port>
  </another_http>

</protocols>
```


### 추가 레이어 매개변수 지정 \{#some-modules-can-contain-specific-for-its-layer-parameters\}

일부 모듈에는 추가 레이어 매개변수가 있을 수 있습니다. 예를 들어, TLS 레이어에서는
개인 키(`privateKeyFile`)와 인증서 파일(`certificateFile`)을
다음과 같이 지정할 수 있습니다.

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
    <privateKeyFile>another_server.key</privateKeyFile>
    <certificateFile>another_server.crt</certificateFile>
  </https>

</protocols>
```
