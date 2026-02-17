---
slug: /guides/sre/tls/configuring-tls
sidebar_label: 'TLS 구성'
sidebar_position: 20
title: 'TLS 구성'
description: '이 가이드는 ClickHouse가 연결을 검증하기 위해 OpenSSL 인증서를 사용하도록 구성하는 간단하고 최소한의 설정 방법을 제공합니다.'
keywords: ['SSL 구성', 'TLS 설정', 'OpenSSL 인증서', '보안 연결', 'SRE 가이드']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';


# TLS 구성 \{#configuring-tls\}

<SelfManaged />

이 가이드는 ClickHouse에서 OpenSSL 인증서를 사용해 연결을 검증하도록 구성하기 위한 간단한 최소 설정을 제공합니다. 이 데모에서는 적절한 설정으로 연결을 수행할 수 있도록 노드 인증서와 함께 자체 서명 인증 기관(CA) 인증서와 키를 생성합니다.

:::note
TLS 구현은 복잡하며, 완전히 안전하고 견고한 배포를 보장하려면 고려해야 할 옵션이 매우 많습니다. 이 문서는 기본 TLS 구성 예제를 다루는 기초 튜토리얼입니다. 조직에 적합한 올바른 인증서를 발급·구성하기 위해서는 PKI/보안 팀과 상의하십시오.

입문용 개요로 [인증서 사용에 대한 기초 튜토리얼](https://ubuntu.com/server/docs/security-certificates)을 검토하십시오.
:::

## 1. ClickHouse 배포 생성 \{#1-create-a-clickhouse-deployment\}

이 가이드는 Ubuntu 20.04 환경에서 DEB 패키지(apt 사용)를 통해 다음 호스트들에 ClickHouse를 설치한 구성을 기준으로 작성되었습니다. 도메인은 `marsnet.local`입니다.

|Host |IP Address|
|--------|-------------|
|`chnode1` |192.168.1.221|
|`chnode2` |192.168.1.222|
|`chnode3` |192.168.1.223|

:::note
ClickHouse 설치 방법에 대한 자세한 내용은 [빠른 시작](/getting-started/install/install.mdx)을 참조하십시오.
:::

## 2. TLS 인증서 생성 \{#2-create-tls-certificates\}

:::note
자체 서명(self-signed) 인증서 사용은 데모용으로만 허용되며, 운영 환경에서는 사용하면 안 됩니다. 운영 환경에서는 조직에서 서명하고, 설정에서 구성할 CA 체인을 사용해 검증할 수 있도록 인증서 요청을 생성해야 합니다. 다만 아래 단계는 설정을 구성하고 테스트하는 용도로 사용할 수 있으며, 이후 실제로 사용할 인증서로 교체할 수 있습니다.
:::

1. 새 CA에 사용할 키를 생성합니다:
    ```bash
    openssl genrsa -out marsnet_ca.key 2048
    ```

2. 새로운 자체 서명 CA 인증서를 생성합니다. 다음 명령은 CA 키를 사용해 다른 인증서를 서명하는 데 사용할 새 인증서를 생성합니다:
    ```bash
    openssl req -x509 -subj "/CN=marsnet.local CA" -nodes -key marsnet_ca.key -days 1095 -out marsnet_ca.crt
    ```

    :::note
    키와 CA 인증서는 클러스터 외부의 안전한 위치에 백업해야 합니다. 노드 인증서를 생성한 후에는 클러스터 노드에서 키를 삭제해야 합니다.
    :::

3. 새 CA 인증서의 내용을 확인합니다:
    ```bash
    openssl x509 -in marsnet_ca.crt -text
    ```

4. 각 노드에 대한 인증서 요청(CSR)과 키를 생성합니다:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1" -addext "subjectAltName = DNS:chnode1.marsnet.local,IP:192.168.1.221" -keyout chnode1.key -out chnode1.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode2" -addext "subjectAltName = DNS:chnode2.marsnet.local,IP:192.168.1.222" -keyout chnode2.key -out chnode2.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode3" -addext "subjectAltName = DNS:chnode3.marsnet.local,IP:192.168.1.223" -keyout chnode3.key -out chnode3.csr
    ```

5. CSR과 CA를 사용해 새 인증서와 키 쌍을 생성합니다:
    ```bash
    openssl x509 -req -in chnode1.csr -out chnode1.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode2.csr -out chnode2.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode3.csr -out chnode3.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    ```

6. 인증서의 subject와 issuer 정보를 확인합니다:
    ```bash
    openssl x509 -in chnode1.crt -text -noout
    ```

7. 새 인증서가 CA 인증서에 대해 검증되는지 확인합니다:
    ```bash
    openssl verify -CAfile marsnet_ca.crt chnode1.crt
    chnode1.crt: OK
    ```

## 3. 인증서와 키를 저장할 디렉터리 생성 및 구성 \{#3-create-and-configure-a-directory-to-store-certificates-and-keys\}

:::note
각 노드에서 수행해야 합니다. 각 호스트에 적절한 인증서와 키를 사용하십시오.
:::

1. 각 노드에서 ClickHouse가 액세스할 수 있는 디렉터리에 하위 디렉터리를 생성합니다. 기본 설정 디렉터리(예: `/etc/clickhouse-server`) 사용을 권장합니다.
    ```bash
    mkdir /etc/clickhouse-server/certs
    ```

2. 각 노드에 해당하는 CA 인증서, 노드 인증서와 키를 새 `certs` 디렉터리로 복사합니다.

3. ClickHouse가 인증서를 읽을 수 있도록 소유자와 권한을 변경합니다.
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

## 4. ClickHouse Keeper를 사용하여 기본 클러스터로 환경 구성하기 \{#4-configure-the-environment-with-basic-clusters-using-clickhouse-keeper\}

이 배포 환경에서 각 노드는 다음 ClickHouse Keeper 설정을 사용합니다. 각 서버는 고유한 `<server_id>` 값을 가집니다. (예: 노드 `chnode1`의 경우 `<server_id>1</server_id>` 등.)

:::note
ClickHouse Keeper에 권장되는 포트는 `9281`입니다. 다만, 이 포트가 이미 환경의 다른 애플리케이션에서 사용 중이라면 설정을 통해 다른 포트로 변경할 수 있습니다.

모든 옵션에 대한 자세한 설명은 https://clickhouse.com/docs/operations/clickhouse-keeper/ 를 참조하십시오.
:::

1. ClickHouse 서버 `config.xml`의 `<clickhouse>` 태그 안에 다음 내용을 추가합니다.

    :::note
    프로덕션 환경에서는 `config.d` 디렉터리 안에 별도의 `.xml` 설정 파일을 사용하는 것이 권장됩니다.
    자세한 내용은 https://clickhouse.com/docs/operations/configuration-files/ 를 참조하십시오.
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

2. 모든 노드에서 Keeper 설정의 주석을 해제하고 값을 수정한 다음 `<secure>` 플래그를 1로 설정합니다:
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

3. `chnode1`과 `chnode2`에 다음 클러스터 설정을 업데이트하여 추가합니다. `chnode3`는 ClickHouse Keeper 쿼럼에 사용됩니다.

    :::note
    이 구성에서는 하나의 예제 클러스터만 설정되어 있습니다. 테스트용 샘플 클러스터는 제거하거나 주석 처리해야 하며, 이미 존재하는 클러스터를 테스트 중이라면 포트를 수정하고 `<secure>` 옵션을 추가해야 합니다. 설치 시 또는 `users.xml` 파일에서 `default` 사용자의 비밀번호를 설정했다면 `<user` 및 `<password>`를 반드시 설정해야 합니다.
    :::

    다음 설정은 두 서버(각 노드당 하나)에 하나의 세그먼트와 두 개의 레플리카가 있는 클러스터를 생성합니다.
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

4. 테스트용 ReplicatedMergeTree 테이블을 생성할 수 있도록 매크로 값을 정의합니다. `chnode1`에서는:
    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
    ```

    `chnode2`에서는:
    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_2</replica>
    </macros>
    ```

## 5. ClickHouse 노드에서 TLS 인터페이스 구성 \{#5-configure-tls-interfaces-on-clickhouse-nodes\}

아래 설정은 ClickHouse 서버 `config.xml` 에서 구성합니다.

1.  배포의 표시용 이름을 설정합니다(선택 사항).
    ```xml
    <display_name>clickhouse</display_name>
    ```

2. ClickHouse가 외부 포트에서 수신 대기하도록 설정합니다.
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 각 노드에서 `https` 포트를 구성하고 `http` 포트를 비활성화합니다.
    ```xml
    <https_port>8443</https_port>
    <!--<http_port>8123</http_port>-->
    ```

4. 각 노드에서 ClickHouse Native 보안 TCP 포트를 구성하고 기본 암호화되지 않은 포트를 비활성화합니다.
    ```xml
    <tcp_port_secure>9440</tcp_port_secure>
    <!--<tcp_port>9000</tcp_port>-->
    ```

5. 각 노드에서 `interserver https` 포트를 구성하고 기본 암호화되지 않은 포트를 비활성화합니다.
    ```xml
    <interserver_https_port>9010</interserver_https_port>
    <!--<interserver_http_port>9009</interserver_http_port>-->
    ```

6. 인증서와 경로를 사용하여 OpenSSL을 구성합니다.

    :::note
    각 파일 이름과 경로는 구성 중인 노드에 맞게 업데이트해야 합니다.
    예를 들어 `chnode2` 호스트에서 구성할 때는 `<certificateFile>` 항목을 `chnode2.crt` 로 업데이트합니다.
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

    자세한 내용은 https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-openssl 를 참조하십시오.

7. 모든 노드에서 gRPC용 TLS를 구성합니다.
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

    자세한 내용은 https://clickhouse.com/docs/interfaces/grpc/ 를 참조하십시오.

8. 최소 한 개의 노드에서 ClickHouse 클라이언트가 자체 `config.xml` 파일(기본 위치는 `/etc/clickhouse-client/`)에서 TLS를 사용하여 연결하도록 구성합니다.
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

6. MySQL 및 PostgreSQL의 기본 에뮬레이션 포트를 비활성화합니다.
    ```xml
    <!--mysql_port>9004</mysql_port-->
    <!--postgresql_port>9005</postgresql_port-->
    ```

## 6. Testing \{#6-testing\}

1. 모든 노드를 하나씩 순차적으로 시작합니다:
   ```bash
   service clickhouse-server start
   ```

2. 보안 포트가 활성 상태이며 수신 대기(listen) 중인지 확인합니다. 각 노드에서 아래 예시와 유사하게 표시되어야 합니다:

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

   | ClickHouse Port | Description               |
   | --------------- | ------------------------- |
   | 8443            | https 인터페이스               |
   | 9010            | 서버 간 https 포트             |
   | 9281            | ClickHouse Keeper 보안 포트   |
   | 9440            | 보안 Native TCP 프로토콜        |
   | 9444            | ClickHouse Keeper Raft 포트 |

3. ClickHouse Keeper 상태를 확인합니다.
   일반적인 [4 letter word (4lW)](/guides/sre/keeper/index.md#four-letter-word-commands) 명령은 TLS 없이 `echo`만 사용하면 동작하지 않습니다. 아래는 `openssl`과 함께 해당 명령을 사용하는 방법입니다.
   * `openssl`로 대화형 세션을 시작합니다.

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

* OpenSSL 세션에서 4LW 명령을 전송하십시오.

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


4. `--secure` 플래그와 TLS 포트를 사용하여 ClickHouse 클라이언트를 시작합니다:
    ```bash
    root@chnode1:/etc/clickhouse-server# clickhouse-client --user default --password ClickHouse123! --port 9440 --secure --host chnode1.marsnet.local
    ClickHouse client version 22.3.3.44 (official build).
    Connecting to chnode1.marsnet.local:9440 as user default.
    Connected to ClickHouse server version 22.3.3 revision 54455.

    clickhouse :)
    ```

5. `https` 인터페이스인 `https://chnode1.marsnet.local:8443/play`를 사용하여 Play UI에 로그인합니다.

    <Image img={configuringSsl01} alt="TLS 구성" size="md" border />

    :::note
    워크스테이션에서 접속하고, 해당 인증서가 클라이언트 머신의 루트 CA 저장소에 포함되어 있지 않기 때문에 브라우저에 신뢰할 수 없는 인증서로 표시됩니다.
    공인 인증 기관 또는 엔터프라이즈 CA에서 발급된 인증서를 사용하는 경우, 신뢰된 인증서로 표시되어야 합니다.
    :::

6. 복제된 테이블(Replicated Table)을 생성합니다:
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

7. `chnode1`에 행 두 개를 추가합니다:
    ```sql
    INSERT INTO repl_table
    (id, column1, column2)
    VALUES
    (1,'2022-04-01','abc'),
    (2,'2022-04-02','def');
    ```

8. `chnode2`에서 행을 조회하여 복제를 검증합니다:
    ```sql
    SELECT * FROM repl_table
    ```

    ```response
    ┌─id─┬────column1─┬─column2─┐
    │  1 │ 2022-04-01 │ abc     │
    │  2 │ 2022-04-02 │ def     │
    └────┴────────────┴─────────┘
    ```

## 요약 \{#summary\}

이 문서에서는 ClickHouse 환경에서 TLS를 사용하도록 구성하는 방법에 중점을 두었습니다. 프로덕션 환경에서는 인증서 검증 수준, 프로토콜, 암호 스위트 등 요구 사항에 따라 설정이 달라집니다. 이제 TLS를 사용한 보안 연결을 구성하고 구현하는 데 필요한 단계들을 잘 이해했을 것입니다.