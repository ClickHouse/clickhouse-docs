---
'description': '`Null` 테이블에 쓰기할 때, 데이터는 무시됩니다. `Null` 테이블에서 읽을 때, 응답은 비어 있습니다.'
'sidebar_label': 'Null'
'sidebar_position': 50
'slug': '/engines/table-engines/special/null'
'title': '널 테이블 엔진'
'doc_type': 'reference'
---


# Null 테이블 엔진 

`Null` 테이블에 데이터를 쓸 때, 데이터는 무시됩니다.  
`Null` 테이블에서 데이터를 읽을 때, 응답은 비어 있습니다.  

`Null` 테이블 엔진은 데이터 변환에 유용하며, 변환 후 원본 데이터가 더 이상 필요하지 않을 때 사용됩니다.  
이러한 목적을 위해 `Null` 테이블에 물리화된 뷰를 생성할 수 있습니다.  
테이블에 쓰여진 데이터는 뷰에 의해 소비되지만, 원본 원시 데이터는 버려집니다.
