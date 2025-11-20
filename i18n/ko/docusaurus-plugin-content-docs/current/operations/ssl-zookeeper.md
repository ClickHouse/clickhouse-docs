---
'description': 'ClickHouse와 ZooKeeper 간의 안전한 SSL/TLS 통신 구성 안내'
'sidebar_label': 'Zookeeper와의 보안 통신'
'sidebar_position': 45
'slug': '/operations/ssl-zookeeper'
'title': 'ClickHouse와 Zookeeper 간의 선택적 보안 통신'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';


# ClickHouse와 Zookeeper 간의 선택적 보안 통신
<SelfManaged />

ClickHouse 클라이언트와 SSL을 통한 통신을 위해 `ssl.keyStore.location`, `ssl.keyStore.password`, `ssl.trustStore.location`, `ssl.trustStore.password`를 지정해야 합니다. 이러한 옵션은 Zookeeper 버전 3.5.2부터 사용할 수 있습니다.

신뢰할 수 있는 인증서에 `zookeeper.crt`를 추가할 수 있습니다.

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

`config.xml`의 클라이언트 섹션은 다음과 같아야 합니다:

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

클러스터 및 매크로와 함께 ClickHouse 구성에 Zookeeper를 추가하십시오:

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

`clickhouse-server`를 시작합니다. 로그에서 다음 내용을 확인할 수 있어야 합니다:

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

접두사 `secure://`는 연결이 SSL에 의해 보호되고 있음을 나타냅니다.

트래픽이 암호화되었는지 확인하려면 보안 포트에서 `tcpdump`를 실행하십시오:

```bash
tcpdump -i any dst port 2281 -nnXS
```

그리고 `clickhouse-client`에서 쿼리하십시오:

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

암호화되지 않은 연결에서는 `tcpdump` 출력에서 다음과 같은 내용을 확인할 수 있습니다:

```text
..../zookeeper/quota.
```

암호화된 연결에서는 이러한 내용을 볼 수 없어야 합니다.
