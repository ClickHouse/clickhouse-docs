---
slug: /guides/sre/configuring-tls-acme-client
sidebar_label: 'ACME를 통한 자동 TLS 프로비저닝 구성'
sidebar_position: 20
title: 'ACME 클라이언트 구성'
description: '이 가이드는 ClickHouse에서 연결을 검증하기 위해 OpenSSL 인증서를 사용하도록 설정하는 데 필요한 간단하고 최소한의 설정 방법을 설명합니다.'
keywords: ['ACME 구성', 'TLS 설정', 'OpenSSL 인증서', '보안 연결', 'SRE 가이드', 'Let`s Encrypt']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ACME를 통한 TLS 자동 프로비저닝 구성 \{#configuring-automatic-tls-provisioning-via-acme\}

<ExperimentalBadge/>

<SelfManaged />

이 가이드는 ClickHouse가 [ACME](https://en.wikipedia.org/wiki/Automatic_Certificate_Management_Environment) 프로토콜( [RFC8555](https://www.rfc-editor.org/rfc/rfc8555)에서 설명됨)을 사용하도록 구성하는 방법을 설명합니다.
ACME 지원을 사용하면 ClickHouse는 [Let's Encrypt](https://letsencrypt.org/) 또는 [ZeroSSL](https://zerossl.com/)과 같은 인증서 발급 기관으로부터 인증서를 자동으로 발급·갱신할 수 있습니다.
TLS 암호화는 클라이언트와 ClickHouse 서버 간 전송 중인 데이터를 보호하여 민감한 쿼리와 결과에 대한 도청을 방지합니다.

## 개요 \{#overview\}

ACME 프로토콜은 [Let&#39;s Encrypt](https://letsencrypt.org/) 또는 [ZeroSSL](https://zerossl.com/)과 같은 서비스와 함께 자동으로 인증서를 갱신하는 절차를 정의합니다. 간단히 말해, 인증서 요청자인 ClickHouse는 인증서를 발급받기 위해 미리 정의된 챌린지 유형을 통해 도메인 소유권을 확인해야 합니다.

ACME를 활성화하려면 HTTP 및 HTTPS 포트와 함께 `acme` 블록을 구성합니다:

```xml
<http_port>80</http_port>
<https_port>443</https_port>

<acme>
    <email>valid_email@example.com</email>
    <terms_of_service_agreed>true</terms_of_service_agreed>
    <domains>
        <domain>example.com</domain>
    </domains>
</acme>
```

HTTP 포트는 도메인 검증 동안 ACME `HTTP-01` 챌린지(챌린지 유형에 대해서는 [여기](https://letsencrypt.org/docs/challenge-types/) 참고) 요청을 처리합니다. 검증이 완료되어 인증서가 발급되면, HTTPS 포트가 획득한 인증서를 사용하여 암호화된 트래픽을 제공합니다.

HTTP 포트는 서버 자체에서 반드시 80일 필요는 없으며, `nftables` 또는 유사한 도구를 사용해 다른 포트로 재매핑할 수 있습니다. `HTTP-01` 챌린지에 대해 허용되는 포트에 대해서는 ACME 제공자의 문서를 확인하십시오.

`acme` 블록에서는 계정 생성을 위한 `email`을 정의하고, ACME 서비스 이용 약관에 동의합니다.
이후에는 도메인 목록만 지정하면 됩니다.


### 현재 제한 사항 \{#current-limitations\}

- `HTTP-01` challenge 유형만 지원합니다.
- `RSA 2048` 키만 지원합니다.
- rate limiting은 지원되지 않습니다.

## 구성 매개변수 \{#configuration-parameters\}

`acme` 섹션에서 사용 가능한 구성 옵션은 다음과 같습니다.

| Parameter                             | Default value | Description |
|--------------------------------------|---------------|-------------|
| `zookeeper_path`                     | `/clickhouse/acme`   | ClickHouse 노드 간 ACME 계정 데이터, 인증서 및 조정 상태를 저장하는 데 사용되는 ZooKeeper 경로입니다. |
| `directory_url`                     | `https://acme-v02.api.letsencrypt.org/directory` | 인증서 발급에 사용되는 ACME 디렉터리 엔드포인트입니다. 기본값은 Let’s Encrypt 프로덕션 서버입니다. |
| `email`                              |              | ACME 계정을 생성하고 관리하는 데 사용되는 이메일 주소입니다. ACME 제공자는 만료 알림 및 중요한 업데이트를 위해 이 주소를 사용할 수 있습니다. |
| `terms_of_service_agreed`            | `false`       | ACME 제공자의 이용 약관에 동의했는지를 나타냅니다. ACME를 활성화하려면 `true`로 설정해야 합니다. |
| `domains`                            |              | TLS 인증서를 발급할 도메인 이름 목록입니다. 각 도메인은 `<domain>` 항목으로 지정합니다. |
| `refresh_certificates_before`        | `2592000` (1개월, 초 단위)         | 인증서 만료 전에 ClickHouse가 인증서 갱신을 시도하는 시점입니다. |
| `refresh_certificates_task_interval` | `3600` (1시간, 초 단위)          | ClickHouse가 인증서 갱신 필요 여부를 확인하는 주기입니다. |

이 구성은 기본적으로 Let’s Encrypt 프로덕션 디렉터리를 사용합니다. 잘못된 구성으로 인해 요청 QUOTA 제한에 도달하는 것을 피하기 위해, 먼저 [스테이징(staging) 디렉터리](https://letsencrypt.org/docs/staging-environment/)로 인증서 발급 과정을 테스트할 것을 권장합니다.

# 관리 \{#administration\}

## 초기 배포 \{#initial-deployment\}

여러 레플리카가 있는 클러스터에서 ACME 클라이언트를 활성화하는 경우, 최초 인증서 발급 시 추가적인 주의가 필요합니다.

ACME가 활성화된 상태로 가장 먼저 시작되는 레플리카는 즉시 ACME order를 생성하고 HTTP-01 챌린지 검증을 수행하려고 시도합니다. 그 시점에 일부 레플리카만 트래픽을 처리하고 있는 경우, 다른 레플리카가 검증 요청에 응답할 수 없으므로 챌린지가 실패할 가능성이 높습니다.

가능하다면, 일시적으로 트래픽을 하나의 레플리카로만 라우팅하도록 구성(예: DNS 레코드 조정)하여 해당 레플리카가 초기 인증서 발급을 완료하도록 하는 것이 좋습니다. 인증서가 성공적으로 발급되어 Keeper에 저장된 이후에는 나머지 레플리카에서 ACME를 활성화할 수 있습니다. 이 경우 나머지 레플리카는 기존 인증서를 자동으로 재사용하고 이후 갱신에도 참여합니다.

트래픽을 단일 레플리카로 라우팅하는 것이 불가능하다면, 다른 방법으로는 ACME 클라이언트를 활성화하기 전에 기존 인증서와 개인 키를 Keeper에 수동으로 업로드하는 방식이 있습니다. 이렇게 하면 초기 검증 단계를 피할 수 있고, 모든 레플리카가 이미 유효한 인증서를 가진 상태에서 시작할 수 있습니다.

초기 인증서를 발급받거나 가져온 이후에는, 모든 레플리카가 이미 ACME 클라이언트를 실행 중이며 Keeper를 통해 상태를 공유하고 있으므로 인증서 갱신에 별도의 처리가 필요하지 않습니다.

## Keeper 데이터 구조 \{#keeper-data-structure\}

```text
/clickhouse/acme
└── <acme-directory-host>
    ├── account_private_key          # ACME account private key (PEM)
    ├── challenges                   # Active HTTP-01 challenge state
    └── domains
        └── <domain-name>
            ├── certificate          # Issued TLS certificate (PEM)
            └── private_key          # Domain private key (PEM)
```


## 다른 ACME 클라이언트에서 마이그레이션 \{#migrating-from-other-acme-clients\}

현재 사용 중인 TLS 인증서와 키를 Keeper로 이전하여 마이그레이션을 더 쉽게 할 수 있습니다.
현재 서버는 `RSA 2048` 키만 지원합니다.

`certbot`에서 마이그레이션하고 `/etc/letsencrypt/live` 디렉터리를 사용한다고 가정하면, 다음과 같은 명령어를 사용할 수 있습니다:

```bash
DOMAIN=example.com
CERT_DIR=/etc/letsencrypt/live/$DOMAIN
ZK_BASE=/clickhouse/acme/acme-v02.api.letsencrypt.org/domains/$DOMAIN

clickhouse keeper-client -q "create '/clickhouse' ''"
clickhouse keeper-client -q "create '/clickhouse/acme' ''"
clickhouse keeper-client -q "create '/clickhouse/acme/acme-v02.api.letsencrypt.org' ''"
clickhouse keeper-client -q "create '/clickhouse/acme/acme-v02.api.letsencrypt.org/domains' ''"
clickhouse keeper-client -q "create '$ZK_BASE' ''"

clickhouse keeper-client -q "create '$ZK_BASE/certificate' \"$(cat $CERT_DIR/fullchain.pem)\""
clickhouse keeper-client -q "set '$ZK_BASE/certificate' \"$(cat $CERT_DIR/fullchain.pem)\""

clickhouse keeper-client -q "create '$ZK_BASE/private_key' \"$(cat $CERT_DIR/privkey.pem)\""
clickhouse keeper-client -q "set '$ZK_BASE/private_key' \"$(cat $CERT_DIR/privkey.pem)\""
```
