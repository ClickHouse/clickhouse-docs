---
description: 'ClickHouse의 SSH 인터페이스에 대한 문서'
keywords: ['client', 'ssh', 'putty']
sidebar_label: 'SSH 인터페이스'
sidebar_position: 60
slug: /interfaces/ssh
title: 'SSH 인터페이스'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# PTY를 지원하는 SSH 인터페이스 \{#ssh-interface-with-pty\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

## 머리말 \{#preface\}

ClickHouse 서버에는 SSH 프로토콜을 통해 직접 접속할 수 있습니다. 임의의 클라이언트를 사용할 수 있습니다.

[SSH 키로 식별되는 데이터베이스 사용자](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)를 생성한 후:

```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

이 키로 ClickHouse 서버에 연결하면 clickhouse-client의 대화형 세션이 실행되는 의사 터미널(PTY)이 열립니다.

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022
ClickHouse embedded version 25.1.1.1.

ip-10-1-13-116.us-west-2.compute.internal :) SELECT 1;

SELECT 1

Query id: cdd91b7f-215b-4537-b7df-86d19bf63f64

   ┌─1─┐
1. │ 1 │
   └───┘

1 row in set. Elapsed: 0.002 sec.
```

SSH(비대화형 모드)를 통한 명령 실행도 지원됩니다:

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```

## 서버 설정 \{#server-configuration\}

SSH 서버 기능을 사용하려면 `config.xml`에서 다음 섹션의 주석을 해제하거나 추가해야 합니다:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

호스트 키는 SSH 프로토콜의 필수 구성 요소입니다. 이 키의 공개 키 부분은 클라이언트 측의 `~/.ssh/known_hosts` 파일에 저장되며, 일반적으로 중간자(man-in-the-middle) 공격을 방지하는 데 사용됩니다. 서버에 처음 연결하면 아래와 같은 메시지가 표시됩니다:

```shell
The authenticity of host '[localhost]:9022 ([127.0.0.1]:9022)' can't be established.
RSA key fingerprint is SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

이는 사실상 다음과 같은 의미입니다: &quot;이 호스트의 공개 키를 기억하고 연결을 계속하시겠습니까?&quot;.

옵션을 전달하여 SSH 클라이언트가 호스트를 검증하지 않도록 설정할 수 있습니다:

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## 임베디드 클라이언트 구성 \{#configuring-embedded-client\}

일반적으로 사용하는 `clickhouse-client`와 마찬가지로 임베디드 클라이언트에도 옵션을 전달할 수 있지만, 몇 가지 제약 사항이 있습니다.
SSH 프로토콜이므로 대상 호스트에 매개변수를 전달하는 유일한 방법은 환경 변수를 사용하는 것입니다.

예를 들어 `format`을 설정하려면 다음과 같이 하면 됩니다:

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

이 방식으로 사용자 수준의 모든 설정을 변경할 수 있으며, 추가로 대부분의 일반적인 `clickhouse-client` 옵션을 지정할 수 있습니다 (이 구성에서는 의미가 없는 옵션은 제외됩니다).

중요:

`query` 옵션과 SSH 명령이 모두 전달된 경우, SSH 명령은 실행할 쿼리 목록에 추가됩니다:

```bash
ubuntu ip-10-1-13-116@~$ ssh -o SetEnv="format=Pretty query=\"SELECT 2;\"" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 2 ┃
   ┡━━━┩
1. │ 2 │
   └───┘
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```
