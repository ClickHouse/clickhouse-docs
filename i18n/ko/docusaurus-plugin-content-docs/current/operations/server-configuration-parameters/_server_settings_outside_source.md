## asynchronous_metric_log \{#asynchronous_metric_log\}

기본적으로 ClickHouse Cloud 배포 환경에서는 활성화되어 있습니다.

사용 중인 환경에서 이 설정이 기본적으로 활성화되어 있지 않다면, ClickHouse 설치 방식에 따라 아래 지침에 따라 설정을 활성화하거나 비활성화할 수 있습니다.

**활성화**

비동기 메트릭 로그 이력 수집 기능 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)을(를) 수동으로 활성화하려면, 다음 내용을 포함하는 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` 파일을 생성하십시오:

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

`asynchronous_metric_log` 설정을 비활성화하려면 다음과 같은 내용을 포함한 파일 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`을(를) 생성하십시오:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## auth_use_forwarded_address \{#auth_use_forwarded_address\}

프록시를 통해 연결된 클라이언트에 대해, 인증 시 실제 클라이언트 주소를 사용합니다.

:::note
전달된 주소는 쉽게 스푸핑될 수 있으므로, 이 설정은 매우 신중하게 사용해야 합니다. 이러한 인증을 허용하는 서버에는 직접 접근하지 말고, 신뢰할 수 있는 프록시를 통해서만 접근해야 합니다.
:::

## backups \{#backups\}

[`BACKUP` 및 `RESTORE`](/operations/backup/overview) SQL 문을 실행할 때 사용되는 백업 관련 설정입니다.

다음 설정은 하위 태그를 통해 구성할 수 있습니다.

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','동일한 호스트에서 여러 백업 작업을 동시에 실행할 수 있는지 여부를 결정합니다.', 'true'),
    ('allow_concurrent_restores', 'Bool', '동일한 호스트에서 여러 복원 작업을 동시에 실행할 수 있는지 여부를 결정합니다.', 'true'),
    ('allowed_disk', 'String', '`File()`을 사용할 때 백업을 저장할 디스크입니다. `File`을 사용하려면 이 설정을 지정해야 합니다.', ''),
    ('allowed_path', 'String', '`File()`을 사용할 때 백업을 저장할 경로입니다. `File`을 사용하려면 이 설정을 지정해야 합니다.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '수집한 메타데이터를 비교한 후 불일치가 있는 경우, 대기하기 전에 메타데이터 수집을 재시도하는 횟수입니다.', '2'),
    ('collect_metadata_timeout', 'UInt64', '백업 중 메타데이터를 수집할 때의 타임아웃(밀리초)입니다.', '600000'),
    ('compare_collected_metadata', 'Bool', 'true이면 백업 중에 변경되지 않았는지 확인하기 위해 수집된 메타데이터를 기존 메타데이터와 비교합니다.', 'true'),
    ('create_table_timeout', 'UInt64', '복원 중 테이블을 생성할 때의 타임아웃(밀리초)입니다.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '조정된 백업/복원 수행 중 bad version 오류가 발생했을 때 재시도하는 최대 횟수입니다.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '메타데이터 수집을 다음에 재시도하기 전까지의 최대 대기 시간(밀리초)입니다.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '메타데이터 수집을 다음에 재시도하기 전까지의 최소 대기 시간(밀리초)입니다.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '`BACKUP` 명령이 실패하면 ClickHouse는 실패 이전에 백업으로 이미 복사된 파일을 제거하려고 시도하며, 그렇지 않으면 복사된 파일을 그대로 남겨 둡니다.', 'true'),
    ('sync_period_ms', 'UInt64', '조정된 백업/복원을 위한 동기화 주기(밀리초)입니다.', '5000'),
    ('test_inject_sleep', 'Bool', '테스트와 관련된 sleep 지연 동작입니다.', 'false'),
    ('test_randomize_order', 'Bool', 'true이면 테스트 목적을 위해 일부 연산의 순서를 무작위로 변경합니다.', 'false'),
    ('zookeeper_path', 'String', '`ON CLUSTER` 절을 사용할 때 백업과 복원 메타데이터가 저장되는 ZooKeeper 경로입니다.', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Setting                                             | Type   | Description                                                                                | Default               |
| :-------------------------------------------------- | :----- | :----------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 동일한 호스트에서 여러 백업 작업을 동시에 실행할 수 있는지 여부를 결정합니다.                                               | `true`                |
| `allow_concurrent_restores`                         | Bool   | 동일한 호스트에서 여러 복원 작업을 동시에 실행할 수 있는지 여부를 결정합니다.                                               | `true`                |
| `allowed_disk`                                      | String | `File()`을 사용할 때 백업을 저장할 디스크입니다. `File`을 사용하려면 이 설정을 반드시 지정해야 합니다.                          | ``                    |
| `allowed_path`                                      | String | `File()`을 사용할 때 백업을 저장할 경로입니다. `File`을 사용하려면 이 설정을 반드시 지정해야 합니다.                           | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 수집된 메타데이터를 비교한 후 불일치가 발생한 경우, 대기 상태로 들어가기 전에 메타데이터 수집을 재시도하는 최대 횟수입니다.                     | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | 백업 중 메타데이터를 수집할 때의 타임아웃(밀리초)입니다.                                                           | `600000`              |
| `compare_collected_metadata`                        | Bool   | 값이 `true`이면, 백업 중에 변경되지 않았는지 확인하기 위해 수집된 메타데이터를 기존 메타데이터와 비교합니다.                           | `true`                |
| `create_table_timeout`                              | UInt64 | 복원 중 테이블을 생성할 때의 타임아웃(밀리초)입니다.                                                             | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | coordinated 백업/복원 작업 중 잘못된 버전(bad version) 오류가 발생했을 때 재시도할 수 있는 최대 횟수입니다.                  | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 메타데이터를 다시 수집하기 위한 다음 시도 전에 대기할 최대 시간(밀리초)입니다.                                              | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 메타데이터를 다시 수집하기 위한 다음 시도 전에 대기할 최소 시간(밀리초)입니다.                                              | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | `BACKUP` 명령이 실패하면, ClickHouse는 실패 이전에 백업으로 이미 복사된 파일을 제거하려고 시도하며, 그렇지 않으면 복사된 파일을 그대로 둡니다. | `true`                |
| `sync_period_ms`                                    | UInt64 | coordinated 백업/복원 작업을 위한 동기화 주기(밀리초)입니다.                                                   | `5000`                |
| `test_inject_sleep`                                 | Bool   | 테스트 목적으로 sleep을 주입하는 데 사용됩니다.                                                              | `false`               |
| `test_randomize_order`                              | Bool   | 값이 `true`이면, 테스트 목적을 위해 특정 작업의 순서를 무작위로 변경합니다.                                             | `false`               |
| `zookeeper_path`                                    | String | `ON CLUSTER` 절을 사용할 때, ZooKeeper 내에서 백업 및 복원 메타데이터가 저장되는 경로입니다.                            | `/clickhouse/backups` |

이 설정은 기본적으로 다음과 같이 구성됩니다.

```xml
<backups>
    ....
</backups>
```


## background_schedule_pool_log \{#background_schedule_pool_log\}

여러 background 풀을 통해 실행되는 모든 백그라운드 작업에 대한 정보를 포함합니다.

```xml
<background_schedule_pool_log>
    <database>system</database>
    <table>background_schedule_pool_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <!-- Only tasks longer than duration_threshold_milliseconds will be logged. Zero means log everything -->
    <duration_threshold_milliseconds>0</duration_threshold_milliseconds>
</background_schedule_pool_log>
```


## bcrypt_workfactor \{#bcrypt_workfactor\}

[Bcrypt algorithm](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)을 사용하는 `bcrypt_password` 인증 유형의 워크 팩터입니다.
워크 팩터는 해시를 계산하고 비밀번호를 검증하는 데 필요한 연산량과 소요 시간을 결정합니다.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
인증 요청 빈도가 높은 애플리케이션에서는,
높은 work factor 설정에서 bcrypt의 연산 비용이 커지므로
다른 인증 방식을 고려하십시오.
:::


## table_engines_require_grant \{#table_engines_require_grant\}

`true`로 설정하면, 특정 엔진을 사용하는 테이블을 `CREATE`하려면 권한(그랜트)이 필요합니다. 예: `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
기본적으로는 하위 호환성을 위해 특정 테이블 엔진으로 테이블을 생성할 때 그랜트가 없어도 허용되지만, 이 값을 `true`로 설정하여 동작을 변경할 수 있습니다.
:::

## builtin_dictionaries_reload_interval \{#builtin_dictionaries_reload_interval\}

내장 딕셔너리를 다시 로드하는 간격(초)입니다.

ClickHouse는 내장 딕셔너리를 x초마다 다시 로드합니다. 이를 통해 서버를 재시작하지 않고도 딕셔너리를 즉시 수정할 수 있습니다.

**예제**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## 압축 \{#compression\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 엔진 테이블에 대한 데이터 압축 설정입니다.

:::note
ClickHouse를 처음 사용하기 시작했다면 이 설정을 변경하지 않을 것을 권장합니다.
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

* `min_part_size` – 데이터 파트의 최소 크기입니다.
* `min_part_size_ratio` – 데이터 파트 크기를 테이블 크기에 대한 비율로 나타낸 값입니다.
* `method` – 압축 방식입니다. 사용 가능한 값: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
* `level` – 압축 레벨입니다. [Codecs](/sql-reference/statements/create/table#general-purpose-codecs)를 참조하십시오.

:::note
여러 개의 `<case>` 섹션을 구성할 수 있습니다.
:::

**조건이 충족될 때 수행되는 동작**:

* 데이터 파트가 어떤 조건 집합과 일치하면 ClickHouse는 지정된 압축 방식을 사용합니다.
* 데이터 파트가 둘 이상의 조건 집합과 일치하면 ClickHouse는 가장 먼저 일치한 조건 집합을 사용합니다.

:::note
데이터 파트에 대해 어떤 조건도 충족되지 않으면 ClickHouse는 `lz4` 압축을 사용합니다.
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


## encryption \{#encryption\}

[encryption 코덱](/sql-reference/statements/create/table#encryption-codecs)에 사용될 키를 가져오는 명령을 설정합니다. 키(또는 여러 키)는 환경 변수로 지정하거나 설정 파일에 설정해야 합니다.

키는 길이가 16바이트인 16진수(hex) 값 또는 문자열일 수 있습니다.

**예시**

설정(config)에서 불러오기:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
구성 파일에 키를 저장하는 것은 권장되지 않습니다. 보안상 안전하지 않습니다. 키를 보안 디스크의 별도 구성 파일로 옮기고, 그 구성 파일에 대한 심볼릭 링크를 `config.d/` 폴더에 둘 수 있습니다.
:::

키가 16진수(hex)인 경우, 구성에서 로드하기:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

환경 변수에 설정된 키를 불러옵니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

여기서 `current_key_id`는 암호화를 위한 현재 키를 설정하며, 지정된 모든 키는 복호화에 사용할 수 있습니다.

이러한 각 방법은 여러 키에 대해 적용할 수 있습니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

여기서 `current_key_id`는 암호화에 사용되는 현재 키를 표시합니다.

또한 12바이트 길이의 nonce를 추가할 수 있습니다(기본적으로 암호화 및 복호화 과정에서는 0 값으로만 구성된 nonce를 사용합니다):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

또는 16진수로도 설정할 수 있습니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
위에서 언급한 모든 내용은 `aes_256_gcm_siv`에도 적용됩니다 (단, 키는 32바이트 길이여야 합니다).
:::


## error_log \{#error_log\}

기본적으로 비활성화되어 있습니다.

**활성화**

오류 이력 수집 [`system.error_log`](../../operations/system-tables/error_log.md)을(를) 수동으로 활성화하려면, 다음 내용을 포함하는 `/etc/clickhouse-server/config.d/error_log.xml` 파일을 생성하십시오:

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

`error_log` SETTING을 비활성화하려면 다음 내용을 포함하는 `/etc/clickhouse-server/config.d/disable_error_log.xml` 파일을 생성해야 합니다:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## custom_settings_prefixes \{#custom_settings_prefixes\}

[사용자 정의 설정](/operations/settings/query-level#custom_settings)을 위한 접두사 목록입니다. 접두사는 쉼표로 구분합니다.

**예시**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**함께 보기**

* [사용자 지정 설정](/operations/settings/query-level#custom_settings)


## core_dump \{#core_dump\}

코어 덤프 파일 크기에 대한 소프트 제한을 설정합니다.

:::note
하드 제한은 시스템 도구로 구성합니다.
:::

**예제**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## default_profile \{#default_profile\}

기본 SETTINGS PROFILE입니다. SETTINGS PROFILE은 `user_config` SETTING에 지정된 파일에 저장됩니다.

**예시**

```xml
<default_profile>default</default_profile>
```


## dictionaries_config \{#dictionaries_config\}

dictionaries에 대한 설정 파일의 경로입니다.

경로:

* 절대 경로나 서버 설정 파일을 기준으로 한 상대 경로를 지정합니다.
* 경로에는 와일드카드 * 및 ?를 포함할 수 있습니다.

함께 보기:

* &quot;[Dictionaries](../../sql-reference/statements/create/dictionary/index.md)&quot;.

**예제**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## user_defined_executable_functions_config \{#user_defined_executable_functions_config\}

실행 가능한 사용자 정의 함수용 구성 파일 경로입니다.

경로:

* 절대 경로 또는 서버 구성 파일을 기준으로 한 상대 경로를 지정합니다.
* 경로에는 와일드카드 * 및 ?를 포함할 수 있습니다.

참고:

* 「[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)」.

**예제**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## graphite \{#graphite\}

[Graphite](https://github.com/graphite-project)로 데이터를 전송합니다.

Settings:

* `host` – Graphite 서버입니다.
* `port` – Graphite 서버의 포트입니다.
* `interval` – 전송 간격(초 단위)입니다.
* `timeout` – 데이터 전송 타임아웃(초 단위)입니다.
* `root_path` – 키에 사용할 접두사입니다.
* `metrics` – [system.metrics](/operations/system-tables/metrics) 테이블에서 데이터를 전송합니다.
* `events` – [system.events](/operations/system-tables/events) 테이블에서 특정 기간 동안 누적된 델타 데이터를 전송합니다.
* `events_cumulative` – [system.events](/operations/system-tables/events) 테이블에서 누적 데이터를 전송합니다.
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 테이블에서 데이터를 전송합니다.

여러 개의 `<graphite>` 절을 설정할 수 있습니다. 예를 들어 서로 다른 데이터를 서로 다른 간격으로 전송하는 데 사용할 수 있습니다.

**예제**

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


## graphite_rollup \{#graphite_rollup\}

Graphite용 데이터 축소를 위한 설정입니다.

자세한 내용은 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)를 참고하십시오.

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


## http_handlers \{#http_handlers\}

사용자 정의 HTTP 핸들러를 사용할 수 있습니다.
새 HTTP 핸들러를 추가하려면 새로운 `<rule>`을 추가하면 됩니다.
규칙은 정의된 순서대로 위에서 아래로 검사되며,
먼저 일치하는 항목의 핸들러가 실행됩니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| Sub-tags             | Definition                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `url`                | 요청 URL을 매칭하며, 정규식 매칭을 사용하려면 접두사로 &#39;regex:&#39;를 사용할 수 있습니다(선택 사항)                                 |
| `methods`            | 요청 메서드를 매칭하며, 쉼표를 사용하여 여러 메서드를 구분해 매칭할 수 있습니다(선택 사항)                                                 |
| `headers`            | 요청 헤더를 매칭하며, 각 자식 요소(자식 요소 이름이 헤더 이름)를 매칭합니다. 정규식 매칭을 사용하려면 접두사로 &#39;regex:&#39;를 사용할 수 있습니다(선택 사항) |
| `handler`            | 요청 핸들러를 지정합니다                                                                                        |
| `empty_query_string` | URL에 쿼리 문자열이 없는지 확인합니다                                                                               |

`handler`에는 다음 설정이 포함되며, 하위 태그로 구성할 수 있습니다:

| Sub-tags           | Definition                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `url`              | 리다이렉트 대상 위치입니다                                                                                                                |
| `type`             | 지원되는 타입: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                    |
| `status`           | static 타입에서 사용하며, 응답 상태 코드를 지정합니다                                                                                             |
| `query_param_name` | dynamic&#95;query&#95;handler 타입에서 사용하며, HTTP 요청 파라미터에서 `<query_param_name>` 값에 해당하는 값을 추출해 실행합니다                             |
| `query`            | predefined&#95;query&#95;handler 타입에서 사용하며, 핸들러가 호출될 때 쿼리를 실행합니다                                                              |
| `content_type`     | static 타입에서 사용하며, 응답 content-type을 지정합니다                                                                                      |
| `response_content` | static 타입에서 사용하며, 클라이언트로 전송할 응답 콘텐츠입니다. 접두사 &#39;file://&#39; 또는 &#39;config://&#39;를 사용하는 경우, 파일이나 설정에서 콘텐츠를 읽어 클라이언트로 전송합니다 |

규칙 목록과 함께 `<defaults/>`를 지정하여 모든 기본 핸들러를 활성화할 수 있습니다.

예:

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


## http_server_default_response \{#http_server_default_response\}

ClickHouse HTTP(s) 서버에 접근할 때 기본으로 표시되는 페이지입니다.
기본값은 「Ok.」이며, 마지막에 줄 바꿈 문자가 포함됩니다.

**예시**

`http://localhost: http_port`에 접근하면 `https://tabix.io/`를 엽니다.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## http_options_response \{#http_options_response\}

`OPTIONS` HTTP 요청의 응답에 헤더를 추가하는 데 사용합니다.
`OPTIONS` 메서드는 CORS 프리플라이트(preflight) 요청을 할 때 사용합니다.

자세한 내용은 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)를 참조하십시오.

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


## hsts_max_age \{#hsts_max_age\}

HSTS의 만료 시간(초 단위)입니다.

:::note
값이 `0`이면 ClickHouse에서 HSTS를 비활성화합니다. 값을 양수로 설정하면 HSTS가 활성화되며, `max-age`는 설정한 값이 됩니다.
:::

**예시**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## interserver_listen_host \{#interserver_listen_host\}

ClickHouse 서버 간에 데이터를 교환할 수 있는 호스트를 제한합니다.
Keeper를 사용하는 경우, 서로 다른 Keeper 인스턴스 간 통신에도 동일한 제한이 적용됩니다.

:::note
기본적으로 이 값은 [`listen_host`](#listen_host) 설정과 동일합니다.
:::

**예제**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

유형:

기본값:


## interserver_http_credentials \{#interserver_http_credentials\}

[복제](../../engines/table-engines/mergetree-family/replication.md) 중에 다른 서버에 연결하는 데 사용되는 사용자 이름과 비밀번호입니다. 또한 서버는 이러한 자격 증명을 사용하여 다른 레플리카를 인증합니다.
따라서 클러스터 내 모든 레플리카는 동일한 `interserver_http_credentials` 값을 사용해야 합니다.

:::note

* 기본적으로 `interserver_http_credentials` 섹션을 생략하면 복제 중 인증이 사용되지 않습니다.
* `interserver_http_credentials` 설정은 ClickHouse 클라이언트 자격 증명 [구성](../../interfaces/cli.md#configuration_files)과는 관련이 없습니다.
* 이 자격 증명은 `HTTP` 및 `HTTPS`를 통한 복제에 공통으로 사용됩니다.
  :::

다음 설정은 하위 태그로 구성할 수 있습니다:

* `user` — 사용자 이름.
* `password` — 비밀번호.
* `allow_empty` — `true`이면, 자격 증명이 설정되어 있더라도 인증 없이 다른 레플리카의 연결을 허용합니다. `false`이면, 인증 없이 이루어지는 연결은 거부됩니다. 기본값: `false`.
* `old` — 자격 증명 교체 시 사용되던 이전 `user` 및 `password`를 포함합니다. 여러 개의 `old` 섹션을 지정할 수 있습니다.

**자격 증명 교체**

ClickHouse는 모든 레플리카를 동시에 중단하지 않고 구성을 업데이트할 수 있도록, 서버 간(interserver) 자격 증명을 동적으로 교체하는 기능을 지원합니다. 자격 증명은 여러 단계에 걸쳐 변경할 수 있습니다.

인증을 활성화하려면 `interserver_http_credentials.allow_empty`를 `true`로 설정하고 자격 증명을 추가하십시오. 이렇게 하면 인증이 있는 연결과 없는 연결을 모두 허용합니다.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

모든 레플리카를 구성한 후에는 `allow_empty` 를 `false` 로 설정하거나 이 SETTING 을 제거하십시오. 이렇게 하면 새 자격 증명을 사용한 인증이 필수가 됩니다.

기존 자격 증명을 변경하려면 사용자 이름과 비밀번호를 `interserver_http_credentials.old` 섹션으로 옮기고, `user` 와 `password` 를 새 값으로 변경하십시오. 이 시점부터 서버는 다른 레플리카에 연결할 때 새 자격 증명을 사용하며, 새 자격 증명과 이전 자격 증명 모두를 사용한 연결을 허용합니다.

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

새 자격 증명이 모든 레플리카에 적용되면 이전 자격 증명은 제거할 수 있습니다.


## ldap_servers \{#ldap_servers\}

연결 파라미터와 함께 LDAP 서버를 다음 목적을 위해 나열합니다:

- 'password' 대신 'ldap' 인증 메커니즘이 지정된 전용 로컬 사용자에 대한 인증자로 사용
- 원격 사용자 디렉터리로 사용

다음 설정은 하위 태그로 구성할 수 있습니다:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `bind_dn` | 바인딩할 DN을 구성하는 데 사용되는 템플릿입니다. 최종 DN은 각 인증 시도 시 템플릿의 모든 `\{user_name\}` 하위 문자열을 실제 사용자 이름으로 대체하여 구성됩니다.                                                                                                                                                                                                                               |
| `enable_tls` | LDAP 서버에 대한 보안 연결 사용을 제어하는 플래그입니다. 일반 텍스트(`ldap://`) 프로토콜(권장되지 않음)을 사용하려면 `no`를 지정합니다. SSL/TLS(`ldaps://`) 위의 LDAP 프로토콜(권장, 기본값)을 사용하려면 `yes`를 지정합니다. 레거시 StartTLS 프로토콜(일반 텍스트(`ldap://`) 프로토콜을 TLS로 업그레이드)을 사용하려면 `starttls`를 지정합니다.                                                                                                               |
| `host` | LDAP 서버 호스트 이름 또는 IP입니다. 이 파라미터는 필수이며 비워 둘 수 없습니다.                                                                                                                                                                                                                                                                                                                                                             |
| `port` | LDAP 서버 포트입니다. 기본값은 `enable_tls`가 true로 설정되면 636, 그렇지 않으면 `389`입니다.                                                                                                                                                                                                                                                                                                                                                        |
| `tls_ca_cert_dir` | CA 인증서가 들어 있는 디렉터리 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_ca_cert_file` | CA 인증서 파일의 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_cert_file` | 인증서 파일의 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_cipher_suite` | 허용되는 암호 스위트(OpenSSL 표기법)입니다.                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_key_file` | 인증서 키 파일의 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_minimum_protocol_version` | SSL/TLS의 최소 프로토콜 버전입니다. 허용되는 값은 `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`(기본값)입니다.                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert` | SSL/TLS 피어 인증서 검증 동작입니다. 허용되는 값은 `never`, `allow`, `try`, `demand`(기본값)입니다.                                                                                                                                                                                                                                                                                                                    |
| `user_dn_detection` | 바인딩된 사용자의 실제 사용자 DN을 감지하기 위한 LDAP 검색 파라미터 섹션입니다. 이는 주로 서버가 Active Directory일 때 이후의 역할 매핑을 위한 검색 필터에서 사용됩니다. 최종 사용자 DN은 `\{user_dn\}` 하위 문자열이 허용되는 모든 위치를 대체하는 데 사용됩니다. 기본적으로 사용자 DN은 bind DN과 동일하게 설정되지만, 검색이 수행되면 실제로 감지된 사용자 DN 값으로 업데이트됩니다. |
| `verification_cooldown` | 성공적인 바인딩 시도 이후, 지정된 기간(초 단위) 동안 LDAP 서버에 접속하지 않고 연속 요청에 대해 사용자가 성공적으로 인증된 것으로 간주되는 시간입니다. 캐싱을 비활성화하고 각 인증 요청마다 LDAP 서버에 접속하도록 강제하려면 `0`(기본값)을 지정합니다.                                                                                                                  |

`user_dn_detection` 설정은 하위 태그로 구성할 수 있습니다:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP 검색을 위한 base DN을 구성하는 데 사용되는 템플릿입니다. 최종 DN은 LDAP 검색 중 템플릿의 모든 `\{user_name\}` 및 `\{bind_dn\}` 하위 문자열을 실제 사용자 이름과 bind DN으로 대체하여 구성됩니다.                                                                                                       |
| `scope`         | LDAP 검색의 범위입니다. 허용되는 값은 `base`, `one_level`, `children`, `subtree`(기본값)입니다.                                                                                                                                                                                                                                       |
| `search_filter` | LDAP 검색을 위한 검색 필터를 구성하는 데 사용되는 템플릿입니다. 최종 필터는 LDAP 검색 중 템플릿의 모든 `\{user_name\}`, `\{bind_dn\}`, `\{base_dn\}` 하위 문자열을 실제 사용자 이름, bind DN, base DN으로 대체하여 구성됩니다. 특수 문자는 XML에서 올바르게 이스케이프되어야 합니다.  |

예:

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

예시(추가적인 역할 매핑을 위해 사용자 DN 탐지가 구성된 일반적인 Active Directory):

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


## listen_host \{#listen_host\}

요청이 들어올 수 있는 호스트를 제한합니다. 서버가 모든 호스트에서 오는 요청에 응답하도록 하려면 `::` 를 지정합니다.

예시:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## logger \{#logger\}

로그 메시지의 위치와 형식입니다.

**키**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `async` | `true`(기본값)인 경우 로깅이 비동기적으로 수행됩니다(출력 채널당 하나의 백그라운드 스레드). 그렇지 않으면 LOG를 호출하는 스레드 내에서 로깅합니다.           |
| `async_queue_max_size` | 비동기 로깅을 사용하는 경우, 플러시를 기다리며 큐에 유지되는 메시지의 최대 개수입니다. 초과된 메시지는 버려집니다.                       |
| `console` | 콘솔로 로깅을 활성화합니다. `1` 또는 `true`로 설정하면 활성화됩니다. ClickHouse가 데몬 모드로 실행되지 않으면 기본값은 `1`, 그렇지 않으면 `0`입니다.                            |
| `console_log_level` | 콘솔 출력용 로그 레벨입니다. 기본값은 `level`입니다.                                                                                                                 |
| `console_shutdown_log_level` | 서버 종료 시 콘솔 로그 레벨을 설정하는 데 사용되는 종료 레벨입니다.   
| `console_startup_log_level` | 서버 시작 시 콘솔 로그 레벨을 설정하는 데 사용되는 시작 레벨입니다. 시작 이후에는 로그 레벨이 `console_log_level` 설정값으로 되돌아갑니다.                                   |   
| `count` | 로테이션 정책: ClickHouse가 보관하는 과거 로그 파일의 최대 개수입니다.                                                                                        |
| `errorlog` | 에러 로그 파일의 경로입니다.                                                                                                                                    |
| `formatting.type` | 콘솔 출력용 로그 형식입니다. 현재는 `json`만 지원됩니다.                                                                                                 |
| `level` | 로그 레벨입니다. 허용되는 값: `none`(로깅 비활성화), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                 |
| `log` | 로그 파일의 경로입니다.                                                                                                                                          |
| `rotation` | 로테이션 정책: 로그 파일이 언제 로테이션될지 제어합니다. 로테이션은 크기, 시간 또는 둘의 조합을 기준으로 수행할 수 있습니다. 예: 100M, daily, 100M,daily. 로그 파일이 지정된 크기를 초과하거나 지정된 시간 간격에 도달하면 이름이 변경되어 보관되고, 새 로그 파일이 생성됩니다. |
| `shutdown_level` | 서버 종료 시 루트 로거 레벨을 설정하는 데 사용되는 종료 레벨입니다.                                                                                            |
| `size` | 로테이션 정책: 로그 파일의 최대 크기(바이트 단위)입니다. 로그 파일 크기가 이 임계값을 초과하면 이름이 변경되어 보관되고, 새 로그 파일이 생성됩니다. |
| `startup_level` | 서버 시작 시 루트 로거 레벨을 설정하는 데 사용되는 시작 레벨입니다. 시작 이후에는 로그 레벨이 `level` 설정값으로 되돌아갑니다.                                   |
| `stream_compress` | LZ4를 사용해 로그 메시지를 압축합니다. `1` 또는 `true`로 설정하면 활성화됩니다.                                                                                                   |
| `syslog_level` | syslog로 로깅할 때 사용할 로그 레벨입니다.                                                                                                                                   |
| `use_syslog` | 로그 출력을 syslog로도 함께 전달합니다.                                                                                                                                 |

**로그 형식 지정자**

`log` 및 `errorLog` 경로에 있는 파일 이름은 최종 파일 이름을 생성하기 위한 아래의 형식 지정자를 지원합니다(디렉터리 부분은 지원하지 않습니다).

"Example" 열은 `2023-07-06 18:32:07`일 때의 출력을 보여줍니다.

| 지정자  | 설명                                                                                                                           | 예시                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `%%` | 리터럴 &#39;%&#39; 문자                                                                                                           | `%`                      |
| `%n` | 줄 바꿈 문자                                                                                                                      |                          |
| `%t` | 수평 탭 문자                                                                                                                      |                          |
| `%Y` | 연도를 10진수로 표기, 예: 2017                                                                                                        | `2023`                   |
| `%y` | 연도의 마지막 2자리를 10진수로 표기 (범위 [00,99])                                                                                           | `23`                     |
| `%C` | 연도의 처음 2자리를 10진수로 표기 (범위 [00,99])                                                                                            | `20`                     |
| `%G` | 4자리 [ISO 8601 주 기반 연도](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), 즉 지정된 주가 포함된 연도입니다. 일반적으로는 `%V`와 함께 사용할 때만 유용합니다. | `2023`                   |
| `%g` | [ISO 8601 주 기반 연도](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)의 마지막 두 자리, 즉 지정된 주를 포함하는 연도.                           | `23`                     |
| `%b` | 축약된 월 이름, 예: Oct (로케일에 따라 다름)                                                                                                | `Jul`                    |
| `%h` | %b와 동일                                                                                                                       | `Jul`                    |
| `%B` | 전체 월 이름, 예: October (로케일에 따라 다름)                                                                                             | `July`                   |
| `%m` | 월을 10진수로 표기 (범위 [01,12])                                                                                                     | `07`                     |
| `%U` | 해당 연도의 주 번호를 10진수로 표기 (일요일이 한 주의 시작) (범위 [00,53])                                                                            | `27`                     |
| `%W` | 해당 연도의 주 번호를 10진수로 표기 (월요일이 한 주의 시작) (범위 [00,53])                                                                            | `27`                     |
| `%V` | ISO 8601 주 번호 (범위 [01,53])                                                                                                   | `27`                     |
| `%j` | 해당 연도의 일을 10진수로 표기 (범위 [001,366])                                                                                            | `187`                    |
| `%d` | 해당 월의 일을 0으로 채운 10진수로 표기 (범위 [01,31]). 한 자리 수인 경우 앞에 0을 붙입니다.                                                                | `06`                     |
| `%e` | 해당 월의 일을 공백으로 채운 10진수로 표기 (범위 [1,31]). 한 자리 수인 경우 앞에 공백을 하나 붙입니다.                                                            | `&nbsp; 6`               |
| `%a` | 축약된 요일 이름, 예: Fri (로케일에 따라 다름)                                                                                               | `Thu`                    |
| `%A` | 전체 요일 이름, 예: Friday (로케일에 따라 다름)                                                                                             | `Thursday`               |
| `%w` | 요일을 정수로 표기하며, 일요일은 0 (범위 [0-6])                                                                                              | `4`                      |
| `%u` | 요일을 10진수로 표기하며, 월요일은 1 (ISO 8601 표기) (범위 [1-7])                                                                              | `4`                      |
| `%H` | 시를 24시간제로 10진수로 표기 (범위 [00-23])                                                                                              | `18`                     |
| `%I` | 시를 12시간제로 10진수로 표기 (범위 [01,12])                                                                                              | `06`                     |
| `%M` | 분을 10진수로 표기 (범위 [00,59])                                                                                                     | `32`                     |
| `%S` | 초를 10진수로 표기 (범위 [00,60])                                                                                                     | `07`                     |
| `%c` | 표준 날짜 및 시간 문자열, 예: Sun Oct 17 04:41:13 2010 (로케일에 따라 다름)                                                                     | `2023년 7월 6일 목 18:32:07` |
| `%x` | 로케일별 날짜 형식 (로케일에 따라 다름)                                                                                                      | `2023-07-06`             |
| `%X` | 로컬 형식으로 시간을 표시합니다. 예: 18:40:20 또는 6:40:20 PM (로케일에 따라 달라짐)                                                                   | `18:32:07`               |
| `%D` | 짧은 MM/DD/YY 날짜 형식으로, %m/%d/%y와 동일합니다.                                                                                        | `07/06/23`               |
| `%F` | 짧은 YYYY-MM-DD 날짜 형식으로, %Y-%m-%d와 동일합니다.                                                                                      | `2023-07-06`             |
| `%r` | 로컬 형식의 12시간제 시간입니다 (로케일에 따라 달라짐).                                                                                            | `오후 06:32:07`            |
| `%R` | &quot;%H:%M&quot;과 동일합니다.                                                                                                    | `18:32`                  |
| `%T` | &quot;%H:%M:%S&quot;와 동일합니다 (ISO 8601 시간 형식).                                                                                | `18:32:07`               |
| `%p` | 로컬 형식의 오전/오후 표기입니다 (로케일에 따라 달라짐).                                                                                            | `오후`                     |
| `%z` | UTC로부터의 시간대 오프셋을 ISO 8601 형식으로 나타냅니다 (예: -0430). 시간대 정보를 사용할 수 없으면 아무것도 출력되지 않습니다.                                           | `+0800`                  |
| `%Z` | 로케일에 따라 달라지는 시간대 이름 또는 약어입니다. 시간대 정보를 사용할 수 없으면 아무것도 출력되지 않습니다.                                                              | `Z AWST `                |

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

로그 메시지를 콘솔에만 출력하려면 다음과 같이 설정합니다:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**레벨별 재정의**

개별 로그 이름마다 로그 레벨을 재정의할 수 있습니다. 예를 들어 로거 「Backup」과 「RBAC」의 모든 메시지가 출력되지 않도록 설정할 수 있습니다.

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

로그 메시지를 syslog에도 함께 기록하려면:

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

`<syslog>`에 대한 키:

| Key        | Description                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | `host\[:port\]` 형식의 syslog 주소입니다. 생략하면 로컬 데몬이 사용됩니다.                                                                                                                                                                      |
| `hostname` | 로그가 전송되는 호스트의 이름입니다(선택 사항).                                                                                                                                                                                               |
| `facility` | syslog [facility 키워드](https://en.wikipedia.org/wiki/Syslog#Facility)입니다. 반드시 「LOG&#95;」 접두사가 붙은 대문자로 지정해야 합니다. 예: `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` 등. 기본값: `address`가 지정된 경우에는 `LOG_USER`, 그렇지 않으면 `LOG_DAEMON`입니다. |
| `format`   | 로그 메시지 형식입니다. 가능한 값은 `bsd` 및 `syslog`입니다.                                                                                                                                                                                 |

**로그 형식**

콘솔 로그에 출력되는 로그 형식을 지정할 수 있습니다. 현재는 JSON만 지원됩니다.

**예시**

다음은 출력되는 JSON 로그의 예시입니다:

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

JSON 로깅을 활성화하려면 다음 코드 조각을 사용하십시오:

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

**JSON 로그에서 키 이름 변경**

키 이름은 `<names>` 태그 내부의 태그 값을 변경하여 수정할 수 있습니다. 예를 들어 `DATE_TIME`을 `MY_DATE_TIME`으로 변경하려면 `<date_time>MY_DATE_TIME</date_time>`를 사용하면 됩니다.

**JSON 로그에서 키 생략**

로그 속성은 해당 속성을 주석 처리하여 생략할 수 있습니다. 예를 들어 로그에 `query_id`를 출력하지 않으려면 `<query_id>` 태그를 주석 처리하면 됩니다.


## send_crash_reports \{#send_crash_reports\}

ClickHouse 코어 개발 팀에게 크래시 리포트를 전송하기 위한 설정입니다.

특히 프로덕션 이전 환경에서 이 기능을 활성화하면 큰 도움이 됩니다.

Keys:

| Key                   | Description                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `enabled`             | 기능을 활성화하는 불리언 플래그입니다. 기본값은 `true`입니다. 크래시 리포트 전송을 원하지 않으면 `false`로 설정합니다.                           |
| `endpoint`            | 크래시 리포트를 전송할 endpoint URL을 변경할 수 있습니다.                                                              |
| `send_logical_errors` | `LOGICAL_ERROR`는 `assert`와 유사하며, ClickHouse의 버그를 의미합니다. 이 불리언 플래그를 사용하면 이러한 예외도 전송됩니다(기본값: `true`). |

**권장 사용법**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## ssh_server \{#ssh_server\}

호스트 키의 공개 키 부분은 첫 연결 시 SSH 클라이언트 측의 known&#95;hosts 파일에 기록됩니다.

호스트 키 설정은 기본적으로 비활성화되어 있습니다.
호스트 키 설정의 주석을 해제하고, 해당 SSH 키의 경로를 지정하여 활성화하십시오:

예시:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## tcp_ssh_port \{#tcp_ssh_port\}

사용자가 내장 클라이언트를 사용하여 PTY를 통해 인터랙티브하게 접속하고 쿼리를 실행할 수 있게 하는 SSH 서버의 포트입니다.

예:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## storage_configuration \{#storage_configuration\}

스토리지의 멀티 디스크 구성을 지원합니다.

스토리지 구성은 다음과 같은 구조를 따릅니다.

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


### 디스크 구성 \{#configuration-of-disks\}

`disks` 구성은 아래 구조를 따릅니다:

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

위의 하위 태그들은 `disks`에 대해 다음 설정을 정의합니다:

| Setting                 | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `<disk_name_N>`         | 디스크 이름입니다. 고유해야 합니다.                                     |
| `path`                  | 서버 데이터(`data` 및 `shadow` 카탈로그)가 저장될 경로입니다. `/`로 끝나야 합니다. |
| `keep_free_space_bytes` | 디스크에 예약해 둘 여유 공간의 크기입니다.                                 |

:::note
디스크의 순서는 설정에 영향을 주지 않습니다.
:::


### 정책 구성 \{#configuration-of-policies\}

위의 하위 태그들은 `policies`에 대해 다음 설정을 정의합니다:

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | 정책 이름입니다. 정책 이름은 서로 달라야 합니다(고유해야 합니다).                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | 볼륨 이름입니다. 볼륨 이름은 서로 달라야 합니다(고유해야 합니다).                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `disk`                       | 볼륨 내에 존재하는 디스크입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `max_data_part_size_bytes`   | 이 볼륨에 있는 어떤 디스크에도 존재할 수 있는 데이터 청크의 최대 크기입니다. merge 결과로 생성될 청크 크기가 `max_data_part_size_bytes`보다 클 것으로 예상되면, 해당 청크는 다음 볼륨에 기록됩니다. 기본적으로 이 기능을 사용하면 새롭거나 작은 청크를 핫(SSD) 볼륨에 저장했다가, 일정 크기에 도달하면 콜드(HDD) 볼륨으로 이동할 수 있습니다. 정책에 볼륨이 하나만 있는 경우에는 이 옵션을 사용하지 않는 것이 좋습니다.                                                                                   |
| `move_factor`                | 볼륨에서 사용 가능한 여유 공간의 비율입니다. 사용 가능한 공간이 이 값보다 작아지면, 다음 볼륨이 존재하는 경우 데이터가 다음 볼륨으로 이동하기 시작합니다. 이동 시 청크는 크기 기준으로 큰 것부터 작은 것 순(내림차순)으로 정렬되며, 전체 크기가 `move_factor` 조건을 만족하기에 충분한 청크들이 선택됩니다. 모든 청크의 총 크기로도 충분하지 않은 경우에는 모든 청크가 이동됩니다.                                                                                                                                  |
| `perform_ttl_move_on_insert` | 삽입 시 만료된 TTL을 가진 데이터를 이동하는 동작을 비활성화합니다. 기본값(활성화된 경우)에서는, 수명 기반 이동 규칙에 따라 이미 만료된 데이터 조각을 삽입하면 이동 규칙에 지정된 볼륨/디스크로 즉시 이동됩니다. 대상 볼륨/디스크가 느린 경우(예: S3) 삽입 속도가 크게 느려질 수 있습니다. 비활성화된 경우, 만료된 데이터 부분은 기본 볼륨에 먼저 기록된 다음, 만료된 TTL에 대한 규칙에서 지정한 볼륨으로 즉시 이동됩니다.                                                  |
| `load_balancing`             | 디스크 로드 밸런싱 정책입니다. `round_robin` 또는 `least_used` 값을 사용할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `least_used_ttl_ms`          | 모든 디스크의 사용 가능한 공간을 갱신하기 위한 타임아웃(밀리초)을 설정합니다 (`0` - 항상 갱신, `-1` - 절대 갱신 안 함, 기본값은 `60000`). 디스크가 ClickHouse에서만 사용되고, 파일 시스템 크기 조정이 실시간으로 발생하지 않는 경우에는 `-1` 값을 사용할 수 있습니다. 그 외의 경우에는, 결국 잘못된 공간 할당으로 이어질 수 있으므로 권장되지 않습니다.                                                                                                                                             |
| `prefer_not_to_merge`        | 이 볼륨에서 데이터 파트 병합을 비활성화합니다. 참고: 이는 잠재적으로 위험하며 성능 저하를 유발할 수 있습니다. 이 설정이 활성화되면(이렇게 설정하지 않는 것이 좋습니다), 이 볼륨에서 데이터 병합이 금지됩니다(바람직하지 않습니다). 이를 통해 ClickHouse가 느린 디스크와 상호작용하는 방식을 제어할 수 있습니다. 이 설정은 사용하지 않는 것을 권장합니다.                                                                                                                                          |
| `volume_priority`            | 볼륨이 채워지는 우선순위(순서)를 정의합니다. 값이 작을수록 우선순위가 높습니다. 파라미터 값은 자연수여야 하며, 1부터 N까지(N은 지정된 파라미터 값 중 최대값) 범위를 빠짐없이 모두 포함해야 합니다.                                                                                                                                                                                                                                                                                                           |

`volume_priority`에 대해:

- 모든 볼륨에 이 파라미터가 설정된 경우, 지정된 순서대로 우선순위가 결정됩니다.
- 일부 볼륨에만 설정된 경우, 이 파라미터가 없는 볼륨은 가장 낮은 우선순위를 가집니다. 파라미터가 있는 볼륨은 태그 값에 따라 우선순위가 정해지며, 나머지 볼륨의 우선순위는 설정 파일에서 서로에 대해 정의된 순서에 의해 결정됩니다.
- 어떤 볼륨에도 이 파라미터가 설정되지 않은 경우, 설정 파일에서 정의된 순서에 따라 우선순위가 결정됩니다.
- 볼륨의 우선순위는 서로 동일하지 않을 수 있습니다.

## macros \{#macros\}

복제 테이블(Replicated Table)을 위한 매크로 매개변수 치환입니다.

복제 테이블(Replicated Table)을 사용하지 않는 경우 생략할 수 있습니다.

자세한 내용은 [복제 테이블(Replicated Table) 생성](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) 섹션을 참조하십시오.

**예제**

```xml
<macros incl="macros" optional="true" />
```


## replica_group_name \{#replica_group_name\}

Replicated 데이터베이스의 레플리카 그룹 이름입니다.

Replicated 데이터베이스가 생성하는 클러스터는 동일한 그룹에 속한 레플리카들로 구성됩니다.
DDL 쿼리는 동일한 그룹에 있는 레플리카들만 대기합니다.

기본값은 비어 있습니다.

**예시**

```xml
<replica_group_name>backups</replica_group_name>
```


## max_session_timeout \{#max_session_timeout\}

세션 최대 타임아웃 시간(초)입니다.

예시:

```xml
<max_session_timeout>3600</max_session_timeout>
```


## merge_tree \{#merge_tree\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블을 위한 세부 설정입니다.

자세한 내용은 MergeTreeSettings.h 헤더 파일을 참조하십시오.

**예시**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## metric_log \{#metric_log\}

기본적으로 비활성화되어 있습니다.

**활성화**

메트릭 이력 수집을 위해 [`system.metric_log`](../../operations/system-tables/metric_log.md)을(를) 수동으로 활성화하려면, 다음 내용을 포함하는 `/etc/clickhouse-server/config.d/metric_log.xml` 파일을 생성합니다:

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

`metric_log` 설정을 비활성화하려면 다음 내용으로 `/etc/clickhouse-server/config.d/disable_metric_log.xml` 파일을 생성해야 합니다:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## replicated_merge_tree \{#replicated_merge_tree\}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에 대한 세부 설정입니다. 이 설정이 더 높은 우선순위를 가집니다.

자세한 내용은 MergeTreeSettings.h 헤더 파일을 참고하십시오.

**예시**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## opentelemetry_span_log \{#opentelemetry_span_log\}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 시스템 테이블에 대한 설정 항목입니다.

<SystemLogParameters />

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


## openSSL \{#openSSL\}

SSL 클라이언트/서버 구성을 설명합니다.

SSL 지원은 `libpoco` 라이브러리가 제공합니다. 사용 가능한 구성 옵션은 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)에 설명되어 있습니다. 기본값은 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp)에서 확인할 수 있습니다.

서버/클라이언트 설정을 위한 키:

| 옵션                            | 설명                                                                                                                                                                                                                                                                                                                                     | 기본값                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `cacheSessions`               | 세션 캐싱을 활성화하거나 비활성화합니다. `sessionIdContext`와 함께 사용해야 합니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                       | `false`                                                                                    |
| `caConfig`                    | 신뢰할 수 있는 CA 인증서가 포함된 파일 또는 디렉터리의 경로입니다. 파일을 가리키는 경우 PEM 형식이어야 하며, 여러 개의 CA 인증서를 포함할 수 있습니다. 디렉터리를 가리키는 경우 각 CA 인증서당 하나의 .pem 파일이 있어야 합니다. 파일 이름은 CA subject name의 해시 값으로 검색됩니다. 자세한 내용은 [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html)의 man 페이지를 참조하십시오. |                                                                                            |
| `certificateFile`             | PEM 형식의 클라이언트/서버 인증서 파일 경로입니다. `privateKeyFile`에 인증서가 포함되어 있는 경우 생략할 수 있습니다.                                                                                                                                                                                                                                                           |                                                                                            |
| `cipherList`                  | 지원되는 OpenSSL 암호(Cipher)입니다.                                                                                                                                                                                                                                                                                                            | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `disableProtocols`            | 허용되지 않는 프로토콜입니다.                                                                                                                                                                                                                                                                                                                       |                                                                                            |
| `extendedVerification`        | 활성화된 경우, 인증서의 CN 또는 SAN이 피어 호스트 이름과 일치하는지 확인합니다.                                                                                                                                                                                                                                                                                       | `false`                                                                                    |
| `fips`                        | OpenSSL FIPS 모드를 활성화합니다. 사용하는 라이브러리의 OpenSSL 버전이 FIPS를 지원하는 경우에만 사용할 수 있습니다.                                                                                                                                                                                                                                                           | `false`                                                                                    |
| `invalidCertificateHandler`   | 유효하지 않은 인증서를 검증하는 데 사용하는 클래스(CertificateHandler의 하위 클래스)입니다. 예를 들어: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`.                                                                                                                                                                  | `RejectCertificateHandler`                                                                 |
| `loadDefaultCAFile`           | OpenSSL의 내장 CA 인증서를 사용할지 여부를 지정합니다. ClickHouse는 내장 CA 인증서가 파일 `/etc/ssl/cert.pem`(또는 디렉터리 `/etc/ssl/certs`)에 있거나 환경 변수 `SSL_CERT_FILE`(또는 `SSL_CERT_DIR`)로 지정된 파일 또는 디렉터리에 있다고 가정합니다.                                                                                                                                                  | `true`                                                                                     |
| `preferServerCiphers`         | 클라이언트보다 서버에서 선호하는 암호(Cipher)를 사용합니다.                                                                                                                                                                                                                                                                                                   | `false`                                                                                    |
| `privateKeyFile`              | 비밀 키가 포함된 PEM 인증서 파일의 경로입니다. 이 파일에는 키와 인증서를 동시에 포함할 수 있습니다.                                                                                                                                                                                                                                                                            |                                                                                            |
| `privateKeyPassphraseHandler` | 비밀 키에 접근하기 위한 패스프레이즈를 요청하는 클래스(PrivateKeyPassphraseHandler의 서브클래스)입니다. 예: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                            | `KeyConsoleHandler`                                                                        |
| `requireTLSv1`                | TLSv1 연결을 요구합니다. 허용 가능한 값은 `true`, `false`입니다.                                                                                                                                                                                                                                                                                         | `false`                                                                                    |
| `requireTLSv1_1`              | TLSv1.1 연결을 요구합니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                                                            | `false`                                                                                    |
| `requireTLSv1_2`              | TLSv1.2 연결을 요구합니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                                                            | `false`                                                                                    |
| `sessionCacheSize`            | 서버에서 캐시하는 세션의 최대 개수입니다. 값이 `0`이면 세션을 무제한으로 캐시함을 의미합니다.                                                                                                                                                                                                                                                                                 | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionIdContext`            | 서버가 생성되는 각 식별자에 추가하는 고유한 임의 문자 집합입니다. 문자열 길이는 `SSL_MAX_SSL_SESSION_ID_LENGTH`를 초과해서는 안 됩니다. 이 매개변수는 서버가 세션을 캐시하는 경우와 클라이언트가 캐시를 요청한 경우 모두에서 문제를 방지하는 데 도움이 되므로 항상 설정할 것을 권장합니다.                                                                                                                                                        | `$\{application.name\}`                                                                    |
| `sessionTimeout`              | 서버가 세션을 캐시하는 시간(시간 단위)입니다.                                                                                                                                                                                                                                                                                                             | `2`                                                                                        |
| `verificationDepth`           | 검증 체인의 최대 길이입니다. 인증서 체인 길이가 설정된 값을 초과하면 검증에 실패합니다.                                                                                                                                                                                                                                                                                     | `9`                                                                                        |
| `verificationMode`            | 노드 인증서를 검증하는 방식입니다. 자세한 내용은 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 클래스 설명을 참조하십시오. 가능한 값은 `none`, `relaxed`, `strict`, `once`입니다.                                                                                                                                  | `relaxed`                                                                                  |

**설정 예:**

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


## part_log \{#part_log\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)와 관련된 이벤트를 기록합니다. 예를 들어, 데이터 추가 또는 머지 작업이 여기에 포함됩니다. 이 로그를 사용하여 머지 알고리즘을 시뮬레이션하고 그 특성을 비교할 수 있으며, 머지 과정을 시각화할 수 있습니다.

쿼리는 별도의 파일이 아니라 [system.part&#95;log](/operations/system-tables/part_log) 테이블에 기록됩니다. 이 테이블의 이름은 `table` 매개변수에서 설정할 수 있습니다(아래를 참조하십시오).

<SystemLogParameters />

**예**

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


## processors_profile_log \{#processors_profile_log\}

[`processors_profile_log`](../system-tables/processors_profile_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

기본 설정은 다음과 같습니다.

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


## prometheus \{#prometheus\}

[Prometheus](https://prometheus.io)에서 스크레이핑할 수 있도록 메트릭 데이터를 노출합니다.

Settings:

* `endpoint` – Prometheus 서버가 메트릭을 스크레이핑하기 위한 HTTP endpoint입니다. 「/」로 시작해야 합니다.
* `port` – `endpoint`에 사용할 포트입니다.
* `metrics` – [system.metrics](/operations/system-tables/metrics) 테이블의 메트릭을 노출합니다.
* `events` – [system.events](/operations/system-tables/events) 테이블의 메트릭을 노출합니다.
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 테이블의 현재 메트릭 값을 노출합니다.
* `errors` - 마지막 서버 재시작 이후 오류 코드별 오류 발생 횟수를 노출합니다. 이 정보는 [system.errors](/operations/system-tables/errors)에서도 확인할 수 있습니다.

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

확인하십시오 (`127.0.0.1`을 ClickHouse 서버의 IP 주소나 호스트 이름으로 바꾸십시오):

```bash
curl 127.0.0.1:9363/metrics
```


## query_log \{#query_log\}

[log&#95;queries=1](../../operations/settings/settings.md) 설정으로 수신된 쿼리를 로깅하기 위한 설정입니다.

쿼리는 별도 파일이 아니라 [system.query&#95;log](/operations/system-tables/query_log) 테이블에 기록됩니다. 아래에 설명된 대로 `table` 매개변수에서 테이블 이름을 변경할 수 있습니다.

<SystemLogParameters />

테이블이 존재하지 않으면 ClickHouse가 해당 테이블을 생성합니다. ClickHouse 서버가 업데이트되면서 query&#95;log 구조가 변경된 경우, 이전 구조를 가진 테이블의 이름이 변경되고, 새로운 테이블이 자동으로 생성됩니다.

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


## query_metric_log \{#query_metric_log\}

기본적으로 비활성화되어 있습니다.

**활성화**

메트릭 이력 수집 기능인 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)을(를) 수동으로 활성화하려면, 다음 내용을 포함하는 `/etc/clickhouse-server/config.d/query_metric_log.xml` 파일을 생성합니다:

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

`query_metric_log` 설정을 비활성화하려면 다음 내용을 포함하는 파일 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`을 생성해야 합니다:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query_cache \{#query_cache\}

[쿼리 캐시](../query-cache.md) 구성 옵션입니다.

다음 설정을 사용할 수 있습니다:

| Setting                   | Description                                           | Default Value |
| ------------------------- | ----------------------------------------------------- | ------------- |
| `max_entries`             | 캐시에 저장되는 `SELECT` 쿼리 결과의 최대 개수입니다.                    | `1024`        |
| `max_entry_size_in_bytes` | 캐시에 저장되기 위해 `SELECT` 쿼리 결과가 가질 수 있는 최대 크기(바이트 단위)입니다. | `1048576`     |
| `max_entry_size_in_rows`  | 캐시에 저장되기 위해 `SELECT` 쿼리 결과가 가질 수 있는 최대 행 수입니다.        | `30000000`    |
| `max_size_in_bytes`       | 캐시의 최대 크기(바이트 단위)입니다. `0`이면 쿼리 캐시가 비활성화됩니다.           | `1073741824`  |

:::note

* 변경된 설정은 즉시 적용됩니다.
* 쿼리 캐시 데이터는 DRAM에 저장됩니다. 메모리가 부족한 경우 `max_size_in_bytes` 값을 작게 설정하거나 쿼리 캐시를 완전히 비활성화하십시오.
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


## query_thread_log \{#query_thread_log\}

[log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads) 설정으로 수신된 쿼리의 스레드를 로깅하기 위한 설정입니다.

쿼리는 별도의 파일이 아니라 [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) 테이블에 기록됩니다. `table` 파라미터에서 테이블 이름을 변경할 수 있습니다(아래 참조).

<SystemLogParameters />

테이블이 없으면 ClickHouse가 생성합니다. ClickHouse 서버가 업데이트되면서 query thread log의 구조가 변경된 경우, 기존 구조를 가진 테이블의 이름이 변경되고 새로운 테이블이 자동으로 생성됩니다.

**예제**

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


## query_views_log \{#query_views_log\}

[log&#95;query&#95;views=1](/operations/settings/settings#log_query_views) 설정과 함께 사용되며, 해당 설정으로 수신된 쿼리에 의해 실행된 뷰(live, 구체화된 뷰(Materialized View) 등)를 로깅하기 위한 설정입니다.

쿼리는 별도의 파일이 아니라 [system.query&#95;views&#95;log](/operations/system-tables/query_views_log) 테이블에 기록됩니다. 아래에 설명된 `table` 매개변수에서 테이블 이름을 변경할 수 있습니다.

<SystemLogParameters />

테이블이 존재하지 않는 경우 ClickHouse가 테이블을 생성합니다. ClickHouse 서버 업데이트 시 query views 로그의 구조가 변경된 경우, 이전 구조의 테이블 이름이 변경되고 새 테이블이 자동으로 생성됩니다.

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


## text_log \{#text_log\}

텍스트 메시지를 로깅하기 위한 [text&#95;log](/operations/system-tables/text_log) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

추가로:

| Setting | 설명                                   | 기본값     |
| ------- | ------------------------------------ | ------- |
| `level` | 테이블에 저장할 최대 메시지 레벨(기본값은 `Trace`)입니다. | `Trace` |

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


## trace_log \{#trace_log\}

[trace&#95;log](/operations/system-tables/trace_log) 시스템 테이블 동작에 대한 설정입니다.

<SystemLogParameters />

기본 서버 설정 파일 `config.xml`에는 다음 설정 섹션이 포함되어 있습니다.

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


## asynchronous_insert_log \{#asynchronous_insert_log\}

비동기 insert를 로깅하는 [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

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


## crash_log \{#crash_log\}

[crash&#95;log](../../operations/system-tables/crash_log.md) 시스템 테이블 동작에 대한 설정입니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| Setting                            | Description                                                                                                                  | Default             | Note                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------- |
| `buffer_size_rows_flush_threshold` | 로그 행 개수에 대한 임계값입니다. 이 임계값에 도달하면, 백그라운드에서 디스크로 로그를 플러시하는 작업이 실행됩니다.                                                           | `max_size_rows / 2` |                                                                                       |
| `database`                         | 데이터베이스 이름입니다.                                                                                                                |                     |                                                                                       |
| `engine`                           | 시스템 테이블에 대한 [MergeTree 엔진 정의](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)입니다. |                     | `partition_by` 또는 `order_by`가 정의된 경우에는 사용할 수 없습니다. 지정하지 않으면 기본적으로 `MergeTree`가 선택됩니다. |
| `flush_interval_milliseconds`      | 메모리 버퍼에서 테이블로 데이터를 플러시하는 간격(밀리초)입니다.                                                                                         | `7500`              |                                                                                       |
| `flush_on_crash`                   | 크래시 발생 시 로그를 디스크로 덤프할지 여부를 설정합니다.                                                                                            | `false`             |                                                                                       |
| `max_size_rows`                    | 로그의 최대 행 수입니다. 플러시되지 않은 로그의 수가 `max_size`에 도달하면 로그를 디스크로 덤프합니다.                                                              | `1024`              |                                                                                       |
| `order_by`                         | 시스템 테이블에 대한 [사용자 정의 정렬 키](/engines/table-engines/mergetree-family/mergetree#order_by)입니다. `engine`이 정의된 경우 사용할 수 없습니다.       |                     | 시스템 테이블에 `engine`이 지정된 경우, `order_by` 파라미터는 직접 &#39;engine&#39; 내부에 지정해야 합니다.         |
| `partition_by`                     | 시스템 테이블에 대한 [사용자 정의 파티셔닝 키](/engines/table-engines/mergetree-family/custom-partitioning-key.md)입니다.                          |                     | 시스템 테이블에 `engine`이 지정된 경우, `partition_by` 파라미터는 직접 &#39;engine&#39; 내부에 지정해야 합니다.     |
| `reserved_size_rows`               | 로그를 위해 미리 할당되는 메모리 크기(행 수 기준)입니다.                                                                                            | `1024`              |                                                                                       |
| `settings`                         | MergeTree 동작을 제어하는 [추가 파라미터](/engines/table-engines/mergetree-family/mergetree/#settings)입니다(선택 사항).                         |                     | 시스템 테이블에 `engine`이 지정된 경우, `settings` 파라미터는 직접 &#39;engine&#39; 내부에 지정해야 합니다.         |
| `storage_policy`                   | 테이블에 사용할 스토리지 정책 이름입니다(선택 사항).                                                                                               |                     | 시스템 테이블에 `engine`이 지정된 경우, `storage_policy` 파라미터는 직접 &#39;engine&#39; 내부에 지정해야 합니다.   |
| `table`                            | 시스템 테이블 이름입니다.                                                                                                               |                     |                                                                                       |
| `ttl`                              | 테이블 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)을 지정합니다.                              |                     | 시스템 테이블에 `engine`이 지정된 경우, `ttl` 파라미터는 직접 &#39;engine&#39; 내부에 지정해야 합니다.              |

기본 서버 설정 파일 `config.xml`에는 다음과 같은 설정 섹션이 포함되어 있습니다:

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


## custom_cached_disks_base_directory \{#custom_cached_disks_base_directory\}

이 설정은 SQL로 생성된 사용자 정의 캐시 디스크의 캐시 경로를 지정합니다.
`custom_cached_disks_base_directory`는 사용자 정의 디스크에 대해 `filesystem_caches_path` (`filesystem_caches_path.xml`에서 정의됨)보다 우선 적용되며,
앞의 설정이 없는 경우에만 `filesystem_caches_path`가 사용됩니다.
파일 시스템 캐시 설정의 경로는 반드시 해당 디렉터리 내부에 있어야 하며,
그렇지 않으면 디스크가 생성되지 않도록 예외가 발생합니다.

:::note
이는 서버를 업그레이드하기 이전 버전에서 생성된 디스크에는 영향을 주지 않습니다.
이러한 경우에는 서버가 정상적으로 시작될 수 있도록 예외가 발생하지 않습니다.
:::

예:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## backup_log \{#backup_log\}

`BACKUP` 및 `RESTORE` 작업을 로깅하는 [backup&#95;log](../../operations/system-tables/backup_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

**예시**

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


## blob_storage_log \{#blob_storage_log\}

[`blob_storage_log`](../system-tables/blob_storage_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

예:

```xml
<blob_storage_log>
    <database>system</database
    <table>blob_storage_log</table
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```


## query_masking_rules \{#query_masking_rules\}

정규식 기반 규칙입니다. 이 규칙은 쿼리뿐 아니라 서버 로그에 저장되기 전에 모든 로그 메시지에도 적용됩니다.
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) 테이블과 클라이언트로 전송되는 로그에 적용됩니다. 이를 통해 이름, 이메일, 개인 식별자, 신용카드 번호와 같은 SQL 쿼리 내 민감한 데이터가 로그로 유출되는 것을 방지할 수 있습니다.

**예시**

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

| Setting   | Description                          |
| --------- | ------------------------------------ |
| `name`    | 규칙 이름 (선택 사항)                        |
| `regexp`  | RE2 호환 정규식 (필수)                      |
| `replace` | 민감한 데이터를 대체할 문자열 (선택 사항, 기본값: 별표 6개) |

마스킹 규칙은 전체 쿼리에 적용되어, 형식이 잘못되었거나 구문 분석할 수 없는 쿼리에서 민감한 데이터가 유출되는 것을 방지합니다.

[`system.events`](/operations/system-tables/events) 테이블에는 `QueryMaskingRulesMatch` 카운터가 있어, 쿼리 마스킹 규칙 일치 횟수의 전체 합계를 나타냅니다.

분산 쿼리를 사용할 때는 각 서버를 개별적으로 구성해야 하며, 그렇지 않으면 다른 노드로 전달되는 서브쿼리가 마스킹 없이 저장됩니다.


## remote_servers \{#remote_servers\}

[Distributed](../../engines/table-engines/special/distributed.md) 테이블 엔진과 `cluster` 테이블 함수에서 사용하는 클러스터 구성입니다.

**예시**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 속성 값은 「[설정 파일](/operations/configuration-files)」 절을 참조하십시오.

**관련 항목**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Cluster Discovery](../../operations/cluster-discovery.md)
* [복제된 데이터베이스 엔진(Replicated database engine)](../../engines/database-engines/replicated.md)


## remote_url_allow_hosts \{#remote_url_allow_hosts\}

URL 기반 저장소 엔진과 테이블 함수에서 사용이 허용되는 호스트 목록입니다.

`\<host\>` xml 태그로 호스트를 추가할 때:

* URL에 표시된 것과 정확히 동일하게 지정해야 하며, DNS 확인 전에 이름을 검사합니다. 예: `<host>clickhouse.com</host>`
* URL에 포트가 명시적으로 지정된 경우, host:port 조합 전체를 검사합니다. 예: `<host>clickhouse.com:80</host>`
* 호스트가 포트 없이 지정된 경우, 해당 호스트의 모든 포트가 허용됩니다. 예: `<host>clickhouse.com</host>`가 지정되어 있으면 `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) 등이 허용됩니다.
* 호스트가 IP 주소로 지정된 경우, URL에 지정된 그대로 검사합니다. 예: `[2a02:6b8:a::a]`.
* 리다이렉트가 있고 리다이렉트 지원이 활성화된 경우, 모든 리다이렉트(location 필드)를 검사합니다.

예:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## timezone \{#timezone\}

서버의 시간대입니다.

UTC 시간대 또는 특정 지리적 위치를 나타내는 IANA 식별자로 지정합니다(예: Africa/Abidjan).

시간대는 DateTime 필드를 텍스트 형식(화면에 출력하거나 파일에 기록)에 출력할 때와 문자열에서 DateTime을 파싱할 때 String과 DateTime 형식 간 변환을 위해 필요합니다. 또한 입력 매개변수로 시간대를 전달받지 못한 시간/날짜 관련 함수에서 시간대를 사용합니다.

**예**

```xml
<timezone>Asia/Istanbul</timezone>
```

**함께 보기**

* [session&#95;timezone](../settings/settings.md#session_timezone)


## tcp_port \{#tcp_port\}

TCP 프로토콜로 클라이언트와 통신할 때 사용하는 포트입니다.

**예시**

```xml
<tcp_port>9000</tcp_port>
```


## tcp_port_secure \{#tcp_port_secure\}

클라이언트와의 보안 통신용 TCP 포트입니다. [OpenSSL](#openssl) 설정과 함께 사용하십시오.

**기본값**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## mysql_port \{#mysql_port\}

MySQL 프로토콜을 통해 클라이언트와 통신하는 데 사용하는 포트입니다.

:::note

* 양의 정수는 수신 대기할 포트 번호를 지정합니다.
* 값을 비워 두면 MySQL 프로토콜을 통한 클라이언트와의 통신이 비활성화됩니다.
  :::

**예제**

```xml
<mysql_port>9004</mysql_port>
```


## postgresql_port \{#postgresql_port\}

PostgreSQL 프로토콜을 사용하여 클라이언트와 통신하는 포트입니다.

:::note

* 양의 정수 값은 수신할 포트 번호를 지정합니다.
* 값을 비워 두면 PostgreSQL 프로토콜을 통한 클라이언트와의 통신이 비활성화됩니다.
  :::

**예시**

```xml
<postgresql_port>9005</postgresql_port>
```


## url_scheme_mappers \{#url_scheme_mappers\}

축약되거나 기호로 표현된 URL 접두사를 전체 URL로 매핑하기 위한 구성입니다.

예:

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


## user_defined_path \{#user_defined_path\}

사용자 정의 파일이 저장되는 디렉터리입니다. SQL UDF(User-defined Function)에 사용되며, 자세한 내용은 [SQL User Defined Functions](/sql-reference/functions/udf)을(를) 참고하십시오.

**예제**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## users_config \{#users_config\}

다음을 포함하는 파일의 경로입니다:

* 사용자 구성
* 액세스 권한
* 설정 프로필(SETTINGS PROFILE)
* 쿼터 설정

**예**

```xml
<users_config>users.xml</users_config>
```


## access_control_improvements \{#access_control_improvements\}

액세스 제어 시스템의 선택적 개선 기능에 대한 설정입니다.

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                    | Default |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` 쿼리에 `CLUSTER` 권한이 필요한지 여부를 설정합니다.                                                                                                                                                                                                                                                                                                                 | `true`  |
| `role_cache_expiration_time_seconds`            | 마지막 접근 이후 역할이 Role Cache에 저장되어 있는 시간을 초 단위로 설정합니다.                                                                                                                                                                                                                                                                                                             | `600`   |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` 쿼리에 권한이 필요한지, 그리고 모든 사용자가 실행할 수 있는지 여부를 설정합니다. true로 설정하면, 이 쿼리는 일반 테이블과 마찬가지로 `GRANT SELECT ON information_schema.<table>` 권한이 필요합니다.                                                                                                                                                                              | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>` 쿼리에 권한이 필요한지, 그리고 모든 사용자가 실행할 수 있는지 여부를 설정합니다. true로 설정하면, 이 쿼리는 비 시스템 테이블과 마찬가지로 `GRANT SELECT ON system.<table>` 권한이 필요합니다. 예외: 일부 시스템 테이블(`tables`, `columns`, `databases` 및 `one`, `contributors` 같은 일부 상수 테이블)은 여전히 모든 사용자에게 접근 가능합니다. 또한 `SHOW USERS`와 같은 `SHOW` 권한이 부여된 경우, 해당하는 시스템 테이블(예: `system.users`)에 접근할 수 있습니다. | `true`  |
| `settings_constraints_replace_previous`         | 특정 SETTING에 대해 설정 프로필(SETTINGS PROFILE) 내에서 정의된 제약 조건이, 해당 SETTING에 대해 다른 프로필에서 이전에 정의된 제약 조건의 동작을 취소할지 여부를 설정합니다. 여기에는 새 제약 조건에서 설정하지 않은 필드도 포함됩니다. 또한 `changeable_in_readonly` 제약 조건 유형을 활성화합니다.                                                                                                                                                             | `true`  |
| `table_engines_require_grant`                   | 특정 테이블 엔진을 사용하는 테이블 생성에 권한이 필요한지 여부를 설정합니다.                                                                                                                                                                                                                                                                                                                    | `false` |
| `throw_on_unmatched_row_policies`               | 테이블에 ROW POLICY가 존재하지만 현재 사용자에게 해당하는 ROW POLICY가 하나도 없는 경우, 해당 테이블을 읽을 때 예외를 발생시킬지 여부를 설정합니다.                                                                                                                                                                                                                                                                  | `false` |
| `users_without_row_policies_can_read_rows`      | 허용적인 ROW POLICY가 없는 사용자도 `SELECT` 쿼리를 사용해 행을 읽을 수 있는지 여부를 설정합니다. 예를 들어, 사용자 A와 B가 있고 ROW POLICY가 A에만 정의되어 있는 경우, 이 설정이 true이면 사용자 B는 모든 행을 볼 수 있습니다. 이 설정이 false이면 사용자 B는 어떤 행도 볼 수 없습니다.                                                                                                                                                                      | `true`  |

Example:

```xml
<access_control_improvements>
    <throw_on_unmatched_row_policies>true</throw_on_unmatched_row_policies>
    <users_without_row_policies_can_read_rows>true</users_without_row_policies_can_read_rows>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
    <select_from_system_db_requires_grant>true</select_from_system_db_requires_grant>
    <select_from_information_schema_requires_grant>true</select_from_information_schema_requires_grant>
    <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
    <table_engines_require_grant>false</table_engines_require_grant>
    <role_cache_expiration_time_seconds>600</role_cache_expiration_time_seconds>
</access_control_improvements>
```


## s3queue_log \{#s3queue_log\}

`s3queue_log` 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

기본 설정은 다음과 같습니다.

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```


## dead_letter_queue \{#dead_letter_queue\}

&#39;dead&#95;letter&#95;queue&#39; 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

기본 설정은 다음과 같습니다.

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```


## zookeeper \{#zookeeper\}

ClickHouse가 [ZooKeeper](http://zookeeper.apache.org/) 클러스터와 상호 작용할 수 있도록 하는 설정을 포함합니다. ClickHouse는 복제된 테이블(Replicated Table)을 사용할 때 레플리카 메타데이터를 저장하기 위해 ZooKeeper를 사용합니다. 복제된 테이블을 사용하지 않는 경우 이 매개변수 섹션은 생략할 수 있습니다.

다음 설정들은 하위 태그로 구성할 수 있습니다:

| Setting                                         | Description                                                                                                                                                                                                                                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                          | ZooKeeper 엔드포인트입니다. 여러 엔드포인트를 설정할 수 있습니다. 예: `<node index="1"><host>example_host</host><port>2181</port></node>`. `index` 속성은 ZooKeeper 클러스터에 연결을 시도할 때 노드의 순서를 지정합니다.                                                                                                                 |
| `operation_timeout_ms`                          | 단일 작업에 대한 최대 타임아웃(밀리초)입니다.                                                                                                                                                                                                                                                             |
| `session_timeout_ms`                            | 클라이언트 세션에 대한 최대 타임아웃(밀리초)입니다.                                                                                                                                                                                                                                                          |
| `root` (optional)                               | ClickHouse 서버에서 사용하는 znode들의 루트로 사용되는 znode입니다.                                                                                                                                                                                                                                        |
| `fallback_session_lifetime.min` (optional)      | 기본 노드가 사용 불가능할 때(로드 밸런싱) 대체(fallback) 노드에 대한 ZooKeeper 세션 수명 최소 한계입니다. 단위는 초입니다. 기본값: 3시간.                                                                                                                                                                                             |
| `fallback_session_lifetime.max` (optional)      | 기본 노드가 사용 불가능할 때(로드 밸런싱) 대체(fallback) 노드에 대한 ZooKeeper 세션 수명 최대 한계입니다. 단위는 초입니다. 기본값: 6시간.                                                                                                                                                                                             |
| `identity` (optional)                           | 요청된 znode에 접근하기 위해 ZooKeeper가 요구하는 사용자와 비밀번호입니다.                                                                                                                                                                                                                                       |
| `use_compression` (optional)                    | `true`로 설정하면 Keeper 프로토콜에서 압축을 활성화합니다.                                                                                                                                                                                                                                                 |
| `use_xid_64` (optional)                         | 64비트 트랜잭션 ID를 활성화합니다. 확장 트랜잭션 ID 형식을 사용하려면 `true`로 설정합니다. 기본값: `false`.                                                                                                                                                                                                                |
| `pass_opentelemetry_tracing_context` (optional) | Keeper 요청으로 OpenTelemetry 트레이싱 컨텍스트 전파를 활성화합니다. 활성화되면 Keeper 작업에 대해 트레이싱 스팬이 생성되어 ClickHouse와 Keeper 간 분산 트레이싱이 가능해집니다. `use_xid_64`가 활성화되어 있어야 합니다. 자세한 내용은 [Tracing ClickHouse Keeper Requests](/operations/opentelemetry#tracing-clickhouse-keeper-requests)를 참조하십시오. 기본값: `false`. |

또한 ZooKeeper 노드 선택 알고리즘을 선택할 수 있는 `zookeeper_load_balancing` 설정(선택 사항)도 있습니다:

| Algorithm Name                  | Description                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `random`                        | ZooKeeper 노드 중 하나를 무작위로 선택합니다.                                                |
| `in_order`                      | 첫 번째 ZooKeeper 노드를 선택하고, 사용할 수 없으면 두 번째, 그다음 순서로 선택합니다.                       |
| `nearest_hostname`              | 서버의 호스트 이름과 가장 비슷한 호스트 이름을 가진 ZooKeeper 노드를 선택합니다. 호스트 이름은 이름 접두사 기준으로 비교합니다. |
| `hostname_levenshtein_distance` | `nearest_hostname`와 유사하지만, 레벤슈타인 거리 방식으로 호스트 이름을 비교합니다.                       |
| `first_or_random`               | 첫 번째 ZooKeeper 노드를 선택하고, 사용할 수 없으면 나머지 ZooKeeper 노드 중 하나를 무작위로 선택합니다.         |
| `round_robin`                   | 첫 번째 ZooKeeper 노드를 선택하고, 재연결이 발생하면 그다음 노드를 선택합니다.                             |

**예시 구성**

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
    <!-- Optional. Enable 64-bit transaction IDs. -->
    <use_xid_64>false</use_xid_64>
    <!-- Optional. Enable OpenTelemetry tracing context propagation (requires use_xid_64). -->
    <pass_opentelemetry_tracing_context>false</pass_opentelemetry_tracing_context>
</zookeeper>
```

**참고**


- [복제(Replication)](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper 프로그래머용 가이드](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse와 Zookeeper 간의 선택적 보안 통신](/operations/ssl-zookeeper)

## use_minimalistic_part_header_in_zookeeper \{#use_minimalistic_part_header_in_zookeeper\}

ZooKeeper에서 데이터 파트 헤더를 저장하는 방법을 제어하는 설정입니다. 이 설정은 [`MergeTree`](/engines/table-engines/mergetree-family) 계열에만 적용됩니다. 다음과 같이 지정할 수 있습니다.

**`config.xml` 파일의 [merge_tree](#merge_tree) 섹션에서 전역적으로 지정**

ClickHouse는 서버의 모든 테이블에 대해 이 설정을 사용합니다. 이 설정은 언제든지 변경할 수 있습니다. 기존 테이블도 설정이 변경되면 동작이 변경됩니다.

**테이블별로 지정**

테이블을 생성할 때 관련 [엔진 설정](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)을 지정합니다. 이 설정을 가진 기존 테이블의 동작은 전역 설정이 변경되더라도 바뀌지 않습니다.

**가능한 값**

- `0` — 기능이 비활성화됩니다.
- `1` — 기능이 활성화됩니다.

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)인 경우, [복제된](../../engines/table-engines/mergetree-family/replication.md) 테이블은 데이터 파트의 헤더를 단일 `znode`를 사용하여 간소한 형식으로 저장합니다. 테이블에 컬럼이 많이 포함된 경우, 이 저장 방식은 ZooKeeper에 저장되는 데이터 양을 크게 줄여 줍니다.

:::note
`use_minimalistic_part_header_in_zookeeper = 1`을 적용한 이후에는 이 설정을 지원하지 않는 버전의 ClickHouse 서버로 다운그레이드할 수 없습니다. 클러스터의 서버에서 ClickHouse를 업그레이드할 때는 주의해야 합니다. 모든 서버를 한 번에 업그레이드하지 마십시오. 테스트 환경이나 클러스터의 일부 서버에서 새 버전의 ClickHouse를 먼저 검증하는 것이 더 안전합니다.

이 설정으로 이미 저장된 데이터 파트 헤더는 이전(비-간소화) 표현으로 복원할 수 없습니다.
:::

## distributed_ddl \{#distributed_ddl\}

클러스터에서 [분산 DDL 쿼리](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) 실행을 관리합니다.
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper)가 활성화된 경우에만 동작합니다.

`<distributed_ddl>`에서 설정 가능한 항목은 다음과 같습니다:

| Setting                | Description                                                               | Default Value                  |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------ |
| `cleanup_delay_period` | 마지막 정리가 `cleanup_delay_period`초 이내에 수행되지 않았다면, 새 노드 이벤트가 수신된 후 정리를 시작합니다. | `60` seconds                   |
| `max_tasks_in_queue`   | 큐에 있을 수 있는 작업의 최대 개수입니다.                                                  | `1,000`                        |
| `path`                 | DDL 쿼리를 위한 `task_queue`가 위치하는 Keeper 상의 경로입니다.                            |                                |
| `pool_size`            | 동시에 실행될 수 있는 `ON CLUSTER` 쿼리의 개수입니다.                                      |                                |
| `profile`              | DDL 쿼리 실행에 사용되는 프로필입니다.                                                   |                                |
| `task_max_lifetime`    | 노드의 나이가 이 값보다 크면 노드를 삭제합니다.                                               | `7 * 24 * 60 * 60` (일주일, 초 단위) |

**예시**

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


## access_control_path \{#access_control_path\}

ClickHouse 서버가 SQL 명령으로 생성한 사용자 및 역할 설정을 저장하는 폴더 경로입니다.

**관련 문서**

- [액세스 제어 및 계정 관리](/operations/access-rights#access-control-usage)

## allow_plaintext_password \{#allow_plaintext_password\}

보안성이 떨어지는 평문(plaintext) 비밀번호 유형의 사용을 허용할지 여부를 설정합니다.

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_no_password \{#allow_no_password\}

보안에 취약한 `no_password` 비밀번호 유형의 사용을 허용할지 여부를 설정합니다.

```xml
<allow_no_password>1</allow_no_password>
```


## allow_implicit_no_password \{#allow_implicit_no_password\}

&#39;IDENTIFIED WITH no&#95;password&#39;를 명시적으로 지정하지 않으면 비밀번호 없이 USER를 생성할 수 없습니다.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## default_session_timeout \{#default_session_timeout\}

기본 세션 타임아웃(초 단위).

```xml
<default_session_timeout>60</default_session_timeout>
```


## default_password_type \{#default_password_type\}

`CREATE USER u IDENTIFIED BY 'p'`와 같은 쿼리에서 자동으로 설정되는 비밀번호 유형을 지정합니다.

허용되는 값은 다음과 같습니다.

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## user_directories \{#user_directories\}

설정 파일에서 다음과 같은 설정을 포함하는 섹션입니다.

* 미리 정의된 사용자가 포함된 설정 파일의 경로.
* SQL 명령으로 생성된 사용자가 저장되는 폴더의 경로.
* SQL 명령으로 생성된 사용자가 저장되고 복제되는 ZooKeeper 노드 경로.

이 섹션이 지정되면 [users&#95;config](/operations/server-configuration-parameters/settings#users_config) 및 [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path)에 지정된 경로는 사용되지 않습니다.

`user_directories` 섹션에는 항목을 개수 제한 없이 포함할 수 있으며, 항목의 순서는 우선순위를 의미합니다(위에 있는 항목일수록 우선순위가 높습니다).

**예제**

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

사용자, 역할, 행 정책(row policy), QUOTA, 프로필은 ZooKeeper에 또한 저장할 수 있습니다.

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

`memory` 섹션을 정의할 수도 있습니다. 이는 정보를 디스크에 기록하지 않고 메모리에만 저장함을 의미합니다. 또한 `ldap` 섹션을 정의할 수 있으며, 이는 정보를 LDAP 서버에 저장함을 의미합니다.

로컬에 정의되지 않은 사용자의 원격 사용자 디렉토리로 LDAP 서버를 추가하려면, 다음 설정을 사용하여 단일 `ldap` 섹션을 정의합니다:

| Setting  | Description                                                                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `roles`  | LDAP 서버에서 조회된 각 사용자에게 할당할 로컬 정의 역할 목록을 담은 섹션입니다. 역할이 지정되지 않으면 사용자는 인증 후 어떠한 작업도 수행할 수 없습니다. 나열된 역할 중 하나라도 인증 시점에 로컬에 정의되어 있지 않으면, 제공된 비밀번호가 올바르지 않은 경우와 동일하게 인증 시도가 실패합니다. |
| `server` | `ldap_servers` 설정 섹션에 정의된 LDAP 서버 이름 중 하나입니다. 이 매개변수는 필수이며 비워 둘 수 없습니다.                                                                                                    |

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


## top_level_domains_list \{#top_level_domains_list\}

추가할 사용자 정의 최상위 도메인 목록을 정의하며, 각 항목은 `<name>/path/to/file</name>` 형식입니다.

예를 들어:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

관련 항목:

* 사용자 지정 TLD 목록 이름을 인수로 받아, 첫 번째로 의미 있는 서브도메인까지의 상위 서브도메인을 포함하는 도메인 부분을 반환하는 함수 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) 및 그 변형.


## proxy \{#proxy\}

HTTP 및 HTTPS 요청을 위한 프록시 서버를 정의합니다. 현재 S3 storage, S3 table functions, URL functions에서 지원됩니다.

프록시 서버를 정의하는 방법은 세 가지입니다:

* environment variables
* proxy lists
* remote proxy resolvers.

`no_proxy`를 사용하여 특정 호스트에 대해서는 프록시 서버를 우회하도록 설정할 수도 있습니다.

**Environment variables**

`http_proxy` 및 `https_proxy` environment variables를 사용하여
각 프로토콜에 대한 프록시 서버를 지정할 수 있습니다. 시스템에 해당 변수가 설정되어 있으면 별도의 추가 설정 없이 동작합니다.

이 방식은 특정 프로토콜에 대해
프록시 서버가 하나뿐이고 해당 프록시 서버가 변경되지 않을 때 가장 단순한 방법입니다.

**Proxy lists**

이 방식을 사용하면 하나 이상의
프록시 서버를 프로토콜별로 지정할 수 있습니다. 둘 이상의 프록시 서버가 정의된 경우
ClickHouse는 서버 간 부하를 분산하기 위해 라운드 로빈 방식으로 서로 다른 프록시를 순차적으로 사용합니다.
이는 하나의 프로토콜에 대해 둘 이상의 프록시 서버가 있고 프록시 서버 목록이 변경되지 않을 때 가장 단순한 방법입니다.

**Configuration template**

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

하위 필드를 보려면 아래 탭에서 상위 필드를 선택하십시오:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | 필드        | 설명                  |
    | --------- | ------------------- |
    | `<http>`  | 하나 이상의 HTTP 프록시 목록  |
    | `<https>` | 하나 이상의 HTTPS 프록시 목록 |
  </TabItem>

  <TabItem value="http_https" label="<http> 및 <https>">
    | 필드      | 설명       |
    | ------- | -------- |
    | `<uri>` | 프록시의 URI |
  </TabItem>
</Tabs>

**원격 프록시 리졸버(Remote proxy resolver)**

프록시 서버가 동적으로 변경될 수 있습니다.
이 경우 리졸버의 엔드포인트를 정의할 수 있습니다. ClickHouse는 해당 엔드포인트로 본문이 없는 GET 요청을 보내고, 원격 리졸버는 프록시 호스트를 반환해야 합니다.
ClickHouse는 반환된 값을 사용하여 다음 템플릿을 기반으로 프록시 URI를 구성합니다: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**구성 템플릿(Configuration template)**

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

아래 탭에서 상위 필드를 선택하여 하위 항목을 확인하십시오:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description            |
    | --------- | ---------------------- |
    | `<http>`  | 하나 이상의 resolver 목록입니다* |
    | `<https>` | 하나 이상의 resolver 목록입니다* |
  </TabItem>

  <TabItem value="http_https" label="<http> 및 <https>">
    | Field        | Description                |
    | ------------ | -------------------------- |
    | `<resolver>` | resolver의 엔드포인트 및 기타 세부 정보 |

    :::note
    여러 개의 `<resolver>` 요소를 둘 수 있지만, 주어진 프로토콜에 대해서는
    첫 번째 `<resolver>`만 사용됩니다. 해당 프로토콜에 대한 다른
    `<resolver>` 요소는 모두 무시됩니다. 따라서 부하 분산이 필요하다면
    원격 resolver에서 구현해야 합니다.
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | Field                | Description                                                                                                           |
    | -------------------- | --------------------------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | 프록시 resolver의 URI                                                                                                     |
    | `<proxy_scheme>`     | 최종 프록시 URI의 프로토콜입니다. `http` 또는 `https` 중 하나가 될 수 있습니다.                                                                |
    | `<proxy_port>`       | 프록시 resolver의 포트 번호                                                                                                   |
    | `<proxy_cache_time>` | resolver에서 가져온 값을 ClickHouse가 캐시해야 하는 시간(초)입니다. 이 값을 `0`으로 설정하면 ClickHouse는 모든 HTTP 또는 HTTPS 요청마다 resolver에 접속하게 됩니다. |
  </TabItem>
</Tabs>

**우선순위**

프록시 설정은 다음 순서로 결정됩니다:

| Order | Setting         |
| ----- | --------------- |
| 1.    | 원격 프록시 resolver |
| 2.    | 프록시 목록          |
| 3.    | 환경 변수           |


ClickHouse는 요청 프로토콜에 대해 우선순위가 가장 높은 리졸버 타입을 확인합니다. 해당 타입이 정의되어 있지 않은 경우,
환경 리졸버에 도달할 때까지 그다음으로 우선순위가 높은 리졸버 타입을 순차적으로 확인합니다.
이를 통해 여러 종류의 리졸버 타입을 함께 사용할 수 있습니다.

## disable_tunneling_for_https_requests_over_http_proxy \{#disable_tunneling_for_https_requests_over_http_proxy\}

기본적으로 `HTTP` 프록시를 통해 `HTTPS` 요청을 보낼 때 터널링(즉, `HTTP CONNECT`)이 사용됩니다. 이 설정을 사용하여 터널링을 비활성화할 수 있습니다.

**no&#95;proxy**

기본적으로 모든 요청은 프록시를 통해 전송됩니다. 특정 호스트에 대해서만 프록시 사용을 비활성화하려면 `no_proxy` 변수를 설정해야 합니다.
이 변수는 list 및 remote resolver의 `<proxy>` 절 안에서 설정할 수 있으며, environment resolver의 경우 환경 변수로 설정할 수 있습니다.
IP 주소, 도메인, 서브도메인과 전체 우회를 위한 `'*'` 와일드카드를 지원합니다. curl과 마찬가지로 앞에 붙은 점(leading dot)은 제거됩니다.

**Example**

아래 구성은 `clickhouse.cloud` 및 그 모든 서브도메인(예: `auth.clickhouse.cloud`)으로 가는 요청에 대해 프록시를 우회하도록 합니다.
GitLab도 마찬가지로, 도메인 앞에 점이 있더라도 동일하게 동작합니다. `gitlab.com`과 `about.gitlab.com` 모두 프록시를 우회하게 됩니다.

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


## workload_path \{#workload_path\}

모든 `CREATE WORKLOAD` 및 `CREATE RESOURCE` 쿼리를 저장하는 데 사용되는 디렉터리입니다. 기본적으로 서버 작업 디렉터리 아래의 `/workload/` 폴더가 사용됩니다.

**예시**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**함께 보기**

* [Workload 계층 구조](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)


## workload_zookeeper_path \{#workload_zookeeper_path\}

모든 `CREATE WORKLOAD` 및 `CREATE RESOURCE` 쿼리의 저장소로 사용되는 ZooKeeper 노드의 경로입니다. 일관성을 위해 모든 SQL 정의는 단일 znode의 값으로 저장됩니다. 기본값으로는 ZooKeeper를 사용하지 않으며, 정의는 [디스크](#workload_path)에 저장됩니다.

**예시**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**관련 항목**

* [워크로드 계층 구조](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)


## zookeeper_log \{#zookeeper_log\}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) 시스템 테이블에 대한 설정입니다.

다음 설정은 하위 태그로 설정할 수 있습니다:

<SystemLogParameters />

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
