---
'slug': '/operations/utilities/static-files-disk-uploader'
'title': 'clickhouse-static-files-disk-uploader'
'keywords':
- 'clickhouse-static-files-disk-uploader'
- 'utility'
- 'disk'
- 'uploader'
'description': 'clickhouse-static-files-disk-uploader 유틸리티에 대한 설명을 제공합니다.'
'doc_type': 'guide'
---


# clickhouse-static-files-disk-uploader

지정된 ClickHouse 테이블에 대한 메타데이터를 포함하는 데이터 디렉토리를 출력합니다. 이 메타데이터는 `web` 디스크에 의해 지원되는 읽기 전용 데이터셋을 포함하는 다른 서버에 ClickHouse 테이블을 만드는 데 사용할 수 있습니다.

이 도구를 사용하여 데이터를 마이그레이션하지 마십시오. 대신, [`BACKUP` 및 `RESTORE` 명령어](/operations/backup)를 사용하십시오.

## 사용법 {#usage}

```bash
$ clickhouse static-files-disk-uploader [args]
```

## 명령어 {#commands}

|Command|Description|
|---|---|
|`-h`, `--help`|도움 정보를 출력합니다|
|`--metadata-path [path]`|지정된 테이블에 대한 메타데이터가 포함된 경로|
|`--test-mode`|테이블 메타데이터와 함께 지정된 URL에 PUT 요청을 제출하는 `test` 모드를 활성화합니다|
|`--link`|출력 디렉토리에 파일을 복사하는 대신 심볼릭 링크를 생성합니다|
|`--url [url]`|`test` 모드의 웹 서버 URL|
|`--output-dir [dir]`|`non-test` 모드에서 파일을 출력할 디렉토리|

## 지정된 테이블의 메타데이터 경로 가져오기 {#retrieve-metadata-path-for-the-specified-table}

`clickhouse-static-files-disk-uploader`를 사용할 때 원하는 테이블의 메타데이터 경로를 얻어야 합니다.

1. 대상 테이블과 데이터베이스를 지정하여 다음 쿼리를 실행합니다:

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. 이는 지정된 테이블에 대한 데이터 디렉토리 경로를 반환해야 합니다:

<br />

```response
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```

## 로컬 파일 시스템에 테이블 메타데이터 디렉토리 출력하기 {#output-table-metadata-directory-to-the-local-filesystem}

타겟 출력 디렉토리 `output`과 주어진 메타데이터 경로를 사용하여 다음 명령어를 실행합니다:

```bash
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

성공하면 다음 메시지가 표시되며, `output` 디렉토리에는 지정된 테이블에 대한 메타데이터가 포함되어야 합니다:

```repsonse
Data path: "/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee", destination path: "output"
```

## 외부 URL로 테이블 메타데이터 디렉토리 출력하기 {#output-table-metadata-directory-to-an-external-url}

이 단계는 데이터 디렉토리를 로컬 파일 시스템에 출력하는 것과 유사하지만 `--test-mode` 플래그가 추가됩니다. 출력 디렉토리를 지정하는 대신 `--url` 플래그를 통해 타겟 URL을 지정해야 합니다.

`test` 모드가 활성화되면, 테이블 메타데이터 디렉토리가 PUT 요청을 통해 지정된 URL에 업로드됩니다.

```bash
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

## 테이블 메타데이터 디렉토리를 사용하여 ClickHouse 테이블 만들기 {#using-the-table-metadata-directory-to-create-a-clickhouse-table}

테이블 메타데이터 디렉토리를 얻은 후, 이를 사용하여 다른 서버에 ClickHouse 테이블을 생성할 수 있습니다.

데모를 보여주는 [이 GitHub 리포지토리](https://github.com/ClickHouse/web-tables-demo)를 참조하십시오. 예제에서는 `web` 디스크를 사용하여 테이블을 생성하며, 이는 테이블을 다른 서버의 데이터셋에 첨부할 수 있게 해줍니다.
