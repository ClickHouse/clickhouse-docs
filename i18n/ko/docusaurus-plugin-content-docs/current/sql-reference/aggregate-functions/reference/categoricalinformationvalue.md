---
'description': '각 카테고리에 대해 `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag
  = 0)))`의 값을 계산합니다.'
'sidebar_position': 115
'slug': '/sql-reference/aggregate-functions/reference/categoricalinformationvalue'
'title': 'categoricalInformationValue'
'doc_type': 'reference'
---

`(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` 의 값을 각 카테고리에 대해 계산합니다.

```sql
categoricalInformationValue(category1, category2, ..., tag)
```

결과는 이산(범주형) 특성 `[category1, category2, ...]`가 `tag`의 값을 예측하는 학습 모델에 어떻게 기여하는지를 나타냅니다.
