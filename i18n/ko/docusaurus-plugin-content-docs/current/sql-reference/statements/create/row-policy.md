---
description: 'ROW POLICY 문서'
sidebar_label: 'ROW POLICY'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: 'CREATE ROW POLICY'
doc_type: 'reference'
---

테이블에서 사용자가 읽을 수 있는 행을 결정하는 데 사용되는 필터인 [행 정책(ROW POLICY)](../../../guides/sre/user-management/index.md#row-policy-management)을 생성합니다.

:::tip
행 정책은 읽기 전용(readonly) 권한을 가진 사용자에게만 의미가 있습니다. 사용자가 테이블을 수정하거나 테이블 간에 파티션을 복사할 수 있으면 행 정책에 의한 제한이 무력화됩니다.
:::

구문:

```sql
CREATE [ROW] POLICY [IF NOT EXISTS | OR REPLACE] policy_name1 [ON CLUSTER cluster_name1] ON [db1.]table1|db1.*
        [, policy_name2 [ON CLUSTER cluster_name2] ON [db2.]table2|db2.* ...]
    [IN access_storage_type]
    [FOR SELECT] USING condition
    [AS {PERMISSIVE | RESTRICTIVE}]
    [TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}]
```


## USING 절 \{#using-clause\}

조건을 지정하여 행을 필터링합니다. 조건을 평가한 결과가 해당 행에서 0이 아닌 값이면 그 행이 표시됩니다.



## TO 절 \{#to-clause\}

`TO` 섹션에서는 이 policy가 적용되어야 하는 사용자와 역할 목록을 지정할 수 있습니다. 예를 들어 `CREATE ROW POLICY ... TO accountant, john@localhost` 와 같이 사용할 수 있습니다.

키워드 `ALL` 은 현재 사용자를 포함한 모든 ClickHouse 사용자를 의미합니다. 키워드 `ALL EXCEPT` 은 전체 사용자 목록에서 일부 사용자를 제외할 수 있습니다. 예를 들어 `CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost` 와 같이 사용할 수 있습니다.

:::note
어떤 테이블에 대해서도 row policy가 정의되어 있지 않으면, 모든 사용자가 그 테이블에서 `SELECT` 를 통해 모든 행을 조회할 수 있습니다. 테이블에 하나 이상의 row policy를 정의하면, 현재 사용자에 대해 해당 row policy가 정의되어 있는지와 관계없이 테이블에 대한 접근은 row policy에 따라 결정됩니다. 예를 들어, 다음과 같은 policy는

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

사용자 `mira` 와 `peter` 가 `b != 1` 인 행을 보지 못하도록 제한하며, 언급되지 않은 다른 모든 사용자(예: 사용자 `paul`)는 `mydb.table1` 에서 어떤 행도 볼 수 없게 됩니다.

이것이 바람직하지 않다면, 다음과 같이 row policy를 하나 더 추가하여 해결할 수 있습니다.

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::



## AS 절 \{#as-clause\}

하나의 테이블에 대해 동일한 USER에 대해 동시에 둘 이상의 정책을 활성화할 수 있습니다. 따라서 여러 정책의 조건을 결합하는 방법이 필요합니다.

기본적으로 정책은 불리언 `OR` 연산자를 사용하여 결합됩니다. 예를 들어, 다음과 같은 정책이 있습니다:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

사용자 `peter`가 `b=1` 또는 `c=2`인 행을 볼 수 있도록 합니다.

`AS` 절은 정책을 다른 정책과 어떻게 결합할지 지정합니다. 정책은 허용적이거나 제한적일 수 있습니다. 기본적으로 정책은 허용적이며, 이는 boolean `OR` 연산자를 사용해 결합된다는 의미입니다.

정책은 또 다른 방식으로 제한적으로 정의할 수도 있습니다. 제한적 정책은 boolean `AND` 연산자를 사용해 결합됩니다.

일반적인 수식은 다음과 같습니다:

```text
row_is_visible = (one or more of the permissive policies' conditions are non-zero) AND
                 (all of the restrictive policies's conditions are non-zero)
```

예를 들어, 다음과 같은 정책을 들 수 있습니다.

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

USER `peter`가 `b=1` AND `c=2`를 모두 만족하는 행만 볼 수 있도록 설정합니다.

데이터베이스 정책은 테이블 정책과 함께 적용됩니다.

예를 들어, 다음과 같은 정책이 있습니다.

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

사용자 `peter`가 `b=1`이면서 `c=2`인 경우에만 table1의 행을 조회할 수 있도록 하되, mydb의 다른 테이블에는 이 사용자에게 `b=1` 정책만 적용되도록 합니다.


## ON CLUSTER 절 \{#on-cluster-clause\}

이 절을 사용하면 클러스터에서 행 정책을 생성할 수 있습니다. 자세한 내용은 [분산 DDL](../../../sql-reference/distributed-ddl.md)을 참고하십시오.



## 예시 \{#examples\}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
