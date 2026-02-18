위에서 설명한 메커니즘은 insert 크기와 무관하게 일정한 오버헤드를 가지므로, 배치 크기가 수집 처리량(ingest throughput)을 최적화하는 데 있어 가장 중요한 단일 요소가 됩니다. 배치 insert는 전체 insert 시간에서 오버헤드가 차지하는 비중을 줄이고 처리 효율을 향상합니다.

데이터는 최소 1,000개의 행 단위로, 이상적으로는 10,000–100,000개의 행 단위로 배치로 insert할 것을 권장합니다. insert 횟수는 줄이고 각 insert의 크기를 더 크게 가져가면 기록되는 파트 수가 줄어들고, 머지 부하가 최소화되며, 전체 시스템 리소스 사용량이 감소합니다. 

**동기식 insert 전략을 효과적으로 사용하려면 이러한 클라이언트 측 배치가 필요합니다.**

클라이언트 측에서 데이터를 배치할 수 없는 경우, ClickHouse는 배치를 서버 측으로 이전하는 비동기 insert를 지원합니다([비동기 insert 보기](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)).

:::tip 
insert 크기와 관계없이, 초당 insert 쿼리 수를 대략 초당 1개의 insert 쿼리 수준으로 유지할 것을 권장합니다. 이렇게 권장하는 이유는 생성된 파트가 백그라운드에서 더 큰 파트로 머지되어(읽기 쿼리를 최적화하기 위해) 처리되는데, 초당 너무 많은 insert 쿼리를 전송하면 백그라운드 머지가 새 파트 수를 따라가지 못하는 상황이 발생할 수 있기 때문입니다. 다만 비동기 insert를 사용하는 경우에는 초당 더 많은 insert 쿼리를 사용할 수 있습니다([비동기 insert 보기](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)).
:::