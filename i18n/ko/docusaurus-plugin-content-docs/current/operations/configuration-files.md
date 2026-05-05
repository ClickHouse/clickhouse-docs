---
description: '이 페이지에서는 ClickHouse 서버를 XML 또는 YAML 구문의 설정 파일로 구성하는 방법을 설명합니다.'
sidebar_label: '설정 파일'
sidebar_position: 50
slug: /operations/configuration-files
title: '설정 파일'
doc_type: 'guide'
---

:::note
XML 기반 SETTINGS PROFILE(설정 프로필)과 설정 파일은 ClickHouse Cloud에서 지원되지 않습니다. 따라서 ClickHouse Cloud에서는 `config.xml` 파일이 존재하지 않습니다. 대신 SETTINGS PROFILE을 통해 설정을 관리하기 위해 SQL 명령을 사용해야 합니다.

자세한 내용은 ["설정 구성"](/manage/settings)을 참조하십시오.
:::

ClickHouse 서버는 XML 또는 YAML 구문의 설정 파일로 구성할 수 있습니다.
대부분의 설치 유형에서 ClickHouse 서버는 기본 설정 파일인 `/etc/clickhouse-server/config.xml`을 사용하여 실행되지만, 서버 시작 시 명령줄 옵션 `--config-file` 또는 `-C`를 사용해 설정 파일의 위치를 수동으로 지정할 수도 있습니다.
추가 설정 파일은 기본 설정 파일을 기준으로 하는 `config.d/` 디렉터리에 둘 수 있으며, 예를 들어 `/etc/clickhouse-server/config.d/` 디렉터리에 둘 수 있습니다.
이 디렉터리의 파일과 기본 설정 파일은 ClickHouse 서버에 설정이 적용되기 전에 전처리 단계에서 병합됩니다.
설정 파일은 알파벳 순서대로 병합됩니다.
업데이트를 단순화하고 모듈화를 개선하기 위해 기본 `config.xml` 파일은 수정하지 않고 유지하고, 추가 사용자 정의는 `config.d/`에 두는 것이 모범 사례입니다.
ClickHouse Keeper 설정은 `/etc/clickhouse-keeper/keeper_config.xml`에 있습니다.
마찬가지로 Keeper용 추가 설정 파일은 `/etc/clickhouse-keeper/keeper_config.d/`에 배치해야 합니다.

XML과 YAML 설정 파일을 함께 사용하는 것도 가능합니다. 예를 들어 기본 설정 파일로 `config.xml`을 사용하고, 추가 설정 파일로 `config.d/network.xml`, `config.d/timezone.yaml`, `config.d/keeper.yaml`을 사용할 수 있습니다.
하나의 설정 파일 안에서 XML과 YAML을 섞는 것은 지원되지 않습니다.
XML 설정 파일은 최상위 태그로 `<clickhouse>...</clickhouse>`를 사용해야 합니다.
YAML 설정 파일에서는 `clickhouse:`가 선택 사항이며, 없을 경우 파서가 이를 자동으로 삽입합니다.



## 설정 병합 \{#merging\}

두 개의 설정 파일(일반적으로 기본 설정 파일과 `config.d/`의 다른 설정 파일)은 다음과 같이 병합됩니다.

* 노드(즉, 요소로 이어지는 경로)가 두 파일 모두에 나타나고 `replace` 또는 `remove` 속성이 없으면 병합된 설정 파일에 포함되며, 두 노드의 하위 노드가 모두 포함되고 하위 노드는 재귀적으로 병합됩니다.
* 두 노드 중 하나에 `replace` 속성이 있으면, 해당 노드는 병합된 설정 파일에 포함되지만 `replace` 속성이 있는 노드의 하위 노드만 포함됩니다.
* 두 노드 중 하나에 `remove` 속성이 있으면, 해당 노드는 병합된 설정 파일에 포함되지 않습니다(이미 존재하는 경우 삭제됩니다).

예를 들어, 다음과 같은 두 설정 파일이 있다고 가정합니다:

```xml title="config.xml"
<clickhouse>
    <config_a>
        <setting_1>1</setting_1>
    </config_a>
    <config_b>
        <setting_2>2</setting_2>
    </config_b>
    <config_c>
        <setting_3>3</setting_3>
    </config_c>
</clickhouse>
```

및

```xml title="config.d/other_config.xml"
<clickhouse>
    <config_a>
        <setting_4>4</setting_4>
    </config_a>
    <config_b replace="replace">
        <setting_5>5</setting_5>
    </config_b>
    <config_c remove="remove">
        <setting_6>6</setting_6>
    </config_c>
</clickhouse>
```

병합 결과 생성된 구성 파일은 다음과 같습니다.

```xml
<clickhouse>
    <config_a>
        <setting_1>1</setting_1>
        <setting_4>4</setting_4>
    </config_a>
    <config_b>
        <setting_5>5</setting_5>
    </config_b>
</clickhouse>
```

### 환경 변수와 ZooKeeper 노드를 사용한 치환 \{#from_env_zk\}

요소의 값을 환경 변수의 값으로 치환하도록 지정하려면 `from_env` 속성을 사용할 수 있습니다.

예를 들어, 환경 변수 `$MAX_QUERY_SIZE = 150000`이 설정되어 있는 경우:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

최종 설정은 다음과 같습니다:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

`from_zk`(ZooKeeper 노드)를 사용하여 동일하게 구성할 수도 있습니다:

```xml
<clickhouse>
    <postgresql_port from_zk="/zk_configs/postgresql_port"/>
</clickhouse>
```


```shell
# clickhouse-keeper-client
/ :) touch /zk_configs
/ :) create /zk_configs/postgresql_port "9005"
/ :) get /zk_configs/postgresql_port
9005
```

결과적으로 다음과 같은 설정이 구성됩니다:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### 기본값 \{#default-values\}

`from_env` 또는 `from_zk` 속성이 있는 요소에는 추가로 `replace="1"` 속성을 지정할 수 있습니다(이 `replace` 속성은 `from_env`/`from_zk`보다 먼저 나타나야 합니다).
이 경우 해당 요소에서 기본값을 정의할 수 있습니다.
환경 변수나 ZooKeeper 노드의 값이 설정되어 있으면 그 값을 사용하고, 설정되어 있지 않으면 기본값을 사용합니다.

이전 예제를 그대로 사용하되, `MAX_QUERY_SIZE`가 설정되어 있지 않다고 가정합니다:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

최종 구성은 다음과 같습니다:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```


## 파일 내용으로 대체하기 \{#substitution-with-file-content\}

설정의 일부를 파일 내용으로 대체하는 것도 가능합니다. 이는 두 가지 방식으로 수행할 수 있습니다:

* *값 대체(Substituting Values)*: 요소에 `incl` 속성이 있으면 해당 값은 참조된 파일의 내용으로 대체됩니다. 기본적으로 대체에 사용되는 파일 경로는 `/etc/metrika.xml`입니다. 이는 서버 설정의 [`include_from`](../operations/server-configuration-parameters/settings.md#include_from) 요소에서 변경할 수 있습니다. 대체 값은 이 파일의 `/clickhouse/substitution_name` 요소에 지정합니다. `incl`에 지정된 대체 항목이 존재하지 않으면 로그에 기록됩니다. 누락된 대체 항목에 대해 ClickHouse가 로그를 남기지 않도록 하려면 `optional="true"` 속성을 지정하십시오(예: [macros](../operations/server-configuration-parameters/settings.md#macros) 설정).
* *요소 대체(Substituting elements)*: 전체 요소를 대체 항목으로 교체하려면 요소 이름으로 `include`를 사용하십시오. 요소 이름 `include`는 `from_zk = "/path/to/node"` 속성과 함께 사용할 수 있습니다. 이 경우 요소 값은 `/path/to/node`에 있는 ZooKeeper 노드의 내용으로 대체됩니다. 또한 전체 XML 하위 트리를 하나의 ZooKeeper 노드로 저장한 경우에도 동일하게 동작하며, 해당 하위 트리 전체가 원본 요소에 완전히 삽입됩니다.

아래에 예시가 나와 있습니다:

```xml
<clickhouse>
    <!-- Appends XML subtree found at `/profiles-in-zookeeper` ZK path to `<profiles>` element. -->
    <profiles from_zk="/profiles-in-zookeeper" />

    <users>
        <!-- Replaces `include` element with the subtree found at `/users-in-zookeeper` ZK path. -->
        <include from_zk="/users-in-zookeeper" />
        <include from_zk="/other-users-in-zookeeper" />
    </users>
</clickhouse>
```

치환할 내용을 기존 설정에 단순히 추가하는 대신 병합하려면 `merge="true"` 속성을 사용할 수 있습니다. 예를 들어: `<include from_zk="/some_path" merge="true">`. 이 경우 기존 설정은 치환 내용과 병합되며, 기존 설정의 설정값은 치환 내용의 값으로 대체됩니다.


## 구성을 암호화하고 숨기기 \{#encryption\}

대칭 암호화를 사용하여 구성 요소를 암호화할 수 있습니다. 예를 들어, 평문 비밀번호나 개인 키를 암호화할 수 있습니다.
이를 위해 먼저 [암호화 코덱(encryption codec)](../sql-reference/statements/create/table.md#encryption-codecs)을 설정한 다음, 암호화할 요소에 `encrypted_by` 속성을 추가하고 그 값으로 사용할 암호화 코덱의 이름을 지정합니다.

`from_zk`, `from_env`, `incl` 속성이나 `include` 요소와 달리, 전처리된 파일에서는 값 대체(즉, 암호화된 값의 복호화)가 수행되지 않습니다.
복호화는 서버 프로세스에서 런타임에만 수행됩니다.

예를 들면 다음과 같습니다.

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex>00112233445566778899aabbccddeeff</key_hex>
        </aes_128_gcm_siv>
    </encryption_codecs>

    <interserver_http_credentials>
        <user>admin</user>
        <password encrypted_by="AES_128_GCM_SIV">961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85</password>
    </interserver_http_credentials>

</clickhouse>
```

[`from_env`](#from_env_zk) 및 [`from_zk`](#from_env_zk) 속성은 `encryption_codecs`에도 적용할 수 있습니다.

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_env="CLICKHOUSE_KEY_HEX"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

    <interserver_http_credentials>
        <user>admin</user>
        <password encrypted_by="AES_128_GCM_SIV">961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85</password>
    </interserver_http_credentials>

</clickhouse>
```

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

    <interserver_http_credentials>
        <user>admin</user>
        <password encrypted_by="AES_128_GCM_SIV">961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85</password>
    </interserver_http_credentials>

</clickhouse>
```

암호화 키와 암호화된 값은 두 구성 파일 중 어느 것에서나 정의할 수 있습니다.

예시 `config.xml`은 다음과 같습니다.

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

`users.xml` 예시는 다음과 같습니다.

```xml
<clickhouse>

    <users>
        <test_user>
            <password encrypted_by="AES_128_GCM_SIV">96280000000D000000000030D4632962295D46C6FA4ABF007CCEC9C1D0E19DA5AF719C1D9A46C446</password>
            <profile>default</profile>
        </test_user>
    </users>

</clickhouse>
```

값을 암호화하려면 예제 프로그램인 `encrypt_decrypt`를 사용할 수 있습니다:

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

구성 항목을 암호화하더라도, 암호화된 항목은 전처리된 구성 파일에 그대로 나타납니다.
이것이 ClickHouse 배포에서 문제가 되는 경우, 두 가지 대안이 있습니다. 전처리된 파일의 권한을 600으로 설정하거나 `hide_in_preprocessed` 속성을 사용하십시오.

예를 들어:

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```


## 사용자 설정 \{#user-settings\}

`config.xml` 파일에서 사용자 설정, 프로필, QUOTA에 대한 별도의 설정 파일을 지정할 수 있습니다. 이 설정 파일에 대한 상대 경로는 `users_config` 요소에 설정합니다. 기본값은 `users.xml`입니다. `users_config`를 생략하면 사용자 설정, 프로필, QUOTA는 `config.xml` 안에 직접 지정됩니다.

사용자 설정은 `config.xml` 및 `config.d/`와 마찬가지로 별도의 파일로 분리할 수 있습니다.
디렉터리 이름은 `.xml` 접미사를 제거한 `users_config` 설정 값에 `.d`를 이어 붙여서 정의합니다.
`users_config`의 기본값이 `users.xml`이므로, 기본적으로 `users.d` 디렉터리가 사용됩니다.

설정 파일은 먼저 설정을 고려하여 [병합](#merging)된 후, 그다음에 include 지시문이 처리된다는 점에 유의하십시오.



## XML 예시 \{#example\}

예를 들어, 다음과 같이 각 사용자마다 별도의 설정 파일을 둘 수 있습니다.

```bash
$ cat /etc/clickhouse-server/users.d/alice.xml
```

```xml
<clickhouse>
    <users>
      <alice>
          <profile>analytics</profile>
            <networks>
                  <ip>::/0</ip>
            </networks>
          <password_sha256_hex>...</password_sha256_hex>
          <quota>analytics</quota>
      </alice>
    </users>
</clickhouse>
```


## YAML 예시 \{#example-1\}

여기에서 YAML로 작성된 기본 구성을 확인할 수 있습니다: [`config.yaml.example`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example).

ClickHouse 구성에서 YAML 형식과 XML 형식 사이에는 몇 가지 차이점이 있습니다.
YAML 형식으로 구성을 작성하는 요령은 아래에 정리되어 있습니다.

텍스트 값을 갖는 XML 태그는 YAML의 키-값 쌍으로 표현됩니다.

```yaml
key: value
```

해당하는 XML:

```xml
<key>value</key>
```

중첩된 XML 노드는 YAML 맵으로 표현됩니다:

```yaml
map_key:
  key1: val1
  key2: val2
  key3: val3
```

해당하는 XML:

```xml
<map_key>
    <key1>val1</key1>
    <key2>val2</key2>
    <key3>val3</key3>
</map_key>
```

동일한 XML 태그를 여러 번 생성하려면 YAML 시퀀스를 사용하십시오:

```yaml
seq_key:
  - val1
  - val2
  - key1: val3
  - map:
      key2: val4
      key3: val5
```

해당 XML:

```xml
<seq_key>val1</seq_key>
<seq_key>val2</seq_key>
<seq_key>
    <key1>val3</key1>
</seq_key>
<seq_key>
    <map>
        <key2>val4</key2>
        <key3>val5</key3>
    </map>
</seq_key>
```

XML 속성을 지정하려면 앞에 `@` 접두사가 붙은 속성 키를 사용할 수 있습니다. `@`는 YAML 표준에서 예약되어 있으므로 반드시 쌍따옴표로 감싸야 합니다:

```yaml
map:
  "@attr1": value1
  "@attr2": value2
  key: 123
```

해당 XML:

```xml
<map attr1="value1" attr2="value2">
    <key>123</key>
</map>
```

또한 YAML 시퀀스에서 속성을 사용할 수도 있습니다.

```yaml
seq:
  - "@attr1": value1
  - "@attr2": value2
  - 123
  - abc
```

대응하는 XML:

```xml
<seq attr1="value1" attr2="value2">123</seq>
<seq attr1="value1" attr2="value2">abc</seq>
```

위에서 설명한 구문만으로는 XML 속성이 있는 XML 텍스트 노드를 YAML로 표현할 수 없습니다. 이러한 특수한 상황에서는 `#text` 속성 키를 사용하여 표현할 수 있습니다:

```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

이에 해당하는 XML:

```xml
<map_key attr1="value1">value2</map>
```


## 구현 세부 사항 \{#implementation-details\}

서버는 시작될 때마다 각 설정 파일에 대해 `file-preprocessed.xml` 파일도 생성합니다. 이 파일에는 모든 치환과 재정의가 완료된 설정이 포함되어 있으며, 정보 제공용으로 사용됩니다. 설정 파일에서 ZooKeeper 치환을 사용했지만 서버 시작 시 ZooKeeper를 사용할 수 없는 경우, 서버는 이 사전 처리된 파일에서 설정을 로드합니다.

서버는 설정 파일뿐 아니라 치환과 재정의를 수행할 때 사용된 파일과 ZooKeeper 노드의 변경 사항을 추적하고, 사용자와 클러스터에 대한 설정을 자동으로 다시 로드합니다. 이를 통해 서버를 재시작하지 않고도 클러스터, 사용자 및 해당 설정을 수정할 수 있습니다.
