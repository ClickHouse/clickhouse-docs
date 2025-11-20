---
'description': '이 페이지에서는 ClickHouse 서버가 XML 또는 YAML 구문으로 구성 파일을 사용하여 어떻게 구성될 수 있는지를
  설명합니다.'
'sidebar_label': '구성 파일'
'sidebar_position': 50
'slug': '/operations/configuration-files'
'title': '구성 파일'
'doc_type': 'guide'
---

:::note
XML 기반 설정 프로필 및 구성 파일은 ClickHouse Cloud에서 지원되지 않습니다. 따라서 ClickHouse Cloud에서는 config.xml 파일을 찾을 수 없습니다. 대신, 설정 프로필을 통해 SQL 명령어를 사용하여 설정을 관리해야 합니다.

자세한 내용은 ["설정 구성"](/manage/settings)를 참조하십시오.
:::

ClickHouse 서버는 XML 또는 YAML 구문으로 된 구성 파일로 구성할 수 있습니다. 대부분의 설치 유형에서 ClickHouse 서버는 `/etc/clickhouse-server/config.xml`를 기본 구성 파일로 사용하지만, 서버 시작 시 명령 줄 옵션 `--config-file` 또는 `-C`를 사용하여 구성 파일의 위치를 수동으로 지정할 수도 있습니다. 추가 구성 파일은 주요 구성 파일을 기준으로 `config.d/` 디렉토리에 배치할 수 있으며, 예를 들어 `/etc/clickhouse-server/config.d/` 디렉토리에 배치할 수 있습니다. 이 디렉토리의 파일과 주요 구성은 ClickHouse 서버에서 구성 적용 전에 전처리 단계에서 병합됩니다. 구성 파일은 알파벳순으로 병합됩니다. 업데이트를 단순화하고 모듈화를 개선하기 위해 기본 `config.xml` 파일은 수정하지 않고 추가 커스터마이즈는 `config.d/`에 배치하는 것이 모범 사례입니다. ClickHouse keeper 구성은 `/etc/clickhouse-keeper/keeper_config.xml`에 저장됩니다. 마찬가지로 Keeper에 대한 추가 구성 파일은 `/etc/clickhouse-keeper/keeper_config.d/`에 배치해야 합니다.

XML 및 YAML 구성 파일을 혼합할 수 있으며, 예를 들어 주요 구성 파일 `config.xml`과 추가 구성 파일 `config.d/network.xml`, `config.d/timezone.yaml`, `config.d/keeper.yaml`을 가질 수 있습니다. 단일 구성 파일 내에서 XML과 YAML을 혼합하는 것은 지원되지 않습니다. XML 구성 파일은 최상위 태그로 `<clickhouse>...</clickhouse>`를 사용해야 합니다. YAML 구성 파일에서는 `clickhouse:`가 선택적이며, 없는 경우 파서는 자동으로 삽입합니다.

## 병합 구성 {#merging}

두 개의 구성 파일(주로 주요 구성 파일과 `config.d/`의 다른 구성 파일)은 다음과 같이 병합됩니다:

- 노드(즉, 요소로 가는 경로)가 두 파일에 모두 존재하고 속성 `replace` 또는 `remove`가 없으면 병합된 구성 파일에 포함되고, 두 노드의 자식이 포함되어 재귀적으로 병합됩니다.
- 두 노드 중 하나가 `replace` 속성을 포함하는 경우, 해당 노드는 병합된 구성 파일에 포함되지만, `replace` 속성이 있는 노드의 자식만 포함됩니다.
- 두 노드 중 하나가 `remove` 속성을 포함하는 경우, 해당 노드는 병합된 구성 파일에 포함되지 않습니다(이미 존재하는 경우 삭제됩니다).

예를 들어, 두 구성 파일이 주어진다면:

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

결과적으로 병합된 구성 파일은 다음과 같습니다:

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

### 환경 변수 및 ZooKeeper 노드에 의한 치환 {#from_env_zk}

요소의 값이 환경 변수의 값으로 대체되어야 한다고 지정하려면 `from_env` 속성을 사용할 수 있습니다.

예를 들어, 환경 변수 `$MAX_QUERY_SIZE = 150000`가 있는 경우:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

결과 구성은 다음과 같습니다:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

`from_zk`(ZooKeeper 노드)를 사용하여 같은 작업이 가능합니다:

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

결과적으로 다음 구성으로 이어집니다:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### 기본 값 {#default-values}

`from_env` 또는 `from_zk` 속성이 있는 요소는 추가적으로 `replace="1"` 속성을 가질 수 있습니다(후자는 `from_env`/`from_zk` 앞에 나타나야 합니다). 이 경우, 요소는 기본 값을 정의할 수 있습니다. 요소는 설정된 경우 환경 변수 또는 ZooKeeper 노드의 값을 취하고, 그렇지 않으면 기본 값을 취합니다.

이전 예제는 반복되지만, `MAX_QUERY_SIZE`가 설정되지 않은 경우를 가정합니다:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

결과적으로 구성은 다음과 같습니다:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

## 파일 내용으로의 치환 {#substitution-with-file-content}

구성의 일부를 파일 내용으로 대체하는 것도 가능합니다. 이는 두 가지 방법으로 수행할 수 있습니다:

- *값 치환*: 요소에 `incl` 속성이 있는 경우, 해당 값은 참조된 파일의 내용으로 대체됩니다. 기본적으로 치환 파일의 경로는 `/etc/metrika.xml`입니다. 이는 서버 구성의 [`include_from`](../operations/server-configuration-parameters/settings.md#include_from) 요소에서 변경할 수 있습니다. 치환 값은 이 파일의 `/clickhouse/substitution_name` 요소에 지정됩니다. `incl`에서 지정된 치환이 존재하지 않으면 로그에 기록됩니다. ClickHouse가 누락된 치환을 로그에 기록하지 않도록 하려면 속성 `optional="true"`를 지정하십시오(예: [매크로](../operations/server-configuration-parameters/settings.md#macros)에 대한 설정).
- *요소 치환*: 전체 요소를 치환으로 대체하려면 요소 이름으로 `include`를 사용합니다. 요소 이름 `include`는 `from_zk = "/path/to/node"` 속성과 결합할 수 있습니다. 이 경우, 요소 값은 `/path/to/node`의 ZooKeeper 노드 내용으로 대체됩니다. 전체 XML 서브트리를 ZooKeeper 노드로 저장하는 경우에도 완전히 소스 요소에 삽입됩니다.

아래에 이 예가 나와 있습니다:

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

치환 내용을 기존 구성과 병합하고 싶다면, 속성 `merge="true"`를 사용할 수 있습니다. 예를 들어: `<include from_zk="/some_path" merge="true">`. 이 경우 기존 구성은 치환의 내용과 병합되며 기존 구성 설정은 치환의 값으로 대체됩니다.

## 구성 암호화 및 숨기기 {#encryption}

대칭 암호화를 사용하여 구성 요소를 암호화할 수 있습니다. 예를 들어, 일반 텍스트 비밀번호 또는 개인 키입니다. 그렇게 하려면, 먼저 [암호화 코덱](../sql-reference/statements/create/table.md#encryption-codecs)을 구성한 다음, 암호화할 요소에 암호화 코덱의 이름을 값으로 갖는 `encrypted_by` 속성을 추가하십시오.

속성 `from_zk`, `from_env`, `incl` 또는 요소 `include`와 달리, 전처리된 파일에서 치환(즉, 암호화된 값의 복호화)은 수행되지 않습니다. 복호화는 서버 프로세스의 런타임에서만 발생합니다.

예를 들어:

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

속성 [`from_env`](#from_env_zk) 및 [`from_zk`](#from_env_zk)도 `encryption_codecs`에 적용될 수 있습니다:

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

암호화 키와 암호화된 값은 구성 파일에서 정의할 수 있습니다.

예시 `config.xml`은 다음과 같이 제공됩니다:

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

예시 `users.xml`은 다음과 같이 제공됩니다:

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

값을 암호화하려면 (예시) 프로그램 `encrypt_decrypt`를 사용할 수 있습니다:

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

암호화된 구성 요소가 있어도 암호화된 요소는 여전히 전처리된 구성 파일에 나타납니다. 이것이 ClickHouse 배포에 문제가 되는 경우 두 가지 대안이 있습니다: 전처리된 파일의 파일 권한을 600으로 설정하거나 `hide_in_preprocessed` 속성을 사용하십시오.

예를 들어:

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```

## 사용자 설정 {#user-settings}

`config.xml` 파일은 사용자 설정, 프로필 및 할당량을 위한 별도의 구성을 지정할 수 있습니다. 이 구성에 대한 상대 경로는 `users_config` 요소에 설정됩니다. 기본적으로 `users.xml`입니다. `users_config`가 생략되면 사용자 설정, 프로필 및 할당량은 `config.xml`에 직접 지정됩니다.

사용자 구성은 `config.xml` 및 `config.d/`와 유사하게 개별 파일로 분할할 수 있습니다. 디렉토리 이름은 `.xml` 접미사가 없이 `users_config` 설정으로 정의되며 `.d`와 연결됩니다. 기본적으로 `users.d` 디렉토리가 사용되며, `users_config`는 `users.xml`로 기본값을 가지게 됩니다.

구성 파일은 먼저 [병합](#merging)되어 설정을 고려하여 처리되며, 포함은 그 이후에 처리됩니다.

## XML 예시 {#example}

예를 들어, 각 사용자에 대해 다음과 같이 별도의 구성 파일을 가질 수 있습니다:

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

## YAML 예시 {#example-1}

여기에서 기본 구성은 YAML로 작성된 것을 볼 수 있습니다: [`config.yaml.example`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example).

ClickHouse 구성 측면에서 YAML과 XML 형식 간에는 몇 가지 차이점이 있습니다.
YAML 형식으로 구성 작성에 대한 팁은 아래에 제시되어 있습니다.

텍스트 값을 가진 XML 태그는 YAML 키-값 쌍으로 표현됩니다.

```yaml
key: value
```

해당 XML:

```xml
<key>value</key>
```

중첩 XML 노드는 YAML 맵으로 표현됩니다:

```yaml
map_key:
  key1: val1
  key2: val2
  key3: val3
```

해당 XML:

```xml
<map_key>
    <key1>val1</key1>
    <key2>val2</key2>
    <key3>val3</key3>
</map_key>
```

동일한 XML 태그를 여러 번 작성하려면 YAML 시퀀스를 사용하십시오:

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

XML 속성을 제공하려면 `@` 접두사가 있는 속성 키를 사용할 수 있습니다. `@`는 YAML 표준에 의해 예약되어 있으므로 반드시 큰따옴표로 감싸야 합니다:

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

YAML 시퀀스에서도 속성을 사용하는 것이 가능합니다:

```yaml
seq:
  - "@attr1": value1
  - "@attr2": value2
  - 123
  - abc
```

해당 XML:

```xml
<seq attr1="value1" attr2="value2">123</seq>
<seq attr1="value1" attr2="value2">abc</seq>
```

위에서 언급한 구문은 XML 속성을 가진 XML 텍스트 노드를 YAML로 표현하는 것을 허용하지 않습니다. 이 특별한 경우는 `#text` 속성 키를 사용하여 달성할 수 있습니다:

```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

해당 XML:

```xml
<map_key attr1="value1">value2</map>
```

## 구현 세부정보 {#implementation-details}

각 구성 파일에 대해, 서버는 시작 시 `file-preprocessed.xml` 파일을 생성합니다. 이 파일은 모든 완료된 치환 및 오버라이드를 포함하고 있으며 정보 사용을 위해 설계되었습니다. 구성 파일에서 ZooKeeper 치환을 사용했으나 서버 시작 시 ZooKeeper를 사용할 수 없는 경우, 서버는 전처리된 파일에서 구성을 로드합니다.

서버는 치환 및 오버라이드를 수행하는 동안 사용된 구성 파일과 파일, ZooKeeper 노드의 변화를 추적하고, 사용자 및 클러스터의 설정을 동적으로 다시 로드합니다. 이는 서버를 재시작하지 않고도 클러스터, 사용자 및 그 설정을 수정할 수 있음을 의미합니다.
