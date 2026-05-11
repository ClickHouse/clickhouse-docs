---
description: 'ClickHouse와 ZooKeeper 간 보안 SSL/TLS 통신 구성을 위한 가이드'
sidebar_label: 'ZooKeeper와의 보안 통신'
sidebar_position: 45
slug: /operations/ssl-zookeeper
title: 'ClickHouse와 ZooKeeper 간 선택적 보안 통신'
doc_type: 'guide'
---

# ClickHouse와 ZooKeeper 간의 선택적 보안 통신 \{#optional-secured-communication-between-clickhouse-and-zookeeper\}

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

SSL을 통해 ClickHouse 클라이언트와 통신하려면 `ssl.keyStore.location`, `ssl.keyStore.password`와 `ssl.trustStore.location`, `ssl.trustStore.password`를 각각 지정해야 합니다. 이러한 옵션은 Zookeeper 3.5.2 버전부터 사용할 수 있습니다.

`zookeeper.crt`를 신뢰할 수 있는 인증서 목록에 추가할 수 있습니다.

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

`config.xml`의 `client` 섹션은 다음과 같습니다:

```xml
<client>
    <certificateFile>/etc/clickhouse-server/client.crt</certificateFile>
    <privateKeyFile>/etc/clickhouse-server/client.key</privateKeyFile>
    <loadDefaultCAFile>true</loadDefaultCAFile>
    <cacheSessions>true</cacheSessions>
    <disableProtocols>sslv2,sslv3</disableProtocols>
    <preferServerCiphers>true</preferServerCiphers>
    <invalidCertificateHandler>
        <name>RejectCertificateHandler</name>
    </invalidCertificateHandler>
</client>
```

ClickHouse 설정에 ZooKeeper와 몇 가지 클러스터 및 매크로를 추가하십시오:

```xml
<clickhouse>
    <zookeeper>
        <node>
            <host>localhost</host>
            <port>2281</port>
            <secure>1</secure>
        </node>
    </zookeeper>
</clickhouse>
```

`clickhouse-server`를 시작하십시오. 로그에서 다음과 같은 메시지가 출력되어야 합니다:

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

`secure://` 접두사는 연결이 SSL로 보호됨을 나타냅니다.

트래픽이 암호화되었는지 확인하려면 보안이 설정된 포트에서 `tcpdump`를 실행하십시오:

```bash
tcpdump -i any dst port 2281 -nnXS
```

그리고 `clickhouse-client`에서의 쿼리:

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

암호화되지 않은 연결에서는 `tcpdump` 출력에 다음과 같은 내용이 나타납니다:

```text
..../zookeeper/quota.
```

암호화된 연결에서는 이 메시지가 표시되지 않아야 합니다.
