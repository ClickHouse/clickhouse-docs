---
'description': '조합 가능한 프로토콜은 ClickHouse 서버에 대한 TCP 접근의 더 유연한 구성을 허용합니다.'
'sidebar_label': '조합 가능한 프로토콜'
'sidebar_position': 64
'slug': '/operations/settings/composable-protocols'
'title': '조합 가능한 프로토콜'
'doc_type': 'reference'
---


# Composable protocols

## Overview {#overview}

Composable protocols는 ClickHouse 서버에 대한 TCP 접근 방식을 더욱 유연하게 구성할 수 있도록 합니다. 이 구성은 기존 구성과 공존할 수 있거나 이를 대체할 수 있습니다.

## Configuring composable protocols {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}

Composable protocols는 XML 구성 파일에서 구성할 수 있습니다. 프로토콜 섹션은 XML 구성 파일에서 `protocols` 태그로 표시됩니다:

```xml
<protocols>

</protocols>
```

### Configuring protocol layers {#basic-modules-define-protocol-layers}

기본 모듈을 사용하여 프로토콜 레이어를 정의할 수 있습니다. 예를 들어, HTTP 레이어를 정의하려면 `protocols` 섹션에 새 기본 모듈을 추가하면 됩니다:

```xml
<protocols>

  <!-- plain_http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```
모듈은 다음에 따라 구성할 수 있습니다:

- `plain_http` - 다른 레이어에서 참조할 수 있는 이름
- `type` - 데이터를 처리하기 위해 인스턴스화될 프로토콜 핸들러를 나타냅니다.
   다음과 같은 미리 정의된 프로토콜 핸들러 집합이 있습니다:
  * `tcp` - 네이티브 ClickHouse 프로토콜 핸들러
  * `http` - HTTP ClickHouse 프로토콜 핸들러
  * `tls` - TLS 암호화 레이어
  * `proxy1` - PROXYv1 레이어
  * `mysql` - MySQL 호환 프로토콜 핸들러
  * `postgres` - PostgreSQL 호환 프로토콜 핸들러
  * `prometheus` - Prometheus 프로토콜 핸들러
  * `interserver` - ClickHouse 인터서버 핸들러

:::note
`gRPC` 프로토콜 핸들러는 `Composable protocols`에 대해 구현되지 않았습니다.
:::
 
### Configuring endpoints {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}

Endpoints(리스닝 포트)는 `<port>` 및 선택적 `<host>` 태그로 표시됩니다. 예를 들어, 이전에 추가한 HTTP 레이어에 대한 엔드포인트를 구성하기 위해 우리는 구성 파일을 다음과 같이 수정할 수 있습니다:

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

`<host>` 태그가 생략되면, 루트 구성의 `<listen_host>`가 사용됩니다.

### Configuring layer sequences {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}

레어 시퀀스는 `<impl>` 태그를 사용하여 정의되며 다른 모듈을 참조합니다. 예를 들어, 우리의 plain_http 모듈 위에 TLS 레이어를 구성하기 위해 우리는 우리의 구성을 다음과 같이 추가로 수정할 수 있습니다:

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

### Attaching endpoints to layers {#endpoint-can-be-attached-to-any-layer}

Endpoints는 어떤 레이어에도 연결할 수 있습니다. 예를 들어, HTTP(포트 8123) 및 HTTPS(포트 8443)에 대한 엔드포인트를 정의할 수 있습니다:

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

### Defining additional endpoints {#additional-endpoints-can-be-defined-by-referencing-any-module-and-omitting-type-tag}

추가 엔드포인트는 어떤 모듈을 참조하고 `<type>` 태그를 생략하여 정의할 수 있습니다. 예를 들어, 우리는 `plain_http` 모듈에 대한 `another_http` 엔드포인트를 다음과 같이 정의할 수 있습니다:

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

### Specifying additional layer parameters {#some-modules-can-contain-specific-for-its-layer-parameters}

일부 모듈은 추가적인 레이어 매개변수를 포함할 수 있습니다. 예를 들어, TLS 레이어는 개인 키(`privateKeyFile`) 및 인증서 파일(`certificateFile`)을 다음과 같이 지정할 수 있습니다:

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
