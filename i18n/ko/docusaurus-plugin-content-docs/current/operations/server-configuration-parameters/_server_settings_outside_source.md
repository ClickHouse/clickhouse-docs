## asynchronous_metric_log {#asynchronous_metric_log}

기본적으로 ClickHouse Cloud 배포에서 활성화됩니다.

환경에서 기본적으로 설정이 활성화되어 있지 않은 경우, ClickHouse가 설치된 방식에 따라 아래 지침을 따라 활성화하거나 비활성화할 수 있습니다.

**활성화**

비동기 메트릭 로그 이력 수집을 수동으로 켜려면 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml`을 다음 내용으로 생성하십시오:

```xml
<clickhouse>
     <asynchronous_metric_log>
        <database>system</database>
        <table>asynchronous_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </asynchronous_metric_log>
</clickhouse>
```

**비활성화**

`asynchronous_metric_log` 설정을 비활성화하려면, 다음 파일 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`을 다음 내용으로 생성해야 합니다:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## auth_use_forwarded_address {#auth_use_forwarded_address}

프록시를 통해 연결된 클라이언트의 인증을 위해 원래 주소를 사용합니다.

:::note
전달된 주소는 쉽게 위조될 수 있으므로 이 설정은 특히 주의해서 사용해야 합니다 – 이러한 인증을 수용하는 서버는 직접 접근해서는 안 되며 신뢰할 수 있는 프록시를 통해서만 접근해야 합니다.
:::
## backups {#backups}

[`BACKUP` 및 `RESTORE`](../backup.md) 문을 실행할 때 사용되는 백업 설정입니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

<!-- SQL
WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','동일 호스트에서 여러 백업 작업이 동시에 실행될 수 있는지를 결정합니다.', 'true'),
    ('allow_concurrent_restores', 'Bool', '동일 호스트에서 여러 복원 작업이 동시에 실행될 수 있는지를 결정합니다.', 'true'),
    ('allowed_disk', 'String', 'File()를 사용할 때 백업할 디스크. 이 설정은 File을 사용하기 위해 반드시 설정되어야 합니다.', ''),
    ('allowed_path', 'String', 'File()를 사용할 때 백업할 경로. 이 설정은 File을 사용하기 위해 반드시 설정되어야 합니다.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '수집된 메타데이터를 비교한 후 불일치가 발생할 경우 수집 메타데이터를 수집하기 위한 시도 횟수.', '2'),
    ('collect_metadata_timeout', 'UInt64', '백업 동안 메타데이터 수집을 위한 타임아웃(밀리초).', '600000'),
    ('compare_collected_metadata', 'Bool', '참이면, 수집된 메타데이터를 기존 메타데이터와 비교하여 백업 중 변경되지 않았는지 확인합니다.', 'true'),
    ('create_table_timeout', 'UInt64', '복원 중 테이블 생성을 위한 타임아웃(밀리초).', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '조정된 백업/복원 중 나쁜 버전 오류가 발생한 후 재시도할 최대 시도 횟수.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '다음 메타데이터 수집 시도 전 최대 대기 시간(밀리초).', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '다음 메타데이터 수집 시도 전 최소 대기 시간(밀리초).', '5000'),
    ('remove_backup_files_after_failure', 'Bool', 'BACKUP 명령이 실패하면 ClickHouse는 실패하기 전에 백업에 이미 복사된 파일을 삭제하려고 시도합니다. 그렇지 않으면 복사된 파일은 그대로 둡니다.', 'true'),
    ('sync_period_ms', 'UInt64', '조정된 백업/복원에 대한 동기화 주기(밀리초).', '5000'),
    ('test_inject_sleep', 'Bool', '테스트 관련 대기', 'false'),
    ('test_randomize_order', 'Bool', '참이면 테스트 목적으로 특정 작업의 순서를 무작위로 변경합니다.', 'false'),
    ('zookeeper_path', 'String', 'ON CLUSTER 절을 사용할 때 백업 및 복원 메타데이터가 저장되는 ZooKeeper의 경로.', '/clickhouse/backups')
  ]) AS t )
SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
-->
| Setting | Type | Description | Default |
|:-|:-|:-|:-|
| `allow_concurrent_backups` | Bool | 동일 호스트에서 여러 백업 작업이 동시에 실행될 수 있는지를 결정합니다. | `true` |
| `allow_concurrent_restores` | Bool | 동일 호스트에서 여러 복원 작업이 동시에 실행될 수 있는지를 결정합니다. | `true` |
| `allowed_disk` | String | File()를 사용할 때 백업할 디스크. 이 설정은 File을 사용하기 위해 반드시 설정되어야 합니다. | `` |
| `allowed_path` | String | File()를 사용할 때 백업할 경로. 이 설정은 File을 사용하기 위해 반드시 설정되어야 합니다. | `` |
| `attempts_to_collect_metadata_before_sleep` | UInt | 수집된 메타데이터를 비교한 후 불일치가 발생할 경우 수집 메타데이터를 수집하기 위한 시도 횟수. | `2` |
| `collect_metadata_timeout` | UInt64 | 백업 동안 메타데이터 수집을 위한 타임아웃(밀리초). | `600000` |
| `compare_collected_metadata` | Bool | 참이면, 수집된 메타데이터를 기존 메타데이터와 비교하여 백업 중 변경되지 않았는지 확인합니다. | `true` |
| `create_table_timeout` | UInt64 | 복원 중 테이블 생성을 위한 타임아웃(밀리초). | `300000` |
| `max_attempts_after_bad_version` | UInt64 | 조정된 백업/복원 중 나쁜 버전 오류가 발생한 후 재시도할 최대 시도 횟수. | `3` |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 다음 메타데이터 수집 시도 전 최대 대기 시간(밀리초). | `100` |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 다음 메타데이터 수집 시도 전 최소 대기 시간(밀리초). | `5000` |
| `remove_backup_files_after_failure` | Bool | BACKUP 명령이 실패하면 ClickHouse는 실패하기 전에 백업에 이미 복사된 파일을 삭제하려고 시도합니다. 그렇지 않으면 복사된 파일은 그대로 둡니다. | `true` |
| `sync_period_ms` | UInt64 | 조정된 백업/복원에 대한 동기화 주기(밀리초). | `5000` |
| `test_inject_sleep` | Bool | 테스트 관련 대기 | `false` |
| `test_randomize_order` | Bool | 참이면 테스트 목적으로 특정 작업의 순서를 무작위로 변경합니다. | `false` |
| `zookeeper_path` | String | ON CLUSTER 절을 사용할 때 백업 및 복원 메타데이터가 저장되는 ZooKeeper의 경로. | `/clickhouse/backups` |

이 설정은 기본적으로 다음과 같이 구성됩니다:

```xml
<backups>
    ....
</backups>
```
## bcrypt_workfactor {#bcrypt_workfactor}

[Bcrypt 알고리즘](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)을 사용하는 `bcrypt_password` 인증 유형의 작업 계수. 작업 계수는 해시를 계산하고 비밀번호를 검증하는 데 필요한 계산량과 시간의 양을 정의합니다.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
고빈도 인증을 사용하는 애플리케이션의 경우, bcrypt의 높은 작업 계수에서의 계산 오버헤드로 인해 대체 인증 방법을 고려하십시오.
:::
## table_engines_require_grant {#table_engines_require_grant}

true로 설정할 경우, 사용자는 특정 엔진으로 테이블을 생성하기 위한 권한을 요구합니다. 예를 들어, `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
기본적으로 하위 호환성을 위해 특정 테이블 엔진으로 테이블을 생성할 때 권한을 무시합니다. 그러나 이를 true로 설정하면 이 동작을 변경할 수 있습니다.
:::
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

내장 딕셔너리를 재로드하기 전의 간격(초).

ClickHouse는 매 x 초마다 내장 딕셔너리를 재로드합니다. 이는 서버를 재시작하지 않고도 "실시간"으로 딕셔너리를 편집할 수 있게 합니다.

**예시**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 엔진 테이블의 데이터 압축 설정입니다.

:::note
ClickHouse 사용을 시작한 지 얼마 되지 않았다면 이 설정을 변경하지 않는 것이 좋습니다.
:::

**구성 템플릿**:

```xml
<compression>
    <case>
      <min_part_size>...</min_part_size>
      <min_part_size_ratio>...</min_part_size_ratio>
      <method>...</method>
      <level>...</level>
    </case>
    ...
</compression>
```

**`<case>` 필드**:

- `min_part_size` – 데이터 파트의 최소 크기.
- `min_part_size_ratio` – 데이터 파트 크기와 테이블 크기 비율.
- `method` – 압축 방법. 허용되는 값: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
- `level` – 압축 수준. [코덱](#general-purpose-codecs)을 참조하십시오.

:::note
여러 `<case>` 섹션을 구성할 수 있습니다.
:::

**조건이 충족될 때의 동작**:

- 데이터 파트가 설정된 조건에 맞으면 ClickHouse는 지정된 압축 방법을 사용합니다.
- 데이터 파트가 여러 조건 집합에 맞으면 ClickHouse는 첫 번째로 일치하는 조건 집합을 사용합니다.

:::note
데이터 파트에 대한 조건이 충족되지 않으면 ClickHouse는 `lz4` 압축을 사용합니다.
:::

**예시**

```xml
<compression incl="clickhouse_compression">
    <case>
        <min_part_size>10000000000</min_part_size>
        <min_part_size_ratio>0.01</min_part_size_ratio>
        <method>zstd</method>
        <level>1</level>
    </case>
</compression>
```
## encryption {#encryption}

[암호화 코덱](../../sql-reference/statements/create/table#encryption-codecs)을 사용하기 위한 키를 얻기 위한 명령을 구성합니다. 키(또는 키들)는 환경 변수에 작성되거나 구성 파일에 설정되어야 합니다.

키는 16바이트 길이의 헥스 또는 문자열 형식일 수 있습니다.

**예시**

구성에서 로드하기:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
구성 파일에 키를 저장하는 것은 권장되지 않습니다. 보안성이 없습니다. 키를 보안 디스크에 있는 별도의 구성 파일로 이동하고 해당 구성 파일에 대한 심볼릭 링크를 `config.d/` 폴더에 두는 것이 좋습니다.
:::

구성이 헥스인 경우 키 로드:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

환경 변수에서 키 로드:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

여기서 `current_key_id`는 암호화를 위한 현재 키를 설정하며, 지정된 모든 키는 복호화에 사용될 수 있습니다.

이 방법들은 여러 키에 적용될 수 있습니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

여기서 `current_key_id`는 암호화를 위한 현재 키를 보여줍니다.

또한 사용자는 12바이트 길이의 nonce를 추가할 수 있습니다 (기본적으로 암호화 및 복호화 프로세스는 제로 바이트로 구성된 nonce를 사용합니다):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

또는 헥스에서 설정할 수 있습니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
위에서 언급한 모든 내용은 `aes_256_gcm_siv`에 적용될 수 있습니다 (단, 키는 32바이트 길이여야 합니다).
:::
## error_log {#error_log}

기본적으로 비활성화되어 있습니다.

**활성화**

오류 이력 수집을 수동으로 켜려면 [`system.error_log`](../../operations/system-tables/error_log.md), `/etc/clickhouse-server/config.d/error_log.xml`을 다음 내용으로 생성하십시오:

```xml
<clickhouse>
    <error_log>
        <database>system</database>
        <table>error_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </error_log>
</clickhouse>
```

**비활성화**

`error_log` 설정을 비활성화하려면, 다음 파일 `/etc/clickhouse-server/config.d/disable_error_log.xml`을 다음 내용으로 생성해야 합니다:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## custom_settings_prefixes {#custom_settings_prefixes}

[사용자 정의 설정](operations/settings/query-level#custom_settings)의 접두사 목록입니다. 접두사는 쉼표로 구분되어야 합니다.

**예시**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**참고**

- [사용자 정의 설정](operations/settings/query-level#custom_settings)
## core_dump {#core_dump}

코어 덤프 파일 크기에 대한 소프트 제한을 구성합니다.

:::note
하드 제한은 시스템 도구를 통해 구성됩니다.
:::

**예시**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## default_profile {#default_profile}

기본 설정 프로필. 설정 프로필은 `user_config` 설정에 지정된 파일에 있습니다.

**예시**

```xml
<default_profile>default</default_profile>
```
## dictionaries_config {#dictionaries_config}

딕셔너리 구성 파일의 경로입니다.

경로:

- 절대 경로 또는 서버 구성 파일에 상대적인 경로를 지정하십시오.
- 경로는 와일드카드 \* 및 ?를 포함할 수 있습니다.

다시 말하면:
- "[딕셔너리](../../sql-reference/dictionaries/index.md)".

**예시**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

사용자 정의 실행 함수에 대한 구성 파일의 경로입니다.

경로:

- 절대 경로 또는 서버 구성 파일에 상대적인 경로를 지정하십시오.
- 경로는 와일드카드 \* 및 ?를 포함할 수 있습니다.

다시 말하면:
- "[실행 가능한 사용자 정의 함수](/sql-reference/functions/udf#executable-user-defined-functions).".

**예시**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## format_schema_path {#format_schema_path}

입력 데이터의 스키마, 예를 들어 [CapnProto](/interfaces/formats/CapnProto) 형식의 스키마가 포함된 디렉토리의 경로입니다.

**예시**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## graphite {#graphite}

[Graphite](https://github.com/graphite-project)로 데이터를 전송합니다.

설정:

- `host` – Graphite 서버.
- `port` – Graphite 서버의 포트.
- `interval` – 전송 간격, 초 단위.
- `timeout` – 데이터를 전송하는 타임아웃, 초 단위.
- `root_path` – 키의 접두사.
- `metrics` – [system.metrics](/operations/system-tables/metrics) 테이블의 데이터를 전송합니다.
- `events` – [system.events](/operations/system-tables/events) 테이블의 시간 유도 데이터 전송.
- `events_cumulative` – [system.events](/operations/system-tables/events) 테이블의 누적 데이터 전송.
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 테이블의 데이터를 전송합니다.

여러 `<graphite>` 절을 구성할 수 있습니다. 예를 들어, 서로 다른 간격으로 서로 다른 데이터를 전송하기 위해 사용할 수 있습니다.

**예시**

```xml
<graphite>
    <host>localhost</host>
    <port>42000</port>
    <timeout>0.1</timeout>
    <interval>60</interval>
    <root_path>one_min</root_path>
    <metrics>true</metrics>
    <events>true</events>
    <events_cumulative>false</events_cumulative>
    <asynchronous_metrics>true</asynchronous_metrics>
</graphite>
```
## graphite_rollup {#graphite_rollup}

Graphite에 대한 데이터 압축 설정입니다.

자세한 내용은 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)를 참조하십시오.

**예시**

```xml
<graphite_rollup_example>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup_example>
```
## google_protos_path {#google_protos_path}

Protobuf 타입을 위한 proto 파일을 포함하는 디렉토리를 정의합니다.

예시:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

사용자 정의 HTTP 핸들러 사용을 허용합니다.
새 HTTP 핸들러를 추가하려면 `<rule>`을 새로 추가하십시오.
규칙은 정의된 대로 위에서 아래로 검사되며 첫 번째 일치하는 항목이 핸들러를 실행합니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| 하위 태그             | 정의                                                                                                                                                       |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                 | 요청 URL와 일치하도록, `regex:` 접두사를 사용하여 정규식 일치를 사용할 수 있습니다 (선택적)                                                               |
| `methods`             | 요청 메서드와 일치하도록 여러 메서드 일치를 쉼표로 구분하여 사용할 수 있습니다 (선택적)                                                                   |
| `headers`             | 요청 헤더와 일치하도록, 각 자식 요소(자식 요소 이름은 헤더 이름)에 대해 일치합니다. 정규식 일치를 위해 `regex:` 접두사를 사용할 수 있습니다 (선택적) |
| `handler`             | 요청 핸들러                                                                                                                                             |
| `empty_query_string`  | URL에 쿼리 문자열이 없는지 확인합니다.                                                                                                                      |

`handler`는 다음의 설정을 포함하며, 하위 태그로 구성할 수 있습니다:

| 하위 태그           | 정의                                                                                                                                                                                        |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | 리디렉션 위치                                                                                                                                                                             |
| `type`               | 지원되는 유형: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                                            |
| `status`             | 정적 유형와 함께 사용 시, 응답 상태 코드                                                                                                                                                           |
| `query_param_name`   | dynamic_query_handler 유형와 함께 사용할 경우, HTTP 요청 매개변수에 있는 `<query_param_name>` 값에 해당하는 값을 추출하고 실행합니다.                                                                           |
| `query`              | predefined_query_handler 유형와 함께 사용할 경우, 핸들러가 호출될 때 쿼리를 실행합니다.                                                                                                       |
| `content_type`       | 정적 유형와 함께 사용할 경우, 응답 콘텐츠 유형                                                                                                                                                      |
| `response_content`   | 정적 유형와 함께 사용할 경우, 클라이언트에게 전송되는 응답 콘텐츠. `file://` 또는 `config://` 접두사를 사용할 경우, 파일 또는 구성에서 콘텐츠를 찾아 클라이언트에게 전송합니다. |

규칙 목록과 함께 기본 핸들러를 활성화하기 위한 `<defaults/>`를 지정할 수 있습니다.

예시:

```xml
<http_handlers>
    <rule>
        <url>/</url>
        <methods>POST,GET</methods>
        <headers><pragma>no-cache</pragma></headers>
        <handler>
            <type>dynamic_query_handler</type>
            <query_param_name>query</query_param_name>
        </handler>
    </rule>

    <rule>
        <url>/predefined_query</url>
        <methods>POST,GET</methods>
        <handler>
            <type>predefined_query_handler</type>
            <query>SELECT * FROM system.settings</query>
        </handler>
    </rule>

    <rule>
        <handler>
            <type>static</type>
            <status>200</status>
            <content_type>text/plain; charset=UTF-8</content_type>
            <response_content>config://http_server_default_response</response_content>
        </handler>
    </rule>
</http_handlers>
```
## http_server_default_response {#http_server_default_response}

ClickHouse HTTP(s) 서버에 접근할 때 기본적으로 표시되는 페이지.
기본 값은 "Ok." (끝에 개행 포함)

**예시**

`http://localhost: http_port`에 접근할 때 `https://tabix.io/`를 엽니다.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

`OPTIONS` HTTP 요청의 응답에 헤더를 추가하는 데 사용됩니다.
`OPTIONS` 메서드는 CORS 프리플라이트 요청을 할 때 사용됩니다.

자세한 정보는 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)를 참조하십시오.

예시:

```xml
<http_options_response>
     <header>
            <name>Access-Control-Allow-Origin</name>
            <value>*</value>
     </header>
     <header>
          <name>Access-Control-Allow-Headers</name>
          <value>origin, x-requested-with, x-clickhouse-format, x-clickhouse-user, x-clickhouse-key, Authorization</value>
     </header>
     <header>
          <name>Access-Control-Allow-Methods</name>
          <value>POST, GET, OPTIONS</value>
     </header>
     <header>
          <name>Access-Control-Max-Age</name>
          <value>86400</value>
     </header>
</http_options_response>
```
## hsts_max_age {#hsts_max_age}

HSTS의 만료 시간(초).

:::note
값이 `0`이면 ClickHouse는 HSTS를 비활성화합니다. 양수를 설정하면 HSTS가 활성화되고 max-age는 설정한 숫자가 됩니다.
:::

**예시**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

시작 후 `mlockall`을 수행하여 첫 번째 쿼리의 지연 시간을 줄이고 ClickHouse 실행 파일이 높은 IO 부하 하에서 페이지 아웃되는 것을 방지합니다.

:::note
이 옵션을 활성화 하는 것이 권장되지만 시작 시간이 몇 초까지 증가할 수 있습니다.
이 설정은 "CAP_IPC_LOCK" 기능이 없으면 작동하지 않습니다.
:::

**예시**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

치환이 있는 파일의 경로입니다. XML 및 YAML 형식 모두 지원됩니다.

자세한 내용은 "[구성 파일](/operations/configuration-files)" 섹션을 참조하십시오.

**예시**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

ClickHouse 서버 간 데이터 교환을 제한하는 호스트입니다.
Keeper를 사용하는 경우 다른 Keeper 인스턴스 간의 통신에도 동일한 제한이 적용됩니다.

:::note
기본적으로 값은 [`listen_host`](#listen_host) 설정과 같습니다.
:::

**예시**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

Type:

Default:
## interserver_http_port {#interserver_http_port}

ClickHouse 서버 간 데이터 교환을 위한 포트입니다.

**예시**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_http_host {#interserver_http_host}

다른 서버가 이 서버에 접근하기 위해 사용할 수 있는 호스트 이름입니다.

생략할 경우, `hostname -f` 명령과 동일한 방식으로 정의됩니다.

특정 네트워크 인터페이스에 연연하지 않기 유용합니다.

**예시**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_https_port {#interserver_https_port}

`HTTPS`를 통해 ClickHouse 서버 간 데이터 교환을 위한 포트입니다.

**예시**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_https_host {#interserver_https_host}

[`interserver_http_host`](#interserver_http_host)와 유사하나, 이 호스트 이름은 다른 서버가 이 서버에 접근하기 위해 `HTTPS`를 통해 사용할 수 있습니다.

**예시**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

[복제](../../engines/table-engines/mergetree-family/replication.md) 중 다른 서버에 연결하기 위해 사용되는 사용자 이름 및 비밀번호. 추가로, 서버는 이러한 인증 정보를 사용하여 다른 복제본을 인증합니다.
`interserver_http_credentials`는 클러스터 내 모든 복제본에서 동일해야 합니다.

:::note
- 기본적으로, `interserver_http_credentials` 섹션이 생략되면 복제 중 인증이 사용되지 않습니다.
- `interserver_http_credentials` 설정은 ClickHouse 클라이언트 자격 증명 [구성](../../interfaces/cli.md#configuration_files)과 관련이 없습니다.
- 이 자격 증명은 `HTTP` 및 `HTTPS`를 통한 복제에 공통적입니다.
:::

다음 설정은 하위 태그로 구성할 수 있습니다:

- `user` — 사용자 이름.
- `password` — 비밀번호.
- `allow_empty` — `true`이면, 다른 복제본이 인증 없이도 연결할 수 있도록 허용합니다. `false`이면 인증 없는 연결은 거부됩니다. 기본값: `false`.
- `old` — 자격 증명 회전 중 사용된 기존의 `user`와 `password`를 포함합니다. 여러 `old` 섹션을 지정할 수 있습니다.

**자격 증명 회전**

ClickHouse는 모든 복제본을 동시에 중지하지 않고도 동적 상호 서버 자격 증명 회전을 지원합니다. 자격 증명은 여러 단계로 변경될 수 있습니다.

인증을 활성화하려면 `interserver_http_credentials.allow_empty`를 `true`로 설정하고 자격 증명을 추가하십시오. 이를 통해 인증이 있는 연결과 인증이 없는 연결이 모두 허용됩니다.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

모든 복제본의 구성이 완료되면 `allow_empty`를 `false`로 설정하거나 이 설정을 제거하십시오. 이것은 새로운 자격 증명을 사용한 인증을 의무화합니다.

기존 자격 증명을 변경하려면 사용자 이름과 비밀번호를 `interserver_http_credentials.old` 섹션으로 이동시키고 `user`와 `password`를 새 값으로 업데이트하십시오. 이 시점에서 서버는 새 자격 증명을 사용하여 다른 복제본에 연결하고 새 자격 증명과 기존 자격 증명 모두로 연결을 수락합니다.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>222</password>
    <old>
        <user>admin</user>
        <password>111</password>
    </old>
    <old>
        <user>temp</user>
        <password>000</password>
    </old>
</interserver_http_credentials>
```

모든 복제본에 새 자격 증명이 적용되면 기존 자격 증명을 제거할 수 있습니다.
## ldap_servers {#ldap_servers}

여기에서 LDAP 서버와 그 연결 매개변수를 나열하여:
- 'password' 대신 'ldap' 인증 메커니즘이 지정된 전용 로컬 사용자의 인증자로 사용할 수 있습니다.
- 원격 사용자 디렉터리로 사용할 수 있습니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP 서버 호스트 이름 또는 IP, 이 매개변수는 필수이며 비워둘 수 없습니다.                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP 서버 포트, 기본값은 `enable_tls`가 true로 설정된 경우 636이며, 그렇지 않으면 389입니다.                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                      | 바인딩할 DN을 구성하는 데 사용되는 템플릿. 인증 시도마다 템플릿의 모든 `\{user_name\}` 하위 문자열이 실제 사용자 이름으로 바뀌어 결과 DN이 구성됩니다.                                                                                                                                                                                                                                                             |
| `user_dn_detection`            | 바인딩된 사용자의 실제 사용자 DN을 감지하기 위한 LDAP 검색 매개변수가 포함된 섹션. 주로 서버가 Active Directory일 때 추가 역할 매핑을 위한 검색 필터에 사용됩니다. 결과 사용자 DN은 `\{user_dn\}` 하위 문자열이 허용되는 위치에서 바뀔 때 사용됩니다. 기본적으로 사용자 DN은 bind DN과 동일하게 설정되지만, 검색이 수행되면 실제 감지된 사용자 DN 값으로 업데이트됩니다. |
| `verification_cooldown`        | 성공적인 바인드 시도 후 LDAP 서버에 연락하지 않고 모든 후속 요청에 대해 사용자가 성공적으로 인증된 것으로 간주되는 시간(초)입니다. 0 (기본값)을 지정하여 캐싱을 비활성화하고 각 인증 요청 시 LDAP 서버에 연락하도록 강제할 수 있습니다.                                                                                                                  |
| `enable_tls`                   | LDAP 서버에 대한 보안 연결 사용을 트리거하는 플래그입니다. 일반 텍스트(`ldap://`) 프로토콜에는 'no'를 지정하고 (권장되지 않음), SSL/TLS(`ldaps://`) 프로토콜에는 'yes'를 지정합니다 (권장, 기본값). 레거시 StartTLS 프로토콜(일반 텍스트(`ldap://`) 프로토콜에서 TLS로 업그레이드된)에는 'starttls'를 지정합니다.                                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLS의 최소 프로토콜 버전. 수용 가능한 값은 `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (기본값)입니다.                                                                                                                                                                                                                                                                                                            |
| `tls_require_cert`             | SSL/TLS 피어 인증서 검증 동작. 수용 가능한 값은 `never`, `allow`, `try`, `demand` (기본값)입니다.                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 인증서 파일의 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 인증서 키 파일의 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA 인증서 파일의 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_dir`              | CA 인증서를 포함하는 디렉토리의 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 허용되는 암호 모음(OpenSSL 표기법).                                                                                                                                                                                                                                                                                                                                                                                              |

`user_dn_detection` 설정은 하위 태그로 구성할 수 있습니다:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP 검색을 위한 기본 DN을 구성하는 데 사용되는 템플릿. 결과 DN은 LDAP 검색 중에 템플릿의 모든 `\{user_name\}` 및 `\{bind_dn\}` 하위 문자열이 실제 사용자 이름 및 bind DN으로 대체되어 구성됩니다.                                                                                                       |
| `scope`         | LDAP 검색의 범위. 수용 가능한 값은 `base`, `one_level`, `children`, `subtree` (기본값)입니다.                                                                                                                                                                                                                                       |
| `search_filter` | LDAP 검색을 위한 검색 필터를 구성하는 데 사용되는 템플릿. 결과 필터는 검색 중에 템플릿의 모든 `\{user_name\}`, `\{bind_dn\}`, 및 `\{base_dn\}` 하위 문자열이 실제 사용자 이름, bind DN 및 기본 DN으로 대체되어 구성됩니다. 특수 문자는 XML에서 제대로 이스케이프해야 합니다. |

예제:

```xml
<my_ldap_server>
    <host>localhost</host>
    <port>636</port>
    <bind_dn>uid={user_name},ou=users,dc=example,dc=com</bind_dn>
    <verification_cooldown>300</verification_cooldown>
    <enable_tls>yes</enable_tls>
    <tls_minimum_protocol_version>tls1.2</tls_minimum_protocol_version>
    <tls_require_cert>demand</tls_require_cert>
    <tls_cert_file>/path/to/tls_cert_file</tls_cert_file>
    <tls_key_file>/path/to/tls_key_file</tls_key_file>
    <tls_ca_cert_file>/path/to/tls_ca_cert_file</tls_ca_cert_file>
    <tls_ca_cert_dir>/path/to/tls_ca_cert_dir</tls_ca_cert_dir>
    <tls_cipher_suite>ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:AES256-GCM-SHA384</tls_cipher_suite>
</my_ldap_server>
```

예제 (추가 역할 매핑을 위한 사용자 DN 감지가 구성된 전형적인 Active Directory):

```xml
<my_ad_server>
    <host>localhost</host>
    <port>389</port>
    <bind_dn>EXAMPLE\{user_name}</bind_dn>
    <user_dn_detection>
        <base_dn>CN=Users,DC=example,DC=com</base_dn>
        <search_filter>(&amp;(objectClass=user)(sAMAccountName={user_name}))</search_filter>
    </user_dn_detection>
    <enable_tls>no</enable_tls>
</my_ad_server>
```
## listen_host {#listen_host}

요청이 올 수 있는 호스트에 대한 제한입니다. 서버가 모든 요청에 응답하길 원한다면 `::`를 지정하십시오.

예제:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

IPv6 또는 IPv4 네트워크가 사용 가능하지 않을 경우 서버가 종료되지 않습니다.

**예제**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

여러 서버가 동일한 주소:포트에서 청취하도록 허용합니다. 요청은 운영 체제에 의해 무작위 서버로 라우팅됩니다. 이 설정을 활성화하는 것은 권장되지 않습니다.

**예제**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

형식:

기본값:
## listen_backlog {#listen_backlog}

청취 소켓의 백로그 (대기 중인 연결의 큐 크기). 기본값인 `4096`은 linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)와 동일합니다.

일반적으로 이 값은 변경할 필요가 없으며:
- 기본값은 충분히 큽니다.
- 클라이언트의 연결 수락을 위해 서버는 별도의 스레드를 가지고 있습니다.

따라서 `TcpExtListenOverflows` (from `nstat`)가 0이 아닌 경우 ClickHouse 서버에서 카운터가 증가하더라도 이 값을 증가시켜야 한다는 의미는 아닙니다. 왜냐하면:
- 일반적으로 `4096`이 충분하지 않은 경우 내부 ClickHouse 스케일링 문제를 나타내므로 문제를 보고하는 것이 좋습니다.
- 이 값으로 서버가 나중에 더 많은 연결을 처리할 수 있다는 의미도 아닙니다 (설령 처리할 수 있더라도, 그 순간 클라이언트가 사라지거나 연결이 끊어질 수 있습니다).

**예제**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

로그 메시지의 위치와 형식.

**키**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | 로그 수준. 수용 가능한 값: `none` (로그 끄기), `fatal`, `critical`, `error`, `warning`, `notice`, `information`, `debug`, `trace`, `test`                 |
| `log`                  | 로그 파일의 경로.                                                                                                                                          |
| `errorlog`             | 오류 로그 파일의 경로.                                                                                                                                    |
| `size`                 | 회전 정책: 로그 파일의 최대 크기(바이트). 로그 파일의 크기가 이 임계값을 초과하면 로그 파일은 이름이 바뀌고 아카이브되며 새로운 로그 파일이 생성됩니다. |
| `count`                | 회전 정책: Clickhouse가 최대 몇 개의 과거 로그 파일을 유지할 것인지입니다.                                                                                        |
| `stream_compress`      | LZ4를 사용하여 로그 메시지 압축. 활성화하려면 `1` 또는 `true`로 설정합니다.                                                                                                   |
| `console`              | 콘솔에 대한 로깅 활성화. 활성화하려면 `1` 또는 `true`로 설정합니다. Clickhouse가 데몬 모드에서 실행되지 않으면 기본값은 `1`, 그렇지 않으면 `0`입니다.                            |
| `console_log_level`    | 콘솔 출력용 로그 수준. 기본값은 `level`입니다.                                                                                                                 |
| `formatting.type`      | 콘솔 출력용 로그 형식. 현재는 `json`만 지원됩니다.                                                                                                 |
| `use_syslog`           | 또한 로그 출력을 syslog로 전달합니다.                                                                                                                                 |
| `syslog_level`         | syslog에 대한 로깅 수준입니다.                                                                                                                                   |
| `async`                | `true` (기본값)이면 비동기적으로 로깅됩니다 (출력 채널 당 하나의 백그라운드 스레드). 그렇지 않으면 로그를 호출하는 스레드 내부에서 기록됩니다.           |
| `async_queue_max_size` | 비동기 로깅을 사용할 때 플러싱을 기다리는 메시지의 최대 개수. 추가 메시지는 버려집니다.                       |
| `startup_level`        | 서버 시작 시 루트 로거 수준을 설정하는 데 사용되는 시작 수준입니다. 시작 후 로그 수준은 `level` 설정으로 복원됩니다.                                   |
| `shutdown_level`       | 종료 시 루트 로거 수준을 설정하는 데 사용되는 종료 수준입니다.                                                                                            |

**로그 형식 지정자**

`log` 및 `errorLog` 경로의 파일 이름은 결과 파일 이름에 대한 아래 형식 지정자를 지원합니다 (디렉토리 부분은 지원하지 않음).

열 "예제"는 `2023-07-06 18:32:07`에서의 출력을 보여줍니다.

| Specifier    | Description                                                                                                         | Example                  |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | 리터럴 %                                                                                                           | `%`                        |
| `%n`         | 줄 바꿈 문자                                                                                                  |                          |
| `%t`         | 수평 탭 문자                                                                                            |                          |
| `%Y`         | 년도, 예: 2017                                                                                 | `2023`                     |
| `%y`         | 년도의 마지막 2자리 숫자 (범위 [00,99])                                                           | `23`                       |
| `%C`         | 년도의 첫 2자리 숫자 (범위 [00,99])                                                          | `20`                       |
| `%G`         | 네 자리 [ISO 8601 주 기반 연도](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), 즉 특정 주를 포함하는 연도. 일반적으로는 `%V`와 함께만 유용합니다.  | `2023`       |
| `%g`         | 마지막 2자리 [ISO 8601 주 기반 연도](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), 즉 특정 주를 포함하는 연도.                         | `23`         |
| `%b`         | 축약된 월 이름, 예: Oct (지역 의존)                                                                 | `Jul`                      |
| `%h`         | %b의 동의어                                                                                                       | `Jul`                      |
| `%B`         | 전체 월 이름, 예: October (지역 의존)                                                                    | `July`                     |
| `%m`         | 월을 숫자로 표시 (범위 [01,12])                                                                           | `07`                       |
| `%U`         | 주의 연도를 숫자로 표시 (일요일이 주의 첫째 날) (범위 [00,53])                          | `27`                       |
| `%W`         | 주의 연도를 숫자로 표시 (월요일이 주의 첫째 날) (범위 [00,53])                          | `27`                       |
| `%V`         | ISO 8601 주 번호 (범위 [01,53])                                                                                | `27`                       |
| `%j`         | 연중 일을 숫자로 표시 (범위 [001,366])                                                               | `187`                      |
| `%d`         | 일을 0으로 채워진 숫자로 표시 (범위 [01,31]). 단일 자리는 0으로 전치됨.                 | `06`                       |
| `%e`         | 일을 공백으로 채워진 숫자로 표시 (범위 [1,31]). 단일 자리는 공백으로 전치됨.              | `&nbsp; 6`                 |
| `%a`         | 축약된 요일 이름, 예: Fri (지역 의존)                                                               | `Thu`                      |
| `%A`         | 전체 요일 이름, 예: Friday (지역 의존)                                                                   | `Thursday`                 |
| `%w`         | 일주일의 요일을 정수로 표시하며, 일요일은 0 (범위 [0-6])                                                          | `4`                        |
| `%u`         | 일주일의 요일을 십진수로 표시하며, 월요일은 1 (ISO 8601 형식) (범위 [1-7])                                      | `4`                        |
| `%H`         | 24시간 시계로 표시한 시간 (범위 [00-23])                                                             | `18`                       |
| `%I`         | 12시간 시계로 표시한 시간 (범위 [01,12])                                                             | `06`                       |
| `%M`         | 분을 십진수로 표시 (범위 [00,59])                                                                          | `32`                       |
| `%S`         | 초를 십진수로 표시 (범위 [00,60])                                                                          | `07`                       |
| `%c`         | 표준 날짜 및 시간 문자열, 예: Sun Oct 17 04:41:13 2010 (지역 의존)                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | 지역화된 날짜 표현 (지역 의존)                                                                    | `07/06/23`                 |
| `%X`         | 지역화된 시간 표현, 예: 18:40:20 또는 6:40:20 PM (지역 의존)                                       | `18:32:07`                 |
| `%D`         | 짧은 MM/DD/YY 날짜, %m/%d/%y와 동등함                                                                         | `07/06/23`                 |
| `%F`         | 짧은 YYYY-MM-DD 날짜, %Y-%m-%d와 동등함                                                                       | `2023-07-06`               |
| `%r`         | 지역화된 12시간 시계 시간 (지역 의존)                                                                     | `06:32:07 PM`              |
| `%R`         | "%H:%M"과 동일                                                                                            | `18:32`                    |
| `%T`         | "%H:%M:%S"와 동일 (ISO 8601 시간 형식)                                                                 | `18:32:07`                 |
| `%p`         | 지역화된 오전 또는 오후의 표시 (지역 의존)                                                               | `PM`                       |
| `%z`         | ISO 8601 형식의 UTC의 오프셋 (예: -0430) 또는 시간대 정보가 없을 때는 문자가 없음 | `+0800`                    |
| `%Z`         | 지역 의존적인 시간대 이름이나 약어 또는 시간대 정보가 없을 때는 문자가 없음     | `Z AWST `                  |

**예제**

```xml
<logger>
    <level>trace</level>
    <log>/var/log/clickhouse-server/clickhouse-server-%F-%T.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server-%F-%T.err.log</errorlog>
    <size>1000M</size>
    <count>10</count>
    <stream_compress>true</stream_compress>
</logger>
```

로그 메시지를 오직 콘솔에서만 출력하기 위해:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**레벨별 재정의**

개별 로그 이름의 로그 수준을 재정의할 수 있습니다. 예를 들어, "Backup" 및 "RBAC" 로거의 모든 메시지를 음소거하려면.

```xml
<logger>
    <levels>
        <logger>
            <name>Backup</name>
            <level>none</level>
        </logger>
        <logger>
            <name>RBAC</name>
            <level>none</level>
        </logger>
    </levels>
</logger>
```

**syslog**

로그 메시지를 syslog에 추가로 작성하려면:

```xml
<logger>
    <use_syslog>1</use_syslog>
    <syslog>
        <address>syslog.remote:10514</address>
        <hostname>myhost.local</hostname>
        <facility>LOG_LOCAL6</facility>
        <format>syslog</format>
    </syslog>
</logger>
```

`<syslog>`의 키:

| Key        | Description                                                                                                                                                                                                                                                    |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | `host\[:port\]` 형식의 syslog 주소. 생략하면 로컬 데몬이 사용됩니다.                                                                                                                                                                         |
| `hostname` | 로그가 전송되는 호스트의 이름 (선택 사항).                                                                                                                                                                                                      |
| `facility` | syslog [시설 키워드](https://en.wikipedia.org/wiki/Syslog#Facility). 대문자로 "LOG_" 접두사를 붙여야 하며, 예: `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` 등으로 지정해야 합니다. 기본값: `address`가 지정된 경우 `LOG_USER`, 그렇지 않으면 `LOG_DAEMON`.                                           |
| `format`   | 로그 메시지 형식. 가능한 값: `bsd` 및 `syslog.`                                                                                                                                                                                                       |

**로그 형식**

콘솔 로그에 출력될 로그 형식을 지정할 수 있습니다. 현재 JSON만 지원됩니다.

**예제**

출력 JSON 로그의 예는 다음과 같습니다:

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "Received signal 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

JSON 로깅 지원을 활성화하려면, 다음 스니펫을 사용하십시오:

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Can be configured on a per-channel basis (log, errorlog, console, syslog), or globally for all channels (then just omit it). -->
        <!-- <channel></channel> -->
        <names>
            <date_time>date_time</date_time>
            <thread_name>thread_name</thread_name>
            <thread_id>thread_id</thread_id>
            <level>level</level>
            <query_id>query_id</query_id>
            <logger_name>logger_name</logger_name>
            <message>message</message>
            <source_file>source_file</source_file>
            <source_line>source_line</source_line>
        </names>
    </formatting>
</logger>
```

**JSON 로그의 키 이름 수정하기**

키 이름은 `<names>` 태그 내부의 값 변경을 통해 수정할 수 있습니다. 예를 들어, `DATE_TIME`을 `MY_DATE_TIME`으로 변경하려면 `<date_time>MY_DATE_TIME</date_time>`를 사용할 수 있습니다.

**JSON 로그의 키 생략하기**

로그 속성은 속성을 주석 처리하여 생략할 수 있습니다. 예를 들어, 로그에 `query_id`를 출력하고 싶지 않다면 `<query_id>` 태그를 주석 처리할 수 있습니다.
## send_crash_reports {#send_crash_reports}

ClickHouse 핵심 개발자 팀에 충돌 보고서를 보내기 위한 설정입니다.

특히 사전 생산 환경에서는 이를 활성화하는 것이 높이 평가됩니다.

키들:

| Key                   | Description                                                                                                                          |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | 기능을 활성화하는 부울 플래그, 기본값은 `true`입니다. 크래시 보고서를 보내지 않으려면 `false`로 설정하십시오.                                |
| `send_logical_errors` | `LOGICAL_ERROR`는 `assert`와 같으며 ClickHouse의 버그입니다. 이 예외를 보내는 것을 활성화하는 부울 플래그 (기본값: `true`)입니다. |
| `endpoint`            | 충돌 보고서를 보내기 위한 엔드포인트 URL을 재정의할 수 있습니다.                                                                         |

**권장 사용법**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## ssh_server {#ssh_server}

호스트 키의 공개 부분은 첫 번째 연결 시 SSH 클라이언트 측의 known_hosts 파일에 기록됩니다.

호스트 키 구성은 기본적으로 비활성화됩니다.
호스트 키 구성을 주석 해제하고 각각의 ssh 키에 대한 경로를 제공하여 활성화할 수 있습니다:

예제:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## tcp_ssh_port {#tcp_ssh_port}

사용자가 PTY를 통해 내장 클라이언트를 사용하여 대화식으로 쿼리를 실행할 수 있도록 하는 SSH 서버의 포트입니다.

예제:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## storage_configuration {#storage_configuration}

다중 디스크 구성을 허용합니다.

스톨리지 구성은 아래에 주어진 구조를 따릅니다:

```xml
<storage_configuration>
    <disks>
        <!-- configuration -->
    </disks>
    <policies>
        <!-- configuration -->
    </policies>
</storage_configuration>
```
### Configuration of disks {#configuration-of-disks}

`disks`의 구성은 아래에 주어진 구조를 따릅니다:

```xml
<storage_configuration>
    <disks>
        <disk_name_1>
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>
        ...
    </disks>
</storage_configuration>
```

위의 하위 태그는 `disks`에 대한 다음 설정을 정의합니다:

| Setting                 | Description                                                                                           |
|-------------------------|-------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | 고유해야 하는 디스크의 이름입니다.                                                         |
| `path`                  | 서버 데이터가 저장될 경로 (`data` 및 `shadow` 카탈로그). `/`로 끝나야 합니다. |
| `keep_free_space_bytes` | 디스크의 예약된 여유 공간의 크기입니다.                                                              |

:::note
디스크의 순서는 중요하지 않습니다.
:::
### 정책 구성 {#configuration-of-policies}

위의 하위 태그는 `policies`에 대한 다음 설정을 정의합니다:

| 설정                         | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | 정책의 이름. 정책 이름은 고유해야 합니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `volume_name_N`              | 볼륨 이름. 볼륨 이름은 고유해야 합니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `disk`                       | 볼륨 내에 위치한 디스크.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `max_data_part_size_bytes`   | 이 볼륨의 어떤 디스크에 담길 수 있는 데이터 덩어리의 최대 크기. 만약 병합 결과가 max_data_part_size_bytes보다 큰 덩어리 크기가 예상된다면, 그 덩어리는 다음 볼륨으로 쓰여집니다. 기본적으로 이 기능은 새로운 / 작은 덩어리를 핫(SSD) 볼륨에 저장하고 큰 크기에 도달할 때 콜드(HDD) 볼륨으로 이동할 수 있게 합니다. 정책에 볼륨이 하나만 있다면 이 옵션은 사용하지 마세요.                                                                                                     |
| `move_factor`                | 볼륨의 사용 가능한 여유 공간의 비율. 공간이 부족해지면, 데이터는 다음 볼륨으로 전송되기 시작합니다(존재하는 경우). 전송할 때 덩어리는 크기 기준으로 큰 것에서 작은 순서로 정렬되며, 전체 크기가 `move_factor` 조건을 만족하는 덩어리를 선택합니다. 전체 크기가 충분하지 않으면 모든 덩어리가 이동됩니다.                                                                                                           |
| `perform_ttl_move_on_insert` | 삽입 시 만료된 TTL을 가진 데이터를 이동하는 것을 비활성화합니다. 기본적으로(활성화된 경우) 만료된 데이터 조각을 삽입하면 즉시 이동 규칙에 명시된 볼륨/디스크로 이동됩니다. 만약 대상 볼륨/디스크가 느리면 삽입 속도가 현저히 느려질 수 있습니다(예: S3). 비활성화하면 만료된 데이터의 일부가 기본 볼륨에 기록되고, 이후에 만료된 TTL에 대한 규칙에 지정된 볼륨으로 즉시 이동됩니다.              |
| `load_balancing`             | 디스크 균형 정책, `round_robin` 또는 `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `least_used_ttl_ms`          | 모든 디스크에서 사용 가능한 공간을 업데이트하는 타임아웃(밀리초 단위). (`0` - 항상 업데이트, `-1` - 절대 업데이트 하지 않음, 기본 값은 `60000`). ClickHouse에만 사용되는 디스크인 경우, 동적으로 파일 시스템 크기 조정의 영향을 받지 않는다면 `-1` 값을 사용할 수 있습니다. 그렇지 않은 경우, 이는 올바르지 않은 공간 할당으로 이어질 수 있으므로 권장하지 않습니다.                                                                                                           |
| `prefer_not_to_merge`        | 이 볼륨에 있는 데이터 부분의 병합을 비활성화합니다. 참고: 이는 잠재적으로 해로울 수 있으며 속도를 저하시킬 수 있습니다. 이 설정이 활성화되면(하지 마세요), 이 볼륨의 데이터 병합이 금지됩니다(안 좋음). ClickHouse가 느린 디스크와 상호작용하는 방식을 제어할 수 있도록 합니다. 우리는 이 기능을 사용하지 않는 것을 권장합니다.                                                                                                                                                   |
| `volume_priority`            | 볼륨이 채워지는 우선순위(순서)를 정의합니다. 값이 작을수록 우선 순위가 높습니다. 매개변수 값은 자연수여야 하며 1에서 N(N은 지정된 가장 큰 매개변수 값)까지의 범위를 커버해야 하며 공백이 없어야 합니다.                                                                                                                                                                                                                                                                    |

`volume_priority`에 대한 사항:
- 모든 볼륨이 이 매개변수를 가지고 있다면, 지정된 순서대로 우선 순위가 설정됩니다.
- 일부 볼륨만 이 매개변수를 가지고 있다면, 이 매개변수를 가지지 않은 볼륨이 가장 낮은 우선순위를 갖습니다. 매개변수를 가진 볼륨은 태그 값에 따라 우선 순위가 매겨지고 나머지 우선 순위는 구성 파일 내에서 서로에 대한 설명 순서에 따라 결정됩니다.
- 아무 볼륨도 이 매개변수를 지정하지 않은 경우, 그 순서는 구성 파일의 설명 순서에 의해 결정됩니다.
- 볼륨의 우선순위는 동일하지 않을 수 있습니다.
## 매크로 {#macros}

복제 테이블에 대한 매개변수 치환.

복제 테이블이 사용되지 않는 경우 생략할 수 있습니다.

자세한 내용은 [복제 테이블 생성](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) 섹션을 참조하세요.

**예시**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

Replicated 데이터베이스의 복제 그룹 이름.

Replicated 데이터베이스에 의해 생성된 클러스터는 동일한 그룹의 복제본으로 구성됩니다.
DDL 쿼리는 동일한 그룹의 복제본만 대기합니다.

기본적으로 비어 있습니다.

**예시**

```xml
<replica_group_name>backups</replica_group_name>
```
## remap_executable {#remap_executable}

히에리 페이지를 사용하여 기계 코드("텍스트")를 재할당하기 위한 설정.

:::note
이 기능은 매우 실험적입니다.
:::

예시:

```xml
<remap_executable>false</remap_executable>
```
## max_open_files {#max_open_files}

열 수 있는 최대 파일 수.

:::note
`getrlimit()` 함수가 잘못된 값을 반환하므로 macOS에서 이 옵션을 사용하는 것을 권장합니다.
:::

**예시**

```xml
<max_open_files>262144</max_open_files>
```
## max_session_timeout {#max_session_timeout}

최대 세션 타임아웃(초 단위).

예시:

```xml
<max_session_timeout>3600</max_session_timeout>
```
## merge_tree {#merge_tree}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에 대한 세부 조정.

자세한 내용은 MergeTreeSettings.h 헤더 파일을 참조하세요.

**예시**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

기본적으로 비활성화되어 있습니다.

**활성화**

메트릭 역사 수집을 수동으로 켜려면 [`system.metric_log`](../../operations/system-tables/metric_log.md)를 생성하고 `/etc/clickhouse-server/config.d/metric_log.xml`에 다음 내용을 추가하세요:

```xml
<clickhouse>
    <metric_log>
        <database>system</database>
        <table>metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </metric_log>
</clickhouse>
```

**비활성화**

`metric_log` 설정을 비활성화하려면 `/etc/clickhouse-server/config.d/disable_metric_log.xml` 파일을 생성하고 다음 내용을 추가하세요:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## replicated_merge_tree {#replicated_merge_tree}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에 대한 세부 조정. 이 설정은 더 높은 우선순위를 가집니다.

자세한 내용은 MergeTreeSettings.h 헤더 파일을 참조하세요.

**예시**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## opentelemetry_span_log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 시스템 테이블에 대한 설정.

<SystemLogParameters/>

예시:

```xml
<opentelemetry_span_log>
    <engine>
        engine MergeTree
        partition by toYYYYMM(finish_date)
        order by (finish_date, finish_time_us, trace_id)
    </engine>
    <database>system</database>
    <table>opentelemetry_span_log</table>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</opentelemetry_span_log>
```
## openSSL {#openSSL}

SSL 클라이언트/서버 구성.

SSL에 대한 지원은 `libpoco` 라이브러리에 의해 제공됩니다. 사용 가능한 구성 옵션은 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)에서 설명되어 있습니다. 기본값은 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp)에서 찾을 수 있습니다.

서버/클라이언트 설정에 대한 키:

| 옵션                           | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 기본 값                                |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| `privateKeyFile`              | PEM 인증서의 비밀 키가 포함된 파일 경로. 파일에는 키와 인증서가 동시에 포함될 수 있습니다.                                                                                                                                                                                                                                                                                                                                                             |                                        |
| `certificateFile`             | PEM 형식의 클라이언트/서버 인증서 파일 경로. `privateKeyFile`에 인증서가 포함되어 있는 경우 생략할 수 있습니다.                                                                                                                                                                                                                                                                                                                                        |                                        |
| `caConfig`                    | 신뢰할 수 있는 CA 인증서가 포함된 파일 또는 디렉토리 경로. 이 경로가 파일을 가리키면 PEM 형식이어야 하며 여러 CA 인증서를 포함할 수 있습니다. 경로가 디렉토리를 가리키면 CA 인증서당 하나의 .pem 파일이 포함되어야 합니다. 파일 이름은 CA 주체 이름 해시 값에 의해 조회됩니다. 자세한 내용은 [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) 매뉴얼 페이지에서 확인할 수 있습니다. |                                        |
| `verificationMode`            | 노드의 인증서를 확인하는 방법. 자세한 내용은 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 클래스의 설명을 참조하세요. 가능한 값: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                          | `relaxed`                              |
| `verificationDepth`           | 검증 체인 최대 길이. 인증서 체인 길이가 설정된 값을 초과하면 검증에 실패합니다.                                                                                                                                                                                                                                                                                                                                                                         | `9`                                    |
| `loadDefaultCAFile`           | OpenSSL에 대한 내장 CA 인증서를 사용할지 여부. ClickHouse는 기본 CA 인증서가 `/etc/ssl/cert.pem` 파일(또는 `/etc/ssl/certs` 디렉토리)이나 환경 변수 `SSL_CERT_FILE`(또는 `SSL_CERT_DIR`)로 지정된 파일(또는 디렉토리)에 있다고 가정합니다.                                                                                                                                      | `true`                                 |
| `cipherList`                  | 지원되는 OpenSSL 암호화 방식.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH` |
| `cacheSessions`               | 세션 캐싱을 활성화 또는 비활성화합니다. `sessionIdContext`와 함께 사용해야 합니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                                                                                                         | `false`                                |
| `sessionIdContext`            | 서버가 생성한 각 식별자에 추가하는 고유한 임의 문자 세트. 문자열의 길이는 `SSL_MAX_SSL_SESSION_ID_LENGTH`를 초과할 수 없습니다. 이 매개변수는 항상 권장되며, 서버가 세션을 캐시하든 클라이언트가 캐싱을 요청하든 문제를 피하는 데 도움이 됩니다.                                                                                                                                                                               | `$\{application.name\}`                  |
| `sessionCacheSize`            | 서버가 캐시하는 세션의 최대 수. `0` 값은 제한 없는 세션을 의미합니다.                                                                                                                                                                                                                                                                                                                                                                                  | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | 서버에서 세션을 캐시하는 시간(시간 단위).                                                                                                                                                                                                                                                                                                                                                                                                                             | `2`                                    |
| `extendedVerification`        | 활성화된 경우 인증서 CN 또는 SAN이 피어 호스트 이름과 일치하는지 확인합니다.                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                |
| `requireTLSv1`                | TLSv1 연결을 요구합니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                  | `false`                                |
| `requireTLSv1_1`              | TLSv1.1 연결을 요구합니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                  | `false`                                |
| `requireTLSv1_2`              | TLSv1.2 연결을 요구합니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                  | `false`                                |
| `fips`                        | OpenSSL FIPS 모드를 활성화합니다. 라이브러리의 OpenSSL 버전이 FIPS를 지원하는 경우 지원됩니다.                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                |
| `privateKeyPassphraseHandler` | 비공개 키에 접근하기 위한 비밀번호를 요청하는 클래스(PrivateKeyPassphraseHandler 하위 클래스). 예를 들어: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                 | `KeyConsoleHandler`                     |
| `invalidCertificateHandler`   | 유효하지 않은 인증서를 검증하기 위한 클래스(CertificateHandler의 하위 클래스). 예: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`.                                                                                                                                                                                                                                                                      | `RejectCertificateHandler`              |
| `disableProtocols`            | 사용이 허용되지 않는 프로토콜.                                                                                                                                                                                                                                                                                                                                                                                                                                      |                                        |
| `preferServerCiphers`         | 클라이언트가 선호하는 서버 암호 방식.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `false`                                |

**설정 예시:**

```xml
<openSSL>
    <server>
        <!-- openssl req -subj "/CN=localhost" -new -newkey rsa:2048 -days 365 -nodes -x509 -keyout /etc/clickhouse-server/server.key -out /etc/clickhouse-server/server.crt -->
        <certificateFile>/etc/clickhouse-server/server.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/server.key</privateKeyFile>
        <!-- openssl dhparam -out /etc/clickhouse-server/dhparam.pem 4096 -->
        <dhParamsFile>/etc/clickhouse-server/dhparam.pem</dhParamsFile>
        <verificationMode>none</verificationMode>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
    </server>
    <client>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
        <!-- Use for self-signed: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Use for self-signed: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```
## part_log {#part_log}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)와 관련된 이벤트를 로깅합니다. 예를 들어, 데이터 추가 또는 병합. 로그를 사용하여 병합 알고리즘을 시뮬레이션하고 그 특성을 비교할 수 있습니다. 병합 과정을 시각화할 수 있습니다.

쿼리는 [system.part_log](/operations/system-tables/part_log) 테이블에 기록되며, 별도의 파일에는 기록되지 않습니다. 이 테이블의 이름은 `table` 매개변수에서 구성할 수 있습니다(아래 참조).

<SystemLogParameters/>

**예시**

```xml
<part_log>
    <database>system</database>
    <table>part_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</part_log>
```
## path {#path}

데이터가 포함된 디렉터리의 경로.

:::note
트레일링 슬래시는 필수입니다.
:::

**예시**

```xml
<path>/var/lib/clickhouse/</path>
```
## processors_profile_log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) 시스템 테이블에 대한 설정.

<SystemLogParameters/>

기본 설정은 다음과 같습니다:

```xml
<processors_profile_log>
    <database>system</database>
    <table>processors_profile_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</processors_profile_log>
```
## prometheus {#prometheus}

[Prometheus](https://prometheus.io)에서 스크래핑할 수 있도록 메트릭 데이터를 노출합니다.

설정:

- `endpoint` – prometheus 서버에서 메트릭을 스크래핑하기 위한 HTTP 엔드포인트. '/'에서 시작합니다.
- `port` – `endpoint`를 위한 포트입니다.
- `metrics` – [system.metrics](/operations/system-tables/metrics) 테이블에서 메트릭을 노출합니다.
- `events` – [system.events](/operations/system-tables/events) 테이블에서 메트릭을 노출합니다.
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 테이블에서 현재 메트릭 값을 노출합니다.
- `errors` - 마지막 서버 재시작 이후 발생한 오류 코드에 의한 오류 수를 노출합니다. 이 정보는 [system.errors](/operations/system-tables/errors)에서 얻을 수 있습니다.

**예시**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
        <errors>true</errors>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

다음 항목을 확인하십시오 (ClickHouse 서버의 IP 주소 또는 호스트 이름으로 `127.0.0.1`를 바꾸십시오):
```bash
curl 127.0.0.1:9363/metrics
```
## query_log {#query_log}

[log_queries=1](../../operations/settings/settings.md) 설정으로 수신된 쿼리를 로깅하기 위한 설정입니다.

쿼리는 [system.query_log](/operations/system-tables/query_log) 테이블에 기록되며, 별도의 파일에는 기록되지 않습니다. 테이블의 이름은 `table` 매개변수에서 구성할 수 있습니다(아래 참조).

<SystemLogParameters/>

테이블이 존재하지 않으면 ClickHouse가 이를 생성합니다. ClickHouse 서버가 업데이트되었을 때 쿼리 로그의 구조가 변경되었다면, 이전 구조의 테이블이 이름이 변경되고 새로운 테이블이 자동으로 생성됩니다.

**예시**

```xml
<query_log>
    <database>system</database>
    <table>query_log</table>
    <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_log>
```
## query_metric_log {#query_metric_log}

기본적으로 비활성화되어 있습니다.

**활성화**

메트릭 역사 수집을 수동으로 켜려면 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)를 생성하고 `/etc/clickhouse-server/config.d/query_metric_log.xml`에 다음 내용을 추가하세요:

```xml
<clickhouse>
    <query_metric_log>
        <database>system</database>
        <table>query_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_metric_log>
</clickhouse>
```

**비활성화**

`query_metric_log` 설정을 비활성화하려면 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` 파일을 생성하고 다음 내용을 추가하세요:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

[쿼리 캐시](../query-cache.md) 구성.

사용 가능한 설정은 다음과 같습니다:

| 설정                        | 설명                                                                            | 기본 값         |
|-----------------------------|--------------------------------------------------------------------------------|-----------------|
| `max_size_in_bytes`         | 최대 캐시 크기(바이트 단위). `0`은 쿼리 캐시를 비활성화함을 의미합니다.           | `1073741824`    |
| `max_entries`               | 캐시에 저장되는 `SELECT` 쿼리 결과의 최대 수.                                     | `1024`          |
| `max_entry_size_in_bytes`   | 캐시에 저장되는 `SELECT` 쿼리 결과의 최대 크기(바이트 단위).                     | `1048576`       |
| `max_entry_size_in_rows`    | 캐시에 저장되는 `SELECT` 쿼리 결과의 최대 행 수.                                | `30000000`      |

:::note
- 변경된 설정은 즉시 적용됩니다.
- 쿼리 캐시 데이터는 DRAM에 할당됩니다. 메모리가 부족한 경우 `max_size_in_bytes` 값을 작게 설정하거나 쿼리 캐시를 완전히 비활성화하는 것이 좋습니다.
:::

**예시**

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```
## query_thread_log {#query_thread_log}

[log_query_threads=1](/operations/settings/settings#log_query_threads) 설정으로 수신된 쿼리의 스레드를 로깅하기 위한 설정입니다.

쿼리는 [system.query_thread_log](/operations/system-tables/query_thread_log) 테이블에 기록되며, 별도의 파일에는 기록되지 않습니다. 테이블의 이름은 `table` 매개변수에서 구성할 수 있습니다(아래 참조).

<SystemLogParameters/>

테이블이 존재하지 않으면 ClickHouse가 이를 생성합니다. ClickHouse 서버가 업데이트되었을 때 쿼리 스레드 로그의 구조가 변경되었다면, 이전 구조의 테이블이 이름이 변경되고 새로운 테이블이 자동으로 생성됩니다.

**예시**

```xml
<query_thread_log>
    <database>system</database>
    <table>query_thread_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_thread_log>
```
## query_views_log {#query_views_log}

[log_query_views=1](/operations/settings/settings#log_query_views) 설정으로 수신된 쿼리에 따라 의존적인 뷰(실시간, 물리화 등)를 로깅하기 위한 설정입니다.

쿼리는 [system.query_views_log](/operations/system-tables/query_views_log) 테이블에 기록되며, 별도의 파일에는 기록되지 않습니다. 테이블의 이름은 `table` 매개변수에서 구성할 수 있습니다(아래 참조).

<SystemLogParameters/>

테이블이 존재하지 않으면 ClickHouse가 이를 생성합니다. ClickHouse 서버가 업데이트되었을 때 쿼리 뷰 로그의 구조가 변경되었다면, 이전 구조의 테이블이 이름이 변경되고 새로운 테이블이 자동으로 생성됩니다.

**예시**

```xml
<query_views_log>
    <database>system</database>
    <table>query_views_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_views_log>
```
## text_log {#text_log}

텍스트 메시지를 로깅하기 위한 [text_log](/operations/system-tables/text_log) 시스템 테이블에 대한 설정.

<SystemLogParameters/>

추가로:

| 설정   | 설명                                                                                                                                                                                         | 기본 값     |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `level` | 테이블에 저장될 최대 메시지 수준(기본값 `Trace`).                                                                                                                                            | `Trace`     |

**예시**

```xml
<clickhouse>
    <text_log>
        <level>notice</level>
        <database>system</database>
        <table>text_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <partition_by>event_date</partition_by> -->
        <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    </text_log>
</clickhouse>
```
## trace_log {#trace_log}

[trace_log](/operations/system-tables/trace_log) 시스템 테이블 작업에 대한 설정입니다.

<SystemLogParameters/>

기본 서버 구성 파일 `config.xml`에는 다음 설정 섹션이 포함되어 있습니다:

```xml
<trace_log>
    <database>system</database>
    <table>trace_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <symbolize>false</symbolize>
</trace_log>
```
## asynchronous_insert_log {#asynchronous_insert_log}

비동기 삽입을 로깅하기 위한 [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) 시스템 테이블에 대한 설정.

<SystemLogParameters/>

**예시**

```xml
<clickhouse>
    <asynchronous_insert_log>
        <database>system</database>
        <table>asynchronous_insert_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </asynchronous_insert_log>
</clickhouse>
```
## crash_log {#crash_log}

[crash_log](../../operations/system-tables/crash_log.md) 시스템 테이블 작업에 대한 설정입니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| 설정                                 | 설명                                                                                                                                                 | 기본값               | 비고                                                                                                               |
|--------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|-------------------------------------------------------------------------------------------------------------------|
| `database`                           | 데이터베이스의 이름.                                                                                                                                 |                      |                                                                                                                   |
| `table`                              | 시스템 테이블의 이름.                                                                                                                                 |                      |                                                                                                                   |
| `engine`                             | 시스템 테이블에 대한 [MergeTree 엔진 정의](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table). |                      | `partition_by` 또는 `order_by`가 정의되어 있는 경우 사용할 수 없습니다. 지정하지 않으면 기본적으로 `MergeTree`가 선택됩니다.        |
| `partition_by`                       | 시스템 테이블에 대한 [사용자 정의 파티셔닝 키](/engines/table-engines/mergetree-family/custom-partitioning-key.md).                             |                      | 시스템 테이블에 대해 `engine`이 지정된 경우, `partition_by` 매개변수는 'engine' 내부에서 직접 지정해야 합니다.                  |
| `ttl`                                | 테이블 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)을 지정합니다.                                            |                      | 시스템 테이블에 대해 `engine`이 지정된 경우, `ttl` 매개변수는 'engine' 내부에서 직접 지정해야 합니다.                             |
| `order_by`                           | 시스템 테이블에 대한 [사용자 정의 정렬 키](/engines/table-engines/mergetree-family/mergetree#order_by). `engine`이 정의되어 있는 경우 사용할 수 없습니다. |                      | 시스템 테이블에 대해 `engine`이 지정된 경우, `order_by` 매개변수는 'engine' 내부에서 직접 지정해야 합니다.                       |
| `storage_policy`                     | 테이블에서 사용할 스토리지 정책의 이름 (선택 사항).                                                                                                  |                      | 시스템 테이블에 대해 `engine`이 지정된 경우, `storage_policy` 매개변수는 'engine' 내부에서 직접 지정해야 합니다.                    |
| `settings`                           | MergeTree의 동작을 제어하는 [추가 매개변수](/engines/table-engines/mergetree-family/mergetree/#settings) (선택 사항).                          |                      | 시스템 테이블에 대해 `engine`이 지정된 경우, `settings` 매개변수는 'engine' 내부에서 직접 지정해야 합니다.                          |
| `flush_interval_milliseconds`        | 메모리에서 테이블로 데이터를 플러시하는 간격.                                                                                                          | `7500`               |                                                                                                                   |
| `max_size_rows`                      | 로그의 최대 행 크기. 비플러시 로그의 개수가 max_size에 도달하면 로그가 디스크에 덤프됩니다.                                                             | `1024`               |                                                                                                                   |
| `reserved_size_rows`                 | 로그에 대한 미리 할당된 메모리 크기.                                                                                                                  | `1024`               |                                                                                                                   |
| `buffer_size_rows_flush_threshold`   | 행의 수에 대한 임계값. 임계값에 도달하면 로그를 백그라운드에서 디스크로 플러시합니다.                                                                    | `max_size_rows / 2` |                                                                                                                   |
| `flush_on_crash`                     | 충돌 시 로그를 디스크에 덤프해야 하는지 여부를 설정합니다.                                                                                                 | `false`              |                                                                                                                   |

기본 서버 구성 파일 `config.xml`에는 다음 설정 섹션이 포함되어 있습니다:

```xml
<crash_log>
    <database>system</database>
    <table>crash_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1024</max_size_rows>
    <reserved_size_rows>1024</reserved_size_rows>
    <buffer_size_rows_flush_threshold>512</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</crash_log>
```
## custom_cached_disks_base_directory {#custom_cached_disks_base_directory}

이 설정은 사용자 정의(실행 중 SQL로 생성된) 캐시 디스크의 캐시 경로를 지정합니다.
`custom_cached_disks_base_directory`는 사용자 정의 디스크에 대해 `filesystem_caches_path`보다 높은 우선순위를 가지며(`filesystem_caches_path.xml`에서 발견됨), 이전 설정이 없는 경우 사용됩니다.
파일 시스템 캐시 설정 경로는 해당 경로 내에 있어야 하며, 그렇지 않으면 디스크 생성이 방지되는 예외가 발생합니다.

:::note
이것은 서버가 업그레이드된 이전 버전에서 생성된 디스크에 영향을 미치지 않습니다.
이 경우, 서버가 성공적으로 시작할 수 있도록 예외가 발생하지 않습니다.
:::

예제:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## backup_log {#backup_log}

`BACKUP` 및 `RESTORE` 작업을 기록하기 위한 [backup_log](../../operations/system-tables/backup_log.md) 시스템 테이블의 설정입니다.

<SystemLogParameters/>

**예제**

```xml
<clickhouse>
    <backup_log>
        <database>system</database>
        <table>backup_log</table>
        <flush_interval_milliseconds>1000</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </backup_log>
</clickhouse>
```
## blob_storage_log {#blob_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters/>

예제:

```xml
<blob_storage_log>
    <database>system</database
    <table>blob_storage_log</table
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```
## query_masking_rules {#query_masking_rules}

서버 로그에 저장하기 전에 쿼리와 모든 로그 메시지에 적용될 정규 표현식 기반 규칙입니다,
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) 테이블과 클라이언트에 전송되는 로그에서. 이를 통해 이름, 이메일, 개인 식별자 또는 신용 카드 번호와 같은 SQL 쿼리에서 민감한 데이터 유출을 방지할 수 있습니다.

**예제**

```xml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**구성 필드**:

| 설정      | 설명                                                                    |
|----------|-------------------------------------------------------------------------|
| `name`   | 규칙의 이름 (선택 사항)                                               |
| `regexp` | RE2 호환 정규 표현식 (필수)                                          |
| `replace`| 민감한 데이터에 대한 대체 문자열 (선택 사항, 기본값: 여섯 개의 별표) |

마스킹 규칙은 잘못된 형식의 쿼리나 파싱할 수 없는 쿼리로부터 민감한 데이터 유출을 방지하기 위해 전체 쿼리에 적용됩니다.

[`system.events`](/operations/system-tables/events) 테이블에는 쿼리 마스킹 규칙이 일치한 전체 수치를 가진 카운터 `QueryMaskingRulesMatch`가 있습니다.

분산 쿼리의 경우 각 서버는 별도로 구성해야 하며, 그렇지 않으면 다른 노드에 전달된 서브쿼리는 마스킹 없이 저장됩니다.
## remote_servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) 테이블 엔진 및 `cluster` 테이블 함수에 의해 사용되는 클러스터의 구성.

**예제**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 속성의 값에 대해서는 "[구성 파일](/operations/configuration-files)" 섹션을 참조하십시오.

**참고**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Cluster Discovery](../../operations/cluster-discovery.md)
- [Replicated database engine](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

URL 관련 스토리지 엔진 및 테이블 함수에서 사용할 수 있는 허용된 호스트 목록.

`\<host\>` XML 태그로 호스트를 추가할 때:
- URL에서와 정확히 동일하게 지정해야 하며, 이름은 DNS 해석 전에 확인됩니다. 예: `<host>clickhouse.com</host>`
- URL에 포트가 명시적으로 지정된 경우, host:port가 전체적으로 확인됩니다. 예: `<host>clickhouse.com:80</host>`
- 포트 없이 호스트가 지정된 경우, 해당 호스트의 모든 포트가 허용됩니다. 예: `<host>clickhouse.com</host>`가 지정된 경우 `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) 등이 허용됩니다.
- 호스트가 IP 주소로 지정된 경우, URL에 지정된 대로 확인됩니다. 예: `[2a02:6b8:a::a]`.
- 리디렉션이 있고 리디렉션을 지원하는 경우, 모든 리디렉션(위치 필드)이 확인됩니다.

예를 들어:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## timezone {#timezone}

서버의 시간대.

UTC 시간대 또는 지리적 위치에 대한 IANA 식별자로 지정됩니다 (예: Africa/Abidjan).

시간대는 DateTime 필드가 텍스트 형식으로 출력될 때(화면이나 파일에 인쇄됨) 및 문자열에서 DateTime을 가져올 때 문자열과 DateTime 형식之间的 변환에 필요합니다. 또한, 시간대를 입력 매개변수로 받지 않은 경우 시간과 날짜와 함께 작동하는 함수에서 사용됩니다.

**예제**

```xml
<timezone>Asia/Istanbul</timezone>
```

**참고**

- [session_timezone](../settings/settings.md#session_timezone)
## tcp_port {#tcp_port}

TCP 프로토콜을 통해 클라이언트와 통신하기 위한 포트입니다.

**예제**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

클라이언트와의 안전한 통신을 위한 TCP 포트입니다. [OpenSSL](#openssl) 설정과 함께 사용하십시오.

**기본값**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## mysql_port {#mysql_port}

MySQL 프로토콜을 통해 클라이언트와 통신하기 위한 포트입니다.

:::note
- 양의 정수는 수신할 포트 번호를 지정합니다.
- 빈 값은 MySQL 프로토콜을 통해 클라이언트와의 통신을 비활성화하는 데 사용됩니다.
:::

**예제**

```xml
<mysql_port>9004</mysql_port>
```
## postgresql_port {#postgresql_port}

PostgreSQL 프로토콜을 통해 클라이언트와 통신하기 위한 포트입니다.

:::note
- 양의 정수는 수신할 포트 번호를 지정합니다.
- 빈 값은 PostgreSQL 프로토콜을 통해 클라이언트와의 통신을 비활성화하는 데 사용됩니다.
:::

**예제**

```xml
<postgresql_port>9005</postgresql_port>
```
## mysql_require_secure_transport {#mysql_require_secure_transport}

true로 설정하면 클라이언트와의 [mysql_port](#mysql_port)를 통한 안전한 통신이 요구됩니다. `--ssl-mode=none` 옵션과 함께 연결하면 거부됩니다. [OpenSSL](#openssl) 설정과 함께 사용하십시오.
## postgresql_require_secure_transport {#postgresql_require_secure_transport}

true로 설정하면 클라이언트와의 [postgresql_port](#postgresql_port)를 통한 안전한 통신이 요구됩니다. `sslmode=disable` 옵션과 함께 연결하면 거부됩니다. [OpenSSL](#openssl) 설정과 함께 사용하십시오.
## tmp_path {#tmp_path}

대형 쿼리를 처리하기 위해 임시 데이터를 저장하는 로컬 파일 시스템의 경로입니다.

:::note
- 임시 데이터 저장을 구성하기 위해 사용할 수 있는 옵션은 하나만 사용할 수 있습니다: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- 후방 슬래시는 필수입니다.
:::

**예제**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

줄이거나 기호화된 URL 접두사를 전체 URL로 변환하기 위한 구성입니다.

예제:

```xml
<url_scheme_mappers>
    <s3>
        <to>https://{bucket}.s3.amazonaws.com</to>
    </s3>
    <gs>
        <to>https://storage.googleapis.com/{bucket}</to>
    </gs>
    <oss>
        <to>https://{bucket}.oss.aliyuncs.com</to>
    </oss>
</url_scheme_mappers>
```
## user_files_path {#user_files_path}

사용자 파일이 있는 디렉토리입니다. 테이블 함수 [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md)에서 사용됩니다.

**예제**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path}

사용자 스크립트 파일이 있는 디렉토리입니다. 실행 가능한 사용자 정의 함수 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)용으로 사용됩니다.

**예제**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

유형:

기본값:
## user_defined_path {#user_defined_path}

사용자 정의 파일이 있는 디렉토리입니다. SQL 사용자 정의 함수 [SQL User Defined Functions](/sql-reference/functions/udf) 위해 사용됩니다.

**예제**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## users_config {#users_config}

사용자 및 역할 구성 파일의 경로입니다:

- 사용자 구성.
- 접근 권한.
- 설정 프로필.
- 쿼타 설정.

**예제**

```xml
<users_config>users.xml</users_config>
```
## access_control_improvements {#access_control_improvements}

액세스 제어 시스템의 선택적 개선을 위한 설정입니다.

| 설정                                         | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 기본값 |
|----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows` | 허용된 행 정책이 없는 사용자가 여전히 `SELECT` 쿼리를 통해 행을 읽을 수 있는지에 대한 설정입니다. 예를 들어, 사용자 A와 B가 있고 행 정책이 A에 대해서만 정의된 경우, 이 설정이 true이면 사용자 B는 모든 행을 볼 수 있습니다. 이 설정이 false이면 사용자 B는 아무 행도 볼 수 없습니다.                                                                                                                                                         | `true`  |
| `on_cluster_queries_require_cluster_grant` | `ON CLUSTER` 쿼리가 `CLUSTER` 권한을 요구하는지에 대한 설정입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`     | `SELECT * FROM system.<table>`이 권한이 필요하고 모든 사용자가 실행할 수 있는지에 대한 설정입니다. true로 설정하면 이 쿼리는 비시스템 테이블과 마찬가지로 `GRANT SELECT ON system.<table>`을 요구합니다. 예외: 몇몇 시스템 테이블(`tables`, `columns`, `databases` 및 `one`, `contributors`와 같은 상수 테이블)은 여전히 모든 사용자에게 접근 가능하며, `SHOW` 권한(예: `SHOW USERS`)이 부여된 경우 해당 시스템 테이블(예: `system.users`)에 접근할 수 있습니다. | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>`이 권한이 필요하고 모든 사용자가 실행할 수 있는지에 대한 설정입니다. true로 설정하면 이 쿼리는 일반 테이블과 마찬가지로 `GRANT SELECT ON information_schema.<table>`을 요구합니다.                                                                                                                                                                                                                                                            | `true`  |
| `settings_constraints_replace_previous`     | 특정 설정에 대한 설정 프로필에서 제약 조건이 이전 제약 조건(다른 프로필에서 정의됨)의 작업을 취소할 것인지에 대한 설정입니다. 새 제약 조건에 의해 설정되지 않은 필드를 포함합니다. 또한 `changeable_in_readonly` 제약 조건 유형을 활성화합니다.                                                                                                                                                                                            | `true`  |
| `table_engines_require_grant`               | 특정 테이블 엔진을 사용하여 테이블을 생성하는 것이 권한을 요구하는지에 대한 설정입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`        | 역할이 역할 캐시에 저장된 마지막 접근 이후 초 수.                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`   |

예제:

```xml
<access_control_improvements>
    <users_without_row_policies_can_read_rows>true</users_without_row_policies_can_read_rows>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
    <select_from_system_db_requires_grant>true</select_from_system_db_requires_grant>
    <select_from_information_schema_requires_grant>true</select_from_information_schema_requires_grant>
    <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
    <table_engines_require_grant>false</table_engines_require_grant>
    <role_cache_expiration_time_seconds>600</role_cache_expiration_time_seconds>
</access_control_improvements>
```
## s3queue_log {#s3queue_log}

`s3queue_log` 시스템 테이블에 대한 설정입니다.

<SystemLogParameters/>

기본 설정은 다음과 같습니다:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```
## dead_letter_queue {#dead_letter_queue}

'dead_letter_queue' 시스템 테이블에 대한 설정입니다.

<SystemLogParameters/>

기본 설정은 다음과 같습니다:

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```
## zookeeper {#zookeeper}

ClickHouse가 [ZooKeeper](http://zookeeper.apache.org/) 클러스터와 상호작용할 수 있도록 하는 설정을 포함합니다. ClickHouse는 복제 테이블을 사용할 때 복제본의 메타데이터를 저장하기 위해 ZooKeeper를 사용합니다. 복제 테이블을 사용하지 않는 경우 이 매개변수 섹션은 생략할 수 있습니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| 설정                                    | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                  | ZooKeeper 엔드포인트. 여러 엔드포인트를 설정할 수 있습니다. 예: `<node index="1"><host>example_host</host><port>2181</port></node>`. `index` 속성은 ZooKeeper 클러스터에 연결할 때의 노드 순서를 지정합니다.                                                                                                                                                                                                                                                                                            |
| `session_timeout_ms`                    | 클라이언트 세션의 최대 타임아웃(밀리초).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `operation_timeout_ms`                  | 하나의 작업에 대한 최대 타임아웃(밀리초).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `root` (선택 사항)                     | ClickHouse 서버에서 사용되는 znode의 루트로 사용되는 znode.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min` (선택 사항) | 기본 노드가 사용할 수 없는 경우 대체 노드에 대한 zookeeper 세션의 수명에 대한 최소 한도(로드 밸런싱). 초로 설정. 기본값: 3시간.                                                                                                                                                                                                                                                                                                                                                       |
| `fallback_session_lifetime.max` (선택 사항) | 기본 노드가 사용할 수 없는 경우 대체 노드에 대한 zookeeper 세션의 수명에 대한 최대 한도(로드 밸런싱). 초로 설정. 기본값: 6시간.                                                                                                                                                                                                                                                                                                                                                      |
| `identity` (선택 사항)                 | 요청된 znodes에 접근하기 위해 ZooKeeper에서 요구하는 사용자 및 패스워드.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `use_compression` (선택 사항)           | true로 설정하면 Keeper 프로토콜에서 압축을 활성화합니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

또한 ZooKeeper 노드 선택을 위한 알고리즘을 선택할 수 있는 `zookeeper_load_balancing` 설정(선택 사항)도 있습니다:

| 알고리즘 이름                 | 설명                                                                                                                      |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `random`                      | ZooKeeper 노드 중 하나를 무작위로 선택합니다.                                                                                     |
| `in_order`                    | 첫 번째 ZooKeeper 노드를 선택하고 이용할 수 없으면 두 번째를 선택하는 형식입니다.                                               |
| `nearest_hostname`            | 서버의 호스트 이름과 가장 유사한 ZooKeeper 노드를 선택하며, 호스트 이름은 이름 접두사와 비교됩니다.                               |
| `hostname_levenshtein_distance` | nearest_hostname과 유사하지만, 호스트 이름을 레벤슈타인 거리 방식으로 비교합니다.                                                      |
| `first_or_random`             | 첫 번째 ZooKeeper 노드를 선택하고, 이용할 수 없으면 남은 ZooKeeper 노드 중 하나를 무작위로 선택합니다.                       |
| `round_robin`                 | 첫 번째 ZooKeeper 노드를 선택하고, 재연결이 발생하면 다음 노드를 선택합니다.                                                      |

**예제 구성**

```xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <session_timeout_ms>30000</session_timeout_ms>
    <operation_timeout_ms>10000</operation_timeout_ms>
    <!-- Optional. Chroot suffix. Should exist. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Optional. Zookeeper digest ACL string. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**참고**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper 프로그래머 가이드](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse와 Zookeeper 간의 선택적 보안 통신](/operations/ssl-zookeeper)
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeper에서 데이터 파트 헤더의 저장 방법입니다. 이 설정은 [`MergeTree`](/engines/table-engines/mergetree-family) 계열에만 적용됩니다. 다음과 같이 지정할 수 있습니다:

**전역적으로 `config.xml` 파일의 [merge_tree](#merge_tree) 섹션에서**

ClickHouse는 서버의 모든 테이블에 대한 설정을 사용합니다. 언제든지 설정을 변경할 수 있습니다. 기존 테이블은 설정이 변경될 때 동작이 변경됩니다.

**각 테이블별로**

테이블을 생성할 때 해당 [엔진 설정](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)을 지정합니다. 이 설정이 있는 기존 테이블의 동작은 전역 설정이 변경되더라도 변경되지 않습니다.

**가능한 값**

- `0` — 기능이 꺼집니다.
- `1` — 기능이 켜집니다.

`use_minimalistic_part_header_in_zookeeper = 1`인 경우, [replicated](../../engines/table-engines/mergetree-family/replication.md) 테이블은 단일 `znode`를 사용하여 데이터 파트의 헤더를 압축하여 저장합니다. 테이블이 많은 컬럼을 포함하는 경우, 이 저장 방법은 ZooKeeper에 저장되는 데이터의 양을 크게 줄입니다.

:::note
`use_minimalistic_part_header_in_zookeeper = 1`을 적용한 후, 이 설정을 지원하지 않는 버전으로 ClickHouse 서버를 다운그레이드할 수 없습니다. 클러스터의 서버에서 ClickHouse 업그레이드 시 주의하십시오. 모든 서버를 한 번에 업그레이드하지 않는 것이 안전합니다. ClickHouse의 새 버전을 테스트 환경에서 또는 클러스터의 몇몇 서버에서 테스트하는 것이 더 안전합니다.

이 설정으로 이미 저장된 데이터 파트 헤더는 이전(비압축) 형태로 복원할 수 없습니다.
:::
## distributed_ddl {#distributed_ddl}

클러스터에서 [분산 ddl 쿼리](../../sql-reference/distributed-ddl.md)( `CREATE`, `DROP`, `ALTER`, `RENAME`) 실행 관리.
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 가 활성화되어 있어야만 작동합니다.

`<distributed_ddl>` 내에서 구성 가능한 설정은 다음과 같습니다:

| 설정                | 설명                                                                                                                        | 기본값                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------|----------------------------------|
| `path`              | DDL 쿼리를 위한 `task_queue`의 Keeper 내 경로                                                                             |                                  |
| `profile`           | DDL 쿼리를 실행하는 데 사용되는 프로파일                                                                                 |                                  |
| `pool_size`         | 동시에 실행할 수 있는 `ON CLUSTER` 쿼리 수                                                                               |                                  |
| `max_tasks_in_queue`| 큐에 있을 수 있는 작업의 최대 수                                                                                         | `1,000`                          |
| `task_max_lifetime` | 노드의 수명이 이 값보다 크면 삭제합니다.                                                                                  | `7 * 24 * 60 * 60` (초 단위의 일주일) |
| `cleanup_delay_period` | 마지막 청소가 이루어진 지 `cleanup_delay_period` 초보다 이전에 새로운 노드 이벤트가 수신되면 청소가 시작됩니다. | `60` 초                          |

**예제**

```xml
<distributed_ddl>
    <!-- Path in ZooKeeper to queue with DDL queries -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Settings from this profile will be used to execute DDL queries -->
    <profile>default</profile>

    <!-- Controls how much ON CLUSTER queries can be run simultaneously. -->
    <pool_size>1</pool_size>

    <!--
         Cleanup settings (active tasks will not be removed)
    -->

    <!-- Controls task TTL (default 1 week) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Controls how often cleanup should be performed (in seconds) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Controls how many tasks could be in the queue -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## access_control_path {#access_control_path}

SQL 명령으로 생성된 사용자 및 역할 구성을 ClickHouse 서버에 저장하는 폴더의 경로입니다.

**참고**

- [Access Control and Account Management](/operations/access-rights#access-control-usage)
## allow_plaintext_password {#allow_plaintext_password}

평문 비밀번호 타입(보안이 취약함)을 허용할지 여부를 설정합니다.

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_no_password {#allow_no_password}

no_password의 보안이 취약한 비밀번호 타입을 허용할지 여부를 설정합니다.

```xml
<allow_no_password>1</allow_no_password>
```
## allow_implicit_no_password {#allow_implicit_no_password}

'IDENTIFIED WITH no_password'가 명시적으로 지정되지 않는 한 비밀번호가 없는 사용자 생성을 금지합니다.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## default_session_timeout {#default_session_timeout}

기본 세션 시간 제한(초 단위)입니다.

```xml
<default_session_timeout>60</default_session_timeout>
```
## default_password_type {#default_password_type}

`CREATE USER u IDENTIFIED BY 'p'`와 같은 쿼리에 대해 자동으로 설정될 비밀번호 타입을 설정합니다.

허용되는 값은:
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## user_directories {#user_directories}

다음 설정을 포함하는 구성 파일 섹션입니다:
- 미리 정의된 사용자의 구성 파일 경로.
- SQL 명령으로 생성된 사용자가 저장되는 폴더 경로.
- SQL 명령으로 생성된 사용자들이 저장되고 복제되는 ZooKeeper 노드 경로.

이 섹션이 지정되면 [users_config](/operations/server-configuration-parameters/settings#users_config) 및 [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path)에서의 경로는 사용되지 않습니다.

`user_directories` 섹션은 항목 수에 제한이 없으며, 항목의 순서는 우선 순위를 의미합니다(항목이 높을수록 우선 순위도 높습니다).

**예시**

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <local_directory>
        <path>/var/lib/clickhouse/access/</path>
    </local_directory>
</user_directories>
```

사용자, 역할, 행 정책, 할당량 및 프로필은 ZooKeeper에 저장될 수 있습니다:

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <replicated>
        <zookeeper_path>/clickhouse/access/</zookeeper_path>
    </replicated>
</user_directories>
```

또한 `memory` 섹션을 정의할 수 있습니다 — 이는 정보를 메모리에만 저장하며 디스크에 기록하지 않음을 의미하고, `ldap` 섹션은 정보를 LDAP 서버에 저장함을 의미합니다.

로컬에서 정의되지 않은 사용자의 원격 사용자 디렉토리로 LDAP 서버를 추가하려면, 다음 설정을 포함한 단일 `ldap` 섹션을 정의하십시오:

| 설정     | 설명                                                                                                                                                                                                                                                                                                                                                                   |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | `ldap_servers` 구성 섹션에 정의된 LDAP 서버 이름 중 하나입니다. 이 매개변수는 필수이며 비워 둘 수 없습니다.                                                                                                                                                                                                                                                  |
| `roles`  | LDAP 서버에서 검색된 각 사용자에게 할당될 로컬에서 정의된 역할 목록을 포함하는 섹션입니다. 역할이 지정되지 않으면 사용자는 인증 후 아무 작업도 수행할 수 없습니다. 인증 시 나열된 역할 중 하나라도 로컬에서 정의되지 않은 경우 인증 시도가 잘못된 비밀번호인 것처럼 실패합니다. |

**예시**

```xml
<ldap>
    <server>my_ldap_server</server>
        <roles>
            <my_local_role1 />
            <my_local_role2 />
        </roles>
</ldap>
```
## top_level_domains_list {#top_level_domains_list}

각 항목이 형식 `<name>/path/to/file</name>`인 사용자 정의 최상위 도메인 목록을 정의합니다.

예를 들어:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

또한 참조:
- 함수 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) 및 그 변형들로, 커스텀 TLD 목록 이름을 받아 최상위 의미 있는 서브도메인까지의 도메인 부분을 반환합니다.
## proxy {#proxy}

현재 S3 저장소, S3 테이블 함수 및 URL 함수에서 지원되는 HTTP 및 HTTPS 요청에 대한 프록시 서버를 정의합니다.

프록시 서버를 정의하는 세 가지 방법이 있습니다:
- 환경 변수
- 프록시 목록
- 원격 프록시 해상자.

특정 호스트에 대한 프록시 서버 우회를 지원하는 `no_proxy` 사용 가능.

**환경 변수**

`http_proxy` 및 `https_proxy` 환경 변수를 사용하여 주어진 프로토콜의 프록시 서버를 지정할 수 있습니다. 시스템에 설정된 경우 원활하게 작동해야 합니다.

이 접근 방식은 주어진 프로토콜에 대해 단 하나의 프록시 서버만 있고 해당 프록시 서버가 변경되지 않는 경우 가장 간단합니다.

**프록시 목록**

이 접근 방식을 사용하면 프로토콜에 대해 하나 이상의 프록시 서버를 지정할 수 있습니다. 프록시 서버가 두 개 이상 정의된 경우, ClickHouse는 서버 간 부하를 균형 있게 배분하기 위해 라운드 로빈 방식으로 서로 다른 프록시를 사용합니다. 이 경우 프록시 서버 목록이 변경되지 않는다면 가장 간단한 방법입니다.

**구성 템플릿**

```xml
<proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```
아래 탭에서 부모 필드를 선택하여 자식 항목을 보세요:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 필드      | 설명                         |
|-----------|-----------------------------|
| `<http>`  | 하나 이상의 HTTP 프록시 목록  |
| `<https>` | 하나 이상의 HTTPS 프록시 목록 |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| 필드    | 설명          |
|---------|----------------|
| `<uri>` | 프록시의 URI |

  </TabItem>
</Tabs>

**원격 프록시 해상자**

프록시 서버가 동적으로 변경될 수 있습니다. 이 경우 해상자의 끝점을 정의할 수 있습니다. ClickHouse는 해당 끝점에 빈 GET 요청을 보내고, 원격 해상자는 프록시 호스트를 반환해야 합니다. ClickHouse는 다음 템플릿을 사용하여 프록시 URI를 형성합니다: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**구성 템플릿**

```xml
<proxy>
    <http>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>80</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </http>

    <https>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>3128</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </https>

</proxy>
```

아래 탭에서 부모 필드를 선택하여 자식 항목을 보세요:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 필드       | 설명                                     |
|------------|------------------------------------------|
| `<http>`   | 하나 이상의 해상자 목록*                 |
| `<https>`  | 하나 이상의 해상자 목록*                 |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| 필드         | 설명                                      |
|--------------|-------------------------------------------|
| `<resolver>` | 해상자에 대한 끝점 및 기타 세부 사항   |

:::note
여러 개의 `<resolver>` 요소를 가질 수 있지만, 주어진 프로토콜에 대한 첫 번째 `<resolver>`만 사용됩니다. 해당 프로토콜의 다른 `<resolver>` 요소들은 무시됩니다. 이는 필요한 경우 로드 밸런싱이 원격 해상자에 의해 구현되어야 함을 의미합니다.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| 필드               | 설명                                                                                                                                                                          |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | 프록시 해상자의 URI                                                                                                                                                           |
| `<proxy_scheme>`    | 최종 프록시 URI의 프로토콜입니다. 이는 `http` 또는 `https`일 수 있습니다.                                                                                                     |
| `<proxy_port>`      | 프록시 해상자의 포트 번호                                                                                                                                                     |
| `<proxy_cache_time>` | ClickHouse가 해상자에서 값을 캐시해야 하는 시간(초)입니다. 이 값을 `0`으로 설정하면 ClickHouse는 모든 HTTP 또는 HTTPS 요청에 대해 해상자에 연락하게 됩니다. |

  </TabItem>
</Tabs>

**우선 순위**

프록시 설정은 다음 순서로 결정됩니다:

| 순서 | 설정                  |
|-------|----------------------|
| 1.    | 원격 프록시 해상자   |
| 2.    | 프록시 목록          |
| 3.    | 환경 변수           |

ClickHouse는 요청 프로토콜에 대해 가장 높은 우선 순위의 해상자 유형을 검사합니다. 정의되지 않은 경우에는 다음으로 높은 우선 순위의 해상자 유형을 검사하여 환경 해상자에 도달합니다. 이는 다양한 해상자 유형을 혼합하여 사용할 수 있도록 합니다.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

기본적으로 `HTTP CONNECT`를 사용하여 `HTTP` 프록시를 통한 `HTTPS` 요청을 만듭니다. 이 설정은 이를 비활성화하는 데 사용될 수 있습니다.

**no_proxy**

기본적으로 모든 요청이 프록시를 통과합니다. 특정 호스트에 대해 이를 비활성화하려면, `no_proxy` 변수를 설정해야 합니다.
이 변수는 목록 및 원격 해상자의 `<proxy>` 절 내에서 설정할 수 있으며, 환경 해상자의 경우 환경 변수로 설정할 수 있습니다.
IP 주소, 도메인, 서브도메인 및 전체 우회를 위한 `'*'` 와일드카드를 지원합니다. Curl 처럼 선행 점(.)은 제거됩니다.

**예시**

아래 구성은 `clickhouse.cloud` 및 그 하위 도메인들(예: `auth.clickhouse.cloud`)에 대한 프록시 요청을 우회합니다.
리드 점이 있어도 GitLab과 동일하게 적용됩니다. `gitlab.com` 및 `about.gitlab.com` 모두 프록시를 우회합니다.

```xml
<proxy>
    <no_proxy>clickhouse.cloud,.gitlab.com</no_proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```
## workload_path {#workload_path}

모든 `CREATE WORKLOAD` 및 `CREATE RESOURCE` 쿼리를 저장하는 데 사용되는 디렉터리입니다. 기본적으로 서버 작업 디렉터리의 `/workload/` 폴더가 사용됩니다.

**예시**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**추가 참고**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

모든 `CREATE WORKLOAD` 및 `CREATE RESOURCE` 쿼리를 저장하는 데 사용되는 ZooKeeper 노드의 경로입니다. 일관성을 유지하기 위해 모든 SQL 정의가 이 단일 znode의 값으로 저장됩니다. 기본적으로 ZooKeeper는 사용되지 않으며 정의는 [디스크](#workload_path)에 저장됩니다.

**예시**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**추가 참고**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## zookeeper_log {#zookeeper_log}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) 시스템 테이블에 대한 설정입니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

<SystemLogParameters/>

**예시**

```xml
<clickhouse>
    <zookeeper_log>
        <database>system</database>
        <table>zookeeper_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <ttl>event_date + INTERVAL 1 WEEK DELETE</ttl>
    </zookeeper_log>
</clickhouse>
```
