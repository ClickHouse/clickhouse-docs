:::important 모범 사례
ClickHouse Server를 구성할 때 설정 파일을 추가하거나 편집하는 경우에는 다음 사항을 지키십시오.

- 파일을 `/etc/clickhouse-server/config.d/` 디렉터리에 추가합니다.
- 파일을 `/etc/clickhouse-server/users.d/` 디렉터리에 추가합니다.
- `/etc/clickhouse-server/config.xml` 파일은 수정하지 않고 그대로 둡니다.
- `/etc/clickhouse-server/users.xml` 파일은 수정하지 않고 그대로 둡니다.
:::