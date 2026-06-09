`default`를 재사용하기보다는 collector 전용 사용자를 생성하는 것이 좋습니다. SQL 콘솔에서 서비스에 연결한 다음, 다음을 실행하십시오:

```sql
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

:::tip
위 스니펫의 비밀번호를 충분히 강력한 비밀번호로 변경하세요.
:::

collector는 처음 사용 시 `otel` 데이터베이스에 로그, trace, 메트릭용 스키마(schema)를 생성합니다. 프로덕션 환경의 사용자 설정에 관한 자세한 내용은 [프로덕션 환경으로 전환](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed)을 참조하십시오.