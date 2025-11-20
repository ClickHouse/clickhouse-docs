---
'description': 'ClickHouse와 다양한 타사 시스템 및 도구를 통합하는 데 대한 Documentation'
'sidebar_label': '통합'
'sidebar_position': 27
'slug': '/interfaces/third-party/integrations'
'title': '타사 개발자의 통합 라이브러리'
'doc_type': 'reference'
---


# 제3자 개발자의 통합 라이브러리

:::warning 면책 조항
ClickHouse, Inc.는 아래에 나열된 도구와 라이브러리를 **유지하지** 않으며 이들의 품질을 보장하기 위한 광범위한 테스트를 수행하지 않았습니다.
공식 통합에 대해서는 [통합 페이지](/integrations)를 참조하세요.
:::

## 인프라 제품 {#infrastructure-products}

<details>
<summary>관계형 데이터베이스 관리 시스템</summary>
  
- [MySQL](https://www.mysql.com)
  - [mysql2ch](https://github.com/long2ice/mysql2ch)
  - [ProxySQL](https://github.com/sysown/proxysql/wiki/ClickHouse-Support)
  - [clickhouse-mysql-data-reader](https://github.com/Altinity/clickhouse-mysql-data-reader)
  - [horgh-replicator](https://github.com/larsnovikov/horgh-replicator)
- [PostgreSQL](https://www.postgresql.org)
  - [clickhousedb_fdw](https://github.com/Percona-Lab/clickhousedb_fdw)
  - [infi.clickhouse_fdw](https://github.com/Infinidat/infi.clickhouse_fdw) (uses [infi.clickhouse_orm](https://github.com/Infinidat/infi.clickhouse_orm))
  - [pg2ch](https://github.com/mkabilov/pg2ch)
  - [clickhouse_fdw](https://github.com/adjust/clickhouse_fdw)
- [MSSQL](https://en.wikipedia.org/wiki/Microsoft_SQL_Server)
  - [ClickHouseMigrator](https://github.com/zlzforever/ClickHouseMigrator)
</details>

<details>
<summary>메시지 큐</summary>
  
- [Kafka](https://kafka.apache.org)
  - [clickhouse_sinker](https://github.com/housepower/clickhouse_sinker) (uses [Go client](https://github.com/ClickHouse/clickhouse-go/))
  - [stream-loader-clickhouse](https://github.com/adform/stream-loader)
</details>

<details>
<summary>배치 처리</summary>

- [Spark](https://spark.apache.org)
  - [spark-clickhouse-connector](https://github.com/housepower/spark-clickhouse-connector)
</details>

<details>
<summary>스트림 처리</summary>
  
- [Flink](https://flink.apache.org)
  - [flink-clickhouse-sink](https://github.com/ivi-ru/flink-clickhouse-sink)
</details>

<details>
<summary>객체 저장소</summary>
  
- [S3](https://en.wikipedia.org/wiki/Amazon_S3)
  - [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)
</details>

<details>
<summary>컨테이너 오케스트레이션</summary>
  
- [Kubernetes](https://kubernetes.io)
  - [clickhouse-operator](https://github.com/Altinity/clickhouse-operator)
</details>

<details>
<summary>구성 관리</summary>
- [puppet](https://puppet.com)
  - [innogames/clickhouse](https://forge.puppet.com/innogames/clickhouse)
  - [mfedotov/clickhouse](https://forge.puppet.com/mfedotov/clickhouse)
</details>

<details>
<summary>모니터링</summary>

- [Graphite](https://graphiteapp.org)
  - [graphouse](https://github.com/ClickHouse/graphouse)
  - [carbon-clickhouse](https://github.com/lomik/carbon-clickhouse)
  - [graphite-clickhouse](https://github.com/lomik/graphite-clickhouse)
  - [graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer) - [\*GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)에서 [rollup configuration](../../engines/table-engines/mergetree-family/graphitemergetree.md#rollup-configuration)에서 규칙이 적용될 수 있는 경우 오래된 파티션을 최적화합니다.
- [Grafana](https://grafana.com/)
  - [clickhouse-grafana](https://github.com/Altinity/clickhouse-grafana)
- [Prometheus](https://prometheus.io/)
  - [clickhouse_exporter](https://github.com/f1yegor/clickhouse_exporter)
  - [PromHouse](https://github.com/Percona-Lab/PromHouse)
  - [clickhouse_exporter](https://github.com/hot-wifi/clickhouse_exporter) (uses [Go client](https://github.com/kshvakov/clickhouse/))
- [Nagios](https://www.nagios.org/)
  - [check_clickhouse](https://github.com/exogroup/check_clickhouse/)
  - [check_clickhouse.py](https://github.com/innogames/igmonplugins/blob/master/src/check_clickhouse.py)
- [Zabbix](https://www.zabbix.com)
  - [clickhouse-zabbix-template](https://github.com/Altinity/clickhouse-zabbix-template)
- [Sematext](https://sematext.com/)
  - [clickhouse integration](https://github.com/sematext/sematext-agent-integrations/tree/master/clickhouse)
</details>

<details>
<summary>로깅</summary>

- [rsyslog](https://www.rsyslog.com/)
  - [omclickhouse](https://www.rsyslog.com/doc/master/configuration/modules/omclickhouse.html)
- [fluentd](https://www.fluentd.org)
  - [loghouse](https://github.com/flant/loghouse) (for [Kubernetes](https://kubernetes.io))
- [logagent](https://www.sematext.com/logagent)
  - [logagent output-plugin-clickhouse](https://sematext.com/docs/logagent/output-plugin-clickhouse/)
</details>

<details>
<summary>지리</summary>

- [MaxMind](https://dev.maxmind.com/geoip/)
  - [clickhouse-maxmind-geoip](https://github.com/AlexeyKupershtokh/clickhouse-maxmind-geoip)
</details>

<details>
<summary>AutoML</summary>

- [MindsDB](https://mindsdb.com/)
  - [MindsDB](https://github.com/mindsdb/mindsdb) - ClickHouse와 통합되어 ClickHouse의 데이터를 다양한 AI/ML 모델이 접근할 수 있도록 합니다.
</details>

## 프로그래밍 언어 생태계 {#programming-language-ecosystems}

<details>
<summary>Python</summary>

- [SQLAlchemy](https://www.sqlalchemy.org)
  - [sqlalchemy-clickhouse](https://github.com/cloudflare/sqlalchemy-clickhouse) (uses [infi.clickhouse_orm](https://github.com/Infinidat/infi.clickhouse_orm))
- [PyArrow/Pandas](https://pandas.pydata.org)
  - [Ibis](https://github.com/ibis-project/ibis)  
</details>

<details>
<summary>PHP</summary>
  
- [Doctrine](https://www.doctrine-project.org/)
  - [dbal-clickhouse](https://packagist.org/packages/friendsofdoctrine/dbal-clickhouse)
</details>

<details>
<summary>R</summary>

- [dplyr](https://db.rstudio.com/dplyr/)
  - [RClickHouse](https://github.com/IMSMWU/RClickHouse) (uses [clickhouse-cpp](https://github.com/artpaul/clickhouse-cpp))
</details>

<details>
<summary>Java</summary>

- [Hadoop](http://hadoop.apache.org)
  - [clickhouse-hdfs-loader](https://github.com/jaykelin/clickhouse-hdfs-loader) (uses [JDBC](../../sql-reference/table-functions/jdbc.md))
</details>
  
<details>
<summary>Scala</summary>

- [Akka](https://akka.io)
  - [clickhouse-scala-client](https://github.com/crobox/clickhouse-scala-client)
</details>

<details>
<summary>C#</summary>

- [ADO.NET](https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/ado-net-overview)
  - [ClickHouse.Ado](https://github.com/killwort/ClickHouse-Net)
  - [ClickHouse.Client](https://github.com/DarkWanderer/ClickHouse.Client)
  - [ClickHouse.Net](https://github.com/ilyabreev/ClickHouse.Net)
  - [ClickHouse.Net.Migrations](https://github.com/ilyabreev/ClickHouse.Net.Migrations)
  - [Linq To DB](https://github.com/linq2db/linq2db)
</details>

<details>
<summary>Elixir</summary>

- [Ecto](https://github.com/elixir-ecto/ecto)
  - [clickhouse_ecto](https://github.com/appodeal/clickhouse_ecto)
</details>

<details>
<summary>Ruby</summary>

- [Ruby on Rails](https://rubyonrails.org/)
  - [activecube](https://github.com/bitquery/activecube)
  - [ActiveRecord](https://github.com/PNixx/clickhouse-activerecord)
- [GraphQL](https://github.com/graphql)
  - [activecube-graphql](https://github.com/bitquery/activecube-graphql)
</details>
