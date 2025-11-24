---
'sidebar_label': '가이드'
'slug': '/integrations/dbt/guides'
'sidebar_position': 2
'description': 'ClickHouse와 함께 dbt 사용에 대한 가이드'
'keywords':
- 'clickhouse'
- 'dbt'
- 'guides'
'title': '가이드'
'doc_type': 'guide'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import dbt_01 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_01.png';
import dbt_02 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_02.png';
import dbt_03 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_03.png';
import dbt_04 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_04.png';
import dbt_05 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_05.png';
import dbt_06 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_06.png';
import dbt_07 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_07.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 가이드

<ClickHouseSupportedBadge/>

이 섹션에서는 dbt 및 ClickHouse 어댑터 설정에 대한 가이드와 공개적으로 사용 가능한 IMDB 데이터 세트를 사용한 dbt 및 ClickHouse 사용 예시를 제공합니다. 예시는 다음 단계로 구성됩니다:

1. dbt 프로젝트 생성 및 ClickHouse 어댑터 설정.
2. 모델 정의.
3. 모델 업데이트.
4. 증분 모델 생성.
5. 스냅샷 모델 생성.
6. 물리화된 뷰 사용.

이 가이드는 나머지 [문서](/integrations/dbt) 및 [기능과 구성](/integrations/dbt/features-and-configurations)과 함께 사용하는 것을 목표로 합니다.

<TOCInline toc={toc}  maxHeadingLevel={2} />

## 설정 {#setup}

환경을 준비하기 위해 [dbt 및 ClickHouse 어댑터 설정](/integrations/dbt) 섹션의 지침을 따르세요.

**중요: 다음은 python 3.9에서 테스트되었습니다.**

### ClickHouse 준비 {#prepare-clickhouse}

dbt는 고도로 관계형 데이터를 모델링하는 데 뛰어납니다. 예시를 위해 다음 관계형 스키마를 가진 작은 IMDB 데이터 세트를 제공합니다. 이 데이터 세트는 [관계형 데이터 세트 저장소](https://relational.fit.cvut.cz/dataset/IMDb)에서 출처를 잡고 있습니다. 이는 dbt와 함께 사용되는 일반적인 스키마에 비해 사소하지만 관리 가능한 샘플을 나타냅니다:

<Image img={dbt_01} size="lg" alt="IMDB 테이블 스키마" />

우리는 다음의 테이블의 하위 집합을 사용합니다.

다음 테이블을 생성하세요:

```sql
CREATE DATABASE imdb;

CREATE TABLE imdb.actors
(
    id         UInt32,
    first_name String,
    last_name  String,
    gender     FixedString(1)
) ENGINE = MergeTree ORDER BY (id, first_name, last_name, gender);

CREATE TABLE imdb.directors
(
    id         UInt32,
    first_name String,
    last_name  String
) ENGINE = MergeTree ORDER BY (id, first_name, last_name);

CREATE TABLE imdb.genres
(
    movie_id UInt32,
    genre    String
) ENGINE = MergeTree ORDER BY (movie_id, genre);

CREATE TABLE imdb.movie_directors
(
    director_id UInt32,
    movie_id    UInt64
) ENGINE = MergeTree ORDER BY (director_id, movie_id);

CREATE TABLE imdb.movies
(
    id   UInt32,
    name String,
    year UInt32,
    rank Float32 DEFAULT 0
) ENGINE = MergeTree ORDER BY (id, name, year);

CREATE TABLE imdb.roles
(
    actor_id   UInt32,
    movie_id   UInt32,
    role       String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree ORDER BY (actor_id, movie_id);
```

:::note
테이블 `roles`의 `created_at` 컬럼은 기본값으로 `now()`로 설정됩니다. 우리는 나중에 이 값을 사용해 모델의 증분 업데이트를 식별합니다 - [증분 모델](#creating-an-incremental-materialization)을 참조하세요.
:::

우리는 `s3` 함수를 사용해 공용 엔드포인트에서 소스 데이터를 읽어 데이터를 삽입합니다. 다음 명령어를 실행하여 테이블을 채우세요:

```sql
INSERT INTO imdb.actors
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_actors.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.directors
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_directors.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.genres
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_movies_genres.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.movie_directors
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_movies_directors.tsv.gz',
        'TSVWithNames');

INSERT INTO imdb.movies
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_movies.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.roles(actor_id, movie_id, role)
SELECT actor_id, movie_id, role
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_roles.tsv.gz',
'TSVWithNames');
```

이 명령의 실행 시간은 대역폭에 따라 다를 수 있지만 각 명령은 몇 초 내에 완료되어야 합니다. 각 배우의 요약을 계산하고 데이터가 성공적으로 로드되었는지 확인하기 위해 다음 쿼리를 실행하세요:

```sql
SELECT id,
       any(actor_name)          AS name,
       uniqExact(movie_id)    AS num_movies,
       avg(rank)                AS avg_rank,
       uniqExact(genre)         AS unique_genres,
       uniqExact(director_name) AS uniq_directors,
       max(created_at)          AS updated_at
FROM (
         SELECT imdb.actors.id  AS id,
                concat(imdb.actors.first_name, ' ', imdb.actors.last_name)  AS actor_name,
                imdb.movies.id AS movie_id,
                imdb.movies.rank AS rank,
                genre,
                concat(imdb.directors.first_name, ' ', imdb.directors.last_name) AS director_name,
                created_at
         FROM imdb.actors
                  JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
                  LEFT OUTER JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
                  LEFT OUTER JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
                  LEFT OUTER JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
                  LEFT OUTER JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
         )
GROUP BY id
ORDER BY num_movies DESC
LIMIT 5;
```

응답은 다음과 같아야 합니다:

```response
+------+------------+----------+------------------+-------------+--------------+-------------------+
|id    |name        |num_movies|avg_rank          |unique_genres|uniq_directors|updated_at         |
+------+------------+----------+------------------+-------------+--------------+-------------------+
|45332 |Mel Blanc   |832       |6.175853582979779 |18           |84            |2022-04-26 14:01:45|
|621468|Bess Flowers|659       |5.57727638854796  |19           |293           |2022-04-26 14:01:46|
|372839|Lee Phelps  |527       |5.032976449684617 |18           |261           |2022-04-26 14:01:46|
|283127|Tom London  |525       |2.8721716524875673|17           |203           |2022-04-26 14:01:46|
|356804|Bud Osborne |515       |2.0389507108727773|15           |149           |2022-04-26 14:01:46|
+------+------------+----------+------------------+-------------+--------------+-------------------+
```

후속 가이드에서는 이 쿼리를 모델로 변환하여 dbt 뷰 및 테이블로 ClickHouse에 물리화할 것입니다.

## ClickHouse에 연결하기 {#connecting-to-clickhouse}

1. dbt 프로젝트를 생성합니다. 이 경우, `imdb` 소스의 이름을 따릅니다. 프롬프트가 나타나면 데이터베이스 소스로 `clickhouse`를 선택합니다.

```bash
clickhouse-user@clickhouse:~$ dbt init imdb

16:52:40  Running with dbt=1.1.0
Which database would you like to use?
[1] clickhouse

(Don't see the one you want? https://docs.getdbt.com/docs/available-adapters)

Enter a number: 1
16:53:21  No sample profile found for clickhouse.
16:53:21
Your new dbt project "imdb" was created!

For more information on how to configure the profiles.yml file,
please consult the dbt documentation here:

https://docs.getdbt.com/docs/configure-your-profile
```

2. 프로젝트 폴더로 `cd`합니다:

```bash
cd imdb
```

3. 이 시점에서, 원하는 텍스트 편집기가 필요합니다. 아래 예시에서는 널리 사용되는 VS Code를 사용합니다. IMDB 디렉토리를 열면 여러 개의 yml 및 sql 파일이 있는 것을 볼 수 있어야 합니다:

    <Image img={dbt_02} size="lg" alt="새 dbt 프로젝트" />

4. `dbt_project.yml` 파일을 업데이트하여 첫 번째 모델인 `actor_summary`를 지정하고 프로필을 `clickhouse_imdb`로 설정합니다.

    <Image img={dbt_03} size="lg" alt="dbt 프로필" />

    <Image img={dbt_04} size="lg" alt="dbt 프로필" />

5. 다음으로, dbt에 ClickHouse 인스턴스의 연결 세부 정보를 제공해야 합니다. `~/.dbt/profiles.yml`에 다음을 추가하세요.

```yml
clickhouse_imdb:
  target: dev
  outputs:
    dev:
      type: clickhouse
      schema: imdb_dbt
      host: localhost
      port: 8123
      user: default
      password: ''
      secure: False
```

    사용자와 비밀번호를 수정해야 함을 유의하세요. 추가 설정에 대한 내용은 [여기](https://github.com/silentsokolov/dbt-clickhouse#example-profile)에 문서화되어 있습니다.

6. IMDB 디렉토리에서 `dbt debug` 명령을 실행하여 dbt가 ClickHouse에 연결할 수 있는지 확인합니다.

```bash
clickhouse-user@clickhouse:~/imdb$ dbt debug
17:33:53  Running with dbt=1.1.0
dbt version: 1.1.0
python version: 3.10.1
python path: /home/dale/.pyenv/versions/3.10.1/bin/python3.10
os info: Linux-5.13.0-10039-tuxedo-x86_64-with-glibc2.31
Using profiles.yml file at /home/dale/.dbt/profiles.yml
Using dbt_project.yml file at /opt/dbt/imdb/dbt_project.yml

Configuration:
profiles.yml file [OK found and valid]
dbt_project.yml file [OK found and valid]

Required dependencies:
- git [OK found]

Connection:
host: localhost
port: 8123
user: default
schema: imdb_dbt
secure: False
verify: False
Connection test: [OK connection ok]

All checks passed!
```

    응답에 `Connection test: [OK connection ok]`가 포함되어 있는지 확인하여 성공적인 연결을 확인하세요.

## 간단한 뷰 물리화 생성 {#creating-a-simple-view-materialization}

뷰 물리화를 사용할 때, 모델은 ClickHouse에서 각 실행 시 `CREATE VIEW AS` 문으로 뷰로 다시 만들어집니다. 이는 데이터의 추가 저장소를 필요로 하지 않지만 테이블 물리화보다 쿼리가 느려집니다.

1. `imdb` 폴더에서 `models/example` 디렉터리를 삭제하세요:

```bash
clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
```

2. `models` 폴더 내의 `actors`에 새로운 파일을 만듭니다. 여기서는 각 배우 모델을 나타내는 파일을 생성합니다:

```bash
clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
```

3. `models/actors` 폴더에 `schema.yml` 및 `actor_summary.sql` 파일을 생성합니다.

```bash
clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
```
    `schema.yml` 파일은 우리의 테이블을 정의합니다. 이들은 이후 매크로에서 사용 가능해질 것입니다. `models/actors/schema.yml`을 편집하여 이 내용을 포함하도록 하세요:
```yml
version: 2

sources:
- name: imdb
  tables:
  - name: directors
  - name: actors
  - name: roles
  - name: movies
  - name: genres
  - name: movie_directors
```
    `actors_summary.sql`은 실제 모델을 정의합니다. 설정 함수에서 모델이 ClickHouse에서 뷰로 물리화되도록 요청하는 것을 주목하세요. 우리의 테이블은 `schema.yml` 파일에서 `source` 함수를 통해 참조됩니다. 예를 들어, `source('imdb', 'movies')`는 `imdb` 데이터베이스의 `movies` 테이블을 참조합니다. `models/actors/actors_summary.sql`을 편집하여 이 내용을 포함하도록 하세요:
```sql
{{ config(materialized='view') }}

with actor_summary as (
SELECT id,
    any(actor_name) as name,
    uniqExact(movie_id)    as num_movies,
    avg(rank)                as avg_rank,
    uniqExact(genre)         as genres,
    uniqExact(director_name) as directors,
    max(created_at) as updated_at
FROM (
        SELECT {{ source('imdb', 'actors') }}.id as id,
                concat({{ source('imdb', 'actors') }}.first_name, ' ', {{ source('imdb', 'actors') }}.last_name) as actor_name,
                {{ source('imdb', 'movies') }}.id as movie_id,
                {{ source('imdb', 'movies') }}.rank as rank,
                genre,
                concat({{ source('imdb', 'directors') }}.first_name, ' ', {{ source('imdb', 'directors') }}.last_name) as director_name,
                created_at
        FROM {{ source('imdb', 'actors') }}
                    JOIN {{ source('imdb', 'roles') }} ON {{ source('imdb', 'roles') }}.actor_id = {{ source('imdb', 'actors') }}.id
                    LEFT OUTER JOIN {{ source('imdb', 'movies') }} ON {{ source('imdb', 'movies') }}.id = {{ source('imdb', 'roles') }}.movie_id
                    LEFT OUTER JOIN {{ source('imdb', 'genres') }} ON {{ source('imdb', 'genres') }}.movie_id = {{ source('imdb', 'movies') }}.id
                    LEFT OUTER JOIN {{ source('imdb', 'movie_directors') }} ON {{ source('imdb', 'movie_directors') }}.movie_id = {{ source('imdb', 'movies') }}.id
                    LEFT OUTER JOIN {{ source('imdb', 'directors') }} ON {{ source('imdb', 'directors') }}.id = {{ source('imdb', 'movie_directors') }}.director_id
        )
GROUP BY id
)

select *
from actor_summary
```
    최종 배우 요약에서 `updated_at` 컬럼을 포함하는 방법을 주목하세요. 우리는 이것을 나중에 증분 물리화에 사용합니다.

4. `imdb` 디렉토리에서 `dbt run` 명령을 실행하세요.

```bash
clickhouse-user@clickhouse:~/imdb$ dbt run
15:05:35  Running with dbt=1.1.0
15:05:35  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
15:05:35
15:05:36  Concurrency: 1 threads (target='dev')
15:05:36
15:05:36  1 of 1 START view model imdb_dbt.actor_summary.................................. [RUN]
15:05:37  1 of 1 OK created view model imdb_dbt.actor_summary............................. [OK in 1.00s]
15:05:37
15:05:37  Finished running 1 view model in 1.97s.
15:05:37
15:05:37  Completed successfully
15:05:37
15:05:37  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
```

5. dbt는 요청에 따라 ClickHouse에서 모델을 뷰로 표현합니다. 이제 이 뷰를 직접 쿼리할 수 있습니다. 이 뷰는 `imdb_dbt` 데이터베이스에 생성될 것입니다 - 이는 `~/.dbt/profiles.yml` 파일의 `clickhouse_imdb` 프로필 아래의 스키마 매개변수에 의해 결정됩니다.

```sql
SHOW DATABASES;
```

```response
+------------------+
|name              |
+------------------+
|INFORMATION_SCHEMA|
|default           |
|imdb              |
|imdb_dbt          |  <---created by dbt!
|information_schema|
|system            |
+------------------+
```

    이 뷰를 쿼리하면 간단한 구문으로 이전 쿼리의 결과를 복제할 수 있습니다:

```sql
SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 5;
```

```response
+------+------------+----------+------------------+------+---------+-------------------+
|id    |name        |num_movies|avg_rank          |genres|directors|updated_at         |
+------+------------+----------+------------------+------+---------+-------------------+
|45332 |Mel Blanc   |832       |6.175853582979779 |18    |84       |2022-04-26 15:26:55|
|621468|Bess Flowers|659       |5.57727638854796  |19    |293      |2022-04-26 15:26:57|
|372839|Lee Phelps  |527       |5.032976449684617 |18    |261      |2022-04-26 15:26:56|
|283127|Tom London  |525       |2.8721716524875673|17    |203      |2022-04-26 15:26:56|
|356804|Bud Osborne |515       |2.0389507108727773|15    |149      |2022-04-26 15:26:56|
+------+------------+----------+------------------+------+---------+-------------------+
```

## 테이블 물리화 생성 {#creating-a-table-materialization}

이전 예제에서, 우리의 모델은 뷰로 물리화되었습니다. 이는 일부 쿼리에 충분한 성능을 제공할 수 있지만, 더 복잡한 SELECT 또는 자주 실행되는 쿼리는 테이블로 물리화하는 것이 더 나을 수 있습니다. 이 물리화는 BI 도구에 의해 쿼리될 모델에 유용하여 사용자가 더 빠른 경험을 할 수 있도록 보장합니다. 이는 쿼리 결과가 새로운 테이블로 저장되도록 하는데, 관련된 저장소 오버헤드가 발생합니다 - 사실상 `INSERT TO SELECT`가 실행됩니다. 이 테이블은 매번 재구축되므로, 즉, 증분적이지 않습니다. 큰 결과 집합은 긴 실행 시간을 초래할 수 있습니다 - [dbt 제한 사항](/integrations/dbt#limitations)을 참조하세요.

1. `actors_summary.sql` 파일을 수정하여 `materialized` 매개변수가 `table`로 설정되도록 하세요. `ORDER BY`가 정의되는 방법을 주의하고 `MergeTree` 테이블 엔진을 사용하는 것도 주목하세요:

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
```

2. `imdb` 디렉토리에서 `dbt run` 명령을 실행하세요. 이 실행은 실행하는 데 약간의 시간이 더 걸릴 수 있으며, 대부분의 머신에서 약 10초 정도 걸립니다.

```bash
clickhouse-user@clickhouse:~/imdb$ dbt run
15:13:27  Running with dbt=1.1.0
15:13:27  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
15:13:27
15:13:28  Concurrency: 1 threads (target='dev')
15:13:28
15:13:28  1 of 1 START table model imdb_dbt.actor_summary................................. [RUN]
15:13:37  1 of 1 OK created table model imdb_dbt.actor_summary............................ [OK in 9.22s]
15:13:37
15:13:37  Finished running 1 table model in 10.20s.
15:13:37
15:13:37  Completed successfully
15:13:37
15:13:37  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
```

3. `imdb_dbt.actor_summary` 테이블의 생성 여부를 확인하세요:

```sql
SHOW CREATE TABLE imdb_dbt.actor_summary;
```

    적절한 데이터 타입으로 테이블이 생성되었는지 확인하세요:
```response
+----------------------------------------
|statement
+----------------------------------------
|CREATE TABLE imdb_dbt.actor_summary
|(
|`id` UInt32,
|`first_name` String,
|`last_name` String,
|`num_movies` UInt64,
|`updated_at` DateTime
|)
|ENGINE = MergeTree
|ORDER BY (id, first_name, last_name)
+----------------------------------------
```

4. 이 테이블의 결과가 이전 응답과 일치하는지 확인하세요. 모델이 테이블이 되었으므로 응답 시간이 개선된 것을 주목하세요:

```sql
SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 5;
```

```response
+------+------------+----------+------------------+------+---------+-------------------+
|id    |name        |num_movies|avg_rank          |genres|directors|updated_at         |
+------+------------+----------+------------------+------+---------+-------------------+
|45332 |Mel Blanc   |832       |6.175853582979779 |18    |84       |2022-04-26 15:26:55|
|621468|Bess Flowers|659       |5.57727638854796  |19    |293      |2022-04-26 15:26:57|
|372839|Lee Phelps  |527       |5.032976449684617 |18    |261      |2022-04-26 15:26:56|
|283127|Tom London  |525       |2.8721716524875673|17    |203      |2022-04-26 15:26:56|
|356804|Bud Osborne |515       |2.0389507108727773|15    |149      |2022-04-26 15:26:56|
+------+------------+----------+------------------+------+---------+-------------------+
```

    이 모델에 대해 다른 쿼리를 자유롭게 실행해 보세요. 예를 들어, 가장 높은 순위를 가진 영화에서 5회 이상의 출연이 있었던 배우는 누구인가요?

```sql
SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
```

## 증분 물리화 생성 {#creating-an-incremental-materialization}

이전 예제는 모델을 물리화하기 위해 테이블을 생성했습니다. 이 테이블은 각 dbt 실행 시 재구축됩니다. 이는 더 큰 결과 집합이나 복잡한 변환에 대해 비용이 많이 들거나 실현 불가능할 수 있습니다. 이 문제를 해결하고 빌드 시간을 줄이기 위해, dbt는 증분 물리화를 제공합니다. 이를 통해 dbt는 마지막 실행 이후 테이블에 레코드를 삽입하거나 업데이트할 수 있습니다, 이벤트 스타일 데이터에 적합하게 됩니다. 내부적으로는 모든 업데이트된 레코드로 임시 테이블이 생성되며, 이후 모든 변경되지 않은 레코드와 업데이트된 레코드가 새로운 대상 테이블로 삽입됩니다. 이는 테이블 모델에 대한 큰 결과 집합에 유사한 [제한 사항](/integrations/dbt#limitations)을 초래합니다.

이러한 제한 사항을 극복하기 위해 어댑터는 'inserts_only' 모드를 지원하며, 이 모드에서는 임시 테이블을 생성하지 않고 모든 업데이트를 대상 테이블에 삽입합니다(아래에서 더 자세히 설명합니다).

이 예시를 보여주기 위해, 우리는 "Clicky McClickHouse"라는 배우를 추가할 것입니다. 그는 놀라운 910편의 영화에 출연할 것입니다 - 덕분에 그는 [Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc)보다 더 많은 영화에 출연하게 됩니다.

1. 먼저, 우리의 모델을 증분 유형으로 수정합니다. 이 추가 사항은 다음을 요구합니다:

    1. **unique_key** - 어댑터가 행을 고유하게 식별할 수 있도록, 우리는 unique_key를 제공해야 합니다 - 이 경우에는 쿼리에서의 `id` 필드가 충분합니다. 이는 물리화된 테이블에서 행 중복을 방지하는 데 기여합니다. 고유성 제약 조건에 대한 더 자세한 내용은 [여기](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional)를 참조하세요.
    2. **증분 필터** - 또한 dbt에 증분 실행 시 어떤 행이 변경되었는지 식별하는 방법을 알려줘야 합니다. 이는 델타 표현식을 제공함으로써 이루어집니다. 이는 일반적으로 이벤트 데이터의 타임스탬프를 포함하므로, 업데이트된 타임스탬프 필드를 제공합니다. 이 컬럼은 행이 삽입될 때 기본값으로 now() 값을 갖게 되어 새로운 역할을 식별할 수 있습니다. 추가로 우리는 새로운 배우가 추가된 대체 경우를 식별해야 합니다. `{{this}}` 변수를 사용하여 기존의 물리화된 테이블을 나타내며, 이는 표현식 `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`를 제공합니다. 이를 `{% if is_incremental() %}` 조건 안에 포함시켜서 기본 테이블이 처음 구축될 때가 아닌 증분 실행 시에만 사용되도록 합니다. 증분 모델을 위한 행을 필터링하는 방법에 대한 더 자세한 내용은 [dbt 문서의 이토론](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)을 참조하세요.

    `actor_summary.sql` 파일을 다음과 같이 업데이트하세요:

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id') }}
with actor_summary as (
    SELECT id,
        any(actor_name) as name,
        uniqExact(movie_id)    as num_movies,
        avg(rank)                as avg_rank,
        uniqExact(genre)         as genres,
        uniqExact(director_name) as directors,
        max(created_at) as updated_at
    FROM (
        SELECT {{ source('imdb', 'actors') }}.id as id,
            concat({{ source('imdb', 'actors') }}.first_name, ' ', {{ source('imdb', 'actors') }}.last_name) as actor_name,
            {{ source('imdb', 'movies') }}.id as movie_id,
            {{ source('imdb', 'movies') }}.rank as rank,
            genre,
            concat({{ source('imdb', 'directors') }}.first_name, ' ', {{ source('imdb', 'directors') }}.last_name) as director_name,
            created_at
    FROM {{ source('imdb', 'actors') }}
        JOIN {{ source('imdb', 'roles') }} ON {{ source('imdb', 'roles') }}.actor_id = {{ source('imdb', 'actors') }}.id
        LEFT OUTER JOIN {{ source('imdb', 'movies') }} ON {{ source('imdb', 'movies') }}.id = {{ source('imdb', 'roles') }}.movie_id
        LEFT OUTER JOIN {{ source('imdb', 'genres') }} ON {{ source('imdb', 'genres') }}.movie_id = {{ source('imdb', 'movies') }}.id
        LEFT OUTER JOIN {{ source('imdb', 'movie_directors') }} ON {{ source('imdb', 'movie_directors') }}.movie_id = {{ source('imdb', 'movies') }}.id
        LEFT OUTER JOIN {{ source('imdb', 'directors') }} ON {{ source('imdb', 'directors') }}.id = {{ source('imdb', 'movie_directors') }}.director_id
    )
    GROUP BY id
)
select *
from actor_summary

{% if is_incremental() %}

-- this filter will only be applied on an incremental run
where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

{% endif %}
```

    우리의 모델은 이제 `roles` 및 `actors` 테이블에 대한 업데이트 및 추가에만 응답합니다. 모든 테이블에 응답하려면, 사용자는 이 모델을 여러 하위 모델로 분할하는 것을 권장합니다 - 각각의 자체 증분 기준이 있습니다. 이러한 모델은 다시 참조되고 연결될 수 있습니다. 교차 참조 모델에 대한 추가 세부정보는 [여기](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)를 참조하세요.

2. `dbt run`을 실행하고 결과 테이블의 결과를 확인하세요:

```response
clickhouse-user@clickhouse:~/imdb$  dbt run
15:33:34  Running with dbt=1.1.0
15:33:34  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
15:33:34
15:33:35  Concurrency: 1 threads (target='dev')
15:33:35
15:33:35  1 of 1 START incremental model imdb_dbt.actor_summary........................... [RUN]
15:33:41  1 of 1 OK created incremental model imdb_dbt.actor_summary...................... [OK in 6.33s]
15:33:41
15:33:41  Finished running 1 incremental model in 7.30s.
15:33:41
15:33:41  Completed successfully
15:33:41
15:33:41  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
```

```sql
SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 5;
```

```response
+------+------------+----------+------------------+------+---------+-------------------+
|id    |name        |num_movies|avg_rank          |genres|directors|updated_at         |
+------+------------+----------+------------------+------+---------+-------------------+
|45332 |Mel Blanc   |832       |6.175853582979779 |18    |84       |2022-04-26 15:26:55|
|621468|Bess Flowers|659       |5.57727638854796  |19    |293      |2022-04-26 15:26:57|
|372839|Lee Phelps  |527       |5.032976449684617 |18    |261      |2022-04-26 15:26:56|
|283127|Tom London  |525       |2.8721716524875673|17    |203      |2022-04-26 15:26:56|
|356804|Bud Osborne |515       |2.0389507108727773|15    |149      |2022-04-26 15:26:56|
+------+------------+----------+------------------+------+---------+-------------------+
```

3. 모델에 데이터를 추가하여 증분 업데이트를 시연합니다. "Clicky McClickHouse"를 `actors` 테이블에 추가하세요:

```sql
INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
```

4. "Clicky"가 910편의 랜덤 영화에 출연하도록 합시다:

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 910 OFFSET 10000;
```

5. 그가 정말로 가장 많이 출연한 배우인지 확인하기 위해 기본 소스 테이블을 쿼리하고 모든 dbt 모델을 우회하세요:

```sql
SELECT id,
    any(actor_name)          as name,
    uniqExact(movie_id)    as num_movies,
    avg(rank)                as avg_rank,
    uniqExact(genre)         as unique_genres,
    uniqExact(director_name) as uniq_directors,
    max(created_at)          as updated_at
FROM (
        SELECT imdb.actors.id                                                   as id,
                concat(imdb.actors.first_name, ' ', imdb.actors.last_name)       as actor_name,
                imdb.movies.id as movie_id,
                imdb.movies.rank                                                 as rank,
                genre,
                concat(imdb.directors.first_name, ' ', imdb.directors.last_name) as director_name,
                created_at
        FROM imdb.actors
                JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
                LEFT OUTER JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
                LEFT OUTER JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
                LEFT OUTER JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
                LEFT OUTER JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
        )
GROUP BY id
ORDER BY num_movies DESC
LIMIT 2;
```

```response
+------+-------------------+----------+------------------+------+---------+-------------------+
|id    |name               |num_movies|avg_rank          |genres|directors|updated_at         |
+------+-------------------+----------+------------------+------+---------+-------------------+
|845466|Clicky McClickHouse|910       |1.4687938697032283|21    |662      |2022-04-26 16:20:36|
|45332 |Mel Blanc          |909       |5.7884792542982515|19    |148      |2022-04-26 16:17:42|
+------+-------------------+----------+------------------+------+---------+-------------------+
```

6. `dbt run`을 실행하고 모델이 업데이트되었으며 위 결과와 일치하는지 확인하세요:

```response
clickhouse-user@clickhouse:~/imdb$  dbt run
16:12:16  Running with dbt=1.1.0
16:12:16  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
16:12:16
16:12:17  Concurrency: 1 threads (target='dev')
16:12:17
16:12:17  1 of 1 START incremental model imdb_dbt.actor_summary........................... [RUN]
16:12:24  1 of 1 OK created incremental model imdb_dbt.actor_summary...................... [OK in 6.82s]
16:12:24
16:12:24  Finished running 1 incremental model in 7.79s.
16:12:24
16:12:24  Completed successfully
16:12:24
16:12:24  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
```

```sql
SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 2;
```

```response
+------+-------------------+----------+------------------+------+---------+-------------------+
|id    |name               |num_movies|avg_rank          |genres|directors|updated_at         |
+------+-------------------+----------+------------------+------+---------+-------------------+
|845466|Clicky McClickHouse|910       |1.4687938697032283|21    |662      |2022-04-26 16:20:36|
|45332 |Mel Blanc          |909       |5.7884792542982515|19    |148      |2022-04-26 16:17:42|
+------+-------------------+----------+------------------+------+---------+-------------------+
```

### 내부적 처리 {#internals}

위의 증분 업데이트를 달성하기 위해 실행된 명령어를 ClickHouse의 쿼리 로그를 통해 식별할 수 있습니다.

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

위 쿼리를 실행 기간에 맞게 조정하세요. 결과 검사는 사용자에게 맡기지만, 증분 업데이트를 수행하기 위해 어댑터가 사용하는 일반적인 전략을 강조합니다:

1. 어댑터는 임시 테이블 `actor_sumary__dbt_tmp`를 생성합니다. 변경된 행이 이 테이블로 스트리밍됩니다.
2. 새로운 테이블 `actor_summary_new`이 생성됩니다. 이전 테이블의 행은 구 버전에서 신 버전으로 스트리밍되며, 임시 테이블에 행 ID가 존재하지 않도록 확인됩니다. 이는 업데이트 및 중복 처리를 효과적으로 처리합니다.
3. 임시 테이블의 결과가 새로운 `actor_summary` 테이블로 스트리밍됩니다:
4. 마지막으로, 새로운 테이블이 `EXCHANGE TABLES` 문을 통해 이전 버전과 원자적으로 교환됩니다. 이전 테이블과 임시 테이블은 차례로 삭제됩니다.

이 과정은 아래와 같이 시각화됩니다:

<Image img={dbt_05} size="lg" alt="증분 업데이트 dbt" />

이 전략은 매우 큰 모델에서 문제에 직면할 수 있습니다. 더 자세한 내용은 [제한 사항](/integrations/dbt#limitations)을 참조하세요.

### 추가 전략 (inserts-only 모드) {#append-strategy-inserts-only-mode}

증분 모델에서 큰 데이터 세트의 제한 사항을 극복하기 위해, 어댑터는 dbt 구성 매개변수 `incremental_strategy`를 사용합니다. 이 값은 `append`로 설정할 수 있습니다. 이 설정을 하면 업데이트된 행이 목표 테이블(즉, `imdb_dbt.actor_summary`)에 직접 삽입되며 임시 테이블이 생성되지 않습니다.  
참고: 추가 전용 모드는 귀하의 데이터가 변경 불가능하거나 중복이 허용되는 경우에 필요합니다. 변경된 행을 지원하는 증분 테이블 모델을 원하신다면 이 모드를 사용하지 마세요!

이 모드를 설명하기 위해, 우리는 또 다른 새로운 배우를 추가하고 `incremental_strategy='append'`로 dbt run을 다시 실행하겠습니다.

1. `actor_summary.sql`에서 추가 전용 모드를 구성하세요:

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
```

2. 또 다른 유명한 배우인 Danny DeVito를 추가합시다:

```sql
INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
```

3. Danny를 920편의 랜덤 영화에 출연하게 합시다.

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 920 OFFSET 10000;
```

4. `dbt run`을 실행하고 Danny가 actor-summary 테이블에 추가되었는지 확인하세요:

```response
clickhouse-user@clickhouse:~/imdb$ dbt run
16:12:16  Running with dbt=1.1.0
16:12:16  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 186 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
16:12:16
16:12:17  Concurrency: 1 threads (target='dev')
16:12:17
16:12:17  1 of 1 START incremental model imdb_dbt.actor_summary........................... [RUN]
16:12:24  1 of 1 OK created incremental model imdb_dbt.actor_summary...................... [OK in 0.17s]
16:12:24
16:12:24  Finished running 1 incremental model in 0.19s.
16:12:24
16:12:24  Completed successfully
16:12:24
16:12:24  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
```

```sql
SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 3;
```

```response
+------+-------------------+----------+------------------+------+---------+-------------------+
|id    |name               |num_movies|avg_rank          |genres|directors|updated_at         |
+------+-------------------+----------+------------------+------+---------+-------------------+
|845467|Danny DeBito       |920       |1.4768987303293204|21    |670      |2022-04-26 16:22:06|
|845466|Clicky McClickHouse|910       |1.4687938697032283|21    |662      |2022-04-26 16:20:36|
|45332 |Mel Blanc          |909       |5.7884792542982515|19    |148      |2022-04-26 16:17:42|
+------+-------------------+----------+------------------+------+---------+-------------------+
```

이전의 "Clicky" 삽입과 비교했을 때, 이 증분이 얼마나 더 빠른지 확인하세요.

쿼리 로그 테이블을 다시 확인하면 두 증분 실행 간의 차이를 알 수 있습니다:

```sql
INSERT INTO imdb_dbt.actor_summary ("id", "name", "num_movies", "avg_rank", "genres", "directors", "updated_at")
WITH actor_summary AS (
   SELECT id,
      any(actor_name) AS name,
      uniqExact(movie_id)    AS num_movies,
      avg(rank)                AS avg_rank,
      uniqExact(genre)         AS genres,
      uniqExact(director_name) AS directors,
      max(created_at) AS updated_at
   FROM (
      SELECT imdb.actors.id AS id,
         concat(imdb.actors.first_name, ' ', imdb.actors.last_name) AS actor_name,
         imdb.movies.id AS movie_id,
         imdb.movies.rank AS rank,
         genre,
         concat(imdb.directors.first_name, ' ', imdb.directors.last_name) AS director_name,
         created_at
      FROM imdb.actors
         JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
         LEFT OUTER JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
         LEFT OUTER JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
         LEFT OUTER JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
         LEFT OUTER JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
   )
   GROUP BY id
)

SELECT *
FROM actor_summary
-- this filter will only be applied on an incremental run
WHERE id > (SELECT max(id) FROM imdb_dbt.actor_summary) OR updated_at > (SELECT max(updated_at) FROM imdb_dbt.actor_summary)
```

이 실행에서는, 새 행만이 `imdb_dbt.actor_summary` 테이블에 직접 추가되며 테이블 생성은 포함되지 않습니다.

### 삭제 및 삽입 모드 (실험적) {#deleteinsert-mode-experimental}

역사적으로 ClickHouse는 비동기 [변경](https://sql-reference/statements/alter/index.md)의 형태로 업데이트 및 삭제에 대한 제한적인 지원만 제공했습니다. 이러한 변경은 매우 IO 집약적일 수 있으며 일반적으로 피해야 합니다.

ClickHouse 22.8에서는 [경량 삭제](https://sql-reference/statements/delete.md)가 도입되었고 ClickHouse 25.7에서는 [경량 업데이트](https://sql-reference/statements/update)가 도입되었습니다. 이러한 기능의 도입으로 인해, 단일 업데이트 쿼리에서의 수정 사항은 비동기적으로 물리화되더라도 사용자의 관점에서 즉각적으로 발생합니다.

이 모드는 `incremental_strategy` 매개변수를 사용하여 모델에 대해 구성할 수 있습니다:

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

이 전략은 목표 모델의 테이블에서 직접 작동하므로, 운영 중 문제가 발생할 경우 증분 모델의 데이터가 유효하지 않은 상태가 될 가능성이 높습니다 - 원자적인 업데이트가 없습니다.

요약하자면, 이 접근 방식은 다음과 같습니다:

1. 어댑터는 임시 테이블 `actor_sumary__dbt_tmp`를 생성합니다. 변경된 행이 이 테이블로 스트리밍됩니다.
2. 현재 `actor_summary` 테이블에 대해 `DELETE`가 수행됩니다. 행은 `actor_sumary__dbt_tmp`에서 ID로 삭제됩니다.
3. `actor_sumary__dbt_tmp`에서의 행이 `actor_summary`로 `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp`를 사용하여 삽입됩니다.

이 과정은 아래와 같이 시각화됩니다:

<Image img={dbt_06} size="lg" alt="경량 삭제 증분" />

### insert_overwrite 모드 (실험적) {#insert_overwrite-mode-experimental}
다음 단계를 수행합니다:

1. 증분 모델 관계와 동일한 구조의 스테이징(임시) 테이블 생성: `CREATE TABLE {staging} AS {target}`.
2. 새 레코드만 스테이징 테이블에 삽입(SELECT 생성).
3. 스테이징 테이블에 있는 새로운 파티션만 목표 테이블에 교체.

<br />

이 접근 방식은 다음과 같은 장점을 가지고 있습니다:

* 전체 테이블을 복사하지 않으므로 기본 전략보다 더 빠릅니다.
* 원래 테이블을 INSERT 작업이 성공적으로 완료될 때까지 수정하지 않으므로 다른 전략보다 안전합니다: 중간 실패가 발생하는 경우 원래 테이블은 수정되지 않습니다.
* "파티션 불변성" 데이터 엔지니어링 모범 사례를 구현합니다. 이는 증분 및 병렬 데이터 처리, 롤백 등을 단순화합니다.

<Image img={dbt_07} size="lg" alt="insert overwrite incremental" />

## 스냅샷 생성 {#creating-a-snapshot}

dbt 스냅샷을 사용하면 변경 사항을 기록하여 변동 가능한 모델 상태를 시간에 따라 추적할 수 있습니다. 이는 분석가가 모델의 이전 상태를 "시간을 되돌아보며" 쿼리할 수 있도록 합니다. 이는 [타입 2 서서히 변화하는 차원](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row)을 사용하여 행이 유효할 때의 날짜를 기록하는 from 및 to 날짜 열로 이루어집니다. 이 기능은 ClickHouse 어댑터에서 지원되며 아래에 예시가 있습니다.

이 예시는 [증분 테이블 모델 생성](#creating-an-incremental-materialization)을 완료했다고 가정합니다. actor_summary.sql 파일에서 inserts_only=True를 설정하지 않도록 하세요. models/actor_summary.sql은 다음과 같아야 합니다:

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id') }}

with actor_summary as (
    SELECT id,
        any(actor_name) as name,
        uniqExact(movie_id)    as num_movies,
        avg(rank)                as avg_rank,
        uniqExact(genre)         as genres,
        uniqExact(director_name) as directors,
        max(created_at) as updated_at
    FROM (
        SELECT {{ source('imdb', 'actors') }}.id as id,
            concat({{ source('imdb', 'actors') }}.first_name, ' ', {{ source('imdb', 'actors') }}.last_name) as actor_name,
            {{ source('imdb', 'movies') }}.id as movie_id,
            {{ source('imdb', 'movies') }}.rank as rank,
            genre,
            concat({{ source('imdb', 'directors') }}.first_name, ' ', {{ source('imdb', 'directors') }}.last_name) as director_name,
            created_at
    FROM {{ source('imdb', 'actors') }}
        JOIN {{ source('imdb', 'roles') }} ON {{ source('imdb', 'roles') }}.actor_id = {{ source('imdb', 'actors') }}.id
        LEFT OUTER JOIN {{ source('imdb', 'movies') }} ON {{ source('imdb', 'movies') }}.id = {{ source('imdb', 'roles') }}.movie_id
        LEFT OUTER JOIN {{ source('imdb', 'genres') }} ON {{ source('imdb', 'genres') }}.movie_id = {{ source('imdb', 'movies') }}.id
        LEFT OUTER JOIN {{ source('imdb', 'movie_directors') }} ON {{ source('imdb', 'movie_directors') }}.movie_id = {{ source('imdb', 'movies') }}.id
        LEFT OUTER JOIN {{ source('imdb', 'directors') }} ON {{ source('imdb', 'directors') }}.id = {{ source('imdb', 'movie_directors') }}.director_id
    )
    GROUP BY id
)
select *
from actor_summary

{% if is_incremental() %}

-- this filter will only be applied on an incremental run
where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

{% endif %}
```

1. 스냅샷 디렉토리에 `actor_summary` 파일을 생성합니다.

```bash
touch snapshots/actor_summary.sql
```

2. actor_summary.sql 파일의 내용을 다음과 같이 업데이트합니다:
```sql
{% snapshot actor_summary_snapshot %}

{{
config(
target_schema='snapshots',
unique_key='id',
strategy='timestamp',
updated_at='updated_at',
)
}}

select * from {{ref('actor_summary')}}

{% endsnapshot %}
```

이 내용에 대한 몇 가지 관찰 사항:
* 선택 쿼리는 시간이 지남에 따라 스냅샷할 결과를 정의합니다. ref 함수는 이전에 생성한 actor_summary 모델을 참조하는 데 사용됩니다.
* 기록 변경을 나타내기 위해 타임스탬프 열이 필요합니다. 우리의 updated_at 열( [증분 테이블 모델 생성](#creating-an-incremental-materialization) 참조) 를 여기서 사용할 수 있습니다. 매개변수 strategy는 업데이트를 나타내기 위해 타임스탬프를 사용하는 것을 설명하며, updated_at 매개변수는 사용할 열을 지정합니다. 만약 모델에 이 컬럼이 없다면 [check 전략](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)을 사용할 수 있습니다. 이는 비효율적이며 사용자가 비교할 열 목록을 지정해야 합니다. dbt는 이러한 열의 현재 및 과거 값을 비교하여 변경 사항을 기록합니다(동일한 경우 아무 것도 하지 않음).

3. `dbt snapshot` 명령을 실행하세요.

```response
clickhouse-user@clickhouse:~/imdb$ dbt snapshot
13:26:23  Running with dbt=1.1.0
13:26:23  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 3 sources, 0 exposures, 0 metrics
13:26:23
13:26:25  Concurrency: 1 threads (target='dev')
13:26:25
13:26:25  1 of 1 START snapshot snapshots.actor_summary_snapshot...................... [RUN]
13:26:25  1 of 1 OK snapshotted snapshots.actor_summary_snapshot...................... [OK in 0.79s]
13:26:25
13:26:25  Finished running 1 snapshot in 2.11s.
13:26:25
13:26:25  Completed successfully
13:26:25
13:26:25  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
```

actor_summary_snapshot 테이블이 생성되었음을 확인하세요. (target_schema 매개변수에 의해 결정됨)

4. 이 데이터의 샘플링을 통해 dbt가 dbt_valid_from 및 dbt_valid_to 열을 포함했음을 알 수 있습니다. 후속 실행은 이를 업데이트합니다.

```sql
SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
```

```response
+------+----------+------------+----------+-------------------+------------+
|id    |first_name|last_name   |num_movies|dbt_valid_from     |dbt_valid_to|
+------+----------+------------+----------+-------------------+------------+
|845467|Danny     |DeBito      |920       |2022-05-25 19:33:32|NULL        |
|845466|Clicky    |McClickHouse|910       |2022-05-25 19:32:34|NULL        |
|45332 |Mel       |Blanc       |909       |2022-05-25 19:31:47|NULL        |
|621468|Bess      |Flowers     |672       |2022-05-25 19:31:47|NULL        |
|283127|Tom       |London      |549       |2022-05-25 19:31:47|NULL        |
+------+----------+------------+----------+-------------------+------------+
```

5. 우리의 좋아하는 배우 Clicky McClickHouse가 10편의 영화에 더 출연하게 해봅시다.

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
FROM system.numbers
LIMIT 10;
```

6. `imdb` 디렉토리에서 dbt run 명령을 재실행하세요. 이로써 증분 모델이 업데이트됩니다. 완료되면 dbt snapshot을 실행하여 변경 사항을 캡처하세요.

```response
clickhouse-user@clickhouse:~/imdb$ dbt run
13:46:14  Running with dbt=1.1.0
13:46:14  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 3 sources, 0 exposures, 0 metrics
13:46:14
13:46:15  Concurrency: 1 threads (target='dev')
13:46:15
13:46:15  1 of 1 START incremental model imdb_dbt.actor_summary....................... [RUN]
13:46:18  1 of 1 OK created incremental model imdb_dbt.actor_summary.................. [OK in 2.76s]
13:46:18
13:46:18  Finished running 1 incremental model in 3.73s.
13:46:18
13:46:18  Completed successfully
13:46:18
13:46:18  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1

clickhouse-user@clickhouse:~/imdb$ dbt snapshot
13:46:26  Running with dbt=1.1.0
13:46:26  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 3 sources, 0 exposures, 0 metrics
13:46:26
13:46:27  Concurrency: 1 threads (target='dev')
13:46:27
13:46:27  1 of 1 START snapshot snapshots.actor_summary_snapshot...................... [RUN]
13:46:31  1 of 1 OK snapshotted snapshots.actor_summary_snapshot...................... [OK in 4.05s]
13:46:31
13:46:31  Finished running 1 snapshot in 5.02s.
13:46:31
13:46:31  Completed successfully
13:46:31
13:46:31  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
```

7. 이제 스냅샷을 쿼리하면 Clicky McClickHouse에 대한 2개의 행이 있음을 확인하실 수 있습니다. 이전 항목은 이제 dbt_valid_to 값이 있으며, 새로운 값은 dbt_valid_from 열에서 동일한 값으로 기록되고 dbt_valid_to 값은 null입니다. 새로운 행이 있다면 이들도 스냅샷에 추가될 것입니다.

```sql
SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
```

```response
+------+----------+------------+----------+-------------------+-------------------+
|id    |first_name|last_name   |num_movies|dbt_valid_from     |dbt_valid_to       |
+------+----------+------------+----------+-------------------+-------------------+
|845467|Danny     |DeBito      |920       |2022-05-25 19:33:32|NULL               |
|845466|Clicky    |McClickHouse|920       |2022-05-25 19:34:37|NULL               |
|845466|Clicky    |McClickHouse|910       |2022-05-25 19:32:34|2022-05-25 19:34:37|
|45332 |Mel       |Blanc       |909       |2022-05-25 19:31:47|NULL               |
|621468|Bess      |Flowers     |672       |2022-05-25 19:31:47|NULL               |
+------+----------+------------+----------+-------------------+-------------------+
```

dbt 스냅샷에 대한 추가 세부정보는 [여기](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots)를 참조하세요.

## 시드 사용하기 {#using-seeds}

dbt는 CSV 파일에서 데이터를 로드하는 기능을 제공합니다. 이 기능은 대규모 데이터베이스 내보내기를 로드하는 데 적합하지 않으며 일반적으로 코드 테이블 및 [딕셔너리](../../../../sql-reference/dictionaries/index.md)와 같은 작은 파일에 적합합니다. 예를 들어, 국가 코드와 국가 이름을 매핑하는 데 사용될 수 있습니다. 간단한 예제를 통해, 시드 기능을 사용하여 장르 코드 목록을 생성한 후 업로드합니다.

1. 기존 데이터 세트에서 장르 코드 목록을 생성합니다. dbt 디렉토리에서 `clickhouse-client`를 사용하여 `seeds/genre_codes.csv` 파일을 만듭니다:

```bash
clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
"SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
```

2. `dbt seed` 명령을 실행합니다. 이는 CSV 파일의 행으로 데이터베이스 `imdb_dbt`에 새로운 테이블 `genre_codes`를 생성합니다 (스키마 구성에 따라).

```bash
clickhouse-user@clickhouse:~/imdb$ dbt seed
17:03:23  Running with dbt=1.1.0
17:03:23  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 1 seed file, 6 sources, 0 exposures, 0 metrics
17:03:23
17:03:24  Concurrency: 1 threads (target='dev')
17:03:24
17:03:24  1 of 1 START seed file imdb_dbt.genre_codes..................................... [RUN]
17:03:24  1 of 1 OK loaded seed file imdb_dbt.genre_codes................................. [INSERT 21 in 0.65s]
17:03:24
17:03:24  Finished running 1 seed in 1.62s.
17:03:24
17:03:24  Completed successfully
17:03:24
17:03:24  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
```
3. 이들이 로드되었는지 확인하세요:

```sql
SELECT * FROM imdb_dbt.genre_codes LIMIT 10;
```

```response
+-------+----+
|genre  |code|
+-------+----+
|Drama  |DRA |
|Romance|ROM |
|Short  |SHO |
|Mystery|MYS |
|Adult  |ADU |
|Family |FAM |

|Action |ACT |
|Sci-Fi |SCI |
|Horror |HOR |
|War    |WAR |
+-------+----+=
```

## 추가 정보 {#further-information}

이전 가이드는 dbt 기능의 표면만 다룹니다. 사용자는 훌륭한 [dbt 문서](https://docs.getdbt.com/docs/introduction)를 읽는 것이 좋습니다.
