当然可以，下面是根据你的数据库结构和Redis设计优化后的新闻数据系统API文档，包含接口命名、接口说明（支持Markdown）、请求参数类型（param/body）、参数名、类型、示例值、详细说明，以及返回示例。可以直接用在API设计平台（如APIfox、YApi、Postman等）。

---

## 1. 新闻列表分页查询

**接口命名**  
GET /news

**接口说明**  
分页获取新闻列表，支持按分类、主题、关键词筛选及排序。  
可用于新闻列表页、筛选、搜索等场景。

### 请求参数

| 参数名     | 类型    | 示例值           | 来源   | 说明                   |
|------------|---------|------------------|--------|------------------------|
| category   | string  | sports           | param  | 新闻分类（选填）       |
| topic      | string  | soccer           | param  | 新闻主题（选填）       |
| searchText | string  | Atlanta          | param  | 标题或实体关键词（选填）|
| page       | integer | 1                | param  | 页码，默认1（选填）    |
| pageSize   | integer | 20               | param  | 每页条数，默认20，最大100（选填）|
| sortOrder  | string  | desc             | param  | 排序方向asc/desc，默认desc|

### 返回示例

```json
{
  "code": 200,
  "message": "success",
  "timestamp": 1718000000000,
  "elapsed": 28,
  "data": {
    "total": 20000,
    "page": 1,
    "pageSize": 20,
    "items": [
      {
        "id": "N10001",
        "category": "sports",
        "topic": "soccer",
        "headline": "Predicting Atlanta United's lineup against Columbus Crew",
        "publishDate": "2023-07-16T08:30:00Z"
      }
    ]
  }
}
```

---

## 2. 获取新闻详情

**接口命名**  
GET /news/{newsId}

**接口说明**  
获取单个新闻的详细信息。  
适用于详情页、弹窗等场景。

### 请求参数

| 参数名 | 类型   | 示例值   | 来源   | 说明     |
|--------|--------|----------|--------|----------|
| newsId | string | N10001   | param  | 新闻ID（路径参数，必填）|

### 返回示例

```json
{
  "code": 200,
  "message": "success",
  "timestamp": 1718000000000,
  "elapsed": 15,
  "data": {
    "id": "N10001",
    "category": "sports",
    "topic": "soccer",
    "headline": "Predicting Atlanta United's lineup against Columbus Crew",
    "body": "完整的新闻内容...",
    "publishDate": "2023-07-16T08:30:00Z",
    "author": "John Smith",
    "source": "Sports Daily"
  }
}
```

---

## 3. 获取新闻热度历史

**接口命名**  
GET /news/{newsId}/popularity

**接口说明**  
获取新闻在指定时间区间内的热度（点击量）变化。  
适合做新闻趋势图。

### 请求参数

| 参数名    | 类型   | 示例值         | 来源   | 说明                         |
|-----------|--------|----------------|--------|------------------------------|
| newsId    | string | N10001         | param  | 新闻ID（路径参数，必填）     |
| startDate | string | 2023-07-01     | param  | 开始日期 YYYY-MM-DD，必填    |
| endDate   | string | 2023-07-31     | param  | 结束日期 YYYY-MM-DD，必填    |
| interval  | string | day            | param  | 时间间隔 day/hour，默认day（选填）|

### 返回示例

```json
{
  "code": 200,
  "message": "success",
  "timestamp": 1718000000000,
  "elapsed": 20,
  "data": [
    {"date": "2023-07-04", "count": 45},
    {"date": "2023-07-05", "count": 52}
  ]
}
```

---

## 4. 获取分类热度历史

**接口命名**  
GET /categories/popularity

**接口说明**  
获取一个或多个新闻分类的热度历史数据。  
适合做分类趋势对比。

### 请求参数

| 参数名      | 类型   | 示例值           | 来源   | 说明                              |
|-------------|--------|------------------|--------|-----------------------------------|
| categories  | string | sports,tech      | param  | 分类列表（多个用逗号分隔，选填）  |
| startDate   | string | 2023-07-01       | param  | 开始日期 YYYY-MM-DD，必填         |
| endDate     | string | 2023-07-31       | param  | 结束日期 YYYY-MM-DD，必填         |
| interval    | string | day              | param  | 时间间隔 day/hour，默认day（选填）|

### 返回示例

```json
{
  "code": 200,
  "message": "success",
  "timestamp": 1718000000000,
  "elapsed": 25,
  "data": {
    "sports": [
      {"date": "2023-07-04", "count": 240}
    ],
    "technology": [
      {"date": "2023-07-04", "count": 305}
    ]
  }
}
```

---

## 5. 获取用户浏览历史流数据

**接口命名**  
GET /users/{userId}/browse-history

**接口说明**  
获取指定用户的浏览历史（明细流数据）。

### 请求参数

| 参数名   | 类型    | 示例值   | 来源   | 说明               |
|----------|---------|----------|--------|--------------------|
| userId   | string  | U335175  | param  | 用户ID（路径参数，必填）|
| page     | integer | 1        | param  | 页码，默认1（选填）|
| pageSize | integer | 20       | param  | 每页条数，默认20（选填）|

### 返回示例

```json
{
  "code": 200,
  "message": "success",
  "timestamp": 1718000000000,
  "elapsed": 30,
  "data": {
    "total": 123,
    "page": 1,
    "pageSize": 20,
    "items": [
      {
        "timestamp": 1689321600000,
        "newsId": "N10001",
        "category": "sports",
        "headline": "Predicting Atlanta United's lineup against Columbus Crew"
      }
    ]
  }
}
```

---

## 6. 获取用户推荐新闻

**接口命名**  
GET /users/{userId}/recommendations

**接口说明**  
获取指定用户在某时刻的推荐新闻（Redis缓存）。

### 请求参数

| 参数名    | 类型    | 示例值         | 来源   | 说明                         |
|-----------|---------|----------------|--------|------------------------------|
| userId    | string  | U335175        | param  | 用户ID（路径参数，必填）     |
| timestamp | integer | 1718000000000  | param  | 毫秒级时间戳，必填           |

### 返回示例

```json
{
  "code": 200,
  "message": "success",
  "timestamp": 1718000000000,
  "elapsed": 18,
  "data": [
    {
      "newsId": "N10001",
      "headline": "Predicting Atlanta United's lineup against Columbus Crew"
    }
  ]
}
```

---

## 7. 统计查询

**接口命名**  
GET /statistics

**接口说明**  
根据多条件统计新闻与用户点击量，支持时间范围、主题、标题内容长度、用户等。

### 请求参数

| 参数名          | 类型    | 示例值   | 来源   | 说明                                   |
|------------------|---------|----------|--------|----------------------------------------|
| startDate        | string  | 2023-07-01 | param | 开始日期 YYYY-MM-DD（选填）            |
| endDate          | string  | 2023-07-31 | param | 结束日期 YYYY-MM-DD（选填）            |
| topic            | string  | sports     | param | 新闻主题（选填）                       |
| titleLengthMin   | integer | 10         | param | 标题最小长度（选填）                   |
| titleLengthMax   | integer | 50         | param | 标题最大长度（选填）                   |
| contentLengthMin | integer | 100        | param | 内容最小长度（选填）                   |
| contentLengthMax | integer | 2000       | param | 内容最大长度（选填）                   |
| userId           | string  | U335175    | param | 用户ID（选填）                         |
| userIds          | string  | U10001,U10002 | param | 多个用户ID，逗号分隔（选填）           |

### 返回示例

```json
{
  "code": 200,
  "message": "success",
  "timestamp": 1718000000000,
  "elapsed": 45,
  "data": {
    "totalClicks": 12345,
    "userStats": [
      {
        "userId": "U10001",
        "clickCount": 120
      }
    ],
    "newsStats": [
      {
        "newsId": "N10001",
        "clickCount": 200
      }
    ]
  }
}
```

---

## 8. 智能助手对话接口

**接口命名**  
POST /agent/message

**接口说明**  
调用LLM智能Agent，根据用户输入自动生成回复内容。

### 请求参数

| 参数名  | 类型   | 示例值                 | 来源 | 说明         |
|---------|--------|------------------------|------|--------------|
| message | string | 请帮我分析最近的新闻热点 | body | 用户输入内容（必填）|

#### 请求体示例

```json
{
  "message": "请帮我分析最近的新闻热点"
}
```

### 返回示例

```json
{
  "code": 200,
  "message": "success",
  "timestamp": 1718000000000,
  "elapsed": 120,
  "data": {
    "replyMessage": "最近的新闻热点包括科技领域的AI发展和体育领域的世界杯赛事。"
  }
}
```

---

如需更细致的接口补充、错误码、鉴权header等请继续告知！