---
'slug': '/guides/sre/configuring-ssl'
'sidebar_label': 'SSL-TLS 구성'
'sidebar_position': 20
'title': 'SSL-TLS 구성'
'description': '이 가이드는 ClickHouse가 OpenSSL 인증서를 사용하여 연결을 검증하도록 구성하는 간단하고 최소한의 설정을
  제공합니다.'
'keywords':
- 'SSL configuration'
- 'TLS setup'
- 'OpenSSL certificates'
- 'secure connections'
- 'SRE guide'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';



# SSL-TLS 구성하기

<SelfManaged />

이 가이드는 OpenSSL 인증서를 사용하여 연결을 검증하도록 ClickHouse를 구성하는 간단하고 최소한의 설정을 제공합니다. 이 시연에서는 적절한 설정으로 연결을 하기 위해 자체 서명된 인증 기관(CA) 인증서와 키를 만들고 노드 인증서를 생성합니다.

:::note
TLS 구현은 복잡하며 완전히 안전하고 견고한 배포를 보장하기 위해 고려해야 할 많은 옵션이 있습니다. 이는 기본 SSL/TLS 구성 예제가 포함된 기본 튜토리얼입니다. 귀하의 조직에 대한 올바른 인증서를 생성하기 위해 PKI/보안 팀과 상담하십시오.

인증서 사용에 대한 [기본 튜토리얼](https://ubuntu.com/server/docs/security-certificates)을 검토하여 개요를 얻으십시오.
:::

## 1. ClickHouse 배포 만들기 {#1-create-a-clickhouse-deployment}

이 가이드는 Ubuntu 20.04에서 작성되었으며, 다음 호스트에 DEB 패키지(apt 사용)를 이용하여 설치된 ClickHouse를 사용합니다. 도메인은 `marsnet.local`입니다:

|Host |IP Address|
|--------|-------------|
|`chnode1` |192.168.1.221|
|`chnode2` |192.168.1.222|
|`chnode3` |192.168.1.223|

:::note
ClickHouse 설치에 대한 자세한 내용은 [빠른 시작](/getting-started/install/install.mdx)을 참조하십시오.
:::

## 2. SSL 인증서 생성 {#2-create-ssl-certificates}
:::note
자체 서명된 인증서는 시연 목적으로만 사용되며 생산 환경에서는 사용해서는 안 됩니다. 인증서 요청은 조직에서 서명하고 설정에서 구성할 CA 체인을 사용하여 검증되도록 생성해야 합니다. 그러나 이러한 단계를 사용하여 설정을 구성하고 테스트할 수 있으며, 이후 실제 사용할 인증서로 교체할 수 있습니다.
:::

1. 새로운 CA에 사용할 키를 생성합니다:
```bash
openssl genrsa -out marsnet_ca.key 2048
```

2. 새로운 자체 서명된 CA 인증서를 생성합니다. 다음은 CA 키를 사용하여 다른 인증서에 서명하는 데 사용될 새 인증서를 생성합니다:
```bash
openssl req -x509 -subj "/CN=marsnet.local CA" -nodes -key marsnet_ca.key -days 1095 -out marsnet_ca.crt
```

    :::note
    키와 CA 인증서를 클러스터가 아닌 안전한 위치에 백업하십시오. 노드 인증서를 생성한 후에는 클러스터 노드에서 키를 삭제해야 합니다.
    :::

3. 새로운 CA 인증서의 내용을 검증합니다:
```bash
openssl x509 -in marsnet_ca.crt -text
```

4. 각 노드를 위한 인증서 요청(CSR)을 생성하고 키를 생성합니다:
```bash
openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1" -addext "subjectAltName = DNS:chnode1.marsnet.local,IP:192.168.1.221" -keyout chnode1.key -out chnode1.csr
openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode2" -addext "subjectAltName = DNS:chnode2.marsnet.local,IP:192.168.1.222" -keyout chnode2.key -out chnode2.csr
openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode3" -addext "subjectAltName = DNS:chnode3.marsnet.local,IP:192.168.1.223" -keyout chnode3.key -out chnode3.csr
```

5. CSR 및 CA를 사용하여 새로운 인증서 및 키 쌍을 생성합니다:
```bash
openssl x509 -req -in chnode1.csr -out chnode1.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
openssl x509 -req -in chnode2.csr -out chnode2.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
openssl x509 -req -in chnode3.csr -out chnode3.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
```

6. 주체 및 발급자를 위해 인증서를 검증합니다:
```bash
openssl x509 -in chnode1.crt -text -noout
```

7. 새로운 인증서가 CA 인증서에 대해 검증되는지 확인합니다:
```bash
openssl verify -CAfile marsnet_ca.crt chnode1.crt
chnode1.crt: OK
```

## 3. 인증서와 키를 저장할 디렉토리 생성 및 구성하기 {#3-create-and-configure-a-directory-to-store-certificates-and-keys}

:::note
이 작업은 각 노드에서 수행해야 합니다. 각 호스트에서 적절한 인증서와 키를 사용하십시오.
:::

1. 각 노드에서 ClickHouse가 접근할 수 있는 디렉토리에 폴더를 생성합니다. 기본 구성 디렉토리(예: `/etc/clickhouse-server`)를 추천합니다:
```bash
mkdir /etc/clickhouse-server/certs
```

2. 각 노드에 해당하는 CA 인증서, 노드 인증서 및 키를 새 인증서 디렉토리에 복사합니다.

3. ClickHouse가 인증서를 읽을 수 있도록 소유자 및 권한을 업데이트합니다:
```bash
chown clickhouse:clickhouse -R /etc/clickhouse-server/certs
chmod 600 /etc/clickhouse-server/certs/*
chmod 755 /etc/clickhouse-server/certs
ll /etc/clickhouse-server/certs
```

```response
total 20
drw-r--r-- 2 clickhouse clickhouse 4096 Apr 12 20:23 ./
drwx------ 5 clickhouse clickhouse 4096 Apr 12 20:23 ../
-rw------- 1 clickhouse clickhouse  997 Apr 12 20:22 chnode1.crt
-rw------- 1 clickhouse clickhouse 1708 Apr 12 20:22 chnode1.key
-rw------- 1 clickhouse clickhouse 1131 Apr 12 20:23 marsnet_ca.crt
```

## 4. ClickHouse Keeper를 사용하여 기본 클러스터로 환경 구성하기 {#4-configure-the-environment-with-basic-clusters-using-clickhouse-keeper}

이 배포 환경에 대해 각 노드에서 다음 ClickHouse Keeper 설정이 사용됩니다. 각 서버는 고유한 `<server_id>`를 가집니다. (예를 들어, `chnode1`에 대해 `<server_id>1</server_id>`).

:::note
ClickHouse Keeper의 권장 포트는 `9281`입니다. 그러나 포트는 구성 가능하며 이 포트가 환경에서 다른 응용 프로그램에 이미 사용 중인 경우 설정할 수 있습니다.

모든 옵션에 대한 전체 설명은 https://clickhouse.com/docs/operations/clickhouse-keeper/ 를 방문하십시오.
:::

1. ClickHouse 서버 `config.xml`의 `<clickhouse>` 태그 안에 다음을 추가합니다.

    :::note
    프로덕션 환경에서는 `config.d` 디렉토리에 별도의 `.xml` 구성 파일을 사용하는 것이 좋습니다.
    자세한 내용은 https://clickhouse.com/docs/operations/configuration-files/ 를 방문하십시오.
    :::

```xml
<keeper_server>
    <tcp_port_secure>9281</tcp_port_secure>
    <server_id>1</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>trace</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
        <secure>true</secure>
        <server>
            <id>1</id>
            <hostname>chnode1.marsnet.local</hostname>
            <port>9444</port>
        </server>
        <server>
            <id>2</id>
            <hostname>chnode2.marsnet.local</hostname>
            <port>9444</port>
        </server>
        <server>
            <id>3</id>
            <hostname>chnode3.marsnet.local</hostname>
            <port>9444</port>
        </server>
    </raft_configuration>
</keeper_server>
```

2. 모든 노드에서 keeper 설정의 주석을 제거하고 업데이트하며 `<secure>` 플래그를 1로 설정합니다:
```xml
<zookeeper>
    <node>
        <host>chnode1.marsnet.local</host>
        <port>9281</port>
        <secure>1</secure>
    </node>
    <node>
        <host>chnode2.marsnet.local</host>
        <port>9281</port>
        <secure>1</secure>
    </node>
    <node>
        <host>chnode3.marsnet.local</host>
        <port>9281</port>
        <secure>1</secure>
    </node>
</zookeeper>
```

3. `chnode1` 및 `chnode2`에 다음 클러스터 설정을 업데이트하고 추가합니다. `chnode3`는 ClickHouse Keeper 과반수로 사용됩니다.

    :::note
    이 구성에서는 하나의 샤드 복제를 가진 단일 클러스터만 구성됩니다. 테스트 샘플 클러스터는 제거되거나 주석 처리가 되어야 하며, 테스트 중인 기존 클러스터가 있으면 포트를 업데이트하고 `<secure>` 옵션을 추가해야 합니다. 설치 시 `default` 사용자에게 비밀번호가 설정된 경우 `<user>` 및 `<password>`를 설정해야 합니다.
    :::

    다음은 두 서버(각 노드에서 하나씩)의 하나의 샤드 복제를 가진 클러스터를 생성합니다.
```xml
<remote_servers>
    <cluster_1S_2R>
        <shard>
            <replica>
                <host>chnode1.marsnet.local</host>
                <port>9440</port>
                <user>default</user>
                <password>ClickHouse123!</password>
                <secure>1</secure>
            </replica>
            <replica>
                <host>chnode2.marsnet.local</host>
                <port>9440</port>
                <user>default</user>
                <password>ClickHouse123!</password>
                <secure>1</secure>
            </replica>
        </shard>
    </cluster_1S_2R>
</remote_servers>
```

4. 테스트를 위해 ReplicatedMergeTree 테이블을 만들 수 있도록 매크로 값을 정의합니다. `chnode1`에서:
```xml
<macros>
    <shard>1</shard>
    <replica>replica_1</replica>
</macros>
```

    `chnode2`에서:
```xml
<macros>
    <shard>1</shard>
    <replica>replica_2</replica>
</macros>
```

## 5. ClickHouse 노드에서 SSL-TLS 인터페이스 구성하기 {#5-configure-ssl-tls-interfaces-on-clickhouse-nodes}
아래 설정은 ClickHouse 서버 `config.xml`에 구성됩니다.

1. 배포의 표시 이름을 설정합니다(선택 사항):
```xml
<display_name>clickhouse</display_name>
```

2. ClickHouse가 외부 포트를 수신하도록 설정합니다:
```xml
<listen_host>0.0.0.0</listen_host>
```

3. 각 노드에서 `https` 포트를 구성하고 `http` 포트를 비활성화합니다:
```xml
<https_port>8443</https_port>
<!--<http_port>8123</http_port>-->
```

4. 각 노드에서 ClickHouse Native 안전 TCP 포트를 구성하고 기본 비보안 포트를 비활성화합니다:
```xml
<tcp_port_secure>9440</tcp_port_secure>
<!--<tcp_port>9000</tcp_port>-->
```

5. 각 노드에서 `interserver https` 포트를 구성하고 기본 비보안 포트를 비활성화합니다:
```xml
<interserver_https_port>9010</interserver_https_port>
<!--<interserver_http_port>9009</interserver_http_port>-->
```

6. 인증서와 경로로 OpenSSL을 구성합니다.

    :::note
    각 파일 이름과 경로는 구성되는 노드와 일치하도록 업데이트해야 합니다.
    예를 들어, `chnode2` 호스팅에서 구성할 때 `<certificateFile>` 항목을 `chnode2.crt`로 업데이트하십시오.
    :::

```xml
<openSSL>
    <server>
        <certificateFile>/etc/clickhouse-server/certs/chnode1.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/certs/chnode1.key</privateKeyFile>
        <verificationMode>relaxed</verificationMode>
        <caConfig>/etc/clickhouse-server/certs/marsnet_ca.crt</caConfig>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
    </server>
    <client>
        <loadDefaultCAFile>false</loadDefaultCAFile>
        <caConfig>/etc/clickhouse-server/certs/marsnet_ca.crt</caConfig>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
        <verificationMode>relaxed</verificationMode>
        <invalidCertificateHandler>
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```

    더 많은 정보는 https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-openssl 를 방문하십시오.

7. 모든 노드에서 SSL을 위한 gRPC를 구성합니다:
```xml
<grpc>
    <enable_ssl>1</enable_ssl>
    <ssl_cert_file>/etc/clickhouse-server/certs/chnode1.crt</ssl_cert_file>
    <ssl_key_file>/etc/clickhouse-server/certs/chnode1.key</ssl_key_file>
    <ssl_require_client_auth>true</ssl_require_client_auth>
    <ssl_ca_cert_file>/etc/clickhouse-server/certs/marsnet_ca.crt</ssl_ca_cert_file>
    <transport_compression_type>none</transport_compression_type>
    <transport_compression_level>0</transport_compression_level>
    <max_send_message_size>-1</max_send_message_size>
    <max_receive_message_size>-1</max_receive_message_size>
    <verbose_logs>false</verbose_logs>
</grpc>
```

    더 많은 정보는 https://clickhouse.com/docs/interfaces/grpc/ 를 방문하십시오.

8. 노드 중 적어도 하나에서 SSL을 사용할 수 있도록 ClickHouse 클라이언트를 구성합니다(기본적으로 `/etc/clickhouse-client/`에 위치함):
```xml
<openSSL>
    <client>
        <loadDefaultCAFile>false</loadDefaultCAFile>
        <caConfig>/etc/clickhouse-server/certs/marsnet_ca.crt</caConfig>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
        <invalidCertificateHandler>
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```

6. MySQL 및 PostgreSQL에 대한 기본 에뮬레이션 포트를 비활성화합니다:
```xml
<!--mysql_port>9004</mysql_port-->
<!--postgresql_port>9005</postgresql_port-->
```

## 6. 테스트하기 {#6-testing}
1. 모든 노드를 하나씩 시작합니다:
```bash
service clickhouse-server start
```

2. 보안 포트가 작동 중인지 확인하고 각 노드에서 다음 예제와 비슷해야 합니다:
```bash
root@chnode1:/etc/clickhouse-server# netstat -ano | grep tcp
```

```response
tcp        0      0 0.0.0.0:9010            0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 0.0.0.0:8443            0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 0.0.0.0:9440            0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 0.0.0.0:9281            0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 192.168.1.221:33046     192.168.1.222:9444      ESTABLISHED off (0.00/0/0)
tcp        0      0 192.168.1.221:42730     192.168.1.223:9444      ESTABLISHED off (0.00/0/0)
tcp        0      0 192.168.1.221:51952     192.168.1.222:9281      ESTABLISHED off (0.00/0/0)
tcp        0      0 192.168.1.221:22        192.168.1.210:49801     ESTABLISHED keepalive (6618.05/0/0)
tcp        0     64 192.168.1.221:22        192.168.1.210:59195     ESTABLISHED on (0.24/0/0)
tcp6       0      0 :::22                   :::*                    LISTEN      off (0.00/0/0)
tcp6       0      0 :::9444                 :::*                    LISTEN      off (0.00/0/0)
tcp6       0      0 192.168.1.221:9444      192.168.1.222:59046     ESTABLISHED off (0.00/0/0)
tcp6       0      0 192.168.1.221:9444      192.168.1.223:41976     ESTABLISHED off (0.00/0/0)
```

    |ClickHouse 포트 |설명|
    |--------|-------------|
    |8443 | https 인터페이스|
    |9010 | interserver https 포트|
    |9281 | ClickHouse Keeper 보안 포트|
    |9440 | 안전 Native TCP 프로토콜|
    |9444 | ClickHouse Keeper Raft 포트 |

3. ClickHouse Keeper 상태 확인
일반적인 [4자리 단어(4lW)](/guides/sre/keeper/index.md#four-letter-word-commands) 명령은 TLS 없이 `echo`를 사용하여 작동하지 않습니다. `openssl`을 사용한 명령 실행 방법은 다음과 같습니다.
   - `openssl`로 대화형 세션을 시작합니다.

```bash
openssl s_client -connect chnode1.marsnet.local:9281
```
```response
CONNECTED(00000003)
depth=0 CN = chnode1
verify error:num=20:unable to get local issuer certificate
verify return:1
depth=0 CN = chnode1
verify error:num=21:unable to verify the first certificate
verify return:1
---
Certificate chain
 0 s:CN = chnode1
   i:CN = marsnet.local CA
---
Server certificate
-----BEGIN CERTIFICATE-----
MIICtDCCAZwCFD321grxU3G5pf6hjitf2u7vkusYMA0GCSqGSIb3DQEBCwUAMBsx
...
```

- openssl 세션에서 4LW 명령을 전송합니다.

```bash
mntr
```
```response
---
Post-Handshake New Session Ticket arrived:
SSL-Session:
    Protocol  : TLSv1.3
...
read R BLOCK
zk_version      v22.7.3.5-stable-e140b8b5f3a5b660b6b576747063fd040f583cf3
zk_avg_latency  0

# highlight-next-line
zk_max_latency  4087
zk_min_latency  0
zk_packets_received     4565774
zk_packets_sent 4565773
zk_num_alive_connections        2
zk_outstanding_requests 0

# highlight-next-line
zk_server_state leader
zk_znode_count  1087
zk_watch_count  26
zk_ephemerals_count     12
zk_approximate_data_size        426062
zk_key_arena_size       258048
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   187
zk_max_file_descriptor_count    18446744073709551615

# highlight-next-line
zk_followers    2
zk_synced_followers     1
closed
```

4. `--secure` 플래그와 SSL 포트를 사용하여 ClickHouse 클라이언트를 시작합니다:
```bash
root@chnode1:/etc/clickhouse-server# clickhouse-client --user default --password ClickHouse123! --port 9440 --secure --host chnode1.marsnet.local
ClickHouse client version 22.3.3.44 (official build).
Connecting to chnode1.marsnet.local:9440 as user default.
Connected to ClickHouse server version 22.3.3 revision 54455.

clickhouse :)
```

5. `https` 인터페이스를 사용하여 Play UI에 로그인합니다: `https://chnode1.marsnet.local:8443/play`.

    <Image img={configuringSsl01} alt="SSL 구성하기" size="md" border />

    :::note
    브라우저는 신뢰할 수 없는 인증서가 표시됩니다. 워크스테이션에서 접근하고 클라이언트 컴퓨터의 루트 CA 저장소에 인증서가 없기 때문입니다.
    공공 기관 또는 기업 CA에서 발급된 인증서를 사용할 때는 신뢰할 수 있는 것으로 표시되어야 합니다.
    :::

6. 복제 테이블을 생성합니다:
```sql
clickhouse :) CREATE TABLE repl_table ON CLUSTER cluster_1S_2R
            (
                id UInt64,
                column1 Date,
                column2 String
            )
            ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/default/repl_table', '{replica}' )
            ORDER BY (id);
```

```response
┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

7. `chnode1`에서 몇 개의 행을 추가합니다:
```sql
INSERT INTO repl_table
(id, column1, column2)
VALUES
(1,'2022-04-01','abc'),
(2,'2022-04-02','def');
```

8. `chnode2`에서 행을 보면서 복제를 확인합니다:
```sql
SELECT * FROM repl_table
```

```response
┌─id─┬────column1─┬─column2─┐
│  1 │ 2022-04-01 │ abc     │
│  2 │ 2022-04-02 │ def     │
└────┴────────────┴─────────┘
```

## 요약 {#summary}

이 문서에서는 SSL/TLS로 구성된 ClickHouse 환경 구축에 중점을 두었습니다. 설정은 프로덕션 환경의 다양한 요구 사항에 따라 달라질 수 있으며, 예를 들어 인증서 검증 수준, 프로토콜, 암호 등의 차이가 있을 수 있습니다. 그러나 이제 안전한 연결을 구성하고 구현하는 단계에 대한 명확한 이해를 갖추게 되었습니다.
