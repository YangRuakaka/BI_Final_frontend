# 新闻数据系统API文档

## 基础信息

- 基础URL: `https://api.news-analytics.com/v1`
- 所有请求应包含头部: `Content-Type: application/json`
- 认证: 使用Bearer Token: `Authorization: Bearer {token}`

---

### 1. 获取新闻列表 API

**接口地址**  
`GET /news`

**功能说明**  
分页获取新闻列表，支持按分类、主题、关键词筛选及排序。

**请求参数**

| 参数名      | 类型    | 必填 | 说明                         |
|-------------|---------|------|------------------------------|
| category    | string  | 否   | 分类过滤（如 sports, tech）   |
| topic       | string  | 否   | 主题过滤（如 soccer, ai）     |
| searchText  | string  | 否   | 标题或实体关键词模糊搜索      |
| page        | integer | 否   | 页码，默认1                   |
| pageSize    | integer | 否   | 每页条数，默认20，最大100      |
| sortOrder   | string  | 否   | 排序方向（asc, desc），默认desc|

**请求示例**

```
GET /news?category=sports&topic=soccer&searchText=Atlanta&page=2&pageSize=20&sortOrder=desc
```

**返回参数**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| code         | integer | 状态码，200为成功           |
| message      | string  | 返回信息                    |
| timestamp    | integer | 响应时间戳（毫秒级）        |
| elapsed      | integer | 查询耗时（单位ms）          |
| data.total   | integer | 总记录数                    |
| data.page    | integer | 当前页码                    |
| data.pageSize| integer | 每页条数                    |
| data.items   | array   | 新闻列表                    |

**data.items 单条结构**

| 字段            | 类型    | 说明                       |
|------------------|---------|----------------------------|
| id              | string  | 新闻ID                      |
| category        | string  | 分类                        |
| topic           | string  | 主题                        |
| title           | string  | 标题                        |

**返回示例**

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

### 2. 获取单条新闻详情

**接口地址**  
`GET /news/{newsId}`

**功能说明**  
获取单个新闻的详细信息。

**路径参数**

| 参数名 | 类型   | 必填 | 描述     |
|--------|--------|------|----------|
| newsId | string | 是   | 新闻ID   |

**返回参数**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| code         | integer | 状态码，200为成功           |
| message      | string  | 返回信息                    |
| timestamp    | integer | 响应时间戳（毫秒级）        |
| elapsed      | integer | 查询耗时（单位ms）          |
| data         | object  | 新闻详情                    |

**返回示例**

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

### 3. 获取单条新闻热度历史

**接口地址**  
`GET /news/{newsId}/popularity`

**功能说明**  
获取指定新闻ID在时间区间内的热度变化（如点击量）。

**路径参数**

| 参数名  | 类型   | 必填 | 描述     |
|---------|--------|------|----------|
| newsId  | string | 是   | 新闻ID   |

**查询参数**

| 参数名    | 类型   | 必填 | 描述                         |
|-----------|--------|------|------------------------------|
| startDate | string | 是   | 开始日期 (YYYY-MM-DD)        |
| endDate   | string | 是   | 结束日期 (YYYY-MM-DD)        |
| interval  | string | 否   | 时间间隔 (day, hour)，默认day |

**返回参数**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| code         | integer | 状态码，200为成功           |
| message      | string  | 返回信息                    |
| timestamp    | integer | 响应时间戳（毫秒级）        |
| elapsed      | integer | 查询耗时（单位ms）          |
| data         | array   | 热度历史数据                |

**返回示例**

```json
{
  "code": 200,
  "message": "success",
  "timestamp": 1718000000000,
  "elapsed": 20,
  "data": [
    {"date": "2023-07-04", "count": 45},
    {"date": "2023-07-05", "count": 52},
    {"date": "2023-07-06", "count": 60}
  ]
}
```

---

### 4. 获取分类热度历史数据

**接口地址**  
`GET /categories/popularity`

**功能说明**  
获取新闻分类的热度历史数据。

**查询参数**

| 参数名      | 类型   | 必填 | 描述                         |
|-------------|--------|------|------------------------------|
| categories  | string | 否   | 分类名称列表，多个分类用逗号分隔 |
| startDate   | string | 是   | 开始日期 (YYYY-MM-DD)        |
| endDate     | string | 是   | 结束日期 (YYYY-MM-DD)        |
| interval    | string | 否   | 时间间隔 (day, hour)，默认day |

**返回参数**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| code         | integer | 状态码，200为成功           |
| message      | string  | 返回信息                    |
| timestamp    | integer | 响应时间戳（毫秒级）        |
| elapsed      | integer | 查询耗时（单位ms）          |
| data         | object  | 分类热度历史数据            |

**返回示例**

```json
{
  "code": 200,
  "message": "success",
  "timestamp": 1718000000000,
  "elapsed": 25,
  "data": {
    "sports": [
      {"date": "2023-07-04", "count": 240},
      {"date": "2023-07-05", "count": 269}
    ],
    "technology": [
      {"date": "2023-07-04", "count": 305},
      {"date": "2023-07-05", "count": 340}
    ]
  }
}
```

---

### 5. 获取用户浏览历史流数据

**接口地址**  
`GET /users/{userId}/browse-history`

**功能说明**  
获取指定用户的浏览历史数据。

**路径参数**

| 参数名  | 类型   | 必填 | 描述     |
|---------|--------|------|----------|
| userId  | string | 是   | 用户ID   |

**返回参数**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| code         | integer | 状态码，200为成功           |
| message      | string  | 返回信息                    |
| timestamp    | integer | 响应时间戳（毫秒级）        |
| elapsed      | integer | 查询耗时（单位ms）          |
| data.total   | integer | 总记录数                    |
| data.page    | integer | 当前页码                    |
| data.pageSize| integer | 每页条数                    |
| data.items   | array   | 浏览历史数据                |

**返回示例**

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
      },
      {
        "timestamp": 1689325200000,
        "newsId": "N10015",
        "category": "technology",
        "headline": "AI Revolutionizes Healthcare"
      }
    ]
  }
}
```

---

### 6. 获取用户某时刻推荐新闻

**接口地址**  
`GET /users/{userId}/recommendations`

**功能说明**  
获取指定用户在某时刻的推荐新闻。

**路径参数**

| 参数名  | 类型   | 必填 | 描述     |
|---------|--------|------|----------|
| userId  | string | 是   | 用户ID   |

**查询参数**

| 参数名    | 类型   | 必填 | 描述                         |
|-----------|--------|------|------------------------------|
| timestamp | integer | 是   | 查询时间（毫秒级时间戳）     |

**返回参数**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| code         | integer | 状态码，200为成功           |
| message      | string  | 返回信息                    |
| timestamp    | integer | 响应时间戳（毫秒级）        |
| elapsed      | integer | 查询耗时（单位ms）          |
| data         | array   | 推荐新闻列表                |

**返回示例**

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
    },
    {
      "newsId": "N10015",
      "headline": "AI Revolutionizes Healthcare"
    }
  ]
}
```

### 7. 统计查询 API

**接口地址**  
`GET /statistics`

**功能说明**  
根据时间、时间段、新闻主题、新闻标题长度、新闻长度、特定用户、特定多个用户等条件进行统计查询。

**请求参数**

| 参数名          | 类型    | 必填 | 说明                                   |
|------------------|---------|------|----------------------------------------|
| startDate        | string  | 否   | 开始日期 (YYYY-MM-DD)                  |
| endDate          | string  | 否   | 结束日期 (YYYY-MM-DD)                  |
| topic            | string  | 否   | 新闻主题                               |
| titleLengthMin   | integer | 否   | 新闻标题最小长度                       |
| titleLengthMax   | integer | 否   | 新闻标题最大长度                       |
| contentLengthMin | integer | 否   | 新闻内容最小长度                       |
| contentLengthMax | integer | 否   | 新闻内容最大长度                       |
| userId           | string  | 否   | 特定用户ID                             |
| userIds          | array   | 否   | 特定多个用户ID                         |

**请求示例**

```
GET /statistics?startDate=2023-07-01&endDate=2023-07-31&topic=sports&titleLengthMin=10&titleLengthMax=50&userIds=U10001,U10002
```

**返回参数**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| code         | integer | 状态码，200为成功           |
| message      | string  | 返回信息                    |
| timestamp    | integer | 响应时间戳（毫秒级）        |
| elapsed      | integer | 查询耗时（单位ms）          |
| data         | object  | 统计结果                    |

**data 结构**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| totalClicks  | integer | 总点击量                   |
| userStats    | array   | 用户统计数据               |
| newsStats    | array   | 新闻统计数据               |

**userStats 单条结构**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| userId       | string  | 用户ID                     |
| clickCount   | integer | 用户点击新闻的次数         |

**newsStats 单条结构**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| newsId       | string  | 新闻ID                     |
| clickCount   | integer | 新闻被点击的次数           |

**返回示例**

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
      },
      {
        "userId": "U10002",
        "clickCount": 85
      }
    ],
    "newsStats": [
      {
        "newsId": "N10001",
        "clickCount": 200
      },
      {
        "newsId": "N10015",
        "clickCount": 150
      }
    ]
  }
}
```

### 8. 统计查询 API

**接口地址**  
`GET /statistics`

**功能说明**  
根据时间、时间段、新闻主题、新闻标题长度、新闻长度、特定用户、特定多个用户等条件进行统计查询。

**请求参数**

| 参数名          | 类型    | 必填 | 说明                                   |
|------------------|---------|------|----------------------------------------|
| startDate        | string  | 否   | 开始日期 (YYYY-MM-DD)                  |
| endDate          | string  | 否   | 结束日期 (YYYY-MM-DD)                  |
| topic            | string  | 否   | 新闻主题                               |
| titleLengthMin   | integer | 否   | 新闻标题最小长度                       |
| titleLengthMax   | integer | 否   | 新闻标题最大长度                       |
| contentLengthMin | integer | 否   | 新闻内容最小长度                       |
| contentLengthMax | integer | 否   | 新闻内容最大长度                       |
| userId           | string  | 否   | 特定用户ID                             |
| userIds          | array   | 否   | 特定多个用户ID                         |

**请求示例**

```
GET /statistics?startDate=2023-07-01&endDate=2023-07-31&topic=sports&titleLengthMin=10&titleLengthMax=50&userIds=U10001,U10002
```

**返回参数**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| code         | integer | 状态码，200为成功           |
| message      | string  | 返回信息                    |
| timestamp    | integer | 响应时间戳（毫秒级）        |
| elapsed      | integer | 查询耗时（单位ms）          |
| data         | object  | 统计结果                    |

**data 结构**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| totalClicks  | integer | 总点击量                   |
| userStats    | array   | 用户统计数据               |
| newsStats    | array   | 新闻统计数据               |

**userStats 单条结构**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| userId       | string  | 用户ID                     |
| clickCount   | integer | 用户点击新闻的次数         |

**newsStats 单条结构**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| newsId       | string  | 新闻ID                     |
| clickCount   | integer | 新闻被点击的次数           |

**返回示例**

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
      },
      {
        "userId": "U10002",
        "clickCount": 85
      }
    ],
    "newsStats": [
      {
        "newsId": "N10001",
        "clickCount": 200
      },
      {
        "newsId": "N10015",
        "clickCount": 150
      }
    ]
  }
}
```

### 10. 调用LLM Agent API

**接口地址**  
`POST /agent/message`

**功能说明**  
传入用户消息，调用LLM Agent生成回复消息。

**请求参数**

| 参数名   | 类型   | 必填 | 说明         |
|----------|--------|------|--------------|
| message  | string | 是   | 用户输入的消息 |

**请求示例**

```json
{
  "message": "请帮我分析最近的新闻热点"
}
```

**返回参数**

| 字段         | 类型    | 说明                       |
|--------------|---------|----------------------------|
| code         | integer | 状态码，200为成功           |
| message      | string  | 返回信息                    |
| timestamp    | integer | 响应时间戳（毫秒级）        |
| elapsed      | integer | 查询耗时（单位ms）          |
| data         | object  | 返回的消息内容              |

**data 结构**

| 字段         | 类型   | 说明         |
|--------------|--------|--------------|
| replyMessage | string | LLM Agent生成的回复 |

**返回示例**

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